<?php

namespace App\Services;

use App\Models\AnalyticsEvent;
use App\Models\ProfileView;
use App\Models\Task;
use App\Models\Offer;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsService
{
    public function trackEvent(array $data): AnalyticsEvent
    {
        return AnalyticsEvent::create($data);
    }

    public function trackProfileView(int $profileUserId, ?int $viewerUserId, array $metadata): ProfileView
    {
        return ProfileView::create([
            'profile_user_id' => $profileUserId,
            'viewer_user_id' => $viewerUserId,
            'ip_address' => $metadata['ip_address'] ?? null,
            'user_agent' => $metadata['user_agent'] ?? null,
            'referrer' => $metadata['referrer'] ?? null,
        ]);
    }

    public function getBusinessAnalytics(int $userId, string $period = '30days'): array
    {
        $startDate = $this->getStartDate($period);
        
        \Log::info('[AnalyticsService] Starting getBusinessAnalytics', [
            'user_id' => $userId,
            'period' => $period,
            'start_date' => $startDate->toDateTimeString(),
        ]);
        
        $user = User::findOrFail($userId);
        
        $profileViews = ProfileView::where('profile_user_id', $userId)
            ->where('created_at', '>=', $startDate)
            ->count();
        
        $uniqueViewers = ProfileView::where('profile_user_id', $userId)
            ->where('created_at', '>=', $startDate)
            ->distinct('viewer_user_id')
            ->count('viewer_user_id');
        
        $viewsByDay = ProfileView::where('profile_user_id', $userId)
            ->where('created_at', '>=', $startDate)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();
        
        $totalOffers = Offer::where('prestataire_id', $userId)
            ->where('created_at', '>=', $startDate)
            ->count();
        
        $acceptedOffers = Offer::where('prestataire_id', $userId)
            ->where('status', 'accepted')
            ->where('created_at', '>=', $startDate)
            ->count();
        
        \Log::info('[AnalyticsService] Offers count', [
            'user_id' => $userId,
            'total_offers' => $totalOffers,
            'accepted_offers' => $acceptedOffers,
        ]);
        
        // Get completed tasks through accepted offers (tasks table doesn't have prestataire_id)
        $completedTaskIds = Offer::where('prestataire_id', $userId)
            ->where('status', 'accepted')
            ->pluck('task_id')
            ->toArray();
        
        \Log::info('[AnalyticsService] Completed task IDs from accepted offers', [
            'user_id' => $userId,
            'task_ids' => $completedTaskIds,
        ]);
        
        $tasksCompleted = Task::whereIn('id', $completedTaskIds)
            ->where('status', 'completed')
            ->where('updated_at', '>=', $startDate)
            ->count();
        
        \Log::info('[AnalyticsService] Tasks completed count', [
            'user_id' => $userId,
            'tasks_completed' => $tasksCompleted,
        ]);
        
        // Calculate revenue from accepted offers prices for completed tasks
        $revenue = Offer::where('prestataire_id', $userId)
            ->where('status', 'accepted')
            ->whereHas('task', function($q) use ($startDate) {
                $q->where('status', 'completed')
                  ->where('updated_at', '>=', $startDate);
            })
            ->sum('price');
        
        // Ensure revenue is always a number (float), not null
        $revenue = floatval($revenue ?? 0);
        
        \Log::info('[AnalyticsService] Revenue calculated', [
            'user_id' => $userId,
            'revenue' => $revenue,
        ]);
        
        $topReferrers = ProfileView::where('profile_user_id', $userId)
            ->where('created_at', '>=', $startDate)
            ->whereNotNull('referrer')
            ->select('referrer', DB::raw('COUNT(*) as count'))
            ->groupBy('referrer')
            ->orderByDesc('count')
            ->limit(10)
            ->get();
        
        $conversionRate = $totalOffers > 0 ? ($acceptedOffers / $totalOffers) * 100 : 0;
        
        return [
            'period' => $period,
            'profile_views' => [
                'total' => (int) $profileViews,
                'unique_viewers' => (int) $uniqueViewers,
                'by_day' => $viewsByDay,
            ],
            'offers' => [
                'total' => (int) $totalOffers,
                'accepted' => (int) $acceptedOffers,
                'conversion_rate' => (float) round($conversionRate, 2),
            ],
            'tasks' => [
                'completed' => (int) $tasksCompleted,
            ],
            'revenue' => [
                'total' => (float) $revenue,
                'average_per_task' => $tasksCompleted > 0 ? (float) round($revenue / $tasksCompleted, 2) : 0.0,
            ],
            'top_referrers' => $topReferrers,
        ];
    }

    public function getDemandForecast(string $category = null, int $daysAhead = 30): array
    {
        $historicalData = Task::query()
            ->when($category, fn($q) => $q->where('category', $category))
            ->where('created_at', '>=', Carbon::now()->subDays(90))
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();
        
        if ($historicalData->isEmpty()) {
            return [
                'forecast' => [],
                'trend' => 'stable',
                'confidence' => 0,
            ];
        }
        
        $values = $historicalData->pluck('count')->toArray();
        $n = count($values);
        
        $sumX = 0;
        $sumY = array_sum($values);
        $sumXY = 0;
        $sumX2 = 0;
        
        for ($i = 0; $i < $n; $i++) {
            $sumX += $i;
            $sumXY += $i * $values[$i];
            $sumX2 += $i * $i;
        }
        
        $slope = ($n * $sumXY - $sumX * $sumY) / ($n * $sumX2 - $sumX * $sumX);
        $intercept = ($sumY - $slope * $sumX) / $n;
        
        $forecast = [];
        for ($i = 0; $i < $daysAhead; $i++) {
            $predictedValue = max(0, round($intercept + $slope * ($n + $i)));
            $forecast[] = [
                'date' => Carbon::now()->addDays($i + 1)->format('Y-m-d'),
                'predicted_tasks' => $predictedValue,
            ];
        }
        
        $avgValue = $sumY / $n;
        $trend = $slope > 0.1 ? 'growing' : ($slope < -0.1 ? 'declining' : 'stable');
        
        $variance = 0;
        foreach ($values as $i => $value) {
            $predicted = $intercept + $slope * $i;
            $variance += pow($value - $predicted, 2);
        }
        $rmse = sqrt($variance / $n);
        
        // Перевірка на division by zero при обчисленні confidence
        if ($avgValue > 0) {
            $confidence = max(0, min(100, 100 - ($rmse / $avgValue) * 100));
        } else {
            $confidence = 0;
        }
        
        return [
            'historical_data' => $historicalData,
            'forecast' => $forecast,
            'trend' => $trend,
            'confidence' => round($confidence, 2),
            'average_daily_tasks' => round($avgValue, 2),
        ];
    }

    public function getCampaignAnalytics(string $period = '30days'): array
    {
        $startDate = $this->getStartDate($period);
        
        $events = AnalyticsEvent::where('created_at', '>=', $startDate)
            ->whereNotNull('utm_campaign')
            ->get();
        
        $campaigns = $events->groupBy('utm_campaign')->map(function ($campaignEvents, $campaignName) {
            $clicks = $campaignEvents->count();
            $uniqueUsers = $campaignEvents->pluck('user_id')->unique()->count();
            
            $conversions = AnalyticsEvent::whereIn('user_id', $campaignEvents->pluck('user_id'))
                ->whereIn('event_type', ['task_created', 'offer_accepted', 'registration'])
                ->count();
            
            $conversionRate = $clicks > 0 ? ($conversions / $clicks) * 100 : 0;
            
            return [
                'campaign' => $campaignName,
                'clicks' => $clicks,
                'unique_users' => $uniqueUsers,
                'conversions' => $conversions,
                'conversion_rate' => round($conversionRate, 2),
                'sources' => $campaignEvents->groupBy('utm_source')->map->count(),
                'mediums' => $campaignEvents->groupBy('utm_medium')->map->count(),
            ];
        });
        
        return [
            'period' => $period,
            'campaigns' => $campaigns->values(),
            'total_clicks' => $events->count(),
            'total_campaigns' => $campaigns->count(),
        ];
    }

    private function getStartDate(string $period): Carbon
    {
        return match($period) {
            '7days' => Carbon::now()->subDays(7),
            '30days' => Carbon::now()->subDays(30),
            '90days' => Carbon::now()->subDays(90),
            '1year' => Carbon::now()->subYear(),
            default => Carbon::now()->subDays(30),
        };
    }
}
