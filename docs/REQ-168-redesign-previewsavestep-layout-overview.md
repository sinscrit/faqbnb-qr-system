# REQ-168: Redesign PreviewSaveStep Layout - Implementation Overview

**Created:** 2026-01-09 23:45 UTC
**Last Modified:** 2026-01-09 23:45 UTC
**Request ID:** REQ-168
**Type:** ENHANCEMENT
**Size:** M
**Phase:** 5 - Redesign Review Screen
**Task ID:** 5.2
**Implementation Plan Reference:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`

---

## 1. Summary

Redesign the PreviewSaveStep component to display a clean, information-rich preview screen showing item details and content previews instead of large action buttons encouraging users to add more content. The redesigned layout will show pre-filled item metadata (title, room, item type, purpose) with an editable title field, actual content previews using ContentPreview component, and a small de-emphasized "+ Add More" link.

---

## 2. Current State Analysis

### 2.1 Current PreviewSaveStep Implementation

**Location:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

**Current Layout Structure:**
1. Header with back button and "Preview & Save" title
2. Item Name section with `ItemNameEditor` component
3. Content section showing grid of `SortableContentPieceCard` components with drag-and-drop reordering
4. "Retake / Replace All" button (prominent full-width)
5. Error display area
6. "Save Item" primary action button
7. Success overlay with QR code

**Issues to Address:**
- No display of Room, Item Type, or Purpose metadata (user selections)
- No auto-generated title display based on purpose (new Article model)
- The "Retake / Replace All" button is visually prominent (should be de-emphasized)
- Layout doesn't distinguish between "Item Details" and "Content" sections clearly
- Missing content count badge
- Missing small "+ Add More" link (currently using large "Retake / Replace All")

### 2.2 Current State Model

The `CurrentItemState` interface in `ItemCreationWorkflow.types.ts`:

```typescript
export interface CurrentItemState {
  room: RoomType;
  itemType: ItemType;
  specificItem: string;
  itemName: string;
  contentSource: 'existing' | 'create-new';
  contentType: ContentType | null;
  content: ContentPiece[];
}
```

**Note:** The `purpose` field is being added as part of Phase 1 (Task 1.1) and will need to be incorporated into the redesigned layout once available.

---

## 3. Implementation Requirements

### 3.1 From Request #168 Acceptance Criteria

- [ ] Large "Add Media" and "Add Link" buttons are completely removed from the screen
- [ ] Item Details section displays title (editable field), room (read-only), item type (read-only), and purpose (read-only)
- [ ] The auto-generated title can be edited inline by the user
- [ ] Content section displays actual previews of all content items using appropriate preview components
- [ ] A content count badge displays the total number of content items
- [ ] A small "+ Add More" link is available for adding additional content
- [ ] The "+ Add More" link is visually de-emphasized compared to primary actions
- [ ] The layout adapts responsively across mobile, tablet, and desktop viewports
- [ ] All content previews render correctly for different media types (video, photo, PDF, text, URL)

### 3.2 From Implementation Plan (Task 5.2)

- [ ] Remove large "Add Media" / "Add Link" buttons
- [ ] Show Item Details section with pre-filled data:
  - Title (auto-generated, editable)
  - Room (read-only, from selection)
  - Item Type (read-only, from selection)
  - Purpose (read-only, from selection)
- [ ] Show Content section with actual previews
- [ ] Add small "+ Add More" link (not large CTA)
- [ ] Show content count badge

---

## 4. Technical Design

### 4.1 New Layout Structure

```
┌─────────────────────────────────────────────┐
│  ← Back     Preview & Save                   │
├─────────────────────────────────────────────┤
│                                              │
│  ┌─ Item Details ─────────────────────────┐ │
│  │                                         │ │
│  │  Title (editable)                       │ │
│  │  ┌─────────────────────────────────┐   │ │
│  │  │ How to Clean - Kitchen Fridge   │   │ │
│  │  └─────────────────────────────────┘   │ │
│  │                                         │ │
│  │  Room          Kitchen                  │ │
│  │  Item Type     Appliance                │ │
│  │  Purpose       How to Clean             │ │
│  │                                         │ │
│  └─────────────────────────────────────────┘ │
│                                              │
│  ┌─ Content (3 pieces) ───────────────────┐ │
│  │                                         │ │
│  │  ┌───────┐ ┌───────┐ ┌───────┐         │ │
│  │  │ Video │ │ Photo │ │  PDF  │         │ │
│  │  │  ▶    │ │  📷   │ │  📄   │         │ │
│  │  └───────┘ └───────┘ └───────┘         │ │
│  │                                         │ │
│  │  + Add More                             │ │
│  │                                         │ │
│  └─────────────────────────────────────────┘ │
│                                              │
│  ┌─────────────────────────────────────────┐ │
│  │            ✓ Save Item                   │ │
│  └─────────────────────────────────────────┘ │
│                                              │
└─────────────────────────────────────────────┘
```

### 4.2 Component Architecture

```typescript
// New sub-components to extract/create within PreviewSaveStep.tsx

// 1. ItemDetailsSection - displays read-only metadata with editable title
interface ItemDetailsSectionProps {
  currentItem: CurrentItemState;
  onUpdateItemName: (name: string) => void;
  disabled?: boolean;
}

// 2. ContentSection - displays content previews with add more link
interface ContentSectionProps {
  content: ContentPiece[];
  onRemoveContent: (contentId: string) => void;
  onReorderContent: (fromIndex: number, toIndex: number) => void;
  onAddMore: () => void;
  maxContentPieces: number;
  disabled?: boolean;
}

// 3. ReadOnlyField - displays a label-value pair for read-only metadata
interface ReadOnlyFieldProps {
  label: string;
  value: string;
  className?: string;
}
```

### 4.3 Dependencies

**Required (Task 5.1 - Must be completed first):**
- `ContentPreview` component from `/components/shared/ContentPreview.tsx`
  - This component handles video, photo, PDF, text, and URL previews
  - Currently does NOT exist - Task 5.1 must create it

**Required (Task 1.1 - Foundation):**
- `purpose` field in `CurrentItemState` interface
- `PURPOSE_LABELS` constant for displaying purpose as readable text

**Existing Components to Reuse:**
- `ItemNameEditor` - for editable title field
- `SortableContentPieceCard` - for drag-and-drop content reordering
- `ContentPieceCard` - for static content display
- `cn` utility from `@/lib/utils` for class name composition

### 4.4 Constants Updates Required

```typescript
// In constants.ts - Add label lookup helpers (if not already present from Phase 1)

export const ROOM_LABELS: Record<RoomTypeConst, string> = {
  'kitchen': 'Kitchen',
  'laundry': 'Laundry Room',
  // ... (already exists)
};

export const ITEM_TYPE_LABELS: Record<ItemTypeConst, string> = {
  'appliance': 'Appliance',
  'room-item': 'Room Item',
  'general-info': 'General Info',
};

// NEW - Added by Task 1.1
export const PURPOSE_LABELS: Record<PurposeTypeConst, string> = {
  'how-to-use': 'How to Use',
  'how-to-clean': 'How to Clean',
  'troubleshooting': 'Troubleshooting',
  'safety-info': 'Safety Information',
  'maintenance': 'Maintenance',
  'features': 'Features & Tips',
  'other': 'Other',
};
```

---

## 5. Implementation Tasks

### Task 5.2.1: Create ReadOnlyField Sub-Component

**Description:** Create a reusable component for displaying read-only label-value pairs.

**Location:** Within `PreviewSaveStep.tsx` (or extract to shared if needed elsewhere)

**Implementation:**
```typescript
interface ReadOnlyFieldProps {
  label: string;
  value: string;
  className?: string;
}

function ReadOnlyField({ label, value, className }: ReadOnlyFieldProps) {
  return (
    <div className={cn('flex justify-between items-center py-2', className)}>
      <span className="text-sm text-[#717171]">{label}</span>
      <span className="text-sm font-medium text-[#222222]">{value}</span>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Displays label on the left, value on the right
- [ ] Uses consistent typography with design system
- [ ] Supports optional className prop for customization

---

### Task 5.2.2: Create ItemDetailsSection Sub-Component

**Description:** Create a section component that displays editable title and read-only metadata fields.

**Location:** Within `PreviewSaveStep.tsx`

**Implementation:**
```typescript
interface ItemDetailsSectionProps {
  currentItem: CurrentItemState;
  onUpdateItemName: (name: string) => void;
  disabled?: boolean;
}

function ItemDetailsSection({
  currentItem,
  onUpdateItemName,
  disabled
}: ItemDetailsSectionProps) {
  const roomLabel = ROOM_LABELS[currentItem.room] || currentItem.room;
  const itemTypeLabel = ITEM_TYPE_LABELS[currentItem.itemType] || currentItem.itemType;
  // Purpose label will come from PURPOSE_LABELS once purpose field is added
  const purposeLabel = currentItem.purpose
    ? PURPOSE_LABELS[currentItem.purpose]
    : 'Not specified';

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-[#222222] mb-4">Item Details</h3>

      {/* Editable Title */}
      <ItemNameEditor
        value={currentItem.itemName}
        onChange={onUpdateItemName}
        disabled={disabled}
        maxLength={100}
        placeholder="Enter item title"
      />

      {/* Read-only metadata */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <ReadOnlyField label="Room" value={roomLabel} />
        <ReadOnlyField label="Item Type" value={itemTypeLabel} />
        <ReadOnlyField label="Purpose" value={purposeLabel} />
      </div>
    </section>
  );
}
```

**Acceptance Criteria:**
- [ ] Displays editable title using ItemNameEditor component
- [ ] Shows Room as read-only with human-readable label
- [ ] Shows Item Type as read-only with human-readable label
- [ ] Shows Purpose as read-only with human-readable label (once purpose field is available)
- [ ] Visual separation between editable and read-only sections
- [ ] Disabled state propagates to title editor

---

### Task 5.2.3: Create ContentSection Sub-Component

**Description:** Create a section component that displays content previews with count badge and "+ Add More" link.

**Location:** Within `PreviewSaveStep.tsx`

**Implementation:**
```typescript
interface ContentSectionProps {
  content: ContentPiece[];
  onRemoveContent: (contentId: string) => void;
  onReorderContent: (fromIndex: number, toIndex: number) => void;
  onAddMore: () => void;
  maxContentPieces: number;
  disabled?: boolean;
}

function ContentSection({
  content,
  onRemoveContent,
  onReorderContent,
  onAddMore,
  maxContentPieces,
  disabled,
}: ContentSectionProps) {
  const contentCount = content.length;
  const canAddMore = contentCount < maxContentPieces;

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header with count badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium text-[#222222]">Content</h3>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
            {contentCount}
          </span>
        </div>
        {contentCount >= maxContentPieces && (
          <span className="text-sm text-amber-600 font-medium">
            Maximum reached
          </span>
        )}
      </div>

      {/* Content grid with previews */}
      {contentCount === 0 ? (
        <EmptyContentState onAddContent={onAddMore} />
      ) : (
        <DndContext /* ... drag and drop context ... */>
          <SortableContext items={content.map(c => c.id)} /* ... */>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {content.map((piece) => (
                <SortableContentPieceCard
                  key={piece.id}
                  id={piece.id}
                  content={piece}
                  onRemove={onRemoveContent}
                  disabled={disabled}
                  totalCount={contentCount}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Small "+ Add More" link */}
      {canAddMore && contentCount > 0 && (
        <button
          type="button"
          onClick={onAddMore}
          disabled={disabled}
          className={cn(
            'mt-4 text-sm text-[#FF385C] hover:text-[#E31C5F]',
            'focus:outline-none focus:underline',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'flex items-center gap-1'
          )}
        >
          <Plus className="w-4 h-4" />
          Add More
        </button>
      )}
    </section>
  );
}
```

**Acceptance Criteria:**
- [ ] Displays content count badge next to "Content" header
- [ ] Shows "Maximum reached" warning when at max content limit
- [ ] Renders content grid with `SortableContentPieceCard` components
- [ ] Shows empty state when no content exists
- [ ] Displays small "+ Add More" link (not large CTA button)
- [ ] "+ Add More" link is visually de-emphasized (small text, not button)
- [ ] "+ Add More" link hidden when at max content limit
- [ ] Supports drag-and-drop reordering
- [ ] Respects disabled state

---

### Task 5.2.4: Refactor PreviewSaveStep Main Component

**Description:** Refactor the main PreviewSaveStep component to use the new sub-components and remove the large "Retake / Replace All" button.

**Changes Required:**

1. **Remove the "Retake / Replace All" button section:**
   - Delete the entire block (~lines 386-404 in current implementation)

2. **Replace the "Item Name Section" with ItemDetailsSection:**
   - Replace the existing section that only shows ItemNameEditor
   - Use new ItemDetailsSection component instead

3. **Replace the "Content Section" with ContentSection:**
   - Pass `onAddMore` callback (mapped from `onRetake`)
   - Include the count badge in header

4. **Update component structure:**
```typescript
export function PreviewSaveStep({
  currentItem,
  onUpdateItemName,
  onRemoveContent,
  onReorderContent,
  onRetake,  // Now used for "+ Add More" link
  onSave,
  onCancel,
  onComplete,
  isSaving = false,
  className,
}: PreviewSaveStepProps) {
  // ... state and handlers ...

  return (
    <div className={cn('flex flex-col gap-6 p-6', className)}>
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <button onClick={onCancel} /* ... back button ... */ />
        <h2 className="text-xl font-semibold text-[#222222]">
          Preview & Save
        </h2>
      </div>

      {/* NEW: Item Details Section with metadata */}
      <ItemDetailsSection
        currentItem={currentItem}
        onUpdateItemName={onUpdateItemName}
        disabled={isSaving}
      />

      {/* NEW: Content Section with count badge and small add more link */}
      <ContentSection
        content={currentItem.content}
        onRemoveContent={handleRemoveClick}
        onReorderContent={onReorderContent}
        onAddMore={onRetake}
        maxContentPieces={MAX_CONTENT_PIECES}
        disabled={isSaving}
      />

      {/* REMOVED: "Retake / Replace All" button */}

      {/* Error Display */}
      {saveError && (/* ... error display ... */)}

      {/* Save Button */}
      <button onClick={handleSave} /* ... save button ... */ />

      {/* Success Overlay */}
      {showSuccess && savedResult && (/* ... success overlay ... */)}
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Large "Retake / Replace All" button is removed
- [ ] ItemDetailsSection displays all metadata fields
- [ ] ContentSection displays content with count badge
- [ ] Small "+ Add More" link replaces large button
- [ ] All existing functionality preserved (save, success overlay, errors)
- [ ] Drag-and-drop reordering still works
- [ ] Mobile responsive layout maintained

---

### Task 5.2.5: Update PropTypes and TypeScript Interfaces

**Description:** Ensure TypeScript types support the new layout requirements.

**Files to Check/Update:**
- `PreviewSaveStepProps` interface - may need purpose field once available
- Import `PURPOSE_LABELS` once Task 1.1 is complete

**Implementation:**
```typescript
// No immediate changes to PreviewSaveStepProps needed
// The currentItem prop already contains room, itemType, and will contain purpose

// Once Task 1.1 is complete, import PURPOSE_LABELS:
import {
  ROOM_LABELS,
  ITEM_TYPE_LABELS,
  PURPOSE_LABELS,  // Added by Task 1.1
  MAX_CONTENT_PIECES
} from '../../utils/constants';
```

**Acceptance Criteria:**
- [ ] TypeScript compiles without errors
- [ ] Props interface matches component requirements
- [ ] Constants are properly imported

---

### Task 5.2.6: Add Accessibility Attributes

**Description:** Ensure the redesigned layout maintains proper accessibility.

**Implementation:**
- Add proper `aria-labelledby` for sections
- Ensure read-only fields have appropriate roles
- Maintain focus management for "+ Add More" link
- Screen reader announcements for content count

**Acceptance Criteria:**
- [ ] Sections have proper heading hierarchy (h2 for main, h3 for sections)
- [ ] Read-only fields are properly labeled for screen readers
- [ ] Content count is announced via aria-live region
- [ ] "+ Add More" link is keyboard accessible
- [ ] Focus management works correctly during interactions

---

### Task 5.2.7: Responsive Layout Testing

**Description:** Verify the redesigned layout works across all viewport sizes.

**Test Cases:**
1. Mobile (320px - 480px)
   - Single column content grid
   - Readable metadata fields
   - Touch-friendly targets (48px minimum)
2. Tablet (481px - 768px)
   - 2-3 column content grid
   - Appropriate spacing
3. Desktop (769px+)
   - 3-4 column content grid
   - Efficient use of space

**Acceptance Criteria:**
- [ ] Layout renders correctly at 320px width
- [ ] Content grid adjusts columns based on viewport
- [ ] All touch targets meet 48px minimum
- [ ] No horizontal scrolling on mobile

---

## 6. Authorized Files and Functions for Modification

### Files to MODIFY

| File Path | Functions/Sections | Change Description |
|-----------|-------------------|-------------------|
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | `PreviewSaveStep` | Refactor to use new layout with ItemDetailsSection and ContentSection |
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | Add `ReadOnlyField` | Create new sub-component |
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | Add `ItemDetailsSection` | Create new sub-component |
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | Add `ContentSection` | Create new sub-component |
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | `EmptyContentState` | Keep existing, may need minor styling updates |

### Files to READ (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | CurrentItemState interface definition |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | ROOM_LABELS, ITEM_TYPE_LABELS, MAX_CONTENT_PIECES |
| `src/components/ItemCreationWorkflow/components/shared/ItemNameEditor.tsx` | Existing editable field pattern |
| `src/components/ItemCreationWorkflow/components/shared/SortableContentPieceCard.tsx` | Existing content card pattern |
| `src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx` | Content preview rendering |
| `docs/prd/Plan-094-UI-UX-Workflow-Improvements.md` | Implementation plan reference |

### Files NOT to Modify (Out of Scope)

| File Path | Reason |
|-----------|--------|
| `ItemCreationWorkflow.types.ts` | Types modification is Task 1.1 scope |
| `constants.ts` | Constants modification is Task 1.1 scope |
| `useWorkflowState.ts` | State machine modification is Task 1.3 scope |
| `ContentPreview.tsx` | New component is Task 5.1 scope (dependency) |

---

## 7. Dependencies and Prerequisites

### Must Be Completed Before This Task

| Task ID | Title | Status | Notes |
|---------|-------|--------|-------|
| 1.1 | Update Types and Constants | Required | Adds `purpose` field and `PURPOSE_LABELS` |
| 5.1 | Create ContentPreview Component | Required | Provides unified content preview component |

**Note:** Task 5.2 can begin implementation without Task 1.1/5.1 completed by:
- Using placeholder for purpose display (e.g., "Not specified" or hide row)
- Using existing `ContentPieceCard` instead of new `ContentPreview`
- Updating to use new components once dependencies are completed

### Integration Points

1. **With ContentPreview (Task 5.1):**
   - Once created, update ContentSection to use ContentPreview for better previews
   - Currently using SortableContentPieceCard which already has preview logic

2. **With Purpose Field (Task 1.1):**
   - Update ItemDetailsSection to display purpose once field is added
   - Import PURPOSE_LABELS from constants

3. **With Auto-Generated Title (Task 1.2):**
   - Title will be auto-generated based on purpose selection
   - PreviewSaveStep shows this title as editable

---

## 8. Testing Requirements

### Unit Tests

```typescript
describe('PreviewSaveStep', () => {
  describe('ItemDetailsSection', () => {
    it('renders editable title field');
    it('displays room label correctly');
    it('displays item type label correctly');
    it('displays purpose label when available');
    it('shows "Not specified" when purpose is null');
    it('propagates disabled state to title editor');
  });

  describe('ContentSection', () => {
    it('renders content count badge with correct number');
    it('shows maximum reached warning at limit');
    it('displays empty state when no content');
    it('renders "+ Add More" link when under limit');
    it('hides "+ Add More" link when at limit');
    it('calls onAddMore when link is clicked');
  });

  describe('Layout', () => {
    it('does not render "Retake / Replace All" button');
    it('renders Item Details section before Content section');
    it('maintains drag-and-drop functionality');
  });
});
```

### Accessibility Tests

- Verify heading hierarchy with automated tools
- Test keyboard navigation through all interactive elements
- Verify screen reader announcements for content count changes

### Visual/Manual Tests

- Test on mobile, tablet, and desktop viewports
- Verify touch targets on mobile
- Check visual hierarchy and spacing
- Verify empty state appearance

---

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Purpose field not yet available | High | Low | Use placeholder display, update once Task 1.1 complete |
| Breaking existing drag-and-drop | Medium | High | Reuse existing DndContext logic unchanged |
| Mobile layout issues | Medium | Medium | Test on real devices, use existing responsive patterns |
| Accessibility regression | Low | High | Run automated a11y tests, manual screen reader testing |

---

## 10. Estimated Effort

| Task | Estimate | Notes |
|------|----------|-------|
| 5.2.1 ReadOnlyField | 0.5 hours | Simple presentational component |
| 5.2.2 ItemDetailsSection | 1 hour | Integrates existing ItemNameEditor |
| 5.2.3 ContentSection | 2 hours | Complex with drag-drop reuse |
| 5.2.4 Refactor Main Component | 1.5 hours | Wiring sub-components together |
| 5.2.5 TypeScript Updates | 0.5 hours | Import changes, type checking |
| 5.2.6 Accessibility | 0.5 hours | Aria attributes and testing |
| 5.2.7 Responsive Testing | 1 hour | Cross-device verification |
| **Total** | **7 hours** | ~1 day |

---

## 11. Success Criteria

1. ✅ Large "Add Media" / "Add Link" buttons are removed
2. ✅ Item Details section shows title (editable), room, item type, purpose (read-only)
3. ✅ Auto-generated title is editable by user
4. ✅ Content section shows actual content previews
5. ✅ Content count badge displays total pieces
6. ✅ Small "+ Add More" link available (not large CTA)
7. ✅ Layout adapts responsively to all viewport sizes
8. ✅ All existing functionality preserved (save, drag-drop, remove, etc.)
9. ✅ Accessibility requirements maintained
10. ✅ TypeScript compiles without errors

---

## 12. References

- **Request:** `/docs/gen_requests.md` - REQ-168
- **Implementation Plan:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md` - Task 5.2
- **Current Implementation:** `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
- **Component Patterns:** `/src/components/ItemCreationWorkflow/components/shared/`
- **Type Definitions:** `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
