# REQ-203: Update StatisticsCards Component for Click Navigation - Overview

**Date**: 2026-01-12 19:30:00 UTC
**Last Modified**: 2026-01-12 19:30:00 UTC
**Request ID**: REQ-203
**Type**: ENHANCEMENT
**Size**: M
**Phase**: 3 - Make Dashboard Cards Clickable (ITEM-01)
**Task ID**: 3.1
**Priority**: HIGH

---

## Summary

Transform the StatisticsCards component from static informational displays into interactive navigation elements that direct users to relevant sections of the application when clicked.

---

## Technical Context

### Existing Implementation

**Current File**: `src/components/SimpleDashboard/StatisticsCards.tsx`

The StatisticsCards component currently:
- Displays three metrics: Items, Rooms, and Tags counts
- Uses a `StatCard` sub-component for individual cards
- Cards render as static `<div>` elements with `role="group"`
- Has loading skeleton state and empty state handling
- Uses Airbnb DLS styling (colors: `#FF385C`, `#00A699`, `#484848`)

**Current StatCard structure** (lines 75-100):
```typescript
function StatCard({ config, value }: StatCardProps) {
  return (
    <div
      className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4"
      role="group"
      aria-label={`${config.label}: ${value}`}
    >
      {/* Icon, Value, Label */}
    </div>
  );
}
```

### Established Patterns in Codebase

The codebase has two existing patterns for clickable cards:

1. **KPIDashboardOverview.tsx** (lines 25-106): KPICard component that conditionally renders as:
   - `<Link>` when `href` prop is provided
   - `<button>` when `onClick` prop is provided
   - `<div>` when neither (non-interactive)

2. **UserDashboard.tsx** (lines 167-186): Stats cards with `href` property navigating to `/dashboard/items` and `/dashboard/properties`

**Common interactive styles pattern**:
```typescript
hover:shadow-md hover:border-[color] cursor-pointer transition-all
active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[color] focus:ring-offset-2
```

---

## Implementation Approach

### Changes Required

#### 1. Add `href` property to StatCardConfig interface

**File**: `src/components/SimpleDashboard/StatisticsCards.tsx` (lines 48-59)

```typescript
interface StatCardConfig {
  key: NumericStatKey;
  label: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  href: string;  // NEW: Navigation target URL
}
```

#### 2. Update cardConfigs array with navigation targets

**File**: `src/components/SimpleDashboard/StatisticsCards.tsx` (lines 162-184)

```typescript
const cardConfigs: StatCardConfig[] = [
  {
    key: 'itemCount',
    label: 'Items',
    icon: Package,
    iconColor: 'text-[#FF385C]',
    iconBgColor: 'bg-[#FFEEEF]',
    href: '/dashboard2/items'  // Items list
  },
  {
    key: 'roomCount',
    label: 'Rooms',
    icon: Home,
    iconColor: 'text-[#00A699]',
    iconBgColor: 'bg-[#E6F7F6]',
    href: '/dashboard2/items?filter=room'  // Items filtered by room (placeholder)
  },
  {
    key: 'tagCount',
    label: 'Tags',
    icon: Tag,
    iconColor: 'text-[#484848]',
    iconBgColor: 'bg-gray-100',
    href: '/dashboard2/items?filter=tags'  // Items filtered by tags (placeholder)
  }
];
```

> **Note**: Rooms and Tags routes don't exist yet. Per Plan-109, placeholder routes may be created in separate task (Task 3.2: REQ-204). For now, these can link to items page with query params.

#### 3. Transform StatCard from `<div>` to `<Link>`

**File**: `src/components/SimpleDashboard/StatisticsCards.tsx` (lines 64-100)

```typescript
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface StatCardProps {
  config: StatCardConfig;
  value: number;
}

function StatCard({ config, value }: StatCardProps) {
  const Icon = config.icon;

  return (
    <Link
      href={config.href}
      className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4
                 hover:shadow-md hover:bg-gray-50 transition-all cursor-pointer
                 focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2
                 active:scale-[0.98]"
      aria-label={`View ${config.label}: ${value}`}
    >
      {/* Icon Container */}
      <div className={`p-3 rounded-xl ${config.iconBgColor}`}>
        <Icon className={`w-6 h-6 ${config.iconColor}`} aria-hidden="true" />
      </div>

      {/* Value and Label */}
      <div className="flex-1">
        <p className="text-[32px] font-bold text-[#222222] leading-tight">
          {value}
        </p>
        <p className="text-sm text-[#717171]">
          {config.label}
        </p>
      </div>

      {/* Chevron indicator for clickability */}
      <ChevronRight className="w-5 h-5 text-gray-400" aria-hidden="true" />
    </Link>
  );
}
```

#### 4. Update imports

Add at top of file:
```typescript
import Link from 'next/link';
import { Package, Home, Tag, LucideIcon, ChevronRight } from 'lucide-react';
```

---

## Authorized Files and Functions for Modification

### Primary File

| File | Lines | Function/Component | Change Type |
|------|-------|-------------------|-------------|
| `src/components/SimpleDashboard/StatisticsCards.tsx` | 1-248 | Full file | Modify |

### Specific Modifications

| Location | Current | Change |
|----------|---------|--------|
| Line 12 | `import { Package, Home, Tag, LucideIcon } from 'lucide-react';` | Add `ChevronRight` |
| Line 12 (after) | N/A | Add `import Link from 'next/link';` |
| Lines 48-59 | `StatCardConfig` interface | Add `href: string` property |
| Lines 64-69 | `StatCardProps` interface | No change needed |
| Lines 75-100 | `StatCard` function | Replace `<div>` with `<Link>`, add styling, add chevron |
| Lines 162-184 | `cardConfigs` array | Add `href` to each config object |

### Test Files to Update

| File | Reason |
|------|--------|
| `src/components/SimpleDashboard/__tests__/StatisticsCards.test.tsx` | Add tests for navigation clicks |

> **Note**: This test file doesn't exist yet - may need to be created or navigation tests added to existing integration tests.

---

## Dependencies

### Depends On (upstream)

- **None** - This task is independent and can be started immediately

### Blocks (downstream)

- **Task 3.2 (REQ-204)**: Create placeholder routes for Rooms and Tags
  - Reason: Click targets for Rooms/Tags cards need valid routes. If routes don't exist, cards can temporarily link to `/dashboard2/items` with query params.

### Parallel Safety

- **Files touched**: `src/components/SimpleDashboard/StatisticsCards.tsx`
- **Conflicts with**: None - no other Phase 3 tasks modify this file
- **Safe to parallelize with**:
  - Phase 1 tasks (ITEM-05): Different component tree (`ItemCreationWorkflow`)
  - Phase 2 tasks (ITEM-03): Different component (`NextActionStep`)
  - Phase 4 tasks (ITEM-04): Different file (`layout.tsx`)
  - Task 3.2 (REQ-204): Creates new route files, no overlap

---

## Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Link component adds layout shift | Low | Low | Use `block` class on Link |
| Touch targets too small on mobile | Low | Medium | Cards already have `p-6` padding (adequate) |
| Rooms/Tags routes don't exist | High | Medium | Link to items page with query params initially |
| Screen reader announces poorly | Low | Medium | Add proper `aria-label` with current value |

---

## Testing Requirements

### Unit Tests

1. **Navigation behavior**
   - Click on Items card triggers navigation to `/dashboard2/items`
   - Click on Rooms card triggers navigation to expected route
   - Click on Tags card triggers navigation to expected route

2. **Accessibility**
   - Cards are keyboard focusable
   - Enter key activates navigation
   - Screen reader announces card purpose and value

3. **Visual states**
   - Hover state applies correct styling
   - Focus state shows ring indicator
   - Active state scales card down

### Manual Testing

1. Click each card and verify correct navigation
2. Test keyboard navigation (Tab, Enter, Space)
3. Verify hover/focus states match design system
4. Test on mobile touch devices

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|--------------------|----------------|
| All cards become clickable | Replace `<div>` with `<Link>` |
| Each card navigates correctly | Add `href` to config, verify routes |
| Hover states indicate interactivity | `hover:shadow-md hover:bg-gray-50` |
| Keyboard navigation works | Native `<Link>` behavior |
| Screen readers announce properly | `aria-label` with value |
| Click area encompasses entire card | Link wraps full card content |
| Browser back works correctly | Native Next.js Link behavior |
| Visually consistent with design | Preserve existing styling, add chevron |
| Tests verify navigation | Create navigation unit tests |

---

## Implementation Order

1. Add import for `Link` from `next/link`
2. Add import for `ChevronRight` from `lucide-react`
3. Add `href` property to `StatCardConfig` interface
4. Update `cardConfigs` array with navigation URLs
5. Transform `StatCard` component to use `<Link>`
6. Add interactive styling (hover, focus, active states)
7. Add chevron icon for visual affordance
8. Update `aria-label` for accessibility
9. Write unit tests for navigation behavior

---

## Related Documents

- **Implementation Plan**: `docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md`
- **Request Document**: `docs/gen_requests.md` (REQ-203)
- **Related Request**: REQ-204 (Placeholder routes for Rooms/Tags)
- **Pattern Reference**: `src/components/KPIDashboardOverview.tsx` (KPICard pattern)
