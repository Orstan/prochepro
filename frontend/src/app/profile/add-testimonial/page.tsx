"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

declare global {
  interface Window {
    cloudinary: any;
  }
}

type UserTestimonial = {
  id: number;
  cloudinary_public_id: string;
  name: string;
  role: string;
  text: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export default function AddTestimonialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [testimonialText, setTestimonialText] = useState("");
  const [uploadedVideo, setUploadedVideo] = useState<any>(null);
  const [myTestimonials, setMyTestimonials] = useState<UserTestimonial[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    // Load Cloudinary upload widget script
    const script = document.createElement("script");
    script.src = "https://upload-widget.cloudinary.com/global/all.js";
    script.async = true;
    document.body.appendChild(script);

    fetchMyTestimonials();

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function fetchMyTestimonials() {
    try {
      const token = localStorage.getItem("prochepro_token");
      const res = await fetch(`${API_BASE_URL}/api/my-testimonials`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setMyTestimonials(data);
      }
    } catch (err) {
      // Error fetching testimonials
    }
  }

  function openUploadWidget() {
    if (!window.cloudinary) {
      setToast({ message: "Widget de téléchargement non disponible", type: "error" });
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: "dbcrrwox1",
        uploadPreset: "video_testimonials",
        sources: ["local", "camera"],
        resourceType: "video",
        maxFileSize: 52428800, // 50MB
        clientAllowedFormats: ["mp4", "webm", "mov"],
        maxVideoDuration: 60,
        multiple: false,
        folder: "testimonials",
        cropping: false,
        showSkipCropButton: false,
        styles: {
          palette: {
            window: "#FFFFFF",
            windowBorder: "#0EA5E9",
            tabIcon: "#0EA5E9",
            menuIcons: "#475569",
            textDark: "#000000",
            textLight: "#FFFFFF",
            link: "#0EA5E9",
            action: "#0EA5E9",
            inactiveTabIcon: "#94A3B8",
            error: "#EF4444",
            inProgress: "#0EA5E9",
            complete: "#10B981",
            sourceBg: "#F8FAFC",
          },
        },
      },
      (error: any, result: any) => {
        if (error) {
          setToast({ message: "Erreur lors du téléchargement", type: "error" });
          return;
        }

        if (result.event === "success") {
          setUploadedVideo({
            public_id: result.info.public_id,
            duration: result.info.duration,
            thumbnail_url: result.info.thumbnail_url,
          });
          setToast({ message: "Vidéo téléchargée avec succès!", type: "success" });
        }
      }
    );

    widget.open();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!uploadedVideo) {
      setToast({ message: "Veuillez télécharger une vidéo d'abord", type: "error" });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("prochepro_token");
      const res = await fetch(`${API_BASE_URL}/api/my-testimonials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cloudinary_public_id: uploadedVideo.public_id,
          text: testimonialText || null,
          duration: Math.round(uploadedVideo.duration || 0),
          thumbnail_url: uploadedVideo.thumbnail_url || null,
        }),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la soumission");
      }

      const data = await res.json();
      setToast({ message: data.message || "Témoignage soumis avec succès!", type: "success" });
      
      // Reset form
      setTestimonialText("");
      setUploadedVideo(null);
      
      // Refresh list
      fetchMyTestimonials();
    } catch (err) {
      setToast({ message: "Erreur lors de la soumission", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce témoignage ?")) return;

    try {
      const token = localStorage.getItem("prochepro_token");
      const res = await fetch(`${API_BASE_URL}/api/my-testimonials/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setToast({ message: "Témoignage supprimé", type: "success" });
        fetchMyTestimonials();
      } else {
        const data = await res.json();
        setToast({ message: data.error || "Erreur", type: "error" });
      }
    } catch (err) {
      setToast({ message: "Erreur lors de la suppression", type: "error" });
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">⏳ En attente</span>;
      case "approved":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">✅ Approuvé</span>;
      case "rejected":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">❌ Rejeté</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 rounded-lg px-6 py-3 shadow-lg ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white animate-in slide-in-from-right`}>
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm text-sky-600 hover:text-sky-700 mb-4"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Retour au profil</span>
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-700 mb-3">
            <span>📹</span>
            <span>Témoignage vidéo</span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Partagez votre expérience
          </h1>
          <p className="mt-2 text-slate-600">
            Aidez d&apos;autres utilisateurs en partageant votre expérience avec ProchePro
          </p>
        </div>

        {/* Upload Form */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Nouveau témoignage
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Video Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Vidéo (max 60 secondes)
              </label>
              {!uploadedVideo ? (
                <button
                  type="button"
                  onClick={openUploadWidget}
                  className="w-full rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center hover:border-sky-400 hover:bg-sky-50 transition-colors"
                >
                  <div className="text-4xl mb-2">🎬</div>
                  <p className="text-sm font-medium text-slate-700">
                    Cliquez pour télécharger une vidéo
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    MP4, WebM ou MOV (max 50MB, 60s)
                  </p>
                </button>
              ) : (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">✅</div>
                      <div>
                        <p className="text-sm font-medium text-green-900">
                          Vidéo téléchargée
                        </p>
                        <p className="text-xs text-green-700">
                          Durée: {Math.round(uploadedVideo.duration || 0)}s
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedVideo(null)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Testimonial Text */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Votre message (optionnel)
              </label>
              <textarea
                value={testimonialText}
                onChange={(e) => setTestimonialText(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Décrivez votre expérience avec ProchePro..."
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
              <p className="mt-1 text-xs text-slate-500">
                {testimonialText.length}/500 caractères
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !uploadedVideo}
              className="w-full rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "Envoi en cours..." : "Soumettre mon témoignage"}
            </button>
          </form>

          <div className="mt-4 rounded-lg bg-blue-50 p-4">
            <div className="flex gap-3">
              <div className="text-xl">ℹ️</div>
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Conseils pour votre vidéo:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Présentez-vous brièvement</li>
                  <li>Parlez de votre expérience avec ProchePro</li>
                  <li>Soyez authentique et naturel</li>
                  <li>Durée recommandée: 15-30 secondes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* My Testimonials */}
        {myTestimonials.length > 0 && (
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Mes témoignages
            </h2>

            <div className="space-y-3">
              {myTestimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="rounded-lg border border-slate-200 p-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(testimonial.status)}
                        <span className="text-xs text-slate-500">
                          {new Date(testimonial.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {testimonial.text && (
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {testimonial.text}
                        </p>
                      )}
                    </div>
                    {testimonial.status === "pending" && (
                      <button
                        onClick={() => handleDelete(testimonial.id)}
                        className="ml-4 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
