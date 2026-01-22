<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\BlogPost;

class BlogArticlesSeeder extends Seeder
{
    public function run(): void
    {
        // Статті які були hardcoded в frontend
        $articles = [
            [
                'slug' => 'prix-pose-carrelage-2026',
                'title' => 'Prix de la pose de carrelage en 2026 : Tarifs et conseils',
                'excerpt' => 'Vous envisagez de refaire votre carrelage ? Découvrez tous les prix pratiqués en 2026 et nos conseils pour trouver le meilleur carreleur.',
                'category' => 'renovation',
                'keywords' => ['prix pose carrelage', 'tarif carreleur', 'cout carrelage m2', 'devis carrelage', 'carreleur paris'],
                'reading_time' => 8,
                'published' => true,
                'published_at' => '2026-01-15',
                'content' => '<h2>Quel est le prix de la pose de carrelage en 2026 ?</h2>
<p>Le prix de la pose de carrelage varie considérablement selon plusieurs facteurs. En moyenne, comptez entre <strong>30€ et 60€ par m²</strong> pour la main d\'œuvre seule, hors fourniture du carrelage.</p>

<h3>Tableau des prix moyens</h3>
<table>
<thead><tr><th>Type de pose</th><th>Prix au m² (main d\'œuvre)</th></tr></thead>
<tbody>
<tr><td>Pose droite classique</td><td>25€ - 40€</td></tr>
<tr><td>Pose en diagonale</td><td>35€ - 50€</td></tr>
<tr><td>Pose de mosaïque</td><td>50€ - 80€</td></tr>
<tr><td>Pose de grands formats</td><td>40€ - 60€</td></tr>
<tr><td>Pose murale (faïence)</td><td>35€ - 55€</td></tr>
</tbody>
</table>

<h2>Les facteurs qui influencent le prix</h2>
<p>Le format, le matériau et la qualité du carrelage impactent directement le temps de pose.</p>',
            ],
            [
                'slug' => 'combien-coute-plombier-2026',
                'title' => 'Combien coûte un plombier en 2026 ? Tarifs et prix moyens',
                'excerpt' => 'Fuite d\'eau, débouchage, installation... Découvrez tous les tarifs des plombiers en 2026 et comment trouver un professionnel de confiance.',
                'category' => 'plomberie',
                'keywords' => ['prix plombier', 'tarif plombier', 'cout plombier', 'plombier pas cher', 'devis plombier'],
                'reading_time' => 7,
                'published' => true,
                'published_at' => '2026-01-10',
                'content' => '<h2>Tarif horaire d\'un plombier en 2026</h2>
<p>Le tarif horaire d\'un plombier varie entre <strong>40€ et 80€ de l\'heure</strong> selon la région et le type d\'intervention.</p>

<h3>Prix des interventions courantes</h3>
<table>
<thead><tr><th>Intervention</th><th>Prix moyen</th></tr></thead>
<tbody>
<tr><td>Débouchage simple</td><td>80€ - 150€</td></tr>
<tr><td>Réparation fuite d\'eau</td><td>100€ - 200€</td></tr>
<tr><td>Remplacement robinet</td><td>80€ - 150€</td></tr>
<tr><td>Installation WC</td><td>200€ - 400€</td></tr>
</tbody>
</table>',
            ],
            [
                'slug' => 'prix-electricien-2026',
                'title' => 'Prix d\'un électricien en 2026 : Tarifs et devis',
                'excerpt' => 'Installation, dépannage, mise aux normes... Tous les prix des électriciens en 2026 et comment choisir le bon professionnel.',
                'category' => 'electricite',
                'keywords' => ['prix electricien', 'tarif electricien', 'cout electricien', 'devis electricien', 'electricien paris'],
                'reading_time' => 6,
                'published' => true,
                'published_at' => '2026-01-08',
                'content' => '<h2>Tarif horaire d\'un électricien en 2026</h2>
<p>Le tarif horaire d\'un électricien se situe entre <strong>35€ et 70€ de l\'heure</strong>.</p>

<h3>Prix des travaux électriques courants</h3>
<table>
<thead><tr><th>Travaux</th><th>Prix moyen</th></tr></thead>
<tbody>
<tr><td>Installation prise électrique</td><td>50€ - 100€</td></tr>
<tr><td>Remplacement tableau électrique</td><td>800€ - 2000€</td></tr>
<tr><td>Mise aux normes NF C 15-100</td><td>1500€ - 5000€</td></tr>
</tbody>
</table>',
            ],
            [
                'slug' => 'cout-demenagement-paris-2026',
                'title' => 'Coût d\'un déménagement à Paris en 2026 : Prix et conseils',
                'excerpt' => 'Vous déménagez à Paris ? Découvrez tous les tarifs des déménageurs parisiens et nos astuces pour réduire la facture.',
                'category' => 'demenagement',
                'keywords' => ['prix demenagement paris', 'cout demenagement', 'demenageur paris', 'devis demenagement'],
                'reading_time' => 9,
                'published' => true,
                'published_at' => '2026-01-05',
                'content' => '<h2>Prix moyen d\'un déménagement à Paris</h2>
<p>Le coût d\'un déménagement à Paris dépend du volume et de la distance.</p>

<h3>Tarifs selon le type de logement</h3>
<table>
<thead><tr><th>Type</th><th>Volume</th><th>Prix</th></tr></thead>
<tbody>
<tr><td>Studio</td><td>10-15 m³</td><td>300€ - 600€</td></tr>
<tr><td>2 pièces</td><td>20-25 m³</td><td>500€ - 900€</td></tr>
<tr><td>3 pièces</td><td>30-40 m³</td><td>800€ - 1500€</td></tr>
</tbody>
</table>',
            ],
            [
                'slug' => 'tarif-femme-menage-paris-2026',
                'title' => 'Tarif d\'une femme de ménage à Paris en 2026',
                'excerpt' => 'Vous cherchez une femme de ménage à Paris ? Découvrez les tarifs pratiqués et comment bénéficier du crédit d\'impôt.',
                'category' => 'menage',
                'keywords' => ['femme de menage paris', 'tarif menage', 'aide menagere', 'prix menage'],
                'reading_time' => 5,
                'published' => true,
                'published_at' => '2026-01-03',
                'content' => '<h2>Prix d\'une femme de ménage à Paris en 2026</h2>
<p>Le tarif horaire varie entre <strong>15€ et 25€ de l\'heure</strong>.</p>

<h3>Tarifs selon le type de prestation</h3>
<table>
<thead><tr><th>Prestation</th><th>Prix horaire</th></tr></thead>
<tbody>
<tr><td>Ménage classique</td><td>15€ - 20€</td></tr>
<tr><td>Ménage + repassage</td><td>18€ - 25€</td></tr>
<tr><td>Grand ménage</td><td>20€ - 30€</td></tr>
</tbody>
</table>

<h2>Le crédit d\'impôt de 50%</h2>
<p>Les services à domicile bénéficient d\'un crédit d\'impôt de 50%.</p>',
            ],
            [
                'slug' => 'renovation-salle-de-bain-prix-2026',
                'title' => 'Prix rénovation salle de bain 2026 : Budget et conseils',
                'excerpt' => 'Vous souhaitez rénover votre salle de bain ? Découvrez tous les coûts à prévoir et comment optimiser votre budget.',
                'category' => 'renovation',
                'keywords' => ['renovation salle de bain prix', 'cout salle de bain', 'refaire salle de bain'],
                'reading_time' => 10,
                'published' => true,
                'published_at' => '2026-01-01',
                'content' => '<h2>Budget moyen pour rénover une salle de bain</h2>
<p>Le coût varie selon l\'ampleur des travaux.</p>

<h3>Prix selon le type de rénovation</h3>
<table>
<thead><tr><th>Type</th><th>Prix moyen</th></tr></thead>
<tbody>
<tr><td>Rafraîchissement</td><td>500€ - 2000€</td></tr>
<tr><td>Rénovation partielle</td><td>3000€ - 6000€</td></tr>
<tr><td>Rénovation complète</td><td>6000€ - 15000€</td></tr>
</tbody>
</table>',
            ],
            [
                'slug' => 'comment-choisir-artisan-confiance',
                'title' => 'Comment choisir un artisan de confiance ? Guide complet',
                'excerpt' => 'Trouver un bon artisan peut être un vrai casse-tête. Voici notre guide complet pour faire le bon choix.',
                'category' => 'conseils',
                'keywords' => ['choisir artisan', 'artisan confiance', 'trouver artisan', 'bon artisan'],
                'reading_time' => 8,
                'published' => true,
                'published_at' => '2024-12-20',
                'content' => '<h2>10 conseils pour choisir un artisan de confiance</h2>
<h3>1. Vérifiez les assurances</h3>
<p>Tout artisan doit avoir une assurance responsabilité civile professionnelle.</p>
<h3>2. Demandez plusieurs devis</h3>
<p>Comparez au moins 3 devis.</p>
<h3>3. Consultez les avis clients</h3>
<p>Les avis en ligne sont précieux.</p>',
            ],
            [
                'slug' => 'aides-renovation-energetique-2026',
                'title' => 'Aides à la rénovation énergétique 2026 : Guide complet',
                'excerpt' => 'Isolation, chauffage, fenêtres... Découvrez toutes les aides disponibles pour financer vos travaux de rénovation énergétique.',
                'category' => 'renovation',
                'keywords' => ['aide renovation energetique', 'maprimerénov', 'prime energie', 'subvention travaux'],
                'reading_time' => 12,
                'published' => true,
                'published_at' => '2024-12-15',
                'content' => '<h2>Les principales aides en 2026</h2>
<h3>MaPrimeRénov\'</h3>
<p>L\'aide principale de l\'État pour la rénovation énergétique.</p>
<h3>Certificats d\'Économies d\'Énergie (CEE)</h3>
<p>Les fournisseurs d\'énergie financent une partie de vos travaux.</p>',
            ],
            [
                'slug' => 'artisans-ukrainiens-paris',
                'title' => 'Trouvez des artisans ukrainiens qualifiés à Paris',
                'excerpt' => 'Les artisans ukrainiens sont réputés pour leur sérieux, leur savoir-faire et leurs tarifs compétitifs.',
                'category' => 'conseils',
                'keywords' => ['artisans ukrainiens paris', 'prestataires ukrainiens', 'manucure ukrainienne'],
                'reading_time' => 10,
                'published' => true,
                'published_at' => '2026-01-01',
                'content' => '<h1>Les meilleurs artisans ukrainiens en Île-de-France</h1>
<p>Les professionnels ukrainiens sont prisés pour leur expertise technique, leur sérieux et leur rapport qualité-prix.</p>
<h2>Pourquoi choisir des artisans ukrainiens ?</h2>
<h3>1. Un savoir-faire reconnu</h3>
<p>Formation solide et expérience professionnelle.</p>',
            ],
            [
                'slug' => 'declarer-revenus-prochepro-urssaf-2026',
                'title' => 'Comment déclarer vos revenus ProchePro à l\'URSSAF en 2026 ?',
                'excerpt' => 'Auto-entrepreneur sur ProchePro ? Découvrez comment déclarer facilement vos revenus à l\'URSSAF.',
                'category' => 'fiscalite',
                'keywords' => ['déclaration urssaf', 'attestation fiscale', 'revenus auto-entrepreneur'],
                'reading_time' => 6,
                'published' => true,
                'published_at' => '2026-01-04',
                'content' => '<h2>Pourquoi déclarer vos revenus ProchePro à l\'URSSAF ?</h2>
<p>Si vous êtes auto-entrepreneur, vous devez déclarer tous vos revenus à l\'URSSAF.</p>
<h2>La fonctionnalité : Attestations Fiscales ProchePro</h2>
<p>ProchePro génère automatiquement des attestations fiscales professionnelles.</p>',
            ],
        ];

        $inserted = 0;
        $skipped = 0;

        foreach ($articles as $article) {
            // Перевіряємо чи стаття вже існує
            $exists = DB::table('blog_posts')
                ->where('slug', $article['slug'])
                ->exists();

            if ($exists) {
                $skipped++;
                $this->command->warn("⚠ Article '{$article['slug']}' already exists - skipped");
                continue;
            }

            // Створюємо статтю
            DB::table('blog_posts')->insert([
                'slug' => $article['slug'],
                'title' => $article['title'],
                'excerpt' => $article['excerpt'],
                'content' => $article['content'],
                'category' => $article['category'],
                'keywords' => json_encode($article['keywords']),
                'image' => null,
                'reading_time' => $article['reading_time'],
                'published' => $article['published'],
                'published_at' => $article['published_at'],
                'author_id' => null, // або ID адміна якщо потрібно
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $inserted++;
            $this->command->info("✅ Article '{$article['slug']}' inserted");
        }

        $this->command->info("\n📊 Summary:");
        $this->command->info("   - {$inserted} articles inserted");
        $this->command->info("   - {$skipped} articles skipped (already exist)");
    }
}
