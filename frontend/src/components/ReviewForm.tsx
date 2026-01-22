"use client";

import { useState, FormEvent } from "react";
import { API_BASE_URL } from "@/lib/api";
import ReviewPhotoUploader from "./ReviewPhotoUploader";

interface ReviewFormProps {
  taskId: number;
  clientId: number;
  prestataireId: number;
  userRole: "client" | "prestataire";
  onSuccess?: () => void;
}

export default function ReviewForm({
  taskId,
  clientId,
  prestataireId,
  userRole,
  onSuccess,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Veuillez sélectionner une note.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = userRole === "client"
        ? `${API_BASE_URL}/api/tasks/${taskId}/reviews`
        : `${API_BASE_URL}/api/tasks/${taskId}/reviews/from-prestataire`;

      const body = userRole === "client"
        ? { client_id: clientId, prestataire_id: prestataireId, rating, comment: comment || null, photos: photos.length > 0 ? photos : null }
        : { prestataire_id: prestataireId, rating, comment: comment || null, photos: photos.length > 0 ? photos : null };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Une erreur est survenue.");
      }

      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="p-6 bg-emerald-50 rounded-xl text-center">
        <div className="text-3xl mb-2">✅</div>
        <h3 className="font-semibold text-emerald-800">Merci pour votre avis !</h3>
        <p className="text-sm text-emerald-600 mt-1">
          Votre avis a été publié avec succès.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-slate-50 rounded-xl">
      <h3 className="font-semibold text-slate-900 mb-4">
        Laisser un avis
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Star rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Note *
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 focus:outline-none"
            >
              <svg
                className={`h-8 w-8 transition-colors ${
                  star <= (hoverRating || rating)
                    ? "text-amber-400"
                    : "text-slate-200"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
          <span className="ml-2 text-sm text-slate-600">
            {rating > 0 && (
              <>
                {rating === 1 && "Très mauvais"}
                {rating === 2 && "Mauvais"}
                {rating === 3 && "Correct"}
                {rating === 4 && "Bien"}
                {rating === 5 && "Excellent"}
              </>
            )}
          </span>
        </div>
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Commentaire (optionnel)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Partagez votre expérience..."
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
      </div>

      {/* Photo Uploader */}
      <div className="mb-4">
        <ReviewPhotoUploader 
          onPhotosChange={setPhotos}
          initialPhotos={photos}
          maxPhotos={5}
        />
      </div>

      <button
        type="submit"
        disabled={loading || rating === 0}
        className="w-full inline-flex items-center justify-center rounded-full bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Envoi en cours..." : "Publier l'avis"}
      </button>
    </form>
  );
}
