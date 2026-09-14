<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClenroPileupReport extends Model
{
    use HasFactory;

    protected $table = 'clenro_pileup_reports';

    protected $fillable = [
        'incident_code',
        'location_zone',
        'barangay_number',
        'specific_landmark',
        'latitude',
        'longitude',
        'incident_date',
        'cleared_date',
        'turnaround_hours',
        'sla_status',
        'waste_volume_m3',
        'estimated_tonnage',
        'severity',
        'waste_category',
        'root_cause',
        'contractor_assigned',
        'truck_plate',
        'status',
        'clenro_action_taken',
        'decision_recommendation',
        'reported_by',
    ];

    protected $casts = [
        'incident_date' => 'datetime',
        'cleared_date' => 'datetime',
        'turnaround_hours' => 'decimal:2',
        'waste_volume_m3' => 'decimal:2',
        'estimated_tonnage' => 'decimal:2',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'barangay_number' => 'integer',
    ];

    /*
    |--------------------------------------------------------------------------
    | QUERY SCOPES FOR CLENRO DECISION MAKING FILTERS
    |--------------------------------------------------------------------------
    */

    public function scopeLocationZone($query, $zone)
    {
        if (!$zone || $zone === 'all') {
            return $query;
        }

        if ($zone === 'markets') {
            return $query->whereIn('location_zone', ['Cogon Market Zone', 'Carmen Market Zone']);
        }

        if ($zone === 'urban_barangays') {
            return $query->where('location_zone', 'LIKE', 'Barangay %');
        }

        return $query->where('location_zone', $zone);
    }

    public function scopeDateRange($query, $startDate, $endDate)
    {
        if ($startDate) {
            $query->whereDate('incident_date', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('incident_date', '<=', $endDate);
        }
        return $query;
    }

    public function scopeSeverity($query, $severity)
    {
        if ($severity && $severity !== 'all') {
            $query->where('severity', $severity);
        }
        return $query;
    }

    public function scopeRootCause($query, $cause)
    {
        if ($cause && $cause !== 'all') {
            $query->where('root_cause', $cause);
        }
        return $query;
    }

    public function scopeStatus($query, $status)
    {
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }
        return $query;
    }

    public function scopeSearch($query, $term)
    {
        if (!$term) {
            return $query;
        }

        return $query->where(function ($q) use ($term) {
            $q->where('incident_code', 'LIKE', "%{$term}%")
              ->orWhere('location_zone', 'LIKE', "%{$term}%")
              ->orWhere('specific_landmark', 'LIKE', "%{$term}%")
              ->orWhere('contractor_assigned', 'LIKE', "%{$term}%")
              ->orWhere('clenro_action_taken', 'LIKE', "%{$term}%");
        });
    }

    public function getIsMarketAttribute(): bool
    {
        return in_array($this->location_zone, ['Cogon Market Zone', 'Carmen Market Zone']);
    }
}
