<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestPrestataireSeeder extends Seeder
{
    /**
     * Seed test prestataires with service categories for AI matching
     */
    public function run(): void
    {
        $prestataires = [
            [
                'name' => 'Jean Dupont',
                'email' => 'jean.dupont@test.com',
                'phone' => '+33612345001',
                'role' => 'prestataire',
                'roles' => ['client', 'prestataire'],
                'city' => 'Paris',
                'service_categories' => ['plomberie', 'chauffage'],
                'service_subcategories' => ['fuite_eau', 'installation_chaudiere', 'debouchage'],
                'bio' => 'Plombier professionnel avec 15 ans d\'expérience à Paris',
                'hourly_rate' => 50,
                'experience_years' => 15,
                'is_verified' => true,
                'verified_at' => now(),
            ],
            [
                'name' => 'Marie Martin',
                'email' => 'marie.martin@test.com',
                'phone' => '+33612345002',
                'role' => 'prestataire',
                'roles' => ['client', 'prestataire'],
                'city' => 'Paris',
                'service_categories' => ['electricite', 'domotique'],
                'service_subcategories' => ['installation_electrique', 'reparation_panne', 'tableau_electrique'],
                'bio' => 'Électricienne certifiée, interventions rapides',
                'hourly_rate' => 55,
                'experience_years' => 10,
                'is_verified' => true,
                'verified_at' => now(),
            ],
            [
                'name' => 'Pierre Dubois',
                'email' => 'pierre.dubois@test.com',
                'phone' => '+33612345003',
                'role' => 'prestataire',
                'roles' => ['client', 'prestataire'],
                'city' => 'Lyon',
                'service_categories' => ['plomberie', 'renovation'],
                'service_subcategories' => ['fuite_eau', 'installation_sanitaire', 'renovation_salle_bain'],
                'bio' => 'Plombier-chauffagiste à Lyon, devis gratuit',
                'hourly_rate' => 45,
                'experience_years' => 8,
                'is_verified' => true,
                'verified_at' => now(),
            ],
            [
                'name' => 'Sophie Bernard',
                'email' => 'sophie.bernard@test.com',
                'phone' => '+33612345004',
                'role' => 'prestataire',
                'roles' => ['client', 'prestataire'],
                'city' => 'Paris',
                'service_categories' => ['menuiserie', 'renovation'],
                'service_subcategories' => ['pose_porte', 'parquet', 'escalier'],
                'bio' => 'Menuisière qualifiée, travail soigné',
                'hourly_rate' => 60,
                'experience_years' => 12,
                'is_verified' => true,
                'verified_at' => now(),
            ],
            [
                'name' => 'Thomas Petit',
                'email' => 'thomas.petit@test.com',
                'phone' => '+33612345005',
                'role' => 'prestataire',
                'roles' => ['client', 'prestataire'],
                'city' => 'Marseille',
                'service_categories' => ['peinture', 'decoration'],
                'service_subcategories' => ['peinture_interieur', 'peinture_exterieur', 'papier_peint'],
                'bio' => 'Peintre décorateur professionnel',
                'hourly_rate' => 40,
                'experience_years' => 7,
                'is_verified' => true,
                'verified_at' => now(),
            ],
            [
                'name' => 'Isabelle Moreau',
                'email' => 'isabelle.moreau@test.com',
                'phone' => '+33612345006',
                'role' => 'prestataire',
                'roles' => ['client', 'prestataire'],
                'city' => 'Paris',
                'service_categories' => ['nettoyage', 'menage'],
                'service_subcategories' => ['nettoyage_appartement', 'nettoyage_bureaux', 'vitrerie'],
                'bio' => 'Service de nettoyage professionnel, équipe disponible',
                'hourly_rate' => 30,
                'experience_years' => 5,
                'is_verified' => true,
                'verified_at' => now(),
            ],
            [
                'name' => 'Lucas Roux',
                'email' => 'lucas.roux@test.com',
                'phone' => '+33612345007',
                'role' => 'prestataire',
                'roles' => ['client', 'prestataire'],
                'city' => 'Paris',
                'service_categories' => ['jardinage', 'paysagisme'],
                'service_subcategories' => ['tonte_pelouse', 'taille_haies', 'plantation'],
                'bio' => 'Jardinier paysagiste, entretien espaces verts',
                'hourly_rate' => 35,
                'experience_years' => 6,
                'is_verified' => true,
                'verified_at' => now(),
            ],
            [
                'name' => 'Camille Laurent',
                'email' => 'camille.laurent@test.com',
                'phone' => '+33612345008',
                'role' => 'prestataire',
                'roles' => ['client', 'prestataire'],
                'city' => 'Toulouse',
                'service_categories' => ['informatique', 'depannage'],
                'service_subcategories' => ['reparation_ordinateur', 'installation_reseau', 'virus'],
                'bio' => 'Technicien informatique, dépannage à domicile',
                'hourly_rate' => 50,
                'experience_years' => 9,
                'is_verified' => true,
                'verified_at' => now(),
            ],
        ];

        foreach ($prestataires as $data) {
            // Check if user already exists
            $exists = User::where('email', $data['email'])->exists();
            
            if (!$exists) {
                User::create(array_merge($data, [
                    'password' => Hash::make('password123'),
                    'email_verified_at' => now(),
                    'referral_code' => User::generateReferralCode(),
                    'last_login_at' => now()->subDays(rand(0, 30)),
                ]));
                
                $this->command->info("Created prestataire: {$data['name']}");
            } else {
                $this->command->warn("Prestataire already exists: {$data['name']}");
            }
        }

        $this->command->info('Test prestataires seeded successfully!');
    }
}
