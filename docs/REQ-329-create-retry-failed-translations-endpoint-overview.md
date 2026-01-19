# REQ-329: Create Retry Failed Translations Endpoint - Implementation Overview

**Document Created:** 2026-01-18
**Last Modified:** 2026-01-18
**Request ID:** REQ-329
**Epic:** L10N Epic 3 - Dynamic Content Translation
**Phase:** 4 - Translation Status & Management APIs
**Task ID:** 4.2
**Size:** M (Medium)
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`

---

## 1. Summary

Create a RESTful API endpoint that allows property owners and administrators to retry translation jobs that previously failed. This enables self-service recovery from temporary translation service disruptions (network timeouts, rate limiting, service outages) without requiring content recreation or manual support intervention.

---

## 2. Current Behavior

- When translation jobs fail due to temporary issues (service outages, network timeouts, rate limiting), they remain in `failed` status indefinitely
- No user-accessible mechanism exists to retry failed translations
- Property owners must delete and recreate content or contact support to trigger new translation jobs
- Failed jobs have no path to recovery, creating poor user experience and increased support burden

---

## 3. Expected Behavior

When a POST request is made to `/api/translations/retry`:

1. **Request Validation:**
   - Accept `entityType`, `entityId`, and optional `languages[]` in request body
   - Validate `entityType` is one of: `item`, `article`, `link`, `tag`
   - Validate `entityId` is a valid UUID format
   - If `languages[]` provided, validate each is a supported language code

2. **Entity Verification:**
   - Query the database to confirm the entity exists
   - Return 404 if entity not found

3. **Failed Job Selection:**
   - Query `translation_jobs` table for jobs matching:
     - `entity_type` = provided entityType
     - `entity_id` = provided entityId
     - `status` = 'failed'
   - If `languages[]` array is provided, filter to only those target languages
   - If `languages[]` is omitted or empty, select all failed jobs for the entity

4. **Job Reset:**
   - For each failed job identified:
     - Update `status` from 'failed' to 'queued'
     - Reset `attempts` counter to 0
     - Clear `error_message` field
     - Leave `created_at` unchanged (preserves original queue time)
     - Clear `started_at` and `completed_at`

5. **Response:**
   - Return count of jobs re-queued (`retriedCount`)
   - Include array of re-queued job details: `{ jobId, languageCode, previousAttempts }`
   - Return 200 OK with `retriedCount: 0` if no failed jobs found (not an error)

---

## 4. Technical Approach

### 4.1 API Route Structure

**File:** `/src/app/api/translations/retry/route.ts`

```typescript
// POST /api/translations/retry
// Request Body:
interface RetryTranslationRequest {
  entityType: 'item' | 'article' | 'link' | 'tag';
  entityId: string;
  languages?: string[];  // Optional: specific languages to retry
}

// Response:
interface RetryTranslationResponse {
  success: boolean;
  retriedCount: number;
  jobs: Array<{
    jobId: string;
    languageCode: string;
    previousAttempts: number;
  }>;
  error?: string;
}
```

### 4.2 Authentication & Authorization

- Use existing `validateAdminAuth()` pattern from `/src/lib/auth-server.ts`
- Verify user has access to the entity (via account ownership or admin status)
- Pattern follows existing admin API routes

### 4.3 Database Operations

Query to find failed jobs:
```sql
SELECT id, target_language, attempts
FROM translation_jobs
WHERE entity_type = $1
  AND entity_id = $2
  AND status = 'failed'
  [AND target_language = ANY($3)]  -- if languages[] provided
```

Update to re-queue jobs:
```sql
UPDATE translation_jobs
SET status = 'queued',
    attempts = 0,
    error_message = NULL,
    started_at = NULL,
    completed_at = NULL
WHERE id = ANY($1)
RETURNING id, target_language, attempts
```

### 4.4 Supported Languages Reference

From implementation plan, supported languages are:
- `en` (English)
- `fr` (French)
- `es` (Spanish)
- `de` (German)
- `nl` (Dutch)
- `it` (Italian)

---

## 5. Acceptance Criteria

- [ ] A route handler file is created at `/src/app/api/translations/retry/route.ts`
- [ ] The POST handler accepts `entityType`, `entityId`, and optional `languages[]` in request body
- [ ] The handler validates `entityType` is one of: `item`, `article`, `link`, `tag`
- [ ] Invalid `entityType` values return 400 Bad Request with descriptive error message
- [ ] Missing `entityId` returns 400 Bad Request with descriptive error message
- [ ] The handler queries the database to verify the entity exists before proceeding
- [ ] Non-existent entities return 404 Not Found with descriptive error message
- [ ] The handler queries the translation job queue to find all jobs matching `entityType` and `entityId` with status `failed`
- [ ] When `languages[]` array is provided, only failed jobs matching the specified language codes are selected
- [ ] When `languages[]` array is omitted or empty, all failed jobs for the entity are selected
- [ ] For each selected failed job, the handler updates status to `queued`
- [ ] For each selected failed job, the handler resets the attempt counter to 0
- [ ] For each selected failed job, the handler clears previous error metadata from the job record
- [ ] The response includes a `retriedCount` field indicating the total number of jobs re-queued
- [ ] The response includes a `jobs` array with objects containing `jobId`, `languageCode`, and `previousAttempts` for each re-queued job
- [ ] The handler returns 200 OK with `retriedCount` of 0 when no failed jobs are found matching the criteria
- [ ] Database update errors return 500 Internal Server Error with generic error message
- [ ] The implementation integrates with authentication middleware to verify user access to the entity
- [ ] The handler logs retry operations including entity details and count of re-queued jobs for monitoring
- [ ] Re-queued jobs are processed according to normal priority and queue ordering rules
- [ ] The endpoint validates that the `languages[]` array contains only valid supported language codes when provided

---

## 6. Implementation Tasks

### Task 1: Create API Route File Structure
**File:** `/src/app/api/translations/retry/route.ts`
- Create the route file with TypeScript interfaces for request/response
- Add necessary imports from auth and database modules
- Define supported entity types and languages as constants

### Task 2: Implement Request Validation
- Parse and validate request body
- Check `entityType` against allowed values: `['item', 'article', 'link', 'tag']`
- Validate `entityId` is a valid UUID format
- If `languages[]` provided, validate each is in supported languages list
- Return 400 Bad Request for validation failures

### Task 3: Implement Authentication & Authorization
- Call `validateAdminAuth(request)` to verify user session
- Return 401/403 errors following existing patterns
- Verify user has access to the entity (account ownership check)

### Task 4: Implement Entity Existence Check
- Query appropriate entity table based on `entityType`:
  - `item` -> `items` table
  - `article` -> `item_articles` table
  - `link` -> `item_links` table
  - `tag` -> `tags` table
- Return 404 Not Found if entity doesn't exist

### Task 5: Implement Failed Job Query
- Query `translation_jobs` table for matching failed jobs
- Apply language filter if `languages[]` provided
- Return early with `{ retriedCount: 0, jobs: [] }` if no failed jobs found

### Task 6: Implement Job Reset Logic
- Update each failed job: status='queued', attempts=0, error_message=NULL
- Clear `started_at` and `completed_at` timestamps
- Capture `previousAttempts` before reset for response

### Task 7: Implement Response & Logging
- Build response with `retriedCount` and `jobs` array
- Log retry operations with entity details and job count
- Return successful response

### Task 8: Add Error Handling
- Wrap database operations in try/catch
- Return 500 Internal Server Error for unexpected failures
- Log errors with context for debugging

---

## 7. Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/translations/retry/route.ts` | Main API route handler for retry endpoint |

### Existing Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/auth-server.ts` | `validateAdminAuth()` function for authentication |
| `/src/lib/supabase.ts` | Database types and `createSupabaseServer()` |
| `/src/app/api/admin/items/route.ts` | Reference pattern for POST validation and auth |
| `/src/app/api/admin/access-requests/[requestId]/route.ts` | Reference pattern for status update operations |

### Database Tables Accessed

| Table | Operation | Purpose |
|-------|-----------|---------|
| `translation_jobs` | SELECT, UPDATE | Find and reset failed translation jobs |
| `items` | SELECT | Verify item entity exists |
| `item_articles` | SELECT | Verify article entity exists |
| `item_links` | SELECT | Verify link entity exists |
| `tags` | SELECT | Verify tag entity exists |

---

## 8. Dependencies

### Required Before Implementation

| Dependency | Source | Status |
|------------|--------|--------|
| `translation_jobs` table | Epic 1 / REQ-227 | Required - must exist with `status`, `attempts`, `error_message` columns |
| `validateAdminAuth()` function | `/src/lib/auth-server.ts` | Required - existing |
| Supabase client helpers | `/src/lib/supabase.ts` | Required - existing |

### Downstream Dependencies

| Component | Description |
|-----------|-------------|
| Job processor | Re-queued jobs will be picked up by the translation job processor (Epic 3, Phase 3) |
| Translation status API | Status endpoint (REQ-328) will reflect re-queued job status |

---

## 9. API Contract

### Request

```http
POST /api/translations/retry
Content-Type: application/json
Authorization: Bearer <token>

{
  "entityType": "item",
  "entityId": "550e8400-e29b-41d4-a716-446655440000",
  "languages": ["fr", "de"]  // Optional
}
```

### Response - Success (Jobs Re-queued)

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "retriedCount": 2,
  "jobs": [
    {
      "jobId": "job-abc-123",
      "languageCode": "fr",
      "previousAttempts": 3
    },
    {
      "jobId": "job-def-456",
      "languageCode": "de",
      "previousAttempts": 2
    }
  ]
}
```

### Response - Success (No Failed Jobs Found)

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "retriedCount": 0,
  "jobs": []
}
```

### Response - Validation Error

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "success": false,
  "error": "Invalid entityType. Must be one of: item, article, link, tag"
}
```

### Response - Entity Not Found

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "success": false,
  "error": "Item not found"
}
```

### Response - Unauthorized

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "success": false,
  "error": "Invalid or expired token",
  "code": "UNAUTHORIZED"
}
```

---

## 10. Error Handling

| Error Condition | HTTP Status | Error Message |
|-----------------|-------------|---------------|
| Missing entityType | 400 | "Missing required field: entityType" |
| Invalid entityType | 400 | "Invalid entityType. Must be one of: item, article, link, tag" |
| Missing entityId | 400 | "Missing required field: entityId" |
| Invalid entityId format | 400 | "Invalid entityId format. Must be a valid UUID" |
| Invalid language code | 400 | "Invalid language code: {code}. Supported: en, fr, es, de, nl, it" |
| Entity not found | 404 | "{EntityType} not found" |
| No auth token | 401 | "Invalid or expired token" |
| User not authorized | 403 | "Access denied to this entity" |
| Database error | 500 | "Internal server error" |

---

## 11. Testing Considerations

### Unit Tests

1. **Request Validation Tests**
   - Test with missing entityType
   - Test with invalid entityType value
   - Test with missing entityId
   - Test with invalid UUID format
   - Test with invalid language codes in array
   - Test with valid request body

2. **Entity Existence Tests**
   - Test with non-existent item
   - Test with non-existent article
   - Test with non-existent link
   - Test with non-existent tag
   - Test with existing entity

3. **Job Query Tests**
   - Test with no failed jobs (returns retriedCount: 0)
   - Test with failed jobs for all languages
   - Test with failed jobs for specific languages
   - Test language filter applies correctly

4. **Job Reset Tests**
   - Verify status changes from 'failed' to 'queued'
   - Verify attempts reset to 0
   - Verify error_message cleared
   - Verify previousAttempts captured correctly

### Integration Tests

1. Create item -> fail translations -> call retry -> verify jobs re-queued
2. Retry with specific languages filter -> verify only those languages reset
3. Retry when no failed jobs exist -> verify 200 OK with retriedCount: 0
4. Verify re-queued jobs are picked up by job processor

---

## 12. Logging Requirements

Log the following events:

1. **Retry Request Received**
   ```
   [INFO] Translation retry requested: entityType={type}, entityId={id}, languages={languages|all}
   ```

2. **Failed Jobs Found**
   ```
   [INFO] Found {count} failed translation jobs for {entityType}/{entityId}
   ```

3. **Jobs Re-queued**
   ```
   [INFO] Re-queued {count} translation jobs for {entityType}/{entityId}: {jobIds}
   ```

4. **No Failed Jobs**
   ```
   [INFO] No failed translation jobs found for {entityType}/{entityId}
   ```

5. **Errors**
   ```
   [ERROR] Translation retry failed: {error}, entityType={type}, entityId={id}
   ```

---

## 13. Security Considerations

1. **Authentication:** All requests must include valid auth token
2. **Authorization:** Verify user has access to the entity (account ownership or admin status)
3. **Input Validation:** Sanitize all inputs, validate UUID format, validate enum values
4. **Rate Limiting:** Consider adding rate limiting to prevent abuse (e.g., max 10 retries per minute per user)
5. **Audit Trail:** Log all retry operations for security auditing

---

## 14. References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- Request Definition: `/docs/gen_requests_epic3.md` (REQ-329)
- Related: REQ-328 (Translation Status API)
- Related: REQ-260 (Content Translation Orchestrator)
- Related: REQ-264 (Translation Status Utilities)

---

## 15. Revision History

| Date | Author | Changes |
|------|--------|---------|
| 2026-01-18 | Tech Lead Agent | Initial document creation |
