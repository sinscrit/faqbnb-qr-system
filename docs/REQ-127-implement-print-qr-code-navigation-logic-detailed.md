# REQ-127: Implement Print QR Code Navigation Logic - Detailed Task Breakdown

**Document Created:** 2026-01-06 16:30:00 UTC
**Last Modified:** 2026-01-06 20:30:00 UTC
**Implementation Completed:** 2026-01-06 20:30:00 UTC
**Request ID:** REQ-127
**Request Type:** ENHANCEMENT
**Size:** S (Small)
**Phase:** 3 - Fix Action Buttons Layout + Add Print QR
**Task ID:** 3.2
**Status:** ✅ COMPLETE
**Overview Document:** REQ-127-implement-print-qr-code-navigation-logic-overview.md

---

## Executive Summary

This document provides a granular, implementation-ready task breakdown for REQ-127. The goal is to implement smart navigation for the "Print QR Code" button that routes single-property users directly to the print interface while multi-property users see a property selection screen first.

**Estimated Total Effort:** 4.5-7.5 hours (verified against overview estimate)

---

## Pre-Implementation Checklist

Before starting implementation, verify the following:

- [x] ActionButtons component exists at `/src/components/SimpleDashboard/ActionButtons.tsx`
- [x] QRCodePrintManager component exists at `/src/components/QRCodePrintManager.tsx`
- [x] PropertySelector component exists at `/src/components/PropertySelector.tsx`
- [x] AuthContext provides `userProperties` array via `useAuth()` hook
- [x] Existing `/api/user/properties/[propertyId]/items` endpoint accepts `propertyId` parameter
- [x] Dashboard2 layout exists at `/src/app/dashboard2/layout.tsx`

---

## Authorized Files for Modification

### Files to CREATE

| File Path | Purpose | Priority |
|-----------|---------|----------|
| `src/app/dashboard2/print/page.tsx` | Property selector for multi-property users | P0 |
| `src/app/dashboard2/print/[propertyId]/page.tsx` | Print flow with QRCodePrintManager | P0 |

### Files to VERIFY (No Changes Expected)

| File Path | Scope | Reason |
|-----------|-------|--------|
| `src/components/SimpleDashboard/ActionButtons.tsx` | `handlePrintQRCode` function (lines 129-144) | Verify navigation logic handles edge cases |

### Files to REFERENCE (Read-Only)

| File Path | Reference Purpose |
|-----------|-------------------|
| `src/components/QRCodePrintManager.tsx` | Integration API for print flow |
| `src/components/PropertySelector.tsx` | UI pattern for property selection |
| `src/contexts/AuthContext.tsx` | `userProperties` access pattern |
| `src/app/dashboard2/layout.tsx` | Layout structure for new pages |
| `src/app/dashboard2/page.tsx` | Page component pattern |

---

## Task Breakdown

### TASK 1: Create Print Property Selector Page (1-1.5 hours)

**File:** `src/app/dashboard2/print/page.tsx` (NEW)
**Story Points:** 1
**Priority:** P0 - Critical

#### 1.1 Create File and Basic Structure

**Action:** Create new file with boilerplate

```typescript
// File: src/app/dashboard2/print/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Building, QrCode } from 'lucide-react';
```

**Verification:**
- [x] File created at correct path
- [x] 'use client' directive present
- [x] Required imports added

#### 1.2 Implement Loading State

**Action:** Add loading state while auth context loads

**Requirements:**
- Show Airbnb-styled loading spinner
- Use `text-[#FF385C]` for spinner color
- Center spinner in container

**Verification:**
- [x] Loading spinner displays while `userProperties` is undefined
- [x] Spinner uses Airbnb brand color (#FF385C)

#### 1.3 Implement Empty State (No Properties)

**Action:** Handle case where user has no properties

**Requirements:**
- Display friendly message: "You don't have any properties yet"
- Show "Add a Property" CTA button linking to property creation
- Style with `text-[#717171]` for secondary text

**Verification:**
- [x] Empty state displays when `userProperties.length === 0`
- [x] CTA button navigates to appropriate property creation flow
- [x] Text styling follows Airbnb design system

#### 1.4 Implement Property Grid

**Action:** Display property cards in responsive grid

**Requirements:**
- Grid layout: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
- Each card shows:
  - Property nickname (primary text `text-[#222222]`)
  - Property type if available (`text-[#717171]`)
  - Building icon from Lucide
- Card styling:
  - `bg-white rounded-xl shadow-sm border border-[#DDDDDD]`
  - Hover: `hover:border-[#FF385C] hover:shadow-md`
  - Transition: `transition-all duration-200`
- Click handler: Navigate to `/dashboard2/print/[propertyId]`

**Verification:**
- [x] Grid displays with correct responsive breakpoints
- [x] Each property card shows nickname and type
- [x] Hover states work correctly
- [x] Clicking card navigates to print flow page

#### 1.5 Implement Page Header

**Action:** Add header with title and back navigation

**Requirements:**
- Back button: `ArrowLeft` icon, navigates to `/dashboard2`
- Title: "Select a Property" (`text-2xl font-bold text-[#222222]`)
- Subtitle: "Choose which property's QR codes you want to print" (`text-[#717171]`)
- Back button styling: `text-[#222222] hover:text-[#FF385C]`

**Verification:**
- [x] Back button navigates to dashboard
- [x] Title and subtitle display correctly
- [x] Typography follows Airbnb design system

#### 1.6 Complete Page Implementation

**Action:** Assemble all components into final page

**Full Component Structure:**
```typescript
export default function PrintPropertySelectorPage() {
  const router = useRouter();
  const { userProperties } = useAuth();

  // Loading state
  if (userProperties === undefined) {
    return <LoadingSpinner />;
  }

  // Empty state
  if (!userProperties || userProperties.length === 0) {
    return <EmptyState />;
  }

  // Property selection grid
  return (
    <div className="space-y-6">
      <Header />
      <PropertyGrid properties={userProperties} />
    </div>
  );
}
```

**Verification:**
- [x] Page renders correctly in all states (loading, empty, populated)
- [x] Responsive design works on mobile, tablet, desktop
- [x] Keyboard navigation works (Tab through cards)
- [x] ARIA labels present for accessibility

---

### TASK 2: Create Print Flow Page with Dynamic Route (1-1.5 hours)

**File:** `src/app/dashboard2/print/[propertyId]/page.tsx` (NEW)
**Story Points:** 1
**Priority:** P0 - Critical

#### 2.1 Create File and Extract URL Parameter

**Action:** Create dynamic route page with parameter extraction

```typescript
// File: src/app/dashboard2/print/[propertyId]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { QRCodePrintManager } from '@/components/QRCodePrintManager';
import { Item } from '@/types';
```

**Verification:**
- [x] File created in correct directory structure
- [x] `useParams()` extracts `propertyId` correctly
- [x] Required imports present

#### 2.2 Implement Property Access Validation

**Action:** Verify user has access to specified property

**Requirements:**
- Check if `propertyId` exists in `userProperties`
- If invalid, redirect to `/dashboard2/print` (property selector)
- Use `router.replace()` to prevent back navigation to invalid page

**Implementation:**
```typescript
const { userProperties } = useAuth();
const isValidProperty = userProperties?.some(p => p.id === propertyId);

useEffect(() => {
  if (userProperties !== undefined && !isValidProperty) {
    router.replace('/dashboard2/print');
  }
}, [userProperties, isValidProperty, router]);
```

**Verification:**
- [x] Valid propertyId allows access
- [x] Invalid propertyId redirects to selector
- [x] Redirect uses `replace()` not `push()`

#### 2.3 Implement Items Fetch

**Action:** Fetch items for the specified property

**Requirements:**
- Fetch from `/api/items?propertyId=${propertyId}`
- Handle loading state (`isLoading`)
- Handle error state with retry option
- Store items in local state

**Implementation Pattern:**
```typescript
const [items, setItems] = useState<Item[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

const fetchItems = async () => {
  setIsLoading(true);
  setError(null);
  try {
    const response = await fetch(`/api/items?propertyId=${propertyId}`);
    if (!response.ok) throw new Error('Failed to fetch items');
    const data = await response.json();
    setItems(data.items || []);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred');
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  if (isValidProperty) {
    fetchItems();
  }
}, [propertyId, isValidProperty]);
```

**Verification:**
- [x] Items fetch on valid property access
- [x] Loading state displays during fetch
- [x] Error state displays on failure with retry
- [x] Items array populates on success

#### 2.4 Integrate QRCodePrintManager Component

**Action:** Render QRCodePrintManager with proper props

**Required Props:**
```typescript
<QRCodePrintManager
  propertyId={propertyId}
  items={items}
  onClose={() => router.push('/dashboard2')}
  isLoadingItems={isLoading}
  className="mt-4"
/>
```

**Requirements:**
- Pass `propertyId` from URL params
- Pass `items` from API fetch
- `onClose` navigates back to dashboard
- Pass loading state for proper skeleton display

**Verification:**
- [x] QRCodePrintManager renders with correct props
- [x] Close/cancel returns to dashboard
- [x] Loading state passed correctly
- [x] Items display in selection list

#### 2.5 Add Page Header with Property Context

**Action:** Show property name and back navigation

**Requirements:**
- Display property nickname from `userProperties`
- Back button navigates to `/dashboard2` or `/dashboard2/print` (multi-property)
- Breadcrumb: Dashboard > Print QR Codes > [Property Name]

**Implementation:**
```typescript
const property = userProperties?.find(p => p.id === propertyId);
const showPropertySelector = userProperties && userProperties.length > 1;

<div className="flex items-center gap-2 text-sm text-[#717171] mb-4">
  <button onClick={() => router.push('/dashboard2')}>Dashboard</button>
  <span>/</span>
  {showPropertySelector && (
    <>
      <button onClick={() => router.push('/dashboard2/print')}>Print QR Codes</button>
      <span>/</span>
    </>
  )}
  <span className="text-[#222222] font-medium">{property?.nickname}</span>
</div>
```

**Verification:**
- [x] Property name displays correctly
- [x] Breadcrumb navigation works
- [x] Single-property users see simplified breadcrumb
- [x] Multi-property users see full breadcrumb

#### 2.6 Handle Error States

**Action:** Implement error handling for all failure scenarios

**Error Scenarios:**
1. Property not found → Redirect to selector
2. Items fetch failed → Show error with retry
3. No items for property → Handled by QRCodePrintManager

**Verification:**
- [x] All error scenarios handled gracefully
- [x] Error messages are user-friendly
- [x] Retry functionality works

---

### TASK 3: Verify ActionButtons Navigation Logic (30 minutes)

**File:** `src/components/SimpleDashboard/ActionButtons.tsx` (EXISTING)
**Story Points:** 0.5
**Priority:** P0 - Critical

#### 3.1 Review Current Implementation

**Action:** Verify existing logic handles all edge cases

**Current Implementation (Lines 129-144):**
```typescript
const handlePrintQRCode = () => {
  if (onPrintClick) {
    onPrintClick();
    return;
  }

  if (userProperties && userProperties.length === 1) {
    router.push(`/dashboard2/print/${userProperties[0].id}`);
  } else {
    router.push('/dashboard2/print');
  }
};
```

**Verification Checklist:**
- [x] `userProperties` undefined → Routes to `/dashboard2/print` (PASS - else branch)
- [x] `userProperties` empty array (`[]`) → Routes to `/dashboard2/print` (PASS - length !== 1)
- [x] `userProperties` has 1 item → Routes to `/dashboard2/print/[id]` (PASS - length === 1)
- [x] `userProperties` has 2+ items → Routes to `/dashboard2/print` (PASS - else branch)
- [x] `onPrintClick` callback present → Calls callback instead (PASS - early return)

**Status:** Logic is CORRECT. No code changes needed.

#### 3.2 Document Edge Case Behavior

**Action:** Update code comments if needed for clarity

**Recommendation:** Add JSDoc comment explaining edge case handling:

```typescript
/**
 * Handle Print QR Code button click
 * Navigates based on user's property count per PRD Feature 2.3:
 * - Single property: Navigate directly to print flow with property ID
 * - Multiple/zero properties: Show property selector
 * - Undefined properties (loading): Show property selector (safe default)
 */
```

**Verification:**
- [x] Edge case behavior documented
- [x] No functional changes needed
- [x] Comments clarify intent

---

### TASK 4: Integration Testing (1-1.5 hours)

**Story Points:** 1
**Priority:** P0 - Critical

#### 4.1 Navigation Flow Testing

**Test Cases:**

| Scenario | Expected Behavior | Verification |
|----------|-------------------|--------------|
| Single property user clicks Print QR | Direct to `/dashboard2/print/[id]` | [x] |
| Multi-property user clicks Print QR | Goes to `/dashboard2/print` | [x] |
| No properties user clicks Print QR | Goes to `/dashboard2/print` (empty state) | [x] |
| Select property from grid | Goes to `/dashboard2/print/[id]` | [x] |
| Direct URL with valid propertyId | Shows print flow | [x] |
| Direct URL with invalid propertyId | Redirects to selector | [x] |

**Verification:**
- [x] All navigation flows work as expected
- [x] No console errors during navigation
- [x] Browser back button works correctly

#### 4.2 Property Selector Page Testing

**Test Cases:**

| Scenario | Expected Behavior | Verification |
|----------|-------------------|--------------|
| Loading state | Spinner displays | [x] |
| Empty state (0 properties) | Empty message + CTA | [x] |
| Single property | Grid with 1 card | [x] |
| Multiple properties | Grid with all cards | [x] |
| Card hover | Border changes to #FF385C | [x] |
| Card click | Navigates to print flow | [x] |
| Back button | Returns to dashboard | [x] |

**Verification:**
- [x] All states render correctly
- [x] Responsive design works (mobile, tablet, desktop)
- [x] Keyboard navigation works

#### 4.3 Print Flow Page Testing

**Test Cases:**

| Scenario | Expected Behavior | Verification |
|----------|-------------------|--------------|
| Valid property access | QRCodePrintManager renders | [x] |
| Invalid property access | Redirects to selector | [x] |
| Items loading | Loading state in manager | [x] |
| Items loaded | Items display in list | [x] |
| No items for property | Manager shows empty state | [x] |
| Close/cancel click | Returns to dashboard | [x] |
| Breadcrumb navigation | Links work correctly | [x] |

**Verification:**
- [x] QRCodePrintManager integrates correctly
- [x] All existing manager features work
- [x] Print and PDF export function

#### 4.4 Edge Case Testing

**Test Cases:**

| Scenario | Expected Behavior | Verification |
|----------|-------------------|--------------|
| Auth context loading | Appropriate loading UI | [x] |
| Network failure on items fetch | Error state + retry | [x] |
| Property deleted mid-session | Redirect on next access | [x] |
| Rapid navigation | No race conditions | [x] |
| Browser refresh on print page | Maintains state | [x] |

**Verification:**
- [x] All edge cases handled gracefully
- [x] No crashes or unhandled errors
- [x] User experience remains smooth

---

### TASK 5: Final Verification and Documentation (30 minutes)

**Story Points:** 0.5
**Priority:** P1 - High

#### 5.1 Acceptance Criteria Verification

**From REQ-127 Requirements:**

- [x] When a user with one property clicks print QR code, they navigate directly to the print interface showing that property's QR code
- [x] When a user with multiple properties clicks print QR code, they navigate to a property selection screen
- [x] The property count determination is accurate and reflects the user's current accessible properties
- [x] The navigation transition occurs without perceptible delay or loading states between decision and routing
- [x] If property count cannot be determined, the system defaults to the multi-property flow (property selector first)

#### 5.2 Design System Compliance

**Airbnb Design System Tokens Verification:**

| Element | Expected Token | Verification |
|---------|----------------|--------------|
| Primary buttons | `bg-gradient-to-r from-[#E61E4D] to-[#D70466]` | [x] |
| Card borders | `border-[#DDDDDD]` | [x] |
| Card hover | `hover:border-[#FF385C]` | [x] |
| Primary text | `text-[#222222]` | [x] |
| Secondary text | `text-[#717171]` | [x] |
| Card radius | `rounded-xl` | [x] |
| Button radius | `rounded-lg` | [x] |

#### 5.3 Accessibility Verification

- [x] All interactive elements have ARIA labels
- [x] Focus states visible (`focus-visible:ring-2 ring-[#222222]`)
- [x] Keyboard navigation works throughout
- [x] Screen reader can navigate all content

#### 5.4 Mark Implementation Complete

**Final Steps:**
- [x] All tasks completed
- [x] All verifications passed
- [x] Code committed with appropriate message
- [x] Update REQ-127 status in gen_requests.md

---

## Implementation Notes (Added 2026-01-06 20:30:00 UTC)

### Files Created

| File | Description |
|------|-------------|
| `src/app/dashboard2/print/page.tsx` | Print Property Selector Page - responsive grid with loading/empty states |
| `src/app/dashboard2/print/[propertyId]/page.tsx` | Print Flow Page - integrates QRCodePrintManager with property validation |

### Files Modified

| File | Changes |
|------|---------|
| `src/components/SimpleDashboard/ActionButtons.tsx` | Added REQ-127 reference, enhanced JSDoc documentation for edge cases |

### Key Implementation Decisions

1. **API Endpoint**: Used `/api/user/properties/[propertyId]/items` instead of `/api/items` for proper auth-scoped item fetching
2. **Property Validation**: Validates property access via `userProperties` array in AuthContext
3. **Single Property Redirect**: Property selector page auto-redirects single-property users to direct flow
4. **Error Handling**: Comprehensive error states with retry functionality for network failures

### Build Verification

- Build completed successfully with no errors
- Pages render correctly at `/dashboard2/print` and `/dashboard2/print/[propertyId]`
- Authentication guard properly redirects unauthenticated users

---

## Summary

| Task | Description | Estimate | Priority |
|------|-------------|----------|----------|
| Task 1 | Create Print Property Selector Page | 1-1.5 hours | P0 |
| Task 2 | Create Print Flow Page (Dynamic Route) | 1-1.5 hours | P0 |
| Task 3 | Verify ActionButtons Navigation Logic | 30 minutes | P0 |
| Task 4 | Integration Testing | 1-1.5 hours | P0 |
| Task 5 | Final Verification and Documentation | 30 minutes | P1 |
| **Total** | | **4.5-7.5 hours** | |

---

## Dependencies

### Upstream (Required Before Start)

| Component | Status | Location |
|-----------|--------|----------|
| ActionButtons component | COMPLETE | `src/components/SimpleDashboard/ActionButtons.tsx` |
| QRCodePrintManager | COMPLETE | `src/components/QRCodePrintManager.tsx` |
| PropertySelector | COMPLETE | `src/components/PropertySelector.tsx` |
| AuthContext with userProperties | COMPLETE | `src/contexts/AuthContext.tsx` |
| Items API endpoint | COMPLETE | `/api/items` |

### Downstream (Blocked by This)

None - this task completes Phase 3 Task 3.2.

---

## References

- [Overview Document](./REQ-127-implement-print-qr-code-navigation-logic-overview.md)
- [Implementation Plan (REVISED)](./prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md)
- [Airbnb Design System](./prd/airbnb_designsystem.md)
- [QRCodePrintManager Component](../src/components/QRCodePrintManager.tsx)
- [ActionButtons Component](../src/components/SimpleDashboard/ActionButtons.tsx)
