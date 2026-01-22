<?php

namespace App\Console\Commands;

use App\Models\LocalSeoPage;
use App\Models\CityDistrict;
use App\Models\PopularService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class GenerateLocalSeoSitemap extends Command
{
    protected $signature = 'seo:generate-sitemap 
                            {--output=public/sitemap-local.xml : Output file path}';

    protected $description = 'Generate XML sitemap for all local SEO pages';

    public function handle()
    {
        $this->info('🗺️ Generating local SEO sitemap...');

        $pages = LocalSeoPage::orderBy('city')
            ->orderBy('updated_at', 'desc')
            ->get();

        $this->info("📄 Found {$pages->count()} pages");

        $xml = $this->generateSitemapXML($pages);

        $outputPath = $this->option('output');
        file_put_contents($outputPath, $xml);

        $this->info("✅ Sitemap generated: {$outputPath}");
        $this->info("📊 Total URLs: {$pages->count()}");

        return Command::SUCCESS;
    }

    private function generateSitemapXML($pages): string
    {
        $baseUrl = config('app.frontend_url', 'https://prochepro.fr');
        
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        foreach ($pages as $page) {
            // Get district slug from relationship
            $district = \App\Models\CityDistrict::find($page->district_id);
            if (!$district) continue;
            
            // URL structure: /services/{category}/{district-slug}
            $url = "{$baseUrl}/services/{$page->service_category}/{$district->slug}";
            $priority = $this->calculatePriority($page);
            $changefreq = $this->calculateChangeFreq($page);
            
            $xml .= "  <url>\n";
            $xml .= "    <loc>" . htmlspecialchars($url) . "</loc>\n";
            $xml .= "    <lastmod>" . $page->updated_at->toAtomString() . "</lastmod>\n";
            $xml .= "    <changefreq>{$changefreq}</changefreq>\n";
            $xml .= "    <priority>{$priority}</priority>\n";
            $xml .= "  </url>\n";
        }

        $xml .= '</urlset>';

        return $xml;
    }

    private function calculatePriority($page): string
    {
        // Higher priority for pages with more conversions
        if ($page->conversion_count > 10) {
            return '0.9';
        } elseif ($page->conversion_count > 5) {
            return '0.8';
        } elseif ($page->conversion_count > 0) {
            return '0.7';
        }
        
        // Paris gets higher priority
        if ($page->city === 'Paris') {
            return '0.8';
        }
        
        return '0.7';
    }

    private function calculateChangeFreq($page): string
    {
        $daysSinceUpdate = now()->diffInDays($page->updated_at);
        
        if ($daysSinceUpdate < 7) {
            return 'daily';
        } elseif ($daysSinceUpdate < 30) {
            return 'weekly';
        }
        
        return 'monthly';
    }
}
