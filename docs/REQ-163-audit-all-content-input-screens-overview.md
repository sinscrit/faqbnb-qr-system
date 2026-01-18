# REQ-163: Audit Content Input Screens for Duplicate Navigation - Technical Overview

**Document Generated:** 2026-01-09 14:45 UTC
**Last Modified:** 2026-01-09 14:45 UTC
**Request ID:** REQ-163
**Phase:** 4 - Remove Duplicate Navigation
**Task ID:** 4.1
**Implementation Plan Reference:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`

---

## 1. Executive Summary

This document provides a comprehensive audit of all content input screens in the Item Capture workflow that currently display bottom/step navigation controls. The audit identifies navigation patterns, documents which elements appear on each screen, and provides the foundation for navigation consolidation in Task 4.2.

### Key Findings

| Screen | Location | Has Bottom Navigation | Navigation Type | Elements |
|--------|----------|----------------------|-----------------|----------|
| TextEditorStep | ItemCapture | **Yes** | Step Navigation | Back + Continue/Skip |
| FileUploadStep | ItemCapture | **Yes** | Step Navigation | Back + Continue/Skip |
| VideoCaptureStep | ItemCapture | **No** | Mode-based controls | Camera controls only |
| PhotoCaptureStep | ItemCapture | **Yes** | Step Navigation | Back + Continue/Skip |
| UrlInputStep | ItemCapture | **Partial** | Back button only | Back (no Continue) |
| NextActionStep | ItemCreationWorkflow | **No** | Action Cards | Card-based navigation |

---

## 2. Technical Context

### 2.1 Component Locations

```
src/components/
├── ItemCapture/
│   └── components/
│       └── steps/
│           ├── TextEditorStep.tsx      # Lines 556-584
│           ├── FileUploadStep.tsx      # Lines 708-733
│           ├── VideoCaptureStep.tsx    # No bottom nav
│           ├── PhotoCaptureStep.tsx    # Lines 966-991
│           └── UrlInputStep.tsx        # Lines 444-453
└── ItemCreationWorkflow/
    └── components/
        └── steps/
            └── NextActionStep.tsx      # Action cards, no bottom nav
```

### 2.2 Current Navigation Prop Interfaces

All content step components share a similar navigation interface:

```typescript
// Common props across content steps
interface ContentStepProps {
  state: ItemCaptureState;
  goToStep: (step: WizardStep) => void;
  prevStep: () => void;
  // ... component-specific props
}
```

---

## 3. Detailed Screen Analysis

### 3.1 TextEditorStep (`TextEditorStep.tsx`)

**File Location:** `src/components/ItemCapture/components/steps/TextEditorStep.tsx`
**Lines with Navigation:** 556-584

**Current Navigation Pattern:**
```typescript
{/* Step Navigation */}
<div className="mt-6">
  <div className="flex justify-between items-center">
    <button type="button" onClick={handleBack}
      className="px-4 py-2 text-gray-600 hover:text-gray-900...">
      Back
    </button>
    <button type="button" onClick={handleContinue}
      disabled={isOverLimit}
      className={cn('px-6 py-2 rounded-lg...',
        localContent.trim() ? 'bg-blue-600...' : 'bg-gray-100...')}>
      {localContent.trim() ? 'Continue' : 'Skip'}
    </button>
  </div>
</div>
```

**Navigation Elements:**
- **Back Button:** Always visible, calls `handleBack()` which saves content and calls `prevStep()`
- **Continue/Skip Button:** Dynamic label based on content state
  - Shows "Skip" when no content
  - Shows "Continue" when content exists
  - Disabled when over character limit
  - Navigates to `'add-more'` step

**Logic:**
- Continue saves pending content before navigation
- Back also saves pending content before navigation

---

### 3.2 FileUploadStep (`FileUploadStep.tsx`)

**File Location:** `src/components/ItemCapture/components/steps/FileUploadStep.tsx`
**Lines with Navigation:** 708-733

**Current Navigation Pattern:**
```typescript
{/* Step Navigation */}
<div className="mt-6">
  <div className="flex justify-between items-center">
    <button type="button" onClick={handleBack}
      className="px-4 py-2 text-gray-600 hover:text-gray-900...">
      Back
    </button>
    <button type="button" onClick={handleContinue}
      className={cn('px-6 py-2 rounded-lg...',
        hasFiles ? 'bg-blue-600...' : 'bg-gray-100...')}>
      {hasFiles ? 'Continue' : 'Skip'}
    </button>
  </div>
</div>
```

**Navigation Elements:**
- **Back Button:** Always visible, calls `handleBack()` which calls `prevStep()`
- **Continue/Skip Button:** Dynamic label based on file state
  - Shows "Skip" when no files uploaded
  - Shows "Continue" when files exist
  - Navigates to `'add-more'` step

**Logic:**
- Simple navigation without save operations (files are added immediately)

---

### 3.3 VideoCaptureStep (`VideoCaptureStep.tsx`)

**File Location:** `src/components/ItemCapture/components/steps/VideoCaptureStep.tsx`
**Navigation:** Mode-based camera controls (NO bottom navigation)

**Current Navigation Pattern:**
This component does NOT have traditional bottom navigation. Instead, it uses:

1. **Camera Controls (Preview/Recording Mode):**
   - Camera switch button
   - Record/Stop button
   - No explicit Back/Continue buttons

2. **Review Mode Controls (Lines 649-694):**
   - Retake button (returns to preview)
   - Accept button (adds media and navigates to `'add-more'`)

3. **Error State Navigation:**
   - CameraPermissionFallback component provides "Upload File" option
   - Retry button for recoverable errors

**Navigation Logic:**
- User must explicitly accept the recorded video to proceed
- Keyboard: Escape key handles step-appropriate actions (stop recording, retake, or go back)

**Recommendation for Task 4.2:**
- This component already follows a clean pattern without bottom navigation
- No changes needed

---

### 3.4 PhotoCaptureStep (`PhotoCaptureStep.tsx`)

**File Location:** `src/components/ItemCapture/components/steps/PhotoCaptureStep.tsx`
**Lines with Navigation:** 966-991

**Current Navigation Pattern:**
```typescript
{/* Step Navigation */}
<div className="mt-6">
  <div className="flex justify-between items-center">
    <button type="button" onClick={handleBack}
      className="px-4 py-2 text-gray-600 hover:text-gray-900...">
      Back
    </button>
    <button type="button" onClick={handleContinue}
      className={cn('px-6 py-2 rounded-lg...',
        capturedPhotos.length > 0 ? 'bg-blue-600...' : 'bg-gray-100...')}>
      {capturedPhotos.length > 0 ? 'Continue' : 'Skip'}
    </button>
  </div>
</div>
```

**Navigation Elements:**
- **Back Button:** Always visible, stops camera and calls `prevStep()`
- **Continue/Skip Button:** Dynamic label based on captured photos
  - Shows "Skip" when no photos captured
  - Shows "Continue" when photos exist
  - Navigates to `'add-more'` step

**Additional Navigation in Other Modes:**
- **Review Mode (Lines 765-810):** Retake/Accept buttons (inline, not bottom nav)
- **Gallery Mode (Lines 679-739):** Close, Delete, Previous/Next buttons (overlay navigation)

---

### 3.5 UrlInputStep (`UrlInputStep.tsx`)

**File Location:** `src/components/ItemCapture/components/steps/UrlInputStep.tsx`
**Lines with Navigation:** 444-453

**Current Navigation Pattern:**
```typescript
{/* Back Button */}
<div className="flex justify-start">
  <button type="button" onClick={prevStep}
    className="flex items-center gap-2 px-4 py-2 text-gray-700...">
    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
    <span>Back</span>
  </button>
</div>
```

**Navigation Elements:**
- **Back Button Only:** Left-aligned, calls `prevStep()` directly
- **No Continue Button:** Navigation happens through "Add Link" buttons within preview/form

**Other Navigation Actions:**
- "Add Link" button (within preview card) - adds URL and navigates to `'add-more'`
- "Add Link Anyway" button (proceed without preview) - adds URL and navigates
- "Fetch Preview" button - validates URL, not navigation

**Unique Pattern:**
- This component uses a form submission pattern rather than bottom navigation
- The "Continue" action is embedded in the form's "Add Link" buttons

---

### 3.6 NextActionStep (`NextActionStep.tsx`)

**File Location:** `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`
**Navigation:** Action cards (NO bottom navigation bar)

**Current Navigation Pattern:**
- Uses ActionCard components for navigation options
- No traditional bottom navigation bar

**Action Cards (Lines 237-270):**
1. **Add More to This Item** (conditional)
   - Only shows if `lastSavedItem` exists AND content limit not reached
   - Calls `onAddMore()`

2. **Tag New Item** (always visible)
   - Calls `onTagNewItem()`

3. **I'm Done** (always visible)
   - Calls `handleDoneClick()` which may show EmptySessionDialog

**Recommendation for Task 4.2:**
- This component already follows the clean pattern described in Plan-094
- Already provides exactly 3 action cards as specified
- No additional bottom navigation bar exists
- May need Cancel confirmation dialog integration per Plan-094 Task 4.4

---

## 4. Navigation Pattern Summary

### 4.1 Components WITH Bottom Navigation (Need Modification)

| Component | Current Pattern | Recommended Action |
|-----------|----------------|-------------------|
| TextEditorStep | Back + Continue/Skip buttons | Keep inline, already integrated |
| FileUploadStep | Back + Continue/Skip buttons | Keep inline, already integrated |
| PhotoCaptureStep | Back + Continue/Skip buttons | Keep inline, already integrated |

### 4.2 Components WITHOUT Bottom Navigation (No Changes Needed)

| Component | Current Pattern | Notes |
|-----------|----------------|-------|
| VideoCaptureStep | Mode-based controls | Clean camera workflow |
| UrlInputStep | Back only + form actions | Form submission pattern |
| NextActionStep | Action cards | Already clean design |

### 4.3 Navigation Button Styling Comparison

All components with bottom navigation use consistent styling:

```typescript
// Back Button (consistent across all)
className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors
           focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-lg"

// Continue/Skip Button (consistent across all)
className={cn(
  'px-6 py-2 rounded-lg transition-colors',
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  hasContent
    ? 'bg-blue-600 text-white hover:bg-blue-700'
    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
)}
```

---

## 5. Authorized Files and Functions for Modification

### 5.1 Files Authorized for Task 4.2 (Remove Duplicate Navigation)

| File | Status | Modification Type |
|------|--------|-------------------|
| `src/components/ItemCapture/components/steps/TextEditorStep.tsx` | Review | Lines 556-584 - Evaluate if navigation is inline or bottom bar |
| `src/components/ItemCapture/components/steps/FileUploadStep.tsx` | Review | Lines 708-733 - Evaluate if navigation is inline or bottom bar |
| `src/components/ItemCapture/components/steps/VideoCaptureStep.tsx` | No Change | Already clean |
| `src/components/ItemCapture/components/steps/PhotoCaptureStep.tsx` | Review | Lines 966-991 - Evaluate if navigation is inline or bottom bar |
| `src/components/ItemCapture/components/steps/UrlInputStep.tsx` | Review | Lines 444-453 - Consider adding Continue action |
| `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` | Modify | Add Cancel confirmation dialog per Task 4.4 |

### 5.2 Functions Authorized for Modification

| File | Function | Purpose |
|------|----------|---------|
| TextEditorStep.tsx | `handleBack()` | Navigation callback |
| TextEditorStep.tsx | `handleContinue()` | Navigation callback |
| FileUploadStep.tsx | `handleBack()` | Navigation callback |
| FileUploadStep.tsx | `handleContinue()` | Navigation callback |
| PhotoCaptureStep.tsx | `handleBack()` | Navigation callback |
| PhotoCaptureStep.tsx | `handleContinue()` | Navigation callback |
| NextActionStep.tsx | `handleDoneClick()` | Add confirmation dialog logic |

---

## 6. Recommendations for Task 4.2

### 6.1 Clarification Needed

Based on this audit, the existing navigation in TextEditorStep, FileUploadStep, and PhotoCaptureStep appears to be **inline step navigation** (Back + Continue at the bottom of the component), NOT a separate "bottom navigation bar" that duplicates other navigation.

**Question for Implementation:**
Does Plan-094 Task 4.2 intend to:
1. **Remove ALL bottom navigation** from these components (requiring alternative navigation)?
2. **Keep inline Back/Continue** but remove a separate bottom navigation bar (which doesn't currently exist)?
3. **Consolidate** the styling and ensure consistent button placement?

### 6.2 Current State Assessment

The components currently follow a consistent pattern:
- **Back button:** Left-aligned, subtle styling
- **Continue/Skip button:** Right-aligned, primary styling when content exists

This pattern is already **clean and consistent**. The main improvements recommended:

1. **Ensure buttons remain visible** (not scrolled off) on mobile
2. **Add Cancel confirmation** to NextActionStep per Task 4.4
3. **Consider adding Continue action** to UrlInputStep for consistency

---

## 7. Dependencies and Integration Points

### 7.1 Shared Components

- `StepNavigation` - Imported in PhotoCaptureStep but not currently used for bottom navigation
- `CameraPermissionFallback` - Used in VideoCaptureStep and PhotoCaptureStep for error recovery

### 7.2 Integration with ItemCreationWorkflow

The `goToStep()` and `prevStep()` callbacks connect content input screens to the main workflow orchestrator:

```typescript
// Common navigation target
goToStep('add-more') // After content is added
prevStep() // Back navigation
```

---

## 8. Testing Considerations

### 8.1 Acceptance Criteria Verification

- [x] All content input screens with bottom navigation identified
- [x] TextEditorStep confirmed - Has navigation (Lines 556-584)
- [x] FileUploadStep confirmed - Has navigation (Lines 708-733)
- [x] VideoCaptureStep confirmed - No traditional bottom navigation
- [x] PhotoCaptureStep confirmed - Has navigation (Lines 966-991)
- [x] UrlInputStep confirmed - Partial (Back only, Lines 444-453)
- [x] NextActionStep confirmed - No bottom navigation (uses action cards)
- [x] Navigation elements documented for each screen
- [x] Findings available for stakeholder review

### 8.2 Screens for Mobile Testing in Task 4.2

1. TextEditorStep - Verify buttons visible with keyboard open
2. FileUploadStep - Verify buttons visible with file grid
3. PhotoCaptureStep - Verify buttons visible with thumbnail strip
4. UrlInputStep - Verify button alignment matches other screens

---

## 9. References

- **Implementation Plan:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`
- **Request:** `/docs/gen_requests.md` - REQ-163
- **Related Tasks:**
  - Task 4.2: Remove Bottom Navigation from Content Screens
  - Task 4.3: Update Button Logic
  - Task 4.4: Fix NextActionStep (Add Cancel Confirmation)

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-09 14:45 UTC | Tech Lead Agent | Initial audit complete |
