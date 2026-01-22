<?php

namespace Database\Seeders;

use App\Models\ParisDistrict;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ParisDistrictsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $districts = [
            [
                'code' => '75001',
                'name' => 'Paris 1st Arrondissement',
                'name_fr' => 'Paris 1er Arrondissement',
                'description' => 'The 1st arrondissement of Paris is one of the most historic and central districts, home to landmarks like the Louvre Museum and the Tuileries Garden.',
                'population' => 17000,
                'area_km2' => 1.83,
                'latitude' => 48.8640493,
                'longitude' => 2.3310526,
                'notable_places' => json_encode(['Louvre Museum', 'Tuileries Garden', 'Palais Royal', 'Place Vendôme']),
            ],
            [
                'code' => '75002',
                'name' => 'Paris 2nd Arrondissement',
                'name_fr' => 'Paris 2ème Arrondissement',
                'description' => 'The 2nd arrondissement is the smallest in Paris and is known for its covered passages, financial district, and textile industry.',
                'population' => 22000,
                'area_km2' => 0.99,
                'latitude' => 48.8683316,
                'longitude' => 2.3444301,
                'notable_places' => json_encode(['Passage des Panoramas', 'Rue Montorgueil', 'Paris Stock Exchange']),
            ],
            [
                'code' => '75003',
                'name' => 'Paris 3rd Arrondissement',
                'name_fr' => 'Paris 3ème Arrondissement',
                'description' => 'The 3rd arrondissement is part of the Marais district, known for its historic buildings, museums, and trendy boutiques.',
                'population' => 35000,
                'area_km2' => 1.17,
                'latitude' => 48.8637519,
                'longitude' => 2.3615356,
                'notable_places' => json_encode(['Musée Picasso', 'Musée des Arts et Métiers', 'Temple du Marais']),
            ],
            [
                'code' => '75004',
                'name' => 'Paris 4th Arrondissement',
                'name_fr' => 'Paris 4ème Arrondissement',
                'description' => 'The 4th arrondissement includes part of the Marais and the eastern part of Île de la Cité, featuring Notre-Dame Cathedral and Centre Pompidou.',
                'population' => 28000,
                'area_km2' => 1.60,
                'latitude' => 48.8566969,
                'longitude' => 2.3514616,
                'notable_places' => json_encode(['Notre-Dame Cathedral', 'Centre Pompidou', 'Hôtel de Ville', 'Place des Vosges']),
            ],
            [
                'code' => '75005',
                'name' => 'Paris 5th Arrondissement',
                'name_fr' => 'Paris 5ème Arrondissement',
                'description' => 'The 5th arrondissement, known as the Latin Quarter, is home to universities, bookshops, and historic sites like the Pantheon.',
                'population' => 60000,
                'area_km2' => 2.54,
                'latitude' => 48.8448184,
                'longitude' => 2.3509171,
                'notable_places' => json_encode(['Pantheon', 'Sorbonne University', 'Jardin des Plantes', 'Shakespeare and Company']),
            ],
            [
                'code' => '75006',
                'name' => 'Paris 6th Arrondissement',
                'name_fr' => 'Paris 6ème Arrondissement',
                'description' => 'The 6th arrondissement is known for its cafés, art galleries, and the Luxembourg Gardens.',
                'population' => 43000,
                'area_km2' => 2.15,
                'latitude' => 48.8488991,
                'longitude' => 2.3364391,
                'notable_places' => json_encode(['Luxembourg Gardens', 'Saint-Germain-des-Prés', 'Café de Flore', 'Les Deux Magots']),
            ],
            [
                'code' => '75007',
                'name' => 'Paris 7th Arrondissement',
                'name_fr' => 'Paris 7ème Arrondissement',
                'description' => 'The 7th arrondissement is home to the Eiffel Tower, Invalides, and many government buildings.',
                'population' => 57000,
                'area_km2' => 4.09,
                'latitude' => 48.8570478,
                'longitude' => 2.3214407,
                'notable_places' => json_encode(['Eiffel Tower', 'Les Invalides', 'Musée d\'Orsay', 'École Militaire']),
            ],
            [
                'code' => '75008',
                'name' => 'Paris 8th Arrondissement',
                'name_fr' => 'Paris 8ème Arrondissement',
                'description' => 'The 8th arrondissement is known for the Champs-Élysées, luxury shops, and business district.',
                'population' => 40000,
                'area_km2' => 3.88,
                'latitude' => 48.8722233,
                'longitude' => 2.3137199,
                'notable_places' => json_encode(['Arc de Triomphe', 'Champs-Élysées', 'Place de la Concorde', 'Grand Palais']),
            ],
            [
                'code' => '75009',
                'name' => 'Paris 9th Arrondissement',
                'name_fr' => 'Paris 9ème Arrondissement',
                'description' => 'The 9th arrondissement features the Opéra Garnier, department stores, and the Pigalle district.',
                'population' => 60000,
                'area_km2' => 2.18,
                'latitude' => 48.8761846,
                'longitude' => 2.3422357,
                'notable_places' => json_encode(['Opéra Garnier', 'Galeries Lafayette', 'Printemps', 'Musée Grévin']),
            ],
            [
                'code' => '75010',
                'name' => 'Paris 10th Arrondissement',
                'name_fr' => 'Paris 10ème Arrondissement',
                'description' => 'The 10th arrondissement includes Canal Saint-Martin and two major railway stations.',
                'population' => 95000,
                'area_km2' => 2.89,
                'latitude' => 48.8765493,
                'longitude' => 2.3565745,
                'notable_places' => json_encode(['Canal Saint-Martin', 'Gare du Nord', 'Gare de l\'Est', 'Place de la République']),
            ],
            [
                'code' => '75011',
                'name' => 'Paris 11th Arrondissement',
                'name_fr' => 'Paris 11ème Arrondissement',
                'description' => 'The 11th arrondissement is a densely populated area known for its nightlife and restaurants.',
                'population' => 152000,
                'area_km2' => 3.67,
                'latitude' => 48.8580032,
                'longitude' => 2.3799903,
                'notable_places' => json_encode(['Place de la Bastille', 'Oberkampf', 'Cirque d\'Hiver', 'Rue de Lappe']),
            ],
            [
                'code' => '75012',
                'name' => 'Paris 12th Arrondissement',
                'name_fr' => 'Paris 12ème Arrondissement',
                'description' => 'The 12th arrondissement features the Bois de Vincennes park and the Opéra Bastille.',
                'population' => 144000,
                'area_km2' => 16.37, // Including Bois de Vincennes
                'latitude' => 48.8396637,
                'longitude' => 2.4288419,
                'notable_places' => json_encode(['Bois de Vincennes', 'Opéra Bastille', 'Bercy Village', 'Promenade Plantée']),
            ],
            [
                'code' => '75013',
                'name' => 'Paris 13th Arrondissement',
                'name_fr' => 'Paris 13ème Arrondissement',
                'description' => 'The 13th arrondissement is known for its Chinatown, modern architecture, and the National Library.',
                'population' => 183000,
                'area_km2' => 7.15,
                'latitude' => 48.8322956,
                'longitude' => 2.3561475,
                'notable_places' => json_encode(['Bibliothèque Nationale de France', 'Butte-aux-Cailles', 'Chinatown', 'Place d\'Italie']),
            ],
            [
                'code' => '75014',
                'name' => 'Paris 14th Arrondissement',
                'name_fr' => 'Paris 14ème Arrondissement',
                'description' => 'The 14th arrondissement includes the Montparnasse district and the Paris Catacombs.',
                'population' => 137000,
                'area_km2' => 5.62,
                'latitude' => 48.8304753,
                'longitude' => 2.326837,
                'notable_places' => json_encode(['Montparnasse Tower', 'Paris Catacombs', 'Parc Montsouris', 'Cité Universitaire']),
            ],
            [
                'code' => '75015',
                'name' => 'Paris 15th Arrondissement',
                'name_fr' => 'Paris 15ème Arrondissement',
                'description' => 'The 15th arrondissement is the most populous district in Paris, featuring the Eiffel Tower on its border.',
                'population' => 240000,
                'area_km2' => 8.48,
                'latitude' => 48.8417628,
                'longitude' => 2.2921025,
                'notable_places' => json_encode(['Parc André Citroën', 'Porte de Versailles', 'Beaugrenelle', 'Pont Mirabeau']),
            ],
            [
                'code' => '75016',
                'name' => 'Paris 16th Arrondissement',
                'name_fr' => 'Paris 16ème Arrondissement',
                'description' => 'The 16th arrondissement is an affluent residential area with museums and the Bois de Boulogne.',
                'population' => 169000,
                'area_km2' => 16.37, // Including Bois de Boulogne
                'latitude' => 48.8637519,
                'longitude' => 2.2769955,
                'notable_places' => json_encode(['Bois de Boulogne', 'Fondation Louis Vuitton', 'Palais de Tokyo', 'Trocadéro']),
            ],
            [
                'code' => '75017',
                'name' => 'Paris 17th Arrondissement',
                'name_fr' => 'Paris 17ème Arrondissement',
                'description' => 'The 17th arrondissement is a mix of residential and business areas, including the new Batignolles eco-district.',
                'population' => 170000,
                'area_km2' => 5.67,
                'latitude' => 48.8828944,
                'longitude' => 2.3222064,
                'notable_places' => json_encode(['Parc Monceau', 'Batignolles', 'Place de Clichy', 'Square des Batignolles']),
            ],
            [
                'code' => '75018',
                'name' => 'Paris 18th Arrondissement',
                'name_fr' => 'Paris 18ème Arrondissement',
                'description' => 'The 18th arrondissement includes Montmartre, Sacré-Cœur Basilica, and multicultural neighborhoods.',
                'population' => 200000,
                'area_km2' => 6.01,
                'latitude' => 48.8917555,
                'longitude' => 2.3466807,
                'notable_places' => json_encode(['Sacré-Cœur Basilica', 'Montmartre', 'Moulin Rouge', 'Place du Tertre']),
            ],
            [
                'code' => '75019',
                'name' => 'Paris 19th Arrondissement',
                'name_fr' => 'Paris 19ème Arrondissement',
                'description' => 'The 19th arrondissement features parks, canals, and cultural venues like the Cité des Sciences.',
                'population' => 187000,
                'area_km2' => 6.79,
                'latitude' => 48.8829038,
                'longitude' => 2.3814861,
                'notable_places' => json_encode(['Parc des Buttes-Chaumont', 'Cité des Sciences et de l\'Industrie', 'Canal de l\'Ourcq', 'Parc de la Villette']),
            ],
            [
                'code' => '75020',
                'name' => 'Paris 20th Arrondissement',
                'name_fr' => 'Paris 20ème Arrondissement',
                'description' => 'The 20th arrondissement is known for the Père Lachaise Cemetery and its diverse, multicultural neighborhoods.',
                'population' => 196000,
                'area_km2' => 5.98,
                'latitude' => 48.8652501,
                'longitude' => 2.4019973,
                'notable_places' => json_encode(['Père Lachaise Cemetery', 'Belleville', 'Ménilmontant', 'Parc de Belleville']),
            ],
        ];

        foreach ($districts as $district) {
            $district['slug'] = Str::slug($district['name']);
            $district['meta_title'] = "Services à domicile dans le {$district['name_fr']} | ProchePro";
            $district['meta_description'] = "Trouvez des prestataires de services à domicile qualifiés dans le {$district['name_fr']}. Plombiers, électriciens, ménage et plus encore.";
            
            ParisDistrict::create($district);
        }
    }
}
