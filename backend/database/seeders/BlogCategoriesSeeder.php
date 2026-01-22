<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BlogCategoriesSeeder extends Seeder
{
    public function run(): void
    {
        // Видаляємо старі категорії (з відключенням FK перевірок)
        DB::statement('SET FOREIGN_KEY_CHECKS = 0');
        DB::table('blog_categories')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');

        $categories = [
            [
                'name' => 'Rénovation',
                'slug' => 'renovation',
                'icon' => '🏠',
                'sort_order' => 1,
            ],
            [
                'name' => 'Plomberie',
                'slug' => 'plomberie',
                'icon' => '🔧',
                'sort_order' => 2,
            ],
            [
                'name' => 'Électricité',
                'slug' => 'electricite',
                'icon' => '⚡',
                'sort_order' => 3,
            ],
            [
                'name' => 'Ménage',
                'slug' => 'menage',
                'icon' => '🧹',
                'sort_order' => 4,
            ],
            [
                'name' => 'Déménagement',
                'slug' => 'demenagement',
                'icon' => '📦',
                'sort_order' => 5,
            ],
            [
                'name' => 'Conseils',
                'slug' => 'conseils',
                'icon' => '💡',
                'sort_order' => 6,
            ],
            [
                'name' => 'Fiscalité',
                'slug' => 'fiscalite',
                'icon' => '📊',
                'sort_order' => 7,
            ],
        ];

        foreach ($categories as $category) {
            DB::table('blog_categories')->insert([
                'name' => $category['name'],
                'slug' => $category['slug'],
                'icon' => $category['icon'],
                'sort_order' => $category['sort_order'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('✅ Blog categories seeded successfully (7 categories)');
    }
}
