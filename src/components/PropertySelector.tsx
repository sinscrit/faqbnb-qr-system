'use client';

import { useState, useRef, useEffect } from 'react';
import { Building, ChevronDown, Check } from 'lucide-react';

interface Property {
  id: string;
  nickname: string;
  property_types?: {
    display_name: string;
  };
  users?: {
    email: string;
  };
}

interface PropertySelectorProps {
  properties: Property[];
  selectedPropertyId?: string;
  onPropertyChange: (propertyId: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact';
  disabled?: boolean;
  loading?: boolean;
  isAdmin?: boolean;
  placeholder?: string;
}

export default function PropertySelector({
  properties = [],
  selectedPropertyId = '',
  onPropertyChange,
  className = '',
  size = 'md',
  variant = 'default',
  disabled = false,
  loading = false,
  isAdmin = false,
  placeholder = 'All Properties'
}: PropertySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    const totalOptions = properties.length + 1; // +1 for "All Properties" option

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex((prev) => (prev + 1) % totalOptions);
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(totalOptions - 1);
        } else {
          setFocusedIndex((prev) => (prev - 1 + totalOptions) % totalOptions);
        }
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (focusedIndex >= 0) {
          const selectedProperty = focusedIndex === 0 ? '' : properties[focusedIndex - 1]?.id || '';
          onPropertyChange(selectedProperty);
          setIsOpen(false);
          setFocusedIndex(-1);
        }
        break;

      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        buttonRef.current?.focus();
        break;

      case 'Tab':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  // Get size-specific classes
  const getSizeClasses = () => {
    const sizeMap = {
      sm: {
        button: 'px-3 py-1.5 text-xs',
        dropdown: 'py-1',
        option: 'px-3 py-1.5 text-xs',
        icon: 'w-3 h-3'
      },
      md: {
        button: 'px-4 py-2 text-sm',
        dropdown: 'py-2',
        option: 'px-4 py-2 text-sm',
        icon: 'w-4 h-4'
      },
      lg: {
        button: 'px-6 py-3 text-base',
        dropdown: 'py-3',
        option: 'px-6 py-3 text-base',
        icon: 'w-5 h-5'
      }
    };
    return sizeMap[size];
  };

  // Get selected property display text
  const getSelectedPropertyDisplay = () => {
    if (!selectedPropertyId) return placeholder;
    const selectedProperty = properties.find(p => p.id === selectedPropertyId);
    if (!selectedProperty) return placeholder;
    
    let displayText = selectedProperty.nickname;
    if (isAdmin && selectedProperty.users?.email) {
      displayText += ` (${selectedProperty.users.email})`;
    }
    
    return displayText;
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={`property-selector relative ${className}`} ref={dropdownRef}>
      {variant === 'default' && (
        <div className="mb-3">
          <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <Building className="w-4 h-4" />
            <span>Property Filter</span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Filter analytics data by property
          </p>
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        className={`
          ${sizeClasses.button}
          w-full bg-white border border-gray-300 rounded-lg 
          flex items-center justify-between
          hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
          ${isOpen ? 'ring-2 ring-blue-500 border-transparent' : ''}
        `}
        onClick={() => {
          if (!disabled && !loading) {
            setIsOpen(!isOpen);
          }
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled || loading}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select property for analytics filtering"
      >
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <Building className={`${sizeClasses.icon} text-gray-400 flex-shrink-0`} />
          <span className="truncate text-left">
            {loading ? 'Loading properties...' : getSelectedPropertyDisplay()}
          </span>
        </div>
        <ChevronDown 
          className={`${sizeClasses.icon} text-gray-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'transform rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown */}
      {isOpen && !loading && (
        <div 
          className={`
            absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg
            max-h-60 overflow-y-auto
            ${sizeClasses.dropdown}
          `}
          role="listbox"
          aria-label="Property options"
        >
          {/* All Properties option */}
          <div
            className={`
              ${sizeClasses.option}
              cursor-pointer hover:bg-gray-50 transition-colors duration-150
              ${focusedIndex === 0 ? 'bg-blue-50 text-blue-900' : ''}
              ${!selectedPropertyId ? 'bg-blue-50 text-blue-900' : ''}
              flex items-center justify-between
            `}
            onClick={() => {
              onPropertyChange('');
              setIsOpen(false);
              setFocusedIndex(-1);
            }}
            role="option"
            aria-selected={!selectedPropertyId}
          >
            <div className="flex items-center space-x-2">
              <Building className={`${sizeClasses.icon} text-gray-400`} />
              <span>{placeholder}</span>
            </div>
            {!selectedPropertyId && (
              <Check className={`${sizeClasses.icon} text-blue-600`} />
            )}
          </div>

          {/* Individual property options */}
          {properties.map((property, index) => {
            const optionIndex = index + 1;
            const isSelected = selectedPropertyId === property.id;
            const isFocused = focusedIndex === optionIndex;

            return (
              <div
                key={property.id}
                className={`
                  ${sizeClasses.option}
                  cursor-pointer hover:bg-gray-50 transition-colors duration-150
                  ${isFocused ? 'bg-blue-50 text-blue-900' : ''}
                  ${isSelected ? 'bg-blue-50 text-blue-900' : ''}
                  flex items-center justify-between
                `}
                onClick={() => {
                  onPropertyChange(property.id);
                  setIsOpen(false);
                  setFocusedIndex(-1);
                }}
                role="option"
                aria-selected={isSelected}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <Building className={`${sizeClasses.icon} text-gray-400 flex-shrink-0`} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">
                        {property.nickname}
                      </div>
                      {(property.property_types?.display_name || (isAdmin && property.users?.email)) && (
                        <div className="text-xs text-gray-500 truncate">
                          {property.property_types?.display_name}
                          {isAdmin && property.users?.email && 
                            ` • ${property.users.email}`
                          }
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <Check className={`${sizeClasses.icon} text-blue-600 flex-shrink-0 ml-2`} />
                )}
              </div>
            );
          })}

          {properties.length === 0 && (
            <div className={`${sizeClasses.option} text-gray-500 text-center`}>
              No properties available
            </div>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && isOpen && (
        <div className={`absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg ${sizeClasses.dropdown}`}>
          <div className={`${sizeClasses.option} text-center text-gray-500`}>
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Loading properties...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export property selector options utility
export const getPropertyLabel = (property: Property, isAdmin: boolean = false): string => {
  let label = property.nickname;
  if (isAdmin && property.users?.email) {
    label += ` (${property.users.email})`;
  }
  return label;
}; 