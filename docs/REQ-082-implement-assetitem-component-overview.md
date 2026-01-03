# REQ-082: Implement AssetItem Component - Technical Overview

**Document Created:** 2026-01-03
**Last Modified:** 2026-01-03
**Request Reference:** REQ-082 in `/docs/gen_requests.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 5 - Asset Management
**Task ID:** 5.3
**Estimated Effort:** 1-2 story points

---

## Summary

Implement the `AssetItem` component to display individual media assets within the `AssetPanel` drawer. Each asset card shows a thumbnail preview, a visual type indicator (video/photo/PDF), relevant metadata (duration for videos, page count for PDFs), and a remove button. This component enables users to visually identify and manage their media assets with clear feedback.

The component is designed to be a presentational component that receives its data and callbacks from the parent `AssetPanel`, which manages state via the `useAssetManagement` hook.

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
| Thumbnail display | `src/components/ItemCapture/components/shared/MediaThumbnail.tsx` | Object URL management, size variants, type indicators, delete button overlay |
| Page count badge | `src/components/ItemCapture/components/shared/PageCountBadge.tsx` | Badge styling for PDF page count display |
| Media types | `src/components/ItemCapture/ItemCapture.types.ts` | `MediaItem`, `MediaMetadata` interfaces with duration/pageCount |
| Modal button styling | `src/components/ConfirmationModal.tsx` | Consistent button patterns |
| Component props pattern | `src/components/ItemCapture/ItemCapture.types.ts` | Comprehensive interface definitions with JSDoc |

### Target Architecture (from Implementation Plan)

```
src/components/ItemManager/
├── components/
│   ├── AssetPanel/
│   │   ├── AssetPanel.tsx        (Task 5.2 - parent container)
│   │   ├── AssetItem.tsx         <-- THIS TASK
│   │   └── AssetDropZone.tsx     (Task 5.4 - file upload area)
```

---

## Dependencies

### Phase Dependencies
- **Requires:** Task 5.2 (AssetPanel component) - Parent container that renders AssetItem
- **Requires:** Task 5.1 (useAssetManagement hook) - State management, indirectly via AssetPanel props
- **Blocks:** Task 5.5 (Drag-and-Drop Reorder) - Will add drag handles to AssetItem
- **Blocks:** Task 5.6 (Asset Remove Confirmation) - Will add confirmation dialog integration

### Task Dependencies
```
5.1 useAssetManagement Hook
         │
         ▼
5.2 AssetPanel Component
         │
         ▼
5.3 AssetItem Component    <-- THIS TASK
         │
         ▼
5.5 Drag-and-Drop Reorder
         │
         ▼
5.6 Asset Remove Confirmation
```

### Type Dependencies

From `ItemCapture` types:
```typescript
import type { MediaItem, MediaMetadata } from '@/components/ItemCapture';
```

From `ItemManager` types (to be extended):
```typescript
import type { PendingAsset } from '../../ItemManager.types';
```

---

## Implementation Requirements

### Core Functionality

1. **Thumbnail Display**
   - Show thumbnail preview image for all asset types
   - For images: display the thumbnail blob or file preview
   - For videos: display first-frame thumbnail or video poster
   - For PDFs: display PDF first-page thumbnail with document icon overlay
   - Handle loading states while thumbnail generates
   - Handle error states with fallback icons

2. **Type Indicator**
   - Visual badge/icon showing asset type (video, photo, PDF)
   - Video: play icon overlay on thumbnail
   - Photo: no special overlay (thumbnail is self-explanatory)
   - PDF: document/file icon overlay on thumbnail

3. **Metadata Display**
   - Video: show duration in readable format (e.g., "1:24", "10:05")
   - PDF: show page count (e.g., "5 pages", "1 page")
   - Photo: no additional metadata required
   - Position metadata at bottom of thumbnail or as badge

4. **Remove Button**
   - Clearly visible remove button (X icon or trash icon)
   - Positioned at top-right corner of asset card
   - Hover/focus states for desktop
   - Touch-friendly size for mobile (min 44x44px touch target)
   - Triggers `onRemove` callback

5. **Pending States**
   - Visual distinction for pending additions (green border/highlight)
   - Visual distinction for pending removals (dimmed, strikethrough, red highlight)
   - "Restore" action for pending removal items (undo removal)

6. **Accessibility**
   - Proper `aria-label` for remove button
   - Keyboard focusable
   - Screen reader announcements for asset type and metadata

### Component Props

```typescript
/**
 * Props for the AssetItem component.
 * Represents a single asset within the AssetPanel.
 */
export interface AssetItemProps {
  /** The media asset to display (MediaItem or PendingAsset) */
  asset: MediaItem | PendingAsset;

  /** Index position in the asset list (for ordering context) */
  index: number;

  /** Whether this asset is a pending addition (not yet committed) */
  isPending?: boolean;

  /** Whether this asset is marked for removal */
  isMarkedForRemoval?: boolean;

  /** Callback when remove button is clicked */
  onRemove: (assetId: string) => void;

  /** Callback when restore button is clicked (for pending removals) */
  onRestore?: (assetId: string) => void;

  /** Callback when asset is clicked (optional, for preview) */
  onClick?: (assetId: string) => void;

  /** Optional additional CSS classes */
  className?: string;

  /** Size variant for the thumbnail */
  size?: 'small' | 'medium' | 'large';

  /** Whether to show the drag handle (for future drag-and-drop) */
  showDragHandle?: boolean;
}
```

### Helper Types

```typescript
/**
 * Pending asset structure (from useAssetManagement hook).
 * Represents an asset that has been added but not yet committed.
 */
export interface PendingAsset {
  /** Temporary ID assigned to pending asset */
  id: string;
  /** The uploaded file */
  file: File;
  /** Asset type inferred from file MIME type */
  type: 'video' | 'image' | 'pdf';
  /** Generated thumbnail blob (if available) */
  thumbnail?: Blob;
  /** Metadata extracted from file */
  metadata: {
    mimeType: string;
    fileSize: number;
    originalFilename: string;
    duration?: number;      // For videos
    pageCount?: number;     // For PDFs
  };
  /** When the asset was added */
  addedAt: Date;
}
```

---

## Visual Design

### Layout Structure

```
┌─────────────────────────────────────────┐
│  ┌──────────┐                           │
│  │          │ [X] Remove                │
│  │ Thumbnail│                           │
│  │   +      │  Filename/Type            │
│  │ Type Icon│  Duration/Pages           │
│  │          │                           │
│  │  [1:24]  │  (or "Pending" badge)     │
│  └──────────┘                           │
└─────────────────────────────────────────┘
```

### Alternative Row Layout (Compact)

```
┌──────────────────────────────────────────────┐
│ ┌────────┐                                   │
│ │ Thumb  │  Asset Name        Type    [X]   │
│ │ [▶]    │  1:24 duration     Video         │
│ └────────┘                                   │
└──────────────────────────────────────────────┘
```

### State Variations

**Normal State:**
```
┌────────────────────────────┐
│ ┌──────────┐               │
│ │ [thumb]  │ Coffee video  │
│ │   ▶      │ 1:24          │ [X]
│ └──────────┘               │
└────────────────────────────┘
```

**Pending Addition (green highlight):**
```
┌────────────────────────────┐  ← green border
│ ┌──────────┐               │
│ │ [thumb]  │ New asset.pdf │
│ │   📄     │ 3 pages       │ [X]
│ └──────────┘  [NEW]        │  ← "NEW" badge
└────────────────────────────┘
```

**Pending Removal (dimmed, strikethrough):**
```
┌────────────────────────────┐  ← red border, opacity 50%
│ ┌──────────┐               │
│ │ [thumb]  │ ̶O̶l̶d̶ ̶i̶m̶a̶g̶e̶.̶j̶p̶g̶│  ← strikethrough
│ │          │               │ [↩ Restore]
│ └──────────┘               │
└────────────────────────────┘
```

### Tailwind Implementation

```tsx
// Base card container
<div
  className={cn(
    'flex items-center gap-3 p-3 rounded-lg border',
    'transition-all duration-200',
    // Normal state
    !isPending && !isMarkedForRemoval && 'border-gray-200 bg-white',
    // Pending addition
    isPending && 'border-green-300 bg-green-50',
    // Pending removal
    isMarkedForRemoval && 'border-red-300 bg-red-50 opacity-60',
    className
  )}
>
  {/* Thumbnail Section */}
  <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 shrink-0">
    {/* Thumbnail Image */}
    {thumbnailUrl && (
      <img
        src={thumbnailUrl}
        alt={assetName}
        className="w-full h-full object-cover"
      />
    )}

    {/* Type Overlay - Video */}
    {asset.type === 'video' && (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-black/50 text-white rounded-full p-1.5">
          <Play className="w-4 h-4 fill-current" />
        </div>
      </div>
    )}

    {/* Type Overlay - PDF */}
    {asset.type === 'pdf' && (
      <div className="absolute inset-0 flex items-center justify-center bg-blue-50/80">
        <FileText className="w-6 h-6 text-blue-500" />
      </div>
    )}

    {/* Duration Badge - Video */}
    {asset.type === 'video' && asset.metadata.duration && (
      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-xs font-medium text-white bg-black/70 rounded">
        {formatDuration(asset.metadata.duration)}
      </span>
    )}

    {/* Page Count Badge - PDF */}
    {asset.type === 'pdf' && asset.metadata.pageCount && (
      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-xs font-medium text-white bg-black/70 rounded">
        {asset.metadata.pageCount} {asset.metadata.pageCount === 1 ? 'page' : 'pages'}
      </span>
    )}
  </div>

  {/* Info Section */}
  <div className="flex-1 min-w-0">
    <p className={cn(
      'text-sm font-medium text-gray-900 truncate',
      isMarkedForRemoval && 'line-through text-gray-500'
    )}>
      {assetName}
    </p>
    <div className="flex items-center gap-2 mt-0.5">
      <span className="text-xs text-gray-500 capitalize">
        {asset.type}
      </span>
      {isPending && (
        <span className="text-xs font-medium text-green-600 bg-green-100 px-1.5 py-0.5 rounded">
          New
        </span>
      )}
    </div>
  </div>

  {/* Action Buttons */}
  <div className="shrink-0">
    {isMarkedForRemoval ? (
      <button
        onClick={() => onRestore?.(asset.id)}
        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        Restore
      </button>
    ) : (
      <button
        onClick={() => onRemove(asset.id)}
        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        aria-label={`Remove ${assetName}`}
      >
        <X className="w-4 h-4" />
      </button>
    )}
  </div>
</div>
```

---

## Implementation Approach

### Utility Functions

```typescript
/**
 * Format video duration from seconds to readable string.
 * Examples: 90 -> "1:30", 3661 -> "1:01:01"
 */
export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get display name for an asset.
 * Prefers original filename, falls back to type-based name.
 */
export function getAssetDisplayName(asset: MediaItem | PendingAsset): string {
  if ('metadata' in asset && asset.metadata.originalFilename) {
    return asset.metadata.originalFilename;
  }
  return `${asset.type.charAt(0).toUpperCase() + asset.type.slice(1)} asset`;
}
```

### Component Structure

```typescript
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Play, FileText, X, Image as ImageIcon, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MediaItem } from '@/components/ItemCapture';

export interface AssetItemProps {
  asset: MediaItem | PendingAsset;
  index: number;
  isPending?: boolean;
  isMarkedForRemoval?: boolean;
  onRemove: (assetId: string) => void;
  onRestore?: (assetId: string) => void;
  onClick?: (assetId: string) => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  showDragHandle?: boolean;
}

export function AssetItem({
  asset,
  index,
  isPending = false,
  isMarkedForRemoval = false,
  onRemove,
  onRestore,
  onClick,
  className,
  size = 'medium',
  showDragHandle = false,
}: AssetItemProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Create object URL from thumbnail or file
  useEffect(() => {
    const blob = asset.thumbnail || ('file' in asset ? asset.file : null);
    if (!blob) {
      setThumbnailUrl(null);
      return;
    }

    const url = URL.createObjectURL(blob);
    setThumbnailUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [asset.thumbnail, 'file' in asset ? asset.file : null]);

  // Get asset display name
  const assetName = useMemo(() => getAssetDisplayName(asset), [asset]);

  // Size classes for thumbnail
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-20 h-20',
  };

  return (
    <div
      onClick={() => onClick?.(asset.id)}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border',
        'transition-all duration-200',
        onClick && 'cursor-pointer hover:bg-gray-50',
        // Normal state
        !isPending && !isMarkedForRemoval && 'border-gray-200 bg-white',
        // Pending addition
        isPending && 'border-green-300 bg-green-50',
        // Pending removal
        isMarkedForRemoval && 'border-red-300 bg-red-50 opacity-60',
        className
      )}
      role="listitem"
      aria-label={`${assetName}, ${asset.type}${isMarkedForRemoval ? ', marked for removal' : ''}`}
    >
      {/* Drag Handle (for future Task 5.5) */}
      {showDragHandle && (
        <div className="shrink-0 cursor-grab text-gray-400 hover:text-gray-600">
          <GripVertical className="w-5 h-5" />
        </div>
      )}

      {/* Thumbnail Section */}
      <div className={cn(
        'relative rounded-md overflow-hidden bg-gray-100 shrink-0',
        sizeClasses[size]
      )}>
        {/* Thumbnail Image */}
        {thumbnailUrl && !imageError && asset.type !== 'pdf' && (
          <img
            src={thumbnailUrl}
            alt=""
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        )}

        {/* Video Play Overlay */}
        {asset.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/50 text-white rounded-full p-1.5">
              <Play className="w-4 h-4 fill-current" />
            </div>
          </div>
        )}

        {/* PDF Icon Display */}
        {asset.type === 'pdf' && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50">
            <FileText className="w-6 h-6 text-blue-500" />
          </div>
        )}

        {/* Error Fallback */}
        {imageError && asset.type !== 'pdf' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            {asset.type === 'video' ? (
              <Video className="w-6 h-6 text-gray-400" />
            ) : (
              <ImageIcon className="w-6 h-6 text-gray-400" />
            )}
          </div>
        )}

        {/* Duration Badge - Video */}
        {asset.type === 'video' && asset.metadata.duration !== undefined && (
          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-xs font-medium text-white bg-black/70 rounded">
            {formatDuration(asset.metadata.duration)}
          </span>
        )}

        {/* Page Count Badge - PDF */}
        {asset.type === 'pdf' && asset.metadata.pageCount !== undefined && (
          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-xs font-medium text-white bg-black/70 rounded">
            {asset.metadata.pageCount} {asset.metadata.pageCount === 1 ? 'page' : 'pages'}
          </span>
        )}
      </div>

      {/* Info Section */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium text-gray-900 truncate',
          isMarkedForRemoval && 'line-through text-gray-500'
        )}>
          {assetName}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-500 capitalize">
            {asset.type === 'pdf' ? 'PDF' : asset.type}
          </span>
          {isPending && !isMarkedForRemoval && (
            <span className="text-xs font-medium text-green-600 bg-green-100 px-1.5 py-0.5 rounded">
              New
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="shrink-0">
        {isMarkedForRemoval ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRestore?.(asset.id);
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
            aria-label="Restore this asset"
          >
            Restore
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(asset.id);
            }}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={`Remove ${assetName}`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default AssetItem;
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/ItemManager/components/AssetPanel/AssetItem.tsx` | Main AssetItem component |
| `src/components/ItemManager/utils/formatUtils.ts` | Utility functions (formatDuration, getAssetDisplayName) |

### Files to Modify

| File | Change |
|------|--------|
| `src/components/ItemManager/components/AssetPanel/index.ts` | Export AssetItem component |
| `src/components/ItemManager/components/AssetPanel/AssetPanel.tsx` | Replace placeholder with actual AssetItem usage |
| `src/components/ItemManager/ItemManager.types.ts` | Add `AssetItemProps` and `PendingAsset` types if not already present |
| `src/components/ItemManager/utils/index.ts` | Export formatUtils |

### Functions/Components to Create

| Name | Location | Purpose |
|------|----------|---------|
| `AssetItem` | `AssetPanel/AssetItem.tsx` | Individual asset display component |
| `formatDuration` | `utils/formatUtils.ts` | Format seconds to readable duration string |
| `getAssetDisplayName` | `utils/formatUtils.ts` | Get display name for asset |

### Pattern Reuse

| Pattern | Source | Application |
|---------|--------|-------------|
| Thumbnail with object URL | `MediaThumbnail.tsx` | Object URL creation and cleanup |
| Type overlay icons | `MediaThumbnail.tsx` | Play icon for video, FileText for PDF |
| Page count badge | `PageCountBadge.tsx` | Badge styling for PDF page count |
| Delete button styling | `MediaThumbnail.tsx` | Button hover states and touch targets |

---

## Acceptance Criteria

From REQ-082:

- [ ] Each asset is displayed as a distinct card or list item within the asset management panel
- [ ] A thumbnail image is shown for each asset, representing its content
- [ ] A visual type indicator clearly shows whether the asset is a video, photo, or PDF
- [ ] For video assets, the duration is displayed in a readable format (e.g., "1:24")
- [ ] For PDF assets, the page count is displayed (e.g., "5 pages")
- [ ] Photo assets do not display duration or page count
- [ ] Each asset card includes a remove button that is clearly labeled or iconified
- [ ] Clicking the remove button removes the asset from the collection
- [ ] The thumbnail accurately represents the asset content (e.g., first frame for video, page preview for PDF)

### Additional Technical Criteria

- [ ] Component uses `'use client'` directive
- [ ] TypeScript strict mode compliance with no `any` types
- [ ] Object URLs are properly created and cleaned up on unmount
- [ ] Follows existing MediaThumbnail patterns for consistency
- [ ] Touch-friendly remove button (min 44x44px touch target)
- [ ] Visual distinction for pending additions (green highlight)
- [ ] Visual distinction for pending removals (dimmed, strikethrough)
- [ ] Proper ARIA attributes for accessibility
- [ ] Keyboard focusable with visible focus indicators

---

## Edge Cases

1. **Missing Thumbnail**
   - Display type-appropriate fallback icon (Video, Image, FileText)
   - Maintain layout consistency without thumbnail

2. **Image Load Error**
   - Show fallback icon instead of broken image
   - Log error for debugging but don't crash component

3. **Very Long Filename**
   - Truncate with ellipsis (`truncate` class)
   - Show full name on hover (via `title` attribute)

4. **Zero Duration Video**
   - Display "0:00" or hide duration badge
   - Handle edge case of live streams (no duration)

5. **PDF with Unknown Page Count**
   - Don't show page count badge if `pageCount` is undefined
   - Display PDF icon without metadata

6. **Rapid Remove/Restore Clicks**
   - Debounce or ignore rapid clicks
   - Ensure state transitions are clean

7. **Asset Already Removed**
   - Handle case where `onRemove` is called for non-existent asset
   - Parent should handle validation

8. **Large Thumbnail Files**
   - Consider lazy loading for performance
   - Use thumbnail blob instead of full file when available

---

## Testing Approach

### Unit Tests

- [ ] Renders video asset with play icon overlay
- [ ] Renders photo asset without overlay
- [ ] Renders PDF asset with document icon
- [ ] Displays duration for video assets
- [ ] Displays page count for PDF assets
- [ ] Does not display metadata badges for photos
- [ ] Remove button calls `onRemove` with correct asset ID
- [ ] Restore button calls `onRestore` with correct asset ID
- [ ] Pending addition shows green styling
- [ ] Pending removal shows red/dimmed styling
- [ ] Truncates long filenames
- [ ] Falls back to icon when thumbnail fails to load

### Integration Tests

- [ ] AssetItem works correctly within AssetPanel
- [ ] Remove action integrates with useAssetManagement hook
- [ ] Restore action integrates with useAssetManagement hook
- [ ] Click handler fires when asset is clicked

### Manual Testing Checklist

- [ ] Desktop Chrome: all states display correctly
- [ ] Desktop Firefox: thumbnails load properly
- [ ] Mobile Safari: touch targets are adequate (44x44px)
- [ ] Mobile Chrome: remove button easy to tap
- [ ] VoiceOver: asset type and name announced
- [ ] Keyboard navigation: focus visible on buttons
- [ ] Video thumbnails display correctly
- [ ] PDF page count displays correctly
- [ ] Long filenames truncate with ellipsis

### Test Harness Addition

Add to `/src/app/test/item-manager/page.tsx`:

```tsx
// AssetItem test section
<section className="mt-8 p-4 border rounded">
  <h2 className="text-lg font-bold mb-4">AssetItem States</h2>
  <div className="space-y-3">
    {/* Normal Video */}
    <AssetItem
      asset={mockVideoAsset}
      index={0}
      onRemove={(id) => console.log('Remove:', id)}
    />

    {/* Normal Photo */}
    <AssetItem
      asset={mockPhotoAsset}
      index={1}
      onRemove={(id) => console.log('Remove:', id)}
    />

    {/* Normal PDF */}
    <AssetItem
      asset={mockPdfAsset}
      index={2}
      onRemove={(id) => console.log('Remove:', id)}
    />

    {/* Pending Addition */}
    <AssetItem
      asset={mockPendingAsset}
      index={3}
      isPending={true}
      onRemove={(id) => console.log('Remove:', id)}
    />

    {/* Pending Removal */}
    <AssetItem
      asset={mockVideoAsset}
      index={4}
      isMarkedForRemoval={true}
      onRemove={(id) => console.log('Remove:', id)}
      onRestore={(id) => console.log('Restore:', id)}
    />
  </div>
</section>
```

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Thumbnail generation slow for videos | Medium | Low | Use pre-generated thumbnails when available; show loading state |
| Object URL memory leaks | Medium | Medium | Strict cleanup in useEffect return; revoke on unmount |
| PDF thumbnails not available | Medium | Low | Always show PDF icon overlay; page count is primary info |
| Touch target too small on mobile | Low | Medium | Use min-w-[44px] min-h-[44px] for all interactive elements |
| Type icons not clear enough | Low | Low | Use established icon patterns (Play, FileText); include text labels |

---

## Future Enhancements

1. **Drag Handle for Reordering** (Task 5.5)
   - Add drag handle icon (GripVertical)
   - Integrate with @dnd-kit for drag-and-drop

2. **Click to Preview**
   - Open larger preview on click
   - Video playback inline

3. **File Size Display**
   - Show file size in metadata area
   - Help users understand storage impact

4. **Edit Button**
   - Quick edit action for cropping/rotating
   - Integration with media editor

5. **Batch Selection**
   - Checkbox for multi-select mode
   - Bulk remove selected assets

---

## References

- [Implementation Plan - Phase 5 Task 5.3](/docs/prd/item-capture-manager-implementation-plan.md#phase-5-asset-management-estimated-3-4-days)
- [REQ-081 AssetPanel Overview](/docs/REQ-081-build-assetpanel-component-overview.md)
- [REQ-080 useAssetManagement Hook Overview](/docs/REQ-080-create-useassetmanagement-hook-overview.md)
- [MediaThumbnail Component](/src/components/ItemCapture/components/shared/MediaThumbnail.tsx)
- [PageCountBadge Component](/src/components/ItemCapture/components/shared/PageCountBadge.tsx)
- [ItemCapture Types](/src/components/ItemCapture/ItemCapture.types.ts)
- [REQ-082 in gen_requests.md](/docs/gen_requests.md)

---

## Document History

| Date | Author | Changes |
|------|--------|---------|
| 2026-01-03 | Tech Lead Agent | Initial document creation |
