<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SetupTelegramBot extends Command
{
    protected $signature = 'telegram:setup';
    protected $description = 'Automatically setup Telegram bot (commands, description, webhook)';

    public function handle()
    {
        $botToken = config('services.telegram.bot_token');
        
        if (!$botToken) {
            $this->error('❌ TELEGRAM_BOT_TOKEN not configured in .env');
            return 1;
        }
        
        $this->info('🚀 Setting up Telegram bot...');
        $this->newLine();
        
        // 1. Set bot commands
        $this->info('📋 Setting bot commands...');
        $this->setupCommands($botToken);
        
        // 2. Set webhook
        $this->info('🔗 Setting webhook...');
        $this->setupWebhook($botToken);
        
        // 3. Get bot info
        $this->info('ℹ️  Bot information:');
        $this->getBotInfo($botToken);
        
        $this->newLine();
        $this->info('✅ Telegram bot setup completed!');
        $this->newLine();
        $this->info('📝 Next steps:');
        $this->info('   1. Go to @BotFather and set bot description/about');
        $this->info('   2. Upload bot avatar (512x512 PNG)');
        $this->info('   3. Test the bot by sending /start');
        
        return 0;
    }
    
    protected function setupCommands(string $botToken)
    {
        $commands = [
            ['command' => 'start', 'description' => 'Démarrer le bot'],
            ['command' => 'help', 'description' => 'Aide et commandes disponibles'],
            ['command' => 'tasks', 'description' => 'Voir mes missions actives'],
            ['command' => 'balance', 'description' => 'Mon solde et crédits'],
            ['command' => 'stats', 'description' => 'Mes statistiques'],
            ['command' => 'messages', 'description' => 'Messages récents'],
            ['command' => 'offers', 'description' => 'Mes offres actives'],
            ['command' => 'settings', 'description' => 'Paramètres de notifications'],
        ];
        
        try {
            $response = Http::post("https://api.telegram.org/bot{$botToken}/setMyCommands", [
                'commands' => $commands,
            ]);
            
            if ($response->successful()) {
                $this->info('   ✅ Bot commands set successfully');
                foreach ($commands as $cmd) {
                    $this->line("      /{$cmd['command']} - {$cmd['description']}");
                }
            } else {
                $this->error('   ❌ Failed to set commands: ' . $response->body());
            }
        } catch (\Exception $e) {
            $this->error('   ❌ Error: ' . $e->getMessage());
        }
        
        $this->newLine();
    }
    
    protected function setupWebhook(string $botToken)
    {
        $webhookUrl = config('app.url') . '/api/telegram/webhook';
        
        // Replace localhost with actual domain if needed
        if (str_contains($webhookUrl, 'localhost')) {
            $webhookUrl = 'https://api.prochepro.fr/api/telegram/webhook';
        }
        
        try {
            $response = Http::post("https://api.telegram.org/bot{$botToken}/setWebhook", [
                'url' => $webhookUrl,
                'allowed_updates' => ['message', 'callback_query'],
            ]);
            
            if ($response->successful()) {
                $this->info("   ✅ Webhook set to: {$webhookUrl}");
            } else {
                $this->error('   ❌ Failed to set webhook: ' . $response->body());
            }
            
            // Get webhook info
            $infoResponse = Http::get("https://api.telegram.org/bot{$botToken}/getWebhookInfo");
            if ($infoResponse->successful()) {
                $info = $infoResponse->json()['result'] ?? [];
                $this->line("   📊 Webhook status:");
                $this->line("      URL: " . ($info['url'] ?? 'Not set'));
                $this->line("      Pending updates: " . ($info['pending_update_count'] ?? 0));
                if (isset($info['last_error_message'])) {
                    $this->warn("      Last error: " . $info['last_error_message']);
                }
            }
        } catch (\Exception $e) {
            $this->error('   ❌ Error: ' . $e->getMessage());
        }
        
        $this->newLine();
    }
    
    protected function getBotInfo(string $botToken)
    {
        try {
            $response = Http::get("https://api.telegram.org/bot{$botToken}/getMe");
            
            if ($response->successful()) {
                $bot = $response->json()['result'] ?? [];
                $this->line("   🤖 Bot name: " . ($bot['first_name'] ?? 'Unknown'));
                $this->line("   🔗 Username: @" . ($bot['username'] ?? 'Unknown'));
                $this->line("   🆔 Bot ID: " . ($bot['id'] ?? 'Unknown'));
                
                $this->newLine();
                $this->info('📱 Connect link: https://t.me/' . ($bot['username'] ?? ''));
            }
        } catch (\Exception $e) {
            $this->error('   ❌ Error getting bot info: ' . $e->getMessage());
        }
    }
}
