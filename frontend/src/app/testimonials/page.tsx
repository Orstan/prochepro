"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
import VideoTestimonialCard from "@/components/VideoTestimonialCard";

type VideoTestimonial = {
  id: number;
  cloudinary_public_id: string;
  name: string;
  role: string | null;
  text: string | null;
  duration: number | null;
  thumbnail_url: string | null;
};

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<VideoTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  async function fetchTestimonials() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/testimonials`);
      
      if (!res.ok) {
        throw new Error("Impossible de charger les témoignages");
      }
      
      const data = await res.json();
      setTestimonials(data);
    } catch (err) {
      setError("Erreur lors du chargement des témoignages");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-12 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300 transition-all"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">Retour à l&apos;accueil</span>
            <span className="sm:hidden">Retour</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-medium text-amber-700 mb-3 sm:mb-4">
            <span>📹</span>
            <span>Témoignages vidéo</span>
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">
            Ils témoignent en vidéo
          </h1>
          
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto px-4">
            Découvrez les avis authentiques de nos clients et prestataires
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600"></div>
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-red-50 p-8 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="rounded-2xl bg-slate-100 p-12 text-center">
            <div className="text-6xl mb-4">📹</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Aucun témoignage pour le moment
            </h3>
            <p className="text-slate-600">
              Les témoignages vidéo apparaîtront ici prochainement
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <VideoTestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                autoplay={false}
                showText={true}
              />
            ))}
          </div>
        )}

        {/* Call to Action */}
        {!loading && testimonials.length > 0 && (
          <div className="mt-16 text-center">
            <div className="rounded-3xl bg-gradient-to-br from-sky-50 via-white to-violet-50 p-8 ring-1 ring-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Vous aussi, partagez votre expérience !
              </h3>
              <p className="text-slate-600 mb-6 max-w-lg mx-auto">
                Votre témoignage vidéo aide d&apos;autres utilisateurs à découvrir ProchePro
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <span>Retour à l&apos;accueil</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
