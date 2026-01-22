"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

type Category = {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  topics_count: number;
};

export default function CommunityPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const raw = localStorage.getItem("prochepro_user");
    if (raw) {
      setUser(JSON.parse(raw));
    }
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/forum/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      // Error fetching categories
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-sky-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] py-6 sm:py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                Forum des Professionnels
              </h1>
              <p className="text-slate-600 text-sm sm:text-base">
                Échangez avec d'autres professionnels, partagez vos expériences et trouvez des solutions
              </p>
            </div>
            {user && (
              <button
                onClick={() => router.push("/community/new-topic")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold text-white hover:bg-sky-600 transition-colors shadow-sm"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Nouvelle discussion</span>
                <span className="sm:hidden">Nouveau</span>
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3 sm:space-y-4">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => router.push(`/community/category/${category.slug}`)}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm ring-1 ring-slate-100 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 group-hover:text-sky-600 transition-colors">
                      {category.name}
                    </h3>
                    <div className="flex-shrink-0 flex items-center gap-1.5 text-slate-500">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="text-sm font-medium">{category.topics_count}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {category.description}
                  </p>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0 hidden sm:block">
                  <svg className="h-5 w-5 text-slate-400 group-hover:text-sky-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info box for non-authenticated users */}
        {!user && (
          <div className="mt-6 sm:mt-8 rounded-xl sm:rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm sm:text-base font-semibold text-sky-900 mb-1">
                  Rejoignez le forum
                </h4>
                <p className="text-xs sm:text-sm text-sky-700 mb-3">
                  Connectez-vous pour participer aux discussions et partager vos connaissances
                </p>
                <button
                  onClick={() => router.push("/auth/login")}
                  className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 transition-colors"
                >
                  Se connecter
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm ring-1 ring-slate-100 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-sky-600 mb-1">
              {categories.reduce((sum, cat) => sum + cat.topics_count, 0)}
            </div>
            <div className="text-xs sm:text-sm text-slate-600">Discussions</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm ring-1 ring-slate-100 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mb-1">
              {categories.length}
            </div>
            <div className="text-xs sm:text-sm text-slate-600">Catégories</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm ring-1 ring-slate-100 text-center col-span-2 sm:col-span-1">
            <div className="text-2xl sm:text-3xl font-bold text-violet-600 mb-1">24/7</div>
            <div className="text-xs sm:text-sm text-slate-600">Disponible</div>
          </div>
        </div>
      </div>
    </div>
  );
}
