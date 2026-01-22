<?php
// Простий PHP скрипт для заповнення ВСІХ категорій
// Запуск: php database/seeders/seed_all_categories.php

require __DIR__ . '/../../vendor/autoload.php';

$app = require_once __DIR__ . '/../../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Початок заповнення категорій...\n";

// Очищаємо
DB::statement('SET FOREIGN_KEY_CHECKS = 0');
DB::table('service_subcategories')->truncate();
DB::table('service_categories')->truncate();
DB::statement('SET FOREIGN_KEY_CHECKS = 1');

// Масив всіх 28 категорій з підкатегоріями з page.tsx
$allCategories = json_decode(file_get_contents(__DIR__ . '/all_categories.json'), true);

$totalCats = 0;
$totalSubs = 0;

foreach ($allCategories as $category) {
    $subcategories = $category['subcategories'];
    unset($category['subcategories']);
    
    $categoryId = DB::table('service_categories')->insertGetId([
        'key' => $category['key'],
        'name' => $category['name'],
        'icon' => $category['icon'],
        'color' => $category['color'],
        'order' => $category['order'],
        'is_active' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    echo "✓ {$category['name']}\n";
    $totalCats++;

    foreach ($subcategories as $i => $sub) {
        DB::table('service_subcategories')->insert([
            'category_id' => $categoryId,
            'key' => $sub['key'],
            'name' => $sub['name'],
            'order' => $i + 1,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $totalSubs++;
    }
}

echo "\nГотово! Додано {$totalCats} категорій та {$totalSubs} підкатегорій\n";
