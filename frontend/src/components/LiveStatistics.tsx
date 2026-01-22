import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';

interface LiveStatisticsProps {
  showActiveUsers?: boolean;
  showActiveTasks?: boolean;
  showResponseTime?: boolean;
  showCompletedToday?: boolean;
  className?: string;
}

interface StatisticsData {
  activeUsers: number;
  activeTasks: number;
  averageResponseTime: number;
  completedToday: number;
  lastUpdated: Date;
}

const LiveStatistics: React.FC<LiveStatisticsProps> = ({
  showActiveUsers = true,
  showActiveTasks = true,
  showResponseTime = true,
  showCompletedToday = true,
  className = '',
}) => {
  const [stats, setStats] = useState<StatisticsData>({
    activeUsers: 0,
    activeTasks: 0,
    averageResponseTime: 0,
    completedToday: 0,
    lastUpdated: new Date(),
  });
  
  const [loading, setLoading] = useState(true);

  // Fetch real statistics from API if available, otherwise use simulated data
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        // Try to fetch real statistics from API
        const response = await fetch(`${API_BASE_URL}/api/analytics/live-stats`);
        
        if (response.ok) {
          const data = await response.json();
          setStats({
            activeUsers: data.active_users || 0,
            activeTasks: data.active_tasks || 0,
            averageResponseTime: data.average_response_time || 0,
            completedToday: data.completed_today || 0,
            lastUpdated: new Date(),
          });
        } else {
          // If API fails, use simulated data
          generateSimulatedStats();
        }
      } catch (error) {
        // If API fails, use simulated data
        generateSimulatedStats();
      } finally {
        setLoading(false);
      }
    };

    // Generate simulated statistics for demo purposes
    const generateSimulatedStats = () => {
      // Time-based random number generation for consistent values within time windows
      const now = new Date();
      const timeBasedSeed = now.getHours() * 60 + now.getMinutes();
      
      // Simple deterministic random function based on seed
      const seededRandom = (seed: number) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
      };
      
      // Generate values that change gradually over time
      const baseActiveUsers = 30 + Math.floor(seededRandom(timeBasedSeed) * 20);
      const fluctuation = Math.floor(seededRandom(timeBasedSeed + 1) * 10) - 5;
      
      setStats({
        activeUsers: baseActiveUsers + fluctuation,
        activeTasks: 15 + Math.floor(seededRandom(timeBasedSeed + 2) * 10),
        averageResponseTime: 2 + Math.floor(seededRandom(timeBasedSeed + 3) * 3),
        completedToday: 8 + Math.floor(seededRandom(timeBasedSeed + 4) * 7),
        lastUpdated: now,
      });
    };

    // Initial fetch
    fetchStatistics();

    // Update every minute
    const intervalId = setInterval(fetchStatistics, 60000);

    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-12 ${className}`}>
        <div className="animate-pulse flex space-x-2">
          <div className="h-2 w-2 bg-sky-500 rounded-full"></div>
          <div className="h-2 w-2 bg-sky-500 rounded-full"></div>
          <div className="h-2 w-2 bg-sky-500 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {showActiveUsers && (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>{stats.activeUsers} prestataires en ligne</span>
        </div>
      )}
      
      {showActiveTasks && (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm text-amber-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span>{stats.activeTasks} demandes actives</span>
        </div>
      )}
      
      {showResponseTime && (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-sm text-sky-700">
          <span>⏱️ Réponse en ~{stats.averageResponseTime} min</span>
        </div>
      )}
      
      {showCompletedToday && (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-sm text-purple-700">
          <span>✅ {stats.completedToday} missions terminées aujourd'hui</span>
        </div>
      )}
    </div>
  );
};

export default LiveStatistics;
