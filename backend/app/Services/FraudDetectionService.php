<?php

namespace App\Services;

use App\Models\User;
use App\Models\Task;
use App\Models\Offer;
use App\Models\Payment;
use App\Models\CreditTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class FraudDetectionService
{
    /**
     * Перевірка підозрілої активності користувача
     */
    public function checkUserActivity(User $user): array
    {
        $suspiciousActivities = [];
        $riskScore = 0;

        // 1. Перевірка множинних акаунтів з одного IP
        $sameIpUsers = $this->checkMultipleAccountsFromSameIP($user);
        if ($sameIpUsers > 3) {
            $suspiciousActivities[] = "Множинні акаунти з одного IP ({$sameIpUsers} акаунтів)";
            $riskScore += 30;
        }

        // 2. Перевірка швидкості створення завдань
        $rapidTaskCreation = $this->checkRapidTaskCreation($user);
        if ($rapidTaskCreation) {
            $suspiciousActivities[] = "Надто швидке створення завдань";
            $riskScore += 20;
        }

        // 3. Перевірка підозрілих платежів
        $suspiciousPayments = $this->checkSuspiciousPayments($user);
        if ($suspiciousPayments > 0) {
            $suspiciousActivities[] = "Підозрілі платіжні операції ({$suspiciousPayments})";
            $riskScore += 40;
        }

        // 4. Перевірка скарг від інших користувачів
        $complaints = $this->checkUserComplaints($user);
        if ($complaints > 2) {
            $suspiciousActivities[] = "Множинні скарги від користувачів ({$complaints})";
            $riskScore += 50;
        }

        // 5. Перевірка підозрілих пропозицій
        $suspiciousOffers = $this->checkSuspiciousOffers($user);
        if ($suspiciousOffers > 0) {
            $suspiciousActivities[] = "Підозрілі пропозиції (занадто низькі ціни)";
            $riskScore += 25;
        }

        // 6. Перевірка нових акаунтів з великими транзакціями
        $newAccountHighValue = $this->checkNewAccountHighValue($user);
        if ($newAccountHighValue) {
            $suspiciousActivities[] = "Новий акаунт з великими транзакціями";
            $riskScore += 35;
        }

        return [
            'is_suspicious' => $riskScore >= 50,
            'risk_score' => $riskScore,
            'activities' => $suspiciousActivities,
            'should_block' => $riskScore >= 80,
        ];
    }

    /**
     * Перевірка множинних акаунтів з одного IP
     */
    private function checkMultipleAccountsFromSameIP(User $user): int
    {
        if (!$user->last_login_ip) {
            return 0;
        }

        return User::where('last_login_ip', $user->last_login_ip)
            ->where('id', '!=', $user->id)
            ->where('created_at', '>', now()->subDays(30))
            ->count();
    }

    /**
     * Перевірка швидкого створення завдань (більше 5 за годину)
     */
    private function checkRapidTaskCreation(User $user): bool
    {
        $tasksLastHour = Task::where('client_id', $user->id)
            ->where('created_at', '>', now()->subHour())
            ->count();

        return $tasksLastHour > 5;
    }

    /**
     * Перевірка підозрілих платежів
     */
    private function checkSuspiciousPayments(User $user): int
    {
        $suspicious = 0;

        // Перевірка відхилених платежів
        $failedPayments = Payment::where('user_id', $user->id)
            ->where('status', 'failed')
            ->where('created_at', '>', now()->subDays(7))
            ->count();

        if ($failedPayments > 3) {
            $suspicious++;
        }

        // Перевірка платежів з різних карток за короткий час
        $differentCards = Payment::where('user_id', $user->id)
            ->where('created_at', '>', now()->subDay())
            ->distinct('payment_method_id')
            ->count('payment_method_id');

        if ($differentCards > 3) {
            $suspicious++;
        }

        return $suspicious;
    }

    /**
     * Перевірка скарг від інших користувачів
     */
    private function checkUserComplaints(User $user): int
    {
        // Тут можна додати таблицю complaints в майбутньому
        // Поки що повертаємо 0
        return 0;
    }

    /**
     * Перевірка підозрілих пропозицій (занадто низькі ціни)
     */
    private function checkSuspiciousOffers(User $user): int
    {
        $offers = Offer::where('prestataire_id', $user->id)
            ->where('created_at', '>', now()->subDays(7))
            ->whereNotNull('price')
            ->get();

        $suspicious = 0;
        foreach ($offers as $offer) {
            // Якщо ціна менше 10€, це підозріло
            if ($offer->price < 10) {
                $suspicious++;
            }
        }

        return $suspicious;
    }

    /**
     * Перевірка нових акаунтів з великими транзакціями
     */
    private function checkNewAccountHighValue(User $user): bool
    {
        // Акаунт новий (менше 7 днів)
        if ($user->created_at->diffInDays(now()) > 7) {
            return false;
        }

        // Перевірка великих транзакцій (більше 500€)
        $highValueTransactions = Payment::where('user_id', $user->id)
            ->where('amount', '>', 50000) // 500€ в центах
            ->count();

        return $highValueTransactions > 0;
    }

    /**
     * Автоматичне блокування підозрілого акаунту
     */
    public function blockSuspiciousUser(User $user, array $fraudCheck): void
    {
        if (!$fraudCheck['should_block']) {
            return;
        }

        // Блокуємо користувача
        $user->update([
            'is_blocked' => true,
            'blocked_reason' => 'Автоматичне блокування: підозріла активність. ' . implode(', ', $fraudCheck['activities']),
            'blocked_at' => now(),
        ]);

        // Логуємо
        Log::warning('User blocked due to fraud detection', [
            'user_id' => $user->id,
            'risk_score' => $fraudCheck['risk_score'],
            'activities' => $fraudCheck['activities'],
        ]);

        // Сповіщаємо адміністраторів
        $this->notifyAdminsAboutBlock($user, $fraudCheck);
    }

    /**
     * Сповіщення адміністраторів про блокування
     */
    private function notifyAdminsAboutBlock(User $user, array $fraudCheck): void
    {
        $admins = User::where('is_admin', true)->get();
        
        foreach ($admins as $admin) {
            \App\Models\Notification::create([
                'user_id' => $admin->id,
                'type' => 'fraud_detection',
                'data' => [
                    'blocked_user_id' => $user->id,
                    'blocked_user_name' => $user->name,
                    'blocked_user_email' => $user->email,
                    'risk_score' => $fraudCheck['risk_score'],
                    'activities' => $fraudCheck['activities'],
                ],
            ]);
        }
    }

    /**
     * Перевірка підозрілої транзакції перед обробкою
     */
    public function checkTransactionBeforeProcessing(User $user, float $amount): array
    {
        $suspicious = false;
        $reasons = [];

        // 1. Занадто велика сума для нового користувача
        if ($user->created_at->diffInDays(now()) < 7 && $amount > 500) {
            $suspicious = true;
            $reasons[] = "Велика сума для нового користувача";
        }

        // 2. Перевірка ліміту транзакцій за день
        $todayTransactions = Payment::where('user_id', $user->id)
            ->where('created_at', '>', now()->startOfDay())
            ->where('status', 'succeeded')
            ->sum('amount');

        if ($todayTransactions > 200000) { // 2000€
            $suspicious = true;
            $reasons[] = "Перевищено денний ліміт транзакцій";
        }

        // 3. Rate limiting - занадто багато спроб
        $cacheKey = "payment_attempts_{$user->id}";
        $attempts = Cache::get($cacheKey, 0);
        
        if ($attempts > 10) {
            $suspicious = true;
            $reasons[] = "Занадто багато спроб оплати";
        }

        Cache::put($cacheKey, $attempts + 1, now()->addHour());

        return [
            'is_suspicious' => $suspicious,
            'reasons' => $reasons,
            'should_block' => count($reasons) >= 2,
        ];
    }

    /**
     * Перевірка всіх користувачів на підозрілу активність (cron job)
     */
    public function scanAllUsers(): void
    {
        $users = User::where('is_blocked', false)
            ->where('created_at', '>', now()->subDays(30))
            ->get();

        foreach ($users as $user) {
            $fraudCheck = $this->checkUserActivity($user);
            
            if ($fraudCheck['should_block']) {
                $this->blockSuspiciousUser($user, $fraudCheck);
            } elseif ($fraudCheck['is_suspicious']) {
                // Логуємо підозрілу активність без блокування
                Log::info('Suspicious user activity detected', [
                    'user_id' => $user->id,
                    'risk_score' => $fraudCheck['risk_score'],
                    'activities' => $fraudCheck['activities'],
                ]);
            }
        }
    }
}
