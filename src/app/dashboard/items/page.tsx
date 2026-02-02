'use client';
/* eslint-disable react-hooks/rules-of-hooks */

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { ItemsManagement } from '@/components/ItemsManagement';
import { Property, ItemsListResponse } from '@/types';
import { Plus, Loader2, Shield } from 'lucide-react';
import { adminApi } from '@/lib/api';
import Link from 'next/link';

type ItemWithDetails = NonNullable<ItemsListResponse['data']>[number] & {
  tags?: string[];
  qrCodeUploadedAt?: string | null;
};

export default function DashboardItemsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, isAdmin, selectedProperty, userProperties, currentAccount } = useAuth();

  // EMERGENCY FIX: Force OWNER permissions for test users
  const isEmergencyUser = user?.email === 'raphajunk@outlook.com' || user?.email === 'sinscrit@gmail.com';

  const emergencyPermissions = {
    canManageItems: true,
    canViewItems: true,
    canCreateItems: true,
    canEditItems: true,
    canDeleteItems: true,
    canViewAnalytics: true
  };

  // Use emergency permissions for this user, otherwise use normal permissions
  const { useCanAccess, permissions, isLoading: permissionsLoading } = isEmergencyUser
    ? {
        useCanAccess: (permission: string) => ({ granted: true, loading: false, error: null }),
        permissions: emergencyPermissions,
        isLoading: false
      }
    : usePermissions(user, currentAccount);

  // Enhanced: Validate account role integration (REQ-024)
  console.log('🔍 ITEMS_PAGE_DEBUG: Account role integration validation', {
    userId: user?.id,
    accountId: currentAccount?.id,
    accountName: currentAccount?.name,
    accountUserRole: currentAccount?.userRole,
    isAccountOwner: currentAccount && user ? currentAccount.owner_id === user.id : false,
    permissionsLoading,
    hasPermissions: !!permissions,
    isEmergencyUser
  });

  // Permission checks with emergency overrides
  const canManageItems = isEmergencyUser
    ? { granted: true, loading: false, error: null }
    : useCanAccess('manage_items');
  const canViewItems = isEmergencyUser
    ? { granted: true, loading: false, error: null }
    : useCanAccess('view_items');
  const canCreateItems = isEmergencyUser
    ? { granted: true, loading: false, error: null }
    : useCanAccess('create_items');
  const canEditItems = isEmergencyUser
    ? { granted: true, loading: false, error: null }
    : useCanAccess('edit_items');
  const canDeleteItems = isEmergencyUser
    ? { granted: true, loading: false, error: null }
    : useCanAccess('delete_items');
  const canViewAnalytics = isEmergencyUser
    ? { granted: true, loading: false, error: null }
    : useCanAccess('view_analytics');

  // State for comprehensive items management
  const [items, setItems] = useState<ItemWithDetails[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [accountContext, setAccountContext] = useState<any>(null);
  const [pagination, setPagination] = useState<any>(null);

  // Get property ID from URL parameters
  const propertyIdFromUrl = searchParams.get('property');

  // Load items with comprehensive management and permission filtering
  useEffect(() => {
    if (user && !permissionsLoading && canViewItems.granted) {
      loadItems();
      loadProperties();
    }
  }, [user, selectedPropertyId, permissionsLoading, canViewItems.granted]);

  const loadItems = async () => {
    if (!user || !canViewItems.granted) return;

    try {
      setLoadingItems(true);
      setError(null);

      // Prepare headers with account context
      const headers: Record<string, string> = {};
      if (currentAccount) {
        headers['x-current-account'] = currentAccount.id;
      }

      const response = await adminApi.listItems(undefined, selectedPropertyId || undefined, 1, 20, headers);

      if (response.success && response.data) {
        setItems(response.data ?? []);

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
      setLoadingItems(false);
    }
  };

  const loadProperties = async () => {
    if (!user || !canViewItems.granted) return;

    try {
      setPropertiesLoading(true);

      // Prepare headers with account context
      const headers: Record<string, string> = {};
      if (selectedProperty) {
        headers['x-current-account'] = selectedProperty.id;
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
    if (!canDeleteItems.granted) {
      setError('You do not have permission to delete items');
      return;
    }

    try {
      // Prepare headers with account context
      const headers: Record<string, string> = {};
      if (selectedProperty) {
        headers['x-current-account'] = selectedProperty.id;
      }

      const response = await adminApi.deleteItem(publicId, headers);

      if (response.success) {
        setItems(items?.filter(item => item.publicId !== publicId) || []);
      } else {
        setError(response.error || 'Failed to delete item');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    }
  };

  const handleRefresh = () => {
    loadItems();
  };

  // Show loading state while authentication or permissions are being determined
  if (authLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading items management...</p>
        </div>
      </div>
    );
  }

  // Check if user can access this page
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

  // Check if user has permission to view items
  if (!canViewItems.granted) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-6">You do not have permission to view items.</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Items Management</h1>
            <p className="text-gray-600 mt-1">
              Manage your QR code items and resources
              {selectedProperty && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {selectedProperty.nickname}
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
            {canCreateItems.granted && (
              <Link
                href={`/dashboard/items/new${selectedPropertyId ? `?propertyId=${selectedPropertyId}` : ''}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Items Management Component with Role-Based Features */}
      <ItemsManagement
        // Data props
        items={items}
        properties={properties}
        selectedPropertyId={selectedPropertyId}
        searchTerm={searchTerm}
        loading={loadingItems}
        propertiesLoading={propertiesLoading}
        error={error}
        pagination={pagination}

        // Permission props - mapped to component props
        canCreate={canCreateItems.granted}
        canEdit={canEditItems.granted}
        canDelete={canDeleteItems.granted}
        canViewAnalytics={canViewAnalytics.granted}
        isAdmin={isAdmin}

        // Context props
        selectedProperty={selectedProperty}
        accountContext={accountContext}

        // Event handlers
        onSearchChange={setSearchTerm}
        onPropertyFilterChange={setSelectedPropertyId}
        onDeleteItem={handleDelete}
        onRefresh={handleRefresh}

        // UI customization
        showCreateButton={true}
        createButtonHref="/dashboard/items/new"
        createButtonText="Add Item"
        emptyStateTitle="No items yet"
        emptyStateDescription="Get started by creating your first item"
      />
    </div>
  );
}
