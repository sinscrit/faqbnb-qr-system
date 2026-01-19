# REQ-334: Implement Job Monitoring Endpoint - Implementation Breakdown

**Document Created:** 2026-01-18 19:45:00 UTC
**Document Modified:** 2026-01-18 19:45:00 UTC
**Request ID:** REQ-334
**Epic:** L10N Epic 3 - Dynamic Content Translation
**Phase:** 5 - Job Processing Trigger Setup
**Task ID:** 5.3
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md

---

## 1. Summary

This document provides the implementation breakdown for creating a job monitoring endpoint that returns comprehensive job queue statistics and operational health metrics for the translation pipeline. The endpoint will enable administrators to monitor queue depth, processing throughput, and error rates for translation jobs.

---

## 2. Request Details

**Title:** Create Translation Job Monitoring Endpoint

**Type:** NEW FEATURE

**Size:** M

**Source:** docs/gen_requests_epic3.md - Request #334

### Description

The system must provide a RESTful API endpoint that returns comprehensive job queue statistics and operational health metrics for the translation pipeline. Administrators will use this endpoint to:
- Monitor queue depth (queued count, processing count)
- Track processing throughput (completed in last hour)
- Identify error rates (failed in last hour)
- Filter statistics by entity type and status

### Current Behavior

No API endpoint exists to query the current state of the translation job queue or obtain operational metrics about translation processing activity. Administrators cannot determine how many translation jobs are queued, actively processing, or have recently completed or failed without direct database access.

### Expected Behavior

When a GET request is made to `/api/admin/translation-jobs`, the API:
1. Validates that the requesting user has service role or administrator permissions
2. Accepts optional query parameters for filtering by `entityType` and `status`
3. Queries the `translation_jobs` table to calculate real-time statistics
4. Returns structured JSON response with queue statistics and metadata

---

## 3. Technical Specification

### 3.1 API Contract

**Endpoint:** `GET /api/admin/translation-jobs`

**Authentication:** Service role key OR administrator user credentials

**Query Parameters:**
| Parameter | Type | Required | Values | Description |
|-----------|------|----------|--------|-------------|
| `entityType` | string | No | `item`, `article`, `link`, `tag` | Filter statistics by content entity type |
| `status` | string | No | `queued`, `processing`, `completed`, `failed` | Filter to show only specific status count |

**Response Format (200 OK):**
```typescript
interface TranslationJobStatsResponse {
  success: true;
  data: {
    queuedCount: number;          // Jobs with status 'queued'
    processingCount: number;      // Jobs with status 'processing'
    completedLastHour: number;    // Jobs completed in last hour
    failedLastHour: number;       // Jobs failed in last hour
    totalJobs?: number;           // Overall count when no status filter
    timestamp: string;            // ISO8601 timestamp when stats calculated
    appliedFilters: {
      entityType: string | null;
      status: string | null;
    } | null;
  };
}
```

**Error Responses:**
- `400 Bad Request`: Invalid entityType or status parameter
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: User lacks admin/service role permissions
- `500 Internal Server Error`: Database query failure

### 3.2 Database Schema Reference

The endpoint queries the existing `translation_jobs` table:

```typescript
// From src/lib/supabase.ts
translation_jobs: {
  Row: {
    id: string
    entity_type: string           // 'item' | 'article' | 'link' | 'tag'
    entity_id: string
    source_language: string
    target_language: string
    status: string                // 'queued' | 'processing' | 'completed' | 'failed'
    attempts: number | null
    error_message: string | null
    created_at: string | null
    started_at: string | null
    completed_at: string | null   // Used for last hour calculations
  }
}
```

### 3.3 Query Strategy

For efficient counting, the implementation will use Supabase `count` queries with appropriate WHERE clauses:

```sql
-- Queued count
SELECT count(*) FROM translation_jobs WHERE status = 'queued';

-- Processing count
SELECT count(*) FROM translation_jobs WHERE status = 'processing';

-- Completed last hour (using completed_at for accurate timing)
SELECT count(*) FROM translation_jobs
WHERE status = 'completed'
AND completed_at >= NOW() - INTERVAL '1 hour';

-- Failed last hour (using completed_at as the failure timestamp)
SELECT count(*) FROM translation_jobs
WHERE status = 'failed'
AND completed_at >= NOW() - INTERVAL '1 hour';
```

---

## 4. Implementation Steps

### Task 1: Create Route Handler File
**File:** `/src/app/api/admin/translation-jobs/route.ts`
- Create new file with GET handler export
- Follow existing admin route patterns (e.g., `check-sysadmin/route.ts`)

### Task 2: Implement Authentication Validation
- Import and use `validateAdminAuth` from `@/lib/auth-server`
- Verify user has admin role OR check for service role key in Authorization header
- Return 401 for missing auth, 403 for non-admin users

### Task 3: Implement Query Parameter Validation
- Extract `entityType` and `status` from URL searchParams
- Validate `entityType` is one of: `'item'`, `'article'`, `'link'`, `'tag'` (if provided)
- Validate `status` is one of: `'queued'`, `'processing'`, `'completed'`, `'failed'` (if provided)
- Return 400 Bad Request with descriptive error for invalid values

### Task 4: Implement Database Queries
- Query `translation_jobs` table for each count using Supabase client
- Apply `entityType` filter to all queries when provided
- When `status` filter is provided, only return that specific count
- Use efficient COUNT queries with WHERE clauses (not full record retrieval)
- Calculate one-hour window using database timestamp comparison

### Task 5: Build and Return Response
- Assemble response object with all count fields
- Include `timestamp` field with current ISO8601 datetime
- Include `appliedFilters` showing active filters (or null if none)
- Include `totalJobs` when no status filter is applied
- Add `Cache-Control: max-age=10` header for brief caching
- Log request for monitoring purposes

### Task 6: Error Handling
- Wrap database operations in try-catch
- Return 500 Internal Server Error with generic message for DB failures
- Log detailed error information server-side

---

## 5. Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/admin/translation-jobs/route.ts` | Main route handler for job monitoring endpoint |

### Existing Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/auth-server.ts` | `validateAdminAuth` function for authentication |
| `/src/lib/supabase.ts` | Database types and client configuration |
| `/src/app/api/admin/check-sysadmin/route.ts` | Pattern reference for simple admin endpoints |
| `/src/app/api/admin/items/route.ts` | Pattern reference for admin auth with account context |

### Functions to Use

| Function | Source | Usage |
|----------|--------|-------|
| `validateAdminAuth(request)` | `@/lib/auth-server` | Validate admin authentication |
| `supabaseAdmin.from('translation_jobs')` | `@/lib/supabase` | Query translation jobs table |

---

## 6. Acceptance Criteria Checklist

Based on REQ-334 acceptance criteria:

- [ ] Route handler file created at `/src/app/api/admin/translation-jobs/route.ts`
- [ ] GET handler validates authentication using service role key or admin credentials
- [ ] Unauthenticated requests return 401 Unauthorized
- [ ] Non-administrator users without service role return 403 Forbidden
- [ ] Handler accepts optional `entityType` query parameter
- [ ] Handler validates `entityType` is one of: 'item', 'article', 'link', 'tag'
- [ ] Invalid `entityType` values return 400 Bad Request
- [ ] Handler accepts optional `status` query parameter
- [ ] Handler validates `status` is one of: 'queued', 'processing', 'completed', 'failed'
- [ ] Invalid `status` values return 400 Bad Request
- [ ] Handler queries job queue table for `queuedCount`
- [ ] Handler queries job queue table for `processingCount`
- [ ] Handler queries job queue table for `completedLastHour` (completed within 1 hour)
- [ ] Handler queries job queue table for `failedLastHour` (failed within 1 hour)
- [ ] When `entityType` filter provided, all counts filtered by entity type
- [ ] When `status` filter provided, only return that status count (others zero/omitted)
- [ ] Response includes `queuedCount`, `processingCount`, `completedLastHour`, `failedLastHour`
- [ ] Response includes `timestamp` field with calculation time
- [ ] Response includes `appliedFilters` object (or null if no filters)
- [ ] Handler returns 200 OK with all count fields even when counts are zero
- [ ] Database query errors return 500 Internal Server Error
- [ ] Handler logs monitoring requests for operational tracking
- [ ] Response includes `Cache-Control: max-age=10` header
- [ ] Implementation uses efficient COUNT queries (not full record retrieval)
- [ ] Response includes `totalJobs` when no status filter applied
- [ ] One-hour window uses server-side database timestamp comparison

---

## 7. Dependencies

### Upstream Dependencies (Required Before Implementation)
- Epic 1: Translation Job Queue infrastructure - provides `translation_jobs` table schema
- REQ-332: Job Processing Trigger API Route - establishes patterns for admin-only endpoints

### Downstream Dependencies (Depend on This)
- Translation monitoring dashboards
- Alerting systems for queue health
- Operational tooling for translation pipeline management

---

## 8. Testing Requirements

### Unit Tests
- Test authentication validation (success, 401, 403 cases)
- Test query parameter validation (valid, invalid entityType/status)
- Test response structure with various filter combinations
- Test one-hour window calculation accuracy

### Integration Tests
- Test with real database containing various job statuses
- Test filter combinations produce correct counts
- Test cache headers are properly set

### Manual Testing
- Call endpoint with curl using service role key
- Verify counts match database records
- Test all filter combinations

---

## 9. Code Patterns to Follow

### Authentication Pattern (from check-sysadmin/route.ts)
```typescript
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }
    // ... rest of handler
  } catch (error) {
    console.error('ERROR:', error);
    return NextResponse.json(
      { success: false, error: 'Failed', code: 'FAILED' },
      { status: 500 }
    );
  }
}
```

### Response Pattern
```typescript
return NextResponse.json({
  success: true,
  data: {
    queuedCount,
    processingCount,
    completedLastHour,
    failedLastHour,
    totalJobs,
    timestamp: new Date().toISOString(),
    appliedFilters: entityType || status ? { entityType, status } : null
  }
}, {
  headers: {
    'Cache-Control': 'max-age=10'
  }
});
```

### Count Query Pattern
```typescript
const { count, error } = await supabaseAdmin
  .from('translation_jobs')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'queued');
```

---

## 10. Risk Considerations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Performance with large job tables | Low | Medium | Use COUNT with WHERE clauses, avoid full scans |
| Service role key exposure | Low | High | Validate Authorization header properly, use env vars |
| Incorrect one-hour window | Low | Low | Use database NOW() - INTERVAL for server-side calculation |

---

## 11. References

- **Request Definition:** docs/gen_requests_epic3.md (REQ-334)
- **Implementation Plan:** docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md (Phase 5, Task 5.3)
- **Database Types:** src/lib/supabase.ts
- **Auth Utilities:** src/lib/auth-server.ts
- **Similar Endpoint Pattern:** src/app/api/admin/check-sysadmin/route.ts
