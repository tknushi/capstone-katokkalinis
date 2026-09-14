<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Barangay extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'city',
        'latitude',
        'longitude',
        'description',
        'is_active',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'is_active' => 'boolean',
    ];

    public function vendors(): HasMany
    {
        return $this->hasMany(Vendor::class);
    }

    public function collectionSchedules(): HasMany
    {
        return $this->hasMany(CollectionSchedule::class);
    }

    public function collectionRoutes(): HasMany
    {
        return $this->hasMany(CollectionRoute::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }
}