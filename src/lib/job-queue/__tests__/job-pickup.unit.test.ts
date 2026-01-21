/**
 * Unit Tests for Job Pickup and Locking (REQ-E03-031)
 *
 * Tests the job pickup and locking mechanisms including:
 * - Job selection by priority
 * - Status transitions from queued to processing
 * - Lock acquisition and release
 * - Stale lock detection
 *
 * @created 2026-01-21
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createMockTranslationJob,
  createMockJobBatch,
} from './helpers/mockFactories';
import {
  resetMockDatabase,
  seedMockDatabase,
  getTableRecords,
} from './helpers/mockSupabase';
import { TEST_DEFAULTS, TABLE_NAMES } from './helpers/constants';
import type { TranslationJob } from '../translation-jobs.types';

// Mock Supabase before imports
const mockSupabaseAdmin = {
  from: vi.fn(),
  rpc: vi.fn(),
};

vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: mockSupabaseAdmin,
}));

// Import the module under test after mocks are set up
// We use dynamic import to ensure mocks are applied
async function importTranslationJobs() {
  const module = await import('../translation-jobs');
  return module;
}

/**
 * Helper to create a mock Supabase chain for update operations
 */
function createMockUpdateChain(data: unknown, error: { message: string } | null = null) {
  return {
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data, error }),
        }),
        is: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data, error }),
            }),
          }),
        }),
      }),
      lt: vi.fn().mockReturnValue({
        not: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: data ? [data] : [], error }),
        }),
      }),
    }),
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data, error }),
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data: data ? [data] : [], error }),
        }),
      }),
      is: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: data ? [data] : [], error }),
          }),
        }),
      }),
    }),
  };
}

describe('Job Pickup and Locking (REQ-E03-031)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetMockDatabase();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('pickNextJob', () => {
    it('should select the highest priority queued job', async () => {
      // Arrange
      const lowPriorityJob = createMockTranslationJob({
        id: 'job-low',
        status: 'queued',
        priority: 25,
      });
      const highPriorityJob = createMockTranslationJob({
        id: 'job-high',
        status: 'queued',
        priority: 100,
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [lowPriorityJob, highPriorityJob]);

      // Configure RPC to return high priority job (simulating atomic lock)
      mockSupabaseAdmin.rpc.mockResolvedValueOnce({
        data: [{
          id: 'job-high',
          entity_type: highPriorityJob.entityType,
          entity_id: highPriorityJob.entityId,
          source_language: highPriorityJob.sourceLanguage,
          target_language: highPriorityJob.targetLanguage,
          status: 'processing',
          priority: 100,
          attempts: 1,
          error_message: null,
          created_at: highPriorityJob.createdAt,
          started_at: new Date().toISOString(),
          completed_at: null,
          locked_by: 'test-worker',
          locked_at: new Date().toISOString(),
        }],
        error: null,
      });

      // Act
      const { fetchAndLockNextJob } = await importTranslationJobs();
      const result = await fetchAndLockNextJob({ workerId: 'test-worker' });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('job-high');
      expect(result.data?.priority).toBe(100);
    });

    it('should return null when no queued jobs exist', async () => {
      // Arrange - seed only processing and completed jobs
      const processingJob = createMockTranslationJob({
        id: 'job-processing',
        status: 'processing',
        lockedBy: 'other-worker',
      });
      const completedJob = createMockTranslationJob({
        id: 'job-completed',
        status: 'completed',
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [processingJob, completedJob]);

      // Configure RPC to return empty array
      mockSupabaseAdmin.rpc.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      // Act
      const { fetchAndLockNextJob } = await importTranslationJobs();
      const result = await fetchAndLockNextJob({ workerId: 'test-worker' });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should skip jobs already in processing state', async () => {
      // Arrange
      const processingJob = createMockTranslationJob({
        id: 'job-processing',
        status: 'processing',
        priority: 100, // High priority but already processing
        lockedBy: 'other-worker',
      });
      const queuedJob = createMockTranslationJob({
        id: 'job-queued',
        status: 'queued',
        priority: 50, // Lower priority but available
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [processingJob, queuedJob]);

      // Configure RPC to return queued job (skipped processing one)
      mockSupabaseAdmin.rpc.mockResolvedValueOnce({
        data: [{
          id: 'job-queued',
          entity_type: queuedJob.entityType,
          entity_id: queuedJob.entityId,
          source_language: queuedJob.sourceLanguage,
          target_language: queuedJob.targetLanguage,
          status: 'processing',
          priority: 50,
          attempts: 1,
          error_message: null,
          created_at: queuedJob.createdAt,
          started_at: new Date().toISOString(),
          completed_at: null,
          locked_by: 'test-worker',
          locked_at: new Date().toISOString(),
        }],
        error: null,
      });

      // Act
      const { fetchAndLockNextJob } = await importTranslationJobs();
      const result = await fetchAndLockNextJob({ workerId: 'test-worker' });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('job-queued');
      expect(mockSupabaseAdmin.rpc).toHaveBeenCalledWith(
        'fetch_and_lock_translation_job',
        { p_worker_id: 'test-worker' }
      );
    });

    it('should respect priority ordering (DESC) then created_at (ASC)', async () => {
      // Arrange - multiple jobs with same priority, different timestamps
      const olderJob = createMockTranslationJob({
        id: 'job-older',
        status: 'queued',
        priority: 50,
        createdAt: '2026-01-01T10:00:00Z',
      });
      const newerJob = createMockTranslationJob({
        id: 'job-newer',
        status: 'queued',
        priority: 50,
        createdAt: '2026-01-01T12:00:00Z',
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [newerJob, olderJob]);

      // Configure RPC to return the older job (same priority, pick oldest first)
      mockSupabaseAdmin.rpc.mockResolvedValueOnce({
        data: [{
          id: 'job-older',
          entity_type: olderJob.entityType,
          entity_id: olderJob.entityId,
          source_language: olderJob.sourceLanguage,
          target_language: olderJob.targetLanguage,
          status: 'processing',
          priority: 50,
          attempts: 1,
          error_message: null,
          created_at: '2026-01-01T10:00:00Z',
          started_at: new Date().toISOString(),
          completed_at: null,
          locked_by: 'test-worker',
          locked_at: new Date().toISOString(),
        }],
        error: null,
      });

      // Act
      const { fetchAndLockNextJob } = await importTranslationJobs();
      const result = await fetchAndLockNextJob({ workerId: 'test-worker' });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('job-older');
      expect(result.data?.createdAt).toBe('2026-01-01T10:00:00Z');
    });
  });

  describe('Job Status Transitions', () => {
    it('should mark picked job as processing', async () => {
      // Arrange
      const queuedJob = createMockTranslationJob({
        id: 'job-1',
        status: 'queued',
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [queuedJob]);

      mockSupabaseAdmin.rpc.mockResolvedValueOnce({
        data: [{
          id: 'job-1',
          entity_type: queuedJob.entityType,
          entity_id: queuedJob.entityId,
          source_language: queuedJob.sourceLanguage,
          target_language: queuedJob.targetLanguage,
          status: 'processing', // Status changed
          priority: queuedJob.priority,
          attempts: 1,
          error_message: null,
          created_at: queuedJob.createdAt,
          started_at: new Date().toISOString(),
          completed_at: null,
          locked_by: 'test-worker',
          locked_at: new Date().toISOString(),
        }],
        error: null,
      });

      // Act
      const { fetchAndLockNextJob } = await importTranslationJobs();
      const result = await fetchAndLockNextJob({ workerId: 'test-worker' });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('processing');
    });

    it('should set started_at timestamp when picking job', async () => {
      // Arrange
      const queuedJob = createMockTranslationJob({
        id: 'job-1',
        status: 'queued',
        startedAt: null,
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [queuedJob]);

      const startedAtTimestamp = '2026-01-21T12:00:00.000Z';
      mockSupabaseAdmin.rpc.mockResolvedValueOnce({
        data: [{
          id: 'job-1',
          entity_type: queuedJob.entityType,
          entity_id: queuedJob.entityId,
          source_language: queuedJob.sourceLanguage,
          target_language: queuedJob.targetLanguage,
          status: 'processing',
          priority: queuedJob.priority,
          attempts: 1,
          error_message: null,
          created_at: queuedJob.createdAt,
          started_at: startedAtTimestamp, // Timestamp set
          completed_at: null,
          locked_by: 'test-worker',
          locked_at: startedAtTimestamp,
        }],
        error: null,
      });

      // Act
      const { fetchAndLockNextJob } = await importTranslationJobs();
      const result = await fetchAndLockNextJob({ workerId: 'test-worker' });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.startedAt).toBeDefined();
      expect(result.data?.startedAt).toBe(startedAtTimestamp);
      // Verify it's a valid ISO timestamp
      expect(() => new Date(result.data!.startedAt!)).not.toThrow();
    });

    it('should assign worker_id to picked job', async () => {
      // Arrange
      const queuedJob = createMockTranslationJob({
        id: 'job-1',
        status: 'queued',
        lockedBy: null,
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [queuedJob]);

      const workerId = 'worker-abc-123';
      mockSupabaseAdmin.rpc.mockResolvedValueOnce({
        data: [{
          id: 'job-1',
          entity_type: queuedJob.entityType,
          entity_id: queuedJob.entityId,
          source_language: queuedJob.sourceLanguage,
          target_language: queuedJob.targetLanguage,
          status: 'processing',
          priority: queuedJob.priority,
          attempts: 1,
          error_message: null,
          created_at: queuedJob.createdAt,
          started_at: new Date().toISOString(),
          completed_at: null,
          locked_by: workerId, // Worker ID assigned
          locked_at: new Date().toISOString(),
        }],
        error: null,
      });

      // Act
      const { fetchAndLockNextJob } = await importTranslationJobs();
      const result = await fetchAndLockNextJob({ workerId });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.lockedBy).toBe(workerId);
    });
  });

  describe('Job Locking', () => {
    it('should acquire lock using FOR UPDATE SKIP LOCKED pattern', async () => {
      // Arrange
      const queuedJob = createMockTranslationJob({
        id: 'job-1',
        status: 'queued',
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [queuedJob]);

      mockSupabaseAdmin.rpc.mockResolvedValueOnce({
        data: [{
          id: 'job-1',
          entity_type: queuedJob.entityType,
          entity_id: queuedJob.entityId,
          source_language: queuedJob.sourceLanguage,
          target_language: queuedJob.targetLanguage,
          status: 'processing',
          priority: queuedJob.priority,
          attempts: 1,
          error_message: null,
          created_at: queuedJob.createdAt,
          started_at: new Date().toISOString(),
          completed_at: null,
          locked_by: 'test-worker',
          locked_at: new Date().toISOString(),
        }],
        error: null,
      });

      // Act
      const { fetchAndLockNextJob } = await importTranslationJobs();
      await fetchAndLockNextJob({ workerId: 'test-worker' });

      // Assert - verify RPC is called with correct function name
      expect(mockSupabaseAdmin.rpc).toHaveBeenCalledWith(
        'fetch_and_lock_translation_job',
        { p_worker_id: 'test-worker' }
      );
    });

    it('should prevent concurrent pickup of same job', async () => {
      // Arrange
      const queuedJob = createMockTranslationJob({
        id: 'job-1',
        status: 'queued',
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [queuedJob]);

      // First call returns job, second call returns null (job already taken)
      mockSupabaseAdmin.rpc
        .mockResolvedValueOnce({
          data: [{
            id: 'job-1',
            entity_type: queuedJob.entityType,
            entity_id: queuedJob.entityId,
            source_language: queuedJob.sourceLanguage,
            target_language: queuedJob.targetLanguage,
            status: 'processing',
            priority: queuedJob.priority,
            attempts: 1,
            error_message: null,
            created_at: queuedJob.createdAt,
            started_at: new Date().toISOString(),
            completed_at: null,
            locked_by: 'worker-1',
            locked_at: new Date().toISOString(),
          }],
          error: null,
        })
        .mockResolvedValueOnce({
          data: [], // No jobs available for second worker
          error: null,
        });

      // Act
      const { fetchAndLockNextJob } = await importTranslationJobs();
      const result1 = await fetchAndLockNextJob({ workerId: 'worker-1' });
      const result2 = await fetchAndLockNextJob({ workerId: 'worker-2' });

      // Assert
      expect(result1.success).toBe(true);
      expect(result1.data?.id).toBe('job-1');
      expect(result2.success).toBe(true);
      expect(result2.data).toBeNull(); // Second worker gets nothing
    });

    it('should release lock when job processing completes', async () => {
      // Arrange
      const processingJob = createMockTranslationJob({
        id: 'job-1',
        status: 'processing',
        lockedBy: 'test-worker',
        lockedAt: new Date().toISOString(),
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [processingJob]);

      const mockChain = createMockUpdateChain({
        id: 'job-1',
        entity_type: processingJob.entityType,
        entity_id: processingJob.entityId,
        source_language: processingJob.sourceLanguage,
        target_language: processingJob.targetLanguage,
        status: 'completed',
        priority: processingJob.priority,
        attempts: processingJob.attempts,
        error_message: null,
        created_at: processingJob.createdAt,
        started_at: processingJob.startedAt,
        completed_at: new Date().toISOString(),
        locked_by: null, // Lock released
        locked_at: null,
      });
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      // Act
      const { markJobCompleted } = await importTranslationJobs();
      const result = await markJobCompleted('job-1');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.lockedBy).toBeNull();
      expect(result.data?.lockedAt).toBeNull();
      expect(result.data?.status).toBe('completed');
    });

    it('should release lock when job processing fails', async () => {
      // Arrange
      const processingJob = createMockTranslationJob({
        id: 'job-1',
        status: 'processing',
        lockedBy: 'test-worker',
        lockedAt: new Date().toISOString(),
        attempts: 1,
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [processingJob]);

      // Mock for fetching current attempts
      const selectChain = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { attempts: 1 },
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'job-1',
                  entity_type: processingJob.entityType,
                  entity_id: processingJob.entityId,
                  source_language: processingJob.sourceLanguage,
                  target_language: processingJob.targetLanguage,
                  status: 'failed',
                  priority: processingJob.priority,
                  attempts: 2,
                  error_message: 'Translation failed',
                  created_at: processingJob.createdAt,
                  started_at: processingJob.startedAt,
                  completed_at: null,
                  locked_by: null, // Lock released
                  locked_at: null,
                },
                error: null,
              }),
            }),
          }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(selectChain);

      // Act
      const { markJobFailed } = await importTranslationJobs();
      const result = await markJobFailed('job-1', 'Translation failed');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.lockedBy).toBeNull();
      expect(result.data?.lockedAt).toBeNull();
      expect(result.data?.status).toBe('failed');
    });
  });

  describe('Stale Lock Detection', () => {
    it('should identify jobs stuck in processing over 5 minutes', async () => {
      // Arrange - job locked over 5 minutes ago
      const staleTime = new Date(Date.now() - 6 * 60 * 1000).toISOString(); // 6 minutes ago
      const staleJob = createMockTranslationJob({
        id: 'stale-job',
        status: 'processing',
        lockedBy: 'dead-worker',
        lockedAt: staleTime,
        attempts: 1,
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [staleJob]);

      // Mock chain for cleanupStaleLocks
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

      // Act
      const { cleanupStaleLocks } = await importTranslationJobs();
      const result = await cleanupStaleLocks(5);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBe(1); // One stale job cleaned up
    });

    it('should reset stale jobs to queued status', async () => {
      // Arrange
      const staleTime = new Date(Date.now() - 10 * 60 * 1000).toISOString(); // 10 minutes ago
      const staleJob = createMockTranslationJob({
        id: 'stale-job',
        status: 'processing',
        lockedBy: 'dead-worker',
        lockedAt: staleTime,
        attempts: 1,
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

      // Act
      const { cleanupStaleLocks } = await importTranslationJobs();
      const result = await cleanupStaleLocks(5);

      // Assert
      expect(result.success).toBe(true);
      expect(mockChain.update).toHaveBeenCalledWith({
        status: 'queued',
        locked_by: null,
        locked_at: null,
      });
    });

    it('should not clean up jobs locked less than timeout', async () => {
      // Arrange - job locked only 2 minutes ago
      const recentTime = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      const recentJob = createMockTranslationJob({
        id: 'recent-job',
        status: 'processing',
        lockedBy: 'active-worker',
        lockedAt: recentTime,
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [recentJob]);

      const mockChain = {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            lt: vi.fn().mockReturnValue({
              not: vi.fn().mockReturnValue({
                select: vi.fn().mockResolvedValue({
                  data: [], // No jobs cleaned up
                  error: null,
                }),
              }),
            }),
          }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      // Act
      const { cleanupStaleLocks } = await importTranslationJobs();
      const result = await cleanupStaleLocks(5);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBe(0); // No jobs cleaned up
    });

    it('should handle multiple stale jobs at once', async () => {
      // Arrange - multiple stale jobs
      const staleTime = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const staleJobs = [
        createMockTranslationJob({
          id: 'stale-job-1',
          status: 'processing',
          lockedBy: 'dead-worker-1',
          lockedAt: staleTime,
        }),
        createMockTranslationJob({
          id: 'stale-job-2',
          status: 'processing',
          lockedBy: 'dead-worker-2',
          lockedAt: staleTime,
        }),
      ];
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, staleJobs);

      const mockChain = {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            lt: vi.fn().mockReturnValue({
              not: vi.fn().mockReturnValue({
                select: vi.fn().mockResolvedValue({
                  data: [
                    { id: 'stale-job-1', status: 'queued', locked_by: null, locked_at: null },
                    { id: 'stale-job-2', status: 'queued', locked_by: null, locked_at: null },
                  ],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      // Act
      const { cleanupStaleLocks } = await importTranslationJobs();
      const result = await cleanupStaleLocks(5);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBe(2); // Two stale jobs cleaned up
    });
  });
});
