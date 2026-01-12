# Implementation Plan: Dashboard2 Workflow Step Count Fix

**Generated:** 2026-01-12 12:00:00 PST
**Last Modified:** 2026-01-12 12:00:00 PST
**Source PRD:** docs/prd/FAQBNB_Review_2026-01-11_1453.pdf
**Plan ID:** Plan-106
**Supersedes:** Plan-105 (which incorrectly targeted ItemCapture instead of ItemCreationWorkflow)

---

## Overview

This plan addresses the workflow step count issue in the **ItemCreationWorkflow** component located at `/dashboard2/create`. The PDF review (2026-01-11) identified that the workflow shows too many steps (currently 10), when it should show **8 steps** with Save Item being the final numbered step.

**CRITICAL:** This plan specifically targets:
- **Component:** `ItemCreationWorkflow` (NOT ItemCapture)
- **Route:** `/dashboard2/create` (NOT `/dashboard/items/new`)
- **Files:** `src/components/ItemCreationWorkflow/` directory

---

## Problem Statement

### Current State (from browser at /dashboard2/create)
- Step counter shows "Step 1 of 10"
- WORKFLOW_STEPS in constants.ts has 10 entries
- `next-action` and `session-summary` are counted as numbered steps

### PDF Requirement (REQUEST 5)
> - Change step counter to "Step 8 of 8" (not 8 of 10)
> - "Save Item" is the FINAL workflow step
> - "Item Saved!" with QR code = END of workflow
> - "Continue" button leads to post-workflow menu, which is NOT a numbered step

### Required Outcome
- Workflow should show **8 numbered steps**
- `next-action` should be a **post-workflow menu** (NOT numbered)
- `session-summary` should be a **post-workflow screen** (NOT numbered)

---

## Technical Context

### Target Component Structure
```
src/components/ItemCreationWorkflow/
├── ItemCreationWorkflow.tsx           # Main orchestrator
├── ItemCreationWorkflow.types.ts      # Type definitions
├── hooks/
│   └── useWorkflowState.ts            # State machine, STEP_TRANSITIONS
├── utils/
│   ├── constants.ts                   # WORKFLOW_STEPS (currently 10)
│   └── ...
└── components/
    └── steps/
        ├── RoomSelectionStep.tsx
        ├── ItemTypeStep.tsx
        ├── SpecificItemStep.tsx
        ├── PurposeStep.tsx
        ├── ContentTypeStep.tsx
        ├── MediaCaptureStep/
        ├── PreviewSaveStep.tsx         # Step 8 - FINAL numbered step
        ├── NextActionStep.tsx          # Should NOT be numbered
        └── SessionSummaryStep.tsx      # Should NOT be numbered
```

### Current WORKFLOW_STEPS (10 steps - INCORRECT)
```typescript
// src/components/ItemCreationWorkflow/utils/constants.ts
export const WORKFLOW_STEPS = [
  'room-selection',           // 1
  'item-type-selection',      // 2
  'specific-item-selection',  // 3
  'purpose-selection',        // 4
  'content-type-selection',   // 5
  'media-capture',            // 6
  'content-creation',         // 7
  'preview-save',             // 8 ← Should be FINAL numbered step
  'next-action',              // 9 ← Should NOT be numbered
  'session-summary',          // 10 ← Should NOT be numbered
] as const;
```

### Required WORKFLOW_STEPS (8 numbered steps)
```typescript
// Only these 8 steps should be counted in progress indicator
export const NUMBERED_WORKFLOW_STEPS = [
  'room-selection',           // 1
  'item-type-selection',      // 2
  'specific-item-selection',  // 3
  'purpose-selection',        // 4
  'content-type-selection',   // 5
  'media-capture',            // 6
  'content-creation',         // 7
  'preview-save',             // 8 ← FINAL numbered step
] as const;

// These are post-workflow screens (NOT numbered)
export const POST_WORKFLOW_STEPS = [
  'next-action',
  'session-summary',
] as const;

// All steps combined for navigation
export const WORKFLOW_STEPS = [
  ...NUMBERED_WORKFLOW_STEPS,
  ...POST_WORKFLOW_STEPS,
] as const;
```

---

## Architecture Changes

### Step Count Calculation

**Current (INCORRECT):**
```typescript
// Shows "Step X of 10"
const totalSteps = WORKFLOW_STEPS.length; // 10
```

**Required (CORRECT):**
```typescript
// Shows "Step X of 8"
const totalSteps = NUMBERED_WORKFLOW_STEPS.length; // 8

// Hide step indicator for post-workflow steps
const showStepIndicator = !POST_WORKFLOW_STEPS.includes(currentStep);
```

### Progress Bar Calculation

**Current PROGRESS_WEIGHTS:**
```typescript
export const PROGRESS_WEIGHTS: Record<WorkflowStepConst, number> = {
  'room-selection': 10,
  'item-type-selection': 20,
  'specific-item-selection': 30,
  'purpose-selection': 40,
  'content-type-selection': 50,
  'media-capture': 60,
  'content-creation': 65,
  'preview-save': 75,        // Should be 100% (final step)
  'next-action': 88,         // Should not affect progress
  'session-summary': 100,    // Should not affect progress
};
```

**Required PROGRESS_WEIGHTS:**
```typescript
export const PROGRESS_WEIGHTS: Record<WorkflowStepConst, number> = {
  'room-selection': 12,
  'item-type-selection': 25,
  'specific-item-selection': 37,
  'purpose-selection': 50,
  'content-type-selection': 62,
  'media-capture': 75,
  'content-creation': 87,
  'preview-save': 100,       // 100% - FINAL
  'next-action': 100,        // Post-workflow (no change)
  'session-summary': 100,    // Post-workflow (no change)
};
```

---

## Implementation Phases

### Phase 1: Update Constants (REQ-5 Core Fix)

#### Task 1.1: Add NUMBERED_WORKFLOW_STEPS and POST_WORKFLOW_STEPS

**File:** `src/components/ItemCreationWorkflow/utils/constants.ts`

**Changes:**
1. Create `NUMBERED_WORKFLOW_STEPS` array with 8 steps
2. Create `POST_WORKFLOW_STEPS` array with 2 post-workflow screens
3. Update `WORKFLOW_STEPS` to combine both
4. Update `PROGRESS_WEIGHTS` so preview-save = 100%
5. Add helper function `isNumberedStep(step: WorkflowStep): boolean`

**Acceptance Criteria:**
- [ ] `NUMBERED_WORKFLOW_STEPS.length === 8`
- [ ] `POST_WORKFLOW_STEPS` contains 'next-action' and 'session-summary'
- [ ] `PROGRESS_WEIGHTS['preview-save'] === 100`

#### Task 1.2: Update Step Count Display Logic

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Changes:**
1. Import `NUMBERED_WORKFLOW_STEPS`, `POST_WORKFLOW_STEPS`
2. Calculate step number using `NUMBERED_WORKFLOW_STEPS.indexOf(currentStep) + 1`
3. Use `NUMBERED_WORKFLOW_STEPS.length` as total (8)
4. Hide step indicator when `POST_WORKFLOW_STEPS.includes(currentStep)`

**Acceptance Criteria:**
- [ ] Room selection shows "Step 1 of 8"
- [ ] Preview-save shows "Step 8 of 8"
- [ ] Next-action shows NO step indicator
- [ ] Session-summary shows NO step indicator

#### Task 1.3: Update useWorkflowState Hook

**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`

**Changes:**
1. Import new constants
2. Update `getStepNumber()` to use `NUMBERED_WORKFLOW_STEPS`
3. Update `getTotalSteps()` to return 8
4. Add `isPostWorkflowStep()` helper

**Acceptance Criteria:**
- [ ] `getStepNumber('preview-save') === 8`
- [ ] `getTotalSteps() === 8`
- [ ] `isPostWorkflowStep('next-action') === true`

---

### Phase 2: Update UI Components

#### Task 2.1: Update Progress Indicator

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` (or separate ProgressBar component if exists)

**Changes:**
1. Progress bar reaches 100% at preview-save step
2. Progress bar hidden or stays at 100% for post-workflow steps
3. Step label shows "Step X of 8" (not 10)

**Acceptance Criteria:**
- [ ] Progress bar shows 100% on preview-save
- [ ] No "Step 9 of X" or "Step 10 of X" visible

#### Task 2.2: Update NextActionStep to Remove Navigation Controls

**File:** `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`

**Changes (per PDF REQUEST 3):**
1. Remove back arrow / back button
2. Remove Cancel button
3. Ensure no step indicator is displayed
4. Keep only the action menu cards:
   - Edit Instructions
   - Add More Content / Add New Instructions
   - Create New Item
   - Done

**Acceptance Criteria:**
- [ ] No back button visible
- [ ] No cancel button visible
- [ ] No step indicator visible
- [ ] 4 action options present

#### Task 2.3: Update SessionSummaryStep

**File:** `src/components/ItemCreationWorkflow/components/steps/SessionSummaryStep.tsx`

**Changes:**
1. Ensure no step indicator is displayed
2. This is a post-workflow summary, not a numbered step

**Acceptance Criteria:**
- [ ] No step indicator visible
- [ ] Shows session summary content

---

### Phase 3: Update Types

#### Task 3.1: Add Type Helpers

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`

**Changes:**
1. Export `NumberedWorkflowStep` type (subset of WorkflowStep)
2. Export `PostWorkflowStep` type
3. Add JSDoc explaining the distinction

**Acceptance Criteria:**
- [ ] Types compile without errors
- [ ] JSDoc explains numbered vs post-workflow steps

---

### Phase 4: Testing & Verification

#### Task 4.1: Manual Browser Testing

**URL:** http://localhost:3001/dashboard2/create

**Test Cases:**
1. [ ] Step 1 shows "Step 1 of 8" (room-selection)
2. [ ] Step 2 shows "Step 2 of 8" (item-type-selection)
3. [ ] Step 3 shows "Step 3 of 8" (specific-item-selection)
4. [ ] Step 4 shows "Step 4 of 8" (purpose-selection)
5. [ ] Step 5 shows "Step 5 of 8" (content-type-selection)
6. [ ] Step 6 shows "Step 6 of 8" (media-capture)
7. [ ] Step 7 shows "Step 7 of 8" (content-creation)
8. [ ] Step 8 shows "Step 8 of 8" (preview-save)
9. [ ] next-action shows NO step indicator
10. [ ] session-summary shows NO step indicator

#### Task 4.2: Build Verification

**Commands:**
```bash
npm run type-check
npm run build
```

**Acceptance Criteria:**
- [ ] No TypeScript errors
- [ ] Build completes successfully

---

## Files to Modify

| File | Change Type | Purpose |
|------|-------------|---------|
| `src/components/ItemCreationWorkflow/utils/constants.ts` | MODIFY | Add NUMBERED_WORKFLOW_STEPS, POST_WORKFLOW_STEPS, update PROGRESS_WEIGHTS |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | MODIFY | Update step count display logic |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | MODIFY | Update step calculation helpers |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | MODIFY | Add type helpers |
| `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` | MODIFY | Remove back/cancel, hide step indicator |
| `src/components/ItemCreationWorkflow/components/steps/SessionSummaryStep.tsx` | MODIFY | Hide step indicator |

---

## Effort Estimate

| Phase | Description | Estimate |
|-------|-------------|----------|
| Phase 1 | Update Constants & Logic | 2-3 hours |
| Phase 2 | Update UI Components | 1-2 hours |
| Phase 3 | Update Types | 30 min |
| Phase 4 | Testing & Verification | 1 hour |
| **Total** | | **4-6 hours** |

---

## Success Criteria

After implementation:
1. ✅ `/dashboard2/create` shows "Step 1 of 8" on first step
2. ✅ Preview-save step shows "Step 8 of 8"
3. ✅ Progress bar reaches 100% at preview-save
4. ✅ Next-action step has NO step indicator, NO back button, NO cancel button
5. ✅ Session-summary has NO step indicator
6. ✅ Build passes with no TypeScript errors

---

## References

- Source PDF: `docs/prd/FAQBNB_Review_2026-01-11_1453.pdf` (REQUEST 5)
- Previous Plan (wrong target): `docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md`
- Target Component: `src/components/ItemCreationWorkflow/`
- Target Route: `/dashboard2/create`
