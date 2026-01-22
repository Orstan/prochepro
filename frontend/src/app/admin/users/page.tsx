"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UserAvatar from "@/components/UserAvatar";
import { API_BASE_URL } from "@/lib/api";
import AdminBackButton from "@/components/AdminBackButton";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  city?: string;
  avatar?: string;
  created_at: string;
  email_verified_at?: string;
  is_blocked?: boolean;
  is_admin?: boolean;
}

interface UserCredits {
  client: { balance: number; has_free: boolean };
  prestataire: { balance: number; has_free: boolean; has_unlimited: boolean };
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "client" | "prestataire">("all");
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  
  // Credits modal state
  const [creditsModal, setCreditsModal] = useState<{ user: User; credits: UserCredits | null } | null>(null);
  const [creditsAmount, setCreditsAmount] = useState(1);
  const [creditsType, setCreditsType] = useState<"client" | "prestataire">("client");
  const [creditsReason, setCreditsReason] = useState("");
  const [addingCredits, setAddingCredits] = useState(false);

  useEffect(() => {
    checkAdmin();
    fetchUsers();
  }, []);

  function checkAdmin() {
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
      setCurrentUser(parsed);
    } catch {
      router.replace("/auth/login");
    }
  }

  function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("prochepro_token");
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  }

  async function fetchUsers() {
    setLoading(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data ?? []);
      } else {
        setUsers([]);
      }
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  async function toggleBlockUser(user: User) {
    if (user.is_admin) {
      alert("Impossible de bloquer un administrateur");
      return;
    }
    
    setActionLoading(user.id);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${user.id}/toggle-status`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        fetchUsers();
      } else {
        alert("Erreur lors de l'opération");
      }
    } catch {
      alert("Erreur réseau");
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteUser(user: User) {
    if (user.is_admin) {
      alert("Impossible de supprimer un administrateur");
      return;
    }
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${user.name} ? Cette action est irréversible.`)) {
      return;
    }
    
    setActionLoading(user.id);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${user.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        fetchUsers();
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch {
      alert("Erreur réseau");
    } finally {
      setActionLoading(null);
    }
  }

  async function openCreditsModal(user: User) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${user.id}/credits`, {
        headers: getAuthHeaders(),
      });
      const credits = res.ok ? await res.json() : null;
      setCreditsModal({ user, credits });
      setCreditsType(user.role === "prestataire" ? "prestataire" : "client");
      setCreditsAmount(1);
      setCreditsReason("");
    } catch {
      setCreditsModal({ user, credits: null });
    }
  }

  async function addCredits() {
    if (!creditsModal) return;
    
    setAddingCredits(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${creditsModal.user.id}/credits`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          amount: creditsAmount,
          type: creditsType,
          reason: creditsReason || undefined,
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        alert(`Crédits ajoutés ! Nouveau solde: ${data.new_balance}`);
        setCreditsModal(null);
      } else {
        const err = await res.json();
        alert(err.message || "Erreur lors de l'ajout");
      }
    } catch {
      alert("Erreur réseau");
    } finally {
      setAddingCredits(false);
    }
  }

  const filteredUsers = users.filter((u) => {
    if (filter !== "all" && u.role !== filter) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && 
        !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function toggleSelectUser(userId: number) {
    setSelectedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  }

  function toggleSelectAll() {
    const selectableUsers = filteredUsers.filter(u => !u.is_admin).map(u => u.id);
    if (selectedUsers.length === selectableUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(selectableUsers);
    }
  }

  async function bulkDeleteUsers() {
    if (selectedUsers.length === 0) return;
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedUsers.length} utilisateur(s) ? Cette action est irréversible.`)) {
      return;
    }
    
    setBulkActionLoading(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/bulk-delete`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ user_ids: selectedUsers }),
      });
      
      if (res.ok) {
        alert(`${selectedUsers.length} utilisateur(s) supprimé(s)`);
        setSelectedUsers([]);
        fetchUsers();
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch {
      alert("Erreur réseau");
    } finally {
      setBulkActionLoading(false);
    }
  }

  async function bulkBlockUsers() {
    if (selectedUsers.length === 0) return;
    
    setBulkActionLoading(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/bulk-block`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ user_ids: selectedUsers, block: true }),
      });
      
      if (res.ok) {
        alert(`${selectedUsers.length} utilisateur(s) bloqué(s)`);
        setSelectedUsers([]);
        fetchUsers();
      } else {
        alert("Erreur lors du blocage");
      }
    } catch {
      alert("Erreur réseau");
    } finally {
      setBulkActionLoading(false);
    }
  }

  async function bulkUnblockUsers() {
    if (selectedUsers.length === 0) return;
    
    setBulkActionLoading(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/bulk-block`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ user_ids: selectedUsers, block: false }),
      });
      
      if (res.ok) {
        alert(`${selectedUsers.length} utilisateur(s) débloqué(s)`);
        setSelectedUsers([]);
        fetchUsers();
      } else {
        alert("Erreur lors du déblocage");
      }
    } catch {
      alert("Erreur réseau");
    } finally {
      setBulkActionLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
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
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">Gestion des utilisateurs</h1>
      </div>

      {/* Filters - Mobile responsive */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher..."
          className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as "all" | "client" | "prestataire")}
          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
        >
          <option value="all">Tous</option>
          <option value="client">Clients</option>
          <option value="prestataire">Prestataires</option>
        </select>
      </div>

      {/* Bulk Actions Bar */}
      {selectedUsers.length > 0 && (
        <div className="mb-4 rounded-lg bg-sky-50 border border-sky-200 p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm font-medium text-sky-900">
              {selectedUsers.length} utilisateur(s) sélectionné(s)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={bulkUnblockUsers}
                disabled={bulkActionLoading}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                ✓ Débloquer
              </button>
              <button
                onClick={bulkBlockUsers}
                disabled={bulkActionLoading}
                className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 disabled:opacity-50"
              >
                🚫 Bloquer
              </button>
              <button
                onClick={bulkDeleteUsers}
                disabled={bulkActionLoading}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                🗑️ Supprimer
              </button>
              <button
                onClick={() => setSelectedUsers([])}
                className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-300"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats - Mobile responsive */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
        <div className="rounded-xl bg-slate-100 p-3 md:p-4 text-center">
          <p className="text-xl md:text-2xl font-bold text-slate-900">{users.length}</p>
          <p className="text-[10px] md:text-xs text-slate-600">Total</p>
        </div>
        <div className="rounded-xl bg-blue-50 p-3 md:p-4 text-center">
          <p className="text-xl md:text-2xl font-bold text-blue-700">{users.filter(u => u.role === "client").length}</p>
          <p className="text-[10px] md:text-xs text-blue-600">Clients</p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-3 md:p-4 text-center">
          <p className="text-xl md:text-2xl font-bold text-emerald-700">{users.filter(u => u.role === "prestataire").length}</p>
          <p className="text-[10px] md:text-xs text-emerald-600">Prestataires</p>
        </div>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-slate-200 bg-white">
          <p className="text-slate-600">Aucun utilisateur trouvé</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 w-12">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length > 0 && selectedUsers.length === filteredUsers.filter(u => !u.is_admin).length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-600">Utilisateur</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-600">Rôle</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-600">Ville</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-600">Inscrit le</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-600">Statut</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      {!user.is_admin && (
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleSelectUser(user.id)}
                          className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar avatar={user.avatar} name={user.name} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === "client" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {user.role === "client" ? "Client" : "Prestataire"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{user.city || "—"}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {new Date(user.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3">
                      {user.is_blocked ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Bloqué</span>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.email_verified_at ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {user.email_verified_at ? "Vérifié" : "Non vérifié"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openCreditsModal(user)} className="text-xs text-violet-600 hover:text-violet-700 font-medium">
                          💳 Crédits
                        </button>
                        <button onClick={() => router.push(`/${user.role === "client" ? "clients" : "prestataires"}/${user.id}`)} className="text-xs text-sky-600 hover:text-sky-700 font-medium">
                          Voir
                        </button>
                        {!user.is_admin && (
                          <>
                            <button onClick={() => toggleBlockUser(user)} disabled={actionLoading === user.id} className={`text-xs font-medium disabled:opacity-50 ${user.is_blocked ? "text-emerald-600" : "text-amber-600"}`}>
                              {user.is_blocked ? "Débloquer" : "Bloquer"}
                            </button>
                            <button onClick={() => deleteUser(user)} disabled={actionLoading === user.id} className="text-xs text-red-600 font-medium disabled:opacity-50">
                              Supprimer
                            </button>
                          </>
                        )}
                        {user.is_admin && <span className="text-xs text-violet-600 font-medium">Admin</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredUsers.map((user) => (
              <div key={user.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between mb-3">
                  {!user.is_admin && (
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleSelectUser(user.id)}
                      className="w-4 h-4 mt-1 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                  )}
                  <div className="flex items-center gap-3">
                    <UserAvatar avatar={user.avatar} name={user.name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[150px]">{user.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${
                    user.role === "client" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {user.role === "client" ? "Client" : "Prestataire"}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                  <span>📍 {user.city || "—"}</span>
                  <span>📅 {new Date(user.created_at).toLocaleDateString("fr-FR")}</span>
                  {user.is_blocked ? (
                    <span className="text-red-600">🚫 Bloqué</span>
                  ) : user.email_verified_at ? (
                    <span className="text-emerald-600">✓ Vérifié</span>
                  ) : (
                    <span className="text-amber-600">⏳ Non vérifié</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                  <button onClick={() => openCreditsModal(user)} className="flex-1 rounded-lg bg-violet-50 px-3 py-2 text-xs font-medium text-violet-700">
                    💳 Crédits
                  </button>
                  <button onClick={() => router.push(`/${user.role === "client" ? "clients" : "prestataires"}/${user.id}`)} className="flex-1 rounded-lg bg-sky-50 px-3 py-2 text-xs font-medium text-sky-700">
                    Voir profil
                  </button>
                  {!user.is_admin && (
                    <>
                      <button onClick={() => toggleBlockUser(user)} disabled={actionLoading === user.id} className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium ${user.is_blocked ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {user.is_blocked ? "Débloquer" : "Bloquer"}
                      </button>
                      <button onClick={() => deleteUser(user)} disabled={actionLoading === user.id} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Credits Modal */}
      {creditsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Ajouter des crédits</h3>
              <button onClick={() => setCreditsModal(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="mb-4 p-3 rounded-lg bg-slate-50">
              <p className="text-sm font-medium text-slate-900">{creditsModal.user.name}</p>
              <p className="text-xs text-slate-500">{creditsModal.user.email}</p>
              {creditsModal.credits && (
                <div className="mt-2 flex gap-4 text-xs">
                  <span className="text-blue-600">Client: {creditsModal.credits.client.balance} crédits</span>
                  <span className="text-emerald-600">Prestataire: {creditsModal.credits.prestataire.balance} crédits</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type de crédit</label>
                <select value={creditsType} onChange={(e) => setCreditsType(e.target.value as "client" | "prestataire")} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <option value="client">Client (annonces)</option>
                  <option value="prestataire">Prestataire (offres)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de crédits</label>
                <input type="number" min="1" max="100" value={creditsAmount} onChange={(e) => setCreditsAmount(parseInt(e.target.value) || 1)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Raison (optionnel)</label>
                <input type="text" value={creditsReason} onChange={(e) => setCreditsReason(e.target.value)} placeholder="Ex: Compensation, bonus..." className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setCreditsModal(null)} className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Annuler
              </button>
              <button onClick={addCredits} disabled={addingCredits} className="flex-1 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50">
                {addingCredits ? "Ajout..." : `Ajouter ${creditsAmount} crédit(s)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
