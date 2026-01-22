<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Task;
use App\Models\Offer;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InsightsController extends Controller
{
    /**
     * Get provider ranking and insights
     */
    public function getProviderInsights(Request $request): JsonResponse
    {
        $user = auth()->user();
        
        if (!$user || $user->role !== 'prestataire') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $city = $user->city;
        $categories = $user->service_categories ?? [];
        
        $ranking = $this->calculateRanking($user, $city, $categories);
        $recommendations = $this->generateRecommendations($user);
        $pricingInsights = $this->getPricingInsights($user, $city, $categories);
        
        return response()->json([
            'ranking' => $ranking,
            'recommendations' => $recommendations,
            'pricing' => $pricingInsights,
        ]);
    }

    /**
     * Calculate provider ranking in region and category
     */
    private function calculateRanking(User $user, ?string $city, array $categories): array
    {
        $baseQuery = User::where('role', 'prestataire')
            ->where('id', '!=', $user->id);

        if ($city) {
            $totalInCity = (clone $baseQuery)->where('city', $city)->count();
            $betterInCity = (clone $baseQuery)
                ->where('city', $city)
                ->where(function($q) use ($user) {
                    $q->where('average_rating', '>', $user->average_rating ?? 0)
                      ->orWhere(function($q2) use ($user) {
                          $q2->where('average_rating', '=', $user->average_rating ?? 0)
                             ->where('total_tasks_completed', '>', $user->total_tasks_completed ?? 0);
                      });
                })
                ->count();
            
            $rankInCity = $betterInCity + 1;
            $percentileInCity = $totalInCity > 0 
                ? round((($totalInCity - $betterInCity) / $totalInCity) * 100, 1)
                : 100;
        } else {
            $rankInCity = null;
            $percentileInCity = null;
            $totalInCity = 0;
        }

        $totalInCategory = 0;
        $rankInCategory = null;
        $percentileInCategory = null;
        
        if (!empty($categories)) {
            $mainCategory = $categories[0];
            
            $totalInCategory = User::where('role', 'prestataire')
                ->where('id', '!=', $user->id)
                ->whereJsonContains('service_categories', $mainCategory)
                ->count();
            
            $betterInCategory = User::where('role', 'prestataire')
                ->where('id', '!=', $user->id)
                ->whereJsonContains('service_categories', $mainCategory)
                ->where(function($q) use ($user) {
                    $q->where('average_rating', '>', $user->average_rating ?? 0)
                      ->orWhere(function($q2) use ($user) {
                          $q2->where('average_rating', '=', $user->average_rating ?? 0)
                             ->where('total_tasks_completed', '>', $user->total_tasks_completed ?? 0);
                      });
                })
                ->count();
            
            $rankInCategory = $betterInCategory + 1;
            $percentileInCategory = $totalInCategory > 0
                ? round((($totalInCategory - $betterInCategory) / $totalInCategory) * 100, 1)
                : 100;
        }

        $overallTotal = User::where('role', 'prestataire')
            ->where('id', '!=', $user->id)
            ->count();
        
        $betterOverall = User::where('role', 'prestataire')
            ->where('id', '!=', $user->id)
            ->where(function($q) use ($user) {
                $q->where('average_rating', '>', $user->average_rating ?? 0)
                  ->orWhere(function($q2) use ($user) {
                      $q2->where('average_rating', '=', $user->average_rating ?? 0)
                         ->where('total_tasks_completed', '>', $user->total_tasks_completed ?? 0);
                  });
            })
            ->count();
        
        $rankOverall = $betterOverall + 1;
        $percentileOverall = $overallTotal > 0
            ? round((($overallTotal - $betterOverall) / $overallTotal) * 100, 1)
            : 100;

        return [
            'overall' => [
                'rank' => $rankOverall,
                'total' => $overallTotal + 1,
                'percentile' => $percentileOverall,
            ],
            'city' => $city ? [
                'name' => $city,
                'rank' => $rankInCity,
                'total' => $totalInCity + 1,
                'percentile' => $percentileInCity,
            ] : null,
            'category' => !empty($categories) ? [
                'name' => $categories[0],
                'rank' => $rankInCategory,
                'total' => $totalInCategory + 1,
                'percentile' => $percentileInCategory,
            ] : null,
        ];
    }

    /**
     * Generate smart recommendations for profile improvement
     */
    private function generateRecommendations(User $user): array
    {
        $recommendations = [];
        $profileScore = 0;
        $maxScore = 100;

        if (empty($user->avatar) && empty($user->avatar_url)) {
            $recommendations[] = [
                'type' => 'profile_photo',
                'priority' => 'high',
                'title' => 'Ajoutez une photo de profil',
                'description' => 'Les profils avec photo reçoivent 40% de vues en plus',
                'impact' => '+40% de vues',
                'action' => 'upload_photo',
            ];
        } else {
            $profileScore += 15;
        }

        if (empty($user->bio) || strlen($user->bio) < 50) {
            $recommendations[] = [
                'type' => 'bio',
                'priority' => 'high',
                'title' => 'Complétez votre biographie',
                'description' => 'Une bio détaillée augmente la confiance des clients',
                'impact' => '+25% de conversions',
                'action' => 'edit_bio',
            ];
        } else {
            $profileScore += 15;
        }

        if (empty($user->skills) || count($user->skills) < 3) {
            $recommendations[] = [
                'type' => 'skills',
                'priority' => 'medium',
                'title' => 'Ajoutez vos compétences',
                'description' => 'Listez au moins 3-5 compétences principales',
                'impact' => '+15% de visibilité',
                'action' => 'add_skills',
            ];
        } else {
            $profileScore += 10;
        }

        if (!$user->is_verified) {
            $recommendations[] = [
                'type' => 'verification',
                'priority' => 'high',
                'title' => 'Vérifiez votre compte',
                'description' => 'Les prestataires vérifiés obtiennent 3x plus de missions',
                'impact' => '+200% de missions',
                'action' => 'verify_account',
            ];
        } else {
            $profileScore += 20;
        }

        $reviewsCount = $user->total_reviews_received ?? 0;
        if ($reviewsCount < 5) {
            $recommendations[] = [
                'type' => 'reviews',
                'priority' => 'medium',
                'title' => 'Obtenez plus d\'avis',
                'description' => 'Demandez à vos clients de laisser un avis après chaque mission',
                'impact' => 'Augmente la crédibilité',
                'action' => 'request_reviews',
            ];
        } else {
            $profileScore += 15;
        }

        $avgRating = $user->average_rating ?? 0;
        if ($avgRating > 0 && $avgRating < 4.5) {
            $recommendations[] = [
                'type' => 'rating',
                'priority' => 'high',
                'title' => 'Améliorez votre note',
                'description' => 'Visez une note de 4.5+ pour être dans le top 20%',
                'impact' => 'Top 20% des prestataires',
                'action' => 'improve_service',
            ];
        } else if ($avgRating >= 4.5) {
            $profileScore += 15;
        }

        if (empty($user->certifications) || count($user->certifications) === 0) {
            $recommendations[] = [
                'type' => 'certifications',
                'priority' => 'low',
                'title' => 'Ajoutez vos certifications',
                'description' => 'Les certifications professionnelles rassurent les clients',
                'impact' => '+10% de confiance',
                'action' => 'add_certifications',
            ];
        } else {
            $profileScore += 10;
        }

        $tasksCompleted = $user->total_tasks_completed ?? 0;
        if ($tasksCompleted === 0) {
            $recommendations[] = [
                'type' => 'first_task',
                'priority' => 'high',
                'title' => 'Réalisez votre première mission',
                'description' => 'Répondez activement aux demandes pour obtenir votre première mission',
                'impact' => 'Lancez votre activité',
                'action' => 'browse_tasks',
            ];
        }

        return [
            'profile_score' => $profileScore,
            'max_score' => $maxScore,
            'completion_percentage' => round(($profileScore / $maxScore) * 100, 1),
            'items' => $recommendations,
        ];
    }

    /**
     * Get pricing insights for the region and category
     */
    private function getPricingInsights(User $user, ?string $city, array $categories): array
    {
        $userRate = $user->hourly_rate;
        
        $insights = [
            'your_rate' => $userRate,
            'currency' => 'EUR',
            'recommendations' => [],
        ];

        if ($city) {
            $cityRates = User::where('role', 'prestataire')
                ->where('city', $city)
                ->whereNotNull('hourly_rate')
                ->where('hourly_rate', '>', 0)
                ->pluck('hourly_rate');

            if ($cityRates->count() > 0) {
                $avgCity = round($cityRates->avg(), 2);
                $minCity = round($cityRates->min(), 2);
                $maxCity = round($cityRates->max(), 2);
                $medianCity = round($cityRates->median(), 2);

                $insights['city'] = [
                    'name' => $city,
                    'average' => $avgCity,
                    'median' => $medianCity,
                    'min' => $minCity,
                    'max' => $maxCity,
                    'sample_size' => $cityRates->count(),
                ];

                if ($userRate && $userRate > $avgCity * 1.2) {
                    $insights['recommendations'][] = [
                        'type' => 'price_high',
                        'message' => "Votre tarif est 20% au-dessus de la moyenne à {$city}. Envisagez de le réduire à {$avgCity}€/h pour être plus compétitif.",
                        'suggested_rate' => $avgCity,
                    ];
                } elseif ($userRate && $userRate < $avgCity * 0.8) {
                    $insights['recommendations'][] = [
                        'type' => 'price_low',
                        'message' => "Votre tarif est en dessous de la moyenne. Vous pourriez augmenter à {$avgCity}€/h sans perdre de clients.",
                        'suggested_rate' => $avgCity,
                    ];
                } else {
                    $insights['recommendations'][] = [
                        'type' => 'price_optimal',
                        'message' => "Votre tarif est dans la moyenne du marché à {$city}.",
                        'suggested_rate' => null,
                    ];
                }
            }
        }

        if (!empty($categories)) {
            $mainCategory = $categories[0];
            
            $categoryRates = User::where('role', 'prestataire')
                ->whereJsonContains('service_categories', $mainCategory)
                ->whereNotNull('hourly_rate')
                ->where('hourly_rate', '>', 0)
                ->pluck('hourly_rate');

            if ($categoryRates->count() > 0) {
                $avgCategory = round($categoryRates->avg(), 2);
                $minCategory = round($categoryRates->min(), 2);
                $maxCategory = round($categoryRates->max(), 2);
                $medianCategory = round($categoryRates->median(), 2);

                $insights['category'] = [
                    'name' => $mainCategory,
                    'average' => $avgCategory,
                    'median' => $medianCategory,
                    'min' => $minCategory,
                    'max' => $maxCategory,
                    'sample_size' => $categoryRates->count(),
                ];
            }
        }

        if (!$userRate) {
            $insights['recommendations'][] = [
                'type' => 'no_rate',
                'message' => 'Définissez votre tarif horaire pour apparaître dans plus de recherches.',
                'suggested_rate' => $insights['city']['average'] ?? $insights['category']['average'] ?? 35,
            ];
        }

        return $insights;
    }
}
