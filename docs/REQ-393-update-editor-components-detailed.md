# REQ-393: Update Editor Components for Localization - Detailed Task Breakdown

**Last Modified:** 2026-01-19 23:30 UTC
**Request ID:** REQ-393
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2E - Article & Content Management
**Task ID:** 2E.2
**Type:** ENHANCEMENT
**Size:** M (Medium)
**Source Overview:** [REQ-393-update-editor-components-overview.md](./REQ-393-update-editor-components-overview.md)
**Source Plan:** [Plan-111-L10N-Epic2-Static-UI-Translation.md](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)

---

## Executive Summary

This document provides granular, implementation-ready tasks for updating the four editor components (MarkdownEditor, ImageCropper, VideoTrimmer, and ImageRotator) to support localization. Each task is scoped to approximately 1 story point and can be executed independently following the established next-intl patterns.

**Total Estimated Strings:** ~60
**Components to Update:** 4 main components + 1 utility file
**Translation Files to Update:** 6 (en, fr, es, de, nl, it)

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] next-intl package is installed (`package.json`)
- [ ] i18n config exists at `/src/lib/i18n/config.ts`
- [ ] IntlProvider wrapper is configured in `/src/app/layout.tsx`
- [ ] Translation files exist in `/messages/*.json`
- [ ] `useTranslations` hook is available from `next-intl`

---

## Task Breakdown

### Phase 1: Translation Key Structure Setup

#### Task 1.1: Add `articles.editor` Namespace to English Translation File

**File:** `/messages/en.json`
**Effort:** 1 SP
**Dependencies:** None

**Objective:** Create the `articles.editor` namespace with all translation keys for the MarkdownEditor component.

**Implementation Steps:**

1. Open `/messages/en.json`
2. Add the following structure under a new `articles` key (create if not exists):

```json
{
  "articles": {
    "editor": {
      "tabs": {
        "editor": "Editor",
        "preview": "Preview"
      },
      "toolbar": {
        "textFormatting": "Text formatting",
        "bold": "Bold (Ctrl+B)",
        "italic": "Italic (Ctrl+I)",
        "heading1": "Heading 1",
        "heading2": "Heading 2",
        "heading3": "Heading 3",
        "bulletList": "Bullet List",
        "numberedList": "Numbered List",
        "link": "Insert Link (Ctrl+K)"
      },
      "placeholder": "Write your content here using markdown formatting...",
      "characterCount": "{current, number} / {max, number} characters",
      "characterLimitExceeded": "Content exceeds the maximum character limit. Please shorten your text.",
      "previewPlaceholder": "Start typing to see a preview of your formatted content...",
      "previewLabel": "Preview",
      "editorLabel": "Markdown editor",
      "viewMode": "Editor view mode"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] `articles.editor` namespace exists in `/messages/en.json`
- [ ] All 18 keys for MarkdownEditor are present
- [ ] ICU format used for `characterCount` with `{current, number}` and `{max, number}`
- [ ] JSON is valid (no syntax errors)

---

#### Task 1.2: Add `articles.crop` Namespace to English Translation File

**File:** `/messages/en.json`
**Effort:** 1 SP
**Dependencies:** None (can run parallel with Task 1.1)

**Objective:** Create the `articles.crop` namespace with all translation keys for the ImageCropper component.

**Implementation Steps:**

1. Open `/messages/en.json`
2. Add the following structure under `articles`:

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
      "loading": "Loading image...",
      "applying": "Applying crop...",
      "preview": "Preview:",
      "previewGenerating": "Generating...",
      "previewSelect": "Select area to preview",
      "apply": "Apply Crop",
      "cancel": "Cancel",
      "largeImageWarning": "Large image detected. Output may be scaled down for compatibility.",
      "loadError": "Failed to load image. Please try again.",
      "cropPreviewAlt": "Crop preview",
      "cropPreviewThumbnailAlt": "Crop preview thumbnail",
      "dismissError": "Dismiss error"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] `articles.crop` namespace exists in `/messages/en.json`
- [ ] All 15 keys for ImageCropper are present
- [ ] JSON is valid (no syntax errors)

---

#### Task 1.3: Add `articles.video` Namespace to English Translation File

**File:** `/messages/en.json`
**Effort:** 1 SP
**Dependencies:** None (can run parallel with Tasks 1.1, 1.2)

**Objective:** Create the `articles.video` namespace with all translation keys for the VideoTrimmer component.

**Implementation Steps:**

1. Open `/messages/en.json`
2. Add the following structure under `articles`:

```json
{
  "articles": {
    "video": {
      "title": "Trim Video",
      "loading": "Loading video...",
      "error": {
        "title": "Error",
        "durationUnknown": "Unable to determine video duration",
        "playbackFailed": "Unable to play video. Please try again.",
        "loadFailed": "Failed to load video. Please check the file and try again.",
        "invalidTrim": "Invalid trim selection",
        "tryAgain": "Try again"
      },
      "timeline": {
        "startMarker": "Start trim point",
        "endMarker": "End trim point"
      },
      "controls": {
        "skipToStart": "Skip to start marker",
        "skipToEnd": "Skip to end marker",
        "play": "Play trimmed region",
        "pause": "Pause"
      },
      "display": {
        "selection": "Selection:",
        "duration": "Duration:",
        "current": "Current:",
        "trimSavings": "Trimming {time} ({percent}% reduction)"
      },
      "apply": "Apply Trim",
      "cancel": "Cancel"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] `articles.video` namespace exists in `/messages/en.json`
- [ ] All 18 keys for VideoTrimmer are present
- [ ] ICU format used for `trimSavings` with `{time}` and `{percent}`
- [ ] JSON is valid (no syntax errors)

---

#### Task 1.4: Add `articles.rotate` Namespace to English Translation File

**File:** `/messages/en.json`
**Effort:** 1 SP
**Dependencies:** None (can run parallel with Tasks 1.1-1.3)

**Objective:** Create the `articles.rotate` namespace with all translation keys for the ImageRotator component.

**Implementation Steps:**

1. Open `/messages/en.json`
2. Add the following structure under `articles`:

```json
{
  "articles": {
    "rotate": {
      "title": "Rotate Image",
      "region": "Image rotation editor",
      "loading": "Loading image...",
      "applying": "Applying rotation...",
      "processing": "Processing rotation...",
      "rotateLeft": "Rotate image left 90 degrees",
      "rotateRight": "Rotate image right 90 degrees",
      "announcement": "Image rotated to {degrees} degrees",
      "currentRotation": "Current rotation: {degrees}°",
      "modified": "(modified)",
      "keyboard": {
        "label": "Keyboard:",
        "rotate": "to rotate",
        "cancel": "to cancel",
        "apply": "to apply"
      },
      "apply": "Apply Rotation",
      "cancel": "Cancel",
      "tryAgain": "Try Again",
      "previewAlt": "Preview",
      "error": {
        "loadFailed": "Failed to load image. Please try again.",
        "rotationFailed": "Failed to rotate image. Please try again.",
        "canvasUnavailable": "Your browser does not support image editing.",
        "memoryError": "Not enough memory to process image. Try closing other tabs.",
        "blobCreationFailed": "Failed to create image output. Please try again."
      }
    }
  }
}
```

**Acceptance Criteria:**
- [ ] `articles.rotate` namespace exists in `/messages/en.json`
- [ ] All 20 keys for ImageRotator are present
- [ ] ICU format used for `announcement` and `currentRotation` with `{degrees}`
- [ ] Error messages from `rotationUtils.ts` are included
- [ ] JSON is valid (no syntax errors)

---

#### Task 1.5: Propagate Translation Keys to All 5 Non-English Language Files

**Files:** `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`
**Effort:** 2 SP
**Dependencies:** Tasks 1.1, 1.2, 1.3, 1.4

**Objective:** Add the `articles` namespace with all sub-namespaces (editor, crop, video, rotate) to all non-English translation files with professionally translated strings.

**Implementation Steps:**

1. For each language file, add the complete `articles` namespace structure
2. Use AI-assisted translation or professional translation service
3. Preserve ICU message format placeholders (`{current}`, `{max}`, `{time}`, `{percent}`, `{degrees}`)
4. Maintain keyboard shortcut indicators (Ctrl+B, etc.) - do not translate these

**French (`/messages/fr.json`) - Sample Keys:**
```json
{
  "articles": {
    "editor": {
      "tabs": {
        "editor": "Éditeur",
        "preview": "Aperçu"
      },
      "placeholder": "Écrivez votre contenu ici en utilisant le formatage markdown..."
    },
    "crop": {
      "apply": "Appliquer le recadrage",
      "loading": "Chargement de l'image..."
    },
    "video": {
      "apply": "Appliquer le découpage",
      "loading": "Chargement de la vidéo..."
    },
    "rotate": {
      "apply": "Appliquer la rotation",
      "loading": "Chargement de l'image..."
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All 5 non-English files have the `articles` namespace
- [ ] Key structure is identical to `en.json`
- [ ] ICU placeholders are preserved (not translated)
- [ ] Keyboard shortcuts in ARIA labels are preserved (Ctrl+B, etc.)
- [ ] All JSON files are valid (no syntax errors)
- [ ] Translations are linguistically appropriate for each locale

---

### Phase 2: Component Updates

#### Task 2.1: Update MarkdownEditor Component

**File:** `/src/components/ItemCapture/editors/MarkdownEditor.tsx`
**Effort:** 2 SP
**Dependencies:** Task 1.1

**Objective:** Replace all hardcoded English strings in MarkdownEditor with translation keys.

**Current Hardcoded Strings (Lines):**
- Line 89: `"{current.toLocaleString()} / {max.toLocaleString()} characters"`
- Line 128: `"Editor view mode"` (aria-label)
- Line 146: `"Editor"` (tab label)
- Line 164: `"Preview"` (tab label)
- Lines 181-188: `TOOLBAR_BUTTONS` array `ariaLabel` values
- Line 205: `"Text formatting"` (toolbar aria-label)
- Line 239: `"Write your content here using markdown formatting..."` (placeholder default)
- Line 243: `"Markdown editor"` (ariaLabel default)
- Line 395-398: Character limit exceeded error message
- Line 416: `"Preview"` (header label)
- Line 437-438: Preview placeholder text

**Implementation Steps:**

1. Add import at top of file:
```typescript
import { useTranslations } from 'next-intl';
```

2. Initialize hook inside component (after `MarkdownEditor` function signature):
```typescript
const t = useTranslations('articles.editor');
```

3. Update `CharacterCounter` sub-component to accept `t` as prop or use its own hook:
```typescript
// Option 1: Pass t as prop (recommended for sub-components)
interface CharacterCounterProps {
  current: number;
  max: number;
  warning: number;
  t: ReturnType<typeof useTranslations>;
}

// In render:
{t('characterCount', { current, max })}
```

4. Update `MobileTabSwitcher`:
```typescript
// Replace aria-label
aria-label={t('viewMode')}

// Replace tab labels
{t('tabs.editor')}
{t('tabs.preview')}
```

5. Update `TOOLBAR_BUTTONS` array - convert to function that takes `t`:
```typescript
const getToolbarButtons = (t: ReturnType<typeof useTranslations>): ToolbarButton[] => [
  { icon: Bold, format: 'bold', ariaLabel: t('toolbar.bold') },
  { icon: Italic, format: 'italic', ariaLabel: t('toolbar.italic') },
  // ... etc
];
```

6. Update `MarkdownToolbar` aria-label:
```typescript
aria-label={t('toolbar.textFormatting')}
```

7. Update default placeholder prop:
```typescript
placeholder = t('placeholder'),
```

8. Update default ariaLabel prop:
```typescript
ariaLabel = t('editorLabel'),
```

9. Update character limit exceeded message:
```typescript
<p className="text-red-600 text-sm mt-2" role="alert">
  {t('characterLimitExceeded')}
</p>
```

10. Update preview header and placeholder:
```typescript
<span>{t('previewLabel')}</span>

// Preview empty state
<p className="text-gray-400 italic">
  {t('previewPlaceholder')}
</p>
```

**Acceptance Criteria:**
- [ ] `useTranslations` hook imported and initialized with `'articles.editor'`
- [ ] All hardcoded strings replaced with `t()` calls
- [ ] `TOOLBAR_BUTTONS` uses translated aria labels
- [ ] Character counter uses ICU format interpolation
- [ ] Default props use translation keys
- [ ] Component compiles without TypeScript errors
- [ ] Component renders correctly in browser
- [ ] Switching languages updates all visible text

---

#### Task 2.2: Update ImageCropper Component

**File:** `/src/components/ItemCapture/editors/ImageCropper.tsx`
**Effort:** 2 SP
**Dependencies:** Task 1.2

**Objective:** Replace all hardcoded English strings in ImageCropper with translation keys.

**Current Hardcoded Strings (Lines):**
- Lines 80-85: `ASPECT_RATIO_OPTIONS` array labels ("Free", "1:1", "4:3", "16:9")
- Line 165: `"Failed to load image. Please try again."` (error message)
- Line 367: `"Large image detected..."` (warning)
- Line 400: `"Loading image..."` (loading state)
- Line 410: `"Applying crop..."` (processing state)
- Line 432: `"Crop preview"` (alt text)
- Line 442: `"Preview:"` (label)
- Line 447: `"Crop preview thumbnail"` (alt text)
- Line 451-452: Preview placeholder text ("Generating...", "Select area to preview")
- Line 463: Error message display (`{error}`)
- Line 465: Dismiss error aria-label
- Line 486: `"Applying..."` / `"Apply Crop"` (button)
- Line 499: `"Cancel"` (button)

**Implementation Steps:**

1. Add import:
```typescript
import { useTranslations } from 'next-intl';
```

2. Initialize hook inside component:
```typescript
const t = useTranslations('articles.crop');
```

3. Convert `ASPECT_RATIO_OPTIONS` to function:
```typescript
const getAspectRatioOptions = (t: ReturnType<typeof useTranslations>) => [
  { value: 'free' as AspectRatioPreset, label: t('aspectRatio.free') },
  { value: '1:1' as AspectRatioPreset, label: t('aspectRatio.square') },
  { value: '4:3' as AspectRatioPreset, label: t('aspectRatio.standard') },
  { value: '16:9' as AspectRatioPreset, label: t('aspectRatio.widescreen') },
];
```

4. Update error message in `handleImageError`:
```typescript
setError(t('loadError'));
```

5. Update large image warning:
```typescript
{t('largeImageWarning')}
```

6. Update loading state:
```typescript
<span className="text-sm text-gray-500">{t('loading')}</span>
```

7. Update processing overlay:
```typescript
<span className="text-sm text-gray-600">{t('applying')}</span>
```

8. Update image alt texts:
```typescript
alt={t('cropPreviewAlt')}
alt={t('cropPreviewThumbnailAlt')}
```

9. Update preview section:
```typescript
<span className="text-xs text-gray-500 font-medium">{t('preview')}</span>
<span className="text-xs text-gray-400">
  {completedCrop ? t('previewGenerating') : t('previewSelect')}
</span>
```

10. Update dismiss button:
```typescript
aria-label={t('dismissError')}
```

11. Update action buttons:
```typescript
{isProcessing ? t('applying').replace('...', '') + '...' : t('apply')}
{t('cancel')}
```

**Acceptance Criteria:**
- [ ] `useTranslations` hook imported and initialized with `'articles.crop'`
- [ ] All hardcoded strings replaced with `t()` calls
- [ ] `ASPECT_RATIO_OPTIONS` uses translated labels
- [ ] Error messages use translation keys
- [ ] Component compiles without TypeScript errors
- [ ] Component renders correctly in browser

---

#### Task 2.3: Update VideoTrimmer Component

**File:** `/src/components/ItemCapture/editors/VideoTrimmer.tsx`
**Effort:** 2 SP
**Dependencies:** Task 1.3

**Objective:** Replace all hardcoded English strings in VideoTrimmer with translation keys.

**Current Hardcoded Strings (Lines):**
- Line 152: `"Unable to determine video duration"` (error)
- Line 196: `"Failed to load video. Please check the file and try again."` (error)
- Line 229: `"Unable to play video. Please try again."` (error)
- Line 445: `"Invalid trim selection"` (error)
- Line 506: `"Error"` (error title)
- Line 518: `"Try again"` (button)
- Line 543: `"Loading video..."` (loading state)
- Line 601: `"Start trim point"` (aria-label)
- Line 629: `"End trim point"` (aria-label)
- Lines 664-671: Selection/Duration/Current labels
- Lines 682-683: Trim savings text with interpolation
- Line 700: `"Skip to start marker"` (aria-label)
- Line 714: `"Pause"` / `"Play trimmed region"` (aria-label)
- Line 728: `"Skip to end marker"` (aria-label)
- Line 750: `"Cancel"` (button)
- Line 766: `"Apply Trim"` (button)

**Implementation Steps:**

1. Add import:
```typescript
import { useTranslations } from 'next-intl';
```

2. Initialize hook:
```typescript
const t = useTranslations('articles.video');
```

3. Update `handleLoadedMetadata` error:
```typescript
setError(t('error.durationUnknown'));
```

4. Update `handleError`:
```typescript
setError(t('error.loadFailed'));
```

5. Update playback error in `handlePlayPause`:
```typescript
setError(t('error.playbackFailed'));
```

6. Update validation error in `handleApplyTrim`:
```typescript
setError(validation.error || t('error.invalidTrim'));
```

7. Update error display section:
```typescript
<p className="text-sm font-medium">{t('error.title')}</p>
<p className="text-sm mt-1">{error}</p>
<button ...>{t('error.tryAgain')}</button>
```

8. Update loading state:
```typescript
<span className="text-sm text-gray-600">{t('loading')}</span>
```

9. Update timeline marker aria-labels:
```typescript
aria-label={t('timeline.startMarker')}
aria-label={t('timeline.endMarker')}
```

10. Update duration display (with ICU interpolation):
```typescript
<span className="hidden sm:inline font-medium">{t('display.selection')} </span>
<span className="hidden sm:inline font-medium">{t('display.duration')} </span>
<span className="text-xs text-gray-500 mt-1">
  {t('display.current')} <span className="font-mono">{formatTime(currentTime)}</span>
</span>
```

11. Update trim savings (with ICU format):
```typescript
{t('display.trimSavings', {
  time: formatTime(duration - (endMarker - startMarker)),
  percent: Math.round((1 - (endMarker - startMarker) / duration) * 100)
})}
```

12. Update control button aria-labels:
```typescript
aria-label={t('controls.skipToStart')}
aria-label={isPlaying ? t('controls.pause') : t('controls.play')}
aria-label={t('controls.skipToEnd')}
```

13. Update action buttons:
```typescript
{t('cancel')}
{t('apply')}
```

**Acceptance Criteria:**
- [ ] `useTranslations` hook imported and initialized with `'articles.video'`
- [ ] All hardcoded strings replaced with `t()` calls
- [ ] ICU interpolation used for trim savings display
- [ ] All ARIA labels use translation keys
- [ ] Error messages use translation keys
- [ ] Component compiles without TypeScript errors
- [ ] Component renders correctly in browser

---

#### Task 2.4: Update ImageRotator Component

**File:** `/src/components/ItemCapture/editors/ImageRotator.tsx`
**Effort:** 2 SP
**Dependencies:** Task 1.4

**Objective:** Replace all hardcoded English strings in ImageRotator with translation keys.

**Current Hardcoded Strings (Lines):**
- Line 340: `"Image rotation editor"` (aria-label)
- Line 329: `"Image rotated to ${currentRotation} degrees"` (announcement)
- Line 355: `"Processing rotation..."` (screen reader)
- Line 371: `"Loading image..."` (loading state)
- Line 381: `"Applying rotation..."` (processing state)
- Line 400: `"Preview"` (alt text)
- Line 421: `"Try Again"` (button)
- Line 433: `"Rotate image left 90 degrees"` (aria-label)
- Line 448: `"Rotate image right 90 degrees"` (aria-label)
- Line 463: `"Current rotation: ${currentRotation}°"` (info display)
- Line 465: `"(modified)"` (indicator)
- Lines 471-479: Keyboard shortcuts help text
- Line 496: `"Applying..."` / `"Apply Rotation"` (button)
- Line 509: `"Cancel"` (button)

**Implementation Steps:**

1. Add import:
```typescript
import { useTranslations } from 'next-intl';
```

2. Initialize hook:
```typescript
const t = useTranslations('articles.rotate');
```

3. Update region aria-label:
```typescript
aria-label={t('region')}
```

4. Update `getRotationAnnouncement`:
```typescript
const getRotationAnnouncement = () => {
  return t('announcement', { degrees: currentRotation });
};
```

5. Update screen reader processing message:
```typescript
{isProcessing && t('processing')}
```

6. Update loading state:
```typescript
<span className="text-sm text-gray-500">{t('loading')}</span>
```

7. Update processing overlay:
```typescript
<span className="text-sm text-gray-600">{t('applying')}</span>
```

8. Update preview alt:
```typescript
alt={t('previewAlt')}
```

9. Update retry button:
```typescript
{t('tryAgain')}
```

10. Update rotation button aria-labels:
```typescript
aria-label={t('rotateLeft')}
aria-label={t('rotateRight')}
```

11. Update rotation info display (with ICU interpolation):
```typescript
{t('currentRotation', { degrees: currentRotation })}
{currentRotation !== initialRotation && (
  <span className="text-blue-500 ml-2">{t('modified')}</span>
)}
```

12. Update keyboard shortcuts help:
```typescript
<span>{t('keyboard.label')} </span>
<kbd className="...">←</kbd>
<span> / </span>
<kbd className="...">→</kbd>
<span> {t('keyboard.rotate')}, </span>
<kbd className="...">Esc</kbd>
<span> {t('keyboard.cancel')}, </span>
<kbd className="...">⌘+Enter</kbd>
<span> {t('keyboard.apply')}</span>
```

13. Update action buttons:
```typescript
{isProcessing ? t('applying').replace('...', '') + '...' : t('apply')}
{t('cancel')}
```

**Acceptance Criteria:**
- [ ] `useTranslations` hook imported and initialized with `'articles.rotate'`
- [ ] All hardcoded strings replaced with `t()` calls
- [ ] ICU interpolation used for rotation announcement and current rotation display
- [ ] Screen reader announcements use translation keys
- [ ] Keyboard shortcuts help uses translation keys
- [ ] Component compiles without TypeScript errors
- [ ] Component renders correctly in browser

---

#### Task 2.5: Update rotationUtils.ts Error Messages

**File:** `/src/components/ItemCapture/editors/rotationUtils.ts`
**Effort:** 1 SP
**Dependencies:** Task 1.4, Task 2.4

**Objective:** Move hardcoded error messages from `rotationUtils.ts` to translation files and update the utility to accept translation keys.

**Current Hardcoded Strings (Lines 26-32):**
```typescript
export const ROTATION_ERROR_MESSAGES = {
  IMAGE_LOAD_FAILED: 'Failed to load image. Please try again.',
  ROTATION_FAILED: 'Failed to rotate image. Please try again.',
  CANVAS_UNAVAILABLE: 'Your browser does not support image editing.',
  MEMORY_ERROR: 'Not enough memory to process image. Try closing other tabs.',
  BLOB_CREATION_FAILED: 'Failed to create image output. Please try again.',
} as const;
```

**Implementation Approach:**

Since `rotationUtils.ts` is a utility file that may be used in contexts where hooks aren't available, we have two options:

**Option A (Recommended): Pass translated messages from component**
1. Update `ImageRotator.tsx` to pass translated error messages when catching errors
2. Keep `ROTATION_ERROR_MESSAGES` as translation keys only (not full messages):

```typescript
// rotationUtils.ts
export const ROTATION_ERROR_KEYS = {
  IMAGE_LOAD_FAILED: 'error.loadFailed',
  ROTATION_FAILED: 'error.rotationFailed',
  CANVAS_UNAVAILABLE: 'error.canvasUnavailable',
  MEMORY_ERROR: 'error.memoryError',
  BLOB_CREATION_FAILED: 'error.blobCreationFailed',
} as const;
```

3. Update error handling in `ImageRotator.tsx`:
```typescript
// In catch block
const errorKey = err.message.includes('ROTATION_ERROR_KEYS')
  ? err.message
  : ROTATION_ERROR_KEYS.ROTATION_FAILED;
setState((prev) => ({
  ...prev,
  error: t(errorKey),
  isProcessing: false,
}));
```

**Option B: Keep error messages in utility file**
- No changes to `rotationUtils.ts`
- Map error messages to translation keys in the component

**Acceptance Criteria:**
- [ ] Error messages use translation keys when displayed in UI
- [ ] Utility file maintains backward compatibility
- [ ] TypeScript types are preserved
- [ ] No runtime errors when errors occur

---

### Phase 3: Testing and Verification

#### Task 3.1: Visual Verification in All 6 Languages

**Effort:** 1 SP
**Dependencies:** All Phase 1 and Phase 2 tasks

**Objective:** Manually verify all editor components render correctly in each supported language.

**Test Checklist:**

For each language (en, fr, es, de, nl, it):

**MarkdownEditor:**
- [ ] Tab labels display correctly
- [ ] Toolbar button tooltips appear on hover
- [ ] Placeholder text displays in editor
- [ ] Character counter format is correct
- [ ] Character limit exceeded message displays
- [ ] Preview placeholder displays when empty
- [ ] Preview header label displays

**ImageCropper:**
- [ ] Aspect ratio buttons display correct labels
- [ ] Loading state text displays
- [ ] Processing overlay text displays
- [ ] Preview label and placeholders display
- [ ] Large image warning displays
- [ ] Error messages display correctly
- [ ] Button labels display

**VideoTrimmer:**
- [ ] Loading state text displays
- [ ] Error messages display correctly
- [ ] Timeline marker labels (accessible via screen reader)
- [ ] Duration/selection labels display
- [ ] Trim savings text displays with correct interpolation
- [ ] Control button labels (accessible via screen reader)
- [ ] Action button labels display

**ImageRotator:**
- [ ] Loading state text displays
- [ ] Processing overlay text displays
- [ ] Rotation button labels (accessible via screen reader)
- [ ] Current rotation info displays with interpolation
- [ ] Modified indicator displays
- [ ] Keyboard shortcuts help text displays
- [ ] Error messages display correctly
- [ ] Action button labels display

**Acceptance Criteria:**
- [ ] All components render without errors in all 6 languages
- [ ] No untranslated strings visible
- [ ] Layout does not break with longer translated text

---

#### Task 3.2: Accessibility Verification

**Effort:** 1 SP
**Dependencies:** All Phase 1 and Phase 2 tasks

**Objective:** Verify ARIA labels and screen reader announcements work correctly in all languages.

**Test Checklist:**

- [ ] MarkdownEditor toolbar ARIA label is translated
- [ ] MarkdownEditor tab panel ARIA labels are translated
- [ ] ImageCropper aspect ratio buttons have translated pressed states
- [ ] VideoTrimmer timeline markers have translated ARIA labels
- [ ] VideoTrimmer control buttons have translated ARIA labels
- [ ] ImageRotator region ARIA label is translated
- [ ] ImageRotator rotation button ARIA labels are translated
- [ ] ImageRotator screen reader announcements use translated text
- [ ] All error messages are announced by screen readers in translated form

**Acceptance Criteria:**
- [ ] All ARIA labels use translated text
- [ ] Screen reader announcements work in all languages
- [ ] No accessibility regressions

---

#### Task 3.3: Layout Testing for Longer Translations

**Effort:** 1 SP
**Dependencies:** All Phase 1 and Phase 2 tasks

**Objective:** Verify that longer translations (especially German and French) do not break component layouts.

**Known Areas of Concern:**
- Toolbar buttons in MarkdownEditor (may need flexible width)
- Aspect ratio buttons in ImageCropper
- Duration display in VideoTrimmer
- Keyboard shortcuts help in ImageRotator

**Test Checklist:**
- [ ] German translations do not cause toolbar overflow
- [ ] French translations fit within button containers
- [ ] No text truncation without ellipsis
- [ ] Mobile layouts handle longer text gracefully
- [ ] Buttons remain clickable with minimum touch targets

**Acceptance Criteria:**
- [ ] No layout breaks in any language
- [ ] All text is readable (no truncation without ellipsis)
- [ ] Touch targets remain accessible on mobile

---

## Implementation Order

**Recommended execution order for maximum efficiency:**

1. **Phase 1 (Parallel):** Tasks 1.1, 1.2, 1.3, 1.4 can all run in parallel
2. **Phase 1 (Sequential):** Task 1.5 depends on 1.1-1.4
3. **Phase 2 (Parallel):** Tasks 2.1, 2.2, 2.3, 2.4 can run in parallel after Phase 1
4. **Phase 2 (Sequential):** Task 2.5 depends on 2.4
5. **Phase 3 (Sequential):** Tasks 3.1, 3.2, 3.3 run after Phase 2

**Critical Path:** 1.1 → 1.5 → 2.1 → 3.1

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Sub-components need `t` prop | Pass `t` as prop or use `useTranslations` in each sub-component |
| Dynamic `TOOLBAR_BUTTONS` array | Convert to function that accepts `t` parameter |
| ICU interpolation syntax errors | Test with various number values (0, 1, large numbers) |
| Long German text breaks layout | Use flexible layouts, test with longest expected strings |
| rotationUtils.ts used without context | Keep error keys as constants, translate in component |

---

## Files Modified Summary

| File | Type of Change |
|------|----------------|
| `/messages/en.json` | Add `articles` namespace (~60 keys) |
| `/messages/fr.json` | Add `articles` namespace (French translations) |
| `/messages/es.json` | Add `articles` namespace (Spanish translations) |
| `/messages/de.json` | Add `articles` namespace (German translations) |
| `/messages/nl.json` | Add `articles` namespace (Dutch translations) |
| `/messages/it.json` | Add `articles` namespace (Italian translations) |
| `/src/components/ItemCapture/editors/MarkdownEditor.tsx` | Add `useTranslations`, replace ~15 strings |
| `/src/components/ItemCapture/editors/ImageCropper.tsx` | Add `useTranslations`, replace ~12 strings |
| `/src/components/ItemCapture/editors/VideoTrimmer.tsx` | Add `useTranslations`, replace ~18 strings |
| `/src/components/ItemCapture/editors/ImageRotator.tsx` | Add `useTranslations`, replace ~15 strings |
| `/src/components/ItemCapture/editors/rotationUtils.ts` | Convert error messages to keys (optional) |

---

## Acceptance Criteria Summary

From REQ-393:

- [ ] MarkdownEditor component uses translation keys for all formatting toolbar button labels
- [ ] MarkdownEditor placeholder text is retrieved from translation keys
- [ ] MarkdownEditor tooltips for formatting actions appear in the user's selected language
- [ ] ImageCropper component displays translated labels for crop mode and aspect ratio options
- [ ] ImageCropper action buttons including apply, reset, and cancel use translation keys
- [ ] VideoTrimmer component shows translated labels for time controls and duration display
- [ ] VideoTrimmer action buttons use translation keys for apply and cancel operations
- [ ] ImageRotator component displays translated labels for rotation controls
- [ ] All editor components maintain existing functionality after internationalization
- [ ] Translation keys follow the `articles.editor`, `articles.crop`, `articles.video`, and `articles.rotate` namespace conventions
- [ ] Editor components render correctly in all supported languages without layout issues
- [ ] Long translated text in toolbar buttons does not break component layouts
- [ ] All editor components properly handle dynamic content including duration formatting and file size displays

---

## References

- [REQ-393 Overview Document](./REQ-393-update-editor-components-overview.md)
- [L10N Epic 2 Implementation Plan](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
