"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";
import Image from "next/image";
import { API_BASE_URL } from "@/lib/api";
import SkillsAutocomplete from "@/components/SkillsAutocomplete";
import CityAutocomplete from "@/components/CityAutocomplete";

interface User {
  id: number;
  name: string;
  role: string;
  bio?: string;
  phone?: string;
  website?: string;
  skills?: string[];
  experience_years?: string;
  service_areas?: string[];
  certifications?: string[];
  hourly_rate?: number;
  company_name?: string;
  siret?: string;
}

interface PortfolioItem {
  id: number;
  title: string;
  description?: string;
  category?: string;
  images: string[];
  location?: string;
  completed_at?: string;
  budget?: number;
  duration_days?: number;
  is_featured: boolean;
}

export default function PortfolioEditPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Profile fields
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [newArea, setNewArea] = useState("");
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newCert, setNewCert] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [siret, setSiret] = useState("");

  // Portfolio items
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [itemForm, setItemForm] = useState({
    title: "",
    description: "",
    category: "",
    images: [] as string[],
    location: "",
    completed_at: "",
    budget: "",
    duration_days: "",
    is_featured: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem("prochepro_user");
    if (!stored) {
      router.replace("/auth/login");
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      if (parsed.role !== "prestataire") {
        router.replace("/profile");
        return;
      }
      setUser(parsed);
      fetchProfileData(parsed.id);
      fetchPortfolio();
    } catch {
      router.replace("/auth/login");
    }
  }, [router]);

  async function fetchProfileData(userId: number) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setBio(data.bio || "");
        setPhone(data.phone || "");
        setWebsite(data.website || "");
        setSkills(data.skills || []);
        setExperienceYears(data.experience_years || "");
        setServiceAreas(data.service_areas || []);
        setCertifications(data.certifications || []);
        setHourlyRate(data.hourly_rate?.toString() || "");
        setCompanyName(data.company_name || "");
        setSiret(data.siret || "");
      }
    } catch (err) {
      // Error fetching profile
    } finally {
      setLoading(false);
    }
  }


  async function fetchPortfolio() {
    try {
      const token = localStorage.getItem("prochepro_token");
      const res = await fetch(`${API_BASE_URL}/api/portfolio`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setPortfolioItems(data);
      }
    } catch (err) {
      // Error fetching portfolio
    }
  }

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("prochepro_token");
      const res = await fetch(`${API_BASE_URL}/api/profile/prestataire`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bio,
          phone,
          website: website || null,
          skills,
          experience_years: experienceYears || null,
          service_areas: serviceAreas,
          certifications,
          hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
          company_name: companyName || null,
          siret: siret || null,
        }),
      });

      if (res.ok) {
        showToast("Profil mis à jour avec succès", "success");
      } else {
        const data = await res.json();
        showToast(data.message || "Erreur lors de la mise à jour", "error");
      }
    } catch {
      showToast("Erreur de connexion", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveItem(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("prochepro_token");
      const url = editingItem
        ? `${API_BASE_URL}/api/portfolio/${editingItem.id}`
        : `${API_BASE_URL}/api/portfolio`;
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: itemForm.title,
          description: itemForm.description || null,
          category: itemForm.category || null,
          images: itemForm.images,
          location: itemForm.location || null,
          completed_at: itemForm.completed_at || null,
          budget: itemForm.budget ? parseFloat(itemForm.budget) : null,
          duration_days: itemForm.duration_days ? parseInt(itemForm.duration_days) : null,
          is_featured: itemForm.is_featured,
        }),
      });

      if (res.ok) {
        showToast(editingItem ? "Réalisation mise à jour" : "Réalisation ajoutée", "success");
        setShowItemModal(false);
        resetItemForm();
        fetchPortfolio();
      } else {
        const data = await res.json();
        showToast(data.message || "Erreur", "error");
      }
    } catch {
      showToast("Erreur de connexion", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteItem(id: number) {
    if (!confirm("Supprimer cette réalisation ?")) return;

    try {
      const token = localStorage.getItem("prochepro_token");
      const res = await fetch(`${API_BASE_URL}/api/portfolio/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        showToast("Réalisation supprimée", "success");
        fetchPortfolio();
      }
    } catch {
      showToast("Erreur", "error");
    }
  }

  function openEditModal(item: PortfolioItem) {
    setEditingItem(item);
    setItemForm({
      title: item.title,
      description: item.description || "",
      category: item.category || "",
      images: item.images || [],
      location: item.location || "",
      completed_at: item.completed_at || "",
      budget: item.budget?.toString() || "",
      duration_days: item.duration_days?.toString() || "",
      is_featured: item.is_featured,
    });
    setShowItemModal(true);
  }

  function resetItemForm() {
    setEditingItem(null);
    setItemForm({
      title: "",
      description: "",
      category: "",
      images: [],
      location: "",
      completed_at: "",
      budget: "",
      duration_days: "",
      is_featured: false,
    });
  }

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function addSkill() {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  }

  function addArea() {
    if (newArea.trim() && !serviceAreas.includes(newArea.trim())) {
      setServiceAreas([...serviceAreas, newArea.trim()]);
      setNewArea("");
    }
  }

  function addCert() {
    if (newCert.trim() && !certifications.includes(newCert.trim())) {
      setCertifications([...certifications, newCert.trim()]);
      setNewCert("");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-sky-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="mb-6 text-sm text-slate-600 hover:text-slate-900"
      >
        ← Retour
      </button>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">Mon profil prestataire</h1>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.message}
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Informations professionnelles</h2>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom de l&apos;entreprise</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              placeholder="Votre entreprise"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">SIRET</label>
            <input
              type="text"
              value={siret}
              onChange={(e) => setSiret(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              placeholder="123 456 789 00012"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Bio / Description</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            placeholder="Décrivez votre expérience, vos spécialités..."
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              placeholder="06 12 34 56 78"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Site web</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tarif horaire (€)</label>
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              placeholder="35"
              min="0"
              step="0.5"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Années d&apos;expérience</label>
          <select
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          >
            <option value="">Sélectionner</option>
            <option value="Moins d'1 an">Moins d&apos;1 an</option>
            <option value="1-2 ans">1-2 ans</option>
            <option value="3-5 ans">3-5 ans</option>
            <option value="5-10 ans">5-10 ans</option>
            <option value="Plus de 10 ans">Plus de 10 ans</option>
          </select>
        </div>

        {/* Skills */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Compétences
            <span className="ml-2 text-xs text-slate-400">(Tapez au moins 2 lettres pour voir les suggestions)</span>
          </label>
          <div className="flex gap-2 mb-2">
            <SkillsAutocomplete
              value={newSkill}
              onChange={setNewSkill}
              onSelect={(skill) => {
                if (!skills.includes(skill)) {
                  setSkills([...skills, skill]);
                }
              }}
              placeholder="Plomberie, Électricité, Coiffure..."
              className="flex-1"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-sm text-sky-700">
                {skill}
                <button type="button" onClick={() => setSkills(skills.filter((_, j) => j !== i))} className="text-sky-500 hover:text-sky-700">×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Service Areas */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Zones d&apos;intervention
            <span className="ml-2 text-xs text-slate-400">(Sélectionnez vos zones de service)</span>
          </label>
          <div className="flex gap-2 mb-2">
            <CityAutocomplete
              value={newArea}
              onChange={setNewArea}
              placeholder="Paris, Versailles, Boulogne-Billancourt..."
              className="flex-1"
            />
            <button type="button" onClick={addArea} className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600">
              +
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {serviceAreas.map((area, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                {area}
                <button type="button" onClick={() => setServiceAreas(serviceAreas.filter((_, j) => j !== i))} className="text-slate-500 hover:text-slate-700">×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-1">Certifications / Diplômes</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newCert}
              onChange={(e) => setNewCert(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCert())}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              placeholder="CAP, BTS, RGE..."
            />
            <button type="button" onClick={addCert} className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600">
              +
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {certifications.map((cert, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm text-amber-700">
                🏅 {cert}
                <button type="button" onClick={() => setCertifications(certifications.filter((_, j) => j !== i))} className="text-amber-500 hover:text-amber-700">×</button>
              </span>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-sky-500 px-4 py-3 font-medium text-white hover:bg-sky-600 disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Enregistrer le profil"}
        </button>
      </form>

      {/* Portfolio Section */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Mes réalisations</h2>
          <button
            onClick={() => { resetItemForm(); setShowItemModal(true); }}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 text-sm"
          >
            + Ajouter
          </button>
        </div>

        {portfolioItems.length === 0 ? (
          <p className="text-slate-600 text-center py-8">
            Aucune réalisation. Ajoutez vos travaux pour montrer votre expertise !
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {portfolioItems.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 overflow-hidden">
                {item.images.length > 0 && (
                  <div className="relative h-32">
                    <Image src={item.images[0]} alt={item.title} fill className="object-cover" />
                  </div>
                )}
                <div className="p-3">
                  <h3 className="font-medium text-slate-900">{item.title}</h3>
                  {item.category && <span className="text-xs text-slate-500">{item.category}</span>}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="text-xs text-sky-600 hover:underline"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingItem ? "Modifier la réalisation" : "Nouvelle réalisation"}
            </h3>
            <form onSubmit={handleSaveItem}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Titre *</label>
                  <input
                    type="text"
                    value={itemForm.title}
                    onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={itemForm.description}
                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
                    <input
                      type="text"
                      value={itemForm.category}
                      onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      placeholder="Plomberie, Électricité..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Lieu</label>
                    <input
                      type="text"
                      value={itemForm.location}
                      onChange={(e) => setItemForm({ ...itemForm, location: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      placeholder="Paris"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={itemForm.completed_at}
                      onChange={(e) => setItemForm({ ...itemForm, completed_at: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Budget (€)</label>
                    <input
                      type="number"
                      value={itemForm.budget}
                      onChange={(e) => setItemForm({ ...itemForm, budget: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Durée (j)</label>
                    <input
                      type="number"
                      value={itemForm.duration_days}
                      onChange={(e) => setItemForm({ ...itemForm, duration_days: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      min="1"
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={itemForm.is_featured}
                      onChange={(e) => setItemForm({ ...itemForm, is_featured: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-slate-700">Mettre en vedette</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:opacity-50"
                >
                  {saving ? "..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
