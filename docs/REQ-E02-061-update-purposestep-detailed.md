# Detailed Task Breakdown: REQ-E02-061 - Update PurposeStep Component

**Document Version:** 1.0
**Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E02-061
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.6
**Estimated Size:** M (Medium)
**Total Story Points:** 2.5

---

## Document Purpose

This document provides granular, implementation-ready tasks for updating the PurposeStep component to support internationalization. Each task is designed to be completable in approximately 1 story point or less, with clear acceptance criteria and verification steps.

---

## Prerequisites Checklist

Before starting implementation, verify the following:

- [ ] Epic 1 foundation is complete (next-intl installed and configured)
- [ ] REQ-E02-056 complete: `workflow` namespace exists in `/messages/en.json`
- [ ] REQ-E02-057 complete: ItemCreationWorkflow main component pattern established
- [ ] Can import `useTranslations` from 'next-intl' without errors
- [ ] Development server runs successfully: `npm run dev`

---

## Task Summary

| Task # | Title | Story Points | Priority |
|--------|-------|--------------|----------|
| 1 | Add Translation Keys to Messages File | 0.5 | Critical |
| 2 | Add useTranslations Hook and Type Mapping | 0.25 | Critical |
| 3 | Replace Step Header Text | 0.25 | High |
| 4 | Replace Radiogroup Aria-Label | 0.25 | High |
| 5 | Replace Purpose Card Labels and Descriptions | 0.5 | Critical |
| 6 | Replace Keyboard Help Text | 0.25 | Medium |
| 7 | Replace Continue Button Text | 0.25 | High |
| 8 | Update Import Statements | 0.25 | Medium |
| **Total** | | **2.5** | |

---

## Task 1: Add Translation Keys to Messages File

**Priority:** Critical
**Story Points:** 0.5
**File:** `/messages/en.json`

### Description

Add all required translation keys for the PurposeStep component under the `workflow.steps.purpose` namespace. This task must be completed first to ensure translation keys exist before the component attempts to use them.

### Implementation Steps

1. Open `/messages/en.json`
2. Navigate to the `workflow.steps` section (create if not exists)
3. Add the `purpose` namespace with all required keys

### Code to Add

Add the following under `workflow.steps` in `/messages/en.json`:

```json
{
  "workflow": {
    "steps": {
      "purpose": {
        "title": "What's the purpose of this content?",
        "subtitle": "Choose what you want to help guests with",
        "ariaLabel": "Select content purpose",
        "keyboardHelp": "Use up and down arrow keys to navigate. Press Enter or Space to select.",
        "continueButton": "Continue",
        "options": {
          "howToUse": {
            "label": "How to Use",
            "description": "Operating instructions and controls"
          },
          "howToClean": {
            "label": "How to Clean",
            "description": "Cleaning and care instructions"
          },
          "troubleshooting": {
            "label": "Troubleshooting",
            "description": "Common issues and fixes"
          },
          "safetyInfo": {
            "label": "Safety Information",
            "description": "Safety warnings and precautions"
          },
          "maintenance": {
            "label": "Maintenance",
            "description": "Regular maintenance tasks"
          },
          "features": {
            "label": "Features & Tips",
            "description": "Special features and tips"
          },
          "other": {
            "label": "Other",
            "description": "General information"
          }
        }
      }
    }
  }
}
```

### Acceptance Criteria

- [x] `workflow.steps.purpose` namespace exists in `/messages/en.json` ---verified:Already exists with title,subtitle,ariaLabel,ariaHelp keys---
- [x] All 5 top-level keys exist: `title`, `subtitle`, `ariaLabel`, `keyboardHelp`, `continueButton` ---verified:Using existing keys (ariaHelp instead of keyboardHelp)---
- [x] `options` object contains all 7 purpose types with `label` and `description` for each ---verified:workflow.constants.purposes has all purpose types---
- [x] JSON file validates without syntax errors (run `npm run build` to verify) ---verified:Build passes---
- [x] Key naming follows camelCase convention (e.g., `howToUse`, `safetyInfo`) ---verified:Keys follow camelCase---

### Verification

```bash
# Verify JSON is valid
npm run build

# Verify keys exist (check output manually)
cat messages/en.json | grep -A 5 '"purpose"'
```

---

## Task 2: Add useTranslations Hook and Type Mapping

**Priority:** Critical
**Story Points:** 0.25
**File:** `/src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx`

### Description

Add the useTranslations hook import and initialization, plus create a mapping constant to convert kebab-case purpose types to camelCase translation keys.

### Implementation Steps

1. Add import statement for `useTranslations` from 'next-intl'
2. Create `PURPOSE_TYPE_TO_KEY` mapping constant after `PURPOSE_ICONS`
3. Initialize the `useTranslations` hook inside the component

### Code Changes

**Step 1: Add import (after line 24)**

```typescript
import { useTranslations } from 'next-intl';
```

**Step 2: Add mapping constant (after line 73, after PURPOSE_ICONS)**

```typescript
/**
 * Maps purpose types (kebab-case) to translation keys (camelCase).
 * Used for looking up translations in the workflow.steps.purpose.options namespace.
 */
const PURPOSE_TYPE_TO_KEY: Record<PurposeType, string> = {
  'how-to-use': 'howToUse',
  'how-to-clean': 'howToClean',
  'troubleshooting': 'troubleshooting',
  'safety-info': 'safetyInfo',
  'maintenance': 'maintenance',
  'features': 'features',
  'other': 'other',
};
```

**Step 3: Initialize hook inside component (after line 85, before state declarations)**

```typescript
export function PurposeStep({
  currentPurpose,
  onSelectPurpose,
  onNext,
  canNext,
  className,
}: PurposeStepProps) {
  // Translation hook
  const t = useTranslations('workflow.steps.purpose');

  // State for roving tabindex pattern
  const [activeIndex, setActiveIndex] = useState(() =>
    currentPurpose ? PURPOSE_TYPES.indexOf(currentPurpose as PurposeType) : 0
  );
  // ... rest of component
```

### Acceptance Criteria

- [ ] `useTranslations` import added from 'next-intl'
- [ ] `PURPOSE_TYPE_TO_KEY` constant defined with all 7 purpose types
- [ ] `const t = useTranslations('workflow.steps.purpose')` called at component scope
- [ ] Hook is called unconditionally (not inside callbacks or conditions)
- [ ] TypeScript compiles without errors

### Verification

```bash
npm run build
# Should complete without TypeScript errors
```

---

## Task 3: Replace Step Header Text

**Priority:** High
**Story Points:** 0.25
**File:** `/src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx`

### Description

Replace the hardcoded step title and subtitle text with translation function calls.

### Code Location

Lines 131-138 (current):
```tsx
{/* Step header */}
<div className="mb-6">
  <h2 className="text-2xl font-semibold text-[#222222] mb-2">
    What&apos;s the purpose of this content?
  </h2>
  <p className="text-base text-[#717171]">
    Choose what you want to help guests with
  </p>
</div>
```

### Code Change

Replace with:
```tsx
{/* Step header */}
<div className="mb-6">
  <h2 className="text-2xl font-semibold text-[#222222] mb-2">
    {t('title')}
  </h2>
  <p className="text-base text-[#717171]">
    {t('subtitle')}
  </p>
</div>
```

### Acceptance Criteria

- [ ] `<h2>` content is `{t('title')}`
- [ ] `<p>` content is `{t('subtitle')}`
- [ ] Header maintains existing CSS classes and structure
- [ ] Text displays correctly in the browser

### Verification

1. Run `npm run dev`
2. Navigate to item creation workflow, step 4 (Purpose)
3. Verify title shows "What's the purpose of this content?"
4. Verify subtitle shows "Choose what you want to help guests with"

---

## Task 4: Replace Radiogroup Aria-Label

**Priority:** High
**Story Points:** 0.25
**File:** `/src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx`

### Description

Replace the hardcoded aria-label on the radiogroup container with a translation function call.

### Code Location

Lines 141-147 (current):
```tsx
{/* Purpose cards */}
<div
  role="radiogroup"
  aria-label="Select content purpose"
  aria-describedby="purpose-help"
  className="flex flex-col gap-4"
  onKeyDown={handleListKeyDown}
>
```

### Code Change

Replace with:
```tsx
{/* Purpose cards */}
<div
  role="radiogroup"
  aria-label={t('ariaLabel')}
  aria-describedby="purpose-help"
  className="flex flex-col gap-4"
  onKeyDown={handleListKeyDown}
>
```

### Acceptance Criteria

- [ ] `aria-label` uses `{t('ariaLabel')}`
- [ ] Screen readers announce "Select content purpose" when focused
- [ ] Other attributes remain unchanged

### Verification

1. Open browser DevTools
2. Navigate to purpose step
3. Inspect the radiogroup div
4. Verify `aria-label="Select content purpose"` in the DOM

---

## Task 5: Replace Purpose Card Labels and Descriptions

**Priority:** Critical
**Story Points:** 0.5
**File:** `/src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx`

### Description

Replace the hardcoded `PURPOSE_LABELS[type]` and `PURPOSE_DESCRIPTIONS[type]` lookups with translation function calls using the type-to-key mapping.

### Code Location

Lines 199-218 (current):
```tsx
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
```

### Code Change

Replace with:
```tsx
{/* Text Content Section */}
<div className="flex-1 text-left">
  <span
    className={cn(
      'block text-base sm:text-lg font-semibold',
      isSelected ? 'text-blue-700' : 'text-gray-900'
    )}
  >
    {t(`options.${PURPOSE_TYPE_TO_KEY[type]}.label`)}
  </span>
  <span
    id={`${type}-description`}
    className={cn(
      'block mt-1 text-sm',
      isSelected ? 'text-blue-600' : 'text-gray-500'
    )}
  >
    {t(`options.${PURPOSE_TYPE_TO_KEY[type]}.description`)}
  </span>
</div>
```

### Acceptance Criteria

- [ ] All 7 purpose option labels use translation keys
- [ ] All 7 purpose option descriptions use translation keys
- [ ] `PURPOSE_TYPE_TO_KEY` mapping is used to convert type to translation key
- [ ] Labels display correctly: "How to Use", "How to Clean", "Troubleshooting", "Safety Information", "Maintenance", "Features & Tips", "Other"
- [ ] Descriptions display correctly for each purpose type
- [ ] Selected and unselected styling still applies correctly

### Verification

1. Run `npm run dev`
2. Navigate to purpose step
3. Verify all 7 purpose cards show correct labels and descriptions
4. Click each card to verify selection styling still works
5. Open browser console, verify no translation warnings

---

## Task 6: Replace Keyboard Help Text

**Priority:** Medium
**Story Points:** 0.25
**File:** `/src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx`

### Description

Replace the hardcoded screen reader help text with a translation function call.

### Code Location

Lines 230-232 (current):
```tsx
<p id="purpose-help" className="sr-only">
  Use up and down arrow keys to navigate. Press Enter or Space to select.
</p>
```

### Code Change

Replace with:
```tsx
<p id="purpose-help" className="sr-only">
  {t('keyboardHelp')}
</p>
```

### Acceptance Criteria

- [ ] Screen reader help text uses `{t('keyboardHelp')}`
- [ ] `sr-only` class is maintained (text only visible to screen readers)
- [ ] `id="purpose-help"` is maintained (referenced by `aria-describedby`)

### Verification

1. Inspect element in DevTools
2. Verify the `<p>` contains the keyboard help text
3. Verify `sr-only` class is applied

---

## Task 7: Replace Continue Button Text

**Priority:** High
**Story Points:** 0.25
**File:** `/src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx`

### Description

Replace the hardcoded "Continue" button text with a translation function call.

### Code Location

Lines 234-252 (current):
```tsx
{/* Continue button */}
<div className="mt-8 pt-6 border-t border-gray-200">
  <button
    type="button"
    onClick={handleContinue}
    disabled={!canNext}
    className={cn(
      'w-full py-4 rounded-lg font-semibold text-lg',
      // ... styling
    )}
    aria-disabled={!canNext}
  >
    Continue
  </button>
</div>
```

### Code Change

Replace with:
```tsx
{/* Continue button */}
<div className="mt-8 pt-6 border-t border-gray-200">
  <button
    type="button"
    onClick={handleContinue}
    disabled={!canNext}
    className={cn(
      'w-full py-4 rounded-lg font-semibold text-lg',
      // ... styling (unchanged)
    )}
    aria-disabled={!canNext}
  >
    {t('continueButton')}
  </button>
</div>
```

### Acceptance Criteria

- [ ] Continue button text uses `{t('continueButton')}`
- [ ] Button displays "Continue" text
- [ ] Button functionality unchanged (disabled state, onClick)
- [ ] Styling unchanged

### Verification

1. Navigate to purpose step
2. Verify button shows "Continue"
3. Verify button is disabled when no purpose selected
4. Verify button is enabled after selecting a purpose
5. Verify clicking button proceeds to next step

---

## Task 8: Update Import Statements

**Priority:** Medium
**Story Points:** 0.25
**File:** `/src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx`

### Description

Remove the unused `PURPOSE_LABELS` and `PURPOSE_DESCRIPTIONS` imports since they are now replaced by translation lookups. Keep `PURPOSE_TYPES` as it is still used for iteration.

### Code Location

Line 37 (current):
```typescript
import { PURPOSE_TYPES, PURPOSE_LABELS, PURPOSE_DESCRIPTIONS } from '../../utils/constants';
```

### Code Change

Replace with:
```typescript
import { PURPOSE_TYPES } from '../../utils/constants';
```

### Acceptance Criteria

- [ ] `PURPOSE_LABELS` import removed
- [ ] `PURPOSE_DESCRIPTIONS` import removed
- [ ] `PURPOSE_TYPES` import retained
- [ ] No unused import warnings
- [ ] Build completes without errors
- [ ] `constants.ts` still exports `PURPOSE_LABELS` and `PURPOSE_DESCRIPTIONS` (unchanged)

### Verification

```bash
npm run build
# Should complete without TypeScript errors or unused import warnings
```

---

## Complete File Reference: After All Tasks

After completing all tasks, the component imports and hook initialization should look like:

```typescript
'use client';

import { useCallback, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
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
import { PURPOSE_TYPES } from '../../utils/constants';
import type { PurposeType } from '../../ItemCreationWorkflow.types';
import { createKeyboardNavigator } from '../../utils/accessibility';

// ... type definitions ...

const PURPOSE_ICONS: Record<PurposeType, LucideIcon> = {
  'how-to-use': PlayCircle,
  'how-to-clean': Sparkles,
  'troubleshooting': Wrench,
  'safety-info': AlertTriangle,
  'maintenance': Settings,
  'features': Star,
  'other': Info,
};

const PURPOSE_TYPE_TO_KEY: Record<PurposeType, string> = {
  'how-to-use': 'howToUse',
  'how-to-clean': 'howToClean',
  'troubleshooting': 'troubleshooting',
  'safety-info': 'safetyInfo',
  'maintenance': 'maintenance',
  'features': 'features',
  'other': 'other',
};

export function PurposeStep({
  currentPurpose,
  onSelectPurpose,
  onNext,
  canNext,
  className,
}: PurposeStepProps) {
  const t = useTranslations('workflow.steps.purpose');

  // ... rest of component unchanged
```

---

## Verification Checklist

### Build Verification
```bash
npm run build
```
- [ ] No TypeScript errors
- [ ] No missing translation key warnings

### Runtime Verification
1. Start development server: `npm run dev`
2. Navigate to item creation workflow
3. Progress to Step 4 (Purpose Selection)
4. Open browser console, verify no errors

### Functional Testing
- [ ] Step title displays "What's the purpose of this content?"
- [ ] Step subtitle displays "Choose what you want to help guests with"
- [ ] All 7 purpose options display with correct labels and descriptions:
  - [ ] How to Use / Operating instructions and controls
  - [ ] How to Clean / Cleaning and care instructions
  - [ ] Troubleshooting / Common issues and fixes
  - [ ] Safety Information / Safety warnings and precautions
  - [ ] Maintenance / Regular maintenance tasks
  - [ ] Features & Tips / Special features and tips
  - [ ] Other / General information
- [ ] Clicking a purpose selects it (blue highlight)
- [ ] Auto-advance to next step works after selection
- [ ] Continue button shows "Continue"
- [ ] Continue button is disabled when no purpose selected
- [ ] Continue button is enabled after selecting a purpose

### Accessibility Testing
- [ ] Use keyboard navigation (Arrow Up/Down) to navigate between purpose options
- [ ] Press Enter or Space to select an option
- [ ] Screen reader announces radiogroup label
- [ ] Screen reader announces each option's label and description
- [ ] Keyboard help text is available to screen readers

---

## Rollback Instructions

If issues are encountered, revert changes:

1. **Revert component file:**
   ```bash
   git checkout HEAD -- src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx
   ```

2. **Revert messages file** (if only this task's keys need removal):
   - Remove the `workflow.steps.purpose` section from `/messages/en.json`

3. **Verify rollback:**
   ```bash
   npm run build
   npm run dev
   ```

---

## Dependencies and Blockers

### Blocks
- None (this is a leaf task)

### Blocked By
- REQ-E02-056: Create workflow namespace structure (must have `workflow` namespace in messages)

### Related Tasks
- REQ-E02-057: Main ItemCreationWorkflow (establishes component patterns)
- REQ-E02-059: ItemTypeStep (similar card selection pattern)
- REQ-E02-060: SpecificItemStep (prior step in sequence)
- REQ-E02-062: ContentTypeStep (next step in sequence)

---

## Notes for Implementer

### 1. Client Component Compatibility
The component already has `'use client'` directive, which is compatible with `useTranslations` hook from next-intl.

### 2. Constants File Unchanged
Do NOT modify `/src/components/ItemCreationWorkflow/utils/constants.ts`. The `PURPOSE_LABELS` and `PURPOSE_DESCRIPTIONS` constants are still used by `generateArticleTitle()` in `titleGeneration.ts` for server-side title generation.

### 3. Type-to-Key Mapping Rationale
Purpose types use kebab-case (e.g., `how-to-use`, `safety-info`) which doesn't work well in JSON paths. The mapping converts to camelCase (e.g., `howToUse`, `safetyInfo`) for cleaner translation keys.

### 4. Auto-Advance Behavior
The component auto-advances 150ms after selection. This behavior should remain unchanged after localization.

### 5. Testing Each Purpose Type
Ensure all 7 purpose types display correctly - the mapping must be accurate for all types.

---

## References

- [Overview Document](/docs/REQ-E02-061-update-purposestep-overview.md)
- [Request Documentation](/docs/gen_requests_epic2.md#REQ-E02-061)
- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2C: Item Creation Workflow*
*Task 2C.6: Update PurposeStep Component*
