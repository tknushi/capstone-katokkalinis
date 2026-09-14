<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Inspection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class InspectionController extends Controller
{
    // Vendors scoring at or below this total are flagged as needing attention.
    const COMPLIANCE_FLAG_THRESHOLD = 60;

    /*
    |--------------------------------------------------------------------------
    | GET ALL INSPECTIONS (Market Compliance)
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        $query = Inspection::with([
            'vendor:id,vendor_code,business_name,owner_name,market,barangay_id',
            'vendor.barangay:id,name',
            'inspector:id,name,email',
        ]);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
        }

        if ($request->boolean('flagged')) {
            $query->where('total_score', '<=', self::COMPLIANCE_FLAG_THRESHOLD);
        }

        $inspections = $query
            ->latest('inspected_at')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Inspections retrieved successfully.',
            'count' => $inspections->count(),
            'flag_threshold' => self::COMPLIANCE_FLAG_THRESHOLD,
            'inspections' => $inspections,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | CREATE INSPECTION
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'vendor_id' => 'required|exists:vendors,id',
            'inspector_id' => 'required|exists:users,id',

            'hygiene_system' => 'required|integer|min:0|max:100',
            'condition_of_premises' => 'required|integer|min:0|max:100',

            'notes' => 'nullable|string',
            'status' => 'nullable|in:pending,completed,reviewed',
            'inspected_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please check the inspection information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $totalScore = intdiv(
            $request->hygiene_system + $request->condition_of_premises,
            2
        );

        $inspection = Inspection::create([
            'vendor_id' => $request->vendor_id,
            'inspector_id' => $request->inspector_id,
            'hygiene_system' => $request->hygiene_system,
            'condition_of_premises' => $request->condition_of_premises,
            'total_score' => $totalScore,
            'compliance_level' => $totalScore,
            'notes' => $request->notes,
            'status' => $request->status ?? 'completed',
            'inspected_at' => $request->inspected_at ?? now(),
        ]);

        $inspection->load(['vendor.barangay', 'inspector:id,name,email']);

        ActivityLog::record(
            'inspection.created',
            "Recorded inspection for vendor #{$inspection->vendor_id} (score: {$totalScore}).",
            $inspection
        );

        return response()->json([
            'success' => true,
            'message' => 'Inspection created successfully.',
            'inspection' => $inspection,
        ], 201);
    }


    /*
    |--------------------------------------------------------------------------
    | GET SINGLE INSPECTION
    |--------------------------------------------------------------------------
    */

    public function show($id)
    {
        $inspection = Inspection::with(['vendor.barangay', 'inspector:id,name,email'])->find($id);

        if (!$inspection) {
            return response()->json([
                'success' => false,
                'message' => 'Inspection not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'inspection' => $inspection,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE INSPECTION
    |--------------------------------------------------------------------------
    */

    public function update(Request $request, $id)
    {
        $inspection = Inspection::find($id);

        if (!$inspection) {
            return response()->json([
                'success' => false,
                'message' => 'Inspection not found.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'hygiene_system' => 'sometimes|required|integer|min:0|max:100',
            'condition_of_premises' => 'sometimes|required|integer|min:0|max:100',
            'notes' => 'nullable|string',
            'status' => 'sometimes|required|in:pending,completed,reviewed',
            'inspected_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please check the inspection information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $inspection->fill($request->only([
            'notes',
            'status',
            'inspected_at',
        ]));

        if ($request->filled('hygiene_system')) {
            $inspection->hygiene_system = $request->hygiene_system;
        }

        if ($request->filled('condition_of_premises')) {
            $inspection->condition_of_premises = $request->condition_of_premises;
        }

        if ($request->filled('hygiene_system') || $request->filled('condition_of_premises')) {
            $totalScore = intdiv(
                $inspection->hygiene_system + $inspection->condition_of_premises,
                2
            );

            $inspection->total_score = $totalScore;
            $inspection->compliance_level = $totalScore;
        }

        $inspection->save();
        $inspection->load(['vendor.barangay', 'inspector:id,name,email']);

        ActivityLog::record(
            'inspection.updated',
            "Updated inspection #{$inspection->id}.",
            $inspection
        );

        return response()->json([
            'success' => true,
            'message' => 'Inspection updated successfully.',
            'inspection' => $inspection,
        ]);
    }

    public function decision(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'decision' => 'required|in:accepted,rejected',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Choose whether the inspection is accepted or rejected.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $inspection = Inspection::find($id);

        if (!$inspection) {
            return response()->json([
                'success' => false,
                'message' => 'Inspection not found.',
            ], 404);
        }

        $inspection->decision = $request->decision;
        $inspection->decided_by = $request->user()->id;
        $inspection->decided_at = now();
        $inspection->save();
        $inspection->load(['vendor.barangay', 'inspector:id,name,email']);

        ActivityLog::record(
            'inspection.decision_updated',
            "{$request->decision} inspection #{$inspection->id} for vendor #{$inspection->vendor_id}.",
            $inspection
        );

        return response()->json([
            'success' => true,
            'message' => 'Inspection decision saved successfully.',
            'inspection' => $inspection,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | DELETE INSPECTION
    |--------------------------------------------------------------------------
    */

    public function destroy($id)
    {
        $inspection = Inspection::find($id);

        if (!$inspection) {
            return response()->json([
                'success' => false,
                'message' => 'Inspection not found.',
            ], 404);
        }

        $inspection->delete();

        ActivityLog::record(
            'inspection.deleted',
            "Deleted inspection #{$id}."
        );

        return response()->json([
            'success' => true,
            'message' => 'Inspection deleted successfully.',
        ]);
    }
}
