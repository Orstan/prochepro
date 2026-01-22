"use client";

import { useState, useRef, useEffect } from "react";
import {
  PARIS_DISTRICTS,
  PARIS_SUBURBS,
  PARIS_ZONES,
  SUBURB_ZONES,
  getDistrictsByZone,
  getSuburbsByZone,
  searchLocations,
  formatLocation,
  type ParisZone,
  type SuburbZone,
} from "@/lib/paris-districts";

interface LocationPickerProps {
  value: string;
  onChange: (code: string, name: string) => void;
  placeholder?: string;
  className?: string;
  showZoneFilter?: boolean;
}

export default function LocationPicker({
  value,
  onChange,
  placeholder = "Sélectionnez un arrondissement ou une ville...",
  className = "",
  showZoneFilter = true,
}: LocationPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"paris" | "suburbs">("paris");
  const [selectedZone, setSelectedZone] = useState<ParisZone | SuburbZone | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayValue = value ? formatLocation(value) : "";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code: string, name: string) => {
    onChange(code, name);
    setIsOpen(false);
    setSearchQuery("");
  };

  const filteredDistricts = selectedZone && activeTab === "paris"
    ? getDistrictsByZone(selectedZone as ParisZone)
    : PARIS_DISTRICTS;

  const filteredSuburbs = selectedZone && activeTab === "suburbs"
    ? getSuburbsByZone(selectedZone as SuburbZone)
    : PARIS_SUBURBS;

  const searchResults = searchQuery ? searchLocations(searchQuery) : [];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input */}
      <div
        className="relative cursor-pointer"
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
      >
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchQuery : displayValue}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-3 text-sm shadow-sm transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 hover:border-slate-300"
        />
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("", "");
              setSearchQuery("");
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {!value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 overflow-hidden">
          {/* Search results */}
          {searchQuery && (
            <div className="max-h-64 overflow-y-auto p-2">
              {searchResults.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map((result) => (
                    <button
                      key={result.code}
                      type="button"
                      onClick={() => handleSelect(result.code, result.name)}
                      className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-sky-50 transition-colors"
                    >
                      <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm ${
                        result.type === "district" ? "bg-sky-100 text-sky-700" : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {result.type === "district" ? "🏛️" : "🏘️"}
                      </span>
                      <div>
                        <div className="font-medium text-slate-900">{result.name}</div>
                        <div className="text-xs text-slate-500">{result.code}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-slate-500">
                  Aucun résultat pour &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          )}

          {/* Tabs and content */}
          {!searchQuery && (
            <>
              {/* Tabs */}
              <div className="flex border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("paris");
                    setSelectedZone(null);
                  }}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === "paris"
                      ? "text-sky-600 border-b-2 border-sky-600 bg-sky-50/50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  🏛️ Paris
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("suburbs");
                    setSelectedZone(null);
                  }}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === "suburbs"
                      ? "text-sky-600 border-b-2 border-sky-600 bg-sky-50/50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  🏘️ Banlieue
                </button>
              </div>

              {/* Zone filter */}
              {showZoneFilter && (
                <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedZone(null)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        !selectedZone
                          ? "bg-sky-600 text-white"
                          : "bg-white text-slate-600 hover:bg-slate-100 ring-1 ring-slate-200"
                      }`}
                    >
                      Tous
                    </button>
                    {activeTab === "paris" ? (
                      PARIS_ZONES.map((zone) => (
                        <button
                          key={zone.key}
                          type="button"
                          onClick={() => setSelectedZone(zone.key)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            selectedZone === zone.key
                              ? "bg-sky-600 text-white"
                              : "bg-white text-slate-600 hover:bg-slate-100 ring-1 ring-slate-200"
                          }`}
                        >
                          {zone.icon} {zone.label}
                        </button>
                      ))
                    ) : (
                      SUBURB_ZONES.map((zone) => (
                        <button
                          key={zone.key}
                          type="button"
                          onClick={() => setSelectedZone(zone.key)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            selectedZone === zone.key
                              ? "bg-sky-600 text-white"
                              : "bg-white text-slate-600 hover:bg-slate-100 ring-1 ring-slate-200"
                          }`}
                        >
                          {zone.label} ({zone.department})
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* List */}
              <div className="max-h-64 overflow-y-auto p-2">
                {activeTab === "paris" ? (
                  <div className="grid grid-cols-2 gap-1">
                    {filteredDistricts.map((district) => (
                      <button
                        key={district.code}
                        type="button"
                        onClick={() => handleSelect(district.code, `Paris ${district.shortName}`)}
                        className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                          value === district.code
                            ? "bg-sky-100 text-sky-700"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-xs font-semibold text-sky-700">
                          {district.shortName.replace("ème", "").replace("er", "")}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-slate-900 truncate">
                            {district.shortName}
                          </div>
                          {district.landmarks && district.landmarks[0] && (
                            <div className="text-xs text-slate-500 truncate">
                              {district.landmarks[0]}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredSuburbs.map((suburb) => (
                      <button
                        key={suburb.code}
                        type="button"
                        onClick={() => handleSelect(suburb.code, suburb.name)}
                        className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                          value === suburb.code
                            ? "bg-emerald-100 text-emerald-700"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-xs font-semibold text-emerald-700">
                          {suburb.department}
                        </span>
                        <div>
                          <div className="font-medium text-slate-900">{suburb.name}</div>
                          <div className="text-xs text-slate-500">{suburb.postalCode}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
