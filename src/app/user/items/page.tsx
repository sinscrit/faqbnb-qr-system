'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Item, Property } from '@/types';
import { Plus, Search, Filter, Edit, Trash2, ExternalLink, Eye } from 'lucide-react';
import Link from 'next/link';

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

export default function UserItemsPage() {
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

      try {
        setLoadingItems(true);
        setError(null);

        // Build query parameters
        const params = new URLSearchParams();
        if (propertyIdFromUrl) {
          params.set('propertyId', propertyIdFromUrl);
        }

        const queryString = params.toString();
        const url = `/api/admin/items${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`Failed to load items: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.success) {
          setItems(result.data || []);
        } else {
          throw new Error(result.error || 'Failed to load items');
        }
      } catch (err) {
        console.error('Error loading items:', err);
        setError(err instanceof Error ? err.message : 'Failed to load items');
      } finally {
        setLoadingItems(false);
      }
    };

    loadItems();
  }, [user, propertyIdFromUrl]);

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/items/${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete item: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        // Remove item from local state
        setItems(prev => prev.filter(item => item.id !== itemId));
      } else {
        throw new Error(result.error || 'Failed to delete item');
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete item');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to view your items.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Items</h1>
          <p className="text-gray-600 mt-1">Manage your QR code items and resources</p>
        </div>
        <Link
          href="/user/items/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading items</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loadingItems && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your items...</p>
          </div>
        </div>
      )}

      {/* Items List */}
      {!loadingItems && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No items</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first item.</p>
              <div className="mt-6">
                <Link
                  href="/user/items/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Item
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Public ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Links
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {item.public_id?.slice(0, 8)}...
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {item.property?.nickname || 'Unknown Property'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {item.linksCount || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {item.analytics?.visits?.allTime || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/item/${item.public_id}`}
                            className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                            title="View item"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/user/items/${item.public_id}/edit`}
                            className="text-gray-600 hover:text-gray-800 p-1 hover:bg-gray-50 rounded"
                            title="Edit item"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                            title="Delete item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
