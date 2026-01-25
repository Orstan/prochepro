import { redirect } from "next/navigation";
import Link from "next/link";
import { getServiceBySlug, SERVICES_SEO, getServiceByCategory } from "@/lib/services-seo";
import { CITIES_WITH_REGIONS } from "@/lib/cities";
import ServiceCityContent from "./ServiceCityContent";

interface Props {
  params: { service: string; city: string };
}

export default function ServiceCityPage({ params }: Props) {
  const serviceSlug = params.service;
  const citySlug = params.city;
  
  // Try to get service by slug first
  let service = getServiceBySlug(serviceSlug);
  
  // Fallback: if URL contains category instead of slug, redirect to correct slug URL
  if (!service) {
    const serviceByCategory = getServiceByCategory(serviceSlug);
    if (serviceByCategory) {
      redirect(`/services/${serviceByCategory.slug}/${citySlug}`);
    }
  }

  if (!service) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Service non trouvé</h1>
        <p className="mt-2 text-slate-600">Ce service n&apos;existe pas.</p>
        <Link href="/" className="mt-4 inline-block text-[#1E88E5] hover:underline">
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  // Decode city name from URL
  const cityName = decodeURIComponent(citySlug).replace(/-/g, " ");
  const cityInfo = CITIES_WITH_REGIONS.find(
    c => c.city.toLowerCase() === cityName.toLowerCase()
  );

  const pageDescription = `Trouvez un ${service.name.toLowerCase()} à ${cityName}. ${service.description} Comparez les prix et avis. Devis gratuit !`;

  // Structured data for SEO (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `${service.name} à ${cityName}`,
    "description": pageDescription,
    "provider": {
      "@type": "Organization",
      "name": "ProchePro",
      "url": "https://prochepro.fr"
    },
    "areaServed": {
      "@type": "City",
      "name": cityName,
      "containedInPlace": {
        "@type": "AdministrativeArea",
        "name": cityInfo?.region || "Île-de-France"
      }
    },
    "priceRange": service.priceRange
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": service.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm text-slate-500">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-[#1E88E5]">Accueil</Link></li>
            <li>/</li>
            <li><Link href="/services" className="hover:text-[#1E88E5]">Services</Link></li>
            <li>/</li>
            <li><Link href={`/services/${serviceSlug}`} className="hover:text-[#1E88E5]">{service.name}</Link></li>
            <li>/</li>
            <li className="text-slate-900 font-medium">{cityName}</li>
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {service.name} à {cityName}
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mb-6">
            {service.description} Prix moyen : {service.priceRange}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/tasks/new?category=${service.category}`}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1E88E5] px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-[#1565C0] transition"
            >
              Publier ma demande gratuitement
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href={`/prestataires?category=${service.category}&city=${cityName}`}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-[#1E88E5] shadow-md ring-1 ring-slate-200 hover:bg-slate-50 transition"
            >
              Voir les professionnels
            </Link>
          </div>
        </header>

        {/* Dynamic Tasks List - Client Component */}
        <ServiceCityContent cityName={cityName} serviceCategory={service.category} />

        {/* Keywords */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            🔍 Recherches associées
          </h2>
          <div className="flex flex-wrap gap-2">
            {service.keywords.map((keyword) => (
              <span
                key={keyword}
                className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700"
              >
                {keyword} {cityName}
              </span>
            ))}
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
              {service.name.toLowerCase()} pas cher {cityName}
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
              tarif {service.name.toLowerCase()} {cityName}
            </span>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            ❓ Questions fréquentes
          </h2>
          <div className="space-y-4">
            {service.faqs.map((faq, index) => (
              <details
                key={index}
                className="group rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100"
              >
                <summary className="flex cursor-pointer items-center justify-between font-medium text-slate-900">
                  {faq.question}
                  <svg
                    className="h-5 w-5 text-slate-400 transition group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-4 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Other services */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            🔧 Autres services à {cityName}
          </h2>
          <div className="flex flex-wrap gap-2">
            {SERVICES_SEO.filter(s => s.slug !== serviceSlug).slice(0, 10).map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}/${citySlug}`}
                className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm text-slate-700 shadow-sm ring-1 ring-slate-100 hover:bg-slate-50 hover:text-[#1E88E5] transition"
              >
                {s.name}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
