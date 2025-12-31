# REQ-038: Implement VideoCaptureStep - Detailed Task Breakdown

**Document Created:** 2025-12-31T14:30:00
**Last Modified:** 2025-12-31T14:30:00
**Overview Document:** `/docs/REQ-038-implement-videocapturestep-overview.md`
**Request Reference:** REQ-038 in `/docs/gen_requests.md`
**Implementation Plan:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 2 - Media Capture
**Task ID:** 2.3

---

## Executive Summary

This document provides granular, actionable implementation tasks for `VideoCaptureStep`, a wizard step component enabling video recording within the Item Capture workflow. Each task is scoped to ≤1 story point (a few hours of focused work).

### Prerequisites

Before starting implementation, ensure the following are complete:
- REQ-031: Component directory structure
- REQ-032: State machine hook (`useItemCaptureState`)
- REQ-033: Wizard navigation scaffold
- REQ-036: `useMediaCapture` hook
- REQ-037: `CameraPreview` component

---

## Authorized Files for Modification

### Files to Create
| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/components/steps/VideoCaptureStep.tsx` | Main component implementation |

### Files to Modify
| File Path | Modification |
|-----------|--------------|
| `src/components/ItemCapture/components/steps/index.ts` | Export VideoCaptureStep |
| `src/components/ItemCapture/components/CaptureWizard.tsx` | Add VideoCaptureStep to step rendering |
| `src/components/ItemCapture/index.ts` | Ensure step is accessible (if needed) |

### Existing Components to Use (Do Not Modify)
| Component | Import From | Usage |
|-----------|-------------|-------|
| `CameraPreview` | `../shared/CameraPreview` | Display live camera feed |
| `StepNavigation` | `../shared/StepNavigation` | Back/Cancel buttons |
| `ProgressIndicator` | `../shared/ProgressIndicator` | Timer display base |
| `ValidationMessage` | `../shared/ValidationMessage` | Error display |

### Hooks to Use (Do Not Modify)
| Hook | Import From | Usage |
|------|-------------|-------|
| `useMediaCapture` | `../../hooks/useMediaCapture` | Camera and recording APIs |
| `useItemCaptureState` | Parent component provides | Wizard state management |

### Utilities to Use (Do Not Modify)
| Utility | Import From | Usage |
|---------|-------------|-------|
| `generateUUID` | `@/lib/utils` or local | Generate media item ID |
| `cn` | `@/lib/utils` | Class name merging |
| `generateVideoThumbnail` | `../../utils/thumbnailGenerator` | Create thumbnail blob |

---

## Implementation Tasks

### Task 1: Create VideoCaptureStep Component Shell

**Story Points:** 1
**Depends On:** REQ-036, REQ-037 (useMediaCapture, CameraPreview)
**Estimated Time:** 1-2 hours

#### Objective
Create the basic component structure with mode state management and proper TypeScript interfaces.

#### Implementation Steps

1. **Create the component file**
   - File: `src/components/ItemCapture/components/steps/VideoCaptureStep.tsx`
   - Add `'use client'` directive at the top
   - Import React hooks: `useState`, `useEffect`, `useCallback`, `useRef`

2. **Define the VideoCaptureMode type**
   ```typescript
   type VideoCaptureMode = 'preview' | 'recording' | 'review';
   ```

3. **Define the VideoCaptureStepProps interface**
   ```typescript
   interface VideoCaptureStepProps {
     state: ItemCaptureState;
     addMedia: (media: MediaItem) => void;
     goToStep: (step: WizardStep) => void;
     prevStep: () => void;
     config: ItemCaptureConfig;
     className?: string;
   }
   ```

4. **Define the internal error interface**
   ```typescript
   interface VideoCaptureError {
     code: 'RECORDING_FAILED' | 'BROWSER_NOT_SUPPORTED' | 'PERMISSION_DENIED';
     message: string;
     recoverable: boolean;
   }
   ```

5. **Create the basic component structure**
   - Initialize mode state with default `'preview'`
   - Initialize `recordedBlob` and `recordedUrl` as null
   - Initialize `elapsedTime` as 0
   - Initialize `error` state as null
   - Set up basic layout container with Tailwind classes

6. **Set up component export**
   - Export the component as a named export

#### Acceptance Criteria
- [ ] File created at the correct path
- [ ] Component compiles without TypeScript errors
- [ ] Props interface matches the contract from overview document
- [ ] Mode state can be changed between 'preview', 'recording', 'review'
- [ ] Component renders an empty container in each mode

#### Verification Steps
1. Import the component in a test file and verify no compile errors
2. Render the component with mock props and verify it mounts
3. Verify mode state transitions work correctly in isolation

---

### Task 2: Integrate useMediaCapture Hook

**Story Points:** 1
**Depends On:** Task 1
**Estimated Time:** 1-2 hours

#### Objective
Wire up the media capture hook for camera and recording functionality with proper lifecycle management.

#### Implementation Steps

1. **Import the useMediaCapture hook**
   ```typescript
   import { useMediaCapture } from '../../hooks/useMediaCapture';
   ```

2. **Destructure hook values in the component**
   ```typescript
   const {
     stream,
     isCameraActive,
     isRecording,
     error: cameraError,
     permissionStatus,
     devices,
     facingMode,
     startCamera,
     stopCamera,
     startRecording,
     stopRecording,
     switchCamera,
   } = useMediaCapture();
   ```

3. **Initialize camera on component mount**
   - Use `useEffect` with empty dependency array
   - Call `startCamera()` on mount
   - Return cleanup function that calls `stopCamera()`

4. **Handle permission status**
   - Check `permissionStatus` for 'denied' state
   - Map camera errors to component error state
   - Show loading state when `!isCameraActive && !cameraError`

5. **Create loading state UI**
   - Center a loading spinner
   - Display "Initializing camera..." message
   - Use existing design patterns from codebase

6. **Map hook errors to component errors**
   - Create `mapHookErrorToComponentError` helper function
   - Handle permission denied, not supported, and generic errors

#### Acceptance Criteria
- [ ] Camera initializes when component mounts
- [ ] Camera stops when component unmounts
- [ ] Loading state displays during camera initialization
- [ ] Permission denied error displays with user guidance
- [ ] Hook error states are properly mapped to component errors

#### Verification Steps
1. Mount component and verify camera permission prompt appears
2. Grant permission and verify camera activates
3. Unmount component and verify camera stream stops
4. Deny permission and verify error message displays

---

### Task 3: Build Recording Controls UI - Preview Mode

**Story Points:** 1
**Depends On:** Task 2
**Estimated Time:** 1-2 hours

#### Objective
Create the recording controls for preview mode including start record button and camera switch.

#### Implementation Steps

1. **Import required icons from Lucide React**
   ```typescript
   import { Circle, SwitchCamera } from 'lucide-react';
   ```

2. **Import CameraPreview component**
   ```typescript
   import { CameraPreview } from '../shared/CameraPreview';
   ```

3. **Create preview mode render section**
   - Render CameraPreview with stream prop when mode is 'preview'
   - Add container for controls below preview

4. **Build start recording button**
   - Large circular button with red background
   - Use `Circle` icon filled to represent record
   - Minimum touch target: 64x64px
   - Apply styles: `bg-red-500 hover:bg-red-600 text-white rounded-full`
   - Add `onClick` handler to start recording
   - Add `aria-label="Start recording"`

5. **Build camera switch button**
   - Smaller button positioned to the left of record button
   - Use `SwitchCamera` icon
   - Semi-transparent background: `bg-black/50 hover:bg-black/70`
   - Only render if `devices.length > 1`
   - Add `disabled` state when recording
   - Add `onClick` handler to call `switchCamera()`
   - Add `aria-label="Switch camera"`

6. **Create handleStartRecording function**
   - Reset `elapsedTime` to 0
   - Set mode to 'recording'
   - Call `startRecording()` from hook
   - Handle any recording start errors

#### Acceptance Criteria
- [ ] Camera preview displays live feed
- [ ] Start recording button is visible and properly sized (min 64x64px)
- [ ] Camera switch button appears when multiple cameras available
- [ ] Camera switch button hidden when only one camera
- [ ] Clicking start recording changes mode to 'recording'
- [ ] All buttons have proper ARIA labels

#### Verification Steps
1. Verify CameraPreview shows live video
2. Click start button and verify recording begins
3. Test with single camera - verify switch button hidden
4. Test with multiple cameras - verify switch works

---

### Task 4: Build Recording Controls UI - Recording Mode

**Story Points:** 1
**Depends On:** Task 3
**Estimated Time:** 1-2 hours

#### Objective
Create the recording indicator, stop button, and visual feedback during active recording.

#### Implementation Steps

1. **Import additional icons**
   ```typescript
   import { Square } from 'lucide-react';
   ```

2. **Create recording mode render section**
   - Render CameraPreview with stream (same as preview)
   - Overlay recording controls on top of preview

3. **Build recording indicator**
   - Container positioned top-left of preview
   - Red pulsing dot: `bg-red-500 rounded-full animate-pulse w-3 h-3`
   - "REC" text label next to dot: `text-white text-sm font-medium`
   - Semi-transparent background: `bg-black/50 px-2 py-1 rounded`

4. **Build stop recording button**
   - Replace start button with stop button during recording
   - Square shape to differentiate from record: `bg-gray-700 hover:bg-gray-800`
   - Use `Square` icon
   - Maintain same size (64x64px minimum)
   - Add `aria-label="Stop recording"`

5. **Create handleStopRecording function**
   - Call `stopRecording()` from hook
   - Capture the returned blob
   - Create object URL from blob: `URL.createObjectURL(blob)`
   - Store blob in `recordedBlob` state
   - Store URL in `recordedUrl` state
   - Set mode to 'review'

6. **Disable camera switch during recording**
   - Keep button visible but disabled
   - Add disabled styles: `opacity-50 cursor-not-allowed`

7. **Add CSS animation for pulsing dot**
   - Use Tailwind's built-in `animate-pulse` class
   - Or define custom keyframe if more control needed

#### Acceptance Criteria
- [ ] Recording indicator visible when recording
- [ ] Recording indicator pulses to indicate active recording
- [ ] Stop button replaces start button during recording
- [ ] Camera switch is disabled during recording
- [ ] Clicking stop captures blob and transitions to review mode
- [ ] Object URL created for playback

#### Verification Steps
1. Start recording - verify indicator appears
2. Verify indicator pulses visually
3. Click stop - verify mode changes to review
4. Verify blob is captured (check state in React DevTools)

---

### Task 5: Implement Countdown Timer Display

**Story Points:** 1
**Depends On:** Task 4
**Estimated Time:** 1-2 hours

#### Objective
Create timer display showing elapsed time and implement auto-stop at maximum duration.

#### Implementation Steps

1. **Create formatTime helper function**
   ```typescript
   const formatTime = (seconds: number): string => {
     const mins = Math.floor(seconds / 60);
     const secs = seconds % 60;
     return `${mins}:${secs.toString().padStart(2, '0')}`;
   };
   ```

2. **Extract max duration from config**
   ```typescript
   const maxDuration = config.maxVideoDuration ?? 120; // Default 2 minutes
   ```

3. **Create timer effect**
   - Only run when mode is 'recording'
   - Use `setInterval` with 1000ms interval
   - Increment `elapsedTime` each tick
   - Check if elapsed time >= maxDuration
   - Call `handleStopRecording()` when limit reached
   - Clear interval on cleanup and mode change

4. **Create timer display component section**
   - Position in top-right of preview area
   - Semi-transparent background: `bg-black/50 px-3 py-1 rounded`
   - Display format: "0:45 / 2:00" (elapsed / max)
   - Use monospace font for consistent width: `font-mono`
   - White text: `text-white text-sm`

5. **Add timer warning visual**
   - When remaining time < 30 seconds, change text color
   - Apply `text-red-400` when approaching limit
   - Optional: add subtle animation when < 10 seconds

6. **Handle interval cleanup**
   - Store interval ID in ref: `const timerRef = useRef<NodeJS.Timeout | null>(null)`
   - Clear on unmount
   - Clear when mode changes from 'recording'
   - Clear when manually stopping

#### Acceptance Criteria
- [ ] Timer displays in MM:SS format
- [ ] Timer shows both elapsed and max duration
- [ ] Timer updates every second during recording
- [ ] Recording auto-stops at max duration
- [ ] Timer warning color appears when < 30 seconds remain
- [ ] Interval properly cleaned up on mode change or unmount

#### Verification Steps
1. Start recording and verify timer counts up
2. Wait for full duration and verify auto-stop
3. Stop early and verify interval is cleared (no memory leak)
4. Unmount during recording and verify no errors

---

### Task 6: Build Video Review Screen - Video Player

**Story Points:** 1
**Depends On:** Task 5
**Estimated Time:** 1-2 hours

#### Objective
Create the video playback interface for reviewing recorded content before accepting or retaking.

#### Implementation Steps

1. **Create review mode render section**
   - Only render when mode is 'review'
   - Replace CameraPreview with video player

2. **Build video player container**
   - Full-width container with aspect ratio preservation
   - Apply aspect ratio: `aspect-video` or `aspect-[16/9]`
   - Add border and rounded corners for polish
   - Background: `bg-black`

3. **Create native video element**
   - Set `src` to `recordedUrl`
   - Enable `controls` attribute for native playback controls
   - Add `playsInline` for iOS compatibility
   - Add `preload="metadata"` for faster load
   - Apply styles: `w-full h-full rounded-lg`

4. **Create video ref for programmatic access**
   ```typescript
   const videoRef = useRef<HTMLVideoElement>(null);
   ```

5. **Handle video load events**
   - Add `onLoadedMetadata` handler
   - Log duration for debugging if config.debug is true

6. **Add error handling for video playback**
   - Add `onError` handler to video element
   - Display user-friendly error if video fails to load

7. **Style the review container**
   - Center the video player
   - Add appropriate padding
   - Max width constraint for desktop: `max-w-2xl mx-auto`

#### Acceptance Criteria
- [ ] Recorded video displays in review mode
- [ ] Native video controls (play, pause, seek) work
- [ ] Video plays inline on iOS devices
- [ ] Video maintains aspect ratio
- [ ] Error state handled if video fails to load
- [ ] Playback works on target browsers (Chrome, Safari)

#### Verification Steps
1. Record a video and verify it plays in review mode
2. Test native controls: play, pause, seek
3. Test on iOS Safari - verify inline playback
4. Verify aspect ratio is maintained

---

### Task 7: Build Video Review Screen - Action Buttons

**Story Points:** 1
**Depends On:** Task 6
**Estimated Time:** 1-2 hours

#### Objective
Add Accept and Retake buttons to the review screen with proper styling and handlers.

#### Implementation Steps

1. **Import additional icons**
   ```typescript
   import { Check, RotateCcw } from 'lucide-react';
   ```

2. **Create action button container**
   - Position below video player
   - Flex container with gap: `flex gap-4 mt-6`
   - Center buttons on mobile, spread on desktop
   - Add padding for touch safety

3. **Build Retake button (secondary)**
   - Positioned on left
   - Secondary style: `bg-gray-100 hover:bg-gray-200 text-gray-700`
   - Use `RotateCcw` icon with label "Retake"
   - Minimum width for touch: `min-w-32`
   - Add `aria-label="Discard and record again"`

4. **Build Accept button (primary)**
   - Positioned on right
   - Primary style: `bg-blue-600 hover:bg-blue-700 text-white`
   - Use `Check` icon with label "Accept"
   - Minimum width for touch: `min-w-32`
   - Add `aria-label="Accept video"`

5. **Create handleRetake function**
   - Revoke current object URL to free memory
   - Reset `recordedBlob` to null
   - Reset `recordedUrl` to null
   - Reset `elapsedTime` to 0
   - Set mode back to 'preview'

6. **Create placeholder handleAccept function**
   - For now, just log the acceptance
   - Will be fully implemented in Task 8
   - Set mode back to 'preview' temporarily

7. **Add keyboard accessibility**
   - Ensure buttons are focusable
   - Add focus ring styles
   - Handle Enter/Space key press

#### Acceptance Criteria
- [ ] Retake button visible and styled correctly
- [ ] Accept button visible and styled correctly
- [ ] Retake clears video and returns to preview mode
- [ ] Object URL is revoked on retake (memory management)
- [ ] Buttons are keyboard accessible
- [ ] Buttons have minimum touch targets (44x44px)

#### Verification Steps
1. Click Retake - verify returns to preview mode
2. Verify old video URL is revoked (check memory in DevTools)
3. Click Accept - verify placeholder behavior works
4. Tab to buttons and press Enter - verify activation

---

### Task 8: Implement Accept and Add Media Logic

**Story Points:** 1
**Depends On:** Task 7
**Estimated Time:** 1-2 hours

#### Objective
Create MediaItem from recorded video, generate thumbnail, and integrate with wizard state.

#### Implementation Steps

1. **Import required utilities**
   ```typescript
   import { generateVideoThumbnail } from '../../utils/thumbnailGenerator';
   // Import or implement generateUUID
   ```

2. **Create generateUUID helper if not available**
   ```typescript
   const generateUUID = (): string => {
     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
       const r = (Math.random() * 16) | 0;
       const v = c === 'x' ? r : (r & 0x3) | 0x8;
       return v.toString(16);
     });
   };
   ```

3. **Create getVideoDuration helper**
   ```typescript
   const getVideoDuration = (blob: Blob): Promise<number> => {
     return new Promise((resolve) => {
       const video = document.createElement('video');
       video.preload = 'metadata';
       video.onloadedmetadata = () => {
         URL.revokeObjectURL(video.src);
         resolve(video.duration);
       };
       video.onerror = () => resolve(0);
       video.src = URL.createObjectURL(blob);
     });
   };
   ```

4. **Implement full handleAccept function**
   - Make function async to handle thumbnail generation
   - Generate UUID for media item
   - Generate thumbnail from first video frame
   - Get video duration
   - Construct MediaItem object with all required fields:
     ```typescript
     const mediaItem: MediaItem = {
       id: generateUUID(),
       type: 'video',
       file: recordedBlob,
       thumbnail,
       order: state.mediaItems.length,
       metadata: {
         duration,
         mimeType: recordedBlob.type,
         fileSize: recordedBlob.size,
         source: 'capture',
       },
     };
     ```

5. **Call addMedia from props**
   - Pass the constructed MediaItem
   - Handle any errors during add

6. **Navigate to next step**
   - Revoke the object URL (memory cleanup)
   - Call `goToStep('add-more')` to allow adding more content
   - Or conditionally navigate based on use case

7. **Add loading state during accept**
   - Show spinner while generating thumbnail
   - Disable buttons during processing
   - Display "Processing video..." message

#### Acceptance Criteria
- [ ] MediaItem created with correct type and fields
- [ ] UUID generated for the item
- [ ] Thumbnail generated from video
- [ ] Duration extracted correctly
- [ ] addMedia callback invoked with MediaItem
- [ ] Navigation to next step occurs
- [ ] Object URL revoked after acceptance
- [ ] Loading state shown during processing

#### Verification Steps
1. Accept a video - verify MediaItem structure in state
2. Verify thumbnail blob is created
3. Verify duration matches actual recording length
4. Verify object URL is revoked (no memory leak)
5. Verify navigation to add-more step

---

### Task 9: Implement Error Handling and Edge Cases

**Story Points:** 1
**Depends On:** Task 8
**Estimated Time:** 1-2 hours

#### Objective
Handle error states and edge cases gracefully with user-friendly messaging.

#### Implementation Steps

1. **Import error icon**
   ```typescript
   import { AlertCircle } from 'lucide-react';
   ```

2. **Create error guidance helper**
   ```typescript
   const getErrorGuidance = (code: string): string => {
     switch (code) {
       case 'PERMISSION_DENIED':
         return 'Please enable camera access in your browser settings to record video.';
       case 'BROWSER_NOT_SUPPORTED':
         return 'Your browser does not support video recording. Please try Chrome, Safari, or Firefox.';
       case 'RECORDING_FAILED':
         return 'Video recording failed. Please check your camera and try again.';
       default:
         return 'An unexpected error occurred. Please try again.';
     }
   };
   ```

3. **Create error display component section**
   - Render when `error` state is not null
   - Center the error content
   - Show AlertCircle icon in red
   - Display error message as heading
   - Display guidance text below
   - Add "Try Again" button if error is recoverable

4. **Handle recording failures**
   - Wrap startRecording in try-catch
   - If recording fails, set error state
   - Mark as recoverable if it's a transient error

5. **Handle no cameras available**
   - Check `devices.length === 0` after camera init
   - Display appropriate message
   - Suggest checking device connections

6. **Handle camera switch on single camera**
   - Already handled (button hidden), add fallback protection
   - Log warning if switchCamera called with single camera

7. **Handle interrupted recording**
   - Add visibility change listener
   - When page becomes hidden during recording, pause timer
   - When page visible again, warn user
   - Consider auto-stopping on extended background

8. **Add retry mechanism**
   - Create `handleRetry` function
   - Clear error state
   - Restart camera
   - Set mode to preview

#### Acceptance Criteria
- [ ] Permission denied shows helpful message with settings guidance
- [ ] Browser not supported shows alternative browser suggestions
- [ ] Recording failures display recoverable error with retry option
- [ ] No cameras available shows appropriate message
- [ ] Page visibility change handled gracefully
- [ ] Retry button clears error and restarts camera

#### Verification Steps
1. Deny camera permission - verify error message
2. Test on unsupported browser - verify message
3. Simulate recording failure - verify error handling
4. Switch tabs during recording - verify behavior
5. Click retry - verify recovery works

---

### Task 10: Implement Accessibility and Polish

**Story Points:** 1
**Depends On:** Task 9
**Estimated Time:** 1-2 hours

#### Objective
Ensure WCAG compliance and add visual polish with smooth transitions.

#### Implementation Steps

1. **Add comprehensive ARIA labels**
   - Review all interactive elements
   - Add `aria-label` where icon-only buttons exist
   - Add `role="status"` to recording indicator
   - Add `aria-live="polite"` for timer updates

2. **Implement keyboard navigation**
   - Ensure all buttons are in tab order
   - Add visible focus indicators: `focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`
   - Handle Escape key to cancel/go back

3. **Add screen reader announcements**
   - Announce when recording starts
   - Announce when recording stops
   - Announce errors when they occur
   - Use ARIA live regions for dynamic content

4. **Add loading spinner component**
   - Create or import spinner component
   - Display during camera initialization
   - Display during accept processing
   - Center with proper sizing

5. **Implement smooth mode transitions**
   - Add CSS transitions for mode changes
   - Fade in/out for preview ↔ recording
   - Slide transition for review screen
   - Use `transition-opacity duration-300`

6. **Add visual feedback for interactions**
   - Button press states: `active:scale-95`
   - Recording button glow during recording
   - Success feedback on accept

7. **Polish the layout for mobile**
   - Verify touch targets meet 48px minimum
   - Test on various screen sizes
   - Add safe area padding for notched devices

8. **Add focus trap in review mode**
   - Keep focus within review controls
   - Return focus to appropriate element on mode change

#### Acceptance Criteria
- [ ] All buttons have ARIA labels
- [ ] Keyboard navigation works throughout
- [ ] Focus indicators visible on all interactive elements
- [ ] Screen readers announce state changes
- [ ] Mode transitions are smooth
- [ ] Loading states have accessible announcements
- [ ] Touch targets meet minimum size requirements

#### Verification Steps
1. Navigate entire component with keyboard only
2. Test with VoiceOver (macOS) or NVDA (Windows)
3. Verify focus visible on all interactive elements
4. Test mode transitions are visually smooth
5. Test on mobile device for touch targets

---

### Task 11: Export and Integration

**Story Points:** 0.5
**Depends On:** Task 10
**Estimated Time:** 30 minutes

#### Objective
Export the component and integrate it into the wizard flow.

#### Implementation Steps

1. **Update steps index.ts**
   - File: `src/components/ItemCapture/components/steps/index.ts`
   - Add export: `export { VideoCaptureStep } from './VideoCaptureStep';`

2. **Update CaptureWizard.tsx**
   - Import VideoCaptureStep
   - Add case for 'capture-video' step in switch/conditional rendering
   - Pass required props: state, addMedia, goToStep, prevStep, config

3. **Update main index.ts if needed**
   - File: `src/components/ItemCapture/index.ts`
   - Ensure types are exported if not already

4. **Verify TypeScript compilation**
   - Run `npm run type-check`
   - Fix any type errors

5. **Test in development**
   - Run `npm run dev`
   - Navigate to video capture step
   - Verify end-to-end flow

#### Acceptance Criteria
- [ ] VideoCaptureStep exported from steps/index.ts
- [ ] CaptureWizard renders VideoCaptureStep for capture-video step
- [ ] No TypeScript errors
- [ ] Component accessible in wizard flow
- [ ] End-to-end capture flow works

#### Verification Steps
1. Import VideoCaptureStep from steps/index.ts - no errors
2. Navigate to video capture in wizard
3. Complete full record → review → accept flow
4. Verify media added to state

---

### Task 12: Write Unit Tests for Mode Transitions

**Story Points:** 1
**Depends On:** Task 11
**Estimated Time:** 1-2 hours

#### Objective
Create unit tests verifying mode state transitions and timer logic.

#### Implementation Steps

1. **Create test file**
   - File: `src/components/ItemCapture/components/steps/__tests__/VideoCaptureStep.test.tsx`

2. **Set up test utilities**
   - Import testing-library/react
   - Import jest mocks for MediaDevices
   - Create mock implementations for useMediaCapture

3. **Test mode transitions**
   - Test: preview → recording (on start click)
   - Test: recording → review (on stop click)
   - Test: review → preview (on retake click)
   - Test: recording → review (auto-stop at max duration)

4. **Test timer logic**
   - Test: timer starts at 0 when recording begins
   - Test: timer increments every second
   - Test: timer stops when recording stops
   - Test: timer triggers auto-stop at max duration

5. **Test error states**
   - Test: permission denied renders error message
   - Test: retry button clears error
   - Test: recording failure handled gracefully

6. **Test MediaItem creation**
   - Test: accept creates MediaItem with correct fields
   - Test: addMedia callback invoked with MediaItem
   - Test: object URL revoked after accept

7. **Use fake timers for timer tests**
   ```typescript
   beforeEach(() => {
     jest.useFakeTimers();
   });
   afterEach(() => {
     jest.useRealTimers();
   });
   ```

#### Acceptance Criteria
- [ ] Tests for all mode transitions pass
- [ ] Tests for timer logic pass
- [ ] Tests for error states pass
- [ ] Tests for MediaItem creation pass
- [ ] Test coverage meets project standards
- [ ] All tests use mocked media APIs (no actual camera access)

#### Verification Steps
1. Run `npm test -- VideoCaptureStep`
2. Verify all tests pass
3. Check coverage report for gaps
4. Run full test suite - no regressions

---

### Task 13: Write Integration Tests

**Story Points:** 1
**Depends On:** Task 12
**Estimated Time:** 1-2 hours

#### Objective
Create integration tests verifying the component works correctly within the wizard context.

#### Implementation Steps

1. **Create integration test file**
   - File: `src/components/ItemCapture/__tests__/VideoCaptureStep.integration.test.tsx`

2. **Test wizard integration**
   - Test: component receives correct props from wizard
   - Test: addMedia correctly adds to wizard state
   - Test: goToStep navigates within wizard
   - Test: prevStep returns to content-type selection

3. **Test with mocked useMediaCapture**
   - Mock the hook to return controlled stream
   - Mock startRecording to return a test blob
   - Mock stopRecording to trigger onDataAvailable

4. **Test full capture flow**
   - Render wizard at capture-video step
   - Start recording (mocked)
   - Wait for auto-stop or trigger stop
   - Accept video
   - Verify navigation to next step
   - Verify media in wizard state

5. **Test cancel flow**
   - Start recording
   - Click cancel/back
   - Verify proper cleanup
   - Verify no media added

6. **Test error recovery flow**
   - Mock permission denied
   - Verify error UI renders
   - Mock permission grant on retry
   - Verify recovery works

7. **Test with CameraPreview integration**
   - Verify stream passed to CameraPreview
   - Verify preview renders correctly

#### Acceptance Criteria
- [ ] Wizard integration tests pass
- [ ] Full capture flow test passes
- [ ] Cancel flow test passes
- [ ] Error recovery test passes
- [ ] CameraPreview integration verified
- [ ] No actual media devices used in tests

#### Verification Steps
1. Run integration tests
2. Verify all assertions pass
3. Check for test isolation (no shared state)
4. Verify mocks properly reset between tests

---

### Task 14: Manual Testing and Cross-Browser Verification

**Story Points:** 1
**Depends On:** Task 13
**Estimated Time:** 2-3 hours

#### Objective
Perform comprehensive manual testing across target browsers and devices.

#### Testing Matrix

| Device/Browser | Test Items |
|----------------|------------|
| iOS Safari 15+ (iPhone) | All acceptance criteria |
| iOS Safari 15+ (iPad) | All acceptance criteria |
| Chrome Android (phone) | All acceptance criteria |
| Chrome Android (tablet) | All acceptance criteria |
| Chrome Desktop | All acceptance criteria |
| Firefox Desktop | All acceptance criteria |
| Edge Desktop | All acceptance criteria |

#### Test Scenarios

1. **Camera permission grant flow**
   - Fresh session (no prior permission)
   - Permission already granted
   - Permission denied then granted

2. **Recording scenarios**
   - Short recording (< 30 seconds)
   - Medium recording (1 minute)
   - Full recording (auto-stop at 2 minutes)
   - Very short recording (< 5 seconds)

3. **Camera switching**
   - Front to back camera
   - Back to front camera
   - Verify switching disabled during recording

4. **Review scenarios**
   - Play full video
   - Pause and resume
   - Seek to different positions
   - Accept video
   - Retake video

5. **Error scenarios**
   - Camera permission denied
   - Camera already in use by another app
   - Low storage condition

6. **Edge cases**
   - Navigate away during recording
   - Switch tabs during recording
   - Lock device during recording
   - Incoming call during recording

#### Acceptance Criteria
- [ ] All scenarios pass on iOS Safari
- [ ] All scenarios pass on Chrome Android
- [ ] All scenarios pass on desktop browsers
- [ ] No memory leaks detected
- [ ] No console errors in production mode
- [ ] Recording quality acceptable

#### Verification Steps
1. Complete each test scenario
2. Document any issues found
3. File bugs for issues
4. Re-test after fixes
5. Sign off on all browsers

---

## Task Dependency Graph

```
Task 1: Component Shell
    │
    ▼
Task 2: Hook Integration
    │
    ▼
Task 3: Preview Controls
    │
    ▼
Task 4: Recording Controls
    │
    ▼
Task 5: Countdown Timer
    │
    ▼
Task 6: Review Video Player
    │
    ▼
Task 7: Review Buttons
    │
    ▼
Task 8: Accept/Add Logic
    │
    ▼
Task 9: Error Handling
    │
    ▼
Task 10: Accessibility
    │
    ▼
Task 11: Export & Integration
    │
    ├──────────────────┐
    ▼                  ▼
Task 12: Unit Tests   Task 13: Integration Tests
    │                  │
    └────────┬─────────┘
             ▼
     Task 14: Manual Testing
```

---

## Summary

| Task | Title | Story Points | Depends On |
|------|-------|--------------|------------|
| 1 | Create Component Shell | 1 | Prerequisites |
| 2 | Integrate useMediaCapture Hook | 1 | Task 1 |
| 3 | Build Preview Mode Controls | 1 | Task 2 |
| 4 | Build Recording Mode Controls | 1 | Task 3 |
| 5 | Implement Countdown Timer | 1 | Task 4 |
| 6 | Build Review Video Player | 1 | Task 5 |
| 7 | Build Review Action Buttons | 1 | Task 6 |
| 8 | Implement Accept/Add Logic | 1 | Task 7 |
| 9 | Error Handling & Edge Cases | 1 | Task 8 |
| 10 | Accessibility & Polish | 1 | Task 9 |
| 11 | Export & Integration | 0.5 | Task 10 |
| 12 | Unit Tests | 1 | Task 11 |
| 13 | Integration Tests | 1 | Task 11 |
| 14 | Manual Testing | 1 | Tasks 12, 13 |
| **Total** | | **12.5** | |

---

## References

- Overview Document: `/docs/REQ-038-implement-videocapturestep-overview.md`
- Implementation Plan: `/docs/prd/item-capture-implementation-plan.md`
- Request Definition: `/docs/gen_requests.md` (REQ-038)
- useMediaCapture Overview: `/docs/REQ-036-create-usemediacapture-hook-overview.md`
- CameraPreview Overview: `/docs/REQ-037-build-camerapreview-component-overview.md`
- [MediaRecorder API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [Lucide React Icons](https://lucide.dev/icons/)

---

*Document generated for REQ-038 detailed task breakdown.*
