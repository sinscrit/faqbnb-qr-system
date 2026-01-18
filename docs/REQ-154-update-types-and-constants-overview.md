# REQ-154 Task 1.1: Update Types and Constants - Implementation Overview

**Request**: #154 - Introduce Purpose Selection Step in Item Creation Workflow
**Phase**: 1 - Foundation
**Task ID**: 1.1 - Update Types and Constants
**Created**: 2026-01-09
**Last Modified**: 2026-01-09

---

## Executive Summary

This task updates the type definitions and constants required to support the new Purpose Selection step in the ItemCreationWorkflow. The changes include adding a new `PurposeType` type, updating the `CurrentItemState` interface to track purpose, adding the `SELECT_PURPOSE` action, and updating workflow step arrays/constants to reflect the new workflow order (removing `content-source-selection` and adding `purpose-selection`).

---

## Scope

### In Scope
- Add `PurposeType` type definition to `ItemCreationWorkflow.types.ts`
- Add `purpose` field to `CurrentItemState` interface
- Add `SELECT_PURPOSE` action to `WorkflowAction` union type
- Update `WorkflowStep` type to include `'purpose-selection'`
- Add `PURPOSE_TYPES` constant array to `constants.ts`
- Add `PURPOSE_LABELS` and `PURPOSE_DESCRIPTIONS` to `constants.ts`
- Update `WORKFLOW_STEPS` array (remove `content-source-selection`, add `purpose-selection`)
- Update `PROGRESS_WEIGHTS` for new step order
- Update `STEP_TRANSITIONS` in `useWorkflowState.ts`

### Out of Scope
- Creating the PurposeStep component (Task 2.1)
- Implementing the title generator utility (Task 1.2)
- Updating the state machine reducer logic (Task 1.3)
- UI rendering changes in ItemCreationWorkflow.tsx

---

## Technical Context

### Existing Patterns

The codebase follows established patterns for type definitions and constants:

1. **Type Definitions** (`ItemCreationWorkflow.types.ts`):
   - Uses TypeScript union types for domain values (e.g., `RoomType`, `ItemType`, `ContentType`)
   - Interfaces are well-documented with JSDoc comments
   - `WorkflowAction` uses discriminated union pattern with `type` field

2. **Constants** (`constants.ts`):
   - Arrays defined with `as const` for type inference
   - Companion `*Const` types derived from arrays using `(typeof ARRAY)[number]`
   - Labels and descriptions stored in `Record<Type, string>` objects
   - Icons stored in similar records referencing Lucide icon names

3. **State Transitions** (`useWorkflowState.ts`):
   - `STEP_TRANSITIONS` maps each step to valid next steps
   - Step flow documented in comments
   - Progress weights assigned to each step

### Current Workflow Flow

```
1. room-selection
2. item-type-selection
3. specific-item-selection
4. content-source-selection    <-- TO BE REMOVED
5. content-type-selection      <-- Currently not in WORKFLOW_STEPS (handled differently)
6. content-creation
7. preview-save
8. next-action
9. session-summary
```

### Target Workflow Flow

```
1. room-selection
2. item-type-selection
3. specific-item-selection
4. purpose-selection           <-- NEW STEP
5. content-type-selection      <-- Direct jump after purpose
6. content-creation
7. preview-save
8. next-action
9. session-summary
```

---

## Implementation Details

### Task 1.1.1: Add PurposeType Definition

**File**: `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`

Add after line 91 (after `ContentType` definition):

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

### Task 1.1.2: Update CurrentItemState Interface

**File**: `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`

Update the `CurrentItemState` interface (around line 136) to add the `purpose` field:

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

  /** Purpose/intent for this item content (NEW) */
  purpose: PurposeType | null;

  /** Content source choice: existing upload or create new */
  contentSource: 'existing' | 'create-new';

  /** Selected content type (null until chosen) */
  contentType: ContentType | null;

  /** Content pieces added to this item */
  content: ContentPiece[];
}
```

### Task 1.1.3: Add SELECT_PURPOSE Action

**File**: `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`

Add to the `WorkflowAction` union type (around line 328):

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

  // Purpose selection action (NEW)
  | { type: 'SELECT_PURPOSE'; payload: PurposeType }

  // Content actions
  | { type: 'SELECT_CONTENT_SOURCE'; payload: 'existing' | 'create-new' }
  | { type: 'SELECT_CONTENT_TYPE'; payload: ContentType }
  // ... rest unchanged
```

### Task 1.1.4: Update WorkflowStep Type

**File**: `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`

Update the `WorkflowStep` type (around line 100):

```typescript
/**
 * Workflow step identifiers for navigation state machine.
 * Updated for Plan-094: removed content-source-selection, added purpose-selection
 */
export type WorkflowStep =
  | 'room-selection'
  | 'item-type-selection'
  | 'specific-item-selection'
  | 'purpose-selection'          // NEW
  // | 'content-source-selection' // REMOVED - redundant step
  | 'content-type-selection'
  | 'content-creation'
  | 'preview-save'
  | 'next-action'
  | 'session-summary';
```

### Task 1.1.5: Add Purpose Constants

**File**: `src/components/ItemCreationWorkflow/utils/constants.ts`

Add after the Content Type Configuration section (around line 163):

```typescript
// =============================================================================
// Purpose Type Configuration
// =============================================================================

/**
 * Available purpose types for item content.
 * Describes the intent/goal of the content being created.
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

### Task 1.1.6: Update WORKFLOW_STEPS Array

**File**: `src/components/ItemCreationWorkflow/utils/constants.ts`

Update the `WORKFLOW_STEPS` array (around line 191):

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

### Task 1.1.7: Update PROGRESS_WEIGHTS

**File**: `src/components/ItemCreationWorkflow/utils/constants.ts`

Update the `PROGRESS_WEIGHTS` object (around line 222):

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
  'purpose-selection': 44,       // NEW
  'content-type-selection': 55,  // Updated (was not included before)
  'content-creation': 66,
  'preview-save': 77,
  'next-action': 88,
  'session-summary': 100,
};
```

### Task 1.1.8: Update STEP_TRANSITIONS

**File**: `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`

Update the `STEP_TRANSITIONS` object (around line 76):

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
 */
export const STEP_TRANSITIONS: Record<WorkflowStep, WorkflowStep[]> = {
  'room-selection': ['item-type-selection', 'specific-item-selection'],
  'item-type-selection': ['specific-item-selection'],
  'specific-item-selection': ['purpose-selection'],    // UPDATED: was content-source-selection
  'purpose-selection': ['content-type-selection'],     // NEW
  'content-type-selection': ['content-creation'],      // UPDATED: single transition
  'content-creation': ['preview-save'],
  'preview-save': ['next-action'],
  'next-action': ['room-selection', 'session-summary', 'content-type-selection'], // UPDATED
  'session-summary': [],
};
```

---

## Authorized Files and Functions for Modification

| File | Section/Function | Change Type | Purpose |
|------|------------------|-------------|---------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | After `ContentType` type | ADD | Add `PurposeType` union type |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | `WorkflowStep` type | MODIFY | Add `'purpose-selection'`, remove `'content-source-selection'` |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | `CurrentItemState` interface | MODIFY | Add `purpose: PurposeType \| null` field |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | `WorkflowAction` union | ADD | Add `SELECT_PURPOSE` action |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | After Content Type section | ADD | Add `PURPOSE_TYPES`, `PURPOSE_LABELS`, `PURPOSE_DESCRIPTIONS`, `PURPOSE_ICONS` |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | `WORKFLOW_STEPS` array | MODIFY | Update step order |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | `PROGRESS_WEIGHTS` object | MODIFY | Update weights for new steps |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | `STEP_TRANSITIONS` object | MODIFY | Update transition mappings |

---

## Dependencies

### Upstream Dependencies
- None - this is a foundational task

### Downstream Dependencies (tasks that depend on this)
- **Task 1.2**: Create Title Generator Utility - uses `PurposeType`
- **Task 1.3**: Update State Machine - uses `SELECT_PURPOSE` action and `STEP_TRANSITIONS`
- **Task 2.1**: Create PurposeStep Component - uses `PURPOSE_TYPES`, `PURPOSE_LABELS`, etc.
- **Task 2.2**: Integrate PurposeStep into Workflow - uses updated `WorkflowStep` type

---

## Testing Strategy

### Unit Tests
1. **Type Verification**: Ensure TypeScript compilation passes with new types
2. **Constant Completeness**: Verify all `PURPOSE_TYPES` have corresponding entries in `PURPOSE_LABELS`, `PURPOSE_DESCRIPTIONS`, and `PURPOSE_ICONS`
3. **Step Transition Validity**: Test that `STEP_TRANSITIONS` contains valid step references

### Manual Verification
1. Run `npm run type-check` or `tsc --noEmit` to verify type correctness
2. Ensure existing tests still pass (no regressions)

---

## Acceptance Criteria

- [ ] `PurposeType` is exported from `ItemCreationWorkflow.types.ts`
- [ ] `CurrentItemState` interface includes `purpose: PurposeType | null`
- [ ] `WorkflowAction` union includes `{ type: 'SELECT_PURPOSE'; payload: PurposeType }`
- [ ] `WorkflowStep` type includes `'purpose-selection'` and excludes `'content-source-selection'`
- [ ] `PURPOSE_TYPES` array is exported from `constants.ts`
- [ ] `PURPOSE_LABELS`, `PURPOSE_DESCRIPTIONS`, `PURPOSE_ICONS` are exported
- [ ] `WORKFLOW_STEPS` reflects new step order
- [ ] `PROGRESS_WEIGHTS` has entries for all new steps
- [ ] `STEP_TRANSITIONS` has correct mappings for new workflow
- [ ] TypeScript compilation passes without errors
- [ ] All existing unit tests pass

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing code referencing `content-source-selection` | High | Medium | Search codebase for all references before removal |
| Type mismatch in existing components | Medium | Medium | Run full type check before committing |
| Step index calculations affected | Low | Low | Update `currentStepIndex` uses if needed |

---

## Implementation Order

1. Add `PurposeType` type definition (no dependencies)
2. Update `WorkflowStep` type (required before constants update)
3. Add `purpose` field to `CurrentItemState` (depends on `PurposeType`)
4. Add `SELECT_PURPOSE` action (depends on `PurposeType`)
5. Add purpose constants (`PURPOSE_TYPES`, labels, descriptions, icons)
6. Update `WORKFLOW_STEPS` array
7. Update `PROGRESS_WEIGHTS`
8. Update `STEP_TRANSITIONS` (final step, depends on all above)
9. Run type check and tests

---

## References

- **Implementation Plan**: `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`
- **Request Document**: `/docs/gen_requests.md` - REQ-154
- **Existing Types**: `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
- **Existing Constants**: `/src/components/ItemCreationWorkflow/utils/constants.ts`
- **State Machine**: `/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
