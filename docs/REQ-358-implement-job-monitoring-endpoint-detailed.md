# REQ-358: Implement Job Monitoring Endpoint - Detailed Task Breakdown

**Document Created:** 2026-01-19
**Document Last Modified:** 2026-01-19
**Request ID:** REQ-358
**Epic:** L10N Epic 3 - Dynamic Content Translation
**Phase:** 5 - Job Processing Trigger Setup
**Task ID:** 5.3
**Size Estimate:** M (Medium)
**Overview Document:** [REQ-358-implement-job-monitoring-endpoint-overview.md](./REQ-358-implement-job-monitoring-endpoint-overview.md)

---

## Executive Summary

This document provides granular, implementation-ready tasks for creating a job monitoring endpoint at `/api/admin/translation-jobs`. The endpoint provides real-time translation job queue statistics to enable administrators to monitor queue health, processing throughput, and identify failures.

---

## Prerequisites

Before starting implementation, verify:

- [ ] Phase 1 Translation Job Queue infrastructure exists (`/src/lib/job-queue/`)
- [ ] `translation_jobs` table exists in database with columns: `id`, `entity_type`, `status`, `created_at`, `completed_at`, `started_at`
- [ ] `validateAdminAuth` function available in `/src/lib/auth-server.ts`
- [ ] `supabaseAdmin` client available in `/src/lib/supabase.ts`
- [ ] Job queue types exist in `/src/lib/job-queue/translation-jobs.types.ts`

---

## Task Breakdown

### Task 1: Create Route Handler File Structure

**Story Points:** 1
**File:** `/src/app/api/admin/translation-jobs/route.ts`

#### 1.1 Create directory and file

Create the new route file with the basic structure.

```typescript
// /src/app/api/admin/translation-jobs/route.ts

/**
 * Translation Job Monitoring API Endpoint
 * REQ-358: Implement Job Monitoring Endpoint
 *
 * This endpoint provides real-time statistics about the translation
 * job queue for administrative monitoring and operational visibility.
 *
 * @module api/admin/translation-jobs
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase';

// =============================================================================
// Type Definitions
// =============================================================================

// =============================================================================
// Constants
// =============================================================================

// =============================================================================
// GET Handler
// =============================================================================

export async function GET(request: NextRequest) {
  // Implementation will follow
}
```

#### Verification Steps:
- [ ] File created at correct path
- [ ] Imports compile without errors
- [ ] File follows project naming conventions

---

### Task 2: Define Type Definitions and Constants

**Story Points:** 1
**File:** `/src/app/api/admin/translation-jobs/route.ts`

#### 2.1 Add type definitions

Add the type definitions within the route file (inline, following the pattern from `/src/app/api/admin/translate/route.ts`).

```typescript
// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Supported entity types for filtering
 */
type SupportedEntityType = 'item' | 'article' | 'link' | 'tag';

/**
 * Supported job status values for filtering
 */
type SupportedJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

/**
 * Job queue statistics returned by the endpoint
 */
interface JobStatistics {
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
}

/**
 * API response structure for job monitoring
 */
interface JobMonitoringResponse {
  success: boolean;
  data?: JobStatistics;
  error?: string;
  code?: string;
}
```

#### 2.2 Add constants

```typescript
// =============================================================================
// Constants
// =============================================================================

const VALID_ENTITY_TYPES: readonly SupportedEntityType[] = ['item', 'article', 'link', 'tag'] as const;
const VALID_STATUSES: readonly SupportedJobStatus[] = ['queued', 'processing', 'completed', 'failed'] as const;

/** Cache duration in seconds for monitoring responses */
const CACHE_MAX_AGE_SECONDS = 10;

/** Time window for "last hour" statistics in milliseconds */
const ONE_HOUR_MS = 60 * 60 * 1000;
```

#### Verification Steps:
- [ ] Types match the API contract in overview document
- [ ] Constants include all valid entity types: 'item', 'article', 'link', 'tag'
- [ ] Constants include all valid statuses: 'queued', 'processing', 'completed', 'failed'
- [ ] TypeScript compiles without errors

---

### Task 3: Implement Query Parameter Validation

**Story Points:** 1
**File:** `/src/app/api/admin/translation-jobs/route.ts`

#### 3.1 Add validation helper function

```typescript
// =============================================================================
// Validation
// =============================================================================

/**
 * Validates and parses query parameters for job monitoring
 * @param searchParams - URL search parameters from the request
 * @returns Validation result with parsed parameters or error message
 */
function validateQueryParams(searchParams: URLSearchParams): {
  valid: boolean;
  entityType: SupportedEntityType | null;
  status: SupportedJobStatus | null;
  error?: string;
} {
  const entityTypeParam = searchParams.get('entityType');
  const statusParam = searchParams.get('status');

  // Validate entityType if provided
  if (entityTypeParam !== null) {
    if (!VALID_ENTITY_TYPES.includes(entityTypeParam as SupportedEntityType)) {
      return {
        valid: false,
        entityType: null,
        status: null,
        error: `Invalid entityType: '${entityTypeParam}'. Must be one of: ${VALID_ENTITY_TYPES.join(', ')}`,
      };
    }
  }

  // Validate status if provided
  if (statusParam !== null) {
    if (!VALID_STATUSES.includes(statusParam as SupportedJobStatus)) {
      return {
        valid: false,
        entityType: null,
        status: null,
        error: `Invalid status: '${statusParam}'. Must be one of: ${VALID_STATUSES.join(', ')}`,
      };
    }
  }

  return {
    valid: true,
    entityType: entityTypeParam as SupportedEntityType | null,
    status: statusParam as SupportedJobStatus | null,
  };
}
```

#### Verification Steps:
- [ ] Returns error for invalid entityType values
- [ ] Returns error for invalid status values
- [ ] Accepts null/missing parameters
- [ ] Returns correctly typed parsed values

---

### Task 4: Implement Authentication Check

**Story Points:** 1
**File:** `/src/app/api/admin/translation-jobs/route.ts`

#### 4.1 Add authentication logic to GET handler

```typescript
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Step 1: Authenticate and authorize admin user
    const authResult = await validateAdminAuth(request);

    if (authResult.error) {
      console.log('[JobMonitoring] Authentication failed');
      return authResult.error;
    }

    // Require admin or sysadmin access
    if (!authResult.isAdmin && !authResult.isSysAdmin) {
      console.log('[JobMonitoring] Access denied - not an admin:', authResult.user?.email);
      return NextResponse.json(
        {
          success: false,
          error: 'Admin access required for job monitoring',
          code: 'FORBIDDEN',
        } as JobMonitoringResponse,
        { status: 403 }
      );
    }

    console.log(`[JobMonitoring] Request from admin: ${authResult.user?.email}`);

    // ... rest of implementation
  } catch (error: unknown) {
    // Error handling will be added in Task 7
  }
}
```

#### Verification Steps:
- [ ] Unauthenticated requests return 401
- [ ] Non-admin authenticated users return 403
- [ ] Admin users proceed to next step
- [ ] SysAdmin users proceed to next step
- [ ] Request is logged with user email

---

### Task 5: Implement Query Parameter Parsing

**Story Points:** 1
**File:** `/src/app/api/admin/translation-jobs/route.ts`

#### 5.1 Add query parameter parsing to GET handler

Add after authentication check:

```typescript
    // Step 2: Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const validationResult = validateQueryParams(searchParams);

    if (!validationResult.valid) {
      console.log('[JobMonitoring] Invalid query parameters:', validationResult.error);
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error,
          code: 'INVALID_REQUEST',
        } as JobMonitoringResponse,
        { status: 400 }
      );
    }

    const { entityType, status } = validationResult;

    console.log('[JobMonitoring] Filters applied:', { entityType, status });
```

#### Verification Steps:
- [ ] Invalid entityType returns 400 with descriptive error
- [ ] Invalid status returns 400 with descriptive error
- [ ] Valid parameters are parsed correctly
- [ ] Missing parameters default to null
- [ ] Filters are logged

---

### Task 6: Implement Statistics Query Functions

**Story Points:** 2
**File:** `/src/app/api/admin/translation-jobs/route.ts`

#### 6.1 Add statistics query helper function

```typescript
// =============================================================================
// Database Queries
// =============================================================================

/**
 * Queries job statistics from the database
 * @param entityType - Optional filter by entity type
 * @param statusFilter - Optional filter by specific status
 * @returns Job statistics object
 */
async function queryJobStatistics(
  entityType: SupportedEntityType | null,
  statusFilter: SupportedJobStatus | null
): Promise<{
  queuedCount: number;
  processingCount: number;
  completedLastHour: number;
  failedLastHour: number;
  totalJobs?: number;
}> {
  const oneHourAgo = new Date(Date.now() - ONE_HOUR_MS).toISOString();

  // Build base query conditions
  const baseConditions: Record<string, string> = {};
  if (entityType) {
    baseConditions.entity_type = entityType;
  }

  // Query queued count
  let queuedQuery = supabaseAdmin
    .from('translation_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'queued');

  if (entityType) {
    queuedQuery = queuedQuery.eq('entity_type', entityType);
  }

  const { count: queuedCount, error: queuedError } = await queuedQuery;

  if (queuedError) {
    throw new Error(`Failed to query queued jobs: ${queuedError.message}`);
  }

  // Query processing count
  let processingQuery = supabaseAdmin
    .from('translation_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'processing');

  if (entityType) {
    processingQuery = processingQuery.eq('entity_type', entityType);
  }

  const { count: processingCount, error: processingError } = await processingQuery;

  if (processingError) {
    throw new Error(`Failed to query processing jobs: ${processingError.message}`);
  }

  // Query completed in last hour
  let completedQuery = supabaseAdmin
    .from('translation_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')
    .gte('completed_at', oneHourAgo);

  if (entityType) {
    completedQuery = completedQuery.eq('entity_type', entityType);
  }

  const { count: completedLastHour, error: completedError } = await completedQuery;

  if (completedError) {
    throw new Error(`Failed to query completed jobs: ${completedError.message}`);
  }

  // Query failed in last hour
  let failedQuery = supabaseAdmin
    .from('translation_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'failed')
    .gte('completed_at', oneHourAgo);

  if (entityType) {
    failedQuery = failedQuery.eq('entity_type', entityType);
  }

  const { count: failedLastHour, error: failedError } = await failedQuery;

  if (failedError) {
    throw new Error(`Failed to query failed jobs: ${failedError.message}`);
  }

  // Query total jobs (only when no status filter)
  let totalJobs: number | undefined;
  if (!statusFilter) {
    let totalQuery = supabaseAdmin
      .from('translation_jobs')
      .select('*', { count: 'exact', head: true });

    if (entityType) {
      totalQuery = totalQuery.eq('entity_type', entityType);
    }

    const { count: total, error: totalError } = await totalQuery;

    if (totalError) {
      throw new Error(`Failed to query total jobs: ${totalError.message}`);
    }

    totalJobs = total ?? undefined;
  }

  return {
    queuedCount: queuedCount ?? 0,
    processingCount: processingCount ?? 0,
    completedLastHour: completedLastHour ?? 0,
    failedLastHour: failedLastHour ?? 0,
    totalJobs,
  };
}
```

#### Verification Steps:
- [ ] Queued count query uses COUNT with status='queued'
- [ ] Processing count query uses COUNT with status='processing'
- [ ] Completed last hour query uses COUNT with status='completed' AND completed_at >= 1 hour ago
- [ ] Failed last hour query uses COUNT with status='failed' AND completed_at >= 1 hour ago
- [ ] All queries apply entityType filter when provided
- [ ] totalJobs is only calculated when no status filter
- [ ] Database errors throw with descriptive messages
- [ ] Uses server-side timestamp comparison (ISO string)

---

### Task 7: Implement GET Handler Response Building

**Story Points:** 1
**File:** `/src/app/api/admin/translation-jobs/route.ts`

#### 7.1 Complete the GET handler with response building

```typescript
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Step 1: Authenticate and authorize admin user
    const authResult = await validateAdminAuth(request);

    if (authResult.error) {
      console.log('[JobMonitoring] Authentication failed');
      return authResult.error;
    }

    if (!authResult.isAdmin && !authResult.isSysAdmin) {
      console.log('[JobMonitoring] Access denied - not an admin:', authResult.user?.email);
      return NextResponse.json(
        {
          success: false,
          error: 'Admin access required for job monitoring',
          code: 'FORBIDDEN',
        } as JobMonitoringResponse,
        { status: 403 }
      );
    }

    console.log(`[JobMonitoring] Request from admin: ${authResult.user?.email}`);

    // Step 2: Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const validationResult = validateQueryParams(searchParams);

    if (!validationResult.valid) {
      console.log('[JobMonitoring] Invalid query parameters:', validationResult.error);
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error,
          code: 'INVALID_REQUEST',
        } as JobMonitoringResponse,
        { status: 400 }
      );
    }

    const { entityType, status } = validationResult;

    console.log('[JobMonitoring] Filters applied:', { entityType, status });

    // Step 3: Query job statistics
    const statistics = await queryJobStatistics(entityType, status);

    // Step 4: Build response
    const responseData: JobStatistics = {
      queuedCount: statistics.queuedCount,
      processingCount: statistics.processingCount,
      completedLastHour: statistics.completedLastHour,
      failedLastHour: statistics.failedLastHour,
      timestamp: new Date().toISOString(),
      appliedFilters: entityType || status
        ? { entityType, status }
        : null,
    };

    // Include totalJobs only when available (no status filter)
    if (statistics.totalJobs !== undefined) {
      responseData.totalJobs = statistics.totalJobs;
    }

    const duration = Date.now() - startTime;
    console.log(`[JobMonitoring] Statistics retrieved in ${duration}ms:`, {
      queued: statistics.queuedCount,
      processing: statistics.processingCount,
      completedLastHour: statistics.completedLastHour,
      failedLastHour: statistics.failedLastHour,
      totalJobs: statistics.totalJobs,
    });

    // Step 5: Return response with cache headers
    const response: JobMonitoringResponse = {
      success: true,
      data: responseData,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': `max-age=${CACHE_MAX_AGE_SECONDS}`,
      },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[JobMonitoring] Error:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve job statistics',
        code: 'SERVER_ERROR',
      } as JobMonitoringResponse,
      { status: 500 }
    );
  }
}
```

#### Verification Steps:
- [ ] Response includes all required fields
- [ ] Response includes Cache-Control header with max-age=10
- [ ] Timestamp is in ISO format
- [ ] appliedFilters is null when no filters applied
- [ ] appliedFilters shows active filters when applied
- [ ] totalJobs is included only when no status filter
- [ ] Database errors return 500 with generic error message
- [ ] Processing time is logged

---

### Task 8: Add Request Logging

**Story Points:** 0.5
**File:** `/src/app/api/admin/translation-jobs/route.ts`

#### 8.1 Ensure comprehensive logging throughout the handler

Verify the following log statements are in place:

1. **Authentication logs:**
   - Log authentication failures
   - Log access denied for non-admins
   - Log successful admin request with email

2. **Parameter logs:**
   - Log invalid query parameters
   - Log applied filters

3. **Result logs:**
   - Log retrieved statistics with counts
   - Log processing duration

4. **Error logs:**
   - Log all errors with stack traces (console.error)

All logging should use the `[JobMonitoring]` prefix for easy filtering.

#### Verification Steps:
- [ ] All log messages use `[JobMonitoring]` prefix
- [ ] Authentication attempts are logged
- [ ] Query parameters are logged
- [ ] Statistics results are logged
- [ ] Processing duration is logged
- [ ] Errors are logged with console.error

---

### Task 9: Integration Testing Preparation

**Story Points:** 1
**File:** Various test scenarios

#### 9.1 Manual test cases to verify

Document these test cases for manual verification:

**Test Case 1: Unauthenticated Request**
```bash
curl -X GET "http://localhost:3000/api/admin/translation-jobs"
# Expected: 401 Unauthorized
```

**Test Case 2: Non-Admin User Request**
```bash
# Use a valid non-admin user token
curl -X GET "http://localhost:3000/api/admin/translation-jobs" \
  -H "Cookie: <non-admin-session-cookie>"
# Expected: 403 Forbidden
```

**Test Case 3: Admin User - No Filters**
```bash
curl -X GET "http://localhost:3000/api/admin/translation-jobs" \
  -H "Cookie: <admin-session-cookie>"
# Expected: 200 OK with all statistics including totalJobs
```

**Test Case 4: Admin User - Filter by entityType**
```bash
curl -X GET "http://localhost:3000/api/admin/translation-jobs?entityType=item" \
  -H "Cookie: <admin-session-cookie>"
# Expected: 200 OK with statistics filtered to 'item' entity type
```

**Test Case 5: Admin User - Filter by status**
```bash
curl -X GET "http://localhost:3000/api/admin/translation-jobs?status=failed" \
  -H "Cookie: <admin-session-cookie>"
# Expected: 200 OK with failedLastHour count (no totalJobs)
```

**Test Case 6: Admin User - Both Filters**
```bash
curl -X GET "http://localhost:3000/api/admin/translation-jobs?entityType=article&status=queued" \
  -H "Cookie: <admin-session-cookie>"
# Expected: 200 OK with statistics for queued article jobs only
```

**Test Case 7: Invalid entityType**
```bash
curl -X GET "http://localhost:3000/api/admin/translation-jobs?entityType=invalid" \
  -H "Cookie: <admin-session-cookie>"
# Expected: 400 Bad Request with error message
```

**Test Case 8: Invalid status**
```bash
curl -X GET "http://localhost:3000/api/admin/translation-jobs?status=unknown" \
  -H "Cookie: <admin-session-cookie>"
# Expected: 400 Bad Request with error message
```

**Test Case 9: Verify Cache Headers**
```bash
curl -I -X GET "http://localhost:3000/api/admin/translation-jobs" \
  -H "Cookie: <admin-session-cookie>"
# Expected: Cache-Control: max-age=10 header present
```

**Test Case 10: Response Time Performance**
```bash
time curl -X GET "http://localhost:3000/api/admin/translation-jobs" \
  -H "Cookie: <admin-session-cookie>"
# Expected: Response time < 500ms
```

#### Verification Steps:
- [ ] All test cases documented
- [ ] Expected responses match API contract
- [ ] Performance target is under 500ms

---

## Complete Implementation File

The final implementation file should look like this:

```typescript
// /src/app/api/admin/translation-jobs/route.ts

/**
 * Translation Job Monitoring API Endpoint
 * REQ-358: Implement Job Monitoring Endpoint
 *
 * This endpoint provides real-time statistics about the translation
 * job queue for administrative monitoring and operational visibility.
 *
 * @module api/admin/translation-jobs
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase';

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Supported entity types for filtering
 */
type SupportedEntityType = 'item' | 'article' | 'link' | 'tag';

/**
 * Supported job status values for filtering
 */
type SupportedJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

/**
 * Job queue statistics returned by the endpoint
 */
interface JobStatistics {
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
}

/**
 * API response structure for job monitoring
 */
interface JobMonitoringResponse {
  success: boolean;
  data?: JobStatistics;
  error?: string;
  code?: string;
}

// =============================================================================
// Constants
// =============================================================================

const VALID_ENTITY_TYPES: readonly SupportedEntityType[] = ['item', 'article', 'link', 'tag'] as const;
const VALID_STATUSES: readonly SupportedJobStatus[] = ['queued', 'processing', 'completed', 'failed'] as const;

/** Cache duration in seconds for monitoring responses */
const CACHE_MAX_AGE_SECONDS = 10;

/** Time window for "last hour" statistics in milliseconds */
const ONE_HOUR_MS = 60 * 60 * 1000;

// =============================================================================
// Validation
// =============================================================================

/**
 * Validates and parses query parameters for job monitoring
 * @param searchParams - URL search parameters from the request
 * @returns Validation result with parsed parameters or error message
 */
function validateQueryParams(searchParams: URLSearchParams): {
  valid: boolean;
  entityType: SupportedEntityType | null;
  status: SupportedJobStatus | null;
  error?: string;
} {
  const entityTypeParam = searchParams.get('entityType');
  const statusParam = searchParams.get('status');

  // Validate entityType if provided
  if (entityTypeParam !== null) {
    if (!VALID_ENTITY_TYPES.includes(entityTypeParam as SupportedEntityType)) {
      return {
        valid: false,
        entityType: null,
        status: null,
        error: `Invalid entityType: '${entityTypeParam}'. Must be one of: ${VALID_ENTITY_TYPES.join(', ')}`,
      };
    }
  }

  // Validate status if provided
  if (statusParam !== null) {
    if (!VALID_STATUSES.includes(statusParam as SupportedJobStatus)) {
      return {
        valid: false,
        entityType: null,
        status: null,
        error: `Invalid status: '${statusParam}'. Must be one of: ${VALID_STATUSES.join(', ')}`,
      };
    }
  }

  return {
    valid: true,
    entityType: entityTypeParam as SupportedEntityType | null,
    status: statusParam as SupportedJobStatus | null,
  };
}

// =============================================================================
// Database Queries
// =============================================================================

/**
 * Queries job statistics from the database
 * @param entityType - Optional filter by entity type
 * @param statusFilter - Optional filter by specific status
 * @returns Job statistics object
 */
async function queryJobStatistics(
  entityType: SupportedEntityType | null,
  statusFilter: SupportedJobStatus | null
): Promise<{
  queuedCount: number;
  processingCount: number;
  completedLastHour: number;
  failedLastHour: number;
  totalJobs?: number;
}> {
  const oneHourAgo = new Date(Date.now() - ONE_HOUR_MS).toISOString();

  // Query queued count
  let queuedQuery = supabaseAdmin
    .from('translation_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'queued');

  if (entityType) {
    queuedQuery = queuedQuery.eq('entity_type', entityType);
  }

  const { count: queuedCount, error: queuedError } = await queuedQuery;

  if (queuedError) {
    throw new Error(`Failed to query queued jobs: ${queuedError.message}`);
  }

  // Query processing count
  let processingQuery = supabaseAdmin
    .from('translation_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'processing');

  if (entityType) {
    processingQuery = processingQuery.eq('entity_type', entityType);
  }

  const { count: processingCount, error: processingError } = await processingQuery;

  if (processingError) {
    throw new Error(`Failed to query processing jobs: ${processingError.message}`);
  }

  // Query completed in last hour
  let completedQuery = supabaseAdmin
    .from('translation_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')
    .gte('completed_at', oneHourAgo);

  if (entityType) {
    completedQuery = completedQuery.eq('entity_type', entityType);
  }

  const { count: completedLastHour, error: completedError } = await completedQuery;

  if (completedError) {
    throw new Error(`Failed to query completed jobs: ${completedError.message}`);
  }

  // Query failed in last hour
  let failedQuery = supabaseAdmin
    .from('translation_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'failed')
    .gte('completed_at', oneHourAgo);

  if (entityType) {
    failedQuery = failedQuery.eq('entity_type', entityType);
  }

  const { count: failedLastHour, error: failedError } = await failedQuery;

  if (failedError) {
    throw new Error(`Failed to query failed jobs: ${failedError.message}`);
  }

  // Query total jobs (only when no status filter)
  let totalJobs: number | undefined;
  if (!statusFilter) {
    let totalQuery = supabaseAdmin
      .from('translation_jobs')
      .select('*', { count: 'exact', head: true });

    if (entityType) {
      totalQuery = totalQuery.eq('entity_type', entityType);
    }

    const { count: total, error: totalError } = await totalQuery;

    if (totalError) {
      throw new Error(`Failed to query total jobs: ${totalError.message}`);
    }

    totalJobs = total ?? undefined;
  }

  return {
    queuedCount: queuedCount ?? 0,
    processingCount: processingCount ?? 0,
    completedLastHour: completedLastHour ?? 0,
    failedLastHour: failedLastHour ?? 0,
    totalJobs,
  };
}

// =============================================================================
// GET Handler
// =============================================================================

/**
 * GET /api/admin/translation-jobs
 *
 * Returns real-time statistics about the translation job queue.
 *
 * @query entityType - Optional: Filter by content type (item, article, link, tag)
 * @query status - Optional: Filter by job status (queued, processing, completed, failed)
 * @returns JobMonitoringResponse with queue statistics
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Step 1: Authenticate and authorize admin user
    const authResult = await validateAdminAuth(request);

    if (authResult.error) {
      console.log('[JobMonitoring] Authentication failed');
      return authResult.error;
    }

    if (!authResult.isAdmin && !authResult.isSysAdmin) {
      console.log('[JobMonitoring] Access denied - not an admin:', authResult.user?.email);
      return NextResponse.json(
        {
          success: false,
          error: 'Admin access required for job monitoring',
          code: 'FORBIDDEN',
        } as JobMonitoringResponse,
        { status: 403 }
      );
    }

    console.log(`[JobMonitoring] Request from admin: ${authResult.user?.email}`);

    // Step 2: Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const validationResult = validateQueryParams(searchParams);

    if (!validationResult.valid) {
      console.log('[JobMonitoring] Invalid query parameters:', validationResult.error);
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error,
          code: 'INVALID_REQUEST',
        } as JobMonitoringResponse,
        { status: 400 }
      );
    }

    const { entityType, status } = validationResult;

    console.log('[JobMonitoring] Filters applied:', { entityType, status });

    // Step 3: Query job statistics
    const statistics = await queryJobStatistics(entityType, status);

    // Step 4: Build response
    const responseData: JobStatistics = {
      queuedCount: statistics.queuedCount,
      processingCount: statistics.processingCount,
      completedLastHour: statistics.completedLastHour,
      failedLastHour: statistics.failedLastHour,
      timestamp: new Date().toISOString(),
      appliedFilters: entityType || status
        ? { entityType, status }
        : null,
    };

    // Include totalJobs only when available (no status filter)
    if (statistics.totalJobs !== undefined) {
      responseData.totalJobs = statistics.totalJobs;
    }

    const duration = Date.now() - startTime;
    console.log(`[JobMonitoring] Statistics retrieved in ${duration}ms:`, {
      queued: statistics.queuedCount,
      processing: statistics.processingCount,
      completedLastHour: statistics.completedLastHour,
      failedLastHour: statistics.failedLastHour,
      totalJobs: statistics.totalJobs,
    });

    // Step 5: Return response with cache headers
    const response: JobMonitoringResponse = {
      success: true,
      data: responseData,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': `max-age=${CACHE_MAX_AGE_SECONDS}`,
      },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[JobMonitoring] Error:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve job statistics',
        code: 'SERVER_ERROR',
      } as JobMonitoringResponse,
      { status: 500 }
    );
  }
}
```

---

## Acceptance Criteria Verification Checklist

| # | Criteria | Task |
|---|----------|------|
| 1 | Route handler file created at `/src/app/api/admin/translation-jobs/route.ts` | Task 1 |
| 2 | GET handler validates authentication using service role key or admin user credentials | Task 4 |
| 3 | Unauthenticated requests return 401 Unauthorized with descriptive error message | Task 4 |
| 4 | Non-administrator users without service role return 403 Forbidden | Task 4 |
| 5 | Handler accepts optional `entityType` query parameter for filtering | Task 3, 5 |
| 6 | When `entityType` is provided, validates it is one of: 'item', 'article', 'link', 'tag' | Task 3 |
| 7 | Invalid `entityType` values return 400 Bad Request | Task 3, 5 |
| 8 | Handler accepts optional `status` query parameter for filtering | Task 3, 5 |
| 9 | When `status` is provided, validates it is one of: 'queued', 'processing', 'completed', 'failed' | Task 3 |
| 10 | Invalid `status` values return 400 Bad Request | Task 3, 5 |
| 11 | Handler queries job queue table to count jobs with status 'queued' | Task 6 |
| 12 | Handler queries job queue table to count jobs with status 'processing' | Task 6 |
| 13 | Handler queries job queue table to count jobs completed within the last hour | Task 6 |
| 14 | Handler queries job queue table to count jobs failed within the last hour | Task 6 |
| 15 | When `entityType` filter is provided, all count queries are filtered by specified entity type | Task 6 |
| 16 | When `status` filter is provided, only the count for specified status is returned | Task 6 |
| 17 | Response includes `queuedCount` field | Task 7 |
| 18 | Response includes `processingCount` field | Task 7 |
| 19 | Response includes `completedLastHour` field | Task 7 |
| 20 | Response includes `failedLastHour` field | Task 7 |
| 21 | Response includes `timestamp` field with ISO timestamp | Task 7 |
| 22 | Response includes `appliedFilters` object showing active filters | Task 7 |
| 23 | Handler returns 200 OK with all count fields even when counts are zero | Task 7 |
| 24 | Database query errors return 500 Internal Server Error | Task 7 |
| 25 | Handler logs monitoring requests including filter parameters | Task 8 |
| 26 | Response includes Cache-Control header with max-age of 10 seconds | Task 7 |
| 27 | Implementation uses efficient COUNT queries with appropriate WHERE clauses | Task 6 |
| 28 | One-hour window uses server-side database timestamp comparison | Task 6 |
| 29 | Response includes `totalJobs` field when no status filter is applied | Task 6, 7 |
| 30 | Response time remains under 500ms under normal load conditions | Task 9 |

---

## Effort Summary

| Task | Description | Story Points |
|------|-------------|--------------|
| Task 1 | Create Route Handler File Structure | 1 |
| Task 2 | Define Type Definitions and Constants | 1 |
| Task 3 | Implement Query Parameter Validation | 1 |
| Task 4 | Implement Authentication Check | 1 |
| Task 5 | Implement Query Parameter Parsing | 1 |
| Task 6 | Implement Statistics Query Functions | 2 |
| Task 7 | Implement GET Handler Response Building | 1 |
| Task 8 | Add Request Logging | 0.5 |
| Task 9 | Integration Testing Preparation | 1 |
| **Total** | | **9.5** |

**Estimated Time:** 4-6 hours for complete implementation and testing

---

## References

- **Overview Document:** [REQ-358-implement-job-monitoring-endpoint-overview.md](./REQ-358-implement-job-monitoring-endpoint-overview.md)
- **Implementation Plan:** [Plan-111-L10N-Epic3-Dynamic-Content-Translation.md](./prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md) (Phase 5, Task 5.3)
- **Request Document:** [gen_requests_epic3.md](./gen_requests_epic3.md) (REQ-358)
- **Auth Pattern Reference:** `/src/lib/auth-server.ts`
- **Admin Endpoint Reference:** `/src/app/api/admin/translate/route.ts`
- **Job Queue Types:** `/src/lib/job-queue/translation-jobs.types.ts`
