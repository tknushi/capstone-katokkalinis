<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date',
        'time_in',
        'time_out',
        'status',
        'remarks',
        'is_archived',
        'archived_at',
    ];

    protected $casts = [
        'date' => 'date',
        'is_archived' => 'boolean',
        'archived_at' => 'datetime',
    ];

    protected $appends = [
        'time_in_formatted',
        'time_out_formatted',
        'date_formatted',
    ];

    public function getTimeInFormattedAttribute(): ?string
    {
        if (!$this->time_in) return null;
        try {
            return \Carbon\Carbon::parse($this->time_in)->format('g:i A');
        } catch (\Throwable $e) {
            return substr($this->time_in, 0, 5);
        }
    }

    public function getTimeOutFormattedAttribute(): ?string
    {
        if (!$this->time_out) return null;
        try {
            return \Carbon\Carbon::parse($this->time_out)->format('g:i A');
        } catch (\Throwable $e) {
            return substr($this->time_out, 0, 5);
        }
    }

    public function getDateFormattedAttribute(): ?string
    {
        if (!$this->date) return null;
        try {
            return \Carbon\Carbon::parse($this->date)->format('M d, Y');
        } catch (\Throwable $e) {
            return (string)$this->date;
        }
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}