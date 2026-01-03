# REQ-070: Build BulkActionsBar Component - Technical Implementation Overview

**Document Created:** 2026-01-03T18:45:00
**Last Modified:** 2026-01-03T18:45:00
**Request Reference:** REQ-070 (Bulk Actions Bar for Multi-Item Operations)
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 3 - Selection & Bulk Actions
**Task ID:** 3.3

---

## 1. Executive Summary

This document provides the technical implementation breakdown for building the `BulkActionsBar` component (Task 3.3 in Phase 3). This floating action bar appears when items are selected, providing quick access to bulk operations including deletion, tagging, moving items between properties, and exiting selection mode.

### Scope

The `BulkActionsBar` component will:
- Display as a floating bar when one or more items are selected
- Provide Delete button to remove all selected items (with confirmation)
- Provide Add Tag button to apply tags to all selected items
- Provide Remove Tag button to strip tags from selected items
- Provide Move to Property button for multi-property scenarios
- Provide Exit Selection Mode / Cancel button to clear selection
- Remain visible and accessible while items are selected
- Automatically hide when selection is cleared or canceled

### Dependencies

- **Prerequisite Tasks:**
  - Task 3.1: `useItemSelection` hook (`src/components/ItemManager/hooks/useItemSelection.ts`)
  - Task 3.2: Selection UI Integration (checkboxes, selection mode)
  - Task 1.1: ItemManager types (`src/components/ItemManager/ItemManager.types.ts`)

- **Parallel Tasks:**
  - Task 3.4: ConfirmDeleteDialog (can be developed simultaneously)
  - Task 3.5: BulkTagDialog (can be developed simultaneously)

- **Downstream Tasks:**
  - Task 3.6: BulkMoveDialog (depends on BulkActionsBar for trigger)

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

**Floating Bar Pattern:**
The component should follow a similar pattern to mobile navigation bars or toast notifications - fixed position at the bottom of the viewport with appropriate z-index.

**ConfirmationModal Pattern (from `src/components/ConfirmationModal.tsx`):**
```typescript
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white rounded-lg p-6 max-w-md mx-4 w-full">
    {/* Content */}
  </div>
</div>
```

**Button Styling Pattern:**
```typescript
// Destructive action
<button className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors">

// Primary action
<button className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors">

// Secondary/Cancel action
<button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors">
```

### 2.3 Types from Implementation Plan

From `ItemManager.types.ts` (Phase 1):

```typescript
// Callback for bulk delete
onDeleteItems: (ids: string[]) => void;

// Callback for item updates (tags, property)
onUpdateItem: (item: ItemRecord) => void;

// Config options
interface ItemManagerConfig {
  /** Enable multi-select and bulk operations (default: true) */
  enableBulkActions?: boolean;
  /** Maximum items that can be selected at once (default: 100) */
  maxBulkSelection?: number;
  /** Enable multi-property features (default: false) */
  multiPropertyMode?: boolean;
}

// Property definition for multi-property mode
interface Property {
  id: string;
  name: string;
  address?: string;
}
```

### 2.4 Selection Hook Interface

From Task 3.1 (`useItemSelection`):

```typescript
interface UseItemSelectionReturn {
  selectedIds: Set<string>;
  selectedCount: number;
  isSelectionMode: boolean;
  hasSelection: boolean;
  clearSelection: () => void;
  exitSelectionMode: () => void;
  getSelectedItems: <T extends { id: string }>(items: T[]) => T[];
  getSelectedArray: () => string[];
}
```

---

## 3. Implementation Approach

### 3.1 Component Architecture

The `BulkActionsBar` is a presentational component that receives callbacks for actions. It does not manage dialog state internally - parent component handles dialog visibility.

```typescript
interface BulkActionsBarProps {
  /** Number of selected items */
  selectedCount: number;

  /** Callback when delete action is triggered */
  onDelete: () => void;

  /** Callback when add tag action is triggered */
  onAddTag: () => void;

  /** Callback when remove tag action is triggered */
  onRemoveTag: () => void;

  /** Callback when move to property action is triggered */
  onMoveToProperty?: () => void;

  /** Callback when exit selection / cancel is triggered */
  onExitSelection: () => void;

  /** Whether multi-property mode is enabled */
  multiPropertyMode?: boolean;

  /** Loading state (during bulk operation) */
  loading?: boolean;

  /** Optional additional CSS classes */
  className?: string;
}
```

### 3.2 Visual Layout

The bar uses a horizontal layout with actions grouped logically:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ✓ 5 selected    │  🗑️ Delete  │  🏷️ Add Tag  │  ✂️ Remove Tag  │  ✕  │
│                  │             │              │  📁 Move to...  │     │
└─────────────────────────────────────────────────────────────────────────┘
```

**Desktop Layout (>= 640px):**
- Full button labels visible
- Horizontal arrangement with spacing
- Centered or bottom-fixed position

**Mobile Layout (< 640px):**
- Icon-only buttons with tooltips
- Compact horizontal layout
- Bottom-fixed with safe area padding

### 3.3 Positioning Strategy

The bar should be:
1. **Fixed to viewport bottom** - Always visible regardless of scroll
2. **Above other content** - High z-index (z-40 or z-50)
3. **Responsive to bottom safe area** - Account for iOS home indicator
4. **Animated entry/exit** - Slide up when appearing, slide down when hiding

```typescript
// Positioning classes
className={cn(
  // Fixed positioning
  "fixed bottom-0 left-0 right-0 z-40",
  // Safe area padding for iOS
  "pb-safe",
  // Animation
  "transform transition-transform duration-300 ease-out",
  selectedCount > 0 ? "translate-y-0" : "translate-y-full",
)}
```

### 3.4 Animation Approach

Use CSS transforms for smooth entry/exit:

```typescript
// Parent wrapper handles visibility
{selectedCount > 0 && (
  <BulkActionsBar
    selectedCount={selectedCount}
    onDelete={handleBulkDelete}
    // ...
  />
)}

// OR use conditional transform
<div className={cn(
  "fixed bottom-0 left-0 right-0 z-40 transform transition-transform duration-300",
  selectedCount > 0 ? "translate-y-0" : "translate-y-full pointer-events-none"
)}>
  {/* Bar content */}
</div>
```

### 3.5 Button Configuration

Each button has specific styling and behavior:

| Button | Icon | Color | Action | Visibility |
|--------|------|-------|--------|------------|
| Delete | `Trash2` | Red (destructive) | Opens ConfirmDeleteDialog | Always |
| Add Tag | `Tag` or `Plus` | Blue (primary) | Opens BulkTagDialog (add mode) | Always |
| Remove Tag | `Tag` or `Minus` | Gray (secondary) | Opens BulkTagDialog (remove mode) | Always |
| Move to Property | `FolderInput` | Blue (primary) | Opens BulkMoveDialog | Only if `multiPropertyMode` |
| Cancel/Exit | `X` | Gray (secondary) | Clears selection, exits mode | Always |

---

## 4. Authorized Files and Functions for Modification

### 4.1 Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx` | Main floating action bar component |
| `src/components/ItemManager/components/BulkActions/index.ts` | Barrel exports for BulkActions directory |

### 4.2 Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemManager/ItemManager.tsx` | Integrate BulkActionsBar, handle action callbacks |
| `src/components/ItemManager/components/index.ts` | Add barrel export for BulkActions |
| `src/components/ItemManager/ItemManager.types.ts` | Add BulkActionsBarProps interface if not present |

### 4.3 Functions to Implement

| Function | File | Purpose |
|----------|------|---------|
| `BulkActionsBar` | `BulkActionsBar.tsx` | Main component function |
| `ActionButton` | `BulkActionsBar.tsx` | Internal reusable action button |
| `handleBulkDelete` | `ItemManager.tsx` | Trigger delete confirmation with selected IDs |
| `handleBulkAddTag` | `ItemManager.tsx` | Open tag dialog in add mode |
| `handleBulkRemoveTag` | `ItemManager.tsx` | Open tag dialog in remove mode |
| `handleBulkMove` | `ItemManager.tsx` | Open move to property dialog |

---

## 5. Detailed Task Breakdown

### Task 3.3.1: Create BulkActionsBar Component

**File:** `src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx`

**Implementation:**

```typescript
'use client';

/**
 * BulkActionsBar Component
 *
 * Floating action bar displayed when items are selected in ItemManager.
 * Provides quick access to bulk operations: delete, add tag, remove tag,
 * move to property (multi-property mode), and exit selection.
 *
 * @module ItemManager/components/BulkActions/BulkActionsBar
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 3, Task 3.3)
 * @lastModified 2026-01-03 (REQ-070)
 */

import { Trash2, Tag, TagX, FolderInput, X, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BulkActionsBarProps {
  /** Number of selected items */
  selectedCount: number;

  /** Callback when delete action is triggered */
  onDelete: () => void;

  /** Callback when add tag action is triggered */
  onAddTag: () => void;

  /** Callback when remove tag action is triggered */
  onRemoveTag: () => void;

  /** Callback when move to property action is triggered (multi-property mode) */
  onMoveToProperty?: () => void;

  /** Callback when exit selection / cancel is triggered */
  onExitSelection: () => void;

  /** Whether multi-property mode is enabled (shows move button) */
  multiPropertyMode?: boolean;

  /** Loading state (during bulk operation) */
  loading?: boolean;

  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Internal action button component for consistent styling.
 */
interface ActionButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'destructive';
  disabled?: boolean;
  className?: string;
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  variant = 'secondary',
  disabled = false,
  className,
}: ActionButtonProps) {
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
    destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        // Base styles
        'inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg',
        'font-medium text-sm transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // Variant styles
        variantStyles[variant],
        // Responsive: hide label on small screens
        'sm:px-4',
        className
      )}
      aria-label={label}
      title={label}
    >
      <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

/**
 * Floating action bar for bulk operations on selected items.
 *
 * @example
 * <BulkActionsBar
 *   selectedCount={5}
 *   onDelete={() => setShowDeleteDialog(true)}
 *   onAddTag={() => setTagDialogMode('add')}
 *   onRemoveTag={() => setTagDialogMode('remove')}
 *   onExitSelection={clearSelection}
 *   multiPropertyMode={true}
 *   onMoveToProperty={() => setShowMoveDialog(true)}
 * />
 */
export function BulkActionsBar({
  selectedCount,
  onDelete,
  onAddTag,
  onRemoveTag,
  onMoveToProperty,
  onExitSelection,
  multiPropertyMode = false,
  loading = false,
  className,
}: BulkActionsBarProps) {
  // Don't render if no items selected
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        // Fixed positioning at bottom
        'fixed bottom-0 left-0 right-0 z-40',
        // Background and border
        'bg-white border-t border-gray-200 shadow-lg',
        // Safe area padding for iOS
        'pb-[env(safe-area-inset-bottom)]',
        // Animation (optional - can use parent control)
        'animate-in slide-in-from-bottom duration-300',
        className
      )}
      role="toolbar"
      aria-label="Bulk actions for selected items"
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Selection count indicator */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
              <Check className="w-4 h-4 text-blue-600" aria-hidden="true" />
            </div>
            <span className="text-sm font-medium text-gray-900">
              {selectedCount} selected
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            {/* Loading indicator overlay */}
            {loading && (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm hidden sm:inline">Processing...</span>
              </div>
            )}

            {/* Delete action */}
            <ActionButton
              icon={Trash2}
              label="Delete"
              onClick={onDelete}
              variant="destructive"
              disabled={loading}
            />

            {/* Add tag action */}
            <ActionButton
              icon={Tag}
              label="Add Tag"
              onClick={onAddTag}
              variant="primary"
              disabled={loading}
            />

            {/* Remove tag action */}
            <ActionButton
              icon={TagX}
              label="Remove Tag"
              onClick={onRemoveTag}
              variant="secondary"
              disabled={loading}
            />

            {/* Move to property action (multi-property mode only) */}
            {multiPropertyMode && onMoveToProperty && (
              <ActionButton
                icon={FolderInput}
                label="Move to..."
                onClick={onMoveToProperty}
                variant="primary"
                disabled={loading}
              />
            )}

            {/* Divider */}
            <div className="hidden sm:block w-px h-6 bg-gray-200" aria-hidden="true" />

            {/* Exit selection / Cancel */}
            <ActionButton
              icon={X}
              label="Cancel"
              onClick={onExitSelection}
              variant="secondary"
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BulkActionsBar;
```

### Task 3.3.2: Create Barrel Export

**File:** `src/components/ItemManager/components/BulkActions/index.ts`

```typescript
/**
 * BulkActions Components Barrel Export
 * @module ItemManager/components/BulkActions
 * @lastModified 2026-01-03 (REQ-070)
 */

export { BulkActionsBar } from './BulkActionsBar';
export type { BulkActionsBarProps } from './BulkActionsBar';

// Future exports for Tasks 3.4, 3.5, 3.6:
// export { BulkTagDialog } from './BulkTagDialog';
// export { BulkMoveDialog } from './BulkMoveDialog';
// export { ConfirmDeleteDialog } from './ConfirmDeleteDialog'; // Or in dialogs/
```

### Task 3.3.3: Update Components Index

**File:** `src/components/ItemManager/components/index.ts`

Add to existing exports:

```typescript
// BulkActions components
export * from './BulkActions';
```

### Task 3.3.4: Integrate in ItemManager

**File:** `src/components/ItemManager/ItemManager.tsx`

Add integration code:

```typescript
import { BulkActionsBar } from './components/BulkActions';

function ItemManager({ items, config, onDeleteItems, onUpdateItem, ...props }: ItemManagerProps) {
  const { filteredItems } = useItemSearch({ items, ... });

  const {
    selectedIds,
    selectedCount,
    isSelectionMode,
    clearSelection,
    exitSelectionMode,
    getSelectedArray,
    getSelectedItems,
  } = useItemSelection({
    maxSelection: config?.maxBulkSelection ?? 100,
    onSelectionChange: props.onSelectionChange,
  });

  // Dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [tagDialogMode, setTagDialogMode] = useState<'add' | 'remove' | null>(null);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Bulk delete handler
  const handleBulkDelete = useCallback(() => {
    setShowDeleteDialog(true);
  }, []);

  // Confirm delete handler
  const handleConfirmDelete = useCallback(async () => {
    const selectedArray = getSelectedArray();
    if (selectedArray.length === 0) return;

    setBulkLoading(true);
    try {
      await onDeleteItems(selectedArray);
      clearSelection();
      setShowDeleteDialog(false);
    } finally {
      setBulkLoading(false);
    }
  }, [getSelectedArray, onDeleteItems, clearSelection]);

  // Add tag handler
  const handleBulkAddTag = useCallback(() => {
    setTagDialogMode('add');
  }, []);

  // Remove tag handler
  const handleBulkRemoveTag = useCallback(() => {
    setTagDialogMode('remove');
  }, []);

  // Move to property handler
  const handleBulkMove = useCallback(() => {
    setShowMoveDialog(true);
  }, []);

  // Determine if multi-property mode is active
  const isMultiPropertyMode = config?.multiPropertyMode || (props.properties?.length ?? 0) > 0;

  return (
    <div className="flex flex-col h-full relative">
      {/* Toolbar, Grid/List, etc. */}

      {/* Bulk Actions Bar - appears when items selected */}
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

      {/* Delete Confirmation Dialog (Task 3.4) */}
      {showDeleteDialog && (
        <ConfirmDeleteDialog
          selectedCount={selectedCount}
          selectedItems={getSelectedItems(items)}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteDialog(false)}
          loading={bulkLoading}
        />
      )}

      {/* Tag Dialog (Task 3.5) */}
      {tagDialogMode && (
        <BulkTagDialog
          mode={tagDialogMode}
          selectedItems={getSelectedItems(items)}
          onConfirm={handleTagConfirm}
          onCancel={() => setTagDialogMode(null)}
        />
      )}

      {/* Move Dialog (Task 3.6) */}
      {showMoveDialog && (
        <BulkMoveDialog
          selectedItems={getSelectedItems(items)}
          properties={props.properties ?? []}
          onConfirm={handleMoveConfirm}
          onCancel={() => setShowMoveDialog(false)}
        />
      )}
    </div>
  );
}
```

---

## 6. Visual Design Specifications

### 6.1 Container Styling

```css
/* Fixed bottom bar */
.bulk-actions-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 40;
  background: white;
  border-top: 1px solid #e5e7eb; /* gray-200 */
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
  padding-bottom: env(safe-area-inset-bottom);
}

.bulk-actions-bar-content {
  max-width: 80rem; /* max-w-7xl */
  margin: 0 auto;
  padding: 0.75rem 1rem; /* py-3 px-4 */
}
```

### 6.2 Button Styling

| State | Delete Button | Primary Button | Secondary Button |
|-------|---------------|----------------|------------------|
| **Default** | `bg-red-600 text-white` | `bg-blue-600 text-white` | `bg-gray-100 text-gray-700` |
| **Hover** | `bg-red-700` | `bg-blue-700` | `bg-gray-200` |
| **Active** | `bg-red-800` | `bg-blue-800` | `bg-gray-300` |
| **Disabled** | `opacity-50 cursor-not-allowed` | Same | Same |
| **Focus** | `ring-2 ring-blue-500 ring-offset-2` | Same | Same |

### 6.3 Selection Count Badge

```css
.selection-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.selection-badge-icon {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dbeafe; /* blue-100 */
  border-radius: 9999px;
}

.selection-badge-icon svg {
  width: 1rem;
  height: 1rem;
  color: #2563eb; /* blue-600 */
}

.selection-badge-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827; /* gray-900 */
}
```

### 6.4 Responsive Breakpoints

| Breakpoint | Layout Changes |
|------------|----------------|
| **< 640px (sm)** | Icon-only buttons, compact spacing |
| **>= 640px (sm)** | Full button labels, normal spacing |
| **>= 1024px (lg)** | Centered content, max-width constraint |

### 6.5 Animation

Entry animation (slide up from bottom):
```css
@keyframes slide-in-from-bottom {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.bulk-actions-bar {
  animation: slide-in-from-bottom 300ms ease-out;
}
```

---

## 7. Accessibility Requirements

### 7.1 ARIA Attributes

```typescript
<div
  role="toolbar"
  aria-label="Bulk actions for selected items"
>
  {/* Action buttons with aria-label for icon-only mobile view */}
  <button aria-label="Delete selected items" title="Delete">
    <Trash2 aria-hidden="true" />
    <span className="sr-only sm:not-sr-only">Delete</span>
  </button>
</div>
```

### 7.2 Keyboard Navigation

| Key | Action |
|-----|--------|
| **Tab** | Move focus between action buttons |
| **Enter / Space** | Activate focused button |
| **Escape** | Exit selection mode (via onExitSelection) |

### 7.3 Focus Management

- Buttons receive focus ring on keyboard navigation
- Focus trapped within bar while visible (optional)
- Clear focus outline on all interactive elements

### 7.4 Screen Reader Announcements

- Selection count changes announced via parent `aria-live`
- Button labels descriptive: "Delete 5 selected items"
- Loading state announced: "Processing bulk action"

---

## 8. Acceptance Criteria Mapping

| Criteria (from REQ-070) | Implementation |
|-------------------------|----------------|
| Floating action bar appears when items selected | `selectedCount > 0` conditional rendering |
| Delete button removes all selected items | `onDelete` callback → opens ConfirmDeleteDialog |
| Add Tag button applies tags to selected items | `onAddTag` callback → opens BulkTagDialog (add mode) |
| Remove Tag button strips tags from selected items | `onRemoveTag` callback → opens BulkTagDialog (remove mode) |
| Move to Property button (multi-property) | `onMoveToProperty` callback → opens BulkMoveDialog |
| Exit Selection Mode button clears selection | `onExitSelection` callback → calls `exitSelectionMode()` |
| Bar remains visible while items selected | Fixed position, z-40 stacking |
| Bar hides when selection cleared or canceled | Conditional render on `selectedCount > 0` |

---

## 9. Testing Requirements

### 9.1 Unit Test Cases

Create tests in `src/components/ItemManager/components/BulkActions/__tests__/BulkActionsBar.test.tsx`:

| Test Case | Description |
|-----------|-------------|
| Renders when selectedCount > 0 | Bar visible with items selected |
| Hidden when selectedCount = 0 | Bar not rendered with no selection |
| Displays correct selection count | "5 selected" text matches prop |
| Delete button triggers onDelete | Callback invoked on click |
| Add Tag button triggers onAddTag | Callback invoked on click |
| Remove Tag button triggers onRemoveTag | Callback invoked on click |
| Move button shown in multi-property mode | Visible when `multiPropertyMode=true` |
| Move button hidden in single-property mode | Hidden when `multiPropertyMode=false` |
| Cancel button triggers onExitSelection | Callback invoked on click |
| Buttons disabled when loading | All buttons disabled during loading |
| Loading indicator visible when loading | Spinner shown when `loading=true` |
| Correct ARIA role and labels | `role="toolbar"`, button aria-labels present |
| Keyboard navigation works | Tab through buttons, Enter/Space activates |

### 9.2 Integration Test Cases

| Test Case | Description |
|-----------|-------------|
| Bar appears when items selected | Select items → bar slides in |
| Bar disappears when selection cleared | Clear selection → bar slides out |
| Delete flow works end-to-end | Delete → confirm → items removed → bar hidden |
| Add tag flow opens dialog | Add Tag → dialog opens with add mode |
| Remove tag flow opens dialog | Remove Tag → dialog opens with remove mode |
| Move flow opens dialog | Move → dialog opens with property list |
| Exit clears all selections | Cancel → all items deselected, mode off |

### 9.3 Accessibility Test Cases

| Test Case | Description |
|-----------|-------------|
| Keyboard navigation | Tab navigates between buttons |
| Focus visible | Focus ring visible on keyboard focus |
| Screen reader labels | All buttons have accessible names |
| Touch targets | Buttons meet 44x44px minimum |
| High contrast | Text readable, buttons distinguishable |

### 9.4 Mobile Test Cases

| Test Case | Description |
|-----------|-------------|
| Bottom safe area respected | Bar above iOS home indicator |
| Icon-only buttons on small screens | Labels hidden, icons visible |
| Tooltips/titles available | Button purpose discoverable |
| Touch targets adequate | Buttons easy to tap on mobile |
| Animation smooth | Slide-up animation performs well |

---

## 10. Performance Considerations

### 10.1 Rendering Optimization

- Use `React.memo` if bar receives complex props
- Memoize callback handlers in parent with `useCallback`
- Avoid inline styles/functions causing re-renders

```typescript
// Memoized bar component
const MemoizedBulkActionsBar = React.memo(BulkActionsBar);
```

### 10.2 Animation Performance

- Use CSS transforms (GPU accelerated) for animations
- Avoid animating layout properties (width, height, margin)
- Keep animation duration short (300ms or less)

### 10.3 Bundle Size

- Use tree-shaking compatible imports from lucide-react
- No additional dependencies required

---

## 11. Mobile Considerations

### 11.1 Safe Area Handling

For iOS devices with home indicator:

```typescript
// Tailwind CSS
className="pb-[env(safe-area-inset-bottom)]"

// Or in CSS
padding-bottom: env(safe-area-inset-bottom);
```

### 11.2 Touch Target Sizing

All buttons should have minimum 44x44px touch area:

```typescript
// Button container
className="min-h-[44px] min-w-[44px] px-3 py-2"
```

### 11.3 Responsive Button Labels

- Desktop (>=640px): Full labels "Delete", "Add Tag", etc.
- Mobile (<640px): Icons only with title/aria-label

```typescript
<span className="hidden sm:inline">{label}</span>
```

---

## 12. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Bar overlaps content | Medium | Medium | Add bottom padding to content container when bar visible |
| Animation jank on low-end devices | Low | Low | Use CSS transforms, keep duration short |
| Z-index conflicts | Low | Medium | Use z-40 (below modals at z-50) |
| Touch targets too small on mobile | Medium | Medium | Enforce 44x44px minimum |
| Safe area not respected | Medium | Medium | Test on iOS devices with home indicator |
| Dialogs open behind bar | Low | High | Ensure dialog z-index (z-50) > bar z-index (z-40) |

---

## 13. Implementation Sequence

1. **Create BulkActionsBar component** (Task 3.3.1)
   - Implement component with all props
   - Add ActionButton internal component
   - Apply styling and responsive layout
   - Add animation classes

2. **Create barrel exports** (Task 3.3.2)
   - Add index.ts in BulkActions directory
   - Export component and props type

3. **Update components index** (Task 3.3.3)
   - Add BulkActions export to components index

4. **Integrate in ItemManager** (Task 3.3.4)
   - Import BulkActionsBar
   - Add dialog state management
   - Create action handler callbacks
   - Wire up to selection hook
   - Add content bottom padding when bar visible

5. **Testing**
   - Unit tests for component behavior
   - Integration tests for full flow
   - Accessibility testing
   - Mobile device testing

---

## 14. Related Documents

- [Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md) - Phase 3, Task 3.3
- [useItemSelection Hook](/docs/REQ-068-create-useitemselection-hook-overview.md) - Task 3.1 reference
- [Selection UI Integration](/docs/REQ-069-integrate-selection-ui-overview.md) - Task 3.2 reference
- [ConfirmationModal](/src/components/ConfirmationModal.tsx) - Modal pattern reference
- [ItemCapture Types](/src/components/ItemCapture/ItemCapture.types.ts) - ItemRecord type reference

---

## 15. Estimated Effort

| Task | Estimate |
|------|----------|
| Create BulkActionsBar component | 2 hours |
| Create barrel exports | 15 minutes |
| Update components index | 15 minutes |
| Integrate in ItemManager | 1.5 hours |
| Unit tests | 1.5 hours |
| Integration tests | 1 hour |
| Accessibility testing | 30 minutes |
| Mobile testing and refinement | 1 hour |
| **Total** | **8 hours** |

---

## Appendix A: Complete Component Implementation

```typescript
'use client';

/**
 * BulkActionsBar Component
 *
 * Floating action bar displayed when items are selected in ItemManager.
 * Provides quick access to bulk operations: delete, add tag, remove tag,
 * move to property (multi-property mode), and exit selection.
 *
 * @module ItemManager/components/BulkActions/BulkActionsBar
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 3, Task 3.3)
 * @lastModified 2026-01-03 (REQ-070)
 */

import React from 'react';
import {
  Trash2,
  Tag,
  X,
  Loader2,
  Check,
  FolderInput,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Props for BulkActionsBar component.
 */
export interface BulkActionsBarProps {
  /** Number of selected items */
  selectedCount: number;

  /** Callback when delete action is triggered */
  onDelete: () => void;

  /** Callback when add tag action is triggered */
  onAddTag: () => void;

  /** Callback when remove tag action is triggered */
  onRemoveTag: () => void;

  /** Callback when move to property action is triggered (multi-property mode) */
  onMoveToProperty?: () => void;

  /** Callback when exit selection / cancel is triggered */
  onExitSelection: () => void;

  /** Whether multi-property mode is enabled (shows move button) */
  multiPropertyMode?: boolean;

  /** Loading state (during bulk operation) */
  loading?: boolean;

  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Props for internal ActionButton component.
 */
interface ActionButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'destructive';
  disabled?: boolean;
  className?: string;
}

// =============================================================================
// Internal Components
// =============================================================================

/**
 * Internal action button component for consistent styling.
 */
function ActionButton({
  icon: Icon,
  label,
  onClick,
  variant = 'secondary',
  disabled = false,
  className,
}: ActionButtonProps) {
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
    destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        // Base styles
        'inline-flex items-center justify-center gap-2',
        'min-h-[44px] min-w-[44px] px-3 py-2 sm:px-4',
        'rounded-lg font-medium text-sm',
        'transition-colors duration-150',
        // Focus styles
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500',
        // Disabled styles
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // Variant styles
        variantStyles[variant],
        className
      )}
      aria-label={label}
      title={label}
    >
      <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// =============================================================================
// Main Component
// =============================================================================

/**
 * Floating action bar for bulk operations on selected items.
 *
 * @example
 * <BulkActionsBar
 *   selectedCount={5}
 *   onDelete={() => setShowDeleteDialog(true)}
 *   onAddTag={() => setTagDialogMode('add')}
 *   onRemoveTag={() => setTagDialogMode('remove')}
 *   onExitSelection={exitSelectionMode}
 *   multiPropertyMode={true}
 *   onMoveToProperty={() => setShowMoveDialog(true)}
 * />
 */
export function BulkActionsBar({
  selectedCount,
  onDelete,
  onAddTag,
  onRemoveTag,
  onMoveToProperty,
  onExitSelection,
  multiPropertyMode = false,
  loading = false,
  className,
}: BulkActionsBarProps) {
  // Don't render if no items selected
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        // Fixed positioning at bottom
        'fixed bottom-0 left-0 right-0 z-40',
        // Background and border
        'bg-white border-t border-gray-200',
        // Shadow for elevation
        'shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-1px_rgba(0,0,0,0.06)]',
        // Safe area padding for iOS
        'pb-[env(safe-area-inset-bottom)]',
        // Animation
        'animate-in slide-in-from-bottom duration-300',
        className
      )}
      role="toolbar"
      aria-label={`Bulk actions for ${selectedCount} selected item${selectedCount !== 1 ? 's' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Selection count indicator */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div
              className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full"
              aria-hidden="true"
            >
              <Check className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">
              <span className="sr-only">Currently </span>
              {selectedCount} selected
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            {/* Loading indicator */}
            {loading && (
              <div className="flex items-center gap-2 text-gray-500 mr-2">
                <Loader2
                  className="w-4 h-4 animate-spin"
                  aria-hidden="true"
                />
                <span className="text-sm hidden sm:inline" role="status">
                  Processing...
                </span>
              </div>
            )}

            {/* Delete action */}
            <ActionButton
              icon={Trash2}
              label="Delete"
              onClick={onDelete}
              variant="destructive"
              disabled={loading}
            />

            {/* Add tag action */}
            <ActionButton
              icon={Tag}
              label="Add Tag"
              onClick={onAddTag}
              variant="primary"
              disabled={loading}
            />

            {/* Remove tag action */}
            <ActionButton
              icon={Minus}
              label="Remove Tag"
              onClick={onRemoveTag}
              variant="secondary"
              disabled={loading}
            />

            {/* Move to property action (multi-property mode only) */}
            {multiPropertyMode && onMoveToProperty && (
              <ActionButton
                icon={FolderInput}
                label="Move to..."
                onClick={onMoveToProperty}
                variant="primary"
                disabled={loading}
              />
            )}

            {/* Divider */}
            <div
              className="hidden sm:block w-px h-6 bg-gray-200"
              aria-hidden="true"
            />

            {/* Exit selection / Cancel */}
            <ActionButton
              icon={X}
              label="Cancel"
              onClick={onExitSelection}
              variant="secondary"
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BulkActionsBar;
```

---

## Appendix B: Test File Template

```typescript
/**
 * BulkActionsBar Component Tests
 *
 * @module ItemManager/components/BulkActions/__tests__/BulkActionsBar.test
 * @lastModified 2026-01-03 (REQ-070)
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BulkActionsBar } from '../BulkActionsBar';

describe('BulkActionsBar', () => {
  const defaultProps = {
    selectedCount: 5,
    onDelete: jest.fn(),
    onAddTag: jest.fn(),
    onRemoveTag: jest.fn(),
    onExitSelection: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders when selectedCount > 0', () => {
      render(<BulkActionsBar {...defaultProps} />);
      expect(screen.getByRole('toolbar')).toBeInTheDocument();
    });

    it('does not render when selectedCount is 0', () => {
      render(<BulkActionsBar {...defaultProps} selectedCount={0} />);
      expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
    });

    it('displays correct selection count', () => {
      render(<BulkActionsBar {...defaultProps} selectedCount={3} />);
      expect(screen.getByText('3 selected')).toBeInTheDocument();
    });

    it('shows Move button when multiPropertyMode is true', () => {
      render(
        <BulkActionsBar
          {...defaultProps}
          multiPropertyMode={true}
          onMoveToProperty={jest.fn()}
        />
      );
      expect(screen.getByLabelText('Move to...')).toBeInTheDocument();
    });

    it('hides Move button when multiPropertyMode is false', () => {
      render(<BulkActionsBar {...defaultProps} multiPropertyMode={false} />);
      expect(screen.queryByLabelText('Move to...')).not.toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('calls onDelete when Delete button clicked', async () => {
      render(<BulkActionsBar {...defaultProps} />);
      await userEvent.click(screen.getByLabelText('Delete'));
      expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
    });

    it('calls onAddTag when Add Tag button clicked', async () => {
      render(<BulkActionsBar {...defaultProps} />);
      await userEvent.click(screen.getByLabelText('Add Tag'));
      expect(defaultProps.onAddTag).toHaveBeenCalledTimes(1);
    });

    it('calls onRemoveTag when Remove Tag button clicked', async () => {
      render(<BulkActionsBar {...defaultProps} />);
      await userEvent.click(screen.getByLabelText('Remove Tag'));
      expect(defaultProps.onRemoveTag).toHaveBeenCalledTimes(1);
    });

    it('calls onExitSelection when Cancel button clicked', async () => {
      render(<BulkActionsBar {...defaultProps} />);
      await userEvent.click(screen.getByLabelText('Cancel'));
      expect(defaultProps.onExitSelection).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading State', () => {
    it('disables all buttons when loading', () => {
      render(<BulkActionsBar {...defaultProps} loading={true} />);

      expect(screen.getByLabelText('Delete')).toBeDisabled();
      expect(screen.getByLabelText('Add Tag')).toBeDisabled();
      expect(screen.getByLabelText('Remove Tag')).toBeDisabled();
      expect(screen.getByLabelText('Cancel')).toBeDisabled();
    });

    it('shows loading indicator when loading', () => {
      render(<BulkActionsBar {...defaultProps} loading={true} />);
      expect(screen.getByRole('status')).toHaveTextContent('Processing...');
    });
  });

  describe('Accessibility', () => {
    it('has correct role and label', () => {
      render(<BulkActionsBar {...defaultProps} />);
      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toHaveAttribute('aria-label', expect.stringContaining('5 selected'));
    });

    it('all buttons have accessible labels', () => {
      render(<BulkActionsBar {...defaultProps} />);

      expect(screen.getByLabelText('Delete')).toBeInTheDocument();
      expect(screen.getByLabelText('Add Tag')).toBeInTheDocument();
      expect(screen.getByLabelText('Remove Tag')).toBeInTheDocument();
      expect(screen.getByLabelText('Cancel')).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      render(<BulkActionsBar {...defaultProps} />);
      const deleteButton = screen.getByLabelText('Delete');

      deleteButton.focus();
      expect(deleteButton).toHaveFocus();

      await userEvent.keyboard('{Enter}');
      expect(defaultProps.onDelete).toHaveBeenCalled();
    });
  });
});
```

---

## Appendix C: Styling Reference

### Tailwind Classes Breakdown

```typescript
// Container positioning
"fixed bottom-0 left-0 right-0 z-40"

// Background and elevation
"bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]"

// Safe area (iOS)
"pb-[env(safe-area-inset-bottom)]"

// Animation
"animate-in slide-in-from-bottom duration-300"

// Button base
"inline-flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg font-medium text-sm transition-colors"

// Button focus
"focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"

// Button disabled
"disabled:opacity-50 disabled:cursor-not-allowed"

// Destructive variant
"bg-red-600 text-white hover:bg-red-700 active:bg-red-800"

// Primary variant
"bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"

// Secondary variant
"bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300"

// Responsive label visibility
"hidden sm:inline" // Label hidden on mobile, visible on sm+
```
