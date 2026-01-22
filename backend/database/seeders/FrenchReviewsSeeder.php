<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Review;
use App\Models\Task;
use Illuminate\Database\Seeder;

class FrenchReviewsSeeder extends Seeder
{
    private array $reviewComments = [
        // Excellent reviews (5 stars)
        'Excellent professionnel, travail impeccable et dans les délais. Je recommande vivement !',
        'Service parfait, très professionnel et à l\'écoute. Résultat au-delà de mes attentes.',
        'Travail de qualité exceptionnelle, très satisfait du résultat final.',
        'Prestataire sérieux et compétent, je ferai à nouveau appel à ses services.',
        'Intervention rapide et efficace, travail soigné. Parfait !',
        'Très professionnel, ponctuel et travail impeccable. Hautement recommandé.',
        'Excellente prestation, résultat parfait. Merci beaucoup !',
        'Service de qualité, prix correct et travail bien fait. Je recommande.',
        
        // Very good reviews (4-4.5 stars)
        'Très bon travail, professionnel sérieux. Quelques petits détails à revoir mais globalement satisfait.',
        'Bon service, travail propre et soigné. Je recommande.',
        'Prestation conforme à mes attentes, bon rapport qualité-prix.',
        'Travail bien réalisé, professionnel ponctuel et agréable.',
        'Bon professionnel, travail de qualité. Légèrement plus long que prévu mais résultat satisfaisant.',
        'Service correct, bon travail dans l\'ensemble.',
        'Satisfait du résultat, prestataire sérieux et à l\'écoute.',
        'Bonne intervention, travail propre. Quelques ajustements nécessaires mais bon résultat final.',
        
        // Good reviews (3.5-4 stars)
        'Travail correct, conforme à ce qui était demandé.',
        'Prestation acceptable, quelques améliorations possibles.',
        'Service correct dans l\'ensemble, bon rapport qualité-prix.',
        'Travail satisfaisant, professionnel disponible.',
        'Résultat conforme à mes attentes, rien à redire.',
        'Bon service, travail réalisé dans les temps.',
        'Prestation correcte, professionnel sympatique.',
        'Travail bien fait, quelques détails à peaufiner.',
    ];

    private array $clientNames = [
        'Sophie Martin', 'Thomas Dubois', 'Marie Bernard', 'Alexandre Petit', 'Julie Durand',
        'Nicolas Robert', 'Camille Laurent', 'Julien Moreau', 'Emma Simon', 'Lucas Richard',
        'Léa Lefebvre', 'Antoine Michel', 'Chloé Garcia', 'Maxime David', 'Sarah Bertrand',
        'Hugo Roux', 'Manon Vincent', 'Paul Fournier', 'Clara Morel', 'Louis Girard',
        'Inès André', 'Gabriel Lefevre', 'Jade Mercier', 'Nathan Dupont', 'Zoé Lambert',
        'Arthur Bonnet', 'Léna François', 'Raphaël Martinez', 'Lucie Legrand', 'Théo Garnier',
    ];

    public function run(): void
    {
        $this->command->info('🌟 Création des avis pour les prestataires français...');
        
        // Get all prestataires created by FrenchUsersSeeder (email ends with @prochepro.fr)
        $prestataires = User::where('email', 'like', '%@prochepro.fr')
            ->where(function ($query) {
                $query->where('role', 'prestataire')
                      ->orWhereJsonContains('roles', 'prestataire');
            })
            ->get();

        if ($prestataires->isEmpty()) {
            $this->command->warn('❌ Aucun prestataire trouvé avec email @prochepro.fr');
            return;
        }

        $this->command->info("📋 Trouvé {$prestataires->count()} prestataires");

        // Create or get multiple clients with French names
        $clients = [];
        foreach ($this->clientNames as $clientName) {
            $email = strtolower(str_replace(' ', '.', $clientName)) . '.client@prochepro.fr';
            $client = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => $clientName,
                    'password' => bcrypt('password123'),
                    'role' => 'client',
                    'roles' => ['client'],
                    'email_verified_at' => now(),
                ]
            );
            $clients[] = $client;
        }

        $this->command->info("📋 " . count($clients) . " clients créés/trouvés");

        $totalReviewsCreated = 0;

        foreach ($prestataires as $prestataire) {
            // Random number of reviews between 4 and 6
            $reviewsCount = rand(4, 6);

            for ($i = 0; $i < $reviewsCount; $i++) {
                // Select random client for this review
                $client = $clients[array_rand($clients)];

                // Create or get a task for this client-prestataire pair
                $task = Task::firstOrCreate(
                    [
                        'client_id' => $client->id,
                        'title' => 'Mission complétée',
                    ],
                    [
                        'description' => 'Prestation réalisée avec succès',
                        'category' => 'plomberie',
                        'subcategory' => 'fuite_eau',
                        'budget_min' => 80,
                        'budget_max' => 120,
                        'city' => 'Paris',
                        'status' => 'completed',
                    ]
                );

                // Generate rating between 3.5 and 5
                // 60% chance of 4.5-5 stars
                // 30% chance of 4-4.5 stars
                // 10% chance of 3.5-4 stars
                $rand = rand(1, 100);
                if ($rand <= 60) {
                    // 4.5-5 stars
                    $rating = rand(45, 50) / 10;
                } elseif ($rand <= 90) {
                    // 4-4.5 stars
                    $rating = rand(40, 45) / 10;
                } else {
                    // 3.5-4 stars
                    $rating = rand(35, 40) / 10;
                }

                // Select appropriate comment based on rating
                if ($rating >= 4.5) {
                    $commentIndex = rand(0, 7); // Excellent reviews
                } elseif ($rating >= 4.0) {
                    $commentIndex = rand(8, 15); // Very good reviews
                } else {
                    $commentIndex = rand(16, 23); // Good reviews
                }

                $comment = $this->reviewComments[$commentIndex];

                // Create review
                Review::create([
                    'task_id' => $task->id,
                    'client_id' => $client->id,
                    'prestataire_id' => $prestataire->id,
                    'rating' => $rating,
                    'comment' => $comment,
                    'direction' => 'client_to_prestataire',
                    'created_at' => now()->subDays(rand(1, 180)), // Random date in last 6 months
                ]);

                $totalReviewsCreated++;
            }

            if ($totalReviewsCreated % 50 === 0) {
                $this->command->info("✅ {$totalReviewsCreated} avis créés...");
            }
        }

        $this->command->info("✅ Terminé! {$totalReviewsCreated} avis créés pour {$prestataires->count()} prestataires");
        $this->command->info("📊 Moyenne: " . round($totalReviewsCreated / $prestataires->count(), 1) . " avis par prestataire");
    }
}
