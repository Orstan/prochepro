<?php

namespace App\Console\Commands;

use App\Models\Task;
use Illuminate\Console\Command;

class CleanupOldGeneratedTasks extends Command
{
    protected $signature = 'tasks:cleanup-generated {--days=3 : Delete generated tasks older than this many days}';
    protected $description = 'Delete old generated tasks (ONLY generated, real user tasks are never deleted)';

    public function handle()
    {
        $days = (int) $this->option('days');
        $cutoffDate = now()->subDays($days);
        
        $this->info("Cleaning up generated tasks older than {$days} days (before {$cutoffDate->format('Y-m-d H:i:s')})...");
        
        // CRITICAL: Only delete tasks where is_generated = true
        // This protects ALL real user tasks from being deleted
        $oldGeneratedTasks = Task::where('is_generated', true)
            ->where('created_at', '<', $cutoffDate)
            ->get();
        
        if ($oldGeneratedTasks->isEmpty()) {
            $this->info("✅ No old generated tasks to delete.");
            return 0;
        }
        
        $count = $oldGeneratedTasks->count();
        
        // Show what will be deleted
        $this->info("\n📋 Tasks to be deleted:");
        foreach ($oldGeneratedTasks->take(5) as $task) {
            $age = now()->diffInDays($task->created_at);
            $this->line("   - #{$task->id}: {$task->title} (age: {$age} days)");
        }
        
        if ($count > 5) {
            $this->line("   ... and " . ($count - 5) . " more");
        }
        
        // Delete
        $deleted = Task::where('is_generated', true)
            ->where('created_at', '<', $cutoffDate)
            ->delete();
        
        $this->info("\n✅ Successfully deleted {$deleted} old generated tasks!");
        
        // Show statistics
        $totalPublished = Task::where('status', 'published')->count();
        $totalGenerated = Task::where('is_generated', true)->where('status', 'published')->count();
        $totalReal = $totalPublished - $totalGenerated;
        
        $this->info("\n📊 Current statistics:");
        $this->info("   Total published tasks: {$totalPublished}");
        $this->info("   Generated tasks: {$totalGenerated}");
        $this->info("   Real user tasks: {$totalReal} (PROTECTED ✓)");
        
        return 0;
    }
}
