<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Task;
use App\Mail\WeeklyTasksDigestMail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SendWeeklyDigest extends Command
{
    protected $signature = 'notifications:send-weekly-digest';
    protected $description = 'Send weekly email digest with new tasks in user\'s area';

    public function handle()
    {
        $this->info('Starting weekly digest email send...');
        
        // Get all active prestataires who haven't disabled email notifications
        $prestataires = User::where('role', 'prestataire')
            ->whereNotNull('email')
            ->where(function($q) {
                $q->where('email_notifications', true)
                  ->orWhereNull('email_notifications'); // null means enabled by default
            })
            ->where('email_verified_at', '!=', null)
            ->get();

        $this->info("Found {$prestataires->count()} prestataires to notify");

        $sentCount = 0;
        $oneWeekAgo = Carbon::now()->subWeek();

        foreach ($prestataires as $prestataire) {
            // Get user's location
            $latitude = $prestataire->latitude;
            $longitude = $prestataire->longitude;
            $city = $prestataire->city ?? 'votre région';

            if (!$latitude || !$longitude) {
                $this->warn("Skipping user #{$prestataire->id} - no location set");
                continue;
            }

            // Find tasks near user (within 50km) from last week
            $tasks = Task::select('tasks.*')
                ->selectRaw('(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance', [$latitude, $longitude, $latitude])
                ->where('status', 'published')
                ->where('created_at', '>=', $oneWeekAgo)
                ->having('distance', '<', 50) // Within 50km
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            if ($tasks->isEmpty()) {
                $this->info("No new tasks for user #{$prestataire->id}");
                continue;
            }

            // Format tasks for email
            $formattedTasks = $tasks->map(function($task) {
                $createdAgo = $task->created_at->diffForHumans();
                $budget = null;
                
                if ($task->budget_min && $task->budget_max) {
                    $budget = "{$task->budget_min}€ - {$task->budget_max}€";
                } elseif ($task->budget_min) {
                    $budget = "À partir de {$task->budget_min}€";
                }

                return [
                    'title' => $task->title,
                    'description' => $task->description,
                    'city' => $task->city,
                    'budget' => $budget,
                    'created_ago' => $createdAgo,
                    'url' => config('app.frontend_url') . '/tasks/' . $task->id,
                ];
            })->toArray();

            try {
                Mail::to($prestataire->email)->send(
                    new WeeklyTasksDigestMail($prestataire->name, $formattedTasks, $city)
                );
                $sentCount++;
                $this->info("✓ Sent digest to {$prestataire->email} ({$tasks->count()} tasks)");
            } catch (\Exception $e) {
                $this->error("✗ Failed to send to {$prestataire->email}: {$e->getMessage()}");
            }
        }

        $this->info("Weekly digest complete! Sent {$sentCount} emails.");
        return 0;
    }
}
