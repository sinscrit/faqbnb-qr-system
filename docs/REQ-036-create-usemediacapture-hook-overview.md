# REQ-036: Create useMediaCapture Hook - Technical Implementation Overview

**Generated:** 2025-12-31T14:30:00
**Last Modified:** 2025-12-31T14:30:00
**Request Reference:** REQ-036 in `/docs/gen_requests.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 2 - Media Capture
**Task ID:** 2.1

---

## Executive Summary

This document provides a technical implementation breakdown for the `useMediaCapture` hook, which abstracts the MediaDevices API to provide camera enumeration, permission handling, browser compatibility detection, and video/photo capture capabilities for the ItemCapture component.

The hook is a critical foundation for Phase 2 (Media Capture) and directly enables tasks 2.2 (CameraPreview), 2.3 (VideoCaptureStep), and 2.4 (PhotoCaptureStep).

---

## Scope

### In Scope
- Abstract `navigator.mediaDevices` API with comprehensive error handling
- Camera enumeration and device switching (front/back on mobile, multiple webcams on desktop)
- Permission request handling with user-friendly, actionable messages
- Browser compatibility detection (SSR-safe)
- Video stream management (start, stop, cleanup)
- MediaRecorder integration for video recording
- Canvas-based photo capture from video stream
- iOS Safari compatibility (leveraging REQ-029 spike findings)

### Out of Scope
- Video trimming (Phase 4 - Task 4.4)
- Image cropping/editing (Phase 4 - Tasks 4.2, 4.3)
- File upload functionality (Phase 3 - Task 3.1)
- Thumbnail generation (Task 2.5 - separate utility)
- State machine integration (handled by parent component via `useItemCaptureState`)

---

## Dependencies

### Hard Dependencies (Must Complete First)
| Dependency | Status | Location |
|------------|--------|----------|
| Phase 1 Complete | Required | Tasks 1.1-1.5 |
| ItemCapture.types.ts | Required | `src/components/ItemCapture/ItemCapture.types.ts` |
| Directory structure | Required | Task 1.1 |

### Soft Dependencies (Can Develop in Parallel)
| Dependency | Status | Notes |
|------------|--------|-------|
| Task 2.5 - Thumbnail Generator | Parallel | Hook returns Blob; thumbnail generation separate |
| REQ-029 iOS Safari Spike | Complete | Findings inform codec selection |

### External Dependencies
| Dependency | Notes |
|------------|-------|
| MediaDevices API | Native browser API (no package required) |
| MediaRecorder API | Native browser API (no package required) |

---

## Technical Approach

### Architecture Decision: Native APIs Over Wrapper Libraries

**Decision:** Use native `MediaDevices` and `MediaRecorder` APIs directly (no react-webcam or similar)

**Rationale:**
- Zero additional bundle size
- Full control over media constraints and codec selection
- Direct error type access for granular error handling
- iOS Safari compatibility requires specific codec handling (per REQ-029)
- Matches implementation plan recommendation (Section: Technical Decisions)

### State Management Approach

The hook uses `useState` and `useRef` for internal state, returning a clean interface that the parent component consumes. It does NOT manage wizard state - that responsibility belongs to `useItemCaptureState`.

### Browser Compatibility Strategy

Based on REQ-029 iOS Safari spike findings:
- **Minimum iOS Version:** iOS 16+ (iOS 18.5 confirmed working)
- **Preferred Video Codec:** `video/mp4` (auto-selects optimal H.264 codec on iOS)
- **Fallback Codec Order:** `video/mp4` → `video/webm` → browser default
- **SSR Safety:** All browser API access guarded with `typeof window !== 'undefined'`

---

## Interface Design

### Hook Options Interface

```typescript
/**
 * Configuration options for useMediaCapture hook
 */
interface UseMediaCaptureOptions {
  /** Video resolution constraints (default: { width: 1920, height: 1080 }) */
  resolution?: { width: number; height: number };

  /** Frame rate for video capture (default: 30) */
  frameRate?: number;

  /** Whether to include audio in video recording (default: true) */
  includeAudio?: boolean;

  /** Preferred facing mode for initial camera (default: 'environment') */
  initialFacingMode?: 'user' | 'environment';

  /** Enable debug logging (default: false) */
  debug?: boolean;
}
```

### Hook Return Interface

```typescript
/**
 * Return value from useMediaCapture hook
 */
interface UseMediaCaptureReturn {
  // === Stream State ===
  /** Current media stream (null when inactive) */
  stream: MediaStream | null;

  /** Whether camera is currently active and streaming */
  isCameraActive: boolean;

  /** Whether currently recording video */
  isRecording: boolean;

  /** Recording duration in seconds (updates every second while recording) */
  recordingTime: number;

  // === Device State ===
  /** Available video input devices */
  devices: MediaDeviceInfo[];

  /** Currently selected device ID */
  selectedDeviceId: string | null;

  /** Detected facing mode of current camera ('user' | 'environment' | 'unknown') */
  facingMode: 'user' | 'environment' | 'unknown';

  // === Browser Capability ===
  /** Browser capabilities detection result */
  capabilities: {
    hasMediaDevices: boolean;
    hasGetUserMedia: boolean;
    hasMediaRecorder: boolean;
    hasEnumerateDevices: boolean;
    isSupported: boolean;
    unsupportedReason?: string;
  };

  // === Error State ===
  /** Current error with user-friendly message and action guidance */
  error: MediaCaptureError | null;

  /** Permission status: 'prompt' | 'granted' | 'denied' | 'unavailable' */
  permissionStatus: PermissionStatus;

  // === Camera Actions ===
  /** Start camera stream with current/default device */
  startCamera: () => Promise<void>;

  /** Stop camera stream and release resources */
  stopCamera: () => void;

  /** Switch to a different camera by device ID */
  switchCamera: (deviceId: string) => Promise<void>;

  /** Refresh available devices list */
  refreshDevices: () => Promise<void>;

  // === Recording Actions ===
  /** Start video recording */
  startRecording: () => Promise<void>;

  /** Stop video recording and return the recorded blob */
  stopRecording: () => Promise<Blob | null>;

  // === Photo Capture ===
  /** Capture a photo from current stream */
  capturePhoto: () => Promise<Blob | null>;

  // === Utility ===
  /** Clear current error */
  clearError: () => void;

  /** Full cleanup (call on unmount) */
  cleanup: () => void;
}
```

### Error Interface

```typescript
/**
 * Structured error for media capture failures
 */
interface MediaCaptureError {
  /** Error code for programmatic handling */
  code: MediaCaptureErrorCode;

  /** User-friendly error message */
  message: string;

  /** Actionable next steps for the user */
  action: string;

  /** Whether the error is recoverable/retryable */
  recoverable: boolean;

  /** Original error for debugging */
  originalError?: Error;
}

type MediaCaptureErrorCode =
  | 'PERMISSION_DENIED'
  | 'PERMISSION_DISMISSED'
  | 'NO_DEVICE_FOUND'
  | 'DEVICE_IN_USE'
  | 'BROWSER_NOT_SUPPORTED'
  | 'STREAM_ERROR'
  | 'RECORDING_ERROR'
  | 'CONSTRAINT_ERROR'
  | 'UNKNOWN_ERROR';

type PermissionStatus = 'prompt' | 'granted' | 'denied' | 'unavailable';
```

---

## Implementation Tasks

### Task Breakdown

| Task | Description | Estimate | Depends On |
|------|-------------|----------|------------|
| 2.1.1 | Create hook file with TypeScript interfaces | 30 min | Phase 1 complete |
| 2.1.2 | Implement browser capability detection | 45 min | 2.1.1 |
| 2.1.3 | Implement device enumeration | 45 min | 2.1.2 |
| 2.1.4 | Implement permission handling | 1 hr | 2.1.3 |
| 2.1.5 | Implement camera start/stop | 1.5 hr | 2.1.4 |
| 2.1.6 | Implement camera switching | 1 hr | 2.1.5 |
| 2.1.7 | Implement video recording | 2 hr | 2.1.5 |
| 2.1.8 | Implement photo capture | 45 min | 2.1.5 |
| 2.1.9 | Add error handling & user messages | 1 hr | 2.1.2-2.1.8 |
| 2.1.10 | Add cleanup & memory management | 45 min | 2.1.5-2.1.8 |
| 2.1.11 | Manual testing across browsers | 1.5 hr | 2.1.1-2.1.10 |

**Total Estimated Time:** ~11 hours (1.5 days)

---

## Key Implementation Details

### 1. Browser Capability Detection (SSR-Safe)

```typescript
const detectCapabilities = (): Capabilities => {
  if (typeof window === 'undefined') {
    return {
      hasMediaDevices: false,
      hasGetUserMedia: false,
      hasMediaRecorder: false,
      hasEnumerateDevices: false,
      isSupported: false,
      unsupportedReason: 'Server-side rendering'
    };
  }

  const hasMediaDevices = 'mediaDevices' in navigator;
  const hasGetUserMedia = hasMediaDevices && 'getUserMedia' in navigator.mediaDevices;
  const hasMediaRecorder = 'MediaRecorder' in window;
  const hasEnumerateDevices = hasMediaDevices && 'enumerateDevices' in navigator.mediaDevices;

  const isSupported = hasMediaDevices && hasGetUserMedia && hasMediaRecorder && hasEnumerateDevices;

  return {
    hasMediaDevices,
    hasGetUserMedia,
    hasMediaRecorder,
    hasEnumerateDevices,
    isSupported,
    unsupportedReason: isSupported ? undefined : 'Browser does not support required media APIs'
  };
};
```

### 2. Permission Error Handling (Per REQ-036 Requirements)

Map technical errors to user-friendly messages with actionable guidance:

| Error Name | User Message | Action |
|------------|--------------|--------|
| `NotAllowedError` | "Camera access was denied" | "Please allow camera access in your browser settings, then try again" |
| `NotFoundError` | "No camera found on this device" | "Connect a camera or try using a different device" |
| `NotReadableError` | "Camera is being used by another application" | "Close other apps using the camera, then try again" |
| `OverconstrainedError` | "Camera doesn't support requested settings" | "Try using a different camera" |
| `AbortError` | "Camera access was interrupted" | "Please try again" |
| `TypeError` | "Invalid camera configuration" | "Please refresh the page and try again" |

### 3. iOS Safari Codec Selection (Per REQ-029)

```typescript
const selectOptimalMimeType = (): string => {
  const mimeTypes = [
    'video/mp4',           // Preferred for iOS Safari (auto-selects H.264)
    'video/webm',          // Chrome/Firefox preferred
    ''                     // Fallback to browser default
  ];

  for (const mimeType of mimeTypes) {
    if (!mimeType || MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }

  return '';
};
```

### 4. Memory Leak Prevention (Following Codebase Patterns)

Based on patterns from `useQRCodeGeneration.ts`:

```typescript
// Track mounted state
const isUnmountedRef = useRef(false);

// Cleanup on unmount
useEffect(() => {
  return () => {
    isUnmountedRef.current = true;

    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Stop recorder
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop();
    }

    // Clear recording timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };
}, []);

// Guard all state updates
const safeSetState = useCallback(<T>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) => {
  if (!isUnmountedRef.current) {
    setter(value);
  }
}, []);
```

### 5. Camera Switching Logic

```typescript
const switchCamera = useCallback(async (deviceId: string) => {
  if (!capabilities.isSupported) return;

  // Stop current stream
  if (streamRef.current) {
    streamRef.current.getTracks().forEach(track => track.stop());
  }

  try {
    const constraints: MediaStreamConstraints = {
      video: {
        deviceId: { exact: deviceId },
        width: { ideal: resolution.width },
        height: { ideal: resolution.height },
        frameRate: { ideal: frameRate }
      },
      audio: includeAudio
    };

    const newStream = await navigator.mediaDevices.getUserMedia(constraints);

    if (!isUnmountedRef.current) {
      streamRef.current = newStream;
      setStream(newStream);
      setSelectedDeviceId(deviceId);
      detectFacingMode(deviceId);
      setError(null);
    }
  } catch (err) {
    handleMediaError(err as Error);
  }
}, [capabilities.isSupported, resolution, frameRate, includeAudio]);
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/hooks/useMediaCapture.ts` | Main hook implementation |

### Files to Modify

| File Path | Modification | Reason |
|-----------|--------------|--------|
| `src/components/ItemCapture/ItemCapture.types.ts` | Add `MediaCaptureError`, `UseMediaCaptureOptions`, `UseMediaCaptureReturn` interfaces | Type definitions |
| `src/components/ItemCapture/index.ts` | Export `useMediaCapture` hook | Public API |

### Files to Reference (Read-Only)

| File Path | Reference Purpose |
|-----------|-------------------|
| `src/hooks/useQRCodeGeneration.ts` | Pattern reference for async operations, cleanup |
| `src/lib/error-utils.ts` | Error translation patterns |
| `docs/req-029-ios-safari-compatibility-report.md` | iOS codec and permission patterns |
| `src/components/ItemCapture/utils/constants.ts` | Video/capture constraints |

---

## Error Handling Strategy

### Error Classification

| Error Type | Recovery Strategy | User Guidance |
|------------|-------------------|---------------|
| Permission Denied | Non-recoverable in session | Guide to browser settings |
| Permission Dismissed | Recoverable | Show permission explanation, retry |
| No Device | Non-recoverable | Suggest upload alternative |
| Device In Use | Recoverable | Wait and retry |
| Browser Not Supported | Non-recoverable | Show browser upgrade message |
| Stream Error | Recoverable | Retry with lower constraints |

### Retry Strategy

```typescript
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // ms

const attemptCameraStart = async (retryCount = 0): Promise<void> => {
  try {
    await startCameraInternal();
  } catch (err) {
    const error = err as Error;

    // Only retry on transient errors
    if (isTransientError(error) && retryCount < MAX_RETRIES) {
      await delay(RETRY_DELAY);
      return attemptCameraStart(retryCount + 1);
    }

    throw err;
  }
};

const isTransientError = (error: Error): boolean => {
  return error.name === 'NotReadableError' || error.name === 'AbortError';
};
```

---

## Testing Strategy

### Unit Test Coverage

| Test Case | Description |
|-----------|-------------|
| SSR Safety | Hook returns safe defaults on server |
| Capability Detection | Correctly identifies browser support |
| Permission Handling | Maps all error types to user messages |
| State Management | State updates correctly on camera start/stop |
| Cleanup | All resources released on unmount |
| Recording Timer | Timer increments correctly during recording |

### Integration Test Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| Happy Path | Start camera → Record → Stop | Blob returned |
| Permission Denied | Deny permission | Error with guidance shown |
| Camera Switch | Start → Switch camera | New stream active |
| Unmount During Recording | Start recording → Unmount | Clean stop, no leaks |

### Manual Testing Matrix (from Implementation Plan)

| Platform | Browser | Priority |
|----------|---------|----------|
| iOS 18.5 | Safari | High (per REQ-029) |
| iOS 16+ | Safari | High |
| Android | Chrome | High |
| Desktop | Chrome | Medium |
| Desktop | Firefox | Medium |
| Desktop | Edge | Low |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| iOS Safari permission quirks | Medium | High | Follow REQ-029 patterns exactly |
| Memory leaks from streams | Medium | High | Comprehensive cleanup in useEffect |
| Race conditions on rapid camera switch | Medium | Medium | Queue camera operations |
| Browser codec incompatibility | Low | Medium | Fallback codec chain |
| Device enumeration timing | Low | Low | Re-enumerate after permission grant |

---

## Open Questions

1. **Auto-retry on transient errors:** Should the hook automatically retry on `NotReadableError` (device busy), or expose this to the UI?
   - **Recommendation:** Auto-retry up to 2 times with 1s delay

2. **Recording chunk interval:** Should recordings use chunked data (`start(1000)`) for progressive data, or single blob on stop?
   - **Recommendation:** Single blob for simplicity in V1; chunked recording adds complexity for minimal benefit

3. **Permissions API integration:** Should we use the Permissions API to check camera permission status before requesting?
   - **Recommendation:** Yes, check `navigator.permissions.query({ name: 'camera' })` if available, but gracefully handle older browsers

---

## Success Criteria

- [ ] Hook correctly detects browser capabilities without SSR errors
- [ ] Camera stream starts successfully on supported browsers
- [ ] All permission error types are caught and display user-friendly messages
- [ ] Camera switching works without page reload
- [ ] Video recording produces valid Blob with correct MIME type
- [ ] Photo capture produces valid image Blob
- [ ] All resources cleaned up on component unmount
- [ ] No memory leaks detected in extended usage
- [ ] iOS Safari 18.5 works per REQ-029 validation
- [ ] Error messages distinguish between failure scenarios per REQ-036 acceptance criteria

---

## References

- [MediaDevices API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices)
- [MediaRecorder API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [getUserMedia Constraints - MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#constraints)
- [REQ-029 iOS Safari Compatibility Report](/docs/req-029-ios-safari-compatibility-report.md)
- [Implementation Plan](/docs/prd/item-capture-implementation-plan.md)
- [useQRCodeGeneration.ts](/src/hooks/useQRCodeGeneration.ts) - Hook pattern reference
