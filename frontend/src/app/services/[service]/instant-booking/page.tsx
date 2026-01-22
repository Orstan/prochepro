"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getServiceBySlug } from "@/lib/services-seo";

interface Prestataire {
  id: number;
  first_name: string;
  last_name: string;
  company_name: string;
  profile_photo: string | null;
  rating: number;
  reviews_count: number;
  city: string;
  instant_booking_enabled: boolean;
  fixed_prices: {
    id: number;
    service_name: string;
    price: number;
    duration_minutes: number;
    description: string;
  }[];
}

export default function InstantBookingPage() {
  const params = useParams();
  const router = useRouter();
  const serviceSlug = params.service as string;
  const service = getServiceBySlug(serviceSlug);
  
  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!service) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/instant-booking/available-prestataires?service_category=${service.category}`)
      .then(res => res.json())
      .then(data => {
        setPrestataires(data.data || []);
        setLoading(false);
      })
      .catch(err => {
        setError("Erreur lors du chargement des prestataires");
        setLoading(false);
      });
  }, [service]);

  if (!service) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Service non trouvé</h1>
        <Link href="/services" className="mt-4 inline-block text-[#1E88E5] hover:underline">
          Voir tous les services
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="mb-6 text-sm text-slate-500">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-[#1E88E5]">Accueil</Link></li>
          <li>/</li>
          <li><Link href="/services" className="hover:text-[#1E88E5]">Services</Link></li>
          <li>/</li>
          <li><Link href={`/services/${serviceSlug}`} className="hover:text-[#1E88E5]">{service.name}</Link></li>
          <li>/</li>
          <li className="text-slate-900 font-medium">Réservation instantanée</li>
        </ol>
      </nav>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 mb-4">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Réservation instantanée
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          {service.name} - Disponible maintenant
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl">
          Choisissez un professionnel et réservez en moins de 30 secondes
        </p>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#1E88E5] border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Chargement des professionnels disponibles...</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
          <p className="text-red-700">{error}</p>
          <Link href={`/services/${serviceSlug}`} className="mt-4 inline-block text-[#1E88E5] hover:underline">
            Retour
          </Link>
        </div>
      )}

      {!loading && !error && prestataires.length === 0 && (
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-12 text-center">
          <div className="text-5xl mb-4">😔</div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Aucun professionnel disponible pour l&apos;instant
          </h2>
          <p className="text-slate-600 mb-6">
            Essayez de publier une annonce pour recevoir des offres
          </p>
          <Link
            href={`/tasks/new?category=${service.category}`}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1E88E5] px-6 py-3 text-white font-semibold hover:bg-[#1565C0] transition"
          >
            Publier une annonce
          </Link>
        </div>
      )}

      {!loading && !error && prestataires.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {prestataires.map((prestataire) => (
            <div
              key={prestataire.id}
              className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 hover:shadow-lg hover:ring-[#1E88E5]/30 transition"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {prestataire.first_name?.[0]}{prestataire.last_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">
                    {prestataire.company_name || `${prestataire.first_name} ${prestataire.last_name}`}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-slate-600 mt-1">
                    <svg className="h-4 w-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-medium">{prestataire.rating.toFixed(1)}</span>
                    <span className="text-slate-400">({prestataire.reviews_count})</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">📍 {prestataire.city}</p>
                </div>
              </div>

              {prestataire.fixed_prices.length > 0 && (
                <div className="space-y-3 mb-4">
                  {prestataire.fixed_prices.slice(0, 2).map((price) => (
                    <div key={price.id} className="rounded-lg bg-slate-50 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 text-sm">{price.service_name}</p>
                          <p className="text-xs text-slate-500 mt-1">⏱️ {price.duration_minutes} min</p>
                        </div>
                        <p className="font-bold text-[#1E88E5] text-lg whitespace-nowrap">{price.price}€</p>
                      </div>
                    </div>
                  ))}
                  {prestataire.fixed_prices.length > 2 && (
                    <p className="text-xs text-slate-500 text-center">
                      +{prestataire.fixed_prices.length - 2} autres services
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={() => router.push(`/instant-booking/${prestataire.id}?service=${serviceSlug}`)}
                className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-3 text-sm font-semibold text-slate-900 shadow-md hover:from-amber-500 hover:to-amber-600 transition flex items-center justify-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Réserver maintenant
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 rounded-2xl bg-slate-50 border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">💡 Pourquoi la réservation instantanée ?</h3>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span><strong>Rapide :</strong> Réservez en moins de 30 secondes</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span><strong>Prix transparent :</strong> Vous connaissez le prix exact avant de réserver</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span><strong>Disponibilité garantie :</strong> Le professionnel est disponible aux créneaux proposés</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span><strong>Paiement sécurisé :</strong> Payez en ligne en toute sécurité</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
