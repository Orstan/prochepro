<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;
use App\Models\Review;
use Illuminate\Support\Facades\DB;

class PrestataireMatchingService
{
    /**
     * Знайти найбільш підходящих виконавців для завдання
     * 
     * @param Task $task
     * @param int $limit Кількість виконавців для повернення
     * @return array
     */
    public function findMatchingPrestataires(Task $task, int $limit = 10): array
    {
        $query = User::query()
            ->where('role', 'prestataire')
            ->where('is_verified', true)
            ->where('is_blocked', false);

        // Фільтр за категорією
        if ($task->category) {
            $query->where(function ($q) use ($task) {
                $q->whereJsonContains('service_categories', $task->category)
                  ->orWhereJsonContains('service_categories', [$task->category]);
            });
        }

        // Фільтр за підкатегорією (якщо є)
        if ($task->subcategory) {
            $query->where(function ($q) use ($task) {
                $q->whereJsonContains('service_subcategories', $task->subcategory)
                  ->orWhereJsonContains('service_subcategories', [$task->subcategory]);
            });
        }

        // Отримуємо кандидатів
        $prestataires = $query->get();

        // Розраховуємо score для кожного
        $scored = $prestataires->map(function ($prestataire) use ($task) {
            $score = $this->calculateMatchScore($prestataire, $task);
            return [
                'prestataire' => $prestataire,
                'score' => $score,
                'match_details' => $this->getMatchDetails($prestataire, $task),
            ];
        });

        // Сортуємо за score та повертаємо топ-N
        return $scored
            ->sortByDesc('score')
            ->take($limit)
            ->values()
            ->toArray();
    }

    /**
     * Розрахувати score відповідності виконавця завданню
     * 
     * @param User $prestataire
     * @param Task $task
     * @return float Score від 0 до 100
     */
    protected function calculateMatchScore(User $prestataire, Task $task): float
    {
        $score = 0;

        // 1. Категорія (30 балів)
        $categoryMatch = $this->calculateCategoryMatch($prestataire, $task);
        $score += $categoryMatch * 30;

        // 2. Рейтинг (25 балів)
        $ratingScore = $this->calculateRatingScore($prestataire);
        $score += $ratingScore * 25;

        // 3. Досвід (20 балів)
        $experienceScore = $this->calculateExperienceScore($prestataire);
        $score += $experienceScore * 20;

        // 4. Географічна близькість (15 балів)
        $locationScore = $this->calculateLocationScore($prestataire, $task);
        $score += $locationScore * 15;

        // 5. Активність (10 балів)
        $activityScore = $this->calculateActivityScore($prestataire);
        $score += $activityScore * 10;

        return round($score, 2);
    }

    /**
     * Перевірка відповідності категорії
     */
    protected function calculateCategoryMatch(User $prestataire, Task $task): float
    {
        $categories = $prestataire->service_categories ?? [];
        $subcategories = $prestataire->service_subcategories ?? [];

        // Точне співпадіння підкатегорії
        if ($task->subcategory && in_array($task->subcategory, $subcategories)) {
            return 1.0;
        }

        // Співпадіння категорії
        if ($task->category && in_array($task->category, $categories)) {
            return 0.8;
        }

        return 0;
    }

    /**
     * Розрахунок score на основі рейтингу
     */
    protected function calculateRatingScore(User $prestataire): float
    {
        $avgRating = Review::where('prestataire_id', $prestataire->id)
            ->avg('rating');

        if (!$avgRating) {
            return 0.5; // Нейтральний score для нових виконавців
        }

        // Нормалізуємо рейтинг від 1-5 до 0-1
        return ($avgRating - 1) / 4;
    }

    /**
     * Розрахунок score на основі досвіду
     */
    protected function calculateExperienceScore(User $prestataire): float
    {
        // Кількість завершених завдань
        $completedTasks = DB::table('offers')
            ->join('tasks', 'offers.task_id', '=', 'tasks.id')
            ->where('offers.prestataire_id', $prestataire->id)
            ->where('offers.status', 'accepted')
            ->where('tasks.status', 'completed')
            ->count();

        // Логарифмічна шкала: 0 завдань = 0, 10 завдань = 0.5, 50+ завдань = 1.0
        if ($completedTasks === 0) {
            return 0;
        }

        return min(1.0, log($completedTasks + 1) / log(51));
    }

    /**
     * Розрахунок score на основі географічної близькості
     */
    protected function calculateLocationScore(User $prestataire, Task $task): float
    {
        // Якщо завдання remote - географія не важлива
        if ($task->location_type === 'remote') {
            return 1.0;
        }

        // Якщо немає координат - нейтральний score
        if (!$task->city || !$prestataire->city) {
            return 0.5;
        }

        // Співпадіння міста
        if (strtolower($task->city) === strtolower($prestataire->city)) {
            return 1.0;
        }

        // Співпадіння зони/регіону
        if ($task->zone && $prestataire->service_areas) {
            $serviceAreas = $prestataire->service_areas ?? [];
            if (in_array($task->zone, $serviceAreas)) {
                return 0.7;
            }
        }

        return 0.3;
    }

    /**
     * Розрахунок score на основі активності
     */
    protected function calculateActivityScore(User $prestataire): float
    {
        // Останній вхід
        $lastLogin = $prestataire->last_login_at ?? $prestataire->updated_at;
        
        if (!$lastLogin) {
            return 0.5;
        }

        $daysSinceLogin = now()->diffInDays($lastLogin);

        // Активний сьогодні/вчора = 1.0
        if ($daysSinceLogin <= 1) {
            return 1.0;
        }

        // Активний протягом тижня = 0.7
        if ($daysSinceLogin <= 7) {
            return 0.7;
        }

        // Активний протягом місяця = 0.4
        if ($daysSinceLogin <= 30) {
            return 0.4;
        }

        // Неактивний більше місяця = 0.1
        return 0.1;
    }

    /**
     * Отримати деталі відповідності
     */
    protected function getMatchDetails(User $prestataire, Task $task): array
    {
        $avgRating = Review::where('prestataire_id', $prestataire->id)
            ->avg('rating');

        $completedTasks = DB::table('offers')
            ->join('tasks', 'offers.task_id', '=', 'tasks.id')
            ->where('offers.prestataire_id', $prestataire->id)
            ->where('offers.status', 'accepted')
            ->where('tasks.status', 'completed')
            ->count();

        return [
            'category_match' => $this->calculateCategoryMatch($prestataire, $task),
            'rating' => $avgRating ? round($avgRating, 1) : null,
            'completed_tasks' => $completedTasks,
            'location_match' => $this->calculateLocationScore($prestataire, $task),
            'is_active' => $this->calculateActivityScore($prestataire) > 0.5,
        ];
    }

    /**
     * Отримати рекомендованих виконавців з повною інформацією
     */
    public function getRecommendedPrestataires(Task $task, int $limit = 5): array
    {
        $matches = $this->findMatchingPrestataires($task, $limit);

        return array_map(function ($match) {
            $prestataire = $match['prestataire'];
            
            return [
                'id' => $prestataire->id,
                'name' => $prestataire->name,
                'avatar' => $prestataire->avatar,
                'bio' => $prestataire->bio,
                'hourly_rate' => $prestataire->hourly_rate,
                'rating' => $match['match_details']['rating'],
                'completed_tasks' => $match['match_details']['completed_tasks'],
                'match_score' => $match['score'],
                'match_details' => $match['match_details'],
            ];
        }, $matches);
    }
}
