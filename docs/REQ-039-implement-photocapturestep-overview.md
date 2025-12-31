# REQ-039: Implement PhotoCaptureStep - Technical Overview

**Document Created:** 2025-12-31T18:30:00
**Last Modified:** 2025-12-31T18:30:00
**Request Reference:** REQ-039 in `/docs/gen_requests.md`
**Implementation Plan:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 2 - Media Capture
**Task ID:** 2.4

---

## 1. Executive Summary

This document provides a technical implementation breakdown for `PhotoCaptureStep`, a wizard step component that enables users to capture multiple photos of household items with camera controls, preview/retake functionality, and a thumbnail strip for managing captured photos.

### Feature Overview

| Aspect | Description |
|--------|-------------|
| **Component** | `PhotoCaptureStep.tsx` |
| **Location** | `/src/components/ItemCapture/components/steps/` |
| **Purpose** | Photo capture UI within the Item Capture wizard |
| **Dependencies** | `useMediaCapture` hook (REQ-036), `CameraPreview` component (REQ-037) |
| **Key Features** | Capture button with haptic feedback, camera switching, flash indicator, preview/retake, multi-photo thumbnail strip |

---

## 2. Context and Dependencies

### 2.1 Phase Dependencies

```
Phase 1: Foundation
    ├── 1.1 Directory Structure (REQ-031) ────────────────┐
    ├── 1.2 State Machine Hook (REQ-032) ─────────────────┤
    └── 1.3 Wizard Navigation (REQ-033) ──────────────────┤
                                                          │
Phase 2: Media Capture                                    │
    ├── 2.1 useMediaCapture Hook (REQ-036) ◄──────────────┤
    │         │                                           │
    │         ▼                                           │
    ├── 2.2 CameraPreview Component (REQ-037) ◄───────────┘
    │         │
    │         ▼
    ├── 2.3 VideoCaptureStep (REQ-038) [Parallel with 2.4]
    │
    └── 2.4 PhotoCaptureStep (REQ-039) ◄── THIS TASK
```

### 2.2 Required Prerequisite Implementations

| Prerequisite | Status | Description |
|--------------|--------|-------------|
| `useItemCaptureState` hook | Required | Provides wizard state and navigation actions |
| `useMediaCapture` hook | Required | Camera initialization, photo capture, device switching |
| `CameraPreview` component | Required | Displays live camera feed with mirror support |
| `StepNavigation` component | Required | Back/Next/Cancel navigation controls |
| `thumbnailGenerator` utility | Required | Generates thumbnails from captured photos |
| Type definitions | Required | `MediaItem`, `WizardStep`, `ItemCaptureState`, `ItemCaptureConfig` |

### 2.3 Related Spike Work

| Spike | Status | Relevance |
|-------|--------|-----------|
| REQ-028: Bundle Size Analysis | Complete | Validated lazy loading strategy |
| REQ-029: iOS Safari MediaRecorder | In Progress | Informs iOS camera behavior patterns |

---

## 3. Technical Design

### 3.1 Component Architecture

```
PhotoCaptureStep
├── CameraPreview (shared component)
│   └── Video element with live stream
├── CaptureControls
│   ├── Capture button (with haptic feedback)
│   ├── Camera switch button
│   └── Flash indicator (if available)
├── PhotoReview (conditional - single photo preview)
│   ├── Full-screen photo preview
│   ├── Accept button
│   └── Retake button
├── ThumbnailStrip (when photos captured)
│   ├── Horizontal scrollable container
│   ├── Photo thumbnails (tappable)
│   ├── Photo count indicator
│   └── Add more button
└── StepNavigation (shared component)
```

### 3.2 Component States

The component operates in three distinct modes:

```typescript
type PhotoCaptureMode =
  | 'preview'   // Camera active, ready to capture
  | 'review'    // Viewing single captured photo (accept/retake)
  | 'gallery';  // Viewing previously captured photo from thumbnail strip
```

**State Transitions:**

```
                                    ┌───────────────────────────────┐
                                    │                               │
                                    ▼                               │
  ┌─────────────┐   capture   ┌──────────┐                          │
  │   PREVIEW   │ ──────────► │  REVIEW  │                          │
  └─────────────┘             └──────────┘                          │
        ▲                          │                                │
        │                          │ accept                         │
        │                          ▼                                │
        │                   addMedia()                              │
        │                   updateThumbnailStrip                    │
        │                          │                                │
        │         retake           │                                │
        ├──────────────────────────┤                                │
        │                          │                                │
        │                          ▼                                │
        │                  ┌──────────────┐   tap thumbnail         │
        │                  │   GALLERY    │ ◄───────────────────────┤
        │                  └──────────────┘                         │
        │                          │                                │
        │         close            │                                │
        └──────────────────────────┘                                │
                                                                    │
  Continue to next step ◄───────────────────────────────────────────┘
```

### 3.3 Props Interface

```typescript
interface PhotoCaptureStepProps {
  /** Current wizard state from useItemCaptureState */
  state: ItemCaptureState;

  /** Action to add captured media to wizard state */
  addMedia: (media: MediaItem) => void;

  /** Action to navigate to a specific step */
  goToStep: (step: WizardStep) => void;

  /** Action to go back to previous step */
  prevStep: () => void;

  /** Configuration options */
  config: ItemCaptureConfig;

  /** Optional CSS class */
  className?: string;
}
```

### 3.4 Internal State

```typescript
interface PhotoCaptureInternalState {
  mode: PhotoCaptureMode;
  capturedPhoto: Blob | null;
  capturedPhotoUrl: string | null;
  capturedPhotos: CapturedPhoto[];
  selectedPhotoIndex: number | null;
  isCapturing: boolean;
  flashMode: 'off' | 'on' | 'auto' | 'unavailable';
  error: PhotoCaptureError | null;
}

interface CapturedPhoto {
  id: string;
  blob: Blob;
  url: string;
  thumbnail: Blob;
  thumbnailUrl: string;
  capturedAt: Date;
}

interface PhotoCaptureError {
  code: 'CAPTURE_FAILED' | 'MAX_PHOTOS_REACHED' | 'STORAGE_FULL';
  message: string;
  recoverable: boolean;
}
```

### 3.5 Key Behaviors

#### Photo Capture with Haptic Feedback

```typescript
const handleCapturePhoto = async () => {
  setIsCapturing(true);

  // Trigger haptic feedback if available
  if (navigator.vibrate) {
    navigator.vibrate(50); // 50ms vibration
  }

  try {
    const photoBlob = await capturePhoto();
    if (photoBlob) {
      const photoUrl = URL.createObjectURL(photoBlob);
      setCapturedPhoto(photoBlob);
      setCapturedPhotoUrl(photoUrl);
      setMode('review');
    }
  } catch (error) {
    handleCaptureError(error);
  } finally {
    setIsCapturing(false);
  }
};
```

#### Camera Switching

- Available in `preview` mode only
- Uses `useMediaCapture.switchCamera()`
- Toggles between front/back cameras
- Disabled if only one camera available
- Visual indicator of current camera (front/back)

#### Flash Indicator

- Displays flash status based on device capabilities
- States: `off`, `on`, `auto`, `unavailable`
- Read from device capabilities via `useMediaCapture`
- Note: Browser API flash control is limited; indicator is informational

#### Multi-Photo Thumbnail Strip

- Horizontal scrollable container
- Shows captured photos as thumbnails
- Tapping thumbnail enters `gallery` mode for that photo
- Shows photo count (e.g., "3/10 photos")
- Visual indicator when at max photo limit
- Allows removing photos from strip

#### Accept/Retake Flow

- **Accept:** Creates MediaItem, generates thumbnail, adds to wizard state
- **Retake:** Discards current capture, returns to preview mode
- Object URLs properly revoked on discard

---

## 4. Implementation Tasks

### Task 4.1: Create PhotoCaptureStep Component Shell

**Priority:** High
**Estimated Effort:** 1-2 hours

Create the basic component structure with mode state management.

**Subtasks:**
- [ ] Create `/src/components/ItemCapture/components/steps/PhotoCaptureStep.tsx`
- [ ] Define `PhotoCaptureStepProps` interface
- [ ] Implement mode state (`preview` | `review` | `gallery`)
- [ ] Add `'use client'` directive
- [ ] Set up basic layout structure with Tailwind classes

**Files to Create:**
- `src/components/ItemCapture/components/steps/PhotoCaptureStep.tsx`

---

### Task 4.2: Integrate useMediaCapture Hook

**Priority:** High
**Estimated Effort:** 1-2 hours
**Depends On:** Task 4.1

Wire up the media capture hook for camera and photo capture functionality.

**Subtasks:**
- [ ] Import and call `useMediaCapture` hook
- [ ] Initialize camera on component mount
- [ ] Handle permission errors from hook
- [ ] Display loading state during camera init
- [ ] Cleanup camera on unmount

**Key Integration Points:**
```typescript
const {
  stream,
  isCameraActive,
  error,
  permissionStatus,
  startCamera,
  stopCamera,
  switchCamera,
  capturePhoto,
  devices,
  facingMode,
  capabilities,
} = useMediaCapture({
  initialFacingMode: 'environment',
  resolution: { width: 1920, height: 1080 },
});
```

---

### Task 4.3: Build Capture Controls UI

**Priority:** High
**Estimated Effort:** 2-3 hours
**Depends On:** Task 4.2

Create the capture button, camera switch, and flash indicator.

**Subtasks:**
- [ ] Create capture button with prominent styling (circular, primary color)
- [ ] Implement haptic feedback on capture (navigator.vibrate)
- [ ] Add camera switch button (show only if multiple cameras)
- [ ] Add flash indicator (informational display)
- [ ] Style controls for mobile-first (min 48x48px touch targets)
- [ ] Add visual feedback during capture (button animation/flash)
- [ ] Add disabled states during camera initialization

**UI Layout (Capture Mode):**
```
┌─────────────────────────────────────┐
│                                     │
│          CameraPreview              │
│                                     │
│  [⚡ Auto]                  [🔄]    │  ← Flash status + Camera switch
│                                     │
├─────────────────────────────────────┤
│                                     │
│              [  ◯  ]                │  ← Large capture button
│                                     │
│     ─── Thumbnail Strip ───         │  ← Previously captured photos
│                                     │
└─────────────────────────────────────┘
```

---

### Task 4.4: Implement Photo Review Screen

**Priority:** High
**Estimated Effort:** 2-3 hours
**Depends On:** Task 4.3

Create the preview interface with accept/retake options.

**Subtasks:**
- [ ] Create object URL from captured Blob
- [ ] Render full-screen image preview
- [ ] Add Accept button (primary style)
- [ ] Add Retake button (secondary style)
- [ ] Revoke object URL on retake or accept
- [ ] Style preview container (full-screen, dark background)
- [ ] Add pinch-to-zoom for photo inspection (optional V1)

**Review UI Layout:**
```
┌─────────────────────────────────────┐
│                                     │
│         Photo Preview               │
│    ┌─────────────────────────┐      │
│    │                         │      │
│    │    [Captured Photo]     │      │
│    │                         │      │
│    └─────────────────────────┘      │
│                                     │
├─────────────────────────────────────┤
│                                     │
│   [Retake]              [Accept ✓]  │
│                                     │
└─────────────────────────────────────┘
```

---

### Task 4.5: Build Thumbnail Strip Component

**Priority:** High
**Estimated Effort:** 2-3 hours
**Depends On:** Task 4.4

Create the multi-photo thumbnail strip for captured photos.

**Subtasks:**
- [ ] Create horizontally scrollable container
- [ ] Generate and display thumbnails for captured photos
- [ ] Implement thumbnail tap to enter gallery mode
- [ ] Add photo count indicator (e.g., "3/10 photos")
- [ ] Add visual indication when at max photo limit
- [ ] Implement remove button on thumbnails
- [ ] Add empty state when no photos captured
- [ ] Smooth scroll behavior for strip

**Thumbnail Strip Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  3/10 photos                              [Continue →]  │
│                                                         │
│  ┌────┐ ┌────┐ ┌────┐ ┌─ ─ ─ ┐                         │
│  │ 1  │ │ 2  │ │ 3  │ │  +   │  ← Add more placeholder │
│  │ ✕  │ │ ✕  │ │ ✕  │ │      │                         │
│  └────┘ └────┘ └────┘ └─ ─ ─ ┘                         │
│                                                         │
│  ◄───── Scrollable horizontally ─────►                  │
└─────────────────────────────────────────────────────────┘
```

---

### Task 4.6: Implement Gallery Mode

**Priority:** Medium
**Estimated Effort:** 1-2 hours
**Depends On:** Task 4.5

Allow viewing/managing previously captured photos.

**Subtasks:**
- [ ] Implement gallery mode state
- [ ] Display selected photo full-screen
- [ ] Add close button to return to preview
- [ ] Add delete option for selected photo
- [ ] Add navigation between photos (swipe or arrows)
- [ ] Clean up object URLs on photo deletion

---

### Task 4.7: Handle Accept and Add Media

**Priority:** High
**Estimated Effort:** 1-2 hours
**Depends On:** Task 4.4, Task 4.5

Create MediaItem from captured photo and integrate with wizard state.

**Subtasks:**
- [ ] Generate UUID for media item
- [ ] Generate thumbnail using thumbnailGenerator utility
- [ ] Extract image metadata (dimensions, size)
- [ ] Construct `MediaItem` object with all required fields
- [ ] Call `addMedia(mediaItem)` from props
- [ ] Update local captured photos array
- [ ] Handle "continue capturing" vs "proceed to next step" decision

**MediaItem Construction:**
```typescript
const createPhotoMediaItem = async (blob: Blob): Promise<MediaItem> => {
  const id = generateUUID();
  const thumbnail = await generateImageThumbnail(blob);
  const dimensions = await getImageDimensions(blob);

  return {
    id,
    type: 'image',
    file: blob,
    thumbnail,
    order: state.mediaItems.filter(m => m.type === 'image').length,
    metadata: {
      dimensions,
      mimeType: blob.type,
      fileSize: blob.size,
      source: 'capture',
    },
  };
};
```

---

### Task 4.8: Error Handling and Edge Cases

**Priority:** Medium
**Estimated Effort:** 1-2 hours
**Depends On:** Tasks 4.1-4.7

Handle error states and edge cases gracefully.

**Subtasks:**
- [ ] Display permission denied error with guidance
- [ ] Handle browser not supported scenario
- [ ] Handle capture failure errors
- [ ] Show error if no cameras available
- [ ] Handle max photos limit (config.maxPhotos)
- [ ] Disable camera switch if only one camera
- [ ] Handle interrupted capture (e.g., phone call)
- [ ] Memory management for multiple photos

**Error Display Pattern:**
```typescript
if (error) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-gray-900">{error.message}</h3>
      <p className="text-sm text-gray-500 mt-2">{getErrorGuidance(error.code)}</p>
      {error.recoverable && (
        <Button onClick={retryCamera} className="mt-4">Try Again</Button>
      )}
    </div>
  );
}
```

---

### Task 4.9: Accessibility and Polish

**Priority:** Medium
**Estimated Effort:** 1-2 hours
**Depends On:** Tasks 4.1-4.8

Ensure accessibility compliance and visual polish.

**Subtasks:**
- [ ] Add ARIA labels to all buttons
- [ ] Ensure keyboard navigation works
- [ ] Add focus indicators on interactive elements
- [ ] Screen reader announcements for photo capture
- [ ] Test with VoiceOver (iOS) and TalkBack (Android)
- [ ] Add loading spinner during camera init
- [ ] Smooth transitions between modes
- [ ] Capture button animation/visual feedback

---

## 5. Authorized Files and Functions for Modification

### 5.1 Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/components/steps/PhotoCaptureStep.tsx` | Main component implementation |

### 5.2 Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemCapture/components/steps/index.ts` | Export PhotoCaptureStep |
| `src/components/ItemCapture/components/CaptureWizard.tsx` | Add PhotoCaptureStep to step rendering |
| `src/components/ItemCapture/ItemCapture.types.ts` | Add PhotoCaptureStep-specific types if needed |
| `src/components/ItemCapture/index.ts` | Ensure step is accessible (if needed) |

### 5.3 Existing Components to Use (Do Not Modify)

| Component | Import From | Usage |
|-----------|-------------|-------|
| `CameraPreview` | `../shared/CameraPreview` | Display live camera feed |
| `StepNavigation` | `../shared/StepNavigation` | Back/Cancel/Continue buttons |
| `ProgressIndicator` | `../shared/ProgressIndicator` | Photo count display base |
| `ValidationMessage` | `../shared/ValidationMessage` | Error display |

### 5.4 Hooks to Use (Do Not Modify)

| Hook | Import From | Usage |
|------|-------------|-------|
| `useMediaCapture` | `../../hooks/useMediaCapture` | Camera and photo capture APIs |
| `useItemCaptureState` | Parent component provides | Wizard state management |

### 5.5 Utilities to Use (Do Not Modify)

| Utility | Import From | Usage |
|---------|-------------|-------|
| `generateUUID` | `@/lib/utils` or local function | Generate media item ID |
| `cn` | `@/lib/utils` | Class name merging |
| `generateImageThumbnail` | `../../utils/thumbnailGenerator` | Create thumbnail blob |

---

## 6. UI/UX Specifications

### 6.1 Layout Specifications

**Mobile (Primary):**
- Full-width camera preview
- Capture button centered and prominent (min 64x64px)
- Thumbnail strip at bottom, horizontally scrollable
- Minimum touch target: 48x48px
- Vertical stacking of elements

**Desktop:**
- Centered camera preview (max-width: 640px)
- Controls overlay on preview
- Larger thumbnail strip with more visible items

### 6.2 Color Scheme (Following Existing Patterns)

| Element | Tailwind Classes |
|---------|-----------------|
| Capture button (idle) | `bg-white border-4 border-gray-300 rounded-full` |
| Capture button (active) | `bg-gray-200 scale-95` |
| Capture button inner | `bg-red-500 rounded-full` or `bg-blue-500` |
| Camera switch | `bg-black/50 hover:bg-black/70 text-white rounded-full` |
| Flash indicator | `text-yellow-500` (on), `text-gray-400` (off) |
| Accept button | `bg-blue-600 hover:bg-blue-700 text-white` |
| Retake button | `bg-gray-100 hover:bg-gray-200 text-gray-700` |
| Thumbnail border (selected) | `ring-2 ring-blue-500` |
| Delete button on thumbnail | `bg-red-500 text-white rounded-full` |
| Photo count | `text-sm text-gray-600 font-medium` |

### 6.3 Icons (Lucide React)

| Action | Icon |
|--------|------|
| Capture photo | `Circle` (inner filled) or custom shutter |
| Switch camera | `SwitchCamera` or `RefreshCw` |
| Flash on | `Zap` |
| Flash off | `ZapOff` |
| Flash auto | `Zap` with badge |
| Accept | `Check` |
| Retake | `RotateCcw` |
| Delete thumbnail | `X` |
| Close gallery | `X` |
| Add more photos | `Plus` |
| Error | `AlertCircle` |

### 6.4 Capture Button Design

The capture button should follow smartphone camera UI conventions:

```
┌───────────────────────────────────────┐
│                                       │
│   ┌─────────────────────────────┐     │
│   │                             │     │
│   │   ┌───────────────────┐     │     │
│   │   │                   │     │     │
│   │   │   Inner circle    │     │     │  64-72px diameter
│   │   │   (captures)      │     │     │
│   │   │                   │     │     │
│   │   └───────────────────┘     │     │
│   │                             │     │
│   │   Outer ring (border)       │     │
│   └─────────────────────────────┘     │
│                                       │
└───────────────────────────────────────┘
```

---

## 7. Testing Considerations

### 7.1 Unit Tests

- [ ] Mode state transitions (preview → review → preview)
- [ ] Photo capture trigger
- [ ] Thumbnail strip update on photo accept
- [ ] MediaItem creation with correct fields
- [ ] Error state rendering
- [ ] Max photos limit enforcement

### 7.2 Integration Tests

- [ ] Hook integration with mocked MediaDevices
- [ ] Capture flow produces valid Blob
- [ ] Accept flow adds media to state
- [ ] Retake flow returns to preview
- [ ] Gallery mode displays correct photo
- [ ] Delete removes photo from state

### 7.3 Manual Testing Checklist

- [ ] iOS Safari 15+ on iPhone
- [ ] iOS Safari 15+ on iPad
- [ ] Chrome on Android phone
- [ ] Chrome on Android tablet
- [ ] Desktop Chrome/Firefox/Edge
- [ ] Camera permission grant flow
- [ ] Camera permission deny flow
- [ ] Front/back camera switching
- [ ] Photo capture (single and multiple)
- [ ] Haptic feedback on supported devices
- [ ] Photo review and accept
- [ ] Photo retake
- [ ] Thumbnail strip scrolling
- [ ] Thumbnail tap to gallery
- [ ] Photo deletion
- [ ] Max photos limit reached
- [ ] Cancel during capture
- [ ] Back button behavior
- [ ] Proceed with multiple photos

---

## 8. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| iOS Safari capture quirks | Medium | High | Test early on iOS; use canvas-based capture |
| Haptic API not available | Low | Low | Feature detection; silent fallback |
| Memory pressure with many photos | Medium | High | Limit thumbnails in memory; revoke URLs aggressively |
| Flash API limitations | High | Low | Informational only; document browser limitations |
| Slow thumbnail generation | Low | Medium | Generate async; show loading state |
| Object URL memory leaks | Medium | High | Comprehensive revoke on unmount and mode changes |

---

## 9. Success Criteria

| Criterion | Measurement |
|-----------|-------------|
| Capture works | User can capture photo on target browsers |
| Haptic feedback | Vibration triggers on supported devices |
| Camera switch works | User can toggle front/back camera |
| Flash indicator shows | Device flash status displayed correctly |
| Preview works | Captured photo displays for review |
| Accept works | Photo is added to wizard state with correct metadata |
| Retake works | User can discard and capture again |
| Thumbnail strip works | Captured photos appear as thumbnails |
| Gallery works | User can tap thumbnail to view full photo |
| Multi-photo works | User can capture up to maxPhotos |
| Errors handled | Permission denied shows helpful message |
| Mobile-friendly | Touch targets meet 48px minimum |

---

## 10. Comparison with VideoCaptureStep

| Aspect | VideoCaptureStep | PhotoCaptureStep |
|--------|------------------|------------------|
| Media type | Single video | Multiple photos |
| Capture action | Start/stop recording | Single capture |
| Duration | Timer (max 2 min) | Instant |
| Review | Video playback | Image preview |
| Multi-item | No (one video) | Yes (thumbnail strip) |
| Haptic feedback | No | Yes (on capture) |
| Flash control | No | Indicator (informational) |

---

## 11. References

### Internal Documents
- Implementation Plan: `/docs/prd/item-capture-implementation-plan.md`
- Request Definition: `/docs/gen_requests.md` (REQ-039)
- useMediaCapture Overview: `/docs/REQ-036-create-usemediacapture-hook-overview.md`
- CameraPreview Overview: `/docs/REQ-037-build-camerapreview-component-overview.md`
- VideoCaptureStep Overview: `/docs/REQ-038-implement-videocapturestep-overview.md`

### External References
- [MediaDevices.getUserMedia() - MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [Canvas.toBlob() - MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob)
- [Navigator.vibrate() - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate)
- [Lucide React Icons](https://lucide.dev/icons/)

### Codebase Patterns
- Form handling: `src/components/ItemForm.tsx`
- Modal overlays: `src/components/ConfirmationModal.tsx`
- Class utilities: `src/lib/utils.ts`
- Async hook patterns: `src/hooks/useQRCodeGeneration.ts`

---

## Appendix A: Component Code Skeleton

```typescript
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Camera,
  SwitchCamera,
  Zap,
  ZapOff,
  Check,
  RotateCcw,
  X,
  Plus,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CameraPreview } from '../shared/CameraPreview';
import { StepNavigation } from '../shared/StepNavigation';
import { useMediaCapture } from '../../hooks/useMediaCapture';
import type {
  ItemCaptureState,
  MediaItem,
  WizardStep,
  ItemCaptureConfig
} from '../../ItemCapture.types';

type PhotoCaptureMode = 'preview' | 'review' | 'gallery';

interface CapturedPhoto {
  id: string;
  blob: Blob;
  url: string;
  thumbnailUrl: string;
}

interface PhotoCaptureStepProps {
  state: ItemCaptureState;
  addMedia: (media: MediaItem) => void;
  goToStep: (step: WizardStep) => void;
  prevStep: () => void;
  config: ItemCaptureConfig;
  className?: string;
}

export function PhotoCaptureStep({
  state,
  addMedia,
  goToStep,
  prevStep,
  config,
  className,
}: PhotoCaptureStepProps) {
  const [mode, setMode] = useState<PhotoCaptureMode>('preview');
  const [capturedPhoto, setCapturedPhoto] = useState<Blob | null>(null);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const {
    stream,
    isCameraActive,
    error,
    permissionStatus,
    devices,
    facingMode,
    capabilities,
    startCamera,
    stopCamera,
    switchCamera,
    capturePhoto,
  } = useMediaCapture({
    initialFacingMode: 'environment',
    resolution: config.videoResolution || { width: 1920, height: 1080 },
  });

  const maxPhotos = config.maxPhotos ?? 10;

  // Initialize camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      // Cleanup all object URLs
      capturedPhotos.forEach(photo => {
        URL.revokeObjectURL(photo.url);
        URL.revokeObjectURL(photo.thumbnailUrl);
      });
      if (capturedPhotoUrl) {
        URL.revokeObjectURL(capturedPhotoUrl);
      }
    };
  }, []);

  // Haptic feedback helper
  const triggerHaptic = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }, []);

  // Handle photo capture
  const handleCapturePhoto = useCallback(async () => {
    if (capturedPhotos.length >= maxPhotos) {
      // Show max photos error
      return;
    }

    setIsCapturing(true);
    triggerHaptic();

    try {
      const photoBlob = await capturePhoto();
      if (photoBlob) {
        const photoUrl = URL.createObjectURL(photoBlob);
        setCapturedPhoto(photoBlob);
        setCapturedPhotoUrl(photoUrl);
        setMode('review');
      }
    } catch (err) {
      // Handle error
      console.error('Photo capture failed:', err);
    } finally {
      setIsCapturing(false);
    }
  }, [capturePhoto, capturedPhotos.length, maxPhotos, triggerHaptic]);

  // Handle accept photo
  const handleAcceptPhoto = useCallback(async () => {
    if (!capturedPhoto || !capturedPhotoUrl) return;

    // Generate thumbnail and create MediaItem
    // ... implementation

    // Reset for next capture
    setCapturedPhoto(null);
    setCapturedPhotoUrl(null);
    setMode('preview');
  }, [capturedPhoto, capturedPhotoUrl, addMedia]);

  // Handle retake
  const handleRetake = useCallback(() => {
    if (capturedPhotoUrl) {
      URL.revokeObjectURL(capturedPhotoUrl);
    }
    setCapturedPhoto(null);
    setCapturedPhotoUrl(null);
    setMode('preview');
  }, [capturedPhotoUrl]);

  // ... render logic for different modes

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Mode-specific content */}
      {mode === 'preview' && (
        <>
          <CameraPreview
            stream={stream}
            isLoading={!isCameraActive}
            error={error}
            isMirrored={facingMode === 'user'}
          />
          {/* Capture controls */}
          {/* Thumbnail strip */}
        </>
      )}

      {mode === 'review' && capturedPhotoUrl && (
        <>
          {/* Photo preview */}
          {/* Accept/Retake buttons */}
        </>
      )}

      {mode === 'gallery' && selectedPhotoIndex !== null && (
        <>
          {/* Gallery view */}
          {/* Close/Delete buttons */}
        </>
      )}

      <StepNavigation
        onPrevious={prevStep}
        onNext={() => goToStep('add-more')}
        previousLabel="Back"
        nextLabel={capturedPhotos.length > 0 ? 'Continue' : 'Skip'}
        nextDisabled={false}
      />
    </div>
  );
}
```

---

*Document generated for REQ-039 implementation planning.*
