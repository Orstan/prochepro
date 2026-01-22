"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

type TaxReport = {
  id: number;
  year: number;
  month: number | null;
  total_revenue: string;
  platform_commission: string;
  net_revenue: string;
  missions_count: number;
  online_payment_missions: number;
  cash_payment_missions: number;
  generated_at: string;
};

type YearSummary = {
  year: number;
  total_revenue: number;
  net_revenue: number;
  platform_commission: number;
  missions_count: number;
};

export default function TaxReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<YearSummary | null>(null);
  const [reports, setReports] = useState<TaxReport[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("prochepro_user");
    if (!raw) {
      router.push("/auth/login");
      return;
    }
    const parsed = JSON.parse(raw);
    setUser(parsed);

    if (parsed.role !== "prestataire") {
      router.push("/dashboard");
      return;
    }

    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("prochepro_token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [summaryRes, historyRes, yearsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/tax-reports/summary`, { headers }),
        fetch(`${API_BASE_URL}/api/tax-reports/history`, { headers }),
        fetch(`${API_BASE_URL}/api/tax-reports/years`, { headers }),
      ]);

      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data);
      }

      if (historyRes.ok) {
        const data = await historyRes.json();
        setReports(data.reports || []);
      }

      if (yearsRes.ok) {
        const data = await yearsRes.json();
        setAvailableYears(data.years || [new Date().getFullYear()]);
      }
    } catch (err) {
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }

  async function generateAnnualReport() {
    setGenerating(true);
    setError(null);
    try {
      const token = localStorage.getItem("prochepro_token");
      const res = await fetch(`${API_BASE_URL}/api/tax-reports/generate/annual`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ year: selectedYear }),
      });

      if (!res.ok) throw new Error("Échec de la génération");

      await loadData();
    } catch (err) {
      setError("Erreur lors de la génération du rapport");
    } finally {
      setGenerating(false);
    }
  }

  async function downloadPdf(reportId: number) {
    try {
      const token = localStorage.getItem("prochepro_token");
      const res = await fetch(`${API_BASE_URL}/api/tax-reports/${reportId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Échec du téléchargement");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attestation-revenus-${selectedYear}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError("Erreur lors du téléchargement");
    }
  }

  function formatAmount(amount: string | number): string {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(num);
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function getPeriodLabel(report: TaxReport): string {
    if (!report.month) return `Année ${report.year}`;
    const months = [
      "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];
    return `${months[report.month - 1]} ${report.year}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-sky-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Attestations Fiscales
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Générez vos récapitulatifs de revenus pour la déclaration fiscale URSSAF
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Current Year Summary */}
        {summary && (
          <div className="mb-8 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-sky-500 text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Récapitulatif {summary.year}
                </h2>
                <p className="text-sm text-slate-600">Données actualisées</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="text-xs text-slate-500 mb-1">Revenu brut</div>
                <div className="text-xl sm:text-2xl font-bold text-slate-900">
                  {formatAmount(summary.total_revenue)}
                </div>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="text-xs text-slate-500 mb-1">Commission ProchePro</div>
                <div className="text-xl sm:text-2xl font-bold text-amber-600">
                  -{formatAmount(summary.platform_commission)}
                </div>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="text-xs text-slate-500 mb-1">Revenu net</div>
                <div className="text-xl sm:text-2xl font-bold text-emerald-600">
                  {formatAmount(summary.net_revenue)}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-slate-700">
              <svg className="h-5 w-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{summary.missions_count} mission{summary.missions_count > 1 ? 's' : ''} réalisée{summary.missions_count > 1 ? 's' : ''}</span>
            </div>
          </div>
        )}

        {/* Generate Report Section */}
        <div className="mb-8 rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Générer un nouveau rapport
          </h3>
          
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Année
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={generateAnnualReport}
              disabled={generating}
              className="rounded-lg bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {generating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Génération...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Générer le rapport annuel
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Reports History */}
        <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">
              Historique des rapports
            </h3>
          </div>

          {reports.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-slate-600">Aucun rapport généré pour le moment</p>
              <p className="text-sm text-slate-500 mt-1">
                Générez votre premier rapport annuel ci-dessus
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {reports.map((report) => (
                <div key={report.id} className="px-4 sm:px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-sky-100 text-sky-600 shrink-0">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">
                            {getPeriodLabel(report)}
                          </div>
                          <div className="text-xs sm:text-sm text-slate-500">
                            Généré le {formatDate(report.generated_at)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                        <div>
                          <span className="text-slate-500">Missions:</span>
                          <span className="ml-2 font-medium text-slate-900">{report.missions_count}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Revenu brut:</span>
                          <span className="ml-2 font-medium text-slate-900">{formatAmount(report.total_revenue)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Revenu net:</span>
                          <span className="ml-2 font-medium text-emerald-600">{formatAmount(report.net_revenue)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => downloadPdf(report.id)}
                      className="rounded-lg bg-sky-500 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-sky-600 shadow-sm flex items-center justify-center gap-2 shrink-0"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="hidden sm:inline">Télécharger PDF</span>
                      <span className="sm:hidden">PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 rounded-xl bg-amber-50 border border-amber-200 p-6">
          <div className="flex gap-4">
            <div className="shrink-0">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 text-amber-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-amber-900 mb-2">
                Important - Déclaration fiscale URSSAF
              </h4>
              <p className="text-sm text-amber-800 leading-relaxed">
                Ces attestations sont fournies à titre informatif pour faciliter vos déclarations fiscales. 
                Elles ne constituent pas des documents fiscaux officiels. Pour toute question relative à vos 
                obligations fiscales, nous vous recommandons de consulter un expert-comptable ou l'URSSAF directement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
