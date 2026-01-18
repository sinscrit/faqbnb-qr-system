# REQ-076: Implement Video Playback Interface with Standard Controls

**Created:** 2026-01-03
**Last Modified:** 2026-01-03
**Phase:** 4 - Item Preview/Detail
**Task ID:** 4.3
**Depends On:** Task 4.2 (MediaGallery Component)
**Parallel With:** Task 4.4 (Photo/PDF Viewer)
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`

---

## 1. Overview

### 1.1 Purpose
Implement a video playback interface within the ItemManager's MediaGallery component that provides standard playback controls including play/pause, seeking, volume adjustment, and full-screen viewing. This enables property managers to review video content captured or uploaded through the application.

### 1.2 Request Summary (from REQ-076)
Users should be able to watch video content in the item preview with standard playback controls including:
- Play and pause controls with immediate response
- Seek bar for jumping to any point in the timeline
- Volume controls with visual feedback
- Full-screen toggle for expanded viewing
- Playback progress showing current time and duration
- Auto-hiding controls with mouse/touch reveal
- Keyboard accessibility (spacebar, arrow keys)
- Support for common video formats (MP4, WebM)

### 1.3 Business Value
Enables comprehensive video-based inventory documentation, meeting professional property management standards and providing defensible records for insurance claims, disputes, or audits.

---

## 2. Technical Context

### 2.1 Existing Video Patterns in Codebase

The codebase has established video handling patterns that should be followed:

| Pattern | Source File | Key Implementation |
|---------|-------------|-------------------|
| Video element with ref | `VideoTrimmer.tsx:99-100` | `const videoRef = useRef<HTMLVideoElement>(null)` |
| Play/pause control | `VideoTrimmer.tsx:216-232` | `video.play().catch()` / `video.pause()` |
| Time update handling | `VideoTrimmer.tsx:172-185` | `onTimeUpdate` event for progress tracking |
| Object URL for blobs | `VideoTrimmer.tsx:117-127` | `URL.createObjectURL()` with cleanup |
| iOS compatibility | `CameraPreview.tsx:345-357` | `playsInline` + `webkit-playsinline` |
| Keyboard controls | `VideoTrimmer.tsx:355-424` | Arrow keys, spacebar, Home/End |
| Native controls fallback | `VideoCaptureStep.tsx:602-618` | `controls` attribute for simple preview |

### 2.2 Component Hierarchy (from Implementation Plan)

```
ItemManager/
├── components/
│   └── ItemPreview/
│       ├── ItemPreviewModal.tsx      # Modal container (Task 4.1)
│       ├── MediaGallery.tsx          # Carousel/gallery (Task 4.2)
│       ├── VideoPlayer.tsx           # THIS TASK (4.3) - NEW FILE
│       └── InstructionsViewer.tsx    # Markdown display (Task 4.5)
```

### 2.3 Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| MediaGallery component | Required (Task 4.2) | Parent container for video player |
| ItemPreviewModal | Required (Task 4.1) | Modal wrapper providing context |
| Lucide React icons | Existing | Play, Pause, Volume2, VolumeX, Maximize, Minimize |
| cn() utility | Existing | `src/lib/utils.ts` for class merging |
| MediaItem type | Existing | From `ItemCapture.types.ts` |

### 2.4 Technology Stack Constraints

- **Framework:** Next.js 15 + React 19 + TypeScript
- **Styling:** Tailwind CSS 4.x
- **Icons:** Lucide React 0.525.0
- **Video:** HTML5 `<video>` element (no external libraries)
- **State:** Local component state with useRef for video element

---

## 3. Implementation Approach

### 3.1 Component Architecture

```tsx
// VideoPlayer.tsx - Standalone video player component
interface VideoPlayerProps {
  /** Video source as MediaItem, Blob, File, or URL string */
  src: MediaItem | Blob | File | string;
  /** Optional poster image URL */
  poster?: string;
  /** Auto-play on mount (default: false) */
  autoPlay?: boolean;
  /** Loop playback (default: false) */
  loop?: boolean;
  /** Initial muted state (default: false for manual play) */
  muted?: boolean;
  /** Callback when video ends */
  onEnded?: () => void;
  /** Callback for playback errors */
  onError?: (error: string) => void;
  /** Optional className override */
  className?: string;
}
```

### 3.2 Feature Breakdown

#### 3.2.1 Core Video Element
- HTML5 `<video>` element with ref for programmatic control
- Support for multiple source types (MediaItem blob, File, URL string)
- Object URL creation and cleanup for Blob/File sources
- `playsInline` for iOS Safari compatibility
- Preload strategy: `metadata` for performance

#### 3.2.2 Playback Controls
- **Play/Pause Button:** Toggle with icon swap (Play ↔ Pause)
- **Seek Bar:** Click/drag on timeline to jump to timestamp
- **Skip Controls:** ±10 second jumps via buttons or arrow keys
- **Progress Display:** Current time / Total duration (e.g., "1:23 / 4:56")

#### 3.2.3 Volume Controls
- **Volume Slider:** Range input (0-100%)
- **Mute Toggle:** One-click mute/unmute with icon change (Volume2 ↔ VolumeX)
- **Volume Memory:** Remember last non-zero volume when unmuting

#### 3.2.4 Full-Screen Support
- **Toggle Button:** Expand/collapse with icon (Maximize ↔ Minimize)
- **Fullscreen API:** `requestFullscreen()` / `exitFullscreen()`
- **Fallback:** CSS-based fullscreen for unsupported browsers
- **Controls in Fullscreen:** Overlay controls remain accessible

#### 3.2.5 Control Visibility
- **Auto-hide:** Controls fade after 3 seconds of inactivity during playback
- **Reveal on Interaction:** Mouse move or touch reveals controls
- **Always Visible When Paused:** Controls remain visible when video is paused

#### 3.2.6 Accessibility
- **Keyboard Navigation:** Spacebar (play/pause), Arrow keys (seek ±5s)
- **Focus Management:** Controls receive focus for keyboard users
- **ARIA Labels:** All interactive elements have descriptive labels
- **Screen Reader:** Announce playback state changes

### 3.3 State Management

```tsx
// Local state structure
interface VideoPlayerState {
  // Playback
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  buffered: TimeRanges | null;

  // Volume
  volume: number;        // 0-1
  isMuted: boolean;
  lastVolume: number;    // Remember pre-mute volume

  // UI
  isFullscreen: boolean;
  controlsVisible: boolean;
  isLoading: boolean;
  error: string | null;

  // Seeking
  isSeeking: boolean;
  seekPosition: number;  // For visual feedback during drag
}
```

### 3.4 Event Handling Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    VideoPlayer Component                      │
├─────────────────────────────────────────────────────────────┤
│  Video Events:                                                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │loadedmetadata│→│ Set duration│→│ isLoading=F │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
│                                                               │
│  ┌─────────────┐ ┌─────────────┐                            │
│  │ timeupdate  │→│Update current│                            │
│  │             │ │time & progress│                            │
│  └─────────────┘ └─────────────┘                            │
│                                                               │
│  ┌─────────────┐ ┌─────────────┐                            │
│  │   ended     │→│isPlaying=F  │→ Call onEnded              │
│  └─────────────┘ └─────────────┘                            │
│                                                               │
│  User Interactions:                                           │
│  ┌─────────────┐ ┌─────────────┐                            │
│  │ Click play  │→│video.play() │→ isPlaying=T               │
│  └─────────────┘ └─────────────┘                            │
│                                                               │
│  ┌─────────────┐ ┌─────────────┐                            │
│  │ Seek drag   │→│video.current│→ Update progress           │
│  │             │ │Time = pos   │                            │
│  └─────────────┘ └─────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Detailed Tasks

### Task 4.3.1: Create VideoPlayer Component Shell
**Effort:** 1 point

Create the base component structure with video element and ref management:
- Create `src/components/ItemManager/components/ItemPreview/VideoPlayer.tsx`
- Define `VideoPlayerProps` interface
- Implement video element with ref
- Handle Blob/File/URL source types with object URL management
- Add iOS Safari compatibility attributes

### Task 4.3.2: Implement Play/Pause Controls
**Effort:** 1 point

Add basic playback toggle functionality:
- Play/pause button with icon toggle
- Connect to video.play() / video.pause()
- Handle play promise rejection (autoplay policies)
- Update isPlaying state on play/pause events

### Task 4.3.3: Implement Seek Bar with Progress Display
**Effort:** 2 points

Create timeline seeking interface:
- Range input styled as progress bar
- Display current time and duration (MM:SS format)
- Click-to-seek functionality
- Drag-to-seek with visual feedback
- Buffer progress indicator (optional)

### Task 4.3.4: Implement Volume Controls
**Effort:** 1 point

Add volume adjustment functionality:
- Volume slider (0-100%)
- Mute/unmute toggle button
- Remember last volume when unmuting
- Visual volume level indicator

### Task 4.3.5: Implement Full-Screen Support
**Effort:** 2 points

Add full-screen viewing capability:
- Fullscreen toggle button
- Use Fullscreen API with proper vendor prefixes
- CSS fallback for unsupported browsers
- Maintain control visibility in fullscreen
- Handle fullscreen change events

### Task 4.3.6: Implement Control Auto-Hide
**Effort:** 1 point

Add control visibility management:
- Auto-hide controls after 3 seconds during playback
- Show controls on mouse move or touch
- Keep controls visible when paused
- Smooth fade transitions

### Task 4.3.7: Add Keyboard Accessibility
**Effort:** 1 point

Implement keyboard navigation:
- Spacebar: Toggle play/pause
- Arrow Left/Right: Seek ±5 seconds
- Arrow Up/Down: Adjust volume ±10%
- M key: Toggle mute
- F key: Toggle fullscreen
- Focus ring styling for keyboard users

### Task 4.3.8: Integrate with MediaGallery
**Effort:** 1 point

Connect VideoPlayer to MediaGallery component:
- Render VideoPlayer when media.type === 'video'
- Pass appropriate props from MediaItem
- Handle gallery navigation (pause on slide change)
- Coordinate with parent modal state

---

## 5. Authorized Files and Functions for Modification

### 5.1 New Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/components/ItemPreview/VideoPlayer.tsx` | Main video player component |
| `src/components/ItemManager/components/ItemPreview/videoPlayerUtils.ts` | Time formatting, fullscreen helpers |
| `src/components/ItemManager/components/ItemPreview/__tests__/VideoPlayer.test.tsx` | Unit tests |

### 5.2 Existing Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemManager/components/ItemPreview/MediaGallery.tsx` | Import and render VideoPlayer for video items |
| `src/components/ItemManager/components/ItemPreview/index.ts` | Export VideoPlayer (if barrel export exists) |

### 5.3 Files for Reference Only (Do Not Modify)

| File Path | Reference Purpose |
|-----------|-------------------|
| `src/components/ItemCapture/editors/VideoTrimmer.tsx` | Video element patterns, event handling |
| `src/components/ItemCapture/editors/trimUtils.ts` | Time formatting utilities (formatTime) |
| `src/components/ItemCapture/components/shared/CameraPreview.tsx` | iOS Safari video patterns |
| `src/components/ItemCapture/components/steps/VideoCaptureStep.tsx` | Native controls fallback pattern |
| `src/lib/utils.ts` | cn() utility for class merging |

---

## 6. Acceptance Criteria Checklist

Based on REQ-076 acceptance criteria:

- [ ] Video player loads and displays video content when a video item is selected
- [ ] Play button initiates playback and transforms into a pause button
- [ ] Pause button stops playback and transforms back into a play button
- [ ] Seek bar displays current playback position and allows clicking/dragging to any timestamp
- [ ] Volume control adjusts audio level with visual feedback (mute toggle and volume slider)
- [ ] Full-screen button expands video to fill the viewport with controls remaining accessible
- [ ] Exiting full-screen mode returns the player to its original size and position
- [ ] Playback progress shows current time and total video duration (e.g., "1:23 / 4:56")
- [ ] Controls auto-hide after 3 seconds of mouse/touch inactivity during playback
- [ ] Moving the mouse or tapping the screen reveals controls again
- [ ] Player is accessible via keyboard (spacebar for play/pause, arrow keys for seeking)
- [ ] Player handles common video formats (MP4, WebM) across modern browsers

---

## 7. Testing Strategy

### 7.1 Unit Tests
- Play/pause state transitions
- Volume control behavior
- Time formatting utilities
- Fullscreen toggle states
- Keyboard event handling

### 7.2 Integration Tests
- VideoPlayer within MediaGallery context
- Object URL creation and cleanup
- Control visibility timing

### 7.3 Manual Testing Checklist
- [ ] iOS Safari 15+ (iPhone and iPad)
- [ ] Chrome on Android
- [ ] Chrome/Firefox/Edge on desktop
- [ ] Keyboard navigation only
- [ ] Screen reader testing (VoiceOver, NVDA)
- [ ] Fullscreen on various devices
- [ ] Various video formats (MP4, WebM)
- [ ] Large video files (performance)
- [ ] Network interruption handling

---

## 8. Technical Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Fullscreen API browser inconsistencies | Medium | Medium | Vendor prefix detection, CSS fallback |
| iOS Safari autoplay restrictions | High | Low | Require user interaction to start playback |
| Memory leaks from object URLs | Medium | High | Strict cleanup in useEffect return |
| Touch vs mouse event conflicts | Medium | Medium | Use pointer events where possible |
| Controls blocking video content | Low | Low | Semi-transparent overlay, strategic positioning |

---

## 9. Implementation Notes

### 9.1 Time Formatting (Reuse Pattern)
Leverage existing `formatTime` function from `trimUtils.ts`:
```typescript
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

### 9.2 iOS Safari Compatibility
Follow established pattern from CameraPreview:
```tsx
<video
  playsInline
  {...({ 'webkit-playsinline': 'true' } as React.HTMLAttributes<HTMLVideoElement>)}
/>
```

### 9.3 Fullscreen API Abstraction
```typescript
const requestFullscreen = (element: HTMLElement) => {
  if (element.requestFullscreen) {
    return element.requestFullscreen();
  } else if ((element as any).webkitRequestFullscreen) {
    return (element as any).webkitRequestFullscreen();
  } else if ((element as any).mozRequestFullScreen) {
    return (element as any).mozRequestFullScreen();
  }
  return Promise.reject(new Error('Fullscreen not supported'));
};
```

### 9.4 Control Visibility Timer
```typescript
const HIDE_CONTROLS_DELAY = 3000; // ms

useEffect(() => {
  if (!isPlaying) {
    setControlsVisible(true);
    return;
  }

  const timer = setTimeout(() => {
    setControlsVisible(false);
  }, HIDE_CONTROLS_DELAY);

  return () => clearTimeout(timer);
}, [isPlaying, lastInteraction]);
```

---

## 10. Effort Estimate

| Task | Description | Points |
|------|-------------|--------|
| 4.3.1 | VideoPlayer component shell | 1 |
| 4.3.2 | Play/pause controls | 1 |
| 4.3.3 | Seek bar with progress | 2 |
| 4.3.4 | Volume controls | 1 |
| 4.3.5 | Full-screen support | 2 |
| 4.3.6 | Control auto-hide | 1 |
| 4.3.7 | Keyboard accessibility | 1 |
| 4.3.8 | MediaGallery integration | 1 |
| **Total** | | **10 points** |

**Estimated Duration:** 1-2 days

---

## 11. References

- Implementation Plan: `/docs/prd/item-capture-manager-implementation-plan.md`
- VideoTrimmer Component: `/src/components/ItemCapture/editors/VideoTrimmer.tsx`
- Time Utilities: `/src/components/ItemCapture/editors/trimUtils.ts`
- CameraPreview Patterns: `/src/components/ItemCapture/components/shared/CameraPreview.tsx`
- MDN Fullscreen API: https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
- MDN HTMLVideoElement: https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement

---

*This document provides the technical blueprint for implementing video playback functionality within the ItemManager component's item preview feature.*
