<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CampaignConversion extends Model
{
    use HasFactory;

    protected $fillable = [
        'campaign_id',
        'user_id',
        'conversion_type',
        'conversion_value',
        'conversion_data',
    ];

    protected $casts = [
        'conversion_value' => 'decimal:2',
        'conversion_data' => 'array',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
