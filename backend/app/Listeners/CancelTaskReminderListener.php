<?php

namespace App\Listeners;

use App\Events\OfferCreated;
use App\Services\EmailAutomationService;

class CancelTaskReminderListener
{
    public function __construct(
        private EmailAutomationService $automationService
    ) {}

    public function handle(OfferCreated $event): void
    {
        // Скасовуємо reminders коли є offer
        $this->automationService->cancelTaskReminder($event->offer->task);
    }
}
