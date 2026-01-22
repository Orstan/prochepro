"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error but don't crash for hydration errors
    console.error("ErrorBoundary caught:", error, errorInfo);
    
    // Check if it's a hydration error (removeChild, insertBefore, etc.)
    const isHydrationError = 
      error.message?.includes("removeChild") ||
      error.message?.includes("insertBefore") ||
      error.message?.includes("appendChild") ||
      error.message?.includes("Hydration") ||
      error.message?.includes("hydrat");
    
    if (isHydrationError) {
      // For hydration errors, try to recover by forcing a client-side re-render
      console.log("Hydration error detected, attempting recovery...");
      this.setState({ hasError: false });
      
      // Force reload after a short delay if still having issues
      if (typeof window !== "undefined") {
        const reloadAttempts = parseInt(sessionStorage.getItem("hydration_reload_attempts") || "0", 10);
        if (reloadAttempts < 2) {
          sessionStorage.setItem("hydration_reload_attempts", String(reloadAttempts + 1));
          setTimeout(() => {
            window.location.reload();
          }, 100);
        } else {
          // Clear attempts after successful load
          sessionStorage.removeItem("hydration_reload_attempts");
        }
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center p-8">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Une erreur est survenue
            </h2>
            <p className="text-slate-600 mb-4">
              Veuillez rafraîchir la page ou réessayer plus tard.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
            >
              Rafraîchir la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
