# REQ-075: Build MediaGallery Component - Technical Overview

**Document Created:** 2026-01-03
**Last Modified:** 2026-01-03
**Request Reference:** REQ-075 in `/docs/gen_requests.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 4 - Item Preview/Detail
**Task ID:** 4.2
**Estimated Effort:** 2 story points

---

## Summary

Build the `MediaGallery` component as a swipeable media carousel for displaying multiple media items (images, videos, PDFs) within the ItemPreviewModal. This component provides intuitive navigation through media items with touch gestures, thumbnail strip navigation, full-screen toggle, and clear media type indicators.

The MediaGallery is a core sub-component of Phase 4 (Item Preview/Detail) that will be composed with video/photo viewers (Tasks 4.3, 4.4) and used within the ItemPreviewModal container (Task 4.1).

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
| Radix UI Dialog | 1.1.14 | Already installed for modal |

### Relevant Existing Patterns

| Pattern | Source File | Notes |
|---------|-------------|-------|
| Media thumbnail display | `src/components/ItemCapture/components/shared/MediaThumbnail.tsx` | Object URL management, type badges, loading states |
| Media type indicators | `src/components/ItemCapture/components/steps/ReviewStep.tsx` | Video/image/PDF type configs with icons and colors |
| URL cleanup pattern | `src/components/ItemCapture/components/steps/ReviewStep.tsx` | `urlsRef` pattern for object URL lifecycle management |
| Modal structure | `src/components/ConfirmationModal.tsx` | Fixed overlay with centered content |
| Utility function | `src/lib/utils.ts` | `cn()` for class merging |
| Type definitions | `src/components/ItemCapture/ItemCapture.types.ts` | MediaItem, MediaMetadata interfaces |

### Target Architecture (from Implementation Plan)

```
src/components/ItemManager/
├── components/
│   ├── ItemPreview/
│   │   ├── ItemPreviewModal.tsx      (Task 4.1 - prerequisite)
│   │   ├── MediaGallery.tsx          <-- THIS TASK
│   │   └── InstructionsViewer.tsx    (Task 4.5)
```

### Key Types to Reuse

```typescript
// From src/components/ItemCapture/ItemCapture.types.ts
export interface MediaItem {
  id: string;
  type: 'video' | 'image' | 'pdf';
  file: File | Blob;
  thumbnail?: Blob;
  order: number;
  metadata: MediaMetadata;
}
```

---

## Dependencies

### Phase Dependencies

- **Requires:** Phase 1 complete (directory structure, types, basic state management)
- **Requires:** Task 4.1 (ItemPreviewModal) complete - provides container context
- **Parallel with:** Phases 2 and 3
- **Enables:** Tasks 4.3-4.4 (Video/Photo/PDF viewer integration)

### Task Dependencies

```
4.1 ItemPreviewModal Component  (prerequisite)
         │
         ▼
4.2 MediaGallery Component  <-- THIS TASK
         │
    ┌────┴────┐
    ▼         ▼
  4.3       4.4
Video     Photo/PDF
Player    Viewer
```

### External Dependencies

No new npm dependencies required. The implementation uses:
- Native HTML5 touch events for swipe gestures
- CSS transforms for smooth carousel transitions
- Existing Lucide icons for navigation and type indicators

---

## Implementation Requirements

### Core Functionality

1. **Carousel Display**
   - Display one media item at a time in the main view area
   - Maintain aspect ratio appropriate for media type
   - Show navigation arrows on desktop (left/right)
   - Support keyboard navigation (Arrow Left/Right)

2. **Swipe Navigation**
   - Touch swipe gestures for mobile (left/right)
   - Smooth CSS transition animations (300ms)
   - Velocity-based swipe detection for natural feel
   - Threshold swipe distance to prevent accidental navigation

3. **Thumbnail Strip**
   - Horizontal scrollable row of media thumbnails
   - Currently active thumbnail visually highlighted
   - Clicking a thumbnail navigates directly to that item
   - Auto-scroll thumbnail strip to keep active item visible
   - Thumbnail size appropriate for touch targets (min 48x48px)

4. **Full-Screen Toggle**
   - Button to expand current media to full viewport
   - Overlay with dark background
   - Exit via button, Escape key, or tap on overlay
   - Maintain navigation controls in full-screen mode

5. **Media Type Indicators**
   - Video: Play icon overlay on thumbnail and main view
   - Image: No special indicator (default)
   - PDF: Document icon with page count badge
   - Color-coded badges consistent with existing patterns

### Props Interface

```typescript
// src/components/ItemManager/components/ItemPreview/MediaGallery.tsx

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

### Responsive Behavior

| Viewport | Behavior |
|----------|----------|
| ≥768px (md+) | Show left/right arrow buttons, horizontal thumbnail strip below, full-screen option |
| <768px | Hide arrow buttons (swipe only), smaller thumbnails, swipe indicators |

### Visual Specifications

**Main Carousel Area**
- Background: `bg-gray-900` (dark background for media contrast)
- Min height: `300px` on mobile, `400px` on desktop
- Max height: `60vh` to leave room for thumbnails
- Media centered with `object-contain` to preserve aspect ratio

**Navigation Arrows (Desktop)**
- Size: 48x48px circular buttons
- Style: `bg-white/80 hover:bg-white` with shadow
- Icons: `ChevronLeft`, `ChevronRight` from Lucide
- Positioned at vertical center, edges of carousel
- Hidden when at first/last item (or loop disabled)

**Thumbnail Strip**
- Height: `80px` container, `64px` thumbnails
- Gap: `8px` between thumbnails
- Active indicator: `ring-2 ring-blue-500`
- Horizontal scroll with hidden scrollbar (CSS)
- Smooth scroll behavior when active changes

**Full-Screen Mode**
- Overlay: `fixed inset-0 bg-black z-50`
- Media: Centered, `max-w-full max-h-full`
- Close button: Top-right, white icon on semi-transparent bg
- Navigation arrows: Same as carousel, larger touch targets

**Media Type Badges**
- Video: `bg-purple-100 text-purple-700` with Play icon
- Image: No badge (default)
- PDF: `bg-amber-100 text-amber-700` with FileText icon

---

## Implementation Approach

### Swipe Gesture Implementation

Use native touch events for cross-browser compatibility:

```typescript
// Touch event tracking
const [touchStart, setTouchStart] = useState<number | null>(null);
const [touchEnd, setTouchEnd] = useState<number | null>(null);

// Minimum swipe distance (px)
const minSwipeDistance = 50;

const onTouchStart = (e: React.TouchEvent) => {
  setTouchEnd(null);
  setTouchStart(e.targetTouches[0].clientX);
};

const onTouchMove = (e: React.TouchEvent) => {
  setTouchEnd(e.targetTouches[0].clientX);
};

const onTouchEnd = () => {
  if (!touchStart || !touchEnd) return;
  const distance = touchStart - touchEnd;
  const isLeftSwipe = distance > minSwipeDistance;
  const isRightSwipe = distance < -minSwipeDistance;
  if (isLeftSwipe) goToNext();
  if (isRightSwipe) goToPrev();
};
```

### Carousel Animation

Use CSS transforms for smooth, performant animations:

```typescript
// Calculate transform based on active index
const carouselStyle = {
  transform: `translateX(-${activeIndex * 100}%)`,
  transition: 'transform 300ms ease-out',
};
```

### Object URL Management

Follow the established `urlsRef` pattern from ReviewStep:

```typescript
const urlsRef = useRef<string[]>([]);

// Create URL and track for cleanup
const createTrackedUrl = (blob: Blob): string => {
  const url = URL.createObjectURL(blob);
  urlsRef.current.push(url);
  return url;
};

// Cleanup on unmount
useEffect(() => {
  return () => {
    urlsRef.current.forEach(url => URL.revokeObjectURL(url));
  };
}, []);
```

### Thumbnail Auto-Scroll

Ensure active thumbnail remains visible in the strip:

```typescript
const thumbnailStripRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const strip = thumbnailStripRef.current;
  const activeThumbnail = strip?.children[activeIndex] as HTMLElement;
  if (strip && activeThumbnail) {
    activeThumbnail.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }
}, [activeIndex]);
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/ItemManager/components/ItemPreview/MediaGallery.tsx` | Main gallery component |

### Files to Modify

| File | Change |
|------|--------|
| `src/components/ItemManager/components/ItemPreview/index.ts` | Add MediaGallery export |
| `src/components/ItemManager/ItemManager.types.ts` | Add `MediaGalleryProps` interface if not inline |

### Functions/Components to Create

| Name | Location | Purpose |
|------|----------|---------|
| `MediaGallery` | `ItemPreview/MediaGallery.tsx` | Main component |
| `GalleryThumbnail` | `ItemPreview/MediaGallery.tsx` | Internal sub-component for thumbnail items |
| `useSwipeGesture` | Consider extracting to hooks if reused | Touch gesture handling logic |

---

## Acceptance Criteria

From REQ-075:

- [ ] Carousel displays one media item at a time and responds to swipe gestures (touch) and arrow clicks (desktop)
- [ ] Thumbnail strip shows all media items with the active item visually highlighted
- [ ] Clicking a thumbnail navigates directly to that media item in the carousel
- [ ] Full-screen toggle button expands the current media to fill the viewport and provides a way to exit full-screen
- [ ] Photos and videos have distinct visual indicators (e.g., play icon overlay on video thumbnails)
- [ ] Navigation controls are accessible and visible on both mobile and desktop viewports
- [ ] Gallery gracefully handles edge cases (single media item, no media, mixed media types)

### Additional Technical Criteria

- [ ] Component uses TypeScript with strict types
- [ ] Component follows `'use client'` directive pattern
- [ ] Styling uses Tailwind CSS with `cn()` utility
- [ ] Object URLs are properly created and cleaned up
- [ ] Keyboard navigation works (Arrow keys, Escape for full-screen exit)
- [ ] Focus management in full-screen mode
- [ ] No console errors or warnings during use
- [ ] Touch gestures work on iOS Safari and Chrome Android
- [ ] CSS transitions are smooth (no jank)

---

## Edge Cases to Handle

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Single media item | Hide navigation arrows and thumbnails strip, show single item |
| No media items | Render empty state with placeholder message |
| Mixed media types | Display appropriate type indicators for each item |
| Very long thumbnail strip | Enable horizontal scroll, auto-scroll to active |
| Failed thumbnail load | Show fallback icon based on media type |
| Video without thumbnail | Generate from video element or show video icon |
| PDF with many pages | Show page count badge, first page as thumbnail |

---

## Testing Approach

### Manual Testing

- [ ] Swipe navigation on iOS Safari (iPhone)
- [ ] Swipe navigation on Chrome Android
- [ ] Arrow key navigation on desktop browsers
- [ ] Click-to-navigate via thumbnails
- [ ] Full-screen enter/exit via button
- [ ] Full-screen exit via Escape key
- [ ] Full-screen exit via overlay click
- [ ] Single media item (no navigation)
- [ ] Empty media array
- [ ] Mixed media types display
- [ ] Responsive behavior at 768px breakpoint

### Test Harness Integration

Add to `/src/app/test/item-manager/page.tsx`:

```tsx
const mockMediaItems: MediaItem[] = [
  { id: '1', type: 'image', order: 0, file: new Blob(), metadata: {...} },
  { id: '2', type: 'video', order: 1, file: new Blob(), metadata: {...} },
  { id: '3', type: 'pdf', order: 2, file: new Blob(), metadata: {...} },
];

<MediaGallery
  mediaItems={mockMediaItems}
  enableFullScreen={true}
  showThumbnails={true}
  onMediaClick={(item, index) => console.log('Media clicked:', item.id, index)}
/>
```

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| iOS Safari swipe conflicts with browser back gesture | Medium | Medium | Use edge threshold detection, test extensively |
| Touch event passive listener warnings | Low | Low | Use `{ passive: true }` for scroll events |
| Object URL memory leaks | Medium | High | Strictly follow urlsRef cleanup pattern |
| CSS transform jank on low-end devices | Low | Medium | Use `will-change: transform`, test on real devices |
| Full-screen conflicts with iOS viewport | Medium | Medium | Test viewport meta tag, use `100dvh` for dynamic viewport |

---

## Performance Considerations

1. **Lazy Loading**: Only generate object URLs for visible thumbnails + adjacent items
2. **Memoization**: Memoize thumbnail URLs to prevent regeneration on re-render
3. **CSS Transforms**: Use GPU-accelerated transforms for carousel animation
4. **Event Throttling**: Throttle touch move events if performance issues arise
5. **Image Sizing**: Thumbnails should use smaller blob versions when available

---

## Accessibility Requirements

1. **Keyboard Navigation**
   - Arrow Left/Right to navigate between items
   - Enter/Space to activate full-screen
   - Escape to exit full-screen
   - Tab to navigate between interactive elements

2. **Screen Reader Support**
   - ARIA labels on navigation buttons
   - Live region announcements for current item position ("Image 2 of 5")
   - Alt text for media items when available

3. **Focus Management**
   - Focus trap in full-screen mode
   - Return focus to trigger on full-screen exit
   - Visible focus indicators on all interactive elements

---

## References

- [Existing MediaThumbnail Component](/src/components/ItemCapture/components/shared/MediaThumbnail.tsx)
- [ReviewStep Media Grid](/src/components/ItemCapture/components/steps/ReviewStep.tsx)
- [ItemPreviewModal Overview (REQ-074)](/docs/REQ-074-create-itempreviewmodal-component-overview.md)
- [Implementation Plan Phase 4](/docs/prd/item-capture-manager-implementation-plan.md#phase-4-item-previewdetail-estimated-3-4-days)
- [Touch Events MDN](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [WCAG 2.1 Carousel Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/)

---

## Document History

| Date | Author | Changes |
|------|--------|---------|
| 2026-01-03 | Tech Lead Agent | Initial document creation |
