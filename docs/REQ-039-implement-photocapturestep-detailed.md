# REQ-039: Implement PhotoCaptureStep - Detailed Task Breakdown

**Document Created:** 2025-12-31T22:15:00
**Last Modified:** 2025-12-31T15:30:00
**Implementation Status:** COMPLETE
**Overview Document:** `/docs/REQ-039-implement-photocapturestep-overview.md`
**Request Reference:** REQ-039 in `/docs/gen_requests.md`
**Implementation Plan:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 2 - Media Capture
**Task ID:** 2.4

---

## Executive Summary

This document provides granular, actionable implementation tasks for `PhotoCaptureStep`, a wizard step component enabling multi-photo capture within the Item Capture workflow. Each task is scoped to ≤1 story point (a few hours of focused work).

The PhotoCaptureStep differs from VideoCaptureStep in several key ways:
- Supports capturing **multiple photos** (vs. single video)
- Provides **haptic feedback** on capture
- Uses a **thumbnail strip** for managing captured photos
- Has a **gallery mode** for reviewing previously captured photos
- Photo capture is **instant** (vs. timed recording)

### Prerequisites

Before starting implementation, ensure the following are complete:
- REQ-031: Component directory structure
- REQ-032: State machine hook (`useItemCaptureState`)
- REQ-033: Wizard navigation scaffold
- REQ-036: `useMediaCapture` hook
- REQ-037: `CameraPreview` component

---

## Authorized Files for Modification

### Files to Create
| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/components/steps/PhotoCaptureStep.tsx` | Main component implementation |

### Files to Modify
| File Path | Modification |
|-----------|--------------|
| `src/components/ItemCapture/components/steps/index.ts` | Export PhotoCaptureStep |
| `src/components/ItemCapture/components/CaptureWizard.tsx` | Add PhotoCaptureStep to step rendering |
| `src/components/ItemCapture/ItemCapture.types.ts` | Add PhotoCaptureStep-specific types if needed |
| `src/components/ItemCapture/index.ts` | Ensure step is accessible (if needed) |

### Existing Components to Use (Do Not Modify)
| Component | Import From | Usage |
|-----------|-------------|-------|
| `CameraPreview` | `../shared/CameraPreview` | Display live camera feed |
| `StepNavigation` | `../shared/StepNavigation` | Back/Cancel/Continue buttons |
| `ProgressIndicator` | `../shared/ProgressIndicator` | Photo count display base |
| `ValidationMessage` | `../shared/ValidationMessage` | Error display |

### Hooks to Use (Do Not Modify)
| Hook | Import From | Usage |
|------|-------------|-------|
| `useMediaCapture` | `../../hooks/useMediaCapture` | Camera and photo capture APIs |
| `useItemCaptureState` | Parent component provides | Wizard state management |

### Utilities to Use (Do Not Modify)
| Utility | Import From | Usage |
|---------|-------------|-------|
| `generateUUID` | `@/lib/utils` or local function | Generate media item ID |
| `cn` | `@/lib/utils` | Class name merging |
| `generateImageThumbnail` | `../../utils/thumbnailGenerator` | Create thumbnail blob |

---

## Implementation Tasks

### Task 1: Create PhotoCaptureStep Component Shell

**Story Points:** 1
**Depends On:** REQ-036, REQ-037 (useMediaCapture, CameraPreview)
**Estimated Time:** 1-2 hours

#### Objective
Create the basic component structure with mode state management and proper TypeScript interfaces.

#### Implementation Steps

1. **Create the component file**
   - File: `src/components/ItemCapture/components/steps/PhotoCaptureStep.tsx`
   - Add `'use client'` directive at the top
   - Import React hooks: `useState`, `useEffect`, `useCallback`, `useRef`

2. **Define the PhotoCaptureMode type**
   ```typescript
   type PhotoCaptureMode = 'preview' | 'review' | 'gallery';
   ```

3. **Define the PhotoCaptureStepProps interface**
   ```typescript
   interface PhotoCaptureStepProps {
     state: ItemCaptureState;
     addMedia: (media: MediaItem) => void;
     goToStep: (step: WizardStep) => void;
     prevStep: () => void;
     config: ItemCaptureConfig;
     className?: string;
   }
   ```

4. **Define internal interfaces**
   ```typescript
   interface CapturedPhoto {
     id: string;
     blob: Blob;
     url: string;
     thumbnailUrl: string;
     capturedAt: Date;
   }

   interface PhotoCaptureError {
     code: 'CAPTURE_FAILED' | 'MAX_PHOTOS_REACHED' | 'STORAGE_FULL' | 'PERMISSION_DENIED' | 'BROWSER_NOT_SUPPORTED';
     message: string;
     recoverable: boolean;
   }
   ```

5. **Create the basic component structure**
   - Initialize mode state with default `'preview'`
   - Initialize `capturedPhoto` and `capturedPhotoUrl` as null (for current capture)
   - Initialize `capturedPhotos` as empty array (for all photos)
   - Initialize `selectedPhotoIndex` as null (for gallery mode)
   - Initialize `isCapturing` as false
   - Initialize `error` state as null
   - Set up basic layout container with Tailwind classes

6. **Set up component export**
   - Export the component as a named export

#### Acceptance Criteria
- [ ] File created at the correct path
- [ ] Component compiles without TypeScript errors
- [ ] Props interface matches the contract from overview document
- [ ] Mode state can be changed between 'preview', 'review', 'gallery'
- [ ] Component renders an empty container in each mode

#### Verification Steps
1. Import the component in a test file and verify no compile errors
2. Render the component with mock props and verify it mounts
3. Verify mode state transitions work correctly in isolation

---

### Task 2: Integrate useMediaCapture Hook

**Story Points:** 1
**Depends On:** Task 1
**Estimated Time:** 1-2 hours

#### Objective
Wire up the media capture hook for camera and photo capture functionality with proper lifecycle management.

#### Implementation Steps

1. **Import the useMediaCapture hook**
   ```typescript
   import { useMediaCapture } from '../../hooks/useMediaCapture';
   ```

2. **Destructure hook values in the component**
   ```typescript
   const {
     stream,
     isCameraActive,
     error: cameraError,
     permissionStatus,
     devices,
     facingMode,
     capabilities,
     startCamera,
     stopCamera,
     switchCamera,
     capturePhoto,
   } = useMediaCapture({
     initialFacingMode: 'environment',
     resolution: config.videoResolution || { width: 1920, height: 1080 },
   });
   ```

3. **Initialize camera on component mount**
   - Use `useEffect` with empty dependency array
   - Call `startCamera()` on mount
   - Return cleanup function that:
     - Calls `stopCamera()`
     - Revokes all object URLs from `capturedPhotos`
     - Revokes `capturedPhotoUrl` if exists

4. **Handle permission status**
   - Check `permissionStatus` for 'denied' state
   - Map camera errors to component error state
   - Show loading state when `!isCameraActive && !cameraError`

5. **Create loading state UI**
   - Center a loading spinner
   - Display "Initializing camera..." message
   - Use existing design patterns from codebase

6. **Map hook errors to component errors**
   - Create `mapHookErrorToComponentError` helper function
   - Handle permission denied, not supported, and generic errors

#### Acceptance Criteria
- [ ] Camera initializes when component mounts
- [ ] Camera stops when component unmounts
- [ ] All object URLs revoked on unmount
- [ ] Loading state displays during camera initialization
- [ ] Permission denied error displays with user guidance
- [ ] Hook error states are properly mapped to component errors

#### Verification Steps
1. Mount component and verify camera permission prompt appears
2. Grant permission and verify camera activates
3. Unmount component and verify camera stream stops
4. Deny permission and verify error message displays

---

### Task 3: Build Capture Controls UI - Preview Mode

**Story Points:** 1
**Depends On:** Task 2
**Estimated Time:** 1-2 hours

#### Objective
Create the capture controls for preview mode including capture button, camera switch, and flash indicator.

#### Implementation Steps

1. **Import required icons from Lucide React**
   ```typescript
   import { Camera, SwitchCamera, Zap, ZapOff } from 'lucide-react';
   ```

2. **Import CameraPreview component**
   ```typescript
   import { CameraPreview } from '../shared/CameraPreview';
   ```

3. **Create preview mode render section**
   - Render CameraPreview with stream prop when mode is 'preview'
   - Add container for controls overlaid on preview
   - Position controls at bottom of preview

4. **Build capture button (smartphone camera style)**
   - Large circular button (min 64x64px, recommended 72px)
   - Outer ring: `border-4 border-white rounded-full`
   - Inner circle: `bg-white rounded-full` (smaller)
   - Visual structure matches smartphone camera shutter
   - Add `onClick` handler to trigger capture
   - Add `aria-label="Capture photo"`
   - Disable during capture: `disabled={isCapturing}`

5. **Build camera switch button**
   - Positioned to the right of capture button
   - Use `SwitchCamera` icon
   - Semi-transparent background: `bg-black/50 hover:bg-black/70`
   - Only render if `devices.length > 1`
   - Add `onClick` handler to call `switchCamera()`
   - Add `aria-label="Switch camera"`

6. **Build flash indicator (informational)**
   - Positioned top-right of preview
   - Display current flash status from device capabilities
   - Use `Zap` icon for flash available, `ZapOff` for unavailable
   - Display text: "Auto", "On", "Off", or hidden if unavailable
   - Semi-transparent background: `bg-black/50`
   - Note: Browser API does not allow flash control; indicator is informational only

7. **Extract max photos from config**
   ```typescript
   const maxPhotos = config.maxPhotos ?? 10;
   ```

#### Acceptance Criteria
- [ ] Camera preview displays live feed
- [ ] Capture button is visible and styled like smartphone camera (min 64x64px)
- [ ] Camera switch button appears when multiple cameras available
- [ ] Camera switch button hidden when only one camera
- [ ] Flash indicator shows device flash status
- [ ] All buttons have proper ARIA labels
- [ ] Buttons disabled appropriately during capture

#### Verification Steps
1. Verify CameraPreview shows live video
2. Verify capture button has smartphone camera style (ring with inner circle)
3. Test with single camera - verify switch button hidden
4. Test with multiple cameras - verify switch works
5. Check flash indicator reflects device capabilities

---

### Task 4: Implement Photo Capture with Haptic Feedback

**Story Points:** 1
**Depends On:** Task 3
**Estimated Time:** 1-2 hours

#### Objective
Implement the photo capture logic with haptic feedback and visual feedback.

#### Implementation Steps

1. **Create haptic feedback helper**
   ```typescript
   const triggerHaptic = useCallback(() => {
     if (navigator.vibrate) {
       navigator.vibrate(50); // 50ms vibration
     }
   }, []);
   ```

2. **Create handleCapturePhoto function**
   ```typescript
   const handleCapturePhoto = useCallback(async () => {
     // Check max photos limit
     if (capturedPhotos.length >= maxPhotos) {
       setError({
         code: 'MAX_PHOTOS_REACHED',
         message: `Maximum of ${maxPhotos} photos reached`,
         recoverable: false,
       });
       return;
     }

     setIsCapturing(true);
     triggerHaptic();

     try {
       const photoBlob = await capturePhoto();
       if (photoBlob) {
         const photoUrl = URL.createObjectURL(photoBlob);
         setCapturedPhoto(photoBlob);
         setCapturedPhotoUrl(photoUrl);
         setMode('review');
       }
     } catch (err) {
       setError({
         code: 'CAPTURE_FAILED',
         message: 'Failed to capture photo',
         recoverable: true,
       });
     } finally {
       setIsCapturing(false);
     }
   }, [capturePhoto, capturedPhotos.length, maxPhotos, triggerHaptic]);
   ```

3. **Add visual capture feedback**
   - Flash the screen briefly white on capture
   - Use a temporary overlay: `<div className="absolute inset-0 bg-white animate-flash" />`
   - Define animation: opacity 1 → 0 over 200ms
   - Add state `showFlash` to control overlay visibility

4. **Add capture button press feedback**
   - Scale down slightly on active: `active:scale-95`
   - Add transition: `transition-transform duration-100`

5. **Add isCapturing visual state**
   - Show loading spinner inside capture button during capture
   - Or change button appearance to indicate processing

6. **Handle capture errors**
   - Try-catch around capturePhoto call
   - Set appropriate error state
   - Log error in debug mode: `if (config.debug) console.error(err)`

#### Acceptance Criteria
- [ ] Photo captures when capture button pressed
- [ ] Haptic feedback triggers on supported devices
- [ ] Visual flash feedback on capture
- [ ] Button shows capture-in-progress state
- [ ] Max photos limit enforced with error message
- [ ] Capture errors handled gracefully
- [ ] Mode transitions to 'review' after successful capture

#### Verification Steps
1. Click capture - verify photo is taken
2. Test haptic feedback on mobile device
3. Verify visual flash effect on capture
4. Capture maxPhotos photos and verify limit error
5. Verify mode changes to review after capture

---

### Task 5: Build Photo Review Screen

**Story Points:** 1
**Depends On:** Task 4
**Estimated Time:** 1-2 hours

#### Objective
Create the preview interface with accept/retake options for the just-captured photo.

#### Implementation Steps

1. **Import additional icons**
   ```typescript
   import { Check, RotateCcw } from 'lucide-react';
   ```

2. **Create review mode render section**
   - Render when mode is 'review'
   - Replace CameraPreview with captured photo display

3. **Build photo preview container**
   - Full-width container with aspect ratio preservation
   - Apply aspect ratio: `aspect-auto` or container sizing
   - Dark background: `bg-black`
   - Rounded corners: `rounded-lg`

4. **Create image element for preview**
   - Set `src` to `capturedPhotoUrl`
   - Apply styles: `w-full h-auto max-h-[60vh] object-contain`
   - Add `alt="Captured photo preview"`

5. **Build action button container**
   - Position below photo preview
   - Flex container with gap: `flex gap-4 mt-6`
   - Center buttons: `justify-center`
   - Add padding for touch safety

6. **Build Retake button (secondary)**
   - Secondary style: `bg-gray-100 hover:bg-gray-200 text-gray-700`
   - Use `RotateCcw` icon with label "Retake"
   - Minimum width: `min-w-32`
   - Padding: `px-6 py-3`
   - Add `aria-label="Discard and capture again"`

7. **Build Accept button (primary)**
   - Primary style: `bg-blue-600 hover:bg-blue-700 text-white`
   - Use `Check` icon with label "Accept"
   - Minimum width: `min-w-32`
   - Padding: `px-6 py-3`
   - Add `aria-label="Accept photo"`

8. **Create handleRetake function**
   ```typescript
   const handleRetake = useCallback(() => {
     if (capturedPhotoUrl) {
       URL.revokeObjectURL(capturedPhotoUrl);
     }
     setCapturedPhoto(null);
     setCapturedPhotoUrl(null);
     setMode('preview');
   }, [capturedPhotoUrl]);
   ```

9. **Create placeholder handleAcceptPhoto function**
   - For now, just log the acceptance
   - Will be fully implemented in Task 7
   - Set mode back to 'preview' temporarily

#### Acceptance Criteria
- [ ] Captured photo displays in review mode
- [ ] Photo maintains aspect ratio
- [ ] Retake button visible and styled correctly
- [ ] Accept button visible and styled correctly
- [ ] Retake clears photo and returns to preview mode
- [ ] Object URL revoked on retake (memory management)
- [ ] Buttons are keyboard accessible

#### Verification Steps
1. Capture photo - verify it displays in review mode
2. Click Retake - verify returns to preview mode
3. Verify old photo URL is revoked (check memory in DevTools)
4. Verify Accept button is clickable

---

### Task 6: Build Thumbnail Strip Component

**Story Points:** 1
**Depends On:** Task 5
**Estimated Time:** 2-3 hours

#### Objective
Create the multi-photo thumbnail strip for displaying and managing captured photos.

#### Implementation Steps

1. **Import additional icons**
   ```typescript
   import { X, Plus } from 'lucide-react';
   ```

2. **Create thumbnail strip container**
   - Position at bottom of preview mode screen
   - Horizontal scrollable: `overflow-x-auto`
   - Flex container: `flex gap-2`
   - Hide scrollbar: `scrollbar-hide` or custom CSS
   - Background: `bg-black/80`
   - Padding: `p-2`
   - Smooth scroll: `scroll-smooth`

3. **Create thumbnail component section**
   - Map over `capturedPhotos` array
   - For each photo, render a thumbnail:
     ```typescript
     capturedPhotos.map((photo, index) => (
       <div
         key={photo.id}
         className={cn(
           "relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden cursor-pointer",
           selectedPhotoIndex === index && "ring-2 ring-blue-500"
         )}
         onClick={() => handleThumbnailClick(index)}
       >
         <img
           src={photo.thumbnailUrl}
           alt={`Photo ${index + 1}`}
           className="w-full h-full object-cover"
         />
         <button
           onClick={(e) => handleRemovePhoto(e, index)}
           className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
           aria-label={`Remove photo ${index + 1}`}
         >
           <X className="w-3 h-3" />
         </button>
       </div>
     ))
     ```

4. **Add photo count indicator**
   - Position above or beside thumbnail strip
   - Display format: "3 / 10 photos"
   - Apply style: `text-sm text-gray-600 font-medium`
   - Change color when at max: `text-orange-500`

5. **Create add more indicator**
   - Show placeholder when under limit
   - Dashed border: `border-2 border-dashed border-gray-400`
   - Plus icon centered
   - Text: "Add more"
   - Non-interactive (just visual indicator)

6. **Create handleThumbnailClick function**
   ```typescript
   const handleThumbnailClick = useCallback((index: number) => {
     setSelectedPhotoIndex(index);
     setMode('gallery');
   }, []);
   ```

7. **Create handleRemovePhoto function**
   ```typescript
   const handleRemovePhoto = useCallback((e: React.MouseEvent, index: number) => {
     e.stopPropagation(); // Prevent triggering thumbnail click
     setCapturedPhotos(prev => {
       const photo = prev[index];
       // Revoke URLs to free memory
       URL.revokeObjectURL(photo.url);
       URL.revokeObjectURL(photo.thumbnailUrl);
       return prev.filter((_, i) => i !== index);
     });
   }, []);
   ```

8. **Show thumbnail strip only when photos exist**
   - Conditionally render: `{capturedPhotos.length > 0 && <ThumbnailStrip />}`
   - Or show empty state message

9. **Add smooth scroll behavior**
   - Auto-scroll to newest thumbnail when photo added
   - Use ref to scroll container: `thumbnailStripRef.current?.scrollTo({ left: 9999, behavior: 'smooth' })`

#### Acceptance Criteria
- [ ] Thumbnail strip appears when photos are captured
- [ ] Thumbnails display captured photos
- [ ] Photo count shows current/max
- [ ] Tapping thumbnail enters gallery mode
- [ ] Remove button deletes photo from array
- [ ] Object URLs revoked on remove
- [ ] Strip scrolls horizontally on overflow
- [ ] Visual indicator when at max photos

#### Verification Steps
1. Capture multiple photos - verify thumbnails appear
2. Verify photo count updates correctly
3. Tap thumbnail - verify gallery mode activates
4. Click remove on thumbnail - verify photo deleted
5. Scroll thumbnail strip when many photos captured
6. Reach max photos - verify visual indicator

---

### Task 7: Implement Accept Photo and Add Media Logic

**Story Points:** 1
**Depends On:** Task 6
**Estimated Time:** 1-2 hours

#### Objective
Create MediaItem from captured photo, generate thumbnail, and integrate with wizard state.

#### Implementation Steps

1. **Import required utilities**
   ```typescript
   import { generateImageThumbnail } from '../../utils/thumbnailGenerator';
   // Import or implement generateUUID
   ```

2. **Create generateUUID helper if not available**
   ```typescript
   const generateUUID = (): string => {
     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
       const r = (Math.random() * 16) | 0;
       const v = c === 'x' ? r : (r & 0x3) | 0x8;
       return v.toString(16);
     });
   };
   ```

3. **Create getImageDimensions helper**
   ```typescript
   const getImageDimensions = (blob: Blob): Promise<{ width: number; height: number }> => {
     return new Promise((resolve) => {
       const img = new Image();
       img.onload = () => {
         URL.revokeObjectURL(img.src);
         resolve({ width: img.naturalWidth, height: img.naturalHeight });
       };
       img.onerror = () => resolve({ width: 0, height: 0 });
       img.src = URL.createObjectURL(blob);
     });
   };
   ```

4. **Implement full handleAcceptPhoto function**
   ```typescript
   const handleAcceptPhoto = useCallback(async () => {
     if (!capturedPhoto || !capturedPhotoUrl) return;

     setIsCapturing(true); // Reuse for loading state

     try {
       const id = generateUUID();
       const thumbnail = await generateImageThumbnail(capturedPhoto);
       const thumbnailUrl = URL.createObjectURL(thumbnail);
       const dimensions = await getImageDimensions(capturedPhoto);

       // Add to local captured photos array
       const newPhoto: CapturedPhoto = {
         id,
         blob: capturedPhoto,
         url: capturedPhotoUrl,
         thumbnailUrl,
         capturedAt: new Date(),
       };
       setCapturedPhotos(prev => [...prev, newPhoto]);

       // Create MediaItem for wizard state
       const mediaItem: MediaItem = {
         id,
         type: 'image',
         file: capturedPhoto,
         thumbnail,
         order: state.mediaItems.filter(m => m.type === 'image').length,
         metadata: {
           dimensions,
           mimeType: capturedPhoto.type,
           fileSize: capturedPhoto.size,
           source: 'capture',
         },
       };

       // Add to wizard state
       addMedia(mediaItem);

       // Reset for next capture
       setCapturedPhoto(null);
       setCapturedPhotoUrl(null);
       setMode('preview');
     } catch (err) {
       setError({
         code: 'CAPTURE_FAILED',
         message: 'Failed to process photo',
         recoverable: true,
       });
     } finally {
       setIsCapturing(false);
     }
   }, [capturedPhoto, capturedPhotoUrl, addMedia, state.mediaItems]);
   ```

5. **Add loading state during accept**
   - Show spinner while generating thumbnail
   - Disable buttons during processing
   - Display "Processing photo..." message

6. **Keep capturedPhotoUrl alive for local display**
   - Note: We do NOT revoke capturedPhotoUrl on accept since we store it in capturedPhotos array for thumbnail strip
   - Object URLs in capturedPhotos will be revoked on unmount or on remove

#### Acceptance Criteria
- [ ] MediaItem created with correct type and fields
- [ ] UUID generated for the item
- [ ] Thumbnail generated from photo
- [ ] Dimensions extracted correctly
- [ ] addMedia callback invoked with MediaItem
- [ ] Photo added to local capturedPhotos array
- [ ] Mode returns to preview for next capture
- [ ] Loading state shown during processing

#### Verification Steps
1. Accept a photo - verify MediaItem structure in state
2. Verify thumbnail blob is created
3. Verify photo appears in thumbnail strip
4. Verify wizard state contains the media item
5. Verify mode returns to preview

---

### Task 8: Implement Gallery Mode

**Story Points:** 1
**Depends On:** Task 7
**Estimated Time:** 1-2 hours

#### Objective
Allow viewing and managing previously captured photos from the thumbnail strip.

#### Implementation Steps

1. **Import additional icons**
   ```typescript
   import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
   ```

2. **Create gallery mode render section**
   - Render when mode is 'gallery' and selectedPhotoIndex is not null
   - Full-screen overlay with dark background

3. **Build gallery container**
   - Fixed position: `fixed inset-0 z-50`
   - Dark background: `bg-black/95`
   - Flex column for layout

4. **Create gallery header**
   - Close button (X) positioned top-right
   - Photo counter: "3 of 10"
   - Delete button positioned top-left

5. **Display selected photo**
   - Get photo from `capturedPhotos[selectedPhotoIndex]`
   - Display full-size image: `<img src={photo.url} ... />`
   - Center image with padding
   - Style: `max-w-full max-h-[70vh] object-contain`

6. **Create navigation buttons (optional for V1)**
   - Left arrow to view previous photo
   - Right arrow to view next photo
   - Position on sides of image
   - Semi-transparent: `bg-black/50`
   - Disable at boundaries
   - Or implement swipe gestures for mobile

7. **Implement handleGalleryClose function**
   ```typescript
   const handleGalleryClose = useCallback(() => {
     setSelectedPhotoIndex(null);
     setMode('preview');
   }, []);
   ```

8. **Implement handleGalleryDelete function**
   ```typescript
   const handleGalleryDelete = useCallback(() => {
     if (selectedPhotoIndex === null) return;

     // Remove from local array (URL revocation handled in handleRemovePhoto)
     handleRemovePhoto(new MouseEvent('click') as any, selectedPhotoIndex);

     // Navigate to previous photo or close if no photos left
     if (capturedPhotos.length <= 1) {
       handleGalleryClose();
     } else if (selectedPhotoIndex >= capturedPhotos.length - 1) {
       setSelectedPhotoIndex(capturedPhotos.length - 2);
     }
   }, [selectedPhotoIndex, capturedPhotos.length, handleRemovePhoto, handleGalleryClose]);
   ```

9. **Implement navigation functions**
   ```typescript
   const handlePrevPhoto = useCallback(() => {
     if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
       setSelectedPhotoIndex(selectedPhotoIndex - 1);
     }
   }, [selectedPhotoIndex]);

   const handleNextPhoto = useCallback(() => {
     if (selectedPhotoIndex !== null && selectedPhotoIndex < capturedPhotos.length - 1) {
       setSelectedPhotoIndex(selectedPhotoIndex + 1);
     }
   }, [selectedPhotoIndex, capturedPhotos.length]);
   ```

10. **Add keyboard navigation**
    - Listen for Escape key to close
    - Listen for Left/Right arrows for navigation
    - Use effect to add/remove event listeners

#### Acceptance Criteria
- [ ] Gallery mode displays when thumbnail tapped
- [ ] Full-size photo displays correctly
- [ ] Close button returns to preview mode
- [ ] Delete button removes photo and updates gallery
- [ ] Navigation works between photos (if implemented)
- [ ] Keyboard navigation works (Escape to close)
- [ ] Gallery closes properly when last photo deleted

#### Verification Steps
1. Tap thumbnail - verify gallery opens
2. Click close - verify returns to preview
3. Click delete - verify photo removed
4. Navigate between photos (if implemented)
5. Press Escape - verify gallery closes
6. Delete all photos - verify gallery closes

---

### Task 9: Implement Step Navigation Integration

**Story Points:** 1
**Depends On:** Task 8
**Estimated Time:** 1 hour

#### Objective
Integrate with StepNavigation component for wizard flow control.

#### Implementation Steps

1. **Import StepNavigation**
   ```typescript
   import { StepNavigation } from '../shared/StepNavigation';
   ```

2. **Determine next step logic**
   - If photos captured: "Continue" button active
   - If no photos: Show "Skip" button
   - Back button always available

3. **Create handleContinue function**
   ```typescript
   const handleContinue = useCallback(() => {
     // Stop camera before navigating
     stopCamera();
     goToStep('add-more');
   }, [stopCamera, goToStep]);
   ```

4. **Create handleBack function**
   ```typescript
   const handleBack = useCallback(() => {
     stopCamera();
     prevStep();
   }, [stopCamera, prevStep]);
   ```

5. **Render StepNavigation at bottom of component**
   ```typescript
   <StepNavigation
     onPrevious={handleBack}
     onNext={handleContinue}
     previousLabel="Back"
     nextLabel={capturedPhotos.length > 0 ? "Continue" : "Skip"}
     nextDisabled={false}
   />
   ```

6. **Hide StepNavigation in review and gallery modes**
   - Only show when mode is 'preview'
   - Or show with modified behavior in other modes

7. **Handle cancel flow**
   - If user has captured photos, confirm before discarding
   - Or allow seamless navigation with photos preserved

#### Acceptance Criteria
- [ ] StepNavigation renders in preview mode
- [ ] Back button returns to previous step
- [ ] Continue/Skip button advances to next step
- [ ] Camera stops before navigation
- [ ] Button label changes based on photo count
- [ ] Navigation hidden in review/gallery modes

#### Verification Steps
1. Click Back - verify returns to content-type step
2. Click Skip (no photos) - verify advances to add-more
3. Capture photos, click Continue - verify advances to add-more
4. Verify camera stops on navigation

---

### Task 10: Implement Error Handling and Edge Cases

**Story Points:** 1
**Depends On:** Task 9
**Estimated Time:** 1-2 hours

#### Objective
Handle error states and edge cases gracefully with user-friendly messaging.

#### Implementation Steps

1. **Import error icon**
   ```typescript
   import { AlertCircle } from 'lucide-react';
   ```

2. **Create error guidance helper**
   ```typescript
   const getErrorGuidance = (code: string): string => {
     switch (code) {
       case 'PERMISSION_DENIED':
         return 'Please enable camera access in your browser settings to capture photos.';
       case 'BROWSER_NOT_SUPPORTED':
         return 'Your browser does not support photo capture. Please try Chrome, Safari, or Firefox.';
       case 'CAPTURE_FAILED':
         return 'Photo capture failed. Please check your camera and try again.';
       case 'MAX_PHOTOS_REACHED':
         return `You have reached the maximum of ${maxPhotos} photos. Remove a photo to add more.`;
       case 'STORAGE_FULL':
         return 'Device storage is full. Please free up space and try again.';
       default:
         return 'An unexpected error occurred. Please try again.';
     }
   };
   ```

3. **Create error display component section**
   - Render when `error` state is not null
   - Center the error content
   - Show AlertCircle icon in red
   - Display error message as heading
   - Display guidance text below
   - Add "Try Again" button if error is recoverable

4. **Handle max photos limit**
   - Check before capture
   - Show clear message when limit reached
   - Suggest removing photos to continue
   - Disable capture button at limit

5. **Handle camera switch on single camera**
   - Button already hidden (Task 3)
   - Add fallback protection
   - Log warning if switchCamera called with single camera

6. **Handle interrupted capture**
   - If page visibility changes during capture
   - Gracefully handle and show warning
   - No permanent state corruption

7. **Add retry mechanism**
   ```typescript
   const handleRetry = useCallback(() => {
     setError(null);
     startCamera();
   }, [startCamera]);
   ```

8. **Memory management**
   - Monitor total blob size
   - Warn if approaching storage limits
   - Aggressive cleanup on errors

#### Acceptance Criteria
- [ ] Permission denied shows helpful message with settings guidance
- [ ] Browser not supported shows alternative browser suggestions
- [ ] Capture failures display recoverable error with retry option
- [ ] Max photos limit shows clear message with removal suggestion
- [ ] Retry button clears error and restarts camera
- [ ] No memory leaks on errors

#### Verification Steps
1. Deny camera permission - verify error message
2. Test on unsupported browser - verify message
3. Reach max photos - verify limit error
4. Click retry - verify recovery works
5. Check memory after capturing many photos

---

### Task 11: Implement Accessibility and Polish

**Story Points:** 1
**Depends On:** Task 10
**Estimated Time:** 1-2 hours

#### Objective
Ensure WCAG compliance and add visual polish with smooth transitions.

#### Implementation Steps

1. **Add comprehensive ARIA labels**
   - Review all interactive elements
   - Add `aria-label` where icon-only buttons exist
   - Add `role="img"` to photo displays with alt text
   - Add `role="listbox"` to thumbnail strip
   - Add `role="option"` to individual thumbnails

2. **Implement keyboard navigation**
   - Ensure all buttons are in tab order
   - Add visible focus indicators: `focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`
   - Handle Escape key in gallery mode
   - Handle Enter/Space for all buttons

3. **Add screen reader announcements**
   - Announce when photo captured: "Photo captured. Review or retake."
   - Announce when photo accepted: "Photo added to collection."
   - Announce when photo deleted: "Photo removed."
   - Announce errors when they occur
   - Use ARIA live regions: `aria-live="polite"`

4. **Add loading spinner component**
   - Create or import spinner component
   - Display during camera initialization
   - Display during accept processing
   - Center with proper sizing
   - Add `aria-label="Loading"`

5. **Implement smooth mode transitions**
   - Add CSS transitions for mode changes
   - Fade in/out between modes
   - Use `transition-opacity duration-200`

6. **Add visual feedback for interactions**
   - Button press states: `active:scale-95`
   - Capture button animation on capture
   - Success feedback on accept (green check briefly)

7. **Polish the layout for mobile**
   - Verify touch targets meet 48px minimum
   - Test on various screen sizes
   - Add safe area padding for notched devices: `pb-safe`

8. **Photo capture animation**
   - White flash overlay on capture (already in Task 4)
   - Ensure timing feels natural (150-200ms)
   - Sound effect (optional - usually disabled on web)

#### Acceptance Criteria
- [ ] All buttons have ARIA labels
- [ ] Keyboard navigation works throughout
- [ ] Focus indicators visible on all interactive elements
- [ ] Screen readers announce state changes
- [ ] Mode transitions are smooth
- [ ] Loading states have accessible announcements
- [ ] Touch targets meet minimum size requirements (48px)

#### Verification Steps
1. Navigate entire component with keyboard only
2. Test with VoiceOver (macOS) or NVDA (Windows)
3. Verify focus visible on all interactive elements
4. Test mode transitions are visually smooth
5. Test on mobile device for touch targets

---

### Task 12: Export and Integration

**Story Points:** 0.5
**Depends On:** Task 11
**Estimated Time:** 30 minutes

#### Objective
Export the component and integrate it into the wizard flow.

#### Implementation Steps

1. **Update steps index.ts**
   - File: `src/components/ItemCapture/components/steps/index.ts`
   - Add export: `export { PhotoCaptureStep } from './PhotoCaptureStep';`

2. **Update CaptureWizard.tsx**
   - Import PhotoCaptureStep
   - Add case for 'capture-photo' step in switch/conditional rendering
   - Pass required props: state, addMedia, goToStep, prevStep, config

3. **Update main index.ts if needed**
   - File: `src/components/ItemCapture/index.ts`
   - Ensure types are exported if not already

4. **Verify TypeScript compilation**
   - Run `npm run type-check`
   - Fix any type errors

5. **Test in development**
   - Run `npm run dev`
   - Navigate to photo capture step
   - Verify end-to-end flow

#### Acceptance Criteria
- [ ] PhotoCaptureStep exported from steps/index.ts
- [ ] CaptureWizard renders PhotoCaptureStep for capture-photo step
- [ ] No TypeScript errors
- [ ] Component accessible in wizard flow
- [ ] End-to-end capture flow works

#### Verification Steps
1. Import PhotoCaptureStep from steps/index.ts - no errors
2. Navigate to photo capture in wizard
3. Complete full capture → review → accept flow
4. Verify media added to state

---

### Task 13: Write Unit Tests for Mode Transitions

**Story Points:** 1
**Depends On:** Task 12
**Estimated Time:** 1-2 hours

#### Objective
Create unit tests verifying mode state transitions, capture logic, and thumbnail strip behavior.

#### Implementation Steps

1. **Create test file**
   - File: `src/components/ItemCapture/components/steps/__tests__/PhotoCaptureStep.test.tsx`

2. **Set up test utilities**
   - Import testing-library/react
   - Import jest mocks for MediaDevices
   - Create mock implementations for useMediaCapture

3. **Test mode transitions**
   - Test: preview → review (on capture)
   - Test: review → preview (on retake)
   - Test: review → preview (on accept)
   - Test: preview → gallery (on thumbnail click)
   - Test: gallery → preview (on close)

4. **Test capture logic**
   - Test: capturePhoto called on button click
   - Test: haptic feedback triggered (navigator.vibrate called)
   - Test: error displayed on capture failure
   - Test: max photos limit enforced

5. **Test thumbnail strip**
   - Test: thumbnail appears after accept
   - Test: photo count updates correctly
   - Test: remove button deletes photo
   - Test: object URLs revoked on remove

6. **Test gallery mode**
   - Test: gallery displays selected photo
   - Test: close button exits gallery
   - Test: delete removes photo and updates navigation
   - Test: keyboard navigation (Escape to close)

7. **Test MediaItem creation**
   - Test: accept creates MediaItem with correct fields
   - Test: addMedia callback invoked with MediaItem
   - Test: thumbnail generated for MediaItem

8. **Mock capturePhoto to return test blob**
   ```typescript
   const mockCapturePhoto = jest.fn().mockResolvedValue(
     new Blob(['test'], { type: 'image/jpeg' })
   );
   ```

#### Acceptance Criteria
- [ ] Tests for all mode transitions pass
- [ ] Tests for capture logic pass
- [ ] Tests for thumbnail strip pass
- [ ] Tests for gallery mode pass
- [ ] Tests for MediaItem creation pass
- [ ] Test coverage meets project standards
- [ ] All tests use mocked media APIs (no actual camera access)

#### Verification Steps
1. Run `npm test -- PhotoCaptureStep`
2. Verify all tests pass
3. Check coverage report for gaps
4. Run full test suite - no regressions

---

### Task 14: Write Integration Tests

**Story Points:** 1
**Depends On:** Task 13
**Estimated Time:** 1-2 hours

#### Objective
Create integration tests verifying the component works correctly within the wizard context.

#### Implementation Steps

1. **Create integration test file**
   - File: `src/components/ItemCapture/__tests__/PhotoCaptureStep.integration.test.tsx`

2. **Test wizard integration**
   - Test: component receives correct props from wizard
   - Test: addMedia correctly adds to wizard state
   - Test: goToStep navigates within wizard
   - Test: prevStep returns to content-type selection

3. **Test with mocked useMediaCapture**
   - Mock the hook to return controlled stream
   - Mock capturePhoto to return a test blob
   - Mock thumbnail generation

4. **Test full multi-photo capture flow**
   - Render wizard at capture-photo step
   - Capture first photo (mocked)
   - Accept photo
   - Verify photo in thumbnail strip
   - Capture second photo
   - Accept second photo
   - Verify both photos in thumbnail strip
   - Click Continue
   - Verify navigation to next step
   - Verify both media items in wizard state

5. **Test retake flow**
   - Capture photo
   - Click retake
   - Verify returns to preview
   - Verify no media added

6. **Test gallery delete flow**
   - Capture multiple photos
   - Open gallery
   - Delete photo
   - Verify photo removed from state
   - Close gallery
   - Verify thumbnail strip updated

7. **Test error recovery flow**
   - Mock permission denied
   - Verify error UI renders
   - Mock permission grant on retry
   - Verify recovery works

#### Acceptance Criteria
- [ ] Wizard integration tests pass
- [ ] Full multi-photo capture flow test passes
- [ ] Retake flow test passes
- [ ] Gallery delete flow test passes
- [ ] Error recovery test passes
- [ ] No actual media devices used in tests

#### Verification Steps
1. Run integration tests
2. Verify all assertions pass
3. Check for test isolation (no shared state)
4. Verify mocks properly reset between tests

---

### Task 15: Manual Testing and Cross-Browser Verification

**Story Points:** 1
**Depends On:** Task 14
**Estimated Time:** 2-3 hours

#### Objective
Perform comprehensive manual testing across target browsers and devices.

#### Testing Matrix

| Device/Browser | Test Items |
|----------------|------------|
| iOS Safari 15+ (iPhone) | All acceptance criteria |
| iOS Safari 15+ (iPad) | All acceptance criteria |
| Chrome Android (phone) | All acceptance criteria |
| Chrome Android (tablet) | All acceptance criteria |
| Chrome Desktop | All acceptance criteria |
| Firefox Desktop | All acceptance criteria |
| Edge Desktop | All acceptance criteria |

#### Test Scenarios

1. **Camera permission grant flow**
   - Fresh session (no prior permission)
   - Permission already granted
   - Permission denied then granted

2. **Single photo capture**
   - Capture photo
   - Review photo
   - Accept photo
   - Verify in thumbnail strip

3. **Multiple photo capture**
   - Capture 5 photos sequentially
   - Verify all appear in thumbnail strip
   - Verify photo count correct

4. **Retake flow**
   - Capture photo
   - Click retake
   - Capture new photo
   - Accept
   - Verify correct photo saved

5. **Gallery mode**
   - Capture 3+ photos
   - Tap thumbnail to open gallery
   - Navigate between photos (if implemented)
   - Delete photo from gallery
   - Close gallery
   - Verify state correct

6. **Camera switching**
   - Switch to front camera
   - Capture photo
   - Switch to back camera
   - Capture photo
   - Verify both photos captured correctly

7. **Haptic feedback**
   - Test on device that supports vibration
   - Verify haptic on capture button press

8. **Max photos limit**
   - Set maxPhotos to 3 (via config)
   - Capture 3 photos
   - Verify capture disabled or error shown

9. **Error scenarios**
   - Camera permission denied
   - Camera already in use by another app
   - Test retry functionality

10. **Navigation**
    - Back button during capture
    - Skip button with no photos
    - Continue button with photos

#### Acceptance Criteria
- [ ] All scenarios pass on iOS Safari
- [ ] All scenarios pass on Chrome Android
- [ ] All scenarios pass on desktop browsers
- [ ] Haptic feedback works on supported devices
- [ ] No memory leaks detected
- [ ] No console errors in production mode
- [ ] Photo quality acceptable

#### Verification Steps
1. Complete each test scenario
2. Document any issues found
3. File bugs for issues
4. Re-test after fixes
5. Sign off on all browsers

---

## Task Dependency Graph

```
Task 1: Component Shell
    │
    ▼
Task 2: Hook Integration
    │
    ▼
Task 3: Capture Controls (Preview Mode)
    │
    ▼
Task 4: Photo Capture with Haptic
    │
    ▼
Task 5: Photo Review Screen
    │
    ▼
Task 6: Thumbnail Strip
    │
    ▼
Task 7: Accept/Add Logic
    │
    ▼
Task 8: Gallery Mode
    │
    ▼
Task 9: Step Navigation
    │
    ▼
Task 10: Error Handling
    │
    ▼
Task 11: Accessibility
    │
    ▼
Task 12: Export & Integration
    │
    ├──────────────────┐
    ▼                  ▼
Task 13: Unit Tests   Task 14: Integration Tests
    │                  │
    └────────┬─────────┘
             ▼
     Task 15: Manual Testing
```

---

## Summary

| Task | Title | Story Points | Depends On |
|------|-------|--------------|------------|
| 1 | Create Component Shell | 1 | Prerequisites |
| 2 | Integrate useMediaCapture Hook | 1 | Task 1 |
| 3 | Build Capture Controls (Preview Mode) | 1 | Task 2 |
| 4 | Implement Photo Capture with Haptic | 1 | Task 3 |
| 5 | Build Photo Review Screen | 1 | Task 4 |
| 6 | Build Thumbnail Strip | 1 | Task 5 |
| 7 | Implement Accept/Add Logic | 1 | Task 6 |
| 8 | Implement Gallery Mode | 1 | Task 7 |
| 9 | Implement Step Navigation | 1 | Task 8 |
| 10 | Error Handling & Edge Cases | 1 | Task 9 |
| 11 | Accessibility & Polish | 1 | Task 10 |
| 12 | Export & Integration | 0.5 | Task 11 |
| 13 | Unit Tests | 1 | Task 12 |
| 14 | Integration Tests | 1 | Task 12 |
| 15 | Manual Testing | 1 | Tasks 13, 14 |
| **Total** | | **14.5** | |

---

## Key Differences from VideoCaptureStep

| Aspect | VideoCaptureStep | PhotoCaptureStep |
|--------|------------------|------------------|
| Media type | Single video | Multiple photos |
| Capture action | Start/stop recording | Instant capture |
| Duration | Timer (max 2 min) | None (instant) |
| Haptic feedback | No | Yes (on capture) |
| Review flow | Single video playback | Single photo preview |
| Multi-item | No (one video) | Yes (thumbnail strip) |
| Gallery mode | No | Yes (view previous photos) |
| Flash indicator | No | Yes (informational) |
| State complexity | Lower | Higher (array management) |

---

## References

- Overview Document: `/docs/REQ-039-implement-photocapturestep-overview.md`
- Implementation Plan: `/docs/prd/item-capture-implementation-plan.md`
- Request Definition: `/docs/gen_requests.md` (REQ-039)
- useMediaCapture Overview: `/docs/REQ-036-create-usemediacapture-hook-overview.md`
- CameraPreview Overview: `/docs/REQ-037-build-camerapreview-component-overview.md`
- VideoCaptureStep Detailed: `/docs/REQ-038-implement-videocapturestep-detailed.md`
- [Canvas.toBlob() - MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob)
- [Navigator.vibrate() - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate)
- [Lucide React Icons](https://lucide.dev/icons/)

---

*Document generated for REQ-039 detailed task breakdown.*
