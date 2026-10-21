<?php

namespace App\Console\Commands;

use App\Services\ScheduledPickupNotificationService;
use Illuminate\Console\Command;

class CheckScheduledPickups extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pickups:check-scheduled {--date= : The date to check for scheduled pickups (YYYY-MM-DD)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = "Scan day-of-pickup schedules and broadcast notifications with location, time, driver, and status to web dashboard and mobile app.";

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $date = $this->option('date');
        $this->info("Scanning scheduled pickups for " . ($date ?: 'today') . "...");

        $result = ScheduledPickupNotificationService::checkAndNotify($date);

        $this->info("Found {$result['pickups_count']} pickup(s). Created {$result['notifications_created']} notification record(s).");

        foreach ($result['pickups'] as $p) {
            $this->line(" - [{$p['status']}] {$p['barangay_name']} @ {$p['time']} (Driver: {$p['assigned_driver']})");
        }

        return Command::SUCCESS;
    }
}
