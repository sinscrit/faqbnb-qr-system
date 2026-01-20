# Implementation Overview: REQ-E03-033 - Write E2E Tests for Complete Translation Workflow

**Document ID:** REQ-E03-033-overview
**Request ID:** E03-033
**Created:** 2026-01-20 16:30 UTC
**Last Modified:** 2026-01-20 16:30 UTC
**Status:** Ready for Implementation
**Implementation Plan Reference:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md

---

## 1. Summary

Create comprehensive end-to-end tests that validate the complete translation workflow from content creation through job processing to final translation storage and status verification. The tests will simulate real-world usage patterns including item/article/link creation, asynchronous job processing, translation storage verification, status checking, and retry mechanisms for failed translations.

---

## 2. Background

### 2.1 Current State

- **Unit Tests:** Existing unit tests in `src/lib/job-queue/__tests__/` test job creation, state transitions, and processing in isolation
- **Integration Tests:** `job-processing.integration.test.ts` and `concurrent-processing.integration.test.ts` test job queue internals
- **No E2E Tests:** No end-to-end tests exist that verify the complete translation pipeline across all integrated components

### 2.2 Task Context

- **Phase:** 7 - Testing & Validation
- **Task ID:** 7.4
- **Parent Plan Task:**
  - Create item -> verify translations queued
  - Wait for processing -> verify translations stored
  - Check translation status -> verify complete
  - Retry failed -> verify re-queued

### 2.3 Dependencies

| Dependency | Location | Required For |
|------------|----------|--------------|
| Content Translation Module | `/src/lib/content-translation/` | Triggering translations from content saves |
| Translation APIs | `/src/app/api/translations/` | Status, retry, and manual override endpoints |
| Job Queue | `/src/lib/job-queue/` | Job processing and state management |
| Items/Articles API | `/src/app/api/admin/items/`, `/src/app/api/admin/articles/` | Content creation with translation triggers |
| Vitest Configuration | `vitest.config.ts` | Test framework and environment |
| Test Helpers | `src/lib/job-queue/__tests__/helpers/` | Mock Supabase, factories, utilities |

---

## 3. Requirements Analysis

### 3.1 Acceptance Criteria (from REQ-E03-033)

| AC# | Criterion | Test Coverage |
|-----|-----------|---------------|
| AC-1 | Test creates item via API and verifies translation jobs queued | `item-translation-e2e.test.ts` |
| AC-2 | Test creates article via API and verifies translation jobs queued | `article-translation-e2e.test.ts` |
| AC-3 | Test creates link via API and verifies translation jobs queued | `link-translation-e2e.test.ts` |
| AC-4 | Test waits for job processing and verifies translations stored | All E2E tests with polling |
| AC-5 | Test verifies translated content has all required fields | `translation-storage.e2e.test.ts` |
| AC-6 | Test checks status endpoint reports "completed" | `translation-status.e2e.test.ts` |
| AC-7 | Test verifies translation metadata (source/target language, timestamps) | All E2E tests |
| AC-8 | Test simulates failure and verifies job status "failed" | `translation-retry.e2e.test.ts` |
| AC-9 | Test uses retry endpoint to re-queue failed job | `translation-retry.e2e.test.ts` |
| AC-10 | Test verifies retried job completes successfully | `translation-retry.e2e.test.ts` |
| AC-11 | Test validates manual translation overrides preserved | `manual-override.e2e.test.ts` |
| AC-12 | Test confirms stale translation detection on source update | `stale-translation.e2e.test.ts` |
| AC-13 | Test verifies batch status endpoint | `batch-status.e2e.test.ts` |
| AC-14 | Tests include realistic timing with wait/polling | All E2E tests |
| AC-15 | Test suite uses isolated test data | Test isolation via beforeEach/afterEach |
| AC-16 | Test suite cleans up test data | afterEach cleanup hooks |
| AC-17 | All E2E tests pass in CI/CD | GitHub Actions integration |
| AC-18 | Test execution under 5 minutes | Performance requirement |
| AC-19 | Detailed logging for debugging | Logging utilities |
| AC-20 | Tests verify error handling when API unavailable | Error scenario tests |

---

## 4. Technical Design

### 4.1 Test Structure

```
/src/lib/content-translation/__tests__/
├── e2e/
│   ├── helpers/
│   │   ├── index.ts                         # Barrel exports
│   │   ├── e2e-test-utils.ts               # E2E-specific utilities
│   │   ├── polling-utils.ts                 # Wait/poll helpers
│   │   ├── mock-api-client.ts              # Mock API request/response
│   │   └── test-data-factory.ts            # E2E test data generators
│   ├── item-translation.e2e.test.ts         # Item creation → translation flow
│   ├── article-translation.e2e.test.ts      # Article creation → translation flow
│   ├── link-translation.e2e.test.ts         # Link creation → translation flow
│   ├── translation-status.e2e.test.ts       # Status endpoint verification
│   ├── translation-retry.e2e.test.ts        # Retry mechanism tests
│   ├── manual-override.e2e.test.ts          # Manual translation override tests
│   ├── batch-status.e2e.test.ts             # Batch status endpoint tests
│   ├── stale-translation.e2e.test.ts        # Stale translation detection
│   └── error-scenarios.e2e.test.ts          # Error handling tests
└── README.md                                 # Test documentation
```

### 4.2 Testing Approach

#### Pattern: Mock-Based E2E Simulation

Since actual API calls require authentication and database access, E2E tests will use a mock-based approach that:

1. **Mocks Supabase Client:** Uses the established `mockSupabase.ts` pattern from job-queue tests
2. **Mocks Translation Service:** Returns predictable translated content
3. **Simulates API Flow:** Tests the complete data flow through all layers
4. **Uses Real Business Logic:** Imports and tests actual implementation code

#### Test Lifecycle Pattern

```typescript
describe('Complete Translation E2E', () => {
  beforeEach(() => {
    // Reset mock database
    resetMockDatabase();
    // Seed test data
    seedTestData();
    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Verify cleanup
    vi.restoreAllMocks();
  });

  it('creates item and completes translation workflow', async () => {
    // 1. Create item (triggers translation queue)
    // 2. Verify jobs queued for 5 target languages
    // 3. Simulate job processor running
    // 4. Verify translations stored
    // 5. Check status endpoint returns 'complete'
  });
});
```

### 4.3 Key Components

#### 4.3.1 E2E Test Utilities

```typescript
// e2e-test-utils.ts

export interface E2ETestContext {
  mockSupabase: ReturnType<typeof createMockSupabaseServer>;
  testEntities: {
    items: TestItem[];
    articles: TestArticle[];
    links: TestLink[];
  };
  cleanup: () => Promise<void>;
}

export async function setupE2ETestContext(): Promise<E2ETestContext>;
export async function teardownE2ETestContext(ctx: E2ETestContext): Promise<void>;
export function createTestItem(overrides?: Partial<TestItem>): TestItem;
export function createTestArticle(overrides?: Partial<TestArticle>): TestArticle;
export function createTestLink(overrides?: Partial<TestLink>): TestLink;
```

#### 4.3.2 Polling Utilities

```typescript
// polling-utils.ts

export interface PollingOptions {
  maxWaitMs: number;
  intervalMs: number;
  onProgress?: (attempt: number) => void;
}

export async function waitForJobsToComplete(
  entityId: string,
  entityType: EntityType,
  options?: Partial<PollingOptions>
): Promise<boolean>;

export async function waitForTranslationStatus(
  entityId: string,
  entityType: EntityType,
  expectedStatus: 'complete' | 'partial' | 'pending' | 'failed',
  options?: Partial<PollingOptions>
): Promise<TranslationStatusResult | null>;

export async function waitForCondition(
  condition: () => Promise<boolean>,
  options?: Partial<PollingOptions>
): Promise<boolean>;
```

#### 4.3.3 Mock API Client

```typescript
// mock-api-client.ts

export interface MockApiClient {
  // Items API
  createItem(data: CreateItemRequest): Promise<CreateItemResponse>;
  updateItem(id: string, data: UpdateItemRequest): Promise<UpdateItemResponse>;

  // Articles API
  createArticle(data: CreateArticleRequest): Promise<CreateArticleResponse>;
  updateArticle(id: string, data: UpdateArticleRequest): Promise<UpdateArticleResponse>;

  // Links API
  createLink(itemId: string, data: CreateLinkRequest): Promise<CreateLinkResponse>;

  // Translations API
  getTranslationStatus(entityType: EntityType, entityId: string): Promise<TranslationStatusResponse>;
  retryTranslations(request: RetryTranslationRequest): Promise<RetryTranslationResponse>;
  setManualTranslation(entityType: EntityType, entityId: string, language: string, data: ManualTranslationRequest): Promise<ManualTranslationResponse>;
  getBatchStatus(entities: { type: EntityType; id: string }[]): Promise<BatchStatusResponse>;
}

export function createMockApiClient(mockSupabase: ReturnType<typeof createMockSupabaseServer>): MockApiClient;
```

### 4.4 Test Scenarios

#### Scenario 1: Item Creation → Translation Complete

```typescript
it('completes full item translation workflow', async () => {
  // Step 1: Create item with French source language
  const item = await apiClient.createItem({
    publicId: 'test-item-001',
    name: 'Machine à café',
    description: 'Comment utiliser la machine à café',
    propertyId: testPropertyId,
    sourceLanguage: 'fr',
  });

  expect(item.translationJobIds).toHaveLength(5); // en, es, de, nl, it

  // Step 2: Verify jobs queued in database
  const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
  const itemJobs = jobs.filter(j => j.entityId === item.data.id);
  expect(itemJobs).toHaveLength(5);
  expect(itemJobs.every(j => j.status === 'queued')).toBe(true);

  // Step 3: Process jobs
  const processor = createJobProcessor({ enableLogging: false });
  for (let i = 0; i < 5; i++) {
    await processor.processNextJob();
  }

  // Step 4: Verify translations stored
  const translations = getTableRecords<ItemTranslation>(TABLE_NAMES.ITEM_TRANSLATIONS);
  const itemTranslations = translations.filter(t => t.itemId === item.data.id);
  expect(itemTranslations).toHaveLength(5);

  // Step 5: Check status endpoint
  const status = await apiClient.getTranslationStatus('item', item.data.id);
  expect(status.data.overallStatus).toBe('complete');
  expect(status.data.completedLanguages).toHaveLength(5);
});
```

#### Scenario 2: Retry Failed Translation

```typescript
it('retries failed translations successfully', async () => {
  // Step 1: Create item
  const item = await apiClient.createItem({...});

  // Step 2: Simulate translation failure
  mockTranslationService.translateText.mockRejectedValueOnce(
    new Error('API rate limit exceeded')
  );

  // Step 3: Process jobs (one fails)
  const processor = createJobProcessor({ enableLogging: false });
  await processor.processNextJob(); // This one fails

  // Step 4: Verify job is failed
  const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
  const failedJob = jobs.find(j => j.status === 'failed');
  expect(failedJob).toBeDefined();
  expect(failedJob?.errorMessage).toContain('API rate limit');

  // Step 5: Retry via API
  const retryResult = await apiClient.retryTranslations({
    entityType: 'item',
    entityId: item.data.id,
  });
  expect(retryResult.jobsQueued).toBe(1);

  // Step 6: Process retried job
  mockTranslationService.translateText.mockResolvedValueOnce({
    translatedText: 'Coffee Machine',
    provider: 'claude',
  });
  await processor.processNextJob();

  // Step 7: Verify complete
  const status = await apiClient.getTranslationStatus('item', item.data.id);
  expect(status.data.overallStatus).toBe('complete');
});
```

#### Scenario 3: Stale Translation Detection

```typescript
it('detects stale translations after source content update', async () => {
  // Step 1: Create and translate item
  const item = await createAndTranslateItem();
  const originalTranslatedAt = await getTranslationTimestamp(item.id, 'en');

  // Step 2: Update source content
  await apiClient.updateItem(item.id, {
    name: 'Updated Name',
    description: 'Updated Description',
  });

  // Step 3: Verify old translations deleted
  const translations = getTableRecords<ItemTranslation>(TABLE_NAMES.ITEM_TRANSLATIONS);
  const itemTranslations = translations.filter(t => t.itemId === item.id);
  expect(itemTranslations).toHaveLength(0);

  // Step 4: Verify new jobs queued
  const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
  const newJobs = jobs.filter(j => j.entityId === item.id && j.status === 'queued');
  expect(newJobs).toHaveLength(5);

  // Step 5: Check status shows pending
  const status = await apiClient.getTranslationStatus('item', item.id);
  expect(status.data.overallStatus).toBe('pending');
});
```

---

## 5. Implementation Tasks

### Task 1: Create E2E Test Helper Infrastructure

**File:** `src/lib/content-translation/__tests__/e2e/helpers/index.ts`

- Export all E2E helper functions
- Coordinate with existing job-queue test helpers

**Estimated Effort:** 0.5 story points

### Task 2: Implement E2E Test Utilities

**File:** `src/lib/content-translation/__tests__/e2e/helpers/e2e-test-utils.ts`

- `setupE2ETestContext()` - Initialize test environment
- `teardownE2ETestContext()` - Cleanup after tests
- Test entity factory functions
- Test data generators for realistic scenarios

**Estimated Effort:** 1 story point

### Task 3: Implement Polling Utilities

**File:** `src/lib/content-translation/__tests__/e2e/helpers/polling-utils.ts`

- `waitForJobsToComplete()` - Poll until jobs finish
- `waitForTranslationStatus()` - Wait for specific status
- `waitForCondition()` - Generic condition polling
- Configurable timeout and interval options

**Estimated Effort:** 0.5 story points

### Task 4: Implement Mock API Client

**File:** `src/lib/content-translation/__tests__/e2e/helpers/mock-api-client.ts`

- Mock implementations of all API endpoints
- Integrates with mock Supabase
- Returns proper response types

**Estimated Effort:** 1 story point

### Task 5: Write Item Translation E2E Tests

**File:** `src/lib/content-translation/__tests__/e2e/item-translation.e2e.test.ts`

- Test: Create item triggers translation jobs
- Test: Item translations stored correctly
- Test: Item translation metadata validated
- Test: Item with tags triggers tag translations

**Estimated Effort:** 1.5 story points

### Task 6: Write Article Translation E2E Tests

**File:** `src/lib/content-translation/__tests__/e2e/article-translation.e2e.test.ts`

- Test: Create article triggers translation jobs
- Test: Article translations stored correctly
- Test: Article with description translated

**Estimated Effort:** 1 story point

### Task 7: Write Link Translation E2E Tests

**File:** `src/lib/content-translation/__tests__/e2e/link-translation.e2e.test.ts`

- Test: Create link triggers translation jobs
- Test: Link title translated (URL preserved)
- Test: Link translations stored correctly

**Estimated Effort:** 1 story point

### Task 8: Write Translation Status E2E Tests

**File:** `src/lib/content-translation/__tests__/e2e/translation-status.e2e.test.ts`

- Test: Status returns 'pending' for queued jobs
- Test: Status returns 'complete' when all done
- Test: Status returns 'partial' with mixed states
- Test: Status returns 'failed' with failed jobs

**Estimated Effort:** 1 story point

### Task 9: Write Translation Retry E2E Tests

**File:** `src/lib/content-translation/__tests__/e2e/translation-retry.e2e.test.ts`

- Test: Retry re-queues failed jobs
- Test: Retried jobs process successfully
- Test: Retry specific language only
- Test: Retry when no failed jobs (no-op)

**Estimated Effort:** 1 story point

### Task 10: Write Manual Override E2E Tests

**File:** `src/lib/content-translation/__tests__/e2e/manual-override.e2e.test.ts`

- Test: Manual override saves with 'manual' status
- Test: Manual override preserves on retry
- Test: Manual override tracks reviewer

**Estimated Effort:** 1 story point

### Task 11: Write Batch Status E2E Tests

**File:** `src/lib/content-translation/__tests__/e2e/batch-status.e2e.test.ts`

- Test: Batch status returns status for multiple entities
- Test: Batch status handles mixed entity types
- Test: Batch status performance with 50+ entities

**Estimated Effort:** 0.5 story points

### Task 12: Write Stale Translation E2E Tests

**File:** `src/lib/content-translation/__tests__/e2e/stale-translation.e2e.test.ts`

- Test: Content update deletes old translations
- Test: Content update queues new jobs
- Test: Status reflects pending state after update

**Estimated Effort:** 1 story point

### Task 13: Write Error Scenario E2E Tests

**File:** `src/lib/content-translation/__tests__/e2e/error-scenarios.e2e.test.ts`

- Test: Translation API unavailable
- Test: Invalid entity ID handling
- Test: Unsupported language handling
- Test: Database error handling

**Estimated Effort:** 1 story point

### Task 14: Update Vitest Configuration

**File:** `vitest.config.ts`

- Add content-translation coverage paths
- Ensure E2E test files included
- Configure appropriate timeouts for E2E

**Estimated Effort:** 0.25 story points

### Task 15: Create Test Documentation

**File:** `src/lib/content-translation/__tests__/e2e/README.md`

- Document test structure
- Document how to run tests
- Document mocking patterns
- Document debugging tips

**Estimated Effort:** 0.25 story points

---

## 6. Authorized Files and Functions for Modification

### 6.1 New Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/lib/content-translation/__tests__/e2e/helpers/index.ts` | E2E helper barrel exports |
| `src/lib/content-translation/__tests__/e2e/helpers/e2e-test-utils.ts` | Test setup/teardown utilities |
| `src/lib/content-translation/__tests__/e2e/helpers/polling-utils.ts` | Wait/poll helper functions |
| `src/lib/content-translation/__tests__/e2e/helpers/mock-api-client.ts` | Mock API client for E2E tests |
| `src/lib/content-translation/__tests__/e2e/helpers/test-data-factory.ts` | Test data generators |
| `src/lib/content-translation/__tests__/e2e/item-translation.e2e.test.ts` | Item translation E2E tests |
| `src/lib/content-translation/__tests__/e2e/article-translation.e2e.test.ts` | Article translation E2E tests |
| `src/lib/content-translation/__tests__/e2e/link-translation.e2e.test.ts` | Link translation E2E tests |
| `src/lib/content-translation/__tests__/e2e/translation-status.e2e.test.ts` | Status endpoint E2E tests |
| `src/lib/content-translation/__tests__/e2e/translation-retry.e2e.test.ts` | Retry mechanism E2E tests |
| `src/lib/content-translation/__tests__/e2e/manual-override.e2e.test.ts` | Manual override E2E tests |
| `src/lib/content-translation/__tests__/e2e/batch-status.e2e.test.ts` | Batch status E2E tests |
| `src/lib/content-translation/__tests__/e2e/stale-translation.e2e.test.ts` | Stale translation E2E tests |
| `src/lib/content-translation/__tests__/e2e/error-scenarios.e2e.test.ts` | Error handling E2E tests |
| `src/lib/content-translation/__tests__/e2e/README.md` | E2E test documentation |

### 6.2 Files to Modify

| File Path | Changes | Functions/Sections |
|-----------|---------|-------------------|
| `vitest.config.ts` | Add E2E coverage paths | `coverage.include` array |

### 6.3 Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `src/lib/job-queue/__tests__/helpers/mockSupabase.ts` | Mock database patterns |
| `src/lib/job-queue/__tests__/helpers/mockFactories.ts` | Factory function patterns |
| `src/lib/job-queue/__tests__/helpers/constants.ts` | Test constants |
| `src/lib/job-queue/__tests__/job-processing.integration.test.ts` | Integration test patterns |
| `src/components/ItemCreationWorkflow/__tests__/e2e/test-utils.tsx` | E2E utility patterns |

---

## 7. Integration Points

### 7.1 Dependencies on Other Epic 3 Components

| Component | Task | Status |
|-----------|------|--------|
| Content Translation Module | Tasks 1.1-1.6 | Must be implemented |
| Translation Status API | Task 4.1 | Must be implemented |
| Retry Translations API | Task 4.2 | Must be implemented |
| Manual Override API | Task 4.3 | Must be implemented |
| Batch Status API | Task 4.4 | Must be implemented |
| Job Processor Enhancement | Tasks 3.1-3.8 | Must be implemented |
| Items API Translation Trigger | Task 2.2 | Must be implemented |
| Articles API Translation Trigger | Task 2.3 | Must be implemented |
| Links API Translation Trigger | Task 2.4 | Must be implemented |

### 7.2 Dependencies on Epic 1 Components

| Component | Location | Required For |
|-----------|----------|--------------|
| Translation Service | `src/lib/translation-service/` | Mocking in tests |
| Job Queue | `src/lib/job-queue/` | Job creation and processing |
| Translation Tables | Database | Mock database structure |

---

## 8. Testing Strategy

### 8.1 Test Categories

| Category | Description | Files |
|----------|-------------|-------|
| Workflow Tests | Complete content → translation flow | `item-translation.e2e.test.ts`, `article-translation.e2e.test.ts`, `link-translation.e2e.test.ts` |
| API Tests | Translation management endpoints | `translation-status.e2e.test.ts`, `translation-retry.e2e.test.ts`, `manual-override.e2e.test.ts`, `batch-status.e2e.test.ts` |
| Edge Case Tests | Error and boundary scenarios | `stale-translation.e2e.test.ts`, `error-scenarios.e2e.test.ts` |

### 8.2 Test Isolation Strategy

```typescript
beforeEach(() => {
  // Reset mock database to clean state
  resetMockDatabase();

  // Seed required base data
  seedMockDatabase(TABLE_NAMES.ITEMS, []);
  seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, []);
  seedMockDatabase(TABLE_NAMES.ITEM_TRANSLATIONS, []);

  // Clear all vitest mocks
  vi.clearAllMocks();
});

afterEach(() => {
  // Restore original implementations
  vi.restoreAllMocks();
});
```

### 8.3 Performance Requirements

| Metric | Target | Validation |
|--------|--------|------------|
| Individual test | < 5 seconds | Vitest timeout |
| Full E2E suite | < 5 minutes | CI pipeline timing |
| Polling interval | 50-100ms | Configurable in polling-utils |
| Max wait time | 10 seconds | Per test assertion |

---

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Test flakiness due to timing | Medium | Medium | Use polling utilities with generous timeouts |
| Mock drift from implementation | Medium | High | Keep mocks in sync with actual API contracts |
| Test data pollution | Low | High | Strict beforeEach/afterEach cleanup |
| Coverage gaps | Medium | Medium | Map each acceptance criterion to specific tests |
| CI environment differences | Low | Medium | Use consistent mock data, avoid time-dependent assertions |

---

## 10. Effort Summary

| Task Group | Story Points |
|------------|--------------|
| Helper Infrastructure (Tasks 1-4) | 3 |
| Workflow Tests (Tasks 5-7) | 3.5 |
| API Tests (Tasks 8-11) | 3.5 |
| Edge Case Tests (Tasks 12-13) | 2 |
| Configuration & Documentation (Tasks 14-15) | 0.5 |
| **Total** | **12.5 story points** |

---

## 11. Definition of Done

- [ ] All 15 tasks implemented and code reviewed
- [ ] All acceptance criteria from REQ-E03-033 covered by tests
- [ ] Test suite passes locally with `npm test`
- [ ] Test suite passes in CI/CD pipeline
- [ ] Test execution time under 5 minutes
- [ ] Code coverage reported for content-translation module
- [ ] README.md documentation complete
- [ ] No test flakiness over 5 consecutive runs

---

## 12. References

- **Request:** `docs/gen_requests_epic3.md` (REQ-E03-033)
- **Implementation Plan:** `docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Phase 7, Task 7.4)
- **Related Tests:** `src/lib/job-queue/__tests__/job-processing.integration.test.ts`
- **Test Patterns:** `src/components/ItemCreationWorkflow/__tests__/e2e/test-utils.tsx`
- **Vitest Documentation:** https://vitest.dev/guide/
