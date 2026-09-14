<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Truck;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TruckController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | GET ALL TRUCKS (with latest known location)
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        $query = Truck::with([
            'driver:id,name,email',
            'contractor:id,company_name',
            'locations' => function ($q) {
                $q->latest('recorded_at')->limit(1);
            },
        ]);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $trucks = $query
            ->orderBy('truck_number')
            ->get()
            ->map(function ($truck) {
                $truck->latest_location = $truck->locations->first();
                unset($truck->locations);
                return $truck;
            });

        return response()->json([
            'success' => true,
            'message' => 'Trucks retrieved successfully.',
            'count' => $trucks->count(),
            'trucks' => $trucks,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | CREATE TRUCK
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'truck_number' => 'required|string|max:255|unique:trucks,truck_number',
            'plate_number' => 'required|string|max:255|unique:trucks,plate_number',
            'driver_id' => 'nullable|exists:users,id',
            'contractor_id' => 'nullable|exists:contractors,id',
            'truck_type' => 'nullable|string|max:255',
            'status' => 'nullable|in:available,on_route,maintenance,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please check the truck information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $truck = Truck::create([
            'truck_number' => $request->truck_number,
            'plate_number' => $request->plate_number,
            'driver_id' => $request->driver_id,
            'contractor_id' => $request->contractor_id,
            'truck_type' => $request->truck_type,
            'status' => $request->status ?? 'available',
        ]);

        $truck->load(['driver:id,name,email', 'contractor:id,company_name']);

        ActivityLog::record(
            'truck.created',
            "Added truck {$truck->truck_number} ({$truck->plate_number}).",
            $truck
        );

        return response()->json([
            'success' => true,
            'message' => 'Truck created successfully.',
            'truck' => $truck,
        ], 201);
    }


    /*
    |--------------------------------------------------------------------------
    | GET SINGLE TRUCK
    |--------------------------------------------------------------------------
    */

    public function show($id)
    {
        $truck = Truck::with([
            'driver:id,name,email',
            'contractor:id,company_name',
            'locations' => function ($q) {
                $q->latest('recorded_at')->limit(20);
            },
        ])->find($id);

        if (!$truck) {
            return response()->json([
                'success' => false,
                'message' => 'Truck not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'truck' => $truck,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE TRUCK
    |--------------------------------------------------------------------------
    */

    public function update(Request $request, $id)
    {
        $truck = Truck::find($id);

        if (!$truck) {
            return response()->json([
                'success' => false,
                'message' => 'Truck not found.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'truck_number' => 'sometimes|required|string|max:255|unique:trucks,truck_number,' . $id,
            'plate_number' => 'sometimes|required|string|max:255|unique:trucks,plate_number,' . $id,
            'driver_id' => 'nullable|exists:users,id',
            'contractor_id' => 'nullable|exists:contractors,id',
            'truck_type' => 'nullable|string|max:255',
            'status' => 'sometimes|required|in:available,on_route,maintenance,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please check the truck information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $truck->update($request->only([
            'truck_number',
            'plate_number',
            'driver_id',
            'contractor_id',
            'truck_type',
            'status',
        ]));

        $truck->load(['driver:id,name,email', 'contractor:id,company_name']);

        ActivityLog::record(
            'truck.updated',
            "Updated truck {$truck->truck_number}.",
            $truck
        );

        return response()->json([
            'success' => true,
            'message' => 'Truck updated successfully.',
            'truck' => $truck,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE TRUCK STATUS
    |--------------------------------------------------------------------------
    */

    public function updateStatus(Request $request, $id)
    {
        $truck = Truck::find($id);

        if (!$truck) {
            return response()->json([
                'success' => false,
                'message' => 'Truck not found.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:available,on_route,maintenance,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid truck status.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $truck->status = $request->status;
        $truck->save();

        ActivityLog::record(
            'truck.status_updated',
            "Set truck {$truck->truck_number} status to {$truck->status}.",
            $truck
        );

        return response()->json([
            'success' => true,
            'message' => 'Truck status updated successfully.',
            'truck' => $truck,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | DELETE TRUCK
    |--------------------------------------------------------------------------
    */

    public function destroy($id)
    {
        $truck = Truck::find($id);

        if (!$truck) {
            return response()->json([
                'success' => false,
                'message' => 'Truck not found.',
            ], 404);
        }

        $number = $truck->truck_number;
        $truck->delete();

        ActivityLog::record(
            'truck.deleted',
            "Deleted truck {$number}."
        );

        return response()->json([
            'success' => true,
            'message' => 'Truck deleted successfully.',
        ]);
    }
}
