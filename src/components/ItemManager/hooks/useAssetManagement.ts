'use client';

/**
 * useAssetManagement - Asset management state hook for batched operations
 *
 * This hook manages pending asset changes (additions, removals, reorders) in
 * temporary state until the user explicitly commits them. It enables a
 * non-destructive editing workflow for item assets.
 *
 * @module ItemManager/hooks/useAssetManagement
 * @see docs/REQ-080-create-useassetmanagement-hook-detailed.md
 * @lastModified 2026-01-03
 */

import { useReducer, useCallback, useMemo, useEffect, useRef } from 'react';
import type { MediaItem } from '@/components/ItemCapture/ItemCapture.types';
import type {
  AssetManagementState,
  AssetManagementAction,
  AssetManagementError,
  PendingAsset,
  UseAssetManagementOptions,
  UseAssetManagementReturn,
} from '../ItemManager.types';

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const DEFAULT_ALLOWED_TYPES: ('video' | 'image' | 'pdf')[] = ['video', 'image', 'pdf'];

// MIME type to category mapping
const MIME_TYPE_MAP: Record<string, 'video' | 'image' | 'pdf'> = {
  'video/mp4': 'video',
  'video/webm': 'video',
  'video/quicktime': 'video',
  'video/x-msvideo': 'video',
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'image/heic': 'image',
  'image/heif': 'image',
  'application/pdf': 'pdf',
};

// =============================================================================
// Initial State Factory
// =============================================================================

/**
 * Creates a fresh initial state for the asset management hook.
 */
export function createInitialState(): AssetManagementState {
  return {
    itemId: null,
    originalAssets: [],
    pendingAdditions: [],
    pendingRemovals: new Set<string>(),
    currentOrder: [],
    isDirty: false,
    isCommitting: false,
    error: null,
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Generates a UUID v4 for pending assets.
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Determines the file category based on MIME type.
 * Returns null if the type is not recognized.
 */
export function getFileCategory(mimeType: string): 'video' | 'image' | 'pdf' | null {
  const lowerMime = mimeType.toLowerCase();

  // Direct match
  if (MIME_TYPE_MAP[lowerMime]) {
    return MIME_TYPE_MAP[lowerMime];
  }

  // Wildcard match
  if (lowerMime.startsWith('video/')) return 'video';
  if (lowerMime.startsWith('image/')) return 'image';
  if (lowerMime === 'application/pdf') return 'pdf';

  return null;
}

/**
 * Validates a file for addition to pending assets.
 */
export function validateAssetFile(
  file: File,
  options: {
    allowedTypes?: ('video' | 'image' | 'pdf')[];
    maxSize?: number;
  }
): { valid: boolean; error?: AssetManagementError } {
  const { allowedTypes = DEFAULT_ALLOWED_TYPES, maxSize = DEFAULT_MAX_FILE_SIZE } = options;

  // Check file size
  if (file.size > maxSize) {
    const sizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: `File size exceeds maximum of ${sizeMB}MB`,
      },
    };
  }

  // Check file type
  const category = getFileCategory(file.type);
  if (!category) {
    return {
      valid: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: `File type "${file.type}" is not supported`,
      },
    };
  }

  if (!allowedTypes.includes(category)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: `File type "${category}" is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      },
    };
  }

  return { valid: true };
}

/**
 * Creates a PendingAsset from a File object.
 */
export function createPendingAsset(file: File): PendingAsset {
  const category = getFileCategory(file.type);
  return {
    id: `pending-${generateUUID()}`,
    file,
    previewUrl: URL.createObjectURL(file),
    type: category || 'image', // Fallback, though validation should prevent this
    addedAt: new Date(),
  };
}

/**
 * Helper function to compare arrays for equality.
 */
function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// =============================================================================
// Reducer
// =============================================================================

/**
 * Reducer for asset management state transitions.
 * All state changes flow through this reducer for predictable state management.
 */
export function assetManagementReducer(
  state: AssetManagementState,
  action: AssetManagementAction
): AssetManagementState {
  switch (action.type) {
    // =========================================================================
    // Session Management
    // =========================================================================
    case 'START_SESSION': {
      const { itemId, assets } = action.payload;
      return {
        ...createInitialState(),
        itemId,
        originalAssets: assets,
        currentOrder: assets.map((a) => a.id),
      };
    }

    case 'END_SESSION': {
      // Revoke all pending addition preview URLs
      state.pendingAdditions.forEach((asset) => {
        if (asset.previewUrl) {
          URL.revokeObjectURL(asset.previewUrl);
        }
      });
      return createInitialState();
    }

    // =========================================================================
    // Asset Operations
    // =========================================================================
    case 'ADD_ASSET': {
      return {
        ...state,
        pendingAdditions: [...state.pendingAdditions, action.payload],
        currentOrder: [...state.currentOrder, action.payload.id],
        isDirty: true,
        error: null,
      };
    }

    case 'REMOVE_ASSET': {
      const assetId = action.payload;

      // Check if it's a pending addition
      const isPending = state.pendingAdditions.some((a) => a.id === assetId);

      if (isPending) {
        // Remove from pending additions entirely
        const pending = state.pendingAdditions.find((a) => a.id === assetId);
        if (pending?.previewUrl) {
          URL.revokeObjectURL(pending.previewUrl);
        }
        return {
          ...state,
          pendingAdditions: state.pendingAdditions.filter((a) => a.id !== assetId),
          currentOrder: state.currentOrder.filter((id) => id !== assetId),
          isDirty: true,
          error: null,
        };
      }

      // Mark committed asset for removal
      const newRemovals = new Set(state.pendingRemovals);
      newRemovals.add(assetId);
      return {
        ...state,
        pendingRemovals: newRemovals,
        currentOrder: state.currentOrder.filter((id) => id !== assetId),
        isDirty: true,
        error: null,
      };
    }

    case 'UNDO_REMOVAL': {
      const assetId = action.payload;

      // Only works for committed assets that are marked for removal
      if (!state.pendingRemovals.has(assetId)) {
        return state;
      }

      // Find the original position of the asset
      const originalAsset = state.originalAssets.find((a) => a.id === assetId);
      if (!originalAsset) {
        return state;
      }

      // Remove from pending removals
      const newRemovals = new Set(state.pendingRemovals);
      newRemovals.delete(assetId);

      // Restore to current order at original position or end
      const originalIndex = state.originalAssets.findIndex((a) => a.id === assetId);
      let insertIndex = state.currentOrder.length;

      // Try to find the best position based on surrounding assets
      for (let i = originalIndex - 1; i >= 0; i--) {
        const prevId = state.originalAssets[i].id;
        const prevCurrentIndex = state.currentOrder.indexOf(prevId);
        if (prevCurrentIndex !== -1) {
          insertIndex = prevCurrentIndex + 1;
          break;
        }
      }

      const newOrder = [...state.currentOrder];
      newOrder.splice(insertIndex, 0, assetId);

      // Check if we're back to the original state
      const stillDirty = newRemovals.size > 0 ||
        state.pendingAdditions.length > 0 ||
        !arraysEqual(newOrder, state.originalAssets.map((a) => a.id));

      return {
        ...state,
        pendingRemovals: newRemovals,
        currentOrder: newOrder,
        isDirty: stillDirty,
        error: null,
      };
    }

    case 'REORDER_ASSETS': {
      const { fromIndex, toIndex } = action.payload;

      // Validate indices
      if (
        fromIndex < 0 ||
        fromIndex >= state.currentOrder.length ||
        toIndex < 0 ||
        toIndex >= state.currentOrder.length ||
        fromIndex === toIndex
      ) {
        return state;
      }

      const newOrder = [...state.currentOrder];
      const [removed] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, removed);

      return {
        ...state,
        currentOrder: newOrder,
        isDirty: true,
        error: null,
      };
    }

    // =========================================================================
    // Commit / Discard
    // =========================================================================
    case 'START_COMMIT': {
      return {
        ...state,
        isCommitting: true,
        error: null,
      };
    }

    case 'COMMIT_SUCCESS': {
      // Revoke preview URLs for pending additions (they've been persisted)
      state.pendingAdditions.forEach((asset) => {
        if (asset.previewUrl) {
          URL.revokeObjectURL(asset.previewUrl);
        }
      });
      return createInitialState();
    }

    case 'COMMIT_ERROR': {
      return {
        ...state,
        isCommitting: false,
        error: {
          code: 'COMMIT_FAILED',
          message: action.payload,
        },
      };
    }

    case 'DISCARD_CHANGES': {
      // Revoke all pending addition preview URLs
      state.pendingAdditions.forEach((asset) => {
        if (asset.previewUrl) {
          URL.revokeObjectURL(asset.previewUrl);
        }
      });

      // Reset to original state but keep session active
      if (state.itemId) {
        return {
          ...createInitialState(),
          itemId: state.itemId,
          originalAssets: state.originalAssets,
          currentOrder: state.originalAssets.map((a) => a.id),
        };
      }
      return createInitialState();
    }

    // =========================================================================
    // Error Handling
    // =========================================================================
    case 'SET_ERROR': {
      return {
        ...state,
        error: action.payload,
      };
    }

    case 'CLEAR_ERROR': {
      return {
        ...state,
        error: null,
      };
    }

    default: {
      // Exhaustive check
      const _exhaustive: never = action;
      return state;
    }
  }
}

// =============================================================================
// Main Hook
// =============================================================================

/**
 * Hook for managing pending asset changes with batched commit/discard.
 *
 * @example
 * ```tsx
 * const {
 *   startSession,
 *   addAsset,
 *   removeAsset,
 *   commit,
 *   discard,
 *   currentAssets,
 *   isDirty
 * } = useAssetManagement({
 *   onAddAssets: async (itemId, files) => { ... },
 *   onRemoveAssets: async (itemId, ids) => { ... },
 * });
 * ```
 */
export function useAssetManagement(
  options: UseAssetManagementOptions = {}
): UseAssetManagementReturn {
  const {
    onAddAssets,
    onRemoveAssets,
    onReorderAssets,
    allowedMediaTypes = DEFAULT_ALLOWED_TYPES,
    maxFileSize = DEFAULT_MAX_FILE_SIZE,
    debug = false,
  } = options;

  const [state, dispatch] = useReducer(assetManagementReducer, undefined, createInitialState);

  // Store options in ref to avoid callback dependency issues
  const optionsRef = useRef({ onAddAssets, onRemoveAssets, onReorderAssets, debug });
  useEffect(() => {
    optionsRef.current = { onAddAssets, onRemoveAssets, onReorderAssets, debug };
  }, [onAddAssets, onRemoveAssets, onReorderAssets, debug]);

  // Debug logging helper
  const log = useCallback((...args: unknown[]) => {
    if (optionsRef.current.debug) {
      console.log('[useAssetManagement]', ...args);
    }
  }, []);

  // ===========================================================================
  // Session Actions
  // ===========================================================================

  const startSession = useCallback((itemId: string, assets: MediaItem[]) => {
    log('Starting session for item:', itemId, 'with', assets.length, 'assets');
    dispatch({ type: 'START_SESSION', payload: { itemId, assets } });
  }, [log]);

  const endSession = useCallback(() => {
    log('Ending session');
    dispatch({ type: 'END_SESSION' });
  }, [log]);

  // ===========================================================================
  // Asset Actions
  // ===========================================================================

  const addAsset = useCallback(async (file: File): Promise<boolean> => {
    log('Adding asset:', file.name, file.type, file.size);

    // Validate file
    const validation = validateAssetFile(file, { allowedTypes: allowedMediaTypes, maxSize: maxFileSize });
    if (!validation.valid) {
      log('File validation failed:', validation.error);
      dispatch({ type: 'SET_ERROR', payload: validation.error! });
      return false;
    }

    // Create pending asset
    const pendingAsset = createPendingAsset(file);
    log('Created pending asset:', pendingAsset.id);

    dispatch({ type: 'ADD_ASSET', payload: pendingAsset });
    return true;
  }, [allowedMediaTypes, maxFileSize, log]);

  const addAssets = useCallback(async (files: File[]): Promise<{ success: File[]; failed: File[] }> => {
    log('Adding multiple assets:', files.length);

    const success: File[] = [];
    const failed: File[] = [];

    for (const file of files) {
      const result = await addAsset(file);
      if (result) {
        success.push(file);
      } else {
        failed.push(file);
      }
    }

    log('Add assets result:', success.length, 'success,', failed.length, 'failed');
    return { success, failed };
  }, [addAsset, log]);

  const removeAsset = useCallback((assetId: string) => {
    log('Removing asset:', assetId);
    dispatch({ type: 'REMOVE_ASSET', payload: assetId });
  }, [log]);

  const undoRemoval = useCallback((assetId: string) => {
    log('Undoing removal of asset:', assetId);
    dispatch({ type: 'UNDO_REMOVAL', payload: assetId });
  }, [log]);

  const reorderAssets = useCallback((fromIndex: number, toIndex: number) => {
    log('Reordering assets from', fromIndex, 'to', toIndex);
    dispatch({ type: 'REORDER_ASSETS', payload: { fromIndex, toIndex } });
  }, [log]);

  // ===========================================================================
  // Commit / Discard
  // ===========================================================================

  const commit = useCallback(async (): Promise<boolean> => {
    if (!state.itemId) {
      log('Cannot commit: no active session');
      return false;
    }

    if (!state.isDirty) {
      log('Nothing to commit');
      return true;
    }

    log('Starting commit for item:', state.itemId);
    dispatch({ type: 'START_COMMIT' });

    try {
      const { onAddAssets: addCallback, onRemoveAssets: removeCallback, onReorderAssets: reorderCallback } = optionsRef.current;

      // Execute add callbacks
      if (state.pendingAdditions.length > 0 && addCallback) {
        log('Calling onAddAssets with', state.pendingAdditions.length, 'files');
        const files = state.pendingAdditions.map((a) => a.file);
        await addCallback(state.itemId, files);
      }

      // Execute remove callbacks
      if (state.pendingRemovals.size > 0 && removeCallback) {
        log('Calling onRemoveAssets with', state.pendingRemovals.size, 'ids');
        const ids = Array.from(state.pendingRemovals);
        await removeCallback(state.itemId, ids);
      }

      // Execute reorder callback (if order changed from original)
      if (reorderCallback) {
        const originalOrder = state.originalAssets.map((a) => a.id);
        const effectiveOrder = state.currentOrder.filter(
          (id) => !state.pendingAdditions.some((a) => a.id === id)
        );

        if (!arraysEqual(originalOrder.filter((id) => !state.pendingRemovals.has(id)), effectiveOrder)) {
          log('Calling onReorderAssets with new order');
          await reorderCallback(state.itemId, state.currentOrder);
        }
      }

      log('Commit successful');
      dispatch({ type: 'COMMIT_SUCCESS' });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error during commit';
      log('Commit failed:', message);
      dispatch({ type: 'COMMIT_ERROR', payload: message });
      return false;
    }
  }, [state.itemId, state.isDirty, state.pendingAdditions, state.pendingRemovals, state.currentOrder, state.originalAssets, log]);

  const discard = useCallback(() => {
    log('Discarding changes');
    dispatch({ type: 'DISCARD_CHANGES' });
  }, [log]);

  // ===========================================================================
  // Error Handling
  // ===========================================================================

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // ===========================================================================
  // Computed Values
  // ===========================================================================

  const currentAssets = useMemo((): (MediaItem | PendingAsset)[] => {
    // Build a map of all available assets
    const assetMap = new Map<string, MediaItem | PendingAsset>();

    // Add original assets (except those pending removal)
    state.originalAssets.forEach((asset) => {
      if (!state.pendingRemovals.has(asset.id)) {
        assetMap.set(asset.id, asset);
      }
    });

    // Add pending additions
    state.pendingAdditions.forEach((asset) => {
      assetMap.set(asset.id, asset);
    });

    // Return in current order
    return state.currentOrder
      .map((id) => assetMap.get(id))
      .filter((asset): asset is MediaItem | PendingAsset => asset !== undefined);
  }, [state.originalAssets, state.pendingAdditions, state.pendingRemovals, state.currentOrder]);

  const pendingRemovalIds = useMemo(
    () => Array.from(state.pendingRemovals),
    [state.pendingRemovals]
  );

  const getAssetById = useCallback((id: string): MediaItem | PendingAsset | null => {
    // Check pending additions
    const pending = state.pendingAdditions.find((a) => a.id === id);
    if (pending) return pending;

    // Check original assets
    const original = state.originalAssets.find((a) => a.id === id);
    if (original && !state.pendingRemovals.has(id)) return original;

    return null;
  }, [state.pendingAdditions, state.originalAssets, state.pendingRemovals]);

  const isPendingAddition = useCallback((id: string): boolean => {
    return state.pendingAdditions.some((a) => a.id === id);
  }, [state.pendingAdditions]);

  const isPendingRemoval = useCallback((id: string): boolean => {
    return state.pendingRemovals.has(id);
  }, [state.pendingRemovals]);

  const getOrderedIds = useCallback((): string[] => {
    return [...state.currentOrder];
  }, [state.currentOrder]);

  // ===========================================================================
  // Cleanup on Unmount
  // ===========================================================================

  useEffect(() => {
    return () => {
      // Revoke any remaining object URLs on unmount
      // Using a reference to avoid stale closure
      state.pendingAdditions.forEach((asset) => {
        if (asset.previewUrl) {
          URL.revokeObjectURL(asset.previewUrl);
        }
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ===========================================================================
  // Return
  // ===========================================================================

  return {
    // State
    isActive: state.itemId !== null,
    currentAssets,
    pendingAdditions: state.pendingAdditions,
    pendingRemovalIds,
    isDirty: state.isDirty,
    isCommitting: state.isCommitting,
    error: state.error,

    // Session Actions
    startSession,
    endSession,

    // Asset Actions
    addAsset,
    addAssets,
    removeAsset,
    undoRemoval,
    reorderAssets,

    // Commit/Discard
    commit,
    discard,

    // Computed
    getAssetById,
    isPendingAddition,
    isPendingRemoval,
    getOrderedIds,

    // Error handling
    clearError,
  };
}

export default useAssetManagement;
