<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Daily check for pickups scheduled for that date (Requirement 3)
Schedule::command('pickups:check-scheduled')->dailyAt('06:00');
