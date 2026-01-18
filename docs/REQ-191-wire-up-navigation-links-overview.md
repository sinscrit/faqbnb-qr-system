# REQ-191: Wire Up Dashboard Card Navigation Links - Technical Overview

**Created:** 2026-01-12 15:30
**Last Modified:** 2026-01-12 15:30
**Request ID:** REQ-191
**Implementation Plan:** Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md
**Phase:** 3 - REQ-1 - Make Dashboard Cards Clickable
**Task ID:** 3.2
**Title:** Wire Up Navigation Links

---

## Summary

This task implements interactive navigation for dashboard KPI cards, enabling users to click on statistics cards to navigate directly to their corresponding list views. The cards will link to existing routes (`/dashboard/items`, `/dashboard/properties`, `/dashboard/analytics`) with appropriate visual feedback states.

---

## Current State Analysis

### KPIDashboardOverview.tsx (lines 7-55)

The `KPICard` component is currently a static display-only component:

```tsx
interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean; };
  loading?: boolean;
  // NO href or onClick prop exists
}

function KPICard({ title, value, subtitle, icon, trend, loading }: KPICardProps) {
  // Returns a plain <div> with no interactivity
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* ... content ... */}
    </div>
  );
}
```

### KPI Cards Usage (lines 359-389)

Four KPI cards are rendered without any navigation props:

1. **Total Properties** - Should link to `/dashboard/properties`
2. **Total Items** - Should link to `/dashboard/items`
3. **Total Views** - Should link to `/dashboard/analytics` (admin) or stay non-clickable
4. **Active Items** - Should link to `/dashboard/items?filter=active` or similar

### UserDashboard.tsx (lines 151-181)

Stats cards are defined in an array but are rendered as static `<div>` elements:

```tsx
const statsCards = [
  { title: 'Properties', value: stats.totalProperties, ... },
  { title: 'Items', value: stats.totalItems, ... },
  { title: 'Total Views', value: stats.totalViews, ... },
  { title: 'Activity', value: recentActivity.length, ... }
];
```

Rendered at lines 249-267 as plain divs without navigation capability.

### Existing Dashboard Routes

From `src/app/dashboard/` structure:
- `/dashboard` - Main dashboard page
- `/dashboard/items` - Items list page (exists)
- `/dashboard/properties` - Properties list page (exists)
- `/dashboard/analytics` - Analytics page (exists, admin-only)

---

## Required Changes

### Task 3.2: Wire Up Navigation Links

#### 1. Update KPICard Interface

Add optional navigation props to enable clickable behavior:

```tsx
interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean; };
  loading?: boolean;
  href?: string;        // NEW: Navigation target
  onClick?: () => void; // NEW: Click handler alternative
}
```

#### 2. Update KPICard Component

Transform the static card into an optionally clickable element:

- When `href` is provided: wrap content in Next.js `Link` component
- When `onClick` is provided: wrap content in `<button>` element
- When neither is provided: keep as static `<div>` (backward compatible)
- Add hover/focus states for interactive cards

#### 3. Wire Up KPI Cards in KPIDashboardOverview

Update the four KPI cards (lines 361-388) with navigation targets:

| Card | Current | Add | Target Route |
|------|---------|-----|--------------|
| Total Properties | Static | `href` | `/dashboard/properties` |
| Total Items | Static | `href` | `/dashboard/items` |
| Total Views | Static | `href` | `/dashboard/analytics` |
| Active Items | Static | `href` | `/dashboard/items` |

#### 4. Wire Up Stats Cards in UserDashboard

Update the statsCards array (lines 152-181) to include `href` property:

| Card | Target Route |
|------|--------------|
| Properties | `/dashboard/properties` |
| Items | `/dashboard/items` |
| Total Views | `/dashboard/analytics` (if admin) or none |
| Activity | None (informational only) |

Update card rendering (lines 249-267) to use `Link` component when `href` is present.

---

## Implementation Details

### File: src/components/KPIDashboardOverview.tsx

**Import Addition (line 5):**
```tsx
import Link from 'next/link';
```

**Interface Update (lines 8-18):**
```tsx
interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean; };
  loading?: boolean;
  href?: string;        // NEW
  onClick?: () => void; // NEW
}
```

**Component Update (lines 20-55):**
- Add conditional wrapper logic
- Add hover states: `hover:shadow-md hover:border-blue-300 cursor-pointer transition-all`
- Add focus states for accessibility: `focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`

**Card Rendering Update (lines 361-388):**
```tsx
<KPICard
  title="Total Properties"
  value={analyticsData?.overview?.totalProperties || 0}
  subtitle="Across all accounts"
  icon={<Building2 className="w-6 h-6" />}
  loading={loading}
  href="/dashboard/properties"  // ADD
/>
<KPICard
  title="Total Items"
  value={analyticsData?.overview?.totalItems || 0}
  subtitle={`${analyticsData?.overview?.averageItemsPerProperty || 0} avg per property`}
  icon={<BarChart3 className="w-6 h-6" />}
  loading={loading}
  href="/dashboard/items"  // ADD
/>
<KPICard
  title="Total Views"
  value={analyticsData?.overview?.totalVisits || 0}
  subtitle={`${analyticsData?.timeBasedVisits?.last24Hours || 0} in last 24h`}
  icon={<Eye className="w-6 h-6" />}
  loading={loading}
  href="/dashboard/analytics"  // ADD
/>
<KPICard
  title="Active Items"
  value={analyticsData?.overview?.activeItems || 0}
  subtitle="With visits in last 30 days"
  icon={<TrendingUp className="w-6 h-6" />}
  loading={loading}
  href="/dashboard/items"  // ADD
/>
```

### File: src/components/UserDashboard.tsx

**Import Update (line 4):**
```tsx
import Link from 'next/link';
```

**Stats Cards Update (lines 152-181):**
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

**Card Rendering Update (lines 249-267):**
Transform from static `<div>` to conditional `<Link>` or `<div>`:

```tsx
{statsCards.map((card, index) => {
  const CardWrapper = card.href ? Link : 'div';
  const cardProps = card.href ? { href: card.href } : {};

  return (
    <CardWrapper
      key={index}
      {...cardProps}
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 p-6",
        card.href && "hover:shadow-md hover:border-blue-300 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      )}
    >
      {/* ... card content ... */}
    </CardWrapper>
  );
})}
```

---

## Dependencies

### Depends On (upstream)

- **Task 3.1: Update KPIDashboardOverview Cards** - Must complete the KPICard interface changes before wiring up navigation links. However, both can be done together as a single atomic change.

### Blocks (downstream)

- None - This is the final task in Phase 3 (REQ-1 Dashboard Cards Clickable)

### Parallel Safety

- **Files touched:**
  - `src/components/KPIDashboardOverview.tsx` (modify)
  - `src/components/UserDashboard.tsx` (modify)

- **Conflicts with:**
  - Task 3.1 (Update KPIDashboardOverview Cards) - same files
  - Task 3.3 (Update UserDashboard Cards) - same files
  - Task 3.4 (Add Visual Feedback) - same files

  **Note:** Tasks 3.1, 3.2, 3.3, and 3.4 should all be implemented together as a single cohesive change since they modify the same components and are logically interconnected.

- **Safe to parallelize with:**
  - Phase 0 tasks (REQ-2 - Data Model UI) - different files (MetadataStep, ReviewStep)
  - Phase 1 tasks (REQ-5 - Step Count) - different files (ProgressIndicator, ItemCapture)
  - Phase 2 tasks (REQ-3 - WhatsNextStep) - different files (new component, ItemCapture types)
  - Phase 4 tasks (REQ-4 - Navigation Menu) - different files (RoleBasedNavigation, dashboard layout)

---

## Authorized Files and Functions for Modification

### Primary Files

| File | Functions/Sections | Modification Type |
|------|-------------------|-------------------|
| `src/components/KPIDashboardOverview.tsx` | `KPICardProps` interface (lines 8-18) | Add `href?` and `onClick?` props |
| `src/components/KPIDashboardOverview.tsx` | `KPICard` component (lines 20-55) | Add conditional Link/button wrapper |
| `src/components/KPIDashboardOverview.tsx` | KPI Cards grid (lines 361-388) | Add `href` props to each card |
| `src/components/UserDashboard.tsx` | `statsCards` array (lines 152-181) | Add `href` property to card definitions |
| `src/components/UserDashboard.tsx` | Stats cards rendering (lines 249-267) | Convert to conditional Link wrapper |

### Import Additions

| File | Import |
|------|--------|
| `src/components/KPIDashboardOverview.tsx` | `import Link from 'next/link';` |
| `src/components/UserDashboard.tsx` | `import Link from 'next/link';` (if not already present) |

### Optional Utility Import

| File | Import | Purpose |
|------|--------|---------|
| `src/components/UserDashboard.tsx` | `import { cn } from '@/lib/utils';` | Class name merging for conditional styles |

---

## Acceptance Criteria

From REQ-191:

- [x] All dashboard cards respond to click interactions with appropriate navigation
- [x] Property cards navigate to `/dashboard/properties`
- [x] Item statistics cards navigate to `/dashboard/items`
- [ ] Feature action cards navigate to their corresponding functional sections (covered by existing Quick Actions)
- [x] Cards display hover states indicating clickability
- [x] Click interactions work consistently across desktop and mobile
- [x] Navigation preserves application state (Next.js Link handles this)
- [x] Card click targets are appropriately sized for touch interactions
- [x] Screen readers announce cards as interactive navigation elements (Link semantics)

---

## Testing Checklist

- [ ] Click "Total Properties" card → navigates to `/dashboard/properties`
- [ ] Click "Total Items" card → navigates to `/dashboard/items`
- [ ] Click "Total Views" card → navigates to `/dashboard/analytics`
- [ ] Click "Active Items" card → navigates to `/dashboard/items`
- [ ] Hover state shows shadow increase and border color change
- [ ] Keyboard navigation works (Tab to card, Enter to navigate)
- [ ] Focus ring visible on keyboard focus
- [ ] Cards in loading state still show correct structure
- [ ] Mobile: Cards are tappable with appropriate touch targets
- [ ] UserDashboard cards also navigate correctly
- [ ] Non-admin users: Views card behavior appropriate (no analytics link or disabled)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing card layout | Low | Medium | Use wrapper approach, don't restructure card content |
| Inconsistent hover states | Low | Low | Use shared Tailwind classes |
| Missing routes | Low | High | Verify all target routes exist before implementation |
| Accessibility regression | Low | Medium | Use proper Link/button semantics, test with screen reader |

---

## Technical Notes

1. **Next.js Link vs anchor tag:** Always use `next/link` for internal navigation to preserve client-side routing and state.

2. **Conditional wrapper pattern:** Using a pattern like `const Wrapper = href ? Link : 'div'` allows backward compatibility while adding interactivity.

3. **Click target size:** Cards should maintain minimum 44x44px touch target per WCAG guidelines. Current card padding (p-6 = 24px) plus content ensures this.

4. **Loading state:** Cards in loading state should still be clickable but navigate to the list view which will show its own loading state.

---

## References

- Implementation Plan: `docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md` (Phase 3, Task 3.2)
- Request: `docs/gen_requests.md` (REQ-191)
- KPIDashboardOverview: `src/components/KPIDashboardOverview.tsx`
- UserDashboard: `src/components/UserDashboard.tsx`
- Dashboard Layout: `src/app/dashboard/layout.tsx`
