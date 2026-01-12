# REQ-207: Create Instructions Page for Dashboard2 - Implementation Overview

**Document Created:** 2026-01-12 22:15:00 UTC
**Last Modified:** 2026-01-12 22:15:00 UTC
**Request Source:** docs/gen_requests.md - Request #207 (Derived from Plan-109)
**Implementation Plan Reference:** docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md
**Phase:** 4 - Update Navigation Menu (ITEM-04)
**Task ID:** 4.3
**Priority:** MEDIUM

---

## Summary

Create the Instructions page at `/dashboard2/instructions` to provide users with access to view and manage instructions/articles for their items. This page is part of the Phase 4 navigation menu update (ITEM-04), which adds an "Instructions" menu item to the dashboard2 navigation.

The dashboard2 (`/dashboard2/`) route uses a different layout and authentication pattern than the legacy dashboard (`/dashboard/`), so while REQ-195 implemented a similar page for `/dashboard/instructions`, this task creates a new implementation specifically for the dashboard2 route.

---

## Context from Implementation Plan (Plan-109)

### Phase 4 - Update Navigation Menu (ITEM-04)

The implementation plan specifies the following navigation structure:

```typescript
const navigationItems = [
  { name: 'Dashboard', mobileLabel: 'D/B', href: '/dashboard2', icon: LayoutDashboard },
  { name: 'Items', mobileLabel: 'Items', href: '/dashboard2/items', icon: Package },
  { name: 'Instructions', mobileLabel: 'Instr.', href: '/dashboard2/instructions', icon: FileText },  // NEW
  { name: 'Properties', mobileLabel: 'Prop.', href: '/dashboard2/properties', icon: Building2 },
];
```

### Related Tasks in Phase 4

- Task 4.1: Update navigationItems in layout (adds Instructions menu item)
- Task 4.2: Add mobile label display logic
- **Task 4.3: Create Instructions page** (THIS TASK)

### Data Model Context (ITEM-02 - Phase 5)

The database separates:
- **Items**: Physical objects with `name` field (e.g., "Cabinets", "Coffee Maker")
- **Item Articles**: Instructions/content with `purpose` and `title` fields linked via `item_id`

The Instructions page will eventually display data from the `item_articles` table, grouped by their parent items.

---

## Existing Patterns Analysis

### Dashboard2 Page Structure

Existing dashboard2 pages follow these patterns:

**File Location:** `src/app/dashboard2/[section]/page.tsx`

**Common Patterns:**
1. `'use client';` directive for client-side rendering
2. Import `useAuth` from `@/contexts/AuthContext` for user checking
3. Import `useRouter` from `next/navigation` for navigation
4. Loading state with `Loader2` icon from `lucide-react`
5. Unauthenticated state with login button
6. Page header with title, description, and action buttons
7. Main content area with consistent styling

### Reference Files

| File | Purpose |
|------|---------|
| `src/app/dashboard2/properties/page.tsx` | Best reference - full pattern with auth, loading, modals |
| `src/app/dashboard2/items/page.tsx` | Complex page with data fetching and ItemManager |
| `src/app/dashboard2/layout.tsx` | Layout structure and navigation items |

### Key Differences from `/dashboard/` Pages

| Aspect | `/dashboard/` | `/dashboard2/` |
|--------|--------------|----------------|
| Permission Hook | `usePermissions()` | Auth state from `useAuth()` |
| Color Scheme | Blue (`bg-blue-600`) | Airbnb Pink (`bg-[#FF385C]`) |
| Permission Check | `canViewItems.granted` | `user` existence check |
| Layout Provider | RoleBasedNavigation | PropertyProvider + AuthProvider |

---

## Implementation Tasks

### Task 4.3.1: Create Instructions Page Directory

Create the directory structure for the instructions page.

**Action:** Create directory `src/app/dashboard2/instructions/`

### Task 4.3.2: Create Instructions Page Component

Create a placeholder page following dashboard2 patterns.

**File to Create:** `src/app/dashboard2/instructions/page.tsx`

**Required Imports:**
```typescript
'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Loader2 } from 'lucide-react';
```

**Component Structure:**
1. Authentication check (loading state → unauthenticated state → authenticated view)
2. Page header with title "Instructions" and description
3. Placeholder content indicating future functionality
4. Navigation links to Items page and Create page

**Styling (Airbnb DLS):**
- Primary color: `#FF385C` (Airbnb pink)
- Secondary text: `#717171`
- Primary text: `#222222`
- Background: `bg-gray-50` (inherited from layout)
- Cards: `bg-white rounded-xl shadow-sm`

### Task 4.3.3: Add Page Header Section

Match the header pattern from items/page.tsx:

```tsx
<div className="mb-6 flex items-center justify-between">
  <div>
    <h1 className="text-2xl font-bold text-gray-900">Instructions</h1>
    <p className="text-gray-600 mt-1">
      View and manage instructions for your items
    </p>
  </div>
  <button
    onClick={() => router.push('/dashboard2/create')}
    className="inline-flex items-center px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors"
  >
    <PlusCircle className="w-4 h-4 mr-2" />
    Create New Item
  </button>
</div>
```

### Task 4.3.4: Add Placeholder Content Card

Provide informative placeholder content:

```tsx
<div className="bg-white rounded-xl shadow-sm p-6">
  <div className="text-center py-12">
    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Instructions Coming Soon
    </h3>
    <p className="text-gray-500 max-w-md mx-auto mb-6">
      This page will display all instructions and articles grouped by item.
      For now, you can manage instructions through the Items page.
    </p>
    <button
      onClick={() => router.push('/dashboard2/items')}
      className="inline-flex items-center px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors"
    >
      View Items
    </button>
  </div>
</div>
```

### Task 4.3.5: Add Accessibility Features

Include proper ARIA attributes:
- `role="main"` on page container
- `aria-labelledby` referencing title id
- `aria-hidden="true"` on decorative icons
- Descriptive button labels

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/app/dashboard2/instructions/page.tsx` | New Instructions page for dashboard2 |

### Files to Reference Only (Do Not Modify)

| File Path | Reference Purpose |
|-----------|-------------------|
| `src/app/dashboard2/properties/page.tsx` | Pattern for auth, loading, page structure |
| `src/app/dashboard2/items/page.tsx` | Pattern for header with action button |
| `src/app/dashboard2/layout.tsx` | Layout structure, navigation integration |
| `src/app/dashboard/instructions/page.tsx` | Similar implementation (different route) |
| `src/contexts/AuthContext.tsx` | Auth context usage patterns |

---

## Dependencies

### Depends On (upstream)

- **Task 4.1 (Update navigationItems in layout)**: The Instructions page needs to be accessible via navigation, which requires the menu item to exist first. However, the page can be created before navigation is updated - it just won't be easily discoverable until navigation is complete.

### Blocks (downstream)

- **None directly**: This is a placeholder page that establishes the route. No other tasks depend on its specific implementation.
- **Future Enhancement**: Full instructions listing functionality will build on this placeholder.

### Parallel Safety

- **Files touched:**
  - `src/app/dashboard2/instructions/page.tsx` (NEW file - no conflicts)

- **Conflicts with:**
  - None - creates a new file in a new directory

- **Safe to parallelize with:**
  - Task 4.1 (Update navigationItems in layout) - modifies `src/app/dashboard2/layout.tsx`
  - Task 4.2 (Add mobile label display logic) - modifies `src/app/dashboard2/layout.tsx`
  - All Phase 1 tasks (ITEM-05) - different component files
  - All Phase 2 tasks (ITEM-03) - NextActionStep component
  - All Phase 3 tasks (ITEM-01) - StatisticsCards component
  - All Phase 5 tasks (ITEM-02) - type definitions

---

## Acceptance Criteria

From Implementation Plan (Plan-109, Phase 4, Task 4.3):

- [ ] Instructions page exists at `/dashboard2/instructions`
- [ ] Page is accessible when logged in
- [ ] Page displays consistent styling with other dashboard2 pages (Airbnb DLS)
- [ ] Page includes appropriate placeholder content
- [ ] Loading states are implemented
- [ ] Unauthenticated users see appropriate message with login option
- [ ] Navigation link to Items page works correctly
- [ ] Navigation link to Create page works correctly
- [ ] Page uses Airbnb color scheme (`#FF385C` primary)

---

## Technical Specifications

### Component Structure

```typescript
// No external props - page component
interface InstructionsPageComponent {
  // Internal state only
  // Uses useAuth() hook for auth state
  // Uses useRouter() for navigation
}
```

### State Management

The page uses auth state from `useAuth()` hook:
```typescript
const { user, loading } = useAuth();
```

- `loading`: Shows loading spinner while auth is being determined
- `user`: If null after loading, show unauthenticated state

### Navigation Targets

| Action | Target Route |
|--------|-------------|
| "Create New Item" button | `/dashboard2/create` |
| "View Items" button | `/dashboard2/items` |
| Login redirect | `/login` (via window.location) |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Placeholder creates user confusion | Low | Low | Clear "Coming Soon" messaging with alternative action |
| Route conflicts | Very Low | Low | Creating new directory structure |
| Styling inconsistency | Low | Medium | Follow exact patterns from properties/page.tsx |
| Auth pattern mismatch | Low | Medium | Use same useAuth() pattern as other dashboard2 pages |

---

## Implementation Notes

1. **Follow Dashboard2 Patterns**: Use `src/app/dashboard2/properties/page.tsx` as the primary reference, NOT `src/app/dashboard/instructions/page.tsx` which uses different auth patterns.

2. **Use Airbnb DLS Colors**: Primary button color should be `#FF385C`, not `blue-600` used in the legacy dashboard.

3. **Keep It Simple**: This is a placeholder - don't over-engineer. The full instructions listing feature will be implemented separately.

4. **No Permission Hook**: Dashboard2 pages don't use `usePermissions()` hook - they rely on `useAuth()` for basic authentication checking.

5. **Property Context**: The layout already provides `PropertyProvider`, so property context is available if needed for future enhancements.

---

## Complete Implementation Code

```typescript
'use client';

/**
 * Instructions Page - Dashboard2
 *
 * REQ-207: Create Instructions Page for Dashboard2
 * Phase 4, Task 4.3
 *
 * Last Modified: 2026-01-12
 *
 * This page will display instructions/articles grouped by item.
 * Currently serves as a placeholder with navigation to Items and Create pages.
 *
 * @route /dashboard2/instructions
 * @see docs/REQ-207-create-instructions-page-overview.md
 */

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Loader2, PlusCircle } from 'lucide-react';

export default function InstructionsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF385C] mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated state
  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-6">Please log in to view instructions.</p>
        <button
          onClick={() => (window.location.href = '/login')}
          className="px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Authenticated view
  return (
    <div role="main" aria-labelledby="instructions-title">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 id="instructions-title" className="text-2xl font-bold text-gray-900">
            Instructions
          </h1>
          <p className="text-gray-600 mt-1">
            View and manage instructions for your items
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard2/create')}
          className="inline-flex items-center px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Create New Item
        </button>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Instructions Coming Soon
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            This page will display all instructions and articles grouped by item.
            For now, you can manage instructions through the Items page.
          </p>
          <button
            onClick={() => router.push('/dashboard2/items')}
            className="inline-flex items-center px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors"
          >
            View Items
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## References

- **Implementation Plan:** docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md
- **Related Task (Legacy):** docs/REQ-195-create-instructions-page-placeholder-overview.md
- **Pattern Reference:** src/app/dashboard2/properties/page.tsx
- **Layout Reference:** src/app/dashboard2/layout.tsx
- **Auth Context:** src/contexts/AuthContext.tsx
