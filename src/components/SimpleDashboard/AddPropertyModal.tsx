// src/components/SimpleDashboard/AddPropertyModal.tsx
// REQ-132: AddPropertyModal Component for Dashboard 2
// Created: 2026-01-06
// Last Modified: 2026-01-06

'use client';

import { useState, useEffect, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Property } from '@/types';
import { LoadingIndicator } from './LoadingIndicator';

/**
 * Task 2.2: Country dropdown data with ISO 3166-1 alpha-2 codes
 * Common countries prioritized at the top of the list
 */
const COUNTRIES = [
  { code: '', label: 'Select country...' },
  { code: 'US', label: 'United States' },
  { code: 'CA', label: 'Canada' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'AU', label: 'Australia' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'ES', label: 'Spain' },
  { code: 'IT', label: 'Italy' },
  { code: 'JP', label: 'Japan' },
  { code: 'MX', label: 'Mexico' },
  { code: 'BR', label: 'Brazil' },
  { code: 'NL', label: 'Netherlands' },
  { code: 'BE', label: 'Belgium' },
  { code: 'CH', label: 'Switzerland' },
  { code: 'AT', label: 'Austria' },
  { code: 'SE', label: 'Sweden' },
  { code: 'NO', label: 'Norway' },
  { code: 'DK', label: 'Denmark' },
  { code: 'FI', label: 'Finland' },
  { code: 'IE', label: 'Ireland' },
  { code: 'PT', label: 'Portugal' },
  { code: 'NZ', label: 'New Zealand' },
  { code: 'SG', label: 'Singapore' },
  { code: 'HK', label: 'Hong Kong' },
] as const;

/**
 * Props for the AddPropertyModal component
 */
export interface AddPropertyModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal is closed without saving */
  onClose: () => void;
  /** Callback when property is created successfully */
  onSave: (newProperty: Property) => void;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Form data structure for adding a new property
 */
interface AddPropertyFormData {
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

/**
 * Validation errors structure
 */
interface AddPropertyValidationErrors {
  name?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  general?: string;
}

/**
 * Task 2.2: Form validation function
 */
const validateForm = (data: AddPropertyFormData): AddPropertyValidationErrors => {
  const errors: AddPropertyValidationErrors = {};

  // Property Name - required, max 100
  const trimmedName = data.name.trim();
  if (!trimmedName) {
    errors.name = 'Property name is required';
  } else if (trimmedName.length > 100) {
    errors.name = 'Property name must be 100 characters or less';
  }

  // Address Line 1 - max 200
  if (data.addressLine1.length > 200) {
    errors.addressLine1 = 'Address must be 200 characters or less';
  }

  // Address Line 2 - max 200
  if (data.addressLine2.length > 200) {
    errors.addressLine2 = 'Address must be 200 characters or less';
  }

  // City - max 100
  if (data.city.length > 100) {
    errors.city = 'City must be 100 characters or less';
  }

  // State - max 100
  if (data.state.length > 100) {
    errors.state = 'State/Province must be 100 characters or less';
  }

  // Postal Code - max 20
  if (data.postalCode.length > 20) {
    errors.postalCode = 'Postal code must be 20 characters or less';
  }

  // Country - validate is valid code or empty
  if (data.country && !COUNTRIES.find(c => c.code === data.country)) {
    errors.country = 'Please select a valid country';
  }

  return errors;
};

/**
 * AddPropertyModal component for creating a new property
 *
 * Features:
 * - Radix UI Dialog for accessible modal
 * - Form fields with validation
 * - Empty initial form state
 * - Mobile-responsive drawer layout
 * - Full keyboard accessibility
 * - Airbnb design system styling
 *
 * @param isOpen - Whether the modal is open
 * @param onClose - Callback when modal is closed
 * @param onSave - Callback when property is created
 * @param className - Optional additional CSS classes
 */
export function AddPropertyModal({
  isOpen,
  onClose,
  onSave,
  className,
}: AddPropertyModalProps) {
  // Task 2.3: Form state management with empty initial values
  const [formData, setFormData] = useState<AddPropertyFormData>({
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });
  const [errors, setErrors] = useState<AddPropertyValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Task 2.3: Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      });
      setErrors({});
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Task 2.4: Handle field change
  const handleFieldChange = useCallback((field: keyof AddPropertyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  // Task 2.5: Handle save with validation and API call
  const handleSave = async () => {
    // Run validation
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Focus first error field
      const firstErrorField = Object.keys(validationErrors)[0];
      document.getElementById(firstErrorField)?.focus();
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Build request body
      const requestBody = {
        nickname: formData.name.trim(),
        address: JSON.stringify({
          line1: formData.addressLine1,
          line2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        }),
      };

      const response = await fetch('/api/user/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create property');
      }

      const { data: newProperty } = await response.json();
      onSave(newProperty);
      onClose();
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to create property',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Enter key to submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isSubmitting) {
      e.preventDefault();
      handleSave();
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (isSubmitting) return; // Prevent close during submission
    onClose();
  };

  // Task 2.4: Render text field helper
  const renderTextField = (
    id: keyof AddPropertyFormData,
    label: string,
    value: string,
    options: {
      required?: boolean;
      maxLength: number;
      placeholder?: string;
    }
  ) => (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-[#222222]">
        {label}
        {options.required && <span className="text-[#FF385C] ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => handleFieldChange(id, e.target.value)}
        onKeyDown={handleKeyDown}
        maxLength={options.maxLength}
        placeholder={options.placeholder}
        disabled={isSubmitting}
        autoFocus={id === 'name'}
        className={cn(
          'w-full px-3 py-2.5 text-[#222222] rounded-lg border transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-[#222222] focus:border-[#222222]',
          'disabled:bg-gray-50 disabled:text-gray-500',
          errors[id]
            ? 'border-[#FF385C] focus:ring-[#FF385C]'
            : 'border-[#DDDDDD] hover:border-[#222222]'
        )}
      />
      <div className="flex justify-between text-xs">
        {errors[id] ? (
          <span className="text-[#FF385C]" role="alert">{errors[id]}</span>
        ) : (
          <span />
        )}
        <span className="text-[#717171]">
          {value.length}/{options.maxLength}
        </span>
      </div>
    </div>
  );

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          onClose();
        }
      }}
    >
      <Dialog.Portal>
        {/* Task 2.7: Overlay with click dismiss (blocked during submission) */}
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          onClick={(e) => {
            if (isSubmitting) e.preventDefault();
          }}
        />

        {/* Task 2.7: Modal content with responsive layout */}
        <Dialog.Content
          aria-labelledby="add-property-modal-title"
          aria-describedby="add-property-modal-description"
          className={cn(
            // Base styles
            'fixed z-50 bg-white shadow-lg outline-none',
            'overflow-hidden flex flex-col',

            // Desktop: centered modal
            'md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2',
            'md:max-w-[640px] md:w-[calc(100%-2rem)] md:max-h-[90vh]',
            'md:rounded-xl',

            // Mobile: slide-up drawer
            'max-md:inset-x-0 max-md:bottom-0',
            'max-md:max-h-[90vh] max-md:rounded-t-xl',

            // Animation
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'md:data-[state=closed]:zoom-out-95 md:data-[state=open]:zoom-in-95',
            'max-md:data-[state=closed]:slide-out-to-bottom max-md:data-[state=open]:slide-in-from-bottom',

            className
          )}
        >
          {/* Mobile drag handle indicator */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-gray-300 md:hidden" />

          {/* Task 2.6: Header with title and close button */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#DDDDDD]">
            <div>
              <Dialog.Title
                id="add-property-modal-title"
                className="text-xl font-semibold text-[#222222]"
              >
                Add New Property
              </Dialog.Title>
              <Dialog.Description id="add-property-modal-description" className="sr-only">
                Create a new property by entering the name and address information.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className={cn(
                  'p-2 rounded-full text-[#717171] transition-colors',
                  'hover:text-[#222222] hover:bg-gray-100',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222]',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Scrollable form body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* Screen reader announcement for form state */}
            <div aria-live="polite" className="sr-only">
              {isSubmitting && 'Creating property...'}
              {errors.general && `Error: ${errors.general}`}
            </div>

            {/* General error display */}
            {errors.general && (
              <div
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-[#FF385C]"
                role="alert"
              >
                {errors.general}
              </div>
            )}

            {/* Form fields */}
            <div className="space-y-4">
              {/* Property Name - required */}
              {renderTextField('name', 'Property Name', formData.name, {
                required: true,
                maxLength: 100,
                placeholder: 'e.g., Beach House',
              })}

              {/* Address Line 1 */}
              {renderTextField('addressLine1', 'Address Line 1', formData.addressLine1, {
                maxLength: 200,
                placeholder: 'Street address',
              })}

              {/* Address Line 2 */}
              {renderTextField('addressLine2', 'Address Line 2', formData.addressLine2, {
                maxLength: 200,
                placeholder: 'Apt, suite, unit, etc. (optional)',
              })}

              {/* City and State - side by side on desktop, stacked on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {renderTextField('city', 'City', formData.city, {
                  maxLength: 100,
                  placeholder: 'City',
                })}
                {renderTextField('state', 'State/Province', formData.state, {
                  maxLength: 100,
                  placeholder: 'State or Province',
                })}
              </div>

              {/* Postal Code and Country - side by side on desktop, stacked on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {renderTextField('postalCode', 'Postal Code', formData.postalCode, {
                  maxLength: 20,
                  placeholder: 'ZIP / Postal code',
                })}

                {/* Country dropdown */}
                <div className="space-y-1.5">
                  <label htmlFor="country" className="block text-sm font-medium text-[#222222]">
                    Country
                  </label>
                  <select
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleFieldChange('country', e.target.value)}
                    disabled={isSubmitting}
                    className={cn(
                      'w-full px-3 py-2.5 text-[#222222] rounded-lg border transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-[#222222] focus:border-[#222222]',
                      'disabled:bg-gray-50 disabled:text-gray-500',
                      errors.country
                        ? 'border-[#FF385C] focus:ring-[#FF385C]'
                        : 'border-[#DDDDDD] hover:border-[#222222]'
                    )}
                  >
                    {COUNTRIES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <span className="text-xs text-[#FF385C]" role="alert">
                      {errors.country}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Task 2.6: Footer with action buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 p-4 sm:p-6 border-t border-[#DDDDDD]">
            {/* Cancel Button */}
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className={cn(
                'flex-1 sm:flex-none min-h-[48px] px-6 py-3 rounded-lg font-medium text-base',
                'bg-white border border-[#222222] text-[#222222]',
                'transition-all duration-200 ease-out',
                'hover:bg-[#F7F7F7] active:scale-[0.98]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              Cancel
            </button>

            {/* Create Property Button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              className={cn(
                'flex-1 sm:flex-none min-h-[48px] px-6 py-3 rounded-lg font-medium text-base',
                'bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-white',
                'transition-all duration-200 ease-out',
                'hover:scale-[1.02] hover:brightness-95 active:scale-[0.98]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                'flex items-center justify-center gap-2'
              )}
            >
              {isSubmitting ? (
                <>
                  <LoadingIndicator size="sm" color="white" label="Creating property" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Property</span>
              )}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
