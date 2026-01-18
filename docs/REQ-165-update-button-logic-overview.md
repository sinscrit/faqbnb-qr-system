# REQ-165: Update Button Logic - Implementation Overview

**Document Created**: 2026-01-09 21:30 UTC
**Last Modified**: 2026-01-09 21:30 UTC
**Phase**: 4 - Remove Duplicate Navigation
**Task ID**: 4.3
**Implementation Plan Reference**: `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`

---

## 1. Executive Summary

This request addresses Task 4.3 from Phase 4 of the UI/UX Workflow Improvements plan. The goal is to implement context-aware navigation button logic across content input screens, where buttons change based on whether the user has added content, and ensure navigation buttons remain persistently visible on all viewport sizes.

### Objective
Update the navigation button logic across content input screens to:
1. **Before content is added**: Show only "Back" button
2. **After content is added**: Show "Back" + "Continue" buttons
3. **Ensure buttons are always visible**: Not scrolled off-screen (sticky/fixed positioning)
4. **Mobile-friendly**: Test and verify on mobile viewport sizes (320px minimum)

### Scope
This task modifies the following content step components:
- TextEditorStep
- FileUploadStep
- VideoCaptureStep
- PhotoCaptureStep
- UrlInputStep

---

## 2. Current Implementation Analysis

### 2.1 TextEditorStep (`src/components/ItemCapture/components/steps/TextEditorStep.tsx`)

**Current Navigation (lines 556-584)**:
```typescript
<div className="mt-6">
  <div className="flex justify-between items-center">
    <button onClick={handleBack}>Back</button>
    <button onClick={handleContinue} disabled={isOverLimit}>
      {localContent.trim() ? 'Continue' : 'Skip'}
    </button>
  </div>
</div>
```

**Current Behavior**:
- Always shows Back button
- Continue/Skip button always visible
- Button text changes based on `localContent.trim()`
- Not sticky/fixed - scrolls with content

**Gap Analysis**:
- ✅ Has content-based button label logic
- ❌ Continue button always visible (should be hidden before content)
- ❌ Navigation can scroll off-screen

### 2.2 FileUploadStep (`src/components/ItemCapture/components/steps/FileUploadStep.tsx`)

**Current Navigation (lines 708-732)**:
```typescript
<div className="mt-6">
  <div className="flex justify-between items-center">
    <button onClick={handleBack}>Back</button>
    <button onClick={handleContinue}>
      {hasFiles ? 'Continue' : 'Skip'}
    </button>
  </div>
</div>
```

**Current Behavior**:
- Always shows Back button
- Continue/Skip button always visible
- Button text changes based on `hasFiles`
- Not sticky/fixed - scrolls with content

**Gap Analysis**:
- ✅ Has content-based button label logic via `hasFiles`
- ❌ Continue button always visible (should be hidden before content)
- ❌ Navigation can scroll off-screen

### 2.3 VideoCaptureStep (`src/components/ItemCapture/components/steps/VideoCaptureStep.tsx`)

**Current Navigation**:
- **Preview Mode**: No Back button, only Record button in controls section
- **Recording Mode**: Only Stop button visible
- **Review Mode**: Retake/Accept buttons (lines 649-694)

**Gap Analysis**:
- ❌ No Back button in preview mode
- ❌ No Continue navigation in preview mode
- ✅ Review mode has appropriate Retake/Accept pattern
- ❌ Navigation (where exists) can scroll off-screen

### 2.4 PhotoCaptureStep (`src/components/ItemCapture/components/steps/PhotoCaptureStep.tsx`)

**Current Navigation (lines 966-990)**:
```typescript
<div className="mt-6">
  <div className="flex justify-between items-center">
    <button onClick={handleBack}>Back</button>
    <button onClick={handleContinue}>
      {capturedPhotos.length > 0 ? 'Continue' : 'Skip'}
    </button>
  </div>
</div>
```

**Current Behavior**:
- Always shows Back button
- Continue/Skip button always visible
- Button text changes based on `capturedPhotos.length > 0`
- Not sticky/fixed - scrolls with content

**Gap Analysis**:
- ✅ Has content-based button label logic
- ❌ Continue button always visible (should be hidden before content)
- ❌ Navigation can scroll off-screen

### 2.5 UrlInputStep (`src/components/ItemCapture/components/steps/UrlInputStep.tsx`)

**Current Navigation (lines 444-453)**:
```typescript
<div className="flex justify-start">
  <button onClick={prevStep}>
    <ArrowLeft /> Back
  </button>
</div>
```

**Current Behavior**:
- Only Back button visible
- No Continue button (navigation via inline "Add Link" button)
- Not sticky/fixed - scrolls with content

**Gap Analysis**:
- ✅ Only shows Back (Continue is contextual via Add Link buttons)
- ⚠️ Unique pattern - navigation is context-specific
- ❌ Navigation can scroll off-screen

---

## 3. Implementation Approach

### 3.1 Design Pattern: Context-Aware Navigation

**Before Content Added**:
```
┌─────────────────────────────────────┐
│          Content Area               │
│                                     │
├─────────────────────────────────────┤
│ [Back]                              │ ← Only Back visible
└─────────────────────────────────────┘
```

**After Content Added**:
```
┌─────────────────────────────────────┐
│          Content Area               │
│                                     │
├─────────────────────────────────────┤
│ [Back]                   [Continue] │ ← Both visible
└─────────────────────────────────────┘
```

### 3.2 Design Pattern: Sticky Navigation

Use Tailwind's `sticky bottom-0` with background for persistent visibility:

```tsx
{/* Sticky Navigation Footer */}
<div className="sticky bottom-0 bg-white border-t border-gray-200 py-4 px-4 mt-6 -mx-4">
  <div className="flex justify-between items-center max-w-2xl mx-auto">
    <button type="button" onClick={handleBack} className="...">
      Back
    </button>
    {hasContent && (
      <button type="button" onClick={handleContinue} className="...">
        Continue
      </button>
    )}
  </div>
</div>
```

### 3.3 Content Detection Logic

| Screen | Content Presence Check |
|--------|----------------------|
| TextEditorStep | `localContent.trim().length > 0` |
| FileUploadStep | `hasFiles` (from useFileUpload hook) |
| VideoCaptureStep | N/A for preview; Review mode uses Retake/Accept |
| PhotoCaptureStep | `capturedPhotos.length > 0` |
| UrlInputStep | `preview !== null || proceedWithoutPreview` |

---

## 4. Implementation Tasks

### Task 4.3.1: Create Shared Navigation Component (Optional Enhancement)

Create a reusable `ContentStepNavigation` component to standardize navigation across all content steps.

**File**: `src/components/ItemCapture/components/shared/ContentStepNavigation.tsx`

```typescript
export interface ContentStepNavigationProps {
  onBack: () => void;
  onContinue?: () => void;
  hasContent: boolean;
  continueLabel?: string;
  isDisabled?: boolean;
  className?: string;
}
```

**Tasks**:
- [ ] Create ContentStepNavigation component
- [ ] Implement sticky positioning with `sticky bottom-0`
- [ ] Add background with border-top for visual separation
- [ ] Conditionally render Continue button based on `hasContent`
- [ ] Support custom continue label
- [ ] Support disabled state
- [ ] Export from `shared/index.ts`

### Task 4.3.2: Update TextEditorStep Navigation

**File**: `src/components/ItemCapture/components/steps/TextEditorStep.tsx`

**Changes Required**:
1. **Conditionally show Continue button** based on content:
   - Current: Always shows Continue/Skip
   - New: Only show Continue when `localContent.trim()` is not empty
2. **Make navigation sticky**:
   - Add `sticky bottom-0 bg-white border-t border-gray-200`
   - Adjust padding/margins to prevent content overlap

**Code Changes**:
```typescript
// Lines 556-584: Replace navigation section
{/* Sticky Navigation Footer */}
<div className="sticky bottom-0 bg-white border-t border-gray-200 py-4 mt-6">
  <div className="flex justify-between items-center">
    <button type="button" onClick={handleBack} className="...">
      Back
    </button>
    {localContent.trim() && (
      <button type="button" onClick={handleContinue} disabled={isOverLimit} className="...">
        Continue
      </button>
    )}
  </div>
</div>
```

**Tasks**:
- [ ] Update navigation wrapper with sticky positioning
- [ ] Add conditional rendering for Continue button
- [ ] Remove Skip option (only show Continue when content exists)
- [ ] Test on mobile viewports

### Task 4.3.3: Update FileUploadStep Navigation

**File**: `src/components/ItemCapture/components/steps/FileUploadStep.tsx`

**Changes Required**:
1. **Conditionally show Continue button** based on `hasFiles`
2. **Make navigation sticky**

**Code Changes**:
```typescript
// Lines 708-732: Replace navigation section
{/* Sticky Navigation Footer */}
<div className="sticky bottom-0 bg-white border-t border-gray-200 py-4 mt-6">
  <div className="flex justify-between items-center">
    <button type="button" onClick={handleBack} className="...">
      Back
    </button>
    {hasFiles && (
      <button type="button" onClick={handleContinue} className="...">
        Continue
      </button>
    )}
  </div>
</div>
```

**Tasks**:
- [ ] Update navigation wrapper with sticky positioning
- [ ] Add conditional rendering for Continue button based on `hasFiles`
- [ ] Remove Skip option (only show Continue when files exist)
- [ ] Test on mobile viewports

### Task 4.3.4: Update VideoCaptureStep Navigation

**File**: `src/components/ItemCapture/components/steps/VideoCaptureStep.tsx`

**Changes Required**:
1. **Add Back button to preview mode**
2. **Keep existing Retake/Accept pattern for review mode**
3. **Make navigation sticky where applicable**

**Note**: VideoCaptureStep has unique navigation patterns:
- **Preview Mode**: Add Back button; no Continue (recording hasn't happened)
- **Recording Mode**: Only Stop button (recording in progress)
- **Review Mode**: Keep Retake/Accept pattern (post-recording decision)

**Code Changes for Preview Mode** (add after controls section ~line 821):
```typescript
{/* Back Navigation - Preview Mode Only */}
{mode === 'preview' && (
  <div className="sticky bottom-0 bg-white border-t border-gray-200 py-4 mt-6">
    <div className="flex justify-start">
      <button type="button" onClick={prevStep} className="...">
        Back
      </button>
    </div>
  </div>
)}
```

**Tasks**:
- [ ] Add Back button to preview mode (only shows Back)
- [ ] Make the Back button sticky at bottom
- [ ] Ensure navigation doesn't appear during recording/review modes
- [ ] Test on mobile viewports

### Task 4.3.5: Update PhotoCaptureStep Navigation

**File**: `src/components/ItemCapture/components/steps/PhotoCaptureStep.tsx`

**Changes Required**:
1. **Conditionally show Continue button** based on `capturedPhotos.length > 0`
2. **Make navigation sticky**

**Code Changes**:
```typescript
// Lines 966-990: Replace navigation section
{/* Sticky Navigation Footer */}
<div className="sticky bottom-0 bg-white border-t border-gray-200 py-4 mt-6">
  <div className="flex justify-between items-center">
    <button type="button" onClick={handleBack} className="...">
      Back
    </button>
    {capturedPhotos.length > 0 && (
      <button type="button" onClick={handleContinue} className="...">
        Continue
      </button>
    )}
  </div>
</div>
```

**Tasks**:
- [ ] Update navigation wrapper with sticky positioning
- [ ] Add conditional rendering for Continue button based on captured photos
- [ ] Remove Skip option (only show Continue when photos exist)
- [ ] Test on mobile viewports

### Task 4.3.6: Update UrlInputStep Navigation

**File**: `src/components/ItemCapture/components/steps/UrlInputStep.tsx`

**Changes Required**:
1. **Keep Back-only pattern** (Continue is handled by inline "Add Link" button)
2. **Make navigation sticky**

**Note**: UrlInputStep has a unique pattern where navigation forward is via the inline "Add Link" button, not a separate Continue button. The Back-only approach is intentional.

**Code Changes**:
```typescript
// Lines 444-453: Update to sticky
{/* Sticky Back Navigation */}
<div className="sticky bottom-0 bg-white border-t border-gray-200 py-4 mt-6">
  <div className="flex justify-start">
    <button type="button" onClick={prevStep} className="...">
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back
    </button>
  </div>
</div>
```

**Tasks**:
- [ ] Update navigation wrapper with sticky positioning
- [ ] Keep Back-only pattern (intentional design)
- [ ] Test on mobile viewports

### Task 4.3.7: Mobile Viewport Testing

**Tasks**:
- [ ] Test TextEditorStep at 320px width
- [ ] Test FileUploadStep at 320px width
- [ ] Test VideoCaptureStep at 320px width
- [ ] Test PhotoCaptureStep at 320px width
- [ ] Test UrlInputStep at 320px width
- [ ] Verify sticky navigation doesn't obscure content
- [ ] Verify 48px minimum touch targets on all buttons
- [ ] Test landscape orientation on mobile

---

## 5. Authorized Files and Functions for Modification

### Primary Files (Step Components)

| File Path | Functions/Sections to Modify | Change Type |
|-----------|------------------------------|-------------|
| `src/components/ItemCapture/components/steps/TextEditorStep.tsx` | Navigation render section (lines 556-584) | MODIFY - Add conditional, make sticky |
| `src/components/ItemCapture/components/steps/FileUploadStep.tsx` | Navigation render section (lines 708-732) | MODIFY - Add conditional, make sticky |
| `src/components/ItemCapture/components/steps/VideoCaptureStep.tsx` | Preview mode render (add after line ~821) | ADD - Back button with sticky |
| `src/components/ItemCapture/components/steps/PhotoCaptureStep.tsx` | Navigation section (lines 966-990) | MODIFY - Add conditional, make sticky |
| `src/components/ItemCapture/components/steps/UrlInputStep.tsx` | Back button section (lines 444-453) | MODIFY - Make sticky |

### Optional New Files (Shared Component)

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/components/shared/ContentStepNavigation.tsx` | Reusable navigation component (optional) |

### Files to Reference

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/components/shared/StepNavigation.tsx` | Existing navigation pattern reference |
| `src/lib/utils.ts` | `cn()` utility for className composition |

---

## 6. Design Specifications

### 6.1 Button Styling Standards

**Back Button**:
```typescript
className="px-4 py-2 min-h-[48px] text-gray-600 hover:text-gray-900
           transition-colors focus:outline-none focus:ring-2
           focus:ring-gray-500 focus:ring-offset-2 rounded-lg"
```

**Continue Button** (Primary Action):
```typescript
className={cn(
  'px-6 py-2 min-h-[48px] rounded-lg transition-colors',
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  'bg-blue-600 text-white hover:bg-blue-700'
)}
```

### 6.2 Sticky Navigation Container

```typescript
className="sticky bottom-0 bg-white border-t border-gray-200 py-4 mt-6
           -mx-4 px-4 sm:mx-0 sm:px-0"
```

**Notes**:
- `sticky bottom-0`: Anchors to viewport bottom when scrolling
- `bg-white`: Solid background to cover scrolling content
- `border-t border-gray-200`: Visual separator from content
- `py-4`: Vertical padding for comfortable touch
- `-mx-4 px-4`: Full-width on mobile (compensates for parent padding)
- `sm:mx-0 sm:px-0`: Normal margins on larger screens

### 6.3 Responsive Considerations

- **Minimum Touch Target**: 48px height for all buttons
- **Mobile Viewport**: Test at 320px width
- **Sticky Behavior**: Works in flex/overflow containers
- **Safe Areas**: Consider iOS safe-area-inset-bottom for notched devices

---

## 7. Dependencies

### Existing Dependencies (No New Installs)
- Tailwind CSS (`sticky`, `bottom-0`, responsive utilities)
- `cn()` utility from `@/lib/utils`
- Lucide React icons (ArrowLeft, etc.)

---

## 8. Testing Checklist

### Functional Testing

| Test Case | TextEditor | FileUpload | VideoCapture | PhotoCapture | UrlInput |
|-----------|------------|------------|--------------|--------------|----------|
| Only Back visible before content | [ ] | [ ] | [ ] | [ ] | [ ] |
| Continue appears after content added | [ ] | [ ] | N/A | [ ] | N/A |
| Back navigates to previous step | [ ] | [ ] | [ ] | [ ] | [ ] |
| Continue navigates to next step | [ ] | [ ] | N/A | [ ] | N/A |
| Navigation stays visible on scroll | [ ] | [ ] | [ ] | [ ] | [ ] |

### Mobile Testing (320px viewport)

- [ ] TextEditorStep: Buttons fit, no horizontal overflow
- [ ] FileUploadStep: Buttons fit, no horizontal overflow
- [ ] VideoCaptureStep: Back button accessible
- [ ] PhotoCaptureStep: Buttons fit, no horizontal overflow
- [ ] UrlInputStep: Back button accessible
- [ ] All buttons meet 48px minimum touch target
- [ ] Sticky navigation doesn't obscure content
- [ ] Content remains scrollable above navigation

### Accessibility Testing

- [ ] All buttons keyboard accessible (Tab, Enter, Space)
- [ ] Focus indicators visible on all buttons
- [ ] Screen reader announces button labels correctly
- [ ] Color contrast meets WCAG AA standards

---

## 9. Acceptance Criteria Mapping

From Plan-094 Task 4.3 and REQ-165:

| Criterion | Implementation |
|-----------|---------------|
| Before content: Show only "Back" button | Conditional render based on content state |
| After content: Show "Back" + "Continue" buttons | Both rendered when content exists |
| Ensure buttons are always visible | `sticky bottom-0` positioning |
| Test on mobile viewport sizes | Test at 320px minimum width |
| Navigation buttons remain visible during scrolling | Sticky positioning with solid background |
| Button visibility works correctly on mobile | Touch targets 48px+, full-width container |

---

## 10. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Sticky positioning doesn't work in nested flex containers | Medium | High | Test thoroughly; may need parent overflow adjustments |
| Navigation obscures content on short viewports | Medium | Medium | Add padding-bottom to content area equal to nav height |
| iOS safe area conflicts | Low | Medium | Add `pb-safe` Tailwind class or manual safe-area-inset |
| Users confused by disappearing Continue button | Low | Medium | Clear visual feedback; consider subtle animation |
| Breaking existing navigation flow | Low | High | Comprehensive testing before and after changes |

---

## 11. Estimated Effort

| Task | Estimate |
|------|----------|
| Task 4.3.1: Create shared component (optional) | 1 hour |
| Task 4.3.2: Update TextEditorStep | 0.5 hours |
| Task 4.3.3: Update FileUploadStep | 0.5 hours |
| Task 4.3.4: Update VideoCaptureStep | 0.5 hours |
| Task 4.3.5: Update PhotoCaptureStep | 0.5 hours |
| Task 4.3.6: Update UrlInputStep | 0.5 hours |
| Task 4.3.7: Mobile viewport testing | 1 hour |
| **Total** | **4.5 hours** |

---

## 12. Related Tasks

| Task ID | Title | Relationship |
|---------|-------|--------------|
| 4.1 | Audit All Content Input Screens | Prerequisite (completed analysis) |
| 4.2 | Remove Bottom Navigation from Content Screens | Related (REQ-164 - removes duplicate navigation) |
| 4.4 | Fix NextActionStep | Next task in Phase 4 |

---

## 13. Notes

1. **Skip Button Removal**: The current "Skip" option will be removed. Only "Continue" appears when content exists. Users can go Back if they don't want to add content.

2. **VideoCaptureStep Exception**: This component has unique mode-based navigation (preview/recording/review). Only Back button is added to preview mode; review mode keeps Retake/Accept pattern.

3. **UrlInputStep Pattern**: Maintains Back-only pattern because forward navigation is via inline "Add Link" button after URL preview loads. This is intentional design.

4. **Sticky vs Fixed**: Using `sticky bottom-0` instead of `fixed bottom-0` ensures the navigation stays in document flow and doesn't require explicit z-index management.

5. **Parent Container Consideration**: Sticky positioning requires the parent container to have sufficient height for scrolling. May need to add `min-h-screen` or `flex-1` to parent containers.
