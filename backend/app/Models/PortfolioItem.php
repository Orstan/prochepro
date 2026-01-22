<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PortfolioItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'category',
        'images',
        'location',
        'completed_at',
        'budget',
        'duration_days',
        'is_featured',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'images' => 'array',
            'completed_at' => 'date',
            'budget' => 'decimal:2',
            'is_featured' => 'boolean',
        ];
    }

    /**
     * Get the user that owns the portfolio item
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get first image URL
     */
    public function getFirstImageAttribute(): ?string
    {
        $images = $this->images ?? [];
        return count($images) > 0 ? $images[0] : null;
    }
}
