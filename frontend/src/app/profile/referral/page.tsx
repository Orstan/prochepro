"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

type User = {
  id: number;
  name: string;
  referral_code: string;
};

type Referral = {
  id: number;
  status: "pending" | "completed";
  referrer_rewarded: boolean;
  referred_rewarded: boolean;
  created_at: string;
  completed_at: string | null;
  referred: {
    id: number;
    name: string;
    created_at: string;
  };
};

type ReferralInfo = {
  referral_code: string;
  referral_link: string;
  total_referrals: number;
  completed_referrals: number;
  pending_referrals: number;
  referrals: Referral[];
};

export default function ReferralPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("prochepro_user");
    if (!raw) {
      router.replace("/auth/login");
      return;
    }
    const parsed = JSON.parse(raw);
    setUser(parsed);
    fetchReferralInfo(parsed.id);
  }, [router]);

  async function fetchReferralInfo(userId: number) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/credits/referral?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setReferralInfo(data);
      }
    } catch (err) {
      // Error fetching referral info
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="animate-spin h-8 w-8 border-4 border-sky-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user || !referralInfo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-violet-100 mb-4">
            <svg className="h-8 w-8 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Programme de parrainage
          </h1>
          <p className="text-slate-600">
            Invitez vos amis et gagnez 5€ gratuits par parrainage !
          </p>
        </div>

        {/* Badge Progress */}
        <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">⭐</span>
              <span className="text-sm font-semibold text-amber-800">Badge &quot;Client actif&quot;</span>
            </div>
            {referralInfo.completed_referrals >= 3 ? (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-200 text-amber-800">Obtenu !</span>
            ) : (
              <span className="text-xs text-amber-700">{referralInfo.completed_referrals}/3 parrainages</span>
            )}
          </div>
          <div className="w-full bg-amber-200 rounded-full h-2">
            <div 
              className="bg-amber-500 h-2 rounded-full transition-all" 
              style={{ width: `${Math.min(100, (referralInfo.completed_referrals / 3) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-amber-700 mt-2">
            {referralInfo.completed_referrals >= 3 
              ? "Félicitations ! Votre badge est visible sur votre profil public."
              : `Encore ${3 - referralInfo.completed_referrals} parrainage${3 - referralInfo.completed_referrals > 1 ? 's' : ''} pour obtenir le badge !`}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-100">
            <p className="text-2xl font-bold text-slate-900">{referralInfo.total_referrals}</p>
            <p className="text-xs text-slate-500">Invitations</p>
          </div>
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-100">
            <p className="text-2xl font-bold text-emerald-600">{referralInfo.completed_referrals}</p>
            <p className="text-xs text-slate-500">Complétées</p>
          </div>
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-100">
            <p className="text-2xl font-bold text-amber-600">{referralInfo.pending_referrals}</p>
            <p className="text-xs text-slate-500">En attente</p>
          </div>
        </div>

        {/* Referral Link */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">
            Votre lien de parrainage
          </h2>
          
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={referralInfo.referral_link}
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700"
            />
            <button
              onClick={() => copyToClipboard(referralInfo.referral_link)}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                copied
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {copied ? "Copié !" : "Copier"}
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-slate-500">Votre code :</span>
            <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700">
              {referralInfo.referral_code}
            </span>
          </div>
        </div>

        {/* How it works */}
        <div className="rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">
            Comment ça marche ?
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-200 text-xs font-bold text-violet-700">
                1
              </span>
              <div>
                <p className="text-sm font-medium text-slate-900">Partagez votre lien</p>
                <p className="text-xs text-slate-600">Envoyez votre lien unique à vos amis</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-200 text-xs font-bold text-violet-700">
                2
              </span>
              <div>
                <p className="text-sm font-medium text-slate-900">Ils s'inscrivent</p>
                <p className="text-xs text-slate-600">Vos amis créent un compte sur ProchePro</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-200 text-xs font-bold text-violet-700">
                3
              </span>
              <div>
                <p className="text-sm font-medium text-slate-900">Première action</p>
                <p className="text-xs text-slate-600">Ils publient une annonce ou envoient une offre</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-xs font-bold text-emerald-700">
                ✓
              </span>
              <div>
                <p className="text-sm font-medium text-slate-900">Bonus pour tous !</p>
                <p className="text-xs text-slate-600">Vous et votre ami recevez chacun 5€ gratuits</p>
              </div>
            </div>
          </div>
        </div>

        {/* Referrals list */}
        {referralInfo.referrals.length > 0 && (
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">
              Vos filleuls
            </h2>
            <div className="space-y-3">
              {referralInfo.referrals.map((ref) => (
                <div
                  key={ref.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
                      {ref.referred.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{ref.referred.name}</p>
                      <p className="text-xs text-slate-500">
                        Inscrit le {new Date(ref.referred.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      ref.status === "completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {ref.status === "completed" ? "Complété" : "En attente"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share buttons */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">
            Partager
          </h2>
          <div className="flex flex-wrap gap-3">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Rejoins ProchePro et obtiens ta première annonce gratuite ! ${referralInfo.referral_link}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent("Rejoins ProchePro !")}&body=${encodeURIComponent(`Salut ! Je t'invite à rejoindre ProchePro, une plateforme pour trouver des prestataires de confiance. Publie tes annonces gratuitement ! ${referralInfo.referral_link}`)}`}
              className="inline-flex items-center gap-2 rounded-full bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralInfo.referral_link)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </a>
          </div>
        </div>

        {/* Back button */}
        <div className="text-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            ← Retour au tableau de bord
          </button>
        </div>
      </div>
    </div>
  );
}
