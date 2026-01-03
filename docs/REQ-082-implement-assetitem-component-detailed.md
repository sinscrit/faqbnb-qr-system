# REQ-082: Implement AssetItem Component - Detailed Task Breakdown

**Document Created:** 2026-01-03 16:45:00
**Last Modified:** 2026-01-03 18:30:00
**Implementation Status:** ✅ COMPLETE - All 10 tasks implemented
**Request Reference:** REQ-082 in `/docs/gen_requests.md`
**Overview Document:** `/docs/REQ-082-implement-assetitem-component-overview.md`
**Implementation Plan:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 5 - Asset Management
**Task ID:** 5.3

---

## Executive Summary

This document provides granular, implementation-ready tasks for building the `AssetItem` component within the ItemManager's AssetPanel. The component displays individual media assets with thumbnails, type indicators, metadata (duration/page count), and remove functionality. Each task is scoped to approximately 1 story point (a few hours of focused work).

---

## Prerequisites

Before starting this implementation, the following must be complete:

1. **Task 5.1** - `useAssetManagement` hook (state management for assets)
2. **Task 5.2** - `AssetPanel` component (parent container that renders AssetItem)
3. Existing `MediaThumbnail` component at `src/components/ItemCapture/components/shared/MediaThumbnail.tsx` for pattern reference
4. Existing `PageCountBadge` component at `src/components/ItemCapture/components/shared/PageCountBadge.tsx` for pattern reference

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
| `src/components/ItemManager/ItemManager.types.ts` | Add `AssetItemProps` and `PendingAsset` types |
| `src/components/ItemManager/utils/index.ts` | Export formatUtils |

---

## Task Breakdown

### Task 1: Create Format Utility Functions ✅ COMPLETE

**Objective:** Create utility functions for formatting asset display information.

**Implementation Notes:**
- Created `src/components/ItemManager/utils/formatUtils.ts` with `formatDuration`, `getAssetDisplayName`, and `formatFileSize` functions
- Created `src/components/ItemManager/utils/index.ts` barrel export
- All edge cases handled (NaN, negative, Infinity)

**Files to Create:**
- `src/components/ItemManager/utils/formatUtils.ts`

**Files to Modify:**
- `src/components/ItemManager/utils/index.ts` (export formatUtils)

**Implementation Steps:**

1.1. Create the `src/components/ItemManager/utils/` directory if it doesn't exist

1.2. Create `formatUtils.ts` with the following functions:

```typescript
/**
 * Format video duration from seconds to readable string.
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "1:30", "1:01:01")
 */
export function formatDuration(seconds: number): string
```

- Handle edge cases: 0 seconds, negative values, NaN
- Format without hours when duration < 3600 (e.g., "1:30")
- Format with hours when duration >= 3600 (e.g., "1:01:01")
- Pad minutes and seconds with leading zeros appropriately

1.3. Implement `getAssetDisplayName` function:

```typescript
/**
 * Get display name for an asset.
 * @param asset - MediaItem or PendingAsset
 * @returns Display name string
 */
export function getAssetDisplayName(asset: MediaItem | PendingAsset): string
```

- Return `originalFilename` from metadata if available
- Fallback to type-based name (e.g., "Video asset", "Image asset", "PDF asset")
- Truncate very long filenames if needed (optional enhancement)

1.4. Create or update `src/components/ItemManager/utils/index.ts` to export:
```typescript
export * from './formatUtils';
```

**Verification Steps:**
- [x] `formatDuration(90)` returns `"1:30"`
- [x] `formatDuration(3661)` returns `"1:01:01"`
- [x] `formatDuration(0)` returns `"0:00"`
- [x] `formatDuration(-5)` handles gracefully (returns `"0:00"`)
- [x] `getAssetDisplayName` returns filename when available
- [x] `getAssetDisplayName` returns type-based name as fallback
- [x] All functions are exported from utils/index.ts

---

### Task 2: Define AssetItem Types ✅ COMPLETE

**Objective:** Add TypeScript interfaces for AssetItem component props and PendingAsset type.

**Implementation Notes:**
- Extended existing `PendingAsset` interface with `thumbnail` and `metadata` properties
- Added `AssetItemProps` interface with all required and optional props
- All properties have JSDoc documentation

**Files to Modify:**
- `src/components/ItemManager/ItemManager.types.ts`

**Implementation Steps:**

2.1. Add `PendingAsset` interface:

```typescript
/**
 * Pending asset structure from useAssetManagement hook.
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

2.2. Add `AssetItemProps` interface:

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

2.3. Ensure imports are available for `MediaItem` type from ItemCapture

**Verification Steps:**
- [ ] TypeScript compiles without errors
- [ ] `PendingAsset` interface is exported
- [ ] `AssetItemProps` interface is exported
- [ ] All optional properties have sensible defaults documented
- [ ] JSDoc comments are present for all properties

---

### Task 3: Create AssetItem Component Shell ✅ COMPLETE

**Implementation Notes:**
- Created full component in `src/components/ItemManager/components/AssetPanel/AssetItem.tsx`
- Exported from `src/components/ItemManager/components/AssetPanel/index.ts`
- Added to main barrel export in `src/components/ItemManager/index.ts`

**Objective:** Create the basic component structure with proper imports and exports.

**Files to Create:**
- `src/components/ItemManager/components/AssetPanel/AssetItem.tsx`

**Files to Modify:**
- `src/components/ItemManager/components/AssetPanel/index.ts` (add export)

**Implementation Steps:**

3.1. Create `AssetItem.tsx` with the following structure:

```typescript
'use client';

/**
 * AssetItem Component
 *
 * Displays an individual media asset within the AssetPanel drawer.
 * Shows thumbnail preview, type indicator, metadata, and remove button.
 *
 * @module ItemManager/components/AssetPanel/AssetItem
 * @lastModified 2026-01-03
 */

import { useState, useEffect, useMemo } from 'react';
import { Play, FileText, X, Image as ImageIcon, Video, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MediaItem } from '@/components/ItemCapture';
import type { AssetItemProps, PendingAsset } from '../../ItemManager.types';
import { formatDuration, getAssetDisplayName } from '../../utils/formatUtils';
```

3.2. Define size classes constant:

```typescript
const sizeClasses = {
  small: 'w-12 h-12',
  medium: 'w-16 h-16',
  large: 'w-20 h-20',
} as const;
```

3.3. Create the component function signature with props destructuring:

```typescript
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
  // Implementation in subsequent tasks
  return null; // Placeholder
}

export default AssetItem;
```

3.4. Update `src/components/ItemManager/components/AssetPanel/index.ts`:

```typescript
export { AssetItem } from './AssetItem';
export type { AssetItemProps } from '../../ItemManager.types';
```

**Verification Steps:**
- [ ] File compiles without TypeScript errors
- [ ] Component is properly exported
- [ ] All imports resolve correctly
- [ ] `'use client'` directive is present

---

### Task 4: Implement Thumbnail Display Logic ✅ COMPLETE

**Implementation Notes:**
- Implemented object URL creation and cleanup in useEffect
- Handles both MediaItem (thumbnail blob) and PendingAsset (previewUrl or file)
- Image error state resets when asset changes

**Objective:** Add thumbnail URL management with proper object URL lifecycle handling.

**Files to Modify:**
- `src/components/ItemManager/components/AssetPanel/AssetItem.tsx`

**Implementation Steps:**

4.1. Add state for thumbnail URL and image loading:

```typescript
const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
const [imageError, setImageError] = useState(false);
```

4.2. Implement useEffect for object URL creation and cleanup:

```typescript
useEffect(() => {
  // Determine the blob source: thumbnail first, then file for pending assets
  const blob = asset.thumbnail || ('file' in asset ? asset.file : null);

  if (!blob) {
    setThumbnailUrl(null);
    return;
  }

  const url = URL.createObjectURL(blob);
  setThumbnailUrl(url);

  // Cleanup: revoke object URL on unmount or when blob changes
  return () => {
    URL.revokeObjectURL(url);
  };
}, [asset.thumbnail, 'file' in asset ? asset.file : null]);
```

4.3. Implement memoized asset display name:

```typescript
const assetName = useMemo(() => getAssetDisplayName(asset), [asset]);
```

4.4. Reset image error state when asset changes:

```typescript
useEffect(() => {
  setImageError(false);
}, [asset.id]);
```

**Verification Steps:**
- [ ] Thumbnail URL is created when blob is available
- [ ] Object URL is properly revoked on unmount
- [ ] Object URL is revoked and recreated when asset changes
- [ ] No memory leaks from unreleased object URLs
- [ ] Image error state resets when asset changes

---

### Task 5: Implement Component JSX Structure ✅ COMPLETE

**Implementation Notes:**
- Full JSX with state-based styling (normal, pending, removal states)
- Optional drag handle section
- Thumbnail section with all type variations (video, image, pdf)
- Error fallback with type-appropriate icons

**Objective:** Build the complete JSX structure for the AssetItem component.

**Files to Modify:**
- `src/components/ItemManager/components/AssetPanel/AssetItem.tsx`

**Implementation Steps:**

5.1. Implement the main container div with state-based styling:

```typescript
return (
  <div
    onClick={() => onClick?.(asset.id)}
    className={cn(
      'flex items-center gap-3 p-3 rounded-lg border',
      'transition-all duration-200',
      onClick && 'cursor-pointer hover:bg-gray-50',
      // Normal state
      !isPending && !isMarkedForRemoval && 'border-gray-200 bg-white',
      // Pending addition - green highlight
      isPending && !isMarkedForRemoval && 'border-green-300 bg-green-50',
      // Pending removal - red/dimmed
      isMarkedForRemoval && 'border-red-300 bg-red-50 opacity-60',
      className
    )}
    role="listitem"
    aria-label={`${assetName}, ${asset.type}${isMarkedForRemoval ? ', marked for removal' : ''}`}
  >
    {/* Content sections */}
  </div>
);
```

5.2. Add optional drag handle section:

```typescript
{showDragHandle && (
  <div className="shrink-0 cursor-grab text-gray-400 hover:text-gray-600">
    <GripVertical className="w-5 h-5" />
  </div>
)}
```

5.3. Implement thumbnail section with all type variations:

```typescript
<div className={cn(
  'relative rounded-md overflow-hidden bg-gray-100 shrink-0',
  sizeClasses[size]
)}>
  {/* Thumbnail Image - for non-PDF types */}
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
</div>
```

**Verification Steps:**
- [ ] Container renders with correct state-based styling
- [ ] Drag handle only shows when `showDragHandle` is true
- [ ] Thumbnail section renders correctly for all asset types
- [ ] Error fallback displays appropriate icon
- [ ] ARIA attributes are present for accessibility

---

### Task 6: Implement Metadata Display and Badges ✅ COMPLETE

**Implementation Notes:**
- Duration badge for videos using formatDuration()
- Page count badge for PDFs with proper pluralization
- Info section with truncated filename and type
- "New" badge for pending additions

**Objective:** Add video duration badge, PDF page count badge, and info section.

**Files to Modify:**
- `src/components/ItemManager/components/AssetPanel/AssetItem.tsx`

**Implementation Steps:**

6.1. Add duration badge for video assets (inside thumbnail div):

```typescript
{/* Duration Badge - Video */}
{asset.type === 'video' && asset.metadata.duration !== undefined && (
  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-xs font-medium text-white bg-black/70 rounded">
    {formatDuration(asset.metadata.duration)}
  </span>
)}
```

6.2. Add page count badge for PDF assets (inside thumbnail div):

```typescript
{/* Page Count Badge - PDF */}
{asset.type === 'pdf' && asset.metadata.pageCount !== undefined && (
  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-xs font-medium text-white bg-black/70 rounded">
    {asset.metadata.pageCount} {asset.metadata.pageCount === 1 ? 'page' : 'pages'}
  </span>
)}
```

6.3. Implement info section with name and type:

```typescript
{/* Info Section */}
<div className="flex-1 min-w-0">
  <p
    className={cn(
      'text-sm font-medium text-gray-900 truncate',
      isMarkedForRemoval && 'line-through text-gray-500'
    )}
    title={assetName} // Show full name on hover
  >
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
```

**Verification Steps:**
- [ ] Video assets display duration badge in correct format
- [ ] PDF assets display page count with correct pluralization
- [ ] Photo assets do not display duration or page count
- [ ] Long filenames are truncated with ellipsis
- [ ] Full filename appears on hover (title attribute)
- [ ] "New" badge appears for pending additions
- [ ] Strikethrough applied for items marked for removal

---

### Task 7: Implement Action Buttons ✅ COMPLETE

**Implementation Notes:**
- Remove button with X icon for normal items
- Restore text button for items marked for removal
- e.stopPropagation() prevents card click when clicking buttons
- 44x44px minimum touch targets

**Objective:** Add remove and restore buttons with proper event handling and accessibility.

**Files to Modify:**
- `src/components/ItemManager/components/AssetPanel/AssetItem.tsx`

**Implementation Steps:**

7.1. Implement action buttons section:

```typescript
{/* Action Buttons */}
<div className="shrink-0">
  {isMarkedForRemoval ? (
    <button
      onClick={(e) => {
        e.stopPropagation(); // Prevent triggering onClick
        onRestore?.(asset.id);
      }}
      className={cn(
        'text-sm text-blue-600 hover:text-blue-700 font-medium',
        'px-2 py-1 rounded hover:bg-blue-50 transition-colors'
      )}
      aria-label="Restore this asset"
    >
      Restore
    </button>
  ) : (
    <button
      onClick={(e) => {
        e.stopPropagation(); // Prevent triggering onClick
        onRemove(asset.id);
      }}
      className={cn(
        'p-2 text-gray-400 hover:text-red-600 hover:bg-red-50',
        'rounded-lg transition-colors',
        // Touch-friendly minimum size
        'min-w-[44px] min-h-[44px] flex items-center justify-center'
      )}
      aria-label={`Remove ${assetName}`}
    >
      <X className="w-4 h-4" />
    </button>
  )}
</div>
```

7.2. Ensure proper event propagation handling:
- `e.stopPropagation()` prevents card click when clicking buttons
- Button clicks should not bubble to parent onClick handler

**Verification Steps:**
- [ ] Remove button appears for normal and pending items
- [ ] Restore button appears for items marked for removal
- [ ] Clicking remove button calls `onRemove` with correct asset ID
- [ ] Clicking restore button calls `onRestore` with correct asset ID
- [ ] Button clicks do not trigger card's onClick handler
- [ ] Remove button has minimum 44x44px touch target
- [ ] ARIA labels are present for screen readers
- [ ] Focus states are visible for keyboard navigation

---

### Task 8: Handle Edge Cases ✅ COMPLETE

**Implementation Notes:**
- formatDuration handles NaN, Infinity, negative values (returns "0:00")
- getAssetDisplayName checks metadata.originalFilename, then file.name, then type-based fallback
- isPendingAsset type guard for safe file property access

**Objective:** Add robust handling for edge cases and error states.

**Files to Modify:**
- `src/components/ItemManager/components/AssetPanel/AssetItem.tsx`
- `src/components/ItemManager/utils/formatUtils.ts`

**Implementation Steps:**

8.1. Update `formatDuration` to handle edge cases:

```typescript
export function formatDuration(seconds: number): string {
  // Handle invalid inputs
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const totalSeconds = Math.floor(seconds);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

8.2. Update `getAssetDisplayName` to handle edge cases:

```typescript
export function getAssetDisplayName(asset: MediaItem | PendingAsset): string {
  // Check for originalFilename in metadata
  if (asset.metadata?.originalFilename) {
    return asset.metadata.originalFilename;
  }

  // Fallback based on type
  const typeLabels: Record<string, string> = {
    video: 'Video asset',
    image: 'Image asset',
    pdf: 'PDF asset',
  };

  return typeLabels[asset.type] || 'Media asset';
}
```

8.3. Add type guard for checking if asset has file property:

```typescript
function isPendingAsset(asset: MediaItem | PendingAsset): asset is PendingAsset {
  return 'file' in asset && asset.file instanceof File;
}
```

8.4. Use type guard in thumbnail URL effect:

```typescript
useEffect(() => {
  const blob = asset.thumbnail || (isPendingAsset(asset) ? asset.file : null);
  // ... rest of implementation
}, [asset]);
```

**Verification Steps:**
- [ ] `formatDuration(NaN)` returns "0:00"
- [ ] `formatDuration(Infinity)` returns "0:00"
- [ ] `formatDuration(-10)` returns "0:00"
- [ ] Assets without originalFilename display type-based name
- [ ] Assets with undefined metadata handle gracefully
- [ ] Type guard correctly identifies pending vs committed assets
- [ ] No runtime errors for missing or malformed data

---

### Task 9: Add Test Harness Integration ✅ COMPLETE

**Implementation Notes:**
- Added AssetItem test view to `/test/item-manager` page
- 10 test cases covering all states: video, photo, pdf, pending, removal, drag handle, sizes, clickable, long filename
- Added AssetItem export to main ItemManager index

**Objective:** Add AssetItem examples to the test harness for visual verification.

**Files to Modify:**
- `src/app/test/item-manager/page.tsx` (if exists, otherwise create)

**Implementation Steps:**

9.1. Create mock data for different asset states:

```typescript
// Mock video asset
const mockVideoAsset: MediaItem = {
  id: 'video-1',
  type: 'video',
  file: new Blob([''], { type: 'video/mp4' }),
  order: 0,
  metadata: {
    mimeType: 'video/mp4',
    fileSize: 1024000,
    source: 'capture',
    duration: 90,
    originalFilename: 'coffee-maker-demo.mp4',
  },
};

// Mock photo asset
const mockPhotoAsset: MediaItem = {
  id: 'photo-1',
  type: 'image',
  file: new Blob([''], { type: 'image/jpeg' }),
  order: 1,
  metadata: {
    mimeType: 'image/jpeg',
    fileSize: 512000,
    source: 'upload',
    originalFilename: 'kitchen-appliance.jpg',
  },
};

// Mock PDF asset
const mockPdfAsset: MediaItem = {
  id: 'pdf-1',
  type: 'pdf',
  file: new Blob([''], { type: 'application/pdf' }),
  order: 2,
  metadata: {
    mimeType: 'application/pdf',
    fileSize: 256000,
    source: 'upload',
    pageCount: 5,
    originalFilename: 'user-manual.pdf',
  },
};
```

9.2. Add AssetItem test section to test page:

```typescript
<section className="mt-8 p-4 border rounded bg-white">
  <h2 className="text-lg font-bold mb-4">AssetItem States</h2>
  <div className="space-y-3 max-w-md">
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
      asset={mockPhotoAsset}
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

    {/* With Drag Handle */}
    <AssetItem
      asset={mockPhotoAsset}
      index={5}
      showDragHandle={true}
      onRemove={(id) => console.log('Remove:', id)}
    />
  </div>
</section>
```

**Verification Steps:**
- [ ] Test page loads without errors
- [ ] All asset type variations display correctly
- [ ] Video shows play icon and duration badge
- [ ] PDF shows document icon and page count badge
- [ ] Photo shows no special overlays
- [ ] Pending addition shows green styling and "New" badge
- [ ] Pending removal shows red/dimmed styling and "Restore" button
- [ ] Drag handle appears when enabled
- [ ] Console logs correct actions on button clicks

---

### Task 10: Integration with AssetPanel ✅ COMPLETE

**Implementation Notes:**
- Replaced placeholder rendering in AssetPanel.tsx with AssetItem component
- Passes isPendingAddition and isPendingRemoval from hook state
- Added role="list" and aria-label for accessibility

**Objective:** Connect AssetItem component with the parent AssetPanel.

**Files to Modify:**
- `src/components/ItemManager/components/AssetPanel/AssetPanel.tsx`

**Implementation Steps:**

10.1. Import AssetItem in AssetPanel:

```typescript
import { AssetItem } from './AssetItem';
```

10.2. Replace placeholder asset list rendering with AssetItem:

```typescript
{/* Asset List */}
<div className="space-y-2" role="list" aria-label="Media assets">
  {assets.map((asset, index) => (
    <AssetItem
      key={asset.id}
      asset={asset}
      index={index}
      isPending={pendingAdditions?.has(asset.id)}
      isMarkedForRemoval={pendingRemovals?.has(asset.id)}
      onRemove={onRemoveAsset}
      onRestore={onRestoreAsset}
      onClick={onAssetClick}
      size="medium"
      showDragHandle={enableReorder}
    />
  ))}
</div>
```

10.3. Handle empty state:

```typescript
{assets.length === 0 && (
  <div className="text-center py-8 text-gray-500">
    <p>No media assets yet</p>
    <p className="text-sm mt-1">Add photos, videos, or PDFs to this item</p>
  </div>
)}
```

**Verification Steps:**
- [ ] AssetItem components render within AssetPanel
- [ ] Props are correctly passed from parent to AssetItem
- [ ] Pending state flags are correctly computed
- [ ] Remove action integrates with useAssetManagement hook
- [ ] Restore action integrates with useAssetManagement hook
- [ ] Empty state displays when no assets exist

---

## Testing Checklist

### Unit Testing

- [ ] `formatDuration` handles all edge cases correctly
- [ ] `getAssetDisplayName` returns appropriate names for all scenarios
- [ ] Component renders without crashing for all asset types
- [ ] Remove button calls onRemove with correct ID
- [ ] Restore button calls onRestore with correct ID
- [ ] Click handler fires only when onClick prop is provided
- [ ] Object URLs are created and revoked correctly

### Visual Testing

- [ ] Video assets display play icon overlay
- [ ] Video assets display duration badge (e.g., "1:30")
- [ ] PDF assets display document icon
- [ ] PDF assets display page count badge (e.g., "5 pages")
- [ ] Photo assets display thumbnail without special overlays
- [ ] Pending additions have green border and "New" badge
- [ ] Pending removals have red border, opacity, and strikethrough
- [ ] Long filenames truncate with ellipsis
- [ ] Thumbnails display correctly for all sizes (small, medium, large)

### Accessibility Testing

- [ ] Screen reader announces asset name and type
- [ ] Remove button has descriptive aria-label
- [ ] Restore button has descriptive aria-label
- [ ] Component is keyboard focusable
- [ ] Focus indicators are visible
- [ ] Touch targets meet 44x44px minimum

### Cross-Browser Testing

- [ ] Desktop Chrome: all states display correctly
- [ ] Desktop Firefox: thumbnails load properly
- [ ] Desktop Safari: object URLs work correctly
- [ ] Mobile Safari (iOS): touch targets are adequate
- [ ] Mobile Chrome (Android): remove button easy to tap

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Task(s) |
|---------------------|---------|
| Each asset is displayed as a distinct card or list item | Task 5 |
| A thumbnail image is shown for each asset | Task 4, Task 5 |
| A visual type indicator clearly shows asset type | Task 5, Task 6 |
| For video assets, duration is displayed | Task 6 |
| For PDF assets, page count is displayed | Task 6 |
| Photo assets do not display duration or page count | Task 6 |
| Each asset card includes a remove button | Task 7 |
| Clicking remove button removes the asset | Task 7, Task 10 |
| Thumbnail accurately represents asset content | Task 4, Task 5 |
| Type indicators use consistent iconography | Task 5 |
| Layout remains visually clean and scannable | Task 5 |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Object URL memory leaks | Strict cleanup in useEffect return; revoke on unmount |
| Thumbnail not available | Display type-appropriate fallback icon |
| Long filenames breaking layout | Use `truncate` class with `title` attribute for hover |
| Touch targets too small | Enforce min-w-[44px] min-h-[44px] on buttons |
| Performance with many assets | Consider virtualization in future (out of scope for this task) |

---

## Dependencies Graph

```
Task 1 (Format Utils)
    │
    └──► Task 2 (Types) ──► Task 3 (Component Shell)
                                │
                                ├──► Task 4 (Thumbnail Logic)
                                │         │
                                │         └──► Task 5 (JSX Structure)
                                │                   │
                                │                   └──► Task 6 (Metadata/Badges)
                                │                             │
                                │                             └──► Task 7 (Action Buttons)
                                │                                       │
                                │                                       └──► Task 8 (Edge Cases)
                                │                                                 │
                                │                                                 └──► Task 9 (Test Harness)
                                │                                                           │
                                └─────────────────────────────────────────────────────────────► Task 10 (Integration)
```

---

## Document History

| Date | Author | Changes |
|------|--------|---------|
| 2026-01-03 | Senior Dev Agent | Initial detailed task breakdown |
