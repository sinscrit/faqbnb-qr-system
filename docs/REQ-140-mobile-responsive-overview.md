# REQ-140: Mobile-Responsive Dashboard Experience

**Implementation Overview Document**

**Created:** 2026-01-06
**Last Modified:** 2026-01-06
**Phase:** 6 - Polish & Accessibility
**Task ID:** 6.4
**Type:** ENHANCEMENT
**Size:** M

---

## Summary

Implement mobile-responsive layouts for the Dashboard 2 interface to ensure optimal experience on mobile devices with touch-friendly controls and appropriate content stacking. This enhancement addresses the requirement that statistics cards stack vertically on mobile (1 per row), action buttons stack vertically, modals display full-screen on mobile, and all interactive elements have minimum 48px tap targets.

---

## Background & Context

### Current State

The Dashboard 2 implementation has partial mobile responsiveness:

1. **StatisticsCards (`src/components/SimpleDashboard/StatisticsCards.tsx:235`)**
   - Current: `grid grid-cols-1 sm:grid-cols-3 gap-4`
   - Cards already stack at mobile breakpoint (`grid-cols-1`), but `sm:` breakpoint (640px) is used instead of Airbnb standard `md:` (768px/744px)

2. **ActionButtons (`src/components/SimpleDashboard/ActionButtons.tsx:184`)**
   - Current: `grid grid-cols-1 md:grid-cols-3 gap-4`
   - Buttons already stack on mobile but use `md:` breakpoint (768px)
   - Touch targets meet 48px minimum (`min-h-[48px] px-6 py-3.5`)

3. **PropertyEditModal & AddPropertyModal**
   - Already have mobile drawer pattern implemented (slide-up from bottom)
   - Uses `max-md:` prefix for mobile-specific styles
   - Has mobile drag handle indicator
   - Buttons have 48px minimum height

4. **PropertySection (`src/components/SimpleDashboard/PropertySection.tsx`)**
   - Add button meets 48px minimum (`min-h-[48px]`)
   - PropertyRow buttons don't have explicit height minimum (only `p-4`)

### Issues to Address

| Component | Issue | Required Change |
|-----------|-------|-----------------|
| StatisticsCards | Uses `sm:` (640px) instead of Airbnb standard | Change to `md:` or custom breakpoint (744px) |
| StatisticsCards (Skeleton) | Same breakpoint issue | Align with cards component |
| PropertyRow | No explicit minimum height | Add `min-h-[48px]` |
| Dashboard page elements | Need consistent breakpoint usage | Audit all responsive classes |

### Airbnb Design System Breakpoints Reference

From `docs/prd/airbnb_designsystem.md`:

| Breakpoint | Width | Columns | Gutter |
|------------|-------|---------|--------|
| Mobile | < 744px | 4 | 16px |
| Tablet | 744px - 1127px | 8 | 24px |
| Desktop | 1128px - 1439px | 12 | 24px |
| Large | >= 1440px | 12 | 24px |

**Note:** Tailwind's default breakpoints don't align with Airbnb's system:
- Tailwind `sm:` = 640px (not Airbnb standard)
- Tailwind `md:` = 768px (close to 744px, acceptable)
- Tailwind `lg:` = 1024px (not Airbnb standard)

---

## PRD Requirements (Task 6.4)

From `Plan-001-Simple-Dashboard-Implementation-REVISED.md` (lines 387-392):

```
Task 6.4: Mobile Responsive
- [ ] Statistics cards stack on mobile (1 per row)
- [ ] Action buttons stack vertically on mobile
- [ ] Modal full-screen on mobile
- [ ] Touch-friendly tap targets (48px minimum)
```

Acceptance Criteria (Phase 6):
```
- [ ] Responsive on all breakpoints
```

From `docs/gen_requests.md` REQ-140 Acceptance Criteria:
```
- [ ] Statistics cards display in a single-column layout (one card per row) on mobile viewports
- [ ] Action buttons stack vertically with adequate spacing on mobile viewports
- [ ] Modal dialogs utilize full-screen presentation on mobile devices
- [ ] All interactive elements (buttons, links, inputs, controls) have minimum 48px tap targets on touch devices
- [ ] Dashboard remains fully functional across mobile viewport sizes (320px width and up)
- [ ] No horizontal scrolling occurs on mobile devices when viewed at standard zoom levels
- [ ] Touch interactions (tap, swipe) work smoothly without requiring precise targeting
```

---

## Implementation Plan

### Task 1: Align StatisticsCards with Mobile Breakpoint

**File:** `src/components/SimpleDashboard/StatisticsCards.tsx`

**Changes:**
1. Update grid breakpoint from `sm:grid-cols-3` to `md:grid-cols-3` (line 235)
2. Update LoadingSkeleton grid breakpoint similarly (line 109)
3. Add responsive padding adjustments for individual cards

**Current Code (line 235):**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
```

**New Code:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
```

**Skeleton Update (line 109):**
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
```

**Acceptance Criteria:**
- [ ] Statistics cards display 1 per row on viewports < 768px
- [ ] Cards display 3 per row on viewports >= 768px
- [ ] Gap spacing remains consistent (16px / gap-4)

---

### Task 2: Audit and Fix Touch Target Sizes

**File:** `src/components/SimpleDashboard/PropertySection.tsx`

**Issue:** PropertyRow button has `p-4` (16px padding) but no explicit minimum height

**Current Code (line 45):**
```tsx
className="w-full flex items-center justify-between p-4 bg-white border-b border-[#DDDDDD] ..."
```

**New Code:**
```tsx
className="w-full flex items-center justify-between min-h-[48px] p-4 bg-white border-b border-[#DDDDDD] ..."
```

**Additional Touch Target Audit:**

| Component | Element | Current | Status |
|-----------|---------|---------|--------|
| ActionButtons | Action button | `min-h-[48px] px-6 py-3.5` | OK |
| PropertySection | Add button | `min-h-[48px]` | OK |
| PropertySection | PropertyRow | `p-4` only | **NEEDS FIX** |
| PropertySection | SinglePropertyCard | `min-h-[48px]` | OK |
| PropertyEditModal | Save/Cancel buttons | `min-h-[48px]` | OK |
| PropertyEditModal | Close button | `p-2` (32px) | **REVIEW** - icon button, acceptable |
| AddPropertyModal | Save/Cancel buttons | `min-h-[48px]` | OK |
| StatisticsCards | Non-interactive cards | N/A | N/A |
| Dashboard layout | Navigation buttons | implicit via content | **AUDIT NEEDED** |

**Acceptance Criteria:**
- [ ] All interactive elements have minimum 48px touch target
- [ ] Touch targets are large enough for accurate finger taps

---

### Task 3: Verify Modal Full-Screen on Mobile

**Files:**
- `src/components/SimpleDashboard/PropertyEditModal.tsx`
- `src/components/SimpleDashboard/AddPropertyModal.tsx`

**Current Implementation (PropertyEditModal lines 363-381):**
```tsx
className={cn(
  // Base styles
  'fixed z-50 bg-white shadow-lg outline-none',
  'overflow-hidden flex flex-col',

  // Desktop: centered modal
  'md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2',
  'md:max-w-[640px] md:w-[calc(100%-2rem)] md:max-h-[90vh]',
  'md:rounded-xl',

  // Mobile: slide-up drawer
  'max-md:inset-x-0 max-md:bottom-0',
  'max-md:max-h-[90vh] max-md:rounded-t-xl',
  ...
)}
```

**Issue:** Mobile drawer uses `max-h-[90vh]`, not true full-screen

**Recommendation:** Update to full-screen on mobile for better usability:

```tsx
// Mobile: full-screen presentation
'max-md:inset-0',
'max-md:rounded-none',
```

OR keep current drawer pattern but ensure it's documented as intentional design decision (drawer pattern is acceptable per Airbnb mobile patterns).

**Decision Required:**
- Option A: True full-screen modal (`inset-0`)
- Option B: Keep drawer pattern (`inset-x-0 bottom-0 max-h-[90vh]`) - Airbnb-style

**Acceptance Criteria:**
- [ ] Modals cover appropriate screen area on mobile
- [ ] Users can interact with modal content without precision targeting
- [ ] Escape/close functionality works on mobile

---

### Task 4: Verify No Horizontal Scrolling

**Files to audit:**
- `src/app/dashboard2/page.tsx`
- `src/app/dashboard2/layout.tsx`
- All SimpleDashboard components

**Current page.tsx structure:**
```tsx
<div className={mainSpacing}> // space-y-6 or space-y-8
  {/* Welcome Section */}
  <div className="bg-gradient-to-r ... rounded-2xl p-8 ...">

  {/* Property Filter */}
  <div className="flex items-center gap-4">
    <div className="w-64">
      <PropertySelector ... />
    </div>
  </div>
  ...
</div>
```

**Potential Issues:**
1. Welcome section has `p-8` which may cause overflow on very narrow screens (320px)
2. Property filter label uses `gap-4` and `w-64` (256px) - may need responsive adjustment

**Fixes:**
1. Add responsive padding to welcome section: `p-4 sm:p-8`
2. Make property filter responsive: `flex-col sm:flex-row` with full-width selector on mobile

**Acceptance Criteria:**
- [ ] No horizontal scroll at 320px viewport width
- [ ] All content remains readable and accessible at narrow widths

---

### Task 5: Add Responsive Padding to Dashboard Page

**File:** `src/app/dashboard2/page.tsx`

**Changes:**

1. **Welcome Section (line 184):**
```tsx
// Current
<div className="bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] rounded-2xl p-8 text-white relative">

// Updated
<div className="bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 text-white relative">
```

2. **Property Filter Section (lines 197-213):**
```tsx
// Current
<div className="flex items-center gap-4">
  <label className="text-sm font-medium text-[#222222]">
    View statistics for:
  </label>
  <div className="w-64">
    <PropertySelector ... />
  </div>
</div>

// Updated
<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
  <label className="text-sm font-medium text-[#222222]">
    View statistics for:
  </label>
  <div className="w-full sm:w-64">
    <PropertySelector ... />
  </div>
</div>
```

**Acceptance Criteria:**
- [ ] Dashboard page renders correctly at 320px width
- [ ] Content has appropriate padding at all breakpoints
- [ ] Property selector is full-width on mobile

---

### Task 6: Verify Layout Navigation Touch Targets

**File:** `src/app/dashboard2/layout.tsx`

**Current Navigation (lines 115-128):**
```tsx
<button
  key={item.name}
  onClick={() => router.push(item.href)}
  className={`inline-flex items-center px-1 pt-4 pb-4 border-b-2 text-sm font-medium ...`}
>
```

**Issue:** `px-1` may not provide adequate touch target width

**Fix:** Increase horizontal padding for better touch targets:
```tsx
className={`inline-flex items-center px-3 sm:px-1 pt-4 pb-4 border-b-2 ...`}
```

**Acceptance Criteria:**
- [ ] Navigation items have adequate tap targets on mobile
- [ ] Navigation remains functional and accessible

---

## Authorized Files and Functions for Modification

### Files Requiring Modification

| File | Type | Changes |
|------|------|---------|
| `src/components/SimpleDashboard/StatisticsCards.tsx` | MODIFY | Update breakpoints (`sm:` to `md:`), responsive padding |
| `src/components/SimpleDashboard/PropertySection.tsx` | MODIFY | Add `min-h-[48px]` to PropertyRow |
| `src/components/SimpleDashboard/PropertyEditModal.tsx` | MODIFY | Consider full-screen mobile option |
| `src/components/SimpleDashboard/AddPropertyModal.tsx` | MODIFY | Consider full-screen mobile option |
| `src/app/dashboard2/page.tsx` | MODIFY | Responsive padding, property filter layout |
| `src/app/dashboard2/layout.tsx` | MODIFY | Navigation touch target improvements |

### Functions/Components to Modify

| Component | Function/Line | Change |
|-----------|--------------|--------|
| `StatisticsCards` | Main render (L235) | Change `sm:grid-cols-3` to `md:grid-cols-3` |
| `StatisticsCards.LoadingSkeleton` | Render (L109) | Change `sm:grid-cols-3` to `md:grid-cols-3` |
| `PropertySection.PropertyRow` | className (L45) | Add `min-h-[48px]` |
| `PropertyEditModal` | Dialog.Content className | Optional: change to full-screen mobile |
| `AddPropertyModal` | Dialog.Content className | Optional: change to full-screen mobile |
| `Dashboard2Page` | Welcome section (L184) | Add responsive padding |
| `Dashboard2Page` | Property filter (L197-213) | Add responsive layout |
| `Dashboard2LayoutContent` | Navigation buttons (L115-128) | Increase mobile tap target |

### Files NOT to Modify

| File | Reason |
|------|--------|
| `src/app/dashboard2/create/page.tsx` | Already complete per implementation plan |
| `src/app/dashboard2/items/page.tsx` | Already complete per implementation plan |
| `src/components/QRCodePrintManager.tsx` | Complete, reusable component |
| `src/components/PropertyForm.tsx` | Complete, reusable component |
| `src/components/PropertySelector.tsx` | Complete, reusable component |

---

## Dependencies

### Internal Dependencies
- Existing Tailwind CSS 4 configuration
- Existing responsive utility classes
- Radix UI Dialog for modals (already mobile-aware)

### External Dependencies
- None required

---

## Testing Requirements

### Manual Testing Checklist

1. **Mobile Viewport Testing (320px, 375px, 414px)**
   - [ ] Statistics cards stack vertically (1 per row)
   - [ ] Action buttons stack vertically
   - [ ] No horizontal scrolling
   - [ ] All buttons/interactive elements have 48px+ tap targets
   - [ ] Property filter selector is full-width
   - [ ] Welcome section has appropriate padding

2. **Tablet Viewport Testing (744px - 1127px)**
   - [ ] Statistics cards display in 3-column grid
   - [ ] Action buttons display in 3-column grid
   - [ ] Layout transitions smoothly

3. **Modal Testing on Mobile**
   - [ ] PropertyEditModal opens as drawer/full-screen
   - [ ] AddPropertyModal opens as drawer/full-screen
   - [ ] Escape key closes modal
   - [ ] Tapping outside closes modal
   - [ ] Form fields are accessible and usable
   - [ ] Buttons have adequate tap targets

4. **Touch Interaction Testing**
   - [ ] All buttons respond to touch
   - [ ] No accidental taps on adjacent elements
   - [ ] Smooth scrolling within modals
   - [ ] No stuck states or interaction issues

### Browser/Device Matrix

| Device | Browser | Status |
|--------|---------|--------|
| iPhone SE (320px) | Safari | To test |
| iPhone 12/13 (390px) | Safari | To test |
| iPhone 14 Pro Max (430px) | Safari | To test |
| Android Small (360px) | Chrome | To test |
| Android Large (412px) | Chrome | To test |
| iPad Mini (768px) | Safari | To test |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing desktop layout | Low | High | Test at all breakpoints after changes |
| Touch target changes affecting visual design | Low | Medium | Use minimum heights, not fixed heights |
| Modal full-screen option affecting UX flow | Medium | Low | A/B test or keep current drawer pattern |
| Horizontal overflow on edge cases | Low | Medium | Test at 320px width minimum |

---

## Effort Estimate

| Task | Estimate |
|------|----------|
| Task 1: StatisticsCards breakpoint | 0.25 hours |
| Task 2: Touch target audit & fixes | 0.5 hours |
| Task 3: Modal mobile verification | 0.25 hours |
| Task 4: Horizontal scroll audit | 0.25 hours |
| Task 5: Dashboard page responsive padding | 0.5 hours |
| Task 6: Layout navigation targets | 0.25 hours |
| Testing across devices | 1 hour |
| **Total** | **3 hours** |

---

## References

- [PRD: Dashboard 2 - Simple Dashboard](/docs/prd/PRD_Dashboard_2_Simple_Dashboard.md)
- [Implementation Plan REVISED](/docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md)
- [Airbnb Design System](/docs/prd/airbnb_designsystem.md)
- [REQ-140 Request Details](/docs/gen_requests.md)
- [WCAG 2.5.5 Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)

---

## Appendix: Tailwind Breakpoint Reference

| Tailwind Class | Min Width | Airbnb Equivalent |
|----------------|-----------|-------------------|
| `sm:` | 640px | - |
| `md:` | 768px | ~744px (Mobile/Tablet) |
| `lg:` | 1024px | - |
| `xl:` | 1280px | ~1128px (Desktop) |
| `2xl:` | 1536px | ~1440px (Large) |

**Recommendation:** Use `md:` as primary mobile/desktop breakpoint to align closest with Airbnb's 744px mobile breakpoint.
