# REQ-051: Build MediaThumbnail Component - Implementation Overview

**Generated:** 2025-12-31T12:15:00
**Last Modified:** 2025-12-31T12:15:00
**Request Reference:** `/docs/gen_requests.md` — Request #051
**Implementation Plan Reference:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 5 - Review & Polish
**Task ID:** 5.2

---

## Summary

Build a reusable `MediaThumbnail` component that provides consistent visual representation for different media types (video, image, PDF) within the ItemCapture review flow. The component displays appropriate overlays, controls, and loading states for each media type.

---

## Technical Context

### From Implementation Plan

| Aspect | Detail |
|--------|--------|
| Location | `src/components/ItemCapture/components/shared/MediaThumbnail.tsx` |
| Phase | 5 - Review & Polish (Task 5.2) |
| Dependency | Can be developed in parallel with Task 5.1 (ReviewStep) |
| Purpose | Consistent display for video/image/PDF in review grids |

### Existing Patterns to Follow

| Pattern | Source File | Notes |
|---------|-------------|-------|
| Thumbnail with loading state | `src/components/LinkCard.tsx:8-145` | Uses `useState` for imageError/imageLoading, handles fallback |
| Icon by media type | `src/components/LinkCard.tsx:13-26` | Switch statement with Lucide icons |
| Color by type | `src/lib/utils.ts:39-52` | `getLinkTypeColor()` returns Tailwind classes |
| PDF thumbnail generation | `src/components/ItemCapture/utils/pdfThumbnailGenerator.ts` | Existing utility for PDF first-page extraction |
| Utility class merging | `src/lib/utils.ts:5-7` | `cn()` from clsx + tailwind-merge |

### New vs Existing

The `LinkCard` component (src/components/LinkCard.tsx) handles external URLs with thumbnails but is designed for URL-based content. `MediaThumbnail` differs in that:

1. It displays local Blob/File content (not remote URLs)
2. It requires a delete button overlay
3. It's used within the ItemCapture wizard (not item display)
4. It uses the `MediaItem` type from ItemCapture, not `LinkCardProps`

---

## Functional Requirements

### From REQ-051 Acceptance Criteria

1. **Image thumbnails** display the actual image content scaled to fit the thumbnail area
2. **Video thumbnails** display a representative frame with a visible play icon overlay
3. **PDF thumbnails** display a document icon with the exact page count shown as text
4. **Consistent dimensions** — all three media types render at the same dimensions in grid
5. **Delete button overlay** appears on hover (desktop) or tap (mobile) for all media types
6. **Delete action** removes the associated media item from the collection
7. **Loading state** displays a spinner or skeleton while content is processing
8. **Smooth transition** from loading state to final thumbnail
9. **Consistent styling** — spacing, border radius, and visual consistency

### Additional Requirements (from Task Details)

- Play icon overlay for video
- PDF icon with page count
- Delete button overlay
- Loading state

---

## Component Design

### Props Interface

```typescript
// File: src/components/ItemCapture/components/shared/MediaThumbnail.tsx

interface MediaThumbnailProps {
  /** The media item to display */
  media: MediaItem;

  /** Callback when delete button is clicked */
  onDelete: (id: string) => void;

  /** Optional: callback when thumbnail is clicked (e.g., for preview modal) */
  onClick?: (id: string) => void;

  /** Whether the thumbnail is in a loading state (e.g., processing) */
  isLoading?: boolean;

  /** Size variant for the thumbnail */
  size?: 'small' | 'medium' | 'large';

  /** Optional additional class names */
  className?: string;
}
```

### MediaItem Interface (from ItemCapture.types.ts)

```typescript
export interface MediaItem {
  id: string;
  type: 'video' | 'image' | 'pdf';
  file: File | Blob;
  thumbnail?: Blob;           // Pre-generated thumbnail
  order: number;
  metadata: MediaMetadata;
}

export interface MediaMetadata {
  duration?: number;          // Video duration in seconds
  dimensions?: { width: number; height: number };
  originalFilename?: string;
  pageCount?: number;         // PDF page count
  mimeType: string;
  fileSize: number;
  source: 'capture' | 'upload';
  edits?: {
    cropped?: boolean;
    rotated?: number;
    trimStart?: number;
    trimEnd?: number;
  };
}
```

### Visual States

| State | Video | Image | PDF |
|-------|-------|-------|-----|
| Loading | Spinner over gray bg | Spinner over gray bg | Spinner over gray bg |
| Loaded | Thumbnail + Play icon | Thumbnail only | Doc icon + page count |
| Error | Fallback icon | Fallback icon | Fallback icon |
| Hover | Delete btn visible | Delete btn visible | Delete btn visible |

---

## Implementation Tasks

### Task 1: Create Component File Structure

**File:** `src/components/ItemCapture/components/shared/MediaThumbnail.tsx`

1. Create the shared directory if it doesn't exist
2. Add 'use client' directive
3. Import dependencies: React, Lucide icons, cn utility
4. Export MediaThumbnailProps interface

### Task 2: Implement Core Thumbnail Rendering

1. Accept `MediaItem` and create object URL from `thumbnail` or `file` blob
2. Handle image display with `object-cover` scaling
3. Add `aspect-square` or configurable aspect ratio container
4. Clean up object URLs on unmount with `useEffect`

### Task 3: Implement Type-Specific Overlays

**Video:**
- Center play icon (circle with triangle)
- Match existing LinkCard pattern (src/components/LinkCard.tsx:117-123)
- Semi-transparent background for visibility

**PDF:**
- Document icon (FileText from Lucide)
- Page count badge (e.g., "5 pages")
- Use `metadata.pageCount` from MediaItem

**Image:**
- No overlay needed (just the image)

### Task 4: Implement Delete Button Overlay

1. Absolute positioned X button in top-right corner
2. Show on hover (desktop) via `group-hover:opacity-100`
3. Always visible on touch devices (consider touch detection)
4. Call `onDelete(media.id)` on click
5. Prevent event propagation to avoid triggering onClick

### Task 5: Implement Loading State

1. Accept `isLoading` prop
2. Display spinner animation over gray background when loading
3. Fade in thumbnail when loading completes
4. Match spinner style from LinkCard (src/components/LinkCard.tsx:104-106)

### Task 6: Add Size Variants

| Size | Dimensions | Use Case |
|------|------------|----------|
| small | 80x80 | Compact thumbnail strip |
| medium | 120x120 | Default review grid |
| large | 200x200 | Preview modal |

Use Tailwind classes:
- `small`: `w-20 h-20`
- `medium`: `w-30 h-30` or `w-[120px] h-[120px]`
- `large`: `w-50 h-50` or `w-[200px] h-[200px]`

### Task 7: Handle Error States

1. Track image load errors with useState
2. Display fallback icon based on media type
3. Match fallback pattern from LinkCard (src/components/LinkCard.tsx:88-100)

---

## Authorized Files and Functions for Modification

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/ItemCapture/components/shared/MediaThumbnail.tsx` | Main component |

### Files to Read (Reference Only)

| File | Purpose |
|------|---------|
| `src/components/LinkCard.tsx` | Pattern for loading states, image error handling, type overlays |
| `src/components/ItemCapture/ItemCapture.types.ts` | MediaItem interface (if exists, or define inline) |
| `src/components/ItemCapture/utils/pdfThumbnailGenerator.ts` | PDF thumbnail generation utility |
| `src/lib/utils.ts` | `cn()` utility function |

### Files to Potentially Modify

| File | Change |
|------|--------|
| `src/components/ItemCapture/index.ts` | Export MediaThumbnail if needed externally |

### Dependencies (No Installation Needed)

| Package | Usage |
|---------|-------|
| `lucide-react` | Icons: Play, FileText, X, Image, Video |
| `clsx` | Via cn() utility |
| `tailwind-merge` | Via cn() utility |

---

## Integration Points

### With ReviewStep (Task 5.1)

ReviewStep will import MediaThumbnail to display captured media:

```tsx
// In ReviewStep.tsx
import { MediaThumbnail } from '../shared/MediaThumbnail';

// Usage in media grid
{mediaItems.map((item) => (
  <MediaThumbnail
    key={item.id}
    media={item}
    onDelete={handleRemoveMedia}
    onClick={handlePreviewMedia}
    size="medium"
  />
))}
```

### With State Machine (useItemCaptureState)

The delete callback will dispatch:
```typescript
dispatch({ type: 'REMOVE_MEDIA', payload: media.id });
```

---

## Testing Checklist

- [ ] Image thumbnail displays correctly from Blob
- [ ] Video thumbnail shows play icon overlay
- [ ] PDF thumbnail shows document icon with page count
- [ ] Delete button appears on hover (desktop)
- [ ] Delete button triggers onDelete callback
- [ ] Loading state displays spinner
- [ ] Error state displays fallback icon
- [ ] Object URLs are cleaned up on unmount
- [ ] All sizes render at expected dimensions
- [ ] Grid layout maintains consistent sizing

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Object URL memory leak | Use `useEffect` cleanup with `URL.revokeObjectURL` |
| Missing thumbnail Blob | Fallback to generating from file, or show placeholder |
| Touch device delete button visibility | Consider always-visible delete button on touch or long-press gesture |
| Large image/video causing slow render | Ensure thumbnails are pre-generated at smaller size |

---

## References

- **Existing Pattern:** `src/components/LinkCard.tsx` — Loading states, error handling, overlays
- **Utility:** `src/lib/utils.ts` — `cn()` function
- **PDF Generation:** `src/components/ItemCapture/utils/pdfThumbnailGenerator.ts`
- **Implementation Plan:** `docs/prd/item-capture-implementation-plan.md` — Task 5.2 details
- **Request:** `docs/gen_requests.md` — REQ-051 acceptance criteria

---

## Example Implementation Skeleton

```tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Play, FileText, X, ImageIcon, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MediaItem } from '../../ItemCapture.types';

export interface MediaThumbnailProps {
  media: MediaItem;
  onDelete: (id: string) => void;
  onClick?: (id: string) => void;
  isLoading?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const sizeClasses = {
  small: 'w-20 h-20',
  medium: 'w-[120px] h-[120px]',
  large: 'w-[200px] h-[200px]',
};

export function MediaThumbnail({
  media,
  onDelete,
  onClick,
  isLoading = false,
  size = 'medium',
  className,
}: MediaThumbnailProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Create object URL from thumbnail or file
  const objectUrl = useMemo(() => {
    const blob = media.thumbnail || media.file;
    return URL.createObjectURL(blob);
  }, [media.thumbnail, media.file]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(media.id);
  };

  const handleClick = () => {
    onClick?.(media.id);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group relative rounded-lg overflow-hidden bg-gray-100 cursor-pointer',
        sizeClasses[size],
        className
      )}
    >
      {/* Thumbnail Image */}
      {media.type !== 'pdf' && !imageError && (
        <img
          src={objectUrl}
          alt={media.metadata.originalFilename || 'Media thumbnail'}
          className={cn(
            'w-full h-full object-cover transition-opacity',
            imageLoading ? 'opacity-0' : 'opacity-100'
          )}
          onLoad={() => setImageLoading(false)}
          onError={() => setImageError(true)}
        />
      )}

      {/* Loading State */}
      {(isLoading || imageLoading) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Video Play Icon Overlay */}
      {media.type === 'video' && !isLoading && !imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/50 text-white rounded-full p-2">
            <Play className="w-6 h-6 fill-current" />
          </div>
        </div>
      )}

      {/* PDF Icon + Page Count */}
      {media.type === 'pdf' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-50">
          <FileText className="w-10 h-10 text-blue-500" />
          {media.metadata.pageCount && (
            <span className="text-xs text-blue-700 mt-1">
              {media.metadata.pageCount} {media.metadata.pageCount === 1 ? 'page' : 'pages'}
            </span>
          )}
        </div>
      )}

      {/* Delete Button Overlay */}
      <button
        onClick={handleDelete}
        className={cn(
          'absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          'hover:bg-red-600 focus:opacity-100 focus:outline-none'
        )}
        aria-label="Delete media"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default MediaThumbnail;
```

---

## Next Steps

After this component is implemented:
1. Integrate with ReviewStep (Task 5.1)
2. Add to barrel export in ItemCapture/index.ts
3. Test with all media types (captured video, captured photo, uploaded image, uploaded PDF)
4. Verify memory cleanup with React DevTools
