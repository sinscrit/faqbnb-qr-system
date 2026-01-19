# REQ-372: Update Main ItemCreationWorkflow Component for Internationalization

**Last Modified:** 2026-01-19 18:45:00 UTC
**Document Type:** Implementation Overview
**Epic:** Epic 2 - Static UI Localization
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.2
**Size:** L (Large)
**Priority:** P1 - High

---

## 1. Summary

This document provides the implementation breakdown for internationalizing the main `ItemCreationWorkflow.tsx` component. The component serves as the primary orchestrator for the multi-step item creation workflow and contains numerous hardcoded English strings that must be replaced with translation keys from the `workflow` namespace using next-intl's `useTranslations` hook.

The ItemCreationWorkflow component is the largest and most critical component in the workflow system, managing:
- 8 user-visible steps and 2 post-workflow screens
- Step navigation and state management
- Session recovery
- Print options
- Exit confirmation dialogs
- Accessibility announcements

---

## 2. Current State Analysis

### 2.1 Component Overview

**File:** `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
**Lines:** ~814
**Type:** Client Component ('use client')

The component currently contains hardcoded English strings in the following areas:

| Area | Estimated Strings | Description |
|------|-------------------|-------------|
| StepPlaceholder | ~3 | Step title, description, button text |
| Accessibility announcements | ~10 | STEP_NAMES mapping, screen reader text |
| Skip link | ~1 | "Skip to main content" |
| Print status messages | ~2 | "Generating PDF...", "Sending to printer..." |
| Console/debug messages | ~5 | Developer-facing (not translated) |

### 2.2 Dependency Chain

The component imports accessibility constants from:
- `/src/components/ItemCreationWorkflow/utils/accessibility.ts` - Contains `STEP_NAMES` with hardcoded English step names

The component also imports constants from:
- `/src/components/ItemCreationWorkflow/utils/constants.ts` - Contains various labels and descriptions that will be addressed in separate tasks

### 2.3 Related Files

The following shared components imported by ItemCreationWorkflow also need translation (covered by Task 2C.11):
- `WorkflowHeader.tsx` - Contains hardcoded aria-labels and step counter text
- `ConfirmExitDialog.tsx` - Contains dialog text
- `PrintOptionsPanel.tsx` - Contains print option text
- `SessionRecoveryBanner.tsx` - Contains recovery messages

---

## 3. Implementation Requirements

### 3.1 Translation Keys to Add

The following keys should be added to `/messages/en.json` under the `workflow` namespace:

```json
{
  "workflow": {
    "header": {
      "step": "Step {current} of {total}",
      "back": "Go back to previous step",
      "exit": "Exit workflow"
    },
    "skipLink": "Skip to main content",
    "placeholder": {
      "title": "{stepName}",
      "description": "Step component placeholder - Implementation coming in later phases",
      "continueButton": "Continue (Test)"
    },
    "status": {
      "generatingPdf": "Generating PDF...",
      "sendingToPrinter": "Sending to printer..."
    },
    "steps": {
      "roomSelection": "Select a room",
      "itemTypeSelection": "Choose item type",
      "specificItemSelection": "Name your item",
      "purposeSelection": "Select purpose",
      "contentTypeSelection": "Choose content type",
      "mediaCapture": "Capture content",
      "contentCreation": "Create content",
      "previewSave": "Preview and save",
      "nextAction": "Choose next action",
      "sessionSummary": "Session summary"
    },
    "announcements": {
      "stepProgress": "Step {current} of {total}: {stepName}"
    }
  }
}
```

### 3.2 Component Modifications

#### 3.2.1 Add useTranslations Import and Hook

```typescript
// Add import at top of file
import { useTranslations } from 'next-intl';

// Inside ItemCreationWorkflow component
export function ItemCreationWorkflow({ ... }) {
  const t = useTranslations('workflow');
  // ...rest of component
}
```

#### 3.2.2 Update StepPlaceholder Component

The internal `StepPlaceholder` component needs to accept translations:

```typescript
interface StepPlaceholderProps {
  step: string;
  onNext?: () => void;
  canNext?: boolean;
  t: (key: string, params?: Record<string, unknown>) => string;
}

function StepPlaceholder({ step, onNext, canNext, t }: StepPlaceholderProps) {
  const formattedStepName = step
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="flex flex-col items-center justify-center flex-1 p-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-[#222222] mb-2">
          {formattedStepName}
        </h2>
        <p className="text-[#717171] mb-8">
          {t('placeholder.description')}
        </p>
        {onNext && (
          <button ...>
            {t('placeholder.continueButton')}
          </button>
        )}
      </div>
    </div>
  );
}
```

#### 3.2.3 Update Skip Link

```typescript
<a
  href="#main-content"
  className={cn(
    'sr-only focus:not-sr-only',
    // ...existing styles
  )}
>
  {t('skipLink')}
</a>
```

#### 3.2.4 Update Print Status Messages

```typescript
setPrintStatus(t('status.generatingPdf'));
// ...
setPrintStatus(t('status.sendingToPrinter'));
```

#### 3.2.5 Update Accessibility Announcements

The `getStepAnnouncement` function call needs to use translated step names. This requires either:
- Option A: Pass the `t` function to the announcement logic
- Option B: Create a translated STEP_NAMES mapping using the `t` function

**Recommended Approach (Option B):**

```typescript
// Create translated step names within component
const translatedStepNames = useMemo(() => ({
  'room-selection': t('steps.roomSelection'),
  'item-type-selection': t('steps.itemTypeSelection'),
  'specific-item-selection': t('steps.specificItemSelection'),
  'purpose-selection': t('steps.purposeSelection'),
  'content-type-selection': t('steps.contentTypeSelection'),
  'media-capture': t('steps.mediaCapture'),
  'content-creation': t('steps.contentCreation'),
  'preview-save': t('steps.previewSave'),
  'next-action': t('steps.nextAction'),
  'session-summary': t('steps.sessionSummary'),
}), [t]);
```

Then update the announcement effect:

```typescript
useEffect(() => {
  if (previousStepRef.current !== state.currentStep) {
    const stepName = translatedStepNames[state.currentStep] || state.currentStep;

    if (!isPostWorkflow) {
      const announcement = t('announcements.stepProgress', {
        current: displayStepIndex + 1,
        total: displayTotalSteps,
        stepName
      });
      announce(announcement);
    } else {
      announce(stepName);
    }
    // ...
  }
}, [state.currentStep, displayStepIndex, displayTotalSteps, isPostWorkflow, announce, translatedStepNames, t]);
```

---

## 4. Authorized Files and Functions for Modification

### 4.1 Primary Files

| File Path | Modification Type | Description |
|-----------|------------------|-------------|
| `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | MODIFY | Add useTranslations hook, replace hardcoded strings |
| `/messages/en.json` | MODIFY | Add workflow namespace translations |
| `/messages/fr.json` | MODIFY | Add French translations |
| `/messages/es.json` | MODIFY | Add Spanish translations |
| `/messages/de.json` | MODIFY | Add German translations |
| `/messages/nl.json` | MODIFY | Add Dutch translations |
| `/messages/it.json` | MODIFY | Add Italian translations |

### 4.2 Functions to Modify

| Function/Component | File | Changes Required |
|-------------------|------|------------------|
| `StepPlaceholder` | ItemCreationWorkflow.tsx | Accept `t` prop, use translation keys |
| `ItemCreationWorkflow` | ItemCreationWorkflow.tsx | Add useTranslations hook, pass `t` to StepPlaceholder |
| Step announcement effect | ItemCreationWorkflow.tsx | Use translated step names |
| `handleGeneratePDFFromPanel` | ItemCreationWorkflow.tsx | Use translated status message |
| `handlePrintDirectFromPanel` | ItemCreationWorkflow.tsx | Use translated status message |

### 4.3 Out of Scope (Covered by Other Tasks)

| File | Covered By |
|------|------------|
| `/src/components/ItemCreationWorkflow/utils/accessibility.ts` (STEP_NAMES) | Task 2C.11 or separate accessibility task |
| `/src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx` | Task 2C.11 |
| `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` | Task 2C.12 |
| `/src/components/ItemCreationWorkflow/utils/constants.ts` | Task 2C.1 (namespace creation) |

---

## 5. Testing Requirements

### 5.1 Unit Tests

- [ ] Component renders without errors when useTranslations is initialized
- [ ] StepPlaceholder displays translated text correctly
- [ ] Skip link shows translated text
- [ ] Print status messages use translation keys

### 5.2 Integration Tests

- [ ] Workflow navigation works correctly with translated button labels
- [ ] Accessibility announcements use translated step names
- [ ] Language switching mid-workflow updates all visible text
- [ ] Session state management remains unaffected by translation changes

### 5.3 Manual Testing

- [ ] Test complete workflow in all 6 languages (en, fr, es, de, nl, it)
- [ ] Verify no console warnings for missing translation keys
- [ ] Verify layout remains correct with longer translated strings (German, Dutch)
- [ ] Verify screen reader announces steps correctly in all languages

---

## 6. Dependencies

### 6.1 Prerequisites

| Dependency | Status | Notes |
|------------|--------|-------|
| Epic 1 Foundation | ✅ Complete | next-intl installed and configured |
| IntlProvider in layout | ✅ Complete | Provider wraps application |
| Translation files exist | ✅ Complete | messages/*.json files present |
| Task 2C.1 (workflow namespace) | Required | Must be complete before this task |

### 6.2 Blocked By

- Task 2C.1: Create `workflow` namespace structure in `/messages/en.json`

### 6.3 Blocks

- Task 2C.14: Test complete workflow in each language (depends on all workflow components being translated)

---

## 7. Implementation Notes

### 7.1 Client Component Consideration

The `ItemCreationWorkflow` component is marked as `'use client'` which is required for:
- Using `useTranslations` hook from next-intl
- Managing state with useState and useCallback hooks
- Using browser APIs (document, window)

This aligns with the next-intl pattern for client components.

### 7.2 Dynamic Step Names

The step names need to be derived at render time from the `t` function, not from static constants. The existing `STEP_NAMES` constant in `accessibility.ts` should either:
1. Be deprecated in favor of translations (recommended)
2. Be kept for fallback purposes

### 7.3 Performance Consideration

The `translatedStepNames` object should be memoized with `useMemo` to prevent unnecessary re-computation on every render.

### 7.4 Fallback Behavior

If a translation key is missing, next-intl will:
1. Log a warning to the console in development
2. Fall back to the key path (e.g., "workflow.steps.roomSelection")

The component should gracefully handle missing translations without crashing.

---

## 8. Acceptance Criteria

From REQ-372:

- [ ] The ItemCreationWorkflow component imports the useTranslations hook from next-intl
- [ ] The workflow namespace is loaded using useTranslations('workflow')
- [ ] All step title strings use translation keys from the workflow.steps subsection
- [ ] Progress indicators showing item counts use translated strings with dynamic number interpolation
- [ ] All navigation button labels use workflow.buttons translation keys
- [ ] Session status messages use workflow.messages translation keys
- [ ] No hardcoded English strings remain in the component's JSX or logic
- [ ] Dynamic content properly uses next-intl's plural rules and variable substitution
- [ ] The component functions identically in all six supported languages
- [ ] Changing language preference mid-workflow updates all visible text without disrupting state
- [ ] All ARIA labels and accessibility attributes use translated strings
- [ ] The component gracefully handles missing translation keys without crashing
- [ ] Console shows no missing translation warnings when workflow is viewed in English
- [ ] TypeScript types correctly reflect the translation key structure for type-safe t() calls
- [ ] Manual testing confirms workflow completion in all six languages produces correct results

---

## 9. Estimated Effort

| Activity | Estimate |
|----------|----------|
| Code modifications | 2-3 hours |
| Translation key additions (all 6 languages) | 1-2 hours |
| Unit/integration test updates | 1-2 hours |
| Manual testing across languages | 1-2 hours |
| **Total** | **5-9 hours** |

---

## 10. References

- [Implementation Plan: Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [REQ-372 Request](/docs/gen_requests_epic2.md) - Line 2691
- [next-intl Client Components](https://next-intl-docs.vercel.app/docs/environments/server-client-components)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [ItemCreationWorkflow Component](/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx)

---

*Document generated for FAQBNB Localization Epic 2 - Task 2C.2*
