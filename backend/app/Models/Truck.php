<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Truck extends Model
{
    use HasFactory;

    protected $table = 'trucks';

    protected $fillable = [
        'truck_number',
        'plate_number',
        'driver_id',
        'contractor_id',
        'truck_type',
        'status',

        // Vehicle specifications
        'make',
        'model',
        'year',
        'color',
        'chassis_number',
        'engine_number',
        'fuel_type',
        'payload_capacity',
        'volume_capacity',
        'odometer_reading',
        'truck_photo',

        // Registration & compliance
        'or_cr_number',
        'registration_expiry',
        'insurance_provider',
        'insurance_policy_number',
        'insurance_expiry',
        'emission_test_date',
        'last_maintenance_date',
        'next_maintenance_due',

        // Ownership & operator
        'ownership_type',
        'driver_license_number',
        'driver_license_expiry',
        'driver_contact_number',
        'crew_members',
        'emergency_contact',

        // Assignment & telemetry
        'operating_zone',
        'assigned_route_id',
        'default_schedule',
        'telemetry_source_id',
        'checkpoint_settings',
        'notes',

        // Audit & soft-archive
        'created_by',
        'updated_by',
        'archived_at',
    ];

    protected $casts = [
        'year' => 'integer',
        'payload_capacity' => 'float',
        'volume_capacity' => 'float',
        'odometer_reading' => 'integer',
        'registration_expiry' => 'date:Y-m-d',
        'insurance_expiry' => 'date:Y-m-d',
        'emission_test_date' => 'date:Y-m-d',
        'last_maintenance_date' => 'date:Y-m-d',
        'next_maintenance_due' => 'date:Y-m-d',
        'driver_license_expiry' => 'date:Y-m-d',
        'checkpoint_settings' => 'array',
        'archived_at' => 'datetime',
    ];

    public function scopeActive($query)
    {
        return $query->whereNull('archived_at');
    }

    public function scopeArchived($query)
    {
        return $query->whereNotNull('archived_at');
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id', 'id');
    }

    public function contractor(): BelongsTo
    {
        return $this->belongsTo(Contractor::class, 'contractor_id', 'id');
    }

    public function assignedRoute(): BelongsTo
    {
        return $this->belongsTo(Route::class, 'assigned_route_id', 'id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(TruckDocument::class, 'truck_id');
    }

    public function maintenanceRecords(): HasMany
    {
        return $this->hasMany(TruckMaintenanceRecord::class, 'truck_id')->orderBy('date', 'desc');
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(TruckStatusHistory::class, 'truck_id')->orderBy('time', 'desc');
    }

    public function runs(): HasMany
    {
        return $this->hasMany(RouteRun::class, 'truck_id')->orderBy('date', 'desc');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function locations(): HasMany
    {
        return $this->hasMany(TruckLocation::class, 'truck_id', 'id');
    }

    public function collectionRoutes(): HasMany
    {
        return $this->hasMany(CollectionRoute::class, 'truck_id', 'id');
    }
}