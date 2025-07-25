'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Item } from '@/types';

interface ItemWithDetails extends Item {
  links_count?: number;
  visits_count?: number;
  reactions_count?: number;
  property_name?: string;
}

export default function AdminItemsPage() {
  const router = useRouter();
  const { user, loading, isAdmin, selectedProperty } = useAuth();
  const [items, setItems] = useState<ItemWithDetails[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load items
  useEffect(() => {
    const loadItems = async () => {
      if (!user) return;

      setLoadingItems(true);
      setError(null);

      try {
        const response = await fetch('/api/admin/items', {
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
  }, [user, selectedProperty]);

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
            {isAdmin ? 'Manage all items in the system' : 'Manage your property items'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <button
            onClick={() => router.push('/admin/items/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add New Item
          </button>
        </div>
      </div>

      {/* Property filter info */}
      {selectedProperty && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-blue-800 font-medium">🏠 Current Property:</span>
            <span className="text-blue-900">{selectedProperty.nickname}</span>
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
                {selectedProperty 
                  ? `No items found for ${selectedProperty.nickname}` 
                  : 'No items have been created yet'
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
                        <span>ID: {item.public_id}</span>
                        {item.property_name && (
                          <span>Property: {item.property_name}</span>
                        )}
                        {item.links_count !== undefined && (
                          <span>Links: {item.links_count}</span>
                        )}
                        {item.visits_count !== undefined && (
                          <span>Visits: {item.visits_count}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => router.push(`/admin/items/${item.public_id}/analytics`)}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200 transition-colors"
                      >
                        📈 Analytics
                      </button>
                      <button
                        onClick={() => router.push(`/admin/items/${item.public_id}/edit`)}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => router.push(`/item/${item.public_id}`)}
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
                {items.reduce((sum, item) => sum + (item.links_count || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Links</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {items.reduce((sum, item) => sum + (item.visits_count || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Visits</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {items.reduce((sum, item) => sum + (item.reactions_count || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Reactions</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 