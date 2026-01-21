/**
 * Rate Limiting Under Load Performance Tests
 *
 * Tests that verify rate limiting functions correctly under high load
 * without causing excessive failures.
 *
 * @module job-queue/__tests__/performance/rate-limiting-under-load.perf.test
 * @lastModified 2026-01-21
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createMetricsCollector,
  delay,
} from './helpers';
import type { RateLimitEvent } from './helpers';

// ============================================================================
// Mock Rate Limiter
// ============================================================================

interface MockRateLimiter {
  acquire(): Promise<void>;
  canAcquire(): boolean;
  getStatus(): { remaining: number; isLimited: boolean; queueLength: number };
  getQueueLength(): number;
  reset(): void;
}

function createMockRateLimiter(config: {
  maxRequests: number;
  windowMs: number;
  strategy: 'queue' | 'reject';
  maxQueueSize: number;
  queueTimeoutMs: number;
}): MockRateLimiter {
  let requestCount = 0;
  let windowStart = Date.now();
  const queue: Array<() => void> = [];
  let processingInterval: ReturnType<typeof setInterval> | null = null;

  const checkWindow = (): void => {
    const now = Date.now();
    if (now - windowStart >= config.windowMs) {
      requestCount = 0;
      windowStart = now;
    }
  };

  const processQueue = (): void => {
    checkWindow();
    while (queue.length > 0 && requestCount < config.maxRequests) {
      const next = queue.shift();
      if (next) next();
    }
    // Stop interval if queue is empty
    if (queue.length === 0 && processingInterval) {
      clearInterval(processingInterval);
      processingInterval = null;
    }
  };

  const startQueueProcessor = (): void => {
    if (!processingInterval) {
      // Check every 50ms for faster processing
      processingInterval = setInterval(processQueue, 50);
    }
  };

  return {
    async acquire(): Promise<void> {
      checkWindow();

      if (requestCount < config.maxRequests) {
        requestCount++;
        return;
      }

      if (config.strategy === 'reject') {
        throw new Error('Rate limit exceeded');
      }

      // Queue strategy
      if (queue.length >= config.maxQueueSize) {
        throw new Error('Rate limit queue full');
      }

      return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          const index = queue.indexOf(resolve);
          if (index > -1) queue.splice(index, 1);
          reject(new Error('Rate limit queue timeout'));
        }, config.queueTimeoutMs);

        queue.push(() => {
          clearTimeout(timeout);
          requestCount++;
          resolve();
        });

        // Start queue processor
        startQueueProcessor();
      });
    },

    canAcquire(): boolean {
      checkWindow();
      return requestCount < config.maxRequests;
    },

    getStatus(): { remaining: number; isLimited: boolean; queueLength: number } {
      checkWindow();
      return {
        remaining: Math.max(0, config.maxRequests - requestCount),
        isLimited: requestCount >= config.maxRequests,
        queueLength: queue.length,
      };
    },

    getQueueLength(): number {
      return queue.length;
    },

    reset(): void {
      requestCount = 0;
      windowStart = Date.now();
      queue.length = 0;
      if (processingInterval) {
        clearInterval(processingInterval);
        processingInterval = null;
      }
    },
  };
}

// ============================================================================
// Test Suite
// ============================================================================

describe('Rate Limiting Under Load', () => {
  let metricsCollector: ReturnType<typeof createMetricsCollector>;

  beforeEach(() => {
    vi.clearAllMocks();
    metricsCollector = createMetricsCollector('rate-limiting', {
      totalJobs: 50,
      maxConcurrent: 10,
      batchSize: 10,
      mockLatencyRange: { min: 50, max: 50 },
      rateLimitConfig: { maxRequests: 10, windowMs: 1000 },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throttles requests correctly without excessive failures', async () => {
    const rateLimiter = createMockRateLimiter({
      maxRequests: 10,
      windowMs: 1000,
      strategy: 'queue',
      maxQueueSize: 200,
      queueTimeoutMs: 30000,
    });

    const rateLimitEvents: RateLimitEvent[] = [];
    let completedRequests = 0;
    let throttledCount = 0;

    // Create 50 rapid requests (exceeds 10/sec limit)
    const requestPromises = Array.from({ length: 50 }, async (_, i) => {
      const canAcquire = rateLimiter.canAcquire();
      if (!canAcquire) {
        throttledCount++;
      }

      const startWait = performance.now();
      await rateLimiter.acquire();
      const waitTime = performance.now() - startWait;

      rateLimitEvents.push({
        timestamp: Date.now(),
        action: canAcquire ? 'immediate' : 'queued',
        queueSize: rateLimiter.getQueueLength(),
        waitTimeMs: waitTime,
      });

      // Simulate API call
      await delay(50);
      completedRequests++;
    });

    await Promise.all(requestPromises);

    const status = rateLimiter.getStatus();

    // Verify rate limiting occurred
    expect(throttledCount).toBeGreaterThan(0);

    // All requests should complete (queued, not rejected)
    expect(completedRequests).toBe(50);

    // After all requests complete, limiter should have capacity
    expect(status.queueLength).toBe(0);

    console.log('Rate Limiting Test Results:', {
      totalRequests: 50,
      throttledCount,
      completedRequests,
      immediateRequests: rateLimitEvents.filter(e => e.action === 'immediate').length,
      queuedRequests: rateLimitEvents.filter(e => e.action === 'queued').length,
    });
  });

  it('queue strategy prevents failures under burst load', async () => {
    const rateLimiter = createMockRateLimiter({
      maxRequests: 5,
      windowMs: 1000,
      strategy: 'queue',
      maxQueueSize: 100,
      queueTimeoutMs: 60000,
    });

    const results: Array<{ success: boolean; error?: string }> = [];

    // Burst of 20 requests with very strict limit (5/sec)
    const requestPromises = Array.from({ length: 20 }, async () => {
      try {
        await rateLimiter.acquire();
        await delay(10);
        results.push({ success: true });
      } catch (error) {
        results.push({ success: false, error: String(error) });
      }
    });

    await Promise.all(requestPromises);

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    // With queue strategy, all should eventually succeed
    expect(successful).toBe(20);
    expect(failed).toBe(0);

    console.log('Queue Strategy Results:', { successful, failed });
  });

  it('reject strategy fails excess requests immediately', async () => {
    const rateLimiter = createMockRateLimiter({
      maxRequests: 5,
      windowMs: 1000,
      strategy: 'reject',
      maxQueueSize: 0,
      queueTimeoutMs: 0,
    });

    const results: Array<{ success: boolean; error?: string }> = [];

    // Burst of 20 requests with reject strategy
    const requestPromises = Array.from({ length: 20 }, async () => {
      try {
        await rateLimiter.acquire();
        results.push({ success: true });
      } catch (error) {
        results.push({ success: false, error: String(error) });
      }
    });

    await Promise.all(requestPromises);

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    // First 5 should succeed, rest should fail
    expect(successful).toBe(5);
    expect(failed).toBe(15);

    console.log('Reject Strategy Results:', { successful, failed });
  });

  it('rate limiter recovers after window reset', async () => {
    const rateLimiter = createMockRateLimiter({
      maxRequests: 10,
      windowMs: 500, // Short window for test
      strategy: 'queue',
      maxQueueSize: 50,
      queueTimeoutMs: 5000,
    });

    // Exhaust the limit
    for (let i = 0; i < 10; i++) {
      await rateLimiter.acquire();
    }

    // Should be limited
    expect(rateLimiter.canAcquire()).toBe(false);

    // Wait for window reset
    await delay(600);

    // Should have capacity again
    expect(rateLimiter.canAcquire()).toBe(true);
    expect(rateLimiter.getStatus().remaining).toBe(10);

    console.log('Rate Limiter Recovery: verified window reset');
  });

  it('measures queue wait time under sustained load', async () => {
    const rateLimiter = createMockRateLimiter({
      maxRequests: 10,
      windowMs: 1000,
      strategy: 'queue',
      maxQueueSize: 100,
      queueTimeoutMs: 30000,
    });

    const waitTimes: number[] = [];

    // Sustained load: 30 requests over time
    for (let i = 0; i < 30; i++) {
      const start = performance.now();
      await rateLimiter.acquire();
      waitTimes.push(performance.now() - start);

      // Small delay between requests
      await delay(20);
    }

    const avgWait = waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length;
    const maxWait = Math.max(...waitTimes);

    console.log('Queue Wait Time Analysis:', {
      avgWaitMs: avgWait.toFixed(2),
      maxWaitMs: maxWait.toFixed(2),
      requestsWithWait: waitTimes.filter(t => t > 10).length,
    });

    // Average wait should be reasonable (under 5 seconds)
    expect(avgWait).toBeLessThan(5000);
  });
});
