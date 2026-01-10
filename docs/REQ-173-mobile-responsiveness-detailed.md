# REQ-173: Mobile Responsiveness and Touch Interaction Support - Detailed Task Breakdown

**Generated:** 2026-01-09 21:45:00 UTC
**Last Modified:** 2026-01-09 21:45:00 UTC
**Request ID:** REQ-173
**Type:** ENHANCEMENT
**Size:** M
**Phase:** 6 - Integration & Polish
**Task ID:** 6.2
**Parent Overview:** `/docs/REQ-173-mobile-responsiveness-overview.md`

---

## Document Purpose

This document provides a granular, step-by-step implementation guide for ensuring mobile responsiveness and touch interaction support throughout the ItemCreationWorkflow. Each task is designed to be completed in a few hours of focused work (≤1 story point).

---

## Authorized Files for Modification

Per the overview document, modifications are restricted to:

### ItemCreationWorkflow Components
| File Path | Authorized Changes |
|-----------|-------------------|
| `src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx` | Touch target sizes, mobile visibility classes |
| `src/components/ItemCreationWorkflow/components/shared/SortableContentPieceCard.tsx` | Drag behavior props if needed |
| `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx` | Touch target sizes for nav buttons |
| `src/components/ItemCreationWorkflow/components/shared/RoomCard.tsx` | Touch optimization verification |
| `src/components/ItemCreationWorkflow/components/shared/ItemTypeCard.tsx` | Touch optimization verification |
| `src/components/ItemCreationWorkflow/components/shared/SuggestionButton.tsx` | Touch target verification |
| `src/components/ItemCreationWorkflow/components/shared/ItemNameEditor.tsx` | Input touch target |
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | Grid responsive classes |
| `src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx` | Grid responsive classes |
| `src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx` | Grid responsive classes |
| `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` | Card layout classes |
| `src/components/ItemCreationWorkflow/components/steps/SessionSummaryStep.tsx` | Item list layout |

### ItemCapture Components
| File Path | Authorized Changes |
|-----------|-------------------|
| `src/components/ItemCapture/components/steps/FileUploadStep.tsx` | File card touch targets |
| `src/components/ItemCapture/components/shared/MediaThumbnail.tsx` | Preview scaling |

### Utility Files
| File Path | Authorized Changes |
|-----------|-------------------|
| `src/components/ItemCreationWorkflow/utils/constants.ts` | Update `TOUCH_TARGET_MIN_SIZE` if needed |

---

## Implementation Tasks

### Phase 1: Audit & Documentation (No Code Changes)

---

#### Task 1.1: Manual Viewport Testing at 320px Width

**Objective:** Identify all layout issues at minimum mobile viewport width.

**Steps:**
1. Open Chrome DevTools → Device Toolbar
2. Set custom viewport: 320 × 568 (iPhone SE)
3. Start the development server (`npm run dev`)
4. Navigate to the ItemCreationWorkflow at `/admin/items/new`
5. Progress through each step, documenting issues:
   - `room-selection`: Check room card grid overflow
   - `item-type-selection`: Verify card layout
   - `specific-item-selection`: Test input and suggestion button sizing
   - `content-source-selection`: Validate option cards
   - `content-creation`: Test each content type screen
   - `preview-save`: Verify content grid and buttons
   - `next-action`: Check action card layout
   - `session-summary`: Review item list cards
6. Create issue log documenting:
   - Component name
   - Issue description (overflow, clipping, cramped spacing)
   - Screenshot or description
   - Suggested fix

**Verification:**
- [ ] All 8+ workflow steps tested at 320px width
- [ ] Issue log created with findings
- [ ] No horizontal scrolling observed on primary content areas
- [ ] All text remains readable without clipping

**Output:** Issue log file or notes for Phase 4 remediation

---

#### Task 1.2: Touch Target Measurement Audit

**Objective:** Identify all interactive elements below 48px minimum touch target size.

**Steps:**
1. Open Chrome DevTools → Elements panel
2. Navigate through workflow, inspecting each interactive element
3. For each button/link, check computed styles:
   - `width` and `height` (or `min-width`/`min-height`)
   - Padding that contributes to tap area
4. Document elements below 48px in this format:

| Component | Element | Current Size | File Location | Line Number |
|-----------|---------|--------------|---------------|-------------|
| ContentPieceCard | Drag handle | 44×44px | `ContentPieceCard.tsx` | ~309 |
| ContentPieceCard | Remove button | 44×44px | `ContentPieceCard.tsx` | ~341 |
| ContentPieceCard | Retake button | 44×44px | `ContentPieceCard.tsx` | ~328 |
| FileUploadStep | Remove button | ~32×32px (p-2) | `FileUploadStep.tsx` | ~208, ~282 |
| WorkflowHeader | Back button | 48×48px | `WorkflowHeader.tsx` | ~94 |
| WorkflowHeader | Exit button | 48×48px | `WorkflowHeader.tsx` | ~119 |

5. Note any elements with hover-only visibility that won't work on mobile

**Verification:**
- [ ] All interactive elements audited
- [ ] Elements below 48px documented with file/line references
- [ ] Hover-dependent visibility patterns identified

**Output:** Completed audit table for Phase 2 remediation

---

#### Task 1.3: Drag-to-Reorder Mobile Testing

**Objective:** Verify drag-to-reorder functionality works correctly on touch devices.

**Prerequisites:** Multiple content pieces added in PreviewSaveStep

**Steps:**
1. Add 3+ content pieces in workflow to enable drag testing
2. Test on physical iOS device (Safari):
   - Touch and hold on drag handle for 250ms+
   - Verify drag initiates without scrolling the page
   - Drag item to new position
   - Verify drop animation and new order
3. Test on physical Android device (Chrome):
   - Repeat above steps
   - Note any differences in behavior
4. Test edge cases:
   - Scroll page while dragging (should not conflict)
   - Release touch mid-drag unexpectedly
   - Rapid repeated drag operations
5. Document issues:
   - iOS Safari: [any issues]
   - Android Chrome: [any issues]
   - Drag handle visibility on touch (hover-dependent?)

**Verification:**
- [ ] Touch-and-hold initiates drag after delay
- [ ] No scroll/drag conflicts observed
- [ ] Drag overlay displays correctly on mobile
- [ ] Drop animation provides visual feedback
- [ ] No "stuck" drag states when touch ends unexpectedly

**Output:** Mobile drag testing results for Phase 3 if issues found

---

### Phase 2: Touch Target Remediation

---

#### Task 2.1: Update ContentPieceCard Touch Targets to 48px Minimum

**Objective:** Ensure all action buttons in ContentPieceCard meet 48px touch target minimum.

**File:** `src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx`

**Current State:**
- Drag handle: `min-w-[44px] min-h-[44px]` (line ~309)
- Remove button: `min-w-[44px] min-h-[44px]` (line ~341)
- Retake button: `min-w-[44px] min-h-[44px]` (line ~328)

**Changes:**
1. Locate the drag handle button (approximately line 302-317)
2. Update className from `min-w-[44px] min-h-[44px]` to `min-w-[48px] min-h-[48px]`
3. Locate the retake button (approximately line 323-338)
4. Update className from `min-w-[44px] min-h-[44px]` to `min-w-[48px] min-h-[48px]`
5. Locate the remove button (approximately line 340-355)
6. Update className from `min-w-[44px] min-h-[44px]` to `min-w-[48px] min-h-[48px]`

**Code Pattern:**
```tsx
// Before
'min-w-[44px] min-h-[44px] flex items-center justify-center'

// After
'min-w-[48px] min-h-[48px] flex items-center justify-center'
```

**Verification:**
- [ ] All three buttons updated to 48px minimum
- [ ] Visual inspection confirms buttons are not overly large
- [ ] Touch test on mobile device confirms comfortable tap targets
- [ ] Existing functionality (remove, retake, drag) still works
- [ ] Run `npm run build` - no TypeScript errors

**Accessibility Check:**
- [ ] Button `aria-label` attributes unchanged
- [ ] Focus ring visibility preserved

---

#### Task 2.2: Update FileUploadStep Remove Button Touch Targets

**Objective:** Ensure file card remove buttons in FileUploadStep meet 48px touch target.

**File:** `src/components/ItemCapture/components/steps/FileUploadStep.tsx`

**Current State:**
- PDFFileCard remove button: `p-2` (~line 205-218) - approximately 32×32px
- FileCard remove button: `p-2` (~line 279-293) - approximately 32×32px

**Changes:**

1. Locate PDFFileCard remove button (approximately line 205):
```tsx
// Before
className={cn(
  'absolute top-1 right-1 p-2 rounded-full',
  'bg-red-100 text-red-600',
  ...
)}
```

```tsx
// After
className={cn(
  'absolute top-1 right-1 p-3 rounded-full',
  'bg-red-100 text-red-600',
  'min-w-[48px] min-h-[48px] flex items-center justify-center',
  ...
)}
```

2. Locate FileCard remove button (approximately line 279):
   Apply same pattern as above

**Verification:**
- [ ] Both remove buttons updated to 48px minimum
- [ ] Button positioning with `absolute top-1 right-1` still looks correct
- [ ] Touch test confirms comfortable tap targets
- [ ] File removal functionality still works
- [ ] Run `npm run build` - no errors

**Accessibility Check:**
- [ ] `aria-label` attributes preserved (`Remove ${file.name}`)
- [ ] Focus ring (`focus:ring-2 focus:ring-red-500`) preserved

---

#### Task 2.3: Verify WorkflowHeader Touch Targets

**Objective:** Verify back and exit buttons in WorkflowHeader meet 48px requirement.

**File:** `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx`

**Current State:**
- Back button: `w-12 h-12` (48×48px) - line ~98
- Exit button: `w-12 h-12` (48×48px) - line ~123

**Analysis:** These buttons already meet the 48px minimum (12 × 4px = 48px).

**Verification Steps:**
1. Read WorkflowHeader.tsx and confirm `w-12 h-12` classes
2. Verify computed size equals 48×48px in DevTools
3. Touch test on mobile device

**Verification:**
- [ ] Back button confirmed at 48px minimum
- [ ] Exit button confirmed at 48px minimum
- [ ] No changes required (document as verified)

---

#### Task 2.4: Audit and Update SuggestionButton Touch Targets

**Objective:** Verify SuggestionButton component meets touch target requirements.

**File:** `src/components/ItemCreationWorkflow/components/shared/SuggestionButton.tsx`

**Steps:**
1. Read SuggestionButton.tsx to understand current implementation
2. Check button/chip sizing:
   - If using padding only, ensure minimum 48px tap area
   - If height is specified, verify >= 48px
3. If below 48px, update to meet minimum:
```tsx
// Pattern for suggestion buttons
className={cn(
  'min-h-[48px] px-4 py-2',
  'flex items-center justify-center',
  // ... other classes
)}
```

**Verification:**
- [ ] SuggestionButton touch target audited
- [ ] Updates applied if needed
- [ ] Touch test confirms comfortable tapping
- [ ] Visual design remains appropriate (not oversized)

---

#### Task 2.5: Audit ItemNameEditor Input Touch Target

**Objective:** Verify input field in ItemNameEditor has adequate touch target for mobile.

**File:** `src/components/ItemCreationWorkflow/components/shared/ItemNameEditor.tsx`

**Steps:**
1. Read ItemNameEditor.tsx to check input field styling
2. Verify input field height meets at least 48px
3. Standard HTML input fields typically need explicit height:
```tsx
// Pattern for mobile-friendly input
className={cn(
  'min-h-[48px] px-4',
  // ... other classes
)}
```

**Verification:**
- [ ] Input field touch target audited
- [ ] Updates applied if needed
- [ ] Mobile keyboard interaction tested
- [ ] Focus states preserved

---

### Phase 3: Mobile Visibility Fixes

---

#### Task 3.1: Make Drag Handles Always Visible on Mobile

**Objective:** Ensure drag handles are visible on touch devices (which cannot hover).

**File:** `src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx`

**Current State:**
The drag handle may use hover-dependent visibility. Check for patterns like:
- `opacity-0 group-hover:opacity-100`
- `hidden group-hover:block`

**Analysis of Current Code (line ~300-317):**
Looking at the current implementation, the drag handle appears to be always visible when `showDragHandle` is true. However, verify this is the case.

**Pattern to Apply (if hover-dependent):**
```tsx
// Before (hover-only visibility)
className={cn(
  'opacity-0 group-hover:opacity-100',
  // ...
)}

// After (visible on mobile, hover-reveal on desktop)
className={cn(
  'opacity-100 sm:opacity-0 sm:group-hover:opacity-100',
  'focus:opacity-100',  // Keyboard accessibility
  // ...
)}
```

**Verification:**
- [ ] Drag handle visibility checked
- [ ] If hover-dependent, updated to mobile-first visibility
- [ ] Mobile test confirms drag handle is visible without hover
- [ ] Desktop hover behavior preserved

---

#### Task 3.2: Make Action Buttons Visible on Mobile

**Objective:** Ensure remove/retake buttons are accessible on touch devices.

**File:** `src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx`

**Current State (line ~320):**
```tsx
<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
```

**Issue:** `opacity-0 group-hover:opacity-100` hides buttons until hover, making them inaccessible on mobile.

**Change:**
```tsx
// After
<div className={cn(
  "absolute bottom-0 left-0 right-0",
  "bg-gradient-to-t from-black/50 to-transparent p-2",
  "opacity-100 sm:opacity-0 sm:group-hover:opacity-100",  // Always visible on mobile
  "focus-within:opacity-100",  // Visible when child focused
  "transition-opacity"
)}>
```

**Verification:**
- [ ] Action button container updated
- [ ] Mobile test confirms buttons are visible without hover
- [ ] Desktop test confirms hover-reveal still works
- [ ] `focus-within:opacity-100` preserved for keyboard users
- [ ] Run `npm run build` - no errors

---

#### Task 3.3: Verify FileUploadStep Mobile Visibility

**Objective:** Confirm FileUploadStep remove buttons use mobile-first visibility.

**File:** `src/components/ItemCapture/components/steps/FileUploadStep.tsx`

**Current State (line ~211, ~285):**
```tsx
'opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
```

**Analysis:** FileUploadStep already implements the correct mobile-first visibility pattern!

**Verification Steps:**
1. Confirm `opacity-100 sm:opacity-0 sm:group-hover:opacity-100` pattern is used
2. Test on mobile - buttons should be visible
3. Test on desktop - buttons should appear on hover

**Verification:**
- [ ] Pattern confirmed in PDFFileCard remove button
- [ ] Pattern confirmed in FileCard remove button
- [ ] Mobile visibility test passed
- [ ] Document as already compliant

---

### Phase 4: Responsive Layout Fixes

---

#### Task 4.1: Fix 320px Width Overflow Issues

**Objective:** Address any horizontal overflow issues found during Task 1.1 audit.

**Note:** This task depends on findings from Task 1.1. Apply fixes based on audit results.

**Common Fix Patterns:**

**1. Container Overflow:**
```tsx
// Add to containers that overflow
className={cn(
  'max-w-full overflow-hidden',
  // ...existing classes
)}
```

**2. Padding Reduction for Tight Viewports:**
```tsx
// Before
'px-6'

// After (responsive padding)
'px-3 sm:px-6'
```

**3. Grid Column Fallback:**
```tsx
// Before
'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'

// After (single column at extreme small widths if needed)
'grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
```

**Files Potentially Affected:**
- `PreviewSaveStep.tsx` - content grid
- `RoomSelectionStep.tsx` - room card grid
- `ContentTypeStep.tsx` - content option grid
- `NextActionStep.tsx` - action cards
- `SessionSummaryStep.tsx` - item list

**Steps:**
1. Review Task 1.1 audit findings
2. For each overflow issue, apply appropriate fix pattern
3. Test at 320px after each change

**Verification:**
- [ ] All overflow issues from audit addressed
- [ ] No horizontal scrolling at 320px width
- [ ] Content remains readable and usable
- [ ] Spacing appropriate (not cramped)

---

#### Task 4.2: Text Truncation Adjustments

**Objective:** Ensure text doesn't overflow or become unreadable at small viewports.

**Common Fix Patterns:**

**1. Single-line truncation:**
```tsx
<p className="truncate">Long text that should truncate</p>
```

**2. Multi-line truncation with line clamping:**
```tsx
<p className="line-clamp-2">
  Text that should display maximum 2 lines with ellipsis
</p>
```

**3. Title attribute for full text on hover:**
```tsx
<p className="truncate" title={fullTextValue}>
  {displayText}
</p>
```

**Areas to Check:**
- Item names in SessionSummaryStep
- Content piece titles in PreviewSaveStep
- Room and item type labels
- Any user-generated content display

**Steps:**
1. Review audit findings for text overflow issues
2. Apply truncation classes where text overflows container
3. Add `title` attributes for truncated text

**Verification:**
- [ ] No text overflow at 320px viewport
- [ ] Truncated text has `title` attribute for full content
- [ ] Line clamping used for multi-line text where appropriate
- [ ] Readability maintained

---

### Phase 5: Integration Testing

---

#### Task 5.1: Complete Workflow Mobile Testing

**Objective:** Verify entire workflow functions correctly on mobile after all changes.

**Test Scenarios:**

1. **Start-to-Finish Flow at 320px viewport:**
   - Navigate through all workflow steps
   - Verify no horizontal scrolling
   - Confirm all buttons are tappable
   - Complete item creation successfully

2. **Touch Target Testing:**
   - Tap each interactive element
   - Verify comfortable tap (no accidental adjacent taps)
   - Test with different finger sizes if possible

3. **Content Operations:**
   - Add multiple content pieces
   - Drag to reorder content
   - Remove content pieces
   - Retake content (if applicable)

4. **Responsive Breakpoints:**
   - Test at 320px (iPhone SE)
   - Test at 375px (iPhone 12/13)
   - Test at 390px (iPhone 14)
   - Test at 414px (iPhone Plus sizes)

**Verification:**
- [ ] Complete workflow completes successfully at 320px
- [ ] All touch targets comfortable to tap
- [ ] Drag-to-reorder works on mobile
- [ ] No visual regressions at larger breakpoints
- [ ] Form inputs show appropriate mobile keyboards

---

#### Task 5.2: Physical Device Testing

**Objective:** Verify functionality on real devices, not just emulators.

**Prerequisites:** Access to physical iOS and Android devices

**iOS Testing (Safari):**
1. Load application on iPhone (Safari browser)
2. Navigate through complete workflow
3. Test drag-to-reorder functionality
4. Note any iOS-specific issues

**Android Testing (Chrome):**
1. Load application on Android device (Chrome browser)
2. Navigate through complete workflow
3. Test drag-to-reorder functionality
4. Note any Android-specific issues

**Document Results:**
| Device | Browser | Viewport | Issues Found |
|--------|---------|----------|--------------|
| iPhone 12 | Safari | 390×844 | None |
| Pixel 6 | Chrome | 412×915 | None |

**Verification:**
- [ ] iOS Safari testing completed
- [ ] Android Chrome testing completed
- [ ] Any device-specific issues documented
- [ ] Fixes applied if issues found

---

#### Task 5.3: Accessibility Verification for Mobile Changes

**Objective:** Ensure mobile changes maintain accessibility compliance.

**Checks:**
1. **Touch Target Accessibility:**
   - All interactive elements have appropriate `aria-label`
   - Focus states visible on all updated buttons

2. **Visibility Changes:**
   - `focus-within` or `focus:opacity-100` preserves keyboard access
   - Screen reader announcements still work

3. **Lighthouse Accessibility Audit:**
   - Run Lighthouse in DevTools at 320px viewport
   - Review any accessibility warnings
   - Focus on touch target warnings

**Verification:**
- [ ] All buttons maintain `aria-label` attributes
- [ ] Focus states visible on updated elements
- [ ] Lighthouse accessibility score maintained or improved
- [ ] No new accessibility warnings introduced

---

## Testing Checklist Summary

### Manual Testing (Required)
- [ ] Chrome DevTools at 320px width - complete workflow
- [ ] Chrome DevTools at 375px width - complete workflow
- [ ] Chrome DevTools at 390px width - complete workflow
- [ ] Physical iOS device - drag-to-reorder
- [ ] Physical Android device - drag-to-reorder
- [ ] Touch target accessibility audit via Lighthouse

### Automated Testing (Existing)
- [ ] Run `npm run build` - no TypeScript errors
- [ ] Run `npm run lint` - no linting errors
- [ ] Existing unit tests pass (if any for modified files)

### Acceptance Criteria Verification
Per REQ-173:
- [ ] All screens display correctly at 320px viewport width
- [ ] Interactive elements meet 48px touch target minimum
- [ ] Drag-to-reorder responds to touch without scroll conflicts
- [ ] Content previews scale proportionally and remain readable
- [ ] No horizontal scrolling required for primary content
- [ ] Touch interactions feel responsive with visual feedback
- [ ] Forms display appropriate mobile keyboard types

---

## Technical Patterns Reference

### Touch Target Pattern (48px minimum)
```tsx
className={cn(
  'min-w-[48px] min-h-[48px]',
  'flex items-center justify-center',
  'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2'
)}
```

### Mobile-First Visibility Pattern
```tsx
// Visible on mobile (no hover), hover-reveal on desktop
className={cn(
  'opacity-100 sm:opacity-0 sm:group-hover:opacity-100',
  'focus:opacity-100',  // Keyboard accessibility
  'transition-opacity duration-200'
)}
```

### Responsive Padding Pattern
```tsx
// Tighter padding on mobile, relaxed on larger screens
className="px-3 py-2 sm:px-4 sm:py-3 md:px-6"
```

### Text Truncation Pattern
```tsx
// Single line with ellipsis
<span className="truncate" title={fullText}>{displayText}</span>

// Multi-line with clamp
<p className="line-clamp-2">{text}</p>
```

---

## Dependencies

- No new package dependencies required
- Relies on existing Tailwind CSS responsive utilities
- Existing @dnd-kit configuration unchanged
- `TOUCH_TARGET_MIN_SIZE` constant available in `constants.ts`

---

## Risks and Mitigations

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Touch target increases affect visual design | Low | Use padding not size; maintain visual compactness |
| iOS Safari drag behavior differences | Medium | Test on physical device; use @dnd-kit workarounds |
| Existing tests may need updates | Low | Tests use semantic queries, not pixel values |
| Desktop regression from mobile-first visibility | Low | Use `sm:` breakpoint to restore desktop hover |

---

## References

- Overview Document: `/docs/REQ-173-mobile-responsiveness-overview.md`
- Implementation Plan: `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md` (Phase 6, Task 6.2)
- Request: `/docs/gen_requests.md` - REQ-173
- WCAG 2.1 AAA Target Size: https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
- @dnd-kit Touch Sensor: https://docs.dndkit.com/api-documentation/sensors/touch

---

## Appendix: Tailwind Responsive Breakpoints

| Prefix | Min Width | Use Case |
|--------|-----------|----------|
| (none) | 0px | Mobile-first base styles |
| `sm:` | 640px | Large phones, small tablets |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Laptops |
| `xl:` | 1280px | Desktops |

**Note:** For extreme small viewports (< 375px), use base styles without prefix.
