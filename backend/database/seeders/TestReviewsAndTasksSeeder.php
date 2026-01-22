<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Task;
use App\Models\Offer;
use App\Models\Review;
use Illuminate\Database\Seeder;

class TestReviewsAndTasksSeeder extends Seeder
{
    /**
     * Seed test reviews and completed tasks to improve AI matching scores
     */
    public function run(): void
    {
        // Find test prestataires
        $jeanDupont = User::where('email', 'jean.dupont@test.com')->first();
        $pierreDubois = User::where('email', 'pierre.dubois@test.com')->first();
        
        if (!$jeanDupont || !$pierreDubois) {
            $this->command->error('Test prestataires not found. Run TestPrestataireSeeder first.');
            return;
        }

        // Find a client
        $client = User::where('role', 'client')->first();
        if (!$client) {
            $this->command->warn('No client found, creating test client...');
            $client = User::create([
                'name' => 'Test Client',
                'email' => 'test.client@test.com',
                'phone' => '+33612340000',
                'password' => bcrypt('password123'),
                'role' => 'client',
                'roles' => ['client'],
                'email_verified_at' => now(),
                'referral_code' => User::generateReferralCode(),
            ]);
        }

        // Create completed tasks and reviews for Jean Dupont
        $this->createCompletedTasksForPrestataire($client, $jeanDupont, 10);
        
        // Create completed tasks and reviews for Pierre Dubois
        $this->createCompletedTasksForPrestataire($client, $pierreDubois, 5);

        $this->command->info('Test reviews and tasks seeded successfully!');
    }

    protected function createCompletedTasksForPrestataire(User $client, User $prestataire, int $count): void
    {
        for ($i = 0; $i < $count; $i++) {
            // Create task
            $task = Task::create([
                'client_id' => $client->id,
                'title' => "Intervention plomberie #{$i}",
                'description' => 'Réparation fuite d\'eau',
                'category' => 'plomberie',
                'subcategory' => 'fuite_eau',
                'city' => $prestataire->city,
                'status' => 'completed',
                'budget_min' => 50,
                'budget_max' => 150,
            ]);

            // Create accepted offer
            $offer = Offer::create([
                'task_id' => $task->id,
                'prestataire_id' => $prestataire->id,
                'price' => rand(60, 140),
                'message' => 'Je peux intervenir rapidement',
                'status' => 'accepted',
            ]);

            // Create review
            $rating = rand(4, 5); // 4 or 5 stars
            Review::create([
                'task_id' => $task->id,
                'client_id' => $client->id,
                'prestataire_id' => $prestataire->id,
                'rating' => $rating,
                'comment' => $rating === 5 ? 'Excellent travail, très professionnel !' : 'Bon travail, je recommande.',
            ]);
        }

        $this->command->info("Created {$count} completed tasks for {$prestataire->name}");
    }
}
