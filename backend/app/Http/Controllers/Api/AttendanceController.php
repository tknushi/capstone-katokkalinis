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
}