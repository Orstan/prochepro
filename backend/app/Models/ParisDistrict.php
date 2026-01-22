<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ParisDistrict extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'code',
        'name',
        'name_fr',
        'slug',
        'description',
        'population',
        'area_km2',
        'latitude',
        'longitude',
        'boundaries',
        'notable_places',
        'meta_title',
        'meta_description',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'population' => 'integer',
        'area_km2' => 'float',
        'latitude' => 'float',
        'longitude' => 'float',
        'boundaries' => 'json',
        'notable_places' => 'json',
    ];

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * Get the SEO pages for this district.
     */
    public function seoPages(): HasMany
    {
        return $this->hasMany(LocalSeoPage::class, 'district_id');
    }

    /**
     * Get the tasks for this district.
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class, 'district_code', 'code');
    }

    /**
     * Get the active prestataires in this district.
     */
    public function activePrestataires()
    {
        return User::whereJsonContains('service_areas', $this->name)
            ->orWhereJsonContains('service_areas', $this->name_fr)
            ->orWhereJsonContains('service_areas', $this->code)
            ->where('role', 'prestataire')
            ->where('is_blocked', false)
            ->where('is_verified', true);
    }

    /**
     * Get the full name with code.
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->name} ({$this->code})";
    }
}
