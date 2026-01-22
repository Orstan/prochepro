<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'client_id',
        'title',
        'description',
        'images',
        'budget_min',
        'budget_max',
        'location_type',
        'category',
        'subcategory',
        'city',
        'district_code',
        'district_name',
        'zone',
        'latitude',
        'longitude',
        'status',
        'prestataire_status',
        'eta_minutes',
        'arrived_at',
        'insurance_level',
        'insurance_fee',
        'cash_received_at',
        'cash_confirmed_by_client_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'images' => 'array',
    ];

    /**
     * Insurance levels with their coverage and fees
     */
    public const INSURANCE_OPTIONS = [
        'basic' => [
            'name' => 'Basic',
            'coverage' => 500,
            'fee' => 2.00,
            'description' => 'Couverture jusqu\'à 500€',
        ],
        'standard' => [
            'name' => 'Standard',
            'coverage' => 2000,
            'fee' => 5.00,
            'description' => 'Couverture jusqu\'à 2 000€',
        ],
        'premium' => [
            'name' => 'Premium',
            'coverage' => 5000,
            'fee' => 10.00,
            'description' => 'Couverture jusqu\'à 5 000€',
        ],
    ];

    /**
     * Get insurance details for this task
     */
    public function getInsuranceDetailsAttribute(): ?array
    {
        if (!$this->insurance_level) {
            return null;
        }
        return self::INSURANCE_OPTIONS[$this->insurance_level] ?? null;
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function offers(): HasMany
    {
        return $this->hasMany(Offer::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}
