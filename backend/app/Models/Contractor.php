<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Contractor extends Model
{
    use HasFactory;

    protected $table = 'contractors';

    protected $fillable = [
        'contractor_code',
        'company_name',
        'contact_person',
        'contact_number',
        'email',
        'address',
        'status',
        'description',
    ];

    public function contracts(): HasMany
    {
        return $this->hasMany(
            Contract::class,
            'contractor_id',
            'id'
        );
    }
}
