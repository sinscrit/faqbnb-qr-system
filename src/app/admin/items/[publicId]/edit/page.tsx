'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ItemForm from '@/components/ItemForm';
import { adminApi } from '@/lib/api';
import { UpdateItemRequest, CreateItemRequest, Property } from '@/types';

interface EditItemPageProps {
  params: Promise<{ publicId: string }>;
}

export default function EditItemPage({ params }: EditItemPageProps) {
  const router = useRouter();
  const [publicId, setPublicId] = useState<string>('');
  const [item, setItem] = useState<UpdateItemRequest | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');

  // Extract publicId from params
  useEffect(() => {
    const getPublicId = async () => {
      const resolvedParams = await params;
      setPublicId(resolvedParams.publicId);
    };
    getPublicId();
  }, [params]);

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

  // Load item data when publicId is available
  useEffect(() => {
    if (!publicId) return;

    const loadItem = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('Loading item for editing:', publicId);
        
        const response = await adminApi.getItem(publicId);
        
        if (response.success && response.data) {
          // For now, we'll need to get property info separately since the getItem API doesn't include it
          // We'll use the admin items list API to find this specific item and get its property info
          const itemsResponse = await adminApi.listItems();
          let propertyId = '';
          
          if (itemsResponse.success && itemsResponse.data && response.data) {
            const matchingItem = itemsResponse.data.find(item => item.publicId === response.data!.publicId);
            if (matchingItem) {
              propertyId = matchingItem.propertyId || '';
            }
          }
          
          // Transform ItemResponse to UpdateItemRequest format
          const itemData: UpdateItemRequest = {
            id: response.data.id,
            publicId: response.data.publicId,
            name: response.data.name,
            description: response.data.description,
            propertyId: propertyId, // Get from items list API
            qrCodeUrl: response.data.qrCodeUrl,
            links: response.data.links.map(link => ({
              id: link.id,
              title: link.title,
              linkType: link.linkType,
              url: link.url,
              thumbnailUrl: link.thumbnailUrl,
              displayOrder: link.displayOrder,
            })),
          };
          
          setItem(itemData);
          console.log('Item loaded successfully:', itemData.name);
        } else {
          throw new Error(response.error || 'Failed to load item');
        }
      } catch (error) {
        console.error('Load item error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load item';
        setError(errorMessage);
        
        // If item not found, redirect to admin panel
        if (errorMessage.includes('not found') || errorMessage.includes('404')) {
          setTimeout(() => router.push('/admin'), 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [publicId, router]);

  const handleSave = async (itemData: UpdateItemRequest | CreateItemRequest) => {
    try {
      setSaving(true);
      setError('');
      
      // Validate that a property is selected
      if (!itemData.propertyId) {
        throw new Error('Property selection is required');
      }
      
      console.log('Updating item:', itemData);
      
      const response = await adminApi.updateItem(publicId, itemData as UpdateItemRequest);
      
      if (response.success) {
        console.log('Item updated successfully:', response.data?.publicId);
        
        // Redirect to admin panel with success message
        router.push('/admin?updated=' + encodeURIComponent(response.data?.name || 'Item'));
      } else {
        throw new Error(response.error || 'Failed to update item');
      }
    } catch (error) {
      console.error('Update item error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update item';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin');
  };

  // Show loading state
  if (loading || propertiesLoading) {
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
          <span className="text-lg font-medium text-gray-700">
            {loading ? 'Loading item...' : 'Loading properties...'}
          </span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !item) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-8 w-8 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-800">
                Error loading item
              </h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <div className="mt-4">
                <button
                  onClick={() => router.push('/admin')}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Return to Admin Panel
                </button>
              </div>
            </div>
          </div>
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
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Edit Item</span>
            </div>
          </li>
          {item && (
            <li>
              <div className="flex items-center">
                <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2" title={item.name}>
                  {item.name.length > 30 ? `${item.name.substring(0, 30)}...` : item.name}
                </span>
              </div>
            </li>
          )}
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Item</h1>
        <p className="text-gray-600">
          Update the item information, links, and QR code settings.
          {item && properties.length > 0 && (
            <span className="block mt-1">
              Item belongs to property: <strong>
                {properties.find(p => p.id === item.propertyId)?.nickname || 'Unknown Property'}
              </strong>
            </span>
          )}
        </p>
      </div>

      {/* Error Display */}
      {error && item && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
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
                Error updating item
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      {item && (
        <div className="bg-white shadow rounded-lg">
          <ItemForm
            item={item}
            properties={properties}
            onSave={handleSave}
            onCancel={handleCancel}
            loading={saving}
          />
        </div>
      )}
    </div>
  );
} 