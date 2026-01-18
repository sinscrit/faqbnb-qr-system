# REQ-169: Update Content Display with Grid Layout and Reordering - Implementation Overview

**Created:** 2026-01-09 23:15 UTC
**Last Modified:** 2026-01-09 23:15 UTC
**Request ID:** REQ-169
**Type:** ENHANCEMENT
**Size:** M
**Phase:** 5 - Redesign Review Screen
**Task ID:** 5.3
**Implementation Plan Reference:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`

---

## 1. Summary

Update the content display in the PreviewSaveStep component to use the shared ContentPreview component for rendering each content piece in a responsive grid layout. Add visible drag handles for reordering, individual remove buttons on each piece, and ensure the empty state only appears when the content collection truly contains zero items.

---

## 2. Current State Analysis

### 2.1 Existing Implementation

**Location:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

The current PreviewSaveStep already implements most of the required functionality:

**What Already Exists:**
1. **Grid Layout**: Content displays in a responsive grid (`grid-cols-2 sm:grid-cols-3 md:grid-cols-4`)
2. **Drag-and-Drop**: Uses `@dnd-kit/core` with `SortableContext` for reordering
3. **Drag Handles**: `SortableContentPieceCard` shows `GripVertical` icon as drag handle (when `totalCount > 1`)
4. **Remove Buttons**: Each card has a remove button via `ContentPieceCard` (appears on hover)
5. **Empty State**: `EmptyContentState` component displays when `content.length === 0`
6. **Content Previews**: Type-specific rendering via sub-components in `ContentPieceCard`

**Components Used:**
- `SortableContentPieceCard` - Wrapper with drag-and-drop via `useSortable` hook
- `ContentPieceCard` - Renders content preview with type badge, drag handle, and action buttons
- `EmptyContentState` - Shows when no content exists
- `DndContext`, `SortableContext` from `@dnd-kit/core`/`@dnd-kit/sortable`

### 2.2 Gap Analysis

Comparing existing implementation to REQ-169 acceptance criteria:

| Requirement | Current State | Gap |
|-------------|---------------|-----|
| Use ContentPreview for each content piece | Uses `ContentPieceCard` with internal preview sub-components | Should use shared `ContentPreview` component (Task 5.1) |
| Responsive grid layout | ✅ Already implemented (`grid-cols-2 sm:grid-cols-3 md:grid-cols-4`) | None |
| Visible drag handle for reordering | ✅ Drag handle shows when `totalCount > 1`, positioned top-right | May want always-visible handle |
| Drag-and-drop reordering | ✅ Fully implemented with `@dnd-kit` | None |
| Remove button on each piece | ✅ Remove button appears on hover (bottom center) | Consider making always visible |
| Empty state only when truly empty | ✅ Only shows when `content.length === 0` | None |
| Immediate state updates | ✅ `onReorderContent` and `onRemoveContent` callbacks | None |
| Visual consistency across types | ✅ Type-specific previews with color-coded badges | None |

### 2.3 Key Implementation Details

**Current ContentPieceCard Structure:**
```typescript
// Existing type configuration
const TYPE_CONFIG = {
  video: { icon: Video, color: 'bg-purple-100 text-purple-700', label: 'Video' },
  photo: { icon: Image, color: 'bg-blue-100 text-blue-700', label: 'Photo' },
  pdf: { icon: FileText, color: 'bg-amber-100 text-amber-700', label: 'PDF' },
  text: { icon: Type, color: 'bg-green-100 text-green-700', label: 'Text' },
  url: { icon: Link, color: 'bg-indigo-100 text-indigo-700', label: 'Link' },
};
```

**Current Drag Handle Visibility Logic:**
```typescript
// In SortableContentPieceCard
const showDragHandle = totalCount > 1 && !disabled;
```

**Current Action Button Visibility:**
```typescript
// In ContentPieceCard - appears on hover
<div className="... opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
  {/* Remove and Retake buttons */}
</div>
```

---

## 3. Implementation Approach

### 3.1 Strategy Decision

**Option A: Refactor to Use ContentPreview Component (Recommended)**
- Replace internal preview rendering in `ContentPieceCard` with `ContentPreview` component
- Maintains separation of concerns
- Allows `ContentPreview` to be reused elsewhere
- Requires Task 5.1 (ContentPreview component) to be completed first

**Option B: Enhance Existing ContentPieceCard**
- Update drag handle and remove button visibility
- Keep existing preview rendering
- Can be done immediately without Task 5.1 dependency

**Recommendation:** Implement Option B as an interim solution, then update to Option A once Task 5.1 is complete.

### 3.2 Changes Required

1. **Always-Visible Drag Handle**: Make drag handle always visible (not just when count > 1)
2. **Always-Visible Remove Button**: Consider making remove button always visible instead of hover-only
3. **ContentPreview Integration**: Once Task 5.1 is complete, use ContentPreview inside ContentPieceCard

---

## 4. Implementation Tasks

### Task 5.3.1: Evaluate and Update Drag Handle Visibility

**Description:** Review the drag handle visibility logic to ensure users can clearly see and use drag handles for reordering.

**Current Logic in `SortableContentPieceCard.tsx` (line 74):**
```typescript
const showDragHandle = totalCount > 1 && !disabled;
```

**Proposed Change:** Keep current logic - drag handles only make sense when there are multiple items to reorder.

**Alternative:** Always show drag handle with reduced opacity when single item, full opacity when multiple items.

**Acceptance Criteria:**
- [ ] Drag handle is clearly visible when multiple content pieces exist
- [ ] Drag handle meets 44x44px minimum touch target size
- [ ] Users can identify the drag handle as the means to reorder

---

### Task 5.3.2: Evaluate and Update Remove Button Visibility

**Description:** Review the remove button visibility to ensure users can easily remove individual content pieces.

**Current Logic in `ContentPieceCard.tsx` (line 320):**
```typescript
<div className="... opacity-0 group-hover:opacity-100 focus-within:opacity-100 ...">
  {/* Remove button */}
</div>
```

**Options:**
1. **Keep hover-only** (current): Cleaner look, but may not be mobile-friendly
2. **Always visible**: Easier access but may clutter the UI
3. **Always visible on mobile, hover on desktop**: Best of both worlds

**Recommendation:** Add a media query or always show on touch devices:
```typescript
// Desktop: hover to show
// Mobile: always visible
className={cn(
  'opacity-0 group-hover:opacity-100 focus-within:opacity-100',
  'md:opacity-0 md:group-hover:opacity-100',
  'touch-device:opacity-100'  // Tailwind touch detection
)}
```

**Acceptance Criteria:**
- [ ] Remove button is accessible on both desktop and mobile
- [ ] Remove button meets 44x44px minimum touch target size (currently 44x44)
- [ ] Remove button has clear visual affordance
- [ ] Clicking remove deletes that specific content piece

---

### Task 5.3.3: Integrate ContentPreview Component (Post Task 5.1)

**Description:** Once Task 5.1 (Create ContentPreview Component) is complete, refactor ContentPieceCard to use ContentPreview for rendering the preview content.

**Current Implementation (ContentPieceCard.tsx lines 256-270):**
```typescript
const renderContent = () => {
  switch (content.type) {
    case 'video':
      return <VideoPreview data={...} />;
    case 'photo':
      return <PhotoPreview data={...} />;
    // ... etc
  }
};
```

**Proposed Implementation:**
```typescript
import { ContentPreview } from './ContentPreview';

// In ContentPieceCard render:
<ContentPreview
  content={content}
  size="medium"
  showTypeBadge={false}  // Already showing badge separately
  className="w-full h-full"
/>
```

**Acceptance Criteria:**
- [ ] ContentPieceCard uses ContentPreview for rendering
- [ ] All content types (video, photo, PDF, text, URL) display correctly
- [ ] Preview quality matches or exceeds current implementation
- [ ] Loading states work correctly

---

### Task 5.3.4: Verify Grid Layout Responsiveness

**Description:** Confirm the existing grid layout meets all responsive requirements.

**Current Grid Configuration (PreviewSaveStep.tsx line 354-356):**
```typescript
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
```

**Breakpoints:**
| Viewport | Columns | Use Case |
|----------|---------|----------|
| < 640px (mobile) | 2 | Small phones |
| 640px - 767px (sm) | 3 | Large phones, small tablets |
| ≥ 768px (md+) | 4 | Tablets and desktop |

**Acceptance Criteria:**
- [ ] Grid displays correctly at 320px viewport width
- [ ] Grid adjusts columns appropriately at each breakpoint
- [ ] Content cards maintain aspect ratio across all sizes
- [ ] Gap between cards is consistent (currently 1rem / gap-4)

---

### Task 5.3.5: Verify Empty State Behavior

**Description:** Confirm the empty state only appears when the content collection truly contains zero items.

**Current Implementation (PreviewSaveStep.tsx line 338):**
```typescript
{currentItem.content.length === 0 ? (
  <EmptyContentState onAddContent={onRetake} />
) : (
  // Grid with content
)}
```

**Acceptance Criteria:**
- [ ] Empty state displays when `content.length === 0`
- [ ] Empty state does NOT display when any content exists
- [ ] Empty state provides clear CTA to add content
- [ ] Transition between empty and populated states is smooth

---

### Task 5.3.6: Add Confirmation for Last Content Piece Removal

**Description:** Verify the existing confirmation dialog works correctly when removing the last content piece.

**Current Implementation (PreviewSaveStep.tsx lines 167-168, 464-501):**
```typescript
const [pieceToRemove, setPieceToRemove] = useState<string | null>(null);
const isRemovingLastPiece = pieceToRemove !== null && currentItem.content.length === 1;

// Confirmation dialog renders when isRemovingLastPiece is true
```

**Acceptance Criteria:**
- [ ] Confirmation dialog appears when removing the last content piece
- [ ] Dialog clearly warns about leaving item empty
- [ ] "Keep" button cancels the removal
- [ ] "Remove" button confirms and removes the piece
- [ ] Dialog does NOT appear when removing non-last pieces

---

### Task 5.3.7: Accessibility Review

**Description:** Ensure all accessibility features are properly implemented for content reordering and removal.

**Current Accessibility Features:**
- `role="list"` and `role="listitem"` for content grid
- `aria-label="Content pieces - drag to reorder"` on grid container
- Screen reader announcements via `Announcements` interface in DndContext
- Focus management on drag operations

**Acceptance Criteria:**
- [ ] Screen readers announce content type for each piece
- [ ] Keyboard users can reorder content (Tab + arrow keys via dnd-kit)
- [ ] Drag start/end announcements are clear and informative
- [ ] Remove button has accessible label ("Remove content")
- [ ] Drag handle has accessible label ("Drag to reorder")

---

## 5. Authorized Files and Functions for Modification

### Files to MODIFY

| File Path | Functions/Sections | Change Description |
|-----------|-------------------|-------------------|
| `src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx` | Action button visibility | Update to always visible on mobile |
| `src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx` | `renderContent()` | Replace with ContentPreview (post Task 5.1) |
| `src/components/ItemCreationWorkflow/components/shared/SortableContentPieceCard.tsx` | `showDragHandle` logic | Review/update visibility logic if needed |
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | Grid container | Minor styling adjustments if needed |

### Files to READ (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | ContentPiece, ContentData types |
| `src/components/ItemCreationWorkflow/components/shared/index.ts` | Export patterns |
| `src/lib/utils.ts` | cn utility for className composition |
| `docs/REQ-167-create-contentpreview-component-overview.md` | ContentPreview component spec |
| `docs/REQ-168-redesign-previewsavestep-layout-overview.md` | Parent task context |

### Files NOT to MODIFY (Out of Scope)

| File Path | Reason |
|-----------|--------|
| `ItemCreationWorkflow.types.ts` | Types are stable, no changes needed |
| `useWorkflowState.ts` | State management is separate scope |
| `constants.ts` | No constant changes needed for this task |

---

## 6. Dependencies and Prerequisites

### Must Be Completed Before This Task

| Task ID | Title | Status | Notes |
|---------|-------|--------|-------|
| 5.1 | Create ContentPreview Component | Required | For Task 5.3.3 (ContentPreview integration) |
| 5.2 | Redesign PreviewSaveStep Layout | Required | Parent layout must be updated first |

**Note:** Tasks 5.3.1, 5.3.2, 5.3.4, 5.3.5, 5.3.6, 5.3.7 can be completed independently as they verify/enhance existing functionality.

### Integration Points

1. **With ContentPreview (Task 5.1):**
   - Once ContentPreview is available, integrate it into ContentPieceCard
   - Maintain existing action button overlay

2. **With PreviewSaveStep Layout (Task 5.2):**
   - Content grid is rendered within ContentSection sub-component
   - Changes to ContentPieceCard will be visible in PreviewSaveStep

---

## 7. Code Patterns to Follow

### 7.1 Responsive Visibility Pattern

For mobile-always/desktop-hover visibility:
```typescript
// Use Tailwind responsive modifiers
className={cn(
  'transition-opacity',
  // Mobile: always visible
  'opacity-100',
  // Desktop: hover to show
  'md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100'
)}
```

### 7.2 Touch Target Size Pattern

Ensure minimum 44x44px (preferably 48x48px) touch targets:
```typescript
<button
  className={cn(
    'min-w-[44px] min-h-[44px]',
    'flex items-center justify-center',
    // ... other styles
  )}
>
```

### 7.3 Accessibility Announcements Pattern

For drag-and-drop screen reader support (existing pattern):
```typescript
const announcements: Announcements = {
  onDragStart({ active }) {
    const piece = content.find(c => c.id === active.id);
    const position = content.findIndex(c => c.id === active.id) + 1;
    return `Picked up ${piece?.type} content. Position ${position} of ${content.length}.`;
  },
  onDragEnd({ active, over }) {
    if (over && active.id !== over.id) {
      const newPosition = content.findIndex(c => c.id === over.id) + 1;
      return `Dropped. New position: ${newPosition}`;
    }
    return 'Position unchanged.';
  },
};
```

---

## 8. Testing Requirements

### 8.1 Unit Tests

```typescript
describe('Content Display Grid Layout and Reordering', () => {
  describe('ContentPieceCard', () => {
    it('renders video content with play button and duration');
    it('renders photo content with thumbnail');
    it('renders PDF content with page count');
    it('renders text content with truncated preview');
    it('renders URL content with favicon and domain');
    it('shows drag handle when multiple items exist');
    it('hides drag handle for single item');
    it('shows remove button (visibility based on device)');
    it('calls onRemove when remove button clicked');
  });

  describe('SortableContentPieceCard', () => {
    it('applies transform styles during drag');
    it('reduces opacity when dragging');
    it('passes drag handle props to ContentPieceCard');
  });

  describe('PreviewSaveStep Content Grid', () => {
    it('renders grid with correct responsive columns');
    it('supports drag-and-drop reordering');
    it('updates order immediately on drop');
    it('shows empty state when no content');
    it('hides empty state when content exists');
    it('shows confirmation when removing last piece');
    it('removes content immediately for non-last pieces');
  });
});
```

### 8.2 Accessibility Tests

- [ ] Keyboard navigation through content grid (Tab)
- [ ] Keyboard-initiated drag-and-drop (Space/Enter + arrows)
- [ ] Screen reader announcements for drag operations
- [ ] Remove button announced correctly
- [ ] Drag handle announced correctly
- [ ] Content type announced for each piece

### 8.3 Visual/Manual Tests

- [ ] Grid layout at 320px width (2 columns)
- [ ] Grid layout at 640px width (3 columns)
- [ ] Grid layout at 768px+ width (4 columns)
- [ ] Drag handle visibility and usability
- [ ] Remove button accessibility on touch devices
- [ ] Smooth drag-and-drop animation
- [ ] Empty state appearance and CTA

---

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| ContentPreview not ready (Task 5.1) | Medium | Low | Use existing ContentPieceCard preview logic |
| Mobile touch target issues | Low | Medium | Ensure 44x44px minimum, test on real devices |
| Drag-and-drop performance | Low | Medium | @dnd-kit is already optimized |
| Accessibility regression | Low | High | Run automated tests, manual screen reader testing |
| Breaking existing functionality | Low | High | Incremental changes, thorough testing |

---

## 10. Estimated Effort

| Task | Estimate | Notes |
|------|----------|-------|
| 5.3.1 Drag Handle Visibility | 0.5 hours | Review/minor adjustment |
| 5.3.2 Remove Button Visibility | 1 hour | Add mobile-specific visibility |
| 5.3.3 ContentPreview Integration | 1 hour | Post Task 5.1, refactor |
| 5.3.4 Grid Responsiveness | 0.5 hours | Verification only |
| 5.3.5 Empty State Behavior | 0.25 hours | Verification only |
| 5.3.6 Last Piece Confirmation | 0.25 hours | Verification only |
| 5.3.7 Accessibility Review | 1 hour | Audit and fixes |
| **Total** | **4.5 hours** | ~0.5 day |

---

## 11. Success Criteria

1. ✅ Each content piece renders using ContentPreview component (or equivalent)
2. ✅ Content pieces arrange in responsive grid (2/3/4 columns)
3. ✅ Each content piece displays visible drag handle for reordering
4. ✅ Users can drag and drop content to change order
5. ✅ Each content piece includes clearly labeled remove button
6. ✅ Remove button deletes specific content piece from collection
7. ✅ Empty state appears ONLY when content collection has zero items
8. ✅ Grid displays all pieces without empty state when content exists
9. ✅ Reordering and removal update state immediately
10. ✅ Visual consistency across all content types (video, photo, PDF, text, URL)
11. ✅ All accessibility requirements met

---

## 12. Implementation Notes

### 12.1 Current Implementation Assessment

After analyzing the existing codebase, the current implementation already satisfies most of REQ-169's requirements:

| Requirement | Implementation Status |
|-------------|----------------------|
| ContentPreview for each piece | Partial - internal to ContentPieceCard |
| Responsive grid layout | ✅ Complete |
| Visible drag handle | ✅ Complete (when multiple items) |
| Drag-and-drop reordering | ✅ Complete |
| Remove button on each piece | ✅ Complete (hover visible) |
| Empty state only when empty | ✅ Complete |
| Immediate state updates | ✅ Complete |
| Visual consistency | ✅ Complete |

### 12.2 Recommended Actions

1. **High Priority:** Update remove button visibility for mobile devices
2. **Medium Priority:** Integrate ContentPreview once Task 5.1 complete
3. **Low Priority:** Minor accessibility improvements

### 12.3 Verification Approach

Given the high implementation completeness, this task primarily involves:
1. **Verification** that existing implementation meets requirements
2. **Minor enhancements** to mobile UX (remove button visibility)
3. **Future integration** with ContentPreview component

---

## 13. References

- **Request:** `/docs/gen_requests.md` - REQ-169
- **Implementation Plan:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md` - Task 5.3
- **Current Implementation:** `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
- **ContentPieceCard:** `/src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx`
- **SortableContentPieceCard:** `/src/components/ItemCreationWorkflow/components/shared/SortableContentPieceCard.tsx`
- **Related Tasks:**
  - REQ-167: Create ContentPreview Component (Task 5.1)
  - REQ-168: Redesign PreviewSaveStep Layout (Task 5.2)
  - REQ-170: Pre-populate Fields in Review Screen (Task 5.4)
