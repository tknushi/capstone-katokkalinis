<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'barangay_id',
        'title',
        'description',
        'image',
        'location',
        'latitude',
        'longitude',
        'status',
        'admin_notes',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
    ];

    protected $appends = [
        'image_url',
    ];

    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image) {
            return null;
        }

        if (filter_var($this->image, FILTER_VALIDATE_URL) || str_starts_with($this->image, 'data:image')) {
            return $this->image;
        }

        return url($this->image);
    }

    /*
    |--------------------------------------------------------------------------
    | USER
    |--------------------------------------------------------------------------
    */

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /*
    |--------------------------------------------------------------------------
    | BARANGAY
    |--------------------------------------------------------------------------
    */

    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }
}