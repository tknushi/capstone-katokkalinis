<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Barangay;
use App\Models\CollectionLog;
use App\Models\CollectionLogAudit;
use App\Models\Truck;
use DomainException;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CollectionLogController extends Controller
{
    /**
     * Submit a new collection log from driver mobile app.
     * Enforces:
     * - Stateless driver auth via Sanctum token
     * - Server-side timestamp
     * - Idempotency key per submission to prevent duplicates under weak mobile connections
     * - Insert-only records (creates a brand new row)
     * - Initial audit log creation
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount_collected' => 'required|numeric|min:0.01',
            'unit' => 'nullable|string|in:tons,volume_cu_m,kg',
            'barangay_name' => 'required|string|max:100',
            'barangay_id' => 'nullable|integer',
            'waste_type' => 'nullable|string|max:50',
            'truck_id' => 'nullable|integer',
            'notes' => 'nullable|string|max:1000',
            'idempotency_key' => 'required|string|max:64',
        ]);

        $user = $request->user();
        $idempotencyKey = $validated['idempotency_key'];

        // 1. Idempotency Check: if key already exists, return existing record
        // Prevents duplicates on retries over unstable mobile internet
        $existing = CollectionLog::with(['driver:id,name,email', 'truck:id,truck_number,plate_number', 'audits'])
            ->where('idempotency_key', $idempotencyKey)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => true,
                'message' => 'Collection log already recorded (idempotent replay).',
                'is_idempotent_replay' => true,
                'data' => $existing,
            ], 200);
        }

        // 2. Resolve Barangay ID if not provided
        $barangayId = $validated['barangay_id'] ?? null;
        if (!$barangayId) {
            $matchedBarangay = Barangay::where('name', $validated['barangay_name'])
                ->orWhere('name', 'like', "%{$validated['barangay_name']}%")
                ->first();
            if ($matchedBarangay) {
                $barangayId = $matchedBarangay->id;
            }
        }

        // 3. Resolve Truck ID: use specified truck or active truck assigned to this driver
        $truckId = $validated['truck_id'] ?? null;
        if (!$truckId) {
            $driverTruck = Truck::where('driver_id', $user->id)->first();
            if (!$driverTruck) {
                // Fallback to active truck
                $driverTruck = Truck::first();
            }
            if ($driverTruck) {
                $truckId = $driverTruck->id;
            }
        }

        // 4. Safe concurrent write inside transaction
        try {
            $collectionLog = DB::transaction(function () use ($validated, $user, $barangayId, $truckId, $idempotencyKey) {
                $serverTimestamp = now();

                $log = CollectionLog::create([
                    'driver_id' => $user->id,
                    'truck_id' => $truckId,
                    'barangay_id' => $barangayId,
                    'barangay_name' => $validated['barangay_name'],
                    'amount_collected' => (float) $validated['amount_collected'],
                    'unit' => $validated['unit'] ?? 'tons',
                    'waste_type' => $validated['waste_type'] ?? 'Residual',
                    'notes' => $validated['notes'] ?? null,
                    'idempotency_key' => $idempotencyKey,
                    'is_finalized' => false,
                    'finalized_at' => null,
                    'server_timestamp' => $serverTimestamp,
                ]);

                // Create initial audit trail entry
                CollectionLogAudit::create([
                    'collection_log_id' => $log->id,
                    'user_id' => $user->id,
                    'action' => 'CREATED',
                    'old_values' => null,
                    'new_values' => [
                        'amount_collected' => (float) $validated['amount_collected'],
                        'unit' => $validated['unit'] ?? 'tons',
                        'barangay_name' => $validated['barangay_name'],
                        'waste_type' => $validated['waste_type'] ?? 'Residual',
                        'notes' => $validated['notes'] ?? null,
                    ],
                    'reason' => 'Initial collection log submitted by driver via mobile app',
                    'created_at' => $serverTimestamp,
                ]);

                // Log system activity if model exists
                try {
                    ActivityLog::create([
                        'user_id' => $user->id,
                        'action' => 'Submitted Collection Log',
                        'description' => "Driver {$user->name} recorded {$log->amount_collected} {$log->unit} at {$log->barangay_name}.",
                    ]);
                } catch (\Throwable) {
                    // Silently ignore activity log if table schema differs
                }

                return $log;
            });

            $collectionLog->load(['driver:id,name,email', 'truck:id,truck_number,plate_number', 'audits']);

            return response()->json([
                'success' => true,
                'message' => 'Collection log saved successfully as a new insert-only record.',
                'data' => $collectionLog,
            ], 201);

        } catch (QueryException $e) {
            // Handle race condition where duplicate idempotency_key was inserted concurrently
            if ($e->getCode() == 23000 || str_contains($e->getMessage(), 'Duplicate entry')) {
                $duplicate = CollectionLog::with(['driver:id,name,email', 'truck:id,truck_number,plate_number', 'audits'])
                    ->where('idempotency_key', $idempotencyKey)
                    ->first();

                return response()->json([
                    'success' => true,
                    'message' => 'Collection log already recorded (concurrent idempotency matched).',
                    'is_idempotent_replay' => true,
                    'data' => $duplicate,
                ], 200);
            }

            throw $e;
        }
    }

    /**
     * List collection logs.
     * Drivers see their own logs by default.
     * Admin/super_admin see all logs.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $isStaffOrAdmin = $user->roles()->whereIn('name', ['admin', 'super_admin', 'barangay_admin', 'inspector'])->exists();

        $query = CollectionLog::with(['driver:id,name,email', 'truck:id,truck_number,plate_number', 'audits'])
            ->orderBy('id', 'desc');

        // Driver restriction: drivers can only view their own logs unless admin requested
        if (!$isStaffOrAdmin || $request->query('my_logs_only')) {
            $query->where('driver_id', $user->id);
        }

        if ($request->has('is_finalized') && $request->query('is_finalized') !== '') {
            $isFinalized = filter_var($request->query('is_finalized'), FILTER_VALIDATE_BOOLEAN);
            $query->where('is_finalized', $isFinalized);
        }

        if ($request->query('barangay')) {
            $query->where('barangay_name', 'like', "%{$request->query('barangay')}%");
        }

        $logs = $query->paginate($request->query('per_page', 30));

        return response()->json([
            'success' => true,
            'data' => $logs->items(),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'total' => $logs->total(),
                'per_page' => $logs->perPage(),
            ],
        ]);
    }

    /**
     * Get a single collection log with complete audit history.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $log = CollectionLog::with(['driver:id,name,email', 'truck:id,truck_number,plate_number', 'audits.user:id,name,email'])
            ->findOrFail($id);

        $isStaffOrAdmin = $user->roles()->whereIn('name', ['admin', 'super_admin', 'barangay_admin', 'inspector'])->exists();

        if ($log->driver_id !== $user->id && !$isStaffOrAdmin) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: You may only view your own collection logs.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $log,
        ]);
    }

    /**
     * Driver UPDATE for typographical error before finalization.
     * Enforces:
     * - Exception: only for typographical error correction
     * - ONLY while entry is NOT yet finalized
     * - Driver can ONLY edit their own entries
     * - Audit trail logs old value, new value, who changed it, and when.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $log = CollectionLog::findOrFail($id);

        // 1. Ownership check: Driver may only edit their own entries
        if ($log->driver_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: Drivers may only edit their own non-finalized entries.',
            ], 403);
        }

        // 2. Finalization check: Once finalized, locked against any update
        if ($log->is_finalized) {
            return response()->json([
                'success' => false,
                'message' => 'Operation rejected: This collection entry is finalized and permanently locked from editing.',
            ], 422);
        }

        $validated = $request->validate([
            'amount_collected' => 'sometimes|required|numeric|min:0.01',
            'unit' => 'nullable|string|in:tons,volume_cu_m,kg',
            'waste_type' => 'nullable|string|max:50',
            'notes' => 'nullable|string|max:1000',
            'barangay_name' => 'nullable|string|max:100',
            'reason' => 'nullable|string|max:255',
        ]);

        $oldValues = [
            'amount_collected' => (float) $log->amount_collected,
            'unit' => $log->unit,
            'waste_type' => $log->waste_type,
            'notes' => $log->notes,
            'barangay_name' => $log->barangay_name,
        ];

        $newValues = [];
        if (isset($validated['amount_collected'])) {
            $newValues['amount_collected'] = (float) $validated['amount_collected'];
            $log->amount_collected = $validated['amount_collected'];
        }
        if (isset($validated['unit'])) {
            $newValues['unit'] = $validated['unit'];
            $log->unit = $validated['unit'];
        }
        if (isset($validated['waste_type'])) {
            $newValues['waste_type'] = $validated['waste_type'];
            $log->waste_type = $validated['waste_type'];
        }
        if (array_key_exists('notes', $validated)) {
            $newValues['notes'] = $validated['notes'];
            $log->notes = $validated['notes'];
        }
        if (isset($validated['barangay_name'])) {
            $newValues['barangay_name'] = $validated['barangay_name'];
            $log->barangay_name = $validated['barangay_name'];
        }

        try {
            DB::transaction(function () use ($log, $user, $oldValues, $newValues, $validated) {
                $log->save();

                // Record correction in audit trail
                CollectionLogAudit::create([
                    'collection_log_id' => $log->id,
                    'user_id' => $user->id,
                    'action' => 'TYPO_CORRECTED',
                    'old_values' => $oldValues,
                    'new_values' => $newValues,
                    'reason' => $validated['reason'] ?? 'Typographical error correction by driver prior to finalization',
                    'created_at' => now(),
                ]);
            });

            $log->load(['driver:id,name,email', 'truck:id,truck_number,plate_number', 'audits']);

            return response()->json([
                'success' => true,
                'message' => 'Typographical correction saved. Audit trail recorded.',
                'data' => $log,
            ]);

        } catch (DomainException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Database rule prevented update: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Finalize and permanently lock a collection log.
     * Enforces:
     * - Once an entry is finalized, it is locked and cannot be edited or deleted.
     * - Records FINALIZED in audit trail.
     */
    public function finalize(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $log = CollectionLog::findOrFail($id);

        // Ownership check
        if ($log->driver_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: You can only finalize your own collection logs.',
            ], 403);
        }

        if ($log->is_finalized) {
            return response()->json([
                'success' => false,
                'message' => 'Record is already finalized and locked.',
                'data' => $log,
            ], 400);
        }

        try {
            DB::transaction(function () use ($log, $user) {
                $log->is_finalized = true;
                $log->finalized_at = now();
                $log->save();

                // Record finalization in audit trail
                CollectionLogAudit::create([
                    'collection_log_id' => $log->id,
                    'user_id' => $user->id,
                    'action' => 'FINALIZED',
                    'old_values' => ['is_finalized' => false],
                    'new_values' => ['is_finalized' => true, 'finalized_at' => $log->finalized_at],
                    'reason' => 'Driver confirmed and finalized entry. Record locked permanently.',
                    'created_at' => now(),
                ]);
            });

            $log->load(['driver:id,name,email', 'truck:id,truck_number,plate_number', 'audits']);

            return response()->json([
                'success' => true,
                'message' => 'Collection log finalized successfully. It is now permanently locked.',
                'data' => $log,
            ]);

        } catch (DomainException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to finalize: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Returns Barangays 1 through 40 for Cagayan de Oro City
     * with GPS coordinates, assigned truck routes (KAL-101 to KAL-104),
     * and current collection status.
     */
    public function barangays1to40(): JsonResponse
    {
        $barangays = Barangay::where('code', 'like', 'CDO-BRGY-%')
            ->orderBy('id', 'asc')
            ->get();

        // Calculate today's collection stats per barangay from actual collection logs
        $todayLogs = CollectionLog::whereDate('created_at', now()->toDateString())
            ->select('barangay_name', DB::raw('SUM(amount_collected) as total_tons'), DB::raw('COUNT(*) as entries_count'))
            ->groupBy('barangay_name')
            ->get()
            ->keyBy('barangay_name');

        $mapped = $barangays->map(function ($b, $index) use ($todayLogs) {
            $num = $index + 1;
            $routeNum = ceil($num / 10);
            $truckPlate = sprintf("KAL-%03d", 100 + $routeNum);
            $logStats = $todayLogs->get($b->name);

            return [
                'id' => $b->id,
                'number' => $num,
                'name' => $b->name,
                'code' => $b->code,
                'city' => $b->city,
                'latitude' => (float) $b->latitude,
                'longitude' => (float) $b->longitude,
                'route_number' => $routeNum,
                'route_name' => "Route #0{$routeNum} (Barangay " . (($routeNum - 1) * 10 + 1) . " - " . ($routeNum * 10) . ")",
                'assigned_truck' => $truckPlate,
                'description' => $b->description,
                'today_collected_tons' => $logStats ? (float) $logStats->total_tons : 0.0,
                'today_logs_count' => $logStats ? (int) $logStats->entries_count : 0,
            ];
        });

        return response()->json([
            'success' => true,
            'city' => 'Cagayan de Oro City',
            'region' => 'Northern Mindanao (Region X), Philippines',
            'total_barangays' => $mapped->count(),
            'routes' => [
                ['route_number' => 1, 'name' => 'Route 1: North Poblacion', 'barangays' => '1 - 10', 'truck' => 'KAL-101'],
                ['route_number' => 2, 'name' => 'Route 2: Central Poblacion', 'barangays' => '11 - 20', 'truck' => 'KAL-102'],
                ['route_number' => 3, 'name' => 'Route 3: East Poblacion', 'barangays' => '21 - 30', 'truck' => 'KAL-103'],
                ['route_number' => 4, 'name' => 'Route 4: South Poblacion', 'barangays' => '31 - 40', 'truck' => 'KAL-104'],
            ],
            'data' => $mapped,
        ]);
    }
}
