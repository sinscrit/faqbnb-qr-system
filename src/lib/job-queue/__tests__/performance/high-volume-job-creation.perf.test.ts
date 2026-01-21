/**
 * High Volume Job Creation Performance Tests
 *
 * Tests that verify the system can create 100+ translation jobs
 * simultaneously without failures.
 *
 * @module job-queue/__tests__/performance/high-volume-job-creation.perf.test
 * @lastModified 2026-01-21
 */

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

// ============================================================================
// Test Configuration
// ============================================================================

const RESULTS_DIR = path.join(__dirname, '../performance-results');

// ============================================================================
// Helper Functions
// ============================================================================

async function writeResults(results: PerformanceTestResults): Promise<void> {
  const filename = `high-volume-${Date.now()}.json`;
  await fs.mkdir(RESULTS_DIR, { recursive: true });
  await fs.writeFile(
    path.join(RESULTS_DIR, filename),
    JSON.stringify(results, null, 2)
  );
}

// ============================================================================
// Test Suite
// ============================================================================

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
      // Each type should be approximately 25% (10-40% range for 100 jobs)
      // Wider tolerance accounts for random distribution variance
      expect(jobsByType[type]).toBeGreaterThanOrEqual(10);
      expect(jobsByType[type]).toBeLessThanOrEqual(40);
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
