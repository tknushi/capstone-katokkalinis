<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RouteTelemetryEvent extends Model
{
    use HasFactory;

    protected $table = 'route_telemetry_events';

    protected $fillable = [
        'run_id',
        'stop_id',
        'event_type', // arrived, departed, collected, delayed, skipped, checkpoint
        'timestamp',
        'volume',
        'notes',
    ];

    protected $casts = [
        'timestamp' => 'datetime',
        'volume' => 'float',
    ];

    public function run(): BelongsTo
    {
        return $this->belongsTo(RouteRun::class, 'run_id');
    }

    public function stop(): BelongsTo
    {
        return $this->belongsTo(RouteStop::class, 'stop_id');
    }
}
