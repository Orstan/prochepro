"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

interface Offer {
  id: number;
  task_id: number;
  price: number;
  message?: string | null;
  status: string;
  created_at: string;
  task?: {
    id: number;
    title: string;
    city?: string | null;
    status: string;
  };
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "bg-amber-50 text-amber-700" },
  accepted: { label: "Acceptée", color: "bg-emerald-50 text-emerald-700" },
  rejected: { label: "Refusée", color: "bg-rose-50 text-rose-700" },
  withdrawn: { label: "Retirée", color: "bg-slate-100 text-slate-600" },
};

export default function MyOffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    const stored = window.localStorage.getItem("prochepro_user");
    if (!stored) {
      router.replace("/auth/login");
      return;
    }

    try {
      const user = JSON.parse(stored);
      if (user.role !== "prestataire") {
        router.replace("/dashboard");
        return;
      }
      fetchOffers(user.id);
    } catch {
      router.replace("/auth/login");
    }
  }, [router]);

  async function fetchOffers(prestataireId: number) {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/offers?prestataire_id=${prestataireId}`);
      if (!res.ok) throw new Error("Impossible de charger vos offres.");
      const data = await res.json();
      setOffers(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  const filteredOffers = statusFilter
    ? offers.filter((o) => o.status === statusFilter)
    : offers;

  const statusCounts = offers.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Mes offres</h1>
          <p className="text-sm text-slate-600 mt-1">
            Suivez toutes vos propositions et leur statut.
          </p>
        </div>
        <a
          href="/tasks/browse"
          className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 text-center shrink-0"
        >
          Trouver des annonces
        </a>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setStatusFilter("")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
            !statusFilter
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Toutes ({offers.length})
        </button>
        {Object.entries(STATUS_LABELS).map(([key, { label }]) => {
          const count = statusCounts[key] || 0;
          if (count === 0) return null;
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                statusFilter === key
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Offers list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : filteredOffers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-slate-600 mb-4">
            {statusFilter ? "Aucune offre avec ce statut." : "Vous n'avez pas encore fait d'offres."}
          </p>
          <a
            href="/tasks/browse"
            className="inline-flex rounded-full bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-600"
          >
            Parcourir les annonces
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOffers.map((offer) => {
            const status = STATUS_LABELS[offer.status] || { label: offer.status, color: "bg-slate-100 text-slate-700" };
            return (
              <button
                key={offer.id}
                onClick={() => router.push(`/tasks/${offer.task_id}`)}
                className="w-full text-left rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-sky-400 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">
                      {offer.task?.title || `Annonce #${offer.task_id}`}
                    </h3>
                    {offer.task?.city && (
                      <p className="text-xs text-slate-500 mt-1">📍 {offer.task.city}</p>
                    )}
                    <p className="text-xs text-slate-600 mt-1">
                      💰 Votre offre : <span className="font-semibold">{offer.price}€</span>
                    </p>
                    {offer.message && (
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        💬 {offer.message}
                      </p>
                    )}
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Proposée le {new Date(offer.created_at).toLocaleDateString("fr-FR")}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
