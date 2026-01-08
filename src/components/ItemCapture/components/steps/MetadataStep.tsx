'use client';

/**
 * MetadataStep Component
 *
 * First step in the ItemCapture wizard. Collects item metadata including:
 * - Title (required)
 * - Room (optional, with presets + custom input)
 * - Tags (optional, pill-based multi-select)
 * - Item Type (optional dropdown)
 *
 * @module ItemCapture/components/steps/MetadataStep
 * @lastModified 2026-01-08 (Label updates: Location->Room, Appliance Type->Item Type)
 */

import React, { useState, useCallback, useRef, useEffect, useId } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, X } from 'lucide-react';
import type { ItemMetadata, ApplianceType } from '../../ItemCapture.types';
import {
  PRESET_LOCATIONS,
  APPLIANCE_TYPES,
  SUGGESTED_TAGS,
  METADATA_CONSTRAINTS,
} from '../../utils/constants';

// =============================================================================
// Types
// =============================================================================

export interface MetadataStepProps {
  /** Current metadata values */
  metadata: ItemMetadata;
  /** Validation errors keyed by field name */
  errors: Record<string, string>;
  /** Callback to update metadata fields */
  onUpdate: (updates: Partial<ItemMetadata>) => void;
  /** Callback to validate form - returns true if valid */
  onValidate: () => boolean;
}

// =============================================================================
// Validation
// =============================================================================

/**
 * Validates metadata fields and returns error messages.
 * This is exported for testing and use in parent components.
 */
export function validateMetadata(metadata: ItemMetadata): Record<string, string> {
  const errors: Record<string, string> = {};

  // Title validation (required)
  if (!metadata.title?.trim()) {
    errors.title = 'Title is required';
  } else if (metadata.title.length > METADATA_CONSTRAINTS.title.maxLength) {
    errors.title = `Title must be ${METADATA_CONSTRAINTS.title.maxLength} characters or less`;
  }

  // Location validation (optional, but check length if provided)
  if (metadata.location && metadata.location.length > METADATA_CONSTRAINTS.location.maxLength) {
    errors.location = `Location must be ${METADATA_CONSTRAINTS.location.maxLength} characters or less`;
  }

  // Tags validation
  if (metadata.tags) {
    if (metadata.tags.length > METADATA_CONSTRAINTS.maxTags) {
      errors.tags = `Maximum ${METADATA_CONSTRAINTS.maxTags} tags allowed`;
    }
    const invalidTag = metadata.tags.find(
      t => t.length > METADATA_CONSTRAINTS.tag.maxLength
    );
    if (invalidTag) {
      errors.tags = `Each tag must be ${METADATA_CONSTRAINTS.tag.maxLength} characters or less`;
    }
  }

  return errors;
}

// =============================================================================
// Component
// =============================================================================

export function MetadataStep({
  metadata,
  errors,
  onUpdate,
  onValidate,
}: MetadataStepProps) {
  // Generate unique IDs for accessibility
  const uniqueId = useId();
  const titleId = `title-${uniqueId}`;
  const titleErrorId = `title-error-${uniqueId}`;
  const locationId = `location-${uniqueId}`;
  const locationErrorId = `location-error-${uniqueId}`;
  const tagsId = `tags-${uniqueId}`;
  const tagsErrorId = `tags-error-${uniqueId}`;
  const applianceId = `appliance-${uniqueId}`;

  // Location dropdown state
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [locationSearchTerm, setLocationSearchTerm] = useState(metadata.location || '');
  const [locationFocusedIndex, setLocationFocusedIndex] = useState(-1);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);

  // Tag input state
  const [tagInputValue, setTagInputValue] = useState('');
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Sync locationSearchTerm with metadata.location when it changes externally
  useEffect(() => {
    setLocationSearchTerm(metadata.location || '');
  }, [metadata.location]);

  // Filter preset locations based on search term
  const filteredLocations = PRESET_LOCATIONS.filter(loc =>
    loc.toLowerCase().includes(locationSearchTerm.toLowerCase())
  );

  // Check if search term matches a preset exactly
  const exactMatch = PRESET_LOCATIONS.find(
    loc => loc.toLowerCase() === locationSearchTerm.toLowerCase()
  );

  // ==========================================================================
  // Event Handlers
  // ==========================================================================

  // Title change handler
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ title: e.target.value });
    },
    [onUpdate]
  );

  // Title blur handler - validate on blur
  const handleTitleBlur = useCallback(() => {
    onValidate();
  }, [onValidate]);

  // Location input change handler
  const handleLocationInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocationSearchTerm(value);
      setIsLocationOpen(true);
      setLocationFocusedIndex(-1);
    },
    []
  );

  // Location selection handler
  const handleLocationSelect = useCallback(
    (location: string) => {
      setLocationSearchTerm(location);
      onUpdate({ location });
      setIsLocationOpen(false);
      setLocationFocusedIndex(-1);
    },
    [onUpdate]
  );

  // Location custom text confirmation (on blur or Enter when no match)
  const handleLocationConfirm = useCallback(() => {
    const trimmed = locationSearchTerm.trim();
    if (trimmed !== metadata.location) {
      onUpdate({ location: trimmed || undefined });
    }
    setIsLocationOpen(false);
    setLocationFocusedIndex(-1);
  }, [locationSearchTerm, metadata.location, onUpdate]);

  // Location keyboard navigation
  const handleLocationKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const totalOptions = filteredLocations.length + (locationSearchTerm && !exactMatch ? 1 : 0);

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (!isLocationOpen) {
            setIsLocationOpen(true);
            setLocationFocusedIndex(0);
          } else {
            setLocationFocusedIndex(prev => (prev + 1) % totalOptions);
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (!isLocationOpen) {
            setIsLocationOpen(true);
            setLocationFocusedIndex(totalOptions - 1);
          } else {
            setLocationFocusedIndex(prev => (prev - 1 + totalOptions) % totalOptions);
          }
          break;

        case 'Enter':
          e.preventDefault();
          if (isLocationOpen && locationFocusedIndex >= 0) {
            if (locationFocusedIndex < filteredLocations.length) {
              handleLocationSelect(filteredLocations[locationFocusedIndex]);
            } else {
              // Custom text option
              handleLocationConfirm();
            }
          } else if (!isLocationOpen) {
            setIsLocationOpen(true);
          } else {
            handleLocationConfirm();
          }
          break;

        case 'Escape':
          e.preventDefault();
          setIsLocationOpen(false);
          setLocationFocusedIndex(-1);
          break;

        case 'Tab':
          handleLocationConfirm();
          break;
      }
    },
    [
      isLocationOpen,
      locationFocusedIndex,
      filteredLocations,
      exactMatch,
      locationSearchTerm,
      handleLocationSelect,
      handleLocationConfirm,
    ]
  );

  // Close location dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target as Node)
      ) {
        handleLocationConfirm();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleLocationConfirm]);

  // Tag add handler
  const handleAddTag = useCallback(
    (tag: string) => {
      const trimmedTag = tag.trim();
      if (!trimmedTag) return;

      const currentTags = metadata.tags || [];

      // Check if tag already exists (case-insensitive)
      if (currentTags.some(t => t.toLowerCase() === trimmedTag.toLowerCase())) {
        return;
      }

      // Check max tags limit
      if (currentTags.length >= METADATA_CONSTRAINTS.maxTags) {
        return;
      }

      // Check tag length
      if (trimmedTag.length > METADATA_CONSTRAINTS.tag.maxLength) {
        return;
      }

      onUpdate({ tags: [...currentTags, trimmedTag] });
      setTagInputValue('');
    },
    [metadata.tags, onUpdate]
  );

  // Tag remove handler
  const handleRemoveTag = useCallback(
    (tagToRemove: string) => {
      const currentTags = metadata.tags || [];
      onUpdate({ tags: currentTags.filter(t => t !== tagToRemove) });
    },
    [metadata.tags, onUpdate]
  );

  // Tag input key handler
  const handleTagInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddTag(tagInputValue);
      } else if (e.key === 'Backspace' && !tagInputValue && metadata.tags?.length) {
        // Remove last tag on backspace if input is empty
        const lastTag = metadata.tags[metadata.tags.length - 1];
        handleRemoveTag(lastTag);
      }
    },
    [tagInputValue, metadata.tags, handleAddTag, handleRemoveTag]
  );

  // Appliance type change handler
  const handleApplianceChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value as ApplianceType | '';
      onUpdate({ applianceType: value || undefined });
    },
    [onUpdate]
  );

  // Filter suggestions to exclude already selected tags
  const availableSuggestions = SUGGESTED_TAGS.filter(
    tag => !(metadata.tags || []).some(t => t.toLowerCase() === tag.toLowerCase())
  );

  const tagsCount = metadata.tags?.length || 0;
  const isAtMaxTags = tagsCount >= METADATA_CONSTRAINTS.maxTags;

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Item Details</h2>
        <p className="text-sm text-gray-600 mt-1">
          Enter basic information about this item
        </p>
      </div>

      {/* Title Field (Required) */}
      <div>
        <label
          htmlFor={titleId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id={titleId}
          value={metadata.title}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          maxLength={METADATA_CONSTRAINTS.title.maxLength}
          placeholder="Enter item title..."
          aria-required="true"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? titleErrorId : undefined}
          className={cn(
            'w-full px-4 py-3 border rounded-lg transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'min-h-[48px]',
            errors.title
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
          )}
        />
        {errors.title && (
          <p
            id={titleErrorId}
            role="alert"
            className="text-red-600 text-sm mt-1"
          >
            {errors.title}
          </p>
        )}
        <p className="text-gray-500 text-xs mt-1">
          {metadata.title.length}/{METADATA_CONSTRAINTS.title.maxLength} characters
        </p>
      </div>

      {/* Room Field (Optional with Dropdown) */}
      <div ref={locationDropdownRef} className="relative">
        <label
          htmlFor={locationId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Room
        </label>
        <div className="relative">
          <input
            ref={locationInputRef}
            type="text"
            id={locationId}
            value={locationSearchTerm}
            onChange={handleLocationInputChange}
            onKeyDown={handleLocationKeyDown}
            onFocus={() => setIsLocationOpen(true)}
            maxLength={METADATA_CONSTRAINTS.location.maxLength}
            placeholder="Select or type a room..."
            aria-expanded={isLocationOpen}
            aria-haspopup="listbox"
            aria-invalid={!!errors.location}
            aria-describedby={errors.location ? locationErrorId : undefined}
            aria-autocomplete="list"
            className={cn(
              'w-full px-4 py-3 pr-10 border rounded-lg transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'min-h-[48px]',
              errors.location
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 hover:border-gray-400'
            )}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => {
              setIsLocationOpen(!isLocationOpen);
              locationInputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            aria-label="Toggle room options"
          >
            <ChevronDown
              className={cn(
                'w-5 h-5 transition-transform',
                isLocationOpen && 'rotate-180'
              )}
            />
          </button>
        </div>

        {/* Location Dropdown */}
        {isLocationOpen && (
          <div
            className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            role="listbox"
            aria-label="Room options"
          >
            {filteredLocations.map((location, index) => (
              <div
                key={location}
                role="option"
                aria-selected={location === metadata.location}
                className={cn(
                  'px-4 py-3 cursor-pointer transition-colors min-h-[48px] flex items-center',
                  locationFocusedIndex === index
                    ? 'bg-blue-50 text-blue-900'
                    : 'hover:bg-gray-50',
                  location === metadata.location && 'bg-blue-50 text-blue-900'
                )}
                onClick={() => handleLocationSelect(location)}
              >
                {location}
              </div>
            ))}

            {/* Custom text option */}
            {locationSearchTerm && !exactMatch && (
              <div
                role="option"
                aria-selected={false}
                className={cn(
                  'px-4 py-3 cursor-pointer transition-colors border-t border-gray-100 min-h-[48px] flex items-center',
                  locationFocusedIndex === filteredLocations.length
                    ? 'bg-blue-50 text-blue-900'
                    : 'hover:bg-gray-50'
                )}
                onClick={() => handleLocationConfirm()}
              >
                <span className="text-gray-500">Use custom:</span>
                <span className="ml-2 font-medium">&quot;{locationSearchTerm}&quot;</span>
              </div>
            )}

            {filteredLocations.length === 0 && !locationSearchTerm && (
              <div className="px-4 py-3 text-gray-500 text-center">
                No rooms available
              </div>
            )}
          </div>
        )}

        {errors.location && (
          <p
            id={locationErrorId}
            role="alert"
            className="text-red-600 text-sm mt-1"
          >
            {errors.location}
          </p>
        )}
      </div>

      {/* Tags Field (Optional with Pills) */}
      <div>
        <label
          htmlFor={tagsId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Tags
          <span className="text-gray-400 font-normal ml-2">
            ({tagsCount}/{METADATA_CONSTRAINTS.maxTags})
          </span>
        </label>

        {/* Selected Tags as Pills */}
        <div
          className={cn(
            'flex flex-wrap gap-2 p-3 border rounded-lg min-h-[48px]',
            'focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent',
            errors.tags
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300'
          )}
        >
          {(metadata.tags || []).map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="p-1 hover:bg-blue-200 rounded-full transition-colors min-w-[24px] min-h-[24px] flex items-center justify-center"
                aria-label={`Remove tag: ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {/* Tag Input */}
          <input
            ref={tagInputRef}
            type="text"
            id={tagsId}
            value={tagInputValue}
            onChange={e => setTagInputValue(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            disabled={isAtMaxTags}
            maxLength={METADATA_CONSTRAINTS.tag.maxLength}
            placeholder={isAtMaxTags ? 'Max tags reached' : 'Add a tag...'}
            aria-invalid={!!errors.tags}
            aria-describedby={errors.tags ? tagsErrorId : undefined}
            className={cn(
              'flex-1 min-w-[120px] px-2 py-1 outline-none bg-transparent',
              'placeholder:text-gray-400',
              isAtMaxTags && 'cursor-not-allowed'
            )}
          />
        </div>

        {errors.tags && (
          <p
            id={tagsErrorId}
            role="alert"
            className="text-red-600 text-sm mt-1"
          >
            {errors.tags}
          </p>
        )}

        {/* Suggested Tags */}
        {availableSuggestions.length > 0 && !isAtMaxTags && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2">Suggested tags:</p>
            <div className="flex flex-wrap gap-2">
              {availableSuggestions.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  className={cn(
                    'px-3 py-1.5 rounded-full border border-gray-300 text-sm text-gray-700',
                    'hover:bg-gray-100 hover:border-gray-400 transition-colors',
                    'min-h-[36px]'
                  )}
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Item Type Field (Optional Dropdown) */}
      <div>
        <label
          htmlFor={applianceId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Item Type
        </label>
        <div className="relative">
          <select
            id={applianceId}
            value={metadata.applianceType || ''}
            onChange={handleApplianceChange}
            className={cn(
              'w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'hover:border-gray-400 transition-colors',
              'min-h-[48px] bg-white',
              'pr-10'
            )}
          >
            <option value="">Select item type...</option>
            {APPLIANCE_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

export default MetadataStep;
