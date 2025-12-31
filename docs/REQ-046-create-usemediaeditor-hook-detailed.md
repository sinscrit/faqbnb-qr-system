# REQ-046: Create useMediaEditor Hook - Detailed Task Breakdown

**Generated:** 2025-12-31 09:10:19 CET
**Last Modified:** 2025-12-31 09:10:19 CET
**Overview Document:** `/docs/REQ-046-create-usemediaeditor-hook-overview.md`
**Request Reference:** REQ-046 in `/docs/gen_requests.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 4 - Editing Features
**Task ID:** 4.1

---

## Executive Summary

This document provides a granular, step-by-step task breakdown for implementing the `useMediaEditor` hook. The hook manages non-destructive editing state for media items (photos and videos) within the ItemCapture component, tracking edit operations (crop, rotate, trim) as a changeset that can be previewed in real-time, confirmed, or discarded.

Each task is scoped to approximately 1 story point (a few hours of focused work) and includes verification steps to ensure quality implementation.

---

## Prerequisites

Before starting implementation, verify:

- [ ] Phase 1 (Foundation) is complete
- [ ] Phase 2 (Media Capture) OR Phase 3 (File Upload) is complete (need media items to edit)
- [ ] Directory structure exists: `src/components/ItemCapture/hooks/`
- [ ] `ItemCapture.types.ts` exists with base `MediaItem` interface
- [ ] Familiarity with existing hook patterns in `src/hooks/useQRCodeGeneration.ts`

---

## Authorized Files for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/hooks/useMediaEditor.ts` | Main hook implementation |

### Files to Modify

| File Path | Modification | Reason |
|-----------|--------------|--------|
| `src/components/ItemCapture/ItemCapture.types.ts` | Add type interfaces for useMediaEditor | Type definitions |
| `src/components/ItemCapture/index.ts` | Export useMediaEditor hook | Public API exposure |

### Files for Reference (Read-Only)

| File Path | Reference Purpose |
|-----------|-------------------|
| `src/hooks/useQRCodeGeneration.ts` | Pattern reference for Map state, async operations, cleanup |
| `src/hooks/useRegistration.ts` | Pattern reference for state management |
| `docs/prd/item-capture-implementation-plan.md` | MediaItem interface, architecture context |

---

## Task Breakdown

### Task 4.1.1: Define TypeScript Interfaces in ItemCapture.types.ts

**Estimated Effort:** 30 minutes
**Dependencies:** None (can start immediately)
**Parallelizable With:** None

#### Description

Add all TypeScript interfaces required for the useMediaEditor hook to the existing `ItemCapture.types.ts` file. This establishes the contract for the hook before implementation.

#### Implementation Steps

1. Open `src/components/ItemCapture/ItemCapture.types.ts`

2. Add the following interfaces at the appropriate location in the file:

   ```typescript
   // === useMediaEditor Hook Types ===

   /**
    * Configuration options for useMediaEditor hook
    */
   export interface UseMediaEditorOptions {
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

   /**
    * Current edit state for a media item
    */
   export interface MediaEditState {
     mediaId: string;
     originalMedia: MediaItem;
     crop: CropDescriptor | null;
     rotation: RotationDegrees;
     trim: TrimDescriptor | null;
     previewUrl: string | null;
     isGeneratingPreview: boolean;
     isDirty: boolean;
     startedAt: Date;
     lastModifiedAt: Date;
   }

   /**
    * Descriptor for crop operation (percentages 0-100)
    */
   export interface CropDescriptor {
     x: number;
     y: number;
     width: number;
     height: number;
     aspectRatio?: number;
   }

   /**
    * Rotation in 90-degree increments
    */
   export type RotationDegrees = 0 | 90 | 180 | 270;

   /**
    * Descriptor for video trim operation
    */
   export interface TrimDescriptor {
     startTime: number;
     endTime: number;
     originalDuration: number;
   }

   /**
    * Types of edits supported
    */
   export type EditType = 'crop' | 'rotation' | 'trim';

   /**
    * Result of confirming edits
    */
   export interface EditConfirmationResult {
     success: boolean;
     editedBlob?: Blob;
     editedMetadata: MediaMetadata;
     appliedEdits: EditSummary;
     error?: string;
   }

   /**
    * Summary of edits applied to a media item
    */
   export interface EditSummary {
     cropped: boolean;
     rotated: RotationDegrees;
     trimmed: TrimDescriptor | null;
     editCount: number;
   }

   /**
    * Error codes for editor operations
    */
   export type MediaEditorErrorCode =
     | 'PREVIEW_GENERATION_FAILED'
     | 'CONFIRM_FAILED'
     | 'INVALID_CROP_BOUNDS'
     | 'INVALID_TRIM_POINTS'
     | 'MAX_SESSIONS_EXCEEDED'
     | 'SESSION_NOT_FOUND'
     | 'UNSUPPORTED_MEDIA_TYPE';

   /**
    * Error for editor operations
    */
   export interface MediaEditorError {
     code: MediaEditorErrorCode;
     message: string;
     action: string;
     recoverable: boolean;
   }

   /**
    * Return value from useMediaEditor hook
    */
   export interface UseMediaEditorReturn {
     // Edit State
     editSessions: Map<string, MediaEditState>;
     getEditState: (mediaId: string) => MediaEditState | null;
     hasPendingEdits: (mediaId: string) => boolean;
     getPendingEditIds: () => string[];
     hasAnyPendingEdits: boolean;

     // Edit Actions
     startEditing: (mediaId: string, originalMedia: MediaItem) => void;
     setCrop: (mediaId: string, crop: CropDescriptor | null) => void;
     setRotation: (mediaId: string, degrees: RotationDegrees) => void;
     setTrim: (mediaId: string, trim: TrimDescriptor | null) => void;
     resetEdit: (mediaId: string, editType: EditType) => void;
     resetAllEdits: (mediaId: string) => void;

     // Preview Generation
     getEditPreview: (mediaId: string) => Promise<string | null>;
     isGeneratingPreview: (mediaId: string) => boolean;
     regeneratePreview: (mediaId: string) => Promise<void>;

     // Confirmation / Cancellation
     confirmEdits: (mediaId: string) => Promise<EditConfirmationResult>;
     cancelEdits: (mediaId: string) => void;
     endEditing: (mediaId: string) => void;

     // Utility
     getEditSummary: (mediaId: string) => EditSummary | null;
     hasEdit: (mediaId: string, editType: EditType) => boolean;
     clearAllSessions: () => void;

     // Error State
     getError: (mediaId: string) => MediaEditorError | null;
     clearError: (mediaId: string) => void;
   }
   ```

#### Verification Steps

1. Run TypeScript compiler to verify no type errors:
   ```bash
   npx tsc --noEmit
   ```

2. Verify all interfaces are exported from the file

3. Check that interfaces align with overview document specifications

#### Acceptance Criteria

- [ ] All interfaces defined match the overview document
- [ ] TypeScript compiles without errors
- [ ] Interfaces are properly exported

---

### Task 4.1.2: Create Hook File with Base Structure and State Management

**Estimated Effort:** 45 minutes
**Dependencies:** Task 4.1.1
**Parallelizable With:** None

#### Description

Create the `useMediaEditor.ts` hook file with the base structure, Map-based state management, and core lifecycle methods (start/end editing sessions).

#### Implementation Steps

1. Create file `src/components/ItemCapture/hooks/useMediaEditor.ts`

2. Add the hook skeleton with imports and state setup:

   ```typescript
   'use client';

   import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
   import type {
     UseMediaEditorOptions,
     UseMediaEditorReturn,
     MediaEditState,
     MediaItem,
     CropDescriptor,
     RotationDegrees,
     TrimDescriptor,
     EditType,
     EditSummary,
     EditConfirmationResult,
     MediaEditorError,
     MediaEditorErrorCode,
   } from '../ItemCapture.types';

   /**
    * Default options for the hook
    */
   const DEFAULT_OPTIONS: Required<Omit<UseMediaEditorOptions, 'onEditStateChange' | 'onEditsConfirmed' | 'onEditsCancelled'>> = {
     maxConcurrentEdits: 5,
     autoGeneratePreview: true,
     previewQuality: 0.8,
     maxPreviewSize: { width: 800, height: 800 },
     debug: false,
   };

   /**
    * Custom hook for non-destructive media editing state management
    */
   export function useMediaEditor(options: UseMediaEditorOptions = {}): UseMediaEditorReturn {
     const {
       maxConcurrentEdits = DEFAULT_OPTIONS.maxConcurrentEdits,
       autoGeneratePreview = DEFAULT_OPTIONS.autoGeneratePreview,
       previewQuality = DEFAULT_OPTIONS.previewQuality,
       maxPreviewSize = DEFAULT_OPTIONS.maxPreviewSize,
       onEditStateChange,
       onEditsConfirmed,
       onEditsCancelled,
       debug = DEFAULT_OPTIONS.debug,
     } = options;

     // === Core State ===
     const [editSessions, setEditSessions] = useState<Map<string, MediaEditState>>(new Map());
     const [errors, setErrors] = useState<Map<string, MediaEditorError>>(new Map());

     // === Refs for Memory Management ===
     const previewUrlsRef = useRef<Map<string, string>>(new Map());
     const isUnmountedRef = useRef(false);
     const debounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

     // === Cleanup on Unmount ===
     useEffect(() => {
       return () => {
         isUnmountedRef.current = true;

         // Revoke all preview URLs
         previewUrlsRef.current.forEach((url) => {
           URL.revokeObjectURL(url);
         });
         previewUrlsRef.current.clear();

         // Clear all debounce timers
         debounceTimersRef.current.forEach((timer) => {
           clearTimeout(timer);
         });
         debounceTimersRef.current.clear();
       };
     }, []);

     // === Debug Logging Helper ===
     const log = useCallback(
       (message: string, ...args: unknown[]) => {
         if (debug) {
           console.log(`[useMediaEditor] ${message}`, ...args);
         }
       },
       [debug]
     );

     // Placeholder implementations - to be completed in subsequent tasks
     // ... (full implementation in tasks 4.1.3 - 4.1.11)

     return {
       editSessions,
       getEditState: () => null,
       hasPendingEdits: () => false,
       getPendingEditIds: () => [],
       hasAnyPendingEdits: false,
       startEditing: () => {},
       setCrop: () => {},
       setRotation: () => {},
       setTrim: () => {},
       resetEdit: () => {},
       resetAllEdits: () => {},
       getEditPreview: async () => null,
       isGeneratingPreview: () => false,
       regeneratePreview: async () => {},
       confirmEdits: async () => ({
         success: false,
         editedMetadata: {} as any,
         appliedEdits: { cropped: false, rotated: 0, trimmed: null, editCount: 0 },
         error: 'Not implemented',
       }),
       cancelEdits: () => {},
       endEditing: () => {},
       getEditSummary: () => null,
       hasEdit: () => false,
       clearAllSessions: () => {},
       getError: () => null,
       clearError: () => {},
     };
   }
   ```

3. Implement `startEditing` function:

   ```typescript
   const startEditing = useCallback(
     (mediaId: string, originalMedia: MediaItem) => {
       if (isUnmountedRef.current) return;

       // Check max concurrent edits
       if (editSessions.size >= maxConcurrentEdits && !editSessions.has(mediaId)) {
         setErrors((prev) => {
           const newMap = new Map(prev);
           newMap.set(mediaId, {
             code: 'MAX_SESSIONS_EXCEEDED',
             message: `Maximum of ${maxConcurrentEdits} items can be edited at once`,
             action: 'Finish editing another item first',
             recoverable: true,
           });
           return newMap;
         });
         log(`Max sessions exceeded for ${mediaId}`);
         return;
       }

       setEditSessions((prev) => {
         const newMap = new Map(prev);
         const now = new Date();

         newMap.set(mediaId, {
           mediaId,
           originalMedia,
           crop: null,
           rotation: 0,
           trim: null,
           previewUrl: null,
           isGeneratingPreview: false,
           isDirty: false,
           startedAt: now,
           lastModifiedAt: now,
         });

         return newMap;
       });

       log(`Started editing session for ${mediaId}`);
     },
     [editSessions.size, maxConcurrentEdits, log]
   );
   ```

4. Implement `getEditState` function:

   ```typescript
   const getEditState = useCallback(
     (mediaId: string): MediaEditState | null => {
       return editSessions.get(mediaId) ?? null;
     },
     [editSessions]
   );
   ```

5. Implement `endEditing` function:

   ```typescript
   const endEditing = useCallback(
     (mediaId: string) => {
       if (isUnmountedRef.current) return;

       setEditSessions((prev) => {
         const newMap = new Map(prev);
         newMap.delete(mediaId);
         return newMap;
       });

       // Clear preview URL if exists
       const previewUrl = previewUrlsRef.current.get(mediaId);
       if (previewUrl) {
         URL.revokeObjectURL(previewUrl);
         previewUrlsRef.current.delete(mediaId);
       }

       log(`Ended editing session for ${mediaId}`);
     },
     [log]
   );
   ```

6. Implement `clearAllSessions` function:

   ```typescript
   const clearAllSessions = useCallback(() => {
     if (isUnmountedRef.current) return;

     // Revoke all preview URLs
     previewUrlsRef.current.forEach((url) => {
       URL.revokeObjectURL(url);
     });
     previewUrlsRef.current.clear();

     // Clear all sessions
     setEditSessions(new Map());
     setErrors(new Map());

     log('Cleared all edit sessions');
   }, [log]);
   ```

#### Verification Steps

1. Run TypeScript compiler:
   ```bash
   npx tsc --noEmit
   ```

2. Verify hook can be imported without errors:
   ```typescript
   import { useMediaEditor } from '@/components/ItemCapture/hooks/useMediaEditor';
   ```

3. Check that `startEditing` correctly initializes a new session

#### Acceptance Criteria

- [ ] Hook file created with proper structure
- [ ] State management using Map is functional
- [ ] `startEditing` creates new session with correct initial state
- [ ] `endEditing` removes session and cleans up preview URLs
- [ ] Cleanup on unmount revokes all Object URLs
- [ ] Debug logging works when enabled

---

### Task 4.1.3: Implement Crop Edit Tracking

**Estimated Effort:** 30 minutes
**Dependencies:** Task 4.1.2
**Parallelizable With:** Task 4.1.4, Task 4.1.5

#### Description

Implement the `setCrop` function that tracks crop edit descriptors for media items, including validation of crop bounds.

#### Implementation Steps

1. Add validation helper function:

   ```typescript
   /**
    * Validate crop bounds are within valid range
    */
   const validateCropBounds = (crop: CropDescriptor): { valid: boolean; message: string } => {
     if (crop.x < 0 || crop.x > 100) {
       return { valid: false, message: 'Crop X position must be between 0 and 100' };
     }
     if (crop.y < 0 || crop.y > 100) {
       return { valid: false, message: 'Crop Y position must be between 0 and 100' };
     }
     if (crop.width <= 0 || crop.width > 100) {
       return { valid: false, message: 'Crop width must be between 0 and 100' };
     }
     if (crop.height <= 0 || crop.height > 100) {
       return { valid: false, message: 'Crop height must be between 0 and 100' };
     }
     if (crop.x + crop.width > 100) {
       return { valid: false, message: 'Crop area extends beyond image width' };
     }
     if (crop.y + crop.height > 100) {
       return { valid: false, message: 'Crop area extends beyond image height' };
     }
     return { valid: true, message: '' };
   };
   ```

2. Add helper to calculate dirty state:

   ```typescript
   /**
    * Calculate if session has any pending edits
    */
   const calculateIsDirty = (
     crop: CropDescriptor | null,
     rotation: RotationDegrees,
     trim: TrimDescriptor | null
   ): boolean => {
     return crop !== null || rotation !== 0 || trim !== null;
   };
   ```

3. Implement `setCrop` function:

   ```typescript
   const setCrop = useCallback(
     (mediaId: string, crop: CropDescriptor | null) => {
       if (isUnmountedRef.current) return;

       setEditSessions((prev) => {
         const session = prev.get(mediaId);
         if (!session) {
           log(`No edit session for ${mediaId}`);
           return prev;
         }

         // Validate crop bounds if provided
         if (crop) {
           const validation = validateCropBounds(crop);
           if (!validation.valid) {
             setErrors((errPrev) => {
               const newMap = new Map(errPrev);
               newMap.set(mediaId, {
                 code: 'INVALID_CROP_BOUNDS',
                 message: validation.message,
                 action: 'Adjust the crop selection',
                 recoverable: true,
               });
               return newMap;
             });
             return prev;
           }
         }

         const newMap = new Map(prev);
         const now = new Date();

         newMap.set(mediaId, {
           ...session,
           crop,
           isDirty: calculateIsDirty(crop, session.rotation, session.trim),
           lastModifiedAt: now,
           // Invalidate cached preview
           previewUrl: null,
         });

         return newMap;
       });

       // Clear any existing error for this field
       setErrors((prev) => {
         if (prev.has(mediaId) && prev.get(mediaId)?.code === 'INVALID_CROP_BOUNDS') {
           const newMap = new Map(prev);
           newMap.delete(mediaId);
           return newMap;
         }
         return prev;
       });

       log(`Set crop for ${mediaId}:`, crop);

       // Trigger callback if provided
       const session = editSessions.get(mediaId);
       if (session) {
         onEditStateChange?.(mediaId, { ...session, crop });
       }
     },
     [editSessions, onEditStateChange, log]
   );
   ```

#### Verification Steps

1. Test that `setCrop` updates session state correctly
2. Test that invalid crop bounds are rejected with proper error
3. Test that `isDirty` is updated when crop is set/unset
4. Verify preview URL is invalidated on crop change

#### Acceptance Criteria

- [ ] `setCrop` validates crop bounds (0-100 range)
- [ ] Invalid crop bounds set appropriate error
- [ ] `isDirty` correctly reflects presence of crop
- [ ] `lastModifiedAt` updates on change
- [ ] Preview URL invalidated on crop change
- [ ] Callback fired with new state

---

### Task 4.1.4: Implement Rotation Edit Tracking

**Estimated Effort:** 30 minutes
**Dependencies:** Task 4.1.2
**Parallelizable With:** Task 4.1.3, Task 4.1.5

#### Description

Implement the `setRotation` function that tracks rotation edits, ensuring only valid rotation values (0, 90, 180, 270) are accepted.

#### Implementation Steps

1. Add rotation validation helper:

   ```typescript
   /**
    * Valid rotation values
    */
   const VALID_ROTATIONS: RotationDegrees[] = [0, 90, 180, 270];

   /**
    * Validate rotation value
    */
   const isValidRotation = (degrees: number): degrees is RotationDegrees => {
     return VALID_ROTATIONS.includes(degrees as RotationDegrees);
   };
   ```

2. Implement `setRotation` function:

   ```typescript
   const setRotation = useCallback(
     (mediaId: string, degrees: RotationDegrees) => {
       if (isUnmountedRef.current) return;

       // Validate rotation value
       if (!isValidRotation(degrees)) {
         log(`Invalid rotation value: ${degrees}`);
         return;
       }

       setEditSessions((prev) => {
         const session = prev.get(mediaId);
         if (!session) {
           log(`No edit session for ${mediaId}`);
           return prev;
         }

         const newMap = new Map(prev);
         const now = new Date();

         newMap.set(mediaId, {
           ...session,
           rotation: degrees,
           isDirty: calculateIsDirty(session.crop, degrees, session.trim),
           lastModifiedAt: now,
           // Invalidate cached preview
           previewUrl: null,
         });

         return newMap;
       });

       log(`Set rotation for ${mediaId}: ${degrees} degrees`);

       // Trigger callback if provided
       const session = editSessions.get(mediaId);
       if (session) {
         onEditStateChange?.(mediaId, { ...session, rotation: degrees });
       }
     },
     [editSessions, onEditStateChange, log]
   );
   ```

#### Verification Steps

1. Test that `setRotation` only accepts 0, 90, 180, 270
2. Test that invalid values are silently rejected
3. Test that `isDirty` updates correctly (true when not 0)
4. Verify preview URL is invalidated on rotation change

#### Acceptance Criteria

- [ ] Only valid rotation values (0, 90, 180, 270) are accepted
- [ ] Invalid rotation values are rejected
- [ ] `isDirty` correctly reflects non-zero rotation
- [ ] `lastModifiedAt` updates on change
- [ ] Preview URL invalidated on rotation change

---

### Task 4.1.5: Implement Trim Edit Tracking (Video Only)

**Estimated Effort:** 30 minutes
**Dependencies:** Task 4.1.2
**Parallelizable With:** Task 4.1.3, Task 4.1.4

#### Description

Implement the `setTrim` function for video media items, including validation that trim points are within the video duration.

#### Implementation Steps

1. Add trim validation helper:

   ```typescript
   /**
    * Validate trim points are within video duration
    */
   const validateTrimPoints = (trim: TrimDescriptor): { valid: boolean; message: string } => {
     if (trim.startTime < 0) {
       return { valid: false, message: 'Start time cannot be negative' };
     }
     if (trim.endTime <= trim.startTime) {
       return { valid: false, message: 'End time must be after start time' };
     }
     if (trim.endTime > trim.originalDuration) {
       return { valid: false, message: 'End time exceeds video duration' };
     }
     // Minimum trim duration of 1 second
     if (trim.endTime - trim.startTime < 1) {
       return { valid: false, message: 'Trimmed video must be at least 1 second' };
     }
     return { valid: true, message: '' };
   };
   ```

2. Implement `setTrim` function:

   ```typescript
   const setTrim = useCallback(
     (mediaId: string, trim: TrimDescriptor | null) => {
       if (isUnmountedRef.current) return;

       setEditSessions((prev) => {
         const session = prev.get(mediaId);
         if (!session) {
           log(`No edit session for ${mediaId}`);
           return prev;
         }

         // Only allow trim for video
         if (session.originalMedia.type !== 'video') {
           log(`Cannot trim non-video media: ${mediaId}`);
           setErrors((errPrev) => {
             const newMap = new Map(errPrev);
             newMap.set(mediaId, {
               code: 'UNSUPPORTED_MEDIA_TYPE',
               message: 'Trim is only available for video content',
               action: 'Select a video to trim',
               recoverable: false,
             });
             return newMap;
           });
           return prev;
         }

         // Validate trim points if provided
         if (trim) {
           const validation = validateTrimPoints(trim);
           if (!validation.valid) {
             setErrors((errPrev) => {
               const newMap = new Map(errPrev);
               newMap.set(mediaId, {
                 code: 'INVALID_TRIM_POINTS',
                 message: validation.message,
                 action: 'Adjust the trim selection',
                 recoverable: true,
               });
               return newMap;
             });
             return prev;
           }
         }

         const newMap = new Map(prev);
         const now = new Date();

         newMap.set(mediaId, {
           ...session,
           trim,
           isDirty: calculateIsDirty(session.crop, session.rotation, trim),
           lastModifiedAt: now,
           // Invalidate cached preview
           previewUrl: null,
         });

         return newMap;
       });

       // Clear any existing trim error
       setErrors((prev) => {
         if (prev.has(mediaId) && prev.get(mediaId)?.code === 'INVALID_TRIM_POINTS') {
           const newMap = new Map(prev);
           newMap.delete(mediaId);
           return newMap;
         }
         return prev;
       });

       log(`Set trim for ${mediaId}:`, trim);

       // Trigger callback if provided
       const session = editSessions.get(mediaId);
       if (session) {
         onEditStateChange?.(mediaId, { ...session, trim });
       }
     },
     [editSessions, onEditStateChange, log]
   );
   ```

#### Verification Steps

1. Test that `setTrim` only works for video media items
2. Test that invalid trim points are rejected
3. Test minimum trim duration validation (1 second)
4. Verify appropriate error is set for non-video media

#### Acceptance Criteria

- [ ] `setTrim` only works for video media type
- [ ] Invalid trim points are rejected with appropriate error
- [ ] Minimum 1-second trim duration enforced
- [ ] Error set when trying to trim non-video media
- [ ] `isDirty` correctly reflects presence of trim

---

### Task 4.1.6: Implement Image Preview Generation

**Estimated Effort:** 1.5 hours
**Dependencies:** Task 4.1.3, Task 4.1.4
**Parallelizable With:** Task 4.1.7

#### Description

Implement Canvas-based preview generation for images with crop and rotation applied.

#### Implementation Steps

1. Add image loading helper:

   ```typescript
   /**
    * Load image from File/Blob into HTMLImageElement
    */
   const loadImage = (source: File | Blob): Promise<HTMLImageElement> => {
     return new Promise((resolve, reject) => {
       const img = new Image();
       const url = URL.createObjectURL(source);

       img.onload = () => {
         URL.revokeObjectURL(url);
         resolve(img);
       };
       img.onerror = () => {
         URL.revokeObjectURL(url);
         reject(new Error('Failed to load image'));
       };
       img.src = url;
     });
   };
   ```

2. Add image preview generation function:

   ```typescript
   /**
    * Generate preview for image with crop and rotation applied
    */
   const generateImagePreview = async (
     session: MediaEditState,
     quality: number,
     maxSize: { width: number; height: number }
   ): Promise<string | null> => {
     const { originalMedia, crop, rotation } = session;

     try {
       // Load original image
       const img = await loadImage(originalMedia.file);

       // Create canvas for preview
       const canvas = document.createElement('canvas');
       const ctx = canvas.getContext('2d');
       if (!ctx) throw new Error('Canvas context unavailable');

       // Calculate source dimensions (from crop or full image)
       let srcX = 0;
       let srcY = 0;
       let srcWidth = img.width;
       let srcHeight = img.height;

       if (crop) {
         srcX = (crop.x / 100) * img.width;
         srcY = (crop.y / 100) * img.height;
         srcWidth = (crop.width / 100) * img.width;
         srcHeight = (crop.height / 100) * img.height;
       }

       // Calculate canvas size (considering rotation)
       const isRotated90or270 = rotation === 90 || rotation === 270;
       let canvasWidth = isRotated90or270 ? srcHeight : srcWidth;
       let canvasHeight = isRotated90or270 ? srcWidth : srcHeight;

       // Constrain to max preview size
       const scale = Math.min(
         maxSize.width / canvasWidth,
         maxSize.height / canvasHeight,
         1
       );
       canvas.width = canvasWidth * scale;
       canvas.height = canvasHeight * scale;

       // Apply transforms and draw
       ctx.save();
       ctx.translate(canvas.width / 2, canvas.height / 2);
       ctx.rotate((rotation * Math.PI) / 180);

       // Draw image centered (accounting for rotation)
       if (isRotated90or270) {
         ctx.drawImage(
           img,
           srcX, srcY, srcWidth, srcHeight,
           -canvas.height / 2, -canvas.width / 2,
           canvas.height, canvas.width
         );
       } else {
         ctx.drawImage(
           img,
           srcX, srcY, srcWidth, srcHeight,
           -canvas.width / 2, -canvas.height / 2,
           canvas.width, canvas.height
         );
       }
       ctx.restore();

       // Convert to blob URL
       return new Promise<string | null>((resolve) => {
         canvas.toBlob(
           (blob) => {
             if (blob) {
               const url = URL.createObjectURL(blob);
               resolve(url);
             } else {
               resolve(null);
             }
           },
           'image/jpeg',
           quality
         );
       });
     } catch (error) {
       console.error('[useMediaEditor] Image preview generation failed:', error);
       return null;
     }
   };
   ```

3. Add debounced preview generation:

   ```typescript
   /**
    * Debounced preview generation wrapper
    */
   const generatePreviewDebounced = useCallback(
     (mediaId: string) => {
       // Clear existing timer
       const existingTimer = debounceTimersRef.current.get(mediaId);
       if (existingTimer) {
         clearTimeout(existingTimer);
       }

       // Set new timer
       const timer = setTimeout(async () => {
         if (isUnmountedRef.current) return;

         const session = editSessions.get(mediaId);
         if (!session) return;

         // Mark as generating
         setEditSessions((prev) => {
           const s = prev.get(mediaId);
           if (!s) return prev;
           const newMap = new Map(prev);
           newMap.set(mediaId, { ...s, isGeneratingPreview: true });
           return newMap;
         });

         let previewUrl: string | null = null;

         if (session.originalMedia.type === 'image') {
           previewUrl = await generateImagePreview(session, previewQuality, maxPreviewSize);
         } else if (session.originalMedia.type === 'video') {
           previewUrl = await generateVideoPreview(session, previewQuality, maxPreviewSize);
         }

         if (isUnmountedRef.current) {
           if (previewUrl) URL.revokeObjectURL(previewUrl);
           return;
         }

         // Revoke old preview URL if exists
         const oldUrl = previewUrlsRef.current.get(mediaId);
         if (oldUrl) {
           URL.revokeObjectURL(oldUrl);
         }

         // Store new preview URL
         if (previewUrl) {
           previewUrlsRef.current.set(mediaId, previewUrl);
         } else {
           previewUrlsRef.current.delete(mediaId);
         }

         // Update session
         setEditSessions((prev) => {
           const s = prev.get(mediaId);
           if (!s) return prev;
           const newMap = new Map(prev);
           newMap.set(mediaId, {
             ...s,
             previewUrl,
             isGeneratingPreview: false,
           });
           return newMap;
         });

         log(`Generated preview for ${mediaId}`);
       }, 300); // 300ms debounce

       debounceTimersRef.current.set(mediaId, timer);
     },
     [editSessions, previewQuality, maxPreviewSize, log]
   );
   ```

4. Implement `getEditPreview` function:

   ```typescript
   const getEditPreview = useCallback(
     async (mediaId: string): Promise<string | null> => {
       const session = editSessions.get(mediaId);
       if (!session) return null;

       // Return cached preview if available
       if (session.previewUrl) {
         return session.previewUrl;
       }

       // Generate preview if dirty
       if (session.isDirty) {
         if (session.originalMedia.type === 'image') {
           const url = await generateImagePreview(session, previewQuality, maxPreviewSize);
           if (url && !isUnmountedRef.current) {
             previewUrlsRef.current.set(mediaId, url);
             setEditSessions((prev) => {
               const s = prev.get(mediaId);
               if (!s) return prev;
               const newMap = new Map(prev);
               newMap.set(mediaId, { ...s, previewUrl: url });
               return newMap;
             });
           }
           return url;
         }
         // Video preview handled in Task 4.1.7
       }

       // No edits, return original URL
       return URL.createObjectURL(session.originalMedia.file);
     },
     [editSessions, previewQuality, maxPreviewSize]
   );
   ```

5. Implement `isGeneratingPreview` and `regeneratePreview`:

   ```typescript
   const isGeneratingPreview = useCallback(
     (mediaId: string): boolean => {
       return editSessions.get(mediaId)?.isGeneratingPreview ?? false;
     },
     [editSessions]
   );

   const regeneratePreview = useCallback(
     async (mediaId: string): Promise<void> => {
       generatePreviewDebounced(mediaId);
     },
     [generatePreviewDebounced]
   );
   ```

#### Verification Steps

1. Create test image and verify crop preview is correct
2. Verify rotation preview shows correct orientation
3. Verify combined crop + rotation works correctly
4. Check that preview URL is properly revoked on update
5. Verify debounce prevents excessive regeneration

#### Acceptance Criteria

- [ ] Image preview generated with crop applied correctly
- [ ] Image preview generated with rotation applied correctly
- [ ] Combined crop + rotation preview is correct
- [ ] Preview constrained to maxPreviewSize
- [ ] Preview quality matches configured value
- [ ] Old preview URLs are revoked (memory management)
- [ ] Debounce prevents rapid regeneration

---

### Task 4.1.7: Implement Video Preview Generation (Frame Extraction)

**Estimated Effort:** 1 hour
**Dependencies:** Task 4.1.5
**Parallelizable With:** Task 4.1.6

#### Description

Implement video frame extraction for preview at the trim start point, with rotation applied.

#### Implementation Steps

1. Add video preview generation function:

   ```typescript
   /**
    * Generate preview frame from video with trim and rotation applied
    */
   const generateVideoPreview = async (
     session: MediaEditState,
     quality: number,
     maxSize: { width: number; height: number }
   ): Promise<string | null> => {
     const { originalMedia, trim, rotation } = session;

     try {
       const video = document.createElement('video');
       const url = URL.createObjectURL(originalMedia.file);
       video.src = url;
       video.muted = true;
       video.playsInline = true;

       // Wait for metadata to load
       await new Promise<void>((resolve, reject) => {
         video.onloadedmetadata = () => resolve();
         video.onerror = () => reject(new Error('Failed to load video'));
         setTimeout(() => reject(new Error('Video load timeout')), 10000);
       });

       // Seek to preview point (trim start or beginning)
       const seekTime = trim?.startTime ?? 0;
       video.currentTime = seekTime;

       // Wait for seek to complete
       await new Promise<void>((resolve, reject) => {
         video.onseeked = () => resolve();
         video.onerror = () => reject(new Error('Failed to seek video'));
         setTimeout(() => reject(new Error('Video seek timeout')), 5000);
       });

       // Create canvas for frame capture
       const canvas = document.createElement('canvas');
       const ctx = canvas.getContext('2d');
       if (!ctx) throw new Error('Canvas context unavailable');

       // Calculate canvas size (considering rotation)
       const isRotated90or270 = rotation === 90 || rotation === 270;
       let canvasWidth = isRotated90or270 ? video.videoHeight : video.videoWidth;
       let canvasHeight = isRotated90or270 ? video.videoWidth : video.videoHeight;

       // Constrain to max preview size
       const scale = Math.min(
         maxSize.width / canvasWidth,
         maxSize.height / canvasHeight,
         1
       );
       canvas.width = canvasWidth * scale;
       canvas.height = canvasHeight * scale;

       // Apply transforms and draw frame
       ctx.save();
       ctx.translate(canvas.width / 2, canvas.height / 2);
       ctx.rotate((rotation * Math.PI) / 180);

       if (isRotated90or270) {
         ctx.drawImage(
           video,
           -video.videoWidth * scale / 2,
           -video.videoHeight * scale / 2,
           video.videoWidth * scale,
           video.videoHeight * scale
         );
       } else {
         ctx.drawImage(
           video,
           -canvas.width / 2,
           -canvas.height / 2,
           canvas.width,
           canvas.height
         );
       }
       ctx.restore();

       // Cleanup video element
       URL.revokeObjectURL(url);

       // Convert to blob URL
       return new Promise<string | null>((resolve) => {
         canvas.toBlob(
           (blob) => {
             if (blob) {
               const previewUrl = URL.createObjectURL(blob);
               resolve(previewUrl);
             } else {
               resolve(null);
             }
           },
           'image/jpeg',
           quality
         );
       });
     } catch (error) {
       console.error('[useMediaEditor] Video preview generation failed:', error);
       return null;
     }
   };
   ```

2. Update `getEditPreview` to handle video:

   ```typescript
   // Inside getEditPreview, after image handling
   if (session.originalMedia.type === 'video') {
     const url = await generateVideoPreview(session, previewQuality, maxPreviewSize);
     if (url && !isUnmountedRef.current) {
       previewUrlsRef.current.set(mediaId, url);
       setEditSessions((prev) => {
         const s = prev.get(mediaId);
         if (!s) return prev;
         const newMap = new Map(prev);
         newMap.set(mediaId, { ...s, previewUrl: url });
         return newMap;
       });
     }
     return url;
   }
   ```

#### Verification Steps

1. Test video frame extraction at default position (0s)
2. Test video frame extraction at trim start position
3. Verify rotation is applied to video frame
4. Check timeout handling for slow video loads

#### Acceptance Criteria

- [ ] Video frame extracted at correct position (trim start or 0)
- [ ] Rotation applied to video frame preview
- [ ] Preview constrained to maxPreviewSize
- [ ] Video element properly cleaned up
- [ ] Timeout handling for slow/failed video loads

---

### Task 4.1.8: Implement Edit Confirmation for Images

**Estimated Effort:** 1 hour
**Dependencies:** Task 4.1.6
**Parallelizable With:** Task 4.1.9

#### Description

Implement the `confirmEdits` function that applies the changeset to produce a final edited image blob.

#### Implementation Steps

1. Add image edit application function:

   ```typescript
   /**
    * Apply edits to image and produce final blob
    */
   const applyImageEdits = async (
     file: File | Blob,
     crop: CropDescriptor | null,
     rotation: RotationDegrees
   ): Promise<Blob> => {
     const img = await loadImage(file);

     const canvas = document.createElement('canvas');
     const ctx = canvas.getContext('2d');
     if (!ctx) throw new Error('Canvas context unavailable');

     // Calculate source dimensions (from crop or full image)
     let srcX = 0;
     let srcY = 0;
     let srcWidth = img.width;
     let srcHeight = img.height;

     if (crop) {
       srcX = (crop.x / 100) * img.width;
       srcY = (crop.y / 100) * img.height;
       srcWidth = (crop.width / 100) * img.width;
       srcHeight = (crop.height / 100) * img.height;
     }

     // Calculate canvas size (considering rotation)
     const isRotated90or270 = rotation === 90 || rotation === 270;
     canvas.width = isRotated90or270 ? srcHeight : srcWidth;
     canvas.height = isRotated90or270 ? srcWidth : srcHeight;

     // Apply transforms and draw
     ctx.save();
     ctx.translate(canvas.width / 2, canvas.height / 2);
     ctx.rotate((rotation * Math.PI) / 180);

     if (isRotated90or270) {
       ctx.drawImage(
         img,
         srcX, srcY, srcWidth, srcHeight,
         -canvas.height / 2, -canvas.width / 2,
         canvas.height, canvas.width
       );
     } else {
       ctx.drawImage(
         img,
         srcX, srcY, srcWidth, srcHeight,
         -canvas.width / 2, -canvas.height / 2,
         canvas.width, canvas.height
       );
     }
     ctx.restore();

     // Convert to blob (maintain quality)
     return new Promise<Blob>((resolve, reject) => {
       canvas.toBlob(
         (blob) => {
           if (blob) {
             resolve(blob);
           } else {
             reject(new Error('Failed to create image blob'));
           }
         },
         'image/jpeg',
         0.92 // High quality for final output
       );
     });
   };
   ```

2. Implement `confirmEdits` function:

   ```typescript
   const confirmEdits = useCallback(
     async (mediaId: string): Promise<EditConfirmationResult> => {
       const session = editSessions.get(mediaId);

       if (!session) {
         return {
           success: false,
           editedMetadata: {} as MediaMetadata,
           appliedEdits: { cropped: false, rotated: 0, trimmed: null, editCount: 0 },
           error: 'No active edit session for this media',
         };
       }

       try {
         const { originalMedia, crop, rotation, trim } = session;

         // Generate edit summary
         const appliedEdits: EditSummary = {
           cropped: crop !== null,
           rotated: rotation,
           trimmed: originalMedia.type === 'video' ? trim : null,
           editCount: (crop ? 1 : 0) + (rotation !== 0 ? 1 : 0) + (trim ? 1 : 0),
         };

         let editedBlob: Blob | undefined;
         let editedMetadata: MediaMetadata = { ...originalMedia.metadata };

         // For images: apply edits and generate final blob
         if (originalMedia.type === 'image') {
           editedBlob = await applyImageEdits(originalMedia.file, crop, rotation);

           // Update metadata with edit info and new dimensions
           editedMetadata = {
             ...editedMetadata,
             fileSize: editedBlob.size,
             edits: {
               cropped: crop !== null,
               rotated: rotation,
             },
           };

           // Calculate new dimensions if rotated
           if (originalMedia.metadata.dimensions) {
             const isRotated90or270 = rotation === 90 || rotation === 270;
             if (isRotated90or270) {
               editedMetadata.dimensions = {
                 width: originalMedia.metadata.dimensions.height,
                 height: originalMedia.metadata.dimensions.width,
               };
             }
           }
         }

         // For videos: only store edit metadata (actual trimming deferred to upload)
         if (originalMedia.type === 'video') {
           editedMetadata = {
             ...editedMetadata,
             edits: {
               cropped: crop !== null,
               rotated: rotation,
               trimStart: trim?.startTime,
               trimEnd: trim?.endTime,
             },
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
           appliedEdits,
         };

         onEditsConfirmed?.(mediaId, result);
         log(`Confirmed edits for ${mediaId}`, appliedEdits);

         return result;
       } catch (error) {
         const message = error instanceof Error ? error.message : 'Edit confirmation failed';

         setErrors((prev) => {
           const newMap = new Map(prev);
           newMap.set(mediaId, {
             code: 'CONFIRM_FAILED',
             message,
             action: 'Try again',
             recoverable: true,
           });
           return newMap;
         });

         return {
           success: false,
           error: message,
           editedMetadata: session.originalMedia.metadata,
           appliedEdits: { cropped: false, rotated: 0, trimmed: null, editCount: 0 },
         };
       }
     },
     [editSessions, onEditsConfirmed, log]
   );
   ```

3. Add cleanup helper:

   ```typescript
   /**
    * Clean up an edit session
    */
   const cleanupSession = useCallback((mediaId: string) => {
     // Revoke preview URL
     const previewUrl = previewUrlsRef.current.get(mediaId);
     if (previewUrl) {
       URL.revokeObjectURL(previewUrl);
       previewUrlsRef.current.delete(mediaId);
     }

     // Clear debounce timer
     const timer = debounceTimersRef.current.get(mediaId);
     if (timer) {
       clearTimeout(timer);
       debounceTimersRef.current.delete(mediaId);
     }

     // Remove from sessions
     setEditSessions((prev) => {
       const newMap = new Map(prev);
       newMap.delete(mediaId);
       return newMap;
     });

     // Clear any errors
     setErrors((prev) => {
       const newMap = new Map(prev);
       newMap.delete(mediaId);
       return newMap;
     });
   }, []);
   ```

#### Verification Steps

1. Test image confirmation with crop applied
2. Test image confirmation with rotation applied
3. Test image confirmation with both crop and rotation
4. Verify metadata is correctly updated
5. Verify session is cleaned up after confirmation

#### Acceptance Criteria

- [ ] Image edits (crop + rotation) applied to produce final blob
- [ ] Metadata updated with edit information
- [ ] Edit session cleaned up after confirmation
- [ ] Callback fired with confirmation result
- [ ] Error handling for failed confirmations

---

### Task 4.1.9: Implement Edit Confirmation for Video (Metadata Only V1)

**Estimated Effort:** 30 minutes
**Dependencies:** Task 4.1.7
**Parallelizable With:** Task 4.1.8

#### Description

Implement video edit confirmation that stores trim metadata without actually encoding (deferred to server-side in V1).

#### Implementation Steps

1. Update `confirmEdits` function to handle video (already partially implemented in Task 4.1.8):

   The video handling section in `confirmEdits` already stores trim metadata. Verify the implementation:

   ```typescript
   // Inside confirmEdits, for videos:
   if (originalMedia.type === 'video') {
     editedMetadata = {
       ...editedMetadata,
       edits: {
         cropped: crop !== null,
         rotated: rotation,
         trimStart: trim?.startTime,
         trimEnd: trim?.endTime,
       },
     };

     // For V1: Video blob is passed through unchanged
     // Trim metadata will be used by parent/server for actual trimming
     // No editedBlob for video in V1
   }
   ```

2. Document the video confirmation behavior:

   ```typescript
   /**
    * NOTE: Video Edit Confirmation (V1)
    *
    * In V1, video trimming is NOT performed client-side due to:
    * - Large WASM payload (~25MB for FFmpeg)
    * - Encoding complexity
    * - Performance concerns on mobile
    *
    * Instead, trim metadata is stored in the MediaMetadata.edits object:
    * - trimStart: number (seconds)
    * - trimEnd: number (seconds)
    *
    * The parent application should:
    * 1. Pass the original video file to the server
    * 2. Include trim metadata in the upload request
    * 3. Server performs actual trim using FFmpeg
    *
    * V2 may include client-side encoding using @ffmpeg/ffmpeg
    */
   ```

#### Verification Steps

1. Test video confirmation returns success without editedBlob
2. Verify trim metadata is included in editedMetadata
3. Verify rotation metadata is included for video

#### Acceptance Criteria

- [ ] Video confirmation returns metadata with trim points
- [ ] No actual video encoding performed (V1 limitation documented)
- [ ] Rotation metadata stored for server-side processing

---

### Task 4.1.10: Add Pending Edits Status Tracking

**Estimated Effort:** 30 minutes
**Dependencies:** Tasks 4.1.3, 4.1.4, 4.1.5
**Parallelizable With:** Task 4.1.11

#### Description

Implement functions to check and track pending (unconfirmed) edits status.

#### Implementation Steps

1. Implement `hasPendingEdits` function:

   ```typescript
   const hasPendingEdits = useCallback(
     (mediaId: string): boolean => {
       const session = editSessions.get(mediaId);
       return session?.isDirty ?? false;
     },
     [editSessions]
   );
   ```

2. Implement `getPendingEditIds` function:

   ```typescript
   const getPendingEditIds = useCallback((): string[] => {
     return Array.from(editSessions.entries())
       .filter(([_, session]) => session.isDirty)
       .map(([mediaId]) => mediaId);
   }, [editSessions]);
   ```

3. Implement `hasAnyPendingEdits` computed value:

   ```typescript
   const hasAnyPendingEdits = useMemo(() => {
     return Array.from(editSessions.values()).some((session) => session.isDirty);
   }, [editSessions]);
   ```

4. Implement reset functions:

   ```typescript
   const resetEdit = useCallback(
     (mediaId: string, editType: EditType) => {
       if (isUnmountedRef.current) return;

       setEditSessions((prev) => {
         const session = prev.get(mediaId);
         if (!session) return prev;

         const newMap = new Map(prev);
         const now = new Date();

         let updates: Partial<MediaEditState> = { lastModifiedAt: now };

         switch (editType) {
           case 'crop':
             updates.crop = null;
             break;
           case 'rotation':
             updates.rotation = 0;
             break;
           case 'trim':
             updates.trim = null;
             break;
         }

         const newSession = { ...session, ...updates };
         newSession.isDirty = calculateIsDirty(
           newSession.crop,
           newSession.rotation,
           newSession.trim
         );
         newSession.previewUrl = null; // Invalidate preview

         newMap.set(mediaId, newSession);
         return newMap;
       });

       log(`Reset ${editType} for ${mediaId}`);
     },
     [log]
   );

   const resetAllEdits = useCallback(
     (mediaId: string) => {
       if (isUnmountedRef.current) return;

       setEditSessions((prev) => {
         const session = prev.get(mediaId);
         if (!session) return prev;

         const newMap = new Map(prev);
         const now = new Date();

         newMap.set(mediaId, {
           ...session,
           crop: null,
           rotation: 0,
           trim: null,
           isDirty: false,
           previewUrl: null,
           lastModifiedAt: now,
         });

         return newMap;
       });

       log(`Reset all edits for ${mediaId}`);
     },
     [log]
   );
   ```

5. Implement utility functions:

   ```typescript
   const getEditSummary = useCallback(
     (mediaId: string): EditSummary | null => {
       const session = editSessions.get(mediaId);
       if (!session) return null;

       return {
         cropped: session.crop !== null,
         rotated: session.rotation,
         trimmed: session.originalMedia.type === 'video' ? session.trim : null,
         editCount:
           (session.crop ? 1 : 0) +
           (session.rotation !== 0 ? 1 : 0) +
           (session.trim ? 1 : 0),
       };
     },
     [editSessions]
   );

   const hasEdit = useCallback(
     (mediaId: string, editType: EditType): boolean => {
       const session = editSessions.get(mediaId);
       if (!session) return false;

       switch (editType) {
         case 'crop':
           return session.crop !== null;
         case 'rotation':
           return session.rotation !== 0;
         case 'trim':
           return session.trim !== null;
         default:
           return false;
       }
     },
     [editSessions]
   );
   ```

#### Verification Steps

1. Test `hasPendingEdits` returns true when session is dirty
2. Test `getPendingEditIds` returns correct list
3. Test `hasAnyPendingEdits` reflects overall state
4. Test `resetEdit` clears specific edit type
5. Test `resetAllEdits` clears all edits

#### Acceptance Criteria

- [ ] `hasPendingEdits` correctly identifies dirty sessions
- [ ] `getPendingEditIds` returns all dirty session IDs
- [ ] `hasAnyPendingEdits` reflects overall pending state
- [ ] `resetEdit` clears specific edit and updates isDirty
- [ ] `resetAllEdits` clears all edits and sets isDirty to false
- [ ] `getEditSummary` returns correct edit summary
- [ ] `hasEdit` correctly identifies specific edit presence

---

### Task 4.1.11: Add Error Handling & User Messages

**Estimated Effort:** 45 minutes
**Dependencies:** Tasks 4.1.1 - 4.1.9
**Parallelizable With:** Task 4.1.10

#### Description

Implement comprehensive error handling with user-friendly messages and recovery actions.

#### Implementation Steps

1. Implement `cancelEdits` with proper cleanup:

   ```typescript
   const cancelEdits = useCallback(
     (mediaId: string) => {
       if (isUnmountedRef.current) return;

       const session = editSessions.get(mediaId);
       if (!session) return;

       // Clean up preview URL
       const previewUrl = previewUrlsRef.current.get(mediaId);
       if (previewUrl) {
         URL.revokeObjectURL(previewUrl);
         previewUrlsRef.current.delete(mediaId);
       }

       // Clear debounce timer
       const timer = debounceTimersRef.current.get(mediaId);
       if (timer) {
         clearTimeout(timer);
         debounceTimersRef.current.delete(mediaId);
       }

       // Remove session
       setEditSessions((prev) => {
         const newMap = new Map(prev);
         newMap.delete(mediaId);
         return newMap;
       });

       // Clear errors
       setErrors((prev) => {
         const newMap = new Map(prev);
         newMap.delete(mediaId);
         return newMap;
       });

       onEditsCancelled?.(mediaId);
       log(`Cancelled edits for ${mediaId}`);
     },
     [editSessions, onEditsCancelled, log]
   );
   ```

2. Implement error getter and clearer:

   ```typescript
   const getError = useCallback(
     (mediaId: string): MediaEditorError | null => {
       return errors.get(mediaId) ?? null;
     },
     [errors]
   );

   const clearError = useCallback(
     (mediaId: string) => {
       setErrors((prev) => {
         if (!prev.has(mediaId)) return prev;
         const newMap = new Map(prev);
         newMap.delete(mediaId);
         return newMap;
       });
     },
     []
   );
   ```

3. Update error handling in preview generation:

   ```typescript
   // In generatePreviewDebounced, add error handling:
   try {
     // ... preview generation logic ...
   } catch (error) {
     if (!isUnmountedRef.current) {
       setErrors((prev) => {
         const newMap = new Map(prev);
         newMap.set(mediaId, {
           code: 'PREVIEW_GENERATION_FAILED',
           message: 'Could not generate preview',
           action: 'Tap to try again',
           recoverable: true,
         });
         return newMap;
       });
     }
   }
   ```

4. Add error messages for all error codes:

   ```typescript
   /**
    * User-friendly error messages by code
    */
   const ERROR_MESSAGES: Record<MediaEditorErrorCode, { message: string; action: string }> = {
     PREVIEW_GENERATION_FAILED: {
       message: 'Could not generate preview for this media',
       action: 'Tap to try again',
     },
     CONFIRM_FAILED: {
       message: 'Could not apply edits to this media',
       action: 'Try again or cancel',
     },
     INVALID_CROP_BOUNDS: {
       message: 'The crop selection is invalid',
       action: 'Adjust the crop area',
     },
     INVALID_TRIM_POINTS: {
       message: 'The trim selection is invalid',
       action: 'Adjust the start and end points',
     },
     MAX_SESSIONS_EXCEEDED: {
       message: 'Too many items being edited',
       action: 'Finish editing another item first',
     },
     SESSION_NOT_FOUND: {
       message: 'Edit session not found',
       action: 'Start editing again',
     },
     UNSUPPORTED_MEDIA_TYPE: {
       message: 'This edit type is not supported for this media',
       action: 'Select a different operation',
     },
   };
   ```

#### Verification Steps

1. Test `cancelEdits` properly cleans up session
2. Test error messages are user-friendly
3. Test error recovery (clearError)
4. Verify callbacks are fired on cancellation

#### Acceptance Criteria

- [ ] `cancelEdits` cleans up all resources and fires callback
- [ ] `getError` returns current error for media item
- [ ] `clearError` removes error from state
- [ ] All error codes have user-friendly messages
- [ ] Error actions guide user to resolution

---

### Task 4.1.12: Add Cleanup & Memory Management

**Estimated Effort:** 45 minutes
**Dependencies:** Tasks 4.1.6, 4.1.7
**Parallelizable With:** None

#### Description

Ensure all Object URLs are properly revoked and resources cleaned up to prevent memory leaks.

#### Implementation Steps

1. Review and consolidate all cleanup logic:

   ```typescript
   /**
    * Clean up all resources for a media item
    */
   const cleanupMediaResources = useCallback((mediaId: string) => {
     // Revoke preview URL
     const previewUrl = previewUrlsRef.current.get(mediaId);
     if (previewUrl) {
       URL.revokeObjectURL(previewUrl);
       previewUrlsRef.current.delete(mediaId);
       log(`Revoked preview URL for ${mediaId}`);
     }

     // Clear debounce timer
     const timer = debounceTimersRef.current.get(mediaId);
     if (timer) {
       clearTimeout(timer);
       debounceTimersRef.current.delete(mediaId);
     }
   }, [log]);
   ```

2. Ensure cleanup on session end:

   - `endEditing` calls `cleanupMediaResources`
   - `cancelEdits` calls `cleanupMediaResources`
   - `confirmEdits` calls `cleanupMediaResources`

3. Ensure cleanup on unmount:

   ```typescript
   useEffect(() => {
     return () => {
       isUnmountedRef.current = true;

       // Revoke all preview URLs
       previewUrlsRef.current.forEach((url, mediaId) => {
         URL.revokeObjectURL(url);
         log(`Cleanup: revoked preview URL for ${mediaId}`);
       });
       previewUrlsRef.current.clear();

       // Clear all debounce timers
       debounceTimersRef.current.forEach((timer) => {
         clearTimeout(timer);
       });
       debounceTimersRef.current.clear();

       log('Hook unmounted, all resources cleaned up');
     };
   }, [log]);
   ```

4. Add guard against state updates after unmount:

   Verify all `setEditSessions` and `setErrors` calls check `isUnmountedRef.current` first.

5. Document memory management:

   ```typescript
   /**
    * Memory Management Notes:
    *
    * This hook creates Object URLs via URL.createObjectURL() for:
    * - Image previews (from canvas.toBlob)
    * - Video frame previews (from canvas.toBlob)
    * - Confirmed edited images (from canvas.toBlob)
    *
    * All URLs are tracked in previewUrlsRef and revoked when:
    * - A new preview is generated (old URL revoked)
    * - Edit session is ended/cancelled/confirmed
    * - Hook is unmounted
    *
    * Failure to revoke URLs would cause memory leaks.
    *
    * Debounce timers are tracked in debounceTimersRef and cleared:
    * - When a new preview generation is requested
    * - When edit session ends
    * - On hook unmount
    */
   ```

#### Verification Steps

1. Use browser DevTools Memory panel to verify no leaks
2. Test rapid edit changes don't accumulate URLs
3. Test unmount during preview generation doesn't leak
4. Verify all state updates guarded against unmounted state

#### Acceptance Criteria

- [ ] All Object URLs tracked and revoked properly
- [ ] No memory leaks on rapid edit changes
- [ ] No memory leaks on component unmount
- [ ] All state updates guarded against unmounted component
- [ ] Debounce timers properly cleared

---

### Task 4.1.13: Export Hook and Add Manual Testing

**Estimated Effort:** 1 hour
**Dependencies:** Tasks 4.1.1 - 4.1.12
**Parallelizable With:** None

#### Description

Export the hook from the ItemCapture index, and perform manual testing across browsers.

#### Implementation Steps

1. Update `src/components/ItemCapture/index.ts`:

   ```typescript
   // Add to existing exports
   export { useMediaEditor } from './hooks/useMediaEditor';

   // Re-export types
   export type {
     UseMediaEditorOptions,
     UseMediaEditorReturn,
     MediaEditState,
     CropDescriptor,
     RotationDegrees,
     TrimDescriptor,
     EditType,
     EditSummary,
     EditConfirmationResult,
     MediaEditorError,
     MediaEditorErrorCode,
   } from './ItemCapture.types';
   ```

2. Create test component for manual testing (temporary):

   ```typescript
   // src/app/test/media-editor/page.tsx
   'use client';

   import { useState } from 'react';
   import { useMediaEditor } from '@/components/ItemCapture';

   export default function TestMediaEditor() {
     const [testImage, setTestImage] = useState<File | null>(null);

     const {
       editSessions,
       startEditing,
       setCrop,
       setRotation,
       confirmEdits,
       cancelEdits,
       hasPendingEdits,
       getEditPreview,
       getError,
     } = useMediaEditor({
       debug: true,
       onEditsConfirmed: (id, result) => {
         console.log('Edits confirmed:', id, result);
       },
       onEditsCancelled: (id) => {
         console.log('Edits cancelled:', id);
       },
     });

     const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
       const file = e.target.files?.[0];
       if (file) {
         setTestImage(file);
         startEditing('test-image', {
           id: 'test-image',
           type: 'image',
           file,
           order: 0,
           metadata: {
             mimeType: file.type,
             fileSize: file.size,
             source: 'upload',
           },
         });
       }
     };

     // ... rest of test UI
   }
   ```

3. Manual testing checklist:

   **Image Editing:**
   - [ ] Load image → start editing → verify session created
   - [ ] Apply crop → verify preview generated
   - [ ] Apply rotation → verify preview updated
   - [ ] Apply crop + rotation → verify combined preview
   - [ ] Reset crop → verify preview updated
   - [ ] Reset rotation → verify preview updated
   - [ ] Confirm edits → verify blob produced
   - [ ] Cancel edits → verify session cleaned up

   **Video Editing:**
   - [ ] Load video → start editing → verify session created
   - [ ] Apply trim → verify preview at trim start
   - [ ] Apply rotation → verify preview updated
   - [ ] Confirm edits → verify metadata has trim points

   **Error Handling:**
   - [ ] Invalid crop bounds → verify error set
   - [ ] Invalid trim points → verify error set
   - [ ] Max sessions → verify error set

   **Memory Management:**
   - [ ] Rapid edits → verify no memory growth
   - [ ] Unmount during generation → verify no errors

4. Browser testing matrix:

   | Platform | Browser | Status |
   |----------|---------|--------|
   | iOS 16+ | Safari | [ ] Pass |
   | Android | Chrome | [ ] Pass |
   | Desktop | Chrome | [ ] Pass |
   | Desktop | Firefox | [ ] Pass |
   | Desktop | Edge | [ ] Pass |

#### Verification Steps

1. Hook exports without errors
2. Test component renders and functions
3. All manual test cases pass
4. No console errors or warnings

#### Acceptance Criteria

- [ ] Hook exported from ItemCapture index
- [ ] Types exported from ItemCapture index
- [ ] Manual testing passes on target browsers
- [ ] No memory leaks observed
- [ ] All error cases handled gracefully

---

## Final Hook Return Object

After completing all tasks, the hook should return:

```typescript
return {
  // Edit State
  editSessions,
  getEditState,
  hasPendingEdits,
  getPendingEditIds,
  hasAnyPendingEdits,

  // Edit Actions
  startEditing,
  setCrop,
  setRotation,
  setTrim,
  resetEdit,
  resetAllEdits,

  // Preview Generation
  getEditPreview,
  isGeneratingPreview,
  regeneratePreview,

  // Confirmation / Cancellation
  confirmEdits,
  cancelEdits,
  endEditing,

  // Utility
  getEditSummary,
  hasEdit,
  clearAllSessions,

  // Error State
  getError,
  clearError,
};
```

---

## Success Criteria Summary

Based on REQ-046 Acceptance Criteria:

- [ ] Each media item can be placed into an edit state independently
- [ ] Original media data is preserved until user confirms changes
- [ ] All edit operations tracked as changeset
- [ ] Users can cancel editing to return to original
- [ ] Confirming edits applies changeset and updates media
- [ ] Visual indication of pending edits (via `isDirty` state)
- [ ] Multiple items can have pending edits simultaneously

Additional Technical Criteria:

- [ ] No memory leaks from Object URLs
- [ ] Hook returns stable references (memoized callbacks)
- [ ] State updates guarded against unmounted component
- [ ] TypeScript types correctly infer all return values
- [ ] Preview generation works for images and videos
- [ ] Integration ready for ImageCropper, ImageRotator, VideoTrimmer

---

## Task Summary Table

| Task | Description | Est. Time | Dependencies |
|------|-------------|-----------|--------------|
| 4.1.1 | Define TypeScript interfaces | 30 min | None |
| 4.1.2 | Create hook with base structure | 45 min | 4.1.1 |
| 4.1.3 | Implement crop edit tracking | 30 min | 4.1.2 |
| 4.1.4 | Implement rotation edit tracking | 30 min | 4.1.2 |
| 4.1.5 | Implement trim edit tracking | 30 min | 4.1.2 |
| 4.1.6 | Implement image preview generation | 1.5 hr | 4.1.3, 4.1.4 |
| 4.1.7 | Implement video preview generation | 1 hr | 4.1.5 |
| 4.1.8 | Implement image edit confirmation | 1 hr | 4.1.6 |
| 4.1.9 | Implement video edit confirmation | 30 min | 4.1.7 |
| 4.1.10 | Add pending edits status tracking | 30 min | 4.1.3-5 |
| 4.1.11 | Add error handling & messages | 45 min | 4.1.1-9 |
| 4.1.12 | Add cleanup & memory management | 45 min | 4.1.6-7 |
| 4.1.13 | Export hook and manual testing | 1 hr | 4.1.1-12 |

**Total Estimated Time:** ~10 hours (1.25 days)

---

## References

- [Overview Document](/docs/REQ-046-create-usemediaeditor-hook-overview.md)
- [Implementation Plan](/docs/prd/item-capture-implementation-plan.md)
- [useQRCodeGeneration Hook](/src/hooks/useQRCodeGeneration.ts) - Pattern reference
- [Canvas API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [URL.createObjectURL - MDN](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL)
