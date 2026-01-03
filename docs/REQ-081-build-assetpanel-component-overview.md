# REQ-081: Build AssetPanel Component - Technical Overview

**Document Created:** 2026-01-03
**Last Modified:** 2026-01-03
**Request Reference:** REQ-081 in `/docs/gen_requests.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 5 - Asset Management
**Task ID:** 5.2
**Estimated Effort:** 2-3 story points

---

## Summary

Build the `AssetPanel` component as a slide-in drawer from the right side of the screen that allows users to view, add, and manage media assets for an item without navigating away from the current context. The panel provides a focused workspace for asset management with clear commit/discard semantics.

This component consumes the `useAssetManagement` hook (Task 5.1) for state management and serves as the container for `AssetItem` (Task 5.3) and `AssetDropZone` (Task 5.4) child components.

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
| Utility | `cn()` | Class merging from `src/lib/utils.ts` |

### Relevant Existing Patterns

| Pattern | Source File | Notes |
|---------|-------------|-------|
| Modal overlay | `src/components/ConfirmationModal.tsx` | Fixed overlay with backdrop, z-50 layering |
| State machine hook | `src/components/ItemCapture/hooks/useItemCaptureState.ts` | Reducer-based state with `useReducer` |
| Thumbnail display | `src/components/ItemCapture/components/shared/MediaThumbnail.tsx` | Object URL management, size variants, type indicators |
| Component props pattern | `src/components/ItemCapture/ItemCapture.types.ts` | Comprehensive interface definitions |
| Button styling | `src/components/ConfirmationModal.tsx` | Consistent button styling with loading states |

### Target Architecture (from Implementation Plan)

```
src/components/ItemManager/
├── components/
│   ├── AssetPanel/
│   │   ├── AssetPanel.tsx        <-- THIS TASK
│   │   ├── AssetItem.tsx         (Task 5.3 - child component)
│   │   └── AssetDropZone.tsx     (Task 5.4 - child component)
```

---

## Dependencies

### Phase Dependencies
- **Requires:** Task 5.1 (useAssetManagement hook) - Provides state management for pending changes
- **Requires:** Phase 4 complete (ItemPreviewModal, MediaGallery) - Panel opens from preview context
- **Blocks:** Tasks 5.3-5.6 (AssetItem, AssetDropZone, Drag-and-Drop, Remove Confirmation)

### Task Dependencies
```
5.1 useAssetManagement Hook (REQUIRED)
         │
         ▼
5.2 AssetPanel Component   <-- THIS TASK
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

### Type Dependencies

From `useAssetManagement` hook (Task 5.1):
```typescript
import type {
  MediaItem,
  PendingAsset,
  UseAssetManagementReturn
} from '../../ItemManager.types';
```

From `ItemCapture` types:
```typescript
import type { MediaItem } from '@/components/ItemCapture';
```

---

## Implementation Requirements

### Core Functionality

1. **Slide-In Drawer from Right**
   - Fixed position drawer anchored to right edge
   - Animated slide-in transition (transform: translateX)
   - Width: 400px on desktop, 100% on mobile
   - Full viewport height (or constrained to parent)
   - z-index layering above content (z-50 or higher)

2. **Backdrop Overlay**
   - Semi-transparent backdrop (bg-black/50)
   - Clicking backdrop triggers cancel behavior
   - Backdrop animates with drawer

3. **Asset List Display**
   - Scrollable list of current assets
   - Each asset shows thumbnail representation
   - Distinguishes pending additions vs committed assets
   - Distinguishes pending removals (strikethrough/dimmed)
   - Maintains order from `useAssetManagement.currentAssets`

4. **Add Media Button**
   - Prominent button to trigger file upload
   - Opens file picker or integrates with AssetDropZone
   - Positioned at top of list or as floating action

5. **Done Button**
   - Commits all pending changes via `useAssetManagement.commit()`
   - Closes drawer on successful commit
   - Shows loading state during commit
   - Disabled when no changes (`!isDirty`)

6. **Cancel Button**
   - Discards all pending changes via `useAssetManagement.discard()`
   - Closes drawer immediately
   - No confirmation needed (user explicitly cancels)

7. **Escape Key & Click Outside**
   - Pressing Escape triggers cancel behavior
   - Clicking outside drawer (on backdrop) triggers cancel
   - Consistent with modal interaction patterns

8. **Accessibility**
   - Keyboard navigation within drawer
   - Focus trapped inside drawer when open
   - ARIA attributes: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
   - Screen reader announcements for open/close

9. **Mobile Responsiveness**
   - Full-width drawer on mobile screens (<640px)
   - Bottom sheet variant considered for future enhancement
   - Touch-friendly button sizes (min 48x48px)

### Component Props

```typescript
interface AssetPanelProps {
  /** Whether the panel is visible */
  isOpen: boolean;

  /** The item whose assets are being managed */
  item: ItemRecord;

  /** Callback when panel requests to close (user commits or cancels) */
  onClose: () => void;

  /** Callback when assets are added (forwarded to useAssetManagement) */
  onAddAssets?: (itemId: string, assets: File[]) => Promise<void>;

  /** Callback when assets are removed (forwarded to useAssetManagement) */
  onRemoveAssets?: (itemId: string, assetIds: string[]) => Promise<void>;

  /** Callback when assets are reordered (forwarded to useAssetManagement) */
  onReorderAssets?: (itemId: string, orderedIds: string[]) => Promise<void>;

  /** Optional class names for customization */
  className?: string;

  /** Configuration for allowed media types */
  allowedMediaTypes?: ('video' | 'image' | 'pdf')[];

  /** Maximum file size in bytes */
  maxFileSize?: number;
}
```

### State Management Integration

The component uses `useAssetManagement` hook internally:

```typescript
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
  addAssets,
  removeAsset,
  undoRemoval,
  reorderAssets,
  commit,
  discard,
  isPendingAddition,
  isPendingRemoval,
  clearError,
} = useAssetManagement({
  onAddAssets: props.onAddAssets,
  onRemoveAssets: props.onRemoveAssets,
  onReorderAssets: props.onReorderAssets,
  allowedMediaTypes: props.allowedMediaTypes,
  maxFileSize: props.maxFileSize,
});

// Start session when panel opens
useEffect(() => {
  if (isOpen && item) {
    startSession(item.id, item.media);
  }
  return () => {
    if (isActive) {
      endSession();
    }
  };
}, [isOpen, item?.id]);
```

---

## Visual Design

### Layout Structure

```
┌──────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  Asset Panel   │
│ ▓▓▓ BACKDROP ▓▓▓▓▓▓▓│                │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ ┌────────────┐ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ │ + Add Media│ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ └────────────┘ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│                │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ ┌────────────┐ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ │  Asset 1   │ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ │  [thumb]   │ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ └────────────┘ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ ┌────────────┐ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ │  Asset 2   │ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ │  [thumb]   │ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ └────────────┘ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│      ...       │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│                │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ ┌─────┬──────┐ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ │Cancel│ Done │ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ └─────┴──────┘ │
└──────────────────────────────────────┘
```

### Animation Specification

```css
/* Drawer slide-in */
.drawer-closed {
  transform: translateX(100%);
}

.drawer-open {
  transform: translateX(0);
  transition: transform 300ms ease-out;
}

/* Backdrop fade */
.backdrop-closed {
  opacity: 0;
  pointer-events: none;
}

.backdrop-open {
  opacity: 1;
  transition: opacity 200ms ease-out;
}
```

### Tailwind Implementation

```tsx
// Backdrop
<div
  className={cn(
    'fixed inset-0 bg-black/50 z-40 transition-opacity duration-200',
    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
  )}
  onClick={handleCancel}
  aria-hidden="true"
/>

// Drawer
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="asset-panel-title"
  className={cn(
    'fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-white shadow-xl',
    'transform transition-transform duration-300 ease-out',
    isOpen ? 'translate-x-0' : 'translate-x-full'
  )}
>
  {/* Header */}
  <div className="flex items-center justify-between p-4 border-b">
    <h2 id="asset-panel-title" className="text-lg font-semibold">
      Manage Assets
    </h2>
    <button
      onClick={handleCancel}
      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
      aria-label="Close panel"
    >
      <X className="w-5 h-5" />
    </button>
  </div>

  {/* Content - Scrollable */}
  <div className="flex-1 overflow-y-auto p-4 space-y-3">
    {/* Add Media Button */}
    <button
      onClick={handleAddMedia}
      className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
    >
      <Plus className="w-5 h-5" />
      Add Media
    </button>

    {/* Asset List */}
    {currentAssets.map((asset, index) => (
      <AssetItem
        key={asset.id}
        asset={asset}
        index={index}
        isPending={isPendingAddition(asset.id)}
        isMarkedForRemoval={isPendingRemoval(asset.id)}
        onRemove={() => removeAsset(asset.id)}
        onRestore={() => undoRemoval(asset.id)}
      />
    ))}

    {/* Empty State */}
    {currentAssets.length === 0 && (
      <div className="text-center py-12 text-gray-500">
        <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>No assets yet</p>
        <p className="text-sm">Add media to get started</p>
      </div>
    )}
  </div>

  {/* Footer - Fixed */}
  <div className="border-t p-4 flex gap-3">
    <button
      onClick={handleCancel}
      disabled={isCommitting}
      className="flex-1 py-2 px-4 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
    >
      Cancel
    </button>
    <button
      onClick={handleDone}
      disabled={!isDirty || isCommitting}
      className="flex-1 py-2 px-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
    >
      {isCommitting ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        'Done'
      )}
    </button>
  </div>
</div>
```

---

## Implementation Approach

### Component Structure

```typescript
'use client';

import { useEffect, useCallback, useRef } from 'react';
import { X, Plus, ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAssetManagement } from '../../hooks/useAssetManagement';
import type { ItemRecord } from '@/components/ItemCapture';

export interface AssetPanelProps {
  isOpen: boolean;
  item: ItemRecord | null;
  onClose: () => void;
  onAddAssets?: (itemId: string, assets: File[]) => Promise<void>;
  onRemoveAssets?: (itemId: string, assetIds: string[]) => Promise<void>;
  onReorderAssets?: (itemId: string, orderedIds: string[]) => Promise<void>;
  className?: string;
  allowedMediaTypes?: ('video' | 'image' | 'pdf')[];
  maxFileSize?: number;
}

export function AssetPanel({
  isOpen,
  item,
  onClose,
  onAddAssets,
  onRemoveAssets,
  onReorderAssets,
  className,
  allowedMediaTypes,
  maxFileSize,
}: AssetPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  const {
    currentAssets,
    isDirty,
    isCommitting,
    error,
    startSession,
    endSession,
    addAssets,
    removeAsset,
    undoRemoval,
    commit,
    discard,
    isPendingAddition,
    isPendingRemoval,
    clearError,
  } = useAssetManagement({
    onAddAssets,
    onRemoveAssets,
    onReorderAssets,
    allowedMediaTypes,
    maxFileSize,
  });

  // Start session when panel opens
  useEffect(() => {
    if (isOpen && item) {
      startSession(item.id, item.media);
    }
  }, [isOpen, item?.id]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      firstFocusableRef.current?.focus();
    }
  }, [isOpen]);

  const handleCancel = useCallback(() => {
    discard();
    endSession();
    onClose();
  }, [discard, endSession, onClose]);

  const handleDone = useCallback(async () => {
    const success = await commit();
    if (success) {
      endSession();
      onClose();
    }
  }, [commit, endSession, onClose]);

  const handleAddMedia = useCallback(() => {
    // Trigger file picker - to be implemented with AssetDropZone
  }, []);

  if (!item) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40 transition-opacity duration-200',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={handleCancel}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="asset-panel-title"
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex flex-col',
          'w-full sm:w-[400px] bg-white shadow-xl',
          'transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <h2 id="asset-panel-title" className="text-lg font-semibold text-gray-900">
            Manage Assets
          </h2>
          <button
            ref={firstFocusableRef}
            onClick={handleCancel}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error.message}</p>
            <button
              onClick={clearError}
              className="text-xs text-red-600 underline mt-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Add Media Button */}
          <button
            onClick={handleAddMedia}
            className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Media
          </button>

          {/* Asset List - Placeholder for AssetItem components */}
          {currentAssets.map((asset, index) => (
            <div
              key={asset.id}
              className={cn(
                'p-3 border rounded-lg',
                isPendingAddition(asset.id) && 'border-green-300 bg-green-50',
                isPendingRemoval(asset.id) && 'opacity-50 border-red-300 bg-red-50'
              )}
            >
              {/* Placeholder for AssetItem component (Task 5.3) */}
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gray-200 rounded" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Asset {index + 1}</p>
                  <p className="text-xs text-gray-500">
                    {'type' in asset ? asset.type : 'pending'}
                  </p>
                </div>
                {isPendingRemoval(asset.id) ? (
                  <button
                    onClick={() => undoRemoval(asset.id)}
                    className="text-xs text-blue-600 underline"
                  >
                    Restore
                  </button>
                ) : (
                  <button
                    onClick={() => removeAsset(asset.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Empty State */}
          {currentAssets.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No assets yet</p>
              <p className="text-sm">Add media to get started</p>
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="border-t p-4 flex gap-3 shrink-0">
          <button
            onClick={handleCancel}
            disabled={isCommitting}
            className="flex-1 py-2.5 px-4 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDone}
            disabled={!isDirty || isCommitting}
            className={cn(
              'flex-1 py-2.5 px-4 text-white rounded-lg transition-colors flex items-center justify-center',
              isDirty
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-300 cursor-not-allowed',
              isCommitting && 'opacity-75'
            )}
          >
            {isCommitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Done'
            )}
          </button>
        </div>
      </div>
    </>
  );
}

export default AssetPanel;
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/ItemManager/components/AssetPanel/AssetPanel.tsx` | Main panel component |
| `src/components/ItemManager/components/AssetPanel/index.ts` | Barrel export for AssetPanel |

### Files to Modify

| File | Change |
|------|--------|
| `src/components/ItemManager/components/index.ts` | Export AssetPanel |
| `src/components/ItemManager/index.ts` | Re-export AssetPanel if needed for external use |
| `src/components/ItemManager/ItemManager.types.ts` | Add `AssetPanelProps` interface if not already present |

### Functions/Components to Create

| Name | Location | Purpose |
|------|----------|---------|
| `AssetPanel` | `AssetPanel/AssetPanel.tsx` | Main drawer component |
| (Placeholder for AssetItem) | `AssetPanel/AssetPanel.tsx` | Inline placeholder until Task 5.3 |

### Dependencies on Other Tasks

| Task | Component/Hook | Status | Usage |
|------|----------------|--------|-------|
| 5.1 | `useAssetManagement` | Required | State management for pending changes |
| 5.3 | `AssetItem` | Future | Individual asset display - use placeholder |
| 5.4 | `AssetDropZone` | Future | File upload area - use placeholder |

---

## Acceptance Criteria

From REQ-081:

- [ ] A drawer component slides in from the right side of the screen when asset management is triggered
- [ ] The drawer displays a scrollable list of all current assets for the item
- [ ] Each asset in the list is shown with an appropriate thumbnail image
- [ ] An "Add Media" button is prominently displayed within the drawer
- [ ] A "Done" button is available to commit pending asset changes and close the drawer
- [ ] A "Cancel" button is available to discard pending changes and close the drawer
- [ ] The drawer does not navigate away from the current page or lose user context
- [ ] The drawer is visually distinct from the underlying content and clearly indicates it is an overlay
- [ ] The drawer is accessible via keyboard navigation and screen readers
- [ ] On mobile devices, the drawer provides an appropriate responsive experience
- [ ] Clicking outside the drawer or pressing the Escape key triggers the cancel behavior

### Additional Technical Criteria

- [ ] Component uses `'use client'` directive
- [ ] TypeScript strict mode compliance with no `any` types
- [ ] Integrates with `useAssetManagement` hook for state
- [ ] Follows existing modal/overlay patterns from ConfirmationModal
- [ ] Animations use CSS transitions (not JS-based)
- [ ] Focus is trapped within drawer when open
- [ ] Proper ARIA attributes for dialog semantics
- [ ] Responsive width: 100% on mobile, 400px on desktop

---

## Edge Cases

1. **Panel opens with no assets**
   - Display empty state with "Add Media" prompt
   - "Done" button should be disabled (no changes)

2. **Rapid open/close**
   - Ensure animation completes or is cancelled cleanly
   - Session should be properly started/ended

3. **Commit failure**
   - Show error message within panel
   - Keep panel open for retry
   - Preserve pending changes

4. **Item data changes while panel open**
   - Consider: should panel reflect external changes?
   - Current approach: session uses snapshot of assets at open time

5. **Very long asset list**
   - Ensure scrolling works smoothly
   - Consider lazy loading thumbnails (future enhancement)

6. **Large file additions**
   - Show loading state during file processing
   - Handle validation errors from hook

---

## Testing Approach

### Unit Tests

- [ ] Panel renders when `isOpen` is true
- [ ] Panel hidden when `isOpen` is false
- [ ] Cancel button triggers `discard()` and `onClose()`
- [ ] Done button triggers `commit()` and `onClose()` on success
- [ ] Done button disabled when `!isDirty`
- [ ] Escape key triggers cancel
- [ ] Backdrop click triggers cancel
- [ ] Error state displays correctly

### Integration Tests

- [ ] Full workflow: open panel, add asset, remove asset, commit
- [ ] Full workflow: open panel, make changes, cancel (changes discarded)
- [ ] Panel correctly reflects currentAssets from hook

### Manual Testing Checklist

- [ ] Desktop Chrome: drawer slides in from right
- [ ] Desktop Firefox: drawer animation smooth
- [ ] Mobile Safari: full-width drawer
- [ ] Mobile Chrome: touch targets adequate (48x48px)
- [ ] Keyboard navigation: Tab cycles through focusable elements
- [ ] Screen reader: announces dialog open/close
- [ ] VoiceOver: proper role and label announcements

### Test Harness Addition

Add to `/src/app/test/item-manager/page.tsx`:

```tsx
// Asset Panel test section
<button
  onClick={() => setAssetPanelItem(mockItems[0])}
  className="px-4 py-2 bg-green-600 text-white rounded"
>
  Open Asset Panel
</button>

<AssetPanel
  isOpen={!!assetPanelItem}
  item={assetPanelItem}
  onClose={() => setAssetPanelItem(null)}
  onAddAssets={async (itemId, files) => {
    console.log('=== ADD ASSETS ===', itemId, files);
  }}
  onRemoveAssets={async (itemId, ids) => {
    console.log('=== REMOVE ASSETS ===', itemId, ids);
  }}
  onReorderAssets={async (itemId, orderedIds) => {
    console.log('=== REORDER ASSETS ===', itemId, orderedIds);
  }}
/>
```

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Animation jank on mobile | Medium | Low | Use CSS transforms, test on real devices |
| Focus trap breaks with nested modals | Low | Medium | Use focus-trap library if issues arise |
| Z-index conflicts with other overlays | Low | Medium | Use z-50 consistently, document layering |
| Large asset lists slow scrolling | Medium | Low | Defer full implementation to virtualization (V2) |
| Touch gestures conflict with scroll | Low | Low | Avoid custom swipe gestures in V1 |

---

## Future Enhancements

1. **Drag-and-Drop Reordering** (Task 5.5)
   - Add drag handles to AssetItem
   - Implement @dnd-kit integration

2. **Bottom Sheet on Mobile**
   - Alternative presentation for better mobile UX
   - Swipe to close gesture

3. **Asset Preview Expansion**
   - Tap asset to see larger preview
   - Inline video playback

4. **Undo/Redo**
   - Track history of operations
   - Allow undo within session

---

## References

- [Implementation Plan - Phase 5](/docs/prd/item-capture-manager-implementation-plan.md#phase-5-asset-management-estimated-3-4-days)
- [REQ-080 useAssetManagement Hook Overview](/docs/REQ-080-create-useassetmanagement-hook-overview.md)
- [ConfirmationModal Pattern](/src/components/ConfirmationModal.tsx)
- [MediaThumbnail Component](/src/components/ItemCapture/components/shared/MediaThumbnail.tsx)
- [REQ-081 in gen_requests.md](/docs/gen_requests.md)

---

## Document History

| Date | Author | Changes |
|------|--------|---------|
| 2026-01-03 | Tech Lead Agent | Initial document creation |
