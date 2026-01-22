<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class BlogSeeder extends Seeder
{
    /**
     * Головний seeder для блогу
     * Запускає категорії та статті в правильному порядку
     */
    public function run(): void
    {
        $this->command->info('🚀 Starting Blog seeding...');
        $this->command->newLine();

        // 1. Спочатку категорії
        $this->command->info('📁 Seeding blog categories...');
        $this->call(BlogCategoriesSeeder::class);
        $this->command->newLine();

        // 2. Потім статті
        $this->command->info('📝 Seeding blog articles...');
        $this->call(BlogArticlesSeeder::class);
        $this->command->newLine();

        $this->command->info('✅ Blog seeding completed!');
    }
}
