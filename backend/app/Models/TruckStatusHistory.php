<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TruckStatusHistory extends Model
{
    use HasFactory;

    protected $table = 'truck_status_history';

    protected $fillable = [
        'truck_id',
        'old_status',
        'new_status',
        'reason',
        'user_id',
        'time',
    ];

    protected $casts = [
        'time' => 'datetime',
    ];

    public function truck(): BelongsTo
    {
        return $this->belongsTo(Truck::class, 'truck_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
