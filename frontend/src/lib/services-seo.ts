// SEO Services data for local search optimization
// Format: /services/[slug]/[city] -> "Plombier Paris", "Électricien Versailles", etc.

export interface ServiceSEO {
  slug: string;
  name: string;
  namePlural: string;
  category: string;
  keywords: string[];
  description: string;
  priceRange: string;
  faqs: { question: string; answer: string }[];
}

export const SERVICES_SEO: ServiceSEO[] = [
  // Plomberie
  {
    slug: "plombier",
    name: "Plombier",
    namePlural: "Plombiers",
    category: "plumbing",
    keywords: ["plombier", "plomberie", "fuite d'eau", "débouchage", "chauffe-eau", "robinet", "tuyauterie", "salle de bain"],
    description: "Trouvez un plombier professionnel pour tous vos travaux de plomberie : réparation de fuites, débouchage, installation de sanitaires, chauffe-eau et plus.",
    priceRange: "50€ - 200€",
    faqs: [
      { question: "Quel est le prix moyen d'un plombier ?", answer: "Le tarif horaire d'un plombier varie entre 40€ et 80€ selon l'intervention. Un dépannage d'urgence peut coûter entre 80€ et 150€." },
      { question: "Comment trouver un bon plombier ?", answer: "Sur ProchePro, consultez les avis clients, comparez les devis et choisissez un plombier vérifié près de chez vous." },
      { question: "Un plombier peut-il intervenir en urgence ?", answer: "Oui, de nombreux plombiers sur ProchePro proposent des interventions d'urgence 24h/24 pour les fuites et dégâts des eaux." },
    ],
  },
  // Électricité
  {
    slug: "electricien",
    name: "Électricien",
    namePlural: "Électriciens",
    category: "electrician",
    keywords: ["électricien", "électricité", "panne électrique", "tableau électrique", "prise", "interrupteur", "éclairage", "installation électrique"],
    description: "Faites appel à un électricien qualifié pour vos installations, dépannages et mises aux normes électriques. Devis gratuit et intervention rapide.",
    priceRange: "60€ - 250€",
    faqs: [
      { question: "Combien coûte un électricien ?", answer: "Le tarif d'un électricien est généralement entre 35€ et 70€ de l'heure. Une installation complète peut coûter de 200€ à plusieurs milliers d'euros." },
      { question: "Faut-il un électricien certifié ?", answer: "Pour les travaux importants et la mise aux normes, il est recommandé de faire appel à un électricien certifié qui pourra délivrer une attestation de conformité." },
      { question: "Quand faire vérifier son installation électrique ?", answer: "Il est conseillé de faire vérifier son installation tous les 10 ans ou lors de l'achat d'un bien immobilier." },
    ],
  },
  // Ménage
  {
    slug: "menage",
    name: "Agent de ménage",
    namePlural: "Agents de ménage",
    category: "cleaning",
    keywords: ["ménage", "nettoyage", "femme de ménage", "entretien maison", "nettoyage appartement", "ménage régulier"],
    description: "Service de ménage à domicile : nettoyage régulier ou ponctuel, repassage, entretien de votre maison ou appartement par des professionnels de confiance.",
    priceRange: "15€ - 30€/h",
    faqs: [
      { question: "Quel est le tarif d'une femme de ménage ?", answer: "Le tarif horaire varie entre 15€ et 25€ selon la région et les prestations demandées." },
      { question: "Comment fonctionne le ménage à domicile ?", answer: "Vous définissez vos besoins, recevez des offres de prestataires vérifiés, et choisissez celui qui vous convient." },
      { question: "Puis-je avoir la même personne chaque semaine ?", answer: "Oui, vous pouvez établir une relation régulière avec un prestataire de confiance sur ProchePro." },
    ],
  },
  // Déménagement
  {
    slug: "demenagement",
    name: "Déménageur",
    namePlural: "Déménageurs",
    category: "furniture",
    keywords: ["déménagement", "déménageur", "transport meubles", "monte-meuble", "cartons", "déménagement pas cher"],
    description: "Déménageurs professionnels pour votre déménagement local ou longue distance. Devis gratuit, emballage, transport et installation de vos meubles.",
    priceRange: "300€ - 2000€",
    faqs: [
      { question: "Combien coûte un déménagement ?", answer: "Le prix dépend du volume, de la distance et des services. Comptez 300€ à 800€ pour un studio, 800€ à 2000€ pour un appartement." },
      { question: "Faut-il une assurance pour le déménagement ?", answer: "Les déménageurs professionnels sont assurés. Vérifiez les garanties proposées avant de signer." },
      { question: "Combien de temps à l'avance réserver ?", answer: "Réservez 2 à 4 semaines à l'avance, plus en période de forte demande (été, fin de mois)." },
    ],
  },
  // Peinture
  {
    slug: "peintre",
    name: "Peintre",
    namePlural: "Peintres",
    category: "painter",
    keywords: ["peintre", "peinture", "peinture intérieure", "peinture extérieure", "ravalement", "tapisserie", "décoration"],
    description: "Peintre professionnel pour travaux de peinture intérieure et extérieure, ravalement de façade, pose de papier peint. Finitions soignées garanties.",
    priceRange: "20€ - 40€/m²",
    faqs: [
      { question: "Quel est le prix de la peinture au m² ?", answer: "Comptez entre 20€ et 40€/m² pour la peinture intérieure, fournitures comprises. Le prix varie selon l'état des murs." },
      { question: "Combien de temps pour peindre une pièce ?", answer: "Une pièce standard (15-20m²) nécessite 1 à 2 jours de travail pour un résultat professionnel." },
      { question: "Faut-il vider la pièce avant les travaux ?", answer: "Idéalement oui, sinon le peintre protégera vos meubles, ce qui peut augmenter le temps de travail." },
    ],
  },
  // Carrelage
  {
    slug: "carreleur",
    name: "Carreleur",
    namePlural: "Carreleurs",
    category: "walls_ceiling",
    keywords: ["carreleur", "carrelage", "pose carrelage", "faïence", "salle de bain", "cuisine", "sol"],
    description: "Carreleur qualifié pour pose de carrelage sol et mur, faïence salle de bain, cuisine. Travail soigné et finitions impeccables.",
    priceRange: "30€ - 60€/m²",
    faqs: [
      { question: "Quel est le prix de pose du carrelage ?", answer: "La pose de carrelage coûte entre 30€ et 60€/m² selon le type de carrelage et la complexité du chantier." },
      { question: "Combien de temps pour carreler une salle de bain ?", answer: "Comptez 2 à 4 jours pour une salle de bain standard, selon la surface et les découpes nécessaires." },
      { question: "Le carreleur fournit-il le carrelage ?", answer: "Généralement non, mais il peut vous conseiller sur le choix et la quantité nécessaire." },
    ],
  },
  // Parquet
  {
    slug: "parqueteur",
    name: "Parqueteur",
    namePlural: "Parqueteurs",
    category: "walls_ceiling",
    keywords: ["parquet", "pose parquet", "parquet flottant", "parquet massif", "ponçage", "vitrification", "rénovation parquet"],
    description: "Spécialiste du parquet : pose de parquet flottant ou massif, ponçage, vitrification et rénovation. Sublimez vos sols avec un artisan qualifié.",
    priceRange: "25€ - 80€/m²",
    faqs: [
      { question: "Quel est le prix de pose du parquet ?", answer: "La pose de parquet flottant coûte 15-25€/m², le parquet massif 40-80€/m², hors fourniture." },
      { question: "Parquet flottant ou massif ?", answer: "Le flottant est plus économique et facile à poser. Le massif est plus durable et peut être rénové plusieurs fois." },
      { question: "Faut-il poncer un parquet neuf ?", answer: "Non, uniquement pour la rénovation d'un parquet ancien. Le ponçage coûte environ 20-35€/m²." },
    ],
  },
  // Jardinage
  {
    slug: "jardinier",
    name: "Jardinier",
    namePlural: "Jardiniers",
    category: "garden",
    keywords: ["jardinier", "jardinage", "entretien jardin", "tonte pelouse", "taille haie", "élagage", "aménagement jardin"],
    description: "Jardinier pour entretien de jardin, tonte de pelouse, taille de haies, élagage d'arbres et aménagement paysager. Jardin impeccable toute l'année.",
    priceRange: "25€ - 50€/h",
    faqs: [
      { question: "Combien coûte un jardinier ?", answer: "Le tarif horaire d'un jardinier varie entre 25€ et 45€. La tonte d'une pelouse standard coûte 30€ à 60€." },
      { question: "À quelle fréquence entretenir son jardin ?", answer: "Une tonte toutes les 2 semaines au printemps/été, une taille de haies 2-3 fois par an." },
      { question: "Le jardinier évacue-t-il les déchets ?", answer: "Généralement oui, mais vérifiez ce point dans le devis. L'évacuation peut être facturée en supplément." },
    ],
  },
  // Montage meubles
  {
    slug: "montage-meubles",
    name: "Monteur de meubles",
    namePlural: "Monteurs de meubles",
    category: "furniture",
    keywords: ["montage meubles", "montage IKEA", "assemblage meubles", "montage cuisine", "montage armoire"],
    description: "Service de montage de meubles : IKEA, cuisine, armoire, lit... Montage rapide et soigné par des professionnels expérimentés.",
    priceRange: "30€ - 100€",
    faqs: [
      { question: "Combien coûte le montage d'un meuble IKEA ?", answer: "Le montage d'un meuble simple (étagère, table) coûte 20-40€. Une armoire PAX peut coûter 80-150€." },
      { question: "Combien de temps pour monter une cuisine ?", answer: "Une cuisine complète nécessite généralement 1 à 3 jours selon sa taille et sa complexité." },
      { question: "Faut-il fournir les outils ?", answer: "Non, les monteurs professionnels viennent avec tout le matériel nécessaire." },
    ],
  },
  // Informatique
  {
    slug: "depannage-informatique",
    name: "Dépanneur informatique",
    namePlural: "Dépanneurs informatiques",
    category: "it_web",
    keywords: ["dépannage informatique", "réparation ordinateur", "virus", "installation", "configuration", "récupération données"],
    description: "Dépannage informatique à domicile : réparation PC/Mac, suppression virus, installation logiciels, récupération de données, configuration réseau.",
    priceRange: "40€ - 100€",
    faqs: [
      { question: "Combien coûte un dépannage informatique ?", answer: "Un dépannage simple coûte entre 40€ et 80€. Les interventions complexes peuvent aller jusqu'à 150€." },
      { question: "Peut-on récupérer des données perdues ?", answer: "Dans la plupart des cas oui, sauf si le disque dur est physiquement endommagé. Le diagnostic est souvent gratuit." },
      { question: "Intervention à domicile ou en atelier ?", answer: "Les deux sont possibles. L'intervention à domicile est plus pratique mais peut coûter un peu plus cher." },
    ],
  },
  // Cours particuliers
  {
    slug: "cours-particuliers",
    name: "Professeur particulier",
    namePlural: "Professeurs particuliers",
    category: "education",
    keywords: ["cours particuliers", "soutien scolaire", "aide aux devoirs", "professeur", "maths", "français", "anglais"],
    description: "Cours particuliers et soutien scolaire à domicile : mathématiques, français, anglais, sciences... Professeurs qualifiés pour tous niveaux.",
    priceRange: "20€ - 50€/h",
    faqs: [
      { question: "Quel est le tarif des cours particuliers ?", answer: "Les tarifs varient de 20€ à 50€/h selon la matière, le niveau et l'expérience du professeur." },
      { question: "Les cours sont-ils déductibles des impôts ?", answer: "Oui, vous pouvez bénéficier d'un crédit d'impôt de 50% pour les services à domicile." },
      { question: "À quelle fréquence prendre des cours ?", answer: "1 à 2 heures par semaine est généralement suffisant pour progresser efficacement." },
    ],
  },
  // Garde d'enfants
  {
    slug: "garde-enfants",
    name: "Baby-sitter",
    namePlural: "Baby-sitters",
    category: "childcare",
    keywords: ["baby-sitter", "garde enfants", "nounou", "baby sitting", "garde périscolaire", "sortie école"],
    description: "Baby-sitters et nounous de confiance pour la garde de vos enfants : garde régulière, ponctuelle, sortie d'école, soirée.",
    priceRange: "10€ - 20€/h",
    faqs: [
      { question: "Combien coûte une baby-sitter ?", answer: "Le tarif horaire varie entre 10€ et 15€ en journée, 12€ à 20€ en soirée ou week-end." },
      { question: "Comment choisir une baby-sitter ?", answer: "Vérifiez les avis, l'expérience et les références. Un premier entretien est recommandé." },
      { question: "La baby-sitter peut-elle aider aux devoirs ?", answer: "Oui, de nombreuses baby-sitters proposent également l'aide aux devoirs." },
    ],
  },
  // Pet sitting
  {
    slug: "garde-animaux",
    name: "Pet-sitter",
    namePlural: "Pet-sitters",
    category: "pets",
    keywords: ["pet-sitter", "garde animaux", "garde chien", "garde chat", "promenade chien", "pension animaux"],
    description: "Garde d'animaux à domicile ou chez le pet-sitter : chiens, chats, NAC. Promenades, visites quotidiennes, pension pendant vos vacances.",
    priceRange: "10€ - 30€/jour",
    faqs: [
      { question: "Combien coûte la garde d'un chien ?", answer: "Comptez 15-30€/jour pour une garde à domicile, 10-20€ pour une visite quotidienne." },
      { question: "Mon animal peut-il rester chez lui ?", answer: "Oui, le pet-sitter peut venir chez vous pour les repas, promenades et câlins." },
      { question: "Que faire en cas de problème de santé ?", answer: "Les pet-sitters expérimentés savent réagir et vous contacteront immédiatement. Laissez les coordonnées de votre vétérinaire." },
    ],
  },
  // Porte de garage
  {
    slug: "garage_gates",
    name: "Porte de garage",
    namePlural: "Portes de garage",
    category: "garage_gates",
    keywords: ["porte de garage", "garage", "porte sectionnelle", "porte basculante", "motorisation garage", "réparation porte garage"],
    description: "Installation et réparation de portes de garage : sectionnelles, basculantes, motorisées. Sécurité et confort d'accès à votre garage.",
    priceRange: "800€ - 3500€",
    faqs: [
      { question: "Quel type de porte de garage choisir ?", answer: "Porte sectionnelle (gain de place, isolation), basculante (économique), enroulable (compact). Comptez 800€-3500€ selon type et motorisation." },
      { question: "Motorisation : quel prix ?", answer: "Motorisation seule : 200€-800€. Installation comprise : 400€-1200€. Télécommande, détecteur d'obstacle et éclairage inclus." },
      { question: "Réparation ou remplacement ?", answer: "Si la porte a moins de 10 ans et fonctionne, la réparation suffit (ressorts, rails, motorisation). Sinon, remplacez pour améliorer isolation et sécurité." },
    ],
  },
  // Serrurerie
  {
    slug: "serrurier",
    name: "Serrurier",
    namePlural: "Serruriers",
    category: "locksmith",
    keywords: ["serrurier", "serrure", "ouverture porte", "clé", "blindage", "urgence serrurerie"],
    description: "Serrurier professionnel : ouverture de porte, changement de serrure, blindage, dépannage d'urgence 24h/24.",
    priceRange: "70€ - 250€",
    faqs: [
      { question: "Combien coûte une ouverture de porte ?", answer: "Une ouverture de porte simple coûte entre 70€ et 150€. En urgence ou la nuit, comptez 90€ à 250€." },
      { question: "Intervention rapide possible ?", answer: "Oui, la plupart des serruriers interviennent en moins d'une heure pour les urgences." },
      { question: "Le changement de serrure est-il obligatoire ?", answer: "Pas toujours. Si la serrure n'est pas endommagée lors de l'ouverture, vous pouvez la conserver." },
    ],
  },
  // Réparation électroménager
  {
    slug: "reparation-electromenager",
    name: "Réparateur électroménager",
    namePlural: "Réparateurs électroménager",
    category: "installation_repair",
    keywords: ["réparation électroménager", "lave-linge", "frigo", "lave-vaisselle", "four", "dépannage"],
    description: "Réparation d'électroménager : lave-linge, réfrigérateur, lave-vaisselle, four, sèche-linge. Diagnostic et dépannage rapide.",
    priceRange: "60€ - 180€",
    faqs: [
      { question: "Combien coûte une réparation de lave-linge ?", answer: "Une réparation simple coûte entre 60€ et 120€. Les pièces détachées sont facturées en plus." },
      { question: "Le diagnostic est-il payant ?", answer: "Le diagnostic coûte généralement 30-50€, souvent déduit si vous faites réparer." },
      { question: "Vaut-il mieux réparer ou racheter ?", answer: "Si l'appareil a moins de 5 ans et que la réparation coûte moins de 50% du prix neuf, la réparation est recommandée." },
    ],
  },
  // Aide administrative
  {
    slug: "aide-administrative",
    name: "Assistant administratif",
    namePlural: "Assistants administratifs",
    category: "business",
    keywords: ["aide administrative", "secrétariat", "courrier", "documents", "démarches", "papiers"],
    description: "Aide administrative et secrétariat : gestion de courrier, démarches administratives, classement de documents, rédaction.",
    priceRange: "20€ - 40€/h",
    faqs: [
      { question: "Quels types de démarches sont possibles ?", answer: "Courriers administratifs, déclarations, demandes d'aides, classement, saisie de données, etc." },
      { question: "Peut-on déléguer des démarches en ligne ?", answer: "Oui, avec une procuration ou un mandat, de nombreuses démarches peuvent être effectuées pour vous." },
      { question: "Combien d'heures par semaine ?", answer: "De quelques heures ponctuelles à plusieurs heures par semaine selon vos besoins." },
    ],
  },
  // Comptabilité
  {
    slug: "comptabilite",
    name: "Comptable",
    namePlural: "Comptables",
    category: "financial",
    keywords: ["comptabilité", "comptable", "auto-entrepreneur", "déclarations", "fiscalité", "bilan"],
    description: "Services comptables pour particuliers et professionnels : tenue de comptabilité, déclarations fiscales, conseils.",
    priceRange: "50€ - 150€/mois",
    faqs: [
      { question: "Un auto-entrepreneur a-t-il besoin d'un comptable ?", answer: "Ce n'est pas obligatoire mais fortement recommandé pour optimiser votre fiscalité et éviter les erreurs." },
      { question: "Quelles sont les obligations comptables ?", answer: "Cela dépend de votre statut : micro-entreprise, EURL, SARL... Un comptable vous guide." },
      { question: "Combien coûte un expert-comptable ?", answer: "Pour un auto-entrepreneur, comptez 50-100€/mois. Pour une société, 100-300€/mois selon la complexité." },
    ],
  },
  // Massage à domicile
  {
    slug: "massage-domicile",
    name: "Masseur",
    namePlural: "Masseurs",
    category: "health_beauty",
    keywords: ["massage", "masseur", "massage à domicile", "relaxation", "bien-être", "kinésithérapie"],
    description: "Massage professionnel à domicile : relaxation, thérapeutique, sportif. Masseurs diplômés pour votre bien-être.",
    priceRange: "50€ - 100€",
    faqs: [
      { question: "Quelle est la durée d'une séance ?", answer: "Une séance dure généralement entre 45 minutes et 1h30 selon le type de massage." },
      { question: "Les massages sont-ils remboursés ?", answer: "Seuls les massages prescrits par un médecin et effectués par un kinésithérapeute sont remboursés." },
      { question: "Quel type de massage choisir ?", answer: "Massage relaxant pour la détente, sportif pour les muscles, thérapeutique pour les douleurs." },
    ],
  },
  // Coiffure à domicile
  {
    slug: "coiffure-domicile",
    name: "Coiffeur",
    namePlural: "Coiffeurs",
    category: "health_beauty",
    keywords: ["coiffure", "coiffeur", "coiffure à domicile", "coupe", "coloration", "brushing"],
    description: "Coiffure professionnelle à domicile : coupe, coloration, brushing, mise en plis. Coiffeurs expérimentés.",
    priceRange: "30€ - 80€",
    faqs: [
      { question: "Combien coûte une coupe à domicile ?", answer: "Une coupe simple coûte entre 25€ et 40€. Une coupe + brushing entre 35€ et 60€." },
      { question: "Faut-il prévoir quelque chose ?", answer: "Juste un point d'eau à proximité et un espace dégagé. Le coiffeur amène son matériel." },
      { question: "La coloration est-elle possible à domicile ?", answer: "Oui, les coiffeurs à domicile réalisent tous types de prestations : couleur, mèches, balayage..." },
    ],
  },
  // Aide aux personnes âgées
  {
    slug: "aide-personne-agee",
    name: "Auxiliaire de vie",
    namePlural: "Auxiliaires de vie",
    category: "elderly_care",
    keywords: ["aide personne âgée", "auxiliaire de vie", "aide à domicile", "accompagnement seniors", "maintien à domicile"],
    description: "Aide et accompagnement des personnes âgées à domicile : aide à la toilette, repas, sorties, compagnie. Professionnels formés.",
    priceRange: "15€ - 25€/h",
    faqs: [
      { question: "Quelles sont les aides disponibles ?", answer: "L'APA (Allocation Personnalisée d'Autonomie) et les aides fiscales peuvent réduire le coût jusqu'à 50%." },
      { question: "Quelles prestations sont proposées ?", answer: "Aide à la toilette, préparation des repas, ménage, courses, accompagnement sorties, compagnie." },
      { question: "Comment choisir un auxiliaire de vie ?", answer: "Privilégiez une personne expérimentée, avec de bonnes références et qui crée un lien de confiance." },
    ],
  },
  // Couvreur
  {
    slug: "couvreur",
    name: "Couvreur",
    namePlural: "Couvreurs",
    category: "roof_facade",
    keywords: ["couvreur", "toiture", "réparation toit", "couverture", "tuiles", "ardoise"],
    description: "Couvreur professionnel pour tous travaux de toiture : réparation, rénovation, installation. Devis gratuit.",
    priceRange: "80€ - 150€/m²",
    faqs: [
      { question: "Quand faut-il refaire sa toiture ?", answer: "En moyenne tous les 20-30 ans pour les tuiles, 50-100 ans pour l'ardoise. Des signes comme des fuites ou tuiles cassées indiquent qu'il est temps." },
      { question: "Quel est le prix d'une réfection de toiture ?", answer: "Entre 80€ et 150€/m² selon le type de couverture (tuiles, ardoise, zinc). Une maison de 100m² coûte entre 8000€ et 15000€." },
      { question: "Faut-il un devis ?", answer: "Oui, demandez toujours plusieurs devis gratuits pour comparer les prix et prestations proposées." },
    ],
  },
  // Isolation toiture
  {
    slug: "isolation-toiture",
    name: "Isolation toiture",
    namePlural: "Isolations toiture",
    category: "roof_facade",
    keywords: ["isolation toiture", "isolation combles", "économie énergie", "laine de verre", "laine de roche"],
    description: "Isolation de toiture et combles pour réduire vos factures énergétiques. Aides disponibles (MaPrimeRénov').",
    priceRange: "40€ - 90€/m²",
    faqs: [
      { question: "Quelles économies avec l'isolation ?", answer: "L'isolation des combles peut réduire vos factures de chauffage de 25 à 30%." },
      { question: "Quelles aides financières ?", answer: "MaPrimeRénov', éco-prêt à taux zéro, TVA réduite à 5,5% pour l'isolation thermique." },
      { question: "Quel isolant choisir ?", answer: "Laine de verre (bon rapport qualité-prix), laine de roche (résistant au feu), ouate de cellulose (écologique)." },
    ],
  },
  // Gouttière
  {
    slug: "gouttiere",
    name: "Gouttière",
    namePlural: "Gouttières",
    category: "roof_facade",
    keywords: ["gouttière", "installation gouttière", "nettoyage gouttière", "descente eau pluviale", "zinc", "PVC"],
    description: "Installation et réparation de gouttières. Protection efficace contre les infiltrations d'eau.",
    priceRange: "30€ - 80€/m",
    faqs: [
      { question: "Faut-il nettoyer ses gouttières ?", answer: "Oui, au moins 2 fois par an (printemps et automne) pour éviter les débordements et infiltrations." },
      { question: "Gouttière zinc ou PVC ?", answer: "Le zinc dure 50+ ans mais coûte plus cher. Le PVC est économique et facile à installer mais moins durable (20-30 ans)." },
      { question: "Prix d'installation ?", answer: "Entre 30€ et 80€/mètre linéaire selon le matériau (PVC moins cher que zinc ou cuivre)." },
    ],
  },
  // Ravalement façade
  {
    slug: "ravalement-facade",
    name: "Ravalement façade",
    namePlural: "Ravalements façade",
    category: "roof_facade",
    keywords: ["ravalement façade", "nettoyage façade", "rénovation façade", "peinture extérieure", "enduit"],
    description: "Ravalement de façade complet : nettoyage, réparation, peinture. Redonnez une seconde jeunesse à votre maison.",
    priceRange: "50€ - 120€/m²",
    faqs: [
      { question: "Quand ravaler sa façade ?", answer: "La loi impose un ravalement tous les 10 ans dans certaines villes. Sinon, quand la façade est sale ou abîmée." },
      { question: "Quelle est la durée des travaux ?", answer: "Entre 2 semaines et 2 mois selon la surface et l'état de la façade." },
      { question: "Faut-il une autorisation ?", answer: "Oui, une déclaration préalable en mairie est obligatoire pour un ravalement de façade." },
    ],
  },
  // Piscine
  {
    slug: "piscine",
    name: "Piscine",
    namePlural: "Piscines",
    category: "outdoor",
    keywords: ["piscine", "installation piscine", "piscine enterrée", "piscine hors-sol", "bassin"],
    description: "Installation de piscine enterrée ou hors-sol. Profitez de votre jardin avec une piscine sur mesure.",
    priceRange: "15000€ - 50000€",
    faqs: [
      { question: "Quel budget pour une piscine ?", answer: "Piscine hors-sol : 500€-5000€. Piscine enterrée coque : 15000€-30000€. Piscine maçonnée : 20000€-50000€." },
      { question: "Faut-il un permis ?", answer: "Déclaration préalable si <100m². Permis de construire si >100m² ou piscine couverte >1,80m de hauteur." },
      { question: "Quel entretien ?", answer: "Filtration quotidienne, contrôle pH et chlore, nettoyage régulier. Budget annuel : 500€-1500€." },
    ],
  },
  // Terrasse bois
  {
    slug: "terrasse-bois",
    name: "Terrasse bois",
    namePlural: "Terrasses bois",
    category: "outdoor",
    keywords: ["terrasse bois", "terrasse extérieure", "bois exotique", "pin autoclave", "composite"],
    description: "Installation de terrasse en bois : pin, bois exotique, composite. Aménagez votre espace extérieur.",
    priceRange: "60€ - 150€/m²",
    faqs: [
      { question: "Quel bois choisir ?", answer: "Pin autoclave (économique), bois exotique ipé/cumaru (durable), composite (sans entretien)." },
      { question: "Combien coûte une terrasse bois ?", answer: "Entre 60€ et 150€/m² pose comprise selon le type de bois. Une terrasse de 20m² coûte 1200€-3000€." },
      { question: "Quel entretien ?", answer: "Bois naturel : saturateur tous les 1-2 ans. Composite : simple nettoyage au jet d'eau." },
    ],
  },
  // Pergola
  {
    slug: "pergola",
    name: "Pergola",
    namePlural: "Pergolas",
    category: "outdoor",
    keywords: ["pergola", "pergola bioclimatique", "tonnelle", "ombrage terrasse", "aluminium"],
    description: "Installation de pergola bioclimatique ou fixe. Protection solaire élégante pour votre terrasse.",
    priceRange: "2000€ - 8000€",
    faqs: [
      { question: "Pergola bioclimatique ou fixe ?", answer: "Bioclimatique : lames orientables, ventilation naturelle (5000€-15000€). Fixe : moins chère mais pas modulable (2000€-8000€)." },
      { question: "Faut-il un permis ?", answer: "Déclaration préalable si <20m². Permis de construire si >20m² ou si pergola fermée." },
      { question: "Quel matériau ?", answer: "Aluminium (durable, sans entretien), bois (chaleureux mais entretien), fer forgé (classique)." },
    ],
  },
  // Portail
  {
    slug: "portail",
    name: "Portail",
    namePlural: "Portails",
    category: "gates",
    keywords: ["portail", "portail automatique", "portail coulissant", "portail battant", "motorisation"],
    description: "Installation de portail coulissant ou battant avec motorisation. Sécurité et confort d'accès.",
    priceRange: "1500€ - 5000€",
    faqs: [
      { question: "Portail coulissant ou battant ?", answer: "Coulissant si peu d'espace devant (nécessite espace latéral). Battant si jardin profond." },
      { question: "Prix motorisation ?", answer: "Motorisation seule : 300€-1500€. Installation comprise : 500€-2500€ selon le type (bras, vérin, rail)." },
      { question: "Quel matériau choisir ?", answer: "Aluminium (sans entretien), PVC (économique), bois (chaleureux), fer forgé (traditionnel)." },
    ],
  },
  // Maçon
  {
    slug: "macon",
    name: "Maçon",
    namePlural: "Maçons",
    category: "construction",
    keywords: ["maçon", "maçonnerie", "mur", "fondation", "béton", "agglo", "parpaing"],
    description: "Maçon professionnel pour tous travaux : fondations, murs, dalles, extension. Devis gratuit.",
    priceRange: "40€ - 80€/h",
    faqs: [
      { question: "Combien coûte un maçon ?", answer: "Le tarif horaire varie de 40€ à 80€. Pour un mur, comptez 50€-100€/m²." },
      { question: "Quels travaux fait un maçon ?", answer: "Fondations, murs porteurs, dalles béton, chape, montage parpaings, extension maison." },
      { question: "Garantie des travaux ?", answer: "Garantie décennale obligatoire pour les travaux de gros œuvre affectant la solidité de l'ouvrage." },
    ],
  },
  // Démolition
  {
    slug: "demolition",
    name: "Démolition",
    namePlural: "Démolitions",
    category: "construction",
    keywords: ["démolition", "destruction", "abattage mur", "évacuation gravats", "terrassement"],
    description: "Service de démolition : murs, bâtiments, cloisons. Évacuation des gravats incluse.",
    priceRange: "50€ - 150€/m²",
    faqs: [
      { question: "Faut-il un permis ?", answer: "Oui, permis de démolir obligatoire dans certaines communes. Renseignez-vous en mairie." },
      { question: "Prix démolition maison ?", answer: "Entre 10000€ et 30000€ pour une maison de 100m² selon complexité et évacuation gravats." },
      { question: "Qui évacue les gravats ?", answer: "L'entreprise de démolition s'en charge généralement. Vérifiez que c'est inclus dans le devis." },
    ],
  },
  // Climatisation
  {
    slug: "climatisation",
    name: "Climatisation",
    namePlural: "Climatisations",
    category: "plumbing",
    keywords: ["climatisation", "clim", "climatiseur", "pompe à chaleur réversible", "rafraîchissement"],
    description: "Installation et entretien de climatisation. Confort optimal été comme hiver avec pompe à chaleur réversible.",
    priceRange: "500€ - 3000€",
    faqs: [
      { question: "Quel type de climatisation choisir ?", answer: "Split mono (1 pièce) : 500€-1500€. Multi-split (plusieurs pièces) : 2000€-5000€. Réversible pour chauffage/clim." },
      { question: "Consommation électrique ?", answer: "Moderne classe A+++ : 100-200€/an. Choisissez un bon SCOP (>4) pour économies d'énergie." },
      { question: "Entretien obligatoire ?", answer: "Oui, contrôle annuel obligatoire pour les clims >2kg de fluide frigorigène (presque toutes)." },
    ],
  },
  // Chauffage
  {
    slug: "chauffage",
    name: "Chauffage",
    namePlural: "Chauffages",
    category: "plumbing",
    keywords: ["chauffage", "installation chauffage", "chaudière", "radiateur", "chauffage central"],
    description: "Installation de système de chauffage : chaudière gaz, fioul, pompe à chaleur, radiateurs. Confort garanti.",
    priceRange: "1000€ - 8000€",
    faqs: [
      { question: "Quel chauffage choisir ?", answer: "Pompe à chaleur (écologique), chaudière gaz condensation (performante), radiateurs électriques (pas de tuyaux)." },
      { question: "Prix installation chauffage central ?", answer: "Chaudière gaz : 3000€-6000€. Pompe à chaleur : 8000€-16000€. Radiateurs électriques : 200€-1000€/pièce." },
      { question: "Aides financières ?", answer: "MaPrimeRénov' jusqu'à 10000€ pour pompe à chaleur. Éco-PTZ, CEE disponibles." },
    ],
  },
  // Pompe à chaleur
  {
    slug: "pompe-chaleur",
    name: "Pompe à chaleur",
    namePlural: "Pompes à chaleur",
    category: "plumbing",
    keywords: ["pompe à chaleur", "PAC", "pompe chaleur air eau", "chauffage écologique", "économie énergie"],
    description: "Installation de pompe à chaleur air-eau ou air-air. Jusqu'à 70% d'économies sur votre chauffage.",
    priceRange: "8000€ - 16000€",
    faqs: [
      { question: "Combien économise-t-on ?", answer: "Une PAC peut diviser votre facture de chauffage par 3 à 4 (70% d'économies)." },
      { question: "PAC air-eau ou air-air ?", answer: "Air-eau : chauffage + eau chaude (plus cher). Air-air : chauffage + clim réversible (moins cher)." },
      { question: "Quelles aides en 2026 ?", answer: "MaPrimeRénov' : 4000€-10000€. CEE : 2500€-4000€. Éco-PTZ jusqu'à 30000€." },
    ],
  },
  // Repassage
  {
    slug: "repassage",
    name: "Repassage",
    namePlural: "Repassages",
    category: "cleaning",
    keywords: ["repassage", "repassage à domicile", "pressing", "linge", "fer à repasser"],
    description: "Service de repassage à domicile. Confiez votre linge et gagnez du temps.",
    priceRange: "15€ - 25€/h",
    faqs: [
      { question: "Comment ça fonctionne ?", answer: "Le prestataire vient chez vous avec son matériel ou emporte votre linge. Tarif horaire ou au poids." },
      { question: "Combien coûte le repassage ?", answer: "Entre 15€ et 25€/heure ou 15€-20€ pour 10kg de linge." },
      { question: "Réduction d'impôts ?", answer: "Oui, crédit d'impôt de 50% pour services à la personne (repassage à domicile)." },
    ],
  },
  // Femme de ménage
  {
    slug: "femme-menage",
    name: "Femme de ménage",
    namePlural: "Femmes de ménage",
    category: "cleaning",
    keywords: ["femme de ménage", "ménage régulier", "aide ménagère", "nettoyage domicile", "entretien maison"],
    description: "Femme de ménage à domicile pour entretien régulier ou ponctuel. Maison propre sans effort.",
    priceRange: "20€ - 35€/h",
    faqs: [
      { question: "Quelle fréquence recommandée ?", answer: "2h par semaine pour un appartement, 3-4h pour une maison selon la surface." },
      { question: "Crédit d'impôt ?", answer: "Oui, 50% de crédit d'impôt pour services à la personne (emploi direct ou prestataire agréé)." },
      { question: "Que fait une femme de ménage ?", answer: "Nettoyage sols, poussière, cuisine, salle de bain. Peut inclure repassage, vitres selon accord." },
    ],
  },
  // Paysagiste
  {
    slug: "paysagiste",
    name: "Paysagiste",
    namePlural: "Paysagistes",
    category: "garden",
    keywords: ["paysagiste", "aménagement jardin", "création jardin", "paysagiste conseil", "jardin paysager"],
    description: "Paysagiste professionnel pour création et aménagement de jardin. Transformez votre espace extérieur.",
    priceRange: "50€ - 100€/h",
    faqs: [
      { question: "Que fait un paysagiste ?", answer: "Conception de jardin, plantation, engazonnement, terrasse, allées, éclairage, système d'arrosage." },
      { question: "Prix aménagement jardin ?", answer: "Entre 25€ et 75€/m² pour aménagement complet. Un jardin de 100m² coûte 2500€-7500€." },
      { question: "Plan de jardin payant ?", answer: "Oui, entre 300€ et 1500€ pour un plan paysager selon complexité. Parfois inclus si travaux confiés." },
    ],
  },
  // Arrosage automatique
  {
    slug: "arrosage-automatique",
    name: "Arrosage automatique",
    namePlural: "Arrosages automatiques",
    category: "garden",
    keywords: ["arrosage automatique", "système arrosage", "arrosage jardin", "programmateur arrosage", "goutte à goutte"],
    description: "Installation de système d'arrosage automatique. Jardin verdoyant sans effort.",
    priceRange: "800€ - 3000€",
    faqs: [
      { question: "Quel système choisir ?", answer: "Asperseurs pour pelouse, goutte-à-goutte pour massifs/potager, tuyère pour petites surfaces." },
      { question: "Prix installation ?", answer: "800€-1500€ pour petit jardin (<100m²), 1500€-3000€ pour jardin moyen (100-300m²)." },
      { question: "Économise-t-on l'eau ?", answer: "Oui, jusqu'à 50% d'économie vs arrosage manuel grâce au programmateur et ciblage précis." },
    ],
  },
  // Tapissier
  {
    slug: "tapissier",
    name: "Tapissier",
    namePlural: "Tapissiers",
    category: "painter",
    keywords: ["tapissier", "pose papier peint", "tapisserie", "décoration murale", "revêtement mural"],
    description: "Tapissier professionnel pour pose de papier peint et décoration murale. Finitions impeccables.",
    priceRange: "30€ - 60€/m²",
    faqs: [
      { question: "Prix pose papier peint ?", answer: "Entre 20€ et 40€/m² selon type (vinyle, intissé, panoramique). Papier peint fourni : +10€-50€/m²." },
      { question: "Papier peint intissé ou vinyle ?", answer: "Intissé : facile à poser et enlever, respirant. Vinyle : lavable, résistant, idéal cuisine/salle de bain." },
      { question: "Combien de temps dure la pose ?", answer: "1-2 jours pour une pièce de 20m² selon complexité (raccords, obstacles)." },
    ],
  },
  // Plâtrier
  {
    slug: "platrier",
    name: "Plâtrier",
    namePlural: "Plâtriers",
    category: "walls_ceiling",
    keywords: ["plâtrier", "placo", "cloison", "plafond", "enduit", "plâtrerie"],
    description: "Plâtrier pour pose de cloisons, plafonds, isolation. Travaux de plâtrerie sur mesure.",
    priceRange: "25€ - 50€/m²",
    faqs: [
      { question: "Que fait un plâtrier ?", answer: "Pose cloisons Placo, isolation, plafonds suspendus, bandes joints, enduits lisses." },
      { question: "Prix cloison Placo ?", answer: "25€-40€/m² pour cloison simple. 35€-60€/m² avec isolation phonique/thermique." },
      { question: "Délai de séchage ?", answer: "Plâtre/enduit : 24-48h avant peinture. Respecter temps de séchage pour finitions parfaites." },
    ],
  },
  // Borne électrique
  {
    slug: "borne-electrique",
    name: "Borne électrique",
    namePlural: "Bornes électriques",
    category: "electrician",
    keywords: ["borne électrique", "wallbox", "borne recharge voiture", "installation borne", "véhicule électrique"],
    description: "Installation de borne de recharge pour véhicule électrique. Rechargez votre voiture à domicile.",
    priceRange: "500€ - 2000€",
    faqs: [
      { question: "Quelle puissance choisir ?", answer: "7,4 kW (charge nuit complète), 11 kW (plus rapide), 22 kW (nécessite triphasé)." },
      { question: "Aides financières ?", answer: "Crédit d'impôt 75% (plafonné à 500€). Prime Advenir en copropriété." },
      { question: "Installation dans garage ?", answer: "Oui, l'électricien installe la borne au mur du garage, raccordée au tableau électrique." },
    ],
  },
  // Domotique
  {
    slug: "domotique",
    name: "Domotique",
    namePlural: "Domotiques",
    category: "electrician",
    keywords: ["domotique", "maison connectée", "home automation", "smart home", "volets connectés"],
    description: "Installation de système domotique : éclairage, volets, chauffage, sécurité. Maison intelligente.",
    priceRange: "1000€ - 5000€",
    faqs: [
      { question: "Que peut-on automatiser ?", answer: "Éclairage, volets, chauffage, alarme, portail, arrosage. Contrôle à distance via smartphone." },
      { question: "Quel système choisir ?", answer: "Google Home/Alexa (économique), Somfy/Legrand (fiable), KNX (haut de gamme pro)." },
      { question: "Prix installation ?", answer: "Pack débutant : 1000€-2000€. Installation complète : 3000€-10000€ selon équipements." },
    ],
  },
  // Antenne TV
  {
    slug: "antenne-tv",
    name: "Antenne TV",
    namePlural: "Antennes TV",
    category: "electrician",
    keywords: ["antenne TV", "antenne TNT", "parabole", "réception TV", "installation antenne"],
    description: "Installation d'antenne TV TNT ou parabole satellite. Réception TV optimale.",
    priceRange: "80€ - 250€",
    faqs: [
      { question: "Antenne TNT ou parabole ?", answer: "TNT : chaînes gratuites françaises. Parabole : chaînes étrangères, satellites thématiques." },
      { question: "Prix installation ?", answer: "Antenne TNT : 80€-150€. Parabole satellite : 150€-350€ selon taille et nombre de têtes." },
      { question: "Régler l'orientation ?", answer: "L'installateur oriente l'antenne/parabole pour signal optimal. Réglage précis indispensable." },
    ],
  },
  // Ostéopathe domicile
  {
    slug: "osteopathe-domicile",
    name: "Ostéopathe",
    namePlural: "Ostéopathes",
    category: "health_beauty",
    keywords: ["ostéopathe", "ostéopathie", "mal de dos", "manipulation", "thérapie manuelle"],
    description: "Ostéopathe à domicile pour soulager douleurs dorsales, articulaires, musculaires. Consultation confortable.",
    priceRange: "50€ - 90€",
    faqs: [
      { question: "Ostéopathie remboursée ?", answer: "Partiellement par certaines mutuelles (20€-50€/séance). Pas par Sécurité Sociale." },
      { question: "Combien de séances ?", answer: "1-3 séances généralement. Douleur aiguë : 1-2 séances. Chronique : suivi régulier possible." },
      { question: "Ostéopathe à domicile ?", answer: "Pratique pour personnes à mobilité réduite, femmes enceintes, bébés. Supplément déplacement : 10€-20€." },
    ],
  },
  // Esthéticienne domicile
  {
    slug: "estheticienne-domicile",
    name: "Esthéticienne",
    namePlural: "Esthéticiennes",
    category: "health_beauty",
    keywords: ["esthéticienne", "soin visage", "épilation", "manucure", "beauté domicile"],
    description: "Esthéticienne à domicile : soins visage, épilation, manucure, pédicure. Institut à la maison.",
    priceRange: "40€ - 80€",
    faqs: [
      { question: "Quelles prestations ?", answer: "Épilation, soins visage, manucure/pédicure, maquillage, modelage. Matériel professionnel fourni." },
      { question: "Prix des soins ?", answer: "Soin visage : 40€-70€. Épilation jambes : 25€-40€. Manucure : 20€-35€." },
      { question: "Hygiène garantie ?", answer: "Matériel stérilisé, produits professionnels. Même normes qu'en institut." },
    ],
  },
];

// Get all service slugs for static generation
export function getAllServiceSlugs(): string[] {
  return SERVICES_SEO.map(s => s.slug);
}

// Get service by slug
export function getServiceBySlug(slug: string): ServiceSEO | undefined {
  return SERVICES_SEO.find(s => s.slug === slug);
}

// Get service by backend category (for URLs like /services/childcare/...)
export function getServiceByCategory(category: string): ServiceSEO | undefined {
  return SERVICES_SEO.find(s => s.category === category);
}

// Generate all service+city combinations for sitemap
export function getAllServiceCityCombinations(cities: string[]): { service: string; city: string }[] {
  const combinations: { service: string; city: string }[] = [];
  for (const service of SERVICES_SEO) {
    for (const city of cities) {
      combinations.push({ service: service.slug, city });
    }
  }
  return combinations;
}
