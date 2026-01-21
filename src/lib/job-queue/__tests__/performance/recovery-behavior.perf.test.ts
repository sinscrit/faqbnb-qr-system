/**
 * Recovery Behavior Performance Tests
 *
 * Tests that verify the system recovers gracefully when load returns to normal levels.
 *
 * @module job-queue/__tests__/performance/recovery-behavior.perf.test
 * @lastModified 2026-01-21
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createMetricsCollector,
  createResourceMonitor,
  createThrottledProcessor,
  createLoadGenerator,
  delay,
} from './helpers';

// ============================================================================
// Test Suite
// ============================================================================

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
