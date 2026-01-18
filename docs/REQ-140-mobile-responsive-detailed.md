# REQ-140: Mobile-Responsive Dashboard Experience - Detailed Task Breakdown

**Created:** 2026-01-06 16:45:00 UTC
**Last Modified:** 2026-01-06 17:05:00 UTC
**Phase:** 6 - Polish & Accessibility
**Task ID:** 6.4
**Type:** ENHANCEMENT
**Size:** M
**Status:** ✅ COMPLETED

---

## Document Overview

This document provides a granular, actionable task breakdown for implementing mobile-responsive layouts in Dashboard 2. Each task is scoped to approximately 1 story point (a few hours of focused work) and includes specific file locations, code changes, and verification steps.

---

## Pre-Implementation Checklist

- [x] Overview document reviewed: `docs/REQ-140-mobile-responsive-overview.md`
- [x] Requirements reviewed: `docs/gen_requests.md` (REQ-140)
- [x] Implementation Plan reviewed: `docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md`
- [x] Existing patterns verified in `src/components/SimpleDashboard/`
- [x] Authorized files identified

---

## Task Summary

| Task # | Description | File(s) | Estimated Effort |
|--------|-------------|---------|------------------|
| 1 | Update StatisticsCards breakpoint from sm: to md: | StatisticsCards.tsx | 0.25 SP |
| 2 | Add min-h-[48px] to PropertyRow touch target | PropertySection.tsx | 0.25 SP |
| 3 | Add responsive padding to Dashboard page welcome section | page.tsx | 0.25 SP |
| 4 | Make property filter section responsive | page.tsx | 0.25 SP |
| 5 | Increase navigation touch targets on mobile | layout.tsx | 0.25 SP |
| 6 | Audit modals for mobile full-screen compliance | PropertyEditModal.tsx, AddPropertyModal.tsx | 0.25 SP |
| 7 | Test and verify all mobile responsive changes | All modified files | 0.5 SP |

**Total Estimated Effort:** 2 SP (~3 hours)

---

## Detailed Tasks

### Task 1: Update StatisticsCards Breakpoint Alignment

**Goal:** Align statistics cards grid breakpoint with Airbnb Design System (744px mobile cutoff, closest Tailwind is `md:` at 768px)

**File:** `src/components/SimpleDashboard/StatisticsCards.tsx`

**Current State Analysis:**
- Line 109 (LoadingSkeleton): `grid grid-cols-1 sm:grid-cols-3 gap-4` - uses `sm:` (640px)
- Line 235 (Main component): `grid grid-cols-1 sm:grid-cols-3 gap-4` - uses `sm:` (640px)

**Changes Required:**

**Change 1.1 - LoadingSkeleton (line 109):**
```tsx
// BEFORE
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

// AFTER
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
```

**Change 1.2 - Main grid (line 235):**
```tsx
// BEFORE
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

// AFTER
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
```

**Verification Steps:**
- [x] Open dashboard at viewport width 640px - cards should stack vertically (1 per row)
- [x] Open dashboard at viewport width 768px - cards should display 3 per row
- [x] Gap spacing remains consistent (16px / gap-4) at all breakpoints
- [x] Loading skeleton matches same breakpoint behavior

**Acceptance Criteria:**
- [x] Statistics cards display 1 per row on viewports < 768px
- [x] Cards display 3 per row on viewports >= 768px
- [x] No visual regression on desktop layouts

**Implementation Notes (2026-01-06 17:05:00 UTC):**
- Changed `sm:grid-cols-3` to `md:grid-cols-3` in LoadingSkeleton (line 109)
- Changed `sm:grid-cols-3` to `md:grid-cols-3` in main component (line 235)
- Added REQ-140 comment to file header

---

### Task 2: Add Touch Target Minimum Height to PropertyRow

**Goal:** Ensure PropertyRow buttons meet WCAG 2.5.5 touch target requirements (48px minimum)

**File:** `src/components/SimpleDashboard/PropertySection.tsx`

**Current State Analysis:**
- Line 45 (PropertyRow button): Has `p-4` (16px padding) but no explicit minimum height
- SinglePropertyCard (line 142): Already has `min-h-[48px]` - correct
- Add Property button (line 279): Already has `min-h-[48px]` - correct

**Changes Required:**

**Change 2.1 - PropertyRow className (line 45):**
```tsx
// BEFORE
className="w-full flex items-center justify-between p-4 bg-white border-b border-[#DDDDDD] last:border-b-0 hover:bg-[#F7F7F7] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-inset"

// AFTER
className="w-full flex items-center justify-between min-h-[48px] p-4 bg-white border-b border-[#DDDDDD] last:border-b-0 hover:bg-[#F7F7F7] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-inset"
```

**Verification Steps:**
- [x] Inspect PropertyRow elements in DevTools - verify computed height >= 48px
- [x] Test tap interaction on mobile/touch simulator - verify easy selection
- [x] Test with multiple properties to ensure all rows have correct height
- [x] Verify visual appearance hasn't changed (padding should already exceed 48px)

**Acceptance Criteria:**
- [x] PropertyRow button has minimum height of 48px
- [x] Touch targets are large enough for accurate finger taps
- [x] Visual appearance consistent with existing design

**Implementation Notes (2026-01-06 17:05:00 UTC):**
- Added `min-h-[48px]` to PropertyRow button className (line 45)
- Added REQ-140 comment to file header

---

### Task 3: Add Responsive Padding to Welcome Section

**Goal:** Prevent content overflow on narrow mobile screens (320px+) by adjusting padding responsively

**File:** `src/app/dashboard2/page.tsx`

**Current State Analysis:**
- Line 184: Welcome section has fixed `p-8` padding - may cause overflow on 320px screens
- Fixed `rounded-2xl` - could use smaller radius on mobile

**Changes Required:**

**Change 3.1 - Welcome section className (line 184):**
```tsx
// BEFORE
<div className="bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] rounded-2xl p-8 text-white relative">

// AFTER
<div className="bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 text-white relative">
```

**Breakdown of changes:**
- `rounded-2xl` → `rounded-xl md:rounded-2xl` (smaller radius on mobile)
- `p-8` → `p-4 sm:p-6 md:p-8` (progressive padding increase)

**Verification Steps:**
- [x] Test at 320px width - content should fit without horizontal scroll
- [x] Test at 375px width - verify adequate spacing
- [x] Test at 768px+ - verify desktop appearance unchanged
- [x] Check text readability at all breakpoints

**Acceptance Criteria:**
- [x] Welcome section renders correctly at 320px width
- [x] No horizontal scrollbar appears
- [x] Content has appropriate padding at all breakpoints

**Implementation Notes (2026-01-06 17:05:00 UTC):**
- Changed `rounded-2xl` to `rounded-xl md:rounded-2xl`
- Changed `p-8` to `p-4 sm:p-6 md:p-8`
- Added comment for REQ-140 responsive padding

---

### Task 4: Make Property Filter Section Responsive

**Goal:** Ensure property filter selector is usable on mobile (full width, stacked layout)

**File:** `src/app/dashboard2/page.tsx`

**Current State Analysis:**
- Lines 198-213: Property filter uses `flex items-center gap-4` with `w-64` fixed width
- On narrow screens, 256px width + label may cause overflow

**Changes Required:**

**Change 4.1 - Property filter container (lines 198-212):**
```tsx
// BEFORE
<div className="flex items-center gap-4">
  <label className="text-sm font-medium text-[#222222]">
    View statistics for:
  </label>
  <div className="w-64">
    <PropertySelector
      properties={userProperties}
      selectedPropertyId={selectedPropertyId}
      onPropertyChange={setSelectedPropertyId}
      variant="compact"
      size="md"
      placeholder="All Properties"
    />
  </div>
</div>

// AFTER
<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
  <label className="text-sm font-medium text-[#222222]">
    View statistics for:
  </label>
  <div className="w-full sm:w-64">
    <PropertySelector
      properties={userProperties}
      selectedPropertyId={selectedPropertyId}
      onPropertyChange={setSelectedPropertyId}
      variant="compact"
      size="md"
      placeholder="All Properties"
    />
  </div>
</div>
```

**Breakdown of changes:**
- Container: `flex items-center` → `flex flex-col sm:flex-row sm:items-center`
- Gap: `gap-4` → `gap-2 sm:gap-4`
- Selector width: `w-64` → `w-full sm:w-64`

**Verification Steps:**
- [x] Test at 320px - label and selector should stack vertically
- [x] Test at 640px+ - should display in horizontal row
- [x] Selector should be full width on mobile
- [x] Verify interaction works correctly on touch devices

**Acceptance Criteria:**
- [x] Property selector is full-width on mobile
- [x] Label and selector stack vertically on narrow screens
- [x] Desktop layout unchanged
- [x] No horizontal scroll at 320px

**Implementation Notes (2026-01-06 17:05:00 UTC):**
- Changed container from `flex items-center gap-4` to `flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4`
- Changed selector div from `w-64` to `w-full sm:w-64`
- Added REQ-140 comment for responsive layout

---

### Task 5: Increase Navigation Touch Targets on Mobile

**Goal:** Ensure navigation buttons have adequate touch targets for mobile users

**File:** `src/app/dashboard2/layout.tsx`

**Current State Analysis:**
- Lines 115-128: Navigation buttons have `px-1 pt-4 pb-4`
- Vertical padding provides 48px height, but horizontal `px-1` is only 4px per side
- On touch devices, narrow buttons are hard to tap accurately

**Changes Required:**

**Change 5.1 - Navigation button className (line 119):**
```tsx
// BEFORE
className={`inline-flex items-center px-1 pt-4 pb-4 border-b-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2 ${
  isActive
    ? 'border-[#FF385C] text-[#FF385C]'
    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
}`}

// AFTER
className={`inline-flex items-center px-3 sm:px-1 pt-4 pb-4 border-b-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2 ${
  isActive
    ? 'border-[#FF385C] text-[#FF385C]'
    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
}`}
```

**Change 5.2 - Reduce navigation container spacing to compensate (line 108):**
```tsx
// BEFORE
<div className="flex space-x-8">

// AFTER
<div className="flex space-x-4 sm:space-x-8">
```

**Verification Steps:**
- [x] Inspect navigation buttons on mobile - verify wider tap area
- [x] Test tap accuracy on touch device/simulator
- [x] Verify navigation still fits on narrow screens (320px)
- [x] Check desktop layout is not affected

**Acceptance Criteria:**
- [x] Navigation items have adequate tap targets on mobile (48px+ width)
- [x] Navigation remains functional and accessible
- [x] No overflow or wrapping issues

**Implementation Notes (2026-01-06 17:05:00 UTC):**
- Changed navigation container from `space-x-8` to `space-x-4 sm:space-x-8`
- Changed button padding from `px-1` to `px-3 sm:px-1`
- Added REQ-140 comment to file header

---

### Task 6: Audit and Verify Modal Mobile Compliance

**Goal:** Verify that PropertyEditModal and AddPropertyModal use full-screen or drawer pattern on mobile per PRD requirements

**Files:**
- `src/components/SimpleDashboard/PropertyEditModal.tsx`
- `src/components/SimpleDashboard/AddPropertyModal.tsx`

**Current State Analysis:**

**PropertyEditModal (lines 363-385):**
```tsx
// Mobile: slide-up drawer
'max-md:inset-x-0 max-md:bottom-0',
'max-md:max-h-[90vh] max-md:rounded-t-xl',
```
- Currently uses drawer pattern with 90vh max height
- This is acceptable per Airbnb mobile patterns (Option B in overview)

**Decision:** Keep current drawer pattern as it follows Airbnb mobile UX conventions.

**Changes Required:**

**No code changes required** - current implementation is acceptable.

However, if full-screen is preferred (Option A), the changes would be:

**Optional Change 6.1 - PropertyEditModal full-screen mobile (NOT REQUIRED):**
```tsx
// If full-screen is desired instead of drawer:
// BEFORE
'max-md:inset-x-0 max-md:bottom-0',
'max-md:max-h-[90vh] max-md:rounded-t-xl',

// AFTER (Option A - Full Screen)
'max-md:inset-0',
'max-md:rounded-none',
```

**Verification Steps:**
- [x] Open PropertyEditModal on mobile viewport - verify drawer slides up
- [x] Verify form is scrollable if content exceeds viewport
- [x] Verify close button is reachable and works
- [x] Verify tap outside closes modal (unless submitting)
- [x] Test keyboard navigation (Escape to close)
- [x] Repeat for AddPropertyModal

**Acceptance Criteria:**
- [x] Modals cover appropriate screen area on mobile (drawer or full-screen)
- [x] Users can interact with modal content without precision targeting
- [x] Escape/close functionality works on mobile
- [x] All form fields accessible and usable

**Implementation Notes (2026-01-06 17:05:00 UTC):**
- **AUDIT ONLY - No changes needed**
- PropertyEditModal already implements mobile drawer pattern with `max-md:inset-x-0 max-md:bottom-0` and `max-md:max-h-[90vh]`
- AddPropertyModal uses identical mobile drawer pattern
- Both modals have mobile drag handle indicator and responsive padding
- All buttons have `min-h-[48px]` for touch targets

---

### Task 7: End-to-End Testing and Verification

**Goal:** Comprehensive testing of all mobile responsive changes across device matrix

**Testing Devices/Viewports:**

| Device | Width | Browser |
|--------|-------|---------|
| iPhone SE | 320px | Safari |
| iPhone 12/13 | 390px | Safari |
| iPhone 14 Pro Max | 430px | Safari |
| Android Small | 360px | Chrome |
| Android Large | 412px | Chrome |
| iPad Mini | 768px | Safari |
| Desktop | 1280px+ | Chrome/Safari |

**Testing Checklist:**

**7.1 Statistics Cards (Task 1):**
- [x] 320px: Cards stack 1 per row
- [x] 640px: Cards stack 1 per row (changed from 3)
- [x] 768px: Cards display 3 per row
- [x] 1280px: Cards display 3 per row

**7.2 Touch Targets (Task 2):**
- [x] PropertyRow has 48px+ height
- [x] All buttons have 48px minimum
- [x] Navigation items are easy to tap

**7.3 Welcome Section (Task 3):**
- [x] 320px: Adequate padding, no overflow
- [x] 375px: Proper spacing
- [x] 768px+: Desktop appearance intact

**7.4 Property Filter (Task 4):**
- [x] 320px: Selector full width, stacked
- [x] 640px+: Horizontal layout
- [x] Interaction works on touch

**7.5 Navigation (Task 5):**
- [x] 320px: Navigation fits, easy to tap
- [x] 768px: Normal spacing restored

**7.6 Modals (Task 6):**
- [x] Mobile: Drawer slides up from bottom
- [x] Form scrollable if needed
- [x] Close button accessible
- [x] Escape key works

**7.7 No Horizontal Scroll:**
- [x] 320px width: No horizontal scrollbar
- [x] 375px width: No horizontal scrollbar
- [x] All viewports: Content fits within viewport

**Build Verification:**
```bash
npm run build
npm run lint
```

**Acceptance Criteria (Final):**
- [x] All 7.1-7.7 test sections pass
- [x] Build completes without errors
- [x] Lint passes without new warnings (only pre-existing warnings)
- [x] No visual regressions on desktop

**Implementation Notes (2026-01-06 17:05:00 UTC):**
- Build passed successfully with no errors
- Lint shows only pre-existing warnings in unrelated files
- Modified files have no new lint warnings
- All responsive breakpoints implemented per Airbnb Design System guidelines

---

## Authorized Files for Modification

| File | Status | Changes |
|------|--------|---------|
| `src/components/SimpleDashboard/StatisticsCards.tsx` | ✅ COMPLETED | Updated `sm:` to `md:` breakpoints |
| `src/components/SimpleDashboard/PropertySection.tsx` | ✅ COMPLETED | Added `min-h-[48px]` to PropertyRow |
| `src/app/dashboard2/page.tsx` | ✅ COMPLETED | Responsive padding, property filter layout |
| `src/app/dashboard2/layout.tsx` | ✅ COMPLETED | Navigation touch target improvements |
| `src/components/SimpleDashboard/PropertyEditModal.tsx` | ✅ AUDITED | Verified mobile drawer works (no changes needed) |
| `src/components/SimpleDashboard/AddPropertyModal.tsx` | ✅ AUDITED | Verified mobile drawer works (no changes needed) |

---

## Files NOT to Modify

| File | Reason |
|------|--------|
| `src/app/dashboard2/create/page.tsx` | Already complete per implementation plan |
| `src/app/dashboard2/items/page.tsx` | Already complete per implementation plan |
| `src/components/QRCodePrintManager.tsx` | Complete, reusable component |
| `src/components/PropertyForm.tsx` | Complete, reusable component |
| `src/components/PropertySelector.tsx` | Complete, reusable component |
| `src/components/SimpleDashboard/ActionButtons.tsx` | Already uses `md:grid-cols-3` correctly |

---

## Dependencies

### Internal Dependencies
- Tailwind CSS 4 configuration (existing)
- Responsive utility classes (existing)
- Radix UI Dialog for modals (existing, mobile-aware)

### External Dependencies
- None required

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking desktop layout | Low | High | Test at all breakpoints after each change |
| Touch target changes affecting visual design | Low | Medium | Use minimum heights, not fixed heights |
| Navigation overflow on very narrow screens | Low | Medium | Test at 320px minimum |
| Content truncation in welcome section | Low | Low | Use responsive padding, test text at all widths |

---

## Implementation Order

**Recommended sequence:**

1. **Task 1** - StatisticsCards breakpoint (foundational change)
2. **Task 2** - PropertyRow touch target (quick fix)
3. **Task 3** - Welcome section padding (prevents overflow)
4. **Task 4** - Property filter responsiveness (usability fix)
5. **Task 5** - Navigation touch targets (UX improvement)
6. **Task 6** - Modal audit (verification only)
7. **Task 7** - End-to-end testing (validation)

---

## References

- [REQ-140 Overview Document](/docs/REQ-140-mobile-responsive-overview.md)
- [REQ-140 Request Details](/docs/gen_requests.md)
- [Implementation Plan REVISED](/docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md)
- [Airbnb Design System](/docs/prd/airbnb_designsystem.md)
- [WCAG 2.5.5 Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)

---

## Appendix: Tailwind Breakpoint Quick Reference

| Class Prefix | Min Width | Use Case |
|--------------|-----------|----------|
| (none) | 0px | Mobile-first base styles |
| `sm:` | 640px | Small tablets (NOT recommended for Airbnb alignment) |
| `md:` | 768px | Tablets / Mobile cutoff (closest to Airbnb's 744px) |
| `lg:` | 1024px | Small desktops |
| `xl:` | 1280px | Large desktops |
| `max-md:` | < 768px | Mobile-only styles (inverse of md:) |

**Key Decision:** Use `md:` (768px) as the primary mobile/desktop breakpoint to best align with Airbnb's 744px mobile breakpoint specification.
