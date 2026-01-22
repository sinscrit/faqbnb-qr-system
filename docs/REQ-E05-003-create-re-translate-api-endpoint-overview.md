# Implementation Overview: Create Re-Translate API Endpoint

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E05-003 |
| Source File | docs/gen_requests_epic5.md |
| Original Request Date | 2026-01-22 16:30 |
| Breakdown Created | 2026-01-22 18:49 |
| T-shirt Size | M |
| Estimated Effort | 6-8 hours |

## Goals

Create a new POST endpoint at `/api/translations/retranslate/route.ts` that enables property owners to queue re-translation jobs for their content. This endpoint supports bulk operations, protects manual edits with configurable skip/overwrite options, and provides clear feedback on job counts.

**Technical Requirements:**
- Accept POST requests with array of entities to re-translate
- Support optional language filtering (default: all languages)
- Implement `skipManualEdits` flag (default: true) to preserve manual translations
- Implement `overwriteManual` flag to force re-translation of manual edits
- Validate property ownership for all entities before queuing
- Return summary with `jobCount` and `skippedCount`
- Queue jobs asynchronously using existing job queue system
- Handle bulk operations efficiently (minimize N+1 queries)

### Assumptions & Clarifications

- **Discovery**: Similar endpoint exists at `/api/translations/retry/route.ts` for retrying failed jobs - can use as pattern reference
- **Discovery**: Job queue system exists at `/src/lib/job-queue/` with `createTranslationJob()` and `createBatchTranslationJobs()` functions
- **Assumption**: Re-translate creates new jobs even if completed translations exist (vs retry which resets failed jobs)
- **Assumption**: Entity ownership validation follows pattern from `/api/translations/[entityType]/[entityId]/[language]/route.ts`
- **Assumption**: `skipManualEdits` and `overwriteManual` are mutually exclusive (skipManualEdits takes precedence if both true)
- **Clarification needed**: Should we check for existing queued/processing jobs before creating duplicates?
- **Clarification needed**: Should skipped entities (due to manual status or no ownership) return 403 or just be counted in skippedCount?

## Implementation Plan

### Step 1: Create API Route File and Type Definitions
- **Description**: Set up the new API route file with TypeScript types for request/response
- **Rationale**: Establish foundation with clear type safety before implementing logic
- **Estimated Effort**: 45 minutes

Create `/src/app/api/translations/retranslate/route.ts` with:
- Request body interface: `RetranslateRequest`
  - `entities: { entityType: 'item' | 'article' | 'link' | 'tag', entityId: string }[]`
  - `languages?: SupportedLanguage[]` (optional, defaults to all)
  - `skipManualEdits?: boolean` (optional, default: true)
  - `overwriteManual?: boolean` (optional, default: false)
- Response interface: `RetranslateResponse`
  - `success: boolean`
  - `jobsQueued: number`
  - `skipped: number`
  - `skippedReason?: string`
- Error codes constants for consistent error handling
- Import existing types from `/src/lib/job-queue/translation-jobs.types.ts`

### Step 2: Implement Request Validation
- **Description**: Validate request body structure and parameters
- **Rationale**: Catch invalid input early before expensive database operations
- **Estimated Effort**: 1 hour

Validation logic:
- Authenticate user via `validateAdminAuth(request)`
- Parse JSON request body with try-catch
- Validate `entities` array exists and has at least one entry
- Validate each entity has valid `entityType` ('item', 'article', 'link', 'tag')
- Validate each entity has non-empty `entityId`
- Validate UUID format for entityId (except tags which may use string keys)
- Validate `languages` array if provided (filter to supported languages)
- Validate `skipManualEdits` and `overwriteManual` are boolean if provided
- Return 400 with clear error messages for validation failures
- Return 401 for unauthenticated requests

### Step 3: Implement Entity Ownership Validation
- **Description**: Verify user has ownership access to all requested entities
- **Rationale**: Security-critical - prevent users from re-translating others' content
- **Estimated Effort**: 1.5 hours

Ownership validation approach:
- For each entity, query entity table and traverse to property ownership
- Use pattern from `/api/translations/[entityType]/[entityId]/[language]/route.ts`:
  - Items: `items.property_id → properties.user_id/account_id`
  - Articles: `item_articles.item_id → items.property_id → properties.user_id/account_id`
  - Links: `item_links.item_id → items.property_id → properties.user_id/account_id`
  - Tags: Allow if user is authenticated (tags may be shared)
- Check ownership via `properties.user_id === user.id` or account_users membership
- Separate entities into `owned` and `notOwned` arrays
- Options for handling unauthorized entities:
  - **Recommended**: Add to skippedCount and continue (soft failure)
  - Alternative: Return 403 immediately (hard failure)

### Step 4: Query Existing Translation Status
- **Description**: Check translation_status for entities to determine which have manual edits
- **Rationale**: Enable skipManualEdits logic to protect human-reviewed translations
- **Estimated Effort**: 1.5 hours

Query logic for each entity type:
- Query translation tables for each owned entity:
  - `item_translations`: Check `translation_status` column
  - `article_translations`: Check `translation_status` column
  - `link_translations`: Check `translation_status` column
  - `tag_translations`: Different schema - no status column, always allow
- Filter by target languages if `languages` parameter provided
- Build map of entity → language → status: `Map<entityId, Map<language, 'manual' | 'completed' | 'pending' | 'failed'>>`
- Handle skipManualEdits logic:
  - If `skipManualEdits === true` (default): Skip entities where translation_status === 'manual'
  - If `overwriteManual === true`: Include all entities regardless of status
  - Add skipped entities to skippedCount with reason
- Optimize with batch queries to avoid N+1 problem

### Step 5: Queue Re-Translation Jobs
- **Description**: Create translation jobs for validated entities using job queue system
- **Rationale**: Leverage existing job queue infrastructure for asynchronous processing
- **Estimated Effort**: 1.5 hours

Job creation logic:
- Use `createBatchTranslationJobs()` from `/src/lib/job-queue/translation-jobs.ts`
- For each owned, non-skipped entity:
  - Determine target languages (from `languages` param or default to all: fr, es, de, nl, it)
  - Create job params array with:
    - `entityType`, `entityId`
    - `sourceLanguage`: from entity's source_language column (default: 'en')
    - `targetLanguage`: each target language
    - `priority`: use default or calculate based on content age
- Call `createBatchTranslationJobs()` with params array
- Handle job creation result:
  - Count successfully created jobs → `jobsQueued`
  - Handle duplicate job scenario (job already queued)
  - Handle creation errors → add to skippedCount

### Step 6: Build and Return Response
- **Description**: Construct success response with accurate counts and metadata
- **Rationale**: Provide clear feedback to users about what was queued and what was skipped
- **Estimated Effort**: 30 minutes

Response construction:
- Calculate `jobsQueued`: Total successfully created jobs
- Calculate `skipped`: Total entities not queued (unauthorized + manual status + errors)
- Include optional `skippedReason` if skippedCount > 0:
  - "X entities skipped due to manual edits"
  - "Y entities skipped due to access restrictions"
  - "Z entities skipped due to errors"
- Return 200 with success response
- Log summary for debugging and monitoring

### Step 7: Add Error Handling and CORS Support
- **Description**: Implement comprehensive error handling and CORS headers
- **Rationale**: Ensure reliable API behavior and cross-origin support
- **Estimated Effort**: 30 minutes

Error handling:
- Wrap all logic in try-catch block
- Handle specific error cases:
  - JSON parse errors → 400
  - Validation errors → 400
  - Database query errors → 500
  - Job queue errors → 500 with rollback consideration
- Add detailed logging for debugging
- Return consistent error response structure

CORS support:
- Add OPTIONS handler for preflight requests
- Allow POST method
- Set appropriate headers:
  - `Access-Control-Allow-Origin: *`
  - `Access-Control-Allow-Methods: POST, OPTIONS`
  - `Access-Control-Allow-Headers: Content-Type, Authorization`

### Step 8: Add Integration Tests
- **Description**: Create test suite covering all acceptance criteria
- **Rationale**: Ensure endpoint meets requirements and prevent regressions
- **Estimated Effort**: 1.5 hours

Test coverage:
- Successful bulk re-translation (200 response)
- Unauthenticated request (401 response)
- Empty entities array (400 response)
- Invalid entityType (400 response)
- skipManualEdits preserves manual translations (verify skippedCount)
- overwriteManual includes manual translations (verify jobsQueued)
- Ownership validation prevents cross-property re-translation
- Language filtering works correctly
- Response counts are accurate (jobsQueued + skipped = total entities)

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### New Files to Create
| File | Target | Type |
|------|--------|------|
| `/src/app/api/translations/retranslate/route.ts` | — | Create |
| `/src/app/api/translations/retranslate/__tests__/route.test.ts` | — | Create |

### Existing Files to Reference (Read-Only)
| File | Purpose |
|------|---------|
| `/src/lib/auth-server.ts` | Use `validateAdminAuth()` function |
| `/src/lib/supabase.ts` | Import Supabase client |
| `/src/lib/job-queue/translation-jobs.ts` | Use `createBatchTranslationJobs()` function |
| `/src/lib/job-queue/translation-jobs.types.ts` | Import `SupportedLanguage`, `EntityType` types |
| `/src/app/api/translations/retry/route.ts` | Reference pattern for entity validation and job queuing |
| `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` | Reference pattern for ownership validation (lines 182-353) |

### Database Tables to Query
| Table | Operation | Purpose |
|-------|-----------|---------|
| `items` | SELECT | Validate entity exists and get property_id |
| `item_articles` | SELECT | Validate entity exists and get item_id |
| `item_links` | SELECT | Validate entity exists and get item_id |
| `properties` | SELECT | Validate ownership via user_id/account_id |
| `account_users` | SELECT | Validate account membership for ownership |
| `item_translations` | SELECT | Check translation_status for skipManualEdits |
| `article_translations` | SELECT | Check translation_status for skipManualEdits |
| `link_translations` | SELECT | Check translation_status for skipManualEdits |
| `translation_jobs` | INSERT | Queue new translation jobs via job queue |

## Dependencies

### Depends On (Completed First)
- **Epic 1 (Foundation)**: Translation infrastructure
  - Job queue system at `/src/lib/job-queue/`
  - Translation tables: `item_translations`, `article_translations`, `link_translations`
  - `translation_jobs` table with status tracking
  - `createBatchTranslationJobs()` function for job creation
- **Epic 3 (Dynamic Content Translation)**: Translation status tracking
  - `translation_status` column in translation tables
  - Status values: 'pending', 'processing', 'completed', 'failed', 'manual'

### Blocks (Requires This First)
- **REQ-E05-005**: Translation Preview Panel - needs this endpoint for "Re-translate" button
- **REQ-E05-008**: Bulk Translation Bar - needs this endpoint for bulk re-translation actions
- **REQ-E05-010**: Manual Edit Warning Dialog - uses this endpoint with overwriteManual option

### Parallel Safety
- **Files touched**:
  - `/src/app/api/translations/retranslate/route.ts` (new file)
  - Database: `translation_jobs` table (inserts only)
- **Conflicts with**:
  - None - new endpoint with no overlapping files
  - Potential race condition: Multiple simultaneous re-translate requests for same entity
    - Mitigation: Job queue has duplicate detection (upsert with conflict resolution)
- **Safe to parallelize with**:
  - REQ-E05-001 (Translation Status API) - different route, read-only
  - REQ-E05-002 (Update Translation API) - different route, different operation
  - All Epic 5 UI component tasks

### External Dependencies
- Supabase PostgreSQL database with RLS enabled
- Next.js 15.5.9 App Router API routes
- Existing authentication system via `validateAdminAuth`
- Job queue system with async processing
- TypeScript 5.x with strict mode

## Risks and Considerations

### Potential Side Effects
- **Overwriting manual edits**: If overwriteManual=true, destroys human work
  - Mitigation: Default to skipManualEdits=true
  - Mitigation: Add confirmation dialog in UI before calling with overwriteManual
  - Mitigation: Log all overwrites for audit trail

- **Duplicate job creation**: Multiple requests could create duplicate jobs
  - Mitigation: Job queue uses upsert with conflict resolution on (entity_type, entity_id, target_language)
  - Mitigation: Existing queued jobs are ignored by upsert

- **Bulk operation performance**: Large entity arrays could cause slow response
  - Mitigation: Add reasonable limit (e.g., 100 entities per request)
  - Mitigation: Use batch queries instead of N+1 loops
  - Mitigation: Consider async endpoint that returns immediately with job tracking ID

- **Property access validation complexity**: Traversing entity → property → user relationships
  - Mitigation: Reuse proven pattern from manual override endpoint
  - Mitigation: Use efficient joins instead of multiple queries
  - Mitigation: Cache property ownership lookups within request

### Testing Requirements
- **Unit tests**:
  - Request body validation logic
  - skipManualEdits vs overwriteManual precedence
  - Entity ownership validation logic
  - Job count calculation accuracy

- **Integration tests**:
  - End-to-end re-translation flow
  - Bulk operations with 10+ entities
  - Mixed ownership scenarios (some owned, some not)
  - Mixed translation status scenarios (manual, completed, pending)
  - Language filtering works correctly

- **Performance tests**:
  - Response time with 50 entities
  - Database query efficiency (check for N+1)
  - Concurrent request handling

### Open Questions
- [ ] Should we limit the number of entities per request? (Recommendation: 100 entity limit)
- [ ] What happens if some job creations succeed and others fail? (Recommendation: Return partial success with counts)
- [ ] Should we check for existing queued/processing jobs before creating new ones? (Recommendation: Yes, skip if job already queued)
- [ ] Should unauthorized entities return 403 or be silently skipped? (Recommendation: Silent skip with skippedCount, better UX)
- [ ] Should we track who triggered the re-translation? (Recommendation: Add triggered_by column to translation_jobs for audit)
- [ ] Do we need to clean up old completed jobs before re-translating? (Recommendation: No, let job queue handle completed job lifecycle)

## Out of Scope

The following are explicitly **not** included in this task:
- Deleting existing translations before re-translation (job processor handles this)
- Implementing the actual translation processing (handled by job queue processor)
- Real-time progress tracking for re-translation jobs (separate feature)
- UI components that call this endpoint (separate Epic 5 tasks)
- Webhook or notification system when re-translation completes
- Batch status tracking with correlation IDs
- Undo functionality for re-translation
- Scheduling re-translations for future execution
- Automatic re-translation triggers based on source content changes
- Translation quality comparison before/after re-translation
- A/B testing different translation providers
- Cost estimation for re-translation operations
- Rate limiting per user or property
- Translation memory or caching system integration

## Special Notes

### Relationship to Retry Endpoint

There's an existing `/api/translations/retry/route.ts` endpoint that handles retrying **failed** translation jobs. Key differences:

| Feature | Retry Endpoint | Re-translate Endpoint (This Task) |
|---------|----------------|-----------------------------------|
| Purpose | Retry failed jobs | Create new translation jobs |
| Job Status Target | Failed jobs only | All entities (creates new jobs) |
| Operation | Resets job status to 'queued' | Creates new jobs with upsert |
| Bulk Support | Single entity only | Multiple entities |
| Manual Edit Handling | N/A (failed jobs) | Skip or overwrite manual translations |

The re-translate endpoint is designed for bulk operations and proactive re-translation, while retry is for recovering from failures.

### Manual Edit Protection Strategy

The skipManualEdits flag protects human-reviewed translations by default:

1. **Default behavior (skipManualEdits=true)**:
   - Query translation_status column
   - If status === 'manual', add to skippedCount
   - Don't create job for that entity+language pair

2. **Forced overwrite (overwriteManual=true)**:
   - Ignore translation_status
   - Create jobs for all entities regardless of manual status
   - UI should show prominent warning before allowing this

3. **Implementation note**:
   - If both flags are true, skipManualEdits takes precedence (safer default)

### Performance Optimization Notes

For efficient bulk processing:
- Use `IN` queries instead of looping individual queries
- Batch entity validation: Single query per entity type
- Batch translation status check: Single query per translation table
- Use `createBatchTranslationJobs()` instead of loop with `createTranslationJob()`
- Consider response streaming for very large batches (future enhancement)

---
*Document generated: 2026-01-22 18:49*
