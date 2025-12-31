# REQ-054: Media Editor Performance Optimization - Technical Overview

**Document Created:** 2025-12-31T20:15:00
**Last Modified:** 2025-12-31T20:15:00
**Request Reference:** `/docs/gen_requests.md` (REQ-054)
**Implementation Plan:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 5 - Review & Polish
**Task ID:** 5.5
**Status:** Ready for Implementation

---

## 1. Summary

Implement comprehensive performance optimizations for the ItemCapture component to ensure efficient resource management across the media capture and editing lifecycle. This task addresses four key areas:

1. **Lazy Loading** - Defer loading of heavy editor components until needed
2. **Media Stream Cleanup** - Properly release camera/microphone access on unmount
3. **Object URL Revocation** - Prevent memory leaks by revoking blob URLs
4. **Memory Profiling** - Validate stable memory usage across multiple capture sessions

**Key Responsibility:** This task ensures the ItemCapture wizard remains performant across extended sessions and on memory-constrained mobile devices by implementing aggressive resource cleanup and intelligent code splitting.

---

## 2. Context from Implementation Plan

### Phase 5 Position

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

### Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Task 5.4 (onComplete Assembly) | Required | Must complete before optimization pass |
| Phase 2 (Media Capture) | Required | useMediaCapture hook exists with media streams |
| Phase 3 (File Upload) | Required | useFileUpload hook exists with blob handling |
| Phase 4 (Editing Features) | Required | Editor components exist to be lazy loaded |
| REQ-028 (Bundle Analysis) | Complete | Validated lazy loading effectiveness |

### Bundle Analysis Findings (from REQ-028)

| Metric | Value |
|--------|-------|
| Baseline bundle | 99.7 KB |
| With eager loading | 241 KB (+141.3 KB, +142%) |
| With lazy loading | 136 KB (+36.3 KB, +36%) |
| **Lazy loading savings** | **105 KB (74.3% reduction)** |

### This Task's Scope

Task 5.5 is a polishing task that optimizes existing implementations. It does NOT create new features but refactors existing code for:
- Better initial load time via lazy loading
- Proper cleanup to prevent memory leaks
- Stable memory usage across multiple capture sessions

---

## 3. Technical Approach

### 3.1 Lazy Loading Strategy

The following components should be dynamically imported using Next.js `dynamic()`:

| Component | Library Size | Load Trigger |
|-----------|--------------|--------------|
| `ImageCropper.tsx` | ~45 KB (react-image-crop) | User enters MediaEditorStep for image |
| `ImageRotator.tsx` | Minimal (canvas-based) | User enters MediaEditorStep for image |
| `VideoTrimmer.tsx` | Minimal (native controls) | User enters MediaEditorStep for video |
| `MarkdownEditor.tsx` | ~12 KB (react-markdown) | User enters TextEditorStep |
| `pdfThumbnailGenerator.ts` | ~500 KB (pdfjs-dist) | User uploads PDF file |

**Implementation Pattern:**

```typescript
// In CaptureWizard.tsx or step components
import dynamic from 'next/dynamic';

const ImageCropper = dynamic(
  () => import('../editors/ImageCropper'),
  {
    ssr: false,
    loading: () => <LoadingSpinner label="Loading editor..." />
  }
);

const MarkdownEditor = dynamic(
  () => import('../editors/MarkdownEditor'),
  {
    ssr: false,
    loading: () => <div className="animate-pulse h-40 bg-gray-100 rounded" />
  }
);
```

**Utility Lazy Loading Pattern:**

```typescript
// In FileUploadStep.tsx - load pdfjs-dist only when PDF uploaded
const handlePDFUpload = async (file: File) => {
  const { generatePDFThumbnail, getPDFPageCount } = await import(
    '../utils/pdfThumbnailGenerator'
  );

  const thumbnail = await generatePDFThumbnail(file);
  const pageCount = await getPDFPageCount(file);
  // ...
};
```

### 3.2 Media Stream Cleanup Strategy

Media streams from the camera/microphone must be stopped immediately when:
- User leaves the capture step
- User switches camera (stop old stream before starting new)
- Component unmounts (cancel button, navigation away)
- Error occurs during capture

**Reference Pattern (from useQRCodeGeneration.ts):**

```typescript
// Pattern to follow
const isUnmountedRef = useRef(false);
const streamRef = useRef<MediaStream | null>(null);
const abortControllerRef = useRef<AbortController | null>(null);

useEffect(() => {
  return () => {
    isUnmountedRef.current = true;

    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped track: ${track.kind}`);
      });
      streamRef.current = null;
    }

    // Abort any pending operations
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };
}, []);
```

**Stream Lifecycle Events:**

| Event | Action |
|-------|--------|
| `ACTIVATE_CAMERA` | Start stream, store in ref + state |
| `DEACTIVATE_CAMERA` | Stop all tracks, clear refs |
| `SWITCH_CAMERA` | Stop current stream, start new with different deviceId |
| `START_RECORDING` | Begin MediaRecorder on existing stream |
| `STOP_RECORDING` | Stop MediaRecorder, keep stream for preview |
| Component unmount | Stop all tracks, abort pending operations |
| Step navigation away | Stop stream if leaving capture step |

### 3.3 Object URL Revocation Strategy

Every `URL.createObjectURL()` call must have a corresponding `URL.revokeObjectURL()` call.

**Common Sources of Object URLs in ItemCapture:**

| Source | Created When | Revoke When |
|--------|--------------|-------------|
| Video recording blob | Recording stops | After upload OR on remove/cancel |
| Photo capture blob | Photo taken | After upload OR on remove/cancel |
| Uploaded file preview | File selected | After upload OR on remove/cancel |
| Thumbnail blob | Thumbnail generated | Component unmount |
| Edited media blob | Edit applied | Original blob cleanup |

**Implementation Pattern:**

```typescript
// Track all created URLs in a ref
const objectUrlsRef = useRef<Map<string, string>>(new Map());

// Create URL with tracking
const createTrackedUrl = useCallback((blob: Blob, key: string): string => {
  // Revoke existing URL for this key if present
  const existing = objectUrlsRef.current.get(key);
  if (existing) {
    URL.revokeObjectURL(existing);
  }

  const url = URL.createObjectURL(blob);
  objectUrlsRef.current.set(key, url);
  return url;
}, []);

// Revoke specific URL
const revokeUrl = useCallback((key: string): void => {
  const url = objectUrlsRef.current.get(key);
  if (url) {
    URL.revokeObjectURL(url);
    objectUrlsRef.current.delete(key);
  }
}, []);

// Cleanup all URLs on unmount
useEffect(() => {
  return () => {
    objectUrlsRef.current.forEach((url, key) => {
      URL.revokeObjectURL(url);
      console.log(`Revoked URL for: ${key}`);
    });
    objectUrlsRef.current.clear();
  };
}, []);
```

**Existing Pattern (from utils.ts - downloadBlob):**

```typescript
export function downloadBlob(blob: Blob, filename: string): void {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // CRITICAL: Cleanup immediately after use
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download blob:', error);
  }
}
```

### 3.4 Memory Profiling Strategy

**Profiling Objectives:**
1. Verify no memory leaks after 5 consecutive capture sessions
2. Confirm heap size returns to baseline after completing capture flow
3. Validate no orphaned media streams after step transitions

**Testing Protocol:**

1. **Baseline Measurement:**
   - Navigate to ItemCapture
   - Record heap snapshot before starting
   - Note initial memory usage

2. **Stress Test (5 cycles):**
   - Complete full capture flow (video + photos + text)
   - Return to ItemCapture for new capture
   - Repeat 5 times without page reload

3. **Memory Analysis:**
   - Take heap snapshot after each cycle
   - Compare detached DOM elements
   - Check for retained Blob objects
   - Verify MediaStream cleanup

4. **Success Criteria:**
   - Memory growth < 10% between cycles 3-5
   - No detached DOM elements referencing media
   - Zero active MediaStreams after unmount
   - All Blob URLs revoked

**Chrome DevTools Commands:**

```javascript
// Check active media streams
navigator.mediaDevices.enumerateDevices().then(console.log);

// Force garbage collection (DevTools > Performance > Collect garbage)
// Then take heap snapshot

// Monitor memory in console
performance.memory // (Chrome only)
```

---

## 4. Files to Modify

### 4.1 Hooks Requiring Cleanup Implementation

| File Path | Modifications |
|-----------|---------------|
| `src/components/ItemCapture/hooks/useMediaCapture.ts` | Add isUnmountedRef, streamRef cleanup, abort controller |
| `src/components/ItemCapture/hooks/useFileUpload.ts` | Add object URL tracking and revocation |
| `src/components/ItemCapture/hooks/useMediaEditor.ts` | Add cleanup for edited blob URLs |
| `src/components/ItemCapture/hooks/useItemCaptureState.ts` | Add cleanup action for all media references |

### 4.2 Components Requiring Lazy Loading

| File Path | Modifications |
|-----------|---------------|
| `src/components/ItemCapture/components/steps/MediaEditorStep.tsx` | Lazy import ImageCropper, ImageRotator, VideoTrimmer |
| `src/components/ItemCapture/components/steps/TextEditorStep.tsx` | Lazy import MarkdownEditor |
| `src/components/ItemCapture/components/steps/FileUploadStep.tsx` | Lazy import pdfThumbnailGenerator |
| `src/components/ItemCapture/components/CaptureWizard.tsx` | Conditional dynamic imports based on step |

### 4.3 Components Requiring URL Cleanup

| File Path | Modifications |
|-----------|---------------|
| `src/components/ItemCapture/components/steps/VideoCaptureStep.tsx` | Revoke preview URLs on unmount |
| `src/components/ItemCapture/components/steps/PhotoCaptureStep.tsx` | Revoke preview URLs on unmount/retake |
| `src/components/ItemCapture/components/steps/FileUploadStep.tsx` | Revoke preview URLs on unmount/remove |
| `src/components/ItemCapture/components/steps/ReviewStep.tsx` | Revoke thumbnail URLs on unmount |
| `src/components/ItemCapture/components/shared/CameraPreview.tsx` | Stop stream on unmount |
| `src/components/ItemCapture/components/shared/MediaThumbnail.tsx` | Revoke URL on unmount |

---

## 5. Authorized Files and Functions for Modification

### Files to MODIFY

| File Path | Modification Type |
|-----------|-------------------|
| `src/components/ItemCapture/hooks/useMediaCapture.ts` | Add cleanup refs and unmount logic |
| `src/components/ItemCapture/hooks/useFileUpload.ts` | Add object URL management |
| `src/components/ItemCapture/hooks/useMediaEditor.ts` | Add edit blob cleanup |
| `src/components/ItemCapture/hooks/useItemCaptureState.ts` | Add CLEANUP_ALL action |
| `src/components/ItemCapture/components/steps/MediaEditorStep.tsx` | Convert to dynamic imports |
| `src/components/ItemCapture/components/steps/TextEditorStep.tsx` | Convert to dynamic imports |
| `src/components/ItemCapture/components/steps/FileUploadStep.tsx` | Add PDF lazy loading |
| `src/components/ItemCapture/components/steps/VideoCaptureStep.tsx` | Add URL cleanup |
| `src/components/ItemCapture/components/steps/PhotoCaptureStep.tsx` | Add URL cleanup |
| `src/components/ItemCapture/components/steps/ReviewStep.tsx` | Add URL cleanup |
| `src/components/ItemCapture/components/shared/CameraPreview.tsx` | Add stream cleanup |
| `src/components/ItemCapture/components/shared/MediaThumbnail.tsx` | Add URL cleanup |
| `src/components/ItemCapture/components/CaptureWizard.tsx` | Add step-based dynamic imports |

### Files to CREATE (Optional - for testing)

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/utils/memoryManager.ts` | Optional centralized URL/stream tracking utility |

### Files to REFERENCE (Read-Only Patterns)

| File Path | Pattern Reference |
|-----------|-------------------|
| `src/hooks/useQRCodeGeneration.ts` | isUnmountedRef, abortController, cleanup pattern |
| `src/lib/utils.ts` | downloadBlob() immediate URL revocation pattern |
| `src/app/test/bundle-test/page.tsx` | Dynamic import examples |
| `src/components/ItemCapture/editors/ImageCropper.tsx` | Header comment for lazy loading |
| `src/components/ItemCapture/utils/pdfThumbnailGenerator.ts` | Utility lazy loading pattern |

---

## 6. Implementation Details

### 6.1 Lazy Loading Implementation

**Step 1: MediaEditorStep.tsx**

```typescript
'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load heavy editor components
const ImageCropper = dynamic(
  () => import('../editors/ImageCropper'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }
);

const ImageRotator = dynamic(
  () => import('../editors/ImageRotator'),
  { ssr: false }
);

const VideoTrimmer = dynamic(
  () => import('../editors/VideoTrimmer'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }
);
```

**Step 2: FileUploadStep.tsx PDF Handling**

```typescript
const handleFileSelect = async (files: FileList) => {
  for (const file of Array.from(files)) {
    if (file.type === 'application/pdf') {
      // Lazy load PDF utilities only when needed
      const { generatePDFThumbnail, getPDFPageCount } = await import(
        '../../utils/pdfThumbnailGenerator'
      );

      const thumbnail = await generatePDFThumbnail(file);
      const pageCount = await getPDFPageCount(file);

      // Add to media items with metadata
      dispatch({
        type: 'ADD_MEDIA',
        payload: {
          id: generateUUID(),
          type: 'pdf',
          file,
          thumbnail,
          order: mediaItems.length,
          metadata: {
            mimeType: file.type,
            fileSize: file.size,
            pageCount,
            originalFilename: file.name,
            source: 'upload',
          },
        },
      });
    }
  }
};
```

### 6.2 Media Stream Cleanup Implementation

**useMediaCapture.ts Enhancement:**

```typescript
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export function useMediaCapture() {
  // State
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cleanup refs
  const isUnmountedRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    // Stop MediaRecorder if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log(`[useMediaCapture] Stopped track: ${track.kind} (${track.label})`);
      });
      streamRef.current = null;
    }

    // Abort pending operations
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Update state if component still mounted
    if (!isUnmountedRef.current) {
      setStream(null);
      setIsRecording(false);
    }
  }, []);

  // Unmount cleanup
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      cleanup();
    };
  }, [cleanup]);

  // Start camera
  const startCamera = useCallback(async (facingMode: 'user' | 'environment' = 'environment') => {
    // Cleanup existing stream first
    cleanup();

    if (isUnmountedRef.current) return;

    abortControllerRef.current = new AbortController();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: true,
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);

      if (isUnmountedRef.current) {
        // Component unmounted during async call - cleanup immediately
        newStream.getTracks().forEach(track => track.stop());
        return;
      }

      streamRef.current = newStream;
      setStream(newStream);
      setError(null);

    } catch (err) {
      if (!isUnmountedRef.current) {
        const message = err instanceof Error ? err.message : 'Failed to access camera';
        setError(message);
      }
    }
  }, [cleanup]);

  // Stop camera
  const stopCamera = useCallback(() => {
    cleanup();
  }, [cleanup]);

  // Switch camera
  const switchCamera = useCallback(async (newFacingMode: 'user' | 'environment') => {
    await startCamera(newFacingMode);
  }, [startCamera]);

  return {
    stream,
    isRecording,
    error,
    startCamera,
    stopCamera,
    switchCamera,
    cleanup,
  };
}
```

### 6.3 Object URL Management Implementation

**Create utility helper (optional):**

```typescript
// src/components/ItemCapture/utils/urlManager.ts

type UrlRegistry = Map<string, string>;

export function createUrlManager() {
  const registry: UrlRegistry = new Map();

  return {
    /**
     * Create a tracked object URL
     */
    createUrl: (blob: Blob, key: string): string => {
      // Revoke existing URL for this key
      const existing = registry.get(key);
      if (existing) {
        URL.revokeObjectURL(existing);
        registry.delete(key);
      }

      const url = URL.createObjectURL(blob);
      registry.set(key, url);
      return url;
    },

    /**
     * Revoke a specific URL by key
     */
    revokeUrl: (key: string): void => {
      const url = registry.get(key);
      if (url) {
        URL.revokeObjectURL(url);
        registry.delete(key);
      }
    },

    /**
     * Revoke all tracked URLs
     */
    revokeAll: (): void => {
      registry.forEach((url, key) => {
        URL.revokeObjectURL(url);
        console.log(`[UrlManager] Revoked URL for: ${key}`);
      });
      registry.clear();
    },

    /**
     * Get count of active URLs (for debugging)
     */
    getActiveCount: (): number => registry.size,
  };
}
```

**Usage in components:**

```typescript
// In VideoCaptureStep.tsx or PhotoCaptureStep.tsx
const urlManagerRef = useRef(createUrlManager());

// Create URL for preview
const previewUrl = urlManagerRef.current.createUrl(blob, `preview-${mediaItem.id}`);

// Cleanup on unmount
useEffect(() => {
  return () => {
    urlManagerRef.current.revokeAll();
  };
}, []);
```

### 6.4 State Machine Cleanup Action

**Add to useItemCaptureState.ts:**

```typescript
type ItemCaptureAction =
  // ... existing actions
  | { type: 'CLEANUP_MEDIA'; payload: string } // cleanup specific media by id
  | { type: 'CLEANUP_ALL' }; // cleanup all media resources

// In reducer
case 'CLEANUP_MEDIA': {
  const mediaId = action.payload;
  const mediaItem = state.mediaItems.find(item => item.id === mediaId);

  // Note: Actual blob URL revocation happens in components
  // This action just removes from state
  return {
    ...state,
    mediaItems: state.mediaItems.filter(item => item.id !== mediaId),
  };
}

case 'CLEANUP_ALL': {
  // Reset to initial state
  return {
    ...initialState,
  };
}
```

---

## 7. Acceptance Criteria Mapping

Based on REQ-054 in gen_requests.md:

| Requirement | Implementation |
|-------------|----------------|
| Editor components not loaded until editing step | `next/dynamic` with ssr: false for ImageCropper, VideoTrimmer, MarkdownEditor |
| Camera/microphone released within 1 second of exit | cleanup() function with track.stop() in useMediaCapture |
| All blob URLs revoked on preview unmount | useEffect cleanup with URL.revokeObjectURL() |
| Memory stable across 5 consecutive sessions | urlManager + stream cleanup + heap profiling validation |
| No active streams after camera step exit | streamRef.current cleanup on step transition |
| Performance stable during 15-minute session | Lazy loading + aggressive cleanup prevents memory growth |
| Memory profiling confirms no leaks | Chrome DevTools heap snapshot comparison |

---

## 8. Testing Approach

### Unit Tests

1. **Lazy Loading:**
   - Verify editor components don't appear in initial bundle
   - Verify loading states render during dynamic import
   - Verify components render after lazy load completes

2. **Stream Cleanup:**
   - Mock navigator.mediaDevices.getUserMedia
   - Verify track.stop() called on cleanup()
   - Verify cleanup called on component unmount
   - Verify cleanup called on step navigation

3. **URL Management:**
   - Verify URL.createObjectURL called with correct blob
   - Verify URL.revokeObjectURL called on cleanup
   - Verify duplicate keys revoke previous URL first

### Integration Tests

1. Full capture flow with memory monitoring
2. Step transitions with stream verification
3. Cancel flow verifies all resources released
4. Multiple capture sessions without page reload

### Manual Testing Checklist

- [ ] Initial load does not include editor chunks (Network tab)
- [ ] Camera LED turns off immediately when leaving capture step
- [ ] Camera LED turns off when clicking Cancel
- [ ] No "detached HTMLVideoElement" in heap snapshot after session
- [ ] Memory returns to baseline after 5 capture cycles
- [ ] No console errors about blob URL access after cleanup
- [ ] Loading spinner appears during editor lazy load
- [ ] PDF thumbnails generate only after PDF upload (not on page load)

### Memory Profiling Checklist

1. [ ] Open Chrome DevTools > Memory tab
2. [ ] Navigate to ItemCapture, take heap snapshot (baseline)
3. [ ] Complete capture flow, return to ItemCapture
4. [ ] Take heap snapshot, compare delta
5. [ ] Repeat 5 times
6. [ ] Verify memory delta < 10% between cycles 3-5
7. [ ] Search snapshots for "Blob" - verify none retained
8. [ ] Search snapshots for "MediaStream" - verify none retained

---

## 9. Risk Considerations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Race condition on cleanup | Medium | High | Use isUnmountedRef guard on all state updates |
| Lazy load delay affects UX | Low | Medium | Show loading spinners, prefetch on hover |
| PDF.js worker not loading | Low | Medium | Use CDN worker, add fallback |
| Browser differences in cleanup | Medium | Medium | Test on Safari, Firefox, Chrome; add polyfills if needed |
| Stream stop() not working | Low | High | Verify with multiple camera devices; add retry logic |

---

## 10. Implementation Order

1. **Phase A: Lazy Loading (Day 1)**
   - Add dynamic imports to MediaEditorStep.tsx
   - Add dynamic imports to TextEditorStep.tsx
   - Add lazy PDF loading to FileUploadStep.tsx
   - Verify bundle chunks in build output

2. **Phase B: Stream Cleanup (Day 1-2)**
   - Add cleanup refs to useMediaCapture.ts
   - Add unmount cleanup effect
   - Add step transition cleanup
   - Test camera LED behavior

3. **Phase C: URL Management (Day 2)**
   - Create urlManager utility (optional)
   - Add URL cleanup to VideoCaptureStep.tsx
   - Add URL cleanup to PhotoCaptureStep.tsx
   - Add URL cleanup to FileUploadStep.tsx
   - Add URL cleanup to ReviewStep.tsx

4. **Phase D: Memory Profiling (Day 2-3)**
   - Document baseline measurements
   - Run 5-cycle stress test
   - Document heap snapshot comparisons
   - Fix any identified leaks
   - Update acceptance criteria with results

---

## 11. Related Tasks

| Task ID | Title | Relationship |
|---------|-------|--------------|
| 5.4 | onComplete Assembly | Preceding - must complete before optimization |
| 5.6 | Test Harness | Parallel - testing framework for validation |
| 2.1 | useMediaCapture | Modified - adds cleanup logic |
| 3.1 | useFileUpload | Modified - adds URL management |
| 4.1 | useMediaEditor | Modified - adds edit blob cleanup |
| REQ-028 | Bundle Analysis | Reference - confirmed lazy loading savings |

---

## 12. Open Questions

1. **URL Manager Utility:** Should we create a centralized urlManager.ts utility, or keep cleanup logic inline in each component?
   - **Recommendation:** Create utility for consistency and debugging visibility

2. **Prefetching:** Should we prefetch editor chunks on hover/focus of content type selection?
   - **Recommendation:** Not in V1 - loading time is acceptable; consider in V2

3. **Service Worker Caching:** Should lazy-loaded chunks be cached by service worker?
   - **Recommendation:** Defer to future PWA implementation

4. **Debug Mode:** Should the debug flag enable verbose cleanup logging?
   - **Recommendation:** Yes - helps identify cleanup issues in development

5. **Memory Thresholds:** What memory growth percentage triggers concern?
   - **Recommendation:** Flag if >10% growth between stable cycles (3-5)

---

## 13. References

- [Implementation Plan](/docs/prd/item-capture-implementation-plan.md) - Phase 5, Task 5.5
- [Bundle Analysis Report](/docs/req-028-bundle-analysis-report.md) - Lazy loading validation
- [useQRCodeGeneration.ts](/src/hooks/useQRCodeGeneration.ts) - Cleanup pattern reference
- [utils.ts downloadBlob](/src/lib/utils.ts) - URL revocation pattern
- [ImageCropper.tsx](/src/components/ItemCapture/editors/ImageCropper.tsx) - Lazy load comment
- [pdfThumbnailGenerator.ts](/src/components/ItemCapture/utils/pdfThumbnailGenerator.ts) - Dynamic import example
- [Next.js Dynamic Import](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)
- [MediaDevices API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices)
- [URL.revokeObjectURL() - MDN](https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL)
- [Chrome DevTools Memory](https://developer.chrome.com/docs/devtools/memory-problems/)
