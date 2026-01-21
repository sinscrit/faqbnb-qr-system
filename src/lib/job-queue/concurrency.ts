/**
 * Translation Semaphore - Concurrency Control for Translation API Calls
 * Part of REQ-E03-019: Implement Concurrency Control
 *
 * Provides a semaphore-based mechanism to limit concurrent translation
 * API calls, preventing service provider overload and respecting rate limits.
 *
 * @module job-queue/concurrency
 * @created 2026-01-21
 * @lastModified 2026-01-21
 */

// ===========================================================================
// Type Definitions (Task 1)
// ===========================================================================

/**
 * Configuration for the translation semaphore
 */
export interface SemaphoreConfig {
  /** Maximum concurrent translation API calls (default: 10) */
  maxConcurrent: number;
  /** Maximum time to wait for a slot in milliseconds (default: 60000 = 1 minute) */
  acquireTimeoutMs: number;
  /** Enable metrics collection (default: true) */
  enableMetrics: boolean;
}

/**
 * Metrics exposed by the semaphore for monitoring
 */
export interface SemaphoreMetrics {
  /** Current number of active slots in use */
  activeCount: number;
  /** Number of requests waiting in queue */
  queueDepth: number;
  /** Total slots acquired since creation */
  totalAcquired: number;
  /** Total slots released since creation */
  totalReleased: number;
  /** Total acquire timeouts since creation */
  totalTimeouts: number;
  /** Average wait time in milliseconds for queued requests */
  avgWaitTimeMs: number;
}

/**
 * Rate limit backoff state tracking
 */
export interface BackoffState {
  /** Whether the semaphore is currently in backoff mode */
  isInBackoff: boolean;
  /** Timestamp when backoff period ends */
  backoffUntil: Date | null;
  /** Number of consecutive rate limit responses */
  consecutiveRateLimits: number;
  /** Timestamp of last rate limit response */
  lastRateLimitAt: Date | null;
}

/**
 * Internal representation of a queued acquire request
 */
interface QueuedAcquire {
  /** Resolve function to grant the slot */
  resolve: () => void;
  /** Reject function for timeout or shutdown */
  reject: (error: Error) => void;
  /** Timestamp when request was queued */
  enqueuedAt: number;
  /** Timeout ID for cleanup */
  timeoutId?: NodeJS.Timeout;
}

// ===========================================================================
// Default Configuration Constants
// ===========================================================================

/**
 * Default semaphore configuration
 */
export const DEFAULT_SEMAPHORE_CONFIG: SemaphoreConfig = {
  maxConcurrent: parseInt(process.env.TRANSLATION_MAX_CONCURRENT || '10', 10),
  acquireTimeoutMs: parseInt(process.env.TRANSLATION_ACQUIRE_TIMEOUT_MS || '60000', 10),
  enableMetrics: true,
};

/**
 * Rate limit backoff configuration constants
 */
export const RATE_LIMIT_BASE_DELAY_MS = parseInt(
  process.env.TRANSLATION_RATE_LIMIT_BASE_DELAY_MS || '5000',
  10
);
export const RATE_LIMIT_MAX_DELAY_MS = parseInt(
  process.env.TRANSLATION_RATE_LIMIT_MAX_DELAY_MS || '60000',
  10
);

// ===========================================================================
// Rate Limit Detection Helper (Task 7)
// ===========================================================================

/**
 * Check if an error represents a rate limit (HTTP 429) response
 *
 * @param error - Error to check
 * @returns true if error is a rate limit error
 */
export function isRateLimitError(error: unknown): boolean {
  if (!error) return false;

  // Check for HTTP status code
  const httpError = error as { status?: number; code?: string; message?: string };

  // HTTP 429 Too Many Requests
  if (typeof httpError.status === 'number' && httpError.status === 429) {
    return true;
  }

  // Check for error code
  if (typeof httpError.code === 'string') {
    const code = httpError.code.toUpperCase();
    if (code === 'RATE_LIMITED' || code === 'TOO_MANY_REQUESTS') {
      return true;
    }
  }

  // Check error message
  const message = error instanceof Error ? error.message : String(error);
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes('rate limit') ||
    lowerMessage.includes('too many requests') ||
    lowerMessage.includes('429')
  ) {
    return true;
  }

  return false;
}

// ===========================================================================
// TranslationSemaphore Class (Tasks 2-4)
// ===========================================================================

/**
 * Semaphore for controlling concurrent translation API calls
 *
 * Ensures no more than `maxConcurrent` translation requests are in-flight
 * simultaneously. Queued requests are processed in FIFO order.
 *
 * @example
 * ```typescript
 * const semaphore = getTranslationSemaphore();
 *
 * try {
 *   await semaphore.acquire();
 *   const result = await translateText(...);
 * } finally {
 *   semaphore.release();
 * }
 * ```
 */
export class TranslationSemaphore {
  private config: SemaphoreConfig;
  private activeCount: number = 0;
  private queue: QueuedAcquire[] = [];
  private backoffState: BackoffState = {
    isInBackoff: false,
    backoffUntil: null,
    consecutiveRateLimits: 0,
    lastRateLimitAt: null,
  };

  // Metrics tracking
  private totalAcquired: number = 0;
  private totalReleased: number = 0;
  private totalTimeouts: number = 0;
  private waitTimes: number[] = [];

  constructor(config: Partial<SemaphoreConfig> = {}) {
    this.config = { ...DEFAULT_SEMAPHORE_CONFIG, ...config };
  }

  // =========================================================================
  // Core Methods (Task 2)
  // =========================================================================

  /**
   * Acquire a slot for making a translation API call
   *
   * If all slots are in use, the caller is queued and waits until
   * a slot becomes available or the timeout expires.
   *
   * @param timeoutMs - Optional override for acquire timeout
   * @returns Promise that resolves when slot is acquired
   * @throws Error if timeout expires or semaphore is shutting down
   */
  async acquire(timeoutMs?: number): Promise<void> {
    const timeout = timeoutMs ?? this.config.acquireTimeoutMs;

    // If in backoff, wait for backoff to expire first
    if (this.backoffState.isInBackoff && this.backoffState.backoffUntil) {
      const waitTime = this.backoffState.backoffUntil.getTime() - Date.now();
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      // Clear backoff state after waiting
      this.clearBackoff();
    }

    // Check if slot is immediately available
    if (this.activeCount < this.config.maxConcurrent) {
      this.activeCount++;
      this.totalAcquired++;
      return;
    }

    // No slot available - queue the request
    return this.enqueue(timeout);
  }

  /**
   * Enqueue an acquire request and wait for a slot
   */
  private enqueue(timeoutMs: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const enqueuedAt = Date.now();

      const queuedRequest: QueuedAcquire = {
        resolve: () => {
          // Track wait time for metrics
          if (this.config.enableMetrics) {
            this.waitTimes.push(Date.now() - enqueuedAt);
            // Keep only last 100 wait times for averaging
            if (this.waitTimes.length > 100) {
              this.waitTimes.shift();
            }
          }
          this.activeCount++;
          this.totalAcquired++;
          resolve();
        },
        reject,
        enqueuedAt,
      };

      this.queue.push(queuedRequest);

      // Set up timeout
      const timeoutId = setTimeout(() => {
        // Remove from queue if still present
        const index = this.queue.indexOf(queuedRequest);
        if (index !== -1) {
          this.queue.splice(index, 1);
          this.totalTimeouts++;
          reject(new Error(
            `Semaphore acquire timeout after ${timeoutMs}ms. ` +
            `Active: ${this.activeCount}, Queue: ${this.queue.length}`
          ));
        }
      }, timeoutMs);

      // Store timeout ID for cleanup
      queuedRequest.timeoutId = timeoutId;
    });
  }

  /**
   * Release a slot back to the semaphore
   *
   * Must be called after translation completes (success or failure).
   * Best practice is to call this in a finally block.
   */
  release(): void {
    if (this.activeCount <= 0) {
      console.warn('[TranslationSemaphore] Release called but no active slots');
      return;
    }

    this.activeCount--;
    this.totalReleased++;

    // Process next queued request if any
    this.processQueue();
  }

  /**
   * Process the queue and grant slot to next waiting request
   */
  private processQueue(): void {
    // If in backoff, don't process queue
    if (this.backoffState.isInBackoff && this.backoffState.backoffUntil) {
      const now = Date.now();
      if (this.backoffState.backoffUntil.getTime() > now) {
        return; // Still in backoff period
      }
      // Backoff expired
      this.clearBackoff();
    }

    // Grant slot to next waiting request
    while (this.queue.length > 0 && this.activeCount < this.config.maxConcurrent) {
      const nextRequest = this.queue.shift();
      if (nextRequest) {
        // Clear the timeout
        if (nextRequest.timeoutId) {
          clearTimeout(nextRequest.timeoutId);
        }
        // Grant the slot
        nextRequest.resolve();
      }
    }
  }

  /**
   * Try to acquire a slot without waiting
   *
   * @returns true if slot was acquired, false if no slot available
   */
  tryAcquire(): boolean {
    if (this.backoffState.isInBackoff) {
      return false;
    }

    if (this.activeCount < this.config.maxConcurrent) {
      this.activeCount++;
      this.totalAcquired++;
      return true;
    }

    return false;
  }

  // =========================================================================
  // Rate Limit Backoff Methods (Task 3)
  // =========================================================================

  /**
   * Notify the semaphore that a rate limit (HTTP 429) was received
   *
   * This triggers exponential backoff for all subsequent acquire() calls.
   * Call this when the translation service returns a rate limit error.
   */
  notifyRateLimit(): void {
    const now = new Date();
    this.backoffState.consecutiveRateLimits++;
    this.backoffState.lastRateLimitAt = now;

    // Calculate backoff using exponential formula
    // Formula: baseDelay * (2 ^ consecutiveCount), capped at maxDelay
    const backoffMs = Math.min(
      RATE_LIMIT_BASE_DELAY_MS * Math.pow(2, this.backoffState.consecutiveRateLimits - 1),
      RATE_LIMIT_MAX_DELAY_MS
    );

    this.backoffState.isInBackoff = true;
    this.backoffState.backoffUntil = new Date(now.getTime() + backoffMs);

    console.warn(
      `[TranslationSemaphore] Rate limit detected. ` +
      `Consecutive: ${this.backoffState.consecutiveRateLimits}, ` +
      `Backoff: ${backoffMs}ms, Until: ${this.backoffState.backoffUntil.toISOString()}`
    );
  }

  /**
   * Clear the backoff state after successful request or timeout
   */
  private clearBackoff(): void {
    this.backoffState.isInBackoff = false;
    this.backoffState.backoffUntil = null;
    // Note: We don't reset consecutiveRateLimits here
    // It resets on notifySuccess()
  }

  /**
   * Notify the semaphore that a translation succeeded
   *
   * This resets the consecutive rate limit counter, reducing future backoff.
   * Call this after a successful translation API call.
   */
  notifySuccess(): void {
    if (this.backoffState.consecutiveRateLimits > 0) {
      this.backoffState.consecutiveRateLimits = 0;
    }
  }

  /**
   * Get the current backoff state
   *
   * @returns Current backoff state for monitoring
   */
  getBackoffState(): BackoffState {
    return {
      isInBackoff: this.backoffState.isInBackoff,
      backoffUntil: this.backoffState.backoffUntil,
      consecutiveRateLimits: this.backoffState.consecutiveRateLimits,
      lastRateLimitAt: this.backoffState.lastRateLimitAt,
    };
  }

  /**
   * Check if backoff is currently active
   *
   * @returns true if semaphore is in backoff period
   */
  isBackoffActive(): boolean {
    if (!this.backoffState.isInBackoff || !this.backoffState.backoffUntil) {
      return false;
    }
    return this.backoffState.backoffUntil.getTime() > Date.now();
  }

  // =========================================================================
  // Metrics and Utility Methods (Task 4)
  // =========================================================================

  /**
   * Get current semaphore metrics
   *
   * @returns Metrics snapshot for monitoring
   */
  getMetrics(): SemaphoreMetrics {
    const avgWaitTimeMs = this.waitTimes.length > 0
      ? Math.round(this.waitTimes.reduce((a, b) => a + b, 0) / this.waitTimes.length)
      : 0;

    return {
      activeCount: this.activeCount,
      queueDepth: this.queue.length,
      totalAcquired: this.totalAcquired,
      totalReleased: this.totalReleased,
      totalTimeouts: this.totalTimeouts,
      avgWaitTimeMs,
    };
  }

  /**
   * Check if a slot is immediately available
   *
   * @returns true if acquire() would succeed immediately
   */
  isAvailable(): boolean {
    return !this.isBackoffActive() && this.activeCount < this.config.maxConcurrent;
  }

  /**
   * Update semaphore configuration at runtime
   *
   * Note: Changing maxConcurrent does not immediately release or queue slots.
   * Changes take effect on next acquire/release cycle.
   *
   * @param config - Partial configuration to update
   */
  updateConfig(config: Partial<SemaphoreConfig>): void {
    this.config = { ...this.config, ...config };
    console.info('[TranslationSemaphore] Configuration updated', this.config);

    // If maxConcurrent increased, process queue to grant any waiting slots
    if (config.maxConcurrent !== undefined) {
      this.processQueue();
    }
  }

  /**
   * Reset the semaphore state (for testing)
   *
   * Rejects all queued requests and resets counters.
   * Use only in test environments.
   */
  reset(): void {
    // Reject all queued requests
    while (this.queue.length > 0) {
      const request = this.queue.shift();
      if (request) {
        if (request.timeoutId) {
          clearTimeout(request.timeoutId);
        }
        request.reject(new Error('Semaphore reset'));
      }
    }

    // Reset all state
    this.activeCount = 0;
    this.totalAcquired = 0;
    this.totalReleased = 0;
    this.totalTimeouts = 0;
    this.waitTimes = [];
    this.backoffState = {
      isInBackoff: false,
      backoffUntil: null,
      consecutiveRateLimits: 0,
      lastRateLimitAt: null,
    };
  }
}

// ===========================================================================
// Factory and Singleton (Task 5)
// ===========================================================================

let globalSemaphore: TranslationSemaphore | null = null;

/**
 * Create a new translation semaphore instance
 *
 * @param config - Configuration options
 * @returns New TranslationSemaphore instance
 */
export function createTranslationSemaphore(
  config?: Partial<SemaphoreConfig>
): TranslationSemaphore {
  return new TranslationSemaphore(config);
}

/**
 * Get the global singleton translation semaphore
 *
 * Creates a new instance if none exists. Use this for application-wide
 * concurrency control across all translation processors.
 *
 * @returns Global TranslationSemaphore instance
 */
export function getTranslationSemaphore(): TranslationSemaphore {
  if (!globalSemaphore) {
    globalSemaphore = createTranslationSemaphore();
  }
  return globalSemaphore;
}

/**
 * Reset the global translation semaphore (useful for testing)
 *
 * Resets the current semaphore if running and clears the reference.
 */
export function resetTranslationSemaphore(): void {
  if (globalSemaphore) {
    globalSemaphore.reset();
    globalSemaphore = null;
  }
}
