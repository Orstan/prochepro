"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.prochepro.fr";

interface Task {
  id: number;
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  city: string;
  created_at: string;
  status: string;
}

interface Props {
  cityName: string;
  serviceCategory: string;
}

export default function ServiceCityContent({ cityName, serviceCategory }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/tasks?city=${encodeURIComponent(cityName)}&category=${serviceCategory}&status=open&per_page=6`
        );
        if (res.ok) {
          const json = await res.json();
          setTasks(json.data || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, [cityName, serviceCategory]);

  if (loading) {
    return (
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">
          📋 Demandes récentes
        </h2>
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-slate-200 rounded-xl"></div>
          <div className="h-24 bg-slate-200 rounded-xl"></div>
          <div className="h-24 bg-slate-200 rounded-xl"></div>
        </div>
      </section>
    );
  }

  if (tasks.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold text-slate-900 mb-6">
        📋 Demandes récentes à {cityName}
      </h2>
      <div className="grid gap-4">
        {tasks.map((task) => (
          <Link
            key={task.id}
            href={`/tasks/${task.id}`}
            className="group rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100 hover:shadow-md hover:ring-[#1E88E5]/30 transition"
          >
            <h3 className="font-medium text-slate-900 group-hover:text-[#1E88E5] mb-2">
              {task.title}
            </h3>
            <p className="text-sm text-slate-600 line-clamp-2 mb-3">
              {task.description}
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">
                💰 {task.budget_min}€ - {task.budget_max}€
              </span>
              <span className="text-slate-400">
                {new Date(task.created_at).toLocaleDateString("fr-FR")}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
