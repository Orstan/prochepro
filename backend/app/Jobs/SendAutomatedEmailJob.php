<?php

namespace App\Jobs;

use App\Models\EmailAutomationLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendAutomatedEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public EmailAutomationLog $log
    ) {}

    public function handle(): void
    {
        try {
            $user = $this->log->user;

            // Перевіряємо чи користувач хоче отримувати emails
            if (!$user || !$user->email || $user->email_notifications === false) {
                $this->log->markAsSkipped();
                return;
            }

            // Визначаємо який email відправляти
            $mailable = $this->getMailableForCampaign();

            if (!$mailable) {
                $this->log->markAsFailed('Unknown campaign type');
                return;
            }

            // Відправляємо email
            Mail::to($user->email)->send($mailable);

            // Позначаємо як відправлений
            $this->log->markAsSent();

        } catch (\Exception $e) {
            $this->log->markAsFailed($e->getMessage());
            \Log::error('Failed to send automated email', [
                'log_id' => $this->log->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function getMailableForCampaign()
    {
        $user = $this->log->user;
        $metadata = $this->log->metadata ?? [];

        return match ($this->log->campaign_type) {
            'welcome_series' => $this->getWelcomeSeriesMailable($user),
            'task_reminder' => $this->getTaskReminderMailable($user, $metadata),
            're_engagement' => $this->getReEngagementMailable($user),
            'weekly_digest' => $this->getWeeklyDigestMailable($user),
            default => null,
        };
    }

    private function getWelcomeSeriesMailable($user)
    {
        return match ($this->log->sequence_step) {
            1 => new \App\Mail\WelcomeSeriesDay0($user),
            2 => new \App\Mail\WelcomeSeriesDay1($user),
            3 => new \App\Mail\WelcomeSeriesDay3($user),
            4 => new \App\Mail\WelcomeSeriesDay7($user, $this->getUserStats($user)),
            5 => new \App\Mail\WelcomeSeriesDay14($user),
            default => null,
        };
    }

    private function getTaskReminderMailable($user, $metadata)
    {
        $taskId = $metadata['task_id'] ?? null;
        if (!$taskId) return null;

        $task = \App\Models\Task::find($taskId);
        if (!$task) return null;

        $hoursElapsed = $metadata['hours_elapsed'] ?? 24;
        return new \App\Mail\TaskReminderMail($user, $task, $hoursElapsed);
    }

    private function getReEngagementMailable($user)
    {
        // Отримуємо підходящі завдання для користувача
        $suggestedTasks = \App\Models\Task::where('status', 'open')
            ->latest()
            ->take(5)
            ->get()
            ->toArray();

        return new \App\Mail\ReEngagementMail($user, $suggestedTasks);
    }

    private function getWeeklyDigestMailable($user)
    {
        $newTasks = \App\Models\Task::where('status', 'open')
            ->where('created_at', '>=', now()->subWeek())
            ->latest()
            ->take(10)
            ->get()
            ->toArray();

        $stats = $this->getUserStats($user);

        return new \App\Mail\WeeklyDigestMail($user, $newTasks, $stats);
    }

    private function getUserStats($user): array
    {
        if ($user->isPrestataireActive()) {
            return [
                'offers_sent' => $user->offers()->count(),
                'tasks_completed' => $user->completedTasks()->count(),
                'average_rating' => $user->average_rating ?? 0,
                'profile_views' => \App\Models\ProfileView::where('viewed_user_id', $user->id)->count(),
            ];
        }

        return [
            'tasks_created' => $user->tasks()->count(),
            'tasks_completed' => $user->tasks()->where('status', 'completed')->count(),
            'offers_received' => \App\Models\Offer::whereHas('task', fn($q) => $q->where('client_id', $user->id))->count(),
        ];
    }
}
