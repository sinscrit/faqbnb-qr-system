# REQ-095: Main Workflow Component with Step Rendering - Detailed Task Breakdown

**Generated:** 2026-01-05 18:45:00 UTC
**Last Modified:** 2026-01-05 21:35:00 UTC
**Request Reference:** [REQ-095] Main Workflow Component with Step Rendering
**Overview Document:** docs/REQ-095-main-workflow-component-overview.md
**Implementation Plan Reference:** docs/prd/Plan-093-Item-Creation-Workflow.md (Phase 1, Task 1.3)
**Status:** COMPLETED

---

## Implementation Summary

All 17 tasks have been successfully implemented:

### Files Created:
- `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` - Main orchestrating component
- `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx` - Progress header component
- `src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` - Exit confirmation dialog
- `src/components/ItemCreationWorkflow/components/shared/__tests__/WorkflowHeader.test.tsx` - Unit tests
- `src/components/ItemCreationWorkflow/components/shared/__tests__/ConfirmExitDialog.test.tsx` - Unit tests
- `src/components/ItemCreationWorkflow/__tests__/ItemCreationWorkflow.test.tsx` - Integration tests
- `src/app/test/item-creation-workflow/page.tsx` - Test page for manual verification

### Files Modified:
- `src/components/ItemCreationWorkflow/index.ts` - Added exports for new components
- `src/components/ItemCreationWorkflow/components/shared/index.ts` - Added exports for WorkflowHeader, ConfirmExitDialog

### Key Features Implemented:
- WorkflowHeader with progress bar and navigation controls
- ConfirmExitDialog with contextual messaging
- Step rendering with placeholder components
- Navigation test buttons for testing step transitions
- Proper TypeScript types and exports
- Accessibility support (ARIA attributes, keyboard navigation)
- Airbnb design system styling

---

## Document Purpose

This document breaks down the implementation tasks from the REQ-095 overview document into granular, actionable tasks that an AI coding agent or junior developer can execute step-by-step. Each task is designed to be <= 1 story point (a few hours of focused work).

---

## Prerequisites Verification

Before starting implementation, verify these prerequisites are met:

- [x] Task 1.1 (REQ-093): Component Scaffold & Types - `ItemCreationWorkflow.types.ts` exists
- [x] Task 1.2 (REQ-094): Workflow State Machine - `useWorkflowState.ts` hook implemented
- [x] Directory structure established: `src/components/ItemCreationWorkflow/`
- [x] Constants file ready: `utils/constants.ts` with `PROGRESS_WEIGHTS`, `WORKFLOW_STEPS`
- [x] Barrel exports scaffolded: `index.ts`, `components/index.ts`, `components/shared/index.ts`

---

## Authorized Files

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
| `src/components/ItemCreationWorkflow/components/shared/index.ts` | Add exports for WorkflowHeader, ConfirmExitDialog |

### Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | State hook interface |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Type definitions |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | PROGRESS_WEIGHTS, WORKFLOW_STEPS |
| `src/components/ItemCapture/components/shared/ProgressIndicator.tsx` | Reference pattern for progress bar |
| `src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | Dialog pattern reference |

---

## Task Breakdown

### Task 1: Create WorkflowHeader Component Shell (0.5 SP)

**File:** `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx`

**Objective:** Create the basic component structure with TypeScript props interface.

**Implementation Steps:**

1. Create the file at `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx`

2. Add the `'use client'` directive and JSDoc header:
   ```tsx
   'use client';

   /**
    * WorkflowHeader Component
    *
    * Displays workflow progress and navigation controls.
    * Shows progress bar, step indicator, back button, and exit button.
    *
    * @module ItemCreationWorkflow/components/shared/WorkflowHeader
    * @see docs/REQ-095-main-workflow-component-overview.md
    * @lastModified 2026-01-05
    */
   ```

3. Add imports:
   ```tsx
   import { ArrowLeft, X } from 'lucide-react';
   import { cn } from '@/lib/utils';
   ```

4. Define the `WorkflowHeaderProps` interface:
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

5. Create the component function with placeholder return:
   ```tsx
   export function WorkflowHeader({
     currentStepIndex,
     totalSteps,
     progressPercent,
     canGoBack,
     onBack,
     onExit,
     className,
   }: WorkflowHeaderProps) {
     return (
       <header className={cn("bg-white", className)}>
         {/* TODO: Implement header content */}
       </header>
     );
   }

   export default WorkflowHeader;
   ```

**Verification:**
- [ ] File compiles without TypeScript errors
- [ ] Props interface is correctly exported
- [ ] Component renders an empty header element

---

### Task 2: Implement WorkflowHeader Progress Bar (0.5 SP)

**File:** `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx`

**Objective:** Add the visual progress bar with Airbnb brand styling.

**Implementation Steps:**

1. Inside the header element, add the progress bar container:
   ```tsx
   {/* Progress bar */}
   <div
     className="w-full h-1 bg-gray-200"
     role="progressbar"
     aria-valuenow={progressPercent}
     aria-valuemin={0}
     aria-valuemax={100}
     aria-label={`Step ${currentStepIndex + 1} of ${totalSteps}`}
   >
     <div
       className="h-full transition-all duration-300 ease-out"
       style={{
         width: `${progressPercent}%`,
         backgroundColor: '#FF385C', // Airbnb brand primary
       }}
     />
   </div>
   ```

2. Apply shadow styling to header container:
   ```tsx
   <header
     className={cn(
       "bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]",
       className
     )}
   >
   ```

**Reference Pattern:** See `ItemCapture/components/shared/ProgressIndicator.tsx:112-133`

**Verification:**
- [ ] Progress bar width matches `progressPercent` value
- [ ] Progress bar color is Airbnb brand pink (#FF385C)
- [ ] Width transitions smoothly when progressPercent changes
- [ ] ARIA attributes are correct for accessibility

---

### Task 3: Implement WorkflowHeader Navigation Controls (0.5 SP)

**File:** `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx`

**Objective:** Add back button, step indicator, and exit button with proper touch targets.

**Implementation Steps:**

1. Add a navigation row below the progress bar:
   ```tsx
   {/* Navigation controls */}
   <div className="flex items-center justify-between px-4 py-3">
     {/* Back button */}
     <div className="w-12">
       {canGoBack && (
         <button
           type="button"
           onClick={onBack}
           className={cn(
             "flex items-center justify-center w-12 h-12",
             "rounded-lg text-gray-700",
             "hover:bg-gray-100 active:bg-gray-200",
             "transition-colors duration-150",
             "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF385C] focus-visible:ring-offset-2"
           )}
           aria-label="Go back to previous step"
         >
           <ArrowLeft className="w-6 h-6" />
         </button>
       )}
     </div>

     {/* Step indicator */}
     <div className="text-sm font-medium text-gray-700">
       Step {currentStepIndex + 1} of {totalSteps}
     </div>

     {/* Exit button */}
     <div className="w-12">
       {onExit && (
         <button
           type="button"
           onClick={onExit}
           className={cn(
             "flex items-center justify-center w-12 h-12",
             "rounded-lg text-gray-700",
             "hover:bg-gray-100 active:bg-gray-200",
             "transition-colors duration-150",
             "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF385C] focus-visible:ring-offset-2"
           )}
           aria-label="Exit workflow"
         >
           <X className="w-6 h-6" />
         </button>
       )}
     </div>
   </div>
   ```

2. Ensure the empty div placeholders maintain layout when buttons are hidden

**UI Requirements:**
- Touch targets must be 48x48px minimum (w-12 h-12 = 48px)
- Back button only visible when `canGoBack` is true
- Exit button only visible when `onExit` is provided

**Verification:**
- [ ] Back button hidden when `canGoBack` is false
- [ ] Back button appears when `canGoBack` is true
- [ ] Exit button hidden when `onExit` is undefined
- [ ] Step indicator shows correct "Step X of Y" format
- [ ] Touch targets are exactly 48x48 pixels
- [ ] Focus states are visible on keyboard navigation

---

### Task 4: Create ConfirmExitDialog Component Shell (0.5 SP)

**File:** `src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx`

**Objective:** Create the basic dialog component structure with props interface.

**Implementation Steps:**

1. Create the file at `src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx`

2. Add the `'use client'` directive and JSDoc header:
   ```tsx
   'use client';

   /**
    * ConfirmExitDialog Component
    *
    * Confirmation dialog to prevent accidental data loss when exiting the workflow.
    * Shows warning with session context and confirm/cancel actions.
    *
    * @module ItemCreationWorkflow/components/shared/ConfirmExitDialog
    * @see docs/REQ-095-main-workflow-component-overview.md
    * @lastModified 2026-01-05
    */
   ```

3. Add imports:
   ```tsx
   import { AlertTriangle } from 'lucide-react';
   import { cn } from '@/lib/utils';
   ```

4. Define the `ConfirmExitDialogProps` interface:
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
     /** Optional CSS class name */
     className?: string;
   }
   ```

5. Create the component function with conditional render:
   ```tsx
   export function ConfirmExitDialog({
     isOpen,
     onClose,
     onConfirmExit,
     itemCount = 0,
     hasUnsavedChanges = false,
     className,
   }: ConfirmExitDialogProps) {
     if (!isOpen) {
       return null;
     }

     return (
       <div className="fixed inset-0 z-50">
         {/* TODO: Implement dialog content */}
       </div>
     );
   }

   export default ConfirmExitDialog;
   ```

**Reference Pattern:** See `ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`

**Verification:**
- [ ] File compiles without TypeScript errors
- [ ] Component returns null when `isOpen` is false
- [ ] Props interface is correctly exported

---

### Task 5: Implement ConfirmExitDialog Overlay and Container (0.5 SP)

**File:** `src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx`

**Objective:** Add the modal overlay and centered dialog container.

**Implementation Steps:**

1. Add helper function for generating message:
   ```tsx
   function getExitMessage(itemCount: number, hasUnsavedChanges: boolean): string {
     if (hasUnsavedChanges && itemCount > 0) {
       return `You have unsaved changes and ${itemCount} item${itemCount !== 1 ? 's' : ''} in this session. Are you sure you want to exit?`;
     }
     if (hasUnsavedChanges) {
       return 'You have unsaved changes. Are you sure you want to exit?';
     }
     if (itemCount > 0) {
       return `You have created ${itemCount} item${itemCount !== 1 ? 's' : ''} in this session. Are you sure you want to exit?`;
     }
     return 'Are you sure you want to exit the workflow?';
   }
   ```

2. Update the return statement with overlay and container:
   ```tsx
   const handleBackdropClick = (e: React.MouseEvent) => {
     if (e.target === e.currentTarget) {
       onClose();
     }
   };

   const handleKeyDown = (e: React.KeyboardEvent) => {
     if (e.key === 'Escape') {
       e.preventDefault();
       onClose();
     }
   };

   return (
     <div
       className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
       onClick={handleBackdropClick}
       onKeyDown={handleKeyDown}
       role="alertdialog"
       aria-modal="true"
       aria-labelledby="exit-dialog-title"
       aria-describedby="exit-dialog-description"
     >
       <div
         className={cn(
           "bg-white rounded-lg shadow-xl max-w-md w-full mx-4",
           "animate-in fade-in zoom-in-95 duration-200",
           className
         )}
         onClick={(e) => e.stopPropagation()}
       >
         {/* TODO: Add dialog content */}
       </div>
     </div>
   );
   ```

**Verification:**
- [ ] Clicking backdrop calls `onClose`
- [ ] Pressing Escape key calls `onClose`
- [ ] Dialog is centered on screen
- [ ] Dialog has proper border radius and shadow

---

### Task 6: Implement ConfirmExitDialog Content and Buttons (0.5 SP)

**File:** `src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx`

**Objective:** Add the dialog content including warning icon, message, and action buttons.

**Implementation Steps:**

1. Replace the TODO comment inside the dialog container with:
   ```tsx
   {/* Header with warning icon */}
   <div className="flex items-start gap-4 p-6 pb-4">
     <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-amber-100">
       <AlertTriangle className="w-6 h-6 text-amber-600" aria-hidden="true" />
     </div>
     <div className="flex-1">
       <h3
         id="exit-dialog-title"
         className="text-lg font-semibold text-[#222222]"
       >
         Exit Workflow?
       </h3>
       <p
         id="exit-dialog-description"
         className="mt-2 text-sm text-[#717171]"
       >
         {getExitMessage(itemCount, hasUnsavedChanges)}
       </p>
     </div>
   </div>

   {/* Actions */}
   <div className="flex gap-3 p-6 pt-4 border-t border-gray-100">
     <button
       type="button"
       onClick={onClose}
       className={cn(
         "flex-1 px-4 py-2.5 text-sm font-medium rounded-lg",
         "text-gray-700 bg-gray-100",
         "hover:bg-gray-200 active:bg-gray-300",
         "transition-colors duration-150",
         "focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
       )}
     >
       Cancel
     </button>
     <button
       type="button"
       onClick={onConfirmExit}
       className={cn(
         "flex-1 px-4 py-2.5 text-sm font-medium rounded-lg",
         "text-white",
         "hover:opacity-90 active:opacity-80",
         "transition-opacity duration-150",
         "focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
       )}
       style={{ backgroundColor: '#FF5A5F' }} // Airbnb destructive color
     >
       Exit Workflow
     </button>
   </div>
   ```

**UI Requirements:**
- Warning icon uses amber color (not red) for exit confirmation
- "Exit Workflow" button uses Airbnb error/destructive color (#FF5A5F)
- Text colors follow Airbnb design system (#222222 primary, #717171 secondary)

**Verification:**
- [ ] Warning icon displays in amber color
- [ ] Title and message render correctly
- [ ] Cancel button closes dialog
- [ ] "Exit Workflow" button triggers `onConfirmExit`
- [ ] Message changes based on `itemCount` and `hasUnsavedChanges`

---

### Task 7: Update Shared Components Barrel Export (0.25 SP)

**File:** `src/components/ItemCreationWorkflow/components/shared/index.ts`

**Objective:** Export WorkflowHeader and ConfirmExitDialog from the shared barrel file.

**Implementation Steps:**

1. Open `src/components/ItemCreationWorkflow/components/shared/index.ts`

2. Uncomment and update the exports for Task 1.3 components:
   ```tsx
   // =============================================================================
   // Layout Components (Phase 1)
   // =============================================================================

   // Task 1.3: WorkflowHeader
   export { WorkflowHeader } from './WorkflowHeader';
   export type { WorkflowHeaderProps } from './WorkflowHeader';

   // Task 1.3: ConfirmExitDialog
   export { ConfirmExitDialog } from './ConfirmExitDialog';
   export type { ConfirmExitDialogProps } from './ConfirmExitDialog';
   ```

3. Update the `@lastModified` date in the JSDoc header

**Verification:**
- [ ] Imports from `./components/shared` resolve correctly
- [ ] Both component and type exports are available
- [ ] No circular dependency warnings

---

### Task 8: Create ItemCreationWorkflow Main Component Shell (0.5 SP)

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Objective:** Create the main component structure with props integration.

**Implementation Steps:**

1. Create the file at `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

2. Add the `'use client'` directive and JSDoc header:
   ```tsx
   'use client';

   /**
    * ItemCreationWorkflow Component
    *
    * Main orchestrating component for the multi-step item creation workflow.
    * Manages step rendering, integrates state management, and handles navigation.
    *
    * @module ItemCreationWorkflow
    * @see docs/REQ-095-main-workflow-component-overview.md
    * @lastModified 2026-01-05
    */
   ```

3. Add imports:
   ```tsx
   import { useState, useCallback } from 'react';
   import { cn } from '@/lib/utils';
   import type { ItemCreationWorkflowProps } from './ItemCreationWorkflow.types';
   import { useWorkflowState } from './hooks';
   import { WorkflowHeader, ConfirmExitDialog } from './components/shared';
   ```

4. Create the component function:
   ```tsx
   export function ItemCreationWorkflow({
     onSessionComplete,
     onSessionExit,
     onGeneratePDF,
     onPrintDirect,
     onFetchExistingItems,
     onSaveItem,
     initialSession,
     config,
     className,
   }: ItemCreationWorkflowProps) {
     // State management hook
     const {
       state,
       nextStep,
       prevStep,
       goToStep,
       canGoBack,
       canGoNext,
       progressPercent,
       currentStepIndex,
       totalSteps,
       itemCount,
       reset,
     } = useWorkflowState();

     // Exit confirmation dialog state
     const [showExitDialog, setShowExitDialog] = useState(false);

     return (
       <div className={cn("flex flex-col min-h-screen bg-white", className)}>
         {/* TODO: Add header and content */}
       </div>
     );
   }

   export default ItemCreationWorkflow;
   ```

**Verification:**
- [ ] File compiles without TypeScript errors
- [ ] All props from `ItemCreationWorkflowProps` are destructured
- [ ] `useWorkflowState` hook is properly integrated
- [ ] Component renders a container div

---

### Task 9: Integrate WorkflowHeader into Main Component (0.5 SP)

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Objective:** Add WorkflowHeader with proper prop binding.

**Implementation Steps:**

1. Add exit handler callback:
   ```tsx
   // Handle exit button click
   const handleExitClick = useCallback(() => {
     if (state.isDirty || itemCount > 0) {
       setShowExitDialog(true);
     } else {
       // No unsaved work, exit immediately
       onSessionExit({
         id: state.session.id,
         startedAt: state.session.startedAt,
         currentStep: state.currentStep,
         items: state.session.items,
         exitedAt: new Date(),
       });
     }
   }, [state.isDirty, state.session, state.currentStep, itemCount, onSessionExit]);
   ```

2. Add the WorkflowHeader inside the container:
   ```tsx
   return (
     <div className={cn("flex flex-col min-h-screen bg-white", className)}>
       <WorkflowHeader
         currentStepIndex={currentStepIndex}
         totalSteps={totalSteps}
         progressPercent={progressPercent}
         canGoBack={canGoBack}
         onBack={prevStep}
         onExit={handleExitClick}
       />

       {/* Main content area */}
       <main className="flex-1 flex flex-col">
         {/* TODO: Add step rendering */}
       </main>
     </div>
   );
   ```

**Verification:**
- [ ] WorkflowHeader receives correct prop values
- [ ] Back button calls `prevStep` when clicked
- [ ] Exit button triggers exit confirmation logic
- [ ] Progress bar reflects current step progress

---

### Task 10: Implement Step Rendering Logic (0.5 SP)

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Objective:** Add switch statement for rendering different step placeholders.

**Implementation Steps:**

1. Add a helper function for step rendering:
   ```tsx
   // Step placeholder component
   const StepPlaceholder = ({ step }: { step: string }) => (
     <div className="flex flex-col items-center justify-center flex-1 p-8">
       <div className="text-center">
         <h2 className="text-2xl font-semibold text-[#222222] mb-2">
           {step.split('-').map(word =>
             word.charAt(0).toUpperCase() + word.slice(1)
           ).join(' ')}
         </h2>
         <p className="text-[#717171]">
           Step component placeholder - Implementation coming in later phases
         </p>
       </div>
     </div>
   );

   // Render current step content
   const renderCurrentStep = useCallback(() => {
     switch (state.currentStep) {
       case 'room-selection':
         return <StepPlaceholder step="room-selection" />;
       case 'item-type-selection':
         return <StepPlaceholder step="item-type-selection" />;
       case 'specific-item-selection':
         return <StepPlaceholder step="specific-item-selection" />;
       case 'content-source-selection':
         return <StepPlaceholder step="content-source-selection" />;
       case 'content-type-selection':
         return <StepPlaceholder step="content-type-selection" />;
       case 'content-creation':
         return <StepPlaceholder step="content-creation" />;
       case 'preview-save':
         return <StepPlaceholder step="preview-save" />;
       case 'next-action':
         return <StepPlaceholder step="next-action" />;
       case 'session-summary':
         return <StepPlaceholder step="session-summary" />;
       default:
         return <StepPlaceholder step={state.currentStep} />;
     }
   }, [state.currentStep]);
   ```

2. Update the main content area:
   ```tsx
   {/* Main content area */}
   <main className="flex-1 flex flex-col">
     {renderCurrentStep()}
   </main>
   ```

**Verification:**
- [ ] Each workflow step renders its placeholder
- [ ] Step name is displayed in human-readable format
- [ ] Content changes when `state.currentStep` changes
- [ ] No console errors during step transitions

---

### Task 11: Integrate ConfirmExitDialog (0.5 SP)

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Objective:** Add the exit confirmation dialog with proper state management.

**Implementation Steps:**

1. Add confirm exit handler:
   ```tsx
   // Handle confirmed exit
   const handleConfirmExit = useCallback(() => {
     setShowExitDialog(false);
     onSessionExit({
       id: state.session.id,
       startedAt: state.session.startedAt,
       currentStep: state.currentStep,
       items: state.session.items,
       exitedAt: new Date(),
     });
   }, [state.session, state.currentStep, onSessionExit]);

   // Handle cancel exit
   const handleCancelExit = useCallback(() => {
     setShowExitDialog(false);
   }, []);
   ```

2. Add the ConfirmExitDialog after the main element:
   ```tsx
   return (
     <div className={cn("flex flex-col min-h-screen bg-white", className)}>
       <WorkflowHeader
         // ... existing props
       />

       <main className="flex-1 flex flex-col">
         {renderCurrentStep()}
       </main>

       {/* Exit confirmation dialog */}
       <ConfirmExitDialog
         isOpen={showExitDialog}
         onClose={handleCancelExit}
         onConfirmExit={handleConfirmExit}
         itemCount={itemCount}
         hasUnsavedChanges={state.isDirty}
       />
     </div>
   );
   ```

**Verification:**
- [ ] Dialog opens when exit clicked with unsaved work
- [ ] Dialog displays correct item count
- [ ] Cancel closes dialog without exiting
- [ ] Confirm triggers `onSessionExit` callback
- [ ] Dialog receives correct `hasUnsavedChanges` value

---

### Task 12: Update Main Barrel Export (0.25 SP)

**File:** `src/components/ItemCreationWorkflow/index.ts`

**Objective:** Export the main ItemCreationWorkflow component.

**Implementation Steps:**

1. Open `src/components/ItemCreationWorkflow/index.ts`

2. Uncomment the main component export and add new shared component exports:
   ```tsx
   // =============================================================================
   // Components Export (placeholder for future tasks)
   // =============================================================================

   // Task 1.3: Main component
   export { ItemCreationWorkflow } from './ItemCreationWorkflow';

   // Task 1.3: WorkflowHeader
   export { WorkflowHeader } from './components/shared/WorkflowHeader';
   export type { WorkflowHeaderProps } from './components/shared/WorkflowHeader';

   // Task 1.3: ConfirmExitDialog
   export { ConfirmExitDialog } from './components/shared/ConfirmExitDialog';
   export type { ConfirmExitDialogProps } from './components/shared/ConfirmExitDialog';
   ```

3. Update the `@lastModified` date in the JSDoc header

**Verification:**
- [ ] `ItemCreationWorkflow` can be imported from `@/components/ItemCreationWorkflow`
- [ ] `WorkflowHeader` and `WorkflowHeaderProps` exports work
- [ ] `ConfirmExitDialog` and `ConfirmExitDialogProps` exports work
- [ ] No TypeScript errors in barrel file

---

### Task 13: Add Basic Navigation Test Actions (0.5 SP)

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Objective:** Add temporary navigation buttons for testing step transitions.

**Implementation Steps:**

1. Update the StepPlaceholder component to include navigation buttons:
   ```tsx
   const StepPlaceholder = ({
     step,
     onNext,
     canNext
   }: {
     step: string;
     onNext?: () => void;
     canNext?: boolean;
   }) => (
     <div className="flex flex-col items-center justify-center flex-1 p-8">
       <div className="text-center">
         <h2 className="text-2xl font-semibold text-[#222222] mb-2">
           {step.split('-').map(word =>
             word.charAt(0).toUpperCase() + word.slice(1)
           ).join(' ')}
         </h2>
         <p className="text-[#717171] mb-8">
           Step component placeholder - Implementation coming in later phases
         </p>

         {/* Temporary navigation for testing */}
         {onNext && (
           <button
             type="button"
             onClick={onNext}
             disabled={!canNext}
             className={cn(
               "px-6 py-3 rounded-lg font-medium text-white",
               "transition-colors duration-150",
               canNext
                 ? "bg-[#FF385C] hover:bg-[#E31C5F]"
                 : "bg-gray-300 cursor-not-allowed"
             )}
           >
             Continue (Test)
           </button>
         )}
       </div>
     </div>
   );
   ```

2. Update the renderCurrentStep to pass navigation props:
   ```tsx
   const renderCurrentStep = useCallback(() => {
     const commonProps = {
       onNext: nextStep,
       canNext: canGoNext,
     };

     switch (state.currentStep) {
       case 'room-selection':
         return <StepPlaceholder step="room-selection" {...commonProps} />;
       // ... repeat for all other steps
       case 'session-summary':
         return <StepPlaceholder step="session-summary" />;
       default:
         return <StepPlaceholder step={state.currentStep} {...commonProps} />;
     }
   }, [state.currentStep, nextStep, canGoNext]);
   ```

**Note:** These test buttons will be removed when actual step components are implemented in Phase 2+.

**Verification:**
- [ ] "Continue (Test)" button appears on each step (except session-summary)
- [ ] Button is disabled when `canGoNext` is false
- [ ] Clicking button advances to next step
- [ ] Back button returns to previous step

---

### Task 14: Unit Test for WorkflowHeader (0.5 SP)

**File:** `src/components/ItemCreationWorkflow/components/shared/__tests__/WorkflowHeader.test.ts`

**Objective:** Create unit tests for the WorkflowHeader component.

**Implementation Steps:**

1. Create test file directory if needed

2. Create the test file with basic tests:
   ```tsx
   /**
    * WorkflowHeader Component Tests
    *
    * @module ItemCreationWorkflow/components/shared/__tests__/WorkflowHeader.test
    * @lastModified 2026-01-05
    */

   import { render, screen, fireEvent } from '@testing-library/react';
   import { WorkflowHeader } from '../WorkflowHeader';

   describe('WorkflowHeader', () => {
     const defaultProps = {
       currentStepIndex: 2,
       totalSteps: 9,
       progressPercent: 30,
       canGoBack: true,
       onBack: jest.fn(),
       onExit: jest.fn(),
     };

     beforeEach(() => {
       jest.clearAllMocks();
     });

     it('renders step indicator correctly', () => {
       render(<WorkflowHeader {...defaultProps} />);
       expect(screen.getByText('Step 3 of 9')).toBeInTheDocument();
     });

     it('shows back button when canGoBack is true', () => {
       render(<WorkflowHeader {...defaultProps} />);
       expect(screen.getByLabelText('Go back to previous step')).toBeInTheDocument();
     });

     it('hides back button when canGoBack is false', () => {
       render(<WorkflowHeader {...defaultProps} canGoBack={false} />);
       expect(screen.queryByLabelText('Go back to previous step')).not.toBeInTheDocument();
     });

     it('calls onBack when back button clicked', () => {
       render(<WorkflowHeader {...defaultProps} />);
       fireEvent.click(screen.getByLabelText('Go back to previous step'));
       expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
     });

     it('calls onExit when exit button clicked', () => {
       render(<WorkflowHeader {...defaultProps} />);
       fireEvent.click(screen.getByLabelText('Exit workflow'));
       expect(defaultProps.onExit).toHaveBeenCalledTimes(1);
     });

     it('renders progress bar with correct aria attributes', () => {
       render(<WorkflowHeader {...defaultProps} />);
       const progressBar = screen.getByRole('progressbar');
       expect(progressBar).toHaveAttribute('aria-valuenow', '30');
       expect(progressBar).toHaveAttribute('aria-valuemin', '0');
       expect(progressBar).toHaveAttribute('aria-valuemax', '100');
     });
   });
   ```

**Verification:**
- [ ] All tests pass
- [ ] Back button visibility tests pass
- [ ] Click handler tests pass
- [ ] Progress bar accessibility tests pass

---

### Task 15: Unit Test for ConfirmExitDialog (0.5 SP)

**File:** `src/components/ItemCreationWorkflow/components/shared/__tests__/ConfirmExitDialog.test.ts`

**Objective:** Create unit tests for the ConfirmExitDialog component.

**Implementation Steps:**

1. Create the test file:
   ```tsx
   /**
    * ConfirmExitDialog Component Tests
    *
    * @module ItemCreationWorkflow/components/shared/__tests__/ConfirmExitDialog.test
    * @lastModified 2026-01-05
    */

   import { render, screen, fireEvent } from '@testing-library/react';
   import { ConfirmExitDialog } from '../ConfirmExitDialog';

   describe('ConfirmExitDialog', () => {
     const defaultProps = {
       isOpen: true,
       onClose: jest.fn(),
       onConfirmExit: jest.fn(),
       itemCount: 0,
       hasUnsavedChanges: false,
     };

     beforeEach(() => {
       jest.clearAllMocks();
     });

     it('returns null when isOpen is false', () => {
       const { container } = render(<ConfirmExitDialog {...defaultProps} isOpen={false} />);
       expect(container.firstChild).toBeNull();
     });

     it('renders dialog when isOpen is true', () => {
       render(<ConfirmExitDialog {...defaultProps} />);
       expect(screen.getByRole('alertdialog')).toBeInTheDocument();
     });

     it('displays correct message with no items', () => {
       render(<ConfirmExitDialog {...defaultProps} />);
       expect(screen.getByText('Are you sure you want to exit the workflow?')).toBeInTheDocument();
     });

     it('displays correct message with items', () => {
       render(<ConfirmExitDialog {...defaultProps} itemCount={3} />);
       expect(screen.getByText(/3 items/)).toBeInTheDocument();
     });

     it('displays correct message with unsaved changes', () => {
       render(<ConfirmExitDialog {...defaultProps} hasUnsavedChanges={true} />);
       expect(screen.getByText(/unsaved changes/)).toBeInTheDocument();
     });

     it('calls onClose when Cancel clicked', () => {
       render(<ConfirmExitDialog {...defaultProps} />);
       fireEvent.click(screen.getByText('Cancel'));
       expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
     });

     it('calls onConfirmExit when Exit Workflow clicked', () => {
       render(<ConfirmExitDialog {...defaultProps} />);
       fireEvent.click(screen.getByText('Exit Workflow'));
       expect(defaultProps.onConfirmExit).toHaveBeenCalledTimes(1);
     });

     it('calls onClose when backdrop clicked', () => {
       render(<ConfirmExitDialog {...defaultProps} />);
       const backdrop = screen.getByRole('alertdialog').parentElement;
       fireEvent.click(backdrop!);
       expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
     });

     it('calls onClose when Escape pressed', () => {
       render(<ConfirmExitDialog {...defaultProps} />);
       fireEvent.keyDown(screen.getByRole('alertdialog').parentElement!, { key: 'Escape' });
       expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
     });
   });
   ```

**Verification:**
- [ ] All tests pass
- [ ] Conditional render test passes
- [ ] Message variation tests pass
- [ ] Button click tests pass
- [ ] Keyboard accessibility tests pass

---

### Task 16: Integration Test for ItemCreationWorkflow (0.5 SP)

**File:** `src/components/ItemCreationWorkflow/__tests__/ItemCreationWorkflow.test.ts`

**Objective:** Create integration tests for the main workflow component.

**Implementation Steps:**

1. Create test file directory if needed

2. Create the test file:
   ```tsx
   /**
    * ItemCreationWorkflow Component Integration Tests
    *
    * @module ItemCreationWorkflow/__tests__/ItemCreationWorkflow.test
    * @lastModified 2026-01-05
    */

   import { render, screen, fireEvent } from '@testing-library/react';
   import { ItemCreationWorkflow } from '../ItemCreationWorkflow';

   describe('ItemCreationWorkflow', () => {
     const defaultProps = {
       onSessionComplete: jest.fn(),
       onSessionExit: jest.fn(),
       onGeneratePDF: jest.fn().mockResolvedValue(new Blob()),
       onPrintDirect: jest.fn().mockResolvedValue(undefined),
       onFetchExistingItems: jest.fn().mockResolvedValue([]),
       onSaveItem: jest.fn().mockResolvedValue({ id: 'test', qrCodeUrl: 'test' }),
     };

     beforeEach(() => {
       jest.clearAllMocks();
     });

     it('renders the first step (room-selection)', () => {
       render(<ItemCreationWorkflow {...defaultProps} />);
       expect(screen.getByText(/Room Selection/i)).toBeInTheDocument();
     });

     it('shows progress as Step 1 of 9', () => {
       render(<ItemCreationWorkflow {...defaultProps} />);
       expect(screen.getByText('Step 1 of 9')).toBeInTheDocument();
     });

     it('back button not visible on first step', () => {
       render(<ItemCreationWorkflow {...defaultProps} />);
       expect(screen.queryByLabelText('Go back to previous step')).not.toBeInTheDocument();
     });

     it('opens exit dialog when exit clicked', () => {
       render(<ItemCreationWorkflow {...defaultProps} />);
       fireEvent.click(screen.getByLabelText('Exit workflow'));
       expect(screen.getByRole('alertdialog')).toBeInTheDocument();
     });

     it('calls onSessionExit when exit confirmed', () => {
       render(<ItemCreationWorkflow {...defaultProps} />);
       fireEvent.click(screen.getByLabelText('Exit workflow'));
       fireEvent.click(screen.getByText('Exit Workflow'));
       expect(defaultProps.onSessionExit).toHaveBeenCalledTimes(1);
     });

     it('closes exit dialog when cancelled', () => {
       render(<ItemCreationWorkflow {...defaultProps} />);
       fireEvent.click(screen.getByLabelText('Exit workflow'));
       fireEvent.click(screen.getByText('Cancel'));
       expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
     });
   });
   ```

**Verification:**
- [ ] All tests pass
- [ ] Initial render shows first step
- [ ] Progress indicator shows correct position
- [ ] Exit confirmation flow works correctly
- [ ] Back button visibility is correct on first step

---

### Task 17: Manual Testing and Verification (0.5 SP)

**Objective:** Perform manual testing of the implemented components.

**Testing Checklist:**

1. **WorkflowHeader Visual Testing:**
   - [ ] Progress bar displays correctly at various percentages (10%, 50%, 100%)
   - [ ] Progress bar color is Airbnb pink (#FF385C)
   - [ ] Progress bar animates smoothly on step change
   - [ ] Step indicator shows "Step X of Y" format
   - [ ] Back button is 48x48px with proper touch target
   - [ ] Exit button is 48x48px with proper touch target
   - [ ] Header shadow is subtle but visible

2. **ConfirmExitDialog Visual Testing:**
   - [ ] Dialog is centered on screen
   - [ ] Backdrop dims the background
   - [ ] Warning icon is amber colored
   - [ ] Exit button is Airbnb destructive color (#FF5A5F)
   - [ ] Text colors match design system
   - [ ] Dialog animates in smoothly

3. **Navigation Flow Testing:**
   - [ ] Clicking Continue advances to next step
   - [ ] Progress bar updates on step change
   - [ ] Back button appears after first step
   - [ ] Back button returns to previous step
   - [ ] Exit opens confirmation dialog
   - [ ] Exit dialog Cancel closes dialog
   - [ ] Exit dialog Confirm calls exit callback

4. **Keyboard Navigation:**
   - [ ] Tab navigates between buttons
   - [ ] Enter activates focused button
   - [ ] Escape closes exit dialog
   - [ ] Focus rings are visible

5. **Responsive Testing:**
   - [ ] Header works on mobile viewport (375px)
   - [ ] Header works on tablet viewport (768px)
   - [ ] Header works on desktop viewport (1024px+)

**Verification:**
- [ ] All visual tests pass
- [ ] All navigation tests pass
- [ ] All keyboard tests pass
- [ ] All responsive tests pass

---

## Task Summary

| Task | Description | Estimate | Dependencies |
|------|-------------|----------|--------------|
| 1 | Create WorkflowHeader shell | 0.5 SP | None |
| 2 | Implement progress bar | 0.5 SP | Task 1 |
| 3 | Implement navigation controls | 0.5 SP | Task 2 |
| 4 | Create ConfirmExitDialog shell | 0.5 SP | None |
| 5 | Implement dialog overlay | 0.5 SP | Task 4 |
| 6 | Implement dialog content | 0.5 SP | Task 5 |
| 7 | Update shared barrel export | 0.25 SP | Tasks 3, 6 |
| 8 | Create main component shell | 0.5 SP | Task 7 |
| 9 | Integrate WorkflowHeader | 0.5 SP | Task 8 |
| 10 | Implement step rendering | 0.5 SP | Task 9 |
| 11 | Integrate ConfirmExitDialog | 0.5 SP | Task 10 |
| 12 | Update main barrel export | 0.25 SP | Task 11 |
| 13 | Add navigation test actions | 0.5 SP | Task 12 |
| 14 | Unit test WorkflowHeader | 0.5 SP | Task 3 |
| 15 | Unit test ConfirmExitDialog | 0.5 SP | Task 6 |
| 16 | Integration test main component | 0.5 SP | Task 13 |
| 17 | Manual testing | 0.5 SP | Task 16 |

**Total Estimated Effort:** ~8.5 Story Points

---

## Implementation Order

**Recommended Sequence:**

1. Tasks 1-3: WorkflowHeader (can run in parallel with Tasks 4-6)
2. Tasks 4-6: ConfirmExitDialog
3. Task 7: Shared barrel exports
4. Tasks 8-12: Main component
5. Task 13: Test navigation buttons
6. Tasks 14-16: Unit and integration tests
7. Task 17: Manual testing

**Parallelization Opportunities:**
- Tasks 1-3 and 4-6 can be done in parallel (separate files)
- Tasks 14 and 15 can be done in parallel (separate test files)

---

## Success Criteria

1. [ ] Main component renders without errors
2. [ ] Step content changes based on `state.currentStep`
3. [ ] WorkflowHeader displays accurate progress
4. [ ] Progress bar width reflects `progressPercent`
5. [ ] Back button navigates to previous step
6. [ ] Exit confirmation shown when `isDirty` is true or items exist
7. [ ] All components properly exported via barrel files
8. [ ] TypeScript compiles without errors
9. [ ] All unit tests pass
10. [ ] All integration tests pass
11. [ ] Styling follows Airbnb design system

---

## References

- [REQ-095 Overview](./REQ-095-main-workflow-component-overview.md)
- [Plan-093-Item-Creation-Workflow.md](./prd/Plan-093-Item-Creation-Workflow.md)
- [ItemCapture ProgressIndicator](../src/components/ItemCapture/components/shared/ProgressIndicator.tsx)
- [ItemManager ConfirmDeleteDialog](../src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx)
- [useWorkflowState Hook](../src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts)

---

*Detailed task breakdown generated on 2026-01-05 for REQ-095: Main Workflow Component with Step Rendering*
