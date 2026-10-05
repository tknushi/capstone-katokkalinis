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
            ->orderBy('id')
            ->get();

        $zones = [
            'All Barangays (Barangay 1-40)' => [
                'zone'          => 'All Barangays (Barangay 1-40)',
                'barangays'     => [],
                'total_vendors' => 0,
                'total_reports' => 0,
            ],
            'Sector North (Barangay 1-10)' => [
                'zone'          => 'Sector North (Barangay 1-10)',
                'barangays'     => [],
                'total_vendors' => 0,
                'total_reports' => 0,
            ],
            'Sector South (Barangay 11-20)' => [
                'zone'          => 'Sector South (Barangay 11-20)',
                'barangays'     => [],
                'total_vendors' => 0,
                'total_reports' => 0,
            ],
            'Sector East (Barangay 21-30)' => [
                'zone'          => 'Sector East (Barangay 21-30)',
                'barangays'     => [],
                'total_vendors' => 0,
                'total_reports' => 0,
            ],
            'Sector West (Barangay 31-40)' => [
                'zone'          => 'Sector West (Barangay 31-40)',
                'barangays'     => [],
                'total_vendors' => 0,
                'total_reports' => 0,
            ],
            'Cogon Market Zone' => [
                'zone'          => 'Cogon Market Zone',
                'barangays'     => [],
                'total_vendors' => 0,
                'total_reports' => 0,
            ],
            'Carmen Market Zone' => [
                'zone'          => 'Carmen Market Zone',
                'barangays'     => [],
                'total_vendors' => 0,
                'total_reports' => 0,
            ],
        ];

        foreach ($barangays as $brgy) {
            $item = [
                'id'          => $brgy->id,
                'name'        => $brgy->name,
                'code'        => $brgy->code,
                'vendors'     => $brgy->vendors_count,
                'reports'     => $brgy->reports_count,
                'latitude'    => $brgy->latitude,
                'longitude'   => $brgy->longitude,
                'description' => $brgy->description,
            ];

            // Barangay 1 to 40 assignment
            if (preg_match('/^Barangay\s+([1-9]|[1-3][0-9]|40)\b/i', $brgy->name, $m)) {
                $num = (int) $m[1];
                $zones['All Barangays (Barangay 1-40)']['barangays'][] = $item;
                $zones['All Barangays (Barangay 1-40)']['total_vendors'] += $brgy->vendors_count;
                $zones['All Barangays (Barangay 1-40)']['total_reports'] += $brgy->reports_count;

                if ($num >= 1 && $num <= 10) {
                    $zones['Sector North (Barangay 1-10)']['barangays'][] = $item;
                    $zones['Sector North (Barangay 1-10)']['total_vendors'] += $brgy->vendors_count;
                    $zones['Sector North (Barangay 1-10)']['total_reports'] += $brgy->reports_count;
                } elseif ($num >= 11 && $num <= 20) {
                    $zones['Sector South (Barangay 11-20)']['barangays'][] = $item;
                    $zones['Sector South (Barangay 11-20)']['total_vendors'] += $brgy->vendors_count;
                    $zones['Sector South (Barangay 11-20)']['total_reports'] += $brgy->reports_count;
                } elseif ($num >= 21 && $num <= 30) {
                    $zones['Sector East (Barangay 21-30)']['barangays'][] = $item;
                    $zones['Sector East (Barangay 21-30)']['total_vendors'] += $brgy->vendors_count;
                    $zones['Sector East (Barangay 21-30)']['total_reports'] += $brgy->reports_count;
                } elseif ($num >= 31 && $num <= 40) {
                    $zones['Sector West (Barangay 31-40)']['barangays'][] = $item;
                    $zones['Sector West (Barangay 31-40)']['total_vendors'] += $brgy->vendors_count;
                    $zones['Sector West (Barangay 31-40)']['total_reports'] += $brgy->reports_count;
                }
            }

            // Markets assignment
            $lower = strtolower($brgy->name);
            if (str_contains($lower, 'cogon') || in_array($brgy->name, ['Barangay 33', 'Barangay 39', 'Barangay 40'])) {
                $zones['Cogon Market Zone']['barangays'][] = $item;
                $zones['Cogon Market Zone']['total_vendors'] += $brgy->vendors_count;
                $zones['Cogon Market Zone']['total_reports'] += $brgy->reports_count;
            }
            if (str_contains($lower, 'carmen')) {
                $zones['Carmen Market Zone']['barangays'][] = $item;
                $zones['Carmen Market Zone']['total_vendors'] += $brgy->vendors_count;
                $zones['Carmen Market Zone']['total_reports'] += $brgy->reports_count;
            }
        }

        $filtered = array_values(array_filter($zones, fn ($z) => count($z['barangays']) > 0));

        return response()->json([
            'success' => true,
            'message' => 'Barangay analytics retrieved successfully.',
            'zones'   => $filtered,
            'totals'  => [
                'barangays' => $barangays->count(),
                'vendors'   => $barangays->sum('vendors_count'),
                'reports'   => $barangays->sum('reports_count'),
            ],
        ]);
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
