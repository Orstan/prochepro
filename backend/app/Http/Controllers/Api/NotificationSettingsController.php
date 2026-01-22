<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserNotificationSettings;
use App\Models\UserInterestedCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class NotificationSettingsController extends Controller
{
    /**
     * Get user's notification settings
     */
    public function show()
    {
        $user = Auth::user();
        
        $settings = UserNotificationSettings::firstOrCreate(
            ['user_id' => $user->id],
            [
                'enabled' => false,
                'notification_mode' => 'auto_skills',
                'channels' => UserNotificationSettings::getDefaultChannels(),
            ]
        );

        $interestedCategories = UserInterestedCategory::getKeysForUser($user->id);

        return response()->json([
            'settings' => $settings,
            'interested_categories' => $interestedCategories,
            'has_active_subscription' => $user->hasActiveSubscription(),
            'subscription_expires_at' => $user->subscription_expires_at,
        ]);
    }

    /**
     * Update notification settings
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'enabled' => 'required|boolean',
            'notification_mode' => 'required|in:auto_skills,manual_selection',
            'channels' => 'nullable|array',
            'channels.email' => 'nullable|boolean',
            'channels.push' => 'nullable|boolean',
            'interested_categories' => 'nullable|array',
            'interested_categories.*.category_key' => 'required|string',
            'interested_categories.*.subcategory_key' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $settings = UserNotificationSettings::updateOrCreate(
            ['user_id' => $user->id],
            [
                'enabled' => $request->enabled,
                'notification_mode' => $request->notification_mode,
                'channels' => $request->channels ?? UserNotificationSettings::getDefaultChannels(),
            ]
        );

        // Update interested categories if manual mode
        if ($request->notification_mode === 'manual_selection' && $request->has('interested_categories')) {
            UserInterestedCategory::syncForUser($user->id, $request->interested_categories);
        }

        return response()->json([
            'message' => 'Paramètres de notification mis à jour avec succès',
            'settings' => $settings,
        ]);
    }

    /**
     * Add interested category
     */
    public function addCategory(Request $request)
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'category_key' => 'required|string',
            'subcategory_key' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $category = UserInterestedCategory::firstOrCreate([
            'user_id' => $user->id,
            'category_key' => $request->category_key,
            'subcategory_key' => $request->subcategory_key,
        ]);

        return response()->json([
            'message' => 'Catégorie ajoutée avec succès',
            'category' => $category,
        ]);
    }

    /**
     * Remove interested category
     */
    public function removeCategory(Request $request)
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'category_key' => 'required|string',
            'subcategory_key' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        UserInterestedCategory::where('user_id', $user->id)
            ->where('category_key', $request->category_key)
            ->where('subcategory_key', $request->subcategory_key)
            ->delete();

        return response()->json([
            'message' => 'Catégorie retirée avec succès',
        ]);
    }

    /**
     * Test notification (for debugging)
     */
    public function test()
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'message' => 'Non authentifié',
                ], 401);
            }

            // Get settings
            $settings = null;
            try {
                $settings = $user->notificationSettings;
            } catch (\Exception $e) {
                \Log::error('notificationSettings relationship error: ' . $e->getMessage());
                return response()->json([
                    'message' => 'Erreur lors de la récupération des paramètres',
                    'error' => $e->getMessage(),
                ], 500);
            }
            
            if (!$settings) {
                return response()->json([
                    'message' => 'Paramètres de notification non trouvés. Veuillez les configurer d\'abord.',
                ], 404);
            }

            if (!$settings->enabled) {
                return response()->json([
                    'message' => 'Les notifications sont désactivées',
                ], 400);
            }

            $sent = [];
            $errors = [];

            // Send test email if enabled
            if ($settings->isChannelEnabled('email')) {
                try {
                    \Mail::send('emails.test-notification', [
                        'userName' => $user->name,
                        'frontendUrl' => config('app.frontend_url', 'https://prochepro.fr'),
                    ], function ($message) use ($user) {
                        $message->to($user->email)
                            ->subject('🔔 Test de notification - ProchePro');
                    });
                    $sent[] = 'email';
                } catch (\Exception $e) {
                    \Log::warning('Email test failed: ' . $e->getMessage());
                    $errors[] = 'email: ' . $e->getMessage();
                }
            }

            // Send test notification via WebPush if enabled
            if ($settings->isChannelEnabled('push')) {
                try {
                    // Check if user has push subscriptions
                    $subscriptionsCount = \App\Models\PushSubscription::where('user_id', $user->id)->count();
                    
                    if ($subscriptionsCount === 0) {
                        $errors[] = 'push: Aucune inscription push trouvée. Veuillez activer les notifications push dans votre navigateur.';
                    } else {
                        $webPushService = app(\App\Services\WebPushService::class);
                        $webPushService->sendToUser(
                            $user,
                            '🔔 Test de notification',
                            'Vos notifications fonctionnent correctement ! 🎉',
                            '/dashboard'
                        );
                        $sent[] = 'push';
                    }
                } catch (\Exception $e) {
                    \Log::warning('WebPush test failed: ' . $e->getMessage());
                    $errors[] = 'push: ' . $e->getMessage();
                }
            }

            if (empty($sent) && empty($errors)) {
                return response()->json([
                    'message' => 'Aucun canal de notification actif. Veuillez activer au moins Email ou Push.',
                ]);
            }

            $message = 'Test terminé';
            if (!empty($sent)) {
                $message = 'Notification de test envoyée via: ' . implode(', ', $sent);
            }
            if (!empty($errors)) {
                $message .= '. Erreurs: ' . implode('; ', $errors);
            }

            return response()->json([
                'message' => $message,
                'channels_sent' => $sent,
                'channels_failed' => $errors,
            ]);
        } catch (\Exception $e) {
            \Log::error('Notification test error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Erreur lors du test de notification',
                'error' => $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTraceAsString() : null,
            ], 500);
        }
    }
}
