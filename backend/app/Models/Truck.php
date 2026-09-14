<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Truck extends Model
{
    use HasFactory;

    protected $fillable = [
        'truck_number',
        'plate_number',
        'driver_id',
        'contractor_id',
        'truck_type',
        'status',
    ];

    /**
     * Truck driver.
     *
     * trucks.driver_id -> users.id
     */
    public function driver(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'driver_id',
            'id'
        );
    }

    /**
     * Truck contractor.
     *
     * trucks.contractor_id -> contractors.id
     */
    public function contractor(): BelongsTo
    {
        return $this->belongsTo(
            Contractor::class,
            'contractor_id',
            'id'
        );
    }

    /**
     * GPS/location history for this truck.
     */
    public function locations(): HasMany
    {
        return $this->hasMany(
            TruckLocation::class,
            'truck_id',
            'id'
        );
    }

    /**
     * Collection routes assigned to this truck.
     */
    public function collectionRoutes(): HasMany
    {
        return $this->hasMany(
            CollectionRoute::class,
            'truck_id',
            'id'
        );
    }
}