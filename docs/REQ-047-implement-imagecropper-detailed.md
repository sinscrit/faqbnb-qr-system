# REQ-047: Implement ImageCropper Component - Detailed Task Breakdown

**Date Created:** 2025-12-31 10:45:00 PST
**Last Modified:** 2025-12-31 10:45:00 PST
**Request Reference:** docs/gen_requests.md - Request #047
**Overview Document:** docs/REQ-047-implement-imagecropper-overview.md
**Implementation Plan Reference:** docs/prd/item-capture-implementation-plan.md
**Phase:** 4 - Editing Features
**Task ID:** 4.2
**Status:** Ready for Implementation

---

## Document Purpose

This document provides a detailed, step-by-step task breakdown for implementing the ImageCropper component. Each task is designed to be ≤ 1 story point (a few hours of focused work) and includes specific verification steps.

---

## Prerequisites

Before starting implementation, ensure the following are complete:

| Prerequisite | Status | Notes |
|--------------|--------|-------|
| Phase 1 (Foundation) | Required | Types, state machine, wizard scaffold must exist |
| Task 4.1 (useMediaEditor) | Required | Hook manages edit state for media items |
| react-image-crop v11.0.10 | Installed | Already in package.json |
| @types/react-image-crop v8.1.6 | Installed | TypeScript support available |

---

## Authorized Files for Modification

Based on the overview document, only these files may be created or modified:

### Files to Create/Modify

| File Path | Action | Purpose |
|-----------|--------|---------|
| `src/components/ItemCapture/editors/ImageCropper.tsx` | **Modify** | Replace existing spike with full implementation |
| `src/components/ItemCapture/editors/cropUtils.ts` | **Create** | Canvas crop execution utility |
| `src/components/ItemCapture/editors/imageCropper.css` | **Create** | Touch-friendly CSS overrides for react-image-crop |

### Files to Read (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `src/lib/utils.ts` | cn() utility for class merging |
| `src/components/ItemCapture/utils/pdfThumbnailGenerator.ts` | Canvas/Blob pattern reference |

---

## Task Breakdown

### Task 1: Define TypeScript Interfaces and Types
**Effort:** Small (1-2 hours)
**Dependencies:** None

#### Description
Define all TypeScript interfaces, types, and constants needed for the ImageCropper component directly in the component file or as exports.

#### Implementation Steps

1. Open `src/components/ItemCapture/editors/ImageCropper.tsx`
2. Add the `AspectRatioPreset` type definition:
   ```typescript
   export type AspectRatioPreset = 'free' | '1:1' | '4:3' | '16:9';
   ```
3. Add the `ImageCropperProps` interface with all required and optional props:
   - `imageSrc: string` (required)
   - `onCropComplete: (croppedBlob: Blob) => void` (required)
   - `onCancel: () => void` (required)
   - `initialAspectRatio?: AspectRatioPreset` (default: 'free')
   - `minWidth?: number` (default: 50)
   - `minHeight?: number` (default: 50)
   - `outputFormat?: 'image/jpeg' | 'image/png' | 'image/webp'` (default: 'image/jpeg')
   - `outputQuality?: number` (default: 0.92)
   - `className?: string`
4. Add the `ASPECT_RATIOS` constant mapping presets to numeric values:
   ```typescript
   const ASPECT_RATIOS: Record<AspectRatioPreset, number | undefined> = {
     'free': undefined,
     '1:1': 1,
     '4:3': 4 / 3,
     '16:9': 16 / 9,
   };
   ```
5. Add internal state interface for component:
   - `crop: Crop | undefined`
   - `completedCrop: PixelCrop | null`
   - `aspectRatio: AspectRatioPreset`
   - `isProcessing: boolean`
   - `previewUrl: string | null`
   - `error: string | null`

#### Verification Steps
- [ ] TypeScript compilation passes with no errors (`npx tsc --noEmit`)
- [ ] `AspectRatioPreset` type is exported from the file
- [ ] `ImageCropperProps` interface is exported from the file
- [ ] All four aspect ratio presets are defined in `ASPECT_RATIOS`
- [ ] Default values are documented in JSDoc comments

---

### Task 2: Create Canvas-Based Crop Execution Utility
**Effort:** Medium (2-3 hours)
**Dependencies:** Task 1

#### Description
Create a utility function that executes the crop operation using the Canvas API, producing a Blob output at the correct scale.

#### Implementation Steps

1. Create new file `src/components/ItemCapture/editors/cropUtils.ts`
2. Import `PixelCrop` type from react-image-crop
3. Implement the `executeCrop` function:
   ```typescript
   export async function executeCrop(
     image: HTMLImageElement,
     crop: PixelCrop,
     outputFormat: string,
     outputQuality: number
   ): Promise<Blob>
   ```
4. Calculate scale factors between displayed and natural image size:
   - `scaleX = image.naturalWidth / image.width`
   - `scaleY = image.naturalHeight / image.height`
5. Create a canvas element sized to the cropped area at natural scale
6. Get 2D context and validate it exists (throw descriptive error if not)
7. Draw the cropped region from the source image to the canvas using `drawImage()` with 9 parameters
8. Convert canvas to blob using `canvas.toBlob()` wrapped in a Promise
9. Add error handling for null context and blob creation failure
10. Export the function as default and named export

#### Verification Steps
- [ ] File exists at `src/components/ItemCapture/editors/cropUtils.ts`
- [ ] Function accepts image, crop, format, and quality parameters
- [ ] Function returns a Promise<Blob>
- [ ] Scale calculation correctly handles natural vs displayed dimensions
- [ ] Error is thrown with descriptive message if canvas context is unavailable
- [ ] Error is thrown with descriptive message if blob creation fails
- [ ] Unit test can call function with mock image element

---

### Task 3: Implement Aspect Ratio Toolbar Component
**Effort:** Medium (2-3 hours)
**Dependencies:** Task 1

#### Description
Build the aspect ratio selection toolbar with buttons for free, 1:1, 4:3, and 16:9 presets. The toolbar should be accessible and touch-friendly.

#### Implementation Steps

1. In `src/components/ItemCapture/editors/ImageCropper.tsx`, add state for selected aspect ratio:
   ```typescript
   const [aspectRatio, setAspectRatio] = useState<AspectRatioPreset>(initialAspectRatio ?? 'free');
   ```
2. Create an array of aspect ratio options with labels:
   ```typescript
   const aspectRatioOptions: { value: AspectRatioPreset; label: string }[] = [
     { value: 'free', label: 'Free' },
     { value: '1:1', label: '1:1' },
     { value: '4:3', label: '4:3' },
     { value: '16:9', label: '16:9' },
   ];
   ```
3. Build the toolbar JSX with button group:
   - Container with flex layout and gap
   - Map over options to render buttons
   - Each button shows the label
   - Active button has distinct styling (background color change)
   - All buttons have minimum 44x44px touch target
4. Add onClick handler that:
   - Updates `aspectRatio` state
   - Resets the crop selection when aspect ratio changes
5. Use `cn()` from `@/lib/utils` for conditional class merging
6. Add ARIA labels for accessibility (`aria-pressed` for toggle state)

#### Verification Steps
- [ ] Toolbar renders with exactly 4 buttons
- [ ] Clicking a button updates the selected state visually
- [ ] Active button has distinct styling from inactive buttons
- [ ] All buttons have at least 44x44px touch target (test with DevTools)
- [ ] Buttons have `aria-pressed` attribute reflecting selection state
- [ ] Changing aspect ratio resets the crop selection

---

### Task 4: Integrate react-image-crop with Component State
**Effort:** Medium (2-3 hours)
**Dependencies:** Task 1, Task 3

#### Description
Wire up the react-image-crop library with the component's state management, including onChange and onComplete handlers.

#### Implementation Steps

1. Import required types and components from react-image-crop:
   ```typescript
   import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
   import 'react-image-crop/dist/ReactCrop.css';
   ```
2. Add state variables:
   ```typescript
   const [crop, setCrop] = useState<Crop>();
   const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
   ```
3. Create an image ref to access the HTMLImageElement:
   ```typescript
   const imageRef = useRef<HTMLImageElement>(null);
   ```
4. Create `onImageLoad` callback to set initial centered crop:
   ```typescript
   const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
     const { width, height } = e.currentTarget;
     const newCrop = centerCrop(
       makeAspectCrop(
         { unit: '%', width: 80 },
         ASPECT_RATIOS[aspectRatio] ?? 1,
         width,
         height
       ),
       width,
       height
     );
     setCrop(newCrop);
   }, [aspectRatio]);
   ```
5. Add useEffect to update aspect when `aspectRatio` state changes:
   ```typescript
   useEffect(() => {
     if (imageRef.current && crop) {
       const { width, height } = imageRef.current;
       const newCrop = centerCrop(
         makeAspectCrop(
           { unit: '%', width: crop.width },
           ASPECT_RATIOS[aspectRatio],
           width,
           height
         ),
         width,
         height
       );
       setCrop(newCrop);
     }
   }, [aspectRatio]);
   ```
6. Render ReactCrop component with:
   - `crop` and `onChange={setCrop}` for controlled state
   - `onComplete={setCompletedCrop}` to capture pixel values
   - `aspect` prop bound to `ASPECT_RATIOS[aspectRatio]`
   - `minWidth` and `minHeight` props
7. Render img inside ReactCrop with:
   - `ref={imageRef}`
   - `src={imageSrc}`
   - `onLoad={onImageLoad}`
   - `alt="Crop preview"`

#### Verification Steps
- [ ] ReactCrop component renders with the provided image
- [ ] Initial crop region is centered on image load
- [ ] Dragging crop handles updates the crop state
- [ ] Releasing handles triggers onComplete with pixel values
- [ ] Changing aspect ratio updates crop constraint
- [ ] Free-form allows any aspect ratio (no constraint)

---

### Task 5: Add Real-Time Crop Preview
**Effort:** Medium (2-3 hours)
**Dependencies:** Task 2, Task 4

#### Description
Display a real-time thumbnail preview of the cropped region as the user adjusts the crop boundaries.

#### Implementation Steps

1. Add state for preview URL:
   ```typescript
   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
   ```
2. Create a debounced preview generation function using useCallback:
   - Accept the current PixelCrop
   - Skip if crop dimensions are invalid (< 10px)
   - Create a small preview canvas (max 150px dimension)
   - Use canvas drawImage with the crop coordinates
   - Convert to blob URL and update state
3. Add useEffect with debounce to generate preview on completedCrop change:
   ```typescript
   useEffect(() => {
     const timeoutId = setTimeout(() => {
       if (completedCrop && imageRef.current) {
         generatePreview(completedCrop);
       }
     }, 150); // 150ms debounce
     return () => clearTimeout(timeoutId);
   }, [completedCrop]);
   ```
4. Add preview section to the UI:
   - Label "Preview:"
   - Container with fixed max dimensions
   - Image element displaying previewUrl
   - Placeholder when no preview available
5. Add cleanup for preview URL on unmount and when new preview is generated:
   ```typescript
   useEffect(() => {
     return () => {
       if (previewUrl) {
         URL.revokeObjectURL(previewUrl);
       }
     };
   }, [previewUrl]);
   ```

#### Verification Steps
- [ ] Preview thumbnail appears below the crop area
- [ ] Preview updates as user drags crop handles (with slight delay)
- [ ] Preview reflects the actual cropped content, not just dimensions
- [ ] Preview is not larger than 150px in either dimension
- [ ] Old preview URLs are revoked when new ones are created
- [ ] Preview URL is revoked on component unmount

---

### Task 6: Implement Apply Crop Functionality
**Effort:** Medium (2-3 hours)
**Dependencies:** Task 2, Task 4

#### Description
Implement the "Apply Crop" button that executes the crop operation and returns the cropped blob via the onCropComplete callback.

#### Implementation Steps

1. Add processing state:
   ```typescript
   const [isProcessing, setIsProcessing] = useState(false);
   ```
2. Create the handleApply async function:
   ```typescript
   const handleApply = async () => {
     if (!completedCrop || !imageRef.current) {
       return;
     }

     setIsProcessing(true);
     setError(null);

     try {
       const croppedBlob = await executeCrop(
         imageRef.current,
         completedCrop,
         outputFormat ?? 'image/jpeg',
         outputQuality ?? 0.92
       );
       onCropComplete(croppedBlob);
     } catch (err) {
       const message = err instanceof Error ? err.message : 'Crop operation failed';
       setError(message);
       console.error('Crop failed:', err);
     } finally {
       setIsProcessing(false);
     }
   };
   ```
3. Create the Apply button in the action bar:
   - Disabled when `isProcessing` or when `completedCrop` is null
   - Shows "Applying..." text when processing
   - Uses primary button styling (bg-blue-500 or similar)
   - Minimum 44x44px touch target
4. Add loading spinner or indicator when `isProcessing` is true

#### Verification Steps
- [ ] Apply button is disabled when no crop is selected
- [ ] Apply button is disabled during processing
- [ ] Button text changes to "Applying..." during processing
- [ ] Clicking Apply calls the executeCrop utility
- [ ] onCropComplete callback receives a valid Blob
- [ ] Processing state is reset after success or failure
- [ ] Error state is captured if crop fails

---

### Task 7: Implement Cancel Functionality and Error Handling
**Effort:** Small (1-2 hours)
**Dependencies:** Task 4

#### Description
Implement the cancel button and comprehensive error state handling with user-friendly messages.

#### Implementation Steps

1. Add error state:
   ```typescript
   const [error, setError] = useState<string | null>(null);
   ```
2. Create Cancel button:
   - Calls `onCancel` prop directly
   - Uses secondary button styling (gray background)
   - Disabled when `isProcessing` is true
   - Minimum 44x44px touch target
3. Add error display section:
   - Conditionally rendered when `error` is not null
   - Shows error message in red/danger styling
   - Includes a dismiss button or auto-dismiss after 5 seconds
   - Positioned above the action buttons
4. Add image load error handling:
   ```typescript
   const handleImageError = () => {
     setError('Failed to load image. Please try again.');
   };
   ```
5. Add the onError handler to the img element
6. Create error boundary or try-catch around critical operations

#### Verification Steps
- [ ] Cancel button invokes onCancel callback
- [ ] Cancel button is disabled during processing
- [ ] Error message displays when error state is set
- [ ] Error message has appropriate styling (red/danger)
- [ ] Error can be dismissed
- [ ] Image load failure shows user-friendly message
- [ ] Error state is cleared when user takes corrective action

---

### Task 8: Create Touch-Friendly CSS Overrides
**Effort:** Small (1-2 hours)
**Dependencies:** Task 4

#### Description
Create CSS overrides to enhance touch targets for the crop handles on mobile devices.

#### Implementation Steps

1. Create new file `src/components/ItemCapture/editors/imageCropper.css`
2. Add CSS to increase drag handle sizes:
   ```css
   /* Larger touch targets for crop handles */
   .ReactCrop__drag-handle {
     width: 24px !important;
     height: 24px !important;
   }

   /* Even larger handles on mobile */
   @media (max-width: 768px) {
     .ReactCrop__drag-handle {
       width: 32px !important;
       height: 32px !important;
     }
   }
   ```
3. Add CSS to prevent scroll conflicts:
   ```css
   /* Prevent touch scrolling while cropping */
   .image-cropper-container {
     touch-action: none;
   }

   /* Allow scrolling outside crop area */
   .image-cropper-wrapper {
     touch-action: pan-y;
   }
   ```
4. Add visual feedback for active handles:
   ```css
   .ReactCrop__drag-handle:active {
     background-color: rgba(59, 130, 246, 0.8) !important;
   }
   ```
5. Import the CSS file in ImageCropper.tsx:
   ```typescript
   import './imageCropper.css';
   ```
6. Apply container classes to the component wrapper elements

#### Verification Steps
- [ ] CSS file exists at `src/components/ItemCapture/editors/imageCropper.css`
- [ ] CSS is imported in ImageCropper.tsx
- [ ] Drag handles are visually larger on mobile viewport (check DevTools)
- [ ] Touch-action CSS prevents accidental page scroll during crop
- [ ] Active handle state has visual feedback
- [ ] Changes do not break desktop drag functionality

---

### Task 9: Add Processing State and Loading UI
**Effort:** Small (1-2 hours)
**Dependencies:** Task 6, Task 7

#### Description
Enhance the UI with loading states, disabled interactions during processing, and visual feedback.

#### Implementation Steps

1. Add loading overlay when `isProcessing`:
   ```jsx
   {isProcessing && (
     <div className="absolute inset-0 bg-white/75 flex items-center justify-center z-10">
       <div className="flex flex-col items-center gap-2">
         <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
         <span className="text-sm text-gray-600">Applying crop...</span>
       </div>
     </div>
   )}
   ```
2. Disable ReactCrop during processing:
   - Add `disabled` prop or pointer-events-none class
3. Disable aspect ratio buttons during processing
4. Add subtle animation to the Apply button when processing
5. Add loading state for initial image load:
   ```typescript
   const [isImageLoading, setIsImageLoading] = useState(true);
   ```
6. Show skeleton or placeholder while image loads
7. Clear loading state in onImageLoad callback

#### Verification Steps
- [ ] Loading overlay appears during crop processing
- [ ] Spinner animation is visible and properly centered
- [ ] Crop handles cannot be moved during processing
- [ ] Aspect ratio buttons are disabled during processing
- [ ] Image shows loading state before it fully loads
- [ ] All interactive elements are disabled during processing
- [ ] Processing overlay has semi-transparent background

---

### Task 10: Implement Memory Cleanup and Object URL Management
**Effort:** Small (1-2 hours)
**Dependencies:** Task 5, Task 6

#### Description
Ensure proper cleanup of Object URLs and other resources when the component unmounts or when resources are replaced.

#### Implementation Steps

1. Create a cleanup ref to track all created URLs:
   ```typescript
   const urlsToCleanup = useRef<string[]>([]);
   ```
2. Update preview URL creation to track URLs:
   ```typescript
   const newUrl = URL.createObjectURL(blob);
   urlsToCleanup.current.push(newUrl);
   // Revoke previous URL if exists
   if (previewUrl) {
     URL.revokeObjectURL(previewUrl);
   }
   setPreviewUrl(newUrl);
   ```
3. Add comprehensive cleanup on unmount:
   ```typescript
   useEffect(() => {
     return () => {
       // Revoke all tracked URLs
       urlsToCleanup.current.forEach((url) => {
         URL.revokeObjectURL(url);
       });
       // Revoke current preview if exists
       if (previewUrl) {
         URL.revokeObjectURL(previewUrl);
       }
     };
   }, []);
   ```
4. Clean up when imageSrc prop changes:
   ```typescript
   useEffect(() => {
     // Reset state when image source changes
     setCrop(undefined);
     setCompletedCrop(null);
     setPreviewUrl(null);
     setError(null);
   }, [imageSrc]);
   ```
5. Add cleanup comment documentation explaining why this is important

#### Verification Steps
- [ ] All Object URLs are revoked on component unmount
- [ ] Previous preview URLs are revoked when new ones are created
- [ ] No memory leak warnings in browser DevTools
- [ ] Component state resets properly when imageSrc changes
- [ ] Chrome DevTools Memory tab shows no growing blob references
- [ ] Console shows no warnings about revoked URLs being used

---

### Task 11: Add Responsive Layout and Mobile Optimization
**Effort:** Medium (2-3 hours)
**Dependencies:** Task 3, Task 8, Task 9

#### Description
Implement responsive layout that works well on mobile (320px minimum) through desktop viewports.

#### Implementation Steps

1. Update component container with responsive classes:
   ```jsx
   <div className={cn(
     "flex flex-col h-full",
     "px-2 sm:px-4",
     className
   )}>
   ```
2. Make toolbar responsive:
   - Stack vertically on very small screens if needed
   - Maintain horizontal layout where possible
   - Ensure buttons don't overflow
3. Constrain image container for different viewports:
   ```jsx
   <div className="relative flex-1 min-h-0 max-h-[50vh] sm:max-h-[60vh]">
   ```
4. Position preview appropriately:
   - Below image on mobile
   - Inline or side-by-side on larger screens
5. Action button layout:
   - Full-width buttons on mobile
   - Inline with gap on desktop
   ```jsx
   <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
   ```
6. Test with actual 320px viewport width

#### Verification Steps
- [ ] Component renders without horizontal overflow at 320px width
- [ ] All buttons remain tappable at smallest viewport
- [ ] Image container doesn't exceed viewport height
- [ ] Preview is visible without scrolling on mobile
- [ ] Layout adapts smoothly between breakpoints
- [ ] No content is cut off or hidden at any viewport size

---

### Task 12: Implement Large Image Handling
**Effort:** Small (1-2 hours)
**Dependencies:** Task 2, Task 4

#### Description
Add safeguards for handling large images to prevent canvas memory issues on mobile devices.

#### Implementation Steps

1. Add constant for max dimension:
   ```typescript
   const MAX_IMAGE_DIMENSION = 4096;
   ```
2. Create image dimension check in onImageLoad:
   ```typescript
   const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
     const img = e.currentTarget;

     // Check if image is too large
     if (img.naturalWidth > MAX_IMAGE_DIMENSION || img.naturalHeight > MAX_IMAGE_DIMENSION) {
       console.warn(`Large image detected: ${img.naturalWidth}x${img.naturalHeight}`);
       // Optionally show warning to user
     }

     // Continue with normal crop initialization...
   }, []);
   ```
3. Update executeCrop to handle large images:
   - Calculate if output would exceed memory limits
   - Scale down proportionally if needed
   - Maintain aspect ratio during downscaling
4. Add user warning for very large images:
   ```typescript
   {isLargeImage && (
     <div className="text-xs text-amber-600 mb-2">
       Large image detected. Output may be scaled down for compatibility.
     </div>
   )}
   ```
5. Document the memory considerations in code comments

#### Verification Steps
- [ ] Large images (>4096px) show a warning message
- [ ] Crop operation completes successfully for large images
- [ ] Output is proportionally scaled if source exceeds limits
- [ ] No canvas out-of-memory errors on mobile devices
- [ ] Aspect ratio is preserved during any scaling
- [ ] Console warning is logged for large images

---

### Task 13: Unit Tests for Crop Utilities
**Effort:** Medium (2-3 hours)
**Dependencies:** Task 2

#### Description
Write unit tests for the cropUtils.ts utility functions to ensure correct behavior.

#### Implementation Steps

1. Create test file `src/components/ItemCapture/editors/__tests__/cropUtils.test.ts`
2. Create mock HTMLImageElement for testing:
   ```typescript
   const createMockImage = (width: number, height: number, naturalWidth: number, naturalHeight: number) => {
     // Mock implementation
   };
   ```
3. Test executeCrop with valid inputs:
   - Verify returns a Blob
   - Verify blob type matches outputFormat
4. Test scale calculation:
   - Displayed 100x100, natural 200x200 should scale by 2x
   - Verify crop coordinates are scaled correctly
5. Test error handling:
   - Null canvas context
   - Blob creation failure
6. Test with different output formats:
   - image/jpeg
   - image/png
   - image/webp
7. Test quality parameter affects output size (approximately)

#### Verification Steps
- [ ] Test file exists at correct location
- [ ] All tests pass with `npm test`
- [ ] executeCrop returns valid Blob for normal inputs
- [ ] Scale calculations are correct (verified in tests)
- [ ] Error cases throw appropriate errors
- [ ] Different formats produce correct MIME types
- [ ] Tests cover edge cases (min dimensions, max dimensions)

---

### Task 14: Integration Tests for ImageCropper Component
**Effort:** Medium (2-3 hours)
**Dependencies:** Task 11, Task 13

#### Description
Write integration tests for the ImageCropper component to verify user interactions work correctly.

#### Implementation Steps

1. Create test file `src/components/ItemCapture/editors/__tests__/ImageCropper.test.tsx`
2. Set up test utilities:
   - Import testing-library/react
   - Create wrapper with necessary providers
   - Mock react-image-crop if needed
3. Test component renders with image:
   ```typescript
   test('renders image with ReactCrop', async () => {
     render(<ImageCropper imageSrc="test.jpg" onCropComplete={jest.fn()} onCancel={jest.fn()} />);
     expect(screen.getByRole('img')).toBeInTheDocument();
   });
   ```
4. Test aspect ratio buttons:
   - All four buttons render
   - Clicking changes active state
   - Free button is initially selected (default)
5. Test callback invocations:
   - onCancel called when Cancel clicked
   - onCropComplete receives Blob when Apply clicked
6. Test disabled states:
   - Apply disabled without crop selection
   - Buttons disabled during processing
7. Test error display:
   - Error message shows when error state is set

#### Verification Steps
- [ ] Test file exists at correct location
- [ ] All tests pass with `npm test`
- [ ] Component renders correctly in tests
- [ ] Aspect ratio button tests pass
- [ ] onCancel callback test passes
- [ ] Disabled state tests pass
- [ ] Tests run without warnings

---

### Task 15: Manual Device Testing and Final Polish
**Effort:** Medium (2-3 hours)
**Dependencies:** All previous tasks

#### Description
Perform comprehensive manual testing across target devices and browsers, fixing any issues found.

#### Implementation Steps

1. Create a test page or access existing test harness at `/test/item-capture`
2. Test on iOS Safari (iPhone):
   - [ ] Touch dragging works for crop handles
   - [ ] Pinch-to-zoom doesn't interfere
   - [ ] Aspect ratios apply correctly
   - [ ] Apply produces correct result
3. Test on iPad Safari:
   - [ ] Touch targets are adequate size
   - [ ] Landscape and portrait work
4. Test on Android Chrome:
   - [ ] Gesture handling is correct
   - [ ] No scroll conflicts
5. Test on Desktop browsers:
   - [ ] Chrome - mouse interactions
   - [ ] Firefox - mouse interactions
   - [ ] Safari - mouse interactions
6. Test edge cases:
   - [ ] Large images (>4MB)
   - [ ] Small images (<100KB)
   - [ ] All aspect ratios produce correct dimensions
   - [ ] Free-form allows any proportion
7. Fix any issues found during testing
8. Document any known limitations or browser-specific quirks

#### Verification Steps
- [ ] iOS Safari 15+ tested and working
- [ ] iPad Safari tested and working
- [ ] Android Chrome tested and working
- [ ] Desktop Chrome tested and working
- [ ] Desktop Firefox tested and working
- [ ] Large image handling verified
- [ ] All aspect ratios produce correct output
- [ ] No console errors during normal usage
- [ ] Component lazy-loads correctly (not in initial bundle)

---

## Definition of Done

All of the following must be true for REQ-047 to be considered complete:

- [ ] Component renders image with interactive crop overlay
- [ ] All four aspect ratio options work correctly (free, 1:1, 4:3, 16:9)
- [ ] Touch interactions work on iOS Safari 15+ and Android Chrome
- [ ] Crop preview updates in real-time as user adjusts selection
- [ ] Apply button produces correct cropped Blob
- [ ] Cancel button invokes onCancel without modifications
- [ ] No memory leaks (all object URLs revoked)
- [ ] Component lazy-loads correctly (not in initial bundle)
- [ ] Error states display user-friendly messages
- [ ] Responsive layout works from 320px to desktop widths
- [ ] Unit tests for cropUtils pass
- [ ] Integration tests for ImageCropper pass
- [ ] Manual testing on target devices completed

---

## Risk Mitigation

| Risk | Mitigation Strategy |
|------|---------------------|
| Touch gestures conflict with page scroll | Use `touch-action: none` CSS on crop container |
| Large images cause memory issues | Downscale images >4096px before processing |
| react-image-crop CSS overrides clash | Scope custom CSS with specific selectors |
| Cross-browser canvas behavior differences | Test on target browsers early (Task 15) |

---

## Task Summary

| Task # | Description | Effort | Dependencies |
|--------|-------------|--------|--------------|
| 1 | Define TypeScript Interfaces and Types | S | None |
| 2 | Create Canvas-Based Crop Execution Utility | M | Task 1 |
| 3 | Implement Aspect Ratio Toolbar Component | M | Task 1 |
| 4 | Integrate react-image-crop with Component State | M | Task 1, 3 |
| 5 | Add Real-Time Crop Preview | M | Task 2, 4 |
| 6 | Implement Apply Crop Functionality | M | Task 2, 4 |
| 7 | Implement Cancel Functionality and Error Handling | S | Task 4 |
| 8 | Create Touch-Friendly CSS Overrides | S | Task 4 |
| 9 | Add Processing State and Loading UI | S | Task 6, 7 |
| 10 | Implement Memory Cleanup and Object URL Management | S | Task 5, 6 |
| 11 | Add Responsive Layout and Mobile Optimization | M | Task 3, 8, 9 |
| 12 | Implement Large Image Handling | S | Task 2, 4 |
| 13 | Unit Tests for Crop Utilities | M | Task 2 |
| 14 | Integration Tests for ImageCropper Component | M | Task 11, 13 |
| 15 | Manual Device Testing and Final Polish | M | All |

**Total Tasks:** 15
**Effort Breakdown:** 5 Small (S), 10 Medium (M)
**Estimated Total:** 8-12 story points

---

## References

- [react-image-crop Documentation](https://github.com/DominicTobias/react-image-crop)
- [react-image-crop Demo](https://codesandbox.io/s/react-image-crop-demo-with-react-hooks-y831o)
- [MDN: Canvas toBlob](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob)
- [Implementation Plan](/docs/prd/item-capture-implementation-plan.md) - Section 4.2
- [Overview Document](/docs/REQ-047-implement-imagecropper-overview.md)
- [Existing Spike](/src/components/ItemCapture/editors/ImageCropper.tsx)
