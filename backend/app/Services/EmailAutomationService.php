<?php

namespace App\Services;

use App\Models\User;
use App\Models\Task;
use App\Models\EmailAutomationLog;
use App\Jobs\SendAutomatedEmailJob;
use Carbon\Carbon;

class EmailAutomationService
{
    /**
     * Запланувати welcome series для нового користувача
     */
    public function scheduleWelcomeSeries(User $user): void
    {
        // Day 0: Відразу після реєстрації - вітальний лист з інструкціями
        $this->createAutomationLog($user, 'welcome_series', 1, now());

        // Day 1: Через 1 день - як створити перше завдання
        $this->createAutomationLog($user, 'welcome_series', 2, now()->addDays(1));

        // Day 3: Через 3 дні - 10 найпопулярніших послуг
        $this->createAutomationLog($user, 'welcome_series', 3, now()->addDays(3));

        // Day 7: Через 7 днів - залишились питання? FAQ
        $this->createAutomationLog($user, 'welcome_series', 4, now()->addDays(7));

        // Day 14: Через 14 днів - спеціальна пропозиція
        $this->createAutomationLog($user, 'welcome_series', 5, now()->addDays(14));
    }

    /**
     * Запланувати task reminder (якщо немає offerів)
     */
    public function scheduleTaskReminder(Task $task): void
    {
        if (!$task->client) return;

        // Через 24 години якщо немає offerів
        $this->createAutomationLog(
            $task->client,
            'task_reminder',
            1,
            now()->addHours(24),
            ['task_id' => $task->id, 'hours_elapsed' => 24]
        );

        // Через 72 години якщо все ще немає offerів
        $this->createAutomationLog(
            $task->client,
            'task_reminder',
            2,
            now()->addHours(72),
            ['task_id' => $task->id, 'hours_elapsed' => 72]
        );
    }

    /**
     * Запланувати re-engagement для неактивних користувачів
     */
    public function scheduleReEngagement(User $user): void
    {
        // Якщо користувач неактивний 30+ днів
        $lastActive = $user->last_login_at ?? $user->created_at;
        
        if ($lastActive->diffInDays(now()) >= 30) {
            $this->createAutomationLog(
                $user,
                're_engagement',
                1,
                now()->addHours(1) // Відправляємо скоро
            );
        }
    }

    /**
     * Запланувати weekly digest для активних prestataires
     */
    public function scheduleWeeklyDigest(User $user): void
    {
        if (!$user->isPrestataireActive()) return;

        // Відправляємо кожної неділі о 9:00
        $nextSunday = Carbon::parse('next sunday 09:00');

        $this->createAutomationLog(
            $user,
            'weekly_digest',
            1,
            $nextSunday
        );
    }

    /**
     * Скасувати task reminder якщо є offer
     */
    public function cancelTaskReminder(Task $task): void
    {
        EmailAutomationLog::where('user_id', $task->client_id)
            ->where('campaign_type', 'task_reminder')
            ->where('status', 'pending')
            ->whereJsonContains('metadata->task_id', $task->id)
            ->delete();
    }

    /**
     * Обробити всі готові до відправки emails
     */
    public function processReadyEmails(): int
    {
        $logs = EmailAutomationLog::readyToSend()->get();

        foreach ($logs as $log) {
            SendAutomatedEmailJob::dispatch($log);
        }

        return $logs->count();
    }

    /**
     * Знайти неактивних користувачів для re-engagement
     */
    public function findInactiveUsers(): \Illuminate\Database\Eloquent\Collection
    {
        return User::whereNotNull('email')
            ->where('email_verified_at', '!=', null)
            ->where(function($query) {
                $query->where('last_login_at', '<=', now()->subDays(30))
                      ->orWhere(function($q) {
                          $q->whereNull('last_login_at')
                            ->where('created_at', '<=', now()->subDays(30));
                      });
            })
            ->whereDoesntHave('emailAutomationLogs', function($query) {
                $query->where('campaign_type', 're_engagement')
                      ->where('created_at', '>=', now()->subDays(30));
            })
            ->get();
    }

    /**
     * Знайти tasks без offers для reminders
     */
    public function findTasksNeedingReminders(): \Illuminate\Database\Eloquent\Collection
    {
        return Task::where('status', 'open')
            ->whereDoesntHave('offers')
            ->where('created_at', '>=', now()->subDays(7)) // Не старіше 7 днів
            ->where('created_at', '<=', now()->subHours(24)) // Старіше 24 годин
            ->whereDoesntHave('client.emailAutomationLogs', function($query) {
                $query->where('campaign_type', 'task_reminder')
                      ->where('status', 'sent')
                      ->where('created_at', '>=', now()->subHours(48));
            })
            ->get();
    }

    /**
     * Створити automation log
     */
    private function createAutomationLog(
        User $user,
        string $campaignType,
        int $sequenceStep,
        Carbon $scheduledFor,
        ?array $metadata = null
    ): EmailAutomationLog {
        return EmailAutomationLog::create([
            'user_id' => $user->id,
            'campaign_type' => $campaignType,
            'sequence_step' => $sequenceStep,
            'status' => 'pending',
            'scheduled_for' => $scheduledFor,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Отримати статистику automation
     */
    public function getStats(): array
    {
        return [
            'pending' => EmailAutomationLog::where('status', 'pending')->count(),
            'sent_today' => EmailAutomationLog::where('status', 'sent')
                ->whereDate('sent_at', today())->count(),
            'failed_today' => EmailAutomationLog::where('status', 'failed')
                ->whereDate('updated_at', today())->count(),
            'total_sent' => EmailAutomationLog::where('status', 'sent')->count(),
        ];
    }
}
