<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\CollectionRoute;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CollectionRouteController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | GET COLLECTION ROUTES (used live and for the Archives view)
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        $query = CollectionRoute::with([
            'truck:id,truck_number,plate_number,driver_id',
            'truck.driver:id,name',
            'barangay:id,name',
        ]);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('barangay_id')) {
            $query->where('barangay_id', $request->barangay_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('collection_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('collection_date', '<=', $request->date_to);
        }

        $routes = $query
            ->latest('collection_date')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Collection routes retrieved successfully.',
            'count' => $routes->count(),
            'routes' => $routes,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | CREATE COLLECTION ROUTE
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'truck_id' => 'required|exists:trucks,id',
            'barangay_id' => 'required|exists:barangays,id',
            'collection_date' => 'required|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
            'status' => 'nullable|in:pending,in_progress,completed,cancelled',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please check the collection route information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $route = CollectionRoute::create([
            'truck_id' => $request->truck_id,
            'barangay_id' => $request->barangay_id,
            'collection_date' => $request->collection_date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'status' => $request->status ?? 'pending',
            'notes' => $request->notes,
        ]);

        $route->load(['truck:id,truck_number,plate_number,driver_id', 'truck.driver:id,name', 'barangay:id,name']);

        ActivityLog::record(
            'collection_route.created',
            "Scheduled collection route for {$route->collection_date} (truck #{$route->truck_id}).",
            $route
        );

        return response()->json([
            'success' => true,
            'message' => 'Collection route created successfully.',
            'route' => $route,
        ], 201);
    }


    /*
    |--------------------------------------------------------------------------
    | GET SINGLE COLLECTION ROUTE
    |--------------------------------------------------------------------------
    */

    public function show($id)
    {
        $route = CollectionRoute::with([
            'truck:id,truck_number,plate_number,driver_id',
            'truck.driver:id,name',
            'barangay:id,name',
        ])->find($id);

        if (!$route) {
            return response()->json([
                'success' => false,
                'message' => 'Collection route not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'route' => $route,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE COLLECTION ROUTE
    |--------------------------------------------------------------------------
    */

    public function update(Request $request, $id)
    {
        $route = CollectionRoute::find($id);

        if (!$route) {
            return response()->json([
                'success' => false,
                'message' => 'Collection route not found.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'truck_id' => 'sometimes|required|exists:trucks,id',
            'barangay_id' => 'sometimes|required|exists:barangays,id',
            'collection_date' => 'sometimes|required|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
            'status' => 'sometimes|required|in:pending,in_progress,completed,cancelled',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please check the collection route information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $route->update($request->only([
            'truck_id',
            'barangay_id',
            'collection_date',
            'start_time',
            'end_time',
            'status',
            'notes',
        ]));

        $route->load(['truck:id,truck_number,plate_number', 'barangay:id,name']);

        ActivityLog::record(
            'collection_route.updated',
            "Updated collection route #{$route->id}.",
            $route
        );

        return response()->json([
            'success' => true,
            'message' => 'Collection route updated successfully.',
            'route' => $route,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | DELETE COLLECTION ROUTE
    |--------------------------------------------------------------------------
    */

    public function destroy($id)
    {
        $route = CollectionRoute::find($id);

        if (!$route) {
            return response()->json([
                'success' => false,
                'message' => 'Collection route not found.',
            ], 404);
        }

        $route->delete();

        ActivityLog::record(
            'collection_route.deleted',
            "Deleted collection route #{$id}."
        );

        return response()->json([
            'success' => true,
            'message' => 'Collection route deleted successfully.',
        ]);
    }
}
