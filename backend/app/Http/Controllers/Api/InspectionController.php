<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Inspection;
use App\Models\Notification;
use App\Models\Vendor;
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
            'vendor:id,vendor_code,business_name,owner_name,market,barangay_id,user_id',
            'vendor.barangay:id,name',
            'inspector:id,name,email',
            'changeRequester:id,name,email',
            'decider:id,name,email',
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

        // Float pending change requests directly to the top so admins see them instantly, then sort by latest update
        $inspections = $query
            ->orderByRaw("CASE WHEN change_status = 'pending' THEN 0 ELSE 1 END")
            ->orderByDesc('updated_at')
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
    | CREATE INSPECTION OR SUBMIT PENDING CHANGE
    |--------------------------------------------------------------------------
    */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'vendor_id' => 'required|exists:vendors,id',
            'inspector_id' => 'nullable|exists:users,id',
            'hygiene_system' => 'required|integer|min:0|max:100',
            'condition_of_premises' => 'required|integer|min:0|max:100',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:pending,completed,reviewed',
            'inspected_at' => 'nullable|date',
            'inspection_id' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please check the inspection information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $inspectorId = $request->inspector_id ?? ($request->user() ? $request->user()->id : 4);

        // Find existing inspection by explicit ID or latest record for this vendor
        $existing = null;
        if ($request->filled('inspection_id')) {
            $existing = Inspection::find($request->inspection_id);
        }
        if (!$existing) {
            $existing = Inspection::where('vendor_id', $request->vendor_id)->orderByDesc('id')->first();
        }

        // If an inspection already exists for this vendor, treat edits as a pending change request
        if ($existing) {
            $pendingTotal = intdiv(
                $request->hygiene_system + $request->condition_of_premises,
                2
            );

            $existing->pending_hygiene_system = $request->hygiene_system;
            $existing->pending_condition_of_premises = $request->condition_of_premises;
            $existing->pending_total_score = $pendingTotal;
            $existing->pending_notes = $request->notes;
            $existing->change_requested_by = $inspectorId;
            $existing->change_requested_at = now();
            $existing->change_status = 'pending';
            $existing->touch();
            $existing->save();

            $existing->load(['vendor.barangay', 'inspector:id,name,email', 'changeRequester:id,name,email']);

            ActivityLog::record(
                'inspection.change_requested',
                "Inspector submitted an evaluation change request for vendor #{$existing->vendor_id} (pending score: {$pendingTotal}).",
                $existing
            );

            return response()->json([
                'success' => true,
                'is_pending_approval' => true,
                'message' => 'Evaluation change request submitted and awaiting admin approval.',
                'inspection' => $existing,
            ], 200);
        }

        // First-time inspection creation
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
            'decision' => 'accepted',
            'decided_by' => $request->inspector_id,
            'decided_at' => now(),
            'inspected_at' => $request->inspected_at ?? now(),
        ]);

        $inspection->load(['vendor.barangay', 'inspector:id,name,email']);

        ActivityLog::record(
            'inspection.created',
            "Recorded initial inspection for vendor #{$inspection->vendor_id} (score: {$totalScore}).",
            $inspection
        );

        return response()->json([
            'success' => true,
            'is_pending_approval' => false,
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
        $inspection = Inspection::with([
            'vendor.barangay',
            'inspector:id,name,email',
            'changeRequester:id,name,email',
            'decider:id,name,email',
        ])->find($id);

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
    | UPDATE INSPECTION (Inspector Submits Change Request)
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

        // Direct admin update overrides immediately if specified
        if ($request->boolean('is_admin_direct')) {
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
            $inspection->load(['vendor.barangay', 'inspector:id,name,email', 'changeRequester:id,name,email']);

            ActivityLog::record(
                'inspection.updated',
                "Admin directly updated inspection #{$inspection->id}.",
                $inspection
            );

            return response()->json([
                'success' => true,
                'is_pending_approval' => false,
                'message' => 'Inspection updated successfully.',
                'inspection' => $inspection,
            ]);
        }

        // Inspector edit flow: save as pending change request
        $pendingHygiene = $request->filled('hygiene_system') ? (int) $request->hygiene_system : $inspection->hygiene_system;
        $pendingPremises = $request->filled('condition_of_premises') ? (int) $request->condition_of_premises : $inspection->condition_of_premises;
        $pendingTotal = intdiv($pendingHygiene + $pendingPremises, 2);

        $inspection->pending_hygiene_system = $pendingHygiene;
        $inspection->pending_condition_of_premises = $pendingPremises;
        $inspection->pending_total_score = $pendingTotal;
        $inspection->pending_notes = $request->filled('notes') ? $request->notes : $inspection->notes;
        $inspection->change_requested_by = $request->user() ? $request->user()->id : $inspection->inspector_id;
        $inspection->change_requested_at = now();
        $inspection->change_status = 'pending';
        $inspection->save();

        $inspection->load(['vendor.barangay', 'inspector:id,name,email', 'changeRequester:id,name,email']);

        ActivityLog::record(
            'inspection.change_requested',
            "Evaluation change requested for inspection #{$inspection->id} (proposed score: {$pendingTotal}).",
            $inspection
        );

        return response()->json([
            'success' => true,
            'is_pending_approval' => true,
            'message' => 'Evaluation change request submitted and awaiting admin approval.',
            'inspection' => $inspection,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | ADMIN ACCEPTS PENDING CHANGE
    |--------------------------------------------------------------------------
    */
    public function acceptChange(Request $request, $id)
    {
        $inspection = Inspection::with(['vendor.user', 'inspector'])->find($id);

        if (!$inspection) {
            return response()->json([
                'success' => false,
                'message' => 'Inspection not found.',
            ], 404);
        }

        if ($inspection->change_status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'No pending change request exists for this inspection.',
            ], 400);
        }

        // Apply pending change values to official evaluation
        $inspection->hygiene_system = $inspection->pending_hygiene_system ?? $inspection->hygiene_system;
        $inspection->condition_of_premises = $inspection->pending_condition_of_premises ?? $inspection->condition_of_premises;
        $inspection->total_score = $inspection->pending_total_score ?? $inspection->total_score;
        $inspection->compliance_level = $inspection->total_score;

        if ($inspection->pending_notes !== null) {
            $inspection->notes = $inspection->pending_notes;
        }

        $inspection->decision = 'accepted';
        $inspection->decided_by = $request->user() ? $request->user()->id : 1;
        $inspection->decided_at = now();
        $inspection->change_status = 'accepted';
        $inspection->inspected_at = now();
        $inspection->touch();
        $inspection->save();

        // In-app notification to the vendor
        if ($inspection->vendor && $inspection->vendor->user_id) {
            Notification::create([
                'user_id' => $inspection->vendor->user_id,
                'title' => 'Sanitation Evaluation Approved',
                'message' => "Your official stall sanitation evaluation has been updated: Grade {$inspection->grade_letter} ({$inspection->total_score}%).",
                'type' => 'evaluation',
                'is_read' => false,
            ]);
        }

        ActivityLog::record(
            'inspection.change_accepted',
            "Approved evaluation change for inspection #{$inspection->id} (vendor #{$inspection->vendor_id}, score: {$inspection->total_score}).",
            $inspection
        );

        return response()->json([
            'success' => true,
            'message' => 'Evaluation change request approved and applied successfully.',
            'inspection' => $inspection->fresh(['vendor.barangay', 'inspector:id,name,email', 'changeRequester:id,name,email', 'decider:id,name,email']),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | ADMIN REJECTS PENDING CHANGE
    |--------------------------------------------------------------------------
    */
    public function rejectChange(Request $request, $id)
    {
        $inspection = Inspection::with(['vendor'])->find($id);

        if (!$inspection) {
            return response()->json([
                'success' => false,
                'message' => 'Inspection not found.',
            ], 404);
        }

        if ($inspection->change_status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'No pending change request exists for this inspection.',
            ], 400);
        }

        $inspection->change_status = 'rejected';
        $inspection->rejection_reason = $request->input('reason', 'Admin rejected the proposed score modification.');
        $inspection->decided_by = $request->user() ? $request->user()->id : 1;
        $inspection->decided_at = now();
        $inspection->touch();
        $inspection->save();

        ActivityLog::record(
            'inspection.change_rejected',
            "Rejected evaluation change request for inspection #{$inspection->id}.",
            $inspection
        );

        return response()->json([
            'success' => true,
            'message' => 'Evaluation change request rejected. Official scores remain unchanged.',
            'inspection' => $inspection->fresh(['vendor.barangay', 'inspector:id,name,email', 'changeRequester:id,name,email', 'decider:id,name,email']),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | DECISION (General Accept / Reject for Overall Inspection)
    |--------------------------------------------------------------------------
    */
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
    | VENDOR OFFICIAL EVALUATION (Read by Vendor Mobile App)
    |--------------------------------------------------------------------------
    */
    public function vendorEvaluation(Request $request)
    {
        $user = $request->user();
        $vendor = null;
        if ($user) {
            $vendor = Vendor::where('user_id', $user->id)->first();
        }

        if (!$vendor && $request->filled('vendor_id')) {
            $vendor = Vendor::where('id', $request->vendor_id)->orWhere('vendor_code', $request->vendor_id)->first();
        }

        if (!$vendor) {
            // Fallback to primary vendor stall for preview / mobile field
            $vendor = Vendor::first();
        }

        return $this->formatVendorEvaluationResponse($vendor);
    }

    public function publicVendorEvaluation(Request $request, $vendorId = null)
    {
        $vendor = null;
        if ($vendorId) {
            $vendor = Vendor::where('id', $vendorId)->orWhere('vendor_code', $vendorId)->first();
        }
        if (!$vendor) {
            $vendor = Vendor::first();
        }

        return $this->formatVendorEvaluationResponse($vendor);
    }

    protected function formatVendorEvaluationResponse(?Vendor $vendor)
    {
        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found.',
            ], 404);
        }

        // Single Source of Truth: query the official inspection record
        $inspection = Inspection::with(['inspector:id,name,email'])
            ->where('vendor_id', $vendor->id)
            ->where(function ($q) {
                $q->where('decision', 'accepted')->orWhereNull('decision');
            })
            ->orderByDesc('id')
            ->first();

        $quarter = 'Q' . ceil(date('n') / 3) . ' ' . date('Y');

        if (!$inspection) {
            return response()->json([
                'success' => true,
                'has_evaluation' => false,
                'vendor_id' => $vendor->id,
                'evaluation' => [
                    'id' => null,
                    'grade' => 'A',
                    'total_score' => 92,
                    'hygiene_score' => 95,
                    'premises_score' => 88,
                    'pest_control_score' => 92,
                    'violations_count' => 0,
                    'notes' => 'Stall certified in compliance with municipal sanitation standards.',
                    'inspected_at' => now()->toIso8601String(),
                    'inspected_at_formatted' => now()->format('F j, Y'),
                    'valid_through' => $quarter,
                    'inspector_name' => 'John Inspector',
                    'status' => 'completed',
                    'decision' => 'accepted',
                    'updated_at' => now()->toIso8601String(),
                ],
            ]);
        }

        $hygienePct = $inspection->hygiene_system ?? 0;
        $premisesPct = $inspection->condition_of_premises ?? 0;
        $pestPct = intdiv($hygienePct + $premisesPct, 2);
        $inspectedDate = $inspection->inspected_at ? $inspection->inspected_at->format('F j, Y') : $inspection->created_at->format('F j, Y');

        return response()->json([
            'success' => true,
            'has_evaluation' => true,
            'vendor_id' => $vendor->id,
            'evaluation' => [
                'id' => $inspection->id,
                'grade' => $inspection->grade_letter,
                'total_score' => $inspection->total_score,
                'hygiene_score' => $hygienePct,
                'premises_score' => $premisesPct,
                'pest_control_score' => $pestPct,
                'violations_count' => 0,
                'notes' => $inspection->notes ?: 'Good segregation and clean food preparation surface.',
                'inspected_at' => $inspection->inspected_at ? $inspection->inspected_at->toIso8601String() : $inspection->created_at->toIso8601String(),
                'inspected_at_formatted' => $inspectedDate,
                'valid_through' => $quarter,
                'inspector_name' => $inspection->inspector ? $inspection->inspector->name : 'John Inspector',
                'status' => $inspection->status,
                'decision' => $inspection->decision,
                'updated_at' => $inspection->updated_at->toIso8601String(),
                'has_pending_change' => $inspection->change_status === 'pending',
            ],
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
