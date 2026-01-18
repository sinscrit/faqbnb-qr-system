'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import PropertyForm from '@/components/PropertyForm';
import { 
  Property, 
  PropertyType, 
  User, 
  CreatePropertyRequest,
  UpdatePropertyRequest, 
  PropertyResponse, 
  PropertyTypesResponse, 
  UsersListResponse 
} from '@/types';

const EditPropertyPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();

  const propertyId = params.propertyId as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Load property and supporting data
  useEffect(() => {
    if (propertyId) {
      loadData();
    }
  }, [propertyId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load the specific property
      const propertyResponse = await fetch(`/api/admin/properties/${propertyId}`, {
        credentials: 'include'
      });

      if (!propertyResponse.ok) {
        if (propertyResponse.status === 404) {
          throw new Error('Property not found');
        }
        throw new Error('Failed to load property');
      }

      const propertyData: PropertyResponse = await propertyResponse.json();

      if (!propertyData.success || !propertyData.data) {
        throw new Error(propertyData.error || 'Property not found');
      }

      setProperty(propertyData.data);

      // Load property types
      const typesResponse = await fetch('/api/admin/property-types', {
        credentials: 'include'
      });

      if (!typesResponse.ok) {
        throw new Error('Failed to load property types');
      }

      const typesData: PropertyTypesResponse = await typesResponse.json();

      if (!typesData.success) {
        throw new Error(typesData.error || 'Failed to load property types');
      }

      setPropertyTypes(typesData.data || []);

      // Check if current user is admin and load users list
      const propertiesResponse = await fetch('/api/admin/properties', {
        credentials: 'include'
      });

      if (propertiesResponse.ok) {
        const propertiesListData = await propertiesResponse.json();
        const adminStatus = propertiesListData.isAdmin || false;
        setIsAdmin(adminStatus);

        // Load users for admin
        if (adminStatus) {
          const usersResponse = await fetch('/api/admin/users', {
            credentials: 'include'
          });

          if (usersResponse.ok) {
            const usersData: UsersListResponse = await usersResponse.json();
            if (usersData.success && usersData.data) {
              setUsers(usersData.data);
            }
          }
        }
      }

    } catch (error) {
      console.error('Error loading property data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load property');
    } finally {
      setLoading(false);
    }
  };

  // Handle property update
  const handleSave = async (propertyData: CreatePropertyRequest | UpdatePropertyRequest) => {
    try {
      const response = await fetch(`/api/admin/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(propertyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update property');
      }

      const result: PropertyResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update property');
      }

      // Redirect to properties list on success
      router.push('/admin/properties');

    } catch (error) {
      console.error('Error updating property:', error);
      throw error; // Re-throw to let PropertyForm handle the error display
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push('/admin/properties');
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
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard>
        <div className="p-6">
          {/* Breadcrumb */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <button
                  onClick={() => router.push('/admin')}
                  className="text-gray-700 hover:text-gray-900"
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
                    onClick={() => router.push('/admin/properties')}
                    className="ml-1 text-gray-700 hover:text-gray-900 md:ml-2"
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
                  <span className="ml-1 text-gray-500 md:ml-2">Edit Property</span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-red-800">Error Loading Property</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <div className="mt-4 flex space-x-3">
              <button
                onClick={loadData}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
              >
                Try Again
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Back to Properties
              </button>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!property || propertyTypes.length === 0) {
    return (
      <AuthGuard>
        <div className="p-6">
          {/* Breadcrumb */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <button
                  onClick={() => router.push('/admin')}
                  className="text-gray-700 hover:text-gray-900"
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
                    onClick={() => router.push('/admin/properties')}
                    className="ml-1 text-gray-700 hover:text-gray-900 md:ml-2"
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
                  <span className="ml-1 text-gray-500 md:ml-2">Edit Property</span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-yellow-800">Data Not Available</h3>
            <p className="text-sm text-yellow-600 mt-1">
              {!property ? 'Property data could not be loaded.' : 'Property types are not available.'}
            </p>
            <button
              onClick={handleCancel}
              className="mt-3 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200"
            >
              Back to Properties
            </button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="p-6">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button
                onClick={() => router.push('/admin')}
                className="text-gray-700 hover:text-gray-900"
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
                  onClick={() => router.push('/admin/properties')}
                  className="ml-1 text-gray-700 hover:text-gray-900 md:ml-2"
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
                <span className="ml-1 text-gray-500 md:ml-2">Edit Property</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Property</h1>
          <p className="text-sm text-gray-600 mt-1">
            Modify the details of "{property.nickname}"
          </p>
        </div>

        {/* Property Form */}
        <PropertyForm
          property={property}
          propertyTypes={propertyTypes}
          users={isAdmin ? users : undefined}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </AuthGuard>
  );
};

export default EditPropertyPage; 