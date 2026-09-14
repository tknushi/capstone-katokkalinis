<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TruckLocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'truck_id',
        'latitude',
        'longitude',
        'speed',
        'heading',
        'recorded_at',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'speed' => 'decimal:2',
        'heading' => 'decimal:2',
        'recorded_at' => 'datetime',
    ];

    public function truck(): BelongsTo
    {
        return $this->belongsTo(Truck::class);
    }
}