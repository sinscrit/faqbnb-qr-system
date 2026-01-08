'use client';

/**
 * PropertyDropdown Component
 *
 * Compact property selector for the dashboard navigation bar.
 * Displays current property with dropdown for switching.
 *
 * REQ-142: Property Context System
 * @created 2026-01-08
 * @modified 2026-01-08 - Mobile responsive: truncated property name
 */

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Building2, Check, Loader2 } from 'lucide-react';
import { usePropertyContext } from '@/hooks/usePropertyContext';
import { cn } from '@/lib/utils';

export interface PropertyDropdownProps {
  /** Additional CSS classes */
  className?: string;
}

export function PropertyDropdown({ className }: PropertyDropdownProps) {
  const {
    selectedPropertyId,
    selectedProperty,
    properties,
    isLoading,
    setSelectedPropertyId,
  } = usePropertyContext();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  // Handle property selection
  const handleSelect = (propertyId: string | null) => {
    setSelectedPropertyId(propertyId);
    setIsOpen(false);
  };

  // Display text for the button
  // Full name for desktop, truncated (first 3 chars) for mobile
  const fullDisplayText = selectedProperty?.nickname || 'All Properties';
  const mobileDisplayText = selectedProperty?.nickname
    ? selectedProperty.nickname.substring(0, 3) + '...'
    : 'All';

  // Don't render if only 0 or 1 property (no need for selector)
  if (!isLoading && properties.length <= 1) {
    return null;
  }

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select property"
        className={cn(
          'flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg',
          'border border-gray-200 bg-white',
          'text-sm font-medium text-gray-700',
          'hover:bg-gray-50 hover:border-gray-300',
          'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2',
          'transition-colors duration-150',
          'min-w-0 sm:min-w-[160px] max-w-[120px] sm:max-w-[240px]',
          isLoading && 'opacity-70 cursor-not-allowed'
        )}
      >
        <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" aria-hidden="true" />
        {/* Mobile: truncated name, Desktop: full name */}
        <span className="truncate flex-1 text-left sm:hidden">{mobileDisplayText}</span>
        <span className="truncate flex-1 text-left hidden sm:block">{fullDisplayText}</span>
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-gray-400 flex-shrink-0" aria-hidden="true" />
        ) : (
          <ChevronDown
            className={cn(
              'w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
            aria-hidden="true"
          />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Property list"
          className={cn(
            'absolute top-full left-0 mt-1 z-50',
            'min-w-full w-max max-w-[280px]',
            'bg-white rounded-lg shadow-lg border border-gray-200',
            'py-1 max-h-[320px] overflow-y-auto',
            'animate-in fade-in slide-in-from-top-2 duration-200'
          )}
        >
          {/* All Properties Option */}
          <button
            type="button"
            role="option"
            aria-selected={!selectedPropertyId}
            onClick={() => handleSelect(null)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5',
              'text-sm text-left',
              'hover:bg-gray-50 transition-colors',
              !selectedPropertyId && 'bg-gray-50'
            )}
          >
            <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
            <span className="flex-1 font-medium text-gray-700">All Properties</span>
            {!selectedPropertyId && (
              <Check className="w-4 h-4 text-[#FF385C] flex-shrink-0" aria-hidden="true" />
            )}
          </button>

          {/* Divider */}
          {properties.length > 0 && (
            <div className="border-t border-gray-100 my-1" role="separator" />
          )}

          {/* Property Options */}
          {properties.map((property) => (
            <button
              key={property.id}
              type="button"
              role="option"
              aria-selected={selectedPropertyId === property.id}
              onClick={() => handleSelect(property.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5',
                'text-sm text-left',
                'hover:bg-gray-50 transition-colors',
                selectedPropertyId === property.id && 'bg-gray-50'
              )}
            >
              <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-700 truncate">{property.nickname}</div>
                {property.address && (
                  <div className="text-xs text-gray-500 truncate">{property.address}</div>
                )}
              </div>
              {selectedPropertyId === property.id && (
                <Check className="w-4 h-4 text-[#FF385C] flex-shrink-0" aria-hidden="true" />
              )}
            </button>
          ))}

          {/* Empty state */}
          {properties.length === 0 && (
            <div className="px-3 py-4 text-sm text-gray-500 text-center">
              No properties found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PropertyDropdown;
