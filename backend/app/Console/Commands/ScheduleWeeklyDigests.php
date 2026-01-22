<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\EmailAutomationService;
use Illuminate\Console\Command;

class ScheduleWeeklyDigests extends Command
{
    protected $signature = 'email:schedule-weekly-digests';
    protected $description = 'Schedule weekly digest emails for active prestataires';

    public function handle(EmailAutomationService $service): int
    {
        $this->info('Finding active prestataires...');

        $prestataires = User::whereNotNull('email')
            ->where('email_verified_at', '!=', null)
            ->where(function($query) {
                $query->whereJsonContains('roles', 'prestataire')
                      ->orWhere('role', 'prestataire');
            })
            ->where('last_login_at', '>=', now()->subDays(14))
            ->get();

        $this->info("Found {$prestataires->count()} active prestataires");

        foreach ($prestataires as $prestataire) {
            $service->scheduleWeeklyDigest($prestataire);
        }

        $this->info("Scheduled weekly digests for {$prestataires->count()} prestataires");

        return 0;
    }
}
