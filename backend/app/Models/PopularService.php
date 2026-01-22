<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PopularService extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'name',
        'name_fr',
        'category',
        'subcategory',
        'description',
        'description_fr',
        'price_range',
        'keywords',
        'search_volume',
        'is_active',
    ];

    protected $casts = [
        'keywords' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get all active popular services
     */
    public static function getActive()
    {
        return self::where('is_active', true)
            ->orderBy('search_volume', 'desc')
            ->get();
    }

    /**
     * Get top N services by search volume
     */
    public static function getTop($limit = 20)
    {
        return self::where('is_active', true)
            ->orderBy('search_volume', 'desc')
            ->limit($limit)
            ->get();
    }
}
