/**
 * Unit tests for Stale Job Cleanup (REQ-E03-020)
 *
 * @module job-queue/__tests__/stale-job-cleanup.test.ts
 * @created 2026-01-21
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  cleanupStaleProcessingJobs,
  type CleanupResult,
} from '../concurrency-control';

// Mock supabaseAdmin
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

// Import after mock is set up
import { supabaseAdmin } from '@/lib/supabase';

describe('Stale Job Cleanup (REQ-E03-020)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('CleanupResult interface', () => {
    it('should have resetJobIds and failedJobIds arrays', async () => {
      // Setup mock for no stale jobs
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            lt: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      });
      vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);

      const result = await cleanupStaleProcessingJobs({
        lockTimeoutMinutes: 5,
        maxStaleRetries: 3,
      });

      // Verify the new interface structure
      expect(result).toHaveProperty('resetJobIds');
      expect(result).toHaveProperty('failedJobIds');
      expect(Array.isArray(result.resetJobIds)).toBe(true);
      expect(Array.isArray(result.failedJobIds)).toBe(true);
    });

    it('should have optional error field for error cases', async () => {
      // Setup mock to return an error
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            lt: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
          }),
        }),
      });
      vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);

      const result = await cleanupStaleProcessingJobs();

      expect(result).toHaveProperty('error');
      expect(result.error).toBe('DB error');
    });
  });

  describe('cleanupStaleProcessingJobs', () => {
    it('should detect jobs in processing state for > 5 minutes', async () => {
      const staleJob = {
        id: 'stale-job-1',
        attempts: 0,
      };

      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          lt: vi.fn().mockResolvedValue({ data: [staleJob], error: null }),
        }),
      });

      const updateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const mockFrom = vi.fn().mockImplementation((table: string) => {
        return {
          select: selectMock,
          update: updateMock,
        };
      });

      vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);

      const result = await cleanupStaleProcessingJobs({
        lockTimeoutMinutes: 5,
        maxStaleRetries: 3,
      });

      expect(result.staleJobsFound).toBe(1);
      expect(selectMock).toHaveBeenCalledWith('id, attempts');
    });

    it('should reset jobs with attempts < maxRetries to queued', async () => {
      const staleJob = {
        id: 'stale-job-2',
        attempts: 1, // Less than maxRetries (3)
      };

      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          lt: vi.fn().mockResolvedValue({ data: [staleJob], error: null }),
        }),
      });

      const updateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
        in: vi.fn().mockResolvedValue({ error: null }),
      });

      vi.mocked(supabaseAdmin.from).mockImplementation(() => ({
        select: selectMock,
        update: updateMock,
      }));

      const result = await cleanupStaleProcessingJobs({
        lockTimeoutMinutes: 5,
        maxStaleRetries: 3,
      });

      expect(result.jobsReset).toBe(1);
      expect(result.jobsMarkedFailed).toBe(0);
      expect(result.resetJobIds).toContain('stale-job-2');
    });

    it('should increment attempts counter when resetting', async () => {
      const staleJob = {
        id: 'stale-job-3',
        attempts: 1,
      };

      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          lt: vi.fn().mockResolvedValue({ data: [staleJob], error: null }),
        }),
      });

      let capturedUpdateData: Record<string, unknown> | null = null;
      const updateMock = vi.fn().mockImplementation((data: Record<string, unknown>) => {
        capturedUpdateData = data;
        return {
          eq: vi.fn().mockResolvedValue({ error: null }),
          in: vi.fn().mockResolvedValue({ error: null }),
        };
      });

      vi.mocked(supabaseAdmin.from).mockImplementation(() => ({
        select: selectMock,
        update: updateMock,
      }));

      await cleanupStaleProcessingJobs({ maxStaleRetries: 3 });

      // Verify attempts was incremented
      expect(updateMock).toHaveBeenCalled();
      expect(capturedUpdateData).toMatchObject({
        status: 'queued',
        attempts: 2, // 1 + 1 = 2
      });
    });

    it('should mark jobs with attempts >= maxRetries as failed', async () => {
      const staleJob = {
        id: 'stale-job-4',
        attempts: 3, // Equal to maxRetries
      };

      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          lt: vi.fn().mockResolvedValue({ data: [staleJob], error: null }),
        }),
      });

      let capturedUpdateData: Record<string, unknown> | null = null;
      const updateMock = vi.fn().mockImplementation((data: Record<string, unknown>) => {
        capturedUpdateData = data;
        return {
          eq: vi.fn().mockResolvedValue({ error: null }),
          in: vi.fn().mockResolvedValue({ error: null }),
        };
      });

      vi.mocked(supabaseAdmin.from).mockImplementation(() => ({
        select: selectMock,
        update: updateMock,
      }));

      const result = await cleanupStaleProcessingJobs({ maxStaleRetries: 3 });

      expect(result.jobsReset).toBe(0);
      expect(result.jobsMarkedFailed).toBe(1);
      expect(result.failedJobIds).toContain('stale-job-4');
    });

    it('should set error_message to "exceeded_max_retries_after_stale"', async () => {
      const staleJob = {
        id: 'stale-job-5',
        attempts: 3,
      };

      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          lt: vi.fn().mockResolvedValue({ data: [staleJob], error: null }),
        }),
      });

      let capturedUpdateData: Record<string, unknown> | null = null;
      const updateMock = vi.fn().mockImplementation((data: Record<string, unknown>) => {
        capturedUpdateData = data;
        return {
          eq: vi.fn().mockResolvedValue({ error: null }),
          in: vi.fn().mockResolvedValue({ error: null }),
        };
      });

      vi.mocked(supabaseAdmin.from).mockImplementation(() => ({
        select: selectMock,
        update: updateMock,
      }));

      await cleanupStaleProcessingJobs({ maxStaleRetries: 3 });

      // Verify the exact error message
      expect(capturedUpdateData).toMatchObject({
        status: 'failed',
        error_message: 'exceeded_max_retries_after_stale',
      });
    });

    it('should clear locked_by and locked_at fields', async () => {
      const staleJob = {
        id: 'stale-job-6',
        attempts: 1,
      };

      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          lt: vi.fn().mockResolvedValue({ data: [staleJob], error: null }),
        }),
      });

      let capturedUpdateData: Record<string, unknown> | null = null;
      const updateMock = vi.fn().mockImplementation((data: Record<string, unknown>) => {
        capturedUpdateData = data;
        return {
          eq: vi.fn().mockResolvedValue({ error: null }),
          in: vi.fn().mockResolvedValue({ error: null }),
        };
      });

      vi.mocked(supabaseAdmin.from).mockImplementation(() => ({
        select: selectMock,
        update: updateMock,
      }));

      await cleanupStaleProcessingJobs({ maxStaleRetries: 3 });

      expect(capturedUpdateData).toMatchObject({
        locked_by: null,
        locked_at: null,
      });
    });

    it('should return accurate counts in CleanupResult', async () => {
      const staleJobs = [
        { id: 'job-1', attempts: 0 }, // Will be reset
        { id: 'job-2', attempts: 1 }, // Will be reset
        { id: 'job-3', attempts: 3 }, // Will be failed
        { id: 'job-4', attempts: 5 }, // Will be failed
      ];

      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          lt: vi.fn().mockResolvedValue({ data: staleJobs, error: null }),
        }),
      });

      const updateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
        in: vi.fn().mockResolvedValue({ error: null }),
      });

      vi.mocked(supabaseAdmin.from).mockImplementation(() => ({
        select: selectMock,
        update: updateMock,
      }));

      const result = await cleanupStaleProcessingJobs({ maxStaleRetries: 3 });

      expect(result.staleJobsFound).toBe(4);
      expect(result.jobsReset).toBe(2);
      expect(result.jobsMarkedFailed).toBe(2);
      expect(result.resetJobIds).toHaveLength(2);
      expect(result.failedJobIds).toHaveLength(2);
    });

    it('should use configurable staleThresholdMinutes', async () => {
      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          lt: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      vi.mocked(supabaseAdmin.from).mockImplementation(() => ({
        select: selectMock,
      }));

      await cleanupStaleProcessingJobs({
        lockTimeoutMinutes: 10, // Custom threshold
        maxStaleRetries: 3,
      });

      // The function should have been called - we can't easily verify the threshold
      // calculation but we verify it doesn't error with custom value
      expect(selectMock).toHaveBeenCalled();
    });

    it('should use configurable maxStaleRetries', async () => {
      const staleJobs = [
        { id: 'job-1', attempts: 1 }, // Will be reset with maxRetries=2
        { id: 'job-2', attempts: 2 }, // Will be failed with maxRetries=2
      ];

      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          lt: vi.fn().mockResolvedValue({ data: staleJobs, error: null }),
        }),
      });

      const updateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
        in: vi.fn().mockResolvedValue({ error: null }),
      });

      vi.mocked(supabaseAdmin.from).mockImplementation(() => ({
        select: selectMock,
        update: updateMock,
      }));

      const result = await cleanupStaleProcessingJobs({
        maxStaleRetries: 2, // Custom retry limit
      });

      expect(result.jobsReset).toBe(1);
      expect(result.jobsMarkedFailed).toBe(1);
    });

    it('should handle empty queue gracefully', async () => {
      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          lt: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      vi.mocked(supabaseAdmin.from).mockImplementation(() => ({
        select: selectMock,
      }));

      const result = await cleanupStaleProcessingJobs();

      expect(result.staleJobsFound).toBe(0);
      expect(result.jobsReset).toBe(0);
      expect(result.jobsMarkedFailed).toBe(0);
      expect(result.resetJobIds).toHaveLength(0);
      expect(result.failedJobIds).toHaveLength(0);
    });

    it('should handle database errors gracefully', async () => {
      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          lt: vi.fn().mockResolvedValue({ data: null, error: { message: 'Connection failed' } }),
        }),
      });

      vi.mocked(supabaseAdmin.from).mockImplementation(() => ({
        select: selectMock,
      }));

      const result = await cleanupStaleProcessingJobs();

      expect(result.staleJobsFound).toBe(0);
      expect(result.error).toBe('Connection failed');
    });

    it('should return separate arrays for reset vs failed job IDs', async () => {
      const staleJobs = [
        { id: 'reset-1', attempts: 0 },
        { id: 'reset-2', attempts: 1 },
        { id: 'failed-1', attempts: 3 },
      ];

      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          lt: vi.fn().mockResolvedValue({ data: staleJobs, error: null }),
        }),
      });

      const updateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
        in: vi.fn().mockResolvedValue({ error: null }),
      });

      vi.mocked(supabaseAdmin.from).mockImplementation(() => ({
        select: selectMock,
        update: updateMock,
      }));

      const result = await cleanupStaleProcessingJobs({ maxStaleRetries: 3 });

      expect(result.resetJobIds).toContain('reset-1');
      expect(result.resetJobIds).toContain('reset-2');
      expect(result.resetJobIds).not.toContain('failed-1');

      expect(result.failedJobIds).toContain('failed-1');
      expect(result.failedJobIds).not.toContain('reset-1');
      expect(result.failedJobIds).not.toContain('reset-2');
    });
  });
});
