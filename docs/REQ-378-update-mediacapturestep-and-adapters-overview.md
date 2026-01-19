# REQ-378: Update MediaCaptureStep and Adapters for Internationalization

**Document Created**: 2026-01-19 15:45 UTC
**Last Modified**: 2026-01-19 15:45 UTC
**Type**: ENHANCEMENT
**Size**: M (Medium)
**Epic**: Epic 2 - Static UI Translation
**Sub-Epic**: 2C - Item Creation Workflow
**Task ID**: 2C.8

---

## Summary

The MediaCaptureStep component and its related media capture adapters (VideoCaptureAdapter, PhotoCaptureAdapter, FileUploadAdapter, TextEditorAdapter, UrlInputAdapter) must display all user-facing text in the user's selected language by implementing next-intl translations. This task is part of Epic 2's comprehensive localization effort covering 275+ components.

---

## Current State Analysis

### MediaCaptureStep.tsx (Router Component)
Located at: `/src/components/ItemCreationWorkflow/components/steps/MediaCaptureStep.tsx`

The MediaCaptureStep is a **router component** that directs users to appropriate media capture adapters based on `contentType` and `contentSource`. It contains hardcoded strings in two error state displays:

**Hardcoded Strings Identified:**
1. `"No Content Type Selected"` - Error heading when contentType is missing
2. `"Please go back and select a content type before proceeding."` - Error description
3. `"Go Back"` - Button label (appears twice)
4. `"Unsupported Content Type"` - Error heading for unknown content types
5. `"The content type \"{contentType}\" is not supported. Please go back and select a different option."` - Error description with interpolation

### Adapter Components

The five adapter components bridge the underlying ItemCapture step components with the ItemCreationWorkflow state. The adapters themselves contain **no hardcoded user-facing strings** - they are pure state/callback mapping layers. However, the underlying step components they render have extensive strings that need translation.

#### VideoCaptureAdapter.tsx
- Location: `/src/components/ItemCreationWorkflow/components/steps/adapters/VideoCaptureAdapter.tsx`
- **No hardcoded strings** - Pure adapter logic
- Renders: `VideoCaptureStep` from ItemCapture

#### PhotoCaptureAdapter.tsx
- Location: `/src/components/ItemCreationWorkflow/components/steps/adapters/PhotoCaptureAdapter.tsx`
- **No hardcoded strings** - Pure adapter logic
- Renders: `PhotoCaptureStep` from ItemCapture

#### FileUploadAdapter.tsx
- Location: `/src/components/ItemCreationWorkflow/components/steps/adapters/FileUploadAdapter.tsx`
- **No hardcoded strings** - Pure adapter logic
- Renders: `FileUploadStep` from ItemCapture

#### TextEditorAdapter.tsx
- Location: `/src/components/ItemCreationWorkflow/components/steps/adapters/TextEditorAdapter.tsx`
- **No hardcoded strings** - Pure adapter logic
- Renders: `TextEditorStep` from ItemCapture

#### UrlInputAdapter.tsx
- Location: `/src/components/ItemCreationWorkflow/components/steps/adapters/UrlInputAdapter.tsx`
- **No hardcoded strings** - Pure adapter logic
- Renders: `UrlInputStep` from ItemCapture

### Underlying Step Components (ItemCapture)

The actual user-facing strings are in the underlying step components. These components are part of the ItemCapture module and contain extensive hardcoded strings:

#### VideoCaptureStep.tsx (~45 strings)
Location: `/src/components/ItemCapture/components/steps/VideoCaptureStep.tsx`

**Identified Strings:**
- Error messages: "Camera access was denied", "Your browser does not support video recording", "Video recording failed", "No video data captured", "Failed to load video for playback", "Failed to process video"
- Error guidance: "Please enable camera access in your browser settings to record video.", "Camera access requires HTTPS. Please go back and use \"Upload Video\" instead, or access via HTTPS.", "Please check your camera and try again.", "Video saved but thumbnail generation failed.", "An unexpected error occurred. Please try again."
- Loading state: "Initializing camera..."
- Headers: "Review Your Video", "Recording Video", "Record Video"
- Instructions: "Play to review, then accept or retake", "Recording in progress - tap stop when finished", "Position your camera and tap record to start"
- Buttons: "Retake", "Accept", "Processing...", "Try Again", "Back"
- Status indicators: "REC"
- Aria labels: "Discard and record again", "Accept video", "Switch camera", "Start recording", "Stop recording"
- Screen reader announcements: "Recording started", "Recording stopped. Review your video.", "Retaking video. Ready to record.", "Processing video...", "{time} remaining"

#### PhotoCaptureStep.tsx (~50 strings)
Location: `/src/components/ItemCapture/components/steps/PhotoCaptureStep.tsx`

**Identified Strings:**
- Error messages: "Camera access was denied", "Your browser does not support photo capture", "Photo capture failed", "Failed to capture photo", "Failed to process photo", "Maximum of {maxPhotos} photos reached"
- Error guidance: "Please enable camera access in your browser settings to capture photos.", "Camera access requires HTTPS. Please go back and use \"Upload Photo\" instead, or access via HTTPS.", "Please check your camera and try again.", "You have reached the maximum of {maxPhotos} photos. Remove a photo to add more.", "Device storage is full. Please free up space and try again.", "An unexpected error occurred. Please try again."
- Loading state: "Initializing camera..."
- Headers: "Review Your Photo", "Capture Photos"
- Instructions: "Accept to add or retake for a new shot", "Tap the capture button to take photos ({count} / {maxPhotos})"
- Buttons: "Retake", "Accept", "Processing...", "Try Again", "Back", "Continue"
- Gallery: "Delete photo", "{index} of {total}", "Close gallery", "Previous photo", "Next photo", "Photo {index}"
- Thumbnail strip: "Captured photos", "Add"
- Aria labels: "Discard and capture again", "Accept photo", "Switch camera", "Capture photo", "Remove photo {index}", "Photo gallery"
- Screen reader announcements: "Photo captured. Review or retake.", "Retaking photo. Ready to capture.", "Processing photo...", "Photo added to collection.", "Photo removed.", "Switched to {camera} camera"
- Flash indicator: "Auto"

#### FileUploadStep.tsx (~35 strings)
Location: `/src/components/ItemCapture/components/steps/FileUploadStep.tsx`

**Identified Strings:**
- Headers: "Upload Files"
- Instructions: "Drag and drop files or click to select"
- Drop zone states: "Drop files here", "Invalid file type", "Add more files", "Drag files here or click to browse", "Supports images, videos, and PDF files", "Max {maxFiles} files, {maxFileSize} each"
- File info: "{pageCount} page(s)", "Password protected", "File may be damaged"
- Rejection messages: "{count} file(s) couldn't be added", "Dismiss"
- Progress: "{fileCount}/{maxFiles} files"
- Buttons: "Back", "Continue"
- Aria labels: "Remove {fileName}", "Dismiss error", "Upload size progress"
- Screen reader: "{count} files uploaded"

---

## Implementation Approach

### Architecture Decision: Translation Prop Passing

Since the adapters render underlying ItemCapture step components, there are two approaches:

**Option A: Modify Adapter Props (Recommended)**
- Add a translation function (`t`) prop to each adapter
- Pass the `t` function down to the underlying step components
- Requires modifying the step component interfaces to accept translations

**Option B: Direct Hook Usage in Step Components**
- Each ItemCapture step component calls `useTranslations` directly
- Cleaner component boundaries but increases coupling to i18n in the ItemCapture module

**Recommendation**: Option A is preferred as it:
1. Keeps i18n setup centralized in the workflow
2. Allows the ItemCapture module to remain reusable without i18n dependency
3. Follows the existing adapter pattern

### Translation Key Structure

Following the implementation plan's namespace convention:

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
    },
    "videoCapture": {
      "heading": "Record Video",
      "headingRecording": "Recording Video",
      "headingReview": "Review Your Video",
      "instructions": {
        "preview": "Position your camera and tap record to start",
        "recording": "Recording in progress - tap stop when finished",
        "review": "Play to review, then accept or retake"
      },
      "loading": "Initializing camera...",
      "status": {
        "recording": "REC",
        "processing": "Processing..."
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
      "announcements": {
        "recordingStarted": "Recording started",
        "recordingStopped": "Recording stopped. Review your video.",
        "retaking": "Retaking video. Ready to record.",
        "processing": "Processing video...",
        "timeRemaining": "{time} remaining",
        "switchedCamera": "Switched to {camera} camera"
      }
    },
    "photoCapture": {
      "heading": "Capture Photos",
      "headingReview": "Review Your Photo",
      "instructions": {
        "preview": "Tap the capture button to take photos ({count} / {maxPhotos})",
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
      "announcements": {
        "photoCaptured": "Photo captured. Review or retake.",
        "retaking": "Retaking photo. Ready to capture.",
        "processing": "Processing photo...",
        "photoAdded": "Photo added to collection.",
        "photoRemoved": "Photo removed.",
        "switchedCamera": "Switched to {camera} camera"
      }
    },
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
      "announcements": {
        "filesUploaded": "{count} files uploaded"
      }
    },
    "buttons": {
      "goBack": "Go Back",
      "back": "Back",
      "continue": "Continue",
      "cancel": "Cancel",
      "retry": "Retry"
    }
  }
}
```

---

## Ordered Implementation Tasks

### Task 1: Add Translation Keys to Message Files
**Priority**: Required
**Estimated Strings**: ~150

1. Add the `workflow.mediaCapture`, `workflow.videoCapture`, `workflow.photoCapture`, and `workflow.fileUpload` namespaces to `/messages/en.json`
2. Add corresponding translations to all 5 non-English language files (`fr.json`, `es.json`, `de.json`, `nl.json`, `it.json`)

### Task 2: Update MediaCaptureStep Component
**Priority**: Required
**Files**: 1

1. Import `useTranslations` from `next-intl`
2. Initialize translations with `const t = useTranslations('workflow.mediaCapture')`
3. Replace hardcoded error headings and descriptions with `t()` calls
4. Update button labels to use `t('buttons.goBack')` (can use `workflow.buttons` namespace)
5. Handle the interpolation for `contentType` in the unsupported type error message

### Task 3: Create Translation Props Interface
**Priority**: Required
**Files**: 1 (new types file or extend existing)

Create a shared interface for passing translations to adapters:
```typescript
interface MediaCaptureTranslations {
  t: (key: string, params?: Record<string, unknown>) => string;
}
```

### Task 4: Update Adapter Components
**Priority**: Required
**Files**: 5

For each adapter (VideoCaptureAdapter, PhotoCaptureAdapter, FileUploadAdapter, TextEditorAdapter, UrlInputAdapter):
1. Add translation prop to the adapter props interface
2. Pass the translation function to the underlying step component
3. Update TypeScript types to reflect the new prop

### Task 5: Update ItemCapture Step Components
**Priority**: Required
**Files**: 5 (in ItemCapture module)

For VideoCaptureStep, PhotoCaptureStep, FileUploadStep, TextEditorStep, UrlInputStep:
1. Add optional translation prop to component props interface
2. Create fallback English strings for backwards compatibility
3. Replace all hardcoded strings with translation function calls
4. Ensure all aria-labels and screen reader announcements use translations
5. Maintain existing functionality when translations are not provided

### Task 6: Update CameraPermissionFallback Component
**Priority**: Required
**Files**: 1

Location: `/src/components/ItemCapture/components/shared/CameraPermissionFallback.tsx`
1. Add translation prop
2. Update all hardcoded permission messages and button labels

### Task 7: Generate Non-English Translations
**Priority**: Required
**Files**: 5

Generate translations for all new keys in French, Spanish, German, Dutch, and Italian.

### Task 8: Testing and Validation
**Priority**: Required

1. Verify all strings render correctly in each language
2. Test layout with longer translations (German, French)
3. Verify screen reader announcements work in all languages
4. Test error states display translated messages
5. Verify no missing translation warnings in console

---

## Authorized Files and Functions for Modification

### Primary Files (MediaCaptureStep & Adapters)

| File Path | Authorized Functions/Sections |
|-----------|-------------------------------|
| `/src/components/ItemCreationWorkflow/components/steps/MediaCaptureStep.tsx` | `MediaCaptureStep` component, error state JSX |
| `/src/components/ItemCreationWorkflow/components/steps/adapters/VideoCaptureAdapter.tsx` | `VideoCaptureAdapterProps`, `VideoCaptureAdapter` component |
| `/src/components/ItemCreationWorkflow/components/steps/adapters/PhotoCaptureAdapter.tsx` | `PhotoCaptureAdapterProps`, `PhotoCaptureAdapter` component |
| `/src/components/ItemCreationWorkflow/components/steps/adapters/FileUploadAdapter.tsx` | `FileUploadAdapterProps`, `FileUploadAdapter` component |
| `/src/components/ItemCreationWorkflow/components/steps/adapters/TextEditorAdapter.tsx` | `TextEditorAdapterProps`, `TextEditorAdapter` component |
| `/src/components/ItemCreationWorkflow/components/steps/adapters/UrlInputAdapter.tsx` | `UrlInputAdapterProps`, `UrlInputAdapter` component |
| `/src/components/ItemCreationWorkflow/components/steps/adapters/index.ts` | Export statements (if exists) |

### ItemCapture Step Components

| File Path | Authorized Functions/Sections |
|-----------|-------------------------------|
| `/src/components/ItemCapture/components/steps/VideoCaptureStep.tsx` | `VideoCaptureStepProps`, all JSX strings, `getErrorGuidance`, `mapHookErrorToComponentError`, announce calls |
| `/src/components/ItemCapture/components/steps/PhotoCaptureStep.tsx` | `PhotoCaptureStepProps`, all JSX strings, `getErrorGuidance`, `mapHookErrorToComponentError`, announce calls |
| `/src/components/ItemCapture/components/steps/FileUploadStep.tsx` | `FileUploadStepProps`, all JSX strings, `ErrorDisplay`, `UploadProgress`, `FileCard`, `PDFFileCard` |
| `/src/components/ItemCapture/components/steps/TextEditorStep.tsx` | `TextEditorStepProps`, all JSX strings |
| `/src/components/ItemCapture/components/steps/UrlInputStep.tsx` | `UrlInputStepProps`, all JSX strings |

### Shared Components

| File Path | Authorized Functions/Sections |
|-----------|-------------------------------|
| `/src/components/ItemCapture/components/shared/CameraPermissionFallback.tsx` | `CameraPermissionFallbackProps`, all JSX strings |
| `/src/components/ItemCapture/components/shared/PDFPlaceholder.tsx` | All error message strings |
| `/src/components/ItemCapture/components/shared/PageCountBadge.tsx` | Display text if any |

### Translation Files

| File Path | Authorized Sections |
|-----------|---------------------|
| `/messages/en.json` | Add `workflow.mediaCapture`, `workflow.videoCapture`, `workflow.photoCapture`, `workflow.fileUpload` namespaces |
| `/messages/fr.json` | Add corresponding namespaces with French translations |
| `/messages/es.json` | Add corresponding namespaces with Spanish translations |
| `/messages/de.json` | Add corresponding namespaces with German translations |
| `/messages/nl.json` | Add corresponding namespaces with Dutch translations |
| `/messages/it.json` | Add corresponding namespaces with Italian translations |

### Type Definition Files

| File Path | Authorized Sections |
|-----------|---------------------|
| `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Add translation-related types if needed |
| `/src/components/ItemCapture/ItemCapture.types.ts` | Add translation prop types to step props interfaces |

---

## Dependencies

### From Epic 1 (Must Be Complete)
- next-intl package installed and configured
- IntlProvider wrapper in app layout
- Translation files structure in `/messages/`
- `useTranslations` hook available

### Component Dependencies
- MediaCaptureStep depends on all 5 adapters
- Adapters depend on ItemCapture step components
- Step components depend on shared components (CameraPermissionFallback, PDFPlaceholder)

---

## Acceptance Criteria

From REQ-378:

- [ ] MediaCaptureStep imports `useTranslations` hook from next-intl
- [ ] The workflow namespace is loaded using `useTranslations('workflow')`
- [ ] All error headings use translation keys
- [ ] All error descriptions use translation keys with proper interpolation
- [ ] VideoCaptureAdapter receives and passes translation function
- [ ] PhotoCaptureAdapter receives and passes translation function
- [ ] FileUploadAdapter receives and passes translation function
- [ ] All button labels use translation keys
- [ ] All aria-labels use translation keys
- [ ] All screen reader announcements use translation keys
- [ ] No hardcoded English strings remain in JSX or logic
- [ ] Component maintains functionality regardless of language
- [ ] Component displays correctly in all six supported languages
- [ ] Longer translated text does not cause layout breaks
- [ ] Console shows no missing translation warnings
- [ ] TypeScript types correctly reflect translation props
- [ ] Existing unit tests pass or are updated appropriately

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Prop drilling complexity | Medium | Low | Keep translation prop interface simple and consistent |
| ItemCapture module coupling | Low | Medium | Use optional props with fallbacks for backwards compatibility |
| Layout breaks with long translations | Medium | Medium | Test with German (40% longer) and use flexible CSS |
| Missing translations at runtime | Low | High | Implement fallback to English, add build-time checks |
| Breaking existing tests | Medium | Medium | Update test mocks to provide translation functions |

---

## Estimated Effort

| Task | Strings | Complexity | Estimate |
|------|---------|------------|----------|
| Task 1: Translation Keys | ~150 | Low | 1 hour |
| Task 2: MediaCaptureStep | 5 | Low | 30 min |
| Task 3: Translation Interface | N/A | Low | 15 min |
| Task 4: Adapter Updates | 0 (props only) | Low | 1 hour |
| Task 5: ItemCapture Steps | ~130 | High | 4 hours |
| Task 6: Shared Components | ~15 | Medium | 1 hour |
| Task 7: Non-English Translations | ~750 total | Medium | 2 hours |
| Task 8: Testing | N/A | Medium | 2 hours |
| **Total** | **~150 unique** | **Medium** | **~11.5 hours** |

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Document](/docs/gen_requests_epic2.md) - REQ-378
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2, Sub-Epic 2C - Item Creation Workflow*
