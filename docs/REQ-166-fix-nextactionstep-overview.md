# REQ-166: Fix NextActionStep - Implementation Overview

**Generated:** 2026-01-09 23:45:00 UTC
**Last Modified:** 2026-01-09 23:45:00 UTC
**Request ID:** REQ-166
**Type:** ENHANCEMENT
**Size:** S
**Phase:** 4 - Remove Duplicate Navigation
**Task ID:** 4.4

---

## Summary

Simplify the NextActionStep screen by removing the bottom navigation bar and standardizing on exactly three action cards with a confirmation dialog for the cancel action. This aligns with the broader UI/UX cleanup initiative (Plan-094) to eliminate redundant navigation patterns.

---

## Current Implementation Analysis

### Location
`src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`

### Current Behavior
The NextActionStep component currently displays:
1. Page header ("What's Next?")
2. Session progress bar showing items created
3. Action cards (conditionally displayed):
   - "Add More to This Item" (only if `lastSavedItem` exists and `lastItemContentCount < MAX_CONTENT_PIECES`)
   - "Tag New Item" (always visible)
   - "I'm Done" (always visible)
4. Empty session dialog when user clicks "I'm Done" with 0 items

### Issues to Address
1. **Incorrect action card names**: Current cards are "Add More to This Item," "Tag New Item," and "I'm Done" - need to change to "Review & Submit," "Add More Content," and "Cancel"
2. **Missing confirmation dialog for Cancel**: The current "I'm Done" card shows EmptySessionDialog but only when no items exist. A proper Cancel action should always warn about losing unsaved work when content has been added.
3. **Conditional card visibility**: The "Add More" card only appears conditionally, but per requirements we need exactly 3 cards always visible

---

## Requirements (from REQ-166)

### Acceptance Criteria
- [ ] Bottom navigation bar is completely removed from the NextActionStep screen
- [ ] Exactly three action cards are visible: Review & Submit, Add More Content, and Cancel
- [ ] Selecting Cancel triggers a confirmation dialog before proceeding
- [ ] The confirmation dialog explicitly warns users about losing unsaved work
- [ ] Selecting "Review & Submit" proceeds to the review step without additional prompts
- [ ] Selecting "Add More Content" returns users to add additional items without additional prompts
- [ ] The layout adapts responsively across mobile, tablet, and desktop viewports

---

## Implementation Plan

### Task 4.4.1: Update Action Cards to Match Requirements

**Current cards:**
1. "Add More to This Item" → **Change to:** "Add More Content"
2. "Tag New Item" → **Change to:** (remove - consolidate with Add More Content)
3. "I'm Done" → **Change to:** "Review & Submit"

**Required cards (exactly 3):**
1. **Review & Submit** - Proceeds to preview-save step
2. **Add More Content** - Returns to content-type-selection to add more content
3. **Cancel** - Shows confirmation dialog, then exits workflow

### Task 4.4.2: Create Cancel Confirmation Dialog

Create a new dialog similar to `ConfirmExitDialog` but specifically for the Cancel action from NextActionStep. The dialog should:
- Show warning icon (AlertTriangle)
- Display title: "Cancel Item Creation?"
- Display message: "You will lose any unsaved content. Are you sure you want to cancel?"
- Have two buttons: "Keep Working" (secondary) and "Cancel" (destructive)

**Note:** The existing `ConfirmExitDialog` can be reused or extended for this purpose since it already handles the workflow exit confirmation pattern with focus trapping and accessibility support.

### Task 4.4.3: Update Props Interface

The current `NextActionStepProps` interface:
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

**Updated interface:**
```typescript
export interface NextActionStepProps {
  /** Number of items created in this session */
  itemsCreated: number;
  /** Whether user has added any content (upload, text, recording) that would be lost on cancel */
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

### Task 4.4.4: Update Parent Integration

Update `ItemCreationWorkflow.tsx` to:
1. Pass `hasUnsavedContent` prop based on `state.currentItem?.content.length > 0` or `state.isDirty`
2. Rename callbacks to match new prop names
3. Handle cancel action appropriately (exit workflow)

---

## Authorized Files and Functions for Modification

### Files to Modify

| File | Purpose | Changes |
|------|---------|---------|
| `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` | Main component | Update action cards, add cancel dialog state, implement new UI |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Parent orchestrator | Update NextActionStep props, add handlers for new callbacks |

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` | Pattern for confirmation dialog |
| `src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx` | Current dialog used in NextActionStep |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Type definitions |
| `src/components/ItemCreationWorkflow/utils/accessibility.ts` | Focus trap utility |

### Functions to Modify

| Function | File | Changes |
|----------|------|---------|
| `NextActionStep()` | NextActionStep.tsx | Complete rewrite of action cards |
| `renderCurrentStep()` | ItemCreationWorkflow.tsx | Update case 'next-action' props |

---

## Technical Design

### New Cancel Confirmation Dialog State

```typescript
// In NextActionStep.tsx
const [showCancelDialog, setShowCancelDialog] = useState(false);

const handleCancelClick = useCallback(() => {
  if (hasUnsavedContent) {
    setShowCancelDialog(true);
  } else {
    onCancel();
  }
}, [hasUnsavedContent, onCancel]);

const handleConfirmCancel = useCallback(() => {
  setShowCancelDialog(false);
  onCancel();
}, [onCancel]);
```

### Updated Action Cards Configuration

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

### Dialog Component

Either extend `ConfirmExitDialog` or create inline dialog in NextActionStep:

```typescript
// Using existing ConfirmExitDialog pattern
<ConfirmExitDialog
  isOpen={showCancelDialog}
  onClose={() => setShowCancelDialog(false)}
  onConfirmExit={handleConfirmCancel}
  itemCount={itemsCreated}
  hasUnsavedChanges={hasUnsavedContent}
/>
```

Or create a dedicated inline dialog with appropriate messaging:
- Title: "Cancel Item Creation?"
- Message: "You will lose any unsaved content. Are you sure you want to cancel?"

---

## Integration Points

### Parent Component Changes (`ItemCreationWorkflow.tsx`)

```typescript
// In renderCurrentStep(), case 'next-action':
case 'next-action': {
  const hasUnsavedContent = state.currentItem !== null && (
    state.currentItem.content.length > 0 || state.isDirty
  );
  return (
    <NextActionStep
      itemsCreated={itemCount}
      hasUnsavedContent={hasUnsavedContent}
      onReviewSubmit={() => goToStep('preview-save')}
      onAddMoreContent={() => goToStep('content-type-selection')}
      onCancel={handleExitClick} // Reuse existing exit handling
    />
  );
}
```

---

## Testing Requirements

### Unit Tests

1. **Render tests:**
   - Exactly 3 action cards are rendered
   - Correct titles and descriptions displayed
   - Icons rendered correctly

2. **Interaction tests:**
   - "Review & Submit" calls `onReviewSubmit`
   - "Add More Content" calls `onAddMoreContent`
   - "Cancel" shows dialog when `hasUnsavedContent=true`
   - "Cancel" calls `onCancel` directly when `hasUnsavedContent=false`

3. **Dialog tests:**
   - Dialog opens on Cancel click with unsaved content
   - "Keep Working" closes dialog without calling `onCancel`
   - "Cancel" in dialog calls `onCancel`

4. **Accessibility tests:**
   - All cards have proper aria-labels
   - Dialog has focus trapping
   - Keyboard navigation works (arrow keys between cards)

### Integration Tests

1. Full flow from NextActionStep to preview-save via "Review & Submit"
2. Full flow back to content-type-selection via "Add More Content"
3. Cancel flow with confirmation dialog

---

## Dependencies

### Existing Dependencies (No New Packages Required)
- Lucide React icons (Plus, Check, X, AlertTriangle)
- `cn` utility from `@/lib/utils`
- `useFocusTrap` from workflow utils (for dialog)

### Internal Dependencies
- `ConfirmExitDialog` pattern can be reused
- Existing `ActionCard` sub-component can be reused with minor modifications

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing workflow flow | Low | High | Props are backward-compatible, can deprecate old props |
| Accessibility regression | Low | Medium | Reuse existing accessible dialog pattern |
| User confusion with new labels | Low | Low | Labels are more intuitive than current ones |

---

## Effort Estimate

| Task | Estimate | Confidence |
|------|----------|------------|
| Update action cards in NextActionStep | 30 min | High |
| Add cancel confirmation dialog | 30 min | High |
| Update parent integration | 20 min | High |
| Update tests | 30 min | Medium |
| Manual testing | 20 min | High |
| **Total** | **~2 hours** | High |

---

## References

- Implementation Plan: `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md` (Phase 4, Task 4.4)
- Request: `/docs/gen_requests.md` (REQ-166)
- Current Component: `/src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`
- Dialog Pattern: `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx`
- Type Definitions: `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
