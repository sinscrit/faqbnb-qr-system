# REQ-084: Add Drag-and-Drop Reordering - Detailed Task Breakdown

**Document Created:** 2026-01-03 00:15:00 UTC
**Last Modified:** 2026-01-03 19:30:00 UTC
**Status:** ✅ COMPLETED
**Overview Document:** `/docs/REQ-084-add-drag-and-drop-reordering-overview.md`
**Request Reference:** REQ-084 in `/docs/gen_requests.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 5 - Asset Management
**Task ID:** 5.5

---

## Executive Summary

This document breaks down the implementation of drag-and-drop reordering functionality for the AssetPanel component into discrete, actionable tasks. Each task is scoped to approximately 1 story point (a few hours of focused work) and includes specific verification steps.

The implementation uses `@dnd-kit` library as recommended in the overview document for its superior touch support, accessibility features, and smooth animations.

---

## Prerequisites

Before starting these tasks, ensure the following are complete:

- [x] **Task 5.1** - `useAssetManagement` hook with `reorderAssets` action implemented
- [x] **Task 5.2** - `AssetPanel` component created
- [x] **Task 5.3** - `AssetItem` component created

---

## Authorized Files and Functions for Modification

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/ItemManager/components/AssetPanel/SortableAssetList.tsx` | DndContext provider, SortableContext, and SortableAssetItem wrapper |
| `src/components/ItemManager/hooks/useDragAnnouncements.ts` | (Optional) Custom accessibility announcements hook |

### Files to Modify

| File | Change |
|------|--------|
| `src/components/ItemManager/components/AssetPanel/AssetItem.tsx` | Add drag handle, `dragHandleProps`, `isDragging` styling |
| `src/components/ItemManager/components/AssetPanel/AssetPanel.tsx` | Replace asset list with SortableAssetList |
| `src/components/ItemManager/components/AssetPanel/index.ts` | Export SortableAssetList |
| `src/components/ItemManager/ItemManager.types.ts` | Add drag-related props interfaces |
| `package.json` | Add @dnd-kit dependencies |

---

## Task Breakdown

### Task 1: Install @dnd-kit Dependencies

**Objective:** Add the required @dnd-kit packages to the project.

**Story Points:** 0.5

**Steps:**
1. Install the following packages:
   ```bash
   npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @dnd-kit/modifiers
   ```
2. Verify packages are added to `package.json` dependencies section
3. Run `npm install` to ensure lock file is updated
4. Run `npm run build` to verify no dependency conflicts

**Files Modified:**
- `package.json`
- `package-lock.json`

**Verification:**
- [x] Run `npm ls @dnd-kit/core` shows installed version ^6.1.0 or compatible ✅ v6.3.1
- [x] Run `npm ls @dnd-kit/sortable` shows installed version ^8.0.0 or compatible ✅ v10.0.0
- [x] Run `npm run build` completes without errors ✅
- [x] Run `npm run dev` starts successfully ✅

**Implementation Notes:** Installed @dnd-kit/core@6.3.1, @dnd-kit/sortable@10.0.0, @dnd-kit/utilities, @dnd-kit/modifiers

---

### Task 2: Add Drag-Related Type Definitions

**Objective:** Define TypeScript interfaces for drag-and-drop functionality in the type definitions file.

**Story Points:** 0.5

**Steps:**
1. Open `src/components/ItemManager/ItemManager.types.ts`
2. Add the following interfaces:

```typescript
/**
 * Props for drag handle functionality on AssetItem.
 */
export interface DragHandleProps {
  /** Whether to show the drag handle (hidden when single item) */
  showDragHandle: boolean;
  /** Props from useSortable to spread on drag handle element */
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  /** Whether this item is currently being dragged */
  isDragging?: boolean;
  /** Whether this item is marked for removal (disable dragging) */
  isMarkedForRemoval?: boolean;
}

/**
 * Props for SortableAssetList component.
 */
export interface SortableAssetListProps {
  /** Array of assets to display (MediaItem or PendingAsset) */
  assets: Array<MediaItem | PendingAsset>;
  /** Callback when assets are reordered */
  onReorder: (fromIndex: number, toIndex: number) => void;
  /** Callback when an asset is removed */
  onRemove: (assetId: string) => void;
  /** IDs of assets marked for removal */
  markedForRemovalIds?: Set<string>;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Props for SortableAssetItem wrapper component.
 */
export interface SortableAssetItemProps {
  /** The asset to display */
  asset: MediaItem | PendingAsset;
  /** Unique identifier for sorting */
  id: string;
  /** Index in the list */
  index: number;
  /** Callback when removed */
  onRemove: (id: string) => void;
  /** Whether marked for removal */
  isMarkedForRemoval: boolean;
  /** Total number of assets (for hiding drag handle on single item) */
  totalCount: number;
}
```

3. Import `MediaItem` from ItemCapture types if not already imported

**Files Modified:**
- `src/components/ItemManager/ItemManager.types.ts`

**Verification:**
- [x] TypeScript compilation passes with no errors ✅
- [x] Types are exported correctly from the types file ✅
- [x] No circular import issues ✅

**Implementation Notes:** Added DragHandleProps, SortableAssetListProps, SortableAssetItemProps interfaces

---

### Task 3: Update AssetItem Component with Drag Handle

**Objective:** Add a drag handle to the AssetItem component with proper styling and accessibility.

**Story Points:** 1

**Steps:**
1. Open `src/components/ItemManager/components/AssetPanel/AssetItem.tsx`
2. Add imports:
   ```typescript
   import { GripVertical } from 'lucide-react';
   import type { DragHandleProps } from '../../ItemManager.types';
   ```

3. Extend the component props interface to include drag handle props:
   ```typescript
   export interface AssetItemProps extends Partial<DragHandleProps> {
     // ... existing props
   }
   ```

4. Add the drag handle element before the thumbnail:
   ```tsx
   {showDragHandle && !isMarkedForRemoval && (
     <div
       {...dragHandleProps}
       className={cn(
         'shrink-0 p-2 cursor-grab active:cursor-grabbing',
         'text-gray-400 hover:text-gray-600',
         'touch-none select-none',
         'transition-colors duration-150',
         'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:rounded',
         isDragging && 'cursor-grabbing'
       )}
       aria-label="Drag to reorder"
       role="button"
       tabIndex={0}
     >
       <GripVertical className="w-5 h-5" />
     </div>
   )}
   ```

5. Add conditional styling for dragging state:
   ```tsx
   <div
     className={cn(
       // ... existing classes
       isDragging && 'shadow-lg ring-2 ring-blue-500 opacity-95 scale-[1.02] bg-white z-10'
     )}
   >
   ```

**Files Modified:**
- `src/components/ItemManager/components/AssetPanel/AssetItem.tsx`

**Verification:**
- [x] Component renders without drag handle when `showDragHandle` is false ✅
- [x] Component renders drag handle when `showDragHandle` is true ✅
- [x] Drag handle hidden when `isMarkedForRemoval` is true ✅
- [x] Drag handle has correct cursor styles (grab/grabbing) ✅
- [x] Drag handle has visible focus ring on keyboard focus ✅
- [x] Dragging styles apply when `isDragging` is true ✅

**Implementation Notes:** Extended AssetItem with ExtendedAssetItemProps, added GripVertical icon with proper ARIA labels

---

### Task 4: Create SortableAssetList Component Shell

**Objective:** Create the container component that provides DnD context and renders sortable items.

**Story Points:** 1

**Steps:**
1. Create file `src/components/ItemManager/components/AssetPanel/SortableAssetList.tsx`
2. Add the following structure:

```typescript
'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import { SortableAssetItem } from './SortableAssetItem';
import { AssetItem } from './AssetItem';
import { cn } from '@/lib/utils';
import type { SortableAssetListProps } from '../../ItemManager.types';
import type { MediaItem } from '@/components/ItemCapture/ItemCapture.types';

export function SortableAssetList({
  assets,
  onReorder,
  onRemove,
  markedForRemovalIds = new Set(),
  className,
}: SortableAssetListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // Long press for touch
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = assets.findIndex((a) => a.id === active.id);
      const newIndex = assets.findIndex((a) => a.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(oldIndex, newIndex);
      }
    }
  }, [assets, onReorder]);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  const activeAsset = activeId
    ? assets.find((a) => a.id === activeId)
    : null;

  const draggableAssets = assets.filter(
    (a) => !markedForRemovalIds.has(a.id)
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <SortableContext
        items={draggableAssets.map((a) => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          role="list"
          aria-label="Reorderable asset list"
          className={cn('space-y-2', className)}
        >
          {assets.map((asset, index) => (
            <SortableAssetItem
              key={asset.id}
              id={asset.id}
              asset={asset}
              index={index}
              onRemove={onRemove}
              isMarkedForRemoval={markedForRemovalIds.has(asset.id)}
              totalCount={assets.length}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeAsset ? (
          <AssetItem
            asset={activeAsset}
            index={-1}
            onRemove={() => {}}
            showDragHandle={false}
            isDragging
            className="shadow-xl bg-white ring-2 ring-blue-500"
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
```

**Files Created:**
- `src/components/ItemManager/components/AssetPanel/SortableAssetList.tsx`

**Verification:**
- [ ] File compiles without TypeScript errors
- [ ] Component accepts all required props
- [ ] DndContext is properly configured with sensors and modifiers
- [ ] SortableContext uses vertical list strategy

---

### Task 5: Create SortableAssetItem Wrapper Component

**Objective:** Create the wrapper component that makes individual AssetItems sortable.

**Story Points:** 1

**Steps:**
1. Add SortableAssetItem to `SortableAssetList.tsx` or create separate file
2. Implement the sortable wrapper:

```typescript
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AssetItem } from './AssetItem';
import type { SortableAssetItemProps } from '../../ItemManager.types';

export function SortableAssetItem({
  asset,
  id,
  index,
  onRemove,
  isMarkedForRemoval,
  totalCount,
}: SortableAssetItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: isMarkedForRemoval,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
  };

  // Hide drag handle when only one non-removed item
  const nonRemovedCount = totalCount; // Adjust if needed based on actual logic
  const showDragHandle = nonRemovedCount > 1 && !isMarkedForRemoval;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      role="listitem"
    >
      <AssetItem
        asset={asset}
        index={index}
        onRemove={onRemove}
        showDragHandle={showDragHandle}
        dragHandleProps={listeners}
        isDragging={isDragging}
        isMarkedForRemoval={isMarkedForRemoval}
      />
    </div>
  );
}
```

**Files Modified:**
- `src/components/ItemManager/components/AssetPanel/SortableAssetList.tsx`

**Verification:**
- [ ] SortableAssetItem wraps AssetItem correctly
- [ ] CSS transforms apply during drag
- [ ] Drag handle listeners are passed to AssetItem
- [ ] Disabled state works for marked-for-removal items
- [ ] Drag handle hidden when only one draggable item

---

### Task 6: Integrate SortableAssetList into AssetPanel

**Objective:** Replace the plain asset list in AssetPanel with the sortable version.

**Story Points:** 1

**Steps:**
1. Open `src/components/ItemManager/components/AssetPanel/AssetPanel.tsx`
2. Import SortableAssetList:
   ```typescript
   import { SortableAssetList } from './SortableAssetList';
   ```

3. Replace the existing asset list rendering with SortableAssetList:
   ```tsx
   <SortableAssetList
     assets={assets}
     onReorder={reorderAssets}  // from useAssetManagement
     onRemove={handleRemove}
     markedForRemovalIds={markedForRemovalIds}
   />
   ```

4. Ensure `reorderAssets` function is available from `useAssetManagement` hook

**Files Modified:**
- `src/components/ItemManager/components/AssetPanel/AssetPanel.tsx`

**Verification:**
- [ ] AssetPanel renders SortableAssetList instead of plain list
- [ ] Assets display correctly in the sortable list
- [ ] Remove functionality still works
- [ ] Marked-for-removal items display correctly

---

### Task 7: Update AssetPanel Index Exports

**Objective:** Export the new SortableAssetList component from the AssetPanel index.

**Story Points:** 0.5

**Steps:**
1. Open `src/components/ItemManager/components/AssetPanel/index.ts`
2. Add export for SortableAssetList:
   ```typescript
   export { SortableAssetList } from './SortableAssetList';
   export type { SortableAssetListProps, SortableAssetItemProps } from '../../ItemManager.types';
   ```

**Files Modified:**
- `src/components/ItemManager/components/AssetPanel/index.ts`

**Verification:**
- [ ] SortableAssetList can be imported from AssetPanel barrel export
- [ ] Types can be imported correctly

---

### Task 8: Add Keyboard Navigation Support

**Objective:** Ensure keyboard-only users can reorder assets using arrow keys.

**Story Points:** 1

**Steps:**
1. The @dnd-kit KeyboardSensor is already configured in Task 4
2. Add custom keyboard handling for better UX:

In SortableAssetList, enhance the keyboard sensor configuration:
```typescript
useSensor(KeyboardSensor, {
  coordinateGetter: sortableKeyboardCoordinates,
})
```

3. Add visible focus states to drag handles (already done in Task 3)

4. Test keyboard navigation flow:
   - Tab to drag handle
   - Press Space or Enter to pick up
   - Use Arrow Up/Down to move
   - Press Space or Enter to drop
   - Press Escape to cancel

**Files Modified:**
- `src/components/ItemManager/components/AssetPanel/SortableAssetList.tsx`

**Verification:**
- [ ] Tab navigates to drag handles in order
- [ ] Space/Enter picks up item (initiates drag)
- [ ] ArrowUp moves item up one position
- [ ] ArrowDown moves item down one position
- [ ] Space/Enter drops item at new position
- [ ] Escape cancels drag and returns to original position
- [ ] Focus returns to drag handle after drop

---

### Task 9: Add Accessibility Announcements

**Objective:** Provide screen reader announcements during drag operations.

**Story Points:** 1

**Steps:**
1. Add announcements prop to DndContext:

```typescript
const announcements = {
  onDragStart({ active }) {
    const asset = assets.find(a => a.id === active.id);
    const position = assets.findIndex(a => a.id === active.id) + 1;
    const name = getAssetName(asset);
    return `Picked up ${name}. Current position: ${position} of ${assets.length}`;
  },
  onDragOver({ active, over }) {
    if (over) {
      const overIndex = assets.findIndex(a => a.id === over.id) + 1;
      return `Over position ${overIndex}`;
    }
    return undefined;
  },
  onDragEnd({ active, over }) {
    if (over) {
      const asset = assets.find(a => a.id === active.id);
      const name = getAssetName(asset);
      const newPosition = assets.findIndex(a => a.id === over.id) + 1;
      return `Dropped ${name}. New position: ${newPosition} of ${assets.length}`;
    }
    return 'Dropped';
  },
  onDragCancel({ active }) {
    const asset = assets.find(a => a.id === active.id);
    const name = getAssetName(asset);
    return `Drag cancelled. ${name} returned to original position`;
  },
};

// Helper function
function getAssetName(asset: MediaItem | PendingAsset | undefined): string {
  if (!asset) return 'item';
  if ('metadata' in asset && asset.metadata.originalFilename) {
    return asset.metadata.originalFilename;
  }
  return `${asset.type} item`;
}
```

2. Pass announcements to DndContext:
```tsx
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
  onDragCancel={handleDragCancel}
  modifiers={[restrictToVerticalAxis, restrictToParentElement]}
  accessibility={{ announcements }}
>
```

**Files Modified:**
- `src/components/ItemManager/components/AssetPanel/SortableAssetList.tsx`

**Verification:**
- [ ] VoiceOver (macOS) announces drag start with item name and position
- [ ] VoiceOver announces position changes during drag
- [ ] VoiceOver announces final position on drop
- [ ] VoiceOver announces when drag is cancelled
- [ ] Announcements use correct pluralization

---

### Task 10: Add Edge Case Handling

**Objective:** Handle edge cases for drag-and-drop operations.

**Story Points:** 1

**Steps:**
1. **Single Item:** Already handled by `showDragHandle` logic in Task 5

2. **Rapid Operations:** Add debouncing to onReorder callback:
```typescript
const debouncedReorder = useMemo(
  () => debounce(onReorder, 100),
  [onReorder]
);
```

3. **Drag Outside Container:** Already handled by `restrictToParentElement` modifier

4. **Marked-for-Removal Items:** Already handled by `disabled` prop in useSortable

5. Add bounds checking in handleDragEnd:
```typescript
const handleDragEnd = useCallback((event: DragEndEvent) => {
  const { active, over } = event;
  setActiveId(null);

  if (!over || active.id === over.id) {
    return; // No action needed
  }

  const oldIndex = assets.findIndex((a) => a.id === active.id);
  const newIndex = assets.findIndex((a) => a.id === over.id);

  // Bounds checking
  if (oldIndex < 0 || newIndex < 0) {
    console.warn('Invalid reorder indices:', { oldIndex, newIndex });
    return;
  }

  onReorder(oldIndex, newIndex);
}, [assets, onReorder]);
```

**Files Modified:**
- `src/components/ItemManager/components/AssetPanel/SortableAssetList.tsx`

**Verification:**
- [ ] Single item shows no drag handle
- [ ] Rapid drags don't cause state inconsistencies
- [ ] Dropping outside container cancels drag
- [ ] Marked-for-removal items are not draggable
- [ ] Invalid indices are logged but don't crash

---

### Task 11: Add Visual Feedback Styles

**Objective:** Ensure clear visual feedback during all drag states.

**Story Points:** 0.5

**Steps:**
1. Verify the following styles are applied (from Tasks 3-5):

**Drag Handle (normal):**
```css
text-gray-400 hover:text-gray-600 cursor-grab
```

**Drag Handle (grabbing):**
```css
cursor-grabbing
```

**Dragged Item (placeholder):**
```css
opacity-50
```

**Drag Overlay (the floating item):**
```css
shadow-xl bg-white ring-2 ring-blue-500
```

2. Add drop position indicator styling if not present:
```typescript
// In SortableAssetItem, add a drop indicator
<div className={cn(
  'relative',
  isOver && 'before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-blue-500'
)}>
```

**Files Modified:**
- `src/components/ItemManager/components/AssetPanel/AssetItem.tsx`
- `src/components/ItemManager/components/AssetPanel/SortableAssetList.tsx`

**Verification:**
- [ ] Drag handle color changes on hover
- [ ] Cursor changes to grabbing during drag
- [ ] Dragged item placeholder shows reduced opacity
- [ ] Floating overlay has shadow and ring
- [ ] Drop position indicator visible between items

---

### Task 12: Test Harness Integration

**Objective:** Add drag-and-drop testing to the test harness page.

**Story Points:** 1

**Steps:**
1. Locate or create test harness at `/src/app/test/item-manager/page.tsx`
2. Add a section for testing drag-and-drop:

```tsx
<section className="mt-8 p-4 border rounded">
  <h2 className="text-lg font-bold mb-4">Drag-and-Drop Reordering</h2>
  <p className="text-sm text-gray-600 mb-4">
    Drag assets using the grip handle to reorder. Works with mouse, touch, and keyboard.
  </p>

  <SortableAssetList
    assets={testAssets}
    onReorder={(from, to) => {
      console.log(`=== REORDER: ${from} -> ${to} ===`);
      setTestAssets(prev => {
        const result = [...prev];
        const [removed] = result.splice(from, 1);
        result.splice(to, 0, removed);
        return result;
      });
    }}
    onRemove={(id) => {
      console.log('Remove:', id);
      setTestAssets(prev => prev.filter(a => a.id !== id));
    }}
  />

  <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
    <strong>Controls:</strong>
    <ul className="mt-1 space-y-1">
      <li>Mouse: Click and drag the grip icon</li>
      <li>Touch: Long-press and drag</li>
      <li>Keyboard: Tab to grip, Space to pick up, Arrows to move, Space to drop</li>
    </ul>
  </div>
</section>
```

**Files Modified:**
- `src/app/test/item-manager/page.tsx`

**Verification:**
- [ ] Test harness page loads without errors
- [ ] SortableAssetList renders in test harness
- [ ] Console logs reorder operations with correct indices
- [ ] Reordering updates the displayed list
- [ ] Remove functionality works from test harness

---

### Task 13: Cross-Browser and Device Testing

**Objective:** Verify drag-and-drop works across target browsers and devices.

**Story Points:** 1

**Steps:**
1. **Desktop Testing:**
   - [ ] Chrome (latest): Mouse drag works, keyboard navigation works
   - [ ] Firefox (latest): Mouse drag works, keyboard navigation works
   - [ ] Safari (latest): Mouse drag works, keyboard navigation works
   - [ ] Edge (latest): Mouse drag works, keyboard navigation works

2. **Mobile Testing:**
   - [ ] iOS Safari 15+: Long-press activates drag, smooth movement
   - [ ] iOS Safari: No scroll interference during drag
   - [ ] Android Chrome 90+: Touch drag works
   - [ ] Android Chrome: No scroll interference

3. **Accessibility Testing:**
   - [ ] VoiceOver (macOS): Announcements clear and accurate
   - [ ] VoiceOver (iOS): Touch and announcements work
   - [ ] NVDA (Windows): Announcements audible
   - [ ] Keyboard-only: Full navigation possible

4. Document any issues found and create follow-up tasks if needed

**Files Modified:**
- None (testing only)

**Verification:**
- [ ] All desktop browsers pass testing
- [ ] iOS Safari works correctly
- [ ] Android Chrome works correctly
- [ ] VoiceOver announces correctly
- [ ] Keyboard-only navigation works

---

### Task 14: Documentation and Code Comments

**Objective:** Add code documentation for future maintainers.

**Story Points:** 0.5

**Steps:**
1. Add JSDoc comments to SortableAssetList:
```typescript
/**
 * SortableAssetList provides drag-and-drop reordering for assets in the AssetPanel.
 *
 * Uses @dnd-kit for cross-platform support including:
 * - Mouse drag (desktop)
 * - Touch drag with long-press activation (mobile)
 * - Keyboard navigation (Space to pick up, Arrows to move, Space to drop)
 *
 * @example
 * <SortableAssetList
 *   assets={assets}
 *   onReorder={(from, to) => dispatch({ type: 'REORDER_ASSETS', payload: { fromIndex: from, toIndex: to } })}
 *   onRemove={(id) => dispatch({ type: 'REMOVE_ASSET', payload: id })}
 * />
 */
```

2. Add JSDoc comments to SortableAssetItem:
```typescript
/**
 * Wrapper component that makes an AssetItem sortable via drag-and-drop.
 * Handles CSS transforms, drag state, and passes drag listeners to the drag handle.
 */
```

3. Update drag handle comments in AssetItem

**Files Modified:**
- `src/components/ItemManager/components/AssetPanel/SortableAssetList.tsx`
- `src/components/ItemManager/components/AssetPanel/AssetItem.tsx`

**Verification:**
- [ ] All exported components have JSDoc comments
- [ ] Usage examples are accurate
- [ ] Accessibility features are documented

---

## Task Summary

| Task | Title | Story Points | Dependencies |
|------|-------|--------------|--------------|
| 1 | Install @dnd-kit Dependencies | 0.5 | None |
| 2 | Add Drag-Related Type Definitions | 0.5 | Task 1 |
| 3 | Update AssetItem with Drag Handle | 1 | Task 2 |
| 4 | Create SortableAssetList Shell | 1 | Tasks 1, 2 |
| 5 | Create SortableAssetItem Wrapper | 1 | Tasks 3, 4 |
| 6 | Integrate into AssetPanel | 1 | Task 5 |
| 7 | Update Index Exports | 0.5 | Task 6 |
| 8 | Add Keyboard Navigation | 1 | Task 6 |
| 9 | Add Accessibility Announcements | 1 | Task 8 |
| 10 | Add Edge Case Handling | 1 | Task 6 |
| 11 | Add Visual Feedback Styles | 0.5 | Task 6 |
| 12 | Test Harness Integration | 1 | Task 6 |
| 13 | Cross-Browser Testing | 1 | Task 12 |
| 14 | Documentation | 0.5 | Task 13 |

**Total Story Points:** 11.5

---

## Task Dependency Graph

```
Task 1 (Install deps)
    │
    ├──► Task 2 (Type definitions)
    │         │
    │         ├──► Task 3 (AssetItem drag handle)
    │         │         │
    │         └──► Task 4 (SortableAssetList shell)
    │                   │
    │                   └──► Task 5 (SortableAssetItem)
    │                             │
    │                             └──► Task 6 (Integrate into AssetPanel)
    │                                       │
    │              ┌──────────────┬─────────┼─────────┬───────────────┐
    │              │              │         │         │               │
    │              ▼              ▼         ▼         ▼               ▼
    │         Task 7         Task 8     Task 10   Task 11        Task 12
    │        (Exports)    (Keyboard)   (Edges)   (Styles)      (Test harness)
    │                          │                                     │
    │                          ▼                                     ▼
    │                     Task 9                               Task 13
    │                  (A11y announce)                        (Testing)
    │                                                              │
    │                                                              ▼
    │                                                         Task 14
    │                                                        (Docs)
```

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Tasks |
|---------------------|-------|
| Visible drag handle on each asset | Task 3 |
| Visual feedback when dragging begins | Tasks 3, 5, 11 |
| Clear drop position indicator | Task 11 |
| Reorders and persists new sequence | Tasks 4, 5, 6 |
| Works on touch and mouse devices | Tasks 4, 13 |
| Keyboard-based reordering | Tasks 8, 9 |
| No data loss or corruption | Task 10 |

---

## Rollback Plan

If issues are discovered after implementation:

1. **Quick Disable:** Add a feature flag to AssetPanel to conditionally render SortableAssetList vs plain list
2. **Dependency Removal:** Remove @dnd-kit packages if needed
3. **Fallback UI:** Existing up/down arrow buttons pattern from ItemForm.tsx can be used as fallback

---

## Document History

| Date | Author | Changes |
|------|--------|---------|
| 2026-01-03 | Senior Dev Agent | Initial document creation |
