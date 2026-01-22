"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useGamification } from "@/hooks/useGamification";
import AchievementPopup from "@/components/gamification/AchievementPopup";

interface GamificationStats {
  level: number;
  xp: number;
  xp_in_current_level: number;
  xp_for_next_level: number;
  xp_progress_percentage: number;
  total_tasks_completed: number;
  total_reviews_received: number;
  average_rating: number | null;
  achievements_count: number;
  profile_completion: number;
}

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
}

interface GamificationContextType {
  stats: GamificationStats | null;
  achievements: {
    earned: Achievement[];
    available: Achievement[];
  } | null;
  loading: boolean;
  refresh: () => Promise<void>;
  checkAchievements: () => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | null>(null);

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const {
    stats,
    achievements,
    loading,
    newAchievements,
    markAsNotified,
    checkAchievements,
    refresh,
  } = useGamification();

  const [currentPopupIndex, setCurrentPopupIndex] = useState(0);
  const [showingPopup, setShowingPopup] = useState(false);

  useEffect(() => {
    if (newAchievements.length > 0 && !showingPopup) {
      setShowingPopup(true);
      setCurrentPopupIndex(0);
    }
  }, [newAchievements.length]);

  const handlePopupClose = () => {
    if (newAchievements.length > 0) {
      const achievementToNotify = newAchievements[currentPopupIndex];
      markAsNotified([achievementToNotify.id]);

      // Show next popup if available
      if (currentPopupIndex < newAchievements.length - 1) {
        setTimeout(() => {
          setCurrentPopupIndex(currentPopupIndex + 1);
        }, 500);
      } else {
        setShowingPopup(false);
      }
    }
  };

  return (
    <GamificationContext.Provider
      value={{
        stats,
        achievements,
        loading,
        refresh,
        checkAchievements,
      }}
    >
      {children}
      
      {/* Global Achievement Popups */}
      {showingPopup &&
        newAchievements.length > 0 &&
        currentPopupIndex < newAchievements.length && (
          <AchievementPopup
            achievement={newAchievements[currentPopupIndex]}
            onClose={handlePopupClose}
          />
        )}
    </GamificationContext.Provider>
  );
}

export function useGamificationContext() {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error(
      "useGamificationContext must be used within GamificationProvider"
    );
  }
  return context;
}
