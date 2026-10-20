<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\CollectionSchedule;
use App\Models\Notification;
use App\Models\User;
use App\Services\PushNotificationService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ScheduleController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | GET ALL SCHEDULES
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        $query = CollectionSchedule::with('barangay');

        if ($request->filled('barangay_id')) {
            $targetBarangay = \App\Models\Barangay::find($request->barangay_id);
            if ($targetBarangay) {
                $matchingIds = \App\Models\Barangay::where('name', $targetBarangay->name)->pluck('id')->toArray();
                $query->whereIn('barangay_id', $matchingIds);
            } else {
                $query->where('barangay_id', $request->barangay_id);
            }
        } elseif ($request->filled('barangay')) {
            $barangayName = trim($request->barangay);
            $query->whereHas('barangay', function ($q) use ($barangayName) {
                $q->where('name', 'like', "%{$barangayName}%");
            });
        }

        if ($request->filled('day')) {
            $query->where('day', $request->day);
        }

        $schedules = $query
            ->orderBy('date')
            ->orderBy('pickup_time')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Schedules retrieved successfully.',
            'count' => $schedules->count(),
            'schedules' => $schedules,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | GET NEXT SCHEDULE
    |--------------------------------------------------------------------------
    */

    public function next(Request $request)
    {
        $today = Carbon::today()->toDateString();
        $query = CollectionSchedule::with('barangay');

        if ($request->filled('barangay_id')) {
            $targetBarangay = \App\Models\Barangay::find($request->barangay_id);
            if ($targetBarangay) {
                $matchingIds = \App\Models\Barangay::where('name', $targetBarangay->name)->pluck('id')->toArray();
                $query->whereIn('barangay_id', $matchingIds);
            } else {
                $query->where('barangay_id', $request->barangay_id);
            }
        } elseif ($request->filled('barangay')) {
            $barangayName = trim($request->barangay);
            $query->whereHas('barangay', function ($q) use ($barangayName) {
                $q->where('name', 'like', "%{$barangayName}%");
            });
        }

        // Try to find upcoming schedule from today onwards
        $schedule = (clone $query)
            ->where('date', '>=', $today)
            ->where('status', '!=', 'completed')
            ->orderBy('date')
            ->orderBy('pickup_time')
            ->first();

        // If no upcoming schedule, grab closest available schedule
        if (!$schedule) {
            $schedule = $query
                ->orderByDesc('date')
                ->first();
        }

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'No schedules found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Next schedule retrieved successfully.',
            'schedule' => $schedule,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | COMPLETE SCHEDULE
    |--------------------------------------------------------------------------
    */

    public function complete(Request $request, $id)
    {
        $schedule = CollectionSchedule::find($id);

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Schedule not found.',
            ], 404);
        }

        $schedule->status = 'completed';
        $schedule->save();

        $schedule->load('barangay');

        ActivityLog::record(
            'schedule.completed',
            "Completed schedule #{$schedule->id} for {$schedule->barangay->name}.",
            $schedule
        );

        // Dispatch push notification to residents of this barangay
        $barangay = $schedule->barangay;
        if ($barangay) {
            try {
                PushNotificationService::broadcast(
                    'schedule',
                    'Waste Collection Completed',
                    "Scheduled waste collection in {$barangay->name} has been completed.",
                    [
                        'role' => 'resident',
                        'barangay_id' => $barangay->id,
                    ],
                    ['schedule_id' => $schedule->id]
                );
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning("Could not broadcast completion push: " . $e->getMessage());
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Schedule marked as completed.',
            'schedule' => $schedule,
        ]);
    }



    /*
    |--------------------------------------------------------------------------
    | CREATE SCHEDULE
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'barangay_id' => 'required|exists:barangays,id',
            'date' => 'required|date',
            'pickup_time' => 'required|date_format:H:i',
            'schedule_type' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'active' => 'nullable|boolean',
            'status' => 'required|in:scheduled,in_progress,completed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please check the schedule information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $targetBarangay = \App\Models\Barangay::find($request->barangay_id);
        $canonicalBarangayId = $request->barangay_id;
        if ($targetBarangay) {
            $first = \App\Models\Barangay::where('name', $targetBarangay->name)->orderBy('id')->first();
            if ($first) {
                $canonicalBarangayId = $first->id;
            }
        }

        $schedule = CollectionSchedule::create([
            'barangay_id' => $canonicalBarangayId,
            'date' => $request->date,
            'day' => Carbon::parse($request->date)->format('l'),
            'pickup_time' => $request->pickup_time,
            'schedule_type' => $request->schedule_type ?? 'regular',
            'notes' => $request->notes,
            'active' => $request->has('active') ? $request->boolean('active') : true,
            'status' => $request->status,
        ]);

        $schedule->load('barangay');

        ActivityLog::record(
            'schedule.created',
            "Added {$schedule->day} schedule for {$schedule->barangay->name}.",
            $schedule
        );

        // Dispatch real-time push notification for this schedule
        try {
            $barangayName = $schedule->barangay ? $schedule->barangay->name : "Barangay";
            $formattedTime = substr($schedule->pickup_time, 0, 5);
            PushNotificationService::broadcast(
                'schedule',
                "Collection Schedule: {$barangayName}",
                "Pickup scheduled for {$schedule->day}, {$schedule->date} at {$formattedTime}.",
                [
                    'barangay_id' => $schedule->barangay_id,
                    'role' => 'resident',
                ],
                ['schedule_id' => $schedule->id]
            );
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning("Could not broadcast schedule push: " . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Schedule created successfully.',
            'schedule' => $schedule,
        ], 201);
    }


    /*
    |--------------------------------------------------------------------------
    | GET SINGLE SCHEDULE
    |--------------------------------------------------------------------------
    */

    public function show($id)
    {
        $schedule = CollectionSchedule::with('barangay')->find($id);

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Schedule not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Schedule retrieved successfully.',
            'schedule' => $schedule,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE SCHEDULE
    |--------------------------------------------------------------------------
    */

    public function update(Request $request, $id)
    {
        $schedule = CollectionSchedule::find($id);

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Schedule not found.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'barangay_id' => 'sometimes|required|exists:barangays,id',
            'date' => 'sometimes|required|date',
            'pickup_time' => 'sometimes|required|date_format:H:i',
            'schedule_type' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'active' => 'nullable|boolean',
            'status' => 'sometimes|required|in:scheduled,in_progress,completed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please check the schedule information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $schedule->update($request->only([
            'barangay_id',
            'date',
            'pickup_time',
            'schedule_type',
            'notes',
            'active',
            'status',
        ]));

        if ($request->filled('date')) {
            $schedule->day = Carbon::parse($request->date)->format('l');
            $schedule->save();
        }

        $schedule->load('barangay');

        ActivityLog::record(
            'schedule.updated',
            "Updated schedule #{$schedule->id}.",
            $schedule
        );

        return response()->json([
            'success' => true,
            'message' => 'Schedule updated successfully.',
            'schedule' => $schedule,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | DELETE SCHEDULE
    |--------------------------------------------------------------------------
    */

    public function destroy($id)
    {
        $schedule = CollectionSchedule::find($id);

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Schedule not found.',
            ], 404);
        }

        $schedule->delete();

        ActivityLog::record(
            'schedule.deleted',
            "Deleted schedule #{$id}."
        );

        return response()->json([
            'success' => true,
            'message' => 'Schedule deleted successfully.',
        ]);
    }
}
