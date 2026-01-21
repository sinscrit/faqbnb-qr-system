/**
 * Job Completion Time Performance Tests
 *
 * Tests that measure job completion times and verify p95 is under 60 seconds.
 *
 * @module job-queue/__tests__/performance/job-completion-time.perf.test
 * @lastModified 2026-01-21
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createLoadGenerator,
  createMetricsCollector,
  createResourceMonitor,
  createThrottledProcessor,
  delay,
} from './helpers';
import type { TestConfiguration } from './helpers';
import * as fs from 'fs/promises';
import * as path from 'path';

// ============================================================================
// Test Configuration
// ============================================================================

const RESULTS_DIR = path.join(__dirname, '../performance-results');

// ============================================================================
// Mock Functions
// ============================================================================

/**
 * Mock translation function with realistic latency.
 */
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

// ============================================================================
// Test Suite
// ============================================================================

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
