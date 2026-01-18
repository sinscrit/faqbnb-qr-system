# Implementation Overview: Add Missing Media Capture Step to Item Creation Workflow

## Header
| Field | Value |
|-------|-------|
| Request Reference | #176 (REQ-176) |
| Source File | docs/gen_requests.md |
| Original Request Date | 2026-01-10 |
| Breakdown Created | 2026-01-10 12:14:05 CET |
| T-shirt Size | M (Medium) |
| Estimated Effort | 2-3 days (16-24 hours) |

## Goals

The ItemCreationWorkflow currently skips the media capture step after content type selection (Step 5). Users select a content type (Record Video, Take Photo, Write Text, Upload File, Add Link) but are immediately routed to the "Item Details" form (PreviewSaveStep) without the opportunity to actually capture or upload their media content.

### Functional Requirements
1. **Insert Media Capture Step**: Add a new step between ContentTypeStep and PreviewSaveStep that routes to the appropriate capture interface based on selected content type
2. **Video Recording**: Route to camera interface with record/stop controls, preview, and confirm functionality
3. **Photo Capture**: Route to camera interface with capture button, preview, and confirm functionality
4. **File Upload**: Route to file picker with drag-and-drop, preview, and confirm functionality
5. **Text Input**: Route to text editor with markdown support, preview, and save/confirm functionality
6. **Link Input**: Route to URL input with validation, metadata preview, and confirm functionality
7. **Confirmation Gate**: Only proceed to Item Details (PreviewSaveStep) after media is captured AND confirmed

### Assumptions & Clarifications
- The media capture components already exist in `ItemCapture` module and can be reused/adapted
- The workflow should maintain backward compatibility with existing step state management
- Content can be skipped (user can go back) but cannot proceed without captured content
- Each capture interface should include Back and Continue/Confirm navigation
- The existing `ContentCreationStep.tsx` is a placeholder that needs to be implemented with routing logic

## Implementation Plan

### Step 1: Analyze Current Workflow State Management
- **Description**: Understand how `useWorkflowState` hook manages step transitions and state, particularly how `contentType` is stored and how the workflow determines the next step
- **Rationale**: The hook controls all step navigation; understanding it is essential before modifying the flow
- **Estimated Effort**: S (2 hours)

### Step 2: Update Workflow Types for Media Capture Step
- **Description**: Add a new workflow step type `media-capture` to `ItemCreationWorkflow.types.ts` and update the `WorkflowStep` union type. Also ensure `ContentPiece` type supports all media types.
- **Rationale**: Type safety ensures the new step integrates correctly with existing step management
- **Estimated Effort**: S (1 hour)

### Step 3: Implement MediaCaptureStep Router Component
- **Description**: Create a new `MediaCaptureStep.tsx` component that acts as a router, rendering the appropriate capture interface based on `currentItem.contentType`. This component will:
  - Import and conditionally render: VideoCaptureStep, PhotoCaptureStep, FileUploadStep, TextEditorStep, or UrlInputStep
  - Pass through workflow state and callbacks
  - Handle the "confirmed" state transition to proceed to PreviewSaveStep
- **Rationale**: A router component keeps the main workflow clean while properly delegating to specialized capture UIs
- **Estimated Effort**: M (4 hours)

### Step 4: Adapt Existing Capture Components for ItemCreationWorkflow
- **Description**: The capture components in `ItemCapture` module use `ItemCaptureState` which differs from `CurrentItemState`. Create adapter wrappers or modify the components to accept either state type. Key adaptations:
  - Map `CurrentItemState.content` to/from capture component state
  - Ensure `onComplete` callback adds content to `currentItem.content[]` array
  - Handle the `goToStep('preview-save')` navigation after confirmation
- **Rationale**: Reusing proven components reduces bugs; adapters bridge the state type differences
- **Estimated Effort**: M (6 hours)

### Step 5: Update useWorkflowState Hook Step Transition Logic
- **Description**: Modify the `nextStep()` and `prevStep()` functions in `useWorkflowState.ts` to:
  - After ContentTypeStep, route to new `media-capture` step
  - From `media-capture` step, route to `preview-save` only when content exists
  - Update `stepIndex` calculation to include the new step
- **Rationale**: The hook is the single source of truth for step navigation
- **Estimated Effort**: S (2 hours)

### Step 6: Update ItemCreationWorkflow Main Component
- **Description**: Add the new MediaCaptureStep to the step rendering switch statement in `ItemCreationWorkflow.tsx`. Ensure proper props are passed and the step is positioned between ContentTypeStep and PreviewSaveStep.
- **Rationale**: The main component orchestrates which step component renders
- **Estimated Effort**: S (1 hour)

### Step 7: Update Constants and Step Definitions
- **Description**: Update `constants.ts` to include the new step in any step-related constants (step labels, step order, etc.). Update `WORKFLOW_STEPS` if it exists.
- **Rationale**: Constants ensure consistent step labeling across the UI
- **Estimated Effort**: S (1 hour)

### Step 8: Integration Testing and Edge Cases
- **Description**: Test all five content type paths:
  1. Video: Record -> Preview -> Confirm -> Item Details
  2. Photo: Capture -> Preview -> Confirm -> Item Details
  3. Upload: Select files -> Preview -> Confirm -> Item Details
  4. Text: Write -> Preview -> Confirm -> Item Details
  5. Link: Enter URL -> Fetch metadata -> Confirm -> Item Details

  Also test: Back navigation, camera permission denied fallback, network errors
- **Rationale**: Each path has unique UX; comprehensive testing prevents regressions
- **Estimated Effort**: M (4 hours)

### Step 9: Update Progress Indicator (Optional Enhancement)
- **Description**: If a step progress indicator exists, update it to show the new step. The current flow shows steps as Room -> Item Type -> Purpose -> Content Type -> Item Details. The new flow should be Room -> Item Type -> Purpose -> Content Type -> Capture Content -> Item Details.
- **Rationale**: Users should see accurate progress through the workflow
- **Estimated Effort**: S (2 hours)

## Authorized Files and Functions for Modification

> **APPROVED SCOPE**: Changes outside this list require review

### Core Workflow (Step 3, 5, 6)
| File | Target | Type |
|------|--------|------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | `ItemCreationWorkflow()` component, step rendering switch | Modify |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | `WorkflowStep` type, add `'media-capture'` | Modify |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | `nextStep()`, `prevStep()`, step transition logic | Modify |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | `UNIFIED_CONTENT_OPTIONS`, step-related constants | Modify |

### New Components (Step 3, 4)
| File | Target | Type |
|------|--------|------|
| `src/components/ItemCreationWorkflow/components/steps/MediaCaptureStep.tsx` | - | Create |
| `src/components/ItemCreationWorkflow/components/steps/index.ts` | Export MediaCaptureStep | Modify |
| `src/components/ItemCreationWorkflow/components/index.ts` | Ensure step exports | Verify |

### Adapter/Wrapper Components (Step 4)
| File | Target | Type |
|------|--------|------|
| `src/components/ItemCreationWorkflow/components/steps/adapters/VideoCaptureAdapter.tsx` | - | Create (if needed) |
| `src/components/ItemCreationWorkflow/components/steps/adapters/PhotoCaptureAdapter.tsx` | - | Create (if needed) |
| `src/components/ItemCreationWorkflow/components/steps/adapters/FileUploadAdapter.tsx` | - | Create (if needed) |
| `src/components/ItemCreationWorkflow/components/steps/adapters/TextEditorAdapter.tsx` | - | Create (if needed) |
| `src/components/ItemCreationWorkflow/components/steps/adapters/UrlInputAdapter.tsx` | - | Create (if needed) |

### Existing Capture Components (Reference Only - may need minor modifications)
| File | Target | Type |
|------|--------|------|
| `src/components/ItemCapture/components/steps/VideoCaptureStep.tsx` | Props interface, callbacks | Reference/Minor Modify |
| `src/components/ItemCapture/components/steps/PhotoCaptureStep.tsx` | Props interface, callbacks | Reference/Minor Modify |
| `src/components/ItemCapture/components/steps/FileUploadStep.tsx` | Props interface, callbacks | Reference/Minor Modify |
| `src/components/ItemCapture/components/steps/TextEditorStep.tsx` | Props interface, callbacks | Reference/Minor Modify |
| `src/components/ItemCapture/components/steps/UrlInputStep.tsx` | Props interface, callbacks | Reference/Minor Modify |

### Existing Step to Remove/Replace (Step 6)
| File | Target | Type |
|------|--------|------|
| `src/components/ItemCreationWorkflow/components/steps/ContentCreationStep.tsx` | Entire file (placeholder) | Replace or Remove |

## Dependencies

### Internal Dependencies
- **REQ-165**: Sticky navigation pattern (already implemented in capture components)
- **ItemCapture module**: Provides the capture step components to reuse
- **useWorkflowState hook**: Controls all step transitions

### External Dependencies
- **Camera APIs**: MediaDevices API for video/photo capture
- **File APIs**: File System Access API for file upload
- **Clipboard API**: For URL paste functionality
- **react-markdown**: For text editor preview

## Risks and Considerations

### Potential Side Effects
1. **State Type Mismatch**: `ItemCaptureState` vs `CurrentItemState` have different structures. The `mediaItems[]` array vs `content[]` array naming and shape differ.
2. **Navigation Regression**: Changing step transition logic could break existing Back button behavior
3. **Camera Permission UX**: Users who deny camera permissions need clear fallback to file upload
4. **Memory Management**: Camera streams must be properly cleaned up when navigating away

### Testing Requirements
1. **Unit Tests**: Test `useWorkflowState` step transitions with new media-capture step
2. **Integration Tests**: Test each content type path end-to-end
3. **Mobile Testing**: Touch targets, camera orientation, file picker behavior
4. **Permission Testing**: Camera denied, mic denied, storage access
5. **Network Testing**: URL metadata fetch with slow/failed network

### Open Questions
- [ ] Should the MediaCaptureStep allow adding multiple pieces of content before proceeding, or strictly one-at-a-time with "Add More" available later?
- [ ] Should we create adapter components or modify the existing ItemCapture components to be more generic?
- [ ] Is the existing `ContentCreationStep.tsx` intended to be the router, or should it be replaced entirely?
- [ ] Should progress indicator be updated in this PR or as a separate enhancement?

## Out of Scope

Per the original request, the following are explicitly **out of scope**:

1. **New capture UI design**: Reuse existing capture components; no new UI patterns
2. **Backend changes**: No API modifications; frontend-only workflow fix
3. **Multi-content capture**: This request fixes single-content capture flow; batch capture is separate
4. **Analytics/tracking**: No new tracking events in this PR
5. **Offline support**: Network-dependent features (URL metadata) will show appropriate errors
6. **Accessibility audit**: Components already have ARIA; no new a11y work unless bugs found

---

## Appendix: Current vs Expected Flow

### Current (Broken) Flow
```
Room Selection -> Item Type -> Purpose -> Content Type Selection -> [SKIP] -> Item Details (PreviewSaveStep)
                                                                     ^
                                                              No capture step!
```

### Expected (Fixed) Flow
```
Room Selection -> Item Type -> Purpose -> Content Type Selection -> Media Capture -> Item Details (PreviewSaveStep)
                                                                         |
                                                                         v
                                                    +---> Record Video (VideoCaptureStep)
                                                    +---> Take Photo (PhotoCaptureStep)
                                                    +---> Upload File (FileUploadStep)
                                                    +---> Write Text (TextEditorStep)
                                                    +---> Add Link (UrlInputStep)
```

---
*Document generated: 2026-01-10 12:14:05 CET*
