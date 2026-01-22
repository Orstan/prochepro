"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import CityAutocomplete from "@/components/CityAutocomplete";

type User = {
  id?: number;
  name?: string;
  email?: string;
  role?: "client" | "prestataire" | string;
};

type OfferWithTask = {
  id: number;
  status: string;
  price?: number | null;
  created_at: string;
  task?: {
    id: number;
    title: string;
    status?: string;
    city?: string | null;
    category?: string | null;
    budget_min?: number | null;
    budget_max?: number | null;
    created_at: string;
  } | null;
};

const OFFER_STATUSES: { key: string; label: string }[] = [
  { key: "pending", label: "En attente" },
  { key: "accepted", label: "Acceptée" },
  { key: "rejected", label: "Refusée" },
];

const TASK_STATUSES: { key: string; label: string }[] = [
  { key: "published", label: "Publiée" },
  { key: "in_progress", label: "En cours" },
  { key: "completed", label: "Terminée" },
];


const OFFER_CATEGORIES: { key: string; label: string }[] = [
  { key: "home_repair", label: "Réparations à domicile" },
  { key: "cleaning", label: "Ménage et nettoyage" },
  { key: "moving", label: "Déménagement et manutention" },
  { key: "it_web", label: "Informatique & Web" },
  { key: "delivery", label: "Livraison et courses" },
  { key: "renovation", label: "Rénovation et bricolage" },
  { key: "events", label: "Événementiel" },
  { key: "pets", label: "Animaux" },
];

export default function PrestataireOffersPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [offers, setOffers] = useState<OfferWithTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [offerStatusFilter, setOfferStatusFilter] = useState<string>("");
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>("");
  const [cityFilter, setCityFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("prochepro_user");
    if (!stored) {
      router.replace("/auth/login");
      return;
    }

    try {
      const parsed: User = JSON.parse(stored);
      setUser(parsed ?? null);

      if (!parsed || parsed.role !== "prestataire" || !parsed.id) {
        router.replace("/dashboard");
        return;
      }

      void fetchOffers(parsed.id);
    } catch {
      window.localStorage.removeItem("prochepro_user");
      router.replace("/auth/login");
    }
  }, [router]);

  async function fetchOffers(prestataireId: number) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/offers?prestataire_id=${prestataireId}`,
      );

      if (!res.ok) {
        throw new Error("Impossible de charger vos offres.");
      }

      const data = await res.json();
      const flat: OfferWithTask[] = (data ?? []) as OfferWithTask[];
      setOffers(flat ?? []);
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

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      if (offerStatusFilter && offer.status !== offerStatusFilter) return false;

      const task = offer.task;
      if (!task) return false;

      if (taskStatusFilter && task.status !== taskStatusFilter) return false;
      if (cityFilter && task.city?.trim() !== cityFilter) return false;
      if (categoryFilter && task.category?.trim() !== categoryFilter)
        return false;

      return true;
    });
  }, [offers, offerStatusFilter, taskStatusFilter, cityFilter, categoryFilter]);

  if (!user || user.role !== "prestataire") {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 text-slate-800">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 text-sm text-slate-700 hover:text-slate-900"
      >
        ↩ Retour
      </button>

      <h1 className="mb-1 text-2xl font-semibold text-slate-900">
        Mes offres et missions
      </h1>
      <p className="mb-4 text-sm text-slate-600">
        Suivez les offres que vous avez envoyées et les missions en cours ou terminées.
      </p>

      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Statut de l&apos;offre
          </label>
          <select
            value={offerStatusFilter}
            onChange={(e) => setOfferStatusFilter(e.target.value)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="">Tous les statuts</option>
            {OFFER_STATUSES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Statut de l'annonce
          </label>
          <select
            value={taskStatusFilter}
            onChange={(e) => setTaskStatusFilter(e.target.value)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="">Tous les statuts</option>
            {TASK_STATUSES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Ville
          </label>
          <CityAutocomplete
            value={cityFilter}
            onChange={setCityFilter}
            placeholder="Filtrer par ville..."
            className="rounded-full px-3 py-1.5"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Catégorie
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="">Toutes les catégories</option>
            {OFFER_CATEGORIES.map((cat) => (
              <option key={cat.key} value={cat.key}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(offerStatusFilter || taskStatusFilter || cityFilter || categoryFilter) && (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500">Filtres actifs :</span>
          {offerStatusFilter && (
            <button
              type="button"
              onClick={() => setOfferStatusFilter("")}
              className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-slate-200"
            >
              Offre : {
                OFFER_STATUSES.find((s) => s.key === offerStatusFilter)?.label ??
                offerStatusFilter
              }
              <span className="ml-1 text-slate-400">×</span>
            </button>
          )}
          {taskStatusFilter && (
            <button
              type="button"
              onClick={() => setTaskStatusFilter("")}
              className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-slate-200"
            >
              Annonce : {
                TASK_STATUSES.find((s) => s.key === taskStatusFilter)?.label ??
                taskStatusFilter
              }
              <span className="ml-1 text-slate-400">×</span>
            </button>
          )}
          {cityFilter && (
            <button
              type="button"
              onClick={() => setCityFilter("")}
              className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-slate-200"
            >
              Ville : {cityFilter}
              <span className="ml-1 text-slate-400">×</span>
            </button>
          )}
          {categoryFilter && (
            <button
              type="button"
              onClick={() => setCategoryFilter("")}
              className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-slate-200"
            >
              Catégorie : {
                OFFER_CATEGORIES.find((c) => c.key === categoryFilter)?.label ??
                categoryFilter
              }
              <span className="ml-1 text-slate-400">×</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setOfferStatusFilter("");
              setTaskStatusFilter("");
              setCityFilter("");
              setCategoryFilter("");
            }}
            className="inline-flex items-center rounded-full border border-slate-200 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 hover:border-slate-300 hover:text-slate-800"
          >
            Réinitialiser tout
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-700">
          Chargement de vos offres...
        </p>
      ) : error ? (
        <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : filteredOffers.length === 0 ? (
        <p className="text-sm text-slate-700">
          Aucune offre ne correspond à vos filtres pour le moment.
        </p>
      ) : (
        <div className="mt-3 grid gap-3">
          {filteredOffers.map((offer) => {
            const task = offer.task;
            if (!task) return null;

            return (
              <button
                key={offer.id}
                type="button"
                onClick={() => router.push(`/tasks/${task.id}`)}
                className="flex w-full flex-col items-start rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-800 shadow-sm hover:border-sky-500 hover:shadow-md"
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-sm font-semibold text-slate-900">
                      {task.title}
                    </h2>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Offre #{offer.id} · Envoyée le{" "}
                      {new Date(offer.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-right">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ${
                        offer.status === "pending"
                          ? "bg-slate-50 text-slate-700 ring-slate-100"
                          : offer.status === "accepted"
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                          : offer.status === "rejected"
                          ? "bg-rose-50 text-rose-700 ring-rose-100"
                          : "bg-slate-50 text-slate-700 ring-slate-100"
                      }`}
                    >
                      {offer.status === "pending"
                        ? "En attente"
                        : offer.status === "accepted"
                        ? "Acceptée"
                        : offer.status === "rejected"
                        ? "Refusée"
                        : offer.status}
                    </span>
                    {task.status && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ${
                          task.status === "published"
                            ? "bg-sky-50 text-sky-700 ring-sky-100"
                            : task.status === "in_progress"
                            ? "bg-amber-50 text-amber-700 ring-amber-100"
                            : task.status === "completed"
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                            : "bg-slate-50 text-slate-700 ring-slate-100"
                        }`}
                      >
                        {task.status === "published"
                          ? "Annonce publiée"
                          : task.status === "in_progress"
                          ? "Annonce en cours"
                          : task.status === "completed"
                          ? "Annonce terminée"
                          : task.status}
                      </span>
                    )}
                  </div>
                </div>

                {task.city && (
                  <p className="mt-1 text-xs text-slate-600">
                    Ville : {task.city}
                  </p>
                )}
                {task.category && (
                  <p className="mt-0.5 text-xs text-slate-600">
                    Catégorie : {
                      OFFER_CATEGORIES.find((c) => c.key === task.category)?.label ??
                      task.category
                    }
                  </p>
                )}
                {(task.budget_min != null || task.budget_max != null) && (
                  <p className="mt-0.5 text-xs text-slate-600">
                    Budget :
                    {task.budget_min != null && ` ${task.budget_min}€`}
                    {task.budget_max != null && ` - ${task.budget_max}€`}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
