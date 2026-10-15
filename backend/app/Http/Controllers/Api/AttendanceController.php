<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AttendanceController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | GET ATTENDANCE
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        $query = Attendance::with('user');

        /*
        |--------------------------------------------------------------------------
        | SEARCH
        |--------------------------------------------------------------------------
        */

        if ($request->filled('search')) {
            $search = $request->search;

            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        /*
        |--------------------------------------------------------------------------
        | DATE FILTER
        |--------------------------------------------------------------------------
        */

        if ($request->filled('date')) {
            $query->where('date', $request->date);
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
        | ARCHIVE / ACTIVE FILTER
        |--------------------------------------------------------------------------
        */

        if ($request->has('status_filter')) {
            $statusFilter = strtolower($request->status_filter);
            if ($statusFilter === 'active') {
                $query->where('is_archived', false);
            } elseif ($statusFilter === 'archived') {
                $query->where('is_archived', true);
            }
        } elseif ($request->has('archived')) {
            $isArchived = filter_var($request->archived, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_archived', $isArchived);
        }

        $attendance = $query
            ->latest('date')
            ->latest('time_in')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Attendance retrieved successfully.',
            'count' => $attendance->count(),
            'attendance' => $attendance,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | CREATE ATTENDANCE
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',

            'date' => 'required|date',

            'time_in' => 'nullable|date_format:H:i',
            'time_out' => 'nullable|date_format:H:i',

            'status' => 'required|in:present,late,absent,on_leave',

            'remarks' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please check the attendance information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $existing = Attendance::where('user_id', $request->user_id)
            ->where('date', $request->date)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Attendance for this employee on this date already exists.',
            ], 409);
        }

        $attendance = Attendance::create([
            'user_id' => $request->user_id,
            'date' => $request->date,
            'time_in' => $request->time_in,
            'time_out' => $request->time_out,
            'status' => $request->status,
            'remarks' => $request->remarks,
        ]);

        $attendance->load('user');

        ActivityLog::record(
            'attendance.created',
            "Recorded attendance for {$attendance->user->name} on {$attendance->date}.",
            $attendance
        );

        return response()->json([
            'success' => true,
            'message' => 'Attendance created successfully.',
            'attendance' => $attendance,
        ], 201);
    }


    /*
    |--------------------------------------------------------------------------
    | GET SINGLE ATTENDANCE
    |--------------------------------------------------------------------------
    */

    public function show($id)
    {
        $attendance = Attendance::with('user')->find($id);

        if (!$attendance) {
            return response()->json([
                'success' => false,
                'message' => 'Attendance record not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Attendance retrieved successfully.',
            'attendance' => $attendance,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE ATTENDANCE
    |--------------------------------------------------------------------------
    */

    public function update(Request $request, $id)
    {
        $attendance = Attendance::find($id);

        if (!$attendance) {
            return response()->json([
                'success' => false,
                'message' => 'Attendance record not found.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'user_id' => 'sometimes|required|exists:users,id',

            'date' => 'sometimes|required|date',

            'time_in' => 'nullable|date_format:H:i',
            'time_out' => 'nullable|date_format:H:i',

            'status' => 'sometimes|required|in:present,late,absent,on_leave',

            'remarks' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please check the attendance information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Prevent duplicate employee/date combination
        |--------------------------------------------------------------------------
        */

        if ($request->filled('user_id') || $request->filled('date')) {

            $userId = $request->user_id ?? $attendance->user_id;
            $date = $request->date ?? $attendance->date;

            $duplicate = Attendance::where('user_id', $userId)
                ->where('date', $date)
                ->where('id', '!=', $attendance->id)
                ->exists();

            if ($duplicate) {
                return response()->json([
                    'success' => false,
                    'message' => 'Attendance for this employee on this date already exists.',
                ], 409);
            }
        }

        $attendance->update($request->only([
            'user_id',
            'date',
            'time_in',
            'time_out',
            'status',
            'remarks',
        ]));

        $attendance->load('user');

        return response()->json([
            'success' => true,
            'message' => 'Attendance updated successfully.',
            'attendance' => $attendance,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE ATTENDANCE STATUS
    |--------------------------------------------------------------------------
    */

    public function updateStatus(Request $request, $id)
    {
        $attendance = Attendance::find($id);

        if (!$attendance) {
            return response()->json([
                'success' => false,
                'message' => 'Attendance record not found.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:present,late,absent,on_leave',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid attendance status.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $attendance->status = $request->status;
        $attendance->save();

        $attendance->load('user');

        ActivityLog::record(
            'attendance.status_updated',
            "Set attendance #{$attendance->id} status to {$attendance->status}.",
            $attendance
        );

        return response()->json([
            'success' => true,
            'message' => 'Attendance status updated successfully.',
            'attendance' => $attendance,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | DELETE ATTENDANCE
    |--------------------------------------------------------------------------
    */

    public function destroy($id)
    {
        $attendance = Attendance::find($id);

        if (!$attendance) {
            return response()->json([
                'success' => false,
                'message' => 'Attendance record not found.',
            ], 404);
        }

        $attendance->delete();

        ActivityLog::record(
            'attendance.deleted',
            "Deleted attendance record #{$id}."
        );

        return response()->json([
            'success' => true,
            'message' => 'Attendance deleted successfully.',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | AUTOMATED CHECK-IN / CHECK-OUT (SELF) & CURRENT SESSION
    |--------------------------------------------------------------------------
    */

    public function current(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $today = now()->toDateString();
        $attendance = Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->latest('id')
            ->first();

        $isCheckedIn = $attendance && !empty($attendance->time_in) && empty($attendance->time_out);

        return response()->json([
            'success' => true,
            'attendance' => $attendance,
            'is_checked_in' => $isCheckedIn,
            'date' => $today,
            'server_time' => now()->format('H:i:s'),
        ]);
    }

    public function checkIn(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $today = now()->toDateString();
        $nowTime = now()->format('H:i:s');

        $attendance = Attendance::firstOrCreate(
            ['user_id' => $user->id, 'date' => $today],
            [
                'time_in' => $nowTime,
                'status' => 'present',
                'remarks' => $request->remarks ?? 'Self check-in',
            ]
        );

        $attendance->load('user');

        ActivityLog::record(
            'attendance.check_in',
            "{$user->name} recorded check-in for {$today} at {$nowTime}.",
            $attendance,
            $user->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Check-in recorded successfully.',
            'attendance' => $attendance,
        ]);
    }

    public function checkOut(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $today = now()->toDateString();
        $nowTime = now()->format('H:i:s');

        $attendance = Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        if (!$attendance) {
            $attendance = Attendance::create([
                'user_id' => $user->id,
                'date' => $today,
                'time_in' => $nowTime,
                'time_out' => $nowTime,
                'status' => 'present',
                'remarks' => $request->remarks ?? 'Self check-out',
            ]);
        } else {
            $attendance->time_out = $nowTime;
            $attendance->save();
        }

        $attendance->load('user');

        ActivityLog::record(
            'attendance.check_out',
            "{$user->name} recorded check-out for {$today} at {$nowTime}.",
            $attendance,
            $user->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Check-out recorded successfully.',
            'attendance' => $attendance,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | ARCHIVE ATTENDANCE RECORD (SOFT-DELETE)
    |--------------------------------------------------------------------------
    */

    public function archive(Request $request, $id)
    {
        $attendance = Attendance::with('user')->find($id);

        if (!$attendance) {
            return response()->json([
                'success' => false,
                'message' => 'Attendance record not found.',
            ], 404);
        }

        $attendance->is_archived = true;
        $attendance->archived_at = now();
        $attendance->save();

        ActivityLog::record(
            'attendance.archived',
            "Archived attendance record #{$attendance->id} (" . ($attendance->user->name ?? 'User') . " on {$attendance->date}).",
            $attendance
        );

        return response()->json([
            'success' => true,
            'message' => 'Attendance record archived successfully.',
            'attendance' => $attendance,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | RESTORE ATTENDANCE RECORD (UNARCHIVE)
    |--------------------------------------------------------------------------
    */

    public function restore(Request $request, $id)
    {
        $attendance = Attendance::with('user')->find($id);

        if (!$attendance) {
            return response()->json([
                'success' => false,
                'message' => 'Attendance record not found.',
            ], 404);
        }

        $attendance->is_archived = false;
        $attendance->archived_at = null;
        $attendance->save();

        ActivityLog::record(
            'attendance.restored',
            "Restored attendance record #{$attendance->id} (" . ($attendance->user->name ?? 'User') . " on {$attendance->date}).",
            $attendance
        );

        return response()->json([
            'success' => true,
            'message' => 'Attendance record restored successfully.',
            'attendance' => $attendance,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | BULK ARCHIVE ATTENDANCE RECORDS (SOFT-DELETE)
    |--------------------------------------------------------------------------
    */

    public function bulkArchive(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:attendances,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide a valid array of attendance record IDs to archive.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $records = Attendance::whereIn('id', $request->ids)->get();

        if ($records->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No matching attendance records found to archive.',
            ], 404);
        }

        foreach ($records as $record) {
            $record->is_archived = true;
            $record->archived_at = now();
            $record->save();
        }

        $count = $records->count();
        ActivityLog::record(
            'attendance.bulk_archived',
            "Bulk archived {$count} attendance record(s)."
        );

        return response()->json([
            'success' => true,
            'message' => "{$count} attendance " . ($count === 1 ? 'record' : 'records') . " archived successfully.",
            'archived_count' => $count,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | BULK RESTORE ATTENDANCE RECORDS
    |--------------------------------------------------------------------------
    */

    public function bulkRestore(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:attendances,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide a valid array of attendance record IDs to restore.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $records = Attendance::whereIn('id', $request->ids)->get();

        if ($records->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No matching attendance records found to restore.',
            ], 404);
        }

        foreach ($records as $record) {
            $record->is_archived = false;
            $record->archived_at = null;
            $record->save();
        }

        $count = $records->count();
        ActivityLog::record(
            'attendance.bulk_restored',
            "Bulk restored {$count} attendance record(s)."
        );

        return response()->json([
            'success' => true,
            'message' => "{$count} attendance " . ($count === 1 ? 'record' : 'records') . " restored successfully.",
            'restored_count' => $count,
        ]);
    }
}