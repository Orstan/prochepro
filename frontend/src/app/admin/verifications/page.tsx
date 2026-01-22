"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UserAvatar from "@/components/UserAvatar";
import { API_BASE_URL } from "@/lib/api";

interface VerificationRequest {
  id: number;
  user_id: number;
  document_type: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  document_number: string | null;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    role: string;
  };
}

interface PaginatedResponse {
  data: VerificationRequest[];
  current_page: number;
  last_page: number;
  total: number;
}

export default function AdminVerificationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: number; is_admin: boolean } | null>(null);
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected" | "">("");
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [documentUrls, setDocumentUrls] = useState<{
    front: string | null;
    back: string | null;
    selfie: string | null;
  }>({ front: null, back: null, selfie: null });
  const [processing, setProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("prochepro_token");
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  }

  useEffect(() => {
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
      setUser(parsed);
      fetchRequests(parsed.id);
    } catch {
      router.replace("/auth/login");
    }
  }, [router]);

  async function fetchRequests(adminId: number) {
    setLoading(true);
    try {
      const url = statusFilter
        ? `${API_BASE_URL}/api/admin/verifications?admin_id=${adminId}&status=${statusFilter}`
        : `${API_BASE_URL}/api/admin/verifications?admin_id=${adminId}`;
      const res = await fetch(url, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data: PaginatedResponse = await res.json();
        setRequests(data.data || []);
      }
    } catch (err) {
      // Failed to fetch verifications
    } finally {
      setLoading(false);
    }
  }

  async function viewRequest(request: VerificationRequest) {
    if (!user) return;
    setSelectedRequest(request);
    setDocumentUrls({ front: null, back: null, selfie: null });

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/verifications/${request.id}?admin_id=${user.id}`,
        { headers: getAuthHeaders() }
      );
      if (res.ok) {
        const data = await res.json();
        // Update selectedRequest with full data from API (includes document_number)
        if (data.request) {
          setSelectedRequest({ ...request, ...data.request });
        }
        setDocumentUrls({
          front: data.document_front_url,
          back: data.document_back_url,
          selfie: data.selfie_url,
        });
      }
    } catch (err) {
      // Failed to fetch document URLs
    }
  }

  async function handleApprove() {
    if (!user || !selectedRequest) return;
    setProcessing(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/verifications/${selectedRequest.id}/approve`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ admin_id: user.id }),
        }
      );

      if (res.ok) {
        setSelectedRequest(null);
        fetchRequests(user.id);
      }
    } catch (err) {
      // Failed to approve
    } finally {
      setProcessing(false);
    }
  }

  async function handleReject() {
    if (!user || !selectedRequest || !rejectReason.trim()) return;
    setProcessing(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/verifications/${selectedRequest.id}/reject`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ admin_id: user.id, reason: rejectReason }),
        }
      );

      if (res.ok) {
        setSelectedRequest(null);
        setShowRejectModal(false);
        setRejectReason("");
        fetchRequests(user.id);
      }
    } catch (err) {
      console.error("Failed to reject:", err);
    } finally {
      setProcessing(false);
    }
  }

  useEffect(() => {
    if (user) {
      fetchRequests(user.id);
    }
  }, [statusFilter]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-sky-600 border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <button 
            onClick={() => router.push("/admin")} 
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 mb-2 px-2 py-1 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Retour</span>
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Vérifications d&apos;identité</h1>
          <p className="text-slate-600 text-sm mt-1">
            Gérez les demandes de vérification des prestataires
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-800 self-start sm:self-auto">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
            {pendingCount} en attente
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter("")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === ""
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === "pending"
                ? "bg-amber-500 text-white"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
            }`}
          >
            En attente
          </button>
          <button
            onClick={() => setStatusFilter("approved")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === "approved"
                ? "bg-emerald-500 text-white"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            Approuvées
          </button>
          <button
            onClick={() => setStatusFilter("rejected")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === "rejected"
                ? "bg-red-500 text-white"
                : "bg-red-50 text-red-700 hover:bg-red-100"
            }`}
          >
            Rejetées
          </button>
        </div>
      </div>

      {/* Requests list */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-slate-600">Aucune demande de vérification</p>
        </div>
      ) : (
        <>
          {/* Mobile Cards View */}
          <div className="md:hidden space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-xl shadow-sm border border-slate-100 p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar avatar={req.user.avatar} name={req.user.name} size="sm" />
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{req.user.name}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[150px]">{req.user.email}</p>
                    </div>
                  </div>
                  {req.status === "pending" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 shrink-0">
                      ⏳ En attente
                    </span>
                  )}
                  {req.status === "approved" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 shrink-0">
                      ✓ Approuvé
                    </span>
                  )}
                  {req.status === "rejected" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 shrink-0">
                      ✗ Rejeté
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <p className="text-xs text-slate-500">Document</p>
                    <p className="text-slate-700">
                      {req.document_type === "cni" ? "🪪 CNI" : "🚗 Permis"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Date</p>
                    <p className="text-slate-700">
                      {new Date(req.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500">Nom sur le document</p>
                    <p className="text-slate-700">{req.first_name} {req.last_name}</p>
                  </div>
                </div>
                <button
                  onClick={() => viewRequest(req)}
                  className="w-full py-2 rounded-lg bg-sky-50 text-sky-700 text-sm font-medium hover:bg-sky-100 transition-colors"
                >
                  Voir les détails
                </button>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Utilisateur
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Document
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Nom sur le document
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar avatar={req.user.avatar} name={req.user.name} size="sm" />
                        <div>
                          <p className="font-medium text-slate-900">{req.user.name}</p>
                          <p className="text-xs text-slate-500">{req.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-700">
                        {req.document_type === "cni" ? "🪪 Carte d'identité" : "🚗 Permis"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-700">
                        {req.first_name} {req.last_name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-500">
                        {new Date(req.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {req.status === "pending" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                          ⏳ En attente
                        </span>
                      )}
                      {req.status === "approved" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
                          ✓ Approuvé
                        </span>
                      )}
                      {req.status === "rejected" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800">
                          ✗ Rejeté
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => viewRequest(req)}
                        className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100"
                      >
                        Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSelectedRequest(null)}
          />
          <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Demande de vérification #{selectedRequest.id}
              </h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* User info */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <UserAvatar
                  avatar={selectedRequest.user.avatar}
                  name={selectedRequest.user.name}
                  size="lg"
                />
                <div>
                  <h3 className="font-semibold text-slate-900">{selectedRequest.user.name}</h3>
                  <p className="text-sm text-slate-500">{selectedRequest.user.email}</p>
                </div>
              </div>

              {/* Document info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Type de document</p>
                  <p className="font-medium text-slate-900">
                    {selectedRequest.document_type === "cni"
                      ? "Carte Nationale d'Identité"
                      : "Permis de conduire"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Nom sur le document</p>
                  <p className="font-medium text-slate-900">
                    {selectedRequest.first_name} {selectedRequest.last_name}
                  </p>
                </div>
                {selectedRequest.document_number && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Numéro du document</p>
                    <p className="font-medium text-slate-900 font-mono bg-amber-50 px-2 py-1 rounded inline-block">
                      {selectedRequest.document_number}
                    </p>
                  </div>
                )}
                {selectedRequest.date_of_birth && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Date de naissance</p>
                    <p className="font-medium text-slate-900">
                      {new Date(selectedRequest.date_of_birth).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-500 mb-1">Date de soumission</p>
                  <p className="font-medium text-slate-900">
                    {new Date(selectedRequest.created_at).toLocaleString("fr-FR")}
                  </p>
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-4">
                <h4 className="font-medium text-slate-900">Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {documentUrls.front && (
                    <div>
                      <p className="text-xs text-slate-500 mb-2">Recto</p>
                      <a
                        href={documentUrls.front}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={documentUrls.front}
                          alt="Document recto"
                          className="w-full h-40 object-cover rounded-lg border border-slate-200 hover:border-sky-500 transition-colors"
                        />
                      </a>
                    </div>
                  )}
                  {documentUrls.back && (
                    <div>
                      <p className="text-xs text-slate-500 mb-2">Verso</p>
                      <a
                        href={documentUrls.back}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={documentUrls.back}
                          alt="Document verso"
                          className="w-full h-40 object-cover rounded-lg border border-slate-200 hover:border-sky-500 transition-colors"
                        />
                      </a>
                    </div>
                  )}
                  {documentUrls.selfie && (
                    <div>
                      <p className="text-xs text-slate-500 mb-2">Selfie</p>
                      <a
                        href={documentUrls.selfie}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={documentUrls.selfie}
                          alt="Selfie"
                          className="w-full h-40 object-cover rounded-lg border border-slate-200 hover:border-sky-500 transition-colors"
                        />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Rejection reason if rejected */}
              {selectedRequest.status === "rejected" && selectedRequest.rejection_reason && (
                <div className="mt-6 p-4 bg-red-50 rounded-xl">
                  <p className="text-sm font-medium text-red-800">Raison du rejet :</p>
                  <p className="text-sm text-red-700 mt-1">{selectedRequest.rejection_reason}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            {selectedRequest.status === "pending" && (
              <div className="px-4 sm:px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={processing}
                  className="px-4 py-2.5 sm:py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-sm font-medium disabled:opacity-50 order-2 sm:order-1"
                >
                  Rejeter
                </button>
                <button
                  onClick={handleApprove}
                  disabled={processing}
                  className="px-4 py-2.5 sm:py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-medium disabled:opacity-50 order-1 sm:order-2"
                >
                  {processing ? "..." : "Approuver"}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowRejectModal(false)}
          />
          <div className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md bg-white rounded-2xl shadow-2xl z-50 p-4 sm:p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Rejeter la demande</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Raison du rejet (obligatoire)..."
              className="w-full h-32 rounded-xl border border-slate-200 px-4 py-3 text-sm resize-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 mt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-sm font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleReject}
                disabled={processing || !rejectReason.trim()}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium disabled:opacity-50"
              >
                {processing ? "..." : "Confirmer le rejet"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
