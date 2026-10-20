<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Inspection;
use App\Models\Notification;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
            'force_override' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please check the inspection information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $inspectorId = $request->inspector_id ?? ($request->user() ? $request->user()->id : 4);

        return DB::transaction(function () use ($request, $inspectorId) {
            // Pessimistic locking on the vendor record to serialize concurrent audits
            $vendor = Vendor::where('id', $request->vendor_id)->lockForUpdate()->first();
            if (!$vendor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vendor not found.',
                ], 404);
            }

            // Check for concurrent collision: another inspector submitted an evaluation for this vendor in the last 3 minutes
            $recentOtherInspection = Inspection::where('vendor_id', $vendor->id)
                ->where('inspector_id', '!=', $inspectorId)
                ->where('created_at', '>=', now()->subMinutes(3))
                ->first();

            if ($recentOtherInspection && !$request->boolean('force_override')) {
                return response()->json([
                    'success' => false,
                    'is_conflict' => true,
                    'message' => 'Concurrent inspection detected: Another inspector has recently submitted a record for this stall. Please review existing records before submitting a new one.',
                    'recent_inspection' => $recentOtherInspection,
                ], 409);
            }

            // Find existing inspection by explicit ID or latest record for this vendor
            $existing = null;
            if ($request->filled('inspection_id')) {
                $existing = Inspection::find($request->inspection_id);
            }
            if (!$existing) {
                $existing = Inspection::where('vendor_id', $vendor->id)->orderByDesc('id')->first();
            }

            // If an inspection already exists for this vendor, treat edits as a pending change request
            if ($existing) {
                $pendingTotal = intdiv(
                    $request->hygiene_system + $request->condition_of_premises,
                    2
                );

                $pNotes = $request->filled('notes') ? trim((string)$request->notes) : null;
                if ($pNotes !== null && (strtolower($pNotes) === 'write something' || $pNotes === '')) {
                    $pNotes = null;
                }

                $existing->pending_hygiene_system = $request->hygiene_system;
                $existing->pending_condition_of_premises = $request->condition_of_premises;
                $existing->pending_total_score = $pendingTotal;
                $existing->pending_notes = $pNotes;
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

            $cleanNotes = $request->filled('notes') ? trim((string)$request->notes) : null;
            if ($cleanNotes !== null && (strtolower($cleanNotes) === 'write something' || $cleanNotes === '')) {
                $cleanNotes = null;
            }

            $inspection = Inspection::create([
                'vendor_id' => $vendor->id,
                'inspector_id' => $inspectorId,
                'hygiene_system' => $request->hygiene_system,
                'condition_of_premises' => $request->condition_of_premises,
                'total_score' => $totalScore,
                'compliance_level' => $totalScore,
                'notes' => $cleanNotes,
                'status' => $request->status ?? 'completed',
                'decision' => 'accepted',
                'decided_by' => $inspectorId,
                'decided_at' => now(),
                'inspected_at' => $request->inspected_at ?? now(),
            ]);

            $inspection->load(['vendor.barangay', 'inspector:id,name,email']);

            \App\Services\VendorComplianceService::recalculateForVendor(
                $vendor->id,
                $inspectorId,
                "Initial inspection recorded (Score: {$totalScore})"
            );

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
        });
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
            $rawNotes = $request->has('notes') ? trim((string)$request->notes) : $inspection->notes;
            if ($rawNotes !== null && (strtolower($rawNotes) === 'write something' || $rawNotes === '')) {
                $rawNotes = null;
            }

            $inspection->fill($request->only([
                'status',
                'inspected_at',
            ]));
            $inspection->notes = $rawNotes;

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

            \App\Services\VendorComplianceService::recalculateForVendor(
                $inspection->vendor_id,
                $request->user() ? $request->user()->id : null,
                "Inspection #{$inspection->id} directly updated by Admin"
            );

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

        $pendingNotes = $request->has('notes') ? trim((string)$request->notes) : $inspection->notes;
        if ($pendingNotes !== null && (strtolower($pendingNotes) === 'write something' || $pendingNotes === '')) {
            $pendingNotes = null;
        }

        $inspection->pending_hygiene_system = $pendingHygiene;
        $inspection->pending_condition_of_premises = $pendingPremises;
        $inspection->pending_total_score = $pendingTotal;
        $inspection->pending_notes = $pendingNotes;
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
            $finalNotes = trim((string)$inspection->pending_notes);
            if (strtolower($finalNotes) === 'write something' || $finalNotes === '') {
                $finalNotes = null;
            }
            $inspection->notes = $finalNotes;
            $inspection->pending_notes = null;
        }

        $inspection->decision = 'accepted';
        $inspection->decided_by = $request->user() ? $request->user()->id : 1;
        $inspection->decided_at = now();
        $inspection->change_status = 'accepted';
        $inspection->inspected_at = now();
        $inspection->touch();
        $inspection->save();

        \App\Services\VendorComplianceService::recalculateForVendor(
            $inspection->vendor_id,
            $request->user() ? $request->user()->id : 1,
            "Evaluation change request approved for inspection #{$inspection->id}"
        );

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

        \App\Services\VendorComplianceService::recalculateForVendor(
            $inspection->vendor_id,
            $request->user()->id,
            "Admin decided inspection #{$inspection->id} as {$request->decision}"
        );

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
                    'grade' => $vendor->compliance_grade ?: 'N/A',
                    'total_score' => (int) ($vendor->compliance_score ?? 0),
                    'hygiene_score' => 0,
                    'premises_score' => 0,
                    'pest_control_score' => 0,
                    'violations_count' => (int) ($vendor->violations_count ?? 0),
                    'notes' => '',
                    'inspected_at' => null,
                    'inspected_at_formatted' => 'Pending Inspection',
                    'valid_through' => $quarter,
                    'inspector_name' => 'Unassigned',
                    'status' => 'pending',
                    'decision' => 'none',
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
                'violations_count' => (int) ($vendor->violations_count ?? 0),
                'notes' => $inspection->notes ?? '',
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
    public function destroy(Request $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
            $inspection = Inspection::where('id', $id)->lockForUpdate()->first();

            if (!$inspection) {
                return response()->json([
                    'success' => false,
                    'message' => 'Inspection not found.',
                ], 404);
            }

            $vendorId = $inspection->vendor_id;
            $inspection->delete();

            \App\Services\VendorComplianceService::recalculateForVendor(
                $vendorId,
                $request->user() ? $request->user()->id : null,
                "Inspection #{$id} deleted"
            );

            ActivityLog::record(
                'inspection.deleted',
                "Deleted inspection #{$id}."
            );

            return response()->json([
                'success' => true,
                'message' => 'Inspection deleted successfully.',
            ]);
        });
    }

    /*
    |--------------------------------------------------------------------------
    | INSPECTOR PROFILE REAL STATS (Requirement 3)
    |--------------------------------------------------------------------------
    */
    public function getInspectorStats(Request $request)
    {
        $user = $request->user();
        $inspectorId = $user ? $user->id : (int) ($request->query('inspector_id') ?: 4);

        $stallsCertified = Inspection::where('inspector_id', $inspectorId)
            ->where('status', 'completed')
            ->distinct('vendor_id')
            ->count('vendor_id');

        $totalInspections = Inspection::where('inspector_id', $inspectorId)->count();

        $pendingReviews = Inspection::where('inspector_id', $inspectorId)
            ->where('status', 'pending')
            ->count();

        $completedToday = Inspection::where('inspector_id', $inspectorId)
            ->where('status', 'completed')
            ->whereDate('inspected_at', now()->toDateString())
            ->count();

        $recentInspections = Inspection::with(['vendor.barangay'])
            ->where('inspector_id', $inspectorId)
            ->where('status', 'completed')
            ->latest('inspected_at')
            ->latest('id')
            ->limit(10)
            ->get()
            ->map(function ($ins) {
                return [
                    'id' => $ins->id,
                    'vendor_id' => $ins->vendor_id,
                    'business_name' => $ins->vendor?->business_name ?? 'Market Stall',
                    'stall_number' => $ins->vendor?->stall_number ?? ('Stall #' . $ins->vendor_id),
                    'market' => $ins->vendor?->market ?? 'Public Market',
                    'score' => $ins->total_score,
                    'grade' => $ins->grade_letter,
                    'status' => 'Passed',
                    'inspected_at' => $ins->inspected_at ? $ins->inspected_at->format('F j, Y') : $ins->created_at->format('F j, Y'),
                ];
            });

        return response()->json([
            'success' => true,
            'stalls_certified' => $stallsCertified,
            'total_inspections' => $totalInspections,
            'pending_reviews' => $pendingReviews,
            'completed_today' => $completedToday,
            'recent_stalls' => $recentInspections,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | VERIFY VENDOR QR CODE (Inspector Vendor Verification)
    |--------------------------------------------------------------------------
    | Limitation 2: QR functionality is exclusive to registered public market
    | vendors and authorized city inspectors. Do NOT expose to residential profiles.
    */
    public function verifyVendorQr(Request $request)
    {
        $user = $request->user();

        $isAuthorized = $user && $user->roles()->whereIn('name', ['inspector', 'super_admin'])->exists();
        if (!$isAuthorized) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. QR vendor verification is strictly restricted to authorized City Sanitation Inspectors and CLENRO Super Admin.',
            ], 403);
        }

        $code = trim($request->input('qr_code') ?? $request->input('code') ?? '');

        // Handle JSON payloads scanned from QR badge
        if (str_starts_with($code, '{') && str_ends_with($code, '}')) {
            $parsed = json_decode($code, true);
            if (is_array($parsed)) {
                $code = $parsed['qr_token'] ?? $parsed['qr_code'] ?? $parsed['vendor_code'] ?? $parsed['code'] ?? $code;
            }
        }

        if (empty($code)) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide a valid vendor QR code.',
            ], 422);
        }

        $vendor = Vendor::with([
            'barangay:id,name',
            'user:id,name,email',
            'inspections' => function ($q) {
                $q->latest()->limit(10);
            },
        ])
        ->where('qr_code', $code)
        ->orWhere('vendor_code', $code)
        ->orWhere('id', is_numeric($code) ? (int)$code : 0)
        ->first();

        if (!$vendor) {
            ActivityLog::record(
                'inspector.qr_failed',
                "Inspector " . ($user ? $user->name : 'Unknown') . " scanned unrecognized QR code [{$code}]."
            );

            return response()->json([
                'success' => false,
                'error_type' => 'NOT_REGISTERED',
                'message' => 'Non-registered QR code. This QR code does not belong to any authorized market vendor in Cogon or Carmen Market.',
            ], 404);
        }

        if ($vendor->status !== 'active') {
            ActivityLog::record(
                'inspector.qr_revoked',
                "Inspector {$user->name} scanned {$vendor->status} stall QR for {$vendor->business_name} (#{$vendor->id}).",
                $vendor
            );

            return response()->json([
                'success' => false,
                'error_type' => 'REVOKED_OR_INACTIVE',
                'vendor_status' => $vendor->status,
                'message' => "Stall {$vendor->status}. Vendor stall '{$vendor->business_name}' at {$vendor->market} is currently marked as {$vendor->status} in city records.",
                'vendor' => $vendor,
            ], 422);
        }

        $violations = \App\Models\Violation::where('vendor_id', $vendor->id)
            ->latest()
            ->limit(10)
            ->get();

        $latestInspection = $vendor->inspections->first();
        $score = $latestInspection ? $latestInspection->total_score : ($vendor->compliance_score ?: 0);
        $gradeLetter = \App\Services\VendorComplianceService::calculateGradeLetter($score);
        $grade = 'Grade ' . $gradeLetter;
        $complianceLabel = \App\Services\VendorComplianceService::getGradeLabel($gradeLetter);

        ActivityLog::record(
            'inspector.qr_verified',
            "Inspector {$user->name} verified vendor {$vendor->business_name} ({$vendor->market}, {$vendor->stall_number}) via QR verification.",
            $vendor
        );

        return response()->json([
            'success' => true,
            'message' => 'Vendor stall verified successfully.',
            'vendor' => $vendor,
            'compliance' => [
                'score' => $score,
                'grade' => $grade,
                'grade_letter' => substr($grade, -1),
                'status_label' => $complianceLabel,
                'flagged' => $score <= self::COMPLIANCE_FLAG_THRESHOLD,
                'inspections_count' => $vendor->inspections->count(),
                'violations_count' => $violations->count(),
            ],
            'recent_inspections' => $vendor->inspections,
            'recent_violations' => $violations,
        ]);
    }
}
