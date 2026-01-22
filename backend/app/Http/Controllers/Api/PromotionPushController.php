<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\WebPushService;
use App\Services\AdminActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromotionPushController extends Controller
{
    /**
     * Send promotional push notification to users
     */
    public function send(Request $request, WebPushService $webPushService): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:100',
            'message' => 'required|string|max:255',
            'promo_code' => 'nullable|string|max:50',
            'url' => 'nullable|string|max:255',
            'target_audience' => 'required|in:all,clients,prestataires,verified,active',
            'user_ids' => 'nullable|array',
            'user_ids.*' => 'integer|exists:users,id',
        ]);

        // Build user query based on target audience
        $query = User::whereNotNull('email');

        if (isset($validated['user_ids']) && !empty($validated['user_ids'])) {
            // Specific users
            $query->whereIn('id', $validated['user_ids']);
        } else {
            // Audience filtering
            switch ($validated['target_audience']) {
                case 'clients':
                    $query->where(function($q) {
                        $q->where('role', 'client')
                          ->orWhereJsonContains('roles', 'client');
                    });
                    break;
                
                case 'prestataires':
                    $query->where(function($q) {
                        $q->where('role', 'prestataire')
                          ->orWhereJsonContains('roles', 'prestataire');
                    });
                    break;
                
                case 'verified':
                    $query->where('is_verified', true)
                          ->where('verification_status', 'approved');
                    break;
                
                case 'active':
                    $query->where('last_login_at', '>=', now()->subDays(30));
                    break;
            }
        }

        // Only send to users who haven't disabled push notifications
        $users = $query->where(function($q) {
            $q->whereNull('push_notifications')
              ->orWhere('push_notifications', true);
        })->get();

        $sentCount = 0;
        $errorCount = 0;

        foreach ($users as $user) {
            try {
                $webPushService->notifyPromotion(
                    $user,
                    $validated['title'],
                    $validated['message'],
                    $validated['promo_code'] ?? null,
                    $validated['url'] ?? null
                );
                $sentCount++;
            } catch (\Exception $e) {
                $errorCount++;
                \Log::error('Failed to send promo push to user #' . $user->id, [
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Log admin activity
        AdminActivityLogger::log(
            'promotion_push_sent',
            'Promotion push notification sent',
            [
                'title' => $validated['title'],
                'target_audience' => $validated['target_audience'],
                'sent_count' => $sentCount,
                'error_count' => $errorCount,
            ]
        );

        return response()->json([
            'message' => 'Promotional push notifications sent',
            'sent_count' => $sentCount,
            'error_count' => $errorCount,
            'total_users' => $users->count(),
        ]);
    }

    /**
     * Send test promotional push to current user
     */
    public function sendTest(Request $request, WebPushService $webPushService): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:100',
            'message' => 'required|string|max:255',
            'promo_code' => 'nullable|string|max:50',
            'url' => 'nullable|string|max:255',
        ]);

        $user = $request->user();

        try {
            $webPushService->notifyPromotion(
                $user,
                $validated['title'],
                $validated['message'],
                $validated['promo_code'] ?? null,
                $validated['url'] ?? null
            );

            return response()->json([
                'message' => 'Test push notification sent successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to send test push notification',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
