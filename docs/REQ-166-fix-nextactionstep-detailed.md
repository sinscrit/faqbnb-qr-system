# REQ-166: Fix NextActionStep - Detailed Task Breakdown

**Generated:** 2026-01-09 23:59:00 UTC
**Last Modified:** 2026-01-09 23:59:00 UTC
**Request ID:** REQ-166
**Type:** ENHANCEMENT
**Size:** S
**Phase:** 4 - Remove Duplicate Navigation
**Task ID:** 4.4
**Parent Overview:** `/docs/REQ-166-fix-nextactionstep-overview.md`
**Implementation Plan:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`

---

## Executive Summary

This document provides granular, actionable tasks for implementing REQ-166: simplifying the NextActionStep screen by standardizing on exactly three action cards (Review & Submit, Add More Content, Cancel) with a confirmation dialog for the Cancel action. Total estimated effort: ~2 hours.

---

## Prerequisites

Before starting implementation:
- [ ] Ensure local development environment is running (`npm run dev`)
- [ ] Review the existing `NextActionStep.tsx` component implementation
- [ ] Familiarize with the `ConfirmExitDialog` pattern for dialog implementation
- [ ] Understand the current props interface and parent integration

---

## Authorized Files for Modification

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` | Main component - update action cards, add cancel dialog |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Parent orchestrator - update props passed to NextActionStep |

### Reference Files (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` | Pattern for confirmation dialog with focus trapping |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Type definitions for workflow |
| `src/components/ItemCreationWorkflow/utils/accessibility.ts` | Focus trap utility |

---

## Task Breakdown

### Task 4.4.1: Update NextActionStepProps Interface

**Objective:** Update the props interface to support the new simplified action cards.

**File:** `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`

**Current Interface (lines 46-61):**
```typescript
export interface NextActionStepProps {
  itemsCreated: number;
  lastSavedItem: SessionItem | null;
  lastItemContentCount?: number;
  onAddMore: () => void;
  onTagNewItem: () => void;
  onDone: () => void;
  className?: string;
}
```

**New Interface:**
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

**Steps:**
1. Open `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`
2. Locate the `NextActionStepProps` interface (around line 46)
3. Remove `lastSavedItem` and `lastItemContentCount` props
4. Replace `onAddMore`, `onTagNewItem`, `onDone` with `onReviewSubmit`, `onAddMoreContent`, `onCancel`
5. Add `hasUnsavedContent: boolean` prop
6. Update JSDoc comments for each prop

**Verification:**
- [ ] TypeScript compilation passes (`npm run type-check`)
- [ ] No unused props in interface
- [ ] JSDoc comments are accurate

**Story Points:** 0.25

---

### Task 4.4.2: Update Component Function Signature

**Objective:** Update the destructured props in the component function to match the new interface.

**File:** `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`

**Current Signature (lines 148-156):**
```typescript
export function NextActionStep({
  itemsCreated,
  lastSavedItem,
  lastItemContentCount = 0,
  onAddMore,
  onTagNewItem,
  onDone,
  className,
}: NextActionStepProps) {
```

**New Signature:**
```typescript
export function NextActionStep({
  itemsCreated,
  hasUnsavedContent,
  onReviewSubmit,
  onAddMoreContent,
  onCancel,
  className,
}: NextActionStepProps) {
```

**Steps:**
1. Update the destructured props in the function signature
2. Remove all code related to removed props (`lastSavedItem`, `lastItemContentCount`)
3. Remove the `itemName` variable and `truncateText` usage (no longer needed)
4. Remove the `canAddMore` conditional logic (no longer needed)

**Verification:**
- [ ] Component function signature matches new interface
- [ ] No references to removed props remain in the component
- [ ] TypeScript compilation passes

**Story Points:** 0.25

---

### Task 4.4.3: Add Cancel Confirmation Dialog State

**Objective:** Add state management for the cancel confirmation dialog.

**File:** `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`

**Steps:**
1. Add import for `AlertTriangle` from `lucide-react` (for dialog icon) and `X` icon
2. Add import for `useFocusTrap` from `../../utils/accessibility`
3. Add state for dialog visibility:
   ```typescript
   const [showCancelDialog, setShowCancelDialog] = useState(false);
   ```
4. Add ref for focus trapping:
   ```typescript
   const dialogRef = useRef<HTMLDivElement>(null);
   const keepWorkingButtonRef = useRef<HTMLButtonElement>(null);
   ```
5. Add focus trap hook call:
   ```typescript
   useFocusTrap(dialogRef, showCancelDialog);
   ```

**Verification:**
- [ ] State is properly initialized
- [ ] Focus trap is connected to dialog ref
- [ ] No console errors when component mounts

**Story Points:** 0.25

---

### Task 4.4.4: Implement Cancel Click Handler Logic

**Objective:** Create the handler that decides whether to show dialog or cancel directly.

**File:** `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`

**Implementation:**
```typescript
// Handle Cancel card click
const handleCancelClick = useCallback(() => {
  if (hasUnsavedContent) {
    setShowCancelDialog(true);
  } else {
    // No unsaved content, cancel immediately
    onCancel();
  }
}, [hasUnsavedContent, onCancel]);

// Handle confirm cancel from dialog
const handleConfirmCancel = useCallback(() => {
  setShowCancelDialog(false);
  onCancel();
}, [onCancel]);

// Handle keep working from dialog
const handleKeepWorking = useCallback(() => {
  setShowCancelDialog(false);
}, []);
```

**Steps:**
1. Remove the existing `handleDoneClick` callback
2. Remove the existing `handleDialogClose`, `handleAddItemsFromDialog`, `handleExitSession` callbacks
3. Add the three new callbacks: `handleCancelClick`, `handleConfirmCancel`, `handleKeepWorking`
4. Remove the `showEmptySessionDialog` state (no longer needed)

**Verification:**
- [ ] Clicking Cancel shows dialog when `hasUnsavedContent=true`
- [ ] Clicking Cancel calls `onCancel` directly when `hasUnsavedContent=false`
- [ ] Dialog can be closed via "Keep Working" button

**Story Points:** 0.25

---

### Task 4.4.5: Update Action Cards Configuration

**Objective:** Replace the conditional card array with fixed three cards.

**File:** `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`

**Steps:**
1. Remove the existing conditional card building logic (lines 222-270)
2. Add imports for `Check`, `Plus`, `X` icons from `lucide-react`
3. Replace with static array of exactly three cards:

```typescript
const cards = [
  {
    key: 'review-submit',
    icon: <Check className="w-6 h-6 text-green-600" aria-hidden="true" />,
    iconBgColor: 'bg-green-100',
    title: 'Review & Submit',
    description: 'Review your content and submit this item',
    onClick: onReviewSubmit,
  },
  {
    key: 'add-more-content',
    icon: <Plus className="w-6 h-6 text-blue-600" aria-hidden="true" />,
    iconBgColor: 'bg-blue-100',
    title: 'Add More Content',
    description: 'Add another video, photo, or document',
    onClick: onAddMoreContent,
  },
  {
    key: 'cancel',
    icon: <X className="w-6 h-6 text-red-600" aria-hidden="true" />,
    iconBgColor: 'bg-red-100',
    title: 'Cancel',
    description: 'Discard changes and exit',
    onClick: handleCancelClick,
  },
];
```

**Verification:**
- [ ] Exactly 3 cards render on the screen
- [ ] Card titles are "Review & Submit", "Add More Content", "Cancel"
- [ ] Icons match the specified colors
- [ ] Click handlers are correctly bound

**Story Points:** 0.25

---

### Task 4.4.6: Implement Cancel Confirmation Dialog UI

**Objective:** Add the inline cancel confirmation dialog with proper accessibility.

**File:** `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`

**Steps:**
1. Remove the `EmptySessionDialog` component import and usage
2. Add the cancel confirmation dialog inline (after the action cards container):

```typescript
{/* Cancel Confirmation Dialog */}
{showCancelDialog && (
  <div
    ref={dialogRef}
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    onClick={(e) => e.target === e.currentTarget && handleKeepWorking()}
    onKeyDown={(e) => e.key === 'Escape' && handleKeepWorking()}
    role="alertdialog"
    aria-modal="true"
    aria-labelledby="cancel-dialog-title"
    aria-describedby="cancel-dialog-description"
  >
    <div
      className={cn(
        "bg-white rounded-lg shadow-xl max-w-md w-full mx-4",
        "animate-in fade-in zoom-in-95 duration-200",
        "motion-reduce:animate-none"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header with warning icon */}
      <div className="flex items-start gap-4 p-6 pb-4">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="w-6 h-6 text-red-600" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h3
            id="cancel-dialog-title"
            className="text-lg font-semibold text-[#222222]"
          >
            Cancel Item Creation?
          </h3>
          <p
            id="cancel-dialog-description"
            className="mt-2 text-sm text-[#717171]"
          >
            You will lose any unsaved content. Are you sure you want to cancel?
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 p-6 pt-4 border-t border-gray-100">
        <button
          ref={keepWorkingButtonRef}
          type="button"
          onClick={handleKeepWorking}
          className={cn(
            "flex-1 px-4 py-2.5 text-sm font-medium rounded-lg",
            "text-gray-700 bg-gray-100",
            "hover:bg-gray-200 active:bg-gray-300",
            "transition-colors duration-150",
            "motion-reduce:transition-none",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
          )}
        >
          Keep Working
        </button>
        <button
          type="button"
          onClick={handleConfirmCancel}
          className={cn(
            "flex-1 px-4 py-2.5 text-sm font-medium rounded-lg",
            "text-white bg-red-500",
            "hover:bg-red-600 active:bg-red-700",
            "transition-colors duration-150",
            "motion-reduce:transition-none",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          )}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
```

3. Add useEffect for auto-focus on "Keep Working" button when dialog opens:
```typescript
useEffect(() => {
  if (showCancelDialog && keepWorkingButtonRef.current) {
    requestAnimationFrame(() => {
      keepWorkingButtonRef.current?.focus();
    });
  }
}, [showCancelDialog]);
```

**Verification:**
- [ ] Dialog appears when Cancel is clicked with unsaved content
- [ ] Dialog has proper ARIA attributes
- [ ] Focus is trapped within dialog
- [ ] "Keep Working" button closes dialog
- [ ] "Cancel" button calls onCancel and closes dialog
- [ ] Clicking backdrop closes dialog
- [ ] Escape key closes dialog

**Story Points:** 0.5

---

### Task 4.4.7: Update Parent Component Integration

**Objective:** Update ItemCreationWorkflow.tsx to pass correct props to NextActionStep.

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Current Implementation (lines 522-532):**
```typescript
case 'next-action': {
  const lastSavedItem = state.session.items[state.session.items.length - 1] || null;
  return (
    <NextActionStep
      itemsCreated={itemCount}
      lastSavedItem={lastSavedItem}
      onAddMore={handleAddMore}
      onTagNewItem={startNewItem}
      onDone={completeSession}
    />
  );
}
```

**New Implementation:**
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
      onReviewSubmit={() => goToStep('preview-save')}
      onAddMoreContent={() => goToStep('content-type-selection')}
      onCancel={handleExitClick}
    />
  );
}
```

**Steps:**
1. Locate the `case 'next-action':` in `renderCurrentStep()` function
2. Remove `lastSavedItem` variable
3. Add `hasUnsavedContent` calculation
4. Update props to match new interface:
   - `onReviewSubmit` → navigates to `preview-save` step
   - `onAddMoreContent` → navigates to `content-type-selection` step
   - `onCancel` → uses existing `handleExitClick` which shows ConfirmExitDialog

**Verification:**
- [ ] No TypeScript errors in ItemCreationWorkflow.tsx
- [ ] "Review & Submit" navigates to preview-save step
- [ ] "Add More Content" navigates to content-type-selection step
- [ ] "Cancel" triggers the exit confirmation flow

**Story Points:** 0.25

---

### Task 4.4.8: Remove Unused handleAddMore Callback

**Objective:** Clean up the now-unused handleAddMore callback from the parent.

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Steps:**
1. The `handleAddMore` callback (lines 244-263) is no longer needed since we're simplifying the NextActionStep
2. If `handleAddMore` is only used by NextActionStep, remove it entirely
3. If used elsewhere, leave it in place

**Current `handleAddMore` (lines 244-263):**
```typescript
const handleAddMore = useCallback(() => {
  const lastItem = state.session.items[state.session.items.length - 1];
  if (!lastItem) return;

  const restoredItem: CurrentItemState = {
    room: lastItem.room,
    itemType: lastItem.itemType,
    specificItem: lastItem.name.includes(' - ')
      ? lastItem.name.split(' - ')[1]
      : lastItem.name,
    itemName: lastItem.name,
    contentSource: 'existing',
    contentType: null,
    content: lastItem.content,
  };

  addMoreToItem(restoredItem);
}, [state.session.items, addMoreToItem]);
```

**Analysis:** This callback reconstructs the last saved item to allow adding more content. With the new simplified NextActionStep:
- "Add More Content" goes to content-type-selection (for current item, not last saved)
- This old callback was for "Add More to This Item" which added to the LAST SAVED item

**Decision:** Keep `handleAddMore` for now but do not use it in NextActionStep. It may be needed for other features. Just update the NextActionStep case to not use it.

**Verification:**
- [ ] Check if `handleAddMore` is used anywhere else in the codebase
- [ ] If not used, can be removed in a follow-up cleanup task
- [ ] No runtime errors

**Story Points:** 0.1

---

### Task 4.4.9: Remove Unused Imports and Clean Up

**Objective:** Remove unused imports and clean up the NextActionStep component.

**File:** `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`

**Steps:**
1. Remove `Tag` import from lucide-react (no longer used)
2. Remove `SessionItem` type import (no longer in props)
3. Remove `EmptySessionDialog` import
4. Remove `TruncatedText` import (no longer used)
5. Remove `MAX_CONTENT_PIECES` import (no longer used)
6. Remove the `truncateText` helper function (no longer used)
7. Update module documentation comment with new lastModified date

**Verification:**
- [ ] No unused imports warnings
- [ ] Component compiles without errors
- [ ] Module header updated with current date reference

**Story Points:** 0.1

---

### Task 4.4.10: Update Component Documentation

**Objective:** Update the component's JSDoc and file header documentation.

**File:** `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`

**Steps:**
1. Update the file header comment:
```typescript
/**
 * NextActionStep Component
 * Step 8 of ItemCreationWorkflow - Decision point after content creation.
 * Presents exactly three options: Review & Submit, Add More Content, or Cancel.
 *
 * @module ItemCreationWorkflow/components/steps/NextActionStep
 * @see docs/REQ-166-fix-nextactionstep-overview.md
 * @lastModified 2026-01-09 (REQ-166 Fix NextActionStep)
 */
```

2. Update the component's main function JSDoc if present

**Verification:**
- [ ] Documentation reflects new behavior
- [ ] lastModified date is accurate

**Story Points:** 0.1

---

### Task 4.4.11: Manual Testing - Basic Functionality

**Objective:** Verify all basic functionality works correctly.

**Steps:**
1. Start the development server: `npm run dev`
2. Navigate to the item creation workflow
3. Complete steps through content creation to reach NextActionStep
4. Verify exactly 3 cards are displayed:
   - [ ] "Review & Submit" card with green checkmark icon
   - [ ] "Add More Content" card with blue plus icon
   - [ ] "Cancel" card with red X icon

5. Test "Review & Submit":
   - [ ] Click "Review & Submit"
   - [ ] Verify navigation to preview-save step
   - [ ] No dialog appears

6. Test "Add More Content":
   - [ ] Click "Add More Content"
   - [ ] Verify navigation to content-type-selection step
   - [ ] No dialog appears

7. Test "Cancel" WITHOUT unsaved content:
   - [ ] Navigate to NextActionStep with no unsaved content
   - [ ] Click "Cancel"
   - [ ] Verify exit flow triggers directly (no dialog)

8. Test "Cancel" WITH unsaved content:
   - [ ] Navigate to NextActionStep with unsaved content
   - [ ] Click "Cancel"
   - [ ] Verify confirmation dialog appears
   - [ ] Click "Keep Working" - dialog closes, stays on NextActionStep
   - [ ] Click "Cancel" again, click "Cancel" in dialog
   - [ ] Verify exit flow triggers

**Verification:**
- [ ] All 8 test cases pass
- [ ] No console errors during testing

**Story Points:** 0.25

---

### Task 4.4.12: Accessibility Testing

**Objective:** Verify the component meets accessibility requirements.

**Steps:**
1. **Keyboard Navigation:**
   - [ ] All three cards are focusable with Tab key
   - [ ] Arrow keys navigate between cards
   - [ ] Enter/Space activates focused card
   - [ ] Focus order is logical (top to bottom)

2. **Cancel Dialog Accessibility:**
   - [ ] Dialog has role="alertdialog"
   - [ ] Dialog has aria-modal="true"
   - [ ] Dialog has aria-labelledby pointing to title
   - [ ] Dialog has aria-describedby pointing to description
   - [ ] Focus is trapped within dialog when open
   - [ ] Focus moves to "Keep Working" button when dialog opens
   - [ ] Escape key closes dialog
   - [ ] Focus returns to Cancel card after dialog closes

3. **Screen Reader Testing:**
   - [ ] Cards announce title and description
   - [ ] Dialog announces its content when opened
   - [ ] Action outcomes are clear

**Verification:**
- [ ] All accessibility tests pass
- [ ] No ARIA violations

**Story Points:** 0.25

---

### Task 4.4.13: Responsive Layout Testing

**Objective:** Verify layout works across viewport sizes.

**Steps:**
1. Test on mobile viewport (320px width):
   - [ ] All three cards are visible and tappable
   - [ ] Touch targets meet 48px minimum
   - [ ] Dialog is properly sized and readable

2. Test on tablet viewport (768px width):
   - [ ] Cards display appropriately
   - [ ] Dialog is centered and well-proportioned

3. Test on desktop viewport (1200px+ width):
   - [ ] Cards display appropriately
   - [ ] Dialog doesn't stretch too wide (max-width enforced)

**Verification:**
- [ ] Layout works across all viewports
- [ ] No overflow or truncation issues

**Story Points:** 0.1

---

## Implementation Order

Execute tasks in the following order:

1. **Task 4.4.1** - Update Props Interface
2. **Task 4.4.2** - Update Component Function Signature
3. **Task 4.4.3** - Add Cancel Dialog State
4. **Task 4.4.4** - Implement Cancel Click Handler
5. **Task 4.4.5** - Update Action Cards Configuration
6. **Task 4.4.6** - Implement Cancel Dialog UI
7. **Task 4.4.9** - Remove Unused Imports (can do now)
8. **Task 4.4.10** - Update Documentation
9. **Task 4.4.7** - Update Parent Integration
10. **Task 4.4.8** - Review handleAddMore Usage
11. **Task 4.4.11** - Manual Testing
12. **Task 4.4.12** - Accessibility Testing
13. **Task 4.4.13** - Responsive Testing

---

## Total Effort Summary

| Task | Estimate |
|------|----------|
| 4.4.1 - Update Props Interface | 0.25 SP |
| 4.4.2 - Update Component Signature | 0.25 SP |
| 4.4.3 - Add Dialog State | 0.25 SP |
| 4.4.4 - Implement Cancel Handler | 0.25 SP |
| 4.4.5 - Update Action Cards | 0.25 SP |
| 4.4.6 - Implement Dialog UI | 0.5 SP |
| 4.4.7 - Update Parent Integration | 0.25 SP |
| 4.4.8 - Review handleAddMore | 0.1 SP |
| 4.4.9 - Clean Up Imports | 0.1 SP |
| 4.4.10 - Update Documentation | 0.1 SP |
| 4.4.11 - Manual Testing | 0.25 SP |
| 4.4.12 - Accessibility Testing | 0.25 SP |
| 4.4.13 - Responsive Testing | 0.1 SP |
| **Total** | **~2.9 SP (~2-3 hours)** |

---

## Acceptance Criteria Verification

After implementation, verify all acceptance criteria from REQ-166:

| Criteria | Task(s) | Status |
|----------|---------|--------|
| Bottom navigation bar is completely removed from NextActionStep | N/A (already absent) | ⬜ |
| Exactly three action cards visible | 4.4.5 | ⬜ |
| Cards are: Review & Submit, Add More Content, Cancel | 4.4.5 | ⬜ |
| Cancel triggers confirmation dialog | 4.4.4, 4.4.6 | ⬜ |
| Dialog warns about losing unsaved work | 4.4.6 | ⬜ |
| Review & Submit proceeds without prompts | 4.4.7, 4.4.11 | ⬜ |
| Add More Content returns without prompts | 4.4.7, 4.4.11 | ⬜ |
| Layout adapts responsively | 4.4.13 | ⬜ |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking parent component integration | Update parent props carefully, test navigation flows |
| Accessibility regression | Follow existing ConfirmExitDialog pattern, test with keyboard |
| Focus management issues | Use existing useFocusTrap utility |
| Dialog not dismissible | Implement all dismiss methods: button, backdrop, escape key |

---

## References

- Overview Document: `/docs/REQ-166-fix-nextactionstep-overview.md`
- Implementation Plan: `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md` (Phase 4, Task 4.4)
- Original Request: `/docs/gen_requests.md` (REQ-166)
- Current Component: `/src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`
- Dialog Pattern: `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx`
- Type Definitions: `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
- Accessibility Utilities: `/src/components/ItemCreationWorkflow/utils/accessibility.ts`
