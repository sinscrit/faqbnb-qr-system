# REQ-194: Add Mobile Label Support to Navigation Menu

**Document Created:** 2026-01-12
**Last Modified:** 2026-01-12
**Type:** ENHANCEMENT - Overview Document
**Size:** S (Small)
**Phase:** 4 - REQ-4 - Update Navigation Menu
**Task ID:** 4.2

---

## Summary

This document provides the implementation breakdown for adding mobile label support to the navigation menu. Navigation items should display shorter, mobile-optimized labels on small screens while maintaining full labels on desktop viewports.

---

## Context from Implementation Plan

**Source:** Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md

This task is part of **Phase 4: REQ-4 - Update Navigation Menu** which includes:
- Task 4.1: Update Navigation Items Configuration (REQ-193)
- **Task 4.2: Add Mobile Label Support (REQ-194)** ← This document
- Task 4.3: Update Dashboard Layout Navigation (REQ-195)
- Task 4.4: Create Instructions Page Placeholder

The navigation menu restructuring includes:
- Dashboard (D/B on mobile) - grid/dashboard icon
- Items - box/cube icon
- Instructions (NEW) - document/list icon
- Properties (Prop. on mobile) - house/building icon

---

## Current State Analysis

### RoleBasedNavigation.tsx (src/components/RoleBasedNavigation.tsx)

**NavigationItem Interface (lines 11-20):**
```typescript
export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  description?: string;
  requiredPermissions?: PermissionKey[];
  dashboardSection?: DashboardSection;
  adminOnly?: boolean;
  systemAdminOnly?: boolean;
}
```

**Issue:** The interface lacks a `mobileName` property for shorter mobile labels.

**Desktop Navigation (lines 177-206):**
Uses `item.name` directly without viewport awareness.

**Mobile Navigation (lines 209-284):**
Also uses `item.name` directly - same labels as desktop.

**Compact Mode Pattern (lines 64-65, 113):**
Existing pattern uses `compactMode` prop for shorter labels:
```typescript
name: compactMode ? 'Home' : 'Dashboard',
name: compactMode ? 'Admin' : 'System Admin',
```

This pattern is not the same as mobile-responsive labels - it's a prop-based toggle.

### Dashboard Layout (src/app/dashboard/layout.tsx)

**Navigation Items (lines 93-112):**
```typescript
const getNavigationItems = () => {
  const baseItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard /> },
    { name: 'Items', href: '/dashboard/items', icon: <Package /> },
  ];
  // ...
};
```

**Issue:** No mobile label support, uses same labels regardless of viewport.

---

## Required Changes

### 1. Update NavigationItem Interface

**File:** `src/components/RoleBasedNavigation.tsx`
**Location:** Lines 11-20

Add `mobileName` optional property:

```typescript
export interface NavigationItem {
  name: string;
  mobileName?: string;  // NEW: Shorter label for mobile viewports
  href: string;
  icon: React.ReactNode;
  description?: string;
  requiredPermissions?: PermissionKey[];
  dashboardSection?: DashboardSection;
  adminOnly?: boolean;
  systemAdminOnly?: boolean;
}
```

### 2. Update Mobile Navigation Rendering

**File:** `src/components/RoleBasedNavigation.tsx`
**Location:** MobileNavigation component (lines 209-284)

Update label rendering to use `mobileName` when available:

```typescript
// Current (line 265):
<span>{item.name}</span>

// Updated:
<span>{item.mobileName || item.name}</span>
```

### 3. Update Navigation Item Definitions with Mobile Labels

**File:** `src/components/RoleBasedNavigation.tsx`
**Location:** getNavigationItems function (lines 57-124)

Add `mobileName` to each navigation item:

| Item | Desktop Label | Mobile Label |
|------|--------------|--------------|
| Dashboard | Dashboard | D/B |
| Items | Items | Items |
| Instructions | Instructions | Instr. |
| Properties | Properties | Prop. |
| Analytics | Analytics | Stats |
| System Admin | System Admin | Admin |

### 4. Update getNavigationItemsForUser Utility Function

**File:** `src/components/RoleBasedNavigation.tsx`
**Location:** Lines 294-369

Mirror the same mobile label changes in the utility function to maintain consistency.

---

## Dependencies

### Depends On (upstream)
- **Task 4.1 (REQ-193)**: Update Navigation Items Configuration - The navigation item definitions must exist before we can add mobile labels to them. If Task 4.1 adds the Instructions menu item, we need that in place to add its mobile label.

### Blocks (downstream)
- **Task 4.3 (REQ-195)**: Update Dashboard Layout Navigation - This task may adopt the same mobile label pattern. Having the interface defined first allows alignment.

### Parallel Safety
- **Files touched:**
  - `src/components/RoleBasedNavigation.tsx` - NavigationItem interface, navigation item definitions, MobileNavigation rendering

- **Conflicts with:**
  - Task 4.1 (REQ-193): Both modify navigation item definitions in RoleBasedNavigation.tsx
  - Task 4.3 (REQ-195): May modify navigation patterns, but targets dashboard/layout.tsx

- **Safe to parallelize with:**
  - Phase 0, 1, 2 tasks (different files - ItemCapture, MetadataStep, ReviewStep, ProgressIndicator)
  - Phase 3 tasks (different files - KPIDashboardOverview.tsx, UserDashboard.tsx)
  - Task 4.4 (different file - creates new page at dashboard/instructions/page.tsx)

**Recommendation:** Task 4.1 and 4.2 should be executed sequentially (4.1 first, then 4.2), as they both modify the same navigation item definitions in RoleBasedNavigation.tsx.

---

## Authorized Files and Functions for Modification

### Primary File

| File | Lines | Function/Section | Modification |
|------|-------|------------------|--------------|
| `src/components/RoleBasedNavigation.tsx` | 11-20 | `NavigationItem` interface | Add `mobileName?: string` property |
| `src/components/RoleBasedNavigation.tsx` | 57-124 | `getNavigationItems()` | Add `mobileName` to each item definition |
| `src/components/RoleBasedNavigation.tsx` | 261-265 | MobileNavigation label rendering | Use `item.mobileName || item.name` |
| `src/components/RoleBasedNavigation.tsx` | 294-369 | `getNavigationItemsForUser()` | Add `mobileName` to each item definition |

### No New Files Required

This task modifies existing code only - no new files are created.

---

## Implementation Steps

### Step 1: Update NavigationItem Interface
1. Open `src/components/RoleBasedNavigation.tsx`
2. Add `mobileName?: string` to the NavigationItem interface (after line 12)
3. This is a non-breaking change - existing code continues to work

### Step 2: Update getNavigationItems Function
1. In the same file, locate `getNavigationItems()` (line 57)
2. Add `mobileName` property to each navigation item:
   - Dashboard: `mobileName: 'D/B'`
   - Items: `mobileName: 'Items'` (same, but explicit)
   - Properties: `mobileName: 'Prop.'`
   - Analytics: `mobileName: 'Stats'`
   - System Admin: `mobileName: 'Admin'`
3. If Instructions item exists (from Task 4.1), add: `mobileName: 'Instr.'`

### Step 3: Update Mobile Navigation Rendering
1. Locate MobileNavigation component (line 209)
2. Find the label rendering in the button (around line 265)
3. Change `{item.name}` to `{item.mobileName || item.name}`

### Step 4: Update Utility Function
1. Locate `getNavigationItemsForUser()` (line 294)
2. Apply the same `mobileName` additions as Step 2
3. Ensure consistency between both functions

### Step 5: Verify compactMode Compatibility
1. Review existing `compactMode` logic (lines 64-65, 113)
2. Ensure `mobileName` and `compactMode` don't conflict
3. `compactMode` affects the `name` property directly
4. `mobileName` is a separate property for mobile viewport - they're independent

---

## Testing Requirements

### Functional Testing
- [ ] Verify mobile navigation displays shortened labels on mobile viewports (< 768px)
- [ ] Verify desktop navigation displays full labels on larger viewports
- [ ] Verify navigation functionality is unaffected by label changes
- [ ] Test viewport resize behavior - labels should switch appropriately
- [ ] Verify fallback works when `mobileName` is not defined (uses `name`)

### Visual Testing
- [ ] Mobile labels fit within navigation container without overflow
- [ ] Labels remain readable at all mobile breakpoints
- [ ] No layout shifts when switching between viewport sizes

### Accessibility Testing
- [ ] Screen readers announce appropriate labels
- [ ] Focus states work correctly with shorter labels
- [ ] Touch targets remain sufficiently large on mobile

---

## Acceptance Criteria (from REQ-194)

- [ ] Navigation items can accept both desktop and mobile label configurations
- [ ] Mobile labels display on viewports below defined breakpoint (tablet size)
- [ ] Desktop labels display on larger viewports without modification
- [ ] Label transitions are handled smoothly during viewport resize
- [ ] All navigation functionality remains consistent regardless of label variant
- [ ] Screen readers announce the appropriate label based on current viewport

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Abbreviations unclear to users | Low | Medium | Use common abbreviations (D/B, Prop., Instr.) that are context-clear |
| Conflict with compactMode | Low | Low | The patterns are independent - compactMode modifies `name`, mobileName is separate |
| Labels too short for touch | Low | Medium | Ensure container sizing maintains touch target, not just text |
| Missing mobileName fallback | Low | High | Implement `|| item.name` fallback for graceful degradation |

---

## Notes

- This implementation uses a straightforward approach: adding an optional `mobileName` property that's used only in MobileNavigation
- The existing `compactMode` pattern serves a different purpose (prop-driven label shortening) and remains untouched
- Consider whether future iterations should use CSS-based label switching (e.g., `display: none` on spans) for smoother transitions, but the current approach is simpler and meets requirements

---

## References

- **Request:** docs/gen_requests.md - Request #194
- **Implementation Plan:** docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md (Phase 4, Task 4.2)
- **Primary File:** src/components/RoleBasedNavigation.tsx
- **Related Task:** REQ-193 (Task 4.1 - Update Navigation Items Configuration)
- **Related Task:** REQ-195 (Task 4.3 - Update Dashboard Layout Navigation)
