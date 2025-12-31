# REQ-046: Create useMediaEditor Hook - Technical Implementation Overview

**Generated:** 2025-12-31T14:45:00
**Last Modified:** 2025-12-31T14:45:00
**Request Reference:** REQ-046 in `/docs/gen_requests.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 4 - Editing Features
**Task ID:** 4.1

---

## Executive Summary

This document provides a technical implementation breakdown for the `useMediaEditor` hook, which manages non-destructive editing state for media items captured or uploaded in the ItemCapture component. The hook tracks edit operations separately from original media data, allowing users to preview changes in real-time while preserving the original until explicit confirmation.

The hook is a critical foundation for Phase 4 (Editing Features) and directly enables tasks 4.2 (ImageCropper), 4.3 (ImageRotator), 4.4 (VideoTrimmer), and 4.5 (MediaEditorStep). It follows the "changeset" pattern where edits are accumulated and only applied upon user confirmation.

---

## Scope

### In Scope
- Non-destructive edit state management per media item
- Changeset tracking for edit operations (crop, rotate, trim)
- Preview generation for pending edits without modifying originals
- Edit confirmation to apply changeset and produce modified media
- Edit cancellation to discard changeset and revert to original
- Visual indication of pending (unconfirmed) edits status
- Multi-item concurrent edit state support
- Memory-efficient edit history management

### Out of Scope
- Actual image cropping logic (Task 4.2 - ImageCropper component)
- Actual image rotation logic (Task 4.3 - ImageRotator component)
- Actual video trimming logic (Task 4.4 - VideoTrimmer component)
- Canvas rendering operations (handled by editor components)
- WASM-based video encoding (deferred to V2 per implementation plan)
- Undo/redo functionality (single-level edit tracking in V1)
- Cloud storage integration (handled by parent application)

---

## Dependencies

### Hard Dependencies (Must Complete First)
| Dependency | Status | Location |
|------------|--------|----------|
| Phase 1 Complete | Required | Tasks 1.1-1.5 |
| Phase 2 OR Phase 3 Complete | Required | Need media items to edit |
| ItemCapture.types.ts | Required | `src/components/ItemCapture/ItemCapture.types.ts` |
| MediaItem interface | Required | Defines media structure |
| Directory structure | Required | Task 1.1 |

### Soft Dependencies (Can Develop in Parallel)
| Dependency | Status | Notes |
|------------|--------|-------|
| Task 4.2 - ImageCropper | Parallel | Component consumes hook |
| Task 4.3 - ImageRotator | Parallel | Component consumes hook |
| Task 4.4 - VideoTrimmer | Parallel | Component consumes hook |
| Task 4.5 - MediaEditorStep | Depends on 4.2-4.4 | Container orchestrates editors |

### External Dependencies
| Dependency | Notes |
|------------|-------|
| Canvas API | Native browser API for preview generation |
| URL.createObjectURL | Native API for Blob preview URLs |

---

## Technical Approach

### Architecture Decision: Changeset Pattern for Non-Destructive Editing

**Decision:** Use a changeset-based architecture where edit operations are tracked as descriptors, not applied immediately to media data.

**Rationale:**
- Preserves original media until explicit confirmation
- Enables real-time preview without destructive operations
- Allows easy cancellation/reset at any point
- Memory-efficient: only stores edit descriptors, not duplicated media
- Matches PRD requirement: "Original media data is preserved and never modified until user confirms changes"
- Aligns with implementation plan: "Non-destructive edit tracking"

### State Management Approach

The hook uses a Map-based state structure keyed by media item ID, allowing:
- O(1) lookup of edit state per item
- Independent edit sessions for multiple items
- Clean separation between editing and non-editing items

### Preview Generation Strategy

Previews are generated on-demand when edit state changes:
1. Hook stores edit descriptors (crop bounds, rotation angle, trim points)
2. Editor components request preview via `getEditPreview(mediaId)`
3. Hook applies descriptors to generate preview Blob/URL
4. Preview is cached until edit state changes
5. Original media remains untouched

---

## Interface Design

### Hook Options Interface

```typescript
/**
 * Configuration options for useMediaEditor hook
 */
interface UseMediaEditorOptions {
  /** Maximum number of concurrent edit sessions (default: 5) */
  maxConcurrentEdits?: number;

  /** Whether to auto-generate previews on edit changes (default: true) */
  autoGeneratePreview?: boolean;

  /** Preview quality for images (0-1, default: 0.8) */
  previewQuality?: number;

  /** Maximum preview dimensions (default: { width: 800, height: 800 }) */
  maxPreviewSize?: { width: number; height: number };

  /** Callback when edit state changes */
  onEditStateChange?: (mediaId: string, state: MediaEditState) => void;

  /** Callback when edits are confirmed */
  onEditsConfirmed?: (mediaId: string, result: EditConfirmationResult) => void;

  /** Callback when edits are cancelled */
  onEditsCancelled?: (mediaId: string) => void;

  /** Enable debug logging (default: false) */
  debug?: boolean;
}
```

### Hook Return Interface

```typescript
/**
 * Return value from useMediaEditor hook
 */
interface UseMediaEditorReturn {
  // === Edit State ===
  /** Map of active edit sessions (mediaId -> editState) */
  editSessions: Map<string, MediaEditState>;

  /** Get edit state for a specific media item */
  getEditState: (mediaId: string) => MediaEditState | null;

  /** Check if a media item has pending (unconfirmed) edits */
  hasPendingEdits: (mediaId: string) => boolean;

  /** Get all media IDs with pending edits */
  getPendingEditIds: () => string[];

  /** Check if any item has pending edits */
  hasAnyPendingEdits: boolean;

  // === Edit Actions ===
  /** Start editing a media item */
  startEditing: (mediaId: string, originalMedia: MediaItem) => void;

  /** Apply crop edit to current session */
  setCrop: (mediaId: string, crop: CropDescriptor | null) => void;

  /** Apply rotation edit to current session */
  setRotation: (mediaId: string, degrees: RotationDegrees) => void;

  /** Apply trim edit to current session (video only) */
  setTrim: (mediaId: string, trim: TrimDescriptor | null) => void;

  /** Reset specific edit type to original */
  resetEdit: (mediaId: string, editType: EditType) => void;

  /** Reset all edits for a media item */
  resetAllEdits: (mediaId: string) => void;

  // === Preview Generation ===
  /** Get preview URL for current edit state */
  getEditPreview: (mediaId: string) => Promise<string | null>;

  /** Check if preview is being generated */
  isGeneratingPreview: (mediaId: string) => boolean;

  /** Force regenerate preview (after external changes) */
  regeneratePreview: (mediaId: string) => Promise<void>;

  // === Confirmation / Cancellation ===
  /** Confirm edits and produce final edited media */
  confirmEdits: (mediaId: string) => Promise<EditConfirmationResult>;

  /** Cancel edits and discard all changes */
  cancelEdits: (mediaId: string) => void;

  /** End editing session without applying (preserves state) */
  endEditing: (mediaId: string) => void;

  // === Utility ===
  /** Get summary of edits for a media item */
  getEditSummary: (mediaId: string) => EditSummary | null;

  /** Check if a specific edit type is applied */
  hasEdit: (mediaId: string, editType: EditType) => boolean;

  /** Clear all edit sessions */
  clearAllSessions: () => void;

  // === Error State ===
  /** Current error per media item */
  getError: (mediaId: string) => MediaEditorError | null;

  /** Clear error for a media item */
  clearError: (mediaId: string) => void;
}
```

### Supporting Type Interfaces

```typescript
/**
 * Current edit state for a media item
 */
interface MediaEditState {
  /** Media item being edited */
  mediaId: string;

  /** Reference to original media (never modified) */
  originalMedia: MediaItem;

  /** Currently applied crop (null = no crop) */
  crop: CropDescriptor | null;

  /** Currently applied rotation (0 = no rotation) */
  rotation: RotationDegrees;

  /** Currently applied trim (null = no trim, video only) */
  trim: TrimDescriptor | null;

  /** Cached preview URL (null if not generated) */
  previewUrl: string | null;

  /** Whether preview is currently being generated */
  isGeneratingPreview: boolean;

  /** Whether this session has any pending changes */
  isDirty: boolean;

  /** Timestamp when editing started */
  startedAt: Date;

  /** Timestamp of last edit change */
  lastModifiedAt: Date;
}

/**
 * Descriptor for crop operation
 */
interface CropDescriptor {
  /** X coordinate of crop origin (percentage 0-100) */
  x: number;
  /** Y coordinate of crop origin (percentage 0-100) */
  y: number;
  /** Width of crop area (percentage 0-100) */
  width: number;
  /** Height of crop area (percentage 0-100) */
  height: number;
  /** Aspect ratio constraint (optional) */
  aspectRatio?: number;
}

/**
 * Rotation in 90-degree increments
 */
type RotationDegrees = 0 | 90 | 180 | 270;

/**
 * Descriptor for video trim operation
 */
interface TrimDescriptor {
  /** Start time in seconds */
  startTime: number;
  /** End time in seconds */
  endTime: number;
  /** Original video duration for validation */
  originalDuration: number;
}

/**
 * Types of edits supported
 */
type EditType = 'crop' | 'rotation' | 'trim';

/**
 * Result of confirming edits
 */
interface EditConfirmationResult {
  /** Whether confirmation was successful */
  success: boolean;

  /** The edited media blob (images only in V1) */
  editedBlob?: Blob;

  /** The edited media metadata */
  editedMetadata: MediaMetadata;

  /** Summary of applied edits */
  appliedEdits: EditSummary;

  /** Error message if failed */
  error?: string;
}

/**
 * Summary of edits applied to a media item
 */
interface EditSummary {
  /** Whether image was cropped */
  cropped: boolean;

  /** Rotation angle applied (0 if none) */
  rotated: RotationDegrees;

  /** Video trim applied (null if none or not video) */
  trimmed: TrimDescriptor | null;

  /** Total number of edit operations */
  editCount: number;
}

/**
 * Error for editor operations
 */
interface MediaEditorError {
  /** Error code for programmatic handling */
  code: MediaEditorErrorCode;

  /** User-friendly error message */
  message: string;

  /** Suggested action for the user */
  action: string;

  /** Whether the error is recoverable */
  recoverable: boolean;
}

type MediaEditorErrorCode =
  | 'PREVIEW_GENERATION_FAILED'
  | 'CONFIRM_FAILED'
  | 'INVALID_CROP_BOUNDS'
  | 'INVALID_TRIM_POINTS'
  | 'MAX_SESSIONS_EXCEEDED'
  | 'SESSION_NOT_FOUND'
  | 'UNSUPPORTED_MEDIA_TYPE';
```

---

## Implementation Tasks

### Task Breakdown

| Task | Description | Estimate | Depends On |
|------|-------------|----------|------------|
| 4.1.1 | Create hook file with TypeScript interfaces | 30 min | Phase 2 or 3 complete |
| 4.1.2 | Implement edit session management (Map-based state) | 45 min | 4.1.1 |
| 4.1.3 | Implement crop edit tracking | 30 min | 4.1.2 |
| 4.1.4 | Implement rotation edit tracking | 30 min | 4.1.2 |
| 4.1.5 | Implement trim edit tracking (video) | 30 min | 4.1.2 |
| 4.1.6 | Implement preview generation for images | 1.5 hr | 4.1.3, 4.1.4 |
| 4.1.7 | Implement preview generation for video (frame extraction) | 1 hr | 4.1.5 |
| 4.1.8 | Implement edit confirmation for images | 1 hr | 4.1.6 |
| 4.1.9 | Implement edit confirmation for video (metadata only V1) | 30 min | 4.1.7 |
| 4.1.10 | Add pending edits status tracking | 30 min | 4.1.3-4.1.5 |
| 4.1.11 | Add error handling & user messages | 45 min | 4.1.1-4.1.9 |
| 4.1.12 | Add cleanup & memory management | 45 min | 4.1.6, 4.1.7 |
| 4.1.13 | Manual testing across browsers | 1 hr | 4.1.1-4.1.12 |

**Total Estimated Time:** ~10 hours (1.25 days)

---

## Key Implementation Details

### 1. Edit Session State Structure

```typescript
// Internal state structure
const [editSessions, setEditSessions] = useState<Map<string, MediaEditState>>(new Map());

// Refs for memory management
const previewUrlsRef = useRef<Map<string, string>>(new Map());
const isUnmountedRef = useRef(false);
```

### 2. Starting an Edit Session

```typescript
const startEditing = useCallback((mediaId: string, originalMedia: MediaItem) => {
  if (isUnmountedRef.current) return;

  // Check max concurrent edits
  if (editSessions.size >= maxConcurrentEdits && !editSessions.has(mediaId)) {
    setErrorForMedia(mediaId, {
      code: 'MAX_SESSIONS_EXCEEDED',
      message: `Maximum of ${maxConcurrentEdits} items can be edited at once`,
      action: 'Finish editing another item first',
      recoverable: true
    });
    return;
  }

  setEditSessions(prev => {
    const newMap = new Map(prev);

    // Initialize edit state with original values
    newMap.set(mediaId, {
      mediaId,
      originalMedia,
      crop: null,
      rotation: 0,
      trim: null,
      previewUrl: null,
      isGeneratingPreview: false,
      isDirty: false,
      startedAt: new Date(),
      lastModifiedAt: new Date()
    });

    return newMap;
  });

  if (debug) {
    console.log(`[useMediaEditor] Started editing session for ${mediaId}`);
  }
}, [editSessions.size, maxConcurrentEdits, debug]);
```

### 3. Applying Non-Destructive Edits

```typescript
const setCrop = useCallback((mediaId: string, crop: CropDescriptor | null) => {
  if (isUnmountedRef.current) return;

  setEditSessions(prev => {
    const session = prev.get(mediaId);
    if (!session) {
      console.warn(`[useMediaEditor] No edit session for ${mediaId}`);
      return prev;
    }

    // Validate crop bounds
    if (crop) {
      const validation = validateCropBounds(crop);
      if (!validation.valid) {
        setErrorForMedia(mediaId, {
          code: 'INVALID_CROP_BOUNDS',
          message: validation.message,
          action: 'Adjust the crop selection',
          recoverable: true
        });
        return prev;
      }
    }

    const newMap = new Map(prev);
    newMap.set(mediaId, {
      ...session,
      crop,
      isDirty: crop !== null || session.rotation !== 0 || session.trim !== null,
      lastModifiedAt: new Date(),
      // Invalidate cached preview
      previewUrl: null
    });

    return newMap;
  });

  // Auto-generate preview if enabled
  if (autoGeneratePreview) {
    generatePreviewDebounced(mediaId);
  }

  onEditStateChange?.(mediaId, editSessions.get(mediaId)!);
}, [autoGeneratePreview, onEditStateChange]);

const setRotation = useCallback((mediaId: string, degrees: RotationDegrees) => {
  if (isUnmountedRef.current) return;

  setEditSessions(prev => {
    const session = prev.get(mediaId);
    if (!session) return prev;

    // Validate rotation value
    if (![0, 90, 180, 270].includes(degrees)) {
      console.warn(`[useMediaEditor] Invalid rotation: ${degrees}`);
      return prev;
    }

    const newMap = new Map(prev);
    newMap.set(mediaId, {
      ...session,
      rotation: degrees,
      isDirty: session.crop !== null || degrees !== 0 || session.trim !== null,
      lastModifiedAt: new Date(),
      previewUrl: null
    });

    return newMap;
  });

  if (autoGeneratePreview) {
    generatePreviewDebounced(mediaId);
  }
}, [autoGeneratePreview]);

const setTrim = useCallback((mediaId: string, trim: TrimDescriptor | null) => {
  if (isUnmountedRef.current) return;

  setEditSessions(prev => {
    const session = prev.get(mediaId);
    if (!session) return prev;

    // Only allow trim for video
    if (session.originalMedia.type !== 'video') {
      console.warn(`[useMediaEditor] Cannot trim non-video media`);
      return prev;
    }

    // Validate trim points
    if (trim) {
      const validation = validateTrimPoints(trim);
      if (!validation.valid) {
        setErrorForMedia(mediaId, {
          code: 'INVALID_TRIM_POINTS',
          message: validation.message,
          action: 'Adjust the trim selection',
          recoverable: true
        });
        return prev;
      }
    }

    const newMap = new Map(prev);
    newMap.set(mediaId, {
      ...session,
      trim,
      isDirty: session.crop !== null || session.rotation !== 0 || trim !== null,
      lastModifiedAt: new Date(),
      previewUrl: null
    });

    return newMap;
  });

  if (autoGeneratePreview) {
    generatePreviewDebounced(mediaId);
  }
}, [autoGeneratePreview]);
```

### 4. Preview Generation for Images

```typescript
const generateImagePreview = async (
  session: MediaEditState
): Promise<string | null> => {
  const { originalMedia, crop, rotation } = session;

  try {
    // Create image element from original
    const img = await loadImage(originalMedia.file);

    // Create canvas for preview
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context unavailable');

    // Calculate dimensions based on rotation
    const isRotated90or270 = rotation === 90 || rotation === 270;
    let srcWidth = img.width;
    let srcHeight = img.height;

    // Apply crop if present
    let sx = 0, sy = 0, sw = srcWidth, sh = srcHeight;
    if (crop) {
      sx = (crop.x / 100) * srcWidth;
      sy = (crop.y / 100) * srcHeight;
      sw = (crop.width / 100) * srcWidth;
      sh = (crop.height / 100) * srcHeight;
    }

    // Set canvas size (consider rotation swap)
    let canvasWidth = sw;
    let canvasHeight = sh;
    if (isRotated90or270) {
      [canvasWidth, canvasHeight] = [canvasHeight, canvasWidth];
    }

    // Constrain to max preview size
    const scale = Math.min(
      maxPreviewSize.width / canvasWidth,
      maxPreviewSize.height / canvasHeight,
      1
    );
    canvas.width = canvasWidth * scale;
    canvas.height = canvasHeight * scale;

    // Apply transforms
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    if (isRotated90or270) {
      ctx.drawImage(
        img, sx, sy, sw, sh,
        -canvas.height / 2, -canvas.width / 2,
        canvas.height, canvas.width
      );
    } else {
      ctx.drawImage(
        img, sx, sy, sw, sh,
        -canvas.width / 2, -canvas.height / 2,
        canvas.width, canvas.height
      );
    }
    ctx.restore();

    // Convert to blob URL
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          previewUrlsRef.current.set(session.mediaId, url);
          resolve(url);
        } else {
          resolve(null);
        }
      }, 'image/jpeg', previewQuality);
    });
  } catch (error) {
    console.error('[useMediaEditor] Preview generation failed:', error);
    return null;
  }
};

// Helper to load image from File/Blob
const loadImage = (source: File | Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(source);
  });
};
```

### 5. Preview Generation for Video (Frame Extraction)

```typescript
const generateVideoPreview = async (
  session: MediaEditState
): Promise<string | null> => {
  const { originalMedia, trim, rotation } = session;

  try {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(originalMedia.file);
    video.muted = true;

    // Seek to preview point (start of trim or beginning)
    const seekTime = trim?.startTime ?? 0;

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => {
        video.currentTime = seekTime;
      };
      video.onseeked = () => resolve();
      video.onerror = reject;
    });

    // Capture frame
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context unavailable');

    // Apply rotation transform for preview
    const isRotated90or270 = rotation === 90 || rotation === 270;
    if (isRotated90or270) {
      canvas.width = video.videoHeight;
      canvas.height = video.videoWidth;
    } else {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    if (isRotated90or270) {
      ctx.drawImage(video, -video.videoWidth / 2, -video.videoHeight / 2);
    } else {
      ctx.drawImage(video, -video.videoWidth / 2, -video.videoHeight / 2);
    }
    ctx.restore();

    // Cleanup video element
    URL.revokeObjectURL(video.src);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          previewUrlsRef.current.set(session.mediaId, url);
          resolve(url);
        } else {
          resolve(null);
        }
      }, 'image/jpeg', 0.8);
    });
  } catch (error) {
    console.error('[useMediaEditor] Video preview generation failed:', error);
    return null;
  }
};
```

### 6. Edit Confirmation (Apply Changeset)

```typescript
const confirmEdits = useCallback(async (
  mediaId: string
): Promise<EditConfirmationResult> => {
  const session = editSessions.get(mediaId);

  if (!session) {
    return {
      success: false,
      error: 'No active edit session for this media',
      editedMetadata: {} as MediaMetadata,
      appliedEdits: { cropped: false, rotated: 0, trimmed: null, editCount: 0 }
    };
  }

  try {
    const { originalMedia, crop, rotation, trim } = session;

    // Generate edit summary
    const appliedEdits: EditSummary = {
      cropped: crop !== null,
      rotated: rotation,
      trimmed: originalMedia.type === 'video' ? trim : null,
      editCount: (crop ? 1 : 0) + (rotation !== 0 ? 1 : 0) + (trim ? 1 : 0)
    };

    let editedBlob: Blob | undefined;
    let editedMetadata: MediaMetadata = { ...originalMedia.metadata };

    // For images: apply edits and generate final blob
    if (originalMedia.type === 'image') {
      editedBlob = await applyImageEdits(originalMedia.file, crop, rotation);

      // Update metadata with edit info
      editedMetadata = {
        ...editedMetadata,
        edits: {
          cropped: crop !== null,
          rotated: rotation
        }
      };
    }

    // For videos: only store edit metadata (actual trimming deferred to upload)
    if (originalMedia.type === 'video') {
      editedMetadata = {
        ...editedMetadata,
        edits: {
          cropped: crop !== null,
          rotated: rotation,
          trimStart: trim?.startTime,
          trimEnd: trim?.endTime
        }
      };
      // Note: Video blob is not modified in V1 - trim metadata passed to parent
    }

    // Clean up edit session
    cleanupSession(mediaId);

    // Notify callback
    const result: EditConfirmationResult = {
      success: true,
      editedBlob,
      editedMetadata,
      appliedEdits
    };

    onEditsConfirmed?.(mediaId, result);

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Edit confirmation failed';

    return {
      success: false,
      error: message,
      editedMetadata: session.originalMedia.metadata,
      appliedEdits: { cropped: false, rotated: 0, trimmed: null, editCount: 0 }
    };
  }
}, [editSessions, onEditsConfirmed]);
```

### 7. Edit Cancellation

```typescript
const cancelEdits = useCallback((mediaId: string) => {
  if (isUnmountedRef.current) return;

  const session = editSessions.get(mediaId);
  if (!session) return;

  // Clean up preview URL
  const previewUrl = previewUrlsRef.current.get(mediaId);
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
    previewUrlsRef.current.delete(mediaId);
  }

  // Remove session
  setEditSessions(prev => {
    const newMap = new Map(prev);
    newMap.delete(mediaId);
    return newMap;
  });

  onEditsCancelled?.(mediaId);

  if (debug) {
    console.log(`[useMediaEditor] Cancelled edits for ${mediaId}`);
  }
}, [editSessions, onEditsCancelled, debug]);
```

### 8. Memory Leak Prevention

```typescript
// Track mounted state
const isUnmountedRef = useRef(false);

// Store preview URLs for cleanup
const previewUrlsRef = useRef<Map<string, string>>(new Map());

// Cleanup on unmount
useEffect(() => {
  return () => {
    isUnmountedRef.current = true;

    // Revoke all preview URLs
    previewUrlsRef.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    previewUrlsRef.current.clear();
  };
}, []);

// Cleanup helper for individual sessions
const cleanupSession = useCallback((mediaId: string) => {
  // Revoke preview URL
  const previewUrl = previewUrlsRef.current.get(mediaId);
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
    previewUrlsRef.current.delete(mediaId);
  }

  // Remove from sessions
  setEditSessions(prev => {
    const newMap = new Map(prev);
    newMap.delete(mediaId);
    return newMap;
  });
}, []);
```

### 9. Pending Edits Status Tracking

```typescript
const hasPendingEdits = useCallback((mediaId: string): boolean => {
  const session = editSessions.get(mediaId);
  return session?.isDirty ?? false;
}, [editSessions]);

const getPendingEditIds = useCallback((): string[] => {
  return Array.from(editSessions.entries())
    .filter(([_, session]) => session.isDirty)
    .map(([mediaId]) => mediaId);
}, [editSessions]);

const hasAnyPendingEdits = useMemo(() => {
  return Array.from(editSessions.values()).some(session => session.isDirty);
}, [editSessions]);
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/hooks/useMediaEditor.ts` | Main hook implementation |

### Files to Modify

| File Path | Modification | Reason |
|-----------|--------------|--------|
| `src/components/ItemCapture/ItemCapture.types.ts` | Add `UseMediaEditorOptions`, `UseMediaEditorReturn`, `MediaEditState`, `CropDescriptor`, `TrimDescriptor`, `EditSummary`, `EditConfirmationResult`, `MediaEditorError` interfaces | Type definitions |
| `src/components/ItemCapture/index.ts` | Export `useMediaEditor` hook | Public API |

### Files to Reference (Read-Only)

| File Path | Reference Purpose |
|-----------|-------------------|
| `src/hooks/useQRCodeGeneration.ts` | Pattern reference for async operations, cleanup, Map state |
| `src/hooks/useRegistration.ts` | Pattern reference for state management |
| `src/components/ItemCapture/editors/ImageCropper.tsx` | Understanding crop output format |
| `src/components/ItemCapture/utils/thumbnailGenerator.ts` | Canvas rendering patterns |
| `docs/prd/item-capture-implementation-plan.md` | MediaItem interface, MediaMetadata interface |
| `docs/REQ-036-create-usemediacapture-hook-overview.md` | Sibling hook interface patterns |
| `docs/REQ-041-create-usefileupload-hook-overview.md` | Sibling hook interface patterns |

---

## Error Handling Strategy

### Error Classification

| Error Type | Recovery Strategy | User Guidance |
|------------|-------------------|---------------|
| Preview Generation Failed | Recoverable | "Tap to retry preview" |
| Confirm Failed | Recoverable | "Try again" with retry button |
| Invalid Crop Bounds | Auto-corrected | Clamp values, show warning |
| Invalid Trim Points | Blocking | Must adjust selection |
| Max Sessions Exceeded | Blocking | Must finish other edits first |
| Session Not Found | Non-recoverable | Internal error, log only |
| Unsupported Media Type | Non-recoverable | Show unsupported message |

### Error Message Format

Following established patterns from sibling hooks:

```typescript
{
  code: 'PREVIEW_GENERATION_FAILED',
  message: 'Could not generate preview for this image',
  action: 'Tap to try again',
  recoverable: true
}
```

---

## Testing Strategy

### Unit Test Coverage

| Test Case | Description |
|-----------|-------------|
| Session Management | Start, end, cancel sessions correctly |
| Crop Tracking | Crop descriptor stored and applied correctly |
| Rotation Tracking | Rotation degrees normalized to valid values |
| Trim Tracking | Trim points validated against duration |
| Dirty State | isDirty updates correctly on edit changes |
| Preview Generation | Preview URL created and cached |
| Edit Confirmation | Blob and metadata produced correctly |
| Cancellation | Original preserved, session cleared |
| Memory Cleanup | All URLs revoked on unmount |

### Integration Test Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| Full Edit Cycle | Start → Crop → Rotate → Confirm | Edited blob with metadata |
| Cancel After Edits | Start → Crop → Cancel | Session removed, original unchanged |
| Multiple Sessions | Edit 3 items → Confirm each | Each produces correct result |
| Preview Regeneration | Edit → Wait for preview → Edit again | New preview generated |
| Video Trim Metadata | Start → Set trim → Confirm | Metadata has trimStart/trimEnd |

### Manual Testing Matrix

| Platform | Browser | Priority |
|----------|---------|----------|
| iOS 16+ | Safari | High |
| Android | Chrome | High |
| Desktop | Chrome | Medium |
| Desktop | Firefox | Medium |
| Desktop | Edge | Low |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Memory leak from preview URLs | Medium | High | Ref tracking + cleanup on unmount |
| Canvas rendering inconsistencies | Medium | Medium | Test on target browsers |
| Large image OOM during edit | Low | High | Constrain preview dimensions |
| Race conditions on rapid edits | Medium | Medium | Debounce preview generation |
| Video trim metadata lost | Low | High | Clear integration contract with parent |

---

## Open Questions

1. **Preview caching strategy:** Should previews be cached aggressively or regenerated on each access?
   - **Recommendation:** Cache until edit state changes; invalidate on any edit operation

2. **Video trim encoding:** Should V1 include basic client-side trim, or defer entirely to server?
   - **Recommendation:** Defer to server per implementation plan; store trim metadata only

3. **Undo/redo support:** Should the hook support multi-level undo?
   - **Recommendation:** Single-level reset per edit type in V1; full undo/redo in V2

4. **Edit history persistence:** Should edit state survive page refresh (localStorage)?
   - **Recommendation:** No persistence in V1; fresh state on remount

---

## Success Criteria

Based on REQ-046 Acceptance Criteria:

- [ ] Each media item can be placed into an edit state independently of other items
- [ ] Original media data is preserved and never modified until user confirms changes
- [ ] All edit operations are tracked as a changeset that can be inspected or discarded
- [ ] Users can cancel editing to immediately return to the original media
- [ ] Confirming edits applies the changeset and updates the media item
- [ ] The system indicates visually which items have pending (unconfirmed) edits
- [ ] Multiple media items can have pending edits simultaneously without conflict

Additional Technical Criteria:

- [ ] No memory leaks from unreleased Object URLs
- [ ] Hook returns stable references (memoized callbacks)
- [ ] All state updates guarded against unmounted component
- [ ] TypeScript types correctly infer all return values
- [ ] Preview generation works for both images and videos
- [ ] Integration with ImageCropper, ImageRotator, VideoTrimmer components

---

## Integration with ItemCapture

### Usage Pattern in MediaEditorStep

```tsx
// MediaEditorStep.tsx (Task 4.5)
import { useMediaEditor } from '../hooks/useMediaEditor';
import { useItemCaptureContext } from '../hooks/useItemCaptureState';
import ImageCropper from '../editors/ImageCropper';
import ImageRotator from '../editors/ImageRotator';
import VideoTrimmer from '../editors/VideoTrimmer';

export function MediaEditorStep({ mediaId }: { mediaId: string }) {
  const { state, dispatch } = useItemCaptureContext();
  const mediaItem = state.mediaItems.find(m => m.id === mediaId);

  const {
    getEditState,
    startEditing,
    setCrop,
    setRotation,
    setTrim,
    getEditPreview,
    confirmEdits,
    cancelEdits,
    hasPendingEdits
  } = useMediaEditor({
    onEditsConfirmed: (id, result) => {
      if (result.success) {
        dispatch({
          type: 'UPDATE_MEDIA',
          payload: {
            id,
            updates: {
              file: result.editedBlob ?? mediaItem?.file,
              metadata: result.editedMetadata
            }
          }
        });
      }
    }
  });

  // Start editing session on mount
  useEffect(() => {
    if (mediaItem) {
      startEditing(mediaId, mediaItem);
    }
    return () => cancelEdits(mediaId);
  }, [mediaId]);

  const editState = getEditState(mediaId);
  const previewUrl = editState?.previewUrl;

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
        {previewUrl ? (
          <img src={previewUrl} alt="Edit preview" className="w-full h-full object-contain" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Generating preview...
          </div>
        )}
      </div>

      {/* Editor components based on media type */}
      {mediaItem?.type === 'image' && (
        <>
          <ImageCropper
            imageSrc={URL.createObjectURL(mediaItem.file)}
            crop={editState?.crop ?? undefined}
            onCropChange={(crop) => setCrop(mediaId, crop)}
          />
          <ImageRotator
            rotation={editState?.rotation ?? 0}
            onRotate={(degrees) => setRotation(mediaId, degrees)}
          />
        </>
      )}

      {mediaItem?.type === 'video' && (
        <VideoTrimmer
          videoSrc={URL.createObjectURL(mediaItem.file)}
          duration={mediaItem.metadata.duration ?? 0}
          trim={editState?.trim ?? undefined}
          onTrimChange={(trim) => setTrim(mediaId, trim)}
        />
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => cancelEdits(mediaId)}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Cancel
        </button>
        <button
          onClick={() => confirmEdits(mediaId)}
          disabled={!hasPendingEdits(mediaId)}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Apply Changes
        </button>
      </div>
    </div>
  );
}
```

---

## References

- [Canvas API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [HTMLVideoElement - MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement)
- [URL.createObjectURL - MDN](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL)
- [react-image-crop](https://github.com/DominicTobias/react-image-crop) - Crop format reference
- [Implementation Plan](/docs/prd/item-capture-implementation-plan.md)
- [useQRCodeGeneration.ts](/src/hooks/useQRCodeGeneration.ts) - Hook pattern reference
- [REQ-036 useMediaCapture Overview](/docs/REQ-036-create-usemediacapture-hook-overview.md) - Sibling hook reference
- [REQ-041 useFileUpload Overview](/docs/REQ-041-create-usefileupload-hook-overview.md) - Sibling hook reference
