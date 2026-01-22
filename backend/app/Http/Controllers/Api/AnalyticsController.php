<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    public function __construct(
        private AnalyticsService $analyticsService
    ) {}

    public function trackEvent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'event_type' => 'required|string',
            'event_category' => 'required|string',
            'event_data' => 'nullable|array',
            'session_id' => 'nullable|string',
        ]);

        $event = $this->analyticsService->trackEvent([
            'user_id' => auth()->id(),
            'event_type' => $validated['event_type'],
            'event_category' => $validated['event_category'],
            'event_data' => $validated['event_data'] ?? null,
            'session_id' => $validated['session_id'] ?? null,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'referrer' => $request->header('referer'),
            'utm_source' => $request->input('utm_source'),
            'utm_medium' => $request->input('utm_medium'),
            'utm_campaign' => $request->input('utm_campaign'),
            'utm_term' => $request->input('utm_term'),
            'utm_content' => $request->input('utm_content'),
        ]);

        return response()->json([
            'success' => true,
            'event_id' => $event->id,
        ]);
    }

    public function trackProfileView(Request $request, int $profileUserId): JsonResponse
    {
        $this->analyticsService->trackProfileView(
            $profileUserId,
            auth()->id(),
            [
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'referrer' => $request->header('referer'),
            ]
        );

        return response()->json(['success' => true]);
    }

    public function getBusinessAnalytics(Request $request): JsonResponse
    {
        $userId = auth()->id();
        $period = $request->input('period', '30days');

        \Log::info('[Analytics] Getting business analytics', [
            'user_id' => $userId,
            'period' => $period,
        ]);

        $analytics = $this->analyticsService->getBusinessAnalytics($userId, $period);

        \Log::info('[Analytics] Business analytics result', [
            'user_id' => $userId,
            'profile_views' => $analytics['profile_views']['total'] ?? 0,
            'offers_total' => $analytics['offers']['total'] ?? 0,
            'offers_accepted' => $analytics['offers']['accepted'] ?? 0,
            'tasks_completed' => $analytics['tasks']['completed'] ?? 0,
            'revenue' => $analytics['revenue']['total'] ?? 0,
        ]);

        return response()->json($analytics);
    }

    public function getDemandForecast(Request $request): JsonResponse
    {
        $category = $request->input('category');
        $daysAhead = $request->input('days_ahead', 30);

        $forecast = $this->analyticsService->getDemandForecast($category, $daysAhead);

        return response()->json($forecast);
    }

    public function getCampaignAnalytics(Request $request): JsonResponse
    {
        $period = $request->input('period', '30days');

        $analytics = $this->analyticsService->getCampaignAnalytics($period);

        return response()->json($analytics);
    }

    /**
     * Debug endpoint to check prestataire data in database
     */
    public function debugPrestataireData(Request $request): JsonResponse
    {
        $userId = auth()->id();
        
        // Get all offers for this prestataire
        $allOffers = \App\Models\Offer::where('prestataire_id', $userId)->get();
        $acceptedOffers = \App\Models\Offer::where('prestataire_id', $userId)
            ->where('status', 'accepted')
            ->get();
        
        // Get task IDs from accepted offers
        $taskIds = $acceptedOffers->pluck('task_id')->toArray();
        
        // Get all tasks
        $allTasks = \App\Models\Task::whereIn('id', $taskIds)->get();
        $completedTasks = \App\Models\Task::whereIn('id', $taskIds)
            ->where('status', 'completed')
            ->get();
        
        return response()->json([
            'user_id' => $userId,
            'offers' => [
                'total' => $allOffers->count(),
                'accepted' => $acceptedOffers->count(),
                'list' => $allOffers->map(fn($o) => [
                    'id' => $o->id,
                    'task_id' => $o->task_id,
                    'price' => $o->price,
                    'status' => $o->status,
                    'created_at' => $o->created_at,
                ]),
            ],
            'tasks' => [
                'from_accepted_offers' => $allTasks->count(),
                'completed' => $completedTasks->count(),
                'list' => $allTasks->map(fn($t) => [
                    'id' => $t->id,
                    'title' => $t->title,
                    'status' => $t->status,
                    'updated_at' => $t->updated_at,
                ]),
            ],
        ]);
    }
}
