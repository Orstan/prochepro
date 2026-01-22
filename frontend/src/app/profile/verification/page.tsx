"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

interface VerificationStatus {
  is_verified: boolean;
  verification_status: string;
  verified_at: string | null;
  latest_request: {
    id: number;
    status: string;
    document_type: string;
    rejection_reason: string | null;
    created_at: string;
    reviewed_at: string | null;
  } | null;
  can_submit_offers: boolean;
  needs_verification: boolean;
}

export default function VerificationPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: number; name: string } | null>(null);
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [documentType, setDocumentType] = useState<"cni" | "permis">("cni");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentFront, setDocumentFront] = useState<File | null>(null);
  const [documentBack, setDocumentBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("prochepro_user");
    if (!stored) {
      router.replace("/auth/login");
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setFirstName(parsed.name?.split(" ")[0] || "");
      setLastName(parsed.name?.split(" ").slice(1).join(" ") || "");
      fetchStatus(parsed.id);
    } catch {
      router.replace("/auth/login");
    }
  }, [router]);

  async function fetchStatus(userId: number) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/verification/status?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      // Failed to fetch verification status
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !documentFront) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("user_id", String(user.id));
      formData.append("document_type", documentType);
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("document_number", documentNumber);
      if (dateOfBirth) formData.append("date_of_birth", dateOfBirth);
      formData.append("document_front", documentFront);
      if (documentBack) formData.append("document_back", documentBack);
      if (selfie) formData.append("selfie", selfie);

      const res = await fetch(`${API_BASE_URL}/api/verification/submit`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Une erreur est survenue");
      }

      setSuccess("Votre demande de vérification a été soumise avec succès. Nous l'examinerons dans les plus brefs délais.");
      fetchStatus(user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-sky-600 border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Already verified
  if (status?.is_verified) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Compte vérifié</h1>
          <p className="text-slate-600 mb-6">
            Votre identité a été vérifiée avec succès le{" "}
            {status.verified_at
              ? new Date(status.verified_at).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "récemment"}
            .
          </p>
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium">
            <span>✓</span>
            <span>Prestataire vérifié</span>
          </div>
          <div className="mt-8">
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center rounded-full bg-sky-600 px-6 py-3 text-sm font-medium text-white hover:bg-sky-700"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pending verification
  if (status?.verification_status === "pending") {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⏳</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Vérification en cours</h1>
          <p className="text-slate-600 mb-6">
            Votre demande de vérification est en cours d&apos;examen. Nous vous notifierons dès qu&apos;elle sera traitée.
          </p>
          <div className="bg-slate-50 rounded-xl p-4 text-left text-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500">Type de document</span>
              <span className="font-medium text-slate-900">
                {status.latest_request?.document_type === "cni"
                  ? "Carte d'identité"
                  : "Permis de conduire"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Date de soumission</span>
              <span className="font-medium text-slate-900">
                {status.latest_request?.created_at
                  ? new Date(status.latest_request.created_at).toLocaleDateString("fr-FR")
                  : "-"}
              </span>
            </div>
          </div>
          <div className="mt-8">
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center rounded-full bg-slate-100 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Rejected - can resubmit
  const wasRejected = status?.verification_status === "rejected";

  return (
    <div className="max-w-2xl mx-auto py-8">
      <button
        onClick={() => router.back()}
        className="mb-6 text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1"
      >
        <span>←</span> Retour
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-blue-600 px-6 py-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-3xl">🛡️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Vérification d&apos;identité</h1>
              <p className="text-sky-100 mt-1">
                Vérifiez votre identité pour proposer vos services
              </p>
            </div>
          </div>
        </div>

        {/* Rejection notice */}
        {wasRejected && status?.latest_request?.rejection_reason && (
          <div className="bg-red-50 border-b border-red-100 px-6 py-4">
            <div className="flex items-start gap-3">
              <span className="text-red-500 text-lg">⚠️</span>
              <div>
                <p className="font-medium text-red-800">Votre demande précédente a été rejetée</p>
                <p className="text-sm text-red-600 mt-1">
                  Raison : {status.latest_request.rejection_reason}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="px-6 py-6 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900 mb-3">Pourquoi vérifier votre identité ?</h2>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
              <span>Gagnez la confiance des clients avec le badge vérifié</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
              <span>Accédez à toutes les fonctionnalités prestataire</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
              <span>Proposez vos services et recevez des paiements</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
              <span>Vos documents sont sécurisés et confidentiels</span>
            </li>
          </ul>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm">
              {success}
            </div>
          )}

          {/* Document type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Type de document *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDocumentType("cni")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  documentType === "cni"
                    ? "border-sky-500 bg-sky-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="text-2xl mb-2">🪪</div>
                <div className="font-medium text-slate-900">Carte d&apos;identité</div>
                <div className="text-xs text-slate-500 mt-1">Carte Nationale d&apos;Identité</div>
              </button>
              <button
                type="button"
                onClick={() => setDocumentType("permis")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  documentType === "permis"
                    ? "border-sky-500 bg-sky-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="text-2xl mb-2">🚗</div>
                <div className="font-medium text-slate-900">Permis de conduire</div>
                <div className="text-xs text-slate-500 mt-1">Permis de conduire français</div>
              </button>
            </div>
          </div>

          {/* Personal info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Prénom *
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                placeholder="Jean"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nom *
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                placeholder="Dupont"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Date de naissance
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Numéro du document *
            </label>
            <input
              type="text"
              required
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value.toUpperCase())}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono tracking-wider"
              placeholder={documentType === "cni" ? "Ex: ABC123456" : "Ex: 12AB34567"}
            />
            <p className="text-xs text-slate-500 mt-1">
              {documentType === "cni" 
                ? "Numéro situé en haut à droite de votre carte d'identité"
                : "Numéro situé sur votre permis de conduire"}
            </p>
          </div>

          {/* Document upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Photo du document (recto) *
            </label>
            <input
              ref={frontInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => setDocumentFront(e.target.files?.[0] || null)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => frontInputRef.current?.click()}
              className={`w-full p-6 rounded-xl border-2 border-dashed transition-all ${
                documentFront
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-slate-200 hover:border-sky-300 hover:bg-sky-50"
              }`}
            >
              {documentFront ? (
                <div className="flex items-center justify-center gap-3">
                  <span className="text-emerald-500 text-xl">✓</span>
                  <span className="text-sm font-medium text-slate-700">{documentFront.name}</span>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-3xl mb-2">📷</div>
                  <div className="text-sm font-medium text-slate-700">
                    Cliquez pour télécharger le recto
                  </div>
                  <div className="text-xs text-slate-500 mt-1">JPG, PNG - Max 10 Mo</div>
                </div>
              )}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Photo du document (verso)
              <span className="text-slate-400 font-normal ml-1">- optionnel</span>
            </label>
            <input
              ref={backInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => setDocumentBack(e.target.files?.[0] || null)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => backInputRef.current?.click()}
              className={`w-full p-4 rounded-xl border-2 border-dashed transition-all ${
                documentBack
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-slate-200 hover:border-sky-300 hover:bg-sky-50"
              }`}
            >
              {documentBack ? (
                <div className="flex items-center justify-center gap-3">
                  <span className="text-emerald-500">✓</span>
                  <span className="text-sm text-slate-700">{documentBack.name}</span>
                </div>
              ) : (
                <div className="text-sm text-slate-500">+ Ajouter le verso</div>
              )}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Selfie avec le document
              <span className="text-slate-400 font-normal ml-1">- recommandé</span>
            </label>
            <input
              ref={selfieInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => setSelfie(e.target.files?.[0] || null)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => selfieInputRef.current?.click()}
              className={`w-full p-4 rounded-xl border-2 border-dashed transition-all ${
                selfie
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-slate-200 hover:border-sky-300 hover:bg-sky-50"
              }`}
            >
              {selfie ? (
                <div className="flex items-center justify-center gap-3">
                  <span className="text-emerald-500">✓</span>
                  <span className="text-sm text-slate-700">{selfie.name}</span>
                </div>
              ) : (
                <div className="text-sm text-slate-500">+ Ajouter un selfie avec votre document</div>
              )}
            </button>
            <p className="text-xs text-slate-500 mt-2">
              Un selfie avec votre document accélère la vérification
            </p>
          </div>

          {/* Privacy notice */}
          <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <span className="text-slate-400">🔒</span>
              <p>
                Vos documents sont stockés de manière sécurisée et ne seront utilisés que pour
                vérifier votre identité. Ils seront supprimés après validation.
              </p>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !documentFront || !firstName || !lastName}
            className="w-full rounded-xl bg-sky-600 px-6 py-4 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                Envoi en cours...
              </span>
            ) : (
              "Soumettre ma demande de vérification"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
