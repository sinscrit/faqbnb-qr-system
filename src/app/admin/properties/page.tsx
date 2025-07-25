'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import { Property, PropertyType, User, PropertiesListResponse, PropertyTypesResponse, UsersListResponse } from '@/types';

interface PropertyManagementState {
  properties: Property[];
  propertyTypes: PropertyType[];
  users: User[];
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  searchQuery: string;
  filterPropertyType: string;
  filterUser: string;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  showDeleteModal: boolean;
  propertyToDelete: Property | null;
  deletingProperty: boolean;
}

const PropertiesPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  const [state, setState] = useState<PropertyManagementState>({
    properties: [],
    propertyTypes: [],
    users: [],
    loading: true,
    error: null,
    isAdmin: false,
    searchQuery: '',
    filterPropertyType: '',
    filterUser: '',
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    showDeleteModal: false,
    propertyToDelete: null,
    deletingProperty: false
  });

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Load properties and supporting data
  const loadData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Load properties
      const propertiesResponse = await fetch('/api/admin/properties', {
        credentials: 'include'
      });

      if (!propertiesResponse.ok) {
        throw new Error('Failed to load properties');
      }

      const propertiesData: PropertiesListResponse = await propertiesResponse.json();

      if (!propertiesData.success) {
        throw new Error(propertiesData.error || 'Failed to load properties');
      }

      // Load property types for filtering
      const typesResponse = await fetch('/api/admin/property-types', {
        credentials: 'include'
      });

      let propertyTypes: PropertyType[] = [];
      if (typesResponse.ok) {
        const typesData: PropertyTypesResponse = await typesResponse.json();
        if (typesData.success && typesData.data) {
          propertyTypes = typesData.data;
        }
      }

      // Load users for admin filtering
      let users: User[] = [];
      if (propertiesData.isAdmin) {
        const usersResponse = await fetch('/api/admin/users', {
          credentials: 'include'
        });

        if (usersResponse.ok) {
          const usersData: UsersListResponse = await usersResponse.json();
          if (usersData.success && usersData.data) {
            users = usersData.data;
          }
        }
      }

      setState(prev => ({
        ...prev,
        properties: propertiesData.data || [],
        propertyTypes,
        users,
        isAdmin: propertiesData.isAdmin || false,
        totalItems: propertiesData.data?.length || 0,
        loading: false
      }));

    } catch (error) {
      console.error('Error loading properties:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load properties',
        loading: false
      }));
    }
  };

  // Filter properties based on search and filters
  const getFilteredProperties = (): Property[] => {
    let filtered = state.properties;

    // Search filter
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(property =>
        property.nickname.toLowerCase().includes(query) ||
        (property.address && property.address.toLowerCase().includes(query)) ||
        (property.property_types?.display_name.toLowerCase().includes(query)) ||
        (property.users?.email.toLowerCase().includes(query)) ||
        (property.users?.full_name && property.users.full_name.toLowerCase().includes(query))
      );
    }

    // Property type filter
    if (state.filterPropertyType) {
      filtered = filtered.filter(property => property.property_type_id === state.filterPropertyType);
    }

    // User filter (admin only)
    if (state.filterUser && state.isAdmin) {
      filtered = filtered.filter(property => property.user_id === state.filterUser);
    }

    return filtered;
  };

  // Get paginated properties
  const getPaginatedProperties = (): Property[] => {
    const filtered = getFilteredProperties();
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    return filtered.slice(startIndex, startIndex + state.itemsPerPage);
  };

  // Get total pages
  const getTotalPages = (): number => {
    const filtered = getFilteredProperties();
    return Math.ceil(filtered.length / state.itemsPerPage);
  };

  // Handle search
  const handleSearch = (query: string) => {
    setState(prev => ({
      ...prev,
      searchQuery: query,
      currentPage: 1 // Reset to first page
    }));
  };

  // Handle filters
  const handleFilterChange = (type: 'propertyType' | 'user', value: string) => {
    setState(prev => ({
      ...prev,
      [type === 'propertyType' ? 'filterPropertyType' : 'filterUser']: value,
      currentPage: 1 // Reset to first page
    }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  // Handle create new property
  const handleCreateProperty = () => {
    router.push('/admin/properties/new');
  };

  // Handle edit property
  const handleEditProperty = (property: Property) => {
    router.push(`/admin/properties/${property.id}/edit`);
  };

  // Handle delete confirmation
  const handleDeleteClick = (property: Property) => {
    setState(prev => ({
      ...prev,
      showDeleteModal: true,
      propertyToDelete: property
    }));
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!state.propertyToDelete) return;

    setState(prev => ({ ...prev, deletingProperty: true }));

    try {
      const response = await fetch(`/api/admin/properties/${state.propertyToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete property');
      }

      // Reload data after successful deletion
      await loadData();

      setState(prev => ({
        ...prev,
        showDeleteModal: false,
        propertyToDelete: null,
        deletingProperty: false
      }));

    } catch (error) {
      console.error('Error deleting property:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete property',
        deletingProperty: false
      }));
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setState(prev => ({
      ...prev,
      showDeleteModal: false,
      propertyToDelete: null
    }));
  };

  if (state.loading) {
    return (
      <AuthGuard>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (state.error) {
    return (
      <AuthGuard>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-red-800">Error Loading Properties</h3>
            <p className="text-sm text-red-600 mt-1">{state.error}</p>
            <button
              onClick={loadData}
              className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const filteredProperties = getFilteredProperties();
  const paginatedProperties = getPaginatedProperties();
  const totalPages = getTotalPages();

  return (
    <AuthGuard>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Property Management</h1>
            <p className="text-sm text-gray-600 mt-1">
              {state.isAdmin ? 'Manage all properties across the system' : 'Manage your properties'}
            </p>
          </div>
          <button
            onClick={handleCreateProperty}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + New Property
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Properties
              </label>
              <input
                type="text"
                id="search"
                value={state.searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by name, address, type, or owner..."
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Property Type Filter */}
            <div>
              <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Type
              </label>
              <select
                id="propertyType"
                value={state.filterPropertyType}
                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {state.propertyTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.display_name}
                  </option>
                ))}
              </select>
            </div>

            {/* User Filter (Admin only) */}
            {state.isAdmin && (
              <div>
                <label htmlFor="userFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Owner
                </label>
                <select
                  id="userFilter"
                  value={state.filterUser}
                  onChange={(e) => handleFilterChange('user', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Owners</option>
                  {state.users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name || user.email}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Results summary */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {paginatedProperties.length} of {filteredProperties.length} properties
              {state.searchQuery && ` matching "${state.searchQuery}"`}
            </p>
          </div>
        </div>

        {/* Properties List */}
        {filteredProperties.length === 0 ? (
          <div className="bg-white rounded-lg border p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Properties Found</h3>
            <p className="text-gray-600 mb-4">
              {state.searchQuery ? 'No properties match your search criteria.' : 'Get started by creating your first property.'}
            </p>
            <button
              onClick={handleCreateProperty}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Property
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
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
                    {state.isAdmin && (
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
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {property.address || 'No address provided'}
                        </div>
                      </td>
                      {state.isAdmin && (
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
                        <button
                          onClick={() => handleEditProperty(property)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(property)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Page {state.currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(state.currentPage - 1)}
                    disabled={state.currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(state.currentPage + 1)}
                    disabled={state.currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {state.showDeleteModal && state.propertyToDelete && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Property</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete the property "{state.propertyToDelete.nickname}"? 
                  This action cannot be undone.
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={handleCancelDelete}
                    disabled={state.deletingProperty}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={state.deletingProperty}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {state.deletingProperty ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
};

export default PropertiesPage; 