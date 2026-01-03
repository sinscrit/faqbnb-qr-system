# REQ-080: Create useAssetManagement Hook - Detailed Task Breakdown

**Document Created:** 2026-01-03 11:45:00
**Last Modified:** 2026-01-03 14:30:00
**Request Reference:** REQ-080 in `/docs/gen_requests.md`
**Overview Document:** `/docs/REQ-080-create-useassetmanagement-hook-overview.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 5 - Asset Management
**Task ID:** 5.1
**Estimated Total Effort:** 1-2 story points

---

## Document Purpose

This document provides a granular, step-by-step task breakdown for implementing the `useAssetManagement` hook. Each task is designed to be completable in a few focused hours (approximately 1 story point or less) and includes specific verification steps.

---

## Prerequisites

Before starting implementation:

1. **Phase 4 Complete**: ItemPreviewModal and MediaGallery components should exist
2. **Development Server**: Ability to run `npm run dev` successfully
3. **TypeScript Compilation**: No existing TypeScript errors in the codebase
4. **Reference Patterns**: Familiarity with `src/components/ItemCapture/hooks/useItemCaptureState.ts`

---

## Authorized Files and Functions for Modification

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/ItemManager/hooks/useAssetManagement.ts` | Main hook implementation |
| `src/components/ItemManager/hooks/index.ts` | Hooks barrel export (if not exists) |

### Files to Modify

| File | Change |
|------|--------|
| `src/components/ItemManager/ItemManager.types.ts` | Add asset management type definitions (create if not exists) |
| `src/components/ItemManager/index.ts` | Re-export hook for external use (create if not exists) |

---

## Task Breakdown

### Task 1: Create ItemManager Directory Structure

**Objective:** Set up the ItemManager component directory with proper structure for hooks.

**Story Points:** 0.25

**Steps:**

1.1. Create directory structure:
```
src/components/ItemManager/
├── hooks/
│   └── index.ts
├── ItemManager.types.ts
└── index.ts
```

1.2. Create `src/components/ItemManager/hooks/index.ts`:
```typescript
/**
 * ItemManager hooks barrel export
 *
 * @module ItemManager/hooks
 * @lastModified 2026-01-03
 */

// Hooks will be exported here as they are created
export {};
```

1.3. Create `src/components/ItemManager/index.ts`:
```typescript
/**
 * ItemManager component barrel export
 *
 * @module ItemManager
 * @lastModified 2026-01-03
 */

// Types
export * from './ItemManager.types';

// Hooks
export * from './hooks';
```

**Verification Steps:**
- [ ] Directories exist at specified paths
- [ ] No TypeScript compilation errors
- [ ] Import `import {} from '@/components/ItemManager'` resolves without error

---

### Task 2: Define Asset Management Type Interfaces

**Objective:** Create all TypeScript interfaces for the useAssetManagement hook.

**Story Points:** 0.5

**Steps:**

2.1. Create `src/components/ItemManager/ItemManager.types.ts` with the following interfaces:

```typescript
/**
 * ItemManager Type Definitions
 *
 * @module ItemManager/types
 * @lastModified 2026-01-03
 */

import type { MediaItem } from '@/components/ItemCapture/ItemCapture.types';

// =============================================================================
// Asset Management Types (REQ-080)
// =============================================================================

/**
 * Error codes for asset management operations.
 */
export type AssetManagementErrorCode =
  | 'INVALID_FILE_TYPE'
  | 'FILE_TOO_LARGE'
  | 'COMMIT_FAILED'
  | 'SESSION_NOT_FOUND'
  | 'UNKNOWN_ERROR';

/**
 * Structured error for asset management operations.
 */
export interface AssetManagementError {
  /** Error code for programmatic handling */
  code: AssetManagementErrorCode;
  /** User-friendly error message */
  message: string;
}

/**
 * Represents an asset pending addition (not yet committed).
 */
export interface PendingAsset {
  /** Temporary UUID for this pending asset */
  id: string;
  /** The file to be added */
  file: File;
  /** Generated preview URL (object URL) */
  previewUrl: string;
  /** Detected media type */
  type: 'video' | 'image' | 'pdf';
  /** Timestamp when added */
  addedAt: Date;
}

/**
 * Complete state for asset management operations.
 */
export interface AssetManagementState {
  /** The item whose assets are being managed */
  itemId: string | null;
  /** Original committed assets (read-only reference) */
  originalAssets: MediaItem[];
  /** Assets added but not yet committed */
  pendingAdditions: PendingAsset[];
  /** IDs of assets marked for removal */
  pendingRemovals: Set<string>;
  /** Current order of all assets (committed + pending additions, minus removals) */
  currentOrder: string[];
  /** Whether any changes have been made */
  isDirty: boolean;
  /** Whether a commit operation is in progress */
  isCommitting: boolean;
  /** Error from last operation */
  error: AssetManagementError | null;
}

/**
 * Actions for the asset management reducer.
 */
export type AssetManagementAction =
  // Session management
  | { type: 'START_SESSION'; payload: { itemId: string; assets: MediaItem[] } }
  | { type: 'END_SESSION' }
  // Asset operations
  | { type: 'ADD_ASSET'; payload: PendingAsset }
  | { type: 'REMOVE_ASSET'; payload: string }
  | { type: 'REORDER_ASSETS'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'UNDO_REMOVAL'; payload: string }
  // Commit/discard
  | { type: 'START_COMMIT' }
  | { type: 'COMMIT_SUCCESS' }
  | { type: 'COMMIT_ERROR'; payload: string }
  | { type: 'DISCARD_CHANGES' }
  // Error handling
  | { type: 'SET_ERROR'; payload: AssetManagementError }
  | { type: 'CLEAR_ERROR' };

/**
 * Configuration options for useAssetManagement hook.
 */
export interface UseAssetManagementOptions {
  /** Callback when assets are added during commit */
  onAddAssets?: (itemId: string, assets: File[]) => Promise<void>;
  /** Callback when assets are removed during commit */
  onRemoveAssets?: (itemId: string, assetIds: string[]) => Promise<void>;
  /** Callback when assets are reordered during commit */
  onReorderAssets?: (itemId: string, orderedIds: string[]) => Promise<void>;
  /** Allowed media types for validation */
  allowedMediaTypes?: ('video' | 'image' | 'pdf')[];
  /** Maximum file size in bytes */
  maxFileSize?: number;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Return type for useAssetManagement hook.
 */
export interface UseAssetManagementReturn {
  // State
  /** Whether a management session is active */
  isActive: boolean;
  /** Current assets (committed + pending additions - removals, in order) */
  currentAssets: (MediaItem | PendingAsset)[];
  /** Assets pending addition */
  pendingAdditions: PendingAsset[];
  /** IDs of assets pending removal */
  pendingRemovalIds: string[];
  /** Whether any changes have been made */
  isDirty: boolean;
  /** Whether commit is in progress */
  isCommitting: boolean;
  /** Current error state */
  error: AssetManagementError | null;

  // Session Actions
  /** Start managing assets for an item */
  startSession: (itemId: string, assets: MediaItem[]) => void;
  /** End session (must commit or discard first) */
  endSession: () => void;

  // Asset Actions
  /** Add a file to pending additions */
  addAsset: (file: File) => Promise<boolean>;
  /** Add multiple files to pending additions */
  addAssets: (files: File[]) => Promise<{ success: File[]; failed: File[] }>;
  /** Mark an asset for removal */
  removeAsset: (assetId: string) => void;
  /** Undo a pending removal (restore asset) */
  undoRemoval: (assetId: string) => void;
  /** Reorder assets */
  reorderAssets: (fromIndex: number, toIndex: number) => void;

  // Commit/Discard
  /** Commit all pending changes */
  commit: () => Promise<boolean>;
  /** Discard all pending changes */
  discard: () => void;

  // Computed
  /** Get an asset by ID (from current assets) */
  getAssetById: (id: string) => MediaItem | PendingAsset | null;
  /** Check if an asset is pending addition */
  isPendingAddition: (id: string) => boolean;
  /** Check if an asset is pending removal */
  isPendingRemoval: (id: string) => boolean;
  /** Get the effective order (all asset IDs in current order) */
  getOrderedIds: () => string[];

  // Error handling
  /** Clear current error */
  clearError: () => void;
}
```

**Verification Steps:**
- [ ] File compiles without TypeScript errors
- [ ] All interfaces are exported from `ItemManager.types.ts`
- [ ] Import from `@/components/ItemCapture/ItemCapture.types` resolves correctly
- [ ] All types are re-exported from `src/components/ItemManager/index.ts`

---

### Task 3: Implement Initial State Factory and Utility Functions

**Objective:** Create the initial state factory and helper utility functions for the hook.

**Story Points:** 0.5

**Steps:**

3.1. Create `src/components/ItemManager/hooks/useAssetManagement.ts` with initial structure:

```typescript
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

// Placeholder for reducer - will be implemented in Task 4
function assetManagementReducer(
  state: AssetManagementState,
  action: AssetManagementAction
): AssetManagementState {
  // Will be implemented in Task 4
  return state;
}

// Placeholder for hook export - will be implemented in Tasks 5-7
export function useAssetManagement(
  options: UseAssetManagementOptions = {}
): UseAssetManagementReturn {
  // Placeholder implementation
  throw new Error('Not yet implemented');
}

export default useAssetManagement;
```

3.2. Update `src/components/ItemManager/hooks/index.ts`:

```typescript
/**
 * ItemManager hooks barrel export
 *
 * @module ItemManager/hooks
 * @lastModified 2026-01-03
 */

export { useAssetManagement, default as useAssetManagementDefault } from './useAssetManagement';
export { createInitialState, getFileCategory, validateAssetFile, createPendingAsset } from './useAssetManagement';
```

**Verification Steps:**
- [ ] `createInitialState()` returns a properly structured state object
- [ ] `getFileCategory()` correctly identifies video, image, and PDF types
- [ ] `validateAssetFile()` returns errors for invalid files
- [ ] `createPendingAsset()` creates a pending asset with a preview URL
- [ ] All utility functions are exported from hooks index

---

### Task 4: Implement State Reducer

**Objective:** Implement the complete reducer function for asset management state.

**Story Points:** 0.75

**Steps:**

4.1. Replace the placeholder reducer in `src/components/ItemManager/hooks/useAssetManagement.ts` with the full implementation:

```typescript
// =============================================================================
// Reducer
// =============================================================================

/**
 * Reducer for asset management state transitions.
 * All state changes flow through this reducer for predictable state management.
 */
function assetManagementReducer(
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

// Helper function to compare arrays
function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
```

**Verification Steps:**
- [ ] START_SESSION initializes state with provided assets
- [ ] ADD_ASSET adds to pendingAdditions and currentOrder
- [ ] REMOVE_ASSET (pending) removes from pendingAdditions and revokes URL
- [ ] REMOVE_ASSET (committed) adds to pendingRemovals
- [ ] UNDO_REMOVAL restores asset to currentOrder
- [ ] REORDER_ASSETS moves items correctly in currentOrder
- [ ] DISCARD_CHANGES resets to original while keeping session
- [ ] All cases set isDirty appropriately
- [ ] TypeScript exhaustive check passes (no `default` fallthrough warning)

---

### Task 5: Implement Core Hook with Session and State Actions

**Objective:** Implement the main hook with session management, state reading, and basic actions.

**Story Points:** 0.75

**Steps:**

5.1. Replace the placeholder hook implementation with the core hook structure:

```typescript
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
```

**Verification Steps:**
- [ ] Hook initializes with inactive state
- [ ] `startSession` correctly initializes state with provided assets
- [ ] `addAsset` validates files and creates pending assets
- [ ] `removeAsset` correctly handles both pending and committed assets
- [ ] `reorderAssets` updates currentOrder correctly
- [ ] `commit` calls callbacks in correct order
- [ ] `discard` resets to original state
- [ ] All actions are memoized with `useCallback`
- [ ] `currentAssets` computed value is correct
- [ ] Cleanup effect runs on unmount

---

### Task 6: Add Unit Tests for Reducer and Utility Functions

**Objective:** Create unit tests for the reducer and utility functions.

**Story Points:** 0.5

**Steps:**

6.1. Create test file `src/components/ItemManager/hooks/__tests__/useAssetManagement.test.ts`:

```typescript
/**
 * Unit tests for useAssetManagement hook utilities and reducer
 *
 * @module ItemManager/hooks/__tests__/useAssetManagement
 * @lastModified 2026-01-03
 */

import {
  createInitialState,
  getFileCategory,
  validateAssetFile,
  createPendingAsset,
} from '../useAssetManagement';

describe('useAssetManagement utilities', () => {
  describe('createInitialState', () => {
    it('should create empty initial state', () => {
      const state = createInitialState();

      expect(state.itemId).toBeNull();
      expect(state.originalAssets).toEqual([]);
      expect(state.pendingAdditions).toEqual([]);
      expect(state.pendingRemovals.size).toBe(0);
      expect(state.currentOrder).toEqual([]);
      expect(state.isDirty).toBe(false);
      expect(state.isCommitting).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('getFileCategory', () => {
    it('should identify video types', () => {
      expect(getFileCategory('video/mp4')).toBe('video');
      expect(getFileCategory('video/webm')).toBe('video');
      expect(getFileCategory('video/quicktime')).toBe('video');
    });

    it('should identify image types', () => {
      expect(getFileCategory('image/jpeg')).toBe('image');
      expect(getFileCategory('image/png')).toBe('image');
      expect(getFileCategory('image/gif')).toBe('image');
      expect(getFileCategory('image/webp')).toBe('image');
    });

    it('should identify PDF type', () => {
      expect(getFileCategory('application/pdf')).toBe('pdf');
    });

    it('should return null for unknown types', () => {
      expect(getFileCategory('text/plain')).toBeNull();
      expect(getFileCategory('application/json')).toBeNull();
    });

    it('should be case-insensitive', () => {
      expect(getFileCategory('VIDEO/MP4')).toBe('video');
      expect(getFileCategory('Image/JPEG')).toBe('image');
    });
  });

  describe('validateAssetFile', () => {
    const createMockFile = (name: string, type: string, size: number): File => {
      return new File([''], name, { type }) as File & { size: number };
    };

    it('should accept valid files', () => {
      const file = createMockFile('test.jpg', 'image/jpeg', 1000);
      Object.defineProperty(file, 'size', { value: 1000 });

      const result = validateAssetFile(file, {});
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject files exceeding max size', () => {
      const file = createMockFile('test.jpg', 'image/jpeg', 200 * 1024 * 1024);
      Object.defineProperty(file, 'size', { value: 200 * 1024 * 1024 });

      const result = validateAssetFile(file, { maxSize: 100 * 1024 * 1024 });
      expect(result.valid).toBe(false);
      expect(result.error?.code).toBe('FILE_TOO_LARGE');
    });

    it('should reject unsupported file types', () => {
      const file = createMockFile('test.txt', 'text/plain', 1000);
      Object.defineProperty(file, 'size', { value: 1000 });

      const result = validateAssetFile(file, {});
      expect(result.valid).toBe(false);
      expect(result.error?.code).toBe('INVALID_FILE_TYPE');
    });

    it('should reject file types not in allowed list', () => {
      const file = createMockFile('test.pdf', 'application/pdf', 1000);
      Object.defineProperty(file, 'size', { value: 1000 });

      const result = validateAssetFile(file, { allowedTypes: ['image', 'video'] });
      expect(result.valid).toBe(false);
      expect(result.error?.code).toBe('INVALID_FILE_TYPE');
    });
  });

  describe('createPendingAsset', () => {
    beforeAll(() => {
      // Mock URL.createObjectURL
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should create pending asset with correct structure', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

      const asset = createPendingAsset(file);

      expect(asset.id).toMatch(/^pending-/);
      expect(asset.file).toBe(file);
      expect(asset.previewUrl).toBe('blob:mock-url');
      expect(asset.type).toBe('image');
      expect(asset.addedAt).toBeInstanceOf(Date);
    });

    it('should generate unique IDs', () => {
      const file1 = new File([''], 'test1.jpg', { type: 'image/jpeg' });
      const file2 = new File([''], 'test2.jpg', { type: 'image/jpeg' });

      const asset1 = createPendingAsset(file1);
      const asset2 = createPendingAsset(file2);

      expect(asset1.id).not.toBe(asset2.id);
    });
  });
});
```

**Verification Steps:**
- [ ] All tests pass with `npm test`
- [ ] Tests cover all utility functions
- [ ] Tests cover edge cases (empty files, invalid types, size limits)
- [ ] Mocks are properly cleaned up after tests

---

### Task 7: Create Integration Test Harness

**Objective:** Add test component to the test page for manual verification.

**Story Points:** 0.5

**Steps:**

7.1. Update or create test page at `src/app/test/item-manager/page.tsx` to include asset management hook test:

```typescript
'use client';

/**
 * Test harness for ItemManager components
 *
 * @module test/item-manager
 * @lastModified 2026-01-03
 */

import { useState, useCallback } from 'react';
import { useAssetManagement } from '@/components/ItemManager';
import type { MediaItem } from '@/components/ItemCapture/ItemCapture.types';

// Mock MediaItem data for testing
const createMockMediaItem = (id: string, type: 'video' | 'image' | 'pdf'): MediaItem => ({
  id,
  type,
  file: new Blob(['mock content'], { type: type === 'pdf' ? 'application/pdf' : `${type}/mock` }),
  order: 0,
  metadata: {
    mimeType: type === 'pdf' ? 'application/pdf' : `${type}/mock`,
    fileSize: 1024,
    source: 'upload',
  },
});

const mockAssets: MediaItem[] = [
  createMockMediaItem('asset-1', 'image'),
  createMockMediaItem('asset-2', 'video'),
  createMockMediaItem('asset-3', 'pdf'),
];

export default function TestItemManagerPage() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  }, []);

  const {
    isActive,
    currentAssets,
    pendingAdditions,
    pendingRemovalIds,
    isDirty,
    isCommitting,
    error,
    startSession,
    endSession,
    addAsset,
    removeAsset,
    undoRemoval,
    reorderAssets,
    commit,
    discard,
    isPendingAddition,
    isPendingRemoval,
  } = useAssetManagement({
    debug: true,
    onAddAssets: async (itemId, files) => {
      addLog(`onAddAssets called: itemId=${itemId}, files=${files.length}`);
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
    onRemoveAssets: async (itemId, assetIds) => {
      addLog(`onRemoveAssets called: itemId=${itemId}, assetIds=${assetIds.join(', ')}`);
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
    onReorderAssets: async (itemId, orderedIds) => {
      addLog(`onReorderAssets called: itemId=${itemId}, order=${orderedIds.join(', ')}`);
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
  });

  const handleStartSession = () => {
    startSession('test-item-123', mockAssets);
    addLog('Session started with 3 mock assets');
  };

  const handleAddFile = () => {
    const file = new File(['test content'], 'test-image.jpg', { type: 'image/jpeg' });
    addAsset(file).then((success) => {
      addLog(`Add file result: ${success ? 'success' : 'failed'}`);
    });
  };

  const handleRemoveFirst = () => {
    if (currentAssets.length > 0) {
      const first = currentAssets[0];
      removeAsset(first.id);
      addLog(`Removed asset: ${first.id}`);
    }
  };

  const handleReorder = () => {
    if (currentAssets.length >= 2) {
      reorderAssets(0, 1);
      addLog('Reordered: moved first asset to second position');
    }
  };

  const handleCommit = async () => {
    addLog('Committing changes...');
    const success = await commit();
    addLog(`Commit result: ${success ? 'success' : 'failed'}`);
  };

  const handleDiscard = () => {
    discard();
    addLog('Changes discarded');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">useAssetManagement Hook Test</h1>

        {/* Status Panel */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="font-semibold mb-2">Hook State</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">isActive:</span>{' '}
              <span className={isActive ? 'text-green-600' : 'text-gray-500'}>
                {isActive ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="font-medium">isDirty:</span>{' '}
              <span className={isDirty ? 'text-orange-600' : 'text-gray-500'}>
                {isDirty ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="font-medium">isCommitting:</span>{' '}
              <span className={isCommitting ? 'text-blue-600' : 'text-gray-500'}>
                {isCommitting ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="font-medium">currentAssets:</span> {currentAssets.length}
            </div>
            <div>
              <span className="font-medium">pendingAdditions:</span> {pendingAdditions.length}
            </div>
            <div>
              <span className="font-medium">pendingRemovals:</span> {pendingRemovalIds.length}
            </div>
          </div>
          {error && (
            <div className="mt-2 p-2 bg-red-100 text-red-700 rounded text-sm">
              Error: {error.message} ({error.code})
            </div>
          )}
        </div>

        {/* Actions Panel */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="font-semibold mb-2">Actions</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleStartSession}
              disabled={isActive}
              className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              Start Session
            </button>
            <button
              onClick={() => { endSession(); addLog('Session ended'); }}
              disabled={!isActive}
              className="px-3 py-1 bg-gray-500 text-white rounded disabled:opacity-50"
            >
              End Session
            </button>
            <button
              onClick={handleAddFile}
              disabled={!isActive}
              className="px-3 py-1 bg-green-500 text-white rounded disabled:opacity-50"
            >
              Add File
            </button>
            <button
              onClick={handleRemoveFirst}
              disabled={!isActive || currentAssets.length === 0}
              className="px-3 py-1 bg-red-500 text-white rounded disabled:opacity-50"
            >
              Remove First
            </button>
            <button
              onClick={handleReorder}
              disabled={!isActive || currentAssets.length < 2}
              className="px-3 py-1 bg-purple-500 text-white rounded disabled:opacity-50"
            >
              Swap 1 & 2
            </button>
            <button
              onClick={handleCommit}
              disabled={!isActive || !isDirty || isCommitting}
              className="px-3 py-1 bg-emerald-500 text-white rounded disabled:opacity-50"
            >
              Commit
            </button>
            <button
              onClick={handleDiscard}
              disabled={!isActive || !isDirty}
              className="px-3 py-1 bg-orange-500 text-white rounded disabled:opacity-50"
            >
              Discard
            </button>
          </div>
        </div>

        {/* Current Assets Panel */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="font-semibold mb-2">Current Assets</h2>
          {currentAssets.length === 0 ? (
            <p className="text-gray-500 text-sm">No assets</p>
          ) : (
            <ul className="space-y-2">
              {currentAssets.map((asset, index) => (
                <li
                  key={asset.id}
                  className={`p-2 rounded text-sm flex justify-between ${
                    isPendingAddition(asset.id)
                      ? 'bg-green-100 border border-green-300'
                      : isPendingRemoval(asset.id)
                      ? 'bg-red-100 border border-red-300'
                      : 'bg-gray-100'
                  }`}
                >
                  <span>
                    {index + 1}. {asset.id} ({asset.type})
                    {isPendingAddition(asset.id) && ' [PENDING ADD]'}
                    {isPendingRemoval(asset.id) && ' [PENDING REMOVE]'}
                  </span>
                  {isPendingRemoval(asset.id) && (
                    <button
                      onClick={() => { undoRemoval(asset.id); addLog(`Undo removal: ${asset.id}`); }}
                      className="text-blue-600 hover:underline"
                    >
                      Undo
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Logs Panel */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-2">Event Log</h2>
          <div className="h-48 overflow-y-auto bg-gray-900 text-green-400 p-2 rounded text-xs font-mono">
            {logs.length === 0 ? (
              <p className="text-gray-500">No events yet</p>
            ) : (
              logs.map((log, i) => <div key={i}>{log}</div>)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Verification Steps:**
- [ ] Page renders without errors at `/test/item-manager`
- [ ] "Start Session" initializes state correctly
- [ ] "Add File" adds a pending asset
- [ ] "Remove First" marks asset for removal or removes pending
- [ ] "Swap 1 & 2" reorders assets
- [ ] "Commit" triggers callbacks and clears state
- [ ] "Discard" resets to original state
- [ ] Event log shows all operations
- [ ] No network requests are made (verify in browser DevTools)

---

### Task 8: Update Exports and Final Integration

**Objective:** Ensure all exports are properly configured and hook is accessible.

**Story Points:** 0.25

**Steps:**

8.1. Verify `src/components/ItemManager/hooks/index.ts` exports:

```typescript
/**
 * ItemManager hooks barrel export
 *
 * @module ItemManager/hooks
 * @lastModified 2026-01-03
 */

// Main hook
export { useAssetManagement } from './useAssetManagement';
export { default as useAssetManagementDefault } from './useAssetManagement';

// Utility functions (for testing and advanced use)
export {
  createInitialState,
  getFileCategory,
  validateAssetFile,
  createPendingAsset,
} from './useAssetManagement';
```

8.2. Verify `src/components/ItemManager/index.ts` exports:

```typescript
/**
 * ItemManager component barrel export
 *
 * @module ItemManager
 * @lastModified 2026-01-03
 */

// Types
export * from './ItemManager.types';

// Hooks
export * from './hooks';
```

8.3. Verify imports work from root:

```typescript
// This should work in any component:
import { useAssetManagement } from '@/components/ItemManager';
import type { PendingAsset, AssetManagementError } from '@/components/ItemManager';
```

**Verification Steps:**
- [ ] `npm run build` completes without errors
- [ ] All types are importable from `@/components/ItemManager`
- [ ] Hook is importable from `@/components/ItemManager`
- [ ] No circular dependency warnings
- [ ] TypeScript IntelliSense shows all exports correctly

---

## Acceptance Criteria Checklist

From REQ-080:

- [ ] Pending additions to the asset collection are tracked in temporary state separate from committed assets
- [ ] Pending removals are tracked without immediately deleting assets from the server or database
- [ ] Reordering operations update only the temporary state until committed
- [ ] An action is provided to add new assets to the pending changes collection
- [ ] An action is provided to mark existing assets for removal in the pending changes
- [ ] An action is provided to reorder assets within the pending changes collection
- [ ] All pending changes are clearly distinguishable from the original asset state
- [ ] When changes are committed, all pending operations are applied in the correct sequence
- [ ] When changes are discarded, the asset state returns to its original configuration
- [ ] The temporary state correctly handles edge cases such as adding then removing the same asset before committing

### Additional Technical Criteria:

- [ ] Hook uses `'use client'` directive
- [ ] TypeScript strict mode compliance with no `any` types
- [ ] Actions are memoized with `useCallback`
- [ ] Computed values use `useMemo`
- [ ] Object URLs are properly cleaned up (no memory leaks)
- [ ] Console logging available in debug mode
- [ ] No external dependencies beyond React

---

## Edge Cases Verification

| Edge Case | How to Test | Expected Result |
|-----------|-------------|-----------------|
| Add then remove same asset | Add file, then remove it before commit | Asset fully removed, not in commit payload |
| Remove then undo removal | Remove committed asset, then undo | Asset restored to position in order |
| Reorder during active removals | Remove asset, then reorder remaining | Order consistent, removed asset not in order |
| Session change while dirty | Start new session with pending changes | Previous changes discarded, new session starts |
| Commit failure | Mock callback to throw error | State remains dirty, error is set |
| Empty commit | Call commit with no changes | No callbacks triggered, returns true |
| Multiple files at once | Call addAssets with array | All valid files added, failed ones returned |

---

## Manual Testing Checklist

After implementation, verify the following in the browser:

1. [ ] Navigate to `/test/item-manager`
2. [ ] Click "Start Session" - verify 3 mock assets appear
3. [ ] Click "Add File" - verify new asset with green highlight
4. [ ] Click "Remove First" - verify asset removed or marked red
5. [ ] Click "Swap 1 & 2" - verify order changes
6. [ ] Click "Commit" - verify callbacks logged, state resets
7. [ ] Start new session, make changes, click "Discard" - verify original state restored
8. [ ] Open browser DevTools Network tab - verify no requests made

---

## Document History

| Date | Author | Changes |
|------|--------|---------|
| 2026-01-03 11:45:00 | Senior Dev Agent | Initial document creation |
