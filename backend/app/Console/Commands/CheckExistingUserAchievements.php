<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\GamificationService;
use Illuminate\Console\Command;

class CheckExistingUserAchievements extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'gamification:check-existing-users {--user-id= : Check achievements for specific user}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check and award achievements for existing users (retroactive)';

    /**
     * Execute the console command.
     */
    public function handle(GamificationService $gamificationService): int
    {
        $this->info('🎮 Starting retroactive achievement check...');
        
        $userId = $this->option('user-id');
        
        if ($userId) {
            // Check specific user
            $user = User::find($userId);
            if (!$user) {
                $this->error("User with ID {$userId} not found.");
                return 1;
            }
            
            $this->checkUser($user, $gamificationService);
        } else {
            // Check all users
            $users = User::all();
            $this->info("Found {$users->count()} users to check.");
            
            $progressBar = $this->output->createProgressBar($users->count());
            $progressBar->start();
            
            foreach ($users as $user) {
                $this->checkUser($user, $gamificationService);
                $progressBar->advance();
            }
            
            $progressBar->finish();
            $this->newLine();
        }
        
        $this->info('✅ Achievement check completed!');
        return 0;
    }
    
    private function checkUser(User $user, GamificationService $gamificationService): void
    {
        try {
            $awarded = $gamificationService->checkAndAwardAchievements($user);
            
            if (count($awarded) > 0) {
                $this->newLine();
                $this->info("✨ User #{$user->id} ({$user->name}) earned " . count($awarded) . " new achievement(s):");
                foreach ($awarded as $achievement) {
                    $this->line("   - {$achievement->icon} {$achievement->name}");
                }
            }
        } catch (\Exception $e) {
            $this->newLine();
            $this->error("Error checking user #{$user->id}: " . $e->getMessage());
        }
    }
}
