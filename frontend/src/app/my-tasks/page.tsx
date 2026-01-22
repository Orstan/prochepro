"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

interface Task {
  id: number;
  title: string;
  description?: string | null;
  status: string;
  city?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  category?: string | null;
  created_at: string;
  offers_count?: number;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: "Brouillon", color: "bg-slate-100 text-slate-700" },
  published: { label: "Publiée", color: "bg-emerald-50 text-emerald-700" },
  assigned: { label: "Assignée", color: "bg-sky-50 text-sky-700" },
  in_progress: { label: "En cours", color: "bg-amber-50 text-amber-700" },
  completed: { label: "Terminée", color: "bg-green-50 text-green-700" },
  cancelled: { label: "Annulée", color: "bg-rose-50 text-rose-700" },
};

export default function MyTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
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
      if (user.role !== "client") {
        router.replace("/dashboard");
        return;
      }
      fetchTasks(user.id);
    } catch {
      router.replace("/auth/login");
    }
  }, [router]);

  async function fetchTasks(clientId: number) {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks?client_id=${clientId}`);
      if (!res.ok) throw new Error("Impossible de charger vos annonces.");
      const data = await res.json();
      setTasks(data.data ?? data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  const filteredTasks = statusFilter
    ? tasks.filter((t) => t.status === statusFilter)
    : tasks;

  const statusCounts = tasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Mes annonces</h1>
          <p className="text-sm text-slate-600 mt-1">
            Gérez toutes vos annonces publiées et suivez leur avancement.
          </p>
        </div>
        <a
          href="/tasks/new"
          className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 text-center sm:text-left shrink-0"
        >
          + Nouvelle annonce
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
          Toutes ({tasks.length})
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

      {/* Tasks list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-slate-600 mb-4">
            {statusFilter ? "Aucune annonce avec ce statut." : "Vous n'avez pas encore d'annonces."}
          </p>
          <a
            href="/tasks/new"
            className="inline-flex rounded-full bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-600"
          >
            Publier ma première annonce
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const status = STATUS_LABELS[task.status] || { label: task.status, color: "bg-slate-100 text-slate-700" };
            return (
              <button
                key={task.id}
                onClick={() => router.push(`/tasks/${task.id}`)}
                className="w-full text-left rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-sky-400 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{task.title}</h3>
                    {task.city && (
                      <p className="text-xs text-slate-500 mt-1">📍 {task.city}</p>
                    )}
                    {(task.budget_min || task.budget_max) && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        💰 {task.budget_min ?? 0}€ - {task.budget_max ?? "∞"}€
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.color}`}>
                      {status.label}
                    </span>
                    {task.offers_count !== undefined && task.offers_count > 0 && (
                      <span className="text-xs text-slate-500">
                        {task.offers_count} offre{task.offers_count > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Créée le {new Date(task.created_at).toLocaleDateString("fr-FR")}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
