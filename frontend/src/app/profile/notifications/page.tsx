"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import MessengerSettings from "@/components/MessengerSettings";

interface User {
  id: number;
  name: string;
  email: string;
  email_notifications?: boolean;
  push_notifications?: boolean;
}

export default function NotificationSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem("prochepro_user");
    if (!stored) {
      router.replace("/auth/login");
      return;
    }

    try {
      const parsed: User = JSON.parse(stored);
      setUser(parsed);
      fetchSettings(parsed.id);
    } catch {
      router.replace("/auth/login");
    }
  }, [router]);

  async function fetchSettings(userId: number) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${userId}`);
      if (res.ok) {
        const data = await res.json();
        // Встановлюємо true за замовчуванням для всіх типів сповіщень
        setEmailNotifications(data.email_notifications !== false); // true якщо не вимкнено явно
        setPushNotifications(data.push_notifications !== false); // true якщо не вимкнено явно
      } else {
        // Якщо помилка запиту, все одно вмикаємо за замовчуванням
        setEmailNotifications(true);
        setPushNotifications(true);
      }
    } catch (err) {
      // Error fetching settings - вмикаємо за замовчуванням
      setEmailNotifications(true);
      setPushNotifications(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${user.id}/notification-settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_notifications: emailNotifications,
          push_notifications: pushNotifications,
        }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Paramètres enregistrés avec succès!" });
        
        // Update localStorage
        const updatedUser = { ...user, email_notifications: emailNotifications, push_notifications: pushNotifications };
        window.localStorage.setItem("prochepro_user", JSON.stringify(updatedUser));
      } else {
        setMessage({ type: "error", text: "Erreur lors de la sauvegarde." });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur de connexion." });
    } finally {
      setSaving(false);
    }
  }

  if (!user || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-2">Paramètres de notification</h1>
      <p className="text-sm text-slate-600 mb-8">
        Gérez comment vous souhaitez recevoir les notifications.
      </p>

      {message && (
        <div className={`mb-6 p-4 rounded-xl ${
          message.type === "success" 
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
            : "bg-rose-50 text-rose-700 border border-rose-200"
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 p-6 space-y-6">
        {/* Email Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Notifications par email</h3>
            <p className="text-sm text-slate-600 mt-1">
              Recevez des emails pour les nouvelles offres, messages et mises à jour.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEmailNotifications(!emailNotifications)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${
              emailNotifications ? "bg-sky-500" : "bg-slate-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                emailNotifications ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="border-t border-slate-100" />

        {/* Push Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Notifications push</h3>
            <p className="text-sm text-slate-600 mt-1">
              Recevez des notifications sonores en temps réel sur le site.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPushNotifications(!pushNotifications)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${
              pushNotifications ? "bg-sky-500" : "bg-slate-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                pushNotifications ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="border-t border-slate-100" />

        {/* Info */}
        <div className="bg-slate-50 rounded-xl p-4">
          <h4 className="font-medium text-slate-900 mb-2">Types de notifications</h4>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• Nouvelles offres sur vos annonces</li>
            <li>• Messages dans le chat</li>
            <li>• Offres acceptées ou refusées</li>
            <li>• Annonces terminées</li>
            <li>• Nouveaux avis</li>
          </ul>
        </div>
      </div>
      
      {/* Messenger Notifications */}
      <div className="mt-8">
        <MessengerSettings />
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-sky-500 px-6 py-2.5 font-medium text-white shadow-sm hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
