import { API_BASE_URL } from "./api";

export interface ServiceCategory {
  key: string;
  name: string;
  icon: string;
  color: string;
  subcategories: {
    key: string;
    name: string;
  }[];
}

let cachedCategories: ServiceCategory[] | null = null;

export async function fetchCategories(): Promise<ServiceCategory[]> {
  if (cachedCategories) {
    return cachedCategories;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/service-categories`, {
      cache: 'force-cache',
      next: { revalidate: 3600 }
    });
    
    if (res.ok) {
      const data = await res.json();
      cachedCategories = data;
      return data;
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
  }

  return [];
}

export async function getCategoryByKey(key: string): Promise<ServiceCategory | undefined> {
  const categories = await fetchCategories();
  return categories.find(cat => cat.key === key);
}

export async function getSubcategoriesByKey(categoryKey: string): Promise<{ key: string; name: string }[]> {
  const category = await getCategoryByKey(categoryKey);
  return category?.subcategories || [];
}

export function clearCategoriesCache() {
  cachedCategories = null;
}
