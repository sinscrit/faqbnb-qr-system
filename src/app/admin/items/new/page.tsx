'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ItemForm from '@/components/ItemForm';
import { adminApi } from '@/lib/api';
import { CreateItemRequest, Property } from '@/types';

export default function NewItemPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');

  // Load properties on component mount
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setPropertiesLoading(true);
        const response = await adminApi.listProperties();
        if (response.success && response.data) {
          setProperties(response.data);
        } else {
          console.warn('Failed to load properties:', response.error);
        }
      } catch (err) {
        console.warn('Failed to load properties:', err);
      } finally {
        setPropertiesLoading(false);
      }
    };

    loadProperties();
  }, []);

  // Handle property ID from URL parameters
  useEffect(() => {
    const propertyIdFromUrl = searchParams.get('propertyId');
    if (propertyIdFromUrl) {
      setSelectedPropertyId(propertyIdFromUrl);
    }
  }, [searchParams]);

  const handleSave = async (itemData: CreateItemRequest) => {
    try {
      setLoading(true);
      setError('');
      
      // Validate that a property is selected
      if (!itemData.propertyId) {
        throw new Error('Property selection is required');
      }
      
      console.log('Creating new item:', itemData);
      
      const response = await adminApi.createItem(itemData);
      
      if (response.success) {
        console.log('Item created successfully:', response.data?.publicId);
        
        // Redirect to admin panel with success message
        router.push('/admin?created=' + encodeURIComponent(response.data?.name || 'Item'));
      } else {
        throw new Error(response.error || 'Failed to create item');
      }
    } catch (error) {
      console.error('Create item error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create item';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin');
  };

  // Show loading state while properties are loading
  if (propertiesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <svg
            className="animate-spin h-8 w-8 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-lg font-medium text-gray-700">Loading properties...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <nav className="flex mb-4" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <button
              onClick={() => router.push('/admin')}
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              Admin
            </button>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Create Item</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Item</h1>
        <p className="text-gray-600">
          Add a new item with instructions and resource links to the FAQBNB system.
          {selectedPropertyId && properties.length > 0 && (
            <span className="block mt-1">
              Creating item for property: <strong>
                {properties.find(p => p.id === selectedPropertyId)?.nickname || 'Selected Property'}
              </strong>
            </span>
          )}
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error creating item
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white shadow rounded-lg">
        <ItemForm
          properties={properties}
          selectedPropertyId={selectedPropertyId}
          onSave={handleSave}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </div>
  );
} 