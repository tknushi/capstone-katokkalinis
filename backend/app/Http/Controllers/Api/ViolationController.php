<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vendor;
use App\Models\Violation;
use Illuminate\Http\Request;

class ViolationController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | GET VIOLATIONS
    |--------------------------------------------------------------------------
    */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Violation::with(['vendor', 'inspection'])->latest();

        $isVendor = $user->roles()->where('name', 'vendor')->exists();

        if ($isVendor) {
            $vendor = Vendor::where('user_id', $user->id)->first();
            if ($vendor) {
                $query->where('vendor_id', $vendor->id);
            } else {
                return response()->json([
                    'success' => true,
                    'violations' => [],
                ]);
            }
        } elseif ($request->filled('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
        }

        $violations = $query->get();

        return response()->json([
            'success' => true,
            'message' => 'Violations retrieved successfully.',
            'violations' => $violations,
        ]);
    }
}
