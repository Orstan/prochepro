"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";
import { API_BASE_URL } from "@/lib/api";
import { trackCompleteRegistration } from "@/lib/meta-pixel";
import { trackRegistrationConversion, trackRegisterPageView } from "@/lib/google-ads";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Anti-bot field
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Відстеження відвідування сторінки реєстрації
  useEffect(() => {
    // Викликаємо функцію відстеження для нового тегу Google Ads
    trackRegisterPageView();
  }, []);

  // Format phone number for France (remove spaces, keep only digits)
  function formatPhoneNumber(value: string): string {
    // Remove all non-digit characters except +
    const cleaned = value.replace(/[^\d]/g, '');
    // Limit to 9 digits (French mobile without country code)
    return cleaned.slice(0, 9);
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  }

  // Get referral code from URL
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setReferralCode(ref);
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validate password confirmation
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    // Validate phone number (must be 9 digits for French mobile)
    if (phone && phone.length !== 9) {
      setError("Le numéro de téléphone doit contenir 9 chiffres (sans le 0 initial).");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ 
          name, 
          email, 
          phone: phone ? `+33${phone}` : undefined, // Add French country code
          password, 
          referral_code: referralCode || undefined,
          website: honeypot, // Honeypot field
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const message =
          data?.message ||
          (data?.errors && Object.values<string[]>(data.errors)[0][0]) ||
          "Erreur lors de l'inscription.";
        throw new Error(message);
      }

      // Track registration conversion for Meta Pixel
      trackCompleteRegistration();
      // Track registration conversion for Google Ads
      trackRegistrationConversion();
      // Redirect to verification page with email
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
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
          Créer un compte
        </h1>
        <p className="text-slate-700 mb-4 text-sm">
          Rejoignez ProchePro et profitez de tous les avantages.
        </p>

        <SocialAuthButtons />

        {referralCode && (
          <div className="mb-4 rounded-lg bg-violet-50 border border-violet-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              <span className="text-sm font-medium text-violet-800">
                Vous avez été parrainé ! Vous recevrez 5€ gratuits après votre première action.
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">
              Nom complet
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="Votre nom et prénom"
            />
          </div>

                    <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="Votre adresse e-mail"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">
              Téléphone <span className="text-slate-400 font-normal">(optionnel)</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-sm">
                +33
              </span>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                className="block w-full rounded-r-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                placeholder="6 12 34 56 78"
                maxLength={9}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Entrez votre numéro sans le 0 initial (ex: 612345678)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">
              Mot de passe
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Votre mot de passe (min. 8 caractères)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">
              Confirmer le mot de passe
            </label>
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirmez votre mot de passe"
            />
          </div>

          {/* Referral code field */}
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">
              Code de parrainage <span className="text-slate-400 font-normal">(optionnel)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                maxLength={10}
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                placeholder="Ex: ABC12345"
              />
              {referralCode && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Vous et votre parrain recevrez chacun 1 crédit gratuit !
            </p>
          </div>

          {/* Honeypot field - hidden from users, visible to bots */}
          <div className="absolute -left-[9999px]" aria-hidden="true">
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
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
            {loading ? "Création du compte..." : "S'inscrire"}
          </button>
        </form>

        {/* Free credit info */}
        <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3">
          <div className="flex items-start gap-2">
            <svg className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            <div>
              <p className="text-sm font-medium text-emerald-800">
                3 crédits offerts à l&apos;inscription !
              </p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Publiez des annonces ou proposez vos services dès maintenant.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Vous avez déjà un compte ?{" "}
          <a
            href="/auth/login"
            className="font-medium text-[#1E88E5] hover:text-[#1565C0]"
          >
            Se connecter
          </a>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500">Chargement...</div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
