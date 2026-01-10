# REQ-168: Redesign PreviewSaveStep Layout - Detailed Task Breakdown

**Created:** 2026-01-09 23:58 UTC
**Last Modified:** 2026-01-09 23:58 UTC
**Request ID:** REQ-168
**Type:** ENHANCEMENT
**Size:** M
**Phase:** 5 - Redesign Review Screen
**Task ID:** 5.2
**Overview Document:** `/docs/REQ-168-redesign-previewsavestep-layout-overview.md`
**Implementation Plan Reference:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`

---

## Executive Summary

This document provides a granular, step-by-step task breakdown for redesigning the PreviewSaveStep component. The redesign transforms the current layout (which displays prominent "Retake/Replace All" buttons) into an information-rich preview screen showing item details and content previews. The implementation follows established ItemCreationWorkflow patterns and maintains full accessibility compliance.

---

## Prerequisites

Before starting implementation, verify the following:

| Prerequisite | Status | Notes |
|--------------|--------|-------|
| Task 1.1 (Types/Constants) | Check if complete | Provides `purpose` field and `PURPOSE_LABELS` |
| Task 5.1 (ContentPreview) | Check if complete | Can start without it using existing components |

**Note:** This task can begin implementation without prerequisites by using placeholders. Update after dependencies complete.

---

## Authorized Files for Modification

| File Path | Authorization |
|-----------|---------------|
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | MODIFY - Primary file |

### Files for Reference Only (DO NOT MODIFY)

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | CurrentItemState interface |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | ROOM_LABELS, ITEM_TYPE_LABELS, MAX_CONTENT_PIECES |
| `src/components/ItemCreationWorkflow/components/shared/ItemNameEditor.tsx` | Existing editable field pattern |
| `src/components/ItemCreationWorkflow/components/shared/SortableContentPieceCard.tsx` | Existing content card pattern |
| `src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx` | Content preview rendering |

---

## Task Breakdown

### Task 5.2.1: Create ReadOnlyField Sub-Component

**Story Points:** 0.5
**Estimated Effort:** 30 minutes
**Dependencies:** None

#### Description
Create a reusable presentational component for displaying read-only label-value pairs. This component will be used to display Room, Item Type, and Purpose metadata.

#### Implementation Steps

1. **Add the ReadOnlyField interface and component** within `PreviewSaveStep.tsx` (after line 38, before EmptyContentState):

```typescript
// =============================================================================
// ReadOnlyField Sub-Component
// =============================================================================

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

#### Verification Steps
- [ ] Component renders label on the left side
- [ ] Component renders value on the right side
- [ ] Typography matches design system (text-sm, proper colors)
- [ ] Optional className prop allows style customization
- [ ] TypeScript compiles without errors

#### Acceptance Criteria
- [ ] ReadOnlyField component exists within PreviewSaveStep.tsx
- [ ] Component accepts label, value, and optional className props
- [ ] Styling uses consistent Airbnb design tokens (#717171, #222222)

---

### Task 5.2.2: Import Required Constants

**Story Points:** 0.25
**Estimated Effort:** 15 minutes
**Dependencies:** Task 5.2.1

#### Description
Update imports to include the label constants needed for displaying human-readable Room and Item Type values.

#### Implementation Steps

1. **Update imports** at the top of `PreviewSaveStep.tsx` (around line 38):

```typescript
// Change from:
import { MAX_CONTENT_PIECES } from '../../utils/constants';

// Change to:
import {
  MAX_CONTENT_PIECES,
  ROOM_LABELS,
  ITEM_TYPE_LABELS,
  type RoomTypeConst,
  type ItemTypeConst,
} from '../../utils/constants';
```

2. **Future-proofing note:** Once Task 1.1 is complete, also add:
```typescript
// TODO: Add after Task 1.1 completion
// import { PURPOSE_LABELS, type PurposeTypeConst } from '../../utils/constants';
```

#### Verification Steps
- [ ] Import statement compiles without errors
- [ ] Constants are accessible in component scope
- [ ] No unused import warnings

#### Acceptance Criteria
- [ ] ROOM_LABELS constant is imported
- [ ] ITEM_TYPE_LABELS constant is imported
- [ ] TypeScript types for room and item type are available

---

### Task 5.2.3: Create ItemDetailsSection Sub-Component

**Story Points:** 1
**Estimated Effort:** 1 hour
**Dependencies:** Task 5.2.1, Task 5.2.2

#### Description
Create a section component that displays the editable title field (using existing ItemNameEditor) alongside read-only metadata fields for Room, Item Type, and Purpose.

#### Implementation Steps

1. **Add the ItemDetailsSection interface and component** after ReadOnlyField:

```typescript
// =============================================================================
// ItemDetailsSection Sub-Component
// =============================================================================

interface ItemDetailsSectionProps {
  currentItem: CurrentItemState;
  onUpdateItemName: (name: string) => void;
  disabled?: boolean;
}

function ItemDetailsSection({
  currentItem,
  onUpdateItemName,
  disabled,
}: ItemDetailsSectionProps) {
  // Get human-readable labels from constants
  const roomLabel = ROOM_LABELS[currentItem.room as RoomTypeConst] || currentItem.room;
  const itemTypeLabel = ITEM_TYPE_LABELS[currentItem.itemType as ItemTypeConst] || currentItem.itemType;

  // Purpose label - placeholder until Task 1.1 adds purpose field
  // TODO: Replace with PURPOSE_LABELS[currentItem.purpose] after Task 1.1
  const purposeLabel = (currentItem as { purpose?: string }).purpose
    ? 'Purpose Selected'  // Replace with PURPOSE_LABELS lookup after Task 1.1
    : 'Not specified';

  return (
    <section
      className="bg-white rounded-lg border border-gray-200 p-6"
      aria-labelledby="item-details-heading"
    >
      <h3
        id="item-details-heading"
        className="text-lg font-medium text-[#222222] mb-4"
      >
        Item Details
      </h3>

      {/* Editable Title - using existing ItemNameEditor */}
      <ItemNameEditor
        value={currentItem.itemName}
        onChange={onUpdateItemName}
        disabled={disabled}
        maxLength={100}
        placeholder="Enter item title"
      />

      {/* Read-only metadata fields */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <ReadOnlyField label="Room" value={roomLabel} />
        <ReadOnlyField label="Item Type" value={itemTypeLabel} />
        <ReadOnlyField label="Purpose" value={purposeLabel} />
      </div>
    </section>
  );
}
```

#### Verification Steps
- [ ] Section has proper heading hierarchy (h3)
- [ ] ItemNameEditor component renders correctly
- [ ] Room displays human-readable label (e.g., "Kitchen" not "kitchen")
- [ ] Item Type displays human-readable label (e.g., "Appliance" not "appliance")
- [ ] Purpose shows "Not specified" when undefined
- [ ] Disabled state propagates to ItemNameEditor
- [ ] Section has aria-labelledby for accessibility

#### Acceptance Criteria
- [ ] ItemDetailsSection displays editable title field
- [ ] Shows Room with human-readable label from ROOM_LABELS
- [ ] Shows Item Type with human-readable label from ITEM_TYPE_LABELS
- [ ] Shows Purpose with placeholder (ready for Task 1.1 integration)
- [ ] Clear visual separation between editable title and read-only metadata

---

### Task 5.2.4: Create ContentSection Sub-Component

**Story Points:** 1.5
**Estimated Effort:** 1.5 hours
**Dependencies:** Task 5.2.1

#### Description
Create a section component that displays content previews with a count badge in the header and a small "+ Add More" link. This replaces the large "Retake / Replace All" button.

#### Implementation Steps

1. **Add Plus icon to imports** (around line 15):

```typescript
// Ensure Plus is imported (should already be there)
import { ArrowLeft, Check, Loader2, RotateCcw, Plus } from 'lucide-react';
```

2. **Add the ContentSection interface and component** after ItemDetailsSection:

```typescript
// =============================================================================
// ContentSection Sub-Component
// =============================================================================

interface ContentSectionProps {
  content: ContentPiece[];
  sensors: ReturnType<typeof useSensors>;
  activeId: string | null;
  activeContent: ContentPiece | null;
  announcements: Announcements;
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDragCancel: () => void;
  onRemoveContent: (contentId: string) => void;
  onRetake: () => void;
  onAddMore: () => void;
  maxContentPieces: number;
  disabled?: boolean;
}

function ContentSection({
  content,
  sensors,
  activeId,
  activeContent,
  announcements,
  onDragStart,
  onDragEnd,
  onDragCancel,
  onRemoveContent,
  onRetake,
  onAddMore,
  maxContentPieces,
  disabled,
}: ContentSectionProps) {
  const contentCount = content.length;
  const canAddMore = contentCount < maxContentPieces;

  return (
    <section
      className="bg-white rounded-lg border border-gray-200 p-6"
      aria-labelledby="content-section-heading"
    >
      {/* Header with count badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3
            id="content-section-heading"
            className="text-lg font-medium text-[#222222]"
          >
            Content
          </h3>
          <span
            className="px-2 py-0.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-full"
            aria-label={`${contentCount} content pieces`}
          >
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={onDragCancel}
          modifiers={[restrictToParentElement]}
          accessibility={{ announcements }}
        >
          <SortableContext
            items={content.map(c => c.id)}
            strategy={rectSortingStrategy}
          >
            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
              role="list"
              aria-label="Content pieces - drag to reorder"
            >
              {content.map((piece) => (
                <SortableContentPieceCard
                  key={piece.id}
                  id={piece.id}
                  content={piece}
                  onRemove={onRemoveContent}
                  onRetake={onRetake}
                  disabled={disabled}
                  totalCount={contentCount}
                />
              ))}
            </div>
          </SortableContext>

          {/* Drag Overlay - floating preview during drag */}
          <DragOverlay>
            {activeContent && (
              <ContentPieceCard
                content={activeContent}
                className="shadow-xl ring-2 ring-[#FF385C] rotate-2 scale-105"
              />
            )}
          </DragOverlay>
        </DndContext>
      )}

      {/* Small "+ Add More" link - de-emphasized compared to old large button */}
      {canAddMore && contentCount > 0 && (
        <button
          type="button"
          onClick={onAddMore}
          disabled={disabled}
          className={cn(
            'mt-4 text-sm text-[#FF385C] hover:text-[#E31C5F]',
            'focus:outline-none focus:underline focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2 rounded',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'flex items-center gap-1'
          )}
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Add More
        </button>
      )}
    </section>
  );
}
```

#### Verification Steps
- [ ] Section header displays "Content" with count badge
- [ ] Count badge shows correct number of content pieces
- [ ] "Maximum reached" warning appears when at MAX_CONTENT_PIECES limit
- [ ] Empty state displays when no content exists
- [ ] Content grid renders correctly with responsive columns
- [ ] Drag-and-drop functionality works
- [ ] "+ Add More" link is small and de-emphasized
- [ ] "+ Add More" link hidden when at max content limit
- [ ] "+ Add More" link calls onAddMore callback when clicked
- [ ] Disabled state respected on all interactive elements

#### Acceptance Criteria
- [ ] Content count badge displays in section header
- [ ] "+ Add More" link replaces large "Retake/Replace All" button
- [ ] Link is visually de-emphasized (small text, not a large button)
- [ ] Drag-and-drop reordering preserved
- [ ] All accessibility attributes present

---

### Task 5.2.5: Refactor PreviewSaveStep Main Component

**Story Points:** 1
**Estimated Effort:** 1 hour
**Dependencies:** Task 5.2.3, Task 5.2.4

#### Description
Refactor the main PreviewSaveStep component to use the new ItemDetailsSection and ContentSection sub-components. Remove the large "Retake / Replace All" button.

#### Implementation Steps

1. **Replace the "Item Name Section"** (lines 311-323 in current implementation):

```typescript
// REMOVE the old Item Name Section:
{/* Item Name Section */}
<section className="bg-white rounded-lg border border-gray-200 p-6">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-medium text-[#222222]">Item Name</h3>
  </div>
  <ItemNameEditor
    value={currentItem.itemName}
    onChange={onUpdateItemName}
    disabled={isSaving}
    maxLength={100}
    placeholder="Enter item name"
  />
</section>

// REPLACE WITH:
{/* Item Details Section with metadata */}
<ItemDetailsSection
  currentItem={currentItem}
  onUpdateItemName={onUpdateItemName}
  disabled={isSaving}
/>
```

2. **Replace the "Content Section"** (lines 325-384 in current implementation):

```typescript
// REMOVE the old Content Section block and replace with:
{/* Content Section with count badge and small add more link */}
<ContentSection
  content={currentItem.content}
  sensors={sensors}
  activeId={activeId}
  activeContent={activeContent}
  announcements={announcements}
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
  onDragCancel={handleDragCancel}
  onRemoveContent={handleRemoveClick}
  onRetake={onRetake}
  onAddMore={onRetake}
  maxContentPieces={MAX_CONTENT_PIECES}
  disabled={isSaving}
/>
```

3. **Remove the "Retake / Replace All" button block** (lines 386-404 in current implementation):

```typescript
// DELETE this entire block:
{/* Retake / Replace All Button */}
{currentItem.content.length > 0 && (
  <button
    type="button"
    onClick={onRetake}
    disabled={isSaving}
    className={cn(
      'w-full py-3 border-2 border-gray-200 rounded-lg',
      'flex items-center justify-center gap-2',
      'text-[#222222] font-medium',
      'hover:border-gray-300 hover:bg-gray-50 transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    )}
  >
    <RotateCcw className="w-5 h-5" aria-hidden="true" />
    Retake / Replace All
  </button>
)}
```

4. **Update the complete render return** to use new components:

```typescript
return (
  <div className={cn('flex flex-col gap-6 p-6', className)}>
    {/* Header with back button */}
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSaving}
        className={cn(
          'p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
        aria-label="Go back"
      >
        <ArrowLeft className="w-5 h-5 text-[#222222]" />
      </button>
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
      sensors={sensors}
      activeId={activeId}
      activeContent={activeContent}
      announcements={announcements}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      onRemoveContent={handleRemoveClick}
      onRetake={onRetake}
      onAddMore={onRetake}
      maxContentPieces={MAX_CONTENT_PIECES}
      disabled={isSaving}
    />

    {/* REMOVED: Large "Retake / Replace All" button */}

    {/* Error Display - unchanged */}
    {saveError && (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 text-sm">{saveError}</p>
        <button
          type="button"
          onClick={() => setSaveError(null)}
          className="mt-2 text-red-700 underline text-sm hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
        >
          Dismiss
        </button>
      </div>
    )}

    {/* Save Button - unchanged */}
    <button
      type="button"
      onClick={handleSave}
      disabled={isSaving || !canSave}
      className={cn(
        'w-full py-4 rounded-lg font-semibold text-lg',
        'flex items-center justify-center gap-2',
        'transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2',
        isSaving
          ? 'bg-[#FF385C]/70 text-white cursor-wait'
          : 'bg-[#FF385C] text-white hover:bg-[#E31C5F]',
        !canSave && !isSaving && 'bg-gray-300 cursor-not-allowed hover:bg-gray-300'
      )}
    >
      {isSaving ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
          Saving...
        </>
      ) : (
        <>
          <Check className="w-5 h-5" aria-hidden="true" />
          Save Item
        </>
      )}
    </button>

    {/* Success Overlay - unchanged */}
    {showSuccess && savedResult && (
      <SuccessOverlay
        itemName={currentItem.itemName}
        qrCodeUrl={savedResult.qrCodeUrl}
        onContinue={handleContinue}
      />
    )}

    {/* Screen Reader Announcements - unchanged */}
    <div aria-live="polite" className="sr-only">
      {showSuccess && 'Item saved successfully'}
      {saveError && `Error: ${saveError}`}
    </div>

    {/* Last Piece Removal Confirmation Dialog - unchanged */}
    {isRemovingLastPiece && (
      // ... existing dialog code ...
    )}
  </div>
);
```

#### Verification Steps
- [ ] ItemDetailsSection renders in place of old "Item Name" section
- [ ] ContentSection renders with all drag-drop functionality
- [ ] Large "Retake / Replace All" button is removed
- [ ] Small "+ Add More" link appears in content section
- [ ] All existing functionality preserved (save, error display, success overlay)
- [ ] Removal confirmation dialog still works
- [ ] No TypeScript compilation errors
- [ ] Visual layout matches design spec

#### Acceptance Criteria
- [ ] Old "Item Name" section replaced with ItemDetailsSection
- [ ] Old "Content" section replaced with ContentSection
- [ ] Large "Retake/Replace All" button removed
- [ ] All callbacks (onRetake, onSave, etc.) still function correctly
- [ ] Layout renders without errors

---

### Task 5.2.6: Update Component JSDoc and lastModified Date

**Story Points:** 0.25
**Estimated Effort:** 15 minutes
**Dependencies:** Task 5.2.5

#### Description
Update the component documentation to reflect the changes made and update the lastModified date.

#### Implementation Steps

1. **Update the JSDoc header** (lines 1-12):

```typescript
'use client';

/**
 * PreviewSaveStep Component
 *
 * Step 7 of ItemCreationWorkflow - Preview and save captured content.
 * Displays item details section (title, room, type, purpose) and
 * content preview section with count badge and "+ Add More" link.
 *
 * @module ItemCreationWorkflow/components/steps/PreviewSaveStep
 * @see docs/REQ-168-redesign-previewsavestep-layout-overview.md
 * @lastModified 2026-01-09 (REQ-168 Redesign PreviewSaveStep Layout)
 */
```

#### Verification Steps
- [ ] JSDoc accurately describes new functionality
- [ ] lastModified date is current
- [ ] Reference to overview document is correct

#### Acceptance Criteria
- [ ] Component JSDoc updated with new description
- [ ] lastModified date reflects implementation date

---

### Task 5.2.7: Verify Accessibility Compliance

**Story Points:** 0.5
**Estimated Effort:** 30 minutes
**Dependencies:** Task 5.2.5

#### Description
Verify that the redesigned layout maintains proper accessibility attributes and passes accessibility audits.

#### Implementation Steps

1. **Verify heading hierarchy:**
   - Main heading: h2 "Preview & Save"
   - Section headings: h3 "Item Details", h3 "Content"

2. **Verify aria-labelledby on sections:**
   ```typescript
   <section aria-labelledby="item-details-heading">
     <h3 id="item-details-heading">Item Details</h3>
   ```

3. **Verify content count is announced:**
   ```typescript
   <span aria-label={`${contentCount} content pieces`}>
     {contentCount}
   </span>
   ```

4. **Verify keyboard navigation:**
   - Tab through all interactive elements
   - Ensure focus order is logical
   - Verify "+ Add More" link is keyboard accessible

5. **Verify screen reader compatibility:**
   - aria-live regions for dynamic content
   - aria-hidden on decorative icons
   - Descriptive labels for buttons

#### Verification Steps
- [ ] Run axe-core or similar accessibility audit tool
- [ ] Test keyboard navigation through entire component
- [ ] Verify with screen reader (VoiceOver or NVDA)
- [ ] Check heading hierarchy with browser dev tools
- [ ] Verify color contrast meets WCAG AA standards

#### Acceptance Criteria
- [ ] Proper heading hierarchy (h2 > h3)
- [ ] All sections have aria-labelledby
- [ ] Content count has appropriate aria-label
- [ ] "+ Add More" link is keyboard accessible
- [ ] Focus management works correctly
- [ ] No accessibility warnings from automated tools

---

### Task 5.2.8: Test Responsive Layout

**Story Points:** 0.5
**Estimated Effort:** 30 minutes
**Dependencies:** Task 5.2.5

#### Description
Verify the redesigned layout works correctly across all viewport sizes.

#### Implementation Steps

1. **Test at Mobile Viewport (320px - 480px):**
   - ItemDetailsSection readable
   - Content grid shows 2 columns
   - Touch targets meet 48px minimum
   - No horizontal scrolling
   - "+ Add More" link easily tappable

2. **Test at Tablet Viewport (481px - 768px):**
   - ItemDetailsSection with appropriate spacing
   - Content grid shows 2-3 columns
   - Layout balanced

3. **Test at Desktop Viewport (769px+):**
   - Content grid shows 3-4 columns
   - Efficient use of horizontal space
   - Proper alignment

4. **Test on actual devices:**
   - iOS Safari
   - Android Chrome
   - Tablet Safari/Chrome

#### Verification Steps
- [ ] Layout renders correctly at 320px width
- [ ] Layout renders correctly at 768px width
- [ ] Layout renders correctly at 1024px+ width
- [ ] All touch targets are at least 48px
- [ ] No horizontal scrolling on mobile
- [ ] Content grid columns adjust appropriately

#### Acceptance Criteria
- [ ] Mobile: Single/dual column content grid, readable fields
- [ ] Tablet: 2-3 column content grid, proper spacing
- [ ] Desktop: 3-4 column content grid, efficient layout
- [ ] Touch targets meet 48px minimum on mobile

---

### Task 5.2.9: Integration Test with Workflow

**Story Points:** 0.5
**Estimated Effort:** 30 minutes
**Dependencies:** Task 5.2.8

#### Description
Test the redesigned PreviewSaveStep within the complete ItemCreationWorkflow to ensure it integrates correctly.

#### Implementation Steps

1. **Test navigation flow:**
   - Navigate to PreviewSaveStep from content-creation
   - Verify all currentItem data is passed correctly
   - Test back button returns to previous step

2. **Test item name editing:**
   - Modify item name in ItemDetailsSection
   - Verify onUpdateItemName callback is triggered
   - Verify state updates correctly

3. **Test "+ Add More" functionality:**
   - Click "+ Add More" link
   - Verify onRetake callback navigates to content type selection
   - Return to PreviewSaveStep
   - Verify new content appears

4. **Test save flow:**
   - Click "Save Item" button
   - Verify loading state displays
   - Verify success overlay appears
   - Verify QR code displays correctly

5. **Test error handling:**
   - Simulate save error
   - Verify error message displays
   - Verify dismiss button works

6. **Test content removal:**
   - Remove content pieces
   - Verify last piece removal shows confirmation
   - Verify count badge updates

#### Verification Steps
- [ ] Navigation to/from PreviewSaveStep works
- [ ] Item name editing updates state
- [ ] "+ Add More" triggers onRetake callback
- [ ] Save operation completes successfully
- [ ] Error handling displays correctly
- [ ] Content removal with confirmation works
- [ ] Count badge updates dynamically

#### Acceptance Criteria
- [ ] Full workflow navigation functional
- [ ] All callbacks trigger correctly
- [ ] State management preserved
- [ ] No console errors during operation

---

## Task Summary

| Task ID | Title | Story Points | Dependencies |
|---------|-------|--------------|--------------|
| 5.2.1 | Create ReadOnlyField Sub-Component | 0.5 | None |
| 5.2.2 | Import Required Constants | 0.25 | 5.2.1 |
| 5.2.3 | Create ItemDetailsSection Sub-Component | 1 | 5.2.1, 5.2.2 |
| 5.2.4 | Create ContentSection Sub-Component | 1.5 | 5.2.1 |
| 5.2.5 | Refactor PreviewSaveStep Main Component | 1 | 5.2.3, 5.2.4 |
| 5.2.6 | Update Component JSDoc | 0.25 | 5.2.5 |
| 5.2.7 | Verify Accessibility Compliance | 0.5 | 5.2.5 |
| 5.2.8 | Test Responsive Layout | 0.5 | 5.2.5 |
| 5.2.9 | Integration Test with Workflow | 0.5 | 5.2.8 |
| **Total** | | **6** | |

---

## Post-Implementation Tasks

### After Task 1.1 Completion (Purpose Field Added)

Once Task 1.1 is complete, update ItemDetailsSection:

1. **Import PURPOSE_LABELS:**
```typescript
import {
  MAX_CONTENT_PIECES,
  ROOM_LABELS,
  ITEM_TYPE_LABELS,
  PURPOSE_LABELS,  // Add this
  type RoomTypeConst,
  type ItemTypeConst,
  type PurposeTypeConst,  // Add this
} from '../../utils/constants';
```

2. **Update purposeLabel in ItemDetailsSection:**
```typescript
const purposeLabel = currentItem.purpose
  ? PURPOSE_LABELS[currentItem.purpose as PurposeTypeConst]
  : 'Not specified';
```

### After Task 5.1 Completion (ContentPreview Component)

Once Task 5.1 creates the ContentPreview component, consider updating ContentSection to use it for richer previews if needed.

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking drag-and-drop | Low | High | Reuse existing DndContext logic exactly |
| Purpose field not available | High | Low | Use placeholder, update after Task 1.1 |
| Mobile layout issues | Medium | Medium | Test on real devices, use existing patterns |
| Accessibility regression | Low | High | Run automated tests, manual screen reader testing |

---

## Success Criteria Checklist

- [ ] Large "Add Media" / "Add Link" / "Retake/Replace All" buttons removed
- [ ] Item Details section shows title (editable), room, item type, purpose (read-only)
- [ ] Auto-generated title is editable by user
- [ ] Content section shows actual content previews
- [ ] Content count badge displays total pieces
- [ ] Small "+ Add More" link available (not large CTA)
- [ ] Layout adapts responsively to all viewport sizes
- [ ] All existing functionality preserved (save, drag-drop, remove, etc.)
- [ ] Accessibility requirements maintained
- [ ] TypeScript compiles without errors

---

## References

- **Request:** `/docs/gen_requests.md` - REQ-168
- **Overview:** `/docs/REQ-168-redesign-previewsavestep-layout-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md` - Task 5.2
- **Current Implementation:** `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
- **Component Patterns:** `/src/components/ItemCreationWorkflow/components/shared/`
- **Type Definitions:** `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
- **Constants:** `/src/components/ItemCreationWorkflow/utils/constants.ts`
