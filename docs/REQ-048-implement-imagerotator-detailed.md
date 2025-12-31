# REQ-048: Implement ImageRotator Component - Detailed Task Breakdown

**Document Created:** 2025-12-31T17:45:00
**Last Modified:** 2025-12-31T22:00:00
**Implementation Status:** COMPLETED
**Request Reference:** `/docs/gen_requests.md` - REQ-048
**Overview Document:** `/docs/REQ-048-implement-imagerotator-overview.md`
**Implementation Plan:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 4 - Editing Features
**Task ID:** 4.3

---

## Summary

This document breaks down the implementation of the `ImageRotator` component into granular, actionable tasks. Each task is scoped to approximately 1 story point (a few hours of focused work) and includes specific verification steps.

---

## Prerequisites

Before starting this task, verify the following are complete:

| Prerequisite | Source | Verification |
|--------------|--------|--------------|
| Phase 1 (Foundation) complete | Implementation Plan | Directory structure, types, state machine exist |
| Phase 2 OR Phase 3 complete | Implementation Plan | Media items available to edit |
| Task 4.1 (useMediaEditor hook) | Implementation Plan | Hook provides rotation state management |
| Lucide React icons available | `package.json` | `lucide-react` version ^0.525.0 installed |
| `cn()` utility available | `src/lib/utils.ts` | Class merging utility exists |

---

## Authorized Files for Modification

### Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/editors/ImageRotator.tsx` | Main ImageRotator component |
| `src/components/ItemCapture/editors/rotationUtils.ts` | Canvas rotation utility functions |

### Files to MODIFY (if they exist)

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemCapture/index.ts` | Add ImageRotator export |
| `src/components/ItemCapture/ItemCapture.types.ts` | Add RotationDegrees type if not present |

### Reference Files (read-only)

| File Path | Pattern Reference |
|-----------|-------------------|
| `src/components/ItemCapture/editors/ImageCropper.tsx` | Editor component structure, props pattern |
| `src/components/ItemCapture/utils/pdfThumbnailGenerator.ts` | Canvas blob generation pattern |
| `src/lib/utils.ts` | `cn()` utility usage |

---

## Task Breakdown

### Task 1: Create Rotation Utility Functions
**Estimated Effort:** 1 story point
**Depends On:** None
**File:** `src/components/ItemCapture/editors/rotationUtils.ts`

#### Description
Create the canvas-based utility functions for rotating images. This isolated utility enables unit testing and reuse.

#### Implementation Steps

1. Create file `src/components/ItemCapture/editors/rotationUtils.ts`

2. Define the `RotationDegrees` type:
   ```typescript
   export type RotationDegrees = 0 | 90 | 180 | 270;
   ```

3. Implement `rotateImage()` function with the following signature:
   ```typescript
   export function rotateImage(
     source: Blob,
     degrees: RotationDegrees,
     outputFormat?: 'image/jpeg' | 'image/png',
     quality?: number
   ): Promise<Blob>
   ```

4. Implementation details:
   - Create Image element from Blob URL
   - Calculate new canvas dimensions (swap width/height for 90/270 degrees)
   - Apply canvas translate and rotate transformations
   - Draw image at correct position based on rotation
   - Generate output Blob via `canvas.toBlob()`
   - Clean up object URLs after use

5. Implement helper function for rotation calculations:
   ```typescript
   export function calculateNextRotation(
     current: RotationDegrees,
     direction: 'left' | 'right'
   ): RotationDegrees
   ```
   - Rotating right: `(current + 90) % 360`
   - Rotating left: `(current - 90 + 360) % 360`

#### Verification Steps

- [x] File created at `src/components/ItemCapture/editors/rotationUtils.ts`
- [x] `RotationDegrees` type exported
- [x] `rotateImage()` function exported
- [x] `calculateNextRotation()` function exported
- [x] TypeScript compiles without errors: `npx tsc --noEmit`
- [x] Manual verification: Call `calculateNextRotation(0, 'right')` returns `90`
- [x] Manual verification: Call `calculateNextRotation(270, 'right')` returns `0` (wrap)
- [x] Manual verification: Call `calculateNextRotation(0, 'left')` returns `270`

**Implementation Notes (2025-12-31):**
- Created `rotationUtils.ts` with `RotationDegrees` type, `rotateImage()`, `calculateNextRotation()`, and `degreesToRadians()` helper
- Also exported `ROTATION_ERROR_MESSAGES` constant for consistent error messaging

---

### Task 2: Create ImageRotator Component Skeleton
**Estimated Effort:** 1 story point
**Depends On:** Task 1
**File:** `src/components/ItemCapture/editors/ImageRotator.tsx`

#### Description
Create the basic component structure with proper TypeScript interfaces, state management, and placeholder UI.

#### Implementation Steps

1. Create file `src/components/ItemCapture/editors/ImageRotator.tsx`

2. Add 'use client' directive at the top (required for client-side component)

3. Add lazy-loading documentation comment:
   ```typescript
   // This component is lazy-loaded only when user enters edit mode
   // Import via: const ImageRotator = dynamic(() => import('./editors/ImageRotator'), { ssr: false });
   ```

4. Define component props interface:
   ```typescript
   export interface ImageRotatorProps {
     imageSrc: string | Blob | File;
     initialRotation?: RotationDegrees;
     onRotationComplete: (rotatedBlob: Blob, rotation: RotationDegrees) => void;
     onCancel: () => void;
     outputFormat?: 'image/jpeg' | 'image/png';
     outputQuality?: number;
     className?: string;
     showProcessingIndicator?: boolean;
   }
   ```

5. Create component with internal state:
   ```typescript
   interface ImageRotatorState {
     currentRotation: RotationDegrees;
     isAnimating: boolean;
     isProcessing: boolean;
     error: string | null;
     imageUrl: string | null;
   }
   ```

6. Initialize state with default values:
   - `currentRotation`: `initialRotation ?? 0`
   - `isAnimating`: `false`
   - `isProcessing`: `false`
   - `error`: `null`
   - `imageUrl`: `null`

7. Return placeholder JSX structure with:
   - Container div with className prop
   - Image preview area (placeholder)
   - Rotation controls area (placeholder)
   - Action buttons area (placeholder)

8. Export as default export to match ImageCropper pattern

#### Verification Steps

- [ ] File created at `src/components/ItemCapture/editors/ImageRotator.tsx`
- [ ] Component renders without errors in dev mode
- [ ] Props interface includes all required properties
- [ ] TypeScript compiles without errors: `npx tsc --noEmit`
- [ ] Component accepts `className` prop
- [ ] Default export matches pattern from `ImageCropper.tsx`

---

### Task 3: Implement Image Source Handling
**Estimated Effort:** 1 story point
**Depends On:** Task 2
**File:** `src/components/ItemCapture/editors/ImageRotator.tsx`

#### Description
Handle different image source types (string URL, Blob, File) and manage object URL lifecycle properly.

#### Implementation Steps

1. Add `useEffect` hook for image URL management:
   - If `imageSrc` is a string, use it directly
   - If `imageSrc` is a Blob or File, create object URL via `URL.createObjectURL()`
   - Store the URL in `imageUrl` state

2. Add cleanup effect:
   ```typescript
   useEffect(() => {
     return () => {
       if (imageUrl && imageUrl.startsWith('blob:')) {
         URL.revokeObjectURL(imageUrl);
       }
     };
   }, [imageUrl]);
   ```

3. Add `useRef` to track URLs that need cleanup:
   ```typescript
   const urlsToCleanup = useRef<string[]>([]);
   ```

4. Update cleanup to revoke all tracked URLs on unmount

5. Add error handling for URL creation failures:
   - Catch exceptions from `URL.createObjectURL()`
   - Set error state with user-friendly message
   - Log detailed error for debugging

6. Add loading state while image is being prepared

#### Verification Steps

- [ ] Component accepts `imageSrc` as string URL
- [ ] Component accepts `imageSrc` as Blob
- [ ] Component accepts `imageSrc` as File
- [ ] Object URLs are created for Blob/File sources
- [ ] Object URLs are revoked on unmount (check browser memory in DevTools)
- [ ] Error state is set when URL creation fails
- [ ] No memory leaks when component unmounts (verify in DevTools Memory tab)

---

### Task 4: Implement Image Preview with CSS Rotation
**Estimated Effort:** 1 story point
**Depends On:** Task 3
**File:** `src/components/ItemCapture/editors/ImageRotator.tsx`

#### Description
Display the image with CSS-based rotation preview using Tailwind transitions.

#### Implementation Steps

1. Import `cn` utility from `@/lib/utils`

2. Create image container with rotation classes:
   ```tsx
   <div className={cn(
     "relative overflow-hidden flex items-center justify-center",
     "bg-gray-100 rounded-lg"
   )}>
     <div className={cn(
       "motion-safe:transition-transform motion-safe:duration-300 ease-in-out",
       {
         "rotate-0": currentRotation === 0,
         "rotate-90": currentRotation === 90,
         "rotate-180": currentRotation === 180,
         "-rotate-90": currentRotation === 270,
       }
     )}>
       <img
         src={imageUrl}
         alt="Preview"
         className="max-w-full max-h-full object-contain"
       />
     </div>
   </div>
   ```

3. Handle container sizing:
   - Use `aspect-square` or dynamic aspect ratio
   - Ensure rotated image fits within container
   - Apply padding/margin for visual balance

4. Add will-change for smoother animations:
   ```typescript
   style={{ willChange: 'transform' }}
   ```

5. Handle image load state:
   - Show loading spinner while image loads
   - Hide image until loaded to prevent flash
   - Set error state if image fails to load

6. Add `onLoad` and `onError` handlers to img element

#### Verification Steps

- [ ] Image displays at initial rotation
- [ ] CSS transition applies smoothly when rotation changes
- [ ] Image rotates visually in 90-degree increments
- [ ] Container properly contains rotated image
- [ ] `prefers-reduced-motion` is respected (use `motion-safe:` prefix)
- [ ] Loading state displays while image loads
- [ ] Error message displays if image fails to load

---

### Task 5: Implement Rotation Control Buttons
**Estimated Effort:** 1 story point
**Depends On:** Task 4
**File:** `src/components/ItemCapture/editors/ImageRotator.tsx`

#### Description
Add rotate left and rotate right buttons with Lucide icons and proper touch targets.

#### Implementation Steps

1. Import icons from lucide-react:
   ```typescript
   import { RotateCcw, RotateCw } from 'lucide-react';
   ```

2. Create rotation handler functions:
   ```typescript
   const handleRotateLeft = () => {
     if (isAnimating || isProcessing) return;
     setIsAnimating(true);
     setCurrentRotation(calculateNextRotation(currentRotation, 'left'));
   };

   const handleRotateRight = () => {
     if (isAnimating || isProcessing) return;
     setIsAnimating(true);
     setCurrentRotation(calculateNextRotation(currentRotation, 'right'));
   };
   ```

3. Add animation timing handler:
   ```typescript
   useEffect(() => {
     if (isAnimating) {
       const timer = setTimeout(() => {
         setIsAnimating(false);
       }, 300); // Match CSS transition duration
       return () => clearTimeout(timer);
     }
   }, [isAnimating, currentRotation]);
   ```

4. Create button components with:
   - Minimum 48x48px touch target size
   - Visual disabled state when animating/processing
   - Accessible labels via `aria-label`
   - Icon centered with appropriate size (24x24 recommended)

5. Button JSX structure:
   ```tsx
   <button
     onClick={handleRotateLeft}
     disabled={isAnimating || isProcessing}
     aria-label="Rotate image left 90 degrees"
     className={cn(
       "p-3 rounded-full transition-colors",
       "min-w-[48px] min-h-[48px]",
       "bg-gray-100 hover:bg-gray-200",
       "disabled:opacity-50 disabled:cursor-not-allowed",
       "focus:outline-none focus:ring-2 focus:ring-blue-500"
     )}
   >
     <RotateCcw className="w-6 h-6" />
   </button>
   ```

6. Layout buttons horizontally with appropriate spacing

#### Verification Steps

- [ ] Rotate left button displays with `RotateCcw` icon
- [ ] Rotate right button displays with `RotateCw` icon
- [ ] Buttons are minimum 48x48px for touch accessibility
- [ ] Clicking rotate left decreases rotation by 90 degrees
- [ ] Clicking rotate right increases rotation by 90 degrees
- [ ] Buttons are disabled during animation
- [ ] Buttons have accessible labels
- [ ] Keyboard focus is visible on buttons
- [ ] Buttons are disabled during processing

---

### Task 6: Implement Cancel and Apply Actions
**Estimated Effort:** 1 story point
**Depends On:** Task 5
**File:** `src/components/ItemCapture/editors/ImageRotator.tsx`

#### Description
Add Cancel and Apply buttons that call parent callbacks and process the final rotation.

#### Implementation Steps

1. Create cancel handler:
   ```typescript
   const handleCancel = () => {
     // Cleanup any created URLs
     urlsToCleanup.current.forEach(url => {
       if (url.startsWith('blob:')) {
         URL.revokeObjectURL(url);
       }
     });
     onCancel();
   };
   ```

2. Create apply handler:
   ```typescript
   const handleApply = async () => {
     if (isProcessing || !imageUrl) return;

     setIsProcessing(true);
     setError(null);

     try {
       // If no rotation applied, return original
       if (currentRotation === 0) {
         // Convert string URL to Blob if needed
         const blob = await fetchAsBlob(imageSrc);
         onRotationComplete(blob, 0);
         return;
       }

       // Fetch original as blob if string URL
       const sourceBlob = await fetchAsBlob(imageSrc);

       // Apply rotation
       const rotatedBlob = await rotateImage(
         sourceBlob,
         currentRotation,
         outputFormat ?? 'image/jpeg',
         outputQuality ?? 0.92
       );

       onRotationComplete(rotatedBlob, currentRotation);
     } catch (err) {
       setError(err instanceof Error ? err.message : 'Failed to rotate image');
       setIsProcessing(false);
     }
   };
   ```

3. Add helper function to convert any source to Blob:
   ```typescript
   async function fetchAsBlob(src: string | Blob | File): Promise<Blob> {
     if (src instanceof Blob) return src;
     const response = await fetch(src);
     return response.blob();
   }
   ```

4. Create action buttons:
   - Cancel: Secondary style, calls `handleCancel`
   - Apply: Primary style, calls `handleApply`, shows loading state

5. Button layout at bottom of component

#### Verification Steps

- [ ] Cancel button calls `onCancel` prop
- [ ] Apply button processes rotation and calls `onRotationComplete`
- [ ] Apply shows loading/processing indicator
- [ ] If rotation is 0, original blob is returned without processing
- [ ] Error is displayed if processing fails
- [ ] Buttons are disabled during processing
- [ ] Object URLs are cleaned up on cancel

---

### Task 7: Add Error Handling and Display
**Estimated Effort:** 0.5 story point
**Depends On:** Task 6
**File:** `src/components/ItemCapture/editors/ImageRotator.tsx`

#### Description
Implement comprehensive error handling with user-friendly error messages.

#### Implementation Steps

1. Add error display component:
   ```tsx
   {error && (
     <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
       <p className="text-sm">{error}</p>
     </div>
   )}
   ```

2. Create error message constants:
   ```typescript
   const ERROR_MESSAGES = {
     IMAGE_LOAD_FAILED: 'Failed to load image. Please try again.',
     ROTATION_FAILED: 'Failed to rotate image. Please try again.',
     CANVAS_UNAVAILABLE: 'Your browser does not support image editing.',
     MEMORY_ERROR: 'Not enough memory to process image. Try closing other tabs.',
   } as const;
   ```

3. Handle specific error cases in `rotateImage`:
   - Canvas context unavailable
   - Blob creation failure
   - Memory allocation errors

4. Add retry capability:
   - "Try Again" button that clears error and resets state
   - Fallback quality option if high-quality fails

5. Disable rotation controls when in error state

#### Verification Steps

- [ ] Error message displays in styled container
- [ ] Error is cleared when user retries
- [ ] Specific error messages for different failure types
- [ ] Rotation controls disabled when error present
- [ ] User can dismiss/retry after error

---

### Task 8: Implement Accessibility Features
**Estimated Effort:** 0.5 story point
**Depends On:** Task 7
**File:** `src/components/ItemCapture/editors/ImageRotator.tsx`

#### Description
Add comprehensive accessibility support for keyboard navigation and screen readers.

#### Implementation Steps

1. Add keyboard shortcuts:
   ```typescript
   useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
       if (isProcessing) return;

       if (e.key === 'ArrowLeft' && !e.ctrlKey && !e.metaKey) {
         handleRotateLeft();
       } else if (e.key === 'ArrowRight' && !e.ctrlKey && !e.metaKey) {
         handleRotateRight();
       } else if (e.key === 'Escape') {
         handleCancel();
       } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
         handleApply();
       }
     };

     window.addEventListener('keydown', handleKeyDown);
     return () => window.removeEventListener('keydown', handleKeyDown);
   }, [isProcessing, currentRotation]);
   ```

2. Add ARIA attributes:
   - `role="region"` on main container
   - `aria-label="Image rotation editor"` on container
   - `aria-live="polite"` on status messages
   - `aria-busy` on processing state

3. Add screen reader announcements:
   - Announce rotation change: "Image rotated to {degrees} degrees"
   - Announce processing: "Processing rotation..."
   - Announce completion: "Rotation applied successfully"

4. Add focus management:
   - Focus first interactive element on mount
   - Return focus appropriately on close

5. Add visual focus indicators (already in button styles)

#### Verification Steps

- [ ] Arrow left/right keys rotate image
- [ ] Escape key cancels
- [ ] Ctrl/Cmd+Enter applies rotation
- [ ] Screen reader announces rotation changes
- [ ] Focus is managed appropriately
- [ ] All interactive elements are keyboard accessible
- [ ] ARIA labels are present and accurate

---

### Task 9: Add Processing Indicator
**Estimated Effort:** 0.5 story point
**Depends On:** Task 6
**File:** `src/components/ItemCapture/editors/ImageRotator.tsx`

#### Description
Show visual feedback during canvas processing operations.

#### Implementation Steps

1. Create processing overlay component:
   ```tsx
   {isProcessing && (
     <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
       <div className="flex flex-col items-center gap-2">
         <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
         <span className="text-sm text-gray-600">Applying rotation...</span>
       </div>
     </div>
   )}
   ```

2. Conditionally show based on `showProcessingIndicator` prop (default: true)

3. Position overlay over image preview area

4. Disable all interactions during processing

5. Add minimum processing time (300ms) to prevent flash for fast operations

#### Verification Steps

- [ ] Processing indicator appears during rotation processing
- [ ] Indicator overlays the image preview
- [ ] All buttons disabled during processing
- [ ] Indicator disappears after processing completes
- [ ] `showProcessingIndicator={false}` hides the indicator

---

### Task 10: Update Exports and Types
**Estimated Effort:** 0.5 story point
**Depends On:** Task 9
**Files:** Multiple

#### Description
Export the new component and types from the ItemCapture module.

#### Implementation Steps

1. Check if `src/components/ItemCapture/index.ts` exists:
   - If exists, add export for ImageRotator
   - If not, create with exports

2. Add to index.ts:
   ```typescript
   // Lazy-loaded editors (use dynamic import)
   export { default as ImageRotator } from './editors/ImageRotator';
   export type { ImageRotatorProps } from './editors/ImageRotator';
   ```

3. Check if `src/components/ItemCapture/ItemCapture.types.ts` exists:
   - If exists, add RotationDegrees type if not present
   - If not, types can remain in rotationUtils.ts

4. Add RotationDegrees to types file if centralized types exist:
   ```typescript
   export type RotationDegrees = 0 | 90 | 180 | 270;
   ```

5. Ensure all exports are properly documented with JSDoc

#### Verification Steps

- [ ] `ImageRotator` is exported from index
- [ ] `ImageRotatorProps` type is exported
- [ ] `RotationDegrees` type is available for import
- [ ] TypeScript compiles without errors: `npx tsc --noEmit`
- [ ] Build succeeds: `npm run build`

---

### Task 11: Manual Testing on Target Devices
**Estimated Effort:** 1 story point
**Depends On:** Task 10
**Files:** None (testing only)

#### Description
Verify the ImageRotator works correctly across all target browsers and devices.

#### Testing Checklist

**Desktop Browsers:**
- [ ] Chrome (latest) - all functionality works
- [ ] Firefox (latest) - all functionality works
- [ ] Safari (latest) - all functionality works
- [ ] Edge (latest) - all functionality works

**Mobile Browsers:**
- [ ] iOS Safari 15+ on iPhone - rotation works
- [ ] iOS Safari 15+ on iPad - rotation works
- [ ] Chrome on Android phone - rotation works
- [ ] Chrome on Android tablet - rotation works

**Functionality Tests:**
- [ ] Rotate left button works
- [ ] Rotate right button works
- [ ] Animation is smooth and completes before next action
- [ ] Multiple rotations accumulate correctly (0 -> 90 -> 180 -> 270 -> 0)
- [ ] Apply button processes and returns rotated image
- [ ] Cancel button reverts without changes
- [ ] Touch targets are appropriately sized on mobile (min 48x48)
- [ ] Keyboard navigation works (arrows, Escape, Enter)
- [ ] Screen reader announces actions

**Edge Cases:**
- [ ] Very large images (>10MB) - performance acceptable
- [ ] Portrait vs landscape images - handled correctly
- [ ] Images with transparency (PNG) - preserved
- [ ] Component unmount during processing - no errors
- [ ] Rapid button clicks - properly debounced

#### Verification Steps

- [ ] All checklist items tested and passing
- [ ] No console errors during testing
- [ ] Memory usage reasonable (check DevTools)
- [ ] Performance acceptable on mobile devices

---

## Task Execution Order

```
Task 1: Create Rotation Utility Functions
    │
    ▼
Task 2: Create ImageRotator Component Skeleton
    │
    ▼
Task 3: Implement Image Source Handling
    │
    ▼
Task 4: Implement Image Preview with CSS Rotation
    │
    ▼
Task 5: Implement Rotation Control Buttons
    │
    ▼
Task 6: Implement Cancel and Apply Actions
    │
    ├───────────────┬───────────────┐
    ▼               ▼               ▼
Task 7          Task 8          Task 9
Error          Access.         Processing
Handling                       Indicator
    │               │               │
    └───────────────┴───────────────┘
                    │
                    ▼
             Task 10: Update Exports
                    │
                    ▼
             Task 11: Manual Testing
```

**Parallelization Notes:**
- Tasks 7, 8, and 9 can be developed in parallel after Task 6
- All other tasks are sequential

---

## Estimated Total Effort

| Task | Effort |
|------|--------|
| Task 1: Rotation Utilities | 1 SP |
| Task 2: Component Skeleton | 1 SP |
| Task 3: Image Source Handling | 1 SP |
| Task 4: CSS Rotation Preview | 1 SP |
| Task 5: Rotation Buttons | 1 SP |
| Task 6: Cancel/Apply Actions | 1 SP |
| Task 7: Error Handling | 0.5 SP |
| Task 8: Accessibility | 0.5 SP |
| Task 9: Processing Indicator | 0.5 SP |
| Task 10: Exports | 0.5 SP |
| Task 11: Manual Testing | 1 SP |
| **Total** | **9 SP** |

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Covered By Task |
|---------------------|-----------------|
| Two clearly labeled buttons: rotate left/right 90 degrees | Task 5 |
| Clicking rotation button triggers smooth animated transition | Tasks 4, 5 |
| Actual rotation processed using canvas-based rendering | Tasks 1, 6 |
| Multiple rotation operations can be applied sequentially | Task 5 |
| Rotation preview animation completes before allowing next action | Task 5 |
| Confirming edits applies the rotation permanently | Task 6 |
| Canceling edits reverts the image to original orientation | Task 6 |
| Integrates with non-destructive editing state management | Task 6 (via callbacks) |

---

## References

- Overview Document: `/docs/REQ-048-implement-imagerotator-overview.md`
- Request: `/docs/gen_requests.md` - REQ-048
- Implementation Plan: `/docs/prd/item-capture-implementation-plan.md`
- Pattern Reference: `src/components/ItemCapture/editors/ImageCropper.tsx`
- Canvas API: [MDN Canvas rotate()](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rotate)
- Tailwind Transitions: [Tailwind Transition](https://tailwindcss.com/docs/transition-property)
- Lucide Icons: [Lucide Icons](https://lucide.dev/icons/)
