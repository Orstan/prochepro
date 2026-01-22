"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import UserAvatar from "@/components/UserAvatar";
import RankBadge from "@/components/gamification/RankBadge";
import { API_BASE_URL } from "@/lib/api";
import { SERVICE_CATEGORIES, getCategoryByKey } from "@/lib/categories";
import { PARIS_ZONES, type ParisZone } from "@/lib/paris-districts";
import LocationPicker from "@/components/LocationPicker";

interface Prestataire {
  id: number;
  name: string;
  city?: string | null;
  avatar?: string | null;
  average_rating?: number;
  reviews_count?: number;
  service_categories?: string[];
  service_subcategories?: string[];
  bio?: string | null;
  skills?: string[];
  is_verified?: boolean;
  verification_status?: string;
  total_tasks_completed?: number;
  latest_badge?: {
    icon: string;
    name: string;
  } | null;
}

interface ServiceCategory {
  key: string;
  name: string;
  icon: string;
  color: string;
  subcategories: {
    key: string;
    name: string;
  }[];
}

function PrestatairesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [zoneFilter, setZoneFilter] = useState<ParisZone | "">("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [allCategories, setAllCategories] = useState<ServiceCategory[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const urlCategory = searchParams.get("category");
    const urlQuery = searchParams.get("q");
    
    if (urlCategory) setCategoryFilter(urlCategory);
    if (urlQuery) {
      setSearchQuery(urlQuery);
      fetchPrestataires(1, urlQuery);
    } else {
      fetchPrestataires(1);
    }
    fetchAllCategories();
  }, [searchParams]);

  // Auto-fetch when filters change
  useEffect(() => {
    // Skip initial render (already fetched in previous useEffect)
    if (districtName !== '' || categoryFilter !== '') {
      fetchPrestataires(1, searchQuery, districtName, categoryFilter);
    }
  }, [districtName, categoryFilter]);

  async function fetchAllCategories() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/service-categories`);
      if (res.ok) {
        const data = await res.json();
        setAllCategories(data ?? []);
      }
    } catch {
      // Ignore error
    }
  }

  async function fetchPrestataires(page: number = 1, search: string = '', city: string = '', category: string = '') {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString() });
      if (search) {
        params.append('search', search);
      }
      if (city) {
        params.append('city', city);
      }
      if (category) {
        params.append('category', category);
      }
      
      const res = await fetch(`${API_BASE_URL}/api/prestataires?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPrestataires(data.data ?? []);
        setCurrentPage(data.current_page ?? 1);
        setTotalPages(data.last_page ?? 1);
        setTotalItems(data.total ?? 0);
      }
    } catch {
      setPrestataires([]);
    } finally {
      setLoading(false);
    }
  }

  // No local filtering needed - all filtering is done on backend
  const filtered = prestataires;

  const activeFiltersCount = [districtFilter, zoneFilter, categoryFilter].filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
          Trouvez votre prestataire
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Des professionnels qualifiés près de chez vous, prêts à réaliser vos projets
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                fetchPrestataires(1, searchQuery);
              }
            }}
            placeholder="Rechercher un prestataire, une compétence, ville..."
            className="w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-32 py-4 text-base shadow-sm transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 hover:border-slate-300"
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
            {activeFiltersCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-xs text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6 max-w-2xl mx-auto rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Filtres</h3>
            <button
              type="button"
              onClick={() => {
                setDistrictFilter("");
                setDistrictName("");
                setZoneFilter("");
                setCategoryFilter("");
              }}
              className="text-sm text-sky-600 hover:text-sky-700 font-medium"
            >
              Réinitialiser
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                📍 Localisation
              </label>
              <LocationPicker
                value={districtFilter}
                onChange={(code, name) => {
                  setDistrictFilter(code);
                  setDistrictName(name);
                }}
                placeholder="Paris 11ème..."
                showZoneFilter={false}
              />
            </div>

            {/* Zone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                🗺️ Zone
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
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 hover:border-slate-300"
              >
                <option value="">Toutes les catégories</option>
                {SERVICE_CATEGORIES.map((cat) => (
                  <option key={cat.key} value={cat.key}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Active filters */}
      {activeFiltersCount > 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
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
              🏷️ {getCategoryByKey(categoryFilter)?.label ?? categoryFilter}
              <button onClick={() => setCategoryFilter("")} className="hover:text-violet-900">×</button>
            </span>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="mb-4 text-center text-sm text-slate-500">
        {totalItems} prestataire{totalItems !== 1 ? "s" : ""} trouvé{totalItems !== 1 ? "s" : ""}
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-sky-600 border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Chargement des prestataires...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-4xl mb-4 block">🔍</span>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Aucun prestataire trouvé</h3>
          <p className="text-slate-600 mb-4">Essayez avec d&apos;autres critères de recherche</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setDistrictFilter("");
              setDistrictName("");
              setZoneFilter("");
              setCategoryFilter("");
            }}
            className="inline-flex items-center rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => router.push(`/prestataires/${p.id}`)}
                className="group rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-sky-200 relative"
              >
                {/* Verification badge in top right corner */}
                {p.is_verified === true && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
                      <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">✓</span>
                      Vérifié
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <UserAvatar avatar={p.avatar} name={p.name} size="lg" />
                    {(p.average_rating ?? 0) >= 4.5 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-xs">⭐</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-slate-900 group-hover:text-sky-700 transition-colors truncate">
                        {p.name}
                      </h3>
                    </div>
                    {p.city && (
                      <p className="text-sm text-slate-500 truncate">📍 {p.city}</p>
                    )}
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-sm ${
                          star <= Math.round(p.average_rating ?? 0)
                            ? "text-amber-400"
                            : "text-slate-200"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {p.average_rating?.toFixed(1) ?? "—"}
                  </span>
                  <span className="text-sm text-slate-400">
                    ({p.reviews_count ?? 0} avis)
                  </span>
                </div>

                {/* Rank Badge with Latest Achievement */}
                <div className="mb-3">
                  <RankBadge 
                    tasksCompleted={p.total_tasks_completed ?? 0}
                    latestBadge={p.latest_badge}
                  />
                </div>

                {/* Bio */}
                {p.bio && (
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                    {p.bio}
                  </p>
                )}

                {/* Skills */}
                {p.skills && p.skills.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {p.skills.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 border border-sky-200"
                        >
                          💼 {skill}
                        </span>
                      ))}
                      {p.skills.length > 3 && (
                        <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">
                          +{p.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Categories */}
                {p.service_categories && p.service_categories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {p.service_categories.slice(0, 2).map((catKey) => (
                      <span
                        key={catKey}
                        className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                      >
                        {getCategoryByKey(catKey)?.label ?? catKey}
                      </span>
                    ))}
                    {p.service_categories.length > 2 && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                        +{p.service_categories.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {/* View profile arrow */}
                <div className="mt-4 flex items-center justify-end text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-medium">Voir le profil</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {/* Previous button */}
              <button
                onClick={() => {
                  if (currentPage > 1) {
                    fetchPrestataires(currentPage - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Précédent
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => {
                          fetchPrestataires(page);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium transition-all ${
                          page === currentPage
                            ? "bg-sky-600 text-white shadow-md"
                            : "bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="px-2 text-slate-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              {/* Next button */}
              <button
                onClick={() => {
                  if (currentPage < totalPages) {
                    fetchPrestataires(currentPage + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
              >
                Suivant
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function PrestatairesPage() {
  return (
    <Suspense fallback={
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-sky-600 border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Chargement...</p>
        </div>
      </div>
    }>
      <PrestatairesContent />
    </Suspense>
  );
}
