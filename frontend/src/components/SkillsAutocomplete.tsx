"use client";

import { useState, useRef, useEffect } from "react";
import { fetchCategories, ServiceCategory } from "@/lib/categoriesApi";

interface SkillsAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (skill: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SkillsAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Plomberie, Électricité, Coiffure...",
  className = "",
}: SkillsAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [allSkills, setAllSkills] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [popularSkills, setPopularSkills] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Завантаження всіх категорій і підкатегорій
  useEffect(() => {
    async function loadSkills() {
      const categories = await fetchCategories();
      const skills: string[] = [];
      const popular: string[] = [];

      categories.forEach((cat: ServiceCategory) => {
        // Додати основну категорію
        skills.push(cat.name);
        
        // Додати всі підкатегорії
        cat.subcategories.forEach((sub) => {
          skills.push(sub.name);
        });

        // Популярні категорії для показу при пустому пошуку
        if (['construction', 'plumbing_heating', 'electricity', 'painting_decoration', 'wellbeing'].includes(cat.key)) {
          popular.push(cat.name);
          cat.subcategories.slice(0, 2).forEach((sub) => popular.push(sub.name));
        }
      });

      setAllSkills(skills);
      setPopularSkills(popular.slice(0, 8));
    }
    loadSkills();
  }, []);

  // Фільтрація підказок
  useEffect(() => {
    if (value.trim().length >= 2) {
      const query = value.toLowerCase();
      const filtered = allSkills
        .filter((skill) => skill.toLowerCase().includes(query))
        .slice(0, 10);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [value, allSkills]);

  // Закриття при кліку зовні
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (skill: string) => {
    onSelect(skill);
    onChange("");
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim()) {
      e.preventDefault();
      if (suggestions.length > 0) {
        handleSelect(suggestions[0]);
      } else {
        onSelect(value.trim());
        onChange("");
      }
    }
  };

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
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 ${className}`}
      />

      {isOpen && (suggestions.length > 0 || (value.trim().length < 2 && popularSkills.length > 0)) && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg max-h-60 overflow-y-auto">
          {value.trim().length < 2 ? (
            <>
              <div className="px-3 py-2 text-xs font-medium text-slate-400 uppercase">Compétences populaires</div>
              {popularSkills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleSelect(skill)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-sky-50 flex items-center gap-2 transition-colors"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                  <span className="text-slate-900">{skill}</span>
                </button>
              ))}
            </>
          ) : suggestions.length > 0 ? (
            <>
              <div className="px-3 py-2 text-xs font-medium text-slate-400 uppercase">
                {suggestions.length} résultat{suggestions.length > 1 ? 's' : ''}
              </div>
              {suggestions.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleSelect(skill)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-sky-50 transition-colors"
                >
                  <span className="font-medium text-slate-900">{skill}</span>
                </button>
              ))}
            </>
          ) : (
            <div className="px-3 py-2 text-sm text-slate-400 text-center">
              Aucune compétence trouvée
            </div>
          )}
        </div>
      )}
    </div>
  );
}
