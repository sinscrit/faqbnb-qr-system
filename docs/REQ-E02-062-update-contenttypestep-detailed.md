# Detailed Task Breakdown: REQ-E02-062 - Update ContentTypeStep Component

**Document Version:** 1.1
**Created:** 2026-01-20
**Last Modified:** 2026-01-22
**Request ID:** REQ-E02-062
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.7
**Estimated Size:** M (Medium)
**Overview Document:** [REQ-E02-062-update-contenttypestep-overview.md](./REQ-E02-062-update-contenttypestep-overview.md)

---

## Executive Summary

This document provides granular, implementation-ready tasks for updating the `ContentTypeStep` component to use the i18n translation system. The ContentTypeStep is Step 5 of the item creation workflow, allowing users to select how they want to add content (Record Video, Take Photo, Write Text, Upload File, Add Link).

**Total Tasks:** 9 tasks
**Total Story Points:** 2.75 (approximately 1 day of work)

---

## Prerequisites Checklist

Before starting implementation, verify:

- [x] Epic 1 i18n foundation is complete (`next-intl` installed and configured) ---verified---
- [x] REQ-E02-056 (workflow namespace structure) is complete ---verified---
- [x] `/messages/en.json` exists with `workflow` namespace ---verified---
- [x] `useTranslations` hook is available from `next-intl` ---verified---

---

## Task Breakdown

### Task 1: Add Translation Keys to Messages File

**Priority:** P0 - Critical (Must be done first)
**Story Points:** 0.5
**File:** `/messages/en.json`

#### Description
Add all required translation keys for the ContentTypeStep component under the `workflow.steps.contentType` namespace.

#### Implementation Steps

1. Open `/messages/en.json`
2. Navigate to (or create) the `workflow.steps` section
3. Add the `contentType` namespace with all required keys

#### Code to Add

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

#### Acceptance Criteria
- [x] All keys exist under `workflow.steps.contentType` namespace ---implemented: Updated existing contentType namespace with title, subtitle, keyboardHelp, continueButton, and options.{recordVideo,takePhoto,writeText,uploadFile,addLink} with label/subtitle keys---
- [x] JSON file validates without syntax errors (use `npm run build` or JSON linter) ---implemented: Verified with jq parse---
- [x] Key structure matches the pattern used in other workflow steps ---implemented: Follows same pattern as purpose, specificItem steps---
- [x] All five content options have their label keys ---implemented: recordVideo, takePhoto, writeText, uploadFile, addLink all have label keys---
- [x] Upload File option has both label and subtitle keys ---implemented: uploadFile has label and subtitle ("Video, Image, PDF, Text")---

#### Verification
```bash
# Verify JSON is valid
cat messages/en.json | jq '.workflow.steps.contentType'

# Should show all keys without errors
```

---

### Task 2: Add useTranslations Import to ContentTypeStep

**Priority:** P0 - Critical
**Story Points:** 0.25
**File:** `/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`

#### Description
Import the `useTranslations` hook from `next-intl` package.

#### Implementation Steps

1. Open `ContentTypeStep.tsx`
2. Add import statement after existing imports (around line 25, after the `forwardRef` import)

#### Code Change

**Location:** After line 25 (after React imports)

```typescript
// Add this import
import { useTranslations } from 'next-intl';
```

#### Full Import Section After Change
```typescript
import { useCallback, useRef, useState, forwardRef } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
// ... rest of imports
```

#### Acceptance Criteria
- [x] Import statement added for `useTranslations` from `next-intl` ---implemented: Added import after React imports---
- [x] Import placed with other library imports (not mixed with relative imports) ---implemented: Placed after React, before cn utility---
- [x] No TypeScript errors related to the import ---implemented: Verified---

---

### Task 3: Initialize useTranslations Hook in Component

**Priority:** P0 - Critical
**Story Points:** 0.25
**File:** `/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`

#### Description
Initialize the `useTranslations` hook at the component level with the correct namespace.

#### Implementation Steps

1. Locate the `ContentTypeStep` function component (line 205)
2. Add hook initialization immediately after the opening of the component function

#### Code Change

**Location:** Inside `ContentTypeStep` function, after line 211 (after destructuring props)

**Before:**
```typescript
export function ContentTypeStep({
  currentSelection,
  onSelectContent,
  onNext,
  canNext,
  className,
}: ContentTypeStepProps) {
  // Use unified options directly from constants
  const contentOptions = UNIFIED_CONTENT_OPTIONS;
```

**After:**
```typescript
export function ContentTypeStep({
  currentSelection,
  onSelectContent,
  onNext,
  canNext,
  className,
}: ContentTypeStepProps) {
  // Initialize translations
  const t = useTranslations('workflow.steps.contentType');

  // Use unified options directly from constants
  const contentOptions = UNIFIED_CONTENT_OPTIONS;
```

#### Acceptance Criteria
- [x] Hook initialized at component scope (not inside callbacks or effects) ---implemented: Added at top of component function---
- [x] Namespace matches translation file structure: `workflow.steps.contentType` ---implemented: Uses 'workflow.steps.contentType' namespace---
- [x] Hook variable named `t` for consistency with codebase patterns ---implemented: Named t as per convention---

---

### Task 4: Create Content Option ID to Translation Key Mapping

**Priority:** P1 - High
**Story Points:** 0.25
**File:** `/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`

#### Description
Create a mapping constant to convert kebab-case option IDs (from constants) to camelCase translation keys.

#### Implementation Steps

1. Locate the `ICON_MAP` constant (around line 74)
2. Add the new mapping constant after `ICON_MAP` (after line 91)

#### Code Change

**Location:** After line 91 (after `getIconComponent` function)

```typescript
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

#### Acceptance Criteria
- [x] Mapping constant defined as `Record<string, string>` ---implemented: CONTENT_OPTION_TO_KEY defined as Record<string, string>---
- [x] All five option IDs have corresponding translation keys ---implemented: record-video, take-photo, write-text, upload-file, add-link mapped---
- [x] Keys match exactly with JSON file keys (camelCase) ---implemented: recordVideo, takePhoto, writeText, uploadFile, addLink---
- [x] Comment explains the purpose of the mapping ---implemented: JSDoc comment added explaining kebab-case to camelCase mapping---

---

### Task 5: Update Step Header Text to Use Translations

**Priority:** P1 - High
**Story Points:** 0.25
**File:** `/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`

#### Description
Replace the hardcoded `headerText` and `descriptionText` constants with translation calls.

#### Implementation Steps

1. Locate the header text constants (lines 223-225)
2. Remove the constant declarations
3. Update the JSX to use translation calls directly

#### Code Change - Part A: Remove Constants

**Location:** Lines 223-225

**Remove these lines:**
```typescript
// Updated header text for unified options
const headerText = 'What content would you like to add?';
const descriptionText = 'Choose how you want to add information for this item';
```

#### Code Change - Part B: Update JSX

**Location:** Lines 273-278 (in the return statement)

**Before:**
```tsx
<div className="mb-6">
  <h2 className="text-2xl font-semibold text-[#222222] mb-2">
    {headerText}
  </h2>
  <p className="text-base text-[#717171]">
    {descriptionText}
  </p>
</div>
```

**After:**
```tsx
<div className="mb-6">
  <h2 className="text-2xl font-semibold text-[#222222] mb-2">
    {t('title')}
  </h2>
  <p className="text-base text-[#717171]">
    {t('subtitle')}
  </p>
</div>
```

#### Acceptance Criteria
- [x] `headerText` constant removed ---implemented: Removed headerText variable---
- [x] `descriptionText` constant removed ---implemented: Removed descriptionText variable---
- [x] Step title uses `t('title')` ---implemented: h2 now uses {t('title')}---
- [x] Step subtitle uses `t('subtitle')` ---implemented: p now uses {t('subtitle')}---
- [x] No unused variable warnings ---implemented: No unused variables---

---

### Task 6: Update Radiogroup Aria-Label to Use Translation

**Priority:** P1 - High
**Story Points:** 0.25
**File:** `/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`

#### Description
Replace the hardcoded aria-label on the radiogroup element with a translation call.

#### Implementation Steps

1. Locate the radiogroup div (around line 282-287)
2. Update the `aria-label` attribute to use translation

#### Code Change

**Location:** Around line 284

**Before:**
```tsx
<div
  role="radiogroup"
  aria-label="Select content type"
  aria-describedby="content-type-help"
  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
  onKeyDown={handleGridKeyDown}
>
```

**After:**
```tsx
<div
  role="radiogroup"
  aria-label={t('ariaLabel')}
  aria-describedby="content-type-help"
  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
  onKeyDown={handleGridKeyDown}
>
```

#### Acceptance Criteria
- [x] Aria-label uses `t('ariaLabel')` instead of hardcoded string ---implemented: Changed aria-label to {t('ariaLabel')}---
- [x] Screen readers will announce the translated label ---implemented: Translation key exists---
- [x] `aria-describedby` reference remains unchanged ---implemented: Still references content-type-help---

---

### Task 7: Update Keyboard Help Text to Use Translation

**Priority:** P2 - Medium
**Story Points:** 0.25
**File:** `/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`

#### Description
Replace the hardcoded screen reader help text with a translation call.

#### Implementation Steps

1. Locate the help text paragraph (lines 305-307)
2. Update the content to use translation

#### Code Change

**Location:** Lines 305-307

**Before:**
```tsx
<p id="content-type-help" className="sr-only">
  Use arrow keys to navigate. Press Enter or Space to select.
</p>
```

**After:**
```tsx
<p id="content-type-help" className="sr-only">
  {t('keyboardHelp')}
</p>
```

#### Acceptance Criteria
- [x] Screen reader help text uses `t('keyboardHelp')` ---implemented: Changed to {t('keyboardHelp')}---
- [x] `sr-only` class maintained (text only visible to screen readers) ---implemented: sr-only class preserved---
- [x] `id` attribute unchanged for `aria-describedby` reference ---implemented: id="content-type-help" preserved---

---

### Task 8: Update Continue Button Text to Use Translation

**Priority:** P1 - High
**Story Points:** 0.25
**File:** `/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`

#### Description
Replace the hardcoded "Continue" button text with a translation call.

#### Implementation Steps

1. Locate the Continue button (around line 325)
2. Update the button text to use translation

#### Code Change

**Location:** Around line 325

**Before:**
```tsx
<button
  type="button"
  onClick={handleContinue}
  disabled={!canNext}
  className={cn(
    'w-full py-4 rounded-lg font-semibold text-lg',
    // ... rest of classes
  )}
  aria-disabled={!canNext}
>
  Continue
</button>
```

**After:**
```tsx
<button
  type="button"
  onClick={handleContinue}
  disabled={!canNext}
  className={cn(
    'w-full py-4 rounded-lg font-semibold text-lg',
    // ... rest of classes
  )}
  aria-disabled={!canNext}
>
  {t('continueButton')}
</button>
```

#### Acceptance Criteria
- [x] Button text uses `t('continueButton')` ---implemented: Changed to {t('continueButton')}---
- [x] Button functionality unchanged ---implemented: onClick handler preserved---
- [x] All button attributes preserved ---implemented: type, disabled, className, aria-disabled all preserved---

---

### Task 9: Update ContentTypeCard Rendering with Translated Labels

**Priority:** P0 - Critical
**Story Points:** 0.5
**File:** `/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`

#### Description
Update the ContentTypeCard rendering to pass translated labels and subtitles instead of hardcoded values from constants.

#### Implementation Steps

1. Locate the `contentOptions.map` rendering (around lines 289-303)
2. Update the `option` prop to use translations via the ID-to-key mapping

#### Code Change

**Location:** Lines 289-303

**Before:**
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

**After:**
```tsx
{contentOptions.map((option, index) => {
  const optionKey = CONTENT_OPTION_TO_KEY[option.id];
  return (
    <ContentTypeCard
      key={option.id}
      ref={(el) => { cardRefs.current[index] = el; }}
      option={{
        type: option.id,
        label: t(`options.${optionKey}.label`),
        subtitle: option.subtitle ? t(`options.${optionKey}.subtitle`) : undefined,
        icon: getIconComponent(option.icon),
      }}
      isSelected={currentSelection === option.id}
      onSelect={() => handleContentSelect(option)}
      tabIndex={index === activeIndex ? 0 : -1}
    />
  );
})}
```

#### Key Implementation Notes

1. **Extract `optionKey` for clarity:** The mapping lookup is done once per card for readability
2. **Conditional subtitle translation:** Only the "Upload File" option has a subtitle. The conditional `option.subtitle ? ... : undefined` ensures we only attempt to translate subtitles that exist
3. **Preserve all other props:** The `icon`, `isSelected`, `onSelect`, and `tabIndex` props remain unchanged

#### Acceptance Criteria
- [x] All five content option labels use translation keys ---implemented: Uses t(`options.${optionKey}.label`) for all---
- [x] Upload File option displays translated subtitle ("Video, Image, PDF, Text") ---implemented: Uses t(`options.${optionKey}.subtitle`) when subtitle exists---
- [x] Other four options do not show undefined/broken subtitle ---implemented: Conditional check option.subtitle ? ... : undefined---
- [x] Selection state highlighting works correctly ---implemented: isSelected prop preserved---
- [x] Auto-advance after selection (150ms delay) still functions ---implemented: handleContentSelect unchanged---
- [x] Keyboard navigation still works ---implemented: tabIndex and onKeyDown unchanged---

---

## Implementation Order

Execute tasks in this order to minimize conflicts:

1. **Task 1:** Add translation keys to messages file (foundation)
2. **Task 2:** Add useTranslations import
3. **Task 3:** Initialize useTranslations hook
4. **Task 4:** Create option ID-to-key mapping
5. **Task 5:** Update step header text
6. **Task 6:** Update radiogroup aria-label
7. **Task 7:** Update keyboard help text
8. **Task 8:** Update continue button text
9. **Task 9:** Update ContentTypeCard labels (most complex, do last)

---

## Files Modified Summary

| File | Type | Changes |
|------|------|---------|
| `/messages/en.json` | Translation | Add `workflow.steps.contentType` namespace with all keys |
| `/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx` | Component | Add import, hook, mapping, replace 7 hardcoded strings |

---

## Verification Checklist

### Build Verification
```bash
npm run build
```
- [x] No TypeScript errors ---ts-check: passed (0 errors, baseline: 0)---
- [x] No missing translation key warnings ---verified: all keys exist in en.json---
- [x] Build completes successfully ---verified: precommit passed---

### Runtime Verification
```bash
npm run dev
```
Navigate to: Item creation workflow → Step 5 (Content Type)

- [ ] Step title displays: "What content would you like to add?"
- [ ] Step subtitle displays: "Choose how you want to add information for this item"
- [ ] "Record Video" card label displays correctly
- [ ] "Take Photo" card label displays correctly
- [ ] "Write Text" card label displays correctly
- [ ] "Upload File" card displays with subtitle "Video, Image, PDF, Text"
- [ ] "Add Link" card label displays correctly
- [ ] Continue button displays "Continue"

### Functional Testing
- [ ] Click each content type option → selection state updates (blue border, checkmark)
- [ ] After selecting an option → auto-advances to next step after 150ms
- [ ] Keyboard navigation with arrow keys works in 2-column grid
- [ ] Press Enter/Space selects the focused option
- [ ] Continue button is disabled when no selection, enabled when selection made

### Accessibility Testing
- [ ] Open browser DevTools → Accessibility panel
- [ ] Radiogroup has translated aria-label
- [ ] Use VoiceOver/NVDA to navigate content type cards
- [ ] Verify each card announces its translated label
- [ ] Verify screen reader help text is available

### Edge Cases
- [ ] Pre-selected content type shows correct highlight on step entry
- [ ] Grid layout adapts: 2 columns on tablet+, 1 column on mobile
- [ ] No console errors or warnings

---

## Rollback Plan

If issues occur:

1. **Translation key issues:** Verify JSON syntax in `/messages/en.json`
2. **Component rendering issues:** Restore from git: `git checkout src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`
3. **Full rollback:** `git stash` or `git checkout .` for all changes

---

## Dependencies on This Task

The following tasks may depend on this task being complete:

- REQ-E02-063 (Update MediaCaptureStep) - May reference similar patterns
- Translation generation for non-English languages - Requires en.json keys to exist

---

## Notes for Implementer

### 1. Client Component Compatibility
The component is already marked `'use client'`, which is compatible with `useTranslations` hook. No additional client/server boundary changes needed.

### 2. Constants File Unchanged
The `UNIFIED_CONTENT_OPTIONS` in `/src/components/ItemCreationWorkflow/utils/constants.ts` is NOT modified. The labels in that file remain for potential non-UI uses (types, etc.). Only the UI rendering uses translations.

### 3. ID Mapping Rationale
The content option IDs use kebab-case (`record-video`, `upload-file`) because they're used as identifiers in the workflow state. Translation keys use camelCase (`recordVideo`, `uploadFile`) for cleaner JSON paths. The mapping bridges these conventions.

### 4. Single Subtitle
Only "Upload File" has a subtitle (`"Video, Image, PDF, Text"`). The conditional check `option.subtitle ? ... : undefined` handles this correctly without attempting to look up non-existent translation keys.

### 5. Auto-Advance Timing
The component auto-advances to the next step after 150ms when a content type is selected. This delay provides visual feedback before navigation. Ensure this behavior is preserved after changes.

---

## Request Acceptance Criteria Mapping

| Acceptance Criteria | Task(s) | Status |
|---------------------|---------|--------|
| Step header text extracted | Task 5 | |
| Instructional text extracted | Task 5 | |
| Accessibility label extracted | Task 6 | |
| Keyboard navigation help text extracted | Task 7 | |
| All content type option labels extracted | Task 9 | |
| Description text for each content type extracted | Task 9 (subtitle for Upload File) | |
| File format specification text extracted | Task 9 (Upload File subtitle) | |
| File size limitation messages extracted | N/A - Not present in component | |
| Help text or tooltips extracted | N/A - Not present in component | |
| Continue button text extracted | Task 8 | |
| Back button text extracted | N/A - No back button in component | |
| Validation message extracted | N/A - Auto-advance, no validation message | |
| Warning messages extracted | N/A - Not present in component | |
| Helper text about changing content type extracted | N/A - Not present | |
| Component uses useTranslations | Tasks 2, 3 | |
| All ARIA labels localized | Task 6 | |
| Component renders correctly with translations | All tasks + verification | |
| No hardcoded English strings remain | All tasks | |
| Content type translations culturally appropriate | Translation generation task | |
| Technical format specs remain consistent | Task 1 (subtitle unchanged) | |
| Selection state announcements localized | N/A - Uses aria-checked, no custom text | |
| Conditional messages localized | N/A - None present | |
| Icon labels/tooltips localized | N/A - Icons are aria-hidden | |
| Variable interpolation handles dynamic content | N/A - No variables in this component | |

---

## References

- [Overview Document](./REQ-E02-062-update-contenttypestep-overview.md)
- [Implementation Plan: L10N Epic 2](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Documentation](./gen_requests_epic2.md#REQ-E02-062)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2C: Item Creation Workflow*
*Task 2C.7: Update ContentTypeStep Component*
