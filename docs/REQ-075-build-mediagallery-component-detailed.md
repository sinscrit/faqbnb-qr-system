# REQ-075: Build MediaGallery Component - Detailed Task Breakdown

**Document Created:** 2026-01-03 10:45:00 PST
**Last Modified:** 2026-01-03 14:30:00 PST
**Implementation Status:** COMPLETE
**Request Reference:** REQ-075 in `/docs/gen_requests.md`
**Overview Document:** `/docs/REQ-075-build-mediagallery-component-overview.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 4 - Item Preview/Detail
**Task ID:** 4.2
**Estimated Effort:** 2 story points

---

## Table of Contents

1. [Summary](#summary)
2. [Prerequisites](#prerequisites)
3. [Authorized Files for Modification](#authorized-files-for-modification)
4. [Task Breakdown](#task-breakdown)
5. [Verification Checklist](#verification-checklist)
6. [Edge Cases Reference](#edge-cases-reference)
7. [Testing Reference](#testing-reference)

---

## Summary

This document provides a granular, step-by-step task breakdown for implementing the `MediaGallery` component. The MediaGallery is a swipeable media carousel for displaying multiple media items (images, videos, PDFs) within the ItemPreviewModal. It provides touch-based swipe navigation, thumbnail strip navigation, full-screen toggle, and media type indicators.

**Parent Component:** ItemPreviewModal (Task 4.1)
**Depends On:** Phase 1 complete (directory structure, types, basic state management)
**Enables:** Tasks 4.3-4.4 (Video Player, Photo/PDF Viewer integration)

---

## Prerequisites

Before starting this task, verify the following are complete:

- [x] Phase 1 is complete (ItemManager directory structure exists)
- [x] Task 4.1 (ItemPreviewModal) is complete or in parallel development
- [x] `src/components/ItemManager/components/ItemPreview/` directory exists
- [x] `src/components/ItemManager/components/ItemPreview/index.ts` barrel export file exists
- [x] MediaItem type is accessible from `src/components/ItemCapture/ItemCapture.types.ts`

**Prerequisites verified and met on 2026-01-03.**

---

## Authorized Files for Modification

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/ItemManager/components/ItemPreview/MediaGallery.tsx` | Main gallery component |

### Files to Modify

| File | Change |
|------|--------|
| `src/components/ItemManager/components/ItemPreview/index.ts` | Add MediaGallery export |
| `src/components/ItemManager/ItemManager.types.ts` | Add `MediaGalleryProps` interface (optional, can be inline) |

### Reference Files (Read-Only)

| File | Pattern to Follow |
|------|-------------------|
| `src/components/ItemCapture/components/shared/MediaThumbnail.tsx` | Object URL management, type badges, loading states |
| `src/components/ItemCapture/components/steps/ReviewStep.tsx` | `urlsRef` pattern for URL cleanup |
| `src/components/ItemCapture/ItemCapture.types.ts` | MediaItem, MediaMetadata interfaces |
| `src/lib/utils.ts` | `cn()` utility for class merging |

---

## Task Breakdown

### Task 1: Create MediaGallery Component Shell and Props Interface

**Story Points:** < 1 (approximately 1-2 hours)
**Dependencies:** None within this document

#### Description

Create the basic MediaGallery component file with the complete props interface, initial component structure, and 'use client' directive. This establishes the component API that will be used throughout the implementation.

#### Implementation Steps

1. **Create the MediaGallery.tsx file:**
   - Path: `src/components/ItemManager/components/ItemPreview/MediaGallery.tsx`
   - Add `'use client'` directive at the top
   - Add file header comment with module description and last modified date

2. **Define the MediaGalleryProps interface:**
   ```typescript
   interface MediaGalleryProps {
     /** Array of media items to display */
     mediaItems: MediaItem[];
     /** Currently active media index (controlled) */
     activeIndex?: number;
     /** Callback when active index changes */
     onActiveIndexChange?: (index: number) => void;
     /** Callback when media item is clicked/tapped (for detail view) */
     onMediaClick?: (item: MediaItem, index: number) => void;
     /** Whether to enable full-screen toggle */
     enableFullScreen?: boolean;
     /** Whether gallery is in full-screen mode (controlled) */
     isFullScreen?: boolean;
     /** Callback when full-screen state changes */
     onFullScreenChange?: (isFullScreen: boolean) => void;
     /** Whether to show thumbnail strip */
     showThumbnails?: boolean;
     /** Initial index to display (uncontrolled mode) */
     initialIndex?: number;
     /** Optional CSS class for customization */
     className?: string;
     /** Debug mode for development */
     debug?: boolean;
   }
   ```

3. **Create basic component structure:**
   - Implement controlled/uncontrolled pattern for activeIndex
   - Add conditional rendering based on mediaItems length
   - Export the component as both named and default export

4. **Add imports:**
   - Import `MediaItem` type from `../../ItemCapture/ItemCapture.types`
   - Import `cn` from `@/lib/utils`
   - Import necessary React hooks: `useState`, `useEffect`, `useRef`, `useCallback`, `useMemo`

#### Verification Steps

- [ ] File compiles without TypeScript errors
- [ ] Component renders without crashing when imported
- [ ] Props interface matches specification from overview document
- [ ] Both controlled and uncontrolled modes can be initialized
- [ ] Empty state renders when mediaItems is empty array

#### Code Skeleton

```typescript
'use client';

/**
 * MediaGallery Component
 *
 * Swipeable media carousel for displaying multiple media items with
 * touch gestures, thumbnail navigation, and full-screen support.
 *
 * @module ItemManager/components/ItemPreview/MediaGallery
 * @lastModified 2026-01-03
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { MediaItem } from '@/components/ItemCapture/ItemCapture.types';

// Props interface here...

export function MediaGallery({
  mediaItems,
  activeIndex: controlledIndex,
  onActiveIndexChange,
  onMediaClick,
  enableFullScreen = true,
  isFullScreen: controlledFullScreen,
  onFullScreenChange,
  showThumbnails = true,
  initialIndex = 0,
  className,
  debug = false,
}: MediaGalleryProps) {
  // Controlled/uncontrolled state management
  const isControlled = controlledIndex !== undefined;
  const [uncontrolledIndex, setUncontrolledIndex] = useState(initialIndex);
  const activeIndex = isControlled ? controlledIndex : uncontrolledIndex;

  // TODO: Implement remaining logic

  // Empty state
  if (mediaItems.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-64 bg-gray-100 rounded-lg', className)}>
        <p className="text-gray-500">No media to display</p>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* Main carousel area placeholder */}
      <div className="bg-gray-900 min-h-[300px] md:min-h-[400px] flex items-center justify-center">
        <p className="text-white">Media {activeIndex + 1} of {mediaItems.length}</p>
      </div>
    </div>
  );
}

export default MediaGallery;
```

---

### Task 2: Implement Object URL Management and Media Display

**Story Points:** < 1 (approximately 2-3 hours)
**Dependencies:** Task 1 complete

#### Description

Implement the object URL management pattern for displaying media blobs, following the established `urlsRef` pattern from ReviewStep. Create the main carousel display area that shows one media item at a time with proper aspect ratio and loading states.

#### Implementation Steps

1. **Implement urlsRef pattern for cleanup:**
   ```typescript
   const urlsRef = useRef<string[]>([]);

   const createTrackedUrl = useCallback((blob: Blob): string => {
     const url = URL.createObjectURL(blob);
     urlsRef.current.push(url);
     return url;
   }, []);

   useEffect(() => {
     return () => {
       urlsRef.current.forEach(url => URL.revokeObjectURL(url));
     };
   }, []);
   ```

2. **Create memoized URL map for current media items:**
   ```typescript
   const mediaUrls = useMemo(() => {
     // Clear old URLs first
     urlsRef.current.forEach(url => URL.revokeObjectURL(url));
     urlsRef.current = [];

     return mediaItems.reduce((acc, item) => {
       const blob = item.thumbnail || item.file;
       if (blob) {
         acc[item.id] = createTrackedUrl(blob);
       }
       return acc;
     }, {} as Record<string, string>);
   }, [mediaItems, createTrackedUrl]);
   ```

3. **Build main carousel display area:**
   - Container with `bg-gray-900` background
   - Min heights: `min-h-[300px]` mobile, `min-h-[400px] md:min-h-[400px]` desktop
   - Max height: `max-h-[60vh]`
   - Use `object-contain` for media to preserve aspect ratio

4. **Implement image display for current item:**
   - Show image element when type is 'image'
   - Handle loading state with skeleton
   - Handle error state with fallback icon
   - Apply correct object-fit styling

5. **Add video preview display:**
   - Show video thumbnail when type is 'video'
   - Overlay play icon (purple badge)
   - Center the play icon on the thumbnail

6. **Add PDF preview display:**
   - Show PDF thumbnail or first page
   - Overlay document icon with page count badge (amber styling)

#### Verification Steps

- [ ] Media items display without memory leaks (check DevTools for blob URLs)
- [ ] Object URLs are properly cleaned up on unmount
- [ ] Object URLs are cleaned up when mediaItems array changes
- [ ] Images display centered with correct aspect ratio
- [ ] Video thumbnails show play icon overlay
- [ ] PDF thumbnails show document icon with page count
- [ ] Loading state displays while image is loading
- [ ] Error state displays when image fails to load

---

### Task 3: Implement Carousel Navigation (Arrow Buttons + Keyboard)

**Story Points:** < 1 (approximately 2-3 hours)
**Dependencies:** Task 2 complete

#### Description

Add navigation controls for the carousel including left/right arrow buttons (desktop) and keyboard navigation (Arrow Left/Right keys). Implement the navigation logic that respects controlled/uncontrolled mode.

#### Implementation Steps

1. **Create navigation handler functions:**
   ```typescript
   const goToIndex = useCallback((index: number) => {
     const clampedIndex = Math.max(0, Math.min(index, mediaItems.length - 1));
     if (!isControlled) {
       setUncontrolledIndex(clampedIndex);
     }
     onActiveIndexChange?.(clampedIndex);
   }, [isControlled, mediaItems.length, onActiveIndexChange]);

   const goToNext = useCallback(() => {
     if (activeIndex < mediaItems.length - 1) {
       goToIndex(activeIndex + 1);
     }
   }, [activeIndex, mediaItems.length, goToIndex]);

   const goToPrev = useCallback(() => {
     if (activeIndex > 0) {
       goToIndex(activeIndex - 1);
     }
   }, [activeIndex, goToIndex]);
   ```

2. **Add keyboard event listener:**
   - Listen for Arrow Left/Right keys
   - Only process when component has focus or is in full-screen
   - Prevent default to avoid page scrolling
   ```typescript
   useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
       if (e.key === 'ArrowLeft') {
         e.preventDefault();
         goToPrev();
       } else if (e.key === 'ArrowRight') {
         e.preventDefault();
         goToNext();
       }
     };

     window.addEventListener('keydown', handleKeyDown);
     return () => window.removeEventListener('keydown', handleKeyDown);
   }, [goToPrev, goToNext]);
   ```

3. **Build arrow button components:**
   - Size: 48x48px circular buttons
   - Style: `bg-white/80 hover:bg-white shadow-lg`
   - Icons: `ChevronLeft`, `ChevronRight` from Lucide
   - Position: Absolute, vertically centered, at carousel edges
   - Hide when at first/last item respectively
   - Add responsive visibility: visible on `md:` breakpoint only

4. **Implement arrow button JSX:**
   ```typescript
   {/* Left Arrow - hidden on mobile and at first item */}
   {activeIndex > 0 && (
     <button
       onClick={goToPrev}
       className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10
                  w-12 h-12 items-center justify-center rounded-full
                  bg-white/80 hover:bg-white shadow-lg transition-colors"
       aria-label="Previous media"
     >
       <ChevronLeft className="w-6 h-6" />
     </button>
   )}

   {/* Right Arrow - hidden on mobile and at last item */}
   {activeIndex < mediaItems.length - 1 && (
     <button
       onClick={goToNext}
       className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10
                  w-12 h-12 items-center justify-center rounded-full
                  bg-white/80 hover:bg-white shadow-lg transition-colors"
       aria-label="Next media"
     >
       <ChevronRight className="w-6 h-6" />
     </button>
   )}
   ```

5. **Add aria-labels and focus management:**
   - Add descriptive aria-labels to buttons
   - Ensure buttons are focusable
   - Add focus-visible ring styling

#### Verification Steps

- [ ] Left arrow appears when not at first item
- [ ] Right arrow appears when not at last item
- [ ] Clicking arrows navigates correctly
- [ ] Arrow Left/Right keyboard keys work
- [ ] Navigation respects controlled mode (calls onActiveIndexChange)
- [ ] Navigation works in uncontrolled mode (updates internal state)
- [ ] Arrows hidden on mobile (below md breakpoint)
- [ ] Focus ring visible when tabbing to buttons

---

### Task 4: Implement Touch Swipe Navigation

**Story Points:** < 1 (approximately 2-3 hours)
**Dependencies:** Task 3 complete

#### Description

Add touch-based swipe gesture support for mobile navigation. Use native touch events with velocity-based detection and threshold distance for preventing accidental swipes.

#### Implementation Steps

1. **Add touch state management:**
   ```typescript
   const [touchStart, setTouchStart] = useState<number | null>(null);
   const [touchEnd, setTouchEnd] = useState<number | null>(null);
   const [isSwiping, setIsSwiping] = useState(false);
   const minSwipeDistance = 50; // pixels
   ```

2. **Implement touch event handlers:**
   ```typescript
   const onTouchStart = useCallback((e: React.TouchEvent) => {
     setTouchEnd(null);
     setTouchStart(e.targetTouches[0].clientX);
     setIsSwiping(false);
   }, []);

   const onTouchMove = useCallback((e: React.TouchEvent) => {
     setTouchEnd(e.targetTouches[0].clientX);
     if (touchStart !== null) {
       const distance = Math.abs(touchStart - e.targetTouches[0].clientX);
       if (distance > 10) {
         setIsSwiping(true);
       }
     }
   }, [touchStart]);

   const onTouchEnd = useCallback(() => {
     if (!touchStart || !touchEnd) return;

     const distance = touchStart - touchEnd;
     const isLeftSwipe = distance > minSwipeDistance;
     const isRightSwipe = distance < -minSwipeDistance;

     if (isLeftSwipe && activeIndex < mediaItems.length - 1) {
       goToNext();
     } else if (isRightSwipe && activeIndex > 0) {
       goToPrev();
     }

     setTouchStart(null);
     setTouchEnd(null);
     setIsSwiping(false);
   }, [touchStart, touchEnd, activeIndex, mediaItems.length, goToNext, goToPrev]);
   ```

3. **Add touch handlers to carousel container:**
   ```typescript
   <div
     className="relative overflow-hidden"
     onTouchStart={onTouchStart}
     onTouchMove={onTouchMove}
     onTouchEnd={onTouchEnd}
   >
     {/* Carousel content */}
   </div>
   ```

4. **Add visual feedback during swipe:**
   - Optional: Show slight opacity change during active swipe
   - Prevent click events when swipe is detected (use isSwiping state)

5. **Add edge indicators for mobile:**
   - Small dot indicators at bottom center showing position
   - Current position highlighted
   ```typescript
   {/* Mobile swipe indicators */}
   <div className="flex md:hidden justify-center gap-1.5 mt-3">
     {mediaItems.map((_, idx) => (
       <div
         key={idx}
         className={cn(
           'w-2 h-2 rounded-full transition-colors',
           idx === activeIndex ? 'bg-blue-500' : 'bg-gray-300'
         )}
       />
     ))}
   </div>
   ```

#### Verification Steps

- [ ] Swipe left navigates to next item
- [ ] Swipe right navigates to previous item
- [ ] Short touches (< 50px) don't trigger navigation
- [ ] Swipe at first item (right swipe) has no effect
- [ ] Swipe at last item (left swipe) has no effect
- [ ] Swipe works on iOS Safari
- [ ] Swipe works on Chrome Android
- [ ] Position indicators update correctly
- [ ] Click events still work when not swiping

---

### Task 5: Implement Carousel Animation

**Story Points:** < 1 (approximately 1-2 hours)
**Dependencies:** Task 4 complete

#### Description

Add smooth CSS-based transitions for the carousel slides. Implement a sliding animation when navigating between items using CSS transforms.

#### Implementation Steps

1. **Create carousel track structure:**
   ```typescript
   // Calculate transform based on active index
   const carouselStyle = useMemo(() => ({
     transform: `translateX(-${activeIndex * 100}%)`,
     transition: 'transform 300ms ease-out',
   }), [activeIndex]);
   ```

2. **Restructure carousel to use sliding panels:**
   ```typescript
   <div className="relative overflow-hidden">
     <div
       className="flex will-change-transform"
       style={carouselStyle}
     >
       {mediaItems.map((item, idx) => (
         <div
           key={item.id}
           className="w-full flex-shrink-0 flex items-center justify-center"
         >
           {/* Media display for this item */}
           {renderMediaItem(item, idx)}
         </div>
       ))}
     </div>
   </div>
   ```

3. **Extract renderMediaItem helper:**
   - Create internal function to render individual media items
   - Handle image, video, and PDF types
   - Include loading and error states

4. **Add performance optimizations:**
   - `will-change: transform` for GPU acceleration
   - Only render visible items + adjacent for lazy loading consideration

5. **Handle animation during swipe (optional enhancement):**
   - Track swipe offset for real-time feedback
   - Snap back if swipe doesn't cross threshold

#### Verification Steps

- [ ] Transitions are smooth (300ms)
- [ ] No visual jank during animation
- [ ] Animation works on both desktop and mobile
- [ ] GPU acceleration is applied (check DevTools Layers panel)
- [ ] All media items are accessible via navigation

---

### Task 6: Build Thumbnail Strip Component

**Story Points:** < 1 (approximately 2-3 hours)
**Dependencies:** Task 5 complete

#### Description

Create the horizontal thumbnail strip below the main carousel. Implement scrollable container, active item highlighting, click-to-navigate, and auto-scroll to keep active thumbnail visible.

#### Implementation Steps

1. **Create GalleryThumbnail internal sub-component:**
   ```typescript
   interface GalleryThumbnailProps {
     item: MediaItem;
     isActive: boolean;
     onClick: () => void;
     thumbnailUrl: string | undefined;
   }

   function GalleryThumbnail({ item, isActive, onClick, thumbnailUrl }: GalleryThumbnailProps) {
     const [imageError, setImageError] = useState(false);

     return (
       <button
         onClick={onClick}
         className={cn(
           'relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden',
           'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
           'transition-all duration-200',
           isActive && 'ring-2 ring-blue-500'
         )}
         aria-label={`View ${item.type} ${item.metadata.originalFilename || ''}`}
         aria-current={isActive ? 'true' : undefined}
       >
         {/* Thumbnail content */}
       </button>
     );
   }
   ```

2. **Implement thumbnail display based on type:**
   - Image/Video: Display thumbnail image
   - Video: Add small play icon overlay
   - PDF: Display document icon with mini page count

3. **Build thumbnail strip container:**
   ```typescript
   const thumbnailStripRef = useRef<HTMLDivElement>(null);

   {showThumbnails && mediaItems.length > 1 && (
     <div
       ref={thumbnailStripRef}
       className="flex gap-2 overflow-x-auto py-2 px-1 scrollbar-hide"
       style={{ scrollBehavior: 'smooth' }}
       role="tablist"
       aria-label="Media thumbnails"
     >
       {mediaItems.map((item, idx) => (
         <GalleryThumbnail
           key={item.id}
           item={item}
           isActive={idx === activeIndex}
           onClick={() => goToIndex(idx)}
           thumbnailUrl={mediaUrls[item.id]}
         />
       ))}
     </div>
   )}
   ```

4. **Implement auto-scroll to active thumbnail:**
   ```typescript
   useEffect(() => {
     const strip = thumbnailStripRef.current;
     if (!strip || !showThumbnails) return;

     const activeThumbnail = strip.children[activeIndex] as HTMLElement;
     if (activeThumbnail) {
       activeThumbnail.scrollIntoView({
         behavior: 'smooth',
         block: 'nearest',
         inline: 'center',
       });
     }
   }, [activeIndex, showThumbnails]);
   ```

5. **Add hidden scrollbar styling:**
   ```typescript
   // Add to Tailwind config or use inline styles
   // .scrollbar-hide::-webkit-scrollbar { display: none; }
   // .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
   ```

6. **Hide thumbnail strip for single item:**
   - Only render when `mediaItems.length > 1`

#### Verification Steps

- [ ] Thumbnails display for all media items
- [ ] Active thumbnail has visible ring highlight
- [ ] Clicking thumbnail navigates to that item
- [ ] Thumbnail strip scrolls horizontally
- [ ] Active thumbnail scrolls into view automatically
- [ ] Scrollbar is hidden
- [ ] Video thumbnails show play icon
- [ ] PDF thumbnails show document icon
- [ ] Single item hides thumbnail strip
- [ ] Thumbnail touch targets are at least 48x48px

---

### Task 7: Implement Full-Screen Mode

**Story Points:** < 1 (approximately 2-3 hours)
**Dependencies:** Task 6 complete

#### Description

Add full-screen toggle functionality with overlay, expanded media view, and multiple exit methods (button, Escape key, overlay click). Implement focus management for accessibility.

#### Implementation Steps

1. **Add full-screen state management:**
   ```typescript
   const isFullScreenControlled = controlledFullScreen !== undefined;
   const [uncontrolledFullScreen, setUncontrolledFullScreen] = useState(false);
   const isFullScreen = isFullScreenControlled ? controlledFullScreen : uncontrolledFullScreen;
   const previousFocusRef = useRef<HTMLElement | null>(null);
   ```

2. **Create toggle handlers:**
   ```typescript
   const enterFullScreen = useCallback(() => {
     previousFocusRef.current = document.activeElement as HTMLElement;
     if (!isFullScreenControlled) {
       setUncontrolledFullScreen(true);
     }
     onFullScreenChange?.(true);
   }, [isFullScreenControlled, onFullScreenChange]);

   const exitFullScreen = useCallback(() => {
     if (!isFullScreenControlled) {
       setUncontrolledFullScreen(false);
     }
     onFullScreenChange?.(false);
     // Return focus
     setTimeout(() => {
       previousFocusRef.current?.focus();
     }, 0);
   }, [isFullScreenControlled, onFullScreenChange]);
   ```

3. **Add Escape key handler:**
   ```typescript
   useEffect(() => {
     if (!isFullScreen) return;

     const handleEscape = (e: KeyboardEvent) => {
       if (e.key === 'Escape') {
         e.preventDefault();
         exitFullScreen();
       }
     };

     window.addEventListener('keydown', handleEscape);
     return () => window.removeEventListener('keydown', handleEscape);
   }, [isFullScreen, exitFullScreen]);
   ```

4. **Add full-screen toggle button to main view:**
   ```typescript
   {enableFullScreen && (
     <button
       onClick={enterFullScreen}
       className="absolute top-4 right-4 z-10 p-2 rounded-full
                  bg-black/50 hover:bg-black/70 text-white
                  transition-colors focus:outline-none focus-visible:ring-2"
       aria-label="Enter full screen"
     >
       <Maximize2 className="w-5 h-5" />
     </button>
   )}
   ```

5. **Build full-screen overlay component:**
   ```typescript
   {isFullScreen && (
     <div
       className="fixed inset-0 z-50 bg-black flex flex-col"
       role="dialog"
       aria-modal="true"
       aria-label="Media gallery full screen"
     >
       {/* Close button */}
       <button
         onClick={exitFullScreen}
         className="absolute top-4 right-4 z-10 p-2 rounded-full
                    bg-white/10 hover:bg-white/20 text-white
                    transition-colors focus:outline-none focus-visible:ring-2"
         aria-label="Exit full screen"
       >
         <X className="w-6 h-6" />
       </button>

       {/* Full-screen carousel */}
       <div className="flex-1 flex items-center justify-center p-4">
         {/* Media display - max dimensions */}
         <div className="max-w-full max-h-full">
           {renderMediaItem(mediaItems[activeIndex], activeIndex, true)}
         </div>
       </div>

       {/* Navigation arrows in full-screen */}
       {/* ... larger touch targets for full-screen */}

       {/* Thumbnail strip in full-screen */}
       {showThumbnails && (
         <div className="flex-shrink-0 pb-4">
           {/* Same thumbnail strip */}
         </div>
       )}
     </div>
   )}
   ```

6. **Implement overlay click to exit:**
   - Click on dark background (not media) should exit
   - Use event.target === event.currentTarget pattern

7. **Add focus trap in full-screen mode:**
   - Focus first interactive element on enter
   - Trap focus within the full-screen overlay

#### Verification Steps

- [ ] Full-screen button appears (when enableFullScreen is true)
- [ ] Clicking full-screen button opens overlay
- [ ] Close button (X) exits full-screen
- [ ] Escape key exits full-screen
- [ ] Click on dark overlay (not media) exits full-screen
- [ ] Click on media does NOT exit full-screen
- [ ] Navigation works in full-screen mode
- [ ] Focus returns to trigger button on exit
- [ ] Full-screen overlay has proper z-index
- [ ] Media fills available space with correct aspect ratio

---

### Task 8: Add Media Type Indicators and Badges

**Story Points:** < 1 (approximately 1-2 hours)
**Dependencies:** Task 7 complete

#### Description

Add visual type indicators for different media types following the established color scheme from the codebase. Ensure badges are visible on both thumbnails and the main carousel view.

#### Implementation Steps

1. **Define media type configurations:**
   ```typescript
   const MEDIA_TYPE_CONFIG = {
     video: {
       icon: Play,
       bgColor: 'bg-purple-100',
       textColor: 'text-purple-700',
       label: 'Video',
     },
     image: {
       icon: ImageIcon,
       bgColor: 'bg-green-100',
       textColor: 'text-green-700',
       label: 'Photo',
     },
     pdf: {
       icon: FileText,
       bgColor: 'bg-amber-100',
       textColor: 'text-amber-700',
       label: 'PDF',
     },
   } as const;
   ```

2. **Create MediaTypeBadge internal component:**
   ```typescript
   function MediaTypeBadge({ type, showLabel = false }: { type: 'video' | 'image' | 'pdf'; showLabel?: boolean }) {
     const config = MEDIA_TYPE_CONFIG[type];
     const Icon = config.icon;

     return (
       <div className={cn(
         'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
         config.bgColor,
         config.textColor
       )}>
         <Icon className="w-3 h-3" />
         {showLabel && <span>{config.label}</span>}
       </div>
     );
   }
   ```

3. **Add badge to main carousel view:**
   - Position: Absolute, top-left corner
   - Include media position (e.g., "1 of 5")
   ```typescript
   <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
     <MediaTypeBadge type={mediaItems[activeIndex].type} showLabel />
     <span className="text-sm text-white bg-black/50 px-2 py-1 rounded">
       {activeIndex + 1} / {mediaItems.length}
     </span>
   </div>
   ```

4. **Add video play overlay on main view:**
   - Large centered play button for videos
   - Semi-transparent background
   - Only show when not in playback (integrate with Task 4.3 later)

5. **Add PDF page count badge:**
   ```typescript
   {item.type === 'pdf' && item.metadata.pageCount !== undefined && (
     <div className="absolute bottom-2 right-2 bg-amber-100 text-amber-700
                     text-xs px-2 py-0.5 rounded">
       {item.metadata.pageCount} {item.metadata.pageCount === 1 ? 'page' : 'pages'}
     </div>
   )}
   ```

6. **Add duration badge for videos:**
   ```typescript
   {item.type === 'video' && item.metadata.duration !== undefined && (
     <div className="absolute bottom-2 right-2 bg-black/60 text-white
                     text-xs px-2 py-0.5 rounded">
       {formatDuration(item.metadata.duration)}
     </div>
   )}
   ```

7. **Create formatDuration helper:**
   ```typescript
   function formatDuration(seconds: number): string {
     const mins = Math.floor(seconds / 60);
     const secs = Math.floor(seconds % 60);
     return `${mins}:${secs.toString().padStart(2, '0')}`;
   }
   ```

#### Verification Steps

- [ ] Video items show purple badge with play icon
- [ ] Image items show green badge (optional, can skip for default)
- [ ] PDF items show amber badge with document icon
- [ ] Page count displays for PDFs
- [ ] Duration displays for videos
- [ ] Badges are readable (sufficient contrast)
- [ ] Position counter (1/5) displays correctly
- [ ] Badges visible in both normal and full-screen modes

---

### Task 9: Implement Accessibility Features

**Story Points:** < 1 (approximately 2 hours)
**Dependencies:** Task 8 complete

#### Description

Add comprehensive accessibility support including ARIA labels, live region announcements, keyboard navigation, and proper focus management.

#### Implementation Steps

1. **Add live region for position announcements:**
   ```typescript
   const [announcement, setAnnouncement] = useState('');

   useEffect(() => {
     const item = mediaItems[activeIndex];
     const typeLabel = MEDIA_TYPE_CONFIG[item.type].label;
     setAnnouncement(`${typeLabel} ${activeIndex + 1} of ${mediaItems.length}`);
   }, [activeIndex, mediaItems]);

   // In render:
   <div
     className="sr-only"
     role="status"
     aria-live="polite"
     aria-atomic="true"
   >
     {announcement}
   </div>
   ```

2. **Add ARIA labels to all interactive elements:**
   - Navigation arrows: "Previous media", "Next media"
   - Full-screen button: "Enter full screen", "Exit full screen"
   - Thumbnails: "View {type} {filename}"
   - Close button: "Close full screen"

3. **Add role and aria attributes to carousel:**
   ```typescript
   <div
     role="region"
     aria-roledescription="carousel"
     aria-label={`Media gallery, ${mediaItems.length} items`}
   >
   ```

4. **Add tablist/tab roles to thumbnail strip:**
   ```typescript
   <div
     role="tablist"
     aria-label="Media thumbnails"
   >
     {mediaItems.map((item, idx) => (
       <button
         role="tab"
         aria-selected={idx === activeIndex}
         tabIndex={idx === activeIndex ? 0 : -1}
         // ...
       >
   ```

5. **Implement roving tabindex for thumbnails:**
   - Only active thumbnail in tab order
   - Arrow keys to move between thumbnails when focused

6. **Add visible focus indicators:**
   - Use `focus-visible:ring-2 focus-visible:ring-blue-500`
   - Ensure all interactive elements have visible focus states

7. **Test with keyboard-only navigation:**
   - Tab to gallery
   - Arrow keys to navigate slides
   - Tab to thumbnails
   - Enter/Space to select thumbnail
   - Tab to full-screen button
   - Escape to close full-screen

#### Verification Steps

- [ ] Screen reader announces current position when navigating
- [ ] All buttons have descriptive aria-labels
- [ ] Carousel has proper role="region" and aria-roledescription
- [ ] Thumbnail strip uses tablist/tab pattern
- [ ] Roving tabindex works on thumbnails
- [ ] All interactive elements have visible focus indicators
- [ ] Full navigation possible with keyboard only
- [ ] Escape key closes full-screen mode
- [ ] Focus trapped in full-screen mode
- [ ] Focus returns to trigger on full-screen exit

---

### Task 10: Handle Edge Cases and Error States

**Story Points:** < 1 (approximately 1-2 hours)
**Dependencies:** Task 9 complete

#### Description

Implement proper handling for all edge cases identified in the overview document, including empty arrays, single items, failed thumbnails, and mixed media types.

#### Implementation Steps

1. **Handle single media item:**
   ```typescript
   const isSingleItem = mediaItems.length === 1;

   // Hide navigation arrows
   // Hide thumbnail strip
   // Hide position counter
   // Still allow full-screen
   ```

2. **Handle empty media array:**
   ```typescript
   if (mediaItems.length === 0) {
     return (
       <div className={cn(
         'flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg gap-2',
         className
       )}>
         <ImageIcon className="w-12 h-12 text-gray-300" />
         <p className="text-gray-500 text-sm">No media to display</p>
       </div>
     );
   }
   ```

3. **Handle failed thumbnail loads:**
   - Track error state per item
   - Show fallback icon based on media type
   - Display error styling (gray background)
   ```typescript
   const [loadErrors, setLoadErrors] = useState<Record<string, boolean>>({});

   const handleImageError = useCallback((itemId: string) => {
     setLoadErrors(prev => ({ ...prev, [itemId]: true }));
   }, []);
   ```

4. **Handle video without thumbnail:**
   - Check if thumbnail exists
   - If no thumbnail, show video icon with label
   ```typescript
   {item.type === 'video' && !item.thumbnail && (
     <div className="flex flex-col items-center justify-center h-full bg-gray-800">
       <Video className="w-16 h-16 text-gray-400" />
       <span className="text-gray-400 text-sm mt-2">Video</span>
     </div>
   )}
   ```

5. **Handle activeIndex out of bounds:**
   ```typescript
   // Clamp activeIndex to valid range
   const safeActiveIndex = Math.max(0, Math.min(activeIndex, mediaItems.length - 1));

   // If external control passes invalid index, reset
   useEffect(() => {
     if (activeIndex !== safeActiveIndex) {
       onActiveIndexChange?.(safeActiveIndex);
     }
   }, [activeIndex, safeActiveIndex, onActiveIndexChange]);
   ```

6. **Handle dynamic mediaItems changes:**
   ```typescript
   // Reset index if current item is removed
   useEffect(() => {
     if (activeIndex >= mediaItems.length && mediaItems.length > 0) {
       goToIndex(mediaItems.length - 1);
     }
   }, [mediaItems.length, activeIndex, goToIndex]);
   ```

7. **Add debug logging:**
   ```typescript
   useEffect(() => {
     if (debug) {
       console.log('[MediaGallery]', {
         itemCount: mediaItems.length,
         activeIndex,
         isFullScreen,
       });
     }
   }, [debug, mediaItems.length, activeIndex, isFullScreen]);
   ```

#### Verification Steps

- [ ] Empty array shows placeholder message
- [ ] Single item hides all navigation controls
- [ ] Single item still allows full-screen
- [ ] Failed image shows fallback icon
- [ ] Video without thumbnail shows video icon
- [ ] Out-of-bounds index is clamped
- [ ] Removing items adjusts activeIndex correctly
- [ ] Debug mode logs state changes
- [ ] No console errors for any edge case

---

### Task 11: Add Export and Update Barrel File

**Story Points:** < 1 (approximately 30 minutes)
**Dependencies:** Task 10 complete

#### Description

Export the MediaGallery component from the ItemPreview barrel file and ensure all types are properly exported for consumers.

#### Implementation Steps

1. **Update ItemPreview barrel file:**
   - Path: `src/components/ItemManager/components/ItemPreview/index.ts`
   ```typescript
   // Add to existing exports
   export { MediaGallery } from './MediaGallery';
   export type { MediaGalleryProps } from './MediaGallery';
   ```

2. **Ensure MediaGalleryProps is exported from component:**
   ```typescript
   // In MediaGallery.tsx
   export interface MediaGalleryProps {
     // ...
   }

   export function MediaGallery(props: MediaGalleryProps) {
     // ...
   }

   export default MediaGallery;
   ```

3. **Verify import paths work:**
   - Test import from `@/components/ItemManager/components/ItemPreview`
   - Test import from full path

#### Verification Steps

- [ ] MediaGallery exports from barrel file
- [ ] MediaGalleryProps type exports correctly
- [ ] Import works in test files
- [ ] No circular dependency warnings

---

### Task 12: Create Test Harness Integration

**Story Points:** < 1 (approximately 1-2 hours)
**Dependencies:** Task 11 complete

#### Description

Add MediaGallery testing section to the existing test harness page with mock data covering all media types and edge cases.

#### Implementation Steps

1. **Add MediaGallery section to test harness:**
   - Path: `src/app/test/item-manager/page.tsx`

2. **Create mock MediaItem data:**
   ```typescript
   const createMockMediaItems = (): MediaItem[] => {
     // Create mock blobs for testing
     const imageBlob = new Blob(['image'], { type: 'image/jpeg' });
     const videoBlob = new Blob(['video'], { type: 'video/mp4' });
     const pdfBlob = new Blob(['pdf'], { type: 'application/pdf' });

     return [
       {
         id: 'img-1',
         type: 'image',
         file: imageBlob,
         thumbnail: imageBlob,
         order: 0,
         metadata: {
           mimeType: 'image/jpeg',
           fileSize: 1024,
           source: 'capture',
           originalFilename: 'photo-1.jpg',
         },
       },
       {
         id: 'vid-1',
         type: 'video',
         file: videoBlob,
         thumbnail: imageBlob, // Use image as thumbnail
         order: 1,
         metadata: {
           mimeType: 'video/mp4',
           fileSize: 5120,
           source: 'upload',
           duration: 125, // 2:05
           originalFilename: 'demo-video.mp4',
         },
       },
       {
         id: 'pdf-1',
         type: 'pdf',
         file: pdfBlob,
         thumbnail: imageBlob,
         order: 2,
         metadata: {
           mimeType: 'application/pdf',
           fileSize: 2048,
           source: 'upload',
           pageCount: 5,
           originalFilename: 'manual.pdf',
         },
       },
     ];
   };
   ```

3. **Add multiple test scenarios:**
   ```typescript
   // In test page
   <section className="mb-8">
     <h2 className="text-xl font-bold mb-4">MediaGallery Component</h2>

     <div className="space-y-8">
       {/* Multiple items */}
       <div>
         <h3 className="font-medium mb-2">Multiple Media Items</h3>
         <MediaGallery
           mediaItems={mockMediaItems}
           enableFullScreen={true}
           showThumbnails={true}
           onActiveIndexChange={(idx) => console.log('Index changed:', idx)}
           onMediaClick={(item, idx) => console.log('Media clicked:', item.id, idx)}
           debug
         />
       </div>

       {/* Single item */}
       <div>
         <h3 className="font-medium mb-2">Single Media Item</h3>
         <MediaGallery
           mediaItems={[mockMediaItems[0]]}
           enableFullScreen={true}
         />
       </div>

       {/* Empty state */}
       <div>
         <h3 className="font-medium mb-2">Empty State</h3>
         <MediaGallery mediaItems={[]} />
       </div>

       {/* Controlled mode */}
       <div>
         <h3 className="font-medium mb-2">Controlled Mode</h3>
         {/* State-controlled example */}
       </div>
     </div>
   </section>
   ```

4. **Add callback logging:**
   - Log all callback invocations to console
   - Display callback history in UI (optional)

5. **Test on mobile viewport:**
   - Use browser dev tools to test responsive behavior
   - Test touch events in mobile simulator

#### Verification Steps

- [ ] Test harness page renders without errors
- [ ] All MediaGallery instances display correctly
- [ ] Multiple items shows full functionality
- [ ] Single item hides navigation
- [ ] Empty state shows placeholder
- [ ] Callbacks log to console correctly
- [ ] Full-screen mode works from test harness
- [ ] Mobile viewport shows correct responsive behavior

---

## Verification Checklist

### Functional Requirements

- [ ] Carousel displays one media item at a time
- [ ] Swipe gestures work on touch devices
- [ ] Arrow key navigation works on desktop
- [ ] Arrow button navigation works on desktop (hidden on mobile)
- [ ] Thumbnail strip shows all items with active highlighted
- [ ] Clicking thumbnail navigates to that item
- [ ] Full-screen toggle works (button, Escape, overlay click)
- [ ] Video thumbnails show play icon overlay
- [ ] PDF thumbnails show document icon with page count
- [ ] Navigation handles edge cases (first/last item)
- [ ] Empty state displays correctly
- [ ] Single item hides navigation controls

### Technical Requirements

- [ ] Component uses `'use client'` directive
- [ ] TypeScript types are correct with no errors
- [ ] Tailwind CSS with `cn()` utility used
- [ ] Object URLs properly managed and cleaned up
- [ ] No memory leaks (verify in DevTools)
- [ ] Smooth 300ms CSS transitions
- [ ] GPU-accelerated animations (`will-change: transform`)

### Accessibility Requirements

- [ ] All buttons have aria-labels
- [ ] Live region announces current position
- [ ] Keyboard navigation complete (Tab, Arrow, Escape)
- [ ] Focus trap in full-screen mode
- [ ] Focus returns on full-screen exit
- [ ] Visible focus indicators on all interactive elements
- [ ] Roving tabindex on thumbnail strip

### Browser Compatibility

- [ ] iOS Safari (swipe, full-screen)
- [ ] Chrome Android (swipe, full-screen)
- [ ] Chrome Desktop (keyboard, arrows)
- [ ] Firefox Desktop
- [ ] Edge Desktop

---

## Edge Cases Reference

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Single media item | Hide navigation arrows and thumbnails strip, show single item |
| No media items | Render empty state with placeholder message and icon |
| Mixed media types | Display appropriate type indicators for each item |
| Very long thumbnail strip | Enable horizontal scroll, auto-scroll to active |
| Failed thumbnail load | Show fallback icon based on media type |
| Video without thumbnail | Show video icon placeholder |
| PDF with many pages | Show page count badge |
| Out-of-bounds activeIndex | Clamp to valid range |
| Dynamic mediaItems change | Adjust activeIndex if current item removed |

---

## Testing Reference

### Manual Testing Checklist

- [ ] Swipe navigation on iOS Safari (iPhone)
- [ ] Swipe navigation on Chrome Android
- [ ] Arrow key navigation on desktop browsers
- [ ] Click-to-navigate via thumbnails
- [ ] Full-screen enter via button
- [ ] Full-screen exit via button
- [ ] Full-screen exit via Escape key
- [ ] Full-screen exit via overlay click
- [ ] Single media item (no navigation)
- [ ] Empty media array
- [ ] Mixed media types display
- [ ] Responsive behavior at 768px breakpoint
- [ ] Keyboard-only navigation complete flow
- [ ] Screen reader testing (VoiceOver/NVDA)

### Console Verification

With `debug={true}`, verify these logs appear:
- State changes (activeIndex, isFullScreen)
- Navigation events
- No error logs during normal operation

---

## Implementation Summary

**All 12 tasks completed on 2026-01-03.**

### Files Created
- `src/components/ItemManager/components/ItemPreview/MediaGallery.tsx` - Main gallery component (920 lines)

### Files Modified
- `src/components/ItemManager/components/ItemPreview/index.ts` - Added MediaGallery export
- `src/app/test/item-manager/page.tsx` - Added MediaGallery test section
- `tailwind.config.js` - Added scrollbar-hide utility plugin

### Implementation Notes

1. **Task 1-10 (Core Component):** All functionality implemented in a single comprehensive MediaGallery.tsx file including:
   - Props interface with controlled/uncontrolled modes
   - Object URL management with proper cleanup on unmount
   - Carousel navigation (arrow buttons, keyboard)
   - Touch swipe navigation with 50px threshold
   - CSS transform-based sliding animation (300ms ease-out)
   - Thumbnail strip with auto-scroll to active item
   - Full-screen overlay with multiple exit methods
   - Media type badges (video/image/pdf with color coding)
   - ARIA labels, live region announcements, roving tabindex
   - Edge case handling (empty, single item, out-of-bounds index)

2. **Task 11 (Barrel Export):** MediaGallery and MediaGalleryProps exported from index.ts

3. **Task 12 (Test Harness):** Added comprehensive test section to /test/item-manager including:
   - Multiple items gallery with all controls
   - Single item gallery (navigation hidden)
   - Empty state display
   - Controlled/uncontrolled mode toggle
   - Thumbnail and full-screen toggles

### Build Verification
- `npm run build` completed successfully
- No TypeScript errors
- Component bundle included in /test/item-manager (16.5 kB)

---

## Document History

| Date | Author | Changes |
|------|--------|---------|
| 2026-01-03 | Senior Dev Agent | Initial document creation |
| 2026-01-03 | Claude Code Agent | Implementation complete - all 12 tasks done |
