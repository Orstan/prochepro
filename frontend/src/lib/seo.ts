import { Metadata } from "next";

const SITE_URL = "https://prochepro.fr";
const SITE_NAME = "ProchePro";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

// Ключові слова для SEO (французькою)
export const SEO_KEYWORDS = {
  primary: [
    "services à domicile",
    "prestataires de services",
    "trouver un professionnel",
    "services près de chez moi",
    "aide à domicile",
    "travaux maison",
    "réparations",
    "bricolage",
    "ménage",
    "jardinage",
  ],
  secondary: [
    "plombier",
    "électricien",
    "peintre",
    "déménagement",
    "nettoyage",
    "baby-sitting",
    "cours particuliers",
    "informatique",
    "montage meuble",
    "livraison",
  ],
  locations: [
    "Paris",
    "Lyon",
    "Marseille",
    "Toulouse",
    "Nice",
    "Nantes",
    "Bordeaux",
    "Lille",
    "Strasbourg",
    "France",
  ],
};

// Базові meta tags
export function generateMetadata({
  title,
  description,
  keywords = [],
  image = DEFAULT_IMAGE,
  url = SITE_URL,
  type = "website",
  noIndex = false,
}: {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile";
  noIndex?: boolean;
}): Metadata {
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
  const allKeywords = [...SEO_KEYWORDS.primary.slice(0, 5), ...keywords].join(", ");

  return {
    title: fullTitle,
    description,
    keywords: allKeywords,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    alternates: {
      canonical: url,
      languages: {
        "fr-FR": url,
        "x-default": url,
      },
    },
    openGraph: {
      type,
      locale: "fr_FR",
      url,
      title: fullTitle,
      description,
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
      creator: "@prochepro",
    },
    verification: {
      google: "YOUR_GOOGLE_VERIFICATION_CODE",
      // yandex: "YOUR_YANDEX_CODE",
      // bing: "YOUR_BING_CODE",
    },
    category: "services",
  };
}

// Schema.org JSON-LD для організації
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      "ProchePro est la plateforme n°1 en France pour trouver des prestataires de services de confiance près de chez vous.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "FR",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["French"],
    },
    sameAs: [
      "https://www.facebook.com/prochepro",
      "https://www.twitter.com/prochepro",
      "https://www.instagram.com/prochepro",
      "https://www.linkedin.com/company/prochepro",
    ],
  };
}

// Schema.org JSON-LD для WebSite (пошук)
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Trouvez des prestataires de services de confiance près de chez vous. Plombier, électricien, ménage, jardinage et plus.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/tasks?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// Schema.org JSON-LD для LocalBusiness
export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": SITE_URL,
    name: SITE_NAME,
    image: `${SITE_URL}/logo.png`,
    url: SITE_URL,
    description:
      "Marketplace de services à domicile. Trouvez des professionnels qualifiés pour tous vos besoins.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "FR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 48.8566,
      longitude: 2.3522,
    },
    areaServed: {
      "@type": "Country",
      name: "France",
    },
    priceRange: "€€",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59",
    },
  };
}

// Schema.org JSON-LD для Service
export function generateServiceSchema(service: {
  name: string;
  description: string;
  category: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: {
      "@type": "Country",
      name: "France",
    },
    serviceType: service.category,
    url: service.url,
  };
}

// Schema.org JSON-LD для Task (JobPosting)
export function generateTaskSchema(task: {
  id: number;
  title: string;
  description: string;
  city?: string;
  budget_min?: number;
  budget_max?: number;
  created_at: string;
  category?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: task.title,
    description: task.description,
    datePosted: task.created_at,
    validThrough: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    employmentType: "CONTRACTOR",
    hiringOrganization: {
      "@type": "Organization",
      name: SITE_NAME,
      sameAs: SITE_URL,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: task.city || "France",
        addressCountry: "FR",
      },
    },
    baseSalary: task.budget_min
      ? {
          "@type": "MonetaryAmount",
          currency: "EUR",
          value: {
            "@type": "QuantitativeValue",
            minValue: task.budget_min,
            maxValue: task.budget_max || task.budget_min,
            unitText: "HOUR",
          },
        }
      : undefined,
    industry: task.category || "Services",
    url: `${SITE_URL}/tasks/${task.id}`,
  };
}

// Schema.org JSON-LD для Profile (Person)
export function generateProfileSchema(user: {
  id: number;
  name: string;
  city?: string;
  average_rating?: number;
  reviews_count?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: user.name,
    url: `${SITE_URL}/profile/${user.id}`,
    address: user.city
      ? {
          "@type": "PostalAddress",
          addressLocality: user.city,
          addressCountry: "FR",
        }
      : undefined,
    aggregateRating: user.average_rating
      ? {
          "@type": "AggregateRating",
          ratingValue: user.average_rating,
          reviewCount: user.reviews_count || 0,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
  };
}

// Schema.org JSON-LD для FAQ
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// Schema.org JSON-LD для BreadcrumbList
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Категорії сервісів для SEO
export const SERVICE_CATEGORIES = [
  {
    slug: "plomberie",
    name: "Plomberie",
    title: "Plombier à domicile",
    description:
      "Trouvez un plombier professionnel près de chez vous. Réparation fuite, débouchage, installation sanitaire.",
    keywords: ["plombier", "fuite eau", "débouchage", "sanitaire", "robinet", "chauffe-eau"],
  },
  {
    slug: "electricite",
    name: "Électricité",
    title: "Électricien à domicile",
    description:
      "Électriciens qualifiés pour tous vos travaux électriques. Installation, dépannage, mise aux normes.",
    keywords: ["électricien", "panne électrique", "installation électrique", "tableau électrique"],
  },
  {
    slug: "menage",
    name: "Ménage",
    title: "Service de ménage à domicile",
    description:
      "Femme de ménage et aide ménagère de confiance. Nettoyage régulier ou ponctuel de votre logement.",
    keywords: ["femme de ménage", "nettoyage", "aide ménagère", "entretien maison"],
  },
  {
    slug: "jardinage",
    name: "Jardinage",
    title: "Jardinier à domicile",
    description:
      "Jardiniers professionnels pour l'entretien de votre jardin. Tonte, taille, plantation, débroussaillage.",
    keywords: ["jardinier", "tonte pelouse", "taille haie", "entretien jardin"],
  },
  {
    slug: "demenagement",
    name: "Déménagement",
    title: "Aide au déménagement",
    description:
      "Trouvez de l'aide pour votre déménagement. Portage, transport, montage et démontage de meubles.",
    keywords: ["déménagement", "déménageur", "transport meubles", "aide déménagement"],
  },
  {
    slug: "bricolage",
    name: "Bricolage",
    title: "Bricoleur à domicile",
    description:
      "Bricoleurs polyvalents pour tous vos petits travaux. Montage meuble, fixation, réparations diverses.",
    keywords: ["bricoleur", "montage meuble", "petits travaux", "réparation"],
  },
  {
    slug: "peinture",
    name: "Peinture",
    title: "Peintre en bâtiment",
    description:
      "Peintres professionnels pour vos travaux de peinture intérieure et extérieure. Devis gratuit.",
    keywords: ["peintre", "peinture intérieure", "peinture extérieure", "ravalement"],
  },
  {
    slug: "informatique",
    name: "Informatique",
    title: "Dépannage informatique à domicile",
    description:
      "Assistance informatique à domicile. Réparation PC, installation, configuration, formation.",
    keywords: ["dépannage informatique", "réparation ordinateur", "assistance PC", "installation"],
  },
  {
    slug: "cours",
    name: "Cours particuliers",
    title: "Cours particuliers à domicile",
    description:
      "Professeurs particuliers pour tous niveaux. Soutien scolaire, langues, musique, sport.",
    keywords: ["cours particuliers", "soutien scolaire", "professeur particulier", "aide devoirs"],
  },
  {
    slug: "garde-enfants",
    name: "Garde d'enfants",
    title: "Baby-sitting et garde d'enfants",
    description:
      "Baby-sitters et nounous de confiance. Garde ponctuelle ou régulière, sortie d'école.",
    keywords: ["baby-sitting", "nounou", "garde enfants", "sortie école"],
  },
];

// Villes principales pour SEO local
export const MAIN_CITIES = [
  { name: "Paris", slug: "paris", region: "Île-de-France" },
  { name: "Lyon", slug: "lyon", region: "Auvergne-Rhône-Alpes" },
  { name: "Marseille", slug: "marseille", region: "Provence-Alpes-Côte d'Azur" },
  { name: "Toulouse", slug: "toulouse", region: "Occitanie" },
  { name: "Nice", slug: "nice", region: "Provence-Alpes-Côte d'Azur" },
  { name: "Nantes", slug: "nantes", region: "Pays de la Loire" },
  { name: "Bordeaux", slug: "bordeaux", region: "Nouvelle-Aquitaine" },
  { name: "Lille", slug: "lille", region: "Hauts-de-France" },
  { name: "Strasbourg", slug: "strasbourg", region: "Grand Est" },
  { name: "Rennes", slug: "rennes", region: "Bretagne" },
  { name: "Montpellier", slug: "montpellier", region: "Occitanie" },
  { name: "Grenoble", slug: "grenoble", region: "Auvergne-Rhône-Alpes" },
];
