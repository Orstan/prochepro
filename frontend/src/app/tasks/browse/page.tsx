"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { API_BASE_URL } from "@/lib/api";
import { fetchCategories, getSubcategoriesByKey, getCategoryByKey, ServiceCategory } from "@/lib/categoriesApi";
import { PARIS_DISTRICTS, PARIS_ZONES, formatLocation, getDistrictsByZone, type ParisZone } from "@/lib/paris-districts";
import LocationPicker from "@/components/LocationPicker";
import TaskUrgencyBadge from "@/components/TaskUrgencyBadge";
import ResponseStatsIndicator from "@/components/ResponseStatsIndicator";

interface ProcheProUser {
  id: number;
  name: string;
  email: string;
  role: "client" | "prestataire" | string;
}

interface Task {
  id: number;
  title: string;
  description?: string | null;
  status: string;
  city?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  location_type?: "on_site" | "remote" | string | null;
  category?: string | null;
  subcategory?: string | null;
  images?: string[] | null;
  promoted_until?: string | null;
  created_at: string;
}

interface OfferSummary {
  id: number;
  task_id: number;
}


function TasksBrowseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<ProcheProUser | null>(null);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [offers, setOffers] = useState<OfferSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cityFilter, setCityFilter] = useState<string>("");
  const [districtFilter, setDistrictFilter] = useState<string>("");
  const [districtName, setDistrictName] = useState<string>("");
  const [zoneFilter, setZoneFilter] = useState<ParisZone | "">("");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>("");
  const [availableSubcategories, setAvailableSubcategories] = useState<{ key: string; name: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [budgetMin, setBudgetMin] = useState<string>("");
  const [budgetMax, setBudgetMax] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Load categories from API
  useEffect(() => {
    fetchCategories().then(data => setCategories(data));
  }, []);

  useEffect(() => {
    const urlCity = searchParams.get("city");
    const urlQ = searchParams.get("q");
    const urlCategory = searchParams.get("category");
    const urlSubcategory = searchParams.get("subcategory");

    if (urlCity) setCityFilter(urlCity);
    if (urlQ) setSearchQuery(urlQ);
    
    if (urlCategory) {
      setCategoryFilter(urlCategory);
      
      // Завантажуємо підкатегорії для вибраної категорії (async)
      getSubcategoriesByKey(urlCategory).then(subs => {
        setAvailableSubcategories(subs);
      });
      
      // Якщо є підкатегорія в URL, встановлюємо її
      if (urlSubcategory) {
        setSubcategoryFilter(urlSubcategory);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("prochepro_user");
    if (stored) {
      try {
        const parsed: ProcheProUser = JSON.parse(stored);
        setUser(parsed);
        // Завантажуємо офери тільки для prestataires
        if (parsed.role === "prestataire") {
          void fetchData(parsed.id);
        }
      } catch {
        window.localStorage.removeItem("prochepro_user");
        setUser(null);
      }
    }
    
    // Завантажуємо завдання навіть без авторизації
    void fetchTasks();
  }, [router]);

  async function fetchTasks() {
    setLoading(true);
    setError(null);

    try {
      const tasksRes = await fetch(`${API_BASE_URL}/api/tasks?status=published&per_page=1000`);

      if (!tasksRes.ok) {
        throw new Error("Impossible de charger les annonces.");
      }

      const tasksData = await tasksRes.json();
      const flatTasks: Task[] = (tasksData?.data ?? tasksData ?? []) as Task[];
      setTasks(flatTasks ?? []);
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

  async function fetchData(prestataireId: number) {
    try {
      const offersRes = await fetch(`${API_BASE_URL}/api/offers?prestataire_id=${prestataireId}`);

      if (offersRes.ok) {
        const offersData = await offersRes.json();
        setOffers(
          (offersData ?? []).map((o: any) => ({
            id: o.id as number,
            task_id: o.task_id as number,
          })),
        );
      }
    } catch (err: unknown) {
      // Error fetching offers
    }
  }

  const filteredAndSortedTasks = useMemo(() => {
    let result = tasks.filter((task) => {
      if (cityFilter) {
        const taskCity = task.city?.trim().toLowerCase() ?? "";
        if (!taskCity.includes(cityFilter.toLowerCase())) return false;
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const title = task.title?.toLowerCase() ?? "";
        const desc = task.description?.toLowerCase() ?? "";
        if (!title.includes(q) && !desc.includes(q)) return false;
      }

      if (locationFilter === "on_site" && task.location_type !== "on_site") return false;
      if (locationFilter === "remote" && task.location_type !== "remote") return false;
      if (categoryFilter && task.category?.trim() !== categoryFilter) return false;
      if (subcategoryFilter && task.subcategory?.trim() !== subcategoryFilter) return false;

      if (budgetMin) {
        const min = parseFloat(budgetMin);
        if (!isNaN(min) && (task.budget_max ?? 0) < min) return false;
      }
      if (budgetMax) {
        const max = parseFloat(budgetMax);
        if (!isNaN(max) && (task.budget_min ?? Infinity) > max) return false;
      }

      return true;
    });

    // Сортування з пріоритетом для ТОП-оголошень
    result.sort((a, b) => {
      const aIsTop = a.promoted_until && new Date(a.promoted_until) > new Date();
      const bIsTop = b.promoted_until && new Date(b.promoted_until) > new Date();
      
      // ТОП-оголошення завжди вгорі
      if (aIsTop && !bIsTop) return -1;
      if (!aIsTop && bIsTop) return 1;
      
      // Якщо обидва ТОП або обидва звичайні - застосовуємо обране сортування
      if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortBy === "budget_high") {
        return (b.budget_max ?? 0) - (a.budget_max ?? 0);
      } else if (sortBy === "budget_low") {
        return (a.budget_min ?? 0) - (b.budget_min ?? 0);
      }
      
      return 0;
    });

    return result;
  }, [tasks, cityFilter, searchQuery, locationFilter, categoryFilter, subcategoryFilter, budgetMin, budgetMax, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedTasks.length / ITEMS_PER_PAGE);
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedTasks.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedTasks, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [cityFilter, searchQuery, locationFilter, categoryFilter, subcategoryFilter, budgetMin, budgetMax]);

  const offeredTaskIds = useMemo(() => new Set(offers.map((o) => o.task_id)), [offers]);

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8 overflow-x-hidden text-slate-800">
      <button
        type="button"
        onClick={() => router.back()}
        className="text-sm text-slate-700 hover:text-slate-900 mb-4"
      >
        ↩ Retour
      </button>

      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Annonces disponibles</h1>
      <p className="text-sm text-slate-600 mb-4">
        Filtrez les missions disponibles et repérez celles où vous avez déjà proposé une offre.
      </p>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une annonce..."
            className="w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 py-4 text-base shadow-sm transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 hover:border-slate-300"
          />
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              showFilters 
                ? "bg-sky-100 text-sky-700" 
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="hidden sm:inline">Filtres</span>
            {(categoryFilter || districtFilter || zoneFilter || locationFilter || budgetMin || budgetMax) && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-xs text-white">
                {[categoryFilter, districtFilter, zoneFilter, locationFilter, budgetMin, budgetMax].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Response Time and Live Statistics */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <ResponseStatsIndicator className="w-full sm:w-auto" />
        
        {(!user || user.role === "client") && (
          <button
            type="button"
            onClick={() => router.push("/tasks/new")}
            className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-sky-700 transition-all hover:shadow-xl w-full sm:w-auto justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Publier une annonce
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Filtres avancés</h3>
            <button
              type="button"
              onClick={() => {
                setCategoryFilter("");
                setSubcategoryFilter("");
                setDistrictFilter("");
                setDistrictName("");
                setZoneFilter("");
                setLocationFilter("");
                setBudgetMin("");
                setBudgetMax("");
                setAvailableSubcategories([]);
              }}
              className="text-sm text-sky-600 hover:text-sky-700 font-medium"
            >
              Réinitialiser
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                📍 Arrondissement / Ville
              </label>
              <LocationPicker
                value={districtFilter}
                onChange={(code, name) => {
                  setDistrictFilter(code);
                  setDistrictName(name);
                }}
                placeholder="Paris 11ème, Montreuil..."
              />
            </div>

            {/* Zone filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                🗺️ Zone de Paris
              </label>
              <select
                value={zoneFilter}
                onChange={(e) => setZoneFilter(e.target.value as ParisZone | "")}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 hover:border-slate-300"
              >
                <option value="">Toutes les zones</option>
                {PARIS_ZONES.map((zone) => (
                  <option key={zone.key} value={zone.key}>
                    {zone.icon} {zone.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                🏷️ Catégorie
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  const newCategory = e.target.value;
                  setCategoryFilter(newCategory);
                  setSubcategoryFilter("");
                  if (newCategory) {
                    getSubcategoriesByKey(newCategory).then(subs => setAvailableSubcategories(subs));
                  } else {
                    setAvailableSubcategories([]);
                  }
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 hover:border-slate-300"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat.key} value={cat.key}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            {categoryFilter && availableSubcategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  📂 Sous-catégorie
                </label>
                <select
                  value={subcategoryFilter}
                  onChange={(e) => setSubcategoryFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 hover:border-slate-300"
                >
                  <option value="">Toutes</option>
                  {availableSubcategories.map((sub) => (
                    <option key={sub.key} value={sub.key}>{sub.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Location type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                🏠 Type de mission
              </label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 hover:border-slate-300"
              >
                <option value="">Tous les types</option>
                <option value="on_site">🏠 Sur place</option>
                <option value="remote">💻 À distance</option>
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                💰 Budget (€)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  placeholder="Min"
                  min="0"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 hover:border-slate-300"
                />
                <span className="text-slate-400">—</span>
                <input
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  placeholder="Max"
                  min="0"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 hover:border-slate-300"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active filters & Sort */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {districtName && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1.5 text-sm font-medium text-sky-700">
              📍 {districtName}
              <button onClick={() => { setDistrictFilter(""); setDistrictName(""); }} className="hover:text-sky-900">×</button>
            </span>
          )}
          {zoneFilter && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700">
              🗺️ {PARIS_ZONES.find(z => z.key === zoneFilter)?.label}
              <button onClick={() => setZoneFilter("")} className="hover:text-emerald-900">×</button>
            </span>
          )}
          {categoryFilter && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1.5 text-sm font-medium text-violet-700">
              🏷️ {categories.find(c => c.key === categoryFilter)?.name ?? categoryFilter}
              <button onClick={() => { setCategoryFilter(""); setSubcategoryFilter(""); setAvailableSubcategories([]); }} className="hover:text-violet-900">×</button>
            </span>
          )}
          {subcategoryFilter && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1.5 text-sm font-medium text-purple-700">
              📂 {subcategoryFilter}
              <button onClick={() => setSubcategoryFilter("")} className="hover:text-purple-900">×</button>
            </span>
          )}
          {locationFilter && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-700">
              {locationFilter === "on_site" ? "🏠 Sur place" : "💻 À distance"}
              <button onClick={() => setLocationFilter("")} className="hover:text-amber-900">×</button>
            </span>
          )}
          {(budgetMin || budgetMax) && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700">
              💰 {budgetMin || "0"}€ - {budgetMax || "∞"}€
              <button onClick={() => { setBudgetMin(""); setBudgetMax(""); }} className="hover:text-green-900">×</button>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">{filteredAndSortedTasks.length} résultat{filteredAndSortedTasks.length !== 1 ? "s" : ""}</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition-all focus:border-sky-500 focus:outline-none hover:border-slate-300"
          >
            <option value="newest">Plus récentes</option>
            <option value="oldest">Plus anciennes</option>
            <option value="budget_high">Budget ↓</option>
            <option value="budget_low">Budget ↑</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <p className="text-sm text-slate-700">Chargement des annonces...</p>
      ) : error ? (
        <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      ) : filteredAndSortedTasks.length === 0 ? (
        <p className="text-sm text-slate-700">Aucune annonce ne correspond à vos filtres.</p>
      ) : (
        <>
          <p className="text-xs text-slate-500 mb-2">
            {filteredAndSortedTasks.length} annonce{filteredAndSortedTasks.length > 1 ? "s" : ""} trouvée{filteredAndSortedTasks.length > 1 ? "s" : ""}
          </p>
          <div className="grid gap-3">
            {paginatedTasks.map((task) => {
              const alreadyOffered = offeredTaskIds.has(task.id);
              const isPromoted = task.promoted_until && new Date(task.promoted_until) > new Date();
              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => router.push(`/tasks/${task.id}`)}
                  className={`flex w-full rounded-xl border text-left text-sm shadow-sm hover:shadow-md overflow-hidden transition-all ${
                    isPromoted 
                      ? 'border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 hover:border-amber-400 ring-2 ring-amber-100' 
                      : 'border-slate-200 bg-white hover:border-sky-500'
                  }`}
                >
                  {/* Task Image */}
                  {task.images && task.images.length > 0 && (
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                      <Image
                        src={`${API_BASE_URL}${task.images[0]}`}
                        alt={task.title}
                        fill
                        className="object-cover"
                      />
                      {task.images.length > 1 && (
                        <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                          +{task.images.length - 1}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Task Content */}
                  <div className="flex flex-col flex-1 px-3 sm:px-4 py-3 min-w-0">
                    <div className="flex w-full items-center justify-between gap-2 min-w-0">
                      <h2 className="font-semibold text-slate-900 truncate flex-1 min-w-0">{task.title}</h2>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <TaskUrgencyBadge 
                          isUrgent={isPromoted || false}
                          createdAt={task.created_at}
                        />
                        {isPromoted && (
                          <span className="rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm flex items-center gap-1">
                            <span>⭐</span>
                            <span>Recommandé</span>
                          </span>
                        )}
                        {alreadyOffered && (
                          <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700 ring-1 ring-sky-100">
                            Déjà proposé
                          </span>
                        )}
                      </div>
                    </div>
                    {task.city && <p className="mt-1 text-xs text-slate-600">Ville : {task.city}</p>}
                    {task.location_type && (
                      <p className="mt-0.5 text-xs text-slate-600">
                        Type : {task.location_type === "on_site" ? "Sur place" : "À distance"}
                      </p>
                    )}
                    {(task.budget_min != null || task.budget_max != null) && (
                      <p className="mt-0.5 text-xs text-slate-600">
                        Budget : {task.budget_min ?? 0}€ - {task.budget_max ?? "∞"}€
                      </p>
                    )}
                    <p className="mt-1 text-[11px] text-slate-500">
                      Publiée le {new Date(task.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium hover:border-sky-500 disabled:opacity-40"
              >
                ← Précédent
              </button>
              <span className="text-xs text-slate-600">Page {currentPage} / {totalPages}</span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium hover:border-sky-500 disabled:opacity-40"
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

export default function TasksBrowsePage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-slate-500">Chargement...</div>
      </div>
    }>
      <TasksBrowseContent />
    </Suspense>
  );
}
