# REQ-127: Implement Print QR Code Navigation Logic - Technical Overview

**Document Created:** 2026-01-06 15:45:00 UTC
**Last Modified:** 2026-01-06 15:45:00 UTC
**Request ID:** REQ-127
**Request Type:** ENHANCEMENT
**Size:** S (Small)
**Phase:** 3 - Fix Action Buttons Layout + Add Print QR
**Task ID:** 3.2

---

## 1. Request Summary

### 1.1 Original Request
When a user initiates the QR code printing action, the system should intelligently route them either directly to the print interface (for single-property accounts) or to a property selection screen (for multi-property accounts).

### 1.2 Business Value
- Reduces friction in the QR code generation workflow for single-property users
- Improves task completion time and user satisfaction
- Maintains flexibility for multi-property users to select which property's QR code to print

### 1.3 Acceptance Criteria
- [ ] When a user with one property clicks print QR code, they navigate directly to the print interface showing that property's QR code
- [ ] When a user with multiple properties clicks print QR code, they navigate to a property selection screen
- [ ] The property count determination is accurate and reflects the user's current accessible properties
- [ ] The navigation transition occurs without perceptible delay or loading states between decision and routing
- [ ] If property count cannot be determined, the system defaults to the multi-property flow (property selector first)

---

## 2. Current State Assessment

### 2.1 What Already Exists

#### ActionButtons Component (PARTIALLY COMPLETE)
**Location:** `/src/components/SimpleDashboard/ActionButtons.tsx`

The ActionButtons component already contains navigation logic for the Print QR Code button:

```typescript
// Lines 129-144 - Current implementation
const handlePrintQRCode = () => {
  if (onPrintClick) {
    onPrintClick();
    return;
  }

  // Property-based navigation per PRD Feature 2.3
  if (userProperties && userProperties.length === 1) {
    // Single property: Navigate directly to print flow
    router.push(`/dashboard2/print/${userProperties[0].id}`);
  } else {
    // Multiple properties or no properties: Show property selector
    router.push('/dashboard2/print');
  }
};
```

**Status:** Logic is correct but routes don't exist yet.

#### AuthContext - userProperties Access (COMPLETE)
**Location:** `/src/contexts/AuthContext.tsx`

The AuthContext provides `userProperties` which is an array of `Property` objects:
- Property interface includes `id`, `nickname`, `property_types`, and `users` fields
- Available via `useAuth()` hook: `const { userProperties } = useAuth();`
- The ActionButtons component already imports and uses this correctly (line 121)

#### QRCodePrintManager Component (COMPLETE)
**Location:** `/src/components/QRCodePrintManager.tsx`

A complete print workflow component that handles:
- Item selection from property items
- QR code generation with batch processing
- Print preview with configurable settings
- PDF export functionality
- Multi-step wizard interface (select → configure → preview)

**Props Interface:**
```typescript
interface QRCodePrintManagerProps {
  propertyId: string;           // Required - property to show items for
  items?: Item[];               // Optional - pre-loaded items
  onClose: () => void;          // Required - callback to close the manager
  isLoadingItems?: boolean;     // Optional - external loading state
  className?: string;           // Optional - styling
}
```

#### PropertySelector Component (COMPLETE)
**Location:** `/src/components/PropertySelector.tsx`

A dropdown component for selecting from available properties:
- Supports single and multi-property scenarios
- Keyboard navigation with ARIA support
- Size variants (sm, md, lg) and display variants (default, compact)
- "All Properties" option for aggregate views

### 2.2 What's Missing

| Component | Status | Description |
|-----------|--------|-------------|
| `/src/app/dashboard2/print/page.tsx` | **MISSING** | Property selector page for multi-property users |
| `/src/app/dashboard2/print/[propertyId]/page.tsx` | **MISSING** | Print flow page integrating QRCodePrintManager |

---

## 3. Technical Context

### 3.1 Tech Stack (Verified)
| Technology | Details |
|------------|---------|
| Framework | Next.js 15.5.9 (App Router, Turbopack) |
| Language | TypeScript 5.x |
| Styling | Tailwind CSS 4 |
| State Management | React Context (AuthContext) |
| UI Components | Custom components + Radix UI primitives |
| Icons | Lucide React |
| Database | Supabase (PostgreSQL) with RLS |
| Authentication | Supabase Auth with AuthContext |

### 3.2 Existing Patterns to Follow

#### Page Structure Pattern
Based on existing `/src/app/dashboard2/page.tsx`:
```typescript
'use client';

import { useAuth } from '@/contexts/AuthContext';
// Additional imports...

export default function PageName() {
  const { user, userProperties } = useAuth();
  // Component logic
  return (/* JSX */);
}
```

#### Airbnb Design System Tokens
| Token | Tailwind Class | Usage |
|-------|----------------|-------|
| Primary CTA | `bg-gradient-to-r from-[#E61E4D] to-[#D70466]` | Primary buttons |
| Primary Text | `text-[#222222]` | Headings, body |
| Secondary Text | `text-[#717171]` | Descriptions |
| Border | `border-[#DDDDDD]` | Cards, dividers |
| Card Radius | `rounded-xl` | Card components |
| Button Radius | `rounded-lg` | Buttons |

### 3.3 Navigation Pattern
Based on ActionButtons component:
```typescript
const router = useRouter();
router.push('/dashboard2/path');
```

---

## 4. Implementation Tasks

### Task 4.1: Create Print Property Selector Page
**File:** `/src/app/dashboard2/print/page.tsx` (NEW)

**Purpose:** Display a property selector for multi-property users before proceeding to print flow.

**Implementation Details:**
1. Import AuthContext to access `userProperties`
2. Display a grid of property cards (similar to PropertySelector pattern)
3. Each card shows:
   - Property nickname
   - Property type (if available)
   - Item count for that property (optional enhancement)
4. On property card click, navigate to `/dashboard2/print/[propertyId]`
5. Include "Cancel" button to return to dashboard
6. Handle edge cases:
   - Loading state while properties load
   - Error state if properties fail to load
   - Empty state if user has no properties

**Estimated Size:** ~100-150 lines

### Task 4.2: Create Print Flow Page (Dynamic Route)
**File:** `/src/app/dashboard2/print/[propertyId]/page.tsx` (NEW)

**Purpose:** Host the QRCodePrintManager component for a specific property.

**Implementation Details:**
1. Extract `propertyId` from URL params using `useParams()`
2. Fetch items for the specified property using existing API
3. Validate that user has access to the specified property
4. Integrate QRCodePrintManager component with:
   - `propertyId` from URL
   - `items` from API fetch
   - `onClose` callback to navigate back
5. Handle edge cases:
   - Invalid propertyId (redirect to selector)
   - Property not found (show error)
   - No items for property (handled by QRCodePrintManager)

**Estimated Size:** ~80-120 lines

### Task 4.3: Verify ActionButtons Navigation Logic
**File:** `/src/components/SimpleDashboard/ActionButtons.tsx` (EXISTING)

**Purpose:** Confirm existing logic handles all edge cases correctly.

**Current Logic (Lines 129-144):**
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

**Edge Cases to Verify:**
- [ ] `userProperties` is undefined → routes to `/dashboard2/print`
- [ ] `userProperties` is empty array → routes to `/dashboard2/print`
- [ ] `userProperties` has exactly 1 property → routes to `/dashboard2/print/[id]`
- [ ] `userProperties` has 2+ properties → routes to `/dashboard2/print`

**Status:** Logic appears correct. No code changes needed, only testing.

---

## 5. Authorized Files and Functions for Modification

### 5.1 Files to CREATE

| File Path | Purpose | Priority |
|-----------|---------|----------|
| `/src/app/dashboard2/print/page.tsx` | Property selector for multi-property users | P0 |
| `/src/app/dashboard2/print/[propertyId]/page.tsx` | Print flow with QRCodePrintManager | P0 |

### 5.2 Files to VERIFY (No Changes Expected)

| File Path | Scope | Reason |
|-----------|-------|--------|
| `/src/components/SimpleDashboard/ActionButtons.tsx` | `handlePrintQRCode` function (lines 129-144) | Verify navigation logic handles edge cases |

### 5.3 Files to REFERENCE (Read-Only)

| File Path | Reference Purpose |
|-----------|-------------------|
| `/src/components/QRCodePrintManager.tsx` | Integration API for print flow |
| `/src/components/PropertySelector.tsx` | UI pattern for property selection |
| `/src/contexts/AuthContext.tsx` | `userProperties` access pattern |
| `/src/app/dashboard2/layout.tsx` | Layout structure for new pages |
| `/src/app/dashboard2/page.tsx` | Page component pattern |

---

## 6. Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        User Clicks "Print QR Code"                   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│             ActionButtons.handlePrintQRCode() [Line 129]            │
│                                                                      │
│   const { userProperties } = useAuth();                             │
│                                                                      │
│   if (userProperties?.length === 1) {                               │
│     router.push(`/dashboard2/print/${userProperties[0].id}`);       │
│   } else {                                                           │
│     router.push('/dashboard2/print');                                │
│   }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
          │                                     │
          │ Single Property                     │ Multiple/Zero Properties
          ▼                                     ▼
┌──────────────────────────┐      ┌──────────────────────────────────┐
│  /dashboard2/print/[id]  │      │      /dashboard2/print           │
│                          │      │                                   │
│  - Extract propertyId    │      │  - Show PropertySelector grid    │
│  - Fetch items for prop  │      │  - On selection, navigate to     │
│  - Render QRCodePrint-   │      │    /dashboard2/print/[id]        │
│    Manager               │      │                                   │
└──────────────────────────┘      └──────────────────────────────────┘
                                              │
                                              │ Property Selected
                                              ▼
                                  ┌──────────────────────────┐
                                  │  /dashboard2/print/[id]  │
                                  └──────────────────────────┘
```

---

## 7. API Endpoints Required

### 7.1 Existing Endpoints (No Changes)

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/items` | GET | Fetch items by propertyId | EXISTS |
| `/api/user/dashboard/stats` | GET | Dashboard statistics | EXISTS |

### 7.2 New Endpoints Required

None - all required API endpoints already exist.

---

## 8. Component Integration Details

### 8.1 QRCodePrintManager Integration

**Required Props:**
```typescript
<QRCodePrintManager
  propertyId={propertyId}        // From URL params
  items={items}                   // From API fetch
  onClose={() => router.back()}   // Or router.push('/dashboard2')
  isLoadingItems={isLoading}      // From fetch state
/>
```

**Items Fetch Pattern:**
```typescript
// Use existing API pattern from dashboard
const fetchItems = async (propertyId: string) => {
  const response = await fetch(`/api/items?propertyId=${propertyId}`);
  if (!response.ok) throw new Error('Failed to fetch items');
  const data = await response.json();
  return data.items || [];
};
```

### 8.2 Property Validation

Before rendering print flow, validate property access:
```typescript
const { userProperties } = useAuth();
const isValidProperty = userProperties?.some(p => p.id === propertyId);

if (!isValidProperty) {
  router.replace('/dashboard2/print'); // Redirect to selector
  return null;
}
```

---

## 9. UI/UX Specifications

### 9.1 Property Selector Page (`/dashboard2/print/page.tsx`)

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────┐
│  [← Back to Dashboard]                                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Select a Property                                                   │
│  Choose which property's QR codes you want to print                 │
│                                                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │  Property 1     │  │  Property 2     │  │  Property 3     │     │
│  │  Apartment      │  │  House          │  │  Office         │     │
│  │  [12 items]     │  │  [8 items]      │  │  [15 items]     │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Styling:**
- Cards: `bg-white rounded-xl shadow-sm border border-[#DDDDDD] hover:border-[#FF385C]`
- Title: `text-2xl font-bold text-[#222222]`
- Subtitle: `text-[#717171]`
- Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`

### 9.2 Print Flow Page (`/dashboard2/print/[propertyId]/page.tsx`)

**Layout:**
- Full-width container for QRCodePrintManager
- Back button in top-left corner
- Property name displayed as context

---

## 10. Error Handling

### 10.1 Edge Cases

| Scenario | Handling |
|----------|----------|
| No properties | Show empty state with "Add Property" CTA |
| Property not found | Redirect to selector with toast message |
| No items for property | Handled by QRCodePrintManager (built-in) |
| API error | Show error state with retry option |
| Auth not loaded | Show loading spinner |

### 10.2 Error Messages

| Error | User Message |
|-------|--------------|
| Property not found | "Property not found. Please select a property from the list." |
| No properties | "You don't have any properties yet. Add a property to get started." |
| Items fetch failed | "Unable to load items. Please try again." |

---

## 11. Testing Checklist

### 11.1 Navigation Logic
- [ ] Click "Print QR Code" with 1 property → Goes to `/dashboard2/print/[id]`
- [ ] Click "Print QR Code" with 2+ properties → Goes to `/dashboard2/print`
- [ ] Click "Print QR Code" with 0 properties → Goes to `/dashboard2/print`
- [ ] Direct URL access to valid `/dashboard2/print/[id]` → Shows print flow
- [ ] Direct URL access to invalid `/dashboard2/print/[id]` → Redirects to selector

### 11.2 Property Selector Page
- [ ] Displays all user properties in grid
- [ ] Shows property name and type
- [ ] Clicking property card navigates to print flow
- [ ] Back button returns to dashboard
- [ ] Loading state displays correctly
- [ ] Empty state displays when no properties

### 11.3 Print Flow Page
- [ ] QRCodePrintManager renders with correct property
- [ ] Items load for selected property
- [ ] Close/cancel returns to dashboard or selector
- [ ] All QRCodePrintManager features work correctly

---

## 12. Dependencies

### 12.1 Upstream Dependencies
| Dependency | Status | Impact |
|------------|--------|--------|
| ActionButtons component | COMPLETE | Navigation source |
| AuthContext userProperties | COMPLETE | Property count logic |
| QRCodePrintManager | COMPLETE | Print flow UI |
| PropertySelector | COMPLETE | UI pattern reference |

### 12.2 Downstream Dependencies
None - this task completes Phase 3 Task 3.2.

---

## 13. Effort Estimate

| Task | Complexity | Estimate |
|------|------------|----------|
| Create `/dashboard2/print/page.tsx` | Low-Medium | 2-3 hours |
| Create `/dashboard2/print/[propertyId]/page.tsx` | Low | 1-2 hours |
| Verify ActionButtons logic | Low | 30 minutes |
| Testing all scenarios | Medium | 1-2 hours |
| **Total** | | **4.5-7.5 hours** |

---

## 14. References

- [PRD: Dashboard 2 - Simple Dashboard](/docs/prd/PRD_Dashboard_2_Simple_Dashboard.md)
- [Implementation Plan (REVISED)](/docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md)
- [Airbnb Design System](/docs/prd/airbnb_designsystem.md)
- [QRCodePrintManager Component](/src/components/QRCodePrintManager.tsx)
- [PropertySelector Component](/src/components/PropertySelector.tsx)
- [ActionButtons Component](/src/components/SimpleDashboard/ActionButtons.tsx)
