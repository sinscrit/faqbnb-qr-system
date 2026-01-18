'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Item } from '@/types';
import { Plus, Edit, Trash2, ExternalLink, Search, Loader2, Filter, Shield, Eye, EyeOff } from 'lucide-react';
import { formatDate } from '@/lib/utils';
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

interface PropertyOption {
  id: string;
  nickname: string;
  users?: {
    email: string;
  };
}

interface ItemsManagementProps {
  // Data props
  items: ItemWithDetails[];
  properties: PropertyOption[];
  selectedPropertyId: string;
  searchTerm: string;
  loading: boolean;
  propertiesLoading: boolean;
  error: string | null;
  pagination?: any;

  // Permission props
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canViewAnalytics: boolean;
  isAdmin: boolean;

  // Context props
  selectedProperty?: any;
  accountContext?: any;

  // Event handlers
  onSearchChange: (term: string) => void;
  onPropertyFilterChange: (propertyId: string) => void;
  onDeleteItem: (publicId: string) => Promise<void>;
  onRefresh?: () => void;

  // UI customization
  className?: string;
  showCreateButton?: boolean;
  createButtonHref?: string;
  createButtonText?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
}

export function ItemsManagement({
  // Data props
  items,
  properties,
  selectedPropertyId,
  searchTerm,
  loading,
  propertiesLoading,
  error,
  pagination,

  // Permission props
  canCreate,
  canEdit,
  canDelete,
  canViewAnalytics,
  isAdmin,

  // Context props
  selectedProperty,
  accountContext,

  // Event handlers
  onSearchChange,
  onPropertyFilterChange,
  onDeleteItem,
  onRefresh,

  // UI customization
  className = '',
  showCreateButton = true,
  createButtonHref = '/dashboard/items/new',
  createButtonText = 'Add Item',
  emptyStateTitle = 'No items yet',
  emptyStateDescription = 'Get started by creating your first item'
}: ItemsManagementProps) {
  const router = useRouter();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredItems = items?.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.publicId.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDelete = async (publicId: string) => {
    if (!canDelete) {
      return;
    }

    try {
      await onDeleteItem(publicId);
      setDeleteConfirm(null);
    } catch (err) {
      // Error handling is done in the parent component
    }
  };

  const copyToClipboard = async (text: string, publicId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(publicId);
      // Reset after 2 seconds
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedId(publicId);
      // Reset after 2 seconds
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading items management...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => onRefresh?.()}
            className="text-red-600 hover:text-red-800 text-sm mt-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Permission Warning */}
      {(!canCreate || !canEdit || !canDelete) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-yellow-600 mr-3" />
            <div className="text-yellow-800">
              <p className="text-sm font-medium">Limited Permissions</p>
              <p className="text-sm">
                {!canCreate && 'Cannot create items. '}
                {!canEdit && 'Cannot edit items. '}
                {!canDelete && 'Cannot delete items. '}
                {!canViewAnalytics && 'Analytics hidden.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search, Filter and Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Property Filter */}
            <div className="relative min-w-64">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedPropertyId}
                onChange={(e) => onPropertyFilterChange(e.target.value)}
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
              {searchTerm ? 'No items found' : emptyStateTitle}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? 'Try adjusting your search terms'
                : emptyStateDescription
              }
            </p>
            {!searchTerm && showCreateButton && canCreate && (
              <Link
                href={createButtonHref + (selectedPropertyId ? `?propertyId=${selectedPropertyId}` : '')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                {createButtonText}
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
                  {canViewAnalytics && (
                    <>
                      <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 min-w-24">
                        Views (24h/Total)
                      </th>
                      <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reactions
                      </th>
                    </>
                  )}
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
                        <button
                          type="button"
                          className="px-2 py-1 bg-gray-100 rounded text-sm font-mono cursor-pointer hover:bg-gray-200 transition-colors border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onClick={(e) => copyToClipboard(item.publicId, item.publicId, e)}
                          title="Click to copy full UUID"
                        >
                          {copiedId === item.publicId ? 'Copied!' : `${item.publicId.substring(0, 8)}...`}
                        </button>
                        {copiedId === item.publicId && (
                          <div className="absolute z-20 bg-green-600 text-white text-xs rounded py-1 px-2 bottom-full left-0 mb-1 whitespace-nowrap pointer-events-none transition-opacity duration-200">
                            Copied to clipboard!
                          </div>
                        )}
                        <div className="invisible group-hover:visible absolute z-10 bg-black text-white text-xs rounded py-1 px-2 bottom-full left-0 whitespace-nowrap pointer-events-none">
                          {item.publicId}
                        </div>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 w-40 min-w-40">
                      <div className="text-sm text-gray-900">
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
                    {/* Views Column - Only show if user has analytics permission */}
                    {canViewAnalytics && (
                      <td className="hidden sm:table-cell px-6 py-4 w-24 min-w-24">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">
                              {item.analytics?.visits?.last24Hours || (item as any).visitCounts?.last24Hours || 0}
                            </span>
                            <span className="text-gray-500">/</span>
                            <span className="text-gray-600">
                              {item.analytics?.visits?.allTime || (item as any).visitCounts?.allTime || 0}
                            </span>
                          </div>
                        </div>
                      </td>
                    )}
                    {/* Reactions Column - Only show if user has analytics permission */}
                    {canViewAnalytics && (
                      <td className="hidden md:table-cell px-6 py-4">
                        <div className="text-sm text-gray-900">
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
                    )}
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
                        {canEdit && (
                          <Link
                            href={`/dashboard/items/${item.publicId}/edit`}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit item"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setDeleteConfirm(item.publicId)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
