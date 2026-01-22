"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
    
    // Check if it's a hydration error and auto-recover
    const isHydrationError = 
      error.message?.includes("removeChild") ||
      error.message?.includes("insertBefore") ||
      error.message?.includes("appendChild") ||
      error.message?.includes("Hydration");
    
    if (isHydrationError) {
      const reloadAttempts = parseInt(sessionStorage.getItem("page_error_reload") || "0", 10);
      if (reloadAttempts < 1) {
        sessionStorage.setItem("page_error_reload", String(reloadAttempts + 1));
        window.location.reload();
      } else {
        sessionStorage.removeItem("page_error_reload");
      }
    }
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          Une erreur est survenue
        </h2>
        <p className="text-slate-600 mb-6">
          Nous sommes désolés pour ce désagrément. Veuillez réessayer.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-700"
          >
            Réessayer
          </button>
          <button
            onClick={() => window.location.href = "/"}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Accueil
          </button>
        </div>
      </div>
    </div>
  );
}
