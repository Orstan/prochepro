"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import AdminBackButton from "@/components/AdminBackButton";

type VideoTestimonial = {
  id: number;
  cloudinary_public_id: string;
  name: string;
  role: string | null;
  text: string | null;
  duration: number | null;
  thumbnail_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

type Toast = {
  message: string;
  type: "success" | "error";
};

export default function AdminVideoTestimonialsPage() {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState<VideoTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    cloudinary_public_id: "",
    name: "",
    role: "",
    text: "",
    duration: "",
    thumbnail_url: "",
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("prochepro_user");
    
    if (!storedUser) {
      router.push("/auth/login");
      return;
    }

    const user = JSON.parse(storedUser);
    
    if (!user.is_admin) {
      alert("Accès refusé. Droits administrateur requis.");
      router.push("/dashboard");
      return;
    }

    fetchTestimonials();
  }, [router]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function fetchTestimonials() {
    try {
      const token = localStorage.getItem("prochepro_token");
      const res = await fetch(`${API_BASE_URL}/api/admin/video-testimonials`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setTestimonials(data);
    } catch (err) {
      setToast({ message: "Erreur lors du chargement", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("prochepro_token");
      const url = editingId 
        ? `${API_BASE_URL}/api/admin/video-testimonials/${editingId}`
        : `${API_BASE_URL}/api/admin/video-testimonials`;
      
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          duration: formData.duration ? parseInt(formData.duration) : null,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      setToast({ message: editingId ? "Modifié avec succès" : "Créé avec succès", type: "success" });
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchTestimonials();
    } catch (err) {
      setToast({ message: "Erreur lors de la sauvegarde", type: "error" });
    }
  }

  async function handleToggleActive(id: number) {
    try {
      const token = localStorage.getItem("prochepro_token");
      const res = await fetch(`${API_BASE_URL}/api/admin/video-testimonials/${id}/toggle`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to toggle");

      setToast({ message: "Statut modifié", type: "success" });
      fetchTestimonials();
    } catch (err) {
      setToast({ message: "Erreur", type: "error" });
    }
  }

  async function handleApprove(id: number) {
    try {
      const token = localStorage.getItem("prochepro_token");
      const res = await fetch(`${API_BASE_URL}/api/admin/video-testimonials/${id}/approve`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to approve");

      setToast({ message: "Témoignage approuvé", type: "success" });
      fetchTestimonials();
    } catch (err) {
      setToast({ message: "Erreur", type: "error" });
    }
  }

  async function handleReject(id: number) {
    if (!confirm("Êtes-vous sûr de vouloir rejeter ce témoignage ?")) return;

    try {
      const token = localStorage.getItem("prochepro_token");
      const res = await fetch(`${API_BASE_URL}/api/admin/video-testimonials/${id}/reject`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to reject");

      setToast({ message: "Témoignage rejeté", type: "success" });
      fetchTestimonials();
    } catch (err) {
      setToast({ message: "Erreur", type: "error" });
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce témoignage ?")) return;

    try {
      const token = localStorage.getItem("prochepro_token");
      const res = await fetch(`${API_BASE_URL}/api/admin/video-testimonials/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete");

      setToast({ message: "Supprimé avec succès", type: "success" });
      fetchTestimonials();
    } catch (err) {
      setToast({ message: "Erreur lors de la suppression", type: "error" });
    }
  }

  function handleEdit(testimonial: VideoTestimonial) {
    setEditingId(testimonial.id);
    setFormData({
      cloudinary_public_id: testimonial.cloudinary_public_id,
      name: testimonial.name,
      role: testimonial.role || "",
      text: testimonial.text || "",
      duration: testimonial.duration?.toString() || "",
      thumbnail_url: testimonial.thumbnail_url || "",
      is_active: testimonial.is_active,
      sort_order: testimonial.sort_order,
    });
    setShowForm(true);
  }

  function resetForm() {
    setFormData({
      cloudinary_public_id: "",
      name: "",
      role: "",
      text: "",
      duration: "",
      thumbnail_url: "",
      is_active: true,
      sort_order: 0,
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="animate-spin h-8 w-8 border-4 border-sky-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] py-4 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 rounded-lg px-4 sm:px-6 py-2 sm:py-3 shadow-lg text-sm sm:text-base ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}>
            {toast.message}
          </div>
        )}

        <AdminBackButton label="Retour au Dashboard" />

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Témoignages Vidéo</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Gérez les vidéos témoignages affichés sur le site
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                resetForm();
              }}
              className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
            >
              + Nouveau témoignage
            </button>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4 overflow-y-auto">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-4 sm:p-6 shadow-xl my-8">
              <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-slate-900">
                {editingId ? "Modifier" : "Ajouter"} un témoignage
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Cloudinary Public ID *
                  </label>
                  <input
                    type="text"
                    value={formData.cloudinary_public_id}
                    onChange={(e) => setFormData({...formData, cloudinary_public_id: e.target.value})}
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 sm:px-4 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    placeholder="testimonials/video_abc123"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    ID de la vidéo uploadée sur Cloudinary
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      className="w-full rounded-lg border border-slate-300 px-3 sm:px-4 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Rôle
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full rounded-lg border border-slate-300 px-3 sm:px-4 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    >
                      <option value="">-- Choisir --</option>
                      <option value="client">Client</option>
                      <option value="prestataire">Prestataire</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Texte du témoignage
                  </label>
                  <textarea
                    value={formData.text}
                    onChange={(e) => setFormData({...formData, text: e.target.value})}
                    rows={3}
                    className="w-full rounded-lg border border-slate-300 px-3 sm:px-4 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Durée (secondes)
                    </label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      min="1"
                      max="120"
                      className="w-full rounded-lg border border-slate-300 px-3 sm:px-4 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Ordre d&apos;affichage
                    </label>
                    <input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
                      className="w-full rounded-lg border border-slate-300 px-3 sm:px-4 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Statut
                    </label>
                    <label className="flex items-center gap-2 mt-3">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                        className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-2 focus:ring-sky-500/20"
                      />
                      <span className="text-sm text-slate-700">Actif</span>
                    </label>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      resetForm();
                    }}
                    className="w-full sm:w-auto rounded-lg bg-slate-200 px-4 py-2.5 sm:py-2 text-sm font-medium text-slate-700 hover:bg-slate-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto rounded-lg bg-sky-500 px-4 py-2.5 sm:py-2 text-sm font-medium text-white hover:bg-sky-600"
                  >
                    {editingId ? "Modifier" : "Créer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* List */}
        {testimonials.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <div className="text-6xl mb-4">📹</div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Aucun témoignage
            </h3>
            <p className="text-slate-600 mb-6">
              Commencez par ajouter votre premier témoignage vidéo
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="rounded-xl bg-white p-3 sm:p-4 shadow-sm ring-1 ring-slate-200 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-0 sm:justify-between">
                  <div className="flex-1 w-full">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-sm sm:text-base font-semibold text-slate-900">{testimonial.name}</h3>
                      {testimonial.role && (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          testimonial.role === "client" 
                            ? "bg-sky-100 text-sky-700" 
                            : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {testimonial.role === "client" ? "Client" : "Prestataire"}
                        </span>
                      )}
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        testimonial.is_active 
                          ? "bg-green-100 text-green-700" 
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {testimonial.is_active ? "Actif" : "Inactif"}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        (testimonial as any).status === "approved"
                          ? "bg-emerald-100 text-emerald-700"
                          : (testimonial as any).status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {(testimonial as any).status === "approved" && "✅ Approuvé"}
                        {(testimonial as any).status === "pending" && "⏳ En attente"}
                        {(testimonial as any).status === "rejected" && "❌ Rejeté"}
                      </span>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-slate-600 mb-2 break-all">
                      <span className="font-medium">ID:</span> {testimonial.cloudinary_public_id}
                    </p>
                    
                    {testimonial.text && (
                      <p className="text-sm text-slate-600 line-clamp-2">{testimonial.text}</p>
                    )}
                    
                    <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                      {testimonial.duration && <span>Durée: {testimonial.duration}s</span>}
                      <span>Ordre: {testimonial.sort_order}</span>
                      <span>{new Date(testimonial.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:ml-4">
                    {(testimonial as any).status === "pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(testimonial.id)}
                          className="rounded-lg bg-green-100 px-2 sm:px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-200"
                        >
                          ✅ <span className="hidden xs:inline">Approuver</span>
                        </button>
                        <button
                          onClick={() => handleReject(testimonial.id)}
                          className="rounded-lg bg-red-100 px-2 sm:px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200"
                        >
                          ❌ <span className="hidden xs:inline">Rejeter</span>
                        </button>
                      </>
                    )}
                    {(testimonial as any).status !== "pending" && (
                      <button
                        onClick={() => handleToggleActive(testimonial.id)}
                        className="rounded-lg bg-slate-100 px-2 sm:px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
                        title={testimonial.is_active ? "Désactiver" : "Activer"}
                      >
                        {testimonial.is_active ? "👁️" : "👁️‍🗨️"}
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(testimonial)}
                      className="rounded-lg bg-sky-100 px-2 sm:px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-200"
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(testimonial.id)}
                      className="rounded-lg bg-red-100 px-2 sm:px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
