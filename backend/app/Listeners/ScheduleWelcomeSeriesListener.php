<?php

namespace App\Listeners;

use App\Services\EmailAutomationService;
use Illuminate\Auth\Events\Registered;

class ScheduleWelcomeSeriesListener
{
    public function __construct(
        private EmailAutomationService $automationService
    ) {}

    public function handle(Registered $event): void
    {
        $this->automationService->scheduleWelcomeSeries($event->user);
    }
}
