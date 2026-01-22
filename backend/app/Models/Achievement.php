<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Achievement extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'name',
        'description',
        'icon',
        'category',
        'xp_reward',
        'requirements',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'requirements' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get all users who earned this achievement
     */
    public function users(): HasMany
    {
        return $this->hasMany(UserAchievement::class);
    }

    /**
     * Check if user has this achievement
     */
    public function hasBeenEarnedBy(User $user): bool
    {
        return $this->users()->where('user_id', $user->id)->exists();
    }
}
