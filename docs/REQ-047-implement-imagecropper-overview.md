# REQ-047: Implement ImageCropper Component - Technical Overview

**Date Created:** 2025-12-31
**Last Modified:** 2025-12-31
**Request Reference:** docs/gen_requests.md - Request #047
**Implementation Plan Reference:** docs/prd/item-capture-implementation-plan.md
**Phase:** 4 - Editing Features
**Task ID:** 4.2
**Status:** Ready for Implementation

---

## 1. Summary

Implement a fully-featured `ImageCropper` component that wraps `react-image-crop` to provide touch-friendly image cropping with support for both free-form and preset aspect ratios. This component is part of the ItemCapture media editing workflow and will enable users to refine photos before finalizing their item documentation.

---

## 2. Context and Dependencies

### 2.1 Phase Context

```
Phase 4: Editing Features
├── 4.1 Create useMediaEditor hook ✓ (Prerequisite)
├── 4.2 Implement ImageCropper ◄── THIS TASK
├── 4.3 Implement ImageRotator (Parallel with 4.2)
├── 4.4 Implement VideoTrimmer (Parallel with 4.2)
└── 4.5 Build MediaEditorStep (Depends on 4.2, 4.3, 4.4)
```

### 2.2 Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| Phase 1 (Foundation) | Hard | Required | Types, state machine, wizard scaffold |
| Phase 2 or 3 | Soft | At least one | Need media items to edit |
| Task 4.1 (useMediaEditor) | Hard | Required | Hook manages edit state for media items |
| react-image-crop v11.0.10 | Library | Installed | Already in package.json |
| @types/react-image-crop v8.1.6 | Types | Installed | TypeScript support |

### 2.3 Existing Spike

A minimal spike implementation exists at:
- **File:** `src/components/ItemCapture/editors/ImageCropper.tsx`
- **Status:** Basic structure only, lacks full functionality
- **Purpose:** Validated react-image-crop integration works

---

## 3. Technical Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Display adjustable crop boundaries overlaid on the image | Must |
| FR-2 | Support free-form cropping with no aspect ratio constraint | Must |
| FR-3 | Offer preset aspect ratios: 1:1 (square), 4:3 (standard), 16:9 (widescreen) | Must |
| FR-4 | Provide touch-friendly drag handles (min 44x44px touch targets) | Must |
| FR-5 | Show real-time preview of cropped result | Must |
| FR-6 | Apply crop on confirm, returning cropped Blob | Must |
| FR-7 | Cancel returns to original uncropped image | Must |
| FR-8 | Support both captured photos and uploaded images | Must |

### 3.2 Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-1 | Component bundle size (excluding lazy-loaded deps) | < 5 KB |
| NFR-2 | Crop operation completes in | < 500ms |
| NFR-3 | Memory cleanup on unmount | 100% Object URLs revoked |
| NFR-4 | Touch responsiveness | < 100ms input latency |
| NFR-5 | Mobile viewport support | 320px minimum width |

---

## 4. Proposed Implementation

### 4.1 Component Architecture

```
ImageCropper/
├── ImageCropper.tsx           # Main component
├── ImageCropper.types.ts      # TypeScript interfaces (if complex)
└── cropUtils.ts               # Canvas-based crop execution utility
```

**Note:** Since this is a focused component, types may be co-located in the main file unless they need to be shared.

### 4.2 Props Interface

```typescript
// Location: src/components/ItemCapture/editors/ImageCropper.tsx

/** Available aspect ratio presets */
export type AspectRatioPreset = 'free' | '1:1' | '4:3' | '16:9';

/** Props for the ImageCropper component */
export interface ImageCropperProps {
  /** Source image URL (blob URL or data URL) */
  imageSrc: string;

  /** Callback when user confirms crop with the cropped image blob */
  onCropComplete: (croppedBlob: Blob) => void;

  /** Callback when user cancels the crop operation */
  onCancel: () => void;

  /** Initial aspect ratio preset (default: 'free') */
  initialAspectRatio?: AspectRatioPreset;

  /** Minimum crop width in pixels (default: 50) */
  minWidth?: number;

  /** Minimum crop height in pixels (default: 50) */
  minHeight?: number;

  /** Output image format (default: 'image/jpeg') */
  outputFormat?: 'image/jpeg' | 'image/png' | 'image/webp';

  /** Output image quality 0-1 for jpeg/webp (default: 0.92) */
  outputQuality?: number;

  /** Optional additional CSS class */
  className?: string;
}
```

### 4.3 Component State

```typescript
interface ImageCropperState {
  /** Current crop selection */
  crop: Crop | undefined;

  /** Completed crop (after mouseup/touchend) */
  completedCrop: PixelCrop | null;

  /** Currently selected aspect ratio */
  aspectRatio: AspectRatioPreset;

  /** Numeric aspect ratio value (undefined for free-form) */
  aspectValue: number | undefined;

  /** Whether crop operation is in progress */
  isProcessing: boolean;

  /** Preview blob URL for cropped result */
  previewUrl: string | null;

  /** Error message if any */
  error: string | null;
}
```

### 4.4 Key Implementation Details

#### 4.4.1 Aspect Ratio Mapping

```typescript
const ASPECT_RATIOS: Record<AspectRatioPreset, number | undefined> = {
  'free': undefined,
  '1:1': 1,
  '4:3': 4 / 3,
  '16:9': 16 / 9,
};
```

#### 4.4.2 Canvas-Based Crop Execution

```typescript
async function executeCrop(
  image: HTMLImageElement,
  crop: PixelCrop,
  outputFormat: string,
  outputQuality: number
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Calculate scale factor between displayed and natural image size
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  // Set canvas to cropped dimensions at natural scale
  canvas.width = crop.width * scaleX;
  canvas.height = crop.height * scaleY;

  // Draw cropped region
  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create image blob'));
        }
      },
      outputFormat,
      outputQuality
    );
  });
}
```

#### 4.4.3 Touch-Friendly Enhancements

The component should include CSS adjustments to ensure touch targets meet accessibility guidelines:

```css
/* Larger touch targets for crop handles */
.ReactCrop__drag-handle {
  width: 24px !important;
  height: 24px !important;
}

/* Ensure handles are visible on mobile */
@media (max-width: 768px) {
  .ReactCrop__drag-handle {
    width: 32px !important;
    height: 32px !important;
  }
}
```

---

## 5. UI/UX Specifications

### 5.1 Layout Structure

```
┌─────────────────────────────────────────────┐
│           Aspect Ratio Toolbar              │
│  [Free] [1:1] [4:3] [16:9]                 │
├─────────────────────────────────────────────┤
│                                             │
│                                             │
│           ┌───────────────┐                 │
│           │               │                 │
│           │  Crop Region  │                 │
│           │               │                 │
│           └───────────────┘                 │
│                                             │
│              Image Area                     │
│                                             │
├─────────────────────────────────────────────┤
│  Preview: [Thumbnail]                       │
├─────────────────────────────────────────────┤
│      [Cancel]              [Apply Crop]     │
└─────────────────────────────────────────────┘
```

### 5.2 Component States

| State | Visual Indication |
|-------|-------------------|
| Initial | Image displayed with centered default crop region |
| Dragging | Crop handles highlighted, region updating in real-time |
| Processing | "Applying crop..." text, spinner, buttons disabled |
| Error | Error message displayed, retry option |
| Complete | onCropComplete callback triggered |

### 5.3 Responsive Behavior

| Viewport | Behavior |
|----------|----------|
| Mobile (< 640px) | Full-width layout, stacked toolbar, larger touch targets |
| Tablet (640-1024px) | Comfortable image preview with side padding |
| Desktop (> 1024px) | Centered container with max-width constraint |

---

## 6. Integration Points

### 6.1 With useMediaEditor Hook

```typescript
// MediaEditorStep.tsx usage pattern
const {
  currentEditItem,
  pendingEdits,
  applyEdit,
  cancelEdit
} = useMediaEditor();

<ImageCropper
  imageSrc={currentEditItem.previewUrl}
  onCropComplete={(blob) => {
    applyEdit({
      type: 'crop',
      result: blob,
      // Track that cropping was applied
      metadata: { cropped: true }
    });
  }}
  onCancel={cancelEdit}
  initialAspectRatio="free"
/>
```

### 6.2 With MediaItem Type

The cropped result integrates with the existing `MediaItem` structure:

```typescript
interface MediaItem {
  id: string;
  type: 'video' | 'image' | 'pdf';
  file: File | Blob;  // ← Cropped blob goes here
  thumbnail?: Blob;
  order: number;
  metadata: MediaMetadata;
}

interface MediaMetadata {
  // ... other fields
  edits?: {
    cropped?: boolean;  // ← Set to true after crop
    rotated?: number;
    trimStart?: number;
    trimEnd?: number;
  };
}
```

---

## 7. Error Handling

| Error Scenario | Handling |
|----------------|----------|
| Canvas context unavailable | Display error message, suggest browser update |
| Image fails to load | Show error with retry button |
| Blob creation fails | Retry once, then show error with option to skip |
| Memory pressure on large images | Scale down before processing if width > 4096px |

---

## 8. Testing Approach

### 8.1 Unit Tests

- Aspect ratio calculations are correct
- Crop execution produces valid blob
- Props validation works correctly
- Memory cleanup on unmount

### 8.2 Integration Tests

- Component renders with image
- Aspect ratio buttons update crop constraint
- Cancel callback is invoked correctly
- Complete callback receives valid blob

### 8.3 Manual Testing Checklist

- [ ] iPhone Safari (iOS 15+) - touch dragging works
- [ ] iPad Safari - touch targets adequate
- [ ] Android Chrome - gesture handling correct
- [ ] Desktop Chrome/Firefox/Safari - mouse interactions
- [ ] Large images (> 4MB) - performance acceptable
- [ ] Small images (< 100KB) - no distortion
- [ ] All aspect ratios produce correct dimensions
- [ ] Free-form crop allows any proportion

---

## 9. Performance Considerations

### 9.1 Lazy Loading

Component must be dynamically imported to avoid adding to the initial bundle:

```typescript
// In MediaEditorStep.tsx
const ImageCropper = dynamic(
  () => import('../editors/ImageCropper'),
  {
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-200 h-64" />
  }
);
```

### 9.2 Memory Management

```typescript
// Clean up preview URLs on unmount
useEffect(() => {
  return () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };
}, [previewUrl]);
```

### 9.3 Large Image Handling

If the source image exceeds 4096px in any dimension, consider downscaling before displaying to prevent canvas memory issues on mobile devices.

---

## 10. Authorized Files and Functions for Modification

### 10.1 Files to Create/Modify

| File Path | Action | Purpose |
|-----------|--------|---------|
| `src/components/ItemCapture/editors/ImageCropper.tsx` | **Modify** | Replace spike with full implementation |
| `src/components/ItemCapture/editors/cropUtils.ts` | **Create** | Canvas crop execution utility (optional) |
| `src/components/ItemCapture/editors/imageCropper.css` | **Create** | Touch-friendly CSS overrides (optional) |

### 10.2 Files to Read (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/ItemCapture.types.ts` | Type definitions for MediaItem, MediaMetadata |
| `src/components/ItemCapture/hooks/useMediaEditor.ts` | Hook integration patterns |
| `src/lib/utils.ts` | cn() utility for class merging |
| `src/components/ItemCapture/utils/pdfThumbnailGenerator.ts` | Canvas/Blob pattern reference |

### 10.3 Package Dependencies

| Package | Version | Status |
|---------|---------|--------|
| react-image-crop | ^11.0.10 | Already installed |
| @types/react-image-crop | ^8.1.6 | Already installed |

---

## 11. Implementation Tasks

### 11.1 Task Breakdown

| # | Task | Effort | Notes |
|---|------|--------|-------|
| 1 | Define complete TypeScript interfaces | S | Props, state, utility types |
| 2 | Implement aspect ratio toolbar | M | Button group with active state |
| 3 | Integrate react-image-crop with state | M | Crop, onChange, onComplete handlers |
| 4 | Implement canvas-based crop execution | M | executeCrop utility function |
| 5 | Add real-time crop preview | M | Display thumbnail of cropped area |
| 6 | Add touch-friendly CSS overrides | S | Larger handles for mobile |
| 7 | Implement error handling | S | Error states and recovery |
| 8 | Add processing state and loading UI | S | Disable buttons during crop |
| 9 | Memory cleanup on unmount | S | Revoke object URLs |
| 10 | Manual device testing | M | iOS Safari, Android Chrome, Desktop |

### 11.2 Definition of Done

- [ ] Component renders image with interactive crop overlay
- [ ] All four aspect ratio options work correctly (free, 1:1, 4:3, 16:9)
- [ ] Touch interactions work on iOS Safari 15+ and Android Chrome
- [ ] Crop preview updates in real-time as user adjusts selection
- [ ] Apply button produces correct cropped Blob
- [ ] Cancel button invokes onCancel without modifications
- [ ] No memory leaks (all object URLs revoked)
- [ ] Component lazy-loads correctly (not in initial bundle)
- [ ] Error states display user-friendly messages

---

## 12. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Touch gestures conflict with page scroll | Medium | High | Use touch-action CSS property |
| Large images cause memory issues | Medium | Medium | Downscale images > 4096px before displaying |
| react-image-crop CSS overrides clash | Low | Low | Scope custom CSS with specific selectors |
| Cross-browser canvas behavior differences | Low | Medium | Test on target browsers early |

---

## 13. Open Questions

1. **Preview placement:** Should the crop preview be shown inline (thumbnail) or as a separate fullscreen preview step?
   - **Recommendation:** Inline thumbnail for real-time feedback

2. **Undo support:** Should users be able to undo a crop after applying?
   - **Recommendation:** Defer to useMediaEditor's non-destructive edit tracking (original preserved until final submit)

3. **Maximum output resolution:** Should we cap output resolution for performance?
   - **Recommendation:** Match source resolution up to 4096px, then downscale

---

## 14. References

- [react-image-crop Documentation](https://github.com/DominicTobias/react-image-crop)
- [react-image-crop Demo](https://codesandbox.io/s/react-image-crop-demo-with-react-hooks-y831o)
- [MDN: Canvas toBlob](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob)
- [Implementation Plan](/docs/prd/item-capture-implementation-plan.md) - Section 4.2
- [Existing Spike](/src/components/ItemCapture/editors/ImageCropper.tsx)
