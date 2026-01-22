'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';

interface Ticket {
  id: number;
  user_id: number;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  assigned_to?: number;
  assignedTo?: {
    id: number;
    name: string;
  };
}

interface Stats {
  total: number;
  new: number;
  open: number;
  resolved: number;
  closed: number;
  high_priority: number;
  unassigned: number;
}

export default function AdminSupportPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

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
      fetchTickets();
    } catch {
      router.replace('/auth/login');
    }
  }, [router]);

  function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('prochepro_token');
    return token
      ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' };
  }

  async function fetchStats() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/support/stats`, {
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }

  async function fetchTickets() {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/api/support/tickets`;
      if (filter !== 'all') {
        url += `?status=${filter}`;
      }

      const res = await fetch(url, {
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        setTickets(data.data || data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [filter]);

  async function handleStatusChange(ticketId: number, newStatus: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/support/tickets/${ticketId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchTickets();
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  }

  function getStatusBadge(status: string) {
    const styles = {
      new: 'bg-blue-100 text-blue-800',
      open: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-purple-100 text-purple-800',
      closed: 'bg-slate-100 text-slate-600',
    };
    const labels = {
      new: 'Nouveau',
      open: 'Ouvert',
      pending: 'En attente',
      resolved: 'Résolu',
      closed: 'Fermé',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[status as keyof typeof styles] || styles.closed}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  }

  function getPriorityBadge(priority: string) {
    const styles = {
      low: 'bg-slate-100 text-slate-600',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700',
    };
    const labels = {
      low: 'Faible',
      medium: 'Moyen',
      high: 'Élevé',
      critical: 'Critique',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[priority as keyof typeof styles] || styles.medium}`}>
        {labels[priority as keyof typeof labels] || priority}
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
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Support Tickets</h1>
              <p className="text-sm md:text-base text-slate-600 mt-1">
                Gérez les demandes de support des utilisateurs
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-slate-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-blue-600 mb-1">Nouveaux</p>
              <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-green-600 mb-1">Ouverts</p>
              <p className="text-2xl font-bold text-green-600">{stats.open}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-purple-600 mb-1">Résolus</p>
              <p className="text-2xl font-bold text-purple-600">{stats.resolved}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-slate-600 mb-1">Fermés</p>
              <p className="text-2xl font-bold text-slate-600">{stats.closed}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-orange-600 mb-1">Priorité haute</p>
              <p className="text-2xl font-bold text-orange-600">{stats.high_priority}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-red-600 mb-1">Non assignés</p>
              <p className="text-2xl font-bold text-red-600">{stats.unassigned}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilter('new')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'new'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Nouveaux
            </button>
            <button
              onClick={() => setFilter('open')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'open'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Ouverts
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              En attente
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'resolved'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Résolus
            </button>
          </div>
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-12 w-12 border-4 border-sky-500 border-t-transparent rounded-full"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 text-center">
            <p className="text-slate-600">Aucun ticket trouvé</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-xl shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 
                          onClick={() => router.push(`/admin/support/${ticket.id}`)}
                          className="text-base md:text-lg font-semibold text-slate-900 hover:text-sky-600 cursor-pointer truncate"
                        >
                          {ticket.subject}
                        </h3>
                        <p className="text-sm text-slate-600 line-clamp-2 mt-1">{ticket.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-medium text-slate-700">{ticket.user.name}</span>
                      <span>•</span>
                      <span>{ticket.user.email}</span>
                      <span>•</span>
                      <span>{new Date(ticket.created_at).toLocaleDateString('fr-FR')}</span>
                      <span>•</span>
                      <span className="px-2 py-1 bg-slate-100 rounded-full">
                        {ticket.category === 'technical' ? 'Technique' :
                         ticket.category === 'payment' ? 'Paiement' :
                         ticket.category === 'account' ? 'Compte' :
                         ticket.category === 'task' ? 'Tâche' : 'Autre'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 md:items-end">
                    <div className="flex flex-wrap gap-2">
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                    </div>

                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                      className="text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="new">Nouveau</option>
                      <option value="open">Ouvert</option>
                      <option value="pending">En attente</option>
                      <option value="resolved">Résolu</option>
                      <option value="closed">Fermé</option>
                    </select>

                    <button
                      onClick={() => router.push(`/admin/support/${ticket.id}`)}
                      className="text-xs px-4 py-1.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                    >
                      Voir détails
                    </button>
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
