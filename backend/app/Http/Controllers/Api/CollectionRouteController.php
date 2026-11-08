<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Barangay;
use App\Models\CollectionLog;
use App\Models\CollectionRoute;
use App\Models\CollectionRouteStop;
use App\Models\CollectionSchedule;
use App\Models\Notification;
use App\Models\Report;
use App\Models\Truck;
use App\Models\User;
use App\Services\PushNotificationService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class CollectionRouteController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | GET FORM OPTIONS (Vehicles, Personnel, Barangays)
    |--------------------------------------------------------------------------
    */
    public function options()
    {
        $trucks = Truck::with('driver:id,name,email')
            ->orderBy('id')
            ->get()
            ->map(function (Truck $t) {
                return [
                    'id' => $t->id,
                    'truck_number' => $t->truck_number,
                    'plate_number' => $t->plate_number,
                    'truck_type' => $t->truck_type ?? 'Compactor Truck',
                    'status' => $t->status ?? 'available',
                    'driver_id' => $t->driver_id,
                    'driver_name' => $t->driver?->name ?? 'Assigned Driver',
                    'label' => "{$t->truck_number} ({$t->plate_number})",
                ];
            });

        $personnel = User::where('is_archived', false)
            ->orderBy('name')
            ->get(['id', 'name', 'email'])
            ->map(function (User $u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                ];
            });

        $barangays = Barangay::orderBy('id')
            ->limit(40)
            ->get(['id', 'name']);

        return response()->json([
            'success' => true,
            'vehicles' => $trucks,
            'personnel' => $personnel,
            'barangays' => $barangays,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | GET COLLECTION ROUTES (Website Admin, Driver Mobile, Resident Mobile)
    |--------------------------------------------------------------------------
    */
    public function index(Request $request)
    {
        $query = CollectionRoute::with([
            'truck:id,truck_number,plate_number,truck_type,status,driver_id',
            'truck.driver:id,name',
            'assignedPersonnel:id,name,email',
            'barangay:id,name',
            'stops',
        ]);

        if ($request->filled('status') && strtolower($request->status) !== 'all') {
            $statusParam = strtolower(trim($request->status));
            if ($statusParam === 'scheduled' || $statusParam === 'pending') {
                $query->whereIn('status', ['scheduled', 'pending']);
            } elseif ($statusParam === 'ongoing' || $statusParam === 'in_progress') {
                $query->whereIn('status', ['ongoing', 'in_progress']);
            } else {
                $query->where('status', $statusParam);
            }
        }

        // Filter by Assigned Driver / Truck (for Driver Mobile Module)
        $driverId = $request->input('driver_id') ?? $request->input('assigned_personnel_id');
        $truckId = $request->input('truck_id');
        $plateNumber = $request->input('plate_number');

        if ($driverId || $truckId || $plateNumber) {
            $query->where(function ($q) use ($driverId, $truckId, $plateNumber) {
                if ($driverId) {
                    $q->orWhere('assigned_personnel_id', (int) $driverId)
                      ->orWhereHas('truck', function ($tq) use ($driverId) {
                          $tq->where('driver_id', (int) $driverId);
                      });
                }
                if ($truckId) {
                    $q->orWhere('truck_id', (int) $truckId);
                }
                if ($plateNumber) {
                    $q->orWhereHas('truck', function ($tq) use ($plateNumber) {
                        $tq->where('plate_number', $plateNumber)
                           ->orWhere('truck_number', $plateNumber);
                    });
                }
            });
        }

        // Filter by Barangay (matches primary barangay_id OR any stop in collection_route_stops)
        $matchingIds = ScheduleController::resolveBarangayFilterIds($request);
        if (!empty($matchingIds)) {
            $barangayNames = Barangay::whereIn('id', $matchingIds)->pluck('name')->toArray();
            $query->where(function ($q) use ($matchingIds, $barangayNames) {
                $q->whereIn('barangay_id', $matchingIds);
                if (!empty($barangayNames)) {
                    $q->orWhereHas('stops', function ($sq) use ($barangayNames) {
                        $sq->where(function ($inner) use ($barangayNames) {
                            foreach ($barangayNames as $bName) {
                                $inner->orWhere('location_name', $bName)
                                      ->orWhere('location_name', 'like', $bName . ' %')
                                      ->orWhere('location_name', 'like', '% ' . $bName);
                            }
                        });
                    });
                }
            });
        }

        if ($request->filled('date_from')) {
            $query->whereDate('collection_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('collection_date', '<=', $request->date_to);
        }

        $routes = $query
            ->orderByDesc('collection_date')
            ->orderByDesc('id')
            ->get()
            ->map(function (CollectionRoute $route) {
                return self::enrichRouteItem($route);
            });

        return response()->json([
            'success' => true,
            'message' => 'Collection routes retrieved successfully.',
            'timezone' => 'Asia/Manila',
            'count' => $routes->count(),
            'routes' => $routes,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE COLLECTION ROUTE (Website Admin / CLENRO Dashboard)
    |--------------------------------------------------------------------------
    */
    public function store(Request $request)
    {
        $normalizedTime = self::parseTo24HourTime($request->input('start_time'));
        $rawStops = $request->input('collection_stops', $request->input('route_stops', []));
        $stopCount = is_array($rawStops) ? max(1, count($rawStops)) : 1;

        // Support travel_duration_minutes + collection_duration_minutes OR stop_duration_minutes
        $defaultStopMins = (int) $request->input('stop_duration_minutes', 20);
        if ($request->filled('collection_duration_minutes') && !$request->filled('stop_duration_minutes')) {
            $defaultStopMins = max(5, (int) round(((int) $request->input('collection_duration_minutes')) / $stopCount));
        }

        $parsedStops = self::normalizeStopsInput($rawStops, $defaultStopMins);

        $payload = $request->all();
        if ($normalizedTime !== null) {
            $payload['start_time'] = $normalizedTime;
        }
        $payload['collection_stops'] = $parsedStops;
        if (isset($payload['status'])) {
            $payload['status'] = self::normalizeStatusValue($payload['status']);
        }

        // Resolve canonical barangay_id in DB (from request or first barangay stop)
        $resolvedIds = ScheduleController::resolveBarangayFilterIds($request);
        if (!empty($resolvedIds)) {
            $payload['barangay_id'] = $resolvedIds[0];
        } elseif (!empty($parsedStops[0]['name'])) {
            $firstStopBrgy = self::resolveBarangayFromStopName($parsedStops[0]['name']);
            if ($firstStopBrgy) {
                $payload['barangay_id'] = $firstStopBrgy->id;
            }
        }

        if (empty($payload['barangay_id'])) {
            $payload['barangay_id'] = Barangay::orderBy('id')->value('id') ?? 1;
        } else {
            $existsBrgy = Barangay::find($payload['barangay_id']);
            if (!$existsBrgy) {
                $byName = Barangay::where('name', 'Barangay ' . (int) $payload['barangay_id'])->orderBy('id')->first();
                if ($byName) {
                    $payload['barangay_id'] = $byName->id;
                }
            }
        }

        if (empty($payload['truck_id'])) {
            $payload['truck_id'] = Truck::orderBy('id')->value('id') ?? 1;
        }

        $validator = Validator::make($payload, [
            'route_name' => 'nullable|string|max:255',
            'truck_id' => 'required|exists:trucks,id',
            'assigned_personnel_id' => 'nullable|exists:users,id',
            'barangay_id' => 'required|exists:barangays,id',
            'start_location' => 'required|string|min:2|max:255',
            'end_location' => 'required|string|min:2|max:255',
            'collection_stops' => 'required|array|min:1',
            'collection_stops.*.name' => 'required|string|min:1|max:255',
            'distance_km' => 'nullable|numeric|min:0.5|max:500',
            'travel_duration_minutes' => 'nullable|integer|min:5|max:1440',
            'collection_duration_minutes' => 'nullable|integer|min:5|max:1440',
            'stop_duration_minutes' => 'nullable|integer|min:5|max:480',
            'estimated_duration_minutes' => 'nullable|integer|min:10|max:1440',
            'collection_date' => 'required|date',
            'start_time' => ['required', 'regex:/^([01]\d|2[0-3]):([0-5]\d)$/'],
            'status' => 'nullable|in:scheduled,ongoing,completed,delayed,pending,in_progress,cancelled',
            'notes' => 'nullable|string',
        ], [
            'start_location.required' => 'Starting location is required.',
            'end_location.required' => 'Destination / end location is required.',
            'collection_stops.required' => 'At least one barangay collection stop is required.',
            'collection_stops.min' => 'Please add at least one barangay collection stop along the route.',
            'start_time.required' => 'Starting time is required.',
            'start_time.regex' => 'Invalid starting time format. Use HH:MM (e.g. 09:00) or 9:00 AM.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first() ?: 'Please check the collection route information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Compute travel_duration_minutes & distance_km
        $travelMins = isset($payload['travel_duration_minutes']) && (int) $payload['travel_duration_minutes'] > 0
            ? (int) $payload['travel_duration_minutes']
            : null;
        $distanceKm = isset($payload['distance_km']) && (float) $payload['distance_km'] > 0
            ? (float) $payload['distance_km']
            : ($travelMins !== null ? round($travelMins / 4, 2) : 30.0);

        $stopDurationMins = $defaultStopMins;

        // Calculate explicit total duration if travel_duration_minutes or estimated_duration_minutes is given
        $explicitDuration = null;
        if (isset($payload['estimated_duration_minutes']) && (int) $payload['estimated_duration_minutes'] > 0) {
            $explicitDuration = (int) $payload['estimated_duration_minutes'];
        } elseif ($travelMins !== null) {
            $collectionMins = isset($payload['collection_duration_minutes']) && (int) $payload['collection_duration_minutes'] > 0
                ? (int) $payload['collection_duration_minutes']
                : array_sum(array_map(fn ($s) => (int) ($s['duration_minutes'] ?? $stopDurationMins), $parsedStops));
            $explicitDuration = $travelMins + $collectionMins;
        }

        $calc = self::calculateRouteSchedule(
            $payload['start_location'],
            $payload['end_location'],
            $payload['start_time'],
            $parsedStops,
            $distanceKm,
            $stopDurationMins,
            $explicitDuration
        );

        // Resolve assigned personnel from truck driver if not explicitly provided
        $assignedPersonnelId = $payload['assigned_personnel_id'] ?? null;
        if (!$assignedPersonnelId) {
            $truck = Truck::find($payload['truck_id']);
            if ($truck && $truck->driver_id) {
                $assignedPersonnelId = $truck->driver_id;
            }
        }

        $route = DB::transaction(function () use ($payload, $calc, $distanceKm, $stopDurationMins, $assignedPersonnelId) {
            $created = CollectionRoute::create([
                'route_name' => $payload['route_name'] ?? null,
                'truck_id' => $payload['truck_id'],
                'assigned_personnel_id' => $assignedPersonnelId,
                'barangay_id' => $payload['barangay_id'],
                'start_location' => trim($payload['start_location']),
                'end_location' => trim($payload['end_location']),
                'collection_stops' => $calc['stops'],
                'distance_km' => $distanceKm,
                'stop_duration_minutes' => $stopDurationMins,
                'estimated_duration_minutes' => $calc['estimated_duration_minutes'],
                'estimated_duration' => $calc['estimated_duration'],
                'collection_date' => Carbon::parse($payload['collection_date'], 'Asia/Manila')->toDateString(),
                'start_time' => $calc['start_time_24'] . ':00',
                'end_time' => $calc['estimated_arrival_24'] . ':00',
                'estimated_arrival_time' => $calc['estimated_arrival_24'] . ':00',
                'status' => $payload['status'] ?? 'scheduled',
                'notes' => $payload['notes'] ?? null,
            ]);

            self::syncRelationalStops($created, $calc['stops']);
            self::syncSchedulesAndNotifications($created, 'created');

            return $created;
        });

        $route->load([
            'truck:id,truck_number,plate_number,truck_type,status,driver_id',
            'truck.driver:id,name',
            'assignedPersonnel:id,name,email',
            'barangay:id,name',
            'stops',
        ]);

        try {
            ActivityLog::record(
                'collection_route.created',
                "Scheduled collection route #{$route->id} ({$route->start_location} to {$route->end_location}) on {$route->collection_date}.",
                $route
            );
        } catch (\Throwable) {
        }

        return response()->json([
            'success' => true,
            'message' => 'Collection route created and synchronized with Driver and Resident schedules.',
            'route' => self::enrichRouteItem($route),
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
            'truck:id,truck_number,plate_number,truck_type,status,driver_id',
            'truck.driver:id,name',
            'assignedPersonnel:id,name,email',
            'barangay:id,name',
            'stops',
        ])->find($id);

        if (!$route) {
            return response()->json([
                'success' => false,
                'message' => 'Collection route not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'route' => self::enrichRouteItem($route),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE COLLECTION ROUTE (Website Admin / CLENRO Dashboard)
    |--------------------------------------------------------------------------
    */
    public function update(Request $request, $id)
    {
        $route = CollectionRoute::with('stops')->find($id);

        if (!$route) {
            return response()->json([
                'success' => false,
                'message' => 'Collection route not found.',
            ], 404);
        }

        $payload = $request->all();

        if ($request->has('start_time')) {
            $normalizedTime = self::parseTo24HourTime($request->input('start_time'));
            $payload['start_time'] = $normalizedTime ?? 'INVALID_TIME';
        }

        $stopDurationMins = isset($payload['stop_duration_minutes'])
            ? (int) $payload['stop_duration_minutes']
            : ((int) ($route->stop_duration_minutes ?: 20));

        if ($request->has('collection_stops') || $request->has('route_stops')) {
            $rawStops = $request->input('collection_stops', $request->input('route_stops', []));
            $stopCount = is_array($rawStops) ? max(1, count($rawStops)) : 1;
            if ($request->filled('collection_duration_minutes') && !$request->filled('stop_duration_minutes')) {
                $stopDurationMins = max(5, (int) round(((int) $request->input('collection_duration_minutes')) / $stopCount));
            }
            $payload['collection_stops'] = self::normalizeStopsInput($rawStops, $stopDurationMins);
        }

        if (isset($payload['status'])) {
            $payload['status'] = self::normalizeStatusValue($payload['status']);
        }

        if (!empty($payload['barangay_id'])) {
            $existsBrgy = Barangay::find($payload['barangay_id']);
            if (!$existsBrgy) {
                $byName = Barangay::where('name', 'Barangay ' . (int) $payload['barangay_id'])->first();
                if ($byName) {
                    $payload['barangay_id'] = $byName->id;
                }
            }
        }

        $validator = Validator::make($payload, [
            'route_name' => 'nullable|string|max:255',
            'truck_id' => 'sometimes|required|exists:trucks,id',
            'assigned_personnel_id' => 'nullable|exists:users,id',
            'barangay_id' => 'sometimes|required|exists:barangays,id',
            'start_location' => 'sometimes|required|string|min:2|max:255',
            'end_location' => 'sometimes|required|string|min:2|max:255',
            'collection_stops' => 'sometimes|required|array|min:1',
            'collection_stops.*.name' => 'required_with:collection_stops|string|min:1|max:255',
            'distance_km' => 'nullable|numeric|min:0.5|max:500',
            'travel_duration_minutes' => 'nullable|integer|min:5|max:1440',
            'collection_duration_minutes' => 'nullable|integer|min:5|max:1440',
            'stop_duration_minutes' => 'nullable|integer|min:5|max:480',
            'estimated_duration_minutes' => 'nullable|integer|min:10|max:1440',
            'collection_date' => 'sometimes|required|date',
            'start_time' => ['sometimes', 'required', 'regex:/^([01]\d|2[0-3]):([0-5]\d)$/'],
            'status' => 'sometimes|required|in:scheduled,ongoing,completed,delayed,pending,in_progress,cancelled',
            'notes' => 'nullable|string',
        ], [
            'start_location.required' => 'Starting location cannot be empty.',
            'end_location.required' => 'Destination / end location cannot be empty.',
            'collection_stops.min' => 'Route must contain at least one barangay collection stop.',
            'start_time.regex' => 'Invalid starting time format. Use HH:MM (e.g. 09:00) or 9:00 AM.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first() ?: 'Please check the collection route information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $startLocation = $payload['start_location'] ?? ($route->start_location ?: 'Dispatch Point');
        $endLocation = $payload['end_location'] ?? ($route->end_location ?: 'Waste Disposal Facility');
        $startTime = $payload['start_time'] ?? substr((string) ($route->getRawOriginal('start_time') ?: '09:00:00'), 0, 5);

        $travelMins = isset($payload['travel_duration_minutes']) && (int) $payload['travel_duration_minutes'] > 0
            ? (int) $payload['travel_duration_minutes']
            : null;
        $distanceKm = isset($payload['distance_km'])
            ? (float) $payload['distance_km']
            : ($travelMins !== null ? round($travelMins / 4, 2) : ((float) ($route->distance_km ?: 30.0)));

        $existingStops = is_array($route->collection_stops) && count($route->collection_stops) > 0
            ? self::normalizeStopsInput($route->collection_stops, $stopDurationMins)
            : self::normalizeStopsInput(['Barangay 1', 'Barangay 2', 'Barangay 3'], $stopDurationMins);

        $stopsToUse = $payload['collection_stops'] ?? $existingStops;

        $explicitDuration = null;
        if (isset($payload['estimated_duration_minutes']) && (int) $payload['estimated_duration_minutes'] > 0) {
            $explicitDuration = (int) $payload['estimated_duration_minutes'];
        } elseif ($travelMins !== null) {
            $collectionMins = isset($payload['collection_duration_minutes']) && (int) $payload['collection_duration_minutes'] > 0
                ? (int) $payload['collection_duration_minutes']
                : array_sum(array_map(fn ($s) => (int) ($s['duration_minutes'] ?? $stopDurationMins), $stopsToUse));
            $explicitDuration = $travelMins + $collectionMins;
        } elseif (
            !isset($payload['distance_km']) &&
            !isset($payload['stop_duration_minutes']) &&
            !isset($payload['collection_stops']) &&
            $route->estimated_duration_minutes
        ) {
            $explicitDuration = (int) $route->estimated_duration_minutes;
        }

        $calc = self::calculateRouteSchedule(
            $startLocation,
            $endLocation,
            $startTime,
            $stopsToUse,
            $distanceKm,
            $stopDurationMins,
            $explicitDuration
        );

        DB::transaction(function () use ($route, $payload, $calc, $startLocation, $endLocation, $distanceKm, $stopDurationMins) {
            $updateData = [
                'start_location' => trim($startLocation),
                'end_location' => trim($endLocation),
                'collection_stops' => $calc['stops'],
                'distance_km' => $distanceKm,
                'stop_duration_minutes' => $stopDurationMins,
                'estimated_duration_minutes' => $calc['estimated_duration_minutes'],
                'estimated_duration' => $calc['estimated_duration'],
                'start_time' => $calc['start_time_24'] . ':00',
                'end_time' => $calc['estimated_arrival_24'] . ':00',
                'estimated_arrival_time' => $calc['estimated_arrival_24'] . ':00',
            ];

            foreach (['route_name', 'truck_id', 'assigned_personnel_id', 'barangay_id', 'status', 'notes'] as $field) {
                if (array_key_exists($field, $payload)) {
                    $updateData[$field] = $payload[$field];
                }
            }

            if (!empty($payload['collection_date'])) {
                $updateData['collection_date'] = Carbon::parse($payload['collection_date'], 'Asia/Manila')->toDateString();
            }

            $route->update($updateData);
            self::syncRelationalStops($route, $calc['stops']);
            self::syncSchedulesAndNotifications($route, 'updated');
        });

        $route->refresh()->load([
            'truck:id,truck_number,plate_number,truck_type,status,driver_id',
            'truck.driver:id,name',
            'assignedPersonnel:id,name,email',
            'barangay:id,name',
            'stops',
        ]);

        try {
            ActivityLog::record(
                'collection_route.updated',
                "Updated collection route #{$route->id}.",
                $route
            );
        } catch (\Throwable) {
        }

        return response()->json([
            'success' => true,
            'message' => 'Collection route updated and synchronized.',
            'route' => self::enrichRouteItem($route),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | DRIVER ROUTE PROGRESS, WASTE LOGGING & ISSUE REPORTING
    |--------------------------------------------------------------------------
    */
    public function progress(Request $request, $id)
    {
        $route = CollectionRoute::with(['truck', 'assignedPersonnel', 'stops'])->find($id);

        if (!$route) {
            return response()->json([
                'success' => false,
                'message' => 'Collection route not found.',
            ], 404);
        }

        $action = strtolower(trim((string) $request->input('action', 'update_status')));
        $stops = is_array($route->collection_stops) ? $route->collection_stops : [];
        $nowManila = Carbon::now('Asia/Manila');
        $newStatus = $route->status;
        $notes = $route->notes ?? '';
        $eventLabel = 'updated';

        if ($action === 'start_route') {
            $newStatus = 'ongoing';
            $eventLabel = 'started';
            if ($route->truck) {
                $route->truck->update(['status' => 'on_route']);
            }
        } elseif ($action === 'complete_stop' || $action === 'record_waste') {
            $stopOrder = $request->input('stop_order');
            $stopName = trim((string) $request->input('stop_name', ''));
            $tonnage = $request->input('waste_tonnage', $request->input('amount_collected'));
            $category = trim((string) $request->input('waste_category', $request->input('waste_type', 'Residual')));
            $stopCompleted = $request->boolean('completed', $action === 'complete_stop');

            $matchedStopName = $stopName;
            foreach ($stops as $idx => $s) {
                $isMatch = ($stopOrder !== null && (int) ($s['stop_order'] ?? ($idx + 1)) === (int) $stopOrder)
                    || ($stopName !== '' && strcasecmp((string) ($s['name'] ?? ''), $stopName) === 0);
                if ($isMatch) {
                    $matchedStopName = $s['name'] ?? $stopName;
                    if ($stopCompleted) {
                        $stops[$idx]['status'] = 'completed';
                        $stops[$idx]['completed_at'] = $nowManila->format('g:i A');
                    }
                    if ($tonnage !== null && $tonnage !== '') {
                        $stops[$idx]['waste_tonnage'] = (float) $tonnage;
                        $stops[$idx]['waste_category'] = $category ?: 'Residual';
                    }
                }
            }

            // Also record in CollectionLog table if tonnage was submitted
            if ($tonnage !== null && (float) $tonnage > 0) {
                $stopBrgy = self::resolveBarangayFromStopName($matchedStopName) ?: $route->barangay;
                $driverId = $request->input('driver_id')
                    ?? $route->assigned_personnel_id
                    ?? $route->truck?->driver_id
                    ?? User::orderBy('id')->value('id');

                try {
                    CollectionLog::create([
                        'driver_id' => $driverId,
                        'truck_id' => $route->truck_id,
                        'barangay_id' => $stopBrgy?->id ?? $route->barangay_id,
                        'barangay_name' => $stopBrgy?->name ?? ($matchedStopName ?: 'Barangay 1'),
                        'amount_collected' => (float) $tonnage,
                        'unit' => $request->input('unit', 'tons'),
                        'waste_type' => $category ?: 'Residual',
                        'notes' => "Recorded via Route #{$route->id} ({$route->route_name}) at {$matchedStopName}",
                        'idempotency_key' => 'route-' . $route->id . '-stop-' . ($stopOrder ?? md5($matchedStopName)) . '-' . $nowManila->timestamp,
                        'is_finalized' => false,
                        'server_timestamp' => $nowManila,
                    ]);
                } catch (\Throwable) {
                }
            }

            // Check if all stops are completed
            $allDone = count($stops) > 0 && collect($stops)->every(fn ($s) => ($s['status'] ?? '') === 'completed');
            if ($allDone) {
                $newStatus = 'completed';
                $eventLabel = 'completed';
            } elseif ($newStatus === 'scheduled' || $newStatus === 'pending') {
                $newStatus = 'ongoing';
            }
        } elseif ($action === 'report_issue' || $action === 'delay_route') {
            $issueType = trim((string) $request->input('issue_type', 'Operational Delay'));
            $issueDesc = trim((string) $request->input('issue_description', 'Driver reported an operational issue along the route.'));
            $stopName = trim((string) $request->input('stop_name', $route->start_location));
            $markDelayed = $request->boolean('mark_delayed', true);

            if ($markDelayed) {
                $newStatus = 'delayed';
                $eventLabel = 'delayed';
            }

            $issueLine = "[{$nowManila->format('g:i A')}] {$issueType} at {$stopName}: {$issueDesc}";
            $notes = trim($notes ? ($notes . "\n" . $issueLine) : $issueLine);

            // Save operational issue to reports table for Admin monitoring
            try {
                $reporterId = $request->input('driver_id')
                    ?? $route->assigned_personnel_id
                    ?? $route->truck?->driver_id
                    ?? User::orderBy('id')->value('id');
                $stopBrgy = self::resolveBarangayFromStopName($stopName);

                Report::create([
                    'user_id' => $reporterId,
                    'barangay_id' => $stopBrgy?->id ?? $route->barangay_id,
                    'title' => "[Driver Route Issue] {$issueType}",
                    'description' => "Route: " . ($route->route_name ?: "Route #{$route->id}") . " | Location: {$stopName} | Details: {$issueDesc}",
                    'location' => $stopName,
                    'status' => 'pending',
                ]);
            } catch (\Throwable) {
            }
        } elseif ($action === 'complete_route') {
            $newStatus = 'completed';
            $eventLabel = 'completed';
            foreach ($stops as $idx => $s) {
                $stops[$idx]['status'] = 'completed';
                if (empty($stops[$idx]['completed_at'])) {
                    $stops[$idx]['completed_at'] = $nowManila->format('g:i A');
                }
            }
            if ($route->truck) {
                $route->truck->update(['status' => 'available']);
            }
        } else {
            if ($request->filled('status')) {
                $newStatus = self::normalizeStatusValue($request->input('status'));
                $eventLabel = $newStatus;
            }
        }

        $route->update([
            'status' => $newStatus,
            'collection_stops' => $stops,
            'notes' => $notes,
        ]);

        self::syncSchedulesAndNotifications($route, $eventLabel);

        $route->refresh()->load([
            'truck:id,truck_number,plate_number,truck_type,status,driver_id',
            'truck.driver:id,name',
            'assignedPersonnel:id,name,email',
            'barangay:id,name',
            'stops',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Route progress updated and synchronized.',
            'route' => self::enrichRouteItem($route),
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

        try {
            ActivityLog::record(
                'collection_route.deleted',
                "Deleted collection route #{$id}."
            );
        } catch (\Throwable) {
        }

        return response()->json([
            'success' => true,
            'message' => 'Collection route deleted successfully.',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | ROUTE SCHEDULE, TRAVEL TIME & TIMELINE CALCULATION ENGINE (Asia/Manila)
    |--------------------------------------------------------------------------
    */
    public static function calculateRouteSchedule(
        string $startLocation,
        string $endLocation,
        string $startTime24,
        array $normalizedStops,
        float $distanceKm = 30.0,
        int $defaultStopMins = 20,
        ?int $explicitTotalMins = null
    ): array {
        $cleanTime = self::parseTo24HourTime($startTime24) ?? '09:00';
        [$startHour, $startMin] = array_map('intval', explode(':', $cleanTime));
        $startTotalMins = ($startHour * 60) + $startMin;

        $stopCount = count($normalizedStops);
        // Base driving time derived from route distance (15 km/h urban speed => 4 mins per km)
        $travelDriveMins = max(10, (int) round($distanceKm * 4));

        $stopsTotalMins = 0;
        foreach ($normalizedStops as $idx => $s) {
            $dur = isset($s['duration_minutes']) && (int) $s['duration_minutes'] > 0
                ? (int) $s['duration_minutes']
                : $defaultStopMins;
            $normalizedStops[$idx]['duration_minutes'] = $dur;
            $normalizedStops[$idx]['stop_order'] = $idx + 1;
            $stopsTotalMins += $dur;
        }

        $totalDurationMinutes = ($explicitTotalMins !== null && $explicitTotalMins > 0)
            ? $explicitTotalMins
            : ($travelDriveMins + $stopsTotalMins);

        $totalDurationMinutes = max(15, $totalDurationMinutes);

        // Compute arrival offsets for each stop in order
        // For N stops across totalDurationMinutes, initial leg and final leg are each 1/(2N) of totalDurationMinutes
        // Example: 3 stops across 180 mins (3 hours) from 9:00 AM:
        // firstLeg = 30 mins (9:30 AM - Stop 1), Stop 2 = 90 mins (10:30 AM), Stop 3 = 150 mins (11:30 AM), End = 180 mins (12:00 PM)
        $stopOffsets = [];
        if ($stopCount === 1) {
            $stopOffsets[0] = (int) round($totalDurationMinutes / 2);
        } elseif ($stopCount >= 2) {
            $firstLeg = max(10, (int) round($totalDurationMinutes / ($stopCount * 2)));
            $lastLeg = $firstLeg;
            $middleSpan = max(0, $totalDurationMinutes - $firstLeg - $lastLeg);

            $interStopWeightTotal = 0;
            for ($i = 0; $i < $stopCount - 1; $i++) {
                $interStopWeightTotal += max(1, (int) $normalizedStops[$i]['duration_minutes']);
            }

            $stopOffsets[0] = $firstLeg;
            $runningWeight = 0;
            for ($i = 1; $i < $stopCount; $i++) {
                $runningWeight += max(1, (int) $normalizedStops[$i - 1]['duration_minutes']);
                $fraction = $interStopWeightTotal > 0 ? ($runningWeight / $interStopWeightTotal) : ($i / ($stopCount - 1));
                $stopOffsets[$i] = $firstLeg + (int) round($middleSpan * $fraction);
            }
        }

        $timeline = [];
        $timeline[] = [
            'step' => 0,
            'type' => 'start',
            'time' => self::formatMinutesTo12Hour($startTotalMins, false),
            'time_24' => self::formatMinutesTo24Hour($startTotalMins),
            'label' => 'Collection Starts',
            'location' => $startLocation,
            'display_text' => self::formatMinutesTo12Hour($startTotalMins, false) . ' – Collection Starts (' . $startLocation . ')',
            'crosses_midnight' => false,
        ];

        $enrichedStops = [];
        $prevOffset = 0;
        foreach ($normalizedStops as $idx => $stop) {
            $offsetMins = $stopOffsets[$idx] ?? (($idx + 1) * 30);
            $absMins = $startTotalMins + $offsetMins;
            $crossesMidnight = $absMins >= 1440;
            $time12 = self::formatMinutesTo12Hour($absMins, $crossesMidnight);
            $time24 = self::formatMinutesTo24Hour($absMins);
            $legTravelMins = max(5, $offsetMins - $prevOffset);
            $prevOffset = $offsetMins;

            $stopItem = [
                'stop_order' => $idx + 1,
                'name' => $stop['name'],
                'location_name' => $stop['name'],
                'duration_minutes' => (int) $stop['duration_minutes'],
                'travel_minutes' => $legTravelMins,
                'offset_minutes' => $offsetMins,
                'estimated_time' => $time24,
                'arrival_time' => $time12,
                'crosses_midnight' => $crossesMidnight,
                'status' => $stop['status'] ?? 'pending',
                'completed_at' => $stop['completed_at'] ?? null,
                'waste_tonnage' => $stop['waste_tonnage'] ?? null,
                'waste_category' => $stop['waste_category'] ?? null,
            ];
            $enrichedStops[] = $stopItem;

            $timeline[] = [
                'step' => $idx + 1,
                'type' => 'stop',
                'stop_order' => $idx + 1,
                'time' => $time12,
                'time_24' => $time24,
                'label' => $stop['name'],
                'location' => $stop['name'],
                'duration_minutes' => (int) $stop['duration_minutes'],
                'status' => $stop['status'] ?? 'pending',
                'completed_at' => $stop['completed_at'] ?? null,
                'waste_tonnage' => $stop['waste_tonnage'] ?? null,
                'waste_category' => $stop['waste_category'] ?? null,
                'display_text' => "{$time12} – {$stop['name']}",
                'crosses_midnight' => $crossesMidnight,
            ];
        }

        $arrivalAbsMins = $startTotalMins + $totalDurationMinutes;
        $arrivalCrossesMidnight = $arrivalAbsMins >= 1440;
        $arrival12 = self::formatMinutesTo12Hour($arrivalAbsMins, $arrivalCrossesMidnight);
        $arrival24 = self::formatMinutesTo24Hour($arrivalAbsMins);

        $timeline[] = [
            'step' => $stopCount + 1,
            'type' => 'end',
            'time' => $arrival12,
            'time_24' => $arrival24,
            'label' => 'Estimated Arrival at Final Destination',
            'location' => $endLocation,
            'display_text' => "{$arrival12} – Estimated Arrival at Final Destination ({$endLocation})",
            'crosses_midnight' => $arrivalCrossesMidnight,
        ];

        $effectiveTravelMins = max(10, $totalDurationMinutes - $stopsTotalMins);

        return [
            'start_time_24' => $cleanTime,
            'start_time_formatted' => self::formatMinutesTo12Hour($startTotalMins, false),
            'travel_duration_minutes' => $effectiveTravelMins,
            'travel_duration_formatted' => self::formatDurationLabel($effectiveTravelMins),
            'collection_duration_minutes' => $stopsTotalMins,
            'collection_duration_formatted' => self::formatDurationLabel($stopsTotalMins),
            'estimated_duration_minutes' => $totalDurationMinutes,
            'estimated_duration' => self::formatDurationLabel($totalDurationMinutes),
            'estimated_arrival_24' => $arrival24,
            'estimated_arrival_formatted' => $arrival12,
            'crosses_midnight' => $arrivalCrossesMidnight,
            'stops' => $enrichedStops,
            'timeline' => $timeline,
        ];
    }

    public static function formatDurationLabel(int $totalMinutes): string
    {
        $totalMinutes = max(1, $totalMinutes);
        $hours = intdiv($totalMinutes, 60);
        $mins = $totalMinutes % 60;

        if ($hours > 0 && $mins > 0) {
            $hLabel = $hours === 1 ? '1 hour' : "{$hours} hours";
            $mLabel = $mins === 1 ? '1 minute' : "{$mins} minutes";
            return "{$hLabel} and {$mLabel}";
        }
        if ($hours > 0) {
            return $hours === 1 ? '1 hour' : "{$hours} hours";
        }
        return $mins === 1 ? '1 minute' : "{$mins} minutes";
    }

    public static function formatMinutesTo24Hour(int $totalMinutes): string
    {
        $wrapped = (($totalMinutes % 1440) + 1440) % 1440;
        $h = intdiv($wrapped, 60);
        $m = $wrapped % 60;
        return sprintf('%02d:%02d', $h, $m);
    }

    public static function formatMinutesTo12Hour(int $totalMinutes, bool $includeNextDayBadge = false): string
    {
        $wrapped = (($totalMinutes % 1440) + 1440) % 1440;
        $h24 = intdiv($wrapped, 60);
        $m = $wrapped % 60;
        $ampm = $h24 >= 12 ? 'PM' : 'AM';
        $h12 = $h24 % 12;
        if ($h12 === 0) {
            $h12 = 12;
        }
        $formatted = sprintf('%d:%02d %s', $h12, $m, $ampm);
        if ($includeNextDayBadge && $totalMinutes >= 1440) {
            return "{$formatted} (+1 day)";
        }
        return $formatted;
    }

    public static function parseTo24HourTime($raw): ?string
    {
        if ($raw === null) {
            return null;
        }
        $str = trim((string) $raw);
        if ($str === '') {
            return null;
        }

        if (preg_match('/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i', $str, $m)) {
            $hour = (int) $m[1];
            $min = (int) $m[2];
            $meridiem = strtoupper($m[3]);
            if ($hour < 1 || $hour > 12 || $min < 0 || $min > 59) {
                return null;
            }
            if ($meridiem === 'AM') {
                $hour = ($hour === 12) ? 0 : $hour;
            } else {
                $hour = ($hour === 12) ? 12 : ($hour + 12);
            }
            return sprintf('%02d:%02d', $hour, $min);
        }

        if (preg_match('/^(\d{1,2}):(\d{2})(?::\d{2})?$/', $str, $m)) {
            $hour = (int) $m[1];
            $min = (int) $m[2];
            if ($hour < 0 || $hour > 23 || $min < 0 || $min > 59) {
                return null;
            }
            return sprintf('%02d:%02d', $hour, $min);
        }

        return null;
    }

    public static function normalizeStopsInput($rawStops, int $defaultDurationMins = 20): array
    {
        if (is_string($rawStops)) {
            $decoded = json_decode($rawStops, true);
            if (is_array($decoded)) {
                $rawStops = $decoded;
            } else {
                $rawStops = array_filter(array_map('trim', explode(',', $rawStops)));
            }
        }

        if (!is_array($rawStops)) {
            return [];
        }

        $result = [];
        foreach (array_values($rawStops) as $item) {
            if (is_string($item)) {
                $name = trim($item);
                if ($name !== '') {
                    $result[] = [
                        'stop_order' => count($result) + 1,
                        'name' => $name,
                        'duration_minutes' => $defaultDurationMins,
                        'status' => 'pending',
                    ];
                }
            } elseif (is_array($item)) {
                $name = trim((string) ($item['name'] ?? $item['location_name'] ?? $item['location'] ?? $item['label'] ?? ''));
                if ($name !== '') {
                    $dur = isset($item['duration_minutes']) && (int) $item['duration_minutes'] > 0
                        ? (int) $item['duration_minutes']
                        : $defaultDurationMins;
                    $result[] = [
                        'stop_order' => count($result) + 1,
                        'name' => $name,
                        'duration_minutes' => $dur,
                        'status' => $item['status'] ?? 'pending',
                        'completed_at' => $item['completed_at'] ?? null,
                        'waste_tonnage' => $item['waste_tonnage'] ?? null,
                        'waste_category' => $item['waste_category'] ?? null,
                    ];
                }
            }
        }

        return $result;
    }

    public static function normalizeStatusValue($rawStatus): string
    {
        $s = strtolower(trim((string) $rawStatus));
        return match ($s) {
            'scheduled', 'pending' => 'scheduled',
            'ongoing', 'in_progress', 'in progress', 'on_route' => 'ongoing',
            'completed', 'done' => 'completed',
            'delayed', 'late' => 'delayed',
            'cancelled', 'canceled' => 'cancelled',
            default => $s,
        };
    }

    public static function formatStatusDisplay(string $status): string
    {
        return match (strtolower(trim($status))) {
            'ongoing', 'in_progress' => 'Ongoing',
            'completed' => 'Completed',
            'delayed' => 'Delayed',
            'cancelled' => 'Cancelled',
            default => 'Scheduled',
        };
    }

    public static function resolveBarangayFromStopName(string $stopName): ?Barangay
    {
        $clean = trim($stopName);
        if ($clean === '') {
            return null;
        }
        if (preg_match('/barangay\s*(\d+)/i', $clean, $m)) {
            return Barangay::where('name', 'Barangay ' . (int) $m[1])->orderBy('id')->first();
        }
        return Barangay::where('name', $clean)->orderBy('id')->first();
    }

    protected static function syncRelationalStops(CollectionRoute $route, array $stops): void
    {
        CollectionRouteStop::where('collection_route_id', $route->id)->delete();
        foreach ($stops as $idx => $stop) {
            CollectionRouteStop::create([
                'collection_route_id' => $route->id,
                'stop_order' => $stop['stop_order'] ?? ($idx + 1),
                'location_name' => $stop['name'] ?? $stop['location_name'] ?? ('Stop ' . ($idx + 1)),
                'duration_minutes' => (int) ($stop['duration_minutes'] ?? 20),
                'travel_minutes' => (int) ($stop['travel_minutes'] ?? 20),
                'estimated_time' => isset($stop['estimated_time']) ? ($stop['estimated_time'] . ':00') : null,
            ]);
        }
    }

    protected static function syncSchedulesAndNotifications(CollectionRoute $route, string $eventType = 'updated'): void
    {
        try {
            $dateStr = $route->collection_date ? Carbon::parse($route->collection_date)->toDateString() : Carbon::now('Asia/Manila')->toDateString();
            $dayName = Carbon::parse($dateStr)->format('l');
            $scheduleStatus = match (self::normalizeStatusValue($route->status)) {
                'completed' => 'completed',
                'ongoing' => 'in_progress',
                default => 'scheduled',
            };

            $stops = is_array($route->collection_stops) ? $route->collection_stops : [];
            $syncedBarangayIds = [];

            foreach ($stops as $stop) {
                $stopName = (string) ($stop['name'] ?? '');
                $brgy = self::resolveBarangayFromStopName($stopName);
                if ($brgy && !in_array($brgy->id, $syncedBarangayIds, true)) {
                    $syncedBarangayIds[] = $brgy->id;
                    $pickupTime = substr((string) ($stop['estimated_time'] ?? $route->getRawOriginal('start_time') ?? '09:00'), 0, 5);
                    CollectionSchedule::updateOrCreate(
                        [
                            'barangay_id' => $brgy->id,
                            'date' => $dateStr,
                        ],
                        [
                            'day' => $dayName,
                            'pickup_time' => $pickupTime,
                            'schedule_type' => 'regular',
                            'notes' => ($route->route_name ? "{$route->route_name}: " : '') . "{$route->start_location} → {$route->end_location}",
                            'active' => true,
                            'status' => $scheduleStatus,
                        ]
                    );
                }
            }

            if ($route->barangay_id && !in_array($route->barangay_id, $syncedBarangayIds, true)) {
                $syncedBarangayIds[] = $route->barangay_id;
                $startTime24 = substr((string) ($route->getRawOriginal('start_time') ?: '09:00:00'), 0, 5);
                CollectionSchedule::updateOrCreate(
                    [
                        'barangay_id' => $route->barangay_id,
                        'date' => $dateStr,
                    ],
                    [
                        'day' => $dayName,
                        'pickup_time' => $startTime24,
                        'schedule_type' => 'regular',
                        'notes' => ($route->route_name ? "{$route->route_name}: " : '') . "{$route->start_location} → {$route->end_location}",
                        'active' => true,
                        'status' => $scheduleStatus,
                    ]
                );
            }

            // Create Resident Notification for schedule updates
            $stopNamesList = implode(', ', array_map(fn ($s) => $s['name'] ?? '', $stops));
            $startFormatted = self::formatMinutesTo12Hour(
                ((int) substr((string) $route->getRawOriginal('start_time'), 0, 2)) * 60 +
                ((int) substr((string) $route->getRawOriginal('start_time'), 3, 2))
            );
            $arrivalFormatted = self::formatMinutesTo12Hour(
                ((int) substr((string) $route->getRawOriginal('estimated_arrival_time'), 0, 2)) * 60 +
                ((int) substr((string) $route->getRawOriginal('estimated_arrival_time'), 3, 2))
            );
            $statusDisplay = self::formatStatusDisplay($route->status);
            $routeTitle = $route->route_name ?: "Route #{$route->id}";

            $notifTitle = "Collection Schedule Update ({$statusDisplay})";
            $notifMessage = "{$routeTitle} ({$stopNamesList}) scheduled on {$dateStr} from {$startFormatted} to {$arrivalFormatted} is now {$statusDisplay}.";

            $targetUserId = User::orderBy('id')->value('id');
            if ($targetUserId) {
                Notification::create([
                    'user_id' => $targetUserId,
                    'title' => $notifTitle,
                    'message' => $notifMessage,
                    'type' => 'schedule',
                    'is_read' => false,
                ]);
            }

            foreach ($syncedBarangayIds as $bId) {
                try {
                    PushNotificationService::broadcast(
                        'schedule',
                        $notifTitle,
                        $notifMessage,
                        ['barangay_id' => $bId, 'role' => 'resident'],
                        ['route_id' => $route->id]
                    );
                } catch (\Throwable) {
                }
            }
        } catch (\Throwable) {
        }
    }

    /*
    |--------------------------------------------------------------------------
    | ENRICH COLLECTION ROUTE WITH TIMELINE, STOPS, PERSONNEL, & VEHICLE
    |--------------------------------------------------------------------------
    */
    public static function enrichRouteItem(CollectionRoute $route): array
    {
        $data = $route->toArray();

        $barangayName = $route->barangay?->name ?? '';
        $brgyNum = 12;
        if (preg_match('/(\d+)/', $barangayName, $m)) {
            $brgyNum = (int) $m[1];
        } elseif ($route->barangay_id >= 1 && $route->barangay_id <= 40) {
            $brgyNum = (int) $route->barangay_id;
        }

        $routeDefs = TruckLocationController::getRouteDefinitions();
        $matchedRouteDef = null;
        foreach ($routeDefs as $def) {
            if (in_array($brgyNum, $def['barangays'], true)) {
                $matchedRouteDef = $def;
                break;
            }
        }
        if (!$matchedRouteDef && $route->truck) {
            foreach ($routeDefs as $def) {
                if (
                    $def['plate_number'] === $route->truck->plate_number ||
                    $def['truck_number'] === $route->truck->truck_number
                ) {
                    $matchedRouteDef = $def;
                    break;
                }
            }
        }
        if (!$matchedRouteDef) {
            $matchedRouteDef = $routeDefs[0];
        }

        $rawStart = $route->getRawOriginal('start_time') ?: '09:00:00';
        $startTime = substr((string) $rawStart, 0, 5);

        $startLocation = $route->start_location ?: 'Dispatch Point';
        $endLocation = $route->end_location ?: 'Waste Disposal Facility';
        $distanceKm = (float) ($route->distance_km ?: 30.0);
        $stopDurationMins = (int) ($route->stop_duration_minutes ?: 20);

        $rawStops = $route->collection_stops;
        if (empty($rawStops) && $route->relationLoaded('stops') && $route->stops->count() > 0) {
            $rawStops = $route->stops->map(fn ($s) => [
                'stop_order' => $s->stop_order,
                'name' => $s->location_name,
                'duration_minutes' => $s->duration_minutes,
            ])->toArray();
        }
        if (empty($rawStops)) {
            $rawStops = [
                ['stop_order' => 1, 'name' => 'Barangay 1', 'duration_minutes' => $stopDurationMins],
                ['stop_order' => 2, 'name' => 'Barangay 2', 'duration_minutes' => $stopDurationMins],
                ['stop_order' => 3, 'name' => 'Barangay 3', 'duration_minutes' => $stopDurationMins],
            ];
        } else {
            $rawStops = self::normalizeStopsInput($rawStops, $stopDurationMins);
        }

        $explicitDuration = $route->estimated_duration_minutes ? (int) $route->estimated_duration_minutes : null;
        $calc = self::calculateRouteSchedule(
            $startLocation,
            $endLocation,
            $startTime,
            $rawStops,
            $distanceKm,
            $stopDurationMins,
            $explicitDuration
        );

        $truck = $route->truck;
        $personnel = $route->assignedPersonnel ?: $truck?->driver;
        $now = Carbon::now('Asia/Manila');

        $waypoint = $matchedRouteDef['waypoints'][0] ?? [8.4760, 124.6470];
        // Per approved capstone scope: no live GPS tracking claims; route progress is driver-submitted
        $currentTruckLocation = [
            'gps_available' => false,
            'is_live' => false,
            'latitude' => (float) $waypoint[0],
            'longitude' => (float) $waypoint[1],
            'speed' => 0.0,
            'heading' => 0.0,
            'recorded_at' => null,
            'time_ago' => 'Driver-Submitted Progress',
            'area_label' => $matchedRouteDef['name'] ?? 'CDO Collection Corridor',
        ];

        $dateStr = $route->collection_date ? Carbon::parse($route->collection_date)->toDateString() : $now->toDateString();
        $normalizedStatus = self::normalizeStatusValue($route->status ?: 'scheduled');
        $statusLabel = self::formatStatusDisplay($normalizedStatus);

        $completedStopsCount = collect($calc['stops'])->filter(fn ($s) => ($s['status'] ?? '') === 'completed')->count();
        $totalStopsCount = count($calc['stops']);

        $data['route_id'] = $route->id;
        $data['barangay_name'] = $barangayName ?: "Barangay {$brgyNum}";
        $data['collection_date'] = $dateStr;
        $data['start_location'] = $startLocation;
        $data['end_location'] = $endLocation;
        $data['start_time'] = $calc['start_time_24'];
        $data['start_time_formatted'] = $calc['start_time_formatted'];
        $data['end_time'] = $calc['estimated_arrival_24'];
        $data['estimated_arrival_time'] = $calc['estimated_arrival_24'];
        $data['estimated_arrival_formatted'] = $calc['estimated_arrival_formatted'];
        $data['estimated_arrival'] = $calc['estimated_arrival_formatted'];
        $data['distance_km'] = $distanceKm;
        $data['stop_duration_minutes'] = $stopDurationMins;
        $data['travel_duration_minutes'] = $calc['travel_duration_minutes'];
        $data['travel_duration_formatted'] = $calc['travel_duration_formatted'];
        $data['collection_duration_minutes'] = $calc['collection_duration_minutes'];
        $data['collection_duration_formatted'] = $calc['collection_duration_formatted'];
        $data['estimated_duration_minutes'] = $calc['estimated_duration_minutes'];
        $data['estimated_duration'] = $calc['estimated_duration'];
        $data['crosses_midnight'] = $calc['crosses_midnight'];
        $data['collection_stops'] = $calc['stops'];
        $data['route_stops'] = array_map(fn ($s) => $s['name'], $calc['stops']);
        $data['completed_stops_count'] = $completedStopsCount;
        $data['total_stops_count'] = $totalStopsCount;
        $data['timeline'] = $calc['timeline'];
        $data['route_number'] = $matchedRouteDef['route_number'] ?? 1;
        $data['route_name'] = $route->route_name ?: ($matchedRouteDef['name'] ?? 'Route A');
        $data['route_description'] = $matchedRouteDef['description'] ?? '';
        $data['status'] = $normalizedStatus;
        $data['collection_status'] = $normalizedStatus;
        $data['status_label'] = $statusLabel;
        $data['assigned_personnel_id'] = $personnel?->id;
        $data['assigned_personnel'] = [
            'id' => $personnel?->id,
            'name' => $personnel?->name ?? ($truck?->driver?->name ?? 'John Driver'),
            'email' => $personnel?->email ?? '',
        ];
        $data['assigned_vehicle'] = [
            'id' => $truck?->id,
            'truck_number' => $truck?->truck_number ?? ($matchedRouteDef['truck_number'] ?? 'TRK-01'),
            'plate_number' => $truck?->plate_number ?? ($matchedRouteDef['plate_number'] ?? 'KAL-101'),
            'truck_type' => $truck?->truck_type ?? 'Compactor Truck',
            'status' => $truck?->status ?? 'available',
            'driver_name' => $personnel?->name ?? ($truck?->driver?->name ?? 'Assigned Driver'),
        ];
        $data['assigned_truck'] = $data['assigned_vehicle'];
        $data['current_truck_location'] = $currentTruckLocation;

        return $data;
    }
}
