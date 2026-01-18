# REQ-033: Implementation Breakdown - Wizard Navigation Scaffold

**Document Created:** 2025-12-31 17:45
**Last Modified:** 2025-12-31 17:45
**Request Reference:** docs/gen_requests.md - Request #033
**Implementation Plan Reference:** docs/prd/item-capture-implementation-plan.md
**Phase:** 1 - Foundation
**Task ID:** 1.3

---

## Overview

This document provides a detailed implementation breakdown for the wizard navigation scaffold that will provide the foundational UI structure for the multi-step item capture workflow. This includes the step container (`CaptureWizard.tsx`), navigation controls (`StepNavigation.tsx`), and visual progress tracking (`ProgressIndicator.tsx`).

### Purpose

The wizard navigation scaffold establishes the visual and interactive framework for guiding users through the item capture process, providing:

- A consistent step container for rendering wizard steps
- Intuitive back/next/cancel navigation controls
- Visual progress indication showing current position in the workflow
- Responsive, mobile-first design aligned with codebase patterns
- Integration with the state machine hook for step transitions

### Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Task 1.1 - Directory Structure | **Required** | Component directories must exist |
| Task 1.2 - State Machine Hook | **Required** | `useItemCaptureState` hook provides navigation state and actions |
| `ItemCapture.types.ts` | **Required** | `WizardStep` type definition |

### Dependents (Blocked by this task)

- Task 1.4 - MetadataStep (can start in parallel after scaffold exists)
- Task 1.5 - ContentTypeStep (can start in parallel after scaffold exists)
- All Phase 2-5 step components rely on this scaffold

---

## Technical Approach

### Pattern Selection: Container + Controls Pattern

Based on codebase analysis, this implementation follows the established modal/form container patterns with:

1. **CaptureWizard.tsx** - Step container that renders the active step component
2. **StepNavigation.tsx** - Consistent footer navigation across all steps
3. **ProgressIndicator.tsx** - Step progress visualization in header area

### Existing Patterns to Follow

| Pattern | Source File | How to Apply |
|---------|-------------|--------------|
| Modal container | `ConfirmationModal.tsx` | `bg-white rounded-lg shadow-sm border` card pattern |
| Form layout | `ItemForm.tsx`, `PropertyForm.tsx` | Header section + content + footer structure |
| Button styling | `PropertyForm.tsx`, `LoginForm.tsx` | Primary blue, secondary white/gray buttons |
| Navigation footer | `ItemForm.tsx:620-640` | `flex justify-end space-x-3 pt-4 border-t` pattern |
| Error display | `RegistrationForm.tsx` | Red color scheme with AlertCircle icons |
| Icon usage | All components | lucide-react with `w-4 h-4` or `w-5 h-5` sizing |
| Responsive design | `ItemForm.tsx` | Mobile-first with `md:` breakpoints |

### Component Hierarchy

```
src/components/ItemCapture/
├── ItemCapture.tsx              # Main orchestrator (wraps CaptureWizard)
└── components/
    ├── CaptureWizard.tsx        # Step container (THIS TASK)
    └── shared/
        ├── StepNavigation.tsx   # Back/Next/Cancel buttons (THIS TASK)
        └── ProgressIndicator.tsx # Step progress display (THIS TASK)
```

---

## Component Specifications

### 1. CaptureWizard.tsx

**Purpose:** Container component that orchestrates step rendering based on current wizard state.

**Props Interface:**
```typescript
interface CaptureWizardProps {
  /** Current wizard state from useItemCaptureState hook */
  state: ItemCaptureState;

  /** Navigation actions from useItemCaptureState hook */
  onNext: () => void;
  onBack: () => void;
  onCancel: () => void;

  /** Computed navigation flags */
  canGoNext: boolean;
  canGoBack: boolean;

  /** Optional CSS class for customization */
  className?: string;

  /** Children to render as step content (or use renderStep prop) */
  children?: React.ReactNode;
}
```

**Structure:**
```tsx
<div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[500px] flex flex-col">
  {/* Header with progress indicator */}
  <div className="px-6 py-4 border-b border-gray-200">
    <ProgressIndicator
      currentStep={state.currentStep}
      steps={WIZARD_STEPS}
    />
  </div>

  {/* Step content area - grows to fill available space */}
  <div className="flex-1 p-6 overflow-y-auto">
    {children}
  </div>

  {/* Footer with navigation */}
  <div className="px-6 py-4 border-t border-gray-200">
    <StepNavigation
      onNext={onNext}
      onBack={onBack}
      onCancel={onCancel}
      canGoNext={canGoNext}
      canGoBack={canGoBack}
      isFirstStep={state.currentStep === 'metadata'}
      isLastStep={state.currentStep === 'review'}
    />
  </div>
</div>
```

**Behavior:**
- Renders step content in center area with scrollable overflow
- Header contains progress indicator
- Footer contains navigation controls
- Maintains consistent height for smooth step transitions
- Supports mobile viewport with full-width on small screens

### 2. StepNavigation.tsx

**Purpose:** Navigation control bar with back, next, and cancel actions.

**Props Interface:**
```typescript
interface StepNavigationProps {
  /** Callback for next/continue action */
  onNext: () => void;

  /** Callback for back action */
  onBack: () => void;

  /** Callback for cancel action */
  onCancel: () => void;

  /** Whether next button is enabled */
  canGoNext: boolean;

  /** Whether back button is enabled/visible */
  canGoBack: boolean;

  /** Whether this is the first step (hide back) */
  isFirstStep?: boolean;

  /** Whether this is the last step (show submit instead of next) */
  isLastStep?: boolean;

  /** Loading state for async operations */
  isLoading?: boolean;

  /** Custom label for next button (default: "Next") */
  nextLabel?: string;

  /** Custom label for back button (default: "Back") */
  backLabel?: string;

  /** Optional CSS class */
  className?: string;
}
```

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Cancel]                              [Back]    [Next →]   │
└─────────────────────────────────────────────────────────────┘
```

**Button Styles (from codebase patterns):**

| Button | Style | Visibility |
|--------|-------|------------|
| Cancel | Inline text button (gray, left-aligned) | Always visible |
| Back | Secondary (white border) | Hidden on first step |
| Next | Primary (blue filled) | Shows "Continue" or "Submit" based on step |

**Implementation:**
```tsx
export function StepNavigation({
  onNext,
  onBack,
  onCancel,
  canGoNext,
  canGoBack,
  isFirstStep = false,
  isLastStep = false,
  isLoading = false,
  nextLabel,
  backLabel = 'Back',
  className,
}: StepNavigationProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      {/* Left side: Cancel */}
      <button
        type="button"
        onClick={onCancel}
        className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
      >
        Cancel
      </button>

      {/* Right side: Back + Next */}
      <div className="flex items-center space-x-3">
        {!isFirstStep && (
          <button
            type="button"
            onClick={onBack}
            disabled={!canGoBack || isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {backLabel}
          </button>
        )}

        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext || isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : null}
          {nextLabel || (isLastStep ? 'Submit' : 'Continue')}
          {!isLastStep && !isLoading && (
            <ArrowRight className="w-4 h-4 ml-2" />
          )}
          {isLastStep && !isLoading && (
            <Check className="w-4 h-4 ml-2" />
          )}
        </button>
      </div>
    </div>
  );
}
```

### 3. ProgressIndicator.tsx

**Purpose:** Visual progress display showing current step position in the wizard flow.

**Props Interface:**
```typescript
interface ProgressIndicatorProps {
  /** Current active step */
  currentStep: WizardStep;

  /** Array of step definitions for display */
  steps: StepDefinition[];

  /** Optional CSS class */
  className?: string;
}

interface StepDefinition {
  id: WizardStep;
  label: string;
  shortLabel?: string;  // For mobile display
}
```

**Display Steps (Simplified for Progress):**

The wizard has many steps, but for progress display we group them into logical stages:

```typescript
const PROGRESS_STAGES: StepDefinition[] = [
  { id: 'metadata', label: 'Details', shortLabel: '1' },
  { id: 'content-type', label: 'Content', shortLabel: '2' },
  // capture-video, capture-photo, upload-file, write-text map to 'Content'
  // edit-media maps to 'Edit'
  { id: 'edit-media', label: 'Edit', shortLabel: '3' },
  { id: 'review', label: 'Review', shortLabel: '4' },
];
```

**Visual Design Options:**

**Option A: Numbered Steps with Labels (Desktop)**
```
┌─────────────────────────────────────────────────────────────┐
│   (1) Details  ───  (2) Content  ───  (3) Edit  ───  (4) Review │
│      ●             ○              ○             ○            │
└─────────────────────────────────────────────────────────────┘
```

**Option B: Progress Bar (Mobile-Friendly)**
```
┌─────────────────────────────────────────────────────────────┐
│  Step 1 of 4: Details                                       │
│  ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  25%            │
└─────────────────────────────────────────────────────────────┘
```

**Recommended Implementation (Hybrid):**
```tsx
export function ProgressIndicator({
  currentStep,
  steps,
  className,
}: ProgressIndicatorProps) {
  const currentIndex = getCurrentStageIndex(currentStep);
  const progressPercent = ((currentIndex + 1) / steps.length) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Mobile: Simple progress bar */}
      <div className="md:hidden">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Step {currentIndex + 1} of {steps.length}</span>
          <span>{steps[currentIndex]?.label}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Desktop: Step indicators */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;

          return (
            <React.Fragment key={step.id}>
              {/* Step indicator */}
              <div className="flex items-center">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors",
                  isActive && "border-blue-600 bg-blue-600 text-white",
                  isCompleted && "border-green-600 bg-green-600 text-white",
                  !isActive && !isCompleted && "border-gray-300 bg-white text-gray-500"
                )}>
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={cn(
                  "ml-2 text-sm font-medium",
                  isActive && "text-blue-600",
                  isCompleted && "text-green-600",
                  !isActive && !isCompleted && "text-gray-500"
                )}>
                  {step.label}
                </span>
              </div>

              {/* Connector line (except last) */}
              {index < steps.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-4",
                  isCompleted ? "bg-green-600" : "bg-gray-200"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
```

---

## Step Mapping Logic

The wizard has more internal steps than we display to users. Here's the mapping:

```typescript
// Internal step to display stage mapping
const STEP_TO_STAGE: Record<WizardStep, number> = {
  'metadata': 0,        // Stage 1: Details
  'content-type': 1,    // Stage 2: Content
  'capture-video': 1,   // Stage 2: Content
  'capture-photo': 1,   // Stage 2: Content
  'upload-file': 1,     // Stage 2: Content
  'write-text': 1,      // Stage 2: Content
  'edit-media': 2,      // Stage 3: Edit
  'add-more': 1,        // Stage 2: Content (back to content)
  'review': 3,          // Stage 4: Review
};

function getCurrentStageIndex(step: WizardStep): number {
  return STEP_TO_STAGE[step] ?? 0;
}
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/components/CaptureWizard.tsx` | Step container component |
| `src/components/ItemCapture/components/shared/StepNavigation.tsx` | Navigation controls |
| `src/components/ItemCapture/components/shared/ProgressIndicator.tsx` | Progress display |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemCapture/index.ts` | Export new components |

### Dependencies (Read-Only Reference)

| File Path | Reference Purpose |
|-----------|-------------------|
| `src/components/ItemCapture/ItemCapture.types.ts` | WizardStep type definition |
| `src/components/ItemCapture/hooks/useItemCaptureState.ts` | Hook integration |
| `src/components/ConfirmationModal.tsx` | Modal/card styling patterns |
| `src/components/ItemForm.tsx` | Form layout and button patterns |
| `src/lib/utils.ts` | `cn()` utility function |

---

## Implementation Tasks

### Task 1: Create ProgressIndicator Component (45 min)

**File:** `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`

**Deliverables:**
- [ ] Define `StepDefinition` interface
- [ ] Define `ProgressIndicatorProps` interface
- [ ] Implement `PROGRESS_STAGES` constant with 4 stages
- [ ] Implement `getCurrentStageIndex()` helper function
- [ ] Implement mobile progress bar view
- [ ] Implement desktop step indicator view
- [ ] Add responsive breakpoints (`md:hidden` / `hidden md:flex`)

**Acceptance Criteria:**
- Progress bar shows percentage completion on mobile
- Step indicators show numbered circles on desktop
- Current step is highlighted in blue
- Completed steps show green checkmarks
- Transitions are smooth (use `transition-all`)

### Task 2: Create StepNavigation Component (45 min)

**File:** `src/components/ItemCapture/components/shared/StepNavigation.tsx`

**Deliverables:**
- [ ] Define `StepNavigationProps` interface
- [ ] Implement Cancel button (left-aligned, text style)
- [ ] Implement Back button (secondary style, hidden on first step)
- [ ] Implement Next/Submit button (primary style, with icons)
- [ ] Add loading state support with spinner
- [ ] Add disabled states for canGoNext/canGoBack

**Acceptance Criteria:**
- Cancel is always visible on left side
- Back button hidden when `isFirstStep` is true
- Next button shows "Submit" when `isLastStep` is true
- Button icons match design (ArrowLeft, ArrowRight, Check, Loader2)
- Disabled state reduces opacity to 50%
- Focus states have blue ring (`focus:ring-2 focus:ring-blue-500`)

### Task 3: Create CaptureWizard Container (45 min)

**File:** `src/components/ItemCapture/components/CaptureWizard.tsx`

**Deliverables:**
- [ ] Define `CaptureWizardProps` interface
- [ ] Implement container with header/content/footer structure
- [ ] Integrate ProgressIndicator in header
- [ ] Integrate StepNavigation in footer
- [ ] Add content area with flex-grow and overflow scroll
- [ ] Apply card styling (`bg-white rounded-lg shadow-sm border`)

**Acceptance Criteria:**
- Container has minimum height for consistent appearance
- Content area scrolls independently when content overflows
- Header and footer are fixed at top/bottom
- Responsive padding (`px-4 py-4` mobile, `px-6 py-4` desktop)

### Task 4: Update Barrel Exports (10 min)

**File:** `src/components/ItemCapture/index.ts`

**Deliverables:**
- [ ] Export `CaptureWizard` component
- [ ] Export `StepNavigation` component
- [ ] Export `ProgressIndicator` component
- [ ] Export relevant prop interfaces

**Acceptance Criteria:**
- All components importable from `@/components/ItemCapture`
- No TypeScript compilation errors

### Task 5: Integration with State Machine (30 min)

**File:** `src/components/ItemCapture/ItemCapture.tsx` (modify if exists, or note for future)

**Deliverables:**
- [ ] Wire CaptureWizard to useItemCaptureState hook
- [ ] Pass navigation callbacks (nextStep, prevStep, cancel)
- [ ] Pass computed values (canGoNext, canGoBack)
- [ ] Implement step content rendering based on currentStep

**Acceptance Criteria:**
- CaptureWizard receives all required props from hook
- Navigation actions trigger appropriate state transitions
- Progress indicator reflects current step accurately

### Task 6: Create Test Cases (30 min)

**File:** `src/components/ItemCapture/components/__tests__/wizard-navigation.test.tsx`

**Test Coverage:**
- [ ] ProgressIndicator renders correct step as active
- [ ] ProgressIndicator shows completed checkmarks for past steps
- [ ] StepNavigation hides Back button on first step
- [ ] StepNavigation shows Submit on last step
- [ ] StepNavigation disables Next when canGoNext is false
- [ ] CaptureWizard renders children in content area

---

## Estimated Effort

| Task | Estimate | Complexity |
|------|----------|------------|
| Task 1: ProgressIndicator | 45 min | Medium |
| Task 2: StepNavigation | 45 min | Low |
| Task 3: CaptureWizard Container | 45 min | Low |
| Task 4: Barrel Exports | 10 min | Low |
| Task 5: State Machine Integration | 30 min | Medium |
| Task 6: Test Cases | 30 min | Low |
| **Total** | **~3-4 hours** | Low-Medium |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Step mapping complexity | Low | Low | Simplified 4-stage progress display |
| Mobile responsiveness issues | Low | Medium | Use proven mobile-first patterns from codebase |
| State machine integration delays | Low | Medium | Components work standalone, integration can follow |
| Icon sizing inconsistency | Low | Low | Use consistent `w-4 h-4` pattern |

---

## Testing Checklist

### Unit Tests
- [ ] ProgressIndicator shows correct stage for each WizardStep
- [ ] StepNavigation button visibility/labeling logic
- [ ] CaptureWizard renders with minimum required props

### Integration Tests
- [ ] Navigation callbacks trigger correctly when clicked
- [ ] Progress updates when step changes
- [ ] Disabled states prevent click handlers

### Manual Testing
- [ ] Test on mobile viewport (375px width)
- [ ] Test on tablet viewport (768px width)
- [ ] Test on desktop viewport (1024px+ width)
- [ ] Verify keyboard navigation (Tab, Enter)
- [ ] Check focus visibility on all buttons
- [ ] Verify smooth transitions between steps

---

## Code Standards

### Naming Conventions
- Component files: PascalCase (e.g., `StepNavigation.tsx`)
- Props interfaces: `{ComponentName}Props` pattern
- Helper functions: camelCase with descriptive names

### Styling Conventions
- Use `cn()` from `@/lib/utils` for conditional classes
- Follow existing Tailwind patterns from codebase
- Mobile-first responsive design
- Consistent spacing: `space-x-3` for button groups, `space-y-4` for sections

### Accessibility
- Buttons must have accessible names
- Progress indicators should use `role="progressbar"` where appropriate
- Focus states must be visible
- Touch targets minimum 44x44px on mobile

---

## References

- **Implementation Plan:** `docs/prd/item-capture-implementation-plan.md`
- **Request Definition:** `docs/gen_requests.md` - Request #033
- **Pattern Reference - Modal:** `src/components/ConfirmationModal.tsx`
- **Pattern Reference - Form Layout:** `src/components/ItemForm.tsx`
- **Pattern Reference - Buttons:** `src/components/PropertyForm.tsx`
- **Pattern Reference - Progress Bar:** `src/components/RegistrationForm.tsx` (password strength)
- **Dependency - State Machine:** REQ-032 `useItemCaptureState` hook
- **Dependency - Types:** REQ-031 `ItemCapture.types.ts`

---

## Appendix A: Complete Component Implementations

### ProgressIndicator.tsx (Complete)

```typescript
// src/components/ItemCapture/components/shared/ProgressIndicator.tsx
'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WizardStep } from '../../ItemCapture.types';

export interface StepDefinition {
  id: string;
  label: string;
  shortLabel?: string;
}

export interface ProgressIndicatorProps {
  currentStep: WizardStep;
  className?: string;
}

// Simplified stages for progress display
const PROGRESS_STAGES: StepDefinition[] = [
  { id: 'details', label: 'Details', shortLabel: '1' },
  { id: 'content', label: 'Content', shortLabel: '2' },
  { id: 'edit', label: 'Edit', shortLabel: '3' },
  { id: 'review', label: 'Review', shortLabel: '4' },
];

// Map internal wizard steps to display stages
const STEP_TO_STAGE_INDEX: Record<WizardStep, number> = {
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

function getCurrentStageIndex(step: WizardStep): number {
  return STEP_TO_STAGE_INDEX[step] ?? 0;
}

export function ProgressIndicator({
  currentStep,
  className,
}: ProgressIndicatorProps) {
  const currentIndex = getCurrentStageIndex(currentStep);
  const totalStages = PROGRESS_STAGES.length;
  const progressPercent = ((currentIndex + 1) / totalStages) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Mobile: Simple progress bar */}
      <div className="md:hidden">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Step {currentIndex + 1} of {totalStages}</span>
          <span className="font-medium">{PROGRESS_STAGES[currentIndex]?.label}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Desktop: Step indicators */}
      <div className="hidden md:flex items-center justify-between">
        {PROGRESS_STAGES.map((stage, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;

          return (
            <React.Fragment key={stage.id}>
              <div className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors",
                    isActive && "border-blue-600 bg-blue-600 text-white",
                    isCompleted && "border-green-600 bg-green-600 text-white",
                    !isActive && !isCompleted && "border-gray-300 bg-white text-gray-500"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    "ml-2 text-sm font-medium",
                    isActive && "text-blue-600",
                    isCompleted && "text-green-600",
                    !isActive && !isCompleted && "text-gray-500"
                  )}
                >
                  {stage.label}
                </span>
              </div>

              {/* Connector line (except last) */}
              {index < totalStages - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4",
                    isCompleted ? "bg-green-600" : "bg-gray-200"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default ProgressIndicator;
```

### StepNavigation.tsx (Complete)

```typescript
// src/components/ItemCapture/components/shared/StepNavigation.tsx
'use client';

import React from 'react';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StepNavigationProps {
  onNext: () => void;
  onBack: () => void;
  onCancel: () => void;
  canGoNext: boolean;
  canGoBack: boolean;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  isLoading?: boolean;
  nextLabel?: string;
  backLabel?: string;
  className?: string;
}

export function StepNavigation({
  onNext,
  onBack,
  onCancel,
  canGoNext,
  canGoBack,
  isFirstStep = false,
  isLastStep = false,
  isLoading = false,
  nextLabel,
  backLabel = 'Back',
  className,
}: StepNavigationProps) {
  const resolvedNextLabel = nextLabel || (isLastStep ? 'Submit' : 'Continue');

  return (
    <div className={cn("flex items-center justify-between", className)}>
      {/* Left side: Cancel */}
      <button
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        className="text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Cancel
      </button>

      {/* Right side: Back + Next */}
      <div className="flex items-center space-x-3">
        {!isFirstStep && (
          <button
            type="button"
            onClick={onBack}
            disabled={!canGoBack || isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {backLabel}
          </button>
        )}

        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext || isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {resolvedNextLabel}
          {!isLoading && !isLastStep && <ArrowRight className="w-4 h-4 ml-2" />}
          {!isLoading && isLastStep && <Check className="w-4 h-4 ml-2" />}
        </button>
      </div>
    </div>
  );
}

export default StepNavigation;
```

### CaptureWizard.tsx (Complete)

```typescript
// src/components/ItemCapture/components/CaptureWizard.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ProgressIndicator } from './shared/ProgressIndicator';
import { StepNavigation } from './shared/StepNavigation';
import type { WizardStep } from '../ItemCapture.types';

export interface CaptureWizardProps {
  /** Current wizard step */
  currentStep: WizardStep;

  /** Navigation callbacks */
  onNext: () => void;
  onBack: () => void;
  onCancel: () => void;

  /** Navigation state */
  canGoNext: boolean;
  canGoBack: boolean;

  /** Loading state */
  isLoading?: boolean;

  /** Step content */
  children: React.ReactNode;

  /** Optional CSS class */
  className?: string;
}

export function CaptureWizard({
  currentStep,
  onNext,
  onBack,
  onCancel,
  canGoNext,
  canGoBack,
  isLoading = false,
  children,
  className,
}: CaptureWizardProps) {
  const isFirstStep = currentStep === 'metadata';
  const isLastStep = currentStep === 'review';

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 min-h-[500px] flex flex-col",
        className
      )}
    >
      {/* Header with progress indicator */}
      <div className="px-4 py-4 md:px-6 border-b border-gray-200">
        <ProgressIndicator currentStep={currentStep} />
      </div>

      {/* Step content area */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {children}
      </div>

      {/* Footer with navigation */}
      <div className="px-4 py-4 md:px-6 border-t border-gray-200">
        <StepNavigation
          onNext={onNext}
          onBack={onBack}
          onCancel={onCancel}
          canGoNext={canGoNext}
          canGoBack={canGoBack}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default CaptureWizard;
```

---

## Appendix B: Barrel Export Updates

```typescript
// src/components/ItemCapture/index.ts
// Add to existing exports:

export { CaptureWizard } from './components/CaptureWizard';
export type { CaptureWizardProps } from './components/CaptureWizard';

export { StepNavigation } from './components/shared/StepNavigation';
export type { StepNavigationProps } from './components/shared/StepNavigation';

export { ProgressIndicator } from './components/shared/ProgressIndicator';
export type { ProgressIndicatorProps, StepDefinition } from './components/shared/ProgressIndicator';
```
