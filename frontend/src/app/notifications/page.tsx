"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";

type Notification = {
  id: number;
  type: string;
  data?: {
    task_id?: number;
    task_title?: string;
    amount?: number;
    message?: string;
  } | null;
  read_at?: string | null;
  created_at: string;
};

const NOTIFICATION_TYPES: { value: string; label: string }[] = [
  { value: "", label: "Toutes" },
  { value: "chat_message", label: "Messages" },
  { value: "offer_accepted", label: "Offres" },
  { value: "task_completed", label: "Annonces terminées" },
  { value: "review_from_client", label: "Avis clients" },
  { value: "review_from_prestataire", label: "Avis prestataires" },
  { value: "payment_status_changed", label: "Paiements" },
  { value: "credits_added", label: "Crédits" },
  { value: "referral_bonus", label: "Parrainage" },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [typeFilter, setTypeFilter] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("prochepro_user");
    if (!raw) return;
    const parsed = JSON.parse(raw) as { id?: number };
    if (!parsed?.id) return;
    setUserId(parsed.id);

    async function fetchNotifications() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("user_id", String(parsed.id));
        params.set("page", String(page));
        params.set("per_page", String(perPage));
        if (typeFilter) params.set("type", typeFilter);

        const res = await fetch(`${API_BASE_URL}/api/notifications?${params.toString()}`);
        if (!res.ok) {
          throw new Error("Impossible de charger les notifications.");
        }
        const json = await res.json();
        setNotifications((json.data as Notification[]) ?? []);
        setTotal(typeof json.meta?.total === "number" ? json.meta.total : 0);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Une erreur est survenue.");
      } finally {
        setLoading(false);
      }
    }

    void fetchNotifications();
  }, [page, perPage, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  function handleTypeChange(value: string) {
    setTypeFilter(value);
    setPage(1);
  }

  async function markAsRead(notificationId: number) {
    if (!userId) return;
    try {
      await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n)
      );
    } catch (e) {
      // Failed to mark as read
    }
  }

  function handleItemClick(n: Notification) {
    // Mark as read when clicked
    if (!n.read_at) {
      void markAsRead(n.id);
    }
    
    if (n.type === 'credits_added' || n.type === 'credits_purchased') {
      window.location.href = '/pricing';
    } else if (n.type === 'referral_bonus') {
      window.location.href = '/profile/referral';
    } else if (n.type === 'chat_message') {
      // Handle chat notifications with multiple fallback methods
      const chatRoomId = (n.data as any)?.chat_room_id;
      if (chatRoomId) {
        // Check if admin
        const userStr = localStorage.getItem('prochepro_user');
        const user = userStr ? JSON.parse(userStr) : null;
        if (user?.role === 'admin' || user?.is_admin) {
          window.location.href = `/admin/chat/${chatRoomId}`;
        } else {
          // Try multiple methods to open chat widget
          try {
            window.dispatchEvent(new CustomEvent('open-chat-widget', { 
              detail: { chatRoomId },
              bubbles: true,
              cancelable: true 
            }));
          } catch (e) {
            // Method 2: localStorage flag
            try {
              localStorage.setItem('prochepro_open_chat', 'true');
              window.dispatchEvent(new Event('storage'));
            } catch (e2) {
              // Method 3: Hash-based
              window.location.href = '/#chat';
            }
          }
        }
      }
    } else if (n.data?.task_id) {
      window.location.href = `/tasks/${n.data.task_id}`;
    }
  }

  async function handleClearAll() {
    if (!userId) return;
    if (!window.confirm("Supprimer toutes les notifications ?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/clear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!res.ok) {
        throw new Error("Impossible de supprimer les notifications.");
      }

      setNotifications([]);
      setTotal(0);
      setPage(1);
      setSelectedIds([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.");
    }
  }

  function toggleSelectAll() {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map(n => n.id));
    }
  }

  function toggleSelect(id: number) {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }

  async function handleBulkMarkAsRead() {
    if (!userId || selectedIds.length === 0) return;
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/bulk-read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, notification_ids: selectedIds }),
      });

      if (!res.ok) throw new Error("Échec de la mise à jour.");

      // Update local state
      const now = new Date().toISOString();
      setNotifications(prev => 
        prev.map(n => selectedIds.includes(n.id) ? { ...n, read_at: now } : n)
      );
      setSelectedIds([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setProcessing(false);
    }
  }

  async function handleBulkDelete() {
    if (!userId || selectedIds.length === 0) return;
    if (!window.confirm(`Supprimer ${selectedIds.length} notification(s) sélectionnée(s) ?`)) return;
    
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, notification_ids: selectedIds }),
      });

      if (!res.ok) throw new Error("Échec de la suppression.");

      setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
      setTotal(prev => prev - selectedIds.length);
      setSelectedIds([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 text-slate-800">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">Notifications</h1>
        {notifications.length > 0 && userId && (
          <button
            type="button"
            onClick={handleClearAll}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:border-rose-400 hover:text-rose-500"
          >
            Supprimer toutes
          </button>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            {selectedIds.length === notifications.length ? "Désélectionner tout" : "Sélectionner tout"}
          </button>

          {selectedIds.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleBulkMarkAsRead}
                disabled={processing}
                className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
              >
                Marquer comme lu ({selectedIds.length})
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={processing}
                className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-50"
              >
                Supprimer ({selectedIds.length})
              </button>
            </>
          )}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-slate-600">Filtrer par type :</span>
        {NOTIFICATION_TYPES.map((t) => (
          <button
            key={t.value || "all"}
            type="button"
            onClick={() => handleTypeChange(t.value)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              typeFilter === t.value
                ? "border-sky-600 bg-sky-50 text-sky-700"
                : "border-slate-200 bg-white text-slate-700 hover:border-sky-500 hover:text-sky-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-slate-600">Chargement des notifications...</p>
      ) : error ? (
        <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      ) : notifications.length === 0 ? (
        <p className="text-sm text-slate-600">Aucune notification pour le moment.</p>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const isUnread = !n.read_at;
            let label = "Notification";

            if (n.type === "chat_message") {
              label = "Nouveau message sur une annonce";
            } else if (n.type === "offer_accepted") {
              label = "Votre offre a été acceptée";
            } else if (n.type === "task_completed") {
              label = "Annonce terminée";
            } else if (n.type === "review_from_client") {
              label = "Nouvel avis d'un client";
            } else if (n.type === "review_from_prestataire") {
              label = "Nouvel avis d'un prestataire";
            } else if (n.type === "payment_status_changed") {
              label = "Mise à jour du statut de paiement";
            } else if (n.type === "credits_added") {
              label = n.data?.message || "Crédits offerts";
            } else if (n.type === "referral_bonus") {
              label = "Bonus de parrainage";
            } else if (n.type === "credits_purchased") {
              label = "Achat de crédits";
            } else if (n.type === "new_offer") {
              label = "Nouvelle offre reçue";
            }

            const isSelected = selectedIds.includes(n.id);

            return (
              <div
                key={n.id}
                className={`flex items-start gap-2 rounded-xl px-3 py-2 text-xs shadow-sm ring-1 ${
                  isUnread
                    ? "bg-slate-50 ring-sky-100"
                    : "bg-white ring-slate-100"
                } ${isSelected ? "ring-2 ring-sky-400" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(n.id)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  type="button"
                  onClick={() => handleItemClick(n)}
                  className="flex flex-1 flex-col text-left"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-800">{label}</span>
                    {isUnread && (
                      <span className="inline-flex h-1.5 w-1.5 rounded-full bg-sky-500" />
                    )}
                  </div>
                  {n.data?.task_title && (
                    <p className="mt-1 text-[11px] text-slate-600 truncate">
                      {n.data.task_title}
                    </p>
                  )}
                  <p className="mt-1 text-[10px] text-slate-500">
                    {new Date(n.created_at).toLocaleString("fr-FR")}
                  </p>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-full border border-slate-200 px-3 py-1 font-medium disabled:opacity-50"
          >
            Précédent
          </button>
          <span>
            Page {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-full border border-slate-200 px-3 py-1 font-medium disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
