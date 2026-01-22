<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIContentGenerator
{
    private string $apiKey;
    private string $model = 'gpt-4';

    public function __construct()
    {
        $this->apiKey = config('services.openai.api_key', '');
    }

    /**
     * Generate SEO-optimized content for a local service page
     */
    public function generateLocalServiceContent(array $params): string
    {
        $prompt = $this->buildPrompt($params);

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(30)->post('https://api.openai.com/v1/chat/completions', [
                'model' => $this->model,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Tu es un expert en rédaction SEO pour des pages de services locaux. Tu écris du contenu unique, optimisé et engageant en français.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'max_tokens' => 1500,
                'temperature' => 0.7,
            ]);

            if ($response->successful()) {
                return $response->json('choices.0.message.content', '');
            }

            Log::error('OpenAI API error', ['response' => $response->json()]);
            return '';

        } catch (\Exception $e) {
            Log::error('OpenAI content generation failed', ['error' => $e->getMessage()]);
            return '';
        }
    }

    /**
     * Generate FAQs for a service
     */
    public function generateFAQs(array $params): array
    {
        $prompt = $this->buildFAQPrompt($params);

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(30)->post('https://api.openai.com/v1/chat/completions', [
                'model' => $this->model,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Tu es un expert en création de FAQs pour des pages de services. Réponds en JSON avec un array de {question, answer}.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'max_tokens' => 800,
                'temperature' => 0.7,
                'response_format' => ['type' => 'json_object']
            ]);

            if ($response->successful()) {
                $content = $response->json('choices.0.message.content', '{}');
                $decoded = json_decode($content, true);
                return $decoded['faqs'] ?? [];
            }

            return [];

        } catch (\Exception $e) {
            Log::error('OpenAI FAQ generation failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    private function buildPrompt(array $params): string
    {
        extract($params); // $serviceName, $districtName, $city, $description, $notablePlaces, $priceRange

        return <<<PROMPT
Rédige un contenu HTML unique et optimisé SEO pour une page de service local.

Paramètres:
- Service: {$serviceName}
- Quartier: {$districtName}
- Ville: {$city}
- Description: {$description}
- Lieux notables: {$notablePlaces}
- Prix moyen: {$priceRange}

Consignes:
1. Contenu de 400-500 mots
2. Utilise des balises HTML sémantiques (h2, h3, p, ul, li)
3. Inclus des mots-clés locaux naturellement
4. Mentionne les lieux notables du quartier
5. Explique les avantages d'un prestataire local
6. Ajoute une section sur le processus (comment ça marche)
7. Ton engageant et professionnel
8. Évite les formules génériques, sois spécifique au quartier

Format: HTML uniquement, sans les tags <html>, <body>, commence directement par <div class="local-seo-content">
PROMPT;
    }

    private function buildFAQPrompt(array $params): string
    {
        extract($params);

        return <<<PROMPT
Génère 5 questions-réponses (FAQ) pour un service local.

Paramètres:
- Service: {$serviceName}
- Quartier: {$districtName}
- Ville: {$city}
- Prix moyen: {$priceRange}

Questions à couvrir:
1. Prix du service dans ce quartier
2. Comment trouver un bon prestataire
3. Délais d'intervention
4. Zone de couverture
5. Garanties/assurances

Format JSON: {"faqs": [{"question": "...", "answer": "..."}]}
Réponses de 50-80 mots, ton professionnel et rassurant.
PROMPT;
    }

    /**
     * Generate meta description
     */
    public function generateMetaDescription(array $params): string
    {
        extract($params);

        $prompt = "Rédige une meta description SEO de 150-160 caractères pour: {$serviceName} à {$districtName}, {$city}. Inclus: service, localisation, 'devis gratuit', emoji checkmark.";

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(15)->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    ['role' => 'user', 'content' => $prompt]
                ],
                'max_tokens' => 100,
                'temperature' => 0.7,
            ]);

            if ($response->successful()) {
                return $response->json('choices.0.message.content', '');
            }

            return '';

        } catch (\Exception $e) {
            return '';
        }
    }
}
