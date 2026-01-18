# REQ-135: Print Flow Property Selector - Implementation Overview

**Created:** 2026-01-06 08:45:00 UTC
**Last Modified:** 2026-01-06 08:45:00 UTC
**Status:** Ready for Implementation
**Phase:** 5 - Multi-Property Enhancements
**Task ID:** 5.2
**PRD Reference:** Plan-001-Simple-Dashboard-Implementation-REVISED.md
**Request Reference:** gen_requests.md - Request #135

---

## Executive Summary

This document provides a detailed implementation breakdown for REQ-135: Print Flow Property Selector. The request enhances the print workflow by requiring users to explicitly select a property before accessing the print configuration screen, preventing errors when users manage multiple properties.

### Current State Assessment

**ALREADY IMPLEMENTED:**
- `/src/app/dashboard2/print/page.tsx` - Property selector page exists (REQ-127)
- `/src/app/dashboard2/print/[propertyId]/page.tsx` - Print flow page exists (REQ-127)
- `ActionButtons` component handles property-based routing logic
- Single-property users are automatically redirected to direct print flow
- Multi-property users see a property selection grid

**GAP ANALYSIS:**
Based on the acceptance criteria in REQ-135, the following features need verification or enhancement:

| Criteria | Status | Gap |
|----------|--------|-----|
| Property selection as first screen | **IMPLEMENTED** | Property selector page exists at `/dashboard2/print` |
| Properties displayed with names/thumbnails | **PARTIAL** | Names displayed, thumbnails not implemented |
| Currently active property pre-selected | **NOT IMPLEMENTED** | No pre-selection based on app state |
| Cannot proceed without selecting property | **IMPLEMENTED** | Users must click a property card |
| Selected property context passed forward | **IMPLEMENTED** | Property ID in URL path |
| Desktop/mobile responsive | **IMPLEMENTED** | Responsive grid with Tailwind classes |
| Single-property accounts skip selector | **IMPLEMENTED** | useEffect redirect logic exists |

---

## Detailed Task Breakdown

### Task 1: Add Property Thumbnail/Image Support
**Priority:** P2 - Enhancement
**Estimated Complexity:** Medium

**Description:** Add optional thumbnail images to property cards for visual identification.

**Files to Modify:**
1. `/src/app/dashboard2/print/page.tsx`
   - Lines 56-95: `PropertyCard` component
   - Add optional `thumbnail` or `image_url` prop handling
   - Add fallback icon when no image available

**Implementation Details:**
```typescript
// In PropertyCard component, add image support:
// Check if property has thumbnail_url or image
// Display image with aspect-ratio-square container
// Fallback to Building icon if no image
```

**Acceptance Criteria:**
- [ ] Property cards display thumbnail images when available
- [ ] Fallback Building icon shown when no image exists
- [ ] Images are responsive and properly sized
- [ ] Image loading states handled gracefully

---

### Task 2: Implement Pre-Selection of Active Property
**Priority:** P1 - Required
**Estimated Complexity:** Medium

**Description:** Pre-select the currently active property in the application state as a default selection.

**Files to Modify:**
1. `/src/app/dashboard2/print/page.tsx`
   - Lines 161-216: `PrintPropertySelectorPage` component
   - Add state for tracking selected property
   - Check for active property from context/session storage

2. `/src/contexts/AuthContext.tsx` (potential)
   - Verify if `activePropertyId` state exists
   - If not, may need to add to context

**Implementation Details:**
```typescript
// Add selected property state
const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

// On mount, check for active property
useEffect(() => {
  const activeProperty = localStorage.getItem('activePropertyId') ||
                         userProperties?.[0]?.id;
  if (activeProperty) {
    setSelectedPropertyId(activeProperty);
  }
}, [userProperties]);

// Highlight pre-selected property in grid
// Add visual indicator (border, checkmark, etc.)
```

**Acceptance Criteria:**
- [ ] Previously selected/active property is visually highlighted
- [ ] Pre-selection persists across navigation
- [ ] Users can still select a different property
- [ ] Edge case: No active property defaults to first in list

---

### Task 3: Add Item Count Display to Property Cards
**Priority:** P2 - Enhancement
**Estimated Complexity:** Low

**Description:** Display the number of items for each property in the property selector cards.

**Files to Modify:**
1. `/src/app/dashboard2/print/page.tsx`
   - Lines 56-95: `PropertyCard` component
   - Add item count display

2. Potentially create `/src/hooks/usePropertyItemCounts.ts`
   - Batch fetch item counts for all properties
   - Or extend Property type to include item_count

**Implementation Details:**
The implementation plan (Task 5.2) specifies:
> "Each card shows property name and item count"

```typescript
// PropertyCard enhancement:
<p className="text-sm text-[#717171] mt-1">
  {itemCount} {itemCount === 1 ? 'item' : 'items'}
</p>
```

**Acceptance Criteria:**
- [ ] Each property card shows its item count
- [ ] Count displays "0 items" gracefully for empty properties
- [ ] Count updates when items are added/removed (via refresh)

---

### Task 4: Enhanced Property Card Styling
**Priority:** P3 - Polish
**Estimated Complexity:** Low

**Description:** Enhance property card styling for better visual hierarchy and selection feedback.

**Files to Modify:**
1. `/src/app/dashboard2/print/page.tsx`
   - Lines 56-95: `PropertyCard` component
   - Lines 100-118: `PropertyGrid` component

**Implementation Details:**
Based on Airbnb Design System requirements:
- Card radius: `rounded-xl` (12px)
- Shadow: `shadow-sm` → `shadow-md` on hover
- Border: `border-[#DDDDDD]` → `border-[#FF385C]` on hover
- Selected state: Add `ring-2 ring-[#FF385C]` for active property

**Acceptance Criteria:**
- [ ] Cards follow Airbnb design system tokens
- [ ] Hover states provide clear visual feedback
- [ ] Selected property has distinct visual indicator
- [ ] Transitions are smooth (200ms duration)

---

### Task 5: Verification and Testing
**Priority:** P0 - Critical
**Estimated Complexity:** Low

**Description:** Verify all existing functionality and acceptance criteria are met.

**Test Scenarios:**
1. **Single property user flow:**
   - Click "Print QR Code" on dashboard
   - Verify direct redirect to `/dashboard2/print/[propertyId]`
   - Verify QRCodePrintManager loads with items

2. **Multi-property user flow:**
   - Click "Print QR Code" on dashboard
   - Verify property selector page displays
   - Verify all properties shown with names
   - Click property card
   - Verify navigation to print flow with correct property

3. **Empty state:**
   - User with no properties
   - Verify empty state message displayed
   - Verify CTA to add property

4. **Mobile responsiveness:**
   - Test on mobile viewport
   - Verify cards stack properly
   - Verify touch targets meet 48px minimum

**Acceptance Criteria:**
- [ ] All test scenarios pass
- [ ] No console errors or warnings
- [ ] Performance acceptable (< 200ms page load)

---

## Authorized Files and Functions for Modification

### Files AUTHORIZED for Modification

| File Path | Modification Scope | Functions/Components |
|-----------|-------------------|---------------------|
| `/src/app/dashboard2/print/page.tsx` | Full file | `PropertyCard`, `PropertyGrid`, `PrintPropertySelectorPage`, `PageHeader`, `EmptyState`, `LoadingSpinner` |
| `/src/app/dashboard2/print/[propertyId]/page.tsx` | Read-only reference | - |
| `/src/components/SimpleDashboard/ActionButtons.tsx` | Minor updates only | `handlePrintQRCode` navigation logic if needed |
| `/src/types/index.ts` | Type additions | Add `thumbnail_url` to Property type if needed |

### Files AUTHORIZED for Creation

| File Path | Purpose |
|-----------|---------|
| `/src/hooks/usePropertyItemCounts.ts` | Hook to fetch item counts per property (optional) |

### Files NOT TO MODIFY

| File Path | Reason |
|-----------|--------|
| `/src/components/QRCodePrintManager.tsx` | Already complete, no changes needed |
| `/src/components/PropertySelector.tsx` | Different use case (dropdown vs cards) |
| `/src/app/dashboard2/page.tsx` | No changes needed for this feature |
| `/src/app/dashboard2/layout.tsx` | No changes needed for this feature |
| `/src/contexts/AuthContext.tsx` | Only modify if absolutely necessary for active property state |

---

## Technical Specifications

### Existing Component Patterns to Follow

**PropertyCard Component (current):**
```typescript
// Located at /src/app/dashboard2/print/page.tsx lines 57-95
function PropertyCard({
  property,
  onClick
}: {
  property: Property;
  onClick: () => void;
}) {
  // Button-based card with hover/focus states
  // Airbnb color scheme: #FF385C, #222222, #717171, #DDDDDD
  // Uses Lucide icons (Building, QrCode)
}
```

**Design System Tokens:**
```css
/* Primary CTA */ bg-gradient-to-r from-[#E61E4D] to-[#D70466]
/* Primary Text */ text-[#222222]
/* Secondary Text */ text-[#717171]
/* Border */ border-[#DDDDDD]
/* Success */ bg-[#00A699]
/* Card Radius */ rounded-xl (12px)
/* Focus Ring */ focus-visible:ring-2 ring-[#222222]
```

### State Management Approach

The current implementation uses:
- `useAuth()` context for `userProperties` and `loading`
- `useRouter()` for navigation
- `useEffect()` for redirect logic

For active property pre-selection, options:
1. **localStorage** - Store `activePropertyId` in browser storage
2. **URL search params** - Pass active property via `?active=propertyId`
3. **AuthContext extension** - Add `activePropertyId` to context (not recommended unless broadly needed)

**Recommended:** localStorage approach for simplicity

---

## Dependencies

### Required Existing Components
- `useAuth` from `/src/contexts/AuthContext`
- `Property` type from `/src/types`
- Lucide icons: `Building`, `QrCode`, `ArrowLeft`, `Loader2`, `Home`

### API Endpoints (Existing)
- `/api/user/properties` - Fetch user properties (via AuthContext)
- `/api/user/properties/[propertyId]/items` - Fetch items for property

### API Endpoints (May Need)
- `/api/user/properties/item-counts` - Batch fetch item counts (optional optimization)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Property thumbnail URLs not in schema | Medium | Low | Use fallback icon, schema migration optional |
| Active property state complexity | Low | Medium | Use localStorage, avoid context changes |
| Item count performance | Low | Low | Lazy load counts, or fetch with properties |
| Breaking single-property redirect | Low | High | Preserve existing useEffect logic |

---

## Implementation Order

1. **Task 5** - Verification (ensure existing functionality works)
2. **Task 2** - Pre-selection of active property
3. **Task 3** - Item count display
4. **Task 4** - Enhanced styling
5. **Task 1** - Thumbnail support (can be deferred)

---

## References

- [Implementation Plan (REVISED)](/docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md)
- [Request #135 in gen_requests.md](/docs/gen_requests.md)
- [Existing Print Page](/src/app/dashboard2/print/page.tsx)
- [ActionButtons Component](/src/components/SimpleDashboard/ActionButtons.tsx)
- [QRCodePrintManager](/src/components/QRCodePrintManager.tsx)
