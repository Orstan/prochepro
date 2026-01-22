<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Task;
use App\Models\Payment;
use App\Models\Offer;
use App\Models\Review;
use App\Models\CreditTransaction;
use App\Models\SupportTicket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdvancedAnalyticsController extends Controller
{
    /**
     * Get revenue analytics
     */
    public function revenue(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'period' => ['nullable', 'in:7days,30days,90days,year,all'],
            'group_by' => ['nullable', 'in:day,week,month'],
        ]);

        $period = $validated['period'] ?? '30days';
        $groupBy = $validated['group_by'] ?? 'day';

        $dateFrom = match($period) {
            '7days' => now()->subDays(7),
            '30days' => now()->subDays(30),
            '90days' => now()->subDays(90),
            'year' => now()->subYear(),
            'all' => null,
        };

        $baseQuery = Payment::whereIn('status', ['captured', 'completed', 'authorized']);
        
        if ($dateFrom) {
            $baseQuery->where('created_at', '>=', $dateFrom);
        }

        $dateFormat = match($groupBy) {
            'day' => '%Y-%m-%d',
            'week' => '%Y-%u',
            'month' => '%Y-%m',
        };

        $revenueByPeriod = (clone $baseQuery)
            ->selectRaw("DATE_FORMAT(created_at, '{$dateFormat}') as period, SUM(amount) as total, COUNT(*) as count")
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        $totalRevenue = (clone $baseQuery)->sum('amount');
        $totalTransactions = (clone $baseQuery)->count();
        $averageTransaction = $totalTransactions > 0 ? $totalRevenue / $totalTransactions : 0;

        return response()->json([
            'total_revenue' => round($totalRevenue, 2),
            'total_transactions' => $totalTransactions,
            'average_transaction' => round($averageTransaction, 2),
            'revenue_by_period' => $revenueByPeriod,
        ]);
    }

    /**
     * Get user growth analytics
     */
    public function userGrowth(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'period' => ['nullable', 'in:7days,30days,90days,year,all'],
        ]);

        $period = $validated['period'] ?? '30days';
        $dateFrom = match($period) {
            '7days' => now()->subDays(7),
            '30days' => now()->subDays(30),
            '90days' => now()->subDays(90),
            'year' => now()->subYear(),
            'all' => null,
        };

        $baseQuery = User::query();
        if ($dateFrom) {
            $baseQuery->where('created_at', '>=', $dateFrom);
        }

        $usersByDay = (clone $baseQuery)
            ->selectRaw("DATE(created_at) as date, COUNT(*) as count")
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $totalUsers = User::count();
        $newUsers = $dateFrom ? User::where('created_at', '>=', $dateFrom)->count() : $totalUsers;
        $clientsCount = User::where('role', 'client')->count();
        $prestatairesCount = User::where('role', 'prestataire')->count();
        $verifiedCount = User::where('is_verified', true)->count();

        return response()->json([
            'total_users' => $totalUsers,
            'new_users' => $newUsers,
            'clients_count' => $clientsCount,
            'prestataires_count' => $prestatairesCount,
            'verified_count' => $verifiedCount,
            'users_by_day' => $usersByDay,
        ]);
    }

    /**
     * Get task analytics
     */
    public function tasks(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'period' => ['nullable', 'in:7days,30days,90days,year,all'],
        ]);

        $period = $validated['period'] ?? '30days';
        $dateFrom = match($period) {
            '7days' => now()->subDays(7),
            '30days' => now()->subDays(30),
            '90days' => now()->subDays(90),
            'year' => now()->subYear(),
            'all' => null,
        };

        $baseQuery = Task::query();
        if ($dateFrom) {
            $baseQuery->where('created_at', '>=', $dateFrom);
        }

        $tasksByStatus = Task::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $tasksByCategory = Task::selectRaw('category, COUNT(*) as count')
            ->groupBy('category')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        $tasksByDay = (clone $baseQuery)
            ->selectRaw("DATE(created_at) as date, COUNT(*) as count")
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'total_tasks' => Task::count(),
            'new_tasks' => (clone $baseQuery)->count(),
            'tasks_by_status' => $tasksByStatus,
            'tasks_by_category' => $tasksByCategory,
            'tasks_by_day' => $tasksByDay,
            'average_completion_hours' => 0,
        ]);
    }

    /**
     * Get engagement analytics
     */
    public function engagement(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'period' => ['nullable', 'in:7days,30days,90days,year,all'],
        ]);

        $period = $validated['period'] ?? '30days';
        $dateFrom = match($period) {
            '7days' => now()->subDays(7),
            '30days' => now()->subDays(30),
            '90days' => now()->subDays(90),
            'year' => now()->subYear(),
            'all' => null,
        };

        $offersBaseQuery = Offer::query();
        $reviewsBaseQuery = Review::query();
        
        if ($dateFrom) {
            $offersBaseQuery->where('created_at', '>=', $dateFrom);
            $reviewsBaseQuery->where('created_at', '>=', $dateFrom);
        }

        $totalOffers = (clone $offersBaseQuery)->count();
        $acceptedOffers = (clone $offersBaseQuery)->where('status', 'accepted')->count();
        $totalReviews = (clone $reviewsBaseQuery)->count();
        $averageRating = Review::avg('rating');

        $offersByDay = (clone $offersBaseQuery)
            ->selectRaw("DATE(created_at) as date, COUNT(*) as count")
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $reviewsByDay = (clone $reviewsBaseQuery)
            ->selectRaw("DATE(created_at) as date, COUNT(*) as count, AVG(rating) as avg_rating")
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'total_offers' => $totalOffers,
            'accepted_offers' => $acceptedOffers,
            'acceptance_rate' => $totalOffers > 0 ? round(($acceptedOffers / $totalOffers) * 100, 1) : 0,
            'total_reviews' => $totalReviews,
            'average_rating' => round($averageRating ?? 0, 2),
            'offers_by_day' => $offersByDay,
            'reviews_by_day' => $reviewsByDay,
        ]);
    }

    /**
     * Get credits analytics
     */
    public function credits(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'period' => ['nullable', 'in:7days,30days,90days,year,all'],
        ]);

        $period = $validated['period'] ?? '30days';
        $dateFrom = match($period) {
            '7days' => now()->subDays(7),
            '30days' => now()->subDays(30),
            '90days' => now()->subDays(90),
            'year' => now()->subYear(),
            'all' => null,
        };

        $baseQuery = CreditTransaction::query();
        if ($dateFrom) {
            $baseQuery->where('created_at', '>=', $dateFrom);
        }

        $creditsByAction = (clone $baseQuery)
            ->selectRaw('action, SUM(amount) as total, COUNT(*) as count')
            ->groupBy('action')
            ->get();

        $creditsByType = (clone $baseQuery)
            ->selectRaw('type, SUM(amount) as total')
            ->groupBy('type')
            ->pluck('total', 'type');

        $creditsByDay = (clone $baseQuery)
            ->selectRaw("DATE(created_at) as date, SUM(amount) as total")
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'credits_by_action' => $creditsByAction,
            'credits_by_type' => $creditsByType,
            'credits_by_day' => $creditsByDay,
        ]);
    }

    /**
     * Get support analytics
     */
    public function support(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'period' => ['nullable', 'in:7days,30days,90days,year,all'],
        ]);

        $period = $validated['period'] ?? '30days';
        $dateFrom = match($period) {
            '7days' => now()->subDays(7),
            '30days' => now()->subDays(30),
            '90days' => now()->subDays(90),
            'year' => now()->subYear(),
            'all' => null,
        };

        $baseQuery = SupportTicket::query();
        if ($dateFrom) {
            $baseQuery->where('created_at', '>=', $dateFrom);
        }

        $ticketsByStatus = SupportTicket::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $ticketsByPriority = SupportTicket::selectRaw('priority, COUNT(*) as count')
            ->groupBy('priority')
            ->pluck('count', 'priority');

        $ticketsByCategory = SupportTicket::selectRaw('category, COUNT(*) as count')
            ->groupBy('category')
            ->orderBy('count', 'desc')
            ->get();

        return response()->json([
            'total_tickets' => SupportTicket::count(),
            'new_tickets' => (clone $baseQuery)->count(),
            'tickets_by_status' => $ticketsByStatus,
            'tickets_by_priority' => $ticketsByPriority,
            'tickets_by_category' => $ticketsByCategory,
            'average_response_hours' => 0,
            'average_resolution_hours' => 0,
        ]);
    }

    /**
     * Get comprehensive dashboard data
     */
    public function dashboard(Request $request): JsonResponse
    {
        $period = $request->input('period', '30days');

        $revenueData = json_decode($this->revenue($request)->getContent(), true);
        $userGrowthData = json_decode($this->userGrowth($request)->getContent(), true);
        $tasksData = json_decode($this->tasks($request)->getContent(), true);
        $engagementData = json_decode($this->engagement($request)->getContent(), true);
        $creditsData = json_decode($this->credits($request)->getContent(), true);
        $supportData = json_decode($this->support($request)->getContent(), true);

        return response()->json([
            'revenue' => $revenueData,
            'user_growth' => $userGrowthData,
            'tasks' => $tasksData,
            'engagement' => $engagementData,
            'credits' => $creditsData,
            'support' => $supportData,
        ]);
    }

    /**
     * Export analytics data to CSV
     */
    public function export(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'in:revenue,users,tasks,engagement,credits,support'],
            'period' => ['nullable', 'in:7days,30days,90days,year,all'],
        ]);

        $data = match($validated['type']) {
            'revenue' => $this->revenue($request)->getData(true),
            'users' => $this->userGrowth($request)->getData(true),
            'tasks' => $this->tasks($request)->getData(true),
            'engagement' => $this->engagement($request)->getData(true),
            'credits' => $this->credits($request)->getData(true),
            'support' => $this->support($request)->getData(true),
        };

        $csv = "Type,Value\n";
        foreach ($data as $key => $value) {
            if (!is_array($value) && !is_object($value)) {
                $csv .= "{$key},{$value}\n";
            }
        }

        return response()->json([
            'filename' => "analytics_{$validated['type']}_" . now()->format('Y-m-d_His') . '.csv',
            'content' => base64_encode($csv),
        ]);
    }
}
