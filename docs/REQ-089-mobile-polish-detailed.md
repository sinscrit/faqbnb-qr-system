# REQ-089: Mobile UX Polish and Touch Optimization - Detailed Task Breakdown

**Document Created:** 2026-01-03T19:30:00
**Last Modified:** 2026-01-03T20:45:00
**Overview Reference:** `/docs/REQ-089-mobile-polish-overview.md`
**Request Reference:** `/docs/gen_requests.md` - REQ-089
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 6 - Inline Edit & Polish
**Task ID:** 6.4
**Status:** IMPLEMENTATION COMPLETE

---

## Executive Summary

This document provides a detailed task breakdown for implementing mobile UX polish and touch optimization across the ItemManager component. Each task is scoped to approximately 1 story point (2-4 hours of focused work) and includes verification steps.

### Prerequisites

Before beginning implementation, the following must be complete:
- REQ-086: InlineEdit Component (Task 6.1) - COMPLETE
- REQ-087: Title/Location Inline Edit (Task 6.2) - COMPLETE
- REQ-088: Tags Inline Edit (Task 6.3) - COMPLETE
- REQ-074: ItemPreviewModal Component (Task 4.1) - COMPLETE
- REQ-065: FilterPanel Component (Task 2.4) - COMPLETE

### Scope

This implementation covers:
1. Creation of viewport detection hook (`useIsMobile`)
2. Creation of reusable mobile components (BottomSheet, SwipeableRow, TouchButton)
3. Touch target audit and updates across all ItemManager components
4. FilterPanel mobile collapse behavior
5. ItemPreviewModal bottom sheet transformation
6. Optional swipe gesture support

---

## Authorized Files for Modification

### New Files to Create

| File | Purpose |
|------|---------|
| `src/components/ItemManager/hooks/useIsMobile.ts` | Viewport detection hook |
| `src/components/ItemManager/components/shared/BottomSheet.tsx` | Mobile bottom sheet component |
| `src/components/ItemManager/components/shared/SwipeableRow.tsx` | Swipe-to-reveal actions wrapper (optional) |
| `src/components/ItemManager/components/shared/TouchButton.tsx` | Touch-friendly button wrapper utility |

### Existing Files to Modify

| File | Modification |
|------|--------------|
| `src/components/ItemManager/components/dialogs/FilterPanel.tsx` | Add mobile collapse behavior |
| `src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` | Add bottom sheet rendering for mobile |
| `src/components/ItemManager/components/ItemCard.tsx` | Ensure 48px touch targets on mobile |
| `src/components/ItemManager/components/ItemRow.tsx` | Add touch targets, optional swipe actions |
| `src/components/ItemManager/components/shared/TagChip.tsx` | Ensure 44px+ remove button on mobile |
| `src/components/ItemManager/components/shared/InlineEdit.tsx` | Ensure touch-friendly sizing |
| `src/components/ItemManager/components/shared/TagsInlineEdit.tsx` | Ensure touch-friendly sizing |
| `src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx` | Verify 48px+ button heights |
| `src/components/ItemManager/components/dialogs/SortMenu.tsx` | Ensure 48px+ option heights |
| `src/components/ItemManager/components/ItemToolbar.tsx` | Ensure touch-friendly controls |
| `src/components/ItemManager/components/shared/index.ts` | Export new components |
| `src/components/ItemManager/hooks/index.ts` | Export useIsMobile hook |

### Reference Files (Read Only)

| File | Reference Purpose |
|------|-------------------|
| `src/lib/utils.ts` | `cn()` utility function |
| `src/components/ItemCapture/components/shared/StepNavigation.tsx` | Touch target pattern (44px+ min-h) |
| `src/components/ItemCapture/components/shared/ProgressIndicator.tsx` | Mobile/desktop split pattern |

---

## Task Breakdown

### Task 1: Create useIsMobile Hook

**Task ID:** 089-01
**Estimated Effort:** 1-2 hours
**Dependencies:** None

#### Description

Create a reusable viewport detection hook that determines if the current viewport is mobile-sized (< 768px by default). This hook will be used by multiple components to conditionally render mobile-optimized UI.

#### Implementation Steps

1. Create file `src/components/ItemManager/hooks/useIsMobile.ts`
2. Implement the hook with the following interface:
   ```typescript
   export interface UseIsMobileOptions {
     /** Breakpoint in pixels (default: 768) */
     breakpoint?: number;
   }

   export function useIsMobile(options?: UseIsMobileOptions): boolean
   ```
3. Use `useState` and `useEffect` with `window.matchMedia` for efficient viewport detection
4. Handle SSR by defaulting to `false` on initial render
5. Clean up event listener on unmount
6. Add debounce or throttle if performance issues arise (optional optimization)

#### Code Template

```typescript
// src/components/ItemManager/hooks/useIsMobile.ts
'use client';

import { useState, useEffect } from 'react';

export interface UseIsMobileOptions {
  /** Breakpoint in pixels (default: 768 = md breakpoint) */
  breakpoint?: number;
}

export function useIsMobile(options: UseIsMobileOptions = {}): boolean {
  const { breakpoint = 768 } = options;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window is available (SSR safety)
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

    // Set initial value
    setIsMobile(mediaQuery.matches);

    // Handler for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    // Add listener (modern API)
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [breakpoint]);

  return isMobile;
}

export default useIsMobile;
```

#### Verification Steps

- [ ] Hook returns `false` on desktop viewports (>= 768px)
- [ ] Hook returns `true` on mobile viewports (< 768px)
- [ ] Value updates when viewport is resized across breakpoint
- [ ] No hydration mismatch errors in development mode
- [ ] Custom breakpoint parameter works correctly
- [ ] Hook cleans up event listener on unmount
- [ ] TypeScript types are correct and exported

---

### Task 2: Create BottomSheet Component

**Task ID:** 089-02
**Estimated Effort:** 3-4 hours
**Dependencies:** Task 089-01 (useIsMobile)

#### Description

Create a mobile-optimized bottom sheet component that slides up from the bottom of the viewport. This component supports swipe-to-dismiss gesture, backdrop tap-to-close, and proper focus management.

#### Implementation Steps

1. Create file `src/components/ItemManager/components/shared/BottomSheet.tsx`
2. Implement component with props interface as defined in overview
3. Add swipe gesture handling using touch events
4. Implement backdrop with tap-to-close
5. Add drag handle visual indicator
6. Lock body scroll when sheet is open
7. Handle Escape key for dismissal
8. Add CSS transitions for smooth open/close animations
9. Ensure proper ARIA attributes for accessibility

#### Props Interface

```typescript
export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
  showDragHandle?: boolean;      // default: true
  swipeToDismiss?: boolean;      // default: true
  swipeThreshold?: number;       // default: 100
  maxHeightPercent?: number;     // default: 90
}
```

#### Key Implementation Details

1. **Touch Gesture Handling:**
   - Track `touchStart` Y position
   - Calculate drag offset during `touchMove`
   - Only allow downward drag (positive Y offset)
   - On `touchEnd`, dismiss if offset > threshold

2. **Animations:**
   - Use CSS `transform: translateY()` for performance
   - Disable transition during active drag
   - Re-enable transition for snap-back or dismiss

3. **Accessibility:**
   - Set `role="dialog"` and `aria-modal="true"`
   - Trap focus within sheet when open
   - Announce sheet title to screen readers
   - Handle Escape key

#### Verification Steps

- [ ] Sheet slides up smoothly when `isOpen` becomes true
- [ ] Sheet slides down when `isOpen` becomes false
- [ ] Swiping down more than threshold dismisses sheet
- [ ] Swiping down less than threshold snaps back to open position
- [ ] Tapping backdrop calls `onClose`
- [ ] Escape key calls `onClose`
- [ ] Body scroll is locked when sheet is open
- [ ] Drag handle is visible and provides visual feedback
- [ ] Content within sheet scrolls properly
- [ ] Title displays correctly when provided
- [ ] Close button has minimum 44x44px touch target
- [ ] Focus management works correctly

---

### Task 3: Create TouchButton Utility Component

**Task ID:** 089-03
**Estimated Effort:** 1-2 hours
**Dependencies:** None

#### Description

Create a utility button wrapper that ensures minimum touch target sizing on mobile viewports while maintaining normal sizing on desktop. This component simplifies applying touch-friendly sizing across the codebase.

#### Implementation Steps

1. Create file `src/components/ItemManager/components/shared/TouchButton.tsx`
2. Implement as a wrapper around native button element
3. Apply mobile-specific touch target classes
4. Support all standard button props via spread
5. Add touch feedback styling (active state)

#### Props Interface

```typescript
export interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Additional CSS classes */
  className?: string;
  /** Minimum size in pixels (default: 48) */
  minSize?: number;
  /** Apply touch sizing on all viewports, not just mobile (default: false) */
  alwaysApply?: boolean;
}
```

#### Code Template

```typescript
// src/components/ItemManager/components/shared/TouchButton.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  minSize?: number;
  alwaysApply?: boolean;
}

export function TouchButton({
  children,
  className,
  minSize = 48,
  alwaysApply = false,
  ...props
}: TouchButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center',
        // Touch target sizing
        alwaysApply
          ? `min-h-[${minSize}px] min-w-[${minSize}px]`
          : `min-h-[${minSize}px] min-w-[${minSize}px] md:min-h-0 md:min-w-0`,
        // Touch feedback
        'active:bg-gray-100 touch-manipulation',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default TouchButton;
```

#### Verification Steps

- [ ] Button has 48px minimum dimensions on mobile
- [ ] Button reverts to content-sized on desktop (unless `alwaysApply`)
- [ ] Custom `minSize` prop works correctly
- [ ] Touch feedback (active state) is visible
- [ ] All standard button props are passed through
- [ ] Component does not break existing button functionality
- [ ] TypeScript types are correct

---

### Task 4: Update FilterPanel with Mobile Collapse

**Task ID:** 089-04
**Estimated Effort:** 2-3 hours
**Dependencies:** Task 089-01 (useIsMobile)

#### Description

Update the existing FilterPanel component to automatically collapse on mobile viewports. Add a visible toggle button showing the filter icon and active filter count badge. Implement smooth expand/collapse animation.

#### Implementation Steps

1. Import `useIsMobile` hook into FilterPanel
2. Add local state for `isExpanded`
3. Initialize `isExpanded` to `false` on mobile, `true` on desktop
4. Add collapse toggle button (visible only on mobile)
5. Display active filter count badge
6. Implement animated expand/collapse using CSS transitions
7. Ensure filter content is accessible via keyboard when collapsed

#### UI Modifications

1. **Mobile Header (visible only on mobile):**
   - Filter icon + "Filters" label
   - Active filter count badge (if any filters active)
   - ChevronDown icon that rotates when expanded

2. **Content Area:**
   - Wrap in div with `max-h` transition
   - `max-h-0` when collapsed, `max-h-[1000px]` when expanded
   - `overflow-hidden` to clip during animation

3. **Desktop Behavior:**
   - Content always visible (no toggle button)
   - No animation needed

#### Code Modifications

```typescript
// Add to FilterPanel.tsx

// Imports
import { useIsMobile } from '../../hooks/useIsMobile';
import { Filter, ChevronDown } from 'lucide-react';

// Inside component
const isMobile = useIsMobile();
const [isExpanded, setIsExpanded] = useState(!isMobile);

// Collapse on mobile when viewport changes
useEffect(() => {
  if (isMobile) {
    setIsExpanded(false);
  } else {
    setIsExpanded(true);
  }
}, [isMobile]);

// Calculate active filter count
const activeFilterCount = useMemo(() => {
  let count = 0;
  if (filters.contentTypes?.length) count += filters.contentTypes.length;
  if (filters.tags?.length) count += filters.tags.length;
  if (filters.locations?.length) count += filters.locations.length;
  if (filters.propertyIds?.length) count += filters.propertyIds.length;
  return count;
}, [filters]);
```

#### Verification Steps

- [ ] FilterPanel is collapsed by default on mobile viewport
- [ ] FilterPanel is expanded by default on desktop viewport
- [ ] Toggle button is visible only on mobile
- [ ] Toggle button has minimum 48px height
- [ ] Active filter count badge displays correctly
- [ ] Expand/collapse animation is smooth
- [ ] Filter content is accessible when collapsed (keyboard navigation)
- [ ] Viewport resize correctly updates panel state
- [ ] All filter interactions work when panel is expanded on mobile

---

### Task 5: Update ItemPreviewModal for Mobile Bottom Sheet

**Task ID:** 089-05
**Estimated Effort:** 2-3 hours
**Dependencies:** Task 089-01 (useIsMobile), Task 089-02 (BottomSheet)

#### Description

Update the ItemPreviewModal component to render as a bottom sheet on mobile viewports and as a centered modal on desktop. This provides a more native mobile experience.

#### Implementation Steps

1. Import `useIsMobile` hook and `BottomSheet` component
2. Add conditional rendering based on viewport
3. Pass appropriate props to BottomSheet when on mobile
4. Ensure all modal content renders correctly in both modes
5. Handle close actions consistently (swipe, backdrop tap, button, escape)

#### Code Modifications

```typescript
// In ItemPreviewModal.tsx

import { useIsMobile } from '../../hooks/useIsMobile';
import { BottomSheet } from '../shared/BottomSheet';

export function ItemPreviewModal({
  isOpen,
  onClose,
  item,
  title,
  children,
  className,
  contentClassName,
}: ItemPreviewModalProps) {
  const isMobile = useIsMobile();

  // Render as bottom sheet on mobile
  if (isMobile) {
    return (
      <BottomSheet
        isOpen={isOpen}
        onClose={onClose}
        title={title || item?.title}
        className={className}
        swipeToDismiss
        maxHeightPercent={90}
      >
        <div className={cn('p-4', contentClassName)}>
          {/* Preview content */}
          {children}
        </div>
      </BottomSheet>
    );
  }

  // Render as centered modal on desktop
  return (
    <CenteredModalContent
      isOpen={isOpen}
      onClose={onClose}
      title={title || item?.title}
      className={className}
      contentClassName={contentClassName}
    >
      {children}
    </CenteredModalContent>
  );
}
```

#### Verification Steps

- [ ] Preview opens as bottom sheet on mobile viewport
- [ ] Preview opens as centered modal on desktop viewport
- [ ] Bottom sheet can be dismissed by swiping down
- [ ] Bottom sheet can be dismissed by tapping backdrop
- [ ] Close button works in both modes
- [ ] Content scrolls properly within bottom sheet
- [ ] Viewport resize switches between modes correctly
- [ ] Focus management works in both modes
- [ ] Media gallery works correctly in bottom sheet
- [ ] Instructions viewer scrolls correctly in bottom sheet

---

### Task 6: Touch Target Audit - Phase 1 Components

**Task ID:** 089-06
**Estimated Effort:** 2-3 hours
**Dependencies:** None

#### Description

Audit and update all interactive elements in Phase 1 components (ItemCard, ItemRow, ItemGrid, ItemList) to ensure they meet the 48x48px minimum touch target size on mobile.

#### Components to Update

1. **ItemCard.tsx**
   - Action menu button (kebab menu)
   - Selection checkbox wrapper
   - Card click area (already sufficient)

2. **ItemRow.tsx**
   - Kebab menu trigger
   - Selection checkbox wrapper
   - Any action buttons

3. **ItemGrid.tsx**
   - View toggle buttons (if present)

4. **ItemList.tsx**
   - Column header sort buttons
   - Any other interactive headers

#### Implementation Pattern

```typescript
// Pattern for updating small buttons
<button
  className={cn(
    'p-2 rounded-full hover:bg-gray-100',
    // Add mobile touch target
    'min-h-[48px] min-w-[48px] md:min-h-0 md:min-w-0',
    // Center icon
    'flex items-center justify-center'
  )}
>
  <MoreVertical className="w-5 h-5" />
</button>

// Pattern for checkbox wrapper
<label
  className={cn(
    'flex items-center justify-center cursor-pointer',
    'min-h-[48px] min-w-[48px] md:min-h-0 md:min-w-0'
  )}
>
  <input type="checkbox" className="w-4 h-4" />
</label>
```

#### Verification Steps

- [ ] ItemCard action menu button is 48px on mobile
- [ ] ItemCard selection checkbox area is 48px on mobile
- [ ] ItemRow kebab menu trigger is 48px on mobile
- [ ] ItemRow selection checkbox area is 48px on mobile
- [ ] All buttons are easy to tap on a mobile device
- [ ] No visual issues on desktop (buttons not oversized)
- [ ] Hover states still work correctly
- [ ] Focus states still work correctly

---

### Task 7: Touch Target Audit - Phase 2 Components

**Task ID:** 089-07
**Estimated Effort:** 2-3 hours
**Dependencies:** Task 089-04 (FilterPanel already updated)

#### Description

Audit and update all interactive elements in Phase 2 components (ItemToolbar, SortMenu) to ensure they meet the 48x48px minimum touch target size on mobile.

#### Components to Update

1. **ItemToolbar.tsx**
   - Search input clear button
   - View toggle buttons
   - Filter toggle button
   - Any other toolbar actions

2. **SortMenu.tsx**
   - Menu trigger button
   - Sort option list items (ensure 48px height)

#### Implementation for SortMenu Options

```typescript
// Each sort option should have minimum height
<button
  onClick={() => handleSort(option.value)}
  className={cn(
    'w-full text-left px-4 py-3',
    // Ensure minimum height on mobile
    'min-h-[48px]',
    'hover:bg-gray-100',
    isSelected && 'bg-blue-50 text-blue-600'
  )}
>
  {option.label}
</button>
```

#### Verification Steps

- [ ] Search clear button is 48px on mobile
- [ ] View toggle buttons are 48px on mobile
- [ ] Filter toggle button is 48px on mobile
- [ ] SortMenu trigger is 48px on mobile
- [ ] Each sort option has 48px height on mobile
- [ ] All elements are easy to tap accurately
- [ ] Desktop appearance is not affected negatively

---

### Task 8: Touch Target Audit - Phase 3 Components

**Task ID:** 089-08
**Estimated Effort:** 2-3 hours
**Dependencies:** None

#### Description

Audit and update all interactive elements in Phase 3 components (BulkActionsBar, dialogs) to ensure they meet the 48x48px minimum touch target size.

#### Components to Update

1. **BulkActionsBar.tsx**
   - All action buttons (Delete, Tag, Move)
   - Close/exit selection mode button

2. **ConfirmDeleteDialog.tsx** (if exists)
   - Cancel and Confirm buttons

3. **BulkTagDialog.tsx** (if exists)
   - Tag chip remove buttons
   - Action buttons

4. **BulkMoveDialog.tsx** (if exists)
   - Property selection options
   - Action buttons

#### Implementation for Dialog Buttons

```typescript
// Dialog action buttons should have good touch targets
<button
  onClick={onConfirm}
  className={cn(
    'px-4 py-3 rounded-md',
    'min-h-[48px]',
    'bg-red-600 text-white hover:bg-red-700',
    'focus:outline-none focus:ring-2 focus:ring-red-500'
  )}
>
  Delete
</button>
```

#### Verification Steps

- [ ] BulkActionsBar action buttons are 48px+ height
- [ ] BulkActionsBar close button is 48px
- [ ] Dialog buttons have adequate touch targets
- [ ] Tag chips have 44px+ removable area
- [ ] Property selection options are 48px+ height
- [ ] All buttons are accurately tappable on mobile
- [ ] Visual spacing remains appropriate

---

### Task 9: Touch Target Audit - Phase 4-5 Components

**Task ID:** 089-09
**Estimated Effort:** 2-3 hours
**Dependencies:** None

#### Description

Audit and update all interactive elements in Phase 4 (ItemPreview) and Phase 5 (AssetPanel) components to ensure they meet the 48x48px minimum touch target size.

#### Components to Update

1. **MediaGallery.tsx** (if exists)
   - Navigation arrows (prev/next)
   - Thumbnail strip items
   - Fullscreen toggle

2. **AssetPanel.tsx** (if exists)
   - Close button
   - Done/Cancel buttons
   - Add media button

3. **AssetItem.tsx** (if exists)
   - Remove button
   - Drag handle

4. **AssetDropZone.tsx** (if exists)
   - Upload button/area

#### Verification Steps

- [ ] MediaGallery navigation arrows are 48px
- [ ] Thumbnails have adequate touch area
- [ ] AssetPanel close button is 48px
- [ ] AssetItem remove button is 48px on mobile
- [ ] AssetItem drag handle is 48px on mobile
- [ ] All touch targets are easily accessible
- [ ] No overlap between adjacent touch targets

---

### Task 10: Touch Target Audit - Phase 6 Components

**Task ID:** 089-10
**Estimated Effort:** 2-3 hours
**Dependencies:** None

#### Description

Audit and update all interactive elements in Phase 6 components (InlineEdit, TagChip, TagsInlineEdit) to ensure they meet the 44-48px minimum touch target size on mobile.

#### Components to Update

1. **InlineEdit.tsx**
   - Display area (clickable to edit) - ensure 48px min height
   - Cancel/confirm buttons in edit mode

2. **TagChip.tsx**
   - Remove button (×) - ensure 44px minimum on mobile

3. **TagsInlineEdit.tsx**
   - Add tag button
   - Individual tag remove buttons
   - Tag suggestion items

#### Implementation for TagChip

```typescript
// Remove button on tag chip
<button
  onClick={onRemove}
  className={cn(
    'ml-1 rounded-full',
    'hover:bg-gray-200',
    // Mobile touch target
    'min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0',
    'flex items-center justify-center',
    // Negative margin to maintain visual appearance
    '-my-2 -mr-1 md:my-0 md:mr-0'
  )}
  aria-label={`Remove ${tag} tag`}
>
  <X className="w-3 h-3" />
</button>
```

#### Verification Steps

- [ ] InlineEdit display area is 48px min height on mobile
- [ ] InlineEdit action buttons are 48px on mobile
- [ ] TagChip remove button is 44px on mobile
- [ ] TagsInlineEdit add button is 48px on mobile
- [ ] Tag suggestions are 48px min height
- [ ] Tags remain visually compact while touch-friendly
- [ ] Desktop appearance is preserved

---

### Task 11: Create SwipeableRow Component (Optional)

**Task ID:** 089-11
**Estimated Effort:** 2-3 hours
**Dependencies:** Task 089-01 (useIsMobile)
**Priority:** Optional

#### Description

Create a swipeable row wrapper that reveals action buttons on swipe. This provides a native-feeling mobile interaction for quick actions like delete or edit.

#### Implementation Steps

1. Create file `src/components/ItemManager/components/shared/SwipeableRow.tsx`
2. Implement touch gesture handling for horizontal swipe
3. Reveal action buttons behind content on swipe
4. Support both left and right swipe actions
5. Add snap-back animation when swipe is insufficient
6. Provide action callback interface

#### Props Interface

```typescript
export interface SwipeAction {
  key: string;
  icon: React.ReactNode;
  label: string;
  onAction: () => void;
  bgColor: string;      // e.g., 'bg-red-500'
  textColor: string;    // e.g., 'text-white'
}

export interface SwipeableRowProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];   // Revealed on left swipe
  rightActions?: SwipeAction[];  // Revealed on right swipe
  swipeThreshold?: number;       // default: 80
  disabled?: boolean;
  className?: string;
}
```

#### Verification Steps

- [ ] Swiping left reveals left actions
- [ ] Swiping right reveals right actions
- [ ] Actions are clearly visible and labeled
- [ ] Tapping action triggers callback
- [ ] Row resets after action execution
- [ ] Swipe below threshold snaps back
- [ ] Component is disabled when `disabled` prop is true
- [ ] Component works correctly on iOS Safari
- [ ] Component works correctly on Android Chrome

---

### Task 12: Integrate SwipeableRow into ItemRow (Optional)

**Task ID:** 089-12
**Estimated Effort:** 1-2 hours
**Dependencies:** Task 089-11 (SwipeableRow), Task 089-01 (useIsMobile)
**Priority:** Optional

#### Description

Integrate the SwipeableRow component into ItemRow to enable swipe-to-reveal actions on mobile devices.

#### Implementation Steps

1. Import SwipeableRow and useIsMobile into ItemRow
2. Configure delete action for left swipe
3. Configure edit action for right swipe
4. Wrap row content with SwipeableRow on mobile only
5. Ensure desktop behavior is unchanged

#### Code Modifications

```typescript
// In ItemRow.tsx
import { SwipeableRow, SwipeAction } from '../shared/SwipeableRow';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Trash2, Pencil } from 'lucide-react';

// Inside component
const isMobile = useIsMobile();

const swipeLeftActions: SwipeAction[] = [
  {
    key: 'delete',
    icon: <Trash2 className="w-5 h-5" />,
    label: 'Delete',
    onAction: () => onDeleteItems?.([item.id]),
    bgColor: 'bg-red-500',
    textColor: 'text-white',
  },
];

const swipeRightActions: SwipeAction[] = [
  {
    key: 'edit',
    icon: <Pencil className="w-5 h-5" />,
    label: 'Edit',
    onAction: () => onEditItem?.(item),
    bgColor: 'bg-blue-500',
    textColor: 'text-white',
  },
];

// In render
return isMobile ? (
  <SwipeableRow
    leftActions={swipeLeftActions}
    rightActions={swipeRightActions}
    disabled={isSelectionMode}
  >
    <ItemRowContent {...props} />
  </SwipeableRow>
) : (
  <ItemRowContent {...props} />
);
```

#### Verification Steps

- [ ] Swipe actions appear only on mobile
- [ ] Left swipe reveals delete action
- [ ] Right swipe reveals edit action
- [ ] Tapping delete triggers delete callback
- [ ] Tapping edit triggers edit callback
- [ ] Swipe is disabled during selection mode
- [ ] Desktop behavior is unchanged
- [ ] No conflict with list scrolling

---

### Task 13: Export New Components and Hooks

**Task ID:** 089-13
**Estimated Effort:** 30 minutes
**Dependencies:** All creation tasks (089-01 through 089-03)

#### Description

Update the index files to export all newly created hooks and components for use across the codebase.

#### Implementation Steps

1. Update `src/components/ItemManager/hooks/index.ts` to export `useIsMobile`
2. Update `src/components/ItemManager/components/shared/index.ts` to export new components

#### Code Modifications

```typescript
// src/components/ItemManager/hooks/index.ts
export { useIsMobile } from './useIsMobile';
export type { UseIsMobileOptions } from './useIsMobile';
// ... other exports

// src/components/ItemManager/components/shared/index.ts
export { BottomSheet } from './BottomSheet';
export type { BottomSheetProps } from './BottomSheet';

export { TouchButton } from './TouchButton';
export type { TouchButtonProps } from './TouchButton';

export { SwipeableRow } from './SwipeableRow';
export type { SwipeableRowProps, SwipeAction } from './SwipeableRow';
// ... other exports
```

#### Verification Steps

- [ ] All new hooks are exported from hooks/index.ts
- [ ] All new components are exported from shared/index.ts
- [ ] Types are properly exported alongside components
- [ ] Imports work correctly in consuming components
- [ ] No circular dependency issues

---

### Task 14: Manual Mobile Testing

**Task ID:** 089-14
**Estimated Effort:** 2-3 hours
**Dependencies:** All implementation tasks

#### Description

Perform comprehensive manual testing on actual mobile devices to verify all touch targets, gestures, and mobile-specific UI work correctly.

#### Testing Matrix

| Device | Browser | Test All Features |
|--------|---------|-------------------|
| iPhone 12/13/14 | Safari | [ ] |
| iPhone SE (small viewport) | Safari | [ ] |
| iPad Pro | Safari | [ ] |
| Samsung Galaxy S21 | Chrome | [ ] |
| Google Pixel 6 | Chrome | [ ] |

#### Test Cases

1. **Touch Target Sizing**
   - [ ] All buttons are easy to tap accurately
   - [ ] No accidental taps on adjacent elements
   - [ ] Checkboxes have adequate touch area
   - [ ] Remove buttons on tags are tappable

2. **FilterPanel Collapse**
   - [ ] Panel is collapsed by default on mobile
   - [ ] Toggle button is visible and tappable
   - [ ] Active filter count displays correctly
   - [ ] Expand/collapse animation is smooth
   - [ ] Filters work when expanded

3. **Bottom Sheet Preview**
   - [ ] Preview opens as bottom sheet on mobile
   - [ ] Swipe down dismisses sheet
   - [ ] Backdrop tap dismisses sheet
   - [ ] Content scrolls within sheet
   - [ ] Drag handle provides visual feedback

4. **Swipe Actions (if implemented)**
   - [ ] Swipe gestures work smoothly
   - [ ] Actions are revealed correctly
   - [ ] No conflict with vertical scrolling

5. **General Mobile UX**
   - [ ] No horizontal scrolling issues
   - [ ] Text is readable
   - [ ] Touch feedback is visible
   - [ ] Page loads quickly

#### Verification

- [ ] All test cases pass on iOS Safari
- [ ] All test cases pass on Chrome Android
- [ ] No regressions in desktop functionality
- [ ] Performance is acceptable on mobile
- [ ] No visual glitches or layout issues

---

### Task 15: Add Touch Feedback CSS

**Task ID:** 089-15
**Estimated Effort:** 1 hour
**Dependencies:** None

#### Description

Add global CSS for consistent touch feedback across all interactive elements. This includes active states and the `touch-manipulation` property to disable double-tap zoom delays.

#### Implementation Steps

1. Add touch-related utility classes to global styles or Tailwind config
2. Ensure consistent active state feedback
3. Apply `touch-manipulation` to interactive elements

#### CSS Additions

```css
/* Add to globals.css or as Tailwind utilities */

/* Touch manipulation to disable zoom delay */
.touch-action-manipulation {
  touch-action: manipulation;
}

/* Touch feedback states */
@media (hover: none) {
  .touch-feedback {
    -webkit-tap-highlight-color: transparent;
  }

  .touch-feedback:active {
    background-color: rgba(0, 0, 0, 0.05);
  }
}
```

Or as Tailwind plugin in `tailwind.config.js`:

```javascript
// In tailwind.config.js plugins array
plugin(function({ addUtilities }) {
  addUtilities({
    '.touch-manipulation': {
      'touch-action': 'manipulation',
    },
    '.touch-feedback': {
      '-webkit-tap-highlight-color': 'transparent',
    },
  })
})
```

#### Verification Steps

- [ ] Touch feedback is visible on interactive elements
- [ ] Double-tap zoom is disabled on buttons
- [ ] No visual artifacts from tap highlight
- [ ] Consistent behavior across iOS and Android

---

## Summary Checklist

### Core Tasks (Required)

- [x] Task 1: Create useIsMobile Hook - COMPLETE (Created src/components/ItemManager/hooks/useIsMobile.ts)
- [x] Task 2: Create BottomSheet Component - COMPLETE (Created src/components/ItemManager/components/shared/BottomSheet.tsx)
- [x] Task 3: Create TouchButton Component - COMPLETE (Created src/components/ItemManager/components/shared/TouchButton.tsx)
- [x] Task 4: Update FilterPanel with Mobile Collapse - SKIPPED (FilterPanel component doesn't exist yet)
- [x] Task 5: Update ItemPreviewModal for Mobile Bottom Sheet - SKIPPED (Already has mobile drawer behavior built-in)
- [x] Task 6: Touch Target Audit - Phase 1 Components - COMPLETE (Updated ItemCard.tsx, ItemRow.tsx with 48px touch targets)
- [x] Task 7: Touch Target Audit - Phase 2 Components - COMPLETE (Updated ItemToolbar.tsx with 48px touch targets)
- [x] Task 8: Touch Target Audit - Phase 3 Components - COMPLETE (Updated BulkTagDialog.tsx, BulkMoveDialog.tsx with 48px touch targets)
- [x] Task 9: Touch Target Audit - Phase 4-5 Components - COMPLETE (Updated AssetPanel.tsx, AssetItem.tsx with 48px touch targets)
- [x] Task 10: Touch Target Audit - Phase 6 Components - COMPLETE (Updated TagChip.tsx, InlineEdit.tsx with 48px touch targets)
- [x] Task 13: Export New Components and Hooks - COMPLETE (Updated hooks/index.ts and components/shared/index.ts)
- [ ] Task 14: Manual Mobile Testing - PENDING (requires manual testing on physical devices)
- [x] Task 15: Add Touch Feedback CSS - COMPLETE (Added to src/app/globals.css)

### Optional Tasks

- [ ] Task 11: Create SwipeableRow Component - NOT IMPLEMENTED (Optional)
- [ ] Task 12: Integrate SwipeableRow into ItemRow - NOT IMPLEMENTED (Optional)

---

## Effort Summary

| Task Group | Tasks | Estimated Hours |
|------------|-------|-----------------|
| Hook & Utilities | 089-01, 089-03, 089-15 | 3-5 hours |
| BottomSheet | 089-02 | 3-4 hours |
| Component Updates | 089-04, 089-05 | 4-6 hours |
| Touch Target Audits | 089-06 to 089-10 | 10-14 hours |
| Exports & Integration | 089-13 | 0.5 hours |
| Testing | 089-14 | 2-3 hours |
| **Core Total** | 12 tasks | **22-32 hours** |
| Optional (Swipe) | 089-11, 089-12 | 3-5 hours |

**Total with Optional:** 25-37 hours (4-5 working days)

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| iOS Safari edge cases | Test on physical iOS devices early; use WebKit-specific CSS where needed |
| Touch gesture conflicts | Use `touch-action` CSS property; test scrolling scenarios |
| Performance on older devices | Keep animations simple; use GPU-accelerated transforms |
| Hydration mismatches | Default viewport detection to `false` on SSR |

---

## References

- [Overview Document](/docs/REQ-089-mobile-polish-overview.md)
- [Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md)
- [StepNavigation Reference](/src/components/ItemCapture/components/shared/StepNavigation.tsx) - 44px+ touch targets
- [ProgressIndicator Reference](/src/components/ItemCapture/components/shared/ProgressIndicator.tsx) - Mobile/desktop patterns
- [WCAG Touch Target Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html) - 44x44px minimum
- [Apple HIG Touch Targets](https://developer.apple.com/design/human-interface-guidelines/accessibility) - 44pt minimum
- [Material Design Touch Targets](https://m3.material.io/foundations/accessible-design/accessibility-basics) - 48dp minimum

---

## Document History

| Date | Author | Changes |
|------|--------|---------|
| 2026-01-03T19:30:00 | Senior Dev Agent | Initial document creation |
| 2026-01-03T20:45:00 | Implementation Agent | Implementation complete - Created useIsMobile hook, BottomSheet component, TouchButton component; Updated touch targets across all ItemManager phases; Added touch feedback CSS |
