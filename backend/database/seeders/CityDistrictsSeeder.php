<?php

namespace Database\Seeders;

use App\Models\CityDistrict;
use Illuminate\Database\Seeder;

class CityDistrictsSeeder extends Seeder
{
    public function run(): void
    {
        $districts = array_merge(
            $this->getParisDistricts(),
            $this->getLyonDistricts(),
            $this->getMarseilleDistricts(),
            $this->getToulouseDistricts()
        );

        foreach ($districts as $district) {
            CityDistrict::create($district);
        }
    }

    private function getParisDistricts(): array
    {
        return [
            ['city' => 'Paris', 'code' => '75001', 'name' => '1st arrondissement', 'name_fr' => 'Paris 1er', 'slug' => 'paris-1er', 'description' => 'Quartier historique du Louvre', 'notable_places' => ['Louvre', 'Palais Royal', 'Les Halles'], 'latitude' => 48.8606, 'longitude' => 2.3376],
            ['city' => 'Paris', 'code' => '75002', 'name' => '2nd arrondissement', 'name_fr' => 'Paris 2ème', 'slug' => 'paris-2eme', 'description' => 'Quartier de la Bourse', 'notable_places' => ['Bourse', 'Rue Montorgueil', 'Opéra Comique'], 'latitude' => 48.8690, 'longitude' => 2.3413],
            ['city' => 'Paris', 'code' => '75003', 'name' => '3rd arrondissement', 'name_fr' => 'Paris 3ème', 'slug' => 'paris-3eme', 'description' => 'Quartier du Temple et du Marais', 'notable_places' => ['Archives Nationales', 'Musée Picasso', 'Carreau du Temple'], 'latitude' => 48.8632, 'longitude' => 2.3594],
            ['city' => 'Paris', 'code' => '75004', 'name' => '4th arrondissement', 'name_fr' => 'Paris 4ème', 'slug' => 'paris-4eme', 'description' => 'Le Marais et Île de la Cité', 'notable_places' => ['Notre-Dame', 'Hôtel de Ville', 'Place des Vosges'], 'latitude' => 48.8548, 'longitude' => 2.3578],
            ['city' => 'Paris', 'code' => '75005', 'name' => '5th arrondissement', 'name_fr' => 'Paris 5ème', 'slug' => 'paris-5eme', 'description' => 'Quartier Latin', 'notable_places' => ['Panthéon', 'Sorbonne', 'Jardin des Plantes'], 'latitude' => 48.8445, 'longitude' => 2.3457],
            ['city' => 'Paris', 'code' => '75006', 'name' => '6th arrondissement', 'name_fr' => 'Paris 6ème', 'slug' => 'paris-6eme', 'description' => 'Saint-Germain-des-Prés', 'notable_places' => ['Luxembourg', 'Saint-Germain', 'Odéon'], 'latitude' => 48.8506, 'longitude' => 2.3315],
            ['city' => 'Paris', 'code' => '75007', 'name' => '7th arrondissement', 'name_fr' => 'Paris 7ème', 'slug' => 'paris-7eme', 'description' => 'Tour Eiffel et Invalides', 'notable_places' => ['Tour Eiffel', 'Invalides', 'Musée d\'Orsay'], 'latitude' => 48.8560, 'longitude' => 2.3104],
            ['city' => 'Paris', 'code' => '75008', 'name' => '8th arrondissement', 'name_fr' => 'Paris 8ème', 'slug' => 'paris-8eme', 'description' => 'Champs-Élysées', 'notable_places' => ['Arc de Triomphe', 'Champs-Élysées', 'Grand Palais'], 'latitude' => 48.8734, 'longitude' => 2.3125],
            ['city' => 'Paris', 'code' => '75009', 'name' => '9th arrondissement', 'name_fr' => 'Paris 9ème', 'slug' => 'paris-9eme', 'description' => 'Opéra et Pigalle', 'notable_places' => ['Opéra Garnier', 'Galeries Lafayette', 'Pigalle'], 'latitude' => 48.8769, 'longitude' => 2.3389],
            ['city' => 'Paris', 'code' => '75010', 'name' => '10th arrondissement', 'name_fr' => 'Paris 10ème', 'slug' => 'paris-10eme', 'description' => 'Gare du Nord et Canal Saint-Martin', 'notable_places' => ['Gare du Nord', 'Gare de l\'Est', 'Canal Saint-Martin'], 'latitude' => 48.8759, 'longitude' => 2.3592],
            ['city' => 'Paris', 'code' => '75011', 'name' => '11th arrondissement', 'name_fr' => 'Paris 11ème', 'slug' => 'paris-11eme', 'description' => 'Bastille et Nation', 'notable_places' => ['Place de la Bastille', 'Oberkampf', 'République'], 'latitude' => 48.8594, 'longitude' => 2.3765],
            ['city' => 'Paris', 'code' => '75012', 'name' => '12th arrondissement', 'name_fr' => 'Paris 12ème', 'slug' => 'paris-12eme', 'description' => 'Bercy et Bois de Vincennes', 'notable_places' => ['Gare de Lyon', 'Bercy', 'Bois de Vincennes'], 'latitude' => 48.8415, 'longitude' => 2.3900],
            ['city' => 'Paris', 'code' => '75013', 'name' => '13th arrondissement', 'name_fr' => 'Paris 13ème', 'slug' => 'paris-13eme', 'description' => 'Quartier asiatique et Bibliothèque', 'notable_places' => ['BNF', 'Place d\'Italie', 'Butte-aux-Cailles'], 'latitude' => 48.8322, 'longitude' => 2.3561],
            ['city' => 'Paris', 'code' => '75014', 'name' => '14th arrondissement', 'name_fr' => 'Paris 14ème', 'slug' => 'paris-14eme', 'description' => 'Montparnasse', 'notable_places' => ['Tour Montparnasse', 'Catacombes', 'Observatoire'], 'latitude' => 48.8333, 'longitude' => 2.3272],
            ['city' => 'Paris', 'code' => '75015', 'name' => '15th arrondissement', 'name_fr' => 'Paris 15ème', 'slug' => 'paris-15eme', 'description' => 'Plus grand arrondissement de Paris', 'notable_places' => ['Parc André Citroën', 'Beaugrenelle', 'Porte de Versailles'], 'latitude' => 48.8407, 'longitude' => 2.2984],
            ['city' => 'Paris', 'code' => '75016', 'name' => '16th arrondissement', 'name_fr' => 'Paris 16ème', 'slug' => 'paris-16eme', 'description' => 'Quartier résidentiel chic', 'notable_places' => ['Trocadéro', 'Bois de Boulogne', 'Passy'], 'latitude' => 48.8636, 'longitude' => 2.2686],
            ['city' => 'Paris', 'code' => '75017', 'name' => '17th arrondissement', 'name_fr' => 'Paris 17ème', 'slug' => 'paris-17eme', 'description' => 'Batignolles et Ternes', 'notable_places' => ['Parc Monceau', 'Batignolles', 'Place de Clichy'], 'latitude' => 48.8873, 'longitude' => 2.3107],
            ['city' => 'Paris', 'code' => '75018', 'name' => '18th arrondissement', 'name_fr' => 'Paris 18ème', 'slug' => 'paris-18eme', 'description' => 'Montmartre et Sacré-Cœur', 'notable_places' => ['Sacré-Cœur', 'Montmartre', 'Pigalle'], 'latitude' => 48.8927, 'longitude' => 2.3436],
            ['city' => 'Paris', 'code' => '75019', 'name' => '19th arrondissement', 'name_fr' => 'Paris 19ème', 'slug' => 'paris-19eme', 'description' => 'Buttes-Chaumont et La Villette', 'notable_places' => ['Parc des Buttes-Chaumont', 'La Villette', 'Bassin de la Villette'], 'latitude' => 48.8861, 'longitude' => 2.3825],
            ['city' => 'Paris', 'code' => '75020', 'name' => '20th arrondissement', 'name_fr' => 'Paris 20ème', 'slug' => 'paris-20eme', 'description' => 'Belleville et Ménilmontant', 'notable_places' => ['Père Lachaise', 'Belleville', 'Ménilmontant'], 'latitude' => 48.8631, 'longitude' => 2.3969],
        ];
    }

    private function getLyonDistricts(): array
    {
        return [
            ['city' => 'Lyon', 'code' => '69001', 'name' => '1st arrondissement', 'name_fr' => 'Lyon 1er', 'slug' => 'lyon-1er', 'description' => 'Presqu\'île - Pentes de la Croix-Rousse', 'notable_places' => ['Hôtel de Ville', 'Opéra', 'Terreaux'], 'latitude' => 45.7693, 'longitude' => 4.8330],
            ['city' => 'Lyon', 'code' => '69002', 'name' => '2nd arrondissement', 'name_fr' => 'Lyon 2ème', 'slug' => 'lyon-2eme', 'description' => 'Presqu\'île - Bellecour', 'notable_places' => ['Bellecour', 'Confluence', 'Perrache'], 'latitude' => 45.7540, 'longitude' => 4.8269],
            ['city' => 'Lyon', 'code' => '69003', 'name' => '3rd arrondissement', 'name_fr' => 'Lyon 3ème', 'slug' => 'lyon-3eme', 'description' => 'Part-Dieu et Guillotière', 'notable_places' => ['Part-Dieu', 'Gare Part-Dieu', 'Préfecture'], 'latitude' => 45.7548, 'longitude' => 4.8565],
            ['city' => 'Lyon', 'code' => '69004', 'name' => '4th arrondissement', 'name_fr' => 'Lyon 4ème', 'slug' => 'lyon-4eme', 'description' => 'Croix-Rousse', 'notable_places' => ['Croix-Rousse', 'Boulevard de la Croix-Rousse'], 'latitude' => 45.7785, 'longitude' => 4.8291],
            ['city' => 'Lyon', 'code' => '69005', 'name' => '5th arrondissement', 'name_fr' => 'Lyon 5ème', 'slug' => 'lyon-5eme', 'description' => 'Vieux Lyon et Fourvière', 'notable_places' => ['Vieux Lyon', 'Fourvière', 'Basilique'], 'latitude' => 45.7578, 'longitude' => 4.8061],
            ['city' => 'Lyon', 'code' => '69006', 'name' => '6th arrondissement', 'name_fr' => 'Lyon 6ème', 'slug' => 'lyon-6eme', 'description' => 'Quartier chic de Lyon', 'notable_places' => ['Parc de la Tête d\'Or', 'Foch', 'Brotteaux'], 'latitude' => 45.7698, 'longitude' => 4.8478],
            ['city' => 'Lyon', 'code' => '69007', 'name' => '7th arrondissement', 'name_fr' => 'Lyon 7ème', 'slug' => 'lyon-7eme', 'description' => 'Jean Macé et Gerland', 'notable_places' => ['Jean Macé', 'Gerland', 'Halle Tony Garnier'], 'latitude' => 45.7345, 'longitude' => 4.8399],
            ['city' => 'Lyon', 'code' => '69008', 'name' => '8th arrondissement', 'name_fr' => 'Lyon 8ème', 'slug' => 'lyon-8eme', 'description' => 'Monplaisir et Grange Blanche', 'notable_places' => ['Monplaisir', 'États-Unis', 'Grange Blanche'], 'latitude' => 45.7362, 'longitude' => 4.8730],
            ['city' => 'Lyon', 'code' => '69009', 'name' => '9th arrondissement', 'name_fr' => 'Lyon 9ème', 'slug' => 'lyon-9eme', 'description' => 'Vaise et Gorge de Loup', 'notable_places' => ['Vaise', 'Gorge de Loup', 'La Duchère'], 'latitude' => 45.7785, 'longitude' => 4.8047],
        ];
    }

    private function getMarseilleDistricts(): array
    {
        return [
            ['city' => 'Marseille', 'code' => '13001', 'name' => '1st arrondissement', 'name_fr' => 'Marseille 1er', 'slug' => 'marseille-1er', 'description' => 'Centre historique et Vieux-Port', 'notable_places' => ['Vieux-Port', 'Hôtel de Ville', 'Opéra'], 'latitude' => 43.2957, 'longitude' => 5.3812],
            ['city' => 'Marseille', 'code' => '13002', 'name' => '2nd arrondissement', 'name_fr' => 'Marseille 2ème', 'slug' => 'marseille-2eme', 'description' => 'Quartiers du Panier et de la Joliette', 'notable_places' => ['Le Panier', 'MuCEM', 'Joliette'], 'latitude' => 43.3069, 'longitude' => 5.3658],
            ['city' => 'Marseille', 'code' => '13003', 'name' => '3rd arrondissement', 'name_fr' => 'Marseille 3ème', 'slug' => 'marseille-3eme', 'description' => 'Belle de Mai et Saint-Mauront', 'notable_places' => ['Belle de Mai', 'Gare Saint-Charles', 'Friche'], 'latitude' => 43.3102, 'longitude' => 5.3861],
            ['city' => 'Marseille', 'code' => '13004', 'name' => '4th arrondissement', 'name_fr' => 'Marseille 4ème', 'slug' => 'marseille-4eme', 'description' => 'Les Chartreux et Saint-Charles', 'notable_places' => ['Saint-Charles', 'Chartreux', 'Cinq Avenues'], 'latitude' => 43.3047, 'longitude' => 5.4025],
            ['city' => 'Marseille', 'code' => '13005', 'name' => '5th arrondissement', 'name_fr' => 'Marseille 5ème', 'slug' => 'marseille-5eme', 'description' => 'Saint-Pierre et Baille', 'notable_places' => ['Baille', 'Saint-Pierre', 'Préfecture'], 'latitude' => 43.2894, 'longitude' => 5.3983],
            ['city' => 'Marseille', 'code' => '13006', 'name' => '6th arrondissement', 'name_fr' => 'Marseille 6ème', 'slug' => 'marseille-6eme', 'description' => 'Quartier chic de Marseille', 'notable_places' => ['Préfecture', 'Palais Longchamp', 'Castellane'], 'latitude' => 43.2871, 'longitude' => 5.3810],
            ['city' => 'Marseille', 'code' => '13007', 'name' => '7th arrondissement', 'name_fr' => 'Marseille 7ème', 'slug' => 'marseille-7eme', 'description' => 'Bord de mer sud', 'notable_places' => ['Saint-Victor', 'Catalans', 'Endoume'], 'latitude' => 43.2826, 'longitude' => 5.3630],
            ['city' => 'Marseille', 'code' => '13008', 'name' => '8th arrondissement', 'name_fr' => 'Marseille 8ème', 'slug' => 'marseille-8eme', 'description' => 'Plages du Prado', 'notable_places' => ['Prado', 'Plages', 'Parc Borély'], 'latitude' => 43.2554, 'longitude' => 5.3792],
            ['city' => 'Marseille', 'code' => '13009', 'name' => '9th arrondissement', 'name_fr' => 'Marseille 9ème', 'slug' => 'marseille-9eme', 'description' => 'Mazargues et Bonneveine', 'notable_places' => ['Mazargues', 'Bonneveine', 'Roy d\'Espagne'], 'latitude' => 43.2416, 'longitude' => 5.3975],
            ['city' => 'Marseille', 'code' => '13010', 'name' => '10th arrondissement', 'name_fr' => 'Marseille 10ème', 'slug' => 'marseille-10eme', 'description' => 'La Timone et Saint-Tronc', 'notable_places' => ['La Timone', 'Saint-Tronc', 'La Valentine'], 'latitude' => 43.2770, 'longitude' => 5.4260],
            ['city' => 'Marseille', 'code' => '13011', 'name' => '11th arrondissement', 'name_fr' => 'Marseille 11ème', 'slug' => 'marseille-11eme', 'description' => 'Saint-Marcel et La Valbarelle', 'notable_places' => ['Saint-Marcel', 'Valbarelle', 'Parc de Luminy'], 'latitude' => 43.2882, 'longitude' => 5.4652],
            ['city' => 'Marseille', 'code' => '13012', 'name' => '12th arrondissement', 'name_fr' => 'Marseille 12ème', 'slug' => 'marseille-12eme', 'description' => 'Quartier résidentiel est', 'notable_places' => ['Montolivet', 'Les Trois Lucs', 'Saint-Barnabé'], 'latitude' => 43.3053, 'longitude' => 5.4369],
            ['city' => 'Marseille', 'code' => '13013', 'name' => '13th arrondissement', 'name_fr' => 'Marseille 13ème', 'slug' => 'marseille-13eme', 'description' => 'Quartiers nord', 'notable_places' => ['Saint-Mitre', 'Malpassé', 'Château-Gombert'], 'latitude' => 43.3389, 'longitude' => 5.4180],
            ['city' => 'Marseille', 'code' => '13014', 'name' => '14th arrondissement', 'name_fr' => 'Marseille 14ème', 'slug' => 'marseille-14eme', 'description' => 'Sainte-Marthe et Bon Secours', 'notable_places' => ['Sainte-Marthe', 'Bon Secours', 'Le Merlan'], 'latitude' => 43.3347, 'longitude' => 5.3859],
            ['city' => 'Marseille', 'code' => '13015', 'name' => '15th arrondissement', 'name_fr' => 'Marseille 15ème', 'slug' => 'marseille-15eme', 'description' => 'Littoral nord et plages', 'notable_places' => ['L\'Estaque', 'Plages du nord', 'Port de l\'Estaque'], 'latitude' => 43.3573, 'longitude' => 5.3604],
            ['city' => 'Marseille', 'code' => '13016', 'name' => '16th arrondissement', 'name_fr' => 'Marseille 16ème', 'slug' => 'marseille-16eme', 'description' => 'Saint-Henri et L\'Estaque', 'notable_places' => ['Saint-Henri', 'L\'Estaque', 'Saint-André'], 'latitude' => 43.3635, 'longitude' => 5.3295],
        ];
    }

    private function getToulouseDistricts(): array
    {
        return [
            ['city' => 'Toulouse', 'code' => '31TOU01', 'name' => 'Capitole', 'name_fr' => 'Capitole', 'slug' => 'toulouse-capitole', 'description' => 'Centre historique de Toulouse', 'notable_places' => ['Place du Capitole', 'Basilique Saint-Sernin', 'Rue Saint-Rome'], 'latitude' => 43.6045, 'longitude' => 1.4442],
            ['city' => 'Toulouse', 'code' => '31TOU02', 'name' => 'Carmes', 'name_fr' => 'Les Carmes', 'slug' => 'toulouse-carmes', 'description' => 'Quartier tendance et animé', 'notable_places' => ['Marché des Carmes', 'Rue de la Colombette'], 'latitude' => 43.5974, 'longitude' => 1.4465],
            ['city' => 'Toulouse', 'code' => '31TOU03', 'name' => 'Saint-Cyprien', 'name_fr' => 'Saint-Cyprien', 'slug' => 'toulouse-saint-cyprien', 'description' => 'Rive gauche de la Garonne', 'notable_places' => ['Marché Saint-Cyprien', 'Quais de Garonne'], 'latitude' => 43.6007, 'longitude' => 1.4304],
            ['city' => 'Toulouse', 'code' => '31TOU04', 'name' => 'Esquirol', 'name_fr' => 'Esquirol', 'slug' => 'toulouse-esquirol', 'description' => 'Centre commerçant', 'notable_places' => ['Place Esquirol', 'Rue d\'Alsace-Lorraine'], 'latitude' => 43.6000, 'longitude' => 1.4413],
            ['city' => 'Toulouse', 'code' => '31TOU05', 'name' => 'Jean-Jaurès', 'name_fr' => 'Jean-Jaurès', 'slug' => 'toulouse-jean-jaures', 'description' => 'Quartier de la gare', 'notable_places' => ['Gare Matabiau', 'Canal du Midi'], 'latitude' => 43.6106, 'longitude' => 1.4515],
            ['city' => 'Toulouse', 'code' => '31TOU06', 'name' => 'Compans-Caffarelli', 'name_fr' => 'Compans-Caffarelli', 'slug' => 'toulouse-compans-caffarelli', 'description' => 'Quartier moderne', 'notable_places' => ['Jardin Compans-Caffarelli', 'Palais des Sports'], 'latitude' => 43.6119, 'longitude' => 1.4328],
            ['city' => 'Toulouse', 'code' => '31TOU07', 'name' => 'Rangueil', 'name_fr' => 'Rangueil', 'slug' => 'toulouse-rangueil', 'description' => 'Quartier universitaire', 'notable_places' => ['Université Paul Sabatier', 'CHU Rangueil'], 'latitude' => 43.5686, 'longitude' => 1.4661],
            ['city' => 'Toulouse', 'code' => '31TOU08', 'name' => 'Minimes', 'name_fr' => 'Les Minimes', 'slug' => 'toulouse-minimes', 'description' => 'Quartier résidentiel nord', 'notable_places' => ['Place des Minimes', 'Canal du Midi'], 'latitude' => 43.6210, 'longitude' => 1.4396],
            ['city' => 'Toulouse', 'code' => '31TOU09', 'name' => 'Purpan', 'name_fr' => 'Purpan', 'slug' => 'toulouse-purpan', 'description' => 'Quartier ouest avec CHU', 'notable_places' => ['CHU Purpan', 'Aéroport Toulouse-Blagnac'], 'latitude' => 43.6181, 'longitude' => 1.4023],
            ['city' => 'Toulouse', 'code' => '31TOU10', 'name' => 'Borderouge', 'name_fr' => 'Borderouge', 'slug' => 'toulouse-borderouge', 'description' => 'Quartier en développement', 'notable_places' => ['Parc de Borderouge', 'Quartier neuf'], 'latitude' => 43.6414, 'longitude' => 1.4366],
        ];
    }
}
