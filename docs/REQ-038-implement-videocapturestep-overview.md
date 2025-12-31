# REQ-038: Implement VideoCaptureStep - Technical Overview

**Document Created:** 2025-12-31T11:30:00
**Last Modified:** 2025-12-31T11:30:00
**Request Reference:** REQ-038 in `/docs/gen_requests.md`
**Implementation Plan:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 2 - Media Capture
**Task ID:** 2.3

---

## 1. Executive Summary

This document provides a technical implementation breakdown for `VideoCaptureStep`, a wizard step component that enables users to record short videos of household items with full recording controls, duration limits, camera switching, and playback review capabilities.

### Feature Overview

| Aspect | Description |
|--------|-------------|
| **Component** | `VideoCaptureStep.tsx` |
| **Location** | `/src/components/ItemCapture/components/steps/` |
| **Purpose** | Video recording UI within the Item Capture wizard |
| **Dependencies** | `useMediaCapture` hook (REQ-036), `CameraPreview` component (REQ-037) |
| **Key Features** | Start/stop recording, countdown timer, auto-stop at 2 min, camera switching, playback review |

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
    └── 2.3 VideoCaptureStep (REQ-038) ◄── THIS TASK
              │
              ▼
        2.4 PhotoCaptureStep (REQ-039) [Parallel with 2.3]
```

### 2.2 Required Prerequisite Implementations

| Prerequisite | Status | Description |
|--------------|--------|-------------|
| `useItemCaptureState` hook | Required | Provides wizard state and navigation actions |
| `useMediaCapture` hook | Required | Camera initialization, recording, blob capture |
| `CameraPreview` component | Required | Displays live camera feed with mirror support |
| `StepNavigation` component | Required | Back/Next/Cancel navigation controls |
| Type definitions | Required | `MediaItem`, `WizardStep`, `ItemCaptureState` |

### 2.3 Related Spike Work

| Spike | Status | Relevance |
|-------|--------|-----------|
| REQ-028: Bundle Size Analysis | Complete | Validated lazy loading strategy |
| REQ-029: iOS Safari MediaRecorder | In Progress | Informs codec selection, fallback handling |

---

## 3. Technical Design

### 3.1 Component Architecture

```
VideoCaptureStep
├── CameraPreview (shared component)
│   └── Video element with live stream
├── RecordingControls
│   ├── Record/Stop button
│   ├── Camera switch button
│   └── Recording indicator (pulsing dot)
├── CountdownTimer
│   └── Elapsed time / Max duration display
├── VideoReview (conditional)
│   ├── Video player with controls
│   ├── Accept button
│   └── Retake button
└── StepNavigation (shared component)
```

### 3.2 Component States

The component operates in three distinct states:

```typescript
type VideoCaptureMode =
  | 'preview'    // Camera active, ready to record
  | 'recording'  // Actively recording video
  | 'review';    // Recorded video ready for review
```

**State Transitions:**

```
           ┌────────────────────────────────────────┐
           │                                        │
           ▼                                        │
      ┌─────────┐   startRecording   ┌───────────┐ │
      │ PREVIEW │ ────────────────► │ RECORDING │ │
      └─────────┘                    └───────────┘ │
           ▲                              │        │
           │                              │        │
           │       stopRecording /        │        │
           │       autoStop (2 min)       │        │
           │                              ▼        │
           │                        ┌──────────┐   │
           │        retake          │  REVIEW  │   │
           └──────────────────────── └──────────┘  │
                                          │        │
                                   accept │        │
                                          ▼        │
                                    addMedia() ────┘
                                    goToStep('add-more' | 'review')
```

### 3.3 Props Interface

```typescript
interface VideoCaptureStepProps {
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
interface VideoCaptureInternalState {
  mode: VideoCaptureMode;
  recordedBlob: Blob | null;
  recordedUrl: string | null;
  elapsedTime: number;
  error: VideoCaptureError | null;
}

interface VideoCaptureError {
  code: 'RECORDING_FAILED' | 'BROWSER_NOT_SUPPORTED' | 'PERMISSION_DENIED';
  message: string;
  recoverable: boolean;
}
```

### 3.5 Key Behaviors

#### Recording Timer
- Starts at 0:00, counts up to max duration (default 2:00)
- Updates every second using `setInterval`
- Displays as MM:SS / MM:SS (elapsed / max)
- Auto-stops recording when max duration reached

#### Camera Switching
- Only available in `preview` mode (not during recording)
- Uses `useMediaCapture.switchCamera()`
- Toggles between front/back cameras
- Disabled if only one camera available

#### Recording Indicator
- Red pulsing dot with "REC" text
- Visible only in `recording` mode
- CSS animation for pulse effect

#### Video Review
- Creates object URL from recorded Blob
- Native video controls (play, pause, scrub)
- Accept: creates MediaItem, adds to wizard state
- Retake: revokes URL, returns to preview mode

---

## 4. Implementation Tasks

### Task 4.1: Create VideoCaptureStep Component Shell

**Priority:** High
**Estimated Effort:** 1-2 hours

Create the basic component structure with mode state management.

**Subtasks:**
- [ ] Create `/src/components/ItemCapture/components/steps/VideoCaptureStep.tsx`
- [ ] Define `VideoCaptureStepProps` interface
- [ ] Implement mode state (`preview` | `recording` | `review`)
- [ ] Add `'use client'` directive
- [ ] Set up basic layout structure with Tailwind classes

**Files to Create:**
- `src/components/ItemCapture/components/steps/VideoCaptureStep.tsx`

---

### Task 4.2: Integrate useMediaCapture Hook

**Priority:** High
**Estimated Effort:** 1-2 hours
**Depends On:** Task 4.1

Wire up the media capture hook for camera and recording functionality.

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
  isRecording,
  isCameraActive,
  error,
  permissionStatus,
  startCamera,
  stopCamera,
  startRecording,
  stopRecording,
  switchCamera,
  devices,
  facingMode,
} = useMediaCapture();
```

---

### Task 4.3: Build Recording Controls UI

**Priority:** High
**Estimated Effort:** 2-3 hours
**Depends On:** Task 4.2

Create the recording button, camera switch, and recording indicator.

**Subtasks:**
- [ ] Create record button with start/stop toggle
- [ ] Add camera switch button (show only if multiple cameras)
- [ ] Implement recording indicator (pulsing red dot + "REC")
- [ ] Style controls for mobile-first (min 48x48px touch targets)
- [ ] Add disabled states during camera initialization

**UI Layout (Recording Mode):**
```
┌─────────────────────────────────────┐
│                                     │
│          CameraPreview              │
│                                     │
│  [REC ●]                   [1:23]   │  ← Recording indicator + timer
│                                     │
├─────────────────────────────────────┤
│                                     │
│     [🔄]           [⏹️]             │  ← Switch camera + Stop button
│                                     │
└─────────────────────────────────────┘
```

---

### Task 4.4: Implement Countdown Timer

**Priority:** High
**Estimated Effort:** 1-2 hours
**Depends On:** Task 4.3

Create timer display and auto-stop logic.

**Subtasks:**
- [ ] Track elapsed time with `setInterval` (1000ms)
- [ ] Display elapsed time as MM:SS
- [ ] Show remaining time indicator (e.g., "1:23 / 2:00")
- [ ] Trigger `stopRecording` when max duration reached
- [ ] Clear interval on mode change or unmount
- [ ] Handle config.maxVideoDuration (default 120s)

**Timer Logic:**
```typescript
useEffect(() => {
  if (mode !== 'recording') return;

  const interval = setInterval(() => {
    setElapsedTime(prev => {
      const next = prev + 1;
      if (next >= config.maxVideoDuration) {
        handleStopRecording();
      }
      return next;
    });
  }, 1000);

  return () => clearInterval(interval);
}, [mode, config.maxVideoDuration]);
```

---

### Task 4.5: Build Video Review Screen

**Priority:** High
**Estimated Effort:** 2-3 hours
**Depends On:** Task 4.4

Create the playback review interface with accept/retake options.

**Subtasks:**
- [ ] Create object URL from recorded Blob
- [ ] Render native `<video>` element with controls
- [ ] Add Accept button (primary style)
- [ ] Add Retake button (secondary style)
- [ ] Revoke object URL on retake or accept
- [ ] Style video player container (aspect ratio, borders)

**Review UI Layout:**
```
┌─────────────────────────────────────┐
│                                     │
│         Video Player                │
│    ┌─────────────────────────┐      │
│    │  ▶ [───────●────] 1:23  │      │
│    └─────────────────────────┘      │
│                                     │
├─────────────────────────────────────┤
│                                     │
│   [Retake]              [Accept ✓]  │
│                                     │
└─────────────────────────────────────┘
```

---

### Task 4.6: Handle Accept and Add Media

**Priority:** High
**Estimated Effort:** 1-2 hours
**Depends On:** Task 4.5

Create MediaItem from recorded video and integrate with wizard state.

**Subtasks:**
- [ ] Generate UUID for media item
- [ ] Extract video metadata (duration, dimensions, size)
- [ ] Generate thumbnail from first frame (use thumbnailGenerator utility)
- [ ] Construct `MediaItem` object with all required fields
- [ ] Call `addMedia(mediaItem)` from props
- [ ] Navigate to next step via `goToStep()`
- [ ] Handle "add more" vs "go to review" decision

**MediaItem Construction:**
```typescript
const createVideoMediaItem = async (blob: Blob): Promise<MediaItem> => {
  const id = generateUUID();
  const thumbnail = await generateVideoThumbnail(blob);
  const duration = await getVideoDuration(blob);

  return {
    id,
    type: 'video',
    file: blob,
    thumbnail,
    order: state.mediaItems.length,
    metadata: {
      duration,
      mimeType: blob.type,
      fileSize: blob.size,
      source: 'capture',
    },
  };
};
```

---

### Task 4.7: Error Handling and Edge Cases

**Priority:** Medium
**Estimated Effort:** 1-2 hours
**Depends On:** Tasks 4.1-4.6

Handle error states and edge cases gracefully.

**Subtasks:**
- [ ] Display permission denied error with guidance
- [ ] Handle browser not supported scenario
- [ ] Handle recording failure (MediaRecorder errors)
- [ ] Show error if no cameras available
- [ ] Disable camera switch if only one camera
- [ ] Handle interrupted recording (e.g., phone call)
- [ ] Graceful fallback messaging for iOS Safari quirks

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

### Task 4.8: Accessibility and Polish

**Priority:** Medium
**Estimated Effort:** 1-2 hours
**Depends On:** Tasks 4.1-4.7

Ensure accessibility compliance and visual polish.

**Subtasks:**
- [ ] Add ARIA labels to all buttons
- [ ] Ensure keyboard navigation works
- [ ] Add focus indicators on interactive elements
- [ ] Screen reader announcements for state changes
- [ ] Test with VoiceOver (iOS) and TalkBack (Android)
- [ ] Add loading spinner during camera init
- [ ] Smooth transitions between modes

---

## 5. Authorized Files and Functions for Modification

### 5.1 Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/components/steps/VideoCaptureStep.tsx` | Main component implementation |

### 5.2 Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemCapture/components/steps/index.ts` | Export VideoCaptureStep |
| `src/components/ItemCapture/components/CaptureWizard.tsx` | Add VideoCaptureStep to step rendering |
| `src/components/ItemCapture/index.ts` | Ensure step is accessible (if needed) |

### 5.3 Existing Components to Use (Do Not Modify)

| Component | Import From | Usage |
|-----------|-------------|-------|
| `CameraPreview` | `../shared/CameraPreview` | Display live camera feed |
| `StepNavigation` | `../shared/StepNavigation` | Back/Cancel buttons |
| `ProgressIndicator` | `../shared/ProgressIndicator` | Timer display base |
| `ValidationMessage` | `../shared/ValidationMessage` | Error display |

### 5.4 Hooks to Use (Do Not Modify)

| Hook | Import From | Usage |
|------|-------------|-------|
| `useMediaCapture` | `../../hooks/useMediaCapture` | Camera and recording APIs |
| `useItemCaptureState` | Parent component provides | Wizard state management |

### 5.5 Utilities to Use (Do Not Modify)

| Utility | Import From | Usage |
|---------|-------------|-------|
| `generateUUID` | `@/lib/utils` or local | Generate media item ID |
| `cn` | `@/lib/utils` | Class name merging |
| `generateVideoThumbnail` | `../../utils/thumbnailGenerator` | Create thumbnail blob |

---

## 6. UI/UX Specifications

### 6.1 Layout Specifications

**Mobile (Primary):**
- Full-width camera preview
- Recording controls below preview
- Minimum touch target: 48x48px
- Vertical stacking of elements

**Desktop:**
- Centered camera preview (max-width: 640px)
- Controls overlay on preview bottom
- Larger button sizes for clarity

### 6.2 Color Scheme (Following Existing Patterns)

| Element | Tailwind Classes |
|---------|-----------------|
| Record button (idle) | `bg-red-500 hover:bg-red-600 text-white` |
| Record button (recording) | `bg-red-600 animate-pulse` |
| Stop button | `bg-gray-700 hover:bg-gray-800 text-white` |
| Camera switch | `bg-black/50 hover:bg-black/70 text-white` |
| Recording indicator | `bg-red-500 rounded-full animate-pulse` |
| Timer text | `text-white font-mono` |
| Accept button | `bg-blue-600 hover:bg-blue-700 text-white` |
| Retake button | `bg-gray-100 hover:bg-gray-200 text-gray-700` |

### 6.3 Icons (Lucide React)

| Action | Icon |
|--------|------|
| Start recording | `Circle` (filled) |
| Stop recording | `Square` |
| Switch camera | `SwitchCamera` or `RefreshCw` |
| Recording indicator | `Circle` (small, filled, pulsing) |
| Accept | `Check` |
| Retake | `RotateCcw` |
| Error | `AlertCircle` |

---

## 7. Testing Considerations

### 7.1 Unit Tests

- [ ] Mode state transitions (preview → recording → review)
- [ ] Timer countdown logic
- [ ] Auto-stop at max duration
- [ ] MediaItem creation with correct fields
- [ ] Error state rendering

### 7.2 Integration Tests

- [ ] Hook integration with mocked MediaDevices
- [ ] Navigation integration with wizard state
- [ ] Accept flow adds media to state
- [ ] Retake flow returns to preview

### 7.3 Manual Testing Checklist

- [ ] iOS Safari 15+ on iPhone
- [ ] iOS Safari 15+ on iPad
- [ ] Chrome on Android phone
- [ ] Chrome on Android tablet
- [ ] Desktop Chrome/Firefox/Edge
- [ ] Camera permission grant flow
- [ ] Camera permission deny flow
- [ ] Front/back camera switching
- [ ] Full 2-minute recording
- [ ] Early stop recording
- [ ] Video playback in review
- [ ] Accept and add to wizard
- [ ] Retake and re-record
- [ ] Cancel during recording
- [ ] Back button during preview

---

## 8. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| iOS Safari MediaRecorder quirks | High | High | Use codec detection from useMediaCapture; fallback to photo-only |
| Large video files (>100MB) | Medium | Medium | Enforce 2-min limit; consider resolution reduction |
| Memory pressure | Medium | High | Revoke object URLs; limit preview quality |
| Recording interrupted | Medium | Low | Save partial recording; allow retry |
| Browser tab backgrounded | Medium | Medium | Pause timer; warn user on resume |

---

## 9. Success Criteria

| Criterion | Measurement |
|-----------|-------------|
| Recording works | User can record 30-second video on target browsers |
| Timer accurate | Elapsed time matches actual recording duration |
| Auto-stop works | Recording stops automatically at 2 minutes |
| Camera switch works | User can toggle front/back camera before recording |
| Review works | Recorded video plays back correctly |
| Accept works | Video is added to wizard state with correct metadata |
| Retake works | User can discard and record again |
| Errors handled | Permission denied shows helpful message |
| Mobile-friendly | Touch targets meet 48px minimum |

---

## 10. References

### Internal Documents
- Implementation Plan: `/docs/prd/item-capture-implementation-plan.md`
- Request Definition: `/docs/gen_requests.md` (REQ-038)
- useMediaCapture Overview: `/docs/REQ-036-create-usemediacapture-hook-overview.md`
- CameraPreview Overview: `/docs/REQ-037-build-camerapreview-component-overview.md`

### External References
- [MediaRecorder API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [MediaDevices API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices)
- [Lucide React Icons](https://lucide.dev/icons/)

### Codebase Patterns
- Form handling: `src/components/ItemForm.tsx`
- Modal overlays: `src/components/ConfirmationModal.tsx`
- Class utilities: `src/lib/utils.ts`

---

## Appendix A: Component Code Skeleton

```typescript
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Circle, Square, SwitchCamera, Check, RotateCcw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CameraPreview } from '../shared/CameraPreview';
import { StepNavigation } from '../shared/StepNavigation';
import { useMediaCapture } from '../../hooks/useMediaCapture';
import type { ItemCaptureState, MediaItem, WizardStep, ItemCaptureConfig } from '../../ItemCapture.types';

type VideoCaptureMode = 'preview' | 'recording' | 'review';

interface VideoCaptureStepProps {
  state: ItemCaptureState;
  addMedia: (media: MediaItem) => void;
  goToStep: (step: WizardStep) => void;
  prevStep: () => void;
  config: ItemCaptureConfig;
  className?: string;
}

export function VideoCaptureStep({
  state,
  addMedia,
  goToStep,
  prevStep,
  config,
  className,
}: VideoCaptureStepProps) {
  const [mode, setMode] = useState<VideoCaptureMode>('preview');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const {
    stream,
    isCameraActive,
    isRecording,
    error,
    permissionStatus,
    devices,
    facingMode,
    startCamera,
    stopCamera,
    startRecording,
    stopRecording,
    switchCamera,
  } = useMediaCapture();

  const maxDuration = config.maxVideoDuration ?? 120;

  // Initialize camera on mount
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // Timer logic
  useEffect(() => {
    if (mode !== 'recording') return;

    const interval = setInterval(() => {
      setElapsedTime(prev => {
        const next = prev + 1;
        if (next >= maxDuration) {
          handleStopRecording();
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [mode, maxDuration]);

  // ... handlers and render logic
}
```

---

*Document generated for REQ-038 implementation planning.*
