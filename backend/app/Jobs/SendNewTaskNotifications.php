<?php

namespace App\Jobs;

use App\Models\Task;
use App\Models\User;
use App\Services\TaskNotificationService;
use App\Services\TelegramNotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendNewTaskNotifications implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $task;

    /**
     * Create a new job instance.
     */
    public function __construct(Task $task)
    {
        $this->task = $task;
    }

    /**
     * Execute the job.
     */
    public function handle(TaskNotificationService $service): void
    {
        try {
            Log::info('SendNewTaskNotifications: Starting for task #' . $this->task->id);

            // Get eligible users for this task
            $eligibleUsers = $this->getEligibleUsers();

            Log::info('SendNewTaskNotifications: Found ' . $eligibleUsers->count() . ' eligible users');

            // Send notifications in batches to avoid overload
            $eligibleUsers->chunk(50)->each(function ($batch) use ($service) {
                foreach ($batch as $user) {
                    // Email/Push notifications
                    $service->sendNewTaskNotification($user, $this->task);
                    
                    // Telegram notification
                    TelegramNotificationService::notifyNewTask($user, $this->task);
                }
            });

            Log::info('SendNewTaskNotifications: Completed for task #' . $this->task->id);
        } catch (\Exception $e) {
            Log::error('SendNewTaskNotifications error: ' . $e->getMessage(), [
                'task_id' => $this->task->id,
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Get users eligible to receive notification for this task
     */
    private function getEligibleUsers()
    {
        $categoryKey = $this->task->category;
        $subcategoryKey = $this->task->subcategory;

        return User::query()
            // Must have prestataire role
            ->whereJsonContains('roles', 'prestataire')
            // Must have notification settings enabled (or no settings = enabled by default)
            ->where(function ($query) {
                $query->whereHas('notificationSettings', function ($q) {
                    $q->where('enabled', true);
                })
                ->orWhereDoesntHave('notificationSettings');
            })
            // Filter by category/subcategory based on notification mode
            ->where(function ($query) use ($categoryKey, $subcategoryKey) {
                // Users WITHOUT settings = receive ALL notifications (backward compatibility)
                $query->whereDoesntHave('notificationSettings')
                    // OR Auto mode: check service_categories/service_subcategories
                    ->orWhereHas('notificationSettings', function ($q) use ($categoryKey, $subcategoryKey) {
                        $q->where('notification_mode', 'auto_skills')
                          ->where(function ($subQ) use ($categoryKey, $subcategoryKey) {
                              if ($subcategoryKey) {
                                  $subQ->whereJsonContains('users.service_subcategories', $subcategoryKey);
                              } else {
                                  $subQ->whereJsonContains('users.service_categories', $categoryKey);
                              }
                          });
                    })
                    // OR Manual mode: check interested_categories
                    ->orWhere(function ($subQuery) use ($categoryKey, $subcategoryKey) {
                        $subQuery->whereHas('notificationSettings', function ($q) {
                            $q->where('notification_mode', 'manual_selection');
                        })->whereHas('interestedCategories', function ($q) use ($categoryKey, $subcategoryKey) {
                            $q->where('category_key', $categoryKey)
                              ->where(function ($subQ) use ($subcategoryKey) {
                                  if ($subcategoryKey) {
                                      $subQ->where('subcategory_key', $subcategoryKey)
                                           ->orWhereNull('subcategory_key');
                                  } else {
                                      $subQ->whereNull('subcategory_key');
                                  }
                              });
                        });
                    });
            })
            ->get();
    }
}
