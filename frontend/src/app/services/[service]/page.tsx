"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getServiceBySlug, SERVICES_SEO } from "@/lib/services-seo";
import { ALL_CITIES, CITIES_WITH_REGIONS } from "@/lib/cities";

export default function ServicePage() {
  const params = useParams();
  const serviceSlug = params.service as string;
  const service = getServiceBySlug(serviceSlug);

  if (!service) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Service non trouvé</h1>
        <p className="mt-2 text-slate-600">Ce service n&apos;existe pas.</p>
        <Link href="/services" className="mt-4 inline-block text-[#1E88E5] hover:underline">
          Voir tous les services
        </Link>
      </div>
    );
  }

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.name,
    "description": service.description,
    "provider": {
      "@type": "Organization",
      "name": "ProchePro",
      "url": "https://prochepro.fr"
    },
    "areaServed": {
      "@type": "State",
      "name": "Île-de-France"
    },
    "priceRange": service.priceRange
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm text-slate-500">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-[#1E88E5]">Accueil</Link></li>
            <li>/</li>
            <li><Link href="/services" className="hover:text-[#1E88E5]">Services</Link></li>
            <li>/</li>
            <li className="text-slate-900 font-medium">{service.name}</li>
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {service.name} en Île-de-France
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mb-6">
            {service.description}
          </p>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-[#1E88E5]">
            💰 Prix moyen : {service.priceRange}
          </div>
        </header>

        {/* Cities grid */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            🏙️ Choisissez votre ville
          </h2>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {ALL_CITIES.map((city) => {
              const cityInfo = CITIES_WITH_REGIONS.find(c => c.city === city);
              return (
                <Link
                  key={city}
                  href={`/services/${serviceSlug}/${encodeURIComponent(city.toLowerCase().replace(/ /g, "-"))}`}
                  className="group rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100 hover:shadow-md hover:ring-[#1E88E5]/30 transition"
                >
                  <div className="font-medium text-slate-900 group-hover:text-[#1E88E5]">
                    {service.name} {city}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {cityInfo?.region || "Île-de-France"}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

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
                {keyword}
              </span>
            ))}
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
              {service.name.toLowerCase()} pas cher
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
              {service.name.toLowerCase()} avis
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
              tarif {service.name.toLowerCase()}
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
            🔧 Autres services
          </h2>
          <div className="flex flex-wrap gap-2">
            {SERVICES_SEO.filter(s => s.slug !== serviceSlug).map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm text-slate-700 shadow-sm ring-1 ring-slate-100 hover:bg-slate-50 hover:text-[#1E88E5] transition"
              >
                {s.name}
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-3xl bg-gradient-to-br from-[#1E88E5] to-[#1565C0] p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Besoin d&apos;un {service.name.toLowerCase()} ?
          </h2>
          <p className="text-white/80 max-w-xl mx-auto mb-6">
            Publiez votre demande gratuitement et recevez des devis de {service.namePlural.toLowerCase()} qualifiés.
          </p>
          <Link
            href={`/tasks/new?category=${service.category}`}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-[#1E88E5] shadow-lg hover:bg-slate-50 transition"
          >
            Publier ma demande gratuitement
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </section>
      </div>
    </>
  );
}
