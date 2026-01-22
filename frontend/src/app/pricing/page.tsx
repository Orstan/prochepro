"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import { trackInitiateCheckout, trackPurchase } from "@/lib/meta-pixel";

type CreditPackage = {
  id: number;
  name: string;
  slug: string;
  type: "client" | "prestataire";
  credits: number | null;
  price: string;
  validity_days: number | null;
  description: string;
  features: string[];
  is_active: boolean;
};

type PromotionPackage = {
  id: number;
  name: string;
  description: string | null;
  days: number;
  price: number;
  original_price: number | null;
  discount_percentage: number;
  is_active: boolean;
  sort_order: number;
};

type User = {
  id: number;
  name: string;
  role: "client" | "prestataire";
};

function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [packages, setPackages] = useState<{
    client: CreditPackage[];
    prestataire: CreditPackage[];
  }>({ client: [], prestataire: [] });
  const [promotionPackages, setPromotionPackages] = useState<PromotionPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const [purchasingPromo, setPurchasingPromo] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"client" | "prestataire">("client");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [userTasks, setUserTasks] = useState<Array<{ id: number; title: string }>>([]);

  // Handle payment callback from Stripe - only on initial load
  useEffect(() => {
    const payment = searchParams.get("payment");
    const packageId = searchParams.get("package");
    if (payment === "success") {
      // Track successful purchase for Meta Pixel
      // Try to get package info from current packages
      const allPackages = [...packages.client, ...packages.prestataire];
      const purchasedPackage = allPackages.find(p => p.id.toString() === packageId);
      if (purchasedPackage) {
        trackPurchase(
          parseFloat(purchasedPackage.price),
          'EUR',
          purchasedPackage.name,
          purchasedPackage.id.toString()
        );
      }
      
      // Оновлюємо дані користувача після покупки
      refreshUserData();
      
      setToast({ message: "Paiement effectué avec succès ! Vos crédits ont été ajoutés.", type: "success" });
      // Clear URL params using history API to avoid re-triggering
      window.history.replaceState({}, "", "/pricing");
    } else if (payment === "cancelled") {
      setToast({ message: "Paiement annulé.", type: "error" });
      window.history.replaceState({}, "", "/pricing");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  useEffect(() => {
    const raw = localStorage.getItem("prochepro_user");
    if (raw) {
      const parsed = JSON.parse(raw);
      setUser(parsed);
      setActiveTab(parsed.role === "prestataire" ? "prestataire" : "client");
    }
    
    async function loadAllData() {
      await Promise.all([
        fetchPackages(),
        fetchPromotionPackages(),
        fetchUserTasks(),
      ]);
      setLoading(false);
    }
    
    loadAllData();
  }, []);

  async function fetchPackages() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/credits/packages`);
      if (res.ok) {
        const data = await res.json();
        setPackages(data);
      }
    } catch (err) {
      // Error fetching packages
    }
  }

  async function fetchPromotionPackages() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/promotions/packages`);
      if (res.ok) {
        const data = await res.json();
        setPromotionPackages(data);
      }
    } catch (err) {
      // Error fetching promotion packages
    }
  }

  async function fetchUserTasks() {
    const raw = localStorage.getItem("prochepro_user");
    if (!raw) return;
    
    const currentUser = JSON.parse(raw);
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks?client_id=${currentUser.id}&status=published`);
      if (res.ok) {
        const data = await res.json();
        const tasks = data.data || data;
        setUserTasks(tasks.map((t: any) => ({ id: t.id, title: t.title })));
      }
    } catch (err) {
      // Error fetching user tasks
    }
  }

  async function refreshUserData() {
    if (!user) return;
    
    try {
      const token = localStorage.getItem("prochepro_token");
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const userData = await res.json();
        localStorage.setItem("prochepro_user", JSON.stringify(userData));
        setUser(userData);
      }
    } catch (err) {
      // Error refreshing user data
    }
  }

  async function handlePurchase(pkg: CreditPackage) {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    setPurchasing(pkg.id);
    try {
      // Create Stripe checkout session
      const checkoutRes = await fetch(`${API_BASE_URL}/api/credits/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          package_id: pkg.id,
        }),
      });

      const checkoutData = await checkoutRes.json();

      if (checkoutRes.ok && checkoutData.url) {
        // Track InitiateCheckout for Meta Pixel
        trackInitiateCheckout(parseFloat(pkg.price), 'EUR', pkg.name);
        // Redirect to Stripe Checkout
        window.location.href = checkoutData.url;
        return;
      }

      // Show error if Stripe checkout failed
      setToast({ 
        message: checkoutData.message || "Erreur lors de la création du paiement. Veuillez réessayer.", 
        type: "error" 
      });
    } catch (err) {
      setToast({ message: "Erreur de connexion au serveur de paiement", type: "error" });
    } finally {
      setPurchasing(null);
    }
  }

  async function handlePromotionPurchase(pkg: PromotionPackage) {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (!selectedTask) {
      setToast({ message: "Veuillez sélectionner une annonce à promouvoir", type: "error" });
      return;
    }

    setPurchasingPromo(pkg.id);
    try {
      const token = localStorage.getItem("prochepro_token");
      const checkoutRes = await fetch(`${API_BASE_URL}/api/promotions/checkout`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          package_id: pkg.id,
          task_id: selectedTask,
          user_id: user.id,
        }),
      });

      const checkoutData = await checkoutRes.json();

      if (checkoutRes.ok && checkoutData.url) {
        trackInitiateCheckout(pkg.price, 'EUR', pkg.name);
        window.location.href = checkoutData.url;
        return;
      }

      setToast({ 
        message: checkoutData.error || checkoutData.message || "Erreur lors de la création du paiement.", 
        type: "error" 
      });
    } catch (err) {
      setToast({ message: "Erreur de connexion au serveur", type: "error" });
    } finally {
      setPurchasingPromo(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="animate-spin h-8 w-8 border-4 border-sky-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const currentPackages = activeTab === "client" ? packages.client : packages.prestataire;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F7FA] to-white py-12 px-4">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
            toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">
            Nos forfaits
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            {activeTab === "client" 
              ? "Publiez vos annonces gratuitement et sans limite ! Les forfaits sont réservés aux prestataires."
              : "Choisissez le forfait qui correspond à vos besoins. Vos 3 premières offres sont gratuites !"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-full bg-slate-100 p-1">
            <button
              onClick={() => setActiveTab("client")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === "client"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Pour les clients
            </button>
            <button
              onClick={() => setActiveTab("prestataire")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === "prestataire"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Pour les prestataires
            </button>
          </div>
        </div>

        {/* New pricing strategy for prestataires */}
        {activeTab === "prestataire" && (
          <div className="mb-8 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border-2 border-emerald-200 p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2 text-sm font-bold text-white mb-4 shadow-md">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Modèle "Légèreté & Réussite"</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                Commencez sans risque, payez uniquement quand vous gagnez
              </h2>
              <p className="text-slate-700 max-w-3xl mx-auto text-lg">
                Plus besoin d'abonnements ! Notre nouveau modèle vous permet de démarrer gratuitement et de ne payer qu'une petite commission sur vos gains.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* First 3 orders */}
              <div className="rounded-xl bg-white p-6 shadow-md ring-2 ring-emerald-400">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-2xl font-bold mx-auto mb-4">
                  0%
                </div>
                <h3 className="text-xl font-bold text-slate-900 text-center mb-2">
                  3 premières missions
                </h3>
                <p className="text-center text-slate-600 mb-4">
                  Démarrez votre activité en toute tranquillité
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <svg className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-slate-700">
                      <span className="font-semibold text-emerald-600">Aucune commission</span> sur vos 3 premières missions réussies
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-slate-700">
                      Vous gardez <span className="font-semibold">100% de vos revenus</span>
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-slate-700">
                      Testez la plateforme sans engagement financier
                    </span>
                  </li>
                </ul>
              </div>

              {/* After 3 orders */}
              <div className="rounded-xl bg-white p-6 shadow-md ring-2 ring-sky-400">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-white text-xl font-bold mx-auto mb-4">
                  10-15%
                </div>
                <h3 className="text-xl font-bold text-slate-900 text-center mb-2">
                  À partir de la 4ème mission
                </h3>
                <p className="text-center text-slate-600 mb-4">
                  Commission selon le mode de paiement
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <svg className="h-5 w-5 shrink-0 text-sky-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-slate-700">
                      💳 Paiement en ligne : <span className="font-semibold text-sky-600">10% de commission</span> à partir de la 4ème (0% pour les 3 premières)
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="h-5 w-5 shrink-0 text-sky-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-slate-700">
                      💵 Paiement en espèces : <span className="font-semibold text-amber-600">15% de commission</span> dès la 1ère mission
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="h-5 w-5 shrink-0 text-sky-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-slate-700">
                      Parmi les commissions <span className="font-semibold">les plus basses du marché</span>
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-6 py-3 shadow-sm">
                <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm font-semibold text-slate-700">
                  Répondez à autant d'annonces que vous souhaitez, sans limite !
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Free tier info for clients */}
        {activeTab === "client" && (
          <div className="mb-8 rounded-2xl bg-gradient-to-r from-emerald-50 to-sky-50 border border-emerald-100 p-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-700 mb-3">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              100% Gratuit
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              Publiez vos annonces gratuitement !
            </h3>
            <p className="text-sm text-slate-600">
              En tant que client, vous pouvez publier autant d'annonces que vous le souhaitez, sans aucun frais.
            </p>
          </div>
        )}

        {/* TOP Promotion Packages - Only for clients */}
        {activeTab === "client" && promotionPackages.length > 0 && (
          <div className="mt-16">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-700 mb-3">
                <span>⭐</span>
                <span>Nouveauté</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Mettez vos annonces en avant
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Augmentez la visibilité de vos annonces et obtenez plus de propositions rapidement !
              </p>
            </div>

            {/* Task Selector */}
            {user && userTasks.length > 0 && (
              <div className="mb-6 max-w-md mx-auto">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Sélectionnez l'annonce à promouvoir
                </label>
                <select
                  value={selectedTask || ""}
                  onChange={(e) => setSelectedTask(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                >
                  <option value="">-- Choisir une annonce --</option>
                  {userTasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Promotion Packages Grid */}
            <div className="grid gap-6 md:grid-cols-3">
              {promotionPackages.map((pkg, index) => {
                const isPopular = index === 1;
                
                return (
                  <div
                    key={pkg.id}
                    className={`relative rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 p-6 shadow-md ring-2 transition-all hover:shadow-lg ${
                      isPopular ? "ring-amber-500" : "ring-amber-200"
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-flex rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                          Plus populaire
                        </span>
                      </div>
                    )}

                    {pkg.discount_percentage > 0 && (
                      <div className="absolute -top-3 -right-3">
                        <div className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-md">
                          -{pkg.discount_percentage}%
                        </div>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 mb-3">
                        <span className="text-2xl">⭐</span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        {pkg.name}
                      </h3>
                      {pkg.description && (
                        <p className="text-sm text-slate-600 mb-4">{pkg.description}</p>
                      )}
                      
                      <div className="flex items-baseline justify-center gap-2">
                        {pkg.original_price && pkg.original_price > pkg.price && (
                          <span className="text-lg text-slate-400 line-through">
                            {Number(pkg.original_price).toFixed(0)}€
                          </span>
                        )}
                        <span className="text-4xl font-bold text-amber-600">
                          {Number(pkg.price).toFixed(0)}€
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        {pkg.days} jour{pkg.days > 1 ? 's' : ''} en TOP
                      </p>
                    </div>

                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start gap-2 text-sm text-slate-700">
                        <svg className="h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Apparaît en haut de la liste
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-700">
                        <svg className="h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Badge "Recommandé" visible
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-700">
                        <svg className="h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Fond doré pour attirer l'attention
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-700">
                        <svg className="h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Plus de visibilité = plus d'offres
                      </li>
                    </ul>

                    <button
                      onClick={() => handlePromotionPurchase(pkg)}
                      disabled={purchasingPromo === pkg.id}
                      className={`w-full rounded-full py-3 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        isPopular
                          ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600 shadow-md"
                          : "bg-white text-amber-600 hover:bg-amber-50 ring-1 ring-amber-200"
                      }`}
                    >
                      {purchasingPromo === pkg.id ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Traitement...
                        </span>
                      ) : (
                        "Acheter ce package"
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {!user && (
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-600 mb-3">
                  Vous devez être connecté pour promouvoir vos annonces
                </p>
                <button
                  onClick={() => router.push("/auth/login")}
                  className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-600"
                >
                  Se connecter
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            )}

            {user && userTasks.length === 0 && (
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-600 mb-3">
                  Vous n'avez pas encore d'annonces publiées
                </p>
                <button
                  onClick={() => router.push("/tasks/new")}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
                >
                  Publier une annonce
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Referral info */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 p-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-1.5 text-sm font-medium text-violet-700 mb-3">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Programme de parrainage
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            Gagnez 5€ gratuits !
          </h3>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Invitez vos amis à rejoindre ProchePro. Quand ils publient leur première annonce ou envoient leur première offre, 
            vous recevez tous les deux <span className="font-semibold text-violet-700">5€ gratuits</span> !
          </p>
          {user && (
            <button
              onClick={() => router.push("/profile/referral")}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-violet-500 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-600"
            >
              Voir mon lien de parrainage
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          )}
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-slate-900 text-center mb-6">
            Questions fréquentes
          </h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <h4 className="font-medium text-slate-900 mb-2">Comment fonctionne le parrainage ?</h4>
              <p className="text-sm text-slate-600">
                Partagez votre lien unique. Quand un ami s'inscrit et effectue sa première action (publier une annonce ou envoyer une offre), 
                vous recevez tous les deux <span className="font-semibold text-violet-700">5€ gratuits</span> ! Pas de limite sur le nombre de parrainages !
              </p>
            </div>
            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <h4 className="font-medium text-slate-900 mb-2">Comment sont calculées les commissions ?</h4>
              <p className="text-sm text-slate-600">
                Pour les prestataires : 0% sur les 3 premières missions en ligne, puis 10% pour les paiements en ligne et 15% pour les paiements en espèces.
                Les clients ne paient aucune commission pour publier des annonces.
              </p>
            </div>
            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <h4 className="font-medium text-slate-900 mb-2">Quand est-ce que je reçois mes paiements ?</h4>
              <p className="text-sm text-slate-600">
                Les paiements sont traités automatiquement après la validation de la mission. Assurez-vous d'avoir renseigné vos coordonnées bancaires dans votre profil.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600" />
      </div>
    }>
      <PricingContent />
    </Suspense>
  );
}
