# REQ-324: Add Translations Navigation Link - Implementation Overview

**Generated:** 2026-01-18 21:30 UTC
**Last Modified:** 2026-01-18 21:30 UTC
**Request Reference:** docs/gen_requests_epic5.md - REQ-324
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Phase:** 4 - Bulk Operations & Management Page
**Task ID:** 4.4
**Size:** S (Small)
**Priority:** P2 - Medium
**Dependencies:** REQ-323 (Translation Management Page must exist at route)

---

## Summary

Add a "Translations" navigation link to the dashboard navigation menu, providing property owners with direct, discoverable access to the Translation Management page. The link should include a Globe icon and appear in the navigation hierarchy alongside existing items.

---

## Technical Context

### Current Navigation Structure

The dashboard layout at `/src/app/dashboard2/layout.tsx` uses a `navigationItems` array to define navigation entries:

```typescript
const navigationItems: NavItem[] = [
  { name: 'Dashboard',   mobileLabel: 'D/B',   href: '/dashboard2',              icon: LayoutDashboard },
  { name: 'Items',       mobileLabel: 'Items', href: '/dashboard2/items',        icon: Package },
  { name: 'Guides',      mobileLabel: 'Guide', href: '/dashboard2/instructions', icon: FileText },
  { name: 'Properties',  mobileLabel: 'Prop.', href: '/dashboard2/properties',   icon: Building2 },
];
```

### Navigation Pattern Analysis

- **Active State**: Determined by `pathname === item.href` or `pathname.startsWith(item.href)` for sub-routes
- **Icon Library**: Lucide React (`lucide-react` v0.525.0)
- **Mobile Labels**: Abbreviated labels for smaller viewports via `mobileLabel` property
- **Styling**: Active items use `border-[#FF385C] text-[#FF385C]`, inactive use gray hover states
- **Accessibility**: Uses `aria-current="page"` for active state

### Target Route

The Translation Management page will be created at `/dashboard2/translations/page.tsx` (REQ-323). This navigation link enables discovery of that page.

---

## Implementation Approach

### Single Task Implementation

This is a small, focused change requiring only modification of the navigation array in the dashboard layout file.

### Icon Selection

Per the implementation plan, either `Globe` or `Languages` icon is acceptable. Analysis:
- `Globe` is already imported and used in `src/components/ItemCapture/components/shared/UrlPreview.tsx`
- `Languages` is available in lucide-react but not currently used

**Recommendation:** Use `Globe` for consistency with existing codebase patterns and to minimize import changes.

### Navigation Position

Per the implementation plan's open question #1, the recommendation is to start as a top-level nav item for visibility. The logical position is after "Properties" as the last item, grouping the content-management items (Items, Guides, Properties) before the meta-management item (Translations).

---

## Detailed Implementation Steps

### Step 1: Import Globe Icon

Add `Globe` to the existing lucide-react import statement.

**Current import:**
```typescript
import { Building2, FileText, LayoutDashboard, Loader2, LogOut, Package } from 'lucide-react';
```

**Updated import:**
```typescript
import { Building2, FileText, Globe, LayoutDashboard, Loader2, LogOut, Package } from 'lucide-react';
```

### Step 2: Add Navigation Item

Add the Translations entry to the `navigationItems` array after Properties:

```typescript
{
  name: 'Translations',
  mobileLabel: 'Trans.',
  href: '/dashboard2/translations',
  icon: Globe,
},
```

### Step 3: Verify Active State Logic

The existing active state logic will automatically work:
```typescript
const isActive =
  pathname === item.href ||
  (item.href !== '/dashboard2' && pathname.startsWith(item.href));
```

This will highlight the Translations nav item when the user is on `/dashboard2/translations` or any sub-route.

---

## Authorized Files and Functions for Modification

| File Path | Type | Modification Scope |
|-----------|------|-------------------|
| `/src/app/dashboard2/layout.tsx` | Modify | Lines 20, 42-67 (import statement and navigationItems array) |

### Functions/Constants Modified

| Name | Location | Change Description |
|------|----------|-------------------|
| Import statement | Line 20 | Add `Globe` to lucide-react import |
| `navigationItems` array | Lines 42-67 | Add new navigation item object |

### Files NOT to Modify

- No new files created (this task adds to existing file only)
- Do not modify navigation rendering logic (it already handles any number of items)
- Do not modify styling/CSS (existing patterns apply automatically)

---

## Code Changes

### Before (layout.tsx lines 20, 42-67)

```typescript
import { Building2, FileText, LayoutDashboard, Loader2, LogOut, Package } from 'lucide-react';

// ...

const navigationItems: NavItem[] = [
  {
    name: 'Dashboard',
    mobileLabel: 'D/B',
    href: '/dashboard2',
    icon: LayoutDashboard,
  },
  {
    name: 'Items',
    mobileLabel: 'Items',
    href: '/dashboard2/items',
    icon: Package,
  },
  {
    name: 'Guides',
    mobileLabel: 'Guide',
    href: '/dashboard2/instructions',
    icon: FileText,
  },
  {
    name: 'Properties',
    mobileLabel: 'Prop.',
    href: '/dashboard2/properties',
    icon: Building2,
  },
];
```

### After

```typescript
import { Building2, FileText, Globe, LayoutDashboard, Loader2, LogOut, Package } from 'lucide-react';

// ...

const navigationItems: NavItem[] = [
  {
    name: 'Dashboard',
    mobileLabel: 'D/B',
    href: '/dashboard2',
    icon: LayoutDashboard,
  },
  {
    name: 'Items',
    mobileLabel: 'Items',
    href: '/dashboard2/items',
    icon: Package,
  },
  {
    name: 'Guides',
    mobileLabel: 'Guide',
    href: '/dashboard2/instructions',
    icon: FileText,
  },
  {
    name: 'Properties',
    mobileLabel: 'Prop.',
    href: '/dashboard2/properties',
    icon: Building2,
  },
  {
    name: 'Translations',
    mobileLabel: 'Trans.',
    href: '/dashboard2/translations',
    icon: Globe,
  },
];
```

---

## Acceptance Criteria Verification

| Criteria | Implementation | Status |
|----------|----------------|--------|
| Navigation menu includes "Translations" menu item | Added to `navigationItems` array | Ready |
| Menu item displays Globe icon | Using `Globe` from lucide-react | Ready |
| Menu item appears in appropriate position | After Properties, as last item | Ready |
| Clicking menu item navigates to Translation Management page | `href: '/dashboard2/translations'` | Ready |
| Menu item is visible from all pages within dashboard | Layout.tsx applies to all dashboard2 routes | Ready |
| Menu item styling consistent with other elements | Uses same `NavItem` interface and rendering | Ready |
| Active state highlights when on Translations page | Existing `isActive` logic handles this | Ready |
| Keyboard accessible | Uses `<button>` with existing focus styles | Ready |
| ARIA labels for screen readers | Uses `aria-current="page"` when active | Ready |
| Only displays for authenticated users | Layout already requires auth | Ready |

---

## Dependencies

### Blocking Dependencies

| Dependency | Description | Status |
|------------|-------------|--------|
| REQ-323 | Translation Management Page at `/dashboard2/translations` | Must be created for link to work |

### Non-Blocking (Navigation works but shows 404 until page exists)

The navigation link can be added before REQ-323 is complete. Clicking it will show a 404 page until the Translation Management page is created, but this is acceptable for development workflow.

---

## Testing Checklist

### Manual Testing

- [ ] Navigation item appears in nav bar on all dashboard pages
- [ ] Globe icon displays correctly
- [ ] Mobile label "Trans." displays on narrow viewports
- [ ] Full label "Translations" displays on desktop
- [ ] Click navigates to `/dashboard2/translations`
- [ ] Active state (pink border, pink text) shows when on translations page
- [ ] Keyboard navigation (Tab) includes Translations item
- [ ] Focus ring visible on keyboard focus
- [ ] Screen reader announces "Translations" correctly

### Automated Testing (if applicable)

- [ ] Navigation renders with 5 items (up from 4)
- [ ] Translations item has correct href
- [ ] Active state applied when pathname matches

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Navigation overflow on mobile | Low | Low | Test on narrow viewports; mobile labels are short |
| Link leads to 404 before page exists | Expected | Low | Document dependency on REQ-323 |
| Icon not recognized by users | Low | Low | "Translations" text provides clarity |

---

## Notes

- This is a small, isolated change with minimal risk
- The change follows established patterns exactly
- No new dependencies required
- Consider feature flagging if Translation Management page (REQ-323) is delayed significantly
- Per implementation plan, this can be moved to a Settings submenu later if navigation becomes crowded

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` (Task 4.4)
- Request Definition: `/docs/gen_requests_epic5.md` (REQ-324)
- Target File: `/src/app/dashboard2/layout.tsx`
- Lucide Icons: https://lucide.dev/icons/globe
