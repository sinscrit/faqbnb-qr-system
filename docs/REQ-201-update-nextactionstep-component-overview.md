# Technical Implementation Breakdown: REQ-201 - Update NextActionStep Component

**Generated:** 2026-01-12 16:30:00 UTC
**Last Modified:** 2026-01-12 16:30:00 UTC
**Request ID:** REQ-201
**Plan Reference:** Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md
**Phase:** 2 - Fix "What's Next" Screen (ITEM-03) - HIGH Priority
**Task ID:** 2.1

---

## Summary

Update the NextActionStep component to present users with a clear post-workflow decision menu featuring four distinct options: Edit Instructions, Add New Instructions, Create New Item, and Done. This involves integrating or refactoring the existing WhatsNextStep component (already implemented in ItemCapture) to serve the ItemCreationWorkflow.

---

## Current State Analysis

### Existing NextActionStep Component

**Location:** `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`

**Current Interface:**
```typescript
export interface NextActionStepProps {
  /** Number of items created in this session */
  itemsCreated: number;
  /** Whether user has added any content that would be lost on cancel */
  hasUnsavedContent: boolean;
  /** Callback when user selects "Review & Submit" */
  onReviewSubmit: () => void;
  /** Callback when user selects "Add More Content" */
  onAddMoreContent: () => void;
  /** Callback when user confirms cancel action */
  onCancel: () => void;
  /** Optional CSS class name */
  className?: string;
}
```

**Current Behavior:**
- Shows 3 action cards: Review & Submit, Add More Content, Cancel
- Includes a cancel confirmation dialog for unsaved content
- Uses SessionProgressBar to show items created
- Does NOT show success confirmation message
- Does NOT provide "Done" exit option (exit is Cancel)

### Existing WhatsNextStep Component

**Location:** `src/components/ItemCapture/components/steps/WhatsNextStep.tsx`

**Current Interface:**
```typescript
export interface WhatsNextStepProps {
  /** The UUID of the item that was just saved */
  savedItemId: string;
  /** The display name of the item that was just saved */
  savedItemName: string;
  /** Callback for Edit Instructions action */
  onEditInstructions: () => void;
  /** Callback for Add New Instructions action */
  onAddNewInstructions: () => void;
  /** Callback for Create New Item action */
  onCreateNewItem: () => void;
  /** Callback for Done action - exit to dashboard */
  onDone: () => void;
  /** Optional CSS class */
  className?: string;
}
```

**Current Behavior:**
- Shows success confirmation with green checkmark and saved item name
- Displays 4 action cards with the correct options
- "Add New Instructions" has primary variant styling (emphasized)
- "Done" is separated by border and styled as text link
- Already has proper ARIA labels and accessibility
- Component is NOT used in ItemCreationWorkflow - only exists in ItemCapture

---

## Target State

### New NextActionStep Interface

```typescript
export interface NextActionStepProps {
  /** The saved item details */
  savedItem: {
    id: string;
    name: string;
    articleTitle: string;
  };
  /** Callback: Edit the article just created */
  onEditInstructions: () => void;
  /** Callback: Add new instructions to same item */
  onAddNewInstructions: () => void;
  /** Callback: Start workflow for a new item */
  onCreateNewItem: () => void;
  /** Callback: Exit workflow entirely */
  onDone: () => void;
  /** Optional CSS class */
  className?: string;
}
```

### Target Behavior

1. **Success Confirmation Header:**
   - Green checkmark icon in circle
   - "Item Saved!" heading
   - Display saved item name: "{name} has been saved successfully."
   - Prompt: "What would you like to do next?"

2. **Four Action Options:**
   | Option | Icon | Variant | Description |
   |--------|------|---------|-------------|
   | Edit Instructions | Edit | default | "Review and modify the instructions you just created" |
   | Add New Instructions | PlusCircle | **primary** | "Create different instructions for {savedItemName}" |
   | Create New Item | Package | default | "Start fresh with a different item" |
   | Done | (text link) | separated | "Done - Return to Dashboard" |

3. **No Cancel Button:** Item is already saved - nothing to cancel

4. **No Step Counter:** This is a post-workflow screen (not numbered)

5. **No Back Navigation:** Cannot go back from post-workflow menu

---

## Implementation Approach

### Option A: Reuse WhatsNextStep Component (Recommended)

Replace NextActionStep rendering in ItemCreationWorkflow with WhatsNextStep from ItemCapture. This requires:

1. **Move or share component:** Either:
   - Move WhatsNextStep to a shared location
   - Re-export from ItemCreationWorkflow steps
   - Import directly from ItemCapture (tight coupling concern)

2. **Update ItemCreationWorkflow.tsx:** Change the next-action case to render WhatsNextStep

3. **Wire up callbacks:** Connect the 4 callbacks to workflow state management

### Option B: Refactor NextActionStep In-Place

Replace the internals of NextActionStep.tsx with the WhatsNextStep design. This requires:

1. **Update props interface:** Match the new 4-callback interface
2. **Update component body:** Copy/adapt the WhatsNextStep rendering logic
3. **Remove obsolete code:** Remove cancel dialog, SessionProgressBar
4. **Update ItemCreationWorkflow.tsx:** Update the prop wiring

### Recommended: Option A (Reuse)

The WhatsNextStep component is already fully implemented, tested, and has the correct behavior. Re-exporting it from the steps barrel is the cleanest approach with minimal code duplication.

---

## Implementation Tasks

### Task 2.1.1: Re-export WhatsNextStep from ItemCreationWorkflow Steps

**File:** `src/components/ItemCreationWorkflow/components/steps/index.ts`

**Changes:**
- Add re-export of WhatsNextStep from ItemCapture
- Update documentation to note this is the post-workflow menu

```typescript
// =============================================================================
// Post-Workflow Menu (Phase 2 ITEM-03)
// =============================================================================
/**
 * Post-save decision menu with 4 action options.
 * Re-exported from ItemCapture for consistency.
 * Note: This replaces the old NextActionStep for the post-save flow.
 */
export { WhatsNextStep, type WhatsNextStepProps } from '@/components/ItemCapture/components/steps/WhatsNextStep';
```

### Task 2.1.2: Update ItemCreationWorkflow to Use WhatsNextStep

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Changes:**
1. Import WhatsNextStep instead of/alongside NextActionStep
2. Update the `case 'next-action':` block to render WhatsNextStep
3. Wire up the 4 callbacks:
   - `onEditInstructions` → Navigate to edit article (TODO or placeholder)
   - `onAddNewInstructions` → `goToStep('content-type-selection')`
   - `onCreateNewItem` → `startNewItem()` + `reset()` to step 1
   - `onDone` → `goToStep('session-summary')` or exit workflow
4. Pass the last saved item details from session state

**Code Changes (lines ~562-583):**

```typescript
case 'next-action': {
  // Get the most recently saved item from session
  const lastSavedItem = state.session.items[state.session.items.length - 1];

  if (!lastSavedItem) {
    // Fallback if no item was saved (shouldn't happen in normal flow)
    goToStep('session-summary');
    return null;
  }

  return (
    <WhatsNextStep
      savedItemId={lastSavedItem.id}
      savedItemName={lastSavedItem.name}
      onEditInstructions={() => {
        // TODO: Navigate to item edit view
        // For now, go to session summary where edit is available
        goToStep('session-summary');
      }}
      onAddNewInstructions={() => {
        // Add more content to same item concept - restart from content-type
        goToStep('content-type-selection');
      }}
      onCreateNewItem={() => {
        // Start completely fresh
        startNewItem();
      }}
      onDone={() => {
        // Exit to session summary (or complete workflow)
        goToStep('session-summary');
      }}
    />
  );
}
```

### Task 2.1.3: Update Type Exports

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`

**Changes:**
- No changes required to types - WhatsNextStepProps is self-contained
- NextActionStepProps can be deprecated with JSDoc comment

### Task 2.1.4: Verify WorkflowHeader Hides Navigation

**Pre-requisite:** Phase 1 (ITEM-05) must be complete to hide step counter on post-workflow screens.

**Verification points:**
- `canGoBack` should be `false` when on `next-action` step
- Step counter should be hidden (requires Phase 1 showStepCounter prop)
- Exit button (X) should still be visible

### Task 2.1.5: Update Tests

**File:** `src/components/ItemCreationWorkflow/components/steps/__tests__/NextActionStep.test.tsx`

**Changes:**
- Update test suite to test WhatsNextStep integration
- Verify all 4 callbacks are wired correctly
- Verify saved item details are displayed
- Remove tests for cancel dialog (no longer needed)
- Add tests for post-workflow behavior

---

## Dependencies

### Depends On (upstream)

- **Phase 1 Task 1.4:** WorkflowHeader showStepCounter prop - needed to hide step counter on post-workflow screens
- **Phase 1 Task 1.5:** useWorkflowState isPostWorkflowStep detection - needed to disable back navigation

### Blocks (downstream)

- **Task 2.2:** Remove back arrow from post-workflow header - This task must update the header display, but Task 2.1 handles the component swap first

### Parallel Safety

**Files touched by this task:**
- `src/components/ItemCreationWorkflow/components/steps/index.ts` (add export)
- `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` (update next-action case)
- `src/components/ItemCreationWorkflow/components/steps/__tests__/NextActionStep.test.tsx` (update tests)

**Conflicts with:**
- Phase 1 tasks also modify `ItemCreationWorkflow.tsx` (constants import, header props)
- Run sequentially with Phase 1 to avoid merge conflicts

**Safe to parallelize with:**
- Phase 3 (ITEM-01): Dashboard cards - different component tree
- Phase 4 (ITEM-04): Navigation menu - different files entirely
- Phase 5 (ITEM-02): Data model changes - type-level only, no file conflicts

---

## Authorized Files and Functions for Modification

### Primary Files

| File | Changes Authorized | Functions/Sections |
|------|-------------------|-------------------|
| `src/components/ItemCreationWorkflow/components/steps/index.ts` | ADD | Add export for WhatsNextStep |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | MODIFY | `renderCurrentStep()` - case 'next-action' block (lines 562-583) |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | MODIFY | Import statement to include WhatsNextStep |

### Test Files

| File | Changes Authorized |
|------|-------------------|
| `src/components/ItemCreationWorkflow/components/steps/__tests__/NextActionStep.test.tsx` | MAJOR REWRITE |
| `src/components/ItemCreationWorkflow/__tests__/ItemCapture.integration.test.tsx` | UPDATE test expectations |

### Files NOT to Modify

| File | Reason |
|------|--------|
| `src/components/ItemCapture/components/steps/WhatsNextStep.tsx` | Source of truth - do not modify |
| `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` | Deprecate via exports, do not delete yet |

---

## Verification Checklist

- [ ] WhatsNextStep renders in ItemCreationWorkflow at next-action step
- [ ] Success message displays saved item name correctly
- [ ] All 4 action buttons are visible and clickable
- [ ] "Add New Instructions" has primary styling (blue border/background)
- [ ] "Edit Instructions" callback navigates appropriately
- [ ] "Add New Instructions" returns to content-type-selection step
- [ ] "Create New Item" resets workflow to room-selection
- [ ] "Done" navigates to session-summary
- [ ] No Cancel button is present
- [ ] No step counter is shown (depends on Phase 1)
- [ ] No back arrow is shown (depends on Phase 1)
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Screen reader announces success state
- [ ] All existing tests pass or are updated

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Phase 1 not complete | Medium | High | Check for POST_WORKFLOW_SCREENS constant before implementing |
| Import path issues | Low | Low | Use standard @ alias, test import resolution |
| State.session.items empty | Low | Medium | Add fallback in component render |
| Old NextActionStep tests fail | High | Low | Update tests as part of implementation |

---

## Rollback Plan

If issues arise after deployment:

1. Revert the `index.ts` export change
2. Revert the `ItemCreationWorkflow.tsx` case block
3. Original NextActionStep will render again
4. No data migration needed - purely UI change

---

## References

- **Request:** docs/gen_requests.md - REQ-201
- **Implementation Plan:** docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md
- **Source Component:** src/components/ItemCapture/components/steps/WhatsNextStep.tsx
- **Target Component:** src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx
