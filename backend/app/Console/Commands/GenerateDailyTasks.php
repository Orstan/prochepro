<?php

namespace App\Console\Commands;

use App\Models\Task;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class GenerateDailyTasks extends Command
{
    protected $signature = 'tasks:generate-daily {--count=20 : Number of tasks to generate}';
    protected $description = 'Generate realistic daily tasks for winter season (January 2026)';

    /**
     * Winter-appropriate task templates (realistic for Paris in January)
     * Using correct category/subcategory keys from frontend
     */
    private array $winterTasks = [
        // Plumbing (40% - high demand in winter)
        ['category' => 'plumbing', 'subcategory' => 'leak_repair', 'title' => 'Urgence fuite radiateur', 'description' => 'Mon radiateur fuit depuis ce matin, besoin intervention rapide', 'budget_min' => 80, 'budget_max' => 150],
        ['category' => 'heating', 'subcategory' => 'boiler_repair', 'title' => 'Problème chauffage appartement', 'description' => 'Plus de chauffage depuis hier soir, chaudière ne démarre pas', 'budget_min' => 120, 'budget_max' => 250],
        ['category' => 'plumbing', 'subcategory' => 'drain_cleaning', 'title' => 'Évier cuisine bouché', 'description' => 'Évier complètement bouché, eau ne s\'écoule plus', 'budget_min' => 60, 'budget_max' => 120],
        ['category' => 'plumbing', 'subcategory' => 'faucet_repair', 'title' => 'Robinet qui goutte', 'description' => 'Robinet salle de bain goutte en permanence', 'budget_min' => 50, 'budget_max' => 90],
        ['category' => 'plumbing', 'subcategory' => 'leak_repair', 'title' => 'Fuite tuyauterie salle de bain', 'description' => 'Fuite sous lavabo, besoin réparation urgente', 'budget_min' => 70, 'budget_max' => 140],
        ['category' => 'heating', 'subcategory' => 'boiler_maintenance', 'title' => 'Entretien chaudière gaz', 'description' => 'Besoin entretien annuel chaudière gaz', 'budget_min' => 100, 'budget_max' => 180],
        ['category' => 'heating', 'subcategory' => 'radiator_repair', 'title' => 'Radiateur ne chauffe pas', 'description' => 'Un radiateur chambre ne chauffe plus du tout', 'budget_min' => 70, 'budget_max' => 140],
        
        // Electricity (20%)
        ['category' => 'electricity', 'subcategory' => 'lighting', 'title' => 'Installation spots LED salon', 'description' => 'Installer 6 spots LED encastrables au plafond', 'budget_min' => 150, 'budget_max' => 300],
        ['category' => 'electricity', 'subcategory' => 'electrical_fault', 'title' => 'Disjoncteur qui saute', 'description' => 'Disjoncteur général saute régulièrement, recherche panne', 'budget_min' => 80, 'budget_max' => 160],
        ['category' => 'electricity', 'subcategory' => 'socket_installation', 'title' => 'Ajout prises électriques', 'description' => 'Ajouter 3 prises dans la chambre', 'budget_min' => 100, 'budget_max' => 200],
        ['category' => 'electricity', 'subcategory' => 'panel_replacement', 'title' => 'Remplacement tableau électrique', 'description' => 'Tableau électrique ancien, besoin mise aux normes', 'budget_min' => 400, 'budget_max' => 800],
        
        // Carpentry/Handyman (15%)
        ['category' => 'carpentry', 'subcategory' => 'furniture_assembly', 'title' => 'Montage meubles IKEA', 'description' => 'Montage armoire PAX 3 portes + commode', 'budget_min' => 60, 'budget_max' => 120],
        ['category' => 'carpentry', 'subcategory' => 'shelf_installation', 'title' => 'Installation étagères murales', 'description' => 'Fixer 5 étagères murales dans salon', 'budget_min' => 50, 'budget_max' => 100],
        ['category' => 'carpentry', 'subcategory' => 'door_repair', 'title' => 'Réparation porte entrée', 'description' => 'Porte entrée ferme mal, ajustement gonds', 'budget_min' => 60, 'budget_max' => 110],
        ['category' => 'carpentry', 'subcategory' => 'custom_furniture', 'title' => 'Divers petits travaux maison', 'description' => 'Fixations murales, ajustements portes, petites réparations', 'budget_min' => 80, 'budget_max' => 150],
        
        // Cleaning (10%)
        ['category' => 'cleaning', 'subcategory' => 'deep_cleaning', 'title' => 'Grand ménage après fêtes', 'description' => 'Nettoyage complet appartement 60m² après période des fêtes', 'budget_min' => 80, 'budget_max' => 150],
        ['category' => 'cleaning', 'subcategory' => 'window_cleaning', 'title' => 'Nettoyage vitres appartement', 'description' => 'Nettoyage intérieur/extérieur 8 fenêtres', 'budget_min' => 60, 'budget_max' => 100],
        ['category' => 'cleaning', 'subcategory' => 'regular_cleaning', 'title' => 'Ménage régulier 2x/semaine', 'description' => 'Cherche personne ménage 2x par semaine, 3h à chaque fois', 'budget_min' => 50, 'budget_max' => 90],
        
        // Transport/Moving (8%)
        ['category' => 'transport', 'subcategory' => 'moving', 'title' => 'Déménagement studio', 'description' => 'Déménagement studio 25m² dans même quartier', 'budget_min' => 150, 'budget_max' => 300],
        ['category' => 'transport', 'subcategory' => 'furniture_transport', 'title' => 'Transport canapé', 'description' => 'Transport canapé 3 places acheté chez particulier', 'budget_min' => 60, 'budget_max' => 120],
        ['category' => 'transport', 'subcategory' => 'delivery', 'title' => 'Livraison meubles', 'description' => 'Récupérer et livrer table + 4 chaises', 'budget_min' => 50, 'budget_max' => 100],
        
        // Painting/Renovation (5%)
        ['category' => 'painting', 'subcategory' => 'interior_painting', 'title' => 'Peinture chambre 15m²', 'description' => 'Repeindre chambre, fournitures incluses', 'budget_min' => 200, 'budget_max' => 400],
        ['category' => 'painting', 'subcategory' => 'wallpaper', 'title' => 'Rafraîchissement salon', 'description' => 'Peinture + petites réparations plâtre salon 25m²', 'budget_min' => 350, 'budget_max' => 650],
        
        // IT/Computer (2%)
        ['category' => 'installation_repair', 'subcategory' => 'computer_repair', 'title' => 'PC lent après Noël', 'description' => 'Ordinateur très lent depuis installation nouveaux logiciels', 'budget_min' => 40, 'budget_max' => 80],
        ['category' => 'installation_repair', 'subcategory' => 'laptop_repair', 'title' => 'Configuration nouvel ordinateur', 'description' => 'Configuration et transfert données ancien PC vers nouveau', 'budget_min' => 60, 'budget_max' => 120],
    ];

    /**
     * Paris districts for random assignment
     */
    private array $parisDistricts = [
        ['code' => '75001', 'name' => '1er arrondissement', 'zone' => 'Centre'],
        ['code' => '75002', 'name' => '2ème arrondissement', 'zone' => 'Centre'],
        ['code' => '75003', 'name' => '3ème arrondissement', 'zone' => 'Centre'],
        ['code' => '75004', 'name' => '4ème arrondissement', 'zone' => 'Centre'],
        ['code' => '75005', 'name' => '5ème arrondissement', 'zone' => 'Centre'],
        ['code' => '75006', 'name' => '6ème arrondissement', 'zone' => 'Centre'],
        ['code' => '75007', 'name' => '7ème arrondissement', 'zone' => 'Ouest'],
        ['code' => '75008', 'name' => '8ème arrondissement', 'zone' => 'Ouest'],
        ['code' => '75009', 'name' => '9ème arrondissement', 'zone' => 'Nord'],
        ['code' => '75010', 'name' => '10ème arrondissement', 'zone' => 'Nord'],
        ['code' => '75011', 'name' => '11ème arrondissement', 'zone' => 'Est'],
        ['code' => '75012', 'name' => '12ème arrondissement', 'zone' => 'Est'],
        ['code' => '75013', 'name' => '13ème arrondissement', 'zone' => 'Sud'],
        ['code' => '75014', 'name' => '14ème arrondissement', 'zone' => 'Sud'],
        ['code' => '75015', 'name' => '15ème arrondissement', 'zone' => 'Ouest'],
        ['code' => '75016', 'name' => '16ème arrondissement', 'zone' => 'Ouest'],
        ['code' => '75017', 'name' => '17ème arrondissement', 'zone' => 'Nord-Ouest'],
        ['code' => '75018', 'name' => '18ème arrondissement', 'zone' => 'Nord'],
        ['code' => '75019', 'name' => '19ème arrondissement', 'zone' => 'Nord-Est'],
        ['code' => '75020', 'name' => '20ème arrondissement', 'zone' => 'Est'],
    ];

    public function handle()
    {
        $count = (int) $this->option('count');
        
        // Get a bot user for generated tasks (or create one)
        $botUser = User::firstOrCreate(
            ['email' => 'bot@prochepro.fr'],
            [
                'name' => 'ProchePro Bot',
                'password' => bcrypt(bin2hex(random_bytes(16))),
                'role' => 'client',
            ]
        );
        
        $this->info("Generating {$count} realistic winter tasks...");
        
        $generated = 0;
        $today = now();
        
        for ($i = 0; $i < $count; $i++) {
            // Pick random task template
            $template = $this->winterTasks[array_rand($this->winterTasks)];
            
            // Pick random district
            $district = $this->parisDistricts[array_rand($this->parisDistricts)];
            
            // Random time during the day (8am - 8pm)
            $hoursAgo = rand(0, 12);
            $minutesAgo = rand(0, 59);
            $createdAt = $today->copy()->subHours($hoursAgo)->subMinutes($minutesAgo);
            
            // Create task
            Task::create([
                'client_id' => $botUser->id,
                'title' => $template['title'] . ' - ' . substr($district['name'], 0, strpos($district['name'], ' ')),
                'description' => $template['description'],
                'budget_min' => $template['budget_min'],
                'budget_max' => $template['budget_max'],
                'location_type' => 'on_site',
                'category' => $template['category'],
                'subcategory' => $template['subcategory'],
                'city' => 'Paris',
                'district_code' => $district['code'],
                'district_name' => $district['name'],
                'zone' => $district['zone'],
                'status' => 'published',
                'is_generated' => true,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
            
            $generated++;
        }
        
        $this->info("✅ Successfully generated {$generated} realistic tasks!");
        
        // Show statistics
        $totalPublished = Task::where('status', 'published')->count();
        $totalGenerated = Task::where('is_generated', true)->where('status', 'published')->count();
        $totalReal = $totalPublished - $totalGenerated;
        
        $this->info("\n📊 Current statistics:");
        $this->info("   Total published tasks: {$totalPublished}");
        $this->info("   Generated tasks: {$totalGenerated}");
        $this->info("   Real user tasks: {$totalReal}");
        
        return 0;
    }
}
