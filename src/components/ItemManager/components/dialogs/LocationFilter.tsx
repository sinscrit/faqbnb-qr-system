'use client';

/**
 * LocationFilter Component
 *
 * Dropdown filter for single location selection with search functionality.
 * Provides a clean interface for filtering items by location.
 *
 * @module ItemManager/components/dialogs/LocationFilter
 * @see docs/REQ-065-implement-filterpanel-detailed.md
 * @lastModified 2026-01-22 (REQ-E02-081 - Updated i18n to use items.filters.location namespace)
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, X, MapPin, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

/**
 * Props for the LocationFilter component.
 */
export interface LocationFilterProps {
  /** Currently selected location (undefined for none) */
  selectedLocation: string | undefined;
  /** All available locations to choose from */
  availableLocations: string[];
  /** Callback when selection changes */
  onSelectionChange: (location: string | undefined) => void;
  /** Disable all interactions */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Section label text */
  label?: string;
  /** Placeholder text when no location selected */
  placeholder?: string;
  /** Message shown when no locations available */
  noLocationsMessage?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * LocationFilter Component
 *
 * Renders a single-select location dropdown with:
 * - Search filtering within the dropdown
 * - Clear button when a location is selected
 * - Visual highlight on selected location in list
 */
export function LocationFilter({
  selectedLocation,
  availableLocations,
  onSelectionChange,
  disabled = false,
  className,
  label,
  placeholder,
  noLocationsMessage,
}: LocationFilterProps) {
  // REQ-E02-081: i18n translations
  const t = useTranslations('items.filters.location');

  // Resolve translated strings with prop overrides
  const resolvedLabel = label ?? t('label');
  const resolvedPlaceholder = placeholder ?? t('placeholder');
  const resolvedNoLocationsMessage = noLocationsMessage ?? t('noLocations');
  const searchPlaceholder = t('searchPlaceholder');
  const noMatchingMessage = t('noMatching');
  const noFoundMessage = t('noFound');
  const clearAriaLabel = t('clearSelection');

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ---------------------------------------------------------------------------
  // Refs
  // ---------------------------------------------------------------------------

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ---------------------------------------------------------------------------
  // Computed Values
  // ---------------------------------------------------------------------------

  /**
   * Filter locations based on search query.
   */
  const filteredLocations = availableLocations.filter((location) =>
    location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  /**
   * Handle click outside to close dropdown.
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  /**
   * Focus search input when dropdown opens.
   */
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  /**
   * Select a location.
   */
  const handleSelect = useCallback(
    (location: string) => {
      onSelectionChange(location);
      setIsOpen(false);
      setSearchQuery('');
    },
    [onSelectionChange]
  );

  /**
   * Clear the selected location.
   */
  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelectionChange(undefined);
    },
    [onSelectionChange]
  );

  /**
   * Handle keyboard events in the search input.
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
      } else if (e.key === 'Enter' && filteredLocations.length > 0) {
        e.preventDefault();
        handleSelect(filteredLocations[0]);
      }
    },
    [filteredLocations, handleSelect]
  );

  /**
   * Toggle dropdown visibility.
   */
  const toggleDropdown = useCallback(() => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [disabled, isOpen]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div ref={containerRef} className={cn('space-y-2', className)}>
      {/* Section Label */}
      <p className="text-sm font-medium text-gray-700">{resolvedLabel}</p>

      {/* Dropdown Trigger */}
      <div className="relative flex items-center gap-1">
        <button
          type="button"
          onClick={toggleDropdown}
          disabled={disabled}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className={cn(
            'flex items-center gap-2 flex-1 px-3 py-2 rounded-lg text-sm transition-colors',
            'min-h-[44px]', // Touch target
            'bg-white text-left',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
            'touch-manipulation [-webkit-tap-highlight-color:transparent]',
            selectedLocation
              ? 'border-2 border-blue-300 bg-blue-50'
              : 'border border-gray-300 hover:bg-gray-50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <MapPin
            className={cn(
              'h-4 w-4 flex-shrink-0',
              selectedLocation ? 'text-blue-600' : 'text-gray-500'
            )}
          />

          <span
            className={cn(
              'flex-1 truncate',
              selectedLocation ? 'text-blue-800' : 'text-gray-500'
            )}
          >
            {selectedLocation || resolvedPlaceholder}
          </span>

          <ChevronDown
            className={cn(
              'h-4 w-4 flex-shrink-0 transition-transform',
              selectedLocation ? 'text-blue-600' : 'text-gray-400',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {/* Clear Button - Outside the main button to avoid nesting */}
        {selectedLocation && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              'p-2 hover:bg-blue-100 rounded-full transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
              'min-h-[44px] min-w-[44px] flex items-center justify-center'
            )}
            aria-label={clearAriaLabel}
          >
            <X className="h-4 w-4 text-blue-600" />
          </button>
        )}

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            role="listbox"
            className={cn(
              'absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200',
              'max-h-60 overflow-hidden'
            )}
          >
            {/* Search Input */}
            <div className="p-2 border-b border-gray-100">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder}
                className={cn(
                  'w-full px-3 py-2 text-sm rounded-md',
                  'border border-gray-200 focus:border-blue-500',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500'
                )}
              />
            </div>

            {/* Location List */}
            <div className="max-h-44 overflow-y-auto">
              {filteredLocations.length === 0 ? (
                <div className="px-3 py-4 text-sm text-gray-500 text-center">
                  {searchQuery
                    ? noMatchingMessage
                    : availableLocations.length === 0
                    ? resolvedNoLocationsMessage
                    : noFoundMessage}
                </div>
              ) : (
                filteredLocations.map((location) => {
                  const isSelected = selectedLocation === location;

                  return (
                    <button
                      key={location}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(location)}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 text-sm text-left',
                        'min-h-[44px]', // Touch target
                        'transition-colors focus:outline-none',
                        isSelected
                          ? 'bg-blue-100 text-blue-800'
                          : 'hover:bg-gray-50'
                      )}
                    >
                      <MapPin
                        className={cn(
                          'h-4 w-4 flex-shrink-0',
                          isSelected ? 'text-blue-600' : 'text-gray-400'
                        )}
                      />
                      <span className="flex-1 truncate">{location}</span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LocationFilter;
