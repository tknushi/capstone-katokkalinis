<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RouteStop extends Model
{
    use HasFactory;

    protected $table = 'route_stops';

    protected $fillable = [
        'route_id',
        'stop_order',
        'name',
        'barangay_or_market',
        'latitude',
        'longitude',
        'scheduled_time',
        'notes',
    ];

    protected $casts = [
        'stop_order' => 'integer',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    public function route(): BelongsTo
    {
        return $this->belongsTo(Route::class, 'route_id');
    }

    public function telemetryEvents(): HasMany
    {
        return $this->hasMany(RouteTelemetryEvent::class, 'stop_id');
    }
}
