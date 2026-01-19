# REQ-353: Create Translation Status API Endpoint - Implementation Overview

**Last Modified:** 2026-01-19 19:45 UTC
**Request ID:** REQ-353
**Epic:** L10N Epic 3 - Dynamic Content Translation
**Phase:** 4 - Translation Status & Management APIs
**Task ID:** 4.1
**Size:** M (Medium)
**Type:** NEW FEATURE

---

## Summary

Create a REST API endpoint that provides comprehensive translation status information for any content entity (item, article, link, tag). The endpoint returns overall translation status, per-language completion status, job queue information for pending/in-progress translations, and relevant timestamps. The response includes appropriate HTTP cache headers to optimize performance for frequently accessed entities.

---

## Current Behavior

There is no standardized API for querying translation status. Applications and UI components that need to display translation progress must directly query multiple database tables (`translation_jobs`, `item_translations`, `article_translations`, etc.) to determine:
- Whether translations exist for an entity
- Which translations are in progress
- Which translations have failed
- When translations were last updated

This leads to inconsistent implementations and repeated database queries across different features.

---

## Expected Behavior

A GET endpoint at `/api/translations/status/[entityType]/[entityId]` that:

1. **Accepts URL Parameters:**
   - `entityType`: One of `item`, `article`, `link`, `tag`
   - `entityId`: UUID of the entity

2. **Returns a Structured Response:**
   - Overall status: `no_translations`, `pending`, `in_progress`, `completed`, `partial`, `failed`
   - Per-language translation status with timestamps
   - Job queue information when translations are pending/processing
   - Created/updated timestamps

3. **Includes Cache Headers:**
   - `Cache-Control` with appropriate `max-age` for completed translations
   - `ETag` based on latest `updated_at` timestamp

4. **Handles Edge Cases:**
   - Returns 404 when entity doesn't exist
   - Returns 200 with empty translations array when entity exists but has no translations
   - Returns 400 for invalid entityType or entityId format

---

## User Impact

- **Content creators** can see real-time translation progress when editing or reviewing content
- **Guest-facing components** can determine which language options to display based on completed translations
- **System monitoring tools** can track translation health without complex database queries
- **Frontend components** can show accurate translation availability with a single API call

---

## Business Value

- Centralizes translation status logic into a single, well-defined API
- Reduces database query overhead through intelligent caching
- Enables consistent user experience across all features needing translation status
- Provides foundation for translation management UI in Epic 5

---

## Acceptance Criteria

- [ ] GET endpoint accepts `entityType` parameter (item, article, link, tag) in URL path
- [ ] GET endpoint accepts `entityId` parameter (UUID) in URL path
- [ ] Response includes `overallStatus` field (`no_translations`, `pending`, `in_progress`, `completed`, `partial`, `failed`)
- [ ] Response includes array of language-specific statuses with language code, translation status, and last updated timestamp
- [ ] Response includes job information (job ID, queue position, priority) when translations are queued or processing
- [ ] Response includes `created_at` and `updated_at` timestamps for translation records
- [ ] Endpoint returns 404 when entity does not exist
- [ ] Endpoint returns 200 with empty translations array when entity exists but has no translation records
- [ ] Response includes `Cache-Control` header with appropriate `max-age` for completed translations
- [ ] Response includes `ETag` header based on translation `updated_at` timestamps
- [ ] Endpoint validates `entityType` against allowed values and returns 400 for invalid types
- [ ] Endpoint validates `entityId` format (must be valid UUID) and returns 400 for invalid format

---

## Technical Approach

### API Endpoint Structure

**Route:** `/src/app/api/translations/status/[entityType]/[entityId]/route.ts`

**Method:** GET

**Authentication:** Optional (public endpoint for status checks, but respects account context if authenticated)

### Response Interface

```typescript
interface TranslationStatusResponse {
  success: boolean;
  data?: {
    entityId: string;
    entityType: 'item' | 'article' | 'link' | 'tag';
    sourceLanguage: SupportedLanguage;
    overallStatus: 'no_translations' | 'pending' | 'in_progress' | 'completed' | 'partial' | 'failed';
    translations: {
      [language: string]: {
        status: 'pending' | 'completed' | 'failed' | 'manual';
        translatedAt?: string;
        reviewedBy?: string;
        error?: string;
        jobInfo?: {
          jobId: string;
          queuePosition?: number;
          priority: number;
          attempts: number;
        };
      };
    };
    completedLanguages: string[];
    pendingLanguages: string[];
    failedLanguages: string[];
    lastUpdatedAt?: string;
  };
  error?: string;
}
```

### Implementation Steps

1. **Validate URL Parameters:**
   - Check `entityType` is one of: `item`, `article`, `link`, `tag`
   - Validate `entityId` is a valid UUID format

2. **Verify Entity Exists:**
   - Query the appropriate table based on `entityType`
   - Return 404 if entity not found

3. **Fetch Translation Records:**
   - Query the corresponding translation table (`item_translations`, `article_translations`, etc.)
   - Filter by entity ID

4. **Fetch Active Jobs:**
   - Query `translation_jobs` table for jobs with matching entity type and ID
   - Filter for `queued` and `processing` status

5. **Calculate Overall Status:**
   - `no_translations`: No translation records and no jobs
   - `pending`: All languages have jobs in `queued` status
   - `in_progress`: At least one job is `processing`
   - `completed`: All target languages have `completed` or `manual` status
   - `partial`: Some languages completed, others pending or failed
   - `failed`: At least one language failed with no pending retry

6. **Build Response with Cache Headers:**
   - Set `Cache-Control: public, max-age=60` for completed status
   - Set `Cache-Control: public, max-age=5` for pending/in_progress
   - Generate `ETag` from latest `updated_at` timestamp

### Existing Patterns to Follow

| Pattern | Location | Usage |
|---------|----------|-------|
| URL parameter extraction | `/src/app/api/items/[publicId]/route.ts:4-9` | Extract entityType and entityId from params |
| UUID validation | `/src/app/api/admin/items/route.ts:303-309` | Validate entityId format |
| Supabase queries | `/src/app/api/admin/items/route.ts:160-168` | Database query patterns |
| Response format | `/src/app/api/admin/items/route.ts:240-256` | Consistent API response structure |
| Error handling | `/src/app/api/items/[publicId]/route.ts:24-29` | 404 response for not found |

### Database Queries Required

1. **Entity existence check** (varies by type):
   ```sql
   SELECT id FROM items WHERE id = $1
   SELECT id FROM item_articles WHERE id = $1
   SELECT id FROM item_links WHERE id = $1
   SELECT id FROM tag_translations WHERE tag_key = $1 LIMIT 1
   ```

2. **Translation records query**:
   ```sql
   SELECT language, translation_status, translated_at, reviewed_by, updated_at
   FROM item_translations
   WHERE item_id = $1
   ```

3. **Active jobs query**:
   ```sql
   SELECT id, target_language, status, priority, attempts, error_message, created_at
   FROM translation_jobs
   WHERE entity_type = $1 AND entity_id = $2 AND status IN ('queued', 'processing')
   ORDER BY priority DESC, created_at ASC
   ```

---

## Dependencies

### Required Before Implementation

| Dependency | Status | Location |
|------------|--------|----------|
| Translation tables | ✅ Exists | Database (REQ-226) |
| Translation job types | ✅ Exists | `/src/lib/job-queue/translation-jobs.types.ts` |
| Supabase client | ✅ Exists | `/src/lib/supabase.ts` |
| Translation service types | ✅ Exists | `/src/lib/translation-service/translation-service.types.ts` |

### Downstream Consumers

- Epic 5: Translation Management UI (will use status endpoint)
- Translation status widget component (Task 5.6 in Epic 3)
- Items list view translation status column (Task 5.7 in Epic 3)

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/translations/status/[entityType]/[entityId]/route.ts` | Main API endpoint handler |

### Files to Potentially Modify

| File Path | Modification Purpose |
|-----------|---------------------|
| `/src/types/index.ts` | Add `TranslationStatusResponse` type if needed for reuse |

### Functions to Create

| Function | Location | Purpose |
|----------|----------|---------|
| `GET` | `route.ts` | Main GET handler for the endpoint |
| `validateEntityType` | `route.ts` | Helper to validate entityType parameter |
| `validateUUID` | `route.ts` | Helper to validate UUID format |
| `getEntityById` | `route.ts` | Helper to fetch entity by type and ID |
| `getTranslationRecords` | `route.ts` | Helper to fetch translation records |
| `getActiveJobs` | `route.ts` | Helper to fetch active translation jobs |
| `calculateOverallStatus` | `route.ts` | Helper to determine overall translation status |
| `generateETag` | `route.ts` | Helper to generate ETag from timestamps |

### Existing Functions/Types to Use

| Function/Type | Location | Usage |
|---------------|----------|-------|
| `SupportedLanguage` | `/src/lib/translation-service/translation-service.types.ts` | Language type |
| `TranslationStatus` | `/src/lib/translation-service/translation-service.types.ts` | Status type |
| `EntityType` | `/src/lib/job-queue/translation-jobs.types.ts` | Entity type enum |
| `supabase` | `/src/lib/supabase.ts` | Database client |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Performance with many translations | Low | Medium | Use indexed queries, implement caching |
| Tag entity lookup complexity | Medium | Low | Tags use `tag_key` instead of UUID - handle differently |
| Cache invalidation timing | Low | Low | Short cache times for pending, longer for completed |
| Job queue position calculation overhead | Medium | Low | Skip queue position if many jobs (> 100) |

---

## Testing Requirements

### Unit Tests
- Parameter validation (invalid entityType, invalid UUID)
- Overall status calculation logic
- ETag generation
- Response structure validation

### Integration Tests
- Entity not found returns 404
- Empty translations returns 200 with empty array
- Completed translations include correct cache headers
- Pending jobs include job info in response

### Manual Validation
- Verify endpoint works for all entity types
- Check cache headers in browser dev tools
- Verify ETag changes when translations update

---

## Implementation Notes

1. **Tag Entity Special Handling:**
   Tags don't have a UUID - they use `tag_key` as identifier. The endpoint should accept `tag_key` as the entityId for tags and query the `tag_translations` table using `tag_key` instead of an ID.

2. **Source Language Detection:**
   For items, articles, and links, the source language should be fetched from the entity's `source_language` column (added in Epic 1). For tags, assume English as source.

3. **Queue Position Calculation:**
   To avoid expensive queries, queue position can be approximated or omitted when there are many jobs. Consider returning `null` for position when total queued jobs > 100.

4. **Caching Strategy:**
   - Completed: `max-age=300` (5 minutes)
   - Partial: `max-age=30` (30 seconds)
   - Pending/In-progress: `max-age=5` (5 seconds)
   - Failed: `max-age=60` (1 minute)

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Task 4.1)
- **PRD:** `/docs/prd/PRD_L10N_Epic3_Dynamic_Content_Translation.md`
- **Epic 1 Foundation:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- **Job Queue Types:** `/src/lib/job-queue/translation-jobs.types.ts`
- **Translation Service Types:** `/src/lib/translation-service/translation-service.types.ts`

---

*Document generated for FAQBNB L10N Epic 3 - Dynamic Content Translation*
