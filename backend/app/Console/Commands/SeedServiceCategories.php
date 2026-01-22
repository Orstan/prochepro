<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SeedServiceCategories extends Command
{
    protected $signature = 'seed:categories';
    protected $description = 'Заповнити таблиці service_categories та service_subcategories';

    public function handle()
    {
        $this->info('Початок заповнення категорій...');

        // Очищаємо таблиці
        DB::statement('SET FOREIGN_KEY_CHECKS = 0');
        DB::table('service_subcategories')->truncate();
        DB::table('service_categories')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');

        $this->info('Таблиці очищені.');

        // Вставляємо категорії
        $categories = $this->getCategories();
        
        foreach ($categories as $category) {
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

            $this->info("Додано категорію: {$category['name']}");

            foreach ($subcategories as $i => $subcategory) {
                DB::table('service_subcategories')->insert([
                    'category_id' => $categoryId,
                    'key' => $subcategory['key'],
                    'name' => $subcategory['name'],
                    'order' => $i + 1,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $this->info("  Додано {$i} підкатегорій");
        }

        $totalCats = DB::table('service_categories')->count();
        $totalSubs = DB::table('service_subcategories')->count();

        $this->info('');
        $this->info("✓ Готово! Додано {$totalCats} категорій та {$totalSubs} підкатегорій");

        return 0;
    }

    private function getCategories(): array
    {
        return [
            [
                'key' => 'construction',
                'name' => 'Construction',
                'icon' => '🏗️',
                'color' => 'bg-gradient-to-br from-slate-100 to-gray-100',
                'order' => 1,
                'subcategories' => [
                    ['key' => 'foundation', 'name' => 'Fondations'],
                    ['key' => 'masonry', 'name' => 'Maçonnerie'],
                    ['key' => 'concrete', 'name' => 'Béton'],
                    ['key' => 'structural', 'name' => 'Structure'],
                    ['key' => 'demolition', 'name' => 'Démolition'],
                    ['key' => 'excavation', 'name' => 'Terrassement'],
                    ['key' => 'reinforcement', 'name' => 'Ferraillage'],
                    ['key' => 'formwork', 'name' => 'Coffrage'],
                    ['key' => 'waterproofing', 'name' => 'Étanchéité'],
                    ['key' => 'drainage_system', 'name' => 'Système de drainage'],
                    ['key' => 'retaining_wall', 'name' => 'Mur de soutènement'],
                    ['key' => 'concrete_slab', 'name' => 'Dalle béton'],
                    ['key' => 'foundation_repair', 'name' => 'Réparation fondations'],
                    ['key' => 'underpinning', 'name' => 'Reprise en sous-œuvre'],
                    ['key' => 'basement_construction', 'name' => 'Construction sous-sol'],
                    ['key' => 'structural_assessment', 'name' => 'Diagnostic structure'],
                    ['key' => 'load_bearing', 'name' => 'Mur porteur'],
                    ['key' => 'concrete_pumping', 'name' => 'Pompage béton'],
                    ['key' => 'site_preparation', 'name' => 'Préparation terrain'],
                    ['key' => 'grading', 'name' => 'Nivellement'],
                ],
            ],
            [
                'key' => 'roof_facade',
                'name' => 'Toit & façade',
                'icon' => '🏡',
                'color' => 'bg-gradient-to-br from-red-100 to-orange-100',
                'order' => 2,
                'subcategories' => [
                    ['key' => 'roofing', 'name' => 'Couverture'],
                    ['key' => 'facade_work', 'name' => 'Ravalement'],
                    ['key' => 'insulation_roof', 'name' => 'Isolation toiture'],
                    ['key' => 'gutters', 'name' => 'Gouttières'],
                    ['key' => 'zinc_work', 'name' => 'Zinguerie'],
                    ['key' => 'roof_repair', 'name' => 'Réparation toiture'],
                    ['key' => 'tile_roof', 'name' => 'Toiture tuiles'],
                    ['key' => 'slate_roof', 'name' => 'Toiture ardoise'],
                    ['key' => 'flat_roof', 'name' => 'Toiture terrasse'],
                    ['key' => 'metal_roof', 'name' => 'Toiture métallique'],
                    ['key' => 'roof_insulation', 'name' => 'Isolation combles'],
                    ['key' => 'chimney_work', 'name' => 'Travaux cheminée'],
                    ['key' => 'skylight', 'name' => 'Pose velux'],
                    ['key' => 'facade_cleaning', 'name' => 'Nettoyage façade'],
                    ['key' => 'facade_painting', 'name' => 'Peinture façade'],
                    ['key' => 'facade_insulation', 'name' => 'Isolation façade'],
                    ['key' => 'rendering', 'name' => 'Enduit façade'],
                    ['key' => 'cladding', 'name' => 'Bardage'],
                    ['key' => 'downspout', 'name' => 'Descente pluviale'],
                    ['key' => 'roof_waterproofing', 'name' => 'Étanchéité toit'],
                ],
            ],
            // Тут буде решта 26 категорій...
            // Файл занадто великий, тому створю окремо
        ];
    }
}
