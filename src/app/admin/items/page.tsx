'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Item, Property } from '@/types';

interface ItemWithDetails extends Item {
  publicId: string;
  linksCount?: number;
  analytics?: {
    visits: {
      last24Hours: number;
      last7Days: number;
      allTime: number;
    };
    reactions: {
      total: number;
      byType: {
        like: number;
        dislike: number;
        love: number;
        confused: number;
        total: number;
      };
    };
  };
  property?: {
    id: string;
    nickname: string;
    user_id: string;
    account_id: string | null;
  };
}

export default function AdminItemsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, isAdmin, selectedProperty } = useAuth();
  const [items, setItems] = useState<ItemWithDetails[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredProperty, setFilteredProperty] = useState<Property | null>(null);

  // Get property ID from URL parameters
  const propertyIdFromUrl = searchParams.get('property');

  // Load items
  useEffect(() => {
    const loadItems = async () => {
      if (!user) return;

      setLoadingItems(true);
      setError(null);

      try {
        // Build API URL with property filter if provided
        // Priority: URL parameter > global selectedProperty > show all
        let apiUrl = '/api/admin/items';
        const effectivePropertyId = propertyIdFromUrl || selectedProperty?.id;
        if (effectivePropertyId) {
          apiUrl += `?property=${effectivePropertyId}`;
        }

        const response = await fetch(apiUrl, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setItems(data.data || []);
          } else {
            setError(data.error || 'Failed to load items');
          }
        } else {
          setError(`Failed to load items: ${response.status}`);
        }
      } catch (error) {
        console.error('Error loading items:', error);
        setError('Failed to connect to server');
      } finally {
        setLoadingItems(false);
      }
    };

    loadItems();
  }, [user, selectedProperty, propertyIdFromUrl]);

  // Load filtered property details
  useEffect(() => {
    const loadPropertyDetails = async () => {
      const effectivePropertyId = propertyIdFromUrl || selectedProperty?.id;
      
      if (!effectivePropertyId || !user) {
        setFilteredProperty(null);
        return;
      }

      // If using selectedProperty, don't fetch again since we already have the data
      if (!propertyIdFromUrl && selectedProperty) {
        setFilteredProperty(selectedProperty);
        return;
      }

      try {
        const response = await fetch(`/api/admin/properties/${effectivePropertyId}`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setFilteredProperty(data.data);
          }
        }
      } catch (error) {
        console.error('Error loading property details:', error);
      }
    };

    loadPropertyDetails();
  }, [propertyIdFromUrl, selectedProperty, user]);

  // Authentication guard
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-6">Please log in to access items management.</p>
        <button
          onClick={() => router.push('/login')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Items Management</h1>
          <p className="text-gray-600 mt-1">
            {filteredProperty 
              ? `Viewing items for ${filteredProperty.nickname}` 
              : (isAdmin ? 'Manage all items in the system' : 'Manage your property items')
            }
          </p>
          {filteredProperty && (
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                🏠 Current Property: {filteredProperty.nickname}
              </span>
              <button
                onClick={() => router.push('/admin/items')}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Clear filter
              </button>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          {filteredProperty && (
            <button
              onClick={() => router.push(`/admin/properties/${filteredProperty.id}`)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← Back to Property
            </button>
          )}
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <button
            onClick={() => {
              const newItemUrl = filteredProperty 
                ? `/admin/items/new?property=${filteredProperty.id}`
                : '/admin/items/new';
              router.push(newItemUrl);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add New Item
          </button>
        </div>
      </div>

      {/* Property filter info */}
      {(filteredProperty || selectedProperty) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-blue-800 font-medium">🏠 Current Property:</span>
            <span className="text-blue-900">
              {filteredProperty ? filteredProperty.nickname : selectedProperty?.nickname}
            </span>
            {filteredProperty && (
              <span className="text-blue-700 text-sm">(filtered by URL)</span>
            )}
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-red-800 font-medium">Error:</span>
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loadingItems && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading items...</p>
          </div>
        </div>
      )}

      {/* Items list */}
      {!loadingItems && !error && (
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Items Found</h3>
              <p className="text-gray-600 mb-6">
                {filteredProperty 
                  ? `No items found for ${filteredProperty.nickname}` 
                  : (selectedProperty 
                    ? `No items found for ${selectedProperty.nickname}` 
                    : 'No items have been created yet'
                  )
                }
              </p>
              <button
                onClick={() => router.push('/admin/items/new')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Item
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>ID: {item.publicId}</span>
                        {item.property && (
                          <span>Property: {item.property.nickname}</span>
                        )}
                        {item.linksCount !== undefined && (
                          <span>Links: {item.linksCount}</span>
                        )}
                        {item.analytics?.visits?.allTime !== undefined && (
                          <span>Visits: {item.analytics.visits.allTime}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => router.push(`/admin/items/${item.publicId}/analytics`)}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200 transition-colors"
                      >
                        📈 Analytics
                      </button>
                      <button
                        onClick={() => router.push(`/admin/items/${item.publicId}/edit`)}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => router.push(`/item/${item.publicId}`)}
                        className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200 transition-colors"
                      >
                        👁️ View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick stats summary */}
      {!loadingItems && !error && items.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{items.length}</div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {items.reduce((sum, item) => sum + (item.linksCount || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Links</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {items.reduce((sum, item) => sum + (item.analytics?.visits?.allTime || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Visits</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {items.reduce((sum, item) => sum + (item.analytics?.reactions?.total || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Reactions</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 