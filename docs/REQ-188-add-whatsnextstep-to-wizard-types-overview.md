# REQ-188: Add WhatsNextStep to Wizard Step Type Definitions

**Generated:** 2026-01-12 01:45:00
**Last Modified:** 2026-01-12 01:45:00
**Request:** #188 from docs/gen_requests.md
**Implementation Plan Reference:** docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md
**Phase:** 2 - REQ-3 - Fix "What's Next" Screen
**Task ID:** 2.2

---

## Overview

This task adds the `'whats-next'` value to the `WizardStep` union type in the ItemCapture type system. This enables the wizard state machine to recognize the What's Next screen as a valid step while ensuring it is explicitly excluded from progress counting logic.

The key requirement is that `'whats-next'` is a valid step for navigation purposes but should NOT contribute to the step count displayed in the `ProgressIndicator` component. This aligns with the UX intent that the What's Next screen is a post-workflow decision point, not part of the numbered workflow progression.

---

## Current State

### WizardStep Type (ItemCapture.types.ts:246-256)

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

The type does not include `'whats-next'`, meaning:
1. The state machine cannot navigate to this step without type errors
2. Components referencing this step require type workarounds
3. The `STEP_TO_STAGE_INDEX` map in `ProgressIndicator.tsx` will need updating

### Progress Indicator Stage Mapping (ProgressIndicator.tsx:65-75)

```typescript
export const STEP_TO_STAGE_INDEX: Record<WizardStep, number> = {
  'metadata': 0,        // Stage 1: Details
  'content-type': 1,    // Stage 2: Content
  'capture-video': 1,   // Stage 2: Content
  'capture-photo': 1,   // Stage 2: Content
  'upload-file': 1,     // Stage 2: Content
  'write-text': 1,      // Stage 2: Content
  'edit-media': 2,      // Stage 3: Edit
  'add-more': 1,        // Stage 2: Content (returning)
  'review': 3,          // Stage 4: Review
  // 'add-url' is missing in current mapping
};
```

This `Record<WizardStep, number>` type requires an entry for every `WizardStep` value. When `'whats-next'` is added to the union, it must also be added to this map.

---

## Required Changes

### Task 2.2.1: Add 'whats-next' to WizardStep Union Type

**File:** `src/components/ItemCapture/ItemCapture.types.ts`
**Location:** Lines 246-256

Add `'whats-next'` to the `WizardStep` union type:

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
  | 'review'
  | 'whats-next';  // NEW: Post-workflow decision point (not counted in progress)
```

### Task 2.2.2: Update STEP_TO_STAGE_INDEX Mapping

**File:** `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`
**Location:** Lines 65-75

Add an entry for `'whats-next'` that maps to `-1` (indicating it should not be displayed in progress):

```typescript
export const STEP_TO_STAGE_INDEX: Record<WizardStep, number> = {
  'metadata': 0,        // Stage 1: Details
  'content-type': 1,    // Stage 2: Content
  'capture-video': 1,   // Stage 2: Content
  'capture-photo': 1,   // Stage 2: Content
  'upload-file': 1,     // Stage 2: Content
  'write-text': 1,      // Stage 2: Content
  'add-url': 1,         // Stage 2: Content (FIX: was missing)
  'edit-media': 2,      // Stage 3: Edit
  'add-more': 1,        // Stage 2: Content (returning)
  'review': 3,          // Stage 4: Review
  'whats-next': -1,     // Not displayed in progress (post-workflow)
};
```

### Task 2.2.3: Update ProgressIndicator to Handle 'whats-next' Step

**File:** `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`
**Location:** Lines 104-110 (component logic)

The `getCurrentStageIndex` function should handle the `-1` case gracefully. Add logic to hide the progress indicator when on 'whats-next' step:

Option A - Return early when on 'whats-next':
```typescript
export function ProgressIndicator({
  currentStep,
  className,
}: ProgressIndicatorProps) {
  // Don't show progress indicator for post-workflow steps
  if (currentStep === 'whats-next') {
    return null;
  }

  const currentIndex = getCurrentStageIndex(currentStep);
  // ... rest of component
}
```

Option B - Keep the component but show completed state:
```typescript
const currentIndex = getCurrentStageIndex(currentStep);
const isPostWorkflow = currentIndex === -1;
const displayIndex = isPostWorkflow ? PROGRESS_STAGES.length - 1 : currentIndex;
const progressPercent = isPostWorkflow ? 100 : ((displayIndex + 1) / totalStages) * 100;
```

**Recommendation:** Option A is cleaner - simply hide the progress indicator on the What's Next screen.

---

## Dependencies

### Depends On (upstream)
- **Task 2.1 (Create WhatsNextStep Component):** The component that will use the 'whats-next' step must exist before this type change can be fully exercised. However, the type addition can be done independently.

### Blocks (downstream)
- **Task 2.3 (Integrate WhatsNextStep into ItemCapture Flow):** Cannot transition to 'whats-next' step without this type being defined. The `goToStep('whats-next')` call in ItemCapture.tsx will fail type checking without this change.
- **Task 2.4 (Ensure No Navigation Controls on WhatsNextStep):** Relies on ProgressIndicator handling 'whats-next' correctly.

### Parallel Safety
- **Files touched:**
  - `src/components/ItemCapture/ItemCapture.types.ts`
  - `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`
- **Conflicts with:**
  - Task 1.1 (Update Progress Stages Constant) - touches ProgressIndicator.tsx
  - Task 2.1 (Create WhatsNextStep Component) - may import from ItemCapture.types.ts
- **Safe to parallelize with:**
  - All Phase 3 tasks (Dashboard cards) - different files
  - All Phase 4 tasks (Navigation menu) - different files
  - Phase 0 tasks (MetadataStep, ReviewStep) - different files

---

## Authorized Files and Functions for Modification

### Primary Files

| File | Functions/Sections | Change Type |
|------|-------------------|-------------|
| `src/components/ItemCapture/ItemCapture.types.ts` | `WizardStep` type (lines 246-256) | Add union member |
| `src/components/ItemCapture/components/shared/ProgressIndicator.tsx` | `STEP_TO_STAGE_INDEX` (lines 65-75), `ProgressIndicator` component (lines 104-187) | Add mapping entry, handle -1 case |

### Type Changes Impact

Adding a new value to the `WizardStep` union will cause TypeScript to flag any exhaustive switch statements or Record types that don't handle the new value. Expected impacted locations:

1. **STEP_TO_STAGE_INDEX in ProgressIndicator.tsx** - Must be updated (covered above)
2. **Any switch statements on WizardStep** - Need review in ItemCapture.tsx

---

## Implementation Tasks

| # | Task | Size | Priority |
|---|------|------|----------|
| 2.2.1 | Add 'whats-next' to WizardStep union type | XS | Required |
| 2.2.2 | Add 'whats-next' entry to STEP_TO_STAGE_INDEX with value -1 | XS | Required |
| 2.2.3 | Add 'add-url' entry to STEP_TO_STAGE_INDEX (bug fix) | XS | Required |
| 2.2.4 | Update ProgressIndicator to hide when currentStep is 'whats-next' | XS | Required |
| 2.2.5 | Add JSDoc comment explaining 'whats-next' is not counted in progress | XS | Optional |

---

## Testing Checklist

- [ ] TypeScript compilation succeeds with new WizardStep value
- [ ] ProgressIndicator returns null when currentStep is 'whats-next'
- [ ] No console errors when navigating to 'whats-next' step
- [ ] Progress bar shows 100% on 'review' step (last visible step)
- [ ] Step count text shows "Step 4 of 4" on review step
- [ ] Verify 'add-url' step also maps correctly (bug fix verification)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking exhaustive checks | High | Low | Fix all type errors before merge |
| Missing STEP_TO_STAGE_INDEX entry | High | Low | TypeScript will catch this as Record type requires all keys |
| ProgressIndicator display issues | Low | Medium | Returning null is safest approach |

---

## References

- Implementation Plan: `docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md` (Phase 2, Task 2.2)
- Request: `docs/gen_requests.md` REQ-188
- WizardStep type: `src/components/ItemCapture/ItemCapture.types.ts:246-256`
- ProgressIndicator: `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`
