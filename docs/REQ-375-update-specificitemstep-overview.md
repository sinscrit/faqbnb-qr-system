# REQ-375: Update SpecificItemStep Component for Internationalization

**Document Created:** 2026-01-19 20:30 UTC
**Last Modified:** 2026-01-19 20:30 UTC
**Epic:** Epic 2: Static UI Localization
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.5
**Type:** ENHANCEMENT
**Size:** L (Large)
**Priority:** P2

---

## 1. Overview

### 1.1 Summary

This document outlines the implementation plan for internationalizing the SpecificItemStep component, which is Step 3 of the item creation workflow. The component allows users to select from contextual item suggestions or enter a custom item name for their QR code content.

### 1.2 Current State

The SpecificItemStep component (`/src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx`) currently contains 15+ hardcoded English strings including:
- Step header: "What specific item?"
- Step subtitle: "Select from suggestions or enter a custom item for {roomLabel}"
- Section header: "Suggestions"
- Button label: "Other..."
- Form labels: "Enter custom item name" / "Enter item name"
- Placeholder: "e.g., Coffee Maker, Smart Thermostat"
- Status indicator: "Created"
- Button: "Continue"

Additionally, three shared sub-components used by SpecificItemStep also contain hardcoded strings:
- **SuggestionButton**: "Created" status label
- **ItemNameEditor**: "Item Name" label, "This name will appear on the QR code label" hint
- **DuplicateNameWarning**: "Exact name already exists", "Similar name already used", "+N more..."

### 1.3 Target State

All user-facing strings will use the `useTranslations` hook from `next-intl` with the `workflow` namespace. The component will display correctly in all six supported languages (en, fr, es, de, nl, it) without layout breaks.

---

## 2. Dependencies

### 2.1 Epic 1 Foundation (Complete)

| Dependency | Location | Status |
|------------|----------|--------|
| next-intl package | `package.json` | Installed |
| i18n configuration | `/src/lib/i18n/config.ts` | Complete |
| NextIntlClientProvider | `/src/app/layout.tsx` | Configured |
| Translation files | `/messages/*.json` | Created |

### 2.2 Component Dependencies

| Component | Location | Status |
|-----------|----------|--------|
| useSuggestions hook | `/src/components/ItemCreationWorkflow/hooks` | No i18n needed |
| SuggestionButton | `.../shared/SuggestionButton.tsx` | Needs i18n (minor) |
| ItemNameEditor | `.../shared/ItemNameEditor.tsx` | Needs i18n |
| DuplicateNameWarning | `.../shared/DuplicateNameWarning.tsx` | Needs i18n |
| ROOM_LABELS constant | `.../utils/constants.ts` | Already externalized |

---

## 3. Implementation Approach

### 3.1 Translation Key Structure

Keys will be added to the `workflow` namespace following the established naming convention:

```json
{
  "workflow": {
    "steps": {
      "specificItem": {
        "title": "What specific item?",
        "subtitle": "Select from suggestions or enter a custom item for {roomLabel}",
        "suggestionsLabel": "Suggestions",
        "otherOption": "Other...",
        "customItemLabel": "Enter custom item name",
        "itemNameLabel": "Enter item name",
        "customItemPlaceholder": "e.g., Coffee Maker, Smart Thermostat"
      }
    },
    "shared": {
      "itemNameEditor": {
        "label": "Item Name",
        "placeholder": "Enter item name",
        "hint": "This name will appear on the QR code label"
      },
      "suggestionButton": {
        "createdStatus": "Created"
      },
      "duplicateWarning": {
        "exactMatch": "Exact name already exists",
        "similarMatch": "Similar name already used",
        "moreItems": "+{count} more..."
      }
    },
    "buttons": {
      "continue": "Continue"
    }
  }
}
```

### 3.2 Component Update Pattern

Following the established pattern from `LogoutButton.tsx`:

```typescript
'use client';

import { useTranslations } from 'next-intl';

export function SpecificItemStep({ ... }) {
  const t = useTranslations('workflow.steps.specificItem');
  const tButtons = useTranslations('workflow.buttons');

  return (
    <div>
      <h2>{t('title')}</h2>
      <p>{t('subtitle', { roomLabel })}</p>
      {/* ... */}
      <button>{tButtons('continue')}</button>
    </div>
  );
}
```

### 3.3 Shared Component Updates

Each shared component will receive its own translation hook call:

**SuggestionButton:**
```typescript
const t = useTranslations('workflow.shared.suggestionButton');
// Usage: t('createdStatus')
```

**ItemNameEditor:**
```typescript
const t = useTranslations('workflow.shared.itemNameEditor');
// Usage: t('label'), t('hint')
```

**DuplicateNameWarning:**
```typescript
const t = useTranslations('workflow.shared.duplicateWarning');
// Usage: t('exactMatch'), t('similarMatch'), t('moreItems', { count: remaining })
```

---

## 4. Authorized Files and Functions for Modification

### 4.1 Primary Component

| File | Functions/Sections | Change Type |
|------|-------------------|-------------|
| `/src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx` | `SpecificItemStep` function, import statements, JSX return | Modify |

**Specific changes:**
- Line 1-16: Add `useTranslations` import from 'next-intl'
- Line 58-68: Add translation hook calls after component function declaration
- Line 135-141: Replace hardcoded header strings with t() calls
- Line 146-148: Replace "Suggestions" with t() call
- Line 163-169: Replace "Other..." with t() call
- Line 177-181: Replace form labels with t() calls
- Line 188: Replace placeholder with t() call
- Line 241-243: Replace "Continue" button text with t() call

### 4.2 Shared Components

| File | Functions/Sections | Change Type |
|------|-------------------|-------------|
| `/src/components/ItemCreationWorkflow/components/shared/SuggestionButton.tsx` | `SuggestionButton` function, imports, line 96 | Modify |
| `/src/components/ItemCreationWorkflow/components/shared/ItemNameEditor.tsx` | `ItemNameEditor` function, imports, lines 69, 107 | Modify |
| `/src/components/ItemCreationWorkflow/components/shared/DuplicateNameWarning.tsx` | `DuplicateNameWarning` function, imports, MESSAGES constant | Modify |

**SuggestionButton.tsx changes:**
- Add `useTranslations` import
- Line 96: Replace "Created" with `t('createdStatus')`

**ItemNameEditor.tsx changes:**
- Add `useTranslations` import
- Line 69: Replace "Item Name" with `t('label')`
- Line 107: Replace hint text with `t('hint')`

**DuplicateNameWarning.tsx changes:**
- Add `useTranslations` import
- Lines 37-40: Remove hardcoded MESSAGES constant
- Lines 56, 99, 135: Use t() for warning messages
- Lines 128, 134: Use t('moreItems', { count }) for overflow indicator

### 4.3 Translation Files

| File | Change Type |
|------|-------------|
| `/messages/en.json` | Add workflow.steps.specificItem and workflow.shared namespaces |
| `/messages/fr.json` | Add French translations |
| `/messages/es.json` | Add Spanish translations |
| `/messages/de.json` | Add German translations |
| `/messages/nl.json` | Add Dutch translations |
| `/messages/it.json` | Add Italian translations |

### 4.4 Test Files (If Exist)

| File | Change Type |
|------|-------------|
| `/src/components/ItemCreationWorkflow/components/steps/__tests__/SpecificItemStep.test.tsx` | Update to mock translations |

---

## 5. Implementation Tasks

### Task 5.1: Add Translation Keys to messages/en.json
**Estimated Strings:** 12
- Add `workflow.steps.specificItem` namespace with 7 keys
- Add `workflow.shared.itemNameEditor` namespace with 3 keys
- Add `workflow.shared.suggestionButton` namespace with 1 key
- Add `workflow.shared.duplicateWarning` namespace with 3 keys
- Ensure `workflow.buttons.continue` exists (may already exist)

### Task 5.2: Update SpecificItemStep Component
- Import `useTranslations` from 'next-intl'
- Initialize translation hooks at component level
- Replace all 8 hardcoded strings with t() calls
- Handle dynamic `{roomLabel}` interpolation in subtitle

### Task 5.3: Update SuggestionButton Component
- Import `useTranslations` from 'next-intl'
- Replace "Created" status label (line 96)

### Task 5.4: Update ItemNameEditor Component
- Import `useTranslations` from 'next-intl'
- Replace "Item Name" label (line 69)
- Replace hint text (line 107)

### Task 5.5: Update DuplicateNameWarning Component
- Import `useTranslations` from 'next-intl'
- Remove hardcoded MESSAGES constant
- Replace warning messages with t() calls
- Use dynamic interpolation for "+N more..." text

### Task 5.6: Generate Translations for 5 Non-English Languages
- French (fr.json)
- Spanish (es.json)
- German (de.json)
- Dutch (nl.json)
- Italian (it.json)

### Task 5.7: Update Unit Tests
- Mock `useTranslations` in test files
- Verify component renders with mocked translations
- Ensure all test assertions still pass

### Task 5.8: Visual QA Validation
- Test component in all 6 languages
- Verify no layout breaks with longer translations (esp. German)
- Confirm button sizes accommodate translated text
- Verify responsive behavior across viewport sizes

---

## 6. Acceptance Criteria Verification

| Criteria | Verification Method |
|----------|---------------------|
| Component imports useTranslations hook | Code review |
| Workflow namespace loaded correctly | Runtime test, console check |
| All hardcoded strings replaced | Code search for quoted strings |
| Dynamic roomLabel interpolation works | Manual test with different rooms |
| SuggestionButton shows translated "Created" | Visual test |
| ItemNameEditor label and hint translated | Visual test |
| DuplicateNameWarning messages translated | Trigger duplicate name, visual test |
| No layout breaks in any language | Visual test all 6 languages |
| No missing translation warnings | Console check in all languages |
| Existing functionality preserved | Run existing test suite |
| Graceful fallback for missing keys | Test with intentionally missing key |

---

## 7. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| German text overflow in buttons | Medium | Low | Use flexible button widths, test thoroughly |
| Translation key typos | Low | Medium | TypeScript checking, visual verification |
| Shared component breaking other consumers | Low | High | Test all step components that use shared components |
| Test mock complexity | Low | Low | Use simple mock pattern from existing tests |

---

## 8. Related Documents

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- Epic 1 Foundation: `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- i18n Configuration: `/src/lib/i18n/config.ts`
- Working i18n Example: `/src/components/LogoutButton.tsx`
- Messages Template: `/messages/en.json`

---

## 9. Notes

### 9.1 Existing i18n Pattern Reference

The `LogoutButton.tsx` component demonstrates the working pattern:
```typescript
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');

  return <button>{t('signOut')}</button>;
}
```

### 9.2 Character Count Display

The ItemNameEditor shows a character count (`{count}/{maxLength}`). This numeric display does not require translation as it uses universal numeric formatting.

### 9.3 ROOM_LABELS Consideration

The `ROOM_LABELS` constant in `/src/components/ItemCreationWorkflow/utils/constants.ts` is already externalized and imported. For full i18n, these labels should eventually be translated. However, this is part of a broader constants internationalization effort (Task 2C.11 in the implementation plan) and is **out of scope** for this specific task.

### 9.4 Aria Labels

Current aria-labels like `aria-label="Select a specific item"` should also be translated for full accessibility in all languages. This is covered by the acceptance criteria "ARIA labels for form input accessibility use translated strings."
