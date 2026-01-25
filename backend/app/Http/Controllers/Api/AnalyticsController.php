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
     * Get live statistics for authenticated user (real-time dashboard data)
     */
    public function liveStats(Request $request): JsonResponse
    {
        $userId = auth()->id();
        
        if (!$userId) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        try {
            $user = \App\Models\User::findOrFail($userId);
            
            // Get task IDs where user is involved
            $clientTaskIds = \App\Models\Task::where('client_id', $userId)->pluck('id')->toArray();
            $prestataireTaskIds = \App\Models\Offer::where('prestataire_id', $userId)
                ->where('status', 'accepted')
                ->pluck('task_id')
                ->toArray();
            $allUserTaskIds = array_unique(array_merge($clientTaskIds, $prestataireTaskIds));
            
            // Count unread messages
            $unreadMessages = !empty($allUserTaskIds) 
                ? \App\Models\Message::whereIn('task_id', $allUserTaskIds)
                    ->where('sender_id', '!=', $userId)
                    ->whereNull('read_at')
                    ->count()
                : 0;
            
            // Statistics
            $stats = [
                // Online status (approximate)
                'online_users' => \Illuminate\Support\Facades\Cache::get('online_users_count', 0),
                
                // Active tasks on platform
                'active_tasks_total' => \App\Models\Task::where('status', 'open')->count(),
                
                // My tasks (as client)
                'my_tasks' => [
                    'open' => \App\Models\Task::where('client_id', $userId)->where('status', 'open')->count(),
                    'in_progress' => \App\Models\Task::where('client_id', $userId)->where('status', 'in_progress')->count(),
                    'completed' => \App\Models\Task::where('client_id', $userId)->where('status', 'completed')->count(),
                ],
                
                // My offers (as prestataire)
                'my_offers' => [
                    'pending' => \App\Models\Offer::where('prestataire_id', $userId)->where('status', 'pending')->count(),
                    'accepted' => \App\Models\Offer::where('prestataire_id', $userId)->where('status', 'accepted')->count(),
                    'rejected' => \App\Models\Offer::where('prestataire_id', $userId)->where('status', 'rejected')->count(),
                ],
                
                // Messages & Notifications
                'unread_messages' => $unreadMessages,
                'unread_notifications' => \App\Models\Notification::where('user_id', $userId)
                    ->whereNull('read_at')
                    ->count(),
                
                // Today's activity
                'today' => [
                    'profile_views' => \App\Models\ProfileView::where('profile_user_id', $userId)
                        ->whereDate('created_at', today())
                        ->count(),
                    'new_offers' => \App\Models\Offer::where('prestataire_id', $userId)
                        ->whereDate('created_at', today())
                        ->count(),
                    'revenue' => \App\Models\Payment::where('prestataire_id', $userId)
                        ->where('status', 'completed')
                        ->whereDate('created_at', today())
                        ->sum('provider_amount') ?? 0,
                ],
            ];
            
            return response()->json($stats);
        } catch (\Exception $e) {
            \Log::error('Error getting live stats', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);
            
            return response()->json([
                'error' => 'Failed to fetch statistics',
                'message' => config('app.debug') ? $e->getMessage() : 'Please try again later'
            ], 500);
        }
    }

    /**
     * Business analytics for dashboard
     */
    public function business(Request $request): JsonResponse
    {
        try {
            $userId = auth()->id();
            
            if (!$userId) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }
            
            $period = $request->query('period', '30days');
            $days = (int)filter_var($period, FILTER_SANITIZE_NUMBER_INT);
            if ($days <= 0) $days = 30;
            
            $startDate = now()->subDays($days);
            
            $user = User::findOrFail($userId);
            
            // Tasks statistics
            $tasksData = [
                'total' => Task::where('client_id', $userId)
                    ->where('created_at', '>=', $startDate)
                    ->count(),
                'open' => Task::where('client_id', $userId)
                    ->where('status', 'open')
                    ->where('created_at', '>=', $startDate)
                    ->count(),
                'in_progress' => Task::where('client_id', $userId)
                    ->where('status', 'in_progress')
                    ->where('created_at', '>=', $startDate)
                    ->count(),
                'completed' => Task::where('client_id', $userId)
                    ->where('status', 'completed')
                    ->where('created_at', '>=', $startDate)
                    ->count(),
            ];
            
            // Offers statistics (for prestataires)
            $offersData = [
                'received' => Offer::where('prestataire_id', $userId)
                    ->where('created_at', '>=', $startDate)
                    ->count(),
                'accepted' => Offer::where('prestataire_id', $userId)
                    ->where('status', 'accepted')
                    ->where('created_at', '>=', $startDate)
                    ->count(),
                'pending' => Offer::where('prestataire_id', $userId)
                    ->where('status', 'pending')
                    ->where('created_at', '>=', $startDate)
                    ->count(),
            ];
            
            // Revenue (for prestataires)
            $revenue = Payment::where('prestataire_id', $userId)
                ->where('status', 'completed')
                ->where('created_at', '>=', $startDate)
                ->sum('provider_amount');
            
            // Messages
            $messagesCount = Message::where('sender_id', $userId)
                ->where('created_at', '>=', $startDate)
                ->count();
            
            // Reviews
            $reviewsCount = Review::where('prestataire_id', $userId)
                ->where('created_at', '>=', $startDate)
                ->count();
            
            $avgRating = Review::where('prestataire_id', $userId)
                ->where('created_at', '>=', $startDate)
                ->avg('rating');
            
            return response()->json([
                'period' => $period,
                'days' => $days,
                'tasks' => $tasksData,
                'offers' => $offersData,
                'revenue' => round($revenue, 2),
                'messages' => $messagesCount,
                'reviews' => [
                    'count' => $reviewsCount,
                    'average_rating' => $avgRating ? round($avgRating, 2) : null,
                ],
                'user' => [
                    'id' => $user->id,
                    'role' => $user->role,
                    'level' => $user->level,
                    'xp' => $user->xp,
                ],
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error getting business analytics', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);
            
            return response()->json([
                'error' => 'Failed to fetch analytics',
                'message' => config('app.debug') ? $e->getMessage() : 'Please try again later'
            ], 500);
        }
    }
    
    /**
     * Demand forecast for next N days
     */
    public function demandForecast(Request $request): JsonResponse
    {
        try {
            $userId = auth()->id();
            
            if (!$userId) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }
            
            $daysAhead = (int)$request->query('days_ahead', 30);
            if ($daysAhead <= 0 || $daysAhead > 90) $daysAhead = 30;
            
            $user = User::findOrFail($userId);
            
            // Get historical data for prediction
            $historicalDays = 90;
            $startDate = now()->subDays($historicalDays);
            
            // Tasks by day
            $tasksByDay = Task::where('created_at', '>=', $startDate)
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->pluck('count', 'date');
            
            // Simple moving average for forecast
            $avgTasksPerDay = $tasksByDay->avg() ?: 0;
            
            // Generate forecast
            $forecast = [];
            for ($i = 1; $i <= $daysAhead; $i++) {
                $date = now()->addDays($i)->format('Y-m-d');
                
                // Simple forecast with slight random variation
                $predicted = round($avgTasksPerDay * (1 + (rand(-10, 10) / 100)), 1);
                
                $forecast[] = [
                    'date' => $date,
                    'predicted_tasks' => max(0, $predicted),
                    'confidence' => 0.75, // 75% confidence
                ];
            }
            
            return response()->json([
                'days_ahead' => $daysAhead,
                'forecast' => $forecast,
                'historical' => [
                    'avg_tasks_per_day' => round($avgTasksPerDay, 2),
                    'total_tasks' => $tasksByDay->sum(),
                    'days_analyzed' => $historicalDays,
                ],
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error getting demand forecast', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);
            
            return response()->json([
                'error' => 'Failed to fetch forecast',
                'message' => config('app.debug') ? $e->getMessage() : 'Please try again later'
            ], 500);
        }
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
