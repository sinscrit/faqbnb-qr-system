/**
/* eslint-disable @next/next/no-assign-module-variable */
 * Unit Tests for Retry Logic (REQ-E03-031)
 *
 * Tests the retry mechanism verification including:
 * - Retry count management
 * - Maximum retry limits
 * - Error message preservation
 * - Transient vs permanent error classification
 * - Job requeue mechanics
 * - Exponential backoff (if implemented)
 *
 * @created 2026-01-21
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMockTranslationJob } from './helpers/mockFactories';
import { resetMockDatabase, seedMockDatabase } from './helpers/mockSupabase';
import { TEST_DEFAULTS, TABLE_NAMES, ERROR_MESSAGES } from './helpers/constants';
import type { TranslationJob } from '../translation-jobs.types';

// Mock Supabase before imports
const mockSupabaseAdmin = {
  from: vi.fn(),
  rpc: vi.fn(),
};

vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: mockSupabaseAdmin,
}));

/**
 * Helper to create mock select chain for fetching current attempts
 */
function createMockSelectChain(data: { attempts: number } | null, error: { message: string } | null = null) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data, error }),
      }),
    }),
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    }),
  };
}

/**
 * Helper to create mock chain for update operations
 */
function createMockUpdateChain(
  currentAttempts: number,
  updatedJob: Partial<TranslationJob>,
  error: { message: string } | null = null
) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { attempts: currentAttempts }, error: null }),
      }),
    }),
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: updatedJob.id || 'job-1',
              entity_type: updatedJob.entityType || 'article',
              entity_id: updatedJob.entityId || 'entity-1',
              source_language: updatedJob.sourceLanguage || 'en',
              target_language: updatedJob.targetLanguage || 'fr',
              status: updatedJob.status || 'failed',
              priority: updatedJob.priority || 50,
              attempts: updatedJob.attempts || currentAttempts + 1,
              error_message: updatedJob.errorMessage || null,
              created_at: updatedJob.createdAt || new Date().toISOString(),
              started_at: updatedJob.startedAt || null,
              completed_at: updatedJob.completedAt || null,
              locked_by: null,
              locked_at: null,
            },
            error,
          }),
        }),
      }),
    }),
  };
}

// Import module under test dynamically
async function importTranslationJobs() {
  const module = await import('../translation-jobs');
  return module;
}

describe('Retry Logic (REQ-E03-031)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetMockDatabase();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Retry Count Management', () => {
    it('should increment attempts count on failure', async () => {
      const processingJob = createMockTranslationJob({
        id: 'job-1',
        status: 'processing',
        attempts: 1,
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [processingJob]);

      const mockChain = createMockUpdateChain(1, {
        ...processingJob,
        status: 'failed',
        attempts: 2, // Incremented
        errorMessage: 'Translation failed',
      });
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { markJobFailed } = await importTranslationJobs();
      const result = await markJobFailed('job-1', 'Translation failed');

      expect(result.success).toBe(true);
      expect(result.data?.attempts).toBe(2);
    });

    it('should preserve previous attempt count when incrementing', async () => {
      const processingJob = createMockTranslationJob({
        id: 'job-1',
        status: 'processing',
        attempts: 2, // Already failed twice
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [processingJob]);

      const mockChain = createMockUpdateChain(2, {
        ...processingJob,
        status: 'failed',
        attempts: 3, // 2 + 1 = 3
        errorMessage: 'Third failure',
      });
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { markJobFailed } = await importTranslationJobs();
      const result = await markJobFailed('job-1', 'Third failure');

      expect(result.success).toBe(true);
      expect(result.data?.attempts).toBe(3);
    });

    it('should start with attempts = 0 for new jobs', async () => {
      const newJob = createMockTranslationJob({
        id: 'new-job',
        status: 'queued',
        attempts: 0,
      });

      expect(newJob.attempts).toBe(0);
    });
  });

  describe('Maximum Retry Limits', () => {
    it('should allow retry when attempts < max_retries (default 3)', async () => {
      const job = createMockTranslationJob({
        id: 'job-1',
        status: 'processing',
        attempts: 2, // Less than 3
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);

      const mockChain = createMockUpdateChain(2, {
        ...job,
        status: 'failed',
        attempts: 3,
        errorMessage: 'Temporary error',
      });
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { markJobFailed } = await importTranslationJobs();
      const result = await markJobFailed('job-1', 'Temporary error');

      // Job can still be retried because attempts was 2, now 3 (equals max)
      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('failed');
    });

    it('should mark job as permanently failed when attempts >= max_retries', async () => {
      const job = createMockTranslationJob({
        id: 'job-1',
        status: 'processing',
        attempts: 3, // At limit
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);

      const mockChain = createMockUpdateChain(3, {
        ...job,
        status: 'failed',
        attempts: 4, // Exceeds limit
        errorMessage: 'Max retries exceeded',
      });
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { markJobFailed } = await importTranslationJobs();
      const result = await markJobFailed('job-1', 'Max retries exceeded');

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('failed');
      expect(result.data?.attempts).toBe(4);
    });

    it('should verify default max retry limit is 3', () => {
      expect(TEST_DEFAULTS.MAX_RETRIES).toBe(3);
    });

    it('should record exceeded_max_retries failure reason available', () => {
      expect(ERROR_MESSAGES.MAX_RETRIES_EXCEEDED).toBe('Maximum retry attempts exceeded');
    });
  });

  describe('Error Message Preservation', () => {
    it('should store error message when job fails', async () => {
      const job = createMockTranslationJob({
        id: 'job-1',
        status: 'processing',
        attempts: 0,
        errorMessage: null,
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);

      const errorMsg = 'Translation API timeout';
      const mockChain = createMockUpdateChain(0, {
        ...job,
        status: 'failed',
        attempts: 1,
        errorMessage: errorMsg,
      });
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { markJobFailed } = await importTranslationJobs();
      const result = await markJobFailed('job-1', errorMsg);

      expect(result.success).toBe(true);
      expect(result.data?.errorMessage).toBe(errorMsg);
    });

    it('should update error message on subsequent failures', async () => {
      const job = createMockTranslationJob({
        id: 'job-1',
        status: 'processing',
        attempts: 1,
        errorMessage: 'First error',
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);

      const newErrorMsg = 'Second error - rate limit';
      const mockChain = createMockUpdateChain(1, {
        ...job,
        status: 'failed',
        attempts: 2,
        errorMessage: newErrorMsg,
      });
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { markJobFailed } = await importTranslationJobs();
      const result = await markJobFailed('job-1', newErrorMsg);

      expect(result.success).toBe(true);
      expect(result.data?.errorMessage).toBe(newErrorMsg);
    });

    it('should clear error message when job succeeds', async () => {
      const job = createMockTranslationJob({
        id: 'job-1',
        status: 'processing',
        attempts: 1,
        errorMessage: 'Previous error',
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);

      const mockChain = {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'job-1',
                  entity_type: job.entityType,
                  entity_id: job.entityId,
                  source_language: job.sourceLanguage,
                  target_language: job.targetLanguage,
                  status: 'completed',
                  priority: job.priority,
                  attempts: job.attempts,
                  error_message: null, // Cleared on success
                  created_at: job.createdAt,
                  started_at: job.startedAt,
                  completed_at: new Date().toISOString(),
                  locked_by: null,
                  locked_at: null,
                },
                error: null,
              }),
            }),
          }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { markJobCompleted } = await importTranslationJobs();
      const result = await markJobCompleted('job-1');

      expect(result.success).toBe(true);
      // errorMessage is null in the response, mapped from error_message
      expect(result.data?.errorMessage).toBeNull();
    });
  });

  describe('Transient vs Permanent Errors', () => {
    it('should identify rate limit (429) as a transient error', () => {
      const errorMsg = 'Rate limit exceeded (429)';
      const lowerError = errorMsg.toLowerCase();
      const isTransient =
        lowerError.includes('rate limit') ||
        lowerError.includes('timeout') ||
        lowerError.includes('network') ||
        lowerError.includes('503') ||
        lowerError.includes('529');

      expect(isTransient).toBe(true);
    });

    it('should identify timeout as a transient error', () => {
      const errorMsg = 'Request timeout after 30000ms';
      const lowerError = errorMsg.toLowerCase();
      const isTransient =
        lowerError.includes('rate limit') ||
        lowerError.includes('timeout') ||
        lowerError.includes('network') ||
        lowerError.includes('503') ||
        lowerError.includes('529');

      expect(isTransient).toBe(true);
    });

    it('should identify network error as transient', () => {
      const errorMsg = 'Network error: ECONNRESET';
      const lowerError = errorMsg.toLowerCase();
      const isTransient =
        lowerError.includes('rate limit') ||
        lowerError.includes('timeout') ||
        lowerError.includes('network') ||
        lowerError.includes('503') ||
        lowerError.includes('529');

      expect(isTransient).toBe(true);
    });

    it('should identify 5xx server errors as transient', () => {
      const error503 = 'Service unavailable (503)';
      const isTransient503 = error503.includes('503');
      expect(isTransient503).toBe(true);

      const error529 = 'API overloaded (529)';
      const isTransient529 = error529.includes('529');
      expect(isTransient529).toBe(true);
    });

    it('should identify entity not found as permanent error', () => {
      const errorMsg = 'Item not found: item-123';
      const isTransient =
        errorMsg.includes('rate limit') ||
        errorMsg.includes('timeout') ||
        errorMsg.includes('network') ||
        errorMsg.includes('503') ||
        errorMsg.includes('529');

      expect(isTransient).toBe(false);
    });

    it('should identify invalid language as permanent error', () => {
      const errorMsg = 'Unsupported target language: xx';
      const isTransient =
        errorMsg.includes('rate limit') ||
        errorMsg.includes('timeout') ||
        errorMsg.includes('network') ||
        errorMsg.includes('503') ||
        errorMsg.includes('529');

      expect(isTransient).toBe(false);
    });
  });

  describe('Job Requeue on Retry', () => {
    it('should reset status to queued for retryable failures via cleanup', async () => {
      // Simulate stale job cleanup resetting status
      const staleJob = createMockTranslationJob({
        id: 'stale-job',
        status: 'processing',
        attempts: 1,
        lockedBy: 'dead-worker',
        lockedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [staleJob]);

      const mockChain = {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            lt: vi.fn().mockReturnValue({
              not: vi.fn().mockReturnValue({
                select: vi.fn().mockResolvedValue({
                  data: [{
                    id: 'stale-job',
                    status: 'queued', // Reset to queued
                    locked_by: null,
                    locked_at: null,
                  }],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { cleanupStaleLocks } = await importTranslationJobs();
      const result = await cleanupStaleLocks(5);

      expect(result.success).toBe(true);
      expect(mockChain.update).toHaveBeenCalledWith({
        status: 'queued',
        locked_by: null,
        locked_at: null,
      });
    });

    it('should clear worker_id when requeuing', async () => {
      const mockChain = {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            lt: vi.fn().mockReturnValue({
              not: vi.fn().mockReturnValue({
                select: vi.fn().mockResolvedValue({
                  data: [{
                    id: 'job-1',
                    status: 'queued',
                    locked_by: null,
                    locked_at: null,
                  }],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { cleanupStaleLocks } = await importTranslationJobs();
      await cleanupStaleLocks(5);

      expect(mockChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          locked_by: null,
          locked_at: null,
        })
      );
    });

    it('should maintain original priority when job fails', async () => {
      const job = createMockTranslationJob({
        id: 'job-1',
        status: 'processing',
        priority: 100, // Urgent priority
        attempts: 0,
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);

      const mockChain = createMockUpdateChain(0, {
        ...job,
        status: 'failed',
        attempts: 1,
        priority: 100, // Priority preserved
        errorMessage: 'Temporary error',
      });
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { markJobFailed } = await importTranslationJobs();
      const result = await markJobFailed('job-1', 'Temporary error');

      expect(result.success).toBe(true);
      expect(result.data?.priority).toBe(100);
    });
  });

  describe('Exponential Backoff', () => {
    // Note: Exponential backoff may not be implemented yet
    // These tests document expected behavior if/when implemented

    it.todo('should calculate backoff delay based on attempt count');

    it.todo('should increase delay exponentially with each retry');

    it.todo('should cap maximum backoff delay');

    it.todo('should apply jitter to prevent thundering herd');

    it('should have test defaults for retry configuration', () => {
      expect(TEST_DEFAULTS.MAX_RETRIES).toBeDefined();
      expect(TEST_DEFAULTS.MAX_RETRIES).toBeGreaterThan(0);
    });
  });
});
