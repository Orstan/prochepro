# 🔍 SEO AUDIT REPORT - ProchePro.fr

**Date:** 16 janvier 2026  
**Analysé par:** Cascade AI

---

## 📊 RÉSUMÉ EXÉCUTIF

### ✅ Points Positifs
- ✅ Tous les layouts avec `generateMetadata` sont en place
- ✅ Chaque page dynamique a un title **100% unique**
- ✅ Structured data (JSON-LD) présent sur les pages services
- ✅ OpenGraph et Twitter cards configurés
- ✅ Canonical URLs définis partout

### ⚠️ Risques Identifiés
1. **Contenu similaire** sur les pages service+ville
2. **Manque de contenu unique** par ville
3. **Trop de pages générées** (~3000+ combinaisons service×ville)

---

## 📄 ANALYSE PAR TYPE DE PAGE

### 1. Pages Services × Villes (`/services/[service]/[city]`)

**Nombre de pages:** ~3000 (30 services × 100 villes)

**✅ Titles - UNIQUE**
```
❌ AVANT: "Services ProchePro" (même pour toutes)
✅ MAINTENANT: 
- "Plombier Paris - Devis Gratuit & Avis 2026 | ProchePro"
- "Plombier Versailles - Devis Gratuit & Avis 2026 | ProchePro"
- "Électricien Paris - Devis Gratuit & Avis 2026 | ProchePro"
```

**⚠️ Contenu - RISQUE MOYEN**

**Structure actuelle:**
- ✅ Hero section différente (nom ville + région)
- ✅ Prix section unique (nom ville)
- ⚠️ FAQ identiques pour tous (même questions)
- ⚠️ Keywords similaires (juste +ville)
- ⚠️ CTA presque identiques

**Recommandations:**
```diff
+ Ajouter section "Spécificités de [Ville]"
+ Varier les FAQ par ville (Paris ≠ Versailles)
+ Ajouter témoignages locaux si disponibles
+ Mentionner arrondissements/quartiers pour grandes villes
+ Ajouter section "Zones desservies autour de [Ville]"
```

---

### 2. Pages Services (`/services/[service]`)

**Nombre de pages:** ~30

**✅ Titles - UNIQUE**
```
✅ NOUVEAU:
- "Plombier en Île-de-France - Devis Gratuit & Comparateur de Prix 2026"
- "Électricien en Île-de-France - Devis Gratuit & Comparateur de Prix 2026"
```

**✅ Contenu - BON**
- Description unique par service
- FAQ personnalisées
- Keywords spécifiques
- Liste des villes (différenciation)

---

### 3. Pages Blog (`/blog/[slug]`)

**✅ Titles - UNIQUE**
```
- "Prix Pose Carrelage 2026 : Tarifs au m² et Devis Gratuit"
- "Comment Choisir un Plombier : Guide Complet 2026"
```

**✅ Contenu - EXCELLENT**
- Articles longs (800+ mots)
- Contenu 100% unique
- Structuré avec H2/H3
- Meta descriptions personnalisées

---

### 4. Pages Catégories Blog (`/blog/categorie/[slug]`)

**✅ Titles - UNIQUE**
```
- "Rénovation - Articles et Guides | Blog ProchePro"
- "Plomberie - Articles et Guides | Blog ProchePro"
```

**✅ Contenu - BON**
- Description unique par catégorie
- Liste d'articles dynamique

---

## 🎯 PLAN D'ACTION PRIORITAIRE

### 🔴 PRIORITÉ 1 - Différencier le contenu Service×Ville

**Problème:** Google peut voir "Plombier Paris" et "Plombier Versailles" comme trop similaires.

**Solution:**

#### Option A - Contenu Unique Minimal (Rapide)
```typescript
// Ajouter dans page.tsx pour chaque ville
const citySpecificContent = {
  "Paris": {
    districts: ["1er arr.", "2e arr.", ..., "20e arr."],
    specificInfo: "Paris est divisé en 20 arrondissements...",
    localTips: "À Paris, privilégiez les professionnels certifiés..."
  },
  "Versailles": {
    districts: ["Centre", "Montreuil", "Notre-Dame", "Saint-Louis"],
    specificInfo: "Versailles, ville royale, nécessite des artisans respectant...",
    localTips: "Pour les bâtiments classés de Versailles..."
  },
  // ... pour top 20 villes
}
```

#### Option B - Contenu Dynamique API (Idéal)
```typescript
// Charger stats réelles de la ville
- Nombre de professionnels actifs
- Nombre de demandes en cours
- Prix moyens locaux
- Avis clients de la zone
```

---

### 🟡 PRIORITÉ 2 - Réduire le nombre de pages

**Problème:** 3000+ pages = dilution du crawl budget

**Solutions:**

1. **Garder top villes uniquement dans sitemap**
```typescript
// Dans sitemap.ts
const TOP_CITIES = MAIN_CITIES.slice(0, 30); // Au lieu de ALL_CITIES (100)
```

2. **Utiliser robots.txt pour contrôler l'indexation**
```
# robots.txt
User-agent: *
Allow: /services/*/paris
Allow: /services/*/versailles
# ... top 20 villes
Disallow: /services/*/petite-ville
```

3. **Pagination des villes**
- Page principale: Top 10 villes
- Page "Voir plus": 90 autres villes

---

### 🟢 PRIORITÉ 3 - Améliorer les FAQ

**Actuellement:** Mêmes FAQ pour toutes les villes

**Amélioration:**
```typescript
const localizedFAQs = {
  faqs: [
    ...service.faqs, // FAQ générales
    {
      question: `Combien coûte un ${service.name} à ${cityName} ?`,
      answer: `À ${cityName}, le prix moyen d'un ${service.name} est de ${service.priceRange}. Les tarifs varient selon ${cityInfo.specificFactors}.`
    },
    {
      question: `Quels quartiers de ${cityName} sont desservis ?`,
      answer: `Nos professionnels interviennent dans tous les quartiers de ${cityName} : ${cityInfo.districts.join(', ')}.`
    }
  ]
}
```

---

## 📈 MÉTRIQUES À SURVEILLER

### Dans 1 mois (Google Search Console)
- [ ] Nombre de pages indexées (objectif: >80%)
- [ ] Pages "Crawled - currently not indexed" (<20%)
- [ ] CTR moyen (objectif: >2%)
- [ ] Position moyenne des pages service×ville

### KPIs
```
✅ BON: >70% des pages indexées
⚠️ MOYEN: 40-70% indexées
❌ MAUVAIS: <40% indexées
```

---

## 🛠️ FICHIERS MODIFIÉS

### ✅ Créés/Modifiés Aujourd'hui
1. `/frontend/src/app/services/[service]/layout.tsx` - ✅ CRÉÉ
   - generateMetadata avec titles uniques
   
2. `/frontend/src/app/services/[service]/[city]/layout.tsx` - ✅ EXISTE DÉJÀ
   - Metadata uniques OK
   
3. `/frontend/src/app/services/[service]/[city]/page.tsx` - ✅ RESTAURÉ
   - Retiré client component metadata (déplacé vers layout)

---

## 📋 CHECKLIST FINALE

### Metadata (Titles & Descriptions)
- ✅ `/services/[service]` - Unique
- ✅ `/services/[service]/[city]` - Unique
- ✅ `/blog/[slug]` - Unique
- ✅ `/blog/categorie/[slug]` - Unique
- ✅ Pages statiques - Unique

### Contenu
- ⚠️ `/services/[service]/[city]` - Similaire (à améliorer)
- ✅ `/services/[service]` - Bon
- ✅ `/blog/[slug]` - Excellent
- ✅ Pages statiques - Bon

### Structured Data
- ✅ Service schema présent
- ✅ FAQ schema présent
- ✅ Article schema (blog)

### Technical SEO
- ✅ Canonical URLs
- ✅ OpenGraph tags
- ✅ Twitter cards
- ✅ Sitemap.xml
- ⚠️ Robots.txt (à optimiser)

---

## 🎬 PROCHAINES ÉTAPES

### Immédiat (Cette semaine)
1. ✅ Déployer les nouveaux layouts
2. ⚠️ Tester avec Google Search Console
3. ⚠️ Vérifier l'indexation après 48h

### Court terme (2-4 semaines)
1. Implémenter Option A du contenu unique par ville (top 20 villes)
2. Réduire sitemap à top 30 villes
3. Ajouter FAQ localisées

### Moyen terme (1-3 mois)
1. Option B: Intégrer stats réelles par ville
2. Créer contenu blog géolocalisé
3. A/B test des descriptions

---

## 📞 SUPPORT

Si après 1 mois tu vois "Crawled - not indexed" dans Search Console:
1. Vérifier que le contenu est vraiment unique (min 300 mots différents par page)
2. Réduire le nombre de pages dans sitemap
3. Utiliser `robots.txt` pour contrôler l'indexation
4. Ajouter internal linking entre pages

---

**Conclusion:** 
✅ Les titles sont maintenant 100% uniques  
⚠️ Le contenu nécessite une différenciation supplémentaire pour éviter les dupliqués  
🎯 Priorité: Implémenter le contenu spécifique par ville pour top 20-30 villes
