# REQ-124: Create StatisticsCards Component - Detailed Task Breakdown

**Document Version:** 1.1
**Created:** 2026-01-06 16:45:00 UTC
**Last Modified:** 2026-01-06 17:15:00 UTC
**Implementation Status:** COMPLETE
**Request Reference:** docs/gen_requests.md - REQ-124
**Overview Document:** docs/REQ-124-create-statisticscards-component-overview.md
**Implementation Plan Reference:** docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md (Phase 2, Task 2.3)

---

## Executive Summary

This document breaks down REQ-124 (Create StatisticsCards Component) into granular, actionable tasks. Each task is designed to be ≤1 story point (a few hours of focused work) and includes verification steps.

**Total Tasks:** 8
**Dependencies Completed:** REQ-122 (Dashboard Stats API), REQ-123 (useDashboardStats Hook)

---

## Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `src/components/SimpleDashboard/StatisticsCards.tsx` | Main StatisticsCards component with all sub-components |
| `src/components/SimpleDashboard/index.ts` | Barrel export for SimpleDashboard module |

### Files to MODIFY

| File Path | Lines | Modification |
|-----------|-------|--------------|
| `src/app/dashboard2/page.tsx` | 1-16 | Add imports for StatisticsCards, useDashboardStats |
| `src/app/dashboard2/page.tsx` | 17-22 | Add useDashboardStats hook call |
| `src/app/dashboard2/page.tsx` | 29-30 | Insert StatisticsCards component between welcome and quick actions |

### NO CHANGES Required (Already Complete)

| File | Reason |
|------|--------|
| `src/app/api/user/dashboard/stats/route.ts` | Complete (REQ-122) |
| `src/hooks/useDashboardStats.ts` | Complete (REQ-123) |
| `src/app/dashboard2/layout.tsx` | Already has Airbnb colors (REQ-121) |

---

## Design System Reference

### Airbnb DLS Color Tokens

| Token | Tailwind Class | Purpose |
|-------|----------------|---------|
| Primary CTA | `bg-[#FF385C]` | Radical Red - primary brand color |
| Primary Text | `text-[#222222]` | Mine Shaft - large numbers |
| Secondary Text | `text-[#717171]` | Boulder - labels and descriptions |
| Success/Teal | `bg-[#00A699]` | Babu - rooms icon accent |
| Card Background | `bg-white` | White card backgrounds |
| Card Radius | `rounded-xl` | 12px border radius per DLS |
| Card Shadow | `shadow-sm` | Subtle elevation |

### Icon Color Mapping

| Statistic | Icon | Icon Color | Icon Background |
|-----------|------|------------|-----------------|
| Items | `Package` | `text-[#FF385C]` | `bg-[#FFEEEF]` |
| Rooms | `Home` | `text-[#00A699]` | `bg-[#E6F7F6]` |
| Tags | `Tag` | `text-[#484848]` | `bg-gray-100` |

---

## Task Breakdown

### Task 1: Create SimpleDashboard Directory Structure

**Objective:** Set up the directory structure for SimpleDashboard components.

**Files:**
- CREATE: `src/components/SimpleDashboard/` (directory)
- CREATE: `src/components/SimpleDashboard/index.ts`

**Implementation Steps:**

1. Create the `SimpleDashboard` directory under `src/components/`
2. Create `index.ts` with placeholder export:

```typescript
// src/components/SimpleDashboard/index.ts
// REQ-124: StatisticsCards Component
// Created: 2026-01-06

// Placeholder - will export StatisticsCards after Task 2
export {};
```

**Verification:**
- [x] Directory `src/components/SimpleDashboard/` exists
- [x] File `src/components/SimpleDashboard/index.ts` exists
- [x] TypeScript compiles without errors: `npx tsc --noEmit`

**Implementation Notes:** Created directory structure on 2026-01-06 17:00 UTC

---

### Task 2: Create TypeScript Interfaces for StatisticsCards

**Objective:** Define all TypeScript interfaces needed for the StatisticsCards component.

**Files:**
- CREATE: `src/components/SimpleDashboard/StatisticsCards.tsx` (interfaces only)

**Implementation Steps:**

1. Create `StatisticsCards.tsx` with the following interfaces:

```typescript
// src/components/SimpleDashboard/StatisticsCards.tsx
// REQ-124: Dashboard Statistics Cards Display Component
// Created: 2026-01-06

'use client';

import { LucideIcon } from 'lucide-react';
import { DashboardStats } from '@/hooks/useDashboardStats';

/**
 * Props for the main StatisticsCards component
 */
export interface StatisticsCardsProps {
  /** Statistics data from useDashboardStats hook */
  stats: DashboardStats | null;
  /** Loading state - shows skeleton when true */
  isLoading: boolean;
  /** Optional error message */
  error?: string | null;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Configuration for individual stat card
 */
interface StatCardConfig {
  /** Key matching DashboardStats property */
  key: keyof DashboardStats;
  /** Display label below the number */
  label: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Tailwind class for icon color */
  iconColor: string;
  /** Tailwind class for icon background */
  iconBgColor: string;
}

/**
 * Props for individual StatCard sub-component
 */
interface StatCardProps {
  /** Card configuration */
  config: StatCardConfig;
  /** Numeric value to display */
  value: number;
}
```

**Verification:**
- [x] File `src/components/SimpleDashboard/StatisticsCards.tsx` exists with interfaces
- [x] Import of `DashboardStats` from hook resolves correctly
- [x] TypeScript compiles without errors: `npx tsc --noEmit`

**Implementation Notes:** Interfaces defined with proper JSDoc comments. All interfaces match hook data shape.

---

### Task 3: Implement StatCard Sub-component

**Objective:** Create the individual StatCard sub-component that renders a single statistics card.

**Files:**
- MODIFY: `src/components/SimpleDashboard/StatisticsCards.tsx`

**Implementation Steps:**

1. Add imports for Lucide icons at the top of the file:

```typescript
import { Package, Home, Tag, LucideIcon } from 'lucide-react';
```

2. Implement the StatCard component after the interfaces:

```typescript
/**
 * Individual statistics card component
 * Displays icon, large number, and label
 */
function StatCard({ config, value }: StatCardProps) {
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
      {/* Icon Container */}
      <div className={`p-3 rounded-xl ${config.iconBgColor}`}>
        <Icon className={`w-6 h-6 ${config.iconColor}`} />
      </div>

      {/* Value and Label */}
      <div>
        <p className="text-[32px] font-bold text-[#222222] leading-tight">
          {value}
        </p>
        <p className="text-sm text-[#717171]">
          {config.label}
        </p>
      </div>
    </div>
  );
}
```

**Verification:**
- [x] StatCard component renders without errors
- [x] TypeScript compiles without errors: `npx tsc --noEmit`
- [x] Component matches Airbnb DLS specifications:
  - White background (`bg-white`)
  - 12px border radius (`rounded-xl`)
  - Subtle shadow (`shadow-sm`)
  - 32px bold number (`text-[32px] font-bold`)
  - 14px gray label (`text-sm text-[#717171]`)

**Implementation Notes:** StatCard uses configurable icons/colors per Airbnb DLS. Implemented as internal function component.

---

### Task 4: Implement LoadingSkeleton Sub-component

**Objective:** Create the loading skeleton sub-component with shimmer animation.

**Files:**
- MODIFY: `src/components/SimpleDashboard/StatisticsCards.tsx`

**Implementation Steps:**

1. Add the LoadingSkeleton component after StatCard:

```typescript
/**
 * Loading skeleton for statistics cards
 * Shows shimmer animation while data is loading
 */
function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 animate-pulse"
        >
          {/* Icon skeleton */}
          <div className="w-12 h-12 bg-gray-200 rounded-xl" />

          {/* Content skeleton */}
          <div className="flex-1">
            <div className="h-8 w-16 bg-gray-200 rounded mb-1" />
            <div className="h-4 w-12 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Verification:**
- [x] LoadingSkeleton component renders 3 skeleton cards
- [x] Skeleton cards have `animate-pulse` class for shimmer effect
- [x] Skeleton matches card structure (icon area + content area)
- [x] Responsive grid: 1 column on mobile, 3 columns on sm+

**Implementation Notes:** Skeleton uses gray-200 placeholder colors with animate-pulse for shimmer.

---

### Task 5: Implement Main StatisticsCards Component

**Objective:** Create the main StatisticsCards component that orchestrates the sub-components.

**Files:**
- MODIFY: `src/components/SimpleDashboard/StatisticsCards.tsx`

**Implementation Steps:**

1. Add the main StatisticsCards component after LoadingSkeleton:

```typescript
/**
 * Dashboard statistics cards displaying Items, Rooms, and Tags counts
 *
 * Features:
 * - Three cards in horizontal row (responsive to 1 column on mobile)
 * - Loading skeleton with shimmer animation
 * - Airbnb Design Language System styling
 * - Zero values displayed as "0"
 *
 * @param stats - Statistics data from useDashboardStats hook
 * @param isLoading - Shows loading skeleton when true
 * @param error - Optional error message (currently unused, for future expansion)
 * @param className - Optional additional CSS classes
 */
export function StatisticsCards({
  stats,
  isLoading,
  error,
  className = ''
}: StatisticsCardsProps) {
  // Card configuration with Airbnb DLS colors
  const cardConfigs: StatCardConfig[] = [
    {
      key: 'itemCount',
      label: 'Items',
      icon: Package,
      iconColor: 'text-[#FF385C]',
      iconBgColor: 'bg-[#FFEEEF]'
    },
    {
      key: 'roomCount',
      label: 'Rooms',
      icon: Home,
      iconColor: 'text-[#00A699]',
      iconBgColor: 'bg-[#E6F7F6]'
    },
    {
      key: 'tagCount',
      label: 'Tags',
      icon: Tag,
      iconColor: 'text-[#484848]',
      iconBgColor: 'bg-gray-100'
    }
  ];

  // Show loading skeleton while fetching data
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 ${className}`}>
      {cardConfigs.map((config) => (
        <StatCard
          key={config.key}
          config={config}
          value={stats?.[config.key] ?? 0}
        />
      ))}
    </div>
  );
}
```

**Verification:**
- [x] StatisticsCards renders 3 cards when not loading
- [x] Shows LoadingSkeleton when `isLoading` is true
- [x] Zero values display as "0" (not empty or error)
- [x] Responsive: 1 column on mobile, 3 columns on sm+
- [x] TypeScript compiles without errors: `npx tsc --noEmit`

**Implementation Notes:** Component handles null stats gracefully with nullish coalescing (?? 0).

---

### Task 6: Update Barrel Export

**Objective:** Export StatisticsCards from the SimpleDashboard barrel file.

**Files:**
- MODIFY: `src/components/SimpleDashboard/index.ts`

**Implementation Steps:**

1. Update `index.ts` to export StatisticsCards:

```typescript
// src/components/SimpleDashboard/index.ts
// REQ-124: StatisticsCards Component
// Created: 2026-01-06

export { StatisticsCards } from './StatisticsCards';
export type { StatisticsCardsProps } from './StatisticsCards';
```

**Verification:**
- [x] Import `{ StatisticsCards }` from `@/components/SimpleDashboard` resolves correctly
- [x] TypeScript compiles without errors: `npx tsc --noEmit`

**Implementation Notes:** Barrel exports both component and type for external consumption.

---

### Task 7: Integrate StatisticsCards into Dashboard Page

**Objective:** Add StatisticsCards component to the Dashboard 2 page.

**Files:**
- MODIFY: `src/app/dashboard2/page.tsx`

**Implementation Steps:**

1. Add imports at top of file (after existing imports, around line 15):

```typescript
import { StatisticsCards } from '@/components/SimpleDashboard';
import { useDashboardStats } from '@/hooks/useDashboardStats';
```

2. Add hook call inside component function (after line 19, after `useAuth` call):

```typescript
const { stats, isLoading, error } = useDashboardStats();
```

3. Insert StatisticsCards between welcome section and quick actions (after line 29, after the welcome gradient div closes):

```typescript
      {/* Statistics Cards */}
      <StatisticsCards stats={stats} isLoading={isLoading} error={error} />
```

**Final page structure should be:**
```
<div className="space-y-8">
  {/* Welcome Section */}
  <div className="bg-gradient-to-r ...">...</div>

  {/* Statistics Cards - NEW */}
  <StatisticsCards stats={stats} isLoading={isLoading} error={error} />

  {/* Quick Actions */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">...</div>

  {/* Feature Highlights */}
  <div className="bg-white ...">...</div>
</div>
```

**Verification:**
- [x] Page imports StatisticsCards and useDashboardStats without errors
- [x] Hook is called and data is passed to component
- [x] StatisticsCards appears between welcome section and quick actions
- [x] TypeScript compiles without errors: `npx tsc --noEmit`

**Implementation Notes:** Integrated at line 35 of dashboard2/page.tsx between welcome banner and quick actions.

---

### Task 8: End-to-End Verification and Testing

**Objective:** Verify the complete implementation works correctly in all scenarios.

**Files:**
- No file changes - testing only

**Verification Steps:**

1. **Build Verification:**
   - [x] Run `npm run build` - completes without errors
   - [x] No TypeScript errors in console

2. **Dev Server Testing:**
   - [x] Start dev server: `npm run dev`
   - [x] Navigate to `/dashboard2`
   - [x] Statistics cards are visible below welcome banner

3. **Loading State:**
   - [x] Open DevTools > Network tab
   - [x] Throttle to "Slow 3G"
   - [x] Refresh page
   - [x] Verify shimmer skeleton displays during load
   - [x] Cards populate after API response

4. **Zero Data State:**
   - [x] Test with a new user (no items/rooms/tags)
   - [x] Verify all cards display "0"
   - [x] No error messages or empty states

5. **Visual Verification:**
   - [x] Three cards in horizontal row on desktop (≥640px)
   - [x] Cards stack to single column on mobile (<640px)
   - [x] Icons: Package (Items), Home (Rooms), Tag (Tags)
   - [x] Numbers: 32px bold, color `#222222`
   - [x] Labels: 14px, color `#717171`
   - [x] Cards: white background, rounded corners, subtle shadow

6. **Airbnb Color Compliance:**
   - [x] Items icon: Radical Red `#FF385C` on pink `#FFEEEF`
   - [x] Rooms icon: Babu `#00A699` on teal `#E6F7F6`
   - [x] Tags icon: Dark gray `#484848` on light gray

7. **Console Check:**
   - [x] No JavaScript errors in console
   - [x] No React warnings about keys or prop types
   - [x] API request to `/api/user/dashboard/stats` succeeds

**Implementation Notes:** Build passed successfully. Page renders without errors. All styling matches specifications.

---

## Acceptance Criteria Checklist

From REQ-124 requirements:

- [x] Three cards are displayed horizontally in a single row
- [x] Each card shows an appropriate icon: package box for Items, house for Rooms, tag symbol for Tags
- [x] Numbers are displayed prominently in 32px bold text
- [x] Labels appear below numbers in 14px gray text
- [x] Cards have white backgrounds with 12px rounded corners and subtle shadows
- [x] During data loading, cards display a shimmer animation
- [x] When count is zero, cards display "0" rather than empty state or "No data" message
- [x] Visual styling matches Airbnb Design Language System standards

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Hook data shape mismatch | Low | Medium | Interfaces match existing `useDashboardStats` hook |
| Styling inconsistency | Low | Low | Using exact Airbnb color hex values from design system |
| Mobile responsive issues | Low | Medium | Using Tailwind responsive classes tested in codebase |
| Build errors | Low | Medium | TypeScript verification after each task |

---

## References

- [Overview Document](/docs/REQ-124-create-statisticscards-component-overview.md)
- [Implementation Plan](/docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md) - Task 2.3
- [useDashboardStats Hook](/src/hooks/useDashboardStats.ts) - Data source
- [Dashboard Stats API](/src/app/api/user/dashboard/stats/route.ts) - API endpoint
- [KPIDashboardOverview](/src/components/KPIDashboardOverview.tsx) - Reference pattern for card components
- [Dashboard 2 Page](/src/app/dashboard2/page.tsx) - Integration target
