<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CollectionSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'barangay_id',
        'truck_id',
        'driver_id',
        'date',
        'day',
        'pickup_time',
        'schedule_type',
        'notes',
        'active',
        'status',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
        'active' => 'boolean',
    ];

    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }

    public function truck(): BelongsTo
    {
        return $this->belongsTo(Truck::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function collectionLogs(): HasMany
    {
        return $this->hasMany(CollectionLog::class, 'schedule_id');
    }
}