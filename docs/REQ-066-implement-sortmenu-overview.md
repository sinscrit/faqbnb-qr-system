# REQ-066: Implement SortMenu - Technical Implementation Overview

**Document Created:** 2026-01-03 16:45:00
**Last Modified:** 2026-01-03 16:45:00
**Request Reference:** REQ-066 (Sort Menu for Item Organization)
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 2 - Search, Filter & Sort
**Task ID:** 2.5

---

## 1. Executive Summary

This document provides the technical implementation breakdown for creating the SortMenu component, the fifth task of Phase 2 in the ItemManager component implementation. This component enables users to reorder their item listings based on various criteria with a mobile-friendly dropdown interface.

### Scope

The SortMenu component will:
- Provide a dropdown menu with all available sort options
- Display a clear indicator showing the currently active sort option
- Support ascending/descending order for applicable criteria
- Implement mobile-friendly touch targets (minimum 44x44px)
- Update item order immediately upon selection
- Close automatically after selecting an option
- Support keyboard navigation for accessibility
- Persist sort preference during user session

### Dependencies

- **Requires Phase 1 Completion:** Task 1.1 (Directory Structure & Types) must be complete
- **Requires Task 2.1:** The `useItemSearch` hook must be available for sort application
- **Requires Task 2.2:** The `ItemToolbar` component provides the integration point
- **Parallel Work:** Can be developed in parallel with Task 2.3 (SearchInput) and Task 2.4 (FilterPanel)

---

## 2. Technical Context

### 2.1 Existing Stack & Patterns

| Technology | Details | Source |
|------------|---------|--------|
| Framework | Next.js 15.5.9 with React 19.1.0 | `package.json` |
| Language | TypeScript 5.x (strict mode) | `tsconfig.json` |
| Styling | Tailwind CSS 4.x with `cn()` utility | `src/lib/utils.ts` |
| Icons | Lucide React 0.525.0 | `package.json` |
| UI Primitives | @radix-ui/react-dropdown-menu ^2.1.15 | `package.json` |
| Component Pattern | Client components with 'use client' | Established pattern |

### 2.2 Reference Patterns from Codebase

**Dropdown Pattern:** `/src/components/PropertySelector.tsx` (lines 204-295)

```typescript
// Keyboard navigation pattern
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    // Move focus to next item
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    // Move focus to previous item
  } else if (e.key === 'Enter') {
    // Select current item
  } else if (e.key === 'Escape') {
    setIsOpen(false);
  }
};
```

**Modal/Dropdown Container Pattern:** `/src/components/ConfirmationModal.tsx`

- Fixed backdrop: `fixed inset-0 bg-black bg-opacity-50`
- Z-index layering: `z-50`
- Centered content with rounded corners

**Click-Outside Handler Pattern:**

```typescript
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setIsOpen(false);
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

### 2.3 Types from Implementation Plan

From `ItemManager.types.ts`:

```typescript
/**
 * Sort option type.
 */
export type SortOption =
  | 'title-asc'
  | 'title-desc'
  | 'created-desc'
  | 'created-asc'
  | 'updated-desc'
  | 'updated-asc'
  | 'location-asc';

/**
 * Sort option configuration from constants.ts
 */
export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'title-asc', label: 'Title (A-Z)' },
  { value: 'title-desc', label: 'Title (Z-A)' },
  { value: 'created-desc', label: 'Newest First' },
  { value: 'created-asc', label: 'Oldest First' },
  { value: 'updated-desc', label: 'Recently Modified' },
  { value: 'updated-asc', label: 'Least Recently Modified' },
  { value: 'location-asc', label: 'Location (A-Z)' },
];
```

### 2.4 Radix UI Dropdown Menu

The codebase has `@radix-ui/react-dropdown-menu` installed. This provides accessible primitives:

```typescript
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

<DropdownMenu.Root>
  <DropdownMenu.Trigger />
  <DropdownMenu.Portal>
    <DropdownMenu.Content>
      <DropdownMenu.Item />
      <DropdownMenu.RadioGroup>
        <DropdownMenu.RadioItem />
      </DropdownMenu.RadioGroup>
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>
```

---

## 3. Implementation Approach

### 3.1 Component Architecture

The SortMenu uses a dropdown pattern with visual indicators for the current sort:

```
┌─────────────────────────────────────────────────────────────────┐
│                         SortMenu                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Trigger Button:                                             ││
│  │  [↕ Sort: Newest First                              ▼]      ││
│  └─────────────────────────────────────────────────────────────┘│
│                              ↓                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Dropdown Panel:                                             ││
│  │  ┌─────────────────────────────────────────────────────────┐││
│  │  │  ○ Title (A-Z)                                          │││
│  │  │  ○ Title (Z-A)                                          │││
│  │  │  ● Newest First                            ✓            │││
│  │  │  ○ Oldest First                                         │││
│  │  │  ○ Recently Modified                                    │││
│  │  │  ○ Least Recently Modified                              │││
│  │  │  ○ Location (A-Z)                                       │││
│  │  └─────────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Mobile Behavior:**
- Full-width dropdown trigger button
- Touch-friendly menu items (min 48px height)
- Adequate tap spacing between options
- Auto-close after selection

**Desktop Behavior:**
- Compact trigger button in toolbar
- Hover states on menu items
- Keyboard navigation (ArrowUp, ArrowDown, Enter, Escape)
- Focus management

### 3.2 Props Interface

```typescript
/**
 * Props for SortMenu component.
 */
export interface SortMenuProps {
  /** Currently selected sort option */
  currentSort: SortOption;
  /** Callback when sort option changes */
  onSortChange: (sort: SortOption) => void;
  /** Available sort options (optional, defaults to all) */
  sortOptions?: Array<{ value: SortOption; label: string }>;
  /** Whether the sort menu is disabled */
  disabled?: boolean;
  /** Custom class name for the trigger */
  className?: string;
  /** Custom class names */
  classNames?: {
    trigger?: string;
    content?: string;
    item?: string;
    activeItem?: string;
  };
  /** Custom labels for i18n */
  labels?: {
    sortLabel?: string;
    sortByLabel?: string;
  };
  /** Alignment of dropdown (default: 'end') */
  align?: 'start' | 'center' | 'end';
  /** Side of trigger to show dropdown (default: 'bottom') */
  side?: 'top' | 'bottom';
}
```

### 3.3 Component Structure

The SortMenu consists of:

1. **SortMenuTrigger** - Button showing current sort with dropdown indicator
2. **SortMenuContent** - Dropdown panel with sort options
3. **SortMenuItem** - Individual sort option with radio-style selection

### 3.4 State Management

The SortMenu receives sort state from parent and emits changes:

```typescript
// In parent component (ItemToolbar or ItemManager)
const [sortBy, setSortBy] = useState<SortOption>('created-desc');

// Sort change handling
const handleSortChange = (sort: SortOption) => {
  setSortBy(sort);
  // Dispatch to state manager if using reducer
  dispatch({ type: 'SET_SORT', payload: sort });
};

// Integration with useItemSearch
const { filteredItems } = useItemSearch({
  items,
  filters,
  sortBy, // Pass current sort option
});
```

---

## 4. Authorized Files and Functions for Modification

### 4.1 Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/components/dialogs/SortMenu.tsx` | Main sort dropdown component |

### 4.2 Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemManager/components/dialogs/index.ts` | Add SortMenu export |
| `src/components/ItemManager/components/ItemToolbar.tsx` | Integrate SortMenu component |
| `src/components/ItemManager/utils/constants.ts` | Ensure SORT_OPTIONS is defined |

### 4.3 Functions/Components to Implement

| Component/Function | File | Purpose |
|-------------------|------|---------|
| `SortMenu` | `SortMenu.tsx` | Main dropdown component with Radix UI |
| `getSortLabel` | `SortMenu.tsx` | Helper to get display label for sort value |
| `getSortIcon` | `SortMenu.tsx` | Helper to get icon for sort direction |

### 4.4 Integration Points

The SortMenu integrates with ItemToolbar:

```typescript
// In ItemToolbar.tsx
import { SortMenu } from './dialogs/SortMenu';
import type { SortOption } from '../../ItemManager.types';

interface ItemToolbarProps {
  // ... other props
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  enableSort?: boolean;
}

// Usage in ItemToolbar
{enableSort && (
  <SortMenu
    currentSort={currentSort}
    onSortChange={onSortChange}
    disabled={isLoading}
    className="ml-auto"
  />
)}
```

---

## 5. Detailed Task Breakdown

### Task 2.5.1: Create SortMenu Component

**File:** `src/components/ItemManager/components/dialogs/SortMenu.tsx`

**Implementation:**

```typescript
/**
 * SortMenu Component
 *
 * Dropdown menu for selecting item sort order.
 * Uses Radix UI DropdownMenu for accessible, keyboard-navigable menu.
 *
 * @module ItemManager/components/dialogs/SortMenu
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 2, Task 2.5)
 */

'use client';

import { useMemo } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ArrowUpDown, ArrowUp, ArrowDown, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SortOption } from '../../ItemManager.types';

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_SORT_OPTIONS: Array<{ value: SortOption; label: string; icon?: 'asc' | 'desc' | 'none' }> = [
  { value: 'title-asc', label: 'Title (A-Z)', icon: 'asc' },
  { value: 'title-desc', label: 'Title (Z-A)', icon: 'desc' },
  { value: 'created-desc', label: 'Newest First', icon: 'desc' },
  { value: 'created-asc', label: 'Oldest First', icon: 'asc' },
  { value: 'updated-desc', label: 'Recently Modified', icon: 'desc' },
  { value: 'updated-asc', label: 'Least Recently Modified', icon: 'asc' },
  { value: 'location-asc', label: 'Location (A-Z)', icon: 'asc' },
];

// ============================================================================
// Types
// ============================================================================

export interface SortMenuProps {
  /** Currently selected sort option */
  currentSort: SortOption;
  /** Callback when sort option changes */
  onSortChange: (sort: SortOption) => void;
  /** Available sort options (optional, defaults to all) */
  sortOptions?: Array<{ value: SortOption; label: string; icon?: 'asc' | 'desc' | 'none' }>;
  /** Whether the sort menu is disabled */
  disabled?: boolean;
  /** Custom class name for the trigger */
  className?: string;
  /** Custom class names */
  classNames?: {
    trigger?: string;
    content?: string;
    item?: string;
    activeItem?: string;
  };
  /** Custom labels for i18n */
  labels?: {
    sortLabel?: string;
    sortByLabel?: string;
  };
  /** Alignment of dropdown (default: 'end') */
  align?: 'start' | 'center' | 'end';
  /** Side of trigger to show dropdown (default: 'bottom') */
  side?: 'top' | 'bottom';
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get display label for the current sort option.
 */
function getSortLabel(
  sort: SortOption,
  options: Array<{ value: SortOption; label: string }>
): string {
  const option = options.find((o) => o.value === sort);
  return option?.label || 'Sort';
}

/**
 * Get icon component for sort direction.
 */
function SortDirectionIcon({ direction, className }: { direction?: 'asc' | 'desc' | 'none'; className?: string }) {
  if (direction === 'asc') {
    return <ArrowUp className={className} aria-hidden="true" />;
  }
  if (direction === 'desc') {
    return <ArrowDown className={className} aria-hidden="true" />;
  }
  return null;
}

// ============================================================================
// Component
// ============================================================================

/**
 * SortMenu - Dropdown menu for sorting items.
 *
 * Features:
 * - Accessible dropdown using Radix UI
 * - Visual indicator for current sort option
 * - Direction icons for ascending/descending
 * - Mobile-friendly touch targets (min 48px height)
 * - Keyboard navigation support
 * - Auto-closes after selection
 *
 * @example
 * <SortMenu
 *   currentSort="created-desc"
 *   onSortChange={(sort) => setSortBy(sort)}
 * />
 */
export function SortMenu({
  currentSort,
  onSortChange,
  sortOptions = DEFAULT_SORT_OPTIONS,
  disabled = false,
  className,
  classNames,
  labels = {},
  align = 'end',
  side = 'bottom',
}: SortMenuProps) {
  // Merge default labels
  const mergedLabels = {
    sortLabel: 'Sort',
    sortByLabel: 'Sort by',
    ...labels,
  };

  // Get current sort display label
  const currentLabel = useMemo(
    () => getSortLabel(currentSort, sortOptions),
    [currentSort, sortOptions]
  );

  // Get current sort option for icon
  const currentOption = useMemo(
    () => sortOptions.find((o) => o.value === currentSort),
    [currentSort, sortOptions]
  );

  return (
    <DropdownMenu.Root>
      {/* Trigger Button */}
      <DropdownMenu.Trigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-2",
            "px-3 py-2 rounded-lg",
            "text-sm font-medium",
            "border border-gray-300 bg-white",
            "hover:bg-gray-50 hover:border-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
            "transition-colors duration-150",
            "min-h-[44px]", // Mobile touch target
            disabled && "opacity-50 cursor-not-allowed",
            className,
            classNames?.trigger
          )}
          aria-label={`${mergedLabels.sortByLabel}: ${currentLabel}`}
        >
          <ArrowUpDown className="w-4 h-4 text-gray-500" aria-hidden="true" />
          <span className="hidden sm:inline text-gray-700">
            {mergedLabels.sortLabel}:
          </span>
          <span className="text-gray-900">{currentLabel}</span>
          <ChevronDown className="w-4 h-4 text-gray-400" aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>

      {/* Dropdown Portal */}
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            "z-50 min-w-[220px] max-w-[280px]",
            "bg-white rounded-lg shadow-lg",
            "border border-gray-200",
            "py-1",
            "animate-in fade-in-0 zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2",
            "data-[side=top]:slide-in-from-bottom-2",
            classNames?.content
          )}
          align={align}
          side={side}
          sideOffset={4}
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {mergedLabels.sortByLabel}
            </p>
          </div>

          {/* Sort Options */}
          <DropdownMenu.RadioGroup
            value={currentSort}
            onValueChange={(value) => onSortChange(value as SortOption)}
          >
            {sortOptions.map((option) => {
              const isActive = currentSort === option.value;

              return (
                <DropdownMenu.RadioItem
                  key={option.value}
                  value={option.value}
                  className={cn(
                    "relative flex items-center gap-3",
                    "px-3 py-3 min-h-[48px]", // Mobile touch target
                    "text-sm cursor-pointer",
                    "outline-none",
                    "transition-colors duration-100",
                    "focus:bg-gray-50",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50",
                    classNames?.item,
                    isActive && classNames?.activeItem
                  )}
                >
                  {/* Checkmark Indicator */}
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {isActive && (
                      <Check className="w-4 h-4 text-blue-600" aria-hidden="true" />
                    )}
                  </div>

                  {/* Label */}
                  <span className="flex-1">{option.label}</span>

                  {/* Direction Icon */}
                  <SortDirectionIcon
                    direction={option.icon}
                    className={cn(
                      "w-4 h-4 flex-shrink-0",
                      isActive ? "text-blue-500" : "text-gray-400"
                    )}
                  />
                </DropdownMenu.RadioItem>
              );
            })}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default SortMenu;
```

### Task 2.5.2: Add SORT_OPTIONS to Constants

**File:** `src/components/ItemManager/utils/constants.ts`

**Implementation (if not already present):**

```typescript
import type { SortOption } from '../ItemManager.types';

/**
 * Available sort options for ItemManager.
 * Used by SortMenu and useItemSearch.
 */
export const SORT_OPTIONS: Array<{
  value: SortOption;
  label: string;
  icon?: 'asc' | 'desc' | 'none';
}> = [
  { value: 'title-asc', label: 'Title (A-Z)', icon: 'asc' },
  { value: 'title-desc', label: 'Title (Z-A)', icon: 'desc' },
  { value: 'created-desc', label: 'Newest First', icon: 'desc' },
  { value: 'created-asc', label: 'Oldest First', icon: 'asc' },
  { value: 'updated-desc', label: 'Recently Modified', icon: 'desc' },
  { value: 'updated-asc', label: 'Least Recently Modified', icon: 'asc' },
  { value: 'location-asc', label: 'Location (A-Z)', icon: 'asc' },
];

/**
 * Default sort option.
 */
export const DEFAULT_SORT: SortOption = 'created-desc';
```

### Task 2.5.3: Export from Barrel Files

**File:** `src/components/ItemManager/components/dialogs/index.ts`

Add exports:

```typescript
export { SortMenu } from './SortMenu';
export type { SortMenuProps } from './SortMenu';
```

### Task 2.5.4: Integration with ItemToolbar

**File:** `src/components/ItemManager/components/ItemToolbar.tsx`

Add SortMenu integration:

```typescript
// Imports
import { SortMenu } from './dialogs/SortMenu';
import type { SortOption } from '../ItemManager.types';

// Add to ItemToolbarProps interface
interface ItemToolbarProps {
  // ... existing props

  /** Current sort option */
  currentSort: SortOption;
  /** Callback when sort changes */
  onSortChange: (sort: SortOption) => void;
  /** Whether sort is enabled (default: true) */
  enableSort?: boolean;
}

// Add to component render
{enableSort && (
  <SortMenu
    currentSort={currentSort}
    onSortChange={onSortChange}
    disabled={isLoading || disabled}
    className="ml-2"
    classNames={{
      trigger: classNames?.sortTrigger,
    }}
  />
)}
```

---

## 6. Testing Requirements

### 6.1 Unit Test Cases

Create tests in `src/components/ItemManager/components/dialogs/__tests__/SortMenu.test.tsx`:

| Test Case | Description |
|-----------|-------------|
| Renders trigger button | Trigger button displays with current sort label |
| Shows dropdown on click | Clicking trigger opens dropdown menu |
| Displays all options | All sort options rendered in dropdown |
| Highlights current option | Active option has checkmark and blue styling |
| Calls onSortChange | Selecting option calls callback with value |
| Closes after selection | Menu closes after selecting an option |
| Keyboard: Enter selects | Pressing Enter on focused option selects it |
| Keyboard: Escape closes | Pressing Escape closes the menu |
| Keyboard: ArrowDown navigates | Arrow keys move focus between options |
| Disabled state | Button shows disabled styling when disabled |
| Custom labels | Custom labels display correctly |
| Custom classNames | Custom classes are applied |

### 6.2 Manual Testing Checklist

| Test Case | Expected Behavior |
|-----------|-------------------|
| Click trigger | Dropdown opens below trigger |
| Select different sort | Items reorder, menu closes |
| Current sort indicator | Checkmark shows on active option |
| Direction icons | Arrows show for asc/desc options |
| Mobile tap | 48px touch targets work |
| Click outside | Dropdown closes |
| Escape key | Dropdown closes |
| Tab key | Focus moves to next focusable element |
| Screen reader | Announces "Sort by: [option]" |
| Sort label on trigger | Shows "Sort: [option]" on desktop |
| Responsive | Hides "Sort:" label on mobile |

### 6.3 Visual Testing

| Viewport | Expected Behavior |
|----------|-------------------|
| Mobile (< 640px) | Compact trigger, full-width dropdown |
| Tablet (640px - 1024px) | Full trigger with label |
| Desktop (> 1024px) | Compact inline trigger |

### 6.4 Accessibility Testing

| Requirement | Implementation |
|-------------|----------------|
| Focus visible | Ring on focused trigger and items |
| ARIA labels | `aria-label` on trigger button |
| Role attributes | Radix provides radio group semantics |
| Keyboard navigation | Arrow keys, Enter, Escape work |
| Screen reader | Announces selection changes |

---

## 7. Acceptance Criteria

From REQ-066:

- [x] Sort menu displays as a dropdown with all available sorting options
- [x] Currently active sort option is clearly indicated within the menu
- [x] Touch targets meet minimum size requirements (44x44px for trigger, 48px for items)
- [x] Item list reorders immediately upon selecting a new sort option
- [x] Sort order toggle (ascending/descending) represented via direction icons
- [x] Sort menu is accessible via keyboard navigation
- [x] Selected sort preference persists during the user session (via parent state)
- [x] Menu closes automatically after selecting an option
- [x] Visual design is consistent with the application's design system

### Additional Technical Criteria:

- [x] Uses Radix UI DropdownMenu for accessibility
- [x] Follows established dropdown patterns from PropertySelector.tsx
- [x] Consistent styling with Tailwind CSS and cn() utility
- [x] Supports custom labels for internationalization
- [x] Smooth animations using Tailwind animate utilities
- [x] Works with useItemSearch hook for actual sorting

---

## 8. Integration Notes

### 8.1 Data Flow

```
ItemManager (parent)
    │
    ├─── useItemManagerState
    │         │
    │         ├─── state.sortBy (SortOption)
    │         │
    │         └─── dispatch({ type: 'SET_SORT', payload: ... })
    │
    ├─── ItemToolbar
    │         │
    │         └─── SortMenu
    │                  │
    │                  ├─── currentSort ← state.sortBy
    │                  │
    │                  └─── onSortChange → dispatch SET_SORT
    │
    └─── useItemSearch
              │
              └─── Uses state.sortBy to sort items
```

### 8.2 Relationship to Other Phase 2 Tasks

| Task | Relationship |
|------|--------------|
| 2.1 (useItemSearch) | Consumes sortBy to sort items |
| 2.2 (ItemToolbar) | Contains the SortMenu component |
| 2.3 (SearchInput) | Parallel - search applies before sort |
| 2.4 (FilterPanel) | Parallel - filter applies before sort |
| 2.6 (Utilities) | Uses sort comparators from sortUtils.ts |

### 8.3 Sort Comparators Integration

The sort functionality requires comparators from `sortUtils.ts`:

```typescript
// src/components/ItemManager/utils/sortUtils.ts
import type { ItemRecord } from '@/components/ItemCapture';
import type { SortOption } from '../ItemManager.types';

export const sortComparators: Record<SortOption, (a: ItemRecord, b: ItemRecord) => number> = {
  'title-asc': (a, b) => a.title.localeCompare(b.title),
  'title-desc': (a, b) => b.title.localeCompare(a.title),
  'created-desc': (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  'created-asc': (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  'updated-desc': (a, b) => {
    const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : new Date(a.createdAt).getTime();
    const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : new Date(b.createdAt).getTime();
    return bTime - aTime;
  },
  'updated-asc': (a, b) => {
    const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : new Date(a.createdAt).getTime();
    const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : new Date(b.createdAt).getTime();
    return aTime - bTime;
  },
  'location-asc': (a, b) => (a.location ?? '').localeCompare(b.location ?? ''),
};

/**
 * Sort items using the specified sort option.
 */
export function sortItems(items: ItemRecord[], sortBy: SortOption): ItemRecord[] {
  const comparator = sortComparators[sortBy];
  return [...items].sort(comparator);
}
```

### 8.4 Session Persistence

Sort preference persists via component state in parent. For cross-session persistence:

```typescript
// Optional: Session storage integration
useEffect(() => {
  const savedSort = sessionStorage.getItem('itemManager.sortBy');
  if (savedSort && isValidSortOption(savedSort)) {
    dispatch({ type: 'SET_SORT', payload: savedSort as SortOption });
  }
}, []);

useEffect(() => {
  sessionStorage.setItem('itemManager.sortBy', sortBy);
}, [sortBy]);
```

---

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Dropdown positioning issues | Low | Low | Radix handles positioning; use sideOffset |
| Z-index conflicts | Low | Medium | Use z-50; test with other modals |
| Touch target too small | Low | Medium | Enforce min-h-[44px] on trigger, 48px on items |
| Keyboard trap | Very Low | Medium | Radix handles focus management |
| Animation jank | Low | Low | Use hardware-accelerated transforms |
| Mobile dropdown cut off | Low | Medium | Test on small viewports; adjust alignment |

---

## 10. File Structure After Implementation

```
src/components/ItemManager/
├── components/
│   ├── dialogs/
│   │   ├── index.ts                      # Updated: add SortMenu export
│   │   ├── SortMenu.tsx                  # NEW: Sort dropdown component
│   │   ├── FilterPanel.tsx               # (Created in Task 2.4)
│   │   ├── ConfirmDeleteDialog.tsx       # (Created in Phase 3)
│   │   └── __tests__/
│   │       ├── SortMenu.test.tsx         # NEW: Unit tests
│   │       └── ...
│   ├── ItemToolbar.tsx                   # Updated: integrate SortMenu
│   └── ...
├── hooks/
│   └── useItemSearch.ts                  # (Created in Task 2.1)
├── utils/
│   ├── constants.ts                      # Updated: SORT_OPTIONS
│   └── sortUtils.ts                      # (Created in Task 2.6)
└── ItemManager.types.ts                  # (Created in Phase 1)
```

---

## 11. Appendix: Tailwind Animation Classes

Add to global CSS or Tailwind config if not present:

```css
/* Radix UI animation classes for dropdown */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideInFromTop {
  from {
    opacity: 0;
    transform: translateY(-2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-in {
  animation-duration: 150ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  animation-fill-mode: forwards;
}

.fade-in-0 {
  animation-name: fadeIn;
}

.zoom-in-95 {
  animation-name: zoomIn;
}

.slide-in-from-top-2 {
  animation-name: slideInFromTop;
}
```

Alternatively, Radix can be styled with data attributes:

```css
[data-state="open"] {
  animation: fadeIn 150ms ease-out;
}

[data-state="closed"] {
  animation: fadeOut 150ms ease-in;
}
```

---

## 12. Appendix: Complete SortMenu Usage Example

```typescript
// Full integration example in ItemManager
'use client';

import { useReducer, useMemo } from 'react';
import { SortMenu } from './components/dialogs/SortMenu';
import { useItemSearch } from './hooks/useItemSearch';
import type { SortOption, ItemManagerState } from './ItemManager.types';

function itemManagerReducer(state: ItemManagerState, action: ItemManagerAction): ItemManagerState {
  switch (action.type) {
    case 'SET_SORT':
      return { ...state, sortBy: action.payload };
    // ... other cases
    default:
      return state;
  }
}

export function ItemManager({ items, ...props }: ItemManagerProps) {
  const [state, dispatch] = useReducer(itemManagerReducer, {
    sortBy: 'created-desc',
    // ... initial state
  });

  // Filter and sort items
  const { filteredItems, sortedItems } = useItemSearch({
    items,
    filters: state.filters,
    sortBy: state.sortBy,
  });

  const handleSortChange = (sort: SortOption) => {
    dispatch({ type: 'SET_SORT', payload: sort });
  };

  return (
    <div>
      <ItemToolbar>
        <SortMenu
          currentSort={state.sortBy}
          onSortChange={handleSortChange}
        />
      </ItemToolbar>

      <ItemGrid items={sortedItems} />
    </div>
  );
}
```

---

## 13. References

- [Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md) - Phase 2, Task 2.5
- [Radix UI DropdownMenu](https://www.radix-ui.com/primitives/docs/components/dropdown-menu) - Component documentation
- [PropertySelector](/src/components/PropertySelector.tsx) - Dropdown pattern reference
- [ItemToolbar Overview](/docs/REQ-063-build-itemtoolbar-component-overview.md) - Container component
- [useItemSearch Overview](/docs/REQ-062-create-useitemsearch-hook-overview.md) - Search/sort hook
- [FilterPanel Overview](/docs/REQ-065-implement-filterpanel-overview.md) - Parallel Phase 2 task
- [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility guidelines
