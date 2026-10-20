<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Services\PushNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NotificationController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | GET ALL USER NOTIFICATIONS
    |--------------------------------------------------------------------------
    */
    public function index(Request $request)
    {
        $user = $request->user();
        $userId = $user ? $user->id : (int)$request->input('user_id', 0);

        $query = Notification::query();

        if ($userId > 0) {
            $query->where('user_id', $userId);
        } else {
            // Unauthenticated/fallback: return latest notifications
            $barangayId = $request->input('barangay_id');
            if ($barangayId) {
                $barangayUserIds = \App\Models\User::where('barangay_id', $barangayId)->pluck('id')->toArray();
                if (!empty($barangayUserIds)) {
                    $query->whereIn('user_id', $barangayUserIds);
                }
            }
        }

        $notifications = $query->latest()->take(50)->get();

        return response()->json([
            'success' => true,
            'message' => 'Notifications retrieved successfully.',
            'notifications' => $notifications,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | GET LATEST BROADCAST & NOTIFICATION FOR REAL-TIME MOBILE SYNC
    |--------------------------------------------------------------------------
    */
    public function latest(Request $request)
    {
        $user = $request->user();
        $userId = $user ? $user->id : (int)$request->input('user_id', 0);

        $broadcast = PushNotificationService::getLatestBroadcast();

        $latestDbNotif = null;
        $unreadCount = 0;

        if ($userId > 0) {
            $latestDbNotif = Notification::where('user_id', $userId)->latest()->first();
            $unreadCount = Notification::where('user_id', $userId)->where('is_read', false)->count();
        } else {
            $latestDbNotif = Notification::latest()->first();
        }

        return response()->json([
            'success' => true,
            'latest_broadcast' => $broadcast,
            'latest_notification' => $latestDbNotif,
            'unread_count' => $unreadCount,
            'server_time' => now()->toIso8601String(),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | MARK NOTIFICATION AS READ
    |--------------------------------------------------------------------------
    */
    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();
        $query = Notification::where('id', $id);
        if ($user) {
            $query->where('user_id', $user->id);
        }
        $notification = $query->first();

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

    /*
    |--------------------------------------------------------------------------
    | REGISTER DEVICE PUSH TOKEN
    |--------------------------------------------------------------------------
    */
    public function registerToken(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
            'role' => 'nullable|string',
            'barangay_id' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid device token registration payload.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $userId = $user ? $user->id : (int)$request->input('user_id', 0);
        $role = $request->input('role') ?? ($user && $user->roles()->first() ? $user->roles()->first()->name : 'resident');
        $barangayId = $request->input('barangay_id') ?? ($user ? $user->barangay_id : null);

        PushNotificationService::registerToken($userId, $request->token, $role, $barangayId);

        return response()->json([
            'success' => true,
            'message' => 'Device push token registered successfully.',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | REMOVE DEVICE PUSH TOKEN (LOGOUT)
    |--------------------------------------------------------------------------
    */
    public function removeToken(Request $request)
    {
        $user = $request->user();
        $userId = $user ? $user->id : (int)$request->input('user_id', 0);
        $token = $request->input('token');

        PushNotificationService::removeToken($userId, $token);

        return response()->json([
            'success' => true,
            'message' => 'Device push token removed successfully.',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | BROADCAST PUSH NOTIFICATION (Super Admin / Admin)
    |--------------------------------------------------------------------------
    | Matches approved scope: collection schedules, sanitation advisories,
    | inspection notices, and city announcements. Targetable by role & barangay.
    */
    public function broadcast(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:schedule,advisory,inspection,announcement,report_update,feedback_update',
            'title' => 'required|string|max:150',
            'message' => 'required|string|max:500',
            'role' => 'nullable|string',
            'barangay_id' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error for broadcast announcement.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $filters = [];
        if ($request->filled('role')) {
            $filters['role'] = $request->role;
        }
        if ($request->filled('barangay_id')) {
            $filters['barangay_id'] = (int)$request->barangay_id;
        }

        $result = PushNotificationService::broadcast(
            $request->type,
            $request->title,
            $request->message,
            $filters
        );

        return response()->json($result);
    }
}
