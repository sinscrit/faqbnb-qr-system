# REQ-E02-073: Update Crop/Trim Utilities for i18n

**Document Type:** Implementation Breakdown (Overview)
**Request ID:** REQ-E02-073
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2E - Article & Content Management
**Task Reference:** 2E.4
**Priority:** High
**Size:** S (Small)

**Created:** 2026-01-22 17:31
**Last Modified:** 2026-01-22 17:31

---

## 1. Header

| Field | Value |
|-------|-------|
| Request Reference | REQ-E02-073 (Task 2E.4) |
| Source File | docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md |
| Original Request Date | 2026-01-17 |
| Breakdown Created | 2026-01-22 17:31 |
| T-shirt Size | S (Small) |
| Estimated Effort | 2-3 hours |
| Status | PENDING |

---

## 2. Summary

This document provides the implementation breakdown for updating crop/trim utility components to use the `articles.crop.*` and `articles.video.*` namespace translations. Based on recent code modifications, most of these components have already been updated for i18n:

- **ImageCropper**: Already updated (REQ-E02-072)
- **VideoTrimmer**: Already updated (REQ-E02-072)
- **ImageRotator**: Still needs i18n implementation (currently only uses `common.loading`)

This task primarily involves completing the ImageRotator i18n implementation and verifying the other components are fully translated.

---

## 3. Goals

### 3.1 Functional Requirements

1. Verify ImageCropper i18n implementation is complete
2. Verify VideoTrimmer i18n implementation is complete
3. Add i18n support to ImageRotator component
4. Ensure all crop/trim utility strings use translation calls
5. Maintain existing functionality while adding i18n support

### 3.2 Assumptions & Clarifications

- `articles.crop.*` namespace keys available from Task 2E.1
- `articles.video.*` namespace keys available from Task 2E.1
- ImageCropper and VideoTrimmer have been recently updated (as indicated by @lastModified comments)
- ImageRotator uses only `common.loading` currently
- All components are client-side (`'use client'` directive)

---

## 4. Requirements Analysis

### 4.1 Components Status

| Component | File | Current i18n Status | Estimated Strings |
|-----------|------|---------------------|-------------------|
| ImageCropper | `/src/components/ItemCapture/editors/ImageCropper.tsx` | Complete (REQ-E02-072) | ~20 |
| VideoTrimmer | `/src/components/ItemCapture/editors/VideoTrimmer.tsx` | Complete (REQ-E02-072) | ~25 |
| ImageRotator | `/src/components/ItemCapture/editors/ImageRotator.tsx` | Partial - only `tLoading` | ~15 |

### 4.2 Investigation Findings

#### ImageCropper (Already Updated)
- **@lastModified:** 2026-01-22 (REQ-E02-072 - L10N)
- **Translation hooks:** Uses `useTranslations('articles.crop')` and `useTranslations('common.loading')`
- **Status:** Implementation appears complete

#### VideoTrimmer (Already Updated)
- **@lastModified:** 2026-01-22 (REQ-E02-072 - L10N)
- **Translation hooks:** Uses `useTranslations('articles.video')` and `useTranslations('common.loading')`
- **Translated elements:** Markers, buttons, errors, selection display, ARIA labels
- **Status:** Implementation appears complete

#### ImageRotator (Needs Update)
- **@lastModified:** 2025-12-31 (No i18n mention)
- **Translation hooks:** Only uses `useTranslations('common.loading')`
- **Hardcoded strings:** Button labels, error messages, instructions

### 4.3 String Inventory - ImageRotator

#### Hardcoded Strings (~15 total)
1. **Button labels:**
   - "Rotate Left" / "Rotate Counterclockwise"
   - "Rotate Right" / "Rotate Clockwise"
   - "Cancel"
   - "Apply Rotation"

2. **Instructions/Help text:**
   - Rotation instructions
   - Keyboard shortcuts info

3. **Error messages:**
   - Already defined in `rotationUtils.ts` as `ROTATION_ERROR_MESSAGES`
   - "Image load failed"
   - "Canvas rotation failed"
   - "Unknown error"

4. **ARIA labels:**
   - Button accessibility labels
   - Status announcements

---

## 5. Technical Approach

### 5.1 Translation Pattern

Following the established pattern from ImageCropper and VideoTrimmer:

```typescript
// ImageRotator - After update
import { useTranslations } from 'next-intl';

function ImageRotator() {
  const t = useTranslations('articles.rotate');
  const tLoading = useTranslations('common.loading');

  return (
    <>
      <button aria-label={t('aria.rotateLeft')}>
        {t('rotateLeft')}
      </button>
      <button>{t('applyButton')}</button>
    </>
  );
}
```

### 5.2 Translation Keys Structure

Add to `articles` namespace (created in Task 2E.1):

```json
{
  "articles": {
    "rotate": {
      "title": "Rotate Image",
      "rotateLeft": "Rotate Left",
      "rotateRight": "Rotate Right",
      "reset": "Reset",
      "cancel": "Cancel",
      "applyButton": "Apply Rotation",
      "instructions": "Click the rotation buttons or use arrow keys to rotate the image in 90-degree increments.",
      "currentRotation": "Current rotation: {degrees}°",
      "aria": {
        "rotateLeft": "Rotate image counterclockwise 90 degrees",
        "rotateRight": "Rotate image clockwise 90 degrees",
        "reset": "Reset rotation to 0 degrees",
        "apply": "Apply rotation and close editor",
        "cancel": "Cancel rotation and close editor"
      },
      "errors": {
        "loadFailed": "Failed to load image. Please try again.",
        "rotationFailed": "Failed to rotate image. Please try again.",
        "processingFailed": "An error occurred during processing.",
        "unknownError": "An unexpected error occurred."
      }
    }
  }
}
```

---

## 6. Implementation Tasks

### Task 1: Verify ImageCropper i18n implementation (Priority: High)

**Description:** Confirm that ImageCropper's i18n implementation is complete and all strings use translations.

**File:** `/src/components/ItemCapture/editors/ImageCropper.tsx`

**Verification Steps:**
1. Read the file and check all UI strings
2. Verify `useTranslations('articles.crop')` is used
3. Confirm all aspect ratio labels, buttons, and errors use translation calls
4. Check ARIA labels are translated

**Acceptance Criteria:**
- [ ] All hardcoded strings replaced with translation calls
- [ ] Uses `articles.crop` namespace
- [ ] Component renders correctly with translations
- [ ] No console warnings for missing translation keys

---

### Task 2: Verify VideoTrimmer i18n implementation (Priority: High)

**Description:** Confirm that VideoTrimmer's i18n implementation is complete and all strings use translations.

**File:** `/src/components/ItemCapture/editors/VideoTrimmer.tsx`

**Verification Steps:**
1. Read the file and check all UI strings
2. Verify `useTranslations('articles.video')` is used
3. Confirm all buttons, labels, errors, and selection display use translation calls
4. Check ARIA labels are translated

**Acceptance Criteria:**
- [ ] All hardcoded strings replaced with translation calls
- [ ] Uses `articles.video` namespace
- [ ] Component renders correctly with translations
- [ ] No console warnings for missing translation keys

---

### Task 3: Add `articles.rotate` namespace keys to en.json (Priority: High)

**Description:** Add the rotation-related translation keys to `/messages/en.json`.

**File:** `/messages/en.json`

**Changes Required:**
1. Add `rotate` object under `articles` namespace
2. Include all button labels, instructions, ARIA labels, and error messages
3. Use ICU format where appropriate

**Acceptance Criteria:**
- [ ] `articles.rotate.*` keys added to en.json
- [ ] Keys follow naming conventions
- [ ] Error messages properly defined
- [ ] JSON validates

---

### Task 4: Update ImageRotator component (Priority: High)

**Description:** Add i18n support to ImageRotator by replacing hardcoded strings with translation calls.

**File:** `/src/components/ItemCapture/editors/ImageRotator.tsx`

**Changes Required:**
1. Add `useTranslations('articles.rotate')` hook
2. Update button labels to use `t('rotateLeft')`, `t('rotateRight')`, `t('cancel')`, `t('applyButton')`
3. Update ARIA labels to use translation keys
4. Update error messages to use `t('errors.*')`
5. Add rotation instructions if displayed
6. Update `@lastModified` comment to include REQ-E02-073

**Acceptance Criteria:**
- [ ] `useTranslations('articles.rotate')` hook added
- [ ] All button labels use translations
- [ ] All ARIA labels use translations
- [ ] All error messages use translations
- [ ] Component renders correctly
- [ ] Rotation functionality unchanged

---

### Task 5: Update rotationUtils.ts error messages (Priority: Medium)

**Description:** If `rotationUtils.ts` contains hardcoded error message strings, consider exporting them as keys that can be passed to translation function.

**File:** `/src/components/ItemCapture/editors/rotationUtils.ts`

**Investigation Notes:**
- File contains `ROTATION_ERROR_MESSAGES` constant
- These may need to be converted to translation keys

**Changes Required:**
1. Read `rotationUtils.ts` to check error message definitions
2. If hardcoded, refactor to use translation keys
3. Update ImageRotator to handle error translation

**Acceptance Criteria:**
- [ ] Error messages use translation keys
- [ ] ImageRotator properly translates error messages

---

### Task 6: Add placeholder translations to other language files (Priority: Medium)

**Description:** Copy the `articles.rotate` namespace structure to all 5 non-English translation files.

**Files to Update:**
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

**Changes Required:**
1. Copy exact key structure from en.json
2. Use English strings as placeholders (will be translated in Task 2E.6)

**Acceptance Criteria:**
- [ ] `articles.rotate` namespace added to all 6 language files
- [ ] Key structure identical across all files
- [ ] All files pass JSON validation

---

## 7. Authorized Files and Functions for Modification

> **APPROVED SCOPE**: Changes outside this list require review

### 7.1 Crop/Trim Utility Components

| File | Target | Type | Notes |
|------|--------|------|-------|
| `/src/components/ItemCapture/editors/ImageCropper.tsx` | Full component | Verify | Confirm i18n complete |
| `/src/components/ItemCapture/editors/VideoTrimmer.tsx` | Full component | Verify | Confirm i18n complete |
| `/src/components/ItemCapture/editors/ImageRotator.tsx` | Full component | Modify | Add i18n hooks and translation calls |
| `/src/components/ItemCapture/editors/rotationUtils.ts` | Error messages | Modify | Convert to translation keys if needed |

### 7.2 Translation Files

| File | Target | Type | Notes |
|------|--------|------|-------|
| `/messages/en.json` | `articles.rotate` namespace | Modify | Add rotation keys |
| `/messages/fr.json` | `articles.rotate` namespace | Modify | Add placeholder keys |
| `/messages/es.json` | `articles.rotate` namespace | Modify | Add placeholder keys |
| `/messages/de.json` | `articles.rotate` namespace | Modify | Add placeholder keys |
| `/messages/nl.json` | `articles.rotate` namespace | Modify | Add placeholder keys |
| `/messages/it.json` | `articles.rotate` namespace | Modify | Add placeholder keys |

---

## 8. Dependencies

### 8.1 Depends On (Completed First)

| Request | Dependency Type | Status |
|---------|-----------------|--------|
| Epic 1 Foundation | next-intl setup, useTranslations hook | Complete |
| **REQ-E02-070** (Task 2E.1) | `articles.crop.*`, `articles.video.*` keys | Complete |
| **REQ-E02-072** (Task 2E.3) | ImageCropper, VideoTrimmer i18n | Complete |

### 8.2 Blocks (Requires This First)

| Request | What This Provides |
|---------|-------------------|
| **REQ-E02-075** (Task 2E.6) | Crop/trim utility strings ready for translation generation |

### 8.3 Parallel Safety

- **Files touched**: 3 component files, 6 translation files, 1 utility file
- **Conflicts with**: None - crop/trim utilities are isolated
- **Safe to parallelize with**: Tasks 2E.2, 2E.5 (different component sets)

### 8.4 External Dependencies

- `next-intl` package (from Epic 1)
- `react-image-crop` package (ImageCropper dependency)

---

## 9. Risks and Considerations

### 9.1 Potential Side Effects

| Risk | Impact | Mitigation |
|------|--------|------------|
| ImageCropper/VideoTrimmer already complete | Low | Verify implementation, minimal changes needed |
| Error message handling in rotationUtils | Medium | Check how errors are currently handled |
| ARIA label changes | Low | Test with screen reader |

### 9.2 Testing Requirements

- Manual testing of ImageRotator rotation functionality
- Verify ImageCropper aspect ratio switching
- Test VideoTrimmer marker dragging
- Verify all error messages display correctly
- Test ARIA labels with screen reader
- Verify button labels in all three components

### 9.3 Open Questions

- [ ] Are there additional strings in rotationUtils.ts that need translation?
- [ ] Should rotation instructions be displayed in the UI?
- [ ] Are there any other crop/trim utilities not identified?

---

## 10. Out of Scope

- Creating new translation keys beyond `articles.rotate` (namespace structure from Task 2E.1)
- Actual translations to other languages (handled by Task 2E.6)
- Editor components (handled by Task 2E.2)
- Media handling components (handled by Task 2E.3)
- Instructions pages (handled by Task 2E.5)
- Functional changes to rotation/cropping/trimming behavior

---

## 11. Verification Checklist

### Pre-Implementation
- [ ] Verify `articles.crop.*` keys exist in en.json (from Task 2E.1)
- [ ] Verify `articles.video.*` keys exist in en.json (from Task 2E.1)
- [ ] Read ImageCropper and VideoTrimmer to confirm i18n status

### Implementation
- [ ] ImageCropper i18n verified complete
- [ ] VideoTrimmer i18n verified complete
- [ ] `articles.rotate.*` keys added to en.json
- [ ] ImageRotator i18n added
- [ ] rotationUtils error messages handled
- [ ] Placeholder keys added to all language files

### Post-Implementation
- [ ] TypeScript compilation succeeds
- [ ] Build completes without errors
- [ ] All three components render correctly with translations
- [ ] Rotation/cropping/trimming functionality unchanged
- [ ] No console warnings for missing translation keys
- [ ] Add `@lastModified` comment to ImageRotator with REQ-E02-073

---

## 12. References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **Namespace Task:** `/docs/REQ-E02-070-create-articles-namespace-structure-overview.md`
- **Media Components Task:** `/docs/REQ-E02-072-update-media-handling-components-overview.md`
- **next-intl Docs:** https://next-intl-docs.vercel.app/docs/usage/messages

---

*Document generated: 2026-01-22 17:31*
*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2E: Article & Content Management*
