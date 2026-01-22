'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';
interface Campaign {
  id: number;
  name: string;
  type: string;
  status: string;
  subject: string | null;
  message: string;
  target_audience: string;
  scheduled_at: string | null;
  sent_at: string | null;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  opened_count: number;
  clicked_count: number;
  created_at: string;
  creator: {
    id: number;
    name: string;
  };
}
interface Stats {
  total_campaigns: number;
  draft_campaigns: number;
  scheduled_campaigns: number;
  sent_campaigns: number;
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  average_open_rate: number;
  average_click_rate: number;
}
export default function CampaignsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'email',
    subject: '',
    message: '',
    push_url: '',
    promo_code: '',
    target_audience: 'all',
    scheduled_at: '',
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
      fetchCampaigns();
      fetchStats();
    } catch {
      router.replace('/auth/login');
    }
  }, [router]);
  function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('prochepro_token');
    return token
      ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' }
      : { 'Content-Type': 'application/json' };
  }
  async function fetchCampaigns() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/campaigns`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.data || []);
      }
    } catch (error) {
      // Error fetching campaigns
    } finally {
      setLoading(false);
    }
  }
  async function fetchStats() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/campaigns/stats`, {
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
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...formData,
      admin_id: user.id,
    };
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/campaigns`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert('Campagne créée avec succès');
        setShowModal(false);
        resetForm();
        fetchCampaigns();
        fetchStats();
      } else {
        const error = await res.json();
        alert(error.message || 'Erreur');
      }
    } catch (error) {
      alert('Erreur lors de la création');
    }
  }
  async function handleSend(campaign: Campaign) {
    if (!confirm('Envoyer cette campagne maintenant ?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/campaigns/${campaign.id}/send`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ admin_id: user.id }),
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Campagne envoyée: ${data.sent_count} envois, ${data.failed_count} échecs`);
        fetchCampaigns();
        fetchStats();
      } else {
        alert('Erreur lors de l\'envoi');
      }
    } catch (error) {
      alert('Erreur lors de l\'envoi');
    }
  }
  async function handleDelete(campaignId: number) {
    if (!confirm('Supprimer cette campagne ?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ admin_id: user.id }),
      });
      if (res.ok) {
        alert('Campagne supprimée');
        fetchCampaigns();
        fetchStats();
      }
    } catch (error) {
      // Error deleting campaign
    }
  }
  function resetForm() {
    setFormData({
      name: '',
      type: 'email',
      subject: '',
      message: '',
      push_url: '',
      promo_code: '',
      target_audience: 'all',
      scheduled_at: '',
    });
  }
  const statusLabels = {
    draft: 'Brouillon',
    scheduled: 'Planifiée',
    sending: 'En cours',
    sent: 'Envoyée',
    cancelled: 'Annulée',
  };
  const typeLabels = {
    email: 'Email',
    push: 'Push',
    both: 'Email + Push',
  };
  const audienceLabels = {
    all: 'Tous',
    clients: 'Clients',
    prestataires: 'Prestataires',
    verified: 'Vérifiés',
    custom: 'Personnalisé',
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
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Campagnes</h1>
              <p className="text-sm md:text-base text-slate-600 mt-1">Gérer les campagnes email et push</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              + Créer une campagne
            </button>
          </div>
        </div>
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-slate-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total_campaigns}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-orange-600 mb-1">Brouillons</p>
              <p className="text-2xl font-bold text-orange-600">{stats.draft_campaigns}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-blue-600 mb-1">Planifiées</p>
              <p className="text-2xl font-bold text-blue-600">{stats.scheduled_campaigns}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-green-600 mb-1">Envoyées</p>
              <p className="text-2xl font-bold text-green-600">{stats.sent_campaigns}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-purple-600 mb-1">Total envois</p>
              <p className="text-2xl font-bold text-purple-600">{stats.total_sent}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-emerald-600 mb-1">Taux d'ouverture</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.average_open_rate.toFixed(1)}%</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-cyan-600 mb-1">Taux de clic</p>
              <p className="text-2xl font-bold text-cyan-600">{stats.average_click_rate.toFixed(1)}%</p>
            </div>
          </div>
        )}
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-bold text-slate-900">{campaign.name}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'sending' ? 'bg-blue-100 text-blue-800' :
                      campaign.status === 'scheduled' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {statusLabels[campaign.status as keyof typeof statusLabels]}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-sky-100 text-sky-800">
                      {typeLabels[campaign.type as keyof typeof typeLabels]}
                    </span>
                  </div>
                  {campaign.subject && (
                    <p className="text-sm font-medium text-slate-700 mb-1">{campaign.subject}</p>
                  )}
                  <p className="text-sm text-slate-600 line-clamp-2 mb-2">{campaign.message}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-slate-600">Audience: </span>
                      <span className="font-semibold text-slate-900">
                        {audienceLabels[campaign.target_audience as keyof typeof audienceLabels]}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">Destinataires: </span>
                      <span className="font-semibold text-slate-900">{campaign.total_recipients}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Envoyés: </span>
                      <span className="font-semibold text-green-600">{campaign.sent_count}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Ouverts: </span>
                      <span className="font-semibold text-blue-600">
                        {campaign.opened_count} ({campaign.sent_count > 0 ? ((campaign.opened_count / campaign.sent_count) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  {campaign.scheduled_at && (
                    <p className="text-xs text-slate-500 mt-2">
                      Planifiée pour: {new Date(campaign.scheduled_at).toLocaleString('fr-FR')}
                    </p>
                  )}
                  {campaign.sent_at && (
                    <p className="text-xs text-slate-500 mt-2">
                      Envoyée le: {new Date(campaign.sent_at).toLocaleString('fr-FR')}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
                    <button
                      onClick={() => handleSend(campaign)}
                      className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                    >
                      Envoyer
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(campaign.id)}
                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
          {campaigns.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              Aucune campagne. Créez-en une pour commencer.
            </div>
          )}
        </div>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold mb-4">Créer une campagne</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nom</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="email">Email</option>
                    <option value="push">Push</option>
                    <option value="both">Email + Push</option>
                  </select>
                </div>
                {(formData.type === 'email' || formData.type === 'both') && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Sujet</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                {(formData.type === 'push' || formData.type === 'both') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        🎁 Code promo (optionnel)
                      </label>
                      <input
                        type="text"
                        placeholder="ex: PROMO20"
                        value={formData.promo_code}
                        onChange={(e) => setFormData({...formData, promo_code: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                      <p className="text-xs text-slate-500 mt-1">Le code sera affiché dans la notification push</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        🔗 URL de redirection (optionnel)
                      </label>
                      <input
                        type="text"
                        placeholder="ex: /promotions ou /tasks"
                        value={formData.push_url}
                        onChange={(e) => setFormData({...formData, push_url: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                      <p className="text-xs text-slate-500 mt-1">Vers quelle page rediriger lors du clic</p>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1">Audience</label>
                  <select
                    value={formData.target_audience}
                    onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="all">Tous</option>
                    <option value="clients">Clients</option>
                    <option value="prestataires">Prestataires</option>
                    <option value="verified">Vérifiés</option>
                    <option value="custom">Personnalisé</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                  >
                    Créer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}