# REQ-245: Admin API Endpoint for Translation Job Processing - Detailed Task Breakdown

**Generated:** 2026-01-18 23:45:00 UTC
**Last Modified:** 2026-01-18 23:45:00 UTC
**Request Reference:** REQ-245 in `/docs/gen_requests.md`
**Overview Document:** `/docs/REQ-245-create-api-route-for-job-processing-overview.md`
**Implementation Plan:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
**Phase:** 4 - Background Job Processing
**Task ID:** 4.3
**Estimated Story Points:** 3 (Small)

---

## Executive Summary

This document provides granular, actionable implementation tasks for creating an admin API endpoint (`POST /api/admin/process-translations`) that triggers translation job processing on-demand. The endpoint integrates with the job processor (REQ-244) and returns processing statistics. Each task is designed to be approximately 1 story point and can be executed independently by a developer or AI coding agent.

---

## Prerequisites Checklist

Before starting implementation, verify these dependencies are complete:

- [ ] **REQ-243 (Task 4.1):** Job queue module exists at `/src/lib/job-queue/translation-jobs.ts`
- [ ] **REQ-244 (Task 4.2):** Job processor exists at `/src/lib/job-queue/job-processor.ts` with:
  - `getJobProcessor()` singleton function
  - `processNextJob()` method
  - `getStats()` method
  - Exported types: `ProcessingRunResult`, `ProcessorStats`, `JobProcessingResult`
- [ ] **Auth Infrastructure:** `/src/lib/auth-server.ts` with `validateAdminAuth()` function

---

## Task Breakdown

### Task 4.3.1: Create Directory and Route File Structure

**Story Points:** 0.5
**Type:** Setup
**File:** `/src/app/api/admin/process-translations/route.ts`

**Description:**
Create the directory structure and initial route handler file with minimal boilerplate.

**Implementation Steps:**

1. Create directory `/src/app/api/admin/process-translations/`
2. Create file `route.ts` with basic Next.js route handler structure

**Code to Implement:**

```typescript
// /src/app/api/admin/process-translations/route.ts

import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/process-translations
 *
 * Admin-only endpoint that triggers translation job processing.
 * Can be called manually or by external cron schedulers.
 *
 * @returns Processing statistics including jobs processed, succeeded, and failed
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Implementation will be added in subsequent tasks
  return NextResponse.json({ success: false, error: 'Not implemented' }, { status: 501 });
}
```

**Acceptance Criteria:**
- [ ] Directory `/src/app/api/admin/process-translations/` exists
- [ ] File `route.ts` exists with POST export
- [ ] TypeScript compiles without errors
- [ ] Endpoint returns 501 when called (placeholder)

**Verification Command:**
```bash
curl -X POST http://localhost:3000/api/admin/process-translations
# Expected: {"success":false,"error":"Not implemented"} with status 501
```

---

### Task 4.3.2: Add Type Definitions

**Story Points:** 0.5
**Type:** Types
**File:** `/src/app/api/admin/process-translations/route.ts`

**Description:**
Define TypeScript interfaces for request body and response shape.

**Implementation Steps:**

1. Add interface for optional request body
2. Add interface for response structure
3. Add interface for job result details (when included)

**Code to Implement:**

```typescript
// Add at top of file, after imports

/**
 * Optional request body for process-translations endpoint
 */
interface ProcessTranslationsRequest {
  /** Number of jobs to process in this run (default: 1, max: 100) */
  batchSize?: number;
  /** Enable detailed logging for this run */
  enableLogging?: boolean;
  /** Include per-job details in response */
  includeJobDetails?: boolean;
}

/**
 * Individual job result details
 */
interface JobResultDetail {
  jobId: string;
  success: boolean;
  entityType: 'article' | 'item' | 'link' | 'tag';
  entityId: string;
  targetLanguage: string;
  processingTimeMs: number;
  errorMessage?: string;
}

/**
 * Processor statistics snapshot
 */
interface ProcessorStatsSnapshot {
  isRunning: boolean;
  totalJobsProcessed: number;
  totalJobsSucceeded: number;
  totalJobsFailed: number;
  consecutiveErrors: number;
  lastProcessedAt?: string;
}

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
    results?: JobResultDetail[];
    processorStats: ProcessorStatsSnapshot;
  };
  error?: string;
  code?: string;
}
```

**Acceptance Criteria:**
- [ ] All interfaces defined with JSDoc comments
- [ ] Types match overview document specification
- [ ] TypeScript compiles without errors

---

### Task 4.3.3: Implement Authentication Check

**Story Points:** 1
**Type:** Implementation
**File:** `/src/app/api/admin/process-translations/route.ts`

**Description:**
Add admin authentication using the existing `validateAdminAuth()` pattern from `/src/lib/auth-server.ts`. Require admin or sysadmin level access.

**Implementation Steps:**

1. Import `validateAdminAuth` from auth-server
2. Call `validateAdminAuth` at start of handler
3. Check authentication result and return 401 if failed
4. Check admin/sysadmin status and return 403 if not authorized
5. Add request logging with unique request ID

**Code to Implement:**

```typescript
import { validateAdminAuth } from '@/lib/auth-server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Generate unique request ID for log correlation
  const requestId = `proc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  console.log(`[ProcessTranslations:${requestId}] POST request received`, {
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get('user-agent'),
    source: request.headers.get('x-cron-source') || 'manual'
  });

  try {
    // Validate admin authentication
    const authResult = await validateAdminAuth(request);

    if (authResult.error) {
      console.log(`[ProcessTranslations:${requestId}] Authentication failed`);
      return authResult.error;
    }

    const { user, isAdmin, isSysAdmin } = authResult;

    // Require admin-level access (either admin or sysadmin)
    if (!isAdmin && !isSysAdmin) {
      console.log(`[ProcessTranslations:${requestId}] User is not admin:`, user.email);
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied. Admin privileges required.',
          code: 'FORBIDDEN'
        } as ProcessTranslationsResponse,
        { status: 403 }
      );
    }

    console.log(`[ProcessTranslations:${requestId}] Auth successful for:`, user.email);

    // Continue to request parsing (Task 4.3.4)
    // ... placeholder for next task ...

    return NextResponse.json({ success: false, error: 'Not fully implemented' }, { status: 501 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[ProcessTranslations:${requestId}] Unexpected error:`, errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      } as ProcessTranslationsResponse,
      { status: 500 }
    );
  }
}
```

**Acceptance Criteria:**
- [ ] Unauthenticated requests return 401
- [ ] Non-admin users return 403
- [ ] Admin users pass authentication check
- [ ] Sysadmin users pass authentication check
- [ ] Request ID logged for correlation
- [ ] Source header checked (cron vs manual)

**Verification Commands:**
```bash
# Test unauthenticated
curl -X POST http://localhost:3000/api/admin/process-translations
# Expected: 401 Unauthorized

# Test authenticated admin (requires valid session cookie)
curl -X POST http://localhost:3000/api/admin/process-translations \
  -H "Cookie: <admin-session-cookie>"
# Expected: 501 Not fully implemented (auth passed)
```

---

### Task 4.3.4: Implement Request Body Parsing

**Story Points:** 1
**Type:** Implementation
**File:** `/src/app/api/admin/process-translations/route.ts`

**Description:**
Parse and validate the optional JSON request body with safe defaults and validation.

**Implementation Steps:**

1. Check Content-Type header for JSON
2. Attempt to parse request body, handle empty/malformed gracefully
3. Extract and validate `batchSize` parameter (1-100)
4. Extract `enableLogging` and `includeJobDetails` with defaults
5. Return 400 for invalid parameters

**Code to Implement:**

```typescript
// Inside POST handler, after auth check, before processing:

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
  console.warn(`[ProcessTranslations:${requestId}] Failed to parse request body:`, parseError);
  // Continue with defaults - body is optional
}

// Extract options with defaults
const {
  batchSize = 1,
  enableLogging = process.env.NODE_ENV !== 'production',
  includeJobDetails = false
} = requestOptions;

// Validate batchSize
if (typeof batchSize !== 'number' || batchSize < 1 || batchSize > 100) {
  console.log(`[ProcessTranslations:${requestId}] Invalid batchSize:`, batchSize);
  return NextResponse.json(
    {
      success: false,
      error: 'Invalid batchSize. Must be a number between 1 and 100.',
      code: 'INVALID_PARAMS'
    } as ProcessTranslationsResponse,
    { status: 400 }
  );
}

console.log(`[ProcessTranslations:${requestId}] Request options:`, {
  batchSize,
  enableLogging,
  includeJobDetails,
  triggeredBy: user.email
});
```

**Acceptance Criteria:**
- [ ] Empty request body handled gracefully (uses defaults)
- [ ] Malformed JSON handled gracefully (uses defaults)
- [ ] Valid JSON parsed correctly
- [ ] `batchSize` validated (1-100 range)
- [ ] Invalid `batchSize` returns 400 with clear error message
- [ ] Default values applied: batchSize=1, enableLogging based on env, includeJobDetails=false

**Verification Commands:**
```bash
# Test empty body
curl -X POST http://localhost:3000/api/admin/process-translations \
  -H "Cookie: <admin-cookie>"
# Expected: Uses default batchSize=1

# Test valid body
curl -X POST http://localhost:3000/api/admin/process-translations \
  -H "Cookie: <admin-cookie>" \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 5}'
# Expected: Uses batchSize=5

# Test invalid batchSize
curl -X POST http://localhost:3000/api/admin/process-translations \
  -H "Cookie: <admin-cookie>" \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 150}'
# Expected: 400 with "Invalid batchSize" error
```

---

### Task 4.3.5: Implement Job Processing Trigger

**Story Points:** 1
**Type:** Implementation
**File:** `/src/app/api/admin/process-translations/route.ts`

**Description:**
Integrate with the job processor to execute processing cycles based on the requested batch size.

**Implementation Steps:**

1. Import `getJobProcessor` from job-queue module
2. Get processor singleton instance
3. Record start time
4. Loop through batch, calling `processNextJob()` for each
5. Track results, successes, and failures
6. Add small delay between jobs to prevent rate limiting
7. Stop early if no more jobs available

**Code to Implement:**

```typescript
// Add import at top of file
import { getJobProcessor } from '@/lib/job-queue';
import type { JobProcessingResult } from '@/lib/job-queue';

// Inside POST handler, after request parsing:

const startTime = Date.now();
const startedAt = new Date().toISOString();

console.log(`[ProcessTranslations:${requestId}] Starting processing cycle`, {
  batchSize,
  enableLogging,
  triggeredBy: user.email
});

// Get the job processor singleton
const processor = getJobProcessor();

// Process jobs up to batchSize
const allResults: JobProcessingResult[] = [];
let totalSucceeded = 0;
let totalFailed = 0;

for (let i = 0; i < batchSize; i++) {
  const result = await processor.processNextJob();

  if (!result) {
    // No more jobs available in queue
    console.log(`[ProcessTranslations:${requestId}] No more jobs available after ${i} jobs`);
    break;
  }

  allResults.push(result);

  if (result.success) {
    totalSucceeded++;
  } else {
    totalFailed++;
  }

  // Small delay between jobs to prevent rate limiting on translation APIs
  if (i < batchSize - 1 && allResults.length > 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

const completedAt = new Date().toISOString();
const totalProcessingTimeMs = Date.now() - startTime;

console.log(`[ProcessTranslations:${requestId}] Processing complete`, {
  jobsProcessed: allResults.length,
  succeeded: totalSucceeded,
  failed: totalFailed,
  timeMs: totalProcessingTimeMs
});
```

**Acceptance Criteria:**
- [ ] Job processor singleton obtained via `getJobProcessor()`
- [ ] Processing loop executes up to `batchSize` times
- [ ] Loop exits early when no jobs available
- [ ] Results tracked in array for each processed job
- [ ] Success/failure counts maintained
- [ ] 100ms delay between jobs when batch > 1
- [ ] Start and end times recorded

**Note:** This task depends on REQ-244 being complete. The `JobProcessingResult` type should include: `jobId`, `success`, `entityType`, `entityId`, `targetLanguage`, `processingTimeMs`, `errorMessage?`

---

### Task 4.3.6: Implement Response Formatting

**Story Points:** 0.5
**Type:** Implementation
**File:** `/src/app/api/admin/process-translations/route.ts`

**Description:**
Format the processing results into the standardized response structure.

**Implementation Steps:**

1. Get processor stats after processing
2. Build response object with all statistics
3. Conditionally include detailed job results
4. Return success response

**Code to Implement:**

```typescript
// Inside POST handler, after processing loop:

// Get current processor statistics
const processorStats = processor.getStats();

// Build response object
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

console.log(`[ProcessTranslations:${requestId}] Request completed successfully`, {
  jobsProcessed: allResults.length,
  succeeded: totalSucceeded,
  failed: totalFailed,
  durationMs: totalProcessingTimeMs
});

return NextResponse.json(response);
```

**Acceptance Criteria:**
- [ ] Response includes `success: true`
- [ ] Response includes `startedAt` and `completedAt` ISO timestamps
- [ ] Response includes job counts: `jobsProcessed`, `jobsSucceeded`, `jobsFailed`
- [ ] Response includes `totalProcessingTimeMs`
- [ ] Response includes `processorStats` object
- [ ] Job details only included when `includeJobDetails: true`
- [ ] JSON response properly formatted

**Expected Response Shape (success):**
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

---

### Task 4.3.7: Implement Error Handling with Partial Results

**Story Points:** 0.5
**Type:** Implementation
**File:** `/src/app/api/admin/process-translations/route.ts`

**Description:**
Wrap processing logic in try-catch and return partial results when errors occur mid-processing.

**Implementation Steps:**

1. Wrap processing logic in try-catch block
2. On error, include any partial results collected
3. Set appropriate error code and message
4. Return 500 status with partial data

**Code to Implement:**

```typescript
// Replace the processing section with this error-handling wrapper:

let startTime: number;
let startedAt: string;
let allResults: JobProcessingResult[] = [];
let totalSucceeded = 0;
let totalFailed = 0;
let processor: ReturnType<typeof getJobProcessor>;

try {
  startTime = Date.now();
  startedAt = new Date().toISOString();

  console.log(`[ProcessTranslations:${requestId}] Starting processing cycle`, {
    batchSize,
    enableLogging,
    triggeredBy: user.email
  });

  // Get the job processor singleton
  processor = getJobProcessor();

  // Process jobs up to batchSize
  for (let i = 0; i < batchSize; i++) {
    const result = await processor.processNextJob();

    if (!result) {
      console.log(`[ProcessTranslations:${requestId}] No more jobs available after ${i} jobs`);
      break;
    }

    allResults.push(result);

    if (result.success) {
      totalSucceeded++;
    } else {
      totalFailed++;
    }

    // Small delay between jobs
    if (i < batchSize - 1 && allResults.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // ... success response formatting (from Task 4.3.6) ...

} catch (processingError) {
  const errorMessage = processingError instanceof Error ? processingError.message : String(processingError);
  console.error(`[ProcessTranslations:${requestId}] Processing error:`, errorMessage);

  // Build partial response with any results we did get
  const partialResponse: ProcessTranslationsResponse = {
    success: false,
    error: `Processing failed: ${errorMessage}`,
    code: 'PROCESSING_ERROR'
  };

  // Include partial results if we have any
  if (allResults.length > 0) {
    const completedAt = new Date().toISOString();
    partialResponse.data = {
      startedAt: startedAt || new Date().toISOString(),
      completedAt,
      jobsProcessed: allResults.length,
      jobsSucceeded: totalSucceeded,
      jobsFailed: totalFailed + 1, // Count this error
      totalProcessingTimeMs: Date.now() - (startTime || Date.now()),
      processorStats: processor?.getStats() || {
        isRunning: false,
        totalJobsProcessed: 0,
        totalJobsSucceeded: 0,
        totalJobsFailed: 0,
        consecutiveErrors: 0
      }
    };

    if (includeJobDetails) {
      partialResponse.data.results = allResults.map(r => ({
        jobId: r.jobId,
        success: r.success,
        entityType: r.entityType,
        entityId: r.entityId,
        targetLanguage: r.targetLanguage,
        processingTimeMs: r.processingTimeMs,
        errorMessage: r.errorMessage
      }));
    }
  }

  console.log(`[ProcessTranslations:${requestId}] Request failed`, {
    error: errorMessage,
    partialJobsProcessed: allResults.length
  });

  return NextResponse.json(partialResponse, { status: 500 });
}
```

**Acceptance Criteria:**
- [ ] Processing errors caught and handled
- [ ] Partial results included in error response
- [ ] Error message included in response
- [ ] Error code set to `PROCESSING_ERROR`
- [ ] Status code 500 returned on processing errors
- [ ] Partial `processorStats` included when available

**Expected Response Shape (partial failure):**
```json
{
  "success": false,
  "error": "Processing failed: Translation API timeout",
  "code": "PROCESSING_ERROR",
  "data": {
    "startedAt": "2026-01-18T23:30:00.000Z",
    "completedAt": "2026-01-18T23:30:01.500Z",
    "jobsProcessed": 2,
    "jobsSucceeded": 1,
    "jobsFailed": 2,
    "totalProcessingTimeMs": 1500,
    "processorStats": { ... }
  }
}
```

---

### Task 4.3.8: Add Export to Job Queue Index (if needed)

**Story Points:** 0.5
**Type:** Integration
**File:** `/src/lib/job-queue/index.ts`

**Description:**
Ensure the job-queue barrel export includes all required types for the API route.

**Implementation Steps:**

1. Verify `/src/lib/job-queue/index.ts` exports `getJobProcessor`
2. Verify `JobProcessingResult` type is exported
3. Add any missing exports

**Code to Verify/Add:**

```typescript
// /src/lib/job-queue/index.ts

// Ensure these exports exist:
export { getJobProcessor } from './job-processor';
export type {
  JobProcessingResult,
  ProcessorStats,
  ProcessingRunResult
} from './job-processor';

// Or if types are in separate file:
export type {
  JobProcessingResult,
  ProcessorStats,
  ProcessingRunResult
} from './job-processor.types';
```

**Acceptance Criteria:**
- [ ] `getJobProcessor` is exported from index
- [ ] `JobProcessingResult` type is exported
- [ ] Import in route.ts resolves correctly
- [ ] TypeScript compiles without import errors

---

## Complete Implementation File

After completing all tasks, the final `/src/app/api/admin/process-translations/route.ts` should contain all the pieces assembled together. Here is the complete expected file for reference:

```typescript
// /src/app/api/admin/process-translations/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { getJobProcessor } from '@/lib/job-queue';
import type { JobProcessingResult } from '@/lib/job-queue';

/**
 * Optional request body for process-translations endpoint
 */
interface ProcessTranslationsRequest {
  batchSize?: number;
  enableLogging?: boolean;
  includeJobDetails?: boolean;
}

interface JobResultDetail {
  jobId: string;
  success: boolean;
  entityType: 'article' | 'item' | 'link' | 'tag';
  entityId: string;
  targetLanguage: string;
  processingTimeMs: number;
  errorMessage?: string;
}

interface ProcessorStatsSnapshot {
  isRunning: boolean;
  totalJobsProcessed: number;
  totalJobsSucceeded: number;
  totalJobsFailed: number;
  consecutiveErrors: number;
  lastProcessedAt?: string;
}

interface ProcessTranslationsResponse {
  success: boolean;
  data?: {
    startedAt: string;
    completedAt: string;
    jobsProcessed: number;
    jobsSucceeded: number;
    jobsFailed: number;
    totalProcessingTimeMs: number;
    results?: JobResultDetail[];
    processorStats: ProcessorStatsSnapshot;
  };
  error?: string;
  code?: string;
}

/**
 * POST /api/admin/process-translations
 *
 * Admin-only endpoint that triggers translation job processing.
 * Can be called manually or by external cron schedulers.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = `proc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  console.log(`[ProcessTranslations:${requestId}] POST request received`, {
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get('user-agent'),
    source: request.headers.get('x-cron-source') || 'manual'
  });

  try {
    // Auth validation
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      console.log(`[ProcessTranslations:${requestId}] Authentication failed`);
      return authResult.error;
    }

    const { user, isAdmin, isSysAdmin } = authResult;
    if (!isAdmin && !isSysAdmin) {
      console.log(`[ProcessTranslations:${requestId}] User is not admin:`, user.email);
      return NextResponse.json(
        { success: false, error: 'Access denied. Admin privileges required.', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Parse request body
    let requestOptions: ProcessTranslationsRequest = {};
    try {
      const contentType = request.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const body = await request.text();
        if (body && body.trim()) {
          requestOptions = JSON.parse(body);
        }
      }
    } catch {
      // Continue with defaults
    }

    const { batchSize = 1, enableLogging = false, includeJobDetails = false } = requestOptions;

    if (typeof batchSize !== 'number' || batchSize < 1 || batchSize > 100) {
      return NextResponse.json(
        { success: false, error: 'Invalid batchSize. Must be between 1 and 100.', code: 'INVALID_PARAMS' },
        { status: 400 }
      );
    }

    // Processing
    let startTime: number;
    let startedAt: string;
    let allResults: JobProcessingResult[] = [];
    let totalSucceeded = 0;
    let totalFailed = 0;
    let processor: ReturnType<typeof getJobProcessor>;

    try {
      startTime = Date.now();
      startedAt = new Date().toISOString();
      processor = getJobProcessor();

      for (let i = 0; i < batchSize; i++) {
        const result = await processor.processNextJob();
        if (!result) break;

        allResults.push(result);
        if (result.success) totalSucceeded++;
        else totalFailed++;

        if (i < batchSize - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      const completedAt = new Date().toISOString();
      const totalProcessingTimeMs = Date.now() - startTime;
      const processorStats = processor.getStats();

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

      console.log(`[ProcessTranslations:${requestId}] Completed`, {
        jobsProcessed: allResults.length, succeeded: totalSucceeded, failed: totalFailed
      });

      return NextResponse.json(response);

    } catch (processingError) {
      const errorMessage = processingError instanceof Error ? processingError.message : String(processingError);
      console.error(`[ProcessTranslations:${requestId}] Processing error:`, errorMessage);

      const partialResponse: ProcessTranslationsResponse = {
        success: false,
        error: `Processing failed: ${errorMessage}`,
        code: 'PROCESSING_ERROR'
      };

      if (allResults.length > 0) {
        partialResponse.data = {
          startedAt: startedAt!,
          completedAt: new Date().toISOString(),
          jobsProcessed: allResults.length,
          jobsSucceeded: totalSucceeded,
          jobsFailed: totalFailed + 1,
          totalProcessingTimeMs: Date.now() - startTime!,
          processorStats: processor?.getStats() || {
            isRunning: false, totalJobsProcessed: 0, totalJobsSucceeded: 0,
            totalJobsFailed: 0, consecutiveErrors: 0
          }
        };
      }

      return NextResponse.json(partialResponse, { status: 500 });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[ProcessTranslations:${requestId}] Unexpected error:`, errorMessage);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
```

---

## Testing Checklist

### Unit Tests (Manual/Automated)

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Unauthenticated request | 401 Unauthorized | [ ] |
| Non-admin user request | 403 Forbidden | [ ] |
| Admin user request | 200 with processing results | [ ] |
| Sysadmin user request | 200 with processing results | [ ] |
| Empty request body | Uses default batchSize=1 | [ ] |
| Malformed JSON body | Uses defaults, no error | [ ] |
| Valid batchSize (5) | Processes up to 5 jobs | [ ] |
| Invalid batchSize (0) | 400 Invalid params | [ ] |
| Invalid batchSize (150) | 400 Invalid params | [ ] |
| Invalid batchSize (string) | 400 Invalid params | [ ] |
| No jobs in queue | 200 with jobsProcessed=0 | [ ] |
| includeJobDetails=true | Response includes results array | [ ] |
| includeJobDetails=false | Response excludes results array | [ ] |
| Processing error mid-batch | 500 with partial results | [ ] |

### Integration Tests

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Process real queued job | Job status changes to completed | [ ] |
| Translation appears in DB | Translation table populated | [ ] |
| Concurrent API calls | No duplicate processing | [ ] |
| Cron-style invocation | Works with x-cron-source header | [ ] |

### Manual Verification Commands

```bash
# 1. Test unauthenticated
curl -X POST http://localhost:3000/api/admin/process-translations

# 2. Test with admin session (get cookie from browser)
curl -X POST http://localhost:3000/api/admin/process-translations \
  -H "Cookie: sb-xxx-auth-token=xxx"

# 3. Test with batch size
curl -X POST http://localhost:3000/api/admin/process-translations \
  -H "Cookie: sb-xxx-auth-token=xxx" \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 3, "includeJobDetails": true}'

# 4. Test cron header
curl -X POST http://localhost:3000/api/admin/process-translations \
  -H "Cookie: sb-xxx-auth-token=xxx" \
  -H "x-cron-source: railway-cron"
```

---

## Acceptance Criteria Verification Matrix

| PRD Acceptance Criteria | Task | Verification |
|------------------------|------|--------------|
| Endpoint requires admin-level authentication | 4.3.3 | `validateAdminAuth()` + admin check |
| Single invocation triggers one processing cycle | 4.3.5 | `processNextJob()` loop with batchSize |
| Response includes count of jobs processed | 4.3.6 | `jobsProcessed` in response |
| Response includes count of successful translations | 4.3.6 | `jobsSucceeded` in response |
| Response includes count of failed translations | 4.3.6 | `jobsFailed` in response |
| Response includes total processing time | 4.3.6 | `totalProcessingTimeMs` in response |
| Can be called repeatedly without adverse effects | 4.3.5 | Idempotent, job locking in processor |
| Failed job processing does not prevent stats return | 4.3.7 | Try-catch with partial results |
| Suitable for cron invocation | 4.3.3 | Simple POST, JSON response, logs source |

---

## Dependencies Summary

### Upstream (Must Complete First)
- REQ-243: Job queue module (`/src/lib/job-queue/translation-jobs.ts`)
- REQ-244: Job processor (`/src/lib/job-queue/job-processor.ts`)

### Downstream (Blocked By This)
- Task 4.4: Concurrency control (may test via this endpoint)
- Task 4.5: Job status API (complementary endpoint)
- External cron configuration (Railway)

---

## Risk Mitigation

| Risk | Mitigation Implemented |
|------|------------------------|
| Concurrent processing issues | Rely on job processor locking (REQ-244) |
| Long-running request timeout | Max batchSize=100, 100ms delays |
| Translation API rate limits | 100ms delay between jobs |
| Unauthorized access | Admin auth required |
| Partial failures lose data | Return partial results on error |

---

## Effort Summary

| Task | Story Points |
|------|--------------|
| 4.3.1: Create file structure | 0.5 |
| 4.3.2: Type definitions | 0.5 |
| 4.3.3: Authentication | 1 |
| 4.3.4: Request parsing | 1 |
| 4.3.5: Job processing | 1 |
| 4.3.6: Response formatting | 0.5 |
| 4.3.7: Error handling | 0.5 |
| 4.3.8: Export verification | 0.5 |
| **Total** | **~5.5** |

**Recommended Implementation Order:** 4.3.1 → 4.3.2 → 4.3.3 → 4.3.4 → 4.3.8 → 4.3.5 → 4.3.6 → 4.3.7

---

## References

- Overview Document: `/docs/REQ-245-create-api-route-for-job-processing-overview.md`
- Implementation Plan: `/docs/prd/Plan-110-L10N-Epic1-Foundation.md` (Phase 4, Task 4.3)
- Request Definition: `/docs/gen_requests.md` (REQ-245)
- Auth Pattern: `/src/lib/auth-server.ts` (`validateAdminAuth()`)
- Admin Route Example: `/src/app/api/admin/grant-access/route.ts`

---

*Detailed task breakdown generated for FAQBNB Localization Epic 1 - Foundation, Phase 4, Task 4.3*
