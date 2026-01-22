"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

interface CreditPackage {
  id: number;
  name: string;
  slug: string;
  type: "client" | "prestataire";
  credits: number | null;
  price: string;
  validity_days: number | null;
  description: string;
  is_active: boolean;
}

export default function AdminCreditsPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPackage, setEditingPackage] = useState<CreditPackage | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  function getToken() {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("prochepro_token");
    }
    return null;
  }

  async function fetchPackages() {
    setLoading(true);
    try {
      const token = getToken();
      // Use admin endpoint to get all packages including inactive
      const res = await fetch(`${API_BASE_URL}/api/admin/credit-packages`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setPackages(data ?? []);
      } else {
        // Fallback to public endpoint
        const publicRes = await fetch(`${API_BASE_URL}/api/credits/packages`);
        if (publicRes.ok) {
          const data = await publicRes.json();
          const allPackages = [
            ...(data?.client ?? []),
            ...(data?.prestataire ?? []),
          ];
          setPackages(allPackages);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function savePackage() {
    if (!editingPackage) return;
    setSaving(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/admin/credit-packages/${editingPackage.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(editingPackage),
      });
      if (res.ok) {
        setEditingPackage(null);
        fetchPackages();
        alert("Pack mis à jour avec succès !");
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.message || "Erreur lors de la sauvegarde");
      }
    } catch {
      alert("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(pkg: CreditPackage) {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/admin/credit-packages/${pkg.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !pkg.is_active }),
      });
      if (res.ok) {
        fetchPackages();
      } else {
        alert("Erreur lors de la mise à jour");
      }
    } catch {
      alert("Erreur réseau");
    }
  }

  const clientPackages = packages.filter(p => p.type === "client");
  const prestatairePackages = packages.filter(p => p.type === "prestataire");

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <button 
          onClick={() => router.push("/admin")} 
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 mb-2 px-2 py-1 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Retour</span>
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Gestion des crédits</h1>
        <p className="text-sm text-slate-600">Packs de crédits disponibles sur la plateforme</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600" />
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-slate-200 bg-white">
          <div className="text-4xl mb-4">💳</div>
          <p className="text-slate-600">Aucun pack de crédits trouvé</p>
          <p className="text-sm text-slate-500 mt-1">
            Vérifiez que la table credit_packages contient des données.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Client Info */}
          <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-sky-50 border border-emerald-100 p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">👤</span>
              <h2 className="text-lg font-semibold text-slate-900">Clients</h2>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                100% Gratuit
              </span>
            </div>
            <p className="text-slate-600">
              Les clients peuvent publier des annonces <strong>gratuitement et sans limite</strong>. 
              Aucun pack de crédits n'est nécessaire pour les clients.
            </p>
          </div>

          {/* Prestataire Packages */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">🔧</span> Packs Prestataires ({prestatairePackages.length})
            </h2>
            {prestatairePackages.length === 0 ? (
              <p className="text-sm text-slate-500">Aucun pack prestataire</p>
            ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {prestatairePackages.map((pkg) => (
                <div key={pkg.id} className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">{pkg.name}</h3>
                      <p className="text-xs text-slate-500">{pkg.slug}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      pkg.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {pkg.is_active ? "Actif" : "Inactif"}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Prix</span>
                      <span className="font-medium text-slate-900">{pkg.price}€</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Crédits</span>
                      <span className="font-medium text-slate-900">{pkg.credits ?? "Illimité"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Validité</span>
                      <span className="font-medium text-slate-900">{pkg.validity_days ? `${pkg.validity_days} jours` : "Illimité"}</span>
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-slate-500">{pkg.description}</p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setEditingPackage(pkg)}
                      className="text-xs text-sky-600 hover:text-sky-700 font-medium"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => toggleActive(pkg)}
                      className={`text-xs font-medium ${pkg.is_active ? "text-amber-600 hover:text-amber-700" : "text-emerald-600 hover:text-emerald-700"}`}
                    >
                      {pkg.is_active ? "Désactiver" : "Activer"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>

        </div>
      )}

      {/* Edit Modal */}
      {editingPackage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Modifier le pack</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={editingPackage.name}
                  onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prix (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingPackage.price}
                    onChange={(e) => setEditingPackage({ ...editingPackage, price: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Crédits</label>
                  <input
                    type="number"
                    value={editingPackage.credits ?? ""}
                    onChange={(e) => setEditingPackage({ ...editingPackage, credits: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="Illimité"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Validité (jours)</label>
                <input
                  type="number"
                  value={editingPackage.validity_days ?? ""}
                  onChange={(e) => setEditingPackage({ ...editingPackage, validity_days: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Illimité"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={editingPackage.description}
                  onChange={(e) => setEditingPackage({ ...editingPackage, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingPackage(null)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={savePackage}
                disabled={saving}
                className="flex-1 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-50"
              >
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
