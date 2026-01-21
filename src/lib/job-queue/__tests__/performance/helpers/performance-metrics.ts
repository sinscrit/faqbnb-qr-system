/**
 * Performance Metrics Collector
 *
 * Tracks job timing, calculates percentiles, and aggregates performance results.
 *
 * @module job-queue/__tests__/performance/helpers/performance-metrics
 * @lastModified 2026-01-21
 */

// ============================================================================
// Type Definitions
// ============================================================================

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

export interface RateLimitEvent {
  timestamp: number;
  action: 'immediate' | 'queued' | 'rejected';
  queueSize: number;
  waitTimeMs?: number;
}

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

// ============================================================================
// Performance Metrics Collector Class
// ============================================================================

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

// ============================================================================
// Factory Function
// ============================================================================

export function createMetricsCollector(
  testName: string,
  config: TestConfiguration
): PerformanceMetricsCollector {
  return new PerformanceMetricsCollector(testName, config);
}
