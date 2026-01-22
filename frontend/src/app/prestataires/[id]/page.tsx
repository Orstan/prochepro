"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import UserAvatar from "@/components/UserAvatar";
import RankBadge from "@/components/gamification/RankBadge";
import PriceListDisplay from "@/components/PriceListDisplay";
import { API_BASE_URL } from "@/lib/api";
import { getCategoryByKey } from "@/lib/categories";

interface PortfolioItem {
  id: number;
  title: string;
  description?: string;
  category?: string;
  images: string[];
  location?: string;
  completed_at?: string;
  budget?: number;
  duration_days?: number;
  is_featured: boolean;
}

interface Review {
  id: number;
  rating: number;
  comment?: string;
  created_at: string;
  client?: {
    name?: string;
    avatar?: string;
  };
  task?: {
    title?: string;
  };
}

interface PrestataireProfile {
  id: number;
  name: string;
  avatar?: string;
  city?: string;
  bio?: string;
  phone?: string;
  website?: string;
  skills: string[];
  experience_years?: string;
  service_areas: string[];
  certifications: string[];
  service_categories?: string[];
  service_subcategories?: string[];
  is_verified: boolean;
  hourly_rate?: number;
  company_name?: string;
  member_since?: string;
  stats: {
    average_rating?: number;
    reviews_count: number;
    completed_tasks: number;
    portfolio_count: number;
  };
  portfolio: PortfolioItem[];
  reviews: Review[];
  level?: number;
  xp?: number;
  total_tasks_completed?: number;
  latest_badge?: {
    icon: string;
    name: string;
  } | null;
  earned_badges?: Array<{
    icon: string;
    name: string;
  }>;
}

export default function PrestataireProfilePage() {
  const router = useRouter();
  const params = useParams();
  const idParam = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";

  const [profile, setProfile] = useState<PrestataireProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"portfolio" | "reviews" | "prices">("portfolio");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!idParam) return;
    fetchProfile(idParam);
  }, [idParam]);

  async function fetchProfile(userId: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/prestataires/${userId}/profile`);
      if (!res.ok) throw new Error("Impossible de charger le profil.");
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Une erreur inconnue est survenue.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-sky-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Profil non trouvé</h1>
        <p className="text-slate-600 mb-4">{error}</p>
        <button onClick={() => router.back()} className="text-sky-600 hover:underline">
          ← Retour
        </button>
      </div>
    );
  }

  const { stats } = profile;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-6 text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1"
      >
        ← Retour
      </button>

      {/* Profile Header */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <UserAvatar avatar={profile.avatar} name={profile.name} size="xl" />
          </div>
          
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
              {profile.is_verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  ✓ Vérifié
                </span>
              )}
            </div>
            
            {profile.company_name && (
              <p className="text-slate-600 mb-2">{profile.company_name}</p>
            )}
            
            <div className="flex flex-wrap gap-2 mb-4">
              {/* Gamification Rank */}
              <RankBadge 
                tasksCompleted={profile.total_tasks_completed ?? 0}
                latestBadge={profile.latest_badge}
              />
              
              {/* Level Badge */}
              {profile.level && profile.level > 1 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 px-3 py-1 text-sm font-bold text-purple-700">
                  🏆 Niveau {profile.level}
                </span>
              )}
              
              {profile.city && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                  📍 {profile.city}
                </span>
              )}
              {profile.experience_years && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                  🏆 {profile.experience_years} d&apos;expérience
                </span>
              )}
              {profile.hourly_rate && (
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-sm text-sky-700">
                  💰 {profile.hourly_rate}€/h
                </span>
              )}
              
              {/* Direct Request Button */}
              <button
                onClick={() => router.push(`/direct-request/${profile.id}`)}
                className="mt-2 w-full md:w-auto rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Demander un devis à ce pro
              </button>
            </div>
            
            {/* All Earned Badges */}
            {profile.earned_badges && profile.earned_badges.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-slate-700 mb-2">🏅 Succès débloqués</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.earned_badges.slice(0, 8).map((badge, i) => (
                    <div
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1"
                      title={badge.name}
                    >
                      <span className="text-sm">{badge.icon}</span>
                      <span className="text-xs font-medium text-blue-700">{badge.name}</span>
                    </div>
                  ))}
                  {profile.earned_badges.length > 8 && (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      +{profile.earned_badges.length - 8} autres
                    </span>
                  )}
                </div>
              </div>
            )}

            {profile.bio && (
              <p className="text-slate-700 mb-4 whitespace-pre-line">{profile.bio}</p>
            )}

            {/* Service Categories */}
            {profile.service_categories && profile.service_categories.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-slate-900 mb-2">🏷️ Catégories de services</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.service_categories.map((catKey, i) => (
                    <span key={i} className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
                      {getCategoryByKey(catKey)?.label ?? catKey}
                    </span>
                  ))}
                </div>
                {profile.service_subcategories && profile.service_subcategories.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {profile.service_subcategories.slice(0, 10).map((sub, i) => (
                      <span key={i} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                        {sub}
                      </span>
                    ))}
                    {profile.service_subcategories.length > 10 && (
                      <span className="text-xs text-slate-500">+{profile.service_subcategories.length - 10} autres</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Skills */}
            {profile.skills.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-slate-900 mb-2">Compétences</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, i) => (
                    <span key={i} className="rounded-full bg-sky-50 px-3 py-1 text-sm text-sky-700">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Service Areas */}
            {profile.service_areas.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-slate-900 mb-2">Zones d&apos;intervention</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.service_areas.map((area, i) => (
                    <span key={i} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {profile.certifications.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-900 mb-2">Certifications</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.certifications.map((cert, i) => (
                    <span key={i} className="rounded-full bg-amber-50 px-3 py-1 text-sm text-amber-700">
                      🏅 {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-100">
          <p className="text-2xl font-bold text-amber-500">
            {stats.average_rating ? stats.average_rating.toFixed(1) : "—"}
          </p>
          <p className="text-xs text-slate-600">Note moyenne</p>
          <div className="text-yellow-500 text-sm mt-1">
            {"★".repeat(Math.round(stats.average_rating || 0))}
            {"☆".repeat(5 - Math.round(stats.average_rating || 0))}
          </div>
        </div>
        <div className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-100">
          <p className="text-2xl font-bold text-slate-900">{stats.reviews_count}</p>
          <p className="text-xs text-slate-600">Avis clients</p>
        </div>
        <div className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-100">
          <p className="text-2xl font-bold text-emerald-600">{stats.completed_tasks}</p>
          <p className="text-xs text-slate-600">Missions terminées</p>
        </div>
        <div className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-100">
          <p className="text-2xl font-bold text-sky-600">{stats.portfolio_count}</p>
          <p className="text-xs text-slate-600">Réalisations</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("portfolio")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeTab === "portfolio"
              ? "bg-sky-500 text-white"
              : "bg-white text-slate-700 hover:bg-slate-50 ring-1 ring-slate-200"
          }`}
        >
          Réalisations ({profile.portfolio.length})
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeTab === "reviews"
              ? "bg-sky-500 text-white"
              : "bg-white text-slate-700 hover:bg-slate-50 ring-1 ring-slate-200"
          }`}
        >
          Avis ({profile.reviews.length})
        </button>
        <button
          onClick={() => setActiveTab("prices")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeTab === "prices"
              ? "bg-sky-500 text-white"
              : "bg-white text-slate-700 hover:bg-slate-50 ring-1 ring-slate-200"
          }`}
        >
          Tarifs
        </button>
      </div>

      {/* Portfolio Tab */}
      {activeTab === "portfolio" && (
        <div>
          {profile.portfolio.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100">
              <p className="text-slate-600">Aucune réalisation pour le moment.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.portfolio.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-white overflow-hidden shadow-sm ring-1 ring-slate-100 hover:shadow-lg transition"
                >
                  {item.images.length > 0 && (
                    <div
                      className="relative h-48 cursor-pointer"
                      onClick={() => setSelectedImage(item.images[0])}
                    >
                      <Image
                        src={item.images[0]}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                      {item.images.length > 1 && (
                        <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                          +{item.images.length - 1} photos
                        </span>
                      )}
                      {item.is_featured && (
                        <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded">
                          ⭐ En vedette
                        </span>
                      )}
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                    {item.category && (
                      <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 mb-2">
                        {item.category}
                      </span>
                    )}
                    {item.description && (
                      <p className="text-sm text-slate-600 line-clamp-2 mb-2">{item.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      {item.location && <span>📍 {item.location}</span>}
                      {item.completed_at && (
                        <span>
                          📅 {new Date(item.completed_at).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
                        </span>
                      )}
                      {item.budget && <span>💰 {item.budget}€</span>}
                      {item.duration_days && <span>⏱ {item.duration_days}j</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === "reviews" && (
        <div className="space-y-4">
          {profile.reviews.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100">
              <p className="text-slate-600">Aucun avis pour le moment.</p>
            </div>
          ) : (
            profile.reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
              >
                <div className="flex items-start gap-3">
                  <UserAvatar avatar={review.client?.avatar} name={review.client?.name} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">
                          {review.client?.name || "Client"}
                        </span>
                        <span className="text-yellow-500">
                          {"★".repeat(review.rating)}
                          {"☆".repeat(5 - review.rating)}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(review.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-slate-700 mb-2">{review.comment}</p>
                    )}
                    {review.task?.title && (
                      <p className="text-xs text-slate-500">Mission : {review.task.title}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Prices Tab */}
      {activeTab === "prices" && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <PriceListDisplay prestataireId={profile.id} />
        </div>
      )}

      {/* Contact Section */}
      <div className="mt-8 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 p-6 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Besoin de ce prestataire ?</h2>
        <p className="text-sky-100 mb-4">
          Publiez une annonce et recevez des offres de prestataires qualifiés.
        </p>
        <button
          onClick={() => router.push("/tasks/new")}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-sky-600 hover:bg-sky-50 transition"
        >
          Demander un service gratuitement
        </button>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <Image
              src={selectedImage}
              alt="Portfolio"
              width={1200}
              height={800}
              className="object-contain max-h-[90vh] rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 rounded-full p-2 text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
