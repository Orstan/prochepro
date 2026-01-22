"use client";

export default function GuestTaskCTA() {
  return (
    <div className="rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            Publiez votre annonce gratuitement
          </h3>
          <p className="text-xs text-slate-600">
            Remplissez le formulaire ci-dessous. Lors de la publication, nous vous demanderons votre email pour créer votre compte et vous permettre de communiquer avec les prestataires.
          </p>
        </div>
      </div>
    </div>
  );
}
