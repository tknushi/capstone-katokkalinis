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
        $barangays = Barangay::orderBy('name')->get();

        return response()->json([
            'success' => true,
            'message' => 'Barangays retrieved successfully.',
            'barangays' => $barangays,
        ]);
    }
}
