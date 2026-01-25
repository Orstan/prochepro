"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UserAvatar from "@/components/UserAvatar";
import { API_BASE_URL } from "@/lib/api";
import ProviderInsightsDashboard from "@/components/dashboard/ProviderInsightsDashboard";

type User = {
  id?: number;
  name?: string;
  email?: string;
  role?: "client" | "prestataire" | string;
  roles?: string[];
  active_role?: string;
  avatar?: string | null;
  is_verified?: boolean;
  verification_status?: string;
};

type TaskSummary = {
  id: number;
  title: string;
  status: string;
};

type PrestataireOfferSummary = {
  id: number;
  taskId: number;
  taskTitle: string;
  status: string;
  taskStatus?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [clientPublishedTasks, setClientPublishedTasks] = useState<
    TaskSummary[]
  >([]);
  const [clientInProgressTasks, setClientInProgressTasks] = useState<
    TaskSummary[]
  >([]);
  const [clientCompletedTasks, setClientCompletedTasks] = useState<
    TaskSummary[]
  >([]);
  const [clientTasksLoading, setClientTasksLoading] = useState(false);
  const [prestataireOffers, setPrestataireOffers] = useState<
    PrestataireOfferSummary[]
  >([]);
  const [prestataireOffersLoading, setPrestataireOffersLoading] = useState(
    false,
  );
  const [prestataireAverageRating, setPrestataireAverageRating] = useState<
    number | null
  >(null);

  // Credits state - REMOVED: New pricing model with 0% commission for first 3 orders

  // Pagination states
  const ITEMS_PER_PAGE = 5;
  const [inProgressPage, setInProgressPage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const [publishedPage, setPublishedPage] = useState(1);
  const [activeMissionsPage, setActiveMissionsPage] = useState(1);
  const [pendingOffersPage, setPendingOffersPage] = useState(1);
  const [completedMissionsPage, setCompletedMissionsPage] = useState(1);

  // Role switching
  const [roleSwitching, setRoleSwitching] = useState(false);

  // Dashboard view toggle
  const [dashboardView, setDashboardView] = useState<'actions' | 'insights'>('actions');

  useEffect(() => {
    async function init() {
      try {
        const raw = localStorage.getItem("prochepro_user");
        if (!raw) {
          router.replace("/auth/login");
          return;
        }
        const parsed = JSON.parse(raw) as User;
        
        // Fetch fresh user data to get roles
        if (parsed?.id) {
          try {
            const res = await fetch(`${API_BASE_URL}/api/users/${parsed.id}`);
            if (res.ok) {
              const freshUser = await res.json();
              setUser(freshUser);
              localStorage.setItem("prochepro_user", JSON.stringify(freshUser));
              
              if (freshUser.role === "client") {
                void fetchClientTasks(freshUser.id);
              }
              if (freshUser.role === "prestataire") {
                void fetchPrestataireOffers(freshUser.id);
                void fetchPrestataireRating(freshUser.id);
              }
            } else {
              setUser(parsed);
              if (parsed.role === "client" && parsed.id) void fetchClientTasks(parsed.id);
              if (parsed.role === "prestataire" && parsed.id) {
                void fetchPrestataireOffers(parsed.id);
                void fetchPrestataireRating(parsed.id);
              }
            }
          } catch {
            setUser(parsed);
            if (parsed.role === "client" && parsed.id) void fetchClientTasks(parsed.id);
            if (parsed.role === "prestataire" && parsed.id) {
              void fetchPrestataireOffers(parsed.id);
              void fetchPrestataireRating(parsed.id);
            }
          }
        }
      } catch {
        router.replace("/auth/login");
        return;
      } finally {
        setLoading(false);
      }
    }
    
    void init();
  }, [router]);

  async function fetchClientTasks(clientId: number) {
    setClientTasksLoading(true);
    try {
      const [publishedRes, inProgressRes, completedRes] = await Promise.all([
        fetch(
          `${API_BASE_URL}/api/tasks?client_id=${clientId}&status=published`,
        ),
        fetch(
          `${API_BASE_URL}/api/tasks?client_id=${clientId}&status=in_progress`,
        ),
        fetch(
          `${API_BASE_URL}/api/tasks?client_id=${clientId}&status=completed`,
        ),
      ]);

      if (publishedRes.ok) {
        const data = await publishedRes.json();
        setClientPublishedTasks((data?.data ?? []).map((t: {id: number; title: string; status: string}) => ({
          id: t.id,
          title: t.title as string,
          status: t.status as string,
        })));
      }

      if (inProgressRes.ok) {
        const data = await inProgressRes.json();
        setClientInProgressTasks((data?.data ?? []).map((t: {id: number; title: string; status: string}) => ({
          id: t.id,
          title: t.title as string,
          status: t.status as string,
        })));
      }

      if (completedRes.ok) {
        const data = await completedRes.json();
        setClientCompletedTasks((data?.data ?? []).map((t: {id: number; title: string; status: string}) => ({
          id: t.id,
          title: t.title as string,
          status: t.status as string,
        })));
      }
    } catch {
      // м'яко ігноруємо помилки, дашборд все одно працює
    } finally {
      setClientTasksLoading(false);
    }
  }

  async function fetchPrestataireOffers(prestataireId: number) {
    setPrestataireOffersLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/offers?prestataire_id=${prestataireId}`,
      );

      if (res.ok) {
        const data = await res.json();
        setPrestataireOffers(
          (data ?? []).map((o: {id: number; task_id: number; task?: {title?: string; status?: string}; status: string; price?: number}) => ({
            id: o.id as number,
            taskId: o.task_id as number,
            taskTitle: (o.task?.title as string) ?? "Annonce",
            status: o.status as string,
            taskStatus: (o.task?.status as string) ?? undefined,
          })),
        );
      }
    } catch {
      // ігноруємо помилки
    } finally {
      setPrestataireOffersLoading(false);
    }
  }

  async function fetchPrestataireRating(prestataireId: number) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/prestataires/${prestataireId}/reviews`,
      );

      if (!res.ok) return;

      const data = await res.json();
      const reviews = (data ?? []) as { rating?: number }[];
      const rated = reviews.filter(
        (r) => typeof r.rating === "number" && !Number.isNaN(r.rating),
      );
      if (!rated.length) {
        setPrestataireAverageRating(null);
        return;
      }

      const sum = rated.reduce((acc, r) => acc + (r.rating ?? 0), 0);
      setPrestataireAverageRating(sum / rated.length);
    } catch {
      // тихо ігноруємо помилку
    }
  }

  async function handleSwitchRole(newRole: string) {
    if (!user?.id) return;
    setRoleSwitching(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/switch-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, role: newRole }),
      });
      if (res.ok) {
        const data = await res.json();
        const updatedUser = data.user;
        setUser(updatedUser);
        localStorage.setItem("prochepro_user", JSON.stringify(updatedUser));
        window.location.reload();
      }
    } catch {
      // ignore
    } finally {
      setRoleSwitching(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore network errors
    } finally {
      try {
        localStorage.removeItem("prochepro_user");
        // Dispatch custom event to update SiteShell immediately
        window.dispatchEvent(new Event("prochepro_logout"));
      } catch {
        // ignore storage errors
      }
      router.replace("/");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] text-sm text-slate-500">
        Chargement du tableau de bord...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isClient = user.role === "client";
  const isPrestataire = user.role === "prestataire";
  const userRoles = Array.isArray(user.roles) ? user.roles : [user.role];
  const hasBothRoles = userRoles.includes("client") && userRoles.includes("prestataire");

  return (
    <div className="px-4 py-8 overflow-x-hidden">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 w-full">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <UserAvatar avatar={user.avatar} name={user.name} size="lg" />
            <div>
              <h1 className="text-2xl font-semibold text-[#0F172A]">
                Bonjour{user.name ? `, ${user.name}` : ""}
              </h1>
            <p className="mt-1 text-sm text-slate-700">
              {isClient && "Tableau de bord client — gérez vos annonces et demandes."}
              {isPrestataire &&
                "Tableau de bord prestataire — suivez vos offres et missions."}
              {!isClient && !isPrestataire &&
                "Tableau de bord ProchePro."}
            </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              onClick={() => router.push("/profile")}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-3 py-2 text-xs sm:text-sm font-medium text-white shadow-sm hover:from-sky-600 hover:to-blue-700 transition-all"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="hidden sm:inline">Mon profil</span>
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 hover:border-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Se déconnecter"
            >
              {/* Mobile: red arrow pointing right (exit) */}
              <svg className="sm:hidden h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {/* Desktop: logout icon */}
              <svg className="hidden sm:block h-5 w-5 text-slate-600 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        {/* Role Switcher - only show if user has both roles */}
        {hasBothRoles && (
          <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-emerald-50 p-4 shadow-sm ring-1 ring-slate-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Mode actuel</p>
                <p className="text-xs text-slate-500">Basculez entre vos rôles</p>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-full p-1 shadow-sm w-full sm:w-auto justify-center">
                <button
                  onClick={() => handleSwitchRole("client")}
                  disabled={roleSwitching || isClient}
                  className={`px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex-1 sm:flex-none ${
                    isClient
                      ? "bg-blue-500 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  } disabled:opacity-50`}
                >
                  👤 Client
                </button>
                <button
                  onClick={() => handleSwitchRole("prestataire")}
                  disabled={roleSwitching || isPrestataire}
                  className={`px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex-1 sm:flex-none ${
                    isPrestataire
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  } disabled:opacity-50`}
                >
                  🔧 Prestataire
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard View Switcher - Only show for prestataires */}
        {user?.role === 'prestataire' && (
          <div className="rounded-2xl bg-white p-1 shadow-sm ring-1 ring-slate-100 w-full sm:w-auto">
            <div className="flex items-center gap-1 justify-center">
              <button
                onClick={() => setDashboardView('actions')}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex-1 sm:flex-none ${
                  dashboardView === 'actions'
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Actions rapides
                </span>
              </button>
              <button
                onClick={() => setDashboardView('insights')}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex-1 sm:flex-none ${
                  dashboardView === 'insights'
                    ? "bg-gradient-to-r from-sky-500 to-cyan-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Devenir meilleur
                </span>
              </button>
            </div>
          </div>
        )}

        <main className="space-y-6">
          {dashboardView === 'actions' ? (
            <>
          {/* Actions rapides + Profil */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-[2fr_1fr]">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <h2 className="text-sm font-semibold text-[#0F172A]">
                Actions rapides
              </h2>
              <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:flex sm:flex-wrap sm:gap-3">
                {isClient && (
                  <>
                    <button
                      className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 text-white shadow-lg shadow-sky-200 transition-all duration-300 hover:shadow-xl hover:shadow-sky-300 sm:hover:scale-105 w-full sm:w-auto"
                      onClick={() => router.push("/tasks/new")}
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                      <span className="relative flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Créer une annonce
                      </span>
                    </button>
                    <button
                      className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2.5 text-white shadow-lg shadow-violet-200 transition-all duration-300 hover:shadow-xl hover:shadow-violet-300 sm:hover:scale-105 w-full sm:w-auto"
                      onClick={() => router.push("/tasks/mine")}
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-violet-400 to-purple-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                      <span className="relative flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Mes annonces
                      </span>
                    </button>
                  </>
                )}
                {isPrestataire && (
                  <>
                    <button
                      className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 text-white shadow-lg shadow-sky-200 transition-all duration-300 hover:shadow-xl hover:shadow-sky-300 sm:hover:scale-105 w-full sm:w-auto"
                      onClick={() => router.push("/tasks/browse")}
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                      <span className="relative flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Chercher missions
                      </span>
                    </button>
                    <button
                      className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2.5 text-white shadow-lg shadow-amber-200 transition-all duration-300 hover:shadow-xl hover:shadow-amber-300 sm:hover:scale-105 w-full sm:w-auto"
                      onClick={() => router.push("/offers/mine")}
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                      <span className="relative flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Mes offres
                      </span>
                    </button>
                  </>
                )}
                <button
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-white shadow-lg shadow-emerald-200 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-300 sm:hover:scale-105 w-full sm:w-auto"
                  onClick={() => router.push("/messages")}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                  <span className="relative flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Messages
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Client: 3 columns for tasks */}
            {isClient && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* En cours */}
                <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100">
                      <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm">En cours</h3>
                      <p className="text-xs text-slate-500">{clientInProgressTasks.length} annonce{clientInProgressTasks.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  
                  {clientTasksLoading ? (
                    <div className="py-8 text-center">
                      <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
                    </div>
                  ) : clientInProgressTasks.length === 0 ? (
                    <div className="py-8 text-center">
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm text-slate-500">Aucune annonce</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {clientInProgressTasks.slice(0, inProgressPage * ITEMS_PER_PAGE).map((t) => (
                          <div
                            key={t.id}
                            onClick={() => router.push(`/tasks/${t.id}`)}
                            className="group flex items-center gap-3 rounded-xl bg-amber-50/50 px-3 py-2.5 cursor-pointer transition-all hover:bg-amber-100/50"
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-200/60 text-amber-700 text-xs font-bold">
                              {t.title.charAt(0).toUpperCase()}
                            </span>
                            <span className="truncate text-sm font-medium text-slate-700 group-hover:text-amber-800">{t.title}</span>
                          </div>
                        ))}
                      </div>
                      {clientInProgressTasks.length > inProgressPage * ITEMS_PER_PAGE && (
                        <button
                          onClick={() => setInProgressPage(p => p + 1)}
                          className="mt-3 w-full rounded-lg border border-amber-200 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50"
                        >
                          Voir plus ({clientInProgressTasks.length - inProgressPage * ITEMS_PER_PAGE} restantes)
                        </button>
                      )}
                      {inProgressPage > 1 && (
                        <button
                          onClick={() => setInProgressPage(1)}
                          className="mt-1 w-full text-xs text-slate-500 hover:text-slate-700"
                        >
                          Réduire
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Terminées */}
                <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100">
                      <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm">Terminées</h3>
                      <p className="text-xs text-slate-500">{clientCompletedTasks.length} annonce{clientCompletedTasks.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  
                  {clientTasksLoading ? (
                    <div className="py-8 text-center">
                      <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                    </div>
                  ) : clientCompletedTasks.length === 0 ? (
                    <div className="py-8 text-center">
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm text-slate-500">Aucune annonce</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {clientCompletedTasks.slice(0, completedPage * ITEMS_PER_PAGE).map((t) => (
                          <div
                            key={t.id}
                            onClick={() => router.push(`/tasks/${t.id}`)}
                            className="group flex items-center gap-3 rounded-xl bg-emerald-50/50 px-3 py-2.5 cursor-pointer transition-all hover:bg-emerald-100/50"
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-200/60 text-emerald-700 text-xs font-bold">
                              {t.title.charAt(0).toUpperCase()}
                            </span>
                            <span className="truncate text-sm font-medium text-slate-700 group-hover:text-emerald-800">{t.title}</span>
                          </div>
                        ))}
                      </div>
                      {clientCompletedTasks.length > completedPage * ITEMS_PER_PAGE && (
                        <button
                          onClick={() => setCompletedPage(p => p + 1)}
                          className="mt-3 w-full rounded-lg border border-emerald-200 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                        >
                          Voir plus ({clientCompletedTasks.length - completedPage * ITEMS_PER_PAGE} restantes)
                        </button>
                      )}
                      {completedPage > 1 && (
                        <button
                          onClick={() => setCompletedPage(1)}
                          className="mt-1 w-full text-xs text-slate-500 hover:text-slate-700"
                        >
                          Réduire
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Publiées */}
                <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100">
                      <svg className="h-4 w-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </span>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm">Publiées</h3>
                      <p className="text-xs text-slate-500">{clientPublishedTasks.length} annonce{clientPublishedTasks.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  
                  {clientTasksLoading ? (
                    <div className="py-8 text-center">
                      <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"></div>
                    </div>
                  ) : clientPublishedTasks.length === 0 ? (
                    <div className="py-8 text-center">
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <p className="text-sm text-slate-500">Aucune annonce</p>
                      <button
                        onClick={() => router.push("/tasks/new")}
                        className="mt-2 text-xs font-medium text-sky-600 hover:text-sky-700"
                      >
                        + Créer une annonce
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {clientPublishedTasks.slice(0, publishedPage * ITEMS_PER_PAGE).map((t) => (
                          <div
                            key={t.id}
                            onClick={() => router.push(`/tasks/${t.id}`)}
                            className="group flex items-center gap-3 rounded-xl bg-sky-50/50 px-3 py-2.5 cursor-pointer transition-all hover:bg-sky-100/50"
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-200/60 text-sky-700 text-xs font-bold">
                              {t.title.charAt(0).toUpperCase()}
                            </span>
                            <span className="truncate text-sm font-medium text-slate-700 group-hover:text-sky-800">{t.title}</span>
                          </div>
                        ))}
                      </div>
                      {clientPublishedTasks.length > publishedPage * ITEMS_PER_PAGE && (
                        <button
                          onClick={() => setPublishedPage(p => p + 1)}
                          className="mt-3 w-full rounded-lg border border-sky-200 py-1.5 text-xs font-medium text-sky-600 hover:bg-sky-50"
                        >
                          Voir plus ({clientPublishedTasks.length - publishedPage * ITEMS_PER_PAGE} restantes)
                        </button>
                      )}
                      {publishedPage > 1 && (
                        <button
                          onClick={() => setPublishedPage(1)}
                          className="mt-1 w-full text-xs text-slate-500 hover:text-slate-700"
                        >
                          Réduire
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Prestataire: 3 columns for missions */}
            {isPrestataire && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Missions actives */}
                <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm ring-1 ring-amber-100/50 transition-all hover:shadow-md">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-amber-100/50">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-200">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </span>
                    <div>
                      <h3 className="font-bold text-amber-900 text-sm">Actives</h3>
                      <p className="text-xs text-amber-600">
                        {prestataireOffers.filter((o) => o.status === "accepted" && o.taskStatus === "in_progress").length} mission{prestataireOffers.filter((o) => o.status === "accepted" && o.taskStatus === "in_progress").length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  {prestataireOffersLoading ? (
                    <div className="py-8 text-center">
                      <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
                    </div>
                  ) : prestataireOffers.filter((o) => o.status === "accepted" && o.taskStatus === "in_progress").length === 0 ? (
                    <div className="py-8 text-center">
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm text-slate-500">Aucune mission</p>
                      <button
                        onClick={() => router.push("/tasks/browse")}
                        className="mt-2 text-xs font-medium text-sky-600 hover:text-sky-700"
                      >
                        Parcourir les annonces
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {prestataireOffers
                          .filter((o) => o.status === "accepted" && o.taskStatus === "in_progress")
                          .slice(0, activeMissionsPage * ITEMS_PER_PAGE)
                          .map((o) => (
                            <div
                              key={o.id}
                              onClick={() => router.push(`/tasks/${o.taskId}`)}
                              className="group flex items-center gap-3 rounded-xl bg-white/60 px-3 py-2.5 cursor-pointer transition-all hover:bg-white hover:shadow-sm border border-amber-100/50"
                            >
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
                                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                              </span>
                              <span className="truncate text-sm font-medium text-slate-700 group-hover:text-amber-800">{o.taskTitle}</span>
                            </div>
                          ))}
                      </div>
                      {prestataireOffers.filter((o) => o.status === "accepted" && o.taskStatus === "in_progress").length > activeMissionsPage * ITEMS_PER_PAGE && (
                        <button
                          onClick={() => setActiveMissionsPage(p => p + 1)}
                          className="mt-3 w-full rounded-lg border border-amber-200 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50"
                        >
                          Voir plus
                        </button>
                      )}
                      {activeMissionsPage > 1 && (
                        <button onClick={() => setActiveMissionsPage(1)} className="mt-1 w-full text-xs text-slate-500 hover:text-slate-700">
                          Réduire
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Offres en attente */}
                <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 p-4 shadow-sm ring-1 ring-sky-100/50 transition-all hover:shadow-md">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-sky-100/50">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 shadow-lg shadow-sky-200">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                    <div>
                      <h3 className="font-bold text-sky-900 text-sm">En attente</h3>
                      <p className="text-xs text-sky-600">
                        {prestataireOffers.filter((o) => o.status === "pending").length} offre{prestataireOffers.filter((o) => o.status === "pending").length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  {prestataireOffersLoading ? (
                    <div className="py-8 text-center">
                      <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"></div>
                    </div>
                  ) : prestataireOffers.filter((o) => o.status === "pending").length === 0 ? (
                    <div className="py-8 text-center">
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </div>
                      <p className="text-sm text-slate-500">Aucune offre</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {prestataireOffers
                          .filter((o) => o.status === "pending")
                          .slice(0, pendingOffersPage * ITEMS_PER_PAGE)
                          .map((o) => (
                            <div
                              key={o.id}
                              onClick={() => router.push(`/tasks/${o.taskId}`)}
                              className="group flex items-center gap-3 rounded-xl bg-white/60 px-3 py-2.5 cursor-pointer transition-all hover:bg-white hover:shadow-sm border border-sky-100/50"
                            >
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 shadow-sm">
                                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </span>
                              <span className="truncate text-sm font-medium text-slate-700 group-hover:text-sky-800">{o.taskTitle}</span>
                            </div>
                          ))}
                      </div>
                      {prestataireOffers.filter((o) => o.status === "pending").length > pendingOffersPage * ITEMS_PER_PAGE && (
                        <button
                          onClick={() => setPendingOffersPage(p => p + 1)}
                          className="mt-3 w-full rounded-lg border border-sky-200 py-1.5 text-xs font-medium text-sky-600 hover:bg-sky-50"
                        >
                          Voir plus
                        </button>
                      )}
                      {pendingOffersPage > 1 && (
                        <button onClick={() => setPendingOffersPage(1)} className="mt-1 w-full text-xs text-slate-500 hover:text-slate-700">
                          Réduire
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Missions terminées */}
                <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4 shadow-sm ring-1 ring-emerald-100/50 transition-all hover:shadow-md">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-emerald-100/50">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-200">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                    <div>
                      <h3 className="font-bold text-emerald-900 text-sm">Terminées</h3>
                      <p className="text-xs text-emerald-600">
                        {prestataireOffers.filter((o) => o.status === "accepted" && o.taskStatus === "completed").length} mission{prestataireOffers.filter((o) => o.status === "accepted" && o.taskStatus === "completed").length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  {prestataireOffersLoading ? (
                    <div className="py-8 text-center">
                      <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                    </div>
                  ) : prestataireOffers.filter((o) => o.status === "accepted" && o.taskStatus === "completed").length === 0 ? (
                    <div className="py-8 text-center">
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm text-slate-500">Aucune mission</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {prestataireOffers
                          .filter((o) => o.status === "accepted" && o.taskStatus === "completed")
                          .slice(0, completedMissionsPage * ITEMS_PER_PAGE)
                          .map((o) => (
                            <div
                              key={o.id}
                              onClick={() => router.push(`/tasks/${o.taskId}`)}
                              className="group flex items-center gap-3 rounded-xl bg-white/60 px-3 py-2.5 cursor-pointer transition-all hover:bg-white hover:shadow-sm border border-emerald-100/50"
                            >
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm">
                                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </span>
                              <span className="truncate text-sm font-medium text-slate-700 group-hover:text-emerald-800">{o.taskTitle}</span>
                            </div>
                          ))}
                      </div>
                      {prestataireOffers.filter((o) => o.status === "accepted" && o.taskStatus === "completed").length > completedMissionsPage * ITEMS_PER_PAGE && (
                        <button
                          onClick={() => setCompletedMissionsPage(p => p + 1)}
                          className="mt-3 w-full rounded-lg border border-emerald-200 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                        >
                          Voir plus
                        </button>
                      )}
                      {completedMissionsPage > 1 && (
                        <button onClick={() => setCompletedMissionsPage(1)} className="mt-1 w-full text-xs text-slate-500 hover:text-slate-700">
                          Réduire
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
            </>
          ) : dashboardView === 'insights' ? (
            <ProviderInsightsDashboard />
          ) : null}
        </main>
      </div>
    </div>
  );
}
