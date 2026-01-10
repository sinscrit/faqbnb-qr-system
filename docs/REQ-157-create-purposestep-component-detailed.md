# REQ-157: Create PurposeStep Component - Detailed Task Breakdown

**Generated:** 2026-01-09 22:15:00 UTC
**Last Modified:** 2026-01-09 22:15:00 UTC
**Request ID:** REQ-157
**Phase:** 2 - New Purpose Step
**Task ID:** 2.1
**Overview Document:** `/docs/REQ-157-create-purposestep-component-overview.md`
**Implementation Plan:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`

---

## Executive Summary

This document provides granular, actionable tasks for implementing the `PurposeStep` component. Each task is scoped to approximately 1 story point (a few hours of focused work) and includes verification steps. The implementation follows the established patterns from `ItemTypeStep` and uses the existing accessibility utilities.

---

## Prerequisites

Before starting these tasks, ensure the following are complete:

1. **Task 1.1 from Phase 1** - Types and Constants must be updated:
   - `PurposeType` type exists in `ItemCreationWorkflow.types.ts`
   - `PURPOSE_TYPES`, `PURPOSE_LABELS`, `PURPOSE_DESCRIPTIONS` constants exist in `constants.ts`

2. **Verify prerequisite completion:**
   ```bash
   # Check for PurposeType in types file
   grep -n "PurposeType" src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts

   # Check for PURPOSE_TYPES in constants file
   grep -n "PURPOSE_TYPES" src/components/ItemCreationWorkflow/utils/constants.ts
   ```

---

## Authorized Files for Modification

### Files to CREATE

| File | Purpose |
|------|---------|
| `src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx` | Main PurposeStep component |

### Files to MODIFY

| File | Changes |
|------|---------|
| `src/components/ItemCreationWorkflow/components/steps/index.ts` | Add export for PurposeStep |

### Files to READ (Reference Only)

| File | Purpose |
|------|---------|
| `src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx` | Pattern reference |
| `src/components/ItemCreationWorkflow/components/shared/ItemTypeCard.tsx` | Card styling reference |
| `src/components/ItemCreationWorkflow/utils/accessibility.ts` | Keyboard navigation utilities |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | PURPOSE_* constants |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | PurposeType definition |

---

## Task Breakdown

### Task 1: Create PurposeStep Component File Structure
**Estimated Effort:** 30 minutes
**Dependencies:** Prerequisites verified

#### Description
Create the initial `PurposeStep.tsx` file with proper file header, imports, type definitions, and component skeleton following the `ItemTypeStep` pattern.

#### Implementation Steps

1. Create file `src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx`

2. Add file header comment with module documentation:
   ```typescript
   'use client';

   /**
    * PurposeStep Component
    *
    * Step 4 of the item creation workflow.
    * Allows users to select the purpose/intent of their item content.
    * Implements keyboard navigation and accessibility support.
    *
    * @module ItemCreationWorkflow/components/steps/PurposeStep
    * @see docs/REQ-157-create-purposestep-component-overview.md
    * @lastModified 2026-01-09
    */
   ```

3. Add imports:
   ```typescript
   import { useCallback, useRef, useState } from 'react';
   import { cn } from '@/lib/utils';
   import {
     PlayCircle,
     Sparkles,
     Wrench,
     AlertTriangle,
     Settings,
     Star,
     Info,
     Check,
     type LucideIcon,
   } from 'lucide-react';
   import { PURPOSE_TYPES, PURPOSE_LABELS, PURPOSE_DESCRIPTIONS } from '../../utils/constants';
   import type { PurposeType } from '../../ItemCreationWorkflow.types';
   import { createKeyboardNavigator } from '../../utils/accessibility';
   ```

4. Define the `PurposeStepProps` interface:
   ```typescript
   export interface PurposeStepProps {
     /** Currently selected purpose (null if none) */
     currentPurpose: PurposeType | null;
     /** Callback when purpose is selected */
     onSelectPurpose: (purpose: PurposeType) => void;
     /** Callback to proceed to next step */
     onNext: () => void;
     /** Whether next step navigation is allowed */
     canNext: boolean;
     /** Optional CSS class */
     className?: string;
   }
   ```

5. Add purpose icon mapping constant:
   ```typescript
   const PURPOSE_ICONS: Record<PurposeType, LucideIcon> = {
     'how-to-use': PlayCircle,
     'how-to-clean': Sparkles,
     'troubleshooting': Wrench,
     'safety-info': AlertTriangle,
     'maintenance': Settings,
     'features': Star,
     'other': Info,
   };
   ```

6. Create component skeleton with empty render:
   ```typescript
   export function PurposeStep({
     currentPurpose,
     onSelectPurpose,
     onNext,
     canNext,
     className,
   }: PurposeStepProps) {
     return (
       <div className={cn('flex flex-col flex-1 p-6', className)}>
         {/* Implementation in subsequent tasks */}
       </div>
     );
   }

   export default PurposeStep;
   ```

#### Verification Steps
- [ ] File compiles without TypeScript errors
- [ ] All imports resolve correctly
- [ ] `PurposeStepProps` interface matches the pattern from `ItemTypeStepProps`
- [ ] Component renders an empty container without errors

#### Files Modified
- `src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx` (CREATE)

---

### Task 2: Implement State Management and Event Handlers
**Estimated Effort:** 45 minutes
**Dependencies:** Task 1 complete

#### Description
Add the state variables and event handlers for selection behavior, auto-advance, and continue button following the `ItemTypeStep` pattern exactly.

#### Implementation Steps

1. Add state for roving tabindex pattern:
   ```typescript
   // Inside PurposeStep component
   const [activeIndex, setActiveIndex] = useState(() =>
     currentPurpose ? PURPOSE_TYPES.indexOf(currentPurpose as PurposeType) : 0
   );
   const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
   ```

2. Implement `handlePurposeSelect` with auto-advance:
   ```typescript
   // Auto-advance when a purpose is selected
   const handlePurposeSelect = useCallback((purpose: PurposeType) => {
     onSelectPurpose(purpose);
     // Auto-advance after a brief visual feedback delay
     setTimeout(() => {
       onNext();
     }, 150);
   }, [onSelectPurpose, onNext]);
   ```

3. Implement `handleContinue` for manual navigation:
   ```typescript
   // Handle Continue button click
   const handleContinue = useCallback(() => {
     if (canNext) {
       onNext();
     }
   }, [canNext, onNext]);
   ```

4. Implement keyboard navigation handler:
   ```typescript
   // Keyboard navigation handler for purpose cards (vertical list)
   const handleListKeyDown = useCallback((event: React.KeyboardEvent) => {
     const validRefs = itemRefs.current.filter(Boolean) as HTMLButtonElement[];
     if (validRefs.length === 0) return;

     const handleNav = createKeyboardNavigator({
       items: validRefs,
       orientation: 'vertical',
       loop: true,
       onSelect: (index) => {
         handlePurposeSelect(PURPOSE_TYPES[index] as PurposeType);
       },
       onFocusChange: (index) => {
         setActiveIndex(index);
       },
     });

     handleNav(event);
   }, [handlePurposeSelect]);
   ```

#### Verification Steps
- [ ] State initializes correctly based on `currentPurpose` prop
- [ ] No TypeScript errors in event handler implementations
- [ ] `handlePurposeSelect` calls both `onSelectPurpose` and schedules `onNext`
- [ ] `handleContinue` respects `canNext` condition
- [ ] Keyboard navigator configuration matches `ItemTypeStep` pattern

#### Files Modified
- `src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx` (MODIFY)

---

### Task 3: Implement Header Section UI
**Estimated Effort:** 20 minutes
**Dependencies:** Task 2 complete

#### Description
Add the step header with title and description following the established styling pattern from `ItemTypeStep`.

#### Implementation Steps

1. Add header section inside the main container div:
   ```typescript
   {/* Step header */}
   <div className="mb-6">
     <h2 className="text-2xl font-semibold text-[#222222] mb-2">
       What's the purpose of this content?
     </h2>
     <p className="text-base text-[#717171]">
       Choose what you want to help guests with
     </p>
   </div>
   ```

#### Verification Steps
- [ ] Header text matches the design specification
- [ ] Styling matches `ItemTypeStep` header exactly
- [ ] Typography classes are consistent (`text-2xl`, `font-semibold`, etc.)

#### Files Modified
- `src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx` (MODIFY)

---

### Task 4: Implement Purpose Cards Grid with Radiogroup
**Estimated Effort:** 1 hour
**Dependencies:** Task 3 complete

#### Description
Implement the purpose cards as a vertical list with proper ARIA radiogroup semantics, following the `ItemTypeStep` card rendering pattern exactly.

#### Implementation Steps

1. Add the radiogroup container after the header:
   ```typescript
   {/* Purpose cards */}
   <div
     role="radiogroup"
     aria-label="Select content purpose"
     aria-describedby="purpose-help"
     className="flex flex-col gap-4"
     onKeyDown={handleListKeyDown}
   >
     {PURPOSE_TYPES.map((type, index) => {
       const Icon = PURPOSE_ICONS[type];
       const isSelected = currentPurpose === type;

       return (
         <button
           key={type}
           ref={(el) => { itemRefs.current[index] = el; }}
           type="button"
           role="radio"
           aria-checked={isSelected}
           aria-describedby={`${type}-description`}
           onClick={() => handlePurposeSelect(type as PurposeType)}
           tabIndex={index === activeIndex ? 0 : -1}
           className={cn(
             // Layout - horizontal with icon left, text right
             'flex items-center gap-4',
             'w-full rounded-xl border-2',
             // Sizing - matching ItemTypeCard
             'min-h-[100px] p-4 sm:min-h-[120px] sm:p-5',
             // Touch optimization
             'touch-manipulation select-none',
             // Transitions
             'transition-all duration-200',
             'motion-reduce:transition-none motion-reduce:transform-none',
             // Focus states
             'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
             // Selection states
             isSelected
               ? 'border-blue-500 bg-blue-50'
               : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] motion-reduce:active:scale-100'
           )}
         >
           {/* Icon Section */}
           <div
             className={cn(
               'flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14',
               'flex items-center justify-center',
               'rounded-lg',
               isSelected ? 'bg-blue-100' : 'bg-gray-100'
             )}
           >
             <Icon
               className={cn(
                 'w-6 h-6 sm:w-7 sm:h-7',
                 isSelected ? 'text-blue-600' : 'text-gray-500'
               )}
               aria-hidden="true"
             />
           </div>

           {/* Text Content Section */}
           <div className="flex-1 text-left">
             <span
               className={cn(
                 'block text-base sm:text-lg font-semibold',
                 isSelected ? 'text-blue-700' : 'text-gray-900'
               )}
             >
               {PURPOSE_LABELS[type]}
             </span>
             <span
               id={`${type}-description`}
               className={cn(
                 'block mt-1 text-sm',
                 isSelected ? 'text-blue-600' : 'text-gray-500'
               )}
             >
               {PURPOSE_DESCRIPTIONS[type]}
             </span>
           </div>

           {/* Checkmark indicator for selected state */}
           {isSelected && (
             <div className="flex-shrink-0">
               <Check className="w-5 h-5 text-blue-600" aria-hidden="true" />
             </div>
           )}
         </button>
       );
     })}
   </div>
   ```

2. Add screen reader help text after the radiogroup:
   ```typescript
   <p id="purpose-help" className="sr-only">
     Use up and down arrow keys to navigate. Press Enter or Space to select.
   </p>
   ```

#### Verification Steps
- [ ] All 7 purpose types render correctly
- [ ] Each card shows icon, label, and description
- [ ] Selected state shows checkmark and blue styling
- [ ] Hover state shows gray background
- [ ] Cards have proper `role="radio"` and `aria-checked` attributes
- [ ] `aria-describedby` links card to its description
- [ ] Screen reader help text is present with `sr-only` class
- [ ] Ref array properly stores button references

#### Files Modified
- `src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx` (MODIFY)

---

### Task 5: Implement Continue Button
**Estimated Effort:** 20 minutes
**Dependencies:** Task 4 complete

#### Description
Add the Continue button with proper disabled state handling, matching the styling from `ItemTypeStep`.

#### Implementation Steps

1. Add the Continue button section after the screen reader help text:
   ```typescript
   {/* Continue button */}
   <div className="mt-8 pt-6 border-t border-gray-200">
     <button
       type="button"
       onClick={handleContinue}
       disabled={!canNext}
       className={cn(
         'w-full py-4 rounded-lg font-semibold text-lg',
         'transition-colors duration-150 motion-reduce:transition-none',
         'min-h-[56px]', // Touch target height
         canNext
           ? 'bg-[#FF385C] text-white hover:bg-[#E31C5F] active:bg-[#D70466]'
           : 'bg-gray-200 text-gray-400 cursor-not-allowed'
       )}
       aria-disabled={!canNext}
     >
       Continue
     </button>
   </div>
   ```

#### Verification Steps
- [ ] Button appears below cards with border-top separator
- [ ] Button is disabled when `canNext` is false
- [ ] Disabled button has gray styling
- [ ] Enabled button has red (#FF385C) styling
- [ ] Button has minimum 56px height for touch targets
- [ ] `aria-disabled` matches the `disabled` prop

#### Files Modified
- `src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx` (MODIFY)

---

### Task 6: Update Steps Index Export
**Estimated Effort:** 10 minutes
**Dependencies:** Task 5 complete

#### Description
Add the export for `PurposeStep` and `PurposeStepProps` to the steps barrel export file, following the established pattern.

#### Implementation Steps

1. Open `src/components/ItemCreationWorkflow/components/steps/index.ts`

2. Add new section after SpecificItemStep exports (around line 53):
   ```typescript
   // =============================================================================
   // Purpose Selection Step (Step 4 - NEW)
   // =============================================================================
   /**
    * Purpose selection for item content.
    * Determines the intent of the content being created.
    */
   export { PurposeStep } from './PurposeStep';
   export type { PurposeStepProps } from './PurposeStep';
   ```

3. Update the file header comment to reflect the new step (optional, for accuracy):
   - Update step flow documentation to include Purpose step after SpecificItemStep

#### Verification Steps
- [ ] Export is added in correct location (after SpecificItemStep, before ContentSourceStep)
- [ ] Both `PurposeStep` and `PurposeStepProps` are exported
- [ ] File compiles without errors
- [ ] Can import `PurposeStep` from the barrel export:
  ```typescript
  import { PurposeStep } from '@/components/ItemCreationWorkflow/components/steps';
  ```

#### Files Modified
- `src/components/ItemCreationWorkflow/components/steps/index.ts` (MODIFY)

---

### Task 7: Manual Integration Testing
**Estimated Effort:** 30 minutes
**Dependencies:** Task 6 complete

#### Description
Test the component manually by temporarily importing and rendering it, or by reviewing in Storybook if available.

#### Implementation Steps

1. Create a temporary test page or use browser DevTools to verify:
   - Component renders without errors
   - All 7 purpose types display correctly
   - Icons render correctly for each type
   - Labels and descriptions match constants

2. Test selection behavior:
   - Click on a purpose card
   - Verify visual feedback (blue border, blue background)
   - Verify checkmark appears
   - Verify auto-advance would trigger (check console or mock `onNext`)

3. Test keyboard navigation:
   - Tab into the radiogroup
   - Press ArrowDown to move focus to next card
   - Press ArrowUp to move focus to previous card
   - Press Home to focus first card
   - Press End to focus last card
   - Press Enter or Space to select focused card
   - Verify focus loops when reaching boundaries

4. Test accessibility:
   - Use browser accessibility inspector
   - Verify radiogroup role
   - Verify radio role on each card
   - Verify aria-checked updates on selection
   - Verify aria-describedby links to descriptions

5. Test responsive behavior:
   - Resize browser to mobile width (320px)
   - Verify cards stack properly
   - Verify touch targets are adequate (min 48px)

#### Verification Steps
- [ ] Component renders all 7 purpose options
- [ ] Selection updates visual state correctly
- [ ] Keyboard navigation works (Arrow keys, Home, End, Enter, Space)
- [ ] ARIA attributes are correct
- [ ] Mobile responsive layout works
- [ ] No console errors or warnings
- [ ] Auto-advance triggers after 150ms delay

#### Files Modified
- None (testing only)

---

### Task 8: TypeScript and Lint Verification
**Estimated Effort:** 15 minutes
**Dependencies:** Task 7 complete

#### Description
Run TypeScript compiler and linter to verify no errors exist in the new code.

#### Implementation Steps

1. Run TypeScript compiler check:
   ```bash
   npx tsc --noEmit
   ```

2. Run linter on new file:
   ```bash
   npx eslint src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx
   ```

3. Fix any reported errors or warnings

4. Verify imports are correctly resolved:
   ```bash
   # Check that the component can be imported
   npx tsc --noEmit --traceResolution 2>&1 | grep PurposeStep
   ```

#### Verification Steps
- [ ] No TypeScript compilation errors
- [ ] No ESLint errors or warnings
- [ ] All imports resolve correctly
- [ ] Component exports are properly typed

#### Files Modified
- `src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx` (if fixes needed)

---

## Complete PurposeStep.tsx Reference Implementation

For reference, here is the complete implementation that should result from Tasks 1-5:

```typescript
'use client';

/**
 * PurposeStep Component
 *
 * Step 4 of the item creation workflow.
 * Allows users to select the purpose/intent of their item content.
 * Implements keyboard navigation and accessibility support.
 *
 * @module ItemCreationWorkflow/components/steps/PurposeStep
 * @see docs/REQ-157-create-purposestep-component-overview.md
 * @lastModified 2026-01-09
 */

import { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  PlayCircle,
  Sparkles,
  Wrench,
  AlertTriangle,
  Settings,
  Star,
  Info,
  Check,
  type LucideIcon,
} from 'lucide-react';
import { PURPOSE_TYPES, PURPOSE_LABELS, PURPOSE_DESCRIPTIONS } from '../../utils/constants';
import type { PurposeType } from '../../ItemCreationWorkflow.types';
import { createKeyboardNavigator } from '../../utils/accessibility';

// =============================================================================
// Type Definitions
// =============================================================================

export interface PurposeStepProps {
  /** Currently selected purpose (null if none) */
  currentPurpose: PurposeType | null;
  /** Callback when purpose is selected */
  onSelectPurpose: (purpose: PurposeType) => void;
  /** Callback to proceed to next step */
  onNext: () => void;
  /** Whether next step navigation is allowed */
  canNext: boolean;
  /** Optional CSS class */
  className?: string;
}

// =============================================================================
// Icon Mapping
// =============================================================================

/**
 * Maps purpose types to their corresponding Lucide icons.
 */
const PURPOSE_ICONS: Record<PurposeType, LucideIcon> = {
  'how-to-use': PlayCircle,
  'how-to-clean': Sparkles,
  'troubleshooting': Wrench,
  'safety-info': AlertTriangle,
  'maintenance': Settings,
  'features': Star,
  'other': Info,
};

// =============================================================================
// Main Component
// =============================================================================

export function PurposeStep({
  currentPurpose,
  onSelectPurpose,
  onNext,
  canNext,
  className,
}: PurposeStepProps) {
  // State for roving tabindex pattern
  const [activeIndex, setActiveIndex] = useState(() =>
    currentPurpose ? PURPOSE_TYPES.indexOf(currentPurpose as PurposeType) : 0
  );
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Auto-advance when a purpose is selected
  const handlePurposeSelect = useCallback((purpose: PurposeType) => {
    onSelectPurpose(purpose);
    // Auto-advance after a brief visual feedback delay
    setTimeout(() => {
      onNext();
    }, 150);
  }, [onSelectPurpose, onNext]);

  // Handle Continue button click
  const handleContinue = useCallback(() => {
    if (canNext) {
      onNext();
    }
  }, [canNext, onNext]);

  // Keyboard navigation handler for purpose cards (vertical list)
  const handleListKeyDown = useCallback((event: React.KeyboardEvent) => {
    const validRefs = itemRefs.current.filter(Boolean) as HTMLButtonElement[];
    if (validRefs.length === 0) return;

    const handleNav = createKeyboardNavigator({
      items: validRefs,
      orientation: 'vertical',
      loop: true,
      onSelect: (index) => {
        handlePurposeSelect(PURPOSE_TYPES[index] as PurposeType);
      },
      onFocusChange: (index) => {
        setActiveIndex(index);
      },
    });

    handleNav(event);
  }, [handlePurposeSelect]);

  return (
    <div className={cn('flex flex-col flex-1 p-6', className)}>
      {/* Step header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#222222] mb-2">
          What's the purpose of this content?
        </h2>
        <p className="text-base text-[#717171]">
          Choose what you want to help guests with
        </p>
      </div>

      {/* Purpose cards */}
      <div
        role="radiogroup"
        aria-label="Select content purpose"
        aria-describedby="purpose-help"
        className="flex flex-col gap-4"
        onKeyDown={handleListKeyDown}
      >
        {PURPOSE_TYPES.map((type, index) => {
          const Icon = PURPOSE_ICONS[type];
          const isSelected = currentPurpose === type;

          return (
            <button
              key={type}
              ref={(el) => { itemRefs.current[index] = el; }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-describedby={`${type}-description`}
              onClick={() => handlePurposeSelect(type as PurposeType)}
              tabIndex={index === activeIndex ? 0 : -1}
              className={cn(
                // Layout - horizontal with icon left, text right
                'flex items-center gap-4',
                'w-full rounded-xl border-2',
                // Sizing - matching ItemTypeCard
                'min-h-[100px] p-4 sm:min-h-[120px] sm:p-5',
                // Touch optimization
                'touch-manipulation select-none',
                // Transitions
                'transition-all duration-200',
                'motion-reduce:transition-none motion-reduce:transform-none',
                // Focus states
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                // Selection states
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] motion-reduce:active:scale-100'
              )}
            >
              {/* Icon Section */}
              <div
                className={cn(
                  'flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14',
                  'flex items-center justify-center',
                  'rounded-lg',
                  isSelected ? 'bg-blue-100' : 'bg-gray-100'
                )}
              >
                <Icon
                  className={cn(
                    'w-6 h-6 sm:w-7 sm:h-7',
                    isSelected ? 'text-blue-600' : 'text-gray-500'
                  )}
                  aria-hidden="true"
                />
              </div>

              {/* Text Content Section */}
              <div className="flex-1 text-left">
                <span
                  className={cn(
                    'block text-base sm:text-lg font-semibold',
                    isSelected ? 'text-blue-700' : 'text-gray-900'
                  )}
                >
                  {PURPOSE_LABELS[type]}
                </span>
                <span
                  id={`${type}-description`}
                  className={cn(
                    'block mt-1 text-sm',
                    isSelected ? 'text-blue-600' : 'text-gray-500'
                  )}
                >
                  {PURPOSE_DESCRIPTIONS[type]}
                </span>
              </div>

              {/* Checkmark indicator for selected state */}
              {isSelected && (
                <div className="flex-shrink-0">
                  <Check className="w-5 h-5 text-blue-600" aria-hidden="true" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      <p id="purpose-help" className="sr-only">
        Use up and down arrow keys to navigate. Press Enter or Space to select.
      </p>

      {/* Continue button */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!canNext}
          className={cn(
            'w-full py-4 rounded-lg font-semibold text-lg',
            'transition-colors duration-150 motion-reduce:transition-none',
            'min-h-[56px]', // Touch target height
            canNext
              ? 'bg-[#FF385C] text-white hover:bg-[#E31C5F] active:bg-[#D70466]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
          aria-disabled={!canNext}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default PurposeStep;
```

---

## Task Summary Table

| Task | Description | Est. Time | Dependencies |
|------|-------------|-----------|--------------|
| 1 | Create file structure, imports, and component skeleton | 30 min | Prerequisites |
| 2 | Implement state management and event handlers | 45 min | Task 1 |
| 3 | Implement header section UI | 20 min | Task 2 |
| 4 | Implement purpose cards grid with radiogroup | 1 hour | Task 3 |
| 5 | Implement Continue button | 20 min | Task 4 |
| 6 | Update steps index export | 10 min | Task 5 |
| 7 | Manual integration testing | 30 min | Task 6 |
| 8 | TypeScript and lint verification | 15 min | Task 7 |
| **Total** | | **~3.5 hours** | |

---

## Definition of Done

- [ ] PurposeStep.tsx created following ItemTypeStep pattern exactly
- [ ] All 7 purpose types render with correct icons, labels, descriptions
- [ ] Click/tap selection works and calls onSelectPurpose
- [ ] Auto-advance fires after 150ms delay on selection
- [ ] Keyboard navigation works (Arrow keys, Enter, Space, Home, End)
- [ ] Roving tabindex implemented correctly (only active item has tabIndex=0)
- [ ] ARIA attributes present and correct:
  - [ ] `role="radiogroup"` on container
  - [ ] `role="radio"` on each card
  - [ ] `aria-checked` reflects selection state
  - [ ] `aria-label` on radiogroup
  - [ ] `aria-describedby` on each card linking to description
- [ ] Screen reader help text included with `sr-only` class
- [ ] Export added to `steps/index.ts`
- [ ] No TypeScript compilation errors
- [ ] No ESLint errors or warnings
- [ ] Component renders without console errors
- [ ] Responsive layout works on mobile (320px width)
- [ ] Touch targets meet 48px minimum height

---

## Accessibility Verification Checklist

| Requirement | Implementation | Verified |
|-------------|----------------|----------|
| Radiogroup role | `role="radiogroup"` on container div | [ ] |
| Radio role | `role="radio"` on each button | [ ] |
| Selection state | `aria-checked={isSelected}` | [ ] |
| Group label | `aria-label="Select content purpose"` | [ ] |
| Option descriptions | `aria-describedby={type}-description` | [ ] |
| Screen reader help | `<p id="purpose-help" className="sr-only">` | [ ] |
| Focus visibility | `focus-visible:ring-2 focus-visible:ring-blue-500` | [ ] |
| Reduced motion | `motion-reduce:transition-none` | [ ] |
| Touch targets | `min-h-[100px]` on cards, `min-h-[56px]` on button | [ ] |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| PURPOSE_TYPES constants not defined | Verify prerequisites before starting; can stub constants temporarily if needed |
| PurposeType type not defined | Check `ItemCreationWorkflow.types.ts` before starting |
| Icons not available in lucide-react | All icons used are standard Lucide icons (verified) |
| Styling inconsistency with ItemTypeStep | Copy styling classes exactly from ItemTypeCard |

---

## References

- Overview Document: `/docs/REQ-157-create-purposestep-component-overview.md`
- Implementation Plan: `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`
- Request: `/docs/gen_requests.md` - REQ-157
- Pattern Reference: `/src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx`
- Card Pattern: `/src/components/ItemCreationWorkflow/components/shared/ItemTypeCard.tsx`
- Accessibility Utils: `/src/components/ItemCreationWorkflow/utils/accessibility.ts`
- Constants: `/src/components/ItemCreationWorkflow/utils/constants.ts`
