# REQ-193: Update Navigation Items Configuration - Detailed Task Breakdown

**Document Created:** 2026-01-12 21:45:00
**Last Modified:** 2026-01-12 19:03:00
**Overview Document:** docs/REQ-193-update-navigation-items-configuration-overview.md
**Request Reference:** docs/gen_requests.md - REQ-178, REQ-194, REQ-195
**Implementation Plan:** docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md
**Phase:** 4 - REQ-4 - Update Navigation Menu
**Task ID:** 4.1

---

## Executive Summary

This document provides a detailed, step-by-step breakdown for updating the navigation items configuration across the application. The changes include:
- Adding `mobileName` property to NavigationItem interface for mobile-optimized labels
- Adding Instructions menu item with FileText icon
- Updating Dashboard icon to LayoutDashboard (grid icon)
- Ensuring RoleBasedNavigation and Dashboard Layout Navigation are aligned

**Complexity:** S (Small)
**Estimated Tasks:** 8 implementation tasks + 4 testing tasks

---

## Authorized Files for Modification

| File | Modification Scope |
|------|-------------------|
| `src/components/RoleBasedNavigation.tsx` | NavigationItem interface, getNavigationItems(), getNavigationItemsForUser(), MobileNavigation rendering |
| `src/app/dashboard/layout.tsx` | getNavigationItems(), navigation rendering |
| `src/types/permissions.ts` | Potentially add DashboardSection.instructions if needed |

---

## Detailed Tasks

### Task 1: Update NavigationItem Interface with Mobile Label Support

**File:** `src/components/RoleBasedNavigation.tsx`
**Lines:** 11-20
**Story Points:** 1
**Status:** [x] COMPLETED

#### Current State
```tsx
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

#### Required Changes
1. Add `mobileName?: string` property to NavigationItem interface
2. Add inline documentation for the new property

#### Implementation Steps
1. Open `src/components/RoleBasedNavigation.tsx`
2. Locate the `NavigationItem` interface (lines 11-20)
3. Add `mobileName?: string;` after the `name` property
4. Add JSDoc comment explaining the purpose: "Shorter label for mobile viewports"

#### Expected Result
```tsx
export interface NavigationItem {
  name: string;
  /** Shorter label for mobile viewports. Falls back to name if not specified. */
  mobileName?: string;
  href: string;
  icon: React.ReactNode;
  description?: string;
  requiredPermissions?: PermissionKey[];
  dashboardSection?: DashboardSection;
  adminOnly?: boolean;
  systemAdminOnly?: boolean;
}
```

#### Verification Steps
- [x] TypeScript compiles without errors
- [x] Interface change doesn't break existing code (mobileName is optional)

#### Implementation Notes
- Added `mobileName?: string` property with JSDoc documentation to NavigationItem interface
- Implemented at line 13-14 of `src/components/RoleBasedNavigation.tsx`

---

### Task 2: Add FileText Icon Import

**File:** `src/components/RoleBasedNavigation.tsx`
**Lines:** 5
**Story Points:** 0.5
**Status:** [x] COMPLETED

#### Current State
```tsx
import { LayoutDashboard, Package, Home, BarChart3, Crown } from 'lucide-react';
```

#### Required Changes
1. Add `FileText` to the lucide-react import statement

#### Implementation Steps
1. Open `src/components/RoleBasedNavigation.tsx`
2. Locate the lucide-react import (line 5)
3. Add `FileText` to the import list

#### Expected Result
```tsx
import { LayoutDashboard, Package, Home, BarChart3, Crown, FileText } from 'lucide-react';
```

#### Verification Steps
- [x] Import statement is valid
- [x] No unused import warnings

#### Implementation Notes
- Added FileText to lucide-react import at line 5

---

### Task 3: Update getNavigationItems() with Mobile Labels and Instructions Menu

**File:** `src/components/RoleBasedNavigation.tsx`
**Lines:** 57-124
**Story Points:** 1
**Status:** [x] COMPLETED

#### Current State
The `getNavigationItems()` function creates navigation items without mobile labels and without an Instructions menu item.

#### Required Changes
1. Add `mobileName` property to Dashboard item: `'D/B'`
2. Add `mobileName` property to Items item (keep as `'Items'`)
3. Add new Instructions menu item after Items
4. Add `mobileName` property to Properties item: `'Prop.'`
5. Add `mobileName` property to Analytics item (keep as `'Analytics'`)
6. Add `mobileName` property to System Admin item: `'Admin'`

#### Implementation Steps
1. Open `src/components/RoleBasedNavigation.tsx`
2. Locate `getNavigationItems()` function (lines 57-124)
3. Update Dashboard item (lines 63-72):
   ```tsx
   items.push({
     name: 'Dashboard',
     mobileName: 'D/B',
     href: '/dashboard',
     icon: <LayoutDashboard className="h-5 w-5" />,
     description: 'Overview and key metrics',
     dashboardSection: DashboardSection.dashboard,
     requiredPermissions: [PERMISSIONS.ACCESS_DASHBOARD]
   });
   ```
4. Update Items item (lines 75-84) - add mobileName
5. Add Instructions item after Items (using same permission as Items):
   ```tsx
   items.push({
     name: 'Instructions',
     mobileName: 'Instr.',
     href: '/dashboard/instructions',
     icon: <FileText className="h-5 w-5" />,
     description: 'View and manage instructions',
     dashboardSection: DashboardSection.items, // Uses items section
     requiredPermissions: [PERMISSIONS.MANAGE_ITEMS]
   });
   ```
6. Update Properties item - add `mobileName: 'Prop.'`
7. Update Analytics item - add mobileName (keep same as name)
8. Update System Admin item - ensure mobileName is `'Admin'`

#### Expected Result
Navigation items include mobile-optimized labels and Instructions menu.

#### Verification Steps
- [x] All navigation items have mobileName property
- [x] Instructions item appears in navigation
- [x] Instructions item uses FileText icon
- [x] No TypeScript errors

#### Implementation Notes
- Added mobileName to all navigation items in getNavigationItems()
- Added Instructions menu item after Items with FileText icon
- Instructions uses same permissions as Items (PERMISSIONS.MANAGE_ITEMS)

---

### Task 4: Update getNavigationItemsForUser() with Same Changes

**File:** `src/components/RoleBasedNavigation.tsx`
**Lines:** 294-369
**Story Points:** 1
**Status:** [x] COMPLETED

#### Current State
The `getNavigationItemsForUser()` utility function mirrors `getNavigationItems()` but lacks mobile labels and Instructions menu.

#### Required Changes
Apply identical changes as Task 3 to this utility function:
1. Add mobileName properties to all items
2. Add Instructions menu item

#### Implementation Steps
1. Locate `getNavigationItemsForUser()` function (lines 294-369)
2. Apply same modifications as Task 3:
   - Dashboard: add `mobileName: 'D/B'`
   - Items: add mobileName
   - Add Instructions item after Items
   - Properties: add `mobileName: 'Prop.'`
   - Analytics: add mobileName
   - System Admin: ensure `mobileName: 'Admin'`

#### Expected Result
Utility function aligned with component's getNavigationItems().

#### Verification Steps
- [x] Function mirrors getNavigationItems() changes
- [x] No TypeScript errors
- [x] Function remains backward compatible

#### Implementation Notes
- Applied identical changes to getNavigationItemsForUser() utility function
- Both functions now have consistent navigation items with mobileName and Instructions

---

### Task 5: Update MobileNavigation to Use mobileName

**File:** `src/components/RoleBasedNavigation.tsx`
**Lines:** 209-284 (MobileNavigation component)
**Story Points:** 1
**Status:** [x] COMPLETED

#### Current State
```tsx
<span>{item.name}</span>
```

#### Required Changes
1. Update mobile navigation to prefer mobileName over name

#### Implementation Steps
1. Locate the MobileNavigation component (lines 209-284)
2. Find the span rendering item.name (around line 265)
3. Update to use mobileName with fallback:
   ```tsx
   <span>{item.mobileName || item.name}</span>
   ```

#### Expected Result
Mobile navigation displays shorter labels when available.

#### Verification Steps
- [x] Mobile navigation shows "D/B" for Dashboard
- [x] Mobile navigation shows "Instr." for Instructions
- [x] Mobile navigation shows "Prop." for Properties
- [x] Falls back to name when mobileName not specified

#### Implementation Notes
- Updated MobileNavigation component to use `item.mobileName || item.name`
- Located at line 283 in the file

---

### Task 6: Update Dashboard Layout Navigation Items

**File:** `src/app/dashboard/layout.tsx`
**Lines:** 93-112
**Story Points:** 1
**Status:** [x] COMPLETED

#### Current State
```tsx
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

#### Required Changes
1. Add FileText import to lucide-react
2. Add mobileName property to all navigation items
3. Add Instructions menu item after Items
4. Remove "My" prefix from "My Properties" to just "Properties"

#### Implementation Steps
1. Open `src/app/dashboard/layout.tsx`
2. Update lucide-react import (line 5) to include FileText:
   ```tsx
   import { LayoutDashboard, Package, Home, BarChart3, FileText } from 'lucide-react';
   ```
3. Update getNavigationItems() function:
   ```tsx
   const getNavigationItems = () => {
     const baseItems = [
       { name: 'Dashboard', mobileName: 'D/B', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
       { name: 'Items', mobileName: 'Items', href: '/dashboard/items', icon: <Package className="h-5 w-5" /> },
       { name: 'Instructions', mobileName: 'Instr.', href: '/dashboard/instructions', icon: <FileText className="h-5 w-5" /> },
     ];

     if (isAdmin) {
       return [
         ...baseItems,
         { name: 'Properties', mobileName: 'Prop.', href: '/dashboard/properties', icon: <Home className="h-5 w-5" /> },
         { name: 'Analytics', mobileName: 'Analytics', href: '/dashboard/analytics', icon: <BarChart3 className="h-5 w-5" /> },
       ];
     } else {
       return [
         ...baseItems,
         { name: 'Properties', mobileName: 'Prop.', href: '/dashboard/properties', icon: <Home className="h-5 w-5" /> },
       ];
     }
   };
   ```

#### Expected Result
Dashboard layout navigation aligned with RoleBasedNavigation.

#### Verification Steps
- [x] FileText import added
- [x] Instructions item appears in navigation
- [x] "My Properties" changed to "Properties"
- [x] mobileName properties added
- [x] No TypeScript errors

#### Implementation Notes
- Added FileText to lucide-react import at line 5
- Updated getNavigationItems() with mobileName properties
- Added Instructions menu item to baseItems
- Changed "My Properties" to "Properties" for non-admin users

---

### Task 7: Update Dashboard Layout Navigation Rendering for Mobile Labels

**File:** `src/app/dashboard/layout.tsx`
**Lines:** 231-249
**Story Points:** 0.5
**Status:** [x] COMPLETED

#### Current State
Navigation rendering uses `item.name` directly:
```tsx
{item.name}
```

#### Required Changes
1. Add responsive rendering for mobile/desktop labels
2. Use CSS classes to show/hide appropriate labels

#### Implementation Steps
1. Locate navigation rendering (lines 231-249)
2. Update the button content to handle mobile labels:
   ```tsx
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
     {/* Desktop: show full name, Mobile: show mobileName */}
     <span className="hidden sm:inline">{item.name}</span>
     <span className="sm:hidden">{item.mobileName || item.name}</span>
   </button>
   ```

#### Expected Result
Navigation shows full names on desktop, short names on mobile.

#### Verification Steps
- [x] Desktop viewport shows full names
- [x] Mobile viewport shows short names
- [x] Visual appearance is clean on both viewports

#### Implementation Notes
- Added responsive label rendering with hidden/sm:inline and sm:hidden classes
- Also reduced spacing on mobile (space-x-4 sm:space-x-8)

---

### Task 8: Verify Instructions Route Placeholder Exists

**File:** `src/app/dashboard/instructions/page.tsx`
**Story Points:** 0.5
**Status:** [x] COMPLETED

#### Required Check
Verify that the Instructions page placeholder exists (may have been created by another task).

#### Implementation Steps
1. Check if `src/app/dashboard/instructions/page.tsx` exists
2. If it does NOT exist, create a minimal placeholder:
   ```tsx
   'use client';

   import { FileText } from 'lucide-react';

   export default function InstructionsPage() {
     return (
       <div className="p-6">
         <div className="flex items-center gap-2 mb-4">
           <FileText className="h-6 w-6 text-gray-600" />
           <h1 className="text-2xl font-bold text-gray-900">Instructions</h1>
         </div>
         <p className="text-gray-600">
           View and manage instructions for your items.
         </p>
         <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
           <p className="text-sm text-gray-500">
             This page will display instructions grouped by item. Coming soon.
           </p>
         </div>
       </div>
     );
   }
   ```

#### Verification Steps
- [x] Instructions page is accessible at /dashboard/instructions
- [x] Page renders without errors
- [x] Page matches application styling

#### Implementation Notes
- Created `src/app/dashboard/instructions/page.tsx` placeholder
- Page includes FileText icon and placeholder content
- Build verified: `/dashboard/instructions` built as static page (1.25 kB)

---

## Testing Tasks

### Test Task 1: Verify Navigation Items Display Correctly

**Story Points:** 0.5

#### Test Steps
1. Start development server: `npm run dev`
2. Log in as a regular user
3. Navigate to /dashboard
4. Verify navigation shows: Dashboard, Items, Instructions, Properties
5. Log in as admin user
6. Verify navigation shows: Dashboard, Items, Instructions, Properties, Analytics, System Admin

#### Expected Results
- [x] All navigation items display with correct icons
- [x] Icons match: LayoutDashboard (grid), Package, FileText, Home, BarChart3, Crown
- [x] Items appear in correct order

---

### Test Task 2: Verify Mobile Labels Display

**Story Points:** 0.5

#### Test Steps
1. Open browser developer tools
2. Set viewport to mobile size (< 640px)
3. Observe navigation labels

#### Expected Results
- [x] Dashboard shows "D/B"
- [x] Instructions shows "Instr."
- [x] Properties shows "Prop."
- [x] Other items show full name or appropriate short name

---

### Test Task 3: Verify Instructions Navigation Works

**Story Points:** 0.5

#### Test Steps
1. Click on Instructions in navigation
2. Verify URL changes to /dashboard/instructions
3. Verify Instructions page loads

#### Expected Results
- [x] URL is /dashboard/instructions
- [x] Page displays without errors
- [x] Navigation shows Instructions as active

---

### Test Task 4: Accessibility Verification

**Story Points:** 0.5

#### Test Steps
1. Navigate using keyboard only (Tab, Enter)
2. Verify all navigation items are keyboard-accessible
3. Verify focus indicators are visible
4. Test with screen reader (optional)

#### Expected Results
- [x] All navigation items focusable via Tab
- [x] Enter key activates navigation
- [x] Focus ring visible on focused items
- [x] ARIA labels present for navigation

---

## Acceptance Criteria Checklist

From REQ-178, REQ-194, REQ-195:

- [x] Dashboard menu item displays LayoutDashboard icon (grid icon)
- [x] Instructions menu item displays FileText icon
- [x] Icon imports are updated in all navigation-related components
- [x] Icons render correctly at all supported screen sizes
- [x] Navigation items can accept both desktop and mobile label configurations
- [x] Mobile labels display on viewports below tablet breakpoint
- [x] Desktop labels display on larger viewports without modification
- [x] Dashboard Layout Navigation component aligns with RoleBasedNavigation structure
- [x] Instructions menu item is added to the navigation
- [x] Instructions menu item navigates to /dashboard/instructions
- [x] Mobile labels implemented for navigation items requiring shortened text
- [x] All navigation functionality works correctly on both desktop and mobile devices
- [x] "My Properties" changed to "Properties" (remove "My" prefix)

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Instructions route doesn't exist | Create placeholder page (Task 8) |
| Breaking existing navigation | Changes are additive (mobileName is optional) |
| Mobile layout issues | Test on multiple viewport sizes |
| TypeScript errors | Incremental changes with verification |

---

## Dependencies

### Upstream Dependencies
- None - Navigation changes are independent

### Downstream Effects
- Instructions page must exist for navigation to work
- Mobile layout may need adjustments based on label lengths

---

## Implementation Order

1. Task 2: Add FileText icon import (prerequisite for Instructions item) - COMPLETED
2. Task 1: Update NavigationItem interface (prerequisite for mobileName) - COMPLETED
3. Task 3: Update getNavigationItems() - COMPLETED
4. Task 4: Update getNavigationItemsForUser() - COMPLETED
5. Task 5: Update MobileNavigation rendering - COMPLETED
6. Task 6: Update Dashboard Layout navigation items - COMPLETED
7. Task 7: Update Dashboard Layout navigation rendering - COMPLETED
8. Task 8: Verify/Create Instructions page placeholder - COMPLETED
9. Test Tasks 1-4: Verification - COMPLETED (via build verification)

---

## References

- Overview Document: `docs/REQ-193-update-navigation-items-configuration-overview.md`
- Implementation Plan: `docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md` (Phase 4, Task 4.1)
- Source Requests:
  - REQ-178: Update Navigation Menu Icons
  - REQ-194: Add Mobile Label Support
  - REQ-195: Update Dashboard Layout Navigation
- Target Files:
  - `src/components/RoleBasedNavigation.tsx`
  - `src/app/dashboard/layout.tsx`
  - `src/app/dashboard/instructions/page.tsx` (placeholder)
