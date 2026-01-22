<?php

namespace Database\Seeders;

use App\Models\PopularService;
use Illuminate\Database\Seeder;

class PopularServicesSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            // Plomberie
            ['slug' => 'plombier', 'name' => 'Plumber', 'name_fr' => 'Plombier', 'category' => 'plumbing', 'subcategory' => null, 'description' => 'General plumbing services', 'description_fr' => 'Services de plomberie générale', 'price_range' => '50€ - 150€', 'search_volume' => 5000],
            ['slug' => 'debouchage-canalisation', 'name' => 'Drain Unclogging', 'name_fr' => 'Débouchage canalisation', 'category' => 'plumbing', 'subcategory' => 'debouchage', 'description' => 'Professional drain unclogging', 'description_fr' => 'Débouchage professionnel de canalisations', 'price_range' => '80€ - 200€', 'search_volume' => 3500],
            ['slug' => 'reparation-fuite-eau', 'name' => 'Water Leak Repair', 'name_fr' => 'Réparation fuite d\'eau', 'category' => 'plumbing', 'subcategory' => 'reparation-fuite', 'description' => 'Emergency water leak repair', 'description_fr' => 'Réparation urgente de fuite d\'eau', 'price_range' => '60€ - 180€', 'search_volume' => 3200],
            ['slug' => 'installation-chauffe-eau', 'name' => 'Water Heater Installation', 'name_fr' => 'Installation chauffe-eau', 'category' => 'plumbing', 'subcategory' => 'chauffe-eau', 'description' => 'Water heater installation and replacement', 'description_fr' => 'Installation et remplacement de chauffe-eau', 'price_range' => '300€ - 800€', 'search_volume' => 2800],
            
            // Électricité
            ['slug' => 'electricien', 'name' => 'Electrician', 'name_fr' => 'Électricien', 'category' => 'electrician', 'subcategory' => null, 'description' => 'Electrical services', 'description_fr' => 'Services d\'électricité', 'price_range' => '60€ - 200€', 'search_volume' => 4800],
            ['slug' => 'depannage-electrique-urgence', 'name' => 'Emergency Electrical Repair', 'name_fr' => 'Dépannage électrique urgence', 'category' => 'electrician', 'subcategory' => null, 'description' => 'Emergency electrical repair 24/7', 'description_fr' => 'Dépannage électrique d\'urgence 24h/24', 'price_range' => '80€ - 250€', 'search_volume' => 3000],
            ['slug' => 'installation-tableau-electrique', 'name' => 'Electrical Panel Installation', 'name_fr' => 'Installation tableau électrique', 'category' => 'electrician', 'subcategory' => null, 'description' => 'Electrical panel installation', 'description_fr' => 'Installation de tableau électrique', 'price_range' => '400€ - 1200€', 'search_volume' => 2500],
            
            // Déménagement et montage
            ['slug' => 'demenagement', 'name' => 'Moving', 'name_fr' => 'Déménagement', 'category' => 'furniture', 'subcategory' => 'aide-demenagement', 'description' => 'Moving services', 'description_fr' => 'Services de déménagement', 'price_range' => '200€ - 800€', 'search_volume' => 4500],
            ['slug' => 'montage-meuble-ikea', 'name' => 'IKEA Furniture Assembly', 'name_fr' => 'Montage meuble IKEA', 'category' => 'furniture', 'subcategory' => 'montage-meubles', 'description' => 'IKEA furniture assembly service', 'description_fr' => 'Service de montage de meubles IKEA', 'price_range' => '40€ - 150€', 'search_volume' => 4200],
            ['slug' => 'montage-meuble', 'name' => 'Furniture Assembly', 'name_fr' => 'Montage de meuble', 'category' => 'furniture', 'subcategory' => 'montage-meubles', 'description' => 'Professional furniture assembly', 'description_fr' => 'Montage professionnel de meubles', 'price_range' => '35€ - 120€', 'search_volume' => 3800],
            ['slug' => 'transport-meubles', 'name' => 'Furniture Transport', 'name_fr' => 'Transport de meubles', 'category' => 'furniture', 'subcategory' => 'transport-meubles', 'description' => 'Furniture transportation', 'description_fr' => 'Transport de meubles', 'price_range' => '80€ - 300€', 'search_volume' => 2900],
            
            // Ménage
            ['slug' => 'menage', 'name' => 'Cleaning', 'name_fr' => 'Ménage', 'category' => 'cleaning', 'subcategory' => 'menage-regulier', 'description' => 'House cleaning services', 'description_fr' => 'Services de ménage à domicile', 'price_range' => '25€ - 40€/h', 'search_volume' => 4000],
            ['slug' => 'grand-menage', 'name' => 'Deep Cleaning', 'name_fr' => 'Grand ménage', 'category' => 'cleaning', 'subcategory' => 'grand-menage', 'description' => 'Deep cleaning service', 'description_fr' => 'Service de grand ménage', 'price_range' => '150€ - 400€', 'search_volume' => 3100],
            ['slug' => 'nettoyage-apres-travaux', 'name' => 'Post-Construction Cleaning', 'name_fr' => 'Nettoyage après travaux', 'category' => 'cleaning', 'subcategory' => 'nettoyage-apres-travaux', 'description' => 'Post-construction cleaning', 'description_fr' => 'Nettoyage après travaux', 'price_range' => '200€ - 600€', 'search_volume' => 2700],
            ['slug' => 'nettoyage-vitres', 'name' => 'Window Cleaning', 'name_fr' => 'Nettoyage de vitres', 'category' => 'cleaning', 'subcategory' => 'nettoyage-vitres', 'description' => 'Professional window cleaning', 'description_fr' => 'Nettoyage professionnel de vitres', 'price_range' => '60€ - 150€', 'search_volume' => 2400],
            
            // Jardinage
            ['slug' => 'jardinier', 'name' => 'Gardener', 'name_fr' => 'Jardinier', 'category' => 'garden', 'subcategory' => 'entretien-jardin', 'description' => 'Garden maintenance', 'description_fr' => 'Entretien de jardin', 'price_range' => '30€ - 60€/h', 'search_volume' => 3600],
            ['slug' => 'tonte-pelouse', 'name' => 'Lawn Mowing', 'name_fr' => 'Tonte de pelouse', 'category' => 'garden', 'subcategory' => 'tonte-pelouse', 'description' => 'Lawn mowing service', 'description_fr' => 'Service de tonte de pelouse', 'price_range' => '40€ - 100€', 'search_volume' => 2900],
            ['slug' => 'taille-haie', 'name' => 'Hedge Trimming', 'name_fr' => 'Taille de haie', 'category' => 'garden', 'subcategory' => 'taille-haie', 'description' => 'Professional hedge trimming', 'description_fr' => 'Taille professionnelle de haies', 'price_range' => '50€ - 120€', 'search_volume' => 2300],
            ['slug' => 'elagage-arbre', 'name' => 'Tree Pruning', 'name_fr' => 'Élagage d\'arbre', 'category' => 'garden', 'subcategory' => null, 'description' => 'Professional tree pruning', 'description_fr' => 'Élagage professionnel d\'arbres', 'price_range' => '150€ - 500€', 'search_volume' => 2100],
            
            // Rénovation
            ['slug' => 'peintre', 'name' => 'Painter', 'name_fr' => 'Peintre', 'category' => 'painter', 'subcategory' => 'peinture', 'description' => 'Professional painting services', 'description_fr' => 'Services de peinture professionnelle', 'price_range' => '25€ - 45€/m²', 'search_volume' => 3700],
            ['slug' => 'peinture-appartement', 'name' => 'Apartment Painting', 'name_fr' => 'Peinture appartement', 'category' => 'painter', 'subcategory' => 'peinture', 'description' => 'Complete apartment painting', 'description_fr' => 'Peinture complète d\'appartement', 'price_range' => '800€ - 3000€', 'search_volume' => 2800],
            ['slug' => 'pose-parquet', 'name' => 'Parquet Installation', 'name_fr' => 'Pose de parquet', 'category' => 'walls_ceiling', 'subcategory' => 'sol', 'description' => 'Professional parquet installation', 'description_fr' => 'Pose professionnelle de parquet', 'price_range' => '30€ - 70€/m²', 'search_volume' => 2600],
            ['slug' => 'pose-carrelage', 'name' => 'Tile Installation', 'name_fr' => 'Pose de carrelage', 'category' => 'walls_ceiling', 'subcategory' => 'sol', 'description' => 'Professional tile installation', 'description_fr' => 'Pose professionnelle de carrelage', 'price_range' => '35€ - 80€/m²', 'search_volume' => 2500],
            
            // Services informatiques
            ['slug' => 'depannage-informatique', 'name' => 'Computer Repair', 'name_fr' => 'Dépannage informatique', 'category' => 'it_web', 'subcategory' => 'depannage-informatique', 'description' => 'Computer repair and troubleshooting', 'description_fr' => 'Réparation et dépannage informatique', 'price_range' => '50€ - 120€', 'search_volume' => 3300],
            ['slug' => 'installation-wifi', 'name' => 'WiFi Installation', 'name_fr' => 'Installation WiFi', 'category' => 'it_web', 'subcategory' => 'reseau-wifi', 'description' => 'WiFi network installation', 'description_fr' => 'Installation de réseau WiFi', 'price_range' => '60€ - 150€', 'search_volume' => 2200],
            ['slug' => 'recuperation-donnees', 'name' => 'Data Recovery', 'name_fr' => 'Récupération de données', 'category' => 'it_web', 'subcategory' => 'recuperation-donnees', 'description' => 'Professional data recovery', 'description_fr' => 'Récupération professionnelle de données', 'price_range' => '100€ - 500€', 'search_volume' => 1900],
            
            // Serrurerie
            ['slug' => 'serrurier', 'name' => 'Locksmith', 'name_fr' => 'Serrurier', 'category' => 'garage_gates', 'subcategory' => null, 'description' => 'Locksmith services', 'description_fr' => 'Services de serrurerie', 'price_range' => '70€ - 200€', 'search_volume' => 3400],
            ['slug' => 'ouverture-porte-urgence', 'name' => 'Emergency Door Opening', 'name_fr' => 'Ouverture porte urgence', 'category' => 'garage_gates', 'subcategory' => null, 'description' => 'Emergency door opening 24/7', 'description_fr' => 'Ouverture de porte en urgence 24h/24', 'price_range' => '90€ - 250€', 'search_volume' => 2900],
            ['slug' => 'changement-serrure', 'name' => 'Lock Replacement', 'name_fr' => 'Changement de serrure', 'category' => 'garage_gates', 'subcategory' => null, 'description' => 'Professional lock replacement', 'description_fr' => 'Changement professionnel de serrure', 'price_range' => '80€ - 180€', 'search_volume' => 2400],
            
            // Garde d'enfants
            ['slug' => 'garde-enfants', 'name' => 'Childcare', 'name_fr' => 'Garde d\'enfants', 'category' => 'childcare', 'subcategory' => 'garde-reguliere', 'description' => 'Professional childcare', 'description_fr' => 'Garde d\'enfants professionnelle', 'price_range' => '10€ - 20€/h', 'search_volume' => 3200],
            ['slug' => 'baby-sitting', 'name' => 'Babysitting', 'name_fr' => 'Baby-sitting', 'category' => 'childcare', 'subcategory' => 'garde-ponctuelle', 'description' => 'Occasional babysitting', 'description_fr' => 'Baby-sitting occasionnel', 'price_range' => '12€ - 18€/h', 'search_volume' => 2800],
            ['slug' => 'nounou-domicile', 'name' => 'Home Nanny', 'name_fr' => 'Nounou à domicile', 'category' => 'childcare', 'subcategory' => 'garde-reguliere', 'description' => 'Regular home nanny service', 'description_fr' => 'Service de nounou à domicile régulière', 'price_range' => '10€ - 16€/h', 'search_volume' => 2500],
            
            // Cours particuliers
            ['slug' => 'cours-particuliers-maths', 'name' => 'Math Tutoring', 'name_fr' => 'Cours particuliers maths', 'category' => 'education', 'subcategory' => 'mathematiques', 'description' => 'Private math tutoring', 'description_fr' => 'Cours particuliers de mathématiques', 'price_range' => '20€ - 40€/h', 'search_volume' => 2700],
            ['slug' => 'cours-anglais', 'name' => 'English Lessons', 'name_fr' => 'Cours d\'anglais', 'category' => 'education', 'subcategory' => 'langues', 'description' => 'Private English lessons', 'description_fr' => 'Cours particuliers d\'anglais', 'price_range' => '20€ - 35€/h', 'search_volume' => 2600],
            ['slug' => 'soutien-scolaire', 'name' => 'Academic Support', 'name_fr' => 'Soutien scolaire', 'category' => 'education', 'subcategory' => null, 'description' => 'Academic tutoring and support', 'description_fr' => 'Soutien scolaire et aide aux devoirs', 'price_range' => '18€ - 35€/h', 'search_volume' => 2400],
            
            // Réparation électroménager
            ['slug' => 'reparation-lave-linge', 'name' => 'Washing Machine Repair', 'name_fr' => 'Réparation lave-linge', 'category' => 'installation_repair', 'subcategory' => 'lave-linge', 'description' => 'Washing machine repair', 'description_fr' => 'Réparation de lave-linge', 'price_range' => '60€ - 150€', 'search_volume' => 2300],
            ['slug' => 'reparation-frigo', 'name' => 'Refrigerator Repair', 'name_fr' => 'Réparation frigo', 'category' => 'installation_repair', 'subcategory' => 'refrigerateur', 'description' => 'Refrigerator repair service', 'description_fr' => 'Service de réparation de réfrigérateur', 'price_range' => '70€ - 180€', 'search_volume' => 2100],
            ['slug' => 'reparation-lave-vaisselle', 'name' => 'Dishwasher Repair', 'name_fr' => 'Réparation lave-vaisselle', 'category' => 'installation_repair', 'subcategory' => 'lave-vaisselle', 'description' => 'Dishwasher repair service', 'description_fr' => 'Service de réparation de lave-vaisselle', 'price_range' => '60€ - 140€', 'search_volume' => 1900],
            
            // Aide administrative
            ['slug' => 'aide-administrative', 'name' => 'Administrative Help', 'name_fr' => 'Aide administrative', 'category' => 'business', 'subcategory' => null, 'description' => 'Administrative assistance', 'description_fr' => 'Assistance administrative', 'price_range' => '20€ - 40€/h', 'search_volume' => 2000],
            ['slug' => 'comptabilite-auto-entrepreneur', 'name' => 'Self-Employed Accounting', 'name_fr' => 'Comptabilité auto-entrepreneur', 'category' => 'financial', 'subcategory' => null, 'description' => 'Accounting for self-employed', 'description_fr' => 'Comptabilité pour auto-entrepreneurs', 'price_range' => '50€ - 150€/mois', 'search_volume' => 1800],
            
            // Santé et beauté
            ['slug' => 'massage-domicile', 'name' => 'Home Massage', 'name_fr' => 'Massage à domicile', 'category' => 'health_beauty', 'subcategory' => null, 'description' => 'Professional home massage', 'description_fr' => 'Massage professionnel à domicile', 'price_range' => '50€ - 100€', 'search_volume' => 2200],
            ['slug' => 'coiffure-domicile', 'name' => 'Home Hairdressing', 'name_fr' => 'Coiffure à domicile', 'category' => 'health_beauty', 'subcategory' => null, 'description' => 'Professional home hairdressing', 'description_fr' => 'Coiffure professionnelle à domicile', 'price_range' => '30€ - 80€', 'search_volume' => 2100],
            
            // Animaux
            ['slug' => 'garde-chien', 'name' => 'Dog Sitting', 'name_fr' => 'Garde de chien', 'category' => 'pets', 'subcategory' => null, 'description' => 'Professional dog sitting', 'description_fr' => 'Garde professionnelle de chien', 'price_range' => '15€ - 30€/jour', 'search_volume' => 2400],
            ['slug' => 'promenade-chien', 'name' => 'Dog Walking', 'name_fr' => 'Promenade de chien', 'category' => 'pets', 'subcategory' => null, 'description' => 'Professional dog walking', 'description_fr' => 'Promenade professionnelle de chien', 'price_range' => '10€ - 20€', 'search_volume' => 2000],
            ['slug' => 'toilettage-chien', 'name' => 'Dog Grooming', 'name_fr' => 'Toilettage chien', 'category' => 'pets', 'subcategory' => null, 'description' => 'Professional dog grooming', 'description_fr' => 'Toilettage professionnel de chien', 'price_range' => '30€ - 80€', 'search_volume' => 1800],
            
            // Services seniors
            ['slug' => 'aide-personne-agee', 'name' => 'Elderly Care', 'name_fr' => 'Aide personne âgée', 'category' => 'elderly_care', 'subcategory' => null, 'description' => 'Elderly care assistance', 'description_fr' => 'Assistance aux personnes âgées', 'price_range' => '15€ - 25€/h', 'search_volume' => 2100],
            ['slug' => 'aide-menagere-seniors', 'name' => 'Senior Home Help', 'name_fr' => 'Aide ménagère seniors', 'category' => 'elderly_care', 'subcategory' => null, 'description' => 'Home help for seniors', 'description_fr' => 'Aide ménagère pour personnes âgées', 'price_range' => '18€ - 28€/h', 'search_volume' => 1900],
            
            // Toiture et façade (ТОП-25 популярних послуг)
            ['slug' => 'couvreur', 'name' => 'Roofer', 'name_fr' => 'Couvreur', 'category' => 'roof_facade', 'subcategory' => 'roofing', 'description' => 'Professional roofing services', 'description_fr' => 'Services de couverture professionnelle', 'price_range' => '80€ - 150€/m²', 'search_volume' => 3100],
            ['slug' => 'isolation-toiture', 'name' => 'Roof Insulation', 'name_fr' => 'Isolation toiture', 'category' => 'roof_facade', 'subcategory' => 'insulation_roof', 'description' => 'Roof insulation services', 'description_fr' => 'Services d\'isolation de toiture', 'price_range' => '40€ - 90€/m²', 'search_volume' => 2400],
            ['slug' => 'gouttiere', 'name' => 'Gutter Installation', 'name_fr' => 'Installation gouttière', 'category' => 'roof_facade', 'subcategory' => 'gutters', 'description' => 'Gutter installation and repair', 'description_fr' => 'Installation et réparation de gouttières', 'price_range' => '30€ - 80€/m', 'search_volume' => 2000],
            ['slug' => 'ravalement-facade', 'name' => 'Facade Renovation', 'name_fr' => 'Ravalement de façade', 'category' => 'roof_facade', 'subcategory' => 'facade_work', 'description' => 'Facade renovation and cleaning', 'description_fr' => 'Ravalement et nettoyage de façade', 'price_range' => '50€ - 120€/m²', 'search_volume' => 2600],
            
            // Extérieur
            ['slug' => 'piscine', 'name' => 'Pool Installation', 'name_fr' => 'Installation piscine', 'category' => 'outdoor', 'subcategory' => 'pool_installation', 'description' => 'Swimming pool installation', 'description_fr' => 'Installation de piscine', 'price_range' => '15000€ - 50000€', 'search_volume' => 2800],
            ['slug' => 'terrasse-bois', 'name' => 'Wood Deck', 'name_fr' => 'Terrasse bois', 'category' => 'outdoor', 'subcategory' => 'wood_deck', 'description' => 'Wood deck installation', 'description_fr' => 'Installation de terrasse en bois', 'price_range' => '60€ - 150€/m²', 'search_volume' => 2500],
            ['slug' => 'pergola', 'name' => 'Pergola Installation', 'name_fr' => 'Installation pergola', 'category' => 'outdoor', 'subcategory' => 'pergola', 'description' => 'Pergola installation', 'description_fr' => 'Installation de pergola', 'price_range' => '2000€ - 8000€', 'search_volume' => 2100],
            ['slug' => 'portail', 'name' => 'Gate Installation', 'name_fr' => 'Installation portail', 'category' => 'garage_gates', 'subcategory' => 'gate_install', 'description' => 'Gate installation and automation', 'description_fr' => 'Installation et automatisation de portail', 'price_range' => '1500€ - 5000€', 'search_volume' => 2300],
            
            // Construction
            ['slug' => 'macon', 'name' => 'Mason', 'name_fr' => 'Maçon', 'category' => 'construction', 'subcategory' => 'masonry', 'description' => 'Professional masonry services', 'description_fr' => 'Services de maçonnerie professionnelle', 'price_range' => '40€ - 80€/h', 'search_volume' => 2700],
            ['slug' => 'demolition', 'name' => 'Demolition', 'name_fr' => 'Démolition', 'category' => 'construction', 'subcategory' => 'demolition', 'description' => 'Demolition services', 'description_fr' => 'Services de démolition', 'price_range' => '50€ - 150€/m²', 'search_volume' => 1900],
            
            // Chauffage et climatisation
            ['slug' => 'climatisation', 'name' => 'Air Conditioning', 'name_fr' => 'Climatisation', 'category' => 'plumbing', 'subcategory' => null, 'description' => 'Air conditioning installation and repair', 'description_fr' => 'Installation et réparation de climatisation', 'price_range' => '500€ - 3000€', 'search_volume' => 3000],
            ['slug' => 'chauffage', 'name' => 'Heating', 'name_fr' => 'Installation chauffage', 'category' => 'plumbing', 'subcategory' => null, 'description' => 'Heating system installation', 'description_fr' => 'Installation de système de chauffage', 'price_range' => '1000€ - 8000€', 'search_volume' => 2400],
            ['slug' => 'pompe-chaleur', 'name' => 'Heat Pump', 'name_fr' => 'Pompe à chaleur', 'category' => 'plumbing', 'subcategory' => null, 'description' => 'Heat pump installation', 'description_fr' => 'Installation de pompe à chaleur', 'price_range' => '8000€ - 16000€', 'search_volume' => 2200],
            
            // Ménage et repassage
            ['slug' => 'repassage', 'name' => 'Ironing', 'name_fr' => 'Repassage', 'category' => 'cleaning', 'subcategory' => null, 'description' => 'Ironing service', 'description_fr' => 'Service de repassage', 'price_range' => '15€ - 25€/h', 'search_volume' => 2000],
            ['slug' => 'femme-menage', 'name' => 'Housekeeper', 'name_fr' => 'Femme de ménage', 'category' => 'cleaning', 'subcategory' => 'menage-regulier', 'description' => 'Regular housekeeping service', 'description_fr' => 'Service de femme de ménage régulier', 'price_range' => '20€ - 35€/h', 'search_volume' => 3500],
            
            // Jardinage avancé
            ['slug' => 'paysagiste', 'name' => 'Landscaper', 'name_fr' => 'Paysagiste', 'category' => 'garden', 'subcategory' => null, 'description' => 'Professional landscaping', 'description_fr' => 'Aménagement paysager professionnel', 'price_range' => '50€ - 100€/h', 'search_volume' => 2800],
            ['slug' => 'arrosage-automatique', 'name' => 'Automatic Irrigation', 'name_fr' => 'Arrosage automatique', 'category' => 'garden', 'subcategory' => null, 'description' => 'Automatic irrigation system installation', 'description_fr' => 'Installation de système d\'arrosage automatique', 'price_range' => '800€ - 3000€', 'search_volume' => 1700],
            
            // Rénovation intérieure
            ['slug' => 'tapissier', 'name' => 'Upholsterer', 'name_fr' => 'Tapissier', 'category' => 'painter', 'subcategory' => null, 'description' => 'Professional upholstery services', 'description_fr' => 'Services de tapisserie professionnelle', 'price_range' => '30€ - 60€/m²', 'search_volume' => 1600],
            ['slug' => 'platrier', 'name' => 'Plasterer', 'name_fr' => 'Plâtrier', 'category' => 'walls_ceiling', 'subcategory' => null, 'description' => 'Professional plastering services', 'description_fr' => 'Services de plâtrerie professionnelle', 'price_range' => '25€ - 50€/m²', 'search_volume' => 1800],
            
            // Électricité avancée
            ['slug' => 'borne-electrique', 'name' => 'EV Charger Installation', 'name_fr' => 'Installation borne électrique', 'category' => 'electrician', 'subcategory' => null, 'description' => 'Electric vehicle charger installation', 'description_fr' => 'Installation de borne de recharge électrique', 'price_range' => '500€ - 2000€', 'search_volume' => 2300],
            ['slug' => 'domotique', 'name' => 'Home Automation', 'name_fr' => 'Domotique', 'category' => 'electrician', 'subcategory' => null, 'description' => 'Home automation installation', 'description_fr' => 'Installation de domotique', 'price_range' => '1000€ - 5000€', 'search_volume' => 2000],
            ['slug' => 'antenne-tv', 'name' => 'TV Antenna', 'name_fr' => 'Installation antenne TV', 'category' => 'electrician', 'subcategory' => null, 'description' => 'TV antenna installation', 'description_fr' => 'Installation d\'antenne TV', 'price_range' => '80€ - 250€', 'search_volume' => 1700],
            
            // Santé et bien-être
            ['slug' => 'osteopathe-domicile', 'name' => 'Home Osteopath', 'name_fr' => 'Ostéopathe à domicile', 'category' => 'health_beauty', 'subcategory' => null, 'description' => 'Home osteopathy services', 'description_fr' => 'Services d\'ostéopathie à domicile', 'price_range' => '50€ - 90€', 'search_volume' => 1900],
            ['slug' => 'estheticienne-domicile', 'name' => 'Home Beautician', 'name_fr' => 'Esthéticienne à domicile', 'category' => 'health_beauty', 'subcategory' => null, 'description' => 'Home beauty services', 'description_fr' => 'Services d\'esthétique à domicile', 'price_range' => '40€ - 80€', 'search_volume' => 1800],
        ];

        foreach ($services as $service) {
            PopularService::create($service);
        }
    }
}
