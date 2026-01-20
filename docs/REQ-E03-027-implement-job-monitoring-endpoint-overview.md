# Implementation Overview: REQ-E03-027 - Implement Job Monitoring Endpoint

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E03-027
**Epic:** Epic 3 - Dynamic Content Translation
**Phase:** 5 - Job Processing Trigger Setup
**Task ID:** 5.3
**Size:** M (Medium)
**Priority:** P1 - High

---

## Summary

Implement an administrative API endpoint that returns real-time statistics about the translation job queue, including job counts by status, entity type filtering, and time-based metrics. This endpoint provides operational visibility into the translation system health and performance.

---

## Request Reference

**From:** `/docs/gen_requests_epic3.md` - Request #27

### Current Behavior
No API endpoint exists for monitoring the translation job queue health and status. Administrators cannot assess translation system performance, identify processing bottlenecks, or track job completion rates without direct database access.

### Expected Behavior
A GET endpoint is created at `/src/app/api/admin/translation-jobs/route.ts` that returns comprehensive translation job queue statistics:
- Queued count
- Processing count
- Completed (last hour)
- Failed (last hour)
- Filter by entityType, status

---

## Implementation Plan Reference

**Source:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`

**Phase 5 - Task 5.3:**
> Implement job monitoring endpoint
> - File: `/src/app/api/admin/translation-jobs/route.ts`
> - GET handler returns job queue statistics

---

## Technical Context

### Dependencies

| Dependency | Location | Status |
|------------|----------|--------|
| Translation jobs table | Database `translation_jobs` | **Required** - Exists from Epic 1 |
| Job queue types | `/src/lib/job-queue/translation-jobs.types.ts` | **Required** - Exists |
| Admin auth utility | `/src/lib/auth-server.ts` | **Required** - Exists |
| Supabase admin client | `/src/lib/supabase.ts` | **Required** - Exists |

### Existing Patterns

| Pattern | Source | Usage |
|---------|--------|-------|
| Admin auth validation | `/src/lib/auth-server.ts:validateAdminAuth` | Authenticate and authorize admin access |
| Response format | `/src/app/api/admin/analytics/route.ts` | Follow success/error response structure |
| Query parameter handling | `/src/app/api/admin/analytics/route.ts` | Parse and validate entityType, status filters |
| Database aggregation | `/src/app/api/admin/analytics/route.ts` | COUNT queries with filters |

### Database Schema

**Table:** `translation_jobs`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| entity_type | string | 'article' \| 'item' \| 'link' \| 'tag' |
| entity_id | string | Reference to content entity |
| source_language | string | Source language code |
| target_language | string | Target language code |
| status | string | 'queued' \| 'processing' \| 'completed' \| 'failed' |
| attempts | number | Retry counter |
| error_message | string | Failure reason |
| created_at | timestamp | Job creation time |
| started_at | timestamp | Processing start time |
| completed_at | timestamp | Processing completion time |
| locked_by | string | Worker ID holding lock |
| locked_at | timestamp | Lock acquisition time |

---

## Architecture

### Component Structure

```
/src/app/api/admin/
└── translation-jobs/
    └── route.ts              # NEW: Job monitoring endpoint
```

### Data Flow

```
GET /api/admin/translation-jobs
    │
    ├── 1. Authenticate via validateAdminAuth
    │       ├── Return 401 if unauthenticated
    │       └── Return 403 if not admin
    │
    ├── 2. Parse query parameters
    │       ├── entityType (optional): 'item' | 'article' | 'link' | 'tag'
    │       ├── status (optional): 'queued' | 'processing' | 'completed' | 'failed'
    │       └── Return 400 if invalid values
    │
    ├── 3. Execute aggregate queries on translation_jobs
    │       │
    │       ├── Query 1: COUNT by status (queued, processing)
    │       ├── Query 2: COUNT completed in last hour
    │       ├── Query 3: COUNT failed in last hour
    │       ├── Query 4: Entity type breakdown
    │       ├── Query 5: Language breakdown
    │       ├── Query 6: Calculate average queue wait time
    │       └── Query 7: Identify oldest queued job
    │
    └── 4. Return statistics response
            {
              success: true,
              data: {
                queuedCount,
                processingCount,
                completedLastHour: { count, window },
                failedLastHour: { count, window },
                entityTypeBreakdown,
                languageBreakdown,
                averageProcessingDurationMs,
                averageQueueWaitTimeMs,
                oldestQueuedJobTimestamp,
                responseTimestamp
              }
            }
```

### Response Structure

```typescript
interface JobMonitoringResponse {
  success: boolean;
  data: {
    // Current queue state
    queuedCount: number;
    processingCount: number;

    // Time-based metrics
    completedLastHour: {
      count: number;
      windowStart: string;  // ISO timestamp
      windowEnd: string;    // ISO timestamp
    };
    failedLastHour: {
      count: number;
      windowStart: string;
      windowEnd: string;
    };

    // Breakdown by entity type
    entityTypeBreakdown: {
      item: EntityTypeStats;
      article: EntityTypeStats;
      link: EntityTypeStats;
      tag: EntityTypeStats;
    };

    // Breakdown by target language
    languageBreakdown: {
      [languageCode: string]: {
        queued: number;
        processing: number;
        completed: number;
        failed: number;
      };
    };

    // Performance metrics
    averageProcessingDurationMs: number | null;  // null if no completed jobs
    averageQueueWaitTimeMs: number | null;       // null if no processed jobs

    // Queue health indicators
    oldestQueuedJobTimestamp: string | null;     // null if queue is empty

    // Response metadata
    responseTimestamp: string;
  };
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
}

interface EntityTypeStats {
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  total: number;
}
```

---

## Implementation Tasks

### Task 1: Create Route File Structure

**File:** `/src/app/api/admin/translation-jobs/route.ts`

Create the route handler file with:
- Import statements for auth utilities, supabase client, types
- Type definitions for response structure
- GET handler function skeleton

### Task 2: Implement Authentication

Implement admin authentication check following the standard pattern:
```typescript
const authResult = await validateAdminAuth(request);
if (authResult.error) return authResult.error;
if (!authResult.isAdmin) {
  return NextResponse.json(
    { success: false, error: 'Admin access required', code: 'FORBIDDEN' },
    { status: 403 }
  );
}
```

### Task 3: Implement Query Parameter Parsing

Parse and validate optional query parameters:
- `entityType`: Must be one of 'item', 'article', 'link', 'tag' if provided
- `status`: Must be one of 'queued', 'processing', 'completed', 'failed' if provided
- Return 400 error for invalid values

### Task 4: Implement Statistics Queries

Execute optimized database queries using Supabase:

**Query 1: Queue Counts**
```typescript
// Count jobs in queued and processing status
const { count: queuedCount } = await supabaseAdmin
  .from('translation_jobs')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'queued');

const { count: processingCount } = await supabaseAdmin
  .from('translation_jobs')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'processing');
```

**Query 2: Last Hour Completed**
```typescript
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
const { count: completedLastHour } = await supabaseAdmin
  .from('translation_jobs')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'completed')
  .gte('completed_at', oneHourAgo);
```

**Query 3: Last Hour Failed**
```typescript
const { count: failedLastHour } = await supabaseAdmin
  .from('translation_jobs')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'failed')
  .gte('completed_at', oneHourAgo);
```

**Query 4: Entity Type Breakdown**
```typescript
// Use separate queries for each entity type and status combination
// Apply entityType filter if provided
```

**Query 5: Language Breakdown**
```typescript
// Group by target_language and status
// Returns counts per language/status combination
```

**Query 6: Average Processing Time**
```typescript
// Calculate average of (completed_at - started_at) for completed jobs
const { data: processingTimes } = await supabaseAdmin
  .from('translation_jobs')
  .select('started_at, completed_at')
  .eq('status', 'completed')
  .not('started_at', 'is', null)
  .not('completed_at', 'is', null)
  .gte('completed_at', oneHourAgo);
```

**Query 7: Oldest Queued Job**
```typescript
const { data: oldestJob } = await supabaseAdmin
  .from('translation_jobs')
  .select('created_at')
  .eq('status', 'queued')
  .order('created_at', { ascending: true })
  .limit(1)
  .single();
```

### Task 5: Apply Filters

When `entityType` or `status` query parameters are provided, apply them to all relevant queries:
- Filter entity breakdown to specific entity type
- Filter status counts to specific status
- Ensure all metrics reflect filtered scope

### Task 6: Assemble and Return Response

Combine all query results into the response structure:
- Calculate time windows for hourly metrics
- Compute averages from raw data
- Add response timestamp
- Set Cache-Control header for 30-second caching

### Task 7: Add Error Handling

Implement comprehensive error handling:
- Catch database errors and return 500 status
- Log errors with context prefix `[TranslationJobsMonitor]`
- Return descriptive error messages for debugging

---

## Authorized Files and Functions for Modification

### New Files

| File | Purpose |
|------|---------|
| `/src/app/api/admin/translation-jobs/route.ts` | Job monitoring endpoint implementation |

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `/src/lib/auth-server.ts` | Import `validateAdminAuth` function |
| `/src/lib/supabase.ts` | Import `supabaseAdmin` client |
| `/src/lib/job-queue/translation-jobs.types.ts` | Import `JobStatus`, `EntityType` types |
| `/src/app/api/admin/analytics/route.ts` | Reference for response patterns |

### Functions to Use

| Function | Source | Usage |
|----------|--------|-------|
| `validateAdminAuth(request)` | `/src/lib/auth-server.ts` | Authenticate admin access |
| `supabaseAdmin.from()` | `/src/lib/supabase.ts` | Execute database queries |

---

## Type Definitions

### New Types to Create

```typescript
// In route.ts or separate types file

export type ValidEntityType = 'item' | 'article' | 'link' | 'tag';
export type ValidJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface JobMonitoringQueryParams {
  entityType?: ValidEntityType;
  status?: ValidJobStatus;
}

export interface EntityTypeStats {
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  total: number;
}

export interface LanguageStats {
  queued: number;
  processing: number;
  completed: number;
  failed: number;
}

export interface TimeWindowMetric {
  count: number;
  windowStart: string;
  windowEnd: string;
}

export interface JobMonitoringData {
  queuedCount: number;
  processingCount: number;
  completedLastHour: TimeWindowMetric;
  failedLastHour: TimeWindowMetric;
  entityTypeBreakdown: Record<ValidEntityType, EntityTypeStats>;
  languageBreakdown: Record<string, LanguageStats>;
  averageProcessingDurationMs: number | null;
  averageQueueWaitTimeMs: number | null;
  oldestQueuedJobTimestamp: string | null;
  responseTimestamp: string;
}

export interface JobMonitoringResponse {
  success: boolean;
  data: JobMonitoringData;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
}

export interface JobMonitoringErrorResponse {
  success: false;
  error: string;
  code: string;
}
```

---

## Acceptance Criteria Verification

| Criteria | Implementation |
|----------|----------------|
| GET endpoint exists at route matching pattern | Task 1: Create route file |
| Endpoint enforces authentication for administrative metrics | Task 2: validateAdminAuth |
| Endpoint returns 403 error for non-admin users | Task 2: Authorization check |
| Endpoint accepts optional entityType query parameter | Task 3: Query param parsing |
| Endpoint validates entityType against supported values | Task 3: Validation |
| Endpoint returns 400 error for invalid entityType values | Task 3: Error handling |
| Endpoint accepts optional status query parameter | Task 3: Query param parsing |
| Endpoint validates status against supported values | Task 3: Validation |
| Endpoint returns 400 error for invalid status values | Task 3: Error handling |
| Endpoint queries for queued job count | Task 4: Query 1 |
| Endpoint queries for processing job count | Task 4: Query 1 |
| Endpoint queries for completed jobs in last hour | Task 4: Query 2 |
| Endpoint queries for failed jobs in last hour | Task 4: Query 3 |
| Endpoint calculates average queue wait time | Task 4: Query 6 |
| Endpoint identifies oldest queued job timestamp | Task 4: Query 7 |
| Endpoint aggregates job counts by entity type | Task 4: Query 4 |
| Endpoint aggregates job counts by target language | Task 4: Query 5 |
| Endpoint calculates average processing duration | Task 4: Query 6 |
| Endpoint applies entityType filter when provided | Task 5: Apply filters |
| Endpoint applies status filter when provided | Task 5: Apply filters |
| Endpoint returns 200 status with JSON payload | Task 6: Response assembly |
| Response includes queuedCount field | Task 6: Response structure |
| Response includes processingCount field | Task 6: Response structure |
| Response includes completedLastHour with count and window | Task 6: Response structure |
| Response includes failedLastHour with count and window | Task 6: Response structure |
| Response includes entityTypeBreakdown object | Task 6: Response structure |
| Response includes languageBreakdown object | Task 6: Response structure |
| Response includes averageProcessingDurationMs | Task 6: Response structure |
| Response includes averageQueueWaitTimeMs | Task 6: Response structure |
| Response includes oldestQueuedJobTimestamp | Task 6: Response structure |
| Response includes responseTimestamp | Task 6: Response structure |
| Endpoint uses aggregate queries for efficiency | Task 4: COUNT queries |
| Endpoint completes within 500ms | Task 4: Optimized queries |
| Endpoint handles database errors with 500 status | Task 7: Error handling |
| Response includes Cache-Control header with max-age=30 | Task 6: Response headers |
| TypeScript types are defined | Type definitions section |

---

## Testing Considerations

### Unit Tests

1. **Parameter Validation**
   - Valid entityType values accepted
   - Invalid entityType returns 400
   - Valid status values accepted
   - Invalid status returns 400
   - Multiple parameters combined correctly

2. **Query Filtering**
   - EntityType filter applied to all queries
   - Status filter applied to relevant queries
   - Combined filters work correctly

3. **Time Window Calculations**
   - Last hour window calculated correctly
   - Average calculations handle edge cases (no data, nulls)

### Integration Tests

1. **Authentication**
   - Unauthenticated request returns 401
   - Non-admin user returns 403
   - Admin user succeeds
   - System admin succeeds

2. **Statistics Accuracy**
   - Queued count matches actual queued jobs
   - Processing count matches actual processing jobs
   - Hourly metrics reflect correct time window
   - Entity type breakdown totals match individual counts

3. **Performance**
   - Response time under 500ms with typical data
   - Response time acceptable with large queue (1000+ jobs)

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Slow queries with large job table | Medium | Medium | Use COUNT with head:true, add database indexes |
| Cache stale during high activity | Low | Low | 30-second cache appropriate for monitoring |
| Average calculations with no data | Low | Low | Return null for averages when no completed jobs |
| Time zone issues | Low | Low | Use ISO timestamps consistently |

---

## References

- Request: `/docs/gen_requests_epic3.md` - REQ-E03-027
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- Auth Pattern: `/src/lib/auth-server.ts`
- Analytics Pattern: `/src/app/api/admin/analytics/route.ts`
- Job Queue Types: `/src/lib/job-queue/translation-jobs.types.ts`
- Database Types: `/src/lib/supabase.ts`

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation*
*Phase 5: Job Processing Trigger Setup - Task 5.3*
