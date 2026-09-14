<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Violation extends Model
{
    use HasFactory;

    protected $table = 'violations';

    protected $fillable = [
        'vendor_id',
        'inspection_id',
        'violation_type',
        'description',
        'penalty',
        'corrective_action',
        'status',
    ];

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function inspection()
    {
        return $this->belongsTo(Inspection::class);
    }
}
