"use client";

import Link from "next/link";

interface GuestCTAProps {
  message?: string;
}

export default function GuestCTA({ 
  message = "Pour voir plus d'informations et contacter le client, vous devez" 
}: GuestCTAProps) {
  return (
    <div className="rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-200 px-6 py-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100">
            <svg className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-slate-900 mb-2">
            Accédez à toutes les fonctionnalités
          </h3>
          <p className="text-sm text-slate-700 mb-4">
            {message}{" "}
            <Link
              href="/auth/register"
              className="font-bold text-sky-600 hover:text-sky-700 underline decoration-2 underline-offset-2"
            >
              créer un compte gratuit
            </Link>
            .
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center rounded-full bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 transition-colors"
            >
              Créer un compte gratuit
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors"
            >
              Déjà inscrit ? Se connecter
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Inscription gratuite</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Proposez vos services</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Contactez les clients</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
