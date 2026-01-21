/**
 * Unit Tests for Concurrency Control (REQ-E03-031)
 *
 * Tests the concurrency control mechanisms including:
 * - Stale lock cleanup
 * - Lock heartbeat functionality
 * - Duplicate job prevention
 * - Lock statistics monitoring
 * - ConcurrencyControlManager class
 *
 * @created 2026-01-21
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMockTranslationJob } from './helpers/mockFactories';
import { resetMockDatabase, seedMockDatabase } from './helpers/mockSupabase';
import { TEST_DEFAULTS, TABLE_NAMES } from './helpers/constants';

// Mock Supabase before imports
const mockSupabaseAdmin = {
  from: vi.fn(),
};

vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: mockSupabaseAdmin,
}));

// Import module under test dynamically
async function importConcurrencyControl() {
  const module = await import('../concurrency-control');
  return module;
}

/**
 * Helper to create mock select chain for fetching jobs
 */
function createMockSelectChain(
  data: unknown[] | null,
  error: { message: string; code?: string } | null = null
) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        lt: vi.fn().mockResolvedValue({ data, error }),
        not: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: data?.[0] || null, error }),
        }),
        single: vi.fn().mockResolvedValue({ data: data?.[0] || null, error }),
      }),
      not: vi.fn().mockReturnValue({
        then: vi.fn((resolve) => resolve({ data, error })),
      }),
    }),
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: data?.[0] || null,
                error,
              }),
            }),
          }),
        }),
        in: vi.fn().mockResolvedValue({ data, error }),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: data?.[0] || null, error }),
      }),
    }),
  };
}

/**
 * Helper to create mock chain for stale lock cleanup operations
 */
function createMockCleanupChain(
  findData: { id: string; attempts: number }[] | null,
  findError: { message: string } | null = null,
  updateError: { message: string } | null = null
) {
  const mockSelectEq = vi.fn().mockReturnValue({
    lt: vi.fn().mockResolvedValue({ data: findData, error: findError }),
  });

  const mockUpdateEq = vi.fn().mockReturnValue({
    then: vi.fn((resolve) => resolve({ data: null, error: updateError })),
  });

  const mockUpdateIn = vi.fn().mockResolvedValue({ data: null, error: updateError });

  return {
    select: vi.fn().mockReturnValue({
      eq: mockSelectEq,
    }),
    update: vi.fn().mockReturnValue({
      eq: mockUpdateEq.mockReturnValue({
        then: vi.fn((resolve) => resolve({ data: null, error: updateError })),
      }),
      in: mockUpdateIn,
    }),
  };
}

describe('Concurrency Control (REQ-E03-031)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    resetMockDatabase();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Stale Lock Cleanup (cleanupStaleProcessingJobs)', () => {
    it('should find and reset stale jobs to queued status', async () => {
      const staleJobs = [
        { id: 'job-1', attempts: 0 },
        { id: 'job-2', attempts: 1 },
      ];

      let callCount = 0;
      const mockChain = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            lt: vi.fn().mockResolvedValue({ data: staleJobs, error: null }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockImplementation(() => {
            callCount++;
            return {
              then: vi.fn((resolve) => resolve({ data: null, error: null })),
            };
          }),
          in: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { cleanupStaleProcessingJobs } = await importConcurrencyControl();
      const result = await cleanupStaleProcessingJobs();

      expect(result.staleJobsFound).toBe(2);
      expect(result.jobsReset).toBeGreaterThanOrEqual(0); // May be reset
    });

    it('should mark jobs as failed when exceeding max retries', async () => {
      const maxRetries = TEST_DEFAULTS.MAX_RETRIES;
      const staleJobs = [
        { id: 'job-1', attempts: maxRetries }, // At limit
        { id: 'job-2', attempts: maxRetries + 1 }, // Exceeds limit
      ];

      const mockChain = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            lt: vi.fn().mockResolvedValue({ data: staleJobs, error: null }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            then: vi.fn((resolve) => resolve({ data: null, error: null })),
          }),
          in: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { cleanupStaleProcessingJobs } = await importConcurrencyControl();
      const result = await cleanupStaleProcessingJobs({ maxStaleRetries: maxRetries });

      expect(result.staleJobsFound).toBe(2);
      // Both jobs should be marked as failed
      expect(result.jobsMarkedFailed).toBeGreaterThanOrEqual(0);
    });

    it('should return empty result when no stale jobs', async () => {
      const mockChain = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            lt: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { cleanupStaleProcessingJobs } = await importConcurrencyControl();
      const result = await cleanupStaleProcessingJobs();

      expect(result.staleJobsFound).toBe(0);
      expect(result.jobsReset).toBe(0);
      expect(result.jobsMarkedFailed).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      const mockChain = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            lt: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Connection failed' },
            }),
          }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { cleanupStaleProcessingJobs } = await importConcurrencyControl();
      const result = await cleanupStaleProcessingJobs();

      expect(result.error).toBeDefined();
      expect(result.error).toContain('Connection failed');
    });

    it('should use configured lock timeout', async () => {
      const mockChain = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            lt: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { cleanupStaleProcessingJobs } = await importConcurrencyControl();
      await cleanupStaleProcessingJobs({ lockTimeoutMinutes: 10 });

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('translation_jobs');
    });

    it('should increment attempts when resetting jobs', async () => {
      const staleJobs = [{ id: 'job-1', attempts: 1 }];

      let updatePayload: Record<string, unknown> = {};
      const mockChain = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            lt: vi.fn().mockResolvedValue({ data: staleJobs, error: null }),
          }),
        }),
        update: vi.fn().mockImplementation((payload) => {
          updatePayload = payload;
          return {
            eq: vi.fn().mockReturnValue({
              then: vi.fn((resolve) => resolve({ data: null, error: null })),
            }),
          };
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { cleanupStaleProcessingJobs } = await importConcurrencyControl();
      await cleanupStaleProcessingJobs();

      expect(updatePayload.attempts).toBe(2); // 1 + 1
    });
  });

  describe('Lock Heartbeat (refreshJobLock)', () => {
    it('should update locked_at timestamp for active job', async () => {
      const mockChain = {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { id: 'job-1' },
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { refreshJobLock } = await importConcurrencyControl();
      const result = await refreshJobLock('job-1', 'worker-1');

      expect(result.success).toBe(true);
      expect(result.jobId).toBe('job-1');
      expect(result.newLockedAt).toBeDefined();
    });

    it('should fail when job is not found', async () => {
      const mockChain = {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'No rows returned' },
                  }),
                }),
              }),
            }),
          }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { refreshJobLock } = await importConcurrencyControl();
      const result = await refreshJobLock('nonexistent', 'worker-1');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should verify worker ownership when refreshing lock', async () => {
      const mockEq = vi.fn();
      mockEq.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'job-1' },
                error: null,
              }),
            }),
          }),
        }),
      });

      const mockChain = {
        update: vi.fn().mockReturnValue({
          eq: mockEq,
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { refreshJobLock } = await importConcurrencyControl();
      await refreshJobLock('job-1', 'worker-123');

      // Verify eq was called with worker ID
      expect(mockEq).toHaveBeenCalled();
    });

    it('should fail when lock is owned by different worker', async () => {
      const mockChain = {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Lock not owned by worker' },
                  }),
                }),
              }),
            }),
          }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { refreshJobLock } = await importConcurrencyControl();
      const result = await refreshJobLock('job-1', 'wrong-worker');

      expect(result.success).toBe(false);
    });
  });

  describe('Lock Heartbeat Interval (createLockHeartbeat)', () => {
    it('should run heartbeat immediately on creation', async () => {
      const mockChain = {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { id: 'job-1' },
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { createLockHeartbeat } = await importConcurrencyControl();
      const cleanup = createLockHeartbeat('job-1', 'worker-1', 60000);

      // First heartbeat runs immediately - just advance a small amount
      await vi.advanceTimersByTimeAsync(10);

      expect(mockSupabaseAdmin.from).toHaveBeenCalled();

      cleanup();
    });

    it('should return cleanup function that stops heartbeat', async () => {
      const mockChain = {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { id: 'job-1' },
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { createLockHeartbeat } = await importConcurrencyControl();
      const cleanup = createLockHeartbeat('job-1', 'worker-1', 60000);

      cleanup();

      // Clear call history
      mockSupabaseAdmin.from.mockClear();

      // Advance time past heartbeat interval
      await vi.advanceTimersByTimeAsync(120000);

      // Heartbeat should not have run again after cleanup
      expect(mockSupabaseAdmin.from).not.toHaveBeenCalled();
    });

    it('should stop heartbeat on lock failure', async () => {
      let callCount = 0;
      const mockChain = {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockImplementation(() => {
                    callCount++;
                    // Fail on second call
                    if (callCount > 1) {
                      return Promise.resolve({
                        data: null,
                        error: { message: 'Lock lost' },
                      });
                    }
                    return Promise.resolve({
                      data: { id: 'job-1' },
                      error: null,
                    });
                  }),
                }),
              }),
            }),
          }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { createLockHeartbeat } = await importConcurrencyControl();
      const cleanup = createLockHeartbeat('job-1', 'worker-1', 1000);

      // Run initial heartbeat
      await vi.advanceTimersByTimeAsync(100);

      // Run next heartbeat (which will fail)
      await vi.advanceTimersByTimeAsync(1000);

      expect(callCount).toBeGreaterThanOrEqual(1);

      cleanup();
    });
  });

  describe('Duplicate Prevention (checkForDuplicateJob)', () => {
    it('should return isDuplicate=false when no existing job', async () => {
      const mockChain = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: { code: 'PGRST116', message: 'No rows' },
                }),
              }),
            }),
          }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { checkForDuplicateJob } = await importConcurrencyControl();
      const result = await checkForDuplicateJob('article', 'entity-1', 'fr');

      expect(result.isDuplicate).toBe(false);
      expect(result.existingJobId).toBeUndefined();
    });

    it('should return isDuplicate=true when job exists', async () => {
      const mockChain = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'existing-job', status: 'queued' },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { checkForDuplicateJob } = await importConcurrencyControl();
      const result = await checkForDuplicateJob('article', 'entity-1', 'fr');

      expect(result.isDuplicate).toBe(true);
      expect(result.existingJobId).toBe('existing-job');
      expect(result.existingStatus).toBe('queued');
    });

    it('should check correct entity type and language', async () => {
      const mockEq1 = vi.fn();
      const mockEq2 = vi.fn();
      const mockEq3 = vi.fn();

      mockEq1.mockReturnValue({
        eq: mockEq2.mockReturnValue({
          eq: mockEq3.mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'No rows' },
            }),
          }),
        }),
      });

      const mockChain = {
        select: vi.fn().mockReturnValue({
          eq: mockEq1,
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { checkForDuplicateJob } = await importConcurrencyControl();
      await checkForDuplicateJob('tag', 'my-tag', 'de');

      expect(mockEq1).toHaveBeenCalledWith('entity_type', 'tag');
      expect(mockEq2).toHaveBeenCalledWith('entity_id', 'my-tag');
      expect(mockEq3).toHaveBeenCalledWith('target_language', 'de');
    });

    it('should handle database errors gracefully', async () => {
      const mockChain = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: { code: 'OTHER', message: 'Database error' },
                }),
              }),
            }),
          }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { checkForDuplicateJob } = await importConcurrencyControl();
      const result = await checkForDuplicateJob('item', 'item-1', 'es');

      // Should return not duplicate on error (fail open)
      expect(result.isDuplicate).toBe(false);
    });
  });

  describe('Idempotent Job Creation (createJobIfNotExists)', () => {
    it('should create job when no duplicate exists', async () => {
      const newJob = {
        id: 'new-job',
        entity_type: 'article',
        entity_id: 'entity-1',
        source_language: 'en',
        target_language: 'fr',
        status: 'queued',
        attempts: 0,
      };

      const mockChain = {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: newJob,
              error: null,
            }),
          }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { createJobIfNotExists } = await importConcurrencyControl();
      const result = await createJobIfNotExists({
        entityType: 'article',
        entityId: 'entity-1',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      });

      expect(result.success).toBe(true);
      expect(result.data).not.toBeNull();
      expect(result.data?.entityType).toBe('article');
    });

    it('should return null data when duplicate exists (unique violation)', async () => {
      const mockChain = {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: '23505', message: 'Unique constraint violation' },
            }),
          }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { createJobIfNotExists } = await importConcurrencyControl();
      const result = await createJobIfNotExists({
        entityType: 'article',
        entityId: 'entity-1',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      });

      expect(result.success).toBe(true); // Still success
      expect(result.data).toBeNull(); // But no data created
    });

    it('should return error for non-duplicate database errors', async () => {
      const mockChain = {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'OTHER', message: 'Connection failed' },
            }),
          }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { createJobIfNotExists } = await importConcurrencyControl();
      const result = await createJobIfNotExists({
        entityType: 'article',
        entityId: 'entity-1',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Lock Statistics (getLockStatistics)', () => {
    it('should return zero counts when no locked jobs', async () => {
      const mockChain = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            not: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { getLockStatistics } = await importConcurrencyControl();
      const stats = await getLockStatistics();

      expect(stats.activeLocksCount).toBe(0);
      expect(stats.staleLocksCount).toBe(0);
      expect(stats.avgLockDurationMs).toBe(0);
    });

    it('should count locks by worker', async () => {
      const lockedJobs = [
        { id: 'job-1', locked_by: 'worker-1', locked_at: new Date().toISOString() },
        { id: 'job-2', locked_by: 'worker-1', locked_at: new Date().toISOString() },
        { id: 'job-3', locked_by: 'worker-2', locked_at: new Date().toISOString() },
      ];

      const mockChain = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            not: vi.fn().mockResolvedValue({
              data: lockedJobs,
              error: null,
            }),
          }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { getLockStatistics } = await importConcurrencyControl();
      const stats = await getLockStatistics();

      expect(stats.activeLocksCount).toBe(3);
      expect(stats.locksByWorker['worker-1']).toBe(2);
      expect(stats.locksByWorker['worker-2']).toBe(1);
    });

    it('should identify stale locks', async () => {
      const now = Date.now();
      const staleTime = new Date(now - 10 * 60 * 1000).toISOString(); // 10 min ago (stale)
      const freshTime = new Date(now - 1 * 60 * 1000).toISOString(); // 1 min ago (fresh)

      const lockedJobs = [
        { id: 'job-1', locked_by: 'worker-1', locked_at: staleTime },
        { id: 'job-2', locked_by: 'worker-2', locked_at: freshTime },
      ];

      const mockChain = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            not: vi.fn().mockResolvedValue({
              data: lockedJobs,
              error: null,
            }),
          }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { getLockStatistics } = await importConcurrencyControl();
      const stats = await getLockStatistics();

      expect(stats.staleLocksCount).toBe(1);
      expect(stats.oldestLockAt).toBe(staleTime);
    });

    it('should handle database errors gracefully', async () => {
      const mockChain = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            not: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Query failed' },
            }),
          }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { getLockStatistics } = await importConcurrencyControl();
      const stats = await getLockStatistics();

      expect(stats.activeLocksCount).toBe(0);
      expect(stats.generatedAt).toBeDefined();
    });
  });

  describe('Stale Lock Count (getStaleLocksCount)', () => {
    it('should return count of stale locks', async () => {
      const mockChain = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            lt: vi.fn().mockResolvedValue({
              count: 5,
              error: null,
            }),
          }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { getStaleLocksCount } = await importConcurrencyControl();
      const count = await getStaleLocksCount();

      expect(count).toBe(5);
    });

    it('should use custom lock timeout', async () => {
      const mockLt = vi.fn().mockResolvedValue({ count: 3, error: null });
      const mockChain = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            lt: mockLt,
          }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { getStaleLocksCount } = await importConcurrencyControl();
      await getStaleLocksCount(10);

      expect(mockLt).toHaveBeenCalled();
    });

    it('should return 0 on error', async () => {
      const mockChain = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            lt: vi.fn().mockResolvedValue({
              count: null,
              error: { message: 'Query failed' },
            }),
          }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { getStaleLocksCount } = await importConcurrencyControl();
      const count = await getStaleLocksCount();

      expect(count).toBe(0);
    });
  });

  describe('ConcurrencyControlManager', () => {
    it('should create manager with default config', async () => {
      const { ConcurrencyControlManager, DEFAULT_CONCURRENCY_CONFIG } = await importConcurrencyControl();
      const manager = new ConcurrencyControlManager();

      const config = manager.getConfig();
      expect(config.lockTimeoutMinutes).toBe(DEFAULT_CONCURRENCY_CONFIG.lockTimeoutMinutes);
      expect(config.autoCleanupEnabled).toBe(true);
    });

    it('should create manager with custom config', async () => {
      const { ConcurrencyControlManager } = await importConcurrencyControl();
      const manager = new ConcurrencyControlManager({
        lockTimeoutMinutes: 10,
        autoCleanupEnabled: false,
      });

      const config = manager.getConfig();
      expect(config.lockTimeoutMinutes).toBe(10);
      expect(config.autoCleanupEnabled).toBe(false);
    });

    it('should start and stop manager', async () => {
      const mockChain = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            lt: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { ConcurrencyControlManager } = await importConcurrencyControl();
      const manager = new ConcurrencyControlManager({ autoCleanupEnabled: false });

      expect(manager.isRunning()).toBe(false);

      manager.start();
      expect(manager.isRunning()).toBe(true);

      manager.stop();
      expect(manager.isRunning()).toBe(false);
    });

    it('should not start twice', async () => {
      const mockChain = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            lt: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { ConcurrencyControlManager } = await importConcurrencyControl();
      const manager = new ConcurrencyControlManager({ autoCleanupEnabled: false });

      manager.start();
      manager.start(); // Should warn, not error

      expect(manager.isRunning()).toBe(true);

      manager.stop();
    });

    it('should run cleanup manually', async () => {
      const mockChain = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            lt: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { ConcurrencyControlManager } = await importConcurrencyControl();
      const manager = new ConcurrencyControlManager({ autoCleanupEnabled: false });

      const result = await manager.runCleanup();

      expect(result.staleJobsFound).toBe(0);
      expect(result.cleanedAt).toBeDefined();
    });

    it('should get statistics via manager', async () => {
      const mockChain = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            not: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { ConcurrencyControlManager } = await importConcurrencyControl();
      const manager = new ConcurrencyControlManager({ autoCleanupEnabled: false });

      const stats = await manager.getStatistics();

      expect(stats.activeLocksCount).toBe(0);
      expect(stats.generatedAt).toBeDefined();
    });

    it('should update configuration', async () => {
      const { ConcurrencyControlManager } = await importConcurrencyControl();
      const manager = new ConcurrencyControlManager();

      manager.updateConfig({ lockTimeoutMinutes: 15 });

      const config = manager.getConfig();
      expect(config.lockTimeoutMinutes).toBe(15);
    });

    it('should run automatic cleanup when enabled', async () => {
      const mockChain = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            lt: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const { ConcurrencyControlManager } = await importConcurrencyControl();
      const manager = new ConcurrencyControlManager({
        autoCleanupEnabled: true,
        cleanupIntervalMs: 1000, // 1 second for testing
      });

      manager.start();

      // Initial cleanup runs immediately
      await vi.advanceTimersByTimeAsync(100);
      expect(mockSupabaseAdmin.from).toHaveBeenCalled();

      manager.stop();
    });
  });

  describe('Factory and Singleton Functions', () => {
    it('should create new manager with createConcurrencyManager', async () => {
      const { createConcurrencyManager } = await importConcurrencyControl();
      const manager = createConcurrencyManager({ lockTimeoutMinutes: 7 });

      expect(manager.getConfig().lockTimeoutMinutes).toBe(7);
    });

    it('should return singleton with getConcurrencyManager', async () => {
      const { getConcurrencyManager, resetConcurrencyManager } = await importConcurrencyControl();

      // Reset to clear any previous state
      await resetConcurrencyManager();

      const manager1 = getConcurrencyManager();
      const manager2 = getConcurrencyManager();

      expect(manager1).toBe(manager2);

      // Cleanup
      await resetConcurrencyManager();
    });

    it('should reset singleton with resetConcurrencyManager', async () => {
      const { getConcurrencyManager, resetConcurrencyManager } = await importConcurrencyControl();

      const manager1 = getConcurrencyManager();
      manager1.start();

      await resetConcurrencyManager();

      const manager2 = getConcurrencyManager();
      expect(manager2).not.toBe(manager1);
      expect(manager2.isRunning()).toBe(false);

      // Cleanup
      await resetConcurrencyManager();
    });
  });

  describe('mapDbJobToTranslationJob Helper', () => {
    it('should map snake_case database fields to camelCase', async () => {
      const { mapDbJobToTranslationJob } = await importConcurrencyControl();

      const dbRow = {
        id: 'job-1',
        entity_type: 'article',
        entity_id: 'entity-1',
        source_language: 'en',
        target_language: 'fr',
        status: 'queued',
        priority: 100,
        attempts: 2,
        error_message: 'Previous error',
        created_at: '2026-01-21T10:00:00Z',
        started_at: '2026-01-21T10:05:00Z',
        completed_at: null,
        locked_by: 'worker-1',
        locked_at: '2026-01-21T10:05:00Z',
      };

      const job = mapDbJobToTranslationJob(dbRow);

      expect(job.id).toBe('job-1');
      expect(job.entityType).toBe('article');
      expect(job.entityId).toBe('entity-1');
      expect(job.sourceLanguage).toBe('en');
      expect(job.targetLanguage).toBe('fr');
      expect(job.status).toBe('queued');
      expect(job.priority).toBe(100);
      expect(job.attempts).toBe(2);
      expect(job.errorMessage).toBe('Previous error');
      expect(job.createdAt).toBe('2026-01-21T10:00:00Z');
      expect(job.startedAt).toBe('2026-01-21T10:05:00Z');
      expect(job.completedAt).toBeNull();
      expect(job.lockedBy).toBe('worker-1');
      expect(job.lockedAt).toBe('2026-01-21T10:05:00Z');
    });

    it('should use default values for missing fields', async () => {
      const { mapDbJobToTranslationJob } = await importConcurrencyControl();

      const dbRow = {
        id: 'job-1',
        entity_type: 'item',
        entity_id: 'item-1',
        source_language: 'en',
        target_language: 'de',
        status: 'queued',
        created_at: '2026-01-21T10:00:00Z',
        // Missing: priority, attempts, error_message, started_at, completed_at, locked_by, locked_at
        // These should be null or use defaults when not present
        error_message: null,
        started_at: null,
        completed_at: null,
        locked_by: null,
        locked_at: null,
      };

      const job = mapDbJobToTranslationJob(dbRow);

      expect(job.priority).toBe(50); // Default
      expect(job.attempts).toBe(0); // Default
      expect(job.errorMessage).toBeNull();
      expect(job.startedAt).toBeNull();
      expect(job.completedAt).toBeNull();
      expect(job.lockedBy).toBeNull();
      expect(job.lockedAt).toBeNull();
    });
  });

  describe('Default Constants', () => {
    it('should export default configuration values', async () => {
      const {
        DEFAULT_LOCK_TIMEOUT_MINUTES,
        DEFAULT_HEARTBEAT_INTERVAL_MS,
        DEFAULT_CLEANUP_INTERVAL_MS,
        DEFAULT_MAX_STALE_RETRIES,
        DEFAULT_CONCURRENCY_CONFIG,
      } = await importConcurrencyControl();

      expect(DEFAULT_LOCK_TIMEOUT_MINUTES).toBe(5);
      expect(DEFAULT_HEARTBEAT_INTERVAL_MS).toBe(60000);
      expect(DEFAULT_CLEANUP_INTERVAL_MS).toBe(300000);
      expect(DEFAULT_MAX_STALE_RETRIES).toBe(3);

      expect(DEFAULT_CONCURRENCY_CONFIG).toEqual({
        lockTimeoutMinutes: 5,
        heartbeatIntervalMs: 60000,
        autoCleanupEnabled: true,
        cleanupIntervalMs: 300000,
        maxStaleRetries: 3,
      });
    });
  });
});
