<?php

namespace Database\Seeders;

use App\Models\ForumCategory;
use Illuminate\Database\Seeder;

class ForumSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Questions générales',
                'slug' => 'questions-generales',
                'description' => 'Posez vos questions générales sur les métiers du bâtiment',
                'icon' => '❓',
                'order' => 1,
            ],
            [
                'name' => 'Conseils techniques',
                'slug' => 'conseils-techniques',
                'description' => 'Partagez et demandez des conseils techniques',
                'icon' => '🔧',
                'order' => 2,
            ],
            [
                'name' => 'Matériaux et outils',
                'slug' => 'materiaux-et-outils',
                'description' => 'Discussions sur les matériaux et outils de travail',
                'icon' => '🛠️',
                'order' => 3,
            ],
            [
                'name' => 'Réglementations',
                'slug' => 'reglementations',
                'description' => 'Questions sur les normes et réglementations',
                'icon' => '📋',
                'order' => 4,
            ],
            [
                'name' => 'Retours d\'expérience',
                'slug' => 'retours-experience',
                'description' => 'Partagez vos expériences et cas pratiques',
                'icon' => '💡',
                'order' => 5,
            ],
        ];

        foreach ($categories as $category) {
            ForumCategory::create($category);
        }
    }
}
