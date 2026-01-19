# REQ-366: Performance Testing for Translation System - Implementation Overview

**Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Status:** Ready for Implementation
**Epic:** Localization Epic 3 - Dynamic Content Translation
**Phase:** 7 - Testing & Validation
**Task ID:** 7.5
**Size:** M (Medium)

---

## Summary

Conduct comprehensive performance testing to validate the translation system can handle production-level loads. This includes testing with 100+ concurrent translation jobs, measuring job completion times against the target of <60 seconds, and verifying rate limiting correctly prevents exceeding external translation service quotas. The testing will identify potential bottlenecks in database queries, job processing concurrency, and external API call patterns before they impact production users.

---

## Dependencies

### Required Prior Implementation

| Dependency | REQ ID | Status |
|------------|--------|--------|
| Job queue infrastructure | Epic 1 (REQ-243) | Must be implemented |
| Job processor | Epic 1 (REQ-244) | Must be implemented |
| Concurrency control | Epic 1 (REQ-245) | Must be implemented |
| Rate limiter | Epic 1 (REQ-238) | Must be implemented |
| Retry logic | Epic 1 (REQ-239) | Must be implemented |
| Content translation triggers | Epic 3 (Tasks 2.1-2.5) | Must be implemented |
| Job processing enhancements | Epic 3 (Tasks 3.1-3.8) | Must be implemented |
| Translation status APIs | Epic 3 (Tasks 4.1-4.4) | Must be implemented |

### Infrastructure Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| Vitest configuration | `/vitest.config.ts` | Test runner setup |
| Vitest setup | `/vitest.setup.ts` | Global mocks |
| Mock Supabase | `/src/lib/job-queue/__tests__/helpers/mockSupabase.ts` | Database mocking |
| Test utilities | `/src/lib/job-queue/__tests__/helpers/testUtils.ts` | Concurrency helpers |
| Translation service | `/src/lib/translation-service/` | Translation API |
| Job queue module | `/src/lib/job-queue/` | Job processing |

---

## Technical Context

### Existing Testing Infrastructure

The project has established patterns for concurrent testing:

1. **Concurrency Testing Utilities** (`testUtils.ts`):
   - `runConcurrently<T>(fn, count)` - Execute function N times in parallel
   - `runSequentially<T>(fns, delayMs)` - Execute with controlled delays
   - `createTimer()` - Performance timing with `elapsed()` and `hasExceeded(maxMs)`
   - `waitForCondition(conditionFn, timeoutMs, intervalMs)` - Async polling
   - `waitForJobStatus(getJobFn, expectedStatus, timeoutMs, intervalMs)` - Job state polling

2. **Mock Database** (`mockSupabase.ts`):
   - In-memory storage for isolated testing
   - CRUD operations: `seedMockDatabase()`, `addMockRecord()`, `updateMockRecord()`, `findMockRecord()`
   - Support for query patterns matching Supabase client API

3. **Test Constants** (`constants.ts`):
   - `CONCURRENT_WORKERS: 5`
   - `BATCH_SIZE: 10`
   - `TEST_TIMEOUT_MS: 5000`
   - `LOCK_TIMEOUT_MINUTES: 5`
   - `MAX_RETRIES: 3`

### Rate Limiter Implementation

Located at `/src/lib/translation-service/utils/rate-limiter.ts`:

```typescript
interface RateLimiterConfig {
  maxRequests: number;      // Default: 60
  windowMs: number;         // Default: 60000 (1 minute)
  strategy: 'queue' | 'reject';
  maxQueueSize?: number;    // Default: 100
  queueTimeoutMs?: number;  // Default: 30000
}
```

Strategies:
- **Queue Strategy**: Delays requests when limit reached, processes from queue as window resets
- **Reject Strategy**: Throws `RateLimitError` immediately when limit exceeded
- Uses sliding window algorithm for rate tracking

### Concurrency Control Implementation

Located at `/src/lib/job-queue/concurrency-control.ts`:

```typescript
interface ConcurrencyConfig {
  lockTimeoutMinutes: number;
  heartbeatIntervalMs: number;
  autoCleanupEnabled: boolean;
  cleanupIntervalMs: number;
  maxStaleRetries: number;
}
```

Features:
- Lock-based job acquisition (FOR UPDATE SKIP LOCKED pattern)
- Stale lock recovery
- Lock heartbeat mechanism
- Lock statistics tracking

---

## Implementation Approach

### Test File Structure

```
/src/lib/job-queue/__tests__/
├── performance/
│   ├── load-testing.perf.test.ts        # Main performance test suite
│   ├── rate-limiting.perf.test.ts       # Rate limiter validation
│   ├── sustained-load.perf.test.ts      # 10-minute sustained load test
│   └── helpers/
│       ├── mockTranslationService.ts    # Mock translation API with delays
│       ├── performanceMetrics.ts        # Metrics collection utilities
│       └── testDataGenerators.ts        # Job and entity generators

/docs/testing/
├── performance-test-results.md          # Test results documentation
└── performance-recommendations.md       # Configuration tuning guide
```

### Performance Test Categories

#### Category 1: Concurrent Job Processing (100+ jobs)

Test scenarios:
1. **Burst Load Test** - Create 100 jobs simultaneously, measure total completion time
2. **Mixed Entity Types** - 25 items + 25 articles + 25 links + 25 tags
3. **Priority Ordering** - Verify high-priority jobs complete before lower priority
4. **All Jobs Complete** - Verify no jobs stuck in pending/processing state

#### Category 2: Job Completion Time (<60s target)

Metrics to collect:
1. **Average completion time** - Target: <60 seconds
2. **95th percentile completion time** - Target: <90 seconds
3. **Maximum completion time** - Document outliers
4. **Per-entity-type breakdown** - Identify slow entity types

#### Category 3: Rate Limiting Validation

Verify:
1. **Request rate stays within limits** - Monitor API calls per minute
2. **Delays introduced appropriately** - Rate limiter queues requests
3. **Delayed requests complete successfully** - No dropped requests
4. **No quota violations** - External API limits not exceeded

#### Category 4: Database Performance

Monitor:
1. **Connection pool usage** - Verify no exhaustion
2. **Query response times** - Target: <500ms at 95th percentile
3. **No N+1 query patterns** - Efficient batch operations
4. **Index utilization** - Verify indexes are used

#### Category 5: Resource Usage

Track:
1. **Memory usage** - No leaks, stable under load
2. **CPU usage** - Scales with configured concurrency
3. **Event loop lag** - No blocking operations

#### Category 6: Sustained Load (10 minutes)

Validate:
1. **Steady throughput** - No degradation over time
2. **Queue depth manageable** - Doesn't grow unbounded
3. **Error recovery** - Handles 10% simulated failures
4. **Retry behavior** - Failed jobs retried correctly

---

## Implementation Tasks

### Task 1: Create Mock Translation Service

**File:** `/src/lib/job-queue/__tests__/performance/helpers/mockTranslationService.ts`

Create a mock translation service that:
- Simulates realistic response times (100-500ms per translation)
- Supports configurable failure rate (default 10%)
- Tracks API call counts per minute for rate limit verification
- Logs all calls for analysis

### Task 2: Create Performance Metrics Utilities

**File:** `/src/lib/job-queue/__tests__/performance/helpers/performanceMetrics.ts`

Implement utilities for:
- Collecting timing metrics (min, max, avg, percentiles)
- Tracking resource usage (memory, CPU)
- Monitoring database query times
- Generating summary statistics

### Task 3: Create Test Data Generators

**File:** `/src/lib/job-queue/__tests__/performance/helpers/testDataGenerators.ts`

Create generators for:
- Translation jobs with various entity types
- Mixed priority levels
- Realistic content data (names, descriptions, titles)

### Task 4: Implement Concurrent Load Test

**File:** `/src/lib/job-queue/__tests__/performance/load-testing.perf.test.ts`

Test scenarios:
- Create 100 jobs simultaneously
- Verify all jobs created successfully
- Start job processor with configured concurrency
- Measure time from first creation to last completion
- Verify all jobs reach completed status
- Verify no failed jobs due to system errors

### Task 5: Implement Rate Limiting Test

**File:** `/src/lib/job-queue/__tests__/performance/rate-limiting.perf.test.ts`

Test scenarios:
- Monitor API calls during test execution
- Verify requests per minute within configured limit
- Verify queue delays introduced when limit reached
- Verify delayed requests complete successfully

### Task 6: Implement Sustained Load Test

**File:** `/src/lib/job-queue/__tests__/performance/sustained-load.perf.test.ts`

Test scenarios:
- Create jobs continuously for 10 minutes
- Measure throughput stability over time
- Verify queue depth doesn't grow unbounded
- Simulate 10% failure rate, verify retry handling

### Task 7: Create Performance Results Documentation

**File:** `/docs/testing/performance-test-results.md`

Document:
- Test execution summary
- Completion time graphs/tables
- Rate limiting observations
- Database metrics
- Resource usage profiles
- Identified bottlenecks
- Configuration recommendations

### Task 8: Update Vitest Configuration

**File:** `/vitest.config.ts`

Add:
- Performance test file patterns
- Extended timeout for performance tests (600000ms for sustained load)
- Separate test command for performance suite

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/job-queue/__tests__/performance/helpers/mockTranslationService.ts` | Mock translation API with configurable delays and failures |
| `/src/lib/job-queue/__tests__/performance/helpers/performanceMetrics.ts` | Metrics collection and analysis utilities |
| `/src/lib/job-queue/__tests__/performance/helpers/testDataGenerators.ts` | Test job and entity data generators |
| `/src/lib/job-queue/__tests__/performance/load-testing.perf.test.ts` | Main concurrent load test suite |
| `/src/lib/job-queue/__tests__/performance/rate-limiting.perf.test.ts` | Rate limiter validation tests |
| `/src/lib/job-queue/__tests__/performance/sustained-load.perf.test.ts` | 10-minute sustained load test |
| `/docs/testing/performance-test-results.md` | Test results documentation |
| `/docs/testing/performance-recommendations.md` | Configuration tuning guide |

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `/vitest.config.ts` | Add performance test patterns and extended timeouts |
| `/package.json` | Add `test:perf` script for performance test suite |

### Files to Read (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/job-queue/translation-jobs.ts` | Job creation functions to test |
| `/src/lib/job-queue/job-processor.ts` | Job processor to benchmark |
| `/src/lib/job-queue/concurrency-control.ts` | Concurrency patterns |
| `/src/lib/translation-service/utils/rate-limiter.ts` | Rate limiting implementation |
| `/src/lib/translation-service/utils/retry.ts` | Retry logic |
| `/src/lib/job-queue/__tests__/helpers/testUtils.ts` | Existing test utilities |
| `/src/lib/job-queue/__tests__/helpers/mockSupabase.ts` | Mock database patterns |
| `/src/lib/job-queue/__tests__/concurrent-processing.integration.test.ts` | Concurrent testing reference |

---

## Test Data Structures

### Mock Translation Job

```typescript
interface MockTranslationJob {
  id: string;
  entityType: 'item' | 'article' | 'link' | 'tag';
  entityId: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  priority: number;
  attempts: number;
  errorMessage: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}
```

### Performance Metrics Collection

```typescript
interface PerformanceMetrics {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  totalDurationMs: number;
  completionTimes: {
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  };
  apiCallsPerMinute: number[];
  maxConcurrentProcessing: number;
  memoryUsageMB: {
    initial: number;
    peak: number;
    final: number;
  };
}
```

### Rate Limit Tracking

```typescript
interface RateLimitMetrics {
  totalRequests: number;
  requestsPerMinute: number[];
  delayedRequests: number;
  avgDelayMs: number;
  maxDelayMs: number;
  configuredLimit: number;
  violationCount: number;
}
```

---

## Acceptance Criteria

### Concurrent Job Processing
- [ ] Performance test suite creates 100 translation jobs simultaneously
- [ ] Test verifies all 100 jobs are created successfully in database
- [ ] Test verifies all jobs have pending status immediately after creation
- [ ] Test starts background job processor with configured concurrency settings
- [ ] Test verifies all 100 jobs transition to completed status successfully
- [ ] Test verifies no jobs remain in pending or in-progress state after processing

### Job Completion Time
- [ ] Test measures elapsed time from first job creation to last job completion
- [ ] Test verifies average job completion time is under 60 seconds
- [ ] Test verifies 95th percentile completion time is under 90 seconds
- [ ] Test verifies no jobs transition to failed status due to system errors

### Rate Limiting
- [ ] Test monitors external API calls during test execution
- [ ] Test verifies number of API calls per minute stays within configured rate limit
- [ ] Test verifies rate limiter introduces appropriate delays between requests
- [ ] Test verifies delayed requests eventually complete successfully
- [ ] Test verifies rate limiting prevents exceeding external API request limits

### Database Performance
- [ ] Test measures database connection pool usage during peak load
- [ ] Test verifies connection pool does not reach maximum capacity
- [ ] Test verifies no database connection timeout errors occur
- [ ] Test measures database query response times during processing
- [ ] Test verifies query response times remain under 500ms at 95th percentile
- [ ] Test identifies any N+1 query patterns in job processing logic
- [ ] Test verifies job queue queries use appropriate indexes

### Resource Usage
- [ ] Test measures memory usage of job processor during peak load
- [ ] Test verifies memory usage remains stable without memory leaks
- [ ] Test measures CPU usage during concurrent job processing
- [ ] Test verifies CPU usage scales appropriately with configured concurrency

### Entity Type Coverage
- [ ] Performance test creates jobs for different entity types (items, articles, links, tags)
- [ ] Test verifies performance remains consistent across different entity types
- [ ] Test verifies job prioritization still functions correctly under high load
- [ ] Test verifies high-priority jobs complete before lower-priority jobs

### Sustained Load (10-minute test)
- [ ] Performance test simulates sustained load over 10-minute period
- [ ] Test creates new translation jobs continuously throughout test duration
- [ ] Test verifies system processes jobs steadily without degradation over time
- [ ] Test verifies queue depth remains manageable and does not grow unbounded

### Failure Handling
- [ ] Performance test includes scenarios with mixed success and failure rates
- [ ] Test simulates 10% of translation API calls returning temporary errors
- [ ] Test verifies retry logic handles failures without degrading overall throughput
- [ ] Test verifies failed jobs are retried according to configured retry policy
- [ ] Test verifies retry operations do not cause cascade failures

### Documentation
- [ ] Performance test results are documented in markdown format
- [ ] Documentation includes percentile breakdown of completion times
- [ ] Documentation includes rate limiting behavior observations
- [ ] Documentation includes database performance metrics
- [ ] Documentation includes memory and CPU usage profiles
- [ ] Documentation identifies any performance bottlenecks discovered
- [ ] Documentation includes recommendations for configuration tuning if needed

### Test Infrastructure
- [ ] All performance tests can be executed in isolated test environment
- [ ] Tests use mock translation service that simulates realistic response times
- [ ] Tests use test database instance that matches production database schema
- [ ] Tests clean up all created jobs and translations after execution
- [ ] Performance test suite is documented with setup instructions
- [ ] Performance test suite includes configuration parameters for adjusting load levels
- [ ] Performance test suite can be executed as part of pre-release validation process

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Task 1: Mock translation service | 2 hours |
| Task 2: Performance metrics utilities | 2 hours |
| Task 3: Test data generators | 1 hour |
| Task 4: Concurrent load test | 3 hours |
| Task 5: Rate limiting test | 2 hours |
| Task 6: Sustained load test | 3 hours |
| Task 7: Results documentation | 2 hours |
| Task 8: Configuration updates | 30 minutes |
| **Total** | **15-16 hours** |

---

## Testing Commands

```bash
# Run all performance tests
npm run test:perf

# Run specific performance test file
npm test -- src/lib/job-queue/__tests__/performance/load-testing.perf.test.ts

# Run with verbose output
npm test -- --reporter=verbose src/lib/job-queue/__tests__/performance/

# Run sustained load test (requires extended timeout)
npm test -- --testTimeout=660000 src/lib/job-queue/__tests__/performance/sustained-load.perf.test.ts
```

---

## Configuration Parameters

The performance test suite should support these configurable parameters:

```typescript
const PERFORMANCE_CONFIG = {
  // Concurrent load test
  CONCURRENT_JOBS: 100,
  JOB_BATCH_SIZE: 10,

  // Timing targets
  TARGET_AVG_COMPLETION_MS: 60000,    // 60 seconds
  TARGET_P95_COMPLETION_MS: 90000,    // 90 seconds
  TARGET_QUERY_P95_MS: 500,           // 500ms for DB queries

  // Rate limiting
  API_RATE_LIMIT_PER_MINUTE: 60,

  // Sustained load
  SUSTAINED_TEST_DURATION_MS: 600000, // 10 minutes
  JOBS_PER_SECOND: 2,

  // Failure simulation
  SIMULATED_FAILURE_RATE: 0.10,       // 10%

  // Mock service
  MOCK_API_DELAY_MIN_MS: 100,
  MOCK_API_DELAY_MAX_MS: 500,

  // Resource limits
  MAX_MEMORY_GROWTH_MB: 100,
  MAX_CONNECTION_POOL_USAGE: 0.8,     // 80%
};
```

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- Epic 3 PRD: `/docs/prd/PRD_L10N_Epic3_Dynamic_Content_Translation.md`
- Request Registry: `/docs/gen_requests_epic3.md` (REQ-366)
- Concurrent testing reference: `/src/lib/job-queue/__tests__/concurrent-processing.integration.test.ts`
- Test utilities: `/src/lib/job-queue/__tests__/helpers/testUtils.ts`
- Rate limiter: `/src/lib/translation-service/utils/rate-limiter.ts`
- Vitest documentation: https://vitest.dev/
- Node.js performance hooks: https://nodejs.org/api/perf_hooks.html
