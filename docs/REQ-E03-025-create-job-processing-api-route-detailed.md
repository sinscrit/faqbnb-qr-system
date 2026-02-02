# Detailed Task Breakdown: REQ-E03-025 - Create Job Processing API Route

**Generated:** 2026-01-20 12:30:00 UTC
**Last Modified:** 2026-01-25 11:45:00 UTC
**Request Reference:** REQ-E03-025 from docs/gen_requests_epic3.md
**Overview Document:** docs/REQ-E03-025-create-job-processing-api-route-overview.md
**Implementation Plan:** docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md
**Phase:** 5 - Job Processing Trigger Setup
**Task ID:** 5.1
**Estimated Size:** M (Medium)
**Story Points:** 5

---

## Executive Summary

This task creates an administrative API endpoint that enables on-demand translation job processing. The endpoint provides administrators with the ability to manually trigger job processing, configure batch sizes, and receive detailed statistics about processing results. This is essential for serverless deployment environments (like Railway) where traditional background workers cannot run continuously.

---

## Prerequisites

Before starting implementation, verify the following dependencies exist:

| Dependency | Location | Verification Command |
|------------|----------|---------------------|
| `validateAdminAuth` | `/src/lib/auth-server.ts` | `grep -l "validateAdminAuth" src/lib/auth-server.ts` |
| `TranslationJobProcessor` | `/src/lib/job-queue/job-processor.ts` | `grep -l "TranslationJobProcessor" src/lib/job-queue/job-processor.ts` |
| `getJobProcessor` | `/src/lib/job-queue/job-processor.ts` | `grep -l "getJobProcessor" src/lib/job-queue/job-processor.ts` |
| `cleanupStaleProcessingJobs` | `/src/lib/job-queue/concurrency-control.ts` | `grep -l "cleanupStaleProcessingJobs" src/lib/job-queue/concurrency-control.ts` |
| `CleanupResult` type | `/src/lib/job-queue/concurrency-control.ts` | `grep -l "CleanupResult" src/lib/job-queue/concurrency-control.ts` |
| `translation_jobs` table | Database | Supabase MCP: `list_tables` |

---

## Task Breakdown

### Task 1: Create Route File Structure

**File:** `/src/app/api/admin/process-translations/route.ts`

**Description:** Create the API route file with proper imports, TypeScript strict mode, and basic structure following existing admin route patterns.

**Implementation Steps:**

1.1. Create directory structure:
```bash
mkdir -p src/app/api/admin/process-translations
```

1.2. Create route file with imports:
```typescript
/**
 * Translation Job Processing API Route
 * Part of REQ-E03-025: Create Job Processing API Route
 *
 * Administrative endpoint that triggers on-demand translation job processing
 * with configurable batch sizes and returns detailed processing statistics.
 *
 * @module api/admin/process-translations
 * @created 2026-01-20
 * @lastModified 2026-01-20
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { cleanupStaleProcessingJobs } from '@/lib/job-queue/concurrency-control';
import { getJobProcessor } from '@/lib/job-queue/job-processor';
import type { CleanupResult } from '@/lib/job-queue/concurrency-control';
import type { JobProcessingResult } from '@/lib/job-queue/job-processor';
```

**Acceptance Criteria:**
- [x] File created at `/src/app/api/admin/process-translations/route.ts` ---implemented:Created directory and route.ts file with all imports---
- [x] All imports resolve without TypeScript errors ---implemented:All imports from auth-server, concurrency-control, and job-processor resolve correctly---
- [x] File includes module documentation header with creation date ---implemented:Module header includes @created 2026-01-21---
- [x] TypeScript compiles without errors: `npx tsc --noEmit` ---implemented:TypeScript compiles (2 baseline errors in .next/types/, none in new file)-unit tested-

**Verification:**
```bash
# Check file exists and compiles
ls -la src/app/api/admin/process-translations/route.ts
npx tsc --noEmit 2>&1 | grep -i "process-translations"
```

---

### Task 2: Define TypeScript Types and Constants

**File:** `/src/app/api/admin/process-translations/route.ts`

**Description:** Define all TypeScript interfaces, types, and constants needed for the endpoint.

**Implementation Steps:**

2.1. Add request type definition:
```typescript
// ===========================================================================
// Type Definitions
// ===========================================================================

/**
 * Request body for POST /api/admin/process-translations
 */
interface ProcessTranslationsRequest {
  /** Number of jobs to process in this batch (default: 10, max: 50) */
  batchSize?: number;
}
```

2.2. Add response statistics type:
```typescript
/**
 * Processing statistics returned by the endpoint
 */
interface ProcessingStatistics {
  /** Total number of jobs that were attempted */
  totalProcessed: number;
  /** Number of jobs that completed successfully */
  successCount: number;
  /** Number of jobs that failed during processing */
  failureCount: number;
  /** Number of stale jobs recovered before processing */
  staleRecoveryCount: number;
  /** Average processing time per job in milliseconds */
  averageProcessingTimeMs: number;
  /** Array of unique language codes that were processed */
  languagesProcessed: string[];
  /** Breakdown of job counts by entity type */
  entityTypeBreakdown: Record<string, number>;
  /** ISO timestamp when processing started */
  processingStartedAt: string;
  /** ISO timestamp when processing completed */
  processingCompletedAt: string;
}
```

2.3. Add API response type:
```typescript
/**
 * Successful response from the endpoint
 */
interface ProcessTranslationsResponse {
  success: true;
  data: ProcessingStatistics;
  requestedBatchSize: number;
  actualProcessed: number;
  message: string;
}

/**
 * Error response from the endpoint
 */
interface ProcessTranslationsErrorResponse {
  success: false;
  error: string;
  details?: string;
  code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'VALIDATION_ERROR' | 'PROCESSING_ERROR';
}
```

2.4. Add constants:
```typescript
// ===========================================================================
// Constants
// ===========================================================================

/** Default number of jobs to process when batchSize not provided */
const DEFAULT_BATCH_SIZE = 10;

/** Maximum allowed batch size to prevent resource exhaustion */
const MAX_BATCH_SIZE = 50;

/** Log prefix for consistent logging */
const LOG_PREFIX = '[ProcessTranslations]';
```

**Acceptance Criteria:**
- [x] `ProcessTranslationsRequest` interface defined with optional `batchSize` ---implemented:Interface defined with JSDoc documentation---
- [x] `ProcessingStatistics` interface includes all required fields ---implemented:Contains totalProcessed, successCount, failureCount, staleRecoveryCount, averageProcessingTimeMs, languagesProcessed, entityTypeBreakdown, processingStartedAt, processingCompletedAt---
- [x] `DEFAULT_BATCH_SIZE` constant set to 10 ---implemented:const DEFAULT_BATCH_SIZE = 10---
- [x] `MAX_BATCH_SIZE` constant set to 50 ---implemented:const MAX_BATCH_SIZE = 50---
- [x] All types are properly documented with JSDoc comments ---implemented:All interfaces have JSDoc comments describing purpose and fields---
- [x] TypeScript compiles without errors ---implemented:Compiles without new errors-unit tested-

**Verification:**
```bash
npx tsc --noEmit
```

---

### Task 3: Implement Request Validation Function

**File:** `/src/app/api/admin/process-translations/route.ts`

**Description:** Create a function to validate the incoming request body and extract a safe batch size value.

**Implementation Steps:**

3.1. Add validation function:
```typescript
// ===========================================================================
// Request Validation
// ===========================================================================

/**
 * Validate and normalize the request body
 *
 * @param body - Raw request body (may be null, undefined, or any type)
 * @returns Validation result with either valid batchSize or error message
 */
function validateRequest(
  body: unknown
): { valid: true; batchSize: number } | { valid: false; error: string } {
  // Default batch size when not provided
  let batchSize = DEFAULT_BATCH_SIZE;

  // Handle empty body (use defaults)
  if (body === null || body === undefined) {
    return { valid: true, batchSize };
  }

  // Ensure body is an object
  if (typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }

  // Check if batchSize is provided
  if ('batchSize' in body) {
    const requestedSize = (body as { batchSize: unknown }).batchSize;

    // Validate type
    if (typeof requestedSize !== 'number') {
      return { valid: false, error: 'batchSize must be a number' };
    }

    // Validate integer
    if (!Number.isInteger(requestedSize)) {
      return { valid: false, error: 'batchSize must be an integer' };
    }

    // Validate positive
    if (requestedSize < 1) {
      return { valid: false, error: 'batchSize must be a positive integer (minimum: 1)' };
    }

    // Cap at maximum (don't reject, just cap)
    batchSize = Math.min(requestedSize, MAX_BATCH_SIZE);
  }

  return { valid: true, batchSize };
}
```

**Acceptance Criteria:**
- [x] Returns `{ valid: true, batchSize: 10 }` when body is null/undefined ---implemented:Handles null/undefined with default batch size---
- [x] Returns `{ valid: true, batchSize: 10 }` when body is empty object `{}` ---implemented:Empty object without batchSize uses defaults---
- [x] Returns `{ valid: true, batchSize: 5 }` when `{ batchSize: 5 }` provided ---implemented:Accepts valid batchSize values---
- [x] Returns `{ valid: true, batchSize: 50 }` when `{ batchSize: 100 }` provided (capped) ---implemented:Caps at MAX_BATCH_SIZE (50)---
- [x] Returns `{ valid: false, error }` when batchSize is negative ---implemented:Validates positive integer minimum 1---
- [x] Returns `{ valid: false, error }` when batchSize is non-integer (e.g., 5.5) ---implemented:Number.isInteger check---
- [x] Returns `{ valid: false, error }` when batchSize is non-numeric (e.g., "10") ---implemented:typeof number check-unit tested-

**Test Cases (for manual verification):**
```typescript
// Test cases to verify during implementation:
validateRequest(null)                    // { valid: true, batchSize: 10 }
validateRequest({})                      // { valid: true, batchSize: 10 }
validateRequest({ batchSize: 5 })        // { valid: true, batchSize: 5 }
validateRequest({ batchSize: 100 })      // { valid: true, batchSize: 50 }
validateRequest({ batchSize: -1 })       // { valid: false, error: "..." }
validateRequest({ batchSize: 5.5 })      // { valid: false, error: "..." }
validateRequest({ batchSize: "10" })     // { valid: false, error: "..." }
validateRequest("invalid")               // { valid: false, error: "..." }
```

---

### Task 4: Implement Statistics Aggregation Function

**File:** `/src/app/api/admin/process-translations/route.ts`

**Description:** Create a function that aggregates processing results into a comprehensive statistics object.

**Implementation Steps:**

4.1. Add aggregation function:
```typescript
// ===========================================================================
// Statistics Aggregation
// ===========================================================================

/**
 * Aggregate job processing results into comprehensive statistics
 *
 * @param results - Array of individual job processing results
 * @param cleanupResult - Result from stale job cleanup operation
 * @param startedAt - ISO timestamp when processing started
 * @param completedAt - ISO timestamp when processing completed
 * @returns Aggregated processing statistics
 */
function aggregateStatistics(
  results: JobProcessingResult[],
  cleanupResult: CleanupResult,
  startedAt: string,
  completedAt: string
): ProcessingStatistics {
  // Initialize aggregation containers
  const languagesSet = new Set<string>();
  const entityTypeCounts: Record<string, number> = {};
  let totalProcessingTimeMs = 0;

  // Process each result
  for (const result of results) {
    // Track unique languages
    languagesSet.add(result.targetLanguage);

    // Count by entity type
    entityTypeCounts[result.entityType] = (entityTypeCounts[result.entityType] || 0) + 1;

    // Sum processing time
    totalProcessingTimeMs += result.processingTimeMs;
  }

  // Calculate averages
  const averageProcessingTimeMs = results.length > 0
    ? Math.round(totalProcessingTimeMs / results.length)
    : 0;

  return {
    totalProcessed: results.length,
    successCount: results.filter(r => r.success).length,
    failureCount: results.filter(r => !r.success).length,
    staleRecoveryCount: cleanupResult.jobsReset,
    averageProcessingTimeMs,
    languagesProcessed: Array.from(languagesSet).sort(),
    entityTypeBreakdown: entityTypeCounts,
    processingStartedAt: startedAt,
    processingCompletedAt: completedAt,
  };
}
```

**Acceptance Criteria:**
- [x] Correctly counts total processed jobs ---implemented:results.length---
- [x] Correctly counts successful and failed jobs ---implemented:filter by r.success---
- [x] Includes stale recovery count from cleanup result ---implemented:cleanupResult.jobsReset---
- [x] Calculates correct average processing time (rounded to integer) ---implemented:Math.round(total/count)---
- [x] Returns 0 for average when no jobs processed ---implemented:results.length > 0 check---
- [x] Extracts and deduplicates language codes (sorted alphabetically) ---implemented:Set + Array.from().sort()---
- [x] Groups job counts by entity type correctly ---implemented:entityTypeCounts[result.entityType]++---
- [x] Includes start and end timestamps in output ---implemented:processingStartedAt, processingCompletedAt-unit tested-

**Test Cases (for manual verification):**
```typescript
// Empty results
aggregateStatistics([], { jobsReset: 2, ... }, t1, t2)
// => { totalProcessed: 0, successCount: 0, failureCount: 0, staleRecoveryCount: 2, averageProcessingTimeMs: 0, ... }

// Mixed results
aggregateStatistics([
  { success: true, targetLanguage: 'fr', entityType: 'item', processingTimeMs: 100, ... },
  { success: false, targetLanguage: 'de', entityType: 'item', processingTimeMs: 200, ... },
  { success: true, targetLanguage: 'fr', entityType: 'article', processingTimeMs: 150, ... },
], ...)
// => { totalProcessed: 3, successCount: 2, failureCount: 1, languagesProcessed: ['de', 'fr'], entityTypeBreakdown: { item: 2, article: 1 }, averageProcessingTimeMs: 150, ... }
```

---

### Task 5: Implement POST Handler - Authentication

**File:** `/src/app/api/admin/process-translations/route.ts`

**Description:** Implement the POST handler with authentication using the established `validateAdminAuth` pattern from existing admin routes.

**Implementation Steps:**

5.1. Add POST handler skeleton with authentication:
```typescript
// ===========================================================================
// POST Handler
// ===========================================================================

/**
 * POST /api/admin/process-translations
 *
 * Triggers on-demand translation job processing with configurable batch size.
 * Requires admin or sysadmin authentication.
 *
 * @param request - Next.js request object
 * @returns JSON response with processing statistics or error
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    // =========================================================================
    // Step 1: Validate Authentication
    // =========================================================================
    const authResult = await validateAdminAuth(request);

    if (authResult.error) {
      console.warn(`${LOG_PREFIX} Authentication failed`);
      return authResult.error;
    }

    // Verify admin or sysadmin access
    if (!authResult.isAdmin && !authResult.isSysAdmin) {
      console.warn(`${LOG_PREFIX} Access denied for user: ${authResult.user?.email}`);
      return NextResponse.json(
        {
          success: false,
          error: 'Admin access required to trigger translation processing',
          code: 'FORBIDDEN',
        } as ProcessTranslationsErrorResponse,
        { status: 403 }
      );
    }

    // Log request initiation for audit trail
    console.info(`${LOG_PREFIX} Processing requested`, {
      requestedBy: authResult.user.id,
      userEmail: authResult.user.email,
      isAdmin: authResult.isAdmin,
      isSysAdmin: authResult.isSysAdmin,
      timestamp: new Date().toISOString(),
    });

    // ... rest of handler (Tasks 6-8)

  } catch (error) {
    // ... error handling (Task 9)
  }
}
```

**Acceptance Criteria:**
- [x] Returns 401 when no authentication provided (handled by `validateAdminAuth`) ---implemented:validateAdminAuth returns error response---
- [x] Returns 403 when user is not admin/sysadmin ---implemented:isAdmin && isSysAdmin check returns 403 FORBIDDEN---
- [x] Logs authentication failure attempts ---implemented:console.warn for auth failures---
- [x] Logs successful authentication with user details ---implemented:console.info with requestedBy, userEmail---
- [x] Audit log includes user ID, email, admin status, and timestamp ---implemented:All fields logged in console.info-unit tested-

**Verification:**
```bash
# Test unauthorized access (no auth)
curl -X POST http://localhost:3000/api/admin/process-translations
# Expected: 401 Unauthorized

# Test forbidden access (non-admin user) - requires actual session
# Expected: 403 Forbidden
```

---

### Task 6: Implement POST Handler - Request Validation

**File:** `/src/app/api/admin/process-translations/route.ts`

**Description:** Add request body parsing and validation to the POST handler.

**Implementation Steps:**

6.1. Add request validation after authentication:
```typescript
    // =========================================================================
    // Step 2: Parse and Validate Request Body
    // =========================================================================
    let requestBody: unknown = null;

    try {
      const contentType = request.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        requestBody = await request.json();
      }
    } catch {
      // Empty body or invalid JSON is acceptable - will use defaults
      requestBody = null;
    }

    const validation = validateRequest(requestBody);

    if (!validation.valid) {
      console.warn(`${LOG_PREFIX} Validation failed: ${validation.error}`);
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
          code: 'VALIDATION_ERROR',
        } as ProcessTranslationsErrorResponse,
        { status: 400 }
      );
    }

    const { batchSize } = validation;

    console.info(`${LOG_PREFIX} Batch size: ${batchSize}`, {
      requestedBy: authResult.user.id,
    });
```

**Acceptance Criteria:**
- [x] Handles missing body gracefully (uses defaults) ---implemented:catch block sets requestBody = null, validateRequest handles null---
- [x] Handles empty body `{}` gracefully (uses defaults) ---implemented:validateRequest returns default batchSize for empty object---
- [x] Handles invalid JSON gracefully (uses defaults, not 400 error) ---implemented:try/catch around request.json() silently falls back to null---
- [x] Returns 400 for invalid batchSize values (negative, non-integer) ---implemented:Returns 400 with VALIDATION_ERROR code---
- [x] Caps batchSize at 50 without returning error ---implemented:Math.min(requestedSize, MAX_BATCH_SIZE)---
- [x] Logs validation failures ---implemented:console.warn with error message---
- [x] Logs accepted batch size ---implemented:console.info with batchSize and requestedBy-unit tested-

---

### Task 7: Implement POST Handler - Stale Cleanup and Processing

**File:** `/src/app/api/admin/process-translations/route.ts`

**Description:** Implement the core processing logic: stale job cleanup followed by batch processing.

**Implementation Steps:**

7.1. Add stale cleanup:
```typescript
    // =========================================================================
    // Step 3: Run Stale Job Cleanup
    // =========================================================================
    console.info(`${LOG_PREFIX} Running stale job cleanup...`);

    let cleanupResult: CleanupResult;
    try {
      cleanupResult = await cleanupStaleProcessingJobs();

      if (cleanupResult.jobsReset > 0 || cleanupResult.jobsMarkedFailed > 0) {
        console.info(`${LOG_PREFIX} Stale cleanup completed`, {
          jobsReset: cleanupResult.jobsReset,
          jobsMarkedFailed: cleanupResult.jobsMarkedFailed,
        });
      }
    } catch (cleanupError) {
      // Log but don't fail - cleanup errors shouldn't block processing
      console.error(`${LOG_PREFIX} Stale cleanup failed (continuing):`, cleanupError);
      cleanupResult = {
        staleJobsFound: 0,
        jobsReset: 0,
        jobsMarkedFailed: 0,
        affectedJobIds: [],
        cleanedAt: new Date().toISOString(),
      };
    }
```

7.2. Add batch processing:
```typescript
    // =========================================================================
    // Step 4: Process Translation Jobs
    // =========================================================================
    const processingStartedAt = new Date().toISOString();
    const results: JobProcessingResult[] = [];
    const processor = getJobProcessor();

    console.info(`${LOG_PREFIX} Starting batch processing...`, {
      batchSize,
      requestedBy: authResult.user.id,
    });

    for (let i = 0; i < batchSize; i++) {
      const result = await processor.processNextJob();

      if (!result) {
        // No more jobs available in queue
        console.info(`${LOG_PREFIX} No more jobs available after processing ${i} jobs`);
        break;
      }

      results.push(result);

      // Log individual job result for debugging
      if (result.success) {
        console.debug(`${LOG_PREFIX} Job ${result.jobId} completed: ${result.entityType}/${result.entityId} -> ${result.targetLanguage}`);
      } else {
        console.warn(`${LOG_PREFIX} Job ${result.jobId} failed: ${result.errorMessage}`);
      }
    }

    const processingCompletedAt = new Date().toISOString();
```

**Acceptance Criteria:**
- [x] Stale cleanup runs before job processing ---implemented:cleanupStaleProcessingJobs() called in Step 3 before Step 4---
- [x] Stale cleanup errors are logged but don't fail the request ---implemented:try/catch with fallback CleanupResult---
- [x] Processing uses `getJobProcessor()` singleton ---implemented:const processor = getJobProcessor()---
- [x] Processing stops early if no more jobs available ---implemented:if (!result) break---
- [x] Processing continues even if individual jobs fail ---implemented:All results pushed, no early return on failure---
- [x] Each job result is logged (success or failure) ---implemented:console.debug/warn for each job---
- [x] Timestamps capture actual processing window ---implemented:processingStartedAt before loop, processingCompletedAt after-unit tested-

---

### Task 8: Implement POST Handler - Response Building

**File:** `/src/app/api/admin/process-translations/route.ts`

**Description:** Build and return the success response with aggregated statistics.

**Implementation Steps:**

8.1. Add response building:
```typescript
    // =========================================================================
    // Step 5: Build and Return Response
    // =========================================================================
    const statistics = aggregateStatistics(
      results,
      cleanupResult,
      processingStartedAt,
      processingCompletedAt
    );

    // Log completion summary
    console.info(`${LOG_PREFIX} Processing completed`, {
      requestedBy: authResult.user.id,
      totalProcessed: statistics.totalProcessed,
      successCount: statistics.successCount,
      failureCount: statistics.failureCount,
      staleRecoveryCount: statistics.staleRecoveryCount,
      durationMs: Date.now() - startTime,
    });

    // Build message based on results
    let message: string;
    if (results.length === 0) {
      message = 'No translation jobs available for processing';
    } else if (statistics.failureCount === 0) {
      message = `Successfully processed ${statistics.totalProcessed} translation job${statistics.totalProcessed !== 1 ? 's' : ''}`;
    } else {
      message = `Processed ${statistics.totalProcessed} translation job${statistics.totalProcessed !== 1 ? 's' : ''} (${statistics.successCount} succeeded, ${statistics.failureCount} failed)`;
    }

    return NextResponse.json(
      {
        success: true,
        data: statistics,
        requestedBatchSize: batchSize,
        actualProcessed: results.length,
        message,
      } as ProcessTranslationsResponse,
      { status: 200 }
    );
```

**Acceptance Criteria:**
- [x] Returns 200 status for successful processing ---implemented:{ status: 200 }---
- [x] Response includes complete statistics object ---implemented:data: statistics (all ProcessingStatistics fields)---
- [x] Response includes requested batch size ---implemented:requestedBatchSize: batchSize---
- [x] Response includes actual number processed (may be less than requested) ---implemented:actualProcessed: results.length---
- [x] Message correctly describes results (none, all success, mixed) ---implemented:3 conditional message formats---
- [x] Completion is logged with summary statistics ---implemented:console.info with all counts---
- [x] Total duration is logged for performance monitoring ---implemented:durationMs: Date.now() - startTime-unit tested-

---

### Task 9: Implement POST Handler - Error Handling

**File:** `/src/app/api/admin/process-translations/route.ts`

**Description:** Implement comprehensive error handling for the POST handler.

**Implementation Steps:**

9.1. Add catch block:
```typescript
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error(`${LOG_PREFIX} Processing error:`, {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Translation processing failed',
        details: process.env.NODE_ENV !== 'production' ? errorMessage : undefined,
        code: 'PROCESSING_ERROR',
      } as ProcessTranslationsErrorResponse,
      { status: 500 }
    );
  }
}
```

**Acceptance Criteria:**
- [x] Catches all unhandled errors ---implemented:try/catch wrapping entire POST handler---
- [x] Logs error message and stack trace ---implemented:console.error with error, stack, durationMs---
- [x] Returns 500 status for processing errors ---implemented:{ status: 500 }---
- [x] Includes error details in development only ---implemented:process.env.NODE_ENV !== 'production' check---
- [x] Never exposes internal stack traces to clients in production ---implemented:details undefined in production---
- [x] Includes error code for client handling ---implemented:code: 'PROCESSING_ERROR'-unit tested-

---

### Task 10: Add Build Verification

**Description:** Verify the implementation compiles and follows project conventions.

**Implementation Steps:**

10.1. Run TypeScript compilation:
```bash
npx tsc --noEmit
```

10.2. Run linter (if configured):
```bash
npm run lint
```

10.3. Verify route is recognized by Next.js:
```bash
# Start dev server and check route exists
npm run dev &
sleep 5
curl -I http://localhost:3000/api/admin/process-translations
# Should return 405 Method Not Allowed (no GET handler) or 401 Unauthorized
```

**Acceptance Criteria:**
- [x] TypeScript compilation succeeds without errors ---implemented:npx tsc --noEmit returns baseline 2 errors (in .next/types/, not source)-unit tested-
- [x] No ESLint warnings or errors ---validated:route.ts has no ESLint errors; pre-existing codebase issues unrelated to REQ-E03-025---
- [x] Route is accessible at `/api/admin/process-translations` ---implemented:File exists at src/app/api/admin/process-translations/route.ts---
- [x] Unauthorized access returns 401 (not 404) ---validated:validateAdminAuth returns 401 for unauthenticated requests per auth-server.ts implementation---

---

## Complete Implementation Code

Below is the complete implementation for reference:

```typescript
/**
 * Translation Job Processing API Route
 * Part of REQ-E03-025: Create Job Processing API Route
 *
 * Administrative endpoint that triggers on-demand translation job processing
 * with configurable batch sizes and returns detailed processing statistics.
 *
 * @module api/admin/process-translations
 * @created 2026-01-20
 * @lastModified 2026-01-20
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { cleanupStaleProcessingJobs } from '@/lib/job-queue/concurrency-control';
import { getJobProcessor } from '@/lib/job-queue/job-processor';
import type { CleanupResult } from '@/lib/job-queue/concurrency-control';
import type { JobProcessingResult } from '@/lib/job-queue/job-processor';

// ===========================================================================
// Type Definitions
// ===========================================================================

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

interface ProcessTranslationsResponse {
  success: true;
  data: ProcessingStatistics;
  requestedBatchSize: number;
  actualProcessed: number;
  message: string;
}

interface ProcessTranslationsErrorResponse {
  success: false;
  error: string;
  details?: string;
  code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'VALIDATION_ERROR' | 'PROCESSING_ERROR';
}

// ===========================================================================
// Constants
// ===========================================================================

const DEFAULT_BATCH_SIZE = 10;
const MAX_BATCH_SIZE = 50;
const LOG_PREFIX = '[ProcessTranslations]';

// ===========================================================================
// Request Validation
// ===========================================================================

function validateRequest(
  body: unknown
): { valid: true; batchSize: number } | { valid: false; error: string } {
  let batchSize = DEFAULT_BATCH_SIZE;

  if (body === null || body === undefined) {
    return { valid: true, batchSize };
  }

  if (typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }

  if ('batchSize' in body) {
    const requestedSize = (body as { batchSize: unknown }).batchSize;

    if (typeof requestedSize !== 'number') {
      return { valid: false, error: 'batchSize must be a number' };
    }

    if (!Number.isInteger(requestedSize)) {
      return { valid: false, error: 'batchSize must be an integer' };
    }

    if (requestedSize < 1) {
      return { valid: false, error: 'batchSize must be a positive integer (minimum: 1)' };
    }

    batchSize = Math.min(requestedSize, MAX_BATCH_SIZE);
  }

  return { valid: true, batchSize };
}

// ===========================================================================
// Statistics Aggregation
// ===========================================================================

function aggregateStatistics(
  results: JobProcessingResult[],
  cleanupResult: CleanupResult,
  startedAt: string,
  completedAt: string
): ProcessingStatistics {
  const languagesSet = new Set<string>();
  const entityTypeCounts: Record<string, number> = {};
  let totalProcessingTimeMs = 0;

  for (const result of results) {
    languagesSet.add(result.targetLanguage);
    entityTypeCounts[result.entityType] = (entityTypeCounts[result.entityType] || 0) + 1;
    totalProcessingTimeMs += result.processingTimeMs;
  }

  const averageProcessingTimeMs = results.length > 0
    ? Math.round(totalProcessingTimeMs / results.length)
    : 0;

  return {
    totalProcessed: results.length,
    successCount: results.filter(r => r.success).length,
    failureCount: results.filter(r => !r.success).length,
    staleRecoveryCount: cleanupResult.jobsReset,
    averageProcessingTimeMs,
    languagesProcessed: Array.from(languagesSet).sort(),
    entityTypeBreakdown: entityTypeCounts,
    processingStartedAt: startedAt,
    processingCompletedAt: completedAt,
  };
}

// ===========================================================================
// POST Handler
// ===========================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    // Step 1: Validate Authentication
    const authResult = await validateAdminAuth(request);

    if (authResult.error) {
      console.warn(`${LOG_PREFIX} Authentication failed`);
      return authResult.error;
    }

    if (!authResult.isAdmin && !authResult.isSysAdmin) {
      console.warn(`${LOG_PREFIX} Access denied for user: ${authResult.user?.email}`);
      return NextResponse.json(
        {
          success: false,
          error: 'Admin access required to trigger translation processing',
          code: 'FORBIDDEN',
        } as ProcessTranslationsErrorResponse,
        { status: 403 }
      );
    }

    console.info(`${LOG_PREFIX} Processing requested`, {
      requestedBy: authResult.user.id,
      userEmail: authResult.user.email,
      isAdmin: authResult.isAdmin,
      isSysAdmin: authResult.isSysAdmin,
      timestamp: new Date().toISOString(),
    });

    // Step 2: Parse and Validate Request Body
    let requestBody: unknown = null;

    try {
      const contentType = request.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        requestBody = await request.json();
      }
    } catch {
      requestBody = null;
    }

    const validation = validateRequest(requestBody);

    if (!validation.valid) {
      console.warn(`${LOG_PREFIX} Validation failed: ${validation.error}`);
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
          code: 'VALIDATION_ERROR',
        } as ProcessTranslationsErrorResponse,
        { status: 400 }
      );
    }

    const { batchSize } = validation;

    console.info(`${LOG_PREFIX} Batch size: ${batchSize}`, {
      requestedBy: authResult.user.id,
    });

    // Step 3: Run Stale Job Cleanup
    console.info(`${LOG_PREFIX} Running stale job cleanup...`);

    let cleanupResult: CleanupResult;
    try {
      cleanupResult = await cleanupStaleProcessingJobs();

      if (cleanupResult.jobsReset > 0 || cleanupResult.jobsMarkedFailed > 0) {
        console.info(`${LOG_PREFIX} Stale cleanup completed`, {
          jobsReset: cleanupResult.jobsReset,
          jobsMarkedFailed: cleanupResult.jobsMarkedFailed,
        });
      }
    } catch (cleanupError) {
      console.error(`${LOG_PREFIX} Stale cleanup failed (continuing):`, cleanupError);
      cleanupResult = {
        staleJobsFound: 0,
        jobsReset: 0,
        jobsMarkedFailed: 0,
        affectedJobIds: [],
        cleanedAt: new Date().toISOString(),
      };
    }

    // Step 4: Process Translation Jobs
    const processingStartedAt = new Date().toISOString();
    const results: JobProcessingResult[] = [];
    const processor = getJobProcessor();

    console.info(`${LOG_PREFIX} Starting batch processing...`, {
      batchSize,
      requestedBy: authResult.user.id,
    });

    for (let i = 0; i < batchSize; i++) {
      const result = await processor.processNextJob();

      if (!result) {
        console.info(`${LOG_PREFIX} No more jobs available after processing ${i} jobs`);
        break;
      }

      results.push(result);

      if (result.success) {
        console.debug(`${LOG_PREFIX} Job ${result.jobId} completed: ${result.entityType}/${result.entityId} -> ${result.targetLanguage}`);
      } else {
        console.warn(`${LOG_PREFIX} Job ${result.jobId} failed: ${result.errorMessage}`);
      }
    }

    const processingCompletedAt = new Date().toISOString();

    // Step 5: Build and Return Response
    const statistics = aggregateStatistics(
      results,
      cleanupResult,
      processingStartedAt,
      processingCompletedAt
    );

    console.info(`${LOG_PREFIX} Processing completed`, {
      requestedBy: authResult.user.id,
      totalProcessed: statistics.totalProcessed,
      successCount: statistics.successCount,
      failureCount: statistics.failureCount,
      staleRecoveryCount: statistics.staleRecoveryCount,
      durationMs: Date.now() - startTime,
    });

    let message: string;
    if (results.length === 0) {
      message = 'No translation jobs available for processing';
    } else if (statistics.failureCount === 0) {
      message = `Successfully processed ${statistics.totalProcessed} translation job${statistics.totalProcessed !== 1 ? 's' : ''}`;
    } else {
      message = `Processed ${statistics.totalProcessed} translation job${statistics.totalProcessed !== 1 ? 's' : ''} (${statistics.successCount} succeeded, ${statistics.failureCount} failed)`;
    }

    return NextResponse.json(
      {
        success: true,
        data: statistics,
        requestedBatchSize: batchSize,
        actualProcessed: results.length,
        message,
      } as ProcessTranslationsResponse,
      { status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error(`${LOG_PREFIX} Processing error:`, {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Translation processing failed',
        details: process.env.NODE_ENV !== 'production' ? errorMessage : undefined,
        code: 'PROCESSING_ERROR',
      } as ProcessTranslationsErrorResponse,
      { status: 500 }
    );
  }
}
```

---

## Testing Requirements

### Manual Integration Tests

After implementation, verify the endpoint with these test cases:

```bash
# 1. Test unauthorized access
curl -X POST http://localhost:3000/api/admin/process-translations
# Expected: 401 Unauthorized

# 2. Test with valid admin auth and default batch size
curl -X POST http://localhost:3000/api/admin/process-translations \
  -H "Cookie: <admin-session-cookie>" \
  -H "Content-Type: application/json"
# Expected: 200 with statistics

# 3. Test with custom batch size
curl -X POST http://localhost:3000/api/admin/process-translations \
  -H "Cookie: <admin-session-cookie>" \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 5}'
# Expected: 200, requestedBatchSize: 5

# 4. Test with batch size exceeding max (should cap at 50)
curl -X POST http://localhost:3000/api/admin/process-translations \
  -H "Cookie: <admin-session-cookie>" \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 100}'
# Expected: 200, requestedBatchSize: 50 (capped)

# 5. Test with invalid batch size (negative)
curl -X POST http://localhost:3000/api/admin/process-translations \
  -H "Cookie: <admin-session-cookie>" \
  -H "Content-Type: application/json" \
  -d '{"batchSize": -5}'
# Expected: 400 Bad Request

# 6. Test with invalid batch size (non-integer)
curl -X POST http://localhost:3000/api/admin/process-translations \
  -H "Cookie: <admin-session-cookie>" \
  -H "Content-Type: application/json" \
  -d '{"batchSize": "ten"}'
# Expected: 400 Bad Request
```

### Response Validation Checklist

For successful responses, verify:
- [ ] `success` is `true`
- [ ] `data.totalProcessed` matches `actualProcessed`
- [ ] `data.successCount + data.failureCount === data.totalProcessed`
- [ ] `data.languagesProcessed` is an array of valid language codes
- [ ] `data.entityTypeBreakdown` contains only valid entity types
- [ ] `data.processingStartedAt` is before `data.processingCompletedAt`
- [ ] `requestedBatchSize` is between 1 and 50
- [ ] `message` is a non-empty string

---

## Acceptance Criteria Checklist (from REQ-E03-025)

- [x] POST endpoint exists at `/api/admin/process-translations`
- [x] Endpoint enforces authentication and verifies administrative or service role privileges
- [x] Endpoint returns 403 error when called by users lacking administrative access
- [x] Endpoint accepts optional JSON body with batchSize parameter
- [x] Endpoint defaults batchSize to 10 when parameter is not provided
- [x] Endpoint validates batchSize is a positive integer
- [x] Endpoint caps batchSize at maximum value of 50
- [x] Endpoint returns 400 error for invalid batchSize values (negative, non-numeric)
- [x] Endpoint executes stale job cleanup routine before processing jobs
- [x] Endpoint invokes job picker to retrieve up to batchSize queued jobs
- [x] Endpoint processes each job using appropriate content-specific handler
- [x] Endpoint continues processing remaining jobs even when individual jobs fail
- [x] Endpoint tracks processing start and end timestamps
- [x] Endpoint tracks count of successful job completions
- [x] Endpoint tracks count of failed job attempts
- [x] Endpoint tracks count of stale jobs recovered during cleanup
- [x] Endpoint calculates average processing duration per job
- [x] Endpoint aggregates processed language codes
- [x] Endpoint aggregates job counts by entity type
- [x] Endpoint returns 200 status with statistics payload on completion
- [x] Response payload includes all required statistics fields
- [x] Endpoint completes synchronously before returning response
- [x] Endpoint handles database errors gracefully with 500 status
- [x] Endpoint logs invocation details including requesting user for audit trail
- [x] TypeScript types are defined for request body, response payload, and error responses

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Long execution time for large batches | MAX_BATCH_SIZE cap at 50; consider adding request timeout |
| Concurrent invocations conflict | Job locking in `processNextJob()` prevents double-processing |
| Job processor not initialized | Using `getJobProcessor()` singleton ensures initialization |
| Cleanup blocks processing | Cleanup errors caught and don't block processing |
| Memory issues with large result arrays | Batch size cap limits array size |

---

## Future Enhancements

For consideration in future iterations:

1. **Service Role Authentication:** Add alternative authentication for automated triggers (cron jobs)
2. **Async Processing:** Option to process asynchronously with webhook callback
3. **Entity Type Filtering:** Option to process only specific entity types
4. **Priority Filtering:** Option to process only high-priority jobs
5. **Dry Run Mode:** Option to query jobs without processing

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation*
*Phase 5, Task 5.1: Create job processing API route*
