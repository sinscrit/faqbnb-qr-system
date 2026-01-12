# REQ-193: Add Visual Feedback for Clickable Cards

**Created:** 2026-01-12
**Last Modified:** 2026-01-12
**Status:** Ready for Implementation
**Type:** UI/UX Enhancement
**Phase:** Phase 3 - REQ-1 (Make Dashboard Cards Clickable)
**Task ID:** 3.4
**Related Plan:** Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md

---

## Overview

This task adds visual feedback states (hover, active, focus) to the clickable dashboard cards in both `KPIDashboardOverview.tsx` and `UserDashboard.tsx`. The goal is to provide clear affordance that cards are interactive elements, improving user experience and accessibility.

---

## Technical Context

### Current State Analysis

**KPIDashboardOverview.tsx (lines 36-54):**
- `KPICard` component renders static `<div>` elements
- Current styling: `bg-white rounded-lg shadow-sm border border-gray-200 p-6`
- No interactive states (hover, focus, active)
- No `href` or `onClick` props - cards are not yet clickable
- Loading state handled separately (lines 21-34)

**UserDashboard.tsx (lines 249-267):**
- Stats cards are rendered via `statsCards.map()`
- Current styling: `bg-white rounded-lg shadow-sm border border-gray-200 p-6`
- Also static `<div>` elements without interactivity
- The property summary cards (lines 353-379) already have clickable styling:
  ```tsx
  className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer block"
  ```
  This pattern can be reused.

### Styling Utility

The codebase uses `cn()` from `@/lib/utils` (clsx + tailwind-merge) for conditional class composition:
```typescript
import { cn } from '@/lib/utils';
```

---

## Requirements

From Task 3.4 specification:
1. **Hover state**: shadow increase, subtle border color change
2. **Active state**: slight scale reduction
3. **Focus state**: visible focus ring for accessibility
4. **Cursor**: pointer

---

## Implementation Tasks

### Task 1: Update KPICard Component Styling

**File:** `src/components/KPIDashboardOverview.tsx`

**Changes Required:**

1. Import the `cn` utility function
2. Add conditional styling based on whether card is clickable
3. Apply interactive classes when `href` or `onClick` is provided

**Implementation:**

Update `KPICardProps` interface (line ~8-18):
```typescript
interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
  href?: string;        // Added for Task 3.1/3.2
  onClick?: () => void; // Added for Task 3.1/3.2
}
```

Update the card wrapper element (line ~36-54) with conditional classes:
```tsx
const isClickable = !!href || !!onClick;

const cardClasses = cn(
  // Base styles
  "bg-white rounded-lg shadow-sm border border-gray-200 p-6",
  // Interactive styles (when clickable)
  isClickable && [
    "cursor-pointer",
    "transition-all duration-200",
    // Hover: shadow increase + border color change
    "hover:shadow-md hover:border-blue-300",
    // Active: slight scale reduction
    "active:scale-[0.98]",
    // Focus: visible focus ring for accessibility
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
  ]
);
```

### Task 2: Update Stats Cards in UserDashboard

**File:** `src/components/UserDashboard.tsx`

**Changes Required:**

1. Import `cn` utility if not already imported
2. Add `href` property to `statsCards` array items
3. Update card rendering to use Link component with interactive styles

**Implementation:**

Update statsCards definition (lines 152-181) to include navigation targets:
```typescript
const statsCards = [
  {
    title: 'Properties',
    value: stats.totalProperties,
    subtitle: 'Total properties',
    icon: <Building2 className="w-6 h-6" />,
    color: 'bg-green-100 text-green-600',
    href: '/dashboard/properties'  // Navigate to properties list
  },
  {
    title: 'Items',
    value: stats.totalItems,
    subtitle: `${stats.recentItems} created recently`,
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'bg-blue-100 text-blue-600',
    href: '/dashboard/items'  // Navigate to items list
  },
  // ... remaining cards
];
```

Update the card rendering (lines 249-267) to apply interactive styles:
```tsx
{statsCards.map((card, index) => {
  const cardClasses = cn(
    "bg-white rounded-lg shadow-sm border border-gray-200 p-6",
    card.href && [
      "cursor-pointer",
      "transition-all duration-200",
      "hover:shadow-md hover:border-blue-300",
      "active:scale-[0.98]",
      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
    ]
  );

  const CardWrapper = card.href ? Link : 'div';
  const wrapperProps = card.href ? { href: card.href } : {};

  return (
    <CardWrapper key={index} className={cardClasses} {...wrapperProps}>
      {/* existing card content */}
    </CardWrapper>
  );
})}
```

### Task 3: Ensure Consistent Styling Tokens

**Required Tailwind Classes for All Clickable Cards:**

| State | Tailwind Classes | Visual Effect |
|-------|------------------|---------------|
| Default | `shadow-sm border-gray-200` | Subtle shadow, gray border |
| Hover | `hover:shadow-md hover:border-blue-300` | Increased shadow, blue border hint |
| Active | `active:scale-[0.98]` | Slight scale reduction (press feedback) |
| Focus | `focus:ring-2 focus:ring-blue-500 focus:ring-offset-2` | Blue focus ring with offset |
| Cursor | `cursor-pointer` | Pointer cursor on hover |
| Transition | `transition-all duration-200` | Smooth state transitions |

### Task 4: Maintain Loading State Appearance

The loading skeleton in both components should NOT have interactive styling:
- Keep loading cards as non-interactive `<div>` elements
- Do not apply hover/focus states to loading skeletons
- Ensure the shimmer animation is not affected

---

## Authorized Files and Functions for Modification

| File Path | Function/Section | Change Type |
|-----------|------------------|-------------|
| `src/components/KPIDashboardOverview.tsx` | `KPICardProps` interface (lines 8-18) | Add `href`, `onClick` props |
| `src/components/KPIDashboardOverview.tsx` | `KPICard` function (lines 20-55) | Add interactive styling logic |
| `src/components/KPIDashboardOverview.tsx` | Imports section (line 1-6) | Add `cn` import from `@/lib/utils`, `Link` from `next/link` |
| `src/components/UserDashboard.tsx` | `statsCards` array (lines 152-181) | Add `href` property to cards |
| `src/components/UserDashboard.tsx` | Stats cards render (lines 249-267) | Update to use Link with interactive classes |
| `src/components/UserDashboard.tsx` | Imports section (lines 1-7) | Add `cn` import if missing |

---

## Dependencies

### Depends On (upstream)
- **Task 3.1 (Update KPIDashboardOverview Cards)**: The `href` and `onClick` props must be added to `KPICardProps` before this styling task can fully work. However, the styling logic can be implemented in parallel as it conditionally applies based on prop presence.
- **Task 3.2 (Wire Up Navigation Links)**: Navigation targets must be defined before cards are fully functional, but styling can be done independently.
- **Task 3.3 (Update UserDashboard Cards)**: The `href` property must be added to `statsCards` array.

### Blocks (downstream)
- None - this is a leaf task in the Phase 3 dependency chain.

### Parallel Safety
- **Files touched:**
  - `src/components/KPIDashboardOverview.tsx`
  - `src/components/UserDashboard.tsx`
- **Conflicts with:**
  - Task 3.1 (modifies same files - `KPIDashboardOverview.tsx`)
  - Task 3.2 (modifies same files - `KPIDashboardOverview.tsx`)
  - Task 3.3 (modifies same files - `UserDashboard.tsx`)
- **Safe to parallelize with:**
  - All Phase 0 tasks (REQ-2) - different files
  - All Phase 1 tasks (REQ-5) - different files
  - All Phase 2 tasks (REQ-3) - different files
  - All Phase 4 tasks (REQ-4) - different files

**Recommendation:** Tasks 3.1, 3.2, 3.3, and 3.4 should be done sequentially OR combined into a single implementation session since they all modify the same files. A more efficient approach is to implement the props (3.1, 3.3), wire up links (3.2), and add styling (3.4) together in one pass.

---

## Testing Plan

### Visual Testing
- [ ] Verify hover state shows increased shadow and blue border hint
- [ ] Verify active state shows slight scale reduction (press effect)
- [ ] Verify focus state shows clear focus ring (keyboard navigation)
- [ ] Verify cursor changes to pointer on hover
- [ ] Verify smooth transitions between states

### Accessibility Testing
- [ ] Tab through cards with keyboard - focus ring should be visible
- [ ] Screen reader announces cards as interactive elements
- [ ] Focus order follows logical reading order
- [ ] Focus ring has sufficient contrast ratio

### Responsive Testing
- [ ] Test on mobile viewport (touch feedback)
- [ ] Test on tablet viewport
- [ ] Test on desktop viewport
- [ ] Verify loading skeletons do not have interactive states

### Cross-Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| CSS transition conflicts | Low | Low | Use `transition-all` consistently |
| Active state not visible on fast clicks | Low | Low | 200ms duration is long enough |
| Focus ring cutoff by parent container | Low | Medium | Use `ring-offset-2` for spacing |
| Touch devices don't show hover | Expected | None | Active state provides feedback on touch |

---

## Success Criteria

1. ✅ All dashboard cards show visual feedback on hover
2. ✅ Cards respond to click/press with subtle scale animation
3. ✅ Keyboard users can see focus indicator when tabbing
4. ✅ Pointer cursor indicates cards are clickable
5. ✅ Loading state cards remain non-interactive
6. ✅ Transitions are smooth (no jarring state changes)
7. ✅ Styling is consistent across both dashboard components
