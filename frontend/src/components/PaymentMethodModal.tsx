"use client";

import { useState } from "react";

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMethod: (method: "online" | "cash") => void;
  amount: number;
  loading?: boolean;
}

export default function PaymentMethodModal({
  isOpen,
  onClose,
  onSelectMethod,
  amount,
  loading = false,
}: PaymentMethodModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<"online" | "cash">("online");

  if (!isOpen) return null;

  // Online: only Stripe fee (2.9% + 0.30€)
  const stripeFeePercent = 0.029;
  const stripeFeeFixed = 0.30;
  const stripeFee = Math.round((amount * stripeFeePercent + stripeFeeFixed) * 100) / 100;
  const totalOnline = Math.round((amount + stripeFee) * 100) / 100;
  
  // Cash: 15% platform commission (minimum 0.50€ for Stripe)
  let platformFee = Math.round(amount * 0.15 * 100) / 100;
  if (platformFee < 0.50) {
    platformFee = 0.50;
  }
  const cashToPrestataire = Math.round((amount - platformFee) * 100) / 100; // Amount to give in cash (after 15% commission)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800">Choisir le mode de paiement</h2>
          <p className="text-sm text-slate-600 mt-1">
            Montant de la prestation : <span className="font-semibold">{amount.toFixed(2)}€</span>
          </p>
        </div>

        {/* Payment Options */}
        <div className="space-y-3 mb-6">
          {/* Online Payment */}
          <button
            type="button"
            onClick={() => setSelectedMethod("online")}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              selectedMethod === "online"
                ? "border-sky-500 bg-sky-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                selectedMethod === "online" ? "border-sky-500 bg-sky-500" : "border-slate-300"
              }`}>
                {selectedMethod === "online" && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💳</span>
                  <span className="font-semibold text-slate-800">Paiement en ligne</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Recommandé</span>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  Payer <span className="font-semibold">{totalOnline.toFixed(2)}€</span> maintenant
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Montant protégé jusqu&apos;à la fin de la mission. Frais Stripe inclus.
                </p>
              </div>
            </div>
          </button>

          {/* Cash Payment */}
          <button
            type="button"
            onClick={() => setSelectedMethod("cash")}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              selectedMethod === "cash"
                ? "border-amber-500 bg-amber-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                selectedMethod === "cash" ? "border-amber-500 bg-amber-500" : "border-slate-300"
              }`}>
                {selectedMethod === "cash" && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💵</span>
                  <span className="font-semibold text-slate-800">Paiement en espèces</span>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  Commission : <span className="font-semibold">{platformFee.toFixed(2)}€</span> (15%)
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  À remettre au prestataire : <span className="font-semibold text-slate-700">{cashToPrestataire.toFixed(2)}€</span> en espèces
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Summary */}
        <div className="p-4 rounded-xl bg-slate-50 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">Prestation</span>
            <span className="text-slate-800">{amount.toFixed(2)}€</span>
          </div>
          {selectedMethod === "online" ? (
            <>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Frais Stripe (2.9% + 0.30€)</span>
                <span className="text-slate-800">{stripeFee.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t border-slate-200">
                <span className="text-slate-800">Total à payer</span>
                <span className="text-sky-600">{totalOnline.toFixed(2)}€</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Commission ProchePro (15%)</span>
                <span className="text-slate-800">{platformFee.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t border-slate-200">
                <span className="text-slate-800">À payer maintenant (carte)</span>
                <span className="text-amber-600">{platformFee.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-sm mt-2 pt-2 border-t border-slate-200">
                <span className="font-semibold text-slate-700">💵 À remettre en espèces au prestataire</span>
                <span className="font-semibold text-slate-900">{cashToPrestataire.toFixed(2)}€</span>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => onSelectMethod(selectedMethod)}
            disabled={loading}
            className={`flex-1 px-4 py-3 rounded-xl font-medium text-white transition-colors disabled:opacity-50 ${
              selectedMethod === "online"
                ? "bg-sky-500 hover:bg-sky-600"
                : "bg-amber-500 hover:bg-amber-600"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Chargement...
              </span>
            ) : (
              "Confirmer et payer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
