"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

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
  email: string;
  is_admin: boolean;
};

export default function AdminPromotionPackagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [packages, setPackages] = useState<PromotionPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    days: number;
    price: number;
    original_price: number | null;
    is_active: boolean;
    sort_order: number;
  }>({
    name: "",
    description: "",
    days: 7,
    price: 30,
    original_price: 35,
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const raw = localStorage.getItem("prochepro_user");
    const token = localStorage.getItem("prochepro_token");
    
    if (!raw || !token) {
      router.push("/auth/login");
      return;
    }

    const parsed = JSON.parse(raw);
    if (!parsed.is_admin) {
      router.push("/");
      return;
    }

    setUser(parsed);
    fetchPackages();
  }, [router]);

  async function fetchPackages() {
    try {
      const token = localStorage.getItem("prochepro_token");
      const res = await fetch(`${API_BASE_URL}/api/admin/promotion-packages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPackages(data);
      }
    } catch (err) {
      console.error("Error fetching packages:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const token = localStorage.getItem("prochepro_token");
    const url = editingId
      ? `${API_BASE_URL}/api/admin/promotion-packages/${editingId}`
      : `${API_BASE_URL}/api/admin/promotion-packages`;
    
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setToast({
          message: editingId ? "Package mis à jour avec succès" : "Package créé avec succès",
          type: "success",
        });
        setEditingId(null);
        setShowCreateForm(false);
        resetForm();
        fetchPackages();
      } else {
        const data = await res.json();
        setToast({ message: data.message || "Erreur lors de l'enregistrement", type: "error" });
      }
    } catch (err) {
      setToast({ message: "Erreur de connexion", type: "error" });
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Voulez-vous vraiment supprimer ce package ?")) return;

    const token = localStorage.getItem("prochepro_token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/promotion-packages/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setToast({ message: "Package supprimé avec succès", type: "success" });
        fetchPackages();
      }
    } catch (err) {
      setToast({ message: "Erreur lors de la suppression", type: "error" });
    }
  }

  function handleEdit(pkg: PromotionPackage) {
    setEditingId(pkg.id);
    setFormData({
      name: pkg.name,
      description: pkg.description || "",
      days: pkg.days,
      price: pkg.price,
      original_price: pkg.original_price || pkg.price,
      is_active: pkg.is_active,
      sort_order: pkg.sort_order,
    });
    setShowCreateForm(true);
  }

  function resetForm() {
    setFormData({
      name: "",
      description: "",
      days: 7,
      price: 30,
      original_price: 35,
      is_active: true,
      sort_order: 0,
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600" />
      </div>
    );
  }

  const discountPercent = formData.original_price && formData.original_price > formData.price
    ? Math.round(((formData.original_price - formData.price) / formData.original_price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des packages TOP</h1>
            <p className="text-sm text-gray-600">Créez et gérez les packages de promotion</p>
          </div>
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setEditingId(null);
              resetForm();
            }}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
          >
            {showCreateForm ? "Annuler" : "Nouveau package"}
          </button>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="mb-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingId ? "Modifier le package" : "Créer un nouveau package"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du package *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    placeholder="TOP 7 jours"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de jours *
                  </label>
                  <input
                    type="number"
                    value={formData.days}
                    onChange={(e) => setFormData({ ...formData, days: Number(e.target.value) })}
                    required
                    min="1"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix (€) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix original (€)
                  </label>
                  <input
                    type="number"
                    value={formData.original_price || ""}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value ? Number(e.target.value) : null })}
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                  {discountPercent > 0 && (
                    <p className="mt-1 text-xs text-amber-600 font-medium">
                      Réduction automatique: {discountPercent}%
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordre d'affichage
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Package actif</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  placeholder="Description courte du package..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600"
                >
                  {editingId ? "Mettre à jour" : "Créer le package"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Packages List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative rounded-xl bg-white p-6 shadow-sm ring-1 transition-all ${
                pkg.is_active ? "ring-gray-200" : "ring-gray-300 opacity-60"
              }`}
            >
              {!pkg.is_active && (
                <div className="absolute top-3 right-3">
                  <span className="inline-flex rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
                    Inactif
                  </span>
                </div>
              )}

              {pkg.discount_percentage > 0 && (
                <div className="absolute -top-2 -right-2">
                  <div className="rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white shadow-md">
                    -{pkg.discount_percentage}%
                  </div>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                {pkg.description && (
                  <p className="mt-1 text-sm text-gray-600">{pkg.description}</p>
                )}
              </div>

              <div className="mb-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Durée:</span>
                  <span className="font-medium text-gray-900">{pkg.days} jour{pkg.days > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Prix:</span>
                  <span className="font-medium text-gray-900">{Number(pkg.price).toFixed(2)}€</span>
                </div>
                {pkg.original_price && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prix original:</span>
                    <span className="text-gray-400 line-through">{Number(pkg.original_price).toFixed(2)}€</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Ordre:</span>
                  <span className="font-medium text-gray-900">{pkg.sort_order}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(pkg)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(pkg.id)}
                  className="flex-1 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        {packages.length === 0 && (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-200">
            <p className="text-gray-600">Aucun package créé pour le moment</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
            >
              Créer le premier package
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
