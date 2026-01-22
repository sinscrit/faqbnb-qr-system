# REQ-E02-073: Update Crop/Trim Utilities for i18n - Detailed Implementation Tasks

**Generated:** 2026-01-22 17:33
**Reference Documents:**
- Requirements: `/docs/gen_requests_epic2.md` - REQ-E02-073
- Overview: `/docs/REQ-E02-073-update-croptrim-utilities-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

---

## Build & Test Commands

| Action | Command |
|--------|---------|
| Type Check | `npx tsc --noEmit` |
| Unit Tests | `npm test` |
| Build | `npm run build` |
| Lint | `npm run lint` |

---

## Overview

This document provides granular, implementation-ready tasks for updating crop/trim utility components to use i18n translations. Based on recent code analysis:

- **ImageCropper**: Already updated (REQ-E02-072) - verification only
- **VideoTrimmer**: Already updated (REQ-E02-072) - verification only
- **ImageRotator**: Needs full i18n implementation

**Scope Summary:**

| Component | File | Hardcoded Strings | i18n Status |
|-----------|------|-------------------|-------------|
| ImageCropper | `/src/components/ItemCapture/editors/ImageCropper.tsx` | 0 | Complete (verified) |
| VideoTrimmer | `/src/components/ItemCapture/editors/VideoTrimmer.tsx` | 0 | Complete (verified) |
| ImageRotator | `/src/components/ItemCapture/editors/ImageRotator.tsx` | ~15 | Partial - only uses `tLoading` |

**Prerequisite:** The `articles.crop.*` and `articles.video.*` namespaces were created in Task 2E.1 (REQ-E02-070). The `articles.rotate.*` namespace will be added in this task.

---

## 1. Verify ImageCropper i18n Implementation

**Context:** ImageCropper was updated in REQ-E02-072. Verify all strings use translations.
**Files to review:** `/src/components/ItemCapture/editors/ImageCropper.tsx` (READ ONLY)
**Estimated effort:** 0.25 story points

- [x] **1.1** Read the file and verify `useTranslations('articles.crop')` hook is present ---implemented: Verified at line 109
- [x] **1.2** Confirm all aspect ratio labels use `t(option.labelKey)` pattern ---implemented: Verified at line 393
- [x] **1.3** Verify all button labels ("Apply Crop", "Cancel") use translation calls ---implemented: Verified at lines 491, 504
- [x] **1.4** Check error messages use `t('errors.*')` calls ---implemented: Verified at lines 170, 304
- [x] **1.5** Verify ARIA labels use translation keys ---implemented: Verified at lines 436, 452, 471
- [x] **1.6** Confirm `@lastModified` comment includes REQ-E02-072 ---implemented: Verified at line 14
- [x] **1.7** Document verification results: "ImageCropper i18n implementation complete" ---implemented: All checks passed, implementation is complete

---

## 2. Verify VideoTrimmer i18n Implementation

**Context:** VideoTrimmer was updated in REQ-E02-072. Verify all strings use translations.
**Files to review:** `/src/components/ItemCapture/editors/VideoTrimmer.tsx` (READ ONLY)
**Estimated effort:** 0.25 story points

- [x] **2.1** Read the file and verify `useTranslations('articles.video')` hook is present ---implemented: Verified at line 100
- [x] **2.2** Confirm marker labels use `t('markers.start')` and `t('markers.end')` ---implemented: Verified at lines 616, 643
- [x] **2.3** Verify selection display uses `t('selection.*')` with ICU interpolation ---implemented: Verified at lines 669, 674, 681, 687 with interpolation
- [x] **2.4** Check button labels ("Apply Trim", "Cancel") use translation calls ---implemented: Verified at lines 757, 773
- [x] **2.5** Verify error messages use `t('errors.*')` calls ---implemented: Verified at lines 155, 201, 234, 450, 523
- [x] **2.6** Confirm ARIA labels for playback controls use translation keys ---implemented: Verified at lines 606, 633, 707, 721, 735
- [x] **2.7** Verify `@lastModified` comment includes REQ-E02-072 ---implemented: Verified at line 23
- [x] **2.8** Document verification results: "VideoTrimmer i18n implementation complete" ---implemented: All checks passed, implementation is complete

---

## 3. Add `articles.rotate` Namespace Keys to en.json

**Context:** Add rotation-related translation keys to support ImageRotator i18n.
**Files to modify:** `/messages/en.json`
**Estimated effort:** 0.5 story points

- [x] **3.1** Locate the `articles` namespace in `/messages/en.json` (after line ~3500) ---implemented: Located at line 3614-3623
- [x] **3.2** Add `rotate` object after the `video` namespace with top-level keys ---implemented: Added all 7 top-level keys
- [x] **3.3** Add `rotate.aria` nested namespace ---implemented: Added all 8 aria keys including ICU interpolation
- [x] **3.4** Add `rotate.errors` nested namespace ---implemented: Added all 6 error keys
- [x] **3.5** Add `rotate.keyboard` nested namespace ---implemented: Added all 4 keyboard shortcut keys
- [x] **3.6** Add `rotate.status` nested namespace ---implemented: Added both status keys (modified, applying)
- [x] **3.7** Verify JSON syntax is valid after additions ---implemented: Validated successfully

---

## 4. Update ImageRotator Component

**Context:** Replace hardcoded strings in ImageRotator with translation calls using `articles.rotate.*` namespace.
**Files to modify:** `/src/components/ItemCapture/editors/ImageRotator.tsx`
**Estimated effort:** 1.5 story points

- [x] **4.1** Add `useTranslations('articles.rotate')` hook after line 96 ---implemented: Added translation hook
- [x] **4.2** Update region aria-label (line ~344) ---implemented: Changed to `{t('aria.editor')}`
- [x] **4.3** Update screen reader announcement for rotation (line ~359) ---implemented: Changed to `{t('aria.processing')}`
- [x] **4.4** Update rotation announcement function (lines 332-334) ---implemented: Updated with ICU interpolation `{degrees: currentRotation}`
- [x] **4.5** Update processing overlay text (line ~385) ---implemented: Changed to `{t('status.applying')}`
- [x] **4.6** Update "Try Again" button (line ~426) ---implemented: Changed to `{t('errors.tryAgain')}`
- [x] **4.7** Update rotate left button aria-label (line ~437) ---implemented: Changed to `{t('aria.rotateLeft')}`
- [x] **4.8** Update rotate right button aria-label (line ~452) ---implemented: Changed to `{t('aria.rotateRight')}`
- [x] **4.9** Update rotation info display (lines 466-471) ---implemented: Updated with ICU interpolation for degrees and status.modified
- [x] **4.10** Update keyboard shortcuts help section (lines 473-484) ---implemented: Updated all 4 keyboard shortcut labels
- [x] **4.11** Update "Apply Rotation" button (line ~500) ---implemented: Updated both states with t() calls
- [x] **4.12** Update "Cancel" button (line ~514) ---implemented: Changed to `{t('cancel')}`
- [x] **4.13** Update `@lastModified` comment (line ~14) to `2026-01-22 (REQ-E02-073 - L10N)` ---implemented: Updated ---ts-check: passed---

---

## 5. Update rotationUtils.ts Error Messages

**Context:** Convert hardcoded error messages in rotationUtils to translation keys that can be passed to component.
**Files to modify:** `/src/components/ItemCapture/editors/rotationUtils.ts`
**Estimated effort:** 0.5 story points

- [x] **5.1** Update `ROTATION_ERROR_MESSAGES` constant (lines 26-32) to export error keys instead of messages ---implemented: Created ROTATION_ERROR_KEYS with translation key strings
- [x] **5.2** Keep backward compatibility by also exporting the old constant name ---implemented: Added alias `ROTATION_ERROR_MESSAGES = ROTATION_ERROR_KEYS`
- [x] **5.3** Update ImageRotator to translate error keys ---implemented: Updated all 3 error assignments to use `t(ROTATION_ERROR_KEYS.*)`
- [x] **5.4** Update `@lastModified` comment in rotationUtils.ts to `2026-01-22 (REQ-E02-073 - L10N)` ---implemented: Updated ---ts-check: passed---

---

## 6. Add `articles.rotate` to Other Language Files

**Context:** Copy the `articles.rotate` namespace structure to all 5 non-English translation files.
**Files to modify:** `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`
**Estimated effort:** 0.5 story points

- [x] **6.1** Copy the complete `articles.rotate` namespace from en.json to `/messages/fr.json` with English placeholders ---implemented: Copied via Python script
- [x] **6.2** Copy the complete `articles.rotate` namespace from en.json to `/messages/es.json` with English placeholders ---implemented: Copied via Python script
- [x] **6.3** Copy the complete `articles.rotate` namespace from en.json to `/messages/de.json` with English placeholders ---implemented: Copied via Python script
- [x] **6.4** Copy the complete `articles.rotate` namespace from en.json to `/messages/nl.json` with English placeholders ---implemented: Copied via Python script
- [x] **6.5** Copy the complete `articles.rotate` namespace from en.json to `/messages/it.json` with English placeholders ---implemented: Copied via Python script
- [x] **6.6** Verify JSON syntax is valid in all 6 language files ---implemented: All 6 files validated successfully
- [x] **6.7** Verify key structure matches en.json exactly in all files ---implemented: Script ensures exact structure match

---

## 7. Run Full Verification Suite

**Context:** Ensure all changes compile and work correctly together.
**Estimated effort:** 0.5 story points

- [x] **7.1** Run TypeScript type check: `npx tsc --noEmit` ---implemented: Passed with 0 errors (baseline: 0) ---ts-check: passed---
- [x] **7.2** Run lint check: `npm run lint` ---implemented: Fixed 2 new dependency warnings in ImageRotator (added 't' to dependency arrays at lines 159, 275). No other lint issues in target files. Pre-existing warnings in unrelated files remain unchanged. ---ts-check: passed---
- [x] **7.3** Run build: `npm run build` ---implemented: Build compiled successfully in 64s. Build artifacts created in .next/static/. Post-build linting shows pre-existing errors in unrelated files (admin pages, API routes, tests) - none related to this task's changes. ---ts-check: passed---
- [ ] **7.4** Manual verification: Open ImageRotator in browser and verify:
  - Rotation buttons work correctly
  - Keyboard shortcuts (←/→/Esc/⌘+Enter) work
  - "Current rotation" text displays correctly
  - "(modified)" indicator appears when rotation changes
  - "Apply Rotation" and "Cancel" buttons display correctly
  - Processing overlay shows correct text
  - Error messages display correctly if triggered
- [ ] **7.5** Manual verification: Test ImageCropper and verify:
  - Aspect ratio buttons display translated labels
  - All buttons and labels use translations
  - No console warnings for missing keys
- [ ] **7.6** Manual verification: Test VideoTrimmer and verify:
  - Marker labels (S/E) display correctly
  - Selection/duration labels use translations
  - All buttons display correctly
  - No console warnings for missing keys

---

## Authorized Files for Modification

### Crop/Trim Utility Components

| File | Target | Type | Notes |
|------|--------|------|-------|
| `/src/components/ItemCapture/editors/ImageCropper.tsx` | Full component | Verify | Confirm i18n complete (read-only) |
| `/src/components/ItemCapture/editors/VideoTrimmer.tsx` | Full component | Verify | Confirm i18n complete (read-only) |
| `/src/components/ItemCapture/editors/ImageRotator.tsx` | Full component | Modify | Add i18n hooks, replace ~15 strings |
| `/src/components/ItemCapture/editors/rotationUtils.ts` | Error messages | Modify | Convert to translation keys |

### Translation Files (Modify)

| File | Modification Type | Notes |
|------|-------------------|-------|
| `/messages/en.json` | Modify | Add `articles.rotate.*` namespace (~25 keys) |
| `/messages/fr.json` | Modify | Copy rotate namespace with English placeholders |
| `/messages/es.json` | Modify | Copy rotate namespace with English placeholders |
| `/messages/de.json` | Modify | Copy rotate namespace with English placeholders |
| `/messages/nl.json` | Modify | Copy rotate namespace with English placeholders |
| `/messages/it.json` | Modify | Copy rotate namespace with English placeholders |

### Reference Files (Read-Only)

| File | Purpose |
|------|---------|
| `/docs/REQ-E02-070-create-articles-namespace-structure-detailed.md` | Reference for existing keys |
| `/docs/REQ-E02-072-update-media-handling-components-detailed.md` | Reference for ImageCropper/VideoTrimmer patterns |

---

## Translation Keys Reference

### Existing Keys (from Tasks 2E.1 and 2E.3)

```json
{
  "articles": {
    "crop": {
      "title": "Crop Image",
      "freeform": "Freeform",
      "square": "Square (1:1)",
      "standard": "Standard (4:3)",
      "landscape": "Landscape (16:9)",
      "applyButton": "Apply Crop",
      "cancel": "Cancel",
      "errors": { /* ... */ },
      "aria": { /* ... */ }
    },
    "video": {
      "title": "Trim Video",
      "markers": { "start": "S", "end": "E" },
      "selection": { /* ... */ },
      "applyButton": "Apply Trim",
      "cancel": "Cancel",
      "errors": { /* ... */ },
      "aria": { /* ... */ }
    }
  }
}
```

### New Keys (to be added in Task 3)

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
      "currentRotation": "Current rotation: {degrees}°",
      "aria": {
        "rotateLeft": "Rotate image left 90 degrees",
        "rotateRight": "Rotate image right 90 degrees",
        "reset": "Reset rotation to 0 degrees",
        "apply": "Apply rotation and close editor",
        "cancel": "Cancel rotation and close editor",
        "editor": "Image rotation editor",
        "announcement": "Image rotated to {degrees} degrees",
        "processing": "Processing rotation..."
      },
      "errors": {
        "loadFailed": "Failed to load image. Please try again.",
        "rotationFailed": "Failed to rotate image. Please try again.",
        "canvasUnavailable": "Your browser does not support image editing.",
        "memoryError": "Not enough memory to process image. Try closing other tabs.",
        "blobCreationFailed": "Failed to create image output. Please try again.",
        "tryAgain": "Try Again"
      },
      "keyboard": {
        "help": "Keyboard:",
        "toRotate": "to rotate",
        "toCancel": "to cancel",
        "toApply": "to apply"
      },
      "status": {
        "modified": "(modified)",
        "applying": "Applying..."
      }
    }
  }
}
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| ImageCropper/VideoTrimmer verification issues | Low | Low | Already updated in REQ-E02-072, just verify |
| Error key mapping in rotationUtils | Low | Medium | Keep backward compatibility with old constant name |
| Keyboard shortcut translation complexity | Low | Low | Use interpolation for kbd elements |
| ICU format in currentRotation | Low | Medium | Test with different rotation values |

---

## Dependencies

### Depends On (Completed First)

| Request | Dependency Type | Status |
|---------|-----------------|--------|
| Epic 1 Foundation | next-intl setup, useTranslations hook | Complete |
| **REQ-E02-070** (Task 2E.1) | `articles.*` namespace structure | Complete |
| **REQ-E02-072** (Task 2E.3) | ImageCropper, VideoTrimmer i18n | Complete |

### Blocks (Requires This First)

| Request | What This Provides |
|---------|-------------------|
| **REQ-E02-075** (Task 2E.6) | All crop/trim/rotate utility strings ready for translation generation |

---

## References

- **Overview Document:** `docs/REQ-E02-073-update-croptrim-utilities-overview.md`
- **Request Source:** `docs/gen_requests_epic2.md` - REQ-E02-073
- **Implementation Plan:** `docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **Related Tasks:**
  - REQ-E02-070: Create `articles` namespace structure
  - REQ-E02-072: Update media handling components (ImageCropper, VideoTrimmer)
- **next-intl Docs:** https://next-intl-docs.vercel.app/docs/usage/messages
- **ICU Message Format:** https://unicode-org.github.io/icu/userguide/format_parse/messages/

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2E: Article & Content Management*
*Task ID: 2E.4 - Update crop/trim utilities (ImageRotator i18n, verify ImageCropper/VideoTrimmer)*
