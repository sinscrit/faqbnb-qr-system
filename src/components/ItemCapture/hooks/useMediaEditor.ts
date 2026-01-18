/**
 * useMediaEditor Hook
 *
 * Manages non-destructive editing state for media items (photos and videos)
 * within the ItemCapture component. Tracks edit operations (crop, rotate, trim)
 * as a changeset that can be previewed in real-time, confirmed, or discarded.
 *
 * @module ItemCapture/hooks/useMediaEditor
 * @see docs/REQ-046-create-usemediaeditor-hook-overview.md
 * @lastModified 2025-12-31 (REQ-046)
 */

'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type {
  UseMediaEditorOptions,
  UseMediaEditorReturn,
  MediaEditState,
  MediaItem,
  MediaMetadata,
  CropDescriptor,
  RotationDegrees,
  TrimDescriptor,
  EditType,
  EditSummary,
  EditConfirmationResult,
  MediaEditorError,
  MediaEditorErrorCode,
} from '../ItemCapture.types';

// =============================================================================
// Constants
// =============================================================================

/**
 * Default options for the hook
 */
const DEFAULT_OPTIONS: Required<
  Omit<UseMediaEditorOptions, 'onEditStateChange' | 'onEditsConfirmed' | 'onEditsCancelled'>
> = {
  maxConcurrentEdits: 5,
  autoGeneratePreview: true,
  previewQuality: 0.8,
  maxPreviewSize: { width: 800, height: 800 },
  debug: false,
};

/**
 * Valid rotation values
 */
const VALID_ROTATIONS: RotationDegrees[] = [0, 90, 180, 270];

/**
 * Preview generation debounce time in milliseconds
 */
const PREVIEW_DEBOUNCE_MS = 300;

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

// =============================================================================
// Validation Helpers
// =============================================================================

/**
 * Validate rotation value
 */
const isValidRotation = (degrees: number): degrees is RotationDegrees => {
  return VALID_ROTATIONS.includes(degrees as RotationDegrees);
};

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

// =============================================================================
// Image Processing Helpers
// =============================================================================

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
    const scale = Math.min(maxSize.width / canvasWidth, maxSize.height / canvasHeight, 1);
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
        srcX,
        srcY,
        srcWidth,
        srcHeight,
        -canvas.height / 2,
        -canvas.width / 2,
        canvas.height,
        canvas.width
      );
    } else {
      ctx.drawImage(
        img,
        srcX,
        srcY,
        srcWidth,
        srcHeight,
        -canvas.width / 2,
        -canvas.height / 2,
        canvas.width,
        canvas.height
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
    const scale = Math.min(maxSize.width / canvasWidth, maxSize.height / canvasHeight, 1);
    canvas.width = canvasWidth * scale;
    canvas.height = canvasHeight * scale;

    // Apply transforms and draw frame
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    if (isRotated90or270) {
      ctx.drawImage(
        video,
        (-video.videoWidth * scale) / 2,
        (-video.videoHeight * scale) / 2,
        video.videoWidth * scale,
        video.videoHeight * scale
      );
    } else {
      ctx.drawImage(video, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
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
      srcX,
      srcY,
      srcWidth,
      srcHeight,
      -canvas.height / 2,
      -canvas.width / 2,
      canvas.height,
      canvas.width
    );
  } else {
    ctx.drawImage(
      img,
      srcX,
      srcY,
      srcWidth,
      srcHeight,
      -canvas.width / 2,
      -canvas.height / 2,
      canvas.width,
      canvas.height
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

// =============================================================================
// Main Hook
// =============================================================================

/**
 * Custom hook for non-destructive media editing state management.
 *
 * Memory Management Notes:
 * - Object URLs are created via URL.createObjectURL() for previews
 * - All URLs are tracked and revoked when sessions end or component unmounts
 * - Debounce timers are cleared on cleanup to prevent memory leaks
 *
 * Video Edit Confirmation (V1):
 * - Video trimming is NOT performed client-side in V1
 * - Trim metadata is stored for server-side processing
 *
 * @param options - Configuration options for the hook
 * @returns All state and actions for media editing
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

  // === Debug Logging Helper ===
  const log = useCallback(
    (message: string, ...args: unknown[]) => {
      if (debug) {
        console.log(`[useMediaEditor] ${message}`, ...args);
      }
    },
    [debug]
  );

  // === Cleanup Helpers ===

  /**
   * Clean up all resources for a media item
   */
  const cleanupMediaResources = useCallback(
    (mediaId: string) => {
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
    },
    [log]
  );

  // === Cleanup on Unmount ===
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

  // === Preview Generation ===

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

        try {
          if (session.originalMedia.type === 'image') {
            previewUrl = await generateImagePreview(session, previewQuality, maxPreviewSize);
          } else if (session.originalMedia.type === 'video') {
            previewUrl = await generateVideoPreview(session, previewQuality, maxPreviewSize);
          }
        } catch (error) {
          if (!isUnmountedRef.current) {
            setErrors((prev) => {
              const newMap = new Map(prev);
              newMap.set(mediaId, {
                code: 'PREVIEW_GENERATION_FAILED',
                message: ERROR_MESSAGES.PREVIEW_GENERATION_FAILED.message,
                action: ERROR_MESSAGES.PREVIEW_GENERATION_FAILED.action,
                recoverable: true,
              });
              return newMap;
            });
          }
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
      }, PREVIEW_DEBOUNCE_MS);

      debounceTimersRef.current.set(mediaId, timer);
    },
    [editSessions, previewQuality, maxPreviewSize, log]
  );

  // === Session Management ===

  /**
   * Start an editing session for a media item
   */
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
            action: ERROR_MESSAGES.MAX_SESSIONS_EXCEEDED.action,
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

  /**
   * Get edit state for a specific media item
   */
  const getEditState = useCallback(
    (mediaId: string): MediaEditState | null => {
      return editSessions.get(mediaId) ?? null;
    },
    [editSessions]
  );

  /**
   * End editing session
   */
  const endEditing = useCallback(
    (mediaId: string) => {
      if (isUnmountedRef.current) return;

      cleanupMediaResources(mediaId);

      setEditSessions((prev) => {
        const newMap = new Map(prev);
        newMap.delete(mediaId);
        return newMap;
      });

      // Clear any errors
      setErrors((prev) => {
        if (!prev.has(mediaId)) return prev;
        const newMap = new Map(prev);
        newMap.delete(mediaId);
        return newMap;
      });

      log(`Ended editing session for ${mediaId}`);
    },
    [cleanupMediaResources, log]
  );

  /**
   * Clear all edit sessions
   */
  const clearAllSessions = useCallback(() => {
    if (isUnmountedRef.current) return;

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

    // Clear all sessions
    setEditSessions(new Map());
    setErrors(new Map());

    log('Cleared all edit sessions');
  }, [log]);

  // === Edit Actions ===

  /**
   * Set crop for a media item
   */
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
                action: ERROR_MESSAGES.INVALID_CROP_BOUNDS.action,
                recoverable: true,
              });
              return newMap;
            });
            return prev;
          }
        }

        const newMap = new Map(prev);
        const now = new Date();

        const newSession = {
          ...session,
          crop,
          isDirty: calculateIsDirty(crop, session.rotation, session.trim),
          lastModifiedAt: now,
          // Invalidate cached preview
          previewUrl: null,
        };

        newMap.set(mediaId, newSession);

        // Trigger callback if provided
        onEditStateChange?.(mediaId, newSession);

        return newMap;
      });

      // Clear any existing crop error
      setErrors((prev) => {
        if (prev.has(mediaId) && prev.get(mediaId)?.code === 'INVALID_CROP_BOUNDS') {
          const newMap = new Map(prev);
          newMap.delete(mediaId);
          return newMap;
        }
        return prev;
      });

      log(`Set crop for ${mediaId}:`, crop);

      // Auto-generate preview if enabled
      if (autoGeneratePreview) {
        generatePreviewDebounced(mediaId);
      }
    },
    [onEditStateChange, autoGeneratePreview, generatePreviewDebounced, log]
  );

  /**
   * Set rotation for a media item
   */
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

        const newSession = {
          ...session,
          rotation: degrees,
          isDirty: calculateIsDirty(session.crop, degrees, session.trim),
          lastModifiedAt: now,
          // Invalidate cached preview
          previewUrl: null,
        };

        newMap.set(mediaId, newSession);

        // Trigger callback if provided
        onEditStateChange?.(mediaId, newSession);

        return newMap;
      });

      log(`Set rotation for ${mediaId}: ${degrees} degrees`);

      // Auto-generate preview if enabled
      if (autoGeneratePreview) {
        generatePreviewDebounced(mediaId);
      }
    },
    [onEditStateChange, autoGeneratePreview, generatePreviewDebounced, log]
  );

  /**
   * Set trim for a video item
   */
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
              action: ERROR_MESSAGES.UNSUPPORTED_MEDIA_TYPE.action,
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
                action: ERROR_MESSAGES.INVALID_TRIM_POINTS.action,
                recoverable: true,
              });
              return newMap;
            });
            return prev;
          }
        }

        const newMap = new Map(prev);
        const now = new Date();

        const newSession = {
          ...session,
          trim,
          isDirty: calculateIsDirty(session.crop, session.rotation, trim),
          lastModifiedAt: now,
          // Invalidate cached preview
          previewUrl: null,
        };

        newMap.set(mediaId, newSession);

        // Trigger callback if provided
        onEditStateChange?.(mediaId, newSession);

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

      // Auto-generate preview if enabled
      if (autoGeneratePreview) {
        generatePreviewDebounced(mediaId);
      }
    },
    [onEditStateChange, autoGeneratePreview, generatePreviewDebounced, log]
  );

  /**
   * Reset a specific edit type to default
   */
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

        // Trigger callback if provided
        onEditStateChange?.(mediaId, newSession);

        return newMap;
      });

      log(`Reset ${editType} for ${mediaId}`);

      // Auto-generate preview if enabled
      if (autoGeneratePreview) {
        generatePreviewDebounced(mediaId);
      }
    },
    [onEditStateChange, autoGeneratePreview, generatePreviewDebounced, log]
  );

  /**
   * Reset all edits for a media item
   */
  const resetAllEdits = useCallback(
    (mediaId: string) => {
      if (isUnmountedRef.current) return;

      setEditSessions((prev) => {
        const session = prev.get(mediaId);
        if (!session) return prev;

        const newMap = new Map(prev);
        const now = new Date();

        const newSession = {
          ...session,
          crop: null,
          rotation: 0 as RotationDegrees,
          trim: null,
          isDirty: false,
          previewUrl: null,
          lastModifiedAt: now,
        };

        newMap.set(mediaId, newSession);

        // Trigger callback if provided
        onEditStateChange?.(mediaId, newSession);

        return newMap;
      });

      // Clear preview URL
      const previewUrl = previewUrlsRef.current.get(mediaId);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        previewUrlsRef.current.delete(mediaId);
      }

      log(`Reset all edits for ${mediaId}`);
    },
    [onEditStateChange, log]
  );

  // === Preview Methods ===

  /**
   * Get or generate preview for current edits
   */
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
        let url: string | null = null;

        if (session.originalMedia.type === 'image') {
          url = await generateImagePreview(session, previewQuality, maxPreviewSize);
        } else if (session.originalMedia.type === 'video') {
          url = await generateVideoPreview(session, previewQuality, maxPreviewSize);
        }

        if (url && !isUnmountedRef.current) {
          // Revoke old URL if exists
          const oldUrl = previewUrlsRef.current.get(mediaId);
          if (oldUrl) {
            URL.revokeObjectURL(oldUrl);
          }

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

      // No edits, return original URL
      return URL.createObjectURL(session.originalMedia.file);
    },
    [editSessions, previewQuality, maxPreviewSize]
  );

  /**
   * Check if preview is currently being generated
   */
  const isGeneratingPreview = useCallback(
    (mediaId: string): boolean => {
      return editSessions.get(mediaId)?.isGeneratingPreview ?? false;
    },
    [editSessions]
  );

  /**
   * Force regeneration of preview
   */
  const regeneratePreview = useCallback(
    async (mediaId: string): Promise<void> => {
      generatePreviewDebounced(mediaId);
    },
    [generatePreviewDebounced]
  );

  // === Confirmation / Cancellation ===

  /**
   * Apply edits and produce final result
   */
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
        // NOTE: In V1, video trimming is NOT performed client-side due to
        // large WASM payload (~25MB for FFmpeg) and performance concerns.
        // Trim metadata is passed to server for actual processing.
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
        cleanupMediaResources(mediaId);
        setEditSessions((prev) => {
          const newMap = new Map(prev);
          newMap.delete(mediaId);
          return newMap;
        });
        setErrors((prev) => {
          const newMap = new Map(prev);
          newMap.delete(mediaId);
          return newMap;
        });

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
            action: ERROR_MESSAGES.CONFIRM_FAILED.action,
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
    [editSessions, cleanupMediaResources, onEditsConfirmed, log]
  );

  /**
   * Cancel all edits and restore original
   */
  const cancelEdits = useCallback(
    (mediaId: string) => {
      if (isUnmountedRef.current) return;

      const session = editSessions.get(mediaId);
      if (!session) return;

      // Clean up resources
      cleanupMediaResources(mediaId);

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
    [editSessions, cleanupMediaResources, onEditsCancelled, log]
  );

  // === Status Tracking ===

  /**
   * Check if a specific media item has pending edits
   */
  const hasPendingEdits = useCallback(
    (mediaId: string): boolean => {
      const session = editSessions.get(mediaId);
      return session?.isDirty ?? false;
    },
    [editSessions]
  );

  /**
   * Get list of all media IDs with pending edits
   */
  const getPendingEditIds = useCallback((): string[] => {
    return Array.from(editSessions.entries())
      .filter(([, session]) => session.isDirty)
      .map(([mediaId]) => mediaId);
  }, [editSessions]);

  /**
   * Whether any media items have pending edits
   */
  const hasAnyPendingEdits = useMemo(() => {
    return Array.from(editSessions.values()).some((session) => session.isDirty);
  }, [editSessions]);

  /**
   * Get summary of edits for a media item
   */
  const getEditSummary = useCallback(
    (mediaId: string): EditSummary | null => {
      const session = editSessions.get(mediaId);
      if (!session) return null;

      return {
        cropped: session.crop !== null,
        rotated: session.rotation,
        trimmed: session.originalMedia.type === 'video' ? session.trim : null,
        editCount:
          (session.crop ? 1 : 0) + (session.rotation !== 0 ? 1 : 0) + (session.trim ? 1 : 0),
      };
    },
    [editSessions]
  );

  /**
   * Check if a specific edit type has been applied
   */
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

  // === Error Handling ===

  /**
   * Get current error for a media item
   */
  const getError = useCallback(
    (mediaId: string): MediaEditorError | null => {
      return errors.get(mediaId) ?? null;
    },
    [errors]
  );

  /**
   * Clear error for a media item
   */
  const clearError = useCallback((mediaId: string) => {
    setErrors((prev) => {
      if (!prev.has(mediaId)) return prev;
      const newMap = new Map(prev);
      newMap.delete(mediaId);
      return newMap;
    });
  }, []);

  // === Return Hook Value ===
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
}
