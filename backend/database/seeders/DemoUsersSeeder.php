<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoUsersSeeder extends Seeder
{
    /**
     * Demo users for Paris districts
     */
    private array $demoUsers = [
        [
            'name' => 'Sophie Martin',
            'email' => 'sophie.martin.demo@prochepro.local',
            'phone' => '+33612345678',
            'city' => 'Paris',
            'district_code' => '75001',
            'district_name' => '1er Arrondissement',
        ],
        [
            'name' => 'Pierre Dubois',
            'email' => 'pierre.dubois.demo@prochepro.local',
            'phone' => '+33612345679',
            'city' => 'Paris',
            'district_code' => '75004',
            'district_name' => '4e Arrondissement',
        ],
        [
            'name' => 'Marie Leclerc',
            'email' => 'marie.leclerc.demo@prochepro.local',
            'phone' => '+33612345680',
            'city' => 'Paris',
            'district_code' => '75011',
            'district_name' => '11e Arrondissement',
        ],
        [
            'name' => 'Jean Bernard',
            'email' => 'jean.bernard.demo@prochepro.local',
            'phone' => '+33612345681',
            'city' => 'Paris',
            'district_code' => '75015',
            'district_name' => '15e Arrondissement',
        ],
        [
            'name' => 'Emma Rousseau',
            'email' => 'emma.rousseau.demo@prochepro.local',
            'phone' => '+33612345682',
            'city' => 'Paris',
            'district_code' => '75018',
            'district_name' => '18e Arrondissement',
        ],
        [
            'name' => 'Lucas Petit',
            'email' => 'lucas.petit.demo@prochepro.local',
            'phone' => '+33612345683',
            'city' => 'Paris',
            'district_code' => '75009',
            'district_name' => '9e Arrondissement',
        ],
        [
            'name' => 'Chloé Moreau',
            'email' => 'chloe.moreau.demo@prochepro.local',
            'phone' => '+33612345684',
            'city' => 'Paris',
            'district_code' => '75012',
            'district_name' => '12e Arrondissement',
        ],
        [
            'name' => 'Antoine Simon',
            'email' => 'antoine.simon.demo@prochepro.local',
            'phone' => '+33612345685',
            'city' => 'Paris',
            'district_code' => '75007',
            'district_name' => '7e Arrondissement',
        ],
    ];

    public function run(): void
    {
        foreach ($this->demoUsers as $userData) {
            User::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'email' => $userData['email'],
                    'phone' => $userData['phone'],
                    'password' => Hash::make('DemoPassword123!'),
                    'roles' => ['client', 'prestataire'],
                    'active_role' => 'client',
                    'city' => $userData['city'],
                    'district_code' => $userData['district_code'],
                    'district_name' => $userData['district_name'],
                    'is_verified' => true,
                    'email_verified_at' => now(),
                    'referral_code' => User::generateReferralCode(),
                ]
            );
        }

        $this->command->info('✅ Created ' . count($this->demoUsers) . ' demo users for Paris');
    }
}
