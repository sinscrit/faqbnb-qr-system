# Implementation Breakdown: REQ-E02-063 - Update MediaCaptureStep and Adapters

**Document Version:** 1.0
**Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E02-063
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.8
**Estimated Size:** L (Large)

---

## Overview

This document provides the implementation breakdown for updating the MediaCaptureStep router component and all its adapter components, plus the underlying ItemCapture step components they wrap, to use the i18n translation system.

**Scope:** This task covers a significant number of files because MediaCaptureStep routes to multiple adapters, which in turn wrap ItemCapture step components that contain hardcoded UI strings:

### Primary Components to Update:
1. **MediaCaptureStep.tsx** - Router component with error messages
2. **VideoCaptureAdapter.tsx** - Adapter (minimal strings)
3. **PhotoCaptureAdapter.tsx** - Adapter (minimal strings)
4. **FileUploadAdapter.tsx** - Adapter (minimal strings)
5. **TextEditorAdapter.tsx** - Adapter (minimal strings)
6. **UrlInputAdapter.tsx** - Adapter (minimal strings)

### Underlying ItemCapture Step Components (Heavy Localization):
7. **VideoCaptureStep.tsx** (~50+ hardcoded strings)
8. **PhotoCaptureStep.tsx** (~50+ hardcoded strings)
9. **FileUploadStep.tsx** (~30+ hardcoded strings)
10. **TextEditorStep.tsx** (~20+ hardcoded strings)
11. **UrlInputStep.tsx** (~40+ hardcoded strings)

### Shared Components:
12. **CameraPermissionFallback.tsx** (~15 hardcoded strings)

**Key Challenge:** The ItemCapture step components are self-contained modules with their own hardcoded strings. They do NOT receive translated strings from their parent adapters - they render their own UI directly. Therefore, each underlying step component must be updated individually to use `useTranslations`.

---

## Dependencies

### Prerequisites (Epic 1 Foundation)
| Dependency | Location | Status |
|------------|----------|--------|
| next-intl package | `package.json` | Required |
| i18n config | `/src/lib/i18n/config.ts` | Complete |
| Translation files | `/messages/en.json` | Complete (base structure exists) |
| useTranslations hook | next-intl | Available |

### Prerequisites (Epic 2 - Prior Tasks)
| Dependency | Task | Status |
|------------|------|--------|
| `workflow` namespace structure | REQ-E02-056 (Task 2C.1) | Required - Must be complete |
| Main ItemCreationWorkflow updated | REQ-E02-057 (Task 2C.2) | Recommended |
| ContentTypeStep updated | REQ-E02-062 (Task 2C.7) | Recommended - Previous step in sequence |

### Existing Patterns to Follow
- Translation file structure in `/messages/en.json` (common, auth, dashboard, workflow namespaces)
- Key naming convention: `{namespace}.{component/area}.{element}.{variant?}`
- ICU message format for pluralization and interpolation
- Client component pattern using `useTranslations` hook
- Error guidance pattern from VideoCaptureStep and PhotoCaptureStep

---

## Technical Context

### Current State Analysis

The MediaCaptureStep is a router component that directs to appropriate capture adapters based on `contentType` and `contentSource`. The adapters then wrap the underlying ItemCapture step components.

#### Component Architecture

```
MediaCaptureStep.tsx (router)
├── VideoCaptureAdapter.tsx
│   └── ItemCapture/VideoCaptureStep.tsx (heavy localization)
├── PhotoCaptureAdapter.tsx
│   └── ItemCapture/PhotoCaptureStep.tsx (heavy localization)
├── FileUploadAdapter.tsx
│   └── ItemCapture/FileUploadStep.tsx (heavy localization)
├── TextEditorAdapter.tsx
│   └── ItemCapture/TextEditorStep.tsx (heavy localization)
└── UrlInputAdapter.tsx
    └── ItemCapture/UrlInputStep.tsx (heavy localization)

Shared:
└── ItemCapture/CameraPermissionFallback.tsx (used by Video/Photo capture)
```

### Identified Hardcoded Strings by Component

#### 1. MediaCaptureStep.tsx (Router)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 75-76 | `"No Content Type Selected"` | `workflow.steps.mediaCapture.errors.noContentType.title` |
| 78-79 | `"Please go back and select a content type..."` | `workflow.steps.mediaCapture.errors.noContentType.message` |
| 84 | `"Go Back"` | `common.actions.goBack` |
| 133-134 | `"Unsupported Content Type"` | `workflow.steps.mediaCapture.errors.unsupportedType.title` |
| 136-137 | `'The content type "{contentType}" is not supported...'` | `workflow.steps.mediaCapture.errors.unsupportedType.message` |

#### 2. VideoCaptureStep.tsx (~50 strings)
| Category | Strings |
|----------|---------|
| Headers | "Recording Video", "Record Video", "Review Your Video" |
| Subtitles | "Recording in progress - tap stop when finished", "Position your camera and tap record to start", "Play to review, then accept or retake" |
| Buttons | "Try Again", "Retake", "Accept", "Back" |
| States | "Processing...", "Initializing camera..." |
| Accessibility | "Start recording", "Stop recording", "Switch camera", "Discard and record again", "Accept video" |
| Error Messages | "Camera access was denied", "Your browser does not support video recording", "Video recording failed", "No video data captured", "Failed to start recording" |
| Error Guidance | "Please enable camera access...", "Camera access requires HTTPS...", "Please check your camera and try again", "Video saved but thumbnail generation failed" |
| Timer | "REC", "{time} remaining" |

#### 3. PhotoCaptureStep.tsx (~50 strings)
| Category | Strings |
|----------|---------|
| Headers | "Capture Photos", "Review Your Photo" |
| Subtitles | "Tap the capture button to take photos ({count} / {max})", "Accept to add or retake for a new shot" |
| Buttons | "Retake", "Accept", "Back", "Continue" |
| States | "Processing...", "Initializing camera..." |
| Gallery | "Photo gallery", "Delete photo", "Close gallery", "{current} of {total}", "Previous photo", "Next photo" |
| Thumbnail Strip | "Captured photos", "Remove photo {index}", "Photo {index}", "Add" |
| Accessibility | "Capture photo", "Switch camera" |
| Flash | "Auto" |
| Error Messages | "Camera access was denied", "Your browser does not support photo capture", "Photo capture failed", "Maximum of {max} photos reached", "Device storage is full" |
| Error Guidance | "Please enable camera access...", "Camera access requires HTTPS...", etc. |

#### 4. FileUploadStep.tsx (~30 strings)
| Category | Strings |
|----------|---------|
| Headers | "Upload Files" |
| Subtitles | "Drag and drop files or click to select" |
| Drop Zone | "Drop files here", "Invalid file type", "Add more files", "Drag files here or click to browse", "Supports images, videos, and PDF files", "Max {count} files, {size} each" |
| Progress | "{count}/{max} files", "{size} / {maxSize}" |
| Error Display | "{count} file(s) couldn't be added", "Dismiss" |
| PDF Status | "Password protected", "File may be damaged", "{count} page(s)" |
| Buttons | "Back", "Continue" |
| Accessibility | "Remove {filename}", "Upload size progress" |
| Screen Reader | "{count} files uploaded" |

#### 5. TextEditorStep.tsx (~20 strings)
| Category | Strings |
|----------|---------|
| Headers | "Write Guide" |
| Subtitles | "Add text-based guide using markdown formatting" |
| Toolbar | "Bold (Ctrl+B)", "Italic (Ctrl+I)", "Heading 1/2/3", "Bullet List", "Numbered List", "Insert Link (Ctrl+K)" |
| Tabs | "Editor", "Preview" |
| Placeholder | "Write your item guide here using markdown formatting..." |
| Preview | "Preview", "Start typing to see a preview of your formatted content..." |
| Character Counter | "{current} / {max} characters" |
| Error | "Content exceeds the maximum character limit. Please shorten your text." |
| Buttons | "Back", "Continue" |
| Save Indicator | "Saving..." |

#### 6. UrlInputStep.tsx (~40 strings)
| Category | Strings |
|----------|---------|
| Headers | "Add Link" |
| Subtitles | "Add a URL to your item. We'll fetch the title and preview automatically." |
| Labels | "URL" |
| Placeholder | "https://www.youtube.com/watch?v=..." |
| Buttons | "Paste", "Fetch Preview", "Add Link", "Add Link Anyway", "Try Another", "Cancel", "Back" |
| Network Error | "Preview unavailable", "Unable to load preview due to network connectivity issues.", "Try Again", "Retrying...", "Proceed Without Preview" |
| Preview States | "Preview loaded", "Fetching preview...", "Proceeding without preview" |
| Preview Info | "The link will be added without a preview. You can edit the title later." |
| Accessibility | "Clear URL" |
| Errors | "Invalid URL", "Failed to fetch URL metadata", "Unable to read clipboard. Please paste manually." |

#### 7. CameraPermissionFallback.tsx (~15 strings)
| Category | Strings |
|----------|---------|
| Title | "Camera access denied" |
| Explanation | "To capture a {contentType}, please allow camera access in your browser settings, or upload an existing {contentType} from your device." |
| Buttons | "Upload Video Instead", "Upload Photo Instead", "Try Camera Again" |
| Link | "How to enable camera access" |

---

## Implementation Tasks

### Phase 1: MediaCaptureStep Router and Adapters

#### Task 1: Update MediaCaptureStep Router
**Priority:** Critical
**Estimate:** 0.5 story points
**File:** `/src/components/ItemCreationWorkflow/components/steps/MediaCaptureStep.tsx`

**Changes:**
1. Add `useTranslations` import from 'next-intl'
2. Initialize hook: `const t = useTranslations('workflow.steps.mediaCapture');`
3. Replace "No Content Type Selected" with `t('errors.noContentType.title')`
4. Replace the message with `t('errors.noContentType.message')`
5. Replace "Go Back" with `t('common.actions.goBack')` or a common key
6. Replace "Unsupported Content Type" with `t('errors.unsupportedType.title')`
7. Replace the unsupported type message with `t('errors.unsupportedType.message', { contentType })`

**Acceptance Criteria:**
- [ ] useTranslations hook imported and initialized
- [ ] All error states use translation keys
- [ ] Variable interpolation works for contentType

---

### Phase 2: Underlying ItemCapture Step Components

#### Task 2: Update VideoCaptureStep Component
**Priority:** Critical
**Estimate:** 1.5 story points
**File:** `/src/components/ItemCapture/components/steps/VideoCaptureStep.tsx`

**Changes:**
1. Add `useTranslations` import
2. Initialize: `const t = useTranslations('workflow.steps.videoCapture');`
3. Update `getErrorGuidance` function to use translations
4. Update `mapHookErrorToComponentError` to use translations
5. Replace all header text (preview mode, recording mode, review mode)
6. Replace all subtitle text
7. Replace all button labels
8. Replace all aria-labels
9. Replace timer labels ("REC", formatting)
10. Replace processing/loading states

**Hardcoded Strings to Extract:**
```
- "Recording Video" / "Record Video"
- "Recording in progress - tap stop when finished"
- "Position your camera and tap record to start"
- "Review Your Video"
- "Play to review, then accept or retake"
- "Camera access was denied"
- "Your browser does not support video recording"
- "Video recording failed"
- "Failed to start recording"
- "No video data captured"
- "Try Again"
- "Retake"
- "Accept"
- "Processing..."
- "Back"
- "Initializing camera..."
- "REC"
- "{time} remaining"
- "Start recording" (aria-label)
- "Stop recording" (aria-label)
- "Switch camera" (aria-label)
- "Discard and record again" (aria-label)
- "Accept video" (aria-label)
- Error guidance strings (5+)
```

**Acceptance Criteria:**
- [ ] All UI strings extracted to translation keys
- [ ] Error messages properly localized with appropriate guidance
- [ ] Aria-labels fully localized
- [ ] Timer and status displays localized
- [ ] Dynamic values (time remaining) use ICU format

#### Task 3: Update PhotoCaptureStep Component
**Priority:** Critical
**Estimate:** 1.5 story points
**File:** `/src/components/ItemCapture/components/steps/PhotoCaptureStep.tsx`

**Changes:**
1. Add `useTranslations` import
2. Initialize: `const t = useTranslations('workflow.steps.photoCapture');`
3. Update `getErrorGuidance` function with maxPhotos interpolation
4. Update all mode-specific headers and subtitles
5. Update gallery navigation and controls
6. Update thumbnail strip labels
7. Update all aria-labels

**Hardcoded Strings to Extract:**
```
- "Capture Photos"
- "Tap the capture button to take photos ({count} / {max})"
- "Review Your Photo"
- "Accept to add or retake for a new shot"
- "Photo gallery" (aria-label)
- "Delete photo" (aria-label)
- "Close gallery" (aria-label)
- "{current} of {total}"
- "Previous photo" / "Next photo"
- "Captured photos" (aria-label)
- "Photo {index}" (aria-label)
- "Remove photo {index}" (aria-label)
- "Add" (thumbnail placeholder)
- "Auto" (flash indicator)
- "Retake", "Accept", "Back", "Continue"
- "Processing..."
- "Initializing camera..."
- "Capture photo" (aria-label)
- "Switch camera" (aria-label)
- Error messages and guidance strings (~8)
```

**Acceptance Criteria:**
- [ ] All UI strings extracted to translation keys
- [ ] Counter display uses ICU format for pluralization
- [ ] Gallery navigation fully localized
- [ ] All aria-labels properly translated

#### Task 4: Update FileUploadStep Component
**Priority:** Critical
**Estimate:** 1.0 story points
**File:** `/src/components/ItemCapture/components/steps/FileUploadStep.tsx`

**Changes:**
1. Add `useTranslations` import
2. Initialize: `const t = useTranslations('workflow.steps.fileUpload');`
3. Update drop zone text (all states: default, drag valid, drag invalid, has files)
4. Update file size formatting to use translated unit strings
5. Update PDF card states (password protected, corrupt, page count)
6. Update error display
7. Update progress display

**Hardcoded Strings to Extract:**
```
- "Upload Files"
- "Drag and drop files or click to select"
- "Drop files here"
- "Invalid file type"
- "Add more files"
- "Drag files here or click to browse"
- "Supports images, videos, and PDF files"
- "Max {count} files, {size} each"
- "{count}/{max} files"
- "{count} file(s) couldn't be added"
- "Dismiss"
- "Password protected"
- "File may be damaged"
- "{count} page(s)"
- "Back", "Continue"
- "Remove {filename}" (aria-label)
- "{count} files uploaded" (sr-only)
```

**Acceptance Criteria:**
- [ ] All drop zone states localized
- [ ] File count and size displays use proper formatting
- [ ] PDF status messages localized
- [ ] Error rejection list localized

#### Task 5: Update TextEditorStep Component
**Priority:** High
**Estimate:** 0.75 story points
**File:** `/src/components/ItemCapture/components/steps/TextEditorStep.tsx`

**Changes:**
1. Add `useTranslations` import
2. Initialize: `const t = useTranslations('workflow.steps.textEditor');`
3. Update TOOLBAR_BUTTONS ariaLabel values (or access via t())
4. Update header and subtitle
5. Update tab labels
6. Update placeholder text
7. Update preview empty state
8. Update character counter
9. Update error message

**Hardcoded Strings to Extract:**
```
- "Write Guide"
- "Add text-based guide using markdown formatting"
- Toolbar buttons: "Bold (Ctrl+B)", "Italic (Ctrl+I)", "Heading 1/2/3", "Bullet List", "Numbered List", "Insert Link (Ctrl+K)"
- "Editor", "Preview" (tabs)
- "Write your item guide here using markdown formatting..." (placeholder)
- "Preview" (header)
- "Start typing to see a preview of your formatted content..."
- "{current} / {max} characters"
- "Content exceeds the maximum character limit. Please shorten your text."
- "Saving..."
- "Back", "Continue"
```

**Note:** TOOLBAR_BUTTONS is a constant defined outside the component. The pattern should be to use t() inside the render, not in the constant.

**Acceptance Criteria:**
- [ ] All header/subtitle text localized
- [ ] Toolbar button labels localized (aria-labels)
- [ ] Tab switcher labels localized
- [ ] Character counter with proper number formatting
- [ ] Validation error message localized

#### Task 6: Update UrlInputStep Component
**Priority:** High
**Estimate:** 1.0 story points
**File:** `/src/components/ItemCapture/components/steps/UrlInputStep.tsx`

**Changes:**
1. Add `useTranslations` import
2. Initialize: `const t = useTranslations('workflow.steps.urlInput');`
3. Update header and description
4. Update input label and placeholder
5. Update all button labels
6. Update network error panel (all text)
7. Update preview card states
8. Update error messages

**Hardcoded Strings to Extract:**
```
- "Add Link"
- "Add a URL to your item. We'll fetch the title and preview automatically."
- "URL" (label)
- "https://www.youtube.com/watch?v=..." (placeholder)
- "Paste", "Fetch Preview"
- "Preview unavailable", "Unable to load preview due to network connectivity issues."
- "Try Again", "Retrying...", "Proceed Without Preview"
- "Preview loaded"
- "Proceeding without preview"
- "The link will be added without a preview. You can edit the title later."
- "Add Link", "Add Link Anyway", "Try Another", "Cancel"
- "Back"
- "Clear URL" (aria-label)
- "Invalid URL", "Failed to fetch URL metadata", "Unable to read clipboard. Please paste manually."
```

**Acceptance Criteria:**
- [ ] All static text localized
- [ ] Network error recovery UI fully localized
- [ ] Preview states (loading, success, failure) localized
- [ ] Aria-labels localized

---

### Phase 3: Shared Components

#### Task 7: Update CameraPermissionFallback Component
**Priority:** Critical
**Estimate:** 0.5 story points
**File:** `/src/components/ItemCapture/components/shared/CameraPermissionFallback.tsx`

**Changes:**
1. Add `useTranslations` import
2. Initialize: `const t = useTranslations('workflow.shared.cameraPermission');`
3. Remove CONTENT_TYPE_LABELS and CONTENT_TYPE_FILE_LABELS constants
4. Use translation keys with contentType variable interpolation
5. Update all button labels and help link

**Hardcoded Strings to Extract:**
```
- "Camera access denied"
- "To capture a {contentType}, please allow camera access in your browser settings, or upload an existing {contentType} from your device."
- "Upload Video Instead" / "Upload Photo Instead"
- "Try Camera Again"
- "How to enable camera access"
```

**Acceptance Criteria:**
- [ ] Title and explanation localized
- [ ] Dynamic contentType interpolation works
- [ ] Button labels adapt to video/photo context
- [ ] External link text localized

---

### Phase 4: Translation File Updates

#### Task 8: Add All Translation Keys to Messages File
**Priority:** Critical
**Estimate:** 1.0 story points
**File:** `/messages/en.json`

**Structure:**
```json
{
  "workflow": {
    "steps": {
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
      },
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
          }
        }
      },
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
          "acceptPhoto": "Accept photo"
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
          "maxPhotosReached": {
            "message": "Maximum of {max} photos reached",
            "guidance": "You have reached the maximum of {max} photos. Remove a photo to add more."
          },
          "storageFull": {
            "message": "Device storage is full",
            "guidance": "Please free up space and try again."
          }
        }
      },
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
      },
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
      },
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
    },
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
  }
}
```

**Acceptance Criteria:**
- [ ] All required keys exist in `/messages/en.json`
- [ ] Keys follow established naming convention
- [ ] ICU format used for pluralization and interpolation
- [ ] JSON file validates without syntax errors
- [ ] Build completes without missing translation warnings

---

## Authorized Files and Functions for Modification

### Primary Files to Modify

| File | Purpose | Modification Type |
|------|---------|-------------------|
| `/src/components/ItemCreationWorkflow/components/steps/MediaCaptureStep.tsx` | Router component | Add useTranslations, replace error strings |
| `/src/components/ItemCreationWorkflow/components/steps/adapters/VideoCaptureAdapter.tsx` | Video adapter | No changes needed (passes through to step) |
| `/src/components/ItemCreationWorkflow/components/steps/adapters/PhotoCaptureAdapter.tsx` | Photo adapter | No changes needed (passes through to step) |
| `/src/components/ItemCreationWorkflow/components/steps/adapters/FileUploadAdapter.tsx` | File adapter | No changes needed (passes through to step) |
| `/src/components/ItemCreationWorkflow/components/steps/adapters/TextEditorAdapter.tsx` | Text adapter | No changes needed (passes through to step) |
| `/src/components/ItemCreationWorkflow/components/steps/adapters/UrlInputAdapter.tsx` | URL adapter | No changes needed (passes through to step) |
| `/src/components/ItemCapture/components/steps/VideoCaptureStep.tsx` | Video capture UI | Heavy localization (~50 strings) |
| `/src/components/ItemCapture/components/steps/PhotoCaptureStep.tsx` | Photo capture UI | Heavy localization (~50 strings) |
| `/src/components/ItemCapture/components/steps/FileUploadStep.tsx` | File upload UI | Heavy localization (~30 strings) |
| `/src/components/ItemCapture/components/steps/TextEditorStep.tsx` | Text editor UI | Medium localization (~20 strings) |
| `/src/components/ItemCapture/components/steps/UrlInputStep.tsx` | URL input UI | Heavy localization (~40 strings) |
| `/src/components/ItemCapture/components/shared/CameraPermissionFallback.tsx` | Camera permission fallback | Medium localization (~15 strings) |
| `/messages/en.json` | English translations | Add all workflow.steps.* keys |

### Functions to Modify

| Function/Section | File | Modification |
|------------------|------|--------------|
| MediaCaptureStep component | MediaCaptureStep.tsx | Add useTranslations, replace error strings |
| `getErrorGuidance` | VideoCaptureStep.tsx | Use translation keys |
| `mapHookErrorToComponentError` | VideoCaptureStep.tsx | Use translation keys for messages |
| VideoCaptureStep component render | VideoCaptureStep.tsx | Replace all JSX strings |
| `getErrorGuidance` | PhotoCaptureStep.tsx | Use translation keys with maxPhotos |
| PhotoCaptureStep component render | PhotoCaptureStep.tsx | Replace all JSX strings |
| FileUploadStep component render | FileUploadStep.tsx | Replace all JSX strings |
| ErrorDisplay subcomponent | FileUploadStep.tsx | Use translation keys |
| PDFFileCard subcomponent | FileUploadStep.tsx | Use translation keys |
| UploadProgress subcomponent | FileUploadStep.tsx | Use translation keys |
| CharacterCounter subcomponent | TextEditorStep.tsx | Use translation keys |
| TabSwitcher subcomponent | TextEditorStep.tsx | Use translation keys |
| TextEditorStep component render | TextEditorStep.tsx | Replace all JSX strings |
| UrlInputStep component render | UrlInputStep.tsx | Replace all JSX strings |
| CameraPermissionFallback render | CameraPermissionFallback.tsx | Replace all JSX strings |

### Files for Reference Only (Not Modified in This Task)

| File | Purpose |
|------|---------|
| `/src/lib/i18n/config.ts` | i18n configuration (read-only reference) |
| `/src/components/ItemCapture/ItemCapture.types.ts` | Type definitions |
| `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Workflow type definitions |
| `/src/components/ItemCapture/hooks/useMediaCapture.ts` | Media capture hook (no UI strings) |
| `/src/components/ItemCapture/hooks/useFileUpload.ts` | File upload hook (no UI strings) |

---

## Verification Steps

### 1. Build Verification
```bash
npm run build
```
- Verify no TypeScript errors related to translation types
- Verify no missing translation key warnings

### 2. Runtime Verification
- Start development server: `npm run dev`
- Navigate through item creation workflow
- Test each content type (video, photo, file upload, text, URL)
- Open browser console, verify no translation-related errors

### 3. Functional Testing by Component

**VideoCaptureStep:**
- Test camera preview mode displays correct header/subtitle
- Test recording mode shows "REC" indicator and timer
- Test review mode shows correct header/subtitle
- Test error states (permission denied, unsupported browser)
- Test all buttons and aria-labels

**PhotoCaptureStep:**
- Test photo count display "{count} / {max}"
- Test review mode after capture
- Test gallery mode (navigation, counter, delete)
- Test thumbnail strip labels
- Test flash indicator
- Test max photos reached error

**FileUploadStep:**
- Test drop zone in all states (default, drag valid, drag invalid, has files)
- Test file count and size progress
- Test PDF card states (password protected, corrupted, page count)
- Test rejection error display
- Test screen reader announcements

**TextEditorStep:**
- Test toolbar button labels (hover/aria)
- Test tab labels (Editor/Preview)
- Test character counter
- Test character limit error
- Test saving indicator

**UrlInputStep:**
- Test header and description
- Test network error recovery UI
- Test preview states (loading, success, no preview)
- Test all button labels

**CameraPermissionFallback:**
- Test with contentType="video"
- Test with contentType="photo"
- Verify explanation text interpolates correctly

### 4. Accessibility Testing
- Use screen reader to verify all aria-labels are announced correctly
- Test keyboard navigation in all components
- Verify focus management after state changes

### 5. Language Switching Test
- Change browser language or use language switcher (if available)
- Verify all strings update in all components
- Verify no mixed-language content

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Large number of files to modify | High | High | Break into phases; do ItemCapture steps first, then verify |
| Missing translation keys in build | Medium | High | Test build after each major component update |
| Error messages broken in production | Medium | High | Comprehensive error state testing |
| Dynamic interpolation bugs | Medium | Medium | Test all variable interpolations (counts, types, sizes) |
| Subcomponent translations missed | Medium | Medium | Audit each file for inline subcomponents |
| Constant definitions need refactoring | Medium | Medium | Move constants inside component or use t() in render |
| Performance impact from multiple useTranslations calls | Low | Low | Use namespaced hooks; next-intl handles this efficiently |

---

## Notes for Implementation

### 1. Component-Level Hook Pattern
Each component that renders UI strings needs its own `useTranslations` hook call. The adapters don't need translation hooks because they don't render UI directly - they pass through to the step components.

### 2. Helper Function Translation Pattern
Functions like `getErrorGuidance` that return strings need access to the translation function. Two approaches:
- Pass `t` as parameter: `getErrorGuidance(code, t)`
- Move the function inside the component to access `t` from closure

### 3. Constants with Strings Pattern
Constants defined outside components (like `TOOLBAR_BUTTONS` in TextEditorStep) that contain UI strings should either:
- Be moved inside the component
- Have their labels accessed via `t()` in the render

### 4. ICU Message Format
Use ICU format for:
- Pluralization: `{count, plural, one {# file} other {# files}}`
- Variable interpolation: `"{contentType}"`
- Number formatting: Use Intl.NumberFormat for file sizes

### 5. File Size Formatting
The `formatFileSize` utility function should remain unchanged (it formats bytes to KB/MB/GB). The unit strings (KB, MB, GB) are standard and don't need translation.

### 6. Coordination with REQ-E02-062
This task follows directly after REQ-E02-062 (ContentTypeStep). The user selects content type, then proceeds to media capture. Ensure consistent button labels (Back, Continue) across steps.

### 7. Testing Multiple Capture Types
The MediaCaptureStep routes to different adapters. Test all paths:
- contentSource: 'create-new' + contentType: 'video' → VideoCaptureAdapter
- contentSource: 'create-new' + contentType: 'photo' → PhotoCaptureAdapter
- contentSource: 'create-new' + contentType: 'text' → TextEditorAdapter
- contentSource: 'create-new' + contentType: 'url' → UrlInputAdapter
- contentSource: 'existing' (any type) → FileUploadAdapter

---

## Acceptance Criteria Summary

From the request document (REQ-E02-063):

- [ ] MediaCaptureStep router error messages are localized
- [ ] VideoCaptureStep has all UI strings extracted (~50 strings)
- [ ] PhotoCaptureStep has all UI strings extracted (~50 strings)
- [ ] FileUploadStep has all UI strings extracted (~30 strings)
- [ ] TextEditorStep has all UI strings extracted (~20 strings)
- [ ] UrlInputStep has all UI strings extracted (~40 strings)
- [ ] CameraPermissionFallback has all UI strings extracted (~15 strings)
- [ ] All error messages and guidance text are properly localized
- [ ] All aria-labels and accessibility strings are localized
- [ ] Dynamic values (counts, file sizes, content types) use proper interpolation
- [ ] All components use appropriate i18n hooks (useTranslations)
- [ ] Components render correctly with translations in all supported languages
- [ ] No hardcoded English strings remain in any component code
- [ ] Translation keys follow established naming convention

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [REQ-E02-056: Create Workflow Namespace Structure](/docs/REQ-E02-056-create-workflow-namespace-structure-overview.md)
- [REQ-E02-062: Update ContentTypeStep](/docs/REQ-E02-062-update-contenttypestep-overview.md)
- [Request Documentation](/docs/gen_requests_epic2.md#REQ-E02-063)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2C: Item Creation Workflow*
