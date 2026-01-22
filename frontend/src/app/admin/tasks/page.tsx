"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

interface Task {
  id: number;
  title: string;
  status: string;
  city?: string;
  category?: string;
  budget_min?: number;
  budget_max?: number;
  created_at: string;
  client_id?: number;
  client?: {
    id: number;
    name: string;
    email: string;
  };
  offers?: { id: number }[];
}

export default function AdminTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchTasks();
  }, []);

  function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("prochepro_token");
    return token ? { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } : {};
  }

  async function fetchTasks() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/tasks?per_page=1000`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data?.data ?? data ?? []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteTask(taskId: number) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action supprimera également toutes les offres, messages et avis associés.")) return;
    
    setDeleting(taskId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/tasks/${taskId}`, {
        method: "DELETE",
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setTasks(tasks.filter(t => t.id !== taskId));
        setSelectedTasks(selectedTasks.filter(id => id !== taskId));
      } else {
        const data = await res.json();
        alert(data.message || "Erreur lors de la suppression");
      }
    } catch {
      alert("Erreur réseau");
    } finally {
      setDeleting(null);
    }
  }

  async function bulkDeleteTasks() {
    if (selectedTasks.length === 0) return;
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedTasks.length} annonce(s) ? Cette action supprimera également toutes les offres, messages et avis associés.`)) return;
    
    setBulkDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/tasks/bulk-delete`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: JSON.stringify({ task_ids: selectedTasks }),
      });
      if (res.ok) {
        setTasks(tasks.filter(t => !selectedTasks.includes(t.id)));
        setSelectedTasks([]);
        const data = await res.json();
        alert(data.message);
      } else {
        const data = await res.json();
        alert(data.message || "Erreur lors de la suppression");
      }
    } catch {
      alert("Erreur réseau");
    } finally {
      setBulkDeleting(false);
    }
  }

  function toggleTaskSelection(taskId: number) {
    setSelectedTasks(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  }

  function toggleSelectAll() {
    if (selectedTasks.length === paginatedTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(paginatedTasks.map(t => t.id));
    }
  }

  const filteredTasks = tasks.filter((t) => {
    if (filter !== "all" && t.status !== filter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const statusColors: Record<string, string> = {
    published: "bg-emerald-100 text-emerald-700",
    in_progress: "bg-blue-100 text-blue-700",
    completed: "bg-violet-100 text-violet-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const statusLabels: Record<string, string> = {
    published: "Publiée",
    in_progress: "En cours",
    completed: "Terminée",
    cancelled: "Annulée",
  };

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <button 
          onClick={() => router.push("/admin")} 
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 mb-2 px-2 py-1 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Retour</span>
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Modération des annonces</h1>
          <p className="text-sm text-slate-600">{tasks.length} annonces au total</p>
        </div>
      </div>

      {/* Filters and Bulk Actions */}
      <div className="flex flex-col gap-3 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une annonce..."
            className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
          >
            <option value="all">Tous les statuts</option>
            <option value="published">Publiées</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminées</option>
            <option value="cancelled">Annulées</option>
          </select>
        </div>
        {selectedTasks.length > 0 && (
          <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <span className="text-sm font-medium text-red-900">
              {selectedTasks.length} annonce(s) sélectionnée(s)
            </span>
            <button
              onClick={bulkDeleteTasks}
              disabled={bulkDeleting}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {bulkDeleting ? "Suppression..." : "🗑️ Supprimer la sélection"}
            </button>
          </div>
        )}
      </div>

      {/* Tasks */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-slate-200 bg-white">
          <p className="text-slate-600">Aucune annonce trouvée</p>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {paginatedTasks.map((task) => (
              <div key={task.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{task.title}</p>
                    <p className="text-xs text-slate-500">#{task.id} • {task.category || "Sans catégorie"}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${statusColors[task.status] || "bg-slate-100 text-slate-700"}`}>
                    {statusLabels[task.status] || task.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-3">
                  <div>
                    <span className="text-slate-400">Client:</span>{" "}
                    {task.client?.name || "—"}
                  </div>
                  <div>
                    <span className="text-slate-400">Ville:</span>{" "}
                    {task.city || "—"}
                  </div>
                  <div>
                    <span className="text-slate-400">Offres:</span>{" "}
                    {task.offers?.length ?? 0}
                  </div>
                  <div>
                    <span className="text-slate-400">Date:</span>{" "}
                    {new Date(task.created_at).toLocaleDateString("fr-FR")}
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => router.push(`/tasks/${task.id}`)}
                    className="flex-1 rounded-lg bg-sky-50 px-3 py-2 text-xs font-medium text-sky-700 hover:bg-sky-100"
                  >
                    Voir
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    disabled={deleting === task.id}
                    className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                  >
                    {deleting === task.id ? "..." : "🗑️"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={paginatedTasks.length > 0 && selectedTasks.length === paginatedTasks.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-600">ID</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-600">Titre</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-600">Client</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-600">Statut</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-600">Offres</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-600">Ville</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-600">Créée le</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedTasks.includes(task.id)}
                        onChange={() => toggleTaskSelection(task.id)}
                        className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">#{task.id}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-900 truncate max-w-[180px]">{task.title}</p>
                      {task.category && <p className="text-xs text-slate-500">{task.category}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {task.client ? (
                        <div>
                          <p className="text-sm text-slate-900">{task.client.name}</p>
                          <p className="text-xs text-slate-500">{task.client.email}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status] || "bg-slate-100 text-slate-700"}`}>
                        {statusLabels[task.status] || task.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {task.offers?.length ?? 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{task.city || "—"}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {new Date(task.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => router.push(`/tasks/${task.id}`)}
                        className="text-xs text-sky-600 hover:text-sky-700 font-medium"
                      >
                        Voir
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        disabled={deleting === task.id}
                        className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                      >
                        {deleting === task.id ? "..." : "Supprimer"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium hover:border-sky-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Précédent
              </button>
              <span className="text-sm text-slate-600">
                Page {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium hover:border-sky-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Suivant →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
