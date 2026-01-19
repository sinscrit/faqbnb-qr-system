# REQ-378: Update MediaCaptureStep and Adapters - Detailed Task Breakdown

**Document Created**: 2026-01-19 16:30 UTC
**Last Modified**: 2026-01-19 16:30 UTC
**Overview Document**: REQ-378-update-mediacapturestep-and-adapters-overview.md
**Epic**: Epic 2 - Static UI Translation
**Sub-Epic**: 2C - Item Creation Workflow
**Task ID**: 2C.8
**Estimated Total Effort**: ~11.5 hours

---

## Executive Summary

This document provides granular, actionable tasks for internationalizing the MediaCaptureStep component and its five adapter components (VideoCaptureAdapter, PhotoCaptureAdapter, FileUploadAdapter, TextEditorAdapter, UrlInputAdapter). The MediaCaptureStep itself contains 5 hardcoded strings, while the adapters are pure state-mapping layers with no user-facing text. However, the adapters render underlying ItemCapture step components that contain extensive strings (~130+ strings total).

**Architecture Decision**: This implementation follows **Option A (Recommended)** from the overview document - passing translation functions via props through adapters to the underlying step components, keeping i18n setup centralized in the workflow.

---

## Prerequisites Checklist

Before starting implementation, verify these dependencies are complete:

- [ ] Epic 1 Foundation complete (next-intl installed and configured)
- [ ] IntlProvider wrapper present in `/src/app/layout.tsx`
- [ ] Translation files structure exists in `/messages/*.json`
- [ ] `useTranslations` hook available from `next-intl`
- [ ] `workflow` namespace exists in `/messages/en.json` (may need to be created/extended)

---

## Task Breakdown

### Task 1: Add Translation Keys to English Message File

**Priority**: Required | **Estimate**: 45 minutes
**File**: `/messages/en.json`

#### Task 1.1: Add `workflow.mediaCapture` Namespace for Router Component

Add the following keys under the `workflow` namespace for MediaCaptureStep router component error states:

```json
{
  "workflow": {
    "mediaCapture": {
      "errors": {
        "noContentType": {
          "heading": "No Content Type Selected",
          "description": "Please go back and select a content type before proceeding."
        },
        "unsupportedType": {
          "heading": "Unsupported Content Type",
          "description": "The content type \"{contentType}\" is not supported. Please go back and select a different option."
        }
      }
    }
  }
}
```

**Acceptance Criteria**:
- [ ] Keys exist at `workflow.mediaCapture.errors.noContentType.heading`
- [ ] Keys exist at `workflow.mediaCapture.errors.noContentType.description`
- [ ] Keys exist at `workflow.mediaCapture.errors.unsupportedType.heading`
- [ ] Keys exist at `workflow.mediaCapture.errors.unsupportedType.description`
- [ ] Interpolation placeholder `{contentType}` is present in unsupportedType.description

---

#### Task 1.2: Add `workflow.videoCapture` Namespace

Add translation keys for VideoCaptureStep strings (approximately 45 strings):

```json
{
  "workflow": {
    "videoCapture": {
      "heading": {
        "preview": "Record Video",
        "recording": "Recording Video",
        "review": "Review Your Video"
      },
      "instructions": {
        "preview": "Position your camera and tap record to start",
        "recording": "Recording in progress - tap stop when finished",
        "review": "Play to review, then accept or retake"
      },
      "loading": "Initializing camera...",
      "status": {
        "recording": "REC",
        "processing": "Processing...",
        "timeRemaining": "{time} remaining"
      },
      "controls": {
        "startRecording": "Start recording",
        "stopRecording": "Stop recording",
        "retake": "Retake",
        "accept": "Accept",
        "tryAgain": "Try Again",
        "back": "Back",
        "switchCamera": "Switch camera"
      },
      "errors": {
        "permissionDenied": "Camera access was denied",
        "browserNotSupported": "Your browser does not support video recording",
        "recordingFailed": "Video recording failed",
        "noData": "No video data captured",
        "playbackFailed": "Failed to load video for playback",
        "processingFailed": "Failed to process video",
        "thumbnailFailed": "Video saved but thumbnail generation failed"
      },
      "guidance": {
        "permissionDenied": "Please enable camera access in your browser settings to record video.",
        "browserNotSupported": "Camera access requires HTTPS. Please go back and use \"Upload Video\" instead, or access via HTTPS.",
        "recordingFailed": "Please check your camera and try again.",
        "genericError": "An unexpected error occurred. Please try again."
      },
      "aria": {
        "discardAndRecord": "Discard and record again",
        "acceptVideo": "Accept video"
      },
      "announcements": {
        "recordingStarted": "Recording started",
        "recordingStopped": "Recording stopped. Review your video.",
        "retaking": "Retaking video. Ready to record.",
        "processing": "Processing video...",
        "switchedCamera": "Switched to {camera} camera"
      }
    }
  }
}
```

**Acceptance Criteria**:
- [ ] All heading variants (preview, recording, review) have translation keys
- [ ] All instruction variants have translation keys
- [ ] All error messages and guidance have translation keys
- [ ] All control button labels have translation keys
- [ ] All aria-labels have translation keys
- [ ] All screen reader announcements have translation keys
- [ ] Interpolation placeholders (`{time}`, `{camera}`) are present where needed

---

#### Task 1.3: Add `workflow.photoCapture` Namespace

Add translation keys for PhotoCaptureStep strings (approximately 50 strings):

```json
{
  "workflow": {
    "photoCapture": {
      "heading": {
        "capture": "Capture Photos",
        "review": "Review Your Photo"
      },
      "instructions": {
        "capture": "Tap the capture button to take photos ({count} / {maxPhotos})",
        "review": "Accept to add or retake for a new shot"
      },
      "loading": "Initializing camera...",
      "status": {
        "processing": "Processing...",
        "flash": "Auto"
      },
      "controls": {
        "capture": "Capture photo",
        "retake": "Retake",
        "accept": "Accept",
        "tryAgain": "Try Again",
        "back": "Back",
        "continue": "Continue",
        "switchCamera": "Switch camera"
      },
      "gallery": {
        "title": "Photo gallery",
        "deletePhoto": "Delete photo",
        "closeGallery": "Close gallery",
        "previousPhoto": "Previous photo",
        "nextPhoto": "Next photo",
        "photoIndex": "Photo {index}",
        "countDisplay": "{current} of {total}"
      },
      "thumbnails": {
        "capturedPhotos": "Captured photos",
        "add": "Add",
        "removePhoto": "Remove photo {index}"
      },
      "errors": {
        "permissionDenied": "Camera access was denied",
        "browserNotSupported": "Your browser does not support photo capture",
        "captureFailed": "Photo capture failed",
        "processingFailed": "Failed to process photo",
        "maxPhotosReached": "Maximum of {maxPhotos} photos reached",
        "storageFull": "Device storage is full"
      },
      "guidance": {
        "permissionDenied": "Please enable camera access in your browser settings to capture photos.",
        "browserNotSupported": "Camera access requires HTTPS. Please go back and use \"Upload Photo\" instead, or access via HTTPS.",
        "captureFailed": "Please check your camera and try again.",
        "maxPhotosReached": "You have reached the maximum of {maxPhotos} photos. Remove a photo to add more.",
        "storageFull": "Please free up space and try again.",
        "genericError": "An unexpected error occurred. Please try again."
      },
      "aria": {
        "discardAndCapture": "Discard and capture again",
        "acceptPhoto": "Accept photo",
        "removePhotoAt": "Remove photo {index}"
      },
      "announcements": {
        "photoCaptured": "Photo captured. Review or retake.",
        "retaking": "Retaking photo. Ready to capture.",
        "processing": "Processing photo...",
        "photoAdded": "Photo added to collection.",
        "photoRemoved": "Photo removed.",
        "switchedCamera": "Switched to {camera} camera"
      }
    }
  }
}
```

**Acceptance Criteria**:
- [ ] All heading variants have translation keys
- [ ] Photo count interpolation (`{count}`, `{maxPhotos}`) is present
- [ ] Gallery navigation strings have translation keys
- [ ] Thumbnail strip strings have translation keys
- [ ] All error messages and guidance have translation keys
- [ ] All control button labels have translation keys
- [ ] All aria-labels have translation keys with proper interpolation
- [ ] All screen reader announcements have translation keys

---

#### Task 1.4: Add `workflow.fileUpload` Namespace

Add translation keys for FileUploadStep strings (approximately 35 strings):

```json
{
  "workflow": {
    "fileUpload": {
      "heading": "Upload Files",
      "instructions": "Drag and drop files or click to select",
      "dropZone": {
        "dropHere": "Drop files here",
        "invalidType": "Invalid file type",
        "addMore": "Add more files",
        "dragOrClick": "Drag files here or click to browse",
        "supportedFormats": "Supports images, videos, and PDF files",
        "limits": "Max {maxFiles} files, {maxFileSize} each"
      },
      "fileInfo": {
        "pageCount": "{count, plural, one {# page} other {# pages}}",
        "passwordProtected": "Password protected",
        "fileDamaged": "File may be damaged"
      },
      "rejections": {
        "title": "{count, plural, one {# file} other {# files}} couldn't be added",
        "dismiss": "Dismiss"
      },
      "progress": {
        "fileCount": "{current}/{max} files"
      },
      "controls": {
        "back": "Back",
        "continue": "Continue",
        "remove": "Remove {fileName}",
        "dismissError": "Dismiss error"
      },
      "aria": {
        "uploadProgress": "Upload size progress"
      },
      "announcements": {
        "filesUploaded": "{count, plural, one {# file uploaded} other {# files uploaded}}"
      }
    }
  }
}
```

**Acceptance Criteria**:
- [ ] Drop zone states have translation keys
- [ ] File info messages (page count, password protected) have keys
- [ ] Rejection messages use ICU plural format
- [ ] Progress indicator has translation keys with interpolation
- [ ] All control button labels have translation keys
- [ ] File removal uses `{fileName}` interpolation

---

#### Task 1.5: Add `workflow.textEditor` Namespace (If Not Already Present)

Add translation keys for TextEditorStep strings:

```json
{
  "workflow": {
    "textEditor": {
      "heading": "Write Instructions",
      "placeholder": "Enter your instructions here...",
      "controls": {
        "back": "Back",
        "continue": "Continue",
        "clear": "Clear"
      },
      "formatting": {
        "bold": "Bold",
        "italic": "Italic",
        "heading": "Heading",
        "list": "List",
        "link": "Link"
      },
      "characterCount": "{count} characters",
      "wordCount": "{count, plural, one {# word} other {# words}}"
    }
  }
}
```

**Acceptance Criteria**:
- [ ] Editor heading and placeholder have translation keys
- [ ] Control buttons have translation keys
- [ ] Formatting toolbar labels have translation keys (if present)
- [ ] Character/word count uses proper interpolation

---

#### Task 1.6: Add `workflow.urlInput` Namespace (If Not Already Present)

Add translation keys for UrlInputStep strings:

```json
{
  "workflow": {
    "urlInput": {
      "heading": "Add a Link",
      "placeholder": "Enter URL (e.g., https://example.com)",
      "preview": {
        "title": "Link Preview",
        "noPreview": "No preview available",
        "loading": "Loading preview..."
      },
      "controls": {
        "back": "Back",
        "add": "Add Link",
        "clear": "Clear"
      },
      "errors": {
        "invalidUrl": "Please enter a valid URL",
        "unreachable": "Unable to reach this URL",
        "fetchFailed": "Failed to fetch link preview"
      },
      "aria": {
        "urlInput": "URL input field",
        "previewArea": "Link preview area"
      }
    }
  }
}
```

**Acceptance Criteria**:
- [ ] URL input heading and placeholder have translation keys
- [ ] Preview states (loading, no preview) have translation keys
- [ ] All control buttons have translation keys
- [ ] Error messages have translation keys
- [ ] Aria labels have translation keys

---

#### Task 1.7: Add Shared `workflow.buttons` Namespace

Add commonly reused button labels:

```json
{
  "workflow": {
    "buttons": {
      "goBack": "Go Back",
      "back": "Back",
      "continue": "Continue",
      "cancel": "Cancel",
      "retry": "Retry",
      "accept": "Accept",
      "retake": "Retake"
    }
  }
}
```

**Acceptance Criteria**:
- [ ] Common button labels are centralized
- [ ] These keys can be reused across MediaCaptureStep and adapters

---

### Task 2: Update MediaCaptureStep Component

**Priority**: Required | **Estimate**: 30 minutes
**File**: `/src/components/ItemCreationWorkflow/components/steps/MediaCaptureStep.tsx`

#### Task 2.1: Import useTranslations Hook

Add the import statement at the top of the file:

```typescript
import { useTranslations } from 'next-intl';
```

**Acceptance Criteria**:
- [ ] `useTranslations` is imported from `next-intl`

---

#### Task 2.2: Initialize Translation Hook

Inside the `MediaCaptureStep` component, add:

```typescript
const t = useTranslations('workflow');
```

**Acceptance Criteria**:
- [ ] Translation hook is initialized with 'workflow' namespace

---

#### Task 2.3: Replace "No Content Type Selected" Error State

Update the error state JSX (lines 72-89):

**Before**:
```tsx
<h2 className="text-xl font-semibold text-gray-900 mb-2">
  No Content Type Selected
</h2>
<p className="text-gray-600 text-center max-w-md mb-6">
  Please go back and select a content type before proceeding.
</p>
<button ...>
  Go Back
</button>
```

**After**:
```tsx
<h2 className="text-xl font-semibold text-gray-900 mb-2">
  {t('mediaCapture.errors.noContentType.heading')}
</h2>
<p className="text-gray-600 text-center max-w-md mb-6">
  {t('mediaCapture.errors.noContentType.description')}
</p>
<button ...>
  {t('buttons.goBack')}
</button>
```

**Acceptance Criteria**:
- [ ] Heading uses `t('mediaCapture.errors.noContentType.heading')`
- [ ] Description uses `t('mediaCapture.errors.noContentType.description')`
- [ ] Button uses `t('buttons.goBack')`

---

#### Task 2.4: Replace "Unsupported Content Type" Error State

Update the error state JSX (lines 131-146):

**Before**:
```tsx
<h2 className="text-xl font-semibold text-gray-900 mb-2">
  Unsupported Content Type
</h2>
<p className="text-gray-600 text-center max-w-md mb-6">
  The content type "{contentType}" is not supported. Please go back and select a different option.
</p>
<button ...>
  Go Back
</button>
```

**After**:
```tsx
<h2 className="text-xl font-semibold text-gray-900 mb-2">
  {t('mediaCapture.errors.unsupportedType.heading')}
</h2>
<p className="text-gray-600 text-center max-w-md mb-6">
  {t('mediaCapture.errors.unsupportedType.description', { contentType })}
</p>
<button ...>
  {t('buttons.goBack')}
</button>
```

**Acceptance Criteria**:
- [ ] Heading uses `t('mediaCapture.errors.unsupportedType.heading')`
- [ ] Description uses `t('mediaCapture.errors.unsupportedType.description', { contentType })`
- [ ] `contentType` variable is passed as interpolation parameter
- [ ] Button uses `t('buttons.goBack')`

---

### Task 3: Create Translation Types Interface

**Priority**: Required | **Estimate**: 15 minutes
**File**: `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` (or create new file)

#### Task 3.1: Define Translation Function Type

Add a type definition for the translation function that will be passed through adapters:

```typescript
/**
 * Translation function type for passing translations through adapters.
 * Compatible with next-intl's useTranslations return type.
 */
export type TranslationFunction = (
  key: string,
  params?: Record<string, string | number>
) => string;

/**
 * Props extension for components that receive translations.
 */
export interface TranslatableProps {
  /** Optional translation function. If not provided, component uses English fallbacks. */
  t?: TranslationFunction;
}
```

**Acceptance Criteria**:
- [ ] `TranslationFunction` type is exported
- [ ] `TranslatableProps` interface is exported
- [ ] Types are compatible with next-intl's `useTranslations` return type

---

### Task 4: Update Adapter Components

**Priority**: Required | **Estimate**: 1 hour
**Files**: 5 adapter files in `/src/components/ItemCreationWorkflow/components/steps/adapters/`

#### Task 4.1: Update VideoCaptureAdapter

**File**: `VideoCaptureAdapter.tsx`

1. Import the translation type:
   ```typescript
   import type { TranslationFunction } from '../../../ItemCreationWorkflow.types';
   ```

2. Update props interface:
   ```typescript
   export interface VideoCaptureAdapterProps {
     currentItem: CurrentItemState;
     onAddContent: (piece: ContentPiece) => void;
     onComplete: () => void;
     onBack: () => void;
     /** Translation function for passing to underlying step component */
     t?: TranslationFunction;
   }
   ```

3. Pass translation function to underlying component:
   ```typescript
   return (
     <VideoCaptureStep
       state={syntheticState}
       addMedia={handleAddMedia}
       goToStep={handleGoToStep}
       prevStep={handlePrevStep}
       config={syntheticConfig}
       t={t}
     />
   );
   ```

**Acceptance Criteria**:
- [ ] `VideoCaptureAdapterProps` includes optional `t` prop
- [ ] Translation function is passed to `VideoCaptureStep`
- [ ] TypeScript compiles without errors

---

#### Task 4.2: Update PhotoCaptureAdapter

**File**: `PhotoCaptureAdapter.tsx`

Follow the same pattern as Task 4.1:

1. Import `TranslationFunction` type
2. Add `t?: TranslationFunction` to `PhotoCaptureAdapterProps`
3. Pass `t` to `PhotoCaptureStep`

**Acceptance Criteria**:
- [ ] `PhotoCaptureAdapterProps` includes optional `t` prop
- [ ] Translation function is passed to `PhotoCaptureStep`
- [ ] TypeScript compiles without errors

---

#### Task 4.3: Update FileUploadAdapter

**File**: `FileUploadAdapter.tsx`

Follow the same pattern as Task 4.1:

1. Import `TranslationFunction` type
2. Add `t?: TranslationFunction` to `FileUploadAdapterProps`
3. Pass `t` to `FileUploadStep`

**Acceptance Criteria**:
- [ ] `FileUploadAdapterProps` includes optional `t` prop
- [ ] Translation function is passed to `FileUploadStep`
- [ ] TypeScript compiles without errors

---

#### Task 4.4: Update TextEditorAdapter

**File**: `TextEditorAdapter.tsx`

Follow the same pattern as Task 4.1:

1. Import `TranslationFunction` type
2. Add `t?: TranslationFunction` to `TextEditorAdapterProps`
3. Pass `t` to `TextEditorStep`

**Acceptance Criteria**:
- [ ] `TextEditorAdapterProps` includes optional `t` prop
- [ ] Translation function is passed to `TextEditorStep`
- [ ] TypeScript compiles without errors

---

#### Task 4.5: Update UrlInputAdapter

**File**: `UrlInputAdapter.tsx`

Follow the same pattern as Task 4.1:

1. Import `TranslationFunction` type
2. Add `t?: TranslationFunction` to `UrlInputAdapterProps`
3. Pass `t` to `UrlInputStep`

**Acceptance Criteria**:
- [ ] `UrlInputAdapterProps` includes optional `t` prop
- [ ] Translation function is passed to `UrlInputStep`
- [ ] TypeScript compiles without errors

---

### Task 5: Update ItemCapture Step Components

**Priority**: Required | **Estimate**: 4 hours
**Files**: 5 files in `/src/components/ItemCapture/components/steps/`

#### Task 5.1: Update VideoCaptureStep Props Interface

**File**: `/src/components/ItemCapture/components/steps/VideoCaptureStep.tsx`

1. Add translation prop to interface:
   ```typescript
   export interface VideoCaptureStepProps {
     state: ItemCaptureState;
     addMedia: (mediaItem: MediaItem) => void;
     goToStep: (step: WizardStep) => void;
     prevStep: () => void;
     config: ItemCaptureConfig;
     /** Optional translation function. Falls back to English if not provided. */
     t?: (key: string, params?: Record<string, string | number>) => string;
   }
   ```

2. Create default English translations object for fallback:
   ```typescript
   const DEFAULT_TRANSLATIONS = {
     'heading.preview': 'Record Video',
     'heading.recording': 'Recording Video',
     'heading.review': 'Review Your Video',
     // ... all other keys with English values
   };
   ```

3. Create a wrapper function that uses provided `t` or falls back to defaults:
   ```typescript
   const translate = (key: string, params?: Record<string, string | number>) => {
     if (t) {
       return t(`videoCapture.${key}`, params);
     }
     let text = DEFAULT_TRANSLATIONS[key] || key;
     if (params) {
       Object.entries(params).forEach(([k, v]) => {
         text = text.replace(`{${k}}`, String(v));
       });
     }
     return text;
   };
   ```

4. Replace all hardcoded strings with `translate()` calls

**Acceptance Criteria**:
- [ ] Props interface includes optional `t` function
- [ ] Fallback translations object exists with all English strings
- [ ] All JSX strings replaced with `translate()` calls
- [ ] All error messages use `translate()`
- [ ] All aria-labels use `translate()`
- [ ] All screen reader announcements use `translate()`
- [ ] Component works with and without `t` prop provided

---

#### Task 5.2: Update PhotoCaptureStep

**File**: `/src/components/ItemCapture/components/steps/PhotoCaptureStep.tsx`

Follow the same pattern as Task 5.1:

1. Add `t` prop to interface
2. Create `DEFAULT_TRANSLATIONS` object
3. Create `translate()` wrapper function
4. Replace all hardcoded strings

**Key strings to translate** (~50):
- Heading variants (capture, review)
- Instructions with photo count interpolation
- All control button labels
- Gallery navigation labels
- Thumbnail strip labels
- All error messages and guidance
- All aria-labels
- All screen reader announcements

**Acceptance Criteria**:
- [ ] All JSX strings use translation function
- [ ] Photo count displays correctly with interpolation (`{count} / {maxPhotos}`)
- [ ] Gallery counter displays correctly (`{current} of {total}`)
- [ ] Component works with and without `t` prop

---

#### Task 5.3: Update FileUploadStep

**File**: `/src/components/ItemCapture/components/steps/FileUploadStep.tsx`

Follow the same pattern as Task 5.1:

1. Add `t` prop to interface
2. Create `DEFAULT_TRANSLATIONS` object
3. Create `translate()` wrapper function
4. Replace all hardcoded strings

**Key strings to translate** (~35):
- Drop zone states (idle, dragging, invalid)
- File info (page count, status indicators)
- Rejection messages (with pluralization)
- Progress indicators
- Control buttons
- Aria-labels
- Screen reader announcements

**Acceptance Criteria**:
- [ ] Drop zone states display correct translations
- [ ] Page count uses ICU plural format (`{count, plural, one {# page} other {# pages}}`)
- [ ] File rejection count uses ICU plural format
- [ ] Component works with and without `t` prop

---

#### Task 5.4: Update TextEditorStep

**File**: `/src/components/ItemCapture/components/steps/TextEditorStep.tsx`

Follow the same pattern as Task 5.1:

1. Add `t` prop to interface
2. Create `DEFAULT_TRANSLATIONS` object
3. Create `translate()` wrapper function
4. Replace all hardcoded strings

**Acceptance Criteria**:
- [ ] Editor heading uses translation
- [ ] Placeholder text uses translation
- [ ] Control buttons use translations
- [ ] Character/word count uses proper interpolation
- [ ] Component works with and without `t` prop

---

#### Task 5.5: Update UrlInputStep

**File**: `/src/components/ItemCapture/components/steps/UrlInputStep.tsx`

Follow the same pattern as Task 5.1:

1. Add `t` prop to interface
2. Create `DEFAULT_TRANSLATIONS` object
3. Create `translate()` wrapper function
4. Replace all hardcoded strings

**Acceptance Criteria**:
- [ ] Heading and placeholder use translations
- [ ] Preview states use translations
- [ ] Error messages use translations
- [ ] Control buttons use translations
- [ ] Component works with and without `t` prop

---

### Task 6: Update Shared Components

**Priority**: Required | **Estimate**: 1 hour
**Files**: Shared components in `/src/components/ItemCapture/components/shared/`

#### Task 6.1: Update CameraPermissionFallback

**File**: `/src/components/ItemCapture/components/shared/CameraPermissionFallback.tsx`

1. Add `t` prop to component props interface
2. Create fallback translations
3. Replace hardcoded permission messages
4. Replace button labels

**Key strings**:
- "Camera access is required"
- "Please allow camera access in your browser settings"
- "Allow Access" / "Use File Upload Instead" buttons

**Acceptance Criteria**:
- [ ] Permission request messages use translations
- [ ] Button labels use translations
- [ ] Component works with and without `t` prop

---

#### Task 6.2: Update PDFPlaceholder (If Contains Strings)

**File**: `/src/components/ItemCapture/components/shared/PDFPlaceholder.tsx`

Review for any hardcoded strings and update if found.

**Acceptance Criteria**:
- [ ] Any user-visible strings use translations

---

#### Task 6.3: Update PageCountBadge (If Contains Strings)

**File**: `/src/components/ItemCapture/components/shared/PageCountBadge.tsx`

Review for any hardcoded strings and update if found.

**Acceptance Criteria**:
- [ ] Any user-visible strings use translations

---

### Task 7: Pass Translation Function Through MediaCaptureStep

**Priority**: Required | **Estimate**: 30 minutes
**File**: `/src/components/ItemCreationWorkflow/components/steps/MediaCaptureStep.tsx`

Update MediaCaptureStep to pass the translation function to adapters:

```typescript
export default function MediaCaptureStep({
  currentItem,
  onAddContent,
  onComplete,
  onBack,
  className,
}: MediaCaptureStepProps) {
  const t = useTranslations('workflow');

  // ... validation code ...

  // Common adapter props including translation function
  const adapterProps = {
    currentItem,
    onAddContent,
    onComplete,
    onBack,
    t, // Pass translation function
  };

  // ... routing code ...
}
```

**Acceptance Criteria**:
- [ ] All adapter components receive the `t` function
- [ ] Translation function is passed with correct namespace context

---

### Task 8: Generate Non-English Translations

**Priority**: Required | **Estimate**: 2 hours
**Files**: `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`

#### Task 8.1: Generate French Translations

Add all keys from Task 1 to `/messages/fr.json` with French translations.

**Sample translations**:
```json
{
  "workflow": {
    "mediaCapture": {
      "errors": {
        "noContentType": {
          "heading": "Aucun type de contenu selectionne",
          "description": "Veuillez revenir en arriere et selectionner un type de contenu avant de continuer."
        }
      }
    },
    "videoCapture": {
      "heading": {
        "preview": "Enregistrer une video",
        "recording": "Enregistrement en cours",
        "review": "Verifier votre video"
      }
    }
  }
}
```

**Acceptance Criteria**:
- [ ] All workflow namespace keys exist in fr.json
- [ ] Translations are contextually appropriate for media capture context
- [ ] Interpolation placeholders are preserved

---

#### Task 8.2: Generate Spanish Translations

Add all keys to `/messages/es.json` with Spanish translations.

**Acceptance Criteria**:
- [ ] All workflow namespace keys exist in es.json
- [ ] Translations are contextually appropriate
- [ ] Interpolation placeholders are preserved

---

#### Task 8.3: Generate German Translations

Add all keys to `/messages/de.json` with German translations.

**Note**: German translations are typically 30-40% longer than English. Test layout.

**Acceptance Criteria**:
- [ ] All workflow namespace keys exist in de.json
- [ ] Translations are contextually appropriate
- [ ] Interpolation placeholders are preserved

---

#### Task 8.4: Generate Dutch Translations

Add all keys to `/messages/nl.json` with Dutch translations.

**Acceptance Criteria**:
- [ ] All workflow namespace keys exist in nl.json
- [ ] Translations are contextually appropriate
- [ ] Interpolation placeholders are preserved

---

#### Task 8.5: Generate Italian Translations

Add all keys to `/messages/it.json` with Italian translations.

**Acceptance Criteria**:
- [ ] All workflow namespace keys exist in it.json
- [ ] Translations are contextually appropriate
- [ ] Interpolation placeholders are preserved

---

### Task 9: Testing and Validation

**Priority**: Required | **Estimate**: 2 hours

#### Task 9.1: Verify English Strings Render Correctly

1. Navigate to the item creation workflow
2. Test MediaCaptureStep error states
3. Test video capture flow
4. Test photo capture flow
5. Test file upload flow
6. Test text editor flow
7. Test URL input flow

**Acceptance Criteria**:
- [ ] No missing translation warnings in console
- [ ] All strings render correctly
- [ ] Interpolation works correctly (photo count, file names, etc.)

---

#### Task 9.2: Test Layout with German Translations

1. Switch language to German
2. Navigate through all media capture flows
3. Verify no text overflow or layout breaks

**Key areas to check**:
- Error state dialogs
- Button labels
- Status indicators
- Gallery navigation
- Permission prompts

**Acceptance Criteria**:
- [ ] No text truncation or overflow
- [ ] Buttons maintain proper sizing
- [ ] Modal dialogs display correctly
- [ ] Status indicators are readable

---

#### Task 9.3: Test Screen Reader Announcements

1. Enable screen reader (VoiceOver/NVDA)
2. Navigate through video capture flow
3. Navigate through photo capture flow
4. Verify announcements are in selected language

**Acceptance Criteria**:
- [ ] Recording state changes are announced in user's language
- [ ] Photo capture events are announced in user's language
- [ ] Camera switch is announced in user's language

---

#### Task 9.4: Verify Fallback Behavior

1. Remove `t` prop from an adapter temporarily
2. Verify component still works with English fallbacks
3. Restore `t` prop

**Acceptance Criteria**:
- [ ] Components function correctly without translation prop
- [ ] English fallbacks display correctly

---

#### Task 9.5: Run TypeScript Compilation

```bash
npm run build
```

**Acceptance Criteria**:
- [ ] No TypeScript errors related to translation props
- [ ] Build completes successfully

---

#### Task 9.6: Run Existing Tests

```bash
npm run test
```

If tests fail due to missing `t` prop, update test mocks:

```typescript
const mockTranslate = (key: string) => key;

render(
  <VideoCaptureStep
    state={mockState}
    addMedia={jest.fn()}
    goToStep={jest.fn()}
    prevStep={jest.fn()}
    config={mockConfig}
    t={mockTranslate}
  />
);
```

**Acceptance Criteria**:
- [ ] All existing tests pass
- [ ] Test mocks provide translation function where needed

---

## Files Modified Summary

### Primary Files (MediaCaptureStep & Adapters)

| File | Changes |
|------|---------|
| `MediaCaptureStep.tsx` | Add useTranslations, replace 5 strings, pass t to adapters |
| `VideoCaptureAdapter.tsx` | Add t prop, pass to underlying component |
| `PhotoCaptureAdapter.tsx` | Add t prop, pass to underlying component |
| `FileUploadAdapter.tsx` | Add t prop, pass to underlying component |
| `TextEditorAdapter.tsx` | Add t prop, pass to underlying component |
| `UrlInputAdapter.tsx` | Add t prop, pass to underlying component |

### ItemCapture Step Components

| File | Changes |
|------|---------|
| `VideoCaptureStep.tsx` | Add t prop, create fallbacks, replace ~45 strings |
| `PhotoCaptureStep.tsx` | Add t prop, create fallbacks, replace ~50 strings |
| `FileUploadStep.tsx` | Add t prop, create fallbacks, replace ~35 strings |
| `TextEditorStep.tsx` | Add t prop, create fallbacks, replace strings |
| `UrlInputStep.tsx` | Add t prop, create fallbacks, replace strings |

### Shared Components

| File | Changes |
|------|---------|
| `CameraPermissionFallback.tsx` | Add t prop, replace permission strings |

### Type Definition Files

| File | Changes |
|------|---------|
| `ItemCreationWorkflow.types.ts` | Add TranslationFunction, TranslatableProps |
| `ItemCapture.types.ts` | May need updates if step props are defined here |

### Translation Files

| File | Changes |
|------|---------|
| `en.json` | Add workflow.mediaCapture, videoCapture, photoCapture, fileUpload, textEditor, urlInput |
| `fr.json` | Add corresponding French translations |
| `es.json` | Add corresponding Spanish translations |
| `de.json` | Add corresponding German translations |
| `nl.json` | Add corresponding Dutch translations |
| `it.json` | Add corresponding Italian translations |

---

## Acceptance Criteria Checklist (From REQ-378)

### Imports and Setup
- [ ] MediaCaptureStep imports `useTranslations` hook from next-intl
- [ ] The workflow namespace is loaded using `useTranslations('workflow')`

### MediaCaptureStep Router Component
- [ ] All error headings use translation keys
- [ ] All error descriptions use translation keys with proper interpolation
- [ ] Button labels use translation keys

### Adapter Components
- [ ] VideoCaptureAdapter receives and passes translation function
- [ ] PhotoCaptureAdapter receives and passes translation function
- [ ] FileUploadAdapter receives and passes translation function
- [ ] TextEditorAdapter receives and passes translation function
- [ ] UrlInputAdapter receives and passes translation function
- [ ] Adapter interfaces are updated with proper typing

### Underlying Step Components
- [ ] All button labels use translation keys
- [ ] All aria-labels use translation keys
- [ ] All screen reader announcements use translation keys
- [ ] No hardcoded English strings remain in JSX or logic

### Functionality
- [ ] Component maintains functionality regardless of language
- [ ] Browser compatibility detection uses internal constants, not translated strings
- [ ] Error handling and retry logic function correctly with translated error messages

### Display and Layout
- [ ] Component displays correctly in all six supported languages
- [ ] Longer translated text does not cause layout breaks
- [ ] Button labels maintain consistent sizing
- [ ] Permission prompts display correctly without text clipping

### Quality
- [ ] Console shows no missing translation warnings
- [ ] TypeScript types correctly reflect translation props
- [ ] Existing unit tests pass or are updated appropriately

---

## Risk Mitigation

| Risk | Mitigation Applied |
|------|-------------------|
| Prop drilling complexity | Simple TranslationFunction type, consistent pattern |
| ItemCapture module coupling | Optional props with fallbacks for backwards compatibility |
| Layout breaks with long translations | Tasks 9.2 specifically tests German (40% longer) |
| Missing translations at runtime | Fallback translations in each step component |
| Breaking existing tests | Task 9.6 includes test mock updates |

---

## Dependencies and Order

Execute tasks in this order:

1. **Task 1** - Add translation keys (no code changes needed first)
2. **Task 3** - Create types (needed before adapter updates)
3. **Task 2** - Update MediaCaptureStep (uses Task 1 keys)
4. **Task 4** - Update adapters (uses Task 3 types)
5. **Task 5** - Update ItemCapture step components (uses Task 1 keys)
6. **Task 6** - Update shared components
7. **Task 7** - Wire translation function through
8. **Task 8** - Generate non-English translations
9. **Task 9** - Testing and validation

---

## References

- [Overview Document](/docs/REQ-378-update-mediacapturestep-and-adapters-overview.md)
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Requirements Document](/docs/gen_requests_epic2.md) - REQ-378
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2, Sub-Epic 2C - Item Creation Workflow, Task 2C.8*
