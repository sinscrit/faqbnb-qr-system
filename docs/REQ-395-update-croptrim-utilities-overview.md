# REQ-395: Update Crop/Trim Utilities for Localization - Implementation Overview

**Generated:** 2026-01-19 22:00 UTC
**Last Modified:** 2026-01-19 22:00 UTC
**Epic:** Localization Epic 2 - Static UI Translation
**Sub-Epic:** 2E - Article & Content Management
**Task ID:** 2E.4
**Request Type:** ENHANCEMENT
**Size:** M (Medium)
**Priority:** P1 - High

---

## Summary

Update the ImageCropper and VideoTrimmer utility components to display all UI strings (controls, labels, messages, tooltips) in the user's selected language by replacing hardcoded English text with translation keys using the next-intl framework.

---

## Current State Analysis

### ImageCropper Component (`/src/components/ItemCapture/editors/ImageCropper.tsx`)

The component currently contains the following hardcoded strings:

| String | Location (Line) | Context |
|--------|-----------------|---------|
| `'Free'` | 81 | Aspect ratio option label |
| `'1:1'`, `'4:3'`, `'16:9'` | 82-84 | Aspect ratio option labels |
| `'Large image detected. Output may be scaled down for compatibility.'` | 367 | Warning message |
| `'Loading image...'` | 400 | Loading state |
| `'Applying crop...'` | 410 | Processing state |
| `'Preview:'` | 442 | Section label |
| `'Generating...'` | 452 | Preview generating state |
| `'Select area to preview'` | 452 | Empty preview instruction |
| `'Dismiss error'` | 466 | Aria label |
| `'Applying...'` | 486 | Button processing state |
| `'Apply Crop'` | 486 | Button label |
| `'Cancel'` | 499 | Button label |
| `'Failed to load image. Please try again.'` | 165 | Error message |
| `'Crop operation failed'` | 300 | Error message |
| `'Crop preview'` | 432 | Alt text |
| `'Crop preview thumbnail'` | 447 | Alt text |

### VideoTrimmer Component (`/src/components/ItemCapture/editors/VideoTrimmer.tsx`)

The component currently contains the following hardcoded strings:

| String | Location (Line) | Context |
|--------|-----------------|---------|
| `'Unable to determine video duration'` | 151 | Error message |
| `'Unable to play video. Please try again.'` | 229 | Error message |
| `'Error'` | 506 | Error title |
| `'Try again'` | 518 | Retry link |
| `'Loading video...'` | 543 | Loading state |
| `'Start trim point'` | 601 | Aria label |
| `'End trim point'` | 627 | Aria label |
| `'S'` | 611 | Start marker label |
| `'E'` | 638 | End marker label |
| `'0:00'` | 655 | Time display |
| `'Selection: '` | 664 | Label prefix |
| `' / '` | 671 | Duration separator |
| `'Duration: '` | 669 | Label prefix |
| `'Current: '` | 676 | Label prefix |
| `'Trimming '` | 682 | Info prefix |
| `'% reduction)'` | 683 | Info suffix |
| `'Skip to start marker'` | 700 | Aria label |
| `'Skip to end marker'` | 729 | Aria label |
| `'Pause'` / `'Play trimmed region'` | 714 | Aria labels |
| `'Cancel'` | 750 | Button label |
| `'Apply Trim'` | 766 | Button label |
| `'Failed to load video. Please check the file and try again.'` | 196 | Error message |
| `'Invalid trim selection'` | 445 | Validation error |

### ImageRotator Component (`/src/components/ItemCapture/editors/ImageRotator.tsx`)

Related component with similar patterns:

| String | Location (Line) | Context |
|--------|-----------------|---------|
| `'Loading image...'` | 371 | Loading state |
| `'Applying rotation...'` | 381 | Processing state |
| `'Preview'` | 400 | Alt text |
| `'Try Again'` | 422 | Retry button |
| `'Rotate image left 90 degrees'` | 433 | Aria label |
| `'Rotate image right 90 degrees'` | 446 | Aria label |
| `'Current rotation: '` | 463 | Info label |
| `'(modified)'` | 465 | Modification indicator |
| `'Keyboard: '` | 471 | Help text |
| `' to rotate, '`, `' to cancel, '`, `' to apply'` | 475-479 | Help text |
| `'Applying...'` | 496 | Button processing state |
| `'Apply Rotation'` | 496 | Button label |
| `'Cancel'` | 510 | Button label |
| `'Image rotation editor'` | 340 | Aria label |
| `'Processing rotation...'` | 355 | Screen reader announcement |
| `'Image rotated to X degrees'` | 329 | Screen reader announcement |

---

## Target State

After implementation, all three utility components will:
1. Import `useTranslations` from `next-intl`
2. Retrieve all UI strings from the `articles.crop`, `articles.trim`, and `articles.rotate` namespaces
3. Format time displays according to locale conventions
4. Maintain all existing functionality and behavior

---

## Technical Approach

### Translation Key Structure

Add the following keys to `/messages/en.json` under the `articles` namespace:

```json
{
  "articles": {
    "crop": {
      "title": "Crop Image",
      "aspectRatio": {
        "free": "Free",
        "square": "1:1",
        "standard": "4:3",
        "widescreen": "16:9"
      },
      "preview": {
        "label": "Preview:",
        "generating": "Generating...",
        "selectArea": "Select area to preview",
        "altText": "Crop preview",
        "thumbnailAlt": "Crop preview thumbnail"
      },
      "actions": {
        "apply": "Apply Crop",
        "applying": "Applying...",
        "cancel": "Cancel"
      },
      "status": {
        "loading": "Loading image...",
        "processing": "Applying crop..."
      },
      "warnings": {
        "largeImage": "Large image detected. Output may be scaled down for compatibility."
      },
      "errors": {
        "loadFailed": "Failed to load image. Please try again.",
        "cropFailed": "Crop operation failed",
        "dismissError": "Dismiss error"
      }
    },
    "trim": {
      "title": "Trim Video",
      "timeline": {
        "startMarker": "Start trim point",
        "endMarker": "End trim point",
        "startLabel": "S",
        "endLabel": "E"
      },
      "duration": {
        "selection": "Selection:",
        "duration": "Duration:",
        "current": "Current:",
        "trimming": "Trimming {time} ({percent}% reduction)"
      },
      "controls": {
        "skipToStart": "Skip to start marker",
        "skipToEnd": "Skip to end marker",
        "play": "Play trimmed region",
        "pause": "Pause"
      },
      "actions": {
        "apply": "Apply Trim",
        "cancel": "Cancel",
        "tryAgain": "Try again"
      },
      "status": {
        "loading": "Loading video...",
        "error": "Error"
      },
      "errors": {
        "loadFailed": "Failed to load video. Please check the file and try again.",
        "durationFailed": "Unable to determine video duration",
        "playFailed": "Unable to play video. Please try again.",
        "invalidSelection": "Invalid trim selection"
      }
    },
    "rotate": {
      "title": "Rotate Image",
      "editorLabel": "Image rotation editor",
      "preview": {
        "altText": "Preview"
      },
      "controls": {
        "rotateLeft": "Rotate image left 90 degrees",
        "rotateRight": "Rotate image right 90 degrees"
      },
      "info": {
        "currentRotation": "Current rotation: {degrees}",
        "modified": "(modified)"
      },
      "keyboard": {
        "label": "Keyboard:",
        "toRotate": "to rotate,",
        "toCancel": "to cancel,",
        "toApply": "to apply"
      },
      "actions": {
        "apply": "Apply Rotation",
        "applying": "Applying...",
        "cancel": "Cancel",
        "tryAgain": "Try Again"
      },
      "status": {
        "loading": "Loading image...",
        "processing": "Applying rotation...",
        "processingAnnouncement": "Processing rotation...",
        "rotatedAnnouncement": "Image rotated to {degrees} degrees"
      }
    }
  }
}
```

### Component Update Pattern

Each component will be updated following this pattern:

```typescript
'use client';

import { useTranslations } from 'next-intl';

export default function ImageCropper(props) {
  const t = useTranslations('articles.crop');
  const tCommon = useTranslations('common');

  // Replace hardcoded strings with translation calls
  // e.g., 'Apply Crop' becomes t('actions.apply')
  // e.g., 'Cancel' becomes tCommon('cancel')
}
```

### Time Formatting

VideoTrimmer already uses a `formatTime` utility from `trimUtils.ts`. This should be enhanced to support locale-aware formatting:

```typescript
// Current implementation returns "mm:ss" format
// Should be updated to use Intl.NumberFormat or similar for locale-appropriate separators
```

---

## Implementation Tasks

### Task 1: Add Translation Keys to Message Files

1. Add `articles.crop` namespace to `/messages/en.json`
2. Add `articles.trim` namespace to `/messages/en.json`
3. Add `articles.rotate` namespace to `/messages/en.json`
4. Generate translations for all 5 non-English languages (fr, es, de, nl, it)

### Task 2: Update ImageCropper Component

1. Add `useTranslations` import
2. Initialize translation hooks: `const t = useTranslations('articles.crop')`
3. Replace all hardcoded strings with translation function calls
4. Update ASPECT_RATIO_OPTIONS to use translation keys
5. Ensure aria-labels use translations
6. Test component renders correctly in all languages

### Task 3: Update VideoTrimmer Component

1. Add `useTranslations` import
2. Initialize translation hooks: `const t = useTranslations('articles.trim')`
3. Replace all hardcoded strings with translation function calls
4. Update time display labels to use translations
5. Update aria-labels for accessibility
6. Test timeline and controls in RTL languages (if supported later)

### Task 4: Update ImageRotator Component

1. Add `useTranslations` import
2. Initialize translation hooks: `const t = useTranslations('articles.rotate')`
3. Replace all hardcoded strings with translation function calls
4. Update screen reader announcements to use translations
5. Update keyboard shortcut help text

### Task 5: Testing and Validation

1. Verify all components render correctly with English translations
2. Switch to each supported language and verify:
   - No layout breaks from longer text
   - All strings display correctly
   - Time formatting remains readable
3. Test accessibility with screen readers
4. Run existing unit tests to ensure no regressions

---

## Authorized Files and Functions for Modification

### Primary Files

| File Path | Modification Type | Functions/Sections to Modify |
|-----------|-------------------|------------------------------|
| `/src/components/ItemCapture/editors/ImageCropper.tsx` | UPDATE | Entire component - add translations |
| `/src/components/ItemCapture/editors/VideoTrimmer.tsx` | UPDATE | Entire component - add translations |
| `/src/components/ItemCapture/editors/ImageRotator.tsx` | UPDATE | Entire component - add translations |
| `/messages/en.json` | UPDATE | Add `articles.crop`, `articles.trim`, `articles.rotate` namespaces |
| `/messages/fr.json` | UPDATE | Add French translations for new namespaces |
| `/messages/es.json` | UPDATE | Add Spanish translations for new namespaces |
| `/messages/de.json` | UPDATE | Add German translations for new namespaces |
| `/messages/nl.json` | UPDATE | Add Dutch translations for new namespaces |
| `/messages/it.json` | UPDATE | Add Italian translations for new namespaces |

### Secondary Files (May Need Updates)

| File Path | Modification Type | Reason |
|-----------|-------------------|--------|
| `/src/components/ItemCapture/editors/trimUtils.ts` | OPTIONAL | May enhance `formatTime` for locale support |
| `/src/components/ItemCapture/editors/rotationUtils.ts` | REVIEW | Check for hardcoded `ROTATION_ERROR_MESSAGES` that need translation |
| `/src/components/ItemCapture/editors/cropUtils.ts` | REVIEW | Check for any hardcoded error messages |

### Files NOT to Modify

- `/src/components/ItemCapture/editors/imageCropper.css` - CSS only, no strings
- `/src/components/ItemCapture/editors/__tests__/*.test.tsx` - Tests may need separate updates
- Third-party libraries (react-image-crop, etc.)

---

## Dependencies

### Required Before Starting

- Epic 1 Foundation complete (next-intl setup)
- `useTranslations` hook available from next-intl
- Message files structure in place (`/messages/*.json`)

### Blocked By

- REQ-392: Create articles namespace structure (creates base namespace)

### Blocks

- No downstream blockers identified

---

## Acceptance Criteria

- [ ] ImageCropper displays translated labels for all aspect ratio preset options
- [ ] Crop control buttons (apply, cancel) use translation keys
- [ ] VideoTrimmer shows translated labels for timeline markers and playback controls
- [ ] Trim action buttons use translation keys for apply, cancel, and retry
- [ ] Validation and error messages retrieve text from translation files
- [ ] Warning messages about large images/duration limits appear in user's language
- [ ] Success/loading state messages use translated text
- [ ] All three utility components maintain existing functionality after internationalization
- [ ] Translation keys follow the `articles.crop`, `articles.trim`, and `articles.rotate` namespace conventions
- [ ] Long translated text in control labels does not break component layouts
- [ ] Components render correctly in all 6 supported languages without UI issues
- [ ] Screen reader announcements use translated text
- [ ] Aria-labels are properly translated for accessibility

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Longer translated text breaks layouts | Medium | Low | Test with German (often longest), use flexible CSS |
| Missing translations at runtime | Low | Medium | Fallback to English, build-time checks |
| Time formatting inconsistencies | Low | Low | Use locale-aware formatting utilities |
| Regression in existing functionality | Low | High | Run existing unit tests, manual testing |

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Add translation keys | 30 minutes |
| Update ImageCropper | 45 minutes |
| Update VideoTrimmer | 45 minutes |
| Update ImageRotator | 30 minutes |
| Generate 5 language translations | 30 minutes |
| Testing and validation | 45 minutes |
| **Total** | **~4 hours** |

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [REQ-392: Create articles namespace structure](/docs/REQ-392-create-articles-namespace-structure-overview.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
