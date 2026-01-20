# Implementation Breakdown: REQ-E02-062 - Update ContentTypeStep Component

**Document Version:** 1.0
**Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E02-062
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.7
**Estimated Size:** M (Medium)

---

## Overview

This document provides the implementation breakdown for updating the `ContentTypeStep` component to use the i18n translation system. This component is Step 5 of the item creation workflow and allows users to select how they want to add content (Record Video, Take Photo, Write Text, Upload File, Add Link).

The ContentTypeStep component contains:
- Step header text ("What content would you like to add?")
- Instructional subtitle ("Choose how you want to add information for this item")
- Five unified content option cards with labels and subtitles
- Keyboard navigation screen reader help text
- "Continue" button text
- Accessibility labels for the radiogroup interface

**Key Challenge:** The content option labels and subtitles are defined in the `UNIFIED_CONTENT_OPTIONS` constant in `/src/components/ItemCreationWorkflow/utils/constants.ts`. The component must use the translation system instead of hardcoded labels from the constants.

**Note:** There are TWO `ContentTypeStep.tsx` files in the codebase:
1. `/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx` (PRIMARY - uses UNIFIED_CONTENT_OPTIONS)
2. `/src/components/ItemCapture/components/steps/ContentTypeStep.tsx` (LEGACY - uses simpler CONTENT_OPTIONS)

This task focuses on the PRIMARY ItemCreationWorkflow version. The ItemCapture version should be updated in a separate task if still in active use.

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
| PurposeStep updated | REQ-E02-061 (Task 2C.6) | Recommended - Previous step with similar pattern |

### Existing Patterns to Follow
- Translation file structure in `/messages/en.json` (common, auth, dashboard, workflow namespaces)
- Key naming convention: `{namespace}.{component/area}.{element}.{variant?}`
- ICU message format for pluralization and interpolation
- Client component pattern using `useTranslations` hook
- Card selection pattern from PurposeStep (REQ-E02-061)

---

## Technical Context

### Current State Analysis

The `ContentTypeStep.tsx` component (located at `/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`) is a client component (`'use client'`) that renders Step 5 of the item creation workflow. It displays content type options as selectable cards using the `UNIFIED_CONTENT_OPTIONS` constant.

#### Identified Hardcoded Strings in ContentTypeStep.tsx

| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 224 | `"What content would you like to add?"` | `workflow.steps.contentType.title` |
| 225 | `"Choose how you want to add information for this item"` | `workflow.steps.contentType.subtitle` |
| 284 | `"Select content type"` (aria-label) | `workflow.steps.contentType.ariaLabel` |
| 305-306 | `"Use arrow keys to navigate. Press Enter or Space to select."` | `workflow.steps.contentType.keyboardHelp` |
| 325 | `"Continue"` | `workflow.steps.contentType.continueButton` or `common.actions.continue` |

#### Hardcoded Strings in constants.ts (UNIFIED_CONTENT_OPTIONS, Lines 204-241)

The content option labels and subtitles are stored in constants and need to be replaced with translation keys:

| Option ID | Current Label | Current Subtitle | Translation Keys |
|-----------|--------------|------------------|------------------|
| `record-video` | "Record Video" | (none) | `workflow.steps.contentType.options.recordVideo.label` |
| `take-photo` | "Take Photo" | (none) | `workflow.steps.contentType.options.takePhoto.label` |
| `write-text` | "Write Text" | (none) | `workflow.steps.contentType.options.writeText.label` |
| `upload-file` | "Upload File" | "Video, Image, PDF, Text" | `workflow.steps.contentType.options.uploadFile.label`, `.subtitle` |
| `add-link` | "Add Link" | (none) | `workflow.steps.contentType.options.addLink.label` |

### Component Structure

```
ContentTypeStep.tsx
├── imports UNIFIED_CONTENT_OPTIONS from ../../utils/constants
├── imports UnifiedContentOption type from ../../utils/constants
├── imports ContentType from ../../ItemCreationWorkflow.types
├── contains ContentTypeCard inline component (lines 97-199)
│   ├── uses option.label for card title (line 176)
│   └── uses option.subtitle for card description (line 178-186)
├── contains radiogroup with aria-label (line 284)
├── contains step header h2 (line 273-274)
├── contains step subtitle p (line 276-278)
├── contains keyboard help screen reader text (lines 305-307)
└── contains Continue button (lines 310-327)
```

### Content Option ID to Translation Key Mapping

A mapping function is needed to convert kebab-case option IDs to camelCase translation keys:

```typescript
const CONTENT_OPTION_TO_KEY: Record<string, string> = {
  'record-video': 'recordVideo',
  'take-photo': 'takePhoto',
  'write-text': 'writeText',
  'upload-file': 'uploadFile',
  'add-link': 'addLink',
};
```

---

## Implementation Tasks

### Task 1: Add useTranslations Hook to ContentTypeStep Component
**Priority:** Critical
**Estimate:** 0.25 story points

Add the `useTranslations` hook import and initialization at the component level.

**Implementation:**
```typescript
// Add import at top of file (after line 25)
import { useTranslations } from 'next-intl';

// Inside ContentTypeStep component, at the beginning (after line 211)
export function ContentTypeStep({...props}: ContentTypeStepProps) {
  const t = useTranslations('workflow.steps.contentType');

  // ... rest of component
}
```

**Acceptance Criteria:**
- [ ] Import statement added for useTranslations from 'next-intl'
- [ ] Hook initialized at component scope with 'workflow.steps.contentType' namespace
- [ ] No re-initialization on every render (hook called at component level, not in callbacks)

### Task 2: Create Content Option ID to Translation Key Mapping
**Priority:** High
**Estimate:** 0.25 story points

Create a mapping to convert kebab-case option IDs to camelCase translation keys.

**Implementation:**
```typescript
// Add after ICON_MAP constant (after line 91)

/**
 * Maps content option IDs (kebab-case) to translation keys (camelCase).
 * Used for looking up translations in the workflow.steps.contentType.options namespace.
 */
const CONTENT_OPTION_TO_KEY: Record<string, string> = {
  'record-video': 'recordVideo',
  'take-photo': 'takePhoto',
  'write-text': 'writeText',
  'upload-file': 'uploadFile',
  'add-link': 'addLink',
};
```

**Acceptance Criteria:**
- [ ] Mapping constant defined after ICON_MAP
- [ ] All five content option IDs have corresponding translation key mappings
- [ ] Mapping uses string as Record key type (option IDs are strings)

### Task 3: Update ContentTypeCard Component to Accept Translations
**Priority:** Critical
**Estimate:** 0.5 story points

The `ContentTypeCard` inline component receives the label and subtitle from the parent. We need to pass translated strings instead of the hardcoded ones from constants.

**Current Code (Lines 289-303):**
```tsx
{contentOptions.map((option, index) => (
  <ContentTypeCard
    key={option.id}
    ref={(el) => { cardRefs.current[index] = el; }}
    option={{
      type: option.id,
      label: option.label,
      subtitle: option.subtitle,
      icon: getIconComponent(option.icon),
    }}
    isSelected={currentSelection === option.id}
    onSelect={() => handleContentSelect(option)}
    tabIndex={index === activeIndex ? 0 : -1}
  />
))}
```

**Updated Code:**
```tsx
{contentOptions.map((option, index) => (
  <ContentTypeCard
    key={option.id}
    ref={(el) => { cardRefs.current[index] = el; }}
    option={{
      type: option.id,
      label: t(`options.${CONTENT_OPTION_TO_KEY[option.id]}.label`),
      subtitle: option.subtitle ? t(`options.${CONTENT_OPTION_TO_KEY[option.id]}.subtitle`) : undefined,
      icon: getIconComponent(option.icon),
    }}
    isSelected={currentSelection === option.id}
    onSelect={() => handleContentSelect(option)}
    tabIndex={index === activeIndex ? 0 : -1}
  />
))}
```

**Acceptance Criteria:**
- [ ] All five content option labels use translation keys
- [ ] Subtitle only uses translation key if the option has a subtitle (upload-file)
- [ ] Labels and subtitles display correctly for each content type
- [ ] Selected and unselected styling still works correctly

### Task 4: Update Step Header Text
**Priority:** High
**Estimate:** 0.25 story points

Replace the hardcoded step header and subtitle text with translation keys.

**Current Code (Lines 270-279):**
```tsx
return (
  <div className={cn('flex flex-col flex-1 p-6', className)}>
    {/* Step header */}
    <div className="mb-6">
      <h2 className="text-2xl font-semibold text-[#222222] mb-2">
        {headerText}
      </h2>
      <p className="text-base text-[#717171]">
        {descriptionText}
      </p>
    </div>
```

Note: The `headerText` and `descriptionText` are defined as constants (lines 223-225):
```tsx
const headerText = 'What content would you like to add?';
const descriptionText = 'Choose how you want to add information for this item';
```

**Updated Code:**
Remove the headerText and descriptionText constants and use translations directly:

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
- [ ] headerText and descriptionText constants removed
- [ ] Step title uses translation key `workflow.steps.contentType.title`
- [ ] Step subtitle uses translation key `workflow.steps.contentType.subtitle`
- [ ] Header maintains existing styling and structure

### Task 5: Update Radiogroup Aria-Label
**Priority:** High
**Estimate:** 0.25 story points

Replace the hardcoded radiogroup aria-label with a translation key.

**Current Code (Lines 282-288):**
```tsx
{/* Content type cards grid */}
<div
  role="radiogroup"
  aria-label="Select content type"
  aria-describedby="content-type-help"
  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
  onKeyDown={handleGridKeyDown}
>
```

**Updated Code:**
```tsx
{/* Content type cards grid */}
<div
  role="radiogroup"
  aria-label={t('ariaLabel')}
  aria-describedby="content-type-help"
  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
  onKeyDown={handleGridKeyDown}
>
```

**Acceptance Criteria:**
- [ ] Radiogroup aria-label uses translation key
- [ ] Screen readers announce translated label

### Task 6: Update Keyboard Help Text for Screen Readers
**Priority:** Medium
**Estimate:** 0.25 story points

Replace the hardcoded screen reader help text with a translation key.

**Current Code (Lines 305-307):**
```tsx
<p id="content-type-help" className="sr-only">
  Use arrow keys to navigate. Press Enter or Space to select.
</p>
```

**Updated Code:**
```tsx
<p id="content-type-help" className="sr-only">
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

**Current Code (Lines 310-327):**
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
      "contentType": {
        "title": "What content would you like to add?",
        "subtitle": "Choose how you want to add information for this item",
        "ariaLabel": "Select content type",
        "keyboardHelp": "Use arrow keys to navigate. Press Enter or Space to select.",
        "continueButton": "Continue",
        "options": {
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

### Task 9: Clean Up Unused Local Constants
**Priority:** Low
**Estimate:** 0.25 story points

Remove the local `headerText` and `descriptionText` constants that are no longer needed.

**Current Code (Lines 223-225):**
```typescript
// Updated header text for unified options
const headerText = 'What content would you like to add?';
const descriptionText = 'Choose how you want to add information for this item';
```

**Action:** Remove these lines entirely, as translations are used directly.

**Acceptance Criteria:**
- [ ] Local headerText constant removed
- [ ] Local descriptionText constant removed
- [ ] No unused variables in the file

---

## Authorized Files and Functions for Modification

### Primary Files to Modify

| File | Purpose | Modification Type |
|------|---------|-------------------|
| `/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx` | Content type selection step component | Add useTranslations hook, replace all hardcoded strings, add ID-to-key mapping |
| `/messages/en.json` | English translations | Add workflow.steps.contentType namespace with all keys |

### Functions to Modify

| Function/Section | File | Modification |
|------------------|------|--------------|
| `ContentTypeStep` component | ContentTypeStep.tsx | Add `useTranslations` hook, use translation keys |
| Import statements | ContentTypeStep.tsx | Add useTranslations import |
| `CONTENT_OPTION_TO_KEY` constant | ContentTypeStep.tsx | Add new mapping constant |
| Step header JSX | ContentTypeStep.tsx | Use `t('title')` and `t('subtitle')` |
| Radiogroup aria-label | ContentTypeStep.tsx | Use `t('ariaLabel')` |
| ContentTypeCard rendering | ContentTypeStep.tsx | Use `t('options.{key}.label')` and `t('options.{key}.subtitle')` |
| Keyboard help text | ContentTypeStep.tsx | Use `t('keyboardHelp')` |
| Continue button | ContentTypeStep.tsx | Use `t('continueButton')` |
| headerText/descriptionText constants | ContentTypeStep.tsx | Remove (no longer needed) |

### Files for Reference Only (Not Modified in This Task)

| File | Purpose |
|------|---------|
| `/src/components/ItemCreationWorkflow/utils/constants.ts` | Contains UNIFIED_CONTENT_OPTIONS - keep for non-UI contexts (type information, icon mapping) |
| `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Contains ContentType type definition |
| `/src/lib/i18n/config.ts` | i18n configuration (read-only reference) |
| `/src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx` | Prior step - reference for card selection pattern |
| `/src/components/ItemCapture/components/steps/ContentTypeStep.tsx` | Legacy version - not modified in this task |

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
- Navigate to item creation workflow (Step 5 - Content Type Selection)
- Open browser console, verify no translation-related errors
- Verify all text displays correctly

### 3. Functional Testing
- Verify step title displays translated text ("What content would you like to add?")
- Verify step subtitle displays translated text
- Verify all five content type option cards display:
  - Translated labels (Record Video, Take Photo, Write Text, Upload File, Add Link)
  - Translated subtitle for Upload File option ("Video, Image, PDF, Text")
  - Correct icons
- Click on each content type option and verify selection state updates
- Verify auto-advance behavior after selection still works (150ms delay)
- Verify Continue button text and functionality

### 4. Accessibility Testing
- Use screen reader (VoiceOver/NVDA) to navigate content type cards
- Verify radiogroup aria-label is announced correctly
- Verify each content type card's label and subtitle is announced
- Verify keyboard help text is announced (sr-only text)
- Use keyboard to navigate (Arrow keys work in 2-column grid, Enter/Space to select)
- Verify selection state is announced by screen reader

### 5. Edge Case Testing
- Test with content type already pre-selected (verify correct option highlighted)
- Verify keyboard navigation loops correctly at boundaries (grid navigation)
- Verify tab index management works (roving tabindex pattern)
- Test on mobile viewport (1-column layout)
- Test on tablet/desktop viewport (2-column layout)

### 6. Language Switching Test
- Change browser language or use language switcher (if available)
- Verify all ContentTypeStep strings update
- Verify no mixed-language content

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing dependency on REQ-E02-056 | Medium | High | Verify workflow namespace exists before starting |
| ID-to-key mapping mismatch | Medium | High | Test all five content types display correctly |
| Auto-advance timing affected | Low | Medium | Verify 150ms delay still works after changes |
| Grid keyboard navigation affected | Medium | Medium | Test arrow key navigation in both 1-col and 2-col layouts |
| Screen reader announcement quality | Medium | Medium | Test with actual screen readers, not just ARIA inspection |
| Subtitle conditional rendering issue | Low | Medium | Test Upload File option shows subtitle, others don't |

---

## Notes for Implementation

### 1. Client Component Requirement
The `ContentTypeStep` component is marked with `'use client'`, which is compatible with the `useTranslations` hook from next-intl. No changes needed for server/client boundary.

### 2. Constants File Consideration
The `UNIFIED_CONTENT_OPTIONS` constant in `/src/components/ItemCreationWorkflow/utils/constants.ts` contains:
- `id` - Used for selection state tracking
- `icon` - Used for icon component mapping
- `contentType` - Used for workflow state
- `contentSource` - Used for workflow state
- `label` - Replaced with translation
- `subtitle` - Replaced with translation (only for upload-file)

Keep the constant structure intact; only the `label` and `subtitle` fields are replaced with translations in the component rendering.

### 3. ID-to-Key Mapping Rationale
The content option IDs use kebab-case (e.g., `record-video`, `upload-file`) which doesn't work well in JSON key paths. The mapping converts to camelCase (e.g., `recordVideo`, `uploadFile`) for cleaner translation keys.

### 4. Auto-Advance Behavior
The component auto-advances to the next step after a 150ms delay when a content type is selected. This behavior should remain unchanged after localization.

### 5. Grid vs List Layout
The ContentTypeStep uses a 2-column grid on larger screens and 1-column on mobile. The keyboard navigation adapts to this layout. This grid-based navigation differs from PurposeStep's single-column list.

### 6. ContentTypeCard Inline Component
The `ContentTypeCard` is defined inline within the file (using `forwardRef`). The translation happens in the parent when passing props to this component, not within ContentTypeCard itself.

### 7. Only One Subtitle
Of the five content options, only "Upload File" has a subtitle ("Video, Image, PDF, Text"). The other four options have `subtitle: undefined`. The translation lookup should handle this conditional.

### 8. Coordination with Prior Tasks
Follow the same patterns established in:
- REQ-E02-061 (PurposeStep) - Similar card selection pattern with icons
- REQ-E02-059 (ItemTypeStep) - Similar card pattern

---

## Acceptance Criteria Summary

From the request document (REQ-E02-062):

- [ ] Step header text is extracted to localization namespace
- [ ] Instructional text describing content type selection and its purpose is extracted to localization namespace
- [ ] Accessibility label for the content type selection interface is extracted to localization namespace
- [ ] Keyboard navigation help text is extracted to localization namespace
- [ ] All content type option labels are extracted to localization namespace with appropriate keys
- [ ] Description text for each content type explaining its characteristics is extracted to localization namespace
- [ ] File format specification text (e.g., "Supports JPG, PNG, GIF") is extracted to localization namespace (N/A - only "Video, Image, PDF, Text" subtitle for Upload File)
- [ ] File size limitation messages are extracted to localization namespace (N/A - not present in component)
- [ ] Help text or tooltips explaining content type recommendations are extracted to localization namespace (N/A - not present)
- [ ] Continue button text is extracted to localization namespace
- [ ] Back button text is extracted to localization namespace (N/A - no back button in this component)
- [ ] Validation message for required content type selection is extracted to localization namespace (N/A - auto-advance, no validation message)
- [ ] Warning messages about unsupported formats are extracted to localization namespace (N/A - not present)
- [ ] Optional helper text about changing content type later is extracted to localization namespace (N/A - not present)
- [ ] Component uses appropriate i18n hooks (useTranslations) to retrieve all translated strings
- [ ] All ARIA labels and accessibility strings are properly localized
- [ ] Component renders correctly with translations in all supported languages
- [ ] No hardcoded English strings remain in the component code
- [ ] Content type option translations use terminology familiar to users across different cultural contexts
- [ ] Technical format specifications (file extensions) remain consistent while descriptive text is localized
- [ ] Selection state announcements for screen readers are localized (handled by aria-checked attribute, no custom text)
- [ ] Any conditional messages based on content type selection are localized (N/A - none present)
- [ ] Icon labels or button tooltips within the content type selection UI are localized (icons are aria-hidden)
- [ ] Variable interpolation correctly handles any dynamic content such as file size limits or format lists (N/A - no variables in this component)

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [REQ-E02-056: Create Workflow Namespace Structure](/docs/REQ-E02-056-create-workflow-namespace-structure-overview.md)
- [REQ-E02-057: Update Main ItemCreationWorkflow Component](/docs/REQ-E02-057-update-main-itemcreationworkflow-component-overview.md)
- [REQ-E02-058: Update RoomSelectionStep](/docs/REQ-E02-058-update-roomselectionstep-overview.md)
- [REQ-E02-059: Update ItemTypeStep](/docs/REQ-E02-059-update-itemtypestep-overview.md)
- [REQ-E02-060: Update SpecificItemStep](/docs/REQ-E02-060-update-specificitemstep-overview.md)
- [REQ-E02-061: Update PurposeStep](/docs/REQ-E02-061-update-purposestep-overview.md)
- [Request Documentation](/docs/gen_requests_epic2.md#REQ-E02-062)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2C: Item Creation Workflow*
