<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CollectionSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'barangay_id',
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
}