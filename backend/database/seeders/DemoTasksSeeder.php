<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoTasksSeeder extends Seeder
{
    /**
     * Paris districts for demo tasks
     */
    private array $parisDistricts = [
        ['code' => '75001', 'name' => '1er Arrondissement', 'zone' => 'Centre'],
        ['code' => '75004', 'name' => '4e Arrondissement', 'zone' => 'Centre'],
        ['code' => '75007', 'name' => '7e Arrondissement', 'zone' => 'Ouest'],
        ['code' => '75009', 'name' => '9e Arrondissement', 'zone' => 'Nord'],
        ['code' => '75011', 'name' => '11e Arrondissement', 'zone' => 'Est'],
        ['code' => '75012', 'name' => '12e Arrondissement', 'zone' => 'Est'],
        ['code' => '75015', 'name' => '15e Arrondissement', 'zone' => 'Ouest'],
        ['code' => '75018', 'name' => '18e Arrondissement', 'zone' => 'Nord'],
    ];

    /**
     * Winter 2026 seasonal task templates
     */
    private array $winterTaskTemplates = [
        [
            'category' => 'plumber',
            'subcategory' => 'Réparation fuite',
            'titles' => [
                'Fuite d\'eau urgente - radiateur',
                'Réparation chaudière - chauffage faible',
                'Fuite tuyauterie sous évier',
                'Problème de chauffage central',
            ],
            'descriptions' => [
                'Bonjour, j\'ai une fuite au niveau du radiateur dans le salon. C\'est urgent car l\'eau coule sur le parquet.',
                'Ma chaudière ne chauffe plus correctement depuis hier. La température ne monte pas au-dessus de 15°C.',
                'Fuite importante sous l\'évier de la cuisine. Besoin d\'intervention rapide.',
                'Le chauffage central ne fonctionne plus. Toute la maison est froide.',
            ],
            'budget' => ['min' => 80, 'max' => 200],
        ],
        [
            'category' => 'electrician',
            'subcategory' => 'Réparation électrique',
            'titles' => [
                'Panne électrique partielle',
                'Installation radiateur électrique',
                'Remplacement tableau électrique',
                'Problème disjoncteur - cuisine',
            ],
            'descriptions' => [
                'La moitié de mon appartement n\'a plus d\'électricité. Le disjoncteur ne se réenclenche pas.',
                'Besoin d\'installer un radiateur électrique supplémentaire dans une chambre.',
                'Mon tableau électrique est ancien, je souhaite le remplacer aux normes actuelles.',
                'Le disjoncteur de la cuisine saute régulièrement, surtout quand j\'utilise le four.',
            ],
            'budget' => ['min' => 100, 'max' => 300],
        ],
        [
            'category' => 'installation_repair',
            'subcategory' => 'Entretien chaudière',
            'titles' => [
                'Entretien annuel chaudière gaz',
                'Réparation thermostat',
                'Purge radiateurs',
                'Chaudière bruyante',
            ],
            'descriptions' => [
                'Je cherche un professionnel pour l\'entretien annuel de ma chaudière à gaz.',
                'Mon thermostat ne répond plus. La température est bloquée.',
                'Mes radiateurs ont besoin d\'être purgés, ils ne chauffent pas uniformément.',
                'Ma chaudière fait un bruit anormal depuis quelques jours.',
            ],
            'budget' => ['min' => 90, 'max' => 180],
        ],
        [
            'category' => 'construction',
            'subcategory' => 'Réparation fenêtre',
            'titles' => [
                'Fenêtre qui ferme mal - courant d\'air',
                'Remplacement joint fenêtre',
                'Réparation volet roulant',
                'Installation double vitrage',
            ],
            'descriptions' => [
                'Ma fenêtre du salon ferme mal, beaucoup de courant d\'air froid entre.',
                'Les joints de mes fenêtres sont usés, l\'air froid passe. Besoin de remplacement.',
                'Le volet roulant de ma chambre est bloqué en position haute.',
                'Je souhaite remplacer mes fenêtres simple vitrage par du double vitrage.',
            ],
            'budget' => ['min' => 120, 'max' => 400],
        ],
        [
            'category' => 'cleaning',
            'subcategory' => 'Nettoyage appartement',
            'titles' => [
                'Grand nettoyage d\'hiver',
                'Nettoyage après travaux',
                'Nettoyage vitres et sols',
                'Nettoyage complet 3 pièces',
            ],
            'descriptions' => [
                'Je recherche quelqu\'un pour un grand nettoyage d\'hiver de mon appartement.',
                'Suite à des travaux de peinture, j\'ai besoin d\'un nettoyage complet.',
                'Nettoyage des vitres intérieur/extérieur et sols pour un appartement de 60m².',
                'Nettoyage complet d\'un T3 : cuisine, salle de bain, chambres.',
            ],
            'budget' => ['min' => 60, 'max' => 150],
        ],
        [
            'category' => 'transport',
            'subcategory' => 'Déménagement local',
            'titles' => [
                'Déménagement studio - Paris intra-muros',
                'Aide déménagement 2 pièces',
                'Transport de meubles',
                'Déménagement T2 avec monte-meuble',
            ],
            'descriptions' => [
                'Déménagement d\'un studio de 25m² dans le même arrondissement. Peu de meubles.',
                'Besoin d\'aide pour déménager un appartement 2 pièces, 3ème étage sans ascenseur.',
                'Transport de quelques gros meubles uniquement (canapé, lit, armoire).',
                'Déménagement T2 du 5ème étage, monte-meuble nécessaire.',
            ],
            'budget' => ['min' => 150, 'max' => 500],
        ],
        [
            'category' => 'painter',
            'subcategory' => 'Peinture intérieure',
            'titles' => [
                'Peinture chambre avant l\'hiver',
                'Rafraîchissement salon',
                'Peinture appartement complet',
                'Reprise peinture suite fuite',
            ],
            'descriptions' => [
                'Je souhaite repeindre une chambre de 12m² avant les grands froids.',
                'Besoin de rafraîchir la peinture du salon et de la salle à manger.',
                'Peinture complète d\'un T3 : toutes les pièces et le couloir.',
                'Suite à une fuite d\'eau, besoin de reprendre la peinture du plafond et d\'un mur.',
            ],
            'budget' => ['min' => 200, 'max' => 800],
        ],
    ];

    public function run(): void
    {
        // Get demo users
        $demoUsers = User::where('email', 'like', '%.demo@prochepro.local')->get();
        
        if ($demoUsers->isEmpty()) {
            $this->command->warn('⚠️  No demo users found. Run DemoUsersSeeder first.');
            return;
        }

        // Delete old generated tasks
        Task::where('is_generated', true)->delete();

        $tasksCreated = 0;
        $targetTasks = 30;

        // Create ~30 demo tasks
        while ($tasksCreated < $targetTasks) {
            foreach ($this->winterTaskTemplates as $template) {
                if ($tasksCreated >= $targetTasks) {
                    break;
                }

                $randomUser = $demoUsers->random();
                $randomDistrict = $this->parisDistricts[array_rand($this->parisDistricts)];
                $randomTitle = $template['titles'][array_rand($template['titles'])];
                $randomDescription = $template['descriptions'][array_rand($template['descriptions'])];

                // Random creation time within last 24 hours
                $createdAt = now()->subHours(rand(1, 24));

                Task::create([
                    'client_id' => $randomUser->id,
                    'title' => $randomTitle,
                    'description' => $randomDescription,
                    'category' => $template['category'],
                    'subcategory' => $template['subcategory'],
                    'budget_min' => $template['budget']['min'] + rand(0, 20),
                    'budget_max' => $template['budget']['max'] + rand(0, 50),
                    'location_type' => 'on_site',
                    'city' => 'Paris',
                    'district_code' => $randomDistrict['code'],
                    'district_name' => $randomDistrict['name'],
                    'zone' => $randomDistrict['zone'],
                    'status' => 'published',
                    'is_generated' => true,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);

                $tasksCreated++;
            }
        }

        $this->command->info("✅ Created {$tasksCreated} demo winter tasks for Paris");
    }
}
