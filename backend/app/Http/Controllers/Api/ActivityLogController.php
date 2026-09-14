<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | GET ACTIVITY / AUDIT LOGS
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        $query = ActivityLog::with('user:id,name,email');

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('action')) {
            $query->where('action', 'like', "%{$request->action}%");
        }

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $logs = $query
            ->latest()
            ->limit(500)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Activity logs retrieved successfully.',
            'count' => $logs->count(),
            'logs' => $logs,
        ]);
    }
}
