# Create Re-Translate API Endpoint - Detailed Implementation Tasks

**Generated:** 2026-01-22 22:48
**Reference Documents:**
- Requirements: docs/gen_requests_epic5.md (REQ-E05-003)
- Overview: docs/REQ-E05-003-create-re-translate-api-endpoint-overview.md
- Implementation Plan: docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

---

## Build & Test Commands

| Action | Command |
|--------|---------|
| Type Check | `npx tsc --noEmit` |
| Unit Tests | `npm test` |
| Build | `npm run build` |
| Lint | `npm run lint` |

---

## Implementation Context

This endpoint enables property owners to queue re-translation jobs for their content entities in bulk. Unlike the existing `/api/translations/retry` endpoint (which retries failed jobs), this endpoint creates new translation jobs for entities regardless of current status, with protection for manual edits via `skipManualEdits` and `overwriteManual` flags.

**Key Features:**
- Bulk entity support (multiple items, articles, links in one request)
- Manual edit protection (default: skip manual translations)
- Language filtering (optional: re-translate only specific languages)
- Property ownership validation (users can only re-translate their own content)
- Efficient batch processing (avoid N+1 query problems)

**Pattern References:**
- `/src/app/api/translations/retry/route.ts` - validation and error handling patterns
- `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` - ownership validation pattern
- `/src/lib/job-queue/translation-jobs.ts` - job creation functions

---

## 1. Create API Route File with Type Definitions

**Context:** Establish type-safe foundation for the endpoint with clear interfaces for request/response structure. Follow the pattern from retry endpoint (lines 29-73) for consistent type definitions.

**Files to modify:**
- `/src/app/api/translations/retranslate/route.ts` (new file)

**Estimated effort:** 1 story point

- [ ] **1.1** Create file `/src/app/api/translations/retranslate/route.ts` with header comment documenting REQ-E05-003, purpose, and creation date 2026-01-22
- [ ] **1.2** Import `NextRequest`, `NextResponse` from 'next/server'
- [ ] **1.3** Import `validateAdminAuth` from '@/lib/auth-server'
- [ ] **1.4** Import `supabaseAdmin` from '@/lib/supabase'
- [ ] **1.5** Import `EntityType`, `SupportedLanguage` from '@/lib/job-queue/translation-jobs.types'
- [ ] **1.6** Import `createTranslationJob` from '@/lib/job-queue/translation-jobs'
- [ ] **1.7** Define `RetranslateEntitySpec` interface with fields: `entityType` (EntityType), `entityId` (string)
- [ ] **1.8** Define `RetranslateRequest` interface with fields: `entities` (RetranslateEntitySpec[]), `languages` (optional SupportedLanguage[]), `skipManualEdits` (optional boolean, default true), `overwriteManual` (optional boolean, default false)
- [ ] **1.9** Define `RetranslateResponse` interface with fields: `success` (boolean), `jobsQueued` (number), `skipped` (number), `skippedReason` (optional string), `error` (optional string), `code` (optional string)
- [ ] **1.10** Define `RETRANSLATE_ERROR_CODES` constant object with error codes: INVALID_ENTITY_TYPE, VALIDATION_ERROR, UNAUTHORIZED, FORBIDDEN, DATABASE_ERROR, EMPTY_ENTITIES
- [ ] **1.11** Define `VALID_ENTITY_TYPES` constant array: ['item', 'article', 'link', 'tag']
- [ ] **1.12** Define `VALID_LANGUAGES` constant array: ['en', 'fr', 'es', 'de', 'nl', 'it']
- [ ] **1.13** Define `TARGET_LANGUAGES` constant array (excludes English): ['fr', 'es', 'de', 'nl', 'it']
- [ ] **1.14** Define `MAX_ENTITIES_PER_REQUEST` constant: 100 (prevent abuse of bulk endpoint)
- [ ] **1.15** Add JSDoc comments to all interfaces explaining their purpose and field requirements

---

## 2. Implement Request Validation Helper Functions

**Context:** Create validation logic to catch invalid input early before expensive database operations. Follow pattern from retry endpoint (lines 88-165) for robust validation.

**Files to modify:**
- `/src/app/api/translations/retranslate/route.ts`

**Estimated effort:** 1 story point

- [ ] **2.1** Create helper function `validateRequestBody` that accepts `body: unknown` and returns `{ valid: boolean, data?: RetranslateRequest, error?: { message: string, code: string } }`
- [ ] **2.2** In `validateRequestBody`, check if body exists and is an object, return validation error if not
- [ ] **2.3** In `validateRequestBody`, validate `entities` field exists and is an array with at least one element
- [ ] **2.4** In `validateRequestBody`, validate entities array length does not exceed MAX_ENTITIES_PER_REQUEST, return error if exceeded
- [ ] **2.5** In `validateRequestBody`, iterate through each entity and validate `entityType` is in VALID_ENTITY_TYPES array
- [ ] **2.6** In `validateRequestBody`, iterate through each entity and validate `entityId` is a non-empty string
- [ ] **2.7** In `validateRequestBody`, validate `entityId` is valid UUID format for items, articles, links (not tags, which use string keys)
- [ ] **2.8** In `validateRequestBody`, validate `languages` if provided: is array and contains only values from VALID_LANGUAGES
- [ ] **2.9** In `validateRequestBody`, validate `skipManualEdits` if provided: is boolean type
- [ ] **2.10** In `validateRequestBody`, validate `overwriteManual` if provided: is boolean type
- [ ] **2.11** In `validateRequestBody`, return `{ valid: true, data: validatedRequest }` if all checks pass
- [ ] **2.12** Add unit tests for `validateRequestBody` covering valid and invalid inputs (can be added in task 11)

---

## 3. Implement Entity Ownership Validation

**Context:** Security-critical function to ensure users can only re-translate their own content. Reuse ownership validation pattern from manual override endpoint (lines 182-353).

**Files to modify:**
- `/src/app/api/translations/retranslate/route.ts`

**Estimated effort:** 1 story point

- [ ] **3.1** Create helper function `validateEntityOwnership` that accepts `entityType: EntityType`, `entityId: string`, `userId: string`, `supabase` and returns `Promise<{ hasAccess: boolean, error?: string }>`
- [ ] **3.2** In `validateEntityOwnership`, implement switch statement on `entityType` to handle each entity type differently
- [ ] **3.3** For 'item' case: Query `items` table to get `property_id`, then query `properties` table to check if `user_id` matches or user is in `account_users` via account_id
- [ ] **3.4** For 'article' case: Query `item_articles` to get `item_id`, then follow same property ownership chain as items
- [ ] **3.5** For 'link' case: Query `item_links` to get `item_id`, then follow same property ownership chain as items
- [ ] **3.6** For 'tag' case: Tags are shared content, return `{ hasAccess: true }` for any authenticated user
- [ ] **3.7** In `validateEntityOwnership`, handle entity not found case: return `{ hasAccess: false, error: 'Entity not found' }`
- [ ] **3.8** In `validateEntityOwnership`, handle database query errors: log error and return `{ hasAccess: false, error: 'Database error' }`
- [ ] **3.9** Create helper function `validateBatchOwnership` that accepts `entities: RetranslateEntitySpec[]`, `userId: string`, `supabase` and returns `Promise<{ owned: RetranslateEntitySpec[], notOwned: RetranslateEntitySpec[] }>`
- [ ] **3.10** In `validateBatchOwnership`, use efficient batch queries with `IN` operator to minimize database round trips (query all items first, then check ownership)
- [ ] **3.11** In `validateBatchOwnership`, separate entities into owned and notOwned arrays based on ownership validation results
- [ ] **3.12** Add logging for ownership validation results to help with debugging and audit trails

---

## 4. Implement Translation Status Query for Manual Edit Detection

**Context:** Query existing translation status to identify manual edits that should be protected by skipManualEdits flag. Use efficient batch queries to avoid N+1 problems.

**Files to modify:**
- `/src/app/api/translations/retranslate/route.ts`

**Estimated effort:** 1 story point

- [ ] **4.1** Create helper function `queryTranslationStatus` that accepts `entities: RetranslateEntitySpec[]`, `languages: SupportedLanguage[]`, `supabase` and returns `Promise<Map<string, Map<string, string>>>` (entityId → language → status)
- [ ] **4.2** In `queryTranslationStatus`, group entities by type to enable batch queries per table
- [ ] **4.3** For item entities, query `item_translations` table with `item_id IN (...)` and `language IN (...)`, select item_id, language, translation_status
- [ ] **4.4** For article entities, query `article_translations` table with `article_id IN (...)` and `language IN (...)`, select article_id, language, translation_status
- [ ] **4.5** For link entities, query `link_translations` table with `link_id IN (...)` and `language IN (...)`, select link_id, language, translation_status
- [ ] **4.6** For tag entities, skip status query (tag_translations has no translation_status column, always allow)
- [ ] **4.7** In `queryTranslationStatus`, build nested Map structure: outer map key is entityId, inner map key is language, value is translation_status
- [ ] **4.8** In `queryTranslationStatus`, handle missing translation records (entity+language pair has no translation) by treating as non-manual (allow re-translation)
- [ ] **4.9** Create helper function `filterManualEdits` that accepts `entities`, `statusMap`, `skipManualEdits: boolean`, `overwriteManual: boolean` and returns `{ toQueue: Array<{entity, language}>, toSkip: Array<{entity, language, reason}> }`
- [ ] **4.10** In `filterManualEdits`, if `overwriteManual === true`, return all entities in toQueue (ignore manual status)
- [ ] **4.11** In `filterManualEdits`, if `skipManualEdits === true`, check status map and skip entity+language pairs where status === 'manual'
- [ ] **4.12** In `filterManualEdits`, for each skipped entity+language, add reason: "Manual edit protected"

---

## 5. Implement Job Queue Creation Logic

**Context:** Create translation jobs using the existing job queue system. Use `createTranslationJob` for efficient job creation with duplicate handling.

**Files to modify:**
- `/src/app/api/translations/retranslate/route.ts`

**Estimated effort:** 1 story point

- [ ] **5.1** Create helper function `queueTranslationJobs` that accepts `jobSpecs: Array<{entity, language}>`, `supabase` and returns `Promise<{ queued: number, failed: number, failedReasons: string[] }>`
- [ ] **5.2** In `queueTranslationJobs`, for each job spec, query the entity table to get source_language (items.source_language, item_articles.source_language, etc.)
- [ ] **5.3** In `queueTranslationJobs`, default source_language to 'en' if not set on the entity
- [ ] **5.4** In `queueTranslationJobs`, call `createTranslationJob()` with params: entityType, entityId, sourceLanguage, targetLanguage
- [ ] **5.5** In `queueTranslationJobs`, use priority from job queue's default calculation (don't override unless needed)
- [ ] **5.6** In `queueTranslationJobs`, handle duplicate jobs gracefully (createTranslationJob uses upsert with ignoreDuplicates, so duplicates are no-ops)
- [ ] **5.7** In `queueTranslationJobs`, count successful job creations in `queued` counter
- [ ] **5.8** In `queueTranslationJobs`, catch job creation errors and count in `failed` counter with error message
- [ ] **5.9** In `queueTranslationJobs`, consider batching source_language queries for efficiency (single query per entity type)
- [ ] **5.10** In `queueTranslationJobs`, log summary: total jobs queued, failed, and any error messages
- [ ] **5.11** Add error handling for database connection issues during job creation
- [ ] **5.12** Return comprehensive result with queued count, failed count, and array of failure reasons

---

## 6. Implement Main POST Handler

**Context:** Orchestrate all validation, ownership checks, status queries, and job creation in the main POST endpoint handler. Follow structure from retry endpoint (lines 234-402).

**Files to modify:**
- `/src/app/api/translations/retranslate/route.ts`

**Estimated effort:** 1 story point

- [ ] **6.1** Create `POST` async function that accepts `request: NextRequest` and returns `Promise<NextResponse<RetranslateResponse>>`
- [ ] **6.2** Wrap all logic in try-catch block for comprehensive error handling
- [ ] **6.3** Call `validateAdminAuth(request)` and store result in `authResult`
- [ ] **6.4** If `authResult.error` exists, return it immediately (401 response)
- [ ] **6.5** Extract authenticated user from `authResult.user` and log user ID and email
- [ ] **6.6** Parse request body JSON with try-catch, return 400 if JSON parse fails
- [ ] **6.7** Call `validateRequestBody(body)` and check `valid` flag, return 400 with error if validation fails
- [ ] **6.8** Extract validated data from validation result: `entities`, `languages`, `skipManualEdits`, `overwriteManual`
- [ ] **6.9** Set default values: `skipManualEdits` defaults to true, `overwriteManual` defaults to false, `languages` defaults to TARGET_LANGUAGES
- [ ] **6.10** Log request details: number of entities, languages, skipManualEdits, overwriteManual flags
- [ ] **6.11** Call `validateBatchOwnership(entities, user.id, authResult.supabase)` to get owned and notOwned arrays
- [ ] **6.12** Initialize counters: `totalSkipped = notOwned.length`, `jobsQueued = 0`
- [ ] **6.13** If all entities are notOwned, return 403 with error "No access to any of the specified entities"
- [ ] **6.14** Call `queryTranslationStatus(owned, languages, authResult.supabase)` to get status map
- [ ] **6.15** Call `filterManualEdits(owned, statusMap, skipManualEdits, overwriteManual)` to get toQueue and toSkip arrays
- [ ] **6.16** Add toSkip.length to totalSkipped counter
- [ ] **6.17** Call `queueTranslationJobs(toQueue, authResult.supabase)` to create jobs
- [ ] **6.18** Set `jobsQueued` to queued count from result
- [ ] **6.19** Add failed count from result to totalSkipped counter
- [ ] **6.20** Build skippedReason string describing why entities were skipped (ownership, manual edits, errors)
- [ ] **6.21** Return 200 with success response containing jobsQueued, skipped, and skippedReason
- [ ] **6.22** In catch block, log error and return 500 with error message

---

## 7. Add OPTIONS Handler for CORS Support

**Context:** Enable CORS for this endpoint so it can be called from the dashboard UI. Follow pattern from other API endpoints.

**Files to modify:**
- `/src/app/api/translations/retranslate/route.ts`

**Estimated effort:** 1 story point

- [ ] **7.1** Create `OPTIONS` async function that returns `Promise<NextResponse>`
- [ ] **7.2** Return NextResponse with status 204 (no content)
- [ ] **7.3** Set header 'Access-Control-Allow-Origin' to '*' (or specific domain if needed)
- [ ] **7.4** Set header 'Access-Control-Allow-Methods' to 'POST, OPTIONS'
- [ ] **7.5** Set header 'Access-Control-Allow-Headers' to 'Content-Type, Authorization'
- [ ] **7.6** Set header 'Access-Control-Max-Age' to '86400' (24 hours)
- [ ] **7.7** Test CORS with browser console to verify preflight requests work
- [ ] **7.8** Verify POST requests from browser don't encounter CORS errors
- [ ] **7.9** Add comment explaining CORS is needed for Epic 5 UI components
- [ ] **7.10** Document which UI components will call this endpoint (TranslationPreviewPanel, BulkTranslationBar)

---

## 8. Add Request Logging and Monitoring

**Context:** Add comprehensive logging for debugging, monitoring, and audit trails. Log key events without exposing sensitive data.

**Files to modify:**
- `/src/app/api/translations/retranslate/route.ts`

**Estimated effort:** 1 story point

- [ ] **8.1** Add log statement at start of POST handler: "RETRANSLATE: Request received" with user ID and entity count
- [ ] **8.2** Add log statement after ownership validation: "RETRANSLATE: Ownership validated" with owned/notOwned counts
- [ ] **8.3** Add log statement after status query: "RETRANSLATE: Translation status queried" with manual edit count
- [ ] **8.4** Add log statement after manual edit filtering: "RETRANSLATE: Manual edits filtered" with toQueue/toSkip counts
- [ ] **8.5** Add log statement after job creation: "RETRANSLATE: Jobs queued" with success/failure counts
- [ ] **8.6** Add log statement before returning response: "RETRANSLATE: Response sent" with jobsQueued and skipped counts
- [ ] **8.7** In error catch block, log full error with stack trace: "RETRANSLATE: Error occurred"
- [ ] **8.8** Ensure no sensitive data (API keys, full entity content) is logged
- [ ] **8.9** Use consistent log prefix "RETRANSLATE:" for easy filtering in log aggregation tools
- [ ] **8.10** Consider adding performance timing logs (start time, end time, duration) for monitoring

---

## 9. Optimize Batch Query Performance

**Context:** Ensure efficient database access with batch queries instead of N+1 loops. Critical for bulk operations with many entities.

**Files to modify:**
- `/src/app/api/translations/retranslate/route.ts`

**Estimated effort:** 1 story point

- [ ] **9.1** Review `validateBatchOwnership` to ensure it uses `IN` queries instead of individual lookups
- [ ] **9.2** In `validateBatchOwnership`, group entities by type and query all items at once: `SELECT id, property_id FROM items WHERE id IN (...)`
- [ ] **9.3** In `validateBatchOwnership`, query all properties at once: `SELECT id, user_id, account_id FROM properties WHERE id IN (...)`
- [ ] **9.4** In `validateBatchOwnership`, query account_users membership once: `SELECT account_id FROM account_users WHERE user_id = ? AND account_id IN (...)`
- [ ] **9.5** Review `queryTranslationStatus` to ensure it uses batch queries per table type
- [ ] **9.6** In `queryTranslationStatus`, use single query per translation table: `SELECT item_id, language, translation_status FROM item_translations WHERE item_id IN (...) AND language IN (...)`
- [ ] **9.7** In `queueTranslationJobs`, batch the source_language queries: `SELECT id, source_language FROM items WHERE id IN (...)`
- [ ] **9.8** Consider using Supabase `.in()` method for cleaner query syntax
- [ ] **9.9** Add performance timing logs to identify slow queries
- [ ] **9.10** Test with 50+ entities to verify query performance is acceptable (< 2 seconds)
- [ ] **9.11** Document query optimization strategy in code comments
- [ ] **9.12** Consider adding query result caching if multiple requests for same entities occur frequently

---

## 10. Add Response Metadata and Error Details

**Context:** Provide rich response information to help UI display meaningful feedback to users about what happened during re-translation.

**Files to modify:**
- `/src/app/api/translations/retranslate/route.ts`

**Estimated effort:** 1 story point

- [ ] **10.1** Enhance `RetranslateResponse` interface to include optional `metadata` field with timestamp, userId, entityCount
- [ ] **10.2** In POST handler, build metadata object with request timestamp, user ID, total entities requested
- [ ] **10.3** Build detailed `skippedReason` string with breakdown: "X entities skipped due to access restrictions, Y due to manual edits"
- [ ] **10.4** If `failedReasons` array has entries from job creation, append to skippedReason: "Z entities failed to queue"
- [ ] **10.5** For validation errors (400), provide field-specific error messages: "entities[2].entityType is invalid"
- [ ] **10.6** For database errors (500), provide generic message without exposing internal details: "Database error occurred"
- [ ] **10.7** Add `warnings` array field to response for non-critical issues (e.g., duplicate jobs skipped)
- [ ] **10.8** Include affected entity IDs in warnings if helpful for debugging (but not in production logs)
- [ ] **10.9** Document response structure in JSDoc comments with examples
- [ ] **10.10** Test response structure matches TypeScript interface exactly

---

## 11. Write Unit Tests for Helper Functions

**Context:** Test individual helper functions in isolation with mocked dependencies. Ensure validation, ownership, and filtering logic works correctly.

**Files to modify:**
- `/src/app/api/translations/retranslate/__tests__/route.test.ts` (new file)

**Estimated effort:** 1 story point

- [ ] **11.1** Create test file `/src/app/api/translations/retranslate/__tests__/route.test.ts` with vitest imports
- [ ] **11.2** Write test suite: `describe('validateRequestBody', ...)` with tests for valid and invalid inputs
- [ ] **11.3** Write test: "should accept valid request with required fields" - entities array with valid entityType and entityId
- [ ] **11.4** Write test: "should reject empty entities array" - verify EMPTY_ENTITIES error code
- [ ] **11.5** Write test: "should reject entities array exceeding MAX_ENTITIES_PER_REQUEST" - verify validation error
- [ ] **11.6** Write test: "should reject invalid entityType" - test with 'invalid' type
- [ ] **11.7** Write test: "should reject empty entityId" - test with empty string
- [ ] **11.8** Write test: "should accept optional languages parameter" - test with ['fr', 'es']
- [ ] **11.9** Write test: "should reject invalid language codes" - test with ['xx', 'yy']
- [ ] **11.10** Write test: "should default skipManualEdits to true" - test omitted field
- [ ] **11.11** Write test: "should accept overwriteManual flag" - test true/false values
- [ ] **11.12** Run tests with `npm test` and verify all pass

---

## 12. Write Integration Tests for Endpoint

**Context:** Test full endpoint behavior with realistic scenarios covering all acceptance criteria from REQ-E05-003.

**Files to modify:**
- `/src/app/api/translations/retranslate/__tests__/route.test.ts`

**Estimated effort:** 1 story point

- [ ] **12.1** Write test suite: `describe('POST /api/translations/retranslate - Integration', ...)`
- [ ] **12.2** Mock `validateAdminAuth` to return test user with ID 'test-user-123'
- [ ] **12.3** Mock Supabase client queries to return test data for entities, properties, translations
- [ ] **12.4** Mock `createTranslationJob` to simulate successful job creation
- [ ] **12.5** Write test: "should return 200 with valid authentication and entities" - verify jobsQueued > 0
- [ ] **12.6** Write test: "should return 401 for unauthenticated requests" - mock auth failure
- [ ] **12.7** Write test: "should return 400 for empty entities array"
- [ ] **12.8** Write test: "should return 400 for invalid entityType"
- [ ] **12.9** Write test: "should skip entities with manual edits when skipManualEdits=true" - verify skipped count
- [ ] **12.10** Write test: "should queue manual edits when overwriteManual=true" - verify jobsQueued includes manual items
- [ ] **12.11** Write test: "should return 403 when user owns no entities" - mock ownership validation failure
- [ ] **12.12** Write test: "should filter languages parameter correctly" - request only ['fr'], verify only fr jobs created
- [ ] **12.13** Write test: "should handle mixed ownership (some owned, some not)" - verify skipped count includes unowned entities
- [ ] **12.14** Write test: "should return accurate counts (jobsQueued + skipped = total)" - verify math
- [ ] **12.15** Run all tests with `npm test` and verify 100% pass rate

---

## 13. Add End-to-End Documentation

**Context:** Document the complete endpoint behavior, request/response examples, and usage patterns for developers building UI components.

**Files to modify:**
- `/src/app/api/translations/retranslate/route.ts`

**Estimated effort:** 1 story point

- [ ] **13.1** Add comprehensive JSDoc comment block above POST function documenting endpoint purpose
- [ ] **13.2** In JSDoc, document all request body parameters with types and defaults
- [ ] **13.3** In JSDoc, document all response fields with types and meanings
- [ ] **13.4** In JSDoc, add example request body in JSON format
- [ ] **13.5** In JSDoc, add example success response in JSON format
- [ ] **13.6** In JSDoc, add example error responses (400, 401, 403, 500)
- [ ] **13.7** Document the skipManualEdits vs overwriteManual precedence rules
- [ ] **13.8** Document the ownership validation logic (what tables are checked)
- [ ] **13.9** Document performance considerations (batch size limits, query optimization)
- [ ] **13.10** Add inline code comments explaining complex logic (status filtering, job creation)
- [ ] **13.11** Document integration points with job queue system
- [ ] **13.12** Add "See Also" references to related endpoints (retry, manual override, status)

---

## 14. Final Verification and Manual Testing

**Context:** Perform end-to-end verification that the endpoint works correctly in realistic scenarios before marking complete.

**Files to modify:**
- None (verification only)

**Estimated effort:** 1 story point

- [ ] **14.1** Run `npx tsc --noEmit` to verify no TypeScript errors
- [ ] **14.2** Run `npm run build` to verify endpoint compiles correctly
- [ ] **14.3** Run `npm test` to verify all tests pass
- [ ] **14.4** Run `npm run lint` and fix any linting issues
- [ ] **14.5** Start development server and test POST request with curl or Postman using valid authentication
- [ ] **14.6** Test with single entity: verify job is created and response is accurate
- [ ] **14.7** Test with multiple entities (5-10): verify bulk processing works
- [ ] **14.8** Test with entities having manual translations: verify skipManualEdits works (entities skipped)
- [ ] **14.9** Test with overwriteManual=true: verify manual translations are re-queued
- [ ] **14.10** Test with language filter: verify only specified languages are queued
- [ ] **14.11** Test with entities from different properties: verify ownership validation works
- [ ] **14.12** Test with unauthenticated request: verify 401 response
- [ ] **14.13** Test with invalid request body: verify 400 response with clear error message
- [ ] **14.14** Check database to verify translation_jobs table has new records after successful request
- [ ] **14.15** Verify job queue processor can pick up and process the created jobs
- [ ] **14.16** Test OPTIONS request: verify CORS headers are present
- [ ] **14.17** Document any discovered issues or edge cases
- [ ] **14.18** Commit all changes with message: "[REQ-E05-003] Create re-translate API endpoint"

---

## Status Tracking

**Overall Status:** PENDING
**Phase:** Implementation
**Estimated Total Effort:** 14 story points
**Completion:** 0/14 tasks completed

---

## Notes for Implementation Agent

1. **Relationship to Retry Endpoint**: The existing `/api/translations/retry/route.ts` endpoint retries *failed* jobs. This new endpoint creates *new* jobs for any entities, regardless of current translation status. They serve different purposes.

2. **Job Deduplication**: The `createTranslationJob()` function uses upsert with `ignoreDuplicates: true` on `(entity_type, entity_id, target_language)`. If a job already exists for an entity+language, it won't create a duplicate.

3. **Performance Critical**: This endpoint handles bulk operations. Always use batch queries with `IN` operator. Never loop through entities with individual queries.

4. **Security Critical**: Ownership validation must be bulletproof. Users should only be able to re-translate their own content. Test thoroughly with cross-property scenarios.

5. **Manual Edit Protection**: The `skipManualEdits` flag protects human-reviewed translations. Default is `true` to prevent accidental overwrites. UI should show warning when using `overwriteManual=true`.

6. **Testing Strategy**:
   - Unit tests: Mock all dependencies, test individual functions
   - Integration tests: Mock database but test full request flow
   - Manual testing: Use real database in development environment

7. **Error Handling Philosophy**:
   - Validation errors: 400 with specific field-level errors
   - Auth errors: 401 for missing auth, 403 for insufficient permissions
   - Database errors: 500 with generic message (don't expose internals)
   - Partial success: If some jobs queue and others fail, return success with accurate counts

8. **Language Filtering**: If `languages` parameter is omitted, default to TARGET_LANGUAGES (fr, es, de, nl, it). English is never included in re-translation targets (it's the source language by default).

---

*Document created: 2026-01-22 22:48*
