# REQ-108: Multi-Content Item Support - Implementation Breakdown

**Document Created:** 2026-01-05 15:23 UTC
**Last Modified:** 2026-01-05 15:23 UTC
**Request Reference:** docs/gen_requests.md - REQ-108
**Implementation Plan Reference:** docs/prd/Plan-093-Item-Creation-Workflow.md (Phase 5, Task 5.2)
**Phase:** 5 - Session Flow & Multi-Item
**Task ID:** 5.2
**Size:** L (Large)

---

## Executive Summary

This implementation enables users to add multiple content pieces to a single item, reorder those pieces via drag-and-drop, and remove individual pieces. The feature builds upon the existing ItemCreationWorkflow infrastructure, which already has:

1. **State management actions** (`ADD_CONTENT_PIECE`, `REMOVE_CONTENT_PIECE`, `REORDER_CONTENT`) - fully implemented in `useWorkflowState.ts`
2. **Add More to Item flow** - implemented in `NextActionStep.tsx` via `ADD_MORE_TO_ITEM` action
3. **ContentPieceCard component** - displays individual content previews with remove/retake actions
4. **Proven @dnd-kit pattern** - exists in `SortableAssetList.tsx` for asset reordering

The primary work involves integrating @dnd-kit into `PreviewSaveStep.tsx` and enhancing `ContentPieceCard.tsx` with drag capabilities.

---

## Current Implementation Status

### Already Implemented

| Component | Status | Location | Notes |
|-----------|--------|----------|-------|
| `REORDER_CONTENT` action | Complete | `useWorkflowState.ts:359-392` | Handles index validation, splice, and order property updates |
| `ADD_CONTENT_PIECE` action | Complete | `useWorkflowState.ts:325-340` | Appends to content array |
| `REMOVE_CONTENT_PIECE` action | Complete | `useWorkflowState.ts:342-357` | Filters by ID |
| `ADD_MORE_TO_ITEM` action | Complete | `useWorkflowState.ts:440-456` | Restores saved item for adding content |
| `ContentPieceCard` | Complete | `components/shared/ContentPieceCard.tsx` | Preview, remove, retake buttons |
| `NextActionStep` | Complete | `components/steps/NextActionStep.tsx` | "Add More" option routes properly |
| `PreviewSaveStep` | Partial | `components/steps/PreviewSaveStep.tsx` | Has `onReorderContent` prop but no drag UI |

### Missing Implementation

| Feature | Priority | Effort |
|---------|----------|--------|
| Wrap content grid with `DndContext` and `SortableContext` | High | Medium |
| Create `SortableContentPieceCard` wrapper component | High | Medium |
| Add drag handle to `ContentPieceCard` | High | Low |
| Implement drag event handlers in `PreviewSaveStep` | High | Medium |
| Add `DragOverlay` for visual feedback | Medium | Low |
| Add accessibility announcements for drag | Medium | Medium |
| Content counter with max limit display | Medium | Low |
| Last-piece removal confirmation | Low | Low |

---

## Technical Approach

### Architecture Decision

**Chosen Pattern:** Follow the existing `SortableAssetList.tsx` implementation from ItemManager.

This decision ensures:
- Consistent UX across the application
- Proven pattern with accessibility, touch, and keyboard support
- Minimal learning curve for developers
- Reuse of existing @dnd-kit dependency (already installed)

### Component Hierarchy After Implementation

```
PreviewSaveStep.tsx
├── ItemNameEditor (existing)
├── Content Section
│   └── DndContext (new)
│       └── SortableContext (new)
│           ├── SortableContentPieceCard (new wrapper)
│           │   └── ContentPieceCard (existing, enhanced)
│           ├── SortableContentPieceCard
│           └── ...
│       └── DragOverlay (new)
├── Content Counter (new)
└── Save Button (existing)
```

### State Flow for Reordering

```
User drags card from position 0 to position 2
         │
         ▼
handleDragEnd extracts { active.id, over.id }
         │
         ▼
Find indices: fromIndex = 0, toIndex = 2
         │
         ▼
onReorderContent(0, 2) called
         │
         ▼
dispatch({ type: 'REORDER_CONTENT', payload: { fromIndex: 0, toIndex: 2 } })
         │
         ▼
Reducer:
  1. Splice content array
  2. Update order property on each piece
  3. Return new state with reorderedContent
         │
         ▼
React re-renders with updated order
```

---

## Detailed Task Breakdown

### Task 1: Create SortableContentPieceCard Wrapper Component

**File:** `src/components/ItemCreationWorkflow/components/shared/SortableContentPieceCard.tsx`

**Purpose:** Wraps ContentPieceCard with @dnd-kit's `useSortable` hook to enable drag-and-drop.

**Implementation Details:**

```typescript
// Interface
interface SortableContentPieceCardProps {
  content: ContentPiece;
  id: string;
  onRemove?: (id: string) => void;
  onRetake?: (id: string) => void;
  disabled?: boolean;
  isDragging?: boolean;
  totalCount: number;
}

// Key patterns from SortableAssetItem:
// - useSortable({ id, disabled })
// - CSS.Transform.toString(transform)
// - opacity: isDragging ? 0.5 : 1
// - Pass listeners to drag handle
```

**Acceptance Criteria:**
- [ ] Component wraps ContentPieceCard
- [ ] Uses `useSortable` hook correctly
- [ ] Applies transform and transition styles
- [ ] Reduces opacity when dragging
- [ ] Passes drag handle props to ContentPieceCard

---

### Task 2: Add Drag Handle to ContentPieceCard

**File:** `src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx`

**Changes Required:**

1. Add new props to interface:
   ```typescript
   interface ContentPieceCardProps {
     // ... existing props
     showDragHandle?: boolean;
     dragHandleProps?: Record<string, unknown>;
     isDragging?: boolean;
   }
   ```

2. Add drag handle icon (top-right, visible when `showDragHandle` is true):
   ```typescript
   import { GripVertical } from 'lucide-react';

   {showDragHandle && (
     <button
       {...dragHandleProps}
       className="absolute top-1 right-1 p-1.5 bg-white/90 rounded cursor-grab
                  active:cursor-grabbing touch-none min-w-[44px] min-h-[44px]
                  flex items-center justify-center"
       aria-label="Drag to reorder"
     >
       <GripVertical className="w-4 h-4 text-gray-600" />
     </button>
   )}
   ```

3. Apply visual feedback for drag state:
   - Ring effect when being dragged
   - Scale slightly on hover for drag affordance

**Acceptance Criteria:**
- [ ] Drag handle appears when `showDragHandle` is true
- [ ] Drag handle has 44x44px touch target
- [ ] Cursor changes to grab/grabbing appropriately
- [ ] Keyboard accessible (can be focused)

---

### Task 3: Integrate @dnd-kit into PreviewSaveStep

**File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

**Implementation Steps:**

1. **Add imports:**
   ```typescript
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
     rectSortingStrategy, // For grid layout (vs verticalListSortingStrategy)
   } from '@dnd-kit/sortable';
   import {
     restrictToParentElement,
   } from '@dnd-kit/modifiers';
   ```

2. **Configure sensors (following SortableAssetList pattern):**
   ```typescript
   const sensors = useSensors(
     useSensor(PointerSensor, {
       activationConstraint: { distance: 8 },
     }),
     useSensor(TouchSensor, {
       activationConstraint: { delay: 250, tolerance: 5 },
     }),
     useSensor(KeyboardSensor, {
       coordinateGetter: sortableKeyboardCoordinates,
     })
   );
   ```

3. **Add state for active drag ID:**
   ```typescript
   const [activeId, setActiveId] = useState<string | null>(null);
   ```

4. **Implement drag event handlers:**
   ```typescript
   const handleDragStart = (event: DragStartEvent) => {
     setActiveId(event.active.id as string);
   };

   const handleDragEnd = (event: DragEndEvent) => {
     const { active, over } = event;
     setActiveId(null);

     if (!over || active.id === over.id) return;

     const oldIndex = currentItem.content.findIndex(c => c.id === active.id);
     const newIndex = currentItem.content.findIndex(c => c.id === over.id);

     if (oldIndex >= 0 && newIndex >= 0) {
       onReorderContent(oldIndex, newIndex);
     }
   };
   ```

5. **Wrap content grid with DndContext and SortableContext:**
   ```typescript
   <DndContext
     sensors={sensors}
     collisionDetection={closestCenter}
     onDragStart={handleDragStart}
     onDragEnd={handleDragEnd}
     modifiers={[restrictToParentElement]}
   >
     <SortableContext
       items={currentItem.content.map(c => c.id)}
       strategy={rectSortingStrategy}
     >
       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
         {currentItem.content.map((piece) => (
           <SortableContentPieceCard
             key={piece.id}
             id={piece.id}
             content={piece}
             onRemove={onRemoveContent}
             onRetake={() => onRetake()}
             disabled={isSaving}
             totalCount={currentItem.content.length}
           />
         ))}
       </div>
     </SortableContext>

     <DragOverlay>
       {activeId && activeContent && (
         <ContentPieceCard
           content={activeContent}
           className="shadow-xl ring-2 ring-[#FF385C] rotate-2"
         />
       )}
     </DragOverlay>
   </DndContext>
   ```

**Note:** Using `rectSortingStrategy` for grid layout instead of `verticalListSortingStrategy`.

**Acceptance Criteria:**
- [ ] Content pieces can be dragged and dropped to reorder
- [ ] Drag works with mouse, touch (long-press), and keyboard
- [ ] Visual feedback during drag (opacity, overlay)
- [ ] Order updates correctly in state
- [ ] Reordering disabled when saving

---

### Task 4: Add Accessibility Announcements

**File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

**Implementation:**

```typescript
const announcements = useMemo(() => ({
  onDragStart({ active }) {
    const piece = currentItem.content.find(c => c.id === active.id);
    const position = currentItem.content.findIndex(c => c.id === active.id) + 1;
    const name = piece ? `${piece.type} content` : 'content piece';
    return `Picked up ${name}. Current position: ${position} of ${currentItem.content.length}. Use arrow keys to move.`;
  },
  onDragOver({ over }) {
    if (over) {
      const position = currentItem.content.findIndex(c => c.id === over.id) + 1;
      return `Over position ${position}`;
    }
    return undefined;
  },
  onDragEnd({ active, over }) {
    if (over && active.id !== over.id) {
      const newPosition = currentItem.content.findIndex(c => c.id === over.id) + 1;
      return `Dropped. New position: ${newPosition} of ${currentItem.content.length}`;
    }
    return 'Position unchanged.';
  },
  onDragCancel() {
    return 'Drag cancelled. Content returned to original position.';
  },
}), [currentItem.content]);

// Add to DndContext:
<DndContext
  accessibility={{ announcements }}
  // ... other props
>
```

**Acceptance Criteria:**
- [ ] Screen readers announce drag start, position changes, and drop
- [ ] Announcements include content type and position numbers
- [ ] Cancel and unchanged states announced correctly

---

### Task 5: Add Content Counter with Max Limit Display

**File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

**Implementation:**

```typescript
const MAX_CONTENT_PIECES = 10;
const contentCount = currentItem.content.length;
const canAddMore = contentCount < MAX_CONTENT_PIECES;

// In the content section header:
<div className="flex items-center justify-between mb-4">
  <h3 className="text-lg font-medium text-[#222222]">
    Content ({contentCount} of {MAX_CONTENT_PIECES} pieces)
  </h3>
  {contentCount >= MAX_CONTENT_PIECES && (
    <span className="text-sm text-amber-600">Maximum reached</span>
  )}
</div>
```

**Also update `constants.ts`:**
```typescript
export const MAX_CONTENT_PIECES = 10;
```

**Acceptance Criteria:**
- [ ] Counter shows "X of 10 pieces"
- [ ] "Maximum reached" message when at limit
- [ ] Constant defined in utils/constants.ts for reuse

---

### Task 6: Add Last-Piece Removal Confirmation

**File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

**Implementation:**

Add confirmation state and dialog:

```typescript
const [pieceToRemove, setPieceToRemove] = useState<string | null>(null);

const handleRemoveClick = (contentId: string) => {
  if (currentItem.content.length === 1) {
    // Show confirmation for last piece
    setPieceToRemove(contentId);
  } else {
    onRemoveContent(contentId);
  }
};

const handleConfirmRemove = () => {
  if (pieceToRemove) {
    onRemoveContent(pieceToRemove);
    setPieceToRemove(null);
  }
};

// Dialog component (reuse pattern from AssetRemoveConfirmDialog)
{pieceToRemove && currentItem.content.length === 1 && (
  <ConfirmDialog
    isOpen={true}
    title="Remove Last Content?"
    message="This is the last piece of content. Removing it will leave this item empty. Are you sure?"
    onConfirm={handleConfirmRemove}
    onCancel={() => setPieceToRemove(null)}
    confirmLabel="Remove"
    cancelLabel="Keep"
  />
)}
```

**Acceptance Criteria:**
- [ ] Confirmation dialog appears only when removing the last piece
- [ ] Dialog clearly explains the consequence
- [ ] User can confirm or cancel
- [ ] Non-last pieces removed immediately without dialog

---

### Task 7: Enforce Max Content Limit in State

**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`

**Update `ADD_CONTENT_PIECE` action:**

```typescript
case 'ADD_CONTENT_PIECE': {
  if (!state.currentItem) return state;

  const MAX_CONTENT_PIECES = 10;
  if (state.currentItem.content.length >= MAX_CONTENT_PIECES) {
    // Silently reject - UI should prevent this case
    return state;
  }

  const updatedItem: CurrentItemState = {
    ...state.currentItem,
    content: [...state.currentItem.content, action.payload],
  };
  return {
    ...state,
    currentItem: updatedItem,
    isDirty: true,
    session: {
      ...state.session,
      currentItem: updatedItem,
    },
  };
}
```

**Also update `NextActionStep.tsx` to hide "Add More" when at limit:**

```typescript
// In NextActionStep, check content count
const contentCount = lastItem?.content.length ?? 0;
const canAddMore = contentCount < MAX_CONTENT_PIECES;

// Conditionally render "Add More" option
{canAddMore && (
  <ActionCard title="Add More Content" ... />
)}
```

**Acceptance Criteria:**
- [ ] State rejects additions beyond 10 pieces
- [ ] "Add More" option hidden when at limit
- [ ] Clear feedback to user when limit reached

---

### Task 8: Update Barrel Exports

**File:** `src/components/ItemCreationWorkflow/components/shared/index.ts`

**Add new export:**

```typescript
export { SortableContentPieceCard } from './SortableContentPieceCard';
```

**Acceptance Criteria:**
- [ ] New component exported from barrel file
- [ ] No circular dependency issues

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/components/shared/SortableContentPieceCard.tsx` | New sortable wrapper component |

### Files to Modify

| File Path | Functions/Sections to Modify |
|-----------|------------------------------|
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | Add DndContext, SortableContext, drag handlers, announcements, content counter, removal confirmation |
| `src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx` | Add `showDragHandle`, `dragHandleProps`, `isDragging` props and drag handle UI |
| `src/components/ItemCreationWorkflow/components/shared/index.ts` | Add SortableContentPieceCard export |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | Update `ADD_CONTENT_PIECE` to enforce max limit |
| `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` | Conditionally hide "Add More" when at limit |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | Add `MAX_CONTENT_PIECES` constant |

### Files for Reference Only (Do Not Modify)

| File Path | Reason |
|-----------|--------|
| `src/components/ItemManager/components/AssetPanel/SortableAssetList.tsx` | Pattern reference for @dnd-kit implementation |
| `src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx` | Pattern reference for confirmation dialog |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Type definitions (no changes needed) |

---

## Dependencies

### Package Dependencies (Already Installed)

| Package | Version | Purpose |
|---------|---------|---------|
| `@dnd-kit/core` | ^6.3.1 | Core drag-and-drop functionality |
| `@dnd-kit/sortable` | ^10.0.0 | Sortable primitives and strategies |
| `@dnd-kit/modifiers` | ^9.0.0 | Movement restriction modifiers |
| `@dnd-kit/utilities` | ^3.2.2 | CSS transform helpers |

### Internal Dependencies

| Dependency | Required By |
|------------|-------------|
| `useWorkflowState` hook | PreviewSaveStep (already integrated) |
| `ContentPieceCard` component | SortableContentPieceCard wrapper |
| Lucide `GripVertical` icon | ContentPieceCard drag handle |

---

## Testing Considerations

### Unit Tests

1. **SortableContentPieceCard:**
   - Renders ContentPieceCard correctly
   - Applies drag transform styles
   - Changes opacity when dragging

2. **ContentPieceCard with drag handle:**
   - Renders drag handle when `showDragHandle` is true
   - Hides drag handle when `showDragHandle` is false
   - Drag handle has correct accessibility attributes

3. **useWorkflowState REORDER_CONTENT:**
   - Already has tests - verify no regression
   - Test boundary conditions (same index, invalid indices)

4. **MAX_CONTENT_PIECES enforcement:**
   - State rejects 11th piece
   - State accepts 10th piece

### Integration Tests

1. **Drag and drop in PreviewSaveStep:**
   - Content reorders correctly after drag
   - Order persists after save
   - Works with single content piece (no drag needed)

2. **Multi-content flow:**
   - Add more → content source → creation → preview shows all pieces
   - Remove piece → count updates
   - At limit → "Add More" option hidden

### Accessibility Tests

1. **Keyboard navigation:**
   - Tab to drag handle
   - Space to pick up
   - Arrow keys to move
   - Space to drop

2. **Screen reader:**
   - Announcements fire correctly
   - Position information accurate

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Grid sorting strategy differs from list | Medium | Low | Use `rectSortingStrategy` from @dnd-kit, test thoroughly |
| Touch drag conflicts with scroll | Medium | Medium | Long-press activation (250ms) already implemented in sensors |
| Order property sync issues | Low | Medium | Reducer already updates order property on reorder |
| Performance with 10+ content pieces | Low | Low | React memo, useMemo for expensive calculations |

---

## Implementation Order

1. **Task 8:** Update barrel exports (prepare for new component)
2. **Task 2:** Add drag handle to ContentPieceCard
3. **Task 1:** Create SortableContentPieceCard wrapper
4. **Task 3:** Integrate @dnd-kit into PreviewSaveStep
5. **Task 4:** Add accessibility announcements
6. **Task 5:** Add content counter with max limit
7. **Task 7:** Enforce max limit in state + hide "Add More" option
8. **Task 6:** Add last-piece removal confirmation

---

## Acceptance Criteria Checklist (from REQ-108)

- [ ] Users selecting "Add More to Item" from the next action step are routed to the content source selection with the current item preserved
- [ ] Preview step displays all existing content pieces in their current order
- [ ] Users can drag and drop content pieces using intuitive touch or mouse interactions to reorder them
- [ ] Each content piece displays a remove button that deletes only that specific piece
- [ ] Content counter displays current count and maximum limit (e.g., "3 of 10 pieces")
- [ ] System prevents adding more than 10 content pieces to a single item with a clear error message
- [ ] Reordering content updates the order property of each content piece to maintain sort stability
- [ ] Removing a content piece triggers a confirmation if it's the last remaining piece
- [ ] All drag-and-drop interactions are keyboard accessible for users who cannot use a mouse
- [ ] Content piece order is preserved when saving the item and displayed consistently in all views

---

## References

- [Implementation Plan: Item Creation Workflow](./prd/Plan-093-Item-Creation-Workflow.md) - Phase 5, Task 5.2
- [REQ-084: Add Drag and Drop Reordering](./REQ-084-add-drag-and-drop-reordering-detailed.md) - Pattern reference
- [SortableAssetList.tsx](../src/components/ItemManager/components/AssetPanel/SortableAssetList.tsx) - Implementation reference
- [@dnd-kit Documentation](https://dndkit.com/) - Library documentation
