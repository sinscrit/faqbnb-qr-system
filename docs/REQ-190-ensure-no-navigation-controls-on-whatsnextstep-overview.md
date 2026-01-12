# REQ-190: Remove Navigation Controls from WhatsNextStep Completion Screen

**Generated:** 2026-01-12 16:30:00
**Last Modified:** 2026-01-12 16:30:00
**Request ID:** REQ-190
**Implementation Plan Reference:** docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md
**Phase:** 2 - REQ-3 - Fix "What's Next" Screen
**Task ID:** 2.4

---

## Overview

This task ensures the WhatsNextStep component displays as a clean post-completion menu without any workflow navigation controls. The WhatsNextStep screen should:
- NOT display a back button (cannot undo a completed save)
- NOT display a cancel button (nothing to cancel after save)
- NOT be included in the numbered progress indicator display
- ONLY show the four action options (Edit Instructions, Add New Instructions, Create New Item, Done)

This is part of Phase 2 (REQ-3) which implements the "What's Next" screen as a post-workflow decision point rather than a numbered step in the wizard progression.

---

## Current State Analysis

### ProgressIndicator.tsx (lines 54-75)

The `PROGRESS_STAGES` constant defines 4 display stages:
```typescript
export const PROGRESS_STAGES: StepDefinition[] = [
  { id: 'details', label: 'Details', shortLabel: '1' },
  { id: 'content', label: 'Content', shortLabel: '2' },
  { id: 'edit', label: 'Edit', shortLabel: '3' },
  { id: 'review', label: 'Review', shortLabel: '4' },
];
```

The `STEP_TO_STAGE_INDEX` mapping currently includes these wizard steps:
```typescript
export const STEP_TO_STAGE_INDEX: Record<WizardStep, number> = {
  'metadata': 0,
  'content-type': 1,
  'capture-video': 1,
  'capture-photo': 1,
  'upload-file': 1,
  'write-text': 1,
  'edit-media': 2,
  'add-more': 1,
  'review': 3,
};
```

**Issue:** The `whats-next` step is not yet in `WizardStep` type or the mapping. Once Task 2.2 (Add WhatsNextStep to Wizard Types) adds it, this mapping must either:
1. Exclude `whats-next` entirely, OR
2. Map it to a special value (e.g., -1) that signals "hide progress indicator"

### ItemCapture.types.ts (lines 246-256)

The current `WizardStep` type union does NOT include `whats-next`:
```typescript
export type WizardStep =
  | 'metadata'
  | 'content-type'
  | 'capture-video'
  | 'capture-photo'
  | 'upload-file'
  | 'write-text'
  | 'add-url'
  | 'edit-media'
  | 'add-more'
  | 'review';
```

### ItemCapture.tsx (lines 543-576)

The main component currently hides wizard navigation for the `review` step:
```typescript
const showWizardNav = state.currentStep !== 'review';

if (!showWizardNav) {
  // Review step has its own navigation
  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200', className)}>
      {renderStep}
    </div>
  );
}
```

**Pattern to extend:** The same pattern should apply to `whats-next` step - render without CaptureWizard wrapper.

### CaptureWizard.tsx (lines 90-140)

The CaptureWizard component wraps step content with:
1. Header: `<ProgressIndicator currentStep={currentStep} />`
2. Content area for children
3. Footer: `<StepNavigation />` with Cancel, Back, Next/Submit buttons

**Issue:** When `whats-next` is the current step, neither the ProgressIndicator nor the StepNavigation should be visible.

---

## Technical Approach

### Approach 1: Extend showWizardNav Pattern (Recommended)

Modify `ItemCapture.tsx` to also hide wizard navigation for `whats-next` step:

```typescript
const showWizardNav = state.currentStep !== 'review' && state.currentStep !== 'whats-next';
```

This leverages the existing pattern and ensures the WhatsNextStep component:
- Renders without the CaptureWizard wrapper
- Has no progress indicator in the header
- Has no navigation controls in the footer
- Only displays its own action buttons

### Approach 2: Add Step Mapping for Progress Indicator

Update `STEP_TO_STAGE_INDEX` to handle `whats-next` with a special value:

```typescript
export const STEP_TO_STAGE_INDEX: Record<WizardStep, number> = {
  // ... existing mappings ...
  'whats-next': -1,  // -1 indicates "not a numbered step"
};
```

Then update ProgressIndicator to hide when index is -1:
```typescript
export function ProgressIndicator({ currentStep, className }: ProgressIndicatorProps) {
  const currentIndex = getCurrentStageIndex(currentStep);

  // Hide progress indicator for non-step screens
  if (currentIndex < 0) {
    return null;
  }
  // ... rest of component
}
```

### Recommended Combined Approach

Use **Approach 1** as the primary solution (cleanest, follows existing pattern) with **Approach 2** as a defensive measure in case the ProgressIndicator is ever used standalone.

---

## Implementation Tasks

### Task 2.4.1: Update showWizardNav Logic in ItemCapture.tsx

**File:** `src/components/ItemCapture/ItemCapture.tsx`
**Line:** ~548

**Change:**
```typescript
// Before:
const showWizardNav = state.currentStep !== 'review';

// After:
const showWizardNav = state.currentStep !== 'review' && state.currentStep !== 'whats-next';
```

### Task 2.4.2: Add whats-next to STEP_TO_STAGE_INDEX with -1 Value

**File:** `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`
**Lines:** 65-75

**Change:** After Task 2.2 adds `'whats-next'` to WizardStep type, update the mapping:
```typescript
export const STEP_TO_STAGE_INDEX: Record<WizardStep, number> = {
  'metadata': 0,
  'content-type': 1,
  'capture-video': 1,
  'capture-photo': 1,
  'upload-file': 1,
  'write-text': 1,
  'add-url': 1,        // Already in WizardStep but missing from mapping
  'edit-media': 2,
  'add-more': 1,
  'review': 3,
  'whats-next': -1,    // NEW: Not a numbered step
};
```

### Task 2.4.3: Update ProgressIndicator to Hide on Negative Index

**File:** `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`
**Lines:** 104-188

**Change:** Add early return for negative index:
```typescript
export function ProgressIndicator({
  currentStep,
  className,
}: ProgressIndicatorProps) {
  const currentIndex = getCurrentStageIndex(currentStep);

  // Hide progress indicator for non-numbered steps (like whats-next)
  if (currentIndex < 0) {
    return null;
  }

  const totalStages = PROGRESS_STAGES.length;
  // ... rest of component
}
```

### Task 2.4.4: Add Rendering for WhatsNextStep in ItemCapture.tsx

**File:** `src/components/ItemCapture/ItemCapture.tsx`
**Location:** In the `renderStep` useMemo switch statement (after `case 'review':`)

**Change:** Add case for 'whats-next':
```typescript
case 'whats-next':
  return (
    <WhatsNextStep
      savedItemId={savedItemState.id}
      savedItemName={savedItemState.name}
      onEditInstructions={handleEditInstructions}
      onAddNewInstructions={handleAddNewInstructions}
      onCreateNewItem={handleCreateNewItem}
      onDone={handleDone}
    />
  );
```

**Note:** This requires state variables for `savedItemState` and callback handlers, which are created in Task 2.3.

---

## Dependencies

### Depends On (upstream)
- **Task 2.1**: Create WhatsNextStep Component - The component must exist before it can be rendered
- **Task 2.2**: Add WhatsNextStep to Wizard Types - The `'whats-next'` step must be in `WizardStep` type before it can be added to `STEP_TO_STAGE_INDEX`
- **Task 2.3**: Integrate WhatsNextStep into ItemCapture Flow - The saved item state and callback handlers must exist

### Blocks (downstream)
- None - This is the final task in the Phase 2 REQ-3 sequence

### Parallel Safety
- **Files touched:**
  - `src/components/ItemCapture/ItemCapture.tsx` (shared with Task 2.3)
  - `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`
- **Conflicts with:** Task 2.3 (both modify ItemCapture.tsx)
- **Safe to parallelize with:**
  - Phase 3 tasks (REQ-1 Dashboard Cards) - different files
  - Phase 4 tasks (REQ-4 Navigation) - different files

---

## Authorized Files and Functions for Modification

### Primary Files

| File | Function/Section | Change Type |
|------|------------------|-------------|
| `src/components/ItemCapture/ItemCapture.tsx` | `showWizardNav` variable (~line 548) | Modify condition |
| `src/components/ItemCapture/ItemCapture.tsx` | `renderStep` useMemo switch (~line 357-541) | Add 'whats-next' case |
| `src/components/ItemCapture/components/shared/ProgressIndicator.tsx` | `STEP_TO_STAGE_INDEX` constant (lines 65-75) | Add 'whats-next': -1 |
| `src/components/ItemCapture/components/shared/ProgressIndicator.tsx` | `ProgressIndicator` function (lines 104-188) | Add early return for -1 |

### Verification Files (Read-Only)

| File | Purpose |
|------|---------|
| `src/components/ItemCapture/ItemCapture.types.ts` | Verify WizardStep type includes 'whats-next' after Task 2.2 |
| `src/components/ItemCapture/components/CaptureWizard.tsx` | Understand wrapper structure (no changes needed) |
| `src/components/ItemCapture/components/shared/StepNavigation.tsx` | Understand navigation controls (no changes needed) |

---

## Testing Requirements

### Unit Tests

1. **ProgressIndicator hides for 'whats-next' step:**
   - When `currentStep='whats-next'`, component returns null
   - When `currentStep='review'`, component renders normally

2. **showWizardNav excludes 'whats-next':**
   - When `state.currentStep === 'whats-next'`, `showWizardNav` is false
   - When `state.currentStep === 'metadata'`, `showWizardNav` is true

### Integration Tests

1. **WhatsNextStep renders without wrapper:**
   - Navigate through wizard to 'whats-next' step
   - Verify no ProgressIndicator visible
   - Verify no StepNavigation (Cancel/Back/Next) visible
   - Verify only WhatsNextStep action buttons visible

2. **Mobile and desktop consistency:**
   - Test on mobile viewport: no progress bar visible
   - Test on desktop viewport: no step indicators visible

### Manual Verification

- [ ] Complete item capture flow through to save
- [ ] Verify WhatsNextStep appears after save
- [ ] Verify NO back button visible
- [ ] Verify NO cancel button visible
- [ ] Verify NO progress indicator (mobile bar OR desktop steps)
- [ ] Verify ONLY 4 action buttons visible
- [ ] Test on both mobile and desktop viewports

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|--------------------|----------------|
| WhatsNextStep does not display a back button | `showWizardNav` excludes 'whats-next', so CaptureWizard not rendered |
| WhatsNextStep does not display a cancel button | `showWizardNav` excludes 'whats-next', so CaptureWizard not rendered |
| WhatsNextStep is not included in numbered progress indicator | `STEP_TO_STAGE_INDEX['whats-next'] = -1` and early return in ProgressIndicator |
| Progress indicator hides when WhatsNextStep is active | `showWizardNav` false means no CaptureWizard wrapper, plus defensive -1 check |
| Only four action buttons visible | WhatsNextStep component design (Task 2.1) |
| Consistent layout without navigation controls | WhatsNextStep has its own layout, not using CaptureWizard |
| Mobile and desktop both exclude controls | Same logic applies to both viewports |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| TypeScript error if 'whats-next' not in WizardStep yet | Medium | Low | Ensure Task 2.2 completes first |
| Missing mapping in STEP_TO_STAGE_INDEX | Medium | Low | TypeScript will error if Record is incomplete |
| Stale step state after navigation | Low | Medium | Verify step transitions work correctly |

---

## Effort Estimate

| Task | Estimate |
|------|----------|
| 2.4.1: Update showWizardNav logic | 5 minutes |
| 2.4.2: Add whats-next to mapping | 5 minutes |
| 2.4.3: Update ProgressIndicator for -1 | 10 minutes |
| 2.4.4: Add WhatsNextStep case in renderStep | 15 minutes |
| Testing | 20 minutes |
| **Total** | **~1 hour** |

---

## References

- **Implementation Plan:** docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md (Task 2.4)
- **Request:** docs/gen_requests.md - REQ-190
- **Related Tasks:**
  - Task 2.1: Create WhatsNextStep Component
  - Task 2.2: Add WhatsNextStep to Wizard Types
  - Task 2.3: Integrate WhatsNextStep into ItemCapture Flow
