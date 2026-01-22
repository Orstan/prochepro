"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

interface Stats {
  total_users: number;
  total_clients: number;
  total_prestataires: number;
  total_tasks: number;
  published_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  cancelled_tasks: number;
  total_offers: number;
  total_reviews: number;
  total_revenue: number;
}

interface Task {
  id: number;
  title: string;
  status: string;
  city?: string;
  created_at: string;
  client_id?: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("prochepro_user");
    if (!stored) {
      router.replace("/auth/login");
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      // Check if user is admin
      if (!parsed.is_admin) {
        alert("Accès refusé. Droits administrateur requis.");
        router.replace("/dashboard");
        return;
      }
      setUser(parsed);
      fetchStats();
    } catch {
      router.replace("/auth/login");
    }
  }, [router]);

  function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("prochepro_token");
    return token ? { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } : {};
  }

  async function fetchStats() {
    setLoading(true);
    
    const headers = getAuthHeaders();
    
    try {
      // Try admin API first
      let statsData = null;
      let taskList: Task[] = [];

      // Fetch stats from admin API
      const statsRes = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        credentials: "include",
        headers,
      });
      
      if (statsRes.ok) {
        statsData = await statsRes.json();
      } else {
        // Fallback: fetch from regular API and calculate
        const tasksRes = await fetch(`${API_BASE_URL}/api/tasks`, {
          credentials: "include",
        });
        if (tasksRes.ok) {
          const tasks = await tasksRes.json();
          taskList = tasks?.data ?? tasks ?? [];
          statsData = {
            total_users: 0,
            total_clients: 0,
            total_prestataires: 0,
            total_tasks: taskList.length,
            published_tasks: taskList.filter((t: Task) => t.status === "published").length,
            in_progress_tasks: taskList.filter((t: Task) => t.status === "in_progress").length,
            completed_tasks: taskList.filter((t: Task) => t.status === "completed").length,
            cancelled_tasks: taskList.filter((t: Task) => t.status === "cancelled").length,
            total_offers: 0,
            total_reviews: 0,
            total_revenue: 0,
          };
        }
      }

      if (statsData) {
        setStats(statsData);
      }

      // Fetch recent tasks
      if (taskList.length === 0) {
        const tasksRes = await fetch(`${API_BASE_URL}/api/admin/tasks`, {
          credentials: "include",
          headers,
        });
        if (tasksRes.ok) {
          const tasks = await tasksRes.json();
          taskList = tasks?.data ?? tasks ?? [];
        } else {
          // Fallback to regular API
          const fallbackRes = await fetch(`${API_BASE_URL}/api/tasks`, {
            credentials: "include",
          });
          if (fallbackRes.ok) {
            const tasks = await fallbackRes.json();
            taskList = tasks?.data ?? tasks ?? [];
          }
        }
      }
      
      setRecentTasks(taskList.slice(0, 5));
    } catch (err) {
      console.error("Error fetching stats:", err);
      // Set empty stats to show UI
      setStats({
        total_users: 0,
        total_clients: 0,
        total_prestataires: 0,
        total_tasks: 0,
        published_tasks: 0,
        in_progress_tasks: 0,
        completed_tasks: 0,
        cancelled_tasks: 0,
        total_offers: 0,
        total_reviews: 0,
        total_revenue: 0,
      });
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="mb-4 sm:mb-8">
        <button 
          onClick={() => router.push("/dashboard")} 
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 mb-2 px-2 py-1 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Dashboard</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-sm sm:text-base text-slate-600">Vue d&apos;ensemble de la plateforme</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600" />
        </div>
      ) : stats ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 sm:p-6 text-white">
              <p className="text-xl sm:text-3xl font-bold">{stats.total_users}</p>
              <p className="text-xs sm:text-base text-blue-100">Utilisateurs</p>
            </div>
            <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 sm:p-6 text-white">
              <p className="text-xl sm:text-3xl font-bold">{stats.total_tasks}</p>
              <p className="text-xs sm:text-base text-emerald-100">Annonces</p>
            </div>
            <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 p-3 sm:p-6 text-white">
              <p className="text-xl sm:text-3xl font-bold">{stats.total_offers}</p>
              <p className="text-xs sm:text-base text-violet-100">Offres</p>
            </div>
            <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-3 sm:p-6 text-white">
              <p className="text-xl sm:text-3xl font-bold">{Number(stats.total_revenue || 0).toFixed(0)}€</p>
              <p className="text-xs sm:text-base text-amber-100">Revenus</p>
            </div>
          </div>

          {/* Status breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-8">
            {/* Task Status Chart */}
            <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">Répartition des annonces</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Publiées</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full" 
                        style={{ width: `${stats.total_tasks > 0 ? (stats.published_tasks / stats.total_tasks) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{stats.published_tasks}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">En cours</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${stats.total_tasks > 0 ? (stats.in_progress_tasks / stats.total_tasks) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{stats.in_progress_tasks}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Terminées</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-violet-500 rounded-full" 
                        style={{ width: `${stats.total_tasks > 0 ? (stats.completed_tasks / stats.total_tasks) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{stats.completed_tasks}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Annulées</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 rounded-full" 
                        style={{ width: `${stats.total_tasks > 0 ? (stats.cancelled_tasks / stats.total_tasks) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{stats.cancelled_tasks}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Administration</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
              <button
                onClick={() => router.push("/admin/users")}
                className="rounded-xl border border-slate-200 p-3 md:p-4 text-left hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <span className="text-xl md:text-2xl">👥</span>
                <p className="font-medium text-slate-900 mt-1 md:mt-2 text-sm md:text-base">Utilisateurs</p>
                <p className="text-[10px] md:text-xs text-slate-500">Gérer les comptes & crédits</p>
              </button>
              <button
                onClick={() => router.push("/admin/tasks")}
                className="rounded-xl border border-slate-200 p-3 md:p-4 text-left hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
              >
                <span className="text-xl md:text-2xl">📋</span>
                <p className="font-medium text-slate-900 mt-1 md:mt-2 text-sm md:text-base">Modération</p>
                <p className="text-[10px] md:text-xs text-slate-500">Annonces & contenus</p>
              </button>
              <button
                onClick={() => router.push("/admin/credits")}
                className="rounded-xl border border-slate-200 p-3 md:p-4 text-left hover:border-violet-500 hover:bg-violet-50 transition-colors"
              >
                <span className="text-xl md:text-2xl">💳</span>
                <p className="font-medium text-slate-900 mt-1 md:mt-2 text-sm md:text-base">Crédits</p>
                <p className="text-[10px] md:text-xs text-slate-500">Packs & tarifs</p>
              </button>
              <button
                onClick={() => router.push("/admin/promotion-packages")}
                className="rounded-xl border border-slate-200 p-3 md:p-4 text-left hover:border-amber-500 hover:bg-amber-50 transition-colors"
              >
                <span className="text-xl md:text-2xl">⭐</span>
                <p className="font-medium text-slate-900 mt-1 md:mt-2 text-sm md:text-base">Packages TOP</p>
                <p className="text-[10px] md:text-xs text-slate-500">Gérer les packs promo</p>
              </button>
              <button
                onClick={() => router.push("/admin/promotion-grants")}
                className="rounded-xl border border-slate-200 p-3 md:p-4 text-left hover:border-yellow-500 hover:bg-yellow-50 transition-colors"
              >
                <span className="text-xl md:text-2xl">🎁</span>
                <p className="font-medium text-slate-900 mt-1 md:mt-2 text-sm md:text-base">Accorder TOP</p>
                <p className="text-[10px] md:text-xs text-slate-500">Promotions gratuites</p>
              </button>
              <button
                onClick={() => router.push("/admin/blog")}
                className="rounded-xl border border-slate-200 p-3 md:p-4 text-left hover:border-pink-500 hover:bg-pink-50 transition-colors"
              >
                <span className="text-xl md:text-2xl">📝</span>
                <p className="font-medium text-slate-900 mt-1 md:mt-2 text-sm md:text-base">Blog</p>
                <p className="text-[10px] md:text-xs text-slate-500">Articles & SEO</p>
              </button>
              <button
                onClick={() => router.push("/admin/video-testimonials")}
                className="rounded-xl border border-slate-200 p-3 md:p-4 text-left hover:border-amber-500 hover:bg-amber-50 transition-colors"
              >
                <span className="text-xl md:text-2xl">📹</span>
                <p className="font-medium text-slate-900 mt-1 md:mt-2 text-sm md:text-base">Témoignages Vidéo</p>
                <p className="text-[10px] md:text-xs text-slate-500">Gérer les vidéos</p>
              </button>
              <button
                onClick={() => router.push("/admin/payments")}
                className="rounded-xl border border-slate-200 p-3 md:p-4 text-left hover:border-amber-500 hover:bg-amber-50 transition-colors"
              >
                <span className="text-xl md:text-2xl">💰</span>
                <p className="font-medium text-slate-900 mt-1 md:mt-2 text-sm md:text-base">Paiements</p>
                <p className="text-[10px] md:text-xs text-slate-500">Transactions</p>
              </button>
              <button
                onClick={() => router.push("/admin/verifications")}
                className="rounded-xl border border-slate-200 bg-white p-3 md:p-4 text-left hover:border-emerald-500 hover:shadow-md transition-all"
              >
                <span className="text-xl md:text-2xl">🛡️</span>
                <p className="font-medium text-slate-900 mt-1 md:mt-2 text-sm md:text-base">Vérifications</p>
                <p className="text-[10px] md:text-xs text-slate-500">Identités à valider</p>
              </button>
              <button
                onClick={() => router.push("/services")}
                className="rounded-xl border border-slate-200 p-3 md:p-4 text-left hover:border-cyan-500 hover:bg-cyan-50 transition-colors"
              >
                <span className="text-xl md:text-2xl">🔍</span>
                <p className="font-medium text-slate-900 mt-1 md:mt-2 text-sm md:text-base">SEO Pages</p>
                <p className="text-[10px] md:text-xs text-slate-500">Services & villes</p>
              </button>
              <button
                onClick={() => router.push("/admin/ab-tests")}
                className="rounded-xl border border-slate-200 p-3 md:p-4 text-left hover:border-purple-500 hover:bg-purple-50 transition-colors"
              >
                <span className="text-xl md:text-2xl">🧪</span>
                <p className="font-medium text-slate-900 mt-1 md:mt-2 text-sm md:text-base">Tests A/B</p>
                <p className="text-[10px] md:text-xs text-slate-500">Expériences & optimisation</p>
              </button>
              <button
                onClick={() => router.push("/admin/chat")}
                className="rounded-xl border border-slate-200 bg-white p-3 md:p-4 text-left hover:border-sky-500 hover:shadow-md transition-all"
              >
                <span className="text-xl md:text-2xl">💬</span>
                <p className="font-medium text-slate-900 mt-1 md:mt-2 text-sm md:text-base">Chats</p>
                <p className="text-[10px] md:text-xs text-slate-500">Messages utilisateurs</p>
              </button>
              <button
                onClick={() => router.push("/admin/support")}
                className="rounded-xl border border-slate-200 bg-white p-3 md:p-4 text-left hover:border-amber-500 hover:shadow-md transition-all"
              >
                <span className="text-xl md:text-2xl">🎫</span>
                <p className="font-medium text-slate-900 mt-1 md:mt-2 text-sm md:text-base">Support</p>
                <p className="text-[10px] md:text-xs text-slate-500">Tickets utilisateurs</p>
              </button>
              <button
                onClick={() => router.push("/admin/activity-logs")}
                className="rounded-xl border border-slate-200 bg-white p-3 md:p-4 text-left hover:border-indigo-500 hover:shadow-md transition-all"
              >
                <span className="text-xl md:text-2xl">📋</span>
                <p className="font-medium text-slate-900 mt-1 md:mt-2 text-sm md:text-base">Journaux</p>
                <p className="text-[10px] md:text-xs text-slate-500">Activité des admins</p>
              </button>
              <button
                onClick={() => router.push("/admin/moderation")}
                className="rounded-xl border border-slate-200 bg-white p-3 md:p-4 text-left hover:border-orange-500 hover:shadow-md transition-all"
              >
                <span className="text-xl md:text-2xl">🛡️</span>
                <p className="font-medium text-slate-900 mt-1 md:mt-2 text-sm md:text-base">Modération</p>
                <p className="text-[10px] md:text-xs text-slate-500">Contenu signalé</p>
              </button>
              <button
                onClick={() => router.push("/admin/analytics")}
                className="rounded-xl border border-slate-200 bg-white p-3 md:p-4 text-left hover:border-emerald-500 hover:shadow-md transition-all"
              >
                <span className="text-xl md:text-2xl">📊</span>
                <p className="font-medium text-slate-900 mt-1 md:mt-2 text-sm md:text-base">Analytique</p>
                <p className="text-[10px] md:text-xs text-slate-500">Statistiques avancées</p>
              </button>
              <button
                onClick={() => router.push("/admin/promo-codes")}
                className="rounded-xl border border-slate-200 bg-white p-3 md:p-4 text-left hover:border-pink-500 hover:shadow-md transition-all"
              >
                <span className="text-xl md:text-2xl">🎟️</span>
                <p className="font-medium text-slate-900 mt-1 md:mt-2 text-sm md:text-base">Codes promo</p>
                <p className="text-[10px] md:text-xs text-slate-500">Réductions & bonus</p>
              </button>
              <button
                onClick={() => router.push("/admin/campaigns")}
                className="rounded-xl border border-slate-200 bg-white p-3 md:p-4 text-left hover:border-violet-500 hover:shadow-md transition-all"
              >
                <span className="text-xl md:text-2xl">📧</span>
                <p className="font-medium text-slate-900 mt-1 md:mt-2 text-sm md:text-base">Campagnes</p>
                <p className="text-[10px] md:text-xs text-slate-500">Email & push</p>
              </button>
            </div>
          </div>
        </>
      ) : (
        <p className="text-slate-600">Erreur lors du chargement des statistiques</p>
      )}
    </div>
  );
}
