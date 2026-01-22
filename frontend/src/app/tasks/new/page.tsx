"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState, Suspense, useRef, ChangeEvent } from "react";
import Image from "next/image";
import { API_BASE_URL } from "@/lib/api";
import { fetchCategories, getSubcategoriesByKey, ServiceCategory } from "@/lib/categoriesApi";
import LocationPicker from "@/components/LocationPicker";
import GuestTaskCTA from "@/components/GuestTaskCTA";
import Modal from "@/components/Modal";
import SearchableSelect from "@/components/SearchableSelect";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";
import CategorySuggestions from "@/components/CategorySuggestions";
import { SERVICES_SEO } from "@/lib/services-seo";

interface ProcheProUser {
  id: number;
  name: string;
  email: string;
  role: "client" | "prestataire" | string;
}

// Wrapper component to handle Suspense for useSearchParams
export default function NewTaskPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-sky-600 border-r-transparent rounded-full"></div></div>}>
      <NewTaskPageContent />
    </Suspense>
  );
}

function NewTaskPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<ProcheProUser | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [locationType, setLocationType] = useState<"remote" | "on_site">("on_site");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [availableSubcategories, setAvailableSubcategories] = useState<{ key: string; name: string }[]>([]);
  const [insuranceLevel, setInsuranceLevel] = useState<string | null>(null);

  // Image upload state
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Guest email modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Load categories from API
  useEffect(() => {
    fetchCategories().then(data => {
      setCategories(data);
    });
  }, []);

  // Read category and subcategory from URL params on mount
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const subcategoryParam = searchParams.get("subcategory");
    
    if (categoryParam && categories.some(cat => cat.key === categoryParam)) {
      setCategory(categoryParam);
      getSubcategoriesByKey(categoryParam).then(subs => {
        setAvailableSubcategories(subs);
        // Якщо є параметр subcategory, встановлюємо його після завантаження підкатегорій
        if (subcategoryParam && subs.some(sub => sub.key === subcategoryParam)) {
          setSubcategory(subcategoryParam);
        }
      });
    }
  }, [searchParams, categories]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Insurance options
  const insuranceOptions = {
    basic: { name: 'Basic', coverage: 500, fee: 2, description: 'Couverture jusqu\'à 500€' },
    standard: { name: 'Standard', coverage: 2000, fee: 5, description: 'Couverture jusqu\'à 2 000€' },
    premium: { name: 'Premium', coverage: 5000, fee: 10, description: 'Couverture jusqu\'à 5 000€' },
  };

  // Завантаження користувача (дозволяємо гостям)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("prochepro_user");
    if (!stored) {
      // Гість - дозволяємо заповнювати форму
      loadDraftFromLocalStorage();
      return;
    }

    try {
      const parsed: ProcheProUser = JSON.parse(stored);
      if (parsed.role !== "client") {
        router.replace("/dashboard");
        return;
      }
      setUser(parsed);
      
      // Відновлюємо збережені дані гостя після логіну
      const hasDraft = loadDraftFromLocalStorage();
      
      // Автоматично публікуємо, якщо є заповнені дані
      if (hasDraft && !autoSubmitted) {
        setAutoSubmitted(true);
        // Чекаємо, поки стан оновиться, потім публікуємо
        setTimeout(() => {
          const submitBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
          if (submitBtn) submitBtn.click();
        }, 500);
      }
    } catch {
      window.localStorage.removeItem("prochepro_user");
      loadDraftFromLocalStorage();
    }
  }, [router]);

  // Збереження чернетки в localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const draft = {
      title,
      description,
      budgetMin,
      budgetMax,
      locationType,
      city,
      district,
      districtName,
      category,
      subcategory,
      insuranceLevel,
      timestamp: Date.now(),
    };
    
    window.localStorage.setItem("prochepro_task_draft", JSON.stringify(draft));
  }, [title, description, budgetMin, budgetMax, locationType, city, district, districtName, category, subcategory, insuranceLevel]);

  // Завантаження чернетки з localStorage
  function loadDraftFromLocalStorage(): boolean {
    if (typeof window === "undefined") return false;
    
    const draftStr = window.localStorage.getItem("prochepro_task_draft");
    if (!draftStr) return false;
    
    try {
      const draft = JSON.parse(draftStr);
      
      // Перевіряємо, чи не застаріла чернетка (24 години)
      const age = Date.now() - (draft.timestamp || 0);
      if (age > 24 * 60 * 60 * 1000) {
        window.localStorage.removeItem("prochepro_task_draft");
        return false;
      }
      
      // Відновлюємо дані
      if (draft.title) setTitle(draft.title);
      if (draft.description) setDescription(draft.description);
      if (draft.budgetMin) setBudgetMin(draft.budgetMin);
      if (draft.budgetMax) setBudgetMax(draft.budgetMax);
      if (draft.locationType) setLocationType(draft.locationType);
      if (draft.city) setCity(draft.city);
      if (draft.district) setDistrict(draft.district);
      if (draft.districtName) setDistrictName(draft.districtName);
      if (draft.category) {
        setCategory(draft.category);
        getSubcategoriesByKey(draft.category).then(subs => {
          setAvailableSubcategories(subs);
          if (draft.subcategory) setSubcategory(draft.subcategory);
        });
      }
      if (draft.insuranceLevel !== undefined) setInsuranceLevel(draft.insuranceLevel);
      
      // Повертаємо true, якщо є заповнені дані
      return !!(draft.title && draft.category && draft.city);
    } catch (e) {
      return false;
    }
  }

  function handleImageSelect(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files).slice(0, 5 - selectedImages.length);
    if (newFiles.length === 0) return;

    setSelectedImages((prev) => [...prev, ...newFiles].slice(0, 5));

    // Create previews
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string].slice(0, 5));
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadImages(taskId: number): Promise<boolean> {
    if (selectedImages.length === 0) return true;

    setUploadingImages(true);
    try {
      const formData = new FormData();
      selectedImages.forEach((file) => {
        formData.append("images[]", file);
      });

      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/images`, {
        method: "POST",
        body: formData,
      });

      return response.ok;
    } catch {
      return false;
    } finally {
      setUploadingImages(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    
    if (!user) {
      // Гість - показуємо модальне вікно для email
      if (!category) {
        setError("Veuillez choisir une catégorie pour votre annonce.");
        return;
      }
      if (!city.trim()) {
        setError("Veuillez indiquer la ville où se situe l'annonce.");
        return;
      }
      setShowEmailModal(true);
      return;
    }

    if (!category) {
      setError("Veuillez choisir une catégorie pour votre annonce.");
      return;
    }

    if (!city.trim()) {
      setError("Veuillez indiquer la ville où se situe l'annonce.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: user.id,
          title,
          description: description || null,
          budget_min: budgetMin ? Number(budgetMin) : null,
          budget_max: budgetMax ? Number(budgetMax) : null,
          location_type: locationType,
          city: city || null,
          district_code: district || null,
          district_name: districtName || null,
          category,
          subcategory: subcategory || null,
          insurance_level: insuranceLevel,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        if (data && data.message) {
          throw new Error(data.message);
        }
        throw new Error("Une erreur est survenue lors de la création de l'annonce.");
      }

      const taskData = await response.json();
      
      // Upload images if any
      if (selectedImages.length > 0) {
        await uploadImages(taskData.id);
      }

      // Очищуємо збережену чернетку
      window.localStorage.removeItem("prochepro_task_draft");

      router.replace("/dashboard");
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

  async function handleGuestPublish() {
    if (!guestEmail.trim()) {
      setEmailError("Veuillez entrer votre email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail)) {
      setEmailError("Veuillez entrer un email valide");
      return;
    }

    setEmailLoading(true);
    setEmailError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/guest-publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: guestEmail,
          title,
          description: description || null,
          budget_min: budgetMin ? Number(budgetMin) : null,
          budget_max: budgetMax ? Number(budgetMax) : null,
          location_type: locationType,
          city: city || null,
          district_code: district || null,
          district_name: districtName || null,
          category,
          subcategory: subcategory || null,
          insurance_level: insuranceLevel,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Une erreur est survenue");
      }

      const result = await response.json();

      if (selectedImages.length > 0 && result.task_id) {
        await uploadImages(result.task_id);
      }

      // Автоматичний логін: зберігаємо токен та дані користувача
      if (result.token && result.user) {
        window.localStorage.setItem("prochepro_token", result.token);
        window.localStorage.setItem("prochepro_user", JSON.stringify(result.user));
        window.dispatchEvent(new Event("prochepro_login"));
      }

      window.localStorage.removeItem("prochepro_task_draft");
      alert(`✅ Votre annonce est publiée !\n\nVous êtes maintenant connecté.\nUn email avec vos identifiants a été envoyé à ${guestEmail}`);
      router.push("/dashboard");
    } catch (err: unknown) {
      setEmailError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setEmailLoading(false);
    }
  }

  const isGuest = !user;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 text-sm text-slate-600 hover:text-slate-900"
        >
          ↩ Retour
        </button>

        <h1 className="mb-2 text-2xl font-semibold text-slate-900">
          Publier une annonce
        </h1>
        <p className="mb-6 text-sm text-slate-600">
          Recevez plusieurs offres de professionnels qualifiés
        </p>

        {/* CTA для гостей - зверху */}
        {isGuest && (
          <div className="mb-6">
            <GuestTaskCTA />
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl bg-white p-6 text-sm shadow-sm ring-1 ring-slate-100"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Titre de l'annonce
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="Ex : Montage de meubles IKEA"
            />
            
            {/* Підказки категорій на основі заголовка */}
            <CategorySuggestions 
              title={title}
              categories={categories}
              onSelectCategory={(categoryKey) => {
                setCategory(categoryKey);
                getSubcategoriesByKey(categoryKey).then(subs => setAvailableSubcategories(subs));
              }}
              onSelectSubcategory={(subcategoryKey) => setSubcategory(subcategoryKey)}
              selectedCategory={category}
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
              className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="Décrivez les détails de votre demande, les horaires souhaités, les contraintes, etc."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Budget minimum (€)
              </label>
              <input
                type="number"
                min={0}
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Budget maximum (€)
              </label>
              <input
                type="number"
                min={0}
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Type d'intervention
              </label>
              <select
                value={locationType}
                onChange={(e) =>
                  setLocationType(e.target.value === "on_site" ? "on_site" : "remote")
                }
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="on_site">Sur place</option>
                <option value="remote">À distance</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                📍 Arrondissement / Ville *
              </label>
              <LocationPicker
                value={district}
                onChange={(code, name) => {
                  setDistrict(code);
                  setDistrictName(name);
                  setCity(name);
                }}
                placeholder="Paris 11ème, Montreuil..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Catégorie de l'annonce
              </label>
              <SearchableSelect
                value={category}
                onChange={(newCategory) => {
                  setCategory(newCategory);
                  setSubcategory("");
                  getSubcategoriesByKey(newCategory).then(subs => setAvailableSubcategories(subs));
                }}
                options={categories}
                placeholder="Sélectionnez une catégorie"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Sous-catégorie
              </label>
              <SearchableSelect
                value={subcategory}
                onChange={setSubcategory}
                options={availableSubcategories}
                placeholder={category ? "Sélectionnez une sous-catégorie" : "Choisissez d'abord une catégorie"}
                disabled={!category}
              />
            </div>
          </div>

          {/* Photos Section */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              📷 Photos (optionnel)
            </label>
            <p className="mb-3 text-xs text-slate-500">
              Ajoutez jusqu&apos;à 5 photos pour illustrer votre annonce
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
            
            <div className="flex flex-wrap gap-3">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <div className="relative h-24 w-24 rounded-lg overflow-hidden ring-1 ring-slate-200">
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs shadow-md hover:bg-red-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
              
              {selectedImages.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-24 w-24 flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-sky-400 hover:text-sky-500 transition-colors"
                >
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-xs mt-1">Ajouter</span>
                </button>
              )}
            </div>
            
            {selectedImages.length > 0 && (
              <p className="mt-2 text-xs text-slate-500">
                {selectedImages.length}/5 photo{selectedImages.length > 1 ? "s" : ""} sélectionnée{selectedImages.length > 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Insurance Section */}
          <div className="rounded-xl border border-slate-200 p-4 bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🛡️</span>
              <h3 className="font-semibold text-slate-800">Garantie ProchePro</h3>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Recommandé</span>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Le prestataire s&apos;engage à réaliser la mission avec soin et professionnalisme. 
              En cas de dommages causés lors de l&apos;exécution, le prestataire assume l&apos;entière responsabilité.
            </p>
            
            <div className="space-y-2">
              {/* No insurance option */}
              <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                insuranceLevel === null 
                  ? 'border-slate-300 bg-white' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="insurance"
                    checked={insuranceLevel === null}
                    onChange={() => setInsuranceLevel(null)}
                    className="h-4 w-4 text-sky-600"
                  />
                  <div>
                    <span className="font-medium text-slate-700">Sans assurance</span>
                    <p className="text-xs text-slate-500">Garantie de base incluse</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-600">Gratuit</span>
              </label>

              {/* Insurance options */}
              {Object.entries(insuranceOptions).map(([key, option]) => (
                <label key={key} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                  insuranceLevel === key 
                    ? 'border-sky-500 bg-sky-50 ring-1 ring-sky-500' 
                    : 'border-slate-200 hover:border-sky-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="insurance"
                      checked={insuranceLevel === key}
                      onChange={() => setInsuranceLevel(key)}
                      className="h-4 w-4 text-sky-600"
                    />
                    <div>
                      <span className="font-medium text-slate-700">{option.name}</span>
                      <p className="text-xs text-slate-500">{option.description}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-sky-600">+{option.fee}€</span>
                </label>
              ))}
            </div>

            {insuranceLevel && (
              <div className="mt-3 p-2 bg-sky-100 rounded-lg">
                <p className="text-xs text-sky-800">
                  ✅ Votre annonce sera couverte jusqu&apos;à <strong>{insuranceOptions[insuranceLevel as keyof typeof insuranceOptions].coverage}€</strong> en cas de dommages.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3">
            {!isGuest && (
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-60"
            >
              {loading ? "En cours..." : "Publier l'annonce"}
            </button>
          </div>
        </form>
      </div>

      {/* Email Modal for Guests */}
      {showEmailModal && (
        <Modal onClose={() => setShowEmailModal(false)}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              📧 Dernière étape !
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              Pour publier votre annonce et communiquer avec les prestataires, créez votre compte.
            </p>
            
            {/* Google OAuth Button */}
            <div className="mb-4">
              <SocialAuthButtons />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Ou avec votre email
              </label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => {
                  setGuestEmail(e.target.value);
                  setEmailError("");
                }}
                placeholder="exemple@email.com"
                className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
              {emailError && (
                <p className="mt-2 text-xs text-red-600">{emailError}</p>
              )}
            </div>

            <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-sky-800">
                ✅ Votre annonce sera publiée immédiatement<br/>
                ✅ Vous recevrez un email avec votre mot de passe<br/>
                ✅ Gratuit et sans engagement
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleGuestPublish}
                disabled={emailLoading}
                className="flex-1 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-60"
              >
                {emailLoading ? "Publication..." : "Publier l'annonce"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
}