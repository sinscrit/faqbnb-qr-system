# REQ-376: Update PurposeStep Component for Internationalization

**Document Created:** 2026-01-19 21:45 UTC
**Last Modified:** 2026-01-19 21:45 UTC
**Epic:** Epic 2: Static UI Localization
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.6
**Type:** ENHANCEMENT
**Size:** M (Medium)
**Priority:** P2

---

## 1. Overview

### 1.1 Summary

This document outlines the implementation plan for internationalizing the PurposeStep component, which is Step 4 of the item creation workflow. The component allows users to select the purpose/intent of their content (e.g., how-to-use, how-to-clean, troubleshooting) before creating documentation. This selection drives automatic article title generation.

### 1.2 Current State

The PurposeStep component (`/src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx`) currently contains 20+ hardcoded English strings including:

**Step Header Strings:**
- Heading: "What's the purpose of this content?"
- Subtitle: "Choose what you want to help guests with"

**Purpose Option Labels (7 options):**
- "How to Use"
- "How to Clean"
- "Troubleshooting"
- "Safety Information"
- "Maintenance"
- "Features & Tips"
- "Other"

**Purpose Option Descriptions (7 descriptions):**
- "Operating instructions and controls"
- "Cleaning and care instructions"
- "Common issues and fixes"
- "Safety warnings and precautions"
- "Regular maintenance tasks"
- "Special features and tips"
- "General information"

**Accessibility Strings:**
- Radiogroup aria-label: "Select content purpose"
- Screen reader help: "Use up and down arrow keys to navigate. Press Enter or Space to select."

**Button Text:**
- "Continue"

The component imports `PURPOSE_LABELS` and `PURPOSE_DESCRIPTIONS` from `/src/components/ItemCreationWorkflow/utils/constants.ts`, which also contain hardcoded English strings.

### 1.3 Target State

All user-facing strings will use the `useTranslations` hook from `next-intl` with the `workflow` namespace. The component will display correctly in all six supported languages (en, fr, es, de, nl, it) without layout breaks. Purpose selection logic will continue to use internal constants (`how-to-use`, `how-to-clean`, etc.) for language-independent operation.

---

## 2. Dependencies

### 2.1 Epic 1 Foundation (Complete)

| Dependency | Location | Status |
|------------|----------|--------|
| next-intl package | `package.json` | Installed |
| i18n configuration | `/src/lib/i18n/config.ts` | Complete |
| NextIntlClientProvider | `/src/app/layout.tsx` | Configured |
| Translation files | `/messages/*.json` | Created |

### 2.2 Sub-Epic 2C Prerequisites

| Dependency | Task ID | Description |
|------------|---------|-------------|
| Workflow namespace structure | 2C.1 | Creates `workflow` namespace in translation files |
| REQ-371 | 2C.1 | `workflow.buttons.continue` key should exist |

### 2.3 Component Dependencies

| Component | Location | i18n Status |
|-----------|----------|-------------|
| PURPOSE_TYPES constant | `.../utils/constants.ts` | No change needed (internal IDs) |
| PURPOSE_LABELS constant | `.../utils/constants.ts` | Will be replaced with t() calls |
| PURPOSE_DESCRIPTIONS constant | `.../utils/constants.ts` | Will be replaced with t() calls |
| PURPOSE_ICONS mapping | `PurposeStep.tsx` | No change needed (visual only) |

---

## 3. Implementation Approach

### 3.1 Translation Key Structure

Keys will be added to the `workflow` namespace following the established naming convention:

```json
{
  "workflow": {
    "steps": {
      "purpose": {
        "title": "What's the purpose of this content?",
        "subtitle": "Choose what you want to help guests with"
      }
    },
    "purposes": {
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
    },
    "accessibility": {
      "purposeStep": {
        "ariaLabel": "Select content purpose",
        "keyboardHelp": "Use up and down arrow keys to navigate. Press Enter or Space to select."
      }
    },
    "buttons": {
      "continue": "Continue"
    }
  }
}
```

### 3.2 Purpose Type to Translation Key Mapping

A mapping function will convert internal purpose type constants to translation keys:

```typescript
// Map from internal constant (e.g., 'how-to-use') to translation key (e.g., 'howToUse')
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

### 3.3 Component Update Pattern

Following the established pattern from `LogoutButton.tsx`:

```typescript
'use client';

import { useTranslations } from 'next-intl';

export function PurposeStep({ ... }) {
  const t = useTranslations('workflow');

  // Map purpose type to translation key
  const getLabel = (type: PurposeType) => t(`purposes.${PURPOSE_TYPE_TO_KEY[type]}.label`);
  const getDescription = (type: PurposeType) => t(`purposes.${PURPOSE_TYPE_TO_KEY[type]}.description`);

  return (
    <div>
      <h2>{t('steps.purpose.title')}</h2>
      <p>{t('steps.purpose.subtitle')}</p>

      <div role="radiogroup" aria-label={t('accessibility.purposeStep.ariaLabel')}>
        {PURPOSE_TYPES.map((type) => (
          <button key={type}>
            <span>{getLabel(type)}</span>
            <span>{getDescription(type)}</span>
          </button>
        ))}
      </div>

      <p className="sr-only">{t('accessibility.purposeStep.keyboardHelp')}</p>

      <button>{t('buttons.continue')}</button>
    </div>
  );
}
```

---

## 4. Authorized Files and Functions for Modification

### 4.1 Primary Component

| File | Functions/Sections | Change Type |
|------|-------------------|-------------|
| `/src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx` | `PurposeStep` function, import statements, JSX return | Modify |

**Specific changes:**
- Lines 1-40: Add `useTranslations` import from 'next-intl'
- Line 37: Remove or keep `PURPOSE_LABELS`, `PURPOSE_DESCRIPTIONS` imports (may still be used by other files)
- Lines 79-99: Add translation hook call and helper functions after component function declaration
- Lines 132-138: Replace hardcoded heading and subtitle with t() calls
- Lines 141-143: Replace hardcoded `aria-label` with t() call
- Lines 206-207: Replace `PURPOSE_LABELS[type]` with translation call
- Lines 215-217: Replace `PURPOSE_DESCRIPTIONS[type]` with translation call
- Lines 230-232: Replace hardcoded help text with t() call
- Line 250: Replace "Continue" button text with t() call

### 4.2 Translation Files

| File | Change Type |
|------|-------------|
| `/messages/en.json` | Add `workflow.steps.purpose`, `workflow.purposes`, and `workflow.accessibility.purposeStep` namespaces |
| `/messages/fr.json` | Add French translations |
| `/messages/es.json` | Add Spanish translations |
| `/messages/de.json` | Add German translations |
| `/messages/nl.json` | Add Dutch translations |
| `/messages/it.json` | Add Italian translations |

### 4.3 Test Files

| File | Change Type |
|------|-------------|
| `/src/components/ItemCreationWorkflow/components/steps/__tests__/PurposeStep.test.tsx` | Update to mock translations |
| `/src/components/ItemCreationWorkflow/components/steps/__tests__/PurposeStep.a11y.test.tsx` | Update to mock translations |

### 4.4 Files NOT to Modify

| File | Reason |
|------|--------|
| `/src/components/ItemCreationWorkflow/utils/constants.ts` | Keep `PURPOSE_LABELS` and `PURPOSE_DESCRIPTIONS` for backward compatibility and title generation |

---

## 5. Implementation Tasks

### Task 5.1: Add Translation Keys to messages/en.json
**Estimated Strings:** 20
- Add `workflow.steps.purpose` namespace with 2 keys (title, subtitle)
- Add `workflow.purposes` namespace with 7 purpose types, each with label and description (14 keys)
- Add `workflow.accessibility.purposeStep` namespace with 2 keys (ariaLabel, keyboardHelp)
- Verify `workflow.buttons.continue` exists (may already exist from prior tasks)

### Task 5.2: Create Purpose Type to Translation Key Mapping
- Create `PURPOSE_TYPE_TO_KEY` constant mapping internal IDs to camelCase translation keys
- Add helper functions `getLabel()` and `getDescription()` within component

### Task 5.3: Update PurposeStep Component
- Import `useTranslations` from 'next-intl'
- Initialize translation hook at component level
- Replace heading "What's the purpose of this content?" with `t('steps.purpose.title')`
- Replace subtitle "Choose what you want to help guests with" with `t('steps.purpose.subtitle')`
- Replace `aria-label="Select content purpose"` with `t('accessibility.purposeStep.ariaLabel')`
- Replace `PURPOSE_LABELS[type]` with translated label
- Replace `PURPOSE_DESCRIPTIONS[type]` with translated description
- Replace screen reader help text with `t('accessibility.purposeStep.keyboardHelp')`
- Replace "Continue" button text with `t('buttons.continue')`

### Task 5.4: Generate Translations for 5 Non-English Languages
- French (fr.json)
- Spanish (es.json)
- German (de.json)
- Dutch (nl.json)
- Italian (it.json)

### Task 5.5: Update Unit Tests
- Mock `useTranslations` in test files
- Update test assertions that check for specific English text
- Verify component renders with mocked translations
- Ensure all 633+ lines of existing tests pass or are updated

### Task 5.6: Visual QA Validation
- Test component in all 6 languages
- Verify no layout breaks with longer translations (especially German)
- Confirm purpose card heights remain consistent despite text length variations
- Verify checkmark indicator displays consistently regardless of text length
- Test responsive behavior across viewport sizes
- Confirm keyboard navigation works in all languages

---

## 6. Acceptance Criteria Verification

| Criteria | Verification Method |
|----------|---------------------|
| Component imports useTranslations hook | Code review |
| Workflow namespace loaded correctly | Runtime test, console check |
| Heading uses translation key `workflow.steps.purpose.title` | Code review |
| Subtitle uses translation key `workflow.steps.purpose.subtitle` | Code review |
| All 7 purpose labels use translation keys | Code review |
| All 7 purpose descriptions use translation keys | Code review |
| "Continue" button uses translation key | Code review |
| ARIA label uses translated string | Accessibility test |
| Screen reader help text uses translated string | Accessibility test |
| No hardcoded English strings remain in JSX | Code search |
| Keyboard navigation works in all languages | Manual test |
| Auto-advance on selection works correctly | Manual test |
| Selection state management uses internal constants | Code review |
| Purpose validation logic functions identically in all languages | Manual test |
| No layout breaks in any language | Visual test all 6 languages |
| Purpose card heights remain consistent | Visual test |
| No missing translation warnings | Console check in all languages |
| Existing unit tests pass | Run test suite |
| Checkmark indicator displays consistently | Visual test |
| Icon alignment remains consistent | Visual test |

---

## 7. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| German text overflow in purpose cards | Medium | Low | Cards have flexible height, test thoroughly |
| Translation key typos | Low | Medium | TypeScript checking, visual verification |
| Tests breaking due to text assertions | High | Medium | Update tests to mock translations |
| Auto-advance timer interference | Low | Low | Timer uses selection callback, not text |
| Missing PURPOSE_TYPE_TO_KEY mapping | Low | High | Add all 7 purpose types to mapping |

---

## 8. Related Documents

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- Epic 1 Foundation: `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- i18n Configuration: `/src/lib/i18n/config.ts`
- Working i18n Example: `/src/components/LogoutButton.tsx`
- Messages Template: `/messages/en.json`
- Request Details: `/docs/gen_requests_epic2.md` (REQ-376)

---

## 9. Notes

### 9.1 Existing i18n Pattern Reference

The `LogoutButton.tsx` component demonstrates the working pattern:
```typescript
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations('auth');

  return <button>{t('signOut')}</button>;
}
```

### 9.2 Purpose Constants Preservation

The `PURPOSE_TYPES`, `PURPOSE_LABELS`, and `PURPOSE_DESCRIPTIONS` constants in `constants.ts` should be preserved because:
1. `PURPOSE_TYPES` is used for iteration and internal logic (language-independent)
2. `PURPOSE_LABELS` may be used by `generateArticleTitle()` for title generation
3. Other components may depend on these exports

The PurposeStep component will switch to using translations for display while keeping internal purpose type values unchanged.

### 9.3 Translation Key Naming Convention

Purpose type constants use kebab-case (`how-to-use`, `safety-info`) while translation keys use camelCase (`howToUse`, `safetyInfo`) to follow JSON naming conventions. The `PURPOSE_TYPE_TO_KEY` mapping handles this conversion.

### 9.4 Test File Considerations

The existing test file (`PurposeStep.test.tsx`) has 633 lines with comprehensive coverage. Many tests assert specific English text (e.g., `screen.getByText('How to Use')`). These tests will need to be updated to either:
1. Mock `useTranslations` to return the expected English strings
2. Use test IDs or ARIA roles instead of text content

### 9.5 Checkmark Indicator

The checkmark indicator (`<Check>` icon) for the selected state is purely visual and does not require translation. It should continue to display consistently regardless of text length variations in translated labels.

### 9.6 Auto-Advance Behavior

The auto-advance behavior (150ms delay after selection) operates on the internal purpose type constant, not on displayed text. This ensures the behavior remains consistent across all languages.
