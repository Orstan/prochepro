<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PromotionPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'days',
        'price',
        'original_price',
        'discount_percentage',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'original_price' => 'decimal:2',
        'is_active' => 'boolean',
        'days' => 'integer',
        'discount_percentage' => 'integer',
        'sort_order' => 'integer',
    ];

    /**
     * Calculate discount percentage automatically
     */
    public function calculateDiscount(): void
    {
        if ($this->original_price && $this->original_price > 0) {
            $discount = (($this->original_price - $this->price) / $this->original_price) * 100;
            $this->discount_percentage = (int) round($discount);
        } else {
            $this->discount_percentage = 0;
        }
    }

    /**
     * Get purchases for this package
     */
    public function purchases()
    {
        return $this->hasMany(PromotionPurchase::class, 'package_id');
    }
}
