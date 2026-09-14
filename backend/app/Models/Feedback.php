<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    use HasFactory;

    protected $table = 'feedback';

    protected $fillable = [
        'resident_id',
        'content',
        'status',
    ];

    public function resident()
    {
        return $this->belongsTo(User::class, 'resident_id');
    }
}
