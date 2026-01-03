'use client';

/**
 * BulkMoveDialog Component
 *
 * Modal dialog for moving multiple selected items to a different property.
 * Only available when operating in multi-property mode.
 *
 * @module ItemManager/components/BulkActions/BulkMoveDialog
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 3, Task 3.6)
 * @lastModified 2026-01-03 (REQ-073 Task 3.6.11 - Accessibility audit complete)
 */

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useId,
} from 'react';
import { X, FolderInput, Building, ChevronDown, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ItemRecord } from '@/components/ItemCapture/ItemCapture.types';

// =============================================================================
// Constants
// =============================================================================

const MAX_PREVIEW_ITEMS = 5;

// =============================================================================
// Types
// =============================================================================

/**
 * Property definition for multi-property mode.
 */
export interface Property {
  id: string;
  name?: string;
  nickname?: string;
  address?: string;
  property_types?: {
    display_name: string;
  };
}

/**
 * Extended ItemRecord with property assignment support.
 */
interface ItemRecordExtended extends ItemRecord {
  propertyId?: string;
}

/**
 * Props for BulkMoveDialog component.
 */
export interface BulkMoveDialogProps {
  /** Array of selected items to move */
  selectedItems: ItemRecord[];
  /** Available properties to move items to */
  properties: Property[];
  /** Current property ID (will be filtered out of destination options) */
  currentPropertyId?: string;
  /** Callback when move is confirmed with destination property ID */
  onConfirm: (destinationPropertyId: string) => void;
  /** Callback when dialog is cancelled/closed */
  onCancel: () => void;
  /** Loading state during move operation */
  loading?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

// =============================================================================
// Internal Components
// =============================================================================

/**
 * Props for the PropertyDropdown component.
 */
interface PropertyDropdownProps {
  properties: Property[];
  selectedPropertyId: string;
  onSelect: (propertyId: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * PropertyDropdown - Custom accessible dropdown for property selection.
 */
function PropertyDropdown({
  properties,
  selectedPropertyId,
  onSelect,
  disabled = false,
  placeholder = 'Select a property...',
}: PropertyDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();

  // Get selected property display name
  const selectedProperty = useMemo(() => {
    return properties.find((p) => p.id === selectedPropertyId);
  }, [properties, selectedPropertyId]);

  const displayName = selectedProperty
    ? selectedProperty.nickname || selectedProperty.name || 'Unknown Property'
    : placeholder;

  // Click outside handler
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

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setFocusedIndex(0);
          } else {
            setFocusedIndex((prev) => (prev + 1) % properties.length);
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setFocusedIndex(properties.length - 1);
          } else {
            setFocusedIndex((prev) => (prev - 1 + properties.length) % properties.length);
          }
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setFocusedIndex(0);
          } else if (focusedIndex >= 0 && focusedIndex < properties.length) {
            onSelect(properties[focusedIndex].id);
            setIsOpen(false);
            setFocusedIndex(-1);
            buttonRef.current?.focus();
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
    },
    [disabled, isOpen, focusedIndex, properties, onSelect]
  );

  // Handle option click
  const handleOptionClick = useCallback(
    (propertyId: string) => {
      onSelect(propertyId);
      setIsOpen(false);
      setFocusedIndex(-1);
      buttonRef.current?.focus();
    },
    [onSelect]
  );

  // Empty state
  if (properties.length === 0) {
    return (
      <div className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm">
        No properties available
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-label="Select destination property"
        className={cn(
          'w-full flex items-center justify-between p-3 border rounded-lg text-left',
          'transition-colors',
          isOpen
            ? 'ring-2 ring-blue-500 border-blue-500'
            : 'border-gray-300 hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed bg-gray-50'
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Building className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span
            className={cn(
              'truncate',
              selectedPropertyId ? 'text-gray-900' : 'text-gray-500'
            )}
          >
            {displayName}
          </span>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-gray-400 flex-shrink-0 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Available properties"
          className={cn(
            'absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg',
            'max-h-60 overflow-y-auto'
          )}
        >
          {properties.map((property, index) => {
            const isSelected = property.id === selectedPropertyId;
            const isFocused = index === focusedIndex;
            const displayText = property.nickname || property.name || 'Unknown Property';

            return (
              <li
                key={property.id}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleOptionClick(property.id)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 cursor-pointer',
                  'transition-colors',
                  isSelected && 'bg-blue-50',
                  isFocused && !isSelected && 'bg-gray-100',
                  !isSelected && !isFocused && 'hover:bg-gray-50'
                )}
              >
                <Building className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {displayText}
                  </div>
                  {(property.address || property.property_types?.display_name) && (
                    <div className="text-xs text-gray-500 truncate">
                      {property.address || property.property_types?.display_name}
                    </div>
                  )}
                </div>
                {isSelected && (
                  <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/**
 * Props for the ItemPreviewList component.
 */
interface ItemPreviewListProps {
  items: ItemRecord[];
  properties: Property[];
  maxDisplay?: number;
}

/**
 * ItemPreviewList - Shows items to be moved with source property info.
 */
function ItemPreviewList({
  items,
  properties,
  maxDisplay = MAX_PREVIEW_ITEMS,
}: ItemPreviewListProps) {
  const displayItems = items.slice(0, maxDisplay);
  const remainingCount = items.length - displayItems.length;

  // Helper to get property name
  const getPropertyName = useCallback(
    (item: ItemRecord): string | null => {
      const extendedItem = item as ItemRecordExtended;
      if (!extendedItem.propertyId) return null;

      const property = properties.find((p) => p.id === extendedItem.propertyId);
      return property
        ? property.nickname || property.name || 'Unknown'
        : null;
    },
    [properties]
  );

  return (
    <div className="mt-4">
      <p className="text-sm font-medium text-gray-700 mb-2">Items to move:</p>
      <ul className="max-h-40 overflow-y-auto space-y-1.5">
        {displayItems.map((item) => {
          const propertyName = getPropertyName(item);
          return (
            <li key={item.id} className="flex items-start text-sm">
              <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-gray-900 truncate block">{item.title}</span>
                {propertyName && (
                  <span className="text-xs text-gray-500">from: {propertyName}</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {remainingCount > 0 && (
        <p className="text-sm text-gray-500 italic mt-2 ml-4">
          (and {remainingCount} more...)
        </p>
      )}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

/**
 * BulkMoveDialog Component
 *
 * Modal dialog for moving selected items to a different property.
 * Features an accessible property dropdown and item preview list.
 */
export function BulkMoveDialog({
  selectedItems,
  properties,
  currentPropertyId,
  onConfirm,
  onCancel,
  loading = false,
  className,
}: BulkMoveDialogProps) {
  // ---------------------------------------------------------------------------
  // IDs for accessibility
  // ---------------------------------------------------------------------------
  const uniqueId = useId();
  const titleId = `bulk-move-title-${uniqueId}`;
  const selectLabelId = `bulk-move-select-label-${uniqueId}`;

  // ---------------------------------------------------------------------------
  // Refs
  // ---------------------------------------------------------------------------
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [destinationPropertyId, setDestinationPropertyId] = useState('');

  // ---------------------------------------------------------------------------
  // Computed Values
  // ---------------------------------------------------------------------------

  // Filter out current property from available destinations
  const availableProperties = useMemo(() => {
    return properties.filter((p) => p.id !== currentPropertyId);
  }, [properties, currentPropertyId]);

  // Confirm button disabled state
  const confirmDisabled = loading || !destinationPropertyId;

  // Item count with proper pluralization
  const itemCount = selectedItems.length;
  const itemLabel = itemCount === 1 ? 'Item' : 'Items';

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  // Prevent body scroll when dialog is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, loading]);

  // Focus trap - keep focus within dialog
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // Set initial focus to the close button (or first focusable element)
    closeButtonRef.current?.focus();

    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleFocusTrap);
    return () => document.removeEventListener('keydown', handleFocusTrap);
  }, []);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && !loading) {
        onCancel();
      }
    },
    [loading, onCancel]
  );

  // Handle confirm
  const handleConfirmClick = useCallback(() => {
    if (destinationPropertyId) {
      onConfirm(destinationPropertyId);
    }
  }, [destinationPropertyId, onConfirm]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden',
          'flex flex-col',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <FolderInput className="h-5 w-5 text-blue-600" />
            </div>
            <h2 id={titleId} className="text-lg font-semibold text-gray-900">
              Move {itemCount} {itemLabel} to Another Property
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onCancel}
            disabled={loading}
            className={cn(
              'p-2 rounded-full hover:bg-gray-100 transition-colors',
              loading && 'opacity-50 cursor-not-allowed'
            )}
            aria-label="Close dialog"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Property Selector */}
          <div className="space-y-2">
            <label
              id={selectLabelId}
              className="block text-sm font-medium text-gray-700"
            >
              Destination property
            </label>
            {availableProperties.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <p className="text-sm text-gray-500">No other properties available</p>
              </div>
            ) : (
              <PropertyDropdown
                properties={availableProperties}
                selectedPropertyId={destinationPropertyId}
                onSelect={setDestinationPropertyId}
                disabled={loading}
                placeholder="Select destination property..."
              />
            )}
          </div>

          {/* Items Preview */}
          <ItemPreviewList
            items={selectedItems}
            properties={properties}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={onCancel}
            disabled={loading}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium',
              'bg-white border border-gray-300 text-gray-700',
              'hover:bg-gray-50 transition-colors',
              loading && 'opacity-50 cursor-not-allowed'
            )}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmClick}
            disabled={confirmDisabled}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium text-white',
              'flex items-center gap-2 transition-colors',
              'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300',
              confirmDisabled && 'cursor-not-allowed'
            )}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Move {itemCount} {itemLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BulkMoveDialog;
