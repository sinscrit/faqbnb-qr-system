# Create Translation Status API Endpoint - Detailed Implementation Tasks

**Generated:** 2026-01-22 22:23
**Reference Documents:**
- Requirements: docs/gen_requests_epic5.md (REQ-E05-001)
- Overview: docs/REQ-E05-001-create-translation-status-api-endpoint-overview.md
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

## 1. Create API Route Types File

**Context:** The translation status API needs strongly-typed interfaces for requests, responses, and internal data structures. Following the established pattern from `/src/app/api/translations/status/batch/types.ts`, we create a dedicated types file to define all type contracts.

**Files to modify:**
- `/src/app/api/translations/status/types.ts` (new file)

**Estimated effort:** 1 story point

- [ ] **1.1** Create `/src/app/api/translations/status/types.ts` file with file header comment documenting this is part of REQ-E05-001
- [ ] **1.2** Define `TranslationStatusQueryParams` interface with optional fields: `entityType`, `entityId`, `status`, `propertyId` (all strings)
- [ ] **1.3** Define `SupportedLanguage` type alias as union: 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it'
- [ ] **1.4** Define `TranslationStatus` type as union: 'pending' | 'processing' | 'completed' | 'failed' | 'manual'
- [ ] **1.5** Define `LanguageStatusDetail` interface with fields: `status` (TranslationStatus), `translatedAt` (optional string), `isStale` (optional boolean), `reviewedBy` (optional string)
- [ ] **1.6** Define `ItemTranslationStatus` interface with fields: `entityType` ('item' | 'article' | 'link' | 'tag'), `entityId` (string), `name` (string), `sourceLanguage` (SupportedLanguage), `translations` (Record<SupportedLanguage, LanguageStatusDetail>)
- [ ] **1.7** Define `TranslationStatusSummary` interface with fields: `total` (number), `complete` (number), `pending` (number), `failed` (number), `manual` (number)
- [ ] **1.8** Define `TranslationStatusResponse` interface with fields: `success` (boolean), `summary` (TranslationStatusSummary), `items` (ItemTranslationStatus[]), `error` (optional string)
- [ ] **1.9** Add JSDoc comments to all exported types explaining their purpose and usage

---

## 2. Create API Route Handler File Structure

**Context:** Following Next.js 15 App Router conventions, create the route handler at `/src/app/api/translations/status/route.ts`. This endpoint provides aggregated translation status data distinct from the existing single-entity status endpoint at `/src/app/api/translations/status/[entityType]/[entityId]/route.ts`.

**Files to modify:**
- `/src/app/api/translations/status/route.ts` (new file)

**Estimated effort:** 1 story point

- [ ] **2.1** Create `/src/app/api/translations/status/route.ts` with file header comment documenting REQ-E05-001 and creation date 2026-01-22
- [ ] **2.2** Import `NextRequest` and `NextResponse` from 'next/server'
- [ ] **2.3** Import `validateAdminAuth` from '@/lib/auth-server'
- [ ] **2.4** Import `supabaseAdmin` from '@/lib/supabase'
- [ ] **2.5** Import all types from './types'
- [ ] **2.6** Import `SupportedLanguage` from '@/lib/translation-service/translation-service.types'
- [ ] **2.7** Define `TARGET_LANGUAGES` constant as array: ['fr', 'es', 'de', 'nl', 'it']
- [ ] **2.8** Define `VALID_ENTITY_TYPES` constant as array: ['item', 'article', 'link', 'tag']
- [ ] **2.9** Define `VALID_STATUS_VALUES` constant as array: ['pending', 'processing', 'completed', 'failed', 'manual']
- [ ] **2.10** Create empty `GET` async function that accepts `request: NextRequest` and returns `Promise<NextResponse>`
- [ ] **2.11** Create empty `OPTIONS` async function for CORS support that returns a NextResponse with status 204 and headers: 'Access-Control-Allow-Origin: *', 'Access-Control-Allow-Methods: GET, OPTIONS', 'Access-Control-Allow-Headers: Content-Type, Authorization'

---

## 3. Implement Request Validation and Authentication

**Context:** Security-first implementation ensures only authenticated users can access translation status data. Following the pattern from `/src/app/api/admin/items/route.ts` lines 17-90, validate user authentication and extract query parameters.

**Files to modify:**
- `/src/app/api/translations/status/route.ts`

**Estimated effort:** 1 story point

- [ ] **3.1** Inside the `GET` function, wrap all logic in a try-catch block that logs errors and returns HTTP 500 with error message
- [ ] **3.2** Call `validateAdminAuth(request)` and store the result in `authResult`
- [ ] **3.3** If `authResult.error` exists, return `authResult.error` immediately
- [ ] **3.4** Extract the authenticated user from `authResult.user` and log the user ID and email
- [ ] **3.5** Parse URL query parameters using `new URL(request.url).searchParams`
- [ ] **3.6** Extract `entityType` from query params and validate it's either null or in VALID_ENTITY_TYPES array, return HTTP 400 if invalid
- [ ] **3.7** Extract `entityId` from query params as optional string
- [ ] **3.8** Extract `status` from query params and validate it's either null or in VALID_STATUS_VALUES array, return HTTP 400 if invalid
- [ ] **3.9** Extract `propertyId` from query params as optional string
- [ ] **3.10** Log the extracted and validated query parameters for debugging

---

## 4. Implement Property Access Validation

**Context:** Multi-tenant access control ensures users only see translation status for their own properties. Following the pattern from `/src/app/api/admin/items/route.ts` lines 17-90, validate property ownership via the `account_users` table.

**Files to modify:**
- `/src/app/api/translations/status/route.ts`

**Estimated effort:** 1 story point

- [ ] **4.1** Create a helper function `getAccessiblePropertyIds` that accepts `userId: string`, `propertyId: string | null`, `supabase` and returns `Promise<{ propertyIds: string[] | null, error?: NextResponse }>`
- [ ] **4.2** In `getAccessiblePropertyIds`, if `propertyId` is provided, query `account_users` table joining to `accounts` joining to `properties` to verify user has access to the specific property
- [ ] **4.3** In `getAccessiblePropertyIds`, if property access check fails, return error NextResponse with HTTP 403 and message 'Access denied to requested property'
- [ ] **4.4** In `getAccessiblePropertyIds`, if `propertyId` is provided and access check succeeds, return `{ propertyIds: [propertyId] }`
- [ ] **4.5** In `getAccessiblePropertyIds`, if `propertyId` is null, query all properties user has access to via `account_users` → `accounts` → `properties` chain
- [ ] **4.6** In `getAccessiblePropertyIds`, if no properties found, return error NextResponse with HTTP 403 and message 'No property access found for user'
- [ ] **4.7** In `getAccessiblePropertyIds`, return `{ propertyIds: [array of accessible property IDs] }`
- [ ] **4.8** In the main `GET` function, call `getAccessiblePropertyIds(authResult.user.id, propertyId, authResult.supabase)`
- [ ] **4.9** If the result contains an error, return the error immediately
- [ ] **4.10** Store the accessible property IDs for use in subsequent queries

---

## 5. Build Database Queries for Translation Status

**Context:** Query translation tables and translation_jobs to gather status data. Use efficient batch queries following the pattern from `/src/app/api/translations/status/batch/route.ts` to avoid N+1 query problems.

**Files to modify:**
- `/src/app/api/translations/status/route.ts`

**Estimated effort:** 1 story point

- [ ] **5.1** Create helper function `fetchEntitiesByType` that accepts `entityType: string`, `entityId: string | null`, `propertyIds: string[]`, `supabase` and returns entity records with their IDs and names
- [ ] **5.2** In `fetchEntitiesByType`, build a query for the entities table (items, item_articles, item_links) filtered by property_id in propertyIds array
- [ ] **5.3** In `fetchEntitiesByType`, if `entityId` is provided, add an additional filter for the specific entity ID
- [ ] **5.4** In `fetchEntitiesByType`, select fields: id, name (or title for articles/links), source_language, property_id
- [ ] **5.5** In `fetchEntitiesByType`, return array of entity records or empty array on error
- [ ] **5.6** Create helper function `fetchTranslationsForEntities` that accepts `entityType: string`, `entityIds: string[]` and returns translation records
- [ ] **5.7** In `fetchTranslationsForEntities`, determine the correct translation table name based on entityType ('item_translations', 'article_translations', 'link_translations', 'tag_translations')
- [ ] **5.8** In `fetchTranslationsForEntities`, query the translation table with filter for entity_id in entityIds array
- [ ] **5.9** In `fetchTranslationsForEntities`, select fields: entity_id (varies by table: item_id, article_id, etc.), language, translation_status, translated_at, reviewed_by
- [ ] **5.10** In `fetchTranslationsForEntities`, return array of translation records mapped to consistent field names
- [ ] **5.11** Create helper function `fetchPendingJobsForEntities` that accepts `entityType: string`, `entityIds: string[]` and returns job records
- [ ] **5.12** In `fetchPendingJobsForEntities`, query `translation_jobs` table filtered by entity_type = entityType AND entity_id in entityIds AND status in ('queued', 'processing')
- [ ] **5.13** In `fetchPendingJobsForEntities`, select fields: entity_id, target_language, status, created_at
- [ ] **5.14** In `fetchPendingJobsForEntities`, return array of job records

---

## 6. Aggregate Summary Counts

**Context:** Calculate summary counts per language showing complete, pending, and failed translations. This provides owners with a quick overview of translation coverage.

**Files to modify:**
- `/src/app/api/translations/status/route.ts`

**Estimated effort:** 1 story point

- [ ] **6.1** Create helper function `calculateSummary` that accepts `translations: TranslationRecord[]`, `jobs: JobRecord[]` and returns `TranslationStatusSummary`
- [ ] **6.2** In `calculateSummary`, initialize counters: total = 0, complete = 0, pending = 0, failed = 0, manual = 0
- [ ] **6.3** In `calculateSummary`, iterate through all translations and count those with status = 'completed' as complete
- [ ] **6.4** In `calculateSummary`, count translations with status = 'manual' as manual (also increment complete count)
- [ ] **6.5** In `calculateSummary`, count translations with status = 'failed' as failed
- [ ] **6.6** In `calculateSummary`, iterate through jobs with status 'queued' or 'processing' and count as pending
- [ ] **6.7** In `calculateSummary`, calculate total as the number of unique (entity_id, language) combinations across translations and jobs
- [ ] **6.8** In `calculateSummary`, return object with all counts: { total, complete, pending, failed, manual }
- [ ] **6.9** In the main `GET` function, after fetching all data, call `calculateSummary` with the combined translations and jobs
- [ ] **6.10** Store the summary result for inclusion in the response

---

## 7. Format Item-Level Status Response

**Context:** Build an array of entities with their translation status details. Enable UI to display item-by-item translation status with indicators for stale translations and manual edits.

**Files to modify:**
- `/src/app/api/translations/status/route.ts`

**Estimated effort:** 1 story point

- [ ] **7.1** Create helper function `buildItemStatus` that accepts `entity: EntityRecord`, `translations: TranslationRecord[]`, `jobs: JobRecord[]` and returns `ItemTranslationStatus`
- [ ] **7.2** In `buildItemStatus`, initialize an empty translations object: `Record<SupportedLanguage, LanguageStatusDetail>`
- [ ] **7.3** In `buildItemStatus`, for each TARGET_LANGUAGE, find matching translation record or job record
- [ ] **7.4** In `buildItemStatus`, if translation record exists with status 'completed' or 'manual', populate translation detail with status, translatedAt, reviewedBy
- [ ] **7.5** In `buildItemStatus`, if translation record status is 'failed', populate with status = 'failed'
- [ ] **7.6** In `buildItemStatus`, if no translation record but job exists with status 'queued' or 'processing', populate with status = 'pending'
- [ ] **7.7** In `buildItemStatus`, if neither translation nor job exists, populate with status = 'pending' (indicates translation needs to be created)
- [ ] **7.8** In `buildItemStatus`, for completed/manual translations, calculate isStale by comparing entity.updated_at with translation.translated_at (isStale = entity updated after translation)
- [ ] **7.9** In `buildItemStatus`, return object with entityType, entityId, name, sourceLanguage, translations map
- [ ] **7.10** In the main `GET` function, map all entities through `buildItemStatus` to create the items array
- [ ] **7.11** Apply status filter if provided: filter items array to only include items where at least one translation matches the requested status
- [ ] **7.12** Store the filtered items array for inclusion in the response

---

## 8. Build Response and Add Headers

**Context:** Construct the final API response with summary and items data, set appropriate cache headers for dynamic content, and implement comprehensive error handling.

**Files to modify:**
- `/src/app/api/translations/status/route.ts`

**Estimated effort:** 1 story point

- [ ] **8.1** In the main `GET` function, construct response object: `{ success: true, summary: summaryObject, items: itemsArray }`
- [ ] **8.2** Return NextResponse.json with the response object
- [ ] **8.3** Set response headers: 'Content-Type: application/json', 'Cache-Control: no-store'
- [ ] **8.4** Add CORS header if needed: 'Access-Control-Allow-Origin: *'
- [ ] **8.5** In the try-catch error handler, log the full error with stack trace
- [ ] **8.6** In the catch block, return NextResponse with status 500, body: `{ success: false, error: 'Internal server error' }`
- [ ] **8.7** Add console.log statements at key points: authentication success, property access validation, query execution, response construction
- [ ] **8.8** Test the endpoint manually with curl or Postman to verify it returns expected response structure
- [ ] **8.9** Test with invalid query parameters to verify 400 responses
- [ ] **8.10** Test with unauthenticated request to verify 401 response

---

## 9. Write Unit Tests for Query Parameter Validation

**Context:** Ensure query parameter validation logic works correctly with both valid and invalid inputs.

**Files to modify:**
- `/src/app/api/translations/status/__tests__/route.test.ts` (new file)

**Estimated effort:** 1 story point

- [ ] **9.1** Create test file `/src/app/api/translations/status/__tests__/route.test.ts` with imports for vitest and Next.js types
- [ ] **9.2** Write test: 'should accept valid entityType parameter' - test with 'item', 'article', 'link', 'tag'
- [ ] **9.3** Write test: 'should reject invalid entityType parameter' - test with 'invalid' and verify HTTP 400
- [ ] **9.4** Write test: 'should accept valid status parameter' - test with 'pending', 'completed', 'failed', 'manual'
- [ ] **9.5** Write test: 'should reject invalid status parameter' - test with 'invalid' and verify HTTP 400
- [ ] **9.6** Write test: 'should accept entityId as optional parameter' - test with and without entityId
- [ ] **9.7** Write test: 'should accept propertyId as optional parameter' - test with and without propertyId
- [ ] **9.8** Run tests with `npm test` and verify all tests pass
- [ ] **9.9** Check test coverage for validation functions with `npm run test:coverage`
- [ ] **9.10** Add additional test cases for edge cases discovered during implementation

---

## 10. Write Integration Tests for Property Access Control

**Context:** Verify multi-tenant access control works correctly and users can only access their own properties.

**Files to modify:**
- `/src/app/api/translations/status/__tests__/route.test.ts`

**Estimated effort:** 1 story point

- [ ] **10.1** Write test: 'should return 401 for unauthenticated requests' - mock request without auth token
- [ ] **10.2** Write test: 'should return 403 when user has no property access' - mock user with no account_users records
- [ ] **10.3** Write test: 'should return 403 when requesting inaccessible property' - mock propertyId user doesn't own
- [ ] **10.4** Write test: 'should return status for accessible properties only' - mock user with specific property access
- [ ] **10.5** Write test: 'should return status for all user properties when propertyId omitted' - mock user with multiple properties
- [ ] **10.6** Mock Supabase client responses using vitest.mock to simulate database queries
- [ ] **10.7** Mock `validateAdminAuth` to return test user data
- [ ] **10.8** Run integration tests with `npm test` and verify all pass
- [ ] **10.9** Verify test output shows correct property filtering behavior
- [ ] **10.10** Document any test setup requirements in test file comments

---

## 11. Write Integration Tests for Status Aggregation

**Context:** Verify summary counts and item-level status calculations are accurate across different scenarios.

**Files to modify:**
- `/src/app/api/translations/status/__tests__/route.test.ts`

**Estimated effort:** 1 story point

- [ ] **11.1** Write test: 'should calculate correct summary counts with mixed statuses' - mock entities with various translation statuses
- [ ] **11.2** Write test: 'should include pending jobs in summary' - mock queued/processing jobs and verify pending count
- [ ] **11.3** Write test: 'should mark translations as stale when source updated after translation' - mock entity with updated_at > translated_at
- [ ] **11.4** Write test: 'should identify manual translations correctly' - mock translation with status='manual' and reviewedBy set
- [ ] **11.5** Write test: 'should handle entities with no translations' - mock entity with no translation records
- [ ] **11.6** Write test: 'should handle entities with partial translations' - mock entity with 2/5 languages complete
- [ ] **11.7** Write test: 'should filter items by status parameter' - request with status='failed' and verify only failed items returned
- [ ] **11.8** Run all tests with `npm test` and verify pass rate
- [ ] **11.9** Review test coverage report and add tests for uncovered branches
- [ ] **11.10** Run typecheck with `npx tsc --noEmit` to ensure no type errors in test file

---

## 12. Verify and Document API Endpoint

**Context:** Final verification that the endpoint works end-to-end and documentation is complete.

**Files to modify:**
- `/src/app/api/translations/status/route.ts`
- `/src/app/api/translations/status/types.ts`

**Estimated effort:** 1 story point

- [ ] **12.1** Run `npm run build` to verify the endpoint compiles without errors
- [ ] **12.2** Run `npx tsc --noEmit` to verify no TypeScript errors
- [ ] **12.3** Run `npm test` to verify all tests pass
- [ ] **12.4** Test endpoint manually with authenticated request and valid query params
- [ ] **12.5** Verify response matches TypeScript types defined in types.ts
- [ ] **12.6** Verify summary counts are accurate based on test data
- [ ] **12.7** Verify items array contains correct translation status per language
- [ ] **12.8** Add JSDoc comments to GET function documenting query parameters and response structure
- [ ] **12.9** Add example request/response to file header comments
- [ ] **12.10** Commit changes with message: "[REQ-E05-001] Create translation status API endpoint"

---

## Status Tracking

**Overall Status:** PENDING
**Phase:** Implementation
**Estimated Total Effort:** 12 story points
**Completion:** 0/12 tasks completed

---

## Notes for Implementation Agent

1. **Database Schema**: The following tables are used and must exist:
   - `items`, `item_articles`, `item_links` (entity tables)
   - `item_translations`, `article_translations`, `link_translations`, `tag_translations` (translation tables)
   - `translation_jobs` (job queue)
   - `properties`, `accounts`, `account_users` (access control)

2. **Existing Patterns**: Reference these files for established patterns:
   - `/src/app/api/translations/status/batch/route.ts` - batch query pattern
   - `/src/app/api/admin/items/route.ts` - property access validation pattern
   - `/src/lib/auth-server.ts` - authentication validation

3. **Type Safety**: All database queries must use proper TypeScript types. Do not use `any` type.

4. **Error Handling**: All database errors must be caught and logged. Return appropriate HTTP status codes.

5. **Testing**: Mock Supabase client and auth validation for unit tests. Do not connect to real database in tests.

---

*Document created: 2026-01-22 22:23*
