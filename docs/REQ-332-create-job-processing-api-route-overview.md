# REQ-332: Create Job Processing API Route - Implementation Overview

**Document Created:** 2026-01-18
**Document Last Modified:** 2026-01-18
**Request Type:** NEW FEATURE
**Size:** M
**Phase:** 5 - Job Processing Trigger Setup
**Task ID:** 5.1
**Epic:** L10N Epic 3 - Dynamic Content Translation

---

## 1. Summary

Create an administrative API endpoint at `/src/app/api/admin/process-translations/route.ts` that allows administrators to manually trigger translation job processing with configurable batch sizes. The endpoint provides operational control over queue execution and returns comprehensive processing statistics.

---

## 2. Current Behavior

- Translation jobs are queued automatically when content is created or updated
- No administrative endpoint exists to manually trigger job processing on demand
- Administrators cannot control when queued translation jobs are executed
- No ability to adjust processing batch sizes based on current system load
- No way to manually initiate translation job processing outside of automatic scheduled execution

---

## 3. Expected Behavior

When a POST request is made to `/api/admin/process-translations`:

1. **Authentication**: Validate requesting user has service role key or administrator permissions
2. **Batch Size**: Accept optional `batchSize` parameter (default: 10, range: 1-100)
3. **Cleanup**: Invoke stale job cleanup utility before selecting jobs
4. **Job Selection**: Query translation job queue for up to `batchSize` jobs with status `queued`, ordered by priority DESC and created_at ASC
5. **Processing**: For each job, examine `entityType` and invoke the appropriate processor function (item, article, link, tag)
6. **Status Updates**: Update job status to `processing` before invoking processors, then to `completed` or `failed` after
7. **Statistics**: Return comprehensive processing statistics including counts, duration, and job IDs

---

## 4. Technical Approach

### 4.1 Route Structure

```typescript
// /src/app/api/admin/process-translations/route.ts
export async function POST(request: NextRequest) {
  // 1. Validate authentication (service role or admin)
  // 2. Parse and validate batchSize parameter
  // 3. Run stale job cleanup
  // 4. Select queued jobs (ordered by priority, created_at)
  // 5. Process each job with appropriate entity processor
  // 6. Track success/failure counts and timing
  // 7. Return statistics response
}
```

### 4.2 Authentication Pattern

Follow existing `validateAdminAuth` pattern from `/src/lib/auth-server.ts` with additional service role key check:

```typescript
// Check for service role key in Authorization header
const authHeader = request.headers.get('Authorization');
if (authHeader?.startsWith('Bearer ')) {
  const token = authHeader.slice(7);
  if (token === process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // Service role access granted
  }
}

// Otherwise, validate admin user session
const authResult = await validateAdminAuth(request);
if (authResult.error) return authResult.error;
if (!authResult.isAdmin && !authResult.isSysAdmin) {
  return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
}
```

### 4.3 Response Format

```typescript
interface ProcessTranslationsResponse {
  success: boolean;
  processedCount: number;      // Total jobs attempted
  successCount: number;        // Jobs completed successfully
  failureCount: number;        // Jobs that failed during processing
  cleanupCount: number;        // Stale jobs recovered before processing
  durationMs: number;          // Processing time in milliseconds
  processedJobIds: string[];   // IDs of all processed jobs
  error?: string;              // Error message if request failed
}
```

### 4.4 Job Processing Flow

```
1. Cleanup stale jobs (stuck in 'processing' > 5 min)
   ↓
2. SELECT id, entity_type, entity_id, source_language, target_language
   FROM translation_jobs
   WHERE status = 'queued'
   ORDER BY priority DESC, created_at ASC
   LIMIT {batchSize}
   FOR UPDATE SKIP LOCKED
   ↓
3. For each job:
   a. UPDATE status = 'processing', started_at = now()
   b. Switch on entity_type:
      - 'item' → processItemTranslation()
      - 'article' → processArticleTranslation()
      - 'link' → processLinkTranslation()
      - 'tag' → processTagTranslation()
   c. On success: UPDATE status = 'completed', completed_at = now()
   d. On failure: UPDATE status = 'failed', error_message = ?
   ↓
4. Return statistics
```

---

## 5. Dependencies

### 5.1 Required Dependencies (from Implementation Plan)

| Dependency | REQ | Status | Notes |
|------------|-----|--------|-------|
| Enhanced Translation Job Processor | REQ-271 | Pending | Entity-specific processing workflows |
| Item Translation Processor | REQ-272 | Pending | Processes item translations |
| Article Translation Processor | REQ-273 | Pending | Processes article translations |
| Link Translation Processor | REQ-274 | Pending | Processes link translations |
| Tag Translation Processor | REQ-275 | Pending | Processes tag translations |
| Job Prioritization | REQ-276 | Pending | Priority-based queue ordering |
| Concurrency Control | REQ-277 | Pending | Manages concurrent API calls |
| Stale Job Cleanup | REQ-278 | Pending | Cleanup utility for stuck jobs |

### 5.2 Existing Infrastructure

| Component | Location | Status |
|-----------|----------|--------|
| Admin Auth Validation | `/src/lib/auth-server.ts` | ✅ Exists |
| Supabase Admin Client | `/src/lib/supabase.ts` | ✅ Exists |
| Translation Jobs Table | Database | ✅ Exists (REQ-227) |
| TypeScript Types for Jobs | `/src/lib/supabase.ts` | ✅ Exists |

---

## 6. Implementation Tasks

### Task 6.1: Create Route Handler File
**File:** `/src/app/api/admin/process-translations/route.ts`
**Effort:** S

Create the basic route handler structure with:
- Import statements for Next.js, Supabase, and auth utilities
- POST handler function skeleton
- Response type definitions

### Task 6.2: Implement Authentication Logic
**Effort:** XS

Add dual authentication support:
- Service role key validation via Authorization header
- Admin user session validation via `validateAdminAuth`
- Return 401 for unauthenticated, 403 for non-admin users

### Task 6.3: Implement Request Validation
**Effort:** XS

Validate request body:
- Parse optional `batchSize` parameter
- Default to 10 if not provided
- Validate range 1-100, return 400 if invalid

### Task 6.4: Implement Stale Job Cleanup Integration
**Effort:** S

Before job selection:
- Call cleanup utility (when REQ-278 is implemented)
- Track cleanup count for response
- Stub cleanup function if not yet available

### Task 6.5: Implement Job Selection Query
**Effort:** S

Query translation_jobs table:
- Select jobs with status = 'queued'
- Order by priority DESC, created_at ASC
- Limit to batchSize
- Use `FOR UPDATE SKIP LOCKED` pattern for concurrency

### Task 6.6: Implement Job Processing Loop
**Effort:** M

For each selected job:
- Update status to 'processing' with started_at timestamp
- Determine entity type and call appropriate processor
- Track processing time per job
- Handle errors gracefully, continue with remaining jobs
- Update final status (completed/failed)

### Task 6.7: Implement Statistics Aggregation
**Effort:** XS

Collect and return:
- Total processed count
- Success and failure counts
- Total duration in milliseconds
- Array of processed job IDs
- Cleanup count from pre-processing step

### Task 6.8: Add Rate Limiting
**Effort:** S

Implement rate limiting:
- Max 10 requests per minute per user
- Use in-memory counter or Redis if available
- Return 429 Too Many Requests when exceeded

### Task 6.9: Add Logging
**Effort:** XS

Log processing operations:
- Batch size requested
- Jobs selected count
- Success/failure counts
- Total duration
- Any errors encountered

---

## 7. Authorized Files and Functions for Modification

### 7.1 Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/admin/process-translations/route.ts` | Main API route handler |

### 7.2 Files to Potentially Modify

| File Path | Modification | Reason |
|-----------|--------------|--------|
| `/src/lib/auth-server.ts` | Add service role validation helper | Optional: Extract reusable service role check |
| `/src/types/index.ts` | Add ProcessTranslationsResponse type | Type definitions for response |

### 7.3 Functions to Implement

| Function | Location | Purpose |
|----------|----------|---------|
| `POST` | `route.ts` | Main handler function |
| `validateServiceRoleOrAdmin` | `route.ts` or `auth-server.ts` | Authentication helper |
| `selectQueuedJobs` | `route.ts` | Query pending jobs |
| `processJob` | `route.ts` | Process individual translation job |
| `updateJobStatus` | `route.ts` | Update job status in database |

### 7.4 External Dependencies (to be created by other REQs)

| Function | Source REQ | Purpose |
|----------|------------|---------|
| `cleanupStaleJobs()` | REQ-278 | Cleanup utility |
| `processItemTranslation()` | REQ-272 | Item processor |
| `processArticleTranslation()` | REQ-273 | Article processor |
| `processLinkTranslation()` | REQ-274 | Link processor |
| `processTagTranslation()` | REQ-275 | Tag processor |

---

## 8. Database Interactions

### 8.1 Tables Accessed

| Table | Operation | Purpose |
|-------|-----------|---------|
| `translation_jobs` | SELECT | Retrieve queued jobs |
| `translation_jobs` | UPDATE | Update job status |

### 8.2 SQL Queries

**Select Queued Jobs:**
```sql
SELECT id, entity_type, entity_id, source_language, target_language, priority
FROM translation_jobs
WHERE status = 'queued'
ORDER BY priority DESC, created_at ASC
LIMIT $1
FOR UPDATE SKIP LOCKED;
```

**Update Job to Processing:**
```sql
UPDATE translation_jobs
SET status = 'processing', started_at = now()
WHERE id = $1;
```

**Update Job to Completed:**
```sql
UPDATE translation_jobs
SET status = 'completed', completed_at = now()
WHERE id = $1;
```

**Update Job to Failed:**
```sql
UPDATE translation_jobs
SET status = 'failed', error_message = $2, completed_at = now()
WHERE id = $1;
```

---

## 9. Acceptance Criteria Mapping

| Acceptance Criteria | Implementation Task | Status |
|---------------------|---------------------|--------|
| Route handler created at specified path | Task 6.1 | Pending |
| Service role/admin auth validation | Task 6.2 | Pending |
| 401 for unauthenticated requests | Task 6.2 | Pending |
| 403 for non-admin users | Task 6.2 | Pending |
| Optional batchSize parameter | Task 6.3 | Pending |
| Default batchSize of 10 | Task 6.3 | Pending |
| Validate batchSize range 1-100 | Task 6.3 | Pending |
| Invoke stale job cleanup before processing | Task 6.4 | Pending |
| Query jobs ordered by priority DESC, created_at ASC | Task 6.5 | Pending |
| Invoke appropriate processor per entityType | Task 6.6 | Pending |
| Track success count | Task 6.7 | Pending |
| Track failure count | Task 6.7 | Pending |
| Track processing duration | Task 6.7 | Pending |
| Return processedJobIds array | Task 6.7 | Pending |
| Return cleanupCount | Task 6.7 | Pending |
| 200 OK even when no jobs queued | Task 6.6 | Pending |
| Rate limiting (10 req/min) | Task 6.8 | Pending |
| Individual job errors don't halt batch | Task 6.6 | Pending |
| Update job status before/after processing | Task 6.6 | Pending |
| Log processing operations | Task 6.9 | Pending |

---

## 10. Testing Strategy

### 10.1 Unit Tests

- Test authentication validation (service role and admin)
- Test batchSize validation and defaults
- Test job selection query construction
- Test statistics aggregation logic

### 10.2 Integration Tests

- Test with valid service role key
- Test with valid admin session
- Test with invalid/missing authentication
- Test with non-admin user (should get 403)
- Test batchSize parameter handling
- Test with empty job queue
- Test with jobs in queue
- Test rate limiting behavior

### 10.3 E2E Tests

- Create items/articles → verify jobs queued → call process-translations → verify jobs completed
- Test retry of failed jobs
- Test cleanup of stale jobs

---

## 11. Security Considerations

1. **Authentication**: Dual authentication (service role OR admin user)
2. **Authorization**: Only admin users or service role can trigger processing
3. **Rate Limiting**: Max 10 requests per minute per user to prevent abuse
4. **Input Validation**: Strict batchSize validation (1-100 range)
5. **Error Handling**: Generic error messages to avoid information disclosure
6. **Logging**: Audit trail of processing operations

---

## 12. Error Handling

| Error Condition | HTTP Status | Error Code | Message |
|-----------------|-------------|------------|---------|
| Missing/invalid auth | 401 | UNAUTHORIZED | Invalid or expired token |
| Non-admin user | 403 | FORBIDDEN | Access denied |
| Invalid batchSize | 400 | BAD_REQUEST | batchSize must be between 1 and 100 |
| Rate limit exceeded | 429 | TOO_MANY_REQUESTS | Rate limit exceeded. Try again later. |
| Database error | 500 | INTERNAL_ERROR | Internal server error |

---

## 13. Example Request/Response

### Request
```http
POST /api/admin/process-translations
Authorization: Bearer <service_role_key or session_token>
Content-Type: application/json

{
  "batchSize": 20
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "processedCount": 20,
  "successCount": 18,
  "failureCount": 2,
  "cleanupCount": 1,
  "durationMs": 4523,
  "processedJobIds": [
    "job-abc-123",
    "job-def-456",
    "..."
  ]
}
```

### No Jobs Response (200 OK)
```json
{
  "success": true,
  "processedCount": 0,
  "successCount": 0,
  "failureCount": 0,
  "cleanupCount": 0,
  "durationMs": 45,
  "processedJobIds": []
}
```

### Error Response (403 Forbidden)
```json
{
  "success": false,
  "error": "Access denied",
  "code": "FORBIDDEN"
}
```

---

## 14. References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Phase 5, Task 5.1)
- **Request Document:** `/docs/gen_requests_epic3.md` (REQ-332)
- **Related REQs:** REQ-271 through REQ-278 (job processing infrastructure)
- **Auth Pattern:** `/src/lib/auth-server.ts` (validateAdminAuth)
- **API Pattern:** `/src/app/api/admin/items/route.ts` (POST handler example)

---

## 15. Open Questions

1. **Concurrency Control Integration**: Should concurrency limits (REQ-277) be enforced within this endpoint or handled at the processor level?
   - *Recommendation:* Handle at processor level for better separation of concerns

2. **Rate Limiting Storage**: Should rate limiting use in-memory storage or Redis?
   - *Recommendation:* Start with in-memory, can migrate to Redis later if needed

3. **Processor Stubs**: If entity processors (REQ-272-275) are not yet implemented, should we:
   - Skip jobs of that type?
   - Fail jobs with "processor not available" error?
   - *Recommendation:* Log warning and skip, return count of skipped jobs
