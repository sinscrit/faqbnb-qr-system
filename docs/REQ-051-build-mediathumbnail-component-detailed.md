# REQ-051: Build MediaThumbnail Component - Detailed Task Breakdown

**Generated:** 2025-12-31T21:45:00
**Last Modified:** 2025-12-31T21:45:00
**Overview Reference:** `/docs/REQ-051-build-mediathumbnail-component-overview.md`
**Request Reference:** `/docs/gen_requests.md` — Request #051
**Implementation Plan Reference:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 5 - Review & Polish
**Task ID:** 5.2

---

## Summary

This document breaks down the MediaThumbnail component implementation into granular, actionable tasks of ≤1 story point each. The component provides consistent visual representation for video, image, and PDF media types within the ItemCapture review flow.

---

## Authorized Files and Functions for Modification

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/ItemCapture/components/shared/MediaThumbnail.tsx` | Main MediaThumbnail component |

### Files to Potentially Modify

| File | Change |
|------|--------|
| `src/components/ItemCapture/index.ts` | Add MediaThumbnail export (if barrel export exists) |

### Files to Read (Reference Only - DO NOT Modify)

| File | Purpose |
|------|---------|
| `src/components/LinkCard.tsx` | Pattern for loading states, image error handling, type overlays |
| `src/components/ItemCapture/utils/pdfThumbnailGenerator.ts` | PDF thumbnail generation utility reference |
| `src/lib/utils.ts` | `cn()` utility function |

---

## Task Breakdown

### Task 1: Create Shared Directory and Component File Scaffold

**Estimate:** 0.5 story points
**Dependencies:** None

#### Description

Create the component directory structure and initial file with proper imports and type definitions.

#### Implementation Steps

1. Create directory `src/components/ItemCapture/components/shared/` if it doesn't exist
2. Create file `src/components/ItemCapture/components/shared/MediaThumbnail.tsx`
3. Add `'use client'` directive at the top
4. Import dependencies:
   - `useState`, `useEffect`, `useMemo` from `react`
   - Icons from `lucide-react`: `Play`, `FileText`, `X`, `ImageIcon`, `Video`
   - `cn` from `@/lib/utils`
5. Define `MediaItem` and `MediaMetadata` interfaces (or import if types file exists)
6. Define `MediaThumbnailProps` interface with all required props
7. Export an empty functional component shell

#### Code Structure

```typescript
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Play, FileText, X, ImageIcon, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

// Type definitions inline until ItemCapture.types.ts is created
export interface MediaMetadata {
  duration?: number;
  dimensions?: { width: number; height: number };
  originalFilename?: string;
  pageCount?: number;
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

export interface MediaItem {
  id: string;
  type: 'video' | 'image' | 'pdf';
  file: File | Blob;
  thumbnail?: Blob;
  order: number;
  metadata: MediaMetadata;
}

export interface MediaThumbnailProps {
  media: MediaItem;
  onDelete: (id: string) => void;
  onClick?: (id: string) => void;
  isLoading?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function MediaThumbnail(props: MediaThumbnailProps) {
  return null; // Placeholder
}

export default MediaThumbnail;
```

#### Verification Steps

1. File exists at `src/components/ItemCapture/components/shared/MediaThumbnail.tsx`
2. TypeScript compiles without errors: `npx tsc --noEmit`
3. All imports resolve correctly
4. Interfaces match the overview document specification

---

### Task 2: Implement Size Variants and Base Container

**Estimate:** 0.5 story points
**Dependencies:** Task 1

#### Description

Implement the size variant system and base container styling for the thumbnail.

#### Implementation Steps

1. Define `sizeClasses` constant mapping size variants to Tailwind classes:
   - `small`: `w-20 h-20` (80x80px)
   - `medium`: `w-[120px] h-[120px]` (120x120px)
   - `large`: `w-[200px] h-[200px]` (200x200px)
2. Create the outer container div with:
   - `group` class for hover state management
   - `relative` for absolute positioning of overlays
   - `rounded-lg` for consistent border radius
   - `overflow-hidden` to clip content
   - `bg-gray-100` for loading background
   - `cursor-pointer` for interactive feel
   - Dynamic size class based on `size` prop
   - Support for `className` prop extension via `cn()`
3. Add `onClick` handler that calls `props.onClick(media.id)` if defined

#### Code Structure

```typescript
const sizeClasses = {
  small: 'w-20 h-20',
  medium: 'w-[120px] h-[120px]',
  large: 'w-[200px] h-[200px]',
} as const;

// In component:
<div
  onClick={() => onClick?.(media.id)}
  className={cn(
    'group relative rounded-lg overflow-hidden bg-gray-100 cursor-pointer',
    sizeClasses[size],
    className
  )}
>
  {/* Content will go here */}
</div>
```

#### Verification Steps

1. Component renders at correct dimensions for each size variant
2. `className` prop properly extends base styles
3. Click handler fires with correct media id
4. Container has rounded corners and overflow hidden

---

### Task 3: Implement Object URL Management with Cleanup

**Estimate:** 0.5 story points
**Dependencies:** Task 2

#### Description

Create and manage object URLs from Blob data with proper memory cleanup on unmount or media change.

#### Implementation Steps

1. Add `useMemo` hook to create object URL from `media.thumbnail` or fallback to `media.file`
2. Add `useEffect` cleanup hook that calls `URL.revokeObjectURL()` when:
   - Component unmounts
   - Object URL changes (dependency on objectUrl)
3. Handle case where both `thumbnail` and `file` might be undefined gracefully

#### Code Structure

```typescript
const objectUrl = useMemo(() => {
  const blob = media.thumbnail || media.file;
  if (!blob) return null;
  return URL.createObjectURL(blob);
}, [media.thumbnail, media.file]);

useEffect(() => {
  return () => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  };
}, [objectUrl]);
```

#### Verification Steps

1. Object URL is created successfully from thumbnail Blob
2. Object URL falls back to file Blob when thumbnail is missing
3. Console shows no memory leak warnings in React DevTools
4. URL.revokeObjectURL is called on unmount (verify with console.log in dev)

---

### Task 4: Implement Image/Video Thumbnail Display

**Estimate:** 0.5 story points
**Dependencies:** Task 3

#### Description

Render the actual thumbnail image for image and video media types with loading and error states.

#### Implementation Steps

1. Add state hooks:
   - `const [imageError, setImageError] = useState(false)`
   - `const [imageLoading, setImageLoading] = useState(true)`
2. Conditionally render `<img>` element when:
   - `media.type !== 'pdf'` (PDFs show icon, not image)
   - `!imageError` (no error loading image)
   - `objectUrl` exists
3. Apply image styling:
   - `w-full h-full` to fill container
   - `object-cover` for proper scaling
   - `transition-opacity` for smooth fade-in
   - Dynamic opacity based on `imageLoading` state
4. Add `onLoad` handler to set `imageLoading` to false
5. Add `onError` handler to set `imageError` to true
6. Set `alt` attribute from `media.metadata.originalFilename` or default

#### Code Structure

```typescript
{media.type !== 'pdf' && !imageError && objectUrl && (
  <img
    src={objectUrl}
    alt={media.metadata.originalFilename || 'Media thumbnail'}
    className={cn(
      'w-full h-full object-cover transition-opacity duration-200',
      imageLoading ? 'opacity-0' : 'opacity-100'
    )}
    onLoad={() => setImageLoading(false)}
    onError={() => {
      setImageError(true);
      setImageLoading(false);
    }}
  />
)}
```

#### Verification Steps

1. Image displays correctly from Blob URL
2. Image scales with `object-cover` without distortion
3. Loading state (opacity-0) transitions to visible (opacity-100)
4. Error state is tracked when image fails to load

---

### Task 5: Implement Loading State Display

**Estimate:** 0.5 story points
**Dependencies:** Task 4

#### Description

Show a loading spinner when content is being processed or image is loading. Match the spinner style from LinkCard.tsx:104-106.

#### Implementation Steps

1. Display loading overlay when:
   - `isLoading` prop is true (external processing state), OR
   - `imageLoading` is true AND `media.type !== 'pdf'` (image still loading)
2. Create spinner with:
   - Absolute positioning to cover entire container
   - Gray background (`bg-gray-100`)
   - Centered flexbox layout
   - Spinning border animation matching LinkCard pattern:
     - `w-6 h-6` size
     - `border-2 border-gray-300 border-t-gray-600`
     - `rounded-full animate-spin`

#### Code Structure

```typescript
{(isLoading || (imageLoading && media.type !== 'pdf')) && (
  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
    <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
  </div>
)}
```

#### Verification Steps

1. Spinner displays when `isLoading` prop is true
2. Spinner displays while image is loading
3. Spinner disappears when image loads successfully
4. Spinner visual matches LinkCard component spinner
5. PDF type does not show image loading spinner (only `isLoading` prop)

---

### Task 6: Implement Video Play Icon Overlay

**Estimate:** 0.5 story points
**Dependencies:** Task 5

#### Description

Display a centered play icon overlay for video thumbnails, matching the pattern from LinkCard.tsx:117-123.

#### Implementation Steps

1. Conditionally render overlay when:
   - `media.type === 'video'`
   - `!isLoading` (not in loading state)
   - `!imageLoading` (thumbnail has loaded)
2. Create centered overlay with:
   - `absolute inset-0` for full coverage
   - Flexbox centering
3. Create play button with:
   - Semi-transparent dark background: `bg-black/50`
   - White text color
   - Rounded full: `rounded-full`
   - Padding: `p-2` or `p-3`
4. Use Lucide `Play` icon with:
   - Size: `w-6 h-6`
   - `fill-current` for solid fill (not just stroke)

#### Code Structure

```typescript
{media.type === 'video' && !isLoading && !imageLoading && (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="bg-black/50 text-white rounded-full p-2">
      <Play className="w-6 h-6 fill-current" />
    </div>
  </div>
)}
```

#### Verification Steps

1. Play icon appears only on video thumbnails
2. Play icon is centered in the thumbnail
3. Play icon has semi-transparent background for visibility
4. Icon is solid filled (not just outline)
5. Overlay does not appear during loading states

---

### Task 7: Implement PDF Icon with Page Count Display

**Estimate:** 0.5 story points
**Dependencies:** Task 5

#### Description

Display a document icon with page count for PDF media types instead of an image thumbnail.

#### Implementation Steps

1. Conditionally render PDF display when `media.type === 'pdf'`
2. Create full container overlay with:
   - `absolute inset-0` for full coverage
   - Flexbox column centering
   - Light blue background: `bg-blue-50`
3. Display FileText icon from Lucide:
   - Size: `w-10 h-10`
   - Color: `text-blue-500`
4. Display page count below icon when `media.metadata.pageCount` exists:
   - Font size: `text-xs`
   - Color: `text-blue-700`
   - Margin top: `mt-1`
   - Pluralization: "1 page" vs "N pages"

#### Code Structure

```typescript
{media.type === 'pdf' && (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-50">
    <FileText className="w-10 h-10 text-blue-500" />
    {media.metadata.pageCount !== undefined && (
      <span className="text-xs text-blue-700 mt-1">
        {media.metadata.pageCount} {media.metadata.pageCount === 1 ? 'page' : 'pages'}
      </span>
    )}
  </div>
)}
```

#### Verification Steps

1. PDF media shows document icon instead of image
2. Page count displays correctly with proper pluralization
3. "1 page" shows for single-page PDFs
4. "5 pages" shows for multi-page PDFs
5. Page count is hidden when `pageCount` is undefined
6. Blue color scheme matches design spec

---

### Task 8: Implement Error State with Fallback Icon

**Estimate:** 0.5 story points
**Dependencies:** Task 4

#### Description

Display appropriate fallback icons when image loading fails, matching the fallback pattern from LinkCard.tsx:88-100.

#### Implementation Steps

1. Display fallback when:
   - `imageError` is true, AND
   - `media.type !== 'pdf'` (PDF already has its own display)
2. Create centered container with:
   - `absolute inset-0` for full coverage
   - Flexbox centering
   - Gradient background: `bg-gradient-to-br from-gray-50 to-gray-100`
3. Select icon based on media type:
   - `video`: `Video` icon with `text-gray-400`
   - `image`: `ImageIcon` icon with `text-gray-400`
4. Apply icon styling:
   - Size: `w-8 h-8`
   - Color: `text-gray-400`

#### Code Structure

```typescript
{imageError && media.type !== 'pdf' && (
  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
    {media.type === 'video' ? (
      <Video className="w-8 h-8 text-gray-400" />
    ) : (
      <ImageIcon className="w-8 h-8 text-gray-400" />
    )}
  </div>
)}
```

#### Verification Steps

1. Fallback displays when image fails to load
2. Correct icon shown for video vs image types
3. Fallback does not interfere with PDF display
4. Gradient background provides visual distinction

---

### Task 9: Implement Delete Button Overlay

**Estimate:** 0.5 story points
**Dependencies:** Task 2

#### Description

Add a delete button that appears on hover (desktop) and is always accessible for touch devices.

#### Implementation Steps

1. Create delete button as the last child in the container (highest z-index)
2. Button styling:
   - `absolute top-1 right-1` positioning
   - `p-1` padding
   - `rounded-full` for circular shape
   - `bg-black/60` semi-transparent background
   - `text-white` icon color
3. Hover behavior:
   - `opacity-0` by default (hidden)
   - `group-hover:opacity-100` (visible on container hover)
   - `transition-opacity` for smooth fade
4. Focus and interaction states:
   - `hover:bg-red-600` on button hover
   - `focus:opacity-100` for keyboard accessibility
   - `focus:outline-none` clean focus state (or add focus-visible ring)
5. Add `onClick` handler:
   - Call `e.stopPropagation()` to prevent triggering container onClick
   - Call `onDelete(media.id)`
6. Add accessibility:
   - `aria-label="Delete media"`
7. Use `X` icon from Lucide with `w-4 h-4`

#### Code Structure

```typescript
<button
  onClick={(e) => {
    e.stopPropagation();
    onDelete(media.id);
  }}
  className={cn(
    'absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white',
    'opacity-0 group-hover:opacity-100 transition-opacity',
    'hover:bg-red-600 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white'
  )}
  aria-label="Delete media"
>
  <X className="w-4 h-4" />
</button>
```

#### Verification Steps

1. Delete button hidden by default
2. Button appears on hover (desktop)
3. Button is always keyboard accessible (Tab + Enter)
4. Clicking button calls `onDelete` with correct id
5. Clicking button does NOT trigger container `onClick`
6. Button turns red on hover
7. Screen reader announces "Delete media"

---

### Task 10: Add Touch Device Support for Delete Button

**Estimate:** 0.5 story points
**Dependencies:** Task 9

#### Description

Ensure delete button is accessible on touch devices where hover is not available.

#### Implementation Steps

1. Consider two approaches:
   - **Option A (Recommended):** Always show delete button with reduced opacity on touch devices
   - **Option B:** Add touch/tap detection to toggle visibility
2. For Option A, add media query or touch detection:
   - Use `@media (hover: none)` in Tailwind or detect touch capability
   - Show button with `opacity-70` on touch devices
3. Alternative: Use `focus-within` on parent to show button when any child is focused
4. Ensure button has minimum touch target size (44x44px for accessibility)
   - Current `p-1` with icon may be too small; consider `p-2` or `min-w-[44px] min-h-[44px]`

#### Code Update (Option A)

```typescript
// Add touch-friendly class
<button
  onClick={(e) => {
    e.stopPropagation();
    onDelete(media.id);
  }}
  className={cn(
    'absolute top-1 right-1 p-1.5 rounded-full bg-black/60 text-white',
    'opacity-0 group-hover:opacity-100 transition-opacity',
    // Touch device support: always visible with reduced opacity
    'touch-manipulation',
    'sm:opacity-0 sm:group-hover:opacity-100', // Desktop: hidden until hover
    'max-sm:opacity-70', // Mobile: always visible
    'hover:bg-red-600 focus:opacity-100 focus:outline-none',
    'min-w-[32px] min-h-[32px] flex items-center justify-center'
  )}
  aria-label="Delete media"
>
  <X className="w-4 h-4" />
</button>
```

#### Verification Steps

1. On mobile/touch devices, delete button is visible
2. Button tap target is at least 32x32px (preferably 44x44px)
3. Desktop hover behavior still works
4. Button does not interfere with thumbnail visibility

---

### Task 11: Write Unit Tests for MediaThumbnail Component

**Estimate:** 1 story point
**Dependencies:** Tasks 1-10

#### Description

Create comprehensive unit tests for the MediaThumbnail component covering all props, states, and interactions.

#### Test File Location

`src/components/ItemCapture/components/shared/MediaThumbnail.test.tsx`

#### Test Cases to Implement

1. **Rendering Tests:**
   - Renders without crashing with minimal props
   - Renders at correct size for each size variant (small, medium, large)
   - Applies custom className correctly

2. **Image Display Tests:**
   - Displays image thumbnail from Blob
   - Displays video thumbnail from Blob
   - Does not display image for PDF type

3. **Loading State Tests:**
   - Shows spinner when isLoading is true
   - Shows spinner while image is loading
   - Hides spinner after image loads

4. **Type-Specific Overlay Tests:**
   - Shows play icon for video type
   - Shows document icon for PDF type
   - Shows page count for PDF when metadata includes pageCount
   - Does not show play icon for image type

5. **Error State Tests:**
   - Shows fallback icon when image fails to load
   - Differentiates fallback icon by media type

6. **Delete Button Tests:**
   - Delete button visible on hover
   - Delete button calls onDelete with correct id
   - Delete click does not trigger onClick

7. **Click Handler Tests:**
   - Container onClick calls onClick prop with media id
   - onClick is optional and component works without it

8. **Memory Cleanup Tests:**
   - Object URL is created from blob
   - Object URL is revoked on unmount (mock URL.revokeObjectURL)

#### Verification Steps

1. All tests pass: `npm test -- MediaThumbnail`
2. Test coverage > 80% for the component
3. No console errors during test runs

---

### Task 12: Manual Integration Testing

**Estimate:** 0.5 story points
**Dependencies:** Task 11

#### Description

Manually test the component in the context of the ItemCapture review flow (or test harness if ReviewStep not yet complete).

#### Test Scenarios

1. **Image Thumbnail:**
   - Upload a JPEG image
   - Verify thumbnail displays correctly
   - Verify delete button appears on hover
   - Verify delete removes item

2. **Video Thumbnail:**
   - Record or upload a video
   - Verify thumbnail shows video frame
   - Verify play icon overlay is visible
   - Verify delete functionality

3. **PDF Thumbnail:**
   - Upload a PDF document
   - Verify document icon displays
   - Verify page count shows correctly
   - Verify delete functionality

4. **Loading State:**
   - Pass `isLoading={true}` prop
   - Verify spinner displays
   - Verify content hidden during loading

5. **Error Handling:**
   - Simulate image load error (corrupted blob)
   - Verify fallback icon displays

6. **Grid Layout:**
   - Display multiple thumbnails in a grid
   - Verify consistent sizing across all types
   - Verify no layout shifts

7. **Touch Device:**
   - Test on mobile device or mobile emulator
   - Verify delete button accessibility
   - Verify tap interactions work

#### Verification Steps

1. All manual test scenarios pass
2. No console errors during testing
3. Memory usage stable (no leaks observed)
4. Component integrates cleanly with parent container

---

### Task 13: Update Barrel Export (If Applicable)

**Estimate:** 0.25 story points
**Dependencies:** Task 10

#### Description

Add MediaThumbnail to the ItemCapture barrel export if `src/components/ItemCapture/index.ts` exists.

#### Implementation Steps

1. Check if `src/components/ItemCapture/index.ts` exists
2. If yes, add export:
   ```typescript
   export { MediaThumbnail } from './components/shared/MediaThumbnail';
   export type { MediaThumbnailProps, MediaItem, MediaMetadata } from './components/shared/MediaThumbnail';
   ```
3. If no, skip this task (component can be imported directly)

#### Verification Steps

1. Import works from barrel: `import { MediaThumbnail } from '@/components/ItemCapture'`
2. TypeScript types are properly exported
3. No circular dependency warnings

---

## Task Summary

| Task | Description | Estimate | Dependencies |
|------|-------------|----------|--------------|
| 1 | Create directory and component scaffold | 0.5 SP | None |
| 2 | Implement size variants and base container | 0.5 SP | Task 1 |
| 3 | Implement object URL management with cleanup | 0.5 SP | Task 2 |
| 4 | Implement image/video thumbnail display | 0.5 SP | Task 3 |
| 5 | Implement loading state display | 0.5 SP | Task 4 |
| 6 | Implement video play icon overlay | 0.5 SP | Task 5 |
| 7 | Implement PDF icon with page count | 0.5 SP | Task 5 |
| 8 | Implement error state with fallback icon | 0.5 SP | Task 4 |
| 9 | Implement delete button overlay | 0.5 SP | Task 2 |
| 10 | Add touch device support for delete button | 0.5 SP | Task 9 |
| 11 | Write unit tests | 1.0 SP | Tasks 1-10 |
| 12 | Manual integration testing | 0.5 SP | Task 11 |
| 13 | Update barrel export | 0.25 SP | Task 10 |

**Total Estimate:** ~6.75 story points (~1-2 days of focused work)

---

## Recommended Execution Order

```
Sequential Track:
1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13
                  ↑           ↑
                  └─────┬─────┘
                        │
              (5 and 8 can run in parallel with 6, 7, 9)
```

**Parallelization Notes:**
- Tasks 6, 7, 8, 9 can be developed in parallel once Task 5 is complete
- Task 10 depends only on Task 9
- Tasks 11-13 are sequential finalization steps

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Object URL memory leak | Thorough cleanup in useEffect; verify with React DevTools Memory tab |
| Missing thumbnail Blob | Fallback to file Blob; show placeholder if both missing |
| Touch device delete button hidden | Use CSS media queries to ensure visibility on touch devices |
| Inconsistent sizing in grid | Use explicit pixel dimensions; test in actual grid layout |
| PDF without pageCount metadata | Handle undefined pageCount gracefully; only show count when available |

---

## Testing Checklist

From Overview Document:

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

## References

- **Overview Document:** `/docs/REQ-051-build-mediathumbnail-component-overview.md`
- **Implementation Plan:** `/docs/prd/item-capture-implementation-plan.md` — Task 5.2
- **Request:** `/docs/gen_requests.md` — REQ-051
- **Pattern Reference:** `src/components/LinkCard.tsx` — Loading states, error handling
- **Utility:** `src/lib/utils.ts` — `cn()` function
- **PDF Utility:** `src/components/ItemCapture/utils/pdfThumbnailGenerator.ts`
