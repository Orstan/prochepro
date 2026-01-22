"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error
    console.error("Global error:", error);
    
    // Check if it's a hydration error
    const isHydrationError = 
      error.message?.includes("removeChild") ||
      error.message?.includes("insertBefore") ||
      error.message?.includes("appendChild") ||
      error.message?.includes("Hydration") ||
      error.message?.includes("hydrat");
    
    if (isHydrationError) {
      // For hydration errors, try auto-reload once
      const reloadAttempts = parseInt(sessionStorage.getItem("global_error_reload") || "0", 10);
      if (reloadAttempts < 1) {
        sessionStorage.setItem("global_error_reload", String(reloadAttempts + 1));
        window.location.reload();
      } else {
        sessionStorage.removeItem("global_error_reload");
      }
    }
  }, [error]);

  return (
    <html lang="fr">
      <body className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="text-6xl mb-6">😕</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">
            Oups ! Une erreur est survenue
          </h1>
          <p className="text-slate-600 mb-6">
            Nous sommes désolés, quelque chose s&apos;est mal passé. 
            Veuillez réessayer ou rafraîchir la page.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center rounded-full bg-sky-600 px-6 py-3 text-sm font-medium text-white hover:bg-sky-700 transition-colors"
            >
              Réessayer
            </button>
            <button
              onClick={() => window.location.href = "/"}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Retour à l&apos;accueil
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
