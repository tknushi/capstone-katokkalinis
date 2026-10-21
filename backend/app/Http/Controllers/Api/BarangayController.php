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
        // Return unique barangays by name with canonical IDs (1–40 prioritized)
        $barangays = Barangay::orderBy('id')->get()->unique('name')->values();

        return response()->json([
            'success' => true,
            'message' => 'Barangays retrieved successfully.',
            'barangays' => $barangays,
        ]);
    }
}
