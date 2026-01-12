# REQ-195: Update Dashboard Layout Navigation to Align with RoleBasedNavigation

**Document Created:** 2026-01-12 00:05:00
**Last Modified:** 2026-01-12 00:05:00
**Type:** ENHANCEMENT - Overview Document
**Size:** S (Small)
**Phase:** 4 - REQ-4 - Update Navigation Menu
**Task ID:** 4.3

---

## Summary

Update the Dashboard Layout Navigation component (`src/app/dashboard/layout.tsx`) to align with the RoleBasedNavigation changes, add an Instructions menu item, and update mobile labels for improved mobile user experience. This ensures consistency across the application's navigation systems.

---

## Context from Implementation Plan

**Source:** Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md

This task is part of **Phase 4: REQ-4 - Update Navigation Menu** which includes:
- Task 4.1: Update Navigation Items Configuration (REQ-193)
- Task 4.2: Add Mobile Label Support (REQ-194)
- **Task 4.3: Update Dashboard Layout Navigation (REQ-195)** ← This document
- Task 4.4: Create Instructions Page Placeholder

The navigation menu restructuring includes:
- Dashboard (D/B on mobile) - grid/dashboard icon (LayoutDashboard)
- Items - box/cube icon (Package)
- Instructions (NEW) - document/list icon (FileText)
- Properties (Prop. on mobile) - house/building icon (Home)

---

## Current State Analysis

### Dashboard Layout Navigation (src/app/dashboard/layout.tsx)

**Navigation Items Definition (lines 93-112):**
```typescript
const getNavigationItems = () => {
  const baseItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Items', href: '/dashboard/items', icon: <Package className="h-5 w-5" /> },
  ];

  if (isAdmin) {
    return [
      ...baseItems,
      { name: 'Properties', href: '/dashboard/properties', icon: <Home className="h-5 w-5" /> },
      { name: 'Analytics', href: '/dashboard/analytics', icon: <BarChart3 className="h-5 w-5" /> },
    ];
  } else {
    return [
      ...baseItems,
      { name: 'My Properties', href: '/dashboard/properties', icon: <Home className="h-5 w-5" /> },
    ];
  }
};
```

**Issues Identified:**

1. **Missing Instructions Menu Item:** No Instructions navigation item exists
2. **No Mobile Label Support:** All navigation items use a single `name` property regardless of viewport
3. **"My Properties" Label:** Non-admin users see "My Properties" instead of "Properties" - inconsistent with RoleBasedNavigation
4. **Missing FileText Icon Import:** The `FileText` icon needed for Instructions is not imported
5. **Simple Navigation Structure:** Uses a basic object structure without the enhanced NavigationItem interface properties (mobileName, description, dashboardSection, etc.)

### Navigation Rendering (lines 231-249)

```typescript
<nav className="flex space-x-8" aria-label="Dashboard Navigation">
  {navigationItems.map((item) => {
    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
    return (
      <button
        key={item.name}
        onClick={() => router.push(item.href)}
        className={`inline-flex items-center px-1 pt-4 pb-4 border-b-2 text-sm font-medium transition-colors ${
          isActive
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
      >
        <span className="mr-2">{item.icon}</span>
        {item.name}
      </button>
    );
  })}
</nav>
```

**Rendering Issues:**

1. Uses `item.name` directly without mobile viewport awareness
2. Navigation is hidden on mobile via `print:hidden` but doesn't show mobile-optimized labels
3. No responsive label switching mechanism

---

## Required Changes

### 1. Add FileText Icon Import

**File:** `src/app/dashboard/layout.tsx`
**Location:** Line 5

```typescript
// Current:
import { LayoutDashboard, Package, Home, BarChart3 } from 'lucide-react';

// Updated:
import { LayoutDashboard, Package, Home, BarChart3, FileText } from 'lucide-react';
```

### 2. Update Navigation Item Interface

Add local type definition to support mobile labels:

```typescript
interface NavigationItemLocal {
  name: string;
  mobileName?: string;
  href: string;
  icon: React.ReactNode;
}
```

### 3. Update getNavigationItems Function

**File:** `src/app/dashboard/layout.tsx`
**Location:** Lines 93-112

```typescript
const getNavigationItems = (): NavigationItemLocal[] => {
  const baseItems: NavigationItemLocal[] = [
    {
      name: 'Dashboard',
      mobileName: 'D/B',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      name: 'Items',
      mobileName: 'Items',
      href: '/dashboard/items',
      icon: <Package className="h-5 w-5" />
    },
    {
      name: 'Instructions',
      mobileName: 'Instr.',
      href: '/dashboard/instructions',
      icon: <FileText className="h-5 w-5" />
    },
  ];

  if (isAdmin) {
    return [
      ...baseItems,
      {
        name: 'Properties',
        mobileName: 'Prop.',
        href: '/dashboard/properties',
        icon: <Home className="h-5 w-5" />
      },
      {
        name: 'Analytics',
        mobileName: 'Stats',
        href: '/dashboard/analytics',
        icon: <BarChart3 className="h-5 w-5" />
      },
    ];
  } else {
    return [
      ...baseItems,
      {
        name: 'Properties',  // Changed from "My Properties"
        mobileName: 'Prop.',
        href: '/dashboard/properties',
        icon: <Home className="h-5 w-5" />
      },
    ];
  }
};
```

### 4. Update Navigation Rendering for Mobile Labels

**File:** `src/app/dashboard/layout.tsx`
**Location:** Lines 231-249

Add responsive label display using Tailwind breakpoints:

```typescript
<nav className="flex space-x-8" aria-label="Dashboard Navigation">
  {navigationItems.map((item) => {
    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
    return (
      <button
        key={item.name}
        onClick={() => router.push(item.href)}
        className={`inline-flex items-center px-1 pt-4 pb-4 border-b-2 text-sm font-medium transition-colors ${
          isActive
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
      >
        <span className="mr-2">{item.icon}</span>
        {/* Mobile label */}
        <span className="md:hidden">{item.mobileName || item.name}</span>
        {/* Desktop label */}
        <span className="hidden md:inline">{item.name}</span>
      </button>
    );
  })}
</nav>
```

---

## Dependencies

### Depends On (upstream)

- **Task 4.1 (REQ-193):** Update Navigation Items Configuration in RoleBasedNavigation.tsx - Establishes the pattern for navigation items with Instructions menu item. While dashboard layout has its own navigation definition, it should align with the patterns established in REQ-193.
- **Task 4.2 (REQ-194):** Add Mobile Label Support - Defines the `mobileName` pattern in the NavigationItem interface. Dashboard layout should adopt the same mobile label values for consistency.

### Blocks (downstream)

- None - This is one of the final sub-tasks of Phase 4 (REQ-4 - Update Navigation Menu)

### Parallel Safety

- **Files touched:**
  - `src/app/dashboard/layout.tsx` - getNavigationItems function, navigation rendering

- **Conflicts with:**
  - None in Phase 4 (other tasks modify different files)
  - If running concurrent with other Phase 4 tasks, no file conflicts occur

- **Safe to parallelize with:**
  - Phase 0 tasks (REQ-2): Different files - MetadataStep.tsx, ReviewStep.tsx
  - Phase 1 tasks (REQ-5): Different files - ProgressIndicator.tsx
  - Phase 2 tasks (REQ-3): Different files - WhatsNextStep.tsx, ItemCapture.tsx
  - Phase 3 tasks (REQ-1): Different files - KPIDashboardOverview.tsx, UserDashboard.tsx
  - Task 4.1 (REQ-193): Different file - RoleBasedNavigation.tsx
  - Task 4.2 (REQ-194): Different file - RoleBasedNavigation.tsx
  - Task 4.4: Different file - creates new page at dashboard/instructions/page.tsx

**Recommendation:** This task can run in parallel with all other tasks since it modifies only `src/app/dashboard/layout.tsx`, which no other task touches.

---

## Authorized Files and Functions for Modification

### Primary File

| File | Lines | Function/Section | Modification |
|------|-------|------------------|--------------|
| `src/app/dashboard/layout.tsx` | 5 | Import statement | Add `FileText` icon import |
| `src/app/dashboard/layout.tsx` | 93-112 | `getNavigationItems()` function | Add Instructions item, add mobileName properties, change "My Properties" to "Properties" |
| `src/app/dashboard/layout.tsx` | 231-249 | Navigation rendering in JSX | Add responsive label display with md:hidden/hidden md:inline spans |

### Optional: Add Local Type Definition

| File | Lines | Section | Modification |
|------|-------|---------|--------------|
| `src/app/dashboard/layout.tsx` | After line 17 | Type definitions | Add NavigationItemLocal interface with mobileName property |

### No New Files Required

This task modifies existing code only - no new files are created.

---

## Implementation Steps

### Step 1: Add FileText Icon Import
1. Open `src/app/dashboard/layout.tsx`
2. Locate line 5 with lucide-react imports
3. Add `FileText` to the import list

### Step 2: Add Local Navigation Item Type (Optional)
1. After line 17 (after PropertyContextType interface), add:
   ```typescript
   interface NavigationItemLocal {
     name: string;
     mobileName?: string;
     href: string;
     icon: React.ReactNode;
   }
   ```

### Step 3: Update getNavigationItems Function
1. Locate `getNavigationItems()` function (line 93)
2. Add type annotation `: NavigationItemLocal[]` to return type
3. Add Instructions navigation item to `baseItems` array
4. Add `mobileName` property to all navigation items
5. Change "My Properties" to "Properties" for non-admin users

### Step 4: Update Navigation Rendering
1. Locate the navigation rendering section (line 231-249)
2. Replace `{item.name}` with:
   ```tsx
   <span className="md:hidden">{item.mobileName || item.name}</span>
   <span className="hidden md:inline">{item.name}</span>
   ```

### Step 5: Verify Alignment with RoleBasedNavigation
1. Compare menu item order with RoleBasedNavigation.tsx
2. Ensure icon choices match
3. Confirm mobile label values match REQ-194 specifications

---

## Testing Requirements

### Functional Testing
- [ ] Dashboard navigation displays all expected items (Dashboard, Items, Instructions, Properties, [Analytics for admin])
- [ ] Instructions menu item navigates to `/dashboard/instructions`
- [ ] All other navigation items continue to work correctly
- [ ] Admin users see Analytics menu item
- [ ] Non-admin users do NOT see Analytics menu item

### Mobile Label Testing
- [ ] On viewport < 768px (md breakpoint), mobile labels display:
  - Dashboard → "D/B"
  - Items → "Items"
  - Instructions → "Instr."
  - Properties → "Prop."
  - Analytics → "Stats" (admin only)
- [ ] On viewport >= 768px, full labels display
- [ ] Label transitions smoothly during viewport resize

### Visual Consistency Testing
- [ ] Icon styling matches RoleBasedNavigation
- [ ] Active state styling remains consistent
- [ ] Hover states work correctly
- [ ] Navigation maintains visual alignment with application theme

### Accessibility Testing
- [ ] All navigation items are keyboard accessible
- [ ] Screen readers announce appropriate labels
- [ ] Focus states are visible

---

## Acceptance Criteria (from REQ-195)

- [ ] Dashboard Layout Navigation component aligns with RoleBasedNavigation structure and styling
- [ ] Instructions menu item is added to the navigation
- [ ] Instructions menu item navigates to the appropriate help/instructions page
- [ ] Mobile labels are implemented for navigation items requiring shortened text
- [ ] Mobile labels display on viewports below the defined breakpoint
- [ ] Desktop labels display on larger viewports
- [ ] Navigation icons remain consistent with RoleBasedNavigation
- [ ] Menu item order matches RoleBasedNavigation where applicable
- [ ] All navigation functionality works correctly on both desktop and mobile devices
- [ ] Component passes accessibility requirements for navigation elements

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Instructions page not yet created | High | Medium | Task 4.4 creates placeholder; navigation will work even if page shows placeholder content |
| Mobile labels too short/unclear | Low | Low | Use consistent abbreviations matching REQ-194 (D/B, Instr., Prop.) |
| Breaking existing navigation | Low | High | Test all navigation paths after changes |
| Style inconsistency with RoleBasedNavigation | Low | Medium | Visual comparison testing against RoleBasedNavigation |

---

## Implementation Notes

### Key Differences from RoleBasedNavigation

The dashboard layout navigation (`layout.tsx`) is a **simpler, static navigation** that doesn't use:
- Permission-based visibility (uses `isAdmin` boolean instead)
- DashboardSection tracking
- Navigation history
- Dynamic permission loading

This is intentional - the layout navigation provides a quick, reliable navigation experience while RoleBasedNavigation provides the full-featured, permission-aware navigation for more complex use cases.

### Coordination with Task 4.4

Task 4.4 creates the Instructions page placeholder at `/dashboard/instructions/page.tsx`. This task (4.3) adds the navigation link, so:
- If implemented sequentially: Task 4.4 first, then Task 4.3
- If implemented in parallel: Both tasks can proceed independently; the link will work once the page exists

### Mobile Label Strategy

Using CSS-based label switching (`md:hidden` / `hidden md:inline`) rather than JavaScript media queries because:
1. No layout shift during hydration
2. Works with SSR/SSG
3. Simpler implementation
4. Aligns with Tailwind CSS patterns used throughout the application

---

## References

- **Request:** docs/gen_requests.md - Request #195
- **Implementation Plan:** docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md (Phase 4, Task 4.3)
- **Primary File:** src/app/dashboard/layout.tsx
- **Related Task:** REQ-193 (Task 4.1 - Update Navigation Items Configuration)
- **Related Task:** REQ-194 (Task 4.2 - Add Mobile Label Support)
- **Companion Component:** src/components/RoleBasedNavigation.tsx (for pattern reference)
