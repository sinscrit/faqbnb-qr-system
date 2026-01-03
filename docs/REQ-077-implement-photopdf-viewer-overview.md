# REQ-077: Interactive Photo and PDF Viewer with Navigation Controls

**Implementation Overview Document**

**Created**: 2026-01-03
**Last Modified**: 2026-01-03
**Request Reference**: `docs/gen_requests.md` - REQ-077
**Implementation Plan Reference**: `docs/prd/item-capture-manager-implementation-plan.md`
**Phase**: 4 - Item Preview/Detail
**Task ID**: 4.4

---

## 1. Executive Summary

This document outlines the implementation of an interactive Photo and PDF Viewer component for the ItemManager's ItemPreviewModal. The viewer will provide photo zoom capabilities (tap/pinch gestures) and PDF page navigation with page count display. This component is a critical part of the Item Preview/Detail phase, enabling users to thoroughly inspect captured media without leaving the application.

---

## 2. Requirements Summary

### 2.1 Functional Requirements

**Photo Viewer:**
- Tap-to-zoom functionality for photo inspection
- Pinch-to-zoom gesture support on touch devices
- Pan/drag navigation when zoomed in
- Zoom out to return to original view
- Reset zoom state when switching between attachments

**PDF Viewer:**
- Page navigation controls (previous/next page)
- Page count display showing current page and total (e.g., "3 / 12")
- Responsive sizing within the preview modal
- Reset to page 1 when switching between PDF attachments

### 2.2 Non-Functional Requirements

- Mobile-first design with touch gesture support
- Smooth animations and transitions
- Memory-efficient handling of large images/PDFs
- Accessible navigation controls
- Consistent with existing codebase patterns

---

## 3. Technical Context

### 3.1 Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.0 | Component framework |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| pdfjs-dist | 4.10.38 | PDF rendering (already installed) |
| Lucide React | 0.525.0 | Icons |

### 3.2 Existing Patterns to Follow

| Pattern | Reference File | Notes |
|---------|----------------|-------|
| Modal components | `src/components/ConfirmationModal.tsx` | Overlay and layout patterns |
| Media handling | `src/components/ItemCapture/components/shared/MediaThumbnail.tsx` | Object URL management |
| PDF display | `src/components/ItemCapture/components/shared/PDFPlaceholder.tsx` | PDF placeholder states |
| Image editing | `src/components/ItemCapture/editors/ImageCropper.tsx` | Touch handling, canvas operations |
| State reducer | `src/components/ItemCapture/hooks/useItemCaptureState.ts` | Local state management |
| Type definitions | `src/components/ItemCapture/ItemCapture.types.ts` | MediaItem, MediaMetadata types |

### 3.3 Dependencies

**Existing Dependencies (No New Installs Required):**
- `pdfjs-dist` - Already installed for PDF thumbnail generation
- Native browser APIs for touch/gesture handling
- Canvas API for zoom operations

---

## 4. Architecture Design

### 4.1 Component Hierarchy

```
ItemManager/
└── components/
    └── ItemPreview/
        ├── ItemPreviewModal.tsx      (Parent - Phase 4.1)
        ├── MediaGallery.tsx          (Container - Phase 4.2)
        └── viewers/
            ├── PhotoViewer.tsx       (NEW - This task)
            ├── PDFViewer.tsx         (NEW - This task)
            └── index.ts              (Barrel exports)
```

### 4.2 Data Flow

```
MediaGallery
    │
    ├── Detects media type from MediaItem
    │
    ├─► PhotoViewer (when type === 'image')
    │     │
    │     ├── Receives: imageSrc (object URL), onClose callback
    │     ├── Manages: zoom level, pan position, gesture state
    │     └── Outputs: User interaction callbacks
    │
    └─► PDFViewer (when type === 'pdf')
          │
          ├── Receives: pdfSrc (object URL or File), pageCount
          ├── Manages: current page, PDF document state
          └── Outputs: Navigation callbacks
```

### 4.3 State Management

**PhotoViewer Local State:**
```typescript
interface PhotoViewerState {
  scale: number;           // Current zoom level (1.0 = 100%)
  position: { x: number; y: number };  // Pan offset
  isZoomed: boolean;       // Whether currently zoomed in
  isDragging: boolean;     // Whether user is panning
}
```

**PDFViewer Local State:**
```typescript
interface PDFViewerState {
  currentPage: number;     // Current page (1-indexed)
  totalPages: number;      // Total page count
  isLoading: boolean;      // PDF loading state
  error: string | null;    // Error message if any
  pdfDocument: PDFDocumentProxy | null;  // pdfjs document reference
}
```

---

## 5. Implementation Tasks

### Task 1: Create PhotoViewer Component Types and Setup

**Effort**: 1 story point
**Priority**: High (Foundation)

**Description:**
Create the base PhotoViewer component file with TypeScript interfaces, props definition, and component skeleton.

**Deliverables:**
- `src/components/ItemManager/components/ItemPreview/viewers/PhotoViewer.tsx`
- `src/components/ItemManager/components/ItemPreview/viewers/index.ts`

**Interface Definition:**
```typescript
export interface PhotoViewerProps {
  /** Object URL or source URL of the image */
  imageSrc: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Callback when viewer requests close (optional) */
  onClose?: () => void;
  /** Whether to enable zoom functionality (default: true) */
  enableZoom?: boolean;
  /** Maximum zoom level (default: 3.0) */
  maxZoom?: number;
  /** Minimum zoom level (default: 1.0) */
  minZoom?: number;
  /** Additional CSS classes */
  className?: string;
}
```

---

### Task 2: Implement Photo Zoom Logic

**Effort**: 2 story points
**Priority**: High (Core functionality)
**Dependencies**: Task 1

**Description:**
Implement the core zoom functionality including double-tap to zoom, pinch-to-zoom gestures, and zoom controls.

**Key Implementation Details:**
- Use `touch-action: none` on the container for gesture control
- Track touch points for pinch gesture detection
- Calculate zoom center point based on pinch midpoint
- Clamp zoom level between minZoom and maxZoom
- Animate zoom transitions with CSS transitions

**Gesture Detection:**
```typescript
// Pinch gesture detection
const handleTouchMove = (e: TouchEvent) => {
  if (e.touches.length === 2) {
    const distance = getDistance(e.touches[0], e.touches[1]);
    const scale = distance / initialDistance;
    setZoomLevel(clamp(initialScale * scale, minZoom, maxZoom));
  }
};

// Double-tap detection
const handleDoubleTap = () => {
  if (isZoomed) {
    resetZoom();
  } else {
    zoomIn(2.0); // Zoom to 200%
  }
};
```

---

### Task 3: Implement Photo Pan/Drag Navigation

**Effort**: 1 story point
**Priority**: High
**Dependencies**: Task 2

**Description:**
Enable panning when zoomed in, with boundary constraints to prevent image from moving off-screen.

**Key Implementation Details:**
- Only enable panning when scale > 1.0
- Calculate boundary limits based on image dimensions and zoom level
- Use `transform: translate()` for smooth panning
- Support both touch drag and mouse drag
- Implement momentum/inertia for natural feel (optional enhancement)

---

### Task 4: Implement Photo Zoom UI Controls

**Effort**: 1 story point
**Priority**: Medium
**Dependencies**: Task 2

**Description:**
Add visual controls for zoom operations accessible on all devices.

**UI Elements:**
- Zoom in (+) button
- Zoom out (-) button
- Reset zoom button (fit to container)
- Zoom level indicator (e.g., "150%")

**Styling:**
- Use existing button patterns from codebase
- Semi-transparent overlay for controls
- Minimum 44x44px touch targets for mobile accessibility

---

### Task 5: Create PDFViewer Component Types and Setup

**Effort**: 1 story point
**Priority**: High (Foundation)
**Dependencies**: None (can parallel with Tasks 1-4)

**Description:**
Create the base PDFViewer component with TypeScript interfaces and integrate with pdfjs-dist.

**Deliverables:**
- `src/components/ItemManager/components/ItemPreview/viewers/PDFViewer.tsx`

**Interface Definition:**
```typescript
export interface PDFViewerProps {
  /** PDF source - can be object URL, File, or Blob */
  pdfSrc: string | File | Blob;
  /** Initial page to display (default: 1) */
  initialPage?: number;
  /** Known page count (for display before PDF loads) */
  pageCount?: number;
  /** Callback when page changes */
  onPageChange?: (page: number, total: number) => void;
  /** Additional CSS classes */
  className?: string;
}
```

---

### Task 6: Implement PDF Document Loading

**Effort**: 2 story points
**Priority**: High (Core functionality)
**Dependencies**: Task 5

**Description:**
Implement PDF document loading using pdfjs-dist with proper error handling and loading states.

**Key Implementation Details:**
```typescript
import * as pdfjsLib from 'pdfjs-dist';

// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

// Load PDF document
const loadPDF = async (src: string | File | Blob) => {
  setIsLoading(true);
  try {
    const loadingTask = pdfjsLib.getDocument(
      src instanceof Blob ? { data: await src.arrayBuffer() } : src
    );
    const pdf = await loadingTask.promise;
    setPdfDocument(pdf);
    setTotalPages(pdf.numPages);
    await renderPage(1);
  } catch (err) {
    setError('Failed to load PDF');
  } finally {
    setIsLoading(false);
  }
};
```

**Error States:**
- Loading failed
- Password protected (inform user)
- Corrupted PDF

---

### Task 7: Implement PDF Page Rendering

**Effort**: 2 story points
**Priority**: High
**Dependencies**: Task 6

**Description:**
Render individual PDF pages to canvas with appropriate scaling for container size.

**Key Implementation Details:**
- Use canvas element for rendering
- Calculate scale based on container width
- Handle high-DPI displays with devicePixelRatio
- Cache rendered pages for performance (optional)

```typescript
const renderPage = async (pageNum: number) => {
  if (!pdfDocument || !canvasRef.current) return;

  const page = await pdfDocument.getPage(pageNum);
  const canvas = canvasRef.current;
  const context = canvas.getContext('2d');

  // Calculate scale to fit container width
  const containerWidth = canvas.parentElement?.clientWidth || 800;
  const viewport = page.getViewport({ scale: 1 });
  const scale = containerWidth / viewport.width;
  const scaledViewport = page.getViewport({ scale });

  // Handle high-DPI
  const outputScale = window.devicePixelRatio || 1;
  canvas.width = Math.floor(scaledViewport.width * outputScale);
  canvas.height = Math.floor(scaledViewport.height * outputScale);
  canvas.style.width = `${scaledViewport.width}px`;
  canvas.style.height = `${scaledViewport.height}px`;

  context.scale(outputScale, outputScale);

  await page.render({
    canvasContext: context,
    viewport: scaledViewport,
  }).promise;
};
```

---

### Task 8: Implement PDF Navigation Controls

**Effort**: 1 story point
**Priority**: High
**Dependencies**: Task 7

**Description:**
Create navigation UI with previous/next buttons and page indicator.

**UI Elements:**
- Previous page button (disabled on page 1)
- Next page button (disabled on last page)
- Page indicator: "Page 3 of 12" or "3 / 12"
- Keyboard navigation support (Arrow keys)

**Accessibility:**
- Aria labels on navigation buttons
- Focus management
- Screen reader announcements for page changes

---

### Task 9: Integrate Viewers with MediaGallery

**Effort**: 1 story point
**Priority**: High
**Dependencies**: Tasks 4, 8

**Description:**
Integrate PhotoViewer and PDFViewer components into the MediaGallery component, handling media type detection and state reset on attachment change.

**Implementation:**
```typescript
const MediaGallery = ({ media }: MediaGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentMedia = media[currentIndex];

  // Reset viewer state when switching media
  useEffect(() => {
    // Zoom/page state reset handled by child components via key prop
  }, [currentIndex]);

  return (
    <div className="media-gallery">
      {currentMedia.type === 'image' && (
        <PhotoViewer
          key={currentMedia.id}
          imageSrc={objectUrl}
        />
      )}
      {currentMedia.type === 'pdf' && (
        <PDFViewer
          key={currentMedia.id}
          pdfSrc={currentMedia.file}
          pageCount={currentMedia.metadata.pageCount}
        />
      )}
      {/* Thumbnail navigation */}
    </div>
  );
};
```

---

### Task 10: Testing and Polish

**Effort**: 1 story point
**Priority**: Medium
**Dependencies**: Task 9

**Description:**
Add comprehensive testing and polish interactions.

**Testing Scenarios:**
- [ ] Photo zoom on tap (desktop)
- [ ] Photo pinch-to-zoom (touch devices)
- [ ] Photo pan when zoomed
- [ ] Photo zoom reset
- [ ] PDF page navigation
- [ ] PDF page count display
- [ ] State reset when switching attachments
- [ ] Loading states
- [ ] Error states
- [ ] Keyboard navigation
- [ ] Screen reader compatibility

---

## 6. Authorized Files and Functions for Modification

### 6.1 New Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/components/ItemPreview/viewers/PhotoViewer.tsx` | Photo viewer with zoom functionality |
| `src/components/ItemManager/components/ItemPreview/viewers/PDFViewer.tsx` | PDF viewer with page navigation |
| `src/components/ItemManager/components/ItemPreview/viewers/index.ts` | Barrel exports for viewer components |

### 6.2 Existing Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemManager/components/ItemPreview/MediaGallery.tsx` | Import and integrate PhotoViewer and PDFViewer |
| `src/components/ItemManager/ItemManager.types.ts` | Add PhotoViewerProps and PDFViewerProps types if needed |

### 6.3 Files for Reference Only (Do Not Modify)

| File Path | Reason |
|-----------|--------|
| `src/components/ItemCapture/editors/ImageCropper.tsx` | Reference for touch handling patterns |
| `src/components/ItemCapture/components/shared/MediaThumbnail.tsx` | Reference for Object URL management |
| `src/components/ItemCapture/components/shared/PDFPlaceholder.tsx` | Reference for PDF error states |
| `src/components/ItemCapture/ItemCapture.types.ts` | Reference for MediaItem, MediaMetadata types |

---

## 7. Dependencies and Integration Points

### 7.1 Internal Dependencies

| Component | Status | Dependency Type |
|-----------|--------|-----------------|
| ItemPreviewModal (4.1) | Required before integration | Container component |
| MediaGallery (4.2) | Required before integration | Parent component |
| Video Playback (4.3) | Parallel development possible | Sibling component |

### 7.2 External Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| pdfjs-dist | 4.10.38 | PDF rendering (already installed) |
| lucide-react | 0.525.0 | Navigation icons |

### 7.3 pdfjs Worker Setup

**Note:** The pdfjs worker file must be available. Check if `/public/pdf.worker.min.js` exists or needs to be copied from `node_modules/pdfjs-dist/build/`.

---

## 8. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Pinch-to-zoom gesture conflicts with browser zoom | Medium | Medium | Use `touch-action: none` and proper event prevention |
| PDF rendering performance on large PDFs | Medium | Low | Render only current page, show loading state |
| Memory leaks from Object URLs | Low | Medium | Proper cleanup in useEffect return functions |
| pdfjs worker not loading | Low | High | Verify worker setup, add fallback error message |
| Touch gesture detection on older browsers | Low | Low | Fallback to button controls |

---

## 9. Acceptance Criteria Mapping

| Requirement | Task | Verification |
|-------------|------|--------------|
| Users can zoom into photos using tap or pinch gestures | Tasks 2, 3 | Manual testing on touch devices |
| Zoomed photos can be panned to view different areas | Task 3 | Manual testing |
| Users can navigate between pages in multi-page PDFs | Task 8 | Unit test + manual verification |
| PDF viewer displays current page number and total | Task 8 | Visual inspection |
| Navigation controls respond immediately | Tasks 4, 8 | Performance testing |
| Zoom and navigation state resets when switching attachments | Task 9 | Integration test |

---

## 10. Effort Summary

| Task | Description | Effort (SP) |
|------|-------------|-------------|
| Task 1 | PhotoViewer Types and Setup | 1 |
| Task 2 | Photo Zoom Logic | 2 |
| Task 3 | Photo Pan Navigation | 1 |
| Task 4 | Photo Zoom UI Controls | 1 |
| Task 5 | PDFViewer Types and Setup | 1 |
| Task 6 | PDF Document Loading | 2 |
| Task 7 | PDF Page Rendering | 2 |
| Task 8 | PDF Navigation Controls | 1 |
| Task 9 | Integration with MediaGallery | 1 |
| Task 10 | Testing and Polish | 1 |
| **Total** | | **13 SP** |

---

## 11. Implementation Notes

### 11.1 pdfjs-dist Configuration

```typescript
// In PDFViewer.tsx or a shared config
import * as pdfjsLib from 'pdfjs-dist';

// Option 1: Use CDN worker (recommended for simplicity)
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Option 2: Local worker (copy to public folder)
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
```

### 11.2 Touch Gesture Best Practices

- Use `passive: false` for touch event listeners that call `preventDefault()`
- Debounce or throttle gesture calculations for performance
- Provide visual feedback during zoom/pan operations
- Consider adding momentum/inertia for natural feel

### 11.3 Memory Management

- Revoke Object URLs when components unmount
- Release PDF document resources with `pdfDocument.destroy()`
- Clean up canvas contexts to free GPU memory

---

## 12. References

- [pdfjs-dist Documentation](https://mozilla.github.io/pdf.js/)
- [Touch Events MDN](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [Gesture Events for Zoom](https://developer.mozilla.org/en-US/docs/Web/API/Gesture_events)
- [WCAG 2.1 Touch Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- Implementation Plan: `docs/prd/item-capture-manager-implementation-plan.md`
- Existing ImageCropper: `src/components/ItemCapture/editors/ImageCropper.tsx`
