<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inspection extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'inspector_id',
        'hygiene_system',
        'condition_of_premises',
        'total_score',
        'compliance_level',
        'notes',
        'status',
        'decision',
        'decided_by',
        'decided_at',
        'inspected_at',
    ];

    protected $casts = [
        'hygiene_system' => 'integer',
        'condition_of_premises' => 'integer',
        'total_score' => 'integer',
        'compliance_level' => 'integer',
        'inspected_at' => 'datetime',
        'decided_at' => 'datetime',
    ];

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function inspector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'inspector_id');
    }
}