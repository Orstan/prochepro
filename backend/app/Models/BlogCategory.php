<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class BlogCategory extends Model
{
    protected $table = 'blog_categories';
    
    protected $fillable = [
        'name',
        'slug',
        'meta_title',
        'meta_description',
        'icon',
        'sort_order',
    ];

    public function posts(): HasMany
    {
        return $this->hasMany(BlogPost::class, 'category', 'slug');
    }

    public static function generateSlug(string $name): string
    {
        $slug = Str::slug($name);
        $count = static::where('slug', 'like', $slug . '%')->count();
        
        return $count ? "{$slug}-{$count}" : $slug;
    }
}
