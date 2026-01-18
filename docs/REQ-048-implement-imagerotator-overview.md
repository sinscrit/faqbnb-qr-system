# REQ-048: Implement ImageRotator Component - Technical Overview

**Document Created:** 2025-12-31T16:15:00
**Last Modified:** 2025-12-31T16:15:00
**Request Reference:** `/docs/gen_requests.md` - REQ-048
**Implementation Plan:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 4 - Editing Features
**Task ID:** 4.3

---

## 1. Summary

Implement the `ImageRotator` component that allows users to rotate photos in 90-degree increments with smooth animated previews and canvas-based processing. This component is part of the ItemCapture media editing workflow and integrates with the `useMediaEditor` hook for non-destructive editing.

---

## 2. Context from Implementation Plan

### Phase 4 Position
```
        4.1 useMediaEditor Hook
                   |
       +-----------+-----------+
       v           v           v
     4.2         4.3         4.4
   Image       Image       Video
  Cropper     Rotator     Trimmer
       |           |           |
       +-----------+-----------+
                   v
          4.5 MediaEditorStep
           (Container/Router)
```

### Dependencies
| Dependency | Status | Notes |
|------------|--------|-------|
| Phase 1 (Foundation) | Required | Types, state machine, wizard navigation |
| Phase 2 OR Phase 3 | Required | Need media items to edit |
| Task 4.1 (useMediaEditor hook) | Required | Provides rotation state management |
| Task 4.2 (ImageCropper) | Parallel | Can develop independently |
| Task 4.4 (VideoTrimmer) | Parallel | Can develop independently |

### Parallelization
- ImageRotator (4.3) can be developed in parallel with ImageCropper (4.2) and VideoTrimmer (4.4)
- All three editor components depend on useMediaEditor hook (4.1)
- MediaEditorStep (4.5) depends on all three editor components

---

## 3. Technical Approach

### 3.1 Component Architecture

The ImageRotator component will:
1. Receive an image source (Blob URL or File)
2. Display the image with rotation controls
3. Apply smooth CSS transitions for visual preview
4. Use canvas-based processing for actual rotation on confirmation
5. Integrate with useMediaEditor hook for non-destructive state management

### 3.2 Rotation State Model

```typescript
type RotationDegrees = 0 | 90 | 180 | 270;

// Rotation is tracked as cumulative degrees, wrapping at 360
// Example: User clicks "rotate right" twice = 180 degrees
// Example: At 270 degrees, clicking "rotate right" = 0 degrees
```

### 3.3 Animation Strategy

**CSS Transform Approach:**
- Use Tailwind's `transition-transform` for smooth animated previews
- Apply `rotate-{degrees}` classes dynamically
- Transition duration: 200-300ms for natural feel
- Prevent rotation actions during animation to avoid jank

**Implementation Pattern:**
```tsx
<div className={cn(
  "transition-transform duration-300 ease-in-out",
  {
    "rotate-0": rotation === 0,
    "rotate-90": rotation === 90,
    "rotate-180": rotation === 180,
    "-rotate-90": rotation === 270, // Tailwind uses -rotate-90 for 270
  }
)}>
  <img src={imageSrc} />
</div>
```

### 3.4 Canvas-Based Rotation Processing

When user confirms edits, apply actual rotation using canvas:

```typescript
function rotateImage(
  source: Blob,
  degrees: RotationDegrees,
  outputFormat: 'image/jpeg' | 'image/png' = 'image/jpeg',
  quality: number = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(source);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Swap dimensions for 90/270 degree rotations
      const isRotated90or270 = degrees === 90 || degrees === 270;
      canvas.width = isRotated90or270 ? img.height : img.width;
      canvas.height = isRotated90or270 ? img.width : img.height;

      // Apply rotation
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((degrees * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create rotated blob'));
          }
        },
        outputFormat,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for rotation'));
    };

    img.src = url;
  });
}
```

---

## 4. Props Interface

```typescript
/**
 * Props for the ImageRotator component
 */
export interface ImageRotatorProps {
  /** Source image as Blob, File, or object URL string */
  imageSrc: string | Blob | File;

  /** Initial rotation in degrees (0, 90, 180, 270) */
  initialRotation?: RotationDegrees;

  /** Called when user confirms the rotation */
  onRotationComplete: (rotatedBlob: Blob, rotation: RotationDegrees) => void;

  /** Called when user cancels rotation */
  onCancel: () => void;

  /** Output image format (default: 'image/jpeg') */
  outputFormat?: 'image/jpeg' | 'image/png';

  /** Output quality for JPEG (0.0 - 1.0, default: 0.92) */
  outputQuality?: number;

  /** Optional CSS class for the container */
  className?: string;

  /** Show processing indicator during canvas operations */
  showProcessingIndicator?: boolean;
}

type RotationDegrees = 0 | 90 | 180 | 270;
```

---

## 5. Component Structure

```
src/components/ItemCapture/editors/
├── ImageRotator.tsx          # Main component
├── ImageRotator.test.tsx     # Unit tests (if applicable)
└── rotationUtils.ts          # Canvas rotation utilities (optional, can inline)
```

### Internal State

```typescript
interface ImageRotatorState {
  // Current rotation (visual preview state)
  currentRotation: RotationDegrees;

  // Whether animation is in progress
  isAnimating: boolean;

  // Whether canvas processing is in progress
  isProcessing: boolean;

  // Error state
  error: string | null;

  // Object URL for the source image (if created from Blob)
  imageUrl: string | null;
}
```

---

## 6. User Interaction Flow

```
1. Component mounts with imageSrc
   └── Create object URL if Blob/File
   └── Display image at initialRotation (default: 0)

2. User clicks "Rotate Left" button
   └── Disable buttons (isAnimating = true)
   └── Update rotation: (current - 90 + 360) % 360
   └── CSS transition animates the rotation
   └── After 300ms, re-enable buttons

3. User clicks "Rotate Right" button
   └── Disable buttons (isAnimating = true)
   └── Update rotation: (current + 90) % 360
   └── CSS transition animates the rotation
   └── After 300ms, re-enable buttons

4. User can repeat steps 2-3 multiple times

5a. User clicks "Apply" / "Confirm"
    └── Set isProcessing = true
    └── Perform canvas-based rotation
    └── Call onRotationComplete(rotatedBlob, finalRotation)

5b. User clicks "Cancel"
    └── Revoke any created object URLs
    └── Call onCancel()
```

---

## 7. UI Layout

```
+--------------------------------------------------+
|                                                  |
|  +--------------------------------------------+  |
|  |                                            |  |
|  |                                            |  |
|  |           [Rotated Image Preview]          |  |
|  |                                            |  |
|  |                                            |  |
|  +--------------------------------------------+  |
|                                                  |
|           [Rotate Left]   [Rotate Right]         |
|                                                  |
|              [Cancel]     [Apply]                |
|                                                  |
+--------------------------------------------------+
```

### Button Specifications

| Button | Icon | Size | Action |
|--------|------|------|--------|
| Rotate Left | `RotateCcw` (Lucide) | 48x48px min (touch target) | Rotate -90 degrees |
| Rotate Right | `RotateCw` (Lucide) | 48x48px min (touch target) | Rotate +90 degrees |
| Cancel | Text or `X` icon | Standard button | Cancel and revert |
| Apply | Text | Primary button | Confirm and process |

---

## 8. Integration with useMediaEditor Hook

The ImageRotator integrates with the useMediaEditor hook for non-destructive editing:

```typescript
// In MediaEditorStep or parent component
const {
  getEditState,
  setRotation,
  confirmEdits,
  cancelEdits,
  getEditPreview
} = useMediaEditor();

// When rotation changes
const handleRotationChange = (mediaId: string, newRotation: RotationDegrees) => {
  setRotation(mediaId, newRotation);
};

// When user confirms
const handleConfirm = async (mediaId: string) => {
  const result = await confirmEdits(mediaId);
  // Handle result
};
```

### Hook Integration Pattern

```tsx
// ImageRotator receives callbacks, not hook directly
// This keeps the component reusable and testable

<ImageRotator
  imageSrc={editState.previewUrl || originalMediaUrl}
  initialRotation={editState.rotation}
  onRotationComplete={(blob, degrees) => {
    setRotation(mediaId, degrees);
    // The hook handles the actual file processing on confirmEdits
  }}
  onCancel={() => cancelEdits(mediaId)}
/>
```

---

## 9. Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|---------------------|----------------|
| Two clearly labeled buttons: rotate left 90 degrees and rotate right 90 degrees | `RotateCcw` and `RotateCw` icons with accessible labels |
| Clicking a rotation button triggers a smooth animated transition | Tailwind `transition-transform duration-300` on image container |
| Actual rotation processed using canvas-based rendering | `rotateImage()` function using canvas API |
| Multiple rotation operations can be applied sequentially | State tracks cumulative rotation (0, 90, 180, 270) |
| Rotation preview animation completes before allowing next action | `isAnimating` state disables buttons during transition |
| Confirming edits applies the rotation permanently | `onRotationComplete` callback with processed Blob |
| Canceling edits reverts the image to original orientation | `onCancel` callback, no changes persisted |
| Integrates with non-destructive editing state management | Works with useMediaEditor hook via callbacks |

---

## 10. Error Handling

| Error Scenario | Handling |
|----------------|----------|
| Image fails to load | Display error message, disable rotation controls |
| Canvas context unavailable | Show error, suggest browser compatibility issue |
| Blob creation fails | Retry with fallback quality, show error if persistent |
| Object URL creation fails | Show memory error, suggest closing other tabs |

### Error Display Pattern

```tsx
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
    <p className="text-sm">{error}</p>
  </div>
)}
```

---

## 11. Performance Considerations

1. **Memory Management:**
   - Revoke object URLs on unmount
   - Revoke previous preview URLs when creating new ones
   - Use ref to track URLs for cleanup

2. **Animation Performance:**
   - Use CSS transforms (GPU accelerated)
   - Avoid re-rendering during animation
   - Use `will-change: transform` for smoother animations

3. **Canvas Processing:**
   - Process in async callback to avoid blocking UI
   - Show processing indicator during canvas operations
   - Consider Web Workers for very large images (V2)

### Cleanup Pattern

```typescript
useEffect(() => {
  return () => {
    if (imageUrl && imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imageUrl);
    }
  };
}, [imageUrl]);
```

---

## 12. Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| Keyboard navigation | Buttons focusable, Enter/Space to activate |
| Screen reader support | `aria-label` on rotation buttons describing action |
| Focus management | Focus trap within editor, return focus on close |
| Motion preferences | Respect `prefers-reduced-motion` for animations |

### Reduced Motion Pattern

```tsx
<div className={cn(
  "motion-safe:transition-transform motion-safe:duration-300",
  rotationClass
)}>
```

---

## 13. Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/editors/ImageRotator.tsx` | Main ImageRotator component |
| `src/components/ItemCapture/editors/rotationUtils.ts` | Canvas rotation utility functions (optional) |

### Files to MODIFY

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemCapture/index.ts` | Add ImageRotator export |
| `src/components/ItemCapture/ItemCapture.types.ts` | Add RotationDegrees type if not present |
| `src/components/ItemCapture/components/steps/MediaEditorStep.tsx` | Integrate ImageRotator (when 4.5 is implemented) |

### Files to REFERENCE (read-only patterns)

| File Path | Pattern Reference |
|-----------|-------------------|
| `src/components/ItemCapture/editors/ImageCropper.tsx` | Editor component structure |
| `src/components/ItemCapture/utils/pdfThumbnailGenerator.ts` | Canvas blob generation pattern |
| `src/components/LoginForm.tsx` | Form state and error handling patterns |
| `src/components/AccountSelector.tsx` | Rotation animation patterns |
| `src/lib/utils.ts` | `cn()` utility for class merging |

### Dependencies Required

| Dependency | Version | Notes |
|------------|---------|-------|
| `lucide-react` | ^0.525.0 | Already installed - RotateCw, RotateCcw icons |
| `tailwind-merge` | ^3.3.1 | Already installed - via cn() utility |
| `clsx` | ^2.1.1 | Already installed - via cn() utility |

---

## 14. Testing Approach

### Unit Tests

1. **Rotation State Logic:**
   - Rotating right from 0 = 90
   - Rotating right from 270 = 0 (wrap)
   - Rotating left from 0 = 270 (wrap)
   - Rotating left from 90 = 0

2. **Canvas Rotation:**
   - Dimensions swap correctly for 90/270
   - Image quality preserved
   - Output format respected

### Manual Testing Checklist

- [ ] Rotate left button works
- [ ] Rotate right button works
- [ ] Animation is smooth and completes before next action
- [ ] Multiple rotations accumulate correctly
- [ ] Apply button processes and returns rotated image
- [ ] Cancel button reverts without changes
- [ ] Works on iPhone Safari
- [ ] Works on Android Chrome
- [ ] Works on desktop browsers
- [ ] Touch targets are appropriately sized on mobile
- [ ] Keyboard navigation works
- [ ] Screen reader announces actions

---

## 15. Implementation Order

1. Create `rotationUtils.ts` with canvas rotation function
2. Create basic `ImageRotator.tsx` with static UI
3. Add rotation state and button handlers
4. Implement CSS animation for preview
5. Add animation locking (disable during transition)
6. Implement canvas processing on confirm
7. Add error handling
8. Add accessibility attributes
9. Add memory cleanup
10. Test on target browsers/devices

---

## 16. Related Tasks

| Task ID | Title | Relationship |
|---------|-------|--------------|
| 4.1 | useMediaEditor hook | Prerequisite - provides state management |
| 4.2 | ImageCropper | Parallel - similar editor component |
| 4.4 | VideoTrimmer | Parallel - similar editor component |
| 4.5 | MediaEditorStep | Dependent - will integrate this component |

---

## 17. Open Questions

1. **Animation Duration:** Is 300ms appropriate, or should it be configurable?
2. **Multiple Undo:** Should there be an "undo last rotation" option separate from full cancel?
3. **Rotation Indicator:** Should we show current rotation degrees (e.g., "90°") in the UI?

---

## 18. References

- [Canvas rotate() - MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rotate)
- [CSS transform: rotate() - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/rotate)
- [Tailwind Transition](https://tailwindcss.com/docs/transition-property)
- [Lucide Icons](https://lucide.dev/icons/)
- Implementation Plan: `/docs/prd/item-capture-implementation-plan.md`
- useMediaEditor Hook Spec: `/docs/REQ-046-create-usemediaeditor-hook-overview.md`
