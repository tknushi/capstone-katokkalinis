<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CollectionRoute extends Model
{
    use HasFactory;

    protected $fillable = [
        'truck_id',
        'barangay_id',
        'collection_date',
        'start_time',
        'end_time',
        'status',
        'notes',
    ];

    protected $casts = [
        'collection_date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
    ];

    public function truck(): BelongsTo
    {
        return $this->belongsTo(Truck::class);
    }

    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }
}