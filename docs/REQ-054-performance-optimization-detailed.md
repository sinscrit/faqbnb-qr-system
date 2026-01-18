# REQ-054: Media Editor Performance Optimization - Detailed Task Breakdown

**Document Created:** 2025-12-31T21:45:00
**Last Modified:** 2025-12-31T19:45:00
**Overview Document:** `/docs/REQ-054-performance-optimization-overview.md`
**Request Reference:** `/docs/gen_requests.md` (REQ-054)
**Implementation Plan:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 5 - Review & Polish
**Task ID:** 5.5
**Status:** ✅ IMPLEMENTATION COMPLETE

---

## Implementation Summary

**Completed:** 2025-12-31

### Key Deliverables:
1. **URL Manager Utility** - Created centralized URL tracking system (`src/components/ItemCapture/utils/urlManager.ts`)
2. **CLEANUP_ALL Action** - Added to useItemCaptureState for coordinated resource cleanup
3. **Lazy Loading** - TextEditorStep now uses dynamic import for ReactMarkdown
4. **URL Cleanup** - All step components verified to have proper URL cleanup patterns
5. **Build Verified** - No type errors, successful production build

### Files Modified:
- `src/components/ItemCapture/utils/urlManager.ts` (NEW)
- `src/components/ItemCapture/hooks/useItemCaptureState.ts`
- `src/components/ItemCapture/ItemCapture.types.ts`
- `src/components/ItemCapture/components/steps/TextEditorStep.tsx`
- `src/components/ItemCapture/components/steps/VideoCaptureStep.tsx`
- `src/components/ItemCapture/components/steps/PhotoCaptureStep.tsx`
- `src/components/ItemCapture/components/steps/FileUploadStep.tsx`
- `src/components/ItemCapture/components/steps/ReviewStep.tsx`

### Pre-existing Completions (Verified):
- Tasks 1-3, 15-16: useMediaCapture already had cleanup refs and stream cleanup
- Task 8: MediaEditorStep already used dynamic imports for editors
- Task 10: FileUploadStep already had lazy PDF loading via usePDFThumbnail

---

## Document Purpose

This document breaks down the performance optimization work into granular, actionable tasks that can each be completed in a few hours of focused work. Each task includes specific acceptance criteria, verification steps, and references to the authorized files.

---

## Prerequisites

Before starting any task in this document:

1. Phase 5.4 (onComplete Assembly) must be complete
2. All ItemCapture step components must exist
3. useMediaCapture, useFileUpload, and useMediaEditor hooks must exist
4. REQ-028 Bundle Analysis must be complete (VERIFIED COMPLETE)

---

## Task Summary

| Task # | Description | Status | Notes |
|--------|-------------|--------|-------|
| 1 | Add cleanup refs to useMediaCapture hook | ✅ Pre-existing | Already had refs (lines 323-328) |
| 2 | Implement stream cleanup on unmount in useMediaCapture | ✅ Pre-existing | Already implemented (lines 1047-1077) |
| 3 | Add step transition cleanup to useMediaCapture | ✅ Pre-existing | stopCamera/cleanup exported |
| 4 | Create URL manager utility | ✅ Complete | Created urlManager.ts with tracking |
| 5 | Add URL tracking to useFileUpload hook | ✅ Pre-existing | Already has previewUrlsRef cleanup |
| 6 | Add URL cleanup to useMediaEditor hook | ✅ Pre-existing | Already has urlsRef cleanup pattern |
| 7 | Add CLEANUP_ALL action to useItemCaptureState | ✅ Complete | Added action and cleanupAll function |
| 8 | Convert MediaEditorStep to lazy imports | ✅ Pre-existing | Already uses dynamic imports (lines 93-115) |
| 9 | Convert TextEditorStep to lazy imports | ✅ Complete | Added dynamic import for ReactMarkdown |
| 10 | Add lazy PDF loading to FileUploadStep | ✅ Pre-existing | Uses usePDFThumbnail hook |
| 11 | Add URL cleanup to VideoCaptureStep | ✅ Pre-existing | Has URL.revokeObjectURL calls |
| 12 | Add URL cleanup to PhotoCaptureStep | ✅ Pre-existing | Has URL.revokeObjectURL calls |
| 13 | Add URL cleanup to FileUploadStep | ✅ Pre-existing | Via useFileUpload hook |
| 14 | Add URL cleanup to ReviewStep | ✅ Pre-existing | Has urlsRef cleanup pattern |
| 15 | Add stream cleanup to CameraPreview | ✅ Pre-existing | Clears srcObject on cleanup |
| 16 | Add URL cleanup to MediaThumbnail | ✅ Pre-existing | Has URL cleanup in useEffect |
| 17 | Memory profiling and validation | ⏸️ Deferred | Manual testing task |
| 18 | Update debug logging for cleanup visibility | ✅ Complete | urlManager has setURLManagerDebug() |

**Implementation Status:** ✅ All required tasks complete, build verified

---

## Detailed Tasks

### Task 1: Add cleanup refs to useMediaCapture hook

**File:** `src/components/ItemCapture/hooks/useMediaCapture.ts`

**Objective:** Add the foundational refs needed for proper lifecycle management of media streams and abort controllers.

**Implementation Steps:**

1. Open `src/components/ItemCapture/hooks/useMediaCapture.ts`
2. Add the following refs at the top of the hook function:
   ```typescript
   const isUnmountedRef = useRef(false);
   const streamRef = useRef<MediaStream | null>(null);
   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
   const abortControllerRef = useRef<AbortController | null>(null);
   ```
3. When setting a stream in state, also store it in `streamRef.current`
4. When creating a MediaRecorder, also store it in `mediaRecorderRef.current`

**Acceptance Criteria:**
- [ ] `isUnmountedRef` is declared and initialized to `false`
- [ ] `streamRef` is declared and updated whenever stream state changes
- [ ] `mediaRecorderRef` is declared and updated when MediaRecorder is created
- [ ] `abortControllerRef` is declared for future abort support
- [ ] Existing functionality remains unchanged
- [ ] No TypeScript errors

**Verification Steps:**
1. Run `npm run type-check` - no errors
2. Run `npm run build` - no build errors
3. Navigate to camera capture step - camera still activates
4. Record video - recording still works

**Reference Pattern:** `src/hooks/useQRCodeGeneration.ts:81-85`

---

### Task 2: Implement stream cleanup on unmount in useMediaCapture

**File:** `src/components/ItemCapture/hooks/useMediaCapture.ts`

**Objective:** Ensure all media stream tracks are stopped when the hook unmounts, preventing orphaned streams.

**Implementation Steps:**

1. Create a `cleanup` function that:
   - Stops MediaRecorder if active
   - Stops all tracks in `streamRef.current`
   - Aborts pending operations via `abortControllerRef`
   - Updates state if component not unmounted

2. Add a `useEffect` with cleanup return:
   ```typescript
   useEffect(() => {
     return () => {
       isUnmountedRef.current = true;
       cleanup();
     };
   }, [cleanup]);
   ```

3. Wrap the cleanup function in `useCallback` with appropriate dependencies

**Acceptance Criteria:**
- [ ] `cleanup()` function exists and is memoized with `useCallback`
- [ ] `cleanup()` stops MediaRecorder if state is not 'inactive'
- [ ] `cleanup()` calls `track.stop()` on all tracks in the stream
- [ ] `cleanup()` aborts any pending operations
- [ ] `useEffect` cleanup calls `cleanup()` and sets `isUnmountedRef.current = true`
- [ ] Camera LED turns off within 1 second of component unmount
- [ ] No console errors about accessing state after unmount

**Verification Steps:**
1. Open ItemCapture, navigate to camera step
2. Verify camera LED is on
3. Click Cancel button
4. Verify camera LED turns off within 1 second
5. Check console for no "state update on unmounted component" warnings

**Reference Pattern:** `src/hooks/useQRCodeGeneration.ts:88-111`

---

### Task 3: Add step transition cleanup to useMediaCapture

**File:** `src/components/ItemCapture/hooks/useMediaCapture.ts`

**Objective:** Expose a `stopCamera` function and ensure cleanup runs when navigating away from capture steps.

**Implementation Steps:**

1. Create `stopCamera` function that calls `cleanup()`:
   ```typescript
   const stopCamera = useCallback(() => {
     cleanup();
   }, [cleanup]);
   ```

2. Create `switchCamera` function that cleans up before starting new stream:
   ```typescript
   const switchCamera = useCallback(async (facingMode: 'user' | 'environment') => {
     cleanup();
     await startCamera(facingMode);
   }, [cleanup, startCamera]);
   ```

3. Update `startCamera` to:
   - Call `cleanup()` first to stop any existing stream
   - Check `isUnmountedRef.current` after async operations
   - Store new stream in both state and `streamRef`

4. Export `stopCamera` and `cleanup` from the hook

**Acceptance Criteria:**
- [ ] `stopCamera()` is exported and calls cleanup
- [ ] `switchCamera()` stops current stream before starting new one
- [ ] `startCamera()` checks for unmount after `getUserMedia` call
- [ ] Switching cameras stops the old stream first
- [ ] No orphaned streams when navigating between steps

**Verification Steps:**
1. Open camera step with back camera
2. Switch to front camera
3. Verify no console errors
4. Navigate to next step
5. Return to camera step
6. Verify camera activates without errors
7. Use browser DevTools > Application > Media to verify no orphaned streams

---

### Task 4: Create URL manager utility

**File:** `src/components/ItemCapture/utils/urlManager.ts` (NEW)

**Objective:** Create a reusable utility for tracking and revoking object URLs to prevent memory leaks.

**Implementation Steps:**

1. Create new file at `src/components/ItemCapture/utils/urlManager.ts`
2. Implement the URL manager factory:
   ```typescript
   type UrlRegistry = Map<string, string>;

   export function createUrlManager() {
     const registry: UrlRegistry = new Map();

     return {
       createUrl: (blob: Blob, key: string): string => {
         // Revoke existing URL for this key
         const existing = registry.get(key);
         if (existing) {
           URL.revokeObjectURL(existing);
           registry.delete(key);
         }
         const url = URL.createObjectURL(blob);
         registry.set(key, url);
         return url;
       },

       revokeUrl: (key: string): void => {
         const url = registry.get(key);
         if (url) {
           URL.revokeObjectURL(url);
           registry.delete(key);
         }
       },

       revokeAll: (): void => {
         registry.forEach((url) => {
           URL.revokeObjectURL(url);
         });
         registry.clear();
       },

       getActiveCount: (): number => registry.size,
     };
   }
   ```

3. Export the utility function

**Acceptance Criteria:**
- [ ] File created at specified path
- [ ] `createUrl()` creates URL and tracks by key
- [ ] `createUrl()` revokes existing URL for same key before creating new one
- [ ] `revokeUrl()` revokes and removes specific URL
- [ ] `revokeAll()` revokes all tracked URLs
- [ ] `getActiveCount()` returns current count
- [ ] TypeScript types are properly defined
- [ ] No external dependencies

**Verification Steps:**
1. Run `npm run type-check` - no errors
2. Import utility in test file and verify methods work
3. Verify `getActiveCount()` returns 0 after `revokeAll()`

**Reference Pattern:** `src/lib/utils.ts:85-103` (downloadBlob URL cleanup)

---

### Task 5: Add URL tracking to useFileUpload hook

**File:** `src/components/ItemCapture/hooks/useFileUpload.ts`

**Objective:** Track all object URLs created for file previews and revoke them on cleanup.

**Implementation Steps:**

1. Import `createUrlManager` from `../utils/urlManager`
2. Create URL manager ref:
   ```typescript
   const urlManagerRef = useRef(createUrlManager());
   ```

3. Replace direct `URL.createObjectURL` calls with:
   ```typescript
   const previewUrl = urlManagerRef.current.createUrl(file, `file-${fileId}`);
   ```

4. Add cleanup effect:
   ```typescript
   useEffect(() => {
     return () => {
       urlManagerRef.current.revokeAll();
     };
   }, []);
   ```

5. When a file is removed, revoke its specific URL:
   ```typescript
   urlManagerRef.current.revokeUrl(`file-${fileId}`);
   ```

**Acceptance Criteria:**
- [ ] URL manager is initialized in the hook
- [ ] All `URL.createObjectURL` calls use the manager
- [ ] URLs are revoked when individual files are removed
- [ ] All URLs are revoked on component unmount
- [ ] No memory leaks from orphaned blob URLs

**Verification Steps:**
1. Upload 3 files
2. Remove 1 file
3. Check `urlManagerRef.current.getActiveCount()` equals 2
4. Navigate away from step
5. Return and verify no console errors

---

### Task 6: Add URL cleanup to useMediaEditor hook

**File:** `src/components/ItemCapture/hooks/useMediaEditor.ts`

**Objective:** Track object URLs created during editing operations and clean them up properly.

**Implementation Steps:**

1. Import `createUrlManager` from `../utils/urlManager`
2. Create URL manager ref for edit previews
3. When creating preview URLs for crops/rotations:
   ```typescript
   const editPreviewUrl = urlManagerRef.current.createUrl(
     editedBlob,
     `edit-${mediaId}-${editType}`
   );
   ```

4. When applying an edit (replacing original):
   - Revoke the original URL
   - Create new URL for the edited version

5. When canceling an edit:
   - Revoke the preview URL
   - Keep the original URL

6. Add cleanup on unmount

**Acceptance Criteria:**
- [ ] URL manager tracks all edit preview URLs
- [ ] Original URLs are revoked when edits are applied
- [ ] Preview URLs are revoked when edits are canceled
- [ ] All URLs are revoked on unmount
- [ ] No "blob URL not found" errors in console

**Verification Steps:**
1. Open an image in editor
2. Apply crop, verify preview shows
3. Cancel crop, verify original shows
4. Apply different crop
5. Navigate away
6. Check for no blob URL errors

---

### Task 7: Add CLEANUP_ALL action to useItemCaptureState

**File:** `src/components/ItemCapture/hooks/useItemCaptureState.ts`

**Objective:** Add state actions for cleaning up media items and resetting wizard state.

**Implementation Steps:**

1. Add new action types:
   ```typescript
   | { type: 'CLEANUP_MEDIA'; payload: string } // by media id
   | { type: 'CLEANUP_ALL' }
   ```

2. Implement reducer cases:
   ```typescript
   case 'CLEANUP_MEDIA': {
     return {
       ...state,
       mediaItems: state.mediaItems.filter(
         item => item.id !== action.payload
       ),
     };
   }

   case 'CLEANUP_ALL': {
     return initialState;
   }
   ```

3. The actual URL/stream cleanup happens in components using these actions as signals

**Acceptance Criteria:**
- [ ] `CLEANUP_MEDIA` action removes specific media item from state
- [ ] `CLEANUP_ALL` action resets state to initial values
- [ ] Actions are properly typed
- [ ] Reducer handles actions without errors

**Verification Steps:**
1. Dispatch `CLEANUP_MEDIA` with valid ID - item removed
2. Dispatch `CLEANUP_ALL` - state reset to initial
3. Verify no TypeScript errors
4. Run unit tests if they exist

---

### Task 8: Convert MediaEditorStep to lazy imports

**File:** `src/components/ItemCapture/components/steps/MediaEditorStep.tsx`

**Objective:** Use Next.js dynamic imports to lazy load heavy editor components.

**Implementation Steps:**

1. Add `dynamic` import from `next/dynamic`
2. Replace static imports with dynamic imports:
   ```typescript
   const ImageCropper = dynamic(
     () => import('../editors/ImageCropper'),
     {
       ssr: false,
       loading: () => (
         <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
         </div>
       )
     }
   );

   const ImageRotator = dynamic(
     () => import('../editors/ImageRotator'),
     { ssr: false }
   );

   const VideoTrimmer = dynamic(
     () => import('../editors/VideoTrimmer'),
     {
       ssr: false,
       loading: () => (
         <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
         </div>
       )
     }
   );
   ```

3. Ensure components render correctly after lazy load

**Acceptance Criteria:**
- [ ] `ImageCropper` is dynamically imported with `ssr: false`
- [ ] `ImageRotator` is dynamically imported with `ssr: false`
- [ ] `VideoTrimmer` is dynamically imported with `ssr: false`
- [ ] Loading spinners display during component load
- [ ] Editor components render correctly after load
- [ ] Editor functionality works after lazy loading
- [ ] Build shows separate chunks for editors

**Verification Steps:**
1. Run `npm run build`
2. Check `.next/static/chunks` for separate editor chunks
3. Open Network tab in DevTools
4. Navigate to MediaEditorStep
5. Verify editor chunk loads only when step is accessed
6. Verify loading spinner appears briefly
7. Verify editor works after loading

**Reference Pattern:** `src/app/test/bundle-test/page.tsx:8-11`

---

### Task 9: Convert TextEditorStep to lazy imports

**File:** `src/components/ItemCapture/components/steps/TextEditorStep.tsx`

**Objective:** Lazy load the MarkdownEditor component to reduce initial bundle size.

**Implementation Steps:**

1. Add `dynamic` import from `next/dynamic`
2. Replace static import with dynamic:
   ```typescript
   const MarkdownEditor = dynamic(
     () => import('../editors/MarkdownEditor'),
     {
       ssr: false,
       loading: () => (
         <div className="animate-pulse h-40 bg-gray-100 rounded" />
       )
     }
   );
   ```

3. Verify markdown preview still works after lazy load

**Acceptance Criteria:**
- [ ] `MarkdownEditor` is dynamically imported
- [ ] Placeholder shows during load
- [ ] Markdown editing works after load
- [ ] Markdown preview renders correctly
- [ ] Toolbar functions work

**Verification Steps:**
1. Navigate directly to text editor step
2. Verify loading placeholder appears
3. Verify editor loads and renders
4. Type markdown text
5. Verify preview renders correctly
6. Use toolbar buttons (bold, italic, etc.)

**Reference Pattern:** `src/app/test/bundle-test/page.tsx:8-11`

---

### Task 10: Add lazy PDF loading to FileUploadStep

**File:** `src/components/ItemCapture/components/steps/FileUploadStep.tsx`

**Objective:** Load pdfjs-dist only when a PDF file is uploaded, not on initial render.

**Implementation Steps:**

1. Do NOT import pdfThumbnailGenerator at the top of the file
2. When handling file upload, check if file is PDF:
   ```typescript
   const handleFileSelect = async (files: FileList) => {
     for (const file of Array.from(files)) {
       if (file.type === 'application/pdf') {
         // Lazy load PDF utilities only when needed
         const { generatePDFThumbnail, getPDFPageCount } = await import(
           '../../utils/pdfThumbnailGenerator'
         );

         const thumbnail = await generatePDFThumbnail(file);
         const pageCount = await getPDFPageCount(file);

         // Add to media items with metadata
         // ... rest of handling
       }
     }
   };
   ```

3. Show loading indicator while PDF is being processed

**Acceptance Criteria:**
- [ ] pdfjs-dist is NOT in the initial FileUploadStep chunk
- [ ] PDF utilities are loaded only when PDF is uploaded
- [ ] PDF thumbnail generates correctly
- [ ] Page count is extracted correctly
- [ ] Loading indicator shows during PDF processing
- [ ] Non-PDF files work without loading pdfjs

**Verification Steps:**
1. Navigate to FileUploadStep
2. Check Network tab - no pdfjs chunk loaded
3. Upload an image file - no pdfjs loaded
4. Upload a PDF file
5. Verify pdfjs chunk loads
6. Verify thumbnail generates
7. Verify page count displays

**Reference Pattern:**
- `src/app/test/bundle-test/page.tsx:17-28`
- `src/components/ItemCapture/utils/pdfThumbnailGenerator.ts`

---

### Task 11: Add URL cleanup to VideoCaptureStep

**File:** `src/components/ItemCapture/components/steps/VideoCaptureStep.tsx`

**Objective:** Revoke preview URLs created for video recording blobs.

**Implementation Steps:**

1. Import `createUrlManager` from utils
2. Initialize URL manager ref
3. When creating video preview URL after recording:
   ```typescript
   const previewUrl = urlManagerRef.current.createUrl(
     videoBlob,
     `video-preview-${recordingId}`
   );
   ```

4. When user retakes video:
   ```typescript
   urlManagerRef.current.revokeUrl(`video-preview-${recordingId}`);
   ```

5. Add cleanup on unmount:
   ```typescript
   useEffect(() => {
     return () => {
       urlManagerRef.current.revokeAll();
     };
   }, []);
   ```

**Acceptance Criteria:**
- [ ] Video preview URLs are tracked
- [ ] URLs are revoked when video is retaken
- [ ] All URLs are revoked on unmount
- [ ] No console errors about invalid blob URLs
- [ ] Memory usage stable across multiple recordings

**Verification Steps:**
1. Record a video
2. View preview - URL works
3. Retake video
4. View new preview - works, old URL revoked
5. Navigate away from step
6. Return - no errors about old blob URLs

---

### Task 12: Add URL cleanup to PhotoCaptureStep

**File:** `src/components/ItemCapture/components/steps/PhotoCaptureStep.tsx`

**Objective:** Revoke preview URLs created for captured photos.

**Implementation Steps:**

1. Import `createUrlManager` from utils
2. Initialize URL manager ref
3. When creating photo preview:
   ```typescript
   const previewUrl = urlManagerRef.current.createUrl(
     photoBlob,
     `photo-${photoId}`
   );
   ```

4. When photo is deleted:
   ```typescript
   urlManagerRef.current.revokeUrl(`photo-${photoId}`);
   ```

5. Add cleanup on unmount

**Acceptance Criteria:**
- [ ] Photo preview URLs are tracked by photo ID
- [ ] URLs are revoked when individual photos are deleted
- [ ] All URLs are revoked on unmount
- [ ] Multiple photos can be captured with proper tracking
- [ ] No memory accumulation from repeated captures

**Verification Steps:**
1. Capture 5 photos
2. Verify all previews display
3. Delete 2 photos
4. Verify remaining 3 still display
5. Navigate away
6. Check console for no blob URL errors

---

### Task 13: Add URL cleanup to FileUploadStep

**File:** `src/components/ItemCapture/components/steps/FileUploadStep.tsx`

**Objective:** Revoke preview URLs for uploaded files on unmount or removal.

**Implementation Steps:**

1. Ensure useFileUpload hook cleanup (from Task 5) is used
2. If component creates additional preview URLs, track them:
   ```typescript
   const urlManagerRef = useRef(createUrlManager());
   ```

3. When file is removed from upload list:
   ```typescript
   urlManagerRef.current.revokeUrl(`upload-${fileId}`);
   ```

4. Cleanup on unmount

**Acceptance Criteria:**
- [ ] All uploaded file preview URLs are tracked
- [ ] URLs are revoked when files are removed
- [ ] Cleanup runs on unmount
- [ ] Drag-and-drop uploads are tracked
- [ ] Multiple file uploads tracked correctly

**Verification Steps:**
1. Upload 3 files via click
2. Upload 2 files via drag-drop
3. Remove 2 files
4. Verify remaining previews work
5. Navigate away - no errors

---

### Task 14: Add URL cleanup to ReviewStep

**File:** `src/components/ItemCapture/components/steps/ReviewStep.tsx`

**Objective:** Revoke thumbnail URLs displayed in the review summary.

**Implementation Steps:**

1. Import `createUrlManager` from utils
2. Initialize URL manager for thumbnail URLs
3. When displaying thumbnails, track URLs:
   ```typescript
   const thumbnailUrl = urlManagerRef.current.createUrl(
     thumbnail,
     `thumb-${mediaId}`
   );
   ```

4. Cleanup on unmount

**Acceptance Criteria:**
- [ ] Thumbnail URLs are tracked
- [ ] URLs are revoked on unmount
- [ ] Reorder operations don't create duplicate URLs
- [ ] Delete operations revoke specific URLs
- [ ] No URL accumulation during review

**Verification Steps:**
1. Add multiple media items
2. Navigate to review step
3. Verify all thumbnails display
4. Reorder items
5. Delete one item
6. Navigate away - no errors
7. Return to review - thumbnails still work

---

### Task 15: Add stream cleanup to CameraPreview

**File:** `src/components/ItemCapture/components/shared/CameraPreview.tsx`

**Objective:** Ensure the video element properly disconnects from the stream on unmount.

**Implementation Steps:**

1. Add ref to video element
2. On unmount, clear video srcObject:
   ```typescript
   useEffect(() => {
     const video = videoRef.current;
     return () => {
       if (video) {
         video.srcObject = null;
       }
     };
   }, []);
   ```

3. The actual stream stopping is handled by useMediaCapture, but clearing srcObject helps with cleanup

**Acceptance Criteria:**
- [ ] Video element's srcObject is cleared on unmount
- [ ] No errors about accessing video element after unmount
- [ ] Camera LED turns off (via useMediaCapture cleanup)
- [ ] Component can be remounted without issues

**Verification Steps:**
1. Navigate to camera step
2. Verify camera feed displays
3. Navigate away
4. Navigate back to camera step
5. Verify camera feed displays again without errors

---

### Task 16: Add URL cleanup to MediaThumbnail

**File:** `src/components/ItemCapture/components/shared/MediaThumbnail.tsx`

**Objective:** Revoke thumbnail URL on component unmount.

**Implementation Steps:**

1. If MediaThumbnail creates its own blob URL:
   ```typescript
   const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

   useEffect(() => {
     if (thumbnailBlob) {
       const url = URL.createObjectURL(thumbnailBlob);
       setThumbnailUrl(url);

       return () => {
         URL.revokeObjectURL(url);
       };
     }
   }, [thumbnailBlob]);
   ```

2. If it receives a URL as prop, cleanup is handled by parent

**Acceptance Criteria:**
- [ ] If component creates URL, it revokes on unmount
- [ ] If component receives URL as prop, no duplicate revocation
- [ ] Thumbnail displays correctly
- [ ] No console warnings about blob URLs

**Verification Steps:**
1. Display MediaThumbnail component
2. Verify thumbnail shows
3. Unmount component
4. Verify no console warnings
5. Check memory doesn't accumulate

---

### Task 17: Memory profiling and validation

**File:** N/A (Testing task)

**Objective:** Validate that all cleanup implementations work correctly and memory is stable.

**Implementation Steps:**

1. **Baseline Measurement:**
   - Open Chrome DevTools > Memory tab
   - Navigate to ItemCapture
   - Force GC (click trash can icon)
   - Take heap snapshot - record size

2. **Run 5-Cycle Stress Test:**
   For each cycle:
   - Record a short video
   - Capture 3 photos
   - Upload 2 files (1 image, 1 PDF)
   - Add text content
   - Complete the flow (submit)
   - Return to ItemCapture without page reload
   - Force GC
   - Take heap snapshot

3. **Analyze Results:**
   - Compare heap sizes across cycles
   - Search snapshots for "Blob" - verify count stable
   - Search snapshots for "MediaStream" - verify 0 after capture step exit
   - Check for detached DOM elements

4. **Document Findings:**
   - Create memory profiling results in REQ-054 notes
   - List any remaining issues
   - Confirm success criteria met

**Acceptance Criteria:**
- [ ] Memory growth < 10% between cycles 3-5
- [ ] No MediaStream objects retained after exiting capture step
- [ ] No significant Blob retention after completing flow
- [ ] No detached DOM elements referencing media
- [ ] Camera LED off after every exit from capture step
- [ ] Results documented

**Verification Steps:**
1. Follow the testing protocol above
2. Document heap snapshot sizes for each cycle:
   - Cycle 1: ___ MB
   - Cycle 2: ___ MB
   - Cycle 3: ___ MB
   - Cycle 4: ___ MB
   - Cycle 5: ___ MB
3. Calculate growth percentage: ((Cycle5 - Cycle3) / Cycle3) * 100
4. Pass if < 10%

---

### Task 18: Update debug logging for cleanup visibility

**File:** Multiple files

**Objective:** Add conditional debug logging to help identify cleanup issues in development.

**Implementation Steps:**

1. Check if debug flag is enabled (from ItemCaptureConfig):
   ```typescript
   const debug = config?.debug ?? false;
   ```

2. Add logging to cleanup functions:
   ```typescript
   if (debug) {
     console.log('[useMediaCapture] Cleanup - stopping tracks:',
       stream?.getTracks().map(t => t.kind));
   }
   ```

3. Add logging to URL manager:
   ```typescript
   if (process.env.NODE_ENV === 'development') {
     console.log(`[UrlManager] Revoked ${registry.size} URLs`);
   }
   ```

4. Ensure logs are only in development/debug mode

**Files to Update:**
- `src/components/ItemCapture/hooks/useMediaCapture.ts`
- `src/components/ItemCapture/hooks/useFileUpload.ts`
- `src/components/ItemCapture/hooks/useMediaEditor.ts`
- `src/components/ItemCapture/utils/urlManager.ts`

**Acceptance Criteria:**
- [ ] Debug logs appear when debug flag is true
- [ ] Debug logs do NOT appear in production build
- [ ] Logs clearly identify what is being cleaned up
- [ ] Logs include relevant details (track kinds, URL counts)
- [ ] No console spam in normal usage

**Verification Steps:**
1. Enable debug mode in config
2. Complete capture flow
3. Verify cleanup logs appear in console
4. Disable debug mode
5. Repeat - verify no logs
6. Run production build - verify no debug logs

---

## Implementation Order

### Phase A: Foundation (Tasks 1-4, 7)
**Duration:** Day 1

```
Task 1 → Task 2 → Task 3
              ↓
           Task 4 (parallel)
              ↓
           Task 7 (parallel)
```

### Phase B: Hook Integration (Tasks 5-6)
**Duration:** Day 1-2

```
Task 4 (complete)
    ↓
Task 5 ──→ Task 6 (can be parallel)
```

### Phase C: Lazy Loading (Tasks 8-10)
**Duration:** Day 2

```
Task 8 ──→ Task 9 ──→ Task 10 (sequential for easier testing)
```

### Phase D: Component Cleanup (Tasks 11-16)
**Duration:** Day 2-3

```
Task 11 ─┬─ Task 12 ─┬─ Task 13
         │           │
         └── Task 14 ┴── Task 15 ── Task 16
(Can be parallelized across similar components)
```

### Phase E: Validation (Tasks 17-18)
**Duration:** Day 3

```
All previous tasks complete
         ↓
Task 17 (memory profiling)
         ↓
Task 18 (debug logging)
```

---

## Acceptance Criteria Mapping

| Requirement (from gen_requests.md) | Task(s) |
|-----------------------------------|---------|
| Editor components not loaded until editing step | 8, 9 |
| Camera/microphone released within 1 second of exit | 2, 3, 15 |
| All blob URLs revoked on preview unmount | 4, 5, 6, 11, 12, 13, 14, 16 |
| Memory stable across 5 consecutive sessions | 17 |
| No active streams after camera step exit | 2, 3, 15 |
| Performance stable during 15-minute session | 17 |
| Memory profiling confirms no leaks | 17 |

---

## Rollback Plan

If issues are discovered after implementing these changes:

1. **Lazy Loading Issues:** Revert to static imports by removing `dynamic()` wrappers
2. **Cleanup Timing Issues:** Adjust cleanup to run on step transition instead of unmount
3. **URL Manager Issues:** Inline URL management in each component
4. **Stream Cleanup Issues:** Add additional delays before cleanup

---

## Notes

- All tasks should be committed individually for easy rollback
- Run `npm run build` after each task to verify no build errors
- Memory profiling (Task 17) may reveal additional issues requiring extra tasks
- The debug logging (Task 18) is optional but recommended for ongoing maintenance

---

## References

- [Overview Document](/docs/REQ-054-performance-optimization-overview.md)
- [Implementation Plan](/docs/prd/item-capture-implementation-plan.md) - Phase 5, Task 5.5
- [Bundle Analysis Report](/docs/req-028-bundle-analysis-report.md)
- [useQRCodeGeneration.ts](/src/hooks/useQRCodeGeneration.ts) - Cleanup pattern reference
- [utils.ts downloadBlob](/src/lib/utils.ts) - URL revocation pattern
- [Bundle Test Page](/src/app/test/bundle-test/page.tsx) - Lazy loading examples
- [ImageCropper.tsx](/src/components/ItemCapture/editors/ImageCropper.tsx) - Lazy load target
- [pdfThumbnailGenerator.ts](/src/components/ItemCapture/utils/pdfThumbnailGenerator.ts) - Lazy load target
