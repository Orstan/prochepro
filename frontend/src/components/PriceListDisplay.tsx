import React, { useState, useEffect } from "react";
import { PriceListItem, priceListService } from "@/lib/api/priceListService";

interface PriceListDisplayProps {
  prestataireId: number | string;
  isOwnProfile?: boolean;
}

export default function PriceListDisplay({ prestataireId, isOwnProfile = false }: PriceListDisplayProps) {
  const [priceList, setPriceList] = useState<PriceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPriceList() {
      try {
        setLoading(true);
        setError(null);
        
        const data = isOwnProfile 
          ? await priceListService.getMyPriceList()
          : await priceListService.getForPrestataire(prestataireId);
        
        setPriceList(data);
      } catch (err) {
        setError("Impossible de charger la liste de prix");
      } finally {
        setLoading(false);
      }
    }

    fetchPriceList();
  }, [prestataireId, isOwnProfile]);

  if (loading) {
    return (
      <div className="py-4 text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-sky-500 border-r-transparent"></div>
        <p className="mt-2 text-sm text-slate-500">Chargement des tarifs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (priceList.length === 0) {
    return (
      <div className="py-4 text-center border rounded-lg bg-slate-50">
        <p className="text-slate-500">
          {isOwnProfile 
            ? "Vous n'avez pas encore ajouté de tarifs. Ajoutez vos services pour attirer plus de clients."
            : "Ce prestataire n'a pas encore ajouté de tarifs."}
        </p>
      </div>
    );
  }

  // Group by category
  const groupedByCategory: Record<string, PriceListItem[]> = {};
  const uncategorized: PriceListItem[] = [];

  priceList.forEach(item => {
    if (item.category) {
      if (!groupedByCategory[item.category]) {
        groupedByCategory[item.category] = [];
      }
      groupedByCategory[item.category].push(item);
    } else {
      uncategorized.push(item);
    }
  });

  // Format price based on price_type
  const formatPrice = (item: PriceListItem) => {
    const price = item.price.toFixed(2).replace(/\.00$/, '');
    
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

  return (
    <div className="price-list">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        <span className="mr-2">💰</span>
        Tarifs et services
      </h3>
      
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
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-slate-200">
            {/* Featured items first */}
            {priceList.filter(item => item.is_featured).map(item => (
              <tr key={item.id} className="bg-amber-50">
                <td className="px-4 py-3">
                  <div className="flex items-start">
                    <span className="text-amber-500 mr-2">⭐</span>
                    <div>
                      <p className="font-medium text-slate-900">{item.service_name}</p>
                      {item.description && (
                        <p className="text-sm text-slate-500">{item.description}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-900">
                  {formatPrice(item)}
                </td>
              </tr>
            ))}
            
            {/* Then categorized items */}
            {Object.entries(groupedByCategory).map(([category, items]) => (
              <React.Fragment key={category}>
                <tr className="bg-slate-100">
                  <td colSpan={2} className="px-4 py-2 font-medium text-slate-700">
                    {category}
                  </td>
                </tr>
                {items.filter(item => !item.is_featured).map(item => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{item.service_name}</p>
                      {item.description && (
                        <p className="text-sm text-slate-500">{item.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {formatPrice(item)}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
            
            {/* Then uncategorized items */}
            {uncategorized.filter(item => !item.is_featured).map(item => (
              <tr key={item.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{item.service_name}</p>
                  {item.description && (
                    <p className="text-sm text-slate-500">{item.description}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-900">
                  {formatPrice(item)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
