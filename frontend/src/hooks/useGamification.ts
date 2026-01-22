import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";

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
  progress?: {
    current: number;
    required: number;
    percentage: number;
  };
}

interface AchievementsData {
  earned: Achievement[];
  available: Achievement[];
}

export function useGamification() {
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [achievements, setAchievements] = useState<AchievementsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("prochepro_token");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/gamification/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch gamification stats:", err);
      setError("Failed to load stats");
    }
  };

  const fetchAchievements = async () => {
    try {
      const token = localStorage.getItem("prochepro_token");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/gamification/achievements`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAchievements(data);

        // Check for new achievements (not notified yet)
        const newOnes = data.earned.filter((a: Achievement) => !a.is_notified);
        if (newOnes.length > 0) {
          setNewAchievements(newOnes);
        }
      }
    } catch (err) {
      console.error("Failed to fetch achievements:", err);
      setError("Failed to load achievements");
    } finally {
      setLoading(false);
    }
  };

  const markAsNotified = async (achievementIds: number[]) => {
    try {
      const token = localStorage.getItem("prochepro_token");
      if (!token) return;

      await fetch(`${API_BASE_URL}/api/gamification/achievements/mark-notified`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ achievement_ids: achievementIds }),
      });

      // Remove from newAchievements
      setNewAchievements((prev) =>
        prev.filter((a) => !achievementIds.includes(a.id))
      );

      // Update achievements data
      if (achievements) {
        setAchievements({
          ...achievements,
          earned: achievements.earned.map((a) =>
            achievementIds.includes(a.id) ? { ...a, is_notified: true } : a
          ),
        });
      }
    } catch (err) {
      console.error("Failed to mark achievements as notified:", err);
    }
  };

  const checkAchievements = async () => {
    try {
      const token = localStorage.getItem("prochepro_token");
      if (!token) return;

      const response = await fetch(
        `${API_BASE_URL}/api/gamification/check-achievements`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Refresh data after checking
        await Promise.all([fetchStats(), fetchAchievements()]);
      }
    } catch (err) {
      console.error("Failed to check achievements:", err);
    }
  };

  const refresh = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchAchievements()]);
  };

  useEffect(() => {
    Promise.all([fetchStats(), fetchAchievements()]);
  }, []);

  return {
    stats,
    achievements,
    loading,
    error,
    newAchievements,
    markAsNotified,
    checkAchievements,
    refresh,
  };
}
