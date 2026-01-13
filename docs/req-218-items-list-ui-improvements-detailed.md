# REQ-218: Items List UI Improvements - Detailed Implementation Tasks

**Generated:** 2026-01-13 16:30 PST
**Reference Documents:**
- Requirements: docs/gen_requests.md (REQ-218)
- Overview: docs/req-218-items-list-ui-improvements-Overview.md

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root
- This document modifies only the `/dashboard2/items` page; original `/dashboard` remains unchanged

---

## 1. Remove Filter Status and Item Count Display from ItemToolbar

**Context:** The ItemToolbar component (lines 406-561) currently renders a `FiltersPlaceholder` component showing "No filters applied" text and a `ResultCount` component displaying "X of Y items". These create visual clutter below the search bar. The goal is to remove Row 3 content while keeping the SelectionIndicator (which appears conditionally when items are selected).

**Files to modify:**
- `src/components/ItemManager/components/ItemToolbar.tsx`

**Estimated effort:** 1 story point

- [x] **1.1** Read the current ItemToolbar.tsx file to confirm line numbers for removal targets---implemented:Confirmed line numbers and structure
- [x] **1.2** Remove the `FiltersPlaceholder` function definition (currently lines 374-396):
  ```typescript
  // DELETE: interface FiltersPlaceholderProps and function FiltersPlaceholder
  ```---implemented:Replaced with comment noting REQ-218 removal
- [x] **1.3** Remove the `ResultCount` function definition (currently lines 102-132):
  ```typescript
  // DELETE: interface ResultCountProps and function ResultCount
  ```---implemented:Replaced with comment noting REQ-218 removal
- [x] **1.4** In the main `ItemToolbar` component JSX, remove the `FiltersPlaceholder` usage within the Row 2 section (lines 521-525):
  ```typescript
  // DELETE: <FiltersPlaceholder filters={filters} onFiltersChange={onFiltersChange} filterOptions={filterOptions} />
  ```---implemented:Removed FiltersPlaceholder from Row 2 JSX
- [x] **1.5** In Row 3 section (lines 531-558), remove the `ResultCount` component while keeping the `SelectionIndicator`:
  - Remove the entire `<div className="flex items-center gap-4">` wrapper containing `ResultCount`
  - Keep only the `SelectionIndicator` component and `ClearFiltersButton`
  - Simplify Row 3 to show only SelectionIndicator (when active) and ClearFiltersButton (when isFiltered)---implemented:Removed ResultCount and unnecessary wrapper
- [x] **1.6** Update Row 3 JSX structure to:
  ```typescript
  {/* Row 3: Selection Indicator + Clear Filters */}
  <div className="flex items-center justify-between gap-4">
    {/* Selection Indicator (REQ-069) */}
    {selectedCount !== undefined && selectedCount > 0 && onClearSelection && (
      <SelectionIndicator
        selectedCount={selectedCount}
        onClearSelection={onClearSelection}
        onSelectAll={onSelectAll}
        totalCount={resultCount}
      />
    )}

    {isFiltered && (
      <ClearFiltersButton
        onClick={onClearFilters}
        className={classNames.clearButton}
      />
    )}
  </div>
  ```---implemented:Updated Row 3 to simplified structure
- [x] **1.7** Remove any unused imports if `ResultCount` or `FiltersPlaceholder` were exported---implemented:No unused imports to remove, components were local to file
- [ ] **1.8** Verify the toolbar renders correctly by running `npm run dev` and navigating to `/dashboard2/items`
- [ ] **1.9** Verify the SelectionIndicator still appears when items are selected (enter selection mode by long-pressing an item on mobile or clicking checkboxes)

---

## 2. Fix Search Input Clear Button Race Condition Bug

**Context:** The `SearchInput` component has a debounce mechanism that causes a bug when clicking the X (clear) button. The `handleClear` function sets `localValue` to empty and calls `onChange('')` immediately, but the `useEffect` on lines 76-81 re-syncs `localValue` from the prop `value`, causing the cleared text to reappear. The fix requires tracking when a clear operation is in progress to skip the sync effect.

**Files to modify:**
- `src/components/ItemManager/components/SearchInput.tsx`
- `src/components/ItemManager/components/__tests__/SearchInput.test.tsx` (if exists, create if not)

**Estimated effort:** 1 story point

- [ ] **2.1** Add a ref to track clear operations at the top of the component (after line 67):
  ```typescript
  const isClearingRef = useRef(false);
  ```
- [ ] **2.2** Modify the `handleClear` function (lines 103-107) to set the clearing flag:
  ```typescript
  const handleClear = useCallback(() => {
    isClearingRef.current = true;
    setLocalValue('');
    onChange(''); // Immediate clear (bypass debounce)
    inputRef.current?.focus();
    // Reset the flag after a short delay to allow state to settle
    setTimeout(() => {
      isClearingRef.current = false;
    }, 50);
  }, [onChange]);
  ```
- [ ] **2.3** Modify the sync effect (lines 76-81) to skip syncing during clear operations:
  ```typescript
  useEffect(() => {
    // Skip sync during clear operations to prevent race condition
    if (isClearingRef.current) {
      return;
    }
    if (value !== localValue) {
      setLocalValue(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  ```
- [ ] **2.4** Add the `useRef` import if not already present (it is already imported on line 14)
- [ ] **2.5** Test the fix manually:
  - Navigate to `/dashboard2/items`
  - Type text in the search box
  - Click the X button to clear
  - Verify the text does not reappear
  - Type text again and press Escape key to clear
  - Verify the text clears properly
- [ ] **2.6** Test edge cases:
  - Clear immediately after typing a single character
  - Clear during the debounce window (within 300ms of typing)
  - Clear after debounce has completed
  - Rapid type-clear-type sequences

---

## 3. Add Property Column to ItemList Header and ItemRow Data Cell

**Context:** The Property column does not currently exist in the list view. Items have a `propertyId` field, and the `properties` array is passed to ItemManager. The Property column should display the property nickname and be placed between Tags and Created columns.

**Files to modify:**
- `src/components/ItemManager/ItemManager.types.ts`
- `src/components/ItemManager/components/ItemList.tsx`
- `src/components/ItemManager/components/ItemRow.tsx`
- `src/components/ItemManager/ItemManager.tsx`

**Estimated effort:** 1 story point

- [ ] **3.1** Extend `ItemListProps` interface in `ItemManager.types.ts` (around line 632):
  ```typescript
  /** Properties array for property name lookup */
  properties?: Property[];
  ```
- [ ] **3.2** Extend `ItemRowProps` interface in `ItemManager.types.ts` (around line 547):
  ```typescript
  /** Property name to display (resolved from propertyId) */
  propertyName?: string;
  ```
- [ ] **3.3** In `ItemList.tsx`, add `properties` to the destructured props (line 75):
  ```typescript
  export function ItemList({
    items,
    // ... existing props
    properties,  // Add this
  }: ItemListProps) {
  ```
- [ ] **3.4** In `ItemList.tsx`, add the Property column header after the Tags column (around line 156, after the Tags columnheader):
  ```typescript
  <div role="columnheader" className="hidden lg:block w-32 flex-shrink-0">Property</div>
  ```
- [ ] **3.5** In `ItemList.tsx`, pass `propertyName` to each `ItemRow` component. Create a helper function to look up property name:
  ```typescript
  // Add before the return statement
  const getPropertyName = (propertyId?: string): string | undefined => {
    if (!propertyId || !properties) return undefined;
    const property = properties.find(p => p.id === propertyId);
    return property?.nickname || property?.name || undefined;
  };
  ```
- [ ] **3.6** Update the `ItemRow` usage in `ItemList.tsx` (around line 176) to pass `propertyName`:
  ```typescript
  <ItemRow
    key={item.id}
    // ... existing props
    propertyName={getPropertyName((item as ItemRecordExtended).propertyId)}
  />
  ```
- [ ] **3.7** In `ItemRow.tsx`, add `propertyName` to the destructured props (line 84):
  ```typescript
  export function ItemRow({
    // ... existing props
    propertyName,
  }: ItemRowProps) {
  ```
- [ ] **3.8** In `ItemRow.tsx`, add the Property column data cell after the Tags column (around line 501, after the Tags column div):
  ```typescript
  {/* Property Column (REQ-218) - visible on lg+ screens */}
  <div className="hidden lg:flex w-32 items-center flex-shrink-0 text-sm text-gray-500 truncate">
    {propertyName || '-'}
  </div>
  ```
- [ ] **3.9** In `ItemManager.tsx`, pass `properties` to `ItemList` component (around line 616):
  ```typescript
  <ItemList
    // ... existing props
    properties={properties}
  />
  ```
- [ ] **3.10** Update the aria-label in `ItemRow.tsx` (line 345) to include property name:
  ```typescript
  const ariaLabel = `${item.title}. ${propertyName ? `Property: ${propertyName}.` : ''} ${item.location ? `Location: ${item.location}.` : ''} ...`;
  ```
- [ ] **3.11** Verify the Property column appears correctly in list view with property data

---

## 4. Create Column Visibility State Hook with Session Storage

**Context:** The codebase uses sessionStorage for persisting view mode preferences (see `useItemManagerState.ts` line 28: `SESSION_STORAGE_KEY = 'itemManager.viewMode'`). Following this pattern, create a hook or extend the existing state to manage column visibility with session storage persistence.

**Files to modify:**
- `src/components/ItemManager/hooks/useColumnVisibility.ts` (create new)
- `src/components/ItemManager/hooks/index.ts`
- `src/components/ItemManager/ItemManager.types.ts`

**Estimated effort:** 1 story point

- [ ] **4.1** Create the new hook file at `src/components/ItemManager/hooks/useColumnVisibility.ts`:
  ```typescript
  'use client';

  /**
   * useColumnVisibility - Hook for managing column visibility preferences
   *
   * Manages which optional columns are visible in the ItemList view.
   * Persists state to sessionStorage for tab-level persistence.
   *
   * @module ItemManager/hooks/useColumnVisibility
   * @see docs/req-218-items-list-ui-improvements-Overview.md
   * @lastModified 2026-01-13 (REQ-218)
   */

  import { useState, useCallback, useEffect } from 'react';

  // =============================================================================
  // Constants
  // =============================================================================

  const SESSION_STORAGE_KEY = 'itemManager.columns';

  // =============================================================================
  // Types
  // =============================================================================

  export interface ColumnVisibilityState {
    /** Whether the Property column is visible (default: false) */
    property: boolean;
  }

  export interface UseColumnVisibilityReturn {
    /** Current visibility state for all columns */
    columnVisibility: ColumnVisibilityState;
    /** Toggle visibility of a specific column */
    toggleColumn: (column: keyof ColumnVisibilityState) => void;
    /** Set visibility of a specific column */
    setColumnVisibility: (column: keyof ColumnVisibilityState, visible: boolean) => void;
    /** Check if a specific column is visible */
    isColumnVisible: (column: keyof ColumnVisibilityState) => boolean;
  }

  // =============================================================================
  // Default State
  // =============================================================================

  const DEFAULT_VISIBILITY: ColumnVisibilityState = {
    property: false, // Hidden by default as per requirements
  };

  // =============================================================================
  // Hook Implementation
  // =============================================================================

  export function useColumnVisibility(): UseColumnVisibilityReturn {
    const [columnVisibility, setVisibilityState] = useState<ColumnVisibilityState>(DEFAULT_VISIBILITY);

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
          console.warn('Failed to parse column visibility from sessionStorage:', e);
        }
      }
    }, []);

    // Persist to sessionStorage when state changes
    useEffect(() => {
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(columnVisibility));
        } catch (e) {
          console.warn('Failed to save column visibility to sessionStorage:', e);
        }
      }
    }, [columnVisibility]);

    const toggleColumn = useCallback((column: keyof ColumnVisibilityState) => {
      setVisibilityState((prev) => ({
        ...prev,
        [column]: !prev[column],
      }));
    }, []);

    const setColumnVisibility = useCallback((column: keyof ColumnVisibilityState, visible: boolean) => {
      setVisibilityState((prev) => ({
        ...prev,
        [column]: visible,
      }));
    }, []);

    const isColumnVisible = useCallback(
      (column: keyof ColumnVisibilityState) => columnVisibility[column],
      [columnVisibility]
    );

    return {
      columnVisibility,
      toggleColumn,
      setColumnVisibility,
      isColumnVisible,
    };
  }

  export default useColumnVisibility;
  ```
- [ ] **4.2** Add the `ColumnVisibilityState` interface to `ItemManager.types.ts` (after line 345, FilterState):
  ```typescript
  /**
   * Column visibility state for ItemList view.
   * Controls which optional columns are displayed.
   *
   * @lastModified 2026-01-13 (REQ-218)
   */
  export interface ColumnVisibilityState {
    /** Whether the Property column is visible */
    property: boolean;
  }
  ```
- [ ] **4.3** Update `src/components/ItemManager/hooks/index.ts` to export the new hook:
  ```typescript
  // =============================================================================
  // useColumnVisibility Hook (REQ-218)
  // =============================================================================

  export { useColumnVisibility } from './useColumnVisibility';
  export { default as useColumnVisibilityDefault } from './useColumnVisibility';
  export type {
    ColumnVisibilityState,
    UseColumnVisibilityReturn,
  } from './useColumnVisibility';
  ```
- [ ] **4.4** Verify the hook works by importing and testing in a component (defer full integration to Task 6)

---

## 5. Add Gear Icon and Column Settings Dropdown Popup to Table Header

**Context:** The table header needs a gear icon that opens a dropdown popup with column visibility toggles. Following the pattern from `SortMenu.tsx` which uses Radix UI DropdownMenu, create a similar component for column settings. The gear icon should be placed after the Created column header, before the Actions column.

**Files to modify:**
- `src/components/ItemManager/components/dialogs/ColumnSettingsPopup.tsx` (create new)
- `src/components/ItemManager/components/dialogs/index.ts`
- `src/components/ItemManager/components/ItemList.tsx`

**Estimated effort:** 1 story point

- [ ] **5.1** Create the new component file at `src/components/ItemManager/components/dialogs/ColumnSettingsPopup.tsx`:
  ```typescript
  'use client';

  /**
   * ColumnSettingsPopup Component
   *
   * Dropdown popup for toggling column visibility in ItemList.
   * Uses Radix UI DropdownMenu for accessible, keyboard-navigable menu.
   *
   * @module ItemManager/components/dialogs/ColumnSettingsPopup
   * @see docs/req-218-items-list-ui-improvements-Overview.md
   * @lastModified 2026-01-13 (REQ-218)
   */

  import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
  import { Settings2, Check } from 'lucide-react';
  import { cn } from '@/lib/utils';
  import type { ColumnVisibilityState } from '../../ItemManager.types';

  // ============================================================================
  // Types
  // ============================================================================

  export interface ColumnSettingsPopupProps {
    /** Current column visibility state */
    columnVisibility: ColumnVisibilityState;
    /** Callback to toggle a column's visibility */
    onToggleColumn: (column: keyof ColumnVisibilityState) => void;
    /** Custom class name for the trigger button */
    className?: string;
  }

  // ============================================================================
  // Column Configuration
  // ============================================================================

  interface ColumnOption {
    key: keyof ColumnVisibilityState;
    label: string;
  }

  const COLUMN_OPTIONS: ColumnOption[] = [
    { key: 'property', label: 'Property' },
  ];

  // ============================================================================
  // Component
  // ============================================================================

  export function ColumnSettingsPopup({
    columnVisibility,
    onToggleColumn,
    className,
  }: ColumnSettingsPopupProps) {
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

  export default ColumnSettingsPopup;
  ```
- [ ] **5.2** Update `src/components/ItemManager/components/dialogs/index.ts` to export the new component:
  ```typescript
  // Column Settings Popup (REQ-218)
  export { ColumnSettingsPopup } from './ColumnSettingsPopup';
  export type { ColumnSettingsPopupProps } from './ColumnSettingsPopup';
  ```
- [ ] **5.3** Add `ColumnVisibilityState` type export to `ItemManager.types.ts` if not already exported (Task 4.2 should have added the interface)
- [ ] **5.4** Verify the component renders correctly by temporarily adding it to ItemList (full integration in Task 6)

---

## 6. Integrate Column Visibility State and Conditional Rendering

**Context:** Connect all pieces: the `useColumnVisibility` hook, `ColumnSettingsPopup`, and conditional rendering of the Property column in both `ItemList` (header) and `ItemRow` (data cell). The visibility state needs to flow from ItemManager through ItemList to ItemRow.

**Files to modify:**
- `src/components/ItemManager/ItemManager.tsx`
- `src/components/ItemManager/components/ItemList.tsx`
- `src/components/ItemManager/components/ItemRow.tsx`
- `src/components/ItemManager/ItemManager.types.ts`

**Estimated effort:** 1 story point

- [ ] **6.1** In `ItemManager.tsx`, import and use the `useColumnVisibility` hook (after line 17):
  ```typescript
  import { useColumnVisibility } from './hooks/useColumnVisibility';
  ```
- [ ] **6.2** In `ItemManager.tsx`, call the hook in the component (after line 142, near other hooks):
  ```typescript
  const {
    columnVisibility,
    toggleColumn,
    isColumnVisible,
  } = useColumnVisibility();
  ```
- [ ] **6.3** Update `ItemListProps` in `ItemManager.types.ts` to include column visibility props (around line 632):
  ```typescript
  /** Column visibility state */
  columnVisibility?: ColumnVisibilityState;
  /** Callback to toggle column visibility */
  onToggleColumn?: (column: keyof ColumnVisibilityState) => void;
  ```
- [ ] **6.4** Update `ItemRowProps` in `ItemManager.types.ts` to include visibility flag (around line 547):
  ```typescript
  /** Whether the Property column is visible */
  showPropertyColumn?: boolean;
  ```
- [ ] **6.5** In `ItemManager.tsx`, pass column visibility to `ItemList` (around line 616):
  ```typescript
  <ItemList
    // ... existing props
    properties={properties}
    columnVisibility={columnVisibility}
    onToggleColumn={toggleColumn}
  />
  ```
- [ ] **6.6** In `ItemList.tsx`, import the `ColumnSettingsPopup` and add column visibility to props:
  ```typescript
  import { ColumnSettingsPopup } from './dialogs';
  import type { ItemListProps, ItemRecordExtended, SortOption, ColumnVisibilityState } from '../ItemManager.types';
  ```
- [ ] **6.7** In `ItemList.tsx`, destructure the new props (line 75):
  ```typescript
  export function ItemList({
    // ... existing props
    properties,
    columnVisibility,
    onToggleColumn,
  }: ItemListProps) {
  ```
- [ ] **6.8** In `ItemList.tsx`, wrap the Property column header with conditional rendering (around line 156):
  ```typescript
  {columnVisibility?.property && (
    <div role="columnheader" className="hidden lg:block w-32 flex-shrink-0">Property</div>
  )}
  ```
- [ ] **6.9** In `ItemList.tsx`, add the gear icon to the header row, before the Actions column (around line 169):
  ```typescript
  {/* Column Settings - positioned after Created column */}
  {onToggleColumn && columnVisibility && (
    <div role="columnheader" className="w-8 flex-shrink-0 hidden md:flex items-center justify-center">
      <ColumnSettingsPopup
        columnVisibility={columnVisibility}
        onToggleColumn={onToggleColumn}
      />
    </div>
  )}
  ```
- [ ] **6.10** In `ItemList.tsx`, pass `showPropertyColumn` to each `ItemRow` (around line 176):
  ```typescript
  <ItemRow
    key={item.id}
    // ... existing props
    propertyName={getPropertyName((item as ItemRecordExtended).propertyId)}
    showPropertyColumn={columnVisibility?.property}
  />
  ```
- [ ] **6.11** In `ItemRow.tsx`, add `showPropertyColumn` to destructured props (line 84):
  ```typescript
  export function ItemRow({
    // ... existing props
    propertyName,
    showPropertyColumn,
  }: ItemRowProps) {
  ```
- [ ] **6.12** In `ItemRow.tsx`, wrap the Property column data cell with conditional rendering:
  ```typescript
  {/* Property Column (REQ-218) - visible on lg+ screens when enabled */}
  {showPropertyColumn && (
    <div className="hidden lg:flex w-32 items-center flex-shrink-0 text-sm text-gray-500 truncate">
      {propertyName || '-'}
    </div>
  )}
  ```
- [ ] **6.13** Update the aria-label in `ItemRow.tsx` to conditionally include property:
  ```typescript
  const ariaLabel = `${item.title}. ${showPropertyColumn && propertyName ? `Property: ${propertyName}.` : ''} ...`;
  ```
- [ ] **6.14** Verify the complete flow works:
  - Navigate to `/dashboard2/items`
  - Confirm the Property column is hidden by default
  - Click the gear icon to open the dropdown
  - Toggle the Property checkbox ON
  - Verify the Property column appears with correct data
  - Refresh the page
  - Verify the Property column state persists within the session
  - Open a new tab and verify it starts with Property hidden (sessionStorage is per-tab)
- [ ] **6.15** Verify all existing functionality still works:
  - Search input clears properly
  - Selection mode works
  - Sorting works
  - Inline editing works
  - Row click navigates to edit page

---

## Testing Verification Tasks

**Context:** After all implementation tasks are complete, verify the full feature set works correctly.

**Estimated effort:** 0.5 story points

- [ ] **7.1** Visual verification - toolbar clutter removal:
  - Confirm "No filters applied" text is gone
  - Confirm "X of Y items" count is gone
  - Confirm SelectionIndicator still appears when items are selected
  - Confirm ClearFiltersButton still appears when filters are active
- [ ] **7.2** Search clear button verification:
  - Type "test" in search, click X, verify text clears and stays cleared
  - Type "test" in search, press Escape, verify text clears and stays cleared
  - Type rapidly, then clear, verify no race condition
- [ ] **7.3** Property column verification:
  - Toggle Property column ON via gear icon
  - Verify Property header appears in correct position (after Tags, before Created)
  - Verify Property data displays correctly for items with properties
  - Verify Property shows "-" for items without properties
  - Toggle Property column OFF
  - Verify Property column disappears from header and rows
- [ ] **7.4** Session persistence verification:
  - Set Property column to visible
  - Navigate away from page, then return
  - Verify Property column is still visible (same session)
  - Open new tab
  - Verify Property column is hidden (new session)
- [ ] **7.5** Responsive design verification:
  - Test on mobile viewport (Property column should not appear regardless of setting)
  - Test gear icon visibility on different screen sizes
- [ ] **7.6** Accessibility verification:
  - Verify gear icon has proper aria-label
  - Verify dropdown is keyboard navigable
  - Verify checkbox toggles work with keyboard

---

**Document generated:** 2026-01-13 16:30 PST
