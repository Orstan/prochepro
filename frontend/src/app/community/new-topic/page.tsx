"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

type Category = {
  id: number;
  name: string;
  slug: string;
  icon: string;
};

function NewTopicContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("prochepro_user");
    if (!raw) {
      router.replace("/auth/login");
      return;
    }
    setUser(JSON.parse(raw));
    
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setSelectedCategoryId(parseInt(categoryParam));
    }
    
    fetchCategories();
  }, [router, searchParams]);

  async function fetchCategories() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/forum/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      // Error fetching categories
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!selectedCategoryId) {
      setError("Veuillez sélectionner une catégorie");
      return;
    }

    if (title.trim().length < 5) {
      setError("Le titre doit contenir au moins 5 caractères");
      return;
    }

    if (content.trim().length < 10) {
      setError("Le contenu doit contenir au moins 10 caractères");
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("prochepro_token");
      const res = await fetch(`${API_BASE_URL}/api/forum/topics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category_id: selectedCategoryId,
          title: title.trim(),
          content: content.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur lors de la création");
      }

      const topic = await res.json();
      router.push(`/community/topic/${topic.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] py-6 sm:py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-sky-600 transition-colors mb-4"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Nouvelle discussion
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Partagez vos questions, expériences ou conseils avec la communauté
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Category Selection */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm ring-1 ring-slate-100">
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Catégorie <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={`flex items-center gap-3 p-3 sm:p-4 rounded-lg border-2 transition-all text-left ${
                    selectedCategoryId === category.id
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="text-xl sm:text-2xl">{category.icon}</span>
                  <span className="text-sm sm:text-base font-medium text-slate-900">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm ring-1 ring-slate-100">
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Titre de la discussion <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Comment choisir le bon matériau pour une terrasse ?"
              maxLength={255}
              className="w-full rounded-lg border border-slate-200 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              required
            />
            <p className="mt-2 text-xs text-slate-500">
              {title.length}/255 caractères
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm ring-1 ring-slate-100">
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Décrivez votre question ou partagez votre expérience en détail..."
              rows={8}
              className="w-full rounded-lg border border-slate-200 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
              required
            />
            <p className="mt-2 text-xs text-slate-500">
              Minimum 10 caractères
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full border-2 border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedCategoryId || !title.trim() || !content.trim()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-sky-500 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {submitting ? "Publication..." : "Publier la discussion"}
            </button>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-6 sm:mt-8 bg-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100">
          <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Conseils pour une bonne discussion
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <svg className="h-4 w-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Choisissez un titre clair et descriptif</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="h-4 w-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Fournissez suffisamment de détails pour que les autres puissent vous aider</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="h-4 w-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Soyez respectueux et courtois avec les autres membres</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="h-4 w-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Utilisez la bonne catégorie pour faciliter la recherche</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function NewTopicPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-sky-500 border-t-transparent rounded-full"></div>
      </div>
    }>
      <NewTopicContent />
    </Suspense>
  );
}
