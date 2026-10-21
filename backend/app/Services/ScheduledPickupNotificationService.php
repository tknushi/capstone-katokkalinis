<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\CollectionRoute;
use App\Models\CollectionSchedule;
use App\Models\Notification;
use App\Models\Truck;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ScheduledPickupNotificationService
{
    /**
     * Check for today's scheduled pickups and create notifications for web dashboard and driver mobile app.
     *
     * @param string|null $date YYYY-MM-DD (defaults to today)
     * @return array Summary of pickups and notifications generated
     */
    public static function checkAndNotify(?string $date = null): array
    {
        $targetDate = $date ? Carbon::parse($date) : Carbon::today();
        $dateStr = $targetDate->toDateString();
        $dayName = $targetDate->format('l');

        $generated = [];

        // 1. Query collection_schedules (date = today OR day = today's day of week & active)
        $schedules = CollectionSchedule::with(['barangay', 'tasks.driver.user'])
            ->where(function ($q) use ($dateStr, $dayName) {
                $q->whereDate('date', $dateStr)
                  ->orWhere(function ($sub) use ($dayName) {
                      $sub->where('day', $dayName)->where('active', true);
                  });
            })
            ->get();

        // 2. Query collection_routes (collection_date = today)
        $routes = CollectionRoute::with(['barangay', 'truck.driver'])
            ->whereDate('collection_date', $dateStr)
            ->get();

        $pickups = [];

        foreach ($schedules as $sched) {
            $barangayName = $sched->barangay ? $sched->barangay->name : 'Barangay 12';
            $time = $sched->pickup_time ? Carbon::parse($sched->pickup_time)->format('h:i A') : '08:00 AM';

            // Find assigned driver from Task, or default to KAL-104 driver
            $driverName = 'Danilo Ramos (KAL-101)';
            $driverUserId = null;

            if ($sched->tasks && $sched->tasks->isNotEmpty()) {
                $firstTask = $sched->tasks->first();
                if ($firstTask && $firstTask->driver) {
                    $driverName = $firstTask->driver->name ?? 'Danilo Ramos';
                    $driverUserId = $firstTask->driver->user_id ?? null;
                }
            } else {
                // Check if a truck is operating in this zone
                $matchingTruck = Truck::with('driver')->where('status', '!=', 'inactive')->first();
                if ($matchingTruck && $matchingTruck->driver) {
                    $driverName = "{$matchingTruck->driver->name} ({$matchingTruck->plate_number})";
                    $driverUserId = $matchingTruck->driver->id ?? null;
                }
            }

            $rawStatus = $sched->status ?? 'scheduled';
            $statusLabel = ucfirst(str_replace('_', ' ', $rawStatus));

            $pickups[] = [
                'type' => 'schedule',
                'source_id' => $sched->id,
                'barangay_id' => $sched->barangay_id,
                'barangay_name' => $barangayName,
                'time' => $time,
                'assigned_driver' => $driverName,
                'driver_user_id' => $driverUserId,
                'status' => $statusLabel,
                'raw_status' => $rawStatus,
                'notes' => $sched->notes,
            ];
        }

        foreach ($routes as $route) {
            $barangayName = $route->barangay ? $route->barangay->name : 'City Sector';
            $startTime = $route->start_time ? Carbon::parse($route->start_time)->format('h:i A') : '07:30 AM';
            $endTime = $route->end_time ? Carbon::parse($route->end_time)->format('h:i A') : '';
            $time = $endTime ? "{$startTime} - {$endTime}" : $startTime;

            $driverName = 'Juan Driver (KAL-101)';
            $driverUserId = null;
            if ($route->truck && $route->truck->driver) {
                $driverName = "{$route->truck->driver->name} ({$route->truck->plate_number})";
                $driverUserId = $route->truck->driver->id ?? null;
            }

            $rawStatus = $route->status ?? 'scheduled';
            $statusLabel = ucfirst(str_replace('_', ' ', $rawStatus));

            $pickups[] = [
                'type' => 'route',
                'source_id' => $route->id,
                'barangay_id' => $route->barangay_id,
                'barangay_name' => $barangayName,
                'time' => $time,
                'assigned_driver' => $driverName,
                'driver_user_id' => $driverUserId,
                'status' => $statusLabel,
                'raw_status' => $rawStatus,
                'notes' => $route->notes,
            ];
        }

        // Target recipients:
        // 1. Admins and Super Admins (web dashboard view)
        $admins = User::whereHas('roles', function ($q) {
            $q->whereIn('name', ['admin', 'super_admin']);
        })->get();

        // 2. All driver accounts (mobile app view)
        $driverUsers = User::whereHas('roles', function ($q) {
            $q->where('name', 'driver');
        })->get();

        foreach ($pickups as $p) {
            $title = "Scheduled Pickup Today - {$p['barangay_name']}";
            $message = "Today's Scheduled Pickup: {$p['barangay_name']} at {$p['time']}. Assigned Driver: {$p['assigned_driver']}. Status: {$p['status']}.";

            $recipients = collect();
            $recipients = $recipients->merge($admins);

            if ($p['driver_user_id']) {
                $specificDriver = User::find($p['driver_user_id']);
                if ($specificDriver) {
                    $recipients->push($specificDriver);
                }
            } else {
                $recipients = $recipients->merge($driverUsers);
            }

            $recipients = $recipients->unique('id');

            foreach ($recipients as $recipient) {
                // Deduplicate for today: prevent duplicate notification for the same user and title
                $exists = Notification::where('user_id', $recipient->id)
                    ->where('type', 'schedule')
                    ->whereDate('created_at', $dateStr)
                    ->where('title', $title)
                    ->first();

                if (!$exists) {
                    $notif = Notification::create([
                        'user_id' => $recipient->id,
                        'title' => $title,
                        'message' => $message,
                        'type' => 'schedule',
                        'is_read' => false,
                    ]);

                    $generated[] = [
                        'notification_id' => $notif->id,
                        'user_id' => $recipient->id,
                        'user_name' => $recipient->name,
                        'title' => $title,
                        'message' => $message,
                        'time' => $p['time'],
                        'assigned_driver' => $p['assigned_driver'],
                        'status' => $p['status'],
                        'barangay_name' => $p['barangay_name'],
                    ];
                }
            }

            // Also broadcast push notification to registered Expo mobile tokens
            try {
                PushNotificationService::broadcast(
                    'schedule',
                    $title,
                    $message,
                    ['barangay_id' => $p['barangay_id']]
                );
            } catch (\Throwable $e) {
                Log::warning('Expo Push Broadcast warning: ' . $e->getMessage());
            }

            // Log activity
            ActivityLog::record(
                'schedule.pickup_alert',
                "Scheduled pickup alert generated: {$p['barangay_name']} at {$p['time']} (Driver: {$p['assigned_driver']})."
            );
        }

        return [
            'success' => true,
            'date' => $dateStr,
            'day' => $dayName,
            'pickups_count' => count($pickups),
            'notifications_created' => count($generated),
            'pickups' => $pickups,
            'generated' => $generated,
        ];
    }
}
