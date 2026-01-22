"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UserAvatar from "@/components/UserAvatar";
import ReviewsList from "@/components/ReviewsList";
import { API_BASE_URL } from "@/lib/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: "client" | "prestataire" | string;
  city?: string | null;
  avatar?: string | null;
  referral_code?: string;
  created_at?: string;
  is_verified?: boolean;
  verification_status?: string;
  is_admin?: boolean;
  level?: number;
  xp?: number;
}

interface Stats {
  tasks_count?: number;
  offers_count?: number;
  completed_tasks?: number;
  average_rating?: number;
  reviews_count?: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("prochepro_user");
    if (!stored) {
      router.replace("/auth/login");
      return;
    }

    try {
      const parsed: User = JSON.parse(stored);
      setUser(parsed);
      fetchUserData(parsed.id);
    } catch {
      window.localStorage.removeItem("prochepro_user");
      router.replace("/auth/login");
    }
  }, [router]);

  async function fetchUserData(userId: number) {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        // Update local storage
        window.localStorage.setItem("prochepro_user", JSON.stringify(data));
      }

      // Fetch stats based on role
      const storedUser = JSON.parse(window.localStorage.getItem("prochepro_user") || "{}");
      if (storedUser.role === "client") {
        const tasksRes = await fetch(`${API_BASE_URL}/api/tasks?client_id=${userId}`);
        if (tasksRes.ok) {
          const tasks = await tasksRes.json();
          const taskList = tasks?.data ?? tasks ?? [];
          setStats({
            tasks_count: taskList.length,
            completed_tasks: taskList.filter((t: any) => t.status === "completed").length,
          });
        }
      } else if (storedUser.role === "prestataire") {
        const offersRes = await fetch(`${API_BASE_URL}/api/offers?prestataire_id=${userId}`);
        const reviewsRes = await fetch(`${API_BASE_URL}/api/prestataires/${userId}/reviews`);
        
        let offersCount = 0;
        let completedCount = 0;
        if (offersRes.ok) {
          const offers = await offersRes.json();
          offersCount = offers?.length ?? 0;
          completedCount = offers?.filter((o: any) => o.status === "accepted").length ?? 0;
        }

        let avgRating = 0;
        let reviewsCount = 0;
        if (reviewsRes.ok) {
          const reviews = await reviewsRes.json();
          reviewsCount = reviews?.length ?? 0;
          if (reviewsCount > 0) {
            avgRating = reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviewsCount;
          }
        }

        setStats({
          offers_count: offersCount,
          completed_tasks: completedCount,
          average_rating: avgRating,
          reviews_count: reviewsCount,
        });
      }
    } catch (err) {
      // Error fetching user data
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  const isClient = user.role === "client";
  const isPrestataire = user.role === "prestataire";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 text-sm text-slate-600 hover:text-slate-900"
      >
        ↩ Retour
      </button>

      {/* Profile Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <UserAvatar avatar={user.avatar} name={user.name} size="lg" />
          
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
            <p className="text-slate-600">{user.email}</p>
            <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                isClient 
                  ? "bg-blue-50 text-blue-700" 
                  : "bg-emerald-50 text-emerald-700"
              }`}>
                {isClient ? "Client" : "Prestataire"}
              </span>
              {/* Level Badge */}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 px-3 py-1 text-xs font-bold text-purple-700">
                🏆 Niveau {user.level || 1}
              </span>
              {user.city && (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  📍 {user.city}
                </span>
              )}
              {isPrestataire && user.is_verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  ✓ Vérifié
                </span>
              )}
              {isPrestataire && user.verification_status === "pending" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  ⏳ Vérification en cours
                </span>
              )}
            </div>
            {user.created_at && (
              <p className="mt-2 text-xs text-slate-500">
                Membre depuis {new Date(user.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
              </p>
            )}
          </div>

          <button
            onClick={() => router.push("/profile/edit")}
            className="rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
          >
            Modifier le profil
          </button>
        </div>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {isClient && (
            <>
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">{stats.tasks_count ?? 0}</p>
                <p className="text-xs text-slate-600">Annonces publiées</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                <p className="text-2xl font-bold text-emerald-600">{stats.completed_tasks ?? 0}</p>
                <p className="text-xs text-slate-600">Terminées</p>
              </div>
            </>
          )}
          {isPrestataire && (
            <>
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">{stats.offers_count ?? 0}</p>
                <p className="text-xs text-slate-600">Offres envoyées</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                <p className="text-2xl font-bold text-emerald-600">{stats.completed_tasks ?? 0}</p>
                <p className="text-xs text-slate-600">Missions acceptées</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                <p className="text-2xl font-bold text-amber-500">
                  {stats.average_rating ? stats.average_rating.toFixed(1) : "—"}
                </p>
                <p className="text-xs text-slate-600">Note moyenne</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">{stats.reviews_count ?? 0}</p>
                <p className="text-xs text-slate-600">Avis reçus</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Profile Settings */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Paramètres du profil</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {/* Video Testimonial - for all users */}
          <button
            onClick={() => router.push("/profile/add-testimonial")}
            className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left hover:border-amber-500 hover:bg-amber-50 transition-colors"
          >
            <span className="text-2xl">📹</span>
            <div>
              <p className="font-medium text-slate-900">Témoignage vidéo</p>
              <p className="text-xs text-slate-600">Partagez votre expérience</p>
            </div>
          </button>
          
          {isPrestataire && (
            <>
              {!user.is_verified && user.verification_status !== "pending" && (
                <button
                  onClick={() => router.push("/profile/verification")}
                  className="flex items-center gap-3 rounded-xl border-2 border-emerald-300 bg-emerald-50 p-4 text-left hover:border-emerald-500 hover:bg-emerald-100 transition-colors"
                >
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <p className="font-medium text-emerald-800">Vérification d'identité</p>
                    <p className="text-xs text-emerald-600">Obligatoire pour envoyer des offres</p>
                  </div>
                </button>
              )}
              <button
                onClick={() => router.push("/profile/portfolio")}
                className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left hover:border-amber-500 hover:bg-amber-50 transition-colors"
              >
                <span className="text-2xl">🎨</span>
                <div>
                  <p className="font-medium text-slate-900">Mon portfolio</p>
                  <p className="text-xs text-slate-600">Gérer mes réalisations</p>
                </div>
              </button>
              <button
                onClick={() => router.push("/profile/bank")}
                className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
              >
                <span className="text-2xl">💳</span>
                <div>
                  <p className="font-medium text-slate-900">Coordonnées bancaires</p>
                  <p className="text-xs text-slate-600">Pour les paiements</p>
                </div>
              </button>
              <button
                onClick={() => router.push("/profile/tax-reports")}
                className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left hover:border-sky-500 hover:bg-sky-50 transition-colors"
              >
                <span className="text-2xl">📊</span>
                <div>
                  <p className="font-medium text-slate-900">Attestations fiscales</p>
                  <p className="text-xs text-slate-600">Récapitulatifs URSSAF</p>
                </div>
              </button>
              <button
                onClick={() => router.push(`/prestataires/${user.id}`)}
                className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left hover:border-sky-500 hover:bg-sky-50 transition-colors"
              >
                <span className="text-2xl">👁️</span>
                <div>
                  <p className="font-medium text-slate-900">Profil public</p>
                  <p className="text-xs text-slate-600">Vue client</p>
                </div>
              </button>
              <button
                onClick={() => router.push("/settings/notifications")}
                className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left hover:border-violet-500 hover:bg-violet-50 transition-colors"
              >
                <span className="text-2xl">🔔</span>
                <div>
                  <p className="font-medium text-slate-900">Notifications</p>
                  <p className="text-xs text-slate-600">Alertes missions</p>
                </div>
              </button>
            </>
          )}
          
          <button
            onClick={() => router.push("/profile/achievements")}
            className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left hover:border-purple-500 hover:bg-purple-50 transition-colors"
          >
            <span className="text-2xl">🏆</span>
            <div>
              <p className="font-medium text-slate-900">Mes Succès & Badges</p>
              <p className="text-xs text-slate-600">Niveau {user.level || 1} • {user.xp || 0} XP</p>
            </div>
          </button>
          <button
            onClick={() => router.push("/profile/referral")}
            className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left hover:border-violet-500 hover:bg-violet-50 transition-colors"
          >
            <span className="text-2xl">🎁</span>
            <div>
              <p className="font-medium text-slate-900">Parrainage</p>
              <p className="text-xs text-slate-600">Inviter et gagner</p>
            </div>
          </button>
          <button
            onClick={() => router.push("/pricing")}
            className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
          >
            <span className="text-2xl">💰</span>
            <div>
              <p className="font-medium text-slate-900">Forfaits & Crédits</p>
              <p className="text-xs text-slate-600">Voir les offres</p>
            </div>
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Avis reçus</h2>
        <ReviewsList userId={user.id} userRole={user.role as "client" | "prestataire"} />
      </div>
    </div>
  );
}
