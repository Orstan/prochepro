"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

type Post = {
  id: number;
  content: string;
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  is_solution: boolean;
  likes_count: number;
  is_liked_by_user?: boolean;
  created_at: string;
};

type Topic = {
  id: number;
  title: string;
  slug: string;
  content: string;
  user: {
    id: number;
    name: string;
  };
  category: {
    id: number;
    name: string;
    slug: string;
  };
  is_locked: boolean;
  views_count: number;
  replies_count: number;
  created_at: string;
};

export default function TopicPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("prochepro_user");
    if (raw) {
      setUser(JSON.parse(raw));
    }
    if (slug) {
      fetchTopic();
    }
  }, [slug]);

  async function fetchTopic() {
    try {
      const token = localStorage.getItem("prochepro_token");
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/api/forum/topics/${slug}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setTopic(data.topic);
        setPosts(data.posts.data);
      }
    } catch (err) {
      // Error fetching topic
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyContent.trim() || !user) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem("prochepro_token");
      const res = await fetch(`${API_BASE_URL}/api/forum/topics/${topic?.id}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: replyContent }),
      });

      if (res.ok) {
        const newPost = await res.json();
        setPosts([...posts, newPost]);
        setReplyContent("");
        if (topic) {
          setTopic({ ...topic, replies_count: topic.replies_count + 1 });
        }
      }
    } catch (err) {
      // Error posting reply
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLike(postId: number) {
    if (!user) return;

    try {
      const token = localStorage.getItem("prochepro_token");
      const res = await fetch(`${API_BASE_URL}/api/forum/posts/${postId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, is_liked_by_user: data.is_liked, likes_count: data.likes_count }
            : post
        ));
      }
    } catch (err) {
      // Error liking post
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-sky-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Discussion introuvable</h2>
          <button
            onClick={() => router.push("/community")}
            className="text-sky-600 hover:text-sky-700"
          >
            Retour au forum
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] py-6 sm:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
          <button
            onClick={() => router.push("/community")}
            className="text-slate-600 hover:text-sky-600 transition-colors"
          >
            Forum
          </button>
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <button
            onClick={() => router.push(`/community/category/${topic.category.slug}`)}
            className="text-slate-600 hover:text-sky-600 transition-colors"
          >
            {topic.category.name}
          </button>
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-slate-900 font-medium truncate">{topic.title}</span>
        </div>

        {/* Topic Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm ring-1 ring-slate-100 mb-4">
          <div className="flex items-start gap-3 sm:gap-4 mb-4">
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-semibold text-sm sm:text-base">
              {topic.user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                {topic.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600">
                <span className="font-medium">{topic.user.name}</span>
                <span className="text-slate-400">•</span>
                <span>{formatDate(topic.created_at)}</span>
                <span className="text-slate-400">•</span>
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {topic.views_count} vues
                </span>
              </div>
            </div>
          </div>
          <div className="prose prose-slate max-w-none text-sm sm:text-base">
            <p className="whitespace-pre-wrap">{topic.content}</p>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-3 sm:space-y-4 mb-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className={`bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm ring-1 ${
                post.is_solution ? 'ring-emerald-200 bg-emerald-50/30' : 'ring-slate-100'
              }`}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                  {post.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <span className="font-semibold text-slate-900">{post.user.name}</span>
                      {post.is_solution && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Solution
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{formatDate(post.created_at)}</span>
                  </div>
                  <div className="prose prose-slate max-w-none text-sm sm:text-base mb-3">
                    <p className="whitespace-pre-wrap">{post.content}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleLike(post.id)}
                      disabled={!user}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        post.is_liked_by_user
                          ? 'bg-sky-100 text-sky-700'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <svg className="h-4 w-4" fill={post.is_liked_by_user ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      <span>{post.likes_count}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reply Form */}
        {user && !topic.is_locked ? (
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm ring-1 ring-slate-100">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">
              Répondre à cette discussion
            </h3>
            <form onSubmit={handleSubmitReply}>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Écrivez votre réponse..."
                rows={4}
                className="w-full rounded-lg border border-slate-200 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
                required
              />
              <div className="mt-3 sm:mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !replyContent.trim()}
                  className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? "Envoi..." : "Publier la réponse"}
                </button>
              </div>
            </form>
          </div>
        ) : topic.is_locked ? (
          <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 text-center">
            <svg className="h-8 w-8 text-slate-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-sm text-slate-600">Cette discussion est verrouillée</p>
          </div>
        ) : (
          <div className="bg-sky-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-sky-100 text-center">
            <p className="text-sm text-sky-700 mb-3">Connectez-vous pour répondre à cette discussion</p>
            <button
              onClick={() => router.push("/auth/login")}
              className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 transition-colors"
            >
              Se connecter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
