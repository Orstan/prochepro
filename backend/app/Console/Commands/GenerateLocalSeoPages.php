<?php

namespace App\Console\Commands;

use App\Models\LocalSeoPage;
use App\Models\ParisDistrict;
use App\Models\PopularService;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class GenerateLocalSeoPages extends Command
{
    protected $signature = 'seo:generate-local-pages 
                            {--limit=20 : Number of top services to generate} 
                            {--force : Regenerate existing pages}
                            {--ai : Use AI to generate content}';

    protected $description = 'Generate local SEO pages for all district × service combinations';

    public function handle()
    {
        $this->info('🚀 Starting local SEO pages generation...');

        $limit = (int) $this->option('limit');
        $force = $this->option('force');
        $useAI = $this->option('ai');

        // Get top services
        $services = PopularService::getTop($limit);
        $this->info("📊 Found {$services->count()} popular services");

        // Get all districts
        $districts = ParisDistrict::all();
        $this->info("🏙️ Found {$districts->count()} districts");

        $totalPages = $services->count() * $districts->count();
        $this->info("📄 Will generate {$totalPages} pages");

        $created = 0;
        $skipped = 0;
        $updated = 0;

        $bar = $this->output->createProgressBar($totalPages);
        $bar->start();

        foreach ($services as $service) {
            foreach ($districts as $district) {
                $slug = $this->generateSlug($district, $service);

                // Check if page exists
                $existingPage = LocalSeoPage::where('slug', $slug)->first();

                if ($existingPage && !$force) {
                    $skipped++;
                    $bar->advance();
                    continue;
                }

                // Generate content
                $pageData = $this->generatePageData($district, $service, $useAI);

                if ($existingPage && $force) {
                    $existingPage->update($pageData);
                    $updated++;
                } else {
                    LocalSeoPage::create(array_merge($pageData, ['slug' => $slug]));
                    $created++;
                }

                $bar->advance();
            }
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("✅ Generation complete!");
        $this->table(
            ['Status', 'Count'],
            [
                ['Created', $created],
                ['Updated', $updated],
                ['Skipped', $skipped],
                ['Total', $totalPages],
            ]
        );

        return Command::SUCCESS;
    }

    private function generateSlug(ParisDistrict $district, PopularService $service): string
    {
        return Str::slug($district->slug . '-' . $service->slug);
    }

    private function generatePageData(ParisDistrict $district, PopularService $service, bool $useAI = false): array
    {
        $districtName = $district->name_fr;
        $serviceName = $service->name_fr;

        // Basic data
        $title = "{$serviceName} {$districtName}";
        $titleFr = "{$serviceName} dans le {$districtName}";

        $metaTitle = "{$serviceName} {$districtName} - Devis Gratuit | ProchePro";
        $metaDescription = "Trouvez un {$serviceName} dans le {$districtName}. {$service->description_fr} Comparez les devis gratuitement. ⭐ Professionnels vérifiés.";

        // Generate content
        if ($useAI) {
            $content = $this->generateAIContent($district, $service);
            $contentFr = $content; // AI generates in French
        } else {
            $contentFr = $this->generateBasicContent($district, $service);
            $content = $contentFr;
        }

        // Generate FAQs
        $faqContent = $this->generateFAQs($district, $service);

        return [
            'district_id' => $district->id,
            'service_category' => $service->category,
            'service_subcategory' => $service->subcategory,
            'title' => $title,
            'title_fr' => $titleFr,
            'content' => $content,
            'content_fr' => $contentFr,
            'meta_title' => $metaTitle,
            'meta_description' => $metaDescription,
            'faq_content' => $faqContent,
        ];
    }

    private function generateBasicContent(ParisDistrict $district, PopularService $service): string
    {
        $districtName = $district->name_fr;
        $serviceName = $service->name_fr;
        $description = $service->description_fr;
        $priceRange = $service->price_range;

        $notablePlaces = $district->notable_places 
            ? implode(', ', array_slice($district->notable_places, 0, 3))
            : "ce quartier";

        return <<<HTML
<div class="local-seo-content">
    <h2>Votre {$serviceName} dans le {$districtName}</h2>
    
    <p>Vous recherchez un professionnel pour <strong>{$description}</strong> dans le {$districtName} ? ProchePro vous met en relation avec les meilleurs prestataires de votre quartier.</p>
    
    <h3>Pourquoi choisir un {$serviceName} local ?</h3>
    <ul>
        <li>✅ <strong>Proximité</strong> : Intervention rapide dans votre quartier</li>
        <li>✅ <strong>Connaissance locale</strong> : Familiers avec {$notablePlaces}</li>
        <li>✅ <strong>Disponibilité</strong> : Réactivité optimale pour les urgences</li>
        <li>✅ <strong>Prix compétitifs</strong> : Tarifs adaptés au marché local (environ {$priceRange})</li>
    </ul>
    
    <h3>Comment ça marche ?</h3>
    <ol>
        <li>📝 <strong>Décrivez votre besoin</strong> : Précisez votre demande en quelques mots</li>
        <li>💬 <strong>Recevez des devis</strong> : Jusqu'à 5 professionnels vous contactent</li>
        <li>⭐ <strong>Comparez et choisissez</strong> : Sélectionnez la meilleure offre</li>
        <li>✨ <strong>Travaux réalisés</strong> : Profitez d'un service de qualité</li>
    </ol>
    
    <h3>Nos {$serviceName} dans le {$districtName}</h3>
    <p>Tous nos prestataires dans le {$districtName} sont :</p>
    <ul>
        <li>🔍 Vérifiés et validés par notre équipe</li>
        <li>⭐ Notés par les clients précédents</li>
        <li>🛡️ Assurés pour votre tranquillité</li>
        <li>💼 Expérimentés dans leur domaine</li>
    </ul>
    
    <h3>Zone d'intervention</h3>
    <p>Nos professionnels interviennent dans tout le {$districtName} et aux alentours. Que vous soyez près de {$notablePlaces}, nous avons un prestataire pour vous.</p>
    
    <div class="cta-box">
        <h4>Besoin d'un {$serviceName} rapidement ?</h4>
        <p>Publiez votre demande gratuitement et recevez jusqu'à 5 devis de professionnels qualifiés dans le {$districtName}.</p>
    </div>
</div>
HTML;
    }

    private function generateAIContent(ParisDistrict $district, PopularService $service): string
    {
        // TODO: Implement OpenAI integration
        // For now, return basic content
        return $this->generateBasicContent($district, $service);
    }

    private function generateFAQs(ParisDistrict $district, PopularService $service): array
    {
        $districtName = $district->name_fr;
        $serviceName = $service->name_fr;
        $priceRange = $service->price_range;

        return [
            [
                'question' => "Quel est le prix d'un {$serviceName} dans le {$districtName} ?",
                'answer' => "Le tarif moyen pour {$service->description_fr} dans le {$districtName} est de {$priceRange}. Les prix peuvent varier selon la complexité de l'intervention et l'urgence de la demande."
            ],
            [
                'question' => "Comment trouver un bon {$serviceName} dans le {$districtName} ?",
                'answer' => "Sur ProchePro, vous pouvez consulter les avis clients, comparer les devis et choisir un {$serviceName} vérifié près de chez vous dans le {$districtName}. Tous nos prestataires sont notés par leurs clients précédents."
            ],
            [
                'question' => "Les {$serviceName} peuvent-ils intervenir rapidement dans le {$districtName} ?",
                'answer' => "Oui, de nombreux professionnels sur ProchePro proposent des interventions rapides, voire en urgence dans le {$districtName}. Précisez votre besoin lors de votre demande pour obtenir des devis de prestataires disponibles immédiatement."
            ],
            [
                'question' => "Puis-je obtenir plusieurs devis pour mon projet dans le {$districtName} ?",
                'answer' => "Absolument ! En publiant votre demande sur ProchePro, vous recevrez jusqu'à 5 devis gratuits de {$serviceName} qualifiés dans le {$districtName}. Cela vous permet de comparer les offres et de choisir celle qui vous convient le mieux."
            ],
        ];
    }
}
