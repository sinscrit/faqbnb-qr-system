import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  RateLimiter,
  RateLimitError,
  ProviderRateLimitManager,
  createRateLimiter,
  getGlobalRateLimitManager,
  resetGlobalRateLimitManager,
} from '../rate-limiter';

describe('RateLimiter', () => {
  afterEach(() => {
    resetGlobalRateLimitManager();
  });

  describe('initialization', () => {
    it('should create with default configuration', () => {
      const limiter = createRateLimiter();
      const status = limiter.getStatus();

      expect(status.limit).toBe(60);
      expect(status.remaining).toBe(60);
      expect(status.isLimited).toBe(false);

      limiter.destroy();
    });

    it('should create with custom configuration', () => {
      const limiter = createRateLimiter({
        maxRequests: 10,
        windowMs: 5000,
        strategy: 'reject',
      });
      const status = limiter.getStatus();

      expect(status.limit).toBe(10);
      expect(status.remaining).toBe(10);

      limiter.destroy();
    });
  });

  describe('acquire', () => {
    it('should acquire successfully when under limit', async () => {
      const limiter = createRateLimiter({ maxRequests: 5, strategy: 'reject' });

      await expect(limiter.acquire()).resolves.toBeUndefined();
      expect(limiter.getStatus().remaining).toBe(4);

      limiter.destroy();
    });

    it('should reject when limit exceeded (reject strategy)', async () => {
      const limiter = createRateLimiter({ maxRequests: 2, strategy: 'reject' });

      await limiter.acquire();
      await limiter.acquire();

      await expect(limiter.acquire()).rejects.toThrow(RateLimitError);

      limiter.destroy();
    });

    it('should queue requests when limit exceeded (queue strategy)', async () => {
      const limiter = createRateLimiter({
        maxRequests: 1,
        windowMs: 100,
        strategy: 'queue',
      });

      const results: number[] = [];

      // First request goes through immediately
      await limiter.acquire();
      results.push(1);

      // Second request should queue and complete after window resets
      const secondRequest = limiter.acquire().then(() => {
        results.push(2);
      });

      // Wait for queue processing
      await new Promise(resolve => setTimeout(resolve, 200));
      await secondRequest;

      expect(results).toEqual([1, 2]);

      limiter.destroy();
    });
  });

  describe('canAcquire', () => {
    it('should return true when under limit', () => {
      const limiter = createRateLimiter({ maxRequests: 5 });

      expect(limiter.canAcquire()).toBe(true);

      limiter.destroy();
    });

    it('should return false when at limit', async () => {
      const limiter = createRateLimiter({ maxRequests: 1, strategy: 'reject' });

      await limiter.acquire();
      expect(limiter.canAcquire()).toBe(false);

      limiter.destroy();
    });
  });

  describe('getStatus', () => {
    it('should return correct status', async () => {
      const limiter = createRateLimiter({ maxRequests: 5, strategy: 'reject' });

      await limiter.acquire();
      await limiter.acquire();

      const status = limiter.getStatus();
      expect(status.remaining).toBe(3);
      expect(status.limit).toBe(5);
      expect(status.isLimited).toBe(false);

      limiter.destroy();
    });

    it('should show limited when at capacity', async () => {
      const limiter = createRateLimiter({ maxRequests: 2, strategy: 'reject' });

      await limiter.acquire();
      await limiter.acquire();

      const status = limiter.getStatus();
      expect(status.remaining).toBe(0);
      expect(status.isLimited).toBe(true);

      limiter.destroy();
    });
  });

  describe('sliding window cleanup', () => {
    it('should clean up expired requests', async () => {
      vi.useFakeTimers();

      const limiter = createRateLimiter({
        maxRequests: 2,
        windowMs: 1000,
        strategy: 'reject',
      });

      await limiter.acquire();
      await limiter.acquire();
      expect(limiter.getStatus().remaining).toBe(0);

      // Advance time past window
      vi.advanceTimersByTime(1100);

      expect(limiter.getStatus().remaining).toBe(2);

      limiter.destroy();
      vi.useRealTimers();
    });
  });

  describe('reset', () => {
    it('should clear all tracked requests', async () => {
      const limiter = createRateLimiter({ maxRequests: 5, strategy: 'reject' });

      await limiter.acquire();
      await limiter.acquire();
      expect(limiter.getStatus().remaining).toBe(3);

      limiter.reset();
      expect(limiter.getStatus().remaining).toBe(5);

      limiter.destroy();
    });
  });

  describe('getQueueLength', () => {
    it('should return 0 when queue is empty', () => {
      const limiter = createRateLimiter({ maxRequests: 5, strategy: 'queue' });

      expect(limiter.getQueueLength()).toBe(0);

      limiter.destroy();
    });
  });

  describe('updateConfig', () => {
    it('should update configuration', async () => {
      const limiter = createRateLimiter({ maxRequests: 5, strategy: 'reject' });

      expect(limiter.getStatus().limit).toBe(5);

      limiter.updateConfig({ maxRequests: 10 });

      expect(limiter.getStatus().limit).toBe(10);

      limiter.destroy();
    });
  });
});

describe('RateLimitError', () => {
  it('should include status property', () => {
    const status = {
      remaining: 0,
      limit: 60,
      resetInSeconds: 30,
      isLimited: true,
    };
    const error = new RateLimitError('Rate limit exceeded', status);

    expect(error.name).toBe('RateLimitError');
    expect(error.message).toBe('Rate limit exceeded');
    expect(error.status).toEqual(status);
  });
});

describe('ProviderRateLimitManager', () => {
  afterEach(() => {
    resetGlobalRateLimitManager();
  });

  it('should provide separate limiters for each provider', () => {
    const manager = new ProviderRateLimitManager();

    const claudeLimiter = manager.getProviderLimiter('claude');
    const openaiLimiter = manager.getProviderLimiter('openai');

    expect(claudeLimiter).not.toBe(openaiLimiter);

    manager.destroy();
  });

  it('should return same limiter instance for same provider', () => {
    const manager = new ProviderRateLimitManager();

    const limiter1 = manager.getProviderLimiter('claude');
    const limiter2 = manager.getProviderLimiter('claude');

    expect(limiter1).toBe(limiter2);

    manager.destroy();
  });

  it('should get status for all providers', () => {
    const manager = new ProviderRateLimitManager();

    const status = manager.getAllProviderStatus();

    expect(status).toHaveProperty('claude');
    expect(status).toHaveProperty('openai');
    expect(status.claude.limit).toBe(60);
    expect(status.openai.limit).toBe(60);

    manager.destroy();
  });

  it('should reset provider rate limiter', async () => {
    const manager = new ProviderRateLimitManager();

    const claudeLimiter = manager.getProviderLimiter('claude');
    await claudeLimiter.acquire();
    await claudeLimiter.acquire();

    expect(claudeLimiter.getStatus().remaining).toBe(58);

    manager.resetProvider('claude');
    expect(claudeLimiter.getStatus().remaining).toBe(60);

    manager.destroy();
  });

  it('should update provider configuration', () => {
    const manager = new ProviderRateLimitManager();

    const claudeLimiter = manager.getProviderLimiter('claude');
    expect(claudeLimiter.getStatus().limit).toBe(60);

    manager.updateProviderConfig('claude', { maxRequests: 100 });
    expect(claudeLimiter.getStatus().limit).toBe(100);

    manager.destroy();
  });
});

describe('getGlobalRateLimitManager', () => {
  afterEach(() => {
    resetGlobalRateLimitManager();
  });

  it('should return singleton instance', () => {
    const manager1 = getGlobalRateLimitManager();
    const manager2 = getGlobalRateLimitManager();

    expect(manager1).toBe(manager2);
  });

  it('should create new instance after reset', () => {
    const manager1 = getGlobalRateLimitManager();
    resetGlobalRateLimitManager();
    const manager2 = getGlobalRateLimitManager();

    expect(manager1).not.toBe(manager2);
  });
});
