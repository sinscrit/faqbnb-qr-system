# Implementation Overview: REQ-E03-034 - Performance Testing with 100+ Concurrent Translation Jobs

**Document ID:** REQ-E03-034-overview
**Request ID:** E03-034
**Created:** 2026-01-20 17:15 UTC
**Last Modified:** 2026-01-20 17:15 UTC
**Status:** Ready for Implementation
**Implementation Plan Reference:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md

---

## 1. Summary

Create comprehensive performance tests to validate that the translation job processing system can handle high-volume workloads. The tests will create 100+ concurrent translation jobs, measure job completion times (target: 95th percentile < 60 seconds), and verify that rate limiting functions correctly to prevent API quota exhaustion while maintaining acceptable throughput.

---

## 2. Background

### 2.1 Current State

- **Job Queue Infrastructure:** `src/lib/job-queue/` provides job creation, state management, and processing
- **Concurrency Control:** `src/lib/job-queue/concurrency-control.ts` implements stale lock recovery, heartbeat, and lock statistics
- **Rate Limiting:** `src/lib/translation-service/utils/rate-limiter.ts` implements sliding window rate limiting with request queuing
- **Existing Tests:** Unit tests for job processing and concurrent processing exist in `src/lib/job-queue/__tests__/`
- **No Performance Tests:** No load testing exists to validate system behavior under high-concurrency conditions

### 2.2 Task Context

- **Phase:** 7 - Testing & Validation
- **Task ID:** 7.5
- **Parent Plan Task:**
  - Test with 100+ concurrent translation jobs
  - Measure job completion time (target < 60s)
  - Verify rate limiting works correctly

### 2.3 Dependencies

| Dependency | Location | Required For |
|------------|----------|--------------|
| Job Queue Module | `/src/lib/job-queue/` | Job creation, processing, and state management |
| Concurrency Control | `/src/lib/job-queue/concurrency-control.ts` | Lock statistics, stale job cleanup |
| Rate Limiter | `/src/lib/translation-service/utils/rate-limiter.ts` | Rate limiting validation |
| Translation Service | `/src/lib/translation-service/` | Translation API calls (mocked) |
| Job Processor | `/src/lib/job-queue/job-processor.ts` | Processing jobs with concurrency |
| Vitest Configuration | `vitest.config.ts` | Test framework and environment |
| Existing Test Helpers | `src/lib/job-queue/__tests__/helpers/` | Mock Supabase, factories, utilities |

---

## 3. Requirements Analysis

### 3.1 Acceptance Criteria (from REQ-E03-034)

| AC# | Criterion | Test Coverage |
|-----|-----------|---------------|
| AC-1 | Performance test creates 100+ translation jobs simultaneously across multiple content types | `high-volume-job-creation.perf.test.ts` |
| AC-2 | Test measures and records job completion time for each individual translation job | Timing metrics capture |
| AC-3 | 95th percentile job completion time is under 60 seconds | Statistical analysis assertion |
| AC-4 | No jobs fail due to timeout or resource exhaustion | Failure cause categorization |
| AC-5 | Rate limiting correctly throttles API requests to stay within provider limits | `rate-limiting-under-load.perf.test.ts` |
| AC-6 | Rate limiting does not cause excessive job failures or retries | Retry/failure ratio metrics |
| AC-7 | Concurrent job processing respects configured maximum concurrent job limit | Concurrency monitoring |
| AC-8 | Database connection pool handles concurrent load without exhaustion | Connection pool monitoring |
| AC-9 | Test monitors system resource utilization (CPU, memory, database connections) during load | Resource metrics capture |
| AC-10 | No memory leaks detected during sustained high-concurrency operation | Memory profiling |
| AC-11 | Job status tracking remains accurate for all jobs under concurrent load | Status verification |
| AC-12 | Test results are documented with graphs showing throughput and completion times | Metrics output to JSON |
| AC-13 | Test verifies system recovers gracefully when load returns to normal levels | Post-load verification |
| AC-14 | Performance test can be run in staging environment without affecting production data | Isolated test data |

---

## 4. Technical Design

### 4.1 Test Structure

```
/src/lib/job-queue/__tests__/
├── performance/
│   ├── helpers/
│   │   ├── index.ts                           # Barrel exports
│   │   ├── performance-metrics.ts             # Metrics collection and analysis
│   │   ├── load-generator.ts                  # Job batch creation utilities
│   │   ├── timing-utils.ts                    # High-resolution timing helpers
│   │   └── resource-monitor.ts                # Memory and connection tracking
│   ├── high-volume-job-creation.perf.test.ts  # 100+ concurrent job creation
│   ├── job-completion-time.perf.test.ts       # Completion time measurements
│   ├── rate-limiting-under-load.perf.test.ts  # Rate limiter validation
│   ├── concurrency-limits.perf.test.ts        # Max concurrent job enforcement
│   ├── sustained-load.perf.test.ts            # Memory leak and stability tests
│   └── recovery-behavior.perf.test.ts         # Post-load recovery validation
└── performance-results/                        # Output directory for metrics JSON
```

### 4.2 Testing Approach

#### Pattern: Load Testing with Mock Translation API

Performance tests will use mocked translation API responses with realistic latency simulation:

1. **Mocked Translation Service:** Returns responses with configurable delay (50-200ms)
2. **Real Job Queue Logic:** Tests actual job creation, locking, and state management
3. **Simulated Database:** Uses in-memory mock Supabase with realistic query latency
4. **Parallel Processing:** Multiple concurrent worker simulations

#### Test Isolation Pattern

```typescript
describe('High Volume Performance Tests', () => {
  let metricsCollector: PerformanceMetricsCollector;
  let loadGenerator: LoadGenerator;

  beforeEach(() => {
    // Reset mock database
    resetMockDatabase();
    // Initialize fresh metrics collector
    metricsCollector = createMetricsCollector();
    // Initialize load generator
    loadGenerator = createLoadGenerator();
    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(async () => {
    // Capture final metrics
    const metrics = metricsCollector.getResults();
    // Write to JSON for analysis
    await writeMetricsToFile(metrics);
    // Cleanup
    vi.restoreAllMocks();
  });
});
```

### 4.3 Key Components

#### 4.3.1 Performance Metrics Collector

```typescript
// performance-metrics.ts

export interface JobTimingMetric {
  jobId: string;
  entityType: EntityType;
  queuedAt: number;      // High-resolution timestamp
  startedAt: number;
  completedAt: number;
  totalDurationMs: number;
  processingDurationMs: number;
  queueWaitMs: number;
  status: 'completed' | 'failed';
  failureReason?: string;
}

export interface PerformanceTestResults {
  testName: string;
  testRunAt: string;
  config: TestConfiguration;
  metrics: {
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    avgCompletionTimeMs: number;
    p50CompletionTimeMs: number;
    p95CompletionTimeMs: number;
    p99CompletionTimeMs: number;
    maxCompletionTimeMs: number;
    minCompletionTimeMs: number;
    throughputJobsPerSecond: number;
  };
  rateLimitMetrics: {
    totalRequests: number;
    throttledRequests: number;
    queuedRequests: number;
    avgQueueWaitMs: number;
  };
  resourceMetrics: {
    peakMemoryUsageMb: number;
    avgMemoryUsageMb: number;
    peakConcurrentJobs: number;
    avgConcurrentJobs: number;
  };
  jobTimings: JobTimingMetric[];
}

export class PerformanceMetricsCollector {
  private jobTimings: Map<string, JobTimingMetric>;
  private memorySnapshots: number[];
  private concurrencySnapshots: number[];
  private rateLimitEvents: RateLimitEvent[];

  constructor();

  recordJobQueued(jobId: string, entityType: EntityType): void;
  recordJobStarted(jobId: string): void;
  recordJobCompleted(jobId: string): void;
  recordJobFailed(jobId: string, reason: string): void;
  recordRateLimitEvent(event: RateLimitEvent): void;
  captureMemorySnapshot(): void;
  captureConcurrencySnapshot(activeJobs: number): void;

  getResults(): PerformanceTestResults;
  calculatePercentile(percentile: number): number;
}
```

#### 4.3.2 Load Generator

```typescript
// load-generator.ts

export interface LoadGeneratorConfig {
  /** Total number of jobs to create */
  totalJobs: number;
  /** Jobs to create per batch */
  batchSize: number;
  /** Delay between batches in ms */
  batchDelayMs: number;
  /** Entity type distribution */
  entityTypeMix: {
    item: number;    // percentage, e.g., 0.5
    article: number; // e.g., 0.3
    link: number;    // e.g., 0.15
    tag: number;     // e.g., 0.05
  };
  /** Source/target language pairs */
  languagePairs: Array<{
    source: SupportedLanguage;
    targets: SupportedLanguage[];
  }>;
}

export class LoadGenerator {
  constructor(config: LoadGeneratorConfig);

  /** Generate and queue all jobs according to config */
  async generateLoad(): Promise<GeneratedJobsSummary>;

  /** Generate a single batch of jobs */
  async generateBatch(batchIndex: number): Promise<string[]>;

  /** Get entity type based on configured distribution */
  private selectEntityType(): EntityType;

  /** Create mock entity data for testing */
  private createMockEntity(type: EntityType): MockEntity;
}

export function createLoadGenerator(config?: Partial<LoadGeneratorConfig>): LoadGenerator;

export const DEFAULT_LOAD_CONFIG: LoadGeneratorConfig = {
  totalJobs: 100,
  batchSize: 20,
  batchDelayMs: 0,
  entityTypeMix: { item: 0.5, article: 0.3, link: 0.15, tag: 0.05 },
  languagePairs: [
    { source: 'en', targets: ['fr', 'es', 'de', 'nl', 'it'] },
    { source: 'fr', targets: ['en', 'es', 'de', 'nl', 'it'] },
  ],
};
```

#### 4.3.3 Timing Utilities

```typescript
// timing-utils.ts

export interface Timer {
  start(): void;
  lap(label: string): number;
  stop(): number;
  getElapsedMs(): number;
  getLaps(): Record<string, number>;
}

export function createTimer(): Timer;

export function measureAsync<T>(
  fn: () => Promise<T>,
  label: string
): Promise<{ result: T; durationMs: number }>;

export function createThrottledProcessor(
  processFn: () => Promise<void>,
  options: {
    maxConcurrent: number;
    delayBetweenMs?: number;
  }
): {
  process: () => Promise<void>;
  getStats: () => ProcessorStats;
};
```

#### 4.3.4 Resource Monitor

```typescript
// resource-monitor.ts

export interface ResourceSnapshot {
  timestamp: number;
  heapUsedMb: number;
  heapTotalMb: number;
  externalMb: number;
  activeJobCount: number;
  pendingJobCount: number;
  rateLimitQueueSize: number;
}

export class ResourceMonitor {
  private snapshots: ResourceSnapshot[];
  private intervalId: NodeJS.Timeout | null;

  constructor();

  /** Start monitoring at specified interval */
  startMonitoring(intervalMs: number): void;

  /** Stop monitoring */
  stopMonitoring(): void;

  /** Capture a single snapshot */
  captureSnapshot(activeJobs: number, pendingJobs: number, queueSize: number): ResourceSnapshot;

  /** Get all snapshots */
  getSnapshots(): ResourceSnapshot[];

  /** Analyze for memory leaks (increasing trend) */
  detectMemoryLeak(): { detected: boolean; trend: number };

  /** Get peak values */
  getPeakMetrics(): { peakMemory: number; peakConcurrency: number };
}
```

### 4.4 Test Scenarios

#### Scenario 1: High Volume Job Creation (100+ jobs)

```typescript
describe('High Volume Job Creation', () => {
  it('creates and queues 100+ translation jobs without failures', async () => {
    const config: LoadGeneratorConfig = {
      totalJobs: 120, // Exceed 100 requirement
      batchSize: 20,
      batchDelayMs: 0,
      entityTypeMix: { item: 0.5, article: 0.3, link: 0.15, tag: 0.05 },
      languagePairs: [{ source: 'en', targets: ['fr', 'es', 'de', 'nl', 'it'] }],
    };

    const generator = createLoadGenerator(config);
    const timer = createTimer();

    timer.start();
    const result = await generator.generateLoad();
    const creationTimeMs = timer.stop();

    // Verify all jobs created
    expect(result.totalCreated).toBe(120);
    expect(result.errors).toHaveLength(0);

    // Verify jobs in database
    const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
    expect(jobs).toHaveLength(120);
    expect(jobs.every(j => j.status === 'queued')).toBe(true);

    // Log metrics
    metricsCollector.recordBatchCreation({
      jobCount: 120,
      durationMs: creationTimeMs,
      jobsPerSecond: 120 / (creationTimeMs / 1000),
    });
  });

  it('handles mixed entity types in concurrent load', async () => {
    const generator = createLoadGenerator({
      totalJobs: 100,
      entityTypeMix: { item: 0.25, article: 0.25, link: 0.25, tag: 0.25 },
    });

    const result = await generator.generateLoad();

    // Verify distribution
    const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
    const byType = {
      item: jobs.filter(j => j.entityType === 'item').length,
      article: jobs.filter(j => j.entityType === 'article').length,
      link: jobs.filter(j => j.entityType === 'link').length,
      tag: jobs.filter(j => j.entityType === 'tag').length,
    };

    // Each type should be approximately 25% (with some variance)
    Object.values(byType).forEach(count => {
      expect(count).toBeGreaterThan(15);
      expect(count).toBeLessThan(35);
    });
  });
});
```

#### Scenario 2: Job Completion Time Measurement

```typescript
describe('Job Completion Time', () => {
  it('achieves p95 completion time under 60 seconds', async () => {
    // Setup: Create 100+ queued jobs
    const jobs = createMockJobBatch(100, { status: 'queued' });
    seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);

    // Mock translation with realistic latency (50-200ms)
    vi.mocked(translateText).mockImplementation(async () => {
      await delay(50 + Math.random() * 150);
      return { translatedText: 'Translated', provider: 'claude', tokensUsed: 100 };
    });

    const resourceMonitor = new ResourceMonitor();
    resourceMonitor.startMonitoring(100);

    // Process all jobs with concurrent workers
    const processor = createThrottledProcessor(
      async () => {
        const { processNextJob } = await import('../job-processor');
        await processNextJob();
      },
      { maxConcurrent: 10, delayBetweenMs: 10 }
    );

    // Record timing for each job
    for (const job of jobs) {
      metricsCollector.recordJobQueued(job.id, job.entityType);
    }

    // Process until all complete
    const startTime = performance.now();
    while (getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS)
           .some(j => j.status === 'queued' || j.status === 'processing')) {
      await processor.process();

      // Update timing for jobs that changed state
      const currentJobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      currentJobs.forEach(j => {
        if (j.status === 'processing' && !metricsCollector.hasStarted(j.id)) {
          metricsCollector.recordJobStarted(j.id);
        }
        if (j.status === 'completed' && !metricsCollector.hasCompleted(j.id)) {
          metricsCollector.recordJobCompleted(j.id);
        }
      });
    }
    const totalTimeMs = performance.now() - startTime;

    resourceMonitor.stopMonitoring();

    // Analyze results
    const results = metricsCollector.getResults();

    // P95 must be under 60 seconds
    expect(results.metrics.p95CompletionTimeMs).toBeLessThan(60000);

    // All jobs should complete
    expect(results.metrics.completedJobs).toBe(100);
    expect(results.metrics.failedJobs).toBe(0);

    // Log comprehensive metrics
    console.log('Performance Test Results:', {
      totalTime: `${totalTimeMs.toFixed(2)}ms`,
      p50: `${results.metrics.p50CompletionTimeMs.toFixed(2)}ms`,
      p95: `${results.metrics.p95CompletionTimeMs.toFixed(2)}ms`,
      p99: `${results.metrics.p99CompletionTimeMs.toFixed(2)}ms`,
      throughput: `${results.metrics.throughputJobsPerSecond.toFixed(2)} jobs/sec`,
    });
  });
});
```

#### Scenario 3: Rate Limiting Under Load

```typescript
describe('Rate Limiting Under Load', () => {
  it('throttles requests correctly without excessive failures', async () => {
    // Configure strict rate limit for testing
    const rateLimiter = createRateLimiter({
      maxRequests: 10,
      windowMs: 1000,
      strategy: 'queue',
      maxQueueSize: 200,
      queueTimeoutMs: 30000,
    });

    // Track rate limit events
    let throttledCount = 0;
    let queuedCount = 0;

    // Create 50 rapid requests (exceeds 10/sec limit)
    const requestPromises = Array.from({ length: 50 }, async (_, i) => {
      const canAcquire = rateLimiter.canAcquire();
      if (!canAcquire) {
        throttledCount++;
        queuedCount++;
      }

      await rateLimiter.acquire();
      metricsCollector.recordRateLimitEvent({
        timestamp: Date.now(),
        action: canAcquire ? 'immediate' : 'queued',
        queueSize: rateLimiter.getQueueLength(),
      });

      // Simulate API call
      await delay(50);
    });

    await Promise.all(requestPromises);

    const status = rateLimiter.getStatus();

    // Verify rate limiting occurred
    expect(throttledCount).toBeGreaterThan(0);
    console.log(`Rate limiting: ${throttledCount} of 50 requests were queued`);

    // Verify no failures due to rate limiting
    expect(status.remaining).toBeGreaterThanOrEqual(0);

    // All requests should complete (queued, not rejected)
    expect(status.isLimited).toBe(false); // After processing, should have capacity
  });

  it('respects provider-specific rate limits', async () => {
    const manager = createProviderRateLimitManager();

    // Get Claude limiter
    const claudeLimiter = manager.getProviderLimiter('claude');

    // Simulate burst of 100 translation requests
    const results = await Promise.allSettled(
      Array.from({ length: 100 }, async () => {
        await claudeLimiter.acquire();
        await delay(10);
      })
    );

    const fulfilled = results.filter(r => r.status === 'fulfilled').length;
    const rejected = results.filter(r => r.status === 'rejected').length;

    // All should complete (queued, not rejected) with queue strategy
    expect(fulfilled).toBe(100);
    expect(rejected).toBe(0);

    const status = manager.getAllProviderStatus();
    console.log('Provider rate limit status:', status);
  });
});
```

#### Scenario 4: Concurrency Limit Enforcement

```typescript
describe('Concurrency Limits', () => {
  it('respects maximum concurrent job limit', async () => {
    const MAX_CONCURRENT = 10;
    const TOTAL_JOBS = 50;

    const jobs = createMockJobBatch(TOTAL_JOBS, { status: 'queued' });
    seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);

    let peakConcurrent = 0;
    let currentConcurrent = 0;

    // Mock translation with delay to allow concurrency measurement
    vi.mocked(translateText).mockImplementation(async () => {
      currentConcurrent++;
      if (currentConcurrent > peakConcurrent) {
        peakConcurrent = currentConcurrent;
        metricsCollector.captureConcurrencySnapshot(currentConcurrent);
      }

      await delay(100); // Hold for measurement

      currentConcurrent--;
      return { translatedText: 'Translated', provider: 'claude', tokensUsed: 100 };
    });

    // Process with concurrency control
    const processor = createThrottledProcessor(
      async () => {
        const { processNextJob } = await import('../job-processor');
        await processNextJob();
      },
      { maxConcurrent: MAX_CONCURRENT }
    );

    // Run all jobs
    const processingPromises = Array.from({ length: TOTAL_JOBS }, () => processor.process());
    await Promise.all(processingPromises);

    // Verify concurrency never exceeded limit
    expect(peakConcurrent).toBeLessThanOrEqual(MAX_CONCURRENT);
    console.log(`Peak concurrent jobs: ${peakConcurrent} (limit: ${MAX_CONCURRENT})`);
  });
});
```

#### Scenario 5: Sustained Load (Memory Leak Detection)

```typescript
describe('Sustained Load', () => {
  it('does not leak memory during sustained operation', async () => {
    const BATCHES = 5;
    const JOBS_PER_BATCH = 50;

    const resourceMonitor = new ResourceMonitor();
    resourceMonitor.startMonitoring(500);

    // Record initial memory
    const initialMemory = process.memoryUsage().heapUsed / 1024 / 1024;

    // Run multiple batches
    for (let batch = 0; batch < BATCHES; batch++) {
      // Create batch of jobs
      const jobs = createMockJobBatch(JOBS_PER_BATCH, { status: 'queued' });
      jobs.forEach(j => addMockRecord(TABLE_NAMES.TRANSLATION_JOBS, j));

      // Process batch
      const processor = createThrottledProcessor(
        async () => {
          const { processNextJob } = await import('../job-processor');
          await processNextJob();
        },
        { maxConcurrent: 10 }
      );

      for (let i = 0; i < JOBS_PER_BATCH; i++) {
        await processor.process();
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      // Brief pause between batches
      await delay(100);
    }

    resourceMonitor.stopMonitoring();

    // Record final memory
    const finalMemory = process.memoryUsage().heapUsed / 1024 / 1024;
    const memoryGrowth = finalMemory - initialMemory;

    // Analyze for leak pattern
    const { detected, trend } = resourceMonitor.detectMemoryLeak();

    // Memory growth should be bounded (not continuously increasing)
    expect(detected).toBe(false);
    console.log(`Memory analysis: initial=${initialMemory.toFixed(2)}MB, final=${finalMemory.toFixed(2)}MB, growth=${memoryGrowth.toFixed(2)}MB`);

    // Allow some growth but not proportional to jobs processed
    expect(memoryGrowth).toBeLessThan(50); // Less than 50MB growth for 250 jobs
  });
});
```

#### Scenario 6: Recovery After High Load

```typescript
describe('Recovery Behavior', () => {
  it('recovers gracefully when load returns to normal', async () => {
    // Phase 1: Create high load
    const highLoadJobs = createMockJobBatch(100, { status: 'queued' });
    seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, highLoadJobs);

    const processor = createThrottledProcessor(
      async () => {
        const { processNextJob } = await import('../job-processor');
        await processNextJob();
      },
      { maxConcurrent: 10 }
    );

    // Process all high-load jobs
    for (let i = 0; i < 100; i++) {
      await processor.process();
    }

    // Verify high load completed
    let jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
    expect(jobs.filter(j => j.status === 'completed')).toHaveLength(100);

    // Phase 2: Return to normal load
    await delay(500); // Brief settling period

    // Create small batch of jobs
    const normalLoadJobs = createMockJobBatch(5, { status: 'queued' });
    normalLoadJobs.forEach(j => addMockRecord(TABLE_NAMES.TRANSLATION_JOBS, j));

    // Process normal load
    for (let i = 0; i < 5; i++) {
      await processor.process();
    }

    // Verify normal operations continue correctly
    jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
    expect(jobs.filter(j => j.status === 'completed')).toHaveLength(105);

    // Check rate limiter recovered
    const rateLimitStatus = getGlobalRateLimitManager().getProviderLimiter('claude').getStatus();
    expect(rateLimitStatus.isLimited).toBe(false);

    // Check lock statistics
    const lockStats = await getLockStatistics();
    expect(lockStats.activeLocksCount).toBe(0);
    expect(lockStats.staleLocksCount).toBe(0);
  });
});
```

---

## 5. Implementation Tasks

### Task 1: Create Performance Test Helper Infrastructure

**File:** `src/lib/job-queue/__tests__/performance/helpers/index.ts`

- Export all performance test helper functions
- Coordinate with existing job-queue test helpers

**Estimated Effort:** 0.25 story points

### Task 2: Implement Performance Metrics Collector

**File:** `src/lib/job-queue/__tests__/performance/helpers/performance-metrics.ts`

- `PerformanceMetricsCollector` class implementation
- Job timing recording methods
- Percentile calculation (p50, p95, p99)
- Results aggregation and JSON output

**Estimated Effort:** 1.5 story points

### Task 3: Implement Load Generator

**File:** `src/lib/job-queue/__tests__/performance/helpers/load-generator.ts`

- `LoadGenerator` class with configurable job creation
- Batch creation with configurable delay
- Entity type distribution support
- Multiple language pair configurations

**Estimated Effort:** 1 story point

### Task 4: Implement Timing Utilities

**File:** `src/lib/job-queue/__tests__/performance/helpers/timing-utils.ts`

- High-resolution timer implementation
- `measureAsync` helper for async operations
- `createThrottledProcessor` for controlled concurrency

**Estimated Effort:** 0.5 story points

### Task 5: Implement Resource Monitor

**File:** `src/lib/job-queue/__tests__/performance/helpers/resource-monitor.ts`

- Memory usage tracking
- Concurrent job monitoring
- Memory leak detection algorithm
- Snapshot capture and analysis

**Estimated Effort:** 1 story point

### Task 6: Write High Volume Job Creation Tests

**File:** `src/lib/job-queue/__tests__/performance/high-volume-job-creation.perf.test.ts`

- Test: Create 100+ jobs simultaneously
- Test: Handle mixed entity types
- Test: Verify no creation failures
- Test: Measure creation throughput

**Estimated Effort:** 1 story point

### Task 7: Write Job Completion Time Tests

**File:** `src/lib/job-queue/__tests__/performance/job-completion-time.perf.test.ts`

- Test: Measure individual job completion times
- Test: Calculate p50, p95, p99 percentiles
- Test: Verify p95 < 60 seconds target
- Test: Record timing metrics to JSON

**Estimated Effort:** 1.5 story points

### Task 8: Write Rate Limiting Tests

**File:** `src/lib/job-queue/__tests__/performance/rate-limiting-under-load.perf.test.ts`

- Test: Rate limiter throttles correctly under load
- Test: Queue strategy prevents failures
- Test: Provider-specific limits respected
- Test: Recovery after rate limit exhaustion

**Estimated Effort:** 1 story point

### Task 9: Write Concurrency Limit Tests

**File:** `src/lib/job-queue/__tests__/performance/concurrency-limits.perf.test.ts`

- Test: Max concurrent jobs never exceeded
- Test: Jobs queue properly when at limit
- Test: Concurrency control with multiple workers
- Test: Lock acquisition under high contention

**Estimated Effort:** 1 story point

### Task 10: Write Sustained Load Tests

**File:** `src/lib/job-queue/__tests__/performance/sustained-load.perf.test.ts`

- Test: No memory leaks over multiple batches
- Test: Database connection stability
- Test: System resources remain bounded
- Test: Status tracking accuracy under load

**Estimated Effort:** 1.5 story points

### Task 11: Write Recovery Behavior Tests

**File:** `src/lib/job-queue/__tests__/performance/recovery-behavior.perf.test.ts`

- Test: Normal operations resume after high load
- Test: Rate limiters reset correctly
- Test: Lock cleanup after load subsides
- Test: No residual state corruption

**Estimated Effort:** 1 story point

### Task 12: Update Vitest Configuration

**File:** `vitest.config.ts`

- Add performance test patterns
- Configure longer timeouts for performance tests
- Add performance test output directory

**Estimated Effort:** 0.25 story points

### Task 13: Create Performance Test Documentation

**File:** `src/lib/job-queue/__tests__/performance/README.md`

- Document test structure
- Document how to run performance tests
- Document metrics output format
- Document interpreting results

**Estimated Effort:** 0.25 story points

### Task 14: Create Metrics Output Directory Structure

**Directory:** `src/lib/job-queue/__tests__/performance-results/`

- Create `.gitkeep` for directory
- Add `.gitignore` for JSON output files
- Create example metrics JSON schema

**Estimated Effort:** 0.25 story points

---

## 6. Authorized Files and Functions for Modification

### 6.1 New Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/lib/job-queue/__tests__/performance/helpers/index.ts` | Performance helper barrel exports |
| `src/lib/job-queue/__tests__/performance/helpers/performance-metrics.ts` | Metrics collection and analysis |
| `src/lib/job-queue/__tests__/performance/helpers/load-generator.ts` | Job batch creation utilities |
| `src/lib/job-queue/__tests__/performance/helpers/timing-utils.ts` | High-resolution timing helpers |
| `src/lib/job-queue/__tests__/performance/helpers/resource-monitor.ts` | Memory and connection tracking |
| `src/lib/job-queue/__tests__/performance/high-volume-job-creation.perf.test.ts` | 100+ concurrent job tests |
| `src/lib/job-queue/__tests__/performance/job-completion-time.perf.test.ts` | Completion time measurements |
| `src/lib/job-queue/__tests__/performance/rate-limiting-under-load.perf.test.ts` | Rate limiter validation |
| `src/lib/job-queue/__tests__/performance/concurrency-limits.perf.test.ts` | Max concurrent enforcement |
| `src/lib/job-queue/__tests__/performance/sustained-load.perf.test.ts` | Memory leak tests |
| `src/lib/job-queue/__tests__/performance/recovery-behavior.perf.test.ts` | Post-load recovery tests |
| `src/lib/job-queue/__tests__/performance/README.md` | Performance test documentation |
| `src/lib/job-queue/__tests__/performance-results/.gitkeep` | Results directory placeholder |

### 6.2 Files to Modify

| File Path | Changes | Functions/Sections |
|-----------|---------|-------------------|
| `vitest.config.ts` | Add performance test configuration | `test.include`, `test.timeout` |

### 6.3 Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `src/lib/job-queue/concurrency-control.ts` | Concurrency control patterns |
| `src/lib/job-queue/job-processor.ts` | Job processing implementation |
| `src/lib/job-queue/translation-jobs.ts` | Job creation and management |
| `src/lib/translation-service/utils/rate-limiter.ts` | Rate limiting implementation |
| `src/lib/job-queue/__tests__/helpers/mockSupabase.ts` | Mock database patterns |
| `src/lib/job-queue/__tests__/helpers/mockFactories.ts` | Factory function patterns |
| `src/lib/job-queue/__tests__/concurrent-processing.integration.test.ts` | Concurrency test patterns |

---

## 7. Integration Points

### 7.1 Dependencies on Other Epic 3 Components

| Component | Task | Status |
|-----------|------|--------|
| Job Processor Enhancement | Tasks 3.1-3.8 | Must be implemented |
| Concurrency Control | Task 3.7 | Must be implemented |
| Job Prioritization | Task 3.6 | Should be implemented |
| Stale Job Cleanup | Task 3.8 | Must be implemented |

### 7.2 Dependencies on Epic 1 Components

| Component | Location | Required For |
|-----------|----------|--------------|
| Translation Service | `src/lib/translation-service/` | Mocking translation API |
| Rate Limiter | `src/lib/translation-service/utils/rate-limiter.ts` | Rate limit testing |
| Job Queue | `src/lib/job-queue/` | Job creation and processing |

---

## 8. Testing Strategy

### 8.1 Test Categories

| Category | Description | Files |
|----------|-------------|-------|
| Load Tests | High volume job creation | `high-volume-job-creation.perf.test.ts` |
| Timing Tests | Job completion measurements | `job-completion-time.perf.test.ts` |
| Throttling Tests | Rate limiting validation | `rate-limiting-under-load.perf.test.ts` |
| Concurrency Tests | Limit enforcement | `concurrency-limits.perf.test.ts` |
| Stability Tests | Memory and recovery | `sustained-load.perf.test.ts`, `recovery-behavior.perf.test.ts` |

### 8.2 Test Isolation Strategy

```typescript
beforeEach(() => {
  // Reset mock database to clean state
  resetMockDatabase();

  // Reset rate limiters
  resetGlobalRateLimitManager();

  // Reset concurrency manager
  await resetConcurrencyManager();

  // Clear all vitest mocks
  vi.clearAllMocks();
});

afterEach(async () => {
  // Capture final metrics
  const metrics = metricsCollector.getResults();
  await writeMetricsToFile(metrics);

  // Restore original implementations
  vi.restoreAllMocks();
});
```

### 8.3 Performance Requirements

| Metric | Target | Validation |
|--------|--------|------------|
| P95 completion time | < 60 seconds | `job-completion-time.perf.test.ts` |
| Max concurrent jobs | Configurable (default 10) | `concurrency-limits.perf.test.ts` |
| Rate limit queue | No rejections with queue strategy | `rate-limiting-under-load.perf.test.ts` |
| Memory growth | < 50MB for 250 jobs | `sustained-load.perf.test.ts` |
| Test suite execution | < 10 minutes | CI pipeline timing |

---

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Flaky timing tests | Medium | High | Use generous tolerances, percentile-based assertions |
| Mock latency unrealistic | Medium | Medium | Calibrate mock delays against real API measurements |
| Memory tests inconsistent | Medium | Medium | Use multiple runs, trend analysis vs absolute values |
| CI environment variance | Low | Medium | Use relative metrics, not absolute thresholds |
| Test pollution between runs | Low | High | Strict beforeEach/afterEach cleanup |

---

## 10. Effort Summary

| Task Group | Story Points |
|------------|--------------|
| Helper Infrastructure (Tasks 1-5) | 4.25 |
| Performance Tests (Tasks 6-11) | 7.0 |
| Configuration & Documentation (Tasks 12-14) | 0.75 |
| **Total** | **12 story points** |

---

## 11. Definition of Done

- [ ] All 14 tasks implemented and code reviewed
- [ ] All acceptance criteria from REQ-E03-034 covered by tests
- [ ] Test suite passes locally with `npm test`
- [ ] P95 completion time verified under 60 seconds
- [ ] Rate limiting validation passes
- [ ] No memory leaks detected
- [ ] Metrics output to JSON for analysis
- [ ] Performance test documentation complete
- [ ] Test suite execution under 10 minutes

---

## 12. References

- **Request:** `docs/gen_requests_epic3.md` (REQ-E03-034)
- **Implementation Plan:** `docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Phase 7, Task 7.5)
- **Concurrency Control:** `src/lib/job-queue/concurrency-control.ts`
- **Rate Limiter:** `src/lib/translation-service/utils/rate-limiter.ts`
- **Existing Integration Tests:** `src/lib/job-queue/__tests__/concurrent-processing.integration.test.ts`
- **Vitest Documentation:** https://vitest.dev/guide/
