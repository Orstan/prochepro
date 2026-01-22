"use client";

import { useState } from "react";
import { X, Crown, Sparkles, CheckCircle } from "lucide-react";

interface VIPPromoBannerProps {
  variant?: "full" | "compact";
}

export default function VIPPromoBanner({ variant = "full" }: VIPPromoBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  // Compact version for desktop Hero section
  if (variant === "compact") {
    return (
      <div className="relative overflow-hidden rounded-2xl">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 opacity-90" />
        
        {/* Floating sparkles animation */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${20 + i * 30}%`,
                top: `${20 + i * 30}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i * 0.3}s`,
              }}
            >
              <Sparkles className="w-3 h-3 text-yellow-300 opacity-60" />
            </div>
          ))}
        </div>

        <div className="relative p-4">
          {/* Close button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors z-10"
            aria-label="Fermer"
          >
            <X className="w-3 h-3 text-white" />
          </button>

          {/* Content */}
          <div className="text-center">
            {/* Icon */}
            <div className="flex justify-center mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-lg opacity-60 animate-pulse" />
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center shadow-xl">
                  <Crown className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Badge */}
            <div className="flex flex-col gap-1.5 mb-3">
              <span className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold">
                🎉 OFFRE LIMITÉE
              </span>
              <span className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full bg-yellow-400/90 text-purple-900 text-[10px] font-bold">
                01-31 janvier 2026
              </span>
            </div>

            {/* Title */}
            <h3 className="text-base font-bold text-white mb-2 drop-shadow-lg leading-tight">
              Statut VIP Gratuit 1 an ! 👑
            </h3>

            {/* Description */}
            <p className="text-white/90 text-xs mb-3 leading-tight">
              Inscrivez-vous et <strong>publiez ou acceptez</strong> une mission
            </p>

            {/* CTA Button */}
            <a
              href="/auth/register?promo=vip2026"
              className="inline-flex items-center justify-center gap-1.5 w-full px-4 py-2 rounded-lg bg-white text-purple-600 font-bold text-xs hover:bg-yellow-300 hover:text-purple-900 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Crown className="w-3 h-3" />
              S'inscrire
            </a>
          </div>
        </div>

        {/* Custom CSS for animations */}
        <style jsx>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
              opacity: 0.6;
            }
            50% {
              transform: translateY(-15px) rotate(180deg);
              opacity: 0.3;
            }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 opacity-90" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      
      {/* Floating sparkles animation */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + (i % 3) * 30}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.3}s`,
            }}
          >
            <Sparkles className="w-4 h-4 text-yellow-300 opacity-60" />
          </div>
        ))}
      </div>

      <div className="relative px-4 py-6 md:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Close button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-60 animate-pulse" />
                <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center shadow-2xl">
                  <Crown className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold">
                  🎉 OFFRE LIMITÉE
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/90 text-purple-900 text-xs font-bold">
                  01.01.2026 - 31.01.2026
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                Statut VIP Gratuit pendant 1 an ! 👑
              </h2>

              <p className="text-white/95 text-sm md:text-base mb-3 max-w-3xl mx-auto md:mx-0">
                Inscrivez-vous entre le <strong>1er et 31 janvier 2026</strong> et profitez du statut VIP <strong>gratuitement pendant toute l'année</strong> !
              </p>

              {/* Requirements */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
                <div className="flex items-start gap-2 text-white/95 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                  <span>Créer un compte</span>
                </div>
                <div className="hidden sm:block text-white/60">+</div>
                <div className="flex items-start gap-2 text-white/95 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                  <span>Publier <strong>ou</strong> accepter une mission</span>
                </div>
                <div className="hidden sm:block text-white/60">=</div>
                <div className="flex items-start gap-2 text-white/95 text-sm font-bold">
                  <Crown className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <span>VIP gratuit 1 an !</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <a
                  href="/auth/register?promo=vip2026"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-purple-600 font-bold text-sm hover:bg-yellow-300 hover:text-purple-900 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  <Crown className="w-4 h-4" />
                  S'inscrire maintenant
                </a>
                <a
                  href="/tasks/browse"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white font-semibold text-sm hover:bg-white/30 transition-all border border-white/40"
                >
                  Voir les missions
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.3;
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
