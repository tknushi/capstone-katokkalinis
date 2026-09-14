<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReportController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | GET ALL REPORTS
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        $query = Report::with([
            'user:id,name,email',
            'barangay:id,name',
        ])->latest();

        /*
        |--------------------------------------------------------------------------
        | FILTER BY STATUS
        |--------------------------------------------------------------------------
        */

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        /*
        |--------------------------------------------------------------------------
        | SEARCH
        |--------------------------------------------------------------------------
        */

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            });
        }

        $reports = $query->get();

        return response()->json([
            'success' => true,
            'reports' => $reports,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | STORE REPORT
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'nullable|string|max:255',
            'barangay_id' => 'required|exists:barangays,id',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'image' => 'nullable|string',
            'image_url' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please check the report information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $imagePath = null;
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $fileName = 'report_' . time() . '_' . uniqid() . '.' . ($file->getClientOriginalExtension() ?: 'jpg');
            $path = $file->storeAs('reports', $fileName, 'public');
            $imagePath = '/storage/' . $path;
        } elseif ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $fileName = 'report_' . time() . '_' . uniqid() . '.' . ($file->getClientOriginalExtension() ?: 'jpg');
            $path = $file->storeAs('reports', $fileName, 'public');
            $imagePath = '/storage/' . $path;
        } else {
            $rawImage = $request->image ?? $request->image_url;
            if ($rawImage) {
                if (preg_match('/^data:image\/(\w+);base64,/', $rawImage, $type)) {
                    $base64Data = substr($rawImage, strpos($rawImage, ',') + 1);
                    $ext = strtolower($type[1]);
                    if (!in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                        $ext = 'jpg';
                    }
                    $decoded = base64_decode($base64Data);
                    if ($decoded !== false) {
                        $fileName = 'report_' . time() . '_' . uniqid() . '.' . $ext;
                        \Illuminate\Support\Facades\Storage::disk('public')->put('reports/' . $fileName, $decoded);
                        $imagePath = '/storage/reports/' . $fileName;
                    } else {
                        $imagePath = $rawImage;
                    }
                } else {
                    $imagePath = $rawImage;
                }
            }
        }

        $report = Report::create([
            'user_id' => $request->user() ? $request->user()->id : null,
            'barangay_id' => $request->barangay_id,
            'title' => $request->title,
            'description' => $request->description,
            'location' => $request->location,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'image' => $imagePath,
            'status' => 'pending',
        ]);

        $report->load([
            'user:id,name,email',
            'barangay:id,name',
        ]);

        ActivityLog::record(
            'report.created',
            "New report #{$report->id} ({$report->title}) submitted.",
            $report
        );

        return response()->json([
            'success' => true,
            'message' => 'Report submitted successfully.',
            'report' => $report,
        ], 201);
    }



    /*
    |--------------------------------------------------------------------------
    | GET SINGLE REPORT
    |--------------------------------------------------------------------------
    */

    public function show($id)
    {
        $report = Report::with([
            'user:id,name,email',
            'barangay:id,name',
        ])->find($id);

        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Report not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'report' => $report,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE REPORT STATUS
    |--------------------------------------------------------------------------
    */

    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,reviewed,resolved,rejected',
            'admin_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid report information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $report = Report::find($id);

        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Report not found.',
            ], 404);
        }

        $report->status = $request->status;

        if ($request->has('admin_notes')) {
            $report->admin_notes = $request->admin_notes;
        }

        $report->save();

        $report->load([
            'user:id,name,email',
            'barangay:id,name',
        ]);

        ActivityLog::record(
            'report.status_updated',
            "Set report #{$report->id} ({$report->title}) status to {$report->status}.",
            $report
        );

        return response()->json([
            'success' => true,
            'message' => 'Report updated successfully.',
            'report' => $report,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | DELETE REPORT
    |--------------------------------------------------------------------------
    */

    public function destroy($id)
    {
        $report = Report::find($id);

        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Report not found.',
            ], 404);
        }

        $title = $report->title;
        $report->delete();

        ActivityLog::record(
            'report.deleted',
            "Deleted report {$title}."
        );

        return response()->json([
            'success' => true,
            'message' => 'Report deleted successfully.',
        ]);
    }
}

