<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClenroPileupReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClenroPileupReportController extends Controller
{
    /**
     * GET /api/clenro/pileup-reports
     * List historical garbage pile-up reports with multi-criteria filtering
     */
    public function index(Request $request)
    {
        $query = ClenroPileupReport::query();

        if ($request->filled('zone')) {
            $query->locationZone($request->zone);
        }

        if ($request->filled('start_date') || $request->filled('end_date')) {
            $query->dateRange($request->start_date, $request->end_date);
        }

        if ($request->filled('severity')) {
            $query->severity($request->severity);
        }

        if ($request->filled('root_cause')) {
            $query->rootCause($request->root_cause);
        }

        if ($request->filled('status')) {
            $query->status($request->status);
        }

        if ($request->filled('search')) {
            $query->search($request->search);
        }

        $sortBy = $request->input('sort_by', 'incident_date');
        $sortOrder = $request->input('sort_order', 'desc');
        $allowedSorts = ['incident_date', 'waste_volume_m3', 'estimated_tonnage', 'turnaround_hours', 'severity', 'location_zone'];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortOrder === 'asc' ? 'asc' : 'desc');
        } else {
            $query->orderBy('incident_date', 'desc');
        }

        $perPage = (int) $request->input('per_page', 50);
        $reports = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $reports,
        ]);
    }

    /**
     * GET /api/clenro/pileup-reports/{id}
     * Get single pile-up incident details
     */
    public function show($id)
    {
        $report = ClenroPileupReport::find($id);

        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Historical pile-up report not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'report' => $report,
        ]);
    }

    /**
     * GET /api/clenro/pileup-reports-analytics
     * Aggregated historical analytics and decision-support metrics for CLENRO
     */
    public function analytics(Request $request)
    {
        $query = ClenroPileupReport::query();

        if ($request->filled('zone')) {
            $query->locationZone($request->zone);
        }
        if ($request->filled('start_date') || $request->filled('end_date')) {
            $query->dateRange($request->start_date, $request->end_date);
        }
        if ($request->filled('severity')) {
            $query->severity($request->severity);
        }
        if ($request->filled('root_cause')) {
            $query->rootCause($request->root_cause);
        }

        $allReports = $query->get();

        $totalIncidents = $allReports->count();
        $totalVolume = round($allReports->sum('waste_volume_m3'), 2);
        $totalTonnage = round($allReports->sum('estimated_tonnage'), 2);

        $avgTurnaround = $totalIncidents > 0 
            ? round($allReports->whereNotNull('turnaround_hours')->avg('turnaround_hours'), 2)
            : 0;

        $withinSlaCount = $allReports->where('sla_status', 'within_sla')->count();
        $slaComplianceRate = $totalIncidents > 0 ? round(($withinSlaCount / $totalIncidents) * 100, 1) : 100;
        $slaBreachesCount = $allReports->whereIn('sla_status', ['breached_24h', 'breached_48h', 'critical_unresolved'])->count();

        // Market vs Urban Core Breakdown
        $marketReports = $allReports->filter(fn ($r) => in_array($r->location_zone, ['Cogon Market Zone', 'Carmen Market Zone']));
        $marketVolume = round($marketReports->sum('waste_volume_m3'), 2);
        $marketVolumePct = $totalVolume > 0 ? round(($marketVolume / $totalVolume) * 100, 1) : 0;

        $urbanVolume = round($totalVolume - $marketVolume, 2);
        $urbanVolumePct = $totalVolume > 0 ? round(100 - $marketVolumePct, 1) : 0;

        // Hotspots Ranking (Top Zones by volume and frequency)
        $hotspots = $allReports->groupBy('location_zone')->map(function ($group, $zone) {
            return [
                'zone' => $zone,
                'is_market' => in_array($zone, ['Cogon Market Zone', 'Carmen Market Zone']),
                'count' => $group->count(),
                'total_volume_m3' => round($group->sum('waste_volume_m3'), 2),
                'total_tonnage' => round($group->sum('estimated_tonnage'), 2),
                'avg_turnaround_hours' => round($group->avg('turnaround_hours'), 2),
                'critical_count' => $group->where('severity', 'critical')->count(),
                'sla_breaches' => $group->whereIn('sla_status', ['breached_24h', 'breached_48h', 'critical_unresolved'])->count(),
            ];
        })->sortByDesc('total_volume_m3')->values()->take(10);

        // Root Cause Distribution
        $rootCauses = $allReports->groupBy('root_cause')->map(function ($group, $cause) use ($totalVolume) {
            $vol = round($group->sum('waste_volume_m3'), 2);
            return [
                'root_cause' => $cause,
                'count' => $group->count(),
                'volume_m3' => $vol,
                'percentage' => $totalVolume > 0 ? round(($vol / $totalVolume) * 100, 1) : 0,
            ];
        })->sortByDesc('volume_m3')->values();

        // Waste Category Breakdown
        $wasteCategories = $allReports->groupBy('waste_category')->map(function ($group, $cat) use ($totalVolume) {
            $vol = round($group->sum('waste_volume_m3'), 2);
            return [
                'category' => $cat,
                'count' => $group->count(),
                'volume_m3' => $vol,
                'percentage' => $totalVolume > 0 ? round(($vol / $totalVolume) * 100, 1) : 0,
            ];
        })->sortByDesc('volume_m3')->values();

        // SLA Performance Distribution
        $slaDistribution = [
            'within_sla' => $allReports->where('sla_status', 'within_sla')->count(),
            'breached_24h' => $allReports->where('sla_status', 'breached_24h')->count(),
            'breached_48h' => $allReports->where('sla_status', 'breached_48h')->count(),
            'critical_unresolved' => $allReports->where('sla_status', 'critical_unresolved')->count(),
        ];

        // Monthly / Seasonal Trends
        $monthlyTrend = $allReports->groupBy(function ($r) {
            return $r->incident_date ? $r->incident_date->format('Y-m') : 'unknown';
        })->map(function ($group, $yearMonth) {
            $marketSub = $group->filter(fn ($r) => in_array($r->location_zone, ['Cogon Market Zone', 'Carmen Market Zone']));
            return [
                'month' => $yearMonth,
                'count' => $group->count(),
                'volume_m3' => round($group->sum('waste_volume_m3'), 2),
                'tonnage' => round($group->sum('estimated_tonnage'), 2),
                'market_volume_m3' => round($marketSub->sum('waste_volume_m3'), 2),
                'urban_volume_m3' => round($group->sum('waste_volume_m3') - $marketSub->sum('waste_volume_m3'), 2),
            ];
        })->sortKeys();

        // Generate Automated Prescriptive Decision Directives for CLENRO Leadership
        $directives = $this->generateDecisionDirectives(
            $totalVolume,
            $marketVolumePct,
            $slaBreachesCount,
            $hotspots,
            $rootCauses
        );

        return response()->json([
            'success' => true,
            'summary' => [
                'total_incidents' => $totalIncidents,
                'total_volume_m3' => $totalVolume,
                'total_tonnage' => $totalTonnage,
                'avg_turnaround_hours' => $avgTurnaround,
                'sla_compliance_rate' => $slaComplianceRate,
                'sla_breaches_count' => $slaBreachesCount,
                'market_volume_m3' => $marketVolume,
                'market_volume_pct' => $marketVolumePct,
                'urban_volume_m3' => $urbanVolume,
                'urban_volume_pct' => $urbanVolumePct,
                'chronic_hotspot_count' => $allReports->where('status', 'chronic_hotspot')->count(),
            ],
            'hotspots' => $hotspots,
            'root_causes' => $rootCauses,
            'waste_categories' => $wasteCategories,
            'sla_distribution' => $slaDistribution,
            'monthly_trend' => $monthlyTrend->values(),
            'decision_directives' => $directives,
        ]);
    }

    /**
     * Helper to generate dynamic prescriptive directives for CLENRO administrators
     */
    private function generateDecisionDirectives($totalVolume, $marketVolumePct, $slaBreaches, $hotspots, $rootCauses)
    {
        $directives = [];

        // Market Fleet & Night Shift Directive
        if ($marketVolumePct >= 35) {
            $directives[] = [
                'category' => 'Fleet Re-allocation & Market Scheduling',
                'priority' => 'HIGH',
                'action' => 'Establish Dedicated Cogon & Carmen Market Night Compactor Rotation',
                'details' => "Public markets account for {$marketVolumePct}% of total pile-up volume. Reallocate 2 compactor haulers specifically for an 8:30 PM to 3:30 AM night-sweep corridor covering Yacapin, J.R. Borja, Vamenta Blvd, and Seriña St.",
                'legal_reference' => 'CDO City Ordinance No. 13378-2018 (Section 22: Commercial Market Waste Handling)',
            ];
        }

        // Hauler Contract SLA Penalty Directive
        if ($slaBreaches > 0) {
            $estimatedPenalties = $slaBreaches * 12500;
            $directives[] = [
                'category' => 'Contractor SLA & Liquidated Damages',
                'priority' => 'CRITICAL',
                'action' => "Issue Notice of SLA Deduction for {$slaBreaches} Clearance Delays",
                'details' => "Historical data shows {$slaBreaches} incidents breaching the 12-hour/24-hour cleanup SLA. Recommend withholding estimated ₱" . number_format($estimatedPenalties, 2) . " in contractor monthly billing under City Solid Waste Hauling Agreement.",
                'legal_reference' => 'LGU CDO Solid Waste Hauling Service Agreement (Liquidated Damages Clause)',
            ];
        }

        // Drainage & Waterways Anti-Dumping Directive
        $drainageIssue = $rootCauses->firstWhere('root_cause', 'monsoon_drainage_blockage');
        if ($drainageIssue && $drainageIssue['count'] >= 2) {
            $directives[] = [
                'category' => 'Waterways & Flood Prevention',
                'priority' => 'HIGH',
                'action' => 'Deploy Pre-Habagat Silt & Trash Booms along Bitan-ag Creek & Carmen Riverwall',
                'details' => 'Barangay 22, Barangay 35, and Carmen bridge approaches experienced severe rain-induced pile-ups. Deploy bi-weekly desiltation crews and install trash barriers prior to July-September monsoon peaks.',
                'legal_reference' => 'Republic Act No. 9003 (Ecological Solid Waste Management Act) & Disaster Risk Reduction Protocols',
            ];
        }

        // Anti-Littering & Eco-Warden Enforcement Directive
        $dumpingIssue = $rootCauses->firstWhere('root_cause', 'unauthorized_vendor_dumping');
        if ($dumpingIssue) {
            $directives[] = [
                'category' => 'Enforcement & Surveillance',
                'priority' => 'MODERATE',
                'action' => 'Mobilize CLENRO Eco-Wardens for Evening Foot Patrol in Brgy 31, 34, 1, and 2',
                'details' => 'Unauthorized vendor and resident fly-tipping identified as recurring root causes. Deploy Eco-Wardens between 6:00 PM and 10:00 PM to issue on-the-spot citation tickets to non-compliant commercial tenants.',
                'legal_reference' => 'CDO City Ordinance No. 13378-2018 (Section 45: Fines and Citations for Illegal Dumping)',
            ];
        }

        // Alleyway / Narrow Street Collection Routing Directive
        $directives[] = [
            'category' => 'Urban Core Routing Optimization',
            'priority' => 'MODERATE',
            'action' => 'Assign Satellite Mini-Dump Trucks to Narrow Poblacion Barangays (Brgy 10 to 20)',
            'details' => 'Large compactors frequently cannot maneuver narrow residential alleys in Barangays 14, 18, and 26. Shift to tri-weekly mini-hauler feeder runs connecting to central transfer points on Velez and Capistrano Streets.',
            'legal_reference' => 'CLENRO Urban Core Collection Route Rationalization Plan',
        ];

        return $directives;
    }

    /**
     * GET /api/clenro/pileup-reports-export
     * Export filtered historical records as CSV
     */
    public function exportCsv(Request $request)
    {
        $query = ClenroPileupReport::query();

        if ($request->filled('zone')) {
            $query->locationZone($request->zone);
        }
        if ($request->filled('start_date') || $request->filled('end_date')) {
            $query->dateRange($request->start_date, $request->end_date);
        }
        if ($request->filled('severity')) {
            $query->severity($request->severity);
        }
        if ($request->filled('root_cause')) {
            $query->rootCause($request->root_cause);
        }

        $reports = $query->orderBy('incident_date', 'desc')->get();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="CLENRO_CDO_Garbage_Pileup_Report_' . date('Ymd_His') . '.csv"',
        ];

        $callback = function () use ($reports) {
            $file = fopen('php://output', 'w');
            // Add UTF-8 BOM for Excel compatibility
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));

            // CSV Header
            fputcsv($file, [
                'Incident Code',
                'Location Zone',
                'Barangay Number',
                'Specific Landmark',
                'Date & Time Reported',
                'Date & Time Cleared',
                'Turnaround Hours',
                'SLA Status',
                'Waste Volume (m3)',
                'Estimated Tonnage',
                'Severity',
                'Waste Category',
                'Root Cause',
                'Contractor Assigned',
                'Truck Plate',
                'Status',
                'CLENRO Action Taken',
                'Decision Recommendation',
                'Reported By',
            ]);

            foreach ($reports as $r) {
                fputcsv($file, [
                    $r->incident_code,
                    $r->location_zone,
                    $r->barangay_number ?? 'N/A',
                    $r->specific_landmark,
                    $r->incident_date ? $r->incident_date->format('Y-m-d H:i') : '',
                    $r->cleared_date ? $r->cleared_date->format('Y-m-d H:i') : 'Unresolved',
                    $r->turnaround_hours ?? 'N/A',
                    $r->sla_status,
                    $r->waste_volume_m3,
                    $r->estimated_tonnage,
                    $r->severity,
                    $r->waste_category,
                    $r->root_cause,
                    $r->contractor_assigned,
                    $r->truck_plate ?? 'N/A',
                    $r->status,
                    $r->clenro_action_taken,
                    $r->decision_recommendation,
                    $r->reported_by,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
