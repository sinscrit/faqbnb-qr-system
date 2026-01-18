'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import { Property, Item } from '@/types';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Building, Package, Calendar, User, Printer } from 'lucide-react';
import Link from 'next/link';

const UserPropertyDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();

  // Extract and validate propertyId
  const rawPropertyId = params.propertyId;
  if (!rawPropertyId || typeof rawPropertyId !== 'string') {
    return (
      <AuthGuard requireAdmin={false}>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Invalid Property ID</h3>
                <p className="mt-1 text-sm text-gray-500">No property ID provided in the URL.</p>
                <div className="mt-6">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const propertyId = rawPropertyId as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // QR Print State
  const [isQRPrintLoading, setIsQRPrintLoading] = useState(false);

  useEffect(() => {
    if (user && propertyId) {
      loadProperty();
      loadPropertyItems();
    }
  }, [user, propertyId]);

  const loadProperty = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading property details for:', propertyId);
      
      // Use admin API which we know works with our authentication
      const response = await fetch(`/api/admin/properties`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Find the specific property from the list
          const foundProperty = data.data.find((p: Property) => p.id === propertyId);
          if (foundProperty) {
            setProperty(foundProperty);
            console.log('✅ Property loaded successfully:', foundProperty.nickname);
          } else {
            setError('Property not found in your properties list');
          }
        } else {
          setError(data.error || 'Failed to load properties');
        }
      } else if (response.status === 403) {
        setError('You do not have access to view properties');
      } else if (response.status === 404) {
        setError('Properties API not found');
      } else {
        setError('Failed to load property');
      }
    } catch (err) {
      setError('Error loading property');
      console.error('Error loading property:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPropertyItems = async () => {
    try {
      setItemsLoading(true);
      console.log('🔍 Loading items for property:', propertyId);
      
      // Use admin items API with property filter
      const response = await fetch(`/api/admin/items?property=${propertyId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setItems(data.data || []);
          console.log('✅ Items loaded successfully:', data.data?.length || 0, 'items');
        } else {
          console.warn('Failed to load items:', data.error);
        }
      } else {
        console.warn('Items API failed with status:', response.status);
      }
    } catch (err) {
      console.error('Error loading items:', err);
    } finally {
      setItemsLoading(false);
    }
  };

  // QR Print Handler
  const handleOpenQRPrint = () => {
    setIsQRPrintLoading(true);
    console.log('[QR-AUTH-DEBUG] Print QR Codes clicked, pre-fetching items...');
    
    const preAuthAndOpenQRPrint = async () => {
      try {
        console.log('[QR-AUTH-DEBUG] Fetching items for property:', propertyId);
        const fetchStart = Date.now();
        
        // Pre-fetch items in main window where auth is already working
        const response = await fetch(`/api/admin/items?property=${propertyId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('[QR-AUTH-DEBUG] Items API response:', {
          status: response.status,
          duration: Date.now() - fetchStart
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch items: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('[QR-AUTH-DEBUG] Items data received:', {
          success: data.success,
          itemCount: data.data?.length || 0,
          totalDuration: Date.now() - fetchStart
        });
        
        if (!data.success || !data.data) {
          throw new Error('No items data received');
        }
        
        // Encode items data for URL hash (limit size to avoid URL length issues)
        const itemsData = {
          propertyId,
          items: data.data,
          authBypass: true,
          timestamp: Date.now()
        };
        
        const encodedData = btoa(JSON.stringify(itemsData));
        console.log('[QR-AUTH-DEBUG] Data encoded for URL:', {
          originalSize: JSON.stringify(itemsData).length,
          encodedSize: encodedData.length
        });
        
        // Navigate to QR printing page with dashboard path
        const qrPrintUrl = `/dashboard/properties/${propertyId}/qr-print#${encodedData}`;
      
        console.log('[QR-AUTH-DEBUG] Navigating to QR Print page with pre-auth data');
        router.push(qrPrintUrl);
        console.log('[QR-AUTH-DEBUG] Navigation to QR Print page initiated');
      
      } catch (error) {
        console.error('[QR-AUTH-DEBUG] Error in pre-auth QR print:', error);
        setError(error instanceof Error ? error.message : 'Failed to open QR print window');
      } finally {
        setIsQRPrintLoading(false);
      }
    };
    
    // Execute the pre-auth process
    preAuthAndOpenQRPrint();
  };

  if (loading) {
    return (
      <AuthGuard requireAdmin={false}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading property...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard requireAdmin={false}>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
                <p className="mt-1 text-sm text-gray-500">{error}</p>
                <div className="mt-6 space-x-3">
                  <button
                    onClick={loadProperty}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAdmin={false}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center">
                <Link
                  href="/dashboard"
                  className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex items-center">
                  <Building className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">{property?.nickname || property?.name}</h1>
                    <p className="text-sm text-gray-500">Property Details</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleOpenQRPrint}
                disabled={isQRPrintLoading || items.length === 0}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer className="w-4 h-4 mr-2" />
                {isQRPrintLoading ? 'Loading...' : 'Print QR Codes'}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Property Information */}
            <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Property Information</h2>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{property?.nickname || property?.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="mt-1 text-sm text-gray-900">{property?.address || 'No address provided'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Property Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {property?.property_types?.display_name || property?.property_types?.name || 'Unknown type'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Property ID</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-mono text-xs">{property?.id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {property?.created_at ? formatDate(property.created_at) : 'Unknown'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="mt-1 text-sm text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {property?.updated_at ? formatDate(property.updated_at) : 'Never'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Items Section */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Package className="h-6 w-6 text-blue-600 mr-2" />
                    <h2 className="text-lg font-medium text-gray-900">Items in this Property</h2>
                  </div>
                  <span className="text-sm text-gray-500">
                    {items.length} item{items.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {itemsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading items...</p>
                  </div>
                ) : items.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No items</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This property doesn't have any items yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                      <Link
                        key={item.id}
                        href={`/dashboard/items/${item.publicId || item.public_id}/edit`}
                        className="bg-gray-50 rounded-lg p-4 border hover:border-blue-300 hover:shadow-md transition-all cursor-pointer block"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-900">{item.name}</h3>
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                            {item.publicId || item.public_id}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        )}
                        <div className="text-xs text-gray-500">
                          <p>Added: {item.createdAt ? formatDate(item.createdAt) : formatDate(item.created_at)}</p>
                          {(item.updated_at || item.updatedAt) && (item.updated_at !== item.created_at || item.updatedAt !== item.createdAt) && (
                            <p>Updated: {item.updatedAt ? formatDate(item.updatedAt) : formatDate(item.updated_at)}</p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
};

export default UserPropertyDetailPage;