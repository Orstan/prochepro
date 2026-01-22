<?php

namespace App\Listeners;

use App\Events\TaskCreated;
use App\Services\EmailAutomationService;

class ScheduleTaskReminderListener
{
    public function __construct(
        private EmailAutomationService $automationService
    ) {}

    public function handle(TaskCreated $event): void
    {
        // Плануємо reminders для task без offers
        $this->automationService->scheduleTaskReminder($event->task);
    }
}
