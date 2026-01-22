"use client";

import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Extend Navigator for iOS standalone property
interface NavigatorStandalone extends Navigator {
    standalone?: boolean;
}

export default function InstallPWA() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);

    useEffect(() => {
        // Check if already installed
        const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
        if (isStandalone) {
            return;
        }

        // Check if user permanently dismissed (назавжди)
        const dismissed = localStorage.getItem("pwa-install-dismissed");
        if (dismissed) {
            return; // Don't show if user dismissed it once
        }

        // Check if already shown in this session (вкладка)
        const shownThisSession = sessionStorage.getItem("pwa-prompt-shown");
        if (shownThisSession) {
            return; // Don't show again in same tab/session
        }

        // Detect iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
        setIsIOS(isIOSDevice);

        // Show iOS prompt after delay
        const nav = navigator as NavigatorStandalone;
        if (isIOSDevice && !nav.standalone) {
            setTimeout(() => {
                sessionStorage.setItem("pwa-prompt-shown", "true");
                setShowPrompt(true);
            }, 10000);
            return;
        }

        // Listen for beforeinstallprompt
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Show prompt after short delay
            setTimeout(() => {
                sessionStorage.setItem("pwa-prompt-shown", "true");
                setShowPrompt(true);
            }, 10000);
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, []);

    const handleInstall = async () => {
        if (isIOS) {
            setShowIOSInstructions(true);
            return;
        }

        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            setShowPrompt(false);
            setDeferredPrompt(null);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        setShowIOSInstructions(false);
        localStorage.setItem("pwa-install-dismissed", new Date().toISOString());
    };

    if (!showPrompt) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
                onClick={handleDismiss}
                style={{ animation: "fadeIn 0.3s ease-out" }}
            />

            {/* Install Banner */}
            <div
                className="fixed bottom-0 left-0 right-0 z-[9999] p-4"
                style={{ animation: "slideUp 0.4s ease-out" }}
            >
                <div className="max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
                    {showIOSInstructions ? (
                        // iOS Instructions
                        <div className="p-5">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            Installer sur iPhone
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Suivez ces étapes simples
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleDismiss}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <ol className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                                <li className="flex items-center gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">1</span>
                                    <span>Appuyez sur le bouton <strong>Partager</strong> <span className="inline-block w-5 h-5 align-middle">⎙</span></span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">2</span>
                                    <span>Faites défiler et appuyez sur <strong>Sur l&apos;écran d&apos;accueil</strong></span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">3</span>
                                    <span>Appuyez sur <strong>Ajouter</strong></span>
                                </li>
                            </ol>

                            <button
                                onClick={handleDismiss}
                                className="w-full mt-4 py-3 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
                            >
                                J&apos;ai compris
                            </button>
                        </div>
                    ) : (
                        // Install Prompt
                        <div className="p-5">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <img
                                        src="/icons/icon-96x96.png"
                                        alt="ProchePro"
                                        className="w-14 h-14 rounded-xl shadow-lg"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                                                Installer ProchePro
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                                Accès rapide depuis votre écran d&apos;accueil
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleDismiss}
                                            className="p-1.5 -mt-1 -mr-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <X className="w-5 h-5 text-gray-400" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="text-xs text-gray-400">✓ Notifications</span>
                                        <span className="text-xs text-gray-400">✓ Mode hors-ligne</span>
                                        <span className="text-xs text-gray-400">✓ Gratuit</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={handleDismiss}
                                    className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
                                >
                                    Plus tard
                                </button>
                                <button
                                    onClick={handleInstall}
                                    className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Installer
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Global CSS for animations */}
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
        </>
    );
}

