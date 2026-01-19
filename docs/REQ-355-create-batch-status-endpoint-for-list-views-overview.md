# REQ-355: Create Batch Translation Status Endpoint for List Views - Implementation Overview

**Last Modified:** 2026-01-19
**Request Type:** NEW FEATURE
**Size:** M (Medium)
**Phase:** 4 - Translation Status & Management APIs
**Task ID:** 4.4
**Implementation Plan Reference:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md

---

## Summary

Create a POST endpoint at `/src/app/api/translations/status/batch/route.ts` that accepts an array of entity references (`{entityType, entityId}`) and returns summary translation status for each entity. This endpoint is optimized for dashboard list views to efficiently fetch translation status for multiple items in a single request.

---

## Technical Context

### Existing Infrastructure (from Epic 1 and Epic 3)

| Component | Location | Purpose |
|-----------|----------|---------|
| Translation jobs table | Database `translation_jobs` | Tracks queued, processing, completed, and failed jobs |
| Job queue types | `/src/lib/job-queue/translation-jobs.types.ts` | Defines `EntityType`, `JobStatus`, `SupportedLanguage` |
| Item translations table | Database `item_translations` | Stores completed item translations |
| Article translations table | Database `article_translations` | Stores completed article translations |
| Link translations table | Database `link_translations` | Stores completed link translations |
| Tag translations table | Database `tag_translations` | Stores completed tag translations |
| Admin auth helper | `/src/lib/auth-server.ts` | `validateAdminAuth` pattern for API authentication |
| Database client | `/src/lib/supabase.ts` | Supabase client with type definitions |

### Supported Languages

- English (en), French (fr), Spanish (es), German (de), Dutch (nl), Italian (it)
- Total: 6 languages, with 5 target languages for any given source

### Entity Types

- `item`, `article`, `link`, `tag` (as defined in `EntityType`)

---

## Implementation Requirements

### Input Contract

```typescript
// POST /api/translations/status/batch
interface BatchStatusRequest {
  entities: EntityReference[];
}

interface EntityReference {
  entityType: 'item' | 'article' | 'link' | 'tag';
  entityId: string; // UUID format
}
```

### Output Contract

```typescript
interface BatchStatusResponse {
  success: boolean;
  data?: EntityStatusSummary[];
  error?: string;
}

interface EntityStatusSummary {
  entityType: 'item' | 'article' | 'link' | 'tag';
  entityId: string;
  overallStatus: 'no_translations' | 'pending' | 'in_progress' | 'completed' | 'partial' | 'failed';
  completedCount: number;    // Languages with completed translations
  pendingCount: number;      // Languages with queued or processing jobs
  failedCount: number;       // Languages with failed jobs
  totalLanguages: number;    // Number of target languages (typically 5)
}
```

### Overall Status Determination Logic

| Condition | Status |
|-----------|--------|
| No jobs and no translations exist | `no_translations` |
| All target languages have completed translations | `completed` |
| All jobs are failed | `failed` |
| Any jobs are in 'processing' status | `in_progress` |
| Any jobs are in 'queued' status | `pending` |
| Mix of completed and pending/failed | `partial` |

---

## Implementation Tasks

### Task 1: Create TypeScript Types for Batch Status

**File:** `/src/app/api/translations/status/batch/types.ts`

Define request and response types:
- `BatchStatusRequest` interface
- `EntityReference` interface
- `BatchStatusResponse` interface
- `EntityStatusSummary` interface
- `OverallStatus` type union

### Task 2: Create the API Route Handler

**File:** `/src/app/api/translations/status/batch/route.ts`

Implement POST handler:
1. Validate authentication using `validateAdminAuth` pattern
2. Parse and validate request body
3. Validate batch size (max 100 entities)
4. Validate each entity reference (valid entityType, UUID format for entityId)
5. Execute optimized database queries
6. Aggregate results into response format
7. Set appropriate Cache-Control headers
8. Return results in same order as input

### Task 3: Implement Optimized Database Query Logic

The query strategy should:
1. Group entities by type for efficient querying
2. Use single queries per entity type rather than N+1 queries
3. Aggregate job status and translation status together
4. Use database-level aggregation where possible

**Query approach:**
```sql
-- For each entity type, get job counts by status
SELECT
  entity_id,
  status,
  COUNT(*) as count
FROM translation_jobs
WHERE entity_type = $1
  AND entity_id = ANY($2::uuid[])
GROUP BY entity_id, status;

-- For each entity type, get completed translation counts
SELECT
  item_id as entity_id,
  COUNT(*) as completed_count
FROM item_translations
WHERE item_id = ANY($1::uuid[])
  AND translation_status = 'completed'
GROUP BY item_id;
```

### Task 4: Implement Request Validation

Validate:
- Request body is valid JSON
- `entities` is a non-empty array
- Array length ≤ 100 (batch size limit)
- Each entity has valid `entityType` (one of: item, article, link, tag)
- Each entity has valid `entityId` (UUID format regex: `/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/`)

Return 400 Bad Request for validation failures with descriptive error messages.

### Task 5: Implement Status Aggregation Logic

Create helper function `computeOverallStatus`:
```typescript
function computeOverallStatus(
  completedCount: number,
  pendingCount: number,  // queued jobs
  processingCount: number,
  failedCount: number,
  totalLanguages: number
): OverallStatus {
  // Implementation logic based on status determination table
}
```

### Task 6: Add Caching Headers

Set Cache-Control header for short-term caching:
```typescript
headers: {
  'Cache-Control': 'private, max-age=10, stale-while-revalidate=30'
}
```

### Task 7: Performance Validation

Ensure endpoint completes within 2 seconds for batches of 100 entities:
- Profile database queries
- Add database indexes if needed (reference Phase 6 indexes from implementation plan)
- Consider using connection pooling

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/translations/status/batch/route.ts` | Main API route handler |
| `/src/app/api/translations/status/batch/types.ts` | TypeScript type definitions |

### Files to Reference (Read-Only)

| File Path | What to Reference |
|-----------|-------------------|
| `/src/lib/auth-server.ts` | `validateAdminAuth` pattern |
| `/src/lib/supabase.ts` | Database client, type definitions for translation tables |
| `/src/lib/job-queue/translation-jobs.types.ts` | `EntityType`, `JobStatus`, `SupportedLanguage` types |
| `/src/app/api/admin/items/route.ts` | API route patterns, error handling, response structure |

### Database Tables Accessed (Read-Only)

| Table | Operations |
|-------|------------|
| `translation_jobs` | SELECT with GROUP BY for job status counts |
| `item_translations` | SELECT with GROUP BY for completed counts |
| `article_translations` | SELECT with GROUP BY for completed counts |
| `link_translations` | SELECT with GROUP BY for completed counts |
| `tag_translations` | SELECT with GROUP BY for completed counts |

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| HTTP Method | POST | Request body may be large (up to 100 entity references); GET has URL length limits |
| Batch size limit | 100 | Balance between efficiency and server load |
| Authentication | Admin auth required | Translation status is owner/admin data |
| Query strategy | Group by entity type | Reduces query count from N to 4 (one per entity type) |
| Status enum | 6 distinct values | Provides granular UI differentiation |
| Caching | 10 second max-age | Status changes frequently during processing |

---

## Error Handling

| Error Condition | HTTP Status | Response |
|-----------------|-------------|----------|
| Invalid/missing auth | 401 | `{ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }` |
| Malformed request body | 400 | `{ success: false, error: 'Invalid request body' }` |
| Empty entities array | 400 | `{ success: false, error: 'Entities array cannot be empty' }` |
| Batch size exceeded | 400 | `{ success: false, error: 'Batch size exceeds limit of 100' }` |
| Invalid entity type | 400 | `{ success: false, error: 'Invalid entityType: {value}' }` |
| Invalid UUID format | 400 | `{ success: false, error: 'Invalid entityId format: {value}' }` |
| Database error | 500 | `{ success: false, error: 'Internal server error' }` |

---

## Testing Requirements

### Unit Tests

1. Test request validation:
   - Empty body returns 400
   - Empty entities array returns 400
   - Batch size > 100 returns 400
   - Invalid entityType returns 400
   - Invalid UUID format returns 400

2. Test status computation:
   - All completed → 'completed'
   - All failed → 'failed'
   - Mix of completed/pending → 'partial'
   - Jobs processing → 'in_progress'
   - Jobs queued → 'pending'
   - No data → 'no_translations'

### Integration Tests

1. Test with authenticated admin user
2. Test with unauthorized user (expect 401)
3. Test batch of mixed entity types
4. Test response order matches input order
5. Test performance with 100 entities

---

## Dependencies

### Required Before Implementation

- Epic 1 translation tables must exist in database
- `validateAdminAuth` helper available in `/src/lib/auth-server.ts`
- Job queue types defined in `/src/lib/job-queue/`

### Downstream Consumers

- Dashboard list views (Epic 5)
- Translation status column components
- Bulk translation management UI

---

## Acceptance Criteria Checklist

- [ ] POST endpoint accepts array of entity references in request body
- [ ] Each entity reference includes entityType field (item, article, link, tag)
- [ ] Each entity reference includes entityId field (UUID)
- [ ] Endpoint supports batch sizes up to 100 entities per request
- [ ] Response returns array of status summaries matching the order of input references
- [ ] Each status summary includes the original entityType and entityId for mapping
- [ ] Each status summary includes overall status (no_translations, pending, in_progress, completed, partial, failed)
- [ ] Each status summary includes completedCount (number of languages with completed translations)
- [ ] Each status summary includes pendingCount (number of languages with queued or processing jobs)
- [ ] Each status summary includes failedCount (number of languages with failed jobs)
- [ ] Each status summary includes totalLanguages (number of target languages configured)
- [ ] Database query uses optimized joins and aggregations to minimize query complexity
- [ ] Endpoint returns 400 when request body is malformed or exceeds batch size limit
- [ ] Endpoint validates entityType values and returns 400 for invalid types
- [ ] Endpoint validates entityId format (must be valid UUID) and returns 400 for invalid format
- [ ] For entities that do not exist, status summary indicates no_translations status with zero counts
- [ ] Response includes appropriate Cache-Control header to allow short-term caching
- [ ] Endpoint completes within 2 seconds for batches of 100 entities
- [ ] Response structure is documented for client-side consumption (TypeScript types)

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Phase 4, Task 4.4)
- PRD: `/docs/prd/PRD_L10N_Epic3_Dynamic_Content_Translation.md`
- Related Task 4.1: Single entity status endpoint at `/api/translations/status/[entityType]/[entityId]/route.ts`
- Epic 1 Foundation: Database schema and translation table definitions
