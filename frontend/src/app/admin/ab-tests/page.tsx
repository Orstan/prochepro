'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';

interface AbTest {
  id: number;
  name: string;
  key: string;
  description?: string;
  variants: string[];
  is_active: boolean;
  started_at: string;
  ended_at?: string;
  created_at: string;
}

interface AbTestResults {
  test_id: number;
  test_name: string;
  total_participants: number;
  variant_stats: {
    [key: string]: {
      participants: number;
      conversions: number;
      conversion_rate: number;
    };
  };
}

export default function AbTestsAdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tests, setTests] = useState<AbTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<AbTest | null>(null);
  const [testResults, setTestResults] = useState<AbTestResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    variants: ['A', 'B'],
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
      fetchTests();
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

  async function fetchTests() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/ab-tests`, {
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        setTests(data);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadTestResults(testId: number) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/ab-tests/${testId}/results`, {
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        setTestResults(data);
      }
    } catch (error) {
      console.error('Error loading test results:', error);
    }
  }

  async function handleCreateTest(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/ab-tests`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setFormData({ name: '', key: '', description: '', variants: ['A', 'B'] });
        fetchTests();
        alert('Test A/B créé avec succès !');
      } else {
        const error = await res.json();
        alert(error.message || 'Erreur lors de la création du test');
      }
    } catch (error) {
      console.error('Error creating test:', error);
      alert('Erreur de connexion au serveur');
    }
  }

  async function handleEndTest(testId: number) {
    if (!confirm('Êtes-vous sûr de vouloir terminer ce test ?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/ab-tests/${testId}/end`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        fetchTests();
        alert('Test terminé avec succès !');
      }
    } catch (error) {
      console.error('Error ending test:', error);
      alert('Erreur lors de la fin du test');
    }
  }

  function addVariant() {
    const nextLetter = String.fromCharCode(65 + formData.variants.length);
    setFormData({ ...formData, variants: [...formData.variants, nextLetter] });
  }

  function removeVariant(index: number) {
    if (formData.variants.length <= 2) {
      alert('Un test doit avoir au moins 2 variantes');
      return;
    }
    const newVariants = formData.variants.filter((_, i) => i !== index);
    setFormData({ ...formData, variants: newVariants });
  }

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
          {/* Back Button */}
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
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Tests A/B</h1>
              <p className="text-sm md:text-base text-slate-600 mt-1">
                Gérez vos expériences et optimisez votre plateforme
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 transition-colors shadow-sm"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Créer un test</span>
              <span className="sm:hidden">Nouveau</span>
            </button>
          </div>
        </div>

        {/* Tests List */}
        {tests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucun test A/B</h3>
            <p className="text-slate-600 mb-6">Créez votre premier test pour commencer à optimiser</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-700 transition-colors"
            >
              Créer un test
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tests.map((test) => (
              <div
                key={test.id}
                className="bg-white rounded-xl shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-lg font-semibold text-slate-900 truncate">{test.name}</h3>
                    <p className="text-xs md:text-sm text-slate-500 mt-1">Clé: {test.key}</p>
                  </div>
                  {test.is_active ? (
                    <span className="flex-shrink-0 ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Actif
                    </span>
                  ) : (
                    <span className="flex-shrink-0 ml-2 px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded-full">
                      Terminé
                    </span>
                  )}
                </div>

                {test.description && (
                  <p className="text-xs md:text-sm text-slate-600 mb-4 line-clamp-2">{test.description}</p>
                )}

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {test.variants.map((variant) => (
                    <span
                      key={variant}
                      className="px-2 py-1 text-xs bg-sky-50 text-sky-700 rounded"
                    >
                      Variante {variant}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => {
                      setSelectedTest(test);
                      loadTestResults(test.id);
                    }}
                    className="flex-1 px-3 py-2 text-xs md:text-sm font-medium text-sky-600 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors"
                  >
                    Voir résultats
                  </button>
                  {test.is_active && (
                    <button
                      onClick={() => handleEndTest(test.id)}
                      className="flex-1 px-3 py-2 text-xs md:text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Terminer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 md:mb-6">
                  Créer un test A/B
                </h2>

                <form onSubmit={handleCreateTest} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nom du test
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm md:text-base"
                      placeholder="Ex: Test couleur bouton CTA"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Clé unique
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.key}
                      onChange={(e) => setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                      className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm md:text-base"
                      placeholder="Ex: cta_button_color"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Utilisée dans le code pour identifier le test
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Description (optionnel)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm md:text-base"
                      rows={3}
                      placeholder="Décrivez l'objectif de ce test..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Variantes
                    </label>
                    <div className="space-y-2">
                      {formData.variants.map((variant, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={variant}
                            onChange={(e) => {
                              const newVariants = [...formData.variants];
                              newVariants[index] = e.target.value;
                              setFormData({ ...formData, variants: newVariants });
                            }}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
                            placeholder={`Variante ${String.fromCharCode(65 + index)}`}
                          />
                          {formData.variants.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeVariant(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addVariant}
                      className="mt-2 text-sm text-sky-600 hover:text-sky-700 font-medium"
                    >
                      + Ajouter une variante
                    </button>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setFormData({ name: '', key: '', description: '', variants: ['A', 'B'] });
                      }}
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors"
                    >
                      Créer le test
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Results Modal */}
        {selectedTest && testResults && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 md:p-6">
                <div className="flex items-start justify-between mb-4 md:mb-6">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 truncate">
                      {selectedTest.name}
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                      {testResults.total_participants} participants
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTest(null);
                      setTestResults(null);
                    }}
                    className="flex-shrink-0 ml-2 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {Object.entries(testResults.variant_stats).map(([variant, stats]) => (
                    <div key={variant} className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base md:text-lg font-semibold text-slate-900">
                          Variante {variant}
                        </h3>
                        <span className="text-xl md:text-2xl font-bold text-sky-600">
                          {stats.conversion_rate.toFixed(2)}%
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600">Participants</p>
                          <p className="text-lg md:text-xl font-semibold text-slate-900">
                            {stats.participants}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600">Conversions</p>
                          <p className="text-lg md:text-xl font-semibold text-slate-900">
                            {stats.conversions}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setSelectedTest(null);
                    setTestResults(null);
                  }}
                  className="w-full mt-6 px-4 py-2.5 text-sm font-medium text-white bg-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
