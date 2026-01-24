<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServiceCategoriesSeeder extends Seeder
{
    public function run(): void
    {
        // Очистити таблиці
        DB::statement('SET FOREIGN_KEY_CHECKS = 0');
        DB::table('service_subcategories')->truncate();
        DB::table('service_categories')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');

        $categories = [
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
                ],
            ],
            [
                'key' => 'garage_gates',
                'name' => 'Garages & portails',
                'icon' => '🚧',
                'color' => 'bg-gradient-to-br from-zinc-100 to-slate-100',
                'order' => 3,
                'subcategories' => [
                    ['key' => 'garage_door', 'name' => 'Porte de garage'],
                    ['key' => 'gate_install', 'name' => 'Installation portail'],
                    ['key' => 'fence', 'name' => 'Clôture'],
                ],
            ],
            [
                'key' => 'outdoor',
                'name' => 'Extérieur',
                'icon' => '🌳',
                'color' => 'bg-gradient-to-br from-green-100 to-emerald-100',
                'order' => 4,
                'subcategories' => [
                    ['key' => 'terrace', 'name' => 'Terrasse'],
                    ['key' => 'paving', 'name' => 'Pavage'],
                    ['key' => 'pool', 'name' => 'Piscine'],
                    ['key' => 'outdoor_lighting', 'name' => 'Éclairage extérieur'],
                ],
            ],
            [
                'key' => 'walls_ceiling',
                'name' => 'Murs & plafonds',
                'icon' => '🧱',
                'color' => 'bg-gradient-to-br from-amber-100 to-yellow-100',
                'order' => 5,
                'subcategories' => [
                    ['key' => 'drywall', 'name' => 'Placo'],
                    ['key' => 'plastering', 'name' => 'Plâtrerie'],
                    ['key' => 'painting', 'name' => 'Peinture'],
                    ['key' => 'wallpaper', 'name' => 'Papier peint'],
                ],
            ],
            [
                'key' => 'electrician',
                'name' => 'Électricien',
                'icon' => '⚡',
                'color' => 'bg-gradient-to-br from-yellow-100 to-amber-100',
                'order' => 6,
                'subcategories' => [
                    ['key' => 'wiring', 'name' => 'Installation électrique'],
                    ['key' => 'panel_upgrade', 'name' => 'Tableau électrique'],
                    ['key' => 'lighting', 'name' => 'Éclairage'],
                    ['key' => 'outlets', 'name' => 'Prises & interrupteurs'],
                ],
            ],
            [
                'key' => 'plumber',
                'name' => 'Plombier',
                'icon' => '🚰',
                'color' => 'bg-gradient-to-br from-blue-100 to-cyan-100',
                'order' => 7,
                'subcategories' => [
                    ['key' => 'pipe_install', 'name' => 'Installation tuyauterie'],
                    ['key' => 'leak_repair', 'name' => 'Réparation fuite'],
                    ['key' => 'bathroom', 'name' => 'Salle de bain'],
                    ['key' => 'heating', 'name' => 'Chauffage'],
                ],
            ],
            [
                'key' => 'painter',
                'name' => 'Peintre',
                'icon' => '🎨',
                'color' => 'bg-gradient-to-br from-pink-100 to-rose-100',
                'order' => 8,
                'subcategories' => [
                    ['key' => 'interior_painting', 'name' => 'Peinture intérieure'],
                    ['key' => 'exterior_painting', 'name' => 'Peinture extérieure'],
                    ['key' => 'wallpaper_install', 'name' => 'Pose papier peint'],
                ],
            ],
            [
                'key' => 'furniture',
                'name' => 'Meubles',
                'icon' => '🛋️',
                'color' => 'bg-gradient-to-br from-brown-100 to-amber-100',
                'order' => 9,
                'subcategories' => [
                    ['key' => 'assembly', 'name' => 'Montage meubles'],
                    ['key' => 'custom_furniture', 'name' => 'Meubles sur mesure'],
                    ['key' => 'repair', 'name' => 'Réparation'],
                ],
            ],
            [
                'key' => 'automotive',
                'name' => 'Automobile',
                'icon' => '🚗',
                'color' => 'bg-gradient-to-br from-red-100 to-pink-100',
                'order' => 10,
                'subcategories' => [
                    ['key' => 'mechanic', 'name' => 'Mécanique'],
                    ['key' => 'bodywork', 'name' => 'Carrosserie'],
                    ['key' => 'maintenance', 'name' => 'Entretien'],
                ],
            ],
            [
                'key' => 'garden',
                'name' => 'Jardin',
                'icon' => '🌿',
                'color' => 'bg-gradient-to-br from-lime-100 to-green-100',
                'order' => 11,
                'subcategories' => [
                    ['key' => 'gardening', 'name' => 'Jardinage'],
                    ['key' => 'tree_pruning', 'name' => 'Élagage'],
                    ['key' => 'lawn_care', 'name' => 'Entretien pelouse'],
                ],
            ],
            [
                'key' => 'events',
                'name' => 'Événements',
                'icon' => '🎉',
                'color' => 'bg-gradient-to-br from-purple-100 to-pink-100',
                'order' => 12,
                'subcategories' => [
                    ['key' => 'wedding', 'name' => 'Mariage'],
                    ['key' => 'party', 'name' => 'Fête'],
                    ['key' => 'catering', 'name' => 'Traiteur'],
                ],
            ],
            [
                'key' => 'projects',
                'name' => 'Projets',
                'icon' => '📝',
                'color' => 'bg-gradient-to-br from-indigo-100 to-blue-100',
                'order' => 13,
                'subcategories' => [
                    ['key' => 'planning', 'name' => 'Planification'],
                    ['key' => 'consulting', 'name' => 'Conseil'],
                ],
            ],
            [
                'key' => 'cleaning',
                'name' => 'Nettoyage',
                'icon' => '🧹',
                'color' => 'bg-gradient-to-br from-cyan-100 to-sky-100',
                'order' => 14,
                'subcategories' => [
                    ['key' => 'regular', 'name' => 'Ménage régulier'],
                    ['key' => 'deep_cleaning', 'name' => 'Grand ménage'],
                    ['key' => 'after_work', 'name' => 'Après travaux'],
                ],
            ],
            [
                'key' => 'education',
                'name' => 'Formation',
                'icon' => '📚',
                'color' => 'bg-gradient-to-br from-blue-100 to-indigo-100',
                'order' => 15,
                'subcategories' => [
                    ['key' => 'tutoring', 'name' => 'Soutien scolaire'],
                    ['key' => 'language', 'name' => 'Cours de langue'],
                    ['key' => 'music', 'name' => 'Cours de musique'],
                ],
            ],
            [
                'key' => 'transport',
                'name' => 'Transport',
                'icon' => '🚚',
                'color' => 'bg-gradient-to-br from-orange-100 to-amber-100',
                'order' => 16,
                'subcategories' => [
                    ['key' => 'moving', 'name' => 'Déménagement'],
                    ['key' => 'delivery', 'name' => 'Livraison'],
                    ['key' => 'furniture_transport', 'name' => 'Transport meubles'],
                ],
            ],
            [
                'key' => 'business',
                'name' => 'Entreprises',
                'icon' => '🏢',
                'color' => 'bg-gradient-to-br from-slate-100 to-zinc-100',
                'order' => 17,
                'subcategories' => [
                    ['key' => 'consulting', 'name' => 'Conseil'],
                    ['key' => 'accounting', 'name' => 'Comptabilité'],
                ],
            ],
            [
                'key' => 'installation_repair',
                'name' => 'Réparation',
                'icon' => '🛠️',
                'color' => 'bg-gradient-to-br from-gray-100 to-slate-100',
                'order' => 18,
                'subcategories' => [
                    ['key' => 'appliance', 'name' => 'Électroménager'],
                    ['key' => 'electronics', 'name' => 'Électronique'],
                ],
            ],
            [
                'key' => 'financial',
                'name' => 'Finance',
                'icon' => '💰',
                'color' => 'bg-gradient-to-br from-green-100 to-emerald-100',
                'order' => 19,
                'subcategories' => [
                    ['key' => 'accounting', 'name' => 'Comptabilité'],
                    ['key' => 'tax', 'name' => 'Fiscalité'],
                ],
            ],
            [
                'key' => 'legal',
                'name' => 'Juridique',
                'icon' => '⚖️',
                'color' => 'bg-gradient-to-br from-blue-100 to-cyan-100',
                'order' => 20,
                'subcategories' => [
                    ['key' => 'legal_advice', 'name' => 'Conseil juridique'],
                    ['key' => 'contracts', 'name' => 'Rédaction contrats'],
                ],
            ],
            [
                'key' => 'remote',
                'name' => 'À distance',
                'icon' => '💻',
                'color' => 'bg-gradient-to-br from-purple-100 to-violet-100',
                'order' => 21,
                'subcategories' => [
                    ['key' => 'virtual_assistant', 'name' => 'Assistant virtuel'],
                    ['key' => 'data_entry', 'name' => 'Saisie de données'],
                ],
            ],
            [
                'key' => 'health_beauty',
                'name' => 'Beauté & bien-être',
                'icon' => '💅',
                'color' => 'bg-gradient-to-br from-pink-100 to-fuchsia-100',
                'order' => 22,
                'subcategories' => [
                    ['key' => 'hairdressing', 'name' => 'Coiffure'],
                    ['key' => 'beauty', 'name' => 'Esthétique'],
                    ['key' => 'massage', 'name' => 'Massage'],
                ],
            ],
            [
                'key' => 'childcare',
                'name' => 'Garde d\'enfants',
                'icon' => '👶',
                'color' => 'bg-gradient-to-br from-yellow-100 to-orange-100',
                'order' => 23,
                'subcategories' => [
                    ['key' => 'babysitting', 'name' => 'Baby-sitting'],
                    ['key' => 'nanny', 'name' => 'Nounou'],
                ],
            ],
            [
                'key' => 'pets',
                'name' => 'Animaux',
                'icon' => '🐾',
                'color' => 'bg-gradient-to-br from-lime-100 to-emerald-100',
                'order' => 24,
                'subcategories' => [
                    ['key' => 'pet_sitting', 'name' => 'Garde d\'animaux'],
                    ['key' => 'grooming', 'name' => 'Toilettage'],
                    ['key' => 'walking', 'name' => 'Promenade'],
                ],
            ],
            [
                'key' => 'elderly_care',
                'name' => 'Aide aux seniors',
                'icon' => '🧓',
                'color' => 'bg-gradient-to-br from-teal-100 to-cyan-100',
                'order' => 25,
                'subcategories' => [
                    ['key' => 'home_care', 'name' => 'Aide à domicile'],
                    ['key' => 'companionship', 'name' => 'Compagnie'],
                ],
            ],
            [
                'key' => 'it_web',
                'name' => 'Informatique & web',
                'icon' => '💻',
                'color' => 'bg-gradient-to-br from-blue-100 to-indigo-100',
                'order' => 26,
                'subcategories' => [
                    ['key' => 'web_dev', 'name' => 'Développement web'],
                    ['key' => 'it_support', 'name' => 'Dépannage informatique'],
                    ['key' => 'seo', 'name' => 'Référencement'],
                ],
            ],
            [
                'key' => 'delivery',
                'name' => 'Livraison',
                'icon' => '📦',
                'color' => 'bg-gradient-to-br from-orange-100 to-red-100',
                'order' => 27,
                'subcategories' => [
                    ['key' => 'package', 'name' => 'Colis'],
                    ['key' => 'food', 'name' => 'Repas'],
                ],
            ],
            [
                'key' => 'other',
                'name' => 'Autre',
                'icon' => '📋',
                'color' => 'bg-gradient-to-br from-gray-100 to-slate-100',
                'order' => 28,
                'subcategories' => [
                    ['key' => 'other', 'name' => 'Autre service'],
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
        }
    }
}
