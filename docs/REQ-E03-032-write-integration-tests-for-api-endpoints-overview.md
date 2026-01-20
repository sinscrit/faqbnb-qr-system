# Implementation Breakdown: REQ-E03-032 - Write Integration Tests for API Endpoints

**Last Modified:** 2026-01-20
**Request ID:** REQ-E03-032
**Epic:** Epic 3 - Dynamic Content Translation
**Phase:** 7 - Testing & Validation
**Task ID:** 7.3
**Size:** M (Medium)
**Depends On:** REQ-E03-021, REQ-E03-022, REQ-E03-023, REQ-E03-008, REQ-E03-009

---

## Summary

This document provides an implementation breakdown for creating comprehensive integration tests that verify API endpoints correctly trigger translation jobs and return expected responses for content creation and translation management operations.

---

## Context

### Current State
- API endpoints exist for items (`/api/admin/items`) and articles (`/api/admin/articles`) without translation integration
- Translation management endpoints are being created as part of Epic 3 (status, retry, manual override)
- Existing test infrastructure uses Vitest with jsdom environment
- Integration test patterns established in components like `EmptyStates.integration.test.tsx`
- Test coverage configuration exists in `vitest.config.ts`

### Expected Outcome
Integration tests that verify:
1. Item creation API triggers translation jobs for all supported languages
2. Article creation API triggers translation jobs for all supported languages
3. Translation status endpoint returns accurate status information
4. Retry endpoint successfully requeues failed translation jobs
5. Manual override endpoint correctly updates translations

### Dependencies (from Epic 3)
| Dependency | Purpose | Status |
|------------|---------|--------|
| REQ-E03-008 | Items API modification to trigger translations | Required |
| REQ-E03-009 | Articles API modification to trigger translations | Required |
| REQ-E03-021 | Translation status API endpoint | Required |
| REQ-E03-022 | Retry failed translations endpoint | Required |
| REQ-E03-023 | Manual translation override endpoint | Required |
| REQ-E03-001 | Content translation module structure | Required |

---

## Technical Approach

### Test Framework Configuration
The project uses Vitest with the following configuration:
- **Environment:** jsdom
- **Setup file:** `./vitest.setup.ts`
- **Test pattern:** `src/**/*.test.ts`, `src/**/*.test.tsx`
- **Timeout:** 10 seconds for integration tests

### Integration Test Strategy
Integration tests will verify end-to-end API behavior by:
1. Mocking Supabase database operations
2. Mocking translation service calls
3. Verifying API request/response contracts
4. Checking database state changes via mock assertions
5. Testing error scenarios and edge cases

### Target Languages (6 supported)
- English (en) - source language
- French (fr)
- Spanish (es)
- German (de)
- Dutch (nl)
- Italian (it)

---

## Implementation Tasks

### Task 1: Create Test File Structure and Setup
**File:** `src/app/api/admin/__tests__/translation-integration.test.ts`

**Actions:**
1. Create new test file for translation API integration tests
2. Set up Vitest imports and mock configurations
3. Configure Supabase client mocks for database operations
4. Create mock translation service for job queue verification
5. Set up authentication mock helpers for admin API access

**Mock Setup Requirements:**
```typescript
// Mocks needed:
- @/lib/supabase (supabase client)
- @/lib/supabase-server (createSupabaseServer)
- @/lib/auth-server (validateAdminAuth)
- @/lib/content-translation (queueContentTranslations)
```

### Task 2: Implement Item Creation Translation Tests
**Test Suite:** `describe('Item Creation Translation Triggers')`

**Test Cases:**
1. `it('triggers translation jobs for all 5 target languages when item is created')`
   - Create item via POST /api/admin/items
   - Verify `queueContentTranslations` called with item entity type
   - Assert 5 translation jobs queued (en->fr, en->es, en->de, en->nl, en->it)
   - Verify response includes `translationJobIds` array

2. `it('includes source language from user preferences')`
   - Mock user with preferred_language = 'fr'
   - Create item via POST
   - Verify translation source language is 'fr'

3. `it('allows sourceLanguage override in request body')`
   - Create item with explicit `sourceLanguage: 'es'`
   - Verify translation uses 'es' as source language

4. `it('handles translation queue failures gracefully')`
   - Mock queueContentTranslations to throw error
   - Verify item creation still succeeds
   - Verify response indicates translation queue failure

5. `it('does not trigger translations when validation fails')`
   - Send invalid item request (missing required fields)
   - Verify no translation jobs queued
   - Verify 400 error response

### Task 3: Implement Article Creation Translation Tests
**Test Suite:** `describe('Article Creation Translation Triggers')`

**Test Cases:**
1. `it('triggers translation jobs for all 5 target languages when article is created')`
   - Create article via POST /api/admin/articles
   - Verify `queueContentTranslations` called with article entity type
   - Assert jobs include title and description fields

2. `it('extracts title and description fields for translation')`
   - Create article with title and description
   - Verify translation payload includes both fields

3. `it('handles articles without description')`
   - Create article with title only (no description)
   - Verify translation still queues for title field

4. `it('associates translations with correct article ID')`
   - Create article
   - Verify entity_id in translation job matches article ID

### Task 4: Implement Translation Status Endpoint Tests
**Test Suite:** `describe('Translation Status Endpoint')`

**Endpoint:** `GET /api/translations/status/{entityType}/{entityId}`

**Test Cases:**
1. `it('returns correct status for fully translated content')`
   - Mock all language translations as completed
   - Verify overallStatus: 'complete'
   - Verify completionPercentage: 100

2. `it('returns correct status for partially translated content')`
   - Mock 3 languages completed, 2 pending
   - Verify overallStatus: 'partial'
   - Verify pendingLanguages array contains correct codes

3. `it('returns correct status for content with failed translations')`
   - Mock 1 translation failed
   - Verify failedLanguages array populated
   - Verify overallStatus: 'has_failures'

4. `it('returns correct status for pending translations')`
   - Mock all jobs in queued/processing state
   - Verify overallStatus: 'pending'

5. `it('returns 400 for invalid entity type')`
   - Request status for entityType: 'invalid'
   - Verify 400 error response

6. `it('returns 404 for non-existent entity')`
   - Request status for non-existent entityId
   - Verify 404 error response

7. `it('includes correct cache headers for completed translations')`
   - Verify Cache-Control: max-age=60 for complete status

8. `it('includes no-cache header for pending translations')`
   - Verify Cache-Control: no-cache for pending status

### Task 5: Implement Retry Endpoint Tests
**Test Suite:** `describe('Retry Failed Translations Endpoint')`

**Endpoint:** `POST /api/translations/retry`

**Test Cases:**
1. `it('successfully requeues failed translation jobs')`
   - Create mock failed jobs in database
   - Call retry endpoint
   - Verify jobs status changed to 'queued'
   - Verify retry_count reset to 0

2. `it('requeues only specified languages when provided')`
   - Create failed jobs for multiple languages
   - Call retry with languages: ['fr', 'de']
   - Verify only fr and de jobs requeued

3. `it('returns correct count of requeued jobs')`
   - Mock 3 failed jobs
   - Verify response shows jobsQueued: 3

4. `it('returns success with zero count when no failed jobs exist')`
   - Mock entity with all completed translations
   - Call retry
   - Verify jobsQueued: 0, success: true

5. `it('returns 404 for non-existent entity')`
   - Call retry for non-existent entityId
   - Verify 404 error response

6. `it('clears error_message when resetting jobs')`
   - Mock failed job with error_message
   - Call retry
   - Verify error_message cleared in database

7. `it('updates status_updated_at timestamp')`
   - Call retry
   - Verify status_updated_at is current time

### Task 6: Implement Manual Override Endpoint Tests
**Test Suite:** `describe('Manual Translation Override Endpoint')`

**Endpoint:** `PUT /api/translations/{entityType}/{entityId}/{language}`

**Test Cases:**
1. `it('successfully updates translation with manual override')`
   - Call endpoint with translated field values
   - Verify translation record updated in database
   - Verify translation_status set to 'manual'

2. `it('records reviewed_by with current user ID')`
   - Call endpoint as authenticated user
   - Verify reviewed_by field matches user ID

3. `it('accepts only valid fields for item translations')`
   - For item: accept name, description
   - Reject invalid fields with 400 error

4. `it('accepts only valid fields for article translations')`
   - For article: accept title, description
   - Reject invalid fields with 400 error

5. `it('accepts only title field for link translations')`
   - For link: accept title only
   - Reject URL field with 400 error

6. `it('returns 403 when user lacks edit permission')`
   - Mock user without entity access
   - Verify 403 error response

7. `it('returns 404 for unsupported language code')`
   - Call with language: 'xx'
   - Verify 404 error response

8. `it('performs UPSERT when translation does not exist')`
   - Call override for entity without existing translation
   - Verify new record created

9. `it('performs UPSERT when translation already exists')`
   - Mock existing translation
   - Call override with new values
   - Verify record updated, not duplicated

### Task 7: Implement Error Scenario Tests
**Test Suite:** `describe('Error Handling Scenarios')`

**Test Cases:**
1. `it('handles database connection errors gracefully')`
   - Mock Supabase to throw connection error
   - Verify 500 response with appropriate error message

2. `it('handles invalid content IDs')`
   - Test with malformed UUID
   - Verify 400 error response

3. `it('handles unsupported language codes')`
   - Test with language code not in supported list
   - Verify appropriate error response

4. `it('handles missing translations table gracefully')`
   - Mock database table not found error
   - Verify graceful error handling

5. `it('handles concurrent retry requests')`
   - Simulate concurrent retry calls
   - Verify no duplicate job creation

### Task 8: Add Test Utilities and Helpers
**File:** `src/app/api/admin/__tests__/translation-test-utils.ts`

**Utilities to Create:**
1. `createMockItem()` - Generate test item data
2. `createMockArticle()` - Generate test article data
3. `createMockTranslationJob()` - Generate translation job record
4. `createMockTranslation()` - Generate translation record
5. `mockAuthenticatedRequest()` - Create authenticated API request
6. `assertTranslationJobsQueued()` - Verify jobs created in database
7. `assertTranslationStatus()` - Verify status response structure

---

## Authorized Files and Functions for Modification

### New Files to Create
| File Path | Purpose |
|-----------|---------|
| `src/app/api/admin/__tests__/translation-integration.test.ts` | Main integration test file |
| `src/app/api/admin/__tests__/translation-test-utils.ts` | Test utility functions |

### Existing Files to Modify
| File Path | Modifications |
|-----------|---------------|
| `vitest.config.ts` | Add API test paths to coverage include |

### Functions/Modules to Test
| Module | Function/Endpoint | Test Coverage |
|--------|-------------------|---------------|
| `/api/admin/items` | POST | Translation trigger on create |
| `/api/admin/articles` | POST | Translation trigger on create |
| `/api/translations/status/[entityType]/[entityId]` | GET | Status retrieval |
| `/api/translations/retry` | POST | Job requeue |
| `/api/translations/[entityType]/[entityId]/[language]` | PUT | Manual override |

---

## Test Data Requirements

### Mock Entities
```typescript
// Sample item for testing
const mockItem = {
  id: 'item-uuid-123',
  public_id: 'test-item-001',
  name: 'Coffee Machine',
  description: 'Instructions for the coffee machine',
  property_id: 'prop-uuid-456',
  source_language: 'en'
};

// Sample article for testing
const mockArticle = {
  id: 'article-uuid-789',
  item_id: 'item-uuid-123',
  purpose: 'how_to_use',
  title: 'How to Use the Coffee Machine',
  description: 'Step-by-step instructions...',
  source_language: 'en'
};

// Sample translation job
const mockTranslationJob = {
  id: 'job-uuid-001',
  entity_type: 'item',
  entity_id: 'item-uuid-123',
  source_language: 'en',
  target_language: 'fr',
  status: 'queued',
  priority: 100,
  attempts: 0
};
```

---

## Acceptance Criteria Verification

| Criteria | Test(s) |
|----------|---------|
| Item creation triggers translations for all target languages | Task 2, Test 1 |
| Article creation triggers translations for all target languages | Task 3, Test 1 |
| Translation status endpoint returns correct status | Task 4, Tests 1-8 |
| Retry endpoint requeues failed jobs and updates status | Task 5, Tests 1-7 |
| Manual override endpoint updates content and sets manual flag | Task 6, Tests 1-9 |
| Tests use realistic test data | Task 8 utilities |
| Tests include error scenarios | Task 7, Tests 1-5 |
| Test suite runs successfully in CI/CD pipeline | All tasks |

---

## Implementation Notes

### Mock Strategy
Use `vi.mock()` to intercept:
- Supabase client for database operations
- Translation service for queue verification
- Authentication for admin access simulation

### Database State Verification
Since these are integration tests (not full E2E), verify database state changes through mock assertions rather than actual database queries.

### Authentication Testing
All endpoints require admin authentication. Tests should:
1. Mock `validateAdminAuth` to return authenticated user
2. Include tests for unauthenticated requests (401)
3. Include tests for unauthorized access (403)

### Parallel Test Execution
Tests should be independent and safe for parallel execution:
- Use unique IDs for each test case
- Reset mocks in beforeEach blocks
- Avoid shared mutable state

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Tests become flaky due to timing | Use explicit waits and mock timers |
| Mock drift from actual implementation | Review mocks when implementation changes |
| Missing edge cases | Add error scenario tests |
| CI environment differences | Use consistent mock configuration |

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- Existing Integration Test Pattern: `src/components/SimpleDashboard/__tests__/EmptyStates.integration.test.tsx`
- Vitest Configuration: `vitest.config.ts`
- Items API: `src/app/api/admin/items/route.ts`
- Articles API: `src/app/api/admin/articles/route.ts`
- API Test Pattern: `src/__tests__/back-office.test.ts`
