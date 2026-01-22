"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

type Task = {
  id: number;
  title: string;
  client_id: number;
  status: string;
  created_at: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
};

type PromotionPurchase = {
  id: number;
  user_id: number;
  task_id: number;
  days: number;
  price: number;
  is_free: boolean;
  status: string;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
  user?: { id: number; name: string; email: string };
  task?: { id: number; title: string };
};

export default function AdminPromotionGrantsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [purchases, setPurchases] = useState<PromotionPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGrantForm, setShowGrantForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [days, setDays] = useState(7);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

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
    fetchTasks();
    fetchPurchases();
  }, [router]);

  async function fetchTasks() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks?status=published`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.data || data);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  }

  async function fetchPurchases() {
    try {
      const token = localStorage.getItem("prochepro_token");
      const res = await fetch(`${API_BASE_URL}/api/admin/promotions/purchases`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPurchases(data.data || data);
      }
    } catch (err) {
      console.error("Error fetching purchases:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGrantPromotion(e: React.FormEvent) {
    e.preventDefault();
    
    if (!selectedTask || !user) return;

    const token = localStorage.getItem("prochepro_token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/promotions/grant-free`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          task_id: selectedTask,
          days: days,
          admin_id: user.id,
        }),
      });

      if (res.ok) {
        setToast({ message: "Promotion gratuite accordée avec succès !", type: "success" });
        setShowGrantForm(false);
        setSelectedTask(null);
        setDays(7);
        fetchPurchases();
      } else {
        const data = await res.json();
        setToast({ message: data.message || "Erreur lors de l'attribution", type: "error" });
      }
    } catch (err) {
      setToast({ message: "Erreur de connexion", type: "error" });
    }
  }

  async function handleCancelPromotion(purchaseId: number) {
    if (!confirm("Voulez-vous vraiment annuler cette promotion ?")) return;

    const token = localStorage.getItem("prochepro_token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/promotions/purchases/${purchaseId}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setToast({ message: "Promotion annulée avec succès", type: "success" });
        fetchPurchases();
      }
    } catch (err) {
      setToast({ message: "Erreur lors de l'annulation", type: "error" });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600" />
      </div>
    );
  }

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <h1 className="text-2xl font-bold text-gray-900">Attribution de promotions gratuites</h1>
            <p className="text-sm text-gray-600">Offrez des promotions TOP aux utilisateurs</p>
          </div>
          <button
            onClick={() => setShowGrantForm(!showGrantForm)}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
          >
            {showGrantForm ? "Annuler" : "Accorder une promotion"}
          </button>
        </div>

        {/* Grant Form */}
        {showGrantForm && (
          <div className="mb-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Accorder une promotion gratuite
            </h2>
            <form onSubmit={handleGrantPromotion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rechercher une annonce
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par titre..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sélectionner l'annonce *
                </label>
                <select
                  value={selectedTask || ""}
                  onChange={(e) => setSelectedTask(Number(e.target.value))}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                >
                  <option value="">-- Choisir une annonce --</option>
                  {filteredTasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      #{task.id} - {task.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de jours *
                </label>
                <input
                  type="number"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  required
                  min="1"
                  max="365"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
                <p className="mt-1 text-xs text-gray-500">
                  La promotion sera active immédiatement et durera {days} jour{days > 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600"
                >
                  Accorder gratuitement
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowGrantForm(false);
                    setSelectedTask(null);
                    setSearchQuery("");
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Purchases List */}
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Historique des promotions</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Annonce</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Utilisateur</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Durée</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Prix</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Statut</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Expire le</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">#{purchase.id}</td>
                    <td className="px-4 py-3">
                      {purchase.task ? (
                        <div>
                          <div className="font-medium text-gray-900">{purchase.task.title}</div>
                          <div className="text-xs text-gray-500">ID: {purchase.task_id}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {purchase.user ? (
                        <div>
                          <div className="font-medium text-gray-900">{purchase.user.name}</div>
                          <div className="text-xs text-gray-500">{purchase.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{purchase.days} jour{purchase.days > 1 ? 's' : ''}</td>
                    <td className="px-4 py-3">
                      <span className={purchase.is_free ? "text-emerald-600 font-medium" : "text-gray-900"}>
                        {Number(purchase.price).toFixed(2)}€
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {purchase.is_free ? (
                        <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          Gratuit
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          Payant
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        purchase.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        purchase.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {purchase.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {purchase.expires_at ? new Date(purchase.expires_at).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {purchase.status === 'completed' && (
                        <button
                          onClick={() => handleCancelPromotion(purchase.id)}
                          className="text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          Annuler
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {purchases.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-500">
              Aucune promotion accordée pour le moment
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
