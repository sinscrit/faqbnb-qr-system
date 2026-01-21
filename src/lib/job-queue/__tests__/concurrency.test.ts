/**
 * Unit tests for TranslationSemaphore
 * Tests for REQ-E03-019: Implement Concurrency Control
 *
 * @created 2026-01-21
 * @lastModified 2026-01-21
 */

import {
  TranslationSemaphore,
  createTranslationSemaphore,
  getTranslationSemaphore,
  resetTranslationSemaphore,
  isRateLimitError,
  DEFAULT_SEMAPHORE_CONFIG,
} from '../concurrency';

describe('TranslationSemaphore', () => {
  afterEach(() => {
    // Reset global semaphore after each test
    resetTranslationSemaphore();
  });

  // ===========================================================================
  // Task 12: Core Semaphore Tests
  // ===========================================================================
  describe('Core Semaphore Functionality', () => {
    describe('constructor and configuration', () => {
      it('should use default configuration when none provided', () => {
        const semaphore = createTranslationSemaphore();
        const metrics = semaphore.getMetrics();

        expect(metrics.activeCount).toBe(0);
        expect(metrics.queueDepth).toBe(0);
      });

      it('should accept custom maxConcurrent configuration', () => {
        const semaphore = createTranslationSemaphore({ maxConcurrent: 5 });

        // Should be able to acquire 5 slots
        for (let i = 0; i < 5; i++) {
          expect(semaphore.tryAcquire()).toBe(true);
        }
        // 6th should fail
        expect(semaphore.tryAcquire()).toBe(false);
      });
    });

    describe('acquire() and release()', () => {
      it('should acquire slot when available', async () => {
        const semaphore = createTranslationSemaphore({ maxConcurrent: 2 });

        await semaphore.acquire();
        expect(semaphore.getMetrics().activeCount).toBe(1);

        await semaphore.acquire();
        expect(semaphore.getMetrics().activeCount).toBe(2);
      });

      it('should release slot correctly', async () => {
        const semaphore = createTranslationSemaphore({ maxConcurrent: 2 });

        await semaphore.acquire();
        await semaphore.acquire();
        expect(semaphore.getMetrics().activeCount).toBe(2);

        semaphore.release();
        expect(semaphore.getMetrics().activeCount).toBe(1);

        semaphore.release();
        expect(semaphore.getMetrics().activeCount).toBe(0);
      });

      it('should queue requests when all slots are in use', async () => {
        const semaphore = createTranslationSemaphore({
          maxConcurrent: 1,
          acquireTimeoutMs: 5000,
        });

        // First acquire succeeds immediately
        await semaphore.acquire();
        expect(semaphore.getMetrics().activeCount).toBe(1);

        // Second acquire should queue
        const acquirePromise = semaphore.acquire();

        // Give it a moment to queue
        await new Promise(resolve => setTimeout(resolve, 10));
        expect(semaphore.getMetrics().queueDepth).toBe(1);

        // Release first slot - should grant to queued request
        semaphore.release();

        // Wait for queued acquire to complete
        await acquirePromise;
        expect(semaphore.getMetrics().activeCount).toBe(1);
        expect(semaphore.getMetrics().queueDepth).toBe(0);

        // Clean up
        semaphore.release();
      });

      it('should timeout when waiting too long', async () => {
        const semaphore = createTranslationSemaphore({
          maxConcurrent: 1,
          acquireTimeoutMs: 50, // Short timeout
        });

        // Fill all slots
        await semaphore.acquire();

        // Try to acquire another - should timeout
        await expect(semaphore.acquire()).rejects.toThrow(/timeout/i);

        // Clean up
        semaphore.release();
      });

      it('should process queue in FIFO order', async () => {
        const semaphore = createTranslationSemaphore({
          maxConcurrent: 1,
          acquireTimeoutMs: 5000,
        });

        const order: number[] = [];

        // Fill the slot
        await semaphore.acquire();

        // Queue multiple requests
        const promise1 = semaphore.acquire().then(() => order.push(1));
        const promise2 = semaphore.acquire().then(() => order.push(2));
        const promise3 = semaphore.acquire().then(() => order.push(3));

        // Wait a moment for queuing
        await new Promise(resolve => setTimeout(resolve, 10));

        // Release slots one by one
        semaphore.release(); // grants to promise1
        await promise1;

        semaphore.release(); // grants to promise2
        await promise2;

        semaphore.release(); // grants to promise3
        await promise3;

        semaphore.release(); // final cleanup

        // Verify FIFO order
        expect(order).toEqual([1, 2, 3]);
      });
    });

    describe('tryAcquire()', () => {
      it('should return true when slot available', () => {
        const semaphore = createTranslationSemaphore({ maxConcurrent: 2 });

        expect(semaphore.tryAcquire()).toBe(true);
        expect(semaphore.getMetrics().activeCount).toBe(1);
      });

      it('should return false when no slot available', () => {
        const semaphore = createTranslationSemaphore({ maxConcurrent: 1 });

        expect(semaphore.tryAcquire()).toBe(true);
        expect(semaphore.tryAcquire()).toBe(false);
      });

      it('should return false during backoff', () => {
        const semaphore = createTranslationSemaphore({ maxConcurrent: 2 });

        semaphore.notifyRateLimit();
        expect(semaphore.tryAcquire()).toBe(false);
      });
    });

    describe('isAvailable()', () => {
      it('should return true when slots available and no backoff', () => {
        const semaphore = createTranslationSemaphore({ maxConcurrent: 2 });
        expect(semaphore.isAvailable()).toBe(true);
      });

      it('should return false when no slots available', () => {
        const semaphore = createTranslationSemaphore({ maxConcurrent: 1 });
        semaphore.tryAcquire();
        expect(semaphore.isAvailable()).toBe(false);
      });

      it('should return false during backoff', () => {
        const semaphore = createTranslationSemaphore({ maxConcurrent: 2 });
        semaphore.notifyRateLimit();
        expect(semaphore.isAvailable()).toBe(false);
      });
    });
  });

  // ===========================================================================
  // Task 13: Rate Limit Backoff Tests
  // ===========================================================================
  describe('Rate Limit Backoff', () => {
    describe('notifyRateLimit()', () => {
      it('should enter backoff mode on rate limit', () => {
        const semaphore = createTranslationSemaphore();

        expect(semaphore.isBackoffActive()).toBe(false);
        semaphore.notifyRateLimit();
        expect(semaphore.isBackoffActive()).toBe(true);
      });

      it('should increase backoff duration on consecutive rate limits', () => {
        const semaphore = createTranslationSemaphore();

        semaphore.notifyRateLimit();
        const firstState = semaphore.getBackoffState();

        semaphore.notifyRateLimit();
        const secondState = semaphore.getBackoffState();

        expect(secondState.consecutiveRateLimits).toBe(2);
        expect(secondState.backoffUntil!.getTime()).toBeGreaterThan(
          firstState.backoffUntil!.getTime()
        );
      });
    });

    describe('notifySuccess()', () => {
      it('should reset consecutive rate limit counter on success', () => {
        const semaphore = createTranslationSemaphore();

        semaphore.notifyRateLimit();
        semaphore.notifyRateLimit();
        expect(semaphore.getBackoffState().consecutiveRateLimits).toBe(2);

        semaphore.notifySuccess();
        expect(semaphore.getBackoffState().consecutiveRateLimits).toBe(0);
      });
    });

    describe('getBackoffState()', () => {
      it('should return correct initial state', () => {
        const semaphore = createTranslationSemaphore();
        const state = semaphore.getBackoffState();

        expect(state.isInBackoff).toBe(false);
        expect(state.backoffUntil).toBe(null);
        expect(state.consecutiveRateLimits).toBe(0);
        expect(state.lastRateLimitAt).toBe(null);
      });

      it('should track last rate limit timestamp', () => {
        const semaphore = createTranslationSemaphore();
        const beforeTime = new Date();

        semaphore.notifyRateLimit();

        const state = semaphore.getBackoffState();
        expect(state.lastRateLimitAt).not.toBe(null);
        expect(state.lastRateLimitAt!.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      });
    });
  });

  // ===========================================================================
  // Metrics Tests
  // ===========================================================================
  describe('Metrics', () => {
    describe('getMetrics()', () => {
      it('should return accurate counts', async () => {
        const semaphore = createTranslationSemaphore({ maxConcurrent: 3 });

        await semaphore.acquire();
        await semaphore.acquire();

        const metrics = semaphore.getMetrics();
        expect(metrics.activeCount).toBe(2);
        expect(metrics.totalAcquired).toBe(2);
        expect(metrics.totalReleased).toBe(0);

        semaphore.release();

        const updatedMetrics = semaphore.getMetrics();
        expect(updatedMetrics.activeCount).toBe(1);
        expect(updatedMetrics.totalReleased).toBe(1);

        // Clean up
        semaphore.release();
      });

      it('should track timeout count', async () => {
        const semaphore = createTranslationSemaphore({
          maxConcurrent: 1,
          acquireTimeoutMs: 20,
        });

        await semaphore.acquire();

        // This should timeout
        try {
          await semaphore.acquire();
        } catch {
          // Expected timeout
        }

        expect(semaphore.getMetrics().totalTimeouts).toBe(1);

        // Clean up
        semaphore.release();
      });
    });
  });

  // ===========================================================================
  // Factory Functions Tests
  // ===========================================================================
  describe('Factory Functions', () => {
    describe('createTranslationSemaphore()', () => {
      it('should create isolated instances', () => {
        const s1 = createTranslationSemaphore();
        const s2 = createTranslationSemaphore();

        s1.tryAcquire();

        expect(s1.getMetrics().activeCount).toBe(1);
        expect(s2.getMetrics().activeCount).toBe(0);
      });
    });

    describe('getTranslationSemaphore()', () => {
      it('should return singleton instance', () => {
        const s1 = getTranslationSemaphore();
        const s2 = getTranslationSemaphore();

        expect(s1).toBe(s2);
      });
    });

    describe('resetTranslationSemaphore()', () => {
      it('should clear singleton instance', () => {
        const s1 = getTranslationSemaphore();
        s1.tryAcquire();

        resetTranslationSemaphore();

        const s2 = getTranslationSemaphore();
        expect(s2).not.toBe(s1);
        expect(s2.getMetrics().activeCount).toBe(0);
      });
    });
  });

  // ===========================================================================
  // isRateLimitError() Tests
  // ===========================================================================
  describe('isRateLimitError()', () => {
    it('should detect HTTP 429 status', () => {
      expect(isRateLimitError({ status: 429 })).toBe(true);
      expect(isRateLimitError({ status: 200 })).toBe(false);
    });

    it('should detect rate limit error codes', () => {
      expect(isRateLimitError({ code: 'RATE_LIMITED' })).toBe(true);
      expect(isRateLimitError({ code: 'TOO_MANY_REQUESTS' })).toBe(true);
      expect(isRateLimitError({ code: 'NOT_FOUND' })).toBe(false);
    });

    it('should detect rate limit in error messages', () => {
      expect(isRateLimitError(new Error('Rate limit exceeded'))).toBe(true);
      expect(isRateLimitError(new Error('Too many requests'))).toBe(true);
      expect(isRateLimitError(new Error('Error 429: Rate limited'))).toBe(true);
      expect(isRateLimitError(new Error('Connection error'))).toBe(false);
    });

    it('should handle null/undefined', () => {
      expect(isRateLimitError(null)).toBe(false);
      expect(isRateLimitError(undefined)).toBe(false);
    });

    it('should handle string errors', () => {
      expect(isRateLimitError('rate limit exceeded')).toBe(true);
      expect(isRateLimitError('unknown error')).toBe(false);
    });
  });

  // ===========================================================================
  // Task 14: Integration Tests
  // ===========================================================================
  describe('Integration', () => {
    describe('Concurrent job simulation', () => {
      it('should limit concurrent translations to maxConcurrent', async () => {
        const semaphore = createTranslationSemaphore({ maxConcurrent: 3 });
        const concurrentCounts: number[] = [];

        // Simulate 10 translation jobs
        const simulateTranslation = async (id: number) => {
          await semaphore.acquire();
          concurrentCounts.push(semaphore.getMetrics().activeCount);

          // Simulate translation work
          await new Promise(resolve => setTimeout(resolve, 50));

          semaphore.release();
        };

        // Run all 10 jobs concurrently
        await Promise.all(
          Array.from({ length: 10 }, (_, i) => simulateTranslation(i))
        );

        // Verify no more than 3 were ever concurrent
        expect(Math.max(...concurrentCounts)).toBeLessThanOrEqual(3);
      });
    });

    describe('Rate limit recovery', () => {
      it('should recover after backoff period', async () => {
        // Create semaphore with very short backoff for testing
        const originalEnv = process.env.TRANSLATION_RATE_LIMIT_BASE_DELAY_MS;
        process.env.TRANSLATION_RATE_LIMIT_BASE_DELAY_MS = '50';

        const semaphore = createTranslationSemaphore({
          maxConcurrent: 2,
        });

        // Trigger rate limit
        semaphore.notifyRateLimit();
        expect(semaphore.isBackoffActive()).toBe(true);

        // Wait for backoff to expire
        await new Promise(resolve => setTimeout(resolve, 100));

        // Should be able to acquire now
        await semaphore.acquire();
        expect(semaphore.getMetrics().activeCount).toBe(1);

        // Clean up
        semaphore.release();
        process.env.TRANSLATION_RATE_LIMIT_BASE_DELAY_MS = originalEnv;
      });
    });
  });
});

// ===========================================================================
// Default Configuration Tests
// ===========================================================================
describe('DEFAULT_SEMAPHORE_CONFIG', () => {
  it('should have reasonable defaults', () => {
    expect(DEFAULT_SEMAPHORE_CONFIG.maxConcurrent).toBeGreaterThan(0);
    expect(DEFAULT_SEMAPHORE_CONFIG.acquireTimeoutMs).toBeGreaterThan(0);
    expect(DEFAULT_SEMAPHORE_CONFIG.enableMetrics).toBe(true);
  });
});
