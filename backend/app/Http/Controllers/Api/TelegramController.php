<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MessengerSettings;
use App\Models\User;
use App\Models\Task;
use App\Models\Offer;
use App\Models\Message;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class TelegramController extends Controller
{
    /**
     * Handle Telegram webhook
     */
    public function webhook(Request $request): JsonResponse
    {
        try {
            $update = $request->all();
            
            Log::info('Telegram webhook received', ['update' => $update]);
            
            if (!isset($update['message'])) {
                return response()->json(['ok' => true]);
            }
            
            $message = $update['message'];
            $chatId = $message['chat']['id'];
            $text = $message['text'] ?? '';
            
            // Find user by chat_id
            $settings = MessengerSettings::where('telegram_chat_id', $chatId)->first();
            
            if (!$settings) {
                $this->sendMessage($chatId, "⚠️ Votre compte Telegram n'est pas lié. Veuillez vous connecter sur prochepro.fr et lier votre compte Telegram.");
                return response()->json(['ok' => true]);
            }
            
            $user = User::find($settings->user_id);
            
            if (!$user) {
                $this->sendMessage($chatId, "❌ Utilisateur introuvable.");
                return response()->json(['ok' => true]);
            }
            
            // Handle commands
            if (str_starts_with($text, '/')) {
                $this->handleCommand($chatId, $text, $user);
            }
            
            return response()->json(['ok' => true]);
            
        } catch (\Exception $e) {
            Log::error('Telegram webhook error: ' . $e->getMessage());
            return response()->json(['ok' => true]);
        }
    }
    
    /**
     * Handle bot commands
     */
    protected function handleCommand(string $chatId, string $command, User $user): void
    {
        $cmd = strtolower(trim(explode(' ', $command)[0]));
        
        switch ($cmd) {
            case '/start':
                $this->commandStart($chatId, $user);
                break;
            case '/stats':
                $this->commandStats($chatId, $user);
                break;
            case '/profile':
                $this->commandProfile($chatId, $user);
                break;
            case '/tasks':
                $this->commandTasks($chatId, $user);
                break;
            case '/help':
                $this->commandHelp($chatId);
                break;
            default:
                $this->sendMessage($chatId, "❓ Commande inconnue. Tapez /help pour voir les commandes disponibles.");
        }
    }
    
    /**
     * /start command
     */
    protected function commandStart(string $chatId, User $user): void
    {
        $message = "👋 Bienvenue sur ProchePro, {$user->name}!\n\n";
        $message .= "Votre compte Telegram est lié avec succès.\n\n";
        $message .= "Commandes disponibles:\n";
        $message .= "/stats - Vos statistiques\n";
        $message .= "/profile - Votre profil\n";
        $message .= "/tasks - Vos tâches actives\n";
        $message .= "/help - Aide\n\n";
        $message .= "🔗 https://prochepro.fr";
        
        $this->sendMessage($chatId, $message);
    }
    
    /**
     * /stats command - Show user statistics
     */
    protected function commandStats(string $chatId, User $user): void
    {
        // Tasks statistics
        $openTasks = Task::where('client_id', $user->id)->where('status', 'open')->count();
        $inProgressTasks = Task::where('client_id', $user->id)->where('status', 'in_progress')->count();
        $completedTasks = Task::where('client_id', $user->id)->where('status', 'completed')->count();
        
        // Offers statistics
        $pendingOffers = Offer::where('prestataire_id', $user->id)->where('status', 'pending')->count();
        $acceptedOffers = Offer::where('prestataire_id', $user->id)->where('status', 'accepted')->count();
        
        // Messages
        $unreadMessages = $this->getUnreadMessagesCount($user->id);
        
        // Revenue (if prestataire)
        $totalRevenue = Payment::where('prestataire_id', $user->id)
            ->where('status', 'completed')
            ->sum('provider_amount');
        
        $todayRevenue = Payment::where('prestataire_id', $user->id)
            ->where('status', 'completed')
            ->whereDate('created_at', today())
            ->sum('provider_amount');
        
        $message = "📊 <b>Vos Statistiques</b>\n\n";
        
        // Tasks section
        $message .= "📋 <b>Tâches:</b>\n";
        $message .= "  • Ouvertes: {$openTasks}\n";
        $message .= "  • En cours: {$inProgressTasks}\n";
        $message .= "  • Terminées: {$completedTasks}\n\n";
        
        // Offers section (for prestataire)
        if ($user->role === 'prestataire' || $user->role === 'both') {
            $message .= "💼 <b>Offres:</b>\n";
            $message .= "  • En attente: {$pendingOffers}\n";
            $message .= "  • Acceptées: {$acceptedOffers}\n\n";
            
            $message .= "💰 <b>Revenus:</b>\n";
            $message .= "  • Aujourd'hui: " . number_format($todayRevenue, 2) . " €\n";
            $message .= "  • Total: " . number_format($totalRevenue, 2) . " €\n\n";
        }
        
        // Messages
        $message .= "✉️ <b>Messages:</b>\n";
        $message .= "  • Non lus: {$unreadMessages}\n\n";
        
        // Gamification
        if ($user->level) {
            $message .= "🎯 <b>Niveau:</b> {$user->level}\n";
            $message .= "⭐ <b>XP:</b> {$user->xp}\n";
        }
        
        if ($user->average_rating) {
            $stars = str_repeat('⭐', (int)round($user->average_rating));
            $message .= "⭐ <b>Note:</b> {$stars} (" . number_format($user->average_rating, 1) . "/5)\n";
        }
        
        $message .= "\n🔗 <a href='https://prochepro.fr/dashboard'>Voir plus</a>";
        
        $this->sendMessage($chatId, $message, ['parse_mode' => 'HTML']);
    }
    
    /**
     * /profile command - Show user profile
     */
    protected function commandProfile(string $chatId, User $user): void
    {
        $message = "👤 <b>Votre Profil</b>\n\n";
        $message .= "📛 <b>Nom:</b> {$user->name}\n";
        $message .= "📧 <b>Email:</b> {$user->email}\n";
        
        if ($user->phone) {
            $message .= "📱 <b>Téléphone:</b> {$user->phone}\n";
        }
        
        if ($user->city) {
            $message .= "📍 <b>Ville:</b> {$user->city}\n";
        }
        
        $message .= "👔 <b>Rôle:</b> " . ucfirst($user->role ?? 'client') . "\n\n";
        
        // Service categories (for prestataire)
        if ($user->service_categories && ($user->role === 'prestataire' || $user->role === 'both')) {
            $categories = is_array($user->service_categories) 
                ? $user->service_categories 
                : json_decode($user->service_categories, true);
            
            if (!empty($categories)) {
                $message .= "🔧 <b>Services:</b>\n";
                foreach ($categories as $category) {
                    $message .= "  • " . ucfirst($category) . "\n";
                }
                $message .= "\n";
            }
        }
        
        // Verification status
        if ($user->is_verified) {
            $message .= "✅ <b>Compte vérifié</b>\n\n";
        }
        
        // Stats
        if ($user->total_tasks_completed > 0) {
            $message .= "📊 <b>Tâches terminées:</b> {$user->total_tasks_completed}\n";
        }
        
        if ($user->total_reviews_received > 0) {
            $message .= "⭐ <b>Avis reçus:</b> {$user->total_reviews_received}\n";
        }
        
        if ($user->average_rating) {
            $message .= "⭐ <b>Note moyenne:</b> " . number_format($user->average_rating, 1) . "/5\n";
        }
        
        $message .= "\n🔗 <a href='https://prochepro.fr/profile/{$user->id}'>Voir profil complet</a>";
        
        $this->sendMessage($chatId, $message, ['parse_mode' => 'HTML']);
    }
    
    /**
     * /tasks command - Show active tasks
     */
    protected function commandTasks(string $chatId, User $user): void
    {
        // Get user's open and in-progress tasks as client
        $myTasks = Task::where('client_id', $user->id)
            ->whereIn('status', ['open', 'in_progress'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
        
        // Get tasks where user is prestataire (via accepted offer)
        $prestataireTaskIds = Offer::where('prestataire_id', $user->id)
            ->where('status', 'accepted')
            ->pluck('task_id');
        
        $prestataireTasksQuery = Task::whereIn('id', $prestataireTaskIds)
            ->whereIn('status', ['in_progress', 'pending_completion'])
            ->orderBy('created_at', 'desc')
            ->limit(5);
        
        $prestataireTasks = $prestataireTasksQuery->get();
        
        $message = "📋 <b>Vos Tâches Actives</b>\n\n";
        
        // My tasks as client
        if ($myTasks->isNotEmpty()) {
            $message .= "👤 <b>Vos demandes:</b>\n\n";
            
            foreach ($myTasks as $task) {
                $statusEmoji = $task->status === 'open' ? '🔵' : '🟡';
                $statusText = $task->status === 'open' ? 'Ouverte' : 'En cours';
                
                $message .= "{$statusEmoji} <b>{$task->title}</b>\n";
                $message .= "   Status: {$statusText}\n";
                
                if ($task->budget) {
                    $message .= "   Budget: {$task->budget} €\n";
                }
                
                $offersCount = $task->offers()->count();
                if ($offersCount > 0) {
                    $message .= "   💼 {$offersCount} offre(s)\n";
                }
                
                $message .= "   🔗 <a href='https://prochepro.fr/tasks/{$task->id}'>Voir</a>\n\n";
            }
        } else {
            $message .= "👤 Aucune tâche active en tant que client.\n\n";
        }
        
        // Tasks where I'm prestataire
        if ($prestataireTasks->isNotEmpty()) {
            $message .= "💼 <b>Vos missions:</b>\n\n";
            
            foreach ($prestataireTasks as $task) {
                $statusEmoji = '🟢';
                
                $message .= "{$statusEmoji} <b>{$task->title}</b>\n";
                $message .= "   Client: {$task->client->name}\n";
                
                if ($task->budget) {
                    $message .= "   Budget: {$task->budget} €\n";
                }
                
                $unreadCount = Message::where('task_id', $task->id)
                    ->where('sender_id', '!=', $user->id)
                    ->whereNull('read_at')
                    ->count();
                
                if ($unreadCount > 0) {
                    $message .= "   ✉️ {$unreadCount} message(s) non lu(s)\n";
                }
                
                $message .= "   🔗 <a href='https://prochepro.fr/tasks/{$task->id}'>Voir</a>\n\n";
            }
        } else if ($user->role === 'prestataire' || $user->role === 'both') {
            $message .= "💼 Aucune mission active en tant que prestataire.\n\n";
        }
        
        if ($myTasks->isEmpty() && $prestataireTasks->isEmpty()) {
            $message .= "Vous n'avez aucune tâche active pour le moment.\n\n";
            $message .= "🔗 <a href='https://prochepro.fr/tasks'>Parcourir les tâches</a>";
        }
        
        $this->sendMessage($chatId, $message, ['parse_mode' => 'HTML']);
    }
    
    /**
     * /help command
     */
    protected function commandHelp(string $chatId): void
    {
        $message = "ℹ️ <b>Commandes Disponibles</b>\n\n";
        $message .= "/start - Message de bienvenue\n";
        $message .= "/stats - Vos statistiques complètes\n";
        $message .= "/profile - Informations de votre profil\n";
        $message .= "/tasks - Liste de vos tâches actives\n";
        $message .= "/help - Afficher cette aide\n\n";
        $message .= "💡 Vous recevrez automatiquement des notifications pour:\n";
        $message .= "  • Nouvelles offres sur vos tâches\n";
        $message .= "  • Nouveaux messages\n";
        $message .= "  • Offres acceptées\n";
        $message .= "  • Nouveaux avis\n\n";
        $message .= "🔗 <a href='https://prochepro.fr'>Visiter ProchePro</a>";
        
        $this->sendMessage($chatId, $message, ['parse_mode' => 'HTML']);
    }
    
    /**
     * Get unread messages count for user
     */
    protected function getUnreadMessagesCount(int $userId): int
    {
        $unreadAsClient = Message::whereHas('task', function($query) use ($userId) {
            $query->where('client_id', $userId);
        })->where('sender_id', '!=', $userId)
          ->whereNull('read_at')
          ->count();
        
        $unreadAsPrestataire = Message::whereHas('task.offers', function($query) use ($userId) {
            $query->where('prestataire_id', $userId)->where('status', 'accepted');
        })->where('sender_id', '!=', $userId)
          ->whereNull('read_at')
          ->count();
        
        return $unreadAsClient + $unreadAsPrestataire;
    }
    
    /**
     * Send message to Telegram chat
     */
    protected function sendMessage(string $chatId, string $text, array $options = []): void
    {
        $botToken = config('services.telegram.bot_token');
        
        if (!$botToken) {
            Log::error('Telegram bot token not configured');
            return;
        }
        
        $payload = array_merge([
            'chat_id' => $chatId,
            'text' => $text,
        ], $options);
        
        try {
            $response = \Illuminate\Support\Facades\Http::post(
                "https://api.telegram.org/bot{$botToken}/sendMessage",
                $payload
            );
            
            if (!$response->successful()) {
                Log::error('Failed to send Telegram message', [
                    'response' => $response->body()
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Error sending Telegram message: ' . $e->getMessage());
        }
    }
}
