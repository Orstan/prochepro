<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // $schedule->command('inspire')->hourly();
        
        // Run the Telegram bot every minute
        $schedule->command('telegram:bot')->everyMinute()->withoutOverlapping();
        
        // Generate 10 new demo tasks daily at 8am (winter 2026 seasonal)
        $schedule->command('demo:generate-tasks')->dailyAt('08:00');
        
        // Cleanup old demo tasks (>2 days, no accepted offers) daily at 4am
        $schedule->command('demo:cleanup-tasks')->dailyAt('04:00');
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
