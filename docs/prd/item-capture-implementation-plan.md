# Implementation Plan: ItemCapture Component

**Generated:** 2025-12-30T12:45:00
**Last Modified:** 2025-12-31T03:05:00
**PRD Reference:** `/docs/prd/item-capture-prd.md`

---

## Overview

This plan details the implementation of `ItemCapture`, a standalone, self-contained React component for capturing instructional content (video, photo, file uploads, text) about household items. The component follows a "props in, callback out" architecture with zero backend dependencies, enabling property owners to create rich media content that will later be persisted by the parent application.

The implementation leverages the existing Next.js 15 + React 19 + TypeScript + Tailwind CSS stack, introducing new browser media APIs (MediaDevices, MediaRecorder) while maintaining consistency with established codebase patterns.

---

## Technical Context

### Existing Stack

| Technology | Version/Details | Source |
|------------|-----------------|--------|
| Framework | Next.js 15.4.2 with Turbopack | `package.json` |
| React | 19.1.0 | `package.json` |
| Language | TypeScript 5.x (strict mode) | `tsconfig.json` |
| Styling | Tailwind CSS 4.x | `tailwind.config.js`, `globals.css` |
| Icons | Lucide React 0.525.0 | `package.json` |
| Path Aliases | `@/*` maps to `./src/*` | `tsconfig.json` |
| UI Primitives | Radix UI (dialog, dropdown, toast) | `package.json` |
| Utility Library | clsx + tailwind-merge via `cn()` | `src/lib/utils.ts` |

### Established Patterns (Observed in Codebase)

| Pattern | Example File | Notes |
|---------|--------------|-------|
| Client components | `'use client'` directive | All 40 components in `/src/components/` use this |
| Form state management | `src/components/ItemForm.tsx` | useState for form data, validation errors object |
| Props interface | `src/components/RegistrationForm.tsx` | Interface defined above component |
| Modal pattern | `src/components/ConfirmationModal.tsx` | Fixed overlay with centered white card |
| UUID generation | `src/components/ItemForm.tsx:9-14` | Custom generateUUID() function |
| Type exports | `src/types/index.ts` | Central type definitions with re-exports |
| Utility functions | `src/lib/utils.ts` | `cn()` for class merging, validation helpers |

### New Dependencies Required

| Library | Purpose | Size Impact | Alternative Considered | Recommendation |
|---------|---------|-------------|------------------------|----------------|
| None (native APIs) | Video/Photo capture | 0 KB | react-webcam (~15KB) | Use native MediaDevices API for smaller bundle and better control |
| react-image-crop | Photo cropping | ~45 KB gzipped | browser-image-compression, manual canvas | Recommended - mature, accessible, mobile-friendly |
| @ffmpeg/ffmpeg | Video trimming | ~25 MB (wasm) | Native MediaRecorder (no trim) | **Defer to V2** - use start/stop for "trim" in V1 |
| react-markdown | Markdown preview | ~12 KB gzipped | marked + sanitize-html | Recommended - React-native, XSS-safe |
| pdfjs-dist | PDF thumbnail generation | ~500 KB | Rely on first-page-as-image service | Recommended for offline-first requirement |

**Dependency Decision Summary:**
- Phase 1: Native APIs only (zero new deps)
- Phase 2: Add react-image-crop + react-markdown
- Phase 3: Add pdfjs-dist for PDF thumbnails
- V2: Consider @ffmpeg/ffmpeg for advanced video editing

---

## Architecture

### Component Hierarchy

```
ItemCapture/
├── index.ts                          # Public export: ItemCapture, ItemCaptureProps, ItemRecord
├── ItemCapture.tsx                   # Main orchestrator component
├── ItemCapture.types.ts              # All TypeScript interfaces
├── hooks/
│   ├── useMediaCapture.ts            # Camera/mic access, video recording, photo capture
│   ├── useFileUpload.ts              # File picker, drag-drop, validation
│   ├── useMediaEditor.ts             # Crop, rotate, trim operations
│   └── useItemCaptureState.ts        # Central state machine for wizard flow
├── components/
│   ├── CaptureWizard.tsx             # Step navigation container
│   ├── steps/
│   │   ├── MetadataStep.tsx          # Title, location, tags, appliance type
│   │   ├── ContentTypeStep.tsx       # Video/Photo/Text/Upload selection
│   │   ├── VideoCaptureStep.tsx      # Video recording UI
│   │   ├── PhotoCaptureStep.tsx      # Photo capture UI
│   │   ├── FileUploadStep.tsx        # File upload UI
│   │   ├── TextEditorStep.tsx        # Markdown editor with preview
│   │   ├── MediaEditorStep.tsx       # Crop/rotate/trim editor
│   │   └── ReviewStep.tsx            # Final review and submit
│   ├── shared/
│   │   ├── CameraPreview.tsx         # Live camera feed component
│   │   ├── MediaThumbnail.tsx        # Thumbnail display for media items
│   │   ├── ProgressIndicator.tsx     # Recording timer, upload progress
│   │   ├── StepNavigation.tsx        # Back/Next/Cancel buttons
│   │   └── ValidationMessage.tsx     # Error/warning display
│   └── editors/
│       ├── ImageCropper.tsx          # Wrapper around react-image-crop
│       ├── ImageRotator.tsx          # 90-degree rotation controls
│       ├── VideoTrimmer.tsx          # Start/end point selection (V1: simplified)
│       └── MarkdownEditor.tsx        # Text editor with toolbar
└── utils/
    ├── mediaConstraints.ts           # Browser-specific media constraints
    ├── fileValidation.ts             # MIME type, size validation
    ├── thumbnailGenerator.ts         # Canvas-based thumbnail creation
    └── constants.ts                  # Max durations, sizes, supported formats
```

### State Management Architecture

The component uses a **reducer-based state machine** for predictable state transitions:

```typescript
// Simplified state machine
type WizardStep =
  | 'metadata'
  | 'content-type'
  | 'capture-video' | 'capture-photo' | 'upload-file' | 'write-text'
  | 'edit-media'
  | 'add-more'
  | 'review';

interface ItemCaptureState {
  currentStep: WizardStep;
  metadata: ItemMetadata;
  mediaItems: MediaItem[];
  instructions: string;
  errors: Record<string, string>;
  isRecording: boolean;
  isCameraActive: boolean;
}

type ItemCaptureAction =
  | { type: 'SET_METADATA'; payload: Partial<ItemMetadata> }
  | { type: 'ADD_MEDIA'; payload: MediaItem }
  | { type: 'REMOVE_MEDIA'; payload: string } // by id
  | { type: 'REORDER_MEDIA'; payload: { id: string; newOrder: number } }
  | { type: 'UPDATE_MEDIA'; payload: { id: string; updates: Partial<MediaItem> } }
  | { type: 'SET_INSTRUCTIONS'; payload: string }
  | { type: 'GO_TO_STEP'; payload: WizardStep }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_ERROR'; payload: { field: string; message: string } }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'START_RECORDING' }
  | { type: 'STOP_RECORDING' }
  | { type: 'ACTIVATE_CAMERA' }
  | { type: 'DEACTIVATE_CAMERA' };
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        ItemCapture                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 useItemCaptureState                      │   │
│  │  (reducer-based state machine)                           │   │
│  │  - Manages wizard step transitions                       │   │
│  │  - Holds all form data and media items                   │   │
│  │  - Validates before step transitions                     │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                       │
│         ┌───────────────┼───────────────┐                       │
│         ▼               ▼               ▼                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │useMediaCapture│ │useFileUpload│ │useMediaEditor│              │
│  │              │ │             │ │              │               │
│  │- Camera init │ │- File picker│ │- Crop/rotate │               │
│  │- Recording   │ │- Drag-drop  │ │- Trim points │               │
│  │- Photo snap  │ │- Validation │ │- Apply edits │               │
│  └──────┬───────┘ └──────┬──────┘ └──────┬───────┘               │
│         │                │                │                       │
│         └────────────────┼────────────────┘                       │
│                          ▼                                        │
│                 ┌─────────────────┐                               │
│                 │  MediaItem[]    │                               │
│                 │  (Blob/File)    │                               │
│                 └────────┬────────┘                               │
│                          │                                        │
│                          ▼                                        │
│                 ┌─────────────────┐                               │
│                 │ ReviewStep      │                               │
│                 │ - Reorder       │                               │
│                 │ - Remove        │                               │
│                 │ - Submit        │                               │
│                 └────────┬────────┘                               │
│                          │                                        │
└──────────────────────────┼────────────────────────────────────────┘
                           │
                           ▼
              onComplete(ItemRecord) ──────► Parent Application
```

---

## Integration Contract

### Props Interface

```typescript
// File: src/components/ItemCapture/ItemCapture.types.ts

/**
 * Configuration options for ItemCapture behavior
 */
export interface ItemCaptureConfig {
  /** Maximum video recording duration in seconds (default: 120) */
  maxVideoDuration?: number;

  /** Maximum file size in bytes per file (default: 104857600 = 100MB) */
  maxFileSize?: number;

  /** Maximum total size in bytes for all media (default: 209715200 = 200MB) */
  maxTotalSize?: number;

  /** Allowed media types (default: all supported types) */
  allowedMediaTypes?: ('video' | 'image' | 'pdf')[];

  /** Maximum photos per item (default: 10) */
  maxPhotos?: number;

  /** Maximum markdown character count (default: 5000) */
  maxTextLength?: number;

  /** Preferred video resolution (default: { width: 1920, height: 1080 }) */
  videoResolution?: { width: number; height: number };

  /** Enable debug logging (default: false) */
  debug?: boolean;
}

/**
 * Main component props
 */
export interface ItemCaptureProps {
  /** Called when user successfully submits the item record */
  onComplete: (record: ItemRecord) => void;

  /** Called when user cancels/abandons the capture flow */
  onCancel: () => void;

  /** Optional configuration overrides */
  config?: ItemCaptureConfig;

  /** Optional CSS class name for the root element */
  className?: string;
}
```

### Output Interface

```typescript
/**
 * The structured output returned via onComplete callback
 */
export interface ItemRecord {
  /** Local UUID generated for this item */
  id: string;

  /** User-provided title (required) */
  title: string;

  /** Optional location within property (e.g., "Kitchen", "Master Bathroom") */
  location?: string;

  /** Optional tags for categorization */
  tags?: string[];

  /** Optional appliance type from predefined list */
  applianceType?: ApplianceType;

  /** Type of content combination */
  contentType: 'media' | 'text-only' | 'pdf-only' | 'mixed';

  /** Array of captured/uploaded media items */
  media: MediaItem[];

  /** Optional markdown-formatted instructions */
  instructions?: string;

  /** Timestamp of record creation */
  createdAt: Date;
}

/**
 * Individual media item within an ItemRecord
 */
export interface MediaItem {
  /** Local UUID for this media item */
  id: string;

  /** Type of media */
  type: 'video' | 'image' | 'pdf';

  /** The actual file/blob data */
  file: File | Blob;

  /** Generated thumbnail (for preview purposes) */
  thumbnail?: Blob;

  /** Display order (0-indexed) */
  order: number;

  /** Type-specific metadata */
  metadata: MediaMetadata;
}

export interface MediaMetadata {
  /** Video duration in seconds (video only) */
  duration?: number;

  /** Image/video dimensions */
  dimensions?: { width: number; height: number };

  /** Original filename if uploaded */
  originalFilename?: string;

  /** PDF page count (PDF only) */
  pageCount?: number;

  /** MIME type of the file */
  mimeType: string;

  /** File size in bytes */
  fileSize: number;

  /** Whether file was captured or uploaded */
  source: 'capture' | 'upload';

  /** Editing operations applied */
  edits?: {
    cropped?: boolean;
    rotated?: number; // degrees
    trimStart?: number; // seconds
    trimEnd?: number; // seconds
  };
}

export type ApplianceType =
  | 'washer'
  | 'dryer'
  | 'dishwasher'
  | 'oven'
  | 'microwave'
  | 'refrigerator'
  | 'hvac'
  | 'water_heater'
  | 'garbage_disposal'
  | 'security_system'
  | 'smart_home'
  | 'entertainment'
  | 'pool_spa'
  | 'garage'
  | 'other';
```

### Usage Example

```tsx
// Example integration in parent application
import { ItemCapture, ItemRecord } from '@/components/ItemCapture';

function CreateItemPage() {
  const handleComplete = async (record: ItemRecord) => {
    console.log('Item captured:', record);

    // Future integration:
    // 1. Upload media files to storage
    // 2. Save record to database
    // 3. Generate QR code
    // 4. Navigate to success page
  };

  const handleCancel = () => {
    console.log('Capture cancelled');
    // Navigate away or show confirmation
  };

  return (
    <ItemCapture
      onComplete={handleComplete}
      onCancel={handleCancel}
      config={{
        maxVideoDuration: 90,  // 90 seconds max
        maxPhotos: 5,          // Limit photos
        debug: true,           // Enable logging
      }}
    />
  );
}
```

---

## Implementation Approach

### Phase Dependencies

The implementation follows a structured dependency chain. Understanding these dependencies is critical for planning parallel work and identifying blockers.

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                     PHASE 1                              │
                    │                    Foundation                            │
                    │  (Types, State Machine, Wizard Navigation, Metadata)     │
                    └─────────────────────┬───────────────────────────────────┘
                                          │
                    ┌─────────────────────┴───────────────────────┐
                    │                                             │
                    ▼                                             ▼
    ┌───────────────────────────────┐         ┌───────────────────────────────┐
    │          PHASE 2              │         │          PHASE 3              │
    │       Media Capture           │         │    File Upload & Text         │
    │  (Camera, Video, Photo)       │         │  (Upload, PDF, Markdown)      │
    └───────────────┬───────────────┘         └───────────────┬───────────────┘
                    │                                         │
                    │       ┌─────────────────────────┐       │
                    └──────►│        PHASE 4          │◄──────┘
                            │    Editing Features     │
                            │  (Crop, Rotate, Trim)   │
                            └────────────┬────────────┘
                                         │
                                         ▼
                            ┌─────────────────────────┐
                            │        PHASE 5          │
                            │    Review & Polish      │
                            │ (Review, Validation,    │
                            │  Testing, Optimization) │
                            └─────────────────────────┘
```

#### Dependency Rules

| Phase | Hard Dependencies | Can Start After | Parallelizable With |
|-------|-------------------|-----------------|---------------------|
| **Phase 1** | None | Immediately | None (must complete first) |
| **Phase 2** | Phase 1 complete | Phase 1 | Phase 3 |
| **Phase 3** | Phase 1 complete | Phase 1 | Phase 2 |
| **Phase 4** | Phase 2 OR Phase 3 complete | Phase 2 or 3 | Remaining work from Phase 2/3 |
| **Phase 5** | Phases 1-4 complete | Phase 4 | None (integration phase) |

#### Key Insights

1. **Phases 2 & 3 can run in parallel** - Both depend only on Phase 1's infrastructure (state machine, types, wizard scaffold). Different developers could work on these simultaneously.

2. **Phase 4 has a soft dependency** - Editing features need media items to edit, but development can start once *either* Phase 2 or Phase 3 produces media items. Image cropping/rotation could be tested with uploaded images while video capture is still in progress.

3. **Phase 5 is the integration point** - Review step needs all content types, so this phase cannot begin until all prior phases are functionally complete.

4. **Spike work is independent** - The iOS Safari MediaRecorder spike (REQ-029) and Bundle Size Analysis (REQ-028) can be done before or during Phase 1, informing technical decisions for Phase 2.

#### Critical Path

The critical path (longest sequential chain) is:

```
Phase 1 → Phase 2 → Phase 4 → Phase 5
   │         │         │         │
  3-4d     4-5d      4-5d      3-4d  = 14-18 days minimum
```

Phase 3 can complete during Phase 2 without extending the timeline if parallelized.

---

### Phase 1: Foundation (Estimated: 3-4 days)

**Goal:** Establish core infrastructure and basic capture flow without editing.

#### Task Dependencies (Phase 1)

```
1.1 Directory Structure
         │
         ▼
1.2 State Machine Hook
         │
         ▼
1.3 Wizard Navigation
         │
    ┌────┴────┐
    ▼         ▼
  1.4       1.5
Metadata  ContentType
  Step      Step
```

| Task | Depends On | Can Parallelize With |
|------|------------|---------------------|
| 1.1 | None | - |
| 1.2 | 1.1 | - |
| 1.3 | 1.2 | - |
| 1.4 | 1.3 | 1.5 |
| 1.5 | 1.3 | 1.4 |

#### Tasks

- [ ] **1.1 Create component directory structure** *(No dependencies)*
  - Create `/src/components/ItemCapture/` directory
  - Set up barrel exports in `index.ts`
  - Create `ItemCapture.types.ts` with all interfaces

- [ ] **1.2 Implement core state machine hook** *(Depends on: 1.1)*
  - Create `useItemCaptureState.ts` with reducer
  - Define step transitions and validation rules
  - Add error handling and state persistence

- [ ] **1.3 Build wizard navigation scaffold** *(Depends on: 1.2)*
  - Create `CaptureWizard.tsx` step container
  - Create `StepNavigation.tsx` with back/next/cancel
  - Create `ProgressIndicator.tsx` for step progress

- [ ] **1.4 Implement MetadataStep** *(Depends on: 1.3 | Parallel with: 1.5)*
  - Title input (required, validated)
  - Location input (optional, dropdown + free text)
  - Tags input (optional, pill-based multi-select)
  - Appliance type selector (optional, dropdown)
  - Follow `ItemForm.tsx` patterns for form handling

- [ ] **1.5 Implement ContentTypeStep** *(Depends on: 1.3 | Parallel with: 1.4)*
  - Large, accessible buttons for Video/Photo/Text/Upload
  - Mobile-first touch targets (min 48x48px)
  - Icons from Lucide React

### Phase 2: Media Capture (Estimated: 4-5 days)

**Goal:** Full video and photo capture with camera switching.

#### Task Dependencies (Phase 2)

```
2.1 useMediaCapture Hook          2.5 Thumbnail Utility
         │                              (Independent)
         ▼
2.2 CameraPreview Component
         │
    ┌────┴────┐
    ▼         ▼
  2.3       2.4
 Video     Photo
Capture   Capture
  Step      Step
```

| Task | Depends On | Can Parallelize With |
|------|------------|---------------------|
| 2.1 | Phase 1 complete | 2.5 |
| 2.2 | 2.1 | 2.5 |
| 2.3 | 2.2 | 2.4, 2.5 |
| 2.4 | 2.2 | 2.3, 2.5 |
| 2.5 | None (utility) | 2.1, 2.2, 2.3, 2.4 |

#### Tasks

- [ ] **2.1 Create useMediaCapture hook** *(No dependencies within phase)*
  - Abstract MediaDevices API with error handling
  - Camera enumeration and switching
  - Permission request handling with user-friendly messages
  - Browser compatibility detection

- [ ] **2.2 Build CameraPreview component** *(Depends on: 2.1)*
  - Video element with live feed
  - Mirror mode toggle for front camera
  - Loading state during camera activation
  - Error state for permission denied

- [ ] **2.3 Implement VideoCaptureStep** *(Depends on: 2.2 | Parallel with: 2.4)*
  - Start/stop recording controls
  - Countdown timer (max 2 min)
  - Auto-stop at limit
  - Camera switch button
  - Recording indicator
  - Review screen with playback

- [ ] **2.4 Implement PhotoCaptureStep** *(Depends on: 2.2 | Parallel with: 2.3)*
  - Capture button with haptic feedback (if available)
  - Camera switch button
  - Flash indicator (if available)
  - Preview with accept/retake options
  - Multi-photo support with thumbnail strip

- [ ] **2.5 Create thumbnail generation utility** *(Independent - can start anytime)*
  - Canvas-based thumbnail from video frame
  - Canvas-based thumbnail from image
  - Consistent sizing (e.g., 200x200)
  - Memory-efficient blob handling

### Phase 3: File Upload & Text (Estimated: 3-4 days)

**Goal:** Complete upload flow and markdown editing.

#### Task Dependencies (Phase 3)

```
     TRACK A                    TRACK B
  (File Upload)              (Text/Markdown)

3.1 useFileUpload Hook      3.4 TextEditorStep
         │                         │
         ▼                         ▼
3.2 FileUploadStep          3.5 MarkdownEditor
         │                    Component
         ▼
3.3 PDF Thumbnail
    Generation
```

| Task | Depends On | Can Parallelize With |
|------|------------|---------------------|
| 3.1 | Phase 1 complete | 3.4, 3.5 |
| 3.2 | 3.1 | 3.4, 3.5 |
| 3.3 | 3.2 | 3.4, 3.5 |
| 3.4 | Phase 1 complete | 3.1, 3.2, 3.3 |
| 3.5 | 3.4 | 3.1, 3.2, 3.3 |

**Note:** Track A (3.1→3.2→3.3) and Track B (3.4→3.5) are completely independent and can be developed in parallel by different developers.

#### Tasks

- [ ] **3.1 Create useFileUpload hook** *(No dependencies within phase | Track A)*
  - File input management
  - Drag-and-drop zone handling
  - MIME type validation
  - Size validation
  - Multiple file selection

- [ ] **3.2 Implement FileUploadStep** *(Depends on: 3.1 | Track A)*
  - Click-to-upload area
  - Drag-and-drop zone with visual feedback
  - File type icons
  - Progress indication
  - Error messages for invalid files
  - Thumbnail preview for uploaded files

- [ ] **3.3 Add PDF thumbnail generation** *(Depends on: 3.2 | Track A)*
  - Integrate pdfjs-dist
  - Extract first page as image
  - Display page count metadata
  - Handle corrupt/password-protected PDFs gracefully

- [ ] **3.4 Implement TextEditorStep** *(No dependencies within phase | Track B)*
  - Markdown editor with toolbar
  - Bold, italic, headings, lists, links
  - Live preview pane (split view on desktop, tab on mobile)
  - Character count with limit indicator
  - Auto-save to state on debounced input

- [ ] **3.5 Create MarkdownEditor component** *(Depends on: 3.4 | Track B)*
  - Custom toolbar with accessible buttons
  - Keyboard shortcuts
  - Mobile-optimized toolbar placement
  - Preview rendering with react-markdown

### Phase 4: Editing Features (Estimated: 4-5 days)

**Goal:** Photo cropping/rotation and video trimming.

#### Task Dependencies (Phase 4)

```
        4.1 useMediaEditor Hook
                   │
       ┌───────────┼───────────┐
       ▼           ▼           ▼
     4.2         4.3         4.4
   Image       Image       Video
  Cropper     Rotator     Trimmer
       │           │           │
       └───────────┼───────────┘
                   ▼
          4.5 MediaEditorStep
           (Container/Router)
```

| Task | Depends On | Can Parallelize With |
|------|------------|---------------------|
| 4.1 | Phase 2 OR Phase 3 complete | - |
| 4.2 | 4.1 | 4.3, 4.4 |
| 4.3 | 4.1 | 4.2, 4.4 |
| 4.4 | 4.1 | 4.2, 4.3 |
| 4.5 | 4.2, 4.3, 4.4 | - |

**Note:** The three editor components (4.2, 4.3, 4.4) are independent of each other and can be developed in parallel once the hook (4.1) is complete.

#### Tasks

- [ ] **4.1 Create useMediaEditor hook** *(Requires Phase 2 or 3 for media items)*
  - Manage edit state per media item
  - Non-destructive edit tracking
  - Apply edits on confirm

- [ ] **4.2 Implement ImageCropper** *(Depends on: 4.1 | Parallel with: 4.3, 4.4)*
  - Integrate react-image-crop
  - Free-form and preset aspect ratios (1:1, 4:3, 16:9)
  - Touch-friendly handles
  - Preview of cropped result

- [ ] **4.3 Implement ImageRotator** *(Depends on: 4.1 | Parallel with: 4.2, 4.4)*
  - 90-degree rotation buttons
  - Animated rotation preview
  - Canvas-based actual rotation

- [ ] **4.4 Implement VideoTrimmer (V1 Simplified)** *(Depends on: 4.1 | Parallel with: 4.2, 4.3)*
  - Video player with scrubber
  - Set start/end markers
  - Visual preview of trimmed section
  - **Note:** Actual trimming deferred to upload time (no WASM in V1)

- [ ] **4.5 Build MediaEditorStep** *(Depends on: 4.2, 4.3, 4.4)*
  - Display appropriate editor based on media type
  - Skip button for each edit type
  - Apply/Cancel buttons
  - Transition to next media or review

### Phase 5: Review & Polish (Estimated: 3-4 days)

**Goal:** Complete review flow and production readiness.

#### Task Dependencies (Phase 5)

```
5.1 ReviewStep ◄────► 5.2 MediaThumbnail
       │                 (can develop together)
       ▼
5.3 Validation Layer
       │
       ▼
5.4 onComplete Assembly
       │
  ┌────┴────┐
  ▼         ▼
5.5       5.6
Perf     Test
Opt.    Harness
```

| Task | Depends On | Can Parallelize With |
|------|------------|---------------------|
| 5.1 | Phases 1-4 complete | 5.2 |
| 5.2 | None (reusable component) | 5.1 |
| 5.3 | 5.1 | - |
| 5.4 | 5.3 | - |
| 5.5 | 5.4 | 5.6 |
| 5.6 | 5.4 | 5.5 |

**Note:** Tasks 5.1 and 5.2 can be developed together as they're complementary. Tasks 5.5 and 5.6 are independent post-integration tasks.

#### Tasks

- [ ] **5.1 Implement ReviewStep** *(Requires Phases 1-4 | Parallel with: 5.2)*
  - Summary display of all content
  - Media thumbnails with type badges
  - Reorder via drag-and-drop
  - Remove individual items
  - Edit any section (navigate back)
  - Metadata summary
  - Instructions preview

- [ ] **5.2 Build MediaThumbnail component** *(Independent utility | Parallel with: 5.1)*
  - Consistent display for video/image/PDF
  - Play icon overlay for video
  - PDF icon with page count
  - Delete button overlay
  - Loading state

- [ ] **5.3 Create validation layer** *(Depends on: 5.1)*
  - Required field validation
  - Content requirement (at least one: media or text)
  - File size limit enforcement
  - Total size calculation

- [ ] **5.4 Implement onComplete assembly** *(Depends on: 5.3)*
  - Gather all state into ItemRecord
  - Generate final UUIDs
  - Set contentType based on content
  - Create createdAt timestamp
  - Emit to parent

- [ ] **5.5 Performance optimization** *(Depends on: 5.4 | Parallel with: 5.6)*
  - Lazy load editor components
  - Cleanup media streams on unmount
  - Revoke object URLs
  - Memory profiling

- [ ] **5.6 Create test harness** *(Depends on: 5.4 | Parallel with: 5.5)*
  - Standalone page at `/test/item-capture`
  - Console output of onComplete
  - Network monitor confirmation (zero requests)

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State management | useReducer + Context | Matches PRD "no global state" requirement; reducer provides predictable transitions for wizard flow |
| Camera API | Native MediaDevices | Zero dependencies; full control over constraints; better performance than wrapper libraries |
| Video encoding | Browser MediaRecorder | Native API; produces web-compatible formats; no transcoding needed |
| Photo capture | Canvas from video stream | Consistent with video approach; good quality; avoids separate API |
| Image cropping | react-image-crop | Mature library; accessible; touch-friendly; reasonable bundle size |
| Video trimming V1 | Marker-only (no encode) | Avoids 25MB WASM payload; parent can use FFmpeg server-side |
| Markdown | react-markdown | React-native; XSS-safe; good ecosystem |
| PDF thumbnails | pdfjs-dist | Robust; maintained by Mozilla; client-side rendering |
| Styling | Tailwind + cn() | Matches existing codebase; utility-first; responsive-friendly |
| Icons | Lucide React | Already in codebase; consistent with existing components |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| iOS Safari MediaRecorder quirks | High | High | Early testing on iOS 15; fallback to photo-only mode if video fails; detect and warn user |
| Large video files (>100MB) | Medium | Medium | Enforce 2-min limit; consider reducing resolution on low-memory devices; compress before blob creation |
| Camera permission denied | Medium | High | Clear permission request UI; fallback to upload-only mode; link to browser settings help |
| Memory pressure with multiple videos | Medium | High | Revoke object URLs aggressively; limit concurrent previews; show thumbnails not full media |
| PDF.js bundle size | Low | Medium | Dynamic import only when PDF uploaded; consider lighter thumbnail service in V2 |
| Cross-browser MediaRecorder codecs | Medium | Medium | Prefer webm/vp8; detect available codecs; adapt MIME type accordingly |
| Touch interactions on crop/trim | Medium | Medium | Use proven libraries; extensive device testing; gesture alternatives |
| Dark mode support | Low | Low | Verify Tailwind dark: variants work; test with existing globals.css dark mode |

---

## Browser Compatibility Matrix

| Feature | iOS Safari 15+ | Chrome Android 90+ | Chrome Desktop | Firefox | Edge |
|---------|---------------|-------------------|----------------|---------|------|
| getUserMedia | Yes | Yes | Yes | Yes | Yes |
| MediaRecorder | Yes (limited codecs) | Yes | Yes | Yes | Yes |
| Canvas toBlob | Yes | Yes | Yes | Yes | Yes |
| Drag & Drop | Limited (touch) | Yes | Yes | Yes | Yes |
| HEIC upload | Yes | No | No | No | No |
| PDF.js | Yes | Yes | Yes | Yes | Yes |

**iOS Safari Notes:**
- MediaRecorder requires iOS 14.3+, more stable in 15+
- HEIC images need conversion; canvas handles this
- Touch drag-drop requires custom implementation

---

## Testing Approach

### Unit Tests
- State reducer transitions
- Validation functions
- Thumbnail generation
- File type/size validation

### Integration Tests
- Hook behavior with mocked MediaDevices
- Wizard step navigation
- Form submission flow

### Manual Testing Checklist
- [ ] iOS Safari 15 on iPhone
- [ ] iOS Safari 15 on iPad
- [ ] Chrome on Android phone
- [ ] Chrome on Android tablet
- [ ] Chrome/Firefox/Edge on desktop
- [ ] Camera permission grant/deny flows
- [ ] Microphone permission for video
- [ ] File upload via picker
- [ ] File upload via drag-drop
- [ ] Large file rejection
- [ ] 2-minute video limit enforcement
- [ ] All editing operations
- [ ] Review reorder/remove
- [ ] Cancel at various steps
- [ ] Submit with various content combinations

### Test Harness Validation
```tsx
// /src/app/test/item-capture/page.tsx
'use client';

import { ItemCapture } from '@/components/ItemCapture';

export default function TestItemCapture() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <ItemCapture
        onComplete={(record) => {
          console.log('=== ITEM CAPTURE OUTPUT ===');
          console.log(JSON.stringify(record, (key, value) => {
            if (value instanceof Blob) {
              return `[Blob: ${value.size} bytes, ${value.type}]`;
            }
            if (value instanceof Date) {
              return value.toISOString();
            }
            return value;
          }, 2));
        }}
        onCancel={() => {
          console.log('=== ITEM CAPTURE CANCELLED ===');
        }}
        config={{ debug: true }}
      />
    </div>
  );
}
```

---

## Effort Estimate

| Phase | Description | Estimate | Confidence |
|-------|-------------|----------|------------|
| Phase 1 | Foundation (structure, state, metadata, nav) | 3-4 days | High |
| Phase 2 | Media Capture (camera, video, photo) | 4-5 days | Medium |
| Phase 3 | File Upload & Text (upload, PDF, markdown) | 3-4 days | High |
| Phase 4 | Editing Features (crop, rotate, trim UI) | 4-5 days | Medium |
| Phase 5 | Review & Polish (review, validation, testing) | 3-4 days | High |
| **Total** | **Complete ItemCapture component** | **17-22 days** | Medium |

**Confidence Notes:**
- Phase 2 & 4 have medium confidence due to cross-browser media API complexities
- Estimates assume single developer, focused work
- Additional buffer recommended for device testing

---

## Open Questions

These are non-blocking but may affect implementation details:

1. **Draft auto-save:** Should we persist draft state to localStorage? If so, what's the key structure and expiration?

2. **Offline support:** Is offline capture with later sync a V1 requirement, or can we defer?

3. **Accessibility level:** What WCAG level is targeted? (Impacts screen reader testing, keyboard nav depth)

4. **Localization:** Is i18n needed in V1, or can we hardcode English strings?

5. **Analytics hooks:** Should the component emit events (e.g., "step_completed", "media_captured") for analytics integration, or is that a V2 concern?

6. **Error boundaries:** Should the component include its own error boundary, or rely on the parent?

7. **Duplicate detection:** Should we warn if the same file is uploaded twice (by filename/size)?

---

## Recommended Spike Work

### Spike 1: iOS Safari MediaRecorder Validation

**Goal:** Confirm MediaRecorder works reliably on iOS Safari 15+

**Timebox:** 4 hours

**Tasks:**
1. Create minimal test page with MediaRecorder
2. Test on iPhone (iOS 15, 16, 17)
3. Test on iPad
4. Document working codec/container combinations
5. Identify any permission quirks

**Success Criteria:**
- Can record 30-second video on iOS Safari 15
- Recording produces playable file
- Front/back camera switching works

### Spike 2: Bundle Size Impact Analysis

**Status:** COMPLETE
**Date:** 2025-12-30
**Report:** `/docs/req-028-bundle-analysis-report.md`
**Outcome:** PROCEED - All success criteria met

**Goal:** Validate that pdfjs-dist and react-image-crop don't blow the bundle

**Timebox:** 2 hours (Actual: ~3 hours)

**Tasks:**
1. Add dependencies to package.json - DONE
2. Run `npm run build` - DONE
3. Analyze bundle with `@next/bundle-analyzer` - DONE
4. Document chunk sizes - DONE

**Success Criteria:**
- ItemCapture chunk < 500KB (excluding pdfjs-dist which loads lazily) - PASS (136 KB)
- pdfjs-dist loads only when PDF is uploaded - VERIFIED (separate chunk)

**Key Findings:**
- Baseline bundle: 99.7 KB
- With lazy loading: 136 KB (+36.3 KB, +36%)
- With eager loading (worst case): 241 KB (+141.3 KB, +142%)
- Lazy loading effectiveness: 74.3% reduction (105 KB savings)
- All dependencies validated for production use

---

## File Locations (Final Structure)

```
/src/components/ItemCapture/
├── index.ts
├── ItemCapture.tsx
├── ItemCapture.types.ts
├── hooks/
│   ├── useMediaCapture.ts
│   ├── useFileUpload.ts
│   ├── useMediaEditor.ts
│   └── useItemCaptureState.ts
├── components/
│   ├── CaptureWizard.tsx
│   ├── steps/
│   │   ├── MetadataStep.tsx
│   │   ├── ContentTypeStep.tsx
│   │   ├── VideoCaptureStep.tsx
│   │   ├── PhotoCaptureStep.tsx
│   │   ├── FileUploadStep.tsx
│   │   ├── TextEditorStep.tsx
│   │   ├── MediaEditorStep.tsx
│   │   └── ReviewStep.tsx
│   ├── shared/
│   │   ├── CameraPreview.tsx
│   │   ├── MediaThumbnail.tsx
│   │   ├── ProgressIndicator.tsx
│   │   ├── StepNavigation.tsx
│   │   └── ValidationMessage.tsx
│   └── editors/
│       ├── ImageCropper.tsx
│       ├── ImageRotator.tsx
│       ├── VideoTrimmer.tsx
│       └── MarkdownEditor.tsx
└── utils/
    ├── mediaConstraints.ts
    ├── fileValidation.ts
    ├── thumbnailGenerator.ts
    └── constants.ts

/src/app/test/item-capture/
└── page.tsx                    # Test harness
```

---

## References

- [MediaDevices API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices)
- [MediaRecorder API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [react-image-crop](https://github.com/DominicTobias/react-image-crop)
- [react-markdown](https://github.com/remarkjs/react-markdown)
- [PDF.js](https://mozilla.github.io/pdf.js/)
- [Existing ItemForm.tsx](/src/components/ItemForm.tsx) - Form patterns
- [Existing ConfirmationModal.tsx](/src/components/ConfirmationModal.tsx) - Modal patterns
- [Existing utils.ts](/src/lib/utils.ts) - Utility patterns

---

## Appendix A: Appliance Types Reference

```typescript
export const APPLIANCE_TYPES: { value: ApplianceType; label: string }[] = [
  { value: 'washer', label: 'Washing Machine' },
  { value: 'dryer', label: 'Dryer' },
  { value: 'dishwasher', label: 'Dishwasher' },
  { value: 'oven', label: 'Oven / Stove' },
  { value: 'microwave', label: 'Microwave' },
  { value: 'refrigerator', label: 'Refrigerator / Freezer' },
  { value: 'hvac', label: 'HVAC / Thermostat' },
  { value: 'water_heater', label: 'Water Heater' },
  { value: 'garbage_disposal', label: 'Garbage Disposal' },
  { value: 'security_system', label: 'Security System' },
  { value: 'smart_home', label: 'Smart Home Device' },
  { value: 'entertainment', label: 'TV / Entertainment' },
  { value: 'pool_spa', label: 'Pool / Spa / Hot Tub' },
  { value: 'garage', label: 'Garage Door / Opener' },
  { value: 'other', label: 'Other' },
];
```

---

## Appendix B: Constants Reference

```typescript
// /src/components/ItemCapture/utils/constants.ts

export const CAPTURE_CONSTRAINTS = {
  video: {
    maxDuration: 120,        // 2 minutes in seconds
    maxFileSize: 104857600,  // 100 MB
    resolution: {
      width: 1920,
      height: 1080,
    },
    frameRate: 30,
  },
  image: {
    maxFileSize: 20971520,   // 20 MB
    maxResolution: 4096,     // 4K max dimension
    maxCount: 10,
  },
  pdf: {
    maxFileSize: 52428800,   // 50 MB
    maxPages: 50,
  },
  text: {
    maxLength: 5000,         // characters
  },
  total: {
    maxSize: 209715200,      // 200 MB total per item
  },
};

export const SUPPORTED_FORMATS = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  pdf: ['application/pdf'],
};

export const THUMBNAIL_SIZE = {
  width: 200,
  height: 200,
};
```
