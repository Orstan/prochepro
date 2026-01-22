"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getArticleBySlug, BLOG_ARTICLES, BLOG_CATEGORIES } from "@/lib/blog-articles";
import { sanitizeHtml } from "@/lib/sanitize";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.prochepro.fr";

interface Article {
  id: number;
  title: string;
  meta_title?: string;
  meta_description?: string;
  slug: string;
  excerpt?: string;
  content: string;
  category?: string;
  keywords?: string[];
  published_at?: string;
  author?: { id: number; name: string };
}

// Simple Markdown to HTML converter
function parseMarkdown(markdown: string): string {
  let html = markdown;
  
  // Escape existing HTML
  // html = html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  // Headers (must be done before other replacements)
  html = html.replace(/^### (.+)$/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gim, '<h1>$1</h1>');
  
  // Bold (before italic to handle ** correctly)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Italic (single asterisk, but not part of **)
  // First replace bold placeholders, then italic, then restore bold
  html = html.replace(/<strong>/g, '___BOLD_START___');
  html = html.replace(/<\/strong>/g, '___BOLD_END___');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/___BOLD_START___/g, '<strong>');
  html = html.replace(/___BOLD_END___/g, '</strong>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Horizontal rule
  html = html.replace(/^---$/gim, '<hr />');
  
  // Lists - more complex handling
  const lines = html.split('\n');
  let inList = false;
  let processedLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.match(/^\* (.+)$/)) {
      if (!inList) {
        processedLines.push('<ul>');
        inList = true;
      }
      processedLines.push(line.replace(/^\* (.+)$/, '<li>$1</li>'));
    } else {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      processedLines.push(line);
    }
  }
  
  if (inList) {
    processedLines.push('</ul>');
  }
  
  html = processedLines.join('\n');
  
  // Paragraphs - split by double newlines
  html = html.split('\n\n').map(block => {
    // Don't wrap headers, lists, or hr in <p>
    if (block.match(/^<(h[1-6]|ul|ol|hr)/)) {
      return block;
    }
    // Don't wrap if already has block tags
    if (block.trim().length === 0) {
      return '';
    }
    return `<p>${block.trim()}</p>`;
  }).join('\n');
  
  return html;
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  keywords: string[];
  image: string | null;
  reading_time: number;
  published_at: string;
  author?: { id: number; name: string };
  created_at: string;
  updated_at: string;
}

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

export default function BlogArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      try {
        const [postRes, catsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/blog/posts/${slug}`),
          fetch(`${API_BASE_URL}/api/blog/categories`),
        ]);

        if (postRes.ok && catsRes.ok) {
          const postData = await postRes.json();
          const catsData = await catsRes.json();
          setPost(postData);
          setCategories(catsData);
        } else {
          // Fallback to static data
          const staticArticle = getArticleBySlug(slug);
          if (staticArticle) {
            setPost({
              id: 0,
              title: staticArticle.title,
              slug: staticArticle.slug,
              excerpt: staticArticle.excerpt,
              content: staticArticle.content,
              category: staticArticle.category,
              keywords: staticArticle.keywords,
              image: null,
              reading_time: staticArticle.readingTime,
              published_at: staticArticle.publishedAt,
              author: { id: 0, name: staticArticle.author.name },
              created_at: staticArticle.publishedAt,
              updated_at: staticArticle.updatedAt,
            });
            setCategories(BLOG_CATEGORIES.map((c, i) => ({ id: i, ...c, sort_order: i })));
          } else {
            setNotFound(true);
          }
        }
      } catch (error) {
        // Fallback to static data on error
        const staticArticle = getArticleBySlug(slug);
        if (staticArticle) {
          setPost({
            id: 0,
            title: staticArticle.title,
            slug: staticArticle.slug,
            excerpt: staticArticle.excerpt,
            content: staticArticle.content,
            category: staticArticle.category,
            keywords: staticArticle.keywords,
            image: null,
            reading_time: staticArticle.readingTime,
            published_at: staticArticle.publishedAt,
            author: { id: 0, name: staticArticle.author.name },
            created_at: staticArticle.publishedAt,
            updated_at: staticArticle.updatedAt,
          });
          setCategories(BLOG_CATEGORIES.map((c, i) => ({ id: i, ...c, sort_order: i })));
        } else {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-sky-500 border-t-transparent rounded-full mx-auto"></div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Article non trouvé</h1>
        <p className="mt-2 text-slate-600">Cet article n&apos;existe pas.</p>
        <Link href="/blog" className="mt-4 inline-block text-[#1E88E5] hover:underline">
          Retour au blog
        </Link>
      </div>
    );
  }

  const category = categories.find(c => c.slug === post.category);
  
  // Related articles (same category, excluding current) - from static for now
  const relatedArticles = BLOG_ARTICLES
    .filter(a => a.category === post.category && a.slug !== post.slug)
    .slice(0, 3);

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "author": {
      "@type": "Person",
      "name": post.author?.name || "Équipe ProchePro",
    },
    "publisher": {
      "@type": "Organization",
      "name": "ProchePro",
      "url": "https://prochepro.fr",
    },
    "datePublished": post.published_at,
    "dateModified": post.updated_at,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://prochepro.fr/blog/${post.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm text-slate-500">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-[#1E88E5]">Accueil</Link></li>
            <li>/</li>
            <li><Link href="/blog" className="hover:text-[#1E88E5]">Blog</Link></li>
            <li>/</li>
            <li className="text-slate-900 font-medium truncate max-w-[200px]">{post.title}</li>
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href={`/blog/categorie/${post.category}`}
              className="inline-flex items-center gap-1 rounded-full bg-[#E3F2FD] px-3 py-1 text-xs font-medium text-[#1E88E5] hover:bg-[#BBDEFB]"
            >
              {category?.icon} {category?.name}
            </Link>
            <span className="text-sm text-slate-500">
              {post.reading_time} min de lecture
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {post.title}
          </h1>

          <p className="text-lg text-slate-600 mb-6">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-[#1E88E5] flex items-center justify-center text-white font-semibold">
                {(post.author?.name || "P").charAt(0)}
              </div>
              <div>
                <div className="font-medium text-slate-900">{post.author?.name || "Équipe ProchePro"}</div>
                <div className="text-xs">Expert</div>
              </div>
            </div>
            <span>•</span>
            <time dateTime={post.published_at}>
              {new Date(post.published_at).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
            {post.updated_at !== post.published_at && (
              <>
                <span>•</span>
                <span>Mis à jour le {new Date(post.updated_at).toLocaleDateString("fr-FR")}</span>
              </>
            )}
          </div>
        </header>

        {/* Featured Image */}
        {post.image && (
          <div className="mb-10 rounded-2xl overflow-hidden">
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Content */}
        <div 
          className="prose prose-slate prose-lg max-w-none mb-12
            prose-headings:font-bold prose-headings:text-slate-900
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-slate-600 prose-p:leading-relaxed
            prose-a:text-[#1E88E5] prose-a:no-underline hover:prose-a:underline
            prose-strong:text-slate-900
            prose-ul:text-slate-600 prose-ol:text-slate-600
            prose-li:my-1
            prose-table:text-sm
            prose-th:bg-slate-100 prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold
            prose-td:px-4 prose-td:py-2 prose-td:border-b prose-td:border-slate-100"
          dangerouslySetInnerHTML={{ 
            __html: sanitizeHtml(post.content.includes('<') ? post.content : parseMarkdown(post.content))
          }}
        />

        {/* Keywords */}
        {post.keywords && post.keywords.length > 0 && (
          <div className="mb-12">
            <h3 className="text-sm font-medium text-slate-500 mb-3">Mots-clés</h3>
            <div className="flex flex-wrap gap-2">
              {post.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="rounded-2xl bg-gradient-to-br from-[#1E88E5] to-[#1565C0] p-8 text-center text-white mb-12">
          <h2 className="text-xl font-bold mb-3">
            Besoin d&apos;un professionnel ?
          </h2>
          <p className="text-white/80 mb-6">
            Publiez votre demande gratuitement et recevez des devis de prestataires vérifiés.
          </p>
          <Link
            href="/tasks/new"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#1E88E5] shadow-lg hover:bg-slate-50 transition"
          >
            Publier une demande gratuite
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-6">
              Articles similaires
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {relatedArticles.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100 hover:shadow-md transition"
                >
                  <h3 className="font-semibold text-slate-900 group-hover:text-[#1E88E5] mb-2 line-clamp-2">
                    {related.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2">
                    {related.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
