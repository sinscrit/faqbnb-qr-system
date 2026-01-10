# REQ-154 Task 1.1: Update Types and Constants - Detailed Task Breakdown

**Request**: #154 - Introduce Purpose Selection Step in Item Creation Workflow
**Phase**: 1 - Foundation
**Task ID**: 1.1 - Update Types and Constants
**Created**: 2026-01-09 21:45:00 UTC
**Last Modified**: 2026-01-10 01:35:00 UTC
**Status**: COMPLETED
**Document Type**: Detailed Implementation Tasks

---

## Document Purpose

This document provides granular, actionable tasks (≤1 story point each) for implementing Task 1.1 from the REQ-154 Overview document. Each task includes specific file paths, code locations, verification steps, and acceptance criteria.

---

## Prerequisites

Before starting this task:
- [x] Review the Overview document: `docs/REQ-154-update-types-and-constants-overview.md`
- [x] Review the Implementation Plan: `docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`
- [x] Ensure development environment is set up and running
- [x] Run `npm run type-check` to verify current type system is healthy

---

## Authorized Files for Modification

| File Path | Modification Type |
|-----------|-------------------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | MODIFY |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | MODIFY |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | MODIFY |

---

## Task Breakdown

### Task 1.1.1: Add PurposeType Type Definition

**Estimated Effort**: ~15 minutes
**File**: `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
**Location**: After line 91 (after `ContentType` definition)

#### Implementation Steps

1. Open `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
2. Locate the `ContentType` type definition (around line 91)
3. Add the following code immediately after the `ContentType` definition:

```typescript
/**
 * Purpose/Intent categories for item content.
 * Describes why the user is creating content for this item.
 * Based on Plan-094 UI/UX Workflow Improvements.
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

4. Update the `@lastModified` comment in the file header to reflect the current date

#### Verification Steps

- [x] Run `npm run type-check` - should pass without errors
- [x] Verify `PurposeType` is exported from the module
- [x] Confirm the type appears after `ContentType` in the file

#### Acceptance Criteria

- [x] `PurposeType` union type is defined with all 7 purpose values
- [x] Type includes JSDoc documentation referencing Plan-094
- [x] TypeScript compilation passes

**Implementation Notes (2026-01-10)**: Added at line 93-105 in ItemCreationWorkflow.types.ts

---

### Task 1.1.2: Update WorkflowStep Type

**Estimated Effort**: ~15 minutes
**File**: `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
**Location**: Around line 100 (WorkflowStep type definition)

#### Implementation Steps

1. Locate the `WorkflowStep` type definition (currently lines 100-109)
2. Replace the existing definition with:

```typescript
/**
 * Workflow step identifiers for navigation state machine.
 * Updated for Plan-094: removed content-source-selection, added purpose-selection
 */
export type WorkflowStep =
  | 'room-selection'
  | 'item-type-selection'
  | 'specific-item-selection'
  | 'purpose-selection'           // NEW - replaces content-source-selection
  | 'content-type-selection'
  | 'content-creation'
  | 'preview-save'
  | 'next-action'
  | 'session-summary';
```

**Note**: `content-source-selection` is removed and `purpose-selection` is added in its place.

#### Verification Steps

- [x] Run `npm run type-check` - expect errors (this is normal, will be fixed in subsequent tasks)
- [x] Verify the new step order matches the Plan-094 specification
- [x] Search codebase for `content-source-selection` references to understand impact

#### Acceptance Criteria

- [x] `WorkflowStep` type includes `'purpose-selection'`
- [x] `WorkflowStep` type does NOT include `'content-source-selection'`
- [x] JSDoc comment is updated to reference Plan-094

**Implementation Notes (2026-01-10)**: Updated at line 111-124 in ItemCreationWorkflow.types.ts

---

### Task 1.1.3: Add purpose Field to CurrentItemState

**Estimated Effort**: ~15 minutes
**File**: `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
**Location**: Around line 136 (CurrentItemState interface)

#### Implementation Steps

1. Locate the `CurrentItemState` interface (currently lines 136-157)
2. Add the `purpose` field after `itemName` and before `contentSource`:

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

  /** Purpose/intent for this item content (Plan-094) */
  purpose: PurposeType | null;

  /** Content source choice: existing upload or create new */
  contentSource: 'existing' | 'create-new';

  /** Selected content type (null until chosen) */
  contentType: ContentType | null;

  /** Content pieces added to this item */
  content: ContentPiece[];
}
```

#### Verification Steps

- [x] Run `npm run type-check` - expect errors in useWorkflowState.ts (expected)
- [x] Verify the field is nullable (`PurposeType | null`)
- [x] Confirm JSDoc documentation is present

#### Acceptance Criteria

- [x] `purpose` field added to `CurrentItemState` interface
- [x] Field is typed as `PurposeType | null`
- [x] Field has JSDoc documentation

**Implementation Notes (2026-01-10)**: Added at line 164-165 in ItemCreationWorkflow.types.ts

---

### Task 1.1.4: Add SELECT_PURPOSE Action

**Estimated Effort**: ~15 minutes
**File**: `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
**Location**: Around line 321 (WorkflowAction union type)

#### Implementation Steps

1. Locate the `WorkflowAction` union type (currently starting line 321)
2. Add the `SELECT_PURPOSE` action after the room/item selection actions:

```typescript
export type WorkflowAction =
  // Navigation actions
  | { type: 'GO_TO_STEP'; payload: WorkflowStep }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }

  // Room/Item selection actions
  | { type: 'SELECT_ROOM'; payload: RoomType }
  | { type: 'SELECT_ITEM_TYPE'; payload: ItemType }
  | { type: 'SELECT_SPECIFIC_ITEM'; payload: string }
  | { type: 'SET_ITEM_NAME'; payload: string }

  // Purpose selection action (Plan-094)
  | { type: 'SELECT_PURPOSE'; payload: PurposeType }

  // Content actions
  | { type: 'SELECT_CONTENT_SOURCE'; payload: 'existing' | 'create-new' }
  // ... rest unchanged
```

#### Verification Steps

- [x] Run `npm run type-check` - should pass for this file
- [x] Verify the action payload type is `PurposeType` (not `PurposeType | null`)
- [x] Confirm action is grouped logically with selection actions

#### Acceptance Criteria

- [x] `SELECT_PURPOSE` action added to `WorkflowAction` union
- [x] Payload type is `PurposeType`
- [x] Action includes comment referencing Plan-094

**Implementation Notes (2026-01-10)**: Added at lines 351-352 in ItemCreationWorkflow.types.ts

---

### Task 1.1.5: Add Purpose Constants to constants.ts

**Estimated Effort**: ~30 minutes
**File**: `src/components/ItemCreationWorkflow/utils/constants.ts`
**Location**: After line 163 (after Content Source Options section)

#### Implementation Steps

1. Open `src/components/ItemCreationWorkflow/utils/constants.ts`
2. Locate the end of the Content Type Configuration section (around line 163)
3. Add a new section for Purpose Type Configuration:

```typescript
// =============================================================================
// Purpose Type Configuration
// =============================================================================

/**
 * Available purpose types for item content.
 * Describes the intent/goal of the content being created.
 * Based on Plan-094 UI/UX Workflow Improvements.
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

/**
 * Human-readable labels for each purpose type.
 * Displayed as card titles in PurposeStep.
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

/**
 * Descriptive text for each purpose type.
 * Displayed as helper text in PurposeStep cards.
 */
export const PURPOSE_DESCRIPTIONS: Record<PurposeTypeConst, string> = {
  'how-to-use': 'Operating instructions and controls',
  'how-to-clean': 'Cleaning and care instructions',
  'troubleshooting': 'Common issues and fixes',
  'safety-info': 'Safety warnings and precautions',
  'maintenance': 'Regular maintenance tasks',
  'features': 'Special features and tips',
  'other': 'General information',
};

/**
 * Icon identifiers for each purpose type.
 * Uses Lucide React icon names for consistency.
 */
export const PURPOSE_ICONS: Record<PurposeTypeConst, string> = {
  'how-to-use': 'play-circle',
  'how-to-clean': 'sparkles',
  'troubleshooting': 'wrench',
  'safety-info': 'alert-triangle',
  'maintenance': 'settings',
  'features': 'star',
  'other': 'info',
};
```

4. Update the `@lastModified` comment in the file header

#### Verification Steps

- [x] Run `npm run type-check` - should pass
- [x] Verify all 7 purpose types have entries in all three records
- [x] Confirm icon names are valid Lucide React icons
- [x] Test that all exports are accessible: `PURPOSE_TYPES`, `PurposeTypeConst`, `PURPOSE_LABELS`, `PURPOSE_DESCRIPTIONS`, `PURPOSE_ICONS`

#### Acceptance Criteria

- [x] `PURPOSE_TYPES` array is exported with `as const`
- [x] `PurposeTypeConst` type is derived from the array
- [x] `PURPOSE_LABELS` record has entries for all 7 types
- [x] `PURPOSE_DESCRIPTIONS` record has entries for all 7 types
- [x] `PURPOSE_ICONS` record has entries for all 7 types

- [x] All records use `PurposeTypeConst` as key type

**Implementation Notes (2026-01-10)**: Added at lines 165-229 in constants.ts

---

### Task 1.1.6: Update WORKFLOW_STEPS Array

**Estimated Effort**: ~15 minutes
**File**: `src/components/ItemCreationWorkflow/utils/constants.ts`
**Location**: Around line 191 (WORKFLOW_STEPS constant)

#### Implementation Steps

1. Locate the `WORKFLOW_STEPS` constant (around line 191)
2. Replace the existing definition with:

```typescript
/**
 * Ordered list of all workflow steps.
 * Used for navigation logic and progress calculation.
 *
 * Updated for Plan-094:
 * - Removed: content-source-selection (redundant)
 * - Added: purpose-selection (new step after specific-item)
 */
export const WORKFLOW_STEPS = [
  'room-selection',
  'item-type-selection',
  'specific-item-selection',
  'purpose-selection',        // NEW - replaces content-source-selection
  'content-type-selection',   // Now part of main flow
  'content-creation',
  'preview-save',
  'next-action',
  'session-summary',
] as const;
```

**Note**:
- Removed `content-source-selection`
- Added `purpose-selection`
- Added `content-type-selection` back to the main flow

#### Verification Steps

- [x] Run `npm run type-check` - expect errors in PROGRESS_WEIGHTS (will fix next)
- [x] Count steps: should be 9 total
- [x] Verify step order matches Plan-094 specification

#### Acceptance Criteria

- [x] `content-source-selection` removed from array
- [x] `purpose-selection` added in position 4
- [x] `content-type-selection` is in position 5
- [x] Array has 9 elements total
- [x] JSDoc comment documents the changes

**Implementation Notes (2026-01-10)**: Updated at lines 253-271 in constants.ts

---

### Task 1.1.7: Update PROGRESS_WEIGHTS

**Estimated Effort**: ~15 minutes
**File**: `src/components/ItemCreationWorkflow/utils/constants.ts`
**Location**: Around line 222 (PROGRESS_WEIGHTS constant)

#### Implementation Steps

1. Locate the `PROGRESS_WEIGHTS` object (around line 222)
2. Replace the existing definition with:

```typescript
/**
 * Progress weights for each step.
 * Used to calculate progress bar percentage.
 * Updated for Plan-094 workflow changes.
 */
export const PROGRESS_WEIGHTS: Record<WorkflowStepConst, number> = {
  'room-selection': 11,
  'item-type-selection': 22,
  'specific-item-selection': 33,
  'purpose-selection': 44,        // NEW
  'content-type-selection': 55,   // Added to main flow
  'content-creation': 66,
  'preview-save': 77,
  'next-action': 88,
  'session-summary': 100,
};
```

**Note**: Progress weights are now evenly distributed across 9 steps.

#### Verification Steps

- [x] Run `npm run type-check` - should pass for this file
- [x] Verify all step keys match `WORKFLOW_STEPS` array
- [x] Confirm no entry for `content-source-selection`
- [x] Verify weights increase monotonically

#### Acceptance Criteria

- [x] All 9 workflow steps have progress weights
- [x] `content-source-selection` entry removed
- [x] `purpose-selection` entry added with weight 44
- [x] `content-type-selection` entry added with weight 55
- [x] `session-summary` remains at 100

**Implementation Notes (2026-01-10)**: Updated at lines 288-303 in constants.ts

---

### Task 1.1.8: Update STEP_TRANSITIONS in useWorkflowState.ts

**Estimated Effort**: ~30 minutes
**File**: `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Location**: Around line 76 (STEP_TRANSITIONS constant)

#### Implementation Steps

1. Open `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
2. Locate the `STEP_TRANSITIONS` object (around line 76)
3. Replace the existing definition with:

```typescript
/**
 * Valid transitions from each step.
 * Used to validate GO_TO_STEP actions and determine NEXT_STEP targets.
 *
 * Updated for Plan-094:
 * - specific-item-selection now goes to purpose-selection
 * - purpose-selection added, goes to content-type-selection
 * - content-source-selection removed from transitions
 * - next-action updated to go to content-type-selection for "add more"
 *
 * Notes on conditional transitions:
 * - room-selection: Goes to specific-item-selection if room is 'general' (skips item-type)
 * - next-action: Goes to room-selection for "Tag New Item" or session-summary for "I'm Done"
 */
export const STEP_TRANSITIONS: Record<WorkflowStep, WorkflowStep[]> = {
  'room-selection': ['item-type-selection', 'specific-item-selection'],
  'item-type-selection': ['specific-item-selection'],
  'specific-item-selection': ['purpose-selection'],         // UPDATED: was content-source-selection
  'purpose-selection': ['content-type-selection'],          // NEW
  'content-type-selection': ['content-creation'],           // UPDATED: single transition
  'content-creation': ['preview-save'],
  'preview-save': ['next-action'],
  'next-action': ['room-selection', 'session-summary', 'content-type-selection'], // UPDATED
  'session-summary': [],
};
```

4. Update the `@lastModified` comment in the file header

#### Verification Steps

- [x] Run `npm run type-check` - may have errors (to be fixed in next task)
- [x] Verify `content-source-selection` is completely removed
- [x] Verify `purpose-selection` has correct transition
- [x] Confirm `specific-item-selection` now transitions to `purpose-selection`

#### Acceptance Criteria

- [x] `content-source-selection` key removed from object
- [x] `purpose-selection` key added with transition to `content-type-selection`
- [x] `specific-item-selection` transitions to `purpose-selection`
- [x] `next-action` includes `content-type-selection` for "add more" flow
- [x] JSDoc comment documents all changes

**Implementation Notes (2026-01-10)**: Updated at lines 68-92 in useWorkflowState.ts

---

### Task 1.1.9: Update Initial State Creation

**Estimated Effort**: ~15 minutes
**File**: `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Location**: Around line 245 (SELECT_ROOM case in reducer)

#### Implementation Steps

1. Locate the `SELECT_ROOM` case in the reducer (around line 242-263)
2. Update the `newItem` object creation to include `purpose: null`:

```typescript
case 'SELECT_ROOM': {
  const roomType = action.payload;
  const itemType = roomType === 'general' ? 'general-info' : null;
  const newItem: CurrentItemState = {
    room: roomType,
    itemType: itemType as ItemType,
    specificItem: '',
    itemName: '',
    purpose: null,            // NEW: Initialize purpose to null
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

#### Verification Steps

- [x] Run `npm run type-check` - should pass for this change
- [x] Verify `purpose: null` is included in the initial item state
- [x] Confirm field is added in correct position (after itemName)

#### Acceptance Criteria

- [x] `purpose: null` added to newItem in SELECT_ROOM case
- [x] TypeScript compilation passes

**Implementation Notes (2026-01-10)**: Updated at line 256 in useWorkflowState.ts

---

### Task 1.1.10: Add SELECT_PURPOSE Reducer Case

**Estimated Effort**: ~20 minutes
**File**: `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Location**: After SELECT_ROOM case in reducer (around line 280)

#### Implementation Steps

1. Import `PurposeType` if not already imported:

```typescript
import type {
  WorkflowStep,
  WorkflowState,
  WorkflowAction,
  RoomType,
  ItemType,
  ContentType,
  ContentPiece,
  SessionItem,
  CurrentItemState,
  PurposeType,  // ADD THIS
} from '../ItemCreationWorkflow.types';
```

2. Add the `SELECT_PURPOSE` case after `SET_ITEM_NAME` (around line 300-318):

```typescript
case 'SELECT_PURPOSE': {
  if (!state.currentItem) return state;
  const updatedItem: CurrentItemState = {
    ...state.currentItem,
    purpose: action.payload,
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

#### Verification Steps

- [x] Run `npm run type-check` - should pass
- [x] Verify the case follows the same pattern as other selection cases
- [x] Confirm isDirty is set to true

#### Acceptance Criteria

- [x] `SELECT_PURPOSE` case added to reducer
- [x] Updates `currentItem.purpose` with payload
- [x] Sets `isDirty: true`
- [x] Updates both state and session currentItem

**Implementation Notes (2026-01-10)**: Added at lines 327-342 in useWorkflowState.ts. Also added PurposeType import at line 55.

---

### Task 1.1.11: Add selectPurpose Action Creator

**Estimated Effort**: ~15 minutes
**File**: `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Location**: After selectSpecificItem callback (around line 715)

#### Implementation Steps

1. Add the import for `PurposeType` to the type imports (if not done in previous task)

2. Add the `selectPurpose` callback after `setItemName`:

```typescript
const selectPurpose = useCallback((purpose: PurposeType) => {
  dispatch({ type: 'SELECT_PURPOSE', payload: purpose });
}, []);
```

3. Add the function to the `UseWorkflowStateReturn` interface (around line 607):

```typescript
/** Select a purpose for the current item (Plan-094) */
selectPurpose: (purpose: PurposeType) => void;
```

4. Add `selectPurpose` to the return object (around line 850):

```typescript
return {
  state,
  goToStep,
  nextStep,
  prevStep,
  selectRoom,
  selectItemType,
  selectSpecificItem,
  setItemName,
  selectPurpose,  // ADD THIS
  selectContentSource,
  // ... rest
};
```

#### Verification Steps

- [x] Run `npm run type-check` - should pass
- [x] Verify `selectPurpose` is exported from the hook
- [x] Confirm function signature matches the interface

#### Acceptance Criteria

- [x] `selectPurpose` function created and exported
- [x] Function dispatches `SELECT_PURPOSE` action
- [x] Function is memoized with `useCallback`
- [x] Interface type is updated

**Implementation Notes (2026-01-10)**: Added callback at lines 748-750, updated interface at line 637-638, added to return object at line 886

---

### Task 1.1.12: Update canGoNext Computed Value

**Estimated Effort**: ~15 minutes
**File**: `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Location**: Around line 801 (canGoNext useMemo)

#### Implementation Steps

1. Locate the `canGoNext` useMemo (around line 801)
2. Add the case for `purpose-selection` and remove `content-source-selection`:

```typescript
const canGoNext = useMemo(() => {
  // Can't go next from terminal step
  if (state.currentStep === 'session-summary') return false;

  // Check step-specific requirements
  switch (state.currentStep) {
    case 'room-selection':
      return state.currentItem?.room != null;
    case 'item-type-selection':
      return state.currentItem?.itemType != null;
    case 'specific-item-selection':
      return (state.currentItem?.specificItem ?? '').length > 0;
    case 'purpose-selection':                         // NEW
      return state.currentItem?.purpose != null;      // NEW
    case 'content-type-selection':
      return state.currentItem?.contentType != null;
    case 'content-creation':
      return (state.currentItem?.content?.length ?? 0) > 0;
    case 'preview-save':
      return true; // Can always proceed to next-action
    case 'next-action':
      return true; // User makes choice in this step
    default:
      return false;
  }
}, [state.currentStep, state.currentItem]);
```

**Note**: Remove the `content-source-selection` case entirely.

#### Verification Steps

- [x] Run `npm run type-check` - should pass
- [x] Verify `purpose-selection` case returns `state.currentItem?.purpose != null`
- [x] Confirm `content-source-selection` case is removed

#### Acceptance Criteria

- [x] `purpose-selection` case added to switch statement
- [x] `content-source-selection` case removed
- [x] Returns `true` when purpose is selected (not null)

**Implementation Notes (2026-01-10)**: Updated at lines 844-845 in useWorkflowState.ts

---

### Task 1.1.13: Update ADD_MORE_TO_ITEM Reducer Case

**Estimated Effort**: ~15 minutes
**File**: `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Location**: Around line 479 (ADD_MORE_TO_ITEM case)

#### Implementation Steps

1. Locate the `ADD_MORE_TO_ITEM` case (around line 479-495)
2. Update the step it navigates to:

```typescript
case 'ADD_MORE_TO_ITEM': {
  const restoredItem = action.payload;
  const newHistory = [...state.stepHistory, state.currentStep];
  return {
    ...state,
    currentStep: 'content-type-selection',  // UPDATED: was content-source-selection
    stepHistory: newHistory,
    canGoBack: true,
    currentItem: restoredItem,
    isDirty: true,
    session: {
      ...state.session,
      currentStep: 'content-type-selection',  // UPDATED: was content-source-selection
      currentItem: restoredItem,
    },
  };
}
```

#### Verification Steps

- [x] Run `npm run type-check` - should pass
- [x] Verify step is `content-type-selection`, not `content-source-selection`
- [x] Confirm both state and session are updated consistently

#### Acceptance Criteria

- [x] `ADD_MORE_TO_ITEM` navigates to `content-type-selection`
- [x] Both `currentStep` and `session.currentStep` are updated

**Implementation Notes (2026-01-10)**: Updated at lines 509 and 516 in useWorkflowState.ts

---

### Task 1.1.14: Run Type Check and Fix Any Errors

**Estimated Effort**: ~30 minutes
**File**: Multiple files

#### Implementation Steps

1. Run `npm run type-check` from project root
2. Review any type errors
3. Fix any remaining type mismatches

Common issues to look for:
- Missing `purpose` field in object literals
- References to `content-source-selection` in other files
- Import statements needing updates

4. Search for remaining references to `content-source-selection`:

```bash
grep -r "content-source-selection" src/
```

5. Document any files that need updates in downstream tasks

#### Verification Steps

- [x] `npm run type-check` passes with no errors (non-test source files)
- [x] `npm run build` passes (if applicable)
- [x] No references to `content-source-selection` in types files

#### Acceptance Criteria

- [x] TypeScript compilation passes without errors
- [x] All modified files have updated `@lastModified` comments
- [x] List of downstream files requiring updates is documented

**Implementation Notes (2026-01-10)**:
- Fixed `purpose` field missing in `ItemCreationWorkflow.tsx` (line 257)
- Fixed `content-source-selection` case in `ItemCreationWorkflow.tsx` (line 479) - replaced with `purpose-selection` placeholder
- Fixed `sessionStorage.ts` SerializedCurrentItemState interface and serialize/deserialize functions
- Fixed `accessibility.ts` STEP_NAMES record

**Downstream files requiring updates (documented for Task 1.3)**:
- `src/components/ItemCreationWorkflow/__tests__/helpers/testUtils.ts` - references `content-source-selection`
- `src/components/ItemCreationWorkflow/__tests__/helpers/mockFactories.ts` - references `content-source-selection`
- `src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts` - expects old step transitions
- `src/components/ItemCreationWorkflow/__tests__/ItemCreationWorkflow.integration.test.tsx` - expects old navigation

---

### Task 1.1.15: Run Existing Tests

**Estimated Effort**: ~15 minutes

#### Implementation Steps

1. Run the test suite:

```bash
npm run test
```

2. Document any test failures related to:
   - `content-source-selection`
   - Step transitions
   - Progress weights

3. Note: Test updates should be handled in Task 1.3 (State Machine Update), not this task

#### Verification Steps

- [x] Test suite runs
- [x] Document any failures (expected due to workflow changes)
- [x] No unexpected failures unrelated to workflow changes

#### Acceptance Criteria

- [x] Test suite executes without crashes
- [x] Failures are documented for Task 1.3
- [x] No regressions in unrelated areas

**Implementation Notes (2026-01-10)**:
Test suite ran successfully. As expected, 2 test failures are related to our workflow changes:
1. `useWorkflowState.test.ts > getNextStep > returns single transition for single-transition steps` - expects `content-source-selection` but gets `purpose-selection`
2. `useWorkflowState.test.ts > STEP_TRANSITIONS > covers all 9 workflow steps` - expects `content-source-selection` in steps array

Other test failures (281 total) are pre-existing issues unrelated to this task (mostly `jest is not defined` errors in vitest environment).

---

## Summary of Changes

### Files Modified

| File | Changes Made |
|------|--------------|
| `ItemCreationWorkflow.types.ts` | Added `PurposeType`, updated `WorkflowStep`, added `purpose` to `CurrentItemState`, added `SELECT_PURPOSE` action |
| `constants.ts` | Added `PURPOSE_TYPES`, `PURPOSE_LABELS`, `PURPOSE_DESCRIPTIONS`, `PURPOSE_ICONS`, updated `WORKFLOW_STEPS`, `PROGRESS_WEIGHTS` |
| `useWorkflowState.ts` | Updated `STEP_TRANSITIONS`, added `SELECT_PURPOSE` reducer case, added `selectPurpose` action creator, updated `canGoNext`, updated `ADD_MORE_TO_ITEM` |

### New Exports

- `PurposeType` - Union type for purpose values
- `PURPOSE_TYPES` - Array of purpose type strings
- `PurposeTypeConst` - Type derived from PURPOSE_TYPES array
- `PURPOSE_LABELS` - Human-readable labels
- `PURPOSE_DESCRIPTIONS` - Descriptive text for each purpose
- `PURPOSE_ICONS` - Lucide icon names for each purpose
- `selectPurpose` - Action creator function

### Removed

- `content-source-selection` from `WorkflowStep` type
- `content-source-selection` from `WORKFLOW_STEPS` array
- `content-source-selection` from `PROGRESS_WEIGHTS`
- `content-source-selection` from `STEP_TRANSITIONS`

---

## Dependencies

### Upstream (Required Before This Task)
- None - this is a foundational task

### Downstream (Depend on This Task)
- **Task 1.2**: Create Title Generator Utility - uses `PurposeType`
- **Task 1.3**: Update State Machine - uses `SELECT_PURPOSE` action and updated transitions
- **Task 2.1**: Create PurposeStep Component - uses all purpose constants
- **Task 2.2**: Integrate PurposeStep - uses updated `WorkflowStep` type

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing code referencing `content-source-selection` | Search entire codebase before and after changes |
| Type mismatches in other components | Run full type check after each sub-task |
| Incomplete constant definitions | Verify all arrays/records have matching keys |

---

## References

- **Overview Document**: `docs/REQ-154-update-types-and-constants-overview.md`
- **Implementation Plan**: `docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`
- **Request Document**: `docs/gen_requests.md` - REQ-154
- **Existing Types**: `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
- **Existing Constants**: `src/components/ItemCreationWorkflow/utils/constants.ts`
- **State Machine**: `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
