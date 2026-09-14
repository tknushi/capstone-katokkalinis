<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contract extends Model
{
    use HasFactory;

    protected $table = 'contracts';

    protected $fillable = [
        'contractor_id',
        'contract_value',
        'start_date',
        'end_date',
        'performance',
        'status',
    ];

    protected $casts = [
        'contract_value' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'performance' => 'decimal:2',
    ];

    public function contractor(): BelongsTo
    {
        return $this->belongsTo(
            Contractor::class,
            'contractor_id',
            'id'
        );
    }
}
