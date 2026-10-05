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
        'pending_hygiene_system',
        'pending_condition_of_premises',
        'pending_total_score',
        'pending_notes',
        'change_requested_by',
        'change_requested_at',
        'change_status',
        'rejection_reason',
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
        'pending_hygiene_system' => 'integer',
        'pending_condition_of_premises' => 'integer',
        'pending_total_score' => 'integer',
        'change_requested_at' => 'datetime',
        'inspected_at' => 'datetime',
        'decided_at' => 'datetime',
    ];

    protected $appends = [
        'grade_letter',
        'pending_grade_letter',
    ];

    public function getGradeLetterAttribute(): string
    {
        $score = $this->total_score ?? 0;
        if ($score >= 90) return 'A';
        if ($score >= 80) return 'B';
        if ($score >= 75) return 'C';
        return 'D';
    }

    public function getPendingGradeLetterAttribute(): ?string
    {
        if ($this->pending_total_score === null) return null;
        $score = $this->pending_total_score;
        if ($score >= 90) return 'A';
        if ($score >= 80) return 'B';
        if ($score >= 75) return 'C';
        return 'D';
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function inspector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'inspector_id');
    }

    public function changeRequester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'change_requested_by');
    }

    public function decider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'decided_by');
    }
}