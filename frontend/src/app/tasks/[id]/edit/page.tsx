"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { fetchCategories, ServiceCategory } from "@/lib/categoriesApi";

interface Task {
  id: number;
  client_id: number;
  title: string;
  description?: string | null;
  status: string;
  city?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  location_type?: string | null;
  category?: string | null;
  subcategory?: string | null;
}

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = typeof params.id === "string" ? params.id : params.id?.[0] ?? "";

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [locationType, setLocationType] = useState<"remote" | "on_site">("remote");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<ServiceCategory[]>([]);

  useEffect(() => {
    fetchCategories().then(data => setCategories(data));
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem("prochepro_user");
    if (!stored) {
      router.replace("/auth/login");
      return;
    }

    const user = JSON.parse(stored);
    fetchTask(taskId, user.id);
  }, [taskId, router]);

  async function fetchTask(id: string, userId: number) {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`);
      if (!res.ok) throw new Error("Annonce introuvable.");
      
      const data: Task = await res.json();
      
      // Check if user owns this task
      if (data.client_id !== userId) {
        router.replace(`/tasks/${id}`);
        return;
      }

      // Only allow editing published or draft tasks
      if (!["published", "draft"].includes(data.status)) {
        setError("Cette annonce ne peut plus être modifiée.");
        return;
      }

      setTask(data);
      setTitle(data.title);
      setDescription(data.description ?? "");
      setBudgetMin(data.budget_min?.toString() ?? "");
      setBudgetMax(data.budget_max?.toString() ?? "");
      setLocationType(data.location_type === "on_site" ? "on_site" : "remote");
      setCity(data.city ?? "");
      setCategory(data.category ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!task) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || null,
          budget_min: budgetMin ? Number(budgetMin) : null,
          budget_max: budgetMax ? Number(budgetMax) : null,
          location_type: locationType,
          city: city || null,
          category,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Erreur lors de la mise à jour.");
      }

      router.push(`/tasks/${task.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="skeleton h-8 w-48 mb-4 rounded" />
        <div className="skeleton h-64 rounded-xl" />
      </div>
    );
  }

  if (error && !task) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="rounded-xl bg-red-50 p-6 text-center">
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="text-sm text-sky-600 hover:text-sky-700"
          >
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 text-sm text-slate-600 hover:text-slate-900"
      >
        ↩ Retour
      </button>

      <h1 className="text-2xl font-semibold text-slate-900 mb-2">
        Modifier l'annonce
      </h1>
      <p className="text-sm text-slate-600 mb-6">
        Modifiez les informations de votre annonce.
      </p>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Titre de l'annonce *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Budget min (€)
            </label>
            <input
              type="number"
              min={0}
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
              className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Budget max (€)
            </label>
            <input
              type="number"
              min={0}
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Type d&apos;intervention
            </label>
            <select
              value={locationType}
              onChange={(e) => setLocationType(e.target.value as "remote" | "on_site")}
              className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            >
              <option value="remote">À distance</option>
              <option value="on_site">Sur place</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Ville *
            </label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Catégorie *
          </label>
          <select
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
          >
            <option value="" disabled>Sélectionnez une catégorie</option>
            {categories.map((cat) => (
              <option key={cat.key} value={cat.key}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}
