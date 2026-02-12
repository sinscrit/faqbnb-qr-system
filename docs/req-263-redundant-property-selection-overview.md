# REQ-263: Eliminate Redundant Property Selection When Printing QR Codes

**Last Modified:** 2026-02-12 13:10 UTC
**Type:** BUG FIX
**Size:** S
**Status:** COMPLETED

## Summary

Users are prompted to select a property again when choosing to print QR codes, even though they already have a property selected in the application header. The system should carry the current property context forward automatically.

## Current Architecture

### Property Context System

The application has a robust property context system:

1. **PropertyContext** (`/src/contexts/PropertyContext.tsx`):
   - Manages `selectedPropertyId` state across dashboard routes
   - Persists selection to localStorage (key: `faqbnb_selected_property_id`)
   - Provides `selectedProperty` object for currently selected property
   - Auto-defaults to first property if no selection persisted

2. **PropertyDropdown** (`/src/components/dashboard/PropertyDropdown.tsx`):
   - Compact selector in dashboard header
   - Uses `usePropertyContext()` hook
   - Allows users to switch between "All Properties" or specific property
   - Only renders for users with 2+ properties

3. **useActiveProperty** (`/src/hooks/useActiveProperty.ts`):
   - Separate hook for print flow (uses key: `faqbnb_active_property_id`)
   - Not connected to PropertyContext

### Print QR Flow

1. **ActionButtons** (`/src/components/SimpleDashboard/ActionButtons.tsx`):
   - "Print QR Code" button handler
   - Checks `userProperties` from AuthContext
   - Single property: routes to `/dashboard2/print/[propertyId]`
   - Multiple properties: routes to `/dashboard2/print` (selector page)

2. **PrintPropertySelectorPage** (`/src/app/dashboard2/print/page.tsx`):
   - Shows property grid for selection
   - Uses `useActiveProperty` hook (NOT PropertyContext)
   - Pre-highlights last used property from localStorage
   - Redirects single-property users to print flow

## Root Cause

The print flow and main dashboard use **different property state systems**:

| Feature | Dashboard Header | Print Flow |
|---------|-----------------|------------|
| Context | `PropertyContext` | `useActiveProperty` |
| Storage Key | `faqbnb_selected_property_id` | `faqbnb_active_property_id` |
| Source | `usePropertyContext()` | Local hook state |

When a user selects a property in the header (PropertyDropdown), it updates `PropertyContext`. But when clicking "Print QR Code", the `ActionButtons` component:
1. Does NOT check PropertyContext's `selectedPropertyId`
2. Only checks if user has single vs multiple properties
3. Routes multi-property users to selector page regardless of header selection

## Solution Approach

**Integrate Print QR flow with PropertyContext:**

1. **Modify ActionButtons.tsx**: Check `PropertyContext.selectedPropertyId` before routing
2. **If property already selected**: Route directly to `/dashboard2/print/[selectedPropertyId]`
3. **If no property selected** (viewing "All Properties"): Show property selector page
4. **Preserve existing behavior**: Single-property users still skip selection

### Flow After Fix

```
User clicks "Print QR Code"
    ↓
Check PropertyContext.selectedPropertyId
    ↓
├── Has selectedPropertyId → /dashboard2/print/[selectedPropertyId]
├── No selection + single property → /dashboard2/print/[propertyId]
└── No selection + multiple properties → /dashboard2/print (selector page)
```

## Files to Modify

| File | Change |
|------|--------|
| `src/components/SimpleDashboard/ActionButtons.tsx` | Use PropertyContext to check current selection |

## Acceptance Criteria

- [x] Property selected in header is used for print QR navigation
- [x] User taken directly to print preview (no intermediate selection)
- [x] "All Properties" selection still shows property selector
- [x] Single-property users still bypass selection (unchanged)
- [x] No regression in print functionality
- [x] TypeScript compilation passes
- [x] Build succeeds

## Technical Notes

- PropertyContext is available via layout wrapper (`Dashboard2LayoutClient`)
- ActionButtons is used within PropertyProvider scope
- No database changes required
- No new components needed
