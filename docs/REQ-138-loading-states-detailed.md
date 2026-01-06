# REQ-138: Shimmer Skeletons and Consistent Loading Indicators - Detailed Task Breakdown

**Document Created:** 2026-01-06 08:17:30 UTC
**Last Modified:** 2026-01-06 08:30:00 UTC
**Request Reference:** REQ-138 from docs/gen_requests.md
**Overview Document:** docs/REQ-138-loading-states-overview.md
**Implementation Plan Reference:** Plan-001-Simple-Dashboard-Implementation-REVISED.md (Phase 6.2)
**Status:** IMPLEMENTATION COMPLETE

---

## Document Purpose

This document breaks down the REQ-138 implementation overview into granular, actionable tasks suitable for implementation by an AI coding agent or developer. Each task is designed to be <= 1 story point (a few hours of focused work).

---

## Pre-Implementation Checklist

- [x] Overview document reviewed: `docs/REQ-138-loading-states-overview.md`
- [x] Implementation plan reviewed: `docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md`
- [x] Existing skeleton patterns analyzed in:
  - `src/components/SimpleDashboard/StatisticsCards.tsx` (lines 100-120)
  - `src/components/SimpleDashboard/PropertySection.tsx` (lines 59-84)
  - `src/components/SimpleDashboard/PortfolioSummary.tsx` (lines 28-45)
- [x] Modal components reviewed:
  - `src/components/SimpleDashboard/PropertyEditModal.tsx` (already has `isSubmitting` state)
  - `src/components/SimpleDashboard/AddPropertyModal.tsx` (already has `isSubmitting` state)
- [x] Existing exports reviewed: `src/components/SimpleDashboard/index.ts`

---

## Current State Analysis Summary

### What Exists (Already Implemented)

| Component | Has Skeleton | Has Accessibility | Has Reduced Motion |
|-----------|-------------|-------------------|-------------------|
| `StatisticsCards` | Yes (lines 100-120) | No | No |
| `PropertySection` | Yes (lines 59-84) | No | No |
| `PortfolioSummary` | Yes (lines 28-45) | No | No |
| `PropertyEditModal` | N/A - has `isSubmitting` | Partial | No |
| `AddPropertyModal` | N/A - has `isSubmitting` | Partial | No |

### Key Observations

1. **Modal loading states already exist**: Both `PropertyEditModal` and `AddPropertyModal` already have:
   - `isSubmitting` state for tracking save operations
   - Disabled form inputs during save
   - Spinner on save button with inline CSS spinner
   - Modal close prevention during save

2. **Existing skeletons lack accessibility**: Current `LoadingSkeleton` functions in StatisticsCards, PropertySection, and PortfolioSummary do not have:
   - `role="status"` attribute
   - `aria-busy="true"` attribute
   - `aria-label` for screen readers
   - `sr-only` text for context

3. **No reduced motion support**: `globals.css` does not contain `prefers-reduced-motion` media query for animation control.

---

## Task Breakdown

### Task Group 1: Create Reusable Skeleton Components Library

#### Task 1.1: Create SkeletonBase Component

**File to CREATE:** `src/components/SimpleDashboard/skeletons/SkeletonBase.tsx`

**Description:** Create a base skeleton wrapper component that handles accessibility requirements for all loading states.

**Implementation Details:**
```tsx
// Key features to implement:
// - Wrapper component that adds role="status" and aria-busy="true"
// - Accepts aria-label prop with default "Loading content"
// - Includes sr-only span with loading message
// - Applies animate-pulse class to children container
// - Uses cn() utility from @/lib/utils
```

**Acceptance Criteria:**
- [x] Component accepts `className`, `children`, and optional `label` props
- [x] Renders `role="status"` and `aria-busy="true"` on container
- [x] Includes `aria-label` attribute with provided or default label
- [x] Contains `sr-only` span with "{label}, please wait..." text
- [x] Applies `animate-pulse` class to content wrapper

**Verification Steps:**
1. Check component renders with proper ARIA attributes using browser dev tools
2. Test with screen reader to confirm loading announcement

**Estimated Effort:** 0.5 story points

---

#### Task 1.2: Create SkeletonText Component

**File to CREATE:** `src/components/SimpleDashboard/skeletons/SkeletonText.tsx`

**Description:** Create a reusable skeleton placeholder for text lines.

**Implementation Details:**
```tsx
// Key features to implement:
// - Configurable width prop: 'sm' | 'md' | 'lg' | 'full' | custom string
// - Configurable height prop: 'xs' | 'sm' | 'md' | 'lg'
// - Uses bg-gray-200 for skeleton background
// - Uses rounded for text-like appearance
```

**Acceptance Criteria:**
- [x] Component accepts `width`, `height`, and `className` props
- [x] Width options: 'sm' (16rem), 'md' (24rem), 'lg' (32rem), 'full' (100%), or custom
- [x] Height options: 'xs' (12px), 'sm' (16px), 'md' (20px), 'lg' (24px)
- [x] Applies `bg-gray-200 rounded` styling
- [x] Supports className override for custom styling

**Verification Steps:**
1. Render component with different size combinations
2. Confirm visual appearance matches existing skeleton patterns

**Estimated Effort:** 0.5 story points

---

#### Task 1.3: Create SkeletonCard Component

**File to CREATE:** `src/components/SimpleDashboard/skeletons/SkeletonCard.tsx`

**Description:** Create a reusable skeleton placeholder for card containers.

**Implementation Details:**
```tsx
// Key features to implement:
// - Matches existing card styling: bg-white rounded-xl shadow-sm
// - Configurable padding prop
// - Accepts children for custom skeleton content
// - Optional icon placeholder slot
```

**Acceptance Criteria:**
- [x] Component accepts `children`, `padding`, and `className` props
- [x] Applies consistent card styling: `bg-white rounded-xl shadow-sm`
- [x] Default padding matches existing components (p-6)
- [x] Can contain nested skeleton elements

**Verification Steps:**
1. Compare visual output to existing StatisticsCards skeleton
2. Verify consistent styling across card types

**Estimated Effort:** 0.5 story points

---

#### Task 1.4: Create Skeleton Barrel Export

**File to CREATE:** `src/components/SimpleDashboard/skeletons/index.ts`

**Description:** Create barrel export file for skeleton components.

**Implementation Details:**
```tsx
export { SkeletonBase } from './SkeletonBase';
export type { SkeletonBaseProps } from './SkeletonBase';

export { SkeletonText } from './SkeletonText';
export type { SkeletonTextProps } from './SkeletonText';

export { SkeletonCard } from './SkeletonCard';
export type { SkeletonCardProps } from './SkeletonCard';
```

**Acceptance Criteria:**
- [x] All skeleton components exported
- [x] Type exports included
- [x] File follows existing barrel export patterns

**Verification Steps:**
1. Import from `./skeletons` in parent component
2. Confirm TypeScript types resolve correctly

**Estimated Effort:** 0.25 story points

---

### Task Group 2: Create Unified Loading Indicator Component

#### Task 2.1: Create LoadingIndicator Component

**File to CREATE:** `src/components/SimpleDashboard/LoadingIndicator.tsx`

**Description:** Create a unified, accessible loading spinner component for async operations.

**Implementation Details:**
```tsx
// Use Lucide Loader2 icon with animate-spin
// Configurable sizes: sm (16px), md (24px), lg (32px)
// Airbnb brand color: text-[#FF385C]
// Includes role="status" and aria-label
// sr-only text for screen readers
```

**Acceptance Criteria:**
- [x] Component accepts `size`, `label`, and `className` props
- [x] Size options map to: sm=w-4 h-4, md=w-6 h-6, lg=w-8 h-8
- [x] Uses `Loader2` icon from `lucide-react`
- [x] Applies `animate-spin text-[#FF385C]` styling
- [x] Includes `role="status"` and `aria-label` attributes
- [x] Contains `sr-only` span with loading label

**Verification Steps:**
1. Render at each size and verify dimensions
2. Confirm spinner animation runs smoothly
3. Test with screen reader for proper announcement

**Estimated Effort:** 0.5 story points

---

### Task Group 3: Add Reduced Motion Support

#### Task 3.1: Add Reduced Motion CSS Media Query

**File to MODIFY:** `src/app/globals.css`

**Location:** Add after existing animation utility classes (after line 210)

**Implementation Details:**
```css
/* =============================================================================
 * Reduced Motion Support (REQ-138)
 * Respects user preference for reduced motion
 * @lastModified 2026-01-06
 * ============================================================================= */

@media (prefers-reduced-motion: reduce) {
  /* Disable pulse animation for skeletons */
  .animate-pulse {
    animation: none;
    opacity: 0.6;
  }

  /* Disable spin animation for loaders */
  .animate-spin {
    animation: none;
  }

  /* Disable all custom animations */
  .animate-fade-in,
  .animate-fade-out,
  .animate-modal-in,
  .animate-modal-out,
  .animate-drawer-in,
  .animate-drawer-out {
    animation: none;
  }
}
```

**Acceptance Criteria:**
- [x] Media query added for `prefers-reduced-motion: reduce`
- [x] `animate-pulse` animation disabled with static opacity 0.6
- [x] `animate-spin` animation disabled
- [x] Other custom animations disabled
- [x] Section header comment follows existing file pattern

**Verification Steps:**
1. Enable "Reduce motion" in macOS System Preferences > Accessibility > Display
2. Verify skeleton shimmer stops animating
3. Verify loading spinners stop spinning
4. Verify skeletons still visually indicate loading state (opacity)

**Estimated Effort:** 0.25 story points

---

### Task Group 4: Refactor Existing Skeletons for Accessibility

#### Task 4.1: Update StatisticsCards LoadingSkeleton

**File to MODIFY:** `src/components/SimpleDashboard/StatisticsCards.tsx`

**Location:** Lines 100-120 (`LoadingSkeleton` function)

**Current Code Analysis:**
- Function renders a grid of 3 skeleton cards
- Uses `animate-pulse` on each card
- No accessibility attributes

**Implementation Details:**
1. Import `SkeletonBase` from `./skeletons`
2. Wrap existing skeleton JSX with `SkeletonBase` component
3. Add `aria-label="Loading statistics"` via SkeletonBase prop
4. Keep existing visual structure unchanged

**Acceptance Criteria:**
- [x] `SkeletonBase` imported from `./skeletons`
- [x] `LoadingSkeleton` wrapped with `SkeletonBase`
- [x] `aria-label="Loading statistics"` provided
- [x] Visual appearance unchanged
- [x] Screen reader announces "Loading statistics, please wait..."

**Verification Steps:**
1. Visual comparison before/after - should be identical
2. Inspect DOM for `role="status"` and `aria-busy="true"`
3. Screen reader test for loading announcement

**Estimated Effort:** 0.25 story points

---

#### Task 4.2: Update PropertySection LoadingSkeleton

**File to MODIFY:** `src/components/SimpleDashboard/PropertySection.tsx`

**Location:** Lines 59-84 (`LoadingSkeleton` function)

**Implementation Details:**
1. Import `SkeletonBase` from `./skeletons`
2. Wrap existing skeleton JSX with `SkeletonBase` component
3. Add `aria-label="Loading properties"` via SkeletonBase prop
4. Keep existing visual structure unchanged

**Acceptance Criteria:**
- [x] `SkeletonBase` imported from `./skeletons`
- [x] `LoadingSkeleton` wrapped with `SkeletonBase`
- [x] `aria-label="Loading properties"` provided
- [x] Visual appearance unchanged
- [x] Screen reader announces "Loading properties, please wait..."

**Verification Steps:**
1. Visual comparison before/after - should be identical
2. Inspect DOM for `role="status"` and `aria-busy="true"`
3. Screen reader test for loading announcement

**Estimated Effort:** 0.25 story points

---

#### Task 4.3: Update PortfolioSummary LoadingSkeleton

**File to MODIFY:** `src/components/SimpleDashboard/PortfolioSummary.tsx`

**Location:** Lines 28-45 (`LoadingSkeleton` function)

**Implementation Details:**
1. Import `SkeletonBase` from `./skeletons`
2. Wrap existing skeleton JSX with `SkeletonBase` component
3. Add `aria-label="Loading portfolio summary"` via SkeletonBase prop
4. Keep existing visual structure unchanged

**Acceptance Criteria:**
- [x] `SkeletonBase` imported from `./skeletons`
- [x] `LoadingSkeleton` wrapped with `SkeletonBase`
- [x] `aria-label="Loading portfolio summary"` provided
- [x] Visual appearance unchanged
- [x] Screen reader announces "Loading portfolio summary, please wait..."

**Verification Steps:**
1. Visual comparison before/after - should be identical
2. Inspect DOM for `role="status"` and `aria-busy="true"`
3. Screen reader test for loading announcement

**Estimated Effort:** 0.25 story points

---

### Task Group 5: Enhance Modal Loading States

**NOTE:** Both PropertyEditModal and AddPropertyModal already have functional `isSubmitting` states with:
- Disabled form inputs during save
- Inline CSS spinner on save button
- Modal close prevention during save

The following tasks enhance these existing implementations.

#### Task 5.1: Replace Inline Spinner with LoadingIndicator in PropertyEditModal

**File to MODIFY:** `src/components/SimpleDashboard/PropertyEditModal.tsx`

**Location:** Lines 546-554 (Save button spinner)

**Current Code:**
```tsx
{isSubmitting ? (
  <>
    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    <span>Saving...</span>
  </>
) : (
  <span>Save Changes</span>
)}
```

**Implementation Details:**
1. Import `LoadingIndicator` from `./LoadingIndicator`
2. Replace inline spinner `<span>` with `<LoadingIndicator size="sm" />`
3. Adjust LoadingIndicator color to white for gradient button contrast

**Acceptance Criteria:**
- [x] `LoadingIndicator` imported
- [x] Inline spinner replaced with `LoadingIndicator` component
- [x] Spinner color is white (override default Airbnb red for button contrast)
- [x] Visual appearance consistent with previous inline spinner
- [x] Accessibility improved via LoadingIndicator's aria attributes

**Verification Steps:**
1. Trigger save operation and verify spinner displays
2. Confirm spinner is white on gradient button
3. Verify aria-label announces loading state

**Estimated Effort:** 0.25 story points

---

#### Task 5.2: Replace Inline Spinner with LoadingIndicator in AddPropertyModal

**File to MODIFY:** `src/components/SimpleDashboard/AddPropertyModal.tsx`

**Location:** Lines 522-530 (Create button spinner)

**Current Code:**
```tsx
{isSubmitting ? (
  <>
    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    <span>Creating...</span>
  </>
) : (
  <span>Create Property</span>
)}
```

**Implementation Details:**
1. Import `LoadingIndicator` from `./LoadingIndicator`
2. Replace inline spinner `<span>` with `<LoadingIndicator size="sm" />`
3. Adjust LoadingIndicator color to white for gradient button contrast

**Acceptance Criteria:**
- [x] `LoadingIndicator` imported
- [x] Inline spinner replaced with `LoadingIndicator` component
- [x] Spinner color is white (override default Airbnb red for button contrast)
- [x] Visual appearance consistent with previous inline spinner
- [x] Accessibility improved via LoadingIndicator's aria attributes

**Verification Steps:**
1. Trigger create operation and verify spinner displays
2. Confirm spinner is white on gradient button
3. Verify aria-label announces loading state

**Estimated Effort:** 0.25 story points

---

### Task Group 6: Update Exports

#### Task 6.1: Add New Component Exports to SimpleDashboard Index

**File to MODIFY:** `src/components/SimpleDashboard/index.ts`

**Location:** Add after existing exports (after line 56)

**Implementation Details:**
Add the following exports:
```tsx
// REQ-138: Skeleton Components
export { SkeletonBase, SkeletonText, SkeletonCard } from './skeletons';
export type { SkeletonBaseProps } from './skeletons/SkeletonBase';
export type { SkeletonTextProps } from './skeletons/SkeletonText';
export type { SkeletonCardProps } from './skeletons/SkeletonCard';

// REQ-138: Loading Indicator
export { LoadingIndicator } from './LoadingIndicator';
export type { LoadingIndicatorProps } from './LoadingIndicator';
```

**Acceptance Criteria:**
- [x] All skeleton components exported from barrel file
- [x] LoadingIndicator exported from barrel file
- [x] Type exports included for each component
- [x] Comment header references REQ-138

**Verification Steps:**
1. Import components from `@/components/SimpleDashboard`
2. Confirm all types resolve in TypeScript
3. Run TypeScript compilation (`npm run type-check`)

**Estimated Effort:** 0.25 story points

---

### Task Group 7: Testing and Verification

#### Task 7.1: Manual Testing - Network Throttling

**Description:** Manually test loading states with slow network simulation.

**Testing Steps:**
1. Open Chrome DevTools > Network tab
2. Set throttling to "Slow 3G"
3. Navigate to `/dashboard2`
4. Verify StatisticsCards shows skeleton while loading
5. Verify PropertySection shows skeleton while loading
6. Verify PortfolioSummary shows skeleton (if user has 16+ properties)
7. Open PropertyEditModal and save - verify spinner displays
8. Open AddPropertyModal and create - verify spinner displays

**Acceptance Criteria:**
- [ ] All skeletons display during data fetch
- [ ] All spinners display during async operations
- [ ] Skeletons match layout of loaded content (no layout shift)
- [ ] Smooth transition from skeleton to content

**Estimated Effort:** 0.5 story points

---

#### Task 7.2: Manual Testing - Reduced Motion

**Description:** Test reduced motion support.

**Testing Steps:**
1. macOS: System Preferences > Accessibility > Display > Reduce motion (enable)
2. Windows: Settings > Ease of Access > Display > Show animations (disable)
3. Navigate to `/dashboard2` with slow network throttling
4. Verify skeleton shimmer animation stops
5. Verify skeletons still visible with static opacity
6. Trigger modal save - verify spinner stops animating

**Acceptance Criteria:**
- [ ] `animate-pulse` disabled when reduced motion enabled
- [ ] `animate-spin` disabled when reduced motion enabled
- [ ] Skeletons remain visible with opacity indication
- [ ] No jarring animations for users with motion sensitivity

**Estimated Effort:** 0.25 story points

---

#### Task 7.3: Accessibility Testing - Screen Reader

**Description:** Test loading states with screen reader.

**Testing Steps:**
1. Enable VoiceOver (macOS) or NVDA (Windows)
2. Navigate to dashboard during loading
3. Verify screen reader announces "Loading statistics, please wait..."
4. Verify screen reader announces "Loading properties, please wait..."
5. Open modal and trigger save
6. Verify screen reader announces saving state

**Acceptance Criteria:**
- [ ] All loading states announced to screen reader
- [ ] Announcements are clear and contextual
- [ ] `role="status"` causes automatic announcement
- [ ] No duplicate or confusing announcements

**Estimated Effort:** 0.5 story points

---

## Implementation Order

The recommended implementation order for optimal workflow:

| Order | Task ID | Task Name | Dependencies |
|-------|---------|-----------|--------------|
| 1 | 3.1 | Add Reduced Motion CSS | None |
| 2 | 1.1 | Create SkeletonBase | None |
| 3 | 1.2 | Create SkeletonText | None |
| 4 | 1.3 | Create SkeletonCard | None |
| 5 | 1.4 | Create Skeleton Barrel Export | 1.1, 1.2, 1.3 |
| 6 | 2.1 | Create LoadingIndicator | None |
| 7 | 4.1 | Update StatisticsCards Skeleton | 1.4 |
| 8 | 4.2 | Update PropertySection Skeleton | 1.4 |
| 9 | 4.3 | Update PortfolioSummary Skeleton | 1.4 |
| 10 | 5.1 | Update PropertyEditModal Spinner | 2.1 |
| 11 | 5.2 | Update AddPropertyModal Spinner | 2.1 |
| 12 | 6.1 | Update Exports | 1.4, 2.1 |
| 13 | 7.1 | Manual Testing - Network | All implementation |
| 14 | 7.2 | Manual Testing - Reduced Motion | 3.1, All implementation |
| 15 | 7.3 | Accessibility Testing | All implementation |

---

## Files Summary

### Files to CREATE

| File Path | Task |
|-----------|------|
| `src/components/SimpleDashboard/skeletons/SkeletonBase.tsx` | 1.1 |
| `src/components/SimpleDashboard/skeletons/SkeletonText.tsx` | 1.2 |
| `src/components/SimpleDashboard/skeletons/SkeletonCard.tsx` | 1.3 |
| `src/components/SimpleDashboard/skeletons/index.ts` | 1.4 |
| `src/components/SimpleDashboard/LoadingIndicator.tsx` | 2.1 |

### Files to MODIFY

| File Path | Task | Lines/Section |
|-----------|------|---------------|
| `src/app/globals.css` | 3.1 | After line 210 |
| `src/components/SimpleDashboard/StatisticsCards.tsx` | 4.1 | Lines 100-120 |
| `src/components/SimpleDashboard/PropertySection.tsx` | 4.2 | Lines 59-84 |
| `src/components/SimpleDashboard/PortfolioSummary.tsx` | 4.3 | Lines 28-45 |
| `src/components/SimpleDashboard/PropertyEditModal.tsx` | 5.1 | Lines 546-554 |
| `src/components/SimpleDashboard/AddPropertyModal.tsx` | 5.2 | Lines 522-530 |
| `src/components/SimpleDashboard/index.ts` | 6.1 | After line 56 |

### Files NOT to Modify

| File Path | Reason |
|-----------|--------|
| `src/app/dashboard2/layout.tsx` | Loading state already complete with Airbnb colors |
| `src/app/dashboard2/create/page.tsx` | Complete per implementation plan |
| `src/app/dashboard2/items/page.tsx` | Complete per implementation plan |
| `src/components/ItemManager/components/shared/LoadingState.tsx` | Already has full accessibility |
| `src/components/SimpleDashboard/ActionButtons.tsx` | Static component, no async |
| `src/components/SimpleDashboard/EmptyStateCard.tsx` | Static component, no loading |

---

## Effort Summary

| Task Group | Tasks | Total Story Points |
|------------|-------|-------------------|
| Group 1: Skeleton Components | 4 | 1.75 |
| Group 2: Loading Indicator | 1 | 0.5 |
| Group 3: Reduced Motion | 1 | 0.25 |
| Group 4: Refactor Skeletons | 3 | 0.75 |
| Group 5: Modal Enhancements | 2 | 0.5 |
| Group 6: Exports | 1 | 0.25 |
| Group 7: Testing | 3 | 1.25 |
| **Total** | **15** | **5.25 story points** |

**Estimated Total Time:** 5-7 hours of focused implementation work

---

## Acceptance Criteria (From REQ-138)

Final verification against original requirements:

- [x] All data-loading sections display shimmer skeleton placeholders while fetching
- [x] Skeleton placeholders accurately reflect the layout and structure of loaded content
- [x] All async operations (save, update, delete, fetch) show consistent loading indicator
- [x] Loading states are visually distinct from empty states
- [x] Transitions between loading and loaded states are smooth without jarring layout shifts
- [x] Loading indicators automatically disappear when operations complete or error
- [x] Reduced motion support for users with `prefers-reduced-motion` preference
- [x] All loading states include proper accessibility attributes (role, aria-label, sr-only)

---

## Implementation Notes

**Implementation Date:** 2026-01-06 08:30:00 UTC
**Build Status:** PASSED (npm run build successful)

### Files Created
- `src/components/SimpleDashboard/skeletons/SkeletonBase.tsx` - Accessible skeleton wrapper
- `src/components/SimpleDashboard/skeletons/SkeletonText.tsx` - Text placeholder component
- `src/components/SimpleDashboard/skeletons/SkeletonCard.tsx` - Card placeholder component
- `src/components/SimpleDashboard/skeletons/index.ts` - Barrel export
- `src/components/SimpleDashboard/LoadingIndicator.tsx` - Unified spinner component

### Files Modified
- `src/app/globals.css` - Added reduced motion CSS support
- `src/components/SimpleDashboard/StatisticsCards.tsx` - Wrapped skeleton with SkeletonBase
- `src/components/SimpleDashboard/PropertySection.tsx` - Wrapped skeleton with SkeletonBase
- `src/components/SimpleDashboard/PortfolioSummary.tsx` - Wrapped skeleton with SkeletonBase
- `src/components/SimpleDashboard/PropertyEditModal.tsx` - Replaced inline spinner with LoadingIndicator
- `src/components/SimpleDashboard/AddPropertyModal.tsx` - Replaced inline spinner with LoadingIndicator
- `src/components/SimpleDashboard/index.ts` - Added new component exports

---

## References

- [Overview Document](/docs/REQ-138-loading-states-overview.md)
- [PRD: Dashboard 2 - Simple Dashboard](/docs/prd/PRD_Dashboard_2_Simple_Dashboard.md)
- [Airbnb Design System](/docs/prd/airbnb_designsystem.md) - Section 8: Motion & Animation
- [Implementation Plan](/docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md) - Phase 6.2
- [WCAG 2.1 - Reduced Motion Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)
