<?php

namespace App\Console\Commands;

use App\Models\Task;
use App\Models\User;
use Illuminate\Console\Command;

class GenerateDailyDemoTasks extends Command
{
    protected $signature = 'demo:generate-tasks';
    protected $description = 'Generate 10 new demo tasks daily for Paris';

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

    private array $winterTaskTemplates = [
        [
            'category' => 'plumber',
            'subcategory' => 'Réparation fuite',
            'titles' => [
                'Fuite d\'eau urgente - radiateur',
                'Réparation chaudière - chauffage faible',
                'Fuite tuyauterie sous évier',
                'Problème de chauffage central',
                'Radiateur qui fuit',
                'Chaudière en panne',
            ],
            'descriptions' => [
                'Bonjour, j\'ai une fuite au niveau du radiateur dans le salon.',
                'Ma chaudière ne chauffe plus correctement depuis hier.',
                'Fuite importante sous l\'évier. Besoin d\'intervention rapide.',
                'Le chauffage central ne fonctionne plus.',
                'Un radiateur fuit dans la chambre, besoin d\'un plombier rapidement.',
                'Ma chaudière s\'éteint toute seule, problème de pression.',
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
                'Problème disjoncteur',
                'Lumières qui clignotent',
                'Prise électrique qui chauffe',
            ],
            'descriptions' => [
                'La moitié de mon appartement n\'a plus d\'électricité.',
                'Besoin d\'installer un radiateur électrique dans une chambre.',
                'Mon tableau électrique est ancien, à remplacer.',
                'Le disjoncteur saute régulièrement.',
                'Plusieurs ampoules clignotent dans l\'appartement.',
                'Une prise électrique chauffe anormalement dans le salon.',
            ],
            'budget' => ['min' => 100, 'max' => 300],
        ],
        [
            'category' => 'installation_repair',
            'subcategory' => 'Entretien chaudière',
            'titles' => [
                'Entretien annuel chaudière',
                'Réparation thermostat',
                'Purge radiateurs',
                'Chaudière bruyante',
                'Réglage chauffage central',
            ],
            'descriptions' => [
                'Entretien annuel de ma chaudière à gaz.',
                'Mon thermostat ne répond plus.',
                'Mes radiateurs ont besoin d\'être purgés.',
                'Ma chaudière fait un bruit anormal.',
                'Le chauffage ne se régule pas correctement.',
            ],
            'budget' => ['min' => 90, 'max' => 180],
        ],
        [
            'category' => 'construction',
            'subcategory' => 'Réparation fenêtre',
            'titles' => [
                'Fenêtre qui ferme mal',
                'Remplacement joint fenêtre',
                'Réparation volet roulant',
                'Installation double vitrage',
                'Fenêtre bloquée',
            ],
            'descriptions' => [
                'Ma fenêtre ferme mal, courant d\'air froid.',
                'Les joints de fenêtres sont usés.',
                'Le volet roulant est bloqué.',
                'Remplacement simple vitrage par double vitrage.',
                'Une fenêtre est bloquée en position ouverte.',
            ],
            'budget' => ['min' => 120, 'max' => 400],
        ],
        [
            'category' => 'cleaning',
            'subcategory' => 'Nettoyage appartement',
            'titles' => [
                'Grand nettoyage d\'hiver',
                'Nettoyage après travaux',
                'Nettoyage vitres',
                'Nettoyage complet',
            ],
            'descriptions' => [
                'Grand nettoyage d\'hiver de mon appartement.',
                'Nettoyage complet après travaux.',
                'Nettoyage des vitres intérieur/extérieur.',
                'Nettoyage complet d\'un T3.',
            ],
            'budget' => ['min' => 60, 'max' => 150],
        ],
        [
            'category' => 'transport',
            'subcategory' => 'Déménagement local',
            'titles' => [
                'Déménagement studio Paris',
                'Aide déménagement',
                'Transport de meubles',
                'Déménagement avec monte-meuble',
            ],
            'descriptions' => [
                'Déménagement studio de 25m² même arrondissement.',
                'Aide pour déménagement 2 pièces, 3ème étage.',
                'Transport de gros meubles uniquement.',
                'Déménagement T2, 5ème étage, monte-meuble nécessaire.',
            ],
            'budget' => ['min' => 150, 'max' => 500],
        ],
        [
            'category' => 'painter',
            'subcategory' => 'Peinture intérieure',
            'titles' => [
                'Peinture chambre',
                'Rafraîchissement salon',
                'Peinture appartement',
                'Reprise peinture',
            ],
            'descriptions' => [
                'Repeindre une chambre de 12m².',
                'Rafraîchir peinture salon et salle à manger.',
                'Peinture complète d\'un T3.',
                'Reprise peinture suite à fuite d\'eau.',
            ],
            'budget' => ['min' => 200, 'max' => 800],
        ],
    ];

    public function handle(): int
    {
        $demoUsers = User::where('email', 'like', '%.demo@prochepro.local')->get();
        
        if ($demoUsers->isEmpty()) {
            $this->error('No demo users found. Run DemoUsersSeeder first.');
            return self::FAILURE;
        }

        $tasksCreated = 0;
        $targetTasks = 10;

        for ($i = 0; $i < $targetTasks; $i++) {
            $template = $this->winterTaskTemplates[array_rand($this->winterTaskTemplates)];
            $randomUser = $demoUsers->random();
            $randomDistrict = $this->parisDistricts[array_rand($this->parisDistricts)];
            $randomTitle = $template['titles'][array_rand($template['titles'])];
            $randomDescription = $template['descriptions'][array_rand($template['descriptions'])];

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
            ]);

            $tasksCreated++;
        }

        $this->info("✅ Generated {$tasksCreated} new demo tasks for Paris");
        return self::SUCCESS;
    }
}
