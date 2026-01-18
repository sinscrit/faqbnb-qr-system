# REQ-245: Admin API Endpoint for Translation Job Processing - Implementation Overview

**Generated:** 2026-01-18 23:15:00 UTC
**Last Modified:** 2026-01-18 23:15:00 UTC
**Request Reference:** REQ-245 in `/docs/gen_requests.md`
**Implementation Plan Reference:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
**Phase:** 4 - Background Job Processing
**Task ID:** 4.3

---

## Summary

Create an admin API endpoint that enables on-demand triggering of translation job processing and returns processing statistics. This endpoint allows system administrators to manually invoke job processing (useful for testing, debugging, or urgent translation needs) and can be called by external cron schedulers for automated batch processing. The endpoint integrates with the job processor (REQ-244) to execute processing cycles and returns detailed statistics about the processing session.

---

## Technical Context

### Existing Stack

| Technology | Details |
|------------|---------|
| **Framework** | Next.js 15.5.9 with App Router |
| **Language** | TypeScript 5.x (strict mode) |
| **Database** | Supabase (PostgreSQL with RLS) |
| **Authentication** | Supabase Auth with `validateAdminAuth()` pattern |
| **API Pattern** | Route handlers in `/src/app/api/admin/` |

### Relevant Existing Patterns

| Pattern | Location | Usage |
|---------|----------|-------|
| Admin Auth Validation | `/src/lib/auth-server.ts` | `validateAdminAuth()` for admin-only endpoints |
| Admin API Route | `/src/app/api/admin/grant-access/route.ts` | POST handler with sysadmin check |
| Analytics API | `/src/app/api/admin/analytics/route.ts` | GET handler with admin auth |
| Job Processor | `/src/lib/job-queue/job-processor.ts` | `getJobProcessor()`, `runProcessingCycle()` |

### Dependencies (Must Be Complete Before This Task)

| Task | File | Purpose |
|------|------|---------|
| REQ-243 (Task 4.1) | `/src/lib/job-queue/translation-jobs.ts` | Job queue module with fetching and status updates |
| REQ-244 (Task 4.2) | `/src/lib/job-queue/job-processor.ts` | `getJobProcessor()`, `runProcessingCycle()`, `ProcessingRunResult` type |

---

## Architecture

### API Endpoint Design

**Endpoint:** `POST /api/admin/process-translations`

**Method:** POST (chosen over GET because it triggers a state-changing operation)

**Authentication:** Admin-level authentication required (via `validateAdminAuth()`)

**Request Body (Optional):**
```typescript
{
  // Optional: Override default batch size for this run
  batchSize?: number;
  // Optional: Enable detailed logging for this run
  enableLogging?: boolean;
}
```

**Response Shape:**
```typescript
{
  success: boolean;
  data?: {
    // Processing run statistics
    startedAt: string;
    completedAt: string;
    jobsProcessed: number;
    jobsSucceeded: number;
    jobsFailed: number;
    totalProcessingTimeMs: number;

    // Per-job details (optional, for debugging)
    results?: Array<{
      jobId: string;
      success: boolean;
      entityType: 'article' | 'item' | 'link' | 'tag';
      entityId: string;
      targetLanguage: string;
      processingTimeMs: number;
      errorMessage?: string;
    }>;

    // Processor state
    processorStats: {
      isRunning: boolean;
      totalJobsProcessed: number;
      totalJobsSucceeded: number;
      totalJobsFailed: number;
      consecutiveErrors: number;
      lastProcessedAt?: string;
    };
  };
  error?: string;
  code?: string;
}
```

### Integration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Admin/Cron Request                            │
│               POST /api/admin/process-translations               │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
              ┌───────────────────────────────────────┐
              │         validateAdminAuth()            │
              │    (Check admin/sysadmin status)       │
              └───────────────────┬───────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
            ┌───────────────┐          ┌───────────────┐
            │  Auth Failed  │          │  Auth Success │
            │  Return 401   │          │               │
            └───────────────┘          └───────┬───────┘
                                               │
                                               ▼
                               ┌───────────────────────────────┐
                               │      getJobProcessor()         │
                               │  Get singleton processor       │
                               └───────────────┬───────────────┘
                                               │
                                               ▼
                               ┌───────────────────────────────┐
                               │     runProcessingCycle()       │
                               │  Process available jobs        │
                               └───────────────┬───────────────┘
                                               │
                                               ▼
                               ┌───────────────────────────────┐
                               │       Return Results           │
                               │  Stats + processing details    │
                               └───────────────────────────────┘
```

---

## Integration Contract

### Request Interface

```typescript
// /src/app/api/admin/process-translations/route.ts

import { NextRequest, NextResponse } from 'next/server';

/**
 * Optional request body for process-translations endpoint
 */
interface ProcessTranslationsRequest {
  /** Number of jobs to process in this run (default: 1) */
  batchSize?: number;
  /** Enable detailed logging for this run */
  enableLogging?: boolean;
  /** Include per-job details in response */
  includeJobDetails?: boolean;
}
```

### Response Interface

```typescript
/**
 * Response from process-translations endpoint
 */
interface ProcessTranslationsResponse {
  success: boolean;
  data?: {
    startedAt: string;
    completedAt: string;
    jobsProcessed: number;
    jobsSucceeded: number;
    jobsFailed: number;
    totalProcessingTimeMs: number;
    results?: JobProcessingResult[];
    processorStats: ProcessorStats;
  };
  error?: string;
  code?: string;
}
```

### Usage Examples

**Manual Trigger (curl):**
```bash
curl -X POST https://faqbnb-staging.up.railway.app/api/admin/process-translations \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"includeJobDetails": true}'
```

**Cron Job Integration (Railway):**
```bash
# In railway.json or cron configuration
curl -X POST $API_URL/api/admin/process-translations \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**From Application Code:**
```typescript
import { getJobProcessor } from '@/lib/job-queue';

// Direct processor access (for internal use)
const processor = getJobProcessor();
const result = await processor.runProcessingCycle();

// Via API (for external triggers)
const response = await fetch('/api/admin/process-translations', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## Implementation Tasks

### Task 4.3.1: Create Route Handler File

**Action:** Create new API route file
**File:** `/src/app/api/admin/process-translations/route.ts`

Create the directory structure and basic route handler:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';

/**
 * POST /api/admin/process-translations
 *
 * Triggers translation job processing and returns statistics.
 * Can be called manually or by external cron schedulers.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Implementation follows in subsequent tasks
}
```

**Acceptance Criteria:**
- File created in correct location
- Basic structure with POST export
- Imports from correct modules

### Task 4.3.2: Implement Authentication Check

**File:** `/src/app/api/admin/process-translations/route.ts`

Add authentication using the existing `validateAdminAuth()` pattern:

```typescript
export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log('[ProcessTranslations] POST request received');

  try {
    // Validate admin authentication
    const authResult = await validateAdminAuth(request);

    if (authResult.error) {
      console.log('[ProcessTranslations] Authentication failed');
      return authResult.error;
    }

    const { user, isAdmin, isSysAdmin } = authResult;

    // Require admin-level access
    if (!isAdmin && !isSysAdmin) {
      console.log('[ProcessTranslations] User is not admin:', user.email);
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied. Admin privileges required.',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    console.log('[ProcessTranslations] Auth successful for:', user.email);
    // Continue to processing...

  } catch (error) {
    console.error('[ProcessTranslations] Unexpected error:', error);
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
- Uses `validateAdminAuth()` from auth-server
- Returns 401 for unauthenticated requests
- Returns 403 for non-admin users
- Logs authentication events

### Task 4.3.3: Parse Request Body

**File:** `/src/app/api/admin/process-translations/route.ts`

Add optional request body parsing:

```typescript
// Inside POST handler, after auth check:

// Parse optional request body
let requestOptions: ProcessTranslationsRequest = {};
try {
  const contentType = request.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    const body = await request.text();
    if (body && body.trim()) {
      requestOptions = JSON.parse(body);
    }
  }
} catch (parseError) {
  console.warn('[ProcessTranslations] Failed to parse request body:', parseError);
  // Continue with defaults - body is optional
}

const {
  batchSize = 1,
  enableLogging = process.env.NODE_ENV !== 'production',
  includeJobDetails = false
} = requestOptions;

// Validate batchSize
if (typeof batchSize !== 'number' || batchSize < 1 || batchSize > 100) {
  return NextResponse.json(
    {
      success: false,
      error: 'Invalid batchSize. Must be a number between 1 and 100.',
      code: 'INVALID_PARAMS'
    },
    { status: 400 }
  );
}
```

**Acceptance Criteria:**
- Handles empty body gracefully
- Handles malformed JSON gracefully
- Validates batchSize parameter
- Uses sensible defaults

### Task 4.3.4: Implement Job Processing Trigger

**File:** `/src/app/api/admin/process-translations/route.ts`

Add the core processing logic:

```typescript
import { getJobProcessor } from '@/lib/job-queue';
import type { ProcessingRunResult, ProcessorStats, JobProcessingResult } from '@/lib/job-queue';

// Inside POST handler, after request parsing:

const startTime = Date.now();
const startedAt = new Date().toISOString();

console.log('[ProcessTranslations] Starting processing cycle', {
  batchSize,
  enableLogging,
  triggeredBy: user.email
});

// Get the job processor singleton
const processor = getJobProcessor();

// Temporarily update logging if requested
const originalStats = processor.getStats();
if (enableLogging) {
  processor.updateConfig({ enableLogging: true });
}

// Run processing cycle(s) based on batchSize
const allResults: JobProcessingResult[] = [];
let totalSucceeded = 0;
let totalFailed = 0;

for (let i = 0; i < batchSize; i++) {
  const result = await processor.processNextJob();

  if (!result) {
    // No more jobs available
    console.log('[ProcessTranslations] No more jobs available after', i, 'jobs');
    break;
  }

  allResults.push(result);

  if (result.success) {
    totalSucceeded++;
  } else {
    totalFailed++;
  }

  // Small delay between jobs to prevent rate limiting
  if (i < batchSize - 1 && batchSize > 1) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Restore original logging setting
if (enableLogging && !originalStats.isRunning) {
  processor.updateConfig({ enableLogging: originalStats.isRunning });
}

const completedAt = new Date().toISOString();
const totalProcessingTimeMs = Date.now() - startTime;
const processorStats = processor.getStats();

console.log('[ProcessTranslations] Processing complete', {
  jobsProcessed: allResults.length,
  succeeded: totalSucceeded,
  failed: totalFailed,
  timeMs: totalProcessingTimeMs
});
```

**Acceptance Criteria:**
- Gets job processor singleton
- Processes requested number of jobs
- Handles case when no jobs available
- Includes rate limiting delay between jobs
- Tracks all results

### Task 4.3.5: Format and Return Response

**File:** `/src/app/api/admin/process-translations/route.ts`

Complete the response formatting:

```typescript
// Inside POST handler, after processing:

// Build response
const response: ProcessTranslationsResponse = {
  success: true,
  data: {
    startedAt,
    completedAt,
    jobsProcessed: allResults.length,
    jobsSucceeded: totalSucceeded,
    jobsFailed: totalFailed,
    totalProcessingTimeMs,
    processorStats: {
      isRunning: processorStats.isRunning,
      totalJobsProcessed: processorStats.totalJobsProcessed,
      totalJobsSucceeded: processorStats.totalJobsSucceeded,
      totalJobsFailed: processorStats.totalJobsFailed,
      consecutiveErrors: processorStats.consecutiveErrors,
      lastProcessedAt: processorStats.lastProcessedAt
    }
  }
};

// Include detailed results if requested
if (includeJobDetails && allResults.length > 0) {
  response.data!.results = allResults.map(r => ({
    jobId: r.jobId,
    success: r.success,
    entityType: r.entityType,
    entityId: r.entityId,
    targetLanguage: r.targetLanguage,
    processingTimeMs: r.processingTimeMs,
    errorMessage: r.errorMessage
  }));
}

return NextResponse.json(response);
```

**Acceptance Criteria:**
- Returns success boolean
- Includes all required statistics
- Includes processor state
- Conditionally includes job details
- Proper JSON formatting

### Task 4.3.6: Add Error Handling

**File:** `/src/app/api/admin/process-translations/route.ts`

Ensure comprehensive error handling:

```typescript
// Wrap all processing logic in try-catch:

try {
  // ... all processing logic ...

} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error('[ProcessTranslations] Processing error:', errorMessage);

  // Still return partial results if we have them
  const partialResponse: ProcessTranslationsResponse = {
    success: false,
    error: `Processing failed: ${errorMessage}`,
    code: 'PROCESSING_ERROR'
  };

  // Include any results we did get
  if (allResults && allResults.length > 0) {
    partialResponse.data = {
      startedAt: startedAt || new Date().toISOString(),
      completedAt: new Date().toISOString(),
      jobsProcessed: allResults.length,
      jobsSucceeded: totalSucceeded || 0,
      jobsFailed: (totalFailed || 0) + 1, // Count this error
      totalProcessingTimeMs: Date.now() - (startTime || Date.now()),
      processorStats: processor?.getStats() || {
        isRunning: false,
        totalJobsProcessed: 0,
        totalJobsSucceeded: 0,
        totalJobsFailed: 0,
        consecutiveErrors: 0
      }
    };
  }

  return NextResponse.json(partialResponse, { status: 500 });
}
```

**Acceptance Criteria:**
- Catches all processing errors
- Returns partial results on failure
- Includes meaningful error messages
- Always includes statistics when available

### Task 4.3.7: Add Request Logging for Cron Integration

**File:** `/src/app/api/admin/process-translations/route.ts`

Add logging to support cron monitoring:

```typescript
// At the start of the handler:
const requestId = `proc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
console.log(`[ProcessTranslations:${requestId}] Request received`, {
  timestamp: new Date().toISOString(),
  userAgent: request.headers.get('user-agent'),
  source: request.headers.get('x-cron-source') || 'manual'
});

// At the end of the handler (success):
console.log(`[ProcessTranslations:${requestId}] Request completed`, {
  jobsProcessed: allResults.length,
  succeeded: totalSucceeded,
  failed: totalFailed,
  durationMs: totalProcessingTimeMs
});

// At the end of the handler (error):
console.log(`[ProcessTranslations:${requestId}] Request failed`, {
  error: errorMessage,
  partialJobsProcessed: allResults?.length || 0
});
```

**Acceptance Criteria:**
- Unique request ID for correlation
- Logs request source (cron vs manual)
- Logs processing outcomes
- Supports cron monitoring tools

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/admin/process-translations/route.ts` | Main API route handler |

### Existing Files to Read (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/auth-server.ts` | `validateAdminAuth()` pattern and types |
| `/src/lib/job-queue/job-processor.ts` | `getJobProcessor()`, types |
| `/src/lib/job-queue/index.ts` | Barrel exports |
| `/src/app/api/admin/grant-access/route.ts` | POST handler pattern reference |
| `/src/app/api/admin/analytics/route.ts` | Response formatting reference |

### Functions to Implement

| Function | File | Purpose |
|----------|------|---------|
| `POST` | route.ts | Main handler for POST requests |

### Files NOT to Modify

- `/src/lib/job-queue/job-processor.ts` - Already implemented (REQ-244)
- `/src/lib/job-queue/translation-jobs.ts` - Already implemented (REQ-243)
- `/src/lib/auth-server.ts` - Use existing `validateAdminAuth()`

---

## Dependencies

### Prerequisites (Must Be Completed First)

1. **REQ-243 (Task 4.1):** Job queue module
   - Job queue must be available for processor

2. **REQ-244 (Task 4.2):** Job processor
   - `getJobProcessor()` singleton function
   - `processNextJob()` method
   - `ProcessingRunResult` type
   - `ProcessorStats` type
   - `JobProcessingResult` type

### Downstream Dependencies (Tasks That Depend on This)

1. **Task 4.4:** Concurrency control - may use this endpoint for testing
2. **Task 4.5:** Job status API - complementary admin endpoint
3. **Cron Configuration:** External scheduler setup will use this endpoint

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| HTTP Method | POST | Triggers state-changing processing operation |
| Auth Level | Admin required | Prevents unauthorized job processing |
| Batch Default | 1 job | Matches job processor design; predictable behavior |
| Max Batch Size | 100 | Prevent runaway processing; balance flexibility |
| Job Details | Optional | Reduces response size for cron; available for debugging |
| Error Response | Include partial results | Provides visibility even on failures |
| Rate Limiting | 100ms between jobs | Prevents overwhelming translation APIs |

---

## Testing Considerations

### Manual Testing

1. **Authenticated Admin Request:**
```bash
# Get auth token first, then:
curl -X POST http://localhost:3000/api/admin/process-translations \
  -H "Cookie: <session-cookie>" \
  -H "Content-Type: application/json" \
  -d '{"includeJobDetails": true}'
```

2. **Unauthenticated Request:**
```bash
curl -X POST http://localhost:3000/api/admin/process-translations
# Expected: 401 Unauthorized
```

3. **Non-Admin User:**
```bash
# Use regular user session
curl -X POST http://localhost:3000/api/admin/process-translations \
  -H "Cookie: <regular-user-cookie>"
# Expected: 403 Forbidden
```

4. **No Jobs Available:**
```bash
# When queue is empty
curl -X POST http://localhost:3000/api/admin/process-translations \
  -H "Cookie: <admin-cookie>"
# Expected: 200 with jobsProcessed: 0
```

5. **Batch Processing:**
```bash
curl -X POST http://localhost:3000/api/admin/process-translations \
  -H "Cookie: <admin-cookie>" \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 5}'
# Expected: Process up to 5 jobs
```

### Integration Tests

- Test with actual queued jobs
- Verify job status updates in database
- Verify translation tables populated
- Test concurrent endpoint calls
- Test with failing jobs in queue

### Edge Cases

- Empty request body
- Malformed JSON body
- Invalid batchSize (negative, zero, >100, string)
- No jobs in queue
- All jobs fail during batch
- Processor already running in background
- Database connection issues mid-processing

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Concurrent processing issues | Medium | Medium | Job locking in processor handles this |
| Long-running requests timeout | Low | Medium | Keep batch size reasonable; Railway has 30s timeout |
| Translation API rate limits hit | Medium | Low | Rate limiting delay between jobs |
| Unauthorized access | Low | High | Strict admin auth check |
| Partial failures lose visibility | Medium | Medium | Return partial results on errors |

---

## Effort Estimate

| Task | Estimate | Confidence |
|------|----------|------------|
| 4.3.1: Create route file | Trivial | High |
| 4.3.2: Auth implementation | Small | High |
| 4.3.3: Request parsing | Small | High |
| 4.3.4: Processing trigger | Small | High |
| 4.3.5: Response formatting | Small | High |
| 4.3.6: Error handling | Small | High |
| 4.3.7: Request logging | Trivial | High |
| **Total** | **Small** | High |

---

## Acceptance Criteria Verification

| Criteria (from REQ-245) | Implementation Verification |
|-------------------------|----------------------------|
| Endpoint requires admin-level authentication | `validateAdminAuth()` + admin/sysAdmin check |
| Single invocation triggers one processing cycle | `processor.processNextJob()` call (or batch) |
| Response includes count of jobs processed | `jobsProcessed` in response |
| Response includes count of successful translations | `jobsSucceeded` in response |
| Response includes count of failed translations | `jobsFailed` in response |
| Response includes total processing time | `totalProcessingTimeMs` in response |
| Endpoint can be called repeatedly without adverse effects | Idempotent processing; job locking |
| Failed job processing does not prevent statistics return | Try-catch with partial results |
| Endpoint suitable for cron invocation | Simple POST, returns JSON, supports automation headers |

---

## Example Response

**Successful Processing (with details):**
```json
{
  "success": true,
  "data": {
    "startedAt": "2026-01-18T23:30:00.000Z",
    "completedAt": "2026-01-18T23:30:02.150Z",
    "jobsProcessed": 3,
    "jobsSucceeded": 2,
    "jobsFailed": 1,
    "totalProcessingTimeMs": 2150,
    "results": [
      {
        "jobId": "550e8400-e29b-41d4-a716-446655440001",
        "success": true,
        "entityType": "article",
        "entityId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "targetLanguage": "fr",
        "processingTimeMs": 650
      },
      {
        "jobId": "550e8400-e29b-41d4-a716-446655440002",
        "success": true,
        "entityType": "item",
        "entityId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "targetLanguage": "es",
        "processingTimeMs": 720
      },
      {
        "jobId": "550e8400-e29b-41d4-a716-446655440003",
        "success": false,
        "entityType": "link",
        "entityId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
        "targetLanguage": "de",
        "processingTimeMs": 780,
        "errorMessage": "Translation API rate limit exceeded"
      }
    ],
    "processorStats": {
      "isRunning": false,
      "totalJobsProcessed": 127,
      "totalJobsSucceeded": 124,
      "totalJobsFailed": 3,
      "consecutiveErrors": 1,
      "lastProcessedAt": "2026-01-18T23:30:02.000Z"
    }
  }
}
```

**No Jobs Available:**
```json
{
  "success": true,
  "data": {
    "startedAt": "2026-01-18T23:30:00.000Z",
    "completedAt": "2026-01-18T23:30:00.050Z",
    "jobsProcessed": 0,
    "jobsSucceeded": 0,
    "jobsFailed": 0,
    "totalProcessingTimeMs": 50,
    "processorStats": {
      "isRunning": false,
      "totalJobsProcessed": 127,
      "totalJobsSucceeded": 124,
      "totalJobsFailed": 3,
      "consecutiveErrors": 0,
      "lastProcessedAt": "2026-01-18T22:15:00.000Z"
    }
  }
}
```

---

## References

- Implementation Plan: `/docs/prd/Plan-110-L10N-Epic1-Foundation.md` (Phase 4, Task 4.3)
- Job Queue Module: REQ-243 (`/docs/REQ-243-create-translation-job-queue-module-overview.md`)
- Job Processor: REQ-244 (`/docs/REQ-244-implement-job-processor-overview.md`)
- Auth Pattern: `/src/lib/auth-server.ts`
- Admin Route Examples: `/src/app/api/admin/grant-access/route.ts`, `/src/app/api/admin/analytics/route.ts`

---

*Implementation overview generated for FAQBNB Localization Epic 1 - Foundation, Phase 4, Task 4.3*
