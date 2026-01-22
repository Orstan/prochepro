"use client";

interface Badge {
  id: number;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xp_reward: number;
  earned_at?: string;
  is_notified?: boolean;
}

interface BadgeDisplayProps {
  badge: Badge;
  earned?: boolean;
  progress?: {
    current: number;
    required: number;
    percentage: number;
  };
  size?: "sm" | "md" | "lg";
}

export default function BadgeDisplay({
  badge,
  earned = false,
  progress,
  size = "md",
}: BadgeDisplayProps) {
  const sizeClasses = {
    sm: "w-12 h-12 text-2xl",
    md: "w-16 h-16 text-3xl",
    lg: "w-20 h-20 text-4xl",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div
      className={`group relative ${
        !earned ? "opacity-60 grayscale" : ""
      } transition-all duration-300 hover:scale-105`}
    >
      {/* Badge Icon */}
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${
          earned
            ? "from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/50"
            : "from-slate-300 to-slate-400"
        } flex items-center justify-center font-bold relative overflow-hidden`}
      >
        {earned && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        )}
        <span className="relative z-10">{badge.icon}</span>
      </div>

      {/* Progress Ring (for locked badges) */}
      {!earned && progress && (
        <svg
          className="absolute inset-0 -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(progress.percentage / 100) * 283} 283`}
            className="transition-all duration-500"
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {/* Checkmark for earned badges */}
      {earned && (
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
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
      )}

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        <div className="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-xl max-w-xs text-center">
          <p className={`font-bold ${textSizeClasses[size]}`}>{badge.name}</p>
          <p className="text-xs text-slate-300 mt-1">{badge.description}</p>
          {badge.xp_reward > 0 && (
            <p className="text-xs text-yellow-400 mt-1">
              +{badge.xp_reward} XP
            </p>
          )}
          {!earned && progress && (
            <div className="mt-2 pt-2 border-t border-slate-700">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Progrès:</span>
                <span className="text-blue-400 font-medium">
                  {progress.current} / {progress.required}
                </span>
              </div>
              <div className="mt-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          )}
          {earned && badge.earned_at && (
            <p className="text-xs text-slate-400 mt-1">
              Obtenu le {new Date(badge.earned_at).toLocaleDateString("fr-FR")}
            </p>
          )}
        </div>
        <div className="w-2 h-2 bg-slate-900 transform rotate-45 mx-auto -mt-1" />
      </div>

      {/* Shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
