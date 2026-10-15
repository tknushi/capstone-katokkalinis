<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TruckDocument extends Model
{
    use HasFactory;

    protected $table = 'truck_documents';

    protected $fillable = [
        'truck_id',
        'type',
        'file_path',
        'file_name',
        'file_size',
        'expiry',
        'uploaded_by',
    ];

    protected $casts = [
        'expiry' => 'date:Y-m-d',
        'file_size' => 'integer',
    ];

    public function truck(): BelongsTo
    {
        return $this->belongsTo(Truck::class, 'truck_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
