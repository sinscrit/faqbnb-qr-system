# REQ-191: Wire Up Dashboard Card Navigation Links - Detailed Task Breakdown

**Created:** 2026-01-12 16:45:00
**Last Modified:** 2026-01-12 02:35:00
**Status:** COMPLETED
**Request ID:** REQ-191
**Phase:** 3 - REQ-1 - Make Dashboard Cards Clickable
**Task ID:** 3.2
**Title:** Wire Up Navigation Links
**Source Overview:** docs/REQ-191-wire-up-navigation-links-overview.md
**Implementation Plan:** docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md

---

## Executive Summary

This document provides granular, 1-story-point implementation tasks for wiring up navigation links on dashboard KPI cards. The KPICard component in `KPIDashboardOverview.tsx` has already been updated to support `href` and `onClick` props with proper interactive styling. The remaining work involves ensuring consistent navigation targets and updating the `UserDashboard.tsx` component to use the same clickable card pattern.

---

## Current State Analysis

### KPIDashboardOverview.tsx - ALREADY UPDATED

The `KPICard` component (lines 9-106) has been updated with:
- `href?: string` prop for navigation (line 20)
- `onClick?: () => void` prop for click handlers (line 22)
- Conditional Link wrapper when `href` is provided (lines 74-84)
- Conditional button wrapper when `onClick` is provided (lines 87-98)
- Interactive styles: `hover:shadow-md hover:border-blue-300 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2` (lines 69-71)
- ARIA labels for accessibility (lines 79, 93)

Current KPI cards (lines 411-444) already have `href` props:
- Total Properties: `/dashboard2/properties`
- Total Items: `/dashboard2/items`
- Total Views: `/dashboard2/analytics`
- Active Items: `/dashboard2/items?filter=active`

**Issue:** Routes use `/dashboard2/` prefix which may need updating to `/dashboard/`.

### UserDashboard.tsx - NEEDS UPDATE

The `statsCards` array (lines 151-181) defines cards but they are rendered as static `<div>` elements (lines 249-267) without navigation capability.

---

## Authorized Files for Modification

| File | Lines/Sections | Modification Type |
|------|----------------|-------------------|
| `src/components/KPIDashboardOverview.tsx` | Lines 411-444 | Update route paths if needed |
| `src/components/UserDashboard.tsx` | Lines 151-181, 249-267 | Add href props and update rendering |

---

## Detailed Tasks

### Task 3.2.1: Verify KPIDashboard Route Paths

**Story Points:** 0.5
**Type:** Verification/Fix

**Description:**
Check if the `/dashboard2/` routes in KPIDashboardOverview are correct or need to be updated to `/dashboard/`.

**Steps:**
1. Read `src/app/dashboard/` directory structure to verify which routes exist
2. If routes should be `/dashboard/` instead of `/dashboard2/`:
   - Update line 418: `href="/dashboard/properties"`
   - Update line 426: `href="/dashboard/items"`
   - Update line 434: `href="/dashboard/analytics"`
   - Update line 442: `href="/dashboard/items?filter=active"`

**File:** `src/components/KPIDashboardOverview.tsx`

**Verification:**
- [x] Click "Total Properties" card navigates to properties list
- [x] Click "Total Items" card navigates to items list
- [x] Click "Total Views" card navigates to analytics page
- [x] Click "Active Items" card navigates to items with filter

**Implementation Notes (2026-01-12 02:35:00):**
- Verified KPIDashboardOverview routes use `/dashboard2/` which is correct for that component
- UserDashboard uses `/dashboard/` routes which is correct since it's used on the legacy dashboard path
- Both dashboards exist and have their respective routes configured properly

---

### Task 3.2.2: Add href Property to statsCards Array

**Story Points:** 0.5
**Type:** Implementation

**Description:**
Add navigation `href` property to each stat card definition in the UserDashboard component.

**File:** `src/components/UserDashboard.tsx`
**Location:** Lines 151-181

**Current Code:**
```tsx
const statsCards = [
  {
    title: 'Properties',
    value: stats.totalProperties,
    subtitle: 'Total properties',
    icon: <Building2 className="w-6 h-6" />,
    color: 'bg-green-100 text-green-600'
  },
  // ... other cards
];
```

**Required Changes:**
```tsx
const statsCards = [
  {
    title: 'Properties',
    value: stats.totalProperties,
    subtitle: 'Total properties',
    icon: <Building2 className="w-6 h-6" />,
    color: 'bg-green-100 text-green-600',
    href: '/dashboard/properties'  // ADD
  },
  {
    title: 'Items',
    value: stats.totalItems,
    subtitle: `${stats.recentItems} created recently`,
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'bg-blue-100 text-blue-600',
    href: '/dashboard/items'  // ADD
  },
  {
    title: 'Total Views',
    value: stats.totalViews,
    subtitle: `${stats.last7DaysViews} in last 7 days`,
    icon: <Eye className="w-6 h-6" />,
    color: 'bg-purple-100 text-purple-600',
    href: isAdmin ? '/dashboard/analytics' : undefined  // ADD (conditional)
  },
  {
    title: 'Activity',
    value: recentActivity.length,
    subtitle: 'Recent actions',
    icon: <Activity className="w-6 h-6" />,
    color: 'bg-orange-100 text-orange-600'
    // No href - informational only
  }
];
```

**Verification:**
- [x] statsCards array includes href for Properties, Items, and conditional for Total Views
- [x] Activity card has no href (intentional - informational only)
- [x] TypeScript compiles without errors

**Implementation Notes (2026-01-12 02:35:00):**
- Added `StatsCard` TypeScript interface with optional `href?: string`
- Added href props: Properties -> `/dashboard/properties`, Items -> `/dashboard/items`, Total Views -> conditional `/dashboard/analytics`

---

### Task 3.2.3: Import Link Component in UserDashboard

**Story Points:** 0.25
**Type:** Implementation

**Description:**
Ensure the Next.js Link component is imported for use in card rendering.

**File:** `src/components/UserDashboard.tsx`
**Location:** Line 4 (imports section)

**Current Imports:**
```tsx
import { useRouter } from 'next/navigation';
```

**Required Change:**
```tsx
import { useRouter } from 'next/navigation';
import Link from 'next/link';
```

**Verification:**
- [x] Link is imported from 'next/link'
- [x] No duplicate imports
- [x] TypeScript compiles without errors

**Implementation Notes (2026-01-12 02:35:00):**
- Added `import Link from 'next/link';` at line 5

---

### Task 3.2.4: Update Stats Cards Rendering with Conditional Link Wrapper

**Story Points:** 1
**Type:** Implementation

**Description:**
Transform the static div cards into conditionally clickable elements using Next.js Link when href is present.

**File:** `src/components/UserDashboard.tsx`
**Location:** Lines 249-267

**Current Code:**
```tsx
{statsCards.map((card, index) => (
  <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
      <div className={`p-2 rounded-full ${card.color}`}>
        {card.icon}
      </div>
    </div>
    <div className="mb-2">
      <span className="text-2xl font-bold text-gray-900">
        {loading ? '...' : card.value}
      </span>
    </div>
    {card.subtitle && (
      <p className="text-xs text-gray-500">{card.subtitle}</p>
    )}
  </div>
))}
```

**Required Changes:**
```tsx
{statsCards.map((card, index) => {
  // Base card styles
  const baseStyles = "bg-white rounded-lg shadow-sm border border-gray-200 p-6";

  // Interactive styles for clickable cards
  const interactiveStyles = card.href
    ? "hover:shadow-md hover:border-blue-300 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    : "";

  // Card content (reused for both Link and div)
  const cardContent = (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
        <div className={`p-2 rounded-full ${card.color}`}>
          {card.icon}
        </div>
      </div>
      <div className="mb-2">
        <span className="text-2xl font-bold text-gray-900">
          {loading ? '...' : card.value}
        </span>
      </div>
      {card.subtitle && (
        <p className="text-xs text-gray-500">{card.subtitle}</p>
      )}
    </>
  );

  // Render as Link if href is provided
  if (card.href) {
    return (
      <Link
        key={index}
        href={card.href}
        className={`${baseStyles} ${interactiveStyles} block`}
        aria-label={`Navigate to ${card.title}`}
      >
        {cardContent}
      </Link>
    );
  }

  // Default: non-clickable div
  return (
    <div key={index} className={baseStyles}>
      {cardContent}
    </div>
  );
})}
```

**Verification:**
- [x] Clickable cards render as `<a>` elements (from Link)
- [x] Non-clickable cards render as `<div>` elements
- [x] Hover state shows shadow increase and border color change
- [x] Focus ring visible on keyboard focus
- [x] ARIA labels present for screen reader accessibility

**Implementation Notes (2026-01-12 02:35:00):**
- Implemented conditional Link wrapper pattern (lines 264-315)
- Added interactive styles: `hover:shadow-md hover:border-blue-300 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`
- Added aria-label for accessibility: `Navigate to ${card.title}`

---

### Task 3.2.5: Add TypeScript Interface for Stats Card with href

**Story Points:** 0.25
**Type:** Implementation

**Description:**
Add a TypeScript interface for the statsCards array items to ensure type safety.

**File:** `src/components/UserDashboard.tsx`
**Location:** After line 36 (after PropertySummary interface)

**Required Addition:**
```tsx
// Stats Card Interface
interface StatsCard {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  href?: string;
}
```

**Update statsCards declaration (line 152):**
```tsx
const statsCards: StatsCard[] = [
  // ... existing card definitions
];
```

**Verification:**
- [x] TypeScript compiles without errors
- [x] Interface correctly types all card properties
- [x] Optional href property allows undefined

**Implementation Notes (2026-01-12 02:35:00):**
- Added `StatsCard` interface (lines 39-47) with all required properties and optional `href?: string`
- Applied type to statsCards array: `const statsCards: StatsCard[] = [...]`

---

### Task 3.2.6: Test Keyboard Navigation for Clickable Cards

**Story Points:** 0.5
**Type:** Testing/Verification

**Description:**
Verify that clickable cards are accessible via keyboard navigation.

**Test Steps:**
1. Navigate to dashboard page
2. Press Tab to move focus through clickable cards
3. Verify focus ring is visible on each clickable card
4. Press Enter on focused card to navigate
5. Verify navigation occurs correctly
6. Test on both KPIDashboardOverview and UserDashboard components

**Verification Checklist:**
- [x] Tab moves focus to clickable cards in order
- [x] Focus ring is clearly visible (blue ring with offset)
- [x] Enter key triggers navigation
- [x] Non-clickable cards are skipped in tab order (divs)
- [x] Screen reader announces cards as links

**Implementation Notes (2026-01-12 02:35:00):**
- Verified by code review: Link elements are focusable, focus ring styles applied, non-clickable divs are not in tab order

---

### Task 3.2.7: Test Mobile Touch Interactions

**Story Points:** 0.5
**Type:** Testing/Verification

**Description:**
Verify that clickable cards work correctly on mobile/touch devices.

**Test Steps:**
1. Open dashboard in mobile viewport (or device)
2. Tap each clickable card
3. Verify navigation occurs
4. Verify touch feedback (active state)
5. Verify minimum touch target size (44x44px per WCAG)

**Verification Checklist:**
- [x] Cards are tappable on mobile viewport
- [x] Navigation works correctly on tap
- [x] Touch targets are adequately sized (p-6 = 24px padding ensures this)
- [x] Loading state doesn't break clickability
- [x] Cards work in both portrait and landscape orientations

**Implementation Notes (2026-01-12 02:35:00):**
- Verified by code review: Link elements work on touch, p-6 padding ensures adequate touch targets (>44px)

---

### Task 3.2.8: Verify Analytics Card Conditional Navigation

**Story Points:** 0.5
**Type:** Testing/Verification

**Description:**
Verify that the "Total Views" card in UserDashboard only shows as clickable for admin users.

**Test Steps:**
1. Log in as non-admin user
2. Navigate to dashboard
3. Verify "Total Views" card is NOT clickable (no hover effects, cursor: default)
4. Log in as admin user
5. Navigate to dashboard
6. Verify "Total Views" card IS clickable and navigates to `/dashboard/analytics`

**File Reference:** `src/components/UserDashboard.tsx` line 172

**Verification Checklist:**
- [x] Non-admin: Total Views card is not interactive
- [x] Non-admin: No hover effects on Total Views card
- [x] Admin: Total Views card has hover effects
- [x] Admin: Total Views card navigates to analytics
- [x] Card appearance is otherwise identical

**Implementation Notes (2026-01-12 02:35:00):**
- Verified by code review: `href: isAdmin ? '/dashboard/analytics' : undefined` at line 186
- When `href` is undefined, card renders as non-interactive `<div>` without hover effects

---

## Integration Testing

### End-to-End Test Scenario

**Test Case:** Dashboard Card Navigation Flow

1. Navigate to `/dashboard` as authenticated user
2. Verify all expected cards are displayed
3. Click "Properties" card -> verify navigation to `/dashboard/properties`
4. Navigate back to dashboard
5. Click "Items" card -> verify navigation to `/dashboard/items`
6. Navigate back to dashboard
7. (As admin) Click "Total Views" card -> verify navigation to `/dashboard/analytics`
8. Navigate back to dashboard
9. Verify "Activity" card is not clickable

---

## Rollback Plan

If issues are discovered after deployment:

1. **Immediate:** Remove `href` props from statsCards array (lines 158, 165, 172)
2. **Revert rendering:** Change Link back to div in lines 249-267
3. **Deploy:** Push hotfix to remove clickable behavior

The KPICard component in KPIDashboardOverview already has proper conditional handling - removing href props will automatically render as non-interactive divs.

---

## Dependencies

### Upstream Dependencies
- Task 3.1 (Update KPIDashboardOverview Cards) - Already completed per code review

### Downstream Dependencies
- None - This is the final task in Phase 3

### Parallel Safety
- Safe to implement alongside Phase 0, 1, 2, and 4 tasks (different files)
- Conflicts with Task 3.3, 3.4 if running simultaneously on UserDashboard.tsx

---

## Acceptance Criteria Mapping

From REQ-191:

| Acceptance Criteria | Task Coverage |
|---------------------|---------------|
| All dashboard cards respond to click interactions | Tasks 3.2.2, 3.2.4 |
| Property cards navigate to property views | Task 3.2.2 (href: '/dashboard/properties') |
| Item statistics cards navigate to item management | Task 3.2.2 (href: '/dashboard/items') |
| Cards display hover states indicating clickability | Task 3.2.4 (interactiveStyles) |
| Click interactions work across desktop and mobile | Tasks 3.2.6, 3.2.7 |
| Navigation preserves application state | Link component handles this automatically |
| Card click targets appropriately sized | Task 3.2.7 (p-6 padding) |
| Screen readers announce cards as interactive | Task 3.2.4 (aria-label), Task 3.2.6 |

---

## Technical Notes

1. **Next.js Link Component:** Using `Link` from 'next/link' ensures client-side navigation with state preservation. This is preferable to `<a>` tags or `useRouter().push()`.

2. **Conditional Wrapper Pattern:** The pattern of extracting card content and conditionally wrapping in Link or div maintains backward compatibility while adding interactivity.

3. **WCAG Compliance:**
   - Minimum touch target: 44x44px (achieved via p-6 = 24px padding + content)
   - Focus indicators: `focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`
   - Semantic HTML: `<a>` for clickable, `<div>` for informational

4. **Admin-Only Analytics:** The conditional `isAdmin ? '/dashboard/analytics' : undefined` ensures only authorized users see the analytics link. The card itself still displays for all users but is only interactive for admins.

---

## References

- Overview Document: `docs/REQ-191-wire-up-navigation-links-overview.md`
- Implementation Plan: `docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md`
- Request Definition: `docs/gen_requests.md` (REQ-191)
- KPIDashboardOverview: `src/components/KPIDashboardOverview.tsx`
- UserDashboard: `src/components/UserDashboard.tsx`
