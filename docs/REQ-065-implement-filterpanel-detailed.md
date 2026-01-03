# REQ-065: Implement FilterPanel - Detailed Task Breakdown

**Document Created:** 2026-01-03 17:45:00
**Last Modified:** 2026-01-03 17:45:00
**Request Reference:** REQ-065 (Advanced Filter Panel for Multi-Criteria Item Filtering)
**Overview Document:** `/docs/REQ-065-implement-filterpanel-overview.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 2 - Search, Filter & Sort
**Task ID:** 2.4

---

## Table of Contents

1. [Summary](#1-summary)
2. [Prerequisites](#2-prerequisites)
3. [Authorized Files](#3-authorized-files)
4. [Task Breakdown](#4-task-breakdown)
5. [Acceptance Criteria Checklist](#5-acceptance-criteria-checklist)
6. [Testing Summary](#6-testing-summary)

---

## 1. Summary

This document provides granular, implementation-ready tasks for building the FilterPanel component. Each task is scoped to approximately 1 story point (a few hours of focused work) and includes verification steps.

The FilterPanel enables multi-criteria filtering of items by:
- Content type (video, image, pdf, text-only, mixed)
- Tags (multi-select from existing tags)
- Location (dropdown selection)
- Property (multi-property mode only)

---

## 2. Prerequisites

Before starting implementation, ensure:

- [ ] Phase 1 Task 1.1 (Directory Structure & Types) is complete
- [ ] `src/components/ItemManager/ItemManager.types.ts` exists with `FilterState` and `Property` types
- [ ] `src/components/ItemManager/components/dialogs/` directory exists
- [ ] Task 2.1 (`useItemSearch` hook) is available or in progress
- [ ] Task 2.2 (`ItemToolbar` component) is available for integration

**If prerequisites are not met:** Create the required directories and stub types before proceeding.

---

## 3. Authorized Files

### 3.1 Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/components/dialogs/ContentTypeFilter.tsx` | Content type checkbox/chip filter |
| `src/components/ItemManager/components/dialogs/TagFilter.tsx` | Multi-select tag filter with suggestions |
| `src/components/ItemManager/components/dialogs/LocationFilter.tsx` | Location dropdown filter |
| `src/components/ItemManager/components/dialogs/PropertyFilter.tsx` | Property checkbox filter (multi-property mode) |
| `src/components/ItemManager/components/dialogs/FilterPanel.tsx` | Main orchestrator filter panel component |

### 3.2 Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemManager/components/dialogs/index.ts` | Add barrel exports for new filter components |
| `src/components/ItemManager/ItemManager.types.ts` | Add `FilterPanelProps` and related types if not present |
| `src/components/ItemManager/utils/constants.ts` | Add `CONTENT_TYPE_OPTIONS` constant if not present |

---

## 4. Task Breakdown

### Task 2.4.1: Create ContentTypeFilter Component

**Objective:** Build a checkbox/chip group component for filtering by content type.

**File:** `src/components/ItemManager/components/dialogs/ContentTypeFilter.tsx`

**Estimated Effort:** 1-2 hours

#### Implementation Steps:

1. **Create the component file** with the following structure:
   ```typescript
   'use client';

   import { Check } from 'lucide-react';
   import { cn } from '@/lib/utils';
   ```

2. **Define the content type options constant:**
   ```typescript
   const CONTENT_TYPE_OPTIONS = [
     { value: 'video', label: 'Video', icon: '🎥' },
     { value: 'image', label: 'Photo', icon: '📷' },
     { value: 'pdf', label: 'PDF', icon: '📄' },
     { value: 'text-only', label: 'Text Only', icon: '📝' },
     { value: 'mixed', label: 'Mixed', icon: '📦' },
   ] as const;
   ```

3. **Define the props interface:**
   ```typescript
   export interface ContentTypeFilterProps {
     selectedTypes: string[];
     onSelectionChange: (types: string[]) => void;
     disabled?: boolean;
     className?: string;
     label?: string;
   }
   ```

4. **Implement the component:**
   - Render a section label
   - Render a flex-wrap container with `role="group"` and `aria-label`
   - Map over content type options to create toggle buttons
   - Each button should:
     - Use `role="checkbox"` and `aria-checked`
     - Show a checkmark icon when selected
     - Apply blue highlight styling when selected
     - Call `onSelectionChange` with updated array on click

5. **Implement the toggle handler:**
   ```typescript
   const handleToggle = (type: string) => {
     if (disabled) return;
     const isSelected = selectedTypes.includes(type);
     const updated = isSelected
       ? selectedTypes.filter(t => t !== type)
       : [...selectedTypes, type];
     onSelectionChange(updated);
   };
   ```

#### Verification Steps:

- [ ] Component renders all 5 content type options
- [ ] Clicking an unselected chip adds it to selection (chip shows checkmark, blue styling)
- [ ] Clicking a selected chip removes it from selection (chip returns to default styling)
- [ ] Multiple chips can be selected simultaneously
- [ ] `disabled` prop prevents all interactions
- [ ] Component is keyboard accessible (Tab to navigate, Space/Enter to toggle)
- [ ] TypeScript compiles without errors
- [ ] No console errors or warnings

---

### Task 2.4.2: Create TagFilter Component

**Objective:** Build a multi-select tag filter with dropdown suggestions and removable chips.

**File:** `src/components/ItemManager/components/dialogs/TagFilter.tsx`

**Estimated Effort:** 2-3 hours

#### Implementation Steps:

1. **Create the component file** with imports:
   ```typescript
   'use client';

   import { useState, useRef, useEffect } from 'react';
   import { X, ChevronDown, Plus } from 'lucide-react';
   import { cn } from '@/lib/utils';
   ```

2. **Define the props interface:**
   ```typescript
   export interface TagFilterProps {
     selectedTags: string[];
     availableTags: string[];
     onSelectionChange: (tags: string[]) => void;
     disabled?: boolean;
     className?: string;
     label?: string;
     placeholder?: string;
     noTagsMessage?: string;
   }
   ```

3. **Implement internal state:**
   - `isOpen` (boolean): Whether dropdown is visible
   - `searchQuery` (string): Filter text for tag suggestions
   - `containerRef` (ref): For click-outside detection
   - `inputRef` (ref): For auto-focus when dropdown opens

4. **Implement filtered tags logic:**
   ```typescript
   const filteredTags = availableTags.filter(
     (tag) =>
       !selectedTags.includes(tag) &&
       tag.toLowerCase().includes(searchQuery.toLowerCase())
   );
   ```

5. **Implement click-outside handler:**
   ```typescript
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
   ```

6. **Implement add/remove handlers:**
   ```typescript
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
   ```

7. **Implement keyboard navigation:**
   - `Escape`: Close dropdown, clear search
   - `Enter`: Select first matching tag if available

8. **Render structure:**
   - Section label
   - Selected tags as removable chips (with X button)
   - "Add tags..." dropdown button
   - Dropdown menu with:
     - Search input (autofocus)
     - Filtered tag list with click-to-add
     - Empty state message when no matches

#### Verification Steps:

- [ ] Component renders with section label
- [ ] Selected tags display as blue chips with X buttons
- [ ] Clicking X on a chip removes that tag
- [ ] Clicking "Add tags..." button opens dropdown
- [ ] Dropdown shows search input and available (unselected) tags
- [ ] Typing in search filters the available tags list
- [ ] Clicking a tag in dropdown adds it and closes dropdown
- [ ] Pressing Enter selects the first matching tag
- [ ] Pressing Escape closes dropdown
- [ ] Clicking outside dropdown closes it
- [ ] Empty state shows when no tags match search or no tags available
- [ ] TypeScript compiles without errors

---

### Task 2.4.3: Create LocationFilter Component

**Objective:** Build a dropdown filter for single location selection with search.

**File:** `src/components/ItemManager/components/dialogs/LocationFilter.tsx`

**Estimated Effort:** 2-3 hours

#### Implementation Steps:

1. **Create the component file** with imports:
   ```typescript
   'use client';

   import { useState, useRef, useEffect } from 'react';
   import { ChevronDown, X, MapPin } from 'lucide-react';
   import { cn } from '@/lib/utils';
   ```

2. **Define the props interface:**
   ```typescript
   export interface LocationFilterProps {
     selectedLocation: string | undefined;
     availableLocations: string[];
     onSelectionChange: (location: string | undefined) => void;
     disabled?: boolean;
     className?: string;
     label?: string;
     placeholder?: string;
     noLocationsMessage?: string;
   }
   ```

3. **Implement internal state:**
   - `isOpen` (boolean)
   - `searchQuery` (string)
   - `containerRef` (ref)

4. **Implement filtered locations:**
   ```typescript
   const filteredLocations = availableLocations.filter((location) =>
     location.toLowerCase().includes(searchQuery.toLowerCase())
   );
   ```

5. **Implement click-outside handler** (same pattern as TagFilter)

6. **Implement selection handlers:**
   ```typescript
   const handleSelect = (location: string) => {
     onSelectionChange(location);
     setIsOpen(false);
     setSearchQuery('');
   };

   const handleClear = (e: React.MouseEvent) => {
     e.stopPropagation();
     onSelectionChange(undefined);
   };
   ```

7. **Render structure:**
   - Section label
   - Dropdown button showing:
     - MapPin icon
     - Selected location OR placeholder text
     - Clear button (X) when location is selected
     - ChevronDown icon (rotates when open)
   - Dropdown menu with:
     - Search input (autofocus)
     - Location list with click-to-select
     - Selected location highlighted
     - Empty state when no matches

8. **Apply visual styling:**
   - Button border turns blue when a location is selected
   - Selected option in dropdown has blue background

#### Verification Steps:

- [ ] Component renders with section label and placeholder
- [ ] Clicking button opens dropdown
- [ ] Dropdown shows search input and location list
- [ ] Typing in search filters locations
- [ ] Clicking a location selects it and closes dropdown
- [ ] Selected location displays in button with blue styling
- [ ] Clear (X) button appears when location is selected
- [ ] Clicking X clears the selection (shows placeholder again)
- [ ] Clicking outside closes dropdown
- [ ] Pressing Escape closes dropdown
- [ ] Selected location is highlighted in dropdown list
- [ ] TypeScript compiles without errors

---

### Task 2.4.4: Create PropertyFilter Component

**Objective:** Build a checkbox group for filtering by property in multi-property mode.

**File:** `src/components/ItemManager/components/dialogs/PropertyFilter.tsx`

**Estimated Effort:** 1-2 hours

#### Implementation Steps:

1. **Create the component file** with imports:
   ```typescript
   'use client';

   import { Building, Check } from 'lucide-react';
   import { cn } from '@/lib/utils';
   import type { Property } from '../../ItemManager.types';
   ```

2. **Define the props interface:**
   ```typescript
   export interface PropertyFilterProps {
     selectedPropertyIds: string[];
     properties: Property[];
     onSelectionChange: (propertyIds: string[]) => void;
     disabled?: boolean;
     className?: string;
     label?: string;
   }
   ```

3. **Implement toggle handler:**
   ```typescript
   const handleToggle = (propertyId: string) => {
     if (disabled) return;
     const isSelected = selectedPropertyIds.includes(propertyId);
     const updated = isSelected
       ? selectedPropertyIds.filter(id => id !== propertyId)
       : [...selectedPropertyIds, propertyId];
     onSelectionChange(updated);
   };
   ```

4. **Handle empty state:**
   ```typescript
   if (properties.length === 0) {
     return null;
   }
   ```

5. **Render structure:**
   - Section label
   - Property list with `role="group"` and `aria-label`
   - Each property as a button with:
     - Checkbox indicator (filled when selected)
     - Building icon
     - Property name (truncated if long)
     - Property address (optional, smaller text)
     - `role="checkbox"` and `aria-checked`

6. **Apply visual styling:**
   - Selected property: blue background, blue border
   - Unselected: white background, gray border
   - Checkbox indicator: blue fill with white checkmark when selected

#### Verification Steps:

- [ ] Component renders nothing when `properties` array is empty
- [ ] Component renders section label and property list when properties exist
- [ ] Each property shows name, optional address, and checkbox indicator
- [ ] Clicking a property toggles its selection state
- [ ] Multiple properties can be selected
- [ ] Selected properties have blue styling and filled checkbox
- [ ] `disabled` prop prevents all interactions
- [ ] TypeScript compiles without errors

---

### Task 2.4.5: Create FilterPanel Component (Main Orchestrator)

**Objective:** Build the main FilterPanel component that composes all filter sub-components with mobile drawer support.

**File:** `src/components/ItemManager/components/dialogs/FilterPanel.tsx`

**Estimated Effort:** 3-4 hours

#### Implementation Steps:

1. **Create the component file** with imports:
   ```typescript
   'use client';

   import { useMemo } from 'react';
   import { X, Filter, RotateCcw } from 'lucide-react';
   import { cn } from '@/lib/utils';
   import type { FilterState, Property } from '../../ItemManager.types';
   import { ContentTypeFilter } from './ContentTypeFilter';
   import { TagFilter } from './TagFilter';
   import { LocationFilter } from './LocationFilter';
   import { PropertyFilter } from './PropertyFilter';
   ```

2. **Define the props interface:**
   ```typescript
   export interface FilterPanelProps {
     id?: string;
     filters: FilterState;
     onFiltersChange: (filters: FilterState) => void;
     onClearFilters: () => void;
     isOpen?: boolean;
     onOpenChange?: (isOpen: boolean) => void;
     availableTags: string[];
     availableLocations: string[];
     properties?: Property[];
     multiPropertyMode?: boolean;
     classNames?: {
       container?: string;
       overlay?: string;
       panel?: string;
       section?: string;
     };
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
     isMobile?: boolean;
     disabled?: boolean;
   }
   ```

3. **Implement active filter count calculation:**
   ```typescript
   const activeFilterCount = useMemo(() => {
     let count = 0;
     if (filters.contentTypes?.length) count += filters.contentTypes.length;
     if (filters.tags?.length) count += filters.tags.length;
     if (filters.locations?.length) count += 1;
     if (filters.propertyIds?.length) count += filters.propertyIds.length;
     return count;
   }, [filters]);

   const hasActiveFilters = activeFilterCount > 0;
   ```

4. **Implement filter change handlers:**
   ```typescript
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
   ```

5. **Build panel content (shared between mobile/desktop):**
   - Header with Filter icon, title, active count badge
   - "Clear All" button (visible when hasActiveFilters)
   - Close button (mobile only)
   - ContentTypeFilter component
   - TagFilter component
   - LocationFilter component
   - PropertyFilter component (only if `multiPropertyMode && properties.length > 0`)

6. **Implement mobile drawer layout:**
   ```typescript
   if (isMobile) {
     if (!isOpen) return null;

     return (
       <>
         {/* Overlay */}
         <div
           className="fixed inset-0 bg-black/50 z-40"
           onClick={handleClose}
           aria-hidden="true"
         />

         {/* Drawer */}
         <div
           role="dialog"
           aria-modal="true"
           className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl max-h-[85vh] overflow-y-auto p-4 pb-8 animate-slide-up"
         >
           {/* Drag handle */}
           <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

           {panelContent}

           {/* Mobile footer with Apply button */}
           <div className="mt-6 pt-4 border-t border-gray-200">
             <button
               type="button"
               onClick={handleClose}
               className="w-full py-3 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
             >
               {labels.applyFilters}
             </button>
           </div>
         </div>
       </>
     );
   }
   ```

7. **Implement desktop inline layout:**
   ```typescript
   if (!isOpen) return null;

   return (
     <div
       id={id}
       className="bg-white border border-gray-200 rounded-lg shadow-sm p-4"
     >
       {panelContent}
     </div>
   );
   ```

8. **Ensure CSS animation is available** (add to Tailwind config or inline):
   ```css
   @keyframes slide-up {
     from { transform: translateY(100%); opacity: 0; }
     to { transform: translateY(0); opacity: 1; }
   }
   .animate-slide-up { animation: slide-up 0.3s ease-out; }
   ```

#### Verification Steps:

- [ ] Component renders all filter sections (content type, tags, location)
- [ ] PropertyFilter renders only when `multiPropertyMode` is true and properties exist
- [ ] Active filter count badge shows correct number
- [ ] "Clear All" button appears when any filters are active
- [ ] "Clear All" button calls `onClearFilters`
- [ ] Filter changes propagate to parent via `onFiltersChange`
- [ ] Desktop: Renders as inline panel when `isOpen` is true
- [ ] Mobile: Renders as slide-up drawer with overlay when `isMobile` and `isOpen`
- [ ] Mobile: Clicking overlay closes drawer
- [ ] Mobile: "Apply Filters" button closes drawer
- [ ] Mobile: Close (X) button in header closes drawer
- [ ] TypeScript compiles without errors

---

### Task 2.4.6: Update Barrel Exports

**Objective:** Export all new components from the dialogs index file.

**File:** `src/components/ItemManager/components/dialogs/index.ts`

**Estimated Effort:** 15 minutes

#### Implementation Steps:

1. **Add exports to the barrel file:**
   ```typescript
   // Filter Panel Components
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

2. **If the index.ts file doesn't exist, create it** with the above exports.

#### Verification Steps:

- [ ] All 5 components are exported from index.ts
- [ ] All 5 prop types are exported from index.ts
- [ ] Importing from `./dialogs` works correctly
- [ ] TypeScript compiles without errors

---

### Task 2.4.7: Add Slide-Up Animation to Tailwind Config (Optional)

**Objective:** Ensure the `animate-slide-up` class works for mobile drawer animation.

**File:** `tailwind.config.js` OR use inline CSS in FilterPanel

**Estimated Effort:** 15 minutes

#### Implementation Steps:

**Option A: Add to Tailwind config**
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

**Option B: Add inline style in FilterPanel**
```typescript
// Add to FilterPanel.tsx
<style jsx>{`
  @keyframes slide-up {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  .animate-slide-up { animation: slide-up 0.3s ease-out; }
`}</style>
```

**Option C: Add to globals.css**
```css
/* src/app/globals.css */
@keyframes slide-up {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.animate-slide-up { animation: slide-up 0.3s ease-out; }
```

#### Verification Steps:

- [ ] Mobile drawer animates smoothly when opening
- [ ] No CSS errors in console

---

### Task 2.4.8: Unit Tests for ContentTypeFilter

**Objective:** Create unit tests for ContentTypeFilter component.

**File:** `src/components/ItemManager/components/dialogs/__tests__/ContentTypeFilter.test.tsx`

**Estimated Effort:** 1-2 hours

#### Implementation Steps:

1. **Create test file** with Jest/React Testing Library setup

2. **Test cases to implement:**
   - Renders all 5 content type options
   - Shows checkmark on selected types
   - Clicking toggles selection state
   - Supports multiple selections
   - Calls onSelectionChange with correct array
   - Disabled state prevents clicks
   - Has correct ARIA attributes

#### Verification Steps:

- [ ] All tests pass
- [ ] Test coverage for main functionality

---

### Task 2.4.9: Unit Tests for TagFilter

**Objective:** Create unit tests for TagFilter component.

**File:** `src/components/ItemManager/components/dialogs/__tests__/TagFilter.test.tsx`

**Estimated Effort:** 1-2 hours

#### Implementation Steps:

1. **Create test file** with Jest/React Testing Library setup

2. **Test cases to implement:**
   - Renders selected tags as chips
   - Removing a tag calls onSelectionChange
   - Opening dropdown shows available tags
   - Search filters available tags
   - Selecting a tag adds it to selection
   - Pressing Escape closes dropdown
   - Clicking outside closes dropdown
   - Shows empty state when no tags available

#### Verification Steps:

- [ ] All tests pass
- [ ] Test coverage for main functionality

---

### Task 2.4.10: Unit Tests for LocationFilter

**Objective:** Create unit tests for LocationFilter component.

**File:** `src/components/ItemManager/components/dialogs/__tests__/LocationFilter.test.tsx`

**Estimated Effort:** 1-2 hours

#### Implementation Steps:

1. **Create test file** with Jest/React Testing Library setup

2. **Test cases to implement:**
   - Renders placeholder when no selection
   - Shows selected location in button
   - Opening dropdown shows location list
   - Search filters locations
   - Selecting a location updates selection
   - Clear button removes selection
   - Clicking outside closes dropdown
   - Shows empty state when no locations match

#### Verification Steps:

- [ ] All tests pass
- [ ] Test coverage for main functionality

---

### Task 2.4.11: Unit Tests for PropertyFilter

**Objective:** Create unit tests for PropertyFilter component.

**File:** `src/components/ItemManager/components/dialogs/__tests__/PropertyFilter.test.tsx`

**Estimated Effort:** 1 hour

#### Implementation Steps:

1. **Create test file** with Jest/React Testing Library setup

2. **Test cases to implement:**
   - Returns null when properties array is empty
   - Renders all properties with names and addresses
   - Clicking toggles property selection
   - Supports multiple selections
   - Disabled state prevents clicks

#### Verification Steps:

- [ ] All tests pass
- [ ] Test coverage for main functionality

---

### Task 2.4.12: Integration Tests for FilterPanel

**Objective:** Create integration tests for the complete FilterPanel component.

**File:** `src/components/ItemManager/components/dialogs/__tests__/FilterPanel.test.tsx`

**Estimated Effort:** 2-3 hours

#### Implementation Steps:

1. **Create test file** with Jest/React Testing Library setup

2. **Test cases to implement:**
   - Renders all filter sections
   - Shows correct active filter count
   - Clear All button resets all filters
   - Content type changes propagate to onFiltersChange
   - Tag changes propagate to onFiltersChange
   - Location changes propagate to onFiltersChange
   - Property changes propagate (when multiPropertyMode)
   - PropertyFilter hidden when multiPropertyMode is false
   - Mobile drawer opens and closes correctly
   - Desktop inline panel renders when isOpen

#### Verification Steps:

- [ ] All tests pass
- [ ] Integration between sub-components works correctly

---

## 5. Acceptance Criteria Checklist

From REQ-065 requirements:

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

## 6. Testing Summary

### 6.1 Manual Testing Checklist

| Test Case | Expected Behavior | Status |
|-----------|-------------------|--------|
| Select content type chip | Chip highlights with checkmark, blue styling | [ ] |
| Deselect content type chip | Chip returns to default gray styling | [ ] |
| Select multiple content types | All selected chips show checkmarks | [ ] |
| Add tag from dropdown | Tag appears as removable chip | [ ] |
| Remove tag chip | Tag removed, dropdown shows it again | [ ] |
| Search tags in dropdown | Only matching tags displayed | [ ] |
| Select location | Button shows selected location with blue border | [ ] |
| Clear location | Button returns to placeholder state | [ ] |
| Toggle property checkbox | Checkbox fills/empties with animation | [ ] |
| Click "Clear All" | All filters reset to empty state | [ ] |
| Check filter count badge | Shows correct total of active filters | [ ] |
| Mobile: Open filter drawer | Drawer slides up from bottom | [ ] |
| Mobile: Tap overlay | Drawer closes | [ ] |
| Mobile: Tap Apply button | Drawer closes | [ ] |
| Keyboard: Tab navigation | Can navigate between all interactive elements | [ ] |
| Keyboard: Escape in dropdown | Dropdown closes | [ ] |

### 6.2 Browser/Device Testing Matrix

| Browser/Device | Status |
|----------------|--------|
| Chrome Desktop | [ ] |
| Firefox Desktop | [ ] |
| Safari Desktop | [ ] |
| iOS Safari (iPhone) | [ ] |
| iOS Safari (iPad) | [ ] |
| Chrome Android | [ ] |

### 6.3 Accessibility Testing

- [ ] Screen reader announces filter sections correctly
- [ ] All interactive elements have visible focus indicators
- [ ] ARIA attributes are correct (aria-expanded, aria-checked, aria-selected)
- [ ] Color contrast meets WCAG AA requirements
- [ ] Keyboard navigation works throughout

---

## Summary

This document breaks down REQ-065 (FilterPanel) into 12 granular tasks:

| Task ID | Description | Estimated Effort |
|---------|-------------|------------------|
| 2.4.1 | ContentTypeFilter Component | 1-2 hours |
| 2.4.2 | TagFilter Component | 2-3 hours |
| 2.4.3 | LocationFilter Component | 2-3 hours |
| 2.4.4 | PropertyFilter Component | 1-2 hours |
| 2.4.5 | FilterPanel (Main) Component | 3-4 hours |
| 2.4.6 | Barrel Exports Update | 15 minutes |
| 2.4.7 | Slide-Up Animation | 15 minutes |
| 2.4.8 | ContentTypeFilter Tests | 1-2 hours |
| 2.4.9 | TagFilter Tests | 1-2 hours |
| 2.4.10 | LocationFilter Tests | 1-2 hours |
| 2.4.11 | PropertyFilter Tests | 1 hour |
| 2.4.12 | FilterPanel Integration Tests | 2-3 hours |

**Total Estimated Effort:** 16-24 hours (2-3 days)

**Recommended Execution Order:**
1. Tasks 2.4.1-2.4.4 (sub-components) can be done in parallel
2. Task 2.4.5 (main component) requires sub-components
3. Task 2.4.6 (exports) after all components
4. Task 2.4.7 (animation) can be done anytime
5. Tasks 2.4.8-2.4.12 (tests) after corresponding components

---

*End of Document*
