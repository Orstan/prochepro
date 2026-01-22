"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import UserAvatar from "@/components/UserAvatar";
import { API_BASE_URL } from "@/lib/api";

interface ProcheProUser {
  id: number;
  name?: string | null;
  email: string;
  role?: string;
  avatar?: string | null;
}

interface Review {
  id: number;
  rating: number;
  comment?: string | null;
  created_at: string;
  task?: {
    id: number;
    title?: string | null;
  };
  prestataire?: {
    id: number;
    name?: string | null;
    email: string;
    avatar?: string | null;
  };
}

export default function ClientProfilePage() {
  const router = useRouter();
  const params = useParams();
  const idParam =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : "";

  const clientId = Number(idParam);

  const [currentUser, setCurrentUser] = useState<ProcheProUser | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [profileUser, setProfileUser] = useState<{ 
    name?: string; 
    avatar?: string | null;
    completed_referrals_count?: number;
    has_active_client_badge?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idParam) return;

    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("prochepro_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as ProcheProUser;
          setCurrentUser(parsed);
        } catch {
          // ignore parse error
        }
      }
    }

    void fetchReviews(idParam);
    void fetchProfileUser(idParam);
  }, [idParam]);

  async function fetchProfileUser(userId: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setProfileUser(data);
      }
    } catch {
      // ignore
    }
  }

  async function fetchReviews(client: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/clients/${client}/reviews`);
      if (!res.ok) {
        throw new Error("Impossible de charger les avis.");
      }
      const data: Review[] = await res.json();
      setReviews(data ?? []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur inconnue est survenue.");
      }
    } finally {
      setLoading(false);
    }
  }

  const hasReviews = reviews.length > 0;
  const averageRating = hasReviews
    ? reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length
    : null;

  const isOwnProfile =
    currentUser &&
    typeof clientId === "number" &&
    !Number.isNaN(clientId) &&
    currentUser.id === clientId;

  const displayName = isOwnProfile
    ? currentUser?.name || "Client"
    : profileUser?.name || `Client #${idParam}`;

  const displayEmail = isOwnProfile ? currentUser?.email : undefined;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8 text-slate-800">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-slate-700 hover:text-slate-900 mb-4"
        >
          ↩ Retour
        </button>

        <div className="rounded-2xl bg-white px-6 py-5 shadow-sm ring-1 ring-slate-100 mb-4">
          <div className="flex items-center gap-4">
            <UserAvatar
              avatar={isOwnProfile ? currentUser?.avatar : profileUser?.avatar}
              name={displayName}
              size="lg"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-semibold text-slate-900">
                  {displayName}
                </h1>
                {profileUser?.has_active_client_badge && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200">
                    <span>⭐</span> Client actif
                  </span>
                )}
              </div>
              {displayEmail && (
                <p className="text-sm text-slate-700 mb-1">{displayEmail}</p>
              )}
              <p className="text-xs text-slate-500">
                Profil public du client sur ProchePro.
              </p>
              {profileUser?.completed_referrals_count !== undefined && profileUser.completed_referrals_count > 0 && (
                <p className="text-xs text-violet-600 mt-1">
                  🎁 {profileUser.completed_referrals_count} parrainage{profileUser.completed_referrals_count > 1 ? 's' : ''} réussi{profileUser.completed_referrals_count > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white px-6 py-5 shadow-sm ring-1 ring-slate-100 mb-4 text-sm text-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            Note moyenne
          </h2>
          {averageRating == null ? (
            <p className="text-sm text-slate-600">
              Ce client n&apos;a pas encore reçu d&apos;avis.
            </p>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-yellow-500 text-lg">
                {"★".repeat(Math.round(averageRating))}
                {"☆".repeat(5 - Math.round(averageRating))}
              </span>
              <span className="text-slate-700">
                {averageRating.toFixed(1)}/5
              </span>
              <span className="text-xs text-slate-500">
                ({reviews.length} avis)
              </span>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white px-6 py-5 shadow-sm ring-1 ring-slate-100 text-sm text-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            Avis des prestataires
          </h2>

          {loading ? (
            <p className="text-sm text-slate-600">Chargement des avis...</p>
          ) : error ? (
            <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : !hasReviews ? (
            <p className="text-sm text-slate-600">
              Aucun avis pour le moment.
            </p>
          ) : (
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-lg border border-slate-200 px-4 py-3 text-sm bg-slate-50"
                >
                  <div className="flex items-start gap-3">
                    <UserAvatar
                      avatar={review.prestataire?.avatar}
                      name={review.prestataire?.name}
                      size="sm"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-700">
                            {review.prestataire?.name || "Prestataire"}
                          </span>
                          <span className="text-yellow-500 text-sm">
                            {"★".repeat(review.rating)}
                            {"☆".repeat(5 - review.rating)}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {new Date(review.created_at).toLocaleDateString("fr-FR")}
                        </span>
                      </div>

                      {review.comment && (
                        <p className="text-sm text-slate-700 mb-2">
                          {review.comment}
                        </p>
                      )}

                      {review.task?.title && (
                        <p className="text-[11px] text-slate-500">
                          Annonce : {review.task.title}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
