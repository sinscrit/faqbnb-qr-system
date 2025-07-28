'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import { QRCodePrintManager } from '@/components/QRCodePrintManager';
import { 
  Property, 
  PropertyResponse,
  Item
} from '@/types';

const ViewPropertyPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();

  const propertyId = params.propertyId as string;
  
  // Early return if no propertyId
  if (!propertyId) {
    return (
      <AuthGuard>
        <div className="p-6">
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
                  onClick={() => router.push('/admin/properties')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Back to Properties
                </button>
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // QR Print Modal State
  const [showQRPrintModal, setShowQRPrintModal] = useState(false);
  const [isQRPrintLoading, setIsQRPrintLoading] = useState(false);
  const [qrPrintItems, setQRPrintItems] = useState<Item[]>([]);

  // Load property data
  useEffect(() => {
    if (propertyId) {
      loadPropertyData();
    }
  }, [propertyId]);

  const loadPropertyData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Loading property:', propertyId);
      const response = await fetch(`/api/admin/properties/${propertyId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Property not found');
        }
        throw new Error('Failed to load property');
      }

      const data: PropertyResponse = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Property not found');
      }

      console.log('Property loaded:', data.data);
      setProperty(data.data);

    } catch (error) {
      console.error('Error loading property data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load property');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/admin/properties/${propertyId}/edit`);
  };

  const handleBack = () => {
    router.push('/admin/properties');
  };

  // QR Print Modal Handlers
  const handleOpenQRPrint = async () => {
    setShowQRPrintModal(true);
    setIsQRPrintLoading(true);
    setError(null);
    
    try {
      console.log('Fetching items for property:', propertyId);
      const response = await fetch(`/api/admin/items?property=${propertyId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch items for QR printing');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to load items');
      }

      console.log('Items loaded for QR printing:', data.data);
      setQRPrintItems(data.data || []);
      
    } catch (error) {
      console.error('Error loading items for QR printing:', error);
      setError(error instanceof Error ? error.message : 'Failed to load items');
      // Keep modal open to show error state
    } finally {
      setIsQRPrintLoading(false);
    }
  };

  const handleCloseQRPrint = () => {
    setShowQRPrintModal(false);
    setIsQRPrintLoading(false);
    setQRPrintItems([]);
    setError(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="space-y-6">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error || !property) {
    return (
      <AuthGuard>
        <div className="p-6">
          {/* Breadcrumb */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <button 
                  onClick={() => router.push('/admin')}
                  className="text-gray-400 hover:text-gray-500"
                >
                  Admin
                </button>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <button 
                    onClick={handleBack}
                    className="ml-1 text-gray-400 hover:text-gray-500 md:ml-2"
                  >
                    Properties
                  </button>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1 text-gray-500 md:ml-2">Property Details</span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Property</h3>
              <p className="mt-1 text-sm text-gray-500">{error}</p>
              <div className="mt-6 flex justify-center space-x-3">
                <button
                  onClick={loadPropertyData}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Try Again
                </button>
                <button
                  onClick={handleBack}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Back to Properties
                </button>
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="p-6">
        {/* Breadcrumb */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <button 
                onClick={() => router.push('/admin')}
                className="text-gray-400 hover:text-gray-500"
              >
                Admin
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <button 
                  onClick={handleBack}
                  className="ml-1 text-gray-400 hover:text-gray-500 md:ml-2"
                >
                  Properties
                </button>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-1 text-gray-500 md:ml-2">Property Details</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{property.nickname}</h1>
            <p className="text-sm text-gray-600 mt-1">
              Property Details
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleEdit}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Property
            </button>
            <button
              onClick={handleBack}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Properties
            </button>
          </div>
        </div>

        {/* Property Details Card */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Property Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Detailed information about this property.
            </p>
          </div>
          
          <div className="px-6 py-5">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              {/* Property Nickname */}
              <div>
                <dt className="text-sm font-medium text-gray-500">Property Nickname</dt>
                <dd className="mt-1 text-sm text-gray-900">{property.nickname}</dd>
              </div>

              {/* Property Type */}
              <div>
                <dt className="text-sm font-medium text-gray-500">Property Type</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {property.property_types?.display_name || 'Unknown'}
                  </span>
                </dd>
              </div>

              {/* Property ID */}
              <div>
                <dt className="text-sm font-medium text-gray-500">Property ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{property.id}</dd>
              </div>

              {/* Owner */}
              {property.users && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Owner</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {property.users.full_name || property.users.email}
                    {property.users.full_name && (
                      <span className="text-gray-500 ml-1">({property.users.email})</span>
                    )}
                  </dd>
                </div>
              )}

              {/* Account */}
              {property.account_id && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Account ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">{property.account_id}</dd>
                </div>
              )}

              {/* Created Date */}
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(property.created_at)}</dd>
              </div>

              {/* Updated Date */}
              {property.updated_at && property.updated_at !== property.created_at && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(property.updated_at)}</dd>
                </div>
              )}

              {/* Address */}
              {property.address && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900">{property.address}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Quick Actions
            </h3>
          </div>
          
          <div className="px-6 py-5">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleEdit}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Property
              </button>
              
              <button
                onClick={() => router.push(`/admin/items?property=${propertyId}`)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                View Items
              </button>
              
              <button
                onClick={handleOpenQRPrint}
                disabled={isQRPrintLoading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                {isQRPrintLoading ? 'Loading...' : 'Print QR Codes'}
              </button>
            </div>
          </div>
        </div>
        
        {/* QR Code Print Manager Modal */}
        {showQRPrintModal && (
          <QRCodePrintManager
            propertyId={propertyId}
            items={qrPrintItems}
            isOpen={showQRPrintModal}
            onClose={handleCloseQRPrint}
            isLoadingItems={isQRPrintLoading}
          />
        )}
      </div>
    </AuthGuard>
  );
};

export default ViewPropertyPage; 