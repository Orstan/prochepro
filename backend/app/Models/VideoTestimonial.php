<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VideoTestimonial extends Model
{
    protected $fillable = [
        'user_id',
        'cloudinary_public_id',
        'name',
        'role',
        'text',
        'duration',
        'thumbnail_url',
        'is_active',
        'status',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'duration' => 'integer',
        'sort_order' => 'integer',
    ];

    /**
     * Get the user who submitted this testimonial
     */
    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    /**
     * Get full Cloudinary video URL
     */
    public function getVideoUrlAttribute(): string
    {
        return "https://res.cloudinary.com/dbcrrwox1/video/upload/{$this->cloudinary_public_id}";
    }

    /**
     * Get optimized thumbnail URL
     */
    public function getThumbnailAttribute(): string
    {
        if ($this->thumbnail_url) {
            return $this->thumbnail_url;
        }
        
        // Auto-generate thumbnail from video
        return "https://res.cloudinary.com/dbcrrwox1/video/upload/so_0,w_500,h_500,c_fill/{$this->cloudinary_public_id}.jpg";
    }

    /**
     * Scope for active testimonials
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for ordered testimonials
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderByDesc('created_at');
    }

    /**
     * Scope for approved testimonials
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope for pending testimonials
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for rejected testimonials
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }
}
