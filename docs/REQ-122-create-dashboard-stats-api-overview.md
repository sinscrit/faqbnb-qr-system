# REQ-122: Create Dashboard Stats API - Implementation Overview

**Generated:** 2026-01-06 15:45:00 UTC
**Request Reference:** REQ-122 - Dashboard Statistics Summary API
**Plan Reference:** Plan-001-Simple-Dashboard-Implementation-REVISED.md (Phase 2, Task 2.1)
**Status:** Ready for Implementation

---

## 1. Request Summary

Create a new API endpoint to provide dashboard statistics for the Simple Dashboard (dashboard2). The endpoint will return:
- Total count of items belonging to the current user
- Count of distinct room/location names across all items
- Count of unique tags applied across all items

This API supports PRD Feature 1 (Statistics Cards) of the Simple Dashboard implementation.

---

## 2. Current State Analysis

### Existing Related Endpoints

| Endpoint | Location | Relevance |
|----------|----------|-----------|
| `/api/user/stats` | `src/app/api/user/stats/route.ts` | **Primary Pattern** - Existing user stats API with properties, items, views. Uses `createSupabaseServer` pattern |
| `/api/user/properties/summary` | `src/app/api/user/properties/summary/route.ts` | Reference for property-level item counts |
| `/api/user/properties/[propertyId]/items` | `src/app/api/user/properties/[propertyId]/items/route.ts` | Shows items table field structure |

### Items Table Schema (From Codebase Analysis)

Based on `src/components/ItemCapture/ItemCapture.types.ts` and API routes:

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `public_id` | string | Public identifier |
| `name` | string | Item name/title |
| `description` | string | Optional |
| `property_id` | UUID | Foreign key to properties |
| `qr_code_url` | string | Optional |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

**Note:** The `location` and `tags` fields exist in the ItemRecord interface but need verification in the database schema. Based on `ItemCapture.types.ts:211-214`:
- `location`: Optional string field (room within property, e.g., "Kitchen", "Master Bathroom")
- `tags`: Optional string array for categorization

### Authentication Pattern

From `src/app/api/user/stats/route.ts`:
```typescript
const supabase = await createSupabaseServer();
const { data: { user }, error: userError } = await supabase.auth.getUser();
// Then get account_id from account_users table
```

---

## 3. Technical Approach

### API Design

**Endpoint:** `GET /api/user/dashboard/stats`

**Response Shape (per Plan-001):**
```typescript
{
  success: boolean;
  data: {
    itemCount: number;      // Total items across all user's properties
    roomCount: number;      // Distinct location values from items
    tagCount: number;       // Unique tags across all items
  };
  error?: string;
}
```

### Query Strategy

1. **Get user's property IDs** - Same pattern as `/api/user/stats`
2. **Count items** - Aggregate count across user's properties
3. **Count distinct locations** - Query distinct non-null `location` values
4. **Count distinct tags** - Aggregate unique tags (tags stored as array or JSON)

### Zero Count Handling

Per acceptance criteria, all statistics must display zero when user has no data:
- No properties → `{ itemCount: 0, roomCount: 0, tagCount: 0 }`
- Properties but no items → `{ itemCount: 0, roomCount: 0, tagCount: 0 }`
- Items but no locations/tags → appropriate counts with zeros

---

## 4. Implementation Tasks

### Task 2.1.1: Create API Route File

**Action:** Create new file
**File:** `/src/app/api/user/dashboard/stats/route.ts`

Subtasks:
- [ ] Create directory structure `/src/app/api/user/dashboard/stats/`
- [ ] Implement GET handler following `createSupabaseServer` pattern from `/api/user/stats`
- [ ] Add TypeScript types for response shape

### Task 2.1.2: Implement Authentication

**Action:** Implement auth check
**File:** `/src/app/api/user/dashboard/stats/route.ts`

Pattern from `src/app/api/user/stats/route.ts:4-16`:
```typescript
const supabase = await createSupabaseServer();
const { data: { user }, error: userError } = await supabase.auth.getUser();
if (userError || !user) {
  return NextResponse.json(
    { success: false, error: 'Unauthorized' },
    { status: 401 }
  );
}
```

### Task 2.1.3: Get User's Properties

**Action:** Query account_users and properties tables
**File:** `/src/app/api/user/dashboard/stats/route.ts`

Pattern from `src/app/api/user/stats/route.ts:18-52`:
```typescript
// Get user's account context
const { data: accountUser } = await supabase
  .from('account_users')
  .select('account_id')
  .eq('user_id', user.id)
  .single();

// Get user's property IDs
const { data: userProperties } = await supabase
  .from('properties')
  .select('id')
  .eq('user_id', user.id)
  .eq('account_id', accountId);

const propertyIds = userProperties?.map(p => p.id) || [];
```

### Task 2.1.4: Calculate Item Count

**Action:** Count items across properties
**File:** `/src/app/api/user/dashboard/stats/route.ts`

```typescript
let itemCount = 0;
if (propertyIds.length > 0) {
  const { count } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .in('property_id', propertyIds);
  itemCount = count || 0;
}
```

### Task 2.1.5: Calculate Distinct Room Count

**Action:** Query distinct location values
**File:** `/src/app/api/user/dashboard/stats/route.ts`

```typescript
let roomCount = 0;
if (propertyIds.length > 0) {
  // Get distinct non-null locations
  const { data: locations } = await supabase
    .from('items')
    .select('location')
    .in('property_id', propertyIds)
    .not('location', 'is', null);

  // Count distinct values
  const uniqueLocations = new Set(locations?.map(l => l.location).filter(Boolean));
  roomCount = uniqueLocations.size;
}
```

### Task 2.1.6: Calculate Distinct Tag Count

**Action:** Query and aggregate unique tags
**File:** `/src/app/api/user/dashboard/stats/route.ts`

```typescript
let tagCount = 0;
if (propertyIds.length > 0) {
  // Get all tags (stored as array field or JSONB)
  const { data: itemsWithTags } = await supabase
    .from('items')
    .select('tags')
    .in('property_id', propertyIds)
    .not('tags', 'is', null);

  // Flatten and dedupe all tags
  const allTags = new Set<string>();
  itemsWithTags?.forEach(item => {
    if (Array.isArray(item.tags)) {
      item.tags.forEach(tag => allTags.add(tag));
    }
  });
  tagCount = allTags.size;
}
```

### Task 2.1.7: Return Response

**Action:** Format and return JSON response
**File:** `/src/app/api/user/dashboard/stats/route.ts`

```typescript
return NextResponse.json({
  success: true,
  data: {
    itemCount,
    roomCount,
    tagCount
  }
});
```

### Task 2.1.8: Error Handling

**Action:** Add try/catch with proper error responses
**File:** `/src/app/api/user/dashboard/stats/route.ts`

```typescript
try {
  // ... all logic
} catch (error) {
  console.error('Error fetching dashboard stats:', error);
  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  );
}
```

---

## 5. Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Description |
|-----------|-------------|
| `/src/app/api/user/dashboard/stats/route.ts` | New API route for dashboard statistics |

### Files to READ (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/user/stats/route.ts` | Auth pattern, property query pattern |
| `/src/app/api/user/properties/summary/route.ts` | Item count pattern |
| `/src/lib/supabase-server.ts` | Server-side Supabase client creation |

### No Modifications Required

The following files should NOT be modified for this task:
- `/src/app/dashboard2/page.tsx` (Phase 2.4 - separate task)
- Any existing API routes
- Database schema (assumes `location` and `tags` fields exist)

---

## 6. Dependencies

### Internal Dependencies

| Dependency | Import Path | Usage |
|------------|-------------|-------|
| `createSupabaseServer` | `@/lib/supabase-server` | Server-side Supabase client |
| `NextRequest`, `NextResponse` | `next/server` | Request/response handling |

### Database Tables

| Table | Access Type | Fields Used |
|-------|-------------|-------------|
| `account_users` | SELECT | `account_id`, `user_id` |
| `properties` | SELECT | `id`, `user_id`, `account_id` |
| `items` | SELECT | `property_id`, `location`, `tags` |

---

## 7. Acceptance Criteria

From REQ-122:

- [ ] Statistics accurately reflect the current user's total item count
- [ ] Room/location count represents distinct location names from all items belonging to the user
- [ ] Tag count represents all unique tags applied across the user's items
- [ ] All statistics display zero when the user has no data, without errors
- [ ] Statistics update when the user creates, modifies, or deletes relevant data
- [ ] API response time remains under 500ms for typical user data volumes

### Additional Verification

- [ ] Endpoint returns 401 for unauthenticated requests
- [ ] Endpoint returns 404 if user has no account association
- [ ] Empty arrays/null values don't cause errors
- [ ] Response matches expected shape: `{ success, data: { itemCount, roomCount, tagCount } }`

---

## 8. Testing Strategy

### Manual Testing

1. **Authenticated request with data:**
   ```bash
   curl -X GET http://localhost:3000/api/user/dashboard/stats \
     -H "Authorization: Bearer <token>"
   ```

2. **Unauthenticated request:**
   ```bash
   curl -X GET http://localhost:3000/api/user/dashboard/stats
   # Expected: 401 Unauthorized
   ```

3. **New user with no data:**
   - Create fresh user
   - Call endpoint
   - Verify: `{ success: true, data: { itemCount: 0, roomCount: 0, tagCount: 0 } }`

4. **User with items but no locations/tags:**
   - Create items without location/tags fields
   - Verify: `itemCount > 0`, `roomCount: 0`, `tagCount: 0`

### Edge Cases

- User with multiple properties
- Items with empty string locations (should not count)
- Items with empty tags array (should not count)
- Items with duplicate locations across properties (should count as 1)
- Items with duplicate tags (should count as 1)

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| `location` field doesn't exist in DB | Medium | High | Verify schema before implementation; if missing, return 0 |
| `tags` field format differs (string vs array) | Medium | Medium | Check actual DB format; adapt query accordingly |
| Performance with large datasets | Low | Medium | Use efficient queries with `.select()` projection |
| Rate limiting needed | Low | Low | Can add later if needed |

---

## 10. Estimated Effort

| Task | Estimate |
|------|----------|
| Create file structure | 5 min |
| Implement auth + property queries | 15 min |
| Implement statistics queries | 20 min |
| Error handling | 10 min |
| Testing | 20 min |
| **Total** | **~70 min** |

---

## 11. Next Steps After Implementation

After completing Task 2.1 (this task):

1. **Task 2.2:** Create `useDashboardStats` hook (`/src/hooks/useDashboardStats.ts`)
2. **Task 2.3:** Create `StatisticsCards` component (`/src/components/SimpleDashboard/StatisticsCards.tsx`)
3. **Task 2.4:** Integrate into Dashboard Page (`/src/app/dashboard2/page.tsx`)

---

## References

- [PRD: Dashboard 2 - Simple Dashboard](/docs/prd/PRD_Dashboard_2_Simple_Dashboard.md)
- [Implementation Plan (REVISED)](/docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md)
- [Airbnb Design System](/docs/prd/airbnb_designsystem.md)
- [Existing Stats API](/src/app/api/user/stats/route.ts)
