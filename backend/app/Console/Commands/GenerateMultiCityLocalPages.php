<?php

namespace App\Console\Commands;

use App\Models\LocalSeoPage;
use App\Models\CityDistrict;
use App\Models\PopularService;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class GenerateMultiCityLocalPages extends Command
{
    protected $signature = 'seo:generate-multi-city 
                            {--city= : Specific city to generate (Paris, Lyon, Marseille, Toulouse)} 
                            {--limit=100 : Number of top services per city} 
                            {--force : Regenerate existing pages}
                            {--ai : Use AI to generate content}';

    protected $description = 'Generate local SEO pages for all cities × districts × services';

    public function handle()
    {
        $this->info('🚀 Starting multi-city local SEO pages generation...');

        $cityFilter = $this->option('city');
        $limit = (int) $this->option('limit');
        $force = $this->option('force');
        $useAI = $this->option('ai');

        // Get districts
        if ($cityFilter) {
            $districts = CityDistrict::getByCity($cityFilter);
            $this->info("🏙️ Generating for {$cityFilter}: {$districts->count()} districts");
        } else {
            $districts = CityDistrict::where('is_active', true)->get();
            $cities = $districts->pluck('city')->unique();
            $this->info("🏙️ Found {$districts->count()} districts across " . $cities->count() . " cities: " . $cities->implode(', '));
        }

        // Get top services
        $services = PopularService::getTop($limit);
        $this->info("📊 Using top {$services->count()} services");

        $totalPages = $services->count() * $districts->count();
        $this->info("📄 Will generate up to {$totalPages} pages");

        if (!$this->confirm('Continue with generation?', true)) {
            return Command::FAILURE;
        }

        $created = 0;
        $skipped = 0;
        $updated = 0;

        $bar = $this->output->createProgressBar($totalPages);
        $bar->start();

        foreach ($services as $service) {
            foreach ($districts as $district) {
                $slug = $this->generateSlug($district, $service);

                $existingPage = LocalSeoPage::where('slug', $slug)->first();

                if ($existingPage && !$force) {
                    $skipped++;
                    $bar->advance();
                    continue;
                }

                $pageData = $this->generatePageData($district, $service, $useAI);

                if ($existingPage && $force) {
                    $existingPage->update($pageData);
                    $updated++;
                } else {
                    LocalSeoPage::create(array_merge($pageData, [
                        'slug' => $slug,
                        'city' => $district->city,
                    ]));
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

    private function generateSlug(CityDistrict $district, PopularService $service): string
    {
        // Unique slug for DB (using service slug to avoid conflicts)
        // URL will be /services/{category}/{district-slug}
        return Str::slug($service->slug . '-' . $district->slug);
    }

    private function generatePageData(CityDistrict $district, PopularService $service, bool $useAI = false): array
    {
        $districtName = $district->name_fr;
        $serviceName = $service->name_fr;
        $city = $district->city;

        $title = "{$serviceName} {$districtName}";
        $titleFr = "{$serviceName} dans {$districtName}";

        $metaTitle = "{$serviceName} {$districtName} - {$city} - Devis Gratuit | ProchePro";
        $metaDescription = "Trouvez un {$serviceName} à {$districtName}, {$city}. {$service->description_fr} ✓ Devis gratuits ✓ Professionnels vérifiés ✓ Avis clients.";

        if ($useAI) {
            $contentFr = $this->generateAIContent($district, $service);
        } else {
            $contentFr = $this->generateBasicContent($district, $service);
        }

        $faqContent = $this->generateFAQs($district, $service);

        return [
            'district_id' => $district->id,
            'service_category' => $service->category,
            'service_subcategory' => $service->subcategory,
            'title' => $title,
            'title_fr' => $titleFr,
            'content' => $contentFr,
            'content_fr' => $contentFr,
            'meta_title' => $metaTitle,
            'meta_description' => $metaDescription,
            'faq_content' => $faqContent,
        ];
    }

    private function generateBasicContent(CityDistrict $district, PopularService $service): string
    {
        $districtName = $district->name_fr;
        $city = $district->city;
        $serviceName = $service->name_fr;
        $description = $service->description_fr;
        $priceRange = $service->price_range ?? '50€ - 200€';

        $notablePlaces = $district->notable_places 
            ? implode(', ', array_slice($district->notable_places, 0, 3))
            : "ce quartier";

        return <<<HTML
<div class="local-seo-content">
    <h2>Votre {$serviceName} à {$districtName}, {$city}</h2>
    
    <p>Vous cherchez <strong>{$description}</strong> dans le quartier de {$districtName} à {$city} ? ProchePro vous met en relation avec les meilleurs prestataires locaux.</p>
    
    <h3>Pourquoi choisir un {$serviceName} local à {$districtName} ?</h3>
    <ul>
        <li>🚀 <strong>Intervention rapide</strong> : Professionnels situés dans votre quartier</li>
        <li>🏙️ <strong>Connaissance du secteur</strong> : Familiers avec {$notablePlaces}</li>
        <li>💰 <strong>Prix compétitifs</strong> : Tarifs moyens de {$priceRange} à {$city}</li>
        <li>⭐ <strong>Avis vérifiés</strong> : Notes et témoignages de clients du quartier</li>
    </ul>
    
    <h3>Comment trouver votre {$serviceName} à {$districtName} ?</h3>
    <ol>
        <li>📝 <strong>Décrivez votre projet</strong> : Expliquez vos besoins en quelques lignes</li>
        <li>📬 <strong>Recevez des devis</strong> : Jusqu'à 5 professionnels vous contactent gratuitement</li>
        <li>🔍 <strong>Comparez les offres</strong> : Prix, délais, avis clients</li>
        <li>✅ <strong>Choisissez le meilleur</strong> : Sélectionnez l'offre qui vous convient</li>
    </ol>
    
    <h3>Nos {$serviceName} vérifiés à {$districtName}</h3>
    <p>Tous nos prestataires dans le secteur de {$districtName} sont :</p>
    <ul>
        <li>✓ <strong>Identifiés et vérifiés</strong> par notre équipe</li>
        <li>✓ <strong>Évalués</strong> par de vrais clients</li>
        <li>✓ <strong>Assurés</strong> pour votre sécurité</li>
        <li>✓ <strong>Expérimentés</strong> dans leur métier</li>
    </ul>
    
    <h3>Zone d'intervention : {$districtName} et environs</h3>
    <p>Nos professionnels couvrent tout le quartier de {$districtName} à {$city}. Que vous soyez situé près de {$notablePlaces}, nous avons un prestataire disponible pour vous.</p>
    
    <div class="highlight-box">
        <h4>🎯 Service gratuit et sans engagement</h4>
        <p>Publiez votre demande en 2 minutes et recevez gratuitement jusqu'à 5 devis de {$serviceName} qualifiés à {$districtName}. Aucune obligation de choisir, comparez en toute tranquillité !</p>
    </div>
    
    <h3>Prix moyen d'un {$serviceName} à {$city}</h3>
    <p>Les tarifs pour {$description} à {$city} varient généralement entre <strong>{$priceRange}</strong>, selon la complexité du projet et l'urgence de l'intervention.</p>
</div>
HTML;
    }

    private function generateAIContent(CityDistrict $district, PopularService $service): string
    {
        // TODO: OpenAI integration
        return $this->generateBasicContent($district, $service);
    }

    private function generateFAQs(CityDistrict $district, PopularService $service): array
    {
        $districtName = $district->name_fr;
        $city = $district->city;
        $serviceName = $service->name_fr;
        $priceRange = $service->price_range ?? '50€ - 200€';

        return [
            [
                'question' => "Combien coûte un {$serviceName} à {$districtName} ?",
                'answer' => "Le prix moyen pour {$service->description_fr} à {$districtName}, {$city} se situe entre {$priceRange}. Le tarif final dépend de la complexité du projet, du matériel nécessaire et des délais souhaités."
            ],
            [
                'question' => "Comment trouver un bon {$serviceName} à {$districtName} ?",
                'answer' => "Sur ProchePro, comparez facilement les {$serviceName} de {$districtName}. Consultez leurs avis clients, leurs tarifs et leur disponibilité. Tous nos professionnels sont vérifiés et évalués par de vrais clients."
            ],
            [
                'question' => "Les {$serviceName} peuvent-ils intervenir rapidement à {$districtName} ?",
                'answer' => "Oui, la plupart de nos {$serviceName} à {$districtName} proposent des interventions rapides, parfois sous 24h. Pour les urgences, précisez-le dans votre demande et les professionnels disponibles vous contacteront en priorité."
            ],
            [
                'question' => "Quels quartiers de {$city} sont couverts ?",
                'answer' => "Nos {$serviceName} interviennent dans tout {$districtName} et les quartiers environnants de {$city}. Lors de votre demande de devis, vous recevrez des propositions de professionnels situés au plus près de chez vous."
            ],
            [
                'question' => "Le service ProchePro est-il gratuit ?",
                'answer' => "Oui, publier une demande et recevoir des devis est 100% gratuit et sans engagement. Vous ne payez que si vous décidez d'engager un prestataire pour réaliser vos travaux."
            ],
        ];
    }
}
