# REQ-238: Create Rate Limiter Utility - Implementation Overview

**Document Created:** 2026-01-18 23:45 UTC
**Last Modified:** 2026-01-18 23:45 UTC
**Request Reference:** REQ-238 (Translation Service Rate Limiting)
**Implementation Plan Reference:** Plan-110-L10N-Epic1-Foundation.md
**Phase:** 3 - Translation Service
**Task ID:** 3.4

---

## Summary

Create a rate limiter utility for the translation service that enforces configurable rate limits when calling external translation providers (Claude/OpenAI). This utility prevents service disruptions and quota exhaustion by throttling requests when limits are approached, supporting independent configuration per provider, and queuing requests rather than rejecting them immediately.

---

## Technical Context

### Existing Patterns in Codebase

| Pattern | Location | Relevance |
|---------|----------|-----------|
| Performance Monitor | `/src/lib/performance-monitor.ts:26-217` | Time-windowed metric tracking with sliding window cleanup |
| Service Configuration | `/src/lib/config.ts:22-51` | Environment variable handling with fallbacks |
| Rate Limit Response | `/src/lib/api.ts:129-141` | HTTP 429 handling pattern with error codes |
| Type Definitions | `/src/lib/translation-service/translation-service.types.ts` | `RateLimitStatus` interface already defined |
| Utility Module Pattern | `/src/lib/utils.ts` | Pure utility functions with clear documentation |

### Dependencies

#### Existing Dependencies Used

- TypeScript types from `/src/lib/translation-service/translation-service.types.ts` (created in REQ-235)
  - `RateLimitStatus` interface
  - `TranslationProvider` type

#### No New Dependencies Required

The rate limiter will be implemented using native TypeScript/JavaScript constructs without external libraries.

### Target File Location

**File:** `/src/lib/translation-service/utils/rate-limiter.ts`

This file currently contains a placeholder stub created in REQ-235:

```typescript
/**
 * Translation API Rate Limiter
 * Part of REQ-235: Translation Service Module Infrastructure
 * Implementation: Task 3.4
 *
 * @module translation-service/utils/rate-limiter
 */

// TODO: Implement in Task 3.4
// This file will contain rate limiting logic for translation API calls
```

---

## Implementation Tasks

### Task 3.4.1: Define Rate Limiter Configuration Types

Add additional type definitions for rate limiter configuration.

**File:** `/src/lib/translation-service/utils/rate-limiter.ts`

**Type Definitions:**

```typescript
/**
 * Configuration for rate limiter
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

/**
 * Provider-specific rate limit configurations
 */
export interface ProviderRateLimits {
  claude: RateLimiterConfig;
  openai: RateLimiterConfig;
}

/**
 * Queued request waiting for rate limit clearance
 */
interface QueuedRequest {
  resolve: () => void;
  reject: (error: Error) => void;
  enqueuedAt: number;
}
```

### Task 3.4.2: Implement Token Bucket Rate Limiter Class

Implement the main rate limiter using a sliding window algorithm with request queuing support.

**File:** `/src/lib/translation-service/utils/rate-limiter.ts`

**Implementation Requirements:**

1. **Sliding Window Algorithm**
   - Track request timestamps in a sliding window
   - Clean up expired entries automatically
   - Provide accurate remaining request count

2. **Request Queuing**
   - Queue requests when limit is reached (if strategy is 'queue')
   - Process queued requests as capacity becomes available
   - Support configurable queue size and timeout

3. **Provider Isolation**
   - Maintain separate rate limiters for each provider
   - Allow independent configuration per provider
   - Track metrics per provider

4. **Configuration**
   - Read from environment variables with sensible defaults
   - Support runtime configuration updates
   - Validate configuration values

**Class Structure:**

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

  /**
   * Check if a request can be made without waiting
   */
  canAcquire(): boolean {
    this.cleanup();
    return this.requestTimestamps.length < this.config.maxRequests;
  }

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

  /**
   * Get current queue length
   */
  getQueueLength(): number {
    return this.queue.length;
  }

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

  /**
   * Cleanup all rate limiters
   */
  destroy(): void {
    for (const limiter of this.limiters.values()) {
      limiter.destroy();
    }
    this.limiters.clear();
  }

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

### Task 3.4.3: Update Module Exports

Update the translation service barrel file to export the rate limiter.

**File:** `/src/lib/translation-service/index.ts` (modify)

**Add exports:**
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

### Task 3.4.4: Add Environment Variables Documentation

Update the environment example file with rate limiter configuration options.

**File:** `/.env.example` (modify)

**Add variables:**
```bash
# Translation Rate Limiting Configuration
TRANSLATION_RATE_LIMIT_PER_MINUTE=60          # Default rate limit for all providers
TRANSLATION_RATE_LIMIT_CLAUDE_PER_MINUTE=60   # Claude-specific rate limit (optional)
TRANSLATION_RATE_LIMIT_OPENAI_PER_MINUTE=60   # OpenAI-specific rate limit (optional)
TRANSLATION_RATE_LIMIT_CLAUDE_STRATEGY=queue  # Strategy: 'queue' or 'reject'
TRANSLATION_RATE_LIMIT_OPENAI_STRATEGY=queue  # Strategy: 'queue' or 'reject'
```

### Task 3.4.5: Create Unit Tests

Create comprehensive unit tests for the rate limiter.

**File:** `/src/lib/translation-service/utils/__tests__/rate-limiter.test.ts`

**Test Cases:**

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
```

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/translation-service/utils/__tests__/rate-limiter.test.ts` | Unit tests for rate limiter |

### Existing Files to Modify

| File Path | Function/Section | Modification |
|-----------|------------------|--------------|
| `/src/lib/translation-service/utils/rate-limiter.ts` | Entire file | Replace stub with full implementation |
| `/src/lib/translation-service/index.ts` | Exports | Add rate limiter exports |
| `/.env.example` | Environment variables | Add rate limiter configuration vars |

### Files NOT to Modify

- `/src/lib/translation-service/translation-service.types.ts` - `RateLimitStatus` already defined
- `/src/lib/translation-service/providers/claude-provider.ts` - Uses rate limiter but implements its own (Task 3.2)
- `/src/lib/translation-service/providers/openai-provider.ts` - Separate task (Task 3.3)
- `/src/lib/translation-service/utils/retry.ts` - Separate task (Task 3.5)

---

## Implementation Order

1. **Define types** (Task 3.4.1) - Add configuration types
2. **Implement RateLimiter class** (Task 3.4.2) - Core sliding window implementation
3. **Update exports** (Task 3.4.3) - Add to barrel file
4. **Document env vars** (Task 3.4.4) - Update `.env.example`
5. **Write tests** (Task 3.4.5) - Create unit test file

---

## Acceptance Criteria Verification

| Criteria (from REQ-238) | Implementation Verification |
|-------------------------|----------------------------|
| Translation requests are automatically throttled when configured rate limits are approached | `RateLimiter.acquire()` blocks/queues when limit reached |
| Each translation provider can have independently configured rate limits | `ProviderRateLimitManager` maintains separate limiters per provider with env-based config |
| Rate limit configuration can be adjusted without code changes | Environment variables: `TRANSLATION_RATE_LIMIT_*` |
| Requests exceeding rate limits are queued rather than immediately rejected | `strategy: 'queue'` option with configurable queue processing |
| System continues to function normally when rate limits are not being approached | `canAcquire()` returns true, `acquire()` resolves immediately when under limit |

---

## Dependencies

### Depends On (Completed First)

- **REQ-235** (Task 3.1): Translation service module structure and type definitions
  - `/src/lib/translation-service/translation-service.types.ts` must exist with `RateLimitStatus` interface

### Used By (Requires This First)

- **Task 3.2** (REQ-236): Claude translation provider - Can use rate limiter
- **Task 3.3** (REQ-237): OpenAI translation provider - Can use rate limiter
- **Task 3.6**: Main translation service wrapper - Uses provider rate limiters

---

## Testing Strategy

### Unit Tests

Cover the following scenarios:

1. **Initialization**: Default and custom configuration
2. **Acquire behavior**: Under limit, at limit, queue vs reject strategies
3. **Sliding window**: Cleanup of expired requests
4. **Queue management**: Queue size limits, timeout handling
5. **Provider isolation**: Separate limiters per provider
6. **Global manager**: Singleton pattern, reset functionality
7. **Status reporting**: Accurate remaining/limit/resetInSeconds values

### Integration Testing

Integration tests should be performed as part of translation provider testing:

1. Rapid sequential requests trigger rate limiting
2. Queued requests resolve after window expires
3. Provider-specific limits are respected independently
4. Configuration changes take effect at runtime

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Memory leak from unbounded queue | Low | Medium | `maxQueueSize` limit; queue timeout |
| Timer not cleaned up on destroy | Low | Low | `destroy()` stops interval and clears queue |
| Race conditions in queue processing | Low | Medium | Single-threaded JS; queue processed atomically |
| Environment variable parsing errors | Low | Low | Default to sensible values; validate inputs |
| Queue timeout too short under load | Medium | Low | Configurable via environment; 30s default |

---

## Estimated Effort

**Complexity:** Medium
**Estimated Time:** 2-3 hours

| Sub-task | Time |
|----------|------|
| Define types | 15 min |
| Implement RateLimiter class | 1.5 hours |
| Implement ProviderRateLimitManager | 30 min |
| Update exports and env vars | 15 min |
| Write unit tests | 45 min |

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Algorithm | Sliding window | More accurate than fixed window; prevents burst-then-wait patterns |
| Default strategy | Queue | Better UX than immediate rejection; requests eventually complete |
| Queue timeout | 30 seconds | Long enough for most translation requests; prevents indefinite waits |
| Singleton manager | Optional global instance | Convenient for app-wide usage; testable via reset function |
| Timer interval | 100ms | Responsive queue processing without excessive CPU usage |

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TRANSLATION_RATE_LIMIT_PER_MINUTE` | No | `60` | Base rate limit for all providers |
| `TRANSLATION_RATE_LIMIT_CLAUDE_PER_MINUTE` | No | Base value | Claude-specific rate limit |
| `TRANSLATION_RATE_LIMIT_OPENAI_PER_MINUTE` | No | Base value | OpenAI-specific rate limit |
| `TRANSLATION_RATE_LIMIT_CLAUDE_STRATEGY` | No | `queue` | Claude strategy: 'queue' or 'reject' |
| `TRANSLATION_RATE_LIMIT_OPENAI_STRATEGY` | No | `queue` | OpenAI strategy: 'queue' or 'reject' |

---

## Usage Examples

### Basic Usage

```typescript
import { createRateLimiter } from '@/lib/translation-service';

const limiter = createRateLimiter({ maxRequests: 10, windowMs: 60000 });

// Before each API call
await limiter.acquire();
const result = await fetch('https://api.example.com/translate');
```

### Provider-Specific Usage

```typescript
import { getGlobalRateLimitManager } from '@/lib/translation-service';

const manager = getGlobalRateLimitManager();
const claudeLimiter = manager.getProviderLimiter('claude');

// Check status before batch operations
const status = claudeLimiter.getStatus();
if (status.remaining < 10) {
  console.log(`Low rate limit remaining: ${status.remaining}`);
}

// Acquire for each request
await claudeLimiter.acquire();
const translation = await claudeProvider.translate(request);
```

### Checking Rate Limit Status

```typescript
import { getGlobalRateLimitManager } from '@/lib/translation-service';

const manager = getGlobalRateLimitManager();
const allStatus = manager.getAllProviderStatus();

// Log status for monitoring
console.log('Rate limit status:', {
  claude: allStatus.claude,
  openai: allStatus.openai,
});
```

---

## Notes

- The sliding window algorithm provides accurate rate limiting without the "burst-then-wait" behavior of fixed windows
- Queue processing runs every 100ms when using queue strategy, providing responsive request handling
- Each provider maintains its own rate limiter state, preventing cross-provider interference
- The global manager provides convenient access while allowing reset for testing
- Consider Redis-based distributed rate limiting for production at scale with multiple server instances

---

*Document generated for FAQBNB L10N Epic 1 - Foundation, Phase 3, Task 3.4*
