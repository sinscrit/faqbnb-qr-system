# REQ-E03-031: Write Unit Tests for Job Processing - Implementation Overview

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E03-031
**Epic:** 3 - Dynamic Content Translation
**Phase:** 7 - Testing & Validation
**Task ID:** 7.2
**Size:** M (Medium)

---

## Summary

This implementation overview details the creation of comprehensive unit tests for the translation job processing infrastructure. The tests will verify the correctness of job pickup and locking mechanisms, entity-specific translation processors, retry logic with exponential backoff, and concurrency control systems.

The job processing system is a critical component of the Dynamic Content Translation epic, responsible for reliably processing queued translation jobs in the background. Without thorough test coverage, regressions could lead to duplicate processing, lost translations, race conditions, or resource conflicts that would severely impact the multilingual content delivery system.

The implementation will follow the existing Vitest testing patterns established in the codebase, utilizing the mock factories and test helpers already present in `/src/lib/job-queue/__tests__/helpers/`. These tests complement the existing integration tests by providing focused, isolated verification of individual functions and components.

---

## Technical Context

### Existing Patterns in Codebase

| Pattern | Location | Usage for This Task |
|---------|----------|---------------------|
| Vitest test framework | `package.json` (test scripts) | Use Vitest for all unit tests |
| Mock factories | `/src/lib/job-queue/__tests__/helpers/mockFactories.ts` | Create test fixtures for jobs |
| Mock Supabase | `/src/lib/job-queue/__tests__/helpers/mockSupabase.ts` | Mock database operations |
| Test utilities | `/src/lib/job-queue/__tests__/helpers/testUtils.ts` | Shared test helper functions |
| Constants | `/src/lib/job-queue/__tests__/helpers/constants.ts` | Test data constants |
| Integration tests | `/src/lib/job-queue/__tests__/job-processing.integration.test.ts` | Reference for test patterns |
| Concurrent tests | `/src/lib/job-queue/__tests__/concurrent-processing.integration.test.ts` | Concurrency testing patterns |

### Dependencies

| Dependency | Purpose |
|------------|---------|
| Vitest | Test runner and assertion library |
| `@/lib/job-queue/translation-jobs.ts` | Job management functions to test |
| `@/lib/job-queue/job-processor.ts` | Job processor logic to test |
| `@/lib/job-queue/concurrency-control.ts` | Concurrency mechanisms to test |
| `@/lib/job-queue/translation-jobs.types.ts` | Type definitions for test fixtures |
| `@/lib/translation-service` | Mock target for translation API calls |
| `@/lib/supabase` | Mock target for database operations |

### Target File Location(s)

| File | Purpose |
|------|---------|
| `/src/lib/job-queue/__tests__/job-pickup.unit.test.ts` | Tests for job pickup and locking |
| `/src/lib/job-queue/__tests__/entity-processors.unit.test.ts` | Tests for entity-specific processors |
| `/src/lib/job-queue/__tests__/retry-logic.unit.test.ts` | Tests for retry mechanisms |
| `/src/lib/job-queue/__tests__/concurrency-control.unit.test.ts` | Tests for concurrency control |

---

## Implementation Tasks

### Task 1: Create Job Pickup and Locking Unit Tests

**File:** `/src/lib/job-queue/__tests__/job-pickup.unit.test.ts`

This test file verifies the job pickup mechanism correctly selects queued jobs and applies locking to prevent duplicate processing.

```typescript
// job-pickup.unit.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createMockTranslationJob,
  createMockJobBatch,
  resetMockDatabase
} from './helpers';

describe('Job Pickup', () => {
  beforeEach(() => {
    resetMockDatabase();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('pickNextJob', () => {
    it('should select the highest priority queued job', async () => {
      // Test implementation
    });

    it('should mark picked job as processing', async () => {
      // Test implementation
    });

    it('should set started_at timestamp when picking job', async () => {
      // Test implementation
    });

    it('should assign worker_id to picked job', async () => {
      // Test implementation
    });

    it('should return null when no queued jobs exist', async () => {
      // Test implementation
    });

    it('should skip jobs already in processing state', async () => {
      // Test implementation
    });

    it('should respect priority ordering (DESC) then created_at (ASC)', async () => {
      // Test implementation
    });
  });

  describe('Job Locking', () => {
    it('should acquire lock using FOR UPDATE SKIP LOCKED pattern', async () => {
      // Test implementation
    });

    it('should prevent concurrent pickup of same job', async () => {
      // Test implementation
    });

    it('should handle lock acquisition timeout gracefully', async () => {
      // Test implementation
    });

    it('should release lock when job processing completes', async () => {
      // Test implementation
    });

    it('should release lock when job processing fails', async () => {
      // Test implementation
    });
  });

  describe('Stale Lock Detection', () => {
    it('should identify jobs stuck in processing over 5 minutes', async () => {
      // Test implementation
    });

    it('should reset stale jobs to queued status', async () => {
      // Test implementation
    });

    it('should increment retry count when recovering stale job', async () => {
      // Test implementation
    });

    it('should mark job as failed if retry limit exceeded during recovery', async () => {
      // Test implementation
    });
  });
});
```

**Test Coverage Areas:**
- Job selection based on priority and creation time
- Status transition from 'queued' to 'processing'
- Timestamp management (started_at, status_updated_at)
- Worker ID assignment
- Empty queue handling
- Lock acquisition and release
- Concurrent access prevention
- Stale job recovery

---

### Task 2: Create Entity-Specific Processor Unit Tests

**File:** `/src/lib/job-queue/__tests__/entity-processors.unit.test.ts`

This test file verifies each entity-specific processor correctly handles its content type.

```typescript
// entity-processors.unit.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createMockTranslationJob,
  createMockItemContent,
  createMockArticleContent,
  createMockLinkContent,
  createMockTagContent,
  resetMockDatabase
} from './helpers';

describe('Entity-Specific Processors', () => {
  beforeEach(() => {
    resetMockDatabase();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('processItemTranslation', () => {
    it('should fetch item by ID from database', async () => {
      // Test implementation
    });

    it('should extract name and description fields for translation', async () => {
      // Test implementation
    });

    it('should call translation service with correct payload', async () => {
      // Test implementation
    });

    it('should store translated content in item_translations table', async () => {
      // Test implementation
    });

    it('should mark job as completed on success', async () => {
      // Test implementation
    });

    it('should mark job as failed when item not found', async () => {
      // Test implementation
    });

    it('should handle translation service errors appropriately', async () => {
      // Test implementation
    });
  });

  describe('processArticleTranslation', () => {
    it('should fetch article by ID from database', async () => {
      // Test implementation
    });

    it('should extract title and description fields for translation', async () => {
      // Test implementation
    });

    it('should call translation service with correct payload', async () => {
      // Test implementation
    });

    it('should store translated content in article_translations table', async () => {
      // Test implementation
    });

    it('should mark job as completed on success', async () => {
      // Test implementation
    });

    it('should mark job as failed when article not found', async () => {
      // Test implementation
    });
  });

  describe('processLinkTranslation', () => {
    it('should fetch link by ID from database', async () => {
      // Test implementation
    });

    it('should extract only title field for translation', async () => {
      // Test implementation
    });

    it('should NOT include URL field in translation request', async () => {
      // Test implementation
    });

    it('should store translated content in link_translations table', async () => {
      // Test implementation
    });

    it('should mark job as completed on success', async () => {
      // Test implementation
    });

    it('should mark job as failed when link not found', async () => {
      // Test implementation
    });
  });

  describe('processTagTranslation', () => {
    it('should fetch tag by key from database', async () => {
      // Test implementation
    });

    it('should extract tag value for translation', async () => {
      // Test implementation
    });

    it('should store translated content in tag_translations table', async () => {
      // Test implementation
    });

    it('should set is_system_tag to false for user tags', async () => {
      // Test implementation
    });

    it('should mark job as completed on success', async () => {
      // Test implementation
    });

    it('should mark job as failed when tag not found', async () => {
      // Test implementation
    });
  });

  describe('Processor Routing', () => {
    it('should route item jobs to processItemTranslation', async () => {
      // Test implementation
    });

    it('should route article jobs to processArticleTranslation', async () => {
      // Test implementation
    });

    it('should route link jobs to processLinkTranslation', async () => {
      // Test implementation
    });

    it('should route tag jobs to processTagTranslation', async () => {
      // Test implementation
    });

    it('should log error for unknown entity types', async () => {
      // Test implementation
    });
  });
});
```

**Test Coverage Areas:**
- Entity fetching from database
- Field extraction per entity type
- Translation service integration
- Translation storage per entity type
- Job status updates (completed/failed)
- Error handling for missing entities
- Processor routing based on entity type

---

### Task 3: Create Retry Logic Unit Tests

**File:** `/src/lib/job-queue/__tests__/retry-logic.unit.test.ts`

This test file verifies retry mechanisms operate correctly for failed translation jobs.

```typescript
// retry-logic.unit.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createMockTranslationJob,
  resetMockDatabase
} from './helpers';

describe('Retry Logic', () => {
  beforeEach(() => {
    resetMockDatabase();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Retry Count Management', () => {
    it('should increment attempts count on failure', async () => {
      // Test implementation
    });

    it('should preserve previous attempt count when incrementing', async () => {
      // Test implementation
    });

    it('should start with attempts = 0 for new jobs', async () => {
      // Test implementation
    });
  });

  describe('Maximum Retry Limits', () => {
    it('should allow retry when attempts < max_retries (default 3)', async () => {
      // Test implementation
    });

    it('should mark job as permanently failed when attempts >= max_retries', async () => {
      // Test implementation
    });

    it('should respect configurable max retry limit', async () => {
      // Test implementation
    });

    it('should record exceeded_max_retries as failure reason', async () => {
      // Test implementation
    });
  });

  describe('Error Message Preservation', () => {
    it('should store error message when job fails', async () => {
      // Test implementation
    });

    it('should update error message on subsequent failures', async () => {
      // Test implementation
    });

    it('should clear error message when job succeeds', async () => {
      // Test implementation
    });
  });

  describe('Transient vs Permanent Errors', () => {
    it('should retry on network timeout errors', async () => {
      // Test implementation
    });

    it('should retry on rate limit (429) errors', async () => {
      // Test implementation
    });

    it('should NOT retry on invalid entity ID errors', async () => {
      // Test implementation
    });

    it('should NOT retry on unsupported language errors', async () => {
      // Test implementation
    });

    it('should classify translation API 5xx errors as transient', async () => {
      // Test implementation
    });

    it('should classify translation API 4xx errors as permanent', async () => {
      // Test implementation
    });
  });

  describe('Job Requeue on Retry', () => {
    it('should reset status to queued for retryable failures', async () => {
      // Test implementation
    });

    it('should update status_updated_at when requeuing', async () => {
      // Test implementation
    });

    it('should maintain original priority when requeuing', async () => {
      // Test implementation
    });

    it('should clear worker_id when requeuing', async () => {
      // Test implementation
    });
  });

  describe('Exponential Backoff', () => {
    it('should calculate backoff delay based on attempt count', async () => {
      // Test implementation
    });

    it('should increase delay exponentially with each retry', async () => {
      // Test implementation
    });

    it('should cap maximum backoff delay', async () => {
      // Test implementation
    });

    it('should apply jitter to prevent thundering herd', async () => {
      // Test implementation
    });
  });
});
```

**Test Coverage Areas:**
- Attempt counter incrementation
- Maximum retry limit enforcement
- Error message storage and updates
- Transient vs permanent error classification
- Job requeue mechanics
- Exponential backoff calculation
- Backoff delay capping and jitter

---

### Task 4: Create Concurrency Control Unit Tests

**File:** `/src/lib/job-queue/__tests__/concurrency-control.unit.test.ts`

This test file verifies concurrency control mechanisms prevent resource conflicts.

```typescript
// concurrency-control.unit.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createMockTranslationJob,
  createMockJobBatch,
  resetMockDatabase
} from './helpers';

describe('Concurrency Control', () => {
  beforeEach(() => {
    resetMockDatabase();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Slot Management', () => {
    it('should initialize with configurable max concurrent slots (default 10)', async () => {
      // Test implementation
    });

    it('should track current number of active slots', async () => {
      // Test implementation
    });

    it('should allow acquire when slots available', async () => {
      // Test implementation
    });

    it('should block acquire when all slots occupied', async () => {
      // Test implementation
    });

    it('should release slot and allow waiting acquires', async () => {
      // Test implementation
    });
  });

  describe('Acquire Method', () => {
    it('should return immediately when slot available', async () => {
      // Test implementation
    });

    it('should queue request when no slots available', async () => {
      // Test implementation
    });

    it('should reject with timeout error when timeout expires', async () => {
      // Test implementation
    });

    it('should serve queued requests in FIFO order', async () => {
      // Test implementation
    });

    it('should accept optional timeout parameter', async () => {
      // Test implementation
    });
  });

  describe('Release Method', () => {
    it('should increment available slot count', async () => {
      // Test implementation
    });

    it('should wake up next waiting acquire request', async () => {
      // Test implementation
    });

    it('should handle release when no waiters exist', async () => {
      // Test implementation
    });

    it('should not exceed max slots on multiple releases', async () => {
      // Test implementation
    });
  });

  describe('Integration with Processors', () => {
    it('should acquire slot before translation API call', async () => {
      // Test implementation
    });

    it('should release slot in finally block on success', async () => {
      // Test implementation
    });

    it('should release slot in finally block on error', async () => {
      // Test implementation
    });

    it('should handle processor timeout during slot acquisition', async () => {
      // Test implementation
    });
  });

  describe('Rate Limit Handling', () => {
    it('should detect HTTP 429 responses from translation API', async () => {
      // Test implementation
    });

    it('should apply exponential backoff on rate limit', async () => {
      // Test implementation
    });

    it('should respect rate limit delay before allowing reacquire', async () => {
      // Test implementation
    });

    it('should increase backoff on consecutive rate limits', async () => {
      // Test implementation
    });
  });

  describe('Metrics Exposure', () => {
    it('should expose current active slot count', async () => {
      // Test implementation
    });

    it('should expose current queue depth', async () => {
      // Test implementation
    });

    it('should expose total requests processed count', async () => {
      // Test implementation
    });
  });

  describe('Configuration', () => {
    it('should read max concurrent from environment variable', async () => {
      // Test implementation
    });

    it('should use default value when env var not set', async () => {
      // Test implementation
    });

    it('should validate max concurrent is positive integer', async () => {
      // Test implementation
    });
  });
});
```

**Test Coverage Areas:**
- Slot initialization and tracking
- Acquire method behavior (immediate, queued, timeout)
- Release method behavior
- FIFO ordering for waiting requests
- Processor integration (acquire/release in finally)
- Rate limit detection and backoff
- Metrics exposure
- Configuration via environment variables

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/job-queue/__tests__/job-pickup.unit.test.ts` | Unit tests for job pickup and locking |
| `/src/lib/job-queue/__tests__/entity-processors.unit.test.ts` | Unit tests for entity-specific processors |
| `/src/lib/job-queue/__tests__/retry-logic.unit.test.ts` | Unit tests for retry mechanisms |
| `/src/lib/job-queue/__tests__/concurrency-control.unit.test.ts` | Unit tests for concurrency control |

### Existing Files to Modify (if needed)

| File Path | Modification |
|-----------|--------------|
| `/src/lib/job-queue/__tests__/helpers/mockFactories.ts` | Add additional mock factories if needed |
| `/src/lib/job-queue/__tests__/helpers/testUtils.ts` | Add additional test utilities if needed |
| `/src/lib/job-queue/__tests__/helpers/constants.ts` | Add test constants if needed |
| `/src/lib/job-queue/__tests__/helpers/index.ts` | Export new helpers |

### Files NOT to Modify

| File Path | Reason |
|-----------|--------|
| `/src/lib/job-queue/translation-jobs.ts` | Production code - tests should only verify behavior |
| `/src/lib/job-queue/job-processor.ts` | Production code - tests should only verify behavior |
| `/src/lib/job-queue/concurrency-control.ts` | Production code - tests should only verify behavior |
| `/src/lib/job-queue/translation-jobs.types.ts` | Type definitions - should remain unchanged |
| Existing integration tests | Integration tests complement unit tests |

---

## Implementation Order

1. **Review existing test helpers** - Understand available mock factories and utilities
2. **Create job-pickup.unit.test.ts** - Foundation tests for job selection and locking
3. **Create entity-processors.unit.test.ts** - Tests for each content type processor
4. **Create retry-logic.unit.test.ts** - Tests for failure handling and retry mechanisms
5. **Create concurrency-control.unit.test.ts** - Tests for concurrent access management
6. **Update mock helpers** - Add any required new mock factories
7. **Run test suite** - Verify all tests pass without flakiness
8. **Generate coverage report** - Ensure coverage thresholds are met

---

## Acceptance Criteria Verification

| Acceptance Criteria | Implementation Task | Verification Method |
|---------------------|---------------------|---------------------|
| Unit tests verify job pickup selects pending jobs and marks them as processing | Task 1: Job Pickup tests | Test assertions verify status transition |
| Unit tests confirm locking mechanism prevents concurrent processing of the same job | Task 1: Job Locking tests | Test assertions verify lock exclusivity |
| Unit tests validate each entity-specific processor handles its content type | Task 2: Entity Processor tests | Separate test suites per entity type |
| Unit tests check retry logic increments attempt count and respects maximum retry limits | Task 3: Retry Logic tests | Test assertions verify counter and limits |
| Unit tests verify concurrency control limits simultaneous job executions | Task 4: Concurrency Control tests | Test assertions verify slot management |
| All tests pass consistently without flakiness | All tasks | CI/CD pipeline verification |
| Test coverage for job processing modules exceeds 80% | All tasks | Vitest coverage report |

---

## Dependencies

### Depends On

| Dependency | Status | Notes |
|------------|--------|-------|
| REQ-E03-013: Enhance Job Processor | Required | Processor routing logic must exist |
| REQ-E03-014-017: Entity Processors | Required | Entity-specific processors must exist |
| REQ-E03-018: Job Prioritization | Required | Priority logic must exist |
| REQ-E03-019: Concurrency Control | Required | Concurrency module must exist |
| REQ-E03-020: Stale Job Cleanup | Required | Cleanup logic must exist |
| Epic 1: Job Queue Infrastructure | Required | Base job queue must be implemented |

### Blocks

| Dependent | Notes |
|-----------|-------|
| REQ-E03-032: Integration Tests for API Endpoints | Unit tests should pass before integration tests |
| Phase 7.5: Performance Testing | Unit tests establish baseline for performance tests |

---

## Testing Strategy

### Unit Test Approach

- **Isolation:** Each test file focuses on a single component
- **Mocking:** External dependencies (Supabase, translation API) are mocked
- **Arrange-Act-Assert:** Clear test structure for readability
- **Edge Cases:** Cover error conditions and boundary cases
- **No Network Calls:** All external calls are mocked

### Mock Strategy

```typescript
// Example mock setup pattern
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: mockSupabaseAdmin,
}));

vi.mock('@/lib/translation-service', () => ({
  translateText: vi.fn().mockResolvedValue({
    translatedText: 'Translated content',
    sourceLanguage: 'en',
    targetLanguage: 'fr',
  }),
}));
```

### Coverage Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| Line Coverage | > 80% | Meet acceptance criteria |
| Branch Coverage | > 75% | Cover conditional logic |
| Function Coverage | > 90% | All public functions tested |

### Test Execution

```bash
# Run all unit tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test job-pickup.unit.test.ts

# Watch mode for development
npm run test -- --watch
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Flaky tests due to async timing | Medium | Medium | Use proper async/await, avoid real timers |
| Mock drift from implementation | Low | High | Review mocks when implementation changes |
| Incomplete edge case coverage | Medium | Medium | Use coverage reports to identify gaps |
| Test maintenance burden | Low | Low | Follow DRY principles with shared helpers |
| CI environment differences | Low | Medium | Use consistent Node.js version, mock all I/O |

---

## Estimated Effort

| Task | Estimate | Notes |
|------|----------|-------|
| Review existing test infrastructure | 0.5 hours | Understand patterns and helpers |
| Create job-pickup.unit.test.ts | 2 hours | ~15-20 test cases |
| Create entity-processors.unit.test.ts | 3 hours | ~25-30 test cases across 4 entities |
| Create retry-logic.unit.test.ts | 2 hours | ~15-20 test cases |
| Create concurrency-control.unit.test.ts | 2 hours | ~15-20 test cases |
| Update mock helpers if needed | 0.5 hours | Add missing factories |
| Coverage verification and cleanup | 1 hour | Ensure thresholds met |
| **Total** | **11 hours** | ~1.5 days |

---

## Environment Variables Reference

| Variable | Purpose | Default |
|----------|---------|---------|
| `TRANSLATION_MAX_CONCURRENT` | Maximum concurrent translation API calls | 10 |
| `TRANSLATION_MAX_RETRIES` | Maximum retry attempts for failed jobs | 3 |
| `TRANSLATION_STALE_THRESHOLD_MS` | Time before job considered stale | 300000 (5 min) |
| `TRANSLATION_BACKOFF_BASE_MS` | Base delay for exponential backoff | 1000 |
| `TRANSLATION_BACKOFF_MAX_MS` | Maximum backoff delay | 60000 |

---

## Notes

1. **Test Isolation:** Each test should be independent and not rely on state from other tests. Use `beforeEach` to reset mocks and state.

2. **Mock Verification:** Use `vi.fn()` with `.toHaveBeenCalledWith()` to verify correct arguments are passed to mocked dependencies.

3. **Error Testing:** Explicitly test error paths by configuring mocks to throw errors or return error responses.

4. **Snapshot Testing:** Avoid snapshot tests for this module as they provide less value for logic-heavy code.

5. **Parallel Execution:** Tests should be designed to run in parallel without interference. Avoid shared mutable state.

6. **Documentation:** Each test should have a clear description that explains the expected behavior being verified.

7. **Coverage Gaps:** The coverage report will highlight untested code paths. Address gaps in retry logic and edge cases first.

8. **Existing Integration Tests:** These unit tests complement the existing integration tests in `job-processing.integration.test.ts` and `concurrent-processing.integration.test.ts`. Unit tests focus on isolated function behavior while integration tests verify end-to-end workflows.

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- Request Document: `/docs/gen_requests_epic3.md` (REQ-E03-031)
- Job Queue Types: `/src/lib/job-queue/translation-jobs.types.ts`
- Existing Integration Tests: `/src/lib/job-queue/__tests__/job-processing.integration.test.ts`
- Mock Helpers: `/src/lib/job-queue/__tests__/helpers/`
- Vitest Documentation: https://vitest.dev/

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation*
*Phase 7: Testing & Validation - Task 7.2*
