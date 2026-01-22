<?php

namespace App\Services;

use App\Models\MessengerSettings;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramNotificationService
{
    /**
     * Send a notification to a user via Telegram
     */
    public static function sendToUser(User $user, string $message, array $options = [])
    {
        try {
            // Get user's messenger settings
            $settings = MessengerSettings::where('user_id', $user->id)->first();
            
            if (!$settings || !$settings->telegram_enabled || !$settings->telegram_chat_id) {
                Log::info("Telegram notifications not enabled for user {$user->id}");
                return false;
            }
            
            // Send the message
            return self::sendMessage($settings->telegram_chat_id, $message, $options);
        } catch (\Exception $e) {
            Log::error("Failed to send Telegram notification to user {$user->id}: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Send a message to a Telegram chat
     */
    protected static function sendMessage(string $chatId, string $text, array $options = [])
    {
        $botToken = config('services.telegram.bot_token');
        
        $payload = array_merge([
            'chat_id' => $chatId,
            'text' => $text,
            'parse_mode' => 'HTML',
            'disable_web_page_preview' => false,
        ], $options);
        
        try {
            $response = Http::post("https://api.telegram.org/bot{$botToken}/sendMessage", $payload);
            
            if ($response->successful()) {
                Log::info("Telegram message sent successfully to chat {$chatId}");
                return true;
            } else {
                Log::error("Failed to send Telegram message: " . $response->body());
                return false;
            }
        } catch (\Exception $e) {
            Log::error("Error sending Telegram message: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Send message with inline keyboard buttons
     */
    protected static function sendMessageWithButtons(string $chatId, string $text, array $buttons)
    {
        $botToken = config('services.telegram.bot_token');
        
        $inlineKeyboard = [
            'inline_keyboard' => $buttons
        ];
        
        try {
            $response = Http::post("https://api.telegram.org/bot{$botToken}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $text,
                'parse_mode' => 'HTML',
                'reply_markup' => json_encode($inlineKeyboard),
            ]);
            
            return $response->successful();
        } catch (\Exception $e) {
            Log::error("Error sending Telegram message with buttons: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Notify user about a new task in their category
     */
    public static function notifyNewTask(User $user, $task)
    {
        $budgetText = '';
        if ($task->budget_min && $task->budget_max) {
            $budgetText = "{$task->budget_min}€ - {$task->budget_max}€";
        } elseif ($task->budget_min) {
            $budgetText = "À partir de {$task->budget_min}€";
        }
        
        $message = "🔔 <b>Nouvelle Mission dans votre secteur!</b>\n\n";
        $message .= "📋 <b>{$task->title}</b>\n";
        $message .= "📍 {$task->location}";
        
        if ($task->district) {
            $message .= " ({$task->district})";
        }
        
        $message .= "\n";
        
        if ($budgetText) {
            $message .= "💰 Budget: {$budgetText}\n";
        }
        
        if ($task->category) {
            $message .= "🏷️ Catégorie: {$task->category}\n";
        }
        
        $message .= "\n⚡ Soyez rapide! Les meilleures offres partent vite!";
        
        // Add inline button
        $buttons = [
            [
                [
                    'text' => '👀 Voir la mission',
                    'url' => "https://prochepro.fr/tasks/{$task->id}"
                ],
                [
                    'text' => '✅ Faire une offre',
                    'url' => "https://prochepro.fr/tasks/{$task->id}#offer"
                ]
            ]
        ];
        
        try {
            $settings = MessengerSettings::where('user_id', $user->id)->first();
            if ($settings && $settings->telegram_enabled && $settings->telegram_chat_id) {
                return self::sendMessageWithButtons($settings->telegram_chat_id, $message, $buttons);
            }
        } catch (\Exception $e) {
            Log::error("Failed to send new task notification: " . $e->getMessage());
        }
        
        return false;
    }
    
    /**
     * Notify user about a new message in a task
     */
    public static function notifyNewMessage(User $user, $task, $messageBody, $senderName)
    {
        $preview = substr($messageBody, 0, 100);
        if (strlen($messageBody) > 100) {
            $preview .= '...';
        }
        
        $notification = "💬 <b>Nouveau Message</b>\n\n";
        $notification .= "Mission: <b>{$task->title}</b>\n";
        $notification .= "De: <b>{$senderName}</b>\n\n";
        $notification .= "<i>{$preview}</i>\n\n";
        
        // Add inline button
        $buttons = [
            [
                [
                    'text' => '💬 Répondre',
                    'url' => "https://prochepro.fr/messages/{$task->id}"
                ]
            ]
        ];
        
        try {
            $settings = MessengerSettings::where('user_id', $user->id)->first();
            if ($settings && $settings->telegram_enabled && $settings->telegram_chat_id) {
                return self::sendMessageWithButtons($settings->telegram_chat_id, $notification, $buttons);
            }
        } catch (\Exception $e) {
            Log::error("Failed to send message notification: " . $e->getMessage());
        }
        
        return false;
    }
    
    /**
     * Notify user about an accepted offer
     */
    public static function notifyOfferAccepted(User $user, $offer)
    {
        $message = "✅ <b>Votre offre a été acceptée!</b>\n\n";
        $message .= "Mission: <b>{$offer->task->title}</b>\n";
        $message .= "Montant: {$offer->amount}€\n";
        $message .= "Client: {$offer->task->user->name}\n\n";
        $message .= "👉 Voir les détails: https://prochepro.fr/tasks/{$offer->task->id}";
        
        return self::sendToUser($user, $message);
    }
    
    /**
     * Notify user about a new offer on their task
     */
    public static function notifyNewOffer(User $user, $offer)
    {
        $message = "🎯 <b>Nouvelle Offre Reçue</b>\n\n";
        $message .= "Mission: <b>{$offer->task->title}</b>\n";
        $message .= "De: {$offer->user->name}\n";
        $message .= "Montant: {$offer->amount}€\n\n";
        $message .= "👉 Voir l'offre: https://prochepro.fr/tasks/{$offer->task->id}";
        
        return self::sendToUser($user, $message);
    }
    
    /**
     * Notify user about task completion
     */
    public static function notifyTaskCompleted(User $user, $task)
    {
        $message = "🎉 <b>Mission Terminée!</b>\n\n";
        $message .= "Mission: <b>{$task->title}</b>\n";
        $message .= "Montant: {$task->budget}€\n\n";
        $message .= "N'oubliez pas de laisser un avis!\n\n";
        $message .= "👉 Laisser un avis: https://prochepro.fr/tasks/{$task->id}/review";
        
        return self::sendToUser($user, $message);
    }
    
    /**
     * Notify user about payment received
     */
    public static function notifyPaymentReceived(User $user, $amount, $task = null)
    {
        $message = "💸 <b>Paiement Reçu!</b>\n\n";
        $message .= "🚀 <b>{$amount}€</b> ont été crédités sur votre compte!\n\n";
        
        if ($task) {
            $message .= "Pour la mission: <b>{$task->title}</b>\n\n";
        }
        
        $message .= "👉 Consulter mon solde: https://prochepro.fr/dashboard";
        
        return self::sendToUser($user, $message);
    }
    
    /**
     * Notify user about new review/rating
     */
    public static function notifyNewReview(User $user, $rating, $review, $task)
    {
        $stars = str_repeat('⭐', min(5, $rating));
        
        $message = "🌟 <b>Nouvel Avis Reçu!</b>\n\n";
        $message .= "Note: {$stars} ({$rating}/5)\n";
        $message .= "Mission: <b>{$task->title}</b>\n\n";
        
        if ($review && strlen($review) > 0) {
            $reviewPreview = substr($review, 0, 100);
            if (strlen($review) > 100) {
                $reviewPreview .= '...';
            }
            $message .= "Commentaire: \"<i>{$reviewPreview}</i>\"\n\n";
        }
        
        if ($rating >= 4) {
            $message .= "🏆 Excellent travail! Continuez ainsi!";
        } else {
            $message .= "💪 Améliorez-vous pour de meilleures notes!";
        }
        
        return self::sendToUser($user, $message);
    }
    
    /**
     * Notify user about low credits
     */
    public static function notifyLowCredits(User $user, $creditsRemaining)
    {
        $message = "⚠️ <b>Crédits Faibles!</b>\n\n";
        $message .= "Il vous reste seulement <b>{$creditsRemaining} crédits</b>.\n\n";
        $message .= "🚨 Rechargez maintenant pour ne pas manquer de nouvelles missions!\n\n";
        $message .= "👉 Recharger: https://prochepro.fr/pricing";
        
        return self::sendToUser($user, $message);
    }
    
    /**
     * Notify user about urgent message
     */
    public static function notifyUrgentMessage(User $user, $task, $sender)
    {
        $message = "🔥 <b>MESSAGE URGENT!</b>\n\n";
        $message .= "De: <b>{$sender->name}</b>\n";
        $message .= "Mission: <b>{$task->title}</b>\n\n";
        $message .= "⏰ Répondez rapidement!\n\n";
        $message .= "👉 Répondre maintenant: https://prochepro.fr/messages/{$task->id}";
        
        return self::sendToUser($user, $message);
    }
    
    /**
     * Notify user about task cancellation
     */
    public static function notifyTaskCancelled(User $user, $task, $reason = null)
    {
        $message = "❌ <b>Mission Annulée</b>\n\n";
        $message .= "Mission: <b>{$task->title}</b>\n\n";
        
        if ($reason) {
            $message .= "Raison: <i>{$reason}</i>\n\n";
        }
        
        $message .= "👉 Voir d'autres missions: https://prochepro.fr/tasks/browse";
        
        return self::sendToUser($user, $message);
    }
    
    /**
     * Notify user about subscription expiring soon
     */
    public static function notifySubscriptionExpiring(User $user, $daysRemaining)
    {
        $message = "⏰ <b>Abonnement Expire Bientôt!</b>\n\n";
        $message .= "Votre abonnement Premium expire dans <b>{$daysRemaining} jours</b>.\n\n";
        $message .= "🚀 Renouvelez maintenant pour continuer à profiter de tous les avantages!\n\n";
        $message .= "👉 Renouveler: https://prochepro.fr/pricing";
        
        return self::sendToUser($user, $message);
    }
}
