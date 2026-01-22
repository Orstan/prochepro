<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PushSubscription;
use App\Models\User;
use App\Services\WebPushService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PushController extends Controller
{
    /**
     * Subscribe to push notifications
     */
    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'subscription' => ['required', 'array'],
            'subscription.endpoint' => ['required', 'string'],
            'subscription.keys' => ['sometimes', 'array'],
            'subscription.keys.p256dh' => ['sometimes', 'string'],
            'subscription.keys.auth' => ['sometimes', 'string'],
        ]);

        $user = User::findOrFail($validated['user_id']);
        $subscription = $validated['subscription'];

        // Update or create subscription
        $endpointHash = hash('sha256', $subscription['endpoint']);
        
        PushSubscription::updateOrCreate(
            [
                'user_id' => $user->id,
                'endpoint_hash' => $endpointHash,
            ],
            [
                'endpoint' => $subscription['endpoint'],
                'p256dh_key' => $subscription['keys']['p256dh'] ?? null,
                'auth_key' => $subscription['keys']['auth'] ?? null,
            ]
        );

        // Enable push notifications for user
        $user->update(['push_notifications' => true]);

        return response()->json([
            'message' => 'Subscription enregistrée avec succès.',
        ]);
    }

    /**
     * Unsubscribe from push notifications
     */
    public function unsubscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'endpoint' => ['required', 'string'],
        ]);

        $endpointHash = hash('sha256', $validated['endpoint']);
        
        PushSubscription::where('user_id', $validated['user_id'])
            ->where('endpoint_hash', $endpointHash)
            ->delete();

        return response()->json([
            'message' => 'Subscription supprimée.',
        ]);
    }

    /**
     * Get VAPID public key for client
     */
    public function getVapidKey(): JsonResponse
    {
        return response()->json([
            'publicKey' => config('services.webpush.public_key'),
        ]);
    }

    /**
     * Get user's push subscriptions (for debugging)
     */
    public function getSubscriptions(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $subscriptions = PushSubscription::where('user_id', $validated['user_id'])
            ->get()
            ->map(function ($sub) {
                return [
                    'id' => $sub->id,
                    'endpoint' => substr($sub->endpoint, 0, 50) . '...',
                    'created_at' => $sub->created_at,
                    'has_keys' => !empty($sub->p256dh_key) && !empty($sub->auth_key),
                ];
            });

        return response()->json([
            'subscriptions' => $subscriptions,
            'count' => $subscriptions->count(),
        ]);
    }

    /**
     * Test push notification (for debugging)
     */
    public function testPush(Request $request, WebPushService $webPushService): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $user = User::findOrFail($validated['user_id']);
        
        Log::info('Test push notification requested', [
            'user_id' => $user->id,
            'user_name' => $user->name,
        ]);

        try {
            $webPushService->sendToUser(
                $user,
                '🧪 Test Push Notification',
                'Ceci est un test de notification push. Si vous voyez ceci, les notifications fonctionnent!',
                '/',
                'test-push-' . time()
            );

            return response()->json([
                'message' => 'Test push notification envoyée. Vérifiez votre téléphone!',
                'sent_at' => now()->toDateTimeString(),
            ]);
        } catch (\Exception $e) {
            Log::error('Test push failed', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
            ]);

            return response()->json([
                'message' => 'Erreur lors de l\'envoi',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
