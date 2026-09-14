<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | GET ALL USER NOTIFICATIONS
    |--------------------------------------------------------------------------
    */
    public function index(Request $request)
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Notifications retrieved successfully.',
            'notifications' => $notifications,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | MARK NOTIFICATION AS READ
    |--------------------------------------------------------------------------
    */
    public function markAsRead(Request $request, $id)
    {
        $notification = Notification::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found.',
            ], 404);
        }

        $notification->is_read = true;
        $notification->save();

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read.',
            'notification' => $notification,
        ]);
    }
}
