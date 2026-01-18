# REQ-037: Build CameraPreview Component - Technical Implementation Overview

**Generated:** 2025-12-31T16:45:00
**Last Modified:** 2025-12-31T16:45:00
**Request Reference:** REQ-037 in `/docs/gen_requests.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 2 - Media Capture
**Task ID:** 2.2

---

## Executive Summary

This document provides a technical implementation breakdown for the `CameraPreview` component, a shared UI component that displays a live video feed from the device camera. The component handles camera initialization states, provides visual feedback for permission denial, and supports mirror mode toggling for front-facing cameras.

CameraPreview is a **shared component** (`src/components/ItemCapture/components/shared/CameraPreview.tsx`) used by both `VideoCaptureStep` (Task 2.3) and `PhotoCaptureStep` (Task 2.4). It consumes the `useMediaCapture` hook (Task 2.1) to obtain the media stream.

---

## Scope

### In Scope
- Video element displaying live camera feed with proper styling
- Mirror mode toggle for front-facing camera (CSS transform)
- Loading state with visual indicator during camera activation
- Error state for permission denied with user guidance
- Error state for no camera available
- Clean stream attachment/detachment
- Responsive aspect ratio handling
- Dark mode support (following existing Tailwind patterns)

### Out of Scope
- Camera switching UI (handled by parent step components)
- Recording controls (handled by `VideoCaptureStep`)
- Photo capture button (handled by `PhotoCaptureStep`)
- Permission request logic (handled by `useMediaCapture` hook)
- Stream lifecycle management (handled by `useMediaCapture` hook)
- Video processing or effects

---

## Dependencies

### Hard Dependencies (Must Complete First)

| Dependency | Status | Location |
|------------|--------|----------|
| Task 2.1 - useMediaCapture hook | Required | `src/components/ItemCapture/hooks/useMediaCapture.ts` |
| Phase 1 Complete | Required | Tasks 1.1-1.5 |
| ItemCapture.types.ts | Required | `src/components/ItemCapture/ItemCapture.types.ts` |

### Soft Dependencies (Can Develop in Parallel)

| Dependency | Status | Notes |
|------------|--------|-------|
| Task 2.3 - VideoCaptureStep | Parallel | Consumer of CameraPreview |
| Task 2.4 - PhotoCaptureStep | Parallel | Consumer of CameraPreview |

### External Dependencies

| Dependency | Notes |
|------------|-------|
| Lucide React | Camera, Loader2, AlertTriangle, Settings icons (already in project) |
| Tailwind CSS | Styling (already in project) |
| cn() utility | Class merging from `src/lib/utils.ts` |

---

## Technical Approach

### Architecture Decision: Presentational Component Pattern

**Decision:** CameraPreview is a pure presentational component that receives all data via props

**Rationale:**
- Follows codebase pattern from `ConfirmationModal.tsx` (presentational with props)
- Maximum reusability across VideoCaptureStep and PhotoCaptureStep
- Parent components control stream lifecycle via useMediaCapture hook
- Simplifies testing (mock props, no internal state complexity)
- Matches implementation plan hierarchy (`shared/CameraPreview.tsx`)

### Video Element Binding Strategy

The component uses a `ref` callback pattern to bind the MediaStream to the video element:

```typescript
const videoRef = useRef<HTMLVideoElement>(null);

useEffect(() => {
  if (videoRef.current && stream) {
    videoRef.current.srcObject = stream;
    videoRef.current.play().catch(() => {
      // Autoplay may be blocked; handle gracefully
    });
  }

  return () => {
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };
}, [stream]);
```

### Mirror Mode Implementation

Front-facing cameras produce "mirrored" video by default on most devices. The component applies a CSS transform to mirror the display, which feels natural for selfie-style composition:

```css
.mirrored {
  transform: scaleX(-1);
}
```

**Key Insight:** The recorded/captured media is NOT mirrored - only the preview. This matches user expectation from phone cameras.

### State Display Priority

When multiple states are active, display in this priority order:
1. **Browser Not Supported** - Show browser upgrade message
2. **Permission Denied** - Show permission guidance
3. **No Device Found** - Show device connection guidance
4. **Loading** - Show spinner while initializing
5. **Active** - Show live video feed

---

## Interface Design

### Component Props Interface

```typescript
/**
 * Props for the CameraPreview component
 */
interface CameraPreviewProps {
  /** Media stream from useMediaCapture hook (null when inactive) */
  stream: MediaStream | null;

  /** Whether the camera is currently loading/initializing */
  isLoading: boolean;

  /** Error object from useMediaCapture (null when no error) */
  error: MediaCaptureError | null;

  /** Whether to mirror the video preview (for front-facing camera) */
  isMirrored: boolean;

  /** Callback to toggle mirror mode */
  onMirrorToggle?: () => void;

  /** Detected facing mode from useMediaCapture */
  facingMode?: 'user' | 'environment' | 'unknown';

  /** Optional aspect ratio (default: 16/9) */
  aspectRatio?: number;

  /** Optional additional CSS classes */
  className?: string;

  /** Whether the component is in a compact mode (e.g., thumbnail preview) */
  compact?: boolean;

  /** Callback when user wants to retry after error */
  onRetry?: () => void;

  /** Callback when user wants to open settings (permission denied) */
  onOpenSettings?: () => void;
}
```

### Error Display Types

Based on `MediaCaptureErrorCode` from useMediaCapture:

| Error Code | Icon | Title | Message | Actions |
|------------|------|-------|---------|---------|
| `PERMISSION_DENIED` | AlertTriangle | Camera Access Denied | Please allow camera access in your browser settings | [Open Settings], [Skip Camera] |
| `NO_DEVICE_FOUND` | Camera (X) | No Camera Found | Connect a camera or try a different device | [Retry], [Skip Camera] |
| `DEVICE_IN_USE` | Camera (X) | Camera In Use | Close other apps using the camera | [Retry] |
| `BROWSER_NOT_SUPPORTED` | AlertTriangle | Browser Not Supported | Your browser doesn't support camera access | [Learn More] |
| `STREAM_ERROR` | AlertTriangle | Camera Error | Unable to access camera | [Retry] |

---

## Component Structure

### File Organization

```
src/components/ItemCapture/components/shared/
├── CameraPreview.tsx          # Main component file
└── index.ts                   # Re-export (if needed)
```

### Component Breakdown

```typescript
// CameraPreview.tsx
'use client';

import { useEffect, useRef } from 'react';
import { Camera, Loader2, AlertTriangle, Settings, RefreshCw, FlipHorizontal2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============ Sub-components ============

/** Loading state overlay */
const LoadingOverlay = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
    <Loader2 className="h-12 w-12 text-white animate-spin mb-4" />
    <p className="text-white text-sm">Activating camera...</p>
  </div>
);

/** Error state display */
const ErrorDisplay = ({ error, onRetry, onOpenSettings }: ErrorDisplayProps) => (
  // Error-specific content based on error.code
);

/** Mirror toggle button */
const MirrorToggle = ({ isMirrored, onToggle }: MirrorToggleProps) => (
  // Toggle button with FlipHorizontal2 icon
);

/** Placeholder when no stream */
const PlaceholderDisplay = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
    <Camera className="h-16 w-16 text-gray-600" />
  </div>
);

// ============ Main Component ============

export function CameraPreview({
  stream,
  isLoading,
  error,
  isMirrored,
  onMirrorToggle,
  facingMode = 'unknown',
  aspectRatio = 16 / 9,
  className,
  compact = false,
  onRetry,
  onOpenSettings,
}: CameraPreviewProps) {
  // Video ref management
  // Stream binding effect
  // State-based rendering
}
```

---

## Implementation Tasks

### Task Breakdown

| Task | Description | Estimate | Depends On |
|------|-------------|----------|------------|
| 2.2.1 | Create component file with TypeScript interface | 20 min | Task 2.1 |
| 2.2.2 | Implement video element with stream binding | 30 min | 2.2.1 |
| 2.2.3 | Implement LoadingOverlay sub-component | 20 min | 2.2.1 |
| 2.2.4 | Implement ErrorDisplay sub-component | 45 min | 2.2.1 |
| 2.2.5 | Implement mirror mode toggle | 30 min | 2.2.2 |
| 2.2.6 | Add responsive aspect ratio handling | 20 min | 2.2.2 |
| 2.2.7 | Add dark mode support | 15 min | 2.2.2-2.2.4 |
| 2.2.8 | Add accessibility attributes | 20 min | 2.2.2-2.2.5 |
| 2.2.9 | Update barrel exports | 10 min | 2.2.1-2.2.8 |
| 2.2.10 | Manual testing across devices | 45 min | 2.2.1-2.2.9 |

**Total Estimated Time:** ~4.5 hours (0.5 day)

---

## Key Implementation Details

### 1. Stream Binding with Proper Cleanup

```typescript
const videoRef = useRef<HTMLVideoElement>(null);
const [isVideoReady, setIsVideoReady] = useState(false);

useEffect(() => {
  const videoElement = videoRef.current;

  if (!videoElement) return;

  if (stream) {
    videoElement.srcObject = stream;

    const handleLoadedMetadata = () => {
      setIsVideoReady(true);
    };

    const handlePlay = () => {
      setIsVideoReady(true);
    };

    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('play', handlePlay);

    // Attempt autoplay (may fail on some browsers without user interaction)
    videoElement.play().catch((err) => {
      console.warn('Video autoplay failed:', err);
    });

    return () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.srcObject = null;
      setIsVideoReady(false);
    };
  } else {
    videoElement.srcObject = null;
    setIsVideoReady(false);
  }
}, [stream]);
```

### 2. Mirror Mode with CSS Transform

```typescript
// In the video element JSX:
<video
  ref={videoRef}
  autoPlay
  playsInline
  muted
  className={cn(
    'w-full h-full object-cover',
    isMirrored && 'scale-x-[-1]'  // CSS transform for mirroring
  )}
/>

// Mirror toggle button (only shown for front camera)
{facingMode === 'user' && onMirrorToggle && (
  <button
    onClick={onMirrorToggle}
    className={cn(
      'absolute bottom-4 right-4 p-2 rounded-full transition-colors',
      'bg-black/50 hover:bg-black/70',
      isMirrored && 'bg-blue-500/80 hover:bg-blue-500'
    )}
    aria-label={isMirrored ? 'Disable mirror mode' : 'Enable mirror mode'}
    title={isMirrored ? 'Disable mirror mode' : 'Enable mirror mode'}
  >
    <FlipHorizontal2 className="h-5 w-5 text-white" />
  </button>
)}
```

### 3. Error Display Component (Following ConfirmationModal Pattern)

```typescript
interface ErrorDisplayProps {
  error: MediaCaptureError;
  onRetry?: () => void;
  onOpenSettings?: () => void;
}

function ErrorDisplay({ error, onRetry, onOpenSettings }: ErrorDisplayProps) {
  const getErrorContent = () => {
    switch (error.code) {
      case 'PERMISSION_DENIED':
        return {
          icon: <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />,
          title: 'Camera Access Denied',
          showSettings: true,
        };
      case 'NO_DEVICE_FOUND':
        return {
          icon: <Camera className="h-12 w-12 text-gray-400 mb-4" />,
          title: 'No Camera Found',
          showSettings: false,
        };
      case 'DEVICE_IN_USE':
        return {
          icon: <Camera className="h-12 w-12 text-orange-500 mb-4" />,
          title: 'Camera In Use',
          showSettings: false,
        };
      case 'BROWSER_NOT_SUPPORTED':
        return {
          icon: <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />,
          title: 'Browser Not Supported',
          showSettings: false,
        };
      default:
        return {
          icon: <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />,
          title: 'Camera Error',
          showSettings: false,
        };
    }
  };

  const content = getErrorContent();

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 p-6 text-center">
      {content.icon}
      <h3 className="text-white text-lg font-semibold mb-2">{content.title}</h3>
      <p className="text-gray-300 text-sm mb-4 max-w-xs">{error.message}</p>
      {error.action && (
        <p className="text-gray-400 text-xs mb-6">{error.action}</p>
      )}
      <div className="flex gap-3">
        {error.recoverable && onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        )}
        {content.showSettings && onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="inline-flex items-center px-4 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Settings className="h-4 w-4 mr-2" />
            Open Settings
          </button>
        )}
      </div>
    </div>
  );
}
```

### 4. Aspect Ratio Container

```typescript
<div
  className={cn(
    'relative overflow-hidden bg-black rounded-lg',
    className
  )}
  style={{
    aspectRatio: `${aspectRatio}`,
    maxHeight: compact ? '200px' : undefined,
  }}
>
  {/* Video element and overlays */}
</div>
```

### 5. Accessibility Considerations

```typescript
<video
  ref={videoRef}
  autoPlay
  playsInline
  muted
  // Accessibility: Video is decorative (camera preview)
  aria-hidden="true"
  // iOS Safari requirement for inline playback
  webkit-playsinline="true"
  className={cn('w-full h-full object-cover', isMirrored && 'scale-x-[-1]')}
/>

// For screen readers, provide context in parent component
<div role="region" aria-label="Camera preview">
  <CameraPreview ... />
  {/* Camera controls with proper labels */}
</div>
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/components/shared/CameraPreview.tsx` | Main component implementation |

### Files to Modify

| File Path | Modification | Reason |
|-----------|--------------|--------|
| `src/components/ItemCapture/ItemCapture.types.ts` | Add `CameraPreviewProps` interface | Type definitions |
| `src/components/ItemCapture/index.ts` | Export `CameraPreview` component | Public API |

### Directory to Create (if not exists)

| Path | Purpose |
|------|---------|
| `src/components/ItemCapture/components/shared/` | Shared components directory |

### Files to Reference (Read-Only)

| File Path | Reference Purpose |
|-----------|-------------------|
| `src/components/ConfirmationModal.tsx` | Modal/overlay pattern |
| `src/lib/utils.ts` | `cn()` class merging utility |
| `src/components/ItemForm.tsx` | Form component patterns, button styling |
| `src/components/ItemCapture/hooks/useMediaCapture.ts` | Hook interface for stream/error types |
| `docs/REQ-036-create-usemediacapture-hook-overview.md` | Hook return interface reference |

---

## Styling Guidelines

### Following Existing Patterns

Based on analysis of `ConfirmationModal.tsx` and `ItemForm.tsx`:

| Element | Tailwind Classes |
|---------|------------------|
| Container | `rounded-lg`, `overflow-hidden`, `bg-black` |
| Overlay | `absolute inset-0`, `flex items-center justify-center` |
| Loading text | `text-white text-sm` |
| Error title | `text-white text-lg font-semibold` |
| Error message | `text-gray-300 text-sm` |
| Primary button | `px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors` |
| Secondary button | `px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors` |
| Icon button | `p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors` |

### Dark Mode Support

Following `globals.css` patterns, use color variants that work in both light and dark contexts:
- Use solid background colors for overlays (`bg-gray-900`, `bg-black`)
- Ensure sufficient contrast for text on video overlays
- Test with both light and dark system preferences

---

## Testing Strategy

### Unit Test Coverage

| Test Case | Description |
|-----------|-------------|
| Renders without stream | Shows placeholder when stream is null |
| Shows loading state | Loading overlay visible when isLoading=true |
| Shows error state | Error display visible when error is set |
| Mirrors video | CSS transform applied when isMirrored=true |
| Calls onMirrorToggle | Toggle button triggers callback |
| Calls onRetry | Retry button triggers callback |
| Cleanup on unmount | srcObject cleared when component unmounts |

### Integration Test Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| Stream attachment | Pass MediaStream → Check video.srcObject | Stream attached |
| Permission denied flow | Set error with PERMISSION_DENIED code | Error display with settings option |
| Mirror toggle | Click mirror button | isMirrored state toggles |
| Stream switch | Change stream prop | New stream attached, old cleared |

### Manual Testing Checklist

| Platform | Test Items |
|----------|------------|
| iOS Safari | Video plays inline, mirror toggle works |
| Chrome Android | Responsive aspect ratio, mirror mode |
| Desktop Chrome | All error states render correctly |
| Desktop Firefox | Stream binding/unbinding |
| Dark mode | Visibility of all UI elements |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Video autoplay blocked | Medium | Low | Handle play() promise rejection gracefully |
| iOS playsInline not working | Low | High | Add webkit-playsinline attribute |
| Mirror button obscures content | Low | Low | Position in corner, semi-transparent |
| Aspect ratio breaks on resize | Low | Medium | Use CSS aspect-ratio property |
| Memory leak on stream switch | Medium | Medium | Properly null srcObject in cleanup |

---

## Open Questions

1. **Compact mode behavior:** Should compact mode hide the mirror toggle and error details?
   - **Recommendation:** Yes, in compact mode show only essential feedback

2. **Settings link behavior:** Should "Open Settings" attempt to open browser settings or show instructions?
   - **Recommendation:** Show instructions modal (can't programmatically open browser settings)

3. **Video object-fit:** Should video use `object-cover` (may crop) or `object-contain` (may letterbox)?
   - **Recommendation:** `object-cover` for fullscreen, `object-contain` for compact mode

---

## Success Criteria

Per REQ-037 acceptance criteria:

- [ ] Live video feed displays in the preview area when camera access is granted
- [ ] Front-facing camera feed is mirrored by default for intuitive composition
- [ ] A loading state is visible during camera initialization
- [ ] Permission denied scenarios show a clear error message with guidance
- [ ] Mirror mode can be toggled on and off without interrupting the video stream
- [ ] Preview maintains appropriate aspect ratio across different device orientations
- [ ] Camera preview stops cleanly when the user navigates away or cancels capture

Additional implementation criteria:

- [ ] Component follows existing codebase patterns (cn(), Lucide icons, Tailwind)
- [ ] All props are properly typed with TypeScript interfaces
- [ ] Component is exported from ItemCapture barrel export
- [ ] No memory leaks when stream changes or component unmounts
- [ ] Works on iOS Safari 16+ and modern desktop browsers

---

## References

- [Implementation Plan - Phase 2](/docs/prd/item-capture-implementation-plan.md)
- [REQ-036 useMediaCapture Overview](/docs/REQ-036-create-usemediacapture-hook-overview.md)
- [ConfirmationModal.tsx](/src/components/ConfirmationModal.tsx) - Modal/overlay pattern
- [ItemForm.tsx](/src/components/ItemForm.tsx) - Form/button patterns
- [utils.ts](/src/lib/utils.ts) - cn() utility
- [MDN: HTMLVideoElement.srcObject](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/srcObject)
- [MDN: MediaStream](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream)
