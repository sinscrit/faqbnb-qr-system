# REQ-204: Create Placeholder Routes for Rooms and Tags Navigation - Implementation Overview

**Document Generated:** 2026-01-12 19:30 UTC
**Last Modified:** 2026-01-12 19:30 UTC
**Request ID:** REQ-204
**Phase:** 3 - Make Dashboard Cards Clickable (ITEM-01)
**Task ID:** 3.2
**Priority:** HIGH

---

## Summary

Create placeholder routes for `/dashboard2/rooms` and `/dashboard2/tags` to support dashboard card navigation. These routes provide valid navigation destinations when users click the Rooms and Tags statistics cards on the dashboard.

---

## Context

### Problem Statement

The StatisticsCards component displays three cards (Items, Rooms, Tags) that are being made clickable per ITEM-01 requirements. The Items card navigates to `/dashboard2/items` which already exists. However, clicking Rooms or Tags cards would result in 404 errors because these routes do not exist.

### Implementation Plan Reference

From `docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md`:
- **Phase 3, Task 3.1**: Update StatisticsCards with navigation hrefs
- **Phase 3, Task 3.2**: Create placeholder routes for Rooms and Tags

### Current Route Structure

```
src/app/dashboard2/
├── page.tsx               # /dashboard2 - SimpleDashboard (exists)
├── create/page.tsx        # /dashboard2/create - ItemCreationWorkflow (exists)
├── items/page.tsx         # /dashboard2/items - ItemManager (exists)
├── items/[publicId]/edit/page.tsx  # Item edit (exists)
├── properties/page.tsx    # /dashboard2/properties - PropertySection (exists)
├── print/page.tsx         # Print page (exists)
└── print/[propertyId]/page.tsx     # Property-specific print (exists)
```

**Missing routes that need to be created:**
- `src/app/dashboard2/rooms/page.tsx`
- `src/app/dashboard2/tags/page.tsx`

---

## Technical Investigation

### Existing Page Pattern Analysis

Based on review of `src/app/dashboard2/properties/page.tsx` and `src/app/dashboard2/items/page.tsx`:

1. **Standard Page Structure:**
   - `'use client'` directive at top
   - JSDoc header with route and creation date
   - Import hooks from `@/contexts/AuthContext`
   - Authentication check with redirect/message for unauthenticated users
   - Header section with title and description
   - Main content area

2. **Authentication Pattern:**
   ```tsx
   const { user } = useAuth();

   if (!user) {
     return (
       <div className="text-center py-12">
         <p className="text-gray-600">Please log in to view [content].</p>
       </div>
     );
   }
   ```

3. **Styling Patterns:**
   - Container: `<div className="space-y-6">`
   - Header: `<h1 className="text-2xl font-bold text-gray-900">`
   - Subtext: `<p className="text-gray-600 mt-1">`

### Placeholder Strategy Options

**Option A: Redirect to Items with Filter (Recommended)**
- Navigate to `/dashboard2/items?filter=room:Kitchen` or `/dashboard2/items?filter=tag:electronics`
- Leverages existing ItemManager component
- Requires ItemManager to support URL-based filtering

**Option B: Static Placeholder Page**
- Show "Coming Soon" style placeholder
- Minimal development effort
- Clear user expectations

**Option C: Filtered Item List (Future)**
- Full room/tag management interface
- Requires significant additional development
- Out of scope for this task

**Selected Approach:** Option B - Static placeholder pages for initial implementation. This satisfies the route existence requirement while setting clear user expectations. Future enhancement can add filtering or full management features.

---

## Implementation Tasks

### Task 1: Create Rooms Placeholder Page

**File:** `src/app/dashboard2/rooms/page.tsx`

**Implementation:**
```tsx
'use client';

/**
 * Rooms Page
 *
 * REQ-204: Placeholder route for Rooms navigation from dashboard cards.
 * Shows overview of rooms used in item organization.
 *
 * @route /dashboard2/rooms
 * @created 2026-01-12
 */

import { useAuth } from '@/contexts/AuthContext';
import { Home, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RoomsPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to view rooms.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rooms</h1>
        <p className="text-gray-600 mt-1">
          View items organized by room location
        </p>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-[#E6F7F6] rounded-full flex items-center justify-center mb-4">
          <Home className="w-8 h-8 text-[#00A699]" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Room Management Coming Soon
        </h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Soon you'll be able to browse and manage items by room. For now, you can see all your items in the Items view.
        </p>
        <Link
          href="/dashboard2/items"
          className="inline-flex items-center px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors"
        >
          View All Items
          <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
```

### Task 2: Create Tags Placeholder Page

**File:** `src/app/dashboard2/tags/page.tsx`

**Implementation:**
```tsx
'use client';

/**
 * Tags Page
 *
 * REQ-204: Placeholder route for Tags navigation from dashboard cards.
 * Shows overview of tags used for item categorization.
 *
 * @route /dashboard2/tags
 * @created 2026-01-12
 */

import { useAuth } from '@/contexts/AuthContext';
import { Tag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function TagsPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to view tags.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
        <p className="text-gray-600 mt-1">
          View items organized by tags
        </p>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Tag className="w-8 h-8 text-[#484848]" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Tag Management Coming Soon
        </h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Soon you'll be able to browse and filter items by tags. For now, you can see all your items in the Items view.
        </p>
        <Link
          href="/dashboard2/items"
          className="inline-flex items-center px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors"
        >
          View All Items
          <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
```

---

## Dependencies

### Depends On (upstream)

- **Task 3.1 (Update StatisticsCards)**: The routes being created here are the navigation targets for the clickable cards. However, route creation is technically independent - routes can exist before cards link to them.

### Blocks (downstream)

- **StatisticsCards Navigation**: Once these routes exist, the StatisticsCards component can safely include `href="/dashboard2/rooms"` and `href="/dashboard2/tags"` without causing 404 errors.

### Parallel Safety

- **Files touched:**
  - `src/app/dashboard2/rooms/page.tsx` (NEW)
  - `src/app/dashboard2/tags/page.tsx` (NEW)

- **Conflicts with:** None - these are new files with no existing content to modify.

- **Safe to parallelize with:**
  - Task 3.1 (StatisticsCards update) - different files
  - All Phase 1 tasks (ITEM-05) - different components
  - All Phase 2 tasks (ITEM-03) - different components
  - Task 4.1-4.3 (Navigation menu updates) - different files
  - All Phase 5 tasks (ITEM-02) - different components

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/app/dashboard2/rooms/page.tsx` | Rooms placeholder page component |
| `src/app/dashboard2/tags/page.tsx` | Tags placeholder page component |

### Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `src/app/dashboard2/properties/page.tsx` | Pattern reference for page structure |
| `src/app/dashboard2/items/page.tsx` | Pattern reference for authenticated page |
| `src/components/SimpleDashboard/StatisticsCards.tsx` | Consumer of these routes |

---

## Acceptance Criteria

From REQ-204:

- [ ] Route exists at `/dashboard2/rooms/page.tsx` that renders without errors
- [ ] Route exists at `/dashboard2/tags/page.tsx` that renders without errors
- [ ] Both routes are accessible through standard Next.js routing patterns
- [ ] Pages show placeholder content that clearly communicates the section purpose
- [ ] Navigation from dashboard to these routes functions correctly
- [ ] Browser back button works properly when navigating away from these pages
- [ ] Routes follow existing authentication patterns (user check)
- [ ] Page components match the visual design language of other dashboard sections (Airbnb DLS colors)

---

## Testing Requirements

### Manual Testing

1. Navigate to `/dashboard2/rooms` directly - should render without errors
2. Navigate to `/dashboard2/tags` directly - should render without errors
3. Click "View All Items" link - should navigate to `/dashboard2/items`
4. Test without authentication - should show login prompt
5. Use browser back button after navigating - should work correctly

### Unit Tests (Optional for Placeholder)

Since these are simple placeholder pages, unit tests are optional. If added:

```tsx
// src/app/dashboard2/rooms/__tests__/page.test.tsx
describe('RoomsPage', () => {
  it('renders placeholder content for authenticated user', () => {
    // Mock useAuth to return user
    // Render component
    // Assert heading and CTA are present
  });

  it('shows login prompt for unauthenticated user', () => {
    // Mock useAuth to return null user
    // Render component
    // Assert login message is present
  });
});
```

---

## Design Specifications

### Visual Design

- **Icon Container:** 16x16 (w-16 h-16) rounded-full background
  - Rooms: `bg-[#E6F7F6]` with `text-[#00A699]` icon (teal)
  - Tags: `bg-gray-100` with `text-[#484848]` icon (dark gray)
- **Heading:** `text-xl font-semibold text-gray-900`
- **Description:** `text-gray-600` with `max-w-md mx-auto` for centered narrow text
- **CTA Button:** Airbnb primary style `bg-[#FF385C] hover:bg-[#E31C5F]`

### Accessibility

- Icon decorative (`aria-hidden="true"`)
- Link uses semantic `<Link>` component
- Color contrast meets WCAG 2.1 AA standards

---

## Implementation Notes

1. **No Navigation Menu Updates Required:** These routes are accessed via dashboard card clicks, not the main navigation menu. The navigation menu update is covered by ITEM-04 (Phase 4) for the Instructions page.

2. **Future Enhancement Path:**
   - Phase 1: Placeholder pages (this task)
   - Phase 2: Add URL filter parameter support to ItemManager
   - Phase 3: Update placeholders to redirect to filtered items view
   - Phase 4: Full room/tag management interfaces (separate feature)

3. **Consistency with Existing Routes:** Both pages follow the exact same structure as `properties/page.tsx` for consistency in codebase patterns.

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Create rooms/page.tsx | 10 minutes |
| Create tags/page.tsx | 10 minutes |
| Manual testing | 10 minutes |
| **Total** | **30 minutes** |

---

## References

- **Source Request:** `docs/gen_requests.md` - REQ-204
- **Implementation Plan:** `docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md`
- **Pattern Reference:** `src/app/dashboard2/properties/page.tsx`
- **Consumer Component:** `src/components/SimpleDashboard/StatisticsCards.tsx`
