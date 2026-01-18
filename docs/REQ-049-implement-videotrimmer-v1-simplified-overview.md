# REQ-049: Implement VideoTrimmer (V1 Simplified) - Technical Overview

**Document Created:** 2025-12-31T16:45:00
**Last Modified:** 2025-12-31T16:45:00
**Request Reference:** `/docs/gen_requests.md` - REQ-049
**Implementation Plan:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 4 - Editing Features
**Task ID:** 4.4
**Status:** Ready for Implementation

---

## 1. Summary

Implement a simplified `VideoTrimmer` component that allows users to visually mark start and end points on videos to indicate the desired trim region. This V1 implementation defers actual video encoding to the server at upload time, avoiding the 25MB WASM payload of client-side FFmpeg. The component displays a video player with scrubber, draggable trim markers, and visual preview of the selected region.

**Key V1 Constraint:** No client-side video processing. Trim markers (timestamps) are stored as metadata and sent to the server for actual trimming during upload.

---

## 2. Context from Implementation Plan

### Phase 4 Position

```
        4.1 useMediaEditor Hook
                   |
       +-----------+-----------+
       v           v           v
     4.2         4.3         4.4
   Image       Image       Video
  Cropper     Rotator     Trimmer ◄── THIS TASK
       |           |           |
       +-----------+-----------+
                   v
          4.5 MediaEditorStep
           (Container/Router)
```

### Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Phase 1 (Foundation) | Required | Types, state machine, wizard navigation |
| Phase 2 OR Phase 3 | Required | Need video media items to edit |
| Task 4.1 (useMediaEditor hook) | Required | Provides trim state management via `setTrim()` |
| Task 4.2 (ImageCropper) | Parallel | Can develop independently |
| Task 4.3 (ImageRotator) | Parallel | Can develop independently |

### Parallelization

- VideoTrimmer (4.4) can be developed in parallel with ImageCropper (4.2) and ImageRotator (4.3)
- All three editor components depend on useMediaEditor hook (4.1)
- MediaEditorStep (4.5) depends on all three editor components

### Technical Decision from Implementation Plan

From the plan (line 798):
> "Video trimming V1: Marker-only (no encode) - Avoids 25MB WASM payload; parent can use FFmpeg server-side"

---

## 3. Technical Approach

### 3.1 Component Architecture

The VideoTrimmer component will:
1. Receive a video source (Blob, File, or URL)
2. Display the video using native HTML5 `<video>` element
3. Provide a custom timeline/scrubber with draggable trim markers
4. Show visual preview of the selected region (highlighted section on timeline)
5. Play video constrained to the trimmed region when initiated
6. Store trim metadata (start/end timestamps) without processing video
7. Integrate with useMediaEditor hook for non-destructive state management

### 3.2 Trim State Model

```typescript
interface TrimDescriptor {
  /** Start point of trim in seconds */
  startTime: number;

  /** End point of trim in seconds */
  endTime: number;

  /** Original video duration for reference */
  originalDuration: number;
}

// Validation rules:
// - startTime >= 0
// - endTime > startTime
// - endTime <= originalDuration
// - (endTime - startTime) >= 1 second (minimum trim duration)
```

### 3.3 Video Playback Strategy

**Constrained Playback:**
- When user clicks play, video starts at `startMarker` position
- Video playback stops automatically when reaching `endMarker`
- User can scrub outside trim region for marker adjustment
- Timeline clearly shows which portion will be retained

**Implementation Pattern:**
```typescript
// Constrain playback to trim region
useEffect(() => {
  if (!videoRef.current) return;

  const video = videoRef.current;

  const handleTimeUpdate = () => {
    if (video.currentTime >= endMarker) {
      video.pause();
      video.currentTime = startMarker;
    }
  };

  video.addEventListener('timeupdate', handleTimeUpdate);
  return () => video.removeEventListener('timeupdate', handleTimeUpdate);
}, [startMarker, endMarker]);
```

### 3.4 Timeline/Scrubber Implementation

**Custom Timeline Approach:**
- Use a div-based timeline with percentage positioning
- Two draggable marker handles (start/end)
- Highlighted region between markers
- Click-to-seek functionality on the timeline
- Touch-friendly handles (min 44x44px touch targets)

```tsx
<div className="relative h-12 bg-gray-200 rounded">
  {/* Selected trim region highlight */}
  <div
    className="absolute h-full bg-blue-200"
    style={{
      left: `${(startMarker / duration) * 100}%`,
      width: `${((endMarker - startMarker) / duration) * 100}%`
    }}
  />

  {/* Start marker */}
  <div
    className="absolute w-6 h-full bg-blue-500 cursor-ew-resize"
    style={{ left: `${(startMarker / duration) * 100}%` }}
    onMouseDown={handleStartMarkerDrag}
    onTouchStart={handleStartMarkerDrag}
  />

  {/* End marker */}
  <div
    className="absolute w-6 h-full bg-blue-500 cursor-ew-resize"
    style={{ left: `${(endMarker / duration) * 100}%` }}
    onMouseDown={handleEndMarkerDrag}
    onTouchStart={handleEndMarkerDrag}
  />

  {/* Current playhead position */}
  <div
    className="absolute w-1 h-full bg-red-500"
    style={{ left: `${(currentTime / duration) * 100}%` }}
  />
</div>
```

---

## 4. Props Interface

```typescript
/**
 * Props for the VideoTrimmer component
 */
export interface VideoTrimmerProps {
  /** Source video as Blob, File, or object URL string */
  videoSrc: string | Blob | File;

  /** Initial trim descriptor (optional) */
  initialTrim?: TrimDescriptor;

  /** Called when user confirms the trim selection */
  onTrimComplete: (trimDescriptor: TrimDescriptor) => void;

  /** Called when user cancels trimming */
  onCancel: () => void;

  /** Minimum allowed trim duration in seconds (default: 1) */
  minTrimDuration?: number;

  /** Optional CSS class for the container */
  className?: string;

  /** Show debug information (timestamps, etc.) */
  debug?: boolean;
}

/**
 * Trim descriptor containing marker positions
 */
export interface TrimDescriptor {
  startTime: number;
  endTime: number;
  originalDuration: number;
}
```

---

## 5. Component Structure

```
src/components/ItemCapture/editors/
├── VideoTrimmer.tsx          # Main component
├── VideoTrimmer.types.ts     # TypeScript interfaces (optional, can inline)
└── trimUtils.ts              # Utility functions (validation, formatting)
```

### Internal State

```typescript
interface VideoTrimmerState {
  /** Video duration in seconds (from metadata) */
  duration: number | null;

  /** Current playback position in seconds */
  currentTime: number;

  /** Start marker position in seconds */
  startMarker: number;

  /** End marker position in seconds */
  endMarker: number;

  /** Whether video is currently playing */
  isPlaying: boolean;

  /** Whether video metadata has loaded */
  isLoaded: boolean;

  /** Whether a marker is being dragged */
  isDragging: 'start' | 'end' | null;

  /** Error state */
  error: string | null;

  /** Object URL for the source video (if created from Blob/File) */
  videoUrl: string | null;
}
```

---

## 6. User Interaction Flow

```
1. Component mounts with videoSrc
   └── Create object URL if Blob/File
   └── Load video metadata (duration, dimensions)
   └── Initialize markers: start = 0, end = duration

2. Video metadata loads
   └── Set duration from video.duration
   └── If initialTrim provided, set markers accordingly
   └── Enable controls

3. User drags START marker
   └── Update startMarker in real-time
   └── Ensure startMarker < endMarker (minimum gap of 1 second)
   └── Snap to valid position if dragged past end marker
   └── Update highlighted region

4. User drags END marker
   └── Update endMarker in real-time
   └── Ensure endMarker > startMarker (minimum gap of 1 second)
   └── Snap to valid position if dragged before start marker
   └── Update highlighted region

5. User clicks PLAY
   └── Seek video to startMarker position
   └── Begin playback
   └── Monitor currentTime
   └── Auto-pause when reaching endMarker

6. User clicks timeline (outside markers)
   └── Seek video to clicked position
   └── Update currentTime display

7a. User clicks "Apply" / "Confirm"
    └── Validate trim selection
    └── Create TrimDescriptor with startTime, endTime, originalDuration
    └── Call onTrimComplete(trimDescriptor)

7b. User clicks "Cancel"
    └── Revoke any created object URLs
    └── Call onCancel()
```

---

## 7. UI Layout

```
+----------------------------------------------------------+
|                                                          |
|  +----------------------------------------------------+  |
|  |                                                    |  |
|  |                                                    |  |
|  |              [Video Player Preview]                |  |
|  |                                                    |  |
|  |                                                    |  |
|  +----------------------------------------------------+  |
|                                                          |
|  +----------------------------------------------------+  |
|  |  [S]═══════════════[highlighted]═══════════════[E]  |  |
|  |    ▲                                            ▲   |  |
|  |  Start                                        End   |  |
|  +----------------------------------------------------+  |
|              Timeline with Trim Markers                  |
|                                                          |
|  Duration: 00:45 / 02:15   Selection: 00:45 → 01:30     |
|                                                          |
|         [◀◀]  [▶ Play]  [▶▶]                            |
|                                                          |
|            [Cancel]              [Apply Trim]            |
|                                                          |
+----------------------------------------------------------+
```

### Key UI Elements

| Element | Description |
|---------|-------------|
| Video Preview | Native HTML5 video player showing full video |
| Timeline Bar | Horizontal bar representing full video duration |
| Start Marker (S) | Draggable handle at start of trim region |
| End Marker (E) | Draggable handle at end of trim region |
| Highlighted Region | Shaded/colored area between markers showing what will be kept |
| Playhead | Thin line showing current playback position |
| Duration Display | Shows trimmed selection length vs. total duration |
| Playback Controls | Play/Pause, skip to start marker, skip to end marker |
| Action Buttons | Cancel (discard), Apply Trim (confirm) |

### Button Specifications

| Button | Icon | Size | Action |
|--------|------|------|--------|
| Play/Pause | `Play` / `Pause` (Lucide) | 48x48px min | Toggle playback |
| Skip to Start | `SkipBack` (Lucide) | 44x44px min | Seek to start marker |
| Skip to End | `SkipForward` (Lucide) | 44x44px min | Seek to end marker |
| Cancel | Text | Standard button | Cancel and revert |
| Apply Trim | Text | Primary button | Confirm trim selection |

---

## 8. Integration with useMediaEditor Hook

The VideoTrimmer integrates with the useMediaEditor hook for non-destructive editing:

```typescript
// In MediaEditorStep or parent component
const {
  getEditState,
  setTrim,
  confirmEdits,
  cancelEdits,
  hasPendingEdits
} = useMediaEditor();

// Get current edit state for the video
const editState = getEditState(mediaId);

// When trim markers change
const handleTrimChange = (trim: TrimDescriptor) => {
  setTrim(mediaId, trim);
};

// When user confirms
const handleConfirm = async () => {
  const result = await confirmEdits(mediaId);
  // result includes trim metadata but NO re-encoded video
  // Actual video trimming happens server-side at upload time
};
```

### Hook Integration Pattern

```tsx
// VideoTrimmer receives callbacks, not hook directly
// This keeps the component reusable and testable

<VideoTrimmer
  videoSrc={editState.previewUrl || originalVideoUrl}
  initialTrim={editState.trim}
  onTrimComplete={(trimDescriptor) => {
    setTrim(mediaId, trimDescriptor);
    // Navigate to next step or confirm
  }}
  onCancel={() => cancelEdits(mediaId)}
/>
```

### Trim Metadata Storage

When trim is confirmed, the metadata is stored in `MediaMetadata.edits`:

```typescript
interface MediaMetadata {
  // ... other fields
  edits?: {
    cropped?: boolean;
    rotated?: number;
    trimStart?: number;   // ← Start marker timestamp
    trimEnd?: number;     // ← End marker timestamp
  };
}
```

This metadata is then sent to the server during upload, where actual video processing occurs.

---

## 9. Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|---------------------|----------------|
| Video player displays the full video with standard playback controls | Native HTML5 `<video>` element with play/pause, seek functionality |
| Timeline scrubber allows users to drag and navigate to any point | Custom timeline div with click-to-seek and draggable playhead |
| Two draggable markers appear representing start and end points | Two absolutely positioned handles with drag event handlers |
| Timeline visually highlights the region between markers | Colored div between markers using percentage positioning |
| Playing video starts from start marker and stops at end marker | `timeupdate` event listener constrains playback range |
| Duration display shows trimmed selection length and total length | Formatted time display: "Selection: 00:45 / Total: 02:15" |
| Markers can be repositioned with smooth visual feedback | CSS transitions on marker position, real-time state updates |
| Markers cannot be dragged past each other | Validation in drag handlers, minimum 1-second gap |
| Trim positions saved as timestamps to application state | `TrimDescriptor` object stored via `setTrim()` in useMediaEditor |
| No actual video encoding occurs in the browser | V1 stores metadata only; server processes actual trimming |
| Trim instructions packaged with video for server processing | Metadata included in `MediaItem.metadata.edits` on upload |
| Integrates with non-destructive editing state management | Works with useMediaEditor hook callbacks |

---

## 10. Error Handling

| Error Scenario | Handling |
|----------------|----------|
| Video fails to load | Display error message with retry option |
| Video format not supported | Show browser compatibility message |
| Duration cannot be determined | Display error, disable trim controls |
| Invalid trim selection (start >= end) | Prevent confirmation, show validation message |
| Trim duration too short (< 1 second) | Prevent confirmation, show minimum duration message |
| Object URL creation fails | Show memory error, suggest closing other tabs |

### Error Display Pattern

```tsx
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
    <p className="text-sm font-medium">Unable to load video</p>
    <p className="text-sm">{error}</p>
    <button
      onClick={retryLoad}
      className="mt-2 text-sm text-red-600 underline"
    >
      Try again
    </button>
  </div>
)}
```

---

## 11. Performance Considerations

1. **Memory Management:**
   - Revoke object URLs on unmount
   - Pause video when component unmounts
   - Clean up event listeners properly

2. **Video Loading:**
   - Use `preload="metadata"` to load only what's needed initially
   - Show loading indicator while metadata loads
   - Handle slow connections gracefully

3. **Drag Performance:**
   - Use `requestAnimationFrame` for smooth marker updates during drag
   - Debounce state updates to parent components
   - Use CSS transforms for marker positioning (GPU accelerated)

4. **Touch Interactions:**
   - Prevent default touch behaviors that conflict with dragging
   - Use touch-action CSS to control gestures
   - Test on actual mobile devices

### Cleanup Pattern

```typescript
useEffect(() => {
  const video = videoRef.current;

  return () => {
    // Pause and unload video
    if (video) {
      video.pause();
      video.src = '';
      video.load();
    }

    // Revoke object URL if created
    if (videoUrl && videoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(videoUrl);
    }
  };
}, [videoUrl]);
```

---

## 12. Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| Keyboard navigation | Arrow keys to move markers, Space to play/pause |
| Screen reader support | `aria-label` on markers and controls describing current position |
| Focus management | Focus trap within editor, return focus on close |
| Motion preferences | Video playback controls always available |
| Color contrast | Markers and highlighted region have sufficient contrast |

### Keyboard Controls

| Key | Action |
|-----|--------|
| Space | Play/Pause video |
| Left Arrow | Move active marker backward by 1 second |
| Right Arrow | Move active marker forward by 1 second |
| Shift + Left/Right | Move marker by 5 seconds |
| Tab | Navigate between controls |
| Enter | Confirm/apply current action |
| Escape | Cancel editing |

### ARIA Labels

```tsx
<div
  role="slider"
  aria-label="Start trim point"
  aria-valuemin={0}
  aria-valuemax={duration}
  aria-valuenow={startMarker}
  aria-valuetext={formatTime(startMarker)}
  tabIndex={0}
  onKeyDown={handleStartMarkerKeyboard}
/>
```

---

## 13. Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/editors/VideoTrimmer.tsx` | Main VideoTrimmer component |
| `src/components/ItemCapture/editors/trimUtils.ts` | Time formatting and validation utilities |

### Files to MODIFY

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemCapture/index.ts` | Add VideoTrimmer export |
| `src/components/ItemCapture/ItemCapture.types.ts` | Add TrimDescriptor type if not present |
| `src/components/ItemCapture/components/steps/MediaEditorStep.tsx` | Integrate VideoTrimmer (when 4.5 is implemented) |

### Files to REFERENCE (read-only patterns)

| File Path | Pattern Reference |
|-----------|-------------------|
| `src/components/ItemCapture/editors/ImageCropper.tsx` | Editor component structure and props pattern |
| `src/components/ItemCapture/editors/ImageRotator.tsx` | Animation and state patterns |
| `src/components/ItemCapture/utils/pdfThumbnailGenerator.ts` | Canvas/Blob utility patterns |
| `src/components/ItemCapture/hooks/useMediaEditor.ts` | Hook integration patterns |
| `src/lib/utils.ts` | `cn()` utility for class merging |

### Dependencies Required

| Dependency | Version | Notes |
|------------|---------|-------|
| `lucide-react` | ^0.525.0 | Already installed - Play, Pause, SkipBack, SkipForward icons |
| `tailwind-merge` | ^3.3.1 | Already installed - via cn() utility |
| `clsx` | ^2.1.1 | Already installed - via cn() utility |

**No new dependencies required** - V1 uses native HTML5 video APIs only.

---

## 14. Testing Approach

### Unit Tests

1. **Trim Validation Logic:**
   - startTime >= 0 validation
   - endTime > startTime validation
   - endTime <= duration validation
   - Minimum duration (1 second) enforcement

2. **Time Formatting:**
   - Seconds to MM:SS format
   - Edge cases (0, 60, 3600)
   - Decimal handling

3. **Marker Position Calculations:**
   - Percentage to time conversion
   - Time to percentage conversion
   - Boundary snapping

### Integration Tests

1. Component renders with video source
2. Markers are draggable and update state
3. Video playback is constrained to trim region
4. Cancel callback invoked correctly
5. Complete callback receives valid TrimDescriptor

### Manual Testing Checklist

- [ ] Video loads and displays correctly
- [ ] Start marker can be dragged
- [ ] End marker can be dragged
- [ ] Markers cannot cross each other
- [ ] Highlighted region updates in real-time
- [ ] Play button starts from start marker
- [ ] Video pauses at end marker
- [ ] Duration display is accurate
- [ ] Apply button returns correct trim data
- [ ] Cancel button reverts without changes
- [ ] Works on iPhone Safari
- [ ] Works on Android Chrome
- [ ] Works on desktop browsers
- [ ] Touch targets are appropriately sized
- [ ] Keyboard navigation works
- [ ] Screen reader announces positions

### Test Video Formats

| Format | Browser Support | Test Priority |
|--------|-----------------|---------------|
| MP4 (H.264) | Universal | High |
| WebM (VP8/VP9) | Chrome, Firefox | Medium |
| MOV (QuickTime) | Safari, Chrome | Medium |

---

## 15. Implementation Order

1. Create `trimUtils.ts` with time formatting and validation functions
2. Create basic `VideoTrimmer.tsx` with static UI layout
3. Implement video loading and metadata extraction
4. Add timeline visualization with playhead
5. Implement draggable start marker
6. Implement draggable end marker
7. Add constrained playback (start to end)
8. Add duration display
9. Implement keyboard controls
10. Add error handling
11. Add accessibility attributes
12. Add memory cleanup
13. Test on target browsers/devices

---

## 16. Related Tasks

| Task ID | Title | Relationship |
|---------|-------|--------------|
| 4.1 | useMediaEditor hook | Prerequisite - provides trim state management |
| 4.2 | ImageCropper | Parallel - similar editor component |
| 4.3 | ImageRotator | Parallel - similar editor component |
| 4.5 | MediaEditorStep | Dependent - will integrate this component |

---

## 17. V1 vs V2 Comparison

### V1 (This Implementation)

| Aspect | V1 Approach |
|--------|-------------|
| Video Processing | None in browser |
| Trim Output | Metadata only (timestamps) |
| Actual Trimming | Server-side at upload time |
| Bundle Impact | ~0 KB (native APIs only) |
| Preview | Constrained playback (start to end) |

### V2 (Future)

| Aspect | V2 Approach |
|--------|-------------|
| Video Processing | Client-side with @ffmpeg/ffmpeg |
| Trim Output | Actual trimmed video blob |
| Bundle Impact | ~25 MB (WASM) |
| Preview | Actual trimmed video preview |
| Additional Features | Re-encoding, format conversion |

**V1 Rationale:** The 25MB WASM payload for FFmpeg is too large for a mobile-first application. Server-side trimming leverages existing infrastructure and keeps the client lightweight.

---

## 18. Open Questions

1. **Thumbnail Preview:** Should we extract a frame at the start marker for thumbnail display?
   - **Recommendation:** Yes, for visual feedback - use canvas to capture frame

2. **Fine-tune Controls:** Should there be +/- 0.1 second buttons for precise marker adjustment?
   - **Recommendation:** Defer to V2 unless significant user feedback

3. **Audio Waveform:** Should the timeline show an audio waveform for precise trimming?
   - **Recommendation:** Defer to V2 - adds significant complexity

4. **Multiple Trim Regions:** Should users be able to keep multiple segments (remove middle)?
   - **Recommendation:** Out of scope for V1 - single continuous region only

---

## 19. References

- [HTML Video Element - MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video)
- [HTMLMediaElement API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement)
- [Drag and Drop API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- [Touch Events - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [Lucide Icons](https://lucide.dev/icons/)
- Implementation Plan: `/docs/prd/item-capture-implementation-plan.md`
- useMediaEditor Hook Spec: `/docs/REQ-046-create-usemediaeditor-hook-overview.md`
- ImageCropper Reference: `/docs/REQ-047-implement-imagecropper-overview.md`
- ImageRotator Reference: `/docs/REQ-048-implement-imagerotator-overview.md`
