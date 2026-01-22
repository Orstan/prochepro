<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CreditPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'type',
        'credits',
        'price',
        'validity_days',
        'description',
        'features',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'credits' => 'integer',
        'price' => 'decimal:2',
        'validity_days' => 'integer',
        'features' => 'array',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForClient($query)
    {
        return $query->where('type', 'client');
    }

    public function scopeForPrestataire($query)
    {
        return $query->where('type', 'prestataire');
    }

    public function isUnlimited(): bool
    {
        return $this->credits === null;
    }
}
