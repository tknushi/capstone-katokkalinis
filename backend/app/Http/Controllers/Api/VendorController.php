<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VendorController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | GET ALL VENDORS
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        $query = Vendor::with(['user', 'barangay']);

        /*
        |--------------------------------------------------------------------------
        | SEARCH
        |--------------------------------------------------------------------------
        */

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('vendor_code', 'like', "%{$search}%")
                    ->orWhere('business_name', 'like', "%{$search}%")
                    ->orWhere('owner_name', 'like', "%{$search}%")
                    ->orWhere('market', 'like', "%{$search}%")
                    ->orWhere('stall_number', 'like', "%{$search}%");
            });
        }

        /*
        |--------------------------------------------------------------------------
        | STATUS FILTER
        |--------------------------------------------------------------------------
        */

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        /*
        |--------------------------------------------------------------------------
        | BARANGAY FILTER
        |--------------------------------------------------------------------------
        */

        if ($request->filled('barangay_id')) {
            $query->where('barangay_id', $request->barangay_id);
        }

        $vendors = $query
            ->latest('id')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Vendors retrieved successfully.',
            'count' => $vendors->count(),
            'vendors' => $vendors,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | CREATE VENDOR
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'nullable|exists:users,id',
            'barangay_id' => 'nullable|exists:barangays,id',

            'vendor_code' => 'required|string|max:255|unique:vendors,vendor_code',

            'business_name' => 'required|string|max:255',
            'owner_name' => 'required|string|max:255',

            'market' => 'nullable|string|max:255',
            'stall_number' => 'nullable|string|max:255',

            'contact_number' => 'nullable|string|max:255',
            'address' => 'nullable|string',

            'qr_code' => 'nullable|string|max:255|unique:vendors,qr_code',

            'status' => 'nullable|in:active,inactive,suspended',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please check the vendor information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $vendor = Vendor::create([
            'user_id' => $request->user_id,
            'barangay_id' => $request->barangay_id,

            'vendor_code' => $request->vendor_code,
            'business_name' => $request->business_name,
            'owner_name' => $request->owner_name,

            'market' => $request->market,
            'stall_number' => $request->stall_number,

            'contact_number' => $request->contact_number,
            'address' => $request->address,

            'qr_code' => $request->qr_code,

            'status' => $request->status ?? 'active',
        ]);

        $vendor->load(['user', 'barangay']);

        ActivityLog::record(
            'vendor.created',
            "Added vendor {$vendor->business_name} ({$vendor->vendor_code}).",
            $vendor
        );

        return response()->json([
            'success' => true,
            'message' => 'Vendor created successfully.',
            'vendor' => $vendor,
        ], 201);
    }


    /*
    |--------------------------------------------------------------------------
    | GET SINGLE VENDOR
    |--------------------------------------------------------------------------
    */

    public function show($id)
    {
        $vendor = Vendor::with([
            'user',
            'barangay',
            'inspections',
        ])->find($id);

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Vendor retrieved successfully.',
            'vendor' => $vendor,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE VENDOR
    |--------------------------------------------------------------------------
    */

    public function update(Request $request, $id)
    {
        $vendor = Vendor::find($id);

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor not found.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'user_id' => 'nullable|exists:users,id',
            'barangay_id' => 'nullable|exists:barangays,id',

            'vendor_code' => 'sometimes|required|string|max:255|unique:vendors,vendor_code,' . $id,

            'business_name' => 'sometimes|required|string|max:255',
            'owner_name' => 'sometimes|required|string|max:255',

            'market' => 'nullable|string|max:255',
            'stall_number' => 'nullable|string|max:255',

            'contact_number' => 'nullable|string|max:255',
            'address' => 'nullable|string',

            'qr_code' => 'nullable|string|max:255|unique:vendors,qr_code,' . $id,

            'status' => 'sometimes|required|in:active,inactive,suspended',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please check the vendor information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $vendor->update($request->only([
            'user_id',
            'barangay_id',
            'vendor_code',
            'business_name',
            'owner_name',
            'market',
            'stall_number',
            'contact_number',
            'address',
            'qr_code',
            'status',
        ]));

        $vendor->load(['user', 'barangay']);

        ActivityLog::record(
            'vendor.updated',
            "Updated vendor {$vendor->business_name} ({$vendor->vendor_code}).",
            $vendor
        );

        return response()->json([
            'success' => true,
            'message' => 'Vendor updated successfully.',
            'vendor' => $vendor,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE VENDOR STATUS
    |--------------------------------------------------------------------------
    */

    public function updateStatus(Request $request, $id)
    {
        $vendor = Vendor::find($id);

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor not found.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:active,inactive,suspended',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid vendor status.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $vendor->status = $request->status;
        $vendor->save();

        ActivityLog::record(
            'vendor.status_updated',
            "Set vendor {$vendor->business_name} status to {$vendor->status}.",
            $vendor
        );

        return response()->json([
            'success' => true,
            'message' => 'Vendor status updated successfully.',
            'vendor' => $vendor,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | DELETE VENDOR
    |--------------------------------------------------------------------------
    */

    public function destroy($id)
    {
        $vendor = Vendor::find($id);

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor not found.',
            ], 404);
        }

        $name = $vendor->business_name;
        $vendor->delete();

        ActivityLog::record(
            'vendor.deleted',
            "Deleted vendor {$name}."
        );

        return response()->json([
            'success' => true,
            'message' => 'Vendor deleted successfully.',
        ]);
    }
}