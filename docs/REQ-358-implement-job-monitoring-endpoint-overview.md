# REQ-358: Implement Job Monitoring Endpoint - Implementation Overview

**Document Created:** 2026-01-19
**Document Last Modified:** 2026-01-19
**Request ID:** REQ-358
**Epic:** L10N Epic 3 - Dynamic Content Translation
**Phase:** 5 - Job Processing Trigger Setup
**Task ID:** 5.3
**Size Estimate:** M (Medium)

---

## Summary

Create a GET endpoint at `/src/app/api/admin/translation-jobs/route.ts` that returns real-time translation job queue statistics and operational health metrics. The endpoint supports filtering by entity type and job status to enable administrators to monitor queue depth, processing throughput, and error rates.

---

## Current Behavior

No API endpoint exists to query the current state of the translation job queue or retrieve statistics about processing activity. Monitoring the translation pipeline requires direct database access to query job status counts. There is no centralized view of queue health metrics or processing performance indicators.

---

## Expected Behavior

When a GET request is made to `/api/admin/translation-jobs`, the API:

1. Validates that the requesting user has service role or administrator permissions
2. Accepts optional `entityType` and `status` query parameters for filtering
3. Queries the translation job queue to calculate real-time statistics:
   - **Queued count**: Jobs waiting for processing
   - **Processing count**: Jobs currently being executed
   - **Completed (last hour)**: Jobs completed successfully in the last hour
   - **Failed (last hour)**: Jobs that failed in the last hour
4. Returns all statistics in a structured JSON response with timestamp metadata
5. Includes cache-friendly headers with short-lived cache duration (10 seconds)

---

## Technical Context

### Existing Infrastructure

| Component | Location | Usage |
|-----------|----------|-------|
| Admin auth validation | `/src/lib/auth-server.ts` | `validateAdminAuth()` pattern for authentication |
| Translation job queue | `/src/lib/job-queue/translation-jobs.ts` | Job status queries, `getJobsByStatus()` |
| Job types | `/src/lib/job-queue/translation-jobs.types.ts` | `JobStatus`, `EntityType`, `TranslationJob` types |
| Supabase admin client | `/src/lib/supabase.ts` | `supabaseAdmin` for database queries |
| Admin API patterns | `/src/app/api/admin/translate/route.ts` | Reference implementation for admin endpoints |

### Database Schema

The endpoint queries the `translation_jobs` table with these relevant columns:
- `id` (uuid)
- `entity_type` (string: 'item', 'article', 'link', 'tag')
- `status` (string: 'queued', 'processing', 'completed', 'failed')
- `created_at` (timestamp)
- `completed_at` (timestamp, nullable)
- `started_at` (timestamp, nullable)

### Existing Patterns to Follow

1. **Authentication Pattern** (from `/src/app/api/admin/translate/route.ts`):
```typescript
const authResult = await validateAdminAuth(request);
if (authResult.error) {
  return authResult.error;
}
if (!authResult.isAdmin && !authResult.isSysAdmin) {
  return NextResponse.json(
    { success: false, error: 'Admin access required', code: 'FORBIDDEN' },
    { status: 403 }
  );
}
```

2. **Query Parameter Validation** (from existing endpoints):
```typescript
const { searchParams } = new URL(request.url);
const entityType = searchParams.get('entityType');
const status = searchParams.get('status');
```

3. **Response Format** (consistent with project):
```typescript
{
  success: boolean;
  data?: { ... };
  error?: string;
  code?: string;
}
```

---

## Implementation Approach

### Step 1: Create Route Handler File

Create `/src/app/api/admin/translation-jobs/route.ts` with the GET handler structure.

### Step 2: Implement Authentication

Use `validateAdminAuth()` to validate admin/sysadmin access or service role authentication.

### Step 3: Implement Query Parameter Validation

Parse and validate optional `entityType` and `status` query parameters:
- `entityType`: Must be one of 'item', 'article', 'link', 'tag'
- `status`: Must be one of 'queued', 'processing', 'completed', 'failed'

### Step 4: Implement Statistics Queries

Execute efficient COUNT queries against `translation_jobs` table:
1. Count queued jobs
2. Count processing jobs
3. Count completed jobs (where `completed_at` >= 1 hour ago)
4. Count failed jobs (where `completed_at` >= 1 hour ago AND status = 'failed')

Apply optional filters to all queries.

### Step 5: Build Response

Return JSON response with:
- `queuedCount`
- `processingCount`
- `completedLastHour`
- `failedLastHour`
- `totalJobs` (optional, when no status filter)
- `timestamp`
- `appliedFilters`

### Step 6: Add Cache Headers

Include `Cache-Control: max-age=10` for short-term caching.

---

## Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/admin/translation-jobs/route.ts` | Main route handler with GET handler for job statistics |

### Files to READ (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/auth-server.ts` | Authentication patterns (`validateAdminAuth`) |
| `/src/lib/job-queue/translation-jobs.types.ts` | Type definitions (`JobStatus`, `EntityType`) |
| `/src/lib/job-queue/translation-jobs.ts` | Query patterns and database access |
| `/src/lib/supabase.ts` | `supabaseAdmin` client usage |
| `/src/app/api/admin/translate/route.ts` | Admin endpoint reference implementation |

### Database Tables to QUERY (Read-Only)

| Table | Operations |
|-------|------------|
| `translation_jobs` | COUNT queries with filters on `status`, `entity_type`, `completed_at` |

---

## API Contract

### Request

```
GET /api/admin/translation-jobs
GET /api/admin/translation-jobs?entityType=item
GET /api/admin/translation-jobs?status=failed
GET /api/admin/translation-jobs?entityType=article&status=queued
```

### Query Parameters

| Parameter | Type | Required | Valid Values | Description |
|-----------|------|----------|--------------|-------------|
| `entityType` | string | No | 'item', 'article', 'link', 'tag' | Filter statistics by content type |
| `status` | string | No | 'queued', 'processing', 'completed', 'failed' | Filter to show only specific status count |

### Response (200 OK)

```typescript
interface JobMonitoringResponse {
  success: true;
  data: {
    /** Count of jobs with status 'queued' */
    queuedCount: number;
    /** Count of jobs with status 'processing' */
    processingCount: number;
    /** Count of jobs completed in the last hour */
    completedLastHour: number;
    /** Count of jobs failed in the last hour */
    failedLastHour: number;
    /** Total count of all jobs (when no status filter applied) */
    totalJobs?: number;
    /** ISO timestamp when statistics were calculated */
    timestamp: string;
    /** Applied filters, null if none */
    appliedFilters: {
      entityType: string | null;
      status: string | null;
    } | null;
  };
}
```

### Response Headers

```
Content-Type: application/json
Cache-Control: max-age=10
```

### Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 400 | `INVALID_REQUEST` | Invalid entityType or status parameter |
| 401 | `UNAUTHORIZED` | Missing or invalid authentication |
| 403 | `FORBIDDEN` | User is not an administrator |
| 500 | `SERVER_ERROR` | Database query failure |

---

## Type Definitions

```typescript
// src/app/api/admin/translation-jobs/route.ts

type SupportedEntityType = 'item' | 'article' | 'link' | 'tag';
type SupportedJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

interface JobStatistics {
  queuedCount: number;
  processingCount: number;
  completedLastHour: number;
  failedLastHour: number;
  totalJobs?: number;
  timestamp: string;
  appliedFilters: {
    entityType: string | null;
    status: string | null;
  } | null;
}

interface JobMonitoringResponse {
  success: boolean;
  data?: JobStatistics;
  error?: string;
  code?: string;
}
```

---

## Acceptance Criteria Checklist

- [ ] Route handler file created at `/src/app/api/admin/translation-jobs/route.ts`
- [ ] GET handler validates authentication using service role key or admin user credentials
- [ ] Unauthenticated requests return 401 Unauthorized with descriptive error message
- [ ] Non-administrator users without service role return 403 Forbidden
- [ ] Handler accepts optional `entityType` query parameter for filtering
- [ ] When `entityType` is provided, validates it is one of: 'item', 'article', 'link', 'tag'
- [ ] Invalid `entityType` values return 400 Bad Request
- [ ] Handler accepts optional `status` query parameter for filtering
- [ ] When `status` is provided, validates it is one of: 'queued', 'processing', 'completed', 'failed'
- [ ] Invalid `status` values return 400 Bad Request
- [ ] Handler queries job queue table to count jobs with status 'queued'
- [ ] Handler queries job queue table to count jobs with status 'processing'
- [ ] Handler queries job queue table to count jobs completed within the last hour
- [ ] Handler queries job queue table to count jobs failed within the last hour
- [ ] When `entityType` filter is provided, all count queries are filtered by specified entity type
- [ ] When `status` filter is provided, only the count for specified status is returned
- [ ] Response includes `queuedCount` field
- [ ] Response includes `processingCount` field
- [ ] Response includes `completedLastHour` field
- [ ] Response includes `failedLastHour` field
- [ ] Response includes `timestamp` field with ISO timestamp
- [ ] Response includes `appliedFilters` object showing active filters
- [ ] Handler returns 200 OK with all count fields even when counts are zero
- [ ] Database query errors return 500 Internal Server Error
- [ ] Handler logs monitoring requests including filter parameters
- [ ] Response includes Cache-Control header with max-age of 10 seconds
- [ ] Implementation uses efficient COUNT queries with appropriate WHERE clauses
- [ ] One-hour window uses server-side database timestamp comparison
- [ ] Response includes `totalJobs` field when no status filter is applied
- [ ] Response time remains under 500ms under normal load conditions

---

## Dependencies

### Prerequisite Tasks

| Task ID | Description | Status |
|---------|-------------|--------|
| Phase 1 Tasks | Translation Job Queue infrastructure (REQ-243) | Required |
| REQ-332 | Job Processing Trigger API Route (establishes admin endpoint patterns) | Reference |
| REQ-276 | Job Prioritization (provides context for queue ordering) | Reference |

### Downstream Consumers

- Admin dashboard for translation monitoring
- Operations monitoring tools
- Alerting systems for queue backlog detection

---

## Performance Considerations

1. **Efficient COUNT queries**: Use COUNT(*) with appropriate WHERE clauses instead of retrieving full job records
2. **Index usage**: Ensure queries leverage existing indexes on `status` and `completed_at` columns
3. **Database connection**: Use `supabaseAdmin` for server-side queries
4. **Cache headers**: Short 10-second cache to reduce database load from frequent polling

---

## Sample Implementation Skeleton

```typescript
// /src/app/api/admin/translation-jobs/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase';

const VALID_ENTITY_TYPES = ['item', 'article', 'link', 'tag'] as const;
const VALID_STATUSES = ['queued', 'processing', 'completed', 'failed'] as const;

export async function GET(request: NextRequest) {
  // 1. Authenticate admin user
  // 2. Parse and validate query parameters
  // 3. Execute COUNT queries with filters
  // 4. Build and return response with cache headers
}
```

---

## Testing Recommendations

1. **Unit Tests**:
   - Test query parameter validation (valid/invalid entityType, status)
   - Test authentication rejection for non-admins
   - Test response structure matches contract

2. **Integration Tests**:
   - Test actual database queries return correct counts
   - Test filtering by entityType correctly limits results
   - Test filtering by status correctly limits results
   - Test one-hour window calculation accuracy

3. **Load Tests**:
   - Verify response time under 500ms with populated job queue
   - Test concurrent requests don't degrade performance

---

## References

- **Implementation Plan**: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Phase 5, Task 5.3)
- **Request Document**: `/docs/gen_requests_epic3.md` (REQ-358)
- **Related Endpoints**: REQ-332 (Job Processing), REQ-334 (original monitoring request)
- **Admin Auth Pattern**: `/src/lib/auth-server.ts`
- **Job Queue Module**: `/src/lib/job-queue/`
