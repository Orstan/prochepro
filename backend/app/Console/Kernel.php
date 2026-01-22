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
        
        // Generate 25 fake tasks daily at 6am to keep site active
        $schedule->command('tasks:generate-daily --count=25')->dailyAt('06:00');
        
        // Cleanup old generated tasks (>3 days) daily at 3am
        $schedule->command('tasks:cleanup-generated --days=3')->dailyAt('03:00');
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
