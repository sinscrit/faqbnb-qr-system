/**
 * Unit Tests for Job Priority Utilities
 * Part of REQ-E03-018: Implement Job Prioritization
 *
 * Last Modified: 2026-01-21
 */

import {
  PRIORITY_LEVELS,
  RECENT_CONTENT_THRESHOLD_MINUTES,
  isRecentContent,
  calculateJobPriority,
} from '../priority';

describe('PRIORITY_LEVELS constant', () => {
  it('has correct URGENT value of 100', () => {
    expect(PRIORITY_LEVELS.URGENT).toBe(100);
  });

  it('has correct HIGH value of 50', () => {
    expect(PRIORITY_LEVELS.HIGH).toBe(50);
  });

  it('has correct NORMAL value of 25', () => {
    expect(PRIORITY_LEVELS.NORMAL).toBe(25);
  });

  it('has correct LOW value of 10', () => {
    expect(PRIORITY_LEVELS.LOW).toBe(10);
  });
});

describe('RECENT_CONTENT_THRESHOLD_MINUTES constant', () => {
  it('has correct value of 5', () => {
    expect(RECENT_CONTENT_THRESHOLD_MINUTES).toBe(5);
  });
});

describe('isRecentContent', () => {
  it('returns true when content created 2 minutes before job', () => {
    const jobDate = new Date('2026-01-20T10:05:00Z');
    const contentDate = new Date('2026-01-20T10:03:00Z'); // 2 min earlier
    expect(isRecentContent(contentDate, jobDate)).toBe(true);
  });

  it('returns true when content created at same time as job', () => {
    const date = new Date('2026-01-20T10:00:00Z');
    expect(isRecentContent(date, date)).toBe(true);
  });

  it('returns true at exactly 5 minute boundary (inclusive)', () => {
    const jobDate = new Date('2026-01-20T10:05:00Z');
    const contentDate = new Date('2026-01-20T10:00:00Z'); // exactly 5 min earlier
    expect(isRecentContent(contentDate, jobDate)).toBe(true);
  });

  it('returns false when content created 6 minutes before job', () => {
    const jobDate = new Date('2026-01-20T10:06:00Z');
    const contentDate = new Date('2026-01-20T10:00:00Z'); // 6 min earlier
    expect(isRecentContent(contentDate, jobDate)).toBe(false);
  });

  it('returns false when content created after job (future)', () => {
    const jobDate = new Date('2026-01-20T10:00:00Z');
    const contentDate = new Date('2026-01-20T10:05:00Z'); // 5 min later
    expect(isRecentContent(contentDate, jobDate)).toBe(false);
  });

  it('respects custom threshold', () => {
    const jobDate = new Date('2026-01-20T10:10:00Z');
    const contentDate = new Date('2026-01-20T10:02:00Z'); // 8 min earlier
    expect(isRecentContent(contentDate, jobDate, 10)).toBe(true);
    expect(isRecentContent(contentDate, jobDate, 5)).toBe(false);
  });
});

describe('calculateJobPriority', () => {
  describe('Priority 100 - Recent content', () => {
    it('returns URGENT for content created 2 minutes ago', () => {
      const now = new Date();
      const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
      expect(calculateJobPriority({
        contentCreatedAt: twoMinutesAgo,
        jobCreatedAt: now,
      })).toBe(100);
    });

    it('returns URGENT for content created at exact same time', () => {
      const now = new Date();
      expect(calculateJobPriority({
        contentCreatedAt: now,
        jobCreatedAt: now,
      })).toBe(100);
    });

    it('returns URGENT for content created exactly 5 minutes ago', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      expect(calculateJobPriority({
        contentCreatedAt: fiveMinutesAgo,
        jobCreatedAt: now,
      })).toBe(100);
    });
  });

  describe('Priority 50 - Updated content (default)', () => {
    it('returns HIGH when contentCreatedAt is 10 minutes ago', () => {
      const now = new Date();
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
      expect(calculateJobPriority({
        contentCreatedAt: tenMinutesAgo,
        jobCreatedAt: now,
      })).toBe(50);
    });

    it('returns HIGH when no options provided', () => {
      expect(calculateJobPriority({})).toBe(50);
    });

    it('returns HIGH when only jobCreatedAt provided', () => {
      expect(calculateJobPriority({
        jobCreatedAt: new Date(),
      })).toBe(50);
    });
  });

  describe('Priority 25 - Batch imports', () => {
    it('returns NORMAL when batchId is provided', () => {
      expect(calculateJobPriority({
        batchId: 'batch-123',
      })).toBe(25);
    });

    it('returns NORMAL even with old content when batchId present', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      expect(calculateJobPriority({
        contentCreatedAt: oneHourAgo,
        jobCreatedAt: now,
        batchId: 'import-abc',
      })).toBe(25);
    });
  });

  describe('Priority 10 - Retry operations', () => {
    it('returns LOW when retryCount > 0', () => {
      expect(calculateJobPriority({
        retryCount: 1,
      })).toBe(10);
    });

    it('returns LOW when retryCount is 2', () => {
      expect(calculateJobPriority({
        retryCount: 2,
      })).toBe(10);
    });
  });

  describe('Priority precedence', () => {
    it('recency takes precedence over retry', () => {
      const now = new Date();
      const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
      expect(calculateJobPriority({
        contentCreatedAt: twoMinutesAgo,
        jobCreatedAt: now,
        retryCount: 3,
      })).toBe(100); // URGENT, not LOW
    });

    it('recency takes precedence over batchId', () => {
      const now = new Date();
      const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
      expect(calculateJobPriority({
        contentCreatedAt: twoMinutesAgo,
        jobCreatedAt: now,
        batchId: 'batch-123',
      })).toBe(100); // URGENT, not NORMAL
    });

    it('batchId takes precedence over retry when not recent', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      expect(calculateJobPriority({
        contentCreatedAt: oneHourAgo,
        jobCreatedAt: now,
        batchId: 'batch-123',
        retryCount: 2,
      })).toBe(25); // NORMAL, not LOW
    });
  });

  describe('Edge cases', () => {
    it('handles ISO string dates', () => {
      expect(calculateJobPriority({
        contentCreatedAt: '2026-01-20T10:00:00Z',
        jobCreatedAt: '2026-01-20T10:02:00Z',
      })).toBe(100);
    });

    it('handles null batchId', () => {
      expect(calculateJobPriority({
        batchId: null,
      })).toBe(50);
    });

    it('handles retryCount of 0', () => {
      expect(calculateJobPriority({
        retryCount: 0,
      })).toBe(50);
    });

    it('handles invalid date string by falling back to jobCreatedAt', () => {
      const now = new Date();
      expect(calculateJobPriority({
        contentCreatedAt: 'invalid-date',
        jobCreatedAt: now,
      })).toBe(100); // Falls back to same time as job, so URGENT
    });
  });
});
