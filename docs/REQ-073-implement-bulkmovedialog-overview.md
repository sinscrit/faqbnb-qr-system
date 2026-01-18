# REQ-073: Implement BulkMoveDialog - Technical Implementation Overview

**Document Created:** 2026-01-03T20:15:00
**Last Modified:** 2026-01-03T20:15:00
**Request Reference:** REQ-073 (Bulk Move Items Between Properties)
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 3 - Selection & Bulk Actions
**Task ID:** 3.6

---

## 1. Executive Summary

This document provides the technical implementation breakdown for building the `BulkMoveDialog` component (Task 3.6 in Phase 3). This dialog enables users to move multiple selected items from their current properties to a different property, with a preview of affected items and destination property selection.

### Scope

The `BulkMoveDialog` component will:
- Display as a modal dialog when triggered from BulkActionsBar (Move to... button)
- Only appear when operating in multi-property mode
- Provide a property selector dropdown to choose the destination property
- Show a preview list of items that will be moved
- Allow users to confirm or cancel the bulk move operation
- Emit appropriate callbacks for property assignment changes

### Dependencies

- **Prerequisite Tasks:**
  - Task 3.1: `useItemSelection` hook (`src/components/ItemManager/hooks/useItemSelection.ts`)
  - Task 3.2: Selection UI Integration (checkboxes, selection mode)
  - Task 3.3: BulkActionsBar component (`src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx`)
  - Task 1.1: ItemManager types (`src/components/ItemManager/ItemManager.types.ts`)

- **Parallel Tasks:**
  - Task 3.4: ConfirmDeleteDialog (similar dialog pattern)
  - Task 3.5: BulkTagDialog (similar dialog pattern)

- **Related Existing Components:**
  - `src/components/PropertySelector.tsx` - Existing property selection component

---

## 2. Technical Context

### 2.1 Existing Stack & Patterns

| Technology | Details | Source |
|------------|---------|--------|
| Framework | Next.js 15.5.9 with React 19.1.0 | `package.json` |
| Language | TypeScript 5.x (strict mode) | `tsconfig.json` |
| Styling | Tailwind CSS 4.x with `cn()` utility | `src/lib/utils.ts` |
| Icons | Lucide React 0.525.0 | `package.json` |
| UI Primitives | Radix UI (dialog, dropdown) | `package.json` |
| Modal Pattern | Fixed overlay with centered card | `src/components/ConfirmationModal.tsx` |

### 2.2 Reference Patterns from Codebase

**Modal Pattern (from `src/components/ConfirmationModal.tsx`):**
```typescript
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white rounded-lg p-6 max-w-md mx-4 w-full">
    {/* Content */}
  </div>
</div>
```

**PropertySelector Pattern (from `src/components/PropertySelector.tsx:17-28`):**
```typescript
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
```

**Property Interface (from `src/components/PropertySelector.tsx:6-15`):**
```typescript
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
```

### 2.3 Types from Implementation Plan

From `ItemManager.types.ts`:

```typescript
// Property definition for multi-property mode
interface Property {
  id: string;
  name: string;
  address?: string;
}

// Extended ItemRecord with property assignment
interface ItemRecordExtended extends ItemRecord {
  /** Property ID for multi-property mode */
  propertyId?: string;
  // ... other fields
}

// Callback for item updates
onUpdateItem: (item: ItemRecord) => void;
```

### 2.4 Integration with BulkActionsBar

From REQ-070 BulkActionsBar implementation:

```typescript
// Move to property action (multi-property mode only)
{multiPropertyMode && onMoveToProperty && (
  <ActionButton
    icon={FolderInput}
    label="Move to..."
    onClick={onMoveToProperty}  // Opens BulkMoveDialog
    variant="primary"
    disabled={loading}
  />
)}
```

---

## 3. Implementation Approach

### 3.1 Component Architecture

The `BulkMoveDialog` is a modal component that receives selected items, available properties, and callbacks from the parent.

```typescript
interface BulkMoveDialogProps {
  /** Array of selected items to move */
  selectedItems: ItemRecord[];

  /** Array of available properties to move items to */
  properties: Property[];

  /** Currently active property ID (items will be moved FROM here) */
  currentPropertyId?: string;

  /** Callback when move is confirmed */
  onConfirm: (destinationPropertyId: string) => void;

  /** Callback when dialog is cancelled/closed */
  onCancel: () => void;

  /** Loading state during operation */
  loading?: boolean;

  /** Optional additional CSS classes */
  className?: string;
}
```

### 3.2 Visual Layout

```
┌────────────────────────────────────────────────────────────────┐
│  ✕                                                              │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📁 Move 5 Items to Another Property                           │
│                                                                 │
│  Destination property:                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🏠 Beach House                                     ▼   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Items to move:                                                 │
│  • Coffee Maker (from: Mountain Cabin)                          │
│  • Dishwasher (from: Mountain Cabin)                            │
│  • Smart Thermostat (from: Downtown Loft)                       │
│  • (and 2 more...)                                              │
│                                                                 │
│  ┌──────────┐  ┌────────────────────┐                          │
│  │  Cancel  │  │   Move 5 Items     │                          │
│  └──────────┘  └────────────────────┘                          │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### 3.3 State Management

```typescript
// Selected destination property
const [destinationPropertyId, setDestinationPropertyId] = useState<string>('');

// Dropdown open state (inline property selector)
const [isDropdownOpen, setIsDropdownOpen] = useState(false);
const [focusedIndex, setFocusedIndex] = useState(-1);

// Computed values
const selectedProperty = useMemo(() =>
  properties.find(p => p.id === destinationPropertyId),
  [properties, destinationPropertyId]
);

// Filter out properties that items are already on (optional enhancement)
const availableProperties = useMemo(() =>
  properties.filter(p => p.id !== currentPropertyId),
  [properties, currentPropertyId]
);

// Group items by current property for preview
const itemsByProperty = useMemo(() => {
  const grouped = new Map<string, ItemRecord[]>();
  selectedItems.forEach(item => {
    const propId = (item as ItemRecordExtended).propertyId || 'unknown';
    if (!grouped.has(propId)) {
      grouped.set(propId, []);
    }
    grouped.get(propId)!.push(item);
  });
  return grouped;
}, [selectedItems]);
```

### 3.4 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Escape** | Close dialog without saving |
| **Enter** | Confirm move (when property selected) |
| **ArrowUp/Down** | Navigate property dropdown options |

---

## 4. Authorized Files and Functions for Modification

### 4.1 Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx` | Main bulk move dialog component |

### 4.2 Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemManager/components/BulkActions/index.ts` | Add export for BulkMoveDialog |
| `src/components/ItemManager/ItemManager.tsx` | Add move dialog state and handlers |
| `src/components/ItemManager/ItemManager.types.ts` | Add BulkMoveDialogProps interface if not present |

### 4.3 Functions to Implement

| Function | File | Purpose |
|----------|------|---------|
| `BulkMoveDialog` | `BulkMoveDialog.tsx` | Main component function |
| `PropertyDropdown` | `BulkMoveDialog.tsx` | Internal property selector component |
| `ItemPreviewList` | `BulkMoveDialog.tsx` | Internal component showing affected items |
| `handleBulkMoveConfirm` | `ItemManager.tsx` | Process property reassignment for all selected items |

---

## 5. Detailed Task Breakdown

### Task 3.6.1: Create BulkMoveDialog Component Structure

**File:** `src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx`

```typescript
'use client';

/**
 * BulkMoveDialog Component
 *
 * Modal dialog for moving multiple selected items to a different property.
 * Only available when operating in multi-property mode. Allows users to
 * select a destination property and confirms the bulk move operation.
 *
 * @module ItemManager/components/BulkActions/BulkMoveDialog
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 3, Task 3.6)
 * @lastModified 2026-01-03 (REQ-073)
 */

import React, { useState, useMemo, useCallback, useRef, useEffect, useId } from 'react';
import { X, FolderInput, Building, ChevronDown, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ItemRecord } from '@/components/ItemCapture/ItemCapture.types';

// =============================================================================
// Type Definitions
// =============================================================================

export interface Property {
  id: string;
  name?: string;
  nickname?: string;
  address?: string;
  property_types?: {
    display_name: string;
  };
}

export interface BulkMoveDialogProps {
  /** Array of selected items to move */
  selectedItems: ItemRecord[];

  /** Array of available properties to move items to */
  properties: Property[];

  /** Currently active property ID (to exclude from destination options) */
  currentPropertyId?: string;

  /** Callback when move is confirmed with destination property ID */
  onConfirm: (destinationPropertyId: string) => void;

  /** Callback when dialog is cancelled/closed */
  onCancel: () => void;

  /** Loading state during operation */
  loading?: boolean;

  /** Optional additional CSS classes */
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

const MAX_PREVIEW_ITEMS = 5;

// =============================================================================
// Internal Components
// =============================================================================

// PropertyDropdown - inline property selector
// ItemPreviewList - shows affected items

// =============================================================================
// Main Component
// =============================================================================

export function BulkMoveDialog({
  selectedItems,
  properties,
  currentPropertyId,
  onConfirm,
  onCancel,
  loading = false,
  className,
}: BulkMoveDialogProps) {
  // ... implementation
}

export default BulkMoveDialog;
```

### Task 3.6.2: Implement Property Dropdown Selector

The property dropdown follows the pattern from `src/components/PropertySelector.tsx` but simplified for inline modal use:

```typescript
interface PropertyDropdownProps {
  properties: Property[];
  selectedPropertyId: string;
  onSelect: (propertyId: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

function PropertyDropdown({
  properties,
  selectedPropertyId,
  onSelect,
  disabled = false,
  placeholder = 'Select destination property...',
}: PropertyDropdownProps) {
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

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex(prev => (prev + 1) % properties.length);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(properties.length - 1);
        } else {
          setFocusedIndex(prev => (prev - 1 + properties.length) % properties.length);
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (focusedIndex >= 0 && focusedIndex < properties.length) {
          onSelect(properties[focusedIndex].id);
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
  }, [isOpen, properties, focusedIndex, onSelect]);

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  const displayName = selectedProperty?.nickname || selectedProperty?.name || placeholder;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        className={cn(
          'w-full px-4 py-3 bg-white border border-gray-300 rounded-lg',
          'flex items-center justify-between',
          'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors duration-200',
          isOpen && 'ring-2 ring-blue-500 border-transparent'
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select destination property"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Building className="w-5 h-5 text-gray-400 flex-shrink-0" aria-hidden="true" />
          <span className={cn(
            'truncate text-left',
            !selectedPropertyId && 'text-gray-500'
          )}>
            {displayName}
          </span>
        </div>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0',
            isOpen && 'transform rotate-180'
          )}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto py-1"
          role="listbox"
          aria-label="Property options"
        >
          {properties.length === 0 ? (
            <div className="px-4 py-3 text-gray-500 text-center">
              No properties available
            </div>
          ) : (
            properties.map((property, index) => {
              const isSelected = selectedPropertyId === property.id;
              const isFocused = focusedIndex === index;
              const displayText = property.nickname || property.name || property.id;

              return (
                <div
                  key={property.id}
                  className={cn(
                    'px-4 py-3 cursor-pointer transition-colors duration-150',
                    'flex items-center justify-between',
                    isFocused && 'bg-blue-50 text-blue-900',
                    isSelected && 'bg-blue-50 text-blue-900',
                    !isFocused && !isSelected && 'hover:bg-gray-50'
                  )}
                  onClick={() => {
                    onSelect(property.id);
                    setIsOpen(false);
                    setFocusedIndex(-1);
                  }}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Building className="w-5 h-5 text-gray-400 flex-shrink-0" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{displayText}</div>
                      {(property.address || property.property_types?.display_name) && (
                        <div className="text-xs text-gray-500 truncate">
                          {property.property_types?.display_name}
                          {property.address && ` • ${property.address}`}
                        </div>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2" aria-hidden="true" />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
```

### Task 3.6.3: Implement Items Preview

```typescript
interface ItemPreviewListProps {
  items: ItemRecord[];
  properties: Property[];
  maxDisplay?: number;
}

function ItemPreviewList({
  items,
  properties,
  maxDisplay = MAX_PREVIEW_ITEMS
}: ItemPreviewListProps) {
  const displayItems = items.slice(0, maxDisplay);
  const remainingCount = items.length - displayItems.length;

  // Helper to get property name for an item
  const getPropertyName = (item: ItemRecord): string => {
    const propId = (item as ItemRecordExtended).propertyId;
    if (!propId) return 'Unknown';
    const prop = properties.find(p => p.id === propId);
    return prop?.nickname || prop?.name || 'Unknown';
  };

  return (
    <div className="mt-4">
      <p className="text-sm font-medium text-gray-700 mb-2">
        Items to move:
      </p>
      <ul className="space-y-1 text-sm text-gray-600 max-h-40 overflow-y-auto">
        {displayItems.map(item => (
          <li key={item.id} className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 mt-1.5" />
            <div className="min-w-0 flex-1">
              <span className="truncate block">{item.title}</span>
              <span className="text-xs text-gray-400">
                from: {getPropertyName(item)}
              </span>
            </div>
          </li>
        ))}
        {remainingCount > 0 && (
          <li className="text-gray-400 italic pl-3.5">
            (and {remainingCount} more...)
          </li>
        )}
      </ul>
    </div>
  );
}
```

### Task 3.6.4: Update BulkActions Index

**File:** `src/components/ItemManager/components/BulkActions/index.ts`

```typescript
/**
 * BulkActions Components Barrel Export
 * @module ItemManager/components/BulkActions
 * @lastModified 2026-01-03 (REQ-073)
 */

export { BulkActionsBar } from './BulkActionsBar';
export type { BulkActionsBarProps } from './BulkActionsBar';

export { BulkTagDialog } from './BulkTagDialog';
export type { BulkTagDialogProps } from './BulkTagDialog';

export { BulkMoveDialog } from './BulkMoveDialog';
export type { BulkMoveDialogProps, Property as BulkMoveProperty } from './BulkMoveDialog';
```

### Task 3.6.5: Integrate in ItemManager

**File:** `src/components/ItemManager/ItemManager.tsx`

```typescript
import { BulkActionsBar, BulkTagDialog, BulkMoveDialog } from './components/BulkActions';

function ItemManager({
  items,
  properties,
  config,
  onUpdateItem,
  ...props
}: ItemManagerProps) {
  const {
    selectedIds,
    selectedCount,
    getSelectedItems,
    clearSelection,
    exitSelectionMode,
  } = useItemSelection({ /* ... */ });

  // Move dialog state
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Determine if multi-property mode is active
  const isMultiPropertyMode = config?.multiPropertyMode || (properties?.length ?? 0) > 1;

  // Handle bulk move trigger
  const handleBulkMove = useCallback(() => {
    setShowMoveDialog(true);
  }, []);

  // Confirm move operation
  const handleMoveConfirm = useCallback(async (destinationPropertyId: string) => {
    const selectedItemsList = getSelectedItems(items);
    if (selectedItemsList.length === 0 || !destinationPropertyId) return;

    setBulkLoading(true);

    try {
      for (const item of selectedItemsList) {
        // Update item with new propertyId
        await onUpdateItem({
          ...item,
          propertyId: destinationPropertyId,
        } as ItemRecordExtended);
      }

      setShowMoveDialog(false);
      clearSelection();
    } finally {
      setBulkLoading(false);
    }
  }, [getSelectedItems, items, onUpdateItem, clearSelection]);

  return (
    <div className="flex flex-col h-full relative">
      {/* ... toolbar, grid/list ... */}

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedCount}
        onDelete={handleBulkDelete}
        onAddTag={handleBulkAddTag}
        onRemoveTag={handleBulkRemoveTag}
        onMoveToProperty={isMultiPropertyMode ? handleBulkMove : undefined}
        onExitSelection={exitSelectionMode}
        multiPropertyMode={isMultiPropertyMode}
        loading={bulkLoading}
      />

      {/* Bulk Move Dialog - only shown in multi-property mode */}
      {showMoveDialog && isMultiPropertyMode && properties && (
        <BulkMoveDialog
          selectedItems={getSelectedItems(items)}
          properties={properties}
          onConfirm={handleMoveConfirm}
          onCancel={() => setShowMoveDialog(false)}
          loading={bulkLoading}
        />
      )}
    </div>
  );
}
```

---

## 6. Visual Design Specifications

### 6.1 Modal Container

```typescript
// Modal backdrop
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
  {/* Modal content */}
  <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
    {/* ... */}
  </div>
</div>
```

### 6.2 Header Styling

```typescript
// Header with close button
<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
      <FolderInput className="w-5 h-5 text-blue-600" aria-hidden="true" />
    </div>
    <h2 id={titleId} className="text-lg font-semibold text-gray-900">
      Move {selectedItems.length} Item{selectedItems.length !== 1 ? 's' : ''} to Another Property
    </h2>
  </div>
  <button
    onClick={onCancel}
    disabled={loading}
    className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
    aria-label="Close dialog"
  >
    <X className="w-5 h-5 text-gray-500" />
  </button>
</div>
```

### 6.3 Property Selector

Following PropertySelector pattern:

```typescript
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">
    Destination property
  </label>
  <PropertyDropdown
    properties={availableProperties}
    selectedPropertyId={destinationPropertyId}
    onSelect={setDestinationPropertyId}
    disabled={loading}
    placeholder="Select destination property..."
  />
</div>
```

### 6.4 Footer Actions

```typescript
<div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
  <button
    type="button"
    onClick={onCancel}
    disabled={loading}
    className={cn(
      'px-4 py-2 rounded-lg text-sm font-medium',
      'text-gray-700 bg-white border border-gray-300',
      'hover:bg-gray-50 transition-colors',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    )}
  >
    Cancel
  </button>
  <button
    type="button"
    onClick={handleConfirmClick}
    disabled={loading || !destinationPropertyId}
    className={cn(
      'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
      'text-white bg-blue-600 hover:bg-blue-700',
      'transition-colors',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    )}
  >
    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
    Move {selectedItems.length} Item{selectedItems.length !== 1 ? 's' : ''}
  </button>
</div>
```

---

## 7. Accessibility Requirements

### 7.1 ARIA Attributes

```typescript
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby={titleId}
  className="..."
>
  <h2 id={titleId}>Move Items to Another Property</h2>

  {/* Property selector with proper labeling */}
  <label htmlFor={selectId}>Destination property</label>
  <button
    id={selectId}
    aria-expanded={isOpen}
    aria-haspopup="listbox"
    aria-label="Select destination property"
  />

  {/* Dropdown options */}
  <div role="listbox" aria-label="Property options">
    <div role="option" aria-selected={isSelected}>
      {/* Property option */}
    </div>
  </div>
</div>
```

### 7.2 Keyboard Navigation

| Key | Action |
|-----|--------|
| **Tab** | Move focus between interactive elements |
| **Escape** | Close dialog |
| **Enter** | Open dropdown (on button) / Select option (in dropdown) / Confirm move (on confirm button) |
| **ArrowUp/Down** | Navigate dropdown options |
| **Space** | Open dropdown / Select option |

### 7.3 Focus Management

- Focus moves to property selector when dialog opens
- Focus trapped within dialog while open
- Focus returns to trigger button (Move to... in BulkActionsBar) when dialog closes

---

## 8. Acceptance Criteria Mapping

| Criteria (from REQ-073) | Implementation |
|-------------------------|----------------|
| Bulk move action available when items selected in multi-property mode | BulkActionsBar shows "Move to..." button when `multiPropertyMode=true` |
| Dialog opens with property selector | `BulkMoveDialog` with `PropertyDropdown` component |
| Dialog displays preview of selected items | `ItemPreviewList` component shows first 5 items with source property |
| Users can select destination property | Dropdown with all available properties |
| Upon confirmation, items are transferred | `onConfirm` callback updates each item's `propertyId` |
| Bulk move not visible in single-property mode | Conditional rendering based on `multiPropertyMode` or `properties.length > 1` |
| Users can cancel without changes | Cancel button and X close button call `onCancel` |
| Confirmation shows item count | Confirm button shows "Move X Items" |

---

## 9. Testing Requirements

### 9.1 Unit Test Cases

| Test Case | Description |
|-----------|-------------|
| Renders with property dropdown | Dialog shows property selector |
| Shows correct item count | Header displays accurate selected item count |
| Shows item preview list | Preview shows item titles (max 5) |
| Property dropdown opens on click | Dropdown expands to show options |
| Property selection updates state | Selected property shown in button |
| Disables confirm when no property selected | Button disabled when `destinationPropertyId` empty |
| Calls onCancel when cancelled | Callback invoked on Cancel/X click |
| Calls onConfirm with property ID | Callback invoked with selected property ID |
| Keyboard navigation in dropdown | Arrow keys navigate options |
| Escape closes dialog | Pressing Escape calls onCancel |

### 9.2 Integration Test Cases

| Test Case | Description |
|-----------|-------------|
| Move flow end-to-end | Open → select property → confirm → items updated |
| Dialog only shows in multi-property mode | Hidden when single property or no properties |
| Items reflect new property after move | `propertyId` updated on all selected items |
| Selection cleared after move | All items deselected after successful move |
| Focus returns to trigger button | Focus management on close |

### 9.3 Accessibility Test Cases

| Test Case | Description |
|-----------|-------------|
| Dialog has correct role | `role="dialog"` with `aria-modal="true"` |
| Dropdown has correct ARIA | `aria-expanded`, `aria-haspopup`, `role="listbox"` |
| Keyboard navigation works | All controls accessible via keyboard |
| Screen reader labels | All elements have accessible names |
| Focus trapped in dialog | Tab cycles within dialog elements |

---

## 10. Performance Considerations

### 10.1 Memoization

```typescript
// Memoize expensive computations
const availableProperties = useMemo(() =>
  properties.filter(p => p.id !== currentPropertyId),
  [properties, currentPropertyId]
);

const selectedProperty = useMemo(() =>
  properties.find(p => p.id === destinationPropertyId),
  [properties, destinationPropertyId]
);

// Memoize callbacks
const handleConfirmClick = useCallback(() => {
  if (destinationPropertyId) {
    onConfirm(destinationPropertyId);
  }
}, [destinationPropertyId, onConfirm]);
```

### 10.2 Render Optimization

- Use `React.memo` for internal components if needed
- Limit preview list to MAX_PREVIEW_ITEMS (5)
- Avoid inline object/function creation in JSX

---

## 11. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Large property list slows dropdown | Low | Low | Limit visible options, add scroll |
| Many selected items slow preview | Low | Low | Limit preview to 5 items |
| Property not found after move | Low | Medium | Validate property exists before move |
| Focus management issues | Medium | Medium | Use focus trap or manual focus management |
| Bulk update performance | Low | Medium | Process updates sequentially, show progress |
| User moves items to same property | Low | Low | Filter out current property from options |

---

## 12. Implementation Sequence

1. **Create BulkMoveDialog component structure** (Task 3.6.1)
   - Set up file with imports, types, and skeleton
   - Create modal container with backdrop

2. **Implement Property Dropdown** (Task 3.6.2)
   - Build dropdown following PropertySelector pattern
   - Add keyboard navigation support
   - Handle selection state

3. **Implement Items Preview** (Task 3.6.3)
   - Create ItemPreviewList component
   - Show source property for each item
   - Handle "and X more" overflow

4. **Update BulkActions Index** (Task 3.6.4)
   - Export new component and types

5. **Integrate in ItemManager** (Task 3.6.5)
   - Add dialog state management
   - Create confirm handler
   - Wire up to BulkActionsBar

6. **Testing**
   - Unit tests for component behavior
   - Integration tests for full flow
   - Accessibility testing

---

## 13. Related Documents

- [Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md) - Phase 3, Task 3.6
- [BulkActionsBar](/docs/REQ-070-build-bulkactionsbar-component-overview.md) - Task 3.3 reference
- [BulkTagDialog](/docs/REQ-072-implement-bulktagdialog-overview.md) - Task 3.5 reference (similar pattern)
- [PropertySelector](/src/components/PropertySelector.tsx) - Property dropdown pattern reference
- [ConfirmationModal](/src/components/ConfirmationModal.tsx) - Modal pattern reference

---

## 14. Estimated Effort

| Task | Estimate |
|------|----------|
| Create component structure | 30 minutes |
| Implement property dropdown | 1.5 hours |
| Implement items preview | 45 minutes |
| Update exports | 15 minutes |
| Integrate in ItemManager | 1.5 hours |
| Unit tests | 1.5 hours |
| Integration tests | 1 hour |
| Accessibility testing | 30 minutes |
| **Total** | **7.5 hours** |

---

## Appendix A: Complete Component Implementation

```typescript
'use client';

/**
 * BulkMoveDialog Component
 *
 * Modal dialog for moving multiple selected items to a different property.
 * Only available when operating in multi-property mode. Allows users to
 * select a destination property and confirms the bulk move operation.
 *
 * @module ItemManager/components/BulkActions/BulkMoveDialog
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 3, Task 3.6)
 * @lastModified 2026-01-03 (REQ-073)
 */

import React, { useState, useMemo, useCallback, useRef, useEffect, useId } from 'react';
import { X, FolderInput, Building, ChevronDown, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ItemRecord } from '@/components/ItemCapture/ItemCapture.types';

// =============================================================================
// Type Definitions
// =============================================================================

export interface Property {
  id: string;
  name?: string;
  nickname?: string;
  address?: string;
  property_types?: {
    display_name: string;
  };
}

interface ItemRecordExtended extends ItemRecord {
  propertyId?: string;
}

export interface BulkMoveDialogProps {
  /** Array of selected items to move */
  selectedItems: ItemRecord[];

  /** Array of available properties to move items to */
  properties: Property[];

  /** Currently active property ID (to exclude from destination options) */
  currentPropertyId?: string;

  /** Callback when move is confirmed with destination property ID */
  onConfirm: (destinationPropertyId: string) => void;

  /** Callback when dialog is cancelled/closed */
  onCancel: () => void;

  /** Loading state during operation */
  loading?: boolean;

  /** Optional additional CSS classes */
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

const MAX_PREVIEW_ITEMS = 5;

// =============================================================================
// Internal Components
// =============================================================================

interface PropertyDropdownProps {
  properties: Property[];
  selectedPropertyId: string;
  onSelect: (propertyId: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

function PropertyDropdown({
  properties,
  selectedPropertyId,
  onSelect,
  disabled = false,
  placeholder = 'Select destination property...',
}: PropertyDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex(prev => (prev + 1) % properties.length);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(properties.length - 1);
        } else {
          setFocusedIndex(prev => (prev - 1 + properties.length) % properties.length);
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (focusedIndex >= 0 && focusedIndex < properties.length) {
          onSelect(properties[focusedIndex].id);
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
  }, [isOpen, properties, focusedIndex, onSelect]);

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  const displayName = selectedProperty?.nickname || selectedProperty?.name || placeholder;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        className={cn(
          'w-full px-4 py-3 bg-white border border-gray-300 rounded-lg',
          'flex items-center justify-between',
          'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors duration-200',
          isOpen && 'ring-2 ring-blue-500 border-transparent'
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select destination property"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Building className="w-5 h-5 text-gray-400 flex-shrink-0" aria-hidden="true" />
          <span className={cn(
            'truncate text-left',
            !selectedPropertyId && 'text-gray-500'
          )}>
            {displayName}
          </span>
        </div>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0',
            isOpen && 'transform rotate-180'
          )}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto py-1"
          role="listbox"
          aria-label="Property options"
        >
          {properties.length === 0 ? (
            <div className="px-4 py-3 text-gray-500 text-center">
              No properties available
            </div>
          ) : (
            properties.map((property, index) => {
              const isSelected = selectedPropertyId === property.id;
              const isFocused = focusedIndex === index;
              const displayText = property.nickname || property.name || property.id;

              return (
                <div
                  key={property.id}
                  className={cn(
                    'px-4 py-3 cursor-pointer transition-colors duration-150',
                    'flex items-center justify-between',
                    isFocused && 'bg-blue-50 text-blue-900',
                    isSelected && 'bg-blue-50 text-blue-900',
                    !isFocused && !isSelected && 'hover:bg-gray-50'
                  )}
                  onClick={() => {
                    onSelect(property.id);
                    setIsOpen(false);
                    setFocusedIndex(-1);
                  }}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Building className="w-5 h-5 text-gray-400 flex-shrink-0" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{displayText}</div>
                      {(property.address || property.property_types?.display_name) && (
                        <div className="text-xs text-gray-500 truncate">
                          {property.property_types?.display_name}
                          {property.address && ` • ${property.address}`}
                        </div>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2" aria-hidden="true" />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

interface ItemPreviewListProps {
  items: ItemRecord[];
  properties: Property[];
  maxDisplay?: number;
}

function ItemPreviewList({
  items,
  properties,
  maxDisplay = MAX_PREVIEW_ITEMS
}: ItemPreviewListProps) {
  const displayItems = items.slice(0, maxDisplay);
  const remainingCount = items.length - displayItems.length;

  const getPropertyName = (item: ItemRecord): string => {
    const propId = (item as ItemRecordExtended).propertyId;
    if (!propId) return 'Unknown';
    const prop = properties.find(p => p.id === propId);
    return prop?.nickname || prop?.name || 'Unknown';
  };

  return (
    <div className="mt-4">
      <p className="text-sm font-medium text-gray-700 mb-2">
        Items to move:
      </p>
      <ul className="space-y-2 text-sm text-gray-600 max-h-40 overflow-y-auto">
        {displayItems.map(item => (
          <li key={item.id} className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 mt-1.5" />
            <div className="min-w-0 flex-1">
              <span className="truncate block font-medium text-gray-900">{item.title}</span>
              <span className="text-xs text-gray-500">
                from: {getPropertyName(item)}
              </span>
            </div>
          </li>
        ))}
        {remainingCount > 0 && (
          <li className="text-gray-400 italic pl-3.5">
            (and {remainingCount} more...)
          </li>
        )}
      </ul>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function BulkMoveDialog({
  selectedItems,
  properties,
  currentPropertyId,
  onConfirm,
  onCancel,
  loading = false,
  className,
}: BulkMoveDialogProps) {
  const uniqueId = useId();
  const titleId = `bulk-move-title-${uniqueId}`;
  const selectLabelId = `bulk-move-select-label-${uniqueId}`;

  const [destinationPropertyId, setDestinationPropertyId] = useState<string>('');

  // Filter out current property from options
  const availableProperties = useMemo(() =>
    properties.filter(p => p.id !== currentPropertyId),
    [properties, currentPropertyId]
  );

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleConfirmClick = useCallback(() => {
    if (destinationPropertyId) {
      onConfirm(destinationPropertyId);
    }
  }, [destinationPropertyId, onConfirm]);

  const confirmDisabled = !destinationPropertyId;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <FolderInput className="w-5 h-5 text-blue-600" aria-hidden="true" />
            </div>
            <h2 id={titleId} className="text-lg font-semibold text-gray-900">
              Move {selectedItems.length} Item{selectedItems.length !== 1 ? 's' : ''} to Another Property
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {/* Property Selector */}
          <div className="space-y-2">
            <label id={selectLabelId} className="block text-sm font-medium text-gray-700">
              Destination property
            </label>
            {availableProperties.length === 0 ? (
              <p className="text-gray-500 italic text-sm">
                No other properties available to move items to.
              </p>
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
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium',
              'text-gray-700 bg-white border border-gray-300',
              'hover:bg-gray-50 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmClick}
            disabled={loading || confirmDisabled}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
              'text-white bg-blue-600 hover:bg-blue-700',
              'transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Move {selectedItems.length} Item{selectedItems.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BulkMoveDialog;
```

---

## Appendix B: Test File Template

```typescript
/**
 * BulkMoveDialog Component Tests
 *
 * @module ItemManager/components/BulkActions/__tests__/BulkMoveDialog.test
 * @lastModified 2026-01-03 (REQ-073)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BulkMoveDialog } from '../BulkMoveDialog';

const mockItems = [
  { id: '1', title: 'Coffee Maker', propertyId: 'prop-1', contentType: 'media' as const, media: [], createdAt: new Date() },
  { id: '2', title: 'Dishwasher', propertyId: 'prop-1', contentType: 'media' as const, media: [], createdAt: new Date() },
  { id: '3', title: 'Thermostat', propertyId: 'prop-2', contentType: 'media' as const, media: [], createdAt: new Date() },
];

const mockProperties = [
  { id: 'prop-1', nickname: 'Mountain Cabin', address: '123 Mountain Rd' },
  { id: 'prop-2', nickname: 'Beach House', address: '456 Ocean Ave' },
  { id: 'prop-3', nickname: 'Downtown Loft', address: '789 Main St' },
];

describe('BulkMoveDialog', () => {
  const defaultProps = {
    selectedItems: mockItems,
    properties: mockProperties,
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders dialog with property selector', () => {
      render(<BulkMoveDialog {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/Move 3 Items/)).toBeInTheDocument();
      expect(screen.getByText('Destination property')).toBeInTheDocument();
    });

    it('shows item preview list', () => {
      render(<BulkMoveDialog {...defaultProps} />);
      expect(screen.getByText('Coffee Maker')).toBeInTheDocument();
      expect(screen.getByText('Dishwasher')).toBeInTheDocument();
    });

    it('shows source property for each item', () => {
      render(<BulkMoveDialog {...defaultProps} />);
      expect(screen.getAllByText(/from: Mountain Cabin/).length).toBeGreaterThan(0);
    });

    it('filters out current property from options', () => {
      render(<BulkMoveDialog {...defaultProps} currentPropertyId="prop-1" />);

      // Open dropdown
      fireEvent.click(screen.getByLabelText('Select destination property'));

      // Current property should not be in options
      expect(screen.queryByRole('option', { name: /Mountain Cabin/ })).not.toBeInTheDocument();
      // Other properties should be available
      expect(screen.getByRole('option', { name: /Beach House/ })).toBeInTheDocument();
    });
  });

  describe('Property Selection', () => {
    it('opens dropdown on click', async () => {
      render(<BulkMoveDialog {...defaultProps} />);

      const button = screen.getByLabelText('Select destination property');
      await userEvent.click(button);

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('selects property on option click', async () => {
      render(<BulkMoveDialog {...defaultProps} />);

      await userEvent.click(screen.getByLabelText('Select destination property'));
      await userEvent.click(screen.getByText('Beach House'));

      expect(screen.getByText('Beach House')).toBeInTheDocument();
    });

    it('navigates with arrow keys', async () => {
      render(<BulkMoveDialog {...defaultProps} />);

      const button = screen.getByLabelText('Select destination property');
      button.focus();

      await userEvent.keyboard('{ArrowDown}');
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await userEvent.keyboard('{ArrowDown}{Enter}');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('disables confirm when no property selected', () => {
      render(<BulkMoveDialog {...defaultProps} />);
      expect(screen.getByText(/Move 3 Items/)).toBeDisabled();
    });

    it('enables confirm when property selected', async () => {
      render(<BulkMoveDialog {...defaultProps} />);

      await userEvent.click(screen.getByLabelText('Select destination property'));
      await userEvent.click(screen.getByText('Beach House'));

      expect(screen.getByText(/Move 3 Items/)).not.toBeDisabled();
    });

    it('calls onConfirm with property ID', async () => {
      render(<BulkMoveDialog {...defaultProps} />);

      await userEvent.click(screen.getByLabelText('Select destination property'));
      await userEvent.click(screen.getByText('Beach House'));
      await userEvent.click(screen.getByText(/Move 3 Items/));

      expect(defaultProps.onConfirm).toHaveBeenCalledWith('prop-2');
    });

    it('calls onCancel when Cancel clicked', async () => {
      render(<BulkMoveDialog {...defaultProps} />);
      await userEvent.click(screen.getByText('Cancel'));
      expect(defaultProps.onCancel).toHaveBeenCalled();
    });

    it('calls onCancel when X clicked', async () => {
      render(<BulkMoveDialog {...defaultProps} />);
      await userEvent.click(screen.getByLabelText('Close dialog'));
      expect(defaultProps.onCancel).toHaveBeenCalled();
    });

    it('calls onCancel on Escape key', () => {
      render(<BulkMoveDialog {...defaultProps} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(defaultProps.onCancel).toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('disables dropdown when loading', () => {
      render(<BulkMoveDialog {...defaultProps} loading={true} />);
      expect(screen.getByLabelText('Select destination property')).toBeDisabled();
    });

    it('disables confirm button when loading', async () => {
      render(<BulkMoveDialog {...defaultProps} loading={true} />);
      expect(screen.getByText(/Move 3 Items/)).toBeDisabled();
    });

    it('shows loading spinner in confirm button', () => {
      render(<BulkMoveDialog {...defaultProps} loading={true} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has correct dialog role and modal attribute', () => {
      render(<BulkMoveDialog {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('has labeled title', () => {
      render(<BulkMoveDialog {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });

    it('dropdown has correct ARIA attributes', async () => {
      render(<BulkMoveDialog {...defaultProps} />);
      const button = screen.getByLabelText('Select destination property');

      expect(button).toHaveAttribute('aria-haspopup', 'listbox');
      expect(button).toHaveAttribute('aria-expanded', 'false');

      await userEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Edge Cases', () => {
    it('shows message when no properties available', () => {
      render(<BulkMoveDialog {...defaultProps} properties={[]} />);
      expect(screen.getByText(/No other properties available/)).toBeInTheDocument();
    });

    it('handles single property in list', () => {
      render(<BulkMoveDialog {...defaultProps} properties={[mockProperties[0]]} />);

      fireEvent.click(screen.getByLabelText('Select destination property'));
      expect(screen.getByRole('option')).toBeInTheDocument();
    });

    it('truncates long item list with overflow message', () => {
      const manyItems = Array.from({ length: 10 }, (_, i) => ({
        id: `item-${i}`,
        title: `Item ${i}`,
        propertyId: 'prop-1',
        contentType: 'media' as const,
        media: [],
        createdAt: new Date(),
      }));

      render(<BulkMoveDialog {...defaultProps} selectedItems={manyItems} />);
      expect(screen.getByText(/and 5 more.../)).toBeInTheDocument();
    });
  });
});
```

---

## Appendix C: Type Extensions for ItemManager

If not already present in `ItemManager.types.ts`, add:

```typescript
/**
 * Extended ItemRecord with property assignment support.
 * Used when operating in multi-property mode.
 */
export interface ItemRecordExtended extends ItemRecord {
  /** Property ID for multi-property mode */
  propertyId?: string;
}

/**
 * Property definition for multi-property mode.
 * Matches the structure used by PropertySelector.
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
 * Props for BulkMoveDialog component.
 */
export interface BulkMoveDialogProps {
  selectedItems: ItemRecord[];
  properties: Property[];
  currentPropertyId?: string;
  onConfirm: (destinationPropertyId: string) => void;
  onCancel: () => void;
  loading?: boolean;
  className?: string;
}
```
