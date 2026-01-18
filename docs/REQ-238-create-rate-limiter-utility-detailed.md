# REQ-238: Create Rate Limiter Utility - Detailed Task Breakdown

**Document Created:** 2026-01-18 23:50 UTC
**Last Modified:** 2026-01-18 23:50 UTC
**Request Reference:** REQ-238 (Translation Service Rate Limiting)
**Overview Document:** REQ-238-create-rate-limiter-utility-overview.md
**Implementation Plan Reference:** Plan-110-L10N-Epic1-Foundation.md
**Phase:** 3 - Translation Service
**Task ID:** 3.4

---

## Executive Summary

This document provides a granular, step-by-step implementation guide for creating the rate limiter utility for the translation service. The rate limiter enforces configurable rate limits when calling external translation providers (Claude/OpenAI), preventing service disruptions and quota exhaustion by throttling requests when limits are approached, supporting independent configuration per provider, and queuing requests rather than rejecting them immediately.

---

## Prerequisites

Before starting implementation, verify the following:

- [ ] **REQ-235 completed:** Translation service module structure exists at `/src/lib/translation-service/`
- [ ] **Type definitions exist:** `RateLimitStatus` interface defined in `/src/lib/translation-service/translation-service.types.ts`
- [ ] **Stub file exists:** `/src/lib/translation-service/utils/rate-limiter.ts` contains placeholder from REQ-235
- [ ] **Development environment:** Local development server running, TypeScript compilation working

---

## Task Breakdown

### Task 3.4.1: Define Rate Limiter Configuration Types
**Estimated Effort:** 15 minutes
**File:** `/src/lib/translation-service/utils/rate-limiter.ts`

#### 3.4.1.1: Add file header and imports
- [ ] Open `/src/lib/translation-service/utils/rate-limiter.ts`
- [ ] Replace stub content with proper file header comment
- [ ] Add import for `RateLimitStatus` and `TranslationProvider` from `../translation-service.types`

```typescript
/**
 * Rate Limiter Utility
 * REQ-238: Translation Service Rate Limiting
 *
 * Implements a sliding window rate limiter with optional request queuing.
 * Supports configurable per-provider limits for translation API calls.
 *
 * @module translation-service/utils/rate-limiter
 */

import type { RateLimitStatus, TranslationProvider } from '../translation-service.types';
```

#### 3.4.1.2: Define RateLimiterConfig interface
- [ ] Add `RateLimiterConfig` interface with the following properties:
  - `maxRequests: number` - Maximum requests allowed per time window
  - `windowMs: number` - Time window in milliseconds (default: 60000 = 1 minute)
  - `strategy: 'queue' | 'reject'` - Strategy when limit is reached
  - `maxQueueSize?: number` - Maximum queue size when using 'queue' strategy (default: 100)
  - `queueTimeoutMs?: number` - Maximum time to wait in queue in milliseconds (default: 30000)

```typescript
// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Configuration for a single rate limiter instance
 */
export interface RateLimiterConfig {
  /** Maximum requests allowed per time window */
  maxRequests: number;
  /** Time window in milliseconds (default: 60000 = 1 minute) */
  windowMs: number;
  /** Strategy when limit is reached: 'queue' delays requests, 'reject' throws immediately */
  strategy: 'queue' | 'reject';
  /** Maximum queue size when using 'queue' strategy (default: 100) */
  maxQueueSize?: number;
  /** Maximum time to wait in queue in milliseconds (default: 30000) */
  queueTimeoutMs?: number;
}
```

#### 3.4.1.3: Define default configuration constants
- [ ] Add `DEFAULT_CONFIG` constant with sensible defaults
- [ ] Add `QueuedRequest` internal interface for queue management

```typescript
/**
 * Default configuration values
 */
const DEFAULT_CONFIG: RateLimiterConfig = {
  maxRequests: 60,
  windowMs: 60000, // 1 minute
  strategy: 'queue',
  maxQueueSize: 100,
  queueTimeoutMs: 30000,
};

/**
 * Queued request waiting for rate limit clearance
 */
interface QueuedRequest {
  resolve: () => void;
  reject: (error: Error) => void;
  enqueuedAt: number;
}
```

**Verification:**
- [ ] TypeScript compiles without errors
- [ ] All types are properly documented with JSDoc comments

---

### Task 3.4.2: Implement RateLimiter Class
**Estimated Effort:** 1.5 hours
**File:** `/src/lib/translation-service/utils/rate-limiter.ts`

#### 3.4.2.1: Create RateLimiter class structure
- [ ] Define `RateLimiter` class with private properties:
  - `config: Required<RateLimiterConfig>` - Fully resolved configuration
  - `requestTimestamps: number[]` - Array of request timestamps for sliding window
  - `queue: QueuedRequest[]` - Array of queued requests
  - `queueProcessorInterval: ReturnType<typeof setInterval> | null` - Interval for queue processing

```typescript
// ============================================================================
// Rate Limiter Class
// ============================================================================

/**
 * Sliding window rate limiter with request queuing
 *
 * @example
 * ```typescript
 * const limiter = new RateLimiter({ maxRequests: 60, windowMs: 60000, strategy: 'queue' });
 *
 * // Wait for rate limit clearance before making request
 * await limiter.acquire();
 * const result = await makeTranslationRequest();
 * ```
 */
export class RateLimiter {
  private config: Required<RateLimiterConfig>;
  private requestTimestamps: number[] = [];
  private queue: QueuedRequest[] = [];
  private queueProcessorInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<RateLimiterConfig> = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      maxQueueSize: config.maxQueueSize ?? DEFAULT_CONFIG.maxQueueSize!,
      queueTimeoutMs: config.queueTimeoutMs ?? DEFAULT_CONFIG.queueTimeoutMs!,
    };

    // Start queue processor if using queue strategy
    if (this.config.strategy === 'queue') {
      this.startQueueProcessor();
    }
  }
```

#### 3.4.2.2: Implement acquire() method
- [ ] Add `acquire(): Promise<void>` method that:
  - Cleans up expired timestamps
  - Checks if capacity is available
  - If capacity available, records request and resolves immediately
  - If rate limited with 'reject' strategy, throws `RateLimitError`
  - If rate limited with 'queue' strategy, enqueues request and waits

```typescript
  /**
   * Acquire permission to make a request
   * Will wait if rate limited (queue strategy) or throw (reject strategy)
   */
  async acquire(): Promise<void> {
    this.cleanup();

    // Check if we have capacity
    if (this.requestTimestamps.length < this.config.maxRequests) {
      this.recordRequest();
      return;
    }

    // Rate limited - handle based on strategy
    if (this.config.strategy === 'reject') {
      const status = this.getStatus();
      throw new RateLimitError(
        `Rate limit exceeded. Try again in ${status.resetInSeconds} seconds.`,
        status
      );
    }

    // Queue strategy - wait for capacity
    return this.enqueue();
  }
```

#### 3.4.2.3: Implement canAcquire() method
- [ ] Add `canAcquire(): boolean` method that checks if request can be made without waiting

```typescript
  /**
   * Check if a request can be made without waiting
   */
  canAcquire(): boolean {
    this.cleanup();
    return this.requestTimestamps.length < this.config.maxRequests;
  }
```

#### 3.4.2.4: Implement getStatus() method
- [ ] Add `getStatus(): RateLimitStatus` method that returns current rate limit status
- [ ] Calculate remaining capacity, limit, reset time, and limited flag

```typescript
  /**
   * Get current rate limit status
   */
  getStatus(): RateLimitStatus {
    this.cleanup();

    const remaining = Math.max(0, this.config.maxRequests - this.requestTimestamps.length);
    const oldestRequest = this.requestTimestamps[0];
    const resetInSeconds = oldestRequest
      ? Math.ceil((this.config.windowMs - (Date.now() - oldestRequest)) / 1000)
      : 0;

    return {
      remaining,
      limit: this.config.maxRequests,
      resetInSeconds: Math.max(0, resetInSeconds),
      isLimited: remaining === 0,
    };
  }
```

#### 3.4.2.5: Implement getQueueLength() method
- [ ] Add `getQueueLength(): number` method that returns current queue size

```typescript
  /**
   * Get current queue length
   */
  getQueueLength(): number {
    return this.queue.length;
  }
```

#### 3.4.2.6: Implement updateConfig() method
- [ ] Add `updateConfig(config: Partial<RateLimiterConfig>): void` method
- [ ] Handle strategy changes by restarting queue processor if needed

```typescript
  /**
   * Update rate limiter configuration
   */
  updateConfig(config: Partial<RateLimiterConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };

    // Restart queue processor if strategy changed
    if (config.strategy !== undefined) {
      this.stopQueueProcessor();
      if (this.config.strategy === 'queue') {
        this.startQueueProcessor();
      }
    }
  }
```

#### 3.4.2.7: Implement reset() and destroy() methods
- [ ] Add `reset(): void` method that clears all tracked requests and rejects queued requests
- [ ] Add `destroy(): void` method that stops queue processor and resets state

```typescript
  /**
   * Reset the rate limiter (clear all tracked requests and queue)
   */
  reset(): void {
    this.requestTimestamps = [];

    // Reject all queued requests
    while (this.queue.length > 0) {
      const request = this.queue.shift()!;
      request.reject(new Error('Rate limiter reset'));
    }
  }

  /**
   * Cleanup and stop the rate limiter
   */
  destroy(): void {
    this.stopQueueProcessor();
    this.reset();
  }
```

#### 3.4.2.8: Implement private helper methods
- [ ] Add `recordRequest(): void` - Records a request timestamp
- [ ] Add `cleanup(): void` - Removes expired timestamps from sliding window
- [ ] Add `enqueue(): Promise<void>` - Enqueues a request and returns promise
- [ ] Add `startQueueProcessor(): void` - Starts the queue processing interval
- [ ] Add `stopQueueProcessor(): void` - Stops the queue processing interval
- [ ] Add `processQueue(): void` - Processes queued requests

```typescript
  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Record a request timestamp
   */
  private recordRequest(): void {
    this.requestTimestamps.push(Date.now());
  }

  /**
   * Clean up expired timestamps from the sliding window
   */
  private cleanup(): void {
    const cutoff = Date.now() - this.config.windowMs;
    this.requestTimestamps = this.requestTimestamps.filter(ts => ts > cutoff);
  }

  /**
   * Enqueue a request to wait for rate limit clearance
   */
  private enqueue(): Promise<void> {
    // Check queue size limit
    if (this.queue.length >= this.config.maxQueueSize) {
      const status = this.getStatus();
      throw new RateLimitError(
        `Rate limit queue full (${this.config.maxQueueSize} requests waiting). Try again later.`,
        status
      );
    }

    return new Promise<void>((resolve, reject) => {
      const request: QueuedRequest = {
        resolve: () => {
          this.recordRequest();
          resolve();
        },
        reject,
        enqueuedAt: Date.now(),
      };

      this.queue.push(request);
    });
  }

  /**
   * Start the queue processor interval
   */
  private startQueueProcessor(): void {
    if (this.queueProcessorInterval) return;

    // Process queue every 100ms
    this.queueProcessorInterval = setInterval(() => {
      this.processQueue();
    }, 100);
  }

  /**
   * Stop the queue processor interval
   */
  private stopQueueProcessor(): void {
    if (this.queueProcessorInterval) {
      clearInterval(this.queueProcessorInterval);
      this.queueProcessorInterval = null;
    }
  }

  /**
   * Process queued requests
   */
  private processQueue(): void {
    this.cleanup();

    const now = Date.now();

    // Process expired queue entries first
    while (this.queue.length > 0) {
      const request = this.queue[0];

      // Check for timeout
      if (now - request.enqueuedAt > this.config.queueTimeoutMs) {
        this.queue.shift();
        const status = this.getStatus();
        request.reject(
          new RateLimitError(
            `Request timed out waiting for rate limit (${this.config.queueTimeoutMs}ms).`,
            status
          )
        );
        continue;
      }

      // Check if we have capacity
      if (this.requestTimestamps.length < this.config.maxRequests) {
        this.queue.shift();
        request.resolve();
        continue;
      }

      // No capacity and not timed out - stop processing
      break;
    }
  }
}
```

**Verification:**
- [ ] TypeScript compiles without errors
- [ ] All public methods are documented with JSDoc
- [ ] Class follows existing patterns in codebase (e.g., `/src/lib/performance-monitor.ts`)

---

### Task 3.4.3: Implement RateLimitError Class
**Estimated Effort:** 10 minutes
**File:** `/src/lib/translation-service/utils/rate-limiter.ts`

#### 3.4.3.1: Create RateLimitError class
- [ ] Add `RateLimitError` class extending `Error`
- [ ] Include `status: RateLimitStatus` property

```typescript
// ============================================================================
// Rate Limit Error
// ============================================================================

/**
 * Error thrown when rate limit is exceeded
 */
export class RateLimitError extends Error {
  public readonly status: RateLimitStatus;

  constructor(message: string, status: RateLimitStatus) {
    super(message);
    this.name = 'RateLimitError';
    this.status = status;
  }
}
```

**Verification:**
- [ ] Error class properly extends Error
- [ ] Status property is accessible on caught errors

---

### Task 3.4.4: Implement ProviderRateLimitManager Class
**Estimated Effort:** 30 minutes
**File:** `/src/lib/translation-service/utils/rate-limiter.ts`

#### 3.4.4.1: Create ProviderRateLimitManager class
- [ ] Define class with `limiters: Map<TranslationProvider, RateLimiter>` property
- [ ] Initialize provider limiters in constructor

```typescript
// ============================================================================
// Provider Rate Limiter Manager
// ============================================================================

/**
 * Manages rate limiters for multiple translation providers
 *
 * @example
 * ```typescript
 * const manager = createProviderRateLimitManager();
 *
 * // Get rate limiter for Claude
 * const claudeLimiter = manager.getProviderLimiter('claude');
 * await claudeLimiter.acquire();
 * ```
 */
export class ProviderRateLimitManager {
  private limiters: Map<TranslationProvider, RateLimiter> = new Map();

  constructor() {
    // Initialize with default configurations
    this.initializeProviderLimiters();
  }
```

#### 3.4.4.2: Implement getProviderLimiter() method
- [ ] Add method that returns or creates rate limiter for specific provider

```typescript
  /**
   * Get or create rate limiter for a provider
   */
  getProviderLimiter(provider: TranslationProvider): RateLimiter {
    let limiter = this.limiters.get(provider);

    if (!limiter) {
      limiter = this.createLimiterForProvider(provider);
      this.limiters.set(provider, limiter);
    }

    return limiter;
  }
```

#### 3.4.4.3: Implement getAllProviderStatus() method
- [ ] Add method that returns rate limit status for all providers

```typescript
  /**
   * Get rate limit status for all providers
   */
  getAllProviderStatus(): Record<TranslationProvider, RateLimitStatus> {
    const status: Partial<Record<TranslationProvider, RateLimitStatus>> = {};

    for (const [provider, limiter] of this.limiters) {
      status[provider] = limiter.getStatus();
    }

    return status as Record<TranslationProvider, RateLimitStatus>;
  }
```

#### 3.4.4.4: Implement updateProviderConfig() and resetProvider() methods
- [ ] Add method to update configuration for specific provider
- [ ] Add method to reset specific provider's rate limiter

```typescript
  /**
   * Update configuration for a specific provider
   */
  updateProviderConfig(provider: TranslationProvider, config: Partial<RateLimiterConfig>): void {
    const limiter = this.limiters.get(provider);
    if (limiter) {
      limiter.updateConfig(config);
    }
  }

  /**
   * Reset rate limiter for a specific provider
   */
  resetProvider(provider: TranslationProvider): void {
    const limiter = this.limiters.get(provider);
    if (limiter) {
      limiter.reset();
    }
  }
```

#### 3.4.4.5: Implement destroy() method
- [ ] Add method that destroys all rate limiters

```typescript
  /**
   * Cleanup all rate limiters
   */
  destroy(): void {
    for (const limiter of this.limiters.values()) {
      limiter.destroy();
    }
    this.limiters.clear();
  }
```

#### 3.4.4.6: Implement private helper methods
- [ ] Add `initializeProviderLimiters(): void` - Initializes limiters for all providers
- [ ] Add `createLimiterForProvider(provider): RateLimiter` - Creates provider-specific limiter
- [ ] Add `getConfigForProvider(provider): Partial<RateLimiterConfig>` - Gets config from environment

```typescript
  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Initialize rate limiters for all providers
   */
  private initializeProviderLimiters(): void {
    // Claude rate limiter
    this.limiters.set('claude', this.createLimiterForProvider('claude'));

    // OpenAI rate limiter
    this.limiters.set('openai', this.createLimiterForProvider('openai'));
  }

  /**
   * Create rate limiter with provider-specific configuration
   */
  private createLimiterForProvider(provider: TranslationProvider): RateLimiter {
    const config = this.getConfigForProvider(provider);
    return new RateLimiter(config);
  }

  /**
   * Get configuration for a specific provider from environment
   */
  private getConfigForProvider(provider: TranslationProvider): Partial<RateLimiterConfig> {
    const baseRateLimit = parseInt(
      process.env.TRANSLATION_RATE_LIMIT_PER_MINUTE || '60',
      10
    );

    // Provider-specific overrides
    const providerEnvKey = `TRANSLATION_RATE_LIMIT_${provider.toUpperCase()}_PER_MINUTE`;
    const providerRateLimit = parseInt(
      process.env[providerEnvKey] || String(baseRateLimit),
      10
    );

    // Provider-specific queue strategy
    const strategyEnvKey = `TRANSLATION_RATE_LIMIT_${provider.toUpperCase()}_STRATEGY`;
    const strategy = (process.env[strategyEnvKey] || 'queue') as 'queue' | 'reject';

    return {
      maxRequests: providerRateLimit,
      windowMs: 60000,
      strategy,
      maxQueueSize: 100,
      queueTimeoutMs: 30000,
    };
  }
}
```

**Verification:**
- [ ] Manager correctly initializes separate limiters for Claude and OpenAI
- [ ] Environment variable reading works correctly
- [ ] Each provider has independent rate tracking

---

### Task 3.4.5: Implement Factory Functions and Singleton
**Estimated Effort:** 15 minutes
**File:** `/src/lib/translation-service/utils/rate-limiter.ts`

#### 3.4.5.1: Add factory functions
- [ ] Add `createRateLimiter(config?): RateLimiter` function
- [ ] Add `createProviderRateLimitManager(): ProviderRateLimitManager` function

```typescript
// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a new rate limiter instance with the given configuration
 */
export function createRateLimiter(config?: Partial<RateLimiterConfig>): RateLimiter {
  return new RateLimiter(config);
}

/**
 * Create a provider rate limit manager
 */
export function createProviderRateLimitManager(): ProviderRateLimitManager {
  return new ProviderRateLimitManager();
}
```

#### 3.4.5.2: Add singleton instance management
- [ ] Add global manager variable
- [ ] Add `getGlobalRateLimitManager(): ProviderRateLimitManager` function
- [ ] Add `resetGlobalRateLimitManager(): void` function for testing

```typescript
// ============================================================================
// Singleton Instance
// ============================================================================

let globalManager: ProviderRateLimitManager | null = null;

/**
 * Get the global provider rate limit manager instance
 */
export function getGlobalRateLimitManager(): ProviderRateLimitManager {
  if (!globalManager) {
    globalManager = createProviderRateLimitManager();
  }
  return globalManager;
}

/**
 * Reset the global rate limit manager (useful for testing)
 */
export function resetGlobalRateLimitManager(): void {
  if (globalManager) {
    globalManager.destroy();
    globalManager = null;
  }
}
```

**Verification:**
- [ ] Factory functions create new instances correctly
- [ ] Singleton returns same instance on repeated calls
- [ ] Reset function creates new instance after reset

---

### Task 3.4.6: Update Module Exports
**Estimated Effort:** 10 minutes
**File:** `/src/lib/translation-service/index.ts`

#### 3.4.6.1: Add rate limiter exports to barrel file
- [ ] Open `/src/lib/translation-service/index.ts`
- [ ] Add exports for all public rate limiter components

```typescript
// Export rate limiter utilities
export {
  RateLimiter,
  RateLimitError,
  ProviderRateLimitManager,
  createRateLimiter,
  createProviderRateLimitManager,
  getGlobalRateLimitManager,
  resetGlobalRateLimitManager,
} from './utils/rate-limiter';
export type { RateLimiterConfig } from './utils/rate-limiter';
```

**Verification:**
- [ ] Imports from `@/lib/translation-service` include rate limiter exports
- [ ] TypeScript resolves all exported types correctly

---

### Task 3.4.7: Add Environment Variables Documentation
**Estimated Effort:** 5 minutes
**File:** `/.env.example`

#### 3.4.7.1: Add rate limiter environment variables
- [ ] Open `/.env.example`
- [ ] Add translation rate limiting configuration section

```bash
# Translation Rate Limiting Configuration
TRANSLATION_RATE_LIMIT_PER_MINUTE=60          # Default rate limit for all providers
TRANSLATION_RATE_LIMIT_CLAUDE_PER_MINUTE=60   # Claude-specific rate limit (optional)
TRANSLATION_RATE_LIMIT_OPENAI_PER_MINUTE=60   # OpenAI-specific rate limit (optional)
TRANSLATION_RATE_LIMIT_CLAUDE_STRATEGY=queue  # Strategy: 'queue' or 'reject'
TRANSLATION_RATE_LIMIT_OPENAI_STRATEGY=queue  # Strategy: 'queue' or 'reject'
```

**Verification:**
- [ ] Environment variables are documented with descriptions
- [ ] Default values are provided

---

### Task 3.4.8: Create Unit Tests
**Estimated Effort:** 45 minutes
**File:** `/src/lib/translation-service/utils/__tests__/rate-limiter.test.ts`

#### 3.4.8.1: Create test file and imports
- [ ] Create `/src/lib/translation-service/utils/__tests__/` directory if not exists
- [ ] Create `rate-limiter.test.ts` file
- [ ] Add imports for vitest and rate limiter exports

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  RateLimiter,
  RateLimitError,
  ProviderRateLimitManager,
  createRateLimiter,
  getGlobalRateLimitManager,
  resetGlobalRateLimitManager,
} from '../rate-limiter';
```

#### 3.4.8.2: Add RateLimiter initialization tests
- [ ] Test creation with default configuration
- [ ] Test creation with custom configuration

```typescript
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
```

#### 3.4.8.3: Add acquire() method tests
- [ ] Test successful acquisition under limit
- [ ] Test rejection when limit exceeded (reject strategy)
- [ ] Test queuing when limit exceeded (queue strategy)

```typescript
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
```

#### 3.4.8.4: Add canAcquire() tests
- [ ] Test returns true when under limit
- [ ] Test returns false when at limit

```typescript
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
```

#### 3.4.8.5: Add getStatus() tests
- [ ] Test correct status reporting
- [ ] Test limited flag when at capacity

```typescript
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
```

#### 3.4.8.6: Add sliding window cleanup tests
- [ ] Test that expired requests are cleaned up

```typescript
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
```

#### 3.4.8.7: Add reset() tests
- [ ] Test that reset clears all tracked requests

```typescript
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
});
```

#### 3.4.8.8: Add ProviderRateLimitManager tests
- [ ] Test separate limiters for each provider
- [ ] Test same instance returned for same provider
- [ ] Test status for all providers

```typescript
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
});
```

#### 3.4.8.9: Add global manager tests
- [ ] Test singleton pattern
- [ ] Test new instance after reset

```typescript
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
```

**Verification:**
- [ ] All tests pass when running `npm test` or `vitest`
- [ ] Test coverage includes all public methods
- [ ] Edge cases are tested (empty queue, timeout, limits)

---

### Task 3.4.9: Build and Verify
**Estimated Effort:** 15 minutes

#### 3.4.9.1: Run TypeScript compilation
- [ ] Run `npm run build` or `tsc --noEmit`
- [ ] Verify no compilation errors

#### 3.4.9.2: Run tests
- [ ] Run `npm test` or `vitest run`
- [ ] Verify all tests pass

#### 3.4.9.3: Verify imports work correctly
- [ ] Create temporary test file that imports from `@/lib/translation-service`
- [ ] Verify all exports are accessible

```typescript
// Temporary verification (can be in a scratch file or REPL)
import {
  RateLimiter,
  RateLimitError,
  ProviderRateLimitManager,
  createRateLimiter,
  getGlobalRateLimitManager,
  resetGlobalRateLimitManager,
  type RateLimiterConfig,
} from '@/lib/translation-service';
```

---

## Acceptance Criteria Verification

| Criteria (from REQ-238) | Task Reference | Verification Method |
|-------------------------|----------------|---------------------|
| Translation requests are automatically throttled when configured rate limits are approached | Task 3.4.2 (`acquire()`) | Unit test: acquire blocks/queues when limit reached |
| Each translation provider can have independently configured rate limits | Task 3.4.4 (ProviderRateLimitManager) | Unit test: separate limiter per provider with env config |
| Rate limit configuration can be adjusted without code changes | Task 3.4.7 (env vars) | Manual: change env vars and verify behavior |
| Requests exceeding rate limits are queued rather than immediately rejected | Task 3.4.2 (queue strategy) | Unit test: queue strategy queues requests |
| System continues to function normally when rate limits are not being approached | Task 3.4.2 (`canAcquire()`, `acquire()`) | Unit test: immediate resolution under limit |

---

## Dependencies Summary

### Completed Prerequisites
- REQ-235: Translation service module structure and type definitions

### This Task Enables
- Task 3.2 (REQ-236): Claude translation provider
- Task 3.3 (REQ-237): OpenAI translation provider
- Task 3.6: Main translation service wrapper

---

## Files Modified/Created Summary

| File | Action | Description |
|------|--------|-------------|
| `/src/lib/translation-service/utils/rate-limiter.ts` | **Modify** | Replace stub with full implementation |
| `/src/lib/translation-service/index.ts` | **Modify** | Add rate limiter exports |
| `/.env.example` | **Modify** | Add rate limiter configuration vars |
| `/src/lib/translation-service/utils/__tests__/rate-limiter.test.ts` | **Create** | Unit tests for rate limiter |

---

## Testing Checklist

- [ ] Unit tests pass for RateLimiter class
- [ ] Unit tests pass for ProviderRateLimitManager class
- [ ] Unit tests pass for factory functions and singleton
- [ ] TypeScript compilation succeeds with no errors
- [ ] Imports work from `@/lib/translation-service`
- [ ] Environment variable configuration works correctly

---

## Notes

- The sliding window algorithm provides accurate rate limiting without the "burst-then-wait" behavior of fixed windows
- Queue processing runs every 100ms when using queue strategy, providing responsive request handling
- Each provider maintains its own rate limiter state, preventing cross-provider interference
- The global manager provides convenient access while allowing reset for testing
- Consider Redis-based distributed rate limiting for production at scale with multiple server instances

---

*Document generated for FAQBNB L10N Epic 1 - Foundation, Phase 3, Task 3.4*
