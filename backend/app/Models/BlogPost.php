<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class BlogPost extends Model
{
    protected $table = 'blog_posts';
    
    protected $fillable = [
        'title',
        'slug',
        'meta_title',
        'excerpt',
        'meta_description',
        'content',
        'category',
        'keywords',
        'image',
        'reading_time',
        'published',
        'published_at',
        'author_id',
    ];

    protected $casts = [
        'keywords' => 'array',
        'published' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function categoryRelation(): BelongsTo
    {
        return $this->belongsTo(BlogCategory::class, 'category', 'slug');
    }

    public static function generateSlug(string $title): string
    {
        $slug = Str::slug($title);
        $count = static::where('slug', 'like', $slug . '%')->count();
        
        return $count ? "{$slug}-{$count}" : $slug;
    }

    public function scopePublished($query)
    {
        return $query->where('published', true)
                     ->whereNotNull('published_at')
                     ->where('published_at', '<=', now());
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }
}
