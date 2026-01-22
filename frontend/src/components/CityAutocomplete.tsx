"use client";

import { useState, useRef, useEffect } from "react";
import { searchCities, POPULAR_CITIES } from "@/lib/cities";

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CityAutocomplete({
  value,
  onChange,
  placeholder = "Paris, Versailles...",
  className = "",
}: CityAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<{ city: string; region: string }[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.trim().length >= 2) {
      setSuggestions(searchCities(value, 8));
    } else {
      setSuggestions([]);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className={`w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 ${className}`}
      />

      {isOpen && (suggestions.length > 0 || value.trim().length < 2) && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg max-h-60 overflow-y-auto">
          {value.trim().length < 2 ? (
            <>
              <div className="px-3 py-2 text-xs font-medium text-slate-400 uppercase">Villes populaires</div>
              {POPULAR_CITIES.slice(0, 6).map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    onChange(city);
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1E88E5]" />
                  {city}
                </button>
              ))}
            </>
          ) : (
            suggestions.map((item) => (
              <button
                key={`${item.city}-${item.region}`}
                type="button"
                onClick={() => {
                  onChange(item.city);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center justify-between"
              >
                <span className="font-medium text-slate-900">{item.city}</span>
                <span className="text-xs text-slate-500">{item.region}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
