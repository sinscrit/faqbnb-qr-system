# Implementation Breakdown: REQ-170 - Pre-populate Fields in Review Screen

**Document Generated:** 2026-01-09 23:15 UTC
**Last Modified:** 2026-01-09 23:15 UTC
**Request ID:** REQ-170
**Phase:** 5 - Redesign Review Screen
**Task ID:** 5.4
**Size:** S

---

## Overview

This document provides a detailed implementation breakdown for pre-populating item metadata fields in the PreviewSaveStep (review screen). The goal is to display the auto-generated title, room, item type, and purpose when users arrive at the review screen, with the ability to edit the title inline.

### Summary from Request

When users arrive at the review screen, they should see:
- **Title**: Auto-filled using `generateItemTitle()` function (editable)
- **Room**: Displayed from `currentItem.room` (read-only)
- **Item Type**: Displayed from `currentItem.itemType` (read-only)
- **Purpose**: Displayed from `currentItem.purpose` (read-only)

### Dependencies

This task depends on completion of:
1. **REQ-154**: Purpose Selection Step (adds `purpose` field to `CurrentItemState`)
2. **REQ-155**: Title Generator Utility (`generateItemTitle()` function)
3. **REQ-156**: State Machine Updates (to include purpose field)
4. **REQ-168**: Redesign PreviewSaveStep Layout (structural changes)

---

## Technical Context

### Existing Stack
- **Framework:** Next.js 15.5.9 with React 19.1.0
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS v4
- **State Management:** useReducer pattern via `useWorkflowState.ts`
- **UI Components:** Lucide React icons, Radix UI primitives

### Current Implementation

The `PreviewSaveStep.tsx` component currently:
- Displays an `ItemNameEditor` component for editing the item name
- Shows content pieces in a sortable grid with drag-and-drop
- Has save/cancel/retake functionality

**Missing functionality:**
- Does not display room, item type, or purpose metadata
- Does not use `generateItemTitle()` for auto-generation (currently uses `SELECT_SPECIFIC_ITEM` action which sets `itemName` as `${roomLabel} - ${specificItem}`)
- Purpose field does not exist yet in `CurrentItemState`

### Relevant Files

| File | Current State | Notes |
|------|---------------|-------|
| `PreviewSaveStep.tsx` | Exists | Main component to modify |
| `ItemCreationWorkflow.types.ts` | Exists | `CurrentItemState` needs `purpose` field |
| `constants.ts` | Exists | Needs `ROOM_LABELS`, `ITEM_TYPE_LABELS`, `PURPOSE_LABELS` |
| `titleGenerator.ts` | **Does not exist** | Needs to be created by REQ-155 |
| `useWorkflowState.ts` | Exists | Needs `purpose` in state and title auto-generation logic |

---

## Implementation Approach

### Phase 1: Add Item Details Section to PreviewSaveStep

Modify `PreviewSaveStep.tsx` to display an "Item Details" section above the existing "Item Name" section.

#### Task 1.1: Create ItemDetailsDisplay Sub-Component

Create a new sub-component within `PreviewSaveStep.tsx` to display read-only metadata:

```typescript
interface ItemDetailsDisplayProps {
  room: RoomType;
  itemType: ItemType;
  purpose: PurposeType | null;
}

function ItemDetailsDisplay({ room, itemType, purpose }: ItemDetailsDisplayProps) {
  // Render read-only fields with labels
}
```

**Fields to display:**
- Room label (from `ROOM_LABELS[currentItem.room]`)
- Item Type label (from `ITEM_TYPE_LABELS[currentItem.itemType]`)
- Purpose label (from `PURPOSE_LABELS[currentItem.purpose]` or "Not specified" if null)

#### Task 1.2: Update PreviewSaveStep Layout

1. Add import for label constants
2. Add `ItemDetailsDisplay` component above `ItemNameEditor`
3. Wrap title editing in a separate section header

**Layout structure:**
```
┌─────────────────────────────────────────┐
│ Header (Preview & Save)                 │
├─────────────────────────────────────────┤
│ Item Details Section                    │
│   ├── Room: Kitchen (read-only)         │
│   ├── Item Type: Appliance (read-only)  │
│   └── Purpose: How to Clean (read-only) │
├─────────────────────────────────────────┤
│ Title Section                           │
│   └── ItemNameEditor (editable)         │
├─────────────────────────────────────────┤
│ Content Section (existing grid)         │
└─────────────────────────────────────────┘
```

### Phase 2: Integrate Title Generator (Post REQ-155)

Once `titleGenerator.ts` is created by REQ-155, update the title auto-fill:

#### Task 2.1: Use generateItemTitle on Review Screen Load

The title should be auto-generated when:
1. User reaches purpose selection and selects a purpose → title auto-generates
2. User arrives at review screen → title should already be populated

**Implementation in `useWorkflowState.ts`:**
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
    itemName: autoTitle, // Auto-fill title
  };
  return { ...state, currentItem: updatedItem, isDirty: true };
}
```

#### Task 2.2: Allow Title Override

The existing `ItemNameEditor` already supports editing, which will override the auto-generated title. No additional changes needed.

### Phase 3: Props and Types Updates

#### Task 3.1: Update PreviewSaveStepProps (if needed)

The current props already receive `currentItem: CurrentItemState`, which will contain all necessary fields once `purpose` is added to the type.

---

## Authorized Files and Functions for Modification

### Files to Modify

| File Path | Change Type | Functions/Components to Modify |
|-----------|-------------|-------------------------------|
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | MODIFY | Add `ItemDetailsDisplay` sub-component, update layout |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | MODIFY | Add `purpose` field to `CurrentItemState` (if not done by REQ-154) |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | MODIFY | Add `PURPOSE_LABELS` constant (if not done by REQ-154) |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | MODIFY | Add title auto-generation in `SELECT_PURPOSE` case |

### Files to Create

| File Path | Purpose |
|-----------|---------|
| None | This task modifies existing files only |

### Files to Reference (Read-Only)

| File Path | Reason |
|-----------|--------|
| `src/components/ItemCreationWorkflow/components/shared/ItemNameEditor.tsx` | Understand existing title editing pattern |
| `src/components/ItemCreationWorkflow/components/shared/index.ts` | Check if new exports needed |
| `src/components/ItemCreationWorkflow/utils/titleGenerator.ts` | Import after REQ-155 creates it |

---

## Detailed Task Breakdown

### Task 1: Add Purpose Field to Types (if not already done)

**File:** `ItemCreationWorkflow.types.ts`

- [ ] Add `PurposeType` type definition:
```typescript
export type PurposeType =
  | 'how-to-use'
  | 'how-to-clean'
  | 'troubleshooting'
  | 'safety-info'
  | 'maintenance'
  | 'features'
  | 'other';
```

- [ ] Add `purpose` field to `CurrentItemState`:
```typescript
export interface CurrentItemState {
  // ... existing fields
  purpose: PurposeType | null;  // NEW
}
```

### Task 2: Add Label Constants (if not already done)

**File:** `constants.ts`

- [ ] Add `PURPOSE_LABELS` constant:
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

### Task 3: Create ItemDetailsDisplay Sub-Component

**File:** `PreviewSaveStep.tsx`

- [ ] Add imports for label constants
- [ ] Create `ItemDetailsDisplay` interface and component
- [ ] Style with consistent Tailwind classes matching existing component patterns
- [ ] Display three read-only fields: Room, Item Type, Purpose
- [ ] Handle null purpose gracefully (display "Not specified")

### Task 4: Update PreviewSaveStep Layout

**File:** `PreviewSaveStep.tsx`

- [ ] Add "Item Details" section before "Item Name" section
- [ ] Render `ItemDetailsDisplay` with values from `currentItem`
- [ ] Update section headers for clarity
- [ ] Ensure responsive layout on mobile

### Task 5: Update Title Auto-Generation Logic

**File:** `useWorkflowState.ts`

- [ ] Import `generateArticleTitle` from `titleGenerator.ts` (once created)
- [ ] Update `SELECT_PURPOSE` reducer case to auto-generate title
- [ ] Update `SELECT_SPECIFIC_ITEM` case to use new title format if purpose exists

### Task 6: Verify Integration

- [ ] Verify title displays correctly from auto-generation
- [ ] Verify room displays with correct label
- [ ] Verify item type displays with correct label
- [ ] Verify purpose displays with correct label (or "Not specified")
- [ ] Verify title editing still works (override behavior)

---

## UI/UX Specifications

### Item Details Section Design

```
┌─────────────────────────────────────────────────────────────┐
│ Item Details                                                │
│                                                             │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│ │ Room            │ │ Item Type       │ │ Purpose         ││
│ │ Kitchen         │ │ Appliance       │ │ How to Clean    ││
│ └─────────────────┘ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Styling:**
- Section background: White with light border (`border-gray-200`)
- Field labels: Small, medium weight, gray text (`text-sm font-medium text-[#717171]`)
- Field values: Regular size, dark text (`text-base text-[#222222]`)
- Layout: Responsive grid (3 columns on desktop, stacked on mobile)

### Title Section Design

The existing `ItemNameEditor` component will be reused with its current styling:
- Label with pencil icon
- Input field with character counter
- Helper text showing QR code label usage

---

## Acceptance Criteria Validation

From REQ-170 acceptance criteria:

| Criteria | Implementation |
|----------|----------------|
| Title auto-populated using `generateItemTitle()` | Task 5: Title auto-generated in `SELECT_PURPOSE` reducer case |
| Room displayed from `currentItem.room` | Task 3-4: `ItemDetailsDisplay` shows `ROOM_LABELS[room]` |
| Item type displayed from `currentItem.itemType` | Task 3-4: `ItemDetailsDisplay` shows `ITEM_TYPE_LABELS[itemType]` |
| Purpose displayed from `currentItem.purpose` | Task 3-4: `ItemDetailsDisplay` shows `PURPOSE_LABELS[purpose]` |
| Users can edit title inline | Existing `ItemNameEditor` supports editing |
| Changes persisted to item's metadata | Existing `setItemName` action handles persistence |
| All fields visible on mobile/desktop | Task 4: Responsive layout with grid |
| Title editing provides visual feedback | Existing `ItemNameEditor` has focus states |

---

## Testing Strategy

### Unit Tests

1. **ItemDetailsDisplay renders all fields**
   - Renders room label correctly
   - Renders item type label correctly
   - Renders purpose label correctly
   - Handles null purpose gracefully

2. **Title auto-generation**
   - Title generates on purpose selection
   - Title updates when purpose changes
   - Title can be manually edited (override)

### Integration Tests

1. **Complete workflow flow**
   - Navigate to PreviewSaveStep
   - Verify all pre-populated fields display
   - Edit title and verify it persists
   - Save item and verify metadata saved

### Manual Testing Checklist

- [ ] Desktop: All three metadata fields visible in single row
- [ ] Mobile: Metadata fields stack vertically
- [ ] Title auto-fills correctly based on purpose
- [ ] Title editing works smoothly
- [ ] Back navigation preserves edited title
- [ ] Save preserves all metadata correctly

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Purpose field not yet in state | High | Blocks implementation | Wait for REQ-154 or add field proactively |
| titleGenerator.ts not created | High | Blocks auto-title | Wait for REQ-155 or use fallback logic |
| Layout breaks on small screens | Medium | Poor UX | Test responsive design thoroughly |
| Label constants missing | Medium | Display issues | Add constants if not present |

---

## Effort Estimate

| Task | Estimate | Confidence |
|------|----------|------------|
| Add purpose to types | 0.5 hours | High |
| Add label constants | 0.5 hours | High |
| Create ItemDetailsDisplay | 1 hour | High |
| Update PreviewSaveStep layout | 1 hour | High |
| Update title auto-generation | 1 hour | Medium |
| Testing and verification | 1 hour | High |
| **Total** | **5 hours** | **High** |

---

## References

- **Implementation Plan:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md` (Phase 5, Task 5.4)
- **Request Document:** `/docs/gen_requests.md` (REQ-170)
- **Related Requests:**
  - REQ-154: Introduce Purpose Selection Step
  - REQ-155: Generate Appropriate Titles Based on Item Purpose
  - REQ-156: Streamline Workflow State Machine
  - REQ-168: Redesign PreviewSaveStep Layout
- **Current Implementation:**
  - `PreviewSaveStep.tsx`: Main component
  - `ItemNameEditor.tsx`: Title editing component
  - `useWorkflowState.ts`: State management hook
  - `constants.ts`: Label constants
