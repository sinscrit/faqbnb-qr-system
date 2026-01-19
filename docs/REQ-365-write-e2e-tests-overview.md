# REQ-365: Write End-to-End Tests for Translation Workflows - Implementation Overview

**Generated:** 2026-01-19 16:00:00 UTC
**Last Modified:** 2026-01-19 16:00:00 UTC
**Request Reference:** REQ-365 in `/docs/gen_requests_epic3.md`
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
**Phase:** 7 - Testing & Validation
**Task ID:** 7.4
**Size:** L (Large)
**Type:** ENHANCEMENT

---

## Summary

Create comprehensive end-to-end tests that validate complete translation workflows from content creation through background job processing to final translation storage and status verification. These tests ensure that the entire translation pipeline functions correctly as an integrated system, catching issues that unit and integration tests might miss.

---

## Implementation Context

### Background

The translation system involves multiple components working in concert:
1. **API endpoints** for content creation (items, articles, links)
2. **Job queue management** for queueing translation work
3. **Background job processor** for executing translations
4. **Translation service** for calling external translation APIs
5. **Database storage** for persisted translations
6. **Status API endpoints** for monitoring translation progress

Currently, these components are tested in isolation. End-to-end tests are needed to validate:
- Content creation properly queues translation jobs
- Jobs transition through expected states (queued → processing → completed/failed)
- Translated content is correctly stored
- Status endpoints accurately reflect actual state
- Retry mechanisms successfully recover from failures

### Dependencies

| Prerequisite | Reference | Status Check |
|--------------|-----------|--------------|
| Content translation module | Phase 1 (Epic 3) | Files exist: `src/lib/content-translation/` |
| Modified Items API | Task 2.2 | Translation triggers in `src/app/api/admin/items/route.ts` |
| Modified Articles API | Task 2.3 | Translation triggers in `src/app/api/admin/articles/route.ts` |
| Translation status endpoint | Task 4.1 | File exists: `src/app/api/translations/status/` |
| Retry endpoint | Task 4.2 | File exists: `src/app/api/translations/retry/route.ts` |
| Job processor | REQ-244 | File exists: `src/lib/job-queue/job-processor.ts` |
| Integration tests | REQ-364 | Tests exist in `src/lib/job-queue/__tests__/` |

---

## Technical Approach

### E2E Test Architecture

```
/src/__tests__/e2e/translations/
├── helpers/
│   ├── index.ts                    # Re-exports all helpers
│   ├── testEnvironment.ts          # Test environment setup/teardown
│   ├── mockTranslationService.ts   # Deterministic mock for external APIs
│   ├── apiClient.ts                # HTTP client for API calls
│   ├── databaseHelpers.ts          # Direct DB access for verification
│   └── waitStrategies.ts           # Polling utilities with timeout
├── item-translation.e2e.test.ts    # Item creation → translation flow
├── article-translation.e2e.test.ts # Article creation → translation flow
├── link-translation.e2e.test.ts    # Link creation → translation flow
├── tag-translation.e2e.test.ts     # Tag translation reuse tests
├── retry-workflow.e2e.test.ts      # Failure → retry → success flow
├── status-tracking.e2e.test.ts     # Status endpoint accuracy tests
└── batch-status.e2e.test.ts        # Batch status endpoint tests
```

### Test Environment Strategy

E2E tests will use:
1. **Isolated test database** - Separate from development/production
2. **Mock translation service** - Returns deterministic translations
3. **Real job processor** - Actual processing logic with mocked external calls
4. **Real API routes** - Full request/response cycle
5. **Polling-based waits** - Avoid flaky fixed delays

### Data Flow Under Test

```
Test creates content via API
        │
        ▼
┌─────────────────────────────────┐
│ API Route (items/articles/links)│
│                                 │
│ 1. Save content to database     │
│ 2. Queue translation jobs       │
│ 3. Return success + job IDs     │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│ Test verifies:                  │
│ - Jobs exist in translation_jobs│
│ - Jobs have status = 'queued'   │
│ - Jobs have correct metadata    │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│ Background Job Processor        │
│ (triggered within test)         │
│                                 │
│ 1. Pick up queued job           │
│ 2. Call mock translation service│
│ 3. Store translated content     │
│ 4. Mark job completed           │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│ Test verifies:                  │
│ - Job status = 'completed'      │
│ - Translations in *_translations│
│ - Status endpoint returns data  │
└─────────────────────────────────┘
```

---

## Ordered Task List

### Phase 1: Test Infrastructure Setup (Tasks 7.4.1-7.4.5)

| Task | Description | Est. SP | Dependencies |
|------|-------------|---------|--------------|
| 7.4.1 | Create E2E test directory structure | 0.25 | None |
| 7.4.2 | Implement test environment setup/teardown | 0.5 | 7.4.1 |
| 7.4.3 | Create mock translation service for E2E | 0.5 | 7.4.1 |
| 7.4.4 | Implement API client utilities | 0.5 | 7.4.1 |
| 7.4.5 | Implement database verification helpers | 0.5 | 7.4.1 |

### Phase 2: Wait Strategy Utilities (Task 7.4.6)

| Task | Description | Est. SP | Dependencies |
|------|-------------|---------|--------------|
| 7.4.6 | Implement polling-based wait strategies | 0.5 | 7.4.2, 7.4.5 |

### Phase 3: Core Workflow Tests (Tasks 7.4.7-7.4.11)

| Task | Description | Est. SP | Dependencies |
|------|-------------|---------|--------------|
| 7.4.7 | Write item creation → translation E2E test | 1.0 | 7.4.2-7.4.6 |
| 7.4.8 | Write article creation → translation E2E test | 0.5 | 7.4.7 |
| 7.4.9 | Write link creation → translation E2E test | 0.5 | 7.4.7 |
| 7.4.10 | Write tag translation reuse E2E test | 0.5 | 7.4.7 |
| 7.4.11 | Write translation job state transition tests | 0.5 | 7.4.7 |

### Phase 4: Failure and Recovery Tests (Tasks 7.4.12-7.4.14)

| Task | Description | Est. SP | Dependencies |
|------|-------------|---------|--------------|
| 7.4.12 | Write translation failure detection test | 0.5 | 7.4.7 |
| 7.4.13 | Write retry endpoint E2E test | 0.5 | 7.4.12 |
| 7.4.14 | Write retry → successful completion E2E test | 0.5 | 7.4.13 |

### Phase 5: Status Tracking Tests (Tasks 7.4.15-7.4.17)

| Task | Description | Est. SP | Dependencies |
|------|-------------|---------|--------------|
| 7.4.15 | Write status endpoint accuracy tests | 0.5 | 7.4.7 |
| 7.4.16 | Write batch status endpoint E2E tests | 0.5 | 7.4.15 |
| 7.4.17 | Write real-time status progression test | 0.5 | 7.4.15 |

### Phase 6: Test Suite Finalization (Tasks 7.4.18-7.4.19)

| Task | Description | Est. SP | Dependencies |
|------|-------------|---------|--------------|
| 7.4.18 | Update vitest config for E2E tests | 0.25 | 7.4.7 |
| 7.4.19 | Run full E2E suite and verify < 5 min runtime | 0.25 | All above |

**Total Estimated Effort:** 8.75 story points

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/__tests__/e2e/translations/helpers/index.ts` | Re-exports all E2E helper modules |
| `src/__tests__/e2e/translations/helpers/testEnvironment.ts` | Setup/teardown for E2E test environment |
| `src/__tests__/e2e/translations/helpers/mockTranslationService.ts` | Deterministic mock translation service |
| `src/__tests__/e2e/translations/helpers/apiClient.ts` | HTTP client for API endpoint calls |
| `src/__tests__/e2e/translations/helpers/databaseHelpers.ts` | Direct database access for verification |
| `src/__tests__/e2e/translations/helpers/waitStrategies.ts` | Polling utilities with configurable timeout |
| `src/__tests__/e2e/translations/item-translation.e2e.test.ts` | Item translation workflow E2E tests |
| `src/__tests__/e2e/translations/article-translation.e2e.test.ts` | Article translation workflow E2E tests |
| `src/__tests__/e2e/translations/link-translation.e2e.test.ts` | Link translation workflow E2E tests |
| `src/__tests__/e2e/translations/tag-translation.e2e.test.ts` | Tag translation reuse E2E tests |
| `src/__tests__/e2e/translations/retry-workflow.e2e.test.ts` | Retry workflow E2E tests |
| `src/__tests__/e2e/translations/status-tracking.e2e.test.ts` | Status endpoint E2E tests |
| `src/__tests__/e2e/translations/batch-status.e2e.test.ts` | Batch status endpoint E2E tests |

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `vitest.config.ts` | Add E2E test pattern, increase timeout for E2E tests |
| `package.json` | Add `test:e2e` script for running E2E tests separately |

---

## Technical Specifications

### Mock Translation Service Interface

```typescript
// src/__tests__/e2e/translations/helpers/mockTranslationService.ts

export interface MockTranslationServiceConfig {
  /** Default behavior: success or failure */
  defaultBehavior: 'success' | 'failure';
  /** Specific entity configurations (override default) */
  entityOverrides?: Map<string, 'success' | 'failure'>;
  /** Simulated processing delay in ms */
  processingDelayMs?: number;
  /** Error message when failing */
  errorMessage?: string;
}

export function createMockTranslationService(
  config: MockTranslationServiceConfig
): MockTranslationService;

export function configureMockForSuccess(): void;
export function configureMockForFailure(errorMessage: string): void;
export function resetMockTranslationService(): void;
```

### Wait Strategy Interface

```typescript
// src/__tests__/e2e/translations/helpers/waitStrategies.ts

export interface WaitOptions {
  /** Maximum time to wait in ms (default: 30000) */
  timeoutMs?: number;
  /** Interval between checks in ms (default: 500) */
  pollIntervalMs?: number;
  /** Custom error message on timeout */
  timeoutMessage?: string;
}

/**
 * Waits for translation jobs to reach expected status.
 * Uses polling with configurable timeout.
 */
export async function waitForJobStatus(
  entityType: EntityType,
  entityId: string,
  expectedStatus: JobStatus,
  options?: WaitOptions
): Promise<TranslationJob[]>;

/**
 * Waits for translations to appear in storage tables.
 */
export async function waitForTranslationsStored(
  entityType: EntityType,
  entityId: string,
  expectedLanguages: SupportedLanguage[],
  options?: WaitOptions
): Promise<void>;

/**
 * Waits for status endpoint to return expected overall status.
 */
export async function waitForStatusEndpoint(
  entityType: EntityType,
  entityId: string,
  expectedOverallStatus: 'complete' | 'partial' | 'pending' | 'failed',
  options?: WaitOptions
): Promise<TranslationStatusResult>;
```

### Database Helper Interface

```typescript
// src/__tests__/e2e/translations/helpers/databaseHelpers.ts

/**
 * Gets translation jobs for an entity directly from database.
 */
export async function getTranslationJobs(
  entityType: EntityType,
  entityId: string
): Promise<TranslationJob[]>;

/**
 * Gets stored translations for an entity.
 */
export async function getStoredTranslations(
  entityType: EntityType,
  entityId: string
): Promise<Map<SupportedLanguage, TranslationRecord>>;

/**
 * Cleans up test data created during E2E tests.
 */
export async function cleanupTestData(testRunId: string): Promise<void>;

/**
 * Seeds necessary test data (supported languages, etc).
 */
export async function seedTestData(): Promise<void>;
```

### API Client Interface

```typescript
// src/__tests__/e2e/translations/helpers/apiClient.ts

export interface ApiClient {
  createItem(data: CreateItemRequest): Promise<CreateItemResponse>;
  createArticle(data: CreateArticleRequest): Promise<CreateArticleResponse>;
  createLink(itemId: string, data: CreateLinkRequest): Promise<CreateLinkResponse>;
  getTranslationStatus(entityType: EntityType, entityId: string): Promise<TranslationStatusResponse>;
  getBatchStatus(entities: {type: EntityType, id: string}[]): Promise<BatchStatusResponse>;
  retryFailedTranslations(request: RetryTranslationRequest): Promise<RetryTranslationResponse>;
}

export function createApiClient(baseUrl: string, authToken: string): ApiClient;
```

---

## Test Scenarios

### Scenario 1: Item Creation → Complete Translation (Task 7.4.7)

```typescript
describe('Item Translation E2E', () => {
  it('creates item and completes translation workflow', async () => {
    // 1. Create item via API
    const createResponse = await apiClient.createItem({
      publicId: `test-item-${testRunId}`,
      name: 'Coffee Maker',
      description: 'Instructions for the coffee maker',
      propertyId: testPropertyId,
    });

    expect(createResponse.success).toBe(true);
    expect(createResponse.translationJobIds).toHaveLength(5); // 5 target languages

    // 2. Verify jobs queued in database
    const jobs = await getTranslationJobs('item', createResponse.data.id);
    expect(jobs).toHaveLength(5);
    expect(jobs.every(j => j.status === 'queued')).toBe(true);

    // 3. Trigger job processing
    await triggerJobProcessing();

    // 4. Wait for jobs to complete (with timeout)
    await waitForJobStatus('item', createResponse.data.id, 'completed', {
      timeoutMs: 60000,
      timeoutMessage: 'Translation jobs did not complete within timeout'
    });

    // 5. Verify translations stored
    const translations = await getStoredTranslations('item', createResponse.data.id);
    expect(translations.size).toBe(5);
    expect(translations.get('fr')).toMatchObject({
      name: expect.any(String),
      description: expect.any(String),
      translation_status: 'completed'
    });

    // 6. Verify status endpoint
    const statusResponse = await apiClient.getTranslationStatus('item', createResponse.data.id);
    expect(statusResponse.data.overallStatus).toBe('complete');
    expect(Object.keys(statusResponse.data.translations)).toHaveLength(5);
  });
});
```

### Scenario 2: Retry Failed Translation (Tasks 7.4.12-7.4.14)

```typescript
describe('Retry Workflow E2E', () => {
  it('handles failed translation and successful retry', async () => {
    // 1. Configure mock to fail
    configureMockForFailure('API Error: Rate limit exceeded');

    // 2. Create item (translations will fail)
    const createResponse = await apiClient.createItem({...});

    // 3. Wait for failures
    await waitForJobStatus('item', createResponse.data.id, 'failed');

    // 4. Verify failed status
    const failedJobs = await getTranslationJobs('item', createResponse.data.id);
    expect(failedJobs.every(j => j.status === 'failed')).toBe(true);
    expect(failedJobs[0].errorMessage).toBe('API Error: Rate limit exceeded');

    // 5. Configure mock for success
    configureMockForSuccess();

    // 6. Call retry endpoint
    const retryResponse = await apiClient.retryFailedTranslations({
      entityType: 'item',
      entityId: createResponse.data.id
    });
    expect(retryResponse.success).toBe(true);
    expect(retryResponse.jobsQueued).toBe(5);

    // 7. Trigger processing
    await triggerJobProcessing();

    // 8. Wait for success
    await waitForJobStatus('item', createResponse.data.id, 'completed');

    // 9. Verify translations now stored
    const translations = await getStoredTranslations('item', createResponse.data.id);
    expect(translations.size).toBe(5);
  });
});
```

### Scenario 3: Status Progression (Task 7.4.17)

```typescript
describe('Status Tracking E2E', () => {
  it('reports accurate status throughout workflow stages', async () => {
    // 1. Create item
    const createResponse = await apiClient.createItem({...});

    // 2. Immediately check status - should be pending
    let status = await apiClient.getTranslationStatus('item', createResponse.data.id);
    expect(status.data.overallStatus).toBe('pending');

    // 3. Start processing (don't wait for completion)
    triggerJobProcessing(); // No await

    // 4. Poll for in-progress status
    await waitFor(async () => {
      status = await apiClient.getTranslationStatus('item', createResponse.data.id);
      return status.data.overallStatus === 'partial' ||
             Object.values(status.data.translations).some(t => t.status === 'completed');
    }, { timeoutMs: 30000 });

    // 5. Wait for completion
    await waitForStatusEndpoint('item', createResponse.data.id, 'complete');

    // 6. Final verification
    status = await apiClient.getTranslationStatus('item', createResponse.data.id);
    expect(status.data.overallStatus).toBe('complete');
    expect(Object.values(status.data.translations).every(t => t.status === 'completed')).toBe(true);
    expect(Object.values(status.data.translations).every(t => t.translatedAt !== undefined)).toBe(true);
  });
});
```

---

## Vitest Configuration Changes

```typescript
// vitest.config.ts (modifications)

export default defineConfig({
  // ... existing config ...
  test: {
    // ... existing config ...
    include: [
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'src/__tests__/e2e/**/*.e2e.test.ts',  // NEW: E2E test pattern
    ],
    // Separate timeout for E2E tests
    testTimeout: 10000,  // Unit/integration tests
  },
});
```

```json
// package.json (add script)
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "vitest run --config vitest.e2e.config.ts",
    "test:all": "vitest run && npm run test:e2e"
  }
}
```

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Task Reference |
|---------------------|----------------|
| E2E test creates item through API endpoint | 7.4.7 |
| Test verifies translation jobs created immediately | 7.4.7 |
| Test verifies jobs exist for all supported target languages | 7.4.7 |
| Test verifies jobs have pending status immediately | 7.4.7 |
| Test waits for background job processor | 7.4.7, 7.4.6 |
| Test verifies jobs transition through states | 7.4.11 |
| Test verifies translated content stored in tables | 7.4.7 |
| Test queries status endpoint after completion | 7.4.15 |
| Test simulates translation failure | 7.4.12 |
| Test verifies failed jobs have error message | 7.4.12 |
| Test calls retry endpoint | 7.4.13 |
| Test verifies retry re-queues jobs | 7.4.13 |
| Test verifies successful retry completion | 7.4.14 |
| E2E test creates article through API | 7.4.8 |
| E2E test creates link through API | 7.4.9 |
| Test verifies tag translations reused | 7.4.10 |
| Test verifies batch status endpoint | 7.4.16 |
| Tests use mock translation service | 7.4.3 |
| Tests use isolated test database | 7.4.2 |
| Tests handle timing with polling | 7.4.6 |
| All E2E tests pass | 7.4.19 |
| Test suite executes in under 5 minutes | 7.4.19 |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Flaky tests due to timing | Medium | High | Use polling-based waits with generous timeouts |
| Test database contamination | Low | Medium | Use unique test run IDs, cleanup in afterAll |
| Slow test suite (> 5 min) | Medium | Medium | Run jobs in parallel where possible, optimize polling intervals |
| Mock service state leakage | Low | Medium | Reset mock state between tests |
| External dependency on DB | Medium | Medium | Document test environment requirements |

---

## References

- **PRD Reference:** `/docs/prd/PRD_L10N_Epic3_Dynamic_Content_Translation.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- **Related Integration Tests:** `/src/lib/job-queue/__tests__/job-processing.integration.test.ts`
- **Existing E2E Patterns:** `/src/components/ItemCreationWorkflow/__tests__/e2e/`
- **Vitest Documentation:** https://vitest.dev/guide/
- **Testing Library:** https://testing-library.com/

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation*
*Task: Write E2E tests for translation workflows (Phase 7, Task 7.4)*
