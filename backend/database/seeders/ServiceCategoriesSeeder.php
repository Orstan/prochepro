<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServiceCategoriesSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'key' => 'construction',
                'name' => 'Construction',
                'icon' => '🏗️',
                'color' => 'bg-gradient-to-br from-slate-100 to-gray-100',
                'order' => 1,
                'subcategories' => [
                    ['key' => 'foundation', 'name' => 'Fondations', 'order' => 1],
                    ['key' => 'masonry', 'name' => 'Maçonnerie', 'order' => 2],
                    ['key' => 'concrete', 'name' => 'Béton', 'order' => 3],
                    ['key' => 'structural', 'name' => 'Structure', 'order' => 4],
                    ['key' => 'demolition', 'name' => 'Démolition', 'order' => 5],
                    ['key' => 'excavation', 'name' => 'Terrassement', 'order' => 6],
                    ['key' => 'reinforcement', 'name' => 'Ferraillage', 'order' => 7],
                    ['key' => 'formwork', 'name' => 'Coffrage', 'order' => 8],
                    ['key' => 'waterproofing', 'name' => 'Étanchéité', 'order' => 9],
                    ['key' => 'drainage_system', 'name' => 'Système de drainage', 'order' => 10],
                    ['key' => 'retaining_wall', 'name' => 'Mur de soutènement', 'order' => 11],
                    ['key' => 'concrete_slab', 'name' => 'Dalle béton', 'order' => 12],
                    ['key' => 'foundation_repair', 'name' => 'Réparation fondations', 'order' => 13],
                    ['key' => 'underpinning', 'name' => 'Reprise en sous-œuvre', 'order' => 14],
                    ['key' => 'basement_construction', 'name' => 'Construction sous-sol', 'order' => 15],
                    ['key' => 'structural_assessment', 'name' => 'Diagnostic structure', 'order' => 16],
                    ['key' => 'load_bearing', 'name' => 'Mur porteur', 'order' => 17],
                    ['key' => 'concrete_pumping', 'name' => 'Pompage béton', 'order' => 18],
                    ['key' => 'site_preparation', 'name' => 'Préparation terrain', 'order' => 19],
                    ['key' => 'grading', 'name' => 'Nivellement', 'order' => 20],
                ],
            ],
            [
                'key' => 'roof_facade',
                'name' => 'Toit & façade',
                'icon' => '🏡',
                'color' => 'bg-gradient-to-br from-red-100 to-orange-100',
                'order' => 2,
                'subcategories' => [
                    ['key' => 'roofing', 'name' => 'Couverture', 'order' => 1],
                    ['key' => 'facade_work', 'name' => 'Ravalement', 'order' => 2],
                    ['key' => 'insulation_roof', 'name' => 'Isolation toiture', 'order' => 3],
                    ['key' => 'gutters', 'name' => 'Gouttières', 'order' => 4],
                    ['key' => 'zinc_work', 'name' => 'Zinguerie', 'order' => 5],
                    ['key' => 'roof_repair', 'name' => 'Réparation toiture', 'order' => 6],
                    ['key' => 'tile_roof', 'name' => 'Toiture tuiles', 'order' => 7],
                    ['key' => 'slate_roof', 'name' => 'Toiture ardoise', 'order' => 8],
                    ['key' => 'flat_roof', 'name' => 'Toiture terrasse', 'order' => 9],
                    ['key' => 'metal_roof', 'name' => 'Toiture métallique', 'order' => 10],
                    ['key' => 'roof_insulation', 'name' => 'Isolation combles', 'order' => 11],
                    ['key' => 'chimney_work', 'name' => 'Travaux cheminée', 'order' => 12],
                    ['key' => 'skylight', 'name' => 'Pose velux', 'order' => 13],
                    ['key' => 'facade_cleaning', 'name' => 'Nettoyage façade', 'order' => 14],
                    ['key' => 'facade_painting', 'name' => 'Peinture façade', 'order' => 15],
                    ['key' => 'facade_insulation', 'name' => 'Isolation façade', 'order' => 16],
                    ['key' => 'rendering', 'name' => 'Enduit façade', 'order' => 17],
                    ['key' => 'cladding', 'name' => 'Bardage', 'order' => 18],
                    ['key' => 'downspout', 'name' => 'Descente pluviale', 'order' => 19],
                    ['key' => 'roof_waterproofing', 'name' => 'Étanchéité toit', 'order' => 20],
                ],
            ],
            [
                'key' => 'garage_gates',
                'name' => 'Garages & portails',
                'icon' => '🚧',
                'color' => 'bg-gradient-to-br from-zinc-100 to-slate-100',
                'order' => 3,
                'subcategories' => [
                    ['key' => 'garage_door', 'name' => 'Porte de garage', 'order' => 1],
                    ['key' => 'gate_install', 'name' => 'Installation portail', 'order' => 2],
                    ['key' => 'fence', 'name' => 'Clôture', 'order' => 3],
                    ['key' => 'gate_repair', 'name' => 'Réparation portail', 'order' => 4],
                    ['key' => 'automation', 'name' => 'Automatisation', 'order' => 5],
                    ['key' => 'sectional_door', 'name' => 'Porte sectionnelle', 'order' => 6],
                    ['key' => 'rolling_door', 'name' => 'Porte enroulable', 'order' => 7],
                    ['key' => 'swing_gate', 'name' => 'Portail battant', 'order' => 8],
                    ['key' => 'sliding_gate', 'name' => 'Portail coulissant', 'order' => 9],
                    ['key' => 'electric_gate', 'name' => 'Portail électrique', 'order' => 10],
                    ['key' => 'intercom', 'name' => 'Interphone', 'order' => 11],
                    ['key' => 'access_control', 'name' => 'Contrôle d\'accès', 'order' => 12],
                    ['key' => 'wood_fence', 'name' => 'Clôture bois', 'order' => 13],
                    ['key' => 'metal_fence', 'name' => 'Clôture métal', 'order' => 14],
                    ['key' => 'pvc_fence', 'name' => 'Clôture PVC', 'order' => 15],
                    ['key' => 'hedge_fence', 'name' => 'Clôture végétale', 'order' => 16],
                    ['key' => 'gate_motor', 'name' => 'Motorisation portail', 'order' => 17],
                    ['key' => 'remote_control', 'name' => 'Télécommande', 'order' => 18],
                ],
            ],
            [
                'key' => 'outdoor',
                'name' => 'Extérieur',
                'icon' => '🌳',
                'color' => 'bg-gradient-to-br from-green-100 to-emerald-100',
                'order' => 4,
                'subcategories' => [
                    ['key' => 'terrace', 'name' => 'Terrasse', 'order' => 1],
                    ['key' => 'paving', 'name' => 'Pavage', 'order' => 2],
                    ['key' => 'pool', 'name' => 'Piscine', 'order' => 3],
                    ['key' => 'outdoor_lighting', 'name' => 'Éclairage extérieur', 'order' => 4],
                    ['key' => 'drainage', 'name' => 'Drainage', 'order' => 5],
                    ['key' => 'wood_deck', 'name' => 'Terrasse bois', 'order' => 6],
                    ['key' => 'composite_deck', 'name' => 'Terrasse composite', 'order' => 7],
                    ['key' => 'stone_patio', 'name' => 'Terrasse pierre', 'order' => 8],
                    ['key' => 'tile_patio', 'name' => 'Terrasse carrelage', 'order' => 9],
                    ['key' => 'pergola', 'name' => 'Pergola', 'order' => 10],
                    ['key' => 'awning', 'name' => 'Store banne', 'order' => 11],
                    ['key' => 'pool_installation', 'name' => 'Installation piscine', 'order' => 12],
                    ['key' => 'pool_maintenance', 'name' => 'Entretien piscine', 'order' => 13],
                    ['key' => 'pool_liner', 'name' => 'Liner piscine', 'order' => 14],
                    ['key' => 'pool_heating', 'name' => 'Chauffage piscine', 'order' => 15],
                    ['key' => 'outdoor_kitchen', 'name' => 'Cuisine extérieure', 'order' => 16],
                    ['key' => 'garden_shed', 'name' => 'Abri jardin', 'order' => 17],
                    ['key' => 'carport', 'name' => 'Carport', 'order' => 18],
                    ['key' => 'pathway', 'name' => 'Allée', 'order' => 19],
                    ['key' => 'retaining_wall_outdoor', 'name' => 'Muret', 'order' => 20],
                ],
            ],
        ];

        foreach ($categories as $categoryData) {
            $subcategories = $categoryData['subcategories'];
            unset($categoryData['subcategories']);
            
            $categoryId = DB::table('service_categories')->insertGetId([
                'key' => $categoryData['key'],
                'name' => $categoryData['name'],
                'icon' => $categoryData['icon'],
                'color' => $categoryData['color'],
                'order' => $categoryData['order'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            foreach ($subcategories as $subcategory) {
                DB::table('service_subcategories')->insert([
                    'category_id' => $categoryId,
                    'key' => $subcategory['key'],
                    'name' => $subcategory['name'],
                    'order' => $subcategory['order'],
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
