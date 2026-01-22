<?php

namespace App\Console\Commands;

use App\Services\EmailAutomationService;
use Illuminate\Console\Command;

class ScheduleTaskReminders extends Command
{
    protected $signature = 'email:schedule-task-reminders';
    protected $description = 'Schedule reminders for tasks without offers';

    public function handle(EmailAutomationService $service): int
    {
        $this->info('Finding tasks needing reminders...');

        $tasks = $service->findTasksNeedingReminders();

        $this->info("Found {$tasks->count()} tasks");

        foreach ($tasks as $task) {
            $service->scheduleTaskReminder($task);
        }

        $this->info("Scheduled reminders for {$tasks->count()} tasks");

        return 0;
    }
}
