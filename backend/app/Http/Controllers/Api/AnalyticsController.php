<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Barangay;
use App\Models\Contractor;
use App\Models\Inspection;
use App\Models\Report;
use App\Models\Truck;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | DASHBOARD OVERVIEW
    |--------------------------------------------------------------------------
    */

    public function overview()
    {
        return response()->json([
            'success' => true,
            'message' => 'Analytics retrieved successfully.',

            'totals' => [
                'employees'   => User::whereHas('roles', fn ($q) => $q->where('name', 'driver'))->count(),
                'contractors' => Contractor::count(),
                'vendors'     => Vendor::count(),
                'reports'     => Report::count(),
                'trucks'      => Truck::count(),
            ],

            'reports_by_status' => Report::select('status', DB::raw('count(*) as total'))
                ->groupBy('status')
                ->pluck('total', 'status'),

            'trucks_by_status' => Truck::select('status', DB::raw('count(*) as total'))
                ->groupBy('status')
                ->pluck('total', 'status'),

            'employee_attendance' => $this->employeeAttendanceSummary(),

            'barangay_stats' => $this->barangayStats(),

            'market_compliance' => $this->marketCompliance(),
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | BARANGAY ANALYTICS — Drill-Down Endpoint
    |--------------------------------------------------------------------------
    |
    | Returns all barangays grouped into CDO zones, with vendor/report counts
    | and GPS coordinates for the static location map pin.
    |
    */

    public function barangayAnalytics()
    {
        $barangays = Barangay::withCount(['vendors', 'reports'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $zones = [];

        foreach ($barangays as $brgy) {
            $zone = $this->detectZone($brgy->name);

            if (!isset($zones[$zone])) {
                $zones[$zone] = [
                    'zone'          => $zone,
                    'barangays'     => [],
                    'total_vendors' => 0,
                    'total_reports' => 0,
                ];
            }

            $zones[$zone]['barangays'][] = [
                'id'          => $brgy->id,
                'name'        => $brgy->name,
                'code'        => $brgy->code,
                'vendors'     => $brgy->vendors_count,
                'reports'     => $brgy->reports_count,
                'latitude'    => $brgy->latitude,
                'longitude'   => $brgy->longitude,
                'description' => $brgy->description,
            ];

            $zones[$zone]['total_vendors'] += $brgy->vendors_count;
            $zones[$zone]['total_reports'] += $brgy->reports_count;
        }

        // Sort zones into the preferred CDO display order
        $zoneOrder = [
            'Cogon Market Zone',
            'Carmen Market Zone',
            'Sector North (Barangay 1-10)',
            'Sector Central (Barangay 11-20)',
            'Sector East (Barangay 21-30)',
            'Sector Commercial (Barangay 31-40)',
            'Other',
        ];

        $sorted = [];
        foreach ($zoneOrder as $zoneName) {
            if (isset($zones[$zoneName])) {
                $sorted[] = $zones[$zoneName];
            }
        }

        // Append any zones not in the preferred order
        foreach ($zones as $zoneName => $zoneData) {
            $alreadyAdded = array_filter($sorted, fn ($z) => $z['zone'] === $zoneName);
            if (empty($alreadyAdded)) {
                $sorted[] = $zoneData;
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Barangay analytics retrieved successfully.',
            'zones'   => array_values($sorted),
            'totals'  => [
                'barangays' => $barangays->count(),
                'vendors'   => $barangays->sum('vendors_count'),
                'reports'   => $barangays->sum('reports_count'),
            ],
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | DETECT CDO ZONE FROM BARANGAY NAME
    |--------------------------------------------------------------------------
    */

    private function detectZone(string $name): string
    {
        $lower = strtolower($name);

        if (str_contains($lower, 'cogon')) {
            return 'Cogon Market Zone';
        }
        if (str_contains($lower, 'carmen')) {
            return 'Carmen Market Zone';
        }

        if (preg_match('/\b([1-9]|10)\b/', $name) && preg_match('/barangay|brgy/i', $name)) {
            return 'Sector North (Barangay 1-10)';
        }
        if (preg_match('/\b(1[1-9]|20)\b/', $name) && preg_match('/barangay|brgy/i', $name)) {
            return 'Sector Central (Barangay 11-20)';
        }
        if (preg_match('/\b(2[1-9]|30)\b/', $name) && preg_match('/barangay|brgy/i', $name)) {
            return 'Sector East (Barangay 21-30)';
        }
        if (preg_match('/\b(3[1-9]|40)\b/', $name) && preg_match('/barangay|brgy/i', $name)) {
            return 'Sector Commercial (Barangay 31-40)';
        }

        return 'Other';
    }


    /*
    |--------------------------------------------------------------------------
    | EMPLOYEE PERFORMANCE (attendance-based)
    |--------------------------------------------------------------------------
    */

    private function employeeAttendanceSummary()
    {
        $employees = User::whereHas('roles', fn ($q) => $q->where('name', 'driver'))->get();

        return $employees->map(function ($employee) {
            $records = Attendance::where('user_id', $employee->id)->get();

            return [
                'id'         => $employee->id,
                'name'       => $employee->name,
                'present'    => $records->where('status', 'present')->count(),
                'late'       => $records->where('status', 'late')->count(),
                'absent'     => $records->where('status', 'absent')->count(),
                'on_leave'   => $records->where('status', 'on_leave')->count(),
                'total_days' => $records->count(),
            ];
        })->values();
    }


    /*
    |--------------------------------------------------------------------------
    | BARANGAY-LEVEL ANALYTICS
    |--------------------------------------------------------------------------
    */

    private function barangayStats()
    {
        $barangays = Barangay::withCount(['vendors', 'reports'])->get();

        return $barangays->map(function ($barangay) {
            return [
                'id'      => $barangay->id,
                'name'    => $barangay->name,
                'vendors' => $barangay->vendors_count,
                'reports' => $barangay->reports_count,
            ];
        })->values();
    }


    /*
    |--------------------------------------------------------------------------
    | MARKET COMPLIANCE SUMMARY
    |--------------------------------------------------------------------------
    */

    private function marketCompliance()
    {
        $flagged = Inspection::where('total_score', '<=', InspectionController::COMPLIANCE_FLAG_THRESHOLD)->count();
        $total   = Inspection::count();

        return [
            'total_inspections' => $total,
            'flagged_markets'   => $flagged,
            'threshold'         => InspectionController::COMPLIANCE_FLAG_THRESHOLD,
        ];
    }
}
