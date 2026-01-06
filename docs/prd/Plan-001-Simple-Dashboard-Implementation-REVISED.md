# Implementation Plan: Dashboard 2 - Simple Dashboard (REVISED)

**Generated:** 2026-01-06 11:45:00 UTC
**Last Modified:** 2026-01-06 14:30:00 UTC
**PRD Reference:** PRD_Dashboard_2_Simple_Dashboard.md
**Design System Reference:** airbnb_designsystem.md
**Original Plan:** Plan-001-Simple-Dashboard-Implementation.md

---

## Current State Assessment

### COMPLETED WORK (No Changes Needed)

| File | Status | Description |
|------|--------|-------------|
| `/src/app/dashboard2/create/page.tsx` | **COMPLETE** | Full ItemCreationWorkflow integration with backend callbacks |
| `/src/app/dashboard2/items/page.tsx` | **COMPLETE** | Full ItemManager integration with CRUD operations |
| `/src/components/QRCodePrintManager.tsx` | **COMPLETE** | Existing QR code print workflow with PDF export |
| `/src/components/PropertyForm.tsx` | **COMPLETE** | Property create/edit form (reusable) |
| `/src/components/PropertySelector.tsx` | **COMPLETE** | Property dropdown selector (reusable) |

### REQUIRES MODIFICATION

| File | Lines | Issue | PRD Violation |
|------|-------|-------|---------------|
| `/src/app/dashboard2/layout.tsx` | 15, 98-108, 113 | Account references in header, CompactAccountSelector | Design Principle #1: "No account references" |
| `/src/app/dashboard2/layout.tsx` | 41, 101, 139-142 | Blue color scheme (`text-blue-600`, `bg-blue-100`, `border-blue-500`) | Airbnb Design System not applied |
| `/src/app/dashboard2/page.tsx` | 27 | Blue gradient (`from-blue-600 to-blue-700`) | Airbnb Design System not applied |
| `/src/app/dashboard2/page.tsx` | 30-33 | Account name in welcome message | Design Principle #1 |
| `/src/app/dashboard2/page.tsx` | 37-80 | 2 large card layout instead of 3 button row | PRD Feature 2 wireframe mismatch |
| `/src/app/dashboard2/page.tsx` | N/A | Missing "Print QR Code" action button | PRD Feature 2.3 |
| `/src/app/dashboard2/page.tsx` | N/A | Missing Statistics Cards section | PRD Feature 1 |

### MISSING FEATURES (New Implementation Needed)

| Feature | PRD Reference | Priority | Complexity |
|---------|---------------|----------|------------|
| Statistics Cards (Items/Rooms/Tags) | Feature 1 | P0 - Critical | Medium |
| Print QR Code button + flow | Features 2.3, 5 | P0 - Critical | Medium |
| Property Section ("My Property") | Feature 3 | P1 - High | Medium |
| Add Property capability | Feature 4 | P1 - High | Low |
| Dashboard Stats API endpoint | Technical Requirements | P0 - Critical | Low |

---

## Technical Context

### Existing Stack (Verified)

| Technology | Details |
|------------|---------|
| Framework | Next.js 15.5.9 (App Router, Turbopack) |
| Language | TypeScript 5.x |
| Styling | Tailwind CSS 4 |
| State Management | React Context (AuthContext), React useState/useReducer |
| UI Components | Custom components + Radix UI primitives |
| Icons | Lucide React, Heroicons |
| Database | Supabase (PostgreSQL) with Row Level Security |
| Authentication | Supabase Auth with custom AuthContext |
| API Pattern | Next.js API Routes with `apiRequest` helper |

### Existing Reusable Components

| Component | Location | Can Reuse For |
|-----------|----------|---------------|
| `QRCodePrintManager` | `/src/components/QRCodePrintManager.tsx` | Print QR Code flow |
| `PropertyForm` | `/src/components/PropertyForm.tsx` | Property edit/add modals |
| `PropertySelector` | `/src/components/PropertySelector.tsx` | Property selection (multi-property) |
| `ItemSelectionList` | `/src/components/ItemSelectionList.tsx` | QR print item selection |

### Airbnb Design System Tokens (Required)

| Token | Tailwind Class | Current (Wrong) | Required |
|-------|----------------|-----------------|----------|
| Primary CTA | `bg-[#FF385C]` | `bg-blue-600` | Radical Red |
| Primary Text | `text-[#222222]` | `text-gray-900` | Mine Shaft |
| Secondary Text | `text-[#717171]` | `text-gray-600` | - |
| Border | `border-[#DDDDDD]` | `border-gray-300` | - |
| Success | `bg-[#00A699]` | `bg-green-600` | Babu |
| Card Radius | `rounded-xl` (12px) | `rounded-lg` (8px) | - |
| Button Radius | `rounded-lg` (8px) | varies | - |

---

## Revised Implementation Phases

### Phase 1: Fix PRD Violations (Critical Path) - 1 day

**Goal:** Correct existing code to match PRD requirements

**Task 1.1: Remove Account References from Layout**

File: `/src/app/dashboard2/layout.tsx`

- [ ] Remove line 15: `import { CompactAccountSelector } from '@/components/AccountSelector';`
- [ ] Remove lines 98-108: Account type badge and user email display from header
- [ ] Remove line 113: `<CompactAccountSelector onAccountChange={handleAccountChange} className="w-64" />`
- [ ] Remove lines 32-35: `handleAccountChange` function
- [ ] Keep only: FAQBNB logo, navigation tabs, and logout button in header

**Task 1.2: Remove Account References from Dashboard Page**

File: `/src/app/dashboard2/page.tsx`

- [ ] Remove lines 14, 20: `useAccountContext` import and hook
- [ ] Remove lines 30-33: Account name conditional in welcome message
- [ ] Update line 29 to: `<p className="text-[#717171] text-lg">Create and manage your QR code items</p>`

**Task 1.3: Apply Airbnb Design System Colors**

File: `/src/app/dashboard2/layout.tsx`

- [ ] Line 41: Change `text-blue-600` to `text-[#FF385C]` (loader)
- [ ] Line 101: Change `bg-blue-100 text-blue-800` to `bg-gray-100 text-[#222222]` (badge - if kept)
- [ ] Lines 139-142: Change `border-blue-500 text-blue-600` to `border-[#FF385C] text-[#FF385C]` (active nav)

File: `/src/app/dashboard2/page.tsx`

- [ ] Line 27: Change `from-blue-600 to-blue-700` to Airbnb gradient: `from-[#E61E4D] via-[#E31C5F] to-[#D70466]`
- [ ] All `blue-*` classes: Replace with Airbnb color tokens

**Acceptance Criteria Phase 1:**
- [ ] No "account" references visible in UI
- [ ] No CompactAccountSelector rendered
- [ ] All blue colors replaced with Airbnb brand colors
- [ ] Layout matches Airbnb design system

---

### Phase 2: Add Statistics Cards - 1 day

**Goal:** Display Items/Rooms/Tags counts per PRD Feature 1

**Task 2.1: Create Dashboard Stats API**

Create: `/src/app/api/user/dashboard/stats/route.ts`

```typescript
// Response shape:
{
  success: boolean;
  data: {
    itemCount: number;
    roomCount: number;   // Distinct locations from items
    tagCount: number;    // Distinct tags from items
  };
  error?: string;
}
```

- [ ] Query items table for current user's properties
- [ ] Calculate distinct rooms (locations) from items
- [ ] Calculate distinct tags from items
- [ ] Handle zero counts gracefully

**Task 2.2: Create useDashboardStats Hook**

Create: `/src/hooks/useDashboardStats.ts`

- [ ] Fetch from `/api/user/dashboard/stats`
- [ ] Handle loading, error, refresh states
- [ ] Expose `refresh()` function for real-time updates

**Task 2.3: Create StatisticsCards Component**

Create: `/src/components/SimpleDashboard/StatisticsCards.tsx`

- [ ] Three cards in a row: Items, Rooms, Tags
- [ ] Card styling per Airbnb DLS:
  - White background (`bg-white`)
  - 12px border-radius (`rounded-xl`)
  - Subtle shadow (`shadow-sm`)
  - Large number prominent (32px, bold)
  - Label below (14px, `text-[#717171]`)
- [ ] Icons from Lucide: `Package`, `Home`, `Tag`
- [ ] Loading skeleton state (shimmer)
- [ ] Zero state: Display "0" (not "No data")

**Task 2.4: Integrate into Dashboard Page**

File: `/src/app/dashboard2/page.tsx`

- [ ] Import `StatisticsCards` and `useDashboardStats`
- [ ] Add statistics section between welcome header and action buttons
- [ ] Pass stats data and loading state

**Acceptance Criteria Phase 2:**
- [ ] Three statistics cards visible below welcome header
- [ ] Shows real counts from database
- [ ] Shows "0" gracefully for new users
- [ ] Loading skeleton while fetching

---

### Phase 3: Fix Action Buttons Layout + Add Print QR - 1 day

**Goal:** Implement 3-button row per PRD wireframe (Feature 2)

**Task 3.1: Create ActionButtons Component**

Create: `/src/components/SimpleDashboard/ActionButtons.tsx`

PRD Wireframe requires 3 buttons in a row:
```
[+ Create New Item]  [View Items]  [Print QR Code]
```

- [ ] Three equal-width buttons
- [ ] Large touch targets (min 48x48px)
- [ ] Icon + text label
- [ ] Airbnb button styling:
  - Primary (Create): Gradient `from-[#E61E4D] to-[#D70466]`, white text
  - Secondary (View, Print): `bg-white`, `border-[#222222]`, `text-[#222222]`
- [ ] Hover states per Airbnb DLS (scale 1.02, darker bg)

**Task 3.2: Implement Print QR Code Navigation Logic**

Per PRD Feature 2.3 and Feature 5:
- Single property: Direct to print flow
- Multiple properties: Show property selector first

- [ ] Check property count from AuthContext or API
- [ ] If 1 property: Navigate to `/dashboard2/print/[propertyId]`
- [ ] If 2+ properties: Navigate to `/dashboard2/print` (property selector page)

**Task 3.3: Create Print Flow Route**

Create: `/src/app/dashboard2/print/page.tsx`
- [ ] Property selector interface (reuse `PropertySelector`)
- [ ] After selection, navigate to `/dashboard2/print/[propertyId]`

Create: `/src/app/dashboard2/print/[propertyId]/page.tsx`
- [ ] Integrate existing `QRCodePrintManager` component
- [ ] Pass propertyId and items for that property

**Task 3.4: Replace Existing Action Cards**

File: `/src/app/dashboard2/page.tsx`

- [ ] Remove lines 37-80: Current 2-card grid layout
- [ ] Import and render `ActionButtons` component
- [ ] Remove "Feature Highlights" section (lines 82-123) - not in PRD

**Acceptance Criteria Phase 3:**
- [ ] Three action buttons visible in a row
- [ ] "Create New Item" navigates to `/dashboard2/create`
- [ ] "View Items" navigates to `/dashboard2/items`
- [ ] "Print QR Code" opens print flow (direct or via property selector)
- [ ] All buttons styled per Airbnb design system

---

### Phase 4: Property Section - 1-2 days

**Goal:** Implement "My Property" section per PRD Features 3 and 4

**Task 4.1: Create PropertySection Component**

Create: `/src/components/SimpleDashboard/PropertySection.tsx`

Single property view:
```
My Property
[Property Name]                                [>]
```

Multiple property view:
```
My Properties
[Property 1 Name]                              [>]
[Property 2 Name]                              [>]

[+ Add New Property]
```

- [ ] Display "My Property" or "My Properties" based on count
- [ ] Each property row is clickable (opens edit view)
- [ ] Chevron icon indicating expandable/clickable
- [ ] "Add New Property" button below

**Task 4.2: Create Property Edit Modal**

Create: `/src/components/SimpleDashboard/PropertyEditModal.tsx`

Reuse existing `PropertyForm` component with modal wrapper:

- [ ] Modal dialog using Radix UI Dialog
- [ ] Pre-populate with existing property data
- [ ] Form fields per PRD:
  - Property Name (required, max 100 chars)
  - Address Line 1 (optional, max 200 chars)
  - Address Line 2 (optional, max 200 chars)
  - City (optional, max 100 chars)
  - State/Province (optional, max 100 chars)
  - Postal Code (optional, max 20 chars)
  - Country (optional, dropdown)
- [ ] Save button: Commits changes, shows success toast
- [ ] Cancel button: Discards changes, closes modal
- [ ] Validation: Required field error messages

**Task 4.3: Create Add Property Modal**

Create: `/src/components/SimpleDashboard/AddPropertyModal.tsx`

- [ ] Same form as edit modal
- [ ] Create new property on save
- [ ] Success: Close modal, refresh property list

**Task 4.4: Integrate Property Section**

File: `/src/app/dashboard2/page.tsx`

- [ ] Import `PropertySection`
- [ ] Add below action buttons
- [ ] Connect to property data from API
- [ ] Wire up edit/add modal handlers

**Acceptance Criteria Phase 4:**
- [ ] "My Property" section visible on dashboard
- [ ] Clicking property opens edit modal
- [ ] Can edit property name and address fields
- [ ] Save persists to database
- [ ] Cancel discards unsaved changes
- [ ] Validation prevents empty name
- [ ] "Add New Property" creates new property
- [ ] Dashboard updates when properties change

---

### Phase 5: Multi-Property Enhancements - 1 day

**Goal:** Adapt dashboard for users with 2+ properties (PRD Feature 4)

**Task 5.1: Statistics Per Property**

- [ ] Update stats API to optionally filter by propertyId
- [ ] Add "(all properties)" label when showing totals
- [ ] Consider property filter in statistics section

**Task 5.2: Print Flow Property Selector**

File: `/src/app/dashboard2/print/page.tsx`

- [ ] Property selector card grid
- [ ] Each card shows property name and item count
- [ ] Clicking card navigates to print flow for that property

**Task 5.3: Dashboard Progressive UI**

File: `/src/app/dashboard2/page.tsx`

- [ ] When 2+ properties, property section becomes list
- [ ] Statistics show "(all properties)" annotation
- [ ] "Print QR Code" button navigates to property selector

**Acceptance Criteria Phase 5:**
- [ ] Multi-property users see list of properties
- [ ] Can add additional properties
- [ ] Statistics show totals across all properties
- [ ] Print flow requires property selection

---

### Phase 6: Polish & Accessibility - 0.5 days

**Goal:** Final refinements, accessibility, edge cases

**Task 6.1: Empty States**

- [ ] New user with no items: "Create your first item" CTA
- [ ] No properties: Prompt to add property
- [ ] Friendly messaging per Airbnb tone

**Task 6.2: Loading States**

- [ ] Shimmer skeletons for all loading sections
- [ ] Consistent loading indicators

**Task 6.3: Accessibility**

- [ ] Tab order through all interactive elements
- [ ] ARIA labels for buttons and regions
- [ ] Focus visible states (`focus-visible:ring-2 ring-[#222222]`)
- [ ] Keyboard navigation for modals (Escape to close)

**Task 6.4: Mobile Responsive**

- [ ] Statistics cards stack on mobile (1 per row)
- [ ] Action buttons stack vertically on mobile
- [ ] Modal full-screen on mobile
- [ ] Touch-friendly tap targets (48px minimum)

**Acceptance Criteria Phase 6:**
- [ ] All edge cases handled gracefully
- [ ] Fully keyboard navigable
- [ ] WCAG 2.1 AA compliant
- [ ] Responsive on all breakpoints

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Remove account references | Delete code | PRD Design Principle #1 explicit requirement |
| Color system | Inline Tailwind with hex | No existing design token setup; use Airbnb hex values directly |
| Statistics API | New endpoint | Aggregation more efficient server-side |
| Property edit | Modal dialog | Consistent with existing patterns, better mobile UX |
| Print flow integration | Reuse QRCodePrintManager | Component already complete and tested |
| Action buttons | New component | Current cards don't match PRD wireframe |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing /dashboard2/create route | Low | High | Only modify page.tsx and layout.tsx; leave /create and /items untouched |
| Database schema missing rooms/tags | Medium | Medium | Derive from item locations/tags fields as documented in original plan |
| Multi-property edge cases | Medium | Medium | Test with 1, 2, and 3+ properties |
| Mobile responsive issues | Low | Medium | Test early on multiple device sizes |

---

## Effort Estimate (REVISED)

| Phase | Estimate | Previous | Savings |
|-------|----------|----------|---------|
| Phase 1: Fix PRD Violations | 1 day | N/A (new) | N/A |
| Phase 2: Statistics Cards | 1 day | 2-3 days | 1-2 days (simpler scope) |
| Phase 3: Action Buttons + Print QR | 1 day | 3-4 days | 2-3 days (reuse QRCodePrintManager) |
| Phase 4: Property Section | 1-2 days | 2-3 days | 1 day (reuse PropertyForm) |
| Phase 5: Multi-Property | 1 day | 2-3 days | 1-2 days (simpler scope) |
| Phase 6: Polish | 0.5 days | 1-2 days | 0.5-1.5 days |
| **Total** | **5.5-7.5 days** | 12-18 days | **6-10.5 days saved** |

**Notes:**
- Significant savings from reusing existing QRCodePrintManager, PropertyForm, PropertySelector
- /dashboard2/create and /dashboard2/items are complete - no work needed
- Focus is on fixing violations and adding missing features

---

## Removed Tasks (Already Complete)

The following tasks from the original plan are **NOT NEEDED**:

1. **Phase 1 (Original): Core Dashboard Shell** - Partially complete
   - ~~1.1-1.6: Directory structure, types, components~~ -> Only fixes needed
   - ~~1.7: Update page.tsx to use SimpleDashboard~~ -> Use existing page.tsx with modifications

2. **Phase 2 (Original): Statistics & Data Integration** - Partially addressed
   - ~~2.4-2.6: Property section display~~ -> Moved to Phase 4

3. **Phase 5 (Original): Print QR Code Flow** - Mostly reusable
   - ~~5.1-5.8: Full print flow implementation~~ -> Reuse `QRCodePrintManager`

---

## File Change Summary

| Action | File Path | Description |
|--------|-----------|-------------|
| MODIFY | `/src/app/dashboard2/layout.tsx` | Remove account references, apply Airbnb colors |
| MODIFY | `/src/app/dashboard2/page.tsx` | Remove account references, add statistics, fix action buttons, add property section |
| CREATE | `/src/app/api/user/dashboard/stats/route.ts` | Dashboard statistics API |
| CREATE | `/src/hooks/useDashboardStats.ts` | Stats fetching hook |
| CREATE | `/src/components/SimpleDashboard/StatisticsCards.tsx` | Stats display component |
| CREATE | `/src/components/SimpleDashboard/ActionButtons.tsx` | 3-button action row |
| CREATE | `/src/components/SimpleDashboard/PropertySection.tsx` | Property display section |
| CREATE | `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Property edit modal |
| CREATE | `/src/components/SimpleDashboard/AddPropertyModal.tsx` | Add property modal |
| CREATE | `/src/app/dashboard2/print/page.tsx` | Print property selector |
| CREATE | `/src/app/dashboard2/print/[propertyId]/page.tsx` | Print flow page |
| NO CHANGE | `/src/app/dashboard2/create/page.tsx` | Already complete |
| NO CHANGE | `/src/app/dashboard2/items/page.tsx` | Already complete |

---

## References

- [PRD: Dashboard 2 - Simple Dashboard](/docs/prd/PRD_Dashboard_2_Simple_Dashboard.md)
- [Airbnb Design System](/docs/prd/airbnb_designsystem.md)
- [Original Implementation Plan](/docs/prd/Plan-001-Simple-Dashboard-Implementation.md)
- [Existing QRCodePrintManager](/src/components/QRCodePrintManager.tsx)
- [Existing PropertyForm](/src/components/PropertyForm.tsx)
- [Existing PropertySelector](/src/components/PropertySelector.tsx)
