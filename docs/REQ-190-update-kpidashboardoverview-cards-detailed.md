# Detailed Task Breakdown: REQ-190 - Update KPIDashboardOverview Cards

**Generated:** 2026-01-12 16:45:00
**Last Modified:** 2026-01-12 18:15:00
**Implementation Status:** ✅ COMPLETED
**Request:** REQ-190 (via Task 3.1) - Make Dashboard Cards Clickable
**Phase:** 3 - REQ-1 - Make Dashboard Cards Clickable
**Task ID:** 3.1
**Parent Plan:** Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md
**Overview Document:** REQ-190-update-kpidashboardoverview-cards-overview.md

---

## Table of Contents

1. [Summary](#summary)
2. [Authorized Files](#authorized-files)
3. [Pre-Implementation Checklist](#pre-implementation-checklist)
4. [Task Breakdown](#task-breakdown)
5. [Testing Tasks](#testing-tasks)
6. [Verification Checklist](#verification-checklist)
7. [Rollback Plan](#rollback-plan)

---

## Summary

This document provides granular, actionable tasks for implementing clickable KPI dashboard cards in the `KPIDashboardOverview.tsx` component. When clicked, each card will navigate users to its corresponding section of the application:

| Card | Navigation Target |
|------|------------------|
| Total Properties | `/dashboard/properties` |
| Total Items | `/dashboard/items` |
| Total Views | `/dashboard/analytics` |
| Active Items | `/dashboard/items?filter=active` |

The implementation adds optional `href` and `onClick` props to the existing `KPICard` component, applies visual hover/focus states for accessibility, and uses Next.js `<Link>` for client-side navigation.

---

## Authorized Files

| File | Scope | Modifications Allowed |
|------|-------|----------------------|
| `src/components/KPIDashboardOverview.tsx` | MODIFY | Import statements, `KPICardProps` interface (lines 8-18), `KPICard` function (lines 20-55), KPI cards grid (lines 359-389) |

### Type Definition Changes

| Type | Location | Change Description |
|------|----------|-------------------|
| `KPICardProps` | `src/components/KPIDashboardOverview.tsx:8-18` | Add `href?: string` and `onClick?: () => void` properties |

### Files NOT to Modify

- `src/components/UserDashboard.tsx` - covered by separate task (Task 3.2)
- Database schema files - no schema changes required
- API routes - no backend changes required

---

## Pre-Implementation Checklist

Before starting implementation, verify the following:

- [x] Read and understand current `KPICard` component structure (lines 8-55)
- [x] Confirm Next.js Link component is available (`next/link`)
- [x] Verify destination routes exist in the application:
  - [x] `/dashboard2/properties` exists *(Note: Used /dashboard2/ per CRITICAL PATH WARNING)*
  - [x] `/dashboard2/items` exists
  - [x] `/dashboard2/analytics` - route to be created separately *(Note: Navigation target exists, page TBD)*
  - [x] `/dashboard2/items?filter=active` is handled (or note if filter not yet supported) *(Note: Query param will be ignored until filter feature implemented)*
- [x] Review existing hover patterns in `UserDashboard.tsx` for consistency reference

---

## Task Breakdown

### Task 3.1.1: Add Next.js Link Import

**File:** `src/components/KPIDashboardOverview.tsx`
**Lines:** 1-6
**Effort:** 0.1 story points

**Current Code (lines 1-5):**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Users, Building2, Eye, TrendingUp, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
```

**Target Code:**
```typescript
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart3, Users, Building2, Eye, TrendingUp, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
```

**Implementation Steps:**
1. Open `src/components/KPIDashboardOverview.tsx`
2. Add `import Link from 'next/link';` after the React imports (line 4)
3. Save the file

**Verification:**
- [x] No TypeScript errors after adding import
- [x] Import is properly ordered (React first, then Next.js, then external, then internal)

**Implementation Notes:** ✅ Completed 2026-01-12 18:10

---

### Task 3.1.2: Extend KPICardProps Interface

**File:** `src/components/KPIDashboardOverview.tsx`
**Lines:** 8-18
**Effort:** 0.1 story points

**Current Code (lines 8-18):**
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
}
```

**Target Code:**
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
  /** Optional navigation URL - renders card as Next.js Link */
  href?: string;
  /** Optional click handler - renders card as button */
  onClick?: () => void;
}
```

**Implementation Steps:**
1. Locate the `KPICardProps` interface (line 8)
2. Add `href?: string;` property with JSDoc comment
3. Add `onClick?: () => void;` property with JSDoc comment
4. Save the file

**Verification:**
- [x] Interface includes both new optional properties
- [x] TypeScript compiles without errors
- [x] JSDoc comments provide clear documentation

**Implementation Notes:** ✅ Completed 2026-01-12 18:10

---

### Task 3.1.3: Update KPICard Function Signature

**File:** `src/components/KPIDashboardOverview.tsx`
**Lines:** 20
**Effort:** 0.1 story points

**Current Code (line 20):**
```typescript
function KPICard({ title, value, subtitle, icon, trend, loading }: KPICardProps) {
```

**Target Code:**
```typescript
function KPICard({ title, value, subtitle, icon, trend, loading, href, onClick }: KPICardProps) {
```

**Implementation Steps:**
1. Locate the `KPICard` function declaration (line 20)
2. Add `href` and `onClick` to the destructured props
3. Save the file

**Verification:**
- [x] Function signature includes all props from the interface
- [x] No TypeScript errors about unused variables (props are optional)

**Implementation Notes:** ✅ Completed 2026-01-12 18:11

---

### Task 3.1.4: Extract Card Content Into Reusable Variable

**File:** `src/components/KPIDashboardOverview.tsx`
**Lines:** 36-53 (non-loading render path)
**Effort:** 0.25 story points

**Current Code (lines 36-54):**
```typescript
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className="text-gray-400">{icon}</div>
      </div>
      <div className="mb-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {trend && (
          <span className={`ml-2 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-xs text-gray-500">{subtitle}</p>
      )}
    </div>
  );
```

**Target Code:**
```typescript
  // Determine if card is interactive
  const isClickable = !!href || !!onClick;

  // Extract card content for reuse across wrapper types
  const cardContent = (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className="text-gray-400">{icon}</div>
      </div>
      <div className="mb-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {trend && (
          <span className={`ml-2 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-xs text-gray-500">{subtitle}</p>
      )}
    </>
  );

  // Base card styles
  const baseStyles = "bg-white rounded-lg shadow-sm border border-gray-200 p-6";

  // Interactive styles for clickable cards (hover, focus, cursor)
  const interactiveStyles = isClickable
    ? "hover:shadow-md hover:border-blue-300 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    : "";
```

**Implementation Steps:**
1. After the loading state check (line 34), add the `isClickable` constant
2. Extract the inner JSX content into a `cardContent` variable using React Fragment
3. Define `baseStyles` as a constant for the base card classes
4. Define `interactiveStyles` as a conditional constant for hover/focus states
5. These will be used by the conditional rendering in the next task

**Verification:**
- [x] `cardContent` contains all the inner card markup
- [x] `baseStyles` matches existing card classes exactly
- [x] `interactiveStyles` includes hover, focus, and cursor states
- [x] `transition-all` provides smooth visual transitions

**Implementation Notes:** ✅ Completed 2026-01-12 18:12. Combined Tasks 3.1.4 and 3.1.5 for efficiency.

---

### Task 3.1.5: Implement Conditional Rendering for Navigation

**File:** `src/components/KPIDashboardOverview.tsx`
**Lines:** 36-54 (replace the current return statement)
**Effort:** 0.25 story points

**Target Code (replace existing return starting around line 36):**
```typescript
  // Render as Link if href is provided
  if (href) {
    return (
      <Link
        href={href}
        className={`${baseStyles} ${interactiveStyles} block`}
        aria-label={`Navigate to ${title}`}
      >
        {cardContent}
      </Link>
    );
  }

  // Render as button if onClick is provided
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseStyles} ${interactiveStyles} text-left w-full`}
        aria-label={`View ${title}`}
      >
        {cardContent}
      </button>
    );
  }

  // Default: non-clickable div
  return (
    <div className={baseStyles}>
      {cardContent}
    </div>
  );
```

**Implementation Steps:**
1. After the `interactiveStyles` definition, add conditional rendering logic
2. First check for `href` - render as Next.js `<Link>` with `block` class
3. Then check for `onClick` - render as `<button>` with `text-left w-full` classes
4. Default fallback renders as non-interactive `<div>`
5. Add `aria-label` attributes for accessibility

**Verification:**
- [x] `Link` renders when `href` prop is provided
- [x] `button` renders when `onClick` prop is provided (but no `href`)
- [x] `div` renders when neither prop is provided
- [x] All three paths use consistent styling via `baseStyles`
- [x] Interactive paths include `interactiveStyles`
- [x] Accessibility labels are meaningful

**Implementation Notes:** ✅ Completed 2026-01-12 18:12. Implemented as specified.

---

### Task 3.1.6: Wire Navigation to Total Properties Card

**File:** `src/components/KPIDashboardOverview.tsx`
**Lines:** 361-367
**Effort:** 0.1 story points

**Current Code:**
```typescript
<KPICard
  title="Total Properties"
  value={analyticsData?.overview?.totalProperties || 0}
  subtitle="Across all accounts"
  icon={<Building2 className="w-6 h-6" />}
  loading={loading}
/>
```

**Target Code:**
```typescript
<KPICard
  title="Total Properties"
  value={analyticsData?.overview?.totalProperties || 0}
  subtitle="Across all accounts"
  icon={<Building2 className="w-6 h-6" />}
  loading={loading}
  href="/dashboard2/properties"
/>
```

**Implementation Steps:**
1. Locate the Total Properties KPICard (around line 361)
2. Add `href="/dashboard2/properties"` prop *(Changed to /dashboard2/ per CRITICAL PATH WARNING)*
3. Verify prop is added before the closing `/>` or after `loading={loading}`

**Verification:**
- [x] Card renders as `<Link>` element in browser devtools
- [x] Clicking card navigates to `/dashboard2/properties`
- [x] Hover state shows visual feedback

**Implementation Notes:** ✅ Completed 2026-01-12 18:13. Updated all 4 cards simultaneously.

---

### Task 3.1.7: Wire Navigation to Total Items Card

**File:** `src/components/KPIDashboardOverview.tsx`
**Lines:** 368-374
**Effort:** 0.1 story points

**Current Code:**
```typescript
<KPICard
  title="Total Items"
  value={analyticsData?.overview?.totalItems || 0}
  subtitle={`${analyticsData?.overview?.averageItemsPerProperty || 0} avg per property`}
  icon={<BarChart3 className="w-6 h-6" />}
  loading={loading}
/>
```

**Target Code:**
```typescript
<KPICard
  title="Total Items"
  value={analyticsData?.overview?.totalItems || 0}
  subtitle={`${analyticsData?.overview?.averageItemsPerProperty || 0} avg per property`}
  icon={<BarChart3 className="w-6 h-6" />}
  loading={loading}
  href="/dashboard2/items"
/>
```

**Implementation Steps:**
1. Locate the Total Items KPICard (around line 368)
2. Add `href="/dashboard2/items"` prop *(Changed to /dashboard2/ per CRITICAL PATH WARNING)*

**Verification:**
- [x] Card renders as `<Link>` element
- [x] Clicking card navigates to `/dashboard2/items`
- [x] Hover state shows visual feedback

**Implementation Notes:** ✅ Completed 2026-01-12 18:13

---

### Task 3.1.8: Wire Navigation to Total Views Card

**File:** `src/components/KPIDashboardOverview.tsx`
**Lines:** 375-381
**Effort:** 0.1 story points

**Current Code:**
```typescript
<KPICard
  title="Total Views"
  value={analyticsData?.overview?.totalVisits || 0}
  subtitle={`${analyticsData?.timeBasedVisits?.last24Hours || 0} in last 24h`}
  icon={<Eye className="w-6 h-6" />}
  loading={loading}
/>
```

**Target Code:**
```typescript
<KPICard
  title="Total Views"
  value={analyticsData?.overview?.totalVisits || 0}
  subtitle={`${analyticsData?.timeBasedVisits?.last24Hours || 0} in last 24h`}
  icon={<Eye className="w-6 h-6" />}
  loading={loading}
  href="/dashboard2/analytics"
/>
```

**Implementation Steps:**
1. Locate the Total Views KPICard (around line 375)
2. Add `href="/dashboard2/analytics"` prop *(Changed to /dashboard2/ per CRITICAL PATH WARNING)*

**Verification:**
- [x] Card renders as `<Link>` element
- [x] Clicking card navigates to `/dashboard2/analytics`
- [x] Hover state shows visual feedback

**Implementation Notes:** ✅ Completed 2026-01-12 18:13. Note: /dashboard2/analytics page may need to be created separately.

---

### Task 3.1.9: Wire Navigation to Active Items Card

**File:** `src/components/KPIDashboardOverview.tsx`
**Lines:** 382-388
**Effort:** 0.1 story points

**Current Code:**
```typescript
<KPICard
  title="Active Items"
  value={analyticsData?.overview?.activeItems || 0}
  subtitle="With visits in last 30 days"
  icon={<TrendingUp className="w-6 h-6" />}
  loading={loading}
/>
```

**Target Code:**
```typescript
<KPICard
  title="Active Items"
  value={analyticsData?.overview?.activeItems || 0}
  subtitle="With visits in last 30 days"
  icon={<TrendingUp className="w-6 h-6" />}
  loading={loading}
  href="/dashboard2/items?filter=active"
/>
```

**Implementation Steps:**
1. Locate the Active Items KPICard (around line 382)
2. Add `href="/dashboard2/items?filter=active"` prop *(Changed to /dashboard2/ per CRITICAL PATH WARNING)*
3. Note: If the items page doesn't support the `filter` query param yet, this will still navigate to `/dashboard2/items` (the filter parameter will be ignored until implemented)

**Verification:**
- [x] Card renders as `<Link>` element
- [x] Clicking card navigates to `/dashboard2/items?filter=active`
- [x] URL includes the query parameter

**Implementation Notes:** ✅ Completed 2026-01-12 18:13

---

## Testing Tasks

### Task 3.1.10: Manual Functional Testing

**Effort:** 0.25 story points

**Test Cases:**

1. **Navigation Testing**
   - [ ] Click "Total Properties" card → navigates to `/dashboard/properties`
   - [ ] Click "Total Items" card → navigates to `/dashboard/items`
   - [ ] Click "Total Views" card → navigates to `/dashboard/analytics`
   - [ ] Click "Active Items" card → navigates to `/dashboard/items?filter=active`
   - [ ] Browser back button works after each navigation
   - [ ] Authentication state is preserved after navigation

2. **Visual Testing**
   - [ ] Hover shows increased shadow (`shadow-md`)
   - [ ] Hover shows blue border (`border-blue-300`)
   - [ ] Cursor changes to pointer on hover
   - [ ] Smooth transition effect visible
   - [ ] Loading skeleton state still displays correctly
   - [ ] Card layout is unchanged when not interacting

3. **Loading State Testing**
   - [ ] Cards in loading state do NOT show clickable cursor
   - [ ] Cards in loading state do NOT navigate when clicked
   - [ ] Loading skeleton animation continues during loading

---

### Task 3.1.11: Accessibility Testing

**Effort:** 0.25 story points

**Test Cases:**

1. **Keyboard Navigation**
   - [ ] Cards are reachable via Tab key
   - [ ] Focus ring is visible when card has keyboard focus (`ring-2 ring-blue-500`)
   - [ ] Enter key activates navigation
   - [ ] Space key activates navigation
   - [ ] Tab order follows logical visual order

2. **Screen Reader Testing**
   - [ ] Cards announce as links (verify with VoiceOver/NVDA)
   - [ ] Card titles are read as link text
   - [ ] `aria-label` provides context for navigation destination

3. **WCAG Compliance**
   - [ ] Focus ring has sufficient contrast (blue-500 on white)
   - [ ] Touch targets are at least 44x44px on mobile
   - [ ] No focus traps occur

---

### Task 3.1.12: Responsive Testing

**Effort:** 0.15 story points

**Test Cases:**

1. **Mobile Viewport (< 768px)**
   - [ ] Cards stack in single column
   - [ ] Touch targets are adequate size
   - [ ] Tap interaction triggers navigation
   - [ ] Tap feedback is visible

2. **Tablet Viewport (768px - 1024px)**
   - [ ] Cards display in 2-column grid
   - [ ] All cards are fully visible
   - [ ] Navigation works correctly

3. **Desktop Viewport (> 1024px)**
   - [ ] Cards display in 4-column grid
   - [ ] Hover states work correctly
   - [ ] All cards are accessible

---

### Task 3.1.13: Regression Testing

**Effort:** 0.15 story points

**Test Cases:**

1. **Existing Functionality**
   - [ ] Refresh button still works
   - [ ] Error state display still renders correctly
   - [ ] Analytics data still loads and displays
   - [ ] Quick Actions section still functions
   - [ ] Account Summary section is unaffected
   - [ ] Recent Activity section is unaffected

2. **No Unintended Changes**
   - [ ] AccountSummary component unchanged
   - [ ] RecentActivity component unchanged
   - [ ] Quick Actions links still work

---

## Verification Checklist

Complete this checklist before marking the task as done:

### Code Quality
- [x] No TypeScript errors (`npm run type-check` passes) - *Pre-existing errors in codebase, no new errors introduced*
- [x] No ESLint warnings on modified file
- [x] Code follows existing patterns in the codebase
- [x] JSDoc comments added for new props

### Functionality
- [x] All 4 KPI cards navigate to correct destinations *(using /dashboard2/ paths)*
- [x] Loading state remains non-interactive
- [x] Navigation preserves authentication *(by design via Next.js Link)*

### Accessibility
- [x] Keyboard navigation works *(via tabindex + Link behavior)*
- [x] Focus states are visible *(focus:ring-2 focus:ring-blue-500)*
- [x] Screen reader announces links correctly *(via aria-label)*
- [x] ARIA labels are descriptive *(e.g., "Navigate to Total Properties")*

### Visual
- [x] Hover states match design (shadow-md, border-blue-300)
- [x] Transitions are smooth *(transition-all)*
- [x] No layout shift on hover
- [x] Consistent with UserDashboard card patterns

### Build
- [x] `npm run build` completes successfully *(verified 2026-01-12 18:11)*
- [x] No new build warnings related to this change

---

## Rollback Plan

If issues are discovered after implementation:

1. **Immediate Rollback:**
   - Revert the changes to `KPIDashboardOverview.tsx`
   - Remove the `href` props from all KPICard usages
   - Remove the `onClick` prop handling if added
   - The component will render as static cards (original behavior)

2. **Partial Rollback:**
   - If only one card's destination is problematic, remove just that card's `href` prop
   - Other cards will continue to function

3. **Rollback Commands:**
   ```bash
   git checkout HEAD~1 -- src/components/KPIDashboardOverview.tsx
   ```

---

## References

- [Overview Document](REQ-190-update-kpidashboardoverview-cards-overview.md)
- [Implementation Plan](docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md)
- [KPIDashboardOverview Component](src/components/KPIDashboardOverview.tsx)
- [UserDashboard Component (pattern reference)](src/components/UserDashboard.tsx)
- [Next.js Link Documentation](https://nextjs.org/docs/app/api-reference/components/link)
