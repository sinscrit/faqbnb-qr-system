import { ItemResponse, ItemsListResponse, CreateItemRequest, UpdateItemRequest } from '@/types';

// Base API configuration
const API_BASE = '/api';

// Helper function for making API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Public API functions
export const publicApi = {
  // Get item by public ID
  async getItem(publicId: string): Promise<ItemResponse> {
    return apiRequest<ItemResponse>(`/items/${encodeURIComponent(publicId)}`);
  },
};

// Admin API functions
export const adminApi = {
  /**
   * List all items with optional search and pagination
   * @param search Optional search query to filter items by name or public ID
   * @param page Page number for pagination (default: 1)
   * @param limit Number of items per page (default: 20)
   * @returns Promise resolving to items list response
   */
  async listItems(search?: string, page: number = 1, limit: number = 20): Promise<ItemsListResponse> {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (page !== 1) params.set('page', page.toString());
    if (limit !== 20) params.set('limit', limit.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/admin/items?${queryString}` : '/admin/items';
    
    return apiRequest<ItemsListResponse>(endpoint);
  },

  /**
   * Get item by public ID for admin purposes
   * @param publicId The public UUID of the item
   * @returns Promise resolving to item response with full details
   */
  async getItem(publicId: string): Promise<ItemResponse> {
    if (!publicId || typeof publicId !== 'string') {
      throw new ApiError('Invalid publicId: must be a non-empty string');
    }
    return apiRequest<ItemResponse>(`/items/${encodeURIComponent(publicId)}`);
  },

  /**
   * Create a new item with associated links
   * @param item The item data including links to create
   * @returns Promise resolving to the created item response
   */
  async createItem(item: CreateItemRequest): Promise<ItemResponse> {
    if (!item || !item.publicId || !item.name) {
      throw new ApiError('Invalid item data: publicId and name are required');
    }
    
    // Validate UUID format
    const uuidRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;
    if (!uuidRegex.test(item.publicId)) {
      throw new ApiError('Invalid publicId: must be a valid UUID format');
    }
    
    return apiRequest<ItemResponse>('/admin/items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  /**
   * Update an existing item and its links
   * @param publicId The public UUID of the item to update
   * @param item The updated item data
   * @returns Promise resolving to the updated item response
   */
  async updateItem(publicId: string, item: UpdateItemRequest): Promise<ItemResponse> {
    if (!publicId || typeof publicId !== 'string') {
      throw new ApiError('Invalid publicId: must be a non-empty string');
    }
    
    if (!item || !item.name) {
      throw new ApiError('Invalid item data: name is required');
    }
    
    return apiRequest<ItemResponse>(`/admin/items/${encodeURIComponent(publicId)}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  },

  /**
   * Delete an item and all its associated links
   * @param publicId The public UUID of the item to delete
   * @returns Promise resolving to deletion confirmation response
   */
  async deleteItem(publicId: string): Promise<{ 
    success: boolean; 
    message?: string; 
    deletedItem?: { publicId: string; name: string; deletedLinks: number }; 
    error?: string;
  }> {
    if (!publicId || typeof publicId !== 'string') {
      throw new ApiError('Invalid publicId: must be a non-empty string');
    }
    
    return apiRequest(`/admin/items/${encodeURIComponent(publicId)}`, {
      method: 'DELETE',
    });
  },
};

// Error handling utility
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Hook-like functions for React components
export const useApiError = () => {
  const handleError = (error: unknown): string => {
    if (error instanceof ApiError) {
      return error.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unexpected error occurred';
  };

  return { handleError };
};

