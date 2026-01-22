<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AbTest extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'key',
        'description',
        'variants',
        'is_active',
        'started_at',
        'ended_at',
    ];

    protected $casts = [
        'variants' => 'array',
        'is_active' => 'boolean',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    public function assignments(): HasMany
    {
        return $this->hasMany(AbTestAssignment::class);
    }

    public function conversions(): HasMany
    {
        return $this->hasMany(AbTestConversion::class);
    }
}
