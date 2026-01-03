# REQ-071: Implement ConfirmDeleteDialog - Detailed Task Breakdown

**Document Created:** 2026-01-03T20:15:00
**Last Modified:** 2026-01-03T20:15:00
**Request Reference:** REQ-071 (Delete Confirmation Dialog with Item Preview)
**Overview Document:** `/docs/REQ-071-implement-confirmdeletedialog-overview.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 3 - Selection & Bulk Actions
**Task ID:** 3.4

---

## Executive Summary

This document provides granular, actionable task breakdown for implementing the `ConfirmDeleteDialog` component. Each task is scoped to approximately 1 story point (a few hours of focused work) and includes specific verification steps.

The `ConfirmDeleteDialog` is a confirmation dialog that prevents accidental deletions by:
- Displaying item titles being deleted (up to 5, with overflow indicator)
- Using destructive styling to signal the irreversible action
- Providing clear cancel and confirm actions

---

## Prerequisites Checklist

Before starting implementation, verify the following are complete:

- [ ] Task 3.1 (`useItemSelection` hook) is implemented
- [ ] Task 3.2 (Selection UI Integration) is implemented
- [ ] Task 3.3 (`BulkActionsBar` component) is implemented
- [ ] Task 1.1 (ItemManager types) is implemented
- [ ] ItemManager directory structure exists at `src/components/ItemManager/`

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | Main delete confirmation dialog component |
| `src/components/ItemManager/components/dialogs/index.ts` | Barrel exports for dialogs directory |
| `src/components/ItemManager/components/dialogs/__tests__/ConfirmDeleteDialog.test.tsx` | Unit tests for ConfirmDeleteDialog |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemManager/ItemManager.tsx` | Integrate ConfirmDeleteDialog, add delete flow handlers |
| `src/components/ItemManager/components/index.ts` | Add barrel export for dialogs directory |
| `src/components/ItemManager/ItemManager.types.ts` | Add `ConfirmDeleteDialogProps` interface (if not present) |

---

## Detailed Task Breakdown

### Task 3.4.1: Create Dialogs Directory and Barrel Export

**Estimated Effort:** 15 minutes
**Dependencies:** None (can start immediately)

#### Description
Create the dialogs directory structure and initial barrel export file.

#### Implementation Steps

1. Create directory: `src/components/ItemManager/components/dialogs/`

2. Create barrel export file `src/components/ItemManager/components/dialogs/index.ts`:

```typescript
/**
 * Dialogs Components Barrel Export
 * @module ItemManager/components/dialogs
 * @lastModified 2026-01-03 (REQ-071)
 */

// ConfirmDeleteDialog will be exported here after implementation
// export { ConfirmDeleteDialog } from './ConfirmDeleteDialog';
// export type { ConfirmDeleteDialogProps } from './ConfirmDeleteDialog';
```

3. Update `src/components/ItemManager/components/index.ts` to include dialogs:

```typescript
// Add to existing exports
export * from './dialogs';
```

#### Verification Steps

- [ ] Directory `src/components/ItemManager/components/dialogs/` exists
- [ ] File `src/components/ItemManager/components/dialogs/index.ts` exists
- [ ] TypeScript compiles without errors: `npx tsc --noEmit`

---

### Task 3.4.2: Define ConfirmDeleteDialogProps Interface

**Estimated Effort:** 30 minutes
**Dependencies:** Task 3.4.1

#### Description
Define the TypeScript interface for ConfirmDeleteDialog props in the types file.

#### Implementation Steps

1. Open `src/components/ItemManager/ItemManager.types.ts`

2. Add the following interface (if not already present):

```typescript
/**
 * Props for ConfirmDeleteDialog component.
 * @see REQ-071 - Delete Confirmation Dialog with Item Preview
 */
export interface ConfirmDeleteDialogProps {
  /** Whether the dialog is currently open */
  isOpen: boolean;

  /** Items selected for deletion - used to display titles and count */
  items: ItemRecord[];

  /** Callback invoked when user confirms deletion */
  onConfirm: () => void;

  /** Callback invoked when user cancels/dismisses dialog */
  onCancel: () => void;

  /** Whether delete operation is in progress (shows loading state) */
  loading?: boolean;

  /** Optional custom title (overrides default based on item count) */
  title?: string;

  /** Optional additional CSS classes for the dialog container */
  className?: string;
}
```

3. Ensure `ItemRecord` type is imported or available in the same file

#### Verification Steps

- [ ] Interface `ConfirmDeleteDialogProps` is exported from types file
- [ ] TypeScript compiles without errors: `npx tsc --noEmit`
- [ ] All required props (`isOpen`, `items`, `onConfirm`, `onCancel`) are defined
- [ ] Optional props have `?` modifier

---

### Task 3.4.3: Implement Helper Functions

**Estimated Effort:** 45 minutes
**Dependencies:** Task 3.4.2

#### Description
Implement the helper functions for formatting item lists and generating text content.

#### Implementation Steps

1. Create file `src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` with helper functions:

```typescript
'use client';

/**
 * ConfirmDeleteDialog Component
 *
 * Confirmation dialog displayed before deleting items in ItemManager.
 * Shows item titles (up to 5) and overflow count for bulk deletions.
 *
 * @module ItemManager/components/dialogs/ConfirmDeleteDialog
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 3, Task 3.4)
 * @lastModified 2026-01-03 (REQ-071)
 */

import type { ItemRecord } from '@/components/ItemCapture';

// =============================================================================
// Constants
// =============================================================================

/** Maximum number of item titles to display before showing overflow */
const MAX_VISIBLE_ITEMS = 5;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Format item list for display with overflow handling.
 *
 * @param items - Array of items to format
 * @param maxVisible - Maximum number of items to display (default: 5)
 * @returns Object with visible items and overflow count
 */
export function formatItemList(
  items: ItemRecord[],
  maxVisible: number = MAX_VISIBLE_ITEMS
): {
  visibleItems: ItemRecord[];
  overflowCount: number;
} {
  if (items.length <= maxVisible) {
    return { visibleItems: items, overflowCount: 0 };
  }
  return {
    visibleItems: items.slice(0, maxVisible),
    overflowCount: items.length - maxVisible,
  };
}

/**
 * Generate appropriate title based on item count.
 *
 * @param count - Number of items being deleted
 * @param customTitle - Optional custom title to use instead
 * @returns Dialog title string
 */
export function getDeleteTitle(count: number, customTitle?: string): string {
  if (customTitle) return customTitle;
  return count === 1 ? 'Delete Item' : 'Delete Items';
}

/**
 * Generate confirmation message based on item count.
 *
 * @param count - Number of items being deleted
 * @returns Confirmation message string
 */
export function getDeleteMessage(count: number): string {
  if (count === 1) {
    return 'Are you sure you want to delete this item? This action cannot be undone.';
  }
  return `Are you sure you want to delete these ${count} items? This action cannot be undone.`;
}

/**
 * Generate confirm button text based on item count.
 *
 * @param count - Number of items being deleted
 * @returns Button text string
 */
export function getConfirmButtonText(count: number): string {
  if (count === 1) {
    return 'Delete';
  }
  return `Delete ${count} Items`;
}

// TODO: Task 3.4.4 - Add ConfirmDeleteDialog component implementation
```

#### Verification Steps

- [ ] File compiles without TypeScript errors
- [ ] `formatItemList` returns correct structure for <= 5 items
- [ ] `formatItemList` returns correct structure for > 5 items
- [ ] `getDeleteTitle` returns "Delete Item" for count=1
- [ ] `getDeleteTitle` returns "Delete Items" for count > 1
- [ ] `getDeleteMessage` returns singular message for count=1
- [ ] `getDeleteMessage` includes count in plural message
- [ ] `getConfirmButtonText` returns "Delete" for count=1
- [ ] `getConfirmButtonText` returns "Delete N Items" for count > 1

---

### Task 3.4.4: Implement ConfirmDeleteDialog Component Structure

**Estimated Effort:** 1.5 hours
**Dependencies:** Task 3.4.3

#### Description
Implement the main ConfirmDeleteDialog component with layout, styling, and accessibility.

#### Implementation Steps

1. Continue in `src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`:

```typescript
// Add imports at top of file
import { AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Add after helper functions section:

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Props for ConfirmDeleteDialog component.
 */
export interface ConfirmDeleteDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;

  /** Items selected for deletion */
  items: ItemRecord[];

  /** Callback when deletion is confirmed */
  onConfirm: () => void;

  /** Callback when dialog is cancelled/dismissed */
  onCancel: () => void;

  /** Loading state during delete operation */
  loading?: boolean;

  /** Optional custom title */
  title?: string;

  /** Optional additional CSS classes */
  className?: string;
}

// =============================================================================
// Main Component
// =============================================================================

/**
 * Confirmation dialog for deleting items.
 *
 * Displays item titles (up to 5) with overflow indicator for bulk deletions.
 * Uses destructive button styling to emphasize the irreversible nature.
 *
 * @example
 * <ConfirmDeleteDialog
 *   isOpen={showDeleteDialog}
 *   items={selectedItems}
 *   onConfirm={handleConfirmDelete}
 *   onCancel={() => setShowDeleteDialog(false)}
 *   loading={isDeleting}
 * />
 */
export function ConfirmDeleteDialog({
  isOpen,
  items,
  onConfirm,
  onCancel,
  loading = false,
  title,
  className,
}: ConfirmDeleteDialogProps) {
  // Don't render if not open or no items
  if (!isOpen || items.length === 0) {
    return null;
  }

  const itemCount = items.length;
  const { visibleItems, overflowCount } = formatItemList(items);

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !loading) {
      e.preventDefault();
      onCancel();
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <div
        className={cn(
          'bg-white rounded-lg shadow-xl max-w-md w-full mx-4',
          'animate-in fade-in zoom-in-95 duration-200',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with warning icon */}
        <div className="flex items-start gap-4 p-6 pb-4">
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="w-6 h-6 text-red-600" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3
              id="delete-dialog-title"
              className="text-lg font-semibold text-gray-900"
            >
              {getDeleteTitle(itemCount, title)}
            </h3>
            <p
              id="delete-dialog-description"
              className="mt-2 text-sm text-gray-600"
            >
              {getDeleteMessage(itemCount)}
            </p>
          </div>
        </div>

        {/* Item list */}
        <div className="px-6 pb-4">
          <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
            <ul className="space-y-2" aria-label="Items to be deleted">
              {visibleItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <span className="text-gray-400 mt-0.5" aria-hidden="true">•</span>
                  <span className="flex-1 truncate" title={item.title}>
                    {item.title}
                  </span>
                </li>
              ))}
              {overflowCount > 0 && (
                <li className="flex items-start gap-2 text-sm text-gray-500 italic">
                  <span className="text-gray-400 mt-0.5" aria-hidden="true">•</span>
                  <span>and {overflowCount} more</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={cn(
              'flex-1 px-4 py-2.5 text-sm font-medium rounded-lg',
              'text-gray-700 bg-gray-100',
              'hover:bg-gray-200 active:bg-gray-300',
              'transition-colors duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'flex-1 px-4 py-2.5 text-sm font-medium rounded-lg',
              'text-white bg-red-600',
              'hover:bg-red-700 active:bg-red-800',
              'transition-colors duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'inline-flex items-center justify-center gap-2'
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Deleting...</span>
              </>
            ) : (
              getConfirmButtonText(itemCount)
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteDialog;
```

#### Verification Steps

- [ ] Component renders when `isOpen=true` and `items.length > 0`
- [ ] Component returns `null` when `isOpen=false`
- [ ] Component returns `null` when `items.length === 0`
- [ ] Warning icon (AlertTriangle) displays in red circle
- [ ] Title displays correctly for single and multiple items
- [ ] Message displays correctly for single and multiple items
- [ ] Item list displays up to 5 items
- [ ] Overflow indicator shows when > 5 items
- [ ] Cancel button has gray styling
- [ ] Delete button has red destructive styling
- [ ] Loading spinner shows when `loading=true`
- [ ] Buttons are disabled when `loading=true`
- [ ] Dialog has proper ARIA attributes (`role="alertdialog"`, `aria-modal="true"`)

---

### Task 3.4.5: Update Dialogs Barrel Export

**Estimated Effort:** 15 minutes
**Dependencies:** Task 3.4.4

#### Description
Update the barrel export file to export the ConfirmDeleteDialog component and its types.

#### Implementation Steps

1. Update `src/components/ItemManager/components/dialogs/index.ts`:

```typescript
/**
 * Dialogs Components Barrel Export
 * @module ItemManager/components/dialogs
 * @lastModified 2026-01-03 (REQ-071)
 */

export { ConfirmDeleteDialog } from './ConfirmDeleteDialog';
export type { ConfirmDeleteDialogProps } from './ConfirmDeleteDialog';

// Export helper functions for testing
export {
  formatItemList,
  getDeleteTitle,
  getDeleteMessage,
  getConfirmButtonText,
} from './ConfirmDeleteDialog';

// Future dialog exports:
// export { FilterPanel } from './FilterPanel';
// export { SortMenu } from './SortMenu';
```

#### Verification Steps

- [ ] `ConfirmDeleteDialog` can be imported from `./components/dialogs`
- [ ] `ConfirmDeleteDialogProps` type can be imported
- [ ] Helper functions can be imported for testing
- [ ] TypeScript compiles without errors: `npx tsc --noEmit`

---

### Task 3.4.6: Integrate ConfirmDeleteDialog into ItemManager

**Estimated Effort:** 1.5 hours
**Dependencies:** Task 3.4.5, Task 3.3 (BulkActionsBar)

#### Description
Integrate the ConfirmDeleteDialog into the main ItemManager component with proper state management and handlers.

#### Implementation Steps

1. Open `src/components/ItemManager/ItemManager.tsx`

2. Add import at top of file:
```typescript
import { ConfirmDeleteDialog } from './components/dialogs';
```

3. Add state for delete dialog:
```typescript
// Add inside component function
const [showDeleteDialog, setShowDeleteDialog] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);
```

4. Add memoized selected items:
```typescript
// Get items for deletion based on selected IDs
const selectedItems = useMemo(() => {
  if (!selectedIds || selectedIds.size === 0) return [];
  return items.filter(item => selectedIds.has(item.id));
}, [items, selectedIds]);
```

5. Add delete handlers:
```typescript
/**
 * Opens the delete confirmation dialog.
 * Triggered by BulkActionsBar delete button.
 */
const handleDeleteRequest = useCallback(() => {
  if (selectedIds && selectedIds.size > 0) {
    setShowDeleteDialog(true);
  }
}, [selectedIds]);

/**
 * Handles confirmed delete action.
 * Calls onDeleteItems callback and manages loading state.
 */
const handleConfirmDelete = useCallback(async () => {
  if (!selectedIds || selectedIds.size === 0) return;

  const idsToDelete = Array.from(selectedIds);

  setIsDeleting(true);
  try {
    await onDeleteItems(idsToDelete);
    // Clear selection after successful delete
    clearSelection?.();
    setShowDeleteDialog(false);
  } catch (error) {
    console.error('Delete operation failed:', error);
    // Dialog stays open on error so user can retry or cancel
  } finally {
    setIsDeleting(false);
  }
}, [selectedIds, onDeleteItems, clearSelection]);

/**
 * Handles cancel/dismiss of delete dialog.
 */
const handleCancelDelete = useCallback(() => {
  if (!isDeleting) {
    setShowDeleteDialog(false);
  }
}, [isDeleting]);
```

6. Pass `handleDeleteRequest` to BulkActionsBar:
```typescript
<BulkActionsBar
  selectedCount={selectedIds?.size ?? 0}
  onDelete={handleDeleteRequest}
  // ... other props
/>
```

7. Add ConfirmDeleteDialog to JSX:
```typescript
{/* Delete Confirmation Dialog */}
<ConfirmDeleteDialog
  isOpen={showDeleteDialog}
  items={selectedItems}
  onConfirm={handleConfirmDelete}
  onCancel={handleCancelDelete}
  loading={isDeleting}
/>
```

#### Verification Steps

- [ ] Delete dialog opens when clicking delete in BulkActionsBar
- [ ] Dialog shows correct item count and titles
- [ ] Clicking Cancel closes dialog without deletion
- [ ] Clicking Delete triggers `onDeleteItems` callback
- [ ] Loading state shows during deletion
- [ ] Selection is cleared after successful deletion
- [ ] Dialog closes after successful deletion
- [ ] Dialog stays open if deletion fails (allows retry)
- [ ] Escape key closes dialog (when not loading)
- [ ] Backdrop click closes dialog (when not loading)

---

### Task 3.4.7: Write Unit Tests for Helper Functions

**Estimated Effort:** 1 hour
**Dependencies:** Task 3.4.3

#### Description
Create unit tests for the helper functions in ConfirmDeleteDialog.

#### Implementation Steps

1. Create test file `src/components/ItemManager/components/dialogs/__tests__/ConfirmDeleteDialog.test.tsx`:

```typescript
/**
 * ConfirmDeleteDialog Component Tests
 *
 * @module ItemManager/components/dialogs/__tests__/ConfirmDeleteDialog.test
 * @lastModified 2026-01-03 (REQ-071)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ConfirmDeleteDialog,
  formatItemList,
  getDeleteTitle,
  getDeleteMessage,
  getConfirmButtonText,
} from '../ConfirmDeleteDialog';
import type { ItemRecord } from '@/components/ItemCapture';

// =============================================================================
// Test Utilities
// =============================================================================

/**
 * Factory function to create mock ItemRecord objects.
 */
function createMockItem(id: string, title: string): ItemRecord {
  return {
    id,
    title,
    contentType: 'media',
    media: [],
    createdAt: new Date(),
  };
}

/**
 * Create array of mock items for testing.
 */
function createMockItems(count: number): ItemRecord[] {
  return Array.from({ length: count }, (_, i) =>
    createMockItem(`item-${i + 1}`, `Item ${i + 1}`)
  );
}

// =============================================================================
// Helper Function Tests
// =============================================================================

describe('formatItemList', () => {
  it('returns all items when count is <= 5', () => {
    const items = createMockItems(3);
    const result = formatItemList(items);

    expect(result.visibleItems).toHaveLength(3);
    expect(result.overflowCount).toBe(0);
  });

  it('returns exactly 5 items when count is 5', () => {
    const items = createMockItems(5);
    const result = formatItemList(items);

    expect(result.visibleItems).toHaveLength(5);
    expect(result.overflowCount).toBe(0);
  });

  it('returns first 5 items with overflow when count > 5', () => {
    const items = createMockItems(8);
    const result = formatItemList(items);

    expect(result.visibleItems).toHaveLength(5);
    expect(result.overflowCount).toBe(3);
  });

  it('respects custom maxVisible parameter', () => {
    const items = createMockItems(5);
    const result = formatItemList(items, 3);

    expect(result.visibleItems).toHaveLength(3);
    expect(result.overflowCount).toBe(2);
  });

  it('handles empty array', () => {
    const result = formatItemList([]);

    expect(result.visibleItems).toHaveLength(0);
    expect(result.overflowCount).toBe(0);
  });
});

describe('getDeleteTitle', () => {
  it('returns "Delete Item" for single item', () => {
    expect(getDeleteTitle(1)).toBe('Delete Item');
  });

  it('returns "Delete Items" for multiple items', () => {
    expect(getDeleteTitle(2)).toBe('Delete Items');
    expect(getDeleteTitle(10)).toBe('Delete Items');
  });

  it('returns custom title when provided', () => {
    expect(getDeleteTitle(1, 'Custom Title')).toBe('Custom Title');
    expect(getDeleteTitle(5, 'Custom Title')).toBe('Custom Title');
  });
});

describe('getDeleteMessage', () => {
  it('returns singular message for single item', () => {
    const message = getDeleteMessage(1);
    expect(message).toContain('this item');
    expect(message).not.toContain('these');
  });

  it('returns plural message with count for multiple items', () => {
    const message = getDeleteMessage(5);
    expect(message).toContain('these 5 items');
  });

  it('always includes "cannot be undone" warning', () => {
    expect(getDeleteMessage(1)).toContain('cannot be undone');
    expect(getDeleteMessage(10)).toContain('cannot be undone');
  });
});

describe('getConfirmButtonText', () => {
  it('returns "Delete" for single item', () => {
    expect(getConfirmButtonText(1)).toBe('Delete');
  });

  it('returns "Delete N Items" for multiple items', () => {
    expect(getConfirmButtonText(2)).toBe('Delete 2 Items');
    expect(getConfirmButtonText(100)).toBe('Delete 100 Items');
  });
});
```

#### Verification Steps

- [ ] All helper function tests pass
- [ ] Tests run without errors: `npm test -- --testPathPattern="ConfirmDeleteDialog"`
- [ ] Test coverage for edge cases (empty array, single item, boundary of 5 items)

---

### Task 3.4.8: Write Unit Tests for Component Rendering

**Estimated Effort:** 1.5 hours
**Dependencies:** Task 3.4.4, Task 3.4.7

#### Description
Create unit tests for the ConfirmDeleteDialog component rendering and behavior.

#### Implementation Steps

1. Add to test file `src/components/ItemManager/components/dialogs/__tests__/ConfirmDeleteDialog.test.tsx`:

```typescript
// Add after helper function tests

// =============================================================================
// Component Rendering Tests
// =============================================================================

describe('ConfirmDeleteDialog', () => {
  const mockItems = [
    createMockItem('1', 'Coffee Maker Instructions'),
    createMockItem('2', 'Dishwasher Guide'),
    createMockItem('3', 'HVAC Control Panel'),
  ];

  const defaultProps = {
    isOpen: true,
    items: mockItems,
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders when isOpen is true and items exist', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<ConfirmDeleteDialog {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('does not render when items array is empty', () => {
      render(<ConfirmDeleteDialog {...defaultProps} items={[]} />);
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('shows "Delete Item" title for single item', () => {
      render(<ConfirmDeleteDialog {...defaultProps} items={[mockItems[0]]} />);
      expect(screen.getByText('Delete Item')).toBeInTheDocument();
    });

    it('shows "Delete Items" title for multiple items', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      expect(screen.getByText('Delete Items')).toBeInTheDocument();
    });

    it('displays custom title when provided', () => {
      render(<ConfirmDeleteDialog {...defaultProps} title="Remove Content" />);
      expect(screen.getByText('Remove Content')).toBeInTheDocument();
    });

    it('displays all item titles when 5 or fewer', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      expect(screen.getByText('Coffee Maker Instructions')).toBeInTheDocument();
      expect(screen.getByText('Dishwasher Guide')).toBeInTheDocument();
      expect(screen.getByText('HVAC Control Panel')).toBeInTheDocument();
    });

    it('shows overflow count when more than 5 items', () => {
      const manyItems = createMockItems(8);
      render(<ConfirmDeleteDialog {...defaultProps} items={manyItems} />);
      expect(screen.getByText('and 3 more')).toBeInTheDocument();
    });

    it('displays correct button text for single item', () => {
      render(<ConfirmDeleteDialog {...defaultProps} items={[mockItems[0]]} />);
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });

    it('displays correct button text for multiple items', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Delete 3 Items' })).toBeInTheDocument();
    });
  });

  describe('User Actions', () => {
    it('calls onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup();
      render(<ConfirmDeleteDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Delete 3 Items' }));
      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<ConfirmDeleteDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when Escape key is pressed', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);

      fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' });
      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when backdrop is clicked', async () => {
      const user = userEvent.setup();
      render(<ConfirmDeleteDialog {...defaultProps} />);

      // Click on the outer overlay div (backdrop)
      const backdrop = screen.getByRole('alertdialog').parentElement;
      if (backdrop) {
        await user.click(backdrop);
      }
      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('does not call onCancel when dialog content is clicked', async () => {
      const user = userEvent.setup();
      render(<ConfirmDeleteDialog {...defaultProps} />);

      await user.click(screen.getByText('Delete Items'));
      expect(defaultProps.onCancel).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('disables both buttons when loading', () => {
      render(<ConfirmDeleteDialog {...defaultProps} loading={true} />);

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
      expect(screen.getByRole('button', { name: /deleting/i })).toBeDisabled();
    });

    it('shows loading text and spinner when loading', () => {
      render(<ConfirmDeleteDialog {...defaultProps} loading={true} />);

      expect(screen.getByText('Deleting...')).toBeInTheDocument();
    });

    it('does not close on Escape when loading', () => {
      render(<ConfirmDeleteDialog {...defaultProps} loading={true} />);

      fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' });
      expect(defaultProps.onCancel).not.toHaveBeenCalled();
    });

    it('does not close on backdrop click when loading', async () => {
      const user = userEvent.setup();
      render(<ConfirmDeleteDialog {...defaultProps} loading={true} />);

      const backdrop = screen.getByRole('alertdialog').parentElement;
      if (backdrop) {
        await user.click(backdrop);
      }
      expect(defaultProps.onCancel).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has role="alertdialog"', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('has aria-modal="true"', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      expect(screen.getByRole('alertdialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('has aria-labelledby pointing to title', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      const dialog = screen.getByRole('alertdialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'delete-dialog-title');
    });

    it('has aria-describedby pointing to description', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      const dialog = screen.getByRole('alertdialog');
      expect(dialog).toHaveAttribute('aria-describedby', 'delete-dialog-description');
    });

    it('has accessible item list with proper aria-label', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      expect(screen.getByRole('list', { name: 'Items to be deleted' })).toBeInTheDocument();
    });
  });
});
```

#### Verification Steps

- [ ] All component rendering tests pass
- [ ] All user action tests pass
- [ ] All loading state tests pass
- [ ] All accessibility tests pass
- [ ] Test suite runs without errors: `npm test -- --testPathPattern="ConfirmDeleteDialog"`

---

### Task 3.4.9: Integration Testing with ItemManager

**Estimated Effort:** 1 hour
**Dependencies:** Task 3.4.6

#### Description
Write integration tests to verify the delete flow works end-to-end within ItemManager.

#### Implementation Steps

1. Create or add to `src/components/ItemManager/__tests__/ItemManager.deleteFlow.test.tsx`:

```typescript
/**
 * ItemManager Delete Flow Integration Tests
 *
 * @module ItemManager/__tests__/ItemManager.deleteFlow.test
 * @lastModified 2026-01-03 (REQ-071)
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemManager } from '../ItemManager';
import type { ItemRecord } from '@/components/ItemCapture';

// Mock items for testing
const mockItems: ItemRecord[] = [
  { id: '1', title: 'Item One', contentType: 'media', media: [], createdAt: new Date() },
  { id: '2', title: 'Item Two', contentType: 'media', media: [], createdAt: new Date() },
  { id: '3', title: 'Item Three', contentType: 'media', media: [], createdAt: new Date() },
];

describe('ItemManager Delete Flow', () => {
  const mockHandlers = {
    onEditItem: jest.fn(),
    onDeleteItems: jest.fn().mockResolvedValue(undefined),
    onUpdateItem: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens delete dialog when delete action is triggered with selection', async () => {
    const user = userEvent.setup();
    render(
      <ItemManager
        items={mockItems}
        {...mockHandlers}
        config={{ enableBulkActions: true }}
      />
    );

    // Select an item (implementation depends on your selection UI)
    // ... select item logic ...

    // Click delete in BulkActionsBar
    // ... trigger delete action ...

    // Verify dialog appears
    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });
  });

  it('calls onDeleteItems with correct IDs when confirmed', async () => {
    const user = userEvent.setup();
    render(
      <ItemManager
        items={mockItems}
        {...mockHandlers}
        config={{ enableBulkActions: true }}
      />
    );

    // ... select items and trigger delete ...

    // Confirm deletion
    await user.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(mockHandlers.onDeleteItems).toHaveBeenCalledWith(
        expect.arrayContaining(['1', '2']) // IDs of selected items
      );
    });
  });

  it('closes dialog and clears selection after successful delete', async () => {
    const user = userEvent.setup();
    render(
      <ItemManager
        items={mockItems}
        {...mockHandlers}
        config={{ enableBulkActions: true }}
      />
    );

    // ... select and delete flow ...

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  });

  it('keeps dialog open if delete fails', async () => {
    mockHandlers.onDeleteItems.mockRejectedValueOnce(new Error('Delete failed'));

    const user = userEvent.setup();
    render(
      <ItemManager
        items={mockItems}
        {...mockHandlers}
        config={{ enableBulkActions: true }}
      />
    );

    // ... trigger delete flow ...

    // Confirm deletion
    await user.click(screen.getByRole('button', { name: /delete/i }));

    // Dialog should still be visible
    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });
  });

  it('cancelling delete preserves selection', async () => {
    const user = userEvent.setup();
    render(
      <ItemManager
        items={mockItems}
        {...mockHandlers}
        config={{ enableBulkActions: true }}
      />
    );

    // ... select items and open delete dialog ...

    // Cancel deletion
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    // Selection should still be visible
    // ... verify selection is preserved ...
  });
});
```

#### Verification Steps

- [ ] Delete flow integration tests pass
- [ ] Dialog opens when delete is triggered with selection
- [ ] `onDeleteItems` is called with correct item IDs
- [ ] Dialog closes after successful deletion
- [ ] Selection is cleared after successful deletion
- [ ] Dialog stays open on deletion failure
- [ ] Cancel preserves selection state

---

### Task 3.4.10: Manual Testing and Verification

**Estimated Effort:** 1 hour
**Dependencies:** All previous tasks

#### Description
Perform manual testing to verify all functionality works correctly across devices and browsers.

#### Manual Testing Checklist

**Desktop Testing (Chrome, Firefox, Safari, Edge):**
- [ ] Dialog opens centered on screen
- [ ] Backdrop dims the background content
- [ ] Warning icon (red triangle) displays correctly
- [ ] Single item: Shows "Delete Item" title and "Delete" button
- [ ] Multiple items (2-5): Shows all item titles
- [ ] Multiple items (6+): Shows 5 titles + "and X more"
- [ ] Cancel button closes dialog
- [ ] Delete button triggers deletion and shows loading
- [ ] Escape key closes dialog
- [ ] Backdrop click closes dialog
- [ ] Tab key cycles focus between Cancel and Delete buttons
- [ ] Focus ring visible on keyboard navigation
- [ ] Animation plays on dialog open

**Mobile Testing (iOS Safari, Chrome Android):**
- [ ] Dialog is responsive and fits screen
- [ ] Buttons have adequate touch target size (min 44x44px)
- [ ] Item list scrolls if content overflows
- [ ] Text is readable at default zoom
- [ ] No horizontal scroll on dialog

**Accessibility Testing:**
- [ ] Screen reader announces dialog as "alert dialog"
- [ ] Screen reader reads title and message
- [ ] Item list is announced as "Items to be deleted"
- [ ] Focus is trapped within dialog when open
- [ ] Loading state is announced

**Edge Cases:**
- [ ] Works with items that have very long titles (truncation with ellipsis)
- [ ] Works with exactly 5 items (no overflow)
- [ ] Works with 6 items (shows "and 1 more")
- [ ] Rapid clicking doesn't cause issues
- [ ] Multiple Escape presses don't cause issues

#### Verification Steps

- [ ] All desktop tests pass
- [ ] All mobile tests pass
- [ ] All accessibility tests pass
- [ ] All edge case tests pass
- [ ] No console errors during testing
- [ ] Performance is smooth (no jank on open/close)

---

## Implementation Sequence Summary

| Order | Task ID | Description | Est. Time |
|-------|---------|-------------|-----------|
| 1 | 3.4.1 | Create dialogs directory and barrel export | 15 min |
| 2 | 3.4.2 | Define ConfirmDeleteDialogProps interface | 30 min |
| 3 | 3.4.3 | Implement helper functions | 45 min |
| 4 | 3.4.4 | Implement ConfirmDeleteDialog component | 1.5 hrs |
| 5 | 3.4.5 | Update dialogs barrel export | 15 min |
| 6 | 3.4.6 | Integrate into ItemManager | 1.5 hrs |
| 7 | 3.4.7 | Write unit tests for helper functions | 1 hr |
| 8 | 3.4.8 | Write unit tests for component | 1.5 hrs |
| 9 | 3.4.9 | Integration testing | 1 hr |
| 10 | 3.4.10 | Manual testing and verification | 1 hr |
| **Total** | | | **~9 hours** |

---

## Acceptance Criteria Mapping

| Requirement (from REQ-071) | Task(s) | Verification |
|---------------------------|---------|--------------|
| Confirmation dialog appears when user attempts to delete | 3.4.6 | Integration test + manual |
| Dialog displays accurate count of items | 3.4.3, 3.4.4 | Unit test for `getDeleteMessage` |
| Dialog shows titles of up to 5 items | 3.4.3, 3.4.4 | Unit test for `formatItemList` |
| Clear truncation message for additional items | 3.4.3, 3.4.4 | Unit test + component test |
| Confirm button uses destructive styling | 3.4.4 | Manual verification |
| Cancel button dismisses dialog without deletion | 3.4.4, 3.4.6 | Component test + integration test |

---

## Related Documents

- [Overview Document](/docs/REQ-071-implement-confirmdeletedialog-overview.md)
- [Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md)
- [BulkActionsBar Overview](/docs/REQ-070-build-bulkactionsbar-component-overview.md)
- [useItemSelection Hook](/docs/REQ-068-create-useitemselection-hook-overview.md)
- [Existing ConfirmationModal](/src/components/ConfirmationModal.tsx) - Pattern reference

---

## Notes

- All tasks in this breakdown are <= 1 story point
- Tasks can be completed by a junior developer following the instructions
- Each task has specific verification steps to confirm completion
- Integration with ItemManager (Task 3.4.6) depends on BulkActionsBar being implemented (Task 3.3)
- If BulkActionsBar is not yet available, Task 3.4.6 can be stubbed and completed later
