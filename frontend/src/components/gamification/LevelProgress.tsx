"use client";

interface LevelProgressProps {
  level: number;
  xp: number;
  xpInCurrentLevel: number;
  xpForNextLevel: number;
  progressPercentage: number;
  compact?: boolean;
}

export default function LevelProgress({
  level,
  xp,
  xpInCurrentLevel,
  xpForNextLevel,
  progressPercentage,
  compact = false,
}: LevelProgressProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold shadow-md">
          {level}
        </div>
        <div className="flex-1 max-w-[100px]">
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Level Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full blur-md opacity-50" />
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-xl">
              <div className="text-center">
                <div className="text-xs font-medium opacity-80">Niveau</div>
                <div className="text-2xl font-bold">{level}</div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Niveau {level}
            </h3>
            <p className="text-sm text-slate-600">
              {xpInCurrentLevel} / 100 XP
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Encore</p>
          <p className="text-lg font-bold text-blue-600">{xpForNextLevel} XP</p>
          <p className="text-xs text-slate-500">pour niveau {level + 1}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 transition-all duration-500 ease-out relative"
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>Niveau {level}</span>
          <span className="font-medium text-blue-600">
            {Math.round(progressPercentage)}%
          </span>
          <span>Niveau {level + 1}</span>
        </div>
      </div>

      {/* Total XP */}
      <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
        <span className="text-sm text-slate-600">XP Total:</span>
        <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          {xp.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
