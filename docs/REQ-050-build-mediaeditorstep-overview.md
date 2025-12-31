# REQ-050: Build MediaEditorStep Component - Technical Overview

**Document Created:** 2025-12-31T17:30:00
**Last Modified:** 2025-12-31T17:30:00
**Request Reference:** `/docs/gen_requests.md` - REQ-050
**Implementation Plan:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 4 - Editing Features
**Task ID:** 4.5
**Status:** Ready for Implementation

---

## 1. Summary

Implement the `MediaEditorStep` component, which serves as the container/router for media editing within the ItemCapture wizard. This component orchestrates the display of appropriate editor interfaces (ImageCropper, ImageRotator, VideoTrimmer) based on media type, provides consistent Skip/Apply/Cancel actions across all editor types, and manages transitions between multiple media items for sequential editing before proceeding to the review step.

**Key Responsibility:** MediaEditorStep is the integration point that ties together all Phase 4 editor components (4.2, 4.3, 4.4) and the useMediaEditor hook (4.1) into a cohesive editing experience.

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
  Cropper     Rotator     Trimmer
       |           |           |
       +-----------+-----------+
                   v
          4.5 MediaEditorStep  <-- THIS TASK
           (Container/Router)
```

### Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Phase 1 (Foundation) | Required | Types, state machine, wizard navigation |
| Phase 2 OR Phase 3 | Required | Need media items to edit |
| Task 4.1 (useMediaEditor hook) | Required | Provides non-destructive edit state management |
| Task 4.2 (ImageCropper) | Required | Component for cropping images |
| Task 4.3 (ImageRotator) | Required | Component for rotating images |
| Task 4.4 (VideoTrimmer) | Required | Component for trimming videos |

### This Task Completes Phase 4

MediaEditorStep is the final task in Phase 4. Upon completion:
- All editing features are integrated
- Users can edit images (crop/rotate) and videos (trim)
- Sequential multi-item editing is supported
- Phase 5 (Review & Polish) can begin

---

## 3. Technical Approach

### 3.1 Component Architecture

The MediaEditorStep component will:
1. Receive the list of media items that need editing
2. Track the current media item being edited (index-based navigation)
3. Display the appropriate editor(s) based on media type
4. Provide consistent action buttons (Skip, Apply, Cancel) for all edit types
5. Manage transitions between media items
6. Transition to the review step after all items are processed (edited or skipped)

### 3.2 Media Type to Editor Mapping

| Media Type | Available Editors | Edit Operations |
|------------|-------------------|-----------------|
| `image` | ImageCropper, ImageRotator | Crop, Rotate (sequential or combined) |
| `video` | VideoTrimmer | Trim (start/end markers) |
| `pdf` | None (skip editing) | No client-side PDF editing in V1 |

### 3.3 Editor Display Strategy

**Option A: Sequential Editors (Recommended)**
For images, show crop and rotate as sequential steps:
1. Show ImageCropper first
2. After crop (apply/skip), show ImageRotator
3. After rotation (apply/skip), move to next media item

**Option B: Tabbed/Combined Editors**
Show all applicable editors with tabs or sections. User can switch between them before confirming.

**Recommendation:** Option A (Sequential) for V1 - simpler UX, clearer flow, easier to implement.

### 3.4 State Management Integration

```typescript
// MediaEditorStep uses useMediaEditor hook
const {
  startEditing,
  getEditState,
  setCrop,
  setRotation,
  setTrim,
  confirmEdits,
  cancelEdits,
  hasPendingEdits,
  getEditPreview
} = useMediaEditor();

// MediaEditorStep uses useItemCaptureState for navigation
const { state, dispatch } = useItemCaptureContext();
```

### 3.5 Edit Flow State Machine

```
                          +-----------------------+
                          |  MediaEditorStep      |
                          |  (mounted with items) |
                          +-----------+-----------+
                                      |
                                      v
                          +-----------+-----------+
                          |  Start with first     |
                          |  editable media item  |
                          +-----------+-----------+
                                      |
                     +----------------+----------------+
                     |                                 |
                     v                                 v
          +------------------+              +------------------+
          |  Media is IMAGE  |              |  Media is VIDEO  |
          +--------+---------+              +--------+---------+
                   |                                 |
                   v                                 v
          +------------------+              +------------------+
          |  Show Crop Step  |              |  Show Trim Step  |
          +--------+---------+              +--------+---------+
                   |                                 |
        +----------+----------+           +----------+----------+
        |          |          |           |          |          |
        v          v          v           v          v          v
     [Skip]    [Apply]    [Cancel]     [Skip]    [Apply]    [Cancel]
        |          |          |           |          |          |
        +----+-----+          |           +----+-----+          |
             |                |                |                |
             v                |                |                |
    +------------------+      |                |                |
    |  Show Rotate     |      |                |                |
    |  Step (images)   |      |                |                |
    +--------+---------+      |                |                |
             |                |                |                |
  +----------+----------+     |                |                |
  |          |          |     |                |                |
  v          v          v     |                |                |
[Skip]    [Apply]   [Cancel]  |                |                |
  |          |          |     |                |                |
  +----+-----+          |     |                |                |
       |                |     |                |                |
       v                v     v                v                v
+-----------------------------------------------------------------------------+
|                        Next Media Item OR Review Step                        |
|  - If more items: increment currentIndex, start editing next item           |
|  - If last item: dispatch GO_TO_STEP('review')                              |
+-----------------------------------------------------------------------------+
```

---

## 4. Props Interface

```typescript
/**
 * Props for the MediaEditorStep component
 */
export interface MediaEditorStepProps {
  /** Media items to edit (from state.mediaItems) */
  mediaItems: MediaItem[];

  /** Callback when all media items have been processed */
  onComplete: () => void;

  /** Callback to update a media item with edits */
  onUpdateMedia: (mediaId: string, updates: Partial<MediaItem>) => void;

  /** Callback when user cancels the entire editing flow */
  onCancel: () => void;

  /** Optional: Start editing from a specific item index */
  initialIndex?: number;

  /** Optional: CSS class for the container */
  className?: string;

  /** Optional: Enable debug logging */
  debug?: boolean;
}
```

---

## 5. Component Structure

```
src/components/ItemCapture/components/steps/
├── MediaEditorStep.tsx          # Main component (THIS TASK)
└── MediaEditorStep.types.ts     # TypeScript interfaces (optional, can inline)
```

### Internal State

```typescript
interface MediaEditorStepState {
  /** Index of current media item being edited */
  currentMediaIndex: number;

  /** Current edit phase for images: 'crop' | 'rotate' | null */
  currentEditPhase: ImageEditPhase | null;

  /** Whether any edits are being processed */
  isProcessing: boolean;

  /** Error message if any */
  error: string | null;

  /** Media items that have been processed (edited or skipped) */
  processedItemIds: Set<string>;
}

type ImageEditPhase = 'crop' | 'rotate';
```

---

## 6. User Interaction Flow

```
1. Component mounts with mediaItems array
   └── Filter to editable items only (exclude PDFs in V1)
   └── Initialize: currentMediaIndex = 0
   └── If media is image: currentEditPhase = 'crop'
   └── If media is video: currentEditPhase = null (single trim step)
   └── Start editing session via useMediaEditor.startEditing()

2. Display appropriate editor based on media type and phase
   └── Image + crop phase: Show ImageCropper
   └── Image + rotate phase: Show ImageRotator
   └── Video: Show VideoTrimmer

3. User interacts with editor
   └── Makes crop/rotate/trim adjustments
   └── useMediaEditor tracks changes non-destructively

4. User clicks one of three action buttons:

   4a. [Skip] button clicked
       └── Do not apply current edit operation
       └── Advance to next edit phase or media item
       └── If was crop → go to rotate
       └── If was rotate → go to next media item
       └── If was trim → go to next media item

   4b. [Apply] button clicked
       └── Confirm current edit via useMediaEditor
       └── Update media item with edited blob/metadata
       └── Advance to next edit phase or media item

   4c. [Cancel] button clicked
       └── Cancel all edits for current item
       └── Revert to original media
       └── Advance to next media item (or stay on current with confirmation?)

5. Transition to next media item or review
   └── If more items: increment currentMediaIndex, reset editPhase, start new editing session
   └── If last item: call onComplete() to trigger transition to review step
```

---

## 7. UI Layout

### 7.1 Overall Layout

```
+------------------------------------------------------------------+
|                        Media Editor                               |
|                                                                   |
|  +---------------------------------------------------------+     |
|  |  Progress: Editing image 2 of 5                          |     |
|  |  [===========                                    ]       |     |
|  +---------------------------------------------------------+     |
|                                                                   |
|  +---------------------------------------------------------+     |
|  |                                                         |     |
|  |                                                         |     |
|  |              [Active Editor Component]                  |     |
|  |           (ImageCropper/ImageRotator/VideoTrimmer)      |     |
|  |                                                         |     |
|  |                                                         |     |
|  +---------------------------------------------------------+     |
|                                                                   |
|  +---------------------------------------------------------+     |
|  |  Edit Phase (images only):                               |     |
|  |  [Crop] ───> [Rotate] ───> Done                         |     |
|  |    ^                                                     |     |
|  |  (current)                                               |     |
|  +---------------------------------------------------------+     |
|                                                                   |
|        [Cancel]         [Skip]         [Apply Edit]              |
|                                                                   |
+------------------------------------------------------------------+
```

### 7.2 Action Button Specifications

| Button | Label | Icon | Action | Enabled When |
|--------|-------|------|--------|--------------|
| Cancel | "Cancel" | X (Lucide) | Discard all edits, advance | Always |
| Skip | "Skip {editType}" | SkipForward (Lucide) | Skip current edit phase | Always |
| Apply | "Apply {editType}" | Check (Lucide) | Apply current edit | Has pending edits |

### 7.3 Progress Indicator

```tsx
// Progress indicator shows:
// 1. Current media item position (e.g., "Image 2 of 5")
// 2. Current edit phase for images (e.g., "Crop → Rotate")
// 3. Visual progress bar

<div className="mb-4">
  <p className="text-sm text-gray-600">
    Editing {mediaType} {currentMediaIndex + 1} of {totalEditableItems}
  </p>
  {mediaType === 'image' && (
    <p className="text-xs text-gray-500">
      Step: {currentEditPhase === 'crop' ? 'Crop' : 'Rotate'}
    </p>
  )}
  <div className="h-1 bg-gray-200 rounded mt-2">
    <div
      className="h-full bg-blue-500 rounded transition-all"
      style={{ width: `${((currentMediaIndex + 1) / totalEditableItems) * 100}%` }}
    />
  </div>
</div>
```

### 7.4 Responsive Behavior

| Viewport | Behavior |
|----------|----------|
| Mobile (< 640px) | Full-width layout, stacked buttons, editor fills screen |
| Tablet (640-1024px) | Comfortable padding, larger editor area |
| Desktop (> 1024px) | Centered container with max-width constraint |

---

## 8. Integration with useMediaEditor Hook

### 8.1 Hook Usage Pattern

```typescript
// Inside MediaEditorStep component
const {
  startEditing,
  getEditState,
  setCrop,
  setRotation,
  setTrim,
  confirmEdits,
  cancelEdits,
  hasPendingEdits,
  getEditPreview,
  getError,
  clearError
} = useMediaEditor({
  onEditsConfirmed: (mediaId, result) => {
    if (result.success) {
      onUpdateMedia(mediaId, {
        file: result.editedBlob ?? currentMedia.file,
        metadata: result.editedMetadata
      });
    }
  },
  onEditsCancelled: (mediaId) => {
    // Optionally track cancelled edits
    if (debug) {
      console.log(`[MediaEditorStep] Edits cancelled for ${mediaId}`);
    }
  },
  debug
});
```

### 8.2 Starting an Edit Session

```typescript
useEffect(() => {
  const currentMedia = mediaItems[currentMediaIndex];
  if (currentMedia && currentMedia.type !== 'pdf') {
    startEditing(currentMedia.id, currentMedia);
  }
}, [currentMediaIndex, mediaItems]);
```

### 8.3 Passing Callbacks to Editor Components

```tsx
// For ImageCropper
<ImageCropper
  imageSrc={getEditPreview(currentMedia.id) || createObjectURL(currentMedia.file)}
  onCropComplete={(croppedBlob) => {
    setCrop(currentMedia.id, extractCropDescriptor(croppedBlob));
    // Note: Actual blob handled by useMediaEditor internally
  }}
  onCancel={() => handleSkip()}
  initialAspectRatio="free"
/>

// For ImageRotator
<ImageRotator
  imageSrc={getEditPreview(currentMedia.id) || createObjectURL(currentMedia.file)}
  initialRotation={getEditState(currentMedia.id)?.rotation ?? 0}
  onRotationComplete={(rotatedBlob, degrees) => {
    setRotation(currentMedia.id, degrees);
  }}
  onCancel={() => handleSkip()}
/>

// For VideoTrimmer
<VideoTrimmer
  videoSrc={createObjectURL(currentMedia.file)}
  initialTrim={getEditState(currentMedia.id)?.trim ?? undefined}
  onTrimComplete={(trimDescriptor) => {
    setTrim(currentMedia.id, trimDescriptor);
  }}
  onCancel={() => handleSkip()}
/>
```

---

## 9. Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|---------------------|----------------|
| Appropriate editor displayed based on media type | `renderEditor()` function checks `currentMedia.type` and returns ImageCropper/ImageRotator or VideoTrimmer |
| Cropping and rotation controls for images | ImageCropper shown first, then ImageRotator (sequential phases) |
| Trimming controls for videos | VideoTrimmer shown for video media items |
| "Skip" button available for each edit type | Always-enabled Skip button advances to next phase/item without applying |
| "Apply" and "Cancel" buttons after making edits | Apply button confirms edits, Cancel button discards all and advances |
| Clicking Apply saves edits and advances | `confirmEdits()` called, then `advanceToNext()` |
| Clicking Cancel discards edits and advances | `cancelEdits()` called, then `advanceToNext()` |
| Clicking Skip bypasses editing and advances | No edit applied, just `advanceToNext()` |
| Sequential editing for multiple media items | `currentMediaIndex` state tracks position, increments after each item processed |
| Transition to review step after last item | When `currentMediaIndex >= editableItems.length - 1`, call `onComplete()` |
| Current editing position indicator | Progress indicator shows "Image 2 of 5" and phase indicator |

---

## 10. Error Handling

| Error Scenario | Handling |
|----------------|----------|
| Editor component fails to load | Show error message with retry button, allow skip to next item |
| Edit confirmation fails | Display error from useMediaEditor, offer retry or skip |
| No editable media items | Display message "No media to edit", auto-proceed to review |
| Object URL creation fails | Show error message, suggest closing other tabs |
| useMediaEditor session error | Display error, clear and allow retry or skip |

### Error Display Pattern

```tsx
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
    <p className="text-sm font-medium">Unable to process edit</p>
    <p className="text-sm">{error}</p>
    <div className="mt-2 flex gap-2">
      <button onClick={handleRetry} className="text-sm text-red-600 underline">
        Try again
      </button>
      <button onClick={handleSkip} className="text-sm text-gray-600 underline">
        Skip this item
      </button>
    </div>
  </div>
)}
```

---

## 11. Performance Considerations

### 11.1 Memory Management

```typescript
// Clean up object URLs when component unmounts
useEffect(() => {
  const urls: string[] = [];

  return () => {
    urls.forEach(url => URL.revokeObjectURL(url));
  };
}, []);

// Track URLs created for editor components
const createTrackedObjectURL = (blob: Blob): string => {
  const url = URL.createObjectURL(blob);
  urlsRef.current.push(url);
  return url;
};
```

### 11.2 Lazy Loading Editor Components

```typescript
// Dynamic imports to reduce initial bundle
const ImageCropper = dynamic(
  () => import('../../editors/ImageCropper'),
  {
    ssr: false,
    loading: () => <EditorLoadingPlaceholder />
  }
);

const ImageRotator = dynamic(
  () => import('../../editors/ImageRotator'),
  {
    ssr: false,
    loading: () => <EditorLoadingPlaceholder />
  }
);

const VideoTrimmer = dynamic(
  () => import('../../editors/VideoTrimmer'),
  {
    ssr: false,
    loading: () => <EditorLoadingPlaceholder />
  }
);
```

### 11.3 Loading Placeholder

```tsx
function EditorLoadingPlaceholder() {
  return (
    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 bg-gray-300 rounded-full mb-2" />
        <div className="h-4 w-24 bg-gray-300 rounded" />
      </div>
    </div>
  );
}
```

---

## 12. Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| Keyboard navigation | Tab through buttons, Enter/Space to activate |
| Screen reader support | `aria-label` on progress indicator and action buttons |
| Focus management | Focus first interactive element when editor loads |
| Button states | Clear disabled/enabled states with visual and ARIA indicators |
| Progress announcement | Live region announces current item position |

### Focus Management Pattern

```typescript
// Focus the primary action when editor phase changes
useEffect(() => {
  if (primaryActionRef.current) {
    primaryActionRef.current.focus();
  }
}, [currentEditPhase, currentMediaIndex]);
```

### Live Region for Progress

```tsx
<div aria-live="polite" className="sr-only">
  {`Now editing ${mediaType} ${currentMediaIndex + 1} of ${totalEditableItems}`}
</div>
```

---

## 13. Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/components/steps/MediaEditorStep.tsx` | Main MediaEditorStep component |

### Files to MODIFY

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemCapture/components/CaptureWizard.tsx` | Import and render MediaEditorStep for 'edit-media' step |
| `src/components/ItemCapture/index.ts` | Export MediaEditorStep (if needed externally) |

### Files to REFERENCE (read-only patterns)

| File Path | Pattern Reference |
|-----------|-------------------|
| `src/components/ItemCapture/editors/ImageCropper.tsx` | Editor component props interface |
| `src/components/ItemCapture/editors/ImageRotator.tsx` | Editor component props interface |
| `src/components/ItemCapture/editors/VideoTrimmer.tsx` | Editor component props interface |
| `src/components/ItemCapture/hooks/useMediaEditor.ts` | Hook integration patterns |
| `src/components/ItemCapture/hooks/useItemCaptureState.ts` | Wizard state and dispatch patterns |
| `src/components/ItemCapture/ItemCapture.types.ts` | MediaItem, MediaMetadata types |
| `src/components/ItemCapture/components/shared/StepNavigation.tsx` | Action button patterns |
| `src/components/ItemCapture/components/shared/ProgressIndicator.tsx` | Progress display patterns |
| `src/lib/utils.ts` | `cn()` utility for class merging |

### Dependencies Required

| Dependency | Version | Notes |
|------------|---------|-------|
| `lucide-react` | ^0.525.0 | Already installed - X, SkipForward, Check icons |
| `next/dynamic` | (Next.js built-in) | For lazy loading editor components |
| `tailwind-merge` | ^3.3.1 | Already installed - via cn() utility |
| `clsx` | ^2.1.1 | Already installed - via cn() utility |

**No new dependencies required.**

---

## 14. Testing Approach

### Unit Tests

1. **Component Rendering:**
   - Renders correct editor for image media
   - Renders correct editor for video media
   - Skips PDF items (no editing)

2. **Navigation Logic:**
   - `advanceToNext()` increments currentMediaIndex
   - Transitions to review when last item processed
   - Phase transitions (crop → rotate) work for images

3. **Button States:**
   - Apply disabled when no pending edits
   - Skip and Cancel always enabled

4. **Edit Phase Management:**
   - Image items start with 'crop' phase
   - After crop, transitions to 'rotate' phase
   - Video items have no phases (single editor)

### Integration Tests

1. Full edit flow for image (crop → rotate → apply)
2. Full edit flow for video (trim → apply)
3. Skip all edits flow
4. Mixed media items (image, video, pdf)
5. Cancel flow (discard and advance)

### Manual Testing Checklist

- [ ] Edit single image (crop, then rotate)
- [ ] Edit single video (trim)
- [ ] Edit multiple images sequentially
- [ ] Edit multiple videos sequentially
- [ ] Edit mixed media (images + videos)
- [ ] Skip crop, apply rotate
- [ ] Apply crop, skip rotate
- [ ] Cancel all edits for an item
- [ ] Progress indicator updates correctly
- [ ] Transitions to review step after last item
- [ ] Works on iPhone Safari
- [ ] Works on Android Chrome
- [ ] Works on desktop browsers
- [ ] Keyboard navigation works
- [ ] Screen reader announces progress

---

## 15. Implementation Order

1. Create `MediaEditorStep.tsx` with basic structure and TypeScript interfaces
2. Implement state management (currentMediaIndex, currentEditPhase)
3. Add media type detection and editor routing logic
4. Implement `renderEditor()` function with dynamic imports
5. Add action button handlers (handleApply, handleSkip, handleCancel)
6. Implement navigation logic (advanceToNext, transition to review)
7. Add progress indicator UI
8. Integrate with useMediaEditor hook
9. Add error handling and error display
10. Add accessibility attributes
11. Add memory cleanup for object URLs
12. Test on target browsers/devices

---

## 16. Related Tasks

| Task ID | Title | Relationship |
|---------|-------|--------------|
| 4.1 | useMediaEditor hook | Prerequisite - provides state management |
| 4.2 | ImageCropper | Prerequisite - editor component used |
| 4.3 | ImageRotator | Prerequisite - editor component used |
| 4.4 | VideoTrimmer | Prerequisite - editor component used |
| 5.1 | ReviewStep | Dependent - MediaEditorStep transitions to ReviewStep |

---

## 17. Open Questions

1. **Cancel Behavior:** Should canceling discard edits for just the current item, or provide option to cancel entire editing flow?
   - **Recommendation:** Cancel discards current item only; provide separate "Exit Editing" option for full flow cancel

2. **Edit Phase Order:** Should crop always come before rotate, or should user choose order?
   - **Recommendation:** Fixed order (crop → rotate) for V1; consider user choice in V2

3. **Revisit Edited Items:** Should users be able to go back and re-edit a previously processed item?
   - **Recommendation:** Not in V1 - users can re-edit from Review step; add back navigation in V2

4. **Empty Edit Confirmation:** If user makes no edits and clicks Apply, should we skip silently or show confirmation?
   - **Recommendation:** Skip silently - Apply with no changes is effectively a Skip

5. **PDF Editing:** Should PDFs be skipped entirely, or show a "No edits available" message?
   - **Recommendation:** Skip PDFs silently; don't confuse users with "no edits" message

---

## 18. Component Implementation Skeleton

```tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { X, SkipForward, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMediaEditor } from '../../hooks/useMediaEditor';
import type { MediaItem, MediaEditState } from '../../ItemCapture.types';

// Lazy load editor components
const ImageCropper = dynamic(() => import('../../editors/ImageCropper'), {
  ssr: false,
  loading: () => <EditorLoadingPlaceholder />,
});

const ImageRotator = dynamic(() => import('../../editors/ImageRotator'), {
  ssr: false,
  loading: () => <EditorLoadingPlaceholder />,
});

const VideoTrimmer = dynamic(() => import('../../editors/VideoTrimmer'), {
  ssr: false,
  loading: () => <EditorLoadingPlaceholder />,
});

type ImageEditPhase = 'crop' | 'rotate';

interface MediaEditorStepProps {
  mediaItems: MediaItem[];
  onComplete: () => void;
  onUpdateMedia: (mediaId: string, updates: Partial<MediaItem>) => void;
  onCancel: () => void;
  initialIndex?: number;
  className?: string;
  debug?: boolean;
}

export function MediaEditorStep({
  mediaItems,
  onComplete,
  onUpdateMedia,
  onCancel,
  initialIndex = 0,
  className,
  debug = false,
}: MediaEditorStepProps) {
  // Filter to editable items (exclude PDFs)
  const editableItems = mediaItems.filter(item => item.type !== 'pdf');

  // State
  const [currentMediaIndex, setCurrentMediaIndex] = useState(initialIndex);
  const [currentEditPhase, setCurrentEditPhase] = useState<ImageEditPhase | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for cleanup
  const urlsRef = useRef<string[]>([]);

  // Get current media item
  const currentMedia = editableItems[currentMediaIndex];
  const isLastItem = currentMediaIndex >= editableItems.length - 1;

  // Initialize useMediaEditor hook
  const {
    startEditing,
    getEditState,
    setCrop,
    setRotation,
    setTrim,
    confirmEdits,
    cancelEdits,
    hasPendingEdits,
    getEditPreview,
  } = useMediaEditor({
    onEditsConfirmed: (mediaId, result) => {
      if (result.success && result.editedBlob) {
        onUpdateMedia(mediaId, {
          file: result.editedBlob,
          metadata: result.editedMetadata,
        });
      }
    },
    debug,
  });

  // Initialize edit phase based on media type
  useEffect(() => {
    if (!currentMedia) return;

    if (currentMedia.type === 'image') {
      setCurrentEditPhase('crop');
    } else {
      setCurrentEditPhase(null);
    }

    // Start editing session
    startEditing(currentMedia.id, currentMedia);
  }, [currentMediaIndex, currentMedia?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      urlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  // Handle empty editable items
  if (editableItems.length === 0) {
    useEffect(() => {
      onComplete();
    }, []);
    return null;
  }

  // Advance to next item or complete
  const advanceToNext = useCallback(() => {
    if (currentMedia?.type === 'image' && currentEditPhase === 'crop') {
      // For images: move from crop to rotate phase
      setCurrentEditPhase('rotate');
    } else if (isLastItem) {
      // Last item: complete editing
      onComplete();
    } else {
      // More items: advance to next
      setCurrentMediaIndex(prev => prev + 1);
    }
  }, [currentMedia?.type, currentEditPhase, isLastItem, onComplete]);

  // Action handlers
  const handleApply = async () => {
    if (!currentMedia) return;

    setIsProcessing(true);
    setError(null);

    try {
      const result = await confirmEdits(currentMedia.id);
      if (!result.success) {
        setError(result.error || 'Failed to apply edits');
        return;
      }
      advanceToNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkip = () => {
    advanceToNext();
  };

  const handleCancelItem = () => {
    if (currentMedia) {
      cancelEdits(currentMedia.id);
    }
    advanceToNext();
  };

  // Render appropriate editor
  const renderEditor = () => {
    if (!currentMedia) return null;

    const editState = getEditState(currentMedia.id);
    const previewUrl = editState?.previewUrl;

    if (currentMedia.type === 'image') {
      if (currentEditPhase === 'crop') {
        return (
          <ImageCropper
            imageSrc={previewUrl || URL.createObjectURL(currentMedia.file)}
            onCropComplete={(croppedBlob) => {
              // Hook handles the crop descriptor
            }}
            onCancel={handleSkip}
          />
        );
      }
      if (currentEditPhase === 'rotate') {
        return (
          <ImageRotator
            imageSrc={previewUrl || URL.createObjectURL(currentMedia.file)}
            initialRotation={editState?.rotation ?? 0}
            onRotationComplete={(rotatedBlob, degrees) => {
              setRotation(currentMedia.id, degrees);
            }}
            onCancel={handleSkip}
          />
        );
      }
    }

    if (currentMedia.type === 'video') {
      return (
        <VideoTrimmer
          videoSrc={URL.createObjectURL(currentMedia.file)}
          initialTrim={editState?.trim ?? undefined}
          onTrimComplete={(trimDescriptor) => {
            setTrim(currentMedia.id, trimDescriptor);
          }}
          onCancel={handleSkip}
        />
      );
    }

    return null;
  };

  // Get edit type label for buttons
  const getEditTypeLabel = (): string => {
    if (currentMedia?.type === 'video') return 'Trim';
    if (currentEditPhase === 'crop') return 'Crop';
    if (currentEditPhase === 'rotate') return 'Rotation';
    return 'Edit';
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Progress Indicator */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Editing {currentMedia?.type} {currentMediaIndex + 1} of {editableItems.length}
        </p>
        {currentMedia?.type === 'image' && (
          <p className="text-xs text-gray-500 mt-1">
            Step: {currentEditPhase === 'crop' ? 'Crop' : 'Rotate'}
          </p>
        )}
        <div className="h-1 bg-gray-200 rounded mt-2">
          <div
            className="h-full bg-blue-500 rounded transition-all"
            style={{
              width: `${((currentMediaIndex + 1) / editableItems.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p className="text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-sm text-red-600 underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Editor Area */}
      <div className="flex-1 min-h-0">{renderEditor()}</div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center gap-4 mt-4 pt-4 border-t">
        <button
          onClick={handleCancelItem}
          disabled={isProcessing}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded',
            'bg-gray-100 hover:bg-gray-200 text-gray-700',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <X className="w-4 h-4" />
          Cancel
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleSkip}
            disabled={isProcessing}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded',
              'bg-gray-100 hover:bg-gray-200 text-gray-700',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <SkipForward className="w-4 h-4" />
            Skip {getEditTypeLabel()}
          </button>

          <button
            onClick={handleApply}
            disabled={isProcessing || !hasPendingEdits(currentMedia?.id ?? '')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded',
              'bg-blue-500 hover:bg-blue-600 text-white',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Check className="w-4 h-4" />
            Apply {getEditTypeLabel()}
          </button>
        </div>
      </div>

      {/* Accessibility: Live region for screen readers */}
      <div aria-live="polite" className="sr-only">
        {`Now editing ${currentMedia?.type} ${currentMediaIndex + 1} of ${editableItems.length}`}
      </div>
    </div>
  );
}

function EditorLoadingPlaceholder() {
  return (
    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 bg-gray-300 rounded-full mb-2" />
        <div className="h-4 w-24 bg-gray-300 rounded" />
      </div>
    </div>
  );
}

export default MediaEditorStep;
```

---

## 19. References

- [Implementation Plan](/docs/prd/item-capture-implementation-plan.md) - Phase 4, Task 4.5
- [useMediaEditor Hook](/docs/REQ-046-create-usemediaeditor-hook-overview.md) - Hook integration
- [ImageCropper](/docs/REQ-047-implement-imagecropper-overview.md) - Cropper component spec
- [ImageRotator](/docs/REQ-048-implement-imagerotator-overview.md) - Rotator component spec
- [VideoTrimmer](/docs/REQ-049-implement-videotrimmer-v1-simplified-overview.md) - Trimmer component spec
- [Next.js Dynamic Imports](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)
- [Lucide Icons](https://lucide.dev/icons/)
