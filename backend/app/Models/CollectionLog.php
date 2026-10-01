<?php

namespace App\Models;

use DomainException;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CollectionLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'driver_id',
        'truck_id',
        'barangay_id',
        'barangay_name',
        'amount_collected',
        'unit',
        'waste_type',
        'notes',
        'idempotency_key',
        'is_finalized',
        'finalized_at',
        'server_timestamp',
    ];

    protected $casts = [
        'is_finalized' => 'boolean',
        'amount_collected' => 'float',
        'finalized_at' => 'datetime',
        'server_timestamp' => 'datetime',
    ];

    protected static function booted(): void
    {
        // Enforce application-level check for updates
        static::updating(function (CollectionLog $log) {
            $wasFinalized = (bool) $log->getOriginal('is_finalized');

            if ($wasFinalized) {
                throw new DomainException(
                    "Cannot update finalized collection log #{$log->id}. Record is permanently locked."
                );
            }

            // Cannot un-finalize
            if ($wasFinalized && !$log->is_finalized) {
                throw new DomainException(
                    "Finalized collection logs cannot be un-finalized."
                );
            }
        });

        // Enforce application-level check: Insert-Only (never delete)
        static::deleting(function (CollectionLog $log) {
            throw new DomainException(
                "Collection logs are insert-only records and can never be deleted."
            );
        });
    }

    /**
     * Driver who submitted the log.
     */
    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    /**
     * Assigned truck.
     */
    public function truck(): BelongsTo
    {
        return $this->belongsTo(Truck::class, 'truck_id');
    }

    /**
     * Associated barangay.
     */
    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class, 'barangay_id');
    }

    /**
     * Audit trail of all actions/corrections on this log.
     */
    public function audits(): HasMany
    {
        return $this->hasMany(CollectionLogAudit::class, 'collection_log_id')->orderBy('id', 'asc');
    }
}
