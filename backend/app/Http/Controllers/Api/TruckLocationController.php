<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Truck;
use App\Models\TruckLocation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TruckLocationController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | GET LOCATION HISTORY FOR A TRUCK
    |--------------------------------------------------------------------------
    */

    public function index($truckId)
    {
        $truck = Truck::find($truckId);

        if (!$truck) {
            return response()->json([
                'success' => false,
                'message' => 'Truck not found.',
            ], 404);
        }

        $locations = $truck->locations()
            ->latest('recorded_at')
            ->limit(50)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Truck locations retrieved successfully.',
            'locations' => $locations,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | RECORD A NEW LOCATION PING FOR A TRUCK
    |--------------------------------------------------------------------------
    */

    public function store(Request $request, $truckId)
    {
        $truck = Truck::find($truckId);

        if (!$truck) {
            return response()->json([
                'success' => false,
                'message' => 'Truck not found.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'speed' => 'nullable|numeric|min:0',
            'heading' => 'nullable|numeric|min:0|max:360',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide a valid location.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $location = TruckLocation::create([
            'truck_id' => $truck->id,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'speed' => $request->speed,
            'heading' => $request->heading,
            'recorded_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Truck location recorded successfully.',
            'location' => $location,
        ], 201);
    }
}
