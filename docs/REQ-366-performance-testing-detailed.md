# REQ-366: Performance Testing for Translation System - Detailed Task Breakdown

**Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Status:** Ready for Implementation
**Epic:** Localization Epic 3 - Dynamic Content Translation
**Phase:** 7 - Testing & Validation
**Task ID:** 7.5
**Size:** M (Medium)
**Overview Document:** [REQ-366-performance-testing-overview.md](./REQ-366-performance-testing-overview.md)
**Implementation Plan:** [Plan-111-L10N-Epic3-Dynamic-Content-Translation.md](./prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md)

---

## Quick Reference

| Attribute | Value |
|-----------|-------|
| Total Tasks | 8 |
| Estimated Effort | 15-16 hours |
| Files to Create | 8 |
| Files to Modify | 2 |
| Test Commands | `npm run test:perf` |

---

## Task Breakdown

### Task 1: Create Mock Translation Service

**File:** `/src/lib/job-queue/__tests__/performance/helpers/mockTranslationService.ts`

**Objective:** Create a mock translation service that simulates realistic API behavior with configurable delays and failure rates.

**Implementation Steps:**

1. Create the directory structure:
   ```bash
   mkdir -p src/lib/job-queue/__tests__/performance/helpers
   ```

2. Create the mock translation service file with the following exports:
   - `MockTranslationService` class
   - `createMockTranslationService(config)` factory function
   - `MockTranslationConfig` interface

3. Implement the following functionality:
   ```typescript
   // Core interface
   interface MockTranslationConfig {
     minDelayMs: number;           // Default: 100
     maxDelayMs: number;           // Default: 500
     failureRate: number;          // Default: 0.10 (10%)
     trackCalls: boolean;          // Default: true
   }

   // Methods to implement
   class MockTranslationService {
     async translateText(text: string, source: string, target: string): Promise<string>;
     getCallCount(): number;
     getCallsPerMinute(): number[];
     getAverageDelayMs(): number;
     reset(): void;
   }
   ```

4. Add call tracking functionality:
   - Store timestamps for each call
   - Calculate calls per minute intervals
   - Track total calls and failures

5. Add configurable delay simulation:
   - Random delay between `minDelayMs` and `maxDelayMs`
   - Use `setTimeout` with Promise wrapper

6. Add configurable failure simulation:
   - Random failure based on `failureRate`
   - Throw appropriate error types (rate limit, timeout, etc.)

**Acceptance Criteria:**
- [ ] Mock service simulates realistic response times (100-500ms)
- [ ] Supports configurable failure rate (default 10%)
- [ ] Tracks API call counts per minute for rate limit verification
- [ ] Logs all calls for analysis
- [ ] Can be reset between tests

**Estimated Effort:** 2 hours

---

### Task 2: Create Performance Metrics Utilities

**File:** `/src/lib/job-queue/__tests__/performance/helpers/performanceMetrics.ts`

**Objective:** Implement utilities for collecting, analyzing, and reporting performance metrics.

**Implementation Steps:**

1. Define the metrics interfaces:
   ```typescript
   interface PerformanceMetrics {
     totalJobs: number;
     completedJobs: number;
     failedJobs: number;
     totalDurationMs: number;
     completionTimes: TimingMetrics;
     apiCallsPerMinute: number[];
     maxConcurrentProcessing: number;
     memoryUsageMB: MemoryMetrics;
   }

   interface TimingMetrics {
     min: number;
     max: number;
     avg: number;
     p50: number;
     p95: number;
     p99: number;
   }

   interface MemoryMetrics {
     initial: number;
     peak: number;
     final: number;
   }
   ```

2. Implement `PerformanceCollector` class:
   ```typescript
   class PerformanceCollector {
     constructor();
     startTest(): void;
     recordJobStart(jobId: string): void;
     recordJobComplete(jobId: string): void;
     recordJobFailed(jobId: string): void;
     recordApiCall(): void;
     snapshotMemory(): void;
     endTest(): PerformanceMetrics;
     getMetrics(): PerformanceMetrics;
   }
   ```

3. Implement percentile calculation:
   ```typescript
   function calculatePercentile(values: number[], percentile: number): number;
   function calculateTimingMetrics(values: number[]): TimingMetrics;
   ```

4. Implement memory tracking:
   - Use `process.memoryUsage()` for Node.js
   - Track heapUsed in MB
   - Record at intervals during test

5. Implement metrics summary generation:
   ```typescript
   function generateMetricsSummary(metrics: PerformanceMetrics): string;
   function generateMarkdownReport(metrics: PerformanceMetrics): string;
   ```

**Acceptance Criteria:**
- [ ] Collects timing metrics (min, max, avg, percentiles)
- [ ] Tracks resource usage (memory)
- [ ] Monitors database query times (via injection)
- [ ] Generates summary statistics
- [ ] Can export metrics to markdown format

**Estimated Effort:** 2 hours

---

### Task 3: Create Test Data Generators

**File:** `/src/lib/job-queue/__tests__/performance/helpers/testDataGenerators.ts`

**Objective:** Create generators for translation jobs with various entity types, priorities, and realistic content.

**Implementation Steps:**

1. Define generator interfaces:
   ```typescript
   interface GeneratedJob {
     id: string;
     entityType: 'item' | 'article' | 'link' | 'tag';
     entityId: string;
     sourceLanguage: SupportedLanguage;
     targetLanguage: SupportedLanguage;
     status: 'queued';
     priority: number;
     attempts: number;
     createdAt: string;
   }

   interface GeneratorConfig {
     totalJobs: number;
     entityTypeDistribution?: {
       item: number;
       article: number;
       link: number;
       tag: number;
     };
     priorityDistribution?: {
       high: number;    // priority 100
       medium: number;  // priority 50
       low: number;     // priority 25
     };
   }
   ```

2. Implement job generators:
   ```typescript
   function generateSingleJob(entityType: EntityType, priority?: number): GeneratedJob;
   function generateJobBatch(config: GeneratorConfig): GeneratedJob[];
   function generateMixedEntityJobs(count: number): GeneratedJob[];
   function generatePriorityJobs(high: number, medium: number, low: number): GeneratedJob[];
   ```

3. Implement mock entity data generators:
   ```typescript
   function generateMockItem(): MockItem;
   function generateMockArticle(): MockArticle;
   function generateMockLink(): MockLink;
   function generateMockTag(): MockTag;
   ```

4. Add realistic content data:
   - Item names (household appliances, amenities)
   - Article titles (how-to guides, safety instructions)
   - Link titles (video tutorials, PDF manuals)
   - Tag names (categories, features)

5. Add ID generation utilities:
   ```typescript
   function generateUUID(): string;
   function generateJobId(): string;
   function generateEntityId(type: EntityType): string;
   ```

**Acceptance Criteria:**
- [ ] Generates translation jobs with various entity types
- [ ] Supports mixed priority levels
- [ ] Creates realistic content data (names, descriptions, titles)
- [ ] Supports configurable distribution of entity types
- [ ] Generates valid UUIDs for job and entity IDs

**Estimated Effort:** 1 hour

---

### Task 4: Implement Concurrent Load Test

**File:** `/src/lib/job-queue/__tests__/performance/load-testing.perf.test.ts`

**Objective:** Create a comprehensive test suite that validates the system can handle 100+ concurrent translation jobs.

**Implementation Steps:**

1. Set up test file structure:
   ```typescript
   import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
   import { PerformanceCollector } from './helpers/performanceMetrics';
   import { generateJobBatch, generateMixedEntityJobs } from './helpers/testDataGenerators';
   import { createMockTranslationService } from './helpers/mockTranslationService';
   import { seedMockDatabase, clearMockDatabase } from '../helpers/mockSupabase';
   ```

2. Create test configuration:
   ```typescript
   const LOAD_TEST_CONFIG = {
     CONCURRENT_JOBS: 100,
     JOB_BATCH_SIZE: 10,
     TARGET_AVG_COMPLETION_MS: 60000,
     TARGET_P95_COMPLETION_MS: 90000,
     TEST_TIMEOUT_MS: 300000, // 5 minutes
   };
   ```

3. Implement test suite:
   ```typescript
   describe('Concurrent Load Testing', () => {
     describe('Burst Load Test', () => {
       it('should create 100 jobs simultaneously', async () => {...});
       it('should verify all jobs created with pending status', async () => {...});
       it('should process all jobs to completion', async () => {...});
       it('should complete within target time', async () => {...});
     });

     describe('Mixed Entity Types', () => {
       it('should handle 25 items + 25 articles + 25 links + 25 tags', async () => {...});
       it('should maintain consistent performance across entity types', async () => {...});
     });

     describe('Priority Ordering', () => {
       it('should complete high-priority jobs before low-priority', async () => {...});
     });

     describe('Job Completion Validation', () => {
       it('should leave no jobs in pending state', async () => {...});
       it('should leave no jobs in processing state', async () => {...});
       it('should have no system-error failures', async () => {...});
     });
   });
   ```

4. Implement helper functions:
   ```typescript
   async function createJobsBatch(jobs: GeneratedJob[]): Promise<void>;
   async function waitForAllJobsComplete(timeout: number): Promise<void>;
   async function getJobStatistics(): Promise<JobStats>;
   function verifyCompletionTimes(metrics: PerformanceMetrics): void;
   ```

5. Add cleanup and setup hooks:
   ```typescript
   beforeAll(async () => {
     // Initialize mock services
     // Set up test database
   });

   afterAll(async () => {
     // Clean up all test data
     // Generate report
   });

   beforeEach(async () => {
     // Reset metrics collector
     // Clear previous test jobs
   });
   ```

**Test Scenarios:**

| Scenario | Jobs | Expected Outcome |
|----------|------|------------------|
| Burst Load | 100 | All complete in <5 min |
| Mixed Entity | 100 (25 each) | Consistent per-type timing |
| Priority Order | 50 high, 50 low | High completes first |
| System Stability | 100 | No stuck jobs |

**Acceptance Criteria:**
- [ ] Creates 100 jobs simultaneously
- [ ] Verifies all jobs created successfully
- [ ] Starts job processor with configured concurrency
- [ ] Measures time from first creation to last completion
- [ ] Verifies all jobs reach completed status
- [ ] Verifies no failed jobs due to system errors
- [ ] Verifies average completion time < 60 seconds
- [ ] Verifies 95th percentile < 90 seconds

**Estimated Effort:** 3 hours

---

### Task 5: Implement Rate Limiting Test

**File:** `/src/lib/job-queue/__tests__/performance/rate-limiting.perf.test.ts`

**Objective:** Validate that rate limiting correctly prevents exceeding external translation service quotas.

**Implementation Steps:**

1. Set up test configuration:
   ```typescript
   const RATE_LIMIT_CONFIG = {
     MAX_REQUESTS_PER_MINUTE: 60,
     TEST_DURATION_MS: 120000, // 2 minutes
     JOBS_TO_CREATE: 150, // More than 1 minute of requests
   };
   ```

2. Define rate limit metrics interface:
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

3. Implement test suite:
   ```typescript
   describe('Rate Limiting Validation', () => {
     describe('Request Rate Monitoring', () => {
       it('should stay within configured rate limit', async () => {...});
       it('should track requests per minute accurately', async () => {...});
     });

     describe('Delay Behavior', () => {
       it('should introduce delays when limit reached', async () => {...});
       it('should queue requests when using queue strategy', async () => {...});
       it('should complete delayed requests successfully', async () => {...});
     });

     describe('No Violations', () => {
       it('should never exceed configured API limit', async () => {...});
       it('should handle burst requests gracefully', async () => {...});
     });
   });
   ```

4. Implement monitoring utilities:
   ```typescript
   function createRateLimitMonitor(maxPerMinute: number): RateLimitMonitor;
   function recordApiCall(monitor: RateLimitMonitor): void;
   function getRequestsInWindow(monitor: RateLimitMonitor, windowMs: number): number;
   function getRateLimitMetrics(monitor: RateLimitMonitor): RateLimitMetrics;
   ```

5. Implement assertions:
   ```typescript
   function assertNoRateLimitViolations(metrics: RateLimitMetrics): void;
   function assertDelaysIntroduced(metrics: RateLimitMetrics): void;
   function assertAllRequestsCompleted(metrics: RateLimitMetrics, expected: number): void;
   ```

**Test Scenarios:**

| Scenario | Requests | Rate Limit | Expected |
|----------|----------|------------|----------|
| Within Limit | 50 | 60/min | No delays |
| At Limit | 60 | 60/min | Minimal delays |
| Over Limit | 150 | 60/min | Significant delays, no violations |
| Burst | 100 instant | 60/min | Queued and completed |

**Acceptance Criteria:**
- [ ] Monitors API calls during test execution
- [ ] Verifies requests per minute within configured limit
- [ ] Verifies queue delays introduced when limit reached
- [ ] Verifies delayed requests complete successfully
- [ ] Records no rate limit violations

**Estimated Effort:** 2 hours

---

### Task 6: Implement Sustained Load Test

**File:** `/src/lib/job-queue/__tests__/performance/sustained-load.perf.test.ts`

**Objective:** Validate system stability under continuous load over a 10-minute period.

**Implementation Steps:**

1. Set up test configuration:
   ```typescript
   const SUSTAINED_LOAD_CONFIG = {
     TEST_DURATION_MS: 600000, // 10 minutes
     JOBS_PER_SECOND: 2,
     SIMULATED_FAILURE_RATE: 0.10, // 10%
     MAX_QUEUE_DEPTH: 200,
     MEASUREMENT_INTERVAL_MS: 30000, // Every 30 seconds
   };
   ```

2. Define sustained load metrics:
   ```typescript
   interface SustainedLoadMetrics {
     duration: number;
     totalJobsCreated: number;
     totalJobsCompleted: number;
     totalJobsFailed: number;
     totalJobsRetried: number;
     throughputOverTime: ThroughputSample[];
     queueDepthOverTime: QueueDepthSample[];
     memoryOverTime: MemorySample[];
   }

   interface ThroughputSample {
     timestamp: number;
     jobsCreated: number;
     jobsCompleted: number;
     processingRate: number;
   }
   ```

3. Implement test suite:
   ```typescript
   describe('Sustained Load Testing (10 minutes)', () => {
     describe('Throughput Stability', () => {
       it('should maintain steady throughput over time', async () => {...});
       it('should not show degradation in later intervals', async () => {...});
     });

     describe('Queue Management', () => {
       it('should keep queue depth manageable', async () => {...});
       it('should not grow unbounded', async () => {...});
     });

     describe('Error Recovery', () => {
       it('should handle 10% failure rate gracefully', async () => {...});
       it('should retry failed jobs correctly', async () => {...});
       it('should not cause cascade failures', async () => {...});
     });

     describe('Resource Stability', () => {
       it('should maintain stable memory usage', async () => {...});
       it('should not leak memory over time', async () => {...});
     });
   });
   ```

4. Implement continuous job creation:
   ```typescript
   async function createJobsContinuously(
     durationMs: number,
     jobsPerSecond: number,
     onJobCreated: (job: GeneratedJob) => void
   ): Promise<void>;
   ```

5. Implement periodic measurement:
   ```typescript
   function startPeriodicMeasurement(
     intervalMs: number,
     collector: SustainedLoadCollector
   ): () => void; // Returns stop function

   async function collectSample(collector: SustainedLoadCollector): Promise<void>;
   ```

6. Implement trend analysis:
   ```typescript
   function analyzeThroughputTrend(samples: ThroughputSample[]): TrendAnalysis;
   function analyzeQueueTrend(samples: QueueDepthSample[]): TrendAnalysis;
   function detectDegradation(samples: number[]): boolean;
   ```

**Test Scenarios:**

| Scenario | Duration | Job Rate | Expected |
|----------|----------|----------|----------|
| Steady State | 10 min | 2/sec | Stable throughput |
| Queue Growth | 10 min | 2/sec | Bounded queue |
| Error Recovery | 10 min | 2/sec + 10% fail | All retries complete |
| Memory Stability | 10 min | 2/sec | <100MB growth |

**Acceptance Criteria:**
- [ ] Creates jobs continuously for 10 minutes
- [ ] Measures throughput stability over time
- [ ] Verifies queue depth remains manageable
- [ ] Simulates 10% failure rate
- [ ] Verifies retry handling
- [ ] Verifies no cascade failures
- [ ] Verifies stable memory usage

**Estimated Effort:** 3 hours

---

### Task 7: Create Performance Results Documentation

**File:** `/docs/testing/performance-test-results.md`

**Objective:** Document comprehensive test results, metrics, and recommendations.

**Implementation Steps:**

1. Create documentation template:
   ```markdown
   # Translation System Performance Test Results

   **Test Date:** [DATE]
   **Test Environment:** [ENV DETAILS]
   **Tester:** [NAME/SYSTEM]

   ## Executive Summary
   [High-level results and pass/fail status]

   ## Test Configuration
   [All config parameters used]

   ## Results by Category
   ### Concurrent Job Processing
   ### Job Completion Times
   ### Rate Limiting
   ### Database Performance
   ### Resource Usage
   ### Sustained Load

   ## Identified Bottlenecks
   ## Recommendations
   ## Raw Metrics
   ```

2. Implement automated report generation:
   ```typescript
   // In performanceMetrics.ts
   function generatePerformanceReport(
     metrics: PerformanceMetrics,
     config: TestConfig
   ): string;
   ```

3. Create visualization data structures:
   ```typescript
   interface ChartData {
     completionTimeHistogram: HistogramBucket[];
     throughputTimeSeries: TimeSeriesPoint[];
     queueDepthTimeSeries: TimeSeriesPoint[];
     memoryUsageTimeSeries: TimeSeriesPoint[];
   }
   ```

4. Document the following sections:

   **Test Execution Summary:**
   - Total tests run
   - Pass/fail counts
   - Total execution time

   **Completion Time Analysis:**
   - Distribution histogram
   - Percentile breakdown (p50, p95, p99)
   - Per-entity-type breakdown

   **Rate Limiting Analysis:**
   - Requests per minute over time
   - Delay introduction points
   - Queue behavior

   **Database Metrics:**
   - Connection pool usage
   - Query response times
   - Index utilization evidence

   **Resource Profiles:**
   - Memory usage over time
   - Peak memory usage

   **Recommendations:**
   - Configuration tuning suggestions
   - Scaling recommendations
   - Identified optimizations

**Acceptance Criteria:**
- [ ] Documents test execution summary
- [ ] Includes percentile breakdown of completion times
- [ ] Includes rate limiting behavior observations
- [ ] Includes database performance metrics
- [ ] Includes memory usage profiles
- [ ] Identifies performance bottlenecks
- [ ] Includes configuration recommendations

**Estimated Effort:** 2 hours

---

### Task 8: Update Vitest Configuration and Package.json

**Files:**
- `/vitest.config.ts` - Add performance test patterns
- `/package.json` - Add test:perf script

**Objective:** Configure the test runner to support performance tests with extended timeouts.

**Implementation Steps:**

1. Update `vitest.config.ts`:
   ```typescript
   import { defineConfig } from 'vitest/config';

   export default defineConfig({
     test: {
       // Existing configuration...

       // Add performance test specific configuration
       include: [
         'src/**/*.test.ts',
         'src/**/*.spec.ts',
       ],

       // Exclude performance tests from regular test runs
       exclude: [
         'node_modules',
         'src/**/*.perf.test.ts', // Exclude perf tests by default
       ],

       // Performance test specific settings
       testTimeout: 120000, // 2 minutes default

       // Define test pools/projects
       projects: [
         {
           // Regular tests
           name: 'unit',
           include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
           exclude: ['src/**/*.perf.test.ts', 'src/**/*.integration.test.ts'],
         },
         {
           // Performance tests
           name: 'performance',
           include: ['src/**/*.perf.test.ts'],
           testTimeout: 660000, // 11 minutes for sustained load test
         },
       ],
     },
   });
   ```

2. Update `package.json`:
   ```json
   {
     "scripts": {
       "test": "vitest run",
       "test:watch": "vitest watch",
       "test:perf": "vitest run --project performance --reporter=verbose",
       "test:perf:load": "vitest run src/lib/job-queue/__tests__/performance/load-testing.perf.test.ts --testTimeout=300000",
       "test:perf:rate": "vitest run src/lib/job-queue/__tests__/performance/rate-limiting.perf.test.ts --testTimeout=180000",
       "test:perf:sustained": "vitest run src/lib/job-queue/__tests__/performance/sustained-load.perf.test.ts --testTimeout=660000"
     }
   }
   ```

3. Create performance test configuration file:
   ```typescript
   // src/lib/job-queue/__tests__/performance/config.ts
   export const PERFORMANCE_CONFIG = {
     // Concurrent load test
     CONCURRENT_JOBS: 100,
     JOB_BATCH_SIZE: 10,

     // Timing targets
     TARGET_AVG_COMPLETION_MS: 60000,
     TARGET_P95_COMPLETION_MS: 90000,
     TARGET_QUERY_P95_MS: 500,

     // Rate limiting
     API_RATE_LIMIT_PER_MINUTE: 60,

     // Sustained load
     SUSTAINED_TEST_DURATION_MS: 600000,
     JOBS_PER_SECOND: 2,

     // Failure simulation
     SIMULATED_FAILURE_RATE: 0.10,

     // Mock service
     MOCK_API_DELAY_MIN_MS: 100,
     MOCK_API_DELAY_MAX_MS: 500,

     // Resource limits
     MAX_MEMORY_GROWTH_MB: 100,
     MAX_CONNECTION_POOL_USAGE: 0.8,
   };
   ```

**Acceptance Criteria:**
- [ ] Vitest configuration includes performance test patterns
- [ ] Extended timeout (660000ms) for sustained load test
- [ ] Separate `npm run test:perf` command for performance suite
- [ ] Individual commands for each performance test type
- [ ] Performance tests excluded from default test run
- [ ] Configuration file with all tunable parameters

**Estimated Effort:** 30 minutes

---

## File Creation Summary

### New Files

| # | File Path | Task | Purpose |
|---|-----------|------|---------|
| 1 | `/src/lib/job-queue/__tests__/performance/helpers/mockTranslationService.ts` | Task 1 | Mock translation API |
| 2 | `/src/lib/job-queue/__tests__/performance/helpers/performanceMetrics.ts` | Task 2 | Metrics collection |
| 3 | `/src/lib/job-queue/__tests__/performance/helpers/testDataGenerators.ts` | Task 3 | Test data generation |
| 4 | `/src/lib/job-queue/__tests__/performance/config.ts` | Task 8 | Configuration constants |
| 5 | `/src/lib/job-queue/__tests__/performance/load-testing.perf.test.ts` | Task 4 | Concurrent load tests |
| 6 | `/src/lib/job-queue/__tests__/performance/rate-limiting.perf.test.ts` | Task 5 | Rate limiting tests |
| 7 | `/src/lib/job-queue/__tests__/performance/sustained-load.perf.test.ts` | Task 6 | Sustained load test |
| 8 | `/docs/testing/performance-test-results.md` | Task 7 | Results documentation |

### Files to Modify

| # | File Path | Task | Changes |
|---|-----------|------|---------|
| 1 | `/vitest.config.ts` | Task 8 | Add performance test project configuration |
| 2 | `/package.json` | Task 8 | Add `test:perf` scripts |

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

---

## Execution Order

The tasks should be executed in the following order due to dependencies:

```
Task 1: Mock Translation Service
    ↓
Task 2: Performance Metrics Utilities
    ↓
Task 3: Test Data Generators
    ↓
Task 8: Vitest Config Update (can be done early)
    ↓
Task 4: Concurrent Load Test (depends on 1, 2, 3)
    ↓
Task 5: Rate Limiting Test (depends on 1, 2, 3)
    ↓
Task 6: Sustained Load Test (depends on 1, 2, 3)
    ↓
Task 7: Documentation (depends on 4, 5, 6 results)
```

---

## Verification Commands

```bash
# Run all performance tests
npm run test:perf

# Run specific performance test file
npm test -- src/lib/job-queue/__tests__/performance/load-testing.perf.test.ts

# Run with verbose output
npm test -- --reporter=verbose src/lib/job-queue/__tests__/performance/

# Run sustained load test (requires extended timeout)
npm run test:perf:sustained

# Run only load tests
npm run test:perf:load

# Run only rate limiting tests
npm run test:perf:rate
```

---

## Acceptance Criteria Checklist

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

## Effort Summary

| Task | Description | Estimated Hours |
|------|-------------|-----------------|
| Task 1 | Mock Translation Service | 2 |
| Task 2 | Performance Metrics Utilities | 2 |
| Task 3 | Test Data Generators | 1 |
| Task 4 | Concurrent Load Test | 3 |
| Task 5 | Rate Limiting Test | 2 |
| Task 6 | Sustained Load Test | 3 |
| Task 7 | Results Documentation | 2 |
| Task 8 | Configuration Updates | 0.5 |
| **Total** | | **15.5 hours** |

---

## References

- Overview Document: [REQ-366-performance-testing-overview.md](./REQ-366-performance-testing-overview.md)
- Implementation Plan: [Plan-111-L10N-Epic3-Dynamic-Content-Translation.md](./prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md)
- Request Registry: [gen_requests_epic3.md](./gen_requests_epic3.md) (REQ-366)
- Concurrent Testing Reference: `/src/lib/job-queue/__tests__/concurrent-processing.integration.test.ts`
- Test Utilities: `/src/lib/job-queue/__tests__/helpers/testUtils.ts`
- Rate Limiter: `/src/lib/translation-service/utils/rate-limiter.ts`
- Vitest Documentation: https://vitest.dev/
- Node.js Performance Hooks: https://nodejs.org/api/perf_hooks.html
