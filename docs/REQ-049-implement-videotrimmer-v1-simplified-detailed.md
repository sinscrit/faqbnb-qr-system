# REQ-049: Implement VideoTrimmer (V1 Simplified) - Detailed Task Breakdown

**Date Created:** 2025-12-31 17:30:00 PST
**Last Modified:** 2025-12-31 17:55:00 PST
**Request Reference:** docs/gen_requests.md - Request #049
**Overview Document:** docs/REQ-049-implement-videotrimmer-v1-simplified-overview.md
**Implementation Plan Reference:** docs/prd/item-capture-implementation-plan.md
**Phase:** 4 - Editing Features
**Task ID:** 4.4
**Status:** COMPLETED

---

## Implementation Summary

All tasks for REQ-049 have been completed:

### Files Created:
- `src/components/ItemCapture/editors/trimUtils.ts` - Trim utility functions
- `src/components/ItemCapture/editors/VideoTrimmer.tsx` - VideoTrimmer component
- `src/components/ItemCapture/editors/__tests__/trimUtils.test.ts` - Unit tests
- `src/components/ItemCapture/editors/__tests__/VideoTrimmer.test.tsx` - Integration tests

### Files Modified:
- `src/components/ItemCapture/index.ts` - Added VideoTrimmer exports

### Build Status: PASSED
All TypeScript compilation and Next.js build completed successfully

---

## Document Purpose

This document provides a detailed, step-by-step task breakdown for implementing the VideoTrimmer (V1 Simplified) component. Each task is designed to be ≤ 1 story point (a few hours of focused work) and includes specific verification steps.

**Key V1 Constraint:** This implementation defers actual video encoding to the server at upload time, avoiding the 25MB WASM payload of client-side FFmpeg. The component captures trim markers (timestamps) as metadata only.

---

## Prerequisites

Before starting implementation, ensure the following are complete:

| Prerequisite | Status | Notes |
|--------------|--------|-------|
| Phase 1 (Foundation) | Required | Types, state machine, wizard scaffold must exist |
| Phase 2 OR Phase 3 | Required | Need video media items to edit (VideoCaptureStep or FileUploadStep) |
| Task 4.1 (useMediaEditor) | Required | Hook manages edit state via `setTrim()` |
| lucide-react 0.525.0+ | Installed | Play, Pause, SkipBack, SkipForward icons already available |
| tailwind-merge + clsx | Installed | Via cn() utility in src/lib/utils.ts |

---

## Authorized Files for Modification

Based on the overview document, only these files may be created or modified:

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/editors/VideoTrimmer.tsx` | Main VideoTrimmer component |
| `src/components/ItemCapture/editors/trimUtils.ts` | Time formatting and validation utilities |

### Files to Modify (When MediaEditorStep exists)

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemCapture/index.ts` | Add VideoTrimmer export |
| `src/components/ItemCapture/ItemCapture.types.ts` | Add TrimDescriptor type if not present |
| `src/components/ItemCapture/components/steps/MediaEditorStep.tsx` | Integrate VideoTrimmer (when 4.5 is implemented) |

### Files to Read (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `src/lib/utils.ts` | cn() utility for class merging |
| `src/components/ItemCapture/editors/ImageCropper.tsx` | Editor component structure and props pattern |
| `src/components/ItemCapture/utils/pdfThumbnailGenerator.ts` | Canvas/Blob utility patterns |
| `src/components/ItemCapture/hooks/useMediaEditor.ts` | Hook integration patterns |

---

## Task Breakdown

### Task 1: Create Trim Utility Functions (trimUtils.ts)
**Effort:** Small (1-2 hours)
**Dependencies:** None

#### Description
Create utility functions for time formatting, trim validation, and position calculations. These utilities are extracted to keep the main component clean and enable unit testing.

#### Implementation Steps

1. Create new file `src/components/ItemCapture/editors/trimUtils.ts`
2. Add the `formatTime` function for converting seconds to MM:SS display:
   ```typescript
   /**
    * Format seconds to MM:SS or HH:MM:SS display string
    * @param seconds - Time in seconds
    * @returns Formatted time string
    */
   export function formatTime(seconds: number): string {
     if (!Number.isFinite(seconds) || seconds < 0) return '00:00';

     const hrs = Math.floor(seconds / 3600);
     const mins = Math.floor((seconds % 3600) / 60);
     const secs = Math.floor(seconds % 60);

     if (hrs > 0) {
       return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
     }
     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
   }
   ```
3. Add the `parseTime` function for converting MM:SS to seconds (for accessibility input):
   ```typescript
   /**
    * Parse MM:SS or HH:MM:SS string to seconds
    * @param timeString - Time string in MM:SS or HH:MM:SS format
    * @returns Time in seconds, or null if invalid
    */
   export function parseTime(timeString: string): number | null {
     const parts = timeString.split(':').map(Number);
     if (parts.some(isNaN)) return null;

     if (parts.length === 2) {
       const [mins, secs] = parts;
       return mins * 60 + secs;
     }
     if (parts.length === 3) {
       const [hrs, mins, secs] = parts;
       return hrs * 3600 + mins * 60 + secs;
     }
     return null;
   }
   ```
4. Add the `validateTrim` function for checking trim validity:
   ```typescript
   export interface TrimValidation {
     isValid: boolean;
     error?: string;
   }

   /**
    * Validate trim marker positions
    * @param startTime - Start marker position in seconds
    * @param endTime - End marker position in seconds
    * @param duration - Total video duration in seconds
    * @param minDuration - Minimum allowed trim duration (default: 1 second)
    * @returns Validation result with error message if invalid
    */
   export function validateTrim(
     startTime: number,
     endTime: number,
     duration: number,
     minDuration: number = 1
   ): TrimValidation {
     if (startTime < 0) {
       return { isValid: false, error: 'Start time cannot be negative' };
     }
     if (endTime > duration) {
       return { isValid: false, error: 'End time exceeds video duration' };
     }
     if (startTime >= endTime) {
       return { isValid: false, error: 'Start time must be before end time' };
     }
     if ((endTime - startTime) < minDuration) {
       return { isValid: false, error: `Minimum trim duration is ${minDuration} second${minDuration !== 1 ? 's' : ''}` };
     }
     return { isValid: true };
   }
   ```
5. Add position conversion utilities:
   ```typescript
   /**
    * Convert a time in seconds to a percentage of total duration
    */
   export function timeToPercent(time: number, duration: number): number {
     if (duration <= 0) return 0;
     return Math.min(100, Math.max(0, (time / duration) * 100));
   }

   /**
    * Convert a percentage to time in seconds
    */
   export function percentToTime(percent: number, duration: number): number {
     return Math.min(duration, Math.max(0, (percent / 100) * duration));
   }
   ```
6. Add the `clampMarkerPosition` function to enforce constraints:
   ```typescript
   /**
    * Clamp marker position to valid range while respecting minimum gap
    * @param position - Proposed position in seconds
    * @param otherMarker - Position of the other marker
    * @param isStartMarker - Whether this is the start marker
    * @param duration - Total video duration
    * @param minGap - Minimum gap between markers (default: 1 second)
    */
   export function clampMarkerPosition(
     position: number,
     otherMarker: number,
     isStartMarker: boolean,
     duration: number,
     minGap: number = 1
   ): number {
     let clamped = Math.max(0, Math.min(duration, position));

     if (isStartMarker) {
       clamped = Math.min(clamped, otherMarker - minGap);
     } else {
       clamped = Math.max(clamped, otherMarker + minGap);
     }

     return Math.max(0, Math.min(duration, clamped));
   }
   ```

#### Verification Steps
- [x] File exists at `src/components/ItemCapture/editors/trimUtils.ts`
- [x] TypeScript compilation passes with no errors (`npx tsc --noEmit`)
- [x] `formatTime(0)` returns `'00:00'`
- [x] `formatTime(65)` returns `'01:05'`
- [x] `formatTime(3661)` returns `'1:01:01'`
- [x] `parseTime('01:30')` returns `90`
- [x] `validateTrim(0, 10, 60)` returns `{ isValid: true }`
- [x] `validateTrim(10, 5, 60)` returns invalid with appropriate error
- [x] `timeToPercent(30, 60)` returns `50`
- [x] `clampMarkerPosition` prevents markers from crossing

**Implementation Notes:** All utility functions implemented and tested via unit tests in trimUtils.test.ts

---

### Task 2: Define VideoTrimmer Types and Props Interface
**Effort:** Small (1-2 hours)
**Dependencies:** Task 1

#### Description
Define all TypeScript interfaces and types for the VideoTrimmer component, including props, internal state, and the TrimDescriptor output type.

#### Implementation Steps

1. Create or open `src/components/ItemCapture/editors/VideoTrimmer.tsx`
2. Add the `TrimDescriptor` interface (or import if defined elsewhere):
   ```typescript
   /**
    * Trim descriptor containing marker positions for server-side processing
    */
   export interface TrimDescriptor {
     /** Start point of trim in seconds */
     startTime: number;
     /** End point of trim in seconds */
     endTime: number;
     /** Original video duration for reference */
     originalDuration: number;
   }
   ```
3. Add the `VideoTrimmerProps` interface:
   ```typescript
   /**
    * Props for the VideoTrimmer component
    */
   export interface VideoTrimmerProps {
     /** Source video as Blob, File, or object URL string */
     videoSrc: string | Blob | File;
     /** Initial trim descriptor (optional - for resuming edits) */
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
   ```
4. Add internal state interface:
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
     /** Which marker is being dragged */
     isDragging: 'start' | 'end' | null;
     /** Error state */
     error: string | null;
     /** Object URL for the source video (if created from Blob/File) */
     videoUrl: string | null;
   }
   ```
5. Add dragging state type for marker interaction:
   ```typescript
   type DragTarget = 'start' | 'end' | 'playhead' | null;
   ```
6. Add constants:
   ```typescript
   const DEFAULT_MIN_TRIM_DURATION = 1; // seconds
   const TIMELINE_HEIGHT = 48; // px
   const MARKER_WIDTH = 24; // px
   const TOUCH_TARGET_SIZE = 44; // px (iOS minimum)
   ```

#### Verification Steps
- [ ] TypeScript compilation passes with no errors
- [ ] `TrimDescriptor` interface is exported from the file
- [ ] `VideoTrimmerProps` interface is exported from the file
- [ ] All prop types are correctly defined with JSDoc comments
- [ ] Default values are documented in JSDoc comments
- [ ] Internal state interface covers all required fields

---

### Task 3: Implement Basic VideoTrimmer Component Structure
**Effort:** Medium (2-3 hours)
**Dependencies:** Task 2

#### Description
Create the basic component structure with video element, video source handling, and skeleton layout. This establishes the foundation for subsequent tasks.

#### Implementation Steps

1. Add client directive and imports at top of `VideoTrimmer.tsx`:
   ```typescript
   'use client';

   import { useState, useRef, useCallback, useEffect } from 'react';
   import { cn } from '@/lib/utils';
   import { formatTime, validateTrim, timeToPercent, percentToTime, clampMarkerPosition } from './trimUtils';
   ```
2. Create the main component function with props destructuring:
   ```typescript
   export default function VideoTrimmer({
     videoSrc,
     initialTrim,
     onTrimComplete,
     onCancel,
     minTrimDuration = DEFAULT_MIN_TRIM_DURATION,
     className,
     debug = false,
   }: VideoTrimmerProps) {
   ```
3. Add refs for video element and timeline container:
   ```typescript
   const videoRef = useRef<HTMLVideoElement>(null);
   const timelineRef = useRef<HTMLDivElement>(null);
   ```
4. Add state initialization:
   ```typescript
   const [duration, setDuration] = useState<number | null>(null);
   const [currentTime, setCurrentTime] = useState(0);
   const [startMarker, setStartMarker] = useState(0);
   const [endMarker, setEndMarker] = useState(0);
   const [isPlaying, setIsPlaying] = useState(false);
   const [isLoaded, setIsLoaded] = useState(false);
   const [isDragging, setIsDragging] = useState<DragTarget>(null);
   const [error, setError] = useState<string | null>(null);
   const [videoUrl, setVideoUrl] = useState<string | null>(null);
   ```
5. Implement video source URL handling effect:
   ```typescript
   useEffect(() => {
     // Handle Blob/File sources by creating object URL
     if (videoSrc instanceof Blob || videoSrc instanceof File) {
       const url = URL.createObjectURL(videoSrc);
       setVideoUrl(url);
       return () => URL.revokeObjectURL(url);
     } else {
       // String URL - use directly
       setVideoUrl(videoSrc);
     }
   }, [videoSrc]);
   ```
6. Create skeleton layout with placeholders:
   ```tsx
   return (
     <div className={cn('flex flex-col h-full', className)}>
       {/* Error display */}
       {error && (
         <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
           <p className="text-sm">{error}</p>
         </div>
       )}

       {/* Video player area */}
       <div className="relative flex-1 min-h-0 bg-black rounded-lg overflow-hidden">
         {videoUrl && (
           <video
             ref={videoRef}
             src={videoUrl}
             className="w-full h-full object-contain"
             preload="metadata"
             playsInline
           />
         )}
         {!isLoaded && (
           <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
             <div className="animate-pulse text-gray-500">Loading video...</div>
           </div>
         )}
       </div>

       {/* Timeline placeholder */}
       <div className="mt-4 h-12 bg-gray-200 rounded">
         {/* Timeline will be implemented in Task 5 */}
       </div>

       {/* Duration display placeholder */}
       <div className="mt-2 text-sm text-gray-600 text-center">
         {/* Duration display will be implemented in Task 6 */}
       </div>

       {/* Playback controls placeholder */}
       <div className="mt-4 flex justify-center gap-2">
         {/* Controls will be implemented in Task 7 */}
       </div>

       {/* Action buttons placeholder */}
       <div className="mt-4 flex justify-end gap-3">
         {/* Action buttons will be implemented in Task 10 */}
       </div>

       {/* Debug info */}
       {debug && (
         <pre className="mt-4 p-2 bg-gray-100 text-xs overflow-auto">
           {JSON.stringify({ duration, currentTime, startMarker, endMarker, isPlaying, isLoaded }, null, 2)}
         </pre>
       )}
     </div>
   );
   ```

#### Verification Steps
- [ ] Component renders without errors when given a video URL string
- [ ] Component renders without errors when given a Blob
- [ ] Component renders without errors when given a File
- [ ] Loading state shows while video metadata is loading
- [ ] Object URL is created for Blob/File sources
- [ ] Object URL is revoked when component unmounts
- [ ] Debug mode displays state JSON when enabled
- [ ] Component layout matches the UI mockup structure

---

### Task 4: Implement Video Metadata Loading and Event Handlers
**Effort:** Medium (2-3 hours)
**Dependencies:** Task 3

#### Description
Handle video metadata loading, extract duration, and set up initial marker positions. Also implement time update and playback state handlers.

#### Implementation Steps

1. Add the `handleLoadedMetadata` callback:
   ```typescript
   const handleLoadedMetadata = useCallback(() => {
     const video = videoRef.current;
     if (!video) return;

     const videoDuration = video.duration;
     if (!Number.isFinite(videoDuration) || videoDuration <= 0) {
       setError('Unable to determine video duration');
       return;
     }

     setDuration(videoDuration);
     setIsLoaded(true);
     setError(null);

     // Set initial markers
     if (initialTrim) {
       setStartMarker(initialTrim.startTime);
       setEndMarker(initialTrim.endTime);
       video.currentTime = initialTrim.startTime;
     } else {
       setStartMarker(0);
       setEndMarker(videoDuration);
       video.currentTime = 0;
     }

     setCurrentTime(video.currentTime);
   }, [initialTrim]);
   ```
2. Add the `handleTimeUpdate` callback:
   ```typescript
   const handleTimeUpdate = useCallback(() => {
     const video = videoRef.current;
     if (!video) return;

     setCurrentTime(video.currentTime);

     // Auto-pause at end marker during playback
     if (isPlaying && video.currentTime >= endMarker) {
       video.pause();
       setIsPlaying(false);
       video.currentTime = startMarker;
       setCurrentTime(startMarker);
     }
   }, [isPlaying, endMarker, startMarker]);
   ```
3. Add the `handlePlay` and `handlePause` event handlers:
   ```typescript
   const handlePlay = useCallback(() => {
     setIsPlaying(true);
   }, []);

   const handlePause = useCallback(() => {
     setIsPlaying(false);
   }, []);
   ```
4. Add error handling callback:
   ```typescript
   const handleError = useCallback(() => {
     setError('Failed to load video. Please check the file and try again.');
     setIsLoaded(false);
   }, []);
   ```
5. Update video element with event handlers:
   ```tsx
   <video
     ref={videoRef}
     src={videoUrl}
     className="w-full h-full object-contain"
     preload="metadata"
     playsInline
     onLoadedMetadata={handleLoadedMetadata}
     onTimeUpdate={handleTimeUpdate}
     onPlay={handlePlay}
     onPause={handlePause}
     onError={handleError}
   />
   ```
6. Add effect to sync playback when markers change:
   ```typescript
   useEffect(() => {
     const video = videoRef.current;
     if (!video || !isLoaded) return;

     // If current time is outside trim region, reset to start marker
     if (video.currentTime < startMarker || video.currentTime > endMarker) {
       video.currentTime = startMarker;
       setCurrentTime(startMarker);
     }
   }, [startMarker, endMarker, isLoaded]);
   ```

#### Verification Steps
- [ ] Video duration is extracted when metadata loads
- [ ] Initial markers are set to full video length by default
- [ ] Initial markers respect `initialTrim` prop when provided
- [ ] `currentTime` state updates during playback
- [ ] Video auto-pauses at end marker position
- [ ] Video resets to start marker after reaching end
- [ ] Error state is set when video fails to load
- [ ] isLoaded becomes true only after metadata successfully loads

---

### Task 5: Implement Timeline Visualization with Markers
**Effort:** Medium (2-3 hours)
**Dependencies:** Task 4

#### Description
Build the custom timeline/scrubber component with visual markers for start and end points, highlighted trim region, and current playhead position.

#### Implementation Steps

1. Create timeline container JSX replacing the placeholder:
   ```tsx
   {/* Timeline */}
   <div
     ref={timelineRef}
     className="relative mt-4 h-12 bg-gray-200 rounded cursor-pointer select-none"
     style={{ touchAction: 'none' }}
   >
     {isLoaded && duration && (
       <>
         {/* Excluded region before start (dimmed) */}
         <div
           className="absolute h-full bg-gray-400/50 rounded-l"
           style={{
             left: 0,
             width: `${timeToPercent(startMarker, duration)}%`,
           }}
         />

         {/* Selected trim region (highlighted) */}
         <div
           className="absolute h-full bg-blue-200"
           style={{
             left: `${timeToPercent(startMarker, duration)}%`,
             width: `${timeToPercent(endMarker - startMarker, duration)}%`,
           }}
         />

         {/* Excluded region after end (dimmed) */}
         <div
           className="absolute h-full bg-gray-400/50 rounded-r"
           style={{
             left: `${timeToPercent(endMarker, duration)}%`,
             width: `${100 - timeToPercent(endMarker, duration)}%`,
           }}
         />

         {/* Start marker handle */}
         <div
           className={cn(
             'absolute top-0 h-full w-6 bg-blue-500 cursor-ew-resize',
             'flex items-center justify-center',
             'rounded-l border-r-2 border-blue-700',
             isDragging === 'start' && 'bg-blue-600 scale-105',
             'hover:bg-blue-600 transition-colors'
           )}
           style={{
             left: `calc(${timeToPercent(startMarker, duration)}% - 12px)`,
             minWidth: `${TOUCH_TARGET_SIZE}px`,
           }}
           role="slider"
           aria-label="Start trim point"
           aria-valuemin={0}
           aria-valuemax={duration}
           aria-valuenow={startMarker}
           aria-valuetext={formatTime(startMarker)}
           tabIndex={0}
         >
           <span className="text-white text-xs font-bold">S</span>
         </div>

         {/* End marker handle */}
         <div
           className={cn(
             'absolute top-0 h-full w-6 bg-blue-500 cursor-ew-resize',
             'flex items-center justify-center',
             'rounded-r border-l-2 border-blue-700',
             isDragging === 'end' && 'bg-blue-600 scale-105',
             'hover:bg-blue-600 transition-colors'
           )}
           style={{
             left: `calc(${timeToPercent(endMarker, duration)}% - 12px)`,
             minWidth: `${TOUCH_TARGET_SIZE}px`,
           }}
           role="slider"
           aria-label="End trim point"
           aria-valuemin={0}
           aria-valuemax={duration}
           aria-valuenow={endMarker}
           aria-valuetext={formatTime(endMarker)}
           tabIndex={0}
         >
           <span className="text-white text-xs font-bold">E</span>
         </div>

         {/* Current playhead position */}
         <div
           className="absolute top-0 w-1 h-full bg-red-500 pointer-events-none z-10"
           style={{
             left: `${timeToPercent(currentTime, duration)}%`,
           }}
         />
       </>
     )}
   </div>
   ```
2. Add visual indicators for marker labels below timeline:
   ```tsx
   {/* Timeline labels */}
   {isLoaded && duration && (
     <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
       <span>0:00</span>
       <span>{formatTime(duration)}</span>
     </div>
   )}
   ```

#### Verification Steps
- [ ] Timeline renders with gray background
- [ ] Highlighted region (blue) appears between markers
- [ ] Dimmed regions appear outside markers
- [ ] Start marker displays "S" and is positioned correctly
- [ ] End marker displays "E" and is positioned correctly
- [ ] Playhead (red line) moves during playback
- [ ] Markers have proper ARIA attributes for accessibility
- [ ] Timeline has touch-action: none to prevent scroll conflicts
- [ ] Visual feedback changes when markers are being dragged

---

### Task 6: Implement Draggable Marker Interactions
**Effort:** Medium (2-3 hours)
**Dependencies:** Task 5

#### Description
Add mouse and touch event handling for dragging the start and end markers along the timeline.

#### Implementation Steps

1. Create helper function to calculate time from pointer position:
   ```typescript
   const getTimeFromPointerPosition = useCallback((clientX: number): number => {
     const timeline = timelineRef.current;
     if (!timeline || !duration) return 0;

     const rect = timeline.getBoundingClientRect();
     const x = clientX - rect.left;
     const percent = (x / rect.width) * 100;
     return percentToTime(percent, duration);
   }, [duration]);
   ```
2. Create drag start handler for markers:
   ```typescript
   const handleMarkerDragStart = useCallback((marker: 'start' | 'end') => (
     e: React.MouseEvent | React.TouchEvent
   ) => {
     e.preventDefault();
     e.stopPropagation();
     setIsDragging(marker);

     // Pause video during drag
     if (videoRef.current && isPlaying) {
       videoRef.current.pause();
     }
   }, [isPlaying]);
   ```
3. Create drag move handler:
   ```typescript
   const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
     if (!isDragging || !duration) return;

     const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
     const time = getTimeFromPointerPosition(clientX);

     if (isDragging === 'start') {
       const clamped = clampMarkerPosition(time, endMarker, true, duration, minTrimDuration);
       setStartMarker(clamped);
       // Update video position to show marker location
       if (videoRef.current) {
         videoRef.current.currentTime = clamped;
       }
     } else if (isDragging === 'end') {
       const clamped = clampMarkerPosition(time, startMarker, false, duration, minTrimDuration);
       setEndMarker(clamped);
       // Update video position to show marker location
       if (videoRef.current) {
         videoRef.current.currentTime = clamped;
       }
     }
   }, [isDragging, duration, endMarker, startMarker, minTrimDuration, getTimeFromPointerPosition]);
   ```
4. Create drag end handler:
   ```typescript
   const handleDragEnd = useCallback(() => {
     setIsDragging(null);
   }, []);
   ```
5. Add effect to attach/detach global listeners during drag:
   ```typescript
   useEffect(() => {
     if (!isDragging) return;

     window.addEventListener('mousemove', handleDragMove);
     window.addEventListener('mouseup', handleDragEnd);
     window.addEventListener('touchmove', handleDragMove, { passive: false });
     window.addEventListener('touchend', handleDragEnd);

     return () => {
       window.removeEventListener('mousemove', handleDragMove);
       window.removeEventListener('mouseup', handleDragEnd);
       window.removeEventListener('touchmove', handleDragMove);
       window.removeEventListener('touchend', handleDragEnd);
     };
   }, [isDragging, handleDragMove, handleDragEnd]);
   ```
6. Add event handlers to marker elements:
   ```tsx
   {/* Start marker handle - updated */}
   <div
     // ... existing className and style ...
     onMouseDown={handleMarkerDragStart('start')}
     onTouchStart={handleMarkerDragStart('start')}
   >
   ```
7. Add timeline click-to-seek functionality:
   ```typescript
   const handleTimelineClick = useCallback((e: React.MouseEvent) => {
     if (isDragging) return;

     const time = getTimeFromPointerPosition(e.clientX);
     if (videoRef.current) {
       videoRef.current.currentTime = time;
       setCurrentTime(time);
     }
   }, [isDragging, getTimeFromPointerPosition]);
   ```
8. Add click handler to timeline container:
   ```tsx
   <div
     ref={timelineRef}
     className="..."
     onClick={handleTimelineClick}
   >
   ```

#### Verification Steps
- [ ] Start marker can be dragged left and right
- [ ] End marker can be dragged left and right
- [ ] Markers cannot cross each other (minimum 1 second gap maintained)
- [ ] Marker positions update in real-time during drag
- [ ] Video preview updates to show marker position during drag
- [ ] Video pauses during marker drag
- [ ] Drag works with both mouse and touch events
- [ ] Clicking timeline seeks video to that position
- [ ] Marker cannot be dragged outside timeline bounds

---

### Task 7: Implement Playback Controls
**Effort:** Small (1-2 hours)
**Dependencies:** Task 4

#### Description
Add playback control buttons (play/pause, skip to start, skip to end) with constrained playback behavior within the trim region.

#### Implementation Steps

1. Add Lucide icon imports:
   ```typescript
   import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
   ```
2. Create play/pause toggle handler:
   ```typescript
   const handlePlayPause = useCallback(() => {
     const video = videoRef.current;
     if (!video) return;

     if (isPlaying) {
       video.pause();
     } else {
       // Start from beginning of trim region if at end or before start
       if (video.currentTime < startMarker || video.currentTime >= endMarker) {
         video.currentTime = startMarker;
       }
       video.play().catch((err) => {
         console.error('Playback failed:', err);
         setError('Unable to play video. Please try again.');
       });
     }
   }, [isPlaying, startMarker, endMarker]);
   ```
3. Create skip to start handler:
   ```typescript
   const handleSkipToStart = useCallback(() => {
     const video = videoRef.current;
     if (!video) return;

     video.currentTime = startMarker;
     setCurrentTime(startMarker);
     if (isPlaying) {
       video.pause();
       setIsPlaying(false);
     }
   }, [startMarker, isPlaying]);
   ```
4. Create skip to end handler:
   ```typescript
   const handleSkipToEnd = useCallback(() => {
     const video = videoRef.current;
     if (!video) return;

     video.currentTime = endMarker;
     setCurrentTime(endMarker);
     if (isPlaying) {
       video.pause();
       setIsPlaying(false);
     }
   }, [endMarker, isPlaying]);
   ```
5. Replace playback controls placeholder with actual controls:
   ```tsx
   {/* Playback controls */}
   <div className="mt-4 flex justify-center items-center gap-2">
     <button
       onClick={handleSkipToStart}
       disabled={!isLoaded}
       className={cn(
         'p-3 rounded-full',
         'bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed',
         'transition-colors'
       )}
       style={{ minWidth: TOUCH_TARGET_SIZE, minHeight: TOUCH_TARGET_SIZE }}
       aria-label="Skip to start marker"
     >
       <SkipBack className="w-5 h-5" />
     </button>

     <button
       onClick={handlePlayPause}
       disabled={!isLoaded}
       className={cn(
         'p-4 rounded-full',
         'bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed',
         'transition-colors'
       )}
       style={{ minWidth: TOUCH_TARGET_SIZE + 8, minHeight: TOUCH_TARGET_SIZE + 8 }}
       aria-label={isPlaying ? 'Pause' : 'Play trimmed region'}
     >
       {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
     </button>

     <button
       onClick={handleSkipToEnd}
       disabled={!isLoaded}
       className={cn(
         'p-3 rounded-full',
         'bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed',
         'transition-colors'
       )}
       style={{ minWidth: TOUCH_TARGET_SIZE, minHeight: TOUCH_TARGET_SIZE }}
       aria-label="Skip to end marker"
     >
       <SkipForward className="w-5 h-5" />
     </button>
   </div>
   ```

#### Verification Steps
- [ ] Play button starts video from start marker position
- [ ] Video auto-pauses when reaching end marker
- [ ] Video resets to start marker after reaching end
- [ ] Pause button stops playback
- [ ] Skip to Start button seeks to start marker and pauses
- [ ] Skip to End button seeks to end marker and pauses
- [ ] All buttons have minimum 44px touch targets
- [ ] Buttons are disabled when video is not loaded
- [ ] ARIA labels describe button actions

---

### Task 8: Implement Duration Display
**Effort:** Small (1-2 hours)
**Dependencies:** Task 4, Task 5

#### Description
Add duration display showing the trimmed selection length versus total video duration, with current playback position.

#### Implementation Steps

1. Replace duration display placeholder:
   ```tsx
   {/* Duration display */}
   {isLoaded && duration && (
     <div className="mt-3 text-center">
       <div className="text-sm text-gray-700">
         <span className="font-medium">Selection: </span>
         <span className="text-blue-600 font-mono">
           {formatTime(startMarker)} → {formatTime(endMarker)}
         </span>
         <span className="mx-2 text-gray-400">|</span>
         <span className="font-medium">Duration: </span>
         <span className="text-blue-600 font-mono">
           {formatTime(endMarker - startMarker)}
         </span>
         <span className="text-gray-500"> / {formatTime(duration)}</span>
       </div>

       {/* Current playhead position */}
       <div className="text-xs text-gray-500 mt-1">
         Current: <span className="font-mono">{formatTime(currentTime)}</span>
       </div>
     </div>
   )}
   ```
2. Add visual indicator for trim savings (optional enhancement):
   ```tsx
   {/* Trim savings indicator */}
   {duration && (endMarker - startMarker) < duration && (
     <div className="text-xs text-green-600 mt-1">
       Trimming {formatTime(duration - (endMarker - startMarker))} ({Math.round((1 - (endMarker - startMarker) / duration) * 100)}% reduction)
     </div>
   )}
   ```

#### Verification Steps
- [ ] Selection range displays as "start → end" format
- [ ] Duration displays the trim length correctly
- [ ] Total duration shows original video length
- [ ] Current playhead position updates during playback
- [ ] Times are formatted as MM:SS or HH:MM:SS as appropriate
- [ ] Trim savings shows percentage when trimming
- [ ] Display only shows when video is loaded

---

### Task 9: Implement Keyboard Controls for Accessibility
**Effort:** Small (1-2 hours)
**Dependencies:** Task 6, Task 7

#### Description
Add keyboard navigation support for marker adjustment and playback control to ensure accessibility compliance.

#### Implementation Steps

1. Create keyboard handler for markers:
   ```typescript
   const handleMarkerKeyDown = useCallback((marker: 'start' | 'end') => (
     e: React.KeyboardEvent
   ) => {
     if (!duration) return;

     const step = e.shiftKey ? 5 : 1; // 5 seconds with shift, 1 second without
     const currentValue = marker === 'start' ? startMarker : endMarker;

     switch (e.key) {
       case 'ArrowLeft':
       case 'ArrowDown':
         e.preventDefault();
         const newValueLeft = currentValue - step;
         if (marker === 'start') {
           setStartMarker(clampMarkerPosition(newValueLeft, endMarker, true, duration, minTrimDuration));
         } else {
           setEndMarker(clampMarkerPosition(newValueLeft, startMarker, false, duration, minTrimDuration));
         }
         break;

       case 'ArrowRight':
       case 'ArrowUp':
         e.preventDefault();
         const newValueRight = currentValue + step;
         if (marker === 'start') {
           setStartMarker(clampMarkerPosition(newValueRight, endMarker, true, duration, minTrimDuration));
         } else {
           setEndMarker(clampMarkerPosition(newValueRight, startMarker, false, duration, minTrimDuration));
         }
         break;

       case 'Home':
         e.preventDefault();
         if (marker === 'start') {
           setStartMarker(0);
         }
         break;

       case 'End':
         e.preventDefault();
         if (marker === 'end') {
           setEndMarker(duration);
         }
         break;
     }
   }, [duration, startMarker, endMarker, minTrimDuration]);
   ```
2. Add global keyboard handler for spacebar play/pause:
   ```typescript
   useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
       // Only handle if not in an input field
       if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
         return;
       }

       if (e.key === ' ' || e.key === 'Spacebar') {
         e.preventDefault();
         handlePlayPause();
       }

       if (e.key === 'Escape') {
         onCancel();
       }
     };

     window.addEventListener('keydown', handleKeyDown);
     return () => window.removeEventListener('keydown', handleKeyDown);
   }, [handlePlayPause, onCancel]);
   ```
3. Add onKeyDown handler to marker elements:
   ```tsx
   <div
     // Start marker
     onKeyDown={handleMarkerKeyDown('start')}
   >

   <div
     // End marker
     onKeyDown={handleMarkerKeyDown('end')}
   >
   ```

#### Verification Steps
- [ ] Arrow keys move focused marker by 1 second
- [ ] Shift + Arrow keys move marker by 5 seconds
- [ ] Home key resets start marker to 0
- [ ] End key sets end marker to video duration
- [ ] Space bar toggles play/pause
- [ ] Escape key triggers cancel callback
- [ ] Keyboard controls respect minimum gap constraint
- [ ] Focus outline is visible when markers are focused

---

### Task 10: Implement Apply and Cancel Actions
**Effort:** Small (1-2 hours)
**Dependencies:** Task 4, Task 1

#### Description
Implement the Apply Trim and Cancel buttons that complete or abort the trimming workflow.

#### Implementation Steps

1. Create the apply trim handler:
   ```typescript
   const handleApplyTrim = useCallback(() => {
     if (!duration) return;

     const validation = validateTrim(startMarker, endMarker, duration, minTrimDuration);
     if (!validation.isValid) {
       setError(validation.error || 'Invalid trim selection');
       return;
     }

     const trimDescriptor: TrimDescriptor = {
       startTime: startMarker,
       endTime: endMarker,
       originalDuration: duration,
     };

     onTrimComplete(trimDescriptor);
   }, [duration, startMarker, endMarker, minTrimDuration, onTrimComplete]);
   ```
2. Create the cancel handler with cleanup:
   ```typescript
   const handleCancel = useCallback(() => {
     // Pause video
     if (videoRef.current) {
       videoRef.current.pause();
     }
     onCancel();
   }, [onCancel]);
   ```
3. Replace action buttons placeholder:
   ```tsx
   {/* Action buttons */}
   <div className="mt-4 flex flex-col sm:flex-row justify-end gap-3">
     <button
       onClick={handleCancel}
       className={cn(
         'px-6 py-3 rounded-lg',
         'bg-gray-200 hover:bg-gray-300 text-gray-700',
         'transition-colors',
         'order-2 sm:order-1'
       )}
       style={{ minHeight: TOUCH_TARGET_SIZE }}
     >
       Cancel
     </button>

     <button
       onClick={handleApplyTrim}
       disabled={!isLoaded || !!error}
       className={cn(
         'px-6 py-3 rounded-lg',
         'bg-blue-500 hover:bg-blue-600 text-white font-medium',
         'disabled:opacity-50 disabled:cursor-not-allowed',
         'transition-colors',
         'order-1 sm:order-2'
       )}
       style={{ minHeight: TOUCH_TARGET_SIZE }}
     >
       Apply Trim
     </button>
   </div>
   ```
4. Add error clearing when user makes changes:
   ```typescript
   // Add to marker update handlers
   useEffect(() => {
     // Clear error when user adjusts markers
     if (error) {
       setError(null);
     }
   }, [startMarker, endMarker]);
   ```

#### Verification Steps
- [ ] Apply Trim validates selection before completing
- [ ] Apply Trim calls onTrimComplete with correct TrimDescriptor
- [ ] Cancel button calls onCancel callback
- [ ] Cancel button pauses video playback
- [ ] Apply Trim is disabled when video not loaded
- [ ] Apply Trim is disabled when there's an error
- [ ] Buttons have minimum 44px touch targets
- [ ] Error is cleared when user adjusts markers
- [ ] Validation error displays when trim is invalid

---

### Task 11: Implement Memory Cleanup and Resource Management
**Effort:** Small (1-2 hours)
**Dependencies:** Task 3, Task 4

#### Description
Ensure proper cleanup of Object URLs and video resources when the component unmounts or when the video source changes.

#### Implementation Steps

1. Create comprehensive cleanup effect:
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
     };
   }, []);
   ```
2. Object URL cleanup is already handled in the videoSrc effect from Task 3
3. Add cleanup when video source changes:
   ```typescript
   useEffect(() => {
     // Reset state when video source changes
     setDuration(null);
     setCurrentTime(0);
     setStartMarker(0);
     setEndMarker(0);
     setIsPlaying(false);
     setIsLoaded(false);
     setError(null);
   }, [videoSrc]);
   ```
4. Add comment documentation explaining cleanup importance:
   ```typescript
   /**
    * IMPORTANT: Memory management notes
    *
    * 1. Object URLs created from Blob/File sources MUST be revoked
    *    to prevent memory leaks. This is handled in the videoSrc useEffect.
    *
    * 2. Video element must be properly unloaded on unmount to release
    *    media resources. The video.src = ''; video.load() pattern
    *    ensures the browser releases the video data.
    *
    * 3. When videoSrc prop changes, all state must be reset to prevent
    *    stale data from the previous video.
    */
   ```

#### Verification Steps
- [ ] Object URL is revoked when component unmounts
- [ ] Object URL is revoked when videoSrc changes
- [ ] Video element is paused and unloaded on unmount
- [ ] State is reset when videoSrc prop changes
- [ ] No memory leak warnings in browser DevTools
- [ ] Chrome DevTools Memory tab shows no growing blob references
- [ ] Component can be mounted/unmounted repeatedly without issues

---

### Task 12: Add Responsive Layout and Mobile Optimization
**Effort:** Medium (2-3 hours)
**Dependencies:** Task 5, Task 7, Task 8, Task 10

#### Description
Optimize the component layout for various viewport sizes from mobile (320px) to desktop.

#### Implementation Steps

1. Update main container with responsive classes:
   ```tsx
   <div className={cn(
     'flex flex-col h-full',
     'px-2 sm:px-4',
     className
   )}>
   ```
2. Constrain video container for different viewports:
   ```tsx
   <div className="relative flex-1 min-h-0 max-h-[45vh] sm:max-h-[50vh] lg:max-h-[55vh] bg-black rounded-lg overflow-hidden">
   ```
3. Make timeline responsive:
   ```tsx
   <div
     ref={timelineRef}
     className={cn(
       'relative mt-4 bg-gray-200 rounded cursor-pointer select-none',
       'h-10 sm:h-12' // Slightly shorter on mobile
     )}
   >
   ```
4. Make playback controls responsive:
   ```tsx
   <div className="mt-3 sm:mt-4 flex justify-center items-center gap-1 sm:gap-2">
   ```
5. Make duration display responsive:
   ```tsx
   <div className="mt-2 sm:mt-3 text-center">
     <div className="text-xs sm:text-sm text-gray-700">
       {/* Show abbreviated format on mobile */}
       <span className="hidden sm:inline font-medium">Selection: </span>
       <span className="text-blue-600 font-mono">
         {formatTime(startMarker)} → {formatTime(endMarker)}
       </span>
       <span className="mx-1 sm:mx-2 text-gray-400">|</span>
       <span className="hidden sm:inline font-medium">Duration: </span>
       <span className="text-blue-600 font-mono">
         {formatTime(endMarker - startMarker)}
       </span>
     </div>
   </div>
   ```
6. Update action buttons for full-width on mobile:
   ```tsx
   <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
     <button
       onClick={handleCancel}
       className={cn(
         'px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg',
         'w-full sm:w-auto', // Full width on mobile
         // ... rest of classes
       )}
     >
   ```
7. Test touch targets are adequate on mobile:
   - All interactive elements should be at least 44x44px
   - Add padding if needed to increase touch target area

#### Verification Steps
- [ ] Component renders without horizontal overflow at 320px width
- [ ] All buttons remain tappable at smallest viewport
- [ ] Video container doesn't exceed 45vh on mobile
- [ ] Timeline height adjusts for mobile/desktop
- [ ] Duration display text size adjusts for viewport
- [ ] Action buttons are full-width on mobile
- [ ] Layout adapts smoothly between breakpoints
- [ ] No content is cut off at any viewport size

---

### Task 13: Add Loading States and Error UI
**Effort:** Small (1-2 hours)
**Dependencies:** Task 3, Task 10

#### Description
Enhance the UI with comprehensive loading states and user-friendly error displays.

#### Implementation Steps

1. Add loading skeleton for initial video load:
   ```tsx
   {!isLoaded && (
     <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
       <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-3" />
       <span className="text-sm text-gray-600">Loading video...</span>
     </div>
   )}
   ```
2. Update error display with retry option:
   ```tsx
   {error && (
     <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
       <p className="text-sm font-medium">Error</p>
       <p className="text-sm mt-1">{error}</p>
       <button
         onClick={() => {
           setError(null);
           // Reset video element
           if (videoRef.current && videoUrl) {
             videoRef.current.load();
           }
         }}
         className="mt-2 text-sm text-red-600 underline hover:text-red-800"
       >
         Try again
       </button>
     </div>
   )}
   ```
3. Add visual state when dragging markers:
   ```tsx
   {/* Add overlay during drag to prevent accidental clicks */}
   {isDragging && (
     <div className="fixed inset-0 z-50 cursor-ew-resize" />
   )}
   ```
4. Disable controls during loading:
   ```tsx
   {/* Add loading overlay for action buttons area when processing */}
   ```

#### Verification Steps
- [ ] Loading spinner appears while video metadata loads
- [ ] Loading text describes what's happening
- [ ] Error message displays with clear description
- [ ] Retry button clears error and reloads video
- [ ] Overlay prevents accidental clicks during marker drag
- [ ] Controls are disabled while loading
- [ ] Error styling is clearly visible (red background)

---

### Task 14: Unit Tests for Trim Utilities
**Effort:** Medium (2-3 hours)
**Dependencies:** Task 1

#### Description
Write unit tests for the trimUtils.ts utility functions to ensure correct behavior.

#### Implementation Steps

1. Create test file `src/components/ItemCapture/editors/__tests__/trimUtils.test.ts`
2. Test `formatTime` function:
   ```typescript
   describe('formatTime', () => {
     it('formats 0 seconds correctly', () => {
       expect(formatTime(0)).toBe('00:00');
     });

     it('formats seconds under 60', () => {
       expect(formatTime(45)).toBe('00:45');
     });

     it('formats minutes correctly', () => {
       expect(formatTime(65)).toBe('01:05');
     });

     it('formats hours correctly', () => {
       expect(formatTime(3661)).toBe('1:01:01');
     });

     it('handles negative numbers', () => {
       expect(formatTime(-10)).toBe('00:00');
     });

     it('handles NaN', () => {
       expect(formatTime(NaN)).toBe('00:00');
     });

     it('handles Infinity', () => {
       expect(formatTime(Infinity)).toBe('00:00');
     });
   });
   ```
3. Test `parseTime` function:
   ```typescript
   describe('parseTime', () => {
     it('parses MM:SS format', () => {
       expect(parseTime('01:30')).toBe(90);
     });

     it('parses HH:MM:SS format', () => {
       expect(parseTime('1:01:01')).toBe(3661);
     });

     it('returns null for invalid format', () => {
       expect(parseTime('invalid')).toBeNull();
     });
   });
   ```
4. Test `validateTrim` function:
   ```typescript
   describe('validateTrim', () => {
     it('validates correct trim', () => {
       expect(validateTrim(0, 10, 60)).toEqual({ isValid: true });
     });

     it('rejects negative start time', () => {
       const result = validateTrim(-1, 10, 60);
       expect(result.isValid).toBe(false);
       expect(result.error).toBeDefined();
     });

     it('rejects end time exceeding duration', () => {
       const result = validateTrim(0, 70, 60);
       expect(result.isValid).toBe(false);
     });

     it('rejects start >= end', () => {
       const result = validateTrim(10, 10, 60);
       expect(result.isValid).toBe(false);
     });

     it('rejects trim shorter than minimum duration', () => {
       const result = validateTrim(0, 0.5, 60, 1);
       expect(result.isValid).toBe(false);
     });
   });
   ```
5. Test position conversion functions:
   ```typescript
   describe('timeToPercent', () => {
     it('converts correctly', () => {
       expect(timeToPercent(30, 60)).toBe(50);
     });

     it('handles zero duration', () => {
       expect(timeToPercent(30, 0)).toBe(0);
     });

     it('clamps to 0-100 range', () => {
       expect(timeToPercent(70, 60)).toBe(100);
       expect(timeToPercent(-10, 60)).toBe(0);
     });
   });
   ```
6. Test `clampMarkerPosition` function:
   ```typescript
   describe('clampMarkerPosition', () => {
     it('clamps start marker to not exceed end', () => {
       expect(clampMarkerPosition(15, 10, true, 60, 1)).toBe(9);
     });

     it('clamps end marker to not go below start', () => {
       expect(clampMarkerPosition(5, 10, false, 60, 1)).toBe(11);
     });

     it('clamps to duration bounds', () => {
       expect(clampMarkerPosition(70, 50, false, 60, 1)).toBe(60);
     });
   });
   ```

#### Verification Steps
- [ ] Test file exists at correct location
- [ ] All tests pass with `npm test`
- [ ] formatTime handles all edge cases
- [ ] parseTime correctly parses valid formats and rejects invalid
- [ ] validateTrim catches all invalid scenarios
- [ ] Position conversion functions handle edge cases
- [ ] clampMarkerPosition enforces all constraints
- [ ] Tests cover boundary conditions

---

### Task 15: Integration Tests for VideoTrimmer Component
**Effort:** Medium (2-3 hours)
**Dependencies:** Task 12, Task 14

#### Description
Write integration tests for the VideoTrimmer component to verify user interactions work correctly.

#### Implementation Steps

1. Create test file `src/components/ItemCapture/editors/__tests__/VideoTrimmer.test.tsx`
2. Set up test utilities:
   ```typescript
   import { render, screen, fireEvent, waitFor } from '@testing-library/react';
   import VideoTrimmer from '../VideoTrimmer';

   // Mock video element methods
   beforeAll(() => {
     Object.defineProperty(HTMLMediaElement.prototype, 'duration', {
       get() { return 60; },
     });
     HTMLMediaElement.prototype.play = jest.fn().mockResolvedValue(undefined);
     HTMLMediaElement.prototype.pause = jest.fn();
   });
   ```
3. Test component renders:
   ```typescript
   describe('VideoTrimmer', () => {
     it('renders with video element', () => {
       render(
         <VideoTrimmer
           videoSrc="test.mp4"
           onTrimComplete={jest.fn()}
           onCancel={jest.fn()}
         />
       );
       expect(screen.getByRole('video', { hidden: true })).toBeInTheDocument();
     });

     it('shows loading state initially', () => {
       render(
         <VideoTrimmer
           videoSrc="test.mp4"
           onTrimComplete={jest.fn()}
           onCancel={jest.fn()}
         />
       );
       expect(screen.getByText(/loading video/i)).toBeInTheDocument();
     });
   });
   ```
4. Test callback invocations:
   ```typescript
   it('calls onCancel when Cancel button clicked', () => {
     const onCancel = jest.fn();
     render(
       <VideoTrimmer
         videoSrc="test.mp4"
         onTrimComplete={jest.fn()}
         onCancel={onCancel}
       />
     );
     fireEvent.click(screen.getByText('Cancel'));
     expect(onCancel).toHaveBeenCalled();
   });
   ```
5. Test Apply button behavior:
   ```typescript
   it('Apply button is disabled when not loaded', () => {
     render(
       <VideoTrimmer
         videoSrc="test.mp4"
         onTrimComplete={jest.fn()}
         onCancel={jest.fn()}
       />
     );
     expect(screen.getByText('Apply Trim')).toBeDisabled();
   });
   ```
6. Test ARIA attributes:
   ```typescript
   it('has correct ARIA labels on markers', async () => {
     render(
       <VideoTrimmer
         videoSrc="test.mp4"
         onTrimComplete={jest.fn()}
         onCancel={jest.fn()}
       />
     );
     // Simulate metadata load
     // Check ARIA attributes
   });
   ```

#### Verification Steps
- [ ] Test file exists at correct location
- [ ] All tests pass with `npm test`
- [ ] Component renders correctly in tests
- [ ] onCancel callback test passes
- [ ] Apply button disabled state test passes
- [ ] Loading state is correctly displayed
- [ ] Tests run without warnings

---

### Task 16: Manual Device Testing and Final Polish
**Effort:** Medium (2-3 hours)
**Dependencies:** All previous tasks

#### Description
Perform comprehensive manual testing across target devices and browsers, fixing any issues found.

#### Implementation Steps

1. Create test video files of various lengths (5s, 30s, 2min)
2. Test on iOS Safari (iPhone):
   - [ ] Touch dragging works for trim markers
   - [ ] Pinch-to-zoom doesn't interfere
   - [ ] Video loads and plays correctly
   - [ ] Markers cannot be dragged past each other
   - [ ] Apply produces correct TrimDescriptor
3. Test on iPad Safari:
   - [ ] Touch targets are adequate size
   - [ ] Landscape and portrait work
4. Test on Android Chrome:
   - [ ] Touch gestures work correctly
   - [ ] No scroll conflicts
5. Test on Desktop browsers:
   - [ ] Chrome - mouse interactions
   - [ ] Firefox - mouse interactions
   - [ ] Safari - mouse interactions
6. Test edge cases:
   - [ ] Very short videos (<5 seconds)
   - [ ] Long videos (>5 minutes)
   - [ ] Different video formats (MP4, WebM, MOV)
   - [ ] Videos with no audio track
7. Test keyboard navigation:
   - [ ] Tab navigates between elements
   - [ ] Arrow keys adjust marker positions
   - [ ] Space toggles play/pause
   - [ ] Escape triggers cancel
8. Fix any issues found during testing
9. Document any known limitations

#### Verification Steps
- [ ] iOS Safari 15+ tested and working
- [ ] iPad Safari tested and working
- [ ] Android Chrome tested and working
- [ ] Desktop Chrome tested and working
- [ ] Desktop Firefox tested and working
- [ ] All video formats play correctly
- [ ] Keyboard navigation works
- [ ] No console errors during normal usage
- [ ] Component lazy-loads correctly (not in initial bundle)

---

## Definition of Done

All of the following must be true for REQ-049 to be considered complete:

- [ ] Video player displays full video with playback controls
- [ ] Timeline scrubber shows trim markers and highlighted region
- [ ] Start and end markers are draggable (mouse and touch)
- [ ] Markers cannot cross each other (minimum gap maintained)
- [ ] Playing video starts from start marker and stops at end marker
- [ ] Duration display shows trimmed selection and total length
- [ ] Apply Trim returns correct TrimDescriptor with timestamps
- [ ] Cancel reverts without changes
- [ ] No actual video encoding occurs (metadata only)
- [ ] Keyboard controls work for accessibility
- [ ] Touch interactions work on iOS Safari 15+ and Android Chrome
- [ ] Responsive layout works from 320px to desktop
- [ ] No memory leaks (object URLs properly revoked)
- [ ] Unit tests for trimUtils pass
- [ ] Integration tests for VideoTrimmer pass
- [ ] Manual testing on target devices completed

---

## Risk Mitigation

| Risk | Mitigation Strategy |
|------|---------------------|
| Touch gestures conflict with page scroll | Use `touch-action: none` CSS on timeline container |
| Video format not supported by browser | Show clear error message with supported formats |
| Timeline click-to-seek conflicts with marker drag | Check isDragging state before processing timeline clicks |
| Long videos cause memory issues | Use preload="metadata" instead of preload="auto" |
| Safari video playback restrictions | Ensure playsInline attribute, handle play() promise rejection |

---

## Task Summary

| Task # | Description | Effort | Dependencies |
|--------|-------------|--------|--------------|
| 1 | Create Trim Utility Functions (trimUtils.ts) | S | None |
| 2 | Define VideoTrimmer Types and Props Interface | S | Task 1 |
| 3 | Implement Basic VideoTrimmer Component Structure | M | Task 2 |
| 4 | Implement Video Metadata Loading and Event Handlers | M | Task 3 |
| 5 | Implement Timeline Visualization with Markers | M | Task 4 |
| 6 | Implement Draggable Marker Interactions | M | Task 5 |
| 7 | Implement Playback Controls | S | Task 4 |
| 8 | Implement Duration Display | S | Task 4, 5 |
| 9 | Implement Keyboard Controls for Accessibility | S | Task 6, 7 |
| 10 | Implement Apply and Cancel Actions | S | Task 4, 1 |
| 11 | Implement Memory Cleanup and Resource Management | S | Task 3, 4 |
| 12 | Add Responsive Layout and Mobile Optimization | M | Task 5, 7, 8, 10 |
| 13 | Add Loading States and Error UI | S | Task 3, 10 |
| 14 | Unit Tests for Trim Utilities | M | Task 1 |
| 15 | Integration Tests for VideoTrimmer Component | M | Task 12, 14 |
| 16 | Manual Device Testing and Final Polish | M | All |

**Total Tasks:** 16
**Effort Breakdown:** 8 Small (S), 8 Medium (M)
**Estimated Total:** 8-12 story points

---

## V1 Limitations (By Design)

The following are **intentionally not included** in V1 to keep the bundle size minimal:

1. **No actual video trimming** - Timestamps are stored as metadata only
2. **No frame-accurate preview** - Preview uses constrained playback, not rendered output
3. **No audio waveform display** - Would require additional library
4. **No fine-tune controls** - +/- 0.1 second buttons deferred to V2
5. **No multiple trim regions** - Single continuous selection only
6. **No thumbnail strip on timeline** - Would require canvas frame extraction

These features may be added in V2 if user feedback indicates demand.

---

## References

- [HTML Video Element - MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video)
- [HTMLMediaElement API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement)
- [Touch Events - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [Lucide Icons](https://lucide.dev/icons/)
- Implementation Plan: `/docs/prd/item-capture-implementation-plan.md`
- Overview Document: `/docs/REQ-049-implement-videotrimmer-v1-simplified-overview.md`
- ImageCropper Reference: `/docs/REQ-047-implement-imagecropper-detailed.md`
