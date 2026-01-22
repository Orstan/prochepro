<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;
use App\Models\Notification;
use App\Services\WebPushService;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class TaskNotificationService
{
    protected $webPushService;

    public function __construct(WebPushService $webPushService)
    {
        $this->webPushService = $webPushService;
    }

    /**
     * Send notification to a user about a new task
     */
    public function sendNewTaskNotification(User $user, Task $task): void
    {
        $settings = $user->notificationSettings;
        
        // If settings exist and are disabled, skip
        if ($settings && !$settings->enabled) {
            return;
        }

        // Default channels if no settings exist (for backward compatibility)
        $channels = $settings ? ($settings->channels ?? []) : ['email' => true, 'push' => true];

        try {
            // Create in-app notification (always created for bell icon)
            $this->createInAppNotification($user, $task);

            // Send email notification
            if ($channels['email'] ?? true) {
                $this->sendEmailNotification($user, $task);
            }

            // Send push notification
            if ($channels['push'] ?? true) {
                $this->sendPushNotification($user, $task);
            }
        } catch (\Exception $e) {
            Log::error('TaskNotificationService error for user #' . $user->id, [
                'error' => $e->getMessage(),
                'task_id' => $task->id,
            ]);
        }
    }

    /**
     * Create in-app notification
     */
    protected function createInAppNotification(User $user, Task $task): void
    {
        try {
            $categoryName = $this->getCategoryName($task->category);
            $budgetText = $this->getBudgetText($task->budget_min, $task->budget_max);
            $locationText = $task->city ?? '';

            Notification::create([
                'user_id' => $user->id,
                'type' => 'new_task',
                'data' => [
                    'task_id' => $task->id,
                    'task_title' => $task->title,
                    'category' => $categoryName,
                    'budget' => $budgetText,
                    'location' => $locationText,
                    'message' => 'Nouvelle mission disponible : ' . $task->title,
                    'url' => '/tasks/' . $task->id,
                ],
            ]);

            Log::info('In-app notification created for user #' . $user->id . ' for task #' . $task->id);
        } catch (\Exception $e) {
            Log::error('In-app notification failed', [
                'user_id' => $user->id,
                'task_id' => $task->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send email notification
     */
    protected function sendEmailNotification(User $user, Task $task): void
    {
        try {
            $categoryName = $this->getCategoryName($task->category);
            $budgetText = $this->getBudgetText($task->budget_min, $task->budget_max);
            $locationText = $task->city ?? 'Non spécifié';

            Mail::send('emails.new-task-notification', [
                'userName' => $user->name,
                'taskTitle' => $task->title,
                'categoryName' => $categoryName,
                'budgetText' => $budgetText,
                'locationText' => $locationText,
                'taskUrl' => config('app.frontend_url') . '/tasks/' . $task->id,
            ], function ($message) use ($user, $task) {
                $message->to($user->email)
                    ->subject('Nouvelle mission disponible : ' . $task->title);
            });

            Log::info('Email notification sent to user #' . $user->id . ' for task #' . $task->id);
        } catch (\Exception $e) {
            Log::error('Email notification failed', [
                'user_id' => $user->id,
                'task_id' => $task->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send push notification
     */
    protected function sendPushNotification(User $user, Task $task): void
    {
        try {
            $categoryName = $this->getCategoryName($task->category);
            $budgetText = $this->getBudgetText($task->budget_min, $task->budget_max);
            $locationText = $task->city ?? '';

            $title = 'Nouvelle mission : ' . $categoryName;
            $body = $task->title . ($budgetText ? ' • ' . $budgetText : '') . ($locationText ? ' • ' . $locationText : '');

            $this->webPushService->sendToUser(
                $user,
                $title,
                $body,
                '/tasks/' . $task->id
            );

            Log::info('Push notification sent to user #' . $user->id . ' for task #' . $task->id);
        } catch (\Exception $e) {
            Log::error('Push notification failed', [
                'user_id' => $user->id,
                'task_id' => $task->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Get category name from key
     */
    protected function getCategoryName(string $categoryKey): string
    {
        // Simple mapping - you can improve this with a proper service/helper
        $categories = [
            'plumbing' => 'Plomberie',
            'electricity' => 'Électricité',
            'cleaning' => 'Nettoyage',
            'gardening' => 'Jardinage',
            'moving' => 'Déménagement',
            'painting' => 'Peinture',
            'carpentry' => 'Menuiserie',
            'locksmith' => 'Serrurerie',
            'hvac' => 'Chauffage/Climatisation',
            'masonry' => 'Maçonnerie',
        ];

        return $categories[$categoryKey] ?? ucfirst($categoryKey);
    }

    /**
     * Format budget text
     */
    protected function getBudgetText(?float $budgetMin, ?float $budgetMax): ?string
    {
        if ($budgetMin && $budgetMax) {
            return $budgetMin . '€ - ' . $budgetMax . '€';
        }
        if ($budgetMin) {
            return 'À partir de ' . $budgetMin . '€';
        }
        if ($budgetMax) {
            return 'Jusqu\'à ' . $budgetMax . '€';
        }
        return null;
    }

    /**
     * Check for potential spam (anti-spam mechanism)
     */
    public function isPotentialSpam(int $clientId, string $title): bool
    {
        // Check if client created similar tasks in the last 5 minutes
        $recentTasks = Task::where('client_id', $clientId)
            ->where('title', $title)
            ->where('created_at', '>', now()->subMinutes(5))
            ->count();

        return $recentTasks >= 3;
    }
}
