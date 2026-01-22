/**
 * StructuredData Component
 * Виводить JSON-LD structured data для SEO
 */

interface StructuredDataProps {
  data: Record<string, any>;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Компонент для Breadcrumbs structured data
 */
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsStructuredDataProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbsStructuredData({ items }: BreadcrumbsStructuredDataProps) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <StructuredData data={breadcrumbSchema} />;
}

/**
 * Компонент для Service structured data
 */
interface ServiceStructuredDataProps {
  name: string;
  description: string;
  category: string;
  priceRange?: string;
  areaServed?: string;
  provider?: {
    name: string;
    url: string;
  };
}

export function ServiceStructuredData({
  name,
  description,
  category,
  priceRange,
  areaServed = "France",
  provider = {
    name: "ProchePro",
    url: "https://prochepro.fr",
  },
}: ServiceStructuredDataProps) {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    serviceType: category,
    provider: {
      "@type": "Organization",
      name: provider.name,
      url: provider.url,
    },
    areaServed: {
      "@type": "Country",
      name: areaServed,
    },
    ...(priceRange && { priceRange }),
  };

  return <StructuredData data={serviceSchema} />;
}

/**
 * Компонент для FAQ structured data
 */
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQStructuredDataProps {
  faqs: FAQItem[];
}

export function FAQStructuredData({ faqs }: FAQStructuredDataProps) {
  const faqSchema = {
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

  return <StructuredData data={faqSchema} />;
}

/**
 * Компонент для LocalBusiness structured data
 */
interface LocalBusinessStructuredDataProps {
  name: string;
  city: string;
  region?: string;
  description: string;
  services: string[];
  priceRange?: string;
}

export function LocalBusinessStructuredData({
  name,
  city,
  region = "Île-de-France",
  description,
  services,
  priceRange = "€€",
}: LocalBusinessStructuredDataProps) {
  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `${name} ${city}`,
    description,
    address: {
      "@type": "PostalAddress",
      addressLocality: city,
      addressRegion: region,
      addressCountry: "FR",
    },
    areaServed: {
      "@type": "City",
      name: city,
    },
    priceRange,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Services disponibles",
      itemListElement: services.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service,
        },
      })),
    },
  };

  return <StructuredData data={businessSchema} />;
}

/**
 * Компонент для Product/Service with AggregateRating
 */
interface RatingStructuredDataProps {
  name: string;
  description: string;
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
}

export function RatingStructuredData({
  name,
  description,
  ratingValue,
  reviewCount,
  bestRating = 5,
  worstRating = 1,
}: RatingStructuredDataProps) {
  const ratingSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue,
      reviewCount,
      bestRating,
      worstRating,
    },
  };

  return <StructuredData data={ratingSchema} />;
}

/**
 * Компонент для Article (Blog) structured data
 */
interface ArticleStructuredDataProps {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  url: string;
}

export function ArticleStructuredData({
  title,
  description,
  author,
  datePublished,
  dateModified,
  image = "https://prochepro.fr/og-image.jpg",
  url,
}: ArticleStructuredDataProps) {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    author: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: "ProchePro",
      logo: {
        "@type": "ImageObject",
        url: "https://prochepro.fr/logo.png",
      },
    },
    datePublished,
    dateModified: dateModified || datePublished,
    image,
    url,
  };

  return <StructuredData data={articleSchema} />;
}
