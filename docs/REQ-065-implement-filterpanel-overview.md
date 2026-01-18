# REQ-065: Implement FilterPanel - Technical Implementation Overview

**Document Created:** 2026-01-03 14:30:00
**Last Modified:** 2026-01-03 14:30:00
**Request Reference:** REQ-065 (Advanced Filter Panel for Multi-Criteria Item Filtering)
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 2 - Search, Filter & Sort
**Task ID:** 2.4

---

## 1. Executive Summary

This document provides the technical implementation breakdown for creating the FilterPanel component, the fourth task of Phase 2 in the ItemManager component implementation. This component enables users to refine item listings by multiple criteria including content type, tags, location, and property association.

### Scope

The FilterPanel component will:
- Provide content type filtering via checkbox/chip group
- Enable tag filtering with multi-select from existing tags
- Support location filtering via dropdown
- Enable property filtering for multi-property mode
- Implement a mobile-friendly collapsible panel design
- Support clearing individual filters or all filters at once
- Update results in real-time as filters are applied

### Dependencies

- **Requires Phase 1 Completion:** Task 1.1 (Directory Structure & Types) must be complete
- **Requires Task 2.1:** The `useItemSearch` hook must be available for filter application
- **Requires Task 2.2:** The `ItemToolbar` component provides the integration point
- **Parallel Work:** Can be developed in parallel with Task 2.3 (SearchInput) and Task 2.5 (SortMenu)

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
| Component Pattern | Client components with 'use client' | Established pattern |

### 2.2 Reference Patterns from Codebase

**Checkbox/Selection Pattern:** `/src/components/ItemSelectionList.tsx` (lines 256-261)

```typescript
<input
  type="checkbox"
  checked={isSelected}
  onChange={() => handleItemToggle(item.publicId)}
  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
/>
```

**Tag Chip Pattern:** `/src/components/ItemCapture/components/steps/MetadataStep.tsx` (lines 517-531)

```typescript
{(metadata.tags || []).map(tag => (
  <span
    key={tag}
    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm"
  >
    {tag}
    <button
      type="button"
      onClick={() => handleRemoveTag(tag)}
      className="p-1 hover:bg-blue-200 rounded-full transition-colors"
      aria-label={`Remove tag: ${tag}`}
    >
      <X className="w-3 h-3" />
    </button>
  </span>
))}
```

**Dropdown Pattern:** `/src/components/PropertySelector.tsx` (lines 204-295)

- Keyboard navigation (ArrowUp, ArrowDown, Enter, Escape)
- Click-outside handler via `useRef` and `useEffect`
- ARIA attributes: `aria-expanded`, `aria-haspopup="listbox"`, `aria-label`
- Multiple selection support with checkmarks

**Modal Pattern:** `/src/components/ConfirmationModal.tsx`

- Fixed backdrop: `fixed inset-0 bg-black bg-opacity-50`
- Centered card: `bg-white rounded-lg p-6`
- Z-index: `z-50`

### 2.3 Types from Implementation Plan

From `ItemManager.types.ts`:

```typescript
/**
 * Filter state structure.
 */
export interface FilterState {
  search?: string;
  contentTypes?: Array<'video' | 'image' | 'pdf' | 'text-only' | 'mixed'>;
  tags?: string[];
  locations?: string[];
  propertyIds?: string[];
}

/**
 * Content type options for filtering.
 */
export const CONTENT_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'video', label: 'Video' },
  { value: 'image', label: 'Photo' },
  { value: 'pdf', label: 'PDF' },
  { value: 'text-only', label: 'Text Only' },
  { value: 'mixed', label: 'Mixed' },
];
```

---

## 3. Implementation Approach

### 3.1 Component Architecture

The FilterPanel uses a collapsible panel pattern with multiple filter sections:

```
┌─────────────────────────────────────────────────────────────────┐
│                         FilterPanel                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Header:  Filters                              [Clear All]   ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Content Type:                                               ││
│  │  [✓] Video  [ ] Photo  [✓] PDF  [ ] Text  [ ] Mixed         ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Tags:                                                       ││
│  │  [ kitchen ] [ appliances ] [ + Add Tag ▼ ]                 ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Location:                                                   ││
│  │  [ Select location...                              ▼ ]      ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Property: (multi-property mode only)                        ││
│  │  [✓] Beach House  [ ] Mountain Cabin                        ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Mobile Footer:                                              ││
│  │  [    Apply Filters    ]        [  Clear All  ]             ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Mobile Behavior:**
- Panel collapses to a button showing active filter count
- Expands as a slide-up drawer on activation
- Touch-friendly filter chips with adequate spacing
- Footer buttons for Apply/Clear actions

**Desktop Behavior:**
- Inline expandable panel or persistent sidebar
- Real-time filter application (no Apply button needed)
- Horizontal chip layout for content types

### 3.2 Props Interface

```typescript
/**
 * Props for FilterPanel component.
 */
export interface FilterPanelProps {
  /** Current filter state */
  filters: FilterState;
  /** Callback when filters change */
  onFiltersChange: (filters: FilterState) => void;
  /** Callback to clear all filters */
  onClearFilters: () => void;
  /** Whether the panel is open (mobile) */
  isOpen?: boolean;
  /** Callback when panel open state changes */
  onOpenChange?: (isOpen: boolean) => void;
  /** Available tags extracted from items */
  availableTags: string[];
  /** Available locations extracted from items */
  availableLocations: string[];
  /** Available properties (multi-property mode) */
  properties?: Property[];
  /** Whether multi-property mode is enabled */
  multiPropertyMode?: boolean;
  /** Custom class names */
  classNames?: {
    container?: string;
    section?: string;
    chip?: string;
    dropdown?: string;
  };
  /** Custom labels for i18n */
  labels?: {
    title?: string;
    clearAll?: string;
    contentType?: string;
    tags?: string;
    location?: string;
    property?: string;
    applyFilters?: string;
    noTagsAvailable?: string;
    noLocationsAvailable?: string;
    selectLocation?: string;
  };
  /** Whether to use mobile layout */
  isMobile?: boolean;
  /** Disabled state */
  disabled?: boolean;
}
```

### 3.3 Component Structure

The FilterPanel consists of several sub-components:

1. **FilterPanelHeader** - Title and Clear All button
2. **ContentTypeFilter** - Checkbox/chip group for content types
3. **TagFilter** - Multi-select with chip display for tags
4. **LocationFilter** - Dropdown for location selection
5. **PropertyFilter** - Checkbox group for properties (multi-property mode)
6. **FilterPanelFooter** - Mobile Apply/Clear buttons

### 3.4 State Management

The FilterPanel receives filter state from parent and emits changes:

```typescript
// Filter change handling
const handleContentTypeToggle = (type: string) => {
  const current = filters.contentTypes || [];
  const updated = current.includes(type)
    ? current.filter(t => t !== type)
    : [...current, type];

  onFiltersChange({
    ...filters,
    contentTypes: updated.length > 0 ? updated : undefined,
  });
};

const handleTagAdd = (tag: string) => {
  const current = filters.tags || [];
  if (!current.includes(tag)) {
    onFiltersChange({
      ...filters,
      tags: [...current, tag],
    });
  }
};

const handleTagRemove = (tag: string) => {
  const current = filters.tags || [];
  const updated = current.filter(t => t !== tag);
  onFiltersChange({
    ...filters,
    tags: updated.length > 0 ? updated : undefined,
  });
};

const handleLocationChange = (location: string | undefined) => {
  onFiltersChange({
    ...filters,
    locations: location ? [location] : undefined,
  });
};

const handlePropertyToggle = (propertyId: string) => {
  const current = filters.propertyIds || [];
  const updated = current.includes(propertyId)
    ? current.filter(id => id !== propertyId)
    : [...current, propertyId];

  onFiltersChange({
    ...filters,
    propertyIds: updated.length > 0 ? updated : undefined,
  });
};
```

---

## 4. Authorized Files and Functions for Modification

### 4.1 Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/components/dialogs/FilterPanel.tsx` | Main filter panel component |
| `src/components/ItemManager/components/dialogs/ContentTypeFilter.tsx` | Content type filter section |
| `src/components/ItemManager/components/dialogs/TagFilter.tsx` | Tag filter section with multi-select |
| `src/components/ItemManager/components/dialogs/LocationFilter.tsx` | Location dropdown filter |
| `src/components/ItemManager/components/dialogs/PropertyFilter.tsx` | Property filter (multi-property mode) |

### 4.2 Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemManager/components/dialogs/index.ts` | Add barrel exports for new components |
| `src/components/ItemManager/components/ItemToolbar.tsx` | Integrate FilterPanel toggle button |
| `src/components/ItemManager/ItemManager.types.ts` | Add FilterPanelProps type if not present |
| `src/components/ItemManager/utils/constants.ts` | Add filter-related constants |

### 4.3 Functions/Components to Implement

| Component/Function | File | Purpose |
|-------------------|------|---------|
| `FilterPanel` | `FilterPanel.tsx` | Main orchestrator component |
| `ContentTypeFilter` | `ContentTypeFilter.tsx` | Content type checkbox/chip filter |
| `TagFilter` | `TagFilter.tsx` | Multi-select tag filter with suggestions |
| `LocationFilter` | `LocationFilter.tsx` | Location dropdown with search |
| `PropertyFilter` | `PropertyFilter.tsx` | Property checkbox filter |
| `useFilterExtraction` | Helper in FilterPanel | Extract available options from items |

### 4.4 Integration Points

The FilterPanel integrates with ItemToolbar:

```typescript
// In ItemToolbar.tsx
import { FilterPanel } from './dialogs/FilterPanel';

// Add filter button and panel
{enableFilters && (
  <>
    <button
      type="button"
      onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg border",
        hasActiveFilters
          ? "border-blue-500 bg-blue-50 text-blue-700"
          : "border-gray-300 text-gray-700 hover:bg-gray-50"
      )}
      aria-expanded={isFilterPanelOpen}
      aria-controls="filter-panel"
    >
      <Filter className="w-4 h-4" />
      <span>Filters</span>
      {activeFilterCount > 0 && (
        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500 text-white">
          {activeFilterCount}
        </span>
      )}
    </button>

    <FilterPanel
      id="filter-panel"
      isOpen={isFilterPanelOpen}
      onOpenChange={setIsFilterPanelOpen}
      filters={filters}
      onFiltersChange={onFiltersChange}
      onClearFilters={onClearFilters}
      availableTags={availableTags}
      availableLocations={availableLocations}
      properties={properties}
      multiPropertyMode={multiPropertyMode}
    />
  </>
)}
```

---

## 5. Detailed Task Breakdown

### Task 2.4.1: Create ContentTypeFilter Component

**File:** `src/components/ItemManager/components/dialogs/ContentTypeFilter.tsx`

**Implementation:**

```typescript
/**
 * ContentTypeFilter Component
 *
 * Checkbox/chip group for filtering by content type.
 * Supports multiple selection with visual feedback.
 *
 * @module ItemManager/components/dialogs/ContentTypeFilter
 */

'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const CONTENT_TYPE_OPTIONS = [
  { value: 'video', label: 'Video', icon: '🎥' },
  { value: 'image', label: 'Photo', icon: '📷' },
  { value: 'pdf', label: 'PDF', icon: '📄' },
  { value: 'text-only', label: 'Text Only', icon: '📝' },
  { value: 'mixed', label: 'Mixed', icon: '📦' },
] as const;

export interface ContentTypeFilterProps {
  /** Currently selected content types */
  selectedTypes: string[];
  /** Callback when selection changes */
  onSelectionChange: (types: string[]) => void;
  /** Whether the filter is disabled */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
  /** Label for the section */
  label?: string;
}

export function ContentTypeFilter({
  selectedTypes,
  onSelectionChange,
  disabled = false,
  className,
  label = 'Content Type',
}: ContentTypeFilterProps) {
  const handleToggle = (type: string) => {
    if (disabled) return;

    const isSelected = selectedTypes.includes(type);
    const updated = isSelected
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];

    onSelectionChange(updated);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Section Label */}
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Chip Grid */}
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label={label}
      >
        {CONTENT_TYPE_OPTIONS.map((option) => {
          const isSelected = selectedTypes.includes(option.value);

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleToggle(option.value)}
              disabled={disabled}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                "text-sm font-medium",
                "border transition-colors duration-150",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                isSelected
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              role="checkbox"
              aria-checked={isSelected}
              aria-label={option.label}
            >
              {isSelected && (
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              <span>{option.icon}</span>
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

### Task 2.4.2: Create TagFilter Component

**File:** `src/components/ItemManager/components/dialogs/TagFilter.tsx`

**Implementation:**

```typescript
/**
 * TagFilter Component
 *
 * Multi-select tag filter with existing tag suggestions.
 * Displays selected tags as chips and provides a dropdown for adding more.
 *
 * @module ItemManager/components/dialogs/TagFilter
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TagFilterProps {
  /** Currently selected tags */
  selectedTags: string[];
  /** All available tags from items */
  availableTags: string[];
  /** Callback when selection changes */
  onSelectionChange: (tags: string[]) => void;
  /** Whether the filter is disabled */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
  /** Label for the section */
  label?: string;
  /** Placeholder when no tags selected */
  placeholder?: string;
  /** Message when no tags available */
  noTagsMessage?: string;
}

export function TagFilter({
  selectedTags,
  availableTags,
  onSelectionChange,
  disabled = false,
  className,
  label = 'Tags',
  placeholder = 'Add tags...',
  noTagsMessage = 'No tags available',
}: TagFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter available tags (exclude already selected)
  const filteredTags = availableTags.filter(
    (tag) =>
      !selectedTags.includes(tag) &&
      tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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

  const handleAddTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      onSelectionChange([...selectedTags, tag]);
    }
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleRemoveTag = (tag: string) => {
    onSelectionChange(selectedTags.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    } else if (e.key === 'Enter' && filteredTags.length > 0) {
      e.preventDefault();
      handleAddTag(filteredTags[0]);
    }
  };

  return (
    <div className={cn("space-y-2", className)} ref={containerRef}>
      {/* Section Label */}
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                disabled={disabled}
                className={cn(
                  "p-0.5 rounded-full hover:bg-blue-200 transition-colors",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                aria-label={`Remove tag: ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Add Tag Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            "w-full flex items-center justify-between gap-2",
            "px-3 py-2 text-sm text-left",
            "border border-gray-300 rounded-lg bg-white",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            "transition-colors",
            disabled
              ? "bg-gray-50 text-gray-500 cursor-not-allowed"
              : "hover:bg-gray-50"
          )}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className="flex items-center gap-2 text-gray-500">
            <Plus className="w-4 h-4" />
            {placeholder}
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-gray-400 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {/* Search Input */}
            <div className="p-2 border-b border-gray-100">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search tags..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            {/* Tag Options */}
            <ul role="listbox" className="py-1">
              {filteredTags.length > 0 ? (
                filteredTags.map((tag) => (
                  <li key={tag}>
                    <button
                      type="button"
                      onClick={() => handleAddTag(tag)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                      role="option"
                      aria-selected={false}
                    >
                      + {tag}
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-sm text-gray-500 italic">
                  {searchQuery ? 'No matching tags' : noTagsMessage}
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Task 2.4.3: Create LocationFilter Component

**File:** `src/components/ItemManager/components/dialogs/LocationFilter.tsx`

**Implementation:**

```typescript
/**
 * LocationFilter Component
 *
 * Dropdown filter for location selection.
 * Supports single selection with search.
 *
 * @module ItemManager/components/dialogs/LocationFilter
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LocationFilterProps {
  /** Currently selected location */
  selectedLocation: string | undefined;
  /** All available locations from items */
  availableLocations: string[];
  /** Callback when selection changes */
  onSelectionChange: (location: string | undefined) => void;
  /** Whether the filter is disabled */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
  /** Label for the section */
  label?: string;
  /** Placeholder when no location selected */
  placeholder?: string;
  /** Message when no locations available */
  noLocationsMessage?: string;
}

export function LocationFilter({
  selectedLocation,
  availableLocations,
  onSelectionChange,
  disabled = false,
  className,
  label = 'Location',
  placeholder = 'Select location...',
  noLocationsMessage = 'No locations available',
}: LocationFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter locations by search query
  const filteredLocations = availableLocations.filter((location) =>
    location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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

  const handleSelect = (location: string) => {
    onSelectionChange(location);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectionChange(undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    } else if (e.key === 'Enter' && filteredLocations.length > 0) {
      e.preventDefault();
      handleSelect(filteredLocations[0]);
    }
  };

  return (
    <div className={cn("space-y-2", className)} ref={containerRef}>
      {/* Section Label */}
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Dropdown Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            "w-full flex items-center justify-between gap-2",
            "px-3 py-2 text-sm text-left",
            "border rounded-lg bg-white",
            selectedLocation
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            "transition-colors",
            disabled
              ? "bg-gray-50 text-gray-500 cursor-not-allowed"
              : "hover:bg-gray-50"
          )}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className={selectedLocation ? "text-gray-900" : "text-gray-500"}>
              {selectedLocation || placeholder}
            </span>
          </span>
          <div className="flex items-center gap-1">
            {selectedLocation && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                aria-label="Clear location"
              >
                <X className="w-3.5 h-3.5 text-gray-500" />
              </button>
            )}
            <ChevronDown
              className={cn(
                "w-4 h-4 text-gray-400 transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {/* Search Input */}
            <div className="p-2 border-b border-gray-100">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search locations..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            {/* Location Options */}
            <ul role="listbox" className="py-1">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((location) => (
                  <li key={location}>
                    <button
                      type="button"
                      onClick={() => handleSelect(location)}
                      className={cn(
                        "w-full px-4 py-2 text-left text-sm",
                        "hover:bg-gray-50 focus:bg-gray-50 focus:outline-none",
                        selectedLocation === location
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700"
                      )}
                      role="option"
                      aria-selected={selectedLocation === location}
                    >
                      {location}
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-sm text-gray-500 italic">
                  {searchQuery ? 'No matching locations' : noLocationsMessage}
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Task 2.4.4: Create PropertyFilter Component

**File:** `src/components/ItemManager/components/dialogs/PropertyFilter.tsx`

**Implementation:**

```typescript
/**
 * PropertyFilter Component
 *
 * Checkbox group for property filtering in multi-property mode.
 *
 * @module ItemManager/components/dialogs/PropertyFilter
 */

'use client';

import { Building, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Property } from '../../ItemManager.types';

export interface PropertyFilterProps {
  /** Currently selected property IDs */
  selectedPropertyIds: string[];
  /** All available properties */
  properties: Property[];
  /** Callback when selection changes */
  onSelectionChange: (propertyIds: string[]) => void;
  /** Whether the filter is disabled */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
  /** Label for the section */
  label?: string;
}

export function PropertyFilter({
  selectedPropertyIds,
  properties,
  onSelectionChange,
  disabled = false,
  className,
  label = 'Property',
}: PropertyFilterProps) {
  const handleToggle = (propertyId: string) => {
    if (disabled) return;

    const isSelected = selectedPropertyIds.includes(propertyId);
    const updated = isSelected
      ? selectedPropertyIds.filter(id => id !== propertyId)
      : [...selectedPropertyIds, propertyId];

    onSelectionChange(updated);
  };

  if (properties.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Section Label */}
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Property Checkboxes */}
      <div
        className="space-y-2"
        role="group"
        aria-label={label}
      >
        {properties.map((property) => {
          const isSelected = selectedPropertyIds.includes(property.id);

          return (
            <button
              key={property.id}
              type="button"
              onClick={() => handleToggle(property.id)}
              disabled={disabled}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg",
                "text-sm text-left",
                "border transition-colors duration-150",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                isSelected
                  ? "bg-blue-50 border-blue-500"
                  : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              role="checkbox"
              aria-checked={isSelected}
            >
              {/* Checkbox Indicator */}
              <div
                className={cn(
                  "w-5 h-5 rounded border-2 flex items-center justify-center",
                  "transition-colors",
                  isSelected
                    ? "bg-blue-500 border-blue-500"
                    : "border-gray-300"
                )}
              >
                {isSelected && (
                  <Check className="w-3 h-3 text-white" aria-hidden="true" />
                )}
              </div>

              {/* Property Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className={cn(
                    "truncate",
                    isSelected ? "text-blue-700 font-medium" : "text-gray-700"
                  )}>
                    {property.name}
                  </span>
                </div>
                {property.address && (
                  <p className="text-xs text-gray-500 truncate pl-6">
                    {property.address}
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
```

### Task 2.4.5: Create Main FilterPanel Component

**File:** `src/components/ItemManager/components/dialogs/FilterPanel.tsx`

**Implementation:**

```typescript
/**
 * FilterPanel Component
 *
 * Comprehensive filter panel with content type, tag, location,
 * and property filters. Supports mobile-friendly collapsible layout.
 *
 * @module ItemManager/components/dialogs/FilterPanel
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 2, Task 2.4)
 */

'use client';

import { useMemo } from 'react';
import { X, Filter, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FilterState, Property } from '../../ItemManager.types';
import { ContentTypeFilter } from './ContentTypeFilter';
import { TagFilter } from './TagFilter';
import { LocationFilter } from './LocationFilter';
import { PropertyFilter } from './PropertyFilter';

// ============================================================================
// Types
// ============================================================================

export interface FilterPanelProps {
  /** Unique ID for accessibility */
  id?: string;
  /** Current filter state */
  filters: FilterState;
  /** Callback when filters change */
  onFiltersChange: (filters: FilterState) => void;
  /** Callback to clear all filters */
  onClearFilters: () => void;
  /** Whether the panel is open (mobile) */
  isOpen?: boolean;
  /** Callback when panel open state changes */
  onOpenChange?: (isOpen: boolean) => void;
  /** Available tags extracted from items */
  availableTags: string[];
  /** Available locations extracted from items */
  availableLocations: string[];
  /** Available properties (multi-property mode) */
  properties?: Property[];
  /** Whether multi-property mode is enabled */
  multiPropertyMode?: boolean;
  /** Custom class names */
  classNames?: {
    container?: string;
    overlay?: string;
    panel?: string;
    section?: string;
  };
  /** Custom labels for i18n */
  labels?: {
    title?: string;
    clearAll?: string;
    contentType?: string;
    tags?: string;
    location?: string;
    property?: string;
    applyFilters?: string;
    close?: string;
  };
  /** Whether to use mobile layout */
  isMobile?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

// ============================================================================
// Component
// ============================================================================

/**
 * FilterPanel - Multi-criteria filter panel with mobile support.
 *
 * Features:
 * - Content type filtering (checkbox chips)
 * - Tag filtering (multi-select with suggestions)
 * - Location filtering (dropdown)
 * - Property filtering (multi-property mode)
 * - Mobile-friendly collapsible panel
 * - Clear all filters action
 * - Real-time filter application
 *
 * @example
 * <FilterPanel
 *   filters={filters}
 *   onFiltersChange={setFilters}
 *   onClearFilters={() => setFilters({})}
 *   availableTags={['kitchen', 'appliances']}
 *   availableLocations={['Kitchen', 'Living Room']}
 * />
 */
export function FilterPanel({
  id,
  filters,
  onFiltersChange,
  onClearFilters,
  isOpen = true,
  onOpenChange,
  availableTags,
  availableLocations,
  properties = [],
  multiPropertyMode = false,
  classNames,
  labels = {},
  isMobile = false,
  disabled = false,
}: FilterPanelProps) {
  // Merge default labels
  const mergedLabels = {
    title: 'Filters',
    clearAll: 'Clear All',
    contentType: 'Content Type',
    tags: 'Tags',
    location: 'Location',
    property: 'Property',
    applyFilters: 'Apply Filters',
    close: 'Close',
    ...labels,
  };

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.contentTypes?.length) count += filters.contentTypes.length;
    if (filters.tags?.length) count += filters.tags.length;
    if (filters.locations?.length) count += 1;
    if (filters.propertyIds?.length) count += filters.propertyIds.length;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  // Handle filter changes
  const handleContentTypesChange = (types: string[]) => {
    onFiltersChange({
      ...filters,
      contentTypes: types.length > 0 ? types as FilterState['contentTypes'] : undefined,
    });
  };

  const handleTagsChange = (tags: string[]) => {
    onFiltersChange({
      ...filters,
      tags: tags.length > 0 ? tags : undefined,
    });
  };

  const handleLocationChange = (location: string | undefined) => {
    onFiltersChange({
      ...filters,
      locations: location ? [location] : undefined,
    });
  };

  const handlePropertyIdsChange = (propertyIds: string[]) => {
    onFiltersChange({
      ...filters,
      propertyIds: propertyIds.length > 0 ? propertyIds : undefined,
    });
  };

  // Close panel handler
  const handleClose = () => {
    onOpenChange?.(false);
  };

  // Panel content
  const panelContent = (
    <div className={cn("space-y-6", classNames?.panel)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            {mergedLabels.title}
          </h3>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
              {activeFilterCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              disabled={disabled}
              className={cn(
                "flex items-center gap-1 px-2 py-1 text-sm",
                "text-gray-600 hover:text-gray-900",
                "rounded-md hover:bg-gray-100",
                "transition-colors",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <RotateCcw className="w-4 h-4" />
              {mergedLabels.clearAll}
            </button>
          )}

          {isMobile && onOpenChange && (
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label={mergedLabels.close}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Content Type Filter */}
      <ContentTypeFilter
        selectedTypes={filters.contentTypes || []}
        onSelectionChange={handleContentTypesChange}
        disabled={disabled}
        label={mergedLabels.contentType}
        className={classNames?.section}
      />

      {/* Tag Filter */}
      <TagFilter
        selectedTags={filters.tags || []}
        availableTags={availableTags}
        onSelectionChange={handleTagsChange}
        disabled={disabled}
        label={mergedLabels.tags}
        className={classNames?.section}
      />

      {/* Location Filter */}
      <LocationFilter
        selectedLocation={filters.locations?.[0]}
        availableLocations={availableLocations}
        onSelectionChange={handleLocationChange}
        disabled={disabled}
        label={mergedLabels.location}
        className={classNames?.section}
      />

      {/* Property Filter (multi-property mode only) */}
      {multiPropertyMode && properties.length > 0 && (
        <PropertyFilter
          selectedPropertyIds={filters.propertyIds || []}
          properties={properties}
          onSelectionChange={handlePropertyIdsChange}
          disabled={disabled}
          label={mergedLabels.property}
          className={classNames?.section}
        />
      )}
    </div>
  );

  // Mobile: Slide-up drawer
  if (isMobile) {
    if (!isOpen) return null;

    return (
      <>
        {/* Overlay */}
        <div
          className={cn(
            "fixed inset-0 bg-black/50 z-40",
            classNames?.overlay
          )}
          onClick={handleClose}
          aria-hidden="true"
        />

        {/* Drawer */}
        <div
          id={id}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${id}-title`}
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50",
            "bg-white rounded-t-2xl shadow-xl",
            "max-h-[85vh] overflow-y-auto",
            "p-4 pb-8",
            "animate-slide-up",
            classNames?.container
          )}
        >
          {/* Drag Handle */}
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

          {panelContent}

          {/* Mobile Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className={cn(
                "w-full py-3 px-4 rounded-lg",
                "bg-blue-600 text-white font-medium",
                "hover:bg-blue-700 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              )}
            >
              {mergedLabels.applyFilters}
            </button>
          </div>
        </div>
      </>
    );
  }

  // Desktop: Inline panel
  if (!isOpen) return null;

  return (
    <div
      id={id}
      className={cn(
        "bg-white border border-gray-200 rounded-lg shadow-sm",
        "p-4",
        classNames?.container
      )}
    >
      {panelContent}
    </div>
  );
}
```

### Task 2.4.6: Export from Barrel Files

**File:** `src/components/ItemManager/components/dialogs/index.ts`

Add exports:

```typescript
export { FilterPanel } from './FilterPanel';
export type { FilterPanelProps } from './FilterPanel';

export { ContentTypeFilter } from './ContentTypeFilter';
export type { ContentTypeFilterProps } from './ContentTypeFilter';

export { TagFilter } from './TagFilter';
export type { TagFilterProps } from './TagFilter';

export { LocationFilter } from './LocationFilter';
export type { LocationFilterProps } from './LocationFilter';

export { PropertyFilter } from './PropertyFilter';
export type { PropertyFilterProps } from './PropertyFilter';
```

---

## 6. Testing Requirements

### 6.1 Unit Test Cases

Create tests in `src/components/ItemManager/components/dialogs/__tests__/`:

| Component | Test Case | Description |
|-----------|-----------|-------------|
| ContentTypeFilter | Renders all options | All 5 content type options displayed |
| ContentTypeFilter | Toggle selection | Clicking toggles selection state |
| ContentTypeFilter | Multiple selection | Can select multiple types |
| ContentTypeFilter | Visual feedback | Selected items show checkmark and blue styling |
| TagFilter | Displays selected tags | Selected tags shown as chips |
| TagFilter | Removes tags | Click X removes tag from selection |
| TagFilter | Adds tags | Selecting from dropdown adds tag |
| TagFilter | Filters suggestions | Search filters available tags |
| TagFilter | Keyboard navigation | Enter selects first match |
| LocationFilter | Shows placeholder | Displays "Select location..." when empty |
| LocationFilter | Selects location | Clicking option updates selection |
| LocationFilter | Clears selection | Clear button removes selection |
| LocationFilter | Searches locations | Type filters options |
| PropertyFilter | Renders properties | All properties displayed as checkboxes |
| PropertyFilter | Toggle property | Clicking toggles checkbox |
| PropertyFilter | Shows address | Address displayed under name |
| FilterPanel | Renders all sections | All filter sections visible |
| FilterPanel | Counts active filters | Badge shows correct count |
| FilterPanel | Clears all filters | Clear All resets all filters |
| FilterPanel | Mobile drawer | Opens as drawer on mobile |
| FilterPanel | Closes on overlay click | Clicking overlay closes panel |

### 6.2 Manual Testing Checklist

| Test Case | Expected Behavior |
|-----------|-------------------|
| Select content type | Chip highlights with checkmark |
| Deselect content type | Chip returns to default state |
| Add tag from dropdown | Tag appears as chip above dropdown |
| Remove tag | Tag removed, dropdown updates |
| Search for tag | Only matching tags shown |
| Select location | Dropdown shows selected value |
| Clear location | Dropdown returns to placeholder |
| Toggle property | Checkbox animates on/off |
| Clear All | All filters reset to empty |
| Filter badge | Shows correct count of active filters |
| Mobile drawer | Slides up from bottom |
| Mobile overlay | Tapping outside closes drawer |
| Apply Filters button | Closes drawer on mobile |
| Keyboard navigation | Tab moves between sections |
| Screen reader | Announces filter changes |

### 6.3 Visual Testing

| Viewport | Expected Behavior |
|----------|-------------------|
| Mobile (< 640px) | Slide-up drawer, stacked layout |
| Tablet (640px - 1024px) | Inline panel, 2-column chip layout |
| Desktop (> 1024px) | Inline panel with sidebar style |

---

## 7. Acceptance Criteria

From REQ-065:

- [ ] Filter panel displays all available filter categories (content type, tags, location, property)
- [ ] Content type filter allows selecting multiple types simultaneously
- [ ] Tag filter displays all existing tags and supports multi-selection
- [ ] Location filter presents available locations in a dropdown format
- [ ] Property filter enables filtering by one or multiple properties
- [ ] Applied filters are visually indicated with the ability to remove individual filters
- [ ] Filtered results update immediately when filters are applied or removed
- [ ] A "Clear All" action removes all active filters and returns to unfiltered view
- [ ] On mobile devices, the filter panel collapses to preserve screen space and expands when activated
- [ ] Filter panel state persists during the user session when navigating between views
- [ ] Filter combinations work correctly together (AND logic)

### Additional Technical Criteria:

- [ ] Component follows established patterns from PropertySelector.tsx and MetadataStep.tsx
- [ ] Accessible with proper ARIA labels and keyboard support
- [ ] Touch targets meet 44x44px minimum size on mobile
- [ ] Filter chip styling matches existing codebase patterns
- [ ] Dropdown closes on outside click
- [ ] Smooth transitions and animations

---

## 8. Integration Notes

### 8.1 Data Flow

```
ItemManager (parent)
    │
    ├─── useItemManagerState
    │         │
    │         ├─── state.filters (FilterState)
    │         │
    │         └─── dispatch({ type: 'SET_FILTERS', payload: ... })
    │
    ├─── ItemToolbar
    │         │
    │         ├─── Filter Toggle Button
    │         │         │
    │         │         └─── Opens FilterPanel
    │         │
    │         └─── FilterPanel
    │                  │
    │                  ├─── ContentTypeFilter
    │                  │         └─── onSelectionChange → onFiltersChange
    │                  │
    │                  ├─── TagFilter
    │                  │         └─── onSelectionChange → onFiltersChange
    │                  │
    │                  ├─── LocationFilter
    │                  │         └─── onSelectionChange → onFiltersChange
    │                  │
    │                  └─── PropertyFilter (if multiPropertyMode)
    │                            └─── onSelectionChange → onFiltersChange
    │
    └─── useItemSearch
              │
              └─── Uses state.filters to filter items
```

### 8.2 Relationship to Other Phase 2 Tasks

| Task | Relationship |
|------|--------------|
| 2.1 (useItemSearch) | Consumes the filter state to filter items |
| 2.2 (ItemToolbar) | Contains the Filter button and FilterPanel |
| 2.3 (SearchInput) | Parallel - both affect filtered results |
| 2.5 (SortMenu) | Parallel - operates on filtered results |
| 2.6 (Utilities) | May use filter constants and utilities |

### 8.3 Extracting Available Options

The parent component should extract available tags and locations from items:

```typescript
// In ItemManager or useItemSearch hook
const availableTags = useMemo(() => {
  const tagSet = new Set<string>();
  items.forEach(item => {
    item.tags?.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}, [items]);

const availableLocations = useMemo(() => {
  const locationSet = new Set<string>();
  items.forEach(item => {
    if (item.location) locationSet.add(item.location);
  });
  return Array.from(locationSet).sort();
}, [items]);
```

### 8.4 Mobile Detection

The FilterPanel can receive `isMobile` as a prop, or detect via CSS/media query:

```typescript
// Option 1: Prop-based
<FilterPanel isMobile={windowWidth < 640} ... />

// Option 2: CSS-based with responsive classes
// Panel uses different layout at different breakpoints
```

---

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Large tag/location lists | Medium | Medium | Add search/filter to dropdowns; virtualize if >100 items |
| Complex filter state | Low | Medium | Clear precedence in filter change handlers |
| Mobile drawer z-index conflicts | Low | Medium | Use z-50; test with other modals |
| Performance with many filters | Low | Low | Memoize filter calculations |
| Touch target sizing | Low | Medium | Ensure minimum 44x44px targets |
| Dropdown positioning on mobile | Low | Low | Use fixed positioning in mobile drawer |

---

## 10. Appendix: CSS Animation for Mobile Drawer

Add to global CSS or component:

```css
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
```

Or use Tailwind animation:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
};
```

---

## 11. Appendix: File Structure After Implementation

```
src/components/ItemManager/
├── components/
│   ├── dialogs/
│   │   ├── index.ts                      # Updated: add FilterPanel exports
│   │   ├── FilterPanel.tsx               # NEW: Main filter panel
│   │   ├── ContentTypeFilter.tsx         # NEW: Content type chips
│   │   ├── TagFilter.tsx                 # NEW: Tag multi-select
│   │   ├── LocationFilter.tsx            # NEW: Location dropdown
│   │   ├── PropertyFilter.tsx            # NEW: Property checkboxes
│   │   ├── ConfirmDeleteDialog.tsx       # (Created in Phase 3)
│   │   ├── SortMenu.tsx                  # (Created in Task 2.5)
│   │   └── __tests__/
│   │       ├── FilterPanel.test.tsx      # NEW: Integration tests
│   │       ├── ContentTypeFilter.test.tsx # NEW: Unit tests
│   │       ├── TagFilter.test.tsx        # NEW: Unit tests
│   │       ├── LocationFilter.test.tsx   # NEW: Unit tests
│   │       └── PropertyFilter.test.tsx   # NEW: Unit tests
│   ├── ItemToolbar.tsx                   # Updated: integrate FilterPanel
│   └── ...
├── hooks/
│   └── useItemSearch.ts                  # (Created in Task 2.1)
├── utils/
│   └── constants.ts                      # Updated: filter constants
└── ItemManager.types.ts                  # (Created in Phase 1)
```

---

## 12. References

- [Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md) - Phase 2, Task 2.4
- [PropertySelector](/src/components/PropertySelector.tsx) - Dropdown pattern reference
- [MetadataStep](/src/components/ItemCapture/components/steps/MetadataStep.tsx) - Tag chip pattern
- [ItemSelectionList](/src/components/ItemSelectionList.tsx) - Checkbox pattern
- [ItemToolbar Overview](/docs/REQ-063-build-itemtoolbar-component-overview.md) - Container component
- [useItemSearch Overview](/docs/REQ-062-create-useitemsearch-hook-overview.md) - Search hook documentation
- [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility guidelines
