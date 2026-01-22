'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'client' | 'prestataire';
  subscription?: {
    has_unlimited: boolean;
    unlimited_expires_at: string | null;
    balance: number;
  };
}

interface AnalyticsAccessGuardProps {
  children: React.ReactNode;
}

export default function AnalyticsAccessGuard({ children }: AnalyticsAccessGuardProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      // Get user from localStorage
      const userStr = localStorage.getItem('prochepro_user');
      if (!userStr) {
        console.log('[AnalyticsGuard] No user in localStorage, redirecting to login');
        router.push('/auth/login');
        return;
      }

      const userData = JSON.parse(userStr);
      console.log('[AnalyticsGuard] User data:', { id: userData.id, role: userData.role });
      
      // Check if user is a prestataire
      if (userData.role !== 'prestataire') {
        console.log('[AnalyticsGuard] User is not prestataire, denying access');
        setUser(userData);
        setLoading(false);
        setHasAccess(false);
        return;
      }

      // FREE ACCESS: Analytics is now free for all prestataires
      console.log('[AnalyticsGuard] Granting free analytics access to prestataire');
      setUser(userData);
      setHasAccess(true);
      setLoading(false);
    } catch (error) {
      console.error('[AnalyticsGuard] Error checking analytics access:', error);
      setHasAccess(false);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Vérification de l'accès...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-white p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center border border-slate-200">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-sky-100 mb-6">
              <svg className="h-10 w-10 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              Analytique avancée
            </h1>

            {/* Message based on user role */}
            {user?.role === 'client' ? (
              <>
                <p className="text-lg text-slate-600 mb-6">
                  L'analytique avancée est réservée aux prestataires.
                </p>
                <p className="text-sm text-slate-500 mb-8">
                  En tant que client, vous n'avez pas besoin d'accès à ces fonctionnalités. 
                  Si vous souhaitez devenir prestataire, veuillez créer un nouveau compte.
                </p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-600 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
                >
                  Retour au tableau de bord
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <p className="text-lg text-slate-600 mb-6">
                  Pour accéder à l'analytique avancée, vous devez souscrire au forfait <span className="font-semibold text-sky-600">Unlimited</span>.
                </p>
                
                {/* Features list */}
                <div className="bg-slate-50 rounded-xl p-6 mb-8 text-left">
                  <h3 className="font-semibold text-slate-900 mb-4">Avec l'analytique avancée, vous obtenez :</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <svg className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-slate-700">
                        <strong>Tableau de bord business</strong> - Visualisez vos revenus, vos missions et vos performances
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-slate-700">
                        <strong>Prévision de la demande</strong> - Anticipez les tendances et préparez-vous aux pics d'activité
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-slate-700">
                        <strong>Tests A/B</strong> - Optimisez votre profil et vos offres avec des données réelles
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-slate-700">
                        <strong>Suivi des campagnes</strong> - Mesurez le ROI de vos efforts marketing
                      </span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => router.push('/pricing')}
                  className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-8 py-4 text-base font-semibold text-white hover:bg-sky-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  Voir les forfaits
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
