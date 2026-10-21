<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Inspection;
use App\Models\Vendor;
use App\Models\Violation;
use Illuminate\Support\Facades\DB;

class VendorComplianceService
{
    /*
    |--------------------------------------------------------------------------
    | UNIFIED GRADE CALCULATION (Single Source of Truth)
    |--------------------------------------------------------------------------
    | Formula standard:
    | Grade A: >= 85%  (Certified Compliant - satisfies municipal sanitation)
    | Grade B: 70-84%  (Conditionally Compliant - remedial sanitation recommended)
    | Grade C: < 70%   (Non-Compliant - corrective actions required)
    */
    public static function calculateGradeLetter(int $totalScore): string
    {
        if ($totalScore >= 85) {
            return 'A';
        }
        if ($totalScore >= 70) {
            return 'B';
        }
        return 'C';
    }

    public static function getGradeLabel(string $grade): string
    {
        return match (strtoupper($grade)) {
            'A' => 'Grade A (Certified Compliant)',
            'B' => 'Grade B (Conditionally Compliant)',
            'C' => 'Grade C (Non-Compliant / Attention Required)',
            default => 'Not Evaluated',
        };
    }

    /*
    |--------------------------------------------------------------------------
    | ATOMIC RECALCULATION FOR VENDOR
    |--------------------------------------------------------------------------
    | Recalculates compliance score, sanitation score, and letter grade atomically
    | under an exclusive row lock (lockForUpdate) inside a database transaction.
    */
    public static function recalculateForVendor(int $vendorId, ?int $changedByUserId = null, ?string $reason = null): array
    {
        return DB::transaction(function () use ($vendorId, $changedByUserId, $reason) {
            /** @var Vendor $vendor */
            $vendor = Vendor::where('id', $vendorId)->lockForUpdate()->first();
            if (!$vendor) {
                return [
                    'success' => false,
                    'message' => "Vendor #{$vendorId} not found.",
                ];
            }

            // Capture previous state for history logging
            $oldValues = [
                'sanitation_score' => (float) ($vendor->sanitation_score ?? 0.0),
                'compliance_score' => (int) ($vendor->compliance_score ?? 0),
                'compliance_grade' => (string) ($vendor->compliance_grade ?? 'N/A'),
                'violations_count' => (int) ($vendor->violations_count ?? 0),
            ];

            // 1. Fetch latest completed & accepted inspection (fallback to any completed inspection)
            $latestInspection = Inspection::where('vendor_id', $vendorId)
                ->where('status', 'completed')
                ->where('decision', 'accepted')
                ->orderByDesc('inspected_at')
                ->orderByDesc('id')
                ->first();

            if (!$latestInspection) {
                $latestInspection = Inspection::where('vendor_id', $vendorId)
                    ->where('status', 'completed')
                    ->orderByDesc('inspected_at')
                    ->orderByDesc('id')
                    ->first();
            }

            // 2. Compute scores
            if ($latestInspection) {
                $hygiene = (int) ($latestInspection->hygiene_system ?? 0);
                $premises = (int) ($latestInspection->condition_of_premises ?? 0);
                $totalScore = intdiv($hygiene + $premises, 2);

                // Sanitation score on a 10-point scale (e.g., 85% -> 8.5)
                $sanitationScore = round($totalScore / 10, 1);
                // Compliance score on a 100% scale
                $complianceScore = $totalScore;
                $gradeLetter = self::calculateGradeLetter($totalScore);
                $lastInspectedAt = $latestInspection->inspected_at ?? $latestInspection->created_at;
            } else {
                $hygiene = 0;
                $premises = 0;
                $totalScore = 0;
                $sanitationScore = 0.0;
                $complianceScore = 0;
                $gradeLetter = 'N/A';
                $lastInspectedAt = null;
            }

            // 3. Count active / unresolved violations
            $violationsCount = Violation::where('vendor_id', $vendorId)
                ->where('status', '!=', 'resolved')
                ->count();

            // 4. Update vendor model atomically
            $vendor->sanitation_score = $sanitationScore;
            $vendor->compliance_score = $complianceScore;
            $vendor->compliance_grade = $gradeLetter;
            $vendor->violations_count = $violationsCount;
            if ($lastInspectedAt) {
                $vendor->last_inspected_at = $lastInspectedAt;
            }
            $vendor->save();

            $newValues = [
                'sanitation_score' => $sanitationScore,
                'compliance_score' => $complianceScore,
                'compliance_grade' => $gradeLetter,
                'violations_count' => $violationsCount,
                'last_inspected_at' => $lastInspectedAt ? $lastInspectedAt->toIso8601String() : null,
            ];

            // 5. Record activity history log
            $logAction = $reason ? "vendor.scores_updated ({$reason})" : 'vendor.scores_updated';
            $logDetails = sprintf(
                "Vendor #%d (%s) evaluation recalculated: Sanitation [%.1f -> %.1f/10], Compliance [%d%% -> %d%%], Grade [%s -> %s], Violations: %d. Action: %s",
                $vendor->id,
                $vendor->business_name,
                $oldValues['sanitation_score'],
                $newValues['sanitation_score'],
                $oldValues['compliance_score'],
                $newValues['compliance_score'],
                $oldValues['compliance_grade'],
                $newValues['compliance_grade'],
                $violationsCount,
                $reason ?? 'Inspection update'
            );

            ActivityLog::record(
                $logAction,
                $logDetails,
                $vendor,
                $changedByUserId
            );

            return [
                'success' => true,
                'vendor_id' => $vendor->id,
                'sanitation_score' => $sanitationScore,
                'compliance_score' => $complianceScore,
                'compliance_grade' => $gradeLetter,
                'grade_label' => self::getGradeLabel($gradeLetter),
                'violations_count' => $violationsCount,
                'old_values' => $oldValues,
                'new_values' => $newValues,
                'vendor' => $vendor,
            ];
        });
    }

    /*
    |--------------------------------------------------------------------------
    | POPULATE INITIAL SCORES FOR ALL EXISTING VENDORS
    |--------------------------------------------------------------------------
    */
    public static function syncAllVendors(): int
    {
        $vendors = Vendor::all();
        $count = 0;
        foreach ($vendors as $vendor) {
            self::recalculateForVendor($vendor->id, null, 'Initial database sync');
            $count++;
        }
        return $count;
    }
}
