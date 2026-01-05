# Implementation Breakdown: Error Handling and Edge Cases for Item Creation Workflow

**Document ID:** REQ-113-Overview
**Request Reference:** REQ-113 (docs/gen_requests.md)
**Implementation Plan Reference:** docs/prd/Plan-093-Item-Creation-Workflow.md (Phase 7, Task 7.1)
**Created:** 2026-01-05 12:45:00 UTC
**Last Modified:** 2026-01-05 12:45:00 UTC

---

## 1. Summary

This document provides the technical implementation breakdown for enhancing error handling and edge case management within the Item Creation Workflow. The implementation focuses on six key scenarios:

1. **Network lost during URL preview** - Graceful degradation with retry and proceed-without-preview options
2. **Camera permission denied fallback** - Alternative input methods when camera access fails
3. **Long item names (truncation with tooltip)** - Consistent UI handling of lengthy text
4. **Empty session "I'm done" prompt** - Confirmation dialog for sessions with no items
5. **Session refresh recovery** - Restoring workflow state after browser refresh
6. **Duplicate item name handling** - Warning indicators for similar item names

---

## 2. Context from Implementation Plan

### Phase Context
- **Phase:** 7 - Polish & Edge Cases
- **Task ID:** 7.1
- **Estimated Effort:** 1 day
- **Dependencies:** Phases 1-6 (all core workflow functionality must be complete)

### Technical Decisions from Plan
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Session Persistence | localStorage | Simple, no backend dependency; sufficient for draft recovery |
| URL Preview | Server-side API route | CORS restrictions prevent client-side Open Graph fetching |
| Error States | Reducer-based with SET_ERROR/CLEAR_ERROR actions | Consistent with existing patterns |
| Styling | Tailwind with Airbnb tokens | Design system compliance |

### Existing Patterns to Follow
- **Error handling in hooks:** `useUrlPreview.ts` already has timeout and error state management
- **Camera permission handling:** `CameraPreview.tsx` and `PhotoCaptureStep.tsx` have comprehensive error displays with "Open Settings" and "Try Again" buttons
- **Session persistence:** `useSessionPersistence.ts` and `sessionStorage.ts` already implement auto-save and recovery
- **Text truncation:** `NextActionStep.tsx` uses `truncateText()` helper for item names
- **Confirmation dialogs:** `ConfirmExitDialog.tsx` and `RemoveItemDialog.tsx` use Radix UI patterns

---

## 3. Ordered Implementation Tasks

### Task 1: Network Lost During URL Preview Enhancement

**Priority:** High
**Estimated Story Points:** 2

**Objective:** Enhance the existing `useUrlPreview` hook to better distinguish between temporary network issues and permanent failures, providing clear recovery options.

#### Sub-tasks:

1.1. **Add network status detection to useUrlPreview**
   - Add `navigator.onLine` check before fetch
   - Create `NetworkStatus` type: `'online' | 'offline' | 'unknown'`
   - Add `isNetworkError` flag to distinguish network vs server errors

1.2. **Create NetworkErrorIndicator component**
   - Display "Preview unavailable - Network issue" message
   - Show retry button with loading state
   - Show "Proceed without preview" option
   - Apply Airbnb design tokens (error colors, spacing)

1.3. **Update ContentCreationStep URL handling**
   - Integrate NetworkErrorIndicator when `useUrlPreview.isError && isNetworkError`
   - Allow proceeding with URL even when preview fails
   - Store URL content without thumbnail when preview unavailable

1.4. **Add unit tests**
   - Test network offline detection
   - Test retry functionality
   - Test proceeding without preview

**Files to Create:**
- `src/components/ItemCreationWorkflow/components/shared/NetworkErrorIndicator.tsx`
- `src/components/ItemCreationWorkflow/components/shared/__tests__/NetworkErrorIndicator.test.tsx`

**Files to Modify:**
- `src/components/ItemCreationWorkflow/hooks/useUrlPreview.ts`
- `src/components/ItemCreationWorkflow/hooks/__tests__/useUrlPreview.test.ts`

---

### Task 2: Camera Permission Denied Fallback

**Priority:** High
**Estimated Story Points:** 2

**Objective:** When camera permissions are denied in the ContentCreationStep (for video/photo capture), provide graceful fallback to file upload options.

#### Sub-tasks:

2.1. **Create CameraPermissionFallback component**
   - Detect `PERMISSION_DENIED` error from ItemCapture/CameraPreview
   - Display friendly message: "Camera access not available"
   - Show fallback options: "Upload File" button
   - Include link/instructions to enable camera in browser settings

2.2. **Update ContentCreationStep to handle permission denial**
   - Catch camera permission errors from ItemCapture
   - Switch to upload-only mode when permission denied
   - Preserve workflow step state (don't force back navigation)

2.3. **Add permission status persistence**
   - Store permission status in sessionStorage (avoid repeated prompts)
   - Show upload-first UI when previously denied

2.4. **Add unit tests**
   - Test permission denied detection
   - Test fallback UI rendering
   - Test file upload fallback flow

**Files to Create:**
- `src/components/ItemCreationWorkflow/components/shared/CameraPermissionFallback.tsx`
- `src/components/ItemCreationWorkflow/components/shared/__tests__/CameraPermissionFallback.test.tsx`

**Files to Modify:**
- `src/components/ItemCreationWorkflow/components/steps/ContentCreationStep.tsx`
- `src/components/ItemCreationWorkflow/components/steps/__tests__/ContentCreationStep.test.tsx` (if exists)

---

### Task 3: Long Item Names Truncation with Tooltip

**Priority:** Medium
**Estimated Story Points:** 2

**Objective:** Implement consistent truncation of item names exceeding 40 characters with tooltips showing the full name on hover/long-press.

#### Sub-tasks:

3.1. **Create TruncatedText component**
   - Accept `text`, `maxLength` (default 40), and `className` props
   - Use CSS `text-overflow: ellipsis` with title attribute as simple tooltip
   - Implement Radix UI Tooltip for enhanced tooltip on hover
   - Support mobile long-press for tooltip trigger

3.2. **Add truncation utility function to constants.ts**
   - Create `truncateWithEllipsis(text: string, maxLength: number): string`
   - Create `shouldTruncate(text: string, maxLength: number): boolean`

3.3. **Apply TruncatedText to SessionItemCard**
   - Replace inline truncation with TruncatedText component
   - Apply to item name display (h3 element)

3.4. **Apply TruncatedText to NextActionStep**
   - Update existing `truncateText` usage to use TruncatedText component
   - Apply tooltip for "Add More to This Item" card description

3.5. **Apply TruncatedText to WorkflowHeader (if item name shown)**
   - Check if header displays current item name
   - Apply truncation if applicable

3.6. **Add unit tests**
   - Test truncation at exactly 40 characters
   - Test tooltip visibility on hover
   - Test accessibility (ARIA labels)

**Files to Create:**
- `src/components/ItemCreationWorkflow/components/shared/TruncatedText.tsx`
- `src/components/ItemCreationWorkflow/components/shared/__tests__/TruncatedText.test.tsx`

**Files to Modify:**
- `src/components/ItemCreationWorkflow/utils/constants.ts`
- `src/components/ItemCreationWorkflow/components/shared/SessionItemCard.tsx`
- `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`

---

### Task 4: Empty Session "I'm Done" Prompt

**Priority:** Medium
**Estimated Story Points:** 1

**Objective:** When user clicks "I'm Done" with no items created in the session, display a confirmation dialog asking whether to add items or exit.

#### Sub-tasks:

4.1. **Create EmptySessionDialog component**
   - Radix UI AlertDialog pattern (consistent with existing dialogs)
   - Message: "No items added yet. Add items or exit session?"
   - Two buttons: "Add Items" (primary) and "Exit Session" (secondary)
   - Apply Airbnb design system styling

4.2. **Update NextActionStep to detect empty session**
   - Check `itemsCreated === 0` when "I'm Done" clicked
   - Show EmptySessionDialog instead of proceeding to session-summary

4.3. **Update ItemCreationWorkflow main component**
   - Handle EmptySessionDialog actions
   - "Add Items" should navigate back to room-selection
   - "Exit Session" should call onSessionExit callback

4.4. **Add unit tests**
   - Test dialog appears when session empty
   - Test "Add Items" navigation
   - Test "Exit Session" callback

**Files to Create:**
- `src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx`
- `src/components/ItemCreationWorkflow/components/shared/__tests__/EmptySessionDialog.test.tsx`

**Files to Modify:**
- `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`
- `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

---

### Task 5: Session Refresh Recovery Enhancement

**Priority:** High
**Estimated Story Points:** 2

**Objective:** Enhance existing session persistence to properly restore workflow state after browser refresh, including step position and work-in-progress items.

#### Sub-tasks:

5.1. **Create SessionRecoveryBanner component**
   - Show when session recovered from localStorage
   - Message: "Your previous session has been restored"
   - Show count of content pieces needing re-upload (binary data)
   - "Continue" and "Start Fresh" buttons
   - Auto-dismiss after 5 seconds with manual dismiss option

5.2. **Update ItemCreationWorkflow to detect recovered session**
   - Check for recoverable session on mount using `useSessionPersistence`
   - Show SessionRecoveryBanner when session restored
   - Handle "Start Fresh" action (reset to initial state)

5.3. **Enhance sessionStorage.ts for edge cases**
   - Add validation of restored state structure
   - Handle corrupted data gracefully (clear and start fresh)
   - Add timestamp validation (don't restore sessions >24h old)

5.4. **Handle content needing re-upload**
   - Display indicator in PreviewSaveStep for content marked as needsReUpload
   - Prevent saving items with invalid/missing binary content
   - Guide user to re-capture or re-upload content

5.5. **Add unit tests**
   - Test session recovery detection
   - Test banner display and dismiss
   - Test corrupted data handling
   - Test expiration logic

**Files to Create:**
- `src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx`
- `src/components/ItemCreationWorkflow/components/shared/__tests__/SessionRecoveryBanner.test.tsx`

**Files to Modify:**
- `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
- `src/components/ItemCreationWorkflow/utils/sessionStorage.ts`
- `src/components/ItemCreationWorkflow/hooks/useSessionPersistence.ts`

---

### Task 6: Duplicate Item Name Handling

**Priority:** Medium
**Estimated Story Points:** 2

**Objective:** Detect when user enters an item name that matches or is similar to existing items in the current session, and show a warning indicator.

#### Sub-tasks:

6.1. **Create duplicateName detection utility**
   - `checkDuplicateName(name: string, existingNames: string[]): DuplicateCheckResult`
   - Return type: `{ isDuplicate: boolean; matchingNames: string[]; similarity?: number }`
   - Case-insensitive exact match detection
   - Optional: fuzzy matching for "similar" names (e.g., "Kitchen - Stove" vs "Kitchen - Stove 2")

6.2. **Create DuplicateNameWarning component**
   - Yellow warning indicator icon (AlertTriangle from lucide-react)
   - Tooltip/inline message: "Similar name already used"
   - Non-blocking (user can proceed)
   - Apply Airbnb warning color tokens

6.3. **Integrate into SpecificItemStep**
   - Check item name against session items as user types
   - Show DuplicateNameWarning below ItemNameEditor when duplicate detected
   - Debounce checking to avoid excessive calls

6.4. **Integrate into ItemNameEditor display**
   - Add optional warning prop to ItemNameEditor
   - Display warning icon inline if duplicate

6.5. **Add unit tests**
   - Test exact match detection
   - Test case-insensitive matching
   - Test warning display
   - Test user can proceed despite warning

**Files to Create:**
- `src/components/ItemCreationWorkflow/utils/duplicateNameCheck.ts`
- `src/components/ItemCreationWorkflow/utils/__tests__/duplicateNameCheck.test.ts`
- `src/components/ItemCreationWorkflow/components/shared/DuplicateNameWarning.tsx`
- `src/components/ItemCreationWorkflow/components/shared/__tests__/DuplicateNameWarning.test.tsx`

**Files to Modify:**
- `src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx`
- `src/components/ItemCreationWorkflow/components/shared/ItemNameEditor.tsx`

---

## 4. Authorized Files and Functions for Modification

### Files Authorized for Modification

| File Path | Modification Type | Scope |
|-----------|-------------------|-------|
| `src/components/ItemCreationWorkflow/hooks/useUrlPreview.ts` | Enhance | Add network status detection, isNetworkError flag |
| `src/components/ItemCreationWorkflow/hooks/__tests__/useUrlPreview.test.ts` | Enhance | Add tests for network handling |
| `src/components/ItemCreationWorkflow/components/steps/ContentCreationStep.tsx` | Enhance | Add camera fallback, network error handling |
| `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` | Enhance | Add empty session detection, use TruncatedText |
| `src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx` | Enhance | Add duplicate name detection integration |
| `src/components/ItemCreationWorkflow/components/shared/SessionItemCard.tsx` | Enhance | Use TruncatedText component |
| `src/components/ItemCreationWorkflow/components/shared/ItemNameEditor.tsx` | Enhance | Add warning prop for duplicate names |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | Enhance | Add truncation utilities |
| `src/components/ItemCreationWorkflow/utils/sessionStorage.ts` | Enhance | Add validation, expiration handling |
| `src/components/ItemCreationWorkflow/hooks/useSessionPersistence.ts` | Enhance | Add recovery state tracking |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Enhance | Add recovery banner, empty session dialog handling |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Enhance | Add new type definitions if needed |
| `src/components/ItemCreationWorkflow/components/shared/index.ts` | Enhance | Export new components |

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/components/shared/NetworkErrorIndicator.tsx` | Network error display with retry |
| `src/components/ItemCreationWorkflow/components/shared/CameraPermissionFallback.tsx` | Camera denied fallback UI |
| `src/components/ItemCreationWorkflow/components/shared/TruncatedText.tsx` | Reusable truncation with tooltip |
| `src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx` | Empty session confirmation |
| `src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx` | Session restored notification |
| `src/components/ItemCreationWorkflow/components/shared/DuplicateNameWarning.tsx` | Duplicate name indicator |
| `src/components/ItemCreationWorkflow/utils/duplicateNameCheck.ts` | Duplicate detection utilities |

### Functions Authorized for Modification

| Function | File | Modification |
|----------|------|--------------|
| `useUrlPreview()` | hooks/useUrlPreview.ts | Add network detection return values |
| `serializeState()` | utils/sessionStorage.ts | Add validation |
| `deserializeState()` | utils/sessionStorage.ts | Add validation, version checking |
| `loadMostRecentWorkflowState()` | utils/sessionStorage.ts | Add expiration enforcement |
| `useSessionPersistence()` | hooks/useSessionPersistence.ts | Add recovery state tracking |
| `ItemCreationWorkflow()` | ItemCreationWorkflow.tsx | Add recovery handling |
| `NextActionStep()` | components/steps/NextActionStep.tsx | Add empty session check |
| `SpecificItemStep()` | components/steps/SpecificItemStep.tsx | Add duplicate check |
| `truncateText()` | components/steps/NextActionStep.tsx | Move to shared utility |

---

## 5. Dependencies and Prerequisites

### Prerequisites
- All Phase 1-6 tasks must be complete
- `useSessionPersistence` hook must be functioning correctly
- `useUrlPreview` hook must be implemented
- `ConfirmExitDialog` pattern must be available as reference

### External Dependencies
No new external dependencies required. All functionality uses existing:
- Radix UI (AlertDialog, Tooltip)
- Lucide React icons
- Tailwind CSS

### Internal Dependencies
| Task | Depends On |
|------|------------|
| Task 2 (Camera Fallback) | Task 1 (Network Error) - shared error patterns |
| Task 3 (Truncation) | None |
| Task 4 (Empty Session) | Task 3 (Truncation) - consistent text handling |
| Task 5 (Session Recovery) | None |
| Task 6 (Duplicate Names) | Task 3 (Truncation) - warning styling patterns |

---

## 6. Acceptance Criteria Mapping

| Acceptance Criteria | Implementation Task |
|--------------------|---------------------|
| Network connectivity fails during URL preview shows "Preview unavailable" with retry | Task 1 |
| Camera permissions denied shows manual URL entry and file upload options | Task 2 |
| Item names >40 characters truncated with ellipsis, full name on hover/long-press | Task 3 |
| Empty session triggers "No items added yet. Add items or exit session?" dialog | Task 4 |
| Browser refresh restores user position, step progress, and session items | Task 5 |
| Duplicate item name shows warning icon with "Similar name already used" | Task 6 |
| All error states include actionable recovery options | Tasks 1, 2, 5 |
| Network errors distinguish between temporary and permanent failures | Task 1 |

---

## 7. Testing Strategy

### Unit Tests
- Each new component must have corresponding test file
- Test all error states and recovery paths
- Test accessibility (ARIA labels, keyboard navigation)
- Test responsive behavior where applicable

### Integration Tests
- Test full workflow with network interruptions
- Test session recovery after simulated page refresh
- Test camera permission flow with mocked permissions API

### Manual Testing Checklist
- [ ] Disconnect network during URL preview - verify retry works
- [ ] Deny camera permission - verify upload fallback appears
- [ ] Create item with 50+ character name - verify truncation and tooltip
- [ ] Click "I'm Done" with 0 items - verify confirmation dialog
- [ ] Refresh browser mid-workflow - verify session restores
- [ ] Enter duplicate item name - verify warning appears

---

## 8. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Session recovery corrupts state | Low | High | Validate state structure on restore; clear if invalid |
| Network detection unreliable | Medium | Medium | Combine navigator.onLine with fetch timeout detection |
| Tooltip inaccessible on mobile | Medium | Low | Use long-press trigger with haptic feedback |
| Performance impact of duplicate checking | Low | Low | Debounce input; limit check to session items only |

---

## 9. Implementation Notes

### Design System Compliance
- Use Airbnb design tokens from `docs/prd/airbnb_designsystem.md`
- Error states: `#FF5A5F` (error red)
- Warning states: `#FFB400` (warning amber)
- Success states: `#00A699` (success teal)
- Minimum touch targets: 48x48px

### Accessibility Requirements
- All error messages must be announced to screen readers (aria-live)
- Tooltips must be keyboard accessible
- Focus management after dialogs close
- Clear error descriptions with actionable guidance

### Browser Compatibility
- localStorage may be unavailable in private browsing - handle gracefully
- navigator.onLine has known reliability issues - use as hint only
- Camera permissions API varies by browser - test on Chrome, Safari, Firefox

---

## 10. References

- [PRD: Item Creation Workflow](docs/prd/PRD_Item_Creation_Workflow.md)
- [Implementation Plan](docs/prd/Plan-093-Item-Creation-Workflow.md)
- [Request #113](docs/gen_requests.md#req-113)
- [Airbnb Design System](docs/prd/airbnb_designsystem.md)
- [Existing Error Patterns](src/components/ItemCapture/components/shared/CameraPreview.tsx)
- [Session Persistence](src/components/ItemCreationWorkflow/utils/sessionStorage.ts)
- [URL Preview Hook](src/components/ItemCreationWorkflow/hooks/useUrlPreview.ts)

---

*Implementation Breakdown generated on 2026-01-05 for REQ-113: Error Handling and Edge Cases*
