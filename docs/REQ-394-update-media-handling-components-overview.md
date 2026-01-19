# REQ-394: Update Media Handling Components for Localization - Technical Overview

**Document Created:** 2026-01-19 22:30 UTC
**Last Modified:** 2026-01-19 22:30 UTC
**Request ID:** REQ-394
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2E - Article & Content Management
**Task ID:** 2E.3
**Size:** M (Medium)
**Priority:** Eighth (per Epic 2 recommended order)
**Depends On:** Epic 1 Foundation (next-intl setup complete)

---

## 1. Executive Summary

This task updates media handling components to retrieve all user-facing strings from translation files using the `useTranslations` hook from next-intl. Media handling spans file upload interfaces, gallery views, media management controls, editing tools, and associated dialog components across multiple areas of the application.

The affected components include:
- **Editor components:** ImageCropper, ImageRotator, VideoTrimmer
- **Gallery components:** MediaGallery, MediaThumbnail
- **Management components:** MediaManagementSection, MediaLinkList, MediaLinkItem, AddMediaLinkForm, DeleteMediaConfirmDialog

All strings will be placed in the `articles.media` namespace (for general media operations) and `articles.crop`/`articles.video`/`articles.editor` namespaces for specific editing tools, following the Epic 2 implementation plan conventions.

---

## 2. Current State Analysis

### 2.1 Hardcoded Strings Inventory

#### ImageCropper (`/src/components/ItemCapture/editors/ImageCropper.tsx`)
| String | Context | Line |
|--------|---------|------|
| "Large image detected. Output may be scaled down for compatibility." | Warning message | ~368 |
| "Free", "1:1", "4:3", "16:9" | Aspect ratio labels | ~80-85 |
| "Loading image..." | Loading state | ~401 |
| "Applying crop..." | Processing state | ~410 |
| "Preview:" | Section label | ~442 |
| "Generating...", "Select area to preview" | Preview placeholder | ~451-452 |
| "Failed to load image. Please try again." | Error message | ~165 |
| "Crop operation failed" | Error message | ~300 |
| "Applying...", "Apply Crop" | Button text | ~486 |
| "Cancel" | Button text | ~499 |
| "Crop preview", "Crop preview thumbnail" | Alt text | ~431, 447 |
| "Dismiss error" | Aria label | ~467 |

#### ImageRotator (`/src/components/ItemCapture/editors/ImageRotator.tsx`)
| String | Context | Line |
|--------|---------|------|
| "Loading image..." | Loading state | ~372 |
| "Applying rotation..." | Processing state | ~381 |
| "Preview" | Image alt text | ~400 |
| "Current rotation: {degrees}°" | Info text | ~462 |
| "(modified)" | Modified indicator | ~464 |
| "Keyboard: ← / → to rotate, Esc to cancel, ⌘+Enter to apply" | Help text | ~470-478 |
| "Applying...", "Apply Rotation" | Button text | ~496 |
| "Cancel" | Button text | ~510 |
| "Image rotation editor" | Aria label | ~340 |
| "Rotate image left 90 degrees", "Rotate image right 90 degrees" | Aria labels | ~432, 451 |
| "Processing rotation...", "Image rotated to {degrees} degrees" | Announcements | ~355-356 |
| "Try Again" | Error retry button | ~419 |

#### VideoTrimmer (`/src/components/ItemCapture/editors/VideoTrimmer.tsx`)
| String | Context | Line |
|--------|---------|------|
| "Unable to determine video duration" | Error message | ~152 |
| "Failed to load video. Please check the file and try again." | Error message | ~196 |
| "Unable to play video. Please try again." | Error message | ~229 |
| "Invalid trim selection" | Error message | ~445 |
| "Error" | Error title | ~506 |
| "Try again" | Error retry link | ~518 |
| "Loading video..." | Loading state | ~543 |
| "Selection:", "Duration:" | Timeline labels | ~664-669 |
| "Current:" | Current time label | ~676 |
| "Trimming {time} ({percent}% reduction)" | Trim savings | ~682-683 |
| "Start trim point", "End trim point" | Aria labels | ~601, 628 |
| "Skip to start marker", "Skip to end marker" | Aria labels | ~700, ~727 |
| "Pause", "Play trimmed region" | Aria labels | ~714-715 |
| "Cancel" | Button text | ~750 |
| "Apply Trim" | Button text | ~766 |
| "S", "E" | Start/End markers | ~611, 638 |

#### MediaGallery (`/src/components/ItemManager/components/ItemPreview/MediaGallery.tsx`)
| String | Context | Line |
|--------|---------|------|
| "Video", "Photo", "PDF" | Media type labels | ~81-95 |
| "No media to display" | Empty state | ~752 |
| "View {type} {filename}" | Aria label | ~181 |
| "Media gallery, {count} items" | Aria label | ~881 |
| "Previous media", "Next media" | Navigation labels | ~812-813, 827-828, 939, 958 |
| "Enter full screen", "Exit full screen" | Button labels | ~784, 909 |
| "{count} page(s)" | PDF page count | ~682-683, ~719-720 |
| "Media thumbnails" | Aria label | ~843-844, ~987 |

#### MediaThumbnail (`/src/components/ItemCapture/components/shared/MediaThumbnail.tsx`)
| String | Context | Line |
|--------|---------|------|
| "Media thumbnail" | Alt text | ~106 |
| "{count} page(s)" | PDF page count | ~141 |
| "Delete media" | Aria label | ~174 |

#### MediaManagementSection (`/src/components/MediaManagement/MediaManagementSection.tsx`)
| String | Context | Line |
|--------|---------|------|
| "Media & Links" | Section header | ~135 |
| "Add Link" | Button text | ~139 |
| "No media links yet" | Empty state | ~151 |
| "Add your first link" | Empty state action | ~156 |

#### MediaLinkItem (`/src/components/MediaManagement/MediaLinkItem.tsx`)
| String | Context | Line |
|--------|---------|------|
| "Drag to reorder" | Aria label | ~164 |
| "Edit link", "Delete link" | Aria labels | ~185, 193 |
| "Title", "URL", "Type" | Form labels | ~208, 220, 232 |
| "Enter title" | Placeholder | ~214 |
| "https://..." | URL placeholder | ~226 |
| "Cancel", "Save" | Button text | ~251, 260 |

#### AddMediaLinkForm (`/src/components/MediaManagement/AddMediaLinkForm.tsx`)
| String | Context | Line |
|--------|---------|------|
| "Title", "URL", "Type", "Thumbnail URL (optional)" | Form labels | ~130, 146, 168, 191 |
| "e.g., Product Manual" | Title placeholder | ~139 |
| "https://..." | URL placeholder | ~158, 199 |
| "Please enter a valid URL" | Error message | ~76, 105 |
| "Type is auto-detected from URL but can be changed" | Help text | ~184 |
| "+ Add custom thumbnail" | Button text | ~209 |
| "Cancel", "Add Link" | Button text | ~222, 230 |

#### DeleteMediaConfirmDialog (`/src/components/MediaManagement/DeleteMediaConfirmDialog.tsx`)
| String | Context | Line |
|--------|---------|------|
| "YouTube Video", "PDF Document", "Image", "Web Link" | Type labels | ~46-55 |
| "Delete {type}?" | Dialog title | ~104 |
| "This action cannot be undone." | Warning message | ~122 |
| "Cancel", "Delete" | Button text | ~136, 152-154 |

### 2.2 Estimated String Count
- **Total unique strings:** ~95-110
- **Components affected:** 10 files

---

## 3. Implementation Strategy

### 3.1 Translation Namespace Structure

Following the Epic 2 implementation plan, strings will be organized under the `articles` namespace:

```json
{
  "articles": {
    "media": {
      "title": "Media & Links",
      "addLink": "Add Link",
      "emptyState": {
        "title": "No media links yet",
        "description": "Add your first link"
      },
      "types": {
        "video": "Video",
        "photo": "Photo",
        "pdf": "PDF Document",
        "youtube": "YouTube Video",
        "image": "Image",
        "webLink": "Web Link"
      },
      "gallery": {
        "empty": "No media to display",
        "ariaLabel": "Media gallery, {count} items",
        "counter": "{current} / {total}",
        "thumbnails": "Media thumbnails",
        "previousMedia": "Previous media",
        "nextMedia": "Next media",
        "enterFullScreen": "Enter full screen",
        "exitFullScreen": "Exit full screen"
      },
      "thumbnail": {
        "deleteMedia": "Delete media",
        "pageCount": "{count, plural, one {# page} other {# pages}}"
      },
      "upload": {
        "dragDrop": "Drag and drop files here",
        "or": "or",
        "browse": "Browse files",
        "supportedFormats": "Supported formats: {formats}",
        "maxSize": "Maximum file size: {size}MB"
      },
      "actions": {
        "dragToReorder": "Drag to reorder",
        "editLink": "Edit link",
        "deleteLink": "Delete link"
      },
      "form": {
        "title": "Title",
        "titlePlaceholder": "e.g., Product Manual",
        "url": "URL",
        "urlPlaceholder": "https://...",
        "type": "Type",
        "thumbnailUrl": "Thumbnail URL (optional)",
        "addCustomThumbnail": "+ Add custom thumbnail",
        "typeAutoDetected": "Type is auto-detected from URL but can be changed",
        "invalidUrl": "Please enter a valid URL"
      },
      "delete": {
        "title": "Delete {type}?",
        "warning": "This action cannot be undone."
      }
    },
    "crop": {
      "title": "Crop Image",
      "aspectRatio": "Aspect Ratio",
      "freeform": "Free",
      "square": "1:1",
      "standard": "4:3",
      "widescreen": "16:9",
      "largeImageWarning": "Large image detected. Output may be scaled down for compatibility.",
      "loading": "Loading image...",
      "processing": "Applying crop...",
      "preview": "Preview:",
      "previewGenerating": "Generating...",
      "previewSelect": "Select area to preview",
      "apply": "Apply Crop",
      "applying": "Applying...",
      "error": {
        "loadFailed": "Failed to load image. Please try again.",
        "cropFailed": "Crop operation failed"
      },
      "aria": {
        "dismissError": "Dismiss error",
        "cropPreview": "Crop preview",
        "previewThumbnail": "Crop preview thumbnail"
      }
    },
    "rotate": {
      "title": "Rotate Image",
      "editor": "Image rotation editor",
      "loading": "Loading image...",
      "processing": "Applying rotation...",
      "preview": "Preview",
      "currentRotation": "Current rotation: {degrees}°",
      "modified": "(modified)",
      "apply": "Apply Rotation",
      "applying": "Applying...",
      "tryAgain": "Try Again",
      "keyboardHelp": "Keyboard: ← / → to rotate, Esc to cancel, ⌘+Enter to apply",
      "aria": {
        "rotateLeft": "Rotate image left 90 degrees",
        "rotateRight": "Rotate image right 90 degrees"
      },
      "announcements": {
        "rotated": "Image rotated to {degrees} degrees",
        "processing": "Processing rotation..."
      }
    },
    "video": {
      "title": "Trim Video",
      "loading": "Loading video...",
      "error": {
        "title": "Error",
        "noDuration": "Unable to determine video duration",
        "loadFailed": "Failed to load video. Please check the file and try again.",
        "playFailed": "Unable to play video. Please try again.",
        "invalidTrim": "Invalid trim selection"
      },
      "tryAgain": "Try again",
      "timeline": {
        "selection": "Selection:",
        "duration": "Duration:",
        "current": "Current:",
        "trimSavings": "Trimming {time} ({percent}% reduction)"
      },
      "markers": {
        "start": "S",
        "end": "E",
        "startLabel": "Start trim point",
        "endLabel": "End trim point"
      },
      "controls": {
        "skipToStart": "Skip to start marker",
        "skipToEnd": "Skip to end marker",
        "play": "Play trimmed region",
        "pause": "Pause"
      },
      "apply": "Apply Trim"
    }
  }
}
```

### 3.2 Component Update Pattern

All media components are client components, so they will use the `useTranslations` hook:

```typescript
// Before
export function MediaManagementSection() {
  return (
    <h3>Media & Links</h3>
    <button>Add Link</button>
    <p>No media links yet</p>
  );
}

// After
import { useTranslations } from 'next-intl';

export function MediaManagementSection() {
  const t = useTranslations('articles.media');
  return (
    <h3>{t('title')}</h3>
    <button>{t('addLink')}</button>
    <p>{t('emptyState.title')}</p>
  );
}
```

### 3.3 Dynamic Content Handling

For strings with variables (counts, percentages, names):

```typescript
// Pluralization for page count
t('thumbnail.pageCount', { count: pageCount })

// Gallery counter
t('gallery.counter', { current: activeIndex + 1, total: mediaItems.length })

// Trim savings
t('video.timeline.trimSavings', {
  time: formatTime(savedDuration),
  percent: Math.round(percentSaved)
})
```

---

## 4. Authorized Files and Functions for Modification

### 4.1 Editor Components

| File Path | Functions/Elements to Modify |
|-----------|------------------------------|
| `/src/components/ItemCapture/editors/ImageCropper.tsx` | Default export component JSX, `ASPECT_RATIO_OPTIONS` array labels |
| `/src/components/ItemCapture/editors/ImageRotator.tsx` | Default export component JSX, `getRotationAnnouncement()` function |
| `/src/components/ItemCapture/editors/VideoTrimmer.tsx` | Default export component JSX |

### 4.2 Gallery Components

| File Path | Functions/Elements to Modify |
|-----------|------------------------------|
| `/src/components/ItemManager/components/ItemPreview/MediaGallery.tsx` | `MEDIA_TYPE_CONFIG` labels, `MediaTypeBadge`, `GalleryThumbnail`, `MediaGallery` JSX |
| `/src/components/ItemCapture/components/shared/MediaThumbnail.tsx` | `MediaThumbnail` component JSX |

### 4.3 Management Components

| File Path | Functions/Elements to Modify |
|-----------|------------------------------|
| `/src/components/MediaManagement/MediaManagementSection.tsx` | Component JSX |
| `/src/components/MediaManagement/MediaLinkList.tsx` | Component JSX (if applicable) |
| `/src/components/MediaManagement/MediaLinkItem.tsx` | `getTypeLabel()` function (if moved to translations), form labels, button text |
| `/src/components/MediaManagement/AddMediaLinkForm.tsx` | Form labels, placeholders, error messages, button text |
| `/src/components/MediaManagement/DeleteMediaConfirmDialog.tsx` | `getTypeLabel()` function, dialog text, button labels |

### 4.4 Translation Files

| File Path | Sections to Add/Modify |
|-----------|------------------------|
| `/messages/en.json` | Add `articles.media`, `articles.crop`, `articles.rotate`, `articles.video` namespaces |
| `/messages/fr.json` | Same structure with French translations |
| `/messages/es.json` | Same structure with Spanish translations |
| `/messages/de.json` | Same structure with German translations |
| `/messages/nl.json` | Same structure with Dutch translations |
| `/messages/it.json` | Same structure with Italian translations |

---

## 5. Implementation Tasks

### Task 2E.3.1: Extend Translation Files with Media Namespaces
- Add `articles.media`, `articles.crop`, `articles.rotate`, `articles.video` sections to `en.json`
- Include all ~100 identified strings with appropriate nesting
- Use ICU message format for pluralization and interpolation

### Task 2E.3.2: Update ImageCropper Component
- Import `useTranslations` hook
- Replace all hardcoded strings with translation calls
- Update `ASPECT_RATIO_OPTIONS` labels to use translations
- Verify aria-labels and alt text are translated

### Task 2E.3.3: Update ImageRotator Component
- Import `useTranslations` hook
- Replace all hardcoded strings with translation calls
- Update `getRotationAnnouncement()` to use translations with interpolation
- Ensure keyboard help text displays correctly in all languages

### Task 2E.3.4: Update VideoTrimmer Component
- Import `useTranslations` hook
- Replace all hardcoded strings with translation calls
- Handle dynamic duration/percentage displays with interpolation
- Update all aria-labels for timeline controls

### Task 2E.3.5: Update MediaGallery Component
- Import `useTranslations` hook
- Replace `MEDIA_TYPE_CONFIG` labels with translation calls
- Update `MediaTypeBadge` component
- Translate empty state, navigation labels, and aria-labels

### Task 2E.3.6: Update MediaThumbnail Component
- Import `useTranslations` hook
- Update page count display with pluralization
- Translate delete button aria-label

### Task 2E.3.7: Update MediaManagementSection Component
- Import `useTranslations` hook
- Replace section header, button text, and empty state messages

### Task 2E.3.8: Update MediaLinkItem Component
- Import `useTranslations` hook
- Replace form labels, placeholders, and button text
- Update inline type labels

### Task 2E.3.9: Update AddMediaLinkForm Component
- Import `useTranslations` hook
- Replace all form labels, placeholders, error messages
- Translate help text and button labels

### Task 2E.3.10: Update DeleteMediaConfirmDialog Component
- Import `useTranslations` hook
- Replace `getTypeLabel()` logic with translation lookup
- Translate dialog title, warning message, and buttons

### Task 2E.3.11: Generate Translations for Non-English Languages
- Generate French translations for all media strings
- Generate Spanish translations for all media strings
- Generate German translations for all media strings
- Generate Dutch translations for all media strings
- Generate Italian translations for all media strings

### Task 2E.3.12: Verify Layout and Functionality
- Test ImageCropper in all 6 languages
- Test VideoTrimmer in all 6 languages
- Test MediaGallery navigation in all languages
- Test MediaManagement forms in all languages
- Verify no layout breaks due to longer translated text

---

## 6. Acceptance Criteria

Based on REQ-394 requirements:

- [ ] File upload components display translated instructions for drag-and-drop zones
- [ ] File type and size restriction messages appear in the user's selected language
- [ ] Gallery view components show translated labels for view mode options and selection controls
- [ ] Media count displays use proper pluralization for each supported language
- [ ] Media action buttons including replace, remove, reorder, and set primary use translation keys
- [ ] Upload progress indicators display status messages from translation files
- [ ] Error messages for file validation failures retrieve text from translation keys
- [ ] Success messages for completed uploads appear in the user's language
- [ ] Confirmation dialogs for destructive actions like remove use translated text
- [ ] All media components maintain existing functionality after internationalization
- [ ] Translation keys follow the `articles.media` namespace convention
- [ ] Long translated text in upload zones and error messages does not break layouts
- [ ] File size and dimension displays format numbers according to locale conventions
- [ ] Media components render correctly in all supported languages without UI issues

---

## 7. Testing Considerations

### 7.1 Unit Tests
- Verify translation hook is called with correct namespace
- Test pluralization logic for page counts
- Test interpolation for dynamic values (percentages, counts)

### 7.2 Integration Tests
- Test ImageCropper crop flow with translations
- Test VideoTrimmer full workflow
- Test MediaGallery navigation and full-screen mode
- Test MediaManagement CRUD operations

### 7.3 Visual Regression
- Screenshot comparison for all media components in all 6 languages
- Verify button text does not overflow
- Verify dialogs display correctly with longer text

### 7.4 Accessibility Testing
- Verify all aria-labels are translated
- Test screen reader announcements in multiple languages
- Verify keyboard navigation remains functional

---

## 8. Dependencies

### 8.1 Epic 1 Requirements (Must be complete)
- next-intl package installed
- `useTranslations` hook available
- IntlProvider configured in layout
- Base `/messages/*.json` files exist

### 8.2 Sub-Epic Dependencies
- `common` namespace should include shared button labels (Save, Cancel, Delete)
- Reuse `common.actions` where applicable instead of duplicating

---

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Longer translated text breaks layouts | Medium | Low | Test all languages, design with 40% expansion buffer |
| Missing translations in production | Low | High | Add fallback to English, build-time validation |
| Dynamic string interpolation errors | Low | Medium | Unit test all interpolation patterns |
| Performance impact from translation lookups | Low | Low | next-intl is optimized; no action needed |
| Aspect ratio labels need special handling | Medium | Low | Use translation-friendly labels, consider numeric display |

---

## 10. References

- **Request Document:** `/docs/gen_requests_epic2.md` (REQ-394)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **Epic 1 Foundation:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- **next-intl Documentation:** https://next-intl-docs.vercel.app/
- **ICU Message Format:** https://unicode-org.github.io/icu/userguide/format_parse/messages/

---

*Document generated for FAQBNB L10N Epic 2 - Sub-Epic 2E.3*
