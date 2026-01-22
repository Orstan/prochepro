<?php

namespace App\Services;

use App\Models\PushSubscription;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WebPushService
{
    /**
     * Send push notification to a specific user
     */
    public function sendToUser(User $user, string $title, string $body, ?string $url = null, ?string $tag = null): void
    {
        // Skip if user explicitly disabled push notifications (null = enabled by default)
        if ($user->push_notifications === false) {
            Log::info('Push notifications disabled for user #' . $user->id);
            return;
        }

        $subscriptions = PushSubscription::where('user_id', $user->id)->get();
        
        Log::info('Sending push notification to user #' . $user->id, [
            'subscriptions_count' => $subscriptions->count(),
            'title' => $title,
        ]);

        if ($subscriptions->isEmpty()) {
            Log::warning('No push subscriptions found for user #' . $user->id);
            return;
        }

        foreach ($subscriptions as $subscription) {
            $this->sendNotification($subscription, $title, $body, $url, $tag);
        }
    }

    /**
     * Send push notification to a subscription using web-push protocol
     */
    protected function sendNotification(PushSubscription $subscription, string $title, string $body, ?string $url = null, ?string $tag = null, ?string $icon = null): void
    {
        try {
            $frontendUrl = config('app.frontend_url', 'https://prochepro.fr');
            
            // Generate unique tag for each notification
            $uniqueTag = $tag ?? 'prochepro-' . time() . '-' . substr(md5(uniqid()), 0, 8);
            
            $payload = json_encode([
                'title' => $title,
                'body' => $body,
                'icon' => $icon ?? $frontendUrl . '/icons/icon-192x192.png',
                'badge' => $frontendUrl . '/icons/icon-72x72.png',
                'url' => $url ?? '/',
                'tag' => $uniqueTag,
                'requireInteraction' => true,
                'vibrate' => [300, 200, 300, 200, 300, 200, 500],
                'silent' => false,
                'renotify' => true,
                'timestamp' => time() * 1000,
                'data' => [
                    'url' => $url ?? '/',
                    'timestamp' => time() * 1000,
                ],
                'actions' => [
                    [
                        'action' => 'open',
                        'title' => 'Ouvrir',
                    ],
                    [
                        'action' => 'close',
                        'title' => 'Fermer',
                    ],
                ],
            ]);

            $publicKey = config('services.webpush.public_key');
            $privateKey = config('services.webpush.private_key');
            $subject = config('services.webpush.subject');

            if (!$publicKey || !$privateKey) {
                Log::warning('VAPID keys not configured');
                return;
            }

            // Use Minishlink\WebPush if available, otherwise use HTTP directly
            if (class_exists(\Minishlink\WebPush\WebPush::class)) {
                Log::info('Using minishlink/web-push library', ['subscription_id' => $subscription->id]);
                $result = $this->sendWithLibrary($subscription, $payload);
                if ($result) {
                    Log::info('Push notification sent successfully', [
                        'user_id' => $subscription->user_id,
                        'title' => $title,
                    ]);
                } else {
                    Log::error('Push notification failed via library', [
                        'user_id' => $subscription->user_id,
                    ]);
                }
            } else {
                Log::warning('minishlink/web-push not available, using fallback HTTP');
                $this->sendWithHttp($subscription, $payload);
                Log::info('Push notification sent via HTTP fallback', [
                    'user_id' => $subscription->user_id,
                    'title' => $title,
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Push notification failed', [
                'error' => $e->getMessage(),
                'subscription_id' => $subscription->id,
            ]);
        }
    }

    /**
     * Send using minishlink/web-push library
     */
    protected function sendWithLibrary(PushSubscription $subscription, string $payload): bool
    {
        try {
            $auth = [
                'VAPID' => [
                    'subject' => config('services.webpush.subject'),
                    'publicKey' => config('services.webpush.public_key'),
                    'privateKey' => config('services.webpush.private_key'),
                ],
            ];

            $webPush = new \Minishlink\WebPush\WebPush($auth);

            $sub = \Minishlink\WebPush\Subscription::create([
                'endpoint' => $subscription->endpoint,
                'publicKey' => $subscription->p256dh_key,
                'authToken' => $subscription->auth_key,
            ]);

            $report = $webPush->sendOneNotification($sub, $payload);
            
            // Flush to actually send
            foreach ($webPush->flush() as $result) {
                if (!$result->isSuccess()) {
                    Log::error('Web push send failed', [
                        'reason' => $result->getReason(),
                        'endpoint' => $result->getEndpoint(),
                    ]);
                    
                    // If subscription is expired, delete it
                    if ($result->isSubscriptionExpired()) {
                        Log::info('Deleting expired subscription', ['id' => $subscription->id]);
                        $subscription->delete();
                    }
                    
                    return false;
                }
            }
            
            return true;
        } catch (\Exception $e) {
            Log::error('WebPush library error', [
                'error' => $e->getMessage(),
                'subscription_id' => $subscription->id,
            ]);
            return false;
        }
    }

    /**
     * Send using simple HTTP request (fallback)
     */
    protected function sendWithHttp(PushSubscription $subscription, string $payload): void
    {
        // This is a simplified version - for production use minishlink/web-push
        Http::withHeaders([
            'Content-Type' => 'application/json',
            'TTL' => '86400',
        ])->post($subscription->endpoint, [
            'payload' => $payload,
        ]);
    }

    /**
     * Send notification for new message
     */
    public function notifyNewMessage(User $recipient, string $senderName, string $taskTitle): void
    {
        $this->sendToUser(
            $recipient,
            'Nouveau message',
            "{$senderName} vous a envoyé un message concernant \"{$taskTitle}\"",
            '/messages'
        );
    }

    /**
     * Send notification for new offer
     */
    public function notifyNewOffer(User $client, string $prestataireName, string $taskTitle): void
    {
        $this->sendToUser(
            $client,
            'Nouvelle offre',
            "{$prestataireName} a fait une offre pour \"{$taskTitle}\"",
            '/dashboard'
        );
    }

    /**
     * Send notification for accepted offer
     */
    public function notifyOfferAccepted(User $prestataire, string $taskTitle): void
    {
        $this->sendToUser(
            $prestataire,
            'Offre acceptée !',
            "Votre offre pour \"{$taskTitle}\" a été acceptée",
            '/dashboard'
        );
    }

    /**
     * 🔔 Send notification for new task in user's area (smart geolocation)
     */
    public function notifyNewTaskInArea(User $user, $task, string $distance = null): void
    {
        $locationText = $distance ? " à {$distance}" : " dans votre quartier";
        $budgetText = '';
        
        if ($task->budget_min && $task->budget_max) {
            $budgetText = " • {$task->budget_min}€-{$task->budget_max}€";
        } elseif ($task->budget_min) {
            $budgetText = " • À partir de {$task->budget_min}€";
        }

        $this->sendToUser(
            $user,
            "🔔 Nouvelle mission{$locationText} !",
            "{$task->title}{$budgetText}",
            '/tasks/' . $task->id,
            'task-nearby-' . $task->id
        );
    }

    /**
     * ⭐ Send notification for high rating (5 stars)
     */
    public function notifyHighRating(User $user, int $rating, string $taskTitle): void
    {
        $stars = str_repeat('⭐', $rating);
        
        $this->sendToUser(
            $user,
            $rating === 5 ? '⭐ Vous avez reçu 5 étoiles !' : "Nouvelle note : {$stars}",
            "Excellent travail pour \"{$taskTitle}\" !",
            '/profile/reviews',
            'rating-' . time()
        );
    }

    /**
     * 🎁 Send notification for special promotion (limited time offer)
     */
    public function notifyPromotion(User $user, string $title, string $message, ?string $promoCode = null, ?string $url = null): void
    {
        $body = $message;
        if ($promoCode) {
            $body .= " • Code: {$promoCode}";
        }

        $this->sendToUser(
            $user,
            "🎁 {$title}",
            $body,
            $url ?? '/promotions',
            'promo-' . time()
        );
    }

    /**
     * 💬 Send notification for urgent message
     */
    public function notifyUrgentMessage(User $recipient, string $senderName, string $preview): void
    {
        $this->sendToUser(
            $recipient,
            '💬 Message urgent',
            "{$senderName}: {$preview}",
            '/messages',
            'urgent-msg-' . time()
        );
    }

    /**
     * 🎯 Send smart notification based on user activity
     */
    public function sendSmartNotification(User $user, string $type, array $data): void
    {
        switch ($type) {
            case 'task_nearby':
                if (isset($data['task'])) {
                    $this->notifyNewTaskInArea($user, $data['task'], $data['distance'] ?? null);
                }
                break;

            case 'high_rating':
                if (isset($data['rating'], $data['task_title'])) {
                    $this->notifyHighRating($user, $data['rating'], $data['task_title']);
                }
                break;

            case 'promotion':
                if (isset($data['title'], $data['message'])) {
                    $this->notifyPromotion(
                        $user,
                        $data['title'],
                        $data['message'],
                        $data['promo_code'] ?? null,
                        $data['url'] ?? null
                    );
                }
                break;

            case 'urgent_message':
                if (isset($data['sender_name'], $data['preview'])) {
                    $this->notifyUrgentMessage($user, $data['sender_name'], $data['preview']);
                }
                break;
        }
    }
}
