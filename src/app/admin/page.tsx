'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ExternalLink, Search, Loader2, Filter } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { ItemsListResponse } from '@/types';
import { formatDate } from '@/lib/utils';
import { useAuth, useAccountContext } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function AdminPage() {
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
      
      const response = await adminApi.listItems(undefined, selectedPropertyId || undefined, 1, 20, headers);
      
      if (response.success && response.data) {
        setItems(response.data);
        
        // Set account context and pagination from response
        if ('accountContext' in response) {
          setAccountContext(response.accountContext);
        }
        if ('pagination' in response) {
          setPagination(response.pagination);
        }
      } else {
        setError(response.error || 'Failed to load items');
        setItems([]);
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
      
      const response = await adminApi.listProperties(headers);
      
      if (response.success && response.data) {
        setProperties(response.data);
      } else {
        console.warn('Failed to load properties:', response.error);
        setProperties([]);
      }
    } catch (err) {
      console.warn('Failed to load properties:', err);
      setProperties([]);
    } finally {
      setPropertiesLoading(false);
    }
  };

  const handleDelete = async (publicId: string) => {
    try {
      // Prepare headers with account context
      const headers: Record<string, string> = {};
      if (currentAccount) {
        headers['x-current-account'] = currentAccount.id;
      }
      
      const response = await adminApi.deleteItem(publicId, headers);
      
      if (response.success) {
        setItems(items?.filter(item => item.publicId !== publicId) || []);
        setDeleteConfirm(null);
      } else {
        setError(response.error || 'Failed to delete item');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    }
  };

  const filteredItems = items?.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.publicId.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading items...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Items Management</h1>
            <p className="text-gray-600 mt-1">Manage your QR code items and resources</p>
          </div>
          <Link
            href={`/admin/items/new${selectedPropertyId ? `?propertyId=${selectedPropertyId}` : ''}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Link>
        </div>
      </div>

      <div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 text-sm mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Search, Filter and Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Property Filter */}
              <div className="relative min-w-64">
                <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  disabled={propertiesLoading}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="">
                    {propertiesLoading ? 'Loading properties...' : 'All Properties'}
                  </option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.nickname} {isAdmin && property.users ? `(${property.users.email})` : ''}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              {filteredItems.length} of {items?.length || 0} items
              {selectedPropertyId && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Filtered by Property
                </span>
              )}
            </div>
          </div>
          
          {/* Pagination Info */}
          {pagination && (
            <div className="mt-2 text-xs text-gray-500">
              Page {pagination.page} of {pagination.totalPages} • {pagination.totalItems} total items
            </div>
          )}
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No items found' : 'No items yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Get started by creating your first item'
                }
              </p>
              {!searchTerm && (
                <Link
                  href={`/admin/items/new${selectedPropertyId ? `?propertyId=${selectedPropertyId}` : ''}`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Item
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Public ID
                    </th>
                    <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40 min-w-40">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Links
                    </th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 min-w-24">
                      Views (24h/Total)
                    </th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reactions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 min-w-32">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900" title={item.name}>
                          {item.name.length > 15 ? `${item.name.substring(0, 15)}...` : item.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="group relative">
                          <code 
                            className="px-2 py-1 bg-gray-100 rounded text-sm font-mono cursor-pointer hover:bg-gray-200 transition-colors"
                            onClick={() => {
                              navigator.clipboard.writeText(item.publicId).then(() => {
                                // Show brief feedback
                                const element = document.activeElement;
                                if (element) {
                                  const originalText = element.textContent;
                                  element.textContent = 'Copied!';
                                  setTimeout(() => {
                                    element.textContent = originalText;
                                  }, 1000);
                                }
                              }).catch(() => {
                                // Fallback for older browsers
                                const textArea = document.createElement('textarea');
                                textArea.value = item.publicId;
                                document.body.appendChild(textArea);
                                textArea.select();
                                document.execCommand('copy');
                                document.body.removeChild(textArea);
                                
                                const element = document.activeElement;
                                if (element) {
                                  const originalText = element.textContent;
                                  element.textContent = 'Copied!';
                                  setTimeout(() => {
                                    element.textContent = originalText;
                                  }, 1000);
                                }
                              });
                            }}
                            title="Click to copy full UUID"
                          >
                            {item.publicId.substring(0, 8)}...
                          </code>
                          <div className="invisible group-hover:visible absolute z-10 bg-black text-white text-xs rounded py-1 px-2 bottom-full left-0 whitespace-nowrap pointer-events-none">
                            {item.publicId}
                          </div>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 w-40 min-w-40">
                        <div className="text-sm text-gray-900">
                          {/* Updated to handle new data structure */}
                          {(() => {
                            const propertyName = item.property?.nickname || (item as any).propertyNickname || 'Unknown Property';
                            return (
                              <span title={propertyName}>
                                {propertyName.length > 12 ? `${propertyName.substring(0, 12)}...` : propertyName}
                              </span>
                            );
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {item.linksCount}
                        </span>
                      </td>
                      {/* Views Column */}
                      <td className="hidden sm:table-cell px-6 py-4 w-24 min-w-24">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                            <span className="font-medium">
                              {/* Updated to handle new nested analytics structure */}
                              {item.analytics?.visits?.last24Hours || (item as any).visitCounts?.last24Hours || 0}
                            </span>
                            <span className="text-gray-500">/</span>
                            <span className="text-gray-600">
                              {item.analytics?.visits?.allTime || (item as any).visitCounts?.allTime || 0}
                            </span>
                          </div>
                        </div>
                      </td>
                      {/* Reactions Column */}
                      <td className="hidden md:table-cell px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {/* Updated to handle new nested analytics structure */}
                          {(() => {
                            const reactions = item.analytics?.reactions || (item as any).reactionCounts;
                            return reactions && reactions.total > 0 ? (
                              <div className="flex items-center space-x-2">
                                <div className="flex space-x-1">
                                  {reactions.byType?.like > 0 && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                      👍 {reactions.byType.like}
                                    </span>
                                  )}
                                  {reactions.byType?.love > 0 && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                      ❤️ {reactions.byType.love}
                                    </span>
                                  )}
                                  {reactions.byType?.confused > 0 && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                      😕 {reactions.byType.confused}
                                    </span>
                                  )}
                                  {reactions.byType?.dislike > 0 && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                      👎 {reactions.byType.dislike}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">No reactions</span>
                            );
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 w-32 min-w-32">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/item/${item.publicId}`}
                            target="_blank"
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View item"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/items/${item.publicId}/edit`}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit item"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteConfirm(item.publicId)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete item"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Item</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this item? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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

