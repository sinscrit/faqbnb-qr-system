# REQ-246: Create Job Status API Endpoint - Implementation Overview

**Generated:** 2026-01-18 12:30:00 UTC
**Last Modified:** 2026-01-18 12:30:00 UTC
**Request Reference:** REQ-246 - Admin Job Status Query API Endpoint
**Plan Reference:** Plan-110-L10N-Epic1-Foundation.md (Phase 4, Task 4.5)
**Status:** Ready for Implementation

---

## 1. Request Summary

Create an admin API endpoint that allows administrators to query translation jobs by status and entity type for monitoring system health and debugging issues. The endpoint will provide:
- List of translation jobs with filtering by status (pending, processing, completed, failed)
- Filtering by entity type (article, item, link, tag)
- Pagination support for large job volumes
- Detailed job information for troubleshooting

This API supports the Background Job Processing phase of the L10N Epic 1 Foundation and enables operational visibility into the translation system.

---

## 2. Current State Analysis

### Existing Related Endpoints

| Endpoint | Location | Relevance |
|----------|----------|-----------|
| `/api/admin/access-requests` | `src/app/api/admin/access-requests/route.ts` | **Primary Pattern** - Admin listing with filters, pagination, status filtering |
| `/api/admin/analytics` | `src/app/api/admin/analytics/route.ts` | Reference for admin auth and account context patterns |
| `/api/admin/items` | `src/app/api/admin/items/route.ts` | Shows paginated listing with search/filter |

### Translation Jobs Table Schema (From Plan-110)

Based on the implementation plan's database schema definition:

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key, auto-generated |
| `entity_type` | VARCHAR(50) | 'article', 'item', 'link', 'tag' |
| `entity_id` | UUID | Reference to the translated entity |
| `source_language` | VARCHAR(5) | Default 'en' |
| `target_language` | VARCHAR(5) | Target language code |
| `status` | VARCHAR(20) | 'queued', 'processing', 'completed', 'failed' |
| `attempts` | INTEGER | Number of processing attempts |
| `error_message` | TEXT | Error details for failed jobs |
| `created_at` | TIMESTAMPTZ | Job creation time |
| `started_at` | TIMESTAMPTZ | Processing start time |
| `completed_at` | TIMESTAMPTZ | Completion/failure time |

**Note:** The `translation_jobs` table must be created as part of Task 1.1 (database migration) before this endpoint can function.

### Authentication Pattern

From existing admin routes (e.g., `src/app/api/admin/access-requests/route.ts`):
```typescript
import { validateAdminAuth } from '@/lib/auth-server';

const authResult = await validateAdminAuth(request);
if (authResult.error) {
  return authResult.error;
}

// Check for sysadmin role if needed
if (!authResult.isSysAdmin) {
  return NextResponse.json(
    { success: false, error: 'Access denied. This feature is restricted to system administrators.' },
    { status: 403 }
  );
}
```

---

## 3. Technical Approach

### API Design

**Endpoint:** `GET /api/admin/translation-jobs`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by job status: 'queued', 'processing', 'completed', 'failed' |
| `entity_type` | string | No | Filter by entity type: 'article', 'item', 'link', 'tag' |
| `target_language` | string | No | Filter by target language code |
| `limit` | number | No | Results per page (default: 50, max: 100) |
| `offset` | number | No | Pagination offset (default: 0) |
| `sort_by` | string | No | Sort field: 'created_at', 'started_at', 'completed_at' (default: 'created_at') |
| `sort_order` | string | No | Sort direction: 'asc', 'desc' (default: 'desc') |

**Response Shape:**
```typescript
{
  success: boolean;
  data: {
    jobs: Array<{
      id: string;
      entityType: 'article' | 'item' | 'link' | 'tag';
      entityId: string;
      sourceLanguage: string;
      targetLanguage: string;
      status: 'queued' | 'processing' | 'completed' | 'failed';
      attempts: number;
      errorMessage?: string;
      createdAt: string;
      startedAt?: string;
      completedAt?: string;
    }>;
    pagination: {
      total: number;
      offset: number;
      limit: number;
      hasMore: boolean;
    };
    summary?: {
      queued: number;
      processing: number;
      completed: number;
      failed: number;
    };
  };
  error?: string;
}
```

### Query Strategy

1. **Authenticate admin user** - Use existing `validateAdminAuth` pattern
2. **Parse and validate query parameters** - Extract filters, pagination, sorting
3. **Build dynamic Supabase query** - Apply filters based on parameters
4. **Execute count query** - Get total for pagination
5. **Execute data query** - Get filtered, sorted, paginated results
6. **Optionally fetch summary counts** - Status breakdown for dashboard use
7. **Transform and return response** - Map database fields to camelCase API response

### Error Handling

- 401 for unauthenticated requests
- 403 for non-admin users
- 400 for invalid query parameters (e.g., invalid status value)
- 500 for database errors with appropriate logging

---

## 4. Implementation Tasks

### Task 4.5.1: Create API Route File Structure

**Action:** Create new file
**File:** `/src/app/api/admin/translation-jobs/route.ts`

Subtasks:
- [ ] Create directory structure `/src/app/api/admin/translation-jobs/`
- [ ] Create route.ts with basic GET handler skeleton
- [ ] Add imports for auth helpers, Supabase, NextResponse

### Task 4.5.2: Implement Authentication and Authorization

**Action:** Add admin auth check
**File:** `/src/app/api/admin/translation-jobs/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const DEBUG_PREFIX = '[TRANSLATION_JOBS_API]';
  console.log(`${DEBUG_PREFIX} API called - validating authentication...`);

  const authResult = await validateAdminAuth(request);
  if (authResult.error) {
    return authResult.error;
  }

  // Require admin privileges (sysadmin or admin role)
  if (!authResult.isAdmin && !authResult.isSysAdmin) {
    return NextResponse.json(
      { success: false, error: 'Admin privileges required', code: 'FORBIDDEN' },
      { status: 403 }
    );
  }

  const { supabase } = authResult;
  // ... rest of implementation
}
```

### Task 4.5.3: Parse and Validate Query Parameters

**Action:** Extract and validate all filter/pagination parameters
**File:** `/src/app/api/admin/translation-jobs/route.ts`

```typescript
const { searchParams } = new URL(request.url);

// Pagination
const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
const offset = parseInt(searchParams.get('offset') || '0');

// Filters
const status = searchParams.get('status');
const entityType = searchParams.get('entity_type');
const targetLanguage = searchParams.get('target_language');

// Sorting
const sortBy = searchParams.get('sort_by') || 'created_at';
const sortOrder = searchParams.get('sort_order') || 'desc';

// Validation
const validStatuses = ['queued', 'processing', 'completed', 'failed'];
const validEntityTypes = ['article', 'item', 'link', 'tag'];
const validSortFields = ['created_at', 'started_at', 'completed_at'];

if (status && !validStatuses.includes(status)) {
  return NextResponse.json(
    { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
    { status: 400 }
  );
}

if (entityType && !validEntityTypes.includes(entityType)) {
  return NextResponse.json(
    { success: false, error: `Invalid entity_type. Must be one of: ${validEntityTypes.join(', ')}` },
    { status: 400 }
  );
}

if (!validSortFields.includes(sortBy)) {
  return NextResponse.json(
    { success: false, error: `Invalid sort_by. Must be one of: ${validSortFields.join(', ')}` },
    { status: 400 }
  );
}
```

### Task 4.5.4: Build and Execute Database Query

**Action:** Query translation_jobs table with filters
**File:** `/src/app/api/admin/translation-jobs/route.ts`

```typescript
try {
  // Build base query
  let query = supabase
    .from('translation_jobs')
    .select('*')
    .order(sortBy, { ascending: sortOrder === 'asc' });

  // Apply filters
  if (status) {
    query = query.eq('status', status);
  }
  if (entityType) {
    query = query.eq('entity_type', entityType);
  }
  if (targetLanguage) {
    query = query.eq('target_language', targetLanguage);
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data: jobs, error: queryError } = await query;

  if (queryError) {
    console.error(`${DEBUG_PREFIX} Query error:`, queryError);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch translation jobs', code: 'QUERY_ERROR' },
      { status: 500 }
    );
  }
```

### Task 4.5.5: Get Total Count for Pagination

**Action:** Execute count query for pagination metadata
**File:** `/src/app/api/admin/translation-jobs/route.ts`

```typescript
  // Build count query with same filters
  let countQuery = supabase
    .from('translation_jobs')
    .select('id', { count: 'exact', head: true });

  if (status) {
    countQuery = countQuery.eq('status', status);
  }
  if (entityType) {
    countQuery = countQuery.eq('entity_type', entityType);
  }
  if (targetLanguage) {
    countQuery = countQuery.eq('target_language', targetLanguage);
  }

  const { count: totalCount, error: countError } = await countQuery;

  if (countError) {
    console.warn(`${DEBUG_PREFIX} Count query error:`, countError);
    // Continue with null total - better than failing entirely
  }
```

### Task 4.5.6: Optionally Fetch Status Summary

**Action:** Get counts by status for dashboard display
**File:** `/src/app/api/admin/translation-jobs/route.ts`

```typescript
  // Fetch summary counts (optional enhancement for dashboard)
  const summary = {
    queued: 0,
    processing: 0,
    completed: 0,
    failed: 0
  };

  // Get all jobs for summary counts (simplified approach)
  const { data: allJobs } = await supabase
    .from('translation_jobs')
    .select('status');

  if (allJobs) {
    allJobs.forEach(job => {
      const jobStatus = job.status as keyof typeof summary;
      if (jobStatus in summary) {
        summary[jobStatus]++;
      }
    });
  }
```

### Task 4.5.7: Transform and Return Response

**Action:** Map database fields to API response format
**File:** `/src/app/api/admin/translation-jobs/route.ts`

```typescript
  // Transform jobs to API response format
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

  const response = {
    success: true,
    data: {
      jobs: transformedJobs,
      pagination: {
        total: totalCount || transformedJobs.length,
        offset,
        limit,
        hasMore: (totalCount || 0) > offset + limit
      },
      summary
    }
  };

  console.log(`${DEBUG_PREFIX} Returning ${transformedJobs.length} jobs`);
  return NextResponse.json(response);

} catch (unexpectedError) {
  console.error(`${DEBUG_PREFIX} Unexpected error:`, unexpectedError);
  return NextResponse.json(
    { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
    { status: 500 }
  );
}
```

### Task 4.5.8: Add TypeScript Types

**Action:** Create type definitions for job status API
**File:** `/src/app/api/admin/translation-jobs/route.ts` (or separate types file)

```typescript
// Types can be defined inline or imported from translation-service types
type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';
type EntityType = 'article' | 'item' | 'link' | 'tag';

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

interface JobStatusApiResponse {
  success: boolean;
  data: {
    jobs: TranslationJobResponse[];
    pagination: {
      total: number;
      offset: number;
      limit: number;
      hasMore: boolean;
    };
    summary?: {
      queued: number;
      processing: number;
      completed: number;
      failed: number;
    };
  };
  error?: string;
}
```

---

## 5. Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Description |
|-----------|-------------|
| `/src/app/api/admin/translation-jobs/route.ts` | New API route for translation job status queries |

### Files to READ (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/admin/access-requests/route.ts` | Auth pattern, pagination pattern |
| `/src/app/api/admin/analytics/route.ts` | Admin auth and filtering patterns |
| `/src/app/api/admin/items/route.ts` | Listing with search/filter pattern |
| `/src/lib/auth-server.ts` | Admin authentication helper |
| `/src/lib/supabase-server.ts` | Server-side Supabase client creation |

### Dependencies (Must Exist Before Implementation)

| Dependency | Task Reference | Notes |
|------------|----------------|-------|
| `translation_jobs` table | Task 1.1 | Database table must be created via migration |
| RLS policies for translation_jobs | Task 1.4 | Read access for admins/service role |

### No Modifications Required

The following files should NOT be modified for this task:
- `/src/lib/auth-server.ts` (use existing validateAdminAuth)
- `/src/lib/supabase.ts` (no new types needed yet - table types added in Task 1.5)
- Any existing API routes
- Database schema (handled in Phase 1 tasks)

---

## 6. Dependencies

### Internal Dependencies

| Dependency | Import Path | Usage |
|------------|-------------|-------|
| `validateAdminAuth` | `@/lib/auth-server` | Admin authentication and authorization |
| `NextRequest`, `NextResponse` | `next/server` | Request/response handling |

### Database Tables

| Table | Access Type | Fields Used |
|-------|-------------|-------------|
| `translation_jobs` | SELECT | All fields for listing and filtering |

### Prerequisite Tasks

| Task ID | Description | Blocking? |
|---------|-------------|-----------|
| 1.1 | Create migration file with translation_jobs table | Yes |
| 1.4 | Implement RLS policies for translation tables | Yes |
| 1.5 | Update TypeScript database types | Partial (can work without, improves DX) |

---

## 7. Acceptance Criteria

From REQ-246:

- [ ] Administrators can retrieve a list of all translation jobs
- [ ] Results can be filtered by job status (pending, processing, completed, failed)
- [ ] Results can be filtered by entity type (property, FAQ, etc.)
- [ ] Each job record includes sufficient detail for debugging (job ID, status, timestamps, entity reference, error messages if applicable)
- [ ] The endpoint is restricted to authenticated administrators only
- [ ] Query results are paginated to handle large job volumes

### Additional Verification

- [ ] Endpoint returns 401 for unauthenticated requests
- [ ] Endpoint returns 403 for non-admin users
- [ ] Endpoint returns 400 for invalid filter values
- [ ] Empty result sets return empty array without errors
- [ ] Response matches expected shape with all required fields
- [ ] Pagination metadata is accurate (total, hasMore)
- [ ] Summary counts are accurate across all job statuses

---

## 8. Testing Strategy

### Manual Testing

1. **Authenticated admin request (no filters):**
   ```bash
   curl -X GET "http://localhost:3000/api/admin/translation-jobs" \
     -H "Cookie: <auth_cookie>"
   ```

2. **Filter by status:**
   ```bash
   curl -X GET "http://localhost:3000/api/admin/translation-jobs?status=failed" \
     -H "Cookie: <auth_cookie>"
   ```

3. **Filter by entity type:**
   ```bash
   curl -X GET "http://localhost:3000/api/admin/translation-jobs?entity_type=article" \
     -H "Cookie: <auth_cookie>"
   ```

4. **Combined filters with pagination:**
   ```bash
   curl -X GET "http://localhost:3000/api/admin/translation-jobs?status=queued&entity_type=item&limit=10&offset=0" \
     -H "Cookie: <auth_cookie>"
   ```

5. **Unauthenticated request:**
   ```bash
   curl -X GET "http://localhost:3000/api/admin/translation-jobs"
   # Expected: 401 Unauthorized
   ```

6. **Non-admin user:**
   ```bash
   # Login as regular user, then:
   curl -X GET "http://localhost:3000/api/admin/translation-jobs" \
     -H "Cookie: <regular_user_cookie>"
   # Expected: 403 Forbidden
   ```

### Edge Cases

- Empty translation_jobs table (should return empty array)
- Invalid status parameter (should return 400)
- Invalid entity_type parameter (should return 400)
- Large offset beyond total count (should return empty array)
- Limit exceeds maximum (should cap at 100)
- Sorting by completed_at when most jobs haven't completed

### Test Data Setup

Before testing, ensure translation_jobs table has test data:
```sql
INSERT INTO translation_jobs (entity_type, entity_id, target_language, status, attempts) VALUES
('article', gen_random_uuid(), 'fr', 'queued', 0),
('article', gen_random_uuid(), 'es', 'processing', 1),
('item', gen_random_uuid(), 'de', 'completed', 1),
('item', gen_random_uuid(), 'nl', 'failed', 3);
```

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| translation_jobs table not created | High (if Task 1.1 not done) | Blocking | Verify Phase 1 tasks complete before starting |
| Performance with large job volumes | Medium | Medium | Use efficient queries with indexes; pagination required |
| RLS policies block access | Medium | High | Ensure admin/service role access in Task 1.4 |
| TypeScript types not available | Low | Low | Can use `any` temporarily; Task 1.5 adds proper types |

---

## 10. Estimated Effort

| Task | Estimate |
|------|----------|
| Create file structure | 5 min |
| Implement authentication | 10 min |
| Parse/validate query params | 15 min |
| Build database queries | 20 min |
| Transform response | 10 min |
| Error handling | 10 min |
| Testing | 30 min |
| **Total** | **~100 min** |

---

## 11. Next Steps After Implementation

After completing Task 4.5 (this task):

1. **Phase 5 Tasks:** Language Switching Infrastructure
   - Task 5.1: Create language detection utility
   - Task 5.2: Update middleware for language handling
   - Task 5.3: Create LanguageSwitcher component

2. **Phase 6 Tasks:** Testing & Validation
   - Task 6.2: Write integration tests for job processing (includes this endpoint)

3. **Future Enhancement Considerations:**
   - Add ability to retry failed jobs via POST/PUT endpoint
   - Add ability to cancel queued jobs
   - Add webhooks for job status changes
   - Add job metrics/analytics aggregations

---

## References

- [PRD: L10N Epic 1 Foundation](/docs/prd/PRD_L10N_Epic1_Foundation.md)
- [Implementation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
- [Request Definition](/docs/gen_requests.md#req-246)
- [Existing Admin API Pattern](/src/app/api/admin/access-requests/route.ts)
- [Auth Server Helper](/src/lib/auth-server.ts)
