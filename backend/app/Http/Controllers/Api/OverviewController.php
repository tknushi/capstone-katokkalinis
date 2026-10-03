<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Barangay;
use App\Models\CollectionRoute;
use App\Models\CollectionSchedule;
use App\Models\Inspection;
use App\Models\Report;
use App\Models\Truck;
use App\Models\User;
use App\Models\Vendor;
use Carbon\Carbon;
use Illuminate\Http\Request;

class OverviewController extends Controller
{
    /**
     * Return comprehensive aggregate operational data for the Barangay Overview dashboard.
     * Optionally scoped by ?barangay_id=<id>.
     */
    public function summary(Request $request)
    {
        $barangayId = $request->filled('barangay_id') ? (int) $request->barangay_id : null;
        $barangay = $barangayId ? Barangay::find($barangayId) : null;
        $barangayName = $barangay ? $barangay->name : null;

        // ---------------------------------------------------------------------
        // 1. Total Residents
        // ---------------------------------------------------------------------
        $residentQuery = User::whereHas('roles', fn ($q) => $q->where('name', 'resident'));
        if ($barangay) {
            $residentQuery->where(function ($q) use ($barangay) {
                $q->where('address', 'like', "%{$barangay->name}%")
                  ->orWhere('address', 'like', "%{$barangay->code}%");
            });
        }
        $totalResidents = $residentQuery->count();

        // ---------------------------------------------------------------------
        // 2. Registered Vendors
        // ---------------------------------------------------------------------
        $vendorQuery = Vendor::query();
        if ($barangayId) {
            $vendorQuery->where('barangay_id', $barangayId);
        }
        $registeredVendors = $vendorQuery->count();

        // ---------------------------------------------------------------------
        // 3. Personnel Breakdown (Drivers & Inspectors)
        // ---------------------------------------------------------------------
        $driversCount = User::whereHas('roles', fn ($q) => $q->where('name', 'driver'))->count();
        $inspectorsCount = User::whereHas('roles', fn ($q) => $q->where('name', 'inspector'))->count();
        $totalPersonnel = $driversCount + $inspectorsCount;

        // ---------------------------------------------------------------------
        // 4. Weekly Collections & Avg Collection Time
        // ---------------------------------------------------------------------
        $now = Carbon::now();
        $sevenDaysAgo = Carbon::now()->subDays(7)->startOfDay();

        $routesQuery = CollectionRoute::with([
            'truck:id,truck_number,plate_number,driver_id',
            'truck.driver:id,name',
            'barangay:id,name',
        ]);
        if ($barangayId) {
            $routesQuery->where('barangay_id', $barangayId);
        }

        $allRecentRoutes = (clone $routesQuery)->latest('collection_date')->limit(30)->get();

        // Collections completed or scheduled in the last 7 days
        $weeklyCollections = $allRecentRoutes->filter(function ($r) use ($sevenDaysAgo) {
            return $r->collection_date && Carbon::parse($r->collection_date)->gte($sevenDaysAgo);
        })->count();

        // Average collection time from completed routes with start & end times
        $completedWithTimes = $allRecentRoutes->filter(function ($r) {
            return $r->status === 'completed' && !empty($r->start_time) && !empty($r->end_time);
        });

        $durations = [];
        foreach ($completedWithTimes as $r) {
            $diffHours = $this->calculateDurationHours($r->start_time, $r->end_time);
            if ($diffHours !== null && $diffHours > 0) {
                $durations[] = $diffHours;
            }
        }

        $avgCollectionTimeHours = count($durations) > 0
            ? round(array_sum($durations) / count($durations), 1)
            : null;
        $avgCollectionTimeFormatted = $avgCollectionTimeHours !== null
            ? "{$avgCollectionTimeHours} hrs"
            : 'N/A';

        // ---------------------------------------------------------------------
        // 5. Today's Collection Progress (X of Y stops completed)
        // ---------------------------------------------------------------------
        $todayStr = Carbon::today()->toDateString();
        $todayDay = Carbon::today()->format('l');

        // Check routes scheduled for today
        $todayRoutesQuery = CollectionRoute::whereDate('collection_date', $todayStr);
        if ($barangayId) {
            $todayRoutesQuery->where('barangay_id', $barangayId);
        }
        $todayRoutesTotal = (clone $todayRoutesQuery)->count();
        $todayRoutesCompleted = (clone $todayRoutesQuery)->where('status', 'completed')->count();

        // Check schedules scheduled for today's date or recurring day of week
        $todaySchedulesQuery = CollectionSchedule::where(function ($q) use ($todayStr, $todayDay) {
            $q->whereDate('date', $todayStr)
              ->orWhere(function ($sq) use ($todayDay) {
                  $sq->whereNull('date')->where('day', $todayDay);
              });
        });
        if ($barangayId) {
            $todaySchedulesQuery->where('barangay_id', $barangayId);
        }
        $todaySchedulesTotal = (clone $todaySchedulesQuery)->count();
        $todaySchedulesCompleted = (clone $todaySchedulesQuery)->where('status', 'completed')->count();

        // Combine routes & schedules for today's operational coverage
        $todayTotalStops = max($todayRoutesTotal, $todaySchedulesTotal);
        $todayCompletedStops = max($todayRoutesCompleted, $todaySchedulesCompleted);

        // If today has recorded runs that exceed schedules
        if ($todayRoutesTotal > 0 && $todaySchedulesTotal > 0 && $todayRoutesTotal !== $todaySchedulesTotal) {
            $todayTotalStops = $todayRoutesTotal;
            $todayCompletedStops = $todayRoutesCompleted;
        }

        $todayProgressPct = $todayTotalStops > 0
            ? (int) min(100, round(($todayCompletedStops / $todayTotalStops) * 100))
            : 0;

        $todayProgressLabel = $todayTotalStops > 0
            ? "{$todayCompletedStops} of {$todayTotalStops} scheduled stops completed today"
            : "No scheduled collection runs recorded for today";

        // ---------------------------------------------------------------------
        // 6. Reports & Issues (Pending Count vs Active Issues)
        // ---------------------------------------------------------------------
        $reportBaseQuery = Report::query();
        if ($barangayId) {
            $reportBaseQuery->where('barangay_id', $barangayId);
        }

        // Unresolved reports needing review (strictly pending)
        $pendingReportsCount = (clone $reportBaseQuery)->where('status', 'pending')->count();

        // Active issues (pending + reviewed, awaiting final resolution)
        $activeIssuesCount = (clone $reportBaseQuery)->whereIn('status', ['pending', 'reviewed'])->count();

        // ---------------------------------------------------------------------
        // 7. Vendor Compliance Summary (Inspector evaluations)
        // ---------------------------------------------------------------------
        $inspectionsQuery = Inspection::with([
            'vendor:id,vendor_code,business_name,owner_name,market,barangay_id',
            'vendor.barangay:id,name',
            'inspector:id,name,email',
        ]);
        if ($barangayId) {
            $inspectionsQuery->whereHas('vendor', fn ($q) => $q->where('barangay_id', $barangayId));
        }

        $inspections = $inspectionsQuery->latest('inspected_at')->get();

        // Group by vendor to evaluate their latest compliance status
        $latestByVendor = [];
        foreach ($inspections as $ins) {
            if (!isset($latestByVendor[$ins->vendor_id])) {
                $latestByVendor[$ins->vendor_id] = $ins;
            }
        }

        $excellentCount = 0;
        $needsAttentionCount = 0;
        $nonCompliantCount = 0;

        foreach ($latestByVendor as $ins) {
            $score = (int) $ins->total_score;
            if ($score >= 80) {
                $excellentCount++;
            } elseif ($score >= InspectionController::COMPLIANCE_FLAG_THRESHOLD) {
                $needsAttentionCount++;
            } else {
                $nonCompliantCount++;
            }
        }

        $totalEvaluatedVendors = count($latestByVendor);
        $compliantCount = $excellentCount + $needsAttentionCount;
        $complianceRate = $totalEvaluatedVendors > 0
            ? round(($compliantCount / $totalEvaluatedVendors) * 100)
            : 100;

        // ---------------------------------------------------------------------
        // 8. Recent Collections Panel (Latest 5 collection runs)
        // ---------------------------------------------------------------------
        $recentCollections = $allRecentRoutes->slice(0, 5)->values()->map(function ($r) use ($barangayName) {
            return [
                'id' => $r->id,
                'barangay' => $r->barangay ? $r->barangay->name : ($barangayName ?: 'Unknown Barangay'),
                'barangay_id' => $r->barangay_id,
                'truck_number' => $r->truck ? $r->truck->truck_number : '-',
                'plate_number' => $r->truck ? $r->truck->plate_number : '-',
                'driver_name' => $r->truck && $r->truck->driver ? $r->truck->driver->name : 'Unassigned',
                'collection_date' => $r->collection_date ? substr((string) $r->collection_date, 0, 10) : '-',
                'start_time' => $this->formatTimeValue($r->start_time),
                'end_time' => $this->formatTimeValue($r->end_time),
                'status' => $r->status ?? 'pending',
            ];
        });

        // ---------------------------------------------------------------------
        // 9. Upcoming Scheduled Collections (Next 5 scheduled truck runs)
        // ---------------------------------------------------------------------
        $upcomingSchedules = $this->getUpcomingSchedules($barangayId, $todayStr);

        // ---------------------------------------------------------------------
        // 10. Active Issues Panel (Latest 5 pending/reviewed reports)
        // ---------------------------------------------------------------------
        $activeReportsQuery = Report::with([
            'barangay:id,name',
            'user:id,name,email',
        ])->whereIn('status', ['pending', 'reviewed']);

        if ($barangayId) {
            $activeReportsQuery->where('barangay_id', $barangayId);
        }

        $activeIssues = $activeReportsQuery->latest()->limit(5)->get()->map(function ($rep) use ($barangayName) {
            return [
                'id' => $rep->id,
                'title' => $rep->title ?: 'Untitled report',
                'description' => $rep->description,
                'barangay' => $rep->barangay ? $rep->barangay->name : ($barangayName ?: 'General Area'),
                'author' => $rep->user ? $rep->user->name : 'Resident',
                'image_url' => $rep->image ?: ($rep->image_url ?: null),
                'status' => $rep->status ?: 'pending',
                'created_at' => $rep->created_at ? $rep->created_at->toIso8601String() : null,
                'time_formatted' => $rep->created_at ? $rep->created_at->diffForHumans() : 'Recently',
            ];
        });

        // ---------------------------------------------------------------------
        // 11. Recent Activity Feed (Latest 10 system-wide activities)
        // ---------------------------------------------------------------------
        $recentActivities = $this->getRecentActivityFeed($barangayId);

        // ---------------------------------------------------------------------
        // Build & return structured response
        // ---------------------------------------------------------------------
        return response()->json([
            'success' => true,
            'message' => 'Overview operational summary retrieved successfully.',
            'timestamp' => now()->toIso8601String(),
            'barangay' => $barangay ? [
                'id' => $barangay->id,
                'name' => $barangay->name,
                'code' => $barangay->code,
            ] : null,
            'stats' => [
                'total_residents' => $totalResidents,
                'registered_vendors' => $registeredVendors,
                'personnel' => [
                    'drivers_count' => $driversCount,
                    'inspectors_count' => $inspectorsCount,
                    'total_personnel' => $totalPersonnel,
                ],
                'weekly_collections' => $weeklyCollections,
                'avg_collection_time_hours' => $avgCollectionTimeHours,
                'avg_collection_time_formatted' => $avgCollectionTimeFormatted,
                'pending_reports_count' => $pendingReportsCount,
                'active_issues_count' => $activeIssuesCount,
                'today_progress' => [
                    'completed_stops' => $todayCompletedStops,
                    'total_stops' => $todayTotalStops,
                    'percentage' => $todayProgressPct,
                    'text' => $todayProgressLabel,
                    'date' => $todayStr,
                    'day' => $todayDay,
                ],
                'vendor_compliance' => [
                    'total_inspected' => $totalEvaluatedVendors,
                    'excellent' => $excellentCount,
                    'needs_attention' => $needsAttentionCount,
                    'non_compliant' => $nonCompliantCount,
                    'compliance_rate' => $complianceRate,
                    'flag_threshold' => InspectionController::COMPLIANCE_FLAG_THRESHOLD,
                ],
            ],
            'recent_collections' => $recentCollections,
            'upcoming_schedules' => $upcomingSchedules,
            'active_issues' => $activeIssues,
            'recent_activities' => $recentActivities,
        ]);
    }

    /**
     * Retrieve upcoming scheduled collection truck runs from CollectionSchedule & CollectionRoute.
     */
    private function getUpcomingSchedules(?int $barangayId, string $todayStr)
    {
        $schedQuery = CollectionSchedule::with(['barangay:id,name'])
            ->where('active', true)
            ->where('status', '!=', 'completed');

        if ($barangayId) {
            $schedQuery->where('barangay_id', $barangayId);
        }

        // Prioritize explicit future or today dates, then recurring day schedules
        $upcomingSchedules = $schedQuery
            ->where(function ($q) use ($todayStr) {
                $q->whereDate('date', '>=', $todayStr)
                  ->orWhereNull('date');
            })
            ->orderByRaw("CASE WHEN date IS NOT NULL THEN date ELSE '9999-12-31' END ASC")
            ->orderBy('pickup_time', 'asc')
            ->limit(5)
            ->get();

        // Also check if any upcoming collection routes are scheduled in CollectionRoute
        $routeQuery = CollectionRoute::with([
            'barangay:id,name',
            'truck:id,truck_number,plate_number,driver_id',
            'truck.driver:id,name',
        ])
        ->whereDate('collection_date', '>=', $todayStr)
        ->where('status', '!=', 'completed');

        if ($barangayId) {
            $routeQuery->where('barangay_id', $barangayId);
        }

        $upcomingRoutes = $routeQuery
            ->orderBy('collection_date', 'asc')
            ->orderBy('start_time', 'asc')
            ->limit(5)
            ->get();

        $combined = collect();

        foreach ($upcomingRoutes as $ur) {
            $combined->push([
                'id' => "route-{$ur->id}",
                'type' => 'route',
                'barangay' => $ur->barangay ? $ur->barangay->name : 'Scheduled Barangay',
                'date' => $ur->collection_date ? substr((string) $ur->collection_date, 0, 10) : $todayStr,
                'pickup_time' => $this->formatTimeValue($ur->start_time) ?: '08:00',
                'truck' => $ur->truck ? $ur->truck->truck_number : 'Assigned Compactor',
                'driver' => $ur->truck && $ur->truck->driver ? $ur->truck->driver->name : 'Municipal Driver',
                'status' => $ur->status ?: 'scheduled',
            ]);
        }

        foreach ($upcomingSchedules as $us) {
            $date = $us->date ? substr((string) $us->date, 0, 10) : $todayStr;
            // Check if not already added
            $exists = $combined->contains(fn ($c) => $c['barangay'] === ($us->barangay ? $us->barangay->name : '') && $c['date'] === $date);
            if (!$exists) {
                $combined->push([
                    'id' => "schedule-{$us->id}",
                    'type' => 'schedule',
                    'barangay' => $us->barangay ? $us->barangay->name : 'Scheduled Barangay',
                    'date' => $date,
                    'day' => $us->day,
                    'pickup_time' => $this->formatTimeValue($us->pickup_time) ?: '08:00',
                    'truck' => 'Standard Compactor',
                    'driver' => 'Assigned Route Driver',
                    'schedule_type' => $us->schedule_type ?: 'Regular Collection',
                    'status' => $us->status ?: 'scheduled',
                ]);
            }
        }

        return $combined->sortBy('date')->values()->slice(0, 5);
    }

    /**
     * Retrieve system-wide or barangay-scoped chronological activity logs.
     */
    private function getRecentActivityFeed(?int $barangayId)
    {
        $logQuery = ActivityLog::with(['user:id,name,email'])->latest();

        $logs = $logQuery->limit(10)->get()->map(function ($log) {
            $actor = $log->user ? $log->user->name : 'System';
            $category = $this->determineActivityCategory($log->action);
            $icon = $this->determineActivityIcon($log->action);

            return [
                'id' => $log->id,
                'action' => $log->action,
                'description' => $log->description ?: 'System action executed',
                'actor' => $actor,
                'category' => $category,
                'icon' => $icon,
                'created_at' => $log->created_at ? $log->created_at->toIso8601String() : null,
                'time_formatted' => $log->created_at ? $log->created_at->diffForHumans() : 'Recently',
            ];
        });

        return $logs;
    }

    private function formatTimeValue($time): ?string
    {
        if (!$time) return null;
        if ($time instanceof Carbon) {
            return $time->format('H:i');
        }
        $str = (string) $time;
        if (preg_match('/(\d{1,2}:\d{2})/', $str, $matches)) {
            return str_pad($matches[1], 5, '0', STR_PAD_LEFT);
        }
        return substr($str, 0, 5);
    }

    private function calculateDurationHours($start, $end): ?float
    {
        $startTime = $this->formatTimeValue($start);
        $endTime = $this->formatTimeValue($end);
        if (!$startTime || !$endTime) return null;
        try {
            $sh = (int) substr($startTime, 0, 2);
            $sm = (int) substr($startTime, 3, 2);
            $eh = (int) substr($endTime, 0, 2);
            $em = (int) substr($endTime, 3, 2);
            $minutes = ($eh * 60 + $em) - ($sh * 60 + $sm);
            return $minutes > 0 ? round($minutes / 60, 1) : null;
        } catch (\Throwable $e) {
            return null;
        }
    }

    private function determineActivityCategory(string $action): string
    {
        if (str_contains($action, 'collection') || str_contains($action, 'schedule') || str_contains($action, 'route') || str_contains($action, 'truck')) {
            return 'collection';
        }
        if (str_contains($action, 'inspection') || str_contains($action, 'compliance')) {
            return 'inspection';
        }
        if (str_contains($action, 'report')) {
            return 'report';
        }
        if (str_contains($action, 'vendor')) {
            return 'vendor';
        }
        if (str_contains($action, 'auth') || str_contains($action, 'user')) {
            return 'user';
        }
        return 'general';
    }

    private function determineActivityIcon(string $action): string
    {
        if (str_contains($action, 'collection') || str_contains($action, 'route') || str_contains($action, 'truck')) {
            return 'truck';
        }
        if (str_contains($action, 'schedule')) {
            return 'calendar';
        }
        if (str_contains($action, 'inspection')) {
            return 'clipboard-check';
        }
        if (str_contains($action, 'report')) {
            return 'alert-circle';
        }
        if (str_contains($action, 'vendor')) {
            return 'store';
        }
        if (str_contains($action, 'auth') || str_contains($action, 'user')) {
            return 'user';
        }
        return 'activity';
    }
}
