import { API_BASE_URL } from "@/lib/api";

export interface PriceListItem {
  id?: number;
  user_id?: number;
  service_name: string;
  description?: string;
  price: number;
  price_type: 'fixed' | 'hourly' | 'from';
  category?: string;
  subcategory?: string;
  is_featured: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export const priceListService = {
  // Get price list for a specific prestataire (public)
  async getForPrestataire(prestataireId: string | number): Promise<PriceListItem[]> {
    const response = await fetch(`${API_BASE_URL}/api/prestataires/${prestataireId}/price-list`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch price list');
    }
    
    return response.json();
  },
  
  // Get current user's price list (authenticated)
  async getMyPriceList(): Promise<PriceListItem[]> {
    const token = localStorage.getItem('prochepro_token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/price-list`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch price list');
    }
    
    return response.json();
  },
  
  // Create a new price list item
  async createItem(item: PriceListItem): Promise<PriceListItem> {
    const token = localStorage.getItem('prochepro_token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/price-list`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create price list item');
    }
    
    return response.json();
  },
  
  // Update an existing price list item
  async updateItem(id: number, item: Partial<PriceListItem>): Promise<PriceListItem> {
    const token = localStorage.getItem('prochepro_token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/price-list/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update price list item');
    }
    
    return response.json();
  },
  
  // Delete a price list item
  async deleteItem(id: number): Promise<void> {
    const token = localStorage.getItem('prochepro_token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/price-list/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete price list item');
    }
  },
  
  // Update sort order of multiple items
  async updateSortOrder(items: { id: number, sort_order: number }[]): Promise<void> {
    const token = localStorage.getItem('prochepro_token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/price-list/sort`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update sort order');
    }
  }
};
