'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Property, PropertyType, User } from '@/types';
import { Plus, Search, Filter, Loader2, Shield, Eye, EyeOff, Edit, Trash2, ExternalLink, RefreshCw } from 'lucide-react';

interface PropertiesManagementProps {
  // Data props
  properties: Property[];
  propertyTypes: PropertyType[];
  users: User[];
  loading: boolean;
  error: string | null;

  // Permission props
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManage: boolean;
  isAdmin: boolean;

  // Context props
  accountContext?: any;

  // Event handlers
  onViewProperty: (property: Property) => void;
  onEditProperty: (property: Property) => void;
  onDeleteProperty: (propertyId: string) => Promise<void>;
  onRefresh: () => void;

  // UI customization
  className?: string;
  itemsPerPage?: number;
}

export function PropertiesManagement({
  // Data props
  properties,
  propertyTypes,
  users,
  loading,
  error,

  // Permission props
  canCreate,
  canEdit,
  canDelete,
  canManage,
  isAdmin,

  // Context props
  accountContext,

  // Event handlers
  onViewProperty,
  onEditProperty,
  onDeleteProperty,
  onRefresh,

  // UI customization
  className = '',
  itemsPerPage = 10
}: PropertiesManagementProps) {
  const tEmpty = useTranslations('common.emptyStates');
  const tLoading = useTranslations('common.loading');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPropertyType, setFilterPropertyType] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [deletingProperty, setDeletingProperty] = useState(false);

  // Filter properties based on search and filters
  const getFilteredProperties = (): Property[] => {
    let filtered = properties;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(property =>
        property.nickname.toLowerCase().includes(query) ||
        (property.address && property.address.toLowerCase().includes(query)) ||
        (property.property_types?.display_name.toLowerCase().includes(query)) ||
        (property.users?.email.toLowerCase().includes(query)) ||
        (property.users?.full_name && property.users.full_name.toLowerCase().includes(query))
      );
    }

    // Property type filter
    if (filterPropertyType) {
      filtered = filtered.filter(property => property.property_type_id === filterPropertyType);
    }

    // User filter (admin only)
    if (filterUser && isAdmin && canManage) {
      filtered = filtered.filter(property => property.user_id === filterUser);
    }

    return filtered;
  };

  // Get paginated properties
  const getPaginatedProperties = (): Property[] => {
    const filtered = getFilteredProperties();
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  };

  // Get total pages
  const getTotalPages = (): number => {
    const filtered = getFilteredProperties();
    return Math.ceil(filtered.length / itemsPerPage);
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page
  };

  // Handle filters
  const handleFilterChange = (type: 'propertyType' | 'user', value: string) => {
    if (type === 'propertyType') {
      setFilterPropertyType(value);
    } else {
      setFilterUser(value);
    }
    setCurrentPage(1); // Reset to first page
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle delete confirmation
  const handleDeleteClick = (property: Property) => {
    if (canDelete) {
      setShowDeleteModal(true);
      setPropertyToDelete(property);
    }
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!propertyToDelete || !canDelete) return;

    setDeletingProperty(true);

    try {
      await onDeleteProperty(propertyToDelete.id);

      setShowDeleteModal(false);
      setPropertyToDelete(null);

    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setDeletingProperty(false);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setPropertyToDelete(null);
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-red-800">Error Loading Properties</h3>
          <p className="text-sm text-red-600 mt-1">{error}</p>
          <button
            onClick={onRefresh}
            className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
          >
            <RefreshCw className="w-4 h-4 mr-2 inline" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const filteredProperties = getFilteredProperties();
  const paginatedProperties = getPaginatedProperties();
  const totalPages = getTotalPages();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Permission Warning */}
      {(!canManage || !canEdit || !canDelete) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-yellow-600 mr-3" />
            <div className="text-yellow-800">
              <p className="text-sm font-medium">Limited Permissions</p>
              <p className="text-sm">
                {!canManage && 'Cannot manage properties. '}
                {!canEdit && 'Cannot edit properties. '}
                {!canDelete && 'Cannot delete properties.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Properties
            </label>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by name, address, type, or owner..."
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Property Type Filter */}
          <div>
            <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Type
            </label>
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                id="propertyType"
                value={filterPropertyType}
                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="">All Types</option>
                {propertyTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.display_name}
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

          {/* User Filter (Admin only) */}
          {isAdmin && canManage && (
            <div>
              <label htmlFor="userFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Owner
              </label>
              <div className="relative">
                <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  id="userFilter"
                  value={filterUser}
                  onChange={(e) => handleFilterChange('user', e.target.value)}
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="">All Owners</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name || user.email}
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
          )}
        </div>

        {/* Results summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {paginatedProperties.length} of {filteredProperties.length} properties
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
      </div>

      {/* Properties List */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Search className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">{tEmpty('properties.titleNotFound')}</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? tEmpty('properties.descriptionSearchNoMatch') : tEmpty('properties.descriptionCreate')}
          </p>
          {canCreate && !searchQuery && (
            <div className="text-sm text-gray-500">
              Create button available above when you have create permissions
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View - Hidden on mobile */}
          <div className="hidden md:block bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    {isAdmin && canManage && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedProperties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {property.nickname}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {property.id.substring(0, 8)}...
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {property.property_types?.display_name || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-32 truncate">
                          {property.address || 'No address provided'}
                        </div>
                      </td>
                      {isAdmin && canManage && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {property.users?.full_name || property.users?.email || 'Unknown'}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {property.created_at ? new Date(property.created_at).toLocaleDateString() : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => onViewProperty(property)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => onEditProperty(property)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteClick(property)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View - Visible only on mobile */}
          <div className="md:hidden space-y-4">
            {paginatedProperties.map((property) => (
              <div key={property.id} className="bg-white rounded-lg border shadow-sm overflow-hidden">
                {/* Card Header */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {property.nickname}
                      </h3>
                      <p className="text-xs text-gray-500">
                        ID: {property.id.substring(0, 8)}...
                      </p>
                    </div>
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0">
                      {property.property_types?.display_name || 'Unknown'}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="px-4 py-3">
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium text-gray-500">Address:</span>
                      <p className="text-sm text-gray-900 mt-1">
                        {property.address || 'No address provided'}
                      </p>
                    </div>

                    <div className="flex justify-between items-center">
                      {isAdmin && canManage && (
                        <div>
                          <span className="text-xs font-medium text-gray-500">Owner:</span>
                          <p className="text-sm text-gray-900">
                            {property.users?.full_name || property.users?.email || 'Unknown'}
                          </p>
                        </div>
                      )}
                      <div className={isAdmin && canManage ? '' : 'w-full'}>
                        <span className="text-xs font-medium text-gray-500">Created:</span>
                        <p className="text-sm text-gray-900">
                          {property.created_at ? new Date(property.created_at).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onViewProperty(property)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </button>
                    {canEdit && (
                      <button
                        onClick={() => onEditProperty(property)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDeleteClick(property)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gray-50 px-4 md:px-6 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 mt-4 md:mt-0 rounded-b-lg">
          <div className="text-sm text-gray-700 mb-2 sm:mb-0">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && propertyToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Property</h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete the property "{propertyToDelete.nickname}"?
                This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={handleCancelDelete}
                  disabled={deletingProperty}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deletingProperty}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {deletingProperty ? tLoading('status.deleting') : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
