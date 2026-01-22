"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BLOG_ARTICLES, BLOG_CATEGORIES } from "@/lib/blog-articles";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.prochepro.fr";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  reading_time: number;
  published_at: string;
}

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  icon: string;
  posts_count?: number;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [useApi, setUseApi] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [postsRes, categoriesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/blog/posts`),
          fetch(`${API_BASE_URL}/api/blog/categories`),
        ]);

        if (postsRes.ok && categoriesRes.ok) {
          const postsData = await postsRes.json();
          const categoriesData = await categoriesRes.json();
          
          if (postsData.data && postsData.data.length > 0) {
            setPosts(postsData.data);
            setCategories(categoriesData);
          } else {
            // Fallback to static data if no posts in DB
            setUseApi(false);
          }
        } else {
          setUseApi(false);
        }
      } catch {
        // Fallback to static data on error
        setUseApi(false);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Use API data or fallback to static
  const sortedArticles = useApi 
    ? posts.map(p => ({
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        category: p.category,
        readingTime: p.reading_time,
        publishedAt: p.published_at,
      }))
    : [...BLOG_ARTICLES].sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );

  const displayCategories = useApi 
    ? categories.map(c => ({ slug: c.slug, name: c.name, icon: c.icon }))
    : BLOG_CATEGORIES;

  const featuredArticle = sortedArticles[0];
  const otherArticles = sortedArticles.slice(1);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-sky-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Blog ProchePro
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Conseils, guides de prix et astuces pour tous vos projets de rénovation et services à domicile.
        </p>
      </header>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {displayCategories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/blog/categorie/${cat.slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 hover:text-[#1E88E5] transition"
          >
            <span>{cat.icon}</span>
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Featured Article */}
      {featuredArticle && (
        <section className="mb-12">
          <Link
            href={`/blog/${featuredArticle.slug}`}
            className="group block rounded-3xl bg-gradient-to-br from-[#1E88E5] to-[#1565C0] p-8 md:p-12 text-white shadow-xl hover:shadow-2xl transition"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                Article à la une
              </span>
              <span className="text-sm text-white/70">
                {new Date(featuredArticle.publishedAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 group-hover:underline">
              {featuredArticle.title}
            </h2>
            <p className="text-white/80 max-w-2xl mb-6">
              {featuredArticle.excerpt}
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/70">
                {featuredArticle.readingTime} min de lecture
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-medium">
                Lire l&apos;article
                <svg className="h-4 w-4 transition group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>
          </Link>
        </section>
      )}

      {/* Articles Grid */}
      <section>
        <h2 className="text-xl font-semibold text-slate-900 mb-6">
          Tous les articles
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {otherArticles.map((article) => {
            const category = displayCategories.find(c => c.slug === article.category);
            return (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 hover:shadow-lg hover:ring-[#1E88E5]/20 transition"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {category?.icon} {category?.name}
                  </span>
                  <span className="text-xs text-slate-400">
                    {article.readingTime} min
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 group-hover:text-[#1E88E5] mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-3 mb-4">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {new Date(article.publishedAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-sm font-medium text-[#1E88E5] group-hover:underline">
                    Lire →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 rounded-3xl bg-slate-50 p-8 md:p-12 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Besoin d&apos;un professionnel ?
        </h2>
        <p className="text-slate-600 max-w-xl mx-auto mb-6">
          Publiez votre demande gratuitement et recevez des devis de prestataires vérifiés près de chez vous.
        </p>
        <Link
          href="/tasks/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#1E88E5] px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-[#1565C0] transition"
        >
          Publier une demande gratuite
        </Link>
      </section>
    </div>
  );
}
