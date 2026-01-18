# Implementation Overview: Property Context System and Enhanced Item Management

## Header
| Field | Value |
|-------|-------|
| Request Reference | #142 |
| Source File | docs/gen_requests.md |
| Original Request Date | 2026-01-08 14:35 |
| Breakdown Created | 2026-01-08 16:45:00 UTC |
| T-shirt Size | L |
| Estimated Effort | 5-7 days (40-56 hours) |

## Goals

This implementation delivers two major feature sets:

### 1. Property Context System
- Implement a property selector dropdown in the dashboard top navigation bar
- Filter all dashboard data (items, rooms, statistics) by the currently selected property
- Automatically create a default "My Property" for new users on first login
- Persist selected property context across browser sessions using localStorage
- Automatically associate newly created items with the current property context

### 2. Enhanced Item Management
- Add View, Edit, and Delete action buttons to each item in the items list
- Implement a View modal styled to dashboard design system (without QR code display)
- Enable Edit action that navigates to item editor with pre-populated data
- Implement Delete action with confirmation dialog, including media warning and cascading deletion

### Assumptions & Clarifications
- The property dropdown will be placed in the dashboard2 layout top navigation bar (TopBar component area)
- "First login" is interpreted as a user whose account has zero properties
- The existing `PropertySelector` component can be adapted for the nav bar use case
- The View modal will reuse patterns from `ItemPreviewModal` but with dashboard-specific styling
- Cascading deletion includes both `item_links` and any media files in Supabase storage
- The existing `ConfirmDeleteDialog` pattern will be extended for media warning support
- Property filtering applies to the `/dashboard2` routes only, not admin routes

## Implementation Plan

### Step 1: Create Property Context Provider and Hook
- **Description**: Create a React context to manage the current property selection state across the dashboard. This includes the selected property ID, available properties list, and helper functions for property operations.
- **Rationale**: A centralized context ensures consistent property filtering across all dashboard components without prop drilling. Must be done first as all other features depend on this context.
- **Estimated Effort**: M (4-6 hours)

### Step 2: Implement localStorage Persistence for Property Selection
- **Description**: Add localStorage integration to the property context to persist the selected property ID across browser sessions. Include validation to handle cases where the stored property no longer exists.
- **Rationale**: User experience requirement - users should not need to re-select their property on every session.
- **Estimated Effort**: S (2-3 hours)

### Step 3: Create PropertyDropdown Component for Top Navigation
- **Description**: Build a dropdown component for the top navigation bar that displays all user properties, allows selection, and shows the current selection. Handle edge cases: no properties, single property, loading states.
- **Rationale**: The existing `PropertySelector` is designed for filter panels, not navigation bars. A new component optimized for nav bar placement provides better UX.
- **Estimated Effort**: M (4-6 hours)

### Step 4: Integrate PropertyDropdown into Dashboard Layout
- **Description**: Add the PropertyDropdown to the dashboard2 layout.tsx top navigation area. Wire up the context provider at the appropriate level in the component tree.
- **Rationale**: The layout is the correct location for cross-route context and navigation elements.
- **Estimated Effort**: S (2-3 hours)

### Step 5: Implement Default Property Auto-Creation for New Users
- **Description**: Add logic to detect first-time users (users with zero properties) and automatically create a default property named "My Property" with appropriate defaults. This should trigger during authentication or first dashboard load.
- **Rationale**: New user onboarding requirement - users should have a working property context immediately without manual setup.
- **Estimated Effort**: M (4-6 hours)

### Step 6: Update API Endpoints for Property Filtering
- **Description**: Modify the `/api/admin/items` and `/api/user/dashboard/stats` endpoints to accept a `propertyId` query parameter and filter results accordingly. Update the hooks that call these endpoints.
- **Rationale**: Backend must support filtering for the frontend property context to work correctly.
- **Estimated Effort**: M (4-6 hours)

### Step 7: Update Dashboard Pages to Use Property Context
- **Description**: Modify `/dashboard2/page.tsx`, `/dashboard2/items/page.tsx`, and related components to consume the property context and pass the selected property ID to data fetching hooks.
- **Rationale**: Frontend pages must filter their displayed data based on the selected property.
- **Estimated Effort**: M (4-6 hours)

### Step 8: Update Item Creation to Use Current Property
- **Description**: Modify `/dashboard2/create/page.tsx` and the item creation flow to automatically associate new items with the currently selected property from context.
- **Rationale**: Items created should belong to the currently active property without requiring manual selection.
- **Estimated Effort**: S (2-3 hours)

### Step 9: Create ItemViewModal Component
- **Description**: Build a new modal component for viewing item details. Display: name, description, links/media, room assignment, timestamps. Styled to match dashboard design system. Explicitly exclude QR code display.
- **Rationale**: Users need to view item details without navigating away from the items list. This is different from ItemPreviewModal which is used in the ItemManager flow.
- **Estimated Effort**: M (4-6 hours)

### Step 10: Implement Item Action Buttons (View, Edit, Delete)
- **Description**: Add View, Edit, and Delete action buttons to each item row in the items list. Wire up click handlers: View opens ItemViewModal, Edit navigates to edit page, Delete triggers confirmation.
- **Rationale**: Core item management requirement - users need quick access to these actions from the list view.
- **Estimated Effort**: M (4-6 hours)

### Step 11: Implement Item Edit Navigation
- **Description**: Create the edit flow: clicking Edit should navigate to an edit page or open an edit modal with the item's current data pre-populated. Reuse existing item form components where possible.
- **Rationale**: Users need to modify existing items efficiently.
- **Estimated Effort**: M (4-6 hours)

### Step 12: Implement Enhanced Delete Confirmation Dialog
- **Description**: Extend the existing `ConfirmDeleteDialog` to check for associated media files and display an additional warning when media exists. Include information about what will be deleted.
- **Rationale**: Users must be informed about cascading effects before confirming destructive actions.
- **Estimated Effort**: S (2-3 hours)

### Step 13: Implement Cascading Item Deletion with Media Cleanup
- **Description**: Create a deletion flow that: 1) Checks for associated media files, 2) Deletes media from Supabase storage, 3) Deletes item_links records, 4) Deletes the item record. Handle errors gracefully.
- **Rationale**: Data integrity - orphaned media files should not remain in storage after item deletion.
- **Estimated Effort**: M (4-6 hours)

### Step 14: Testing and Edge Case Handling
- **Description**: Write unit tests for the property context, integration tests for filtering behavior, and manual testing for all CRUD operations. Test edge cases: no properties, property deleted while selected, concurrent operations.
- **Rationale**: Quality assurance before release.
- **Estimated Effort**: M (4-6 hours)

## Authorized Files and Functions for Modification

> **APPROVED SCOPE**: Changes outside this list require review

### Property Context System (Steps 1-4)

| File | Target | Type |
|------|--------|------|
| `src/contexts/PropertyContext.tsx` | -- | Create |
| `src/hooks/usePropertyContext.ts` | -- | Create |
| `src/app/dashboard2/layout.tsx` | `DashboardLayout` | Modify |
| `src/components/dashboard/PropertyDropdown.tsx` | -- | Create |
| `src/components/dashboard/index.ts` | -- | Create (barrel export) |

### Default Property Auto-Creation (Step 5)

| File | Target | Type |
|------|--------|------|
| `src/lib/property-utils.ts` | -- | Create |
| `src/app/api/user/properties/default/route.ts` | -- | Create |
| `src/contexts/AuthContext.tsx` | `AuthProvider` | Modify (add property check) |

### API Updates (Step 6)

| File | Target | Type |
|------|--------|------|
| `src/app/api/admin/items/route.ts` | `GET` | Modify |
| `src/app/api/user/dashboard/stats/route.ts` | `GET` | Modify |
| `src/hooks/useDashboardStats.ts` | `useDashboardStats()` | Modify |
| `src/lib/api.ts` | -- | Modify (if needed for property param) |

### Dashboard Page Updates (Steps 7-8)

| File | Target | Type |
|------|--------|------|
| `src/app/dashboard2/page.tsx` | -- | Modify |
| `src/app/dashboard2/items/page.tsx` | -- | Modify |
| `src/app/dashboard2/create/page.tsx` | -- | Modify |
| `src/components/SimpleDashboard/ProgressivePropertySection.tsx` | -- | Modify |
| `src/components/SimpleDashboard/StatisticsCards.tsx` | -- | Modify |

### Item Management (Steps 9-13)

| File | Target | Type |
|------|--------|------|
| `src/components/dashboard/ItemViewModal.tsx` | -- | Create |
| `src/components/dashboard/ItemActionButtons.tsx` | -- | Create |
| `src/components/dashboard/DeleteItemDialog.tsx` | -- | Create |
| `src/app/dashboard2/items/[publicId]/edit/page.tsx` | -- | Create |
| `src/app/api/admin/items/[publicId]/route.ts` | `DELETE` | Modify |
| `src/lib/item-utils.ts` | `deleteItemWithMedia()` | Create |
| `src/types/index.ts` | `ItemWithMedia` | Extend |

### Type Definitions

| File | Target | Type |
|------|--------|------|
| `src/types/index.ts` | `PropertyContext` interface | Create |
| `src/types/index.ts` | `ItemViewModalProps` interface | Create |
| `src/types/index.ts` | `DeleteItemDialogProps` interface | Create |

## Dependencies

### Internal Dependencies
- REQ-134: Property-based filtering (partially implemented) - provides groundwork for property context
- AuthContext: User authentication and account context - required for property ownership
- useDashboardStats: Dashboard statistics hook - needs property filtering extension

### External Dependencies
- Supabase: Database operations and storage (media files)
- Radix UI Dialog: Modal implementation (already in use)
- localStorage API: Browser storage for persistence
- Lucide React: Icons for UI elements

## Risks and Considerations

### Potential Side Effects
- **AuthContext complexity**: Adding property auto-creation to auth flow increases complexity. Consider a separate initialization hook instead.
- **Data inconsistency**: If a property is deleted while selected, all filtered views will show empty data. Need graceful fallback to "All Properties" or first available.
- **Performance**: Property filtering adds query parameters to multiple endpoints. Monitor for N+1 query patterns.
- **Storage cleanup**: Cascading media deletion from Supabase storage could fail partially. Need transaction-like error handling.

### Testing Requirements
- **Unit tests**: PropertyContext, usePropertyContext hook, property-utils functions
- **Integration tests**: Property filtering end-to-end, item deletion with media
- **Edge case tests**: Zero properties, property deletion while selected, concurrent create/delete operations
- **Manual testing**: Cross-browser localStorage behavior, mobile responsiveness of PropertyDropdown

### Open Questions
- [ ] Should the PropertyDropdown show property type icons or just names?
- [ ] What is the desired behavior when a user has 50+ properties? Virtual scrolling needed?
- [ ] Should deleted items be soft-deleted (archived) or hard-deleted?
- [ ] Is there a maximum media file count per item that affects deletion UX?
- [ ] Should the default property creation include a default property type, or require user selection?

## Out of Scope

Per the original request, the following are explicitly **out of scope**:

- **QR code display in View modal**: The view modal explicitly excludes QR codes
- **Bulk item operations**: Only single-item View, Edit, Delete are included (bulk operations exist elsewhere)
- **Property CRUD from dashboard**: This feature adds property selection, not property creation/editing/deletion from the dashboard
- **Cross-account property sharing**: Properties belong to a single user within an account
- **Analytics per property**: While filtering affects statistics display, detailed per-property analytics is not included
- **Mobile app support**: This is a web-only implementation
- **Admin override of property context**: Admins use existing admin routes, not the dashboard property context

---
*Document generated: 2026-01-08 16:45:00 UTC*
