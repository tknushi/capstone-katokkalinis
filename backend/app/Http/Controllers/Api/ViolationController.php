<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vendor;
use App\Models\Violation;
use Illuminate\Http\Request;

class ViolationController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | GET VIOLATIONS
    |--------------------------------------------------------------------------
    */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Violation::with(['vendor', 'inspection'])->latest();

        $isVendor = $user->roles()->where('name', 'vendor')->exists();

        if ($isVendor) {
            $vendor = Vendor::where('user_id', $user->id)->first();
            if ($vendor) {
                $query->where('vendor_id', $vendor->id);
            } else {
                return response()->json([
                    'success' => true,
                    'violations' => [],
                ]);
            }
        } elseif ($request->filled('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
        }

        $violations = $query->get();

        return response()->json([
            'success' => true,
            'message' => 'Violations retrieved successfully.',
            'violations' => $violations,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | STORE VIOLATION (Inspector Violation Recording & Monitoring)
    |--------------------------------------------------------------------------
    */
    public function store(Request $request)
    {
        $user = $request->user();
        $isAuthorized = $user && $user->roles()->whereIn('name', ['inspector', 'super_admin'])->exists();

        if (!$isAuthorized) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only authorized City Sanitation Inspectors may record violations.',
            ], 403);
        }

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'vendor_id' => 'required|exists:vendors,id',
            'inspection_id' => 'nullable|exists:inspections,id',
            'violation_type' => 'required|string|max:255',
            'description' => 'required|string',
            'penalty' => 'nullable|string|max:255',
            'corrective_action' => 'nullable|string',
            'status' => 'nullable|in:pending,resolved,appealed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please check violation information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $violation = Violation::create([
            'vendor_id' => $request->vendor_id,
            'inspection_id' => $request->inspection_id,
            'violation_type' => $request->violation_type,
            'description' => $request->description,
            'penalty' => $request->penalty ?? 'Official Warning',
            'corrective_action' => $request->corrective_action,
            'status' => $request->status ?? 'pending',
        ]);

        $violation->load(['vendor', 'inspection']);

        \App\Services\VendorComplianceService::recalculateForVendor(
            $request->vendor_id,
            $user->id,
            "Sanitation violation recorded: {$violation->violation_type}"
        );

        \App\Models\ActivityLog::record(
            'violation.recorded',
            "Inspector {$user->name} recorded violation [{$violation->violation_type}] for vendor #{$violation->vendor_id} ({$violation->vendor?->business_name}).",
            $violation
        );

        return response()->json([
            'success' => true,
            'message' => 'Sanitation violation recorded successfully.',
            'violation' => $violation,
        ], 201);
    }
}
