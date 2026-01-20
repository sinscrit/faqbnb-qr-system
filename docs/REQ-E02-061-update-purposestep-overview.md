# Implementation Breakdown: REQ-E02-061 - Update PurposeStep Component

**Document Version:** 1.0
**Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E02-061
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.6
**Estimated Size:** M (Medium)

---

## Overview

This document provides the implementation breakdown for updating the `PurposeStep` component to use the i18n translation system. This component is Step 4 of the item creation workflow and allows users to select the purpose/intent of their content (e.g., how-to-use, troubleshooting, maintenance).

The PurposeStep component contains:
- Step header text ("What's the purpose of this content?")
- Instructional subtitle ("Choose what you want to help guests with")
- Seven purpose option cards with labels and descriptions
- Keyboard navigation screen reader help text
- "Continue" button text
- Accessibility labels for the radiogroup interface

**Key Challenge:** The purpose labels and descriptions are currently stored in constants (`PURPOSE_LABELS`, `PURPOSE_DESCRIPTIONS` in `/src/components/ItemCreationWorkflow/utils/constants.ts`). These must be translated and the component must use the translation system instead of the hardcoded constants.

---

## Dependencies

### Prerequisites (Epic 1 Foundation)
| Dependency | Location | Status |
|------------|----------|--------|
| next-intl package | `package.json` | Required |
| i18n config | `/src/lib/i18n/config.ts` | Complete |
| Translation files | `/messages/en.json` | Complete (base structure exists) |
| useTranslations hook | next-intl | Available |

### Prerequisites (Epic 2 - Prior Tasks)
| Dependency | Task | Status |
|------------|------|--------|
| `workflow` namespace structure | REQ-E02-056 (Task 2C.1) | Required - Must be complete |
| Main ItemCreationWorkflow updated | REQ-E02-057 (Task 2C.2) | Recommended - Establishes patterns |
| RoomSelectionStep updated | REQ-E02-058 (Task 2C.3) | Recommended - Similar selection pattern |
| ItemTypeStep updated | REQ-E02-059 (Task 2C.4) | Recommended - Similar card pattern |
| SpecificItemStep updated | REQ-E02-060 (Task 2C.5) | Recommended - Prior step in sequence |

### Existing Patterns to Follow
- Translation file structure in `/messages/en.json` (common, auth, dashboard, workflow namespaces)
- Key naming convention: `{namespace}.{component/area}.{element}.{variant?}`
- ICU message format for pluralization and interpolation
- Client component pattern using `useTranslations` hook
- Card selection pattern from ItemTypeStep (REQ-E02-059)

---

## Technical Context

### Current State Analysis

The `PurposeStep.tsx` component (located at `/src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx`) is a client component (`'use client'`) that renders Step 4 of the item creation workflow. It displays purpose options as selectable cards in a vertical list.

#### Identified Hardcoded Strings in PurposeStep.tsx

| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 132-133 | `"What's the purpose of this content?"` | `workflow.steps.purpose.title` |
| 135-136 | `"Choose what you want to help guests with"` | `workflow.steps.purpose.subtitle` |
| 143 | `"Select content purpose"` (aria-label) | `workflow.steps.purpose.ariaLabel` |
| 230-231 | `"Use up and down arrow keys to navigate. Press Enter or Space to select."` | `workflow.steps.purpose.keyboardHelp` |
| 250 | `"Continue"` | `workflow.steps.purpose.continueButton` or `common.actions.continue` |

#### Hardcoded Strings in constants.ts (Lines 287-311)

The purpose labels and descriptions are stored in constants and need to be replaced with translation keys:

| Constant | Current Values | Translation Keys |
|----------|---------------|------------------|
| `PURPOSE_LABELS['how-to-use']` | "How to Use" | `workflow.steps.purpose.options.howToUse.label` |
| `PURPOSE_LABELS['how-to-clean']` | "How to Clean" | `workflow.steps.purpose.options.howToClean.label` |
| `PURPOSE_LABELS['troubleshooting']` | "Troubleshooting" | `workflow.steps.purpose.options.troubleshooting.label` |
| `PURPOSE_LABELS['safety-info']` | "Safety Information" | `workflow.steps.purpose.options.safetyInfo.label` |
| `PURPOSE_LABELS['maintenance']` | "Maintenance" | `workflow.steps.purpose.options.maintenance.label` |
| `PURPOSE_LABELS['features']` | "Features & Tips" | `workflow.steps.purpose.options.features.label` |
| `PURPOSE_LABELS['other']` | "Other" | `workflow.steps.purpose.options.other.label` |
| `PURPOSE_DESCRIPTIONS['how-to-use']` | "Operating instructions and controls" | `workflow.steps.purpose.options.howToUse.description` |
| `PURPOSE_DESCRIPTIONS['how-to-clean']` | "Cleaning and care instructions" | `workflow.steps.purpose.options.howToClean.description` |
| `PURPOSE_DESCRIPTIONS['troubleshooting']` | "Common issues and fixes" | `workflow.steps.purpose.options.troubleshooting.description` |
| `PURPOSE_DESCRIPTIONS['safety-info']` | "Safety warnings and precautions" | `workflow.steps.purpose.options.safetyInfo.description` |
| `PURPOSE_DESCRIPTIONS['maintenance']` | "Regular maintenance tasks" | `workflow.steps.purpose.options.maintenance.description` |
| `PURPOSE_DESCRIPTIONS['features']` | "Special features and tips" | `workflow.steps.purpose.options.features.description` |
| `PURPOSE_DESCRIPTIONS['other']` | "General information" | `workflow.steps.purpose.options.other.description` |

### Component Integration Points

```
PurposeStep.tsx
├── imports PURPOSE_TYPES, PURPOSE_LABELS, PURPOSE_DESCRIPTIONS from ../../utils/constants
├── imports PurposeType from ../../ItemCreationWorkflow.types
├── imports PURPOSE_ICONS mapping (internal, maps types to Lucide icons)
├── uses PURPOSE_LABELS[type] for card titles (line 207)
├── uses PURPOSE_DESCRIPTIONS[type] for card descriptions (line 216)
├── contains radiogroup with aria-label (line 143)
├── contains step header h2 (line 132-133)
├── contains step subtitle p (line 135-136)
├── contains keyboard help screen reader text (lines 230-231)
└── contains Continue button (line 250)
```

### Purpose Type to Translation Key Mapping

A mapping function is needed to convert kebab-case purpose types to camelCase translation keys:

```typescript
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

---

## Implementation Tasks

### Task 1: Add useTranslations Hook to PurposeStep Component
**Priority:** Critical
**Estimate:** 0.25 story points

Add the `useTranslations` hook import and initialization at the component level.

**Implementation:**
```typescript
// Add import at top of file (after line 24)
import { useTranslations } from 'next-intl';

// Inside PurposeStep component, before state declarations (after line 85)
export function PurposeStep({...props}: PurposeStepProps) {
  const t = useTranslations('workflow.steps.purpose');

  // ... rest of component
}
```

**Acceptance Criteria:**
- [ ] Import statement added for useTranslations from 'next-intl'
- [ ] Hook initialized at component scope with 'workflow.steps.purpose' namespace
- [ ] No re-initialization on every render (hook called at component level, not in callbacks)

### Task 2: Create Purpose Type to Translation Key Mapping
**Priority:** High
**Estimate:** 0.25 story points

Create a mapping to convert kebab-case purpose types to camelCase translation keys.

**Implementation:**
```typescript
// Add after PURPOSE_ICONS constant (after line 73)

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

**Acceptance Criteria:**
- [ ] Mapping constant defined after PURPOSE_ICONS
- [ ] All seven purpose types have corresponding translation key mappings
- [ ] Mapping uses PurposeType as Record key type for type safety

### Task 3: Update Step Header Text
**Priority:** High
**Estimate:** 0.25 story points

Replace the hardcoded step header and subtitle text with translation keys.

**Current Code (Lines 129-138):**
```tsx
return (
  <div className={cn('flex flex-col flex-1 p-6', className)}>
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

**Updated Code:**
```tsx
return (
  <div className={cn('flex flex-col flex-1 p-6', className)}>
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

**Acceptance Criteria:**
- [ ] Step title uses translation key `workflow.steps.purpose.title`
- [ ] Step subtitle uses translation key `workflow.steps.purpose.subtitle`
- [ ] Header maintains existing styling and structure

### Task 4: Update Radiogroup Aria-Label
**Priority:** High
**Estimate:** 0.25 story points

Replace the hardcoded radiogroup aria-label with a translation key.

**Current Code (Lines 140-146):**
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

**Updated Code:**
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

**Acceptance Criteria:**
- [ ] Radiogroup aria-label uses translation key
- [ ] Screen readers announce translated label

### Task 5: Update Purpose Card Labels and Descriptions
**Priority:** Critical
**Estimate:** 0.5 story points

Replace the hardcoded PURPOSE_LABELS and PURPOSE_DESCRIPTIONS with translation lookups.

**Current Code (Lines 200-218):**
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

**Updated Code:**
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

**Acceptance Criteria:**
- [ ] All seven purpose option labels use translation keys
- [ ] All seven purpose option descriptions use translation keys
- [ ] Labels and descriptions display correctly for each purpose type
- [ ] Selected and unselected styling still works correctly

### Task 6: Update Keyboard Help Text for Screen Readers
**Priority:** Medium
**Estimate:** 0.25 story points

Replace the hardcoded screen reader help text with a translation key.

**Current Code (Lines 229-232):**
```tsx
<p id="purpose-help" className="sr-only">
  Use up and down arrow keys to navigate. Press Enter or Space to select.
</p>
```

**Updated Code:**
```tsx
<p id="purpose-help" className="sr-only">
  {t('keyboardHelp')}
</p>
```

**Acceptance Criteria:**
- [ ] Keyboard help text uses translation key
- [ ] Screen readers announce translated instructions
- [ ] Text is only visible to screen readers (sr-only class maintained)

### Task 7: Update Continue Button Text
**Priority:** High
**Estimate:** 0.25 story points

Replace the hardcoded Continue button text with a translation key.

**Current Code (Lines 234-252):**
```tsx
{/* Continue button */}
<div className="mt-8 pt-6 border-t border-gray-200">
  <button
    type="button"
    onClick={handleContinue}
    disabled={!canNext}
    className={cn(...)}
    aria-disabled={!canNext}
  >
    Continue
  </button>
</div>
```

**Updated Code:**
```tsx
{/* Continue button */}
<div className="mt-8 pt-6 border-t border-gray-200">
  <button
    type="button"
    onClick={handleContinue}
    disabled={!canNext}
    className={cn(...)}
    aria-disabled={!canNext}
  >
    {t('continueButton')}
  </button>
</div>
```

**Alternative:** Use `common.actions.continue` for consistency across the app. If using common namespace:
```typescript
const tCommon = useTranslations('common');
// ...
{tCommon('continue')}
```

**Acceptance Criteria:**
- [ ] Continue button uses translation key
- [ ] Button maintains existing functionality
- [ ] Consistent with other workflow step buttons

### Task 8: Add Translation Keys to Messages File
**Priority:** Critical
**Estimate:** 0.5 story points

Add all required translation keys to `/messages/en.json` under the `workflow` namespace.

**Required Keys:**
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

**Acceptance Criteria:**
- [ ] All required keys exist in `/messages/en.json`
- [ ] Keys follow established naming convention
- [ ] JSON file validates without syntax errors
- [ ] Build completes without missing translation warnings

### Task 9: Update Import Statements
**Priority:** Medium
**Estimate:** 0.25 story points

Update imports to remove unused PURPOSE_LABELS and PURPOSE_DESCRIPTIONS if they are no longer needed.

**Current Imports (Line 37):**
```typescript
import { PURPOSE_TYPES, PURPOSE_LABELS, PURPOSE_DESCRIPTIONS } from '../../utils/constants';
```

**Updated Imports:**
```typescript
import { PURPOSE_TYPES } from '../../utils/constants';
```

**Note:** Keep PURPOSE_LABELS and PURPOSE_DESCRIPTIONS in constants.ts for non-UI contexts (e.g., title generation in `generateArticleTitle()` function). Only remove the import from PurposeStep.tsx.

**Acceptance Criteria:**
- [ ] PURPOSE_LABELS and PURPOSE_DESCRIPTIONS imports removed from PurposeStep.tsx
- [ ] PURPOSE_TYPES import retained (used for iteration)
- [ ] No unused imports in the file
- [ ] constants.ts still exports PURPOSE_LABELS and PURPOSE_DESCRIPTIONS for other consumers

---

## Authorized Files and Functions for Modification

### Primary Files to Modify

| File | Purpose | Modification Type |
|------|---------|-------------------|
| `/src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx` | Purpose selection step component | Add useTranslations hook, replace all hardcoded strings, add type-to-key mapping |
| `/messages/en.json` | English translations | Add workflow.steps.purpose namespace with all keys |

### Functions to Modify

| Function/Section | File | Modification |
|------------------|------|--------------|
| `PurposeStep` component | PurposeStep.tsx | Add `useTranslations` hook, use translation keys |
| Import statements | PurposeStep.tsx | Add useTranslations import, remove PURPOSE_LABELS/PURPOSE_DESCRIPTIONS |
| `PURPOSE_TYPE_TO_KEY` constant | PurposeStep.tsx | Add new mapping constant |
| Step header JSX | PurposeStep.tsx | Use `t('title')` and `t('subtitle')` |
| Radiogroup aria-label | PurposeStep.tsx | Use `t('ariaLabel')` |
| Purpose card labels | PurposeStep.tsx | Use `t('options.{key}.label')` |
| Purpose card descriptions | PurposeStep.tsx | Use `t('options.{key}.description')` |
| Keyboard help text | PurposeStep.tsx | Use `t('keyboardHelp')` |
| Continue button | PurposeStep.tsx | Use `t('continueButton')` |

### Files for Reference Only (Not Modified in This Task)

| File | Purpose |
|------|---------|
| `/src/components/ItemCreationWorkflow/utils/constants.ts` | Contains PURPOSE_TYPES, PURPOSE_LABELS, PURPOSE_DESCRIPTIONS - keep for non-UI contexts |
| `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Contains PurposeType type definition |
| `/src/components/ItemCreationWorkflow/utils/titleGeneration.ts` | Uses PURPOSE_LABELS for title generation (keep constant usage) |
| `/src/lib/i18n/config.ts` | i18n configuration (read-only reference) |
| `/src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx` | Prior step - reference for card selection pattern |
| `/src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx` | Prior step - reference for patterns |

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
- Navigate to item creation workflow (Step 4 - Purpose Selection)
- Open browser console, verify no translation-related errors
- Verify all text displays correctly

### 3. Functional Testing
- Verify step title displays translated text
- Verify step subtitle displays translated text
- Verify all seven purpose option cards display:
  - Translated labels (How to Use, How to Clean, etc.)
  - Translated descriptions
  - Correct icons
- Click on each purpose option and verify selection state updates
- Verify auto-advance behavior after selection still works
- Verify Continue button text and functionality

### 4. Accessibility Testing
- Use screen reader (VoiceOver/NVDA) to navigate purpose cards
- Verify radiogroup aria-label is announced correctly
- Verify each purpose card's label and description is announced
- Verify keyboard help text is announced (sr-only text)
- Use keyboard to navigate (Arrow keys, Enter/Space to select)
- Verify selection state is announced by screen reader

### 5. Edge Case Testing
- Test with purpose already pre-selected (verify correct option highlighted)
- Verify keyboard navigation loops correctly at boundaries
- Verify tab index management works (roving tabindex pattern)

### 6. Language Switching Test
- Change browser language or use language switcher (if available)
- Verify all PurposeStep strings update
- Verify no mixed-language content

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing dependency on REQ-E02-056 | Medium | High | Verify workflow namespace exists before starting |
| Type-to-key mapping mismatch | Medium | High | Test all seven purpose types display correctly |
| PURPOSE_LABELS removal breaks title generation | Low | High | Only remove import from PurposeStep, keep in constants.ts |
| Screen reader announcement quality | Medium | Medium | Test with actual screen readers, not just ARIA inspection |
| Keyboard navigation affected | Low | Medium | Test roving tabindex still works after changes |

---

## Notes for Implementation

### 1. Client Component Requirement
The `PurposeStep` component is marked with `'use client'`, which is compatible with the `useTranslations` hook from next-intl. No changes needed for server/client boundary.

### 2. Constants File Consideration
The `PURPOSE_LABELS` and `PURPOSE_DESCRIPTIONS` constants in `/src/components/ItemCreationWorkflow/utils/constants.ts` are also used by the `generateArticleTitle()` function in `titleGeneration.ts`. Keep these constants available for non-UI contexts. Only the PurposeStep component should use translations; the title generation logic can continue using the constants (or be updated separately in a later task if needed).

### 3. Type-to-Key Mapping Rationale
The purpose types use kebab-case (e.g., `how-to-use`, `safety-info`) which doesn't work well in JSON key paths. The mapping converts to camelCase (e.g., `howToUse`, `safetyInfo`) for cleaner translation keys.

### 4. Auto-Advance Behavior
The component auto-advances to the next step after a 150ms delay when a purpose is selected. This behavior should remain unchanged after localization.

### 5. Purpose Descriptions Are Important
Purpose descriptions help users understand what each option means. Ensure translators provide clear, concise descriptions that convey the intent in each language:
- "Operating instructions and controls" - How to use the item
- "Cleaning and care instructions" - How to maintain cleanliness
- "Common issues and fixes" - Troubleshooting help
- "Safety warnings and precautions" - Important safety information
- "Regular maintenance tasks" - Ongoing maintenance guidance
- "Special features and tips" - Advanced usage tips
- "General information" - Catch-all for other content

### 6. Coordination with Prior Tasks
Follow the same patterns established in:
- REQ-E02-059 (ItemTypeStep) - Similar card selection pattern with icons
- REQ-E02-060 (SpecificItemStep) - Prior step patterns

---

## Acceptance Criteria Summary

From the request document (REQ-E02-061):

- [ ] Step header text is extracted to localization namespace
- [ ] Instructional text describing purpose selection and its impact is extracted to localization namespace
- [ ] Accessibility label for the purpose selection interface is extracted to localization namespace
- [ ] Keyboard navigation help text is extracted to localization namespace
- [ ] All purpose option labels are extracted to localization namespace with appropriate keys
- [ ] Description text for each purpose option explaining its use case is extracted to localization namespace
- [ ] Help text or tooltips explaining purpose implications are extracted to localization namespace
- [ ] Continue button text is extracted to localization namespace
- [ ] Back button text is extracted to localization namespace (N/A - no back button in this component)
- [ ] Validation message for required purpose selection is extracted to localization namespace (N/A - auto-advance, no validation message)
- [ ] Optional helper text about changing purpose later is extracted to localization namespace (N/A - not present)
- [ ] Component uses appropriate i18n hooks (useTranslations) to retrieve all translated strings
- [ ] All ARIA labels and accessibility strings are properly localized
- [ ] Component renders correctly with translations in all supported languages
- [ ] No hardcoded English strings remain in the component code
- [ ] Purpose option translations convey the intended meaning clearly across different cultural contexts
- [ ] Selection state announcements for screen readers are localized (handled by aria-checked attribute, no custom text)
- [ ] Any conditional messages based on purpose selection are localized (N/A - none present)
- [ ] Icon labels or button tooltips within the purpose selection UI are localized (icons are aria-hidden)
- [ ] Variable interpolation correctly handles any dynamic content in purpose descriptions (N/A - no variables in descriptions)

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [REQ-E02-056: Create Workflow Namespace Structure](/docs/REQ-E02-056-create-workflow-namespace-structure-overview.md)
- [REQ-E02-057: Update Main ItemCreationWorkflow Component](/docs/REQ-E02-057-update-main-itemcreationworkflow-component-overview.md)
- [REQ-E02-058: Update RoomSelectionStep](/docs/REQ-E02-058-update-roomselectionstep-overview.md)
- [REQ-E02-059: Update ItemTypeStep](/docs/REQ-E02-059-update-itemtypestep-overview.md)
- [REQ-E02-060: Update SpecificItemStep](/docs/REQ-E02-060-update-specificitemstep-overview.md)
- [Request Documentation](/docs/gen_requests_epic2.md#REQ-E02-061)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2C: Item Creation Workflow*
