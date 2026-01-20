# Implementation Breakdown: REQ-E02-057 - Update Main ItemCreationWorkflow Component

**Document Version:** 1.0
**Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E02-057
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.2
**Estimated Size:** M (Medium)

---

## Overview

This document provides the implementation breakdown for updating the main `ItemCreationWorkflow` component to use the i18n translation system. This component is the orchestrator for the entire multi-step item creation workflow, managing step navigation, state, and integration with child components.

The ItemCreationWorkflow component contains:
- Workflow-level UI strings (skip link, step placeholder text)
- Accessibility announcements and screen reader text
- Integration with WorkflowHeader, ConfirmExitDialog, and other shared components
- Step transition coordination and state management

**Note:** This task focuses on the main orchestrator component. Child components (WorkflowHeader, ConfirmExitDialog, step components, etc.) will be updated in subsequent tasks (2C.3-2C.14).

---

## Dependencies

### Prerequisites (Epic 1 Foundation)
| Dependency | Location | Status |
|------------|----------|--------|
| next-intl package | `package.json` | Required |
| i18n config | `/src/lib/i18n/config.ts` | Complete |
| Translation files | `/messages/en.json` | Complete (base structure exists) |
| useTranslations hook | next-intl | Available |
| getTranslations | next-intl/server | Available |

### Prerequisites (Epic 2 - Prior Tasks)
| Dependency | Task | Status |
|------------|------|--------|
| `workflow` namespace structure | REQ-E02-056 (Task 2C.1) | Required - Must be complete |

### Existing Patterns to Follow
- Translation file structure in `/messages/en.json` (common, auth, dashboard, workflow namespaces)
- Key naming convention: `{namespace}.{component/area}.{element}.{variant?}`
- ICU message format for pluralization
- Client component pattern using `useTranslations` hook

---

## Technical Context

### Current State Analysis

The `ItemCreationWorkflow.tsx` component (located at `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`) is a client component (`'use client'`) that serves as the main orchestrator for the item creation workflow.

#### Identified Hardcoded Strings in ItemCreationWorkflow.tsx

| Location | Current String | Translation Key |
|----------|----------------|-----------------|
| Line 743-744 | `"Skip to main content"` | `workflow.accessibility.skipToContent` |
| Line 85 | `"{formattedStepName}"` (dynamic step name display in StepPlaceholder) | N/A - Dynamic |
| Line 88 | `"Step component placeholder - Implementation coming in later phases"` | `workflow.placeholder.description` |
| Line 105 | `"Continue (Test)"` | `workflow.placeholder.continueTest` |

#### Strings in Imported Child Components (Reference Only)

These strings are handled by separate tasks:

| Component | Strings | Task |
|-----------|---------|------|
| WorkflowHeader | "Step X of Y", "Go back to previous step", "Exit workflow" | 2C.11 (Shared Components) |
| ConfirmExitDialog | "Exit Workflow?", "Cancel", "Exit Workflow" button, dynamic messages | 2C.12 (Dialog Components) |
| SessionRecoveryBanner | Recovery messages | 2C.11 (Shared Components) |
| PrintOptionsPanel | Print options | 2C.11 (Shared Components) |

#### Accessibility Utilities (accessibility.ts)

The `STEP_NAMES` constant and `getStepAnnouncement` function contain translatable strings:

| Item | Current Value | Translation Key |
|------|---------------|-----------------|
| `STEP_NAMES['room-selection']` | `"Select a room"` | `workflow.accessibility.roomSelectionScreen` |
| `STEP_NAMES['item-type-selection']` | `"Choose item type"` | `workflow.accessibility.itemTypeScreen` |
| `STEP_NAMES['specific-item-selection']` | `"Name your item"` | `workflow.accessibility.specificItemScreen` |
| `STEP_NAMES['purpose-selection']` | `"Select purpose"` | `workflow.accessibility.purposeScreen` |
| `STEP_NAMES['content-type-selection']` | `"Choose content type"` | `workflow.accessibility.contentTypeScreen` |
| `STEP_NAMES['media-capture']` | `"Capture content"` | `workflow.accessibility.mediaCaptureScreen` |
| `STEP_NAMES['content-creation']` | `"Create content"` | `workflow.accessibility.contentCreationScreen` |
| `STEP_NAMES['preview-save']` | `"Preview and save"` | `workflow.accessibility.previewSaveScreen` |
| `STEP_NAMES['next-action']` | `"Choose next action"` | `workflow.accessibility.nextActionScreen` |
| `STEP_NAMES['session-summary']` | `"Session summary"` | `workflow.accessibility.sessionSummaryScreen` |
| `getStepAnnouncement` output | `"Step {currentStep} of {totalSteps}: {stepName}"` | `workflow.accessibility.stepAnnouncement` |

### Component Integration Points

```
ItemCreationWorkflow.tsx
├── imports useAnnounce, STEP_NAMES, getStepAnnouncement from ./utils/accessibility
├── imports WorkflowHeader from ./components/shared
├── imports ConfirmExitDialog from ./components/shared
├── imports SessionRecoveryBanner from ./components/shared
├── imports PrintOptionsPanel from ./components/shared
├── imports ItemContextDisplay from ./components/shared
├── contains StepPlaceholder internal component
└── renders skip link for keyboard navigation
```

---

## Implementation Tasks

### Task 1: Add useTranslations Hook to ItemCreationWorkflow Component
**Priority:** Critical
**Estimate:** 0.5 story points

Add the `useTranslations` hook import and initialization at the component level.

**Implementation:**
```typescript
// Add import at top of file
import { useTranslations } from 'next-intl';

// Inside ItemCreationWorkflow component, before state declarations
export function ItemCreationWorkflow({...props}: ItemCreationWorkflowProps) {
  const t = useTranslations('workflow');

  // ... rest of component
}
```

**Acceptance Criteria:**
- [ ] Import statement added for useTranslations from 'next-intl'
- [ ] Hook initialized at component scope with 'workflow' namespace
- [ ] No re-initialization on every render (hook called at component level, not in callbacks)

### Task 2: Update Skip Link Translation
**Priority:** High
**Estimate:** 0.25 story points

Replace the hardcoded skip link text with translation key.

**Current Code (Line 743-744):**
```tsx
<a href="#main-content" className={...}>
  Skip to main content
</a>
```

**Updated Code:**
```tsx
<a href="#main-content" className={...}>
  {t('accessibility.skipToContent')}
</a>
```

**Acceptance Criteria:**
- [ ] Skip link text uses translation key
- [ ] Translation key `workflow.accessibility.skipToContent` defined in messages file
- [ ] Skip link maintains proper accessibility functionality

### Task 3: Update StepPlaceholder Component
**Priority:** Medium
**Estimate:** 0.5 story points

The internal `StepPlaceholder` component needs translation support. Since it's defined within the same file, it can share the parent's translation function via props or use its own hook.

**Current Code (Lines 68-111):**
```tsx
function StepPlaceholder({ step, onNext, canNext }: StepPlaceholderProps) {
  // ...
  return (
    <div className="...">
      <div className="text-center">
        <h2 className="...">{formattedStepName}</h2>
        <p className="...">
          Step component placeholder - Implementation coming in later phases
        </p>
        {onNext && (
          <button type="button" ...>
            Continue (Test)
          </button>
        )}
      </div>
    </div>
  );
}
```

**Updated Code:**
```tsx
interface StepPlaceholderProps {
  step: string;
  onNext?: () => void;
  canNext?: boolean;
  t: ReturnType<typeof useTranslations>; // Add translation function prop
}

function StepPlaceholder({ step, onNext, canNext, t }: StepPlaceholderProps) {
  const formattedStepName = step
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="...">
      <div className="text-center">
        <h2 className="...">{formattedStepName}</h2>
        <p className="...">
          {t('placeholder.description')}
        </p>
        {onNext && (
          <button type="button" ...>
            {t('placeholder.continueTest')}
          </button>
        )}
      </div>
    </div>
  );
}
```

**Alternative Approach (Recommended):**
Since StepPlaceholder is a temporary component for testing, and most steps now have real implementations, consider simply passing `t` function as a prop to avoid adding another hook call.

**Acceptance Criteria:**
- [ ] StepPlaceholder receives translation function via props
- [ ] Description text uses translation key `workflow.placeholder.description`
- [ ] Continue button uses translation key `workflow.placeholder.continueTest`
- [ ] All usages of StepPlaceholder pass the `t` function

### Task 4: Create Translated Accessibility Hook/Function
**Priority:** High
**Estimate:** 1 story point

The `getStepAnnouncement` function and `STEP_NAMES` constant in `accessibility.ts` need to support translations. This requires creating a new hook or modifying the existing utilities.

**Option A: Create useTranslatedStepNames Hook**
Create a new hook that provides translated step names:

```typescript
// In /src/components/ItemCreationWorkflow/utils/accessibility.ts or new file

export function useTranslatedStepNames() {
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

  const getStepAnnouncement = (
    currentStep: number,
    totalSteps: number,
    stepKey: string
  ): string => {
    const stepName = stepNames[stepKey] || stepKey;
    return t('stepAnnouncement', { current: currentStep, total: totalSteps, stepName });
  };

  return { stepNames, getStepAnnouncement };
}
```

**Option B: Pass Translation Function to Existing Functions**
Modify the existing functions to accept a translation function parameter.

**Acceptance Criteria:**
- [ ] Step names are translatable via translation keys
- [ ] Step announcement uses ICU format with variable interpolation
- [ ] Screen reader announcements work correctly in all languages
- [ ] Existing functionality preserved (step changes still announced)

### Task 5: Update ItemCreationWorkflow to Use Translated Accessibility
**Priority:** High
**Estimate:** 0.5 story points

Update the component to use the translated accessibility utilities.

**Current Code (Lines 219-234):**
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

**Updated Code:**
```typescript
// At component level
const { stepNames, getStepAnnouncement: getTranslatedAnnouncement } = useTranslatedStepNames();

useEffect(() => {
  if (previousStepRef.current !== state.currentStep) {
    const stepName = stepNames[state.currentStep] || state.currentStep;

    if (!isPostWorkflow) {
      const announcement = getTranslatedAnnouncement(displayStepIndex + 1, displayTotalSteps, state.currentStep);
      announce(announcement);
    } else {
      announce(stepName);
    }
    // ... focus management
  }
}, [state.currentStep, displayStepIndex, displayTotalSteps, isPostWorkflow, announce, stepNames, getTranslatedAnnouncement]);
```

**Acceptance Criteria:**
- [ ] Step announcements use translated step names
- [ ] Post-workflow screen announcements use translated names
- [ ] useEffect dependencies updated to include translated values
- [ ] No missing translation warnings in console

### Task 6: Ensure Translation Keys Exist in Messages File
**Priority:** Critical
**Estimate:** 0.25 story points

Verify that all required translation keys exist in `/messages/en.json` under the `workflow` namespace. These should have been added in REQ-E02-056, but verify and add any missing keys.

**Required Keys:**
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

**Acceptance Criteria:**
- [ ] All required keys exist in `/messages/en.json`
- [ ] Keys follow ICU message format for variables
- [ ] JSON file validates without syntax errors
- [ ] Build completes without missing translation warnings

---

## Authorized Files and Functions for Modification

### Primary Files to Modify

| File | Purpose | Modification Type |
|------|---------|-------------------|
| `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Main workflow component | Add useTranslations hook, update strings |
| `/src/components/ItemCreationWorkflow/utils/accessibility.ts` | Accessibility utilities | Add translated step names hook/function |
| `/messages/en.json` | English translations | Add/verify workflow.placeholder and workflow.accessibility keys |

### Functions to Modify

| Function | File | Modification |
|----------|------|--------------|
| `ItemCreationWorkflow` | ItemCreationWorkflow.tsx | Add `useTranslations` hook, pass `t` to StepPlaceholder |
| `StepPlaceholder` | ItemCreationWorkflow.tsx | Accept `t` prop, use translation keys for strings |
| `getStepAnnouncement` | accessibility.ts | Create translated version or modify to accept translation function |
| Step change useEffect | ItemCreationWorkflow.tsx | Use translated step names for announcements |

### Files for Reference Only (Not Modified in This Task)

| File | Purpose |
|------|---------|
| `/src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx` | Updated in Task 2C.11 |
| `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` | Updated in Task 2C.12 |
| `/src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx` | Updated in Task 2C.11 |
| `/src/components/ItemCreationWorkflow/components/shared/PrintOptionsPanel.tsx` | Updated in Task 2C.11 |
| `/src/lib/i18n/config.ts` | i18n configuration (read-only reference) |

---

## Verification Steps

### 1. Build Verification
```bash
npm run build
```
- Verify no TypeScript errors related to translation types
- Verify no missing translation key warnings

### 2. Runtime Verification
- Start development server: `npm run dev`
- Navigate to item creation workflow
- Open browser console, verify no translation-related errors
- Verify skip link shows translated text

### 3. Accessibility Testing
- Use screen reader (VoiceOver/NVDA) to navigate workflow
- Verify step announcements are spoken correctly
- Verify language switching updates announcements

### 4. Language Switching Test
- Change browser language or use language switcher (if available)
- Verify all workflow-level strings update
- Verify no mixed-language content

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing dependency on REQ-E02-056 | Medium | High | Verify workflow namespace exists before starting |
| Accessibility announcements not updating | Medium | Medium | Test with actual screen reader, not just console |
| StepPlaceholder prop drilling complexity | Low | Low | Keep simple prop passing; StepPlaceholder is temporary |
| useEffect dependency warnings | Medium | Low | Carefully update dependency arrays |
| Translation key mismatch | Low | Medium | Use TypeScript for key references where possible |

---

## Notes for Implementation

### 1. Client Component Requirement
The `ItemCreationWorkflow` component is marked with `'use client'`, which is compatible with the `useTranslations` hook from next-intl. No changes needed for server/client boundary.

### 2. StepPlaceholder is Temporary
The `StepPlaceholder` component is a temporary implementation for testing. Most workflow steps now have real implementations. Consider if these translations are even needed long-term, but translate anyway for consistency.

### 3. Accessibility is Critical
The `getStepAnnouncement` function and `STEP_NAMES` constant are used for screen reader announcements. These translations directly impact accessibility for non-English speaking users with visual impairments. Test thoroughly.

### 4. Hook Initialization Location
Initialize `useTranslations` at the component function level (not inside callbacks or effects) to comply with React's Rules of Hooks and ensure stable references.

### 5. Coordination with Child Component Tasks
This task focuses only on the main `ItemCreationWorkflow.tsx` file and its direct utilities. The child components (WorkflowHeader, ConfirmExitDialog, etc.) have their own tasks:
- Task 2C.11: Update all shared components (25+ files)
- Task 2C.12: Update all dialog components

---

## Acceptance Criteria Summary

From the request document (REQ-E02-057):

- [ ] ItemCreationWorkflow component imports and initializes useTranslations hook for workflow namespace
- [ ] All aria-labels and accessibility strings use translation keys
- [ ] Screen reader announcements for step changes use translated strings
- [ ] All hardcoded English strings removed from component
- [ ] Translation keys follow established naming conventions
- [ ] Variable interpolation correctly handles step numbers, counts, and dynamic values
- [ ] Component properly handles missing translations with fallback behavior
- [ ] Translation hook initialized at appropriate component scope (not re-initialized on every render)
- [ ] No translation errors logged in console during normal workflow operation
- [ ] Component successfully renders in all five non-English languages
- [ ] Language switching during active workflow session updates all visible text
- [ ] TypeScript types remain consistent after translation implementation
- [ ] No runtime errors introduced by translation refactoring
- [ ] Component maintains existing functionality while using translated strings

**Note:** Several acceptance criteria in the original request (workflow title/header, cancel button, back/next buttons, etc.) are handled by child components updated in separate tasks (2C.11, 2C.12).

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [REQ-E02-056: Create Workflow Namespace Structure](/docs/REQ-E02-056-create-workflow-namespace-structure-overview.md)
- [Request Documentation](/docs/gen_requests_epic2.md#REQ-E02-057)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2C: Item Creation Workflow*
