<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('sitemap:generate')->daily();

// Email Automation Scheduled Tasks
Schedule::command('email:process-automation')->everyFiveMinutes();
Schedule::command('email:schedule-task-reminders')->hourly();
Schedule::command('email:schedule-reengagement')->daily();
Schedule::command('email:schedule-weekly-digests')->weeklyOn(0, '9:00');
