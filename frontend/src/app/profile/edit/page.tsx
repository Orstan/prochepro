"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import UserAvatar from "@/components/UserAvatar";
import PasswordInput from "@/components/PasswordInput";
import CityAutocomplete from "@/components/CityAutocomplete";
import PriceListEditor from "@/components/PriceListEditor";
import { API_BASE_URL } from "@/lib/api";
import { SERVICE_CATEGORIES, getSubcategoriesByKey } from "@/lib/categories";

interface ProcheProUser {
  id: number;
  name: string;
  email: string;
  role: "client" | "prestataire" | string;
  city?: string | null;
  avatar?: string | null;
  bio?: string | null;
  company_name?: string | null;
  skills?: string[];
  experience_years?: string | null;
  hourly_rate?: number | null;
  service_areas?: string[];
  certifications?: string[];
  service_categories?: string[];
  service_subcategories?: string[];
}

export default function ProfileEditPage() {
  const router = useRouter();

  const [user, setUser] = useState<ProcheProUser | null>(null);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Categories for prestataire
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Additional prestataire fields
  const [bio, setBio] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [newServiceArea, setNewServiceArea] = useState("");
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newCertification, setNewCertification] = useState("");

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("prochepro_user");
    if (!stored) {
      router.replace("/auth/login");
      return;
    }

    try {
      const parsed: ProcheProUser = JSON.parse(stored);
      setUser(parsed);
      
      // Fetch fresh data from API
      fetch(`${API_BASE_URL}/api/users/${parsed.id}`)
        .then(res => res.json())
        .then(freshData => {
          // Update form with fresh data from server
          setName(freshData.name ?? parsed.name ?? "");
          setCity(freshData.city ?? parsed.city ?? "");
          setSelectedCategories(freshData.service_categories ?? parsed.service_categories ?? []);
          setSelectedSubcategories(freshData.service_subcategories ?? parsed.service_subcategories ?? []);
          setBio(freshData.bio ?? parsed.bio ?? "");
          setCompanyName(freshData.company_name ?? parsed.company_name ?? "");
          setSkills(freshData.skills ?? parsed.skills ?? []);
          setExperienceYears(freshData.experience_years ?? parsed.experience_years ?? "");
          setHourlyRate(freshData.hourly_rate?.toString() ?? parsed.hourly_rate?.toString() ?? "");
          setServiceAreas(freshData.service_areas ?? parsed.service_areas ?? []);
          setCertifications(freshData.certifications ?? parsed.certifications ?? []);
          
          // Update localStorage with fresh data
          const updatedUser = { ...parsed, ...freshData };
          window.localStorage.setItem("prochepro_user", JSON.stringify(updatedUser));
          setUser(updatedUser);
        })
        .catch(() => {
          // Fallback to localStorage data if API fails
          setName(parsed.name ?? "");
          setCity(parsed.city ?? "");
          setSelectedCategories(parsed.service_categories ?? []);
          setSelectedSubcategories(parsed.service_subcategories ?? []);
          setBio(parsed.bio ?? "");
          setCompanyName(parsed.company_name ?? "");
          setSkills(parsed.skills ?? []);
          setExperienceYears(parsed.experience_years ?? "");
          setHourlyRate(parsed.hourly_rate?.toString() ?? "");
          setServiceAreas(parsed.service_areas ?? []);
          setCertifications(parsed.certifications ?? []);
        });
    } catch {
      window.localStorage.removeItem("prochepro_user");
      router.replace("/auth/login");
    }
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          city: city.trim() || null,
          ...(user.role === "prestataire" && {
            bio: bio.trim() || null,
            company_name: companyName.trim() || null,
            skills: skills,
            experience_years: experienceYears.trim() || null,
            hourly_rate: hourlyRate ? Number(hourlyRate) : null,
            service_areas: serviceAreas,
            certifications: certifications,
            service_categories: selectedCategories,
            service_subcategories: selectedSubcategories,
          }),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? "Impossible de mettre à jour le profil.");
      }

      const updatedUser = await res.json();

      // Оновлюємо localStorage
      const newUserData = {
        ...user,
        name: updatedUser.name ?? user.name,
        city: updatedUser.city ?? null,
        bio: updatedUser.bio ?? null,
        company_name: updatedUser.company_name ?? null,
        skills: updatedUser.skills ?? [],
        experience_years: updatedUser.experience_years ?? null,
        hourly_rate: updatedUser.hourly_rate ?? null,
        service_areas: updatedUser.service_areas ?? [],
        certifications: updatedUser.certifications ?? [],
        service_categories: updatedUser.service_categories ?? [],
        service_subcategories: updatedUser.service_subcategories ?? [],
      };
      window.localStorage.setItem("prochepro_user", JSON.stringify(newUserData));
      setUser(newUserData);
      setSuccess(true);

      // Автозакриття success через 3 сек
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur inconnue est survenue.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!user || !e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setAvatarUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch(`${API_BASE_URL}/api/users/${user.id}/avatar`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? "Impossible de télécharger l'avatar.");
      }

      const updatedUser = await res.json();

      const newUserData = {
        ...user,
        avatar: updatedUser.avatar ?? null,
      };
      window.localStorage.setItem("prochepro_user", JSON.stringify(newUserData));
      setUser(newUserData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur inconnue est survenue.");
      }
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Les mots de passe ne correspondent pas." });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "Le mot de passe doit contenir au moins 8 caractères." });
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setPasswordMessage({ type: "success", text: data.message || "Mot de passe modifié avec succès." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMessage({ type: "error", text: data.message || "Erreur lors du changement de mot de passe." });
      }
    } catch {
      setPasswordMessage({ type: "error", text: "Erreur réseau." });
    } finally {
      setPasswordLoading(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 text-slate-800">
      <button
        type="button"
        onClick={() => router.back()}
        className="text-sm text-slate-700 hover:text-slate-900 mb-4"
      >
        ↩ Retour
      </button>

      <h1 className="text-2xl font-semibold text-slate-900 mb-1">
        Modifier mon profil
      </h1>
      <p className="text-sm text-slate-600 mb-6">
        Mettez à jour vos informations personnelles.
      </p>

      {success && (
        <div className="mb-4 rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          Profil mis à jour avec succès.
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Avatar */}
      <div className="mb-6 flex items-center gap-4">
        <UserAvatar avatar={user.avatar} name={user.name} size="lg" />
        <div>
          <label className="inline-flex cursor-pointer items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-sky-500 hover:text-sky-600">
            {avatarUploading ? "Téléchargement..." : "Changer l'avatar"}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={avatarUploading}
              className="hidden"
            />
          </label>
          <p className="mt-1 text-xs text-slate-500">
            JPG, PNG, GIF ou WebP. Max 2 Mo.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-800 mb-1">
            Email
          </label>
          <input
            type="email"
            value={user.email}
            disabled
            className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
          />
          <p className="mt-1 text-xs text-slate-500">
            L'email ne peut pas être modifié.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-800 mb-1">
            Nom
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            placeholder="Votre nom"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-800 mb-1">
            Ville
          </label>
          <CityAutocomplete
            value={city}
            onChange={setCity}
            placeholder="Paris, Lyon, Marseille..."
          />
          <p className="mt-1 text-xs text-slate-500">
            Votre ville sera pré-remplie dans les recherches.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-800 mb-1">
            Rôle
          </label>
          <input
            type="text"
            value={user.role === "client" ? "Client" : user.role === "prestataire" ? "Prestataire" : user.role}
            disabled
            className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
          />
        </div>

        {/* Prestataire Profile Section */}
        {user.role === "prestataire" && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              👤 Mon profil professionnel
            </h3>

            {/* Company Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-800 mb-1">
                Nom de l&apos;entreprise (optionnel)
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                placeholder="Ex: Martin Services"
              />
            </div>

            {/* Bio */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-800 mb-1">
                Présentation
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                placeholder="Présentez-vous et décrivez vos services..."
              />
              <p className="mt-1 text-xs text-slate-500">
                Cette description sera visible sur votre profil public.
              </p>
            </div>

            {/* Experience & Hourly Rate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">
                  Expérience
                </label>
                <select
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="">Sélectionner...</option>
                  <option value="Moins d'1 an">Moins d&apos;1 an</option>
                  <option value="1-2 ans">1-2 ans</option>
                  <option value="3-5 ans">3-5 ans</option>
                  <option value="5-10 ans">5-10 ans</option>
                  <option value="Plus de 10 ans">Plus de 10 ans</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">
                  Tarif horaire (€/h)
                </label>
                <input
                  type="number"
                  min={0}
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  placeholder="Ex: 35"
                />
              </div>
            </div>

            {/* Skills */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-800 mb-1">
                Compétences
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newSkill.trim()) {
                      e.preventDefault();
                      if (!skills.includes(newSkill.trim())) {
                        setSkills([...skills, newSkill.trim()]);
                      }
                      setNewSkill("");
                    }
                  }}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  placeholder="Ex: Plomberie, Électricité..."
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
                      setSkills([...skills, newSkill.trim()]);
                      setNewSkill("");
                    }
                  }}
                  className="rounded-lg bg-sky-100 px-4 py-2 text-sm font-medium text-sky-700 hover:bg-sky-200"
                >
                  Ajouter
                </button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-sm text-sky-700"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => setSkills(skills.filter((_, idx) => idx !== i))}
                        className="ml-1 text-sky-400 hover:text-sky-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Service Areas */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-800 mb-1">
                Zones d&apos;intervention
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newServiceArea}
                  onChange={(e) => setNewServiceArea(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newServiceArea.trim()) {
                      e.preventDefault();
                      if (!serviceAreas.includes(newServiceArea.trim())) {
                        setServiceAreas([...serviceAreas, newServiceArea.trim()]);
                      }
                      setNewServiceArea("");
                    }
                  }}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  placeholder="Ex: Paris 75, Île-de-France..."
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newServiceArea.trim() && !serviceAreas.includes(newServiceArea.trim())) {
                      setServiceAreas([...serviceAreas, newServiceArea.trim()]);
                      setNewServiceArea("");
                    }
                  }}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                >
                  Ajouter
                </button>
              </div>
              {serviceAreas.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {serviceAreas.map((area, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600"
                    >
                      📍 {area}
                      <button
                        type="button"
                        onClick={() => setServiceAreas(serviceAreas.filter((_, idx) => idx !== i))}
                        className="ml-1 text-slate-400 hover:text-slate-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Certifications */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-800 mb-1">
                Certifications & Diplômes
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newCertification.trim()) {
                      e.preventDefault();
                      if (!certifications.includes(newCertification.trim())) {
                        setCertifications([...certifications, newCertification.trim()]);
                      }
                      setNewCertification("");
                    }
                  }}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  placeholder="Ex: CAP Électricien, Certification RGE..."
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newCertification.trim() && !certifications.includes(newCertification.trim())) {
                      setCertifications([...certifications, newCertification.trim()]);
                      setNewCertification("");
                    }
                  }}
                  className="rounded-lg bg-amber-100 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-200"
                >
                  Ajouter
                </button>
              </div>
              {certifications.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {certifications.map((cert, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm text-amber-700"
                    >
                      🏅 {cert}
                      <button
                        type="button"
                        onClick={() => setCertifications(certifications.filter((_, idx) => idx !== i))}
                        className="ml-1 text-amber-400 hover:text-amber-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Categories Section for Prestataire */}
        {user.role === "prestataire" && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              🛠️ Mes catégories de services
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Sélectionnez les catégories et sous-catégories de services que vous proposez.
            </p>

            <div className="space-y-2 max-h-96 overflow-y-auto border border-slate-200 rounded-lg p-3">
              {SERVICE_CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat.key);
                const isExpanded = expandedCategory === cat.key;
                const subcategories = getSubcategoriesByKey(cat.key);
                const selectedSubsInCategory = selectedSubcategories.filter((sub) =>
                  subcategories.includes(sub)
                );

                return (
                  <div key={cat.key} className="border border-slate-100 rounded-lg overflow-hidden">
                    <div
                      className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                        isSelected ? "bg-sky-50" : "bg-white hover:bg-slate-50"
                      }`}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedCategories(selectedCategories.filter((c) => c !== cat.key));
                          setSelectedSubcategories(
                            selectedSubcategories.filter((sub) => !subcategories.includes(sub))
                          );
                        } else {
                          setSelectedCategories([...selectedCategories, cat.key]);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="h-4 w-4 text-sky-600 rounded"
                        />
                        <span className={`font-medium ${isSelected ? "text-sky-700" : "text-slate-700"}`}>
                          {cat.label}
                        </span>
                        {selectedSubsInCategory.length > 0 && (
                          <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
                            {selectedSubsInCategory.length} sélectionnée(s)
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedCategory(isExpanded ? null : cat.key);
                        }}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        <svg
                          className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="bg-slate-50 p-3 border-t border-slate-100">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {subcategories.map((sub) => {
                            const isSubSelected = selectedSubcategories.includes(sub);
                            return (
                              <label
                                key={sub}
                                className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                                  isSubSelected ? "bg-sky-100" : "hover:bg-white"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSubSelected}
                                  onChange={() => {
                                    if (isSubSelected) {
                                      setSelectedSubcategories(
                                        selectedSubcategories.filter((s) => s !== sub)
                                      );
                                    } else {
                                      setSelectedSubcategories([...selectedSubcategories, sub]);
                                      if (!selectedCategories.includes(cat.key)) {
                                        setSelectedCategories([...selectedCategories, cat.key]);
                                      }
                                    }
                                  }}
                                  className="h-3.5 w-3.5 text-sky-600 rounded"
                                />
                                <span className={`text-sm ${isSubSelected ? "text-sky-700" : "text-slate-600"}`}>
                                  {sub}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {selectedCategories.length > 0 && (
              <div className="mt-3 p-3 bg-sky-50 rounded-lg">
                <p className="text-sm text-sky-800">
                  <strong>{selectedCategories.length}</strong> catégorie(s) et{" "}
                  <strong>{selectedSubcategories.length}</strong> sous-catégorie(s) sélectionnée(s)
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Price List Section for Prestataire */}
        {user.role === "prestataire" && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              💰 Mes tarifs et services
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Ajoutez vos tarifs pour les services que vous proposez. Cela augmente vos chances d'être choisi par les clients.
            </p>
            <PriceListEditor onSaved={() => setSuccess(true)} />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-60"
        >
          {loading ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </form>

      {/* Password Change Section */}
      <div className="mt-10 pt-8 border-t border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Changer le mot de passe</h2>
        <p className="text-sm text-slate-600 mb-4">
          Mettez à jour votre mot de passe pour sécuriser votre compte.
        </p>

        {passwordMessage && (
          <div className={`mb-4 rounded-lg px-4 py-3 text-sm ${
            passwordMessage.type === "success" 
              ? "bg-emerald-50 text-emerald-700" 
              : "bg-red-50 text-red-700"
          }`}>
            {passwordMessage.text}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">
              Mot de passe actuel
            </label>
            <PasswordInput
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">
              Nouveau mot de passe
            </label>
            <PasswordInput
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
            <p className="mt-1 text-xs text-slate-500">Minimum 8 caractères</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">
              Confirmer le nouveau mot de passe
            </label>
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="inline-flex items-center rounded-full bg-slate-700 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
          >
            {passwordLoading ? "Modification..." : "Modifier le mot de passe"}
          </button>
        </form>
      </div>

      {/* Notification Settings Link */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          🔔 Paramètres de notification
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          Gérez vos préférences pour les notifications par email et les notifications push.
        </p>
        <a
          href="/profile/notifications"
          className="inline-flex items-center rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:border-sky-500 hover:text-sky-600"
        >
          Gérer les notifications
          <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}
