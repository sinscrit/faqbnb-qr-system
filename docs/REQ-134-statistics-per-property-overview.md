# REQ-134: Filter Statistics by Individual Property - Implementation Breakdown

**Document Created:** 2026-01-06 17:30:00 UTC
**Last Modified:** 2026-01-06 17:30:00 UTC
**Request Reference:** REQ-134 in docs/gen_requests.md
**Implementation Plan Reference:** Plan-001-Simple-Dashboard-Implementation-REVISED.md (Phase 5, Task 5.1)

---

## 1. Executive Summary

This document provides a detailed implementation breakdown for enabling per-property statistics filtering in Dashboard 2. The feature allows multi-property hosts to view statistics for a specific property or see aggregated totals with an "(all properties)" label.

### Scope
- Update the dashboard stats API to accept an optional `propertyId` filter parameter
- Modify the `useDashboardStats` hook to support property filtering
- Update the `StatisticsCards` component to display property context labels
- Add a property filter UI to the dashboard statistics section

### Out of Scope
- Changes to the PropertySection component
- Print flow modifications (covered in Task 5.2)
- Dashboard progressive UI for multi-property (covered in Task 5.3)

---

## 2. Current State Analysis

### Existing Components

| Component | Location | Current Behavior |
|-----------|----------|------------------|
| Stats API | `/src/app/api/user/dashboard/stats/route.ts` | Returns aggregated totals across ALL user properties. No filtering support. |
| useDashboardStats Hook | `/src/hooks/useDashboardStats.ts` | Fetches stats without property filter. No propertyId parameter. |
| StatisticsCards | `/src/components/SimpleDashboard/StatisticsCards.tsx` | Displays Items/Rooms/Tags counts. No context label. |
| Dashboard Page | `/src/app/dashboard2/page.tsx` | Integrates StatisticsCards without property filter. |

### Existing Reusable Components

| Component | Location | Can Reuse For |
|-----------|----------|---------------|
| PropertySelector | `/src/components/PropertySelector.tsx` | Property filter dropdown UI |
| AuthContext | `/src/contexts/AuthContext.tsx` | Access to `userProperties` list |

### Data Flow (Current)
```
Dashboard Page → useDashboardStats() → /api/user/dashboard/stats → Returns totals
                                                                    ↓
                                       StatisticsCards ← {itemCount, roomCount, tagCount}
```

### Data Flow (Target)
```
Dashboard Page → PropertyFilter UI → useDashboardStats(propertyId) → /api/user/dashboard/stats?propertyId=X
                        ↑                                                     ↓
                AuthContext.userProperties     StatisticsCards ← {itemCount, roomCount, tagCount, propertyContext}
```

---

## 3. Implementation Tasks

### Task 1: Update Stats API to Accept propertyId Filter

**File:** `/src/app/api/user/dashboard/stats/route.ts`

**Description:** Add optional `propertyId` query parameter to filter statistics by a specific property.

**Changes Required:**

1.1. Parse `propertyId` from URL search params (line ~8)
```typescript
const { searchParams } = new URL(request.url);
const propertyId = searchParams.get('propertyId');
```

1.2. Modify property ID filtering logic (lines 38-45)
- When `propertyId` is provided: Filter to only that property
- When `propertyId` is not provided: Use all user properties (current behavior)
- Validate that the requested `propertyId` belongs to the user

1.3. Add `propertyContext` to response (lines 102-109)
```typescript
return NextResponse.json({
  success: true,
  data: {
    itemCount,
    roomCount,
    tagCount,
    propertyContext: {
      isFiltered: !!propertyId,
      propertyId: propertyId || null,
      propertyName: propertyId ? selectedProperty?.nickname : null,
      totalProperties: propertyIds.length
    }
  }
});
```

**Acceptance Criteria:**
- [ ] API accepts optional `propertyId` query parameter
- [ ] When propertyId provided, stats reflect only that property
- [ ] When propertyId not provided, stats aggregate all properties
- [ ] API returns 400 if propertyId doesn't belong to user
- [ ] Response includes `propertyContext` object

---

### Task 2: Update DashboardStats Interface

**File:** `/src/hooks/useDashboardStats.ts`

**Description:** Extend the `DashboardStats` interface and hook to support property filtering.

**Changes Required:**

2.1. Update `DashboardStats` interface (lines 14-18)
```typescript
export interface DashboardStats {
  itemCount: number;
  roomCount: number;
  tagCount: number;
  propertyContext: {
    isFiltered: boolean;
    propertyId: string | null;
    propertyName: string | null;
    totalProperties: number;
  };
}
```

2.2. Add `propertyId` parameter to hook (line 63)
```typescript
export function useDashboardStats(propertyId?: string): UseDashboardStatsReturn
```

2.3. Update API call to include propertyId filter (lines 88-93)
```typescript
const endpoint = propertyId
  ? `/user/dashboard/stats?propertyId=${propertyId}`
  : '/user/dashboard/stats';
const response = await apiRequest<DashboardStatsResponse>(endpoint, {}, true);
```

2.4. Add propertyId to useEffect dependency array (lines 141-144)
```typescript
useEffect(() => {
  fetchStats(false);
}, [fetchStats, propertyId]);
```

**Acceptance Criteria:**
- [ ] Hook accepts optional `propertyId` parameter
- [ ] API call includes propertyId when provided
- [ ] Stats refresh when propertyId changes
- [ ] DashboardStats interface includes propertyContext

---

### Task 3: Update StatisticsCards Component

**File:** `/src/components/SimpleDashboard/StatisticsCards.tsx`

**Description:** Display property context label showing which property's stats are being displayed.

**Changes Required:**

3.1. Add property context label above cards (lines 154-164)
```typescript
// Before the grid, add context indicator
{stats?.propertyContext && (
  <div className="mb-2 text-sm text-[#717171] flex items-center gap-1">
    {stats.propertyContext.isFiltered ? (
      <>
        <span>{stats.propertyContext.propertyName}</span>
      </>
    ) : stats.propertyContext.totalProperties > 1 ? (
      <span>(all properties)</span>
    ) : null}
  </div>
)}
```

3.2. Update StatisticsCardsProps interface (lines 14-23)
- No changes needed; stats already includes all data from DashboardStats

**Acceptance Criteria:**
- [ ] Shows "(all properties)" when viewing aggregated totals for multi-property users
- [ ] Shows property name when filtered to single property
- [ ] Shows nothing for single-property users viewing their only property
- [ ] Label styled consistently with Airbnb Design System

---

### Task 4: Add Property Filter to Dashboard

**File:** `/src/app/dashboard2/page.tsx`

**Description:** Add property filter dropdown above statistics section for multi-property users.

**Changes Required:**

4.1. Import PropertySelector and add state (lines 17-23)
```typescript
import PropertySelector from '@/components/PropertySelector';

// Inside component
const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
```

4.2. Update useDashboardStats call to include filter (line 26)
```typescript
const { stats, isLoading, error, refresh } = useDashboardStats(selectedPropertyId || undefined);
```

4.3. Add property filter UI between Welcome and Statistics sections (after line 93)
```typescript
{/* Property Filter - only show for multi-property users */}
{userProperties && userProperties.length > 1 && (
  <div className="flex items-center justify-between">
    <div className="w-64">
      <PropertySelector
        properties={userProperties}
        selectedPropertyId={selectedPropertyId}
        onPropertyChange={setSelectedPropertyId}
        variant="compact"
        size="md"
        placeholder="All Properties"
      />
    </div>
  </div>
)}
```

4.4. Pass userProperties from AuthContext (line 25)
```typescript
const { user, getUserProperties, userProperties } = useAuth();
```

**Acceptance Criteria:**
- [ ] Property filter dropdown only visible for users with 2+ properties
- [ ] Selecting a property filters statistics to that property
- [ ] Selecting "All Properties" shows aggregated totals
- [ ] Statistics refresh when property filter changes
- [ ] Single-property users do not see the filter

---

### Task 5: Edge Case Handling

**Files:** Multiple

**Description:** Handle edge cases for single-property users and empty states.

**Changes Required:**

5.1. Single-property user detection (Dashboard page)
- Do not show property filter dropdown
- Do not show "(all properties)" label
- Stats display normally without context label

5.2. Property not found handling (Stats API)
- Return 400 error if propertyId doesn't belong to user
- Include descriptive error message

5.3. No properties handling (Stats API)
- Return zero counts gracefully (existing behavior)
- Set `totalProperties: 0` in propertyContext

**Acceptance Criteria:**
- [ ] Single-property users see clean UI without filter/labels
- [ ] Invalid propertyId returns appropriate error
- [ ] Edge cases handled gracefully without UI breaks

---

## 4. Authorized Files and Functions for Modification

### Files Requiring Modification

| File Path | Action | Specific Changes |
|-----------|--------|------------------|
| `/src/app/api/user/dashboard/stats/route.ts` | MODIFY | Add propertyId param parsing, filter logic, propertyContext response |
| `/src/hooks/useDashboardStats.ts` | MODIFY | Add propertyId param, update interface, dependency array |
| `/src/components/SimpleDashboard/StatisticsCards.tsx` | MODIFY | Add property context label display |
| `/src/app/dashboard2/page.tsx` | MODIFY | Add property filter state and UI |

### Functions Requiring Modification

| File | Function | Changes |
|------|----------|---------|
| `/src/app/api/user/dashboard/stats/route.ts` | `GET` | Parse propertyId, add filter logic, extend response |
| `/src/hooks/useDashboardStats.ts` | `useDashboardStats` | Add propertyId parameter, update fetchStats endpoint |
| `/src/hooks/useDashboardStats.ts` | `fetchStats` | Include propertyId in API URL |
| `/src/components/SimpleDashboard/StatisticsCards.tsx` | `StatisticsCards` | Add property context label rendering |
| `/src/app/dashboard2/page.tsx` | `Dashboard2Page` | Add state, filter UI, pass propertyId to hook |

### Interfaces Requiring Modification

| File | Interface | Changes |
|------|-----------|---------|
| `/src/hooks/useDashboardStats.ts` | `DashboardStats` | Add `propertyContext` object |
| `/src/hooks/useDashboardStats.ts` | `DashboardStatsResponse` | Ensure compatibility with new response shape |

---

## 5. Dependencies and Order of Implementation

```
┌─────────────────────────────────────────┐
│ Task 1: Update Stats API                │  ← Must complete first
│ Add propertyId filter support           │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Task 2: Update useDashboardStats Hook   │  ← Depends on Task 1
│ Add propertyId parameter                │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Task 3: Update StatisticsCards          │  ← Depends on Task 2
│ Add property context label              │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Task 4: Add Filter to Dashboard         │  ← Depends on Tasks 2 & 3
│ Property filter dropdown UI             │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Task 5: Edge Case Handling              │  ← Depends on all above
│ Single-property, validation, errors     │
└─────────────────────────────────────────┘
```

---

## 6. Testing Checklist

### Unit Tests

- [ ] Stats API returns filtered data when propertyId provided
- [ ] Stats API returns aggregated data when no propertyId
- [ ] Stats API returns 400 for invalid/unauthorized propertyId
- [ ] useDashboardStats hook fetches correct endpoint based on propertyId
- [ ] Hook refetches when propertyId changes

### Integration Tests

- [ ] Property filter dropdown updates statistics display
- [ ] "(all properties)" label appears for multi-property users
- [ ] Property name label appears when filtered
- [ ] No labels for single-property users
- [ ] Statistics refresh on property selection

### Manual Testing Scenarios

| Scenario | Expected Result |
|----------|-----------------|
| User with 1 property views dashboard | See stats without filter/labels |
| User with 2+ properties views dashboard | See filter dropdown, "(all properties)" label |
| User selects specific property | Stats update, property name shown |
| User selects "All Properties" | Stats aggregate, "(all properties)" label |
| User with no properties | Zero counts, graceful empty state |

---

## 7. Airbnb Design System Compliance

### Color Tokens Required

| Element | Token | Tailwind Class |
|---------|-------|----------------|
| Context label text | Secondary Text | `text-[#717171]` |
| Dropdown border | Border | `border-[#DDDDDD]` |
| Dropdown focus ring | Primary | `ring-[#FF385C]` |
| Active option | Primary Background | `bg-[#FFEEEF]` |

### Component Styling Notes

- Property filter dropdown should use existing `PropertySelector` component
- May need to update `PropertySelector` focus ring from `ring-blue-500` to `ring-[#FF385C]` for Airbnb compliance
- Context label should be subtle, using secondary text color

---

## 8. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| PropertySelector uses blue colors | High | Low | Update focus/active states to Airbnb colors |
| Performance with large property lists | Low | Medium | API already filters efficiently via SQL |
| Hook re-render on property change | Medium | Low | useEffect dependency handles this correctly |
| Breaking existing stats usage | Low | High | Ensure backwards compatibility - propertyId is optional |

---

## 9. Estimated Effort

| Task | Estimate |
|------|----------|
| Task 1: Update Stats API | 0.5 hours |
| Task 2: Update Hook | 0.5 hours |
| Task 3: Update StatisticsCards | 0.25 hours |
| Task 4: Add Filter to Dashboard | 0.5 hours |
| Task 5: Edge Cases | 0.25 hours |
| **Total** | **2 hours** |

---

## 10. References

- [REQ-134 in gen_requests.md](/docs/gen_requests.md)
- [Implementation Plan - Phase 5.1](/docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md)
- [Existing Stats API](/src/app/api/user/dashboard/stats/route.ts)
- [useDashboardStats Hook](/src/hooks/useDashboardStats.ts)
- [StatisticsCards Component](/src/components/SimpleDashboard/StatisticsCards.tsx)
- [PropertySelector Component](/src/components/PropertySelector.tsx)
