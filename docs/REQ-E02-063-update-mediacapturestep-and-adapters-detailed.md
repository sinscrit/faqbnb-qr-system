# Detailed Task Breakdown: REQ-E02-063 - Update MediaCaptureStep and Adapters

**Document Version:** 1.0
**Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E02-063
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.8
**Estimated Size:** L (Large)
**Overview Document:** REQ-E02-063-update-mediacapturestep-and-adapters-overview.md

---

## Executive Summary

This document provides granular, implementation-ready task breakdown for updating the MediaCaptureStep router component, its adapter components, and all underlying ItemCapture step components to use the i18n translation system. This is a large task covering 12 files with approximately 210+ hardcoded strings.

**Total String Count Breakdown:**
- MediaCaptureStep.tsx (router): ~5 strings
- VideoCaptureStep.tsx: ~50 strings
- PhotoCaptureStep.tsx: ~50 strings
- FileUploadStep.tsx: ~30 strings
- TextEditorStep.tsx: ~20 strings
- UrlInputStep.tsx: ~40 strings
- CameraPermissionFallback.tsx: ~15 strings

---

## Prerequisites Checklist

Before starting implementation, verify:

- [ ] Epic 1 Foundation complete (next-intl installed, i18n config exists)
- [ ] REQ-E02-056 complete (workflow namespace structure created)
- [ ] `/messages/en.json` exists with `workflow` namespace
- [ ] `useTranslations` hook available from `next-intl`
- [ ] Build passes without errors

---

## Task Breakdown

### TASK 1: Add Translation Keys to `/messages/en.json`

**File:** `/messages/en.json`
**Priority:** Critical - Must be done first
**Story Points:** 1.0

**Description:** Add all translation keys for MediaCaptureStep, underlying step components, and shared components to the English translation file.

**Implementation Steps:**

1.1. Open `/messages/en.json`

1.2. Locate the `workflow.steps` section (create if not exists)

1.3. Add the `mediaCapture` namespace for the router component:
```json
"mediaCapture": {
  "errors": {
    "noContentType": {
      "title": "No Content Type Selected",
      "message": "Please go back and select a content type before proceeding."
    },
    "unsupportedType": {
      "title": "Unsupported Content Type",
      "message": "The content type \"{contentType}\" is not supported. Please go back and select a different option."
    }
  }
}
```

1.4. Add the `videoCapture` namespace:
```json
"videoCapture": {
  "title": {
    "preview": "Record Video",
    "recording": "Recording Video",
    "review": "Review Your Video"
  },
  "subtitle": {
    "preview": "Position your camera and tap record to start",
    "recording": "Recording in progress - tap stop when finished",
    "review": "Play to review, then accept or retake"
  },
  "buttons": {
    "startRecording": "Start recording",
    "stopRecording": "Stop recording",
    "switchCamera": "Switch camera",
    "retake": "Retake",
    "accept": "Accept",
    "tryAgain": "Try Again",
    "back": "Back"
  },
  "states": {
    "processing": "Processing...",
    "initializing": "Initializing camera...",
    "rec": "REC"
  },
  "timer": {
    "remaining": "{time} remaining"
  },
  "aria": {
    "discardAndRecord": "Discard and record again",
    "acceptVideo": "Accept video"
  },
  "errors": {
    "permissionDenied": {
      "message": "Camera access was denied",
      "guidance": "Please enable camera access in your browser settings to record video."
    },
    "browserNotSupported": {
      "message": "Your browser does not support video recording",
      "guidance": "Camera access requires HTTPS. Please go back and use \"Upload Video\" instead, or access via HTTPS."
    },
    "recordingFailed": {
      "message": "Video recording failed",
      "guidance": "Please check your camera and try again."
    },
    "startFailed": "Failed to start recording",
    "noData": "No video data captured",
    "thumbnailFailed": {
      "message": "Failed to process video",
      "guidance": "Video saved but thumbnail generation failed."
    },
    "loadFailed": "Failed to load video for playback",
    "unexpected": "An unexpected error occurred. Please try again."
  }
}
```

1.5. Add the `photoCapture` namespace:
```json
"photoCapture": {
  "title": {
    "preview": "Capture Photos",
    "review": "Review Your Photo"
  },
  "subtitle": {
    "preview": "Tap the capture button to take photos ({count} / {max})",
    "review": "Accept to add or retake for a new shot"
  },
  "buttons": {
    "capture": "Capture photo",
    "switchCamera": "Switch camera",
    "retake": "Retake",
    "accept": "Accept",
    "back": "Back",
    "continue": "Continue",
    "tryAgain": "Try Again"
  },
  "states": {
    "processing": "Processing...",
    "initializing": "Initializing camera..."
  },
  "gallery": {
    "title": "Photo gallery",
    "deletePhoto": "Delete photo",
    "closeGallery": "Close gallery",
    "counter": "{current} of {total}",
    "previousPhoto": "Previous photo",
    "nextPhoto": "Next photo"
  },
  "thumbnailStrip": {
    "title": "Captured photos",
    "photoAlt": "Photo {index}",
    "removePhoto": "Remove photo {index}",
    "add": "Add"
  },
  "flash": {
    "auto": "Auto"
  },
  "aria": {
    "discardAndCapture": "Discard and capture again",
    "acceptPhoto": "Accept photo",
    "capturedPhotoPreview": "Captured photo preview"
  },
  "announcements": {
    "photoCaptured": "Photo captured. Review or retake.",
    "retaking": "Retaking photo. Ready to capture.",
    "processing": "Processing photo...",
    "added": "Photo added to collection.",
    "removed": "Photo removed.",
    "switchedCamera": "Switched to {camera} camera",
    "retrying": "Retrying camera initialization"
  },
  "errors": {
    "permissionDenied": {
      "message": "Camera access was denied",
      "guidance": "Please enable camera access in your browser settings to capture photos."
    },
    "browserNotSupported": {
      "message": "Your browser does not support photo capture",
      "guidance": "Camera access requires HTTPS. Please go back and use \"Upload Photo\" instead, or access via HTTPS."
    },
    "captureFailed": {
      "message": "Photo capture failed",
      "guidance": "Please check your camera and try again."
    },
    "processFailed": "Failed to process photo",
    "maxPhotosReached": {
      "message": "Maximum of {max} photos reached",
      "guidance": "You have reached the maximum of {max} photos. Remove a photo to add more."
    },
    "storageFull": {
      "message": "Device storage is full",
      "guidance": "Please free up space and try again."
    },
    "unexpected": "An unexpected error occurred. Please try again."
  }
}
```

1.6. Add the `fileUpload` namespace:
```json
"fileUpload": {
  "title": "Upload Files",
  "subtitle": "Drag and drop files or click to select",
  "dropZone": {
    "default": "Drag files here or click to browse",
    "dropValid": "Drop files here",
    "dropInvalid": "Invalid file type",
    "hasFiles": "Add more files",
    "supportedFormats": "Supports images, videos, and PDF files",
    "limits": "Max {count} files, {size} each"
  },
  "progress": {
    "fileCount": "{count}/{max} files"
  },
  "errors": {
    "rejectionTitle": "{count, plural, one {# file} other {# files}} couldn't be added",
    "dismiss": "Dismiss"
  },
  "pdf": {
    "passwordProtected": "Password protected",
    "corrupted": "File may be damaged",
    "pageCount": "{count, plural, one {# page} other {# pages}}"
  },
  "buttons": {
    "back": "Back",
    "continue": "Continue"
  },
  "aria": {
    "removeFile": "Remove {filename}",
    "uploadProgress": "Upload size progress"
  },
  "announcements": {
    "filesUploaded": "{count} files uploaded"
  }
}
```

1.7. Add the `textEditor` namespace:
```json
"textEditor": {
  "title": "Write Guide",
  "subtitle": "Add text-based guide using markdown formatting",
  "toolbar": {
    "bold": "Bold (Ctrl+B)",
    "italic": "Italic (Ctrl+I)",
    "heading1": "Heading 1",
    "heading2": "Heading 2",
    "heading3": "Heading 3",
    "bulletList": "Bullet List",
    "numberedList": "Numbered List",
    "link": "Insert Link (Ctrl+K)",
    "ariaLabel": "Text formatting"
  },
  "tabs": {
    "editor": "Editor",
    "preview": "Preview"
  },
  "placeholder": "Write your item guide here using markdown formatting...",
  "preview": {
    "label": "Preview",
    "empty": "Start typing to see a preview of your formatted content..."
  },
  "characterCounter": "{current} / {max} characters",
  "errors": {
    "exceedsLimit": "Content exceeds the maximum character limit. Please shorten your text."
  },
  "states": {
    "saving": "Saving..."
  },
  "buttons": {
    "back": "Back",
    "continue": "Continue"
  },
  "aria": {
    "contentEditor": "Markdown content editor",
    "characterCount": "Character count"
  }
}
```

1.8. Add the `urlInput` namespace:
```json
"urlInput": {
  "title": "Add Link",
  "subtitle": "Add a URL to your item. We'll fetch the title and preview automatically.",
  "label": "URL",
  "placeholder": "https://www.youtube.com/watch?v=...",
  "buttons": {
    "paste": "Paste",
    "fetchPreview": "Fetch Preview",
    "addLink": "Add Link",
    "addLinkAnyway": "Add Link Anyway",
    "tryAnother": "Try Another",
    "cancel": "Cancel",
    "back": "Back",
    "tryAgain": "Try Again",
    "proceedWithoutPreview": "Proceed Without Preview"
  },
  "states": {
    "fetching": "Fetching preview...",
    "retrying": "Retrying...",
    "previewLoaded": "Preview loaded",
    "proceedingWithoutPreview": "Proceeding without preview"
  },
  "networkError": {
    "title": "Preview unavailable",
    "message": "Unable to load preview due to network connectivity issues."
  },
  "noPreview": {
    "message": "The link will be added without a preview. You can edit the title later."
  },
  "errors": {
    "invalidUrl": "Invalid URL",
    "fetchFailed": "Failed to fetch URL metadata",
    "clipboardFailed": "Unable to read clipboard. Please paste manually."
  },
  "aria": {
    "clearUrl": "Clear URL"
  }
}
```

1.9. Add the `shared.cameraPermission` namespace under `workflow.shared`:
```json
"shared": {
  "cameraPermission": {
    "title": "Camera access denied",
    "explanation": "To capture a {contentType}, please allow camera access in your browser settings, or upload an existing {contentType} from your device.",
    "uploadVideo": "Upload Video Instead",
    "uploadPhoto": "Upload Photo Instead",
    "tryAgain": "Try Camera Again",
    "helpLink": "How to enable camera access"
  }
}
```

**Verification:**
- [ ] JSON file validates without syntax errors
- [ ] All keys follow naming convention `workflow.steps.{component}.{category}.{key}`
- [ ] ICU format used for pluralization (`{count, plural, ...}`)
- [ ] Variable interpolation uses `{variableName}` syntax
- [ ] Build completes without missing translation warnings

---

### TASK 2: Update MediaCaptureStep Router Component

**File:** `/src/components/ItemCreationWorkflow/components/steps/MediaCaptureStep.tsx`
**Priority:** Critical
**Story Points:** 0.5
**Lines to Modify:** 75-79, 83-85, 133-137, 139-144

**Description:** Add i18n support to the MediaCaptureStep router component for error state messages.

**Implementation Steps:**

2.1. Add useTranslations import at the top of the file (after React import, line ~23):
```typescript
import { useTranslations } from 'next-intl';
```

2.2. Add hook initialization inside the component function (after line 68, before the if statement):
```typescript
const t = useTranslations('workflow.steps.mediaCapture');
const tCommon = useTranslations('common.actions');
```

2.3. Replace "No Content Type Selected" error (lines 75-86):

**Before:**
```tsx
<h2 className="text-xl font-semibold text-gray-900 mb-2">
  No Content Type Selected
</h2>
<p className="text-gray-600 text-center max-w-md mb-6">
  Please go back and select a content type before proceeding.
</p>
<button
  onClick={onBack}
  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
>
  Go Back
</button>
```

**After:**
```tsx
<h2 className="text-xl font-semibold text-gray-900 mb-2">
  {t('errors.noContentType.title')}
</h2>
<p className="text-gray-600 text-center max-w-md mb-6">
  {t('errors.noContentType.message')}
</p>
<button
  onClick={onBack}
  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
>
  {tCommon('goBack')}
</button>
```

2.4. Replace "Unsupported Content Type" error (lines 133-144):

**Before:**
```tsx
<h2 className="text-xl font-semibold text-gray-900 mb-2">
  Unsupported Content Type
</h2>
<p className="text-gray-600 text-center max-w-md mb-6">
  The content type "{contentType}" is not supported. Please go back and select a different option.
</p>
<button
  onClick={onBack}
  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
>
  Go Back
</button>
```

**After:**
```tsx
<h2 className="text-xl font-semibold text-gray-900 mb-2">
  {t('errors.unsupportedType.title')}
</h2>
<p className="text-gray-600 text-center max-w-md mb-6">
  {t('errors.unsupportedType.message', { contentType })}
</p>
<button
  onClick={onBack}
  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
>
  {tCommon('goBack')}
</button>
```

**Verification:**
- [ ] useTranslations hook imported and initialized
- [ ] Both error states display translated text
- [ ] Variable interpolation works for contentType
- [ ] Build completes without errors

---

### TASK 3: Update VideoCaptureStep Component

**File:** `/src/components/ItemCapture/components/steps/VideoCaptureStep.tsx`
**Priority:** Critical
**Story Points:** 1.5
**Lines to Modify:** Multiple sections throughout file

**Description:** Add i18n support to VideoCaptureStep for all UI strings including titles, buttons, status indicators, error messages, and aria-labels.

**Implementation Steps:**

3.1. Add useTranslations import (after React imports, ~line 24):
```typescript
import { useTranslations } from 'next-intl';
```

3.2. Add hook initialization inside the component (after the useMediaCapture hook, ~line 270):
```typescript
const t = useTranslations('workflow.steps.videoCapture');
```

3.3. Update `mapHookErrorToComponentError` function (lines 164-190):
   - Pass `t` as a parameter to the function, or move the function inside the component
   - Replace hardcoded message strings with `t()` calls

**Updated function (move inside component):**
```typescript
const mapHookErrorToComponentError = (
  error: MediaCaptureError | null
): VideoCaptureError | null => {
  if (!error) return null;

  switch (error.code) {
    case 'PERMISSION_DENIED':
      return {
        code: 'PERMISSION_DENIED',
        message: t('errors.permissionDenied.message'),
        recoverable: false,
      };
    case 'BROWSER_NOT_SUPPORTED':
      return {
        code: 'BROWSER_NOT_SUPPORTED',
        message: t('errors.browserNotSupported.message'),
        recoverable: false,
      };
    case 'RECORDING_ERROR':
    default:
      return {
        code: 'RECORDING_FAILED',
        message: error.message || t('errors.recordingFailed.message'),
        recoverable: true,
      };
  }
};
```

3.4. Update `getErrorGuidance` function (lines 195-208):

**Updated function (move inside component):**
```typescript
const getErrorGuidance = (code: string): string => {
  switch (code) {
    case 'PERMISSION_DENIED':
      return t('errors.permissionDenied.guidance');
    case 'BROWSER_NOT_SUPPORTED':
      return t('errors.browserNotSupported.guidance');
    case 'RECORDING_FAILED':
      return t('errors.recordingFailed.guidance');
    case 'THUMBNAIL_FAILED':
      return t('errors.thumbnailFailed.guidance');
    default:
      return t('errors.unexpected');
  }
};
```

3.5. Update error handling in handlers:
   - Line 407: `message: 'Failed to start recording'` → `message: t('errors.startFailed')`
   - Line 430-433: `message: 'No video data captured'` → `message: t('errors.noData')`
   - Line 497-499: `message: 'Failed to process video'` → `message: t('errors.thumbnailFailed.message')`

3.6. Update `announce()` calls throughout:
   - Line 403: `'Recording started'` → `t('announcements.recordingStarted')` (add key if needed)
   - Line 426: `'Recording stopped. Review your video.'` → appropriate translation
   - Line 452: `'Retaking video. Ready to record.'` → appropriate translation
   - Line 459: `'Processing video...'` → `t('states.processing')`
   - Line 512: Camera switch announcement
   - Line 523: Retry announcement

3.7. Update Review Mode render (lines 620-699):

**Lines 625-626:**
```tsx
<h2 className="text-xl font-semibold text-gray-900">{t('title.review')}</h2>
<p className="text-sm text-gray-600">{t('subtitle.review')}</p>
```

**Line 662-663 (Retake button):**
```tsx
aria-label={t('aria.discardAndRecord')}
```
```tsx
<RotateCcw className="h-5 w-5 mr-2" />
{t('buttons.retake')}
```

**Lines 680-691 (Accept button):**
```tsx
aria-label={t('aria.acceptVideo')}
```
```tsx
{isProcessing ? (
  <>
    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
    {t('states.processing')}
  </>
) : (
  <>
    <Check className="h-5 w-5 mr-2" />
    {t('buttons.accept')}
  </>
)}
```

3.8. Update Preview/Recording Mode render (lines 709-849):

**Lines 713-719 (Header):**
```tsx
<h2 className="text-xl font-semibold text-gray-900">
  {mode === 'recording' ? t('title.recording') : t('title.preview')}
</h2>
<p className="text-sm text-gray-600">
  {mode === 'recording'
    ? t('subtitle.recording')
    : t('subtitle.preview')}
</p>
```

**Line 744 (REC indicator):**
```tsx
<span className="text-white text-sm font-medium">{t('states.rec')}</span>
```

**Line 780 (Switch camera aria-label):**
```tsx
aria-label={t('buttons.switchCamera')}
```

**Line 798 (Start recording aria-label):**
```tsx
aria-label={t('buttons.startRecording')}
```

**Line 813 (Stop recording aria-label):**
```tsx
aria-label={t('buttons.stopRecording')}
```

**Line 832 (Back button):**
```tsx
{t('buttons.back')}
```

**Lines 841-843 (Timer announcement):**
```tsx
<span>{t('timer.remaining', { time: formatTime(remainingTime) })}</span>
```

3.9. Update Loading State render (lines 605-614):

**Line 609:**
```tsx
<p className="text-gray-600" role="status" aria-live="polite">
  {t('states.initializing')}
</p>
```

3.10. Update Error render with Try Again button (line 591):
```tsx
{t('buttons.tryAgain')}
```

**Verification:**
- [ ] All UI strings use translation keys
- [ ] Error messages and guidance properly localized
- [ ] All aria-labels localized
- [ ] Timer and status displays use translations
- [ ] Dynamic time values use ICU format
- [ ] Build completes without errors

---

### TASK 4: Update PhotoCaptureStep Component

**File:** `/src/components/ItemCapture/components/steps/PhotoCaptureStep.tsx`
**Priority:** Critical
**Story Points:** 1.5
**Lines to Modify:** Multiple sections throughout file

**Description:** Add i18n support to PhotoCaptureStep for all UI strings.

**Implementation Steps:**

4.1. Add useTranslations import (after React imports):
```typescript
import { useTranslations } from 'next-intl';
```

4.2. Add hook initialization inside the component (after useMediaCapture hook):
```typescript
const t = useTranslations('workflow.steps.photoCapture');
```

4.3. Move and update `mapHookErrorToComponentError` function inside component:
```typescript
const mapHookErrorToComponentError = (
  error: MediaCaptureError | null
): PhotoCaptureError | null => {
  if (!error) return null;

  switch (error.code) {
    case 'PERMISSION_DENIED':
      return {
        code: 'PERMISSION_DENIED',
        message: t('errors.permissionDenied.message'),
        recoverable: false,
      };
    case 'BROWSER_NOT_SUPPORTED':
      return {
        code: 'BROWSER_NOT_SUPPORTED',
        message: t('errors.browserNotSupported.message'),
        recoverable: false,
      };
    case 'CAPTURE_ERROR':
    default:
      return {
        code: 'CAPTURE_FAILED',
        message: error.message || t('errors.captureFailed.message'),
        recoverable: true,
      };
  }
};
```

4.4. Move and update `getErrorGuidance` function inside component:
```typescript
const getErrorGuidance = (code: string): string => {
  switch (code) {
    case 'PERMISSION_DENIED':
      return t('errors.permissionDenied.guidance');
    case 'BROWSER_NOT_SUPPORTED':
      return t('errors.browserNotSupported.guidance');
    case 'CAPTURE_FAILED':
      return t('errors.captureFailed.guidance');
    case 'MAX_PHOTOS_REACHED':
      return t('errors.maxPhotosReached.guidance', { max: maxPhotos });
    case 'STORAGE_FULL':
      return t('errors.storageFull.guidance');
    default:
      return t('errors.unexpected');
  }
};
```

4.5. Update error messages in handlers:
   - Line 372: `message: \`Maximum of ${maxPhotos} photos reached\`` → `message: t('errors.maxPhotosReached.message', { max: maxPhotos })`
   - Line 397-399: capture failed message
   - Line 473-475: process failed message

4.6. Update `announce()` calls:
   - Line 392: `'Photo captured. Review or retake.'` → `t('announcements.photoCaptured')`
   - Line 417: `'Retaking photo. Ready to capture.'` → `t('announcements.retaking')`
   - Line 424: `'Processing photo...'` → `t('announcements.processing')`
   - Line 464: `'Photo added to collection.'` → `t('announcements.added')`
   - Line 498: `'Photo removed.'` → `t('announcements.removed')`
   - Line 518: Photo removed in gallery
   - Line 561: Camera switch announcement → `t('announcements.switchedCamera', { camera: facingMode === 'user' ? 'back' : 'front' })`
   - Line 572: `'Retrying camera initialization'` → `t('announcements.retrying')`

4.7. Update Gallery Mode render (lines 674-739):
   - Line 680: `aria-label="Photo gallery"` → `aria-label={t('gallery.title')}`
   - Line 687: `aria-label="Delete photo"` → `aria-label={t('gallery.deletePhoto')}`
   - Line 691-692: Counter `{selectedPhotoIndex + 1} of {capturedPhotos.length}` → `{t('gallery.counter', { current: selectedPhotoIndex + 1, total: capturedPhotos.length })}`
   - Line 698: `aria-label="Close gallery"` → `aria-label={t('gallery.closeGallery')}`
   - Line 712: `aria-label="Previous photo"` → `aria-label={t('gallery.previousPhoto')}`
   - Line 721: `alt={`Photo ${selectedPhotoIndex + 1}`}` → `alt={t('thumbnailStrip.photoAlt', { index: selectedPhotoIndex + 1 })}`
   - Line 729: `aria-label="Next photo"` → `aria-label={t('gallery.nextPhoto')}`

4.8. Update Review Mode render (lines 746-815):
   - Line 751: `<h2>Review Your Photo</h2>` → `<h2>{t('title.review')}</h2>`
   - Line 752: `<p>Accept to add or retake...</p>` → `<p>{t('subtitle.review')}</p>`
   - Line 758: `alt="Captured photo preview"` → `alt={t('aria.capturedPhotoPreview')}`
   - Line 778: `aria-label="Discard and capture again"` → `aria-label={t('aria.discardAndCapture')}`
   - Line 781: `Retake` → `{t('buttons.retake')}`
   - Line 796: `aria-label="Accept photo"` → `aria-label={t('aria.acceptPhoto')}`
   - Line 800-806: Processing/Accept button text

4.9. Update Preview Mode render (lines 821-994):
   - Line 825: `<h2>Capture Photos</h2>` → `<h2>{t('title.preview')}</h2>`
   - Lines 826-828: Subtitle with count → `<p>{t('subtitle.preview', { count: capturedPhotos.length, max: maxPhotos })}</p>`
   - Line 855: Flash indicator `Auto` → `{t('flash.auto')}`
   - Line 883: `aria-label="Switch camera"` → `aria-label={t('buttons.switchCamera')}`
   - Line 902: `aria-label="Capture photo"` → `aria-label={t('buttons.capture')}`
   - Line 925: `aria-label="Captured photos"` → `aria-label={t('thumbnailStrip.title')}`
   - Line 941: `alt={`Photo ${index + 1}`}` → `alt={t('thumbnailStrip.photoAlt', { index: index + 1 })}`
   - Line 948: `aria-label={`Remove photo ${index + 1}`}` → `aria-label={t('thumbnailStrip.removePhoto', { index: index + 1 })}`
   - Line 959: `Add` placeholder text → `{t('thumbnailStrip.add')}`
   - Line 973: `Back` → `{t('buttons.back')}`
   - Line 986: `Continue` → `{t('buttons.continue')}`

4.10. Update Loading State (lines 659-668):
   - Line 663: `Initializing camera...` → `{t('states.initializing')}`

4.11. Update Error state Try Again button (line 644):
   - `Try Again` → `{t('buttons.tryAgain')}`

**Verification:**
- [ ] All UI strings use translation keys
- [ ] Counter display uses ICU format with variables
- [ ] Gallery navigation fully localized
- [ ] All aria-labels properly translated
- [ ] Build completes without errors

---

### TASK 5: Update FileUploadStep Component

**File:** `/src/components/ItemCapture/components/steps/FileUploadStep.tsx`
**Priority:** Critical
**Story Points:** 1.0

**Description:** Add i18n support to FileUploadStep for drop zone, progress, error display, and PDF status messages.

**Implementation Steps:**

5.1. Add useTranslations import:
```typescript
import { useTranslations } from 'next-intl';
```

5.2. Add hook initialization:
```typescript
const t = useTranslations('workflow.steps.fileUpload');
```

5.3. Update header section:
```tsx
<h2>{t('title')}</h2>
<p>{t('subtitle')}</p>
```

5.4. Update drop zone states:
   - Default state: `t('dropZone.default')`
   - Drag valid: `t('dropZone.dropValid')`
   - Drag invalid: `t('dropZone.dropInvalid')`
   - Has files: `t('dropZone.hasFiles')`
   - Supported formats: `t('dropZone.supportedFormats')`
   - Limits text: `t('dropZone.limits', { count: maxFiles, size: formatSize(maxSize) })`

5.5. Update file count progress:
   - `t('progress.fileCount', { count: currentCount, max: maxFiles })`

5.6. Update error rejection display:
   - Title: `t('errors.rejectionTitle', { count: rejectedCount })`
   - Dismiss button: `t('errors.dismiss')`

5.7. Update PDF card status messages:
   - Password protected: `t('pdf.passwordProtected')`
   - Corrupted: `t('pdf.corrupted')`
   - Page count: `t('pdf.pageCount', { count: pageCount })`

5.8. Update navigation buttons:
   - Back: `t('buttons.back')`
   - Continue: `t('buttons.continue')`

5.9. Update aria-labels:
   - Remove file: `aria-label={t('aria.removeFile', { filename })}`
   - Upload progress: `aria-label={t('aria.uploadProgress')}`

5.10. Update screen reader announcements:
   - Files uploaded: `t('announcements.filesUploaded', { count })`

**Verification:**
- [ ] All drop zone states localized
- [ ] File count uses proper ICU pluralization
- [ ] PDF status messages localized
- [ ] Rejection error with plural form works
- [ ] Build completes without errors

---

### TASK 6: Update TextEditorStep Component

**File:** `/src/components/ItemCapture/components/steps/TextEditorStep.tsx`
**Priority:** High
**Story Points:** 0.75

**Description:** Add i18n support to TextEditorStep for toolbar, tabs, placeholder, character counter, and error messages.

**Implementation Steps:**

6.1. Add useTranslations import:
```typescript
import { useTranslations } from 'next-intl';
```

6.2. Add hook initialization:
```typescript
const t = useTranslations('workflow.steps.textEditor');
```

6.3. Update header:
```tsx
<h2>{t('title')}</h2>
<p>{t('subtitle')}</p>
```

6.4. Update TOOLBAR_BUTTONS - since this is a constant outside the component, update aria-labels in the render:

**Option A (preferred):** Create a function that returns localized toolbar labels:
```typescript
const getToolbarLabel = (key: string): string => {
  const labels: Record<string, string> = {
    bold: t('toolbar.bold'),
    italic: t('toolbar.italic'),
    heading1: t('toolbar.heading1'),
    heading2: t('toolbar.heading2'),
    heading3: t('toolbar.heading3'),
    bulletList: t('toolbar.bulletList'),
    numberedList: t('toolbar.numberedList'),
    link: t('toolbar.link'),
  };
  return labels[key] || key;
};
```

Then in the toolbar render, use `aria-label={getToolbarLabel(button.key)}`

6.5. Update tab labels:
   - Editor tab: `{t('tabs.editor')}`
   - Preview tab: `{t('tabs.preview')}`

6.6. Update placeholder:
```tsx
placeholder={t('placeholder')}
```

6.7. Update preview section:
   - Label: `{t('preview.label')}`
   - Empty state: `{t('preview.empty')}`

6.8. Update character counter:
```tsx
{t('characterCounter', { current: charCount, max: maxChars })}
```

6.9. Update error message:
```tsx
{t('errors.exceedsLimit')}
```

6.10. Update saving indicator:
```tsx
{t('states.saving')}
```

6.11. Update navigation buttons:
   - Back: `{t('buttons.back')}`
   - Continue: `{t('buttons.continue')}`

6.12. Update aria-labels:
   - Content editor: `aria-label={t('aria.contentEditor')}`
   - Character count: `aria-label={t('aria.characterCount')}`

**Verification:**
- [ ] Header/subtitle text localized
- [ ] All toolbar button labels localized via aria-labels
- [ ] Tab labels localized
- [ ] Character counter with number formatting works
- [ ] Validation error message localized
- [ ] Build completes without errors

---

### TASK 7: Update UrlInputStep Component

**File:** `/src/components/ItemCapture/components/steps/UrlInputStep.tsx`
**Priority:** High
**Story Points:** 1.0

**Description:** Add i18n support to UrlInputStep for input field, network error recovery UI, preview states, and error messages.

**Implementation Steps:**

7.1. Add useTranslations import:
```typescript
import { useTranslations } from 'next-intl';
```

7.2. Add hook initialization:
```typescript
const t = useTranslations('workflow.steps.urlInput');
```

7.3. Update header:
```tsx
<h2>{t('title')}</h2>
<p>{t('subtitle')}</p>
```

7.4. Update input field:
   - Label: `{t('label')}`
   - Placeholder: `placeholder={t('placeholder')}`
   - Clear URL aria-label: `aria-label={t('aria.clearUrl')}`

7.5. Update button labels:
   - Paste: `{t('buttons.paste')}`
   - Fetch Preview: `{t('buttons.fetchPreview')}`
   - Add Link: `{t('buttons.addLink')}`
   - Add Link Anyway: `{t('buttons.addLinkAnyway')}`
   - Try Another: `{t('buttons.tryAnother')}`
   - Cancel: `{t('buttons.cancel')}`
   - Back: `{t('buttons.back')}`
   - Try Again: `{t('buttons.tryAgain')}`
   - Proceed Without Preview: `{t('buttons.proceedWithoutPreview')}`

7.6. Update network error panel:
   - Title: `{t('networkError.title')}`
   - Message: `{t('networkError.message')}`

7.7. Update preview states:
   - Fetching: `{t('states.fetching')}`
   - Retrying: `{t('states.retrying')}`
   - Preview loaded: `{t('states.previewLoaded')}`
   - Proceeding without preview: `{t('states.proceedingWithoutPreview')}`

7.8. Update no preview message:
```tsx
{t('noPreview.message')}
```

7.9. Update error messages:
   - Invalid URL: `t('errors.invalidUrl')`
   - Fetch failed: `t('errors.fetchFailed')`
   - Clipboard failed: `t('errors.clipboardFailed')`

**Verification:**
- [ ] All static text localized
- [ ] Network error recovery UI fully localized
- [ ] Preview states (loading, success, failure) localized
- [ ] All button labels localized
- [ ] Aria-labels localized
- [ ] Build completes without errors

---

### TASK 8: Update CameraPermissionFallback Component

**File:** `/src/components/ItemCapture/components/shared/CameraPermissionFallback.tsx`
**Priority:** Critical
**Story Points:** 0.5
**Lines to Modify:** 37-45, 61-62, 83-91, 97-146

**Description:** Add i18n support to CameraPermissionFallback for all UI strings with dynamic content type support.

**Implementation Steps:**

8.1. Add useTranslations import (after lucide imports, line 15):
```typescript
import { useTranslations } from 'next-intl';
```

8.2. Remove or deprecate the constant objects (lines 37-45):
```typescript
// Remove these - translations will handle the labels
// const CONTENT_TYPE_LABELS = { ... };
// const CONTENT_TYPE_FILE_LABELS = { ... };
```

8.3. Add hook initialization inside the component (after line 60):
```typescript
const t = useTranslations('workflow.shared.cameraPermission');
```

8.4. Update component to use translations (line 61-62):
```typescript
// Remove these lines:
// const contentLabel = CONTENT_TYPE_LABELS[contentType];
// const uploadLabel = CONTENT_TYPE_FILE_LABELS[contentType];

// Use translations instead:
const uploadLabel = contentType === 'video'
  ? t('uploadVideo')
  : t('uploadPhoto');
```

8.5. Update title (lines 83-85):
```tsx
<h2 className="text-xl font-semibold text-gray-900 mb-2">
  {t('title')}
</h2>
```

8.6. Update explanation paragraph (lines 88-91):
```tsx
<p className="text-gray-600 mb-6">
  {t('explanation', { contentType })}
</p>
```

8.7. Update upload button (lines 107-111):
```tsx
aria-label={uploadLabel}
```
(Button text already uses `{uploadLabel}` which is now translated)

8.8. Update try again button (lines 125-129):
```tsx
aria-label={t('tryAgain')}
```
```tsx
{t('tryAgain')}
```

8.9. Update help link (lines 145-146):
```tsx
{t('helpLink')}
```

**Verification:**
- [ ] Title and explanation localized
- [ ] Dynamic contentType interpolation works in explanation
- [ ] Button labels adapt to video/photo context
- [ ] External help link text localized
- [ ] Build completes without errors

---

## Verification Checklist

### Build Verification
```bash
npm run build
```
- [ ] No TypeScript errors related to translation types
- [ ] No missing translation key warnings

### Runtime Verification
- [ ] Start development server: `npm run dev`
- [ ] Navigate through item creation workflow
- [ ] Test each content type path (video, photo, file upload, text, URL)
- [ ] Open browser console, verify no translation-related errors

### Functional Testing by Component

**MediaCaptureStep:**
- [ ] "No Content Type Selected" error displays correctly
- [ ] "Unsupported Content Type" error displays with contentType variable
- [ ] "Go Back" button text is translated

**VideoCaptureStep:**
- [ ] Preview mode header/subtitle correct
- [ ] Recording mode shows "REC" indicator translated
- [ ] Review mode header/subtitle correct
- [ ] Timer displays with translated "remaining" text
- [ ] All button aria-labels announced correctly
- [ ] Error states show translated messages and guidance
- [ ] "Try Again" button translated
- [ ] Processing state shows translated text

**PhotoCaptureStep:**
- [ ] Photo count "{count} / {max}" displays correctly
- [ ] Review mode header/subtitle correct
- [ ] Gallery counter "{current} of {total}" displays correctly
- [ ] Thumbnail strip labels translated
- [ ] Flash indicator shows translated "Auto"
- [ ] All button text and aria-labels translated
- [ ] Error messages with max photos limit works with variable

**FileUploadStep:**
- [ ] Drop zone states (default, drag valid, drag invalid, has files) all translated
- [ ] File count progress displays correctly
- [ ] PDF card status messages (password protected, corrupted, page count) translated
- [ ] Rejection error with plural "{count} file(s)" works
- [ ] All buttons translated

**TextEditorStep:**
- [ ] Header/subtitle translated
- [ ] Toolbar button aria-labels translated
- [ ] Tab labels (Editor/Preview) translated
- [ ] Placeholder text translated
- [ ] Character counter displays correctly
- [ ] Character limit error translated
- [ ] Saving indicator translated

**UrlInputStep:**
- [ ] Header/subtitle translated
- [ ] Input label and placeholder translated
- [ ] All button labels translated
- [ ] Network error panel fully translated
- [ ] Preview states translated
- [ ] Error messages translated
- [ ] Clear URL aria-label translated

**CameraPermissionFallback:**
- [ ] Title translated
- [ ] Explanation with contentType="video" correct
- [ ] Explanation with contentType="photo" correct
- [ ] Upload button adapts to video/photo
- [ ] Try Again button translated
- [ ] Help link text translated

### Accessibility Testing
- [ ] Use screen reader to verify all aria-labels announced correctly
- [ ] Verify focus management after state changes
- [ ] Keyboard navigation works in all components

---

## Files Modified Summary

| File | Changes | String Count |
|------|---------|--------------|
| `/messages/en.json` | Add workflow.steps.* keys | ~210 keys |
| `MediaCaptureStep.tsx` | Add useTranslations, replace 5 strings | 5 |
| `VideoCaptureStep.tsx` | Heavy localization | ~50 |
| `PhotoCaptureStep.tsx` | Heavy localization | ~50 |
| `FileUploadStep.tsx` | Heavy localization | ~30 |
| `TextEditorStep.tsx` | Medium localization | ~20 |
| `UrlInputStep.tsx` | Heavy localization | ~40 |
| `CameraPermissionFallback.tsx` | Medium localization | ~15 |

**Total Files:** 8
**Total Strings:** ~210+

---

## Notes for Implementation

1. **Helper Function Pattern:** Functions like `getErrorGuidance` and `mapHookErrorToComponentError` that return strings should be moved inside the component to access `t()` from closure.

2. **ICU Message Format:** Use for:
   - Pluralization: `{count, plural, one {# file} other {# files}}`
   - Variable interpolation: `{contentType}`, `{count}`, `{max}`

3. **Aria-labels:** All interactive elements must have translated aria-labels for screen reader accessibility.

4. **Testing Order:** Recommend testing in this order:
   1. MediaCaptureStep router (simplest)
   2. CameraPermissionFallback (shared)
   3. VideoCaptureStep
   4. PhotoCaptureStep
   5. FileUploadStep
   6. TextEditorStep
   7. UrlInputStep

5. **Common Keys:** Consider using `common.actions.goBack`, `common.actions.back`, etc. for shared button labels.

---

## References

- [Overview Document](/docs/REQ-E02-063-update-mediacapturestep-and-adapters-overview.md)
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Documentation](/docs/gen_requests_epic2.md#REQ-E02-063)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2C: Item Creation Workflow*
*Task 2C.8: Update MediaCaptureStep and Adapters*
