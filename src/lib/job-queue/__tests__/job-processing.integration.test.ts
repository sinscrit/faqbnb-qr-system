/**
 * Job Processing Integration Tests
 *
 * Comprehensive integration tests for the translation job processing system.
 * Tests job lifecycle, state transitions, and completion flows.
 *
 * @module job-queue/__tests__/job-processing.integration
 * @see docs/REQ-254-write-integration-tests-for-job-processing-detailed.md
 * @lastModified 2026-01-18
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createMockTranslationJob,
  createMockArticleContent,
} from './helpers/mockFactories';
import {
  resetMockDatabase,
  seedMockDatabase,
  getTableRecords,
  addMockRecord,
} from './helpers/mockSupabase';
import { TEST_DEFAULTS, TABLE_NAMES, MOCK_TRANSLATIONS } from './helpers/constants';
import type { TranslationJob } from '../translation-jobs.types';

// =============================================================================
// Mock Setup
// =============================================================================

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

// Create mock supabase client
const mockSupabaseAdmin = {
  from: vi.fn(() => createChainMock()),
  rpc: vi.fn().mockImplementation(async (fnName: string, params: Record<string, unknown>) => {
    if (fnName === 'fetch_and_lock_translation_job') {
      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const queuedJob = jobs.find(j => j.status === 'queued');

      if (queuedJob) {
        // Update the in-memory job
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

// Mock the supabase module
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: mockSupabaseAdmin,
}));

// Mock the translation service
vi.mock('@/lib/translation-service', () => ({
  translateText: vi.fn().mockResolvedValue({
    translatedText: 'Texte traduit',
    provider: 'claude',
    tokensUsed: 100,
  }),
  translateToAllLanguages: vi.fn().mockResolvedValue({
    translations: MOCK_TRANSLATIONS,
    provider: 'claude',
    totalTokensUsed: 600,
  }),
}));

// =============================================================================
// Test Suites
// =============================================================================

describe('Translation Job Processing Integration', () => {
  beforeEach(() => {
    resetMockDatabase();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===========================================================================
  // Job Creation Tests (Task 6.2.6)
  // ===========================================================================
  describe('Job Creation and Initial State', () => {
    it('creates job with queued status', async () => {
      // Setup mock to return the created job
      const mockChain = createChainMock();
      mockChain.upsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'test-job-1',
              entity_type: 'article',
              entity_id: 'article-123',
              source_language: 'en',
              target_language: 'fr',
              status: 'queued',
              attempts: 0,
              created_at: new Date().toISOString(),
            },
            error: null,
          }),
        }),
      });
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { createTranslationJob } = await import('../translation-jobs');

      const result = await createTranslationJob({
        entityType: 'article',
        entityId: 'article-123',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.status).toBe('queued');
      expect(result.data?.attempts).toBe(0);
    });

    it('creates job with correct entity reference', async () => {
      const mockChain = createChainMock();
      mockChain.upsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'test-job-2',
              entity_type: 'item',
              entity_id: 'item-456',
              source_language: 'en',
              target_language: 'es',
              status: 'queued',
              attempts: 0,
              created_at: new Date().toISOString(),
            },
            error: null,
          }),
        }),
      });
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { createTranslationJob } = await import('../translation-jobs');

      const result = await createTranslationJob({
        entityType: 'item',
        entityId: 'item-456',
        sourceLanguage: 'en',
        targetLanguage: 'es',
      });

      expect(result.data?.entityType).toBe('item');
      expect(result.data?.entityId).toBe('item-456');
      expect(result.data?.sourceLanguage).toBe('en');
      expect(result.data?.targetLanguage).toBe('es');
    });

    it('sets timestamps correctly on creation', async () => {
      const beforeCreate = new Date().toISOString();
      const mockChain = createChainMock();
      mockChain.upsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'test-job-3',
              entity_type: 'article',
              entity_id: 'article-789',
              source_language: 'en',
              target_language: 'de',
              status: 'queued',
              attempts: 0,
              created_at: new Date().toISOString(),
            },
            error: null,
          }),
        }),
      });
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { createTranslationJob } = await import('../translation-jobs');

      const result = await createTranslationJob({
        entityType: 'article',
        entityId: 'article-789',
        sourceLanguage: 'en',
        targetLanguage: 'de',
      });

      const afterCreate = new Date().toISOString();

      expect(result.data?.createdAt).toBeDefined();
      expect(result.data?.createdAt >= beforeCreate).toBe(true);
      expect(result.data?.createdAt <= afterCreate).toBe(true);
    });

    it('generates unique job ID', async () => {
      const mockChain1 = createChainMock();
      mockChain1.upsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'unique-job-1',
              entity_type: 'article',
              entity_id: 'article-1',
              source_language: 'en',
              target_language: 'fr',
              status: 'queued',
              attempts: 0,
              created_at: new Date().toISOString(),
            },
            error: null,
          }),
        }),
      });

      const mockChain2 = createChainMock();
      mockChain2.upsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'unique-job-2',
              entity_type: 'article',
              entity_id: 'article-2',
              source_language: 'en',
              target_language: 'fr',
              status: 'queued',
              attempts: 0,
              created_at: new Date().toISOString(),
            },
            error: null,
          }),
        }),
      });

      mockSupabaseAdmin.from.mockReturnValueOnce(mockChain1).mockReturnValueOnce(mockChain2);

      const { createTranslationJob } = await import('../translation-jobs');

      const result1 = await createTranslationJob({
        entityType: 'article',
        entityId: 'article-1',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      });

      const result2 = await createTranslationJob({
        entityType: 'article',
        entityId: 'article-2',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      });

      expect(result1.data?.id).toBeDefined();
      expect(result2.data?.id).toBeDefined();
      expect(result1.data?.id).not.toBe(result2.data?.id);
    });
  });

  // ===========================================================================
  // Job State Transition Tests (Task 6.2.7)
  // ===========================================================================
  describe('Job State Transitions', () => {
    it('transitions job from queued to processing when fetched', async () => {
      const job = createMockTranslationJob({ status: 'queued' });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);

      const { fetchAndLockNextJob } = await import('../translation-jobs');

      const result = await fetchAndLockNextJob({
        workerId: 'worker-transition-test',
        lockTimeoutMinutes: TEST_DEFAULTS.LOCK_TIMEOUT_MINUTES,
      });

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('processing');
      expect(result.data?.lockedBy).toBe('worker-transition-test');
      expect(result.data?.lockedAt).toBeDefined();
      expect(result.data?.startedAt).toBeDefined();
    });

    it('increments attempts counter when job is fetched', async () => {
      const job = createMockTranslationJob({ status: 'queued', attempts: 0 });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);

      const { fetchAndLockNextJob } = await import('../translation-jobs');

      const result = await fetchAndLockNextJob({
        workerId: 'worker-attempts-test',
        lockTimeoutMinutes: TEST_DEFAULTS.LOCK_TIMEOUT_MINUTES,
      });

      expect(result.data?.attempts).toBe(1);
    });

    it('returns null when no queued jobs available', async () => {
      // Seed only processing and completed jobs
      const processingJob = createMockTranslationJob({ status: 'processing' });
      const completedJob = createMockTranslationJob({ status: 'completed' });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [processingJob, completedJob]);

      // RPC will find no queued jobs
      mockSupabaseAdmin.rpc.mockResolvedValueOnce({ data: [], error: null });

      const { fetchAndLockNextJob } = await import('../translation-jobs');

      const result = await fetchAndLockNextJob({
        workerId: 'worker-empty-queue',
        lockTimeoutMinutes: TEST_DEFAULTS.LOCK_TIMEOUT_MINUTES,
      });

      expect(result.data).toBeNull();
    });
  });

  // ===========================================================================
  // Complete Job Lifecycle Tests (Task 6.2.8)
  // ===========================================================================
  describe('Complete Job Lifecycle', () => {
    it('processes job through complete lifecycle', async () => {
      // Seed source content
      const article = createMockArticleContent({ id: 'lifecycle-article' });
      seedMockDatabase(TABLE_NAMES.ITEM_ARTICLES, [article]);

      // Mock for createTranslationJob
      const createMock = createChainMock();
      createMock.upsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'lifecycle-job',
              entity_type: 'article',
              entity_id: article.id,
              source_language: 'en',
              target_language: 'fr',
              status: 'queued',
              attempts: 0,
              created_at: new Date().toISOString(),
            },
            error: null,
          }),
        }),
      });
      mockSupabaseAdmin.from.mockReturnValueOnce(createMock);

      const {
        createTranslationJob,
        fetchAndLockNextJob,
        markJobCompleted,
      } = await import('../translation-jobs');

      // Step 1: Create job
      const createResult = await createTranslationJob({
        entityType: 'article',
        entityId: article.id,
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      });

      expect(createResult.success).toBe(true);
      expect(createResult.data?.status).toBe('queued');

      // Seed the job for fetch
      const job = createMockTranslationJob({
        id: 'lifecycle-job',
        entityId: article.id,
        status: 'queued',
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);

      // Step 2: Fetch and lock
      const fetchResult = await fetchAndLockNextJob({
        workerId: 'lifecycle-worker',
        lockTimeoutMinutes: TEST_DEFAULTS.LOCK_TIMEOUT_MINUTES,
      });

      expect(fetchResult.success).toBe(true);
      expect(fetchResult.data?.status).toBe('processing');
      expect(fetchResult.data?.lockedBy).toBe('lifecycle-worker');

      // Step 3: Complete
      const completeMock = createChainMock();
      completeMock.update = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'lifecycle-job',
                entity_type: 'article',
                entity_id: article.id,
                source_language: 'en',
                target_language: 'fr',
                status: 'completed',
                attempts: 1,
                completed_at: new Date().toISOString(),
                locked_by: null,
                locked_at: null,
              },
              error: null,
            }),
          }),
        }),
      });
      mockSupabaseAdmin.from.mockReturnValueOnce(completeMock);

      const completeResult = await markJobCompleted('lifecycle-job');

      expect(completeResult.success).toBe(true);
      expect(completeResult.data?.status).toBe('completed');
      expect(completeResult.data?.completedAt).toBeDefined();
    });
  });

  // ===========================================================================
  // Job Failure Handling Tests (Task 6.2.9)
  // ===========================================================================
  describe('Job Failure Handling', () => {
    it('captures error message on job failure', async () => {
      const job = createMockTranslationJob({
        id: 'error-capture-job',
        status: 'processing',
        lockedBy: 'worker-1',
        attempts: 0,
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);

      // Mock for fetching current attempts
      const fetchMock = createChainMock();
      fetchMock.select = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { attempts: 0 },
            error: null,
          }),
        }),
      });

      // Mock for updating the job
      const updateMock = createChainMock();
      updateMock.update = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'error-capture-job',
                entity_type: 'article',
                entity_id: job.entityId,
                source_language: 'en',
                target_language: 'fr',
                status: 'failed',
                attempts: 1,
                error_message: 'API Error: Service temporarily unavailable',
                created_at: job.createdAt,
                locked_by: null,
                locked_at: null,
              },
              error: null,
            }),
          }),
        }),
      });

      mockSupabaseAdmin.from.mockReturnValueOnce(fetchMock).mockReturnValueOnce(updateMock);

      const { markJobFailed } = await import('../translation-jobs');

      const errorMessage = 'API Error: Service temporarily unavailable';
      const result = await markJobFailed('error-capture-job', errorMessage);

      expect(result.data?.status).toBe('failed');
      expect(result.data?.errorMessage).toBe(errorMessage);
    });

    it('preserves job history on failure', async () => {
      const startTime = new Date(Date.now() - 1000).toISOString();
      const job = createMockTranslationJob({
        id: 'history-preserve-job',
        status: 'processing',
        lockedBy: 'history-worker',
        lockedAt: new Date().toISOString(),
        startedAt: startTime,
        attempts: 2,
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);

      // Mock for fetching current attempts
      const fetchMock = createChainMock();
      fetchMock.select = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { attempts: 2 },
            error: null,
          }),
        }),
      });

      // Mock for updating the job - preserves history
      const updateMock = createChainMock();
      updateMock.update = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'history-preserve-job',
                entity_type: 'article',
                entity_id: job.entityId,
                source_language: 'en',
                target_language: 'fr',
                status: 'failed',
                attempts: 3,
                error_message: 'Final failure',
                created_at: job.createdAt,
                started_at: startTime,
                locked_by: null,
                locked_at: null,
              },
              error: null,
            }),
          }),
        }),
      });

      mockSupabaseAdmin.from.mockReturnValueOnce(fetchMock).mockReturnValueOnce(updateMock);

      const { markJobFailed } = await import('../translation-jobs');

      const result = await markJobFailed('history-preserve-job', 'Final failure');

      expect(result.data?.startedAt).toBeDefined();
      expect(result.data?.attempts).toBe(3);
    });
  });

  // ===========================================================================
  // Job Processor Integration Tests (Task 6.2.14)
  // ===========================================================================
  describe('Job Processor Integration', () => {
    describe('Processor Lifecycle', () => {
      it('returns null when no jobs available', async () => {
        // RPC returns empty
        mockSupabaseAdmin.rpc.mockResolvedValueOnce({ data: [], error: null });

        const { createJobProcessor } = await import('../job-processor');

        const processor = createJobProcessor({
          enableLogging: false,
          workerId: 'test-processor',
        });

        const result = await processor.processNextJob();

        expect(result).toBeNull();
      });
    });

    describe('Statistics Tracking', () => {
      it('tracks processor stats correctly', async () => {
        const { createJobProcessor } = await import('../job-processor');

        const processor = createJobProcessor({
          enableLogging: false,
          workerId: 'stats-test-processor',
        });

        // Get initial stats
        const stats = processor.getStats();
        expect(stats.totalJobsProcessed).toBe(0);
        expect(stats.totalJobsSucceeded).toBe(0);
        expect(stats.totalJobsFailed).toBe(0);
        expect(stats.isRunning).toBe(false);
      });

      it('can reset stats', async () => {
        const { createJobProcessor } = await import('../job-processor');

        const processor = createJobProcessor({
          enableLogging: false,
          workerId: 'reset-stats-processor',
        });

        // Reset and verify
        processor.resetStats();
        const stats = processor.getStats();
        expect(stats.totalJobsProcessed).toBe(0);
        expect(stats.consecutiveErrors).toBe(0);
      });
    });
  });
});
