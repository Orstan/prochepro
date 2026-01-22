<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CityDistrict extends Model
{
    use HasFactory;

    protected $fillable = [
        'city',
        'code',
        'name',
        'name_fr',
        'slug',
        'description',
        'notable_places',
        'latitude',
        'longitude',
        'population',
        'is_active',
    ];

    protected $casts = [
        'notable_places' => 'array',
        'is_active' => 'boolean',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    /**
     * Get all active districts for a specific city
     */
    public static function getByCity(string $city)
    {
        return self::where('city', $city)
            ->where('is_active', true)
            ->orderBy('code')
            ->get();
    }

    /**
     * Get all cities with districts
     */
    public static function getAllCities()
    {
        return self::where('is_active', true)
            ->select('city')
            ->distinct()
            ->pluck('city');
    }

    /**
     * Get district by slug
     */
    public static function getBySlug(string $slug)
    {
        return self::where('slug', $slug)->first();
    }
}
