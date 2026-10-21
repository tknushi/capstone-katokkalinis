<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CollectionLogAudit extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'collection_log_id',
        'user_id',
        'action',
        'old_values',
        'new_values',
        'reason',
        'created_at',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'created_at' => 'datetime',
    ];

    public function collectionLog(): BelongsTo
    {
        return $this->belongsTo(CollectionLog::class, 'collection_log_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
