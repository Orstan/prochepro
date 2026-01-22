'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';

interface FlaggedContent {
  id: number;
  type: 'task' | 'review' | 'message';
  content: string;
  description?: string;
  rating?: number;
  author: {
    id: number;
    name: string;
    email: string;
  };
  task?: {
    id: number;
    title: string;
  };
  is_flagged: boolean;
  flag_reason: string;
  flagged_at: string;
  flagged_by: {
    id: number;
    name: string;
  };
  is_approved: boolean;
  moderated_at: string | null;
  moderated_by: {
    id: number;
    name: string;
  } | null;
}

interface Stats {
  flagged_tasks: number;
  flagged_reviews: number;
  flagged_messages: number;
  total_flagged: number;
  moderated_today: number;
  pending_moderation: number;
}

export default function ModerationPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [content, setContent] = useState<FlaggedContent[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'task' | 'review' | 'message'>('all');
  const [selectedContent, setSelectedContent] = useState<FlaggedContent | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = window.localStorage.getItem('prochepro_user');
    if (!stored) {
      router.replace('/auth/login');
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      if (!parsed.is_admin) {
        alert('Accès refusé. Droits administrateur requis.');
        router.replace('/dashboard');
        return;
      }
      setUser(parsed);
      fetchStats();
      fetchContent();
    } catch {
      router.replace('/auth/login');
    }
  }, [router, filter]);

  function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('prochepro_token');
    return token
      ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' };
  }

  async function fetchStats() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/moderation/stats`, {
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      // Error fetching stats
    }
  }

  async function fetchContent() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/moderation?type=${filter}`, {
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        setContent(data.data || []);
      }
    } catch (error) {
      // Error fetching content
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(item: FlaggedContent) {
    if (!confirm('Approuver ce contenu ?')) return;

    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/moderation/approve`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          type: item.type,
          id: item.id,
          admin_id: user.id,
        }),
      });

      if (res.ok) {
        alert('Contenu approuvé');
        fetchContent();
        fetchStats();
        setSelectedContent(null);
      } else {
        alert('Erreur lors de l\'approbation');
      }
    } catch (error) {
      alert('Erreur lors de l\'approbation');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject(item: FlaggedContent, action: 'hide' | 'delete') {
    if (!confirm(`${action === 'delete' ? 'Supprimer' : 'Masquer'} ce contenu ?`)) return;

    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/moderation/reject`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          type: item.type,
          id: item.id,
          admin_id: user.id,
          action,
        }),
      });

      if (res.ok) {
        alert(action === 'delete' ? 'Contenu supprimé' : 'Contenu masqué');
        fetchContent();
        fetchStats();
        setSelectedContent(null);
      } else {
        alert('Erreur lors de l\'action');
      }
    } catch (error) {
      alert('Erreur lors de l\'action');
    } finally {
      setActionLoading(false);
    }
  }

  function getTypeBadge(type: string) {
    const styles = {
      task: 'bg-blue-100 text-blue-800',
      review: 'bg-purple-100 text-purple-800',
      message: 'bg-green-100 text-green-800',
    };
    const labels = {
      task: 'Tâche',
      review: 'Avis',
      message: 'Message',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[type as keyof typeof styles]}`}>
        {labels[type as keyof typeof labels]}
      </span>
    );
  }

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-12 w-12 border-4 border-sky-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-4 md:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors group"
          >
            <svg className="h-5 w-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Retour au tableau de bord</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Modération de contenu</h1>
              <p className="text-sm md:text-base text-slate-600 mt-1">
                Gérer le contenu signalé
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-slate-600 mb-1">Total signalé</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total_flagged}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-orange-600 mb-1">En attente</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pending_moderation}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-blue-600 mb-1">Tâches</p>
              <p className="text-2xl font-bold text-blue-600">{stats.flagged_tasks}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-purple-600 mb-1">Avis</p>
              <p className="text-2xl font-bold text-purple-600">{stats.flagged_reviews}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-green-600 mb-1">Messages</p>
              <p className="text-2xl font-bold text-green-600">{stats.flagged_messages}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-emerald-600 mb-1">Modéré aujourd'hui</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.moderated_today}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'task', 'review', 'message'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === type
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {type === 'all' ? 'Tout' : type === 'task' ? 'Tâches' : type === 'review' ? 'Avis' : 'Messages'}
              </button>
            ))}
          </div>
        </div>

        {/* Content List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-12 w-12 border-4 border-sky-500 border-t-transparent rounded-full"></div>
          </div>
        ) : content.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 text-center">
            <p className="text-slate-600">Aucun contenu signalé</p>
          </div>
        ) : (
          <div className="space-y-3">
            {content.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => setSelectedContent(item)}
                className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeBadge(item.type)}
                      <span className="text-sm font-semibold text-slate-900">{item.author.name}</span>
                      {item.moderated_at && (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                          Modéré
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 line-clamp-2">{item.content}</p>
                    {item.task && (
                      <p className="text-xs text-slate-500 mt-1">Tâche: {item.task.title}</p>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                    {new Date(item.flagged_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-orange-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{item.flag_reason}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedContent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedContent(null)}>
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900">Détails du contenu signalé</h2>
                  <button
                    onClick={() => setSelectedContent(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Type</p>
                    {getTypeBadge(selectedContent.type)}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-700">Auteur</p>
                    <p className="text-sm text-slate-900">{selectedContent.author.name} ({selectedContent.author.email})</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-700">Contenu</p>
                    <p className="text-sm text-slate-900 whitespace-pre-wrap">{selectedContent.content}</p>
                  </div>

                  {selectedContent.description && (
                    <div>
                      <p className="text-sm font-medium text-slate-700">Description</p>
                      <p className="text-sm text-slate-900 whitespace-pre-wrap">{selectedContent.description}</p>
                    </div>
                  )}

                  {selectedContent.rating && (
                    <div>
                      <p className="text-sm font-medium text-slate-700">Note</p>
                      <p className="text-sm text-slate-900">{selectedContent.rating}/5 ⭐</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-slate-700">Raison du signalement</p>
                    <p className="text-sm text-orange-600">{selectedContent.flag_reason}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-700">Signalé par</p>
                    <p className="text-sm text-slate-900">{selectedContent.flagged_by.name}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-700">Date du signalement</p>
                    <p className="text-sm text-slate-900">
                      {new Date(selectedContent.flagged_at).toLocaleString('fr-FR')}
                    </p>
                  </div>

                  {selectedContent.moderated_at && (
                    <>
                      <div>
                        <p className="text-sm font-medium text-slate-700">Modéré par</p>
                        <p className="text-sm text-slate-900">{selectedContent.moderated_by?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">Date de modération</p>
                        <p className="text-sm text-slate-900">
                          {new Date(selectedContent.moderated_at).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {!selectedContent.moderated_at && (
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => handleApprove(selectedContent)}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      ✓ Approuver
                    </button>
                    <button
                      onClick={() => handleReject(selectedContent, 'hide')}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                    >
                      👁️ Masquer
                    </button>
                    <button
                      onClick={() => handleReject(selectedContent, 'delete')}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
