# REQ-095: Main Workflow Component with Step Rendering - Implementation Overview

**Generated:** 2026-01-05 17:30:00 UTC
**Last Modified:** 2026-01-05 17:30:00 UTC
**Request Reference:** [REQ-095] Main Workflow Component with Step Rendering
**Implementation Plan Reference:** docs/prd/Plan-093-Item-Creation-Workflow.md (Phase 1, Task 1.3)
**Status:** Ready for Implementation

---

## Executive Summary

This document provides a comprehensive implementation breakdown for the Main Workflow Component (Task 1.3) of the Item Creation Workflow feature. This component is the central orchestrating element that manages step rendering, integrates the state management hook, displays progress via the WorkflowHeader, and handles exit confirmation to prevent accidental data loss.

**Key Deliverables:**
- `ItemCreationWorkflow.tsx` - Main orchestrating component with step rendering
- `WorkflowHeader.tsx` - Progress indicator and navigation header
- `ConfirmExitDialog.tsx` - Exit confirmation modal

---

## Prerequisites

Before implementing Task 1.3, the following must be completed:

| Prerequisite | Status | Notes |
|--------------|--------|-------|
| Task 1.1: Component Scaffold & Types | ✅ Complete | Types in `ItemCreationWorkflow.types.ts`, constants in `utils/constants.ts` |
| Task 1.2: Workflow State Machine | ✅ Complete | `useWorkflowState` hook implemented with reducer pattern |
| Directory Structure | ✅ Complete | `ItemCreationWorkflow/` structure established |

---

## Technical Context

### Existing Stack & Patterns

| Technology | Usage in This Task |
|------------|-------------------|
| React 18+ with `'use client'` | Client component for interactivity |
| TypeScript 5.x (strict mode) | All types from `ItemCreationWorkflow.types.ts` |
| Tailwind CSS 4.x | Styling with Airbnb design tokens |
| Radix UI | Dialog component for exit confirmation |
| Lucide React | Icons for progress indicator |

### Key Patterns to Follow

1. **State Management Pattern** (from `useItemCaptureState.ts`):
   - Use `useReducer` with typed actions
   - Memoize callbacks with `useCallback`
   - Compute derived values with `useMemo`
   - Return structured state object from custom hook

2. **Barrel Exports Pattern** (from `ItemCapture/index.ts`, `ItemManager/index.ts`):
   - Export types first
   - Export hooks
   - Export components last
   - Use named exports with optional default exports

3. **Component Organization** (from ItemCapture):
   - Colocated step components in `components/steps/`
   - Shared UI components in `components/shared/`
   - Clear separation of concerns

---

## Detailed Implementation Tasks

### Task 1.3.1: Create `ItemCreationWorkflow.tsx` Main Component

**Objective:** Create the main orchestrating component that renders steps based on workflow state.

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Implementation Steps:**

1. **Create component shell with TypeScript**
   ```tsx
   'use client';

   import type { ItemCreationWorkflowProps } from './ItemCreationWorkflow.types';
   import { useWorkflowState } from './hooks';
   ```

2. **Integrate `useWorkflowState` hook**
   - Destructure state and actions from hook
   - Access `currentStep`, `canGoBack`, `progressPercent`, `isDirty`
   - Use navigation actions: `nextStep`, `prevStep`, `goToStep`

3. **Implement step rendering logic using switch statement**
   ```tsx
   const renderCurrentStep = () => {
     switch (state.currentStep) {
       case 'room-selection':
         return <RoomSelectionStep />; // Placeholder for Phase 2
       case 'item-type-selection':
         return <ItemTypeStep />;
       // ... other steps
       default:
         return <div>Step: {state.currentStep}</div>;
     }
   };
   ```

4. **Add WorkflowHeader with progress indicator**
   - Pass `currentStepIndex`, `totalSteps`, `progressPercent`
   - Pass `onBack` handler from `prevStep`
   - Pass `canGoBack` for conditional back button display

5. **Implement exit confirmation dialog**
   - Track dialog open state with `useState`
   - Show dialog when `isDirty` and user attempts to exit
   - Wire up `onSessionExit` callback from props

6. **Apply Airbnb design system styling**
   - Use consistent spacing (8px grid)
   - Apply typography tokens
   - Ensure 48px minimum touch targets

**Dependencies:**
- `useWorkflowState` hook (Task 1.2)
- `WorkflowHeader` component (Task 1.3.2)
- `ConfirmExitDialog` component (Task 1.3.3)
- Type definitions from `ItemCreationWorkflow.types.ts`

**Acceptance Criteria:**
- [ ] Component renders without errors
- [ ] Step content changes based on `state.currentStep`
- [ ] WorkflowHeader displays progress indicator
- [ ] Exit confirmation shown when `isDirty` is true
- [ ] All props from `ItemCreationWorkflowProps` are properly wired

---

### Task 1.3.2: Create `WorkflowHeader.tsx` Component

**Objective:** Create a reusable header component showing workflow progress and navigation.

**File:** `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx`

**Implementation Steps:**

1. **Define component props interface**
   ```tsx
   export interface WorkflowHeaderProps {
     /** Current step index (0-based) */
     currentStepIndex: number;
     /** Total number of steps */
     totalSteps: number;
     /** Progress percentage (0-100) */
     progressPercent: number;
     /** Whether back navigation is available */
     canGoBack: boolean;
     /** Called when back button is clicked */
     onBack: () => void;
     /** Called when close/exit button is clicked */
     onExit?: () => void;
     /** Optional CSS class name */
     className?: string;
   }
   ```

2. **Implement progress bar visual**
   - Use `PROGRESS_WEIGHTS` from constants for weighted progress
   - Animated width transition for smooth progress updates
   - Airbnb brand color for active progress

3. **Add back button with conditional rendering**
   - Show only when `canGoBack` is true
   - Use Lucide `ArrowLeft` or `ChevronLeft` icon
   - 48px touch target per PRD requirement

4. **Add step indicator text**
   - Format: "Step X of Y"
   - Use `currentStepIndex + 1` for 1-based display

5. **Add exit/close button**
   - Use Lucide `X` icon
   - Positioned at right side of header
   - Triggers `onExit` callback

**Reference Pattern:** `ItemCapture/components/shared/ProgressIndicator.tsx`

**Acceptance Criteria:**
- [ ] Progress bar accurately reflects `progressPercent`
- [ ] Back button hidden when `canGoBack` is false
- [ ] Step indicator shows correct position
- [ ] Exit button triggers callback
- [ ] All touch targets are 48px minimum

---

### Task 1.3.3: Create `ConfirmExitDialog.tsx` Component

**Objective:** Create a confirmation dialog to prevent accidental data loss during workflow exit.

**File:** `src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx`

**Implementation Steps:**

1. **Define component props interface**
   ```tsx
   export interface ConfirmExitDialogProps {
     /** Whether the dialog is open */
     isOpen: boolean;
     /** Called when dialog should close (cancelled) */
     onClose: () => void;
     /** Called when user confirms exit */
     onConfirmExit: () => void;
     /** Number of items created in session (for messaging) */
     itemCount?: number;
     /** Whether there are unsaved changes to current item */
     hasUnsavedChanges?: boolean;
   }
   ```

2. **Use Radix UI Dialog primitive**
   - Import from `@radix-ui/react-dialog`
   - Follow existing dialog patterns in codebase

3. **Implement dialog content**
   - Warning icon (Lucide `AlertTriangle`)
   - Dynamic message based on `itemCount` and `hasUnsavedChanges`
   - "Cancel" button (secondary style)
   - "Exit Workflow" button (destructive style - Airbnb error color)

4. **Handle keyboard accessibility**
   - Escape key closes dialog (cancel action)
   - Focus trap within dialog
   - Return focus to trigger on close

**Reference Pattern:**
- `ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx`
- `ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`

**Acceptance Criteria:**
- [ ] Dialog opens/closes based on `isOpen` prop
- [ ] Cancel closes dialog without exit
- [ ] Confirm triggers exit callback
- [ ] Keyboard navigation works correctly
- [ ] Visual styling matches Airbnb design system

---

### Task 1.3.4: Update Barrel Exports

**Objective:** Export new components through the barrel file.

**File:** `src/components/ItemCreationWorkflow/index.ts`

**Changes:**

1. **Export main component**
   ```tsx
   export { ItemCreationWorkflow } from './ItemCreationWorkflow';
   ```

2. **Export shared components**
   ```tsx
   export { WorkflowHeader } from './components/shared/WorkflowHeader';
   export type { WorkflowHeaderProps } from './components/shared/WorkflowHeader';

   export { ConfirmExitDialog } from './components/shared/ConfirmExitDialog';
   export type { ConfirmExitDialogProps } from './components/shared/ConfirmExitDialog';
   ```

3. **Update components barrel** (`components/index.ts`)
4. **Update shared barrel** (`components/shared/index.ts`)

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Main orchestrating component |
| `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx` | Progress header component |
| `src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` | Exit confirmation dialog |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemCreationWorkflow/index.ts` | Add exports for new components |
| `src/components/ItemCreationWorkflow/components/index.ts` | Add exports for WorkflowHeader, ConfirmExitDialog |
| `src/components/ItemCreationWorkflow/components/shared/index.ts` | Add exports for shared components |

### Files to Read (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | State hook integration |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Type definitions |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | Constants (PROGRESS_WEIGHTS, etc.) |
| `src/components/ItemCapture/components/shared/ProgressIndicator.tsx` | Reference pattern |
| `src/components/ItemCapture/ItemCapture.tsx` | Reference for main component structure |
| `src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | Dialog pattern reference |

---

## Component Hierarchy

```
ItemCreationWorkflow
├── WorkflowHeader
│   ├── BackButton (conditional)
│   ├── ProgressBar
│   ├── StepIndicator ("Step X of Y")
│   └── ExitButton
├── StepContainer
│   └── [Current Step Component]
│       ├── RoomSelectionStep (Phase 2)
│       ├── ItemTypeStep (Phase 2)
│       ├── SpecificItemStep (Phase 2)
│       ├── ContentSourceStep (Phase 3)
│       ├── ContentTypeStep (Phase 3)
│       ├── ContentCreationStep (Phase 4)
│       ├── PreviewSaveStep (Phase 4)
│       ├── NextActionStep (Phase 5)
│       └── SessionSummaryStep (Phase 6)
└── ConfirmExitDialog (conditional)
```

---

## Integration Points

### With useWorkflowState Hook (Task 1.2)

```tsx
const {
  state,           // Current workflow state
  nextStep,        // Navigation: go to next step
  prevStep,        // Navigation: go to previous step
  goToStep,        // Navigation: jump to specific step
  canGoBack,       // Computed: whether back is available
  canGoNext,       // Computed: whether next is available
  progressPercent, // Computed: progress percentage
  currentStepIndex,// Computed: current step index
  totalSteps,      // Computed: total step count
  itemCount,       // Computed: items created in session
  reset,           // Reset entire workflow
} = useWorkflowState();
```

### With Parent Component (Consumer)

```tsx
<ItemCreationWorkflow
  onSessionComplete={(session) => {
    // Handle successful completion
  }}
  onSessionExit={(partial) => {
    // Handle early exit
  }}
  onGeneratePDF={async (items, scope) => {
    // Generate PDF blob
  }}
  onPrintDirect={async (items, scope) => {
    // Trigger print
  }}
  onFetchExistingItems={async () => {
    // Fetch existing items
  }}
  onSaveItem={async (item) => {
    // Persist item to database
  }}
  config={{
    maxItemsPerSession: 50,
    enableUrlPreview: true,
  }}
/>
```

---

## UI/UX Requirements

### Airbnb Design System Compliance

| Element | Specification |
|---------|--------------|
| Progress bar color | `#FF385C` (brand primary) |
| Progress bar height | `4px` |
| Header background | `#FFFFFF` |
| Shadow | `0 1px 3px rgba(0,0,0,0.08)` |
| Border radius | `8px` (buttons), `0` (full-width elements) |
| Touch targets | `48px × 48px` minimum |
| Font family | System font stack (San Francisco, Segoe UI, Roboto) |
| Primary text color | `#222222` |
| Secondary text color | `#717171` |
| Destructive action color | `#FF5A5F` |

### Animation & Transitions

| Element | Animation |
|---------|-----------|
| Progress bar | `transition: width 300ms ease` |
| Step transitions | Fade or slide (TBD based on testing) |
| Dialog | Radix UI default animation |

---

## Testing Considerations

### Unit Tests

- [ ] `ItemCreationWorkflow` renders without errors
- [ ] Step rendering switches correctly based on `currentStep`
- [ ] WorkflowHeader displays correct step count
- [ ] ConfirmExitDialog opens when triggered
- [ ] Exit confirmation flow works correctly

### Integration Tests

- [ ] Navigation between placeholder steps works
- [ ] Back button navigates to previous step
- [ ] Exit triggers `onSessionExit` callback
- [ ] State persists correctly across renders

---

## Dependencies

### NPM Packages (Already Installed)

| Package | Version | Usage |
|---------|---------|-------|
| `@radix-ui/react-dialog` | Existing | Exit confirmation dialog |
| `lucide-react` | Existing | Icons (ArrowLeft, X, AlertTriangle) |

### Internal Dependencies

| Module | Usage |
|--------|-------|
| `useWorkflowState` | State management hook |
| `WorkflowStep` type | Step rendering switch |
| `PROGRESS_WEIGHTS` | Progress calculation |
| `WORKFLOW_STEPS` | Step enumeration |

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Step components not yet implemented | High | Low | Use placeholder components with step name display |
| State hook integration issues | Low | Medium | Thoroughly test hook return values |
| Exit confirmation UX confusion | Medium | Medium | Clear messaging and button labeling |
| Progress bar visual bugs | Low | Low | Test across browsers |

---

## Success Criteria

1. ✅ Main component renders and responds to state changes
2. ✅ WorkflowHeader shows accurate progress
3. ✅ Step content updates when `currentStep` changes
4. ✅ Back navigation works when history exists
5. ✅ Exit confirmation prevents accidental data loss
6. ✅ All components properly exported via barrel files
7. ✅ Components follow established codebase patterns
8. ✅ TypeScript compiles without errors
9. ✅ Styling follows Airbnb design system

---

## Implementation Order

1. **WorkflowHeader.tsx** - Create progress indicator component
2. **ConfirmExitDialog.tsx** - Create exit confirmation dialog
3. **Update barrel exports** - Export shared components
4. **ItemCreationWorkflow.tsx** - Create main component integrating all parts
5. **Update main barrel** - Export main component
6. **Manual testing** - Verify step rendering and navigation

---

## References

- [Plan-093-Item-Creation-Workflow.md](/docs/prd/Plan-093-Item-Creation-Workflow.md) - Full implementation plan
- [PRD_Item_Creation_Workflow.md](/docs/prd/PRD_Item_Creation_Workflow.md) - Product requirements
- [airbnb_designsystem.md](/docs/prd/airbnb_designsystem.md) - Design system reference
- [ItemCapture Implementation](/src/components/ItemCapture/) - Pattern reference
- [ItemManager Implementation](/src/components/ItemManager/) - Pattern reference

---

*Implementation breakdown generated on 2026-01-05 for REQ-095: Main Workflow Component with Step Rendering*
