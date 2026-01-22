<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class FrenchUsersSeeder extends Seeder
{
    private array $frenchFirstNames = [
        'Alexandre', 'Antoine', 'Arthur', 'Baptiste', 'Benjamin', 'Clément', 'Éloi', 'Émile', 'Étienne', 'Gabriel',
        'Hugo', 'Jules', 'Léo', 'Louis', 'Lucas', 'Mathis', 'Maxime', 'Nathan', 'Noah', 'Paul',
        'Raphaël', 'Théo', 'Thomas', 'Victor', 'Adrien', 'Bastien', 'Cédric', 'Damien', 'Fabien', 'Guillaume',
        'Julien', 'Laurent', 'Marc', 'Nicolas', 'Olivier', 'Pierre', 'Quentin', 'Romain', 'Sébastien', 'Vincent',
        'Alice', 'Amélie', 'Anna', 'Camille', 'Charlotte', 'Chloé', 'Clara', 'Emma', 'Inès', 'Jade',
        'Jeanne', 'Léa', 'Léna', 'Lola', 'Louise', 'Lucie', 'Manon', 'Marie', 'Mathilde', 'Nina',
        'Océane', 'Rose', 'Sarah', 'Sophie', 'Zoé', 'Aurore', 'Béatrice', 'Caroline', 'Céline', 'Delphine',
        'Élodie', 'Florence', 'Geneviève', 'Hélène', 'Isabelle', 'Joséphine', 'Laure', 'Margaux', 'Nathalie', 'Pauline',
        'Anaïs', 'Audrey', 'Brigitte', 'Catherine', 'Corinne', 'Diane', 'Émilie', 'Estelle', 'Fanny', 'Gaëlle',
        'Gwenaëlle', 'Juliette', 'Karine', 'Laurence', 'Mélanie', 'Monique', 'Nadine', 'Patricia', 'Sandrine', 'Sylvie'
    ];

    private array $frenchLastNames = [
        'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau',
        'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier',
        'Morel', 'Girard', 'André', 'Lefevre', 'Mercier', 'Dupont', 'Lambert', 'Bonnet', 'François', 'Martinez',
        'Legrand', 'Garnier', 'Faure', 'Rousseau', 'Blanc', 'Guerin', 'Muller', 'Henry', 'Roussel', 'Nicolas',
        'Perrin', 'Morin', 'Mathieu', 'Clement', 'Gauthier', 'Dumont', 'Lopez', 'Fontaine', 'Chevalier', 'Robin',
        'Masson', 'Sanchez', 'Gerard', 'Nguyen', 'Boyer', 'Denis', 'Lemaire', 'Duval', 'Joly', 'Gautier',
        'Roger', 'Roche', 'Roy', 'Noel', 'Meyer', 'Lucas', 'Meunier', 'Jean', 'Perez', 'Marchand',
        'Dufour', 'Blanchard', 'Marie', 'Barbier', 'Brun', 'Dumas', 'Brunet', 'Schmitt', 'Leroux', 'Colin',
        'Fernandez', 'Pierre', 'Renard', 'Arnaud', 'Rolland', 'Caron', 'Aubert', 'Giraud', 'Leclerc', 'Vidal',
        'Bourgeois', 'Renaud', 'Lemoine', 'Picard', 'Gaillard', 'Philippe', 'Leclercq', 'Lacroix', 'Fabre', 'Dupuis'
    ];

    private array $cities = [
        'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Montpellier', 'Strasbourg', 'Bordeaux', 'Lille',
        'Rennes', 'Reims', 'Saint-Étienne', 'Toulon', 'Le Havre', 'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne',
        'Clermont-Ferrand', 'Le Mans', 'Aix-en-Provence', 'Brest', 'Tours', 'Amiens', 'Limoges', 'Annecy', 'Perpignan', 'Boulogne-Billancourt'
    ];

    private array $serviceCategories = [
        ['key' => 'plomberie', 'subs' => ['fuite_eau', 'installation_chaudiere', 'debouchage', 'installation_sanitaire']],
        ['key' => 'electricite', 'subs' => ['installation_electrique', 'reparation_panne', 'tableau_electrique', 'eclairage']],
        ['key' => 'menuiserie', 'subs' => ['pose_porte', 'parquet', 'escalier', 'placard']],
        ['key' => 'peinture', 'subs' => ['peinture_interieur', 'peinture_exterieur', 'papier_peint', 'ravalement']],
        ['key' => 'nettoyage', 'subs' => ['nettoyage_appartement', 'nettoyage_bureaux', 'vitrerie', 'desinfection']],
        ['key' => 'jardinage', 'subs' => ['tonte_pelouse', 'taille_haies', 'plantation', 'arrosage']],
        ['key' => 'informatique', 'subs' => ['reparation_ordinateur', 'installation_reseau', 'virus', 'formation']],
        ['key' => 'renovation', 'subs' => ['renovation_salle_bain', 'renovation_cuisine', 'isolation', 'cloison']],
        ['key' => 'chauffage', 'subs' => ['installation_chaudiere', 'radiateur', 'pompe_chaleur', 'climatisation']],
        ['key' => 'serrurerie', 'subs' => ['ouverture_porte', 'changement_serrure', 'blindage', 'cle']],
        ['key' => 'demenagement', 'subs' => ['demenagement_complet', 'monte_meuble', 'cartons', 'garde_meuble']],
        ['key' => 'decoration', 'subs' => ['conseil_deco', 'amenagement', 'luminaire', 'textile']],
        ['key' => 'maconnerie', 'subs' => ['mur', 'dalle', 'terrasse', 'fondation']],
        ['key' => 'toiture', 'subs' => ['reparation_toiture', 'nettoyage_toiture', 'gouttiere', 'isolation_toit']],
    ];

    private array $bioTemplates = [
        'Professionnel avec {exp} ans d\'expérience dans le domaine',
        'Expert certifié, interventions rapides et soignées',
        'Service de qualité, devis gratuit et sans engagement',
        'Artisan qualifié, travail garanti et dans les règles de l\'art',
        '{exp} années d\'expertise au service de vos projets',
        'Interventions d\'urgence 7j/7, tarifs compétitifs',
        'Professionnel reconnu, satisfaction client garantie',
        'Spécialiste expérimenté, équipe disponible et réactive',
        'Savoir-faire traditionnel et techniques modernes',
        'Service premium, accompagnement personnalisé de A à Z',
        'Expert du métier depuis {exp} ans, nombreuses références',
        'Artisan passionné, travail soigné et respect des délais',
        'Entreprise familiale, {exp} ans de savoir-faire',
        'Professionnel diplômé, assurance décennale',
        'Service rapide et efficace, disponible toute l\'année',
    ];

    public function run(): void
    {
        $this->command->info('🚀 Création de 100 utilisateurs français...');
        
        $created = 0;
        $skipped = 0;

        for ($i = 1; $i <= 100; $i++) {
            $firstName = $this->frenchFirstNames[array_rand($this->frenchFirstNames)];
            $lastName = $this->frenchLastNames[array_rand($this->frenchLastNames)];
            $name = "$firstName $lastName";
            
            // Email unique
            $emailBase = strtolower(str_replace(' ', '.', $firstName . '.' . $lastName));
            $email = $emailBase . ($i > 50 ? $i : '') . '@prochepro.fr';
            
            // Check if exists
            if (User::where('email', $email)->exists()) {
                $skipped++;
                continue;
            }

            // Random city
            $city = $this->cities[array_rand($this->cities)];
            
            // Random 1-3 service categories
            $numCategories = rand(1, 3);
            $selectedCategories = array_rand($this->serviceCategories, $numCategories);
            if (!is_array($selectedCategories)) {
                $selectedCategories = [$selectedCategories];
            }
            
            $serviceCategories = [];
            $serviceSubcategories = [];
            
            foreach ($selectedCategories as $idx) {
                $category = $this->serviceCategories[$idx];
                $serviceCategories[] = $category['key'];
                
                // Random 2-4 subcategories from this category
                $numSubs = rand(2, min(4, count($category['subs'])));
                $selectedSubs = (array) array_rand(array_flip($category['subs']), $numSubs);
                $serviceSubcategories = array_merge($serviceSubcategories, $selectedSubs);
            }

            // Experience years
            $experienceYears = rand(2, 25);
            
            // Bio
            $bioTemplate = $this->bioTemplates[array_rand($this->bioTemplates)];
            $bio = str_replace('{exp}', $experienceYears, $bioTemplate);
            
            // Hourly rate based on experience
            $hourlyRate = rand(30, 80) + ($experienceYears > 10 ? 10 : 0);
            
            // Phone
            $phone = '+336' . str_pad(rand(10000000, 99999999), 8, '0', STR_PAD_LEFT);
            
            // Random role distribution: 70% prestataire, 30% both
            $hasPrestataire = rand(1, 100) <= 90; // 90% are prestataires
            $roles = $hasPrestataire ? ['client', 'prestataire'] : ['client'];
            $role = $hasPrestataire ? 'prestataire' : 'client';
            
            // 80% verified for prestataires
            $isVerified = $hasPrestataire && (rand(1, 100) <= 80);

            $userData = [
                'name' => $name,
                'email' => $email,
                'password' => Hash::make('password123'),
                'phone' => $phone,
                'role' => $role,
                'roles' => $roles,
                'city' => $city,
                'bio' => $bio,
                'hourly_rate' => $hourlyRate,
                'experience_years' => $experienceYears,
                'is_verified' => $isVerified,
                'verified_at' => $isVerified ? now()->subDays(rand(1, 365)) : null,
                'email_verified_at' => now()->subDays(rand(1, 400)),
                'referral_code' => User::generateReferralCode(),
                'last_login_at' => now()->subDays(rand(0, 90)),
            ];

            if ($hasPrestataire) {
                $userData['service_categories'] = $serviceCategories;
                $userData['service_subcategories'] = $serviceSubcategories;
            }

            User::create($userData);
            $created++;
            
            if ($created % 10 === 0) {
                $this->command->info("✅ Créé {$created}/100 utilisateurs...");
            }
        }

        $this->command->info("✅ Terminé! {$created} utilisateurs créés, {$skipped} ignorés (déjà existants)");
    }
}
