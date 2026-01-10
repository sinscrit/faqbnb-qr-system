# REQ-165: Update Button Logic - Detailed Task Breakdown

**Document Created**: 2026-01-09 22:15:00 UTC
**Last Modified**: 2026-01-09 22:15:00 UTC
**Phase**: 4 - Remove Duplicate Navigation
**Task ID**: 4.3
**Overview Document**: `/docs/REQ-165-update-button-logic-overview.md`
**Implementation Plan Reference**: `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`

---

## Executive Summary

This document provides granular, actionable implementation tasks for REQ-165. The objective is to implement context-aware navigation button logic across content input screens with sticky positioning to ensure buttons remain visible during scrolling.

### Key Changes

1. **Context-Aware Button Visibility**:
   - **Before content added**: Show only "Back" button
   - **After content added**: Show "Back" + "Continue" buttons
   - Remove the "Skip" option entirely

2. **Sticky Navigation**:
   - Navigation buttons remain anchored at bottom of viewport
   - Solid background prevents content from showing through
   - Visual separator (border) distinguishes navigation from content

3. **Mobile Optimization**:
   - Minimum 48px touch targets on all buttons
   - Full-width container on mobile viewports
   - Tested at 320px minimum width

### Affected Components

| Component | Current Behavior | New Behavior |
|-----------|-----------------|--------------|
| TextEditorStep | Always shows Continue/Skip | Show Continue only when `localContent.trim()` |
| FileUploadStep | Always shows Continue/Skip | Show Continue only when `hasFiles` |
| VideoCaptureStep | No Back in preview mode | Add sticky Back button in preview mode |
| PhotoCaptureStep | Always shows Continue/Skip | Show Continue only when `capturedPhotos.length > 0` |
| UrlInputStep | Back only (correct) | Make navigation sticky |

---

## Authorized Files for Modification

From the overview document, these are the **only** files authorized for changes:

| File Path | Modification Scope |
|-----------|-------------------|
| `src/components/ItemCapture/components/steps/TextEditorStep.tsx` | Navigation section (lines 556-584) - Make sticky, conditional Continue |
| `src/components/ItemCapture/components/steps/FileUploadStep.tsx` | Navigation section (lines 708-732) - Make sticky, conditional Continue |
| `src/components/ItemCapture/components/steps/VideoCaptureStep.tsx` | Preview mode (after line ~821) - Add sticky Back button |
| `src/components/ItemCapture/components/steps/PhotoCaptureStep.tsx` | Navigation section (lines 966-990) - Make sticky, conditional Continue |
| `src/components/ItemCapture/components/steps/UrlInputStep.tsx` | Back button section (lines 444-453) - Make sticky |

### Optional New Files

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/components/shared/ContentStepNavigation.tsx` | Optional reusable navigation component |

### Reference Files (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/components/shared/StepNavigation.tsx` | Reference for navigation patterns |
| `src/lib/utils.ts` | `cn()` utility for className composition |

---

## Task Breakdown

### Task 1: Update TextEditorStep Navigation (0.5 SP)

**Objective**: Implement context-aware navigation with sticky positioning for TextEditorStep.

**File**: `src/components/ItemCapture/components/steps/TextEditorStep.tsx`
**Lines**: 556-584

**Current Implementation**:
```typescript
{/* Step Navigation */}
<div className="mt-6">
  <div className="flex justify-between items-center">
    <button type="button" onClick={handleBack} className="...">
      Back
    </button>
    <button type="button" onClick={handleContinue} disabled={isOverLimit} className={cn(...)}>
      {localContent.trim() ? 'Continue' : 'Skip'}
    </button>
  </div>
</div>
```

**Required Changes**:

**1.1 Update Navigation Wrapper for Sticky Positioning**:
```typescript
{/* Sticky Navigation Footer */}
<div className="sticky bottom-0 bg-white border-t border-gray-200 py-4 mt-6 -mx-4 px-4 sm:mx-0 sm:px-0">
  <div className="flex justify-between items-center">
    {/* buttons here */}
  </div>
</div>
```

**1.2 Add Conditional Continue Button Rendering**:
```typescript
<button
  type="button"
  onClick={handleBack}
  className="px-4 py-2 min-h-[48px] text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-lg"
>
  Back
</button>

{localContent.trim() && (
  <button
    type="button"
    onClick={handleContinue}
    disabled={isOverLimit}
    className={cn(
      'px-6 py-2 min-h-[48px] rounded-lg transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      isOverLimit
        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
        : 'bg-blue-600 text-white hover:bg-blue-700'
    )}
  >
    Continue
  </button>
)}
```

**Subtasks**:
1. [ ] Update navigation wrapper div to use `sticky bottom-0 bg-white border-t border-gray-200 py-4 mt-6`
2. [ ] Add `-mx-4 px-4 sm:mx-0 sm:px-0` for full-width on mobile
3. [ ] Add `min-h-[48px]` to Back button for touch target
4. [ ] Wrap Continue button in conditional `{localContent.trim() && (...)}`
5. [ ] Remove "Skip" text option - only render button when content exists
6. [ ] Add `min-h-[48px]` to Continue button for touch target
7. [ ] Verify `isOverLimit` check still works correctly
8. [ ] Run TypeScript check to ensure no errors

**Verification Steps**:
- [ ] Navigate to TextEditorStep with empty content
- [ ] Verify only Back button is visible
- [ ] Type some text content
- [ ] Verify Continue button appears
- [ ] Clear text content
- [ ] Verify Continue button disappears
- [ ] Scroll content up - verify navigation stays at bottom
- [ ] Test at 320px viewport width
- [ ] Verify buttons have 48px touch targets

**Expected Outcome**: TextEditorStep shows Back-only initially; Continue appears after text is entered; navigation is sticky at bottom.

---

### Task 2: Update FileUploadStep Navigation (0.5 SP)

**Objective**: Implement context-aware navigation with sticky positioning for FileUploadStep.

**File**: `src/components/ItemCapture/components/steps/FileUploadStep.tsx`
**Lines**: 708-732

**Current Implementation**:
```typescript
{/* Step Navigation */}
<div className="mt-6">
  <div className="flex justify-between items-center">
    <button type="button" onClick={handleBack} className="...">
      Back
    </button>
    <button type="button" onClick={handleContinue} className={cn(...)}>
      {hasFiles ? 'Continue' : 'Skip'}
    </button>
  </div>
</div>
```

**Required Changes**:

**2.1 Update to Sticky Navigation with Conditional Continue**:
```typescript
{/* Sticky Navigation Footer */}
<div className="sticky bottom-0 bg-white border-t border-gray-200 py-4 mt-6 -mx-4 px-4 sm:mx-0 sm:px-0">
  <div className="flex justify-between items-center">
    <button
      type="button"
      onClick={handleBack}
      className="px-4 py-2 min-h-[48px] text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-lg"
    >
      Back
    </button>

    {hasFiles && (
      <button
        type="button"
        onClick={handleContinue}
        className={cn(
          'px-6 py-2 min-h-[48px] rounded-lg transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'bg-blue-600 text-white hover:bg-blue-700'
        )}
      >
        Continue
      </button>
    )}
  </div>
</div>
```

**Subtasks**:
1. [ ] Update navigation wrapper div to use sticky classes
2. [ ] Add full-width mobile classes (`-mx-4 px-4 sm:mx-0 sm:px-0`)
3. [ ] Add `min-h-[48px]` to Back button
4. [ ] Wrap Continue button in conditional `{hasFiles && (...)}`
5. [ ] Remove conditional button text - always "Continue"
6. [ ] Add `min-h-[48px]` to Continue button
7. [ ] Run TypeScript check

**Verification Steps**:
- [ ] Navigate to FileUploadStep with no files
- [ ] Verify only Back button visible
- [ ] Upload a file
- [ ] Verify Continue button appears
- [ ] Remove all files
- [ ] Verify Continue button disappears
- [ ] Scroll file list - verify navigation stays at bottom
- [ ] Test at 320px viewport width
- [ ] Verify 48px touch targets

**Expected Outcome**: FileUploadStep shows Back-only initially; Continue appears after file(s) uploaded; navigation is sticky.

---

### Task 3: Add Sticky Back Navigation to VideoCaptureStep Preview Mode (0.75 SP)

**Objective**: Add a sticky Back button to VideoCaptureStep preview mode (before recording starts).

**File**: `src/components/ItemCapture/components/steps/VideoCaptureStep.tsx`
**Lines**: After ~821 (after controls section, before screen reader announcements)

**Current State**:
- **Preview mode**: No Back button (gap identified)
- **Recording mode**: No navigation (correct - recording in progress)
- **Review mode**: Retake/Accept buttons (correct - do not modify)

**Implementation Location**:
Add Back navigation after the camera controls section (line ~821) and before the timer aria-live region.

**3.1 Add Sticky Back Button in Preview Mode**:
```typescript
{/* Sticky Back Navigation - Preview Mode Only */}
{mode === 'preview' && (
  <div className="sticky bottom-0 bg-white border-t border-gray-200 py-4 mt-6 -mx-4 px-4 sm:mx-0 sm:px-0">
    <div className="flex justify-start">
      <button
        type="button"
        onClick={prevStep}
        className="px-4 py-2 min-h-[48px] text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-lg"
      >
        Back
      </button>
    </div>
  </div>
)}
```

**Subtasks**:
1. [ ] Verify `prevStep` prop is available in component props
2. [ ] Locate insertion point after controls section (~line 821)
3. [ ] Add conditional rendering `{mode === 'preview' && (...)}`
4. [ ] Add sticky navigation wrapper with full-width mobile classes
5. [ ] Add Back button with consistent styling
6. [ ] Add `min-h-[48px]` for touch target
7. [ ] Ensure Back button does NOT appear in recording mode
8. [ ] Ensure Back button does NOT appear in review mode (Retake/Accept pattern preserved)
9. [ ] Run TypeScript check

**Verification Steps**:
- [ ] Navigate to VideoCaptureStep (preview mode)
- [ ] Verify Back button is visible at bottom
- [ ] Click Back - should return to content type selection
- [ ] Return to VideoCaptureStep
- [ ] Start recording - verify Back button disappears
- [ ] Stop recording - verify review mode shows Retake/Accept (not Back)
- [ ] Test keyboard navigation - Back button is focusable
- [ ] Test at 320px viewport width
- [ ] Verify 48px touch target

**Expected Outcome**: VideoCaptureStep preview mode includes sticky Back button; recording and review modes unchanged.

---

### Task 4: Update PhotoCaptureStep Navigation (0.5 SP)

**Objective**: Implement context-aware navigation with sticky positioning for PhotoCaptureStep.

**File**: `src/components/ItemCapture/components/steps/PhotoCaptureStep.tsx`
**Lines**: 966-990

**Current Implementation**:
```typescript
{/* Step Navigation */}
<div className="mt-6">
  <div className="flex justify-between items-center">
    <button type="button" onClick={handleBack} className="...">
      Back
    </button>
    <button type="button" onClick={handleContinue} className={cn(...)}>
      {capturedPhotos.length > 0 ? 'Continue' : 'Skip'}
    </button>
  </div>
</div>
```

**Required Changes**:

**4.1 Update to Sticky Navigation with Conditional Continue**:
```typescript
{/* Sticky Navigation Footer */}
<div className="sticky bottom-0 bg-white border-t border-gray-200 py-4 mt-6 -mx-4 px-4 sm:mx-0 sm:px-0">
  <div className="flex justify-between items-center">
    <button
      type="button"
      onClick={handleBack}
      className="px-4 py-2 min-h-[48px] text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-lg"
    >
      Back
    </button>

    {capturedPhotos.length > 0 && (
      <button
        type="button"
        onClick={handleContinue}
        className={cn(
          'px-6 py-2 min-h-[48px] rounded-lg transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'bg-blue-600 text-white hover:bg-blue-700'
        )}
      >
        Continue
      </button>
    )}
  </div>
</div>
```

**Subtasks**:
1. [ ] Update navigation wrapper div to use sticky classes
2. [ ] Add full-width mobile classes
3. [ ] Add `min-h-[48px]` to Back button
4. [ ] Wrap Continue button in conditional `{capturedPhotos.length > 0 && (...)}`
5. [ ] Remove "Skip" option - only "Continue" when photos exist
6. [ ] Add `min-h-[48px]` to Continue button
7. [ ] Run TypeScript check

**Verification Steps**:
- [ ] Navigate to PhotoCaptureStep with no photos
- [ ] Verify only Back button visible
- [ ] Capture a photo
- [ ] Verify Continue button appears
- [ ] Delete all photos
- [ ] Verify Continue button disappears
- [ ] Scroll photo list - verify navigation stays at bottom
- [ ] Test at 320px viewport width
- [ ] Verify 48px touch targets

**Expected Outcome**: PhotoCaptureStep shows Back-only initially; Continue appears after photo(s) captured; navigation is sticky.

---

### Task 5: Update UrlInputStep Navigation (0.5 SP)

**Objective**: Make UrlInputStep navigation sticky while maintaining the Back-only pattern.

**File**: `src/components/ItemCapture/components/steps/UrlInputStep.tsx`
**Lines**: 444-453

**Current Implementation**:
```typescript
{/* Back Button */}
<div className="flex justify-start">
  <button
    type="button"
    onClick={prevStep}
    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded"
  >
    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
    <span>Back</span>
  </button>
</div>
```

**Design Note**: UrlInputStep intentionally has only a Back button. Forward navigation is via the inline "Add Link" button which adds links to the list. This pattern is correct and should be preserved.

**Required Changes**:

**5.1 Make Navigation Sticky and Update Styling**:
```typescript
{/* Sticky Back Navigation */}
<div className="sticky bottom-0 bg-white border-t border-gray-200 py-4 mt-6 -mx-4 px-4 sm:mx-0 sm:px-0">
  <div className="flex justify-start">
    <button
      type="button"
      onClick={prevStep}
      className="flex items-center gap-2 px-4 py-2 min-h-[48px] text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-lg"
    >
      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
      <span>Back</span>
    </button>
  </div>
</div>
```

**Subtasks**:
1. [ ] Wrap existing Back button in sticky navigation container
2. [ ] Add `sticky bottom-0 bg-white border-t border-gray-200 py-4 mt-6`
3. [ ] Add full-width mobile classes (`-mx-4 px-4 sm:mx-0 sm:px-0`)
4. [ ] Update button className:
   - Change `text-gray-700` to `text-gray-600` (consistency)
   - Change `focus:ring-cyan-500` to `focus:ring-gray-500` (consistency)
   - Add `min-h-[48px]` for touch target
   - Add `transition-colors` for smooth hover
   - Change `rounded` to `rounded-lg` (consistency)
   - Add `focus:ring-offset-2` (consistency)
5. [ ] Verify ArrowLeft icon import is present
6. [ ] Run TypeScript check

**Verification Steps**:
- [ ] Navigate to UrlInputStep
- [ ] Verify Back button is visible and sticky at bottom
- [ ] Click Back - should return to content type selection
- [ ] Scroll URL list (if present) - verify navigation stays at bottom
- [ ] Test keyboard focus - verify focus ring is gray (not cyan)
- [ ] Test at 320px viewport width
- [ ] Verify 48px touch target

**Expected Outcome**: UrlInputStep Back button is sticky; styling is consistent with other screens; Back-only pattern preserved.

---

### Task 6: Optional - Create Shared ContentStepNavigation Component (0.75 SP)

**Objective**: Create a reusable navigation component to standardize navigation across all content steps.

**File**: `src/components/ItemCapture/components/shared/ContentStepNavigation.tsx`

**Note**: This task is optional but recommended for long-term maintainability. If time-constrained, skip this task and the inline implementations in Tasks 1-5 are sufficient.

**6.1 Create Component**:
```typescript
'use client';

/**
 * ContentStepNavigation Component
 *
 * Provides context-aware sticky navigation for content step components.
 * Shows only Back button initially; Continue appears when content exists.
 *
 * @module ItemCapture/components/shared/ContentStepNavigation
 * @lastModified 2026-01-09 (REQ-165)
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface ContentStepNavigationProps {
  /** Callback for back action */
  onBack: () => void;
  /** Callback for continue action */
  onContinue?: () => void;
  /** Whether content has been added (controls Continue visibility) */
  hasContent: boolean;
  /** Custom label for continue button (default: "Continue") */
  continueLabel?: string;
  /** Whether continue is disabled */
  isContinueDisabled?: boolean;
  /** Optional CSS class */
  className?: string;
}

export function ContentStepNavigation({
  onBack,
  onContinue,
  hasContent,
  continueLabel = 'Continue',
  isContinueDisabled = false,
  className,
}: ContentStepNavigationProps) {
  return (
    <div className={cn(
      'sticky bottom-0 bg-white border-t border-gray-200 py-4 mt-6',
      '-mx-4 px-4 sm:mx-0 sm:px-0',
      className
    )}>
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 min-h-[48px] text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-lg"
        >
          Back
        </button>

        {hasContent && onContinue && (
          <button
            type="button"
            onClick={onContinue}
            disabled={isContinueDisabled}
            className={cn(
              'px-6 py-2 min-h-[48px] rounded-lg transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              isContinueDisabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            )}
          >
            {continueLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export default ContentStepNavigation;
```

**6.2 Export from shared/index.ts**:
```typescript
export { ContentStepNavigation } from './ContentStepNavigation';
export type { ContentStepNavigationProps } from './ContentStepNavigation';
```

**Subtasks**:
1. [ ] Create `ContentStepNavigation.tsx` file
2. [ ] Implement props interface with all necessary options
3. [ ] Implement component with sticky positioning
4. [ ] Add conditional Continue button rendering
5. [ ] Export from `shared/index.ts`
6. [ ] Run TypeScript check
7. [ ] (Optional) Refactor Tasks 1-5 to use shared component

**Verification Steps**:
- [ ] Component renders correctly in isolation
- [ ] Back button always visible
- [ ] Continue button appears only when `hasContent` is true
- [ ] Disabled state works correctly
- [ ] Sticky positioning works
- [ ] TypeScript types are correct

**Expected Outcome**: Reusable navigation component ready for use across content steps.

---

### Task 7: Cross-Screen Sticky Navigation Testing (0.5 SP)

**Objective**: Verify sticky navigation works correctly across all five content screens.

**Test Matrix**:

| Screen | Sticky Works | Back Visible | Continue Logic | Touch Targets |
|--------|-------------|--------------|----------------|---------------|
| TextEditorStep | [ ] | [ ] | Shows when text entered | [ ] |
| FileUploadStep | [ ] | [ ] | Shows when files uploaded | [ ] |
| VideoCaptureStep | [ ] | [ ] | N/A (Back only in preview) | [ ] |
| PhotoCaptureStep | [ ] | [ ] | Shows when photos captured | [ ] |
| UrlInputStep | [ ] | [ ] | N/A (Back only) | [ ] |

**Subtasks**:
1. [ ] Test TextEditorStep sticky behavior with scrolling content
2. [ ] Test FileUploadStep sticky behavior with multiple files
3. [ ] Test VideoCaptureStep sticky Back in preview mode
4. [ ] Test PhotoCaptureStep sticky behavior with multiple photos
5. [ ] Test UrlInputStep sticky behavior with multiple URLs
6. [ ] Verify navigation doesn't overlap with content
7. [ ] Verify background color prevents content showing through
8. [ ] Verify border provides clear visual separation

**Verification Steps**:
- [ ] Each screen: Add content to trigger scrolling
- [ ] Scroll content up - navigation stays at bottom
- [ ] Scroll content down - navigation stays at bottom
- [ ] No visual glitches or flickering
- [ ] Navigation background is solid white

**Expected Outcome**: Sticky navigation works correctly on all five screens.

---

### Task 8: Mobile Viewport Testing (0.5 SP)

**Objective**: Verify navigation works correctly on mobile viewports.

**Test Viewports**:
- 320px (iPhone SE / small phones)
- 390px (iPhone 12/13/14)
- 768px (iPad Mini / tablets)

**Subtasks**:
1. [ ] Test TextEditorStep at 320px - buttons fit, no overflow
2. [ ] Test FileUploadStep at 320px - buttons fit, no overflow
3. [ ] Test VideoCaptureStep at 320px - Back button accessible
4. [ ] Test PhotoCaptureStep at 320px - buttons fit, no overflow
5. [ ] Test UrlInputStep at 320px - Back button accessible
6. [ ] Verify `-mx-4 px-4` creates full-width navigation on mobile
7. [ ] Verify `sm:mx-0 sm:px-0` returns to normal on larger screens
8. [ ] Test landscape orientation on phone viewport
9. [ ] Verify touch targets meet 48px minimum height

**Button Dimension Check**:
| Screen | Button | Measured Height | Pass (≥48px) |
|--------|--------|-----------------|--------------|
| TextEditorStep | Back | | [ ] |
| TextEditorStep | Continue | | [ ] |
| FileUploadStep | Back | | [ ] |
| FileUploadStep | Continue | | [ ] |
| VideoCaptureStep | Back | | [ ] |
| PhotoCaptureStep | Back | | [ ] |
| PhotoCaptureStep | Continue | | [ ] |
| UrlInputStep | Back | | [ ] |

**Verification Steps**:
- [ ] Chrome DevTools mobile emulation at each viewport
- [ ] No horizontal scrollbar appears
- [ ] Buttons don't truncate or wrap unexpectedly
- [ ] Full-width navigation visible on mobile
- [ ] Touch target size verified via DevTools

**Expected Outcome**: All screens work correctly on mobile viewports with 48px+ touch targets.

---

### Task 9: Accessibility Verification (0.5 SP)

**Objective**: Verify all navigation buttons meet accessibility requirements.

**Accessibility Requirements**:
- Focus states clearly visible
- Keyboard navigation works
- Screen reader announces buttons correctly
- Color contrast meets WCAG AA standards
- Touch targets meet 48px minimum (verified in Task 8)

**Subtasks**:
1. [ ] Verify all buttons have `type="button"` attribute
2. [ ] Test Tab key navigation through each step
3. [ ] Verify focus ring appears on keyboard focus (gray for Back, blue for Continue)
4. [ ] Verify focus ring color contrast is sufficient
5. [ ] Test with VoiceOver (macOS) or similar screen reader
6. [ ] Verify screen reader announces "Back" / "Continue" buttons correctly
7. [ ] Test Escape key doesn't accidentally trigger navigation
8. [ ] Verify no focus trap issues

**Screen Reader Test Script**:
1. [ ] Navigate to TextEditorStep
2. [ ] Tab to Back button - verify announcement
3. [ ] Type content to show Continue button
4. [ ] Tab to Continue button - verify announcement
5. [ ] Repeat for each affected screen

**Verification Steps**:
- [ ] Lighthouse accessibility audit shows no button-related issues
- [ ] Keyboard-only navigation completes entire workflow
- [ ] Focus indicators visible on all buttons
- [ ] No accessibility warnings in browser console

**Expected Outcome**: All navigation buttons meet accessibility requirements.

---

### Task 10: End-to-End Button Logic Testing (0.5 SP)

**Objective**: Verify context-aware button visibility works correctly across all workflows.

**Test Scenarios**:

**10.1 TextEditorStep Flow**:
1. [ ] Navigate to TextEditorStep with empty content
2. [ ] Verify only Back button visible
3. [ ] Type "test" in text editor
4. [ ] Verify Continue button appears immediately
5. [ ] Clear all text
6. [ ] Verify Continue button disappears
7. [ ] Type content exceeding limit (if applicable)
8. [ ] Verify Continue is disabled (not hidden)

**10.2 FileUploadStep Flow**:
1. [ ] Navigate to FileUploadStep with no files
2. [ ] Verify only Back button visible
3. [ ] Upload a file
4. [ ] Verify Continue button appears
5. [ ] Remove all files
6. [ ] Verify Continue button disappears
7. [ ] Upload multiple files
8. [ ] Verify Continue still visible

**10.3 VideoCaptureStep Flow**:
1. [ ] Navigate to VideoCaptureStep (preview mode)
2. [ ] Verify only Back button visible at bottom
3. [ ] Click record - verify Back button hidden during recording
4. [ ] Stop recording - verify Retake/Accept visible (not Back/Continue)
5. [ ] Click Retake - verify back to preview with Back button

**10.4 PhotoCaptureStep Flow**:
1. [ ] Navigate to PhotoCaptureStep with no photos
2. [ ] Verify only Back button visible
3. [ ] Capture a photo
4. [ ] Verify Continue button appears
5. [ ] Delete all photos
6. [ ] Verify Continue button disappears
7. [ ] Capture multiple photos
8. [ ] Verify Continue still visible

**10.5 UrlInputStep Flow**:
1. [ ] Navigate to UrlInputStep
2. [ ] Verify only Back button visible (sticky)
3. [ ] Add a URL link
4. [ ] Verify Back button still visible (no Continue - correct)
5. [ ] Scroll URL list (if many items) - verify Back stays at bottom

**Verification Steps**:
- [ ] All five test scenarios pass
- [ ] No console errors during testing
- [ ] Button state changes are immediate (no delay)
- [ ] No visual glitches during state transitions

**Expected Outcome**: Context-aware button logic works correctly on all screens.

---

## Summary

| Task | Description | Story Points | Status |
|------|-------------|--------------|--------|
| 1 | Update TextEditorStep navigation | 0.5 | ⬜ Pending |
| 2 | Update FileUploadStep navigation | 0.5 | ⬜ Pending |
| 3 | Add Back to VideoCaptureStep preview | 0.75 | ⬜ Pending |
| 4 | Update PhotoCaptureStep navigation | 0.5 | ⬜ Pending |
| 5 | Update UrlInputStep navigation | 0.5 | ⬜ Pending |
| 6 | (Optional) Create shared component | 0.75 | ⬜ Optional |
| 7 | Cross-screen sticky testing | 0.5 | ⬜ Pending |
| 8 | Mobile viewport testing | 0.5 | ⬜ Pending |
| 9 | Accessibility verification | 0.5 | ⬜ Pending |
| 10 | End-to-end button logic testing | 0.5 | ⬜ Pending |
| **Total (excluding optional)** | | **4.75** | |
| **Total (with optional)** | | **5.5** | |

---

## Acceptance Criteria Mapping

| REQ-165 Criterion | Task(s) | Verification |
|-------------------|---------|--------------|
| Before viewing content, only "Back" button is displayed | Tasks 1-5 | E2E testing (Task 10) |
| After viewing or interacting with content, both "Back" and "Continue" buttons are displayed | Tasks 1, 2, 4 | E2E testing (Task 10) |
| Navigation buttons remain visible and accessible at all times during scrolling | Tasks 1-5 | Sticky testing (Task 7) |
| Button visibility and positioning works correctly on mobile viewport sizes (tested at minimum 320px width) | Task 8 | Mobile testing checklist |
| Button container does not obscure content or create usability issues | Tasks 7-8 | Visual inspection |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Sticky positioning doesn't work in nested flex containers | Medium | High | Test thoroughly; may need parent overflow adjustments |
| Navigation obscures content on short viewports | Medium | Medium | Background + border provides visual separation |
| iOS safe area conflicts | Low | Medium | Consider adding `pb-safe` Tailwind class if issues arise |
| Users confused by disappearing Continue button | Low | Medium | Immediate state changes; clear visual feedback |
| Touch targets too small on mobile | Low | High | Explicit `min-h-[48px]` class; verified in Task 8 |
| Breaking existing navigation flow | Low | High | E2E testing in Task 10 |

---

## Definition of Done

- [ ] All tasks completed (Tasks 1-5 required; Task 6 optional)
- [ ] TypeScript check passes (`npm run type-check`)
- [ ] All acceptance criteria verified
- [ ] Cross-screen sticky testing completed (Task 7)
- [ ] Mobile viewport testing completed (Task 8)
- [ ] Accessibility verification completed (Task 9)
- [ ] End-to-end button logic testing completed (Task 10)
- [ ] No console errors in development
- [ ] Code committed with descriptive message

---

## Notes

1. **Skip Button Removal**: The "Skip" option is being removed entirely. Users who don't want to add content can simply click Back. This simplifies the UI and makes the Continue button's appearance more meaningful.

2. **VideoCaptureStep Exception**: This component has unique mode-based navigation. Only the preview mode gets a Back button; review mode keeps Retake/Accept pattern unchanged.

3. **UrlInputStep Pattern**: Maintains Back-only because "Add Link" serves as forward navigation. This is intentional.

4. **Sticky vs Fixed**: Using `sticky bottom-0` instead of `fixed bottom-0` ensures navigation stays in document flow without z-index management issues.

5. **Parent Container Consideration**: Sticky positioning requires parent container to have sufficient height. If sticky doesn't work, may need `overflow-y: auto` on parent or restructure component hierarchy.

6. **Full-Width Mobile**: The `-mx-4 px-4 sm:mx-0 sm:px-0` pattern extends navigation edge-to-edge on mobile while respecting parent padding on larger screens.

7. **48px Touch Targets**: Using `min-h-[48px]` ensures buttons meet Material Design touch target guidelines (48dp) which is slightly larger than Apple HIG (44pt) for better mobile usability.

---

## Related Tasks

| Task ID | Title | Relationship |
|---------|-------|--------------|
| 4.1 | Audit All Content Input Screens | Prerequisite (REQ-163 - analysis completed) |
| 4.2 | Remove Bottom Navigation from Content Screens | Related (REQ-164 - removes duplicate navigation) |
| 4.4 | Fix NextActionStep | Next task in Phase 4 |

---
