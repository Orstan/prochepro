<?php

namespace App\Services;

use App\Models\Task;
use App\Models\Offer;
use Illuminate\Support\Facades\DB;

class PriceEstimationService
{
    /**
     * Базові ціни за категоріями (в євро)
     */
    protected const BASE_PRICES = [
        'plomberie' => ['min' => 50, 'max' => 150, 'hourly' => 45],
        'electricite' => ['min' => 60, 'max' => 180, 'hourly' => 50],
        'menuiserie' => ['min' => 70, 'max' => 200, 'hourly' => 55],
        'peinture' => ['min' => 40, 'max' => 120, 'hourly' => 35],
        'jardinage' => ['min' => 30, 'max' => 100, 'hourly' => 30],
        'nettoyage' => ['min' => 25, 'max' => 80, 'hourly' => 25],
        'demenagement' => ['min' => 100, 'max' => 500, 'hourly' => 60],
        'informatique' => ['min' => 50, 'max' => 200, 'hourly' => 50],
        'reparation' => ['min' => 40, 'max' => 150, 'hourly' => 40],
        'default' => ['min' => 40, 'max' => 120, 'hourly' => 40],
    ];

    /**
     * Коефіцієнти складності на основі ключових слів
     */
    protected const COMPLEXITY_KEYWORDS = [
        'urgent' => 1.3,
        'urgence' => 1.3,
        'complexe' => 1.4,
        'difficile' => 1.3,
        'grand' => 1.2,
        'grande' => 1.2,
        'petit' => 0.8,
        'petite' => 0.8,
        'simple' => 0.9,
        'rapide' => 0.9,
        'installation' => 1.2,
        'réparation' => 1.0,
        'reparation' => 1.0,
        'maintenance' => 0.9,
        'diagnostic' => 0.8,
    ];

    /**
     * Розрахувати рекомендовану ціну для завдання
     * 
     * @param Task $task
     * @return array ['min' => float, 'max' => float, 'estimated' => float, 'confidence' => string]
     */
    public function estimatePrice(Task $task): array
    {
        // 1. Базова ціна за категорією
        $basePrice = $this->getBasePriceForCategory($task->category);

        // 2. Коефіцієнт складності на основі опису
        $complexityMultiplier = $this->calculateComplexityMultiplier($task);

        // 3. Історичні дані (середні ціни схожих завдань)
        $historicalPrice = $this->getHistoricalAveragePrice($task);

        // 4. Регіональний коефіцієнт
        $regionalMultiplier = $this->getRegionalMultiplier($task->city);

        // Розраховуємо фінальну ціну
        $estimatedMin = $basePrice['min'] * $complexityMultiplier * $regionalMultiplier;
        $estimatedMax = $basePrice['max'] * $complexityMultiplier * $regionalMultiplier;

        // Якщо є історичні дані, коригуємо оцінку
        if ($historicalPrice) {
            $estimatedMin = ($estimatedMin + $historicalPrice['min']) / 2;
            $estimatedMax = ($estimatedMax + $historicalPrice['max']) / 2;
        }

        // Розраховуємо середню оцінку
        $estimated = ($estimatedMin + $estimatedMax) / 2;

        // Визначаємо рівень впевненості
        $confidence = $this->calculateConfidence($task, $historicalPrice);

        return [
            'min' => round($estimatedMin, 2),
            'max' => round($estimatedMax, 2),
            'estimated' => round($estimated, 2),
            'hourly_rate' => $basePrice['hourly'] * $regionalMultiplier,
            'confidence' => $confidence,
            'factors' => [
                'base_category' => $task->category,
                'complexity_multiplier' => round($complexityMultiplier, 2),
                'regional_multiplier' => round($regionalMultiplier, 2),
                'has_historical_data' => $historicalPrice !== null,
            ],
        ];
    }

    /**
     * Отримати базову ціну для категорії
     */
    protected function getBasePriceForCategory(string $category): array
    {
        $normalizedCategory = strtolower($category);
        
        foreach (self::BASE_PRICES as $key => $price) {
            if (str_contains($normalizedCategory, $key)) {
                return $price;
            }
        }

        return self::BASE_PRICES['default'];
    }

    /**
     * Розрахувати коефіцієнт складності на основі опису
     */
    protected function calculateComplexityMultiplier(Task $task): float
    {
        $text = strtolower($task->title . ' ' . ($task->description ?? ''));
        $multiplier = 1.0;

        foreach (self::COMPLEXITY_KEYWORDS as $keyword => $factor) {
            if (str_contains($text, $keyword)) {
                $multiplier *= $factor;
            }
        }

        // Обмежуємо коефіцієнт в розумних межах
        return max(0.7, min(2.0, $multiplier));
    }

    /**
     * Отримати середню ціну з історичних даних
     */
    protected function getHistoricalAveragePrice(Task $task): ?array
    {
        // Шукаємо схожі завершені завдання
        $historicalOffers = Offer::query()
            ->join('tasks', 'offers.task_id', '=', 'tasks.id')
            ->where('tasks.category', $task->category)
            ->where('offers.status', 'accepted')
            ->where('tasks.status', 'completed')
            ->whereNotNull('offers.price')
            ->where('offers.price', '>', 0);

        // Фільтр за підкатегорією якщо є
        if ($task->subcategory) {
            $historicalOffers->where('tasks.subcategory', $task->subcategory);
        }

        // Фільтр за містом якщо є
        if ($task->city) {
            $historicalOffers->where('tasks.city', $task->city);
        }

        $prices = $historicalOffers
            ->select('offers.price')
            ->limit(50)
            ->pluck('price');

        if ($prices->isEmpty()) {
            return null;
        }

        // Видаляємо викиди (outliers) - значення які виходять за межі 1.5 * IQR
        $sorted = $prices->sort()->values();
        $q1 = $sorted->percentile(25);
        $q3 = $sorted->percentile(75);
        $iqr = $q3 - $q1;
        
        $filtered = $sorted->filter(function ($price) use ($q1, $q3, $iqr) {
            return $price >= ($q1 - 1.5 * $iqr) && $price <= ($q3 + 1.5 * $iqr);
        });

        if ($filtered->isEmpty()) {
            return null;
        }

        return [
            'min' => $filtered->min(),
            'max' => $filtered->max(),
            'avg' => $filtered->avg(),
            'median' => $filtered->median(),
            'count' => $filtered->count(),
        ];
    }

    /**
     * Отримати регіональний коефіцієнт
     */
    protected function getRegionalMultiplier(?string $city): float
    {
        if (!$city) {
            return 1.0;
        }

        $city = strtolower($city);

        // Великі міста - вищі ціни
        $majorCities = [
            'paris' => 1.3,
            'lyon' => 1.15,
            'marseille' => 1.1,
            'toulouse' => 1.1,
            'nice' => 1.15,
            'nantes' => 1.05,
            'strasbourg' => 1.05,
            'bordeaux' => 1.1,
        ];

        foreach ($majorCities as $majorCity => $multiplier) {
            if (str_contains($city, $majorCity)) {
                return $multiplier;
            }
        }

        // Інші міста - стандартна ціна
        return 1.0;
    }

    /**
     * Розрахувати рівень впевненості в оцінці
     */
    protected function calculateConfidence(Task $task, ?array $historicalPrice): string
    {
        $score = 0;

        // Наявність історичних даних (+40%)
        if ($historicalPrice && $historicalPrice['count'] >= 10) {
            $score += 40;
        } elseif ($historicalPrice && $historicalPrice['count'] >= 5) {
            $score += 25;
        }

        // Наявність детального опису (+20%)
        if ($task->description && strlen($task->description) > 50) {
            $score += 20;
        }

        // Наявність підкатегорії (+15%)
        if ($task->subcategory) {
            $score += 15;
        }

        // Наявність бюджету від клієнта (+15%)
        if ($task->budget_min && $task->budget_max) {
            $score += 15;
        }

        // Наявність локації (+10%)
        if ($task->city) {
            $score += 10;
        }

        if ($score >= 70) {
            return 'high';
        } elseif ($score >= 40) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    /**
     * Отримати детальну інформацію про ціноутворення
     */
    public function getPriceBreakdown(Task $task): array
    {
        $estimation = $this->estimatePrice($task);
        $historicalData = $this->getHistoricalAveragePrice($task);

        return [
            'estimation' => $estimation,
            'historical_data' => $historicalData,
            'recommendations' => $this->generateRecommendations($task, $estimation, $historicalData),
        ];
    }

    /**
     * Згенерувати рекомендації для клієнта
     */
    protected function generateRecommendations(Task $task, array $estimation, ?array $historicalData): array
    {
        $recommendations = [];

        // Порівняння з бюджетом клієнта
        if ($task->budget_max && $task->budget_max < $estimation['min']) {
            $recommendations[] = [
                'type' => 'warning',
                'message' => "Votre budget maximum ({$task->budget_max}€) est inférieur au prix estimé minimum ({$estimation['min']}€). Vous risquez de recevoir peu d'offres.",
            ];
        }

        if ($task->budget_min && $task->budget_min > $estimation['max']) {
            $recommendations[] = [
                'type' => 'info',
                'message' => "Votre budget minimum ({$task->budget_min}€) est supérieur au prix estimé maximum ({$estimation['max']}€). Vous pourriez attirer plus de prestataires en ajustant votre budget.",
            ];
        }

        // Рекомендації на основі історичних даних
        if ($historicalData && $historicalData['count'] >= 10) {
            $recommendations[] = [
                'type' => 'success',
                'message' => "Basé sur {$historicalData['count']} tâches similaires complétées, le prix moyen est de {$historicalData['avg']}€.",
            ];
        }

        // Рекомендації щодо опису
        if (!$task->description || strlen($task->description) < 50) {
            $recommendations[] = [
                'type' => 'tip',
                'message' => "Ajoutez plus de détails à votre description pour obtenir des estimations plus précises et attirer des prestataires qualifiés.",
            ];
        }

        return $recommendations;
    }

    /**
     * Перевірити чи ціна пропозиції адекватна
     */
    public function validateOfferPrice(Task $task, float $offerPrice): array
    {
        $estimation = $this->estimatePrice($task);

        $isReasonable = $offerPrice >= ($estimation['min'] * 0.7) 
                     && $offerPrice <= ($estimation['max'] * 1.5);

        $deviation = 0;
        if ($offerPrice < $estimation['min']) {
            $deviation = (($estimation['min'] - $offerPrice) / $estimation['min']) * 100;
        } elseif ($offerPrice > $estimation['max']) {
            $deviation = (($offerPrice - $estimation['max']) / $estimation['max']) * 100;
        }

        return [
            'is_reasonable' => $isReasonable,
            'deviation_percent' => round($deviation, 1),
            'estimated_range' => [
                'min' => $estimation['min'],
                'max' => $estimation['max'],
            ],
            'message' => $this->getPriceValidationMessage($offerPrice, $estimation, $deviation),
        ];
    }

    /**
     * Отримати повідомлення про валідацію ціни
     */
    protected function getPriceValidationMessage(float $offerPrice, array $estimation, float $deviation): string
    {
        if ($offerPrice < $estimation['min'] * 0.7) {
            return "Ce prix est significativement inférieur à la moyenne du marché. Assurez-vous que le prestataire comprend bien la tâche.";
        }

        if ($offerPrice > $estimation['max'] * 1.5) {
            return "Ce prix est significativement supérieur à la moyenne du marché. Vous pouvez négocier ou attendre d'autres offres.";
        }

        if ($offerPrice >= $estimation['min'] && $offerPrice <= $estimation['max']) {
            return "Ce prix est dans la fourchette estimée pour ce type de tâche.";
        }

        return "Ce prix est acceptable pour ce type de tâche.";
    }
}
