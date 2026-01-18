'use client';

import React, { useState, useEffect } from 'react';
import { PropertyFormProps, PropertyType, User, PropertyFormData, PropertyValidationErrors } from '@/types';

const PropertyForm: React.FC<PropertyFormProps> = ({
  property,
  propertyTypes,
  users,
  onSave,
  onCancel
}) => {
  // Form state
  const [formData, setFormData] = useState<PropertyFormData>({
    nickname: property?.nickname || '',
    address: property?.address || '',
    propertyTypeId: property?.property_type_id || ''
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<PropertyValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Admin-specific state for user selection
  const [selectedUserId, setSelectedUserId] = useState<string>(property?.user_id || '');

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: PropertyValidationErrors = {};

    // Nickname validation
    if (!formData.nickname.trim()) {
      newErrors.nickname = 'Property nickname is required';
    } else if (formData.nickname.trim().length > 100) {
      newErrors.nickname = 'Property nickname must be 100 characters or less';
    }

    // Property type validation
    if (!formData.propertyTypeId) {
      newErrors.propertyTypeId = 'Property type is required';
    }

    // Address validation (optional but if provided, must be reasonable length)
    if (formData.address && formData.address.length > 500) {
      newErrors.address = 'Address must be 500 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field: keyof PropertyFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Handle user selection (for admins)
  const handleUserSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUserId(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const propertyData = {
        nickname: formData.nickname.trim(),
        address: formData.address.trim() || undefined,
        propertyTypeId: formData.propertyTypeId,
        ...(users && selectedUserId && { userId: selectedUserId }) // Include userId for admin creation
      };

      if (property) {
        // Update existing property
        await onSave({ id: property.id, ...propertyData });
      } else {
        // Create new property
        await onSave(propertyData);
      }
    } catch (error) {
      console.error('Error saving property:', error);
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to save property. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (isSubmitting) {
      return; // Prevent cancel during submission
    }
    onCancel();
  };

  // Loading state during initial data fetch
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
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
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {property ? 'Edit Property' : 'Create New Property'}
      </h2>

      {/* General error message */}
      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User selection for admins */}
        {users && users.length > 0 && (
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
              Property Owner <span className="text-red-500">*</span>
            </label>
            <select
              id="userId"
              value={selectedUserId}
              onChange={handleUserSelection}
              disabled={isSubmitting || !!property} // Can't change owner of existing property
              className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500`}
            >
              <option value="">Select property owner...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name || user.email} ({user.email})
                </option>
              ))}
            </select>
            {property && (
              <p className="mt-1 text-xs text-gray-500">
                Property owner cannot be changed after creation
              </p>
            )}
          </div>
        )}

        {/* Property nickname */}
        <div>
          <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
            Property Nickname <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="nickname"
            value={formData.nickname}
            onChange={handleInputChange('nickname')}
            disabled={isSubmitting}
            placeholder="e.g., Main Office, Home, Vacation House"
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${
              errors.nickname ? 'border-red-300' : 'border-gray-300'
            }`}
            maxLength={100}
          />
          {errors.nickname && (
            <p className="mt-1 text-sm text-red-600">{errors.nickname}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            A friendly name to identify this property ({formData.nickname.length}/100)
          </p>
        </div>

        {/* Property type */}
        <div>
          <label htmlFor="propertyTypeId" className="block text-sm font-medium text-gray-700 mb-2">
            Property Type <span className="text-red-500">*</span>
          </label>
          <select
            id="propertyTypeId"
            value={formData.propertyTypeId}
            onChange={handleInputChange('propertyTypeId')}
            disabled={isSubmitting}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${
              errors.propertyTypeId ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select property type...</option>
            {propertyTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.display_name}
              </option>
            ))}
          </select>
          {errors.propertyTypeId && (
            <p className="mt-1 text-sm text-red-600">{errors.propertyTypeId}</p>
          )}
        </div>

        {/* Property address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            Address <span className="text-gray-400">(Optional)</span>
          </label>
          <textarea
            id="address"
            rows={3}
            value={formData.address}
            onChange={handleInputChange('address')}
            disabled={isSubmitting}
            placeholder="e.g., 123 Main St, Anytown, State 12345"
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 resize-none ${
              errors.address ? 'border-red-300' : 'border-gray-300'
            }`}
            maxLength={500}
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Physical address or location description ({formData.address.length}/500)
          </p>
        </div>

        {/* Form actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {property ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              property ? 'Update Property' : 'Create Property'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm; 