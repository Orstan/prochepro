<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Services\PrestataireMatchingService;
use App\Services\PriceEstimationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiRecommendationController extends Controller
{
    protected PrestataireMatchingService $matchingService;
    protected PriceEstimationService $priceService;

    public function __construct(
        PrestataireMatchingService $matchingService,
        PriceEstimationService $priceService
    ) {
        $this->matchingService = $matchingService;
        $this->priceService = $priceService;
    }

    /**
     * Отримати рекомендованих виконавців для завдання
     */
    public function getRecommendedPrestataires(Task $task): JsonResponse
    {
        try {
            $recommended = $this->matchingService->getRecommendedPrestataires($task, 10);

            return response()->json([
                'task_id' => $task->id,
                'recommended_prestataires' => $recommended,
                'total' => count($recommended),
            ]);
        } catch (\Exception $e) {
            \Log::error('Error getting recommended prestataires: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Erreur lors de la récupération des prestataires recommandés.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Отримати оцінку ціни для завдання
     */
    public function estimatePrice(Task $task): JsonResponse
    {
        try {
            $estimation = $this->priceService->estimatePrice($task);

            return response()->json([
                'task_id' => $task->id,
                'price_estimation' => $estimation,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error estimating price: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Erreur lors de l\'estimation du prix.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Отримати детальну інформацію про ціноутворення
     */
    public function getPriceBreakdown(Task $task): JsonResponse
    {
        try {
            $breakdown = $this->priceService->getPriceBreakdown($task);

            return response()->json([
                'task_id' => $task->id,
                'breakdown' => $breakdown,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error getting price breakdown: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Erreur lors de la récupération des détails du prix.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Валідувати ціну пропозиції
     */
    public function validateOfferPrice(Request $request, Task $task): JsonResponse
    {
        $validated = $request->validate([
            'price' => ['required', 'numeric', 'min:0'],
        ]);

        try {
            $validation = $this->priceService->validateOfferPrice($task, (float) $validated['price']);

            return response()->json([
                'task_id' => $task->id,
                'offer_price' => $validated['price'],
                'validation' => $validation,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error validating offer price: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Erreur lors de la validation du prix.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Отримати оцінку ціни на основі параметрів (без створення завдання)
     */
    public function estimatePriceByParams(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => ['required', 'string', 'max:100'],
            'subcategory' => ['nullable', 'string', 'max:150'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'city' => ['nullable', 'string', 'max:255'],
            'location_type' => ['nullable', 'string', 'in:on_site,remote'],
        ]);

        try {
            // Створюємо тимчасовий об'єкт Task для оцінки
            $tempTask = new Task($validated);

            $estimation = $this->priceService->estimatePrice($tempTask);

            return response()->json([
                'price_estimation' => $estimation,
                'params' => $validated,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error estimating price by params: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Erreur lors de l\'estimation du prix.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Знайти виконавців за параметрами (без створення завдання)
     */
    public function findPrestatairesByParams(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => ['required', 'string', 'max:100'],
            'subcategory' => ['nullable', 'string', 'max:150'],
            'city' => ['nullable', 'string', 'max:255'],
            'location_type' => ['nullable', 'string', 'in:on_site,remote'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:20'],
        ]);

        try {
            // Створюємо тимчасовий об'єкт Task для пошуку
            $tempTask = new Task($validated);

            $limit = $validated['limit'] ?? 10;
            $matches = $this->matchingService->findMatchingPrestataires($tempTask, $limit);

            $recommended = array_map(function ($match) {
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

            return response()->json([
                'prestataires' => $recommended,
                'total' => count($recommended),
                'params' => $validated,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error finding prestataires by params: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Erreur lors de la recherche des prestataires.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
