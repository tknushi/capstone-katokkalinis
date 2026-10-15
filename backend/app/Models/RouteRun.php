<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RouteRun extends Model
{
    use HasFactory;

    protected $table = 'route_runs';

    protected $fillable = [
        'truck_id',
        'driver_id',
        'route_id',
        'date',
        'start',
        'end',
        'status', // scheduled, in_progress, completed, cancelled
        'tonnage',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
        'tonnage' => 'float',
    ];

    public function truck(): BelongsTo
    {
        return $this->belongsTo(Truck::class, 'truck_id');
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function route(): BelongsTo
    {
        return $this->belongsTo(Route::class, 'route_id');
    }

    public function telemetryEvents(): HasMany
    {
        return $this->hasMany(RouteTelemetryEvent::class, 'run_id')->orderBy('timestamp', 'asc');
    }
}
