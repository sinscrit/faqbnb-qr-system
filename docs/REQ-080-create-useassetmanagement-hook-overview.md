# REQ-080: Create useAssetManagement Hook - Technical Overview

**Document Created:** 2026-01-03
**Last Modified:** 2026-01-03
**Request Reference:** REQ-080 in `/docs/gen_requests.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 5 - Asset Management
**Task ID:** 5.1
**Estimated Effort:** 1-2 story points

---

## Summary

Create the `useAssetManagement` hook to manage pending asset changes (additions, removals, reorders) in a temporary state until the user explicitly commits them. This hook serves as the state management foundation for the Asset Panel (Task 5.2) and enables a non-destructive editing workflow where users can preview all changes before persisting them.

The hook implements a batched change model where all operations are staged locally and only applied when the user confirms via a "Done" action, or discarded entirely via a "Cancel" action.

---

## Technical Context

### Existing Stack
| Technology | Version | Notes |
|------------|---------|-------|
| Next.js | 15.5.9 | With Turbopack |
| React | 19.1.0 | |
| TypeScript | 5.x | Strict mode enabled |
| Tailwind CSS | 4.x | Utility-first styling |
| Lucide React | 0.525.0 | Icon library |

### Relevant Existing Patterns

| Pattern | Source File | Notes |
|---------|-------------|-------|
| State machine hook | `src/components/ItemCapture/hooks/useItemCaptureState.ts` | Reducer-based state with `useReducer`, memoized actions via `useCallback`, computed values via `useMemo` |
| Media management | `src/components/ItemCapture/hooks/useMediaEditor.ts` | Tracks edit sessions with pending changes, confirms/cancels edits |
| Type definitions | `src/components/ItemCapture/ItemCapture.types.ts` | MediaItem, MediaMetadata interfaces |
| Utility function | `src/lib/utils.ts` | `cn()` for class merging |

### Target Architecture (from Implementation Plan)

```
src/components/ItemManager/
├── hooks/
│   ├── useItemManagerState.ts    (Task 1.2 - exists)
│   ├── useItemSearch.ts          (Task 2.1)
│   ├── useItemSelection.ts       (Task 3.1)
│   └── useAssetManagement.ts     <-- THIS TASK
├── components/
│   ├── AssetPanel/
│   │   ├── AssetPanel.tsx        (Task 5.2 - depends on this hook)
│   │   ├── AssetItem.tsx         (Task 5.3)
│   │   └── AssetDropZone.tsx     (Task 5.4)
```

---

## Dependencies

### Phase Dependencies
- **Requires:** Phase 4 complete (ItemPreviewModal, MediaGallery)
- **Blocks:** Tasks 5.2-5.6 (AssetPanel, AssetItem, AssetDropZone, Drag-and-Drop, Remove Confirmation)

### Task Dependencies
```
5.1 useAssetManagement Hook  <-- THIS TASK
         │
         ▼
5.2 AssetPanel Component
         │
    ┌────┴────┐
    ▼         ▼
  5.3       5.4
AssetItem  AssetDropZone
         │
         ▼
5.5 Drag-and-Drop Reorder
         │
         ▼
5.6 Asset Remove Confirmation
```

---

## Implementation Requirements

### Core Functionality

1. **Pending Changes Tracking**
   - Track assets marked for addition (new files not yet committed)
   - Track assets marked for removal (existing assets to be deleted on commit)
   - Track current asset order (reflecting any reorder operations)
   - Distinguish pending changes visually from committed state

2. **Add Asset Action**
   - Accept new `File` objects or `MediaItem` structures
   - Assign temporary IDs to pending additions
   - Validate file types against allowed media types
   - Append to current asset order

3. **Remove Asset Action**
   - Mark existing assets for removal without immediate deletion
   - Immediately remove pending additions (not yet committed)
   - Handle edge case: adding then removing same asset before commit

4. **Reorder Assets Action**
   - Support drag-and-drop reordering via from/to index
   - Update order property on all affected assets
   - Apply to combined view of committed + pending additions

5. **Commit Changes**
   - Apply all pending operations in correct sequence
   - Return final asset list with updated order values
   - Clear pending state after successful commit
   - Emit callbacks for adds, removes, and reorders

6. **Discard Changes**
   - Reset to original asset state
   - Clear all pending additions, removals, and reorder state
   - Revoke any object URLs created for pending additions

### State Structure

```typescript
interface AssetManagementState {
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

interface PendingAsset {
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

interface AssetManagementError {
  code: 'INVALID_FILE_TYPE' | 'FILE_TOO_LARGE' | 'COMMIT_FAILED' | 'UNKNOWN_ERROR';
  message: string;
}
```

### Actions (Reducer Pattern)

```typescript
type AssetManagementAction =
  // Session management
  | { type: 'START_SESSION'; payload: { itemId: string; assets: MediaItem[] } }
  | { type: 'END_SESSION' }

  // Asset operations
  | { type: 'ADD_ASSET'; payload: PendingAsset }
  | { type: 'REMOVE_ASSET'; payload: string } // asset ID
  | { type: 'REORDER_ASSETS'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'UNDO_REMOVAL'; payload: string } // asset ID

  // Commit/discard
  | { type: 'START_COMMIT' }
  | { type: 'COMMIT_SUCCESS' }
  | { type: 'COMMIT_ERROR'; payload: string }
  | { type: 'DISCARD_CHANGES' }

  // Error handling
  | { type: 'SET_ERROR'; payload: AssetManagementError }
  | { type: 'CLEAR_ERROR' };
```

### Hook Interface

```typescript
interface UseAssetManagementOptions {
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

interface UseAssetManagementReturn {
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

---

## Implementation Approach

### Recommended Pattern: useReducer with Memoized Actions

Follow the established pattern from `useItemCaptureState.ts`:

```typescript
'use client';

import { useReducer, useCallback, useMemo } from 'react';

function assetManagementReducer(
  state: AssetManagementState,
  action: AssetManagementAction
): AssetManagementState {
  switch (action.type) {
    case 'START_SESSION':
      return {
        ...createInitialState(),
        itemId: action.payload.itemId,
        originalAssets: action.payload.assets,
        currentOrder: action.payload.assets.map(a => a.id),
      };

    case 'ADD_ASSET':
      return {
        ...state,
        pendingAdditions: [...state.pendingAdditions, action.payload],
        currentOrder: [...state.currentOrder, action.payload.id],
        isDirty: true,
      };

    case 'REMOVE_ASSET': {
      const isPending = state.pendingAdditions.some(a => a.id === action.payload);
      if (isPending) {
        // Remove from pending additions entirely
        const pending = state.pendingAdditions.find(a => a.id === action.payload);
        if (pending?.previewUrl) {
          URL.revokeObjectURL(pending.previewUrl);
        }
        return {
          ...state,
          pendingAdditions: state.pendingAdditions.filter(a => a.id !== action.payload),
          currentOrder: state.currentOrder.filter(id => id !== action.payload),
          isDirty: true,
        };
      }
      // Mark committed asset for removal
      return {
        ...state,
        pendingRemovals: new Set([...state.pendingRemovals, action.payload]),
        currentOrder: state.currentOrder.filter(id => id !== action.payload),
        isDirty: true,
      };
    }

    case 'REORDER_ASSETS': {
      const { fromIndex, toIndex } = action.payload;
      const newOrder = [...state.currentOrder];
      const [removed] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, removed);
      return {
        ...state,
        currentOrder: newOrder,
        isDirty: true,
      };
    }

    // ... additional cases

    default:
      return state;
  }
}

export function useAssetManagement(options: UseAssetManagementOptions = {}): UseAssetManagementReturn {
  const [state, dispatch] = useReducer(assetManagementReducer, undefined, createInitialState);

  // Memoized actions
  const addAsset = useCallback(async (file: File): Promise<boolean> => {
    // Validate file
    // Create preview URL
    // Dispatch ADD_ASSET
  }, []);

  // Computed values
  const currentAssets = useMemo(() => {
    // Combine originalAssets and pendingAdditions
    // Filter out pendingRemovals
    // Sort by currentOrder
  }, [state.originalAssets, state.pendingAdditions, state.pendingRemovals, state.currentOrder]);

  return {
    isActive: state.itemId !== null,
    currentAssets,
    // ... rest of return
  };
}
```

### File Validation

Reuse validation logic from `useFileUpload.ts` or create shared utility:

```typescript
function validateAssetFile(
  file: File,
  options: { allowedTypes?: string[]; maxSize?: number }
): { valid: boolean; error?: string } {
  const mimeType = file.type.toLowerCase();
  const category = getFileCategory(mimeType);

  if (options.allowedTypes && !options.allowedTypes.includes(category)) {
    return { valid: false, error: `File type ${category} not allowed` };
  }

  if (options.maxSize && file.size > options.maxSize) {
    return { valid: false, error: `File size exceeds ${formatBytes(options.maxSize)}` };
  }

  return { valid: true };
}
```

### Preview URL Management

Create object URLs for pending additions and clean up on removal/discard:

```typescript
// On add
const previewUrl = URL.createObjectURL(file);

// On remove/discard
URL.revokeObjectURL(previewUrl);

// Cleanup on unmount
useEffect(() => {
  return () => {
    state.pendingAdditions.forEach(asset => {
      if (asset.previewUrl) {
        URL.revokeObjectURL(asset.previewUrl);
      }
    });
  };
}, []);
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/ItemManager/hooks/useAssetManagement.ts` | Main hook implementation |

### Files to Modify

| File | Change |
|------|--------|
| `src/components/ItemManager/hooks/index.ts` | Export `useAssetManagement` |
| `src/components/ItemManager/ItemManager.types.ts` | Add `AssetManagementState`, `PendingAsset`, `AssetManagementError`, `UseAssetManagementOptions`, `UseAssetManagementReturn` interfaces |
| `src/components/ItemManager/index.ts` | Re-export hook if needed for external use |

### Functions/Components to Create

| Name | Location | Purpose |
|------|----------|---------|
| `useAssetManagement` | `hooks/useAssetManagement.ts` | Main hook |
| `assetManagementReducer` | `hooks/useAssetManagement.ts` | State reducer |
| `createInitialState` | `hooks/useAssetManagement.ts` | Initial state factory |
| `validateAssetFile` | `hooks/useAssetManagement.ts` or shared util | File validation |
| `getFileCategory` | `hooks/useAssetManagement.ts` or shared util | Determine file type category |

---

## Acceptance Criteria

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

### Additional Technical Criteria

- [ ] Hook uses `'use client'` directive
- [ ] TypeScript strict mode compliance with no `any` types
- [ ] Actions are memoized with `useCallback`
- [ ] Computed values use `useMemo`
- [ ] Object URLs are properly cleaned up (no memory leaks)
- [ ] Console logging available in debug mode
- [ ] No external dependencies beyond React

---

## Edge Cases

1. **Add then remove same asset**
   - Pending addition should be fully removed from state
   - Preview URL should be revoked
   - Asset should not appear in commit payload

2. **Remove then re-add (undo removal)**
   - Asset should be restored to its position in order
   - `pendingRemovals` Set should have the ID removed
   - Asset should appear in final committed state

3. **Reorder during active removals**
   - Reorder should only affect `currentOrder`
   - Removed assets should not be in `currentOrder`
   - Order should be consistent after commit

4. **Session change while dirty**
   - Starting a new session should warn/prevent if dirty
   - Or auto-discard pending changes

5. **Commit failure**
   - State should remain dirty
   - Pending changes should be preserved for retry
   - Error should be set

6. **Empty commit**
   - If no changes, commit should be a no-op
   - Should not trigger callbacks

---

## Testing Approach

### Unit Tests

- [ ] Reducer: START_SESSION initializes state correctly
- [ ] Reducer: ADD_ASSET adds to pendingAdditions and currentOrder
- [ ] Reducer: REMOVE_ASSET (pending) removes from pendingAdditions
- [ ] Reducer: REMOVE_ASSET (committed) adds to pendingRemovals
- [ ] Reducer: REORDER_ASSETS updates currentOrder correctly
- [ ] Reducer: DISCARD_CHANGES resets to original state
- [ ] Hook: `addAsset` validates file types
- [ ] Hook: `addAsset` validates file size
- [ ] Hook: `currentAssets` computed correctly
- [ ] Hook: `commit` calls callbacks in correct order

### Integration Tests

- [ ] Full workflow: add, remove, reorder, commit
- [ ] Full workflow: add, remove, discard
- [ ] Multiple additions and removals before commit

### Manual Testing Checklist

Add to `/src/app/test/item-manager/page.tsx`:

```tsx
const {
  startSession,
  addAsset,
  removeAsset,
  reorderAssets,
  commit,
  discard,
  currentAssets,
  isDirty
} = useAssetManagement({
  onAddAssets: async (itemId, files) => {
    console.log('=== ADD ASSETS ===', itemId, files);
  },
  onRemoveAssets: async (itemId, ids) => {
    console.log('=== REMOVE ASSETS ===', itemId, ids);
  },
  onReorderAssets: async (itemId, orderedIds) => {
    console.log('=== REORDER ASSETS ===', itemId, orderedIds);
  },
});

// Test buttons to exercise each action
```

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Object URL memory leaks | Medium | Medium | Implement cleanup in reducer and useEffect |
| State desync with parent | Low | High | Clear callback contracts; parent is source of truth after commit |
| Large file previews slow performance | Medium | Low | Consider limiting preview generation for videos |
| Race conditions on rapid add/remove | Low | Low | Reducer is synchronous; actions are atomic |

---

## References

- [Implementation Plan - Phase 5](/docs/prd/item-capture-manager-implementation-plan.md#phase-5-asset-management-estimated-3-4-days)
- [useItemCaptureState Pattern](/src/components/ItemCapture/hooks/useItemCaptureState.ts)
- [useMediaEditor Pattern](/src/components/ItemCapture/hooks/useMediaEditor.ts)
- [ItemCapture Types](/src/components/ItemCapture/ItemCapture.types.ts)
- [REQ-080 in gen_requests.md](/docs/gen_requests.md)

---

## Document History

| Date | Author | Changes |
|------|--------|---------|
| 2026-01-03 | Tech Lead Agent | Initial document creation |
