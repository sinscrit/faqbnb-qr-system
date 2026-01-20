# REQ-E03-022: Create Retry Failed Translations Endpoint - Implementation Overview

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E03-022
**Epic:** L10N Epic 3 - Dynamic Content Translation
**Phase:** 4 - Translation Status & Management APIs
**Task ID:** 4.2
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
**Estimated Size:** M (Medium)

---

## 1. Summary

This document provides an implementation breakdown for creating a POST API endpoint that allows property owners to manually retry failed translation jobs for specific content entities and languages. The endpoint will reset failed jobs to `queued` status with reset attempt counters, enabling automatic re-processing by the translation job processor.

---

## 2. Requirements Recap

From REQ-E03-022 in `gen_requests_epic3.md`:

### Expected Behavior

A POST endpoint that:
- Accepts `entityType`, `entityId`, and optional `languages[]` as parameters
- Finds failed translation jobs for the specified entity
- Resets job status from `failed` to `queued` and resets attempt count to 0
- Clears error messages and processing worker identifiers
- Updates `status_updated_at` timestamp
- Executes all updates within a database transaction
- Returns count of jobs re-queued and affected language codes

### Key Acceptance Criteria

- POST endpoint accepting entityType and entityId parameters
- Optional languages array to limit retry scope
- Validates entityType against supported types (item, article, link, tag)
- Returns 400 for invalid entity types, 404 for non-existent entities
- Resets failed jobs: status='queued', retry_count=0, cleared error_message
- Transaction-based updates with rollback on failure
- Returns summary with count, affected languages, timestamp
- Idempotent operation (safe to call multiple times)
- Does not modify jobs in queued, processing, or completed states

---

## 3. Technical Context

### Existing Patterns to Follow

| Pattern | File | Usage |
|---------|------|-------|
| API auth validation | `/src/lib/auth-server.ts` | `validateAdminAuth()` for user authentication |
| Job queue operations | `/src/lib/job-queue/translation-jobs.ts` | Existing job query/update functions |
| Job types | `/src/lib/job-queue/translation-jobs.types.ts` | `EntityType`, `JobStatus`, `TranslationJob` |
| Database admin client | `/src/lib/supabase.ts` | `supabaseAdmin` for server operations |
| API response pattern | `/src/app/api/admin/articles/route.ts` | Standard response structure |

### Database Schema (from Epic 1)

The `translation_jobs` table already exists with relevant columns:
- `id`, `entity_type`, `entity_id`
- `source_language`, `target_language`
- `status` (queued | processing | completed | failed)
- `attempts`, `error_message`
- `locked_by`, `locked_at`
- `created_at`, `started_at`, `completed_at`

### Integration Points

- **Job Queue Module:** Uses existing `getJobsByEntity()` and `updateJobStatus()` functions
- **Auth System:** Leverages `validateAdminAuth()` for endpoint protection
- **Supabase Admin Client:** Direct database operations via `supabaseAdmin`

---

## 4. Architecture

### Endpoint Route Structure

```
/src/app/api/translations/retry/route.ts
  └── POST handler
      ├── Authentication validation
      ├── Request body parsing
      ├── Entity validation
      ├── Failed jobs query
      ├── Batch status reset (transaction)
      └── Response formatting
```

### Request/Response Contracts

**Request Body:**
```typescript
interface RetryTranslationRequest {
  entityType: EntityType;       // 'item' | 'article' | 'link' | 'tag'
  entityId: string;             // UUID of the entity
  languages?: SupportedLanguage[]; // Optional: specific languages to retry
}
```

**Response Payload:**
```typescript
interface RetryTranslationResponse {
  success: boolean;
  data?: {
    jobsRequeued: number;           // Total count reset
    affectedLanguages: string[];    // Languages that were retried
    perLanguageCounts: Record<string, number>; // Breakdown by language
    timestamp: string;              // ISO timestamp of operation
    entityType: string;             // Echoed from request
    entityId: string;               // Echoed from request
  };
  error?: string;
  code?: string;
}
```

### Data Flow

```
1. POST /api/translations/retry
   └─> Parse request body

2. Validate authentication
   └─> validateAdminAuth(request)

3. Validate entityType
   └─> Check against ['item', 'article', 'link', 'tag']
   └─> Return 400 if invalid

4. Verify entity exists
   └─> Query appropriate table based on entityType
   └─> Return 404 if not found

5. Query failed jobs
   └─> SELECT from translation_jobs WHERE:
       - entity_type = entityType
       - entity_id = entityId
       - status = 'failed'
       - (AND target_language IN languages[] if provided)

6. Reset jobs (transaction)
   └─> UPDATE translation_jobs SET:
       - status = 'queued'
       - attempts = 0
       - error_message = NULL
       - locked_by = NULL
       - locked_at = NULL
       - started_at = NULL (cleared to allow fresh start)

7. Return success response
   └─> jobsRequeued: count
   └─> affectedLanguages: unique language codes
   └─> timestamp: ISO string
```

---

## 5. Implementation Tasks

### Task 5.1: Create Directory Structure
- Create `/src/app/api/translations/` directory if not exists
- Create `/src/app/api/translations/retry/` directory

### Task 5.2: Define Request/Response Types
- Add `RetryTranslationRequest` interface
- Add `RetryTranslationResponse` interface
- Consider adding to `/src/types/index.ts` or local types file

### Task 5.3: Implement Entity Validation Helper
- Create helper function to validate entity existence by type
- Query `items`, `item_articles`, `item_links`, or check tag existence based on entityType

### Task 5.4: Implement POST Handler
- Authentication validation using `validateAdminAuth()`
- Request body parsing and validation
- EntityType validation against supported types
- Entity existence check
- Failed jobs query with optional language filter
- Batch update within transaction
- Success/error response formatting

### Task 5.5: Add Authorization Check
- Verify user has access to the entity's account/property
- Check account ownership through property chain for items/articles/links

### Task 5.6: Write Unit Tests
- Test valid retry request with all languages
- Test retry with specific language filter
- Test 400 response for invalid entityType
- Test 404 response for non-existent entity
- Test idempotency (calling with no failed jobs)
- Test transaction rollback on error

---

## 6. Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/translations/retry/route.ts` | Main endpoint implementation with POST handler |

### Files to Potentially Modify

| File Path | Modification Scope |
|-----------|-------------------|
| `/src/types/index.ts` | Add `RetryTranslationRequest`, `RetryTranslationResponse` types |
| `/src/lib/job-queue/translation-jobs.ts` | May add `resetFailedJobs()` utility function |
| `/src/lib/job-queue/translation-jobs.types.ts` | May add types for retry operations |

### Functions to Implement

| Function | File | Purpose |
|----------|------|---------|
| `POST` | `/src/app/api/translations/retry/route.ts` | Main endpoint handler |
| `validateEntityExists()` | `/src/app/api/translations/retry/route.ts` | Helper to check entity in DB |
| `resetFailedJobs()` | `/src/lib/job-queue/translation-jobs.ts` | Optional: reusable job reset utility |

### Existing Functions to Use (No Modification)

| Function | File | Usage |
|----------|------|-------|
| `validateAdminAuth()` | `/src/lib/auth-server.ts` | User authentication |
| `getJobsByEntity()` | `/src/lib/job-queue/translation-jobs.ts` | Query jobs for entity |
| `supabaseAdmin` | `/src/lib/supabase.ts` | Database operations |

---

## 7. Edge Cases and Error Handling

### Error Scenarios

| Scenario | HTTP Code | Response |
|----------|-----------|----------|
| Invalid entityType | 400 | `{ success: false, error: 'Invalid entity type', code: 'INVALID_ENTITY_TYPE' }` |
| Missing entityType or entityId | 400 | `{ success: false, error: 'Missing required fields', code: 'VALIDATION_ERROR' }` |
| Entity not found | 404 | `{ success: false, error: 'Entity not found', code: 'NOT_FOUND' }` |
| No authentication | 401 | `{ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }` |
| Access denied | 403 | `{ success: false, error: 'Access denied', code: 'FORBIDDEN' }` |
| Database error | 500 | `{ success: false, error: 'Internal server error', code: 'DATABASE_ERROR' }` |

### Edge Cases

1. **No failed jobs exist:** Return success with `jobsRequeued: 0` and empty `affectedLanguages`
2. **Invalid language codes in filter:** Silently ignore invalid codes, only filter by valid ones
3. **All jobs already requeued:** Idempotent - return success with count 0
4. **Partial language filter:** Only retry specified languages, leave others unchanged
5. **Entity exists but no jobs ever created:** Return success with count 0

---

## 8. Testing Strategy

### Unit Tests

```typescript
describe('POST /api/translations/retry', () => {
  it('should return 400 for invalid entityType');
  it('should return 400 for missing required fields');
  it('should return 404 for non-existent entity');
  it('should return 401 for unauthenticated request');
  it('should reset all failed jobs when languages not specified');
  it('should reset only specified languages when filter provided');
  it('should return success with count 0 when no failed jobs exist');
  it('should be idempotent - safe to call multiple times');
  it('should clear error_message when resetting jobs');
  it('should reset attempts to 0');
  it('should not affect jobs in queued/processing/completed states');
});
```

### Integration Tests

- Create item with translations that fail
- Call retry endpoint
- Verify jobs are now in queued state
- Run job processor
- Verify translations complete

---

## 9. Security Considerations

1. **Authentication Required:** Endpoint must validate user session via `validateAdminAuth()`
2. **Authorization Check:** Verify user has access to the entity's account
3. **Input Validation:** Validate entityType against enum, sanitize entityId
4. **No SQL Injection:** Use parameterized queries via Supabase client
5. **Rate Limiting:** Consider adding rate limits to prevent abuse

---

## 10. Performance Considerations

1. **Batch Updates:** Use single UPDATE query with IN clause for multiple jobs
2. **Indexed Queries:** Rely on existing indexes on `entity_type`, `entity_id`, `status`
3. **Transaction Scope:** Keep transaction minimal to reduce lock duration
4. **Response Time Target:** < 2 seconds for typical retry operations

---

## 11. Dependencies

### Required Before Implementation

- Epic 1 translation job infrastructure complete
- `translation_jobs` table with correct schema
- `validateAdminAuth()` function available
- Entity tables exist (items, item_articles, item_links)

### Downstream Consumers

- Owner Management UI (Epic 5) for retry button integration
- Translation status display components
- Admin dashboard translation monitoring

---

## 12. References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Task 4.2)
- **Request Document:** `/docs/gen_requests_epic3.md` (REQ-E03-022)
- **Job Queue Module:** `/src/lib/job-queue/translation-jobs.ts`
- **Auth Helper:** `/src/lib/auth-server.ts`
- **Database Types:** `/src/lib/supabase.ts`

---

*Implementation breakdown created by Tech Lead pipeline*
*For Epic 3 Task 4.2 - Translation Status & Management APIs*
