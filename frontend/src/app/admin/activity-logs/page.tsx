'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';

interface ActivityLog {
  id: number;
  admin_id: number;
  action: string;
  entity_type: string;
  entity_id: number | null;
  description: string;
  old_values: any;
  new_values: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
  admin: {
    id: number;
    name: string;
    email: string;
  };
}

interface Stats {
  total_actions: number;
  by_action: Record<string, number>;
  by_entity: Record<string, number>;
  by_admin: Array<{
    admin_id: number;
    admin_name: string;
    count: number;
  }>;
  recent_actions: ActivityLog[];
}

export default function AdminActivityLogsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    admin_id: '',
    action: '',
    entity_type: '',
    date_from: '',
    date_to: '',
    search: '',
  });
  const [availableFilters, setAvailableFilters] = useState<any>(null);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

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
      fetchLogs();
      fetchAvailableFilters();
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
      const res = await fetch(`${API_BASE_URL}/api/admin/activity-logs/stats`, {
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

  async function fetchLogs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await fetch(`${API_BASE_URL}/api/admin/activity-logs?${params}`, {
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        setLogs(data.data || data);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAvailableFilters() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/activity-logs/filters`, {
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        setAvailableFilters(data);
      }
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  }

  async function handleExport() {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await fetch(`${API_BASE_URL}/api/admin/activity-logs/export?${params}`, {
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
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting logs:', error);
      alert('Erreur lors de l\'export');
    }
  }

  function getActionBadge(action: string) {
    const styles = {
      created: 'bg-green-100 text-green-800',
      updated: 'bg-blue-100 text-blue-800',
      deleted: 'bg-red-100 text-red-800',
      approved: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-orange-100 text-orange-800',
      banned: 'bg-red-100 text-red-800',
      unbanned: 'bg-green-100 text-green-800',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[action as keyof typeof styles] || 'bg-slate-100 text-slate-700'}`}>
        {action}
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
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Journaux d'activité</h1>
              <p className="text-sm md:text-base text-slate-600 mt-1">
                Historique des actions des administrateurs
              </p>
            </div>
            <button
              onClick={handleExport}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exporter CSV
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-slate-600 mb-1">Total (30j)</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total_actions}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-green-600 mb-1">Créations</p>
              <p className="text-2xl font-bold text-green-600">{stats.by_action.created || 0}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-blue-600 mb-1">Modifications</p>
              <p className="text-2xl font-bold text-blue-600">{stats.by_action.updated || 0}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-red-600 mb-1">Suppressions</p>
              <p className="text-2xl font-bold text-red-600">{stats.by_action.deleted || 0}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Filtres</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={filters.admin_id}
              onChange={(e) => setFilters({ ...filters, admin_id: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Tous les admins</option>
              {availableFilters?.admins?.map((admin: any) => (
                <option key={admin.id} value={admin.id}>{admin.name}</option>
              ))}
            </select>

            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Toutes les actions</option>
              {availableFilters?.actions?.map((action: string) => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>

            <select
              value={filters.entity_type}
              onChange={(e) => setFilters({ ...filters, entity_type: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Tous les types</option>
              {availableFilters?.entity_types?.map((type: string) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
              placeholder="Date de début"
            />

            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
              placeholder="Date de fin"
            />

            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
              placeholder="Rechercher..."
            />
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={fetchLogs}
              className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm hover:bg-sky-700 transition-colors"
            >
              Appliquer les filtres
            </button>
            <button
              onClick={() => {
                setFilters({ admin_id: '', action: '', entity_type: '', date_from: '', date_to: '', search: '' });
                setTimeout(fetchLogs, 100);
              }}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm hover:bg-slate-300 transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Logs List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-12 w-12 border-4 border-sky-500 border-t-transparent rounded-full"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 text-center">
            <p className="text-slate-600">Aucun journal trouvé</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900">{log.admin.name}</span>
                      {getActionBadge(log.action)}
                      <span className="text-xs text-slate-500">{log.entity_type}</span>
                    </div>
                    <p className="text-sm text-slate-600">{log.description}</p>
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                    {new Date(log.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                {log.ip_address && (
                  <p className="text-xs text-slate-400">IP: {log.ip_address}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedLog(null)}>
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900">Détails du journal</h2>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Admin</p>
                    <p className="text-sm text-slate-900">{selectedLog.admin.name} ({selectedLog.admin.email})</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-700">Action</p>
                    <p className="text-sm text-slate-900">{selectedLog.action}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-700">Type d'entité</p>
                    <p className="text-sm text-slate-900">{selectedLog.entity_type} #{selectedLog.entity_id}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-700">Description</p>
                    <p className="text-sm text-slate-900">{selectedLog.description}</p>
                  </div>

                  {selectedLog.old_values && Object.keys(selectedLog.old_values).length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">Anciennes valeurs</p>
                      <pre className="text-xs bg-slate-50 p-3 rounded-lg overflow-x-auto">
                        {JSON.stringify(selectedLog.old_values, null, 2)}
                      </pre>
                    </div>
                  )}

                  {selectedLog.new_values && Object.keys(selectedLog.new_values).length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">Nouvelles valeurs</p>
                      <pre className="text-xs bg-slate-50 p-3 rounded-lg overflow-x-auto">
                        {JSON.stringify(selectedLog.new_values, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-slate-700">IP Address</p>
                    <p className="text-sm text-slate-900">{selectedLog.ip_address}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-700">Date</p>
                    <p className="text-sm text-slate-900">
                      {new Date(selectedLog.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
