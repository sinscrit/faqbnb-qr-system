# REQ-084: Add Drag-and-Drop Reordering - Technical Overview

**Document Created:** 2026-01-03
**Last Modified:** 2026-01-03
**Request Reference:** REQ-084 in `/docs/gen_requests.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 5 - Asset Management
**Task ID:** 5.5
**Estimated Effort:** 2-3 story points

---

## Summary

Implement drag-and-drop reordering functionality for the AssetItem component within the AssetPanel. Users should be able to click and hold on a drag handle, drag the asset to a new position, and release to reorder. The system must provide clear visual feedback throughout the drag operation including:
- A visible drag handle on each AssetItem indicating the item can be moved
- Visual indication that an item is being dragged (elevation, opacity change)
- A clear drop position indicator showing where the item will land
- Smooth animations when items shift to accommodate the new position

The implementation will evaluate native HTML5 Drag and Drop API first, with fallback to `@dnd-kit/core` if native DnD proves insufficient for touch devices or accessibility requirements.

---

## Technical Context

### Existing Stack
| Technology | Version | Notes |
|------------|---------|-------|
| Next.js | 15.5.9 | With Turbopack |
| React | 19.1.0 | |
| TypeScript | 5.x | Strict mode enabled |
| Tailwind CSS | 4.x | Utility-first styling |
| Lucide React | 0.525.0 | Icon library (GripVertical for drag handle) |
| Utility | `cn()` | Class merging from `src/lib/utils.ts` |

### Relevant Existing Patterns

| Pattern | Source File | Notes |
|---------|-------------|-------|
| Manual reordering | `src/components/ItemForm.tsx` | Up/down arrow buttons for link reordering |
| Reorder action | `useAssetManagement.ts` | `REORDER_ASSETS` action with fromIndex/toIndex |
| Drag zone styling | `FileUploadStep.tsx` | Drag-over visual feedback patterns |
| AssetItem component | `AssetPanel/AssetItem.tsx` | Base component to enhance with drag handle |
| State machine | `useItemCaptureState.ts` | Reducer-based state management pattern |

### Target Architecture (from Implementation Plan)

```
src/components/ItemManager/
├── hooks/
│   └── useAssetManagement.ts    (Task 5.1 - provides reorderAssets action)
├── components/
│   ├── AssetPanel/
│   │   ├── AssetPanel.tsx        (Task 5.2 - container, renders sortable list)
│   │   ├── AssetItem.tsx         (Task 5.3 - receives drag handle, drag listeners)
│   │   ├── AssetDropZone.tsx     (Task 5.4 - file upload)
│   │   └── SortableAssetList.tsx <-- NEW FILE (optional wrapper for dnd-kit)
```

### New Dependencies Consideration

| Library | Purpose | Size Impact | Recommendation |
|---------|---------|-------------|----------------|
| Native HTML5 DnD | Basic drag-and-drop | 0 KB | Try first for desktop |
| @dnd-kit/core | Modern DnD library | ~15KB | Use if native DnD insufficient |
| @dnd-kit/sortable | Sortable list utilities | ~5KB | Required with @dnd-kit/core |
| @dnd-kit/utilities | CSS transform utilities | ~2KB | Optional helper |

**Implementation Decision Tree:**
1. Attempt native HTML5 DnD first (0 dependencies)
2. Test on iOS Safari and Android Chrome
3. If touch support inadequate or accessibility gaps found → install @dnd-kit
4. @dnd-kit recommended for production due to better accessibility and touch support

---

## Dependencies

### Phase Dependencies
- **Requires:** Task 5.3 (AssetItem component) - Base component to enhance
- **Requires:** Task 5.2 (AssetPanel component) - Container that manages drag context
- **Requires:** Task 5.1 (useAssetManagement hook) - `reorderAssets` action
- **Blocks:** Task 5.6 (Asset Remove Confirmation) - Can proceed in parallel
- **Blocks:** Phase 6 (Polish) - Drag accessibility is part of a11y audit

### Task Dependencies
```
5.1 useAssetManagement Hook
         │
         ▼
5.2 AssetPanel Component
         │
         ▼
5.3 AssetItem Component
         │
         ▼
5.5 Drag-and-Drop Reorder    <-- THIS TASK
         │
         ▼
5.6 Asset Remove Confirmation
```

---

## Implementation Requirements

### Core Functionality

1. **Drag Handle**
   - Add GripVertical icon from Lucide to left side of AssetItem
   - Handle should be visually distinct (gray, changes on hover)
   - Handle is the drag target (users must grab handle to drag)
   - Touch-friendly size: minimum 44x44px touch target
   - Cursor: `cursor-grab` default, `cursor-grabbing` while dragging

2. **Drag Start Behavior**
   - Only initiate drag when grabbing the drag handle
   - Visual feedback: dragged item gets elevation/shadow, slight opacity
   - Other items remain in place until drag position indicates reorder
   - Screen reader announcement: "Grabbed [asset name], position X of Y"

3. **Visual Feedback During Drag**
   - Dragged item: elevated appearance (`shadow-lg`), 95% opacity, scaled slightly
   - Drop placeholder: visible indicator line or space between items
   - Items animate smoothly when they shift to make room
   - Clear indication of valid drop zones

4. **Drop Position Indicator**
   - Show a horizontal line or highlighted gap where item will land
   - Indicator appears between items, not on top of items
   - Color: blue or primary color to indicate valid drop
   - Animate indicator appearance/position smoothly

5. **Drop Behavior**
   - On release: item moves to new position
   - Call `reorderAssets(fromIndex, toIndex)` from useAssetManagement hook
   - Smooth animation of items settling into new positions
   - Screen reader announcement: "Dropped [asset name], now position X of Y"

6. **Cancel Drag**
   - ESC key cancels drag operation
   - Dropping outside valid zone returns item to original position
   - Clear visual reset on cancel

7. **Accessibility Requirements**
   - Keyboard-only reordering fallback (ArrowUp/ArrowDown when focused on handle)
   - ARIA attributes: `aria-grabbed`, `aria-dropeffect`
   - Live region announcements for drag operations
   - Focus management: return focus to handle after reorder

8. **Touch Support**
   - Long-press on drag handle initiates drag (or immediate on touch start)
   - Touch feedback: slight haptic if available
   - Works on iOS Safari 15+ and Android Chrome 90+

### Implementation Options

#### Option A: Native HTML5 Drag and Drop

```typescript
'use client';

import { useState, useCallback } from 'react';

interface UseDragReorderOptions {
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function useDragReorder({ onReorder }: UseDragReorderOptions) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));

    // Optional: set drag image
    if (e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.currentTarget, 20, 20);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);

    if (!isNaN(fromIndex) && fromIndex !== toIndex) {
      onReorder(fromIndex, toIndex);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [onReorder]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  return {
    draggedIndex,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  };
}
```

**Pros:**
- Zero dependencies
- Works well on desktop browsers

**Cons:**
- Limited touch support on iOS Safari
- Accessibility requires manual implementation
- No built-in animations

#### Option B: @dnd-kit Implementation (Recommended)

```typescript
'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';

interface SortableAssetItemProps {
  asset: MediaItem | PendingAsset;
  id: string;
  // ... other AssetItem props
}

export function SortableAssetItem({ asset, id, ...props }: SortableAssetItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <AssetItem
        asset={asset}
        showDragHandle
        dragHandleProps={listeners} // Pass listeners to drag handle
        className={isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''}
        {...props}
      />
    </div>
  );
}

export function SortableAssetList({
  assets,
  onReorder,
  onRemove,
  // ...other props
}: SortableAssetListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // Long press to activate on touch
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = assets.findIndex((a) => a.id === active.id);
      const newIndex = assets.findIndex((a) => a.id === over.id);
      onReorder(oldIndex, newIndex);
    }
  };

  const activeAsset = activeId ? assets.find((a) => a.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <SortableContext
        items={assets.map((a) => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div role="list" className="space-y-2">
          {assets.map((asset, index) => (
            <SortableAssetItem
              key={asset.id}
              id={asset.id}
              asset={asset}
              index={index}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>

      {/* Drag Overlay - shown during drag for visual feedback */}
      <DragOverlay>
        {activeAsset ? (
          <AssetItem
            asset={activeAsset}
            index={-1}
            onRemove={() => {}}
            className="shadow-xl bg-white ring-2 ring-blue-500"
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
```

**Pros:**
- Excellent touch support (iOS Safari, Android)
- Built-in keyboard navigation
- Comprehensive accessibility support
- Smooth animations via CSS transforms
- Active maintenance and React 19 support

**Cons:**
- Adds ~20KB to bundle
- Learning curve for dnd-kit API

### Recommended Implementation: @dnd-kit

Given the requirements for touch device support, accessibility, and smooth animations, **@dnd-kit is the recommended approach**. The implementation plan already identified this as the preferred library if native DnD proves insufficient.

---

## AssetItem Drag Handle Integration

Update the existing AssetItem component to support drag handles:

```typescript
// Updated AssetItem props
export interface AssetItemProps {
  // ... existing props

  /** Whether to show the drag handle */
  showDragHandle?: boolean;

  /** Props to spread on the drag handle (from useSortable listeners) */
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;

  /** Whether this item is currently being dragged */
  isDragging?: boolean;
}

// In AssetItem component:
{showDragHandle && (
  <div
    {...dragHandleProps}
    className={cn(
      'shrink-0 p-2 cursor-grab active:cursor-grabbing',
      'text-gray-400 hover:text-gray-600',
      'touch-none', // Prevent scroll interference on touch
      'select-none', // Prevent text selection during drag
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:rounded'
    )}
    aria-label="Drag to reorder"
    role="button"
    tabIndex={0}
  >
    <GripVertical className="w-5 h-5" />
  </div>
)}
```

---

## Visual Design

### Drag Handle Appearance

```
Normal State:
┌─────────────────────────────────────────┐
│ ⋮⋮  ┌──────────┐                        │
│ ⋮⋮  │ Thumb    │  Asset Name        [X] │
│     │   ▶      │  1:24 duration         │
│     └──────────┘                        │
└─────────────────────────────────────────┘
  ↑
  Drag handle (GripVertical icon)
```

### During Drag

```
Dragged Item (elevated, following cursor):
╔═════════════════════════════════════════╗  ← shadow-xl, ring-2 ring-blue-500
║ ⋮⋮  ┌──────────┐                        ║
║ ⋮⋮  │ Thumb    │  Asset Name        [X] ║  ← 95% opacity
║     │   ▶      │  1:24 duration         ║
║     └──────────┘                        ║
╚═════════════════════════════════════════╝

Original Position (placeholder):
┌- - - - - - - - - - - - - - - - - - - - -┐
│                                          │  ← dashed border, bg-gray-100
│           (placeholder space)            │
│                                          │
└- - - - - - - - - - - - - - - - - - - - -┘

Drop Indicator (between items):
┌─────────────────────────────────────────┐
│ ⋮⋮  Item Above                          │
└─────────────────────────────────────────┘
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ← 2px blue line
┌─────────────────────────────────────────┐
│ ⋮⋮  Item Below                          │
└─────────────────────────────────────────┘
```

### CSS Classes

```tsx
// Drag handle
const dragHandleClasses = cn(
  'shrink-0 p-2',
  'cursor-grab active:cursor-grabbing',
  'text-gray-400 hover:text-gray-600',
  'touch-none select-none',
  'transition-colors duration-150'
);

// Dragging item
const draggingClasses = cn(
  'shadow-xl',
  'ring-2 ring-blue-500',
  'opacity-95',
  'scale-[1.02]',
  'bg-white'
);

// Placeholder (item being dragged leaves this behind)
const placeholderClasses = cn(
  'border-2 border-dashed border-gray-300',
  'bg-gray-50',
  'rounded-lg'
);

// Drop indicator
const dropIndicatorClasses = cn(
  'h-0.5 bg-blue-500',
  'w-full',
  'transition-all duration-150'
);
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/ItemManager/components/AssetPanel/SortableAssetList.tsx` | Wrapper providing dnd-kit context and sortable list |
| `src/components/ItemManager/hooks/useDragReorder.ts` | Optional: Native DnD hook (if not using dnd-kit) |

### Files to Modify

| File | Change |
|------|--------|
| `src/components/ItemManager/components/AssetPanel/AssetItem.tsx` | Add drag handle, dragHandleProps, isDragging state styling |
| `src/components/ItemManager/components/AssetPanel/AssetPanel.tsx` | Wrap asset list with SortableAssetList or DndContext |
| `src/components/ItemManager/components/AssetPanel/index.ts` | Export SortableAssetList |
| `src/components/ItemManager/ItemManager.types.ts` | Add drag-related props interfaces |
| `package.json` | Add @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities (if using dnd-kit) |

### Functions/Components to Create

| Name | Location | Purpose |
|------|----------|---------|
| `SortableAssetList` | `AssetPanel/SortableAssetList.tsx` | DndContext provider + SortableContext wrapper |
| `SortableAssetItem` | `AssetPanel/SortableAssetList.tsx` | Sortable wrapper for AssetItem |
| `DragHandle` | `AssetPanel/AssetItem.tsx` | Inline drag handle component with proper a11y |

### Package.json Updates

```json
{
  "dependencies": {
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@dnd-kit/modifiers": "^7.0.0"
  }
}
```

---

## Acceptance Criteria

From REQ-084:

- [ ] Each asset item displays a visible drag handle or clearly indicates it can be dragged
- [ ] When dragging begins, the dragged item provides visual feedback distinct from its normal state
- [ ] While dragging, a clear drop position indicator shows where the item will be placed
- [ ] Releasing the item at a valid position reorders the asset list and persists the new sequence
- [ ] The drag-and-drop interaction works smoothly across touch and mouse input devices
- [ ] Accessibility features support keyboard-based reordering for users who cannot use drag-and-drop
- [ ] The reordering operation does not cause data loss or corruption of asset metadata

### Additional Technical Criteria

- [ ] Component uses `'use client'` directive
- [ ] TypeScript strict mode compliance with no `any` types
- [ ] Drag handle has minimum 44x44px touch target
- [ ] Keyboard navigation: ArrowUp/ArrowDown when focused on handle
- [ ] ARIA attributes: appropriate roles and live region announcements
- [ ] Works on iOS Safari 15+ and Android Chrome 90+
- [ ] Smooth animations using CSS transforms (not layout shifts)
- [ ] `reorderAssets` from useAssetManagement is called on successful drop
- [ ] ESC key cancels drag operation
- [ ] Focus returns to drag handle after reorder completes

---

## Edge Cases

1. **Single Item**
   - Hide drag handle when only one asset exists
   - Or show disabled drag handle with tooltip "Add more items to reorder"

2. **Drag Outside Container**
   - Cancel drag and return item to original position
   - No state change should occur

3. **Rapid Drag Operations**
   - Debounce reorder calls if needed
   - Ensure state consistency during rapid movements

4. **Drag During Pending Changes**
   - Allow reordering of both committed and pending assets
   - Pending additions can be reordered before commit

5. **Drag Marked-for-Removal Items**
   - Items marked for removal should NOT be draggable
   - Hide drag handle for isMarkedForRemoval assets

6. **Touch Scroll Conflict**
   - Use `touch-none` on drag handle to prevent scroll hijacking
   - Require long-press activation on touch devices

7. **Very Long Lists**
   - Test with 20+ assets for performance
   - Consider virtual scrolling for large lists (future enhancement)

8. **Keyboard Reorder Bounds**
   - ArrowUp on first item: no action
   - ArrowDown on last item: no action
   - Announce bounds reached to screen readers

---

## Testing Approach

### Unit Tests

- [ ] Drag handle renders when `showDragHandle` is true
- [ ] Drag handle hidden when `showDragHandle` is false
- [ ] Keyboard events (ArrowUp/ArrowDown) trigger reorder
- [ ] ESC key cancels drag operation
- [ ] `reorderAssets` called with correct indices on drop

### Integration Tests

- [ ] Full drag-and-drop flow from start to drop
- [ ] Reorder updates useAssetManagement state correctly
- [ ] Multiple consecutive reorders maintain correct order
- [ ] Reorder works with mixed committed and pending assets

### Manual Testing Checklist

**Desktop:**
- [ ] Chrome: drag-and-drop works smoothly
- [ ] Firefox: drag-and-drop works smoothly
- [ ] Safari: drag-and-drop works smoothly
- [ ] Edge: drag-and-drop works smoothly
- [ ] Keyboard only: Tab to handle, Space to grab, Arrows to move, Space to drop, ESC to cancel

**Mobile:**
- [ ] iOS Safari: long-press activates drag, smooth movement
- [ ] iOS Safari: no scroll interference during drag
- [ ] Android Chrome: touch drag works correctly
- [ ] Android Chrome: no scroll interference

**Accessibility:**
- [ ] VoiceOver (macOS/iOS): announcements for grab, move, drop
- [ ] NVDA (Windows): announcements for grab, move, drop
- [ ] Focus visible on drag handle
- [ ] Live region updates during drag

### Test Harness Addition

Add to `/src/app/test/item-manager/page.tsx`:

```tsx
<section className="mt-8 p-4 border rounded">
  <h2 className="text-lg font-bold mb-4">Drag-and-Drop Reordering</h2>
  <SortableAssetList
    assets={testAssets}
    onReorder={(from, to) => {
      console.log(`=== REORDER: ${from} -> ${to} ===`);
      // Update local state for testing
    }}
    onRemove={(id) => console.log('Remove:', id)}
  />
  <p className="mt-2 text-sm text-gray-500">
    Drag the grip handle to reorder. Use keyboard: Tab to handle,
    Space to grab, Arrows to move, Space to drop.
  </p>
</section>
```

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| iOS Safari DnD limitations | High | High | Use @dnd-kit with TouchSensor; test early |
| Bundle size increase (~20KB) | Medium | Low | Tree-shaking; acceptable for UX improvement |
| Keyboard accessibility gaps | Medium | High | Use @dnd-kit KeyboardSensor; thorough a11y testing |
| Touch scroll interference | Medium | Medium | Use `touch-none` on handle; long-press activation |
| Performance with many items | Low | Medium | Limit to reasonable count; virtual scroll for V2 |
| Animation jank | Low | Medium | Use CSS transforms via dnd-kit; avoid layout shifts |

---

## Implementation Steps

1. **Install Dependencies**
   ```bash
   npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @dnd-kit/modifiers
   ```

2. **Create SortableAssetList Component**
   - Set up DndContext with sensors
   - Configure SortableContext with vertical strategy
   - Implement DragOverlay for smooth drag feedback

3. **Update AssetItem Component**
   - Add `showDragHandle`, `dragHandleProps`, `isDragging` props
   - Render GripVertical icon when showDragHandle is true
   - Apply dragging styles when isDragging is true

4. **Create SortableAssetItem Wrapper**
   - Use useSortable hook to get transform/transition
   - Pass listeners to drag handle
   - Apply CSS transform styles

5. **Integrate with AssetPanel**
   - Replace plain list with SortableAssetList
   - Connect onReorder to useAssetManagement's reorderAssets

6. **Add Keyboard Navigation**
   - Configure KeyboardSensor in useSensors
   - Test Arrow key navigation

7. **Add Accessibility Announcements**
   - Configure announcements prop on DndContext
   - Test with screen readers

8. **Test Cross-Device**
   - Verify iOS Safari, Android Chrome
   - Verify desktop browsers
   - Verify keyboard-only navigation

---

## References

- [Implementation Plan - Phase 5 Task 5.5](/docs/prd/item-capture-manager-implementation-plan.md#phase-5-asset-management-estimated-3-4-days)
- [REQ-082 AssetItem Component](/docs/REQ-082-implement-assetitem-component-overview.md)
- [REQ-080 useAssetManagement Hook](/docs/REQ-080-create-useassetmanagement-hook-overview.md)
- [REQ-050 ReviewStep (drag-drop discussion)](/docs/REQ-050-implement-reviewstep-overview.md)
- [@dnd-kit Documentation](https://docs.dndkit.com/)
- [@dnd-kit GitHub](https://github.com/clauderic/dnd-kit)
- [WCAG 2.1 Reorder Guidelines](https://www.w3.org/WAI/tutorials/forms/multi-page/#reordering-items)
- [REQ-084 in gen_requests.md](/docs/gen_requests.md)

---

## Document History

| Date | Author | Changes |
|------|--------|---------|
| 2026-01-03 | Tech Lead Agent | Initial document creation |
