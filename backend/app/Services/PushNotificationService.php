<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PushNotificationService
{
    const STORAGE_FILE = 'device_tokens.json';

    // Approved notification types strictly matching approved scope
    const ALLOWED_TYPES = [
        'schedule' => 'Collection Schedule',
        'advisory' => 'Sanitation Advisory',
        'inspection' => 'Inspection Notice',
        'announcement' => 'City Announcement',
        'report_update' => 'Report Status Update',
        'feedback_update' => 'Feedback Response',
    ];

    /**
     * Get all active tokens from persistent storage.
     */
    public static function getAllTokens(): array
    {
        try {
            if (Storage::disk('local')->exists(self::STORAGE_FILE)) {
                $raw = Storage::disk('local')->get(self::STORAGE_FILE);
                $decoded = json_decode($raw, true);
                return is_array($decoded) ? $decoded : [];
            }
        } catch (\Throwable $e) {
            Log::warning('Error reading device tokens file: ' . $e->getMessage());
        }
        return [];
    }

    /**
     * Save tokens to persistent storage.
     */
    public static function saveTokens(array $tokens): void
    {
        try {
            Storage::disk('local')->put(self::STORAGE_FILE, json_encode($tokens, JSON_PRETTY_PRINT));
        } catch (\Throwable $e) {
            Log::warning('Error saving device tokens file: ' . $e->getMessage());
        }
    }

    /**
     * Register or update a device token for a user.
     */
    public static function registerToken(int $userId, string $token, ?string $role = null, ?int $barangayId = null): void
    {
        $tokens = self::getAllTokens();

        // Remove any prior entry with this exact token to prevent duplicate sends
        $tokens = array_values(array_filter($tokens, fn($item) => ($item['token'] ?? '') !== $token));

        $tokens[] = [
            'user_id' => $userId,
            'token' => $token,
            'role' => $role ?: 'resident',
            'barangay_id' => $barangayId,
            'updated_at' => now()->toIso8601String(),
        ];

        self::saveTokens($tokens);
    }

    /**
     * Remove a device token (e.g., on user logout).
     */
    public static function removeToken(int $userId, ?string $token = null): void
    {
        $tokens = self::getAllTokens();

        $tokens = array_values(array_filter($tokens, function ($item) use ($userId, $token) {
            if ($token) {
                return ($item['token'] ?? '') !== $token;
            }
            return (int)($item['user_id'] ?? 0) !== $userId;
        }));

        self::saveTokens($tokens);
    }

    /**
     * Send direct push notifications through the official Expo Push Notification service.
     */
    public static function sendExpoPush(array $pushTokens, string $title, string $message, string $type, array $data = []): array
    {
        if (empty($pushTokens)) {
            return ['sent' => 0, 'tickets' => []];
        }

        // Deep linking route target based on notification type
        $screenRoute = match ($type) {
            'schedule' => '/schedule',
            'advisory' => '/notifications',
            'inspection' => '/inspector/scan',
            'announcement' => '/notifications',
            'report_update' => '/report',
            default => '/notifications',
        };

        $messages = [];
        foreach ($pushTokens as $token) {
            if (!str_starts_with($token, 'ExponentPushToken') && !str_starts_with($token, 'ExpoPushToken')) {
                continue;
            }

            $messages[] = [
                'to' => $token,
                'sound' => 'default',
                'title' => $title,
                'body' => $message,
                'data' => array_merge($data, [
                    'type' => $type,
                    'target_screen' => $screenRoute,
                ]),
                'channelId' => 'katokkalinis-alerts',
                'priority' => 'high',
            ];
        }

        if (empty($messages)) {
            return ['sent' => 0, 'message' => 'No valid Expo push tokens found.'];
        }

        try {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Accept-Encoding' => 'gzip, deflate',
                'Content-Type' => 'application/json',
            ])->post('https://exp.host/--/api/v2/push/send', $messages);

            $result = $response->json();
            return [
                'sent' => count($messages),
                'response' => $result,
            ];
        } catch (\Throwable $e) {
            Log::error('Expo Push Send Failed: ' . $e->getMessage());
            return [
                'sent' => 0,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Broadcast a targeted notification by role and/or barangay.
     */
    public static function broadcast(
        string $type,
        string $title,
        string $message,
        array $filters = [],
        array $extraData = []
    ): array {
        // Enforce approved scope
        if (!array_key_exists($type, self::ALLOWED_TYPES)) {
            throw new \InvalidArgumentException("Invalid notification type. Must be one of: " . implode(', ', array_keys(self::ALLOWED_TYPES)));
        }

        $allRegistered = self::getAllTokens();
        $targetTokens = [];
        $targetedUserIds = [];

        foreach ($allRegistered as $entry) {
            if (!empty($filters['role']) && ($entry['role'] ?? '') !== $filters['role']) {
                continue;
            }
            if (!empty($filters['barangay_id']) && (int)($entry['barangay_id'] ?? 0) !== (int)$filters['barangay_id']) {
                continue;
            }

            if (!empty($entry['token'])) {
                $targetTokens[] = $entry['token'];
            }
            if (!empty($entry['user_id'])) {
                $targetedUserIds[] = (int)$entry['user_id'];
            }
        }

        // Find matching users from database as well as registered device tokens
        $userQuery = User::query();
        if (!empty($filters['role'])) {
            $userQuery->whereHas('roles', function ($q) use ($filters) {
                $q->where('name', $filters['role']);
            });
        }
        if (!empty($filters['barangay_id'])) {
            $bId = (int)$filters['barangay_id'];
            $barangay = \App\Models\Barangay::find($bId);
            $bName = $barangay ? $barangay->name : "Barangay {$bId}";
            $userQuery->where(function ($q) use ($bId, $bName) {
                $q->where('barangay_id', $bId)
                  ->orWhere('address', 'like', "%{$bName}%");
            });
        }
        $dbUserIds = $userQuery->pluck('id')->toArray();
        $targetedUserIds = array_unique(array_merge($targetedUserIds, $dbUserIds));

        // Fallback: If no users matched, notify all users of the target role (or all residents)
        if (empty($targetedUserIds)) {
            $defaultRole = $filters['role'] ?? 'resident';
            $fallbackUsers = User::whereHas('roles', function ($q) use ($defaultRole) {
                $q->where('name', $defaultRole);
            })->pluck('id')->toArray();

            if (!empty($fallbackUsers)) {
                $targetedUserIds = $fallbackUsers;
            } else {
                $targetedUserIds = User::pluck('id')->take(20)->toArray();
            }
        }

        $targetedUserIds = array_unique($targetedUserIds);

        // Also create in-app notification records for targeted users
        foreach ($targetedUserIds as $uid) {
            try {
                Notification::create([
                    'user_id' => $uid,
                    'title' => $title,
                    'message' => $message,
                    'type' => $type,
                    'is_read' => false,
                ]);
            } catch (\Throwable $e) {
                // In case DB is temporarily offline, log and continue
                Log::warning("Could not persist notification in DB for user #{$uid}: " . $e->getMessage());
            }
        }

        // Persist latest broadcast for instant real-time sync with mobile
        $broadcastPayload = [
            'id' => (int)(microtime(true) * 1000),
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'role' => $filters['role'] ?? 'all',
            'barangay_id' => $filters['barangay_id'] ?? null,
            'created_at' => now()->toIso8601String(),
            'extra_data' => $extraData,
        ];
        try {
            Storage::disk('local')->put('latest_broadcast.json', json_encode($broadcastPayload, JSON_PRETTY_PRINT));
        } catch (\Throwable $e) {
            Log::warning('Could not save latest broadcast file: ' . $e->getMessage());
        }

        // Send real push notifications
        $pushResult = self::sendExpoPush($targetTokens, $title, $message, $type, $extraData);

        ActivityLog::record(
            'notification.broadcast',
            "Broadcasted {$type} push notification: '{$title}' to " . count($targetTokens) . " devices."
        );

        return [
            'success' => true,
            'type' => $type,
            'title' => $title,
            'devices_targeted' => count($targetTokens),
            'users_notified' => count($targetedUserIds),
            'broadcast' => $broadcastPayload,
            'push_delivery' => $pushResult,
        ];
    }

    /**
     * Retrieve the latest active broadcast payload.
     */
    public static function getLatestBroadcast(): ?array
    {
        try {
            if (Storage::disk('local')->exists('latest_broadcast.json')) {
                $raw = Storage::disk('local')->get('latest_broadcast.json');
                $decoded = json_decode($raw, true);
                return is_array($decoded) ? $decoded : null;
            }
        } catch (\Throwable $e) {
            Log::warning('Error reading latest broadcast file: ' . $e->getMessage());
        }
        return null;
    }
}
