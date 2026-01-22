<?php

namespace App\Console\Commands;

use App\Services\EmailAutomationService;
use Illuminate\Console\Command;

class ScheduleReEngagement extends Command
{
    protected $signature = 'email:schedule-reengagement';
    protected $description = 'Schedule re-engagement emails for inactive users';

    public function handle(EmailAutomationService $service): int
    {
        $this->info('Finding inactive users...');

        $inactiveUsers = $service->findInactiveUsers();

        $this->info("Found {$inactiveUsers->count()} inactive users");

        foreach ($inactiveUsers as $user) {
            $service->scheduleReEngagement($user);
        }

        $this->info("Scheduled re-engagement emails for {$inactiveUsers->count()} users");

        return 0;
    }
}
