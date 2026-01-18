# REQ-246: Create Job Status API Endpoint - Detailed Task Breakdown

**Generated:** 2026-01-18 12:45:00 UTC
**Last Modified:** 2026-01-18 12:45:00 UTC
**Request Reference:** REQ-246 - Admin Job Status Query API Endpoint
**Overview Document:** REQ-246-create-job-status-api-endpoint-overview.md
**Plan Reference:** Plan-110-L10N-Epic1-Foundation.md (Phase 4, Task 4.5)
**Status:** Ready for Implementation

---

## Executive Summary

This document provides a granular, step-by-step task breakdown for implementing the translation job status API endpoint. The endpoint allows administrators to query translation jobs by status and entity type for monitoring and debugging purposes.

**Total Estimated Tasks:** 8 implementation tasks + verification
**Target File:** `/src/app/api/admin/translation-jobs/route.ts`
**Dependencies:** Task 1.1 (translation_jobs table must exist)

---

## Prerequisites Checklist

Before starting implementation, verify the following:

- [ ] Task 1.1 completed: `translation_jobs` table exists in database
- [ ] Task 1.4 completed: RLS policies allow admin read access to `translation_jobs`
- [ ] Developer has local environment running (`npm run dev`)
- [ ] Developer has admin/sysadmin test account credentials

---

## Detailed Task Breakdown

### Task 4.5.1: Create API Route Directory and File

**Story Points:** 1
**Estimated Time:** 5 minutes

#### Objective
Create the directory structure and initial route file for the translation jobs API endpoint.

#### Steps

1. **Create directory:**
   ```bash
   mkdir -p src/app/api/admin/translation-jobs
   ```

2. **Create route.ts file with skeleton:**

   **File:** `/src/app/api/admin/translation-jobs/route.ts`

   ```typescript
   import { NextRequest, NextResponse } from 'next/server';
   import { validateAdminAuth } from '@/lib/auth-server';

   // Debug prefix for log filtering
   const DEBUG_PREFIX = '[TRANSLATION_JOBS_API]';

   export async function GET(request: NextRequest): Promise<NextResponse> {
     console.log(`${DEBUG_PREFIX} === API CALL START ===`);
     console.log(`${DEBUG_PREFIX} Request URL:`, request.url);

     // TODO: Implement authentication
     // TODO: Implement query parameter parsing
     // TODO: Implement database query
     // TODO: Return response

     return NextResponse.json({ success: false, error: 'Not implemented' }, { status: 501 });
   }
   ```

#### Verification
- [ ] File exists at `/src/app/api/admin/translation-jobs/route.ts`
- [ ] No TypeScript compilation errors
- [ ] Endpoint responds to GET request (returns 501 Not Implemented)

#### Test Command
```bash
curl -X GET "http://localhost:3000/api/admin/translation-jobs"
# Expected: {"success":false,"error":"Not implemented"}
```

---

### Task 4.5.2: Implement Authentication and Authorization

**Story Points:** 1
**Estimated Time:** 10 minutes

#### Objective
Add admin authentication check using the established pattern from existing admin routes.

#### Steps

1. **Add authentication imports and check:**

   **File:** `/src/app/api/admin/translation-jobs/route.ts`

   Replace the TODO comment with:

   ```typescript
   export async function GET(request: NextRequest): Promise<NextResponse> {
     console.log(`${DEBUG_PREFIX} === API CALL START ===`);
     console.log(`${DEBUG_PREFIX} Request URL:`, request.url);

     // Validate admin authentication
     console.log(`${DEBUG_PREFIX} AUTH_START: Calling validateAdminAuth...`);
     const authResult = await validateAdminAuth(request);
     console.log(`${DEBUG_PREFIX} AUTH_RESULT:`, {
       hasError: !!authResult.error,
       hasSupabase: !!authResult.supabase,
       isAdmin: authResult.isAdmin,
       isSysAdmin: authResult.isSysAdmin
     });

     if (authResult.error) {
       console.log(`${DEBUG_PREFIX} AUTH_FAILED: Returning auth error`);
       return authResult.error;
     }

     // Require admin privileges (admin or sysadmin)
     if (!authResult.isAdmin && !authResult.isSysAdmin) {
       console.log(`${DEBUG_PREFIX} ADMIN_CHECK_FAILED: User ${authResult.user?.email} is not an admin`);
       return NextResponse.json(
         {
           success: false,
           error: 'Admin privileges required',
           code: 'ADMIN_REQUIRED'
         },
         { status: 403 }
       );
     }
     console.log(`${DEBUG_PREFIX} ADMIN_CHECK_PASSED: User ${authResult.user?.email}`);

     const { supabase } = authResult;

     // TODO: Implement query parameter parsing
     // TODO: Implement database query
     // TODO: Return response

     return NextResponse.json({ success: false, error: 'Not implemented' }, { status: 501 });
   }
   ```

#### Verification
- [ ] Unauthenticated requests return 401
- [ ] Non-admin users return 403
- [ ] Admin users proceed past authentication check

#### Test Commands
```bash
# Test 1: Unauthenticated (should return 401)
curl -X GET "http://localhost:3000/api/admin/translation-jobs"

# Test 2: Authenticated admin (should proceed)
# Use browser dev tools to get auth cookie, then:
curl -X GET "http://localhost:3000/api/admin/translation-jobs" \
  -H "Cookie: <your_auth_cookie>"
```

---

### Task 4.5.3: Parse and Validate Query Parameters

**Story Points:** 1
**Estimated Time:** 15 minutes

#### Objective
Extract all filter, pagination, and sorting parameters from the request URL with validation.

#### Steps

1. **Define valid values as constants:**

   Add after the DEBUG_PREFIX constant:

   ```typescript
   // Valid values for query parameters
   const VALID_STATUSES = ['queued', 'processing', 'completed', 'failed'] as const;
   const VALID_ENTITY_TYPES = ['article', 'item', 'link', 'tag'] as const;
   const VALID_SORT_FIELDS = ['created_at', 'started_at', 'completed_at'] as const;
   const DEFAULT_LIMIT = 50;
   const MAX_LIMIT = 100;
   ```

2. **Add parameter parsing after authentication:**

   ```typescript
   // Extract query parameters
   const { searchParams } = new URL(request.url);

   // Pagination parameters
   const limitParam = parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT));
   const limit = Math.min(Math.max(limitParam, 1), MAX_LIMIT); // Clamp between 1 and MAX_LIMIT
   const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

   // Filter parameters
   const status = searchParams.get('status');
   const entityType = searchParams.get('entity_type');
   const targetLanguage = searchParams.get('target_language');

   // Sorting parameters
   const sortBy = searchParams.get('sort_by') || 'created_at';
   const sortOrder = searchParams.get('sort_order') || 'desc';

   console.log(`${DEBUG_PREFIX} QUERY_PARAMS:`, {
     status, entityType, targetLanguage, limit, offset, sortBy, sortOrder
   });
   ```

3. **Add validation for filter values:**

   ```typescript
   // Validate status parameter
   if (status && !VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
     return NextResponse.json(
       {
         success: false,
         error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
         code: 'INVALID_STATUS'
       },
       { status: 400 }
     );
   }

   // Validate entity_type parameter
   if (entityType && !VALID_ENTITY_TYPES.includes(entityType as typeof VALID_ENTITY_TYPES[number])) {
     return NextResponse.json(
       {
         success: false,
         error: `Invalid entity_type. Must be one of: ${VALID_ENTITY_TYPES.join(', ')}`,
         code: 'INVALID_ENTITY_TYPE'
       },
       { status: 400 }
     );
   }

   // Validate sort_by parameter
   if (!VALID_SORT_FIELDS.includes(sortBy as typeof VALID_SORT_FIELDS[number])) {
     return NextResponse.json(
       {
         success: false,
         error: `Invalid sort_by. Must be one of: ${VALID_SORT_FIELDS.join(', ')}`,
         code: 'INVALID_SORT_FIELD'
       },
       { status: 400 }
     );
   }

   // Validate sort_order parameter
   if (sortOrder !== 'asc' && sortOrder !== 'desc') {
     return NextResponse.json(
       {
         success: false,
         error: 'Invalid sort_order. Must be "asc" or "desc"',
         code: 'INVALID_SORT_ORDER'
       },
       { status: 400 }
     );
   }
   ```

#### Verification
- [ ] Invalid status returns 400 with helpful error
- [ ] Invalid entity_type returns 400 with helpful error
- [ ] Invalid sort_by returns 400 with helpful error
- [ ] Invalid sort_order returns 400 with helpful error
- [ ] Limit > 100 is capped at 100
- [ ] Negative offset defaults to 0

#### Test Commands
```bash
# Test invalid status
curl -X GET "http://localhost:3000/api/admin/translation-jobs?status=invalid" \
  -H "Cookie: <auth_cookie>"
# Expected: 400 with error message

# Test invalid entity_type
curl -X GET "http://localhost:3000/api/admin/translation-jobs?entity_type=invalid" \
  -H "Cookie: <auth_cookie>"
# Expected: 400 with error message

# Test limit capping
curl -X GET "http://localhost:3000/api/admin/translation-jobs?limit=500" \
  -H "Cookie: <auth_cookie>"
# Expected: limit in response should be 100
```

---

### Task 4.5.4: Build and Execute Database Query

**Story Points:** 1
**Estimated Time:** 20 minutes

#### Objective
Query the `translation_jobs` table with dynamic filtering based on parameters.

#### Steps

1. **Wrap database operations in try-catch:**

   ```typescript
   try {
     // Build base query
     console.log(`${DEBUG_PREFIX} DB_QUERY: Building translation_jobs query...`);
     let query = supabase
       .from('translation_jobs')
       .select('*')
       .order(sortBy, { ascending: sortOrder === 'asc' });

     // Apply filters conditionally
     if (status) {
       query = query.eq('status', status);
       console.log(`${DEBUG_PREFIX} FILTER_APPLIED: status = ${status}`);
     }
     if (entityType) {
       query = query.eq('entity_type', entityType);
       console.log(`${DEBUG_PREFIX} FILTER_APPLIED: entity_type = ${entityType}`);
     }
     if (targetLanguage) {
       query = query.eq('target_language', targetLanguage);
       console.log(`${DEBUG_PREFIX} FILTER_APPLIED: target_language = ${targetLanguage}`);
     }

     // Apply pagination
     query = query.range(offset, offset + limit - 1);

     // Execute query
     const { data: jobs, error: queryError } = await query;

     console.log(`${DEBUG_PREFIX} DB_QUERY_RESULT:`, {
       count: jobs?.length,
       error: queryError,
       sampleColumns: jobs?.[0] ? Object.keys(jobs[0]) : []
     });

     if (queryError) {
       console.error(`${DEBUG_PREFIX} DB_QUERY_FAILED:`, queryError);
       return NextResponse.json(
         {
           success: false,
           error: 'Failed to fetch translation jobs',
           code: 'QUERY_ERROR',
           details: queryError.message
         },
         { status: 500 }
       );
     }

     // TODO: Get total count for pagination
     // TODO: Get summary counts
     // TODO: Transform and return response

   } catch (unexpectedError) {
     console.error(`${DEBUG_PREFIX} UNEXPECTED_ERROR:`, unexpectedError);
     console.error(`${DEBUG_PREFIX} ERROR_STACK:`, (unexpectedError as Error).stack);

     return NextResponse.json(
       {
         success: false,
         error: 'Internal server error',
         code: 'INTERNAL_ERROR'
       },
       { status: 500 }
     );
   }
   ```

#### Verification
- [ ] Query executes without errors when table exists
- [ ] Filters are applied correctly
- [ ] Results are sorted by specified field
- [ ] Pagination range is correct

#### Test Commands
```bash
# Basic query (requires table to exist)
curl -X GET "http://localhost:3000/api/admin/translation-jobs" \
  -H "Cookie: <auth_cookie>"

# With filters
curl -X GET "http://localhost:3000/api/admin/translation-jobs?status=queued&entity_type=article" \
  -H "Cookie: <auth_cookie>"
```

---

### Task 4.5.5: Get Total Count for Pagination

**Story Points:** 1
**Estimated Time:** 10 minutes

#### Objective
Execute a count query with the same filters to provide accurate pagination metadata.

#### Steps

1. **Add count query after main query:**

   ```typescript
   // Get total count for pagination (using same filters)
   console.log(`${DEBUG_PREFIX} COUNT_QUERY: Getting total count with filters...`);
   let countQuery = supabase
     .from('translation_jobs')
     .select('id');

   // Apply same filters
   if (status) {
     countQuery = countQuery.eq('status', status);
   }
   if (entityType) {
     countQuery = countQuery.eq('entity_type', entityType);
   }
   if (targetLanguage) {
     countQuery = countQuery.eq('target_language', targetLanguage);
   }

   const { data: countData, error: countError } = await countQuery;
   const totalCount = countData?.length || 0;

   if (countError) {
     console.warn(`${DEBUG_PREFIX} COUNT_WARNING:`, countError);
     // Continue with jobs.length as fallback - better than failing entirely
   } else {
     console.log(`${DEBUG_PREFIX} COUNT_SUCCESS: Found ${totalCount} total records matching filters`);
   }
   ```

#### Verification
- [ ] Total count reflects filtered results, not all records
- [ ] Count query uses same filters as main query
- [ ] Count error doesn't fail the entire request

---

### Task 4.5.6: Fetch Status Summary Counts

**Story Points:** 1
**Estimated Time:** 10 minutes

#### Objective
Get counts for each status to provide a summary for dashboard display.

#### Steps

1. **Add summary counts query:**

   ```typescript
   // Fetch summary counts by status
   console.log(`${DEBUG_PREFIX} SUMMARY_QUERY: Getting status summary counts...`);
   const summary = {
     queued: 0,
     processing: 0,
     completed: 0,
     failed: 0
   };

   // Get all jobs for summary counts (unfiltered)
   const { data: allJobsForSummary, error: summaryError } = await supabase
     .from('translation_jobs')
     .select('status');

   if (summaryError) {
     console.warn(`${DEBUG_PREFIX} SUMMARY_WARNING: Could not fetch summary counts`, summaryError);
     // Continue without summary - optional enhancement
   } else if (allJobsForSummary) {
     allJobsForSummary.forEach(job => {
       const jobStatus = job.status as keyof typeof summary;
       if (jobStatus in summary) {
         summary[jobStatus]++;
       }
     });
     console.log(`${DEBUG_PREFIX} SUMMARY_SUCCESS:`, summary);
   }
   ```

#### Verification
- [ ] Summary counts are accurate
- [ ] Summary includes all 4 status types
- [ ] Summary error doesn't fail the entire request

---

### Task 4.5.7: Transform and Return Response

**Story Points:** 1
**Estimated Time:** 10 minutes

#### Objective
Map database field names to camelCase API response format and construct the final response.

#### Steps

1. **Add response transformation and return:**

   ```typescript
   // Transform database fields to API response format (snake_case -> camelCase)
   console.log(`${DEBUG_PREFIX} TRANSFORM: Mapping ${jobs?.length || 0} jobs to API format...`);

   const transformedJobs = (jobs || []).map(job => ({
     id: job.id,
     entityType: job.entity_type,
     entityId: job.entity_id,
     sourceLanguage: job.source_language,
     targetLanguage: job.target_language,
     status: job.status,
     attempts: job.attempts,
     errorMessage: job.error_message || undefined,
     createdAt: job.created_at,
     startedAt: job.started_at || undefined,
     completedAt: job.completed_at || undefined
   }));

   // Build final response
   const response = {
     success: true,
     data: {
       jobs: transformedJobs,
       pagination: {
         total: totalCount,
         offset,
         limit,
         hasMore: totalCount > offset + limit
       },
       summary
     }
   };

   console.log(`${DEBUG_PREFIX} SUCCESS: Returning ${transformedJobs.length} jobs`);
   return NextResponse.json(response);
   ```

#### Verification
- [ ] Response uses camelCase field names
- [ ] Optional fields are undefined instead of null
- [ ] Pagination metadata is accurate
- [ ] Summary is included in response

---

### Task 4.5.8: Add TypeScript Type Definitions

**Story Points:** 1
**Estimated Time:** 10 minutes

#### Objective
Add type definitions for better code maintainability and IDE support.

#### Steps

1. **Add type definitions at top of file (after imports):**

   ```typescript
   // Type definitions for job status API
   type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';
   type EntityType = 'article' | 'item' | 'link' | 'tag';
   type SortField = 'created_at' | 'started_at' | 'completed_at';
   type SortOrder = 'asc' | 'desc';

   interface TranslationJobResponse {
     id: string;
     entityType: EntityType;
     entityId: string;
     sourceLanguage: string;
     targetLanguage: string;
     status: JobStatus;
     attempts: number;
     errorMessage?: string;
     createdAt: string;
     startedAt?: string;
     completedAt?: string;
   }

   interface JobStatusSummary {
     queued: number;
     processing: number;
     completed: number;
     failed: number;
   }

   interface PaginationInfo {
     total: number;
     offset: number;
     limit: number;
     hasMore: boolean;
   }

   interface JobStatusApiResponse {
     success: boolean;
     data: {
       jobs: TranslationJobResponse[];
       pagination: PaginationInfo;
       summary: JobStatusSummary;
     };
     error?: string;
     code?: string;
   }
   ```

2. **Update response to use types:**

   ```typescript
   const response: JobStatusApiResponse = {
     success: true,
     data: {
       jobs: transformedJobs,
       pagination: {
         total: totalCount,
         offset,
         limit,
         hasMore: totalCount > offset + limit
       },
       summary
     }
   };
   ```

#### Verification
- [ ] No TypeScript compilation errors
- [ ] IDE provides autocomplete for response fields
- [ ] Types match actual response shape

---

## Complete Implementation

After completing all tasks, the final file should look like this:

**File:** `/src/app/api/admin/translation-jobs/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';

// Type definitions for job status API
type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';
type EntityType = 'article' | 'item' | 'link' | 'tag';
type SortField = 'created_at' | 'started_at' | 'completed_at';
type SortOrder = 'asc' | 'desc';

interface TranslationJobResponse {
  id: string;
  entityType: EntityType;
  entityId: string;
  sourceLanguage: string;
  targetLanguage: string;
  status: JobStatus;
  attempts: number;
  errorMessage?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

interface JobStatusSummary {
  queued: number;
  processing: number;
  completed: number;
  failed: number;
}

interface PaginationInfo {
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

interface JobStatusApiResponse {
  success: boolean;
  data: {
    jobs: TranslationJobResponse[];
    pagination: PaginationInfo;
    summary: JobStatusSummary;
  };
  error?: string;
  code?: string;
}

// Debug prefix for log filtering
const DEBUG_PREFIX = '[TRANSLATION_JOBS_API]';

// Valid values for query parameters
const VALID_STATUSES = ['queued', 'processing', 'completed', 'failed'] as const;
const VALID_ENTITY_TYPES = ['article', 'item', 'link', 'tag'] as const;
const VALID_SORT_FIELDS = ['created_at', 'started_at', 'completed_at'] as const;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export async function GET(request: NextRequest): Promise<NextResponse> {
  console.log(`${DEBUG_PREFIX} === API CALL START ===`);
  console.log(`${DEBUG_PREFIX} Request URL:`, request.url);

  // Validate admin authentication
  console.log(`${DEBUG_PREFIX} AUTH_START: Calling validateAdminAuth...`);
  const authResult = await validateAdminAuth(request);
  console.log(`${DEBUG_PREFIX} AUTH_RESULT:`, {
    hasError: !!authResult.error,
    hasSupabase: !!authResult.supabase,
    isAdmin: authResult.isAdmin,
    isSysAdmin: authResult.isSysAdmin
  });

  if (authResult.error) {
    console.log(`${DEBUG_PREFIX} AUTH_FAILED: Returning auth error`);
    return authResult.error;
  }

  // Require admin privileges (admin or sysadmin)
  if (!authResult.isAdmin && !authResult.isSysAdmin) {
    console.log(`${DEBUG_PREFIX} ADMIN_CHECK_FAILED: User ${authResult.user?.email} is not an admin`);
    return NextResponse.json(
      {
        success: false,
        error: 'Admin privileges required',
        code: 'ADMIN_REQUIRED'
      },
      { status: 403 }
    );
  }
  console.log(`${DEBUG_PREFIX} ADMIN_CHECK_PASSED: User ${authResult.user?.email}`);

  const { supabase } = authResult;

  // Extract query parameters
  const { searchParams } = new URL(request.url);

  // Pagination parameters
  const limitParam = parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT));
  const limit = Math.min(Math.max(limitParam, 1), MAX_LIMIT);
  const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

  // Filter parameters
  const status = searchParams.get('status');
  const entityType = searchParams.get('entity_type');
  const targetLanguage = searchParams.get('target_language');

  // Sorting parameters
  const sortBy = searchParams.get('sort_by') || 'created_at';
  const sortOrder = searchParams.get('sort_order') || 'desc';

  console.log(`${DEBUG_PREFIX} QUERY_PARAMS:`, {
    status, entityType, targetLanguage, limit, offset, sortBy, sortOrder
  });

  // Validate status parameter
  if (status && !VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
    return NextResponse.json(
      {
        success: false,
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
        code: 'INVALID_STATUS'
      },
      { status: 400 }
    );
  }

  // Validate entity_type parameter
  if (entityType && !VALID_ENTITY_TYPES.includes(entityType as typeof VALID_ENTITY_TYPES[number])) {
    return NextResponse.json(
      {
        success: false,
        error: `Invalid entity_type. Must be one of: ${VALID_ENTITY_TYPES.join(', ')}`,
        code: 'INVALID_ENTITY_TYPE'
      },
      { status: 400 }
    );
  }

  // Validate sort_by parameter
  if (!VALID_SORT_FIELDS.includes(sortBy as typeof VALID_SORT_FIELDS[number])) {
    return NextResponse.json(
      {
        success: false,
        error: `Invalid sort_by. Must be one of: ${VALID_SORT_FIELDS.join(', ')}`,
        code: 'INVALID_SORT_FIELD'
      },
      { status: 400 }
    );
  }

  // Validate sort_order parameter
  if (sortOrder !== 'asc' && sortOrder !== 'desc') {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid sort_order. Must be "asc" or "desc"',
        code: 'INVALID_SORT_ORDER'
      },
      { status: 400 }
    );
  }

  try {
    // Build base query
    console.log(`${DEBUG_PREFIX} DB_QUERY: Building translation_jobs query...`);
    let query = supabase
      .from('translation_jobs')
      .select('*')
      .order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply filters conditionally
    if (status) {
      query = query.eq('status', status);
      console.log(`${DEBUG_PREFIX} FILTER_APPLIED: status = ${status}`);
    }
    if (entityType) {
      query = query.eq('entity_type', entityType);
      console.log(`${DEBUG_PREFIX} FILTER_APPLIED: entity_type = ${entityType}`);
    }
    if (targetLanguage) {
      query = query.eq('target_language', targetLanguage);
      console.log(`${DEBUG_PREFIX} FILTER_APPLIED: target_language = ${targetLanguage}`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: jobs, error: queryError } = await query;

    console.log(`${DEBUG_PREFIX} DB_QUERY_RESULT:`, {
      count: jobs?.length,
      error: queryError,
      sampleColumns: jobs?.[0] ? Object.keys(jobs[0]) : []
    });

    if (queryError) {
      console.error(`${DEBUG_PREFIX} DB_QUERY_FAILED:`, queryError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch translation jobs',
          code: 'QUERY_ERROR',
          details: queryError.message
        },
        { status: 500 }
      );
    }

    // Get total count for pagination (using same filters)
    console.log(`${DEBUG_PREFIX} COUNT_QUERY: Getting total count with filters...`);
    let countQuery = supabase
      .from('translation_jobs')
      .select('id');

    if (status) {
      countQuery = countQuery.eq('status', status);
    }
    if (entityType) {
      countQuery = countQuery.eq('entity_type', entityType);
    }
    if (targetLanguage) {
      countQuery = countQuery.eq('target_language', targetLanguage);
    }

    const { data: countData, error: countError } = await countQuery;
    const totalCount = countData?.length || jobs?.length || 0;

    if (countError) {
      console.warn(`${DEBUG_PREFIX} COUNT_WARNING:`, countError);
    } else {
      console.log(`${DEBUG_PREFIX} COUNT_SUCCESS: Found ${totalCount} total records matching filters`);
    }

    // Fetch summary counts by status
    console.log(`${DEBUG_PREFIX} SUMMARY_QUERY: Getting status summary counts...`);
    const summary: JobStatusSummary = {
      queued: 0,
      processing: 0,
      completed: 0,
      failed: 0
    };

    const { data: allJobsForSummary, error: summaryError } = await supabase
      .from('translation_jobs')
      .select('status');

    if (summaryError) {
      console.warn(`${DEBUG_PREFIX} SUMMARY_WARNING: Could not fetch summary counts`, summaryError);
    } else if (allJobsForSummary) {
      allJobsForSummary.forEach(job => {
        const jobStatus = job.status as keyof JobStatusSummary;
        if (jobStatus in summary) {
          summary[jobStatus]++;
        }
      });
      console.log(`${DEBUG_PREFIX} SUMMARY_SUCCESS:`, summary);
    }

    // Transform database fields to API response format (snake_case -> camelCase)
    console.log(`${DEBUG_PREFIX} TRANSFORM: Mapping ${jobs?.length || 0} jobs to API format...`);

    const transformedJobs: TranslationJobResponse[] = (jobs || []).map(job => ({
      id: job.id,
      entityType: job.entity_type as EntityType,
      entityId: job.entity_id,
      sourceLanguage: job.source_language,
      targetLanguage: job.target_language,
      status: job.status as JobStatus,
      attempts: job.attempts,
      errorMessage: job.error_message || undefined,
      createdAt: job.created_at,
      startedAt: job.started_at || undefined,
      completedAt: job.completed_at || undefined
    }));

    // Build final response
    const response: JobStatusApiResponse = {
      success: true,
      data: {
        jobs: transformedJobs,
        pagination: {
          total: totalCount,
          offset,
          limit,
          hasMore: totalCount > offset + limit
        },
        summary
      }
    };

    console.log(`${DEBUG_PREFIX} SUCCESS: Returning ${transformedJobs.length} jobs`);
    return NextResponse.json(response);

  } catch (unexpectedError) {
    console.error(`${DEBUG_PREFIX} UNEXPECTED_ERROR:`, unexpectedError);
    console.error(`${DEBUG_PREFIX} ERROR_STACK:`, (unexpectedError as Error).stack);

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

---

## Testing Checklist

### Authentication Tests
- [ ] Unauthenticated request returns 401
- [ ] Non-admin user returns 403
- [ ] Admin user (isAdmin=true) can access
- [ ] SysAdmin user (isSysAdmin=true) can access

### Validation Tests
- [ ] Invalid status returns 400 with error
- [ ] Invalid entity_type returns 400 with error
- [ ] Invalid sort_by returns 400 with error
- [ ] Invalid sort_order returns 400 with error

### Query Tests
- [ ] No filters returns all jobs
- [ ] status filter works correctly
- [ ] entity_type filter works correctly
- [ ] target_language filter works correctly
- [ ] Combined filters work correctly
- [ ] Sorting works (asc and desc)

### Pagination Tests
- [ ] Default limit (50) is applied
- [ ] Custom limit is respected
- [ ] Limit > 100 is capped at 100
- [ ] Offset works correctly
- [ ] hasMore is accurate
- [ ] total reflects filtered count

### Response Shape Tests
- [ ] Response uses camelCase field names
- [ ] Optional fields are undefined not null
- [ ] Pagination metadata is present
- [ ] Summary counts are present

### Edge Cases
- [ ] Empty table returns empty array (not error)
- [ ] Large offset returns empty array
- [ ] All jobs completed shows completed=N in summary

---

## Manual Test Commands

```bash
# Full test sequence (replace <auth_cookie> with actual cookie)

# 1. Unauthenticated (should 401)
curl -X GET "http://localhost:3000/api/admin/translation-jobs"

# 2. All jobs, no filters
curl -X GET "http://localhost:3000/api/admin/translation-jobs" \
  -H "Cookie: <auth_cookie>" | jq

# 3. Filter by status
curl -X GET "http://localhost:3000/api/admin/translation-jobs?status=queued" \
  -H "Cookie: <auth_cookie>" | jq

# 4. Filter by entity type
curl -X GET "http://localhost:3000/api/admin/translation-jobs?entity_type=article" \
  -H "Cookie: <auth_cookie>" | jq

# 5. Combined filters
curl -X GET "http://localhost:3000/api/admin/translation-jobs?status=failed&entity_type=item" \
  -H "Cookie: <auth_cookie>" | jq

# 6. Pagination
curl -X GET "http://localhost:3000/api/admin/translation-jobs?limit=10&offset=0" \
  -H "Cookie: <auth_cookie>" | jq

# 7. Sorting
curl -X GET "http://localhost:3000/api/admin/translation-jobs?sort_by=completed_at&sort_order=asc" \
  -H "Cookie: <auth_cookie>" | jq

# 8. Invalid parameter (should 400)
curl -X GET "http://localhost:3000/api/admin/translation-jobs?status=invalid" \
  -H "Cookie: <auth_cookie>" | jq
```

---

## Test Data Setup

If the `translation_jobs` table is empty, insert test data:

```sql
-- Insert test translation jobs for testing the API
INSERT INTO translation_jobs (entity_type, entity_id, source_language, target_language, status, attempts, error_message)
VALUES
  ('article', gen_random_uuid(), 'en', 'fr', 'queued', 0, NULL),
  ('article', gen_random_uuid(), 'en', 'es', 'processing', 1, NULL),
  ('item', gen_random_uuid(), 'en', 'de', 'completed', 1, NULL),
  ('item', gen_random_uuid(), 'en', 'nl', 'failed', 3, 'API rate limit exceeded'),
  ('link', gen_random_uuid(), 'en', 'it', 'queued', 0, NULL),
  ('tag', gen_random_uuid(), 'en', 'fr', 'completed', 1, NULL);
```

---

## Acceptance Criteria Verification

| Criteria | Task | Status |
|----------|------|--------|
| Administrators can retrieve a list of all translation jobs | Task 4.5.4 | [ ] |
| Results can be filtered by job status | Task 4.5.3, 4.5.4 | [ ] |
| Results can be filtered by entity type | Task 4.5.3, 4.5.4 | [ ] |
| Each job includes sufficient detail for debugging | Task 4.5.7 | [ ] |
| Endpoint restricted to authenticated administrators | Task 4.5.2 | [ ] |
| Query results are paginated | Task 4.5.5, 4.5.7 | [ ] |

---

## Files Changed Summary

| File | Action | Description |
|------|--------|-------------|
| `/src/app/api/admin/translation-jobs/route.ts` | CREATE | New API route for translation job status queries |

---

## References

- [Overview Document](./REQ-246-create-job-status-api-endpoint-overview.md)
- [Implementation Plan](./prd/Plan-110-L10N-Epic1-Foundation.md)
- [Request Definition](./gen_requests.md#req-246)
- [Reference: access-requests route](/src/app/api/admin/access-requests/route.ts)

---

*Document generated for FAQBNB Localization Epic 1 - Task 4.5*
