# Detailed Task Breakdown: REQ-170 - Pre-populate Fields in Review Screen

**Document Generated:** 2026-01-09 23:45 UTC
**Last Modified:** 2026-01-09 23:45 UTC
**Request ID:** REQ-170
**Phase:** 5 - Redesign Review Screen
**Task ID:** 5.4
**Size:** S
**Estimated Effort:** 5 hours

---

## Table of Contents

1. [Overview](#overview)
2. [Dependencies and Prerequisites](#dependencies-and-prerequisites)
3. [Authorized Files for Modification](#authorized-files-for-modification)
4. [Detailed Task Breakdown](#detailed-task-breakdown)
5. [Testing Strategy](#testing-strategy)
6. [Acceptance Criteria Checklist](#acceptance-criteria-checklist)
7. [Risk Mitigation](#risk-mitigation)
8. [References](#references)

---

## Overview

This document provides granular, implementation-ready tasks for REQ-170, which adds pre-populated metadata fields to the PreviewSaveStep (review screen). Users will see their item's auto-generated title, room, item type, and purpose displayed when arriving at the review screen, with inline title editing capability.

### Goal
When users reach the review screen (PreviewSaveStep), they should see:
- **Title**: Auto-generated using `generateArticleTitle()` (editable)
- **Room**: Displayed from `currentItem.room` (read-only)
- **Item Type**: Displayed from `currentItem.itemType` (read-only)
- **Purpose**: Displayed from `currentItem.purpose` (read-only)

### Current State Analysis

**PreviewSaveStep.tsx (lines 1-507):**
- Has `ItemNameEditor` for title editing
- Shows content pieces in sortable grid
- Missing: Room, Item Type, Purpose display fields
- Missing: Integration with title generator

**useWorkflowState.ts (lines 282-300):**
- `SELECT_SPECIFIC_ITEM` creates auto-name as `${roomLabel} - ${specificItem}`
- Missing: `SELECT_PURPOSE` action
- Missing: Title auto-generation using `generateArticleTitle()`

**constants.ts:**
- Has `ROOM_LABELS`, `ITEM_TYPE_LABELS`
- Missing: `PURPOSE_LABELS` constant

**ItemCreationWorkflow.types.ts:**
- `CurrentItemState` exists
- Missing: `purpose` field

---

## Dependencies and Prerequisites

### Required Before Implementation

| Dependency | Status | Blocking Tasks |
|------------|--------|----------------|
| REQ-154: Purpose Selection Step | Must complete first | Task 1, Task 3, Task 5 |
| REQ-155: Title Generator Utility | Must complete first | Task 5 |
| REQ-156: State Machine Updates | Must complete first | Task 5 |
| REQ-168: Redesign PreviewSaveStep Layout | Should complete first | Task 3, Task 4 |

### Conditional Implementation Notes

If dependencies are not yet complete:
- **Tasks 1-2**: Can proceed if REQ-154 is complete (adds `purpose` to types/constants)
- **Tasks 3-4**: Can implement UI without purpose display (graceful null handling)
- **Task 5**: Blocked until REQ-155 creates `titleGenerator.ts`

---

## Authorized Files for Modification

### Files to Modify

| File Path | Change Type | Scope |
|-----------|-------------|-------|
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | MODIFY | Add `ItemDetailsDisplay` sub-component, update layout |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | MODIFY | Add title auto-generation in `SELECT_PURPOSE` case |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | MODIFY | Add `purpose` field to `CurrentItemState` (if not done by REQ-154) |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | MODIFY | Add `PURPOSE_LABELS` constant (if not done by REQ-154) |

### Files to Reference (Read-Only)

| File Path | Reason |
|-----------|--------|
| `src/components/ItemCreationWorkflow/components/shared/ItemNameEditor.tsx` | Pattern for editable fields |
| `src/components/ItemCreationWorkflow/utils/titleGenerator.ts` | Import after REQ-155 creates it |

---

## Detailed Task Breakdown

### Task 1: Verify Purpose Type and Constants Exist (Prerequisite Check)

**Story Points:** 0.25 (15 minutes)
**Type:** Verification
**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`, `constants.ts`

#### Description
Verify that REQ-154 has added the `purpose` field to `CurrentItemState` and `PURPOSE_LABELS` to constants. If not present, this task documents what's missing.

#### Subtasks

1.1. Open `ItemCreationWorkflow.types.ts` and check for `purpose` field in `CurrentItemState` interface (line ~136-157)

1.2. Open `constants.ts` and check for `PURPOSE_LABELS` constant

1.3. If missing, document gaps and verify REQ-154 status before proceeding

#### Expected Additions (if missing)

**In `ItemCreationWorkflow.types.ts`:**
```typescript
export type PurposeType =
  | 'how-to-use'
  | 'how-to-clean'
  | 'troubleshooting'
  | 'safety-info'
  | 'maintenance'
  | 'features'
  | 'other';

export interface CurrentItemState {
  // ... existing fields
  purpose: PurposeType | null;  // NEW
}
```

**In `constants.ts`:**
```typescript
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

#### Verification
- [ ] `PurposeType` is defined in types file
- [ ] `CurrentItemState` includes `purpose: PurposeType | null`
- [ ] `PURPOSE_LABELS` constant exists in constants.ts
- [ ] If any missing, REQ-154 must be completed first

---

### Task 2: Create ItemDetailsDisplay Sub-Component Interface

**Story Points:** 0.5 (30 minutes)
**Type:** Implementation
**File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

#### Description
Define the TypeScript interface and create a new sub-component within PreviewSaveStep.tsx that displays read-only metadata fields (room, item type, purpose).

#### Subtasks

2.1. Add imports at top of file (after existing imports, around line 37):
```typescript
import {
  ROOM_LABELS,
  ITEM_TYPE_LABELS,
  PURPOSE_LABELS,
} from '../../utils/constants';
import type { RoomType, ItemType, PurposeType } from '../../ItemCreationWorkflow.types';
```

2.2. Add interface definition after `EmptyContentStateProps` (around line 72):
```typescript
interface ItemDetailsDisplayProps {
  room: RoomType;
  itemType: ItemType;
  purpose: PurposeType | null;
}
```

2.3. Create the sub-component after `EmptyContentState` function (around line 89):
```typescript
function ItemDetailsDisplay({ room, itemType, purpose }: ItemDetailsDisplayProps) {
  const roomLabel = ROOM_LABELS[room] || room;
  const itemTypeLabel = ITEM_TYPE_LABELS[itemType] || itemType;
  const purposeLabel = purpose ? PURPOSE_LABELS[purpose] : 'Not specified';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Room Field */}
      <div className="space-y-1">
        <span className="text-sm font-medium text-[#717171]">Room</span>
        <p className="text-base text-[#222222]">{roomLabel}</p>
      </div>
      {/* Item Type Field */}
      <div className="space-y-1">
        <span className="text-sm font-medium text-[#717171]">Item Type</span>
        <p className="text-base text-[#222222]">{itemTypeLabel}</p>
      </div>
      {/* Purpose Field */}
      <div className="space-y-1">
        <span className="text-sm font-medium text-[#717171]">Purpose</span>
        <p className="text-base text-[#222222]">{purposeLabel}</p>
      </div>
    </div>
  );
}
```

#### Verification
- [ ] Interface correctly typed with RoomType, ItemType, PurposeType
- [ ] Component renders three fields in responsive grid
- [ ] Labels use constants for consistent display
- [ ] Null purpose handled gracefully with "Not specified"
- [ ] TypeScript compilation succeeds with no errors

---

### Task 3: Add Item Details Section to PreviewSaveStep Layout

**Story Points:** 0.75 (45 minutes)
**Type:** Implementation
**File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

#### Description
Update the PreviewSaveStep component to include an "Item Details" section above the existing "Item Name" section, rendering the `ItemDetailsDisplay` sub-component.

#### Subtasks

3.1. Locate the main return statement (around line 289) and the Item Name Section (around line 311-323)

3.2. Add new Item Details section BEFORE the Item Name Section (insert between header and Item Name section):
```tsx
{/* Item Details Section */}
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
  <ItemDetailsDisplay
    room={currentItem.room}
    itemType={currentItem.itemType}
    purpose={currentItem.purpose ?? null}
  />
</section>
```

3.3. Update the Item Name section header for clarity:
```tsx
{/* Item Name Section */}
<section
  className="bg-white rounded-lg border border-gray-200 p-6"
  aria-labelledby="item-title-heading"
>
  <h3
    id="item-title-heading"
    className="text-lg font-medium text-[#222222] mb-4"
  >
    Article Title
  </h3>
  <ItemNameEditor
    value={currentItem.itemName}
    onChange={onUpdateItemName}
    disabled={isSaving}
    maxLength={100}
    placeholder="Enter article title"
  />
</section>
```

#### Expected Layout Structure
```
┌─────────────────────────────────────────┐
│ Header (Preview & Save)                 │
├─────────────────────────────────────────┤
│ Item Details Section          (NEW)     │
│   ├── Room: Kitchen (read-only)         │
│   ├── Item Type: Appliance (read-only)  │
│   └── Purpose: How to Clean (read-only) │
├─────────────────────────────────────────┤
│ Article Title Section                   │
│   └── ItemNameEditor (editable)         │
├─────────────────────────────────────────┤
│ Content Section (existing grid)         │
└─────────────────────────────────────────┘
```

#### Verification
- [ ] Item Details section appears above Article Title section
- [ ] Room displays correct label from `ROOM_LABELS`
- [ ] Item Type displays correct label from `ITEM_TYPE_LABELS`
- [ ] Purpose displays correct label or "Not specified" when null
- [ ] Responsive: 3 columns on desktop, stacked on mobile (sm:grid-cols-3)
- [ ] Sections have proper ARIA labels (aria-labelledby)
- [ ] Visual consistency with existing section styling

---

### Task 4: Add Accessibility Enhancements

**Story Points:** 0.5 (30 minutes)
**Type:** Enhancement
**File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

#### Description
Ensure the new Item Details section meets accessibility requirements with proper semantic HTML, ARIA attributes, and screen reader support.

#### Subtasks

4.1. Update `ItemDetailsDisplay` to use semantic definition list:
```tsx
function ItemDetailsDisplay({ room, itemType, purpose }: ItemDetailsDisplayProps) {
  const roomLabel = ROOM_LABELS[room] || room;
  const itemTypeLabel = ITEM_TYPE_LABELS[itemType] || itemType;
  const purposeLabel = purpose ? PURPOSE_LABELS[purpose] : 'Not specified';

  return (
    <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4" role="list">
      {/* Room Field */}
      <div className="space-y-1">
        <dt className="text-sm font-medium text-[#717171]">Room</dt>
        <dd className="text-base text-[#222222]">{roomLabel}</dd>
      </div>
      {/* Item Type Field */}
      <div className="space-y-1">
        <dt className="text-sm font-medium text-[#717171]">Item Type</dt>
        <dd className="text-base text-[#222222]">{itemTypeLabel}</dd>
      </div>
      {/* Purpose Field */}
      <div className="space-y-1">
        <dt className="text-sm font-medium text-[#717171]">Purpose</dt>
        <dd className="text-base text-[#222222]">{purposeLabel}</dd>
      </div>
    </dl>
  );
}
```

4.2. Add visual distinction for read-only fields:
```tsx
<dd className="text-base text-[#222222] bg-gray-50 px-3 py-2 rounded-md">
  {roomLabel}
</dd>
```

4.3. Add screen reader announcement for pre-populated data in main component (add to existing sr-only div):
```tsx
<div aria-live="polite" className="sr-only">
  {showSuccess && 'Item saved successfully'}
  {saveError && `Error: ${saveError}`}
</div>
```

#### Verification
- [ ] Uses semantic `<dl>`, `<dt>`, `<dd>` elements for definition list
- [ ] Each field has clear label-value relationship
- [ ] Read-only fields visually distinguished (subtle background)
- [ ] Screen readers can navigate fields meaningfully
- [ ] Tab order skips read-only fields appropriately (they're not focusable)
- [ ] Color contrast meets WCAG 2.1 AA standards

---

### Task 5: Integrate Title Auto-Generation (Requires REQ-155)

**Story Points:** 1.0 (1 hour)
**Type:** Implementation
**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`

#### Description
Update the state machine to auto-generate the article title when a purpose is selected, using the `generateArticleTitle()` utility from REQ-155.

#### Prerequisites
- REQ-155 must be complete (creates `titleGenerator.ts`)
- REQ-154 must be complete (adds `SELECT_PURPOSE` action)

#### Subtasks

5.1. Add import at top of file (around line 62):
```typescript
import { generateArticleTitle } from '../utils/titleGenerator';
```

5.2. Add `SELECT_PURPOSE` case to reducer (if not already added by REQ-156). Insert after `SELECT_SPECIFIC_ITEM` case (around line 300):
```typescript
case 'SELECT_PURPOSE': {
  if (!state.currentItem) return state;
  const autoTitle = generateArticleTitle({
    specificItem: state.currentItem.specificItem,
    purpose: action.payload,
  });
  const updatedItem: CurrentItemState = {
    ...state.currentItem,
    purpose: action.payload,
    itemName: autoTitle,
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

5.3. Add `selectPurpose` action to hook return (around line 713):
```typescript
const selectPurpose = useCallback((purpose: PurposeType) => {
  dispatch({ type: 'SELECT_PURPOSE', payload: purpose });
}, []);
```

5.4. Update hook return type interface (around line 607) to include:
```typescript
/** Select a purpose for the current item */
selectPurpose: (purpose: PurposeType) => void;
```

5.5. Add to return object (around line 846):
```typescript
return {
  // ... existing returns
  selectPurpose,
  // ...
};
```

#### Verification
- [ ] `generateArticleTitle` is imported from titleGenerator.ts
- [ ] `SELECT_PURPOSE` reducer case auto-generates title
- [ ] Title format follows "Purpose - Item" pattern (e.g., "How to Clean - Fridge")
- [ ] Existing `SET_ITEM_NAME` action still allows manual override
- [ ] `selectPurpose` action is exposed from hook
- [ ] TypeScript types are correctly updated
- [ ] State machine tests pass

---

### Task 6: Update CurrentItemState Type (If Not Done by REQ-154)

**Story Points:** 0.25 (15 minutes)
**Type:** Implementation
**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`

#### Description
Add the `purpose` field to `CurrentItemState` interface if not already added by REQ-154.

#### Subtasks

6.1. Check if `PurposeType` exists in file. If not, add after `ContentType` (around line 91):
```typescript
/**
 * Purpose/Intent categories for item content.
 * Determines the type of information being documented.
 */
export type PurposeType =
  | 'how-to-use'
  | 'how-to-clean'
  | 'troubleshooting'
  | 'safety-info'
  | 'maintenance'
  | 'features'
  | 'other';
```

6.2. Add `purpose` field to `CurrentItemState` interface (around line 155):
```typescript
export interface CurrentItemState {
  /** Selected room for this item */
  room: RoomType;

  /** Selected item type category */
  itemType: ItemType;

  /** Specific item name from suggestions or custom input */
  specificItem: string;

  /** Display name for the item (auto-generated or user-edited) */
  itemName: string;

  /** Purpose/intent for this content (null until chosen) */
  purpose: PurposeType | null;  // NEW FIELD

  /** Content source choice: existing upload or create new */
  contentSource: 'existing' | 'create-new';

  /** Selected content type (null until chosen) */
  contentType: ContentType | null;

  /** Content pieces added to this item */
  content: ContentPiece[];
}
```

6.3. Add `SELECT_PURPOSE` action type to `WorkflowAction` union (around line 330):
```typescript
export type WorkflowAction =
  // ... existing actions
  | { type: 'SELECT_PURPOSE'; payload: PurposeType }
  // ... rest of actions
```

#### Verification
- [ ] `PurposeType` type is defined
- [ ] `CurrentItemState` includes `purpose: PurposeType | null`
- [ ] `WorkflowAction` includes `SELECT_PURPOSE` action
- [ ] TypeScript compilation succeeds
- [ ] No breaking changes to existing code

---

### Task 7: Add PURPOSE_LABELS Constant (If Not Done by REQ-154)

**Story Points:** 0.25 (15 minutes)
**Type:** Implementation
**File:** `src/components/ItemCreationWorkflow/utils/constants.ts`

#### Description
Add the `PURPOSE_LABELS` constant mapping purpose types to human-readable labels if not already added by REQ-154.

#### Subtasks

7.1. Add type import at top if needed (check existing imports):
```typescript
import type { PurposeType } from '../ItemCreationWorkflow.types';
```

7.2. Add `PURPOSE_TYPES` array after `ITEM_TYPES` (around line 96):
```typescript
/**
 * Available purpose/intent types for content.
 */
export const PURPOSE_TYPES = [
  'how-to-use',
  'how-to-clean',
  'troubleshooting',
  'safety-info',
  'maintenance',
  'features',
  'other',
] as const;

/**
 * Type for purpose values derived from PURPOSE_TYPES constant.
 */
export type PurposeTypeConst = (typeof PURPOSE_TYPES)[number];
```

7.3. Add `PURPOSE_LABELS` constant:
```typescript
/**
 * Human-readable labels for each purpose type.
 */
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

#### Verification
- [ ] `PURPOSE_TYPES` array defined
- [ ] `PurposeTypeConst` type derived from array
- [ ] `PURPOSE_LABELS` maps all purpose types to labels
- [ ] Constants exported from file
- [ ] Exported from `utils/index.ts` (if exists)

---

### Task 8: Initialize Purpose in State Creation

**Story Points:** 0.25 (15 minutes)
**Type:** Implementation
**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`

#### Description
Update the `SELECT_ROOM` reducer case to initialize the `purpose` field to `null` when creating a new item.

#### Subtasks

8.1. Locate `SELECT_ROOM` case (around line 242-263)

8.2. Update `newItem` creation to include `purpose: null`:
```typescript
case 'SELECT_ROOM': {
  const roomType = action.payload;
  const itemType = roomType === 'general' ? 'general-info' : null;
  const newItem: CurrentItemState = {
    room: roomType,
    itemType: itemType as ItemType,
    specificItem: '',
    itemName: '',
    purpose: null,  // NEW: Initialize purpose field
    contentSource: 'existing',
    contentType: null,
    content: [],
  };
  return {
    ...state,
    currentItem: newItem,
    isDirty: true,
    session: {
      ...state.session,
      currentItem: newItem,
    },
  };
}
```

#### Verification
- [ ] New items have `purpose: null` on creation
- [ ] TypeScript compilation succeeds
- [ ] Existing workflow flow not broken
- [ ] State machine tests pass

---

### Task 9: Manual Integration Testing

**Story Points:** 0.75 (45 minutes)
**Type:** Testing
**File:** N/A (manual testing)

#### Description
Perform end-to-end manual testing of the complete feature to verify all components work together correctly.

#### Test Cases

9.1. **Pre-populated Fields Display Test**
- Start item creation workflow
- Select Room: Kitchen
- Select Item Type: Appliance
- Select Specific Item: Fridge
- Select Purpose: How to Clean
- Add content (video or photo)
- Navigate to Preview & Save step
- **Verify:**
  - [ ] Room shows "Kitchen"
  - [ ] Item Type shows "Appliance"
  - [ ] Purpose shows "How to Clean"
  - [ ] Title shows "How to Clean - Fridge" (auto-generated)

9.2. **Title Editing Test**
- On Preview & Save step
- Click title field
- Edit title to "Custom Fridge Cleaning Guide"
- **Verify:**
  - [ ] Title field accepts input
  - [ ] Character counter updates
  - [ ] New title displays correctly
  - [ ] Save uses custom title

9.3. **Null Purpose Handling Test**
- Start workflow but skip purpose selection (if possible)
- Or navigate directly to review with no purpose
- **Verify:**
  - [ ] Purpose shows "Not specified"
  - [ ] No JavaScript errors
  - [ ] Layout remains intact

9.4. **Responsive Layout Test**
- Open on desktop (1200px+)
- **Verify:** Three columns in Item Details grid
- Resize to tablet (768px)
- **Verify:** Three columns still visible
- Resize to mobile (375px)
- **Verify:** Fields stack vertically

9.5. **Accessibility Test**
- Use keyboard-only navigation
- **Verify:**
  - [ ] Can tab through all interactive elements
  - [ ] Read-only fields not in tab order
  - [ ] Title field is focusable and editable
- Use screen reader (VoiceOver/NVDA)
- **Verify:**
  - [ ] Item Details announced correctly
  - [ ] Labels and values paired correctly
  - [ ] Section headings announced

#### Verification
- [ ] All 5 test cases pass
- [ ] No console errors during testing
- [ ] Performance acceptable (< 100ms render time)

---

### Task 10: Update Component Documentation

**Story Points:** 0.25 (15 minutes)
**Type:** Documentation
**File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

#### Description
Update JSDoc comments and @lastModified date in PreviewSaveStep.tsx to reflect the changes.

#### Subtasks

10.1. Update file header comment (lines 1-12):
```typescript
/**
 * PreviewSaveStep Component
 *
 * Step 7 of ItemCreationWorkflow - Preview and save captured content.
 * Displays item details (room, type, purpose), allows title editing,
 * shows content preview, and handles save.
 *
 * @module ItemCreationWorkflow/components/steps/PreviewSaveStep
 * @see docs/REQ-106-preview-save-step-overview.md
 * @see docs/REQ-170-pre-populate-fields-detailed.md
 * @lastModified 2026-01-09 (REQ-170 Pre-populate Fields)
 */
```

10.2. Add JSDoc for `ItemDetailsDisplay`:
```typescript
/**
 * ItemDetailsDisplay - Read-only metadata display
 *
 * Displays pre-populated item metadata (room, type, purpose) as a
 * definition list. All fields are read-only and use label constants
 * for consistent display.
 *
 * @param {ItemDetailsDisplayProps} props - Component props
 * @returns {JSX.Element} Definition list with item metadata
 */
function ItemDetailsDisplay({ room, itemType, purpose }: ItemDetailsDisplayProps) {
```

#### Verification
- [ ] File header includes new @see reference
- [ ] @lastModified date updated to current date
- [ ] ItemDetailsDisplay has JSDoc comment
- [ ] All new interfaces have documentation

---

## Testing Strategy

### Unit Tests

| Test | File | Description |
|------|------|-------------|
| ItemDetailsDisplay renders all fields | PreviewSaveStep.test.tsx | Verify all three fields render with correct labels |
| Handles null purpose | PreviewSaveStep.test.tsx | Verify "Not specified" displays for null purpose |
| Responsive grid layout | PreviewSaveStep.test.tsx | Verify grid classes applied correctly |
| Title auto-generation | useWorkflowState.test.ts | Verify title generates on purpose selection |

### Integration Tests

| Test | Description |
|------|-------------|
| Complete workflow | Navigate full workflow, verify all fields display on review |
| Title override | Auto-generate title, then manually edit, verify save uses edited |
| Back navigation | Go back from review, return, verify fields persist |

### Accessibility Tests

| Test | Description |
|------|-------------|
| Keyboard navigation | Tab through review screen, verify focus order |
| Screen reader | Use VoiceOver/NVDA, verify all content announced |
| Color contrast | Verify labels meet WCAG 2.1 AA contrast ratio |

---

## Acceptance Criteria Checklist

From REQ-170 requirements:

| # | Criteria | Task | Status |
|---|----------|------|--------|
| 1 | Title auto-populated using `generateItemTitle()` | Task 5 | [ ] |
| 2 | Room displayed from `currentItem.room` | Tasks 2-3 | [ ] |
| 3 | Item type displayed from `currentItem.itemType` | Tasks 2-3 | [ ] |
| 4 | Purpose displayed from `currentItem.purpose` | Tasks 2-3 | [ ] |
| 5 | Users can edit title inline | Existing (ItemNameEditor) | [ ] |
| 6 | Changes persisted to item's metadata | Existing (SET_ITEM_NAME) | [ ] |
| 7 | All fields visible on mobile/desktop | Task 3 (responsive grid) | [ ] |
| 8 | Title editing provides visual feedback | Existing (character counter, focus states) | [ ] |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| REQ-154 (purpose type) not complete | Task 6-7 provide fallback implementation |
| REQ-155 (titleGenerator) not complete | Task 5 can be skipped; title remains as `Room - Item` format |
| Layout breaks on small screens | Task 9 includes responsive testing |
| Type errors from missing purpose field | Task 1 verifies prerequisites before implementation |

---

## References

- **Overview Document:** `/docs/REQ-170-pre-populate-fields-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md` (Phase 5, Task 5.4)
- **Request Document:** `/docs/gen_requests.md` (REQ-170)
- **Related Requests:**
  - REQ-154: Introduce Purpose Selection Step
  - REQ-155: Generate Appropriate Titles Based on Item Purpose
  - REQ-156: Streamline Workflow State Machine
  - REQ-168: Redesign PreviewSaveStep Layout
- **Current Implementation:**
  - `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
  - `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
  - `src/components/ItemCreationWorkflow/utils/constants.ts`
  - `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`

---

## Implementation Order

Execute tasks in this order for optimal workflow:

1. **Task 1** - Verify prerequisites
2. **Task 6** - Add purpose to types (if needed)
3. **Task 7** - Add PURPOSE_LABELS (if needed)
4. **Task 8** - Initialize purpose in state
5. **Task 2** - Create ItemDetailsDisplay interface and component
6. **Task 3** - Add Item Details section to layout
7. **Task 4** - Add accessibility enhancements
8. **Task 5** - Integrate title auto-generation (after REQ-155)
9. **Task 9** - Manual integration testing
10. **Task 10** - Update documentation

---

*Document generated for FAQBNB project - REQ-170 implementation*
