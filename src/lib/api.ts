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
  // List all items
  async listItems(): Promise<ItemsListResponse> {
    return apiRequest<ItemsListResponse>('/admin/items');
  },

  // Get item by public ID (same as public API but through admin route)
  async getItem(publicId: string): Promise<ItemResponse> {
    return apiRequest<ItemResponse>(`/items/${encodeURIComponent(publicId)}`);
  },

  // Create new item
  async createItem(item: CreateItemRequest): Promise<ItemResponse> {
    return apiRequest<ItemResponse>('/admin/items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  // Update existing item
  async updateItem(publicId: string, item: UpdateItemRequest): Promise<ItemResponse> {
    return apiRequest<ItemResponse>(`/admin/items/${encodeURIComponent(publicId)}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  },

  // Delete item
  async deleteItem(publicId: string): Promise<{ success: boolean; data?: { message: string }; error?: string }> {
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

