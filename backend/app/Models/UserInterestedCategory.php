<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserInterestedCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category_key',
        'subcategory_key',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Add interested categories for user
     */
    public static function syncForUser(int $userId, array $categories): void
    {
        self::where('user_id', $userId)->delete();
        
        foreach ($categories as $category) {
            self::create([
                'user_id' => $userId,
                'category_key' => $category['category_key'],
                'subcategory_key' => $category['subcategory_key'] ?? null,
            ]);
        }
    }

    /**
     * Get interested category keys for user
     */
    public static function getKeysForUser(int $userId): array
    {
        return self::where('user_id', $userId)->get()->map(function ($item) {
            return [
                'category_key' => $item->category_key,
                'subcategory_key' => $item->subcategory_key,
            ];
        })->toArray();
    }
}
