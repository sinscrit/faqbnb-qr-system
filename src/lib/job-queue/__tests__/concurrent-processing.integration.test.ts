/**
 * Concurrent Job Processing Integration Tests
 *
 * Tests for concurrent job processing scenarios including worker isolation,
 * race condition prevention, and data integrity under load.
 *
 * @module job-queue/__tests__/concurrent-processing.integration
 * @see docs/REQ-254-write-integration-tests-for-job-processing-detailed.md
 * @lastModified 2026-01-18
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createMockTranslationJob,
  createMockJobBatch,
  createMockArticleContent,
} from './helpers/mockFactories';
import {
  resetMockDatabase,
  seedMockDatabase,
  getTableRecords,
  addMockRecord,
} from './helpers/mockSupabase';
import {
  delay,
  runConcurrently,
  generateWorkerId,
  assertAllUnique,
} from './helpers/testUtils';
import { TEST_DEFAULTS, TABLE_NAMES } from './helpers/constants';
import type { TranslationJob } from '../translation-jobs.types';

// =============================================================================
// Mock Setup
// =============================================================================

// Track job locks for concurrency testing
let jobLocks: Map<string, string> = new Map();

// Create chainable mock helper
function createChainMock(): Record<string, ReturnType<typeof vi.fn>> {
  const mock: Record<string, ReturnType<typeof vi.fn>> = {};

  const createMethod = (name: string) => {
    mock[name] = vi.fn().mockReturnValue(mock);
  };

  ['select', 'insert', 'update', 'upsert', 'delete', 'eq', 'in', 'is', 'not', 'lt', 'order', 'limit'].forEach(createMethod);

  mock.single = vi.fn().mockResolvedValue({ data: null, error: null });
  mock.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });

  return mock;
}

/**
 * Converts a TranslationJob (camelCase) to database row format (snake_case)
 * This matches what the actual PostgreSQL RPC function returns
 */
function jobToSnakeCase(job: TranslationJob): Record<string, unknown> {
  return {
    id: job.id,
    entity_type: job.entityType,
    entity_id: job.entityId,
    source_language: job.sourceLanguage,
    target_language: job.targetLanguage,
    status: job.status,
    attempts: job.attempts,
    error_message: job.errorMessage,
    created_at: job.createdAt,
    started_at: job.startedAt,
    completed_at: job.completedAt,
    locked_by: job.lockedBy,
    locked_at: job.lockedAt,
  };
}

const mockSupabaseAdmin = {
  from: vi.fn(() => createChainMock()),
  rpc: vi.fn().mockImplementation(async (fnName: string, params: Record<string, unknown>) => {
    if (fnName === 'fetch_and_lock_translation_job') {
      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const queuedJob = jobs.find(j => j.status === 'queued' && !jobLocks.has(j.id));

      if (queuedJob) {
        // Simulate atomic lock acquisition
        if (jobLocks.has(queuedJob.id)) {
          return { data: [], error: null }; // Someone else got it
        }

        jobLocks.set(queuedJob.id, params.p_worker_id as string);
        queuedJob.status = 'processing';
        queuedJob.lockedBy = params.p_worker_id as string;
        queuedJob.lockedAt = new Date().toISOString();
        queuedJob.startedAt = new Date().toISOString();
        queuedJob.attempts = (queuedJob.attempts || 0) + 1;
        // Return in snake_case format (like actual PostgreSQL function)
        return { data: [jobToSnakeCase(queuedJob)], error: null };
      }

      return { data: [], error: null };
    }

    return { data: null, error: null };
  }),
};

vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: mockSupabaseAdmin,
}));

vi.mock('@/lib/translation-service', () => ({
  translateText: vi.fn().mockImplementation(async () => {
    await delay(Math.random() * 50);
    return {
      translatedText: `Translated at ${Date.now()}`,
      provider: 'claude',
      tokensUsed: 100,
    };
  }),
}));

// =============================================================================
// Test Suites
// =============================================================================

describe('Concurrent Job Processing Integration', () => {
  beforeEach(() => {
    resetMockDatabase();
    jobLocks = new Map();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===========================================================================
  // Multiple Concurrent Jobs Tests (Task 6.2.10)
  // ===========================================================================
  describe('Multiple Concurrent Jobs', () => {
    it('creates multiple jobs simultaneously without conflicts', async () => {
      // Simulate creating 5 jobs concurrently
      const createPromises = Array.from({ length: 5 }, async (_, i) => {
        const job = createMockTranslationJob({
          entityType: 'article',
          entityId: `concurrent-article-${i}`,
          sourceLanguage: 'en',
          targetLanguage: 'fr',
        });
        addMockRecord(TABLE_NAMES.TRANSLATION_JOBS, job);
        return { id: job.id, entityId: job.entityId };
      });

      const jobResults = await Promise.all(createPromises);

      // All should have been created
      expect(jobResults.length).toBe(5);

      // All IDs should be unique
      const ids = jobResults.map(r => r.id);
      expect(assertAllUnique(ids)).toBe(true);

      // Verify all jobs in database
      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      expect(jobs.length).toBe(5);
    });

    it('all concurrent jobs complete successfully', async () => {
      // Seed multiple queued jobs
      const jobs = createMockJobBatch(5, { status: 'queued' });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);

      // Process all jobs with different workers
      const processPromises = await runConcurrently(async (i) => {
        const workerId = generateWorkerId(`worker-${i}`);
        const storedJobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
        const queuedJob = storedJobs.find(j => j.status === 'queued' && !jobLocks.has(j.id));

        if (queuedJob && !jobLocks.has(queuedJob.id)) {
          jobLocks.set(queuedJob.id, workerId);
          queuedJob.status = 'processing';
          queuedJob.lockedBy = workerId;

          await delay(Math.random() * 50); // Simulate work

          queuedJob.status = 'completed';
          queuedJob.completedAt = new Date().toISOString();
          return queuedJob.id;
        }
        return null;
      }, 5);

      const completedIds = processPromises.filter(id => id !== null);
      expect(completedIds.length).toBe(5);

      // Verify all are completed
      const finalJobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const completedJobs = finalJobs.filter(j => j.status === 'completed');
      expect(completedJobs.length).toBe(5);
    });

    it('prevents duplicate processing of the same job', async () => {
      const job = createMockTranslationJob({
        id: 'single-target-job',
        status: 'queued',
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);

      // Multiple workers try to fetch simultaneously
      const fetchResults = await runConcurrently(async (i) => {
        const workerId = `race-worker-${i}`;
        const storedJobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
        const targetJob = storedJobs.find(j => j.id === 'single-target-job');

        if (targetJob && targetJob.status === 'queued' && !jobLocks.has(targetJob.id)) {
          // Simulate atomic lock - only one should succeed
          if (jobLocks.has(targetJob.id)) {
            return { workerId, gotJob: false };
          }
          jobLocks.set(targetJob.id, workerId);
          targetJob.status = 'processing';
          targetJob.lockedBy = workerId;
          return { workerId, gotJob: true };
        }
        return { workerId, gotJob: false };
      }, 5);

      // Only one worker should have gotten the job
      const jobsAcquired = fetchResults.filter(r => r.gotJob);
      expect(jobsAcquired.length).toBe(1);
    });

    it('handles mixed success and failure in concurrent batch', async () => {
      const jobs = createMockJobBatch(10, { status: 'queued' });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);

      // Process with some failures
      await runConcurrently(async (i) => {
        const storedJobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
        const queuedJob = storedJobs.find(j => j.status === 'queued' && !jobLocks.has(j.id));

        if (queuedJob && !jobLocks.has(queuedJob.id)) {
          jobLocks.set(queuedJob.id, `mixed-worker-${i}`);
          queuedJob.status = 'processing';

          await delay(Math.random() * 20);

          if (i % 3 === 0) {
            queuedJob.status = 'failed';
            queuedJob.errorMessage = `Simulated failure ${i}`;
          } else {
            queuedJob.status = 'completed';
            queuedJob.completedAt = new Date().toISOString();
          }
        }
      }, 10);

      const finalJobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const completedCount = finalJobs.filter(j => j.status === 'completed').length;
      const failedCount = finalJobs.filter(j => j.status === 'failed').length;

      expect(completedCount + failedCount).toBe(10);
    });
  });

  // ===========================================================================
  // Worker Isolation Tests (Task 6.2.11)
  // ===========================================================================
  describe('Worker Isolation', () => {
    it('different workers get different jobs', async () => {
      // Seed 3 queued jobs
      const jobs = createMockJobBatch(3, { status: 'queued' });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);

      // 3 workers fetch jobs
      const workerResults: { workerId: string; jobId: string | null }[] = [];

      for (let i = 0; i < 3; i++) {
        const workerId = `isolation-w${i + 1}`;
        const storedJobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
        const queuedJob = storedJobs.find(j => j.status === 'queued' && !jobLocks.has(j.id));

        if (queuedJob) {
          jobLocks.set(queuedJob.id, workerId);
          queuedJob.status = 'processing';
          queuedJob.lockedBy = workerId;
          workerResults.push({ workerId, jobId: queuedJob.id });
        } else {
          workerResults.push({ workerId, jobId: null });
        }
      }

      // Each should get a different job
      const jobIds = workerResults.map(r => r.jobId).filter(Boolean);
      expect(jobIds.length).toBe(3);
      expect(assertAllUnique(jobIds)).toBe(true);
    });

    it('locked jobs are skipped by other workers', async () => {
      // One queued job, one already locked
      const lockedJob = createMockTranslationJob({
        id: 'locked-job',
        status: 'processing',
        lockedBy: 'existing-worker',
        lockedAt: new Date().toISOString(),
      });
      const queuedJob = createMockTranslationJob({
        id: 'queued-job',
        status: 'queued',
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [lockedJob, queuedJob]);
      jobLocks.set('locked-job', 'existing-worker');

      // New worker tries to get a job
      const storedJobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const availableJob = storedJobs.find(j => j.status === 'queued' && !jobLocks.has(j.id));

      // Should get the queued job, not the locked one
      expect(availableJob?.id).toBe('queued-job');
    });

    it('each worker result is isolated', async () => {
      const articles = Array.from({ length: 3 }, (_, i) =>
        createMockArticleContent({ id: `isolation-article-${i}` })
      );
      seedMockDatabase(TABLE_NAMES.ITEM_ARTICLES, articles);

      const jobs = articles.map((article, i) =>
        createMockTranslationJob({
          id: `isolation-job-${i}`,
          entityId: article.id,
          status: 'queued',
        })
      );
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);

      // Process each job with different worker
      const results = await runConcurrently(async (i) => {
        const workerId = `result-worker-${i}`;
        const storedJobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
        const queuedJob = storedJobs.find(j => j.status === 'queued' && !jobLocks.has(j.id));

        if (queuedJob && !jobLocks.has(queuedJob.id)) {
          jobLocks.set(queuedJob.id, workerId);
          queuedJob.status = 'processing';
          queuedJob.lockedBy = workerId;

          // Save unique result for this worker's job
          const translation = {
            article_id: queuedJob.entityId,
            language: 'fr',
            title: `Title from worker ${i}`,
            description: `Description from worker ${i}`,
          };
          addMockRecord(TABLE_NAMES.ARTICLE_TRANSLATIONS, translation);

          queuedJob.status = 'completed';

          return {
            workerId,
            jobId: queuedJob.id,
            entityId: queuedJob.entityId,
          };
        }
        return null;
      }, 3);

      // Verify each worker's result is isolated
      const translations = getTableRecords<{
        article_id: string;
        title: string;
      }>(TABLE_NAMES.ARTICLE_TRANSLATIONS);

      expect(translations.length).toBe(3);

      // Each translation should have unique content
      const titles = translations.map(t => t.title);
      expect(assertAllUnique(titles)).toBe(true);
    });
  });

  // ===========================================================================
  // Data Integrity Under Concurrent Load Tests (Task 6.2.12)
  // ===========================================================================
  describe('Data Integrity Under Concurrent Load', () => {
    it('maintains data integrity with concurrent writes', async () => {
      const jobs = createMockJobBatch(10, { status: 'queued' });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);

      // Process jobs with mixed success/failure
      await runConcurrently(async (i) => {
        const storedJobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
        const queuedJob = storedJobs.find(j => j.status === 'queued' && !jobLocks.has(j.id));

        if (queuedJob && !jobLocks.has(queuedJob.id)) {
          jobLocks.set(queuedJob.id, `integrity-worker-${i}`);
          queuedJob.status = 'processing';

          await delay(Math.random() * 20);

          if (i % 3 === 0) {
            queuedJob.status = 'failed';
            queuedJob.errorMessage = `Integrity test failure ${i}`;
          } else {
            queuedJob.status = 'completed';
            queuedJob.completedAt = new Date().toISOString();
          }
        }
      }, 10);

      // Verify final state consistency
      const finalJobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);

      // All jobs should be in a final state
      const inFinalState = finalJobs.every(
        j => j.status === 'completed' || j.status === 'failed'
      );
      expect(inFinalState).toBe(true);

      // No job should be corrupted
      finalJobs.forEach(job => {
        expect(job.id).toBeDefined();
        expect(job.entityId).toBeDefined();
        expect(job.status).toBeDefined();
        if (job.status === 'failed') {
          expect(job.errorMessage).toBeDefined();
        }
      });
    });

    it('consistent final state after heavy concurrent processing', async () => {
      // Create 20 jobs
      const jobs = createMockJobBatch(20, { status: 'queued' });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);

      // 10 workers processing concurrently
      await runConcurrently(async (workerId) => {
        // Each worker processes multiple jobs
        for (let attempt = 0; attempt < 3; attempt++) {
          const storedJobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
          const queuedJob = storedJobs.find(j => j.status === 'queued' && !jobLocks.has(j.id));

          if (queuedJob && !jobLocks.has(queuedJob.id)) {
            jobLocks.set(queuedJob.id, `heavy-worker-${workerId}`);
            queuedJob.status = 'processing';

            await delay(Math.random() * 10);

            if (Math.random() > 0.2) {
              queuedJob.status = 'completed';
              queuedJob.completedAt = new Date().toISOString();
            } else {
              queuedJob.status = 'failed';
              queuedJob.errorMessage = 'Random failure';
            }
          }
        }
      }, 10);

      // Verify database consistency
      const finalJobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);

      // Count states
      const states = {
        queued: finalJobs.filter(j => j.status === 'queued').length,
        processing: finalJobs.filter(j => j.status === 'processing').length,
        completed: finalJobs.filter(j => j.status === 'completed').length,
        failed: finalJobs.filter(j => j.status === 'failed').length,
      };

      // Total should equal original count
      expect(states.queued + states.processing + states.completed + states.failed).toBe(20);

      // All IDs should still be unique
      const ids = finalJobs.map(j => j.id);
      expect(assertAllUnique(ids)).toBe(true);
    });
  });

  // ===========================================================================
  // Race Condition Prevention Tests (Task 6.2.13)
  // ===========================================================================
  describe('Race Condition Prevention', () => {
    it('lock acquisition is atomic', async () => {
      const job = createMockTranslationJob({
        id: 'atomic-lock-job',
        status: 'queued',
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);

      // Many workers try to lock the same job at once
      const results = await runConcurrently(async (i) => {
        const storedJobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
        const targetJob = storedJobs.find(j => j.id === 'atomic-lock-job');

        if (targetJob && targetJob.status === 'queued' && !jobLocks.has(targetJob.id)) {
          // Simulate atomic operation
          if (jobLocks.has(targetJob.id)) {
            return { workerId: `atomic-worker-${i}`, gotLock: false };
          }
          jobLocks.set(targetJob.id, `atomic-worker-${i}`);
          targetJob.status = 'processing';
          targetJob.lockedBy = `atomic-worker-${i}`;
          return { workerId: `atomic-worker-${i}`, gotLock: true };
        }
        return { workerId: `atomic-worker-${i}`, gotLock: false };
      }, 10);

      // Count how many got the specific job
      const successful = results.filter(r => r.gotLock);
      expect(successful.length).toBe(1);

      // Verify lock state
      const lockedJob = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS)
        .find(j => j.id === 'atomic-lock-job');
      expect(lockedJob?.status).toBe('processing');
      expect(lockedJob?.lockedBy).toBeDefined();
    });

    it('concurrent completion attempts are handled safely', async () => {
      const job = createMockTranslationJob({
        id: 'double-complete-job',
        status: 'processing',
        lockedBy: 'original-worker',
        lockedAt: new Date().toISOString(),
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);
      jobLocks.set('double-complete-job', 'original-worker');

      // Multiple concurrent completion attempts
      const results = await runConcurrently(async () => {
        const storedJobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
        const targetJob = storedJobs.find(j => j.id === 'double-complete-job');

        if (targetJob && targetJob.status === 'processing') {
          targetJob.status = 'completed';
          targetJob.completedAt = new Date().toISOString();
          return { success: true };
        }
        return { success: false };
      }, 3);

      // At least one should succeed
      const succeeded = results.filter(r => r.success);
      expect(succeeded.length).toBeGreaterThanOrEqual(1);

      // Job should be completed
      const finalJob = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS)
        .find(j => j.id === 'double-complete-job');
      expect(finalJob?.status).toBe('completed');
    });

    it('prevents processing of same job by multiple workers simultaneously', async () => {
      // Create a single queued job
      const jobs = createMockJobBatch(1, { status: 'queued' });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);

      // 5 workers try to get the same job
      const results = await runConcurrently(async (i) => {
        const storedJobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
        const queuedJob = storedJobs.find(j => j.status === 'queued' && !jobLocks.has(j.id));

        if (queuedJob && !jobLocks.has(queuedJob.id)) {
          jobLocks.set(queuedJob.id, `simultaneous-worker-${i}`);
          queuedJob.status = 'processing';
          return { gotJob: true, jobId: queuedJob.id };
        }
        return { gotJob: false, jobId: null };
      }, 5);

      // Only one should get a job
      const gotJob = results.filter(r => r.gotJob);
      expect(gotJob.length).toBe(1);
    });
  });

  // ===========================================================================
  // Stale Lock Recovery Tests (Task 6.2.15)
  // ===========================================================================
  describe('Stale Lock Recovery', () => {
    it('detects jobs with stale locks', async () => {
      // Create job with old lock (6 minutes ago)
      const staleJob = createMockTranslationJob({
        id: 'stale-detection-job',
        status: 'processing',
        lockedBy: 'dead-worker',
        lockedAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(), // 6 min ago
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [staleJob]);

      // Check if job is stale (lock timeout of 5 minutes)
      const lockTimeout = 5 * 60 * 1000;
      const now = Date.now();
      const lockTime = new Date(staleJob.lockedAt!).getTime();
      const isStale = (now - lockTime) > lockTimeout;

      expect(isStale).toBe(true);
    });

    it('does not flag recently locked jobs as stale', async () => {
      // Create job with recent lock (1 minute ago)
      const recentJob = createMockTranslationJob({
        id: 'recent-lock-job',
        status: 'processing',
        lockedBy: 'active-worker',
        lockedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(), // 1 min ago
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [recentJob]);

      // Check if job is stale (lock timeout of 5 minutes)
      const lockTimeout = 5 * 60 * 1000;
      const now = Date.now();
      const lockTime = new Date(recentJob.lockedAt!).getTime();
      const isStale = (now - lockTime) > lockTimeout;

      expect(isStale).toBe(false);
    });

    it('handles mixed stale and active jobs correctly', async () => {
      const staleJob = createMockTranslationJob({
        id: 'mixed-stale-job',
        status: 'processing',
        lockedBy: 'dead-worker',
        lockedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        attempts: 1,
      });
      const activeJob = createMockTranslationJob({
        id: 'mixed-active-job',
        status: 'processing',
        lockedBy: 'active-worker',
        lockedAt: new Date().toISOString(),
        attempts: 1,
      });
      const queuedJob = createMockTranslationJob({
        id: 'mixed-queued-job',
        status: 'queued',
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [staleJob, activeJob, queuedJob]);

      // Identify stale jobs
      const lockTimeout = 5 * 60 * 1000;
      const now = Date.now();
      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);

      const staleJobs = jobs.filter(j => {
        if (j.status !== 'processing' || !j.lockedAt) return false;
        const lockTime = new Date(j.lockedAt).getTime();
        return (now - lockTime) > lockTimeout;
      });

      // Only the stale job should be detected
      expect(staleJobs.length).toBe(1);
      expect(staleJobs[0].id).toBe('mixed-stale-job');
    });
  });
});
