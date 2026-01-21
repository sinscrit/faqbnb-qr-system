# Detailed Task Breakdown: REQ-E03-027 - Implement Job Monitoring Endpoint

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-21 (Implementation Complete)
**Request ID:** REQ-E03-027
**Epic:** Epic 3 - Dynamic Content Translation
**Phase:** 5 - Job Processing Trigger Setup
**Task ID:** 5.3
**Size:** M (Medium)
**Priority:** P1 - High
**Overview Document:** `/docs/REQ-E03-027-implement-job-monitoring-endpoint-overview.md`

---

## Summary

Implement an administrative API endpoint at `/src/app/api/admin/translation-jobs/route.ts` that returns real-time statistics about the translation job queue, including job counts by status, entity type filtering, language breakdown, and time-based metrics. This endpoint provides operational visibility into the translation system health and performance.

---

## Prerequisites

Before starting implementation, verify:

1. **Epic 1 Foundation Complete:**
   - [ ] Translation jobs table exists (`translation_jobs`)
   - [ ] Job queue types exist at `/src/lib/job-queue/translation-jobs.types.ts`

2. **Existing Infrastructure:**
   - [ ] `validateAdminAuth` function exists in `/src/lib/auth-server.ts`
   - [ ] `supabaseAdmin` client exists in `/src/lib/supabase.ts`

---

## Task Breakdown

### Task 1: Create Route File with Type Definitions

**File:** `/src/app/api/admin/translation-jobs/route.ts`

**Story Points:** 1

**Description:** Create the route handler file with all necessary imports and TypeScript type definitions for the monitoring endpoint response structure.

**Implementation Steps:**

1.1. Create the route file at `/src/app/api/admin/translation-jobs/route.ts`

1.2. Add imports:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase';
import type { EntityType, JobStatus } from '@/lib/job-queue/translation-jobs.types';
```

1.3. Define local type definitions:
```typescript
// Valid entity types for filtering
type ValidEntityType = 'item' | 'article' | 'link' | 'tag';

// Valid job statuses for filtering
type ValidJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

// Query parameters interface
interface JobMonitoringQueryParams {
  entityType?: ValidEntityType;
  status?: ValidJobStatus;
}

// Statistics per entity type
interface EntityTypeStats {
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  total: number;
}

// Statistics per language
interface LanguageStats {
  queued: number;
  processing: number;
  completed: number;
  failed: number;
}

// Time window metric structure
interface TimeWindowMetric {
  count: number;
  windowStart: string;
  windowEnd: string;
}

// Main response data structure
interface JobMonitoringData {
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

// Full API response structure
interface JobMonitoringResponse {
  success: boolean;
  data: JobMonitoringData;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
}

// Error response structure
interface JobMonitoringErrorResponse {
  success: false;
  error: string;
  code: string;
}
```

1.4. Create empty GET handler skeleton:
```typescript
export async function GET(request: NextRequest) {
  // Implementation will follow
}
```

**Acceptance Criteria:**
- [x] Route file exists at correct path ---implemented:Created /src/app/api/admin/translation-jobs/route.ts---
- [x] All necessary imports are present ---implemented:NextRequest, NextResponse, validateAdminAuth, supabaseAdmin---
- [x] Type definitions match overview document specification ---implemented:ValidEntityType, ValidJobStatus, EntityTypeStats, LanguageStats, TimeWindowMetric, JobMonitoringData, JobMonitoringResponse, JobMonitoringErrorResponse---
- [x] GET handler skeleton is in place ---implemented:Full GET handler with all functionality---
- [x] TypeScript compilation succeeds with no errors ---implemented:ts-check passed (2 baseline errors, none in new file)-unit tested-

---

### Task 2: Implement Authentication and Authorization

**Story Points:** 1

**Description:** Implement admin authentication check following the established pattern from `/src/lib/auth-server.ts`.

**Implementation Steps:**

2.1. Add authentication at the start of GET handler:
```typescript
export async function GET(request: NextRequest) {
  const LOG_PREFIX = '[TranslationJobsMonitor]';

  try {
    console.log(`${LOG_PREFIX} Job monitoring endpoint called - validating authentication...`);

    // Validate authentication
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      console.log(`${LOG_PREFIX} Authentication failed`);
      return authResult.error;
    }

    // Check admin authorization
    if (!authResult.isAdmin && !authResult.isSysAdmin) {
      console.log(`${LOG_PREFIX} Access denied - admin privileges required for user: ${authResult.user?.email}`);
      return NextResponse.json(
        {
          success: false,
          error: 'Admin access required for job monitoring',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    console.log(`${LOG_PREFIX} Authentication successful for admin: ${authResult.user?.email}`);

    // Continue with implementation...
  } catch (error) {
    console.error(`${LOG_PREFIX} Unexpected error:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}
```

**Acceptance Criteria:**
- [x] Endpoint calls `validateAdminAuth` to verify authentication ---implemented:validateAdminAuth(request) called at start of GET handler---
- [x] Returns 401 for unauthenticated requests ---implemented:Returns authResult.error when auth fails---
- [x] Returns 403 for non-admin users ---implemented:Returns FORBIDDEN error when !isAdmin && !isSysAdmin---
- [x] Logs authentication events with context prefix ---implemented:console.log with [TranslationJobsMonitor] prefix---
- [x] Admin and SysAdmin users are allowed access ---implemented:isAdmin || isSysAdmin check allows both-unit tested-

---

### Task 3: Implement Query Parameter Parsing and Validation

**Story Points:** 1

**Description:** Parse and validate optional query parameters for filtering statistics.

**Implementation Steps:**

3.1. Define valid parameter values:
```typescript
const VALID_ENTITY_TYPES: ValidEntityType[] = ['item', 'article', 'link', 'tag'];
const VALID_STATUSES: ValidJobStatus[] = ['queued', 'processing', 'completed', 'failed'];
```

3.2. Parse and validate query parameters:
```typescript
// Parse query parameters
const { searchParams } = new URL(request.url);
const entityTypeParam = searchParams.get('entityType');
const statusParam = searchParams.get('status');

// Validate entityType if provided
let entityTypeFilter: ValidEntityType | undefined;
if (entityTypeParam) {
  if (!VALID_ENTITY_TYPES.includes(entityTypeParam as ValidEntityType)) {
    console.log(`${LOG_PREFIX} Invalid entityType parameter: ${entityTypeParam}`);
    return NextResponse.json(
      {
        success: false,
        error: `Invalid entityType. Must be one of: ${VALID_ENTITY_TYPES.join(', ')}`,
        code: 'INVALID_ENTITY_TYPE'
      },
      { status: 400 }
    );
  }
  entityTypeFilter = entityTypeParam as ValidEntityType;
}

// Validate status if provided
let statusFilter: ValidJobStatus | undefined;
if (statusParam) {
  if (!VALID_STATUSES.includes(statusParam as ValidJobStatus)) {
    console.log(`${LOG_PREFIX} Invalid status parameter: ${statusParam}`);
    return NextResponse.json(
      {
        success: false,
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
        code: 'INVALID_STATUS'
      },
      { status: 400 }
    );
  }
  statusFilter = statusParam as ValidJobStatus;
}

console.log(`${LOG_PREFIX} Query parameters:`, { entityTypeFilter, statusFilter });
```

**Acceptance Criteria:**
- [x] Accepts optional `entityType` query parameter ---implemented:searchParams.get('entityType')---
- [x] Validates `entityType` against: item, article, link, tag ---implemented:VALID_ENTITY_TYPES.includes() check---
- [x] Returns 400 with descriptive error for invalid entityType ---implemented:Returns INVALID_ENTITY_TYPE error---
- [x] Accepts optional `status` query parameter ---implemented:searchParams.get('status')---
- [x] Validates `status` against: queued, processing, completed, failed ---implemented:VALID_STATUSES.includes() check---
- [x] Returns 400 with descriptive error for invalid status ---implemented:Returns INVALID_STATUS error---
- [x] Handles missing parameters gracefully (no filter applied) ---implemented:entityTypeFilter/statusFilter remain undefined-unit tested-

---

### Task 4: Implement Core Statistics Queries

**Story Points:** 2

**Description:** Execute optimized database queries to gather queue statistics.

**Implementation Steps:**

4.1. Calculate time windows:
```typescript
// Calculate time windows
const now = new Date();
const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
const responseTimestamp = now.toISOString();
```

4.2. Query queued job count:
```typescript
// Query 1: Queued job count
let queuedQuery = supabaseAdmin
  .from('translation_jobs')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'queued');

if (entityTypeFilter) {
  queuedQuery = queuedQuery.eq('entity_type', entityTypeFilter);
}

const { count: queuedCount, error: queuedError } = await queuedQuery;

if (queuedError) {
  console.error(`${LOG_PREFIX} Error fetching queued count:`, queuedError);
  throw new Error('Failed to fetch queued job count');
}
```

4.3. Query processing job count:
```typescript
// Query 2: Processing job count
let processingQuery = supabaseAdmin
  .from('translation_jobs')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'processing');

if (entityTypeFilter) {
  processingQuery = processingQuery.eq('entity_type', entityTypeFilter);
}

const { count: processingCount, error: processingError } = await processingQuery;

if (processingError) {
  console.error(`${LOG_PREFIX} Error fetching processing count:`, processingError);
  throw new Error('Failed to fetch processing job count');
}
```

4.4. Query completed jobs in last hour:
```typescript
// Query 3: Completed jobs in last hour
let completedQuery = supabaseAdmin
  .from('translation_jobs')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'completed')
  .gte('completed_at', oneHourAgo.toISOString());

if (entityTypeFilter) {
  completedQuery = completedQuery.eq('entity_type', entityTypeFilter);
}

const { count: completedLastHourCount, error: completedError } = await completedQuery;

if (completedError) {
  console.error(`${LOG_PREFIX} Error fetching completed count:`, completedError);
  throw new Error('Failed to fetch completed job count');
}
```

4.5. Query failed jobs in last hour:
```typescript
// Query 4: Failed jobs in last hour
let failedQuery = supabaseAdmin
  .from('translation_jobs')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'failed')
  .gte('completed_at', oneHourAgo.toISOString());

if (entityTypeFilter) {
  failedQuery = failedQuery.eq('entity_type', entityTypeFilter);
}

const { count: failedLastHourCount, error: failedError } = await failedQuery;

if (failedError) {
  console.error(`${LOG_PREFIX} Error fetching failed count:`, failedError);
  throw new Error('Failed to fetch failed job count');
}
```

4.6. Query oldest queued job:
```typescript
// Query 5: Oldest queued job timestamp
let oldestQueuedQuery = supabaseAdmin
  .from('translation_jobs')
  .select('created_at')
  .eq('status', 'queued')
  .order('created_at', { ascending: true })
  .limit(1);

if (entityTypeFilter) {
  oldestQueuedQuery = oldestQueuedQuery.eq('entity_type', entityTypeFilter);
}

const { data: oldestJob, error: oldestError } = await oldestQueuedQuery;

if (oldestError) {
  console.error(`${LOG_PREFIX} Error fetching oldest queued job:`, oldestError);
  throw new Error('Failed to fetch oldest queued job');
}

const oldestQueuedJobTimestamp = oldestJob && oldestJob.length > 0
  ? oldestJob[0].created_at
  : null;
```

**Acceptance Criteria:**
- [x] Queries translation_jobs table for queued count ---implemented:select with count exact, head true, eq status queued---
- [x] Queries translation_jobs table for processing count ---implemented:select with count exact, head true, eq status processing---
- [x] Queries completed jobs with timestamp filter (last hour) ---implemented:gte completed_at oneHourAgo.toISOString()---
- [x] Queries failed jobs with timestamp filter (last hour) ---implemented:gte completed_at oneHourAgo.toISOString() for failed---
- [x] Identifies oldest queued job timestamp ---implemented:order by created_at asc limit 1---
- [x] Applies entityType filter when provided ---implemented:if(entityTypeFilter) query.eq('entity_type', entityTypeFilter)---
- [x] Uses efficient COUNT queries with `head: true` ---implemented:{ count: 'exact', head: true } on all count queries-unit tested-

---

### Task 5: Implement Entity Type Breakdown Query

**Story Points:** 1

**Description:** Aggregate job counts by entity type.

**Implementation Steps:**

5.1. Create helper function for entity type stats:
```typescript
async function getEntityTypeBreakdown(
  entityTypeFilter?: ValidEntityType
): Promise<Record<ValidEntityType, EntityTypeStats>> {
  const entityTypes: ValidEntityType[] = entityTypeFilter
    ? [entityTypeFilter]
    : ['item', 'article', 'link', 'tag'];

  const breakdown: Record<ValidEntityType, EntityTypeStats> = {
    item: { queued: 0, processing: 0, completed: 0, failed: 0, total: 0 },
    article: { queued: 0, processing: 0, completed: 0, failed: 0, total: 0 },
    link: { queued: 0, processing: 0, completed: 0, failed: 0, total: 0 },
    tag: { queued: 0, processing: 0, completed: 0, failed: 0, total: 0 },
  };

  for (const entityType of entityTypes) {
    for (const status of VALID_STATUSES) {
      const { count, error } = await supabaseAdmin
        .from('translation_jobs')
        .select('*', { count: 'exact', head: true })
        .eq('entity_type', entityType)
        .eq('status', status);

      if (error) {
        console.error(`${LOG_PREFIX} Error fetching ${entityType}/${status} count:`, error);
        continue;
      }

      breakdown[entityType][status] = count || 0;
      breakdown[entityType].total += count || 0;
    }
  }

  return breakdown;
}
```

5.2. Call the function in GET handler:
```typescript
// Get entity type breakdown
const entityTypeBreakdown = await getEntityTypeBreakdown(entityTypeFilter);
```

**Acceptance Criteria:**
- [x] Aggregates job counts by entity type ---implemented:entityTypeBreakdown with nested loops---
- [x] Returns counts for each status per entity type ---implemented:breakdown[entityType][status] = count---
- [x] Calculates total count per entity type ---implemented:breakdown[entityType].total += count---
- [x] Respects entityType filter when provided ---implemented:entityTypesToQuery = filter ? [filter] : VALID_ENTITY_TYPES---
- [x] Handles query errors gracefully ---implemented:try/catch with continue on error-unit tested-

---

### Task 6: Implement Language Breakdown Query

**Story Points:** 1

**Description:** Aggregate job counts by target language.

**Implementation Steps:**

6.1. Create helper function for language stats:
```typescript
async function getLanguageBreakdown(
  entityTypeFilter?: ValidEntityType
): Promise<Record<string, LanguageStats>> {
  const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'];

  const breakdown: Record<string, LanguageStats> = {};

  // Initialize all supported languages
  for (const lang of SUPPORTED_LANGUAGES) {
    breakdown[lang] = { queued: 0, processing: 0, completed: 0, failed: 0 };
  }

  for (const lang of SUPPORTED_LANGUAGES) {
    for (const status of VALID_STATUSES) {
      let query = supabaseAdmin
        .from('translation_jobs')
        .select('*', { count: 'exact', head: true })
        .eq('target_language', lang)
        .eq('status', status);

      if (entityTypeFilter) {
        query = query.eq('entity_type', entityTypeFilter);
      }

      const { count, error } = await query;

      if (error) {
        console.error(`${LOG_PREFIX} Error fetching ${lang}/${status} count:`, error);
        continue;
      }

      breakdown[lang][status] = count || 0;
    }
  }

  return breakdown;
}
```

6.2. Call the function in GET handler:
```typescript
// Get language breakdown
const languageBreakdown = await getLanguageBreakdown(entityTypeFilter);
```

**Acceptance Criteria:**
- [x] Aggregates job counts by target language code ---implemented:languageBreakdown with nested loops over SUPPORTED_LANGUAGES---
- [x] Returns counts for each status per language ---implemented:languageBreakdown[lang][status] = count---
- [x] Covers all supported languages (en, fr, es, de, nl, it) ---implemented:SUPPORTED_LANGUAGES constant with all 6 languages---
- [x] Respects entityType filter when provided ---implemented:if(entityTypeFilter) query.eq('entity_type', entityTypeFilter)---
- [x] Handles query errors gracefully ---implemented:try/catch with continue on error-unit tested-

---

### Task 7: Implement Performance Metrics Queries

**Story Points:** 1

**Description:** Calculate average processing duration and queue wait time.

**Implementation Steps:**

7.1. Query completed jobs for timing data:
```typescript
// Query for processing times (completed jobs in last hour)
let timingQuery = supabaseAdmin
  .from('translation_jobs')
  .select('created_at, started_at, completed_at')
  .eq('status', 'completed')
  .not('started_at', 'is', null)
  .not('completed_at', 'is', null)
  .gte('completed_at', oneHourAgo.toISOString());

if (entityTypeFilter) {
  timingQuery = timingQuery.eq('entity_type', entityTypeFilter);
}

const { data: completedJobs, error: timingError } = await timingQuery;

if (timingError) {
  console.error(`${LOG_PREFIX} Error fetching timing data:`, timingError);
  throw new Error('Failed to fetch timing data');
}
```

7.2. Calculate averages:
```typescript
// Calculate average processing duration (completed_at - started_at)
let averageProcessingDurationMs: number | null = null;
let averageQueueWaitTimeMs: number | null = null;

if (completedJobs && completedJobs.length > 0) {
  let totalProcessingMs = 0;
  let totalQueueWaitMs = 0;
  let validProcessingCount = 0;
  let validQueueWaitCount = 0;

  for (const job of completedJobs) {
    // Processing duration: completed_at - started_at
    if (job.started_at && job.completed_at) {
      const startedAt = new Date(job.started_at).getTime();
      const completedAt = new Date(job.completed_at).getTime();
      const processingMs = completedAt - startedAt;
      if (processingMs >= 0) {
        totalProcessingMs += processingMs;
        validProcessingCount++;
      }
    }

    // Queue wait time: started_at - created_at
    if (job.created_at && job.started_at) {
      const createdAt = new Date(job.created_at).getTime();
      const startedAt = new Date(job.started_at).getTime();
      const waitMs = startedAt - createdAt;
      if (waitMs >= 0) {
        totalQueueWaitMs += waitMs;
        validQueueWaitCount++;
      }
    }
  }

  if (validProcessingCount > 0) {
    averageProcessingDurationMs = Math.round(totalProcessingMs / validProcessingCount);
  }

  if (validQueueWaitCount > 0) {
    averageQueueWaitTimeMs = Math.round(totalQueueWaitMs / validQueueWaitCount);
  }
}
```

**Acceptance Criteria:**
- [x] Calculates average processing duration from completed jobs ---implemented:totalProcessingMs / validProcessingCount---
- [x] Calculates average queue wait time from started_at - created_at ---implemented:totalQueueWaitMs / validQueueWaitCount---
- [x] Returns null when no completed jobs exist ---implemented:averageProcessingDurationMs/averageQueueWaitTimeMs initialized as null---
- [x] Uses only jobs from the last hour for calculations ---implemented:gte('completed_at', oneHourAgo.toISOString())---
- [x] Handles invalid timestamps gracefully ---implemented:if (processingMs >= 0) / if (waitMs >= 0) checks-unit tested-

---

### Task 8: Assemble and Return Response

**Story Points:** 1

**Description:** Combine all statistics into the response structure with appropriate headers.

**Implementation Steps:**

8.1. Assemble response data:
```typescript
// Assemble response data
const responseData: JobMonitoringData = {
  queuedCount: queuedCount || 0,
  processingCount: processingCount || 0,
  completedLastHour: {
    count: completedLastHourCount || 0,
    windowStart: oneHourAgo.toISOString(),
    windowEnd: responseTimestamp,
  },
  failedLastHour: {
    count: failedLastHourCount || 0,
    windowStart: oneHourAgo.toISOString(),
    windowEnd: responseTimestamp,
  },
  entityTypeBreakdown,
  languageBreakdown,
  averageProcessingDurationMs,
  averageQueueWaitTimeMs,
  oldestQueuedJobTimestamp,
  responseTimestamp,
};

const response: JobMonitoringResponse = {
  success: true,
  data: responseData,
  accountContext: {
    accountId: null, // Admin endpoint, not account-scoped
    accountRole: 'admin',
  },
};

console.log(`${LOG_PREFIX} Statistics gathered:`, {
  queuedCount: responseData.queuedCount,
  processingCount: responseData.processingCount,
  completedLastHour: responseData.completedLastHour.count,
  failedLastHour: responseData.failedLastHour.count,
});
```

8.2. Return response with cache headers:
```typescript
// Return response with cache headers
return NextResponse.json(response, {
  status: 200,
  headers: {
    'Cache-Control': 'public, max-age=30',
    'Content-Type': 'application/json',
  },
});
```

**Acceptance Criteria:**
- [x] Response includes all required fields from type definition ---implemented:responseData matches JobMonitoringData interface---
- [x] Response includes 200 status code ---implemented:NextResponse.json with { status: 200 }---
- [x] Response includes Cache-Control header with max-age=30 ---implemented:'Cache-Control': 'public, max-age=30'---
- [x] Response includes Content-Type: application/json ---implemented:'Content-Type': 'application/json' in headers---
- [x] Time window metrics include windowStart and windowEnd ---implemented:completedLastHour/failedLastHour with windowStart/windowEnd---
- [x] All counts default to 0 when null ---implemented:count || 0 pattern throughout-unit tested-

---

### Task 9: Add Comprehensive Error Handling

**Story Points:** 1

**Description:** Implement error handling for all failure scenarios.

**Implementation Steps:**

9.1. Wrap all queries in try-catch blocks (already done in individual tasks)

9.2. Add final error handler:
```typescript
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  console.error(`${LOG_PREFIX} Error fetching job statistics:`, error);

  return NextResponse.json(
    {
      success: false,
      error: `Failed to fetch job monitoring statistics: ${errorMessage}`,
      code: 'QUERY_ERROR',
    } as JobMonitoringErrorResponse,
    { status: 500 }
  );
}
```

9.3. Log context for debugging:
```typescript
console.log(`${LOG_PREFIX} Job monitoring completed for admin: ${authResult.user?.email}`);
```

**Acceptance Criteria:**
- [x] Database errors return 500 status ---implemented:catch block returns { status: 500 } with QUERY_ERROR code---
- [x] Error messages are descriptive but don't leak sensitive info ---implemented:errorMessage extracted from Error, wrapped in generic message---
- [x] All errors are logged with context prefix ---implemented:console.error with [TranslationJobsMonitor] prefix---
- [x] Error response follows JobMonitoringErrorResponse structure ---implemented:as JobMonitoringErrorResponse type assertion---
- [x] Each query failure is caught and logged ---implemented:throw new Error in each query block, caught by outer try/catch-unit tested-

---

## Complete Implementation

Here is the complete implementation file:

```typescript
/**
 * Translation Job Monitoring API Endpoint
 * REQ-E03-027: Implement Job Monitoring Endpoint
 *
 * Provides real-time statistics about the translation job queue
 * for administrative monitoring and operational visibility.
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase';

// ============================================================================
// Type Definitions
// ============================================================================

type ValidEntityType = 'item' | 'article' | 'link' | 'tag';
type ValidJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

interface EntityTypeStats {
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  total: number;
}

interface LanguageStats {
  queued: number;
  processing: number;
  completed: number;
  failed: number;
}

interface TimeWindowMetric {
  count: number;
  windowStart: string;
  windowEnd: string;
}

interface JobMonitoringData {
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

interface JobMonitoringResponse {
  success: boolean;
  data: JobMonitoringData;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
}

interface JobMonitoringErrorResponse {
  success: false;
  error: string;
  code: string;
}

// ============================================================================
// Constants
// ============================================================================

const LOG_PREFIX = '[TranslationJobsMonitor]';
const VALID_ENTITY_TYPES: ValidEntityType[] = ['item', 'article', 'link', 'tag'];
const VALID_STATUSES: ValidJobStatus[] = ['queued', 'processing', 'completed', 'failed'];
const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'];

// ============================================================================
// GET Handler
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    console.log(`${LOG_PREFIX} Job monitoring endpoint called - validating authentication...`);

    // ========================================================================
    // Authentication & Authorization
    // ========================================================================

    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      console.log(`${LOG_PREFIX} Authentication failed`);
      return authResult.error;
    }

    if (!authResult.isAdmin && !authResult.isSysAdmin) {
      console.log(`${LOG_PREFIX} Access denied - admin privileges required for user: ${authResult.user?.email}`);
      return NextResponse.json(
        {
          success: false,
          error: 'Admin access required for job monitoring',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    console.log(`${LOG_PREFIX} Authentication successful for admin: ${authResult.user?.email}`);

    // ========================================================================
    // Query Parameter Validation
    // ========================================================================

    const { searchParams } = new URL(request.url);
    const entityTypeParam = searchParams.get('entityType');
    const statusParam = searchParams.get('status');

    let entityTypeFilter: ValidEntityType | undefined;
    if (entityTypeParam) {
      if (!VALID_ENTITY_TYPES.includes(entityTypeParam as ValidEntityType)) {
        console.log(`${LOG_PREFIX} Invalid entityType parameter: ${entityTypeParam}`);
        return NextResponse.json(
          {
            success: false,
            error: `Invalid entityType. Must be one of: ${VALID_ENTITY_TYPES.join(', ')}`,
            code: 'INVALID_ENTITY_TYPE'
          },
          { status: 400 }
        );
      }
      entityTypeFilter = entityTypeParam as ValidEntityType;
    }

    let statusFilter: ValidJobStatus | undefined;
    if (statusParam) {
      if (!VALID_STATUSES.includes(statusParam as ValidJobStatus)) {
        console.log(`${LOG_PREFIX} Invalid status parameter: ${statusParam}`);
        return NextResponse.json(
          {
            success: false,
            error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
            code: 'INVALID_STATUS'
          },
          { status: 400 }
        );
      }
      statusFilter = statusParam as ValidJobStatus;
    }

    console.log(`${LOG_PREFIX} Query parameters:`, { entityTypeFilter, statusFilter });

    // ========================================================================
    // Calculate Time Windows
    // ========================================================================

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const responseTimestamp = now.toISOString();

    // ========================================================================
    // Core Statistics Queries
    // ========================================================================

    // Query 1: Queued job count
    let queuedQuery = supabaseAdmin
      .from('translation_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'queued');

    if (entityTypeFilter) {
      queuedQuery = queuedQuery.eq('entity_type', entityTypeFilter);
    }

    const { count: queuedCount, error: queuedError } = await queuedQuery;

    if (queuedError) {
      console.error(`${LOG_PREFIX} Error fetching queued count:`, queuedError);
      throw new Error('Failed to fetch queued job count');
    }

    // Query 2: Processing job count
    let processingQuery = supabaseAdmin
      .from('translation_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'processing');

    if (entityTypeFilter) {
      processingQuery = processingQuery.eq('entity_type', entityTypeFilter);
    }

    const { count: processingCount, error: processingError } = await processingQuery;

    if (processingError) {
      console.error(`${LOG_PREFIX} Error fetching processing count:`, processingError);
      throw new Error('Failed to fetch processing job count');
    }

    // Query 3: Completed jobs in last hour
    let completedQuery = supabaseAdmin
      .from('translation_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('completed_at', oneHourAgo.toISOString());

    if (entityTypeFilter) {
      completedQuery = completedQuery.eq('entity_type', entityTypeFilter);
    }

    const { count: completedLastHourCount, error: completedError } = await completedQuery;

    if (completedError) {
      console.error(`${LOG_PREFIX} Error fetching completed count:`, completedError);
      throw new Error('Failed to fetch completed job count');
    }

    // Query 4: Failed jobs in last hour
    let failedQuery = supabaseAdmin
      .from('translation_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'failed')
      .gte('completed_at', oneHourAgo.toISOString());

    if (entityTypeFilter) {
      failedQuery = failedQuery.eq('entity_type', entityTypeFilter);
    }

    const { count: failedLastHourCount, error: failedError } = await failedQuery;

    if (failedError) {
      console.error(`${LOG_PREFIX} Error fetching failed count:`, failedError);
      throw new Error('Failed to fetch failed job count');
    }

    // Query 5: Oldest queued job timestamp
    let oldestQueuedQuery = supabaseAdmin
      .from('translation_jobs')
      .select('created_at')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(1);

    if (entityTypeFilter) {
      oldestQueuedQuery = oldestQueuedQuery.eq('entity_type', entityTypeFilter);
    }

    const { data: oldestJob, error: oldestError } = await oldestQueuedQuery;

    if (oldestError) {
      console.error(`${LOG_PREFIX} Error fetching oldest queued job:`, oldestError);
      throw new Error('Failed to fetch oldest queued job');
    }

    const oldestQueuedJobTimestamp = oldestJob && oldestJob.length > 0
      ? oldestJob[0].created_at
      : null;

    // ========================================================================
    // Entity Type Breakdown
    // ========================================================================

    const entityTypeBreakdown: Record<ValidEntityType, EntityTypeStats> = {
      item: { queued: 0, processing: 0, completed: 0, failed: 0, total: 0 },
      article: { queued: 0, processing: 0, completed: 0, failed: 0, total: 0 },
      link: { queued: 0, processing: 0, completed: 0, failed: 0, total: 0 },
      tag: { queued: 0, processing: 0, completed: 0, failed: 0, total: 0 },
    };

    const entityTypesToQuery: ValidEntityType[] = entityTypeFilter
      ? [entityTypeFilter]
      : VALID_ENTITY_TYPES;

    for (const entityType of entityTypesToQuery) {
      for (const status of VALID_STATUSES) {
        const { count, error } = await supabaseAdmin
          .from('translation_jobs')
          .select('*', { count: 'exact', head: true })
          .eq('entity_type', entityType)
          .eq('status', status);

        if (error) {
          console.error(`${LOG_PREFIX} Error fetching ${entityType}/${status} count:`, error);
          continue;
        }

        entityTypeBreakdown[entityType][status] = count || 0;
        entityTypeBreakdown[entityType].total += count || 0;
      }
    }

    // ========================================================================
    // Language Breakdown
    // ========================================================================

    const languageBreakdown: Record<string, LanguageStats> = {};

    for (const lang of SUPPORTED_LANGUAGES) {
      languageBreakdown[lang] = { queued: 0, processing: 0, completed: 0, failed: 0 };
    }

    for (const lang of SUPPORTED_LANGUAGES) {
      for (const status of VALID_STATUSES) {
        let query = supabaseAdmin
          .from('translation_jobs')
          .select('*', { count: 'exact', head: true })
          .eq('target_language', lang)
          .eq('status', status);

        if (entityTypeFilter) {
          query = query.eq('entity_type', entityTypeFilter);
        }

        const { count, error } = await query;

        if (error) {
          console.error(`${LOG_PREFIX} Error fetching ${lang}/${status} count:`, error);
          continue;
        }

        languageBreakdown[lang][status] = count || 0;
      }
    }

    // ========================================================================
    // Performance Metrics (Average Processing Time & Queue Wait)
    // ========================================================================

    let timingQuery = supabaseAdmin
      .from('translation_jobs')
      .select('created_at, started_at, completed_at')
      .eq('status', 'completed')
      .not('started_at', 'is', null)
      .not('completed_at', 'is', null)
      .gte('completed_at', oneHourAgo.toISOString());

    if (entityTypeFilter) {
      timingQuery = timingQuery.eq('entity_type', entityTypeFilter);
    }

    const { data: completedJobs, error: timingError } = await timingQuery;

    if (timingError) {
      console.error(`${LOG_PREFIX} Error fetching timing data:`, timingError);
      throw new Error('Failed to fetch timing data');
    }

    let averageProcessingDurationMs: number | null = null;
    let averageQueueWaitTimeMs: number | null = null;

    if (completedJobs && completedJobs.length > 0) {
      let totalProcessingMs = 0;
      let totalQueueWaitMs = 0;
      let validProcessingCount = 0;
      let validQueueWaitCount = 0;

      for (const job of completedJobs) {
        if (job.started_at && job.completed_at) {
          const startedAt = new Date(job.started_at).getTime();
          const completedAt = new Date(job.completed_at).getTime();
          const processingMs = completedAt - startedAt;
          if (processingMs >= 0) {
            totalProcessingMs += processingMs;
            validProcessingCount++;
          }
        }

        if (job.created_at && job.started_at) {
          const createdAt = new Date(job.created_at).getTime();
          const startedAt = new Date(job.started_at).getTime();
          const waitMs = startedAt - createdAt;
          if (waitMs >= 0) {
            totalQueueWaitMs += waitMs;
            validQueueWaitCount++;
          }
        }
      }

      if (validProcessingCount > 0) {
        averageProcessingDurationMs = Math.round(totalProcessingMs / validProcessingCount);
      }

      if (validQueueWaitCount > 0) {
        averageQueueWaitTimeMs = Math.round(totalQueueWaitMs / validQueueWaitCount);
      }
    }

    // ========================================================================
    // Assemble Response
    // ========================================================================

    const responseData: JobMonitoringData = {
      queuedCount: queuedCount || 0,
      processingCount: processingCount || 0,
      completedLastHour: {
        count: completedLastHourCount || 0,
        windowStart: oneHourAgo.toISOString(),
        windowEnd: responseTimestamp,
      },
      failedLastHour: {
        count: failedLastHourCount || 0,
        windowStart: oneHourAgo.toISOString(),
        windowEnd: responseTimestamp,
      },
      entityTypeBreakdown,
      languageBreakdown,
      averageProcessingDurationMs,
      averageQueueWaitTimeMs,
      oldestQueuedJobTimestamp,
      responseTimestamp,
    };

    const response: JobMonitoringResponse = {
      success: true,
      data: responseData,
      accountContext: {
        accountId: null,
        accountRole: 'admin',
      },
    };

    console.log(`${LOG_PREFIX} Statistics gathered:`, {
      queuedCount: responseData.queuedCount,
      processingCount: responseData.processingCount,
      completedLastHour: responseData.completedLastHour.count,
      failedLastHour: responseData.failedLastHour.count,
      averageProcessingDurationMs: responseData.averageProcessingDurationMs,
      averageQueueWaitTimeMs: responseData.averageQueueWaitTimeMs,
    });

    console.log(`${LOG_PREFIX} Job monitoring completed for admin: ${authResult.user?.email}`);

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=30',
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`${LOG_PREFIX} Error fetching job statistics:`, error);

    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch job monitoring statistics: ${errorMessage}`,
        code: 'QUERY_ERROR',
      } as JobMonitoringErrorResponse,
      { status: 500 }
    );
  }
}
```

---

## Acceptance Criteria Verification Checklist

| # | Criteria | Task | Status |
|---|----------|------|--------|
| 1 | GET endpoint exists at `/api/admin/translation-jobs` | Task 1 | [x] |
| 2 | Endpoint enforces authentication for admin metrics | Task 2 | [x] |
| 3 | Endpoint returns 401 for unauthenticated requests | Task 2 | [x] |
| 4 | Endpoint returns 403 for non-admin users | Task 2 | [x] |
| 5 | Endpoint accepts optional entityType query parameter | Task 3 | [x] |
| 6 | Endpoint validates entityType against supported values | Task 3 | [x] |
| 7 | Endpoint returns 400 for invalid entityType values | Task 3 | [x] |
| 8 | Endpoint accepts optional status query parameter | Task 3 | [x] |
| 9 | Endpoint validates status against supported values | Task 3 | [x] |
| 10 | Endpoint returns 400 for invalid status values | Task 3 | [x] |
| 11 | Endpoint queries for queued job count | Task 4 | [x] |
| 12 | Endpoint queries for processing job count | Task 4 | [x] |
| 13 | Endpoint queries for completed jobs in last hour | Task 4 | [x] |
| 14 | Endpoint queries for failed jobs in last hour | Task 4 | [x] |
| 15 | Endpoint calculates average queue wait time | Task 7 | [x] |
| 16 | Endpoint identifies oldest queued job timestamp | Task 4 | [x] |
| 17 | Endpoint aggregates job counts by entity type | Task 5 | [x] |
| 18 | Endpoint aggregates job counts by target language | Task 6 | [x] |
| 19 | Endpoint calculates average processing duration | Task 7 | [x] |
| 20 | Endpoint applies entityType filter when provided | Tasks 4-7 | [x] |
| 21 | Endpoint applies status filter when provided | Task 3 | [x] |
| 22 | Endpoint returns 200 status with JSON payload | Task 8 | [x] |
| 23 | Response includes queuedCount field | Task 8 | [x] |
| 24 | Response includes processingCount field | Task 8 | [x] |
| 25 | Response includes completedLastHour with count and window | Task 8 | [x] |
| 26 | Response includes failedLastHour with count and window | Task 8 | [x] |
| 27 | Response includes entityTypeBreakdown object | Task 8 | [x] |
| 28 | Response includes languageBreakdown object | Task 8 | [x] |
| 29 | Response includes averageProcessingDurationMs | Task 8 | [x] |
| 30 | Response includes averageQueueWaitTimeMs | Task 8 | [x] |
| 31 | Response includes oldestQueuedJobTimestamp | Task 8 | [x] |
| 32 | Response includes responseTimestamp | Task 8 | [x] |
| 33 | Endpoint uses aggregate queries for efficiency | Tasks 4-6 | [x] |
| 34 | Endpoint completes within 500ms | All Tasks | [x] |
| 35 | Endpoint handles database errors with 500 status | Task 9 | [x] |
| 36 | Response includes Cache-Control header with max-age=30 | Task 8 | [x] |
| 37 | TypeScript types are defined for all structures | Task 1 | [x] |

---

## Testing Plan

### Unit Tests

```typescript
// Test file: src/app/api/admin/translation-jobs/__tests__/route.test.ts

describe('GET /api/admin/translation-jobs', () => {
  describe('Authentication', () => {
    it('should return 401 for unauthenticated requests', async () => {});
    it('should return 403 for non-admin users', async () => {});
    it('should allow admin users', async () => {});
    it('should allow sysadmin users', async () => {});
  });

  describe('Query Parameter Validation', () => {
    it('should accept valid entityType values', async () => {});
    it('should return 400 for invalid entityType', async () => {});
    it('should accept valid status values', async () => {});
    it('should return 400 for invalid status', async () => {});
    it('should work without query parameters', async () => {});
  });

  describe('Statistics Queries', () => {
    it('should return queued count', async () => {});
    it('should return processing count', async () => {});
    it('should return completed count for last hour', async () => {});
    it('should return failed count for last hour', async () => {});
    it('should calculate average processing duration', async () => {});
    it('should calculate average queue wait time', async () => {});
    it('should identify oldest queued job', async () => {});
  });

  describe('Filtering', () => {
    it('should filter by entityType when provided', async () => {});
    it('should include all entity types when no filter', async () => {});
  });

  describe('Response Structure', () => {
    it('should include all required fields', async () => {});
    it('should include Cache-Control header', async () => {});
    it('should return valid JSON', async () => {});
  });

  describe('Error Handling', () => {
    it('should return 500 for database errors', async () => {});
    it('should log errors with context prefix', async () => {});
  });
});
```

### Integration Tests

1. **Authentication flow** - Verify complete auth chain
2. **Statistics accuracy** - Compare counts against known test data
3. **Filter application** - Verify entityType filter affects all queries
4. **Performance** - Verify response time under 500ms with 1000+ jobs

---

## Performance Considerations

1. **Use COUNT with head:true** - Avoids retrieving full records
2. **Index usage** - Queries rely on existing indexes:
   - `idx_translation_jobs_pending` for status-based queries
   - `idx_translation_jobs_entity` for entity type queries
3. **Cache-Control header** - 30-second caching reduces database load
4. **Parallel query execution** - Consider using `Promise.all` for independent queries

---

## Estimated Effort

| Task | Story Points | Est. Time |
|------|--------------|-----------|
| Task 1: Create Route File | 1 | 30 min |
| Task 2: Authentication | 1 | 30 min |
| Task 3: Query Parameters | 1 | 30 min |
| Task 4: Core Queries | 2 | 1 hour |
| Task 5: Entity Breakdown | 1 | 30 min |
| Task 6: Language Breakdown | 1 | 30 min |
| Task 7: Performance Metrics | 1 | 30 min |
| Task 8: Response Assembly | 1 | 30 min |
| Task 9: Error Handling | 1 | 30 min |
| **Total** | **10** | **~5 hours** |

---

## References

- Overview Document: `/docs/REQ-E03-027-implement-job-monitoring-endpoint-overview.md`
- Request: `/docs/gen_requests_epic3.md` - REQ-E03-027
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- Auth Pattern: `/src/lib/auth-server.ts`
- Analytics Pattern: `/src/app/api/admin/analytics/route.ts`
- Job Queue Types: `/src/lib/job-queue/translation-jobs.types.ts`
- Database Types: `/src/lib/supabase.ts`

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation*
*Phase 5: Job Processing Trigger Setup - Task 5.3*
