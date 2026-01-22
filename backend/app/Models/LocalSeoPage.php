<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LocalSeoPage extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'district_id',
        'service_category',
        'service_subcategory',
        'slug',
        'title',
        'title_fr',
        'meta_title',
        'meta_description',
        'content',
        'content_fr',
        'is_published',
        'view_count',
        'conversion_count',
        'faq_content',
        'image_path',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_published' => 'boolean',
        'view_count' => 'integer',
        'conversion_count' => 'integer',
        'faq_content' => 'json',
    ];

    /**
     * Get the district that owns the page.
     */
    public function district(): BelongsTo
    {
        return $this->belongsTo(CityDistrict::class, 'district_id');
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * Get the full URL for the page.
     */
    public function getUrlAttribute(): string
    {
        $district = $this->district;
        
        if (!$district) {
            return '';
        }
        
        if ($this->service_subcategory) {
            return "/services/{$this->service_category}/{$this->service_subcategory}/{$district->slug}";
        }
        
        return "/services/{$this->service_category}/{$district->slug}";
    }

    /**
     * Get related tasks for this page.
     */
    public function getRelatedTasksAttribute()
    {
        $query = Task::where('district_code', $this->district->code);
        
        if ($this->service_category) {
            $query->where('category', $this->service_category);
            
            if ($this->service_subcategory) {
                $query->where('subcategory', $this->service_subcategory);
            }
        }
        
        return $query->where('status', 'open')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
    }

    /**
     * Get related prestataires for this page.
     */
    public function getRelatedPrestataireAttribute()
    {
        $query = User::whereJsonContains('service_areas', $this->district->name)
            ->orWhereJsonContains('service_areas', $this->district->name_fr)
            ->orWhereJsonContains('service_areas', $this->district->code)
            ->where('role', 'prestataire')
            ->where('is_blocked', false)
            ->where('is_verified', true);
        
        if ($this->service_category) {
            $query->whereJsonContains('service_categories', $this->service_category);
            
            if ($this->service_subcategory) {
                $query->whereJsonContains('service_subcategories', $this->service_subcategory);
            }
        }
        
        return $query->orderBy('average_rating', 'desc')
            ->limit(5)
            ->get();
    }

    /**
     * Increment the view count.
     */
    public function incrementViewCount(): void
    {
        $this->increment('view_count');
    }

    /**
     * Increment the conversion count.
     */
    public function incrementConversionCount(): void
    {
        $this->increment('conversion_count');
    }
}
