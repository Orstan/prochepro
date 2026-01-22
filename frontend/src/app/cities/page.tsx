"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FRENCH_REGIONS, POPULAR_CITIES, searchCities } from "@/lib/cities";

export default function CitiesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);

  const filteredCities = searchCities(search, 10);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
          Villes disponibles
        </h1>
        <p className="mt-2 text-slate-600 max-w-xl mx-auto">
          Nous démarrons en Île-de-France ! D&apos;autres régions seront bientôt disponibles.
        </p>
      </div>

      {/* Expansion notice */}
      <div className="max-w-2xl mx-auto mb-8 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 text-center">
        <div className="flex items-center justify-center gap-2 text-amber-700 mb-2">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="font-semibold">Expansion prévue</span>
        </div>
        <p className="text-sm text-amber-800">
          Lyon, Marseille, Toulouse, Bordeaux, Lille et d&apos;autres grandes villes arrivent bientôt !
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-10">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une ville..."
            className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 pl-12 text-sm shadow-sm focus:border-[#1E88E5] focus:outline-none focus:ring-1 focus:ring-[#1E88E5]"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Search results */}
        {search.trim() && (
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg max-h-64 overflow-y-auto">
            {filteredCities.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-500">Aucune ville trouvée</p>
            ) : (
              filteredCities.slice(0, 10).map((item) => (
                <button
                  key={`${item.city}-${item.region}`}
                  onClick={() => router.push(`/tasks/browse?city=${encodeURIComponent(item.city)}`)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left hover:bg-slate-50"
                >
                  <span className="font-medium text-slate-900">{item.city}</span>
                  <span className="text-xs text-slate-500">{item.region}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Regions grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {FRENCH_REGIONS.map((region) => (
          <div
            key={region.name}
            className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
          >
            <button
              onClick={() => setExpandedRegion(expandedRegion === region.name ? null : region.name)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50"
            >
              <div>
                <h2 className="font-semibold text-slate-900">{region.name}</h2>
                <p className="text-xs text-slate-500">{region.cities.length} villes</p>
              </div>
              <svg
                className={`h-5 w-5 text-slate-400 transition-transform ${expandedRegion === region.name ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedRegion === region.name && (
              <div className="px-5 pb-4 grid grid-cols-2 gap-2">
                {region.cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => router.push(`/tasks/browse?city=${encodeURIComponent(city)}`)}
                    className="text-left text-sm text-slate-600 hover:text-[#1E88E5] py-1 truncate"
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Popular cities highlight */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Villes les plus populaires</h2>
        <div className="flex flex-wrap gap-3">
          {POPULAR_CITIES.map((city) => (
            <button
              key={city}
              onClick={() => router.push(`/tasks/browse?city=${encodeURIComponent(city)}`)}
              className="inline-flex items-center gap-2 rounded-full bg-[#E3F2FD] px-4 py-2 text-sm font-medium text-[#1E88E5] hover:bg-[#BBDEFB] transition-colors"
            >
              <span className="h-2 w-2 rounded-full bg-[#1E88E5]" />
              {city}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
