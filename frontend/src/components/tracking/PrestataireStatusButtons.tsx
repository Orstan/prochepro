"use client";

import { useState } from "react";
import { API_BASE_URL } from "@/lib/api";

type Props = {
  taskId: number;
  currentStatus: string | null;
  locationType: string | null;
  onStatusUpdate: () => void;
};

export default function PrestataireStatusButtons({ taskId, currentStatus, locationType, onStatusUpdate }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Кнопки тільки для завдань "Sur place" (on_site)
  if (locationType !== "on_site") {
    return null;
  }

  async function handleOnTheWay() {
    setLoading(true);
    setError(null);

    try {
      // Запитуємо дозвіл на геолокацію
      if (!navigator.geolocation) {
        throw new Error("La géolocalisation n'est pas supportée par votre navigateur");
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const token = localStorage.getItem("prochepro_token");
            
            // Оновлюємо локацію
            await fetch(`${API_BASE_URL}/api/location/update`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                task_id: taskId,
              }),
            });

            // Увімкнути шерінг локації
            await fetch(`${API_BASE_URL}/api/location/toggle-sharing`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ enabled: true }),
            });

            // Оновлюємо статус завдання
            const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/on-the-way`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });

            if (!res.ok) {
              const data = await res.json();
              throw new Error(data.message || "Erreur lors de la mise à jour du statut");
            }

            // Продовжуємо оновлювати локацію кожні 10 секунд
            startLocationTracking();
            
            // Перезавантажуємо сторінку для оновлення UI
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur");
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          setError("Veuillez autoriser l'accès à votre position");
          setLoading(false);
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
      setLoading(false);
    }
  }

  async function handleArrived() {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("prochepro_token");
      const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/arrived`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur");
      }

      // Вимкнути трекування
      stopLocationTracking();
      
      // Перезавантажуємо сторінку для оновлення UI
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  function startLocationTracking() {
    const intervalId = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const token = localStorage.getItem("prochepro_token");
            await fetch(`${API_BASE_URL}/api/location/update`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                task_id: taskId,
              }),
            });
          },
          (err) => { /* Geolocation error */ }
        );
      }
    }, 10000); // Кожні 10 секунд

    // Зберігаємо ID інтервалу
    if (typeof window !== "undefined") {
      (window as any).locationTrackingInterval = intervalId;
    }
  }

  function stopLocationTracking() {
    if (typeof window !== "undefined" && (window as any).locationTrackingInterval) {
      clearInterval((window as any).locationTrackingInterval);
      (window as any).locationTrackingInterval = null;
    }
  }

  if (currentStatus === "arrived") {
    return (
      <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✅</span>
          <div>
            <p className="text-sm font-semibold text-green-800">Vous êtes arrivé</p>
            <p className="text-xs text-green-600">Le client a été notifié</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentStatus === "on_the_way") {
    return (
      <div className="space-y-3">
        <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚗</span>
            <div>
              <p className="text-sm font-semibold text-blue-800">En route</p>
              <p className="text-xs text-blue-600">Votre position est partagée avec le client</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleArrived}
          disabled={loading}
          className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Chargement..." : "Je suis arrivé"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleOnTheWay}
        disabled={loading}
        className="w-full rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-50"
      >
        {loading ? "Chargement..." : "Je suis en route"}
      </button>
      
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
