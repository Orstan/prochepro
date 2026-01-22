"use client";

import { useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";

interface Achievement {
  id: number;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xp_reward: number;
}

interface AchievementPopupProps {
  achievement: Achievement;
  onClose: () => void;
}

export default function AchievementPopup({
  achievement,
  onClose,
}: AchievementPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 100);

    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div
        className={`transform transition-all duration-300 ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0"
        }`}
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-1 shadow-2xl">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          
          <div className="relative bg-white rounded-xl p-4">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>

            {/* Content */}
            <div className="flex items-start gap-4">
              {/* Badge Icon */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-lg opacity-50 animate-pulse" />
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-4xl shadow-xl">
                  {achievement.icon}
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Nouveau Badge Obtenu!
                  </p>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {achievement.name}
                </h3>
                <p className="text-sm text-slate-600 mb-2">
                  {achievement.description}
                </p>
                {achievement.xp_reward > 0 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold shadow-md">
                    <Sparkles className="w-3 h-3" />
                    +{achievement.xp_reward} XP
                  </div>
                )}
              </div>
            </div>

            {/* Progress bar at bottom */}
            <div className="mt-3 h-1 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 animate-progress" />
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-progress {
          animation: progress 5s linear;
        }
      `}</style>
    </div>
  );
}
