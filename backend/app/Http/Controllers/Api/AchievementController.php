<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GamificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AchievementController extends Controller
{
    protected GamificationService $gamificationService;

    public function __construct(GamificationService $gamificationService)
    {
        $this->gamificationService = $gamificationService;
    }

    /**
     * Get user's gamification stats
     */
    public function getStats(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $stats = $this->gamificationService->getUserStats($user);

        return response()->json($stats);
    }

    /**
     * Get user's achievements
     */
    public function getAchievements(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $achievements = $this->gamificationService->getUserAchievements($user);

        return response()->json($achievements);
    }

    /**
     * Mark achievements as notified
     */
    public function markAsNotified(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $achievementIds = $request->input('achievement_ids', []);

        $user->achievements()
            ->whereIn('achievement_id', $achievementIds)
            ->where('is_notified', false)
            ->update(['is_notified' => true]);

        return response()->json(['success' => true]);
    }

    /**
     * Manually trigger achievement check (for testing)
     */
    public function checkAchievements(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $awarded = $this->gamificationService->checkAndAwardAchievements($user);

        return response()->json([
            'success' => true,
            'awarded_count' => count($awarded),
            'awarded' => $awarded->map(function ($achievement) {
                return [
                    'id' => $achievement->id,
                    'name' => $achievement->name,
                    'description' => $achievement->description,
                    'icon' => $achievement->icon,
                    'xp_reward' => $achievement->xp_reward,
                ];
            }),
        ]);
    }
}
