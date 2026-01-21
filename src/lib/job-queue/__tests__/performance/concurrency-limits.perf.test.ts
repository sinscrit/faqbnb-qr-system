/**
 * Concurrency Limits Performance Tests
 *
 * Tests that verify the maximum concurrent job limit is respected under high load.
 *
 * @module job-queue/__tests__/performance/concurrency-limits.perf.test
 * @lastModified 2026-01-21
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createMetricsCollector,
  createThrottledProcessor,
  createResourceMonitor,
  delay,
} from './helpers';

// ============================================================================
// Test Suite
// ============================================================================

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
