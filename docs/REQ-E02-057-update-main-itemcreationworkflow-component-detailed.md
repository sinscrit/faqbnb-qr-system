# Detailed Task Breakdown: REQ-E02-057 - Update Main ItemCreationWorkflow Component

**Document Version:** 1.0
**Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E02-057
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.2
**Size:** M (Medium)
**Overview Document:** [REQ-E02-057-overview.md](./REQ-E02-057-update-main-itemcreationworkflow-component-overview.md)

---

## Executive Summary

This document provides granular, actionable task breakdown for updating the main `ItemCreationWorkflow` component and its accessibility utilities to use the i18n translation system. The component serves as the orchestrator for the multi-step item creation workflow and contains accessibility-critical strings that must be properly translated.

**Scope:**
- Main orchestrator component: `ItemCreationWorkflow.tsx`
- Accessibility utilities: `accessibility.ts`
- Internal `StepPlaceholder` component
- Translation keys in `/messages/en.json`

**Out of Scope (handled by separate tasks):**
- Child components (WorkflowHeader, ConfirmExitDialog, etc.) - Task 2C.11, 2C.12
- Step components (RoomSelectionStep, etc.) - Tasks 2C.3-2C.10

---

## Prerequisites Checklist

Before starting implementation, verify:

- [ ] REQ-E02-056 (Create Workflow Namespace Structure) is complete
- [ ] `workflow` namespace exists in `/messages/en.json`
- [ ] `next-intl` package is installed and configured
- [ ] `useTranslations` hook is available from 'next-intl'
- [ ] Build passes without i18n-related errors

---

## Task Breakdown

### Task 1: Add useTranslations Hook Import and Initialization

**Task ID:** 2C.2.1
**Priority:** Critical
**Estimate:** 0.25 SP
**File:** `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

#### Description
Add the `useTranslations` hook from next-intl to the main ItemCreationWorkflow component.

#### Implementation Steps

1. **Add import statement** (Line ~37-38 area, after existing imports)
   ```typescript
   import { useTranslations } from 'next-intl';
   ```

2. **Initialize hook inside component** (Line ~131 area, at start of component body, before state declarations)
   ```typescript
   export function ItemCreationWorkflow({
     onSessionComplete,
     // ... other props
   }: ItemCreationWorkflowProps) {
     // Initialize translation hook for workflow namespace
     const t = useTranslations('workflow');

     // State management hook
     const {
       state,
       // ... rest of destructuring
     } = useWorkflowState();
   ```

#### Acceptance Criteria
- [ ] Import statement added at top of file with other imports
- [ ] `useTranslations('workflow')` hook called at component function scope (not inside callbacks)
- [ ] Hook is called before any state declarations
- [ ] No TypeScript errors after addition
- [ ] Component still renders without errors

#### Verification
```bash
npm run build
# Verify no TypeScript errors related to useTranslations
```

---

### Task 2: Update Skip Link Translation

**Task ID:** 2C.2.2
**Priority:** High
**Estimate:** 0.25 SP
**File:** `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

#### Description
Replace the hardcoded "Skip to main content" text with a translation key.

#### Current Code Location
Line 743-745:
```tsx
<a
  href="#main-content"
  className={cn(
    'sr-only focus:not-sr-only',
    'absolute top-4 left-4 z-50',
    'px-4 py-2 bg-[#FF385C] text-white rounded-lg',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF385C]'
  )}
>
  Skip to main content
</a>
```

#### Implementation Steps

1. **Replace hardcoded string** with translation call:
   ```tsx
   <a
     href="#main-content"
     className={cn(
       'sr-only focus:not-sr-only',
       'absolute top-4 left-4 z-50',
       'px-4 py-2 bg-[#FF385C] text-white rounded-lg',
       'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF385C]'
     )}
   >
     {t('accessibility.skipToContent')}
   </a>
   ```

#### Acceptance Criteria
- [ ] Skip link text uses `{t('accessibility.skipToContent')}`
- [ ] Translation key path: `workflow.accessibility.skipToContent`
- [ ] Skip link still functions for keyboard navigation
- [ ] No visual changes to the skip link when rendered

#### Verification
- Tab into the workflow page and verify skip link appears
- Verify text displays correctly in English

---

### Task 3: Update StepPlaceholder Component Props Interface

**Task ID:** 2C.2.3
**Priority:** Medium
**Estimate:** 0.25 SP
**File:** `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

#### Description
Update the internal `StepPlaceholder` component to accept the translation function as a prop.

#### Current Code Location
Lines 68-72:
```typescript
interface StepPlaceholderProps {
  step: string;
  onNext?: () => void;
  canNext?: boolean;
}
```

#### Implementation Steps

1. **Import the type for useTranslations return** (if needed):
   ```typescript
   // At top of file, the useTranslations type can be inferred
   ```

2. **Update the interface** to include translation function:
   ```typescript
   interface StepPlaceholderProps {
     step: string;
     onNext?: () => void;
     canNext?: boolean;
     t: (key: string) => string;  // Translation function
   }
   ```

3. **Update function signature** (Line 74):
   ```typescript
   function StepPlaceholder({ step, onNext, canNext, t }: StepPlaceholderProps) {
   ```

#### Acceptance Criteria
- [ ] `StepPlaceholderProps` interface includes `t` property
- [ ] `StepPlaceholder` function destructures `t` from props
- [ ] TypeScript compiles without errors

---

### Task 4: Update StepPlaceholder Hardcoded Strings

**Task ID:** 2C.2.4
**Priority:** Medium
**Estimate:** 0.25 SP
**File:** `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

#### Description
Replace hardcoded strings within the StepPlaceholder component with translation calls.

#### Current Code Location
Lines 81-106 (inside StepPlaceholder function):
```tsx
<p className="text-[#717171] mb-8">
  Step component placeholder - Implementation coming in later phases
</p>
// ...
<button ...>
  Continue (Test)
</button>
```

#### Implementation Steps

1. **Replace description text** (Line 87-89):
   ```tsx
   <p className="text-[#717171] mb-8">
     {t('placeholder.description')}
   </p>
   ```

2. **Replace button text** (Line 104-106):
   ```tsx
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
     {t('placeholder.continueTest')}
   </button>
   ```

#### Acceptance Criteria
- [ ] Description uses `{t('placeholder.description')}`
- [ ] Button uses `{t('placeholder.continueTest')}`
- [ ] No hardcoded English strings remain in StepPlaceholder
- [ ] Component renders correctly

---

### Task 5: Update StepPlaceholder Usage to Pass Translation Function

**Task ID:** 2C.2.5
**Priority:** Medium
**Estimate:** 0.25 SP
**File:** `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

#### Description
Update the usage of StepPlaceholder in the switch statement to pass the translation function.

#### Current Code Location
Line 728 (in renderCurrentStep):
```tsx
default:
  return <StepPlaceholder step={state.currentStep} {...commonProps} />;
```

#### Implementation Steps

1. **Update the default case** to pass `t`:
   ```tsx
   default:
     return <StepPlaceholder step={state.currentStep} {...commonProps} t={t} />;
   ```

#### Acceptance Criteria
- [ ] StepPlaceholder receives `t` prop in the default case
- [ ] No TypeScript errors about missing props
- [ ] Component renders when reaching default case

---

### Task 6: Create useTranslatedStepNames Hook

**Task ID:** 2C.2.6
**Priority:** High
**Estimate:** 1.0 SP
**File:** `/src/components/ItemCreationWorkflow/utils/accessibility.ts`

#### Description
Create a new hook that provides translated step names and step announcements for screen readers.

#### Implementation Steps

1. **Add import for useTranslations** at top of file (after line 18):
   ```typescript
   import { useTranslations } from 'next-intl';
   ```

2. **Create the new hook** (add after line 513, before the file ends):
   ```typescript
   // =============================================================================
   // useTranslatedStepNames Hook
   // =============================================================================

   /**
    * Hook to provide translated step names and announcements for accessibility.
    * Uses the workflow.accessibility namespace for all translations.
    *
    * @returns Object with translated step names and announcement function
    *
    * @example
    * const { stepNames, getStepAnnouncement } = useTranslatedStepNames();
    * const announcement = getStepAnnouncement(1, 8, 'room-selection');
    */
   export function useTranslatedStepNames(): {
     stepNames: Record<string, string>;
     getTranslatedStepAnnouncement: (
       currentStep: number,
       totalSteps: number,
       stepKey: string
     ) => string;
   } {
     const t = useTranslations('workflow.accessibility');

     const stepNames: Record<string, string> = {
       'room-selection': t('roomSelectionScreen'),
       'item-type-selection': t('itemTypeScreen'),
       'specific-item-selection': t('specificItemScreen'),
       'purpose-selection': t('purposeScreen'),
       'content-type-selection': t('contentTypeScreen'),
       'media-capture': t('mediaCaptureScreen'),
       'content-creation': t('contentCreationScreen'),
       'preview-save': t('previewSaveScreen'),
       'next-action': t('nextActionScreen'),
       'session-summary': t('sessionSummaryScreen'),
     };

     const getTranslatedStepAnnouncement = (
       currentStep: number,
       totalSteps: number,
       stepKey: string
     ): string => {
       const stepName = stepNames[stepKey] || stepKey;
       return t('stepAnnouncement', {
         current: currentStep,
         total: totalSteps,
         stepName: stepName
       });
     };

     return { stepNames, getTranslatedStepAnnouncement };
   }
   ```

3. **Update the existing `STEP_NAMES` constant comment** to note it's deprecated in favor of the hook:
   ```typescript
   /**
    * Step names for announcement purposes
    * Updated for REQ-176: Added media-capture step
    * @deprecated Use useTranslatedStepNames() hook for translated step names
    */
   export const STEP_NAMES: Record<string, string> = {
     // ... keep existing for backward compatibility
   };
   ```

#### Acceptance Criteria
- [ ] `useTranslatedStepNames` hook is exported from accessibility.ts
- [ ] Hook returns `stepNames` record and `getTranslatedStepAnnouncement` function
- [ ] Hook uses `useTranslations('workflow.accessibility')`
- [ ] Existing `STEP_NAMES` and `getStepAnnouncement` remain for backward compatibility
- [ ] TypeScript compiles without errors

---

### Task 7: Update ItemCreationWorkflow to Use Translated Accessibility

**Task ID:** 2C.2.7
**Priority:** High
**Estimate:** 0.5 SP
**File:** `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

#### Description
Update the ItemCreationWorkflow component to use the new `useTranslatedStepNames` hook for screen reader announcements.

#### Current Code Location
Line 56 (import):
```typescript
import { useAnnounce, STEP_NAMES, getStepAnnouncement } from './utils/accessibility';
```

Lines 221-234 (useEffect for announcements):
```typescript
useEffect(() => {
  if (previousStepRef.current !== state.currentStep) {
    const stepName = STEP_NAMES[state.currentStep] || state.currentStep;

    if (!isPostWorkflow) {
      const announcement = getStepAnnouncement(displayStepIndex + 1, displayTotalSteps, stepName);
      announce(announcement);
    } else {
      announce(stepName);
    }
    // ... focus management
  }
}, [state.currentStep, displayStepIndex, displayTotalSteps, isPostWorkflow, announce]);
```

#### Implementation Steps

1. **Update the import statement** (Line 56):
   ```typescript
   import { useAnnounce, useTranslatedStepNames } from './utils/accessibility';
   ```

2. **Add hook call** inside the component (after the `useTranslations` call, around line 132):
   ```typescript
   const t = useTranslations('workflow');
   const { stepNames, getTranslatedStepAnnouncement } = useTranslatedStepNames();
   ```

3. **Update the step announcement useEffect** (Lines 221-251):
   ```typescript
   // REQ-114: Announce step changes to screen readers and manage focus
   // REQ-199: Use display values for accurate step announcements
   // REQ-E02-057: Use translated step names for announcements
   useEffect(() => {
     // Only announce if step actually changed
     if (previousStepRef.current !== state.currentStep) {
       const stepName = stepNames[state.currentStep] || state.currentStep;

       // Only announce step numbers for user-visible steps
       // Post-workflow screens don't get step number announcements
       if (!isPostWorkflow) {
         const announcement = getTranslatedStepAnnouncement(
           displayStepIndex + 1,
           displayTotalSteps,
           state.currentStep
         );
         announce(announcement);
       } else {
         // For post-workflow, just announce the screen name
         announce(stepName);
       }

       // Focus main content area for keyboard navigation
       if (mainContentRef.current) {
         const heading = mainContentRef.current.querySelector('h2, h3, [role="heading"]');
         if (heading && heading instanceof HTMLElement) {
           if (!heading.hasAttribute('tabindex')) {
             heading.setAttribute('tabindex', '-1');
           }
           heading.focus();
         }
       }

       previousStepRef.current = state.currentStep;
     }
   }, [state.currentStep, displayStepIndex, displayTotalSteps, isPostWorkflow, announce, stepNames, getTranslatedStepAnnouncement]);
   ```

   **Note:** The dependency array must include `stepNames` and `getTranslatedStepAnnouncement`.

#### Acceptance Criteria
- [ ] Import updated to use `useTranslatedStepNames`
- [ ] Hook called at component level
- [ ] useEffect uses translated step names
- [ ] useEffect dependency array includes new values
- [ ] Screen reader announcements work correctly
- [ ] No ESLint warnings about missing dependencies

---

### Task 8: Add Translation Keys to messages/en.json

**Task ID:** 2C.2.8
**Priority:** Critical
**Estimate:** 0.5 SP
**File:** `/messages/en.json`

#### Description
Add all required translation keys for the ItemCreationWorkflow component to the English translation file.

#### Implementation Steps

1. **Verify `workflow` namespace exists** in en.json. If not, add it.

2. **Add the following keys** under the `workflow` namespace:
   ```json
   {
     "workflow": {
       "placeholder": {
         "description": "Step component placeholder - Implementation coming in later phases",
         "continueTest": "Continue (Test)"
       },
       "accessibility": {
         "skipToContent": "Skip to main content",
         "stepAnnouncement": "Step {current} of {total}: {stepName}",
         "roomSelectionScreen": "Select a room",
         "itemTypeScreen": "Choose item type",
         "specificItemScreen": "Name your item",
         "purposeScreen": "Select purpose",
         "contentTypeScreen": "Choose content type",
         "mediaCaptureScreen": "Capture content",
         "contentCreationScreen": "Create content",
         "previewSaveScreen": "Preview and save",
         "nextActionScreen": "Choose next action",
         "sessionSummaryScreen": "Session summary"
       }
     }
   }
   ```

3. **If `workflow` namespace already exists** from REQ-E02-056, merge the keys ensuring no overwrites of existing content.

#### JSON Structure After Update
```json
{
  "common": { ... },
  "auth": { ... },
  "dashboard": { ... },
  "items": { ... },
  "errors": { ... },
  "language": { ... },
  "workflow": {
    "placeholder": {
      "description": "Step component placeholder - Implementation coming in later phases",
      "continueTest": "Continue (Test)"
    },
    "accessibility": {
      "skipToContent": "Skip to main content",
      "stepAnnouncement": "Step {current} of {total}: {stepName}",
      "roomSelectionScreen": "Select a room",
      "itemTypeScreen": "Choose item type",
      "specificItemScreen": "Name your item",
      "purposeScreen": "Select purpose",
      "contentTypeScreen": "Choose content type",
      "mediaCaptureScreen": "Capture content",
      "contentCreationScreen": "Create content",
      "previewSaveScreen": "Preview and save",
      "nextActionScreen": "Choose next action",
      "sessionSummaryScreen": "Session summary"
    }
  }
}
```

#### Acceptance Criteria
- [ ] All keys exist in `/messages/en.json`
- [ ] JSON is valid (no syntax errors)
- [ ] ICU format used for `stepAnnouncement` with `{current}`, `{total}`, `{stepName}` placeholders
- [ ] Keys follow namespace.component.element pattern
- [ ] Build completes without missing translation warnings

#### Verification
```bash
# Validate JSON syntax
cat messages/en.json | python -m json.tool > /dev/null && echo "Valid JSON"

# Build to check for missing translations
npm run build
```

---

### Task 9: Verify Export of New Hook

**Task ID:** 2C.2.9
**Priority:** Medium
**Estimate:** 0.25 SP
**File:** `/src/components/ItemCreationWorkflow/utils/accessibility.ts`

#### Description
Ensure the new `useTranslatedStepNames` hook is properly exported and available for import.

#### Implementation Steps

1. **Verify the hook is exported** (should be done in Task 6, but verify):
   ```typescript
   export function useTranslatedStepNames(): { ... }
   ```

2. **Check if there's a barrel export file** (e.g., `utils/index.ts`). If so, add the export:
   ```typescript
   export { useTranslatedStepNames } from './accessibility';
   ```

#### Acceptance Criteria
- [ ] Hook can be imported from './utils/accessibility'
- [ ] No circular dependency issues
- [ ] TypeScript recognizes the export

---

### Task 10: Build Verification and Testing

**Task ID:** 2C.2.10
**Priority:** Critical
**Estimate:** 0.5 SP

#### Description
Verify the implementation works correctly through build and runtime testing.

#### Implementation Steps

1. **Run TypeScript compilation**:
   ```bash
   npx tsc --noEmit
   ```

2. **Run build**:
   ```bash
   npm run build
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Manual Testing Checklist**:
   - [ ] Navigate to item creation workflow
   - [ ] Verify skip link displays "Skip to main content"
   - [ ] Use Tab key to verify skip link appears and functions
   - [ ] Open browser DevTools Console, verify no translation errors
   - [ ] Navigate through workflow steps
   - [ ] If reaching a placeholder step, verify placeholder text displays

5. **Screen Reader Testing** (if available):
   - [ ] Enable VoiceOver (Mac) or NVDA (Windows)
   - [ ] Navigate workflow
   - [ ] Verify step announcements are read correctly
   - [ ] Verify format: "Step 1 of 8: Select a room"

#### Acceptance Criteria
- [ ] Build completes without errors
- [ ] No console errors related to translations
- [ ] Skip link text renders correctly
- [ ] Step announcements work (if testable)
- [ ] No TypeScript errors

---

## Task Dependency Graph

```
Task 1 (Import hook)
    ↓
Task 2 (Skip link) ──────────────────────┐
    ↓                                     │
Task 3 (StepPlaceholder interface)        │
    ↓                                     │
Task 4 (StepPlaceholder strings)          │
    ↓                                     │
Task 5 (Pass t to StepPlaceholder)        │
    │                                     │
    └────────────────────────────────────→ Task 8 (Translation keys)
                                          │
Task 6 (useTranslatedStepNames hook) ────→│
    ↓                                     │
Task 7 (Use translated accessibility) ───→│
    ↓                                     │
Task 9 (Verify exports)                   │
    ↓                                     │
Task 10 (Build & Test) ←──────────────────┘
```

**Parallel Execution Opportunities:**
- Tasks 2, 3-5, and 6 can be done in parallel after Task 1
- Task 8 should be done early as other tasks depend on the keys existing
- Task 10 must be last

---

## Files Modified Summary

| File | Modification Type |
|------|-------------------|
| `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Add hook, update strings |
| `/src/components/ItemCreationWorkflow/utils/accessibility.ts` | Add new hook |
| `/messages/en.json` | Add translation keys |

## Functions Modified Summary

| Function/Component | File | Change |
|-------------------|------|--------|
| `ItemCreationWorkflow` | ItemCreationWorkflow.tsx | Add useTranslations hook, use translated accessibility |
| `StepPlaceholder` | ItemCreationWorkflow.tsx | Accept t prop, use translation keys |
| `useTranslatedStepNames` | accessibility.ts | NEW - Provides translated step names |
| Step announcement useEffect | ItemCreationWorkflow.tsx | Use translated functions |

---

## Rollback Plan

If issues are discovered after implementation:

1. **Revert import changes** - Remove useTranslations imports
2. **Revert to STEP_NAMES constant** - The original constant is preserved
3. **Remove StepPlaceholder t prop** - Revert to hardcoded strings
4. **Keep translation keys** - They don't cause harm if unused

---

## Acceptance Criteria Summary

From REQ-E02-057:

- [ ] ItemCreationWorkflow component imports and initializes useTranslations hook for workflow namespace
- [ ] All aria-labels and accessibility strings use translation keys
- [ ] Screen reader announcements for step changes use translated strings
- [ ] All hardcoded English strings removed from component
- [ ] Translation keys follow established naming conventions
- [ ] Variable interpolation correctly handles step numbers, counts, and dynamic values
- [ ] Component properly handles missing translations with fallback behavior
- [ ] Translation hook initialized at appropriate component scope (not re-initialized on every render)
- [ ] No translation errors logged in console during normal workflow operation
- [ ] TypeScript types remain consistent after translation implementation
- [ ] No runtime errors introduced by translation refactoring
- [ ] Component maintains existing functionality while using translated strings

---

## Notes for Implementation Agent

1. **Client Component Compatibility**: The component is marked `'use client'`, which works with `useTranslations` hook.

2. **StepPlaceholder is Temporary**: This component is a fallback for unimplemented steps. Most steps have real implementations. Translating it is for consistency.

3. **Accessibility is Critical**: The step announcements are essential for screen reader users. Test thoroughly.

4. **Preserve Backward Compatibility**: Keep `STEP_NAMES` and `getStepAnnouncement` in accessibility.ts for any other components that might use them.

5. **Hook Location**: Initialize hooks at the top of the component function, before any state or other hook calls (except other hooks).

6. **Dependency Arrays**: Ensure useEffect dependencies include the new values from the translated hook.

7. **ICU Message Format**: The `stepAnnouncement` key uses ICU format: `{current}`, `{total}`, `{stepName}`.

---

## References

- [Overview Document](./REQ-E02-057-update-main-itemcreationworkflow-component-overview.md)
- [Implementation Plan](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Documentation](./gen_requests_epic2.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2C: Item Creation Workflow*
*Task 2C.2: Update main ItemCreationWorkflow component*
