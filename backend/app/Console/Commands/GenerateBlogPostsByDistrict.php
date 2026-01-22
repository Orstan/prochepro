<?php

namespace App\Console\Commands;

use App\Models\BlogPost;
use App\Models\BlogCategory;
use App\Models\PopularService;
use App\Models\CityDistrict;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class GenerateBlogPostsByDistrict extends Command
{
    protected $signature = 'blog:generate-by-district 
                            {--limit=20 : Number of services to generate} 
                            {--force : Regenerate existing posts}
                            {--types=prix,guide : Types of posts to generate}';

    protected $description = 'Generate localized blog posts for each district × service combination';

    private $contentTypes = [
        'prix' => [
            'template' => 'Prix {service} {district} - Guide Tarifs',
            'category' => 'guides-prix',
        ],
        'guide' => [
            'template' => '{service} {district} - Guide Complet',
            'category' => 'guides-pratiques',
        ],
    ];

    public function handle()
    {
        $this->info('🚀 Génération des articles par district...');

        // Ensure blog categories exist
        $this->ensureBlogCategories();

        $limit = (int) $this->option('limit');
        $force = $this->option('force');
        $types = explode(',', $this->option('types'));

        // Get data
        $services = PopularService::getTop($limit);
        $districts = CityDistrict::getByCity('Paris');

        $this->info("📊 {$services->count()} services × {$districts->count()} districts");

        $totalPosts = $services->count() * $districts->count() * count($types);
        $this->info("📝 {$totalPosts} articles à générer");

        $created = 0;
        $skipped = 0;
        $updated = 0;

        $bar = $this->output->createProgressBar($totalPosts);
        $bar->start();

        foreach ($services as $service) {
            foreach ($districts as $district) {
                foreach ($types as $type) {
                    if (!isset($this->contentTypes[$type])) {
                        $bar->advance();
                        continue;
                    }

                    $slug = $this->generateSlug($service, $district, $type);

                    // Check if exists
                    $existingPost = BlogPost::where('slug', $slug)->first();

                    if ($existingPost && !$force) {
                        $skipped++;
                        $bar->advance();
                        continue;
                    }

                    // Generate post
                    $postData = $this->generatePostData($service, $district, $type);

                    if ($existingPost && $force) {
                        $existingPost->update($postData);
                        $updated++;
                    } else {
                        BlogPost::create(array_merge($postData, ['slug' => $slug]));
                        $created++;
                    }

                    $bar->advance();
                }
            }
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("✅ Génération terminée !");
        $this->table(
            ['Statut', 'Nombre'],
            [
                ['Créés', $created],
                ['Mis à jour', $updated],
                ['Ignorés', $skipped],
                ['Total', $totalPosts],
            ]
        );

        $this->newLine();
        $this->info('💡 Exécutez maintenant : php artisan sitemap:generate');

        return Command::SUCCESS;
    }

    private function ensureBlogCategories(): void
    {
        $categories = [
            ['name' => 'Guides Prix', 'slug' => 'guides-prix', 'icon' => '💰', 'sort_order' => 1],
            ['name' => 'Guides Pratiques', 'slug' => 'guides-pratiques', 'icon' => '📖', 'sort_order' => 2],
        ];

        foreach ($categories as $categoryData) {
            BlogCategory::firstOrCreate(
                ['slug' => $categoryData['slug']],
                $categoryData
            );
        }
    }

    private function generateSlug(PopularService $service, CityDistrict $district, string $type): string
    {
        $serviceSlug = Str::slug($service->name_fr);
        $districtSlug = Str::slug($district->name_fr);
        return "{$type}-{$serviceSlug}-{$districtSlug}";
    }

    private function generatePostData(PopularService $service, CityDistrict $district, string $type): array
    {
        $serviceName = $service->name_fr;
        $serviceDesc = $service->description_fr;
        $priceRange = $service->price_range;
        $districtName = $district->name_fr;
        $districtNumber = $district->code;

        $contentType = $this->contentTypes[$type];

        // Generate localized content
        if ($type === 'prix') {
            $title = "Prix {$serviceName} {$districtName} - Tarifs et Devis 2026";
            $metaTitle = "{$title} | ProchePro";
            $excerpt = "Découvrez les prix pour {$serviceDesc} dans le {$districtName}. {$priceRange}. Devis gratuits de professionnels locaux.";
            $metaDescription = "Tarifs {$serviceName} dans le {$districtName} (Paris {$districtNumber}). {$priceRange}. Comparez les devis gratuits de professionnels qualifiés.";
            $content = $this->generatePrixDistrictContent($service, $district);
        } else {
            $title = "{$serviceName} {$districtName} - Guide et Professionnels";
            $metaTitle = "{$title} | ProchePro";
            $excerpt = "Guide complet {$serviceName} dans le {$districtName}. Trouvez les meilleurs professionnels locaux et obtenez des devis gratuits.";
            $metaDescription = "{$serviceName} dans le {$districtName} : guide complet, conseils et professionnels vérifiés. Devis gratuits disponibles.";
            $content = $this->generateGuideDistrictContent($service, $district);
        }

        $keywords = [
            $serviceName,
            $districtName,
            "Paris {$districtNumber}",
            'prix',
            'tarif',
            'devis',
            'professionnel',
            'ProchePro',
        ];

        $wordCount = str_word_count(strip_tags($content));
        $readingTime = max(1, round($wordCount / 200));

        return [
            'title' => $title,
            'meta_title' => $metaTitle,
            'excerpt' => $excerpt,
            'meta_description' => $metaDescription,
            'content' => $content,
            'category' => $contentType['category'],
            'keywords' => $keywords,
            'reading_time' => $readingTime,
            'published' => true,
            'published_at' => now(),
            'author_id' => null,
        ];
    }

    private function generatePrixDistrictContent(PopularService $service, CityDistrict $district): string
    {
        $serviceName = $service->name_fr;
        $serviceDesc = $service->description_fr;
        $priceRange = $service->price_range;
        $districtName = $district->name_fr;
        $districtNumber = $district->code;
        
        $notablePlaces = $district->notable_places 
            ? implode(', ', array_slice($district->notable_places, 0, 3))
            : "ce quartier";

        return <<<HTML
# Prix {$serviceName} {$districtName} en 2025

Vous habitez dans le **{$districtName} (Paris {$districtNumber})** et cherchez un professionnel pour **{$serviceDesc}** ? Découvrez les tarifs locaux et comparez les devis.

## Tarifs dans le {$districtName}

Le coût pour {$serviceDesc} dans le {$districtName} se situe généralement entre **{$priceRange}**.

### Facteurs de Prix Locaux

Les tarifs dans le {$districtName} dépendent de :

- 📍 **Accessibilité** : Facilité d'accès à votre adresse (proche de {$notablePlaces})
- 🏢 **Type de logement** : Appartement ou maison
- 🚗 **Frais de déplacement** : Variables selon l'emplacement exact
- ⏰ **Disponibilité** : Délais et urgence de l'intervention

## Professionnels dans le {$districtName}

### Avantages d'un Professionnel Local

✅ **Proximité** : Intervention rapide dans votre quartier  
✅ **Connaissance du secteur** : Habitué aux immeubles du {$districtName}  
✅ **Disponibilité** : Réactivité pour les urgences  
✅ **Tarifs adaptés** : Prix cohérents avec le marché local

### Zone d'Intervention

Nos professionnels interviennent dans tout le {$districtName}, notamment près de :

- {$notablePlaces}
- Et tous les secteurs du Paris {$districtNumber}

## Détail des Tarifs

### Prix de la Main d'Œuvre

Dans le {$districtName}, les professionnels qualifiés facturent :

- 🔧 **Intervention simple** : À partir de {$priceRange}
- ⚡ **Intervention d'urgence** : Supplément de 30-50%
- 🕐 **Hors horaires** : Majoration week-end/nuit

### Coûts Supplémentaires

Selon votre projet dans le {$districtName} :

- Matériaux et fournitures
- Frais de déplacement (si hors zone)
- Mise en conformité si nécessaire
- Évacuation de déchets

## Comment Obtenir le Meilleur Prix ?

### Conseils pour Économiser

1. **Comparez plusieurs devis** : Au moins 3 professionnels du {$districtName}
2. **Planifiez à l'avance** : Évitez les urgences coûteuses
3. **Regroupez les travaux** : Intervention unique pour plusieurs prestations
4. **Soyez flexible** : Les professionnels ont des périodes creuses moins chères

### Ce Qui Est Inclus

Vérifiez que le devis comprend :

- ✅ Déplacement dans le {$districtName}
- ✅ Main d'œuvre qualifiée
- ✅ Garanties
- ✅ Nettoyage après intervention

## Trouvez Votre Professionnel

### Sur ProchePro

**Gratuit et sans engagement** pour les habitants du {$districtName} :

1. 📝 Décrivez votre projet en 2 minutes
2. 💬 Recevez jusqu'à 5 devis de professionnels locaux
3. ⭐ Consultez les avis de vos voisins
4. ✨ Choisissez le meilleur rapport qualité/prix

**Tous nos professionnels dans le {$districtName} sont vérifiés et assurés.**

## Questions des Habitants du {$districtName}

**Les professionnels viennent-ils vraiment du {$districtName} ?**  
Oui, nous privilégions les professionnels qui interviennent régulièrement dans le {$districtName} et connaissent bien le quartier.

**Les prix sont-ils fixes ou négociables ?**  
Les tarifs sont indicatifs. Avec plusieurs devis, vous pouvez comparer et négocier le meilleur prix.

**Combien de temps pour avoir un devis ?**  
Les professionnels du {$districtName} répondent généralement sous 24-48h. Pour les urgences, certains peuvent intervenir le jour même.

**Y a-t-il une garantie sur les travaux ?**  
Oui, tous nos professionnels offrent des garanties légales sur leurs interventions.

## Spécificités du {$districtName}

### Caractéristiques du Quartier

Le {$districtName} a ses particularités qui peuvent influencer les interventions :

- Type d'immeubles (anciens/récents)
- Accessibilité et stationnement
- Normes spécifiques de copropriété
- Contraintes architecturales

Nos professionnels connaissent ces spécificités et adaptent leurs prestations en conséquence.

## Urgences dans le {$districtName}

Pour une intervention urgente de {$serviceName} dans le {$districtName} :

⚡ **Publiez votre demande en urgence** sur ProchePro  
📞 **Précisez "intervention rapide"** dans votre description  
🏃 **Recevez des réponses** de professionnels disponibles immédiatement

---

**Habitant du {$districtName} ?** Publiez gratuitement votre demande et recevez des devis de professionnels locaux qualifiés !
HTML;
    }

    private function generateGuideDistrictContent(PopularService $service, CityDistrict $district): string
    {
        $serviceName = $service->name_fr;
        $serviceDesc = $service->description_fr;
        $priceRange = $service->price_range;
        $districtName = $district->name_fr;
        $districtNumber = $district->code;
        
        $notablePlaces = $district->notable_places 
            ? implode(', ', array_slice($district->notable_places, 0, 3))
            : "votre quartier";

        return <<<HTML
# {$serviceName} dans le {$districtName} : Guide Complet

Vous recherchez un professionnel pour **{$serviceDesc}** dans le **{$districtName} (Paris {$districtNumber})** ? Ce guide vous accompagne dans votre projet.

## Pourquoi Choisir un Professionnel du {$districtName} ?

### Avantages de la Proximité

- 🏠 **Connaissance locale** : Expérience avec les immeubles du {$districtName}
- ⚡ **Rapidité d'intervention** : Déplacement rapide dans votre quartier
- 🤝 **Relation de confiance** : Professionnel de quartier recommandé par vos voisins
- 💰 **Frais réduits** : Moins de frais de déplacement

### Secteurs d'Intervention

Nos professionnels interviennent dans tout le {$districtName}, notamment :

- Près de {$notablePlaces}
- Dans tous les secteurs du Paris {$districtNumber}
- Immeubles anciens et modernes
- Résidences et copropriétés

## Spécificités du {$districtName}

### Caractéristiques du Quartier

Le {$districtName} présente des particularités dont nos professionnels tiennent compte :

**Type de bâtiments :**
- Immeubles haussmanniens
- Constructions modernes
- Résidences anciennes rénovées

**Contraintes techniques :**
- Normes de copropriété spécifiques
- Accès et stationnement
- Règles d'urbanisme locales

**Avantages logistiques :**
- Bonne desserte en transports
- Accès facilité pour les professionnels
- Disponibilité de matériaux à proximité

## Tarifs dans le {$districtName}

### Fourchette de Prix Locale

Pour {$serviceDesc} dans le {$districtName} : **{$priceRange}**

Ce tarif comprend généralement :

- Main d'œuvre qualifiée
- Déplacement dans le Paris {$districtNumber}
- Petites fournitures
- Garantie sur l'intervention

### Facteurs de Variation

Les prix peuvent varier selon :

- Accessibilité de votre logement
- Étage et ascenseur
- Urgence de l'intervention
- Complexité spécifique

## Comment Choisir Votre Professionnel ?

### Critères Importants

**1. Avis de vos voisins**
- Consultez les retours d'habitants du {$districtName}
- Vérifiez les notes et commentaires
- Demandez des références locales

**2. Proximité et disponibilité**
- Privilégiez un professionnel du secteur
- Vérifiez ses délais d'intervention
- Assurez-vous de sa disponibilité

**3. Expérience locale**
- Connaissance des immeubles du {$districtName}
- Habitude des contraintes du quartier
- Relations avec les copropriétés locales

**4. Transparence des tarifs**
- Devis détaillé et clair
- Pas de frais cachés
- Prix cohérents avec le marché local

## Processus Recommandé

### Étapes pour Votre Projet

**1. Définir votre besoin**
- Nature précise de l'intervention
- Urgence et délais souhaités
- Budget approximatif

**2. Demander plusieurs devis**
- Minimum 3 professionnels du {$districtName}
- Descriptions identiques pour comparer
- Délais de réponse rapides

**3. Comparer les offres**
- Prix et prestations incluses
- Avis et références
- Disponibilité et réactivité
- Feeling et professionnalisme

**4. Vérifications essentielles**
- Assurances et garanties
- SIRET et légalité
- Références vérifiables
- Devis écrit et signé

**5. Suivi du projet**
- Communication régulière
- Respect des délais
- Contrôle qualité
- Paiement sécurisé

## Professionnels du {$districtName} sur ProchePro

### Notre Sélection Locale

**Critères de référencement :**

✅ Interventions régulières dans le {$districtName}  
✅ Assurances professionnelles à jour  
✅ Avis clients vérifiés  
✅ Réactivité et disponibilité  
✅ Tarifs transparents

### Comment Ça Marche ?

**Pour les habitants du {$districtName} :**

1. **Publication gratuite** de votre demande (2 minutes)
2. **Réception de devis** de professionnels locaux sous 24-48h
3. **Comparaison facile** des offres et des avis
4. **Choix libre** du professionnel qui vous convient
5. **Aucun engagement** - vous décidez librement

## Questions Fréquentes

**Les professionnels connaissent-ils vraiment le {$districtName} ?**  
Oui, nous travaillons avec des professionnels qui interviennent régulièrement dans le {$districtName} et connaissent les spécificités du quartier.

**Combien coûte le service ProchePro ?**  
La publication de votre demande et la réception de devis sont 100% gratuites. Vous ne payez que le professionnel choisi.

**Puis-je avoir un devis rapidement ?**  
Oui, les professionnels du {$districtName} répondent généralement sous 24-48h. Pour les urgences, certains peuvent venir le jour même.

**Que faire si je ne suis pas satisfait ?**  
Tous nos professionnels sont assurés et offrent des garanties. En cas de litige, notre équipe peut vous accompagner dans la médiation.

**Les avis sont-ils authentiques ?**  
Oui, tous les avis sur ProchePro proviennent de clients ayant réellement utilisé les services. Impossible de publier un faux avis.

## Conseils Spécifiques au {$districtName}

### Meilleures Périodes

- **Évitez juillet-août** : Nombreux professionnels en congés
- **Privilégiez septembre-juin** : Plus de disponibilité
- **Anticipez les grands travaux** : Planifiez 2-3 semaines à l'avance

### Particularités Locales

**Accès et stationnement :**
- Informez le professionnel des difficultés d'accès
- Prévoyez l'autorisation de stationnement si nécessaire
- Communiquez les codes d'accès

**Relations avec la copropriété :**
- Vérifiez les autorisations nécessaires
- Respectez les horaires de travaux
- Prévenez vos voisins si travaux bruyants

## Services Connexes dans le {$districtName}

D'autres prestations souvent demandées par les habitants du {$districtName} :

- Entretien et maintenance
- Dépannages urgents
- Rénovations complètes
- Mises aux normes

**Tous ces services sont disponibles via ProchePro avec des professionnels locaux qualifiés.**

---

**Habitant du {$districtName} ?** Trouvez rapidement un professionnel qualifié près de chez vous. Publication gratuite, devis sous 24-48h, aucun engagement !
HTML;
    }
}
