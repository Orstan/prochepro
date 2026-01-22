import React, { useState, useEffect } from "react";
import { PriceListItem, priceListService } from "@/lib/api/priceListService";

interface PriceListEditorProps {
  onSaved?: () => void;
}

export default function PriceListEditor({ onSaved }: PriceListEditorProps) {
  const [priceList, setPriceList] = useState<PriceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<PriceListItem | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<PriceListItem>({
    service_name: "",
    description: "",
    price: 0,
    price_type: "fixed",
    category: "",
    is_featured: false,
  });

  useEffect(() => {
    fetchPriceList();
  }, []);

  async function fetchPriceList() {
    try {
      setLoading(true);
      setError(null);
      
      const data = await priceListService.getMyPriceList();
      setPriceList(data);
    } catch (err) {
      setError("Impossible de charger votre liste de prix");
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      service_name: "",
      description: "",
      price: 0,
      price_type: "fixed",
      category: "",
      is_featured: false,
    });
    setEditingItem(null);
  };

  const handleEditItem = (item: PriceListItem) => {
    setEditingItem(item);
    setFormData({
      service_name: item.service_name,
      description: item.description || "",
      price: item.price,
      price_type: item.price_type,
      category: item.category || "",
      is_featured: item.is_featured,
    });
    setShowForm(true);
  };

  const handleDeleteItem = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce tarif ?")) {
      return;
    }
    
    try {
      setSaving(true);
      await priceListService.deleteItem(id);
      setPriceList(prev => prev.filter(item => item.id !== id));
      if (onSaved) onSaved();
    } catch (err) {
      setError("Impossible de supprimer ce tarif");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      // Make sure price is a number
      const priceData = {
        ...formData,
        price: parseFloat(formData.price.toString()),
      };
      
      let savedItem: PriceListItem;
      
      if (editingItem?.id) {
        // Update existing item
        savedItem = await priceListService.updateItem(editingItem.id, priceData);
        setPriceList(prev => 
          prev.map(item => item.id === editingItem.id ? savedItem : item)
        );
      } else {
        // Create new item
        savedItem = await priceListService.createItem(priceData);
        setPriceList(prev => [...prev, savedItem]);
      }
      
      resetForm();
      setShowForm(false);
      if (onSaved) onSaved();
    } catch (err) {
      setError("Impossible d'enregistrer ce tarif");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSortOrder = async (items: { id: number, sort_order: number }[]) => {
    try {
      await priceListService.updateSortOrder(items);
    } catch (err) {
      // Error updating sort order
    }
  };

  // Format price based on price_type
  const formatPrice = (item: PriceListItem) => {
    const price = item.price.toString().replace(/\.00$/, '');
    
    switch (item.price_type) {
      case 'hourly':
        return `${price}€/h`;
      case 'from':
        return `à partir de ${price}€`;
      case 'fixed':
      default:
        return `${price}€`;
    }
  };

  if (loading) {
    return (
      <div className="py-4 text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-sky-500 border-r-transparent"></div>
        <p className="mt-2 text-sm text-slate-500">Chargement des tarifs...</p>
      </div>
    );
  }

  return (
    <div className="price-list-editor">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          <span className="mr-2">💰</span>
          Mes tarifs et services
        </h3>
        
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
          >
            + Ajouter un tarif
          </button>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg bg-slate-50">
          <h4 className="font-medium text-slate-900 mb-3">
            {editingItem ? "Modifier le tarif" : "Ajouter un nouveau tarif"}
          </h4>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nom du service *
              </label>
              <input
                type="text"
                name="service_name"
                value={formData.service_name}
                onChange={handleInputChange}
                required
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                placeholder="ex: Installation de robinet"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Prix *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                placeholder="ex: 50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Type de prix *
              </label>
              <select
                name="price_type"
                value={formData.price_type}
                onChange={handleInputChange}
                required
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
              >
                <option value="fixed">Prix fixe</option>
                <option value="hourly">Prix horaire</option>
                <option value="from">À partir de</option>
              </select>
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description (optionnelle)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={2}
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                placeholder="ex: Inclut les pièces et la main d'œuvre"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Catégorie (optionnelle)
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                placeholder="ex: Plomberie"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_featured"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <label htmlFor="is_featured" className="ml-2 text-sm text-slate-700">
                Mettre en avant ce tarif (⭐)
              </label>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 hover:bg-slate-50"
              disabled={saving}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
              disabled={saving}
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      )}
      
      {priceList.length === 0 ? (
        <div className="py-6 text-center border rounded-lg bg-slate-50">
          <p className="text-slate-500">
            Vous n'avez pas encore ajouté de tarifs. Ajoutez vos services pour attirer plus de clients.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Service
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Prix
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-slate-200">
              {priceList.map((item) => (
                <tr key={item.id} className={item.is_featured ? "bg-amber-50" : ""}>
                  <td className="px-4 py-3">
                    <div className="flex items-start">
                      {item.is_featured && <span className="text-amber-500 mr-2">⭐</span>}
                      <div>
                        <p className="font-medium text-slate-900">{item.service_name}</p>
                        {item.description && (
                          <p className="text-sm text-slate-500">{item.description}</p>
                        )}
                        {item.category && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-slate-100 text-slate-700 rounded-full">
                            {item.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">
                    {formatPrice(item)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <button
                      type="button"
                      onClick={() => handleEditItem(item)}
                      className="text-sky-600 hover:text-sky-900 mr-3"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => item.id && handleDeleteItem(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
