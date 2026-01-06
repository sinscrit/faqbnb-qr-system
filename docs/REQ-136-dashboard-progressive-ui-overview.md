# REQ-136: Dashboard Progressive UI Implementation Overview

**Created:** 2026-01-06 18:30:00 UTC
**Last Modified:** 2026-01-06 18:30:00 UTC
**Request Reference:** docs/gen_requests.md - Request #136
**Implementation Plan Reference:** docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md (Phase 5, Task 5.3)

---

## Executive Summary

This document provides a technical implementation breakdown for REQ-136: Dashboard Progressive UI Based on Property Count. The enhancement adapts the dashboard layout, components, and information density based on the number of properties a user manages, providing an optimal experience for users at all scales.

**Scope:** Progressive disclosure of dashboard features based on user's property count:
- **Single Property (1):** Streamlined, focused view
- **Few Properties (2-5):** Property selector and basic comparison features
- **Multiple Properties (6-15):** Enhanced filtering, grouping, and summary statistics
- **Many Properties (16+):** Advanced navigation, bulk operations, portfolio analytics, search

---

## Current State Analysis

### Existing Implementation

The dashboard already supports multi-property users with:
- Property selector dropdown (REQ-134) shown when `userProperties.length > 1`
- Statistics filtering by property ID
- Print flow property selector for multi-property users (REQ-135)
- PropertySection showing "My Property" vs "My Properties" dynamically

**Current Code:** `/src/app/dashboard2/page.tsx:104-121`
```typescript
{userProperties && userProperties.length > 1 && (
  <div className="flex items-center gap-4">
    <label className="text-sm font-medium text-[#222222]">
      View statistics for:
    </label>
    <div className="w-64">
      <PropertySelector ... />
    </div>
  </div>
)}
```

### Gap Analysis

| Requirement | Current State | Gap |
|-------------|---------------|-----|
| Single-property simplified UI | Basic implementation | No explicit "simplified" mode |
| Property selector at 2+ | Already implemented | No gap |
| Filtering/grouping at 6+ | Not implemented | New feature needed |
| Advanced tools at 16+ | Not implemented | New feature needed |
| Progressive disclosure | Binary (1 vs 2+) | Need tiered thresholds |
| Manual access to features | Not implemented | Settings/preferences needed |

---

## Technical Architecture

### Property Count Tier System

Define a utility hook to determine UI tier based on property count:

```typescript
// Proposed: /src/hooks/useDashboardTier.ts
type DashboardTier = 'single' | 'few' | 'multiple' | 'many';

interface DashboardTierConfig {
  tier: DashboardTier;
  showPropertySelector: boolean;
  showFilteringControls: boolean;
  showGroupingControls: boolean;
  showAdvancedTools: boolean;
  showPortfolioAnalytics: boolean;
  showBulkOperations: boolean;
  showSearchBar: boolean;
}
```

### Tier Thresholds (Configurable)

| Tier | Property Count | Features Enabled |
|------|----------------|------------------|
| `single` | 1 | Focused view, no selectors |
| `few` | 2-5 | Property selector, basic comparison |
| `multiple` | 6-15 | Filtering, grouping, enhanced stats |
| `many` | 16+ | All features including bulk ops, search |

---

## Implementation Tasks

### Task 1: Create useDashboardTier Hook

**File:** `/src/hooks/useDashboardTier.ts` (NEW)

**Purpose:** Centralized logic for determining which UI features to show based on property count.

**Implementation:**
1. Define `DashboardTier` type and `DashboardTierConfig` interface
2. Create threshold constants (configurable)
3. Implement `useDashboardTier(propertyCount: number)` hook
4. Return tier configuration object
5. Add optional override for manual feature access (from localStorage/user preferences)

**Dependencies:**
- None (standalone utility hook)

**Lines of Code Estimate:** ~80-100 lines

---

### Task 2: Create ProgressivePropertySection Component

**File:** `/src/components/SimpleDashboard/ProgressivePropertySection.tsx` (NEW)

**Purpose:** Replaces or wraps existing `PropertySection` with tier-aware rendering.

**Implementation:**
1. Import `useDashboardTier` hook
2. **Single tier:** Show compact single-property card (no selector)
3. **Few tier:** Show current PropertySection behavior
4. **Multiple tier:** Add inline filtering dropdown
5. **Many tier:** Add search input and grouping controls

**Dependencies:**
- `useDashboardTier` hook
- Existing `PropertySection` component
- New sub-components for filtering/search

**Reusable Components:**
- `PropertySection` (`/src/components/SimpleDashboard/PropertySection.tsx`) - wrap/extend

---

### Task 3: Create ProgressiveStatisticsSection Component

**File:** `/src/components/SimpleDashboard/ProgressiveStatisticsSection.tsx` (NEW)

**Purpose:** Adapts statistics display based on property count tier.

**Implementation:**
1. **Single tier:** Show property-specific stats only (no "all properties" option)
2. **Few tier:** Show current behavior with property filter
3. **Multiple tier:** Add comparison view (side-by-side property stats)
4. **Many tier:** Add portfolio-level summary cards, trend indicators

**Dependencies:**
- `useDashboardTier` hook
- Existing `StatisticsCards` component
- `useDashboardStats` hook

**Reusable Components:**
- `StatisticsCards` (`/src/components/SimpleDashboard/StatisticsCards.tsx`) - wrap/extend

---

### Task 4: Create AdvancedDashboardTools Component

**File:** `/src/components/SimpleDashboard/AdvancedDashboardTools.tsx` (NEW)

**Purpose:** Container for advanced features shown at `multiple`/`many` tiers.

**Sub-components:**
1. `PropertyGroupingControl` - Group properties by type, location, etc.
2. `PropertySearchBar` - Search/filter properties by name
3. `BulkOperationsToolbar` - Select all, bulk edit, bulk print
4. `PortfolioSummary` - Aggregate analytics across all properties

**Implementation:**
1. Conditionally render based on tier
2. Follow Airbnb DLS styling
3. Ensure mobile responsiveness (collapsible/drawer on mobile)

**Dependencies:**
- `useDashboardTier` hook
- New API endpoints (optional, for portfolio analytics)

---

### Task 5: Update Dashboard Page with Progressive UI

**File:** `/src/app/dashboard2/page.tsx` (MODIFY)

**Changes:**
1. Import `useDashboardTier` hook
2. Replace direct property count checks with tier-based logic
3. Conditionally render components based on tier config
4. Add `AdvancedDashboardTools` section for higher tiers
5. Update layout to accommodate new sections

**Current Lines to Modify:**
- Lines 29-35: Add tier hook usage
- Lines 104-121: Replace binary check with tier-aware rendering
- Lines 124-133: Wrap with progressive components

---

### Task 6: Create User Preferences for Feature Override

**File:** `/src/hooks/useDashboardPreferences.ts` (NEW)

**Purpose:** Allow users to manually enable advanced features regardless of property count.

**Implementation:**
1. Store preferences in localStorage (initial implementation)
2. Future: Sync to user profile in database
3. Integrate with `useDashboardTier` hook for override logic

**API Changes:**
- Optional: `/api/user/preferences` endpoint for persisting settings

---

### Task 7: Add Tier Transition Animations

**File:** Multiple component files (MODIFY)

**Purpose:** Smooth transitions when features appear/disappear as property count changes.

**Implementation:**
1. Use CSS transitions for showing/hiding sections
2. Consider Framer Motion for complex animations
3. Ensure animations don't block interaction
4. Add loading states during tier transitions

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Description |
|-----------|-------------|
| `/src/hooks/useDashboardTier.ts` | Dashboard tier determination hook |
| `/src/hooks/useDashboardPreferences.ts` | User preferences for feature overrides |
| `/src/components/SimpleDashboard/ProgressivePropertySection.tsx` | Tier-aware property section |
| `/src/components/SimpleDashboard/ProgressiveStatisticsSection.tsx` | Tier-aware statistics section |
| `/src/components/SimpleDashboard/AdvancedDashboardTools.tsx` | Advanced tools container |
| `/src/components/SimpleDashboard/PropertyGroupingControl.tsx` | Property grouping UI |
| `/src/components/SimpleDashboard/PropertySearchBar.tsx` | Property search UI |
| `/src/components/SimpleDashboard/BulkOperationsToolbar.tsx` | Bulk operations UI |
| `/src/components/SimpleDashboard/PortfolioSummary.tsx` | Portfolio analytics display |

### Existing Files to Modify

| File Path | Functions/Lines | Change Description |
|-----------|-----------------|-------------------|
| `/src/app/dashboard2/page.tsx` | Lines 29-35, 104-133 | Add tier hook, replace binary checks |
| `/src/components/SimpleDashboard/index.ts` | Exports | Add new component exports |
| `/src/components/SimpleDashboard/PropertySection.tsx` | Entire component | Potentially refactor to accept tier prop |
| `/src/components/SimpleDashboard/StatisticsCards.tsx` | Props interface | Add tier-aware display options |
| `/src/hooks/useDashboardStats.ts` | Optional | Add portfolio-level aggregation mode |

### Files to NOT Modify (Complete/Stable)

| File Path | Reason |
|-----------|--------|
| `/src/app/dashboard2/create/page.tsx` | Complete, stable |
| `/src/app/dashboard2/items/page.tsx` | Complete, stable |
| `/src/app/dashboard2/print/page.tsx` | Recently completed (REQ-135) |
| `/src/app/dashboard2/print/[propertyId]/page.tsx` | Recently completed |
| `/src/components/QRCodePrintManager.tsx` | Complete, stable |
| `/src/components/PropertyForm.tsx` | Complete, stable |

---

## API Considerations

### Existing API (No Changes)

- `/api/user/dashboard/stats` - Already supports `propertyId` filter (REQ-134)

### Potential New Endpoints (Optional)

| Endpoint | Purpose | Priority |
|----------|---------|----------|
| `/api/user/dashboard/portfolio` | Aggregate stats across all properties | P2 |
| `/api/user/preferences` | Store user dashboard preferences | P3 |
| `/api/user/properties/groups` | Property grouping metadata | P3 |

---

## Design System Compliance

All new components must follow Airbnb Design Language System:

| Token | Tailwind Class | Usage |
|-------|----------------|-------|
| Primary CTA | `bg-[#FF385C]` or gradient `from-[#E61E4D] to-[#D70466]` | Action buttons |
| Primary Text | `text-[#222222]` | Headings, labels |
| Secondary Text | `text-[#717171]` | Descriptions, hints |
| Border | `border-[#DDDDDD]` | Card borders, dividers |
| Success | `bg-[#00A699]` | Success states |
| Card Radius | `rounded-xl` (12px) | Cards, modals |
| Button Radius | `rounded-lg` (8px) | Buttons |
| Touch Target | `min-h-[48px]` | Interactive elements |

---

## Acceptance Criteria

From REQ-136:

- [ ] Dashboard detects the current property count and adjusts its layout accordingly
- [ ] Single-property users see a simplified dashboard without property selection controls
- [ ] Property selector appears when a user has 2 or more properties
- [ ] Filtering and grouping controls become visible when a user has 6 or more properties
- [ ] Advanced navigation tools (search, bulk actions, portfolio analytics) appear when a user has 16 or more properties
- [ ] The transition between UI states occurs automatically when properties are added or removed
- [ ] All functionality remains accessible regardless of property count (progressive disclosure, not removal)
- [ ] Users can manually access advanced features even with fewer properties if desired (via settings or preferences)

---

## Testing Strategy

### Unit Tests

- `useDashboardTier` hook tier determination logic
- Tier threshold edge cases (0, 1, 5, 6, 15, 16 properties)
- Preference override functionality

### Integration Tests

- Dashboard renders correct tier for each property count range
- Features show/hide correctly on property add/remove
- Preference toggle enables advanced features

### Manual Testing Scenarios

| Scenario | Expected Behavior |
|----------|-------------------|
| New user, 0 properties | Show "Add Property" CTA, minimal UI |
| User with 1 property | Simplified view, no selector |
| User with 3 properties | Property selector visible, basic comparison |
| User with 8 properties | Filtering/grouping controls appear |
| User with 20 properties | All advanced tools visible |
| Add property from 1 to 2 | Selector appears smoothly |
| Delete property from 6 to 5 | Filtering controls hide smoothly |

---

## Effort Estimate

| Task | Complexity | Estimate |
|------|------------|----------|
| Task 1: useDashboardTier hook | Low | 0.5 day |
| Task 2: ProgressivePropertySection | Medium | 1 day |
| Task 3: ProgressiveStatisticsSection | Medium | 1 day |
| Task 4: AdvancedDashboardTools | High | 1.5 days |
| Task 5: Dashboard page updates | Low | 0.5 day |
| Task 6: User preferences | Low | 0.5 day |
| Task 7: Tier transition animations | Low | 0.5 day |
| Testing & Polish | Medium | 1 day |
| **Total** | | **6.5 days** |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Over-engineering for rare "many" tier users | Medium | Low | Start with single/few tiers, iterate |
| Performance with many properties | Low | Medium | Virtual lists, pagination for 16+ |
| Complex state management | Medium | Medium | Keep tier logic in single hook |
| User confusion at tier transitions | Low | Medium | Smooth animations, tooltips |
| Breaking existing multi-property UX | Low | High | Thorough regression testing |

---

## Dependencies

### External Dependencies

- None (uses existing tech stack)

### Internal Dependencies

| Dependency | Required Before |
|------------|-----------------|
| REQ-134 (Property filtering) | Already complete |
| REQ-135 (Print flow enhancements) | Already complete |
| AuthContext.userProperties | Available |

---

## Implementation Order

1. **Phase 1:** `useDashboardTier` hook + dashboard page integration (MVP)
2. **Phase 2:** Progressive property section + statistics section
3. **Phase 3:** Advanced tools (filtering, grouping)
4. **Phase 4:** User preferences + animations + polish

---

## References

- [PRD: Dashboard 2 - Simple Dashboard](/docs/prd/PRD_Dashboard_2_Simple_Dashboard.md)
- [Airbnb Design System](/docs/prd/airbnb_designsystem.md)
- [Implementation Plan (REVISED)](/docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md)
- [REQ-134: Per-Property Statistics](/docs/gen_requests.md)
- [REQ-135: Print Flow Enhancements](/docs/gen_requests.md)
