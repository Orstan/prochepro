"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SERVICES_SEO } from "@/lib/services-seo";
import { ALL_CITIES } from "@/lib/cities";
import { API_BASE_URL } from "@/lib/api";

const categoryIcons: Record<string, string> = {
  home_repair: "🛠️",
  cleaning: "🧹",
  moving: "📦",
  renovation: "🏠",
  it_web: "💻",
  events: "🎉",
  pets: "🐾",
  delivery: "🚚",
};

const categoryNames: Record<string, string> = {
  home_repair: "Réparations à domicile",
  cleaning: "Ménage & nettoyage",
  moving: "Déménagement",
  renovation: "Rénovation",
  it_web: "Informatique & web",
  events: "Événements",
  pets: "Animaux",
  delivery: "Livraison",
};

interface ParisDistrict {
  id: number;
  code: string;
  name: string;
  name_fr: string;
  slug: string;
  description?: string;
}

export default function ServicesPage() {
  const [districts, setDistricts] = useState<ParisDistrict[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Paris districts
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/districts`);
        
        if (!response.ok) {
          throw new Error('Failed to load districts');
        }
        
        const data = await response.json();
        setDistricts(data);
      } catch (err) {
        setError('Impossible de charger les districts');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDistricts();
  }, []);
  
  // Group services by category
  const servicesByCategory = SERVICES_SEO.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, typeof SERVICES_SEO>);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Tous nos services à Paris et Île-de-France
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Trouvez le prestataire idéal pour tous vos besoins. Comparez les prix, 
          consultez les avis et obtenez des devis gratuits.
        </p>
      </header>

      {/* Services by category */}
      <div className="space-y-12">
        {Object.entries(servicesByCategory).map(([category, services]) => (
          <section key={category}>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">{categoryIcons[category] || "📋"}</span>
              <h2 className="text-xl font-semibold text-slate-900">
                {categoryNames[category] || category}
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="group rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100 hover:shadow-md hover:ring-[#1E88E5]/20 transition"
                >
                  <h3 className="font-semibold text-slate-900 group-hover:text-[#1E88E5] mb-2">
                    {service.name}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#1E88E5]">
                      {service.priceRange}
                    </span>
                    <span className="text-xs text-slate-400">
                      Voir les villes →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Paris Districts */}
      <section className="mt-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">📍</span>
          <h2 className="text-xl font-semibold text-slate-900">
            Services par arrondissement de Paris
          </h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-sky-500 border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {districts.map((district) => (
              <Link
                key={district.id}
                href={`/services/home_repair/${district.slug}`}
                className="group rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100 hover:shadow-md hover:ring-[#1E88E5]/20 transition"
              >
                <h3 className="font-semibold text-slate-900 group-hover:text-[#1E88E5] mb-1">
                  {district.name_fr}
                </h3>
                <p className="text-sm text-slate-500 mb-2">
                  Code postal: {district.code}
                </p>
                <span className="text-xs text-[#1E88E5]">
                  Voir les services disponibles →
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
      
      {/* Popular searches */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">
          🔍 Recherches populaires
        </h2>
        <div className="flex flex-wrap gap-2">
          {SERVICES_SEO.slice(0, 6).flatMap((service) =>
            ALL_CITIES.slice(0, 3).map((city) => (
              <Link
                key={`${service.slug}-${city}`}
                href={`/services/${service.slug}/${encodeURIComponent(city.toLowerCase().replace(/ /g, "-"))}`}
                className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-[#E3F2FD] hover:text-[#1E88E5] transition"
              >
                {service.name} {city}
              </Link>
            ))
          )}
          
          {/* Add links to Paris districts for popular services */}
          {!loading && !error && districts.length > 0 && SERVICES_SEO.slice(0, 3).flatMap((service) =>
            districts.slice(0, 5).map((district) => (
              <Link
                key={`${service.slug}-${district.slug}`}
                href={`/services/${service.slug}/${district.slug}`}
                className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-[#E3F2FD] hover:text-[#1E88E5] transition"
              >
                {service.name} {district.name_fr}
              </Link>
            ))
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 rounded-3xl bg-gradient-to-br from-[#1E88E5] to-[#1565C0] p-8 md:p-12 text-center text-white">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Vous ne trouvez pas ce que vous cherchez ?
        </h2>
        <p className="text-white/80 max-w-xl mx-auto mb-6">
          Publiez votre demande et recevez des offres de prestataires qualifiés.
        </p>
        <Link
          href="/tasks/new"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-[#1E88E5] shadow-lg hover:bg-slate-50 transition"
        >
          Publier une demande gratuite
        </Link>
      </section>
    </div>
  );
}
