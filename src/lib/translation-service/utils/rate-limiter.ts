/**
 * Rate Limiter Utility
 * REQ-238: Translation Service Rate Limiting
 *
 * Implements a sliding window rate limiter with optional request queuing.
 * Supports configurable per-provider limits for translation API calls.
 *
 * @module translation-service/utils/rate-limiter
 * @created 2026-01-18
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

    Array.from(this.limiters.entries()).forEach(([provider, limiter]) => {
      status[provider] = limiter.getStatus();
    });

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
    Array.from(this.limiters.values()).forEach(limiter => {
      limiter.destroy();
    });
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
