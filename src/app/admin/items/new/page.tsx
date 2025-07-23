'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ItemForm from '@/components/ItemForm';
import { adminApi } from '@/lib/api';
import { CreateItemRequest } from '@/types';

export default function NewItemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSave = async (itemData: CreateItemRequest) => {
    try {
      setLoading(true);
      setError('');
      
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

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Item</h1>
        <p className="text-gray-600">
          Add a new item with instructions and resource links to the FAQBNB system.
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
          onSave={handleSave}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </div>
  );
} 