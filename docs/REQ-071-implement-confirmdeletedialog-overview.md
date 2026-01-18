# REQ-071: Implement ConfirmDeleteDialog - Technical Implementation Overview

**Document Created:** 2026-01-03T19:30:00
**Last Modified:** 2026-01-03T19:30:00
**Request Reference:** REQ-071 (Delete Confirmation Dialog with Item Preview)
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 3 - Selection & Bulk Actions
**Task ID:** 3.4

---

## 1. Executive Summary

This document provides the technical implementation breakdown for building the `ConfirmDeleteDialog` component (Task 3.4 in Phase 3). This dialog provides users with a clear confirmation step before deleting items, displaying the items to be deleted and requiring explicit confirmation for this destructive action.

### Scope

The `ConfirmDeleteDialog` component will:
- Display a confirmation dialog when user initiates deletion (single or bulk)
- Show the accurate count of items to be deleted
- Display titles of up to 5 items being deleted
- Show overflow indicator when more than 5 items selected (e.g., "and 3 more")
- Provide a destructive-styled confirm button (red) to signal danger
- Provide a cancel button to dismiss without deletion
- Support loading state during deletion operation
- Follow existing modal patterns from `src/components/ConfirmationModal.tsx`

### Dependencies

- **Prerequisite Tasks:**
  - Task 3.1: `useItemSelection` hook (`src/components/ItemManager/hooks/useItemSelection.ts`)
  - Task 3.2: Selection UI Integration
  - Task 3.3: `BulkActionsBar` component (trigger for bulk delete)
  - Task 1.1: ItemManager types (`src/components/ItemManager/ItemManager.types.ts`)

- **Parallel Tasks:**
  - Task 3.5: BulkTagDialog (can be developed simultaneously)

- **Downstream Tasks:**
  - Task 3.6: BulkMoveDialog (similar pattern)

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

**Existing ConfirmationModal Pattern (from `src/components/ConfirmationModal.tsx`):**

```typescript
interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  confirmButtonColor?: 'red' | 'blue' | 'green';
}

// Layout pattern
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white rounded-lg p-6 max-w-md mx-4 w-full">
    <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
    <p className="text-gray-600 mb-6">{message}</p>
    <div className="flex space-x-3">
      {/* Cancel and Confirm buttons */}
    </div>
  </div>
</div>
```

**Button Styling Pattern:**
```typescript
// Destructive action (red)
<button className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors">

// Cancel/Secondary action
<button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors">
```

### 2.3 Types from Implementation Plan

From `ItemManager.types.ts` (Phase 1):

```typescript
// ItemRecord type (from ItemCapture)
interface ItemRecord {
  id: string;
  title: string;
  location?: string;
  tags?: string[];
  applianceType?: ApplianceType;
  contentType: 'media' | 'text-only' | 'pdf-only' | 'mixed';
  media: MediaItem[];
  instructions?: string;
  createdAt: Date;
}

// Delete callback
onDeleteItems: (ids: string[]) => void;

// Config labels
interface ItemManagerLabels {
  deleteConfirmTitle?: string;
  deleteConfirmMessage?: string;
}
```

### 2.4 Default Labels from Implementation Plan

From `src/components/ItemManager/utils/constants.ts`:

```typescript
labels: {
  deleteConfirmTitle: 'Delete Item',
  deleteConfirmMessage: 'Are you sure you want to delete this item? This action cannot be undone.',
}
```

---

## 3. Implementation Approach

### 3.1 Component Architecture

The `ConfirmDeleteDialog` is a controlled dialog component that receives item data and callbacks from the parent. It follows the existing modal pattern but extends it to display item previews.

```typescript
interface ConfirmDeleteDialogProps {
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

  /** Optional custom title (default: from labels) */
  title?: string;

  /** Optional additional CSS classes */
  className?: string;
}
```

### 3.2 Visual Layout

The dialog displays item information in a structured format:

```
┌─────────────────────────────────────────────────────────────┐
│                        Delete Items                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Are you sure you want to delete these items?               │
│  This action cannot be undone.                              │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  • Coffee Maker Instructions                         │   │
│  │  • Dishwasher Guide                                  │   │
│  │  • HVAC Control Panel                                │   │
│  │  • Pool Heater Manual                                │   │
│  │  • Garage Door Opener                                │   │
│  │  └── and 3 more                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────┐  ┌─────────────────────────────────┐  │
│  │     Cancel      │  │        Delete 8 Items           │  │
│  └─────────────────┘  └─────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Item Display Logic

**Display Rules:**
1. **Single Item:** Show full title
   - "Delete Item: {item.title}"

2. **2-5 Items:** Show all titles as bulleted list
   - List each item title

3. **6+ Items:** Show first 5 titles + overflow count
   - List first 5 item titles
   - Show "and X more" indicator

**Helper Function:**
```typescript
function formatItemList(items: ItemRecord[], maxVisible: number = 5): {
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
```

### 3.4 Title/Message Variations

**Single Item Delete:**
- Title: "Delete Item"
- Message: "Are you sure you want to delete this item? This action cannot be undone."
- Button: "Delete"

**Bulk Delete (2+ items):**
- Title: "Delete Items"
- Message: "Are you sure you want to delete these {count} items? This action cannot be undone."
- Button: "Delete {count} Items"

### 3.5 Button Configuration

| Button | Label | Style | Behavior |
|--------|-------|-------|----------|
| Cancel | "Cancel" | Secondary gray | Calls `onCancel`, closes dialog |
| Confirm | "Delete" / "Delete X Items" | Destructive red | Calls `onConfirm`, triggers loading |

### 3.6 Accessibility Requirements

- Dialog has `role="alertdialog"` for destructive confirmation
- Title linked via `aria-labelledby`
- Message linked via `aria-describedby`
- Focus trapped within dialog while open
- Escape key closes dialog
- Focus returned to trigger element on close

---

## 4. Authorized Files and Functions for Modification

### 4.1 Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | Main delete confirmation dialog component |
| `src/components/ItemManager/components/dialogs/index.ts` | Barrel exports for dialogs directory |

### 4.2 Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemManager/ItemManager.tsx` | Integrate ConfirmDeleteDialog, handle delete flow |
| `src/components/ItemManager/components/index.ts` | Add barrel export for dialogs |
| `src/components/ItemManager/ItemManager.types.ts` | Add ConfirmDeleteDialogProps interface if not present |

### 4.3 Functions to Implement

| Function | File | Purpose |
|----------|------|---------|
| `ConfirmDeleteDialog` | `ConfirmDeleteDialog.tsx` | Main dialog component |
| `formatItemList` | `ConfirmDeleteDialog.tsx` | Helper to format item list with overflow |
| `getDeleteTitle` | `ConfirmDeleteDialog.tsx` | Generate appropriate title based on count |
| `getDeleteMessage` | `ConfirmDeleteDialog.tsx` | Generate appropriate message based on count |
| `getConfirmButtonText` | `ConfirmDeleteDialog.tsx` | Generate button text with count |
| `handleConfirmDelete` | `ItemManager.tsx` | Handle confirmed delete action |

---

## 5. Detailed Task Breakdown

### Task 3.4.1: Create ConfirmDeleteDialog Component

**File:** `src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`

**Implementation:**

```typescript
'use client';

/**
 * ConfirmDeleteDialog Component
 *
 * Confirmation dialog displayed before deleting items in ItemManager.
 * Shows item titles (up to 5) and overflow count for bulk deletions.
 * Uses destructive button styling to emphasize the irreversible action.
 *
 * @module ItemManager/components/dialogs/ConfirmDeleteDialog
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 3, Task 3.4)
 * @lastModified 2026-01-03 (REQ-071)
 */

import { AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ItemRecord } from '@/components/ItemCapture';

// =============================================================================
// Constants
// =============================================================================

/** Maximum number of item titles to display before showing overflow */
const MAX_VISIBLE_ITEMS = 5;

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
// Helper Functions
// =============================================================================

/**
 * Format item list for display with overflow handling.
 */
function formatItemList(items: ItemRecord[], maxVisible: number = MAX_VISIBLE_ITEMS): {
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
 */
function getDeleteTitle(count: number, customTitle?: string): string {
  if (customTitle) return customTitle;
  return count === 1 ? 'Delete Item' : 'Delete Items';
}

/**
 * Generate confirmation message based on item count.
 */
function getDeleteMessage(count: number): string {
  if (count === 1) {
    return 'Are you sure you want to delete this item? This action cannot be undone.';
  }
  return `Are you sure you want to delete these ${count} items? This action cannot be undone.`;
}

/**
 * Generate confirm button text based on item count.
 */
function getConfirmButtonText(count: number): string {
  if (count === 1) {
    return 'Delete';
  }
  return `Delete ${count} Items`;
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

  // Prevent background scroll when dialog is open
  // Note: Parent should handle this via useEffect

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        // Close on backdrop click if not loading
        if (e.target === e.currentTarget && !loading) {
          onCancel();
        }
      }}
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

### Task 3.4.2: Create Barrel Export

**File:** `src/components/ItemManager/components/dialogs/index.ts`

```typescript
/**
 * Dialogs Components Barrel Export
 * @module ItemManager/components/dialogs
 * @lastModified 2026-01-03 (REQ-071)
 */

export { ConfirmDeleteDialog } from './ConfirmDeleteDialog';
export type { ConfirmDeleteDialogProps } from './ConfirmDeleteDialog';

// Future exports for other dialogs:
// export { FilterPanel } from './FilterPanel';
// export { SortMenu } from './SortMenu';
```

### Task 3.4.3: Update Components Index

**File:** `src/components/ItemManager/components/index.ts`

Add to existing exports:

```typescript
// Dialogs components
export * from './dialogs';
```

### Task 3.4.4: Integrate in ItemManager

**File:** `src/components/ItemManager/ItemManager.tsx`

Add integration code:

```typescript
import { ConfirmDeleteDialog } from './components/dialogs';

function ItemManager({ items, config, onDeleteItems, ...props }: ItemManagerProps) {
  const {
    selectedIds,
    selectedCount,
    clearSelection,
    getSelectedArray,
    getSelectedItems,
  } = useItemSelection({
    maxSelection: config?.maxBulkSelection ?? 100,
    onSelectionChange: props.onSelectionChange,
  });

  // Dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get items selected for deletion
  const selectedItems = useMemo(() => {
    return getSelectedItems(items);
  }, [getSelectedItems, items]);

  // Open delete confirmation
  const handleDeleteRequest = useCallback(() => {
    if (selectedCount > 0) {
      setShowDeleteDialog(true);
    }
  }, [selectedCount]);

  // Confirm delete handler
  const handleConfirmDelete = useCallback(async () => {
    const selectedArray = getSelectedArray();
    if (selectedArray.length === 0) return;

    setIsDeleting(true);
    try {
      await onDeleteItems(selectedArray);
      clearSelection();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Delete failed:', error);
      // Error handling - could show toast notification
    } finally {
      setIsDeleting(false);
    }
  }, [getSelectedArray, onDeleteItems, clearSelection]);

  // Cancel delete handler
  const handleCancelDelete = useCallback(() => {
    if (!isDeleting) {
      setShowDeleteDialog(false);
    }
  }, [isDeleting]);

  return (
    <div className="flex flex-col h-full relative">
      {/* Toolbar, Grid/List, BulkActionsBar, etc. */}

      <BulkActionsBar
        selectedCount={selectedCount}
        onDelete={handleDeleteRequest}
        // ... other props
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={showDeleteDialog}
        items={selectedItems}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        loading={isDeleting}
      />
    </div>
  );
}
```

---

## 6. Visual Design Specifications

### 6.1 Dialog Container

```css
/* Overlay */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

/* Dialog card */
.dialog-card {
  background: white;
  border-radius: 0.5rem; /* rounded-lg */
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); /* shadow-xl */
  max-width: 28rem; /* max-w-md */
  width: 100%;
  margin: 0 1rem; /* mx-4 */
}
```

### 6.2 Warning Icon

```css
/* Icon container */
.warning-icon-container {
  width: 3rem; /* w-12 */
  height: 3rem; /* h-12 */
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px; /* rounded-full */
  background: #fef2f2; /* bg-red-100 */
}

/* Icon */
.warning-icon {
  width: 1.5rem; /* w-6 */
  height: 1.5rem; /* h-6 */
  color: #dc2626; /* text-red-600 */
}
```

### 6.3 Item List Styling

```css
/* Item list container */
.item-list-container {
  background: #f9fafb; /* bg-gray-50 */
  border-radius: 0.5rem; /* rounded-lg */
  padding: 1rem; /* p-4 */
  max-height: 12rem; /* max-h-48 */
  overflow-y: auto;
}

/* Item row */
.item-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem; /* gap-2 */
  font-size: 0.875rem; /* text-sm */
  color: #374151; /* text-gray-700 */
}

/* Bullet point */
.bullet {
  color: #9ca3af; /* text-gray-400 */
  margin-top: 0.125rem;
}

/* Item title */
.item-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Overflow indicator */
.overflow-text {
  color: #6b7280; /* text-gray-500 */
  font-style: italic;
}
```

### 6.4 Button Styling

| State | Cancel Button | Delete Button |
|-------|---------------|---------------|
| **Default** | `bg-gray-100 text-gray-700` | `bg-red-600 text-white` |
| **Hover** | `bg-gray-200` | `bg-red-700` |
| **Active** | `bg-gray-300` | `bg-red-800` |
| **Disabled** | `opacity-50 cursor-not-allowed` | Same |
| **Focus** | `ring-2 ring-gray-500 ring-offset-2` | `ring-2 ring-red-500 ring-offset-2` |

### 6.5 Animation

Entry animation (fade in + scale up):
```css
@keyframes dialog-enter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.dialog-card {
  animation: dialog-enter 200ms ease-out;
}
```

---

## 7. Accessibility Requirements

### 7.1 ARIA Attributes

```typescript
<div
  role="alertdialog"         // Indicates urgent, interruptive dialog
  aria-modal="true"          // Indicates modal behavior
  aria-labelledby="delete-dialog-title"
  aria-describedby="delete-dialog-description"
>
  <h3 id="delete-dialog-title">Delete Items</h3>
  <p id="delete-dialog-description">Are you sure...</p>
</div>
```

### 7.2 Keyboard Navigation

| Key | Action |
|-----|--------|
| **Tab** | Move focus between Cancel and Delete buttons |
| **Shift+Tab** | Reverse focus movement |
| **Enter / Space** | Activate focused button |
| **Escape** | Close dialog (same as Cancel) |

### 7.3 Focus Management

1. **On Open:** Focus moves to first focusable element (Cancel button)
2. **Focus Trap:** Tab cycling stays within dialog
3. **On Close:** Focus returns to trigger element (Delete button in BulkActionsBar)

### 7.4 Screen Reader Announcements

- Dialog opening announced with title
- Item count and names read in item list
- Loading state announced: "Deleting..."
- Button labels clearly describe action

---

## 8. Acceptance Criteria Mapping

| Criteria (from REQ-071) | Implementation |
|-------------------------|----------------|
| Confirmation dialog appears when user attempts to delete | `isOpen` prop controlled by parent delete action |
| Dialog displays accurate count of items | `itemCount` variable, shown in message and button |
| Dialog shows titles of up to 5 items | `formatItemList()` limits to MAX_VISIBLE_ITEMS |
| Clear truncation message for additional items | `overflowCount > 0` shows "and X more" |
| Confirm button uses destructive styling | `bg-red-600 hover:bg-red-700` on confirm button |
| Cancel button dismisses dialog without deletion | `onCancel` callback, Escape key support |

---

## 9. Testing Requirements

### 9.1 Unit Test Cases

Create tests in `src/components/ItemManager/components/dialogs/__tests__/ConfirmDeleteDialog.test.tsx`:

| Test Case | Description |
|-----------|-------------|
| Renders when isOpen is true | Dialog visible when open |
| Hidden when isOpen is false | Dialog not rendered when closed |
| Shows correct single item title | "Delete Item" title for 1 item |
| Shows correct bulk title | "Delete Items" title for 2+ items |
| Displays all items when <= 5 | All titles shown without overflow |
| Shows overflow count when > 5 | "and X more" displayed for 6+ items |
| Cancel button triggers onCancel | Callback invoked on click |
| Confirm button triggers onConfirm | Callback invoked on click |
| Escape key closes dialog | onCancel called on Escape |
| Backdrop click closes dialog | onCancel called on backdrop click |
| Buttons disabled when loading | All buttons disabled during loading |
| Loading indicator visible when loading | Spinner shown when loading=true |
| Correct ARIA attributes present | role="alertdialog", aria-modal, labelledby, describedby |

### 9.2 Integration Test Cases

| Test Case | Description |
|-----------|-------------|
| Dialog opens from BulkActionsBar delete | Click delete → dialog opens with selected items |
| Delete flow completes successfully | Confirm → items deleted → dialog closes → selection cleared |
| Cancel preserves selection | Cancel → dialog closes → selection intact |
| Multiple items displayed correctly | Select 8 items → shows 5 titles + "and 3 more" |
| Single item delete flow | Select 1 item → delete → proper messaging |

### 9.3 Accessibility Test Cases

| Test Case | Description |
|-----------|-------------|
| Keyboard navigation works | Tab between buttons, Enter/Space activates |
| Escape closes dialog | Escape key triggers onCancel |
| Focus trapped in dialog | Tab cycles within dialog bounds |
| Screen reader announces correctly | Title and description announced |
| Focus visible on all elements | Focus ring visible on keyboard navigation |

---

## 10. Performance Considerations

### 10.1 Rendering Optimization

- Component only mounts when `isOpen` is true
- Item list uses `useMemo` if needed for large selections
- Avoid unnecessary re-renders with proper memoization

### 10.2 Animation Performance

- Use CSS transforms for animations (GPU accelerated)
- Keep animation duration short (200ms)
- Avoid animating layout properties

### 10.3 Memory Considerations

- Item list is sliced, not copied entirely
- No memory leaks from event listeners (proper cleanup)

---

## 11. Mobile Considerations

### 11.1 Touch Targets

All buttons should have minimum 44x44px touch area:

```typescript
className="px-4 py-2.5" // Provides adequate padding
```

### 11.2 Responsive Layout

- Dialog width constrained by `max-w-md` and `mx-4`
- Item list scrollable with `max-h-48 overflow-y-auto`
- Works well on small screens down to 320px width

### 11.3 Safe Area

Dialog is centered, so no bottom safe area concerns (unlike BulkActionsBar).

---

## 12. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Dialog behind other elements | Low | Medium | Use z-50 (above BulkActionsBar at z-40) |
| Long item titles overflow | Medium | Low | Truncate with ellipsis and title attribute |
| User accidentally confirms | Low | High | Destructive styling + item preview makes action clear |
| Backdrop click during loading | Low | Medium | Ignore backdrop clicks when loading=true |
| Animation jank | Low | Low | Use CSS transforms, short duration |
| Focus trap not working | Low | Medium | Test thoroughly, consider focus-trap library if needed |

---

## 13. Implementation Sequence

1. **Create ConfirmDeleteDialog component** (Task 3.4.1)
   - Implement component with all props
   - Add helper functions for formatting
   - Apply styling and layout
   - Add animation classes
   - Implement accessibility attributes

2. **Create barrel exports** (Task 3.4.2)
   - Add index.ts in dialogs directory
   - Export component and props type

3. **Update components index** (Task 3.4.3)
   - Add dialogs export to components index

4. **Integrate in ItemManager** (Task 3.4.4)
   - Import ConfirmDeleteDialog
   - Add dialog state management
   - Create confirm/cancel handlers
   - Wire up to BulkActionsBar delete action

5. **Testing**
   - Unit tests for component behavior
   - Integration tests for full flow
   - Accessibility testing
   - Mobile device testing

---

## 14. Related Documents

- [Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md) - Phase 3, Task 3.4
- [BulkActionsBar Overview](/docs/REQ-070-build-bulkactionsbar-component-overview.md) - Task 3.3 reference (trigger)
- [useItemSelection Hook](/docs/REQ-068-create-useitemselection-hook-overview.md) - Task 3.1 reference
- [ConfirmationModal](/src/components/ConfirmationModal.tsx) - Existing modal pattern reference
- [ItemCapture Types](/src/components/ItemCapture/ItemCapture.types.ts) - ItemRecord type reference

---

## 15. Estimated Effort

| Task | Estimate |
|------|----------|
| Create ConfirmDeleteDialog component | 2 hours |
| Create barrel exports | 15 minutes |
| Update components index | 15 minutes |
| Integrate in ItemManager | 1 hour |
| Unit tests | 1.5 hours |
| Integration tests | 1 hour |
| Accessibility testing | 30 minutes |
| Mobile testing and refinement | 30 minutes |
| **Total** | **7 hours** |

---

## Appendix A: Complete Component Implementation

See Task 3.4.1 section for the complete implementation code.

---

## Appendix B: Test File Template

```typescript
/**
 * ConfirmDeleteDialog Component Tests
 *
 * @module ItemManager/components/dialogs/__tests__/ConfirmDeleteDialog.test
 * @lastModified 2026-01-03 (REQ-071)
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDeleteDialog } from '../ConfirmDeleteDialog';
import type { ItemRecord } from '@/components/ItemCapture';

// Mock item factory
function createMockItem(id: string, title: string): ItemRecord {
  return {
    id,
    title,
    contentType: 'media',
    media: [],
    createdAt: new Date(),
  };
}

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
    it('renders when isOpen is true', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<ConfirmDeleteDialog {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('shows "Delete Item" for single item', () => {
      render(<ConfirmDeleteDialog {...defaultProps} items={[mockItems[0]]} />);
      expect(screen.getByText('Delete Item')).toBeInTheDocument();
    });

    it('shows "Delete Items" for multiple items', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      expect(screen.getByText('Delete Items')).toBeInTheDocument();
    });

    it('displays all item titles when 5 or fewer', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      expect(screen.getByText('Coffee Maker Instructions')).toBeInTheDocument();
      expect(screen.getByText('Dishwasher Guide')).toBeInTheDocument();
      expect(screen.getByText('HVAC Control Panel')).toBeInTheDocument();
    });

    it('shows overflow count when more than 5 items', () => {
      const manyItems = Array.from({ length: 8 }, (_, i) =>
        createMockItem(`${i}`, `Item ${i + 1}`)
      );
      render(<ConfirmDeleteDialog {...defaultProps} items={manyItems} />);
      expect(screen.getByText('and 3 more')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('calls onConfirm when confirm button clicked', async () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      await userEvent.click(screen.getByText('Delete 3 Items'));
      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when cancel button clicked', async () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      await userEvent.click(screen.getByText('Cancel'));
      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when Escape is pressed', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' });
      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when backdrop is clicked', async () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      // Click on the backdrop (the outer container)
      const backdrop = screen.getByRole('alertdialog').parentElement;
      if (backdrop) {
        await userEvent.click(backdrop);
      }
      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading State', () => {
    it('disables buttons when loading', () => {
      render(<ConfirmDeleteDialog {...defaultProps} loading={true} />);
      expect(screen.getByText('Cancel')).toBeDisabled();
      expect(screen.getByText('Deleting...')).toBeInTheDocument();
    });

    it('shows loading spinner when loading', () => {
      render(<ConfirmDeleteDialog {...defaultProps} loading={true} />);
      expect(screen.getByText('Deleting...')).toBeInTheDocument();
    });

    it('does not close on Escape when loading', () => {
      render(<ConfirmDeleteDialog {...defaultProps} loading={true} />);
      fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' });
      expect(defaultProps.onCancel).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has correct role and aria attributes', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      const dialog = screen.getByRole('alertdialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'delete-dialog-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'delete-dialog-description');
    });

    it('has accessible title and description', () => {
      render(<ConfirmDeleteDialog {...defaultProps} />);
      expect(screen.getByText('Delete Items')).toHaveAttribute('id', 'delete-dialog-title');
    });
  });
});
```

---

## Appendix C: Usage Examples

### Single Item Delete

```typescript
// User clicks delete on a single item
const [showDialog, setShowDialog] = useState(false);
const [itemToDelete, setItemToDelete] = useState<ItemRecord | null>(null);

const handleSingleDelete = (item: ItemRecord) => {
  setItemToDelete(item);
  setShowDialog(true);
};

<ConfirmDeleteDialog
  isOpen={showDialog}
  items={itemToDelete ? [itemToDelete] : []}
  onConfirm={() => {
    if (itemToDelete) {
      onDeleteItems([itemToDelete.id]);
    }
    setShowDialog(false);
    setItemToDelete(null);
  }}
  onCancel={() => {
    setShowDialog(false);
    setItemToDelete(null);
  }}
/>
```

### Bulk Delete from Selection

```typescript
// User clicks delete in BulkActionsBar
const [showDeleteDialog, setShowDeleteDialog] = useState(false);
const selectedItems = getSelectedItems(items);

<BulkActionsBar
  selectedCount={selectedCount}
  onDelete={() => setShowDeleteDialog(true)}
  // ...
/>

<ConfirmDeleteDialog
  isOpen={showDeleteDialog}
  items={selectedItems}
  onConfirm={async () => {
    setIsDeleting(true);
    try {
      await onDeleteItems(getSelectedArray());
      clearSelection();
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  }}
  onCancel={() => setShowDeleteDialog(false)}
  loading={isDeleting}
/>
```
