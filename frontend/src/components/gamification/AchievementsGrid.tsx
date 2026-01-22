"use client";

import { useState } from "react";
import BadgeDisplay from "./BadgeDisplay";

interface Achievement {
  id: number;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xp_reward: number;
  earned_at?: string;
  is_notified?: boolean;
  progress?: {
    current: number;
    required: number;
    percentage: number;
  };
}

interface AchievementsGridProps {
  earnedAchievements: Achievement[];
  availableAchievements: Achievement[];
}

export default function AchievementsGrid({
  earnedAchievements,
  availableAchievements,
}: AchievementsGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { key: "all", name: "Tous", icon: "🎯" },
    { key: "tasks", name: "Missions", icon: "📋" },
    { key: "reviews", name: "Avis", icon: "⭐" },
    { key: "levels", name: "Niveaux", icon: "🎖️" },
    { key: "profile", name: "Profil", icon: "👤" },
    { key: "special", name: "Spéciaux", icon: "✨" },
  ];

  const filteredEarned =
    selectedCategory === "all"
      ? earnedAchievements
      : earnedAchievements.filter((a) => a.category === selectedCategory);

  const filteredAvailable =
    selectedCategory === "all"
      ? availableAchievements
      : availableAchievements.filter((a) => a.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => setSelectedCategory(category.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              selectedCategory === category.key
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
            {category.key === "all" && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold">
                {earnedAchievements.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <p className="text-sm text-blue-600 font-medium">Obtenus</p>
          <p className="text-2xl font-bold text-blue-900">
            {earnedAchievements.length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <p className="text-sm text-purple-600 font-medium">Disponibles</p>
          <p className="text-2xl font-bold text-purple-900">
            {availableAchievements.length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <p className="text-sm text-green-600 font-medium">Progression</p>
          <p className="text-2xl font-bold text-green-900">
            {Math.round(
              (earnedAchievements.length /
                (earnedAchievements.length + availableAchievements.length)) *
                100
            )}
            %
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
          <p className="text-sm text-yellow-600 font-medium">Total</p>
          <p className="text-2xl font-bold text-yellow-900">
            {earnedAchievements.length + availableAchievements.length}
          </p>
        </div>
      </div>

      {/* Earned Achievements */}
      {filteredEarned.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-white text-sm">
              ✓
            </span>
            Badges Obtenus ({filteredEarned.length})
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {filteredEarned.map((achievement) => (
              <div key={achievement.id} className="flex flex-col items-center">
                <BadgeDisplay badge={achievement} earned={true} size="lg" />
                <p className="mt-2 text-xs font-medium text-slate-700 text-center">
                  {achievement.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Achievements */}
      {filteredAvailable.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 text-white text-sm">
              🔒
            </span>
            À Débloquer ({filteredAvailable.length})
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {filteredAvailable.map((achievement) => (
              <div key={achievement.id} className="flex flex-col items-center">
                <BadgeDisplay
                  badge={achievement}
                  earned={false}
                  progress={achievement.progress}
                  size="lg"
                />
                <p className="mt-2 text-xs font-medium text-slate-500 text-center">
                  {achievement.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredEarned.length === 0 && filteredAvailable.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center text-4xl">
            🏆
          </div>
          <p className="text-slate-600 font-medium">
            Aucun badge dans cette catégorie
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Essayez une autre catégorie
          </p>
        </div>
      )}
    </div>
  );
}
