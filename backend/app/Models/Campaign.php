<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Campaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'utm_campaign',
        'utm_source',
        'utm_medium',
        'description',
        'budget',
        'started_at',
        'ended_at',
        'is_active',
    ];

    protected $casts = [
        'budget' => 'decimal:2',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function clicks(): HasMany
    {
        return $this->hasMany(CampaignClick::class);
    }

    public function conversions(): HasMany
    {
        return $this->hasMany(CampaignConversion::class);
    }
}
