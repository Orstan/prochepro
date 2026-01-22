"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import UserAvatar from "@/components/UserAvatar";
import { API_BASE_URL } from "@/lib/api";
import { SERVICE_CATEGORIES, getSubcategoriesByKey } from "@/lib/categories";

interface PrestataireProfile {
  id: number;
  name: string;
  avatar?: string;
  city?: string;
  bio?: string;
  hourly_rate?: number;
  service_categories?: string[];
  service_subcategories?: string[];
  average_rating?: number;
  reviews_count?: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

export default function DirectRequestPage() {
  const router = useRouter();
  const params = useParams();
  const prestataireId = params.id as string;

  const [prestataire, setPrestataire] = useState<PrestataireProfile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [subcategories, setSubcategories] = useState<string[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    budget_min: "",
    budget_max: "",
    city: "",
    address: "",
    preferred_date: "",
    preferred_time: "",
    client_phone: "",
    client_email: "",
  });

  useEffect(() => {
    // Load user from localStorage if available
    const storedUser = localStorage.getItem("prochepro_user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setFormData(prev => ({
          ...prev,
          client_phone: userData.phone || "",
          client_email: userData.email || "",
        }));
      } catch (err) {
        // Error parsing user data
      }
    }
    
    // Fetch prestataire data
    fetchPrestataireData();
  }, [prestataireId]);

  useEffect(() => {
    // Update subcategories when category changes
    if (formData.category) {
      const subs = getSubcategoriesByKey(formData.category) || [];
      setSubcategories(subs);
      
      // Reset subcategory if not in the list
      if (subs.length > 0 && !subs.includes(formData.subcategory)) {
        setFormData(prev => ({ ...prev, subcategory: "" }));
      }
    } else {
      setSubcategories([]);
      setFormData(prev => ({ ...prev, subcategory: "" }));
    }
  }, [formData.category]);

  const fetchPrestataireData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/prestataires/${prestataireId}/profile`);
      
      if (!response.ok) {
        throw new Error("Impossible de charger les informations du prestataire");
      }
      
      const data = await response.json();
      setPrestataire(data);
      
      // Pre-fill city if prestataire has one
      if (data.city) {
        setFormData(prev => ({ ...prev, city: data.city }));
      }
      
      // Pre-select first category if prestataire has categories
      if (data.service_categories && data.service_categories.length > 0) {
        setFormData(prev => ({ ...prev, category: data.service_categories[0] }));
      }
      
    } catch (err) {
      setError("Impossible de charger les informations du prestataire");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      const payload = {
        prestataire_id: parseInt(prestataireId),
        ...formData,
        budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
        budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
      };
      
      const response = await fetch(`${API_BASE_URL}/api/direct-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user ? { "Authorization": `Bearer ${localStorage.getItem("prochepro_token")}` } : {})
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'envoi de la demande");
      }
      
      setSuccess(true);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        subcategory: "",
        budget_min: "",
        budget_max: "",
        city: "",
        address: "",
        preferred_date: "",
        preferred_time: "",
        client_phone: user?.phone || "",
        client_email: user?.email || "",
      });
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(user ? "/dashboard" : "/");
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur s'est produite");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-sky-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error && !prestataire) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Prestataire non trouvé</h1>
        <p className="text-slate-600 mb-4">{error}</p>
        <Link href="/" className="text-sky-600 hover:underline">
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="rounded-2xl bg-emerald-50 p-8 mb-6">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-emerald-800 mb-2">Demande envoyée avec succès !</h1>
          <p className="text-emerald-700 mb-4">
            Votre demande a été envoyée à {prestataire?.name}. Vous serez notifié dès qu&apos;une réponse sera disponible.
          </p>
          <Link href={user ? "/dashboard" : "/"} className="text-emerald-600 hover:underline">
            {user ? "Voir mes demandes" : "Retour à l'accueil"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 text-sm text-slate-600 hover:text-slate-900"
      >
        ↩ Retour
      </button>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">
          Demander un devis à {prestataire?.name}
        </h1>

        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl mb-6">
          <UserAvatar avatar={prestataire?.avatar} name={prestataire?.name || ""} size="md" />
          <div>
            <h2 className="font-semibold text-slate-900">{prestataire?.name}</h2>
            {prestataire?.city && <p className="text-sm text-slate-600">{prestataire?.city}</p>}
            {prestataire?.average_rating && (
              <div className="flex items-center mt-1">
                <span className="text-yellow-500 mr-1">★</span>
                <span className="text-sm font-medium">{prestataire.average_rating.toFixed(1)}</span>
                <span className="text-xs text-slate-500 ml-1">
                  ({prestataire.reviews_count} avis)
                </span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
              Titre de votre demande *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full rounded-lg border-slate-200 shadow-sm focus:border-sky-500 focus:ring-sky-500"
              placeholder="Ex: Réparation de robinet qui fuit"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
              Description détaillée *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full rounded-lg border-slate-200 shadow-sm focus:border-sky-500 focus:ring-sky-500"
              placeholder="Décrivez votre besoin en détail..."
            />
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
                Catégorie *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border-slate-200 shadow-sm focus:border-sky-500 focus:ring-sky-500"
              >
                <option value="">Sélectionner une catégorie</option>
                {SERVICE_CATEGORIES.map(category => (
                  <option key={category.key} value={category.key}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="subcategory" className="block text-sm font-medium text-slate-700 mb-1">
                Sous-catégorie
              </label>
              <select
                id="subcategory"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleInputChange}
                className="w-full rounded-lg border-slate-200 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                disabled={subcategories.length === 0}
              >
                <option value="">Sélectionner une sous-catégorie</option>
                {subcategories.map(sub => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="budget_min" className="block text-sm font-medium text-slate-700 mb-1">
                Budget minimum (€)
              </label>
              <input
                type="number"
                id="budget_min"
                name="budget_min"
                value={formData.budget_min}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full rounded-lg border-slate-200 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                placeholder="Ex: 50"
              />
            </div>
            <div>
              <label htmlFor="budget_max" className="block text-sm font-medium text-slate-700 mb-1">
                Budget maximum (€)
              </label>
              <input
                type="number"
                id="budget_max"
                name="budget_max"
                value={formData.budget_max}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full rounded-lg border-slate-200 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                placeholder="Ex: 100"
              />
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-1">
                Ville *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border-slate-200 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                placeholder="Ex: Paris"
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">
                Adresse
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full rounded-lg border-slate-200 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                placeholder="Ex: 123 Rue de Paris"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="preferred_date" className="block text-sm font-medium text-slate-700 mb-1">
                Date souhaitée
              </label>
              <input
                type="date"
                id="preferred_date"
                name="preferred_date"
                value={formData.preferred_date}
                onChange={handleInputChange}
                className="w-full rounded-lg border-slate-200 shadow-sm focus:border-sky-500 focus:ring-sky-500"
              />
            </div>
            <div>
              <label htmlFor="preferred_time" className="block text-sm font-medium text-slate-700 mb-1">
                Heure souhaitée
              </label>
              <select
                id="preferred_time"
                name="preferred_time"
                value={formData.preferred_time}
                onChange={handleInputChange}
                className="w-full rounded-lg border-slate-200 shadow-sm focus:border-sky-500 focus:ring-sky-500"
              >
                <option value="">Sélectionner une plage horaire</option>
                <option value="Matin (8h-12h)">Matin (8h-12h)</option>
                <option value="Après-midi (12h-17h)">Après-midi (12h-17h)</option>
                <option value="Soir (17h-20h)">Soir (17h-20h)</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>
          </div>

          {/* Contact Info (for guests) */}
          {!user && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="client_email" className="block text-sm font-medium text-slate-700 mb-1">
                  Votre email *
                </label>
                <input
                  type="email"
                  id="client_email"
                  name="client_email"
                  value={formData.client_email}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border-slate-200 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                  placeholder="votre@email.com"
                />
              </div>
              <div>
                <label htmlFor="client_phone" className="block text-sm font-medium text-slate-700 mb-1">
                  Votre téléphone *
                </label>
                <input
                  type="tel"
                  id="client_phone"
                  name="client_phone"
                  value={formData.client_phone}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border-slate-200 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                  placeholder="Ex: 06 12 34 56 78"
                />
              </div>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-emerald-600 px-5 py-3 text-center font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitting ? "Envoi en cours..." : "Envoyer ma demande"}
            </button>
            <p className="mt-2 text-xs text-slate-500 text-center">
              En envoyant cette demande, vous acceptez que le prestataire vous contacte directement.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
