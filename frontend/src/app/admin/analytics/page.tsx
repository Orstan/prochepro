'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';

interface Stats {
  revenue: {
    total_revenue: number;
    total_transactions: number;
    average_transaction: number;
    revenue_by_period: Array<{ period: string; total: number; count: number }>;
  };
  user_growth: {
    total_users: number;
    new_users: number;
    clients_count: number;
    prestataires_count: number;
    verified_count: number;
    users_by_day: Array<{ date: string; count: number }>;
  };
  tasks: {
    total_tasks: number;
    new_tasks: number;
    tasks_by_status: Record<string, number>;
    tasks_by_category: Array<{ category: string; count: number }>;
    average_completion_hours: number;
  };
  engagement: {
    total_offers: number;
    accepted_offers: number;
    acceptance_rate: number;
    total_reviews: number;
    average_rating: number;
  };
  credits: {
    credits_by_action: Array<{ action: string; total: number; count: number }>;
    credits_by_type: Record<string, number>;
  };
  support: {
    total_tickets: number;
    new_tickets: number;
    tickets_by_status: Record<string, number>;
    average_response_hours: number;
    average_resolution_hours: number;
  };
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7days' | '30days' | '90days' | 'year'>('30days');
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'users' | 'tasks' | 'engagement'>('overview');

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
    } catch {
      router.replace('/auth/login');
    }
  }, [router, period]);

  function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('prochepro_token');
    return token
      ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' };
  }

  async function fetchStats() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/analytics/dashboard?period=${period}`, {
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }

  async function exportData(type: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/analytics/export?type=${type}&period=${period}`, {
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([atob(data.content)], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename;
        a.click();
      }
    } catch (error) {
      console.error('Error exporting:', error);
    }
  }

  const periodLabels = {
    '7days': '7 derniers jours',
    '30days': '30 derniers jours',
    '90days': '90 derniers jours',
    'year': 'Cette année',
  };

  if (loading || !stats) {
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
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Analytique avancée</h1>
              <p className="text-sm md:text-base text-slate-600 mt-1">
                Statistiques détaillées et rapports
              </p>
            </div>

            {/* Period Selector */}
            <div className="flex gap-2 flex-wrap">
              {(['7days', '30days', '90days', 'year'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    period === p
                      ? 'bg-sky-600 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {periodLabels[p]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-6 flex gap-2 overflow-x-auto">
          {[
            { id: 'overview', label: '📊 Vue d\'ensemble', icon: '📊' },
            { id: 'revenue', label: '💰 Revenus', icon: '💰' },
            { id: 'users', label: '👥 Utilisateurs', icon: '👥' },
            { id: 'tasks', label: '📋 Tâches', icon: '📋' },
            { id: 'engagement', label: '💬 Engagement', icon: '💬' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Revenue Overview */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">💰 Revenus</h2>
                <button
                  onClick={() => exportData('revenue')}
                  className="text-sm text-sky-600 hover:text-sky-700"
                >
                  📥 Exporter
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Total</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.revenue.total_revenue.toFixed(2)}€</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Transactions</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.revenue.total_transactions}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Moyenne</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.revenue.average_transaction.toFixed(2)}€</p>
                </div>
              </div>
            </div>

            {/* Users Overview */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">👥 Utilisateurs</h2>
                <button
                  onClick={() => exportData('users')}
                  className="text-sm text-sky-600 hover:text-sky-700"
                >
                  📥 Exporter
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Total</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.user_growth.total_users}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Nouveaux</p>
                  <p className="text-2xl font-bold text-green-600">{stats.user_growth.new_users}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Clients</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.user_growth.clients_count}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Prestataires</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.user_growth.prestataires_count}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Vérifiés</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.user_growth.verified_count}</p>
                </div>
              </div>
            </div>

            {/* Tasks Overview */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">📋 Tâches</h2>
                <button
                  onClick={() => exportData('tasks')}
                  className="text-sm text-sky-600 hover:text-sky-700"
                >
                  📥 Exporter
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Total</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.tasks.total_tasks}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Nouvelles</p>
                  <p className="text-2xl font-bold text-green-600">{stats.tasks.new_tasks}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">En cours</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.tasks.tasks_by_status.in_progress || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Complétées</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.tasks.tasks_by_status.completed || 0}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-slate-600">Temps moyen de complétion</p>
                <p className="text-xl font-bold text-slate-900">{stats.tasks.average_completion_hours.toFixed(1)} heures</p>
              </div>
            </div>

            {/* Engagement Overview */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">💬 Engagement</h2>
                <button
                  onClick={() => exportData('engagement')}
                  className="text-sm text-sky-600 hover:text-sky-700"
                >
                  📥 Exporter
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Offres</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.engagement.total_offers}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Acceptées</p>
                  <p className="text-2xl font-bold text-green-600">{stats.engagement.accepted_offers}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Taux d'acceptation</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.engagement.acceptance_rate}%</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Note moyenne</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.engagement.average_rating.toFixed(1)} ⭐</p>
                </div>
              </div>
            </div>

            {/* Support Overview */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">🎫 Support</h2>
                <button
                  onClick={() => exportData('support')}
                  className="text-sm text-sky-600 hover:text-sky-700"
                >
                  📥 Exporter
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Total tickets</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.support.total_tickets}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Nouveaux</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.support.new_tickets}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Temps de réponse</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.support.average_response_hours.toFixed(1)}h</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Temps de résolution</p>
                  <p className="text-2xl font-bold text-green-600">{stats.support.average_resolution_hours.toFixed(1)}h</p>
                </div>
              </div>
            </div>

            {/* Credits Overview */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">💳 Crédits</h2>
                <button
                  onClick={() => exportData('credits')}
                  className="text-sm text-sky-600 hover:text-sky-700"
                >
                  📥 Exporter
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-2">Par type</p>
                  {Object.entries(stats.credits.credits_by_type).map(([type, total]) => (
                    <div key={type} className="flex justify-between py-1">
                      <span className="text-sm text-slate-700 capitalize">{type}</span>
                      <span className="text-sm font-semibold text-slate-900">{total}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-2">Top actions</p>
                  {stats.credits.credits_by_action.slice(0, 5).map((item) => (
                    <div key={item.action} className="flex justify-between py-1">
                      <span className="text-sm text-slate-700">{item.action}</span>
                      <span className="text-sm font-semibold text-slate-900">{item.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Détails des revenus</h2>
            <div className="space-y-4">
              {stats.revenue.revenue_by_period.map((item) => (
                <div key={item.period} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{item.period}</p>
                    <p className="text-sm text-slate-600">{item.count} transactions</p>
                  </div>
                  <p className="text-xl font-bold text-green-600">{parseFloat(item.total.toString()).toFixed(2)}€</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Croissance des utilisateurs</h2>
            <div className="space-y-4">
              {stats.user_growth.users_by_day.map((item) => (
                <div key={item.date} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <p className="font-medium text-slate-900">{item.date}</p>
                  <p className="text-xl font-bold text-blue-600">+{item.count}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Par catégorie</h2>
              <div className="space-y-3">
                {stats.tasks.tasks_by_category.map((item) => (
                  <div key={item.category} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <p className="font-medium text-slate-900">{item.category}</p>
                    <p className="text-xl font-bold text-sky-600">{item.count}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Par statut</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.tasks.tasks_by_status).map(([status, count]) => (
                  <div key={status} className="p-4 bg-slate-50 rounded-lg text-center">
                    <p className="text-sm text-slate-600 capitalize mb-1">{status}</p>
                    <p className="text-2xl font-bold text-slate-900">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Engagement Tab */}
        {activeTab === 'engagement' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Métriques d'engagement</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <p className="text-sm text-blue-700 mb-2">Offres totales</p>
                <p className="text-4xl font-bold text-blue-900">{stats.engagement.total_offers}</p>
                <p className="text-sm text-blue-600 mt-2">
                  {stats.engagement.accepted_offers} acceptées ({stats.engagement.acceptance_rate}%)
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl">
                <p className="text-sm text-yellow-700 mb-2">Avis clients</p>
                <p className="text-4xl font-bold text-yellow-900">{stats.engagement.total_reviews}</p>
                <p className="text-sm text-yellow-600 mt-2">
                  Note moyenne: {stats.engagement.average_rating.toFixed(1)} ⭐
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
