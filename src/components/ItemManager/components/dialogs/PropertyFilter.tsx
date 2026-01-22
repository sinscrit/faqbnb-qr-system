'use client';

/**
 * PropertyFilter Component
 *
 * Checkbox group for filtering items by property in multi-property mode.
 * Only renders when properties are available.
 *
 * @module ItemManager/components/dialogs/PropertyFilter
 * @see docs/REQ-065-implement-filterpanel-detailed.md
 * @lastModified 2026-01-22 (REQ-E02-081 - Updated i18n to use items.filters.property namespace)
 */

import { useTranslations } from 'next-intl';
import { Building, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Property } from '../../ItemManager.types';

// =============================================================================
// Types
// =============================================================================

/**
 * Props for the PropertyFilter component.
 */
export interface PropertyFilterProps {
  /** Currently selected property IDs */
  selectedPropertyIds: string[];
  /** Available properties to filter by */
  properties: Property[];
  /** Callback when selection changes */
  onSelectionChange: (propertyIds: string[]) => void;
  /** Disable all interactions */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Section label text */
  label?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * PropertyFilter Component
 *
 * Renders a group of toggleable property checkboxes for filtering.
 * Returns null when no properties are available.
 */
export function PropertyFilter({
  selectedPropertyIds,
  properties,
  onSelectionChange,
  disabled = false,
  className,
  label,
}: PropertyFilterProps) {
  // REQ-E02-081: i18n translations (called before early return to follow React rules of hooks)
  const t = useTranslations('items.filters.property');

  // Resolve label with prop override
  const resolvedLabel = label ?? t('label');

  // ---------------------------------------------------------------------------
  // Early Return
  // ---------------------------------------------------------------------------

  // Don't render if no properties available
  if (properties.length === 0) {
    return null;
  }

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  /**
   * Handle toggling a property selection.
   */
  const handleToggle = (propertyId: string) => {
    if (disabled) return;

    const isSelected = selectedPropertyIds.includes(propertyId);
    const updated = isSelected
      ? selectedPropertyIds.filter((id) => id !== propertyId)
      : [...selectedPropertyIds, propertyId];

    onSelectionChange(updated);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className={cn('space-y-2', className)}>
      {/* Section Label */}
      <p className="text-sm font-medium text-gray-700">{resolvedLabel}</p>

      {/* Property Checkboxes */}
      <div
        role="group"
        aria-label={resolvedLabel}
        className="space-y-2"
      >
        {properties.map((property) => {
          const isSelected = selectedPropertyIds.includes(property.id);
          const displayName = property.nickname || property.name || 'Unnamed Property';
          const propertyType = property.property_types?.display_name;

          return (
            <button
              key={property.id}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => handleToggle(property.id)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-lg text-sm transition-colors',
                'min-h-[48px]', // Touch target
                'touch-manipulation [-webkit-tap-highlight-color:transparent]',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                isSelected
                  ? 'bg-blue-50 border-2 border-blue-300'
                  : 'bg-white border border-gray-200 hover:bg-gray-50',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {/* Checkbox Indicator */}
              <span
                className={cn(
                  'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors',
                  isSelected
                    ? 'bg-blue-500'
                    : 'border-2 border-gray-300 bg-white'
                )}
              >
                {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
              </span>

              {/* Property Icon */}
              <Building
                className={cn(
                  'h-5 w-5 flex-shrink-0',
                  isSelected ? 'text-blue-600' : 'text-gray-400'
                )}
              />

              {/* Property Info */}
              <div className="flex-1 min-w-0 text-left">
                <p
                  className={cn(
                    'font-medium truncate',
                    isSelected ? 'text-blue-800' : 'text-gray-900'
                  )}
                >
                  {displayName}
                </p>
                {(property.address || propertyType) && (
                  <p
                    className={cn(
                      'text-xs truncate',
                      isSelected ? 'text-blue-600' : 'text-gray-500'
                    )}
                  >
                    {propertyType && (
                      <span>{propertyType}</span>
                    )}
                    {propertyType && property.address && (
                      <span> &bull; </span>
                    )}
                    {property.address && (
                      <span>{property.address}</span>
                    )}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default PropertyFilter;
