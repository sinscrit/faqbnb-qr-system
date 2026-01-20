# Implementation Breakdown: REQ-E03-025 - Create Job Processing API Route

**Generated:** 2026-01-20 12:00:00 UTC
**Last Modified:** 2026-01-20 12:00:00 UTC
**Request Reference:** REQ-E03-025 from docs/gen_requests_epic3.md
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md
**Phase:** 5 - Job Processing Trigger Setup
**Task ID:** 5.1
**Size:** M (Medium)

---

## Summary

Create an administrative API endpoint at `/src/app/api/admin/process-translations/route.ts` that triggers on-demand translation job processing. The endpoint accepts a configurable batch size, executes translation jobs synchronously, and returns detailed processing statistics. It must be secured with service role or admin authentication.

---

## Current Behavior

No on-demand mechanism exists to trigger translation job processing. Jobs are only processed through background polling intervals (via `TranslationJobProcessor` class). Administrators cannot manually trigger processing for:
- Verifying system functionality during troubleshooting
- Recovering from processing failures
- Accelerating translations for time-sensitive content
- Implementing custom scheduling solutions for serverless environments

---

## Expected Behavior

A POST endpoint at `/api/admin/process-translations` that:

1. **Authentication & Authorization**
   - Validates administrative or service role authentication
   - Returns 403 for unauthorized requests
   - Logs all invocations with user identity for audit

2. **Request Parameters**
   - Accepts optional JSON body with `batchSize` parameter
   - Defaults `batchSize` to 10 when not provided
   - Caps maximum `batchSize` at 50 (auto-caps rather than rejects)
   - Returns 400 for invalid values (negative, non-numeric)

3. **Processing Execution**
   - Runs stale job cleanup before processing new jobs
   - Invokes job picker to retrieve up to `batchSize` queued jobs
   - Jobs ordered by priority (REQ-E03-018) then created_at
   - Processes each job using content-specific handlers
   - Respects concurrency limits (10 concurrent max per REQ-E03-019)
   - Continues processing even if individual jobs fail
   - Completes synchronously before returning response

4. **Response Statistics**
   - Total count of jobs processed (attempted)
   - Count of successful completions
   - Count of failures
   - Count of stale jobs recovered during cleanup
   - Average processing duration per job (ms)
   - Array of language codes processed
   - Breakdown of job counts by entity type
   - Processing start and end timestamps

---

## Technical Approach

### Architecture

```
POST /api/admin/process-translations
    │
    ├── 1. Authenticate (validateAdminAuth or service role)
    │
    ├── 2. Validate request body (batchSize)
    │
    ├── 3. Run stale job cleanup (cleanupStaleProcessingJobs)
    │
    ├── 4. Process batch:
    │       │
    │       └── For each job up to batchSize:
    │           ├── Fetch and lock next job (fetchAndLockNextJob)
    │           ├── Process via TranslationJobProcessor
    │           ├── Track success/failure
    │           └── Aggregate statistics
    │
    └── 5. Return statistics response
```

### Integration Points

| Component | Location | Usage |
|-----------|----------|-------|
| `validateAdminAuth` | `/src/lib/auth-server.ts` | Admin authentication |
| `cleanupStaleProcessingJobs` | `/src/lib/job-queue/concurrency-control.ts` | Pre-processing cleanup |
| `fetchAndLockNextJob` | `/src/lib/job-queue/translation-jobs.ts` | Job retrieval with locking |
| `TranslationJobProcessor` | `/src/lib/job-queue/job-processor.ts` | Job processing with `processNextJob()` |
| `getJobProcessor` | `/src/lib/job-queue/job-processor.ts` | Singleton processor access |

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/admin/process-translations/route.ts` | Main API endpoint |

### Files to Read/Reference (No Modification)

| File Path | Functions/Patterns to Use |
|-----------|---------------------------|
| `/src/lib/auth-server.ts` | `validateAdminAuth()`, `isSysAdmin()` |
| `/src/lib/job-queue/job-processor.ts` | `TranslationJobProcessor`, `ProcessingRunResult`, `JobProcessingResult`, `getJobProcessor()` |
| `/src/lib/job-queue/concurrency-control.ts` | `cleanupStaleProcessingJobs()`, `CleanupResult` |
| `/src/lib/job-queue/translation-jobs.ts` | `fetchAndLockNextJob()` |
| `/src/lib/job-queue/translation-jobs.types.ts` | `TranslationJob`, `EntityType`, `SupportedLanguage` |
| `/src/app/api/admin/translate/route.ts` | Reference for POST handler pattern |
| `/src/app/api/admin/grant-access/route.ts` | Reference for sysadmin authorization |

---

## Implementation Tasks

### Task 1: Create Route File Structure

Create `/src/app/api/admin/process-translations/route.ts` with:
- TypeScript strict mode
- Proper imports from job-queue module and auth-server
- Request/Response type definitions

**Acceptance Criteria:**
- [ ] File created at correct location
- [ ] TypeScript compiles without errors
- [ ] Imports resolve correctly

### Task 2: Implement Request Validation

Implement validation function for request body:

```typescript
interface ProcessTranslationsRequest {
  batchSize?: number;
}

function validateRequest(body: unknown): { valid: true; batchSize: number } | { valid: false; error: string } {
  // Default batch size
  let batchSize = 10;

  if (body && typeof body === 'object' && 'batchSize' in body) {
    const requestedSize = (body as { batchSize: unknown }).batchSize;

    if (typeof requestedSize !== 'number' || !Number.isInteger(requestedSize)) {
      return { valid: false, error: 'batchSize must be an integer' };
    }

    if (requestedSize < 1) {
      return { valid: false, error: 'batchSize must be a positive integer' };
    }

    // Cap at maximum of 50
    batchSize = Math.min(requestedSize, 50);
  }

  return { valid: true, batchSize };
}
```

**Acceptance Criteria:**
- [ ] Defaults to 10 when not provided
- [ ] Returns 400 for negative values
- [ ] Returns 400 for non-integer values
- [ ] Caps at 50 (doesn't reject values > 50)
- [ ] Accepts valid integer values 1-50

### Task 3: Implement Authentication Check

Following established patterns from existing admin routes:

```typescript
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Validate authentication
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    // Step 2: Check admin or sysadmin access
    if (!authResult.isAdmin && !authResult.isSysAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Admin access required',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    // ... rest of handler
  }
}
```

**Acceptance Criteria:**
- [ ] Returns 401/403 for unauthenticated requests
- [ ] Returns 403 for non-admin users
- [ ] Allows admin and sysadmin users
- [ ] Logs requesting user identity

### Task 4: Implement Stale Job Cleanup Integration

Call cleanup before processing:

```typescript
import { cleanupStaleProcessingJobs, CleanupResult } from '@/lib/job-queue/concurrency-control';

// Run cleanup first
const cleanupResult: CleanupResult = await cleanupStaleProcessingJobs();
```

**Acceptance Criteria:**
- [ ] Cleanup runs before job processing
- [ ] Cleanup result captured for statistics
- [ ] Cleanup errors don't block processing

### Task 5: Implement Batch Job Processing

Process jobs using existing TranslationJobProcessor infrastructure:

```typescript
import { getJobProcessor, JobProcessingResult } from '@/lib/job-queue/job-processor';

const processor = getJobProcessor();
const results: JobProcessingResult[] = [];
const startedAt = new Date().toISOString();

for (let i = 0; i < batchSize; i++) {
  const result = await processor.processNextJob();
  if (!result) {
    // No more jobs available
    break;
  }
  results.push(result);
}

const completedAt = new Date().toISOString();
```

**Acceptance Criteria:**
- [ ] Processes up to batchSize jobs
- [ ] Stops early if no more jobs available
- [ ] Continues processing even if individual jobs fail
- [ ] Respects existing concurrency controls

### Task 6: Implement Statistics Aggregation

Aggregate and return detailed statistics:

```typescript
interface ProcessingStatistics {
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  staleRecoveryCount: number;
  averageProcessingTimeMs: number;
  languagesProcessed: string[];
  entityTypeBreakdown: Record<string, number>;
  processingStartedAt: string;
  processingCompletedAt: string;
}

function aggregateStatistics(
  results: JobProcessingResult[],
  cleanupResult: CleanupResult,
  startedAt: string,
  completedAt: string
): ProcessingStatistics {
  const languagesSet = new Set<string>();
  const entityTypeCounts: Record<string, number> = {};
  let totalTimeMs = 0;

  for (const result of results) {
    languagesSet.add(result.targetLanguage);
    entityTypeCounts[result.entityType] = (entityTypeCounts[result.entityType] || 0) + 1;
    totalTimeMs += result.processingTimeMs;
  }

  return {
    totalProcessed: results.length,
    successCount: results.filter(r => r.success).length,
    failureCount: results.filter(r => !r.success).length,
    staleRecoveryCount: cleanupResult.jobsReset,
    averageProcessingTimeMs: results.length > 0 ? Math.round(totalTimeMs / results.length) : 0,
    languagesProcessed: Array.from(languagesSet),
    entityTypeBreakdown: entityTypeCounts,
    processingStartedAt: startedAt,
    processingCompletedAt: completedAt,
  };
}
```

**Acceptance Criteria:**
- [ ] Counts total processed, success, and failure
- [ ] Includes stale recovery count from cleanup
- [ ] Calculates average processing time
- [ ] Lists unique languages processed
- [ ] Breaks down by entity type
- [ ] Records start and end timestamps

### Task 7: Implement Response Structure

Return properly structured response:

```typescript
return NextResponse.json(
  {
    success: true,
    data: statistics,
    requestedBatchSize: batchSize,
    actualProcessed: results.length,
    message: results.length === 0
      ? 'No jobs available for processing'
      : `Processed ${results.length} translation jobs`
  },
  { status: 200 }
);
```

**Acceptance Criteria:**
- [ ] Returns 200 with statistics on success
- [ ] Includes clear message about processing result
- [ ] Handles zero jobs gracefully
- [ ] Returns consistent response structure

### Task 8: Implement Error Handling

Comprehensive error handling:

```typescript
catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error('[ProcessTranslations] Processing error:', errorMessage);

  return NextResponse.json(
    {
      success: false,
      error: 'Translation processing failed',
      details: errorMessage,
      code: 'PROCESSING_ERROR'
    },
    { status: 500 }
  );
}
```

**Acceptance Criteria:**
- [ ] Catches and logs all errors
- [ ] Returns 500 with error details
- [ ] Includes error code for client handling
- [ ] Never exposes internal stack traces

### Task 9: Add Audit Logging

Log all processing invocations:

```typescript
console.info('[ProcessTranslations] Processing requested', {
  requestedBy: authResult.user.id,
  userEmail: authResult.user.email,
  batchSize,
  isAdmin: authResult.isAdmin,
  isSysAdmin: authResult.isSysAdmin,
  timestamp: new Date().toISOString(),
});

// After processing
console.info('[ProcessTranslations] Processing completed', {
  requestedBy: authResult.user.id,
  totalProcessed: results.length,
  successCount: statistics.successCount,
  failureCount: statistics.failureCount,
  durationMs: Date.now() - startTime,
});
```

**Acceptance Criteria:**
- [ ] Logs user identity on request
- [ ] Logs processing completion with statistics
- [ ] Includes timestamps for audit trail
- [ ] Uses consistent log prefix

---

## Complete Code Structure

```typescript
// /src/app/api/admin/process-translations/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { cleanupStaleProcessingJobs, CleanupResult } from '@/lib/job-queue/concurrency-control';
import { getJobProcessor, JobProcessingResult } from '@/lib/job-queue/job-processor';

// === Types ===
interface ProcessTranslationsRequest {
  batchSize?: number;
}

interface ProcessingStatistics {
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  staleRecoveryCount: number;
  averageProcessingTimeMs: number;
  languagesProcessed: string[];
  entityTypeBreakdown: Record<string, number>;
  processingStartedAt: string;
  processingCompletedAt: string;
}

// === Constants ===
const DEFAULT_BATCH_SIZE = 10;
const MAX_BATCH_SIZE = 50;

// === Validation ===
function validateRequest(body: unknown): { valid: true; batchSize: number } | { valid: false; error: string } { ... }

// === Statistics Aggregation ===
function aggregateStatistics(...): ProcessingStatistics { ... }

// === POST Handler ===
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    // 1. Authentication
    // 2. Request validation
    // 3. Stale cleanup
    // 4. Batch processing
    // 5. Statistics aggregation
    // 6. Response
  } catch (error) {
    // Error handling
  }
}
```

---

## Dependencies

### Required (Must Exist Before Implementation)

| Dependency | Location | Status |
|------------|----------|--------|
| `validateAdminAuth` | `/src/lib/auth-server.ts` | Exists |
| `TranslationJobProcessor` | `/src/lib/job-queue/job-processor.ts` | Exists |
| `cleanupStaleProcessingJobs` | `/src/lib/job-queue/concurrency-control.ts` | Exists |
| `translation_jobs` table | Database | Exists (Epic 1) |

### Optional Enhancements (Future)

| Enhancement | Purpose |
|-------------|---------|
| Priority ordering | Jobs ordered by priority field (REQ-E03-018) |
| Concurrency limiting | API call throttling (REQ-E03-019) |
| Service role auth | Alternative to admin auth for automated triggers |

---

## Testing Requirements

### Unit Tests

1. **Validation Tests**
   - Test batchSize defaults to 10
   - Test batchSize capping at 50
   - Test invalid batchSize rejection

2. **Statistics Aggregation Tests**
   - Test empty results handling
   - Test average calculation
   - Test entity type breakdown
   - Test language deduplication

### Integration Tests

1. **Authentication Tests**
   - Test unauthorized request rejection
   - Test admin access allowed
   - Test sysadmin access allowed

2. **Processing Tests**
   - Test cleanup runs before processing
   - Test batch size is respected
   - Test continues on individual failures
   - Test empty queue handling

3. **Statistics Tests**
   - Test accurate success/failure counting
   - Test stale recovery counting
   - Test timing accuracy

---

## Acceptance Criteria Checklist

From REQ-E03-025:

- [ ] POST endpoint exists at specified administrative route
- [ ] Endpoint enforces authentication and verifies administrative or service role privileges
- [ ] Endpoint returns 403 error when called by users lacking administrative access
- [ ] Endpoint accepts optional JSON body with batchSize parameter
- [ ] Endpoint defaults batchSize to 10 when parameter is not provided
- [ ] Endpoint validates batchSize is a positive integer
- [ ] Endpoint caps batchSize at maximum value of 50
- [ ] Endpoint returns 400 error for invalid batchSize values (negative, non-numeric)
- [ ] Endpoint executes stale job cleanup routine before processing jobs
- [ ] Endpoint invokes job picker to retrieve up to batchSize queued jobs
- [ ] Job picker respects priority ordering (if REQ-E03-018 implemented)
- [ ] Endpoint processes each job using appropriate content-specific handler
- [ ] Endpoint respects concurrency limits (if REQ-E03-019 implemented)
- [ ] Endpoint continues processing remaining jobs even when individual jobs fail
- [ ] Endpoint tracks processing start and end timestamps
- [ ] Endpoint tracks count of successful job completions
- [ ] Endpoint tracks count of failed job attempts
- [ ] Endpoint tracks count of stale jobs recovered during cleanup
- [ ] Endpoint calculates average processing duration per job
- [ ] Endpoint aggregates processed language codes
- [ ] Endpoint aggregates job counts by entity type
- [ ] Endpoint returns 200 status with statistics payload on completion
- [ ] Response payload includes all required statistics fields
- [ ] Endpoint completes synchronously before returning response
- [ ] Endpoint handles database errors gracefully with 500 status
- [ ] Endpoint logs invocation details including requesting user for audit trail
- [ ] Endpoint execution completes within reasonable time (under 30 seconds for batch size of 10)
- [ ] TypeScript types are defined for request body, response payload, and error responses

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Long execution time | Medium | Medium | Timeout handling, max batch size cap |
| Concurrent invocations | Low | Low | Processing is idempotent, jobs lock properly |
| Job processor not initialized | Low | High | Use getJobProcessor() singleton pattern |
| Cleanup blocks processing | Low | Medium | Cleanup has timeout, errors don't block |

---

## Notes

- This endpoint is intended for administrative/operational use, not for regular API consumers
- The synchronous processing model is intentional for immediate feedback on results
- For high-volume environments, consider implementing async processing with webhook callbacks
- The endpoint can be used as the trigger for Railway cron jobs (Task 5.2 in implementation plan)
- Service role authentication can be added as an alternative for automated triggers

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation*
