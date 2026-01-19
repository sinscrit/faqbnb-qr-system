# REQ-162: Update ContentTypeStep Component for Internationalization

**Document Created:** 2026-01-19 23:15 UTC
**Last Modified:** 2026-01-19 23:15 UTC
**Epic:** Epic 2: Static UI Localization
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.7
**Type:** ENHANCEMENT
**Size:** M (Medium)
**Priority:** P2

---

## 1. Overview

### 1.1 Summary

This document outlines the implementation plan for internationalizing the ContentTypeStep component, which is Step 5 of the item creation workflow. The component allows users to select the content type/format they want to use (e.g., Record Video, Take Photo, Write Text, Upload File, Add Link) when creating documentation for an item. This is the unified content selection interface consolidated from Plan-094.

### 1.2 Current State

The ContentTypeStep component (`/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`) currently contains 15+ hardcoded English strings including:

**Step Header Strings:**
- Heading: "What content would you like to add?"
- Subtitle: "Choose how you want to add information for this item"

**Content Type Option Labels (5 options from UNIFIED_CONTENT_OPTIONS):**
- "Record Video"
- "Take Photo"
- "Write Text"
- "Upload File"
- "Add Link"

**Content Type Option Subtitles (1):**
- "Video, Image, PDF, Text" (for Upload File option)

**Accessibility Strings:**
- Radiogroup aria-label: "Select content type"
- Screen reader help: "Use arrow keys to navigate. Press Enter or Space to select."

**Button Text:**
- "Continue"

The component imports `UNIFIED_CONTENT_OPTIONS` from `/src/components/ItemCreationWorkflow/utils/constants.ts`, which contains hardcoded English labels and subtitles.

### 1.3 Target State

All user-facing strings will use the `useTranslations` hook from `next-intl` with the `workflow` namespace. The component will display correctly in all six supported languages (en, fr, es, de, nl, it) without layout breaks. Content type selection logic will continue to use internal constants (`record-video`, `take-photo`, etc.) for language-independent operation.

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
| UNIFIED_CONTENT_OPTIONS constant | `.../utils/constants.ts` | Labels/subtitles will be replaced with t() calls |
| ContentTypeCard component | `ContentTypeStep.tsx` (inline) | Will use translated labels |
| createKeyboardNavigator utility | `.../utils/accessibility.ts` | No change needed (behavioral) |
| ICON_MAP mapping | `ContentTypeStep.tsx` | No change needed (visual only) |

---

## 3. Implementation Approach

### 3.1 Translation Key Structure

Keys will be added to the `workflow` namespace following the established naming convention:

```json
{
  "workflow": {
    "steps": {
      "contentType": {
        "title": "What content would you like to add?",
        "subtitle": "Choose how you want to add information for this item"
      }
    },
    "contentTypes": {
      "recordVideo": {
        "label": "Record Video"
      },
      "takePhoto": {
        "label": "Take Photo"
      },
      "writeText": {
        "label": "Write Text"
      },
      "uploadFile": {
        "label": "Upload File",
        "subtitle": "Video, Image, PDF, Text"
      },
      "addLink": {
        "label": "Add Link"
      }
    },
    "accessibility": {
      "contentTypeStep": {
        "ariaLabel": "Select content type",
        "keyboardHelp": "Use arrow keys to navigate. Press Enter or Space to select."
      }
    },
    "buttons": {
      "continue": "Continue"
    }
  }
}
```

### 3.2 Content Option ID to Translation Key Mapping

A mapping function will convert internal option IDs to translation keys:

```typescript
// Map from internal ID (e.g., 'record-video') to translation key (e.g., 'recordVideo')
const CONTENT_OPTION_TO_KEY: Record<string, string> = {
  'record-video': 'recordVideo',
  'take-photo': 'takePhoto',
  'write-text': 'writeText',
  'upload-file': 'uploadFile',
  'add-link': 'addLink',
};
```

### 3.3 Component Update Pattern

Following the established pattern from `LogoutButton.tsx` and `PurposeStep.tsx`:

```typescript
'use client';

import { useTranslations } from 'next-intl';

export function ContentTypeStep({ ... }) {
  const t = useTranslations('workflow');

  // Map option ID to translation key
  const getLabel = (optionId: string) => t(`contentTypes.${CONTENT_OPTION_TO_KEY[optionId]}.label`);
  const getSubtitle = (optionId: string) => {
    const key = `contentTypes.${CONTENT_OPTION_TO_KEY[optionId]}.subtitle`;
    // Return undefined for options without subtitles
    return optionId === 'upload-file' ? t(key) : undefined;
  };

  return (
    <div>
      <h2>{t('steps.contentType.title')}</h2>
      <p>{t('steps.contentType.subtitle')}</p>

      <div role="radiogroup" aria-label={t('accessibility.contentTypeStep.ariaLabel')}>
        {contentOptions.map((option) => (
          <ContentTypeCard
            key={option.id}
            option={{
              type: option.id,
              label: getLabel(option.id),
              subtitle: getSubtitle(option.id),
              icon: getIconComponent(option.icon),
            }}
            ...
          />
        ))}
      </div>

      <p className="sr-only">{t('accessibility.contentTypeStep.keyboardHelp')}</p>

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
| `/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx` | `ContentTypeStep` function, `ContentTypeCard` component, import statements, JSX return | Modify |

**Specific changes:**
- Lines 1-42: Add `useTranslations` import from 'next-intl'
- Lines 67-84: Keep ICON_MAP unchanged (visual only)
- Lines 97-108: Update ContentTypeCardProps to accept translated label/subtitle
- Lines 109-199: ContentTypeCard component - displays translated labels/subtitles (already receives props, minimal change)
- Lines 205-241: Add translation hook call and helper functions after component function declaration
- Lines 223-226: Replace hardcoded `headerText` and `descriptionText` with t() calls
- Lines 282-287: Replace hardcoded `aria-label` and `aria-describedby` content with t() calls
- Lines 289-303: Update option rendering to use translated labels/subtitles
- Lines 305-307: Replace hardcoded screen reader help text with t() call
- Lines 309-327: Replace hardcoded "Continue" button text with t() call

### 4.2 Translation Files

| File | Change Type |
|------|-------------|
| `/messages/en.json` | Add `workflow.steps.contentType`, `workflow.contentTypes`, and `workflow.accessibility.contentTypeStep` namespaces |
| `/messages/fr.json` | Add French translations |
| `/messages/es.json` | Add Spanish translations |
| `/messages/de.json` | Add German translations |
| `/messages/nl.json` | Add Dutch translations |
| `/messages/it.json` | Add Italian translations |

### 4.3 Constants File (Optional)

| File | Change Type |
|------|-------------|
| `/src/components/ItemCreationWorkflow/utils/constants.ts` | Consider keeping UNIFIED_CONTENT_OPTIONS for structural data but labels will be fetched from translations |

### 4.4 Test Files

| File | Change Type |
|------|-------------|
| `/src/components/ItemCreationWorkflow/components/steps/__tests__/ContentTypeStep.test.tsx` | Update to mock translations |

### 4.5 Files NOT to Modify

| File | Reason |
|------|--------|
| `/src/components/ItemCreationWorkflow/utils/accessibility.ts` | Keyboard navigation logic is language-independent |
| `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Parent component passes props; no direct string changes needed |
| `/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | State machine uses internal IDs, not translated text |

---

## 5. Implementation Tasks

### Task 5.1: Add Translation Keys to messages/en.json
**Estimated Strings:** 15
- Add `workflow.steps.contentType` namespace with 2 keys (title, subtitle)
- Add `workflow.contentTypes` namespace with 5 content types:
  - `recordVideo.label` (1 key)
  - `takePhoto.label` (1 key)
  - `writeText.label` (1 key)
  - `uploadFile.label` and `uploadFile.subtitle` (2 keys)
  - `addLink.label` (1 key)
- Add `workflow.accessibility.contentTypeStep` namespace with 2 keys (ariaLabel, keyboardHelp)
- Verify `workflow.buttons.continue` exists (may already exist from prior tasks)

### Task 5.2: Create Content Option ID to Translation Key Mapping
- Create `CONTENT_OPTION_TO_KEY` constant mapping internal IDs to camelCase translation keys
- Add helper functions `getLabel()` and `getSubtitle()` within component

### Task 5.3: Update ContentTypeStep Component
- Import `useTranslations` from 'next-intl'
- Initialize translation hook at component level
- Replace hardcoded heading "What content would you like to add?" with `t('steps.contentType.title')`
- Replace subtitle "Choose how you want to add information for this item" with `t('steps.contentType.subtitle')`
- Replace `aria-label="Select content type"` with `t('accessibility.contentTypeStep.ariaLabel')`
- Update option mapping to use `getLabel(option.id)` for labels
- Update option mapping to use `getSubtitle(option.id)` for subtitles
- Replace screen reader help text with `t('accessibility.contentTypeStep.keyboardHelp')`
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
- Ensure existing tests pass or are updated

### Task 5.6: Visual QA Validation
- Test component in all 6 languages
- Verify no layout breaks with longer translations (especially German)
- Confirm content type card heights remain consistent despite text length variations
- Verify "Upload File" subtitle displays correctly without overflow
- Verify checkmark indicator displays consistently regardless of text length
- Test responsive behavior (2-column on desktop, 1-column on mobile)
- Confirm keyboard navigation works in all languages

---

## 6. Acceptance Criteria Verification

| Criteria | Verification Method |
|----------|---------------------|
| Component imports useTranslations hook | Code review |
| Workflow namespace loaded correctly | Runtime test, console check |
| Heading uses translation key `workflow.steps.contentType.title` | Code review |
| Subtitle uses translation key `workflow.steps.contentType.subtitle` | Code review |
| "Record Video" label uses `workflow.contentTypes.recordVideo.label` | Code review |
| "Take Photo" label uses `workflow.contentTypes.takePhoto.label` | Code review |
| "Write Text" label uses `workflow.contentTypes.writeText.label` | Code review |
| "Upload File" label uses `workflow.contentTypes.uploadFile.label` | Code review |
| "Upload File" subtitle uses `workflow.contentTypes.uploadFile.subtitle` | Code review |
| "Add Link" label uses `workflow.contentTypes.addLink.label` | Code review |
| "Continue" button uses translation key | Code review |
| ARIA label uses translated string | Accessibility test |
| Screen reader help text uses translated string | Accessibility test |
| No hardcoded English strings remain in JSX | Code search |
| Keyboard navigation works in all languages | Manual test |
| Auto-advance on selection (150ms delay) works correctly | Manual test |
| Roving tabindex implementation functions properly across languages | Manual test |
| Selection state management uses internal constants | Code review |
| Content type validation logic functions identically in all languages | Manual test |
| No layout breaks in any language | Visual test all 6 languages |
| Two-column grid layout maintains consistent card heights | Visual test |
| Single-column mobile layout displays correctly | Visual test (small viewport) |
| Subtitle for "Upload File" displays without overflow | Visual test |
| No missing translation warnings | Console check in all languages |
| Existing unit tests pass | Run test suite |
| Checkmark indicator displays consistently | Visual test |
| Icon positioning remains consistent | Visual test |
| Hover and focus states work with translated text | Manual test |
| Active state scaling animation (0.98 scale) works properly | Manual test |

---

## 7. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| German text overflow in content type cards | Medium | Low | Cards have flexible height, test thoroughly |
| Translation key typos | Low | Medium | TypeScript checking, visual verification |
| Tests breaking due to text assertions | High | Medium | Update tests to mock translations |
| Auto-advance timer interference | Low | Low | Timer uses selection callback, not text |
| Missing CONTENT_OPTION_TO_KEY mapping | Low | High | Add all 5 content option IDs to mapping |
| Subtitle handling edge cases | Low | Low | Only "upload-file" has subtitle; explicit check |

---

## 8. Related Documents

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- Epic 1 Foundation: `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- i18n Configuration: `/src/lib/i18n/config.ts`
- Working i18n Example: `/src/components/LogoutButton.tsx`
- Messages Template: `/messages/en.json`
- Request Details: `/docs/gen_requests_epic2.md` (REQ-377 / Task 2C.7)
- Prior ContentTypeStep Consolidation: `/docs/REQ-162-consolidate-content-options-overview.md`
- Similar Workflow Step: `/docs/REQ-376-update-purposestep-overview.md`

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

### 9.2 UNIFIED_CONTENT_OPTIONS Constants Handling

The `UNIFIED_CONTENT_OPTIONS` constant in `constants.ts` currently contains:
```typescript
{
  id: 'record-video',
  label: 'Record Video',  // Will be replaced with t() call
  icon: 'Video',
  contentType: 'video',
  contentSource: 'create-new',
}
```

Two approaches are available:
1. **Keep UNIFIED_CONTENT_OPTIONS as-is** - Use labels as fallbacks, but override with translations in component
2. **Remove labels from UNIFIED_CONTENT_OPTIONS** - Rely entirely on translations

**Recommended:** Keep UNIFIED_CONTENT_OPTIONS for backward compatibility and structural data (id, icon, contentType, contentSource), but use translations for display labels in the component.

### 9.3 Translation Key Naming Convention

Content option IDs use kebab-case (`record-video`, `upload-file`) while translation keys use camelCase (`recordVideo`, `uploadFile`) to follow JSON naming conventions. The `CONTENT_OPTION_TO_KEY` mapping handles this conversion.

### 9.4 Subtitle Handling

Only the "Upload File" option has a subtitle ("Video, Image, PDF, Text"). The helper function should handle this gracefully:

```typescript
const getSubtitle = (optionId: string) => {
  if (optionId === 'upload-file') {
    return t('contentTypes.uploadFile.subtitle');
  }
  return undefined;
};
```

### 9.5 Auto-Advance Behavior

The auto-advance behavior (150ms delay after selection) operates on the internal option ID and contentType/contentSource values, not on displayed text. This ensures the behavior remains consistent across all languages:

```typescript
const handleContentSelect = useCallback((option: UnifiedContentOption) => {
  onSelectContent(option.contentType, option.contentSource);
  setTimeout(() => {
    onNext();
  }, 150);
}, [onSelectContent, onNext]);
```

### 9.6 Keyboard Navigation

The keyboard navigation uses `createKeyboardNavigator` from the accessibility utilities. This navigates by array index, not by text content, so it will work correctly regardless of language.

### 9.7 Component Already Uses 'use client' Directive

The ContentTypeStep component already has the `'use client'` directive at line 1, which is required for using the `useTranslations` hook from next-intl.

### 9.8 Test File Considerations

The test file (`ContentTypeStep.test.tsx`) will need mocked translations. Tests that assert specific English text like `screen.getByText('Record Video')` will need to either:
1. Mock `useTranslations` to return the expected English strings
2. Use test IDs, ARIA roles, or data attributes instead of text content

### 9.9 Checkmark Indicator

The checkmark indicator (`<Check>` icon from lucide-react) for the selected state is purely visual and does not require translation. It should continue to display consistently regardless of text length variations in translated labels.
