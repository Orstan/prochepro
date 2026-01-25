<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class DeleteTelegramWebhook extends Command
{
    protected $signature = 'telegram:delete-webhook';
    protected $description = 'Delete Telegram webhook to enable polling mode';

    public function handle()
    {
        $botToken = config('services.telegram.bot_token');
        
        if (!$botToken) {
            $this->error('❌ TELEGRAM_BOT_TOKEN not configured in .env');
            return 1;
        }
        
        $this->info('🔄 Deleting Telegram webhook...');
        
        try {
            $response = Http::post("https://api.telegram.org/bot{$botToken}/deleteWebhook");
            
            if ($response->successful()) {
                $result = $response->json();
                if ($result['ok'] ?? false) {
                    $this->info('✅ Webhook deleted successfully');
                    $this->info('📋 You can now use polling mode (telegram:bot)');
                } else {
                    $this->error('❌ Failed to delete webhook: ' . ($result['description'] ?? 'Unknown error'));
                }
            } else {
                $this->error('❌ HTTP error: ' . $response->status());
            }
            
            // Get webhook info to confirm
            $this->newLine();
            $this->info('📊 Current webhook status:');
            $infoResponse = Http::get("https://api.telegram.org/bot{$botToken}/getWebhookInfo");
            if ($infoResponse->successful()) {
                $info = $infoResponse->json()['result'] ?? [];
                $url = $info['url'] ?? '';
                if (empty($url)) {
                    $this->info('   ✅ No webhook active (polling mode enabled)');
                } else {
                    $this->warn("   ⚠️  Webhook still active: {$url}");
                }
                $this->line("   Pending updates: " . ($info['pending_update_count'] ?? 0));
            }
            
        } catch (\Exception $e) {
            $this->error('❌ Error: ' . $e->getMessage());
            return 1;
        }
        
        return 0;
    }
}
