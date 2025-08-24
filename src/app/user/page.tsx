'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ExternalLink, Search, Loader2, Filter, Eye } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { ItemsListResponse } from '@/types';
import { formatDate } from '@/lib/utils';
import { useAuth, useAccountContext } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function UserDashboard() {
  const { user, isAdmin } = useAuth();
  const { currentAccount, userAccounts } = useAccountContext();
  
  const [items, setItems] = useState<ItemsListResponse['data']>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [accountContext, setAccountContext] = useState<any>(null);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadItems();
      loadProperties();
    }
  }, [user, currentAccount]);

  useEffect(() => {
    if (user) {
      loadItems();
    }
  }, [selectedPropertyId]);

  const loadItems = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Prepare headers with account context
      const headers: Record<string, string> = {};
      if (currentAccount) {
        headers['x-current-account'] = currentAccount.id;
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (selectedPropertyId) {
        params.set('propertyId', selectedPropertyId);
      }
      if (searchTerm) {
        params.set('search', searchTerm);
      }

      const queryString = params.toString();
      const url = `/api/admin/items${queryString ? `?${queryString}` : ''}`;

      console.log('Making API request to', url, '(authenticated)');
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Items API response:', data);

      if (data.success) {
        setItems(data.data || []);
        setPagination(data.pagination || null);
        setAccountContext(data.accountContext || null);
      } else {
        throw new Error(data.error || 'Failed to load items');
      }
    } catch (err) {
      console.error('Error loading items:', err);
      setError(err instanceof Error ? err.message : 'Failed to load items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProperties = async () => {
    if (!user) return;
    
    try {
      setPropertiesLoading(true);
      
      // Prepare headers with account context
      const headers: Record<string, string> = {};
      if (currentAccount) {
        headers['x-current-account'] = currentAccount.id;
      }

      console.log('Making API request to /api/admin/properties (authenticated)');
      const response = await fetch('/api/admin/properties', {
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Properties API response:', data);

      if (data.success) {
        setProperties(data.data || []);
      } else {
        console.warn('Failed to load properties:', data.error);
        setProperties([]);
      }
    } catch (err) {
      console.error('Error loading properties:', err);
      setProperties([]);
    } finally {
      setPropertiesLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/admin/items/${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        // Reload items after successful deletion
        await loadItems();
        setDeleteConfirm(null);
      } else {
        throw new Error(data.error || 'Failed to delete item');
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete item');
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.public_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
            <div className="mt-4">
              <button
                onClick={() => loadItems()}
                className="text-sm bg-red-100 text-red-800 rounded-md px-3 py-2 hover:bg-red-200"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Items Management</h1>
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

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Property Filter */}
          <div className="sm:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                disabled={propertiesLoading}
              >
                <option value="">All Properties</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.nickname || `Property ${property.id.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          {filteredItems.length} of {items.length} items
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Pagination info */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <p className="text-sm text-gray-700">
            Page {pagination?.page || 1} of {pagination?.totalPages || 1} • {pagination?.total || items.length} total items
          </p>
        </div>

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
                  Views (24h/Total)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reactions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <p className="text-lg font-medium">No items found</p>
                      <p className="mt-1">
                        {searchTerm || selectedPropertyId 
                          ? 'Try adjusting your filters or search terms'
                          : 'Get started by adding your first item'
                        }
                      </p>
                      {!searchTerm && !selectedPropertyId && (
                        <Link
                          href="/user/items/new"
                          className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Item
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code 
                        className="text-sm bg-gray-100 px-2 py-1 rounded cursor-pointer hover:bg-gray-200"
                        onClick={() => navigator.clipboard.writeText(item.public_id || '')}
                        title="Click to copy"
                      >
                        {item.public_id?.slice(0, 8)}...
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className="text-sm text-gray-600"
                        title={item.property?.nickname || 'Unknown Property'}
                      >
                        {item.property?.nickname?.slice(0, 15) || 'Unknown'}...
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {item.links?.length || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {item.analytics?.visits24h || 0}
                        </span>
                        <span className="text-gray-400">/</span>
                        <span className="text-sm text-gray-600">
                          {item.analytics?.totalVisits || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        {item.analytics?.reactions && Object.values(item.analytics.reactions).some(count => count > 0) ? (
                          Object.entries(item.analytics.reactions)
                            .filter(([_, count]) => count > 0)
                            .map(([type, count]) => (
                              <span key={type} className="text-sm">
                                {type === 'like' && '👍'} 
                                {type === 'love' && '❤️'} 
                                {type === 'confused' && '😕'} 
                                {type === 'dislike' && '👎'} 
                                {count}
                              </span>
                            ))
                        ) : (
                          <span className="text-sm text-gray-400">No reactions</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(item.created_at)}
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
                          onClick={() => setDeleteConfirm(item.id)}
                          className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                          title="Delete item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this item? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteItem(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
