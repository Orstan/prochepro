"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface StripeAccountStatus {
  has_account: boolean;
  status: string | null;
  payouts_enabled: boolean;
  charges_enabled: boolean;
  details_submitted?: boolean;
  requirements?: {
    currently_due: string[];
    eventually_due: string[];
    disabled_reason: string | null;
  };
}

function BankSettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<{ id: number; role: string; active_role?: string } | null>(null);
  const [accountStatus, setAccountStatus] = useState<StripeAccountStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.prochepro.fr";

  useEffect(() => {
    const stored = localStorage.getItem("prochepro_user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
    } else {
      router.push("/auth/login");
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchAccountStatus();
    }
  }, [user]);

  useEffect(() => {
    // Handle return from Stripe onboarding
    const success = searchParams.get("success");
    const refresh = searchParams.get("refresh");

    if (success === "true") {
      fetchAccountStatus();
    }
    if (refresh === "true") {
      // User needs to complete onboarding
      fetchAccountStatus();
    }
  }, [searchParams]);

  const fetchAccountStatus = async () => {
    try {
      const token = localStorage.getItem("prochepro_token");
      const res = await fetch(`${API_BASE_URL}/api/stripe/connect/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setAccountStatus(data);
      }
    } catch (err) {
      // Failed to fetch account status
    } finally {
      setLoading(false);
    }
  };

  const handleConnectStripe = async () => {
    setConnecting(true);
    setError(null);

    try {
      const token = localStorage.getItem("prochepro_token");
      const res = await fetch(`${API_BASE_URL}/api/stripe/connect/create-account`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (res.ok && data.url) {
        // Redirect to Stripe onboarding
        window.location.href = data.url;
      } else {
        setError(data.message || "Erreur lors de la connexion à Stripe");
      }
    } catch (err) {
      setError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setConnecting(false);
    }
  };

  const handleContinueOnboarding = async () => {
    setConnecting(true);
    setError(null);

    try {
      const token = localStorage.getItem("prochepro_token");
      const res = await fetch(`${API_BASE_URL}/api/stripe/connect/onboarding-link`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.message || "Erreur lors de la création du lien");
      }
    } catch (err) {
      setError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setConnecting(false);
    }
  };

  const handleOpenDashboard = async () => {
    try {
      const token = localStorage.getItem("prochepro_token");
      const res = await fetch(`${API_BASE_URL}/api/stripe/connect/dashboard-link`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok && data.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      // Failed to get dashboard link
    }
  };

  const activeRole = user?.active_role || user?.role;
  const isPrestataire = activeRole === "prestataire" || activeRole === "both";

  if (!isPrestataire) {
    return (
      <main className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">
              Accès réservé aux prestataires
            </h1>
            <p className="text-slate-600 mb-6">
              Cette page est réservée aux prestataires pour configurer leurs paiements.
            </p>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-white font-medium hover:bg-sky-600 transition-colors"
            >
              Retour au profil
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au profil
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Configuration des paiements</h1>
          <p className="text-slate-600 mt-1">
            Connectez votre compte bancaire pour recevoir vos paiements automatiquement.
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-sky-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-600 mt-4">Chargement...</p>
          </div>
        ) : (
          <>
            {/* Status Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center text-2xl ${
                  accountStatus?.status === "active" 
                    ? "bg-emerald-100" 
                    : accountStatus?.status === "pending"
                    ? "bg-amber-100"
                    : "bg-slate-100"
                }`}>
                  {accountStatus?.status === "active" ? "✓" : accountStatus?.status === "pending" ? "⏳" : "💳"}
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-slate-800">
                    {accountStatus?.status === "active" 
                      ? "Compte connecté" 
                      : accountStatus?.status === "pending"
                      ? "Configuration en cours"
                      : "Aucun compte connecté"}
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    {accountStatus?.status === "active" 
                      ? "Vous pouvez recevoir des paiements automatiquement." 
                      : accountStatus?.status === "pending"
                      ? "Veuillez terminer la configuration de votre compte."
                      : "Connectez votre compte pour recevoir vos paiements."}
                  </p>

                  {accountStatus?.status === "active" && (
                    <div className="flex items-center gap-4 mt-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                        accountStatus.payouts_enabled 
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-red-100 text-red-700"
                      }`}>
                        {accountStatus.payouts_enabled ? "✓ Virements actifs" : "✗ Virements désactivés"}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                        accountStatus.charges_enabled 
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-red-100 text-red-700"
                      }`}>
                        {accountStatus.charges_enabled ? "✓ Paiements actifs" : "✗ Paiements désactivés"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Requirements */}
              {accountStatus?.requirements?.currently_due && accountStatus.requirements.currently_due.length > 0 && (
                <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-sm font-medium text-amber-800 mb-2">
                    Informations requises :
                  </p>
                  <ul className="text-sm text-amber-700 space-y-1">
                    {accountStatus.requirements.currently_due.slice(0, 5).map((req, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-amber-500">•</span>
                        {req.replace(/_/g, " ").replace(/\./g, " → ")}
                      </li>
                    ))}
                    {accountStatus.requirements.currently_due.length > 5 && (
                      <li className="text-amber-600">
                        + {accountStatus.requirements.currently_due.length - 5} autres...
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex flex-wrap gap-3">
                {!accountStatus?.has_account ? (
                  <button
                    onClick={handleConnectStripe}
                    disabled={connecting}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-white font-medium hover:from-sky-600 hover:to-blue-700 transition-all disabled:opacity-50"
                  >
                    {connecting ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Connexion...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Connecter mon compte
                      </>
                    )}
                  </button>
                ) : accountStatus?.status === "pending" ? (
                  <button
                    onClick={handleContinueOnboarding}
                    disabled={connecting}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-white font-medium hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50"
                  >
                    {connecting ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Chargement...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        Terminer la configuration
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleOpenDashboard}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-6 py-3 text-white font-medium hover:bg-slate-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Ouvrir le tableau de bord Stripe
                  </button>
                )}

                {accountStatus?.has_account && accountStatus?.status !== "pending" && (
                  <button
                    onClick={handleContinueOnboarding}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-6 py-3 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
                  >
                    Modifier les informations
                  </button>
                )}
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">
                    🔒
                  </div>
                  <h3 className="font-semibold text-slate-800">Sécurisé</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Vos données bancaires sont gérées par Stripe, leader mondial des paiements en ligne.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-sky-100 flex items-center justify-center text-xl">
                    ⚡
                  </div>
                  <h3 className="font-semibold text-slate-800">Automatique</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Recevez vos paiements automatiquement dès que le client confirme la mission.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center text-xl">
                    📊
                  </div>
                  <h3 className="font-semibold text-slate-800">Transparent</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Suivez tous vos paiements et virements depuis votre tableau de bord Stripe.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl">
                    🏦
                  </div>
                  <h3 className="font-semibold text-slate-800">Flexible</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Virements sur votre compte bancaire sous 2-7 jours ouvrés.
                </p>
              </div>
            </div>

            {/* FAQ */}
            <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Questions fréquentes</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-slate-700">Comment ça marche ?</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Quand un client paie pour une mission, l&apos;argent est bloqué sur ProchePro. 
                    Une fois la mission terminée et confirmée par le client, le paiement est automatiquement 
                    transféré sur votre compte Stripe, puis sur votre compte bancaire.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-slate-700">Quels documents sont nécessaires ?</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Stripe vous demandera une pièce d&apos;identité, vos coordonnées bancaires (IBAN), 
                    et quelques informations personnelles pour la vérification.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-slate-700">Y a-t-il des frais ?</p>
                  <p className="text-sm text-slate-600 mt-1">
                    ProchePro prélève une commission sur chaque transaction. Les virements vers 
                    votre compte bancaire sont gratuits.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function BankSettingsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-sky-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-600 mt-4">Chargement...</p>
          </div>
        </div>
      </main>
    }>
      <BankSettingsContent />
    </Suspense>
  );
}
