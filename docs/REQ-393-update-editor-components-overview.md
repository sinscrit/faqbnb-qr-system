# REQ-393: Update Editor Components for Localization - Implementation Overview

**Last Modified:** 2026-01-19 20:45 UTC
**Request ID:** REQ-393
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2E - Article & Content Management
**Task ID:** 2E.2
**Type:** ENHANCEMENT
**Size:** M (Medium)

---

## Summary

Update the editor components (MarkdownEditor, ImageCropper, VideoTrimmer, and ImageRotator) to support localization by replacing all hardcoded English strings with translation keys from the `articles` namespace using next-intl's `useTranslations` hook.

---

## Background

### Current State

The editor components in `/src/components/ItemCapture/editors/` currently contain hardcoded English strings for:

1. **MarkdownEditor.tsx** (~15 strings)
   - Tab labels: "Editor", "Preview"
   - Toolbar ARIA labels: "Bold (Ctrl+B)", "Italic (Ctrl+I)", "Heading 1", etc.
   - Placeholder: "Write your content here using markdown formatting..."
   - Character counter: "X / Y characters"
   - Error message: "Content exceeds the maximum character limit. Please shorten your text."
   - Preview placeholder: "Start typing to see a preview of your formatted content..."

2. **ImageCropper.tsx** (~12 strings)
   - Aspect ratio labels: "Free", "1:1", "4:3", "16:9"
   - Loading state: "Loading image..."
   - Processing state: "Applying crop..."
   - Preview label: "Preview:"
   - Preview placeholder: "Generating...", "Select area to preview"
   - Action buttons: "Apply Crop", "Applying...", "Cancel"
   - Warning: "Large image detected. Output may be scaled down for compatibility."
   - Error: "Failed to load image. Please try again."

3. **VideoTrimmer.tsx** (~18 strings)
   - Loading state: "Loading video..."
   - Error messages: "Unable to determine video duration", "Unable to play video. Please try again."
   - Labels: "Selection:", "Duration:", "Current:"
   - Trim indicator: "Trimming X (Y% reduction)"
   - ARIA labels: "Start trim point", "End trim point", "Skip to start marker", "Skip to end marker", "Play trimmed region", "Pause"
   - Action buttons: "Apply Trim", "Cancel"
   - Error title: "Error", "Try again"

4. **ImageRotator.tsx** (~15 strings)
   - Loading state: "Loading image..."
   - Processing state: "Applying rotation...", "Processing rotation..."
   - ARIA labels: "Image rotation editor", "Rotate image left 90 degrees", "Rotate image right 90 degrees"
   - Screen reader announcement: "Image rotated to X degrees"
   - Rotation info: "Current rotation: X°", "(modified)"
   - Keyboard shortcuts help: "Keyboard:", "to rotate", "to cancel", "to apply"
   - Action buttons: "Apply Rotation", "Applying...", "Cancel"
   - Error: "Try Again"

### Target State

All user-visible strings will be loaded from translation files using the `useTranslations` hook from next-intl, following the `articles.editor`, `articles.crop`, `articles.video`, and `articles.rotate` namespace conventions established in the implementation plan.

---

## Technical Approach

### 1. Translation Namespace Structure

Add the following keys to `/messages/{locale}.json` under the `articles` namespace:

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
    },
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
      "cropPreviewThumbnailAlt": "Crop preview thumbnail"
    },
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
    },
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
      "previewAlt": "Preview"
    }
  }
}
```

### 2. Component Update Pattern

Each component will follow this pattern:

```tsx
'use client';

import { useTranslations } from 'next-intl';

function EditorComponent() {
  const t = useTranslations('articles.editor');

  return (
    <button aria-label={t('toolbar.bold')}>
      {/* ... */}
    </button>
  );
}
```

### 3. ICU Message Format for Dynamic Content

Use ICU format for pluralization and interpolation:

```json
{
  "characterCount": "{current, number} / {max, number} characters",
  "trimSavings": "Trimming {time} ({percent}% reduction)"
}
```

```tsx
t('characterCount', { current: 1234, max: 5000 })
// Output: "1,234 / 5,000 characters"
```

---

## Implementation Tasks

### Task 1: Update Translation Files (All 6 Languages)

Add the `articles.editor`, `articles.crop`, `articles.video`, and `articles.rotate` namespace keys to:
- `/messages/en.json`
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

### Task 2: Update MarkdownEditor Component

1. Import `useTranslations` from `next-intl`
2. Initialize translation hook: `const t = useTranslations('articles.editor')`
3. Replace all hardcoded strings:
   - `TOOLBAR_BUTTONS` array - update `ariaLabel` values
   - Tab labels in `MobileTabSwitcher`
   - Default `placeholder` prop value
   - `CharacterCounter` text format
   - Character limit error message
   - Preview placeholder text
   - Preview header label
   - ARIA labels for tabs and toolbar

### Task 3: Update ImageCropper Component

1. Import `useTranslations` from `next-intl`
2. Initialize translation hook: `const t = useTranslations('articles.crop')`
3. Replace all hardcoded strings:
   - `ASPECT_RATIO_OPTIONS` labels
   - Loading state text
   - Processing overlay text
   - Preview section label and placeholders
   - Large image warning
   - Error messages (including from error state)
   - Action button labels
   - Image alt attributes

### Task 4: Update VideoTrimmer Component

1. Import `useTranslations` from `next-intl`
2. Initialize translation hook: `const t = useTranslations('articles.video')`
3. Replace all hardcoded strings:
   - Error display title and messages
   - Loading state text
   - Timeline marker ARIA labels
   - Playback control ARIA labels
   - Duration/selection display labels
   - Trim savings indicator (with ICU format)
   - Action button labels

### Task 5: Update ImageRotator Component

1. Import `useTranslations` from `next-intl`
2. Initialize translation hook: `const t = useTranslations('articles.rotate')`
3. Replace all hardcoded strings:
   - Region ARIA label
   - Loading state text
   - Processing overlay text
   - Screen reader announcements (with ICU format)
   - Rotation control ARIA labels
   - Rotation info display (with ICU format)
   - Keyboard shortcuts help text
   - Action button labels
   - Error retry button
   - Image alt attribute

### Task 6: Update Constants/Types If Needed

1. Review if any hardcoded strings exist in:
   - `/src/components/ItemCapture/editors/cropUtils.ts`
   - `/src/components/ItemCapture/editors/trimUtils.ts`
   - `/src/components/ItemCapture/editors/rotationUtils.ts`
2. Move any user-visible error messages to translation files

### Task 7: Testing and Verification

1. Visual verification in all 6 languages
2. Verify no layout breaks with longer translations (German, French)
3. Verify ARIA labels are properly translated
4. Verify screen reader announcements work in all languages
5. Test keyboard shortcuts help text displays correctly

---

## Authorized Files and Functions for Modification

### Primary Files to Modify

| File | Functions/Sections | Changes |
|------|-------------------|---------|
| `/src/components/ItemCapture/editors/MarkdownEditor.tsx` | `MarkdownEditor`, `CharacterCounter`, `MobileTabSwitcher`, `MarkdownToolbar`, `TOOLBAR_BUTTONS` | Add `useTranslations` hook, replace all hardcoded strings |
| `/src/components/ItemCapture/editors/ImageCropper.tsx` | `ImageCropper`, `ASPECT_RATIO_OPTIONS` | Add `useTranslations` hook, replace all hardcoded strings |
| `/src/components/ItemCapture/editors/VideoTrimmer.tsx` | `VideoTrimmer` | Add `useTranslations` hook, replace all hardcoded strings |
| `/src/components/ItemCapture/editors/ImageRotator.tsx` | `ImageRotator`, `getRotationAnnouncement` | Add `useTranslations` hook, replace all hardcoded strings |

### Translation Files to Modify

| File | Namespace | Changes |
|------|-----------|---------|
| `/messages/en.json` | `articles.editor`, `articles.crop`, `articles.video`, `articles.rotate` | Add ~60 new translation keys |
| `/messages/fr.json` | `articles.editor`, `articles.crop`, `articles.video`, `articles.rotate` | Add French translations |
| `/messages/es.json` | `articles.editor`, `articles.crop`, `articles.video`, `articles.rotate` | Add Spanish translations |
| `/messages/de.json` | `articles.editor`, `articles.crop`, `articles.video`, `articles.rotate` | Add German translations |
| `/messages/nl.json` | `articles.editor`, `articles.crop`, `articles.video`, `articles.rotate` | Add Dutch translations |
| `/messages/it.json` | `articles.editor`, `articles.crop`, `articles.video`, `articles.rotate` | Add Italian translations |

### Utility Files (Read-Only for Audit)

| File | Purpose |
|------|---------|
| `/src/components/ItemCapture/editors/cropUtils.ts` | Audit for user-visible error messages |
| `/src/components/ItemCapture/editors/trimUtils.ts` | Audit for user-visible error messages |
| `/src/components/ItemCapture/editors/rotationUtils.ts` | Audit for `ROTATION_ERROR_MESSAGES` - may need modification |

---

## Dependencies

### Required (Epic 1 Foundation)

| Dependency | Status | Location |
|------------|--------|----------|
| next-intl package | ✅ Installed | `package.json` |
| i18n config | ✅ Complete | `/src/lib/i18n/config.ts` |
| `useTranslations` hook | ✅ Available | next-intl |
| Translation file structure | ✅ Established | `/messages/*.json` |

### Internal Dependencies

| Dependency | Requirement |
|------------|-------------|
| `articles` namespace | Must be created if not exists in translation files |
| Existing translation patterns | Follow conventions from `common`, `auth`, `dashboard` namespaces |

---

## Acceptance Criteria

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

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Layout breaks with longer German/French text | Medium | Low | Use flexible layouts, test with longest translations, consider abbreviations |
| Missing translations cause runtime errors | Low | Medium | next-intl falls back to key name; add build-time validation |
| ARIA labels not properly translated | Low | Medium | Thorough testing with screen readers in each language |
| Keyboard shortcut indicators vary by OS | Low | Low | Use platform-aware logic for Ctrl/Cmd display |

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Task 1: Translation files | 1-2 hours |
| Task 2: MarkdownEditor | 1 hour |
| Task 3: ImageCropper | 45 minutes |
| Task 4: VideoTrimmer | 1 hour |
| Task 5: ImageRotator | 45 minutes |
| Task 6: Utility audit | 30 minutes |
| Task 7: Testing | 1-2 hours |
| **Total** | **6-8 hours** |

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [PRD: L10N Epic 2 - Static UI Translation](/docs/prd/PRD_L10N_Epic2_Static_UI_Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
