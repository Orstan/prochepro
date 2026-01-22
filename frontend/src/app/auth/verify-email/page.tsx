"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense, useRef, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState<"input" | "loading" | "success" | "error">("input");
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function handleCodeChange(index: number, value: string) {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);
    
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (digit && index === 5) {
      const fullCode = newCode.join("");
      if (fullCode.length === 6) {
        verifyCode(fullCode);
      }
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData.length === 6) {
      const newCode = pastedData.split("");
      setCode(newCode);
      verifyCode(pastedData);
    }
  }

  async function verifyCode(fullCode: string) {
    if (!email) {
      setStatus("error");
      setMessage("Email manquant. Veuillez vous réinscrire.");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: fullCode, email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Email vérifié avec succès !");
        
        // Update local storage if user data returned
        if (data.user) {
          const stored = localStorage.getItem("prochepro_user");
          if (stored) {
            const user = JSON.parse(stored);
            user.email_verified_at = data.user.email_verified_at;
            localStorage.setItem("prochepro_user", JSON.stringify(user));
          }
        }
      } else {
        setStatus("error");
        setMessage(data.message || "Code invalide.");
      }
    } catch {
      setStatus("error");
      setMessage("Erreur de connexion au serveur.");
    }
  }

  async function resendCode() {
    if (resendCooldown > 0 || !email) return;
    
    setResending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setResendCooldown(60);
        setCode(["", "", "", "", "", ""]);
        setStatus("input");
        setMessage("");
        inputRefs.current[0]?.focus();
      }
    } catch {
      // Ignore errors
    } finally {
      setResending(false);
    }
  }

  function handleRetry() {
    setCode(["", "", "", "", "", ""]);
    setStatus("input");
    setMessage("");
    inputRefs.current[0]?.focus();
  }

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] px-4">
        <div className="max-w-md w-full">
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>
            <h1 className="text-xl font-semibold text-slate-900 mb-2">
              Email manquant
            </h1>
            <p className="text-sm text-slate-600 mb-6">
              Veuillez vous inscrire pour recevoir un code de vérification.
            </p>
            <button
              onClick={() => router.push("/auth/register")}
              className="w-full rounded-full bg-[#1E88E5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1565C0]"
            >
              S&apos;inscrire
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] px-4">
      <div className="max-w-md w-full">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100 text-center">
          {(status === "input" || status === "loading") && (
            <>
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-3xl">📧</span>
              </div>
              <h1 className="text-xl font-semibold text-slate-900 mb-2">
                Vérifiez votre email
              </h1>
              <p className="text-sm text-slate-600 mb-2">
                Nous avons envoyé un code à 6 chiffres à
              </p>
              <p className="text-sm font-medium text-slate-900 mb-6">
                {email}
              </p>

              <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={status === "loading"}
                    className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-slate-200 focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                ))}
              </div>

              {status === "loading" && (
                <div className="flex items-center justify-center gap-2 text-sm text-slate-600 mb-4">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[#1E88E5]" />
                  Vérification...
                </div>
              )}

              <button
                onClick={() => verifyCode(code.join(""))}
                disabled={code.join("").length !== 6 || status === "loading"}
                className="w-full rounded-full bg-[#1E88E5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1565C0] disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                Vérifier
              </button>

              <p className="text-sm text-slate-500">
                Vous n&apos;avez pas reçu le code ?{" "}
                <button
                  onClick={resendCode}
                  disabled={resendCooldown > 0 || resending}
                  className="font-medium text-[#1E88E5] hover:text-[#1565C0] disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  {resending ? "Envoi..." : resendCooldown > 0 ? `Renvoyer (${resendCooldown}s)` : "Renvoyer"}
                </button>
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-slate-900 mb-2">
                Email vérifié !
              </h1>
              <p className="text-sm text-slate-600 mb-6">
                {message}
              </p>
              <button
                onClick={() => router.push("/auth/login")}
                className="w-full rounded-full bg-[#1E88E5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1565C0]"
              >
                Se connecter
              </button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-slate-900 mb-2">
                Code invalide
              </h1>
              <p className="text-sm text-slate-600 mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleRetry}
                  className="w-full rounded-full bg-[#1E88E5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1565C0]"
                >
                  Réessayer
                </button>
                <button
                  onClick={resendCode}
                  disabled={resendCooldown > 0 || resending}
                  className="w-full rounded-full border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {resending ? "Envoi..." : resendCooldown > 0 ? `Renvoyer le code (${resendCooldown}s)` : "Renvoyer le code"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#1E88E5]" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
