<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Route extends Model
{
    use HasFactory;

    protected $table = 'routes';

    protected $fillable = [
        'name',
        'code',
        'zone',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function stops(): HasMany
    {
        return $this->hasMany(RouteStop::class, 'route_id')->orderBy('stop_order');
    }

    public function runs(): HasMany
    {
        return $this->hasMany(RouteRun::class, 'route_id');
    }

    public function trucks(): HasMany
    {
        return $this->hasMany(Truck::class, 'assigned_route_id');
    }
}
