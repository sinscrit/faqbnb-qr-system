'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Property, PropertyType, User, PropertiesListResponse, PropertyTypesResponse, UsersListResponse } from '@/types';
import { Plus, Search, Filter, Loader2, Shield, Eye, EyeOff, Edit, Trash2, ExternalLink } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { PropertiesManagement } from '@/components/PropertiesManagement';
import Link from 'next/link';

export default function DashboardPropertiesPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAdmin, currentAccount } = useAuth();

  // Enhanced: Use AuthContext account role integration (REQ-024) - removed temporary accountUser hardcoding
  const { useCanAccess, permissions, isLoading: permissionsLoading } = usePermissions(user, currentAccount);

  // Enhanced: Validate account role integration (REQ-024)
  console.log('🔍 PROPERTIES_PAGE_DEBUG: Account role integration validation', {
    userId: user?.id,
    accountId: currentAccount?.id,
    accountName: currentAccount?.name,
    accountUserRole: currentAccount?.userRole,
    isAccountOwner: currentAccount && user ? currentAccount.owner_id === user.id : false,
    permissionsLoading,
    hasPermissions: !!permissions
  });

  // Permission checks
  const canViewProperties = useCanAccess('view_properties');
  const canCreateProperties = useCanAccess('create_properties');
  const canEditProperties = useCanAccess('edit_properties');
  const canDeleteProperties = useCanAccess('delete_properties');
  const canManageProperties = useCanAccess('manage_properties');

  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    if (user && !permissionsLoading && canViewProperties.granted) {
      loadData();
    }
  }, [user, permissionsLoading, canViewProperties.granted]);

  // Load properties and supporting data
  const loadData = async () => {
    if (!user || !canViewProperties.granted) return;

    setLoading(true);
    setError(null);

    try {
      // Prepare headers with account context
      const headers: Record<string, string> = {};
      if (currentAccount) {
        headers['x-current-account'] = currentAccount.id;
      }

      // Load properties
      const propertiesResponse = await adminApi.listProperties(headers);

      if (!propertiesResponse.success) {
        throw new Error(propertiesResponse.error || 'Failed to load properties');
      }

      const propertiesData: PropertiesListResponse = propertiesResponse;

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
      if (isAdmin && canManageProperties.granted) {
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

      setProperties(propertiesData.data || []);
      setPropertyTypes(propertyTypes);
      setUsers(users);

    } catch (error) {
      console.error('Error loading properties:', error);
      setError(error instanceof Error ? error.message : 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  // Handle create new property
  const handleCreateProperty = () => {
    if (canCreateProperties.granted) {
      router.push('/dashboard/properties/new');
    }
  };

  // Handle view property
  const handleViewProperty = (property: Property) => {
    router.push(`/dashboard/properties/${property.id}`);
  };

  // Handle edit property
  const handleEditProperty = (property: Property) => {
    if (canEditProperties.granted) {
      router.push(`/dashboard/properties/${property.id}/edit`);
    }
  };

  // Handle delete property
  const handleDeleteProperty = async (propertyId: string) => {
    if (!canDeleteProperties.granted) {
      setError('You do not have permission to delete properties');
      return;
    }

    try {
      // Prepare headers with account context
      const headers: Record<string, string> = {};
      if (currentAccount) {
        headers['x-current-account'] = currentAccount.id;
      }

      const response = await adminApi.deleteProperty(propertyId, headers);

      if (!response.success) {
        throw new Error(response.error || 'Failed to delete property');
      }

      // Reload data after successful deletion
      await loadData();

    } catch (error) {
      console.error('Error deleting property:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete property');
    }
  };

  // Show loading state while authentication or permissions are being determined
  if (authLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading properties management...</p>
        </div>
      </div>
    );
  }

  // Check if user can access this page
  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-6">Please log in to access properties management.</p>
        <button
          onClick={() => router.push('/login')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Check if user has permission to view properties
  if (!canViewProperties.granted) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-6">You do not have permission to view properties.</p>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Properties Management</h1>
            <p className="text-gray-600 mt-1">
              Manage your properties
              {currentAccount && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {currentAccount.name}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
            >
              ← Back to Dashboard
            </Link>
            {canCreateProperties.granted && (
              <button
                onClick={handleCreateProperty}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Property
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Properties Management Component with Role-Based Features */}
      <PropertiesManagement
        // Data props
        properties={properties}
        propertyTypes={propertyTypes}
        users={users}
        loading={loading}
        error={error}

        // Permission props - mapped to component props
        canCreate={canCreateProperties.granted}
        canEdit={canEditProperties.granted}
        canDelete={canDeleteProperties.granted}
        canManage={canManageProperties.granted}
        isAdmin={isAdmin}

        // Context props
        accountContext={currentAccount}

        // Event handlers
        onViewProperty={handleViewProperty}
        onEditProperty={handleEditProperty}
        onDeleteProperty={handleDeleteProperty}
        onRefresh={loadData}

        // UI customization
        className=""
      />
    </div>
  );
}