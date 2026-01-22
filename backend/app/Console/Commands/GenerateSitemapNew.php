<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\ServiceCategory;
use App\Models\ServiceSubcategory;
use App\Models\BlogPost;
use App\Models\BlogCategory;
use App\Models\LocalSeoPage;
use App\Models\CityDistrict;

class GenerateSitemapNew extends Command
{
    protected $signature = 'sitemap:generate-new';
    protected $description = 'Generate sitemap.xml with proper XML escaping';

    private $baseUrl = 'https://prochepro.fr';
    
    public function handle()
    {
        $this->info('🚀 Starting sitemap generation...');

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        // Static pages
        $xml .= $this->addStaticPages();
        
        // Service categories
        $xml .= $this->addServiceCategories();
        
        // Service subcategories
        $xml .= $this->addServiceSubcategories();
        
        // Prestataires profiles
        $xml .= $this->addPrestataires();
        
        // Blog posts
        $xml .= $this->addBlogPosts();
        
        // Blog categories
        $xml .= $this->addBlogCategories();
        
        // Local SEO pages
        $xml .= $this->addLocalSeoPages();

        $xml .= '</urlset>';

        // Write to file
        file_put_contents(public_path('sitemap.xml'), $xml);

        $this->info('🎉 Sitemap successfully generated: ' . public_path('sitemap.xml'));

        return Command::SUCCESS;
    }

    private function addUrl(string $loc, string $lastmod, string $changefreq, string $priority): string
    {
        $xml = "  <url>\n";
        $xml .= "    <loc>" . $this->escapeXml($loc) . "</loc>\n";
        $xml .= "    <lastmod>" . $this->escapeXml($lastmod) . "</lastmod>\n";
        $xml .= "    <changefreq>" . $this->escapeXml($changefreq) . "</changefreq>\n";
        $xml .= "    <priority>" . $this->escapeXml($priority) . "</priority>\n";
        $xml .= "  </url>\n";
        return $xml;
    }

    private function escapeXml(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }

    private function addStaticPages(): string
    {
        $this->info('Adding static pages...');
        
        $pages = [
            ['url' => '/', 'priority' => '1.0', 'frequency' => 'daily'],
            ['url' => '/about', 'priority' => '0.8', 'frequency' => 'monthly'],
            ['url' => '/how-it-works', 'priority' => '0.9', 'frequency' => 'monthly'],
            ['url' => '/pricing', 'priority' => '0.9', 'frequency' => 'weekly'],
            ['url' => '/contact', 'priority' => '0.7', 'frequency' => 'monthly'],
            ['url' => '/faq', 'priority' => '0.7', 'frequency' => 'monthly'],
            ['url' => '/testimonials', 'priority' => '0.6', 'frequency' => 'weekly'],
            ['url' => '/auth/login', 'priority' => '0.5', 'frequency' => 'monthly'],
            ['url' => '/auth/register', 'priority' => '0.5', 'frequency' => 'monthly'],
            ['url' => '/privacy', 'priority' => '0.4', 'frequency' => 'yearly'],
            ['url' => '/terms', 'priority' => '0.4', 'frequency' => 'yearly'],
        ];

        $xml = '';
        foreach ($pages as $page) {
            $xml .= $this->addUrl(
                $this->baseUrl . $page['url'],
                now()->toAtomString(),
                $page['frequency'],
                $page['priority']
            );
        }

        $this->info("✅ Added " . count($pages) . " static pages");
        return $xml;
    }

    private function addServiceCategories(): string
    {
        $this->info('Adding service categories...');
        
        $xml = '';
        $count = 0;

        ServiceCategory::where('is_active', true)->each(function ($category) use (&$xml, &$count) {
            $xml .= $this->addUrl(
                $this->baseUrl . "/categories/{$category->key}",
                $category->updated_at->toAtomString(),
                'weekly',
                '0.8'
            );
            $count++;
        });

        $this->info("✅ Added {$count} service categories");
        return $xml;
    }

    private function addServiceSubcategories(): string
    {
        $this->info('Adding service subcategories...');
        
        $xml = '';
        $count = 0;

        ServiceSubcategory::where('is_active', true)
            ->with('category')
            ->each(function ($subcategory) use (&$xml, &$count) {
                if ($subcategory->category && $subcategory->category->is_active) {
                    $xml .= $this->addUrl(
                        $this->baseUrl . "/categories/{$subcategory->category->key}/{$subcategory->key}",
                        $subcategory->updated_at->toAtomString(),
                        'weekly',
                        '0.7'
                    );
                    $count++;
                }
            });

        $this->info("✅ Added {$count} service subcategories");
        return $xml;
    }

    private function addPrestataires(): string
    {
        $this->info('Adding prestataire profiles...');
        
        $xml = '';
        $count = 0;

        User::where('is_verified', true)
            ->where('is_blocked', false)
            ->where(function($query) {
                $query->whereJsonContains('roles', 'prestataire')
                      ->orWhere('role', 'prestataire');
            })
            ->each(function ($user) use (&$xml, &$count) {
                $xml .= $this->addUrl(
                    $this->baseUrl . "/profile/{$user->id}",
                    $user->updated_at->toAtomString(),
                    'weekly',
                    '0.6'
                );
                $count++;
            });

        $this->info("✅ Added {$count} prestataire profiles");
        return $xml;
    }

    private function addBlogPosts(): string
    {
        $this->info('Adding blog posts...');
        
        $xml = '';
        $count = 0;

        BlogPost::where('published', true)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->each(function ($post) use (&$xml, &$count) {
                $xml .= $this->addUrl(
                    $this->baseUrl . "/blog/{$post->slug}",
                    $post->updated_at->toAtomString(),
                    'monthly',
                    '0.6'
                );
                $count++;
            });

        $this->info("✅ Added {$count} blog posts");
        return $xml;
    }

    private function addBlogCategories(): string
    {
        $this->info('Adding blog categories...');
        
        $xml = '';
        $count = 0;

        BlogCategory::orderBy('sort_order')->each(function ($category) use (&$xml, &$count) {
            $xml .= $this->addUrl(
                $this->baseUrl . "/blog/categorie/{$category->slug}",
                $category->updated_at->toAtomString(),
                'weekly',
                '0.7'
            );
            $count++;
        });

        $this->info("✅ Added {$count} blog categories");
        return $xml;
    }

    private function addLocalSeoPages(): string
    {
        $this->info('Adding local SEO pages...');
        
        $xml = '';
        $count = 0;

        LocalSeoPage::orderBy('city')
            ->orderBy('updated_at', 'desc')
            ->each(function ($page) use (&$xml, &$count) {
                $district = CityDistrict::find($page->district_id);
                if ($district) {
                    $xml .= $this->addUrl(
                        $this->baseUrl . "/services/{$page->service_category}/{$district->slug}",
                        $page->updated_at->toAtomString(),
                        'weekly',
                        '0.8'
                    );
                    $count++;
                }
            });

        $this->info("✅ Added {$count} local SEO pages");
        return $xml;
    }
}
