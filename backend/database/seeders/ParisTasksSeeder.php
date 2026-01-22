<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ParisTasksSeeder extends Seeder
{
    private array $arrondissements = [
        '1er arrondissement' => ['75001', 'Louvre'],
        '2e arrondissement' => ['75002', 'Bourse'],
        '3e arrondissement' => ['75003', 'Temple'],
        '4e arrondissement' => ['75004', 'Hôtel-de-Ville'],
        '5e arrondissement' => ['75005', 'Panthéon'],
        '6e arrondissement' => ['75006', 'Luxembourg'],
        '7e arrondissement' => ['75007', 'Palais-Bourbon'],
        '8e arrondissement' => ['75008', 'Élysée'],
        '9e arrondissement' => ['75009', 'Opéra'],
        '10e arrondissement' => ['75010', 'Entrepôt'],
        '11e arrondissement' => ['75011', 'Popincourt'],
        '12e arrondissement' => ['75012', 'Reuilly'],
        '13e arrondissement' => ['75013', 'Gobelins'],
        '14e arrondissement' => ['75014', 'Observatoire'],
        '15e arrondissement' => ['75015', 'Vaugirard'],
        '16e arrondissement' => ['75016', 'Passy'],
        '17e arrondissement' => ['75017', 'Batignolles-Monceau'],
        '18e arrondissement' => ['75018', 'Butte-Montmartre'],
        '19e arrondissement' => ['75019', 'Buttes-Chaumont'],
        '20e arrondissement' => ['75020', 'Ménilmontant'],
    ];

    private array $tasks = [
        // Plomberie (plumbing)
        [
            'category' => 'plumbing',
            'subcategory' => 'leak_repair',
            'titles' => [
                'Fuite d\'eau sous l\'évier de cuisine à réparer d\'urgence',
                'Robinet qui goutte dans la salle de bain',
                'Fuite au niveau du chauffe-eau',
                'Réparation de fuite dans les toilettes',
                'Fuite d\'eau derrière le lave-vaisselle',
            ],
            'descriptions' => [
                'Bonjour, j\'ai une fuite d\'eau importante sous mon évier. L\'eau coule continuellement et j\'ai dû couper l\'arrivée d\'eau. Besoin d\'une intervention rapide.',
                'Mon robinet goutte sans arrêt depuis quelques jours. C\'est gênant et ça augmente ma facture d\'eau.',
                'Le chauffe-eau fuit légèrement. Je cherche un plombier pour diagnostiquer et réparer.',
            ],
        ],
        [
            'category' => 'plumbing',
            'subcategory' => 'installation',
            'titles' => [
                'Installation d\'un nouveau lave-linge',
                'Pose d\'un lavabo dans une nouvelle salle de bain',
                'Installation de robinetterie moderne',
                'Remplacement de la chasse d\'eau',
                'Installation d\'un évier double bac',
            ],
            'descriptions' => [
                'Je viens d\'acheter un nouveau lave-linge et j\'ai besoin d\'aide pour le brancher correctement.',
                'Rénovation de salle de bain en cours. Besoin d\'installer un lavabo suspendu.',
                'Je souhaite remplacer mes anciens robinets par des modèles plus modernes.',
            ],
        ],

        // Électricité (electricity)
        [
            'category' => 'electricity',
            'subcategory' => 'installation',
            'titles' => [
                'Installation de prises électriques supplémentaires',
                'Pose de spots LED au plafond',
                'Installation d\'un lustre dans le salon',
                'Ajout de prises USB murales',
                'Installation d\'interrupteurs va-et-vient',
            ],
            'descriptions' => [
                'J\'ai besoin d\'installer 3 prises supplémentaires dans mon bureau. Murs en placo.',
                'Je voudrais installer 8 spots LED encastrables dans mon salon. Plafond suspendu existant.',
                'Installation d\'un lustre lourd (environ 15kg) au centre du salon.',
            ],
        ],
        [
            'category' => 'electricity',
            'subcategory' => 'repair',
            'titles' => [
                'Disjoncteur qui saute régulièrement',
                'Prise électrique qui ne fonctionne plus',
                'Interrupteur défectueux à remplacer',
                'Problème de lumière clignotante',
                'Court-circuit dans une chambre',
            ],
            'descriptions' => [
                'Mon disjoncteur principal saute plusieurs fois par jour sans raison apparente. Besoin d\'un diagnostic.',
                'Une prise murale ne fonctionne plus du tout. Urgent car c\'est pour mon réfrigérateur.',
                'Un interrupteur ne répond plus. La lumière reste allumée en permanence.',
            ],
        ],

        // Nettoyage (cleaning)
        [
            'category' => 'cleaning',
            'subcategory' => 'deep_cleaning',
            'titles' => [
                'Grand ménage après travaux de rénovation',
                'Nettoyage approfondi d\'un appartement 3 pièces',
                'Nettoyage de fin de bail complet',
                'Remise en état après déménagement',
                'Nettoyage post-chantier',
            ],
            'descriptions' => [
                'Appartement de 75m² vient d\'être rénové. Il reste beaucoup de poussière et traces de peinture partout.',
                'Je quitte mon appartement le mois prochain. Besoin d\'un nettoyage complet pour récupérer ma caution.',
                'Les anciens locataires sont partis en laissant l\'appartement sale. Besoin d\'une remise en état complète.',
            ],
        ],
        [
            'category' => 'cleaning',
            'subcategory' => 'regular_cleaning',
            'titles' => [
                'Ménage hebdomadaire pour appartement 2 pièces',
                'Entretien régulier tous les 15 jours',
                'Ménage bi-mensuel maison 4 pièces',
                'Nettoyage récurrent studio étudiant',
                'Entretien mensuel appartement',
            ],
            'descriptions' => [
                'Cherche personne de confiance pour ménage régulier chaque semaine. Appartement bien entretenu.',
                'Besoin d\'aide pour l\'entretien de ma maison toutes les deux semaines (aspirateur, sols, poussière).',
                'Studio de 30m² à nettoyer deux fois par mois. Travail simple et rapide.',
            ],
        ],

        // Isolation et étanchéité (winter tasks)
        [
            'category' => 'carpentry',
            'subcategory' => 'insulation',
            'titles' => [
                'Isolation de fenêtres pour l\'hiver',
                'Calfeutrage de portes et fenêtres',
                'Isolation de combles perdus',
                'Pose de joints d\'étanchéité',
                'Remplacement de vitrage simple par double',
            ],
            'descriptions' => [
                'Mes fenêtres laissent passer beaucoup de froid. Besoin d\'isolation urgente.',
                'Il y a des courants d\'air partout. Je voudrais calfeutrer portes et fenêtres.',
                'Mes combles ne sont pas isolés. Je perds beaucoup de chaleur.',
            ],
        ],
        [
            'category' => 'carpentry',
            'subcategory' => 'winter_repair',
            'titles' => [
                'Réparation de volets endommagés par le vent',
                'Remplacement de vitres cassées',
                'Réparation de porte d\'entrée qui ferme mal',
                'Changement de joints de fenêtres usés',
                'Réparation de balcon exposé aux intempéries',
            ],
            'descriptions' => [
                'Un volet s\'est décroché avec le vent. Besoin de réparation rapide.',
                'Une vitre de ma fenêtre s\'est fissurée. Remplacement urgent.',
                'Ma porte d\'entrée ne ferme plus correctement depuis le froid.',
            ],
        ],
        [
            'category' => 'masonry',
            'subcategory' => 'waterproofing',
            'titles' => [
                'Traitement d\'infiltration d\'eau',
                'Réparation de fissures avant les pluies',
                'Étanchéité de terrasse ou balcon',
                'Réparation de gouttières qui fuient',
                'Imperméabilisation de mur extérieur',
            ],
            'descriptions' => [
                'J\'ai des infiltrations d\'eau dans ma cave quand il pleut beaucoup.',
                'Des fissures sur le mur extérieur laissent passer l\'humidité.',
                'Mon balcon n\'est plus étanche. L\'eau s\'infiltre chez le voisin du dessous.',
            ],
        ],

        // Déménagement (moving)
        [
            'category' => 'moving',
            'subcategory' => 'full_service',
            'titles' => [
                'Déménagement complet appartement 3 pièces',
                'Déménagement studio étudiant',
                'Déménagement maison 100m²',
                'Déménagement avec meubles lourds',
                'Déménagement appartement duplex',
            ],
            'descriptions' => [
                'Déménagement du 15e au 11e arrondissement. Appartement 60m² au 3ème sans ascenseur.',
                'Studio de 25m² à déménager. Peu de meubles mais 3ème étage sans ascenseur.',
                'Maison de 100m² avec cave et garage. Beaucoup de cartons et meubles encombrants.',
            ],
        ],
        [
            'category' => 'moving',
            'subcategory' => 'help_moving',
            'titles' => [
                'Aide au déménagement (j\'ai le camion)',
                'Besoin de bras pour porter des meubles',
                'Aide pour charger/décharger un camion',
                'Portage de meubles lourds',
                'Assistance déménagement quelques heures',
            ],
            'descriptions' => [
                'J\'ai loué un camion mais j\'ai besoin d\'aide pour porter les meubles. 2-3 heures de travail.',
                'Besoin d\'une personne forte pour m\'aider à descendre un canapé du 4ème étage.',
                'Déménagement déjà organisé mais besoin d\'un coup de main pour charger le camion.',
            ],
        ],

        // Peinture (painting)
        [
            'category' => 'painting',
            'subcategory' => 'interior',
            'titles' => [
                'Peinture complète appartement 2 pièces',
                'Rafraîchissement peinture salon',
                'Peinture chambre d\'enfant avec motifs',
                'Peinture cuisine et salle de bain',
                'Repeindre un couloir et l\'entrée',
            ],
            'descriptions' => [
                'Appartement de 45m² à repeindre entièrement. Murs en bon état.',
                'Salon de 25m² à rafraîchir. Peinture blanche simple.',
                'Chambre de 12m² à peindre en couleur avec quelques motifs pour enfant.',
            ],
        ],
        [
            'category' => 'painting',
            'subcategory' => 'exterior',
            'titles' => [
                'Peinture de façade d\'immeuble',
                'Ravalement et peinture extérieure',
                'Peinture de portail et grille',
                'Peinture balcon et garde-corps',
                'Peinture volets extérieurs',
            ],
            'descriptions' => [
                'Façade de petite maison à repeindre. Environ 40m² de surface.',
                'Portail en fer forgé à décaper et repeindre. Travail soigné demandé.',
                'Balcon avec garde-corps en métal à repeindre. Préparation nécessaire.',
            ],
        ],

        // Menuiserie (carpentry)
        [
            'category' => 'carpentry',
            'subcategory' => 'furniture',
            'titles' => [
                'Montage de meubles IKEA',
                'Fabrication d\'étagères sur mesure',
                'Création d\'un dressing sur mesure',
                'Montage de cuisine complète',
                'Réparation de meubles anciens',
            ],
            'descriptions' => [
                'J\'ai acheté plusieurs meubles IKEA (armoire, commode, bureau). Besoin d\'aide pour le montage.',
                'Je voudrais des étagères sur mesure dans mon salon. Bois massif de préférence.',
                'Création d\'un dressing sur mesure dans une chambre de 3m de largeur.',
            ],
        ],
        [
            'category' => 'carpentry',
            'subcategory' => 'doors_windows',
            'titles' => [
                'Pose de porte intérieure',
                'Réparation de fenêtre en bois',
                'Installation de porte coulissante',
                'Remplacement de plusieurs portes',
                'Ajustement de porte qui frotte',
            ],
            'descriptions' => [
                'Besoin d\'installer une nouvelle porte intérieure. Porte déjà achetée.',
                'Fenêtre en bois ancienne qui ferme mal. Besoin de réparation.',
                'Installation d\'une porte coulissante type grange dans le salon.',
            ],
        ],

        // Serrurerie (locksmith)
        [
            'category' => 'locksmith',
            'subcategory' => 'lock_change',
            'titles' => [
                'Changement de serrure après cambriolage',
                'Remplacement de cylindre de porte',
                'Installation de serrure 3 points',
                'Changement de toutes les serrures',
                'Pose de serrure connectée',
            ],
            'descriptions' => [
                'Ma porte a été forcée. Je dois changer la serrure rapidement.',
                'Je voudrais remplacer le cylindre de ma porte d\'entrée par un modèle plus sécurisé.',
                'Installation d\'une serrure 3 points sur porte en bois massif.',
            ],
        ],
        [
            'category' => 'locksmith',
            'subcategory' => 'emergency',
            'titles' => [
                'Porte claquée, clés à l\'intérieur',
                'Clé cassée dans la serrure',
                'Ouverture de porte sans dégâts',
                'Dépannage urgent serrure bloquée',
                'Intervention rapide porte fermée',
            ],
            'descriptions' => [
                'Je me suis enfermé dehors. Mes clés sont à l\'intérieur. Besoin d\'une intervention rapide.',
                'Ma clé s\'est cassée dans la serrure. Impossible d\'ouvrir ou fermer la porte.',
                'Serrure complètement bloquée. Je ne peux plus entrer chez moi.',
            ],
        ],

        // Chauffage/Climatisation (hvac)
        [
            'category' => 'hvac',
            'subcategory' => 'installation',
            'titles' => [
                'Installation de climatisation réversible',
                'Pose de radiateurs électriques',
                'Installation de chaudière gaz',
                'Mise en place d\'un poêle à bois',
                'Installation de chauffage au sol',
            ],
            'descriptions' => [
                'Je souhaite installer une climatisation réversible dans mon salon (35m²).',
                'Besoin de poser 3 radiateurs électriques dans un appartement rénové.',
                'Remplacement de l\'ancienne chaudière par un modèle à condensation.',
            ],
        ],
        [
            'category' => 'hvac',
            'subcategory' => 'maintenance',
            'titles' => [
                'Entretien annuel de chaudière',
                'Révision de climatisation',
                'Purge des radiateurs',
                'Nettoyage de VMC',
                'Contrôle du système de chauffage',
            ],
            'descriptions' => [
                'Entretien obligatoire de ma chaudière gaz. Modèle de 2018.',
                'Ma climatisation fait du bruit et refroidit moins bien. Besoin d\'une révision.',
                'Mes radiateurs ne chauffent pas uniformément. Besoin d\'une purge.',
            ],
        ],

        // Maçonnerie (masonry)
        [
            'category' => 'masonry',
            'subcategory' => 'renovation',
            'titles' => [
                'Rénovation de mur en pierre apparente',
                'Rebouchage de trous et fissures',
                'Création d\'une ouverture dans un mur',
                'Réparation de façade abîmée',
                'Ragréage de sol avant carrelage',
            ],
            'descriptions' => [
                'Mur en pierre à rénover dans un appartement ancien. Environ 15m².',
                'Plusieurs trous et fissures à reboucher dans les murs du salon.',
                'Je voudrais créer une ouverture de 1m20 dans un mur non porteur.',
            ],
        ],
    ];

    public function run(): void
    {
        // Get existing users (clients only)
        $clients = User::whereJsonContains('roles', 'client')
            ->where('email_verified_at', '!=', null)
            ->get();

        if ($clients->isEmpty()) {
            $this->command->warn('Aucun client trouvé. Créez d\'abord des utilisateurs.');
            return;
        }

        $this->command->info("Création de 100 tâches à Paris pour {$clients->count()} clients...");

        $tasksCreated = 0;
        $arrondissementsList = array_keys($this->arrondissements);

        foreach ($this->tasks as $taskGroup) {
            foreach ($taskGroup['titles'] as $index => $title) {
                if ($tasksCreated >= 100) {
                    break 2;
                }

                // Random client
                $client = $clients->random();
                
                // Random arrondissement
                $arrondissement = $arrondissementsList[array_rand($arrondissementsList)];
                $arrondissementData = $this->arrondissements[$arrondissement];
                
                // Random description from the group
                $description = $taskGroup['descriptions'][array_rand($taskGroup['descriptions'])];
                
                // Random budget
                $budgetRanges = [
                    [50, 100], [80, 150], [100, 200], [150, 300],
                    [200, 400], [300, 500], [400, 700], [500, 1000],
                ];
                $budgetRange = $budgetRanges[array_rand($budgetRanges)];

                Task::create([
                    'client_id' => $client->id,
                    'title' => $title,
                    'description' => $description,
                    'category' => $taskGroup['category'],
                    'subcategory' => $taskGroup['subcategory'] ?? null,
                    'budget_min' => $budgetRange[0],
                    'budget_max' => $budgetRange[1],
                    'location_type' => 'on_site',
                    'city' => 'Paris',
                    'district_code' => $arrondissementData[0],
                    'district_name' => $arrondissement,
                    'zone' => $arrondissementData[1],
                    'status' => rand(0, 10) > 7 ? 'in_progress' : 'published',
                    'images' => null,
                    'created_at' => now()->subDays(rand(0, 7)),
                    'updated_at' => now()->subDays(rand(0, 7)),
                ]);

                $tasksCreated++;
                
                if ($tasksCreated % 10 == 0) {
                    $this->command->info("✓ {$tasksCreated} tâches créées...");
                }
            }
        }

        $this->command->info("✅ {$tasksCreated} завдань створено успішно в Парижі!");
    }
}
