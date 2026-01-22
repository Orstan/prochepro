"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BLOG_ARTICLES, BLOG_CATEGORIES } from "@/lib/blog-articles";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.prochepro.fr";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  keywords: string[];
  reading_time: number;
  published_at: string;
}

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

export default function BlogCategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [currentCategory, setCurrentCategory] = useState<BlogCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [useApi, setUseApi] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [categoryRes, categoriesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/blog/category/${slug}`),
          fetch(`${API_BASE_URL}/api/blog/categories`),
        ]);

        if (categoryRes.ok && categoriesRes.ok) {
          const categoryData = await categoryRes.json();
          const categoriesData = await categoriesRes.json();
          
          if (categoryData.category && categoryData.posts) {
            setCurrentCategory(categoryData.category);
            setPosts(categoryData.posts.data || []);
            setCategories(categoriesData);
          } else {
            setUseApi(false);
          }
        } else {
          setUseApi(false);
        }
      } catch {
        setUseApi(false);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  // Fallback to static data
  const staticCategory = BLOG_CATEGORIES.find(c => c.slug === slug);
  const staticArticles = BLOG_ARTICLES.filter(a => a.category === slug).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const category = useApi ? currentCategory : staticCategory;
  const articles = useApi 
    ? posts.map(p => ({
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        category: p.category,
        keywords: p.keywords || [],
        readingTime: p.reading_time,
        publishedAt: p.published_at,
      }))
    : staticArticles;
  const displayCategories = useApi 
    ? categories.map(c => ({ slug: c.slug, name: c.name, icon: c.icon }))
    : BLOG_CATEGORIES;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-sky-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Catégorie non trouvée</h1>
        <Link href="/blog" className="text-[#1E88E5] hover:underline">
          ← Retour au blog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link href="/blog" className="text-sm text-slate-500 hover:text-[#1E88E5]">
          ← Retour au blog
        </Link>
      </nav>

      {/* Header */}
      <header className="text-center mb-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-lg mb-4">
          <span className="text-2xl">{category.icon}</span>
          <span className="font-medium text-slate-700">{category.name}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Articles {category.name}
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          {articles.length} article{articles.length !== 1 ? "s" : ""} dans cette catégorie
        </p>
      </header>

      {/* Categories Navigation */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {displayCategories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/blog/categorie/${cat.slug}`}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm ring-1 transition ${
              cat.slug === slug
                ? "bg-[#1E88E5] text-white ring-[#1E88E5]"
                : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50 hover:text-[#1E88E5]"
            }`}
          >
            <span>{cat.icon}</span>
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-slate-50">
          <p className="text-slate-600 mb-4">Aucun article dans cette catégorie pour le moment.</p>
          <Link href="/blog" className="text-[#1E88E5] hover:underline">
            Voir tous les articles
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 hover:shadow-lg hover:ring-[#1E88E5]/20 transition"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {category.icon} {category.name}
                </span>
                <span className="text-xs text-slate-400">
                  {article.readingTime} min
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-[#1E88E5] transition line-clamp-2">
                {article.title}
              </h3>
              <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                {article.excerpt}
              </p>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  {new Date(article.publishedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="text-[#1E88E5] font-medium group-hover:underline">
                  Lire →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* SEO Content */}
      <section className="mt-16 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          À propos de la catégorie {category.name}
        </h2>
        <p className="text-slate-600 mb-4">
          Découvrez nos articles et guides pratiques sur le thème {category.name.toLowerCase()}. 
          Nos experts partagent leurs conseils, astuces et informations sur les prix pour vous aider 
          dans tous vos projets.
        </p>
        <div className="flex flex-wrap gap-2">
          {articles.flatMap(a => a.keywords).filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 10).map(keyword => (
            <span key={keyword} className="rounded-full bg-white px-3 py-1 text-xs text-slate-500 ring-1 ring-slate-200">
              {keyword}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
