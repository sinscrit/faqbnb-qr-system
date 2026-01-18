# REQ-089: Mobile UX Polish and Touch Optimization - Implementation Overview

**Document Created:** 2026-01-03T17:45:00
**Last Modified:** 2026-01-03T17:45:00
**Request Reference:** `/docs/gen_requests.md` - REQ-089
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 6 - Inline Edit & Polish
**Task ID:** 6.4
**Status:** PENDING

---

## Overview

This document provides the technical implementation breakdown for mobile UX polish and touch optimization across the ItemManager component. This task ensures all interactive elements meet minimum touch target sizes, implements responsive filter panel collapsing, transforms the preview modal to a bottom sheet on mobile, and optionally adds swipe gesture support.

### Purpose

Property managers and staff frequently use the application on mobile devices while physically inspecting or managing items. This polish pass ensures the ItemManager provides a native-feeling mobile experience with reliable touch interactions, efficient screen space usage, and gesture support where appropriate.

### Key Deliverables

1. Audit and update all touch targets to minimum 48x48px on mobile viewports
2. Implement automatic filter panel collapse on mobile screens
3. Transform ItemPreviewModal to bottom sheet on mobile devices
4. Add optional swipe gestures for navigation/quick actions
5. Ensure proper touch and haptic feedback where supported

### Context Within ItemManager

As per the implementation plan, this is Task 6.4 in Phase 6:

```
6.1 InlineEdit Component (REQ-086) - COMPLETE
         │
         ▼
6.2 Title/Location Inline Edit (REQ-087) - COMPLETE
         │
         ▼
6.3 Tags Inline Edit (REQ-088) - COMPLETE
         │
         ▼
6.4 Mobile Polish (THIS TASK)
         │
         ▼
6.5 Accessibility Audit
         │
         ▼
6.6 Test Harness & Documentation
```

---

## Dependencies

### Hard Dependencies

| Dependency | Source | Status |
|------------|--------|--------|
| InlineEdit component | REQ-086 / Task 6.1 | Must be complete |
| Title/Location inline edit | REQ-087 / Task 6.2 | Must be complete |
| Tags inline edit | REQ-088 / Task 6.3 | Must be complete |
| ItemPreviewModal component | REQ-074 / Task 4.1 | Must be complete |
| FilterPanel component | REQ-065 / Task 2.4 | Must be complete |
| All Phase 1-5 components | Various | Must be complete |

### Technical Dependencies

| Dependency | Source | Purpose |
|------------|--------|---------|
| cn() utility | `src/lib/utils.ts` | Class name merging with Tailwind |
| Tailwind breakpoints | `tailwind.config.js` | Responsive design (sm: 640px, md: 768px) |
| Lucide React | `lucide-react` | Icons (ChevronDown, X, Filter) |
| React hooks | react | useState, useEffect, useRef, useCallback |
| CSS media queries | globals.css | Viewport-based styling |

---

## Component Architecture

### 1. Touch Target Utility Hook

Create a reusable hook for touch-target-aware sizing:

```typescript
// File: src/components/ItemManager/hooks/useTouchTarget.ts

export interface TouchTargetOptions {
  /** Minimum size in pixels (default: 48) */
  minSize?: number;
  /** Apply only on mobile viewports (default: true) */
  mobileOnly?: boolean;
}

export function useTouchTarget(options: TouchTargetOptions = {}) {
  const { minSize = 48, mobileOnly = true } = options;

  // Computed classes for touch target sizing
  const touchTargetClass = mobileOnly
    ? `min-w-[${minSize}px] min-h-[${minSize}px] md:min-w-0 md:min-h-0`
    : `min-w-[${minSize}px] min-h-[${minSize}px]`;

  return {
    touchTargetClass,
    minSize,
  };
}
```

### 2. Mobile-Responsive FilterPanel

Update FilterPanel to collapse automatically on mobile:

```typescript
// File: src/components/ItemManager/components/dialogs/FilterPanel.tsx

export interface FilterPanelProps {
  // ... existing props ...

  /** Force panel to be expanded (overrides mobile auto-collapse) */
  forceExpanded?: boolean;

  /** Callback when panel expansion state changes */
  onExpandedChange?: (expanded: boolean) => void;
}

// Mobile behavior
const [isExpanded, setIsExpanded] = useState(false);
const isMobile = useIsMobile(); // viewport < 768px

// Auto-collapse on mobile
useEffect(() => {
  if (isMobile && !forceExpanded) {
    setIsExpanded(false);
  }
}, [isMobile, forceExpanded]);
```

### 3. Bottom Sheet for ItemPreviewModal

Transform modal to bottom sheet on mobile viewports:

```typescript
// File: src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx

// Mobile bottom sheet behavior
const isMobile = useIsMobile();

// Different rendering based on viewport
{isMobile ? (
  <BottomSheet
    isOpen={isOpen}
    onClose={onClose}
    onSwipeDown={onClose}
  >
    {children}
  </BottomSheet>
) : (
  <CenteredModal
    isOpen={isOpen}
    onClose={onClose}
  >
    {children}
  </CenteredModal>
)}
```

### 4. Viewport Detection Hook

```typescript
// File: src/components/ItemManager/hooks/useIsMobile.ts

export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Initial check
    checkMobile();

    // Listen for resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
}
```

---

## Implementation Details

### 1. Touch Target Sizing (48x48px Minimum)

#### Components Requiring Updates

| Component | Current State | Required Changes |
|-----------|---------------|------------------|
| ItemCard action buttons | Small icons | Add `min-w-[48px] min-h-[48px]` on mobile |
| ItemRow kebab menu | Small icon | Add touch padding on mobile |
| TagChip remove button | 20x20px | Expand to 44x44px minimum on mobile |
| FilterPanel checkboxes | Standard size | Add touch padding wrapper |
| SortMenu options | Standard height | Ensure 48px minimum height |
| InlineEdit display target | Variable | Ensure minimum height on mobile |
| BulkActionsBar buttons | Standard buttons | Verify 48px+ height |
| ItemPreviewModal close button | Small icon | Add touch-friendly sizing |
| AssetPanel action buttons | Small icons | Add touch padding |
| Navigation buttons | Variable | Ensure 48px+ height |

#### Implementation Pattern

```typescript
// Touch-friendly button wrapper component
export function TouchButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        // Base button styles
        'inline-flex items-center justify-center',
        // Touch target sizing for mobile
        'min-h-[48px] min-w-[48px]',
        // Reset on desktop if needed
        'md:min-h-0 md:min-w-0',
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
```

#### Tailwind Classes for Touch Targets

```css
/* Apply to interactive elements */
.touch-target {
  @apply min-h-[48px] min-w-[48px];
  @apply flex items-center justify-center;
  @apply touch-manipulation;
}

/* Mobile-only touch target */
.touch-target-mobile {
  @apply min-h-[48px] min-w-[48px] md:min-h-0 md:min-w-0;
}
```

### 2. Filter Panel Collapse on Mobile

#### Collapsible Panel UI

```typescript
// File: src/components/ItemManager/components/dialogs/FilterPanel.tsx

export function FilterPanel({
  filters,
  onFilterChange,
  availableTags,
  availableLocations,
  availableProperties,
  multiPropertyMode,
  className,
}: FilterPanelProps) {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(!isMobile);

  // Collapse by default on mobile
  useEffect(() => {
    if (isMobile) {
      setIsExpanded(false);
    }
  }, [isMobile]);

  // Count active filters for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.contentTypes?.length) count += filters.contentTypes.length;
    if (filters.tags?.length) count += filters.tags.length;
    if (filters.locations?.length) count += filters.locations.length;
    if (filters.propertyIds?.length) count += filters.propertyIds.length;
    return count;
  }, [filters]);

  return (
    <div className={cn('border rounded-lg bg-white', className)}>
      {/* Collapsible header - always visible on mobile */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center justify-between p-4',
          'min-h-[48px]', // Touch target
          'md:hidden', // Only show toggle on mobile
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset'
        )}
        aria-expanded={isExpanded}
        aria-controls="filter-panel-content"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-gray-500 transition-transform duration-200',
            isExpanded && 'rotate-180'
          )}
        />
      </button>

      {/* Filter content - always visible on desktop, collapsible on mobile */}
      <div
        id="filter-panel-content"
        className={cn(
          'overflow-hidden transition-all duration-300',
          isMobile && !isExpanded ? 'max-h-0' : 'max-h-[1000px]',
          'md:max-h-none md:overflow-visible'
        )}
      >
        <div className="p-4 space-y-4">
          {/* Filter sections */}
          {/* Content type filters */}
          {/* Tag filters */}
          {/* Location filters */}
          {/* Property filters (if multiPropertyMode) */}
        </div>
      </div>
    </div>
  );
}
```

### 3. Bottom Sheet for Preview Modal

#### Bottom Sheet Component

```typescript
// File: src/components/ItemManager/components/shared/BottomSheet.tsx

'use client';

/**
 * BottomSheet Component
 *
 * A mobile-optimized slide-up sheet that appears from the bottom of the viewport.
 * Features swipe-to-dismiss gesture and backdrop tap-to-close.
 *
 * @module ItemManager/components/shared/BottomSheet
 * @lastModified 2026-01-03 (REQ-089)
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BottomSheetProps {
  /** Whether the sheet is open */
  isOpen: boolean;

  /** Callback when sheet should close */
  onClose: () => void;

  /** Content to render inside the sheet */
  children: React.ReactNode;

  /** Optional title for the sheet header */
  title?: string;

  /** Optional CSS class for the sheet container */
  className?: string;

  /** Whether to show the drag handle (default: true) */
  showDragHandle?: boolean;

  /** Whether swipe-to-dismiss is enabled (default: true) */
  swipeToDismiss?: boolean;

  /** Minimum swipe distance to trigger dismiss (default: 100) */
  swipeThreshold?: number;

  /** Maximum height as percentage of viewport (default: 90) */
  maxHeightPercent?: number;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  className,
  showDragHandle = true,
  swipeToDismiss = true,
  swipeThreshold = 100,
  maxHeightPercent = 90,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);

  // Handle touch start
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!swipeToDismiss) return;
    startY.current = e.touches[0].clientY;
    setIsDragging(true);
  }, [swipeToDismiss]);

  // Handle touch move
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    // Only allow downward swipe
    if (diff > 0) {
      setDragOffset(diff);
    }
  }, [isDragging]);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragOffset > swipeThreshold) {
      onClose();
    }
    setDragOffset(0);
  }, [isDragging, dragOffset, swipeThreshold, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'bottom-sheet-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black transition-opacity duration-300',
          isOpen ? 'bg-opacity-50' : 'bg-opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet container */}
      <div
        ref={sheetRef}
        className={cn(
          'absolute bottom-0 left-0 right-0',
          'bg-white rounded-t-2xl shadow-2xl',
          'transition-transform duration-300 ease-out',
          isOpen ? 'translate-y-0' : 'translate-y-full',
          className
        )}
        style={{
          maxHeight: `${maxHeightPercent}vh`,
          transform: isDragging ? `translateY(${dragOffset}px)` : undefined,
          transition: isDragging ? 'none' : undefined,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        {showDragHandle && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>
        )}

        {/* Header with title and close button */}
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h2
              id="bottom-sheet-title"
              className="text-lg font-semibold text-gray-900"
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'p-2 rounded-full',
                'min-w-[44px] min-h-[44px]',
                'flex items-center justify-center',
                'text-gray-500 hover:bg-gray-100',
                'focus:outline-none focus:ring-2 focus:ring-blue-500'
              )}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div
          className="overflow-y-auto overscroll-contain"
          style={{ maxHeight: `calc(${maxHeightPercent}vh - 120px)` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default BottomSheet;
```

#### Updating ItemPreviewModal

```typescript
// File: src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx

import { BottomSheet } from '../shared/BottomSheet';
import { useIsMobile } from '../../hooks/useIsMobile';

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

### 4. Swipe Actions (Optional)

#### SwipeableRow Component

```typescript
// File: src/components/ItemManager/components/shared/SwipeableRow.tsx

'use client';

/**
 * SwipeableRow Component
 *
 * Wraps content to enable swipe-to-reveal actions on mobile.
 * Supports left and right swipe actions.
 *
 * @module ItemManager/components/shared/SwipeableRow
 * @lastModified 2026-01-03 (REQ-089)
 */

import React, { useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface SwipeAction {
  /** Unique action key */
  key: string;
  /** Icon to display */
  icon: React.ReactNode;
  /** Action label for accessibility */
  label: string;
  /** Callback when action is triggered */
  onAction: () => void;
  /** Background color class */
  bgColor: string;
  /** Text color class */
  textColor: string;
}

export interface SwipeableRowProps {
  /** Content to render */
  children: React.ReactNode;

  /** Actions revealed on left swipe */
  leftActions?: SwipeAction[];

  /** Actions revealed on right swipe */
  rightActions?: SwipeAction[];

  /** Swipe threshold to reveal actions (default: 80) */
  swipeThreshold?: number;

  /** Whether swipe is disabled */
  disabled?: boolean;

  /** Additional CSS classes */
  className?: string;
}

export function SwipeableRow({
  children,
  leftActions = [],
  rightActions = [],
  swipeThreshold = 80,
  disabled = false,
  className,
}: SwipeableRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  }, [disabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || disabled) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;

    // Limit swipe distance
    const maxSwipe = Math.max(leftActions.length, rightActions.length) * 80;
    const clampedDiff = Math.max(-maxSwipe, Math.min(maxSwipe, diff));

    // Only allow left swipe if leftActions exist, right if rightActions exist
    if (diff < 0 && leftActions.length === 0) return;
    if (diff > 0 && rightActions.length === 0) return;

    setTranslateX(clampedDiff);
  }, [isDragging, disabled, leftActions.length, rightActions.length]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);

    // Snap to action reveal position or reset
    if (Math.abs(translateX) > swipeThreshold) {
      const actionWidth = 80;
      const actionsCount = translateX < 0 ? leftActions.length : rightActions.length;
      setTranslateX(translateX < 0 ? -actionWidth * actionsCount : actionWidth * actionsCount);
    } else {
      setTranslateX(0);
    }
  }, [translateX, swipeThreshold, leftActions.length, rightActions.length]);

  const resetPosition = useCallback(() => {
    setTranslateX(0);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
    >
      {/* Right actions (revealed on left swipe) */}
      {leftActions.length > 0 && (
        <div className="absolute top-0 right-0 h-full flex">
          {leftActions.map((action) => (
            <button
              key={action.key}
              type="button"
              onClick={() => {
                action.onAction();
                resetPosition();
              }}
              className={cn(
                'w-20 h-full flex flex-col items-center justify-center gap-1',
                'min-h-[48px]', // Touch target
                action.bgColor,
                action.textColor
              )}
              aria-label={action.label}
            >
              {action.icon}
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Left actions (revealed on right swipe) */}
      {rightActions.length > 0 && (
        <div className="absolute top-0 left-0 h-full flex">
          {rightActions.map((action) => (
            <button
              key={action.key}
              type="button"
              onClick={() => {
                action.onAction();
                resetPosition();
              }}
              className={cn(
                'w-20 h-full flex flex-col items-center justify-center gap-1',
                'min-h-[48px]', // Touch target
                action.bgColor,
                action.textColor
              )}
              aria-label={action.label}
            >
              {action.icon}
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main content */}
      <div
        className="relative bg-white"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}

export default SwipeableRow;
```

#### Integration into ItemRow

```typescript
// File: src/components/ItemManager/components/ItemRow.tsx

// Wrap row content with SwipeableRow on mobile
const isMobile = useIsMobile();

const swipeLeftActions: SwipeAction[] = [
  {
    key: 'delete',
    icon: <Trash2 className="w-5 h-5" />,
    label: 'Delete',
    onAction: () => onDeleteItems([item.id]),
    bgColor: 'bg-red-500',
    textColor: 'text-white',
  },
];

const swipeRightActions: SwipeAction[] = [
  {
    key: 'edit',
    icon: <Pencil className="w-5 h-5" />,
    label: 'Edit',
    onAction: () => onEditItem(item),
    bgColor: 'bg-blue-500',
    textColor: 'text-white',
  },
];

return isMobile ? (
  <SwipeableRow
    leftActions={swipeLeftActions}
    rightActions={swipeRightActions}
  >
    <ItemRowContent {...props} />
  </SwipeableRow>
) : (
  <ItemRowContent {...props} />
);
```

---

## Authorized Files and Functions for Modification

### New Files to Create

| File | Purpose |
|------|---------|
| `src/components/ItemManager/hooks/useIsMobile.ts` | Viewport detection hook |
| `src/components/ItemManager/components/shared/BottomSheet.tsx` | Mobile bottom sheet component |
| `src/components/ItemManager/components/shared/SwipeableRow.tsx` | Swipe-to-reveal actions wrapper (optional) |
| `src/components/ItemManager/components/shared/TouchButton.tsx` | Touch-friendly button wrapper |

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

### Files to Import From (Read Only)

| File | Imports |
|------|---------|
| `src/lib/utils.ts` | `cn` utility function |
| `lucide-react` | Icons (ChevronDown, X, Filter, Trash2, Pencil) |
| `src/components/ItemCapture/components/shared/StepNavigation.tsx` | Reference for 44px+ touch targets |
| `src/components/ItemCapture/editors/imageCropper.css` | Reference for touch target sizing |

### Files NOT to Modify

- Core ItemCapture components (use patterns as reference only)
- Global utility files beyond documented imports
- Tailwind configuration (use existing breakpoints)
- Files from other phases beyond integration points listed above

---

## Touch Target Audit Checklist

### Phase 1 Components

| Component | Element | Current | Required | Action |
|-----------|---------|---------|----------|--------|
| ItemCard | Action menu button | ~32px | 48px | Add min-w/h classes |
| ItemCard | Selection checkbox | ~16px | 48px | Wrap in touch container |
| ItemRow | Kebab menu | ~32px | 48px | Add min-w/h classes |
| ItemRow | Selection checkbox | ~16px | 48px | Wrap in touch container |
| ItemGrid | View toggle buttons | ~40px | 48px | Verify sizing |
| ItemList | Column headers | Variable | 48px | Ensure sortable headers meet size |

### Phase 2 Components

| Component | Element | Current | Required | Action |
|-----------|---------|---------|----------|--------|
| ItemToolbar | Search clear button | ~24px | 48px | Add touch padding |
| ItemToolbar | View toggle buttons | ~36px | 48px | Add min-w/h classes |
| FilterPanel | Filter checkboxes | ~16px | 48px | Wrap in touch container |
| FilterPanel | Tag chips | ~32px | 48px | Ensure removable area meets size |
| FilterPanel | Dropdown options | ~36px | 48px | Add min-h class |
| SortMenu | Sort options | ~36px | 48px | Add min-h class |
| SortMenu | Menu trigger | ~36px | 48px | Add min-w/h classes |

### Phase 3 Components

| Component | Element | Current | Required | Action |
|-----------|---------|---------|----------|--------|
| BulkActionsBar | Action buttons | ~40px | 48px | Verify sizing |
| BulkActionsBar | Close button | ~32px | 48px | Add min-w/h classes |
| ConfirmDeleteDialog | Buttons | ~40px | 48px | Verify sizing |
| BulkTagDialog | Tag chips | ~32px | 48px | Ensure touch-friendly |
| BulkMoveDialog | Property options | ~36px | 48px | Add min-h class |

### Phase 4 Components

| Component | Element | Current | Required | Action |
|-----------|---------|---------|----------|--------|
| ItemPreviewModal | Close button | ~32px | 48px | Add min-w/h classes |
| MediaGallery | Navigation arrows | ~40px | 48px | Verify sizing |
| MediaGallery | Thumbnail strip | ~48px | 48px | Verify sizing |
| InstructionsViewer | Scroll area | N/A | N/A | Ensure momentum scroll |

### Phase 5 Components

| Component | Element | Current | Required | Action |
|-----------|---------|---------|----------|--------|
| AssetPanel | Close button | ~32px | 48px | Add min-w/h classes |
| AssetPanel | Done/Cancel buttons | ~40px | 48px | Verify sizing |
| AssetItem | Remove button | ~24px | 48px | Add touch padding |
| AssetItem | Drag handle | ~24px | 48px | Add touch padding |
| AssetDropZone | Upload button | ~40px | 48px | Verify sizing |

### Phase 6 Components

| Component | Element | Current | Required | Action |
|-----------|---------|---------|----------|--------|
| InlineEdit | Display area | Variable | 48px | Add min-h on mobile |
| TagsInlineEdit | Add tag button | ~24px | 48px | Add touch padding |
| TagChip | Remove button | ~20px | 44px | Add min-w/h on mobile |

---

## Responsive Breakpoints Strategy

### Tailwind Breakpoint Usage

| Breakpoint | Width | Usage in This Task |
|------------|-------|-------------------|
| `sm` | 640px | N/A |
| `md` | 768px | Mobile/Desktop split point |
| `lg` | 1024px | N/A |

### CSS Media Query Pattern

```typescript
// useIsMobile hook returns true for < 768px
const isMobile = useIsMobile();

// Tailwind class pattern
// Mobile-first: apply mobile styles, override at md:
<button className="min-h-[48px] md:min-h-0">

// Or explicit mobile-only:
<button className={cn(
  isMobile && 'min-h-[48px]'
)}>
```

---

## Accessibility Considerations

### Touch Feedback

```typescript
// Visual feedback for touch interactions
<button
  className={cn(
    'transition-colors',
    'active:bg-gray-100', // Immediate feedback
    'touch-manipulation', // Disable double-tap zoom delay
  )}
>
```

### Focus Indicators

Ensure focus indicators remain visible on mobile:

```typescript
<button
  className={cn(
    'focus:outline-none',
    'focus:ring-2 focus:ring-blue-500',
    'focus-visible:ring-2 focus-visible:ring-blue-500',
  )}
>
```

### Screen Reader Support

- All touch-revealed actions must have accessible alternatives
- Swipe actions should be announced
- Bottom sheet state changes should be announced

---

## Testing Considerations

### Manual Testing Checklist

#### Touch Target Sizing
- [ ] All buttons meet 48x48px minimum on iOS Safari
- [ ] All buttons meet 48x48px minimum on Chrome Android
- [ ] All checkboxes have adequate touch area
- [ ] All dropdown options have adequate height
- [ ] Remove buttons on chips are easy to tap
- [ ] Inline edit areas are easy to activate

#### Filter Panel Collapse
- [ ] FilterPanel collapses by default on mobile viewport
- [ ] Expand/collapse toggle is visible and tappable
- [ ] Active filter count badge displays correctly
- [ ] Filter content remains accessible when collapsed
- [ ] Panel transitions smoothly
- [ ] Panel state persists during session

#### Bottom Sheet Preview
- [ ] Preview opens as bottom sheet on mobile
- [ ] Bottom sheet can be dismissed by swiping down
- [ ] Bottom sheet can be dismissed by tapping backdrop
- [ ] Drag handle is visible and provides feedback
- [ ] Content scrolls properly within sheet
- [ ] Escape key closes sheet
- [ ] Focus is trapped within sheet

#### Swipe Actions (if implemented)
- [ ] Swipe left reveals delete action
- [ ] Swipe right reveals edit action
- [ ] Actions are clearly labeled
- [ ] Swipe threshold feels natural
- [ ] Actions can be triggered by tap after reveal
- [ ] Row resets after action execution

#### Cross-Device Testing
- [ ] iPhone 12/13/14 Pro (iOS Safari)
- [ ] iPhone SE (smaller viewport)
- [ ] iPad Pro (tablet viewport)
- [ ] Samsung Galaxy S21 (Chrome Android)
- [ ] Google Pixel 6 (Chrome Android)

### Automated Test Cases

1. **Viewport Detection**
   - Verify useIsMobile returns correct value for various widths
   - Verify component re-renders on resize

2. **Touch Target Compliance**
   - Verify all interactive elements have min 48x48 computed size on mobile viewport

3. **Bottom Sheet Behavior**
   - Verify open/close states
   - Verify swipe gesture thresholds
   - Verify body scroll lock

---

## Task Checklist

### Core Tasks
- [ ] Create `useIsMobile.ts` hook for viewport detection
- [ ] Create `BottomSheet.tsx` component with swipe-to-dismiss
- [ ] Create `TouchButton.tsx` wrapper component (optional utility)
- [ ] Update FilterPanel with mobile collapse behavior
- [ ] Update ItemPreviewModal to render as BottomSheet on mobile

### Touch Target Updates
- [ ] Audit all Phase 1 components for touch targets
- [ ] Audit all Phase 2 components for touch targets
- [ ] Audit all Phase 3 components for touch targets
- [ ] Audit all Phase 4 components for touch targets
- [ ] Audit all Phase 5 components for touch targets
- [ ] Audit all Phase 6 components for touch targets
- [ ] Apply min-w/h classes where needed
- [ ] Test on actual mobile devices

### Optional Enhancements
- [ ] Create `SwipeableRow.tsx` component
- [ ] Integrate swipe actions into ItemRow
- [ ] Add haptic feedback (if available via Vibration API)

### Documentation
- [ ] Export new components from index files
- [ ] Update component exports
- [ ] Document mobile-specific behavior in test harness

---

## Effort Estimate

| Task | Estimate | Notes |
|------|----------|-------|
| useIsMobile hook | 30 min | Simple viewport detection |
| BottomSheet component | 2-3 hours | Swipe gestures, animations |
| FilterPanel collapse | 1-1.5 hours | State management, transitions |
| ItemPreviewModal update | 1 hour | Conditional rendering |
| Touch target audit & updates | 2-3 hours | All components across phases |
| SwipeableRow (optional) | 2 hours | Gesture handling |
| Cross-device testing | 2-3 hours | iOS, Android testing |
| **Total** | **9-13 hours** | Single developer |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Touch gestures conflicting with scroll | Medium | Medium | Use `touch-action` CSS, test thoroughly |
| Bottom sheet animation jank | Low | Low | Use CSS transforms, avoid layout thrashing |
| iOS Safari edge cases | Medium | Medium | Test on physical iOS devices early |
| Touch target changes affecting desktop | Low | Low | Use mobile-only classes (md: reset) |
| Swipe actions conflicting with list scroll | Medium | Medium | Only enable horizontal swipe, threshold tuning |
| Performance on older devices | Low | Medium | Keep animations simple, use GPU-accelerated transforms |

---

## References

- [Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md) - Phase 6 details
- [REQ-074 ItemPreviewModal](/docs/REQ-074-create-itempreviewmodal-component-overview.md) - Modal component
- [REQ-065 FilterPanel](/docs/REQ-065-implement-filterpanel-overview.md) - Filter panel component
- [StepNavigation](/src/components/ItemCapture/components/shared/StepNavigation.tsx) - Touch target reference (44px+)
- [ProgressIndicator](/src/components/ItemCapture/components/shared/ProgressIndicator.tsx) - Mobile/desktop split pattern
- [imageCropper.css](/src/components/ItemCapture/editors/imageCropper.css) - Touch target sizing reference
- [WCAG 2.1 Touch Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html) - 44x44px minimum
- [Apple HIG Touch Targets](https://developer.apple.com/design/human-interface-guidelines/accessibility) - 44pt minimum
- [Material Design Touch Targets](https://m3.material.io/foundations/accessible-design/accessibility-basics) - 48dp minimum
- [Request #089](/docs/gen_requests.md) - Original feature request

---

## Document History

| Date | Author | Changes |
|------|--------|---------|
| 2026-01-03 | Tech Lead Agent | Initial document creation |
