"use client";

interface Rank {
  name: string;
  icon: string;
  minTasks: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

const RANKS: Rank[] = [
  {
    name: "Novice",
    icon: "🥉",
    minTasks: 0,
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    name: "Professionnel",
    icon: "🥈",
    minTasks: 10,
    color: "text-slate-700",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-300",
  },
  {
    name: "Maître",
    icon: "🥇",
    minTasks: 50,
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-300",
  },
  {
    name: "Légende",
    icon: "💎",
    minTasks: 100,
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300",
  },
];

interface LatestBadge {
  icon: string;
  name: string;
}

interface RankBadgeProps {
  tasksCompleted: number;
  latestBadge?: LatestBadge | null;
}

export default function RankBadge({
  tasksCompleted,
  latestBadge,
}: RankBadgeProps) {
  // Determine current rank
  let currentRank = RANKS[0];
  
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (tasksCompleted >= RANKS[i].minTasks) {
      currentRank = RANKS[i];
      break;
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Rank Badge */}
      <div
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 ${currentRank.bgColor} ${currentRank.borderColor}`}
      >
        <span className="text-base">{currentRank.icon}</span>
        <span className={`text-xs font-bold ${currentRank.color}`}>
          {currentRank.name}
        </span>
      </div>
    </div>
  );
}
