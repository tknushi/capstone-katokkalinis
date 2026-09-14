<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'joined_at',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'joined_at' => 'date:Y-m-d',
    ];

    /*
    |--------------------------------------------------------------------------
    | Reports
    |--------------------------------------------------------------------------
    */

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Vendors
    |--------------------------------------------------------------------------
    */

    public function vendors(): HasMany
    {
        return $this->hasMany(Vendor::class);
    }

    public function vendor()
    {
        return $this->hasOne(Vendor::class);
    }


    /*
    |--------------------------------------------------------------------------
    | Trucks - Driver
    |--------------------------------------------------------------------------
    */

    public function drivenTrucks(): HasMany
    {
        return $this->hasMany(Truck::class, 'driver_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Trucks - Contractor
    |--------------------------------------------------------------------------
    */

    public function contractorTrucks(): HasMany
    {
        return $this->hasMany(Truck::class, 'contractor_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Inspections
    |--------------------------------------------------------------------------
    */

    public function inspections(): HasMany
    {
        return $this->hasMany(Inspection::class, 'inspector_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Roles
    |--------------------------------------------------------------------------
    */

    public function roles()
    {
        return $this->belongsToMany(
            Role::class,
            'user_roles',
            'user_id',
            'role_id'
        );
    }
}