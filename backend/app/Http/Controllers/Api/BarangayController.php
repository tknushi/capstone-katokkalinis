<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Barangay;

class BarangayController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | GET ALL BARANGAYS
    |--------------------------------------------------------------------------
    |
    | Read-only listing used to populate dropdowns (vendors, schedules, etc.)
    | in the admin web dashboard.
    |
    */

    public function index()
    {
        $barangays = \Illuminate\Support\Facades\Cache::remember('all_barangays_list', 300, function () {
            return Barangay::select('id', 'name')->orderBy('name')->get();
        });

        return response()->json([
            'success' => true,
            'message' => 'Barangays retrieved successfully.',
            'barangays' => $barangays,
        ]);
    }
}
