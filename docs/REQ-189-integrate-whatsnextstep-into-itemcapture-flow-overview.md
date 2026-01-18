# Implementation Breakdown: REQ-189 - Integrate WhatsNextStep into ItemCapture Flow

**Document Generated:** 2026-01-12 10:45:00
**Last Modified:** 2026-01-12 10:45:00
**Request Reference:** docs/gen_requests.md - Request #189
**Implementation Plan Reference:** docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md
**Phase:** 2 - REQ-3 - Fix "What's Next" Screen
**Task ID:** 2.3

---

## Overview

This task integrates the WhatsNextStep component into the ItemCapture wizard flow. The WhatsNextStep component displays immediately after successful item save, providing users with clear post-completion actions (Print QR Codes, Create Another Item, View Items, Go to Dashboard) without counting as part of the numbered workflow progression.

### Context from Implementation Plan

- **Phase 0 (REQ-2)**: Data model UI clarity - establishes Item vs Article terminology (CRITICAL foundation)
- **Phase 1 (REQ-5)**: Workflow step count fix - confirms 8 steps total with Save as final step
- **Phase 2 (REQ-3)**: What's Next screen - this task is part of implementing the 4-action menu post-save

---

## Dependencies

### Depends On (upstream)
- **Task 2.1**: Create WhatsNextStep Component - The component must exist before it can be integrated
- **Task 2.2**: Add WhatsNextStep to Wizard Types - The `'whats-next'` step type must be added to `WizardStep` union
- **Phase 0 (REQ-2)**: Correct Item vs Article terminology must be established for "Edit Instructions" option
- **Phase 1 (REQ-5)**: Step count must be finalized so WhatsNextStep can properly exclude itself from count

### Blocks (downstream)
- **Task 2.4**: Ensure No Navigation Controls on WhatsNextStep - requires integration to test navigation control removal
- **Testing Phase 2 (REQ-3)**: All What's Next testing depends on successful integration

### Parallel Safety
- **Files touched:**
  - `src/components/ItemCapture/ItemCapture.tsx` (primary modification)
  - `src/components/ItemCapture/hooks/useItemCaptureState.ts` (STEP_TRANSITIONS update)
  - `src/components/ItemCapture/components/shared/ProgressIndicator.tsx` (STEP_TO_STAGE_INDEX update)
- **Conflicts with:**
  - Task 2.1 (creates WhatsNextStep.tsx - must complete first)
  - Task 2.2 (modifies ItemCapture.types.ts - must complete first)
  - Task 2.4 (modifies same files for navigation control removal - should run after)
- **Safe to parallelize with:**
  - Phase 3 (REQ-1): Dashboard card changes - different file set
  - Phase 4 (REQ-4): Navigation menu updates - different file set

---

## Current State Analysis

### ItemCapture.tsx Flow (lines 143-224)

The current `handleSubmit` function:
1. Validates the form data
2. Assembles the ItemRecord
3. Calls `onComplete(record)`
4. Calls `reset()` - immediately resets state

**Problem:** After save, the wizard immediately resets rather than transitioning to a post-completion screen.

### useItemCaptureState.ts State Machine (lines 49-60)

The `STEP_TRANSITIONS` map defines valid transitions but has no entry for `'whats-next'`:
```typescript
export const STEP_TRANSITIONS: Record<WizardStep, WizardStep[]> = {
  'metadata': ['content-type'],
  'content-type': ['capture-video', 'capture-photo', 'upload-file', 'write-text', 'add-url'],
  // ... other steps
  'review': ['metadata', 'content-type'],  // No 'whats-next' transition
};
```

### ProgressIndicator.tsx Step Mapping (lines 65-75)

The `STEP_TO_STAGE_INDEX` map needs updating to handle `'whats-next'`:
```typescript
export const STEP_TO_STAGE_INDEX: Record<WizardStep, number> = {
  'metadata': 0,
  // ... other steps
  'review': 3,
  // Missing: 'whats-next' entry
};
```

---

## Technical Approach

### Strategy
1. Modify `handleSubmit` to transition to `'whats-next'` step instead of calling `reset()`
2. Store saved item information (ID, name) in component state for WhatsNextStep props
3. Update `STEP_TRANSITIONS` to allow `'review' -> 'whats-next'` transition
4. Update `STEP_TO_STAGE_INDEX` to map `'whats-next'` to -1 (or handle specially to hide progress)
5. Add WhatsNextStep rendering in the step switch statement
6. Implement callback handlers for the four action options

### Key Implementation Details

#### 1. New State for Saved Item Info
Add state to track the saved item for the WhatsNextStep:
```typescript
const [savedItem, setSavedItem] = useState<{id: string; name: string} | null>(null);
```

#### 2. Modified handleSubmit Flow
```typescript
// After successful submission:
// OLD:
onComplete(record);
reset();

// NEW:
onComplete(record);
setSavedItem({ id: record.id, name: record.title });
goToStep('whats-next');
```

#### 3. WhatsNextStep Callback Handlers
- `onEditInstructions`: Navigate to edit view for the saved item
- `onAddNewInstructions`: Reset wizard but keep item reference
- `onCreateNewItem`: Full reset and go to metadata step
- `onDone`: Navigate to dashboard or call parent's onComplete

#### 4. Progress Indicator Exclusion
The `'whats-next'` step should NOT appear in the progress indicator:
```typescript
// Option A: Map to -1 (special "hidden" value)
'whats-next': -1

// Option B: Conditionally hide the indicator when on whats-next step
```

---

## Implementation Tasks

### Task 1: Update STEP_TRANSITIONS in useItemCaptureState.ts
**File:** `src/components/ItemCapture/hooks/useItemCaptureState.ts`
**Lines:** 49-60

Add `'whats-next'` transition from `'review'`:
```typescript
'review': ['metadata', 'content-type', 'whats-next'],
'whats-next': [],  // Terminal step - no forward navigation
```

### Task 2: Update STEP_TO_STAGE_INDEX in ProgressIndicator.tsx
**File:** `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`
**Lines:** 65-75

Add `'whats-next'` mapping (once WizardStep type includes it from Task 2.2):
```typescript
'whats-next': -1,  // Not included in progress display
```

### Task 3: Add saved item state to ItemCapture.tsx
**File:** `src/components/ItemCapture/ItemCapture.tsx`
**Lines:** Near line 88 (after useItemCaptureState hook)

Add state for tracking saved item:
```typescript
const [savedItem, setSavedItem] = useState<{id: string; name: string} | null>(null);
```

### Task 4: Modify handleSubmit to transition to whats-next
**File:** `src/components/ItemCapture/ItemCapture.tsx`
**Lines:** 143-224 (handleSubmit function)

Replace `reset()` with state update and step transition:
```typescript
// Emit the record via callback
onComplete(record);

// Store saved item info for WhatsNextStep
setSavedItem({ id: record.id, name: record.title });

// Transition to What's Next screen
goToStep('whats-next');
```

### Task 5: Import WhatsNextStep component
**File:** `src/components/ItemCapture/ItemCapture.tsx`
**Lines:** Near line 29 (imports section)

```typescript
import { WhatsNextStep } from './components/steps/WhatsNextStep';
```

### Task 6: Add WhatsNextStep callback handlers
**File:** `src/components/ItemCapture/ItemCapture.tsx`
**Lines:** After line 337 (after existing handlers)

```typescript
const handleEditInstructions = useCallback(() => {
  if (savedItem) {
    // Navigate to edit view - implementation depends on routing
    // For now, this could be a TODO or call a prop callback
  }
}, [savedItem]);

const handleAddNewInstructions = useCallback(() => {
  // Keep savedItem reference, reset content but maintain item association
  // Reset media, instructions, but potentially keep metadata
  // This requires design decision - for MVP, could just go to content-type
  goToStep('content-type');
}, [goToStep]);

const handleCreateNewItem = useCallback(() => {
  setSavedItem(null);
  reset();
}, [reset]);

const handleDone = useCallback(() => {
  setSavedItem(null);
  reset();
  // Optional: Call a prop callback to navigate to dashboard
  // onDone?.();
}, [reset]);
```

### Task 7: Add WhatsNextStep rendering case
**File:** `src/components/ItemCapture/ItemCapture.tsx`
**Lines:** In renderStep useMemo (around line 510, after 'review' case)

```typescript
case 'whats-next':
  if (!savedItem) {
    // Safety check - shouldn't happen but handle gracefully
    reset();
    return null;
  }
  return (
    <WhatsNextStep
      savedItemId={savedItem.id}
      savedItemName={savedItem.name}
      onEditInstructions={handleEditInstructions}
      onAddNewInstructions={handleAddNewInstructions}
      onCreateNewItem={handleCreateNewItem}
      onDone={handleDone}
    />
  );
```

### Task 8: Update showWizardNav logic
**File:** `src/components/ItemCapture/ItemCapture.tsx`
**Lines:** Around line 548

Update to also exclude whats-next from wizard navigation:
```typescript
const showWizardNav = state.currentStep !== 'review' && state.currentStep !== 'whats-next';
```

### Task 9: Handle progress indicator visibility for whats-next
**File:** `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`

Option A - Check for -1 stage index:
```typescript
const currentIndex = getCurrentStageIndex(currentStep);
if (currentIndex < 0) {
  // Don't render progress indicator for whats-next
  return null;
}
```

Option B - Pass visibility prop from ItemCapture.

---

## Authorized Files and Functions for Modification

### Primary Files

| File Path | Functions/Sections to Modify |
|-----------|------------------------------|
| `src/components/ItemCapture/ItemCapture.tsx` | `handleSubmit`, `renderStep`, imports, new state, new handlers |
| `src/components/ItemCapture/hooks/useItemCaptureState.ts` | `STEP_TRANSITIONS` constant |
| `src/components/ItemCapture/components/shared/ProgressIndicator.tsx` | `STEP_TO_STAGE_INDEX` constant, component render logic |

### Secondary Files (Read-Only Reference)

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/ItemCapture.types.ts` | Reference for WizardStep type (modified in Task 2.2) |
| `src/components/ItemCapture/components/steps/WhatsNextStep.tsx` | Import target (created in Task 2.1) |

---

## Integration Contracts

### WhatsNextStep Props (from Task 2.1)
```typescript
interface WhatsNextStepProps {
  savedItemId: string;
  savedItemName: string;
  onEditInstructions: () => void;
  onAddNewInstructions: () => void;
  onCreateNewItem: () => void;
  onDone: () => void;
  className?: string;
}
```

### State Requirements
- `savedItem: { id: string; name: string } | null` - tracks the just-saved item for WhatsNextStep

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Type error if WizardStep doesn't include 'whats-next' | High | Build fails | Ensure Task 2.2 completes before this task |
| WhatsNextStep component not found | High | Runtime error | Ensure Task 2.1 completes before this task |
| savedItem null when on whats-next step | Low | Crash | Add null check and graceful fallback in render |
| Progress indicator crashes with unknown step | Medium | UI break | Handle -1 or unknown values gracefully |

---

## Testing Considerations

### Unit Tests
- Verify `STEP_TRANSITIONS` includes `'whats-next'` transition from `'review'`
- Verify `STEP_TO_STAGE_INDEX` handles `'whats-next'` without error
- Verify `getCurrentStageIndex('whats-next')` returns -1 or handled value

### Integration Tests
- Complete full item capture flow and verify WhatsNextStep appears
- Verify savedItem state is correctly populated after submission
- Verify each callback handler works correctly:
  - Edit Instructions → appropriate navigation
  - Add New Instructions → content-type step
  - Create New Item → full reset, metadata step
  - Done → reset and dashboard navigation

### Manual Testing
- [ ] Complete item save and verify WhatsNextStep displays
- [ ] Verify progress indicator is NOT visible on WhatsNextStep
- [ ] Test all four action buttons
- [ ] Test on mobile viewport
- [ ] Verify no back/cancel buttons appear

---

## Open Questions

1. **Edit Instructions destination:** Where should "Edit Instructions" navigate? Options:
   - A dedicated edit page (`/dashboard/items/[id]/edit`)
   - An inline edit mode within the wizard
   - The item detail view with edit capabilities

2. **Add New Instructions behavior:** Should this:
   - Keep the saved item reference and go to content-type?
   - Go to a specific "add article" flow for the existing item?
   - This may need database support for multiple articles per item

3. **onDone navigation:** Should the component:
   - Accept a callback prop for dashboard navigation?
   - Use Next.js router directly?
   - Let the parent handle navigation via the existing `onComplete` callback?

---

## References

- **Source Request:** docs/gen_requests.md - REQ-189
- **Implementation Plan:** docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md (Phase 2, Task 2.3)
- **Related Tasks:**
  - Task 2.1: Create WhatsNextStep Component
  - Task 2.2: Add WhatsNextStep to Wizard Types
  - Task 2.4: Ensure No Navigation Controls on WhatsNextStep
- **Key Files:**
  - `src/components/ItemCapture/ItemCapture.tsx`
  - `src/components/ItemCapture/hooks/useItemCaptureState.ts`
  - `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`
  - `src/components/ItemCapture/ItemCapture.types.ts`
