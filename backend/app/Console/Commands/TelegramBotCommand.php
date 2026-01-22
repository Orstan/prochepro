<?php

namespace App\Console\Commands;

use App\Models\MessengerSettings;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramBotCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'telegram:bot {--once : Run the bot once and exit}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run the Telegram bot to process messages';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $botToken = config('services.telegram.bot_token');
        $runOnce = $this->option('once');
        
        if (!$botToken) {
            $this->error('Telegram bot token is not configured.');
            return 1;
        }
        
        $this->info('Starting Telegram bot...');
        
        $offset = 0;
        
        do {
            try {
                // Get updates from Telegram
                $response = Http::get("https://api.telegram.org/bot{$botToken}/getUpdates", [
                    'offset' => $offset,
                    'timeout' => 30,
                ]);
                
                if ($response->successful()) {
                    $updates = $response->json();
                    
                    if (isset($updates['result']) && is_array($updates['result'])) {
                        foreach ($updates['result'] as $update) {
                            // Process the update
                            $this->processUpdate($update);
                            
                            // Update offset to acknowledge this update
                            $offset = $update['update_id'] + 1;
                        }
                    }
                } else {
                    $this->error('Failed to get updates from Telegram API: ' . $response->body());
                    sleep(5);
                }
            } catch (\Exception $e) {
                $this->error('Error processing Telegram updates: ' . $e->getMessage());
                Log::error('Telegram bot error: ' . $e->getMessage());
                sleep(5);
            }
            
            // Sleep for a short time to avoid hitting rate limits
            if (!$runOnce) {
                sleep(1);
            }
            
        } while (!$runOnce);
        
        $this->info('Telegram bot stopped.');
        
        return 0;
    }
    
    /**
     * Process a Telegram update
     */
    protected function processUpdate(array $update)
    {
        // Check if this is a message
        if (isset($update['message'])) {
            $message = $update['message'];
            $chatId = $message['chat']['id'];
            $text = $message['text'] ?? '';
            
            // Check if this is a /start command with a parameter
            if (strpos($text, '/start') === 0) {
                $parts = explode(' ', $text, 2);
                $parameter = $parts[1] ?? '';
                
                if (strpos($parameter, 'connect_') === 0) {
                    $userId = substr($parameter, 8);
                    $this->handleConnect($chatId, $userId);
                } else {
                    $this->sendWelcomeMessage($chatId);
                }
            }
            // Handle other commands
            elseif ($text === '/help') {
                $this->sendHelpMessage($chatId);
            }
            // Handle keyboard buttons
            elseif ($text === '📋 Mes missions') {
                $this->handleMyTasks($chatId);
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
                
                $this->info("Connected Telegram chat {$chatId} to user {$userId}");
            } else {
                $this->sendMessage($chatId, "❌ Erreur: Impossible de trouver vos paramètres de messagerie. Veuillez réessayer la connexion depuis le site ProchePro.");
                $this->error("Could not find messenger settings for user {$userId}");
            }
        } catch (\Exception $e) {
            $this->sendMessage($chatId, "❌ Une erreur est survenue lors de la connexion. Veuillez réessayer plus tard.");
            $this->error("Error connecting Telegram: " . $e->getMessage());
            Log::error("Telegram connection error: " . $e->getMessage());
        }
    }
    
    /**
     * Send a welcome message
     */
    protected function sendWelcomeMessage(string $chatId)
    {
        $message = "👋 Bienvenue sur le bot ProchePro!\n\n";
        $message .= "Ce bot vous permet de recevoir des notifications de ProchePro directement sur Telegram.\n\n";
        $message .= "Pour connecter votre compte, utilisez le bouton 'Connecter Telegram' dans les paramètres de notification sur le site ProchePro.";
        
        $this->sendMessage($chatId, $message);
    }
    
    /**
     * Send a help message
     */
    protected function sendHelpMessage(string $chatId)
    {
        $message = "🔍 Aide du bot ProchePro\n\n";
        $message .= "Commandes disponibles:\n";
        $message .= "/start - Démarrer le bot\n";
        $message .= "/help - Afficher ce message d'aide\n\n";
        $message .= "Pour connecter votre compte, utilisez le bouton 'Connecter Telegram' dans les paramètres de notification sur le site ProchePro.";
        
        $this->sendMessage($chatId, $message);
    }
    
    /**
     * Handle My Tasks button
     */
    protected function handleMyTasks(string $chatId)
    {
        $message = "📋 <b>Mes Missions</b>\n\n";
        $message .= "Consultez toutes vos missions en cours :\n";
        $message .= "👉 https://prochepro.fr/tasks/my\n\n";
        $message .= "Vous y trouverez :\n";
        $message .= "• Missions acceptées\n";
        $message .= "• Missions en attente\n";
        $message .= "• Historique complet";
        
        $this->sendMessage($chatId, $message);
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
        $message .= "📞 Urgence : Contactez-nous via le site\n\n";
        $message .= "Temps de réponse moyen : 2-4 heures";
        
        $this->sendMessage($chatId, $message);
    }
    
    /**
     * Send a message to a Telegram chat
     */
    protected function sendMessage(string $chatId, string $text)
    {
        $botToken = config('services.telegram.bot_token');
        
        try {
            $response = Http::post("https://api.telegram.org/bot{$botToken}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $text,
                'parse_mode' => 'HTML',
            ]);
            
            if (!$response->successful()) {
                $this->error("Failed to send message to Telegram: " . $response->body());
                Log::error("Telegram send message error: " . $response->body());
            }
        } catch (\Exception $e) {
            $this->error("Error sending message to Telegram: " . $e->getMessage());
            Log::error("Telegram send message error: " . $e->getMessage());
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
                    ['text' => '👤 Mon Profil'],
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
                $this->error("Failed to send message to Telegram: " . $response->body());
                Log::error("Telegram send message error: " . $response->body());
            }
        } catch (\Exception $e) {
            $this->error("Error sending message to Telegram: " . $e->getMessage());
            Log::error("Telegram send message error: " . $e->getMessage());
        }
    }
}
