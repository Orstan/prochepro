"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LevelProgress from "@/components/gamification/LevelProgress";
import AchievementsGrid from "@/components/gamification/AchievementsGrid";
import AchievementPopup from "@/components/gamification/AchievementPopup";
import { useGamification } from "@/hooks/useGamification";

export default function AchievementsPage() {
  const router = useRouter();
  const {
    stats,
    achievements,
    loading,
    newAchievements,
    markAsNotified,
  } = useGamification();

  const [currentPopupIndex, setCurrentPopupIndex] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("prochepro_token");
    if (!token) {
      router.push("/auth/login");
    }
  }, [router]);

  const handlePopupClose = () => {
    if (newAchievements.length > 0) {
      const achievementToNotify = newAchievements[currentPopupIndex];
      markAsNotified([achievementToNotify.id]);

      // Show next popup if available
      if (currentPopupIndex < newAchievements.length - 1) {
        setTimeout(() => {
          setCurrentPopupIndex(currentPopupIndex + 1);
        }, 500);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!stats || !achievements) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Erreur de chargement</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <svg
                className="w-6 h-6 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-3xl font-bold text-slate-900">
              Mes Succès & Badges 🏆
            </h1>
          </div>
          <p className="text-slate-600 ml-14">
            Suivez votre progression et débloquez des badges
          </p>
        </div>

        {/* Level Progress Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <LevelProgress
            level={stats.level}
            xp={stats.xp}
            xpInCurrentLevel={stats.xp_in_current_level}
            xpForNextLevel={stats.xp_for_next_level}
            progressPercentage={stats.xp_progress_percentage}
          />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                📋
              </div>
              <div>
                <p className="text-sm text-slate-600">Missions</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.total_tasks_completed}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-xl">
                ⭐
              </div>
              <div>
                <p className="text-sm text-slate-600">Note</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.average_rating?.toFixed(1) || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-xl">
                💬
              </div>
              <div>
                <p className="text-sm text-slate-600">Avis</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.total_reviews_received}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl">
                🏆
              </div>
              <div>
                <p className="text-sm text-slate-600">Badges</p>
                <p className="text-2xl font-bold text-slate-900">
                  {achievements.earned.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <AchievementsGrid
            earnedAchievements={achievements.earned}
            availableAchievements={achievements.available}
          />
        </div>
      </div>

      {/* Achievement Popups */}
      {newAchievements.length > 0 && currentPopupIndex < newAchievements.length && (
        <AchievementPopup
          achievement={newAchievements[currentPopupIndex]}
          onClose={handlePopupClose}
        />
      )}
    </div>
  );
}
