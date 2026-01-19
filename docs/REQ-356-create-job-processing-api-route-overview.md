# REQ-356: Create Job Processing API Route for Translation Queue - Implementation Overview

**Generated:** 2026-01-19 20:00:00 UTC
**Last Modified:** 2026-01-19 20:30:00 UTC
**Request Reference:** REQ-356 in docs/gen_requests_epic3.md
**Implementation Plan Reference:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md (Phase 5, Task 5.1)
**Epic:** Localization Epic 3 - Dynamic Content Translation
**Type:** NEW FEATURE
**Size:** M (Medium)

---

## Summary

Create an administrative API endpoint that manually triggers translation job processing with configurable batch sizes and returns detailed processing statistics for operational monitoring and control. This endpoint enables system operators to trigger job processing on-demand outside of automated schedules, adjust batch sizes dynamically based on load conditions, and gain visibility into processing outcomes through a standardized API interface.

---

## Technical Context

### Existing Stack

| Technology | Details |
|------------|---------|
| **Framework** | Next.js 15.5.9 with App Router |
| **Language** | TypeScript 5.x (strict mode) |
| **Authentication** | Supabase Auth with `validateAdminAuth` helper from `/src/lib/auth-server.ts` |
| **Database** | Supabase (PostgreSQL with RLS) |
| **Job Queue** | `/src/lib/job-queue/` module with `TranslationJobProcessor` |

### Existing Dependencies

| Module | Location | Purpose |
|--------|----------|---------|
| `validateAdminAuth` | `/src/lib/auth-server.ts` | Admin authentication validation |
| `TranslationJobProcessor` | `/src/lib/job-queue/job-processor.ts` | Job processing class |
| `createJobProcessor` | `/src/lib/job-queue/job-processor.ts` | Factory function for processor |
| `fetchAndLockNextJob` | `/src/lib/job-queue/translation-jobs.ts` | Atomic job fetching with locking |
| `cleanupStaleProcessingJobs` | `/src/lib/job-queue/concurrency-control.ts` | Stale job cleanup |
| `getJobsByStatus` | `/src/lib/job-queue/translation-jobs.ts` | Query jobs by status |
| `supabaseAdmin` | `/src/lib/supabase.ts` | Admin database client |
| `RateLimiter` | `/src/lib/translation-service/utils/rate-limiter.ts` | Rate limiting utility |

### Relevant Code Patterns

1. **Admin API Route Pattern** (from `/src/app/api/admin/translate/route.ts`):
   - Uses `validateAdminAuth(request)` for authentication
   - Returns proper error responses with `success: false, error, code` structure
   - Validates request body with dedicated validation functions
   - Uses structured logging with prefix `[EndpointName]`

2. **Job Processing Pattern** (from `/src/lib/job-queue/job-processor.ts`):
   - `TranslationJobProcessor.processNextJob()` processes a single job
   - `TranslationJobProcessor.runProcessingCycle()` returns `ProcessingRunResult`
   - Worker ID generation: `processor-${process.pid}-${Date.now()}`

3. **Response Format Pattern** (from existing admin APIs):
   ```typescript
   {
     success: boolean;
     data?: { ... };
     error?: string;
     code?: string;
   }
   ```

4. **Rate Limiting Pattern** (from `/src/lib/translation-service/utils/rate-limiter.ts`):
   - Sliding window rate limiter with configurable window and max requests
   - Support for queue or reject strategies

---

## Implementation Approach

### API Endpoint Design

**Endpoint:** `POST /api/admin/process-translations`

**Request Body:**
```typescript
interface ProcessTranslationsRequest {
  batchSize?: number; // Optional, default: 10, range: 1-100
}
```

**Response Body:**
```typescript
interface ProcessTranslationsResponse {
  success: boolean;
  data?: {
    processedCount: number;    // Total jobs attempted
    successCount: number;      // Jobs completed successfully
    failureCount: number;      // Jobs that failed
    durationMs: number;        // Processing time in milliseconds
    processedJobIds: string[]; // Array of all processed job IDs
    results?: Array<{          // Detailed per-job results
      jobId: string;
      success: boolean;
      entityType: string;
      entityId: string;
      targetLanguage: string;
      processingTimeMs: number;
      errorMessage?: string;
    }>;
  };
  error?: string;
  code?: string;
}
```

### Authentication Requirements

The endpoint must support two authentication methods:
1. **Service Role Key**: For automated cron/scheduled invocations
   - Check for `SUPABASE_SERVICE_ROLE_KEY` in Authorization header
2. **Admin User Session**: For manual admin invocations
   - Use existing `validateAdminAuth` pattern

### Rate Limiting Requirements

**Maximum:** 10 requests per minute per authenticated user

The endpoint must implement rate limiting to prevent abuse:
- Track requests per user ID (from session) or per IP (for service role)
- Use in-memory Map-based rate limiting (simple sliding window)
- Return 429 Too Many Requests when limit exceeded
- Include `Retry-After` header in rate limit responses

### Processing Flow

```
1. Validate authentication (service role or admin session)
   ├── Unauthorized → Return 401
   └── Not admin → Return 403

2. Check endpoint rate limit (10 req/min per user)
   └── Rate limited → Return 429 with Retry-After header

3. Parse and validate request body
   ├── Invalid JSON → Return 400
   └── batchSize out of range → Return 400

4. Create temporary job processor instance
   └── Configure with unique worker ID

5. Fetch and process jobs up to batchSize
   ├── For each iteration up to batchSize:
   │   ├── Call processor.processNextJob()
   │   ├── If no job returned → break loop (queue empty)
   │   ├── Track result (success/failure)
   │   └── Continue on individual job failure
   └── Measure total duration

6. Log processing summary for operational monitoring

7. Build and return response with statistics
```

---

## Ordered Task List

### Task 1: Create route handler file structure
- Create `/src/app/api/admin/process-translations/route.ts`
- Add module documentation header with REQ-356 reference
- Define TypeScript interfaces for request/response

### Task 2: Implement authentication validation
- Add service role key validation (check `Authorization: Bearer <service_role_key>`)
- Fall back to `validateAdminAuth` for session-based auth
- Return 401 for unauthenticated, 403 for non-admin users

### Task 3: Implement endpoint rate limiting
- Create in-memory rate limiter (Map-based, 10 req/min per user)
- Track by user ID for session auth, by service role indicator for service auth
- Return 429 with descriptive error when rate limited
- Include `Retry-After` header

### Task 4: Implement request body validation
- Parse JSON body with try/catch for malformed JSON
- Validate `batchSize` parameter:
  - Default to 10 if not provided
  - Validate as integer between 1 and 100
  - Return 400 with descriptive error for invalid values

### Task 5: Implement batch job processing loop
- Generate unique worker ID for this request
- Create job processor instance using `createJobProcessor()`
- Loop up to batchSize times:
  - Call `processor.processNextJob()`
  - Break if no job returned (queue empty)
  - Track success/failure counts and job IDs
  - Continue processing on individual job failure
- Measure total processing duration

### Task 6: Implement structured logging
- Log authentication method used
- Log batch processing start with batchSize and worker ID
- Log processing summary (processed/success/failure/duration)
- Log individual failures with error messages

### Task 7: Build and return response
- Construct response with all required statistics fields
- Return 200 on success (even if some jobs failed - that's normal operation)
- Return 500 only for unexpected/database errors

### Task 8: Implement error handling
- Wrap processing in try/catch
- Handle database errors gracefully
- Return generic error message for internal errors
- Log full error details for debugging

---

## Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/admin/process-translations/route.ts` | Main API route handler |

### Files to READ ONLY (dependencies)

| File Path | Functions/Types Used |
|-----------|----------------------|
| `/src/lib/auth-server.ts` | `validateAdminAuth` |
| `/src/lib/job-queue/index.ts` | Module exports (types and functions) |
| `/src/lib/job-queue/job-processor.ts` | `TranslationJobProcessor`, `createJobProcessor`, `ProcessingRunResult`, `JobProcessingResult` |
| `/src/lib/job-queue/translation-jobs.ts` | `fetchAndLockNextJob`, `getJobsByStatus`, `markJobCompleted`, `markJobFailed` |
| `/src/lib/job-queue/translation-jobs.types.ts` | `TranslationJob`, `JobStatus`, `EntityType`, `SupportedLanguage` |
| `/src/lib/job-queue/concurrency-control.ts` | `cleanupStaleProcessingJobs`, `CleanupResult` |
| `/src/lib/supabase.ts` | `supabaseAdmin` |

### Database Tables Accessed (via Job Processor)

| Table | Access | Purpose |
|-------|--------|---------|
| `translation_jobs` | Read/Write | Fetch queued jobs, update status |
| `items` | Read | Fetch item content for translation |
| `item_articles` | Read | Fetch article content for translation |
| `item_links` | Read | Fetch link content for translation |
| `tag_translations` | Read/Write | Fetch tag content, store translations |
| `item_translations` | Write | Store item translations |
| `article_translations` | Write | Store article translations |
| `link_translations` | Write | Store link translations |

---

## Integration Contract

### Service Role Authentication

The service role key should be validated by comparing against the `SUPABASE_SERVICE_ROLE_KEY` environment variable:

```typescript
// Check for service role authentication
const authHeader = request.headers.get('Authorization');
if (authHeader?.startsWith('Bearer ')) {
  const token = authHeader.slice(7);
  if (token === process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // Service role authenticated - proceed with 'service-role' as identifier
    return { isServiceRole: true, userId: 'service-role' };
  }
}
```

### Rate Limiting Implementation

Simple in-memory rate limiter for this endpoint:

```typescript
// Rate limit configuration
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

// In-memory storage (per-endpoint)
const endpointRateLimiter = new Map<string, number[]>();

function checkRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  const timestamps = endpointRateLimiter.get(identifier) || [];
  const recentTimestamps = timestamps.filter(ts => ts > windowStart);

  if (recentTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    const oldestInWindow = Math.min(...recentTimestamps);
    const retryAfter = Math.ceil((oldestInWindow + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfter };
  }

  recentTimestamps.push(now);
  endpointRateLimiter.set(identifier, recentTimestamps);
  return { allowed: true };
}
```

### Job Processor Usage

Use the existing job processor infrastructure:

```typescript
import {
  createJobProcessor,
  type JobProcessingResult,
} from '@/lib/job-queue';

// Create processor instance for this request
const processor = createJobProcessor({
  enableLogging: process.env.NODE_ENV !== 'production',
  workerId: `api-${userId}-${Date.now()}`,
});

// Process jobs
const results: JobProcessingResult[] = [];
for (let i = 0; i < batchSize; i++) {
  const result = await processor.processNextJob();
  if (!result) break; // Queue empty
  results.push(result);
}
```

### Response Structure

All responses must follow the established pattern:

```typescript
// Success (200)
return NextResponse.json({
  success: true,
  data: { processedCount, successCount, failureCount, durationMs, processedJobIds }
}, { status: 200 });

// Rate limited (429)
return NextResponse.json({
  success: false,
  error: 'Rate limit exceeded. Maximum 10 requests per minute.',
  code: 'RATE_LIMITED'
}, {
  status: 429,
  headers: { 'Retry-After': String(retryAfter) }
});

// Client error (400, 401, 403)
return NextResponse.json({
  success: false,
  error: 'Descriptive error message',
  code: 'ERROR_CODE'
}, { status: statusCode });

// Server error (500)
return NextResponse.json({
  success: false,
  error: 'Internal server error',
  code: 'INTERNAL_ERROR'
}, { status: 500 });
```

---

## Acceptance Criteria Checklist

- [ ] Route handler file exists at `/src/app/api/admin/process-translations/route.ts`
- [ ] POST handler validates authentication using service role key or admin user session
- [ ] Unauthenticated requests return 401 status with error message
- [ ] Non-admin authenticated users return 403 status with error message
- [ ] Handler accepts optional `batchSize` parameter from request body
- [ ] Missing `batchSize` parameter defaults to 10 jobs
- [ ] `batchSize` values less than 1 or greater than 100 return 400 status with validation error
- [ ] Handler queries translation job queue for jobs with status 'queued'
- [ ] Query limits results to `batchSize` count
- [ ] Query orders jobs by priority descending then created_at ascending
- [ ] Handler processes each job through entity-type-specific processor
- [ ] Response includes `processedCount` field (total jobs attempted)
- [ ] Response includes `successCount` field (jobs completed successfully)
- [ ] Response includes `failureCount` field (jobs that failed)
- [ ] Response includes `durationMs` field (processing time in milliseconds)
- [ ] Response includes `processedJobIds` array (identifiers of all processed jobs)
- [ ] Handler returns 200 status even when queue is empty or all jobs fail
- [ ] Database errors return 500 status with generic error message
- [ ] Processing failure for one job does not halt processing of remaining jobs in batch
- [ ] Handler logs batch size, processing counts, and duration for operational monitoring
- [ ] Implementation respects concurrency limits for translation API calls
- [ ] Endpoint includes rate limiting (maximum 10 requests per minute per authenticated user)

---

## Error Handling Matrix

| Scenario | HTTP Status | Error Code | Error Message |
|----------|-------------|------------|---------------|
| Missing/invalid auth header | 401 | `UNAUTHORIZED` | "Invalid or missing authentication" |
| Non-admin user | 403 | `FORBIDDEN` | "Admin access required" |
| Rate limit exceeded | 429 | `RATE_LIMITED` | "Rate limit exceeded. Maximum 10 requests per minute." |
| Invalid JSON body | 400 | `INVALID_REQUEST` | "Invalid JSON in request body" |
| batchSize < 1 | 400 | `INVALID_PARAMETER` | "batchSize must be at least 1" |
| batchSize > 100 | 400 | `INVALID_PARAMETER` | "batchSize cannot exceed 100" |
| batchSize not integer | 400 | `INVALID_PARAMETER` | "batchSize must be an integer" |
| Database error | 500 | `DATABASE_ERROR` | "Database error occurred" |
| Unexpected error | 500 | `INTERNAL_ERROR` | "Internal server error" |

---

## Testing Notes

### Manual Testing

```bash
# Test with service role key (default batch size)
curl -X POST https://your-domain/api/admin/process-translations \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'

# Test with custom batch size
curl -X POST https://your-domain/api/admin/process-translations \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 5}'

# Test with admin session cookie
curl -X POST https://your-domain/api/admin/process-translations \
  -H "Content-Type: application/json" \
  -H "Cookie: <admin_session_cookie>" \
  -d '{"batchSize": 20}'

# Test rate limiting (run 11 times quickly)
for i in {1..11}; do
  echo "Request $i:"
  curl -s -X POST https://your-domain/api/admin/process-translations \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -d '{}'
  echo ""
done

# Test invalid batchSize
curl -X POST https://your-domain/api/admin/process-translations \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 150}'
```

### Expected Response Example

```json
{
  "success": true,
  "data": {
    "processedCount": 5,
    "successCount": 4,
    "failureCount": 1,
    "durationMs": 3542,
    "processedJobIds": [
      "job-abc-123",
      "job-def-456",
      "job-ghi-789",
      "job-jkl-012",
      "job-mno-345"
    ],
    "results": [
      {
        "jobId": "job-abc-123",
        "success": true,
        "entityType": "item",
        "entityId": "item-xyz-001",
        "targetLanguage": "fr",
        "processingTimeMs": 652
      },
      {
        "jobId": "job-def-456",
        "success": true,
        "entityType": "article",
        "entityId": "article-xyz-002",
        "targetLanguage": "es",
        "processingTimeMs": 721
      },
      {
        "jobId": "job-ghi-789",
        "success": false,
        "entityType": "link",
        "entityId": "link-xyz-003",
        "targetLanguage": "de",
        "processingTimeMs": 1203,
        "errorMessage": "Entity not found: link/link-xyz-003"
      }
    ]
  }
}
```

### Rate Limit Response Example

```json
{
  "success": false,
  "error": "Rate limit exceeded. Maximum 10 requests per minute.",
  "code": "RATE_LIMITED"
}
```

HTTP Headers:
```
HTTP/1.1 429 Too Many Requests
Retry-After: 45
Content-Type: application/json
```

---

## Dependencies

### Required Before Implementation

- [x] REQ-243: Translation Job Queue Module (provides job queue infrastructure)
- [x] REQ-244: Job Processor (provides processing logic)
- [x] REQ-245: Concurrency Control (provides stale job cleanup)

### Downstream Dependencies

- REQ-357 (Task 5.2): Railway Cron Job Setup (will invoke this endpoint)
- REQ-358 (Task 5.3): Job Monitoring Endpoint (related operational tooling)

---

## Security Considerations

1. **Authentication Required**: All requests must be authenticated via admin session or service role key
2. **Authorization Check**: Only admin users or service role can access
3. **Rate Limiting**: 10 requests per minute per user to prevent abuse and resource exhaustion
4. **Service Role Key Protection**: Key comparison uses constant-time comparison to prevent timing attacks
5. **Error Message Sanitization**: Database errors return generic messages without internal details
6. **Input Validation**: Strict validation of batchSize prevents resource exhaustion via large batches
7. **Logging**: All invocations logged with user identifier for audit trail

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Create route file structure | 5 min |
| Implement authentication | 20 min |
| Implement rate limiting | 25 min |
| Implement request validation | 15 min |
| Implement batch processing | 30 min |
| Implement logging | 15 min |
| Implement error handling | 15 min |
| Write unit tests | 45 min |
| Integration testing | 30 min |
| **Total** | **~3.5 hours** |

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Phase 5, Task 5.1)
- Request Document: `/docs/gen_requests_epic3.md` (REQ-356)
- Job Queue Module: `/src/lib/job-queue/`
- Auth Pattern Example: `/src/app/api/admin/translate/route.ts`
- Job Processor: `/src/lib/job-queue/job-processor.ts`
- Rate Limiter Reference: `/src/lib/translation-service/utils/rate-limiter.ts`
- Admin Items API Pattern: `/src/app/api/admin/items/route.ts`

---

*Implementation overview generated for FAQBNB Localization Epic 3 - Phase 5: Job Processing Trigger Setup*
