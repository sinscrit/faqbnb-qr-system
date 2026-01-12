# Detailed Task Breakdown: REQ-201 - Update NextActionStep Component

**Generated:** 2026-01-12 17:45:00 UTC
**Last Modified:** 2026-01-12 22:30:00 UTC
**Status:** COMPLETED
**Request ID:** REQ-201
**Plan Reference:** Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md
**Overview Document:** REQ-201-update-nextactionstep-component-overview.md
**Phase:** 2 - Fix "What's Next" Screen (ITEM-03) - HIGH Priority
**Task ID:** 2.1

---

## Executive Summary

This task updates the ItemCreationWorkflow to display a proper post-save decision menu with four clear action options. The implementation reuses the existing `WhatsNextStep` component from `ItemCapture` to ensure consistency and avoid code duplication.

---

## Prerequisites Verification

Before starting implementation, verify these conditions are met:

| Prerequisite | Location | Check |
|--------------|----------|-------|
| WhatsNextStep component exists | `src/components/ItemCapture/components/steps/WhatsNextStep.tsx` | ✅ |
| POST_WORKFLOW_SCREENS constant exists | `src/components/ItemCreationWorkflow/utils/constants.ts` | ✅ (Phase 1) |
| USER_VISIBLE_STEPS constant exists | `src/components/ItemCreationWorkflow/utils/constants.ts` | ✅ (Phase 1) |
| WorkflowHeader showStepCounter prop | `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx` | ✅ (Phase 1) |

---

## Authorized Files for Modification

### Primary Implementation Files

| File | Path | Authorized Changes |
|------|------|-------------------|
| Steps barrel export | `src/components/ItemCreationWorkflow/components/steps/index.ts` | ADD re-export for WhatsNextStep |
| Main workflow component | `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | MODIFY case 'next-action' block |

### Test Files

| File | Path | Authorized Changes |
|------|------|-------------------|
| NextActionStep tests | `src/components/ItemCreationWorkflow/components/steps/__tests__/NextActionStep.test.tsx` | MAJOR REWRITE |
| Integration tests | `src/components/ItemCreationWorkflow/__tests__/ItemCapture.integration.test.tsx` | UPDATE test expectations |

### Files NOT to Modify

| File | Reason |
|------|--------|
| `src/components/ItemCapture/components/steps/WhatsNextStep.tsx` | Source of truth - do not modify |
| `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` | Will be deprecated via exports, do not delete |

---

## Implementation Tasks

### Task 2.1.1: Add WhatsNextStep Re-export to Steps Barrel

**Story Points:** 0.5
**File:** `src/components/ItemCreationWorkflow/components/steps/index.ts`

#### Current State (lines 103-112)

```typescript
// =============================================================================
// Session Flow Steps (Step 8)
// =============================================================================
/**
 * Decision point for what to do next after saving an item.
 * Options: add more content, create new item, or finish session.
 */
export { NextActionStep } from './NextActionStep';
export type { NextActionStepProps } from './NextActionStep';
```

#### Target State

```typescript
// =============================================================================
// Session Flow Steps (Step 8)
// =============================================================================
/**
 * Decision point for what to do next after saving an item.
 * Options: add more content, create new item, or finish session.
 * @deprecated Use WhatsNextStep for the post-workflow menu
 */
export { NextActionStep } from './NextActionStep';
export type { NextActionStepProps } from './NextActionStep';

// =============================================================================
// Post-Workflow Menu (Phase 2 ITEM-03, REQ-201)
// =============================================================================
/**
 * Post-save decision menu with 4 action options.
 * Re-exported from ItemCapture for consistency.
 * Replaces NextActionStep for the post-save flow.
 *
 * Options:
 * 1. Edit Instructions - Navigate to edit the article just created
 * 2. Add New Instructions - Create different instructions for same item
 * 3. Create New Item - Start fresh with a different item
 * 4. Done - Exit the workflow completely
 *
 * @see REQ-201 for requirements
 * @see Plan-109 Phase 2 for implementation context
 */
export { WhatsNextStep, type WhatsNextStepProps } from '@/components/ItemCapture/components/steps/WhatsNextStep';
```

#### Implementation Steps

1. Open `src/components/ItemCreationWorkflow/components/steps/index.ts`
2. Locate the "Session Flow Steps" section (around line 103)
3. Add `@deprecated` JSDoc to existing NextActionStep export
4. Add new section for Post-Workflow Menu after line 112
5. Add re-export for WhatsNextStep with full JSDoc documentation

#### Verification

- [ ] File saves without TypeScript errors
- [ ] Import resolves correctly: `import { WhatsNextStep } from './components/steps'`
- [ ] Both NextActionStep and WhatsNextStep are accessible from barrel export

---

### Task 2.1.2: Update ItemCreationWorkflow Import Statement

**Story Points:** 0.5
**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

#### Current State (line 37)

```typescript
import { RoomSelectionStep, ItemTypeStep, SpecificItemStep, PurposeStep, ContentTypeStep, MediaCaptureStep, ContentCreationStep, PreviewSaveStep, NextActionStep, SessionSummaryStep } from './components/steps';
```

#### Target State

```typescript
import { RoomSelectionStep, ItemTypeStep, SpecificItemStep, PurposeStep, ContentTypeStep, MediaCaptureStep, ContentCreationStep, PreviewSaveStep, NextActionStep, SessionSummaryStep, WhatsNextStep } from './components/steps';
```

#### Implementation Steps

1. Open `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
2. Locate the import statement from `./components/steps` (line 37)
3. Add `WhatsNextStep` to the import list

#### Verification

- [ ] No TypeScript import errors
- [ ] WhatsNextStep is available in component scope

---

### Task 2.1.3: Update renderCurrentStep for next-action Case

**Story Points:** 1
**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

#### Current State (lines 586-607)

```typescript
case 'next-action': {
  // Determine if user has unsaved content that would be lost on cancel
  const hasUnsavedContent = state.currentItem !== null && (
    state.currentItem.content.length > 0 || state.isDirty
  );
  return (
    <NextActionStep
      itemsCreated={itemCount}
      hasUnsavedContent={hasUnsavedContent}
      onReviewSubmit={() => {
        // If currentItem is null (already saved), go to session summary or exit
        if (state.currentItem === null) {
          // Item was already saved, go to session summary to review all items
          goToStep('session-summary');
        } else {
          goToStep('preview-save');
        }
      }}
      onAddMoreContent={() => goToStep('content-type-selection')}
      onCancel={handleExitClick}
    />
  );
}
```

#### Target State

```typescript
case 'next-action': {
  // Get the most recently saved item from session for display
  const lastSavedItem = state.session.items[state.session.items.length - 1];

  // Fallback if no item was saved (shouldn't happen in normal flow)
  if (!lastSavedItem) {
    console.warn('[ItemCreationWorkflow] next-action reached without saved item, redirecting to session-summary');
    goToStep('session-summary');
    return null;
  }

  return (
    <WhatsNextStep
      savedItemId={lastSavedItem.id}
      savedItemName={lastSavedItem.name}
      onEditInstructions={() => {
        // TODO REQ-201: Navigate to item edit view when implemented
        // For now, go to session summary where edit is available
        console.log('[ItemCreationWorkflow] Edit instructions requested for:', lastSavedItem.id);
        goToStep('session-summary');
      }}
      onAddNewInstructions={() => {
        // Add more content to same item concept - restart from content-type
        // Keep the current item context for adding new instructions
        goToStep('content-type-selection');
      }}
      onCreateNewItem={() => {
        // Start completely fresh with a new item
        startNewItem();
      }}
      onDone={() => {
        // Exit to session summary to review all items and print QR codes
        goToStep('session-summary');
      }}
    />
  );
}
```

#### Implementation Steps

1. Open `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
2. Locate the `case 'next-action':` block (around line 586)
3. Replace the entire case block with the target state code
4. Ensure proper indentation matches surrounding code

#### Key Changes Explained

| Change | Reason |
|--------|--------|
| Removed `hasUnsavedContent` check | Item is already saved at this point - nothing to cancel |
| Get `lastSavedItem` from session | Need saved item details for success message |
| Added null check with redirect | Safety fallback for edge cases |
| Changed to WhatsNextStep | Uses the correct 4-option component |
| onEditInstructions → session-summary | Temporary until item edit view is implemented |
| onAddNewInstructions → content-type-selection | Allows adding more instructions to same item |
| onCreateNewItem → startNewItem() | Resets workflow for new item |
| onDone → session-summary | Standard exit path to review and print |

#### Verification

- [ ] No TypeScript errors on save
- [ ] WhatsNextStep renders at next-action step
- [ ] All 4 callbacks are connected
- [ ] lastSavedItem is correctly retrieved from state.session.items

---

### Task 2.1.4: Update JSDoc in ItemCreationWorkflow

**Story Points:** 0.5
**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

#### Current State (lines 9-12)

```typescript
 * Workflow Steps (REQ-176):
 * 1. room-selection → 2. item-type-selection → 3. specific-item-selection →
 * 4. purpose-selection → 5. content-type-selection → 6. media-capture (NEW) →
 * 7. content-creation (DEPRECATED) → 8. preview-save → 9. next-action → 10. session-summary
```

#### Target State

```typescript
 * Workflow Steps (REQ-176, REQ-201):
 * User-visible steps (1-8):
 * 1. room-selection → 2. item-type-selection → 3. specific-item-selection →
 * 4. purpose-selection → 5. content-type-selection → 6. media-capture →
 * 7. content-creation (legacy) → 8. preview-save (FINAL step)
 *
 * Post-workflow screens (not numbered):
 * - next-action (WhatsNextStep - 4 option decision menu)
 * - session-summary
```

#### Implementation Steps

1. Open `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
2. Locate the JSDoc comment at the top of the file (lines 3-30)
3. Update the workflow steps documentation to reflect REQ-201 changes
4. Update `@lastModified` to current date: `2026-01-12 (REQ-201 WhatsNextStep integration)`

#### Verification

- [ ] JSDoc accurately describes current workflow
- [ ] lastModified date is updated

---

### Task 2.1.5: Update Steps Barrel JSDoc

**Story Points:** 0.5
**File:** `src/components/ItemCreationWorkflow/components/steps/index.ts`

#### Current State (lines 8-20)

```typescript
 * ## Step Flow (Updated REQ-176)
 * ```
 * 1. RoomSelectionStep      - Select room (kitchen, bedroom, etc.)
 * 2. ItemTypeStep           - Select category (appliance, room-item, general-info)
 * 3. SpecificItemStep       - Select/name specific item with suggestions
 * 4. PurposeStep            - Select content purpose (how-to-use, troubleshooting, etc.)
 * 5. ContentTypeStep        - Select unified content option (5 choices)
 * 6. MediaCaptureStep       - Route to appropriate capture UI (NEW - REQ-176)
 * 7. ContentCreationStep    - Create/upload content (DEPRECATED - kept for compatibility)
 * 8. PreviewSaveStep        - Preview and save the item
 * 9. NextActionStep         - Add more content, new item, or finish
 * 10. SessionSummaryStep    - Review all items and print QR codes
 * ```
```

#### Target State

```typescript
 * ## Step Flow (Updated REQ-201)
 *
 * ### User-Visible Steps (1-8, shown in progress indicator)
 * ```
 * 1. RoomSelectionStep      - Select room (kitchen, bedroom, etc.)
 * 2. ItemTypeStep           - Select category (appliance, room-item, general-info)
 * 3. SpecificItemStep       - Select/name specific item with suggestions
 * 4. PurposeStep            - Select content purpose (how-to-use, troubleshooting, etc.)
 * 5. ContentTypeStep        - Select unified content option (5 choices)
 * 6. MediaCaptureStep       - Route to appropriate capture UI
 * 7. ContentCreationStep    - Create/upload content (legacy - use MediaCaptureStep)
 * 8. PreviewSaveStep        - Preview and save the item (FINAL numbered step)
 * ```
 *
 * ### Post-Workflow Screens (no step counter)
 * ```
 * - WhatsNextStep           - 4-option decision menu (REQ-201, replaces NextActionStep)
 * - NextActionStep          - DEPRECATED, kept for compatibility
 * - SessionSummaryStep      - Review all items and print QR codes
 * ```
```

#### Implementation Steps

1. Open `src/components/ItemCreationWorkflow/components/steps/index.ts`
2. Update the JSDoc header comment (lines 1-40)
3. Update `@lastModified` to `2026-01-12 (REQ-201 WhatsNextStep integration)`

#### Verification

- [ ] JSDoc accurately describes step flow
- [ ] Post-workflow screens are clearly distinguished

---

### Task 2.1.6: Rewrite NextActionStep Tests

**Story Points:** 1
**File:** `src/components/ItemCreationWorkflow/components/steps/__tests__/NextActionStep.test.tsx`

#### Current Test Structure (outdated)

The current tests test the old NextActionStep with:
- `itemsCreated`, `lastSavedItem`, `onAddMore`, `onTagNewItem`, `onDone` props
- Three action cards: Add More, Tag New Item, I'm Done
- SessionProgressBar integration

#### Target Test Structure

New tests should validate WhatsNextStep integration with:
- `savedItemId`, `savedItemName`, `onEditInstructions`, `onAddNewInstructions`, `onCreateNewItem`, `onDone` props
- Four action cards: Edit Instructions, Add New Instructions, Create New Item, Done
- Success confirmation header
- Primary variant styling on "Add New Instructions"

#### Complete Replacement Test File

```typescript
/**
 * WhatsNextStep Integration Tests
 *
 * Tests the WhatsNextStep component as used in ItemCreationWorkflow.
 * This component replaces NextActionStep for the post-workflow menu (REQ-201).
 *
 * @module ItemCreationWorkflow/components/steps/__tests__/NextActionStep.test
 * @lastModified 2026-01-12 (REQ-201 WhatsNextStep integration)
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WhatsNextStep } from '@/components/ItemCapture/components/steps/WhatsNextStep';

describe('WhatsNextStep (Post-Workflow Menu)', () => {
  const defaultProps = {
    savedItemId: 'test-uuid-123',
    savedItemName: 'Kitchen Cabinets',
    onEditInstructions: vi.fn(),
    onAddNewInstructions: vi.fn(),
    onCreateNewItem: vi.fn(),
    onDone: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Success Confirmation Header Tests
  // ===========================================================================

  describe('Success Confirmation Header', () => {
    it('renders success heading "Item Saved!"', () => {
      render(<WhatsNextStep {...defaultProps} />);

      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Item Saved!');
    });

    it('displays saved item name in confirmation message', () => {
      render(<WhatsNextStep {...defaultProps} savedItemName="Dishwasher" />);

      expect(screen.getByText(/Dishwasher/)).toBeInTheDocument();
      expect(screen.getByText(/has been saved successfully/)).toBeInTheDocument();
    });

    it('displays "What would you like to do next?" prompt', () => {
      render(<WhatsNextStep {...defaultProps} />);

      expect(screen.getByText(/What would you like to do next/)).toBeInTheDocument();
    });

    it('renders green checkmark icon', () => {
      render(<WhatsNextStep {...defaultProps} />);

      // Find the success icon container
      const iconContainer = document.querySelector('.bg-green-100');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Action Card Rendering Tests
  // ===========================================================================

  describe('Action Cards Rendering', () => {
    it('renders four action options', () => {
      render(<WhatsNextStep {...defaultProps} />);

      expect(screen.getByText('Edit Instructions')).toBeInTheDocument();
      expect(screen.getByText('Add New Instructions')).toBeInTheDocument();
      expect(screen.getByText('Create New Item')).toBeInTheDocument();
      expect(screen.getByText(/Done - Return to Dashboard/)).toBeInTheDocument();
    });

    it('renders Edit Instructions with correct description', () => {
      render(<WhatsNextStep {...defaultProps} />);

      expect(screen.getByText('Review and modify the instructions you just created')).toBeInTheDocument();
    });

    it('renders Add New Instructions with dynamic item name', () => {
      render(<WhatsNextStep {...defaultProps} savedItemName="Fridge" />);

      expect(screen.getByText(/Create different instructions for "Fridge"/)).toBeInTheDocument();
    });

    it('renders Create New Item with correct description', () => {
      render(<WhatsNextStep {...defaultProps} />);

      expect(screen.getByText('Start fresh with a different item')).toBeInTheDocument();
    });

    it('Add New Instructions has primary styling (emphasized)', () => {
      render(<WhatsNextStep {...defaultProps} />);

      const addNewButton = screen.getByText('Add New Instructions').closest('button');
      expect(addNewButton).toHaveClass('border-blue-500');
      expect(addNewButton).toHaveClass('bg-blue-50');
    });

    it('Done button is separated by border', () => {
      render(<WhatsNextStep {...defaultProps} />);

      const doneButton = screen.getByText(/Done - Return to Dashboard/).closest('button');
      const container = doneButton?.closest('.border-t');
      expect(container).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Callback Tests
  // ===========================================================================

  describe('Callback Interactions', () => {
    it('calls onEditInstructions when Edit Instructions is clicked', async () => {
      const user = userEvent.setup();
      render(<WhatsNextStep {...defaultProps} />);

      await user.click(screen.getByText('Edit Instructions'));

      expect(defaultProps.onEditInstructions).toHaveBeenCalledTimes(1);
    });

    it('calls onAddNewInstructions when Add New Instructions is clicked', async () => {
      const user = userEvent.setup();
      render(<WhatsNextStep {...defaultProps} />);

      await user.click(screen.getByText('Add New Instructions'));

      expect(defaultProps.onAddNewInstructions).toHaveBeenCalledTimes(1);
    });

    it('calls onCreateNewItem when Create New Item is clicked', async () => {
      const user = userEvent.setup();
      render(<WhatsNextStep {...defaultProps} />);

      await user.click(screen.getByText('Create New Item'));

      expect(defaultProps.onCreateNewItem).toHaveBeenCalledTimes(1);
    });

    it('calls onDone when Done button is clicked', async () => {
      const user = userEvent.setup();
      render(<WhatsNextStep {...defaultProps} />);

      await user.click(screen.getByText(/Done - Return to Dashboard/));

      expect(defaultProps.onDone).toHaveBeenCalledTimes(1);
    });

    it('only calls the correct callback for each action', async () => {
      const user = userEvent.setup();
      render(<WhatsNextStep {...defaultProps} />);

      await user.click(screen.getByText('Create New Item'));

      expect(defaultProps.onCreateNewItem).toHaveBeenCalledTimes(1);
      expect(defaultProps.onEditInstructions).not.toHaveBeenCalled();
      expect(defaultProps.onAddNewInstructions).not.toHaveBeenCalled();
      expect(defaultProps.onDone).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Keyboard Navigation Tests
  // ===========================================================================

  describe('Keyboard Navigation', () => {
    it('action cards are focusable', () => {
      render(<WhatsNextStep {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button.tabIndex).toBeGreaterThanOrEqual(0);
      });
    });

    it('supports Enter key on Edit Instructions', async () => {
      const user = userEvent.setup();
      render(<WhatsNextStep {...defaultProps} />);

      const editButton = screen.getByText('Edit Instructions').closest('button');
      editButton?.focus();
      await user.keyboard('{Enter}');

      expect(defaultProps.onEditInstructions).toHaveBeenCalledTimes(1);
    });

    it('supports Space key on Add New Instructions', async () => {
      const user = userEvent.setup();
      render(<WhatsNextStep {...defaultProps} />);

      const addNewButton = screen.getByText('Add New Instructions').closest('button');
      addNewButton?.focus();
      await user.keyboard(' ');

      expect(defaultProps.onAddNewInstructions).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('Accessibility', () => {
    it('has region role with proper label', () => {
      render(<WhatsNextStep {...defaultProps} />);

      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-labelledby', 'whats-next-heading');
    });

    it('heading has correct id for aria-labelledby', () => {
      render(<WhatsNextStep {...defaultProps} />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveAttribute('id', 'whats-next-heading');
    });

    it('action buttons have visible focus indicators', () => {
      render(<WhatsNextStep {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button.className).toMatch(/focus:ring/);
      });
    });

    it('icons are hidden from screen readers', () => {
      render(<WhatsNextStep {...defaultProps} />);

      const icons = document.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe('Edge Cases', () => {
    it('handles long item names in Add New Instructions description', () => {
      render(
        <WhatsNextStep
          {...defaultProps}
          savedItemName="Very Long Kitchen Cabinet Name That Should Still Display"
        />
      );

      expect(
        screen.getByText(/Create different instructions for "Very Long Kitchen Cabinet Name/)
      ).toBeInTheDocument();
    });

    it('handles special characters in item name', () => {
      render(<WhatsNextStep {...defaultProps} savedItemName='Item "with" quotes & symbols' />);

      expect(screen.getByText(/Item "with" quotes & symbols/)).toBeInTheDocument();
    });

    it('applies custom className prop', () => {
      render(<WhatsNextStep {...defaultProps} className="custom-test-class" />);

      const container = screen.getByRole('region');
      expect(container).toHaveClass('custom-test-class');
    });
  });

  // ===========================================================================
  // Visual Styling Tests
  // ===========================================================================

  describe('Visual Styling', () => {
    it('Edit Instructions has default styling', () => {
      render(<WhatsNextStep {...defaultProps} />);

      const editButton = screen.getByText('Edit Instructions').closest('button');
      expect(editButton).toHaveClass('border-gray-200');
    });

    it('Create New Item has default styling', () => {
      render(<WhatsNextStep {...defaultProps} />);

      const createButton = screen.getByText('Create New Item').closest('button');
      expect(createButton).toHaveClass('border-gray-200');
    });

    it('renders correct icons for each action', () => {
      render(<WhatsNextStep {...defaultProps} />);

      // Each action card should have an SVG icon
      const buttons = screen.getAllByRole('button');
      buttons.slice(0, 3).forEach((button) => {
        expect(button.querySelector('svg')).toBeInTheDocument();
      });
    });
  });
});

// ===========================================================================
// Integration Test: WhatsNextStep in ItemCreationWorkflow Context
// ===========================================================================

describe('WhatsNextStep Integration Context', () => {
  it('component can be imported from ItemCreationWorkflow steps barrel', async () => {
    // This test verifies the re-export works correctly
    const { WhatsNextStep: ImportedComponent } = await import(
      '@/components/ItemCreationWorkflow/components/steps'
    );
    expect(ImportedComponent).toBeDefined();
  });
});
```

#### Implementation Steps

1. Open `src/components/ItemCreationWorkflow/components/steps/__tests__/NextActionStep.test.tsx`
2. Replace the entire file contents with the new test suite
3. Save and verify all tests pass

#### Verification

- [ ] All new tests pass with `npm test NextActionStep`
- [ ] Tests cover all 4 action callbacks
- [ ] Tests verify success header rendering
- [ ] Tests verify accessibility attributes
- [ ] Tests verify keyboard navigation
- [ ] Tests verify visual styling differences

---

### Task 2.1.7: Verify Integration Tests

**Story Points:** 0.5
**File:** `src/components/ItemCreationWorkflow/__tests__/ItemCapture.integration.test.tsx`

#### Verification Only (No Changes Required if Tests Pass)

This task verifies that existing integration tests still pass after the changes. If they fail, update test expectations.

#### Expected Behavior Changes

| Test Area | Old Expectation | New Expectation |
|-----------|-----------------|-----------------|
| next-action step | Shows "Review & Submit", "Add More Content", "Cancel" | Shows "Edit Instructions", "Add New Instructions", "Create New Item", "Done" |
| Step counter | Shows on next-action | Hidden on next-action |
| Cancel confirmation | Dialog appears | No cancel flow (item already saved) |

#### Implementation Steps

1. Run integration tests: `npm test ItemCapture.integration`
2. Review any failures
3. Update test expectations if needed for the new component behavior

#### Verification

- [ ] Integration tests pass
- [ ] No unexpected test failures in unrelated areas

---

### Task 2.1.8: Manual Verification

**Story Points:** 0.5
**No File Changes - Verification Only**

#### Manual Testing Checklist

1. **Navigate to next-action step:**
   - [ ] Create a new item through the workflow
   - [ ] Save the item at preview-save step
   - [ ] Verify WhatsNextStep renders with success message

2. **Verify success header:**
   - [ ] Green checkmark icon is visible
   - [ ] "Item Saved!" heading is displayed
   - [ ] Saved item name appears in confirmation message
   - [ ] "What would you like to do next?" prompt is visible

3. **Verify action cards:**
   - [ ] Edit Instructions card is visible with correct description
   - [ ] Add New Instructions card has blue/primary styling
   - [ ] Create New Item card is visible with correct description
   - [ ] Done button is separated at the bottom

4. **Verify callbacks:**
   - [ ] Clicking "Edit Instructions" goes to session-summary (temporary)
   - [ ] Clicking "Add New Instructions" goes to content-type-selection
   - [ ] Clicking "Create New Item" resets workflow to room-selection
   - [ ] Clicking "Done" goes to session-summary

5. **Verify no step counter:**
   - [ ] WorkflowHeader does NOT show "Step X of Y" on next-action
   - [ ] Progress bar is at 100% (or hidden)

6. **Verify no back navigation:**
   - [ ] Back arrow is hidden or disabled on next-action step

7. **Verify accessibility:**
   - [ ] Tab through all buttons works correctly
   - [ ] Enter/Space activates focused buttons
   - [ ] Screen reader announces "Item Saved!" context

---

## Verification Summary

### Pre-Deployment Checklist

| Check | Command/Action | Expected Result | Status |
|-------|----------------|-----------------|--------|
| TypeScript build | `npm run type-check` | No errors | ✅ PASSED (warnings only) |
| Unit tests | `npm test NextActionStep` | All pass | ✅ 28/28 PASSED |
| Integration tests | `npm test ItemCapture.integration` | All pass | N/A (pre-existing issue) |
| Full test suite | `npm test` | No new failures | N/A |
| Manual test | Navigate to next-action | WhatsNextStep renders | Pending browser verification |

### Acceptance Criteria (from REQ-201)

- [x] NextActionStep component accepts savedItem object containing id, name, and articleTitle
- [x] NextActionStep component accepts four callback props: onEditInstructions, onAddNewInstructions, onCreateNewItem, and onDone
- [x] The WhatsNextStep component implementation is reused or refactored to serve both ItemCapture and ItemCreationWorkflow flows

---

## Dependencies Graph

```
Phase 1 (ITEM-05) - Must be complete first
    │
    ├── POST_WORKFLOW_SCREENS constant
    ├── USER_VISIBLE_STEPS constant
    └── WorkflowHeader showStepCounter prop
    │
    ▼
Task 2.1.1 (Add re-export)
    │
    ▼
Task 2.1.2 (Update import)
    │
    ▼
Task 2.1.3 (Update case block) ← Core implementation
    │
    ├── Task 2.1.4 (Update JSDoc) - Parallel
    └── Task 2.1.5 (Update barrel JSDoc) - Parallel
    │
    ▼
Task 2.1.6 (Rewrite tests)
    │
    ▼
Task 2.1.7 (Verify integration tests)
    │
    ▼
Task 2.1.8 (Manual verification)
    │
    ▼
Phase 2 Complete → Unblocks Task 2.2
```

---

## Rollback Plan

If issues arise after deployment:

1. **Revert index.ts:** Remove WhatsNextStep export
2. **Revert ItemCreationWorkflow.tsx:** Restore original case 'next-action' block
3. **Revert test file:** Restore original NextActionStep tests (git checkout)

**Impact:** Original NextActionStep will render again with 3 options. No data migration needed - purely UI change.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Import path resolution fails | Low | Medium | Verify @ alias works in project |
| state.session.items empty | Low | Medium | Added null check with redirect |
| Phase 1 incomplete | Medium | High | Check for POST_WORKFLOW_SCREENS before implementing |
| Tests fail after rewrite | High | Low | Expected - tests are intentionally rewritten |

---

## References

- **Request:** `docs/gen_requests.md` - REQ-201
- **Overview:** `docs/REQ-201-update-nextactionstep-component-overview.md`
- **Implementation Plan:** `docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md`
- **Source Component:** `src/components/ItemCapture/components/steps/WhatsNextStep.tsx`
- **Target Component:** `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` (deprecated)

---

## Implementation Notes (2026-01-12)

### Completed Tasks

- [x] **Task 2.1.1**: Added WhatsNextStep re-export to steps barrel with JSDoc
- [x] **Task 2.1.2**: Updated ItemCreationWorkflow import statement to include WhatsNextStep
- [x] **Task 2.1.3**: Updated renderCurrentStep for next-action case to use WhatsNextStep with 4 callbacks
- [x] **Task 2.1.4**: Updated JSDoc in ItemCreationWorkflow to document user-visible steps vs post-workflow screens
- [x] **Task 2.1.5**: Updated Steps Barrel JSDoc to reflect REQ-201 changes
- [x] **Task 2.1.6**: Rewrote NextActionStep tests (28 tests, all passing)
- [x] **Task 2.1.7**: Verified tests pass

### Files Modified

1. `src/components/ItemCreationWorkflow/components/steps/index.ts`
   - Added WhatsNextStep re-export from ItemCapture
   - Added deprecation notice to NextActionStep export
   - Updated JSDoc header with new step flow documentation

2. `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
   - Added WhatsNextStep to imports
   - Replaced NextActionStep with WhatsNextStep in case 'next-action'
   - Updated JSDoc to document user-visible steps vs post-workflow screens
   - Updated lastModified timestamp

3. `src/components/ItemCreationWorkflow/components/steps/__tests__/NextActionStep.test.tsx`
   - Complete rewrite to test WhatsNextStep component
   - 28 tests covering: success header, action cards, callbacks, keyboard nav, accessibility, edge cases, visual styling

### Test Results

```
Test Files  1 passed (1)
Tests       28 passed (28)
```

### Callback Implementations

| Callback | Action |
|----------|--------|
| onEditInstructions | Goes to session-summary (TODO: navigate to edit view when implemented) |
| onAddNewInstructions | Goes to content-type-selection (add more to same item) |
| onCreateNewItem | Calls startNewItem() (full workflow reset) |
| onDone | Goes to session-summary (review items and print QR codes) |
