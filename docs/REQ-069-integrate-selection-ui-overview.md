# REQ-069: Integrate Selection UI - Technical Implementation Overview

**Document Created:** 2026-01-03T14:30:00
**Last Modified:** 2026-01-03T14:30:00
**Request Reference:** REQ-069 (Selection Mode UI Integration with Visual Feedback)
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 3 - Selection & Bulk Actions
**Task ID:** 3.2

---

## 1. Executive Summary

This document provides the technical implementation breakdown for integrating selection UI into the ItemCard and ItemRow components (Task 3.2 in Phase 3). This task connects the `useItemSelection` hook (Task 3.1) to the visual components, enabling users to select items via checkboxes, long-press gestures on mobile, and providing clear visual feedback for selected items.

### Scope

The selection UI integration will:
- Add checkbox controls to ItemCard and ItemRow components
- Implement long-press gesture for mobile selection mode entry
- Apply visual highlighting/styling for selected items
- Display a selection count indicator
- Clearly differentiate selection mode active vs. inactive states

### Dependencies

- **Prerequisite Tasks:**
  - Task 1.4: ItemCard component (`src/components/ItemManager/components/ItemCard.tsx`)
  - Task 1.5: ItemRow component (`src/components/ItemManager/components/ItemRow.tsx`)
  - Task 3.1: useItemSelection hook (`src/components/ItemManager/hooks/useItemSelection.ts`)

- **Parallel Tasks:** None - this task builds on 3.1

- **Downstream Tasks:**
  - Task 3.3: BulkActionsBar component (consumes selection state)
  - Task 3.4: ConfirmDeleteDialog (uses selected items)
  - Task 3.5: BulkTagDialog (uses selected items)

---

## 2. Technical Context

### 2.1 Existing Stack & Patterns

| Technology | Details | Source |
|------------|---------|--------|
| Framework | Next.js 15.5.9 with React 19.1.0 | `package.json` |
| Language | TypeScript 5.x (strict mode) | `tsconfig.json` |
| Styling | Tailwind CSS 4.x with `cn()` utility | `src/lib/utils.ts` |
| Icons | Lucide React 0.525.0 | `package.json` |
| State | useItemSelection hook (reducer-based) | Task 3.1 |

### 2.2 Reference Patterns from Codebase

**Checkbox Pattern (from ItemCard/ItemRow overviews):**
```typescript
{isSelectionMode && (
  <input
    type="checkbox"
    checked={isSelected}
    onChange={(e) => {
      e.stopPropagation();
      onSelectionChange(item.id, e.target.checked);
    }}
    onClick={(e) => e.stopPropagation()}
    className="w-5 h-5 rounded border-gray-300 text-blue-600
               focus:ring-blue-500 cursor-pointer"
    aria-label={`Select ${item.title}`}
  />
)}
```

**Selection State Styling (from LinkCard pattern):**
```typescript
<div className={cn(
  "group cursor-pointer bg-white rounded-xl shadow-sm border border-gray-200",
  isSelected && "border-blue-500 ring-2 ring-blue-200 bg-blue-50"
)}>
```

### 2.3 Selection Hook Interface

From Task 3.1 (`useItemSelection`), the following will be consumed:

```typescript
interface UseItemSelectionReturn {
  // State
  selectedIds: Set<string>;
  selectedCount: number;
  isSelectionMode: boolean;

  // Item-level actions
  selectItem: (id: string) => void;
  toggleItem: (id: string) => void;
  isSelected: (id: string) => boolean;

  // Mode control
  enterSelectionMode: () => void;
  exitSelectionMode: () => void;

  // Computed
  hasSelection: boolean;
}
```

---

## 3. Implementation Approach

### 3.1 Component Updates Required

#### 3.1.1 ItemCard Modifications

The ItemCard component needs:
1. **Checkbox overlay** in thumbnail area (top-left)
2. **Selected state styling** (ring, background tint)
3. **Long-press handler** for mobile selection mode entry
4. **Click behavior modification** when in selection mode

```typescript
// Updated ItemCard click behavior
const handleCardClick = (e: React.MouseEvent) => {
  if ((e.target as HTMLElement).tagName === 'INPUT') return;

  // In selection mode, toggle selection instead of preview
  if (isSelectionMode) {
    onToggleSelection(item.id);
    return;
  }

  onPreviewClick(item);
};
```

#### 3.1.2 ItemRow Modifications

The ItemRow component needs:
1. **Checkbox column** (conditional, left-most)
2. **Selected state styling** (background, left border)
3. **Long-press handler** for mobile selection mode entry
4. **Click behavior modification** when in selection mode

### 3.2 Long-Press Gesture Implementation

For mobile devices, implement a 500ms long-press to enter selection mode and select the first item:

```typescript
import { useRef, useCallback } from 'react';

interface UseLongPressOptions {
  onLongPress: () => void;
  delay?: number;
}

function useLongPress({ onLongPress, delay = 500 }: UseLongPressOptions) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  const start = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    // Only trigger on touch or left mouse button
    if ('button' in e && e.button !== 0) return;

    isLongPressRef.current = false;
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onLongPress();
    }, delay);
  }, [onLongPress, delay]);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handlers = {
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchCancel: cancel,
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
  };

  return { handlers, isLongPress: () => isLongPressRef.current };
}
```

### 3.3 Selection Count Display

A selection count indicator should be visible in the toolbar when items are selected:

```typescript
// In ItemToolbar or parent component
{selectedCount > 0 && (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
    <span>{selectedCount} selected</span>
    <button
      onClick={onClearSelection}
      className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
      aria-label="Clear selection"
    >
      <X className="w-4 h-4" />
    </button>
  </div>
)}
```

### 3.4 Visual States Summary

| State | ItemCard Styling | ItemRow Styling |
|-------|------------------|-----------------|
| **Normal** | `border-gray-200 bg-white` | `bg-white border-b border-gray-200` |
| **Hover** | `hover:shadow-lg hover:border-gray-300` | `hover:bg-gray-50` |
| **Selected** | `border-blue-500 ring-2 ring-blue-200 bg-blue-50` | `bg-blue-50 border-l-4 border-l-blue-500` |
| **Selection Mode (not selected)** | Checkbox visible, subtle hover indicator | Checkbox column visible |

### 3.5 Accessibility Requirements

1. **Checkbox Accessibility:**
   - `aria-label="Select {item.title}"`
   - Minimum touch target: 44x44px (WCAG AA)
   - Focus visible styling
   - Keyboard accessible (Tab, Space to toggle)

2. **Selection Count:**
   - Announce count changes to screen readers
   - Use `aria-live="polite"` for count updates

3. **Long-press Alternative:**
   - Provide visible checkbox button for keyboard users
   - Consider "Select mode" toggle button in toolbar

---

## 4. Authorized Files and Functions for Modification

### 4.1 Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemManager/components/ItemCard.tsx` | Add checkbox, selection styling, long-press |
| `src/components/ItemManager/components/ItemRow.tsx` | Add checkbox column, selection styling, long-press |
| `src/components/ItemManager/ItemManager.tsx` | Wire selection hook to child components |
| `src/components/ItemManager/components/ItemToolbar.tsx` | Add selection count display |
| `src/components/ItemManager/ItemManager.types.ts` | Update props interfaces if needed |

### 4.2 Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/hooks/useLongPress.ts` | Reusable long-press gesture hook |

### 4.3 Functions to Implement/Modify

| Function | File | Purpose |
|----------|------|---------|
| `useLongPress` | `hooks/useLongPress.ts` | Long-press gesture detection |
| `ItemCard` (update) | `components/ItemCard.tsx` | Add selection UI elements |
| `ItemRow` (update) | `components/ItemRow.tsx` | Add selection UI elements |
| `SelectionCountBadge` | `components/ItemToolbar.tsx` | Selection count display |

---

## 5. Detailed Task Breakdown

### Task 3.2.1: Create useLongPress Hook

**File:** `src/components/ItemManager/hooks/useLongPress.ts`

**Implementation:**

```typescript
'use client';

/**
 * useLongPress Hook
 *
 * Detects long-press gestures for mobile selection mode entry.
 * Returns handlers to spread on target element and a function
 * to check if long-press occurred (to prevent click action).
 *
 * @module ItemManager/hooks/useLongPress
 * @lastModified 2026-01-03 (REQ-069)
 */

import { useRef, useCallback } from 'react';

export interface UseLongPressOptions {
  /** Callback when long-press is detected */
  onLongPress: () => void;
  /** Long-press delay in milliseconds (default: 500) */
  delay?: number;
  /** Whether long-press is enabled (default: true) */
  enabled?: boolean;
}

export interface UseLongPressReturn {
  /** Event handlers to spread on target element */
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
    onTouchCancel: () => void;
    onTouchMove: () => void;
    onContextMenu: (e: React.MouseEvent) => void;
  };
  /** Check if long-press was triggered (call before onClick) */
  isLongPress: () => boolean;
  /** Reset the long-press state */
  reset: () => void;
}

export function useLongPress({
  onLongPress,
  delay = 500,
  enabled = true,
}: UseLongPressOptions): UseLongPressReturn {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  const start = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return;

      isLongPressRef.current = false;
      timerRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        onLongPress();
        // Provide haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }, delay);
    },
    [onLongPress, delay, enabled]
  );

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    cancel();
    isLongPressRef.current = false;
  }, [cancel]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    // Prevent context menu on long-press
    if (isLongPressRef.current) {
      e.preventDefault();
    }
  }, []);

  const handlers = {
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchCancel: cancel,
    onTouchMove: cancel, // Cancel if user moves finger
    onContextMenu: handleContextMenu,
  };

  return {
    handlers,
    isLongPress: () => isLongPressRef.current,
    reset,
  };
}

export default useLongPress;
```

### Task 3.2.2: Update ItemCard with Selection UI

**File:** `src/components/ItemManager/components/ItemCard.tsx`

**Key Changes:**

1. Add new props for selection:
```typescript
export interface ItemCardProps {
  item: ItemRecord;
  onPreviewClick: (item: ItemRecord) => void;

  // Selection props
  isSelected: boolean;
  isSelectionMode: boolean;
  onToggleSelection: (id: string) => void;
  onLongPressSelect: (id: string) => void;

  className?: string;
}
```

2. Integrate long-press hook:
```typescript
const { handlers: longPressHandlers, isLongPress } = useLongPress({
  onLongPress: () => onLongPressSelect(item.id),
  enabled: !isSelectionMode, // Only trigger when not already in selection mode
});
```

3. Update click handler:
```typescript
const handleCardClick = (e: React.MouseEvent) => {
  // Ignore checkbox clicks
  if ((e.target as HTMLElement).tagName === 'INPUT') return;

  // Ignore if this was a long-press
  if (isLongPress()) return;

  // In selection mode, toggle selection
  if (isSelectionMode) {
    onToggleSelection(item.id);
    return;
  }

  // Normal mode: open preview
  onPreviewClick(item);
};
```

4. Add checkbox overlay:
```typescript
{/* Selection Checkbox */}
{isSelectionMode && (
  <div
    className="absolute top-2 left-2 z-10"
    onClick={(e) => e.stopPropagation()}
  >
    <div className="bg-white/90 backdrop-blur-sm rounded p-1 shadow-sm">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggleSelection(item.id)}
        className="w-5 h-5 rounded border-gray-300 text-blue-600
                   focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
        aria-label={`Select ${item.title}`}
      />
    </div>
  </div>
)}
```

5. Update container styling:
```typescript
<div
  {...longPressHandlers}
  role="button"
  tabIndex={0}
  aria-label={`View ${item.title}`}
  aria-selected={isSelected}
  onClick={handleCardClick}
  onKeyDown={handleKeyDown}
  className={cn(
    "group cursor-pointer bg-white rounded-xl shadow-sm border transition-all duration-200 overflow-hidden",
    "hover:shadow-lg hover:border-gray-300",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
    // Selection styling
    isSelected
      ? "border-blue-500 ring-2 ring-blue-200 bg-blue-50"
      : "border-gray-200",
    // Selection mode indicator
    isSelectionMode && !isSelected && "hover:ring-1 hover:ring-blue-300",
    className
  )}
>
```

6. Add selected overlay indicator:
```typescript
{/* Selected overlay indicator */}
{isSelected && (
  <div className="absolute inset-0 bg-blue-500/10 pointer-events-none rounded-xl" />
)}
```

### Task 3.2.3: Update ItemRow with Selection UI

**File:** `src/components/ItemManager/components/ItemRow.tsx`

**Key Changes:**

1. Update props interface:
```typescript
export interface ItemRowProps {
  item: ItemRecord;
  onPreviewClick: (item: ItemRecord) => void;

  // Selection props
  isSelected: boolean;
  isSelectionMode: boolean;
  onToggleSelection: (id: string) => void;
  onLongPressSelect: (id: string) => void;

  // Action handlers
  onEdit: (item: ItemRecord) => void;
  onDelete: (item: ItemRecord) => void;
  onManageAssets?: (item: ItemRecord) => void;
  onDuplicate?: (item: ItemRecord) => void;

  className?: string;
}
```

2. Integrate long-press:
```typescript
const { handlers: longPressHandlers, isLongPress } = useLongPress({
  onLongPress: () => onLongPressSelect(item.id),
  enabled: !isSelectionMode,
});
```

3. Update row click handler:
```typescript
const handleRowClick = (e: React.MouseEvent) => {
  const target = e.target as HTMLElement;
  if (
    target.tagName === 'INPUT' ||
    target.tagName === 'BUTTON' ||
    target.closest('button') ||
    target.closest('[role="menu"]')
  ) {
    return;
  }

  if (isLongPress()) return;

  if (isSelectionMode) {
    onToggleSelection(item.id);
    return;
  }

  onPreviewClick(item);
};
```

4. Update container with selection styling:
```typescript
<div
  {...longPressHandlers}
  role="row"
  tabIndex={0}
  aria-label={`Item: ${item.title}`}
  aria-selected={isSelected}
  onClick={handleRowClick}
  onKeyDown={handleKeyDown}
  className={cn(
    "flex items-center gap-4 px-4 py-3 bg-white border-b transition-colors cursor-pointer",
    "hover:bg-gray-50",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500",
    // Selection styling
    isSelected
      ? "bg-blue-50 border-l-4 border-l-blue-500 border-b-gray-200"
      : "border-gray-200",
    // Selection mode indicator
    isSelectionMode && !isSelected && "hover:bg-blue-50/50",
    className
  )}
>
```

5. Checkbox column (always present when selection mode active):
```typescript
{/* Selection Checkbox Column */}
{isSelectionMode && (
  <div className="flex-shrink-0 w-10 flex items-center justify-center">
    <input
      type="checkbox"
      checked={isSelected}
      onChange={() => onToggleSelection(item.id)}
      onClick={(e) => e.stopPropagation()}
      className="w-5 h-5 rounded border-gray-300 text-blue-600
                 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
      aria-label={`Select ${item.title}`}
    />
  </div>
)}
```

### Task 3.2.4: Add Selection Count Display to ItemToolbar

**File:** `src/components/ItemManager/components/ItemToolbar.tsx`

**Implementation:**

```typescript
import { X, CheckSquare } from 'lucide-react';

interface SelectionIndicatorProps {
  selectedCount: number;
  onClearSelection: () => void;
  onSelectAll: () => void;
  totalCount: number;
}

function SelectionIndicator({
  selectedCount,
  onClearSelection,
  onSelectAll,
  totalCount,
}: SelectionIndicatorProps) {
  if (selectedCount === 0) return null;

  const allSelected = selectedCount === totalCount;

  return (
    <div
      className="flex items-center gap-2"
      role="status"
      aria-live="polite"
    >
      {/* Selection count badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full">
        <CheckSquare className="w-4 h-4" />
        <span className="text-sm font-medium">
          {selectedCount} selected
        </span>
        <button
          type="button"
          onClick={onClearSelection}
          className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
          aria-label="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Select all / Deselect all */}
      {!allSelected && (
        <button
          type="button"
          onClick={onSelectAll}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Select all ({totalCount})
        </button>
      )}
    </div>
  );
}
```

### Task 3.2.5: Wire Selection in ItemManager

**File:** `src/components/ItemManager/ItemManager.tsx`

**Integration:**

```typescript
import { useItemSelection } from './hooks/useItemSelection';
import { useItemSearch } from './hooks/useItemSearch';

function ItemManager({ items, config, onSelectionChange, ...props }: ItemManagerProps) {
  // Search/filter hook
  const { filteredItems } = useItemSearch({ items, ... });

  // Selection hook
  const {
    selectedIds,
    selectedCount,
    isSelectionMode,
    selectItem,
    toggleItem,
    selectAll,
    clearSelection,
    isSelected,
    enterSelectionMode,
  } = useItemSelection({
    maxSelection: config?.maxBulkSelection ?? 100,
    onSelectionChange,
  });

  // Long-press handler: enter selection mode and select the item
  const handleLongPressSelect = useCallback((id: string) => {
    if (!isSelectionMode) {
      enterSelectionMode();
    }
    selectItem(id);
  }, [isSelectionMode, enterSelectionMode, selectItem]);

  // Select all filtered items
  const handleSelectAll = useCallback(() => {
    selectAll(filteredItems.map(item => item.id));
  }, [selectAll, filteredItems]);

  return (
    <div className="flex flex-col h-full">
      <ItemToolbar
        // ... other props
        selectedCount={selectedCount}
        onClearSelection={clearSelection}
        onSelectAll={handleSelectAll}
        totalCount={filteredItems.length}
      />

      {config?.defaultView === 'grid' ? (
        <ItemGrid
          items={filteredItems}
          isSelectionMode={isSelectionMode}
          isSelected={isSelected}
          onToggleSelection={toggleItem}
          onLongPressSelect={handleLongPressSelect}
          onPreviewClick={handlePreviewClick}
        />
      ) : (
        <ItemList
          items={filteredItems}
          isSelectionMode={isSelectionMode}
          isSelected={isSelected}
          onToggleSelection={toggleItem}
          onLongPressSelect={handleLongPressSelect}
          onPreviewClick={handlePreviewClick}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
        />
      )}

      {/* Bulk actions bar appears when items selected */}
      {selectedCount > 0 && (
        <BulkActionsBar
          selectedCount={selectedCount}
          onDelete={() => handleBulkDelete(selectedIds)}
          onClearSelection={clearSelection}
        />
      )}
    </div>
  );
}
```

---

## 6. Visual Design Specifications

### 6.1 Checkbox Styling

**Default State:**
- Size: 20x20px (w-5 h-5)
- Border: `border-gray-300` (1px solid)
- Background: white
- Border radius: 4px (rounded)

**Checked State:**
- Background: `bg-blue-600`
- Check icon: white
- Border: none

**Focus State:**
- Ring: `ring-2 ring-blue-500 ring-offset-2`

**Touch Target:**
- Minimum 44x44px padding area around checkbox

### 6.2 Selected Item Styling

**ItemCard (Grid):**
```css
/* Normal */
.item-card {
  border: 1px solid #e5e7eb; /* gray-200 */
  background: white;
}

/* Selected */
.item-card.selected {
  border: 2px solid #3b82f6; /* blue-500 */
  box-shadow: 0 0 0 2px #bfdbfe; /* ring-2 ring-blue-200 */
  background: #eff6ff; /* blue-50 */
}
```

**ItemRow (List):**
```css
/* Normal */
.item-row {
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

/* Selected */
.item-row.selected {
  background: #eff6ff; /* blue-50 */
  border-left: 4px solid #3b82f6; /* blue-500 */
}
```

### 6.3 Selection Mode Visual Cues

When selection mode is active but item is not selected:
- Subtle blue border on hover: `hover:ring-1 hover:ring-blue-300`
- Cursor indicator: `cursor-pointer`

### 6.4 Selection Count Badge

```css
.selection-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #dbeafe; /* blue-100 */
  color: #1e40af; /* blue-800 */
  border-radius: 9999px; /* full */
  font-size: 14px;
  font-weight: 500;
}
```

---

## 7. Acceptance Criteria Mapping

| Criteria (from REQ-069) | Implementation |
|-------------------------|----------------|
| Checkboxes appear on item cards when selection mode is active | Conditional checkbox overlay in ItemCard thumbnail area |
| Checkboxes appear on item rows when selection mode is active | Conditional checkbox column in ItemRow |
| Long-press gesture on mobile activates selection mode | `useLongPress` hook with 500ms delay |
| Selected items display visually distinct appearance | Blue border, ring, and background tint |
| Selection count indicator shows current number | `SelectionIndicator` component in toolbar |
| Visual state differentiates selection mode active/inactive | Different hover states, checkbox visibility |
| Checkbox controls accessible (WCAG touch targets, keyboard) | 44x44px touch area, aria-label, Tab/Space support |
| Selection state updates immediately and smoothly | `transition-all duration-200` on styling changes |

---

## 8. Testing Requirements

### 8.1 Unit Test Cases

| Test Case | Description |
|-----------|-------------|
| Checkbox renders in selection mode | Checkbox visible when `isSelectionMode=true` |
| Checkbox hidden outside selection mode | Checkbox not rendered when `isSelectionMode=false` |
| Checkbox state matches isSelected | Checked/unchecked reflects prop |
| Toggle selection on checkbox click | `onToggleSelection` called with correct id |
| Click does not bubble from checkbox | Card/row click handler not triggered |
| Long-press triggers callback | `onLongPressSelect` called after 500ms |
| Long-press cancelled on move | Moving finger cancels long-press |
| Selected styling applied | Blue border/background when selected |
| Selection count displays correctly | Badge shows accurate count |
| Clear selection works | Count resets, styling removed |

### 8.2 Integration Test Cases

| Test Case | Description |
|-----------|-------------|
| Long-press enters selection mode | First long-press enables mode and selects item |
| Click selects in selection mode | Click toggles selection when mode active |
| Click previews outside selection mode | Click opens preview when mode inactive |
| Select all selects filtered items | All visible items selected |
| Keyboard selection works | Tab to checkbox, Space to toggle |

### 8.3 Accessibility Test Cases

| Test Case | Description |
|-----------|-------------|
| Touch target size | Checkbox touch area ≥ 44x44px |
| Screen reader announces selection | aria-selected updates announced |
| Keyboard navigation | Tab focuses checkbox, Space toggles |
| Focus visible | Focus ring visible on keyboard focus |
| Selection count announced | aria-live announces count changes |

### 8.4 Mobile-Specific Tests

| Test Case | Description |
|-----------|-------------|
| Long-press works on iOS Safari | 500ms hold triggers selection |
| Long-press works on Android Chrome | 500ms hold triggers selection |
| Context menu prevented | Right-click/long-press doesn't show menu |
| Haptic feedback | Vibration on long-press (where supported) |
| Touch scrolling not affected | Scrolling doesn't trigger selection |

---

## 9. Performance Considerations

### 9.1 Rendering Optimization

- Use `React.memo` on ItemCard/ItemRow to prevent unnecessary re-renders
- Memoize `isSelected` check function in parent
- Avoid inline function creation for handlers (use `useCallback`)

```typescript
// Memoized card with proper dependency check
const MemoizedItemCard = React.memo(ItemCard, (prevProps, nextProps) => {
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isSelectionMode === nextProps.isSelectionMode
  );
});
```

### 9.2 Event Handler Optimization

- Single event listener for long-press cleanup on unmount
- Debounce/throttle not needed for selection (instant feedback preferred)

---

## 10. Mobile Considerations

### 10.1 Long-Press UX

- **Delay:** 500ms (balance between accidental triggers and responsiveness)
- **Feedback:** Haptic vibration when long-press detected
- **Cancel:** Any finger movement cancels the long-press
- **Context menu:** Prevent native context menu during long-press

### 10.2 Touch Targets

- Checkbox minimum touch area: 44x44px (WCAG AA)
- Sufficient spacing between interactive elements
- Visual feedback on touch (active states)

### 10.3 Scroll vs. Selection

- Long-press only triggers on stationary touch
- `onTouchMove` cancels long-press timer
- No conflict with scroll gestures

---

## 11. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Long-press conflicts with scroll | Medium | Medium | Cancel on touchmove; 500ms delay |
| Performance with many selected items | Low | Medium | Set-based selection (O(1) lookups) |
| Accessibility gaps | Medium | High | Thorough keyboard/screen reader testing |
| iOS Safari long-press quirks | Medium | Medium | Test on real devices; prevent context menu |
| Visual clutter in selection mode | Low | Low | Subtle checkbox styling; fade-in animation |

---

## 12. Implementation Sequence

1. **Create useLongPress hook** (Task 3.2.1)
   - Implement gesture detection
   - Add haptic feedback support
   - Export from hooks index

2. **Update ItemCard** (Task 3.2.2)
   - Add selection props to interface
   - Integrate long-press hook
   - Add checkbox overlay
   - Apply selection styling
   - Update click behavior

3. **Update ItemRow** (Task 3.2.3)
   - Add selection props to interface
   - Integrate long-press hook
   - Add checkbox column
   - Apply selection styling
   - Update click behavior

4. **Add selection count display** (Task 3.2.4)
   - Create SelectionIndicator component
   - Integrate into ItemToolbar

5. **Wire in ItemManager** (Task 3.2.5)
   - Connect useItemSelection to child components
   - Implement handleLongPressSelect
   - Pass selection props to ItemCard/ItemRow/ItemToolbar

6. **Testing and refinement**
   - Cross-browser testing
   - Mobile device testing
   - Accessibility audit

---

## 13. Related Documents

- [Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md) - Phase 3, Task 3.2
- [useItemSelection Hook](/docs/REQ-068-create-useitemselection-hook-overview.md) - Task 3.1 reference
- [ItemCard Component](/docs/REQ-058-implement-itemcard-component-overview.md) - Base component
- [ItemRow Component](/docs/REQ-059-implement-itemrow-component-overview.md) - Base component
- [ConfirmationModal](/src/components/ConfirmationModal.tsx) - Modal pattern reference
- [LinkCard](/src/components/LinkCard.tsx) - Card styling reference

---

## 14. Estimated Effort

| Task | Estimate |
|------|----------|
| Create useLongPress hook | 1 hour |
| Update ItemCard with selection UI | 2 hours |
| Update ItemRow with selection UI | 2 hours |
| Add SelectionIndicator to toolbar | 1 hour |
| Wire selection in ItemManager | 1 hour |
| Testing (unit, integration, a11y) | 2 hours |
| Mobile testing and refinement | 1 hour |
| **Total** | **10 hours** |

---

## Appendix A: Complete useLongPress Hook

```typescript
'use client';

/**
 * useLongPress Hook
 *
 * Detects long-press gestures for mobile selection mode entry.
 * Provides handlers to spread on target element and utility functions
 * to check if long-press occurred and reset state.
 *
 * @module ItemManager/hooks/useLongPress
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 3, Task 3.2)
 * @lastModified 2026-01-03 (REQ-069)
 */

import { useRef, useCallback, useEffect } from 'react';

export interface UseLongPressOptions {
  /** Callback when long-press is detected */
  onLongPress: () => void;
  /** Long-press delay in milliseconds (default: 500) */
  delay?: number;
  /** Whether long-press is enabled (default: true) */
  enabled?: boolean;
  /** Whether to provide haptic feedback (default: true) */
  hapticFeedback?: boolean;
}

export interface UseLongPressReturn {
  /** Event handlers to spread on target element */
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
    onTouchCancel: () => void;
    onTouchMove: () => void;
    onContextMenu: (e: React.MouseEvent) => void;
  };
  /** Check if long-press was triggered (call before onClick) */
  isLongPress: () => boolean;
  /** Reset the long-press state */
  reset: () => void;
}

export function useLongPress({
  onLongPress,
  delay = 500,
  enabled = true,
  hapticFeedback = true,
}: UseLongPressOptions): UseLongPressReturn {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const start = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return;

      isLongPressRef.current = false;
      timerRef.current = setTimeout(() => {
        isLongPressRef.current = true;

        // Haptic feedback if available
        if (hapticFeedback && 'vibrate' in navigator) {
          navigator.vibrate(50);
        }

        onLongPress();
      }, delay);
    },
    [onLongPress, delay, enabled, hapticFeedback]
  );

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    cancel();
    isLongPressRef.current = false;
  }, [cancel]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    // Prevent context menu when long-press is detected
    if (isLongPressRef.current) {
      e.preventDefault();
    }
  }, []);

  const handlers = {
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchCancel: cancel,
    onTouchMove: cancel,
    onContextMenu: handleContextMenu,
  };

  return {
    handlers,
    isLongPress: () => isLongPressRef.current,
    reset,
  };
}

export default useLongPress;
```

---

## Appendix B: Updated ItemCard Props Interface

```typescript
/**
 * Props for ItemCard component with selection support.
 * @lastModified 2026-01-03 (REQ-069)
 */
export interface ItemCardProps {
  /** The item record to display */
  item: ItemRecord;

  /** Callback when card is clicked (for preview) */
  onPreviewClick: (item: ItemRecord) => void;

  /** Whether the card is currently selected */
  isSelected: boolean;

  /** Whether selection mode is active (shows checkbox) */
  isSelectionMode: boolean;

  /** Toggle selection state of this item */
  onToggleSelection: (id: string) => void;

  /** Callback when long-press detected (enters selection mode) */
  onLongPressSelect: (id: string) => void;

  /** Optional additional CSS classes */
  className?: string;
}
```

---

## Appendix C: Selection State Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         User Actions                              │
└───────────────────────────────┬──────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────────┐
        │                       │                           │
        ▼                       ▼                           ▼
┌───────────────┐     ┌─────────────────┐         ┌───────────────┐
│  Long-press   │     │  Checkbox Click │         │  Clear Button │
│  (mobile)     │     │  (any device)   │         │  (toolbar)    │
└───────┬───────┘     └────────┬────────┘         └───────┬───────┘
        │                      │                          │
        ▼                      ▼                          ▼
┌───────────────┐     ┌─────────────────┐         ┌───────────────┐
│ enterSelection│     │   toggleItem    │         │clearSelection │
│    Mode()     │     │      (id)       │         │     ()        │
│  selectItem() │     └────────┬────────┘         └───────┬───────┘
└───────┬───────┘              │                          │
        │                      │                          │
        └──────────────────────┼──────────────────────────┘
                               │
                               ▼
                ┌─────────────────────────────┐
                │      Selection State        │
                │   (useItemSelection hook)   │
                │                             │
                │   selectedIds: Set<string>  │
                │   isSelectionMode: boolean  │
                │   selectedCount: number     │
                └──────────────┬──────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐     ┌───────────────┐      ┌───────────────┐
│   ItemCard    │     │   ItemRow     │      │ ItemToolbar   │
│               │     │               │      │               │
│ isSelected    │     │ isSelected    │      │ selectedCount │
│ isSelectionM  │     │ isSelectionM  │      │               │
│ checkbox      │     │ checkbox col  │      │ count badge   │
│ styling       │     │ styling       │      │ clear button  │
└───────────────┘     └───────────────┘      └───────────────┘
```
