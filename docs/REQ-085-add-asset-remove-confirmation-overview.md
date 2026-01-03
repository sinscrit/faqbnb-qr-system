# REQ-085: Add Asset Remove Confirmation - Implementation Overview

**Document Created:** 2026-01-03
**Last Modified:** 2026-01-03
**Request Reference:** REQ-085 (Asset Removal Confirmation with Visual Preview)
**Phase:** 5 - Asset Management
**Task ID:** 5.6
**Size:** S (Small)

---

## Summary

Implement a confirmation dialog for single asset removal within the Asset Management panel. The dialog displays the asset's thumbnail preview, type indicator, and metadata (duration for video, page count for PDF) to help users confirm they are removing the correct asset before executing the removal action.

---

## Dependencies

### Phase Dependencies
- **Phase 5 Prerequisites:**
  - Task 5.1: `useAssetManagement` hook (provides asset state and removal actions)
  - Task 5.2: `AssetPanel` component (container for asset management UI)
  - Task 5.3: `AssetItem` component (individual asset display with remove button trigger)

### Component Dependencies
| Component | Location | Purpose |
|-----------|----------|---------|
| `MediaItem` type | `src/components/ItemCapture/ItemCapture.types.ts` | Asset data structure with thumbnail, type, and metadata |
| `MediaThumbnail` | `src/components/ItemCapture/components/shared/MediaThumbnail.tsx` | Reusable thumbnail display with type overlays |
| `ConfirmationModal` | `src/components/ConfirmationModal.tsx` | Existing modal pattern for confirmation dialogs |
| `cn()` utility | `src/lib/utils.ts` | Tailwind class merging utility |

### External Dependencies
- `lucide-react` (icons: Video, Image, FileText, AlertTriangle, Trash2)

---

## Technical Design

### Architecture Overview

The asset removal confirmation follows the existing modal pattern established in `src/components/ConfirmationModal.tsx`, enhanced with visual preview capabilities. The dialog intercepts the remove action from `AssetItem`, displays a rich preview with metadata, and only executes removal upon user confirmation.

```
AssetPanel
  └── AssetItem (multiple)
        └── Remove Button (click triggers confirmation)
              └── AssetRemoveConfirmDialog
                    ├── Asset Thumbnail Preview
                    │     ├── Image/Video thumbnail with object URL
                    │     ├── PDF placeholder with document icon
                    │     └── Type overlay (Play icon for video)
                    ├── Asset Type Badge
                    ├── Metadata Display
                    │     ├── Video: duration (e.g., "1:30")
                    │     ├── PDF: page count (e.g., "5 pages")
                    │     └── Image: dimensions (optional)
                    └── Action Buttons
                          ├── Cancel (dismisses dialog)
                          └── Remove (destructive, executes removal)
```

### State Management

The confirmation dialog state is managed locally within `AssetPanel` using React's `useState`:

```typescript
interface AssetRemovalState {
  isOpen: boolean;
  assetToRemove: MediaItem | null;
}
```

When the remove button in `AssetItem` is clicked:
1. `AssetItem` calls `onRemoveClick(asset)` prop (instead of directly calling remove action)
2. `AssetPanel` sets `assetToRemove` state and opens the dialog
3. On confirm, `AssetPanel` calls `onRemove(asset.id)` via `useAssetManagement` hook
4. On cancel/dismiss, `AssetPanel` clears the `assetToRemove` state

### Component Structure

```typescript
// AssetRemoveConfirmDialog.tsx
interface AssetRemoveConfirmDialogProps {
  /** Whether the dialog is visible */
  isOpen: boolean;
  /** The asset being confirmed for removal */
  asset: MediaItem | null;
  /** Called when user confirms removal */
  onConfirm: () => void;
  /** Called when user cancels or dismisses */
  onCancel: () => void;
  /** Whether a removal operation is in progress */
  isRemoving?: boolean;
}
```

### Visual Design Specifications

**Dialog Container:**
- Fixed overlay with `bg-black/50` backdrop
- Centered white card with `rounded-lg` and `max-w-md` width
- Padding: `p-6`

**Thumbnail Preview:**
- Size: `w-32 h-32` (128x128px) centered
- `rounded-lg overflow-hidden` with `bg-gray-100` background
- Object URL generated from `asset.thumbnail` or `asset.file`
- Memory management: URL created on mount, revoked on unmount

**Type Indicators:**
- Video: Play icon overlay (`bg-black/50 text-white rounded-full`)
- PDF: Document icon with page count
- Badge below thumbnail showing type (e.g., "Video", "Photo", "PDF")

**Metadata Display:**
- Video duration formatted as `M:SS` or `H:MM:SS`
- PDF page count as "X page(s)"
- Filename (truncated if > 30 chars)

**Action Buttons:**
- Cancel: `bg-gray-100 text-gray-700 hover:bg-gray-200`
- Remove: `bg-red-600 text-white hover:bg-red-700` with `Trash2` icon
- Both buttons: `flex-1 px-4 py-2 rounded-md`

---

## Acceptance Criteria Mapping

| Criterion | Implementation |
|-----------|----------------|
| Remove button triggers confirmation dialog | `AssetItem` remove button calls `onRemoveClick(asset)` prop |
| Dialog displays asset thumbnail | Uses `MediaItem.thumbnail` with `URL.createObjectURL()` |
| Thumbnail preserves aspect ratio | `object-cover` or `object-contain` based on asset type |
| Dialog shows asset type indicator | Badge component showing "Video", "Photo", or "PDF" |
| Video assets show duration | Extract from `MediaItem.metadata.duration`, format as time |
| PDF assets show page count | Extract from `MediaItem.metadata.pageCount` |
| Cancel button closes without removing | Sets `assetToRemove` to `null`, closes dialog |
| Remove button has destructive styling | Red background, white text, warning icon |
| Asset removed only on explicit confirm | `onRemove` callback only called in `onConfirm` handler |
| Escape key dismisses dialog | `onKeyDown` handler on dialog container |
| Click outside dismisses dialog | Backdrop click handler with `stopPropagation` on card |

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx` | Confirmation dialog component |

### Files to Modify

| File Path | Function/Section | Change Description |
|-----------|------------------|-------------------|
| `src/components/ItemManager/components/AssetPanel/AssetPanel.tsx` | Component state | Add `assetToRemove` state, render `AssetRemoveConfirmDialog` |
| `src/components/ItemManager/components/AssetPanel/AssetItem.tsx` | Remove button handler | Change from direct removal to `onRemoveClick` callback |
| `src/components/ItemManager/index.ts` | Exports | Export `AssetRemoveConfirmDialog` if needed externally |

### Files for Reference (Read-Only)

| File Path | Reference Purpose |
|-----------|-------------------|
| `src/components/ConfirmationModal.tsx` | Modal pattern, button styling, overlay structure |
| `src/components/ItemCapture/components/shared/MediaThumbnail.tsx` | Thumbnail display, type overlays, object URL management |
| `src/components/ItemCapture/ItemCapture.types.ts` | `MediaItem` interface, `MediaMetadata` structure |

---

## Implementation Tasks

### Task 1: Create AssetRemoveConfirmDialog Component
**Effort:** 1 story point
**File:** `src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx`

1. Create component with `AssetRemoveConfirmDialogProps` interface
2. Implement modal overlay with backdrop click handling
3. Add escape key dismiss functionality via `useEffect`
4. Implement thumbnail preview with object URL lifecycle management
5. Add type-specific overlays (video play icon, PDF document icon)
6. Display metadata (duration for video, page count for PDF)
7. Implement Cancel and Remove buttons with proper styling
8. Add loading state for Remove button during async operations

### Task 2: Integrate with AssetItem
**Effort:** 0.5 story points
**File:** `src/components/ItemManager/components/AssetPanel/AssetItem.tsx`

1. Add `onRemoveClick: (asset: MediaItem) => void` prop
2. Change remove button to call `onRemoveClick` instead of direct removal
3. Keep existing button styling and accessibility attributes

### Task 3: Integrate with AssetPanel
**Effort:** 0.5 story points
**File:** `src/components/ItemManager/components/AssetPanel/AssetPanel.tsx`

1. Add `assetToRemove` state: `useState<MediaItem | null>(null)`
2. Create handler `handleRemoveClick` to set `assetToRemove`
3. Create handler `handleConfirmRemove` to execute removal and close dialog
4. Create handler `handleCancelRemove` to close dialog
5. Pass `onRemoveClick={handleRemoveClick}` to each `AssetItem`
6. Render `AssetRemoveConfirmDialog` with state and handlers

### Task 4: Export and Documentation
**Effort:** 0.25 story points

1. Add export to `src/components/ItemManager/index.ts` if needed
2. Add JSDoc comments to new component and props interface
3. Update any relevant documentation

---

## Code Examples

### AssetRemoveConfirmDialog Component Skeleton

```typescript
'use client';

import { useEffect, useMemo } from 'react';
import { Trash2, X, Play, FileText, Image as ImageIcon, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MediaItem } from '@/components/ItemCapture';

export interface AssetRemoveConfirmDialogProps {
  isOpen: boolean;
  asset: MediaItem | null;
  onConfirm: () => void;
  onCancel: () => void;
  isRemoving?: boolean;
}

export function AssetRemoveConfirmDialog({
  isOpen,
  asset,
  onConfirm,
  onCancel,
  isRemoving = false,
}: AssetRemoveConfirmDialogProps) {
  // Object URL lifecycle management
  const thumbnailUrl = useMemo(() => {
    if (!asset) return null;
    const blob = asset.thumbnail || asset.file;
    return blob ? URL.createObjectURL(blob) : null;
  }, [asset]);

  useEffect(() => {
    return () => {
      if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl);
    };
  }, [thumbnailUrl]);

  // Escape key handling
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen || !asset) return null;

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md mx-4 w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Remove {asset.type === 'pdf' ? 'PDF' : asset.type === 'video' ? 'Video' : 'Photo'}?
        </h3>

        {/* Thumbnail Preview */}
        <div className="flex justify-center mb-4">
          <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
            {/* Thumbnail rendering based on type */}
          </div>
        </div>

        {/* Metadata */}
        <div className="text-center text-sm text-gray-600 mb-6">
          {asset.type === 'video' && asset.metadata.duration && (
            <p>Duration: {formatDuration(asset.metadata.duration)}</p>
          )}
          {asset.type === 'pdf' && asset.metadata.pageCount && (
            <p>{asset.metadata.pageCount} {asset.metadata.pageCount === 1 ? 'page' : 'pages'}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            disabled={isRemoving}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isRemoving}
            className="flex-1 px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssetRemoveConfirmDialog;
```

### AssetPanel Integration Pattern

```typescript
// In AssetPanel.tsx
const [assetToRemove, setAssetToRemove] = useState<MediaItem | null>(null);

const handleRemoveClick = (asset: MediaItem) => {
  setAssetToRemove(asset);
};

const handleConfirmRemove = () => {
  if (assetToRemove) {
    onRemove(assetToRemove.id);
    setAssetToRemove(null);
  }
};

const handleCancelRemove = () => {
  setAssetToRemove(null);
};

// In render:
<AssetRemoveConfirmDialog
  isOpen={assetToRemove !== null}
  asset={assetToRemove}
  onConfirm={handleConfirmRemove}
  onCancel={handleCancelRemove}
/>
```

---

## Testing Strategy

### Unit Tests
- Dialog renders correctly when `isOpen` is true
- Dialog does not render when `isOpen` is false or `asset` is null
- Escape key triggers `onCancel`
- Backdrop click triggers `onCancel`
- Card click does not trigger `onCancel` (event propagation stopped)
- Cancel button triggers `onCancel`
- Remove button triggers `onConfirm`
- Buttons disabled when `isRemoving` is true
- Object URL cleanup on unmount

### Integration Tests
- AssetItem remove button opens confirmation dialog
- Confirming removal updates asset list
- Canceling removal preserves asset list
- Multiple rapid clicks only open one dialog

### Manual Testing Checklist
- [ ] Video asset shows play icon overlay and duration
- [ ] PDF asset shows document icon and page count
- [ ] Image asset shows thumbnail correctly
- [ ] Thumbnail aspect ratio preserved
- [ ] Dialog dismisses with Escape key
- [ ] Dialog dismisses when clicking backdrop
- [ ] Remove button has red destructive styling
- [ ] Loading state shows on Remove button during operation
- [ ] Focus trap works correctly (keyboard navigation stays in dialog)
- [ ] Screen reader announces dialog title and actions

---

## Accessibility Requirements

- Dialog has `role="dialog"` and `aria-modal="true"`
- Dialog title has `id` linked via `aria-labelledby`
- Focus moves to dialog when opened
- Focus returns to trigger button when closed
- Remove button has `aria-label="Remove asset"`
- Cancel button has `aria-label="Cancel removal"`
- Escape key closes dialog
- Tab key cycles through focusable elements within dialog

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Memory leak from object URLs | Medium | Low | Cleanup URL in useEffect return |
| Dialog flashes before animation | Low | Low | Add CSS transition for opacity |
| Touch devices lack hover states | Low | Low | Always-visible button styling on mobile |
| Rapid clicks cause multiple dialogs | Low | Medium | Guard with `assetToRemove !== null` check |

---

## Effort Estimate

| Task | Estimate |
|------|----------|
| Task 1: AssetRemoveConfirmDialog component | 1 SP |
| Task 2: AssetItem integration | 0.5 SP |
| Task 3: AssetPanel integration | 0.5 SP |
| Task 4: Exports and documentation | 0.25 SP |
| **Total** | **~2.25 SP** |

---

## References

- [Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md) - Phase 5, Task 5.6
- [REQ-085 Request](/docs/gen_requests.md) - Lines 4570-4606
- [ConfirmationModal Pattern](/src/components/ConfirmationModal.tsx) - Existing modal reference
- [MediaThumbnail Component](/src/components/ItemCapture/components/shared/MediaThumbnail.tsx) - Thumbnail display patterns
- [MediaItem Types](/src/components/ItemCapture/ItemCapture.types.ts) - Data structure reference
