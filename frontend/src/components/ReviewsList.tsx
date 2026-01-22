"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import UserAvatar from "./UserAvatar";

interface Review {
  id: number;
  task_id: number;
  rating: number;
  comment?: string | null;
  direction: string;
  created_at: string;
  task?: { id: number; title: string };
  client?: { id: number; name: string; avatar?: string | null };
  prestataire?: { id: number; name: string; avatar?: string | null };
}

interface ReviewsListProps {
  userId: number;
  userRole: "client" | "prestataire";
}

export default function ReviewsList({ userId, userRole }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [userId, userRole]);

  async function fetchReviews() {
    setLoading(true);
    try {
      const endpoint = userRole === "prestataire"
        ? `${API_BASE_URL}/api/reviews/prestataire/${userId}`
        : `${API_BASE_URL}/api/reviews/client/${userId}`;
      
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setReviews(data ?? []);
      }
    } catch (err) {
      // Error fetching reviews
    } finally {
      setLoading(false);
    }
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-20 bg-slate-100 rounded-xl" />
        <div className="h-20 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div>
      {/* Summary */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-4 mb-4 p-4 bg-slate-50 rounded-xl">
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900">{averageRating}</div>
            <div className="flex items-center justify-center gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(Number(averageRating))
                      ? "text-amber-400"
                      : "text-slate-200"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
          <div className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{reviews.length}</span> avis
          </div>
        </div>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-xl">
          <div className="text-3xl mb-2">⭐</div>
          <p className="text-sm text-slate-600">Aucun avis pour le moment</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => {
            const reviewer = userRole === "prestataire" ? review.client : review.prestataire;
            return (
              <div
                key={review.id}
                className="p-4 bg-white rounded-xl border border-slate-200"
              >
                <div className="flex items-start gap-3">
                  <UserAvatar
                    avatar={reviewer?.avatar}
                    name={reviewer?.name || "Utilisateur"}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-900 text-sm">
                        {reviewer?.name || "Utilisateur"}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`h-3.5 w-3.5 ${
                              star <= review.rating
                                ? "text-amber-400"
                                : "text-slate-200"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    {review.task && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {review.task.title}
                      </p>
                    )}
                    {review.comment && (
                      <p className="text-sm text-slate-700 mt-2">
                        {review.comment}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(review.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
