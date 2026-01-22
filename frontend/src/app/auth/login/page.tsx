"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";
import { API_BASE_URL } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState(""); // email or phone
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detect if input is phone or email
  function isPhoneNumber(value: string): boolean {
    // Check if it starts with + or contains only digits (after removing spaces)
    const cleaned = value.replace(/\s/g, '');
    return /^(\+33|0033|33|0)?[1-9]\d{8}$/.test(cleaned) || /^\d{9,10}$/.test(cleaned);
  }

  // Format phone to international format
  function formatPhoneForApi(value: string): string {
    const cleaned = value.replace(/\s/g, '');
    // If starts with 0, replace with +33
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      return '+33' + cleaned.slice(1);
    }
    // If starts with 33, add +
    if (cleaned.startsWith('33') && cleaned.length === 11) {
      return '+' + cleaned;
    }
    // If starts with 0033, replace with +33
    if (cleaned.startsWith('0033')) {
      return '+33' + cleaned.slice(4);
    }
    // If just 9 digits, add +33
    if (/^\d{9}$/.test(cleaned)) {
      return '+33' + cleaned;
    }
    // Already has +33
    if (cleaned.startsWith('+33')) {
      return cleaned;
    }
    return cleaned;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Determine if identifier is email or phone
    const isPhone = isPhoneNumber(identifier);
    const loginData = isPhone 
      ? { phone: formatPhoneForApi(identifier), password }
      : { email: identifier, password };

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(loginData),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? "Erreur de connexion.");
      }

      const data = await res.json().catch(() => null);

      if (data?.user) {
        try {
          localStorage.setItem("prochepro_user", JSON.stringify(data.user));
          if (data?.token) {
            localStorage.setItem("prochepro_token", data.token);
          }
          // Dispatch event to update SiteShell immediately
          window.dispatchEvent(new Event("prochepro_login"));
          
          // Register push notifications after login
          setTimeout(() => {
            if (typeof (window as any).registerPushNotifications === 'function') {
              (window as any).registerPushNotifications();
            }
          }, 1000);
        } catch {
          // ignore storage errors
        }
      }

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">
          Connexion
        </h1>
        <p className="text-slate-700 mb-6 text-sm">
          Connectez-vous pour accéder à votre compte ProchePro.
        </p>

        <SocialAuthButtons />

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">
              E-mail ou téléphone
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="vous@example.com ou 06 12 34 56 78"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-800">
                Mot de passe
              </label>
              <a
                href="/auth/forgot-password"
                className="text-xs text-sky-600 hover:text-sky-700"
              >
                Mot de passe oublié ?
              </a>
            </div>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#1E88E5] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#1565C0] disabled:opacity-60 disabled:cursor-not-allowed"
         >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-500">
          Pas encore de compte ? {" "}
          <a
            href="/auth/register"
            className="font-medium text-[#1E88E5] hover:text-[#1565C0]"
          >
            Créer un compte
          </a>
        </p>
      </div>
    </div>
  );
}
