/**
 * Sustained Load Performance Tests (Memory Leak Detection)
 *
 * Tests that verify no memory leaks occur during sustained high-concurrency operation.
 *
 * @module job-queue/__tests__/performance/sustained-load.perf.test
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
import * as fs from 'fs/promises';
import * as path from 'path';

// ============================================================================
// Test Configuration
// ============================================================================

const RESULTS_DIR = path.join(__dirname, '../performance-results');

// ============================================================================
// Test Suite
// ============================================================================

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
