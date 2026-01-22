<?php

namespace Database\Seeders;

use App\Models\Achievement;
use Illuminate\Database\Seeder;

class AchievementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $achievements = [
            // Tasks-based achievements
            [
                'key' => 'first_task',
                'name' => 'Premier Pas',
                'description' => 'Complétez votre première mission',
                'icon' => '🎯',
                'category' => 'tasks',
                'xp_reward' => 50,
                'requirements' => ['tasks_completed' => 1],
                'sort_order' => 1,
            ],
            [
                'key' => 'tasks_5',
                'name' => 'En Route',
                'description' => 'Complétez 5 missions',
                'icon' => '🥉',
                'category' => 'tasks',
                'xp_reward' => 100,
                'requirements' => ['tasks_completed' => 5],
                'sort_order' => 2,
            ],
            [
                'key' => 'tasks_10',
                'name' => 'Professionnel',
                'description' => 'Complétez 10 missions',
                'icon' => '🥈',
                'category' => 'tasks',
                'xp_reward' => 200,
                'requirements' => ['tasks_completed' => 10],
                'sort_order' => 3,
            ],
            [
                'key' => 'tasks_25',
                'name' => 'Expert',
                'description' => 'Complétez 25 missions',
                'icon' => '⭐',
                'category' => 'tasks',
                'xp_reward' => 500,
                'requirements' => ['tasks_completed' => 25],
                'sort_order' => 4,
            ],
            [
                'key' => 'tasks_50',
                'name' => 'Maître',
                'description' => 'Complétez 50 missions',
                'icon' => '🥇',
                'category' => 'tasks',
                'xp_reward' => 1000,
                'requirements' => ['tasks_completed' => 50],
                'sort_order' => 5,
            ],
            [
                'key' => 'tasks_100',
                'name' => 'Légende',
                'description' => 'Complétez 100 missions',
                'icon' => '💎',
                'category' => 'tasks',
                'xp_reward' => 2000,
                'requirements' => ['tasks_completed' => 100],
                'sort_order' => 6,
            ],

            // Rating-based achievements
            [
                'key' => 'rating_45',
                'name' => 'Service Excellent',
                'description' => 'Obtenez une note moyenne de 4.5 étoiles',
                'icon' => '⭐',
                'category' => 'reviews',
                'xp_reward' => 150,
                'requirements' => ['average_rating' => 4.5, 'min_reviews' => 5],
                'sort_order' => 10,
            ],
            [
                'key' => 'rating_48',
                'name' => 'Excellence Confirmée',
                'description' => 'Obtenez une note moyenne de 4.8 étoiles',
                'icon' => '🌟',
                'category' => 'reviews',
                'xp_reward' => 300,
                'requirements' => ['average_rating' => 4.8, 'min_reviews' => 10],
                'sort_order' => 11,
            ],
            [
                'key' => 'rating_50',
                'name' => 'Perfection',
                'description' => 'Obtenez une note moyenne de 5.0 étoiles',
                'icon' => '💫',
                'category' => 'reviews',
                'xp_reward' => 500,
                'requirements' => ['average_rating' => 5.0, 'min_reviews' => 10],
                'sort_order' => 12,
            ],
            [
                'key' => 'reviews_10',
                'name' => 'Apprécié',
                'description' => 'Recevez 10 avis clients',
                'icon' => '💬',
                'category' => 'reviews',
                'xp_reward' => 100,
                'requirements' => ['reviews_received' => 10],
                'sort_order' => 13,
            ],
            [
                'key' => 'reviews_50',
                'name' => 'Très Populaire',
                'description' => 'Recevez 50 avis clients',
                'icon' => '🗣️',
                'category' => 'reviews',
                'xp_reward' => 500,
                'requirements' => ['reviews_received' => 50],
                'sort_order' => 14,
            ],

            // Speed-based achievements
            [
                'key' => 'fast_starter',
                'name' => 'Démarrage Rapide',
                'description' => 'Complétez 5 missions en 7 jours',
                'icon' => '🔥',
                'category' => 'special',
                'xp_reward' => 250,
                'requirements' => ['tasks_in_days' => 5, 'days' => 7],
                'sort_order' => 20,
            ],
            [
                'key' => 'super_active',
                'name' => 'Super Actif',
                'description' => 'Complétez 10 missions en 14 jours',
                'icon' => '⚡',
                'category' => 'special',
                'xp_reward' => 500,
                'requirements' => ['tasks_in_days' => 10, 'days' => 14],
                'sort_order' => 21,
            ],

            // Profile-based achievements
            [
                'key' => 'profile_verified',
                'name' => 'Profil Vérifié',
                'description' => 'Faites vérifier votre profil',
                'icon' => '✅',
                'category' => 'profile',
                'xp_reward' => 100,
                'requirements' => ['is_verified' => true],
                'sort_order' => 30,
            ],
            [
                'key' => 'profile_complete',
                'name' => 'Profil Complet',
                'description' => 'Complétez 100% de votre profil',
                'icon' => '📝',
                'category' => 'profile',
                'xp_reward' => 50,
                'requirements' => ['profile_completion' => 100],
                'sort_order' => 31,
            ],

            // Level-based achievements
            [
                'key' => 'level_10',
                'name' => 'Niveau 10',
                'description' => 'Atteignez le niveau 10',
                'icon' => '🎖️',
                'category' => 'levels',
                'xp_reward' => 0,
                'requirements' => ['level' => 10],
                'sort_order' => 40,
            ],
            [
                'key' => 'level_25',
                'name' => 'Niveau 25',
                'description' => 'Atteignez le niveau 25',
                'icon' => '🏆',
                'category' => 'levels',
                'xp_reward' => 0,
                'requirements' => ['level' => 25],
                'sort_order' => 41,
            ],
            [
                'key' => 'level_50',
                'name' => 'Niveau Maximum',
                'description' => 'Atteignez le niveau 50',
                'icon' => '👑',
                'category' => 'levels',
                'xp_reward' => 0,
                'requirements' => ['level' => 50],
                'sort_order' => 42,
            ],

            // Special achievements
            [
                'key' => 'early_adopter',
                'name' => 'Pionnier',
                'description' => 'Membre des 1000 premiers utilisateurs',
                'icon' => '🚀',
                'category' => 'special',
                'xp_reward' => 500,
                'requirements' => ['user_id' => 1000],
                'sort_order' => 50,
            ],
        ];

        foreach ($achievements as $achievement) {
            Achievement::updateOrCreate(
                ['key' => $achievement['key']],
                $achievement
            );
        }
    }
}
