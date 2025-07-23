import { ItemResponse, ItemsListResponse, CreateItemRequest, UpdateItemRequest } from '@/types';
import { getSession, refreshSession } from '@/lib/auth';

// Base API configuration
const API_BASE = '/api';

// Helper function to get auth headers
async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const sessionResult = await getSession();
    if (sessionResult.error || !sessionResult.data) {
      console.warn('No valid session found for API request');
      return {};
    }

    return {
      'Authorization': `Bearer ${sessionResult.data.access_token}`,
    };
  } catch (error) {
    console.error('Error getting auth headers:', error);
    return {};
  }
}

// Helper function for making API requests with authentication
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth: boolean = false
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  // Add auth headers if required
  if (requireAuth) {
    const authHeaders = await getAuthHeaders();
    Object.assign(headers, authHeaders);
  }
  
  const config: RequestInit = {
    ...options,
    headers,
  };

  console.log(`Making API request to ${url}${requireAuth ? ' (authenticated)' : ''}`);

  let response = await fetch(url, config);
  
  // Handle authentication errors
  if (response.status === 401 || response.status === 403) {
    console.log('Authentication error, attempting session refresh...');
    
    if (requireAuth) {
      try {
        // Try to refresh the session
        const refreshResult = await refreshSession();
        
        if (!refreshResult.error && refreshResult.data) {
          console.log('Session refreshed successfully, retrying request...');
          
          // Update auth headers with new session
          const newAuthHeaders = await getAuthHeaders();
          Object.assign(headers, newAuthHeaders);
          
          // Retry the request with new headers
          response = await fetch(url, { ...config, headers });
        }
      } catch (refreshError) {
        console.error('Session refresh failed:', refreshError);
      }
    }
    
    // If still unauthorized after refresh attempt, redirect to login
    if (response.status === 401 || response.status === 403) {
      console.error('Authentication failed, redirecting to login...');
      
      // Get current path for redirect
      const currentPath = window.location.pathname + window.location.search;
      const redirectPath = currentPath !== '/login' ? `?redirect=${encodeURIComponent(currentPath)}` : '';
      
      // Redirect to login page
      window.location.href = `/login${redirectPath}`;
      
      // Throw error to prevent further processing
      throw new ApiError(
        'Authentication required. Redirecting to login...',
        response.status,
        'AUTH_REQUIRED'
      );
    }
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Enhanced error handling for different status codes
    const errorMessage = errorData.error || getErrorMessageForStatus(response.status);
    const errorCode = errorData.code || getErrorCodeForStatus(response.status);
    
    console.error(`API request failed: ${response.status} - ${errorMessage}`, {
      url,
      status: response.status,
      errorData,
    });
    
    throw new ApiError(errorMessage, response.status, errorCode);
  }

  return response.json();
}

// Helper function to get error messages for status codes
function getErrorMessageForStatus(status: number): string {
  switch (status) {
    case 400:
      return 'Invalid request data';
    case 401:
      return 'Authentication required';
    case 403:
      return 'Access denied - insufficient privileges';
    case 404:
      return 'Resource not found';
    case 409:
      return 'Resource already exists';
    case 429:
      return 'Too many requests - please try again later';
    case 500:
      return 'Internal server error';
    case 502:
      return 'Service temporarily unavailable';
    case 503:
      return 'Service unavailable';
    default:
      return `HTTP error! status: ${status}`;
  }
}

// Helper function to get error codes for status codes
function getErrorCodeForStatus(status: number): string {
  switch (status) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 429:
      return 'RATE_LIMITED';
    case 500:
      return 'INTERNAL_ERROR';
    case 502:
      return 'BAD_GATEWAY';
    case 503:
      return 'SERVICE_UNAVAILABLE';
    default:
      return 'UNKNOWN_ERROR';
  }
}

// Public API functions (no auth required)
export const publicApi = {
  // Get item by public ID
  async getItem(publicId: string): Promise<ItemResponse> {
    return apiRequest<ItemResponse>(`/items/${encodeURIComponent(publicId)}`, {}, false);
  },
};

// Admin API functions (authentication required)
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
    
    return apiRequest<ItemsListResponse>(endpoint, {}, true);
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
    // Note: Using public API endpoint since admin doesn't have separate GET endpoint
    return apiRequest<ItemResponse>(`/items/${encodeURIComponent(publicId)}`, {}, false);
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
    }, true);
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
    }, true);
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
    }, true);
  },
};

// Enhanced error handling utility
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }

  // Check if error is authentication related
  isAuthError(): boolean {
    return this.status === 401 || this.status === 403 || this.code === 'AUTH_REQUIRED';
  }

  // Check if error is retryable
  isRetryable(): boolean {
    return this.status === 429 || this.status === 502 || this.status === 503;
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

  const isAuthError = (error: unknown): boolean => {
    return error instanceof ApiError && error.isAuthError();
  };

  const isRetryableError = (error: unknown): boolean => {
    return error instanceof ApiError && error.isRetryable();
  };

  return { handleError, isAuthError, isRetryableError };
};

