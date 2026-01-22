"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import { fetchCategories, ServiceCategory } from "@/lib/categoriesApi";
import CityAutocomplete from "@/components/CityAutocomplete";

type User = {
  id?: number;
  name?: string;
  email?: string;
  role?: "client" | "prestataire" | string;
};

type ClientTask = {
  id: number;
  title: string;
  status: string;
  city?: string | null;
  category?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  created_at: string;
};

export default function ClientTasksPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<ClientTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [cityFilter, setCityFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  useEffect(() => {
    fetchCategories().then((data) => setCategories(data));
  }, []);

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

      if (!parsed || parsed.role !== "client" || !parsed.id) {
        router.replace("/dashboard");
        return;
      }

      void fetchClientTasks(parsed.id);
    } catch {
      window.localStorage.removeItem("prochepro_user");
      router.replace("/auth/login");
    }
  }, [router]);

  async function fetchClientTasks(clientId: number) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/tasks?client_id=${clientId}`,
      );

      if (!res.ok) {
        throw new Error("Impossible de charger vos annonces.");
      }

      const data = await res.json();
      const flat: ClientTask[] = (data?.data ?? data ?? []) as ClientTask[];
      setTasks(flat ?? []);
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

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (statusFilter && task.status !== statusFilter) return false;
      if (cityFilter && task.city?.trim() !== cityFilter) return false;
      if (categoryFilter && task.category?.trim() !== categoryFilter)
        return false;
      return true;
    });
  }, [tasks, statusFilter, cityFilter, categoryFilter]);

  if (!user || user.role !== "client") {
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
        Mes annonces
      </h1>
      <p className="mb-4 text-sm text-slate-600">
        Consultez et filtrez vos annonces publiées, en cours et terminées.
      </p>

      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Statut
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="">Tous les statuts</option>
            <option value="published">Publié</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminé</option>
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
            {categories.map((cat) => (
              <option key={cat.key} value={cat.key}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(statusFilter || cityFilter || categoryFilter) && (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500">Filtres actifs :</span>
          {statusFilter && (
            <button
              type="button"
              onClick={() => setStatusFilter("")}
              className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-slate-200"
            >
              Statut :
              {statusFilter === "published"
                ? " Publié"
                : statusFilter === "in_progress"
                ? " En cours"
                : " Terminé"}
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
              Catégorie :
              {categories.find((c) => c.key === categoryFilter)?.name ??
                categoryFilter}
              <span className="ml-1 text-slate-400">×</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setStatusFilter("");
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
          Chargement de vos annonces...
        </p>
      ) : error ? (
        <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : filteredTasks.length === 0 ? (
        <p className="text-sm text-slate-700">
          Aucune annonce ne correspond à vos filtres pour le moment.
        </p>
      ) : (
        <div className="mt-3 grid gap-3">
          {filteredTasks.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => router.push(`/tasks/${task.id}`)}
              className="flex w-full flex-col items-start rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-800 shadow-sm hover:border-sky-500 hover:shadow-md"
            >
              <div className="flex w-full items-center justify-between gap-2">
                <h2 className="truncate text-sm font-semibold text-slate-900">
                  {task.title}
                </h2>
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
                    ? "Publié"
                    : task.status === "in_progress"
                    ? "En cours"
                    : task.status === "completed"
                    ? "Terminé"
                    : task.status}
                </span>
              </div>
              {task.city && (
                <p className="mt-1 text-xs text-slate-600">
                  Ville : {task.city}
                </p>
              )}
              {task.category && (
                <p className="mt-0.5 text-xs text-slate-600">
                  Catégorie :
                  {categories.find((c) => c.key === task.category)?.name ??
                    task.category}
                </p>
              )}
              {(task.budget_min != null || task.budget_max != null) && (
                <p className="mt-0.5 text-xs text-slate-600">
                  Budget :
                  {task.budget_min != null && ` ${task.budget_min}€`}
                  {task.budget_max != null && ` - ${task.budget_max}€`}
                </p>
              )}
              <p className="mt-1 text-[11px] text-slate-500">
                Publiée le{" "}
                {new Date(task.created_at).toLocaleDateString("fr-FR")}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}