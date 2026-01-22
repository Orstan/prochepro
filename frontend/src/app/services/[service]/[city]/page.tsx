"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getServiceBySlug, SERVICES_SEO } from "@/lib/services-seo";
import { ALL_CITIES, CITIES_WITH_REGIONS } from "@/lib/cities";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.prochepro.fr";

interface Task {
  id: number;
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  city: string;
  created_at: string;
  status: string;
}

export default function ServiceCityPage() {
  const params = useParams();
  const router = useRouter();
  const serviceSlug = params.service as string;
  const citySlug = params.city as string;
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Decode city name from URL
  const cityName = decodeURIComponent(citySlug).replace(/-/g, " ");
  const cityInfo = CITIES_WITH_REGIONS.find(
    c => c.city.toLowerCase() === cityName.toLowerCase()
  );
  
  // Try to get service by slug first
  let service = getServiceBySlug(serviceSlug);
  
  // Fallback: if URL contains category instead of slug, redirect to correct slug URL
  if (!service) {
    const { getServiceByCategory } = require('@/lib/services-seo');
    const serviceByCategory = getServiceByCategory(serviceSlug);
    if (serviceByCategory) {
      // Redirect to correct slug URL
      router.replace(`/services/${serviceByCategory.slug}/${citySlug}`);
      return null;
    }
  }

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/tasks?city=${encodeURIComponent(cityName)}&category=${service?.category || ""}&status=open&per_page=6`
        );
        if (res.ok) {
          const json = await res.json();
          setTasks(json.data || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, [cityName, service?.category]);

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

  const pageTitle = `${service.name} ${cityName} - Tarifs et Avis | ProchePro`;
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
      {/* SEO Meta tags via script */}
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

        {/* Hero Section */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Disponible maintenant
            </span>
            <span className="text-sm text-slate-500">{cityInfo?.region || "Île-de-France"}</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {service.name} à {cityName}
          </h1>
          
          <p className="text-lg text-slate-600 max-w-3xl mb-6">
            {service.description}
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => router.push(`/tasks/new?category=${service.category}&city=${encodeURIComponent(cityName)}`)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1E88E5] px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#1565C0] transition"
            >
              Publier une demande gratuite
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <button
              onClick={() => router.push(`/tasks/browse?city=${encodeURIComponent(cityName)}&category=${service.category}`)}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow ring-1 ring-slate-200 hover:bg-slate-50 transition"
            >
              Voir les demandes en cours
            </button>
          </div>
        </header>

        {/* Price Info */}
        <section className="mb-12 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                💰 Prix moyen d&apos;un {service.name.toLowerCase()} à {cityName}
              </h2>
              <p className="text-slate-600">
                Tarifs indicatifs basés sur les demandes récentes
              </p>
            </div>
            <div className="text-center md:text-right">
              <div className="text-3xl font-bold text-[#1E88E5]">{service.priceRange}</div>
              <p className="text-sm text-slate-500">selon la prestation</p>
            </div>
          </div>
        </section>

        {/* Keywords / Related searches */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Recherches populaires
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
              {service.name.toLowerCase()} avis {cityName}
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
              tarif {service.name.toLowerCase()} {cityName}
            </span>
          </div>
        </section>

        {/* Recent Tasks */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              📋 Demandes récentes à {cityName}
            </h2>
            <Link
              href={`/tasks/browse?city=${encodeURIComponent(cityName)}&category=${service.category}`}
              className="text-sm font-medium text-[#1E88E5] hover:underline"
            >
              Voir tout
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-xl bg-slate-100 h-40" />
              ))}
            </div>
          ) : tasks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100 hover:shadow-md transition"
                >
                  <h3 className="font-semibold text-slate-900 line-clamp-2 mb-2">
                    {task.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                    {task.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#1E88E5]">
                      {task.budget_min}€ - {task.budget_max}€
                    </span>
                    <span className="text-xs text-slate-400">{task.city}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-slate-50 p-8 text-center">
              <p className="text-slate-600 mb-4">
                Aucune demande en cours pour ce service à {cityName}.
              </p>
              <button
                onClick={() => router.push(`/tasks/new?category=${service.category}&city=${encodeURIComponent(cityName)}`)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#1E88E5] px-4 py-2 text-sm font-medium text-white hover:bg-[#1565C0]"
              >
                Soyez le premier à publier
              </button>
            </div>
          )}
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            ❓ Questions fréquentes sur les {service.namePlural.toLowerCase()} à {cityName}
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

        {/* Other cities */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            🏙️ {service.name} dans d&apos;autres villes
          </h2>
          <div className="flex flex-wrap gap-2">
            {ALL_CITIES.filter(c => c.toLowerCase() !== cityName.toLowerCase()).slice(0, 10).map((city) => (
              <Link
                key={city}
                href={`/services/${serviceSlug}/${encodeURIComponent(city.toLowerCase().replace(/ /g, "-"))}`}
                className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm text-slate-700 shadow-sm ring-1 ring-slate-100 hover:bg-slate-50 hover:text-[#1E88E5] transition"
              >
                {service.name} {city}
              </Link>
            ))}
          </div>
        </section>

        {/* Other services in this city */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            🔧 Autres services à {cityName}
          </h2>
          <div className="flex flex-wrap gap-2">
            {SERVICES_SEO.filter(s => s.slug !== serviceSlug).slice(0, 8).map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}/${encodeURIComponent(cityName.toLowerCase().replace(/ /g, "-"))}`}
                className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm text-slate-700 shadow-sm ring-1 ring-slate-100 hover:bg-slate-50 hover:text-[#1E88E5] transition"
              >
                {s.name} {cityName}
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-3xl bg-gradient-to-br from-[#1E88E5] to-[#1565C0] p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Besoin d&apos;un {service.name.toLowerCase()} à {cityName} ?
          </h2>
          <p className="text-white/80 max-w-xl mx-auto mb-6">
            Publiez votre demande gratuitement et recevez des devis de {service.namePlural.toLowerCase()} qualifiés près de chez vous.
          </p>
          <button
            onClick={() => router.push(`/tasks/new?category=${service.category}&city=${encodeURIComponent(cityName)}`)}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-[#1E88E5] shadow-lg hover:bg-slate-50 transition"
          >
            Publier ma demande gratuitement
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </section>
      </div>
    </>
  );
}
