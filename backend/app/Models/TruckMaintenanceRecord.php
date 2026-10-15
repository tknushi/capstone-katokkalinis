<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TruckMaintenanceRecord extends Model
{
    use HasFactory;

    protected $table = 'truck_maintenance_records';

    protected $fillable = [
        'truck_id',
        'date',
        'type',
        'notes',
        'odometer',
        'cost',
        'performed_by',
        'next_due',
        'created_by',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
        'next_due' => 'date:Y-m-d',
        'cost' => 'float',
        'odometer' => 'integer',
    ];

    public function truck(): BelongsTo
    {
        return $this->belongsTo(Truck::class, 'truck_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
