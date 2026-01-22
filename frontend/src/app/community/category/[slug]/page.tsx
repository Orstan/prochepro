"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

type Topic = {
  id: number;
  title: string;
  slug: string;
  user: {
    id: number;
    name: string;
  };
  is_pinned: boolean;
  is_locked: boolean;
  views_count: number;
  posts_count: number;
  last_activity_at: string;
  created_at: string;
};

type Category = {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
};

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const raw = localStorage.getItem("prochepro_user");
    if (raw) {
      setUser(JSON.parse(raw));
    }
    if (slug) {
      fetchCategoryTopics();
    }
  }, [slug]);

  async function fetchCategoryTopics() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/forum/categories/${slug}/topics`);
      if (res.ok) {
        const data = await res.json();
        setCategory(data.category);
        setTopics(data.topics.data);
      }
    } catch (err) {
      // Error fetching topics
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Hier";
    if (days < 7) return `Il y a ${days} jours`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-sky-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Catégorie introuvable</h2>
          <button
            onClick={() => router.push("/community")}
            className="text-sky-600 hover:text-sky-700"
          >
            Retour aux catégories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] py-6 sm:py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm">
          <button
            onClick={() => router.push("/community")}
            className="text-slate-600 hover:text-sky-600 transition-colors"
          >
            Forum
          </button>
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-slate-900 font-medium">{category.name}</span>
        </div>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center text-2xl sm:text-3xl">
                {category.icon}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
                  {category.name}
                </h1>
                <p className="text-sm sm:text-base text-slate-600">
                  {category.description}
                </p>
              </div>
            </div>
            {user && (
              <button
                onClick={() => router.push(`/community/new-topic?category=${category.id}`)}
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

        {/* Topics List */}
        {topics.length === 0 ? (
          <div className="bg-white rounded-xl sm:rounded-2xl p-8 sm:p-12 shadow-sm ring-1 ring-slate-100 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Aucune discussion pour le moment
            </h3>
            <p className="text-slate-600 mb-4">
              Soyez le premier à lancer une discussion dans cette catégorie
            </p>
            {user && (
              <button
                onClick={() => router.push(`/community/new-topic?category=${category.id}`)}
                className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 transition-colors"
              >
                Créer une discussion
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {topics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => router.push(`/community/topic/${topic.slug}`)}
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm ring-1 ring-slate-100 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Status Icons */}
                  <div className="flex-shrink-0 flex flex-col gap-1">
                    {topic.is_pinned && (
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center" title="Épinglé">
                        <svg className="h-4 w-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                        </svg>
                      </div>
                    )}
                    {topic.is_locked && (
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center" title="Verrouillé">
                        <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 group-hover:text-sky-600 transition-colors mb-1 line-clamp-2">
                      {topic.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {topic.user.name}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span>{formatDate(topic.last_activity_at)}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex-shrink-0 flex items-center gap-3 sm:gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="hidden sm:inline">{topic.views_count}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="font-medium">{topic.posts_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
