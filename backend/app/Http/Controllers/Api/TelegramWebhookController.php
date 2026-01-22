<?php

namespace App\Http\Controllers\Api;

use App\Console\Commands\TelegramBotCommand;
use App\Http\Controllers\Controller;
use App\Models\MessengerSettings;
use App\Models\User;
use App\Models\Task;
use App\Models\Offer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramWebhookController extends Controller
{
    /**
     * Handle incoming webhook from Telegram
     */
    public function handle(Request $request)
    {
        try {
            $update = $request->all();
            
            Log::info('Telegram webhook received', ['update' => $update]);
            
            // Process the update
            $this->processUpdate($update);
            
        } catch (\Throwable $e) {
            // Log error but still return 200 OK to Telegram
            Log::error('Telegram webhook error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'update' => $request->all()
            ]);
        }
        
        // Always return 200 OK to Telegram
        return response()->json(['ok' => true]);
    }
    
    /**
     * Process a Telegram update (same logic as TelegramBotCommand)
     */
    protected function processUpdate(array $update)
    {
        Log::info('Processing Telegram update', ['update' => $update]);
        
        // Check if this is a callback query (button press)
        if (isset($update['callback_query'])) {
            Log::info('Handling callback query');
            $this->handleCallbackQuery($update['callback_query']);
            return;
        }
        
        // Check if this is a message
        if (isset($update['message'])) {
            $message = $update['message'];
            $chatId = $message['chat']['id'];
            $text = $message['text'] ?? '';
            
            Log::info('Processing message', ['chat_id' => $chatId, 'text' => $text]);
            
            // Check if this is a /start command with a parameter
            if (strpos($text, '/start') === 0) {
                Log::info('Handling /start command');
                $parts = explode(' ', $text, 2);
                $parameter = $parts[1] ?? '';
                
                // Decode base64 parameter
                $decodedParameter = base64_decode($parameter, true);
                if ($decodedParameter === false) {
                    $decodedParameter = $parameter; // Fallback if not base64
                }
                
                if (strpos($decodedParameter, 'connect_') === 0) {
                    $userId = substr($decodedParameter, 8);
                    $this->handleConnect($chatId, $userId);
                } else {
                    $this->sendWelcomeMessage($chatId);
                }
            }
            // Handle other commands
            elseif ($text === '/help') {
                $this->sendHelpMessage($chatId);
            }
            elseif ($text === '/tasks' || $text === '/missions') {
                $this->handleMyTasksDetailed($chatId);
            }
            elseif ($text === '/balance') {
                $this->handleBalance($chatId);
            }
            elseif ($text === '/stats' || $text === '/statistiques') {
                $this->handleStats($chatId);
            }
            elseif ($text === '/messages') {
                $this->handleMessages($chatId);
            }
            elseif ($text === '/offers' || $text === '/offres') {
                $this->handleOffers($chatId);
            }
            elseif ($text === '/settings' || $text === '/parametres') {
                $this->handleSettings($chatId);
            }
            // Handle keyboard buttons
            elseif ($text === '📋 Mes missions') {
                $this->handleMyTasksDetailed($chatId);
            }
            elseif ($text === '🔍 Trouver une mission') {
                $this->handleFindTasks($chatId);
            }
            elseif ($text === '👤 Mon Profil') {
                $this->handleProfile($chatId);
            }
            elseif ($text === '🆘 Aide / Support') {
                $this->handleSupport($chatId);
            }
            elseif ($text === '⚙️ Paramètres') {
                $this->handleSettings($chatId);
            }
            elseif ($text === '💰 Mon Solde') {
                $this->handleBalance($chatId);
            }
            elseif ($text === '📊 Statistiques') {
                $this->handleStats($chatId);
            }
            elseif ($text === '💬 Messages') {
                $this->handleMessages($chatId);
            }
            elseif ($text === '🎯 Mes Offres') {
                $this->handleOffers($chatId);
            }
        }
    }
    
    /**
     * Handle the connect command
     */
    protected function handleConnect(string $chatId, string $userId)
    {
        try {
            // Find the user's messenger settings
            $settings = MessengerSettings::where('user_id', $userId)->first();
            
            if ($settings) {
                // Update the settings with the chat ID
                $settings->telegram_chat_id = $chatId;
                $settings->telegram_enabled = true;
                $settings->save();
                
                // Get the user's name
                $user = User::find($userId);
                $name = $user ? $user->name : 'Utilisateur';
                
                // Send a welcome message with keyboard
                $message = "👋 Bonjour {$name} !\n\n";
                $message .= "Votre compte ProchePro est maintenant connecté avec succès. ✅\n\n";
                $message .= "Vous recevrez ici instantanément :\n";
                $message .= "🔔 Les nouvelles missions dans votre quartier\n";
                $message .= "💬 Les messages des clients\n";
                $message .= "⚡ Les mises à jour de vos annonces\n\n";
                $message .= "Restez à l'écoute !";
                
                $this->sendMessageWithKeyboard($chatId, $message);
                
                Log::info("Connected Telegram chat {$chatId} to user {$userId}");
            } else {
                $this->sendMessage($chatId, "❌ Erreur: Impossible de trouver vos paramètres de messagerie. Veuillez réessayer la connexion depuis le site ProchePro.");
                Log::error("Could not find messenger settings for user {$userId}");
            }
        } catch (\Exception $e) {
            $this->sendMessage($chatId, "❌ Une erreur est survenue lors de la connexion. Veuillez réessayer plus tard.");
            Log::error("Telegram connection error: " . $e->getMessage());
        }
    }
    
    /**
     * Send a welcome message
     */
    protected function sendWelcomeMessage(string $chatId)
    {
        Log::info('Sending welcome message', ['chat_id' => $chatId]);
        
        $message = "👋 Bienvenue sur le bot ProchePro!\n\n";
        $message .= "Ce bot vous permet de recevoir des notifications de ProchePro directement sur Telegram.\n\n";
        $message .= "Pour connecter votre compte, utilisez le bouton 'Connecter Telegram' dans les paramètres de notification sur le site ProchePro.";
        
        $this->sendMessage($chatId, $message);
        
        Log::info('Welcome message sent', ['chat_id' => $chatId]);
    }
    
    /**
     * Send a help message
     */
    protected function sendHelpMessage(string $chatId)
    {
        $message = "🔍 <b>Aide du bot ProchePro</b>\n\n";
        $message .= "📋 <b>Commandes disponibles:</b>\n";
        $message .= "/start - Démarrer le bot\n";
        $message .= "/tasks - Voir vos missions actives\n";
        $message .= "/settings - Paramètres de notifications\n";
        $message .= "/help - Afficher ce message d'aide\n\n";
        $message .= "💡 <b>Astuce:</b> Utilisez les boutons du menu pour naviguer rapidement !\n\n";
        $message .= "Pour connecter votre compte, utilisez le bouton 'Connecter Telegram' dans les paramètres de notification sur le site ProchePro.";
        
        $this->sendMessage($chatId, $message);
    }
    
    /**
     * Handle My Tasks button with real data
     */
    protected function handleMyTasksDetailed(string $chatId)
    {
        try {
            // Find user by chat_id
            $settings = MessengerSettings::where('telegram_chat_id', $chatId)->first();
            
            if (!$settings || !$settings->user_id) {
                $this->sendMessage($chatId, "❌ Compte non connecté. Utilisez /start pour connecter votre compte.");
                return;
            }
            
            $user = User::find($settings->user_id);
            
            // Get user's active offers
            $activeOffers = Offer::where('prestataire_id', $user->id)
                ->whereIn('status', ['pending', 'accepted'])
                ->with('task')
                ->latest()
                ->take(5)
                ->get();
            
            if ($activeOffers->isEmpty()) {
                $message = "📋 <b>Mes Missions</b>\n\n";
                $message .= "Vous n'avez pas de missions actives pour le moment.\n\n";
                $message .= "🔍 Cherchez de nouvelles missions :\n";
                $message .= "👉 https://prochepro.fr/tasks/browse";
                
                $this->sendMessage($chatId, $message);
                return;
            }
            
            $message = "📋 <b>Vos missions actives (" . $activeOffers->count() . ")</b>\n\n";
            
            foreach ($activeOffers as $index => $offer) {
                $task = $offer->task;
                $emoji = ($index + 1) . "⃣";
                
                $statusEmoji = $offer->status === 'accepted' ? '✅' : '⏳';
                $statusText = $offer->status === 'accepted' ? 'Acceptée' : 'En attente';
                
                $message .= "{$emoji} <b>" . substr($task->title, 0, 40) . "</b>\n";
                $message .= "   {$statusEmoji} {$statusText}";
                
                if ($task->district) {
                    $message .= " • 📍 {$task->district}";
                }
                
                if ($offer->amount) {
                    $message .= " • 💰 {$offer->amount}€";
                }
                
                $message .= "\n";
                
                // Add inline button
                if ($index < 3) { // Only first 3 to avoid too many buttons
                    $message .= "\n";
                }
            }
            
            $message .= "\n👉 <a href='https://prochepro.fr/tasks/my'>Voir toutes mes missions</a>";
            
            // Send with inline buttons for quick actions
            $this->sendMessageWithInlineButtons($chatId, $message, $activeOffers);
            
        } catch (\Exception $e) {
            Log::error('Error fetching user tasks: ' . $e->getMessage());
            $this->sendMessage($chatId, "❌ Erreur lors de la récupération des missions.");
        }
    }
    
    /**
     * Handle Find Tasks button
     */
    protected function handleFindTasks(string $chatId)
    {
        $message = "🔍 <b>Trouver une Mission</b>\n\n";
        $message .= "Découvrez les nouvelles missions près de chez vous :\n";
        $message .= "👉 https://prochepro.fr/tasks/browse\n\n";
        $message .= "Filtrez par :\n";
        $message .= "• Catégorie\n";
        $message .= "• Localisation\n";
        $message .= "• Budget";
        
        $this->sendMessage($chatId, $message);
    }
    
    /**
     * Handle Profile button
     */
    protected function handleProfile(string $chatId)
    {
        $message = "👤 <b>Mon Profil</b>\n\n";
        $message .= "Gérez votre profil ProchePro :\n";
        $message .= "👉 https://prochepro.fr/profile\n\n";
        $message .= "Vous pouvez :\n";
        $message .= "• Modifier vos informations\n";
        $message .= "• Ajouter des compétences\n";
        $message .= "• Voir vos avis clients";
        
        $this->sendMessage($chatId, $message);
    }
    
    /**
     * Handle Support button
     */
    protected function handleSupport(string $chatId)
    {
        $message = "🆘 <b>Aide & Support</b>\n\n";
        $message .= "Besoin d'aide ? Nous sommes là !\n\n";
        $message .= "📧 Email : info@prochepro.fr\n";
        $message .= "💬 Chat : https://prochepro.fr/support\n";
        $message .= "📞 Urgence : @fophelp\n\n";
        $message .= "Temps de réponse moyen : 2-4 heures";
        
        $this->sendMessage($chatId, $message);
    }
    
    /**
     * Handle Balance command
     */
    protected function handleBalance(string $chatId)
    {
        try {
            $settings = MessengerSettings::where('telegram_chat_id', $chatId)->first();
            
            if (!$settings || !$settings->user_id) {
                $this->sendMessage($chatId, "❌ Compte non connecté. Utilisez /start pour connecter votre compte.");
                return;
            }
            
            $user = User::find($settings->user_id);
            
            if (!$user) {
                $this->sendMessage($chatId, "❌ Utilisateur introuvable.");
                return;
            }
            
            // Ensure credits is a number, not Collection
            $credits = is_numeric($user->credits) ? (int)$user->credits : 0;
            $subscription = $user->subscription_type ?? 'free';
            
            $message = "💰 <b>Votre Solde</b>\n\n";
            $message .= "👤 {$user->name}\n\n";
            $message .= "💳 <b>Crédits disponibles:</b> {$credits}\n";
            
            // Subscription info
            $subscriptionLabel = match($subscription) {
                'premium' => '⭐ Premium',
                'business' => '🏆 Business',
                'unlimited' => '♾️ Illimité',
                default => '🆓 Gratuit'
            };
            
            $message .= "📦 <b>Abonnement:</b> {$subscriptionLabel}\n\n";
            
            if ($credits < 5) {
                $message .= "⚠️ Vos crédits sont bas!\n";
                $message .= "👉 <a href='https://prochepro.fr/pricing'>Recharger mon compte</a>";
            } else {
                $message .= "✅ Vous êtes prêt à soumissionner sur les missions!";
            }
            
            $this->sendMessage($chatId, $message);
            
        } catch (\Exception $e) {
            Log::error('Error fetching user balance: ' . $e->getMessage());
            $this->sendMessage($chatId, "❌ Erreur lors de la récupération du solde.");
        }
    }
    
    /**
     * Handle Stats command
     */
    protected function handleStats(string $chatId)
    {
        try {
            $settings = MessengerSettings::where('telegram_chat_id', $chatId)->first();
            
            if (!$settings || !$settings->user_id) {
                $this->sendMessage($chatId, "❌ Compte non connecté. Utilisez /start pour connecter votre compte.");
                return;
            }
            
            $user = User::find($settings->user_id);
            
            // Get user statistics
            $totalOffers = Offer::where('prestataire_id', $user->id)->count();
            $acceptedOffers = Offer::where('prestataire_id', $user->id)
                ->where('status', 'accepted')
                ->count();
            
            // Count completed tasks where this user was the accepted prestataire
            $completedTasks = Task::whereHas('offers', function($query) use ($user) {
                $query->where('prestataire_id', $user->id)
                      ->where('status', 'accepted');
            })->where('status', 'completed')->count();
            
            // Calculate success rate
            $successRate = $totalOffers > 0 ? round(($acceptedOffers / $totalOffers) * 100) : 0;
            
            // Get average rating
            $avgRating = $user->average_rating ?? 0;
            $totalReviews = $user->reviews_count ?? 0;
            
            $message = "📊 <b>Vos Statistiques</b>\n\n";
            $message .= "👤 {$user->name}\n\n";
            
            // Stats
            $message .= "📈 <b>Performance:</b>\n";
            $message .= "   🎯 Offres envoyées: {$totalOffers}\n";
            $message .= "   ✅ Offres acceptées: {$acceptedOffers}\n";
            $message .= "   ✨ Missions terminées: {$completedTasks}\n";
            $message .= "   📊 Taux de réussite: {$successRate}%\n\n";
            
            // Rating
            $stars = str_repeat('⭐', min(5, (int)round($avgRating)));
            $message .= "⭐ <b>Évaluation:</b>\n";
            $message .= "   {$stars} {$avgRating}/5\n";
            $message .= "   📝 Basé sur {$totalReviews} avis\n\n";
            
            if ($avgRating >= 4.5) {
                $message .= "🏆 Excellent travail! Continuez ainsi!";
            } elseif ($avgRating >= 3.5) {
                $message .= "👍 Bon travail! Améliorez votre service pour plus d'étoiles!";
            } else {
                $message .= "💪 Continuez à vous améliorer!";
            }
            
            $this->sendMessage($chatId, $message);
            
        } catch (\Exception $e) {
            Log::error('Error fetching user stats: ' . $e->getMessage());
            $this->sendMessage($chatId, "❌ Erreur lors de la récupération des statistiques.");
        }
    }
    
    /**
     * Handle Messages command
     */
    protected function handleMessages(string $chatId)
    {
        try {
            $settings = MessengerSettings::where('telegram_chat_id', $chatId)->first();
            
            if (!$settings || !$settings->user_id) {
                $this->sendMessage($chatId, "❌ Compte non connecté. Utilisez /start pour connecter votre compte.");
                return;
            }
            
            $user = User::find($settings->user_id);
            
            // Get recent messages from tasks where user is involved
            $userTasks = Task::where('client_id', $user->id)
                ->orWhereHas('offers', function($query) use ($user) {
                    $query->where('prestataire_id', $user->id)
                          ->where('status', 'accepted');
                })
                ->pluck('id');
            
            // Check if user has any tasks
            if ($userTasks->isEmpty()) {
                $message = "💬 <b>Messages</b>\n\n";
                $message .= "Aucun message récent.\n\n";
                $message .= "👉 <a href='https://prochepro.fr/messages'>Voir tous les messages</a>";
                
                $this->sendMessage($chatId, $message);
                return;
            }
            
            $recentMessages = \App\Models\Message::whereIn('task_id', $userTasks)
                ->where('sender_id', '!=', $user->id)
                ->with(['task', 'sender'])
                ->latest()
                ->take(5)
                ->get();
            
            if ($recentMessages->isEmpty()) {
                $message = "💬 <b>Messages</b>\n\n";
                $message .= "Aucun message récent.\n\n";
                $message .= "👉 <a href='https://prochepro.fr/messages'>Voir tous les messages</a>";
                
                $this->sendMessage($chatId, $message);
                return;
            }
            
            $message = "💬 <b>Messages récents ({$recentMessages->count()})</b>\n\n";
            
            foreach ($recentMessages as $index => $msg) {
                $emoji = ($index + 1) . "⃣";
                $task = $msg->task;
                $sender = $msg->sender;
                
                // Skip if task or sender not found
                if (!$task || !$sender) {
                    continue;
                }
                
                // Clean UTF-8 encoding to avoid json_encode errors
                $cleanBody = mb_convert_encoding($msg->body ?? '', 'UTF-8', 'UTF-8');
                $cleanTitle = mb_convert_encoding($task->title ?? '', 'UTF-8', 'UTF-8');
                $cleanName = mb_convert_encoding($sender->name ?? '', 'UTF-8', 'UTF-8');
                
                $preview = substr($cleanBody, 0, 50);
                if (strlen($cleanBody) > 50) {
                    $preview .= '...';
                }
                
                $message .= "{$emoji} <b>" . substr($cleanTitle, 0, 30) . "</b>\n";
                $message .= "   De: {$cleanName}\n";
                $message .= "   💬 {$preview}\n\n";
            }
            
            $message .= "👉 <a href='https://prochepro.fr/messages'>Répondre à vos messages</a>";
            
            $this->sendMessage($chatId, $message);
            
        } catch (\Exception $e) {
            Log::error('Error fetching messages: ' . $e->getMessage());
            $this->sendMessage($chatId, "❌ Erreur lors de la récupération des messages.");
        }
    }
    
    /**
     * Handle Offers command
     */
    protected function handleOffers(string $chatId)
    {
        try {
            $settings = MessengerSettings::where('telegram_chat_id', $chatId)->first();
            
            if (!$settings || !$settings->user_id) {
                $this->sendMessage($chatId, "❌ Compte non connecté. Utilisez /start pour connecter votre compte.");
                return;
            }
            
            $user = User::find($settings->user_id);
            
            // Get pending offers
            $pendingOffers = Offer::where('prestataire_id', $user->id)
                ->where('status', 'pending')
                ->with('task')
                ->latest()
                ->take(5)
                ->get();
            
            $acceptedOffers = Offer::where('prestataire_id', $user->id)
                ->where('status', 'accepted')
                ->with('task')
                ->latest()
                ->take(3)
                ->get();
            
            $message = "🎯 <b>Mes Offres</b>\n\n";
            
            // Pending offers
            if ($pendingOffers->isNotEmpty()) {
                $message .= "⏳ <b>En attente ({$pendingOffers->count()}):</b>\n";
                foreach ($pendingOffers as $index => $offer) {
                    $task = $offer->task;
                    $message .= ($index + 1) . ". " . substr($task->title, 0, 30) . " - {$offer->amount}€\n";
                }
                $message .= "\n";
            }
            
            // Accepted offers
            if ($acceptedOffers->isNotEmpty()) {
                $message .= "✅ <b>Acceptées ({$acceptedOffers->count()}):</b>\n";
                foreach ($acceptedOffers as $index => $offer) {
                    $task = $offer->task;
                    $message .= ($index + 1) . ". " . substr($task->title, 0, 30) . " - {$offer->amount}€\n";
                }
                $message .= "\n";
            }
            
            if ($pendingOffers->isEmpty() && $acceptedOffers->isEmpty()) {
                $message .= "Aucune offre active.\n\n";
                $message .= "🔍 Cherchez de nouvelles missions :\n";
                $message .= "👉 https://prochepro.fr/tasks/browse";
            } else {
                $message .= "👉 <a href='https://prochepro.fr/dashboard'>Gérer mes offres</a>";
            }
            
            $this->sendMessage($chatId, $message);
            
        } catch (\Exception $e) {
            Log::error('Error fetching offers: ' . $e->getMessage());
            $this->sendMessage($chatId, "❌ Erreur lors de la récupération des offres.");
        }
    }
    
    /**
     * Send a message to a Telegram chat
     */
    protected function sendMessage(string $chatId, string $text, bool $disablePreview = true)
    {
        $botToken = config('services.telegram.bot_token');
        
        try {
            $response = Http::post("https://api.telegram.org/bot{$botToken}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $text,
                'parse_mode' => 'HTML',
                'disable_web_page_preview' => $disablePreview,
            ]);
            
            if (!$response->successful()) {
                Log::error("Failed to send Telegram message: " . $response->body());
            }
        } catch (\Exception $e) {
            Log::error("Error sending Telegram message: " . $e->getMessage());
        }
    }
    
    /**
     * Send a message with keyboard to a Telegram chat
     */
    protected function sendMessageWithKeyboard(string $chatId, string $text)
    {
        $botToken = config('services.telegram.bot_token');
        
        // Create keyboard with buttons
        $keyboard = [
            'keyboard' => [
                [
                    ['text' => '📋 Mes missions'],
                    ['text' => '🔍 Trouver une mission'],
                ],
                [
                    ['text' => '💬 Messages'],
                    ['text' => '🎯 Mes Offres'],
                ],
                [
                    ['text' => '💰 Mon Solde'],
                    ['text' => '📊 Statistiques'],
                ],
                [
                    ['text' => '👤 Mon Profil'],
                    ['text' => '⚙️ Paramètres'],
                ],
                [
                    ['text' => '🆘 Aide / Support'],
                ],
            ],
            'resize_keyboard' => true,
            'one_time_keyboard' => false,
        ];
        
        try {
            $response = Http::post("https://api.telegram.org/bot{$botToken}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $text,
                'parse_mode' => 'HTML',
                'reply_markup' => json_encode($keyboard),
            ]);
            
            if (!$response->successful()) {
                Log::error("Failed to send Telegram message with keyboard: " . $response->body());
            }
        } catch (\Exception $e) {
            Log::error("Error sending Telegram message with keyboard: " . $e->getMessage());
        }
    }
    
    /**
     * Send message with inline buttons for tasks
     */
    protected function sendMessageWithInlineButtons(string $chatId, string $text, $offers)
    {
        $botToken = config('services.telegram.bot_token');
        
        // Create inline keyboard with buttons for first 3 tasks
        $buttons = [];
        foreach ($offers->take(3) as $index => $offer) {
            $task = $offer->task;
            $taskId = $task->id;
            $offerId = $offer->id;
            
            $row = [];
            
            if ($offer->status === 'pending') {
                // Show "View" button for pending offers
                $row[] = [
                    'text' => '👁 Voir #' . ($index + 1),
                    'url' => "https://prochepro.fr/tasks/{$taskId}"
                ];
            } else {
                // Show "Message client" button for accepted offers
                $row[] = [
                    'text' => '💬 Message #' . ($index + 1),
                    'url' => "https://prochepro.fr/messages?task={$taskId}"
                ];
            }
            
            $buttons[] = $row;
        }
        
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
            
            if (!$response->successful()) {
                Log::error("Failed to send Telegram message with inline buttons: " . $response->body());
            }
        } catch (\Exception $e) {
            Log::error("Error sending Telegram message with inline buttons: " . $e->getMessage());
        }
    }
    
    /**
     * Handle callback query (inline button press)
     */
    protected function handleCallbackQuery(array $callbackQuery)
    {
        $chatId = $callbackQuery['message']['chat']['id'];
        $callbackData = $callbackQuery['data'] ?? '';
        $callbackId = $callbackQuery['id'];
        
        // Parse callback data format: action_id (e.g., "accept_123", "settings_new_tasks")
        $parts = explode('_', $callbackData, 2);
        $action = $parts[0] ?? '';
        $param = $parts[1] ?? '';
        
        try {
            switch ($action) {
                case 'settings':
                    $this->handleSettingsCallback($chatId, $param);
                    break;
                    
                default:
                    $this->answerCallbackQuery($callbackId, "Action non reconnue");
                    return;
            }
            
            $this->answerCallbackQuery($callbackId, "✓");
            
        } catch (\Exception $e) {
            Log::error('Error handling callback query: ' . $e->getMessage());
            $this->answerCallbackQuery($callbackId, "Erreur");
        }
    }
    
    /**
     * Answer callback query (acknowledge button press)
     */
    protected function answerCallbackQuery(string $callbackId, string $text = '')
    {
        $botToken = config('services.telegram.bot_token');
        
        try {
            Http::post("https://api.telegram.org/bot{$botToken}/answerCallbackQuery", [
                'callback_query_id' => $callbackId,
                'text' => $text,
            ]);
        } catch (\Exception $e) {
            Log::error("Error answering callback query: " . $e->getMessage());
        }
    }
    
    /**
     * Handle /settings command
     */
    protected function handleSettings(string $chatId)
    {
        try {
            // Find user by chat_id
            $settings = MessengerSettings::where('telegram_chat_id', $chatId)->first();
            
            if (!$settings || !$settings->user_id) {
                $this->sendMessage($chatId, "❌ Compte non connecté. Utilisez /start pour connecter votre compte.");
                return;
            }
            
            $notificationTypes = $settings->notification_types ?? [];
            
            $message = "🔔 <b>Paramètres de notifications</b>\n\n";
            $message .= "Choisissez les notifications que vous souhaitez recevoir :\n\n";
            
            $newTasksEnabled = in_array('new_tasks', $notificationTypes) || empty($notificationTypes);
            $messagesEnabled = in_array('messages', $notificationTypes) || empty($notificationTypes);
            $offersEnabled = in_array('offers', $notificationTypes) || empty($notificationTypes);
            $systemEnabled = in_array('system', $notificationTypes) || empty($notificationTypes);
            
            $message .= ($newTasksEnabled ? "✅" : "❌") . " Nouvelles missions dans mon secteur\n";
            $message .= ($messagesEnabled ? "✅" : "❌") . " Messages des clients\n";
            $message .= ($offersEnabled ? "✅" : "❌") . " Réponses à mes offres\n";
            $message .= ($systemEnabled ? "✅" : "❌") . " Notifications système\n";
            
            // Create inline keyboard for settings
            $inlineKeyboard = [
                'inline_keyboard' => [
                    [
                        [
                            'text' => ($newTasksEnabled ? '✅' : '❌') . ' Nouvelles missions',
                            'callback_data' => 'settings_toggle_new_tasks'
                        ]
                    ],
                    [
                        [
                            'text' => ($messagesEnabled ? '✅' : '❌') . ' Messages clients',
                            'callback_data' => 'settings_toggle_messages'
                        ]
                    ],
                    [
                        [
                            'text' => ($offersEnabled ? '✅' : '❌') . ' Réponses offres',
                            'callback_data' => 'settings_toggle_offers'
                        ]
                    ],
                    [
                        [
                            'text' => ($systemEnabled ? '✅' : '❌') . ' Système',
                            'callback_data' => 'settings_toggle_system'
                        ]
                    ],
                ]
            ];
            
            $botToken = config('services.telegram.bot_token');
            
            Http::post("https://api.telegram.org/bot{$botToken}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $message,
                'parse_mode' => 'HTML',
                'reply_markup' => json_encode($inlineKeyboard),
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error handling settings: ' . $e->getMessage());
            $this->sendMessage($chatId, "❌ Erreur lors de l'affichage des paramètres.");
        }
    }
    
    /**
     * Handle settings callback (toggle notification type)
     */
    protected function handleSettingsCallback(string $chatId, string $param)
    {
        try {
            // Find user settings
            $settings = MessengerSettings::where('telegram_chat_id', $chatId)->first();
            
            if (!$settings) {
                return;
            }
            
            // Parse param: "toggle_new_tasks", "toggle_messages", etc.
            if (strpos($param, 'toggle_') === 0) {
                $notificationType = substr($param, 7); // Remove "toggle_"
                
                $notificationTypes = $settings->notification_types ?? [];
                
                // Toggle the notification type
                if (in_array($notificationType, $notificationTypes)) {
                    // Remove it
                    $notificationTypes = array_diff($notificationTypes, [$notificationType]);
                } else {
                    // Add it
                    $notificationTypes[] = $notificationType;
                }
                
                $settings->notification_types = array_values($notificationTypes);
                $settings->save();
                
                // Refresh settings display
                $this->handleSettings($chatId);
            }
            
        } catch (\Exception $e) {
            Log::error('Error handling settings callback: ' . $e->getMessage());
        }
    }
}
