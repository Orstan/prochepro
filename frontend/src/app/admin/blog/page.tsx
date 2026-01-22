"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.prochepro.fr";

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
  published: boolean;
  published_at: string | null;
  author_id: number | null;
  author?: { id: number; name: string };
  created_at: string;
  updated_at: string;
}

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
  posts_count?: number;
}

export default function AdminBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [publishedFilter, setPublishedFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  // Modal states
  const [showPostModal, setShowPostModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  
  // Form states
  const [postForm, setPostForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    keywords: "",
    image: "",
    reading_time: 5,
    published: false,
  });
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    icon: "📝",
    sort_order: 0,
  });
  const [saving, setSaving] = useState(false);

  function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("prochepro_token");
    return token ? { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
  }

  const checkAdmin = useCallback(() => {
    const stored = localStorage.getItem("prochepro_user");
    if (!stored) {
      router.replace("/auth/login");
      return false;
    }
    try {
      const parsed = JSON.parse(stored);
      if (!parsed.is_admin) {
        router.replace("/dashboard");
        return false;
      }
      return true;
    } catch {
      router.replace("/auth/login");
      return false;
    }
  }, [router]);

  const fetchData = useCallback(async () => {
    const headers = getAuthHeaders();
    try {
      const [postsRes, categoriesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/blog/posts`, { headers }),
        fetch(`${API_BASE_URL}/api/admin/blog/categories`, { headers }),
      ]);
      
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData.data || []);
      }
      
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData || []);
      }
    } catch (err) {
      console.error("Error fetching blog data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (checkAdmin()) {
      fetchData();
    }
  }, [checkAdmin, fetchData]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Filter posts
  const filteredPosts = posts.filter((p) => {
    if (filter !== "all" && p.category !== filter) return false;
    if (publishedFilter === "published" && !p.published) return false;
    if (publishedFilter === "draft" && p.published) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Post CRUD
  function openNewPost() {
    setEditingPost(null);
    setPostForm({
      title: "",
      excerpt: "",
      content: "",
      category: categories[0]?.slug || "",
      keywords: "",
      image: "",
      reading_time: 5,
      published: false,
    });
    setShowPostModal(true);
  }

  function openEditPost(post: BlogPost) {
    setEditingPost(post);
    setPostForm({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      keywords: post.keywords?.join(", ") || "",
      image: post.image || "",
      reading_time: post.reading_time,
      published: post.published,
    });
    setShowPostModal(true);
  }

  async function savePost() {
    if (!postForm.title || !postForm.excerpt || !postForm.content || !postForm.category) {
      setToast({ message: "Veuillez remplir tous les champs obligatoires", type: "error" });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...postForm,
        keywords: postForm.keywords.split(",").map(k => k.trim()).filter(Boolean),
      };

      const url = editingPost 
        ? `${API_BASE_URL}/api/admin/blog/posts/${editingPost.id}`
        : `${API_BASE_URL}/api/admin/blog/posts`;
      
      const res = await fetch(url, {
        method: editingPost ? "PUT" : "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setToast({ message: editingPost ? "Article mis à jour" : "Article créé", type: "success" });
        setShowPostModal(false);
        fetchData();
      } else {
        const data = await res.json();
        setToast({ message: data.message || "Erreur lors de la sauvegarde", type: "error" });
      }
    } catch {
      setToast({ message: "Erreur de connexion", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function deletePost(id: number) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/blog/posts/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        setToast({ message: "Article supprimé", type: "success" });
        fetchData();
      } else {
        setToast({ message: "Erreur lors de la suppression", type: "error" });
      }
    } catch {
      setToast({ message: "Erreur de connexion", type: "error" });
    }
  }

  async function togglePublish(id: number) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/blog/posts/${id}/toggle-publish`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        setToast({ message: data.message, type: "success" });
        fetchData();
      }
    } catch {
      setToast({ message: "Erreur de connexion", type: "error" });
    }
  }

  // Category CRUD
  function openNewCategory() {
    setEditingCategory(null);
    setCategoryForm({ name: "", icon: "📝", sort_order: categories.length });
    setShowCategoryModal(true);
  }

  function openEditCategory(cat: BlogCategory) {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, icon: cat.icon, sort_order: cat.sort_order });
    setShowCategoryModal(true);
  }

  async function saveCategory() {
    if (!categoryForm.name) {
      setToast({ message: "Le nom est obligatoire", type: "error" });
      return;
    }

    setSaving(true);
    try {
      const url = editingCategory
        ? `${API_BASE_URL}/api/admin/blog/categories/${editingCategory.id}`
        : `${API_BASE_URL}/api/admin/blog/categories`;

      const res = await fetch(url, {
        method: editingCategory ? "PUT" : "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(categoryForm),
      });

      if (res.ok) {
        setToast({ message: editingCategory ? "Catégorie mise à jour" : "Catégorie créée", type: "success" });
        setShowCategoryModal(false);
        fetchData();
      } else {
        const data = await res.json();
        setToast({ message: data.message || "Erreur", type: "error" });
      }
    } catch {
      setToast({ message: "Erreur de connexion", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(id: number) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/blog/categories/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        setToast({ message: "Catégorie supprimée", type: "success" });
        fetchData();
      } else {
        const data = await res.json();
        setToast({ message: data.message || "Erreur", type: "error" });
      }
    } catch {
      setToast({ message: "Erreur de connexion", type: "error" });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-pink-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === "success" ? "bg-emerald-500" : "bg-rose-500"
        } text-white text-sm font-medium`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
        <div>
          <button 
            onClick={() => router.push("/admin")} 
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 mb-2 px-2 py-1 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Retour</span>
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Gestion du Blog</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openNewCategory}
            className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            + Catégorie
          </button>
          <button
            onClick={openNewPost}
            className="rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-pink-700"
          >
            + Nouvel article
          </button>
        </div>
      </div>

      {/* Categories Section */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold text-slate-900 mb-3">Catégories</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm"
            >
              <span>{cat.icon}</span>
              <span className="font-medium">{cat.name}</span>
              <span className="text-xs text-slate-400">({cat.posts_count || 0})</span>
              <button
                onClick={() => openEditCategory(cat)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✏️
              </button>
              <button
                onClick={() => deleteCategory(cat.id)}
                className="text-slate-400 hover:text-rose-500"
              >
                🗑️
              </button>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-slate-500">Aucune catégorie. Créez-en une pour commencer.</p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un article..."
          className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
        >
          <option value="all">Toutes catégories</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
        <select
          value={publishedFilter}
          onChange={(e) => setPublishedFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
        >
          <option value="all">Tous les statuts</option>
          <option value="published">Publiés</option>
          <option value="draft">Brouillons</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-6">
        <div className="rounded-xl bg-pink-50 p-3 md:p-4 text-center">
          <p className="text-xl md:text-2xl font-bold text-pink-700">{posts.length}</p>
          <p className="text-[10px] md:text-xs text-pink-600">Articles</p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-3 md:p-4 text-center">
          <p className="text-xl md:text-2xl font-bold text-emerald-700">
            {posts.filter(p => p.published).length}
          </p>
          <p className="text-[10px] md:text-xs text-emerald-600">Publiés</p>
        </div>
        <div className="rounded-xl bg-amber-50 p-3 md:p-4 text-center">
          <p className="text-xl md:text-2xl font-bold text-amber-700">
            {posts.filter(p => !p.published).length}
          </p>
          <p className="text-[10px] md:text-xs text-amber-600">Brouillons</p>
        </div>
        <div className="rounded-xl bg-blue-50 p-3 md:p-4 text-center">
          <p className="text-xl md:text-2xl font-bold text-blue-700">{categories.length}</p>
          <p className="text-[10px] md:text-xs text-blue-600">Catégories</p>
        </div>
      </div>

      {/* Articles List */}
      <div className="space-y-3">
        {filteredPosts.map((post) => {
          const category = categories.find((c) => c.slug === post.category);
          return (
            <div
              key={post.id}
              className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md transition"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      post.published ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {post.published ? "✓ Publié" : "⏳ Brouillon"}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                      {category?.icon} {category?.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {post.reading_time} min
                    </span>
                  </div>
                  <h3 className="font-medium text-slate-900 truncate">{post.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{post.excerpt}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.keywords?.slice(0, 3).map((kw) => (
                      <span key={kw} className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                        {kw}
                      </span>
                    ))}
                    {post.keywords && post.keywords.length > 3 && (
                      <span className="text-[10px] text-slate-400">+{post.keywords.length - 3}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    {new Date(post.created_at).toLocaleDateString("fr-FR")}
                  </span>
                  <button
                    onClick={() => togglePublish(post.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                      post.published 
                        ? "bg-amber-50 text-amber-700 hover:bg-amber-100" 
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    {post.published ? "Dépublier" : "Publier"}
                  </button>
                  <button
                    onClick={() => openEditPost(post)}
                    className="rounded-lg bg-pink-50 px-3 py-1.5 text-xs font-medium text-pink-700 hover:bg-pink-100"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12 rounded-2xl border border-slate-200 bg-white">
          <p className="text-slate-600 mb-4">Aucun article trouvé</p>
          <button
            onClick={openNewPost}
            className="text-pink-600 hover:text-pink-700 font-medium"
          >
            Créer votre premier article →
          </button>
        </div>
      )}

      {/* Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {editingPost ? "Modifier l'article" : "Nouvel article"}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Titre *</label>
                <input
                  type="text"
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
                  placeholder="Titre de l'article"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie *</label>
                <select
                  value={postForm.category}
                  onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Extrait *</label>
                <textarea
                  value={postForm.excerpt}
                  onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
                  rows={2}
                  placeholder="Court résumé de l'article (max 500 caractères)"
                  maxLength={500}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contenu *</label>
                <textarea
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-mono"
                  rows={10}
                  placeholder="Contenu de l'article (Markdown supporté)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={postForm.image}
                    onChange={(e) => setPostForm({ ...postForm, image: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Temps de lecture (min)</label>
                  <input
                    type="number"
                    value={postForm.reading_time}
                    onChange={(e) => setPostForm({ ...postForm, reading_time: parseInt(e.target.value) || 5 })}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
                    min={1}
                    max={60}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mots-clés SEO</label>
                <input
                  type="text"
                  value={postForm.keywords}
                  onChange={(e) => setPostForm({ ...postForm, keywords: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
                  placeholder="mot1, mot2, mot3 (séparés par des virgules)"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={postForm.published}
                  onChange={(e) => setPostForm({ ...postForm, published: e.target.checked })}
                  className="rounded border-slate-300"
                />
                <label htmlFor="published" className="text-sm text-slate-700">
                  Publier immédiatement
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowPostModal(false)}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Annuler
              </button>
              <button
                onClick={savePost}
                disabled={saving}
                className="rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-pink-700 disabled:opacity-50"
              >
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {editingCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
                  placeholder="Nom de la catégorie"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Icône (emoji)</label>
                <input
                  type="text"
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
                  placeholder="📝"
                  maxLength={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ordre d&apos;affichage</label>
                <input
                  type="number"
                  value={categoryForm.sort_order}
                  onChange={(e) => setCategoryForm({ ...categoryForm, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
                  min={0}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Annuler
              </button>
              <button
                onClick={saveCategory}
                disabled={saving}
                className="rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-pink-700 disabled:opacity-50"
              >
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEO Tips */}
      <div className="mt-8 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <h3 className="font-semibold text-slate-900 mb-3">💡 Conseils SEO pour le blog</h3>
        <ul className="space-y-2 text-sm text-slate-600">
          <li>• <strong>Titres:</strong> Incluez des mots-clés comme &quot;prix&quot;, &quot;2026&quot;, &quot;Paris&quot;</li>
          <li>• <strong>Longueur:</strong> Visez 1500-2500 mots par article</li>
          <li>• <strong>Structure:</strong> Utilisez H2, H3 et des listes pour la lisibilité</li>
          <li>• <strong>Liens internes:</strong> Liez vers vos pages de services</li>
          <li>• <strong>Mise à jour:</strong> Actualisez les prix et dates régulièrement</li>
        </ul>
      </div>
    </div>
  );
}
