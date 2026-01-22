<?php

namespace App\Services;

use App\Models\User;
use App\Models\Achievement;
use App\Models\Task;
use Illuminate\Support\Facades\DB;

class GamificationService
{
    /**
     * Check and award achievements for a user
     */
    public function checkAndAwardAchievements(User $user): array
    {
        $awardedAchievements = [];
        $achievements = Achievement::where('is_active', true)->get();

        foreach ($achievements as $achievement) {
            if ($this->checkAchievementRequirements($user, $achievement)) {
                if (!$achievement->hasBeenEarnedBy($user)) {
                    $user->awardAchievement($achievement);
                    $awardedAchievements[] = $achievement;
                }
            }
        }

        return $awardedAchievements;
    }

    /**
     * Check if user meets achievement requirements
     */
    private function checkAchievementRequirements(User $user, Achievement $achievement): bool
    {
        $requirements = $achievement->requirements ?? [];

        foreach ($requirements as $key => $value) {
            switch ($key) {
                case 'tasks_completed':
                    if ($user->total_tasks_completed < $value) {
                        return false;
                    }
                    break;

                case 'average_rating':
                    $minReviews = $requirements['min_reviews'] ?? 1;
                    if ($user->total_reviews_received < $minReviews) {
                        return false;
                    }
                    if (($user->average_rating ?? 0) < $value) {
                        return false;
                    }
                    break;

                case 'reviews_received':
                    if ($user->total_reviews_received < $value) {
                        return false;
                    }
                    break;

                case 'is_verified':
                    // Check both is_verified flag and verification_status
                    $isVerified = ($user->is_verified === true || $user->is_verified === 1) && 
                                  $user->verification_status === 'approved';
                    if (!$isVerified) {
                        return false;
                    }
                    break;

                case 'level':
                    if ($user->level < $value) {
                        return false;
                    }
                    break;

                case 'user_id':
                    if ($user->id > $value) {
                        return false;
                    }
                    break;

                case 'tasks_in_days':
                    $days = $requirements['days'] ?? 7;
                    $tasksCount = $this->getTasksInLastDays($user, $days);
                    if ($tasksCount < $value) {
                        return false;
                    }
                    break;

                case 'profile_completion':
                    $completion = $this->calculateProfileCompletion($user);
                    if ($completion < $value) {
                        return false;
                    }
                    break;
            }
        }

        return true;
    }

    /**
     * Get tasks completed in last N days
     */
    private function getTasksInLastDays(User $user, int $days): int
    {
        $since = now()->subDays($days);
        
        if ($user->role === 'prestataire' || in_array('prestataire', $user->roles ?? [])) {
            return Task::where('status', 'completed')
                ->whereHas('offers', function ($q) use ($user) {
                    $q->where('prestataire_id', $user->id)
                      ->where('status', 'accepted');
                })
                ->where('updated_at', '>=', $since)
                ->count();
        }
        
        return Task::where('client_id', $user->id)
            ->where('status', 'completed')
            ->where('updated_at', '>=', $since)
            ->count();
    }

    /**
     * Calculate profile completion percentage
     */
    private function calculateProfileCompletion(User $user): int
    {
        $fields = [
            'name',
            'email',
            'city',
            'avatar',
            'bio',
            'phone',
        ];

        if ($user->role === 'prestataire' || in_array('prestataire', $user->roles ?? [])) {
            $fields = array_merge($fields, [
                'skills',
                'experience_years',
                'hourly_rate',
                'service_areas',
            ]);
        }

        $filled = 0;
        foreach ($fields as $field) {
            if (!empty($user->$field)) {
                $filled++;
            }
        }

        return (int) (($filled / count($fields)) * 100);
    }

    /**
     * Update user stats after task completion
     */
    public function updateUserStatsAfterTask(User $user, Task $task): void
    {
        // Increment tasks completed
        $user->increment('total_tasks_completed');

        // Add XP for completing a task
        $xp = $this->calculateTaskXp($task);
        $user->increment('xp', $xp);
        
        // Check level up
        $user->checkLevelUp();

        // Check and award achievements
        $this->checkAndAwardAchievements($user);
    }

    /**
     * Update user stats after receiving a review
     */
    public function updateUserStatsAfterReview(User $user): void
    {
        // Increment reviews received
        $user->increment('total_reviews_received');

        // Recalculate average rating
        $avgRating = $user->reviewsAsPrestataire()
            ->where('direction', 'client_to_prestataire')
            ->avg('rating');
        
        $user->update(['average_rating' => $avgRating ? round($avgRating, 2) : null]);

        // Add XP for receiving a review
        $user->increment('xp', 20);
        
        // Check level up
        $user->checkLevelUp();

        // Check and award achievements
        $this->checkAndAwardAchievements($user);
    }

    /**
     * Calculate XP for completing a task
     */
    private function calculateTaskXp(Task $task): int
    {
        $baseXp = 50;
        
        // Bonus for budget range
        if ($task->budget_max && $task->budget_max > 100) {
            $baseXp += 20;
        }
        if ($task->budget_max && $task->budget_max > 500) {
            $baseXp += 30;
        }

        return $baseXp;
    }

    /**
     * Get user's gamification stats
     */
    public function getUserStats(User $user): array
    {
        $currentLevelXp = ($user->level - 1) * 100;
        $nextLevelXp = $user->level * 100;
        $xpInCurrentLevel = $user->xp - $currentLevelXp;
        $xpForNextLevel = $nextLevelXp - $user->xp;

        return [
            'level' => $user->level,
            'xp' => $user->xp,
            'xp_in_current_level' => $xpInCurrentLevel,
            'xp_for_next_level' => $xpForNextLevel,
            'xp_progress_percentage' => min(100, ($xpInCurrentLevel / 100) * 100),
            'total_tasks_completed' => $user->total_tasks_completed,
            'total_reviews_received' => $user->total_reviews_received,
            'average_rating' => $user->average_rating,
            'achievements_count' => $user->achievements()->count(),
            'profile_completion' => $this->calculateProfileCompletion($user),
        ];
    }

    /**
     * Get user's achievements
     */
    public function getUserAchievements(User $user): array
    {
        $earned = $user->earnedAchievements()
            ->get()
            ->map(function ($achievement) {
                return [
                    'id' => $achievement->id,
                    'key' => $achievement->key,
                    'name' => $achievement->name,
                    'description' => $achievement->description,
                    'icon' => $achievement->icon,
                    'category' => $achievement->category,
                    'xp_reward' => $achievement->xp_reward,
                    'earned_at' => $achievement->pivot->earned_at,
                    'is_notified' => $achievement->pivot->is_notified,
                ];
            });

        $available = Achievement::where('is_active', true)
            ->whereNotIn('id', $earned->pluck('id'))
            ->orderBy('category')
            ->orderBy('sort_order')
            ->get()
            ->map(function ($achievement) use ($user) {
                return [
                    'id' => $achievement->id,
                    'key' => $achievement->key,
                    'name' => $achievement->name,
                    'description' => $achievement->description,
                    'icon' => $achievement->icon,
                    'category' => $achievement->category,
                    'xp_reward' => $achievement->xp_reward,
                    'progress' => $this->getAchievementProgress($user, $achievement),
                ];
            });

        return [
            'earned' => $earned,
            'available' => $available,
        ];
    }

    /**
     * Get progress for a specific achievement
     */
    private function getAchievementProgress(User $user, Achievement $achievement): array
    {
        $requirements = $achievement->requirements ?? [];
        $progress = [];

        foreach ($requirements as $key => $value) {
            switch ($key) {
                case 'tasks_completed':
                    $progress['tasks_completed'] = [
                        'current' => $user->total_tasks_completed,
                        'required' => $value,
                        'percentage' => min(100, ($user->total_tasks_completed / $value) * 100),
                    ];
                    break;

                case 'reviews_received':
                    $progress['reviews_received'] = [
                        'current' => $user->total_reviews_received,
                        'required' => $value,
                        'percentage' => min(100, ($user->total_reviews_received / $value) * 100),
                    ];
                    break;

                case 'average_rating':
                    $minReviews = $requirements['min_reviews'] ?? 1;
                    $current = $user->average_rating ?? 0;
                    $progress['average_rating'] = [
                        'current' => $current,
                        'required' => $value,
                        'min_reviews' => $minReviews,
                        'has_enough_reviews' => $user->total_reviews_received >= $minReviews,
                        'percentage' => min(100, ($current / $value) * 100),
                    ];
                    break;

                case 'level':
                    $progress['level'] = [
                        'current' => $user->level,
                        'required' => $value,
                        'percentage' => min(100, ($user->level / $value) * 100),
                    ];
                    break;
            }
        }

        return $progress;
    }
}
