# REQ-205: Update Navigation Menu Configuration in Dashboard Layout - Overview

**Document Created:** 2026-01-12 23:45:00 UTC
**Last Modified:** 2026-01-12 23:45:00 UTC
**Request Reference:** docs/gen_requests.md - REQ-205
**Implementation Plan:** docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md
**Phase:** 4 - Update Navigation Menu (ITEM-04) - MEDIUM Priority
**Task ID:** 4.1

---

## Summary

Update the `navigationItems` configuration array in the dashboard2 layout to provide a complete, well-organized navigation structure for the application. The current navigation has three items (Home, My Items, My Properties) and needs to be updated to include four items with proper naming, icons, and mobile label support: Dashboard, Items, Instructions, and Properties.

---

## Current Behavior

The dashboard2 layout (`src/app/dashboard2/layout.tsx`) contains a `navigationItems` configuration at lines 28-32:

```typescript
const navigationItems = [
  { name: 'Home', href: '/dashboard2', icon: Home },
  { name: 'My Items', href: '/dashboard2/items', icon: Package },
  { name: 'My Properties', href: '/dashboard2/properties', icon: Building2 },
];
```

**Issues with current configuration:**
1. Uses `Home` icon instead of `LayoutDashboard` for dashboard
2. Missing "Instructions" navigation item entirely
3. Labels use "Home" and "My Items" instead of cleaner "Dashboard" and "Items"
4. No mobile label support (e.g., abbreviated labels for smaller screens)
5. Only 3 navigation items when PRD requires 4

---

## Expected Behavior

The `navigationItems` configuration should be updated to:

```typescript
import { LayoutDashboard, Package, FileText, Building2 } from 'lucide-react';

const navigationItems = [
  {
    name: 'Dashboard',
    mobileLabel: 'D/B',
    href: '/dashboard2',
    icon: LayoutDashboard  // Changed from Home
  },
  {
    name: 'Items',
    mobileLabel: 'Items',
    href: '/dashboard2/items',
    icon: Package
  },
  {
    name: 'Instructions',
    mobileLabel: 'Instr.',
    href: '/dashboard2/instructions',  // NEW route
    icon: FileText
  },
  {
    name: 'Properties',
    mobileLabel: 'Prop.',
    href: '/dashboard2/properties',
    icon: Building2
  },
];
```

Key changes:
1. **Dashboard icon**: Change from `Home` to `LayoutDashboard` for clearer dashboard semantics
2. **Dashboard label**: Change from "Home" to "Dashboard"
3. **Items label**: Change from "My Items" to "Items"
4. **Instructions item**: NEW - Add navigation to `/dashboard2/instructions`
5. **Properties label**: Change from "My Properties" to "Properties"
6. **Mobile labels**: Add `mobileLabel` property for responsive display

---

## Technical Analysis

### Current Navigation Rendering (lines 120-140)

```typescript
{navigationItems.map((item) => {
  const isActive =
    pathname === item.href ||
    (item.href !== '/dashboard2' && pathname.startsWith(item.href));
  const Icon = item.icon;
  return (
    <button
      key={item.name}
      onClick={() => router.push(item.href)}
      aria-current={isActive ? 'page' : undefined}
      className={`inline-flex items-center px-3 sm:px-1 pt-4 pb-4 border-b-2 text-sm font-medium transition-colors ...`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {item.name}  {/* Currently displays full name only */}
    </button>
  );
})}
```

### Required Changes

1. **Update imports** (line 17): Add `LayoutDashboard` and `FileText` icons
2. **Update navigationItems type**: Add optional `mobileLabel` property
3. **Update rendering**: Support responsive label display
4. **Instructions route**: Requires new page at `/dashboard2/instructions/page.tsx`

### Existing Pattern Reference

The `RoleBasedNavigation.tsx` component already implements the `mobileName` pattern:

```typescript
export interface NavigationItem {
  name: string;
  /** Shorter label for mobile viewports. Falls back to name if not specified. */
  mobileName?: string;
  href: string;
  icon: React.ReactNode;
  // ...
}
```

The dashboard2 layout should follow this same pattern for consistency.

---

## Dependencies

### Depends On (upstream)

- **None for configuration update** - The navigationItems configuration can be updated independently.
- **Instructions route (Task 4.3)** - The Instructions navigation item requires a target page at `/dashboard2/instructions/page.tsx`. However, the navigation configuration can be added first; clicking the link will simply show a 404 until the page is created.

### Blocks (downstream)

- **Task 4.2 (REQ-206)**: Add Mobile Label Display Logic - This task adds the CSS/rendering logic to actually display the `mobileLabel` values. It depends on this task defining the `mobileLabel` property in the configuration.
- **Task 4.3**: Create Instructions page - The route must exist for the navigation link to function properly.

### Parallel Safety

- **Files touched:**
  - `src/app/dashboard2/layout.tsx` - Primary modification

- **Conflicts with:**
  - No other Phase 4 tasks directly modify `layout.tsx` navigationItems array
  - Task 4.2 modifies the same file but different section (rendering logic, not config)

- **Safe to parallelize with:**
  - Phase 1 (ITEM-05): Workflow step count fix - modifies `constants.ts`, `WorkflowHeader.tsx`, `useWorkflowState.ts`
  - Phase 2 (ITEM-03): What's Next screen - modifies `NextActionStep.tsx`
  - Phase 3 (ITEM-01): Dashboard cards clickable - modifies `StatisticsCards.tsx`
  - Phase 5 (ITEM-02): Data model separation - modifies type definitions and display labels

---

## Authorized Files and Functions for Modification

### Primary Files

| File | Line Range | Functions/Elements | Modification Type |
|------|------------|-------------------|-------------------|
| `src/app/dashboard2/layout.tsx` | 17 | Import statements | Add `LayoutDashboard`, `FileText` from lucide-react |
| `src/app/dashboard2/layout.tsx` | 28-32 | `navigationItems` constant | Update configuration array |
| `src/app/dashboard2/layout.tsx` | 120-140 | Navigation rendering | (Phase 4.2) Support mobileLabel display |

### New Files to Create (Task 4.3)

| File | Purpose |
|------|---------|
| `src/app/dashboard2/instructions/page.tsx` | Instructions page placeholder |

---

## Implementation Tasks

### Task 1: Update Icon Imports

**File:** `src/app/dashboard2/layout.tsx` (line 17)

**Current:**
```typescript
import { Package, LogOut, Home, Loader2, Building2 } from 'lucide-react';
```

**Target:**
```typescript
import { Package, LogOut, Loader2, Building2, LayoutDashboard, FileText } from 'lucide-react';
```

Note: Remove unused `Home` import.

### Task 2: Define Navigation Item Type

Add type definition for navigation items to support mobile labels:

```typescript
interface NavItem {
  name: string;
  mobileLabel?: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}
```

### Task 3: Update navigationItems Configuration

**File:** `src/app/dashboard2/layout.tsx` (lines 28-32)

**Target:**
```typescript
// Navigation items for the dashboard
// REQ-205: Updated navigation structure per FAQBNB Review ITEM-04
const navigationItems: NavItem[] = [
  {
    name: 'Dashboard',
    mobileLabel: 'D/B',
    href: '/dashboard2',
    icon: LayoutDashboard
  },
  {
    name: 'Items',
    mobileLabel: 'Items',
    href: '/dashboard2/items',
    icon: Package
  },
  {
    name: 'Instructions',
    mobileLabel: 'Instr.',
    href: '/dashboard2/instructions',
    icon: FileText
  },
  {
    name: 'Properties',
    mobileLabel: 'Prop.',
    href: '/dashboard2/properties',
    icon: Building2
  },
];
```

### Task 4: Update isActive Logic (if needed)

The current isActive check should work for the new Instructions route:

```typescript
const isActive =
  pathname === item.href ||
  (item.href !== '/dashboard2' && pathname.startsWith(item.href));
```

Verify that `/dashboard2/instructions` correctly activates when on that route.

---

## Acceptance Criteria

Based on REQ-205 from gen_requests.md:

- [ ] Navigation configuration includes all four primary navigation items (Dashboard, Items, Instructions, Properties)
- [ ] Each navigation item has an appropriate label that clearly indicates its purpose
- [ ] Navigation items are organized in logical order (Dashboard → Items → Instructions → Properties)
- [ ] All navigation paths route correctly to their intended destinations
- [ ] Icons are properly associated with each navigation item:
  - Dashboard: `LayoutDashboard`
  - Items: `Package`
  - Instructions: `FileText`
  - Properties: `Building2`
- [ ] Mobile label property (`mobileLabel`) is defined for each navigation item
- [ ] Existing navigation functionality (active state highlighting, routing) continues to work

---

## Testing Plan

### Manual Testing

1. **Verify navigation rendering:**
   - Navigate to `/dashboard2` and confirm all 4 navigation items are visible
   - Verify correct icons display for each item
   - Verify correct labels display for each item

2. **Verify navigation functionality:**
   - Click Dashboard → navigates to `/dashboard2`
   - Click Items → navigates to `/dashboard2/items`
   - Click Instructions → navigates to `/dashboard2/instructions`
   - Click Properties → navigates to `/dashboard2/properties`

3. **Verify active state highlighting:**
   - On `/dashboard2` → Dashboard tab is highlighted
   - On `/dashboard2/items` → Items tab is highlighted
   - On `/dashboard2/instructions` → Instructions tab is highlighted
   - On `/dashboard2/properties` → Properties tab is highlighted

4. **Verify routing consistency:**
   - Direct URL access to each route works
   - Browser back/forward navigation works correctly
   - Active state updates correctly during navigation

### Automated Testing

Consider adding/updating tests in:
- `src/app/dashboard2/__tests__/layout.test.tsx` (if exists)

---

## Complexity Assessment

**Size:** S (Small)
**Estimated Effort:** 30 minutes - 1 hour
**Confidence:** High

This is a straightforward configuration update with:
- No new components required (configuration only)
- No business logic changes
- No API changes
- No database changes
- Uses existing icon library (lucide-react)
- Follows established patterns from `RoleBasedNavigation.tsx`

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Instructions route 404 | High | Low | Create placeholder page (Task 4.3) before or in parallel |
| TypeScript type error | Low | Low | Define NavItem interface with optional mobileLabel |
| Icon not exported from lucide-react | Very Low | Low | Verify icon names exist in lucide-react |
| Active state not working for Instructions | Low | Medium | Test isActive logic with new route |

---

## References

- **Source Request:** `docs/gen_requests.md` - REQ-205
- **Implementation Plan:** `docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md` (Phase 4, Task 4.1)
- **Related Requests:**
  - REQ-206: Add Mobile Label Display Logic to Navigation Menu
  - REQ-195: Create Instructions page placeholder
- **Pattern Reference:** `src/components/RoleBasedNavigation.tsx` (NavigationItem interface with mobileName)
- **Target File:** `src/app/dashboard2/layout.tsx`
- **Existing Instructions Page:** `src/app/dashboard/instructions/page.tsx` (reference implementation for dashboard2 version)
