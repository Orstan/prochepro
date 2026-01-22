"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

interface Payment {
  id: number;
  task_id: number;
  client_id: number;
  prestataire_id: number;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  created_at: string;
  paid_at?: string;
}

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    // Check if user is admin
    const stored = localStorage.getItem("prochepro_user");
    if (!stored) {
      router.replace("/auth/login");
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (!parsed.is_admin) {
        router.replace("/dashboard");
        return;
      }
      fetchPayments();
    } catch {
      router.replace("/auth/login");
    }
  }, [router]);

  function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("prochepro_token");
    return token ? { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } : {};
  }

  async function fetchPayments() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/payments`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setPayments(data ?? []);
      } else {
        setPayments([]);
      }
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredPayments = payments.filter((p) => {
    if (filter !== "all" && p.status !== filter) return false;
    return true;
  });

  const totalRevenue = payments
    .filter(p => ["completed", "captured", "authorized"].includes(p.status))
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const statusColors: Record<string, string> = {
    completed: "bg-emerald-100 text-emerald-700",
    captured: "bg-emerald-100 text-emerald-700",
    authorized: "bg-blue-100 text-blue-700",
    pending: "bg-amber-100 text-amber-700",
    failed: "bg-red-100 text-red-700",
    refunded: "bg-slate-100 text-slate-700",
  };

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
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Historique des paiements</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="rounded-xl bg-emerald-50 p-3 sm:p-4 text-center">
          <p className="text-lg sm:text-2xl font-bold text-emerald-700">{totalRevenue.toFixed(0)}€</p>
          <p className="text-[10px] sm:text-xs text-emerald-600">Revenus</p>
        </div>
        <div className="rounded-xl bg-blue-50 p-3 sm:p-4 text-center">
          <p className="text-lg sm:text-2xl font-bold text-blue-700">{payments.filter(p => p.status === "completed").length}</p>
          <p className="text-[10px] sm:text-xs text-blue-600">Réussis</p>
        </div>
        <div className="rounded-xl bg-slate-100 p-3 sm:p-4 text-center">
          <p className="text-lg sm:text-2xl font-bold text-slate-700">{payments.length}</p>
          <p className="text-[10px] sm:text-xs text-slate-600">Total</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4 sm:mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full sm:w-auto rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
        >
          <option value="all">Tous les statuts</option>
          <option value="completed">Complétés</option>
          <option value="authorized">Autorisés</option>
          <option value="pending">En attente</option>
          <option value="failed">Échoués</option>
          <option value="refunded">Remboursés</option>
        </select>
      </div>

      {/* Payments */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600" />
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-slate-200 bg-white">
          <p className="text-slate-600">Aucun paiement trouvé</p>
          <p className="text-sm text-slate-500 mt-1">
            L&apos;endpoint /api/admin/payments n&apos;existe pas encore.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {Number(payment.amount || 0).toFixed(2)} {payment.currency}
                    </p>
                    <p className="text-xs text-slate-500">#{payment.id}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[payment.status] || "bg-slate-100 text-slate-700"}`}>
                    {payment.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-3">
                  <div>
                    <span className="text-slate-400">Annonce:</span>{" "}
                    #{payment.task_id}
                  </div>
                  <div>
                    <span className="text-slate-400">Provider:</span>{" "}
                    {payment.provider}
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400">Date:</span>{" "}
                    {new Date(payment.created_at).toLocaleDateString("fr-FR")}
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/tasks/${payment.task_id}`)}
                  className="w-full rounded-lg bg-sky-50 px-3 py-2 text-xs font-medium text-sky-700 hover:bg-sky-100"
                >
                  Voir l'annonce
                </button>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-600">ID</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-600">Annonce</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-600">Montant</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-600">Statut</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-600">Provider</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-500">#{payment.id}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => router.push(`/tasks/${payment.task_id}`)}
                        className="text-sm text-sky-600 hover:text-sky-700"
                      >
                        Annonce #{payment.task_id}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {Number(payment.amount || 0).toFixed(2)} {payment.currency}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[payment.status] || "bg-slate-100 text-slate-700"}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{payment.provider}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {new Date(payment.created_at).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
