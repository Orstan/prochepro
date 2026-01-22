"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import { fetchCategories, ServiceCategory } from "@/lib/categoriesApi";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  roles?: string[];
}

interface NotificationSettings {
  id?: number;
  enabled: boolean;
  notification_mode: "auto_skills" | "manual_selection";
  channels: {
    email: boolean;
    push: boolean;
  };
}

interface InterestedCategory {
  category_key: string;
  subcategory_key?: string | null;
}

export default function NotificationSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    notification_mode: "auto_skills",
    channels: {
      email: true,
      push: true,
    },
  });
  
  const [interestedCategories, setInterestedCategories] = useState<InterestedCategory[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    const storedUser = localStorage.getItem("prochepro_user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      // Check if user is prestataire
      if (!parsedUser.roles?.includes("prestataire") && parsedUser.role !== "prestataire") {
        router.push("/dashboard");
        return;
      }
      
      fetchSettings();
      fetchCategories().then(setCategories);
    } else {
      router.push("/auth/login");
    }
  }, [router]);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("prochepro_token");
      const response = await fetch(`${API_BASE_URL}/api/notification-settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        setInterestedCategories(data.interested_categories || []);
      }
    } catch (error) {
      // Error fetching settings
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("prochepro_token");
      const response = await fetch(`${API_BASE_URL}/api/notification-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          enabled: settings.enabled,
          notification_mode: settings.notification_mode,
          channels: settings.channels,
          interested_categories: settings.notification_mode === "manual_selection" ? interestedCategories : [],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Paramètres enregistrés avec succès" });
      } else {
        setMessage({ type: "error", text: data.message || "Erreur lors de l'enregistrement" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur de connexion" });
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (categoryKey: string, subcategoryKey?: string) => {
    // Якщо вибирається підкатегорія - працюємо тільки з нею
    if (subcategoryKey) {
      const exists = interestedCategories.some(
        (cat) => cat.category_key === categoryKey && cat.subcategory_key === subcategoryKey
      );

      if (exists) {
        setInterestedCategories(
          interestedCategories.filter(
            (cat) => !(cat.category_key === categoryKey && cat.subcategory_key === subcategoryKey)
          )
        );
      } else {
        setInterestedCategories([
          ...interestedCategories,
          { category_key: categoryKey, subcategory_key: subcategoryKey },
        ]);
      }
      return;
    }

    // Якщо вибирається основна категорія - вибираємо всі підкатегорії
    const category = categories.find(cat => cat.key === categoryKey);
    const exists = interestedCategories.some(
      (cat) => cat.category_key === categoryKey && cat.subcategory_key === null
    );

    if (exists) {
      // Видаляємо категорію та всі її підкатегорії
      setInterestedCategories(
        interestedCategories.filter((cat) => cat.category_key !== categoryKey)
      );
    } else {
      // Додаємо категорію + всі підкатегорії
      const newCategories: InterestedCategory[] = [
        { category_key: categoryKey, subcategory_key: null }
      ];
      
      if (category?.subcategories) {
        category.subcategories.forEach(sub => {
          newCategories.push({
            category_key: categoryKey,
            subcategory_key: sub.key
          });
        });
      }

      setInterestedCategories([
        ...interestedCategories.filter((cat) => cat.category_key !== categoryKey),
        ...newCategories
      ]);
    }
  };

  const isCategorySelected = (categoryKey: string, subcategoryKey?: string): boolean => {
    return interestedCategories.some(
      (cat) => cat.category_key === categoryKey && cat.subcategory_key === (subcategoryKey || null)
    );
  };

  const toggleExpandCategory = (categoryKey: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryKey)) {
        newSet.delete(categoryKey);
      } else {
        newSet.add(categoryKey);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 text-sm text-slate-600 hover:text-slate-900"
        >
          ↩ Retour
        </button>

        <h1 className="text-2xl font-semibold text-slate-900 mb-2">
          Notifications des nouvelles missions
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          Recevez des alertes instantanées lorsqu'une nouvelle mission correspond à vos compétences
        </p>

        {message && (
          <div
            className={`mb-6 rounded-lg p-4 ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}


        {/* Settings Form */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          {/* Enable/Disable Toggle */}
          <div className="pb-6 border-b border-slate-200">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-medium text-slate-900">Activer les notifications</div>
                <div className="text-sm text-slate-600 mt-1">
                  Recevoir des alertes pour les nouvelles missions
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                className="h-6 w-12 appearance-none rounded-full bg-slate-300 relative cursor-pointer transition-colors checked:bg-sky-600
                  before:absolute before:h-5 before:w-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform
                  checked:before:translate-x-6"
              />
            </label>
          </div>

          {settings.enabled && (
            <>
              {/* Channels */}
              <div className="py-6 border-b border-slate-200">
                <h3 className="font-medium text-slate-900 mb-4">Canaux de notification</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.channels.email}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          channels: { ...settings.channels, email: e.target.checked },
                        })
                      }
                      className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-slate-900">Email</div>
                      <div className="text-xs text-slate-600">Recevoir par email</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.channels.push}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          channels: { ...settings.channels, push: e.target.checked },
                        })
                      }
                      className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-slate-900">Push</div>
                      <div className="text-xs text-slate-600">Notifications push instantanées</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Notification Mode */}
              <div className="py-6 border-b border-slate-200">
                <h3 className="font-medium text-slate-900 mb-4">Mode de filtrage</h3>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border-2 border-slate-200 hover:border-sky-300 transition">
                    <input
                      type="radio"
                      name="mode"
                      checked={settings.notification_mode === "auto_skills"}
                      onChange={() => setSettings({ ...settings, notification_mode: "auto_skills" })}
                      className="mt-0.5 h-5 w-5 text-sky-600 focus:ring-sky-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        Automatique - Basé sur mes services
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        Recevoir des notifications pour les catégories de services que j'ai ajoutées dans mon profil
                      </div>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border-2 border-slate-200 hover:border-sky-300 transition">
                    <input
                      type="radio"
                      name="mode"
                      checked={settings.notification_mode === "manual_selection"}
                      onChange={() => setSettings({ ...settings, notification_mode: "manual_selection" })}
                      className="mt-0.5 h-5 w-5 text-sky-600 focus:ring-sky-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        Manuel - Sélection personnalisée
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        Choisir manuellement les catégories qui m'intéressent pour les notifications
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Manual Category Selection */}
              {settings.notification_mode === "manual_selection" && (
                <div className="py-6">
                  <h3 className="font-medium text-slate-900 mb-4">
                    Catégories qui m'intéressent
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {categories.map((category) => (
                      <div key={category.key} className="rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 p-3">
                          <input
                            type="checkbox"
                            checked={isCategorySelected(category.key)}
                            onChange={() => toggleCategory(category.key)}
                            className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                          />
                          <div className="flex-1 flex items-center gap-2">
                            <span className="text-lg">{category.icon}</span>
                            <span className="text-sm font-medium text-slate-900">{category.name}</span>
                          </div>
                          {category.subcategories.length > 0 && (
                            <button
                              type="button"
                              onClick={() => toggleExpandCategory(category.key)}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              {expandedCategories.has(category.key) ? "▼" : "▶"}
                            </button>
                          )}
                        </div>
                        {expandedCategories.has(category.key) && (
                          <div className="px-6 pb-3 space-y-2">
                            {category.subcategories.map((sub) => (
                              <label key={sub.key} className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isCategorySelected(category.key, sub.key)}
                                  onChange={() => toggleCategory(category.key, sub.key)}
                                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                />
                                <span className="text-sm text-slate-700">{sub.name}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Save Button */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 rounded-lg bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 disabled:opacity-50 transition"
              >
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
        </div>

      </div>
    </div>
  );
}
