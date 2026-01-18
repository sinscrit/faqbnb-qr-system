# REQ-192: Update UserDashboard Cards - Technical Overview

**Generated:** 2026-01-12 15:45:00
**Last Modified:** 2026-01-12 15:45:00
**Request ID:** REQ-192
**Implementation Plan:** Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md
**Phase:** 3 - REQ-1 - Make Dashboard Cards Clickable
**Task ID:** 3.3

---

## Summary

Add navigation links to statistics cards in the UserDashboard component, enabling users to navigate directly from dashboard metrics to detailed list views. This task is part of Phase 3 (REQ-1) which makes dashboard cards clickable across both KPIDashboardOverview and UserDashboard components.

---

## Current State Analysis

### File: `src/components/UserDashboard.tsx`

**Lines 151-181 - Stats Cards Definition:**
```tsx
const statsCards = [
  {
    title: 'Properties',
    value: stats.totalProperties,
    subtitle: 'Total properties',
    icon: <Building2 className="w-6 h-6" />,
    color: 'bg-green-100 text-green-600'
  },
  {
    title: 'Items',
    value: stats.totalItems,
    subtitle: `${stats.recentItems} created recently`,
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    title: 'Total Views',
    value: stats.totalViews,
    subtitle: `${stats.last7DaysViews} in last 7 days`,
    icon: <Eye className="w-6 h-6" />,
    color: 'bg-purple-100 text-purple-600'
  },
  {
    title: 'Activity',
    value: recentActivity.length,
    subtitle: 'Recent actions',
    icon: <Activity className="w-6 h-6" />,
    color: 'bg-orange-100 text-orange-600'
  }
];
```

**Lines 248-268 - Stats Cards Rendering:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
</div>
```

**Key Observations:**
1. Stats cards are static `<div>` elements with no navigation capability
2. Card structure already includes title, value, subtitle, icon, and color
3. No `href` property exists in the card interface
4. Card rendering uses inline styles without Link component
5. The component already imports `useRouter` but doesn't use it for cards

---

## Required Changes

### Task 3.3.1: Add href Property to statsCards Array

**Location:** `src/components/UserDashboard.tsx` lines 151-181

**Changes:**
- Add `href` property to each card object
- Map cards to appropriate navigation routes

**Updated Code:**
```tsx
const statsCards = [
  {
    title: 'Properties',
    value: stats.totalProperties,
    subtitle: 'Total properties',
    icon: <Building2 className="w-6 h-6" />,
    color: 'bg-green-100 text-green-600',
    href: '/dashboard/properties'
  },
  {
    title: 'Items',
    value: stats.totalItems,
    subtitle: `${stats.recentItems} created recently`,
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'bg-blue-100 text-blue-600',
    href: '/dashboard/items'
  },
  {
    title: 'Total Views',
    value: stats.totalViews,
    subtitle: `${stats.last7DaysViews} in last 7 days`,
    icon: <Eye className="w-6 h-6" />,
    color: 'bg-purple-100 text-purple-600',
    href: '/dashboard/analytics'
  },
  {
    title: 'Activity',
    value: recentActivity.length,
    subtitle: 'Recent actions',
    icon: <Activity className="w-6 h-6" />,
    color: 'bg-orange-100 text-orange-600',
    href: undefined  // No dedicated activity page; could link to items or remain non-clickable
  }
];
```

### Task 3.3.2: Import Link Component

**Location:** `src/components/UserDashboard.tsx` line 4

**Current:**
```tsx
import { useRouter } from 'next/navigation';
```

**Add:**
```tsx
import Link from 'next/link';
```

### Task 3.3.3: Update Card Rendering to Use Link Component

**Location:** `src/components/UserDashboard.tsx` lines 248-268

**Updated Code:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  {statsCards.map((card, index) => {
    const CardWrapper = card.href ? Link : 'div';
    const wrapperProps = card.href
      ? { href: card.href }
      : {};

    return (
      <CardWrapper
        key={index}
        {...wrapperProps}
        className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 block transition-all ${
          card.href
            ? 'hover:shadow-md hover:border-blue-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            : ''
        }`}
      >
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
      </CardWrapper>
    );
  })}
</div>
```

**Alternative Implementation (Simpler Approach):**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  {statsCards.map((card, index) => {
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

    const baseClasses = "bg-white rounded-lg shadow-sm border border-gray-200 p-6 block";
    const interactiveClasses = "hover:shadow-md hover:border-blue-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all";

    if (card.href) {
      return (
        <Link
          key={index}
          href={card.href}
          className={`${baseClasses} ${interactiveClasses}`}
        >
          {cardContent}
        </Link>
      );
    }

    return (
      <div key={index} className={baseClasses}>
        {cardContent}
      </div>
    );
  })}
</div>
```

---

## Authorized Files and Functions for Modification

| File | Location | Function/Section | Change Type |
|------|----------|------------------|-------------|
| `src/components/UserDashboard.tsx` | Line 4 | Imports | Add Link import from next/link |
| `src/components/UserDashboard.tsx` | Lines 151-181 | `statsCards` array | Add `href` property to each card object |
| `src/components/UserDashboard.tsx` | Lines 248-268 | Stats Cards rendering section | Replace `<div>` with conditional Link/div wrapper |

---

## Dependencies

### Depends On (upstream)
- **None** - This task is independent and does not require other tasks to complete first

### Blocks (downstream)
- **Task 3.4 (Add Visual Feedback for Clickable Cards)** - This task establishes the clickable card pattern; Task 3.4 may add additional styling refinements
- **REQ-193 (Visual Feedback Enhancement)** - If implemented, depends on clickable structure being in place

### Parallel Safety
- **Files touched:** `src/components/UserDashboard.tsx` only
- **Conflicts with:** None - UserDashboard.tsx is only modified by this task in Phase 3
- **Safe to parallelize with:**
  - Task 3.1 (KPIDashboardOverview Cards) - modifies different file
  - Task 3.2 (Wire Up Navigation Links in KPIDashboard) - modifies different file
  - All Phase 4 tasks (Navigation Menu) - modifies different files
  - All Phase 0/1/2 tasks - modifies different files

---

## Route Mapping

| Card Title | Navigation Route | Route Exists |
|------------|------------------|--------------|
| Properties | `/dashboard/properties` | Yes |
| Items | `/dashboard/items` | Yes |
| Total Views | `/dashboard/analytics` | Yes (admin only) |
| Activity | None or `/dashboard/items` | N/A |

**Note on Activity Card:** The "Activity" card shows recent actions count. Options:
1. Leave non-clickable (no dedicated activity page)
2. Link to `/dashboard/items` as a reasonable default
3. Create a future activity feed page

**Recommendation:** Leave Activity card non-clickable initially (href: undefined), as there is no dedicated activity listing page. This can be enhanced later when such a page exists.

---

## Visual Feedback Requirements

Per REQ-193 (related enhancement), clickable cards should include:

| State | Visual Change |
|-------|---------------|
| Hover | Shadow increase (`shadow-sm` → `shadow-md`), border color change to `border-blue-300` |
| Focus | Ring indicator (`ring-2 ring-blue-500 ring-offset-2`) |
| Active | Optional slight scale reduction (not required for MVP) |
| Default | Pointer cursor when href is present |

---

## Accessibility Considerations

1. **Keyboard Navigation:** Link elements are keyboard-accessible by default
2. **Focus Indicators:** Focus ring classes provide visible focus state
3. **Screen Readers:** Link component provides semantic navigation element
4. **Touch Targets:** Full card area is clickable, providing large touch target (meets 44px minimum)

---

## Testing Criteria

- [ ] Properties card navigates to `/dashboard/properties`
- [ ] Items card navigates to `/dashboard/items`
- [ ] Total Views card navigates to `/dashboard/analytics`
- [ ] Activity card is non-clickable (no navigation) or links appropriately
- [ ] Hover state shows increased shadow and blue border
- [ ] Focus state shows visible ring indicator
- [ ] Cards work correctly in loading state (no navigation during loading)
- [ ] Mobile touch interaction works as expected
- [ ] Keyboard tab navigation cycles through clickable cards
- [ ] Screen reader announces cards as links

---

## Implementation Notes

1. **Preserve Existing Pattern:** The property cards section (lines 349-381) already uses `<a>` tags with href for clickable property summaries. Follow this established pattern.

2. **Loading State:** Ensure loading state (`loading ? '...' : card.value`) continues to work when cards are wrapped in Link components.

3. **TypeScript Type Safety:** If using TypeScript strictly, define card interface:
   ```tsx
   interface StatsCard {
     title: string;
     value: number;
     subtitle: string;
     icon: React.ReactNode;
     color: string;
     href?: string;
   }
   ```

4. **Consistent with Quick Actions:** The existing Quick Actions section (lines 276-294) already uses `<a>` tags for navigation. Stats cards should follow similar pattern.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking card layout on click | Low | Medium | Test all viewport sizes; ensure Link component respects block display |
| Analytics route access for non-admin | Low | Low | Route should handle permission check; card click is just navigation |
| Loading state interaction | Low | Low | Verify cards remain stable during loading transitions |

---

## Effort Estimate

**Size:** S (Small)
**Estimated Effort:** 30-45 minutes

- Add href to statsCards: 5 min
- Import Link component: 1 min
- Update card rendering logic: 15 min
- Add hover/focus styles: 10 min
- Testing: 10-15 min

---

## References

- Implementation Plan: `docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md` (Phase 3, Task 3.3)
- Request Documentation: `docs/gen_requests.md` (REQ-192)
- Related Task: Task 3.1 - Update KPIDashboardOverview Cards
- Related Task: Task 3.4 - Add Visual Feedback for Clickable Cards
- Related Request: REQ-193 - Add Visual Feedback for Clickable Dashboard Cards
