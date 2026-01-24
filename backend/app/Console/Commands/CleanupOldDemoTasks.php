<?php

namespace App\Console\Commands;

use App\Models\Task;
use Illuminate\Console\Command;

class CleanupOldDemoTasks extends Command
{
    protected $signature = 'demo:cleanup-tasks';
    protected $description = 'Delete demo tasks older than 2 days';

    public function handle(): int
    {
        // Delete generated tasks older than 2 days that don't have accepted offers
        $deleted = Task::where('is_generated', true)
            ->where('created_at', '<', now()->subDays(2))
            ->whereDoesntHave('offers', function ($query) {
                $query->where('status', 'accepted');
            })
            ->delete();

        $this->info("✅ Deleted {$deleted} old demo tasks (older than 2 days, no accepted offers)");
        return self::SUCCESS;
    }
}
