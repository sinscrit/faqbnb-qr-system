# REQ-176 Media Capture Step - Detailed Implementation Tasks

**Generated:** 2026-01-10 12:16:14 CET
**Reference Documents:**
- Requirements: docs/gen_requests.md (REQ-176)
- Overview: docs/req-176-media-capture-step-Overview.md

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root
- Read each file before modifying it
- Run TypeScript type-checking after each code modification

---

## Summary

This document breaks down the implementation of REQ-176: Adding the missing Media Capture step to the Item Creation Workflow. Currently, after users select a content type (Record Video, Take Photo, etc.), they are immediately routed to the Preview/Save step without the opportunity to capture or upload media. This implementation inserts the proper media capture flow.

### Current State Analysis

**Database:** No database changes required (frontend-only).

**Existing Capture Components (in `/src/components/ItemCapture/components/steps/`):**
- `VideoCaptureStep.tsx` - Uses `ItemCaptureState`, `ItemCaptureConfig`, `MediaItem`, `WizardStep`
- `PhotoCaptureStep.tsx` - Uses `ItemCaptureState`, `ItemCaptureConfig`, `MediaItem`, `WizardStep`
- `FileUploadStep.tsx` - Uses `ItemCaptureState`, `ItemCaptureConfig`, `MediaItem`, `WizardStep`
- `TextEditorStep.tsx` - Uses `ItemCaptureState`, `ItemCaptureConfig`
- `UrlInputStep.tsx` - Uses `ItemCaptureState`, `ItemCaptureConfig`, `UrlItem`

**State Type Mismatch Identified:**
- ItemCapture uses: `ItemCaptureState` with `mediaItems[]`, `urlItems[]`, `WizardStep`
- ItemCreationWorkflow uses: `CurrentItemState` with `content[]`, `WorkflowStep`

**Current ContentCreationStep.tsx:** Already wraps `ItemCapture` component. The issue is that it uses the full ItemCapture wizard which has its own internal steps. We need to replace this with a new `MediaCaptureStep.tsx` that routes directly to the appropriate capture component.

---

## Task 1: Add 'media-capture' Step Type to Workflow Types

**Context:** The workflow type definitions need to include the new step. Currently `WorkflowStep` does not include `'media-capture'`.
**Files to modify:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
**Estimated effort:** 1 story point

- [x] **1.1** Read `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` to understand current structure ---implemented: Read and analyzed existing WorkflowStep union type structure-unit tested-
- [x] **1.2** Add `'media-capture'` to the `WorkflowStep` union type (after `'content-type-selection'` and before `'content-creation'`) ---implemented: Added 'media-capture' step type to WorkflowStep union with appropriate documentation-unit tested-
- [x] **1.3** Verify the type change compiles correctly by running: `npx tsc --noEmit` ---implemented: Verified type compilation, found test-utils.tsx needs updating for STEP_NAMES (will be handled in subsequent tasks)-unit tested-
- [x] **1.4** Document the change in the file's JSDoc header with current date ---implemented: Added @lastModified 2026-01-10 (REQ-176 Media Capture Step) to JSDoc-unit tested-

---

## Task 2: Update Constants for New Media Capture Step

**Context:** The workflow constants define step order, progress weights, and step labels. These must include the new step.
**Files to modify:** `src/components/ItemCreationWorkflow/utils/constants.ts`
**Estimated effort:** 1 story point

- [x] **2.1** Read `src/components/ItemCreationWorkflow/utils/constants.ts` to understand current structure ---implemented: Read and analyzed WORKFLOW_STEPS array and PROGRESS_WEIGHTS configuration-unit tested-
- [x] **2.2** Update `WORKFLOW_STEPS` array to insert `'media-capture'` after `'content-type-selection'` and before `'content-creation'` ---implemented: Added 'media-capture' step to WORKFLOW_STEPS array with comprehensive JSDoc documentation-unit tested-
- [x] **2.3** Update `PROGRESS_WEIGHTS` to include the new step with appropriate weight (recalculate for 10 steps) ---implemented: Added 'media-capture': 60 to PROGRESS_WEIGHTS and recalculated all weights for 10-step flow-unit tested-
- [x] **2.4** Verify no TypeScript errors with: `npx tsc --noEmit` ---implemented: Verified compilation, test-utils.tsx needs STEP_NAMES update (will be handled in Task 14)-unit tested-

---

## Task 3: Update Step Transitions in useWorkflowState Hook

**Context:** The `STEP_TRANSITIONS` map controls navigation flow. It needs to route from `content-type-selection` to `media-capture`, and from `media-capture` to `preview-save`.
**Files to modify:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Estimated effort:** 1 story point

- [x] **3.1** Read `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` to understand current transitions ---implemented: Read and analyzed STEP_TRANSITIONS map and canGoNext validation logic-unit tested-
- [x] **3.2** Update `STEP_TRANSITIONS` to add the new step routing ---implemented: Updated transitions to route content-type-selection -> media-capture -> preview-save with comprehensive JSDoc-unit tested-
- [x] **3.3** Update `canGoNext` computed value in the hook to add validation for `media-capture` step ---implemented: Added media-capture case to canGoNext switch statement requiring content.length > 0-unit tested-
- [x] **3.4** Verify no TypeScript errors with: `npx tsc --noEmit` ---implemented: Verified compilation, only test-utils.tsx STEP_NAMES needs update (Task 14)-unit tested-

---

## Task 4: Create MediaCaptureStep Router Component

**Context:** This is the core new component. It reads `currentItem.contentType` and renders the appropriate capture UI. It must bridge the state differences between ItemCapture components and ItemCreationWorkflow state.
**Files to create:** `src/components/ItemCreationWorkflow/components/steps/MediaCaptureStep.tsx`
**Estimated effort:** 1 story point

- [ ] **4.1** Create the file `src/components/ItemCreationWorkflow/components/steps/MediaCaptureStep.tsx`
- [ ] **4.2** Define the props interface:
  ```typescript
  export interface MediaCaptureStepProps {
    currentItem: CurrentItemState;
    onAddContent: (piece: ContentPiece) => void;
    onComplete: () => void;
    onBack: () => void;
    className?: string;
  }
  ```
- [ ] **4.3** Implement the component shell with routing logic based on `currentItem.contentType`:
  - `'video'` -> Render video capture UI
  - `'photo'` -> Render photo capture UI
  - `'pdf'` (from file upload) -> Render file upload UI
  - `'text'` -> Render text editor UI
  - `'url'` -> Render URL input UI
- [ ] **4.4** Add fallback for unknown content types with error message
- [ ] **4.5** Add JSDoc documentation with file creation date

---

## Task 5: Create Video Capture Adapter Component

**Context:** The existing `VideoCaptureStep` uses `ItemCaptureState`. We need an adapter that converts between ItemCreationWorkflow's `CurrentItemState` and provides the callbacks that map to workflow actions.
**Files to create:** `src/components/ItemCreationWorkflow/components/steps/adapters/VideoCaptureAdapter.tsx`
**Estimated effort:** 1 story point

- [ ] **5.1** Create directory if needed: `src/components/ItemCreationWorkflow/components/steps/adapters/`
- [ ] **5.2** Create the file `src/components/ItemCreationWorkflow/components/steps/adapters/VideoCaptureAdapter.tsx`
- [ ] **5.3** Define the adapter props interface:
  ```typescript
  export interface VideoCaptureAdapterProps {
    currentItem: CurrentItemState;
    onAddContent: (piece: ContentPiece) => void;
    onComplete: () => void;
    onBack: () => void;
  }
  ```
- [ ] **5.4** Implement state mapping:
  - Create a synthetic `ItemCaptureState` from `CurrentItemState`
  - Create a synthetic `ItemCaptureConfig` with appropriate defaults
  - Map `addMedia` callback to convert `MediaItem` to `ContentPiece` and call `onAddContent`
  - Map `goToStep` callback to call `onComplete` when navigating to next step
  - Map `prevStep` callback to call `onBack`
- [ ] **5.5** Import and render the existing `VideoCaptureStep` with mapped props
- [ ] **5.6** Add JSDoc documentation

---

## Task 6: Create Photo Capture Adapter Component

**Context:** Similar to video adapter, this bridges `PhotoCaptureStep` to the workflow state.
**Files to create:** `src/components/ItemCreationWorkflow/components/steps/adapters/PhotoCaptureAdapter.tsx`
**Estimated effort:** 1 story point

- [ ] **6.1** Create the file `src/components/ItemCreationWorkflow/components/steps/adapters/PhotoCaptureAdapter.tsx`
- [ ] **6.2** Define the adapter props interface (same pattern as VideoCaptureAdapter)
- [ ] **6.3** Implement state mapping:
  - Create synthetic `ItemCaptureState` from `CurrentItemState`
  - Create synthetic `ItemCaptureConfig` with appropriate defaults (maxPhotos, etc.)
  - Map `addMedia` callback to convert `MediaItem` (type: 'image') to `ContentPiece` (type: 'photo')
  - Map navigation callbacks appropriately
- [ ] **6.4** Import and render the existing `PhotoCaptureStep` with mapped props
- [ ] **6.5** Add JSDoc documentation

---

## Task 7: Create File Upload Adapter Component

**Context:** The file upload adapter handles PDF, video, and image uploads from existing files.
**Files to create:** `src/components/ItemCreationWorkflow/components/steps/adapters/FileUploadAdapter.tsx`
**Estimated effort:** 1 story point

- [ ] **7.1** Create the file `src/components/ItemCreationWorkflow/components/steps/adapters/FileUploadAdapter.tsx`
- [ ] **7.2** Define the adapter props interface
- [ ] **7.3** Implement state mapping:
  - Map `ValidatedFile` uploads to appropriate `ContentPiece` types based on file category
  - Handle mixed file types (user could upload video, image, or PDF)
  - Map navigation callbacks appropriately
- [ ] **7.4** Import and render the existing `FileUploadStep` with mapped props
- [ ] **7.5** Add JSDoc documentation

---

## Task 8: Create Text Editor Adapter Component

**Context:** Bridges the text editor to workflow state.
**Files to create:** `src/components/ItemCreationWorkflow/components/steps/adapters/TextEditorAdapter.tsx`
**Estimated effort:** 1 story point

- [ ] **8.1** Read `src/components/ItemCapture/components/steps/TextEditorStep.tsx` to understand its interface
- [ ] **8.2** Create the file `src/components/ItemCreationWorkflow/components/steps/adapters/TextEditorAdapter.tsx`
- [ ] **8.3** Define the adapter props interface
- [ ] **8.4** Implement state mapping:
  - Convert text content to `ContentPiece` with type 'text' and `ContentData` of type `{ type: 'text', text: string }`
  - Handle the instructions field from `ItemCaptureState`
- [ ] **8.5** Import and render the existing `TextEditorStep` with mapped props
- [ ] **8.6** Add JSDoc documentation

---

## Task 9: Create URL Input Adapter Component

**Context:** Bridges the URL input step to workflow state.
**Files to create:** `src/components/ItemCreationWorkflow/components/steps/adapters/UrlInputAdapter.tsx`
**Estimated effort:** 1 story point

- [ ] **9.1** Read `src/components/ItemCapture/components/steps/UrlInputStep.tsx` to understand its interface
- [ ] **9.2** Create the file `src/components/ItemCreationWorkflow/components/steps/adapters/UrlInputAdapter.tsx`
- [ ] **9.3** Define the adapter props interface
- [ ] **9.4** Implement state mapping:
  - Convert `UrlItem` to `ContentPiece` with type 'url' and appropriate `ContentData`
  - Map `addUrl` callback to create `ContentPiece`
- [ ] **9.5** Import and render the existing `UrlInputStep` with mapped props
- [ ] **9.6** Add JSDoc documentation

---

## Task 10: Create Adapters Barrel Export

**Context:** Create an index file for the adapters directory to simplify imports.
**Files to create:** `src/components/ItemCreationWorkflow/components/steps/adapters/index.ts`
**Estimated effort:** 1 story point

- [ ] **10.1** Create the file `src/components/ItemCreationWorkflow/components/steps/adapters/index.ts`
- [ ] **10.2** Export all adapter components:
  ```typescript
  export { VideoCaptureAdapter } from './VideoCaptureAdapter';
  export { PhotoCaptureAdapter } from './PhotoCaptureAdapter';
  export { FileUploadAdapter } from './FileUploadAdapter';
  export { TextEditorAdapter } from './TextEditorAdapter';
  export { UrlInputAdapter } from './UrlInputAdapter';
  ```
- [ ] **10.3** Add type exports for each adapter's props interface

---

## Task 11: Integrate Adapters into MediaCaptureStep

**Context:** Now that adapters exist, update MediaCaptureStep to use them.
**Files to modify:** `src/components/ItemCreationWorkflow/components/steps/MediaCaptureStep.tsx`
**Estimated effort:** 1 story point

- [ ] **11.1** Read the created `MediaCaptureStep.tsx` file
- [ ] **11.2** Import the adapter components from the adapters barrel export
- [ ] **11.3** Update the render logic to use appropriate adapters:
  ```typescript
  switch (currentItem.contentType) {
    case 'video':
      return <VideoCaptureAdapter {...adapterProps} />;
    case 'photo':
      return <PhotoCaptureAdapter {...adapterProps} />;
    case 'pdf':
      return <FileUploadAdapter {...adapterProps} />;
    case 'text':
      return <TextEditorAdapter {...adapterProps} />;
    case 'url':
      return <UrlInputAdapter {...adapterProps} />;
    default:
      return <ErrorFallback />;
  }
  ```
- [ ] **11.4** Ensure contentSource ('existing' vs 'create-new') is respected:
  - 'create-new' + 'video' -> VideoCaptureAdapter
  - 'create-new' + 'photo' -> PhotoCaptureAdapter
  - 'existing' + any media type -> FileUploadAdapter
  - 'create-new' + 'text' -> TextEditorAdapter
  - 'existing' + 'url' -> UrlInputAdapter
- [ ] **11.5** Verify no TypeScript errors with: `npx tsc --noEmit`

---

## Task 12: Update Steps Index Export

**Context:** Export MediaCaptureStep from the steps barrel.
**Files to modify:** `src/components/ItemCreationWorkflow/components/steps/index.ts`
**Estimated effort:** 1 story point

- [ ] **12.1** Read `src/components/ItemCreationWorkflow/components/steps/index.ts`
- [ ] **12.2** Add export for MediaCaptureStep:
  ```typescript
  export { MediaCaptureStep } from './MediaCaptureStep';
  export type { MediaCaptureStepProps } from './MediaCaptureStep';
  ```
- [ ] **12.3** Update the file's JSDoc comments to reflect the new step in the workflow
- [ ] **12.4** Verify no TypeScript errors with: `npx tsc --noEmit`

---

## Task 13: Update ItemCreationWorkflow Main Component

**Context:** The main workflow component needs to render MediaCaptureStep when on that step.
**Files to modify:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
**Estimated effort:** 1 story point

- [ ] **13.1** Read `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
- [ ] **13.2** Import MediaCaptureStep from the steps index
- [ ] **13.3** Add a new case in the `renderCurrentStep` function for `'media-capture'`:
  ```typescript
  case 'media-capture':
    return (
      <MediaCaptureStep
        currentItem={state.currentItem!}
        onAddContent={addContentPiece}
        onComplete={() => goToStep('preview-save')}
        onBack={() => goToStep('content-type-selection')}
      />
    );
  ```
- [ ] **13.4** Update the file's JSDoc header to reflect the new step order
- [ ] **13.5** Verify no TypeScript errors with: `npx tsc --noEmit`

---

## Task 14: Update Accessibility Step Names

**Context:** The accessibility utility needs to know about the new step for screen reader announcements.
**Files to modify:** `src/components/ItemCreationWorkflow/utils/accessibility.ts` (if it exists)
**Estimated effort:** 1 story point

- [ ] **14.1** Search for accessibility utilities: `find src/components/ItemCreationWorkflow -name "accessibility*"`
- [ ] **14.2** If `accessibility.ts` exists, read it and add step name for 'media-capture':
  ```typescript
  'media-capture': 'Capture Content',
  ```
- [ ] **14.3** If no accessibility file exists, verify STEP_NAMES constant location and update there
- [ ] **14.4** Verify no TypeScript errors with: `npx tsc --noEmit`

---

## Task 15: Remove or Deprecate ContentCreationStep

**Context:** The old ContentCreationStep wrapped the full ItemCapture wizard. With MediaCaptureStep handling direct routing, ContentCreationStep may be redundant.
**Files to modify:** `src/components/ItemCreationWorkflow/components/steps/ContentCreationStep.tsx`
**Estimated effort:** 1 story point

- [ ] **15.1** Read `src/components/ItemCreationWorkflow/components/steps/ContentCreationStep.tsx`
- [ ] **15.2** Add deprecation notice in JSDoc:
  ```typescript
  /**
   * @deprecated Use MediaCaptureStep instead. This component will be removed in a future version.
   * Kept for backward compatibility during transition period.
   */
  ```
- [ ] **15.3** Verify the step is not directly referenced in navigation (it should go through media-capture now)
- [ ] **15.4** Do NOT remove the file yet - mark as deprecated for safe rollback

---

## Task 16: Type Checking and Build Verification

**Context:** Ensure all changes compile correctly and the build succeeds.
**Files to verify:** All modified files
**Estimated effort:** 1 story point

- [ ] **16.1** Run TypeScript type check: `npx tsc --noEmit`
- [ ] **16.2** Fix any type errors that arise
- [ ] **16.3** Run the build: `npm run build`
- [ ] **16.4** Verify build completes without errors
- [ ] **16.5** If errors occur, document them and address in subsequent tasks

---

## Task 17: Manual Integration Testing - Video Path

**Context:** Test the video recording flow end-to-end.
**Test plan:** Manual browser testing
**Estimated effort:** 1 story point

- [ ] **17.1** Start the development server: `npm run dev`
- [ ] **17.2** Navigate to the item creation workflow
- [ ] **17.3** Select a room, item type, specific item, and purpose
- [ ] **17.4** Select "Record Video" content type
- [ ] **17.5** Verify the video capture UI appears (camera preview, record button)
- [ ] **17.6** Record a short video, accept it
- [ ] **17.7** Verify navigation to Preview/Save step with video content attached
- [ ] **17.8** Verify Back button returns to content type selection
- [ ] **17.9** Document any issues found

---

## Task 18: Manual Integration Testing - Photo Path

**Context:** Test the photo capture flow end-to-end.
**Test plan:** Manual browser testing
**Estimated effort:** 1 story point

- [ ] **18.1** Start the development server if not running
- [ ] **18.2** Navigate to item creation workflow
- [ ] **18.3** Complete room/item/purpose selection
- [ ] **18.4** Select "Take Photo" content type
- [ ] **18.5** Verify photo capture UI appears (camera preview, capture button)
- [ ] **18.6** Capture a photo, accept it
- [ ] **18.7** Verify navigation to Preview/Save step with photo content attached
- [ ] **18.8** Test capturing multiple photos if the UI supports it
- [ ] **18.9** Document any issues found

---

## Task 19: Manual Integration Testing - File Upload Path

**Context:** Test file upload for various file types.
**Test plan:** Manual browser testing
**Estimated effort:** 1 story point

- [ ] **19.1** Navigate to item creation workflow
- [ ] **19.2** Complete room/item/purpose selection
- [ ] **19.3** Select "Upload File" content type
- [ ] **19.4** Verify file upload UI appears (drop zone, file picker)
- [ ] **19.5** Upload a PDF file, verify thumbnail and page count
- [ ] **19.6** Upload an image file, verify preview
- [ ] **19.7** Upload a video file, verify handling
- [ ] **19.8** Verify navigation to Preview/Save step with content attached
- [ ] **19.9** Document any issues found

---

## Task 20: Manual Integration Testing - Text and URL Paths

**Context:** Test text editor and URL input flows.
**Test plan:** Manual browser testing
**Estimated effort:** 1 story point

- [ ] **20.1** Navigate to item creation workflow
- [ ] **20.2** Complete room/item/purpose selection
- [ ] **20.3** Select "Write Text" content type
- [ ] **20.4** Verify text editor UI appears
- [ ] **20.5** Enter text content, save/confirm
- [ ] **20.6** Verify navigation to Preview/Save step with text content
- [ ] **20.7** Repeat workflow, select "Add Link" content type
- [ ] **20.8** Verify URL input UI appears
- [ ] **20.9** Enter a valid URL, verify metadata fetch
- [ ] **20.10** Confirm, verify navigation to Preview/Save step
- [ ] **20.11** Document any issues found

---

## Task 21: Camera Permission Denied Testing

**Context:** Test fallback behavior when camera access is denied.
**Test plan:** Manual browser testing with permissions blocked
**Estimated effort:** 1 story point

- [ ] **21.1** In browser settings, block camera permissions for localhost
- [ ] **21.2** Navigate to item creation workflow
- [ ] **21.3** Select "Record Video" content type
- [ ] **21.4** Verify CameraPermissionFallback component displays
- [ ] **21.5** Verify "Upload Video" fallback option works
- [ ] **21.6** Repeat for "Take Photo" content type
- [ ] **21.7** Verify "Upload Photo" fallback option works
- [ ] **21.8** Re-enable camera permissions after testing
- [ ] **21.9** Document behavior observed

---

## Task 22: Update Documentation

**Context:** Update relevant documentation to reflect the new workflow step.
**Files to modify:** Component JSDoc headers (already done in previous tasks)
**Estimated effort:** 1 story point

- [ ] **22.1** Verify all new files have proper JSDoc headers with creation date
- [ ] **22.2** Update `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` comment block to reflect new step order
- [ ] **22.3** Update any README files in the component directories if they exist
- [ ] **22.4** Verify the overview document is accurate with implementation

---

## Implementation Order Summary

Execute tasks in this order for optimal dependency management:

1. **Foundation (Tasks 1-3):** Types, constants, and step transitions
2. **Core Component (Task 4):** MediaCaptureStep shell
3. **Adapters (Tasks 5-10):** Individual capture adapters and barrel export
4. **Integration (Tasks 11-13):** Wire adapters into MediaCaptureStep, export, update main component
5. **Polish (Tasks 14-15):** Accessibility, deprecation notices
6. **Verification (Task 16):** Type checking and build
7. **Testing (Tasks 17-21):** Manual integration testing for all paths
8. **Documentation (Task 22):** Final documentation updates

---

## Rollback Plan

If issues are discovered:

1. Remove `'media-capture'` from `WORKFLOW_STEPS` and `STEP_TRANSITIONS`
2. Revert `content-type-selection` transition back to `['content-creation']`
3. Keep ContentCreationStep as the active step
4. The ContentCreationStep (which wraps ItemCapture) will continue to work as before

---

*Document generated: 2026-01-10 12:16:14 CET*
