<?php

namespace App\Console\Commands;

use App\Models\BlogPost;
use App\Models\User;
use App\Services\AIContentGenerator;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class GenerateSeoContent extends Command
{
    protected $signature = 'blog:generate-seo-content {--type=all}';
    protected $description = 'Generate SEO-optimized blog content (guides, local SEO, case studies)';

    protected $aiGenerator;

    public function __construct(AIContentGenerator $aiGenerator)
    {
        parent::__construct();
        $this->aiGenerator = $aiGenerator;
    }

    public function handle()
    {
        $type = $this->option('type');

        $this->info('🚀 Starting SEO content generation...');

        switch ($type) {
            case 'guides':
                $this->generatePriceGuides();
                break;
            case 'local':
                $this->generateLocalSeoArticles();
                break;
            case 'case-studies':
                $this->generateCaseStudies();
                break;
            case 'all':
                $this->generatePriceGuides();
                $this->generateLocalSeoArticles();
                $this->generateCaseStudies();
                break;
            default:
                $this->error("Unknown type: {$type}");
                return 1;
        }

        $this->info('✅ SEO content generation complete!');
        
        // Auto-regenerate sitemap after content generation
        $this->info('🗺️  Regenerating sitemap...');
        $this->call('sitemap:generate-new');
        
        return 0;
    }

    /**
     * Generate price guides for services
     */
    protected function generatePriceGuides()
    {
        $this->info('📝 Generating price guides...');

        $services = [
            ['name' => 'Plomberie', 'slug' => 'plomberie', 'emoji' => '🔧'],
            ['name' => 'Électricité', 'slug' => 'electricite', 'emoji' => '⚡'],
            ['name' => 'Rénovation salle de bain', 'slug' => 'renovation-salle-bain', 'emoji' => '🚿'],
            ['name' => 'Peinture', 'slug' => 'peinture', 'emoji' => '🎨'],
            ['name' => 'Menuiserie', 'slug' => 'menuiserie', 'emoji' => '🪚'],
            ['name' => 'Déménagement', 'slug' => 'demenagement', 'emoji' => '📦'],
            ['name' => 'Nettoyage', 'slug' => 'nettoyage', 'emoji' => '🧹'],
        ];

        $cities = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Bordeaux'];

        foreach ($services as $service) {
            foreach ($cities as $city) {
                $year = date('Y');
                $title = "{$service['emoji']} Combien coûte {$service['name']} à {$city} en {$year} ?";
                
                // Check if already exists
                $slug = Str::slug("prix-{$service['slug']}-{$city}-{$year}");
                if (BlogPost::where('slug', $slug)->exists()) {
                    $this->warn("  Skipping: {$title} (already exists)");
                    continue;
                }

                $content = $this->aiGenerator->generatePriceGuide($service['name'], $city, $year);

                BlogPost::create([
                    'title' => $title,
                    'slug' => $slug,
                    'meta_title' => "Prix {$service['name']} {$city} {$year} | Guide Complet",
                    'excerpt' => "Découvrez les prix moyens pour {$service['name']} à {$city} en {$year}. Tarifs, conseils et devis gratuits.",
                    'meta_description' => "Guide complet des prix {$service['name']} à {$city} en {$year}. Comparez les tarifs, obtenez des devis gratuits et trouvez le meilleur prestataire.",
                    'content' => $content,
                    'category' => 'guides-prix',
                    'keywords' => [
                        "prix {$service['slug']} {$city}",
                        "tarif {$service['slug']} {$city}",
                        "cout {$service['slug']} {$city} {$year}",
                        "{$service['slug']} {$city}",
                    ],
                    'reading_time' => 8,
                    'published' => true,
                    'published_at' => now(),
                ]);

                $this->info("  ✓ Generated: {$title}");
            }
        }
    }

    /**
     * Generate local SEO articles for districts
     */
    protected function generateLocalSeoArticles()
    {
        $this->info('📍 Generating local SEO articles...');

        $parisDistricts = [
            ['name' => '1er arrondissement', 'slug' => '75001', 'highlights' => 'Louvre, Palais Royal'],
            ['name' => '2ème arrondissement', 'slug' => '75002', 'highlights' => 'Bourse, Opéra'],
            ['name' => '8ème arrondissement', 'slug' => '75008', 'highlights' => 'Champs-Élysées'],
            ['name' => '16ème arrondissement', 'slug' => '75016', 'highlights' => 'Trocadéro, Bois de Boulogne'],
        ];

        foreach ($parisDistricts as $district) {
            $title = "🏘️ Trouver un prestataire dans le {$district['name']} de Paris";
            $slug = Str::slug("prestataires-paris-{$district['slug']}");

            if (BlogPost::where('slug', $slug)->exists()) {
                $this->warn("  Skipping: {$title} (already exists)");
                continue;
            }

            $content = $this->aiGenerator->generateLocalSeoArticle($district['name'], 'Paris', $district['highlights']);

            BlogPost::create([
                'title' => $title,
                'slug' => $slug,
                'meta_title' => "Prestataires {$district['name']} Paris | ProchePro",
                'excerpt' => "Trouvez les meilleurs prestataires de confiance dans le {$district['name']} de Paris. Services de qualité, devis gratuits.",
                'meta_description' => "Les meilleurs artisans et prestataires du {$district['name']} à Paris. Plombiers, électriciens, peintres et plus. Devis gratuits en ligne.",
                'content' => $content,
                'category' => 'local-seo',
                'keywords' => [
                    "prestataire {$district['slug']}",
                    "artisan paris {$district['slug']}",
                    "services {$district['name']} paris",
                ],
                'reading_time' => 6,
                'published' => true,
                'published_at' => now(),
            ]);

            $this->info("  ✓ Generated: {$title}");
        }
    }

    /**
     * Generate case studies from successful prestataires
     */
    protected function generateCaseStudies()
    {
        $this->info('⭐ Generating case studies...');

        // Find top-rated prestataires with completed offers
        $topPrestataires = User::where('role', 'prestataire')
            ->where('average_rating', '>=', 4.5)
            ->whereHas('offers', function($q) {
                $q->where('status', 'accepted');
            })
            ->withCount(['offers as completed_tasks_count' => function($q) {
                $q->where('status', 'accepted');
            }])
            ->having('completed_tasks_count', '>=', 10)
            ->orderBy('average_rating', 'desc')
            ->limit(5)
            ->get();

        foreach ($topPrestataires as $prestataire) {
            $title = "⭐ Success Story : Comment {$prestataire->name} a réussi sur ProchePro";
            $slug = Str::slug("success-story-{$prestataire->name}-{$prestataire->id}");

            if (BlogPost::where('slug', $slug)->exists()) {
                $this->warn("  Skipping: {$title} (already exists)");
                continue;
            }

            $stats = [
                'rating' => $prestataire->average_rating,
                'completed_tasks' => $prestataire->completed_tasks_count,
                'specialty' => $prestataire->specialty ?? 'Services généraux',
                'city' => $prestataire->city ?? 'France',
            ];

            $content = $this->aiGenerator->generateCaseStudy($prestataire->name, $stats);

            BlogPost::create([
                'title' => $title,
                'slug' => $slug,
                'meta_title' => "Success Story : {$prestataire->name} sur ProchePro",
                'excerpt' => "Découvrez comment {$prestataire->name} a construit une clientèle fidèle sur ProchePro avec {$stats['rating']}⭐ de moyenne.",
                'meta_description' => "L'histoire inspirante de {$prestataire->name}, prestataire {$stats['rating']}⭐ sur ProchePro. {$stats['completed_tasks']} missions réussies.",
                'content' => $content,
                'category' => 'success-stories',
                'keywords' => [
                    'success story prochepro',
                    'prestataire succès',
                    "artisan {$stats['city']}",
                ],
                'reading_time' => 5,
                'published' => true,
                'published_at' => now(),
            ]);

            $this->info("  ✓ Generated: {$title}");
        }
    }
}
