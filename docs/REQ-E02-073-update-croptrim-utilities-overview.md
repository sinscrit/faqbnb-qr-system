# REQ-E02-073: Update Crop and Trim Utilities for Article Editor - Implementation Overview

**Document Created:** 2026-01-20 23:15:00 UTC
**Last Modified:** 2026-01-20 23:15:00 UTC
**Request ID:** REQ-E02-073
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2E - Article & Content Management
**Task ID:** 2E.4
**Size:** M (Medium)
**Priority:** P1 - High

---

## 1. Executive Summary

This task involves updating the image cropping and video trimming utility components to replace hardcoded English strings with the next-intl translation system. The crop/trim utilities include `ImageCropper.tsx`, `VideoTrimmer.tsx`, `cropUtils.ts`, and `trimUtils.ts`. This enables content creators to edit media with fully localized interface controls and feedback, including aspect ratio labels, processing states, error messages, control buttons, and validation feedback in all 6 supported languages.

**Note:** The main UI components (`ImageCropper.tsx` and `VideoTrimmer.tsx`) overlap with Task 2E.2 (REQ-E02-071). This task focuses on ensuring comprehensive coverage of crop/trim-specific strings and the utility functions that may surface user-facing messages.

---

## 2. Current State Analysis

### 2.1 Components Requiring Localization

| Component | Location | Estimated Strings | Complexity |
|-----------|----------|-------------------|------------|
| **ImageCropper** | `/src/components/ItemCapture/editors/ImageCropper.tsx` | ~20 | Medium |
| **VideoTrimmer** | `/src/components/ItemCapture/editors/VideoTrimmer.tsx` | ~28 | Medium |
| **cropUtils** | `/src/components/ItemCapture/editors/cropUtils.ts` | ~3 | Low |
| **trimUtils** | `/src/components/ItemCapture/editors/trimUtils.ts` | ~5 | Low |
| **Total** | | **~56** | |

### 2.2 Hardcoded Strings Identified

#### ImageCropper.tsx (Line References)

**Aspect Ratio Options (Lines 80-85):**
- `"Free"` - Free-form aspect ratio label
- `"1:1"` - Square aspect ratio label
- `"4:3"` - Standard photo ratio label
- `"16:9"` - Widescreen ratio label

**Error Messages:**
- Line 165: `"Failed to load image. Please try again."` - Image load error

**Warnings:**
- Lines 366-368: `"Large image detected. Output may be scaled down for compatibility."` - Large image warning

**Loading/Processing States:**
- Line 400: `"Loading image..."` - Image loading state
- Line 410: `"Applying crop..."` - Crop processing state

**Preview Section:**
- Line 432: `"Crop preview"` - Alt text for preview image
- Line 442: `"Preview:"` - Preview label
- Line 452: `"Generating..."` - Preview generation in progress
- Line 453: `"Select area to preview"` - Initial preview prompt

**Action Buttons:**
- Line 466: `"Dismiss error"` - Error dismiss button aria-label
- Line 486: `"Applying..."` - Button text during processing
- Line 486: `"Apply Crop"` - Apply button label
- Line 498: `"Cancel"` - Cancel button label

#### VideoTrimmer.tsx (Line References)

**Error Messages:**
- Line 152: `"Unable to determine video duration"` - Duration detection error
- Line 196: `"Failed to load video. Please check the file and try again."` - Video load error
- Line 229: `"Unable to play video. Please try again."` - Playback error
- Line 445: `"Invalid trim selection"` - Fallback validation error

**Error Display:**
- Line 506: `"Error"` - Error heading
- Line 517: `"Try again"` - Retry button

**Loading States:**
- Line 543: `"Loading video..."` - Video loading state

**Timeline Markers (Aria-Labels):**
- Line 601: `"Start trim point"` - Start marker aria-label
- Line 611: `"S"` - Start marker visual indicator
- Line 635: `"End trim point"` - End marker aria-label
- Line 638: `"E"` - End marker visual indicator

**Duration Display:**
- Line 664: `"Selection: "` - Selection label (hidden on mobile)
- Line 669: `"Duration: "` - Duration label (hidden on mobile)
- Line 676: `"Current:"` - Current playhead time label
- Lines 682-683: `"Trimming {time} ({percent}% reduction)"` - Trim savings indicator

**Playback Controls (Aria-Labels):**
- Line 700: `"Skip to start marker"` - Skip-to-start button aria-label
- Line 714: `"Pause"` - Pause button aria-label
- Line 714: `"Play trimmed region"` - Play button aria-label
- Line 728: `"Skip to end marker"` - Skip-to-end button aria-label

**Action Buttons:**
- Line 750: `"Cancel"` - Cancel button label
- Line 766: `"Apply Trim"` - Apply trim button label

#### cropUtils.ts (Line References)

**Error Messages:**
- Lines 82-85: `"Failed to get canvas 2D context. Your browser may not support this operation."` - Canvas error
- Lines 117-119: `"Failed to create image blob. The {format} format may not be supported by your browser."` - Blob creation error

#### trimUtils.ts (Line References)

**Validation Error Messages:**
- Line 78: `"Start time cannot be negative"` - Start time validation
- Line 81: `"End time exceeds video duration"` - End time validation
- Line 84: `"Start time must be before end time"` - Order validation
- Lines 87-89: `"Minimum trim duration is {min} second(s)"` - Minimum duration validation (with pluralization)

---

## 3. Implementation Approach

### 3.1 Translation Namespace Structure

All crop/trim strings will be added to the `articles` namespace within the existing `/messages/en.json` structure, extending the structure defined in REQ-E02-071:

```json
{
  "articles": {
    "crop": {
      "aspectRatios": {
        "free": "Free",
        "square": "1:1",
        "standard": "4:3",
        "widescreen": "16:9"
      },
      "loading": "Loading image...",
      "processing": "Applying crop...",
      "preview": {
        "label": "Preview:",
        "generating": "Generating...",
        "selectArea": "Select area to preview",
        "alt": "Crop preview"
      },
      "actions": {
        "applyCrop": "Apply Crop",
        "applying": "Applying...",
        "cancel": "Cancel",
        "dismissError": "Dismiss error"
      },
      "errors": {
        "loadFailed": "Failed to load image. Please try again.",
        "canvasContext": "Failed to get canvas 2D context. Your browser may not support this operation.",
        "blobCreation": "Failed to create image blob. The {format} format may not be supported by your browser."
      },
      "warnings": {
        "largeImage": "Large image detected. Output may be scaled down for compatibility."
      }
    },
    "trim": {
      "loading": "Loading video...",
      "markers": {
        "start": "Start trim point",
        "startLabel": "S",
        "end": "End trim point",
        "endLabel": "E"
      },
      "display": {
        "selection": "Selection:",
        "duration": "Duration:",
        "current": "Current:",
        "trimSavings": "Trimming {time} ({percent}% reduction)"
      },
      "playback": {
        "skipToStart": "Skip to start marker",
        "skipToEnd": "Skip to end marker",
        "play": "Play trimmed region",
        "pause": "Pause"
      },
      "actions": {
        "applyTrim": "Apply Trim",
        "cancel": "Cancel",
        "tryAgain": "Try again"
      },
      "errors": {
        "heading": "Error",
        "loadFailed": "Failed to load video. Please check the file and try again.",
        "playbackFailed": "Unable to play video. Please try again.",
        "durationUnknown": "Unable to determine video duration",
        "invalidSelection": "Invalid trim selection"
      },
      "validation": {
        "startNegative": "Start time cannot be negative",
        "endExceedsDuration": "End time exceeds video duration",
        "startAfterEnd": "Start time must be before end time",
        "minDuration": "Minimum trim duration is {min} {min, plural, one {second} other {seconds}}"
      }
    }
  }
}
```

### 3.2 Component Update Pattern

#### For UI Components (ImageCropper, VideoTrimmer)

```tsx
// Before (hardcoded string)
const ASPECT_RATIO_OPTIONS = [
  { value: 'free', label: 'Free' },
  { value: '1:1', label: '1:1' },
];

// After (translated - move inside component or create dynamic function)
import { useTranslations } from 'next-intl';

export default function ImageCropper({ ... }) {
  const t = useTranslations('articles.crop');

  const aspectRatioOptions = [
    { value: 'free', label: t('aspectRatios.free') },
    { value: '1:1', label: t('aspectRatios.square') },
    { value: '4:3', label: t('aspectRatios.standard') },
    { value: '16:9', label: t('aspectRatios.widescreen') },
  ];

  // ... rest of component
}
```

#### For Utility Functions (cropUtils, trimUtils)

The utility files (`cropUtils.ts` and `trimUtils.ts`) are pure TypeScript modules without React context. There are two approaches:

**Option A: Return error codes, translate in components (Recommended)**
```typescript
// trimUtils.ts - return error codes
export function validateTrim(...): TrimValidation {
  if (startTime < 0) {
    return { isValid: false, errorCode: 'startNegative' };
  }
  // ...
}

// VideoTrimmer.tsx - translate in component
const handleApplyTrim = () => {
  const validation = validateTrim(...);
  if (!validation.isValid) {
    const errorMessage = validation.errorCode
      ? t(`validation.${validation.errorCode}`, { min: minTrimDuration })
      : t('errors.invalidSelection');
    setError(errorMessage);
  }
};
```

**Option B: Pass translator function to utility**
```typescript
// trimUtils.ts
type Translator = (key: string, params?: Record<string, unknown>) => string;

export function validateTrim(
  ...,
  t?: Translator
): TrimValidation {
  if (startTime < 0) {
    return {
      isValid: false,
      error: t?.('validation.startNegative') || 'Start time cannot be negative'
    };
  }
}
```

**Recommendation:** Use Option A for cleaner separation of concerns. The utility functions return error codes, and the UI components handle translation.

### 3.3 Implementation Order

1. **Add translation keys to `/messages/en.json`** - Add `articles.crop` and `articles.trim` namespaces
2. **Update ImageCropper.tsx** - Add translations for aspect ratios, states, errors, buttons
3. **Update VideoTrimmer.tsx** - Add translations for all UI elements, states, errors
4. **Update trimUtils.ts** - Modify `validateTrim` to return error codes instead of hardcoded messages
5. **Update cropUtils.ts** - Modify error throwing to use error codes (component catches and translates)
6. **Generate translations for 5 non-English languages**

---

## 4. Authorized Files and Functions for Modification

### 4.1 Translation Files

| File | Modification Type | Description |
|------|-------------------|-------------|
| `/messages/en.json` | MODIFY | Add `articles.crop` and `articles.trim` namespaces |
| `/messages/fr.json` | MODIFY | Add French translations for all new keys |
| `/messages/es.json` | MODIFY | Add Spanish translations for all new keys |
| `/messages/de.json` | MODIFY | Add German translations for all new keys |
| `/messages/nl.json` | MODIFY | Add Dutch translations for all new keys |
| `/messages/it.json` | MODIFY | Add Italian translations for all new keys |

### 4.2 Component Files

| File | Functions/Sections to Modify |
|------|------------------------------|
| `/src/components/ItemCapture/editors/ImageCropper.tsx` | `ASPECT_RATIO_OPTIONS` array (move inside component), `onImageLoad`, `handleImageError`, large image warning render, loading/processing states, preview section, action buttons |
| `/src/components/ItemCapture/editors/VideoTrimmer.tsx` | `handleLoadedMetadata`, `handleError`, error display section, loading state, timeline marker aria-labels, duration display, playback control aria-labels, action buttons, trim savings indicator |
| `/src/components/ItemCapture/editors/cropUtils.ts` | `executeCrop` function - modify error throwing to use error codes or structured errors |
| `/src/components/ItemCapture/editors/trimUtils.ts` | `validateTrim` function - return error codes instead of hardcoded messages, update `TrimValidation` interface |

### 4.3 Functions Requiring Modification (Detailed)

#### ImageCropper.tsx

| Function/Section | Lines | Modification |
|-----------------|-------|--------------|
| `ASPECT_RATIO_OPTIONS` | 80-85 | Move inside component, use `t()` for labels |
| `handleImageError` | 163-166 | Replace hardcoded error with `t('errors.loadFailed')` |
| Large image warning | 366-368 | Replace with `t('warnings.largeImage')` |
| Loading state | 398-402 | Replace with `t('loading')` |
| Processing state | 408-412 | Replace with `t('processing')` |
| Preview label | 442 | Replace with `t('preview.label')` |
| Preview messages | 451-453 | Replace with `t('preview.generating')` and `t('preview.selectArea')` |
| Preview alt text | 432 | Replace with `t('preview.alt')` |
| Error dismiss button | 466 | Replace aria-label with `t('actions.dismissError')` |
| Apply button | 486 | Replace with `t('actions.applying')` / `t('actions.applyCrop')` |
| Cancel button | 498 | Replace with `t('actions.cancel')` |

#### VideoTrimmer.tsx

| Function/Section | Lines | Modification |
|-----------------|-------|--------------|
| `handleLoadedMetadata` | 149-152 | Replace error message with `t('errors.durationUnknown')` |
| `handleError` | 195-198 | Replace with `t('errors.loadFailed')` |
| Playback error | 229 | Replace with `t('errors.playbackFailed')` |
| `handleApplyTrim` | 443-447 | Translate validation errors using error codes from `validateTrim` |
| Error heading | 506 | Replace with `t('errors.heading')` |
| Try again button | 517 | Replace with `t('actions.tryAgain')` |
| Loading state | 543 | Replace with `t('loading')` |
| Start marker aria-label | 601 | Replace with `t('markers.start')` |
| Start marker label | 611 | Keep as `"S"` (single character, or use `t('markers.startLabel')`) |
| End marker aria-label | 635 | Replace with `t('markers.end')` |
| End marker label | 638 | Keep as `"E"` (single character, or use `t('markers.endLabel')`) |
| Selection label | 664 | Replace with `t('display.selection')` |
| Duration label | 669 | Replace with `t('display.duration')` |
| Current label | 676 | Replace with `t('display.current')` |
| Trim savings | 682-683 | Replace with `t('display.trimSavings', { time, percent })` |
| Skip to start | 700 | Replace aria-label with `t('playback.skipToStart')` |
| Play/Pause | 714 | Replace aria-label with `t('playback.pause')` / `t('playback.play')` |
| Skip to end | 728 | Replace aria-label with `t('playback.skipToEnd')` |
| Cancel button | 750 | Replace with `t('actions.cancel')` |
| Apply button | 766 | Replace with `t('actions.applyTrim')` |

#### cropUtils.ts

| Function | Lines | Modification |
|----------|-------|--------------|
| `executeCrop` | 82-86 | Throw structured error with code `'canvasContextFailed'` |
| `executeCrop` | 117-119 | Throw structured error with code `'blobCreationFailed'` and format parameter |

**Suggested Approach:**
```typescript
// Custom error type for crop operations
export class CropError extends Error {
  constructor(
    public code: 'canvasContextFailed' | 'blobCreationFailed',
    public params?: Record<string, string>
  ) {
    super(code);
    this.name = 'CropError';
  }
}

// In executeCrop:
if (!ctx) {
  throw new CropError('canvasContextFailed');
}
// ...
if (!blob) {
  throw new CropError('blobCreationFailed', { format: outputFormat });
}
```

#### trimUtils.ts

| Function | Lines | Modification |
|----------|-------|--------------|
| `TrimValidation` interface | 58-61 | Add `errorCode?: string` property |
| `validateTrim` | 77-93 | Return error codes instead of hardcoded strings |

**Updated Interface:**
```typescript
export interface TrimValidation {
  isValid: boolean;
  error?: string; // Keep for backwards compatibility but deprecate
  errorCode?: 'startNegative' | 'endExceedsDuration' | 'startAfterEnd' | 'minDuration';
  errorParams?: Record<string, unknown>; // For interpolation (e.g., { min: 1 })
}
```

---

## 5. Dependencies

### 5.1 Epic 1 Dependencies (Must Be Complete)

| Dependency | Location | Status |
|------------|----------|--------|
| next-intl package installed | `package.json` | Required |
| IntlProvider configured | `/src/app/layout.tsx` | Required |
| Translation files exist | `/messages/*.json` | Required |
| `useTranslations` hook available | `next-intl` | Required |

### 5.2 Cross-Task Dependencies

| Dependency | Task | Description |
|------------|------|-------------|
| Common namespace exists | 2H.1 | May reuse `common.cancel` if defined |
| Articles namespace structure | 2E.1 (REQ-E02-070) | The `articles` namespace should exist |
| Editor components | 2E.2 (REQ-E02-071) | ImageCropper and VideoTrimmer are also covered in 2E.2; coordinate to avoid duplication |

### 5.3 Coordination with REQ-E02-071

The `ImageCropper.tsx` and `VideoTrimmer.tsx` components appear in both REQ-E02-071 and this task (REQ-E02-073). To avoid duplication:
- If REQ-E02-071 is implemented first, this task should verify and potentially extend the translations
- If this task is implemented first, REQ-E02-071 should reference this work
- The `articles.crop` and `articles.trim` namespaces should be consistent with the broader `articles` namespace structure

---

## 6. Testing Requirements

### 6.1 Unit Tests

- Verify all hardcoded strings are replaced with translation function calls
- Test that translation keys exist and return expected values
- Test `validateTrim` returns correct error codes for each validation failure
- Test `CropError` class properly captures error codes and parameters
- Test interpolation variables are correctly passed (e.g., `{min}`, `{time}`, `{percent}`, `{format}`)

### 6.2 Integration Tests

- Test image cropping workflow in all 6 languages
- Test video trimming workflow in all 6 languages
- Verify aspect ratio labels display correctly when switching languages
- Test validation error messages appear in correct language
- Verify no English fallback strings appear when using non-English locales

### 6.3 Visual Testing

- Check text truncation in aspect ratio buttons for longer translations (German)
- Verify layout integrity with text expansion in duration display
- Test mobile responsiveness with translated strings
- Verify timeline marker labels don't overlap with longer text

### 6.4 Accessibility Testing

- Verify screen reader announces correct translated text for timeline markers
- Test keyboard navigation with translated aria-labels
- Confirm all interactive elements have translated accessible names
- Test play/pause aria-label changes correctly based on state

---

## 7. Acceptance Criteria (From Request)

- [ ] Image cropping tool labels and instructions are replaced with translation hooks from the articles namespace
- [ ] Aspect ratio preset buttons (Free, 1:1, 4:3, 16:9) display translated labels
- [ ] Dimension input fields and labels (if any) show in the selected language
- [ ] Zoom and pan controls display localized text (if applicable)
- [ ] Crop area reset and cancel options use localized strings
- [ ] Apply/save confirmation buttons display in the correct language
- [ ] Error messages related to invalid crop dimensions appear in the selected language
- [ ] Video trimming timeline markers and labels display translated text
- [ ] Start/end time displays use localized formatting
- [ ] Preview toggle buttons use localized strings
- [ ] Trim apply/reset/cancel buttons display in the correct language
- [ ] Validation messages for invalid trim timeframes appear in the correct language
- [ ] Loading and processing state messages are fully translated
- [ ] All crop/trim error messages display in the selected language with clear guidance
- [ ] No hardcoded English strings remain in crop/trim utility components
- [ ] Translation keys follow established naming conventions in the articles namespace
- [ ] Crop/trim components properly handle language switching without breaking edit state

---

## 8. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Overlap with REQ-E02-071 | High | Low | Coordinate with 2E.2 task, share namespace structure |
| Text overflow in aspect ratio buttons | Medium | Low | Test with German, allow flexible button widths |
| Utility function refactoring complexity | Low | Medium | Use error codes pattern, maintain backwards compatibility |
| Timeline marker label truncation | Low | Low | Keep single-character markers ("S", "E") |
| Missing translation keys at runtime | Low | High | Build-time validation, console warnings in dev |
| Edit state lost on language switch | Low | Medium | Translations should not trigger component remounts |

---

## 9. Estimated Effort

| Task | Estimate |
|------|----------|
| Add translation keys to en.json | 30 minutes |
| Update ImageCropper.tsx | 1 hour |
| Update VideoTrimmer.tsx | 1.5 hours |
| Update cropUtils.ts | 30 minutes |
| Update trimUtils.ts | 30 minutes |
| Generate 5 language translations | 1 hour |
| Testing and verification | 1.5 hours |
| **Total** | **~6-7 hours** |

---

## 10. References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Request REQ-E02-071](/docs/REQ-E02-071-update-editor-components-overview.md) - Editor components (related/overlapping task)
- [Request REQ-E02-070](/docs/gen_requests_epic2.md) - Articles namespace structure (prerequisite)
- [Request REQ-E02-072](/docs/REQ-E02-072-update-media-handling-components-overview.md) - Media handling components (related task)
