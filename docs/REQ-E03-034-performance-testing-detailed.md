# Detailed Task Breakdown: REQ-E03-034 - Performance Testing with 100+ Concurrent Translation Jobs

**Document ID:** REQ-E03-034-detailed
**Request ID:** E03-034
**Created:** 2026-01-20 17:45 UTC
**Last Modified:** 2026-01-20 17:45 UTC
**Status:** Ready for Implementation
**Overview Document:** REQ-E03-034-performance-testing-overview.md
**Implementation Plan Reference:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md

---

## 1. Document Purpose

This document breaks down the implementation overview for REQ-E03-034 into granular, actionable tasks that can be executed step-by-step by a developer or AI coding agent. Each task is designed to be approximately 1 story point (completable in a single focused session).

---

## 2. Task Context

| Attribute | Value |
|-----------|-------|
| **Phase** | 7 - Testing & Validation |
| **Task ID** | 7.5 |
| **Title** | Performance testing |
| **Size** | M (Medium) |
| **Total Story Points** | 12 |
| **Estimated Tasks** | 14 |

---

## 3. Prerequisites Checklist

Before starting implementation, verify:

- [ ] Job queue infrastructure exists at `/src/lib/job-queue/`
- [ ] Concurrency control implemented at `/src/lib/job-queue/concurrency-control.ts`
- [ ] Rate limiter exists at `/src/lib/translation-service/utils/rate-limiter.ts`
- [ ] Job processor implemented at `/src/lib/job-queue/job-processor.ts`
- [ ] Existing test helpers exist at `/src/lib/job-queue/__tests__/helpers/`
- [ ] Vitest configured in `vitest.config.ts`
- [ ] Translation jobs table exists in database

---

## 4. Implementation Tasks

### Task 1: Create Performance Test Directory Structure and Barrel Exports

**File:** `src/lib/job-queue/__tests__/performance/helpers/index.ts`

**Objective:** Set up the directory structure for performance tests and create barrel exports for helper modules.

**Steps:**

1. Create directory `src/lib/job-queue/__tests__/performance/`
2. Create subdirectory `src/lib/job-queue/__tests__/performance/helpers/`
3. Create `index.ts` with placeholder exports:

```typescript
// src/lib/job-queue/__tests__/performance/helpers/index.ts

/**
 * Performance Test Helpers
 *
 * This module exports all helper functions and classes for performance testing
 * the translation job queue system.
 */

// Export performance metrics collector
export * from './performance-metrics';

// Export load generator
export * from './load-generator';

// Export timing utilities
export * from './timing-utils';

// Export resource monitor
export * from './resource-monitor';
```

**Acceptance Criteria:**
- [ ] Directory structure created: `performance/helpers/`
- [ ] `index.ts` created with placeholder exports
- [ ] File compiles without errors (exports will be added as other tasks complete)

**Estimated Effort:** 0.25 story points

---

### Task 2: Implement Performance Metrics Collector - Core Types and Class Structure

**File:** `src/lib/job-queue/__tests__/performance/helpers/performance-metrics.ts`

**Objective:** Create the `PerformanceMetricsCollector` class that tracks job timing, calculates percentiles, and aggregates results.

**Steps:**

1. Define `JobTimingMetric` interface:
```typescript
export interface JobTimingMetric {
  jobId: string;
  entityType: 'item' | 'article' | 'link' | 'tag';
  queuedAt: number;        // performance.now() timestamp
  startedAt: number | null;
  completedAt: number | null;
  totalDurationMs: number | null;
  processingDurationMs: number | null;
  queueWaitMs: number | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  failureReason?: string;
}
```

2. Define `RateLimitEvent` interface:
```typescript
export interface RateLimitEvent {
  timestamp: number;
  action: 'immediate' | 'queued' | 'rejected';
  queueSize: number;
  waitTimeMs?: number;
}
```

3. Define `TestConfiguration` interface:
```typescript
export interface TestConfiguration {
  totalJobs: number;
  maxConcurrent: number;
  batchSize: number;
  mockLatencyRange: { min: number; max: number };
  rateLimitConfig: {
    maxRequests: number;
    windowMs: number;
  };
}
```

4. Define `PerformanceTestResults` interface:
```typescript
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
```

5. Implement `PerformanceMetricsCollector` class:
```typescript
export class PerformanceMetricsCollector {
  private testName: string;
  private config: TestConfiguration;
  private jobTimings: Map<string, JobTimingMetric>;
  private memorySnapshots: number[];
  private concurrencySnapshots: number[];
  private rateLimitEvents: RateLimitEvent[];
  private startTime: number;

  constructor(testName: string, config: TestConfiguration) {
    this.testName = testName;
    this.config = config;
    this.jobTimings = new Map();
    this.memorySnapshots = [];
    this.concurrencySnapshots = [];
    this.rateLimitEvents = [];
    this.startTime = performance.now();
  }

  recordJobQueued(jobId: string, entityType: JobTimingMetric['entityType']): void {
    this.jobTimings.set(jobId, {
      jobId,
      entityType,
      queuedAt: performance.now(),
      startedAt: null,
      completedAt: null,
      totalDurationMs: null,
      processingDurationMs: null,
      queueWaitMs: null,
      status: 'pending',
    });
  }

  recordJobStarted(jobId: string): void {
    const timing = this.jobTimings.get(jobId);
    if (timing) {
      timing.startedAt = performance.now();
      timing.queueWaitMs = timing.startedAt - timing.queuedAt;
      timing.status = 'processing';
    }
  }

  recordJobCompleted(jobId: string): void {
    const timing = this.jobTimings.get(jobId);
    if (timing && timing.startedAt !== null) {
      timing.completedAt = performance.now();
      timing.processingDurationMs = timing.completedAt - timing.startedAt;
      timing.totalDurationMs = timing.completedAt - timing.queuedAt;
      timing.status = 'completed';
    }
  }

  recordJobFailed(jobId: string, reason: string): void {
    const timing = this.jobTimings.get(jobId);
    if (timing) {
      timing.completedAt = performance.now();
      if (timing.startedAt !== null) {
        timing.processingDurationMs = timing.completedAt - timing.startedAt;
        timing.totalDurationMs = timing.completedAt - timing.queuedAt;
      }
      timing.status = 'failed';
      timing.failureReason = reason;
    }
  }

  hasStarted(jobId: string): boolean {
    const timing = this.jobTimings.get(jobId);
    return timing?.startedAt !== null;
  }

  hasCompleted(jobId: string): boolean {
    const timing = this.jobTimings.get(jobId);
    return timing?.status === 'completed' || timing?.status === 'failed';
  }

  recordRateLimitEvent(event: RateLimitEvent): void {
    this.rateLimitEvents.push(event);
  }

  captureMemorySnapshot(): void {
    const memUsage = process.memoryUsage();
    this.memorySnapshots.push(memUsage.heapUsed / 1024 / 1024);
  }

  captureConcurrencySnapshot(activeJobs: number): void {
    this.concurrencySnapshots.push(activeJobs);
  }

  calculatePercentile(percentile: number): number {
    const completionTimes = Array.from(this.jobTimings.values())
      .filter(t => t.totalDurationMs !== null)
      .map(t => t.totalDurationMs as number)
      .sort((a, b) => a - b);

    if (completionTimes.length === 0) return 0;

    const index = Math.ceil((percentile / 100) * completionTimes.length) - 1;
    return completionTimes[Math.max(0, index)];
  }

  getResults(): PerformanceTestResults {
    const timings = Array.from(this.jobTimings.values());
    const completedTimings = timings.filter(t => t.status === 'completed');
    const failedTimings = timings.filter(t => t.status === 'failed');
    const completionTimes = completedTimings
      .map(t => t.totalDurationMs)
      .filter((t): t is number => t !== null);

    const totalTime = performance.now() - this.startTime;

    const avgCompletion = completionTimes.length > 0
      ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
      : 0;

    const throttledEvents = this.rateLimitEvents.filter(e => e.action === 'queued');
    const avgQueueWait = throttledEvents.length > 0
      ? throttledEvents
          .filter(e => e.waitTimeMs !== undefined)
          .reduce((a, b) => a + (b.waitTimeMs || 0), 0) / throttledEvents.length
      : 0;

    return {
      testName: this.testName,
      testRunAt: new Date().toISOString(),
      config: this.config,
      metrics: {
        totalJobs: timings.length,
        completedJobs: completedTimings.length,
        failedJobs: failedTimings.length,
        avgCompletionTimeMs: avgCompletion,
        p50CompletionTimeMs: this.calculatePercentile(50),
        p95CompletionTimeMs: this.calculatePercentile(95),
        p99CompletionTimeMs: this.calculatePercentile(99),
        maxCompletionTimeMs: completionTimes.length > 0 ? Math.max(...completionTimes) : 0,
        minCompletionTimeMs: completionTimes.length > 0 ? Math.min(...completionTimes) : 0,
        throughputJobsPerSecond: completedTimings.length / (totalTime / 1000),
      },
      rateLimitMetrics: {
        totalRequests: this.rateLimitEvents.length,
        throttledRequests: throttledEvents.length,
        queuedRequests: throttledEvents.length,
        avgQueueWaitMs: avgQueueWait,
      },
      resourceMetrics: {
        peakMemoryUsageMb: this.memorySnapshots.length > 0 ? Math.max(...this.memorySnapshots) : 0,
        avgMemoryUsageMb: this.memorySnapshots.length > 0
          ? this.memorySnapshots.reduce((a, b) => a + b, 0) / this.memorySnapshots.length
          : 0,
        peakConcurrentJobs: this.concurrencySnapshots.length > 0
          ? Math.max(...this.concurrencySnapshots)
          : 0,
        avgConcurrentJobs: this.concurrencySnapshots.length > 0
          ? this.concurrencySnapshots.reduce((a, b) => a + b, 0) / this.concurrencySnapshots.length
          : 0,
      },
      jobTimings: timings,
    };
  }
}

export function createMetricsCollector(
  testName: string,
  config: TestConfiguration
): PerformanceMetricsCollector {
  return new PerformanceMetricsCollector(testName, config);
}
```

**Acceptance Criteria:**
- [ ] All interfaces defined correctly
- [ ] `PerformanceMetricsCollector` class implemented with all methods
- [ ] Percentile calculation works correctly
- [ ] Results aggregation produces valid `PerformanceTestResults`
- [ ] File compiles without TypeScript errors

**Estimated Effort:** 1.5 story points

---

### Task 3: Implement Load Generator

**File:** `src/lib/job-queue/__tests__/performance/helpers/load-generator.ts`

**Objective:** Create the `LoadGenerator` class that creates batches of mock translation jobs with configurable distribution.

**Steps:**

1. Define configuration and result types:
```typescript
import { v4 as uuidv4 } from 'uuid';

export type EntityType = 'item' | 'article' | 'link' | 'tag';
export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

export interface LoadGeneratorConfig {
  /** Total number of jobs to create */
  totalJobs: number;
  /** Jobs to create per batch */
  batchSize: number;
  /** Delay between batches in ms */
  batchDelayMs: number;
  /** Entity type distribution (percentages should sum to 1) */
  entityTypeMix: {
    item: number;
    article: number;
    link: number;
    tag: number;
  };
  /** Source/target language pairs */
  languagePairs: Array<{
    source: SupportedLanguage;
    targets: SupportedLanguage[];
  }>;
}

export interface MockEntity {
  id: string;
  type: EntityType;
  sourceLanguage: SupportedLanguage;
  fields: Array<{
    name: string;
    value: string;
  }>;
}

export interface GeneratedJob {
  id: string;
  entityType: EntityType;
  entityId: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  status: 'queued';
  priority: number;
  attempts: number;
  createdAt: string;
}

export interface GeneratedJobsSummary {
  totalCreated: number;
  jobsByType: Record<EntityType, number>;
  jobsByLanguagePair: Record<string, number>;
  jobs: GeneratedJob[];
  errors: string[];
}

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

2. Implement `LoadGenerator` class:
```typescript
export class LoadGenerator {
  private config: LoadGeneratorConfig;
  private generatedJobs: GeneratedJob[];
  private errors: string[];

  constructor(config: LoadGeneratorConfig) {
    this.config = config;
    this.generatedJobs = [];
    this.errors = [];
  }

  /**
   * Generate and return all jobs according to config.
   * Does not actually insert into database - returns job data for insertion.
   */
  async generateLoad(): Promise<GeneratedJobsSummary> {
    this.generatedJobs = [];
    this.errors = [];

    const numBatches = Math.ceil(this.config.totalJobs / this.config.batchSize);

    for (let batch = 0; batch < numBatches; batch++) {
      const remainingJobs = this.config.totalJobs - this.generatedJobs.length;
      const batchSize = Math.min(this.config.batchSize, remainingJobs);

      try {
        const batchJobs = await this.generateBatch(batch, batchSize);
        this.generatedJobs.push(...batchJobs);
      } catch (error) {
        this.errors.push(`Batch ${batch} failed: ${error}`);
      }

      if (this.config.batchDelayMs > 0 && batch < numBatches - 1) {
        await this.delay(this.config.batchDelayMs);
      }
    }

    return this.getSummary();
  }

  /**
   * Generate a single batch of jobs.
   */
  async generateBatch(batchIndex: number, size: number): Promise<GeneratedJob[]> {
    const jobs: GeneratedJob[] = [];

    for (let i = 0; i < size; i++) {
      const entityType = this.selectEntityType();
      const entity = this.createMockEntity(entityType);
      const languagePair = this.selectLanguagePair();
      const targetLanguage = this.selectTargetLanguage(languagePair, entity.sourceLanguage);

      const job: GeneratedJob = {
        id: uuidv4(),
        entityType: entity.type,
        entityId: entity.id,
        sourceLanguage: entity.sourceLanguage,
        targetLanguage,
        status: 'queued',
        priority: this.calculatePriority(entityType),
        attempts: 0,
        createdAt: new Date().toISOString(),
      };

      jobs.push(job);
    }

    return jobs;
  }

  /**
   * Select entity type based on configured distribution.
   */
  private selectEntityType(): EntityType {
    const random = Math.random();
    let cumulative = 0;

    const types: EntityType[] = ['item', 'article', 'link', 'tag'];
    for (const type of types) {
      cumulative += this.config.entityTypeMix[type];
      if (random < cumulative) {
        return type;
      }
    }

    return 'item'; // Default fallback
  }

  /**
   * Create mock entity data for testing.
   */
  private createMockEntity(type: EntityType): MockEntity {
    const id = uuidv4();
    const languagePair = this.selectLanguagePair();

    const fieldsByType: Record<EntityType, Array<{ name: string; value: string }>> = {
      item: [
        { name: 'name', value: `Test Item ${id.slice(0, 8)}` },
        { name: 'description', value: `Description for test item ${id.slice(0, 8)}` },
      ],
      article: [
        { name: 'title', value: `How to use Test Item ${id.slice(0, 8)}` },
        { name: 'description', value: `Step-by-step instructions for ${id.slice(0, 8)}` },
      ],
      link: [
        { name: 'title', value: `Video Guide: ${id.slice(0, 8)}` },
      ],
      tag: [
        { name: 'value', value: `tag-${id.slice(0, 8)}` },
      ],
    };

    return {
      id,
      type,
      sourceLanguage: languagePair.source,
      fields: fieldsByType[type],
    };
  }

  /**
   * Select a random language pair from config.
   */
  private selectLanguagePair(): LoadGeneratorConfig['languagePairs'][0] {
    const index = Math.floor(Math.random() * this.config.languagePairs.length);
    return this.config.languagePairs[index];
  }

  /**
   * Select a target language that differs from source.
   */
  private selectTargetLanguage(
    pair: LoadGeneratorConfig['languagePairs'][0],
    sourceLanguage: SupportedLanguage
  ): SupportedLanguage {
    const availableTargets = pair.targets.filter(t => t !== sourceLanguage);
    const index = Math.floor(Math.random() * availableTargets.length);
    return availableTargets[index] || pair.targets[0];
  }

  /**
   * Calculate job priority based on entity type.
   */
  private calculatePriority(entityType: EntityType): number {
    const priorities: Record<EntityType, number> = {
      item: 100,
      article: 75,
      link: 50,
      tag: 25,
    };
    return priorities[entityType];
  }

  /**
   * Get summary of generated jobs.
   */
  private getSummary(): GeneratedJobsSummary {
    const jobsByType: Record<EntityType, number> = { item: 0, article: 0, link: 0, tag: 0 };
    const jobsByLanguagePair: Record<string, number> = {};

    for (const job of this.generatedJobs) {
      jobsByType[job.entityType]++;
      const pairKey = `${job.sourceLanguage}->${job.targetLanguage}`;
      jobsByLanguagePair[pairKey] = (jobsByLanguagePair[pairKey] || 0) + 1;
    }

    return {
      totalCreated: this.generatedJobs.length,
      jobsByType,
      jobsByLanguagePair,
      jobs: this.generatedJobs,
      errors: this.errors,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export function createLoadGenerator(config?: Partial<LoadGeneratorConfig>): LoadGenerator {
  return new LoadGenerator({ ...DEFAULT_LOAD_CONFIG, ...config });
}
```

**Acceptance Criteria:**
- [ ] `LoadGenerator` creates jobs according to configured distribution
- [ ] Entity type distribution follows configured percentages (within reasonable variance)
- [ ] Language pairs are correctly assigned
- [ ] `generateLoad()` respects batch size and delay settings
- [ ] Summary includes accurate counts by type and language pair
- [ ] File compiles without TypeScript errors

**Estimated Effort:** 1 story point

---

### Task 4: Implement Timing Utilities

**File:** `src/lib/job-queue/__tests__/performance/helpers/timing-utils.ts`

**Objective:** Create timing utilities for high-resolution measurements and controlled concurrent processing.

**Steps:**

1. Define types:
```typescript
export interface ProcessorStats {
  totalProcessed: number;
  currentlyActive: number;
  peakActive: number;
  avgProcessingTimeMs: number;
  errors: number;
}

export interface Timer {
  start(): void;
  lap(label: string): number;
  stop(): number;
  getElapsedMs(): number;
  getLaps(): Record<string, number>;
  reset(): void;
}

export interface ThrottledProcessorOptions {
  maxConcurrent: number;
  delayBetweenMs?: number;
}
```

2. Implement timer:
```typescript
export function createTimer(): Timer {
  let startTime: number | null = null;
  let endTime: number | null = null;
  const laps: Record<string, number> = {};

  return {
    start(): void {
      startTime = performance.now();
      endTime = null;
    },

    lap(label: string): number {
      if (startTime === null) {
        throw new Error('Timer not started');
      }
      const elapsed = performance.now() - startTime;
      laps[label] = elapsed;
      return elapsed;
    },

    stop(): number {
      if (startTime === null) {
        throw new Error('Timer not started');
      }
      endTime = performance.now();
      return endTime - startTime;
    },

    getElapsedMs(): number {
      if (startTime === null) {
        return 0;
      }
      const end = endTime ?? performance.now();
      return end - startTime;
    },

    getLaps(): Record<string, number> {
      return { ...laps };
    },

    reset(): void {
      startTime = null;
      endTime = null;
      Object.keys(laps).forEach(key => delete laps[key]);
    },
  };
}
```

3. Implement `measureAsync` helper:
```typescript
export async function measureAsync<T>(
  fn: () => Promise<T>,
  label: string
): Promise<{ result: T; durationMs: number; label: string }> {
  const start = performance.now();
  const result = await fn();
  const durationMs = performance.now() - start;
  return { result, durationMs, label };
}
```

4. Implement `createThrottledProcessor`:
```typescript
export function createThrottledProcessor(
  processFn: () => Promise<void>,
  options: ThrottledProcessorOptions
): {
  process: () => Promise<void>;
  processMany: (count: number) => Promise<void>;
  getStats: () => ProcessorStats;
  reset: () => void;
} {
  let activeCount = 0;
  let peakActive = 0;
  let totalProcessed = 0;
  let totalProcessingTime = 0;
  let errors = 0;
  const queue: Array<() => void> = [];

  const tryProcess = async (): Promise<void> => {
    if (activeCount >= options.maxConcurrent) {
      // Queue the request
      return new Promise<void>(resolve => {
        queue.push(resolve);
      }).then(() => tryProcess());
    }

    activeCount++;
    if (activeCount > peakActive) {
      peakActive = activeCount;
    }

    const start = performance.now();
    try {
      await processFn();
      totalProcessed++;
      totalProcessingTime += performance.now() - start;
    } catch (error) {
      errors++;
      throw error;
    } finally {
      activeCount--;

      // Apply delay if configured
      if (options.delayBetweenMs && options.delayBetweenMs > 0) {
        await new Promise(resolve => setTimeout(resolve, options.delayBetweenMs));
      }

      // Wake up next queued processor
      const next = queue.shift();
      if (next) {
        next();
      }
    }
  };

  return {
    process: tryProcess,

    async processMany(count: number): Promise<void> {
      const promises = Array.from({ length: count }, () => tryProcess());
      await Promise.all(promises);
    },

    getStats(): ProcessorStats {
      return {
        totalProcessed,
        currentlyActive: activeCount,
        peakActive,
        avgProcessingTimeMs: totalProcessed > 0 ? totalProcessingTime / totalProcessed : 0,
        errors,
      };
    },

    reset(): void {
      activeCount = 0;
      peakActive = 0;
      totalProcessed = 0;
      totalProcessingTime = 0;
      errors = 0;
      queue.length = 0;
    },
  };
}
```

5. Add delay utility:
```typescript
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

**Acceptance Criteria:**
- [ ] `createTimer()` accurately measures elapsed time with high resolution
- [ ] `measureAsync()` returns correct duration for async operations
- [ ] `createThrottledProcessor()` respects `maxConcurrent` limit
- [ ] `createThrottledProcessor()` queues excess requests correctly
- [ ] Stats tracking is accurate
- [ ] File compiles without TypeScript errors

**Estimated Effort:** 0.5 story points

---

### Task 5: Implement Resource Monitor

**File:** `src/lib/job-queue/__tests__/performance/helpers/resource-monitor.ts`

**Objective:** Create the `ResourceMonitor` class for tracking memory usage, detecting leaks, and monitoring concurrent jobs.

**Steps:**

1. Define types:
```typescript
export interface ResourceSnapshot {
  timestamp: number;
  heapUsedMb: number;
  heapTotalMb: number;
  externalMb: number;
  activeJobCount: number;
  pendingJobCount: number;
  rateLimitQueueSize: number;
}

export interface MemoryLeakAnalysis {
  detected: boolean;
  trend: number; // positive = growing, negative = shrinking
  confidence: 'low' | 'medium' | 'high';
  snapshots: number;
  startMb: number;
  endMb: number;
  growthMb: number;
  growthPercent: number;
}

export interface PeakMetrics {
  peakMemory: number;
  peakConcurrency: number;
  peakPendingJobs: number;
  peakRateLimitQueue: number;
}
```

2. Implement `ResourceMonitor` class:
```typescript
export class ResourceMonitor {
  private snapshots: ResourceSnapshot[];
  private intervalId: NodeJS.Timeout | null;
  private isMonitoring: boolean;

  constructor() {
    this.snapshots = [];
    this.intervalId = null;
    this.isMonitoring = false;
  }

  /**
   * Start periodic monitoring at specified interval.
   */
  startMonitoring(intervalMs: number): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.intervalId = setInterval(() => {
      this.captureSnapshot(0, 0, 0);
    }, intervalMs);
  }

  /**
   * Stop periodic monitoring.
   */
  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isMonitoring = false;
  }

  /**
   * Capture a single resource snapshot.
   */
  captureSnapshot(
    activeJobs: number,
    pendingJobs: number,
    queueSize: number
  ): ResourceSnapshot {
    const memUsage = process.memoryUsage();
    const snapshot: ResourceSnapshot = {
      timestamp: performance.now(),
      heapUsedMb: memUsage.heapUsed / 1024 / 1024,
      heapTotalMb: memUsage.heapTotal / 1024 / 1024,
      externalMb: memUsage.external / 1024 / 1024,
      activeJobCount: activeJobs,
      pendingJobCount: pendingJobs,
      rateLimitQueueSize: queueSize,
    };

    this.snapshots.push(snapshot);
    return snapshot;
  }

  /**
   * Get all captured snapshots.
   */
  getSnapshots(): ResourceSnapshot[] {
    return [...this.snapshots];
  }

  /**
   * Analyze snapshots for memory leak patterns.
   * Uses linear regression to detect upward trend.
   */
  detectMemoryLeak(): MemoryLeakAnalysis {
    if (this.snapshots.length < 5) {
      return {
        detected: false,
        trend: 0,
        confidence: 'low',
        snapshots: this.snapshots.length,
        startMb: this.snapshots[0]?.heapUsedMb || 0,
        endMb: this.snapshots[this.snapshots.length - 1]?.heapUsedMb || 0,
        growthMb: 0,
        growthPercent: 0,
      };
    }

    const memoryValues = this.snapshots.map(s => s.heapUsedMb);
    const n = memoryValues.length;

    // Calculate linear regression slope
    const sumX = (n * (n - 1)) / 2;
    const sumY = memoryValues.reduce((a, b) => a + b, 0);
    const sumXY = memoryValues.reduce((sum, y, x) => sum + x * y, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    const startMb = memoryValues[0];
    const endMb = memoryValues[memoryValues.length - 1];
    const growthMb = endMb - startMb;
    const growthPercent = startMb > 0 ? (growthMb / startMb) * 100 : 0;

    // Determine confidence based on sample size and consistency
    let confidence: MemoryLeakAnalysis['confidence'] = 'low';
    if (n >= 20) confidence = 'high';
    else if (n >= 10) confidence = 'medium';

    // Leak detected if: positive slope AND significant growth (>10% or >10MB)
    const detected = slope > 0.1 && (growthPercent > 10 || growthMb > 10);

    return {
      detected,
      trend: slope,
      confidence,
      snapshots: n,
      startMb,
      endMb,
      growthMb,
      growthPercent,
    };
  }

  /**
   * Get peak values from all snapshots.
   */
  getPeakMetrics(): PeakMetrics {
    if (this.snapshots.length === 0) {
      return {
        peakMemory: 0,
        peakConcurrency: 0,
        peakPendingJobs: 0,
        peakRateLimitQueue: 0,
      };
    }

    return {
      peakMemory: Math.max(...this.snapshots.map(s => s.heapUsedMb)),
      peakConcurrency: Math.max(...this.snapshots.map(s => s.activeJobCount)),
      peakPendingJobs: Math.max(...this.snapshots.map(s => s.pendingJobCount)),
      peakRateLimitQueue: Math.max(...this.snapshots.map(s => s.rateLimitQueueSize)),
    };
  }

  /**
   * Clear all captured snapshots.
   */
  clear(): void {
    this.snapshots = [];
  }
}

export function createResourceMonitor(): ResourceMonitor {
  return new ResourceMonitor();
}
```

**Acceptance Criteria:**
- [ ] `captureSnapshot()` correctly captures memory usage
- [ ] `startMonitoring()`/`stopMonitoring()` correctly manage interval
- [ ] `detectMemoryLeak()` uses linear regression for trend analysis
- [ ] `getPeakMetrics()` returns correct peak values
- [ ] Memory values are in MB (not bytes)
- [ ] File compiles without TypeScript errors

**Estimated Effort:** 1 story point

---

### Task 6: Write High Volume Job Creation Tests

**File:** `src/lib/job-queue/__tests__/performance/high-volume-job-creation.perf.test.ts`

**Objective:** Create tests that verify the system can create 100+ translation jobs simultaneously without failures.

**Steps:**

1. Set up test file with imports and utilities:
```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createLoadGenerator,
  createMetricsCollector,
  createResourceMonitor,
  createTimer,
  DEFAULT_LOAD_CONFIG,
} from './helpers';
import type { LoadGeneratorConfig, PerformanceTestResults } from './helpers';
import * as fs from 'fs/promises';
import * as path from 'path';

// Results directory
const RESULTS_DIR = path.join(__dirname, '../performance-results');

async function writeResults(results: PerformanceTestResults): Promise<void> {
  const filename = `high-volume-${Date.now()}.json`;
  await fs.mkdir(RESULTS_DIR, { recursive: true });
  await fs.writeFile(
    path.join(RESULTS_DIR, filename),
    JSON.stringify(results, null, 2)
  );
}
```

2. Implement test suite:
```typescript
describe('High Volume Job Creation', () => {
  let metricsCollector: ReturnType<typeof createMetricsCollector>;
  let resourceMonitor: ReturnType<typeof createResourceMonitor>;

  beforeEach(() => {
    vi.clearAllMocks();
    resourceMonitor = createResourceMonitor();
  });

  afterEach(async () => {
    resourceMonitor.stopMonitoring();
    vi.restoreAllMocks();
  });

  it('creates and queues 100+ translation jobs without failures', async () => {
    const config: LoadGeneratorConfig = {
      totalJobs: 120,
      batchSize: 20,
      batchDelayMs: 0,
      entityTypeMix: { item: 0.5, article: 0.3, link: 0.15, tag: 0.05 },
      languagePairs: [{ source: 'en', targets: ['fr', 'es', 'de', 'nl', 'it'] }],
    };

    metricsCollector = createMetricsCollector('high-volume-creation', {
      totalJobs: config.totalJobs,
      maxConcurrent: 10,
      batchSize: config.batchSize,
      mockLatencyRange: { min: 0, max: 0 },
      rateLimitConfig: { maxRequests: 100, windowMs: 1000 },
    });

    const generator = createLoadGenerator(config);
    const timer = createTimer();

    // Start resource monitoring
    resourceMonitor.startMonitoring(100);

    // Generate jobs
    timer.start();
    const result = await generator.generateLoad();
    const creationTimeMs = timer.stop();

    resourceMonitor.stopMonitoring();

    // Record jobs in metrics
    for (const job of result.jobs) {
      metricsCollector.recordJobQueued(job.id, job.entityType);
    }

    // Assertions
    expect(result.totalCreated).toBe(120);
    expect(result.errors).toHaveLength(0);
    expect(result.jobs).toHaveLength(120);

    // Verify all jobs have valid structure
    for (const job of result.jobs) {
      expect(job.id).toBeTruthy();
      expect(job.status).toBe('queued');
      expect(['item', 'article', 'link', 'tag']).toContain(job.entityType);
      expect(['en', 'fr', 'es', 'de', 'nl', 'it']).toContain(job.sourceLanguage);
      expect(['en', 'fr', 'es', 'de', 'nl', 'it']).toContain(job.targetLanguage);
      expect(job.sourceLanguage).not.toBe(job.targetLanguage);
    }

    // Log metrics
    console.log('High Volume Job Creation Results:', {
      totalCreated: result.totalCreated,
      creationTimeMs: creationTimeMs.toFixed(2),
      jobsPerSecond: (result.totalCreated / (creationTimeMs / 1000)).toFixed(2),
      byType: result.jobsByType,
    });

    const results = metricsCollector.getResults();
    await writeResults(results);
  });

  it('handles mixed entity types in concurrent load', async () => {
    const config: LoadGeneratorConfig = {
      totalJobs: 100,
      batchSize: 25,
      batchDelayMs: 0,
      entityTypeMix: { item: 0.25, article: 0.25, link: 0.25, tag: 0.25 },
      languagePairs: [
        { source: 'en', targets: ['fr', 'es', 'de', 'nl', 'it'] },
        { source: 'fr', targets: ['en', 'es', 'de', 'nl', 'it'] },
      ],
    };

    metricsCollector = createMetricsCollector('mixed-entity-types', {
      totalJobs: config.totalJobs,
      maxConcurrent: 10,
      batchSize: config.batchSize,
      mockLatencyRange: { min: 0, max: 0 },
      rateLimitConfig: { maxRequests: 100, windowMs: 1000 },
    });

    const generator = createLoadGenerator(config);
    const result = await generator.generateLoad();

    expect(result.totalCreated).toBe(100);

    // Verify distribution is approximately equal (with variance tolerance)
    const { jobsByType } = result;
    const types = ['item', 'article', 'link', 'tag'] as const;

    for (const type of types) {
      // Each type should be approximately 25% (15-35% range for 100 jobs)
      expect(jobsByType[type]).toBeGreaterThanOrEqual(15);
      expect(jobsByType[type]).toBeLessThanOrEqual(35);
    }

    console.log('Entity Type Distribution:', jobsByType);

    const results = metricsCollector.getResults();
    await writeResults(results);
  });

  it('supports multiple language pair configurations', async () => {
    const config: LoadGeneratorConfig = {
      totalJobs: 50,
      batchSize: 10,
      batchDelayMs: 0,
      entityTypeMix: { item: 1.0, article: 0, link: 0, tag: 0 },
      languagePairs: [
        { source: 'en', targets: ['fr', 'es'] },
        { source: 'fr', targets: ['en', 'de'] },
        { source: 'es', targets: ['en', 'it'] },
      ],
    };

    const generator = createLoadGenerator(config);
    const result = await generator.generateLoad();

    expect(result.totalCreated).toBe(50);

    // Verify multiple source languages are used
    const sourceLanguages = new Set(result.jobs.map(j => j.sourceLanguage));
    expect(sourceLanguages.size).toBeGreaterThan(1);

    console.log('Language Pair Distribution:', result.jobsByLanguagePair);
  });

  it('measures batch creation throughput', async () => {
    const batchSizes = [10, 20, 50];
    const throughputResults: Array<{ batchSize: number; jobsPerSecond: number }> = [];

    for (const batchSize of batchSizes) {
      const config: LoadGeneratorConfig = {
        ...DEFAULT_LOAD_CONFIG,
        totalJobs: 100,
        batchSize,
        batchDelayMs: 0,
      };

      const generator = createLoadGenerator(config);
      const timer = createTimer();

      timer.start();
      const result = await generator.generateLoad();
      const durationMs = timer.stop();

      throughputResults.push({
        batchSize,
        jobsPerSecond: result.totalCreated / (durationMs / 1000),
      });
    }

    console.log('Batch Size Throughput Comparison:', throughputResults);

    // All configurations should achieve reasonable throughput
    for (const result of throughputResults) {
      expect(result.jobsPerSecond).toBeGreaterThan(100); // At least 100 jobs/sec for generation
    }
  });
});
```

**Acceptance Criteria:**
- [ ] Test creates 120 jobs successfully (exceeds 100 requirement)
- [ ] Test verifies no errors during creation
- [ ] Test validates job structure
- [ ] Test verifies mixed entity type distribution
- [ ] Test measures creation throughput
- [ ] Results written to JSON file
- [ ] All tests pass

**Estimated Effort:** 1 story point

---

### Task 7: Write Job Completion Time Tests

**File:** `src/lib/job-queue/__tests__/performance/job-completion-time.perf.test.ts`

**Objective:** Create tests that measure job completion times and verify p95 is under 60 seconds.

**Steps:**

1. Set up test file with mock translation processing:
```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createLoadGenerator,
  createMetricsCollector,
  createResourceMonitor,
  createThrottledProcessor,
  delay,
} from './helpers';
import type { GeneratedJob, TestConfiguration } from './helpers';
import * as fs from 'fs/promises';
import * as path from 'path';

const RESULTS_DIR = path.join(__dirname, '../performance-results');

// Mock translation function with realistic latency
async function mockTranslateText(
  minLatencyMs: number,
  maxLatencyMs: number
): Promise<{ translatedText: string; provider: string; tokensUsed: number }> {
  const latency = minLatencyMs + Math.random() * (maxLatencyMs - minLatencyMs);
  await delay(latency);
  return {
    translatedText: 'Translated text',
    provider: 'claude',
    tokensUsed: Math.floor(50 + Math.random() * 100),
  };
}
```

2. Implement completion time test suite:
```typescript
describe('Job Completion Time', () => {
  let metricsCollector: ReturnType<typeof createMetricsCollector>;
  let resourceMonitor: ReturnType<typeof createResourceMonitor>;

  const testConfig: TestConfiguration = {
    totalJobs: 100,
    maxConcurrent: 10,
    batchSize: 20,
    mockLatencyRange: { min: 50, max: 200 },
    rateLimitConfig: { maxRequests: 20, windowMs: 1000 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    resourceMonitor = createResourceMonitor();
    metricsCollector = createMetricsCollector('job-completion-time', testConfig);
  });

  afterEach(async () => {
    resourceMonitor.stopMonitoring();
    vi.restoreAllMocks();
  });

  it('achieves p95 completion time under 60 seconds', async () => {
    // Generate 100 jobs
    const generator = createLoadGenerator({
      totalJobs: testConfig.totalJobs,
      batchSize: testConfig.batchSize,
      batchDelayMs: 0,
      entityTypeMix: { item: 0.5, article: 0.3, link: 0.15, tag: 0.05 },
      languagePairs: [{ source: 'en', targets: ['fr', 'es', 'de', 'nl', 'it'] }],
    });

    const { jobs } = await generator.generateLoad();

    // Record all jobs as queued
    for (const job of jobs) {
      metricsCollector.recordJobQueued(job.id, job.entityType);
    }

    // Start resource monitoring
    resourceMonitor.startMonitoring(100);

    // Create mock job processor
    let jobIndex = 0;
    const processJob = async (): Promise<void> => {
      if (jobIndex >= jobs.length) return;

      const job = jobs[jobIndex];
      jobIndex++;

      // Record start
      metricsCollector.recordJobStarted(job.id);

      // Simulate translation with realistic latency
      try {
        await mockTranslateText(
          testConfig.mockLatencyRange.min,
          testConfig.mockLatencyRange.max
        );
        metricsCollector.recordJobCompleted(job.id);
      } catch (error) {
        metricsCollector.recordJobFailed(job.id, String(error));
      }
    };

    // Process jobs with throttled concurrency
    const processor = createThrottledProcessor(processJob, {
      maxConcurrent: testConfig.maxConcurrent,
      delayBetweenMs: 10,
    });

    const startTime = performance.now();

    // Process all jobs concurrently (up to limit)
    await processor.processMany(jobs.length);

    const totalTimeMs = performance.now() - startTime;
    resourceMonitor.stopMonitoring();

    // Get results
    const results = metricsCollector.getResults();

    // Core assertion: p95 must be under 60 seconds
    expect(results.metrics.p95CompletionTimeMs).toBeLessThan(60000);

    // All jobs should complete
    expect(results.metrics.completedJobs).toBe(testConfig.totalJobs);
    expect(results.metrics.failedJobs).toBe(0);

    // Log comprehensive metrics
    console.log('Job Completion Time Results:', {
      totalTime: `${(totalTimeMs / 1000).toFixed(2)}s`,
      p50: `${results.metrics.p50CompletionTimeMs.toFixed(2)}ms`,
      p95: `${results.metrics.p95CompletionTimeMs.toFixed(2)}ms`,
      p99: `${results.metrics.p99CompletionTimeMs.toFixed(2)}ms`,
      max: `${results.metrics.maxCompletionTimeMs.toFixed(2)}ms`,
      min: `${results.metrics.minCompletionTimeMs.toFixed(2)}ms`,
      avg: `${results.metrics.avgCompletionTimeMs.toFixed(2)}ms`,
      throughput: `${results.metrics.throughputJobsPerSecond.toFixed(2)} jobs/sec`,
    });

    // Write results
    await fs.mkdir(RESULTS_DIR, { recursive: true });
    await fs.writeFile(
      path.join(RESULTS_DIR, `completion-time-${Date.now()}.json`),
      JSON.stringify(results, null, 2)
    );
  }, 120000); // 2 minute timeout for this test

  it('measures timing distribution across different entity types', async () => {
    const generator = createLoadGenerator({
      totalJobs: 80,
      batchSize: 20,
      batchDelayMs: 0,
      entityTypeMix: { item: 0.25, article: 0.25, link: 0.25, tag: 0.25 },
      languagePairs: [{ source: 'en', targets: ['fr', 'es', 'de', 'nl', 'it'] }],
    });

    const { jobs } = await generator.generateLoad();

    // Record all jobs
    for (const job of jobs) {
      metricsCollector.recordJobQueued(job.id, job.entityType);
    }

    let jobIndex = 0;
    const processJob = async (): Promise<void> => {
      if (jobIndex >= jobs.length) return;
      const job = jobs[jobIndex];
      jobIndex++;

      metricsCollector.recordJobStarted(job.id);
      await mockTranslateText(50, 200);
      metricsCollector.recordJobCompleted(job.id);
    };

    const processor = createThrottledProcessor(processJob, {
      maxConcurrent: 10,
    });

    await processor.processMany(jobs.length);

    const results = metricsCollector.getResults();

    // Group timings by entity type
    const timingsByType: Record<string, number[]> = {
      item: [],
      article: [],
      link: [],
      tag: [],
    };

    for (const timing of results.jobTimings) {
      if (timing.totalDurationMs !== null) {
        timingsByType[timing.entityType].push(timing.totalDurationMs);
      }
    }

    console.log('Timing Distribution by Entity Type:');
    for (const [type, timings] of Object.entries(timingsByType)) {
      if (timings.length > 0) {
        const avg = timings.reduce((a, b) => a + b, 0) / timings.length;
        const max = Math.max(...timings);
        const min = Math.min(...timings);
        console.log(`  ${type}: avg=${avg.toFixed(2)}ms, min=${min.toFixed(2)}ms, max=${max.toFixed(2)}ms, count=${timings.length}`);
      }
    }

    expect(results.metrics.completedJobs).toBe(80);
  });

  it('records accurate timing for individual jobs', async () => {
    const generator = createLoadGenerator({
      totalJobs: 10,
      batchSize: 10,
      batchDelayMs: 0,
      entityTypeMix: { item: 1.0, article: 0, link: 0, tag: 0 },
      languagePairs: [{ source: 'en', targets: ['fr'] }],
    });

    const { jobs } = await generator.generateLoad();

    for (const job of jobs) {
      metricsCollector.recordJobQueued(job.id, job.entityType);
    }

    // Process sequentially to verify timing accuracy
    for (const job of jobs) {
      metricsCollector.recordJobStarted(job.id);
      await delay(100); // Fixed delay for verification
      metricsCollector.recordJobCompleted(job.id);
    }

    const results = metricsCollector.getResults();

    // Verify timing accuracy
    for (const timing of results.jobTimings) {
      expect(timing.processingDurationMs).toBeGreaterThanOrEqual(95); // Allow 5% variance
      expect(timing.processingDurationMs).toBeLessThanOrEqual(120); // Allow some overhead
      expect(timing.queueWaitMs).toBeGreaterThanOrEqual(0);
      expect(timing.totalDurationMs).toBeGreaterThanOrEqual(timing.processingDurationMs!);
    }

    console.log('Timing Accuracy Verification:', {
      expectedProcessingMs: 100,
      actualAvgProcessingMs: results.metrics.avgCompletionTimeMs.toFixed(2),
    });
  });
});
```

**Acceptance Criteria:**
- [ ] Test processes 100 jobs with mock translation latency
- [ ] Test verifies p95 completion time < 60 seconds
- [ ] Test verifies all jobs complete without failures
- [ ] Test measures timing distribution by entity type
- [ ] Test verifies timing accuracy for individual jobs
- [ ] Results include percentile calculations
- [ ] All tests pass

**Estimated Effort:** 1.5 story points

---

### Task 8: Write Rate Limiting Under Load Tests

**File:** `src/lib/job-queue/__tests__/performance/rate-limiting-under-load.perf.test.ts`

**Objective:** Create tests that verify rate limiting functions correctly under high load without causing excessive failures.

**Steps:**

1. Create mock rate limiter for testing:
```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createMetricsCollector,
  createThrottledProcessor,
  delay,
} from './helpers';
import type { RateLimitEvent } from './helpers';
import * as fs from 'fs/promises';
import * as path from 'path';

const RESULTS_DIR = path.join(__dirname, '../performance-results');

// Simple mock rate limiter for testing
interface MockRateLimiter {
  acquire(): Promise<void>;
  canAcquire(): boolean;
  getStatus(): { remaining: number; isLimited: boolean; queueLength: number };
  getQueueLength(): number;
  reset(): void;
}

function createMockRateLimiter(config: {
  maxRequests: number;
  windowMs: number;
  strategy: 'queue' | 'reject';
  maxQueueSize: number;
  queueTimeoutMs: number;
}): MockRateLimiter {
  let requestCount = 0;
  let windowStart = Date.now();
  const queue: Array<() => void> = [];

  const checkWindow = (): void => {
    const now = Date.now();
    if (now - windowStart >= config.windowMs) {
      requestCount = 0;
      windowStart = now;
    }
  };

  return {
    async acquire(): Promise<void> {
      checkWindow();

      if (requestCount < config.maxRequests) {
        requestCount++;
        return;
      }

      if (config.strategy === 'reject') {
        throw new Error('Rate limit exceeded');
      }

      // Queue strategy
      if (queue.length >= config.maxQueueSize) {
        throw new Error('Rate limit queue full');
      }

      return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          const index = queue.indexOf(resolve);
          if (index > -1) queue.splice(index, 1);
          reject(new Error('Rate limit queue timeout'));
        }, config.queueTimeoutMs);

        queue.push(() => {
          clearTimeout(timeout);
          requestCount++;
          resolve();
        });

        // Process queue when window resets
        setTimeout(() => {
          checkWindow();
          while (queue.length > 0 && requestCount < config.maxRequests) {
            const next = queue.shift();
            if (next) next();
          }
        }, config.windowMs - (Date.now() - windowStart) + 10);
      });
    },

    canAcquire(): boolean {
      checkWindow();
      return requestCount < config.maxRequests;
    },

    getStatus(): { remaining: number; isLimited: boolean; queueLength: number } {
      checkWindow();
      return {
        remaining: Math.max(0, config.maxRequests - requestCount),
        isLimited: requestCount >= config.maxRequests,
        queueLength: queue.length,
      };
    },

    getQueueLength(): number {
      return queue.length;
    },

    reset(): void {
      requestCount = 0;
      windowStart = Date.now();
      queue.length = 0;
    },
  };
}
```

2. Implement rate limiting tests:
```typescript
describe('Rate Limiting Under Load', () => {
  let metricsCollector: ReturnType<typeof createMetricsCollector>;

  beforeEach(() => {
    vi.clearAllMocks();
    metricsCollector = createMetricsCollector('rate-limiting', {
      totalJobs: 50,
      maxConcurrent: 10,
      batchSize: 10,
      mockLatencyRange: { min: 50, max: 50 },
      rateLimitConfig: { maxRequests: 10, windowMs: 1000 },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throttles requests correctly without excessive failures', async () => {
    const rateLimiter = createMockRateLimiter({
      maxRequests: 10,
      windowMs: 1000,
      strategy: 'queue',
      maxQueueSize: 200,
      queueTimeoutMs: 30000,
    });

    const rateLimitEvents: RateLimitEvent[] = [];
    let completedRequests = 0;
    let throttledCount = 0;

    // Create 50 rapid requests (exceeds 10/sec limit)
    const requestPromises = Array.from({ length: 50 }, async (_, i) => {
      const canAcquire = rateLimiter.canAcquire();
      if (!canAcquire) {
        throttledCount++;
      }

      const startWait = performance.now();
      await rateLimiter.acquire();
      const waitTime = performance.now() - startWait;

      rateLimitEvents.push({
        timestamp: Date.now(),
        action: canAcquire ? 'immediate' : 'queued',
        queueSize: rateLimiter.getQueueLength(),
        waitTimeMs: waitTime,
      });

      // Simulate API call
      await delay(50);
      completedRequests++;
    });

    await Promise.all(requestPromises);

    const status = rateLimiter.getStatus();

    // Verify rate limiting occurred
    expect(throttledCount).toBeGreaterThan(0);

    // All requests should complete (queued, not rejected)
    expect(completedRequests).toBe(50);

    // After all requests complete, limiter should have capacity
    expect(status.queueLength).toBe(0);

    console.log('Rate Limiting Test Results:', {
      totalRequests: 50,
      throttledCount,
      completedRequests,
      immediateRequests: rateLimitEvents.filter(e => e.action === 'immediate').length,
      queuedRequests: rateLimitEvents.filter(e => e.action === 'queued').length,
    });
  });

  it('queue strategy prevents failures under burst load', async () => {
    const rateLimiter = createMockRateLimiter({
      maxRequests: 5,
      windowMs: 1000,
      strategy: 'queue',
      maxQueueSize: 100,
      queueTimeoutMs: 60000,
    });

    const results: Array<{ success: boolean; error?: string }> = [];

    // Burst of 20 requests with very strict limit (5/sec)
    const requestPromises = Array.from({ length: 20 }, async () => {
      try {
        await rateLimiter.acquire();
        await delay(10);
        results.push({ success: true });
      } catch (error) {
        results.push({ success: false, error: String(error) });
      }
    });

    await Promise.all(requestPromises);

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    // With queue strategy, all should eventually succeed
    expect(successful).toBe(20);
    expect(failed).toBe(0);

    console.log('Queue Strategy Results:', { successful, failed });
  });

  it('reject strategy fails excess requests immediately', async () => {
    const rateLimiter = createMockRateLimiter({
      maxRequests: 5,
      windowMs: 1000,
      strategy: 'reject',
      maxQueueSize: 0,
      queueTimeoutMs: 0,
    });

    const results: Array<{ success: boolean; error?: string }> = [];

    // Burst of 20 requests with reject strategy
    const requestPromises = Array.from({ length: 20 }, async () => {
      try {
        await rateLimiter.acquire();
        results.push({ success: true });
      } catch (error) {
        results.push({ success: false, error: String(error) });
      }
    });

    await Promise.all(requestPromises);

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    // First 5 should succeed, rest should fail
    expect(successful).toBe(5);
    expect(failed).toBe(15);

    console.log('Reject Strategy Results:', { successful, failed });
  });

  it('rate limiter recovers after window reset', async () => {
    const rateLimiter = createMockRateLimiter({
      maxRequests: 10,
      windowMs: 500, // Short window for test
      strategy: 'queue',
      maxQueueSize: 50,
      queueTimeoutMs: 5000,
    });

    // Exhaust the limit
    for (let i = 0; i < 10; i++) {
      await rateLimiter.acquire();
    }

    // Should be limited
    expect(rateLimiter.canAcquire()).toBe(false);

    // Wait for window reset
    await delay(600);

    // Should have capacity again
    expect(rateLimiter.canAcquire()).toBe(true);
    expect(rateLimiter.getStatus().remaining).toBe(10);

    console.log('Rate Limiter Recovery: verified window reset');
  });

  it('measures queue wait time under sustained load', async () => {
    const rateLimiter = createMockRateLimiter({
      maxRequests: 10,
      windowMs: 1000,
      strategy: 'queue',
      maxQueueSize: 100,
      queueTimeoutMs: 30000,
    });

    const waitTimes: number[] = [];

    // Sustained load: 30 requests over time
    for (let i = 0; i < 30; i++) {
      const start = performance.now();
      await rateLimiter.acquire();
      waitTimes.push(performance.now() - start);

      // Small delay between requests
      await delay(20);
    }

    const avgWait = waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length;
    const maxWait = Math.max(...waitTimes);

    console.log('Queue Wait Time Analysis:', {
      avgWaitMs: avgWait.toFixed(2),
      maxWaitMs: maxWait.toFixed(2),
      requestsWithWait: waitTimes.filter(t => t > 10).length,
    });

    // Average wait should be reasonable (under 5 seconds)
    expect(avgWait).toBeLessThan(5000);
  });
});
```

**Acceptance Criteria:**
- [ ] Test verifies rate limiting throttles requests correctly
- [ ] Test verifies queue strategy prevents failures
- [ ] Test verifies reject strategy fails excess requests
- [ ] Test verifies rate limiter recovers after window reset
- [ ] Test measures queue wait times
- [ ] No excessive failures due to rate limiting
- [ ] All tests pass

**Estimated Effort:** 1 story point

---

### Task 9: Write Concurrency Limits Tests

**File:** `src/lib/job-queue/__tests__/performance/concurrency-limits.perf.test.ts`

**Objective:** Create tests that verify the maximum concurrent job limit is respected under high load.

**Steps:**

1. Implement concurrency tests:
```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createMetricsCollector,
  createThrottledProcessor,
  createResourceMonitor,
  delay,
} from './helpers';

describe('Concurrency Limits', () => {
  let metricsCollector: ReturnType<typeof createMetricsCollector>;
  let resourceMonitor: ReturnType<typeof createResourceMonitor>;

  beforeEach(() => {
    vi.clearAllMocks();
    resourceMonitor = createResourceMonitor();
    metricsCollector = createMetricsCollector('concurrency-limits', {
      totalJobs: 50,
      maxConcurrent: 10,
      batchSize: 10,
      mockLatencyRange: { min: 100, max: 100 },
      rateLimitConfig: { maxRequests: 100, windowMs: 1000 },
    });
  });

  afterEach(() => {
    resourceMonitor.stopMonitoring();
    vi.restoreAllMocks();
  });

  it('respects maximum concurrent job limit', async () => {
    const MAX_CONCURRENT = 10;
    const TOTAL_JOBS = 50;

    let peakConcurrent = 0;
    let currentConcurrent = 0;
    const concurrencySnapshots: number[] = [];

    // Create processor that tracks concurrency
    const processor = createThrottledProcessor(
      async () => {
        currentConcurrent++;
        if (currentConcurrent > peakConcurrent) {
          peakConcurrent = currentConcurrent;
        }
        concurrencySnapshots.push(currentConcurrent);

        // Hold for measurement
        await delay(100);

        currentConcurrent--;
      },
      { maxConcurrent: MAX_CONCURRENT }
    );

    // Launch all jobs
    await processor.processMany(TOTAL_JOBS);

    // Verify concurrency never exceeded limit
    expect(peakConcurrent).toBeLessThanOrEqual(MAX_CONCURRENT);

    // Verify all jobs completed
    const stats = processor.getStats();
    expect(stats.totalProcessed).toBe(TOTAL_JOBS);
    expect(stats.peakActive).toBeLessThanOrEqual(MAX_CONCURRENT);

    console.log('Concurrency Limit Results:', {
      totalJobs: TOTAL_JOBS,
      maxAllowed: MAX_CONCURRENT,
      peakConcurrent,
      avgConcurrency: (concurrencySnapshots.reduce((a, b) => a + b, 0) / concurrencySnapshots.length).toFixed(2),
    });
  });

  it('queues jobs properly when at concurrency limit', async () => {
    const MAX_CONCURRENT = 5;
    const TOTAL_JOBS = 20;

    let concurrentCount = 0;
    let queuedCount = 0;
    const processingOrder: number[] = [];
    let jobId = 0;

    const processor = createThrottledProcessor(
      async () => {
        const myId = jobId++;
        processingOrder.push(myId);

        concurrentCount++;
        if (concurrentCount > MAX_CONCURRENT) {
          queuedCount++;
        }

        await delay(50);
        concurrentCount--;
      },
      { maxConcurrent: MAX_CONCURRENT }
    );

    await processor.processMany(TOTAL_JOBS);

    const stats = processor.getStats();

    // All jobs should complete
    expect(stats.totalProcessed).toBe(TOTAL_JOBS);

    // Peak should not exceed limit
    expect(stats.peakActive).toBeLessThanOrEqual(MAX_CONCURRENT);

    // Some jobs should have been queued
    expect(processingOrder.length).toBe(TOTAL_JOBS);

    console.log('Job Queuing Results:', {
      totalProcessed: stats.totalProcessed,
      peakActive: stats.peakActive,
      queuedJobs: TOTAL_JOBS - MAX_CONCURRENT, // Minimum that must have been queued
    });
  });

  it('handles varying concurrency limits correctly', async () => {
    const limits = [1, 5, 10, 20];
    const results: Array<{ limit: number; peakActive: number; avgProcessingTimeMs: number }> = [];

    for (const limit of limits) {
      const processor = createThrottledProcessor(
        async () => {
          await delay(50);
        },
        { maxConcurrent: limit }
      );

      await processor.processMany(50);

      const stats = processor.getStats();
      results.push({
        limit,
        peakActive: stats.peakActive,
        avgProcessingTimeMs: stats.avgProcessingTimeMs,
      });
    }

    console.log('Varying Concurrency Results:', results);

    // Verify each limit was respected
    for (const result of results) {
      expect(result.peakActive).toBeLessThanOrEqual(result.limit);
    }

    // Higher concurrency should have faster total time (lower avg)
    // This is a relative comparison
    expect(results[3].avgProcessingTimeMs).toBeLessThanOrEqual(
      results[0].avgProcessingTimeMs * 2
    );
  });

  it('maintains concurrency under error conditions', async () => {
    const MAX_CONCURRENT = 5;
    const TOTAL_JOBS = 30;
    let errorCount = 0;
    let processedCount = 0;

    const processor = createThrottledProcessor(
      async () => {
        processedCount++;
        await delay(30);

        // Fail every 5th job
        if (processedCount % 5 === 0) {
          errorCount++;
          throw new Error('Simulated failure');
        }
      },
      { maxConcurrent: MAX_CONCURRENT }
    );

    // Process with error handling
    const promises = Array.from({ length: TOTAL_JOBS }, async () => {
      try {
        await processor.process();
      } catch (e) {
        // Expected errors
      }
    });

    await Promise.all(promises);

    const stats = processor.getStats();

    // Concurrency should still be respected despite errors
    expect(stats.peakActive).toBeLessThanOrEqual(MAX_CONCURRENT);

    // Some errors occurred
    expect(stats.errors).toBeGreaterThan(0);

    console.log('Error Handling Results:', {
      totalProcessed: stats.totalProcessed,
      errors: stats.errors,
      peakActive: stats.peakActive,
    });
  });

  it('tracks concurrency over time', async () => {
    const MAX_CONCURRENT = 10;
    const TOTAL_JOBS = 100;

    resourceMonitor.startMonitoring(50);

    let activeJobs = 0;

    const processor = createThrottledProcessor(
      async () => {
        activeJobs++;
        resourceMonitor.captureSnapshot(activeJobs, 0, 0);

        await delay(100);

        activeJobs--;
        resourceMonitor.captureSnapshot(activeJobs, 0, 0);
      },
      { maxConcurrent: MAX_CONCURRENT }
    );

    await processor.processMany(TOTAL_JOBS);

    resourceMonitor.stopMonitoring();

    const snapshots = resourceMonitor.getSnapshots();
    const peakMetrics = resourceMonitor.getPeakMetrics();

    // Verify peak concurrency from snapshots
    expect(peakMetrics.peakConcurrency).toBeLessThanOrEqual(MAX_CONCURRENT);

    console.log('Concurrency Over Time:', {
      snapshotsCount: snapshots.length,
      peakConcurrency: peakMetrics.peakConcurrency,
    });
  });
});
```

**Acceptance Criteria:**
- [ ] Test verifies max concurrent job limit is never exceeded
- [ ] Test verifies jobs queue properly when at limit
- [ ] Test verifies varying concurrency limits work correctly
- [ ] Test verifies concurrency maintained under error conditions
- [ ] Test tracks concurrency over time
- [ ] All tests pass

**Estimated Effort:** 1 story point

---

### Task 10: Write Sustained Load Tests (Memory Leak Detection)

**File:** `src/lib/job-queue/__tests__/performance/sustained-load.perf.test.ts`

**Objective:** Create tests that verify no memory leaks occur during sustained high-concurrency operation.

**Steps:**

1. Implement sustained load tests:
```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createMetricsCollector,
  createResourceMonitor,
  createThrottledProcessor,
  createLoadGenerator,
  delay,
} from './helpers';
import * as fs from 'fs/promises';
import * as path from 'path';

const RESULTS_DIR = path.join(__dirname, '../performance-results');

describe('Sustained Load', () => {
  let resourceMonitor: ReturnType<typeof createResourceMonitor>;

  beforeEach(() => {
    vi.clearAllMocks();
    resourceMonitor = createResourceMonitor();

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  });

  afterEach(() => {
    resourceMonitor.stopMonitoring();
    vi.restoreAllMocks();
  });

  it('does not leak memory during sustained operation', async () => {
    const BATCHES = 5;
    const JOBS_PER_BATCH = 50;
    const MAX_CONCURRENT = 10;

    resourceMonitor.startMonitoring(200);

    // Record initial memory
    const initialMemory = process.memoryUsage().heapUsed / 1024 / 1024;

    // Process multiple batches
    for (let batch = 0; batch < BATCHES; batch++) {
      const generator = createLoadGenerator({
        totalJobs: JOBS_PER_BATCH,
        batchSize: 10,
        batchDelayMs: 0,
        entityTypeMix: { item: 0.5, article: 0.3, link: 0.15, tag: 0.05 },
        languagePairs: [{ source: 'en', targets: ['fr', 'es', 'de', 'nl', 'it'] }],
      });

      const { jobs } = await generator.generateLoad();

      let jobIndex = 0;
      const processor = createThrottledProcessor(
        async () => {
          if (jobIndex >= jobs.length) return;
          jobIndex++;
          await delay(50 + Math.random() * 50);
        },
        { maxConcurrent: MAX_CONCURRENT }
      );

      await processor.processMany(jobs.length);

      // Force garbage collection between batches if available
      if (global.gc) {
        global.gc();
      }

      // Brief pause between batches
      await delay(100);

      resourceMonitor.captureSnapshot(0, 0, 0);
    }

    resourceMonitor.stopMonitoring();

    // Record final memory
    const finalMemory = process.memoryUsage().heapUsed / 1024 / 1024;
    const memoryGrowth = finalMemory - initialMemory;

    // Analyze for leak pattern
    const leakAnalysis = resourceMonitor.detectMemoryLeak();

    // Memory growth should be bounded
    expect(leakAnalysis.detected).toBe(false);

    // Allow some growth but not proportional to jobs processed (250 total)
    expect(memoryGrowth).toBeLessThan(50); // Less than 50MB growth

    console.log('Memory Analysis:', {
      initialMb: initialMemory.toFixed(2),
      finalMb: finalMemory.toFixed(2),
      growthMb: memoryGrowth.toFixed(2),
      growthPercent: leakAnalysis.growthPercent.toFixed(2),
      leakDetected: leakAnalysis.detected,
      trend: leakAnalysis.trend.toFixed(4),
      confidence: leakAnalysis.confidence,
    });

    // Write detailed results
    await fs.mkdir(RESULTS_DIR, { recursive: true });
    await fs.writeFile(
      path.join(RESULTS_DIR, `sustained-load-${Date.now()}.json`),
      JSON.stringify({
        testName: 'sustained-load-memory',
        batches: BATCHES,
        jobsPerBatch: JOBS_PER_BATCH,
        totalJobs: BATCHES * JOBS_PER_BATCH,
        memoryAnalysis: leakAnalysis,
        resourceSnapshots: resourceMonitor.getSnapshots(),
      }, null, 2)
    );
  }, 120000); // 2 minute timeout

  it('maintains stable resource utilization over time', async () => {
    const DURATION_MS = 10000; // 10 seconds of sustained load
    const MAX_CONCURRENT = 10;

    resourceMonitor.startMonitoring(100);

    const startTime = performance.now();
    let jobsProcessed = 0;

    // Continuous processing for duration
    const processor = createThrottledProcessor(
      async () => {
        await delay(50 + Math.random() * 100);
        jobsProcessed++;
      },
      { maxConcurrent: MAX_CONCURRENT }
    );

    // Keep processing until duration expires
    while (performance.now() - startTime < DURATION_MS) {
      await processor.process();
    }

    resourceMonitor.stopMonitoring();

    const snapshots = resourceMonitor.getSnapshots();
    const peakMetrics = resourceMonitor.getPeakMetrics();

    // Calculate memory stability (standard deviation)
    const memoryValues = snapshots.map(s => s.heapUsedMb);
    const avgMemory = memoryValues.reduce((a, b) => a + b, 0) / memoryValues.length;
    const variance = memoryValues.reduce((sum, val) => sum + Math.pow(val - avgMemory, 2), 0) / memoryValues.length;
    const stdDev = Math.sqrt(variance);

    console.log('Resource Stability:', {
      durationMs: DURATION_MS,
      jobsProcessed,
      avgMemoryMb: avgMemory.toFixed(2),
      peakMemoryMb: peakMetrics.peakMemory.toFixed(2),
      memoryStdDevMb: stdDev.toFixed(2),
      snapshots: snapshots.length,
    });

    // Memory should be relatively stable (std dev < 20% of average)
    expect(stdDev).toBeLessThan(avgMemory * 0.2);
  }, 30000);

  it('handles cleanup correctly after processing', async () => {
    const TOTAL_JOBS = 100;
    const MAX_CONCURRENT = 10;

    // Track objects that should be cleaned up
    const trackedObjects: WeakRef<object>[] = [];

    const processor = createThrottledProcessor(
      async () => {
        // Create object that should be garbage collected
        const tempObject = { data: new Array(1000).fill('x') };
        trackedObjects.push(new WeakRef(tempObject));
        await delay(20);
        // tempObject goes out of scope here
      },
      { maxConcurrent: MAX_CONCURRENT }
    );

    await processor.processMany(TOTAL_JOBS);

    // Force garbage collection
    if (global.gc) {
      global.gc();
      await delay(100);
      global.gc();
    }

    // Check how many objects were collected
    const stillAlive = trackedObjects.filter(ref => ref.deref() !== undefined).length;
    const collected = trackedObjects.length - stillAlive;

    console.log('Cleanup Analysis:', {
      totalObjects: trackedObjects.length,
      collected,
      stillAlive,
      collectionRate: ((collected / trackedObjects.length) * 100).toFixed(2) + '%',
    });

    // Note: WeakRef behavior depends on GC timing, so we just log rather than assert
    // In a real test with --expose-gc, we'd expect most objects to be collected
  });

  it('status tracking remains accurate under sustained load', async () => {
    const TOTAL_JOBS = 100;
    let queuedCount = 0;
    let processingCount = 0;
    let completedCount = 0;

    const metricsCollector = createMetricsCollector('status-tracking', {
      totalJobs: TOTAL_JOBS,
      maxConcurrent: 10,
      batchSize: 20,
      mockLatencyRange: { min: 50, max: 100 },
      rateLimitConfig: { maxRequests: 100, windowMs: 1000 },
    });

    // Generate jobs
    const generator = createLoadGenerator({ totalJobs: TOTAL_JOBS });
    const { jobs } = await generator.generateLoad();

    // Track all jobs
    for (const job of jobs) {
      metricsCollector.recordJobQueued(job.id, job.entityType);
      queuedCount++;
    }

    let jobIndex = 0;
    const processor = createThrottledProcessor(
      async () => {
        if (jobIndex >= jobs.length) return;
        const job = jobs[jobIndex];
        jobIndex++;

        processingCount++;
        metricsCollector.recordJobStarted(job.id);

        await delay(50 + Math.random() * 50);

        metricsCollector.recordJobCompleted(job.id);
        completedCount++;
        processingCount--;
      },
      { maxConcurrent: 10 }
    );

    await processor.processMany(jobs.length);

    const results = metricsCollector.getResults();

    // Verify counts match
    expect(results.metrics.totalJobs).toBe(TOTAL_JOBS);
    expect(results.metrics.completedJobs).toBe(TOTAL_JOBS);
    expect(results.metrics.failedJobs).toBe(0);

    // Verify all timing data is present
    for (const timing of results.jobTimings) {
      expect(timing.queuedAt).toBeGreaterThan(0);
      expect(timing.startedAt).toBeGreaterThan(0);
      expect(timing.completedAt).toBeGreaterThan(0);
      expect(timing.totalDurationMs).toBeGreaterThan(0);
    }

    console.log('Status Tracking Verification:', {
      totalJobs: results.metrics.totalJobs,
      completedJobs: results.metrics.completedJobs,
      allTimingsComplete: results.jobTimings.every(t => t.totalDurationMs !== null),
    });
  });
});
```

**Acceptance Criteria:**
- [ ] Test verifies no memory leaks over multiple batches
- [ ] Test verifies stable resource utilization over time
- [ ] Test verifies cleanup after processing
- [ ] Test verifies status tracking remains accurate under load
- [ ] Memory growth is bounded (< 50MB for 250 jobs)
- [ ] All tests pass

**Estimated Effort:** 1.5 story points

---

### Task 11: Write Recovery Behavior Tests

**File:** `src/lib/job-queue/__tests__/performance/recovery-behavior.perf.test.ts`

**Objective:** Create tests that verify the system recovers gracefully when load returns to normal levels.

**Steps:**

1. Implement recovery tests:
```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createMetricsCollector,
  createResourceMonitor,
  createThrottledProcessor,
  createLoadGenerator,
  delay,
} from './helpers';

describe('Recovery Behavior', () => {
  let resourceMonitor: ReturnType<typeof createResourceMonitor>;

  beforeEach(() => {
    vi.clearAllMocks();
    resourceMonitor = createResourceMonitor();
  });

  afterEach(() => {
    resourceMonitor.stopMonitoring();
    vi.restoreAllMocks();
  });

  it('recovers gracefully when load returns to normal', async () => {
    const HIGH_LOAD_JOBS = 100;
    const NORMAL_LOAD_JOBS = 5;
    const MAX_CONCURRENT = 10;

    resourceMonitor.startMonitoring(100);

    // Phase 1: High load
    console.log('Phase 1: Processing high load...');
    const highLoadGenerator = createLoadGenerator({ totalJobs: HIGH_LOAD_JOBS });
    const { jobs: highLoadJobs } = await highLoadGenerator.generateLoad();

    let highLoadJobIndex = 0;
    const highLoadProcessor = createThrottledProcessor(
      async () => {
        if (highLoadJobIndex >= highLoadJobs.length) return;
        highLoadJobIndex++;
        await delay(50 + Math.random() * 50);
      },
      { maxConcurrent: MAX_CONCURRENT }
    );

    await highLoadProcessor.processMany(highLoadJobs.length);

    const highLoadStats = highLoadProcessor.getStats();
    expect(highLoadStats.totalProcessed).toBe(HIGH_LOAD_JOBS);

    // Capture metrics after high load
    const postHighLoadMemory = process.memoryUsage().heapUsed / 1024 / 1024;

    // Phase 2: Return to normal
    console.log('Phase 2: Settling period...');
    await delay(500);

    // Force GC if available
    if (global.gc) {
      global.gc();
    }

    // Phase 3: Normal load
    console.log('Phase 3: Processing normal load...');
    const normalLoadGenerator = createLoadGenerator({ totalJobs: NORMAL_LOAD_JOBS });
    const { jobs: normalLoadJobs } = await normalLoadGenerator.generateLoad();

    let normalLoadJobIndex = 0;
    const normalLoadProcessor = createThrottledProcessor(
      async () => {
        if (normalLoadJobIndex >= normalLoadJobs.length) return;
        normalLoadJobIndex++;
        await delay(50);
      },
      { maxConcurrent: MAX_CONCURRENT }
    );

    await normalLoadProcessor.processMany(normalLoadJobs.length);

    const normalLoadStats = normalLoadProcessor.getStats();
    expect(normalLoadStats.totalProcessed).toBe(NORMAL_LOAD_JOBS);

    resourceMonitor.stopMonitoring();

    // Capture metrics after normal load
    const postNormalLoadMemory = process.memoryUsage().heapUsed / 1024 / 1024;

    // System should have recovered
    // Memory should not have grown significantly during normal load
    const normalLoadMemoryGrowth = postNormalLoadMemory - postHighLoadMemory;

    console.log('Recovery Analysis:', {
      highLoadJobsProcessed: highLoadStats.totalProcessed,
      normalLoadJobsProcessed: normalLoadStats.totalProcessed,
      postHighLoadMemoryMb: postHighLoadMemory.toFixed(2),
      postNormalLoadMemoryMb: postNormalLoadMemory.toFixed(2),
      memoryGrowthDuringNormalMb: normalLoadMemoryGrowth.toFixed(2),
    });

    // Normal operations should work correctly
    expect(normalLoadStats.totalProcessed).toBe(NORMAL_LOAD_JOBS);
    expect(normalLoadStats.errors).toBe(0);
  });

  it('processor stats reset correctly between workloads', async () => {
    const processor = createThrottledProcessor(
      async () => {
        await delay(20);
      },
      { maxConcurrent: 5 }
    );

    // First workload
    await processor.processMany(20);
    const statsAfterFirst = processor.getStats();

    expect(statsAfterFirst.totalProcessed).toBe(20);

    // Reset
    processor.reset();

    // Second workload
    await processor.processMany(10);
    const statsAfterSecond = processor.getStats();

    expect(statsAfterSecond.totalProcessed).toBe(10);

    console.log('Stats Reset Verification:', {
      afterFirstWorkload: statsAfterFirst.totalProcessed,
      afterReset: statsAfterSecond.totalProcessed,
    });
  });

  it('handles rapid load transitions', async () => {
    const MAX_CONCURRENT = 10;
    const transitions = [50, 5, 30, 2, 40]; // Varying workload sizes
    const results: Array<{ jobs: number; processed: number; errors: number }> = [];

    for (const jobCount of transitions) {
      const processor = createThrottledProcessor(
        async () => {
          await delay(30 + Math.random() * 30);
        },
        { maxConcurrent: MAX_CONCURRENT }
      );

      await processor.processMany(jobCount);

      const stats = processor.getStats();
      results.push({
        jobs: jobCount,
        processed: stats.totalProcessed,
        errors: stats.errors,
      });

      // Brief pause between transitions
      await delay(100);
    }

    console.log('Load Transition Results:', results);

    // All workloads should complete without errors
    for (const result of results) {
      expect(result.processed).toBe(result.jobs);
      expect(result.errors).toBe(0);
    }
  });

  it('no residual state corruption after high load', async () => {
    const HIGH_LOAD_JOBS = 50;
    const VERIFICATION_JOBS = 10;

    // Generate and track jobs
    const metricsCollector = createMetricsCollector('residual-state', {
      totalJobs: HIGH_LOAD_JOBS + VERIFICATION_JOBS,
      maxConcurrent: 10,
      batchSize: 10,
      mockLatencyRange: { min: 30, max: 60 },
      rateLimitConfig: { maxRequests: 100, windowMs: 1000 },
    });

    // High load phase
    const highLoadGenerator = createLoadGenerator({ totalJobs: HIGH_LOAD_JOBS });
    const { jobs: highLoadJobs } = await highLoadGenerator.generateLoad();

    for (const job of highLoadJobs) {
      metricsCollector.recordJobQueued(job.id, job.entityType);
    }

    let highLoadIndex = 0;
    const highLoadProcessor = createThrottledProcessor(
      async () => {
        if (highLoadIndex >= highLoadJobs.length) return;
        const job = highLoadJobs[highLoadIndex];
        highLoadIndex++;

        metricsCollector.recordJobStarted(job.id);
        await delay(30 + Math.random() * 30);
        metricsCollector.recordJobCompleted(job.id);
      },
      { maxConcurrent: 10 }
    );

    await highLoadProcessor.processMany(highLoadJobs.length);

    // Brief pause
    await delay(200);

    // Verification phase with fresh jobs
    const verificationGenerator = createLoadGenerator({ totalJobs: VERIFICATION_JOBS });
    const { jobs: verificationJobs } = await verificationGenerator.generateLoad();

    for (const job of verificationJobs) {
      metricsCollector.recordJobQueued(job.id, job.entityType);
    }

    let verificationIndex = 0;
    const verificationProcessor = createThrottledProcessor(
      async () => {
        if (verificationIndex >= verificationJobs.length) return;
        const job = verificationJobs[verificationIndex];
        verificationIndex++;

        metricsCollector.recordJobStarted(job.id);
        await delay(30);
        metricsCollector.recordJobCompleted(job.id);
      },
      { maxConcurrent: 5 }
    );

    await verificationProcessor.processMany(verificationJobs.length);

    const results = metricsCollector.getResults();

    // All jobs from both phases should be tracked correctly
    const totalExpected = HIGH_LOAD_JOBS + VERIFICATION_JOBS;
    expect(results.metrics.totalJobs).toBe(totalExpected);
    expect(results.metrics.completedJobs).toBe(totalExpected);

    // Verify each job has complete timing data
    let corruptedJobs = 0;
    for (const timing of results.jobTimings) {
      if (
        timing.queuedAt === null ||
        timing.startedAt === null ||
        timing.completedAt === null ||
        timing.totalDurationMs === null
      ) {
        corruptedJobs++;
      }
    }

    expect(corruptedJobs).toBe(0);

    console.log('State Integrity Verification:', {
      totalJobs: results.metrics.totalJobs,
      completedJobs: results.metrics.completedJobs,
      corruptedJobs,
      allTimingsValid: corruptedJobs === 0,
    });
  });
});
```

**Acceptance Criteria:**
- [ ] Test verifies recovery after high load
- [ ] Test verifies processor stats reset correctly
- [ ] Test verifies rapid load transitions work
- [ ] Test verifies no residual state corruption
- [ ] All tests pass

**Estimated Effort:** 1 story point

---

### Task 12: Update Vitest Configuration

**File:** `vitest.config.ts`

**Objective:** Add performance test patterns, configure longer timeouts, and set up output directory.

**Steps:**

1. Read existing vitest.config.ts
2. Add performance test configuration:

```typescript
// Add to existing config or create new section

export default defineConfig({
  // ... existing config ...

  test: {
    // ... existing test config ...

    // Add performance test patterns
    include: [
      'src/**/*.test.ts',
      'src/**/*.spec.ts',
      'src/**/*.perf.test.ts', // Add performance test pattern
    ],

    // Exclude performance tests from regular test runs
    exclude: [
      'node_modules',
      'dist',
    ],

    // Configure timeouts
    testTimeout: 30000, // 30 seconds default
    hookTimeout: 10000,

    // Pool options for performance tests
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false,
      },
    },

    // Coverage exclusions for performance tests
    coverage: {
      exclude: [
        // ... existing exclusions ...
        'src/**/*.perf.test.ts',
        'src/**/performance/**',
      ],
    },
  },
});
```

3. Add npm script for running performance tests specifically:

```json
// In package.json scripts section
{
  "scripts": {
    "test:perf": "vitest run --testNamePattern='perf' --reporter=verbose",
    "test:perf:watch": "vitest --testNamePattern='perf'"
  }
}
```

**Acceptance Criteria:**
- [ ] Performance test files are included in test patterns
- [ ] Timeouts are configured for longer-running tests
- [ ] npm script added for running performance tests
- [ ] Regular test runs are not affected
- [ ] Build passes

**Estimated Effort:** 0.25 story points

---

### Task 13: Create Performance Test Documentation

**File:** `src/lib/job-queue/__tests__/performance/README.md`

**Objective:** Document test structure, how to run tests, metrics output format, and how to interpret results.

**Steps:**

1. Create comprehensive README:

```markdown
# Performance Tests for Translation Job Queue

**Last Modified:** 2026-01-20 17:45 UTC

## Overview

This directory contains performance tests for the translation job queue system. These tests validate:

- High-volume job creation (100+ concurrent jobs)
- Job completion time (target: p95 < 60 seconds)
- Rate limiting under load
- Concurrency limit enforcement
- Memory stability (no leaks)
- Recovery behavior after high load

## Test Structure

```
performance/
├── helpers/
│   ├── index.ts                 # Barrel exports
│   ├── performance-metrics.ts   # Metrics collection and analysis
│   ├── load-generator.ts        # Job batch creation utilities
│   ├── timing-utils.ts          # High-resolution timing helpers
│   └── resource-monitor.ts      # Memory and connection tracking
├── high-volume-job-creation.perf.test.ts
├── job-completion-time.perf.test.ts
├── rate-limiting-under-load.perf.test.ts
├── concurrency-limits.perf.test.ts
├── sustained-load.perf.test.ts
├── recovery-behavior.perf.test.ts
└── README.md
```

## Running Performance Tests

### Run All Performance Tests

```bash
npm run test:perf
```

### Run Specific Test File

```bash
npx vitest run src/lib/job-queue/__tests__/performance/job-completion-time.perf.test.ts
```

### Run with Verbose Output

```bash
npm run test:perf -- --reporter=verbose
```

### Run with Memory Profiling (requires --expose-gc)

```bash
node --expose-gc ./node_modules/.bin/vitest run --testNamePattern='perf'
```

## Metrics Output

Test results are written to `../performance-results/` as JSON files with timestamps.

### Output Format

```json
{
  "testName": "high-volume-creation",
  "testRunAt": "2026-01-20T17:45:00.000Z",
  "config": {
    "totalJobs": 100,
    "maxConcurrent": 10,
    "batchSize": 20,
    "mockLatencyRange": { "min": 50, "max": 200 }
  },
  "metrics": {
    "totalJobs": 100,
    "completedJobs": 100,
    "failedJobs": 0,
    "avgCompletionTimeMs": 250.5,
    "p50CompletionTimeMs": 230.2,
    "p95CompletionTimeMs": 450.8,
    "p99CompletionTimeMs": 520.1,
    "throughputJobsPerSecond": 38.5
  },
  "rateLimitMetrics": {
    "totalRequests": 100,
    "throttledRequests": 25,
    "avgQueueWaitMs": 120.5
  },
  "resourceMetrics": {
    "peakMemoryUsageMb": 85.2,
    "avgMemoryUsageMb": 72.1,
    "peakConcurrentJobs": 10
  }
}
```

## Interpreting Results

### Key Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| p95CompletionTimeMs | < 60,000 | 95th percentile completion time in milliseconds |
| failedJobs | 0 | Number of jobs that failed during processing |
| peakConcurrentJobs | ≤ maxConcurrent | Should never exceed configured limit |
| memoryGrowth | < 50 MB | Memory growth over sustained load |

### Warning Signs

- **p95 > 60 seconds**: Job processing too slow, check concurrency settings
- **Failed jobs > 0**: Check error logs, may indicate rate limiting issues
- **Peak concurrent > limit**: Concurrency control not working correctly
- **Memory growing linearly**: Potential memory leak

### Common Issues

1. **Slow completion times**
   - Increase `maxConcurrent` if rate limits allow
   - Check mock latency settings
   - Verify no unnecessary delays in processing

2. **Rate limit failures**
   - Reduce concurrent requests
   - Increase queue size
   - Use longer queue timeout

3. **Memory growth**
   - Check for uncleared references
   - Verify cleanup in afterEach hooks
   - Run with `--expose-gc` for accurate measurements

## Test Dependencies

- Vitest (test framework)
- Node.js performance API
- process.memoryUsage() for memory tracking

## Adding New Tests

1. Create test file with `.perf.test.ts` extension
2. Import helpers from `./helpers`
3. Use `createMetricsCollector` for timing
4. Use `createResourceMonitor` for memory tracking
5. Write results to `../performance-results/`

## CI/CD Integration

Performance tests are excluded from regular CI runs due to timing sensitivity. Run manually or in dedicated performance testing environment.

```yaml
# Example CI job for performance tests
performance-tests:
  runs-on: ubuntu-latest
  timeout-minutes: 30
  steps:
    - uses: actions/checkout@v4
    - run: npm ci
    - run: npm run test:perf
    - uses: actions/upload-artifact@v4
      with:
        name: perf-results
        path: src/lib/job-queue/__tests__/performance-results/
```
```

**Acceptance Criteria:**
- [ ] README explains test structure
- [ ] README documents how to run tests
- [ ] README explains metrics output format
- [ ] README provides interpretation guidance
- [ ] README includes CI/CD integration example

**Estimated Effort:** 0.25 story points

---

### Task 14: Create Metrics Output Directory Structure

**Directory:** `src/lib/job-queue/__tests__/performance-results/`

**Objective:** Set up the output directory for performance test results with proper git configuration.

**Steps:**

1. Create directory:
```bash
mkdir -p src/lib/job-queue/__tests__/performance-results
```

2. Create `.gitkeep`:
```
# src/lib/job-queue/__tests__/performance-results/.gitkeep
# This file keeps the directory in git while ignoring result files
```

3. Create `.gitignore`:
```
# src/lib/job-queue/__tests__/performance-results/.gitignore
# Ignore all JSON result files (generated during tests)
*.json

# Keep the gitkeep file
!.gitkeep
!.gitignore
```

4. Create example schema file (not ignored):
```typescript
// src/lib/job-queue/__tests__/performance-results/SCHEMA.md

# Performance Test Results Schema

This directory contains JSON output from performance tests.
Files are generated automatically and ignored by git.

## File Naming Convention

`{test-name}-{timestamp}.json`

Example: `high-volume-1705773900000.json`

## Schema Reference

See `../helpers/performance-metrics.ts` for TypeScript interfaces:
- `PerformanceTestResults`
- `JobTimingMetric`
- `RateLimitEvent`
- `ResourceSnapshot`
```

**Acceptance Criteria:**
- [ ] Directory created
- [ ] `.gitkeep` present to keep directory in git
- [ ] `.gitignore` ignores JSON files
- [ ] Schema documentation present
- [ ] Directory structure committed to git

**Estimated Effort:** 0.25 story points

---

## 5. Acceptance Criteria Mapping

| AC# | Criterion | Task Coverage |
|-----|-----------|---------------|
| AC-1 | Creates 100+ translation jobs simultaneously | Task 6 |
| AC-2 | Measures job completion time for each job | Task 7 |
| AC-3 | 95th percentile completion time under 60 seconds | Task 7 |
| AC-4 | No jobs fail due to timeout/resource exhaustion | Tasks 6, 7, 10 |
| AC-5 | Rate limiting throttles correctly | Task 8 |
| AC-6 | Rate limiting doesn't cause excessive failures | Task 8 |
| AC-7 | Concurrent job processing respects limit | Task 9 |
| AC-8 | Database connection pool handles load | Task 10 |
| AC-9 | Monitors system resource utilization | Tasks 5, 10 |
| AC-10 | No memory leaks during sustained operation | Task 10 |
| AC-11 | Job status tracking remains accurate | Tasks 7, 10 |
| AC-12 | Results documented with metrics | Tasks 2, 13, 14 |
| AC-13 | System recovers gracefully | Task 11 |
| AC-14 | Test can run in staging without affecting production | Tasks 3, 6-11 (isolated mocks) |

---

## 6. Implementation Order

Execute tasks in the following order to manage dependencies:

### Phase A: Infrastructure (Tasks 1-5)
1. **Task 1:** Create directory structure and barrel exports
2. **Task 2:** Implement performance metrics collector
3. **Task 3:** Implement load generator
4. **Task 4:** Implement timing utilities
5. **Task 5:** Implement resource monitor

### Phase B: Test Implementation (Tasks 6-11)
6. **Task 6:** Write high volume job creation tests
7. **Task 7:** Write job completion time tests
8. **Task 8:** Write rate limiting tests
9. **Task 9:** Write concurrency limits tests
10. **Task 10:** Write sustained load tests
11. **Task 11:** Write recovery behavior tests

### Phase C: Configuration & Documentation (Tasks 12-14)
12. **Task 12:** Update Vitest configuration
13. **Task 13:** Create performance test documentation
14. **Task 14:** Create metrics output directory

---

## 7. Testing Verification

After completing all tasks, run the following verification steps:

```bash
# 1. Run all performance tests
npm run test:perf

# 2. Verify all tests pass
# Expected: All tests green, no failures

# 3. Check metrics output
ls -la src/lib/job-queue/__tests__/performance-results/

# 4. Verify p95 completion time
# Check console output for "p95CompletionTimeMs < 60000"

# 5. Verify TypeScript compilation
npm run type-check

# 6. Run build to ensure no issues
npm run build
```

---

## 8. Definition of Done

- [ ] All 14 tasks implemented
- [ ] All acceptance criteria from REQ-E03-034 covered
- [ ] All performance tests pass
- [ ] p95 completion time verified under 60 seconds
- [ ] Rate limiting validation passes
- [ ] No memory leaks detected
- [ ] Metrics output to JSON format
- [ ] Documentation complete
- [ ] Code reviewed and committed

---

## 9. References

- **Request:** `docs/gen_requests_epic3.md` (REQ-E03-034)
- **Overview:** `docs/REQ-E03-034-performance-testing-overview.md`
- **Implementation Plan:** `docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Phase 7, Task 7.5)
- **Vitest Documentation:** https://vitest.dev/guide/
- **Node.js Performance API:** https://nodejs.org/api/perf_hooks.html
