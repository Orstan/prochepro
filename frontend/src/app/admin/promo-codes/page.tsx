'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';

interface PromoCode {
  id: number;
  code: string;
  type: string;
  value: number;
  credits_amount: number | null;
  applies_to: string;
  package_id: number | null;
  max_uses: number | null;
  uses_count: number;
  max_uses_per_user: number;
  min_purchase_amount: number | null;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  description: string | null;
  created_at: string;
  creator: {
    id: number;
    name: string;
  };
}

interface Stats {
  total_codes: number;
  active_codes: number;
  total_uses: number;
  total_discount_given: number;
  total_credits_awarded: number;
}

export default function PromoCodesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    credits_amount: '',
    applies_to: 'all',
    max_uses: '',
    max_uses_per_user: '1',
    min_purchase_amount: '',
    valid_from: '',
    valid_until: '',
    description: '',
  });

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
      fetchPromoCodes();
      fetchStats();
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

  async function fetchPromoCodes() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/promo-codes`, {
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        setPromoCodes(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching promo codes:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/promo-codes/stats`, {
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

  async function generateCode() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/promo-codes/generate`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ prefix: 'PROMO', length: 8 }),
      });

      if (res.ok) {
        const data = await res.json();
        setFormData({ ...formData, code: data.code });
      }
    } catch (error) {
      console.error('Error generating code:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      ...formData,
      value: formData.value ? parseFloat(formData.value) : 0,
      credits_amount: formData.credits_amount ? parseInt(formData.credits_amount) : null,
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      max_uses_per_user: parseInt(formData.max_uses_per_user),
      min_purchase_amount: formData.min_purchase_amount ? parseFloat(formData.min_purchase_amount) : null,
      admin_id: user.id,
    };

    try {
      const url = editingCode
        ? `${API_BASE_URL}/api/admin/promo-codes/${editingCode.id}`
        : `${API_BASE_URL}/api/admin/promo-codes`;

      const res = await fetch(url, {
        method: editingCode ? 'PUT' : 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(editingCode ? 'Code promo mis à jour' : 'Code promo créé');
        setShowModal(false);
        setEditingCode(null);
        resetForm();
        fetchPromoCodes();
        fetchStats();
      } else {
        const error = await res.json();
        alert(error.message || 'Erreur');
      }
    } catch (error) {
      console.error('Error saving promo code:', error);
      alert('Erreur lors de la sauvegarde');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Supprimer ce code promo ?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/promo-codes/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ admin_id: user.id }),
      });

      if (res.ok) {
        alert('Code promo supprimé');
        fetchPromoCodes();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting promo code:', error);
    }
  }

  async function toggleActive(code: PromoCode) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/promo-codes/${code.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          is_active: !code.is_active,
          admin_id: user.id,
        }),
      });

      if (res.ok) {
        fetchPromoCodes();
      }
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  }

  function resetForm() {
    setFormData({
      code: '',
      type: 'percentage',
      value: '',
      credits_amount: '',
      applies_to: 'all',
      max_uses: '',
      max_uses_per_user: '1',
      min_purchase_amount: '',
      valid_from: '',
      valid_until: '',
      description: '',
    });
  }

  function openEditModal(code: PromoCode) {
    setEditingCode(code);
    setFormData({
      code: code.code,
      type: code.type,
      value: code.value.toString(),
      credits_amount: code.credits_amount?.toString() || '',
      applies_to: code.applies_to,
      max_uses: code.max_uses?.toString() || '',
      max_uses_per_user: code.max_uses_per_user.toString(),
      min_purchase_amount: code.min_purchase_amount?.toString() || '',
      valid_from: code.valid_from ? code.valid_from.split('T')[0] : '',
      valid_until: code.valid_until ? code.valid_until.split('T')[0] : '',
      description: code.description || '',
    });
    setShowModal(true);
  }

  const typeLabels = {
    percentage: 'Pourcentage',
    fixed: 'Montant fixe',
    credits: 'Crédits',
    free_credits: 'Crédits gratuits',
  };

  if (loading) {
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
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Codes promo</h1>
              <p className="text-sm md:text-base text-slate-600 mt-1">
                Gérer les codes de réduction et bonus
              </p>
            </div>

            <button
              onClick={() => {
                setEditingCode(null);
                resetForm();
                setShowModal(true);
              }}
              className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              + Créer un code
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-slate-600 mb-1">Total codes</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total_codes}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-green-600 mb-1">Actifs</p>
              <p className="text-2xl font-bold text-green-600">{stats.active_codes}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-blue-600 mb-1">Utilisations</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total_uses}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-purple-600 mb-1">Réductions</p>
              <p className="text-2xl font-bold text-purple-600">{stats.total_discount_given.toFixed(0)}€</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-orange-600 mb-1">Crédits donnés</p>
              <p className="text-2xl font-bold text-orange-600">{stats.total_credits_awarded}</p>
            </div>
          </div>
        )}

        {/* Promo Codes List */}
        <div className="space-y-3">
          {promoCodes.map((code) => (
            <div
              key={code.id}
              className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-bold text-slate-900">{code.code}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      code.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {code.is_active ? 'Actif' : 'Inactif'}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {typeLabels[code.type as keyof typeof typeLabels]}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-slate-600">Valeur: </span>
                      <span className="font-semibold text-slate-900">
                        {code.type === 'percentage' ? `${code.value}%` : 
                         code.type === 'fixed' ? `${code.value}€` :
                         `${code.credits_amount} crédits`}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">Utilisations: </span>
                      <span className="font-semibold text-slate-900">
                        {code.uses_count}{code.max_uses ? `/${code.max_uses}` : ''}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">Par utilisateur: </span>
                      <span className="font-semibold text-slate-900">{code.max_uses_per_user}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Créé par: </span>
                      <span className="font-semibold text-slate-900">{code.creator.name}</span>
                    </div>
                  </div>

                  {code.description && (
                    <p className="text-sm text-slate-600 mt-2">{code.description}</p>
                  )}

                  {(code.valid_from || code.valid_until) && (
                    <p className="text-xs text-slate-500 mt-2">
                      Valide du {code.valid_from ? new Date(code.valid_from).toLocaleDateString('fr-FR') : '...'} 
                      {' '}au {code.valid_until ? new Date(code.valid_until).toLocaleDateString('fr-FR') : '...'}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => toggleActive(code)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      code.is_active
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {code.is_active ? 'Désactiver' : 'Activer'}
                  </button>
                  <button
                    onClick={() => openEditModal(code)}
                    className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(code.id)}
                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}

          {promoCodes.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <p className="text-slate-600">Aucun code promo créé</p>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(false)}>
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900">
                    {editingCode ? 'Modifier le code promo' : 'Créer un code promo'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        required
                        disabled={!!editingCode}
                      />
                      {!editingCode && (
                        <button
                          type="button"
                          onClick={generateCode}
                          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                        >
                          Générer
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                        required
                      >
                        <option value="percentage">Pourcentage</option>
                        <option value="fixed">Montant fixe</option>
                        <option value="credits">Crédits</option>
                        <option value="free_credits">Crédits gratuits</option>
                      </select>
                    </div>

                    {(formData.type === 'percentage' || formData.type === 'fixed') && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Valeur {formData.type === 'percentage' ? '(%)' : '(€)'}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.value}
                          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                          required
                        />
                      </div>
                    )}

                    {(formData.type === 'credits' || formData.type === 'free_credits') && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de crédits</label>
                        <input
                          type="number"
                          value={formData.credits_amount}
                          onChange={(e) => setFormData({ ...formData, credits_amount: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                          required
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">S'applique à</label>
                    <select
                      value={formData.applies_to}
                      onChange={(e) => setFormData({ ...formData, applies_to: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                      required
                    >
                      <option value="all">Tout</option>
                      <option value="client_credits">Crédits client</option>
                      <option value="prestataire_credits">Crédits prestataire</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Utilisations max (vide = illimité)</label>
                      <input
                        type="number"
                        value={formData.max_uses}
                        onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Max par utilisateur</label>
                      <input
                        type="number"
                        value={formData.max_uses_per_user}
                        onChange={(e) => setFormData({ ...formData, max_uses_per_user: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Montant minimum d'achat (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.min_purchase_amount}
                      onChange={(e) => setFormData({ ...formData, min_purchase_amount: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Valide à partir de</label>
                      <input
                        type="date"
                        value={formData.valid_from}
                        onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Valide jusqu'à</label>
                      <input
                        type="date"
                        value={formData.valid_until}
                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                    >
                      {editingCode ? 'Mettre à jour' : 'Créer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
