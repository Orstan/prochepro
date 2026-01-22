<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\WebPushService;
use Illuminate\Console\Command;

class TestPushNotification extends Command
{
    protected $signature = 'push:test {user_id : ID користувача}';
    protected $description = 'Відправити тестове пуш-повідомлення користувачу';

    public function handle(WebPushService $webPushService): int
    {
        $userId = $this->argument('user_id');
        
        $user = User::find($userId);
        
        if (!$user) {
            $this->error("Користувача з ID {$userId} не знайдено");
            return 1;
        }
        
        $this->info("Відправка тестового пуш-повідомлення користувачу: {$user->name} (#{$user->id})");
        
        try {
            $webPushService->sendToUser(
                $user,
                '🧪 Тестове повідомлення',
                'Це тестове push-повідомлення від ProchePro. Якщо ви його бачите - все працює!',
                '/',
                'test-notification-' . time()
            );
            
            $this->info("✅ Пуш-повідомлення відправлено!");
            $this->info("Перевірте логи: tail -f storage/logs/laravel.log");
            
            return 0;
        } catch (\Exception $e) {
            $this->error("❌ Помилка: " . $e->getMessage());
            return 1;
        }
    }
}
