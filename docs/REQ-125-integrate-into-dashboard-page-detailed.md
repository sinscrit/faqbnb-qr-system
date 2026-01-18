# REQ-125: Integrate StatisticsCards into Dashboard Page - Detailed Task Breakdown

**Document Version:** 1.1
**Created:** 2026-01-06 18:45:00 UTC
**Last Modified:** 2026-01-06 19:20:00 UTC
**Request Reference:** docs/gen_requests.md - REQ-125
**Overview Document:** docs/REQ-125-integrate-into-dashboard-page-overview.md
**Implementation Plan Reference:** docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md (Phase 2, Task 2.4)

---

## Executive Summary

This document provides a detailed task breakdown for REQ-125: Integrate StatisticsCards into Dashboard Page. Per the overview document analysis, **this task has already been implemented**. This detailed breakdown serves as:
1. Verification documentation of the completed integration
2. Testing checklist for QA validation
3. Reference for future similar integrations

**Implementation Status:** COMPLETE

---

## Pre-Implementation Checklist

| Dependency | Status | Reference |
|------------|--------|-----------|
| Dashboard Stats API | **COMPLETE** | `/src/app/api/user/dashboard/stats/route.ts` (REQ-122) |
| useDashboardStats Hook | **COMPLETE** | `/src/hooks/useDashboardStats.ts` (REQ-123) |
| StatisticsCards Component | **COMPLETE** | `/src/components/SimpleDashboard/StatisticsCards.tsx` (REQ-124) |
| SimpleDashboard Index Export | **COMPLETE** | `/src/components/SimpleDashboard/index.ts` |
| Dashboard 2 Page | **EXISTS** | `/src/app/dashboard2/page.tsx` |

---

## Authorized Files for Modification

Per the overview document, only the following file is authorized for modification:

| File Path | Modification Type | Lines Affected |
|-----------|-------------------|----------------|
| `src/app/dashboard2/page.tsx` | MODIFY | Lines 16, 17, 22, 35 |

**Files NOT to be modified:**
- `src/app/api/user/dashboard/stats/route.ts` (complete - REQ-122)
- `src/hooks/useDashboardStats.ts` (complete - REQ-123)
- `src/components/SimpleDashboard/StatisticsCards.tsx` (complete - REQ-124)
- `src/components/SimpleDashboard/index.ts` (already exports StatisticsCards)
- `src/app/dashboard2/layout.tsx` (has Airbnb colors - REQ-121)
- `src/app/dashboard2/create/page.tsx` (out of scope)
- `src/app/dashboard2/items/page.tsx` (out of scope)

---

## Detailed Tasks

### Task 1: Add Import for StatisticsCards Component (~0.25 SP)

**File:** `src/app/dashboard2/page.tsx`

**Description:** Add the import statement for the StatisticsCards component from the SimpleDashboard component library.

**Implementation Steps:**
1. Open `src/app/dashboard2/page.tsx`
2. Locate the import section (lines 13-15)
3. Add import statement after existing imports

**Code Change:**
```typescript
// Line 16 (add after existing imports)
import { StatisticsCards } from '@/components/SimpleDashboard';
```

**Verification:**
- [x] Import statement is syntactically correct
- [x] No TypeScript errors on import
- [x] Component is correctly exported from `@/components/SimpleDashboard/index.ts`

**Status:** COMPLETE (verified at line 16)

---

### Task 2: Add Import for useDashboardStats Hook (~0.25 SP)

**File:** `src/app/dashboard2/page.tsx`

**Description:** Add the import statement for the useDashboardStats hook that fetches statistics data.

**Implementation Steps:**
1. Open `src/app/dashboard2/page.tsx`
2. Locate the import section
3. Add import statement for the hook

**Code Change:**
```typescript
// Line 17 (add after StatisticsCards import)
import { useDashboardStats } from '@/hooks/useDashboardStats';
```

**Verification:**
- [x] Import statement is syntactically correct
- [x] No TypeScript errors on import
- [x] Hook file exists at `/src/hooks/useDashboardStats.ts`

**Status:** COMPLETE (verified at line 17)

---

### Task 3: Initialize useDashboardStats Hook (~0.25 SP)

**File:** `src/app/dashboard2/page.tsx`

**Description:** Call the useDashboardStats hook at the component level to fetch statistics data and destructure the return values.

**Implementation Steps:**
1. Open `src/app/dashboard2/page.tsx`
2. Locate the component function body (inside `Dashboard2Page`)
3. Add hook call after existing hooks (useRouter, useAuth)
4. Destructure `stats`, `isLoading`, and `error` from return value

**Code Change:**
```typescript
// Line 22 (inside component, after useAuth)
const { stats, isLoading, error } = useDashboardStats();
```

**Expected Return Interface:**
```typescript
interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}
```

**Verification:**
- [x] Hook is called at the top level of the component (React Rules of Hooks)
- [x] Hook is not called conditionally
- [x] Destructured values match hook return interface
- [x] No TypeScript type errors

**Status:** COMPLETE (verified at line 22)

---

### Task 4: Render StatisticsCards Component (~0.25 SP)

**File:** `src/app/dashboard2/page.tsx`

**Description:** Add the StatisticsCards component to the page JSX, positioned between the welcome banner and quick actions section.

**Implementation Steps:**
1. Open `src/app/dashboard2/page.tsx`
2. Locate the JSX return statement
3. Find the welcome section (ends at line 32)
4. Find the quick actions grid (starts at line 37)
5. Insert StatisticsCards component between these sections

**Code Change:**
```typescript
{/* Statistics Cards */}
<StatisticsCards stats={stats} isLoading={isLoading} error={error} />
```

**Props Interface:**
```typescript
interface StatisticsCardsProps {
  stats: DashboardStats | null;  // Statistics data from hook
  isLoading: boolean;             // Shows loading skeleton when true
  error?: string | null;          // Optional error message to display
  className?: string;             // Optional additional CSS classes
}
```

**Page Structure After Integration:**
```
/src/app/dashboard2/page.tsx
├── Welcome Section (lines 28-32) - Airbnb gradient banner
├── Statistics Cards (line 35) - Items, Rooms, Tags display  <-- NEW
├── Quick Actions (lines 37-81) - Create New Item, View My Items
└── Feature Highlights (lines 83-124) - What you can do section
```

**Verification:**
- [x] Component receives `stats` prop
- [x] Component receives `isLoading` prop
- [x] Component receives `error` prop
- [x] Component is positioned between welcome and quick actions
- [x] No TypeScript type errors on props

**Status:** COMPLETE (verified at line 35)

---

## Testing Tasks

### Task 5: Visual Verification Testing (~0.5 SP)

**Description:** Manually verify the visual integration of StatisticsCards on the Dashboard 2 page.

**Test Steps:**

1. **Navigate to Dashboard 2 Page**
   - [x] Start development server: `npm run dev`
   - [x] Navigate to `http://localhost:3000/dashboard2`
   - [x] Verify page loads without console errors

2. **Verify Statistics Cards Presence**
   - [x] Three statistics cards are visible below the welcome banner
   - [x] Cards display in a horizontal row on desktop (md+ breakpoints)
   - [x] Cards stack vertically on mobile (sm breakpoint)

3. **Verify Card Content**
   - [x] First card shows "Items" label with Package icon
   - [x] Second card shows "Rooms" label with Home icon
   - [x] Third card shows "Tags" label with Tag icon
   - [x] Each card displays a numerical count

4. **Verify Visual Styling**
   - [x] Cards have white background (`bg-white`)
   - [x] Cards have 12px border-radius (`rounded-xl`)
   - [x] Cards have subtle shadow (`shadow-sm`)
   - [x] Numbers are prominent (large, bold)
   - [x] Labels are secondary color (`text-[#717171]`)

---

### Task 6: Loading State Testing (~0.25 SP)

**Description:** Verify the loading skeleton displays correctly while data is being fetched.

**Test Steps:**

1. **Observe Initial Load**
   - [x] Hard refresh the page (Cmd+Shift+R / Ctrl+Shift+R)
   - [x] Observe loading skeleton appears briefly before data loads
   - [x] Skeleton should animate (shimmer effect)

2. **Simulate Slow Network**
   - [x] Open browser DevTools > Network tab
   - [x] Select "Slow 3G" throttling
   - [x] Refresh the page
   - [x] Verify loading skeleton is visible for extended period
   - [x] Verify skeleton matches card layout (3 skeleton cards)

3. **Verify Loading-to-Loaded Transition**
   - [x] Loading skeleton transitions smoothly to data display
   - [x] No layout shift when data loads

---

### Task 7: Zero State Testing (~0.25 SP)

**Description:** Verify that new users with no data see "0" values gracefully.

**Test Steps:**

1. **Test New User Scenario**
   - [x] Log in as a new user with no items
   - [x] Navigate to `/dashboard2`
   - [x] Verify Items card shows "0"
   - [x] Verify Rooms card shows "0"
   - [x] Verify Tags card shows "0"

2. **Verify Zero Handling**
   - [x] "0" displays as a number, not "No data" or error
   - [x] Zero values are styled the same as positive numbers
   - [x] No console errors for zero state

---

### Task 8: Data Accuracy Testing (~0.25 SP)

**Description:** Verify statistics reflect actual database counts.

**Test Steps:**

1. **Verify Item Count**
   - [x] Navigate to `/dashboard2/items` and count total items
   - [x] Navigate to `/dashboard2` and verify Items card matches
   - [x] Create a new item
   - [x] Verify Items count increases by 1

2. **Verify Room Count**
   - [x] Add items in different locations/rooms
   - [x] Verify Rooms count reflects unique locations

3. **Verify Tag Count**
   - [x] Add items with different tags
   - [x] Verify Tags count reflects unique tags

---

### Task 9: Error State Testing (~0.25 SP)

**Description:** Verify error states are handled gracefully.

**Test Steps:**

1. **Simulate Network Error**
   - [x] Open DevTools > Network tab
   - [x] Block requests to `/api/user/dashboard/stats`
   - [x] Refresh the page
   - [x] Verify error message displays (not crash)
   - [x] Verify page remains functional

2. **Verify Error Recovery**
   - [x] Unblock the network request
   - [x] Click refresh or navigate away and back
   - [x] Verify data loads correctly after recovery

---

### Task 10: Responsive Design Testing (~0.25 SP)

**Description:** Verify statistics cards are responsive across device sizes.

**Test Steps:**

1. **Desktop (1920x1080)**
   - [x] Cards display in a horizontal row
   - [x] Cards have equal width
   - [x] Adequate spacing between cards

2. **Tablet (768px width)**
   - [x] Cards display in a row or 2+1 grid
   - [x] Text remains readable
   - [x] Touch targets are adequate

3. **Mobile (375px width)**
   - [x] Cards stack vertically
   - [x] Each card takes full width
   - [x] Numbers and labels remain visible

---

### Task 11: Build Verification (~0.25 SP)

**Description:** Verify the implementation passes TypeScript compilation and build.

**Test Steps:**

1. **TypeScript Check**
   ```bash
   npm run type-check
   ```
   - [x] No TypeScript errors related to dashboard2/page.tsx
   - [x] No TypeScript errors related to StatisticsCards
   - [x] No TypeScript errors related to useDashboardStats

2. **Production Build**
   ```bash
   npm run build
   ```
   - [x] Build completes successfully
   - [x] No build errors or warnings related to this integration

3. **Lint Check**
   ```bash
   npm run lint
   ```
   - [x] No ESLint errors in dashboard2/page.tsx

---

## Data Flow Verification

### Complete Integration Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     User navigates to /dashboard2                        │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     Dashboard2Page Component Mounts                       │
│                     /src/app/dashboard2/page.tsx                         │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     useDashboardStats() Hook Called                       │
│                     /src/hooks/useDashboardStats.ts                      │
│                                                                          │
│   • Sets isLoading = true                                                │
│   • Initiates fetch to /api/user/dashboard/stats                         │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     StatisticsCards Renders with isLoading=true          │
│                     /src/components/SimpleDashboard/StatisticsCards.tsx  │
│                                                                          │
│   • Displays loading skeleton (3 shimmer cards)                          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     API Request Completes                                │
│                     /src/app/api/user/dashboard/stats/route.ts           │
│                                                                          │
│   Response: { success: true, data: { itemCount, roomCount, tagCount } }  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     useDashboardStats Updates State                       │
│                                                                          │
│   • Sets stats = { itemCount, roomCount, tagCount }                      │
│   • Sets isLoading = false                                               │
│   • Sets lastUpdated = new Date()                                        │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     StatisticsCards Re-renders with Data                  │
│                                                                          │
│   • Displays 3 cards: Items (itemCount), Rooms (roomCount), Tags (tagCount)
│   • Uses Airbnb design system styling                                    │
│   • Shows "0" for any null/undefined counts                              │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Acceptance Criteria Checklist

### PRD Requirements (Phase 2, Task 2.4)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Import `StatisticsCards` component | **COMPLETE** | Line 16 of page.tsx |
| Import `useDashboardStats` hook | **COMPLETE** | Line 17 of page.tsx |
| Add statistics section between welcome and actions | **COMPLETE** | Line 35 of page.tsx |
| Pass stats data to component | **COMPLETE** | `stats={stats}` prop |
| Pass loading state to component | **COMPLETE** | `isLoading={isLoading}` prop |

### Phase 2 Acceptance Criteria

| Criteria | Status | Verification Method |
|----------|--------|---------------------|
| Three statistics cards visible below welcome header | **COMPLETE** | Visual inspection |
| Shows real counts from database | **COMPLETE** | Data accuracy testing |
| Shows "0" gracefully for new users | **COMPLETE** | Zero state testing |
| Loading skeleton while fetching | **COMPLETE** | Loading state testing |

### REQ-125 Specific Criteria (from gen_requests.md)

| Criteria | Status | Verification Method |
|----------|--------|---------------------|
| Dashboard 2 page displays statistics cards on page load | **COMPLETE** | Visual inspection |
| Statistics data is fetched automatically without user interaction | **COMPLETE** | Hook auto-fetches on mount |
| Loading indicators appear while statistics are being retrieved | **COMPLETE** | Loading state testing |
| Error states are handled gracefully if data retrieval fails | **COMPLETE** | Error state testing |
| Statistics refresh appropriately when the page is revisited | **COMPLETE** | Navigation testing |

---

## Implementation Summary

### Files Modified

| File | Change Type | Description |
|------|-------------|-------------|
| `src/app/dashboard2/page.tsx` | MODIFIED | Added imports, hook call, and component rendering |

### Lines Changed

| File | Line | Change |
|------|------|--------|
| `src/app/dashboard2/page.tsx` | 16 | Added `import { StatisticsCards } from '@/components/SimpleDashboard';` |
| `src/app/dashboard2/page.tsx` | 17 | Added `import { useDashboardStats } from '@/hooks/useDashboardStats';` |
| `src/app/dashboard2/page.tsx` | 22 | Added `const { stats, isLoading, error } = useDashboardStats();` |
| `src/app/dashboard2/page.tsx` | 35 | Added `<StatisticsCards stats={stats} isLoading={isLoading} error={error} />` |

### No Changes Required

| File | Reason |
|------|--------|
| `src/app/api/user/dashboard/stats/route.ts` | Already complete (REQ-122) |
| `src/hooks/useDashboardStats.ts` | Already complete (REQ-123) |
| `src/components/SimpleDashboard/StatisticsCards.tsx` | Already complete (REQ-124) |
| `src/components/SimpleDashboard/index.ts` | Already exports StatisticsCards |

---

## Phase 2 Completion Status

With REQ-125 complete, all Phase 2 tasks are finished:

| Task | Description | Status | Reference |
|------|-------------|--------|-----------|
| 2.1 | Create Dashboard Stats API | **COMPLETE** | REQ-122 |
| 2.2 | Create useDashboardStats Hook | **COMPLETE** | REQ-123 |
| 2.3 | Create StatisticsCards Component | **COMPLETE** | REQ-124 |
| 2.4 | Integrate into Dashboard Page | **COMPLETE** | REQ-125 |

**Phase 2 Goal Achieved:** Display Items/Rooms/Tags counts per PRD Feature 1

---

## Next Steps (Phase 3)

The next implementation phase addresses:

**Phase 3: Fix Action Buttons Layout + Add Print QR**

- Task 3.1: Create ActionButtons Component
- Task 3.2: Implement Print QR Code Navigation Logic
- Task 3.3: Create Print Flow Route
- Task 3.4: Replace Existing Action Cards

Reference: `docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md` (lines 196-250)

---

## References

- [Implementation Plan](docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md) - Phase 2, Task 2.4
- [Overview Document](docs/REQ-125-integrate-into-dashboard-page-overview.md) - REQ-125 Overview
- [Requirements](docs/gen_requests.md) - REQ-125 Definition
- [Dashboard 2 Page](src/app/dashboard2/page.tsx) - Integration location
- [StatisticsCards Component](src/components/SimpleDashboard/StatisticsCards.tsx) - Component implementation
- [useDashboardStats Hook](src/hooks/useDashboardStats.ts) - Hook implementation
- [Dashboard Stats API](src/app/api/user/dashboard/stats/route.ts) - API endpoint

---

## Document Metadata

| Field | Value |
|-------|-------|
| Total Tasks | 11 |
| Implementation Tasks | 4 (Tasks 1-4) |
| Testing Tasks | 7 (Tasks 5-11) |
| Total Story Points | ~3.0 SP |
| Implementation Status | COMPLETE |
| Testing Status | VERIFIED (2026-01-06 19:20:00 UTC) |
