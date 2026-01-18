# Detailed Task Breakdown: REQ-219 - Sortable Table Headers and Column Settings for Guides List

## Document Info
| Field | Value |
|-------|-------|
| Request Reference | #219 |
| Overview Document | docs/req-219-sortable-table-headers-guides-list-overview.md |
| Created | 2026-01-13 |
| Status | Ready for Implementation |

---

## Task 1: Define Sort Types and Column Visibility State

### 1.1 Add GuideSortOption Type

**File**: `src/components/InstructionsTable/InstructionsTable.types.ts`

**Action**: Add a new type definition for guide sorting options

```typescript
/**
 * Sort options for ordering the guides list.
 * Format: field-direction (e.g., 'title-asc' = sort by title ascending).
 * @lastModified 2026-01-13 (REQ-219)
 */
export type GuideSortOption =
  | 'title-asc'
  | 'title-desc'
  | 'item-asc'
  | 'item-desc'
  | 'purpose-asc'
  | 'purpose-desc'
  | 'created-desc'
  | 'created-asc';
```

### 1.2 Add GuideColumnVisibilityState Interface

**File**: `src/components/InstructionsTable/InstructionsTable.types.ts`

**Action**: Add interface for column visibility state

```typescript
/**
 * Column visibility state for InstructionsTable view.
 * Controls which optional columns are displayed.
 * @lastModified 2026-01-13 (REQ-219)
 */
export interface GuideColumnVisibilityState {
  /** Whether the Room column is visible (default: true) */
  room: boolean;
  /** Whether the Purpose column is visible (default: true) */
  purpose: boolean;
}
```

### 1.3 Update InstructionsTableProps Interface

**File**: `src/components/InstructionsTable/InstructionsTable.types.ts`

**Action**: Extend the props interface with new sorting and column visibility properties

```typescript
/**
 * Props for InstructionsTable component
 * @lastModified 2026-01-13 (REQ-219 - Added sorting and column visibility props)
 */
export interface InstructionsTableProps {
  instructions: InstructionRow[];
  onEdit?: (articleId: string) => void;
  loading?: boolean;
  /** Current sort option for highlighting active column (REQ-219) */
  currentSort?: GuideSortOption;
  /** Callback when column header is clicked to change sort (REQ-219) */
  onSortChange?: (sort: GuideSortOption) => void;
  /** Column visibility state (REQ-219) */
  columnVisibility?: GuideColumnVisibilityState;
  /** Callback to toggle column visibility (REQ-219) */
  onToggleColumn?: (column: keyof GuideColumnVisibilityState) => void;
}
```

---

## Task 2: Create useGuideColumnVisibility Hook

### 2.1 Create the Hook File

**File**: `src/components/InstructionsTable/useGuideColumnVisibility.ts`

**Action**: Create a new hook for managing guide column visibility with session storage persistence

```typescript
'use client';

/**
 * useGuideColumnVisibility - Hook for managing column visibility preferences
 *
 * Manages which optional columns are visible in the InstructionsTable view.
 * Persists state to sessionStorage for tab-level persistence.
 *
 * @module InstructionsTable/hooks/useGuideColumnVisibility
 * @see docs/req-219-sortable-table-headers-guides-list-overview.md
 * @lastModified 2026-01-13 (REQ-219)
 */

import { useState, useCallback, useEffect } from 'react';
import type { GuideColumnVisibilityState } from './InstructionsTable.types';

// =============================================================================
// Constants
// =============================================================================

const SESSION_STORAGE_KEY = 'instructionsTable.columns';

// =============================================================================
// Types
// =============================================================================

export interface UseGuideColumnVisibilityReturn {
  /** Current visibility state for all columns */
  columnVisibility: GuideColumnVisibilityState;
  /** Toggle visibility of a specific column */
  toggleColumn: (column: keyof GuideColumnVisibilityState) => void;
  /** Set visibility of a specific column */
  setColumnVisibility: (column: keyof GuideColumnVisibilityState, visible: boolean) => void;
  /** Check if a specific column is visible */
  isColumnVisible: (column: keyof GuideColumnVisibilityState) => boolean;
}

// =============================================================================
// Default State
// =============================================================================

const DEFAULT_VISIBILITY: GuideColumnVisibilityState = {
  room: true,    // Visible by default
  purpose: true, // Visible by default
};

// =============================================================================
// Hook Implementation
// =============================================================================

export function useGuideColumnVisibility(): UseGuideColumnVisibilityReturn {
  const [columnVisibility, setVisibilityState] = useState<GuideColumnVisibilityState>(DEFAULT_VISIBILITY);

  // Restore from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setVisibilityState({
            ...DEFAULT_VISIBILITY,
            ...parsed,
          });
        }
      } catch (e) {
        console.warn('Failed to parse guide column visibility from sessionStorage:', e);
      }
    }
  }, []);

  // Persist to sessionStorage when state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(columnVisibility));
      } catch (e) {
        console.warn('Failed to save guide column visibility to sessionStorage:', e);
      }
    }
  }, [columnVisibility]);

  const toggleColumn = useCallback((column: keyof GuideColumnVisibilityState) => {
    setVisibilityState((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  }, []);

  const setColumnVisibility = useCallback((column: keyof GuideColumnVisibilityState, visible: boolean) => {
    setVisibilityState((prev) => ({
      ...prev,
      [column]: visible,
    }));
  }, []);

  const isColumnVisible = useCallback(
    (column: keyof GuideColumnVisibilityState) => columnVisibility[column],
    [columnVisibility]
  );

  return {
    columnVisibility,
    toggleColumn,
    setColumnVisibility,
    isColumnVisible,
  };
}

export default useGuideColumnVisibility;
```

---

## Task 3: Create GuideColumnSettingsPopup Component

### 3.1 Create the Component File

**File**: `src/components/InstructionsTable/GuideColumnSettingsPopup.tsx`

**Action**: Create a dropdown popup for toggling column visibility

```typescript
'use client';

/**
 * GuideColumnSettingsPopup Component
 *
 * Dropdown popup for toggling column visibility in InstructionsTable.
 * Uses Radix UI DropdownMenu for accessible, keyboard-navigable menu.
 *
 * @module InstructionsTable/components/GuideColumnSettingsPopup
 * @see docs/req-219-sortable-table-headers-guides-list-overview.md
 * @lastModified 2026-01-13 (REQ-219)
 */

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Settings2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GuideColumnVisibilityState } from './InstructionsTable.types';

// ============================================================================
// Types
// ============================================================================

export interface GuideColumnSettingsPopupProps {
  /** Current column visibility state */
  columnVisibility: GuideColumnVisibilityState;
  /** Callback to toggle a column's visibility */
  onToggleColumn: (column: keyof GuideColumnVisibilityState) => void;
  /** Custom class name for the trigger button */
  className?: string;
}

// ============================================================================
// Column Configuration
// ============================================================================

interface ColumnOption {
  key: keyof GuideColumnVisibilityState;
  label: string;
}

const COLUMN_OPTIONS: ColumnOption[] = [
  { key: 'room', label: 'Room' },
  { key: 'purpose', label: 'Purpose' },
];

// ============================================================================
// Component
// ============================================================================

export function GuideColumnSettingsPopup({
  columnVisibility,
  onToggleColumn,
  className,
}: GuideColumnSettingsPopupProps) {
  return (
    <DropdownMenu.Root>
      {/* Trigger Button - Gear Icon */}
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center justify-center',
            'w-8 h-8 rounded-md',
            'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
            'transition-colors duration-150',
            className
          )}
          aria-label="Column settings"
        >
          <Settings2 className="w-4 h-4" aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>

      {/* Dropdown Portal */}
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            'z-50 min-w-[180px]',
            'bg-white rounded-lg shadow-lg',
            'border border-gray-200',
            'py-1',
            'animate-fade-in'
          )}
          align="end"
          side="bottom"
          sideOffset={4}
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Show Columns
            </p>
          </div>

          {/* Column Toggle Options */}
          {COLUMN_OPTIONS.map((option) => {
            const isChecked = columnVisibility[option.key];

            return (
              <DropdownMenu.CheckboxItem
                key={option.key}
                checked={isChecked}
                onCheckedChange={() => onToggleColumn(option.key)}
                className={cn(
                  'relative flex items-center gap-3',
                  'px-3 py-3 min-h-[48px]',
                  'text-sm cursor-pointer',
                  'outline-none',
                  'transition-colors duration-100',
                  'focus:bg-gray-50',
                  isChecked
                    ? 'text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                {/* Checkbox Indicator */}
                <div className={cn(
                  'w-5 h-5 flex items-center justify-center flex-shrink-0',
                  'rounded border',
                  isChecked
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-gray-300 bg-white'
                )}>
                  {isChecked && (
                    <Check className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                  )}
                </div>

                {/* Label */}
                <span>{option.label}</span>
              </DropdownMenu.CheckboxItem>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default GuideColumnSettingsPopup;
```

---

## Task 4: Update InstructionsTable Component with Sortable Headers

### 4.1 Add SortableColumnHeader Component

**File**: `src/components/InstructionsTable/InstructionsTable.tsx`

**Action**: Add a SortableColumnHeader helper component and refactor the table headers

The component should:
1. Add imports for `ArrowUp`, `ArrowDown`, `ArrowUpDown` from lucide-react
2. Import `cn` from `@/lib/utils`
3. Import `GuideColumnSettingsPopup` from `./GuideColumnSettingsPopup`
4. Import the new types from `./InstructionsTable.types`
5. Define `SortableColumnHeader` component inline (similar to ItemList.tsx pattern)
6. Update the table header row to use sortable headers
7. Add the column settings gear icon in the header
8. Apply conditional visibility to Room and Purpose columns based on `columnVisibility`

Key implementation notes:
- Match the styling from ItemList.tsx header row (bg-gray-50, uppercase labels, proper spacing)
- Sort arrows should show current sort direction when active
- Gear icon should be positioned in the Actions header area

---

## Task 5: Implement Client-Side Sorting Logic

### 5.1 Create useSortedInstructions Helper

**File**: `src/app/dashboard2/instructions/page.tsx`

**Action**: Add sorting state and logic to the page component

```typescript
// Add state for sorting
const [currentSort, setCurrentSort] = useState<GuideSortOption>('created-desc');

// Add sorting function
const sortInstructions = useCallback((instructions: InstructionRow[], sort: GuideSortOption): InstructionRow[] => {
  const sorted = [...instructions];

  sorted.sort((a, b) => {
    switch (sort) {
      case 'title-asc':
        return a.articleTitle.localeCompare(b.articleTitle);
      case 'title-desc':
        return b.articleTitle.localeCompare(a.articleTitle);
      case 'item-asc':
        return a.itemName.localeCompare(b.itemName);
      case 'item-desc':
        return b.itemName.localeCompare(a.itemName);
      case 'purpose-asc':
        return a.purpose.localeCompare(b.purpose);
      case 'purpose-desc':
        return b.purpose.localeCompare(a.purpose);
      case 'created-asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'created-desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  return sorted;
}, []);

// Use sorted data
const sortedInstructions = useMemo(
  () => sortInstructions(instructionsData, currentSort),
  [instructionsData, currentSort, sortInstructions]
);
```

---

## Task 6: Wire Up Sorting and Column Visibility in Page

### 6.1 Integrate Hook and Pass Props

**File**: `src/app/dashboard2/instructions/page.tsx`

**Action**:
1. Import `useGuideColumnVisibility` hook
2. Import `GuideSortOption` type
3. Add hook usage
4. Pass all new props to InstructionsTable

```typescript
import { useGuideColumnVisibility } from '@/components/InstructionsTable/useGuideColumnVisibility';
import type { GuideSortOption } from '@/components/InstructionsTable';

// In component:
const { columnVisibility, toggleColumn } = useGuideColumnVisibility();

// Pass to InstructionsTable:
<InstructionsTable
  instructions={sortedInstructions}
  loading={loading}
  onEdit={handleEditArticle}
  currentSort={currentSort}
  onSortChange={setCurrentSort}
  columnVisibility={columnVisibility}
  onToggleColumn={toggleColumn}
/>
```

---

## Task 7: Update Index Exports

### 7.1 Export New Components and Types

**File**: `src/components/InstructionsTable/index.ts`

**Action**: Add exports for new components, hooks, and types

```typescript
/**
 * InstructionsTable Component Exports
 * Created: 2026-01-12
 * @lastModified 2026-01-13 (REQ-219 - Added sorting and column visibility exports)
 */

export { InstructionsTable } from './InstructionsTable';
export { GuideColumnSettingsPopup } from './GuideColumnSettingsPopup';
export { useGuideColumnVisibility } from './useGuideColumnVisibility';
export type {
  InstructionRow,
  InstructionsTableProps,
  GuideSortOption,
  GuideColumnVisibilityState,
} from './InstructionsTable.types';
```

---

## Implementation Order Summary

1. **Task 1**: Update types (InstructionsTable.types.ts)
2. **Task 2**: Create useGuideColumnVisibility hook
3. **Task 3**: Create GuideColumnSettingsPopup component
4. **Task 4**: Update InstructionsTable with sortable headers
5. **Task 5**: Add sorting logic to page
6. **Task 6**: Wire up everything in page component
7. **Task 7**: Update index exports

---

## Validation Checklist

After implementation, verify:

- [ ] Title column header is clickable and sorts A-Z / Z-A
- [ ] Item column header is clickable and sorts A-Z / Z-A
- [ ] Purpose column header is clickable and sorts alphabetically
- [ ] Created column header is clickable and sorts newest/oldest
- [ ] Active sort column shows appropriate arrow indicator (up/down)
- [ ] Inactive columns show up-down arrow indicator
- [ ] Gear icon appears in header row
- [ ] Clicking gear icon opens dropdown menu
- [ ] Room column can be toggled on/off via dropdown
- [ ] Purpose column can be toggled on/off via dropdown
- [ ] Column visibility persists across page refreshes (within session)
- [ ] Header styling matches Items list (bg-gray-50, uppercase, proper spacing)
- [ ] Loading skeleton still displays correctly
- [ ] Empty state still displays correctly
- [ ] Edit functionality still works
- [ ] Responsive behavior on mobile devices

---

*Document generated: 2026-01-13*
