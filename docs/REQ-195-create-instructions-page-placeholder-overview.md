# REQ-195: Create Instructions Page (Placeholder) - Implementation Overview

**Document Created:** 2026-01-12 18:00:00
**Last Modified:** 2026-01-12 18:00:00
**Request Source:** docs/gen_requests.md - Request #195
**Implementation Plan Reference:** docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md
**Phase:** 4 - REQ-4 - Update Navigation Menu
**Task ID:** 4.4

---

## Summary

Create a placeholder Instructions page at `/dashboard/instructions` that provides users with access to view and manage instructions/articles for their items. This page is part of the Phase 4 navigation menu update, which adds an "Instructions" menu item to provide better organization of content types.

According to the implementation plan, the Instructions page will list articles/instructions grouped by item. For the initial implementation, we create a placeholder page that establishes the navigation pattern, with full implementation to follow.

---

## Context from Implementation Plan

### Data Model Clarification (REQ-2 - Phase 0)
The database already correctly separates:
- **Items table**: Physical objects with `name` field (Steamer, Coffee Maker, etc.)
- **Item Articles table**: Instructions/content with `purpose` and `title` fields linked to items via `item_id`

The Instructions page will primarily display data from the `item_articles` table, grouped by their parent items.

### Related Navigation Changes (REQ-4 - Phase 4)
- Task 4.1: Update Navigation Items Configuration (adds Instructions menu item)
- Task 4.2: Add Mobile Label Support (Instructions → "Instr." on mobile)
- Task 4.3: Update Dashboard Layout Navigation
- **Task 4.4: Create Instructions Page (Placeholder)** ← THIS TASK
- Task 4.5: Verify existing routes still work

---

## Existing Patterns Analysis

### Dashboard Page Structure
Existing dashboard pages follow this pattern:
- Located in `src/app/dashboard/[section]/page.tsx`
- Use `'use client';` directive for client-side rendering
- Import from `@/contexts/AuthContext` for user/permission checking
- Use `useRouter` and `useSearchParams` for navigation
- Include loading states with `Loader2` icon
- Include permission checking with access denied states
- Include a page header section with title, description, and action buttons

### Reference Files
1. **`src/app/dashboard/items/page.tsx`** - Items management page (best reference)
2. **`src/app/dashboard/properties/page.tsx`** - Properties management page
3. **`src/app/dashboard/analytics/page.tsx`** - Analytics dashboard page

### Navigation Integration Points
1. **`src/app/dashboard/layout.tsx`** (lines 93-112) - Dashboard layout navigation
   - Contains `getNavigationItems()` function
   - Currently has: Dashboard, Items, Properties, Analytics (admin only)
   - Needs: Add Instructions menu item

2. **`src/components/RoleBasedNavigation.tsx`** (lines 57-124) - Role-based navigation
   - More sophisticated navigation with permissions
   - Uses `DashboardSection` enum for section tracking
   - Needs: Add Instructions section and menu item

---

## Implementation Tasks

### Task 4.4.1: Create Instructions Page Directory
Create the directory structure for the instructions page.

**Action:** Create directory `src/app/dashboard/instructions/`

### Task 4.4.2: Create Placeholder Page Component
Create a placeholder page with consistent styling matching other dashboard pages.

**File to Create:** `src/app/dashboard/instructions/page.tsx`

**Implementation Details:**
```typescript
'use client';

// Import patterns from items/page.tsx
- useAuth from '@/contexts/AuthContext'
- useRouter from 'next/navigation'
- FileText icon from 'lucide-react' for branding
- Loading state with Loader2 icon
- Permission checking for canViewItems (same permission as items)
```

**Page Structure:**
1. Page header with title "Instructions" and description
2. Placeholder content indicating the feature is coming soon
3. Navigation link back to Dashboard
4. Optional: Link to Items page as alternative

**Styling:** Match existing dashboard pages:
- Container with padding
- Title: `text-2xl font-bold text-gray-900`
- Description: `text-gray-600`
- Card containers with `bg-white rounded-lg shadow-sm border border-gray-200 p-6`

### Task 4.4.3: Add DashboardSection Enum Value
Update the permissions types to include an Instructions section for navigation tracking.

**File to Modify:** `src/types/permissions.ts`

**Change Required:**
- Add `instructions = 'instructions'` to DashboardSection enum

### Task 4.4.4: Verify Page Routing
Ensure the new page is accessible and properly integrated with Next.js App Router.

**Verification:**
- Navigate to `/dashboard/instructions` in browser
- Confirm page loads without errors
- Confirm navigation works from menu (after 4.1-4.3 are complete)

---

## Authorized Files and Functions for Modification

### Files to Create
| File Path | Purpose |
|-----------|---------|
| `src/app/dashboard/instructions/page.tsx` | New Instructions placeholder page |

### Files to Modify
| File Path | Specific Changes |
|-----------|------------------|
| `src/types/permissions.ts` | Add `instructions` to DashboardSection enum |

### Files for Reference Only (Do Not Modify)
| File Path | Reference Purpose |
|-----------|-------------------|
| `src/app/dashboard/items/page.tsx` | Pattern for page structure, permissions, loading states |
| `src/app/dashboard/properties/page.tsx` | Alternative pattern reference |
| `src/contexts/AuthContext.tsx` | Understanding auth hooks and permissions |
| `src/components/RoleBasedNavigation.tsx` | Understanding navigation integration |

---

## Dependencies

### Depends On (upstream)
- **Task 4.1 (Update Navigation Items Configuration)**: The Instructions page needs to be accessible via navigation, which requires the menu item to exist first
- **Task 4.3 (Update Dashboard Layout Navigation)**: The dashboard layout navigation must include the Instructions route for consistent navigation

### Blocks (downstream)
- None - This is a placeholder that other tasks can reference but don't depend on for their implementation

### Parallel Safety
- **Files touched:**
  - `src/app/dashboard/instructions/page.tsx` (new file - no conflicts)
  - `src/types/permissions.ts` (DashboardSection enum only)
- **Conflicts with:** None - creates new file, minor enum addition
- **Safe to parallelize with:**
  - Task 4.1 (RoleBasedNavigation.tsx - different file)
  - Task 4.2 (NavigationItem interface - different file)
  - Phase 3 tasks (REQ-1 - different files entirely)
  - Phase 0-2 tasks (ItemCapture components - different files)

---

## Acceptance Criteria

From REQ-195:
- [ ] Instructions page exists at `/dashboard/instructions`
- [ ] Page is accessible when logged in with appropriate permissions
- [ ] Page displays consistent styling with other dashboard pages
- [ ] Page includes appropriate placeholder content
- [ ] Loading states are implemented
- [ ] Permission checking is implemented (uses same permissions as Items)
- [ ] Navigation to/from page works correctly

---

## Technical Specifications

### Component Props/State
```typescript
// No external props - page component

// Internal State
interface InstructionsPageState {
  loading: boolean;
  // Future: instructions data, filters, pagination
}
```

### Permission Requirements
- Same permissions as Items page (`canViewItems`, `canManageItems`)
- Reason: Instructions/articles are sub-resources of Items

### API Endpoints (Future)
For full implementation, will need:
- `GET /api/items/articles` - List all articles grouped by item
- Use existing `adminApi` patterns

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Placeholder creates user confusion | Low | Low | Clear "Coming Soon" messaging |
| Route conflicts with existing routes | Low | Medium | Verify no `/instructions` route exists |
| Permission model mismatch | Low | Low | Use existing Items permissions |

---

## Implementation Notes

1. **Keep It Simple**: This is a placeholder - don't over-engineer
2. **Match Existing Patterns**: Follow the exact patterns from `items/page.tsx`
3. **Use Existing Permissions**: Leverage `canViewItems` permission - instructions are item sub-resources
4. **Future-Proof Structure**: Create proper directory structure for future nested pages

---

## References

- Implementation Plan: `docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md`
- Request Document: `docs/gen_requests.md` (REQ-195)
- Pattern Reference: `src/app/dashboard/items/page.tsx`
- Database Schema: `database/schema.sql` (items, item_articles tables)
