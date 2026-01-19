/**
 * Retry Logic with Exponential Backoff
 * Part of REQ-239: Translation Service Retry Logic
 *
 * Provides retry functionality for async operations with:
 * - Exponential backoff delay calculation
 * - Jitter to prevent thundering herd
 * - Configurable retry policies
 * - Comprehensive result tracking
 *
 * @module translation-service/utils/retry
 * @created 2026-01-18
 * @lastModified 2026-01-18
 */

/**
 * Configuration options for retry behavior
 */
export interface RetryConfig {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries: number;
  /** Base delay in milliseconds for first retry (default: 1000) */
  baseDelayMs: number;
  /** Maximum delay cap in milliseconds (default: 30000) */
  maxDelayMs: number;
  /** Multiplier for exponential backoff (default: 2) */
  backoffMultiplier: number;
  /** Maximum jitter as percentage of delay (default: 0.25 = 25%) */
  jitterFactor: number;
  /** Function to determine if error is retryable (optional) */
  isRetryable?: (error: unknown) => boolean;
  /** Callback fired before each retry attempt (optional) */
  onRetry?: (attempt: number, error: unknown, delayMs: number) => void;
}

/**
 * Result of a retry operation
 */
export interface RetryResult<T> {
  /** The successful result if operation succeeded */
  data?: T;
  /** The final error if all retries exhausted */
  error?: Error;
  /** Whether the operation ultimately succeeded */
  success: boolean;
  /** Total number of attempts made (1 = no retries, 2+ = retries occurred) */
  attempts: number;
  /** Total time elapsed in milliseconds */
  totalTimeMs: number;
  /** Individual attempt details */
  attemptDetails: AttemptDetail[];
}

/**
 * Details about a single attempt
 */
export interface AttemptDetail {
  /** Attempt number (1-indexed) */
  attempt: number;
  /** Whether this attempt succeeded */
  success: boolean;
  /** Error if attempt failed */
  error?: Error;
  /** Delay before this attempt (0 for first attempt) */
  delayMs: number;
  /** Duration of this attempt */
  durationMs: number;
}

/**
 * HTTP error with status code for retry determination
 */
export interface HttpError extends Error {
  status?: number;
  code?: string;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  jitterFactor: 0.25,
};

/**
 * Calculate delay for a given attempt using exponential backoff
 *
 * Formula: baseDelay * (multiplier ^ attempt)
 * Result is capped at maxDelayMs to prevent excessive waits
 *
 * @param attempt - The retry attempt number (0-indexed)
 * @param config - Retry configuration
 * @returns Delay in milliseconds (without jitter)
 *
 * @example
 * // With baseDelayMs=1000, multiplier=2:
 * calculateExponentialDelay(0, config) // 1000ms
 * calculateExponentialDelay(1, config) // 2000ms
 * calculateExponentialDelay(2, config) // 4000ms
 */
export function calculateExponentialDelay(
  attempt: number,
  config: Pick<RetryConfig, 'baseDelayMs' | 'backoffMultiplier' | 'maxDelayMs'>
): number {
  const delay = config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt);
  return Math.min(delay, config.maxDelayMs);
}

/**
 * Apply jitter to a delay value to prevent thundering herd
 *
 * Jitter adds randomness to prevent multiple clients from retrying
 * simultaneously after a shared failure. Uses uniform distribution
 * within ±jitterFactor of the base delay.
 *
 * @param delayMs - Base delay in milliseconds
 * @param jitterFactor - Maximum jitter as percentage (e.g., 0.25 = ±25%)
 * @returns Delay with jitter applied (never negative)
 *
 * @example
 * applyJitter(1000, 0.25) // Returns between 750-1250ms
 */
export function applyJitter(delayMs: number, jitterFactor: number): number {
  // Calculate jitter range (±jitterFactor of delay)
  const jitterRange = delayMs * jitterFactor;
  // Random value between -jitterRange and +jitterRange
  const jitter = (Math.random() * 2 - 1) * jitterRange;
  // Ensure delay is never negative
  return Math.max(0, Math.round(delayMs + jitter));
}

/**
 * Calculate the full delay for a retry attempt including jitter
 *
 * Combines exponential backoff calculation with jitter application.
 *
 * @param attempt - The retry attempt number (0-indexed)
 * @param config - Retry configuration
 * @returns Delay in milliseconds with jitter applied
 */
export function calculateRetryDelay(
  attempt: number,
  config: Pick<RetryConfig, 'baseDelayMs' | 'backoffMultiplier' | 'maxDelayMs' | 'jitterFactor'>
): number {
  const baseDelay = calculateExponentialDelay(attempt, config);
  return applyJitter(baseDelay, config.jitterFactor);
}

/**
 * Create a promise that resolves after a delay
 *
 * @param ms - Delay in milliseconds
 * @returns Promise that resolves after delay
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Determine if an error is retryable based on default rules
 *
 * Retryable conditions:
 * - Network errors (fetch failures, timeouts)
 * - Rate limiting (HTTP 429)
 * - Server errors (HTTP 5xx)
 *
 * Non-retryable conditions:
 * - Client errors (HTTP 4xx except 429)
 * - Validation errors
 * - Authentication errors
 *
 * @param error - The error to check
 * @returns true if the error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  // Null/undefined - not retryable (shouldn't happen but be safe)
  if (!error) return false;

  // Check for HTTP status codes
  const httpError = error as HttpError;
  if (typeof httpError.status === 'number') {
    const status = httpError.status;

    // Rate limiting - retryable
    if (status === 429) return true;

    // Server errors (5xx) - retryable
    if (status >= 500 && status < 600) return true;

    // Client errors (4xx except 429) - not retryable
    if (status >= 400 && status < 500) return false;
  }

  // Check for error codes (consistent with existing ApiError pattern in /src/lib/api.ts)
  if (typeof httpError.code === 'string') {
    const code = httpError.code.toUpperCase();

    // Retryable error codes
    const retryableCodes = [
      'RATE_LIMITED',
      'SERVICE_UNAVAILABLE',
      'BAD_GATEWAY',
      'GATEWAY_TIMEOUT',
      'ECONNRESET',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ENETUNREACH',
    ];
    if (retryableCodes.includes(code)) {
      return true;
    }

    // Non-retryable error codes
    const nonRetryableCodes = [
      'BAD_REQUEST',
      'UNAUTHORIZED',
      'FORBIDDEN',
      'NOT_FOUND',
      'CONFLICT',
      'VALIDATION_FAILED',
    ];
    if (nonRetryableCodes.includes(code)) {
      return false;
    }
  }

  // Check error message for network-related patterns
  const errorMessage = (error instanceof Error ? error.message : String(error)).toLowerCase();

  // Network errors - retryable
  const networkPatterns = [
    'network',
    'timeout',
    'econnreset',
    'socket hang up',
    'fetch failed',
    'connection refused',
    'dns',
  ];

  if (networkPatterns.some(pattern => errorMessage.includes(pattern))) {
    return true;
  }

  // Default: assume retryable to be safe (fail-safe approach)
  return true;
}

/**
 * Execute an async operation with exponential backoff retry logic
 *
 * Automatically retries failed operations based on error type and
 * configuration. Returns a comprehensive result object with success
 * status, data/error, and detailed attempt information.
 *
 * @param operation - Async function to execute
 * @param config - Retry configuration (partial, merged with defaults)
 * @returns RetryResult containing success status, data/error, and attempt details
 *
 * @example
 * ```typescript
 * const result = await withRetry(
 *   () => translateText(request),
 *   { maxRetries: 3, onRetry: (attempt, error) => console.log(`Retry ${attempt}`) }
 * );
 *
 * if (result.success) {
 *   console.log('Translation:', result.data);
 * } else {
 *   console.error('Failed after retries:', result.error);
 * }
 * ```
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<RetryResult<T>> {
  const fullConfig: RetryConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    isRetryable: config.isRetryable ?? isRetryableError,
  };

  const attemptDetails: AttemptDetail[] = [];
  const startTime = Date.now();
  let lastError: Error | undefined;

  // Total attempts = 1 initial + maxRetries
  const totalAttempts = fullConfig.maxRetries + 1;

  for (let attempt = 0; attempt < totalAttempts; attempt++) {
    const isRetry = attempt > 0;
    let delayMs = 0;

    // Apply delay before retry (not before first attempt)
    if (isRetry) {
      delayMs = calculateRetryDelay(attempt - 1, fullConfig);
      await sleep(delayMs);
    }

    const attemptStartTime = Date.now();

    try {
      // Execute the operation
      const data = await operation();

      // Success - record attempt and return
      attemptDetails.push({
        attempt: attempt + 1,
        success: true,
        delayMs,
        durationMs: Date.now() - attemptStartTime,
      });

      return {
        data,
        success: true,
        attempts: attempt + 1,
        totalTimeMs: Date.now() - startTime,
        attemptDetails,
      };
    } catch (error) {
      // Capture error as Error object
      lastError = error instanceof Error ? error : new Error(String(error));

      // Record failed attempt
      attemptDetails.push({
        attempt: attempt + 1,
        success: false,
        error: lastError,
        delayMs,
        durationMs: Date.now() - attemptStartTime,
      });

      // Check if we should retry
      const canRetry = attempt < fullConfig.maxRetries;
      const shouldRetry = canRetry && fullConfig.isRetryable!(error);

      if (shouldRetry) {
        // Calculate next delay for logging
        const nextDelay = calculateRetryDelay(attempt, fullConfig);

        // Fire onRetry callback if provided
        if (fullConfig.onRetry) {
          fullConfig.onRetry(attempt + 1, error, nextDelay);
        }

        // Log retry attempt for observability (REQ-239 acceptance criteria)
        console.warn(
          `[retry] Attempt ${attempt + 1}/${totalAttempts} failed. ` +
          `Retrying in ${nextDelay}ms. Error: ${lastError.message}`
        );

        continue;
      }

      // Not retryable or no retries left - break out of loop
      if (!shouldRetry && canRetry) {
        console.warn(
          `[retry] Attempt ${attempt + 1}/${totalAttempts} failed with non-retryable error: ` +
          lastError.message
        );
      }

      break;
    }
  }

  // All attempts exhausted - return failure result
  return {
    error: lastError,
    success: false,
    attempts: attemptDetails.length,
    totalTimeMs: Date.now() - startTime,
    attemptDetails,
  };
}

/**
 * Execute an operation with retry and throw on final failure
 *
 * Unlike withRetry which returns a result object, this function
 * throws the final error if all retries are exhausted. Use this
 * when you want standard try/catch error handling.
 *
 * @param operation - Async function to execute
 * @param config - Retry configuration
 * @returns The operation result on success
 * @throws The final error if all retries exhausted (with retryAttempts metadata)
 *
 * @example
 * ```typescript
 * try {
 *   const translation = await retryOperation(
 *     () => translateText(request),
 *     { maxRetries: 3 }
 *   );
 * } catch (error) {
 *   console.error('Translation failed after all retries:', error);
 * }
 * ```
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const result = await withRetry(operation, config);

  if (result.success) {
    return result.data!;
  }

  // Enhance error with retry information for debugging
  const error = result.error || new Error('Operation failed after retries');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (error as any).retryAttempts = result.attempts;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (error as any).totalTimeMs = result.totalTimeMs;

  throw error;
}

/**
 * Create a retry-wrapped version of an async function
 *
 * Returns a new function with the same signature that automatically
 * retries on transient failures. Useful for wrapping existing functions.
 *
 * @param fn - Async function to wrap
 * @param config - Retry configuration
 * @returns Wrapped function that will retry on failure
 *
 * @example
 * ```typescript
 * const robustTranslate = withRetryWrapper(translateText, { maxRetries: 3 });
 * const result = await robustTranslate(request);
 * ```
 */
export function withRetryWrapper<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  config: Partial<RetryConfig> = {}
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    return retryOperation(() => fn(...args), config);
  };
}

/**
 * Retry configuration presets for common use cases
 *
 * Use these presets as starting points for retry configuration.
 * They can be extended or overridden as needed.
 */
export const RetryPresets = {
  /**
   * Standard retry for API calls: 3 retries, 1s base delay
   * Good default for most translation operations
   */
  standard: {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    jitterFactor: 0.25,
  } as RetryConfig,

  /**
   * Aggressive retry for critical operations: 5 retries, 500ms base delay
   * Use when reliability is critical and latency is less important
   */
  aggressive: {
    maxRetries: 5,
    baseDelayMs: 500,
    maxDelayMs: 60000,
    backoffMultiplier: 2,
    jitterFactor: 0.3,
  } as RetryConfig,

  /**
   * Conservative retry for rate-limited APIs: 3 retries, 2s base delay
   * Use when dealing with strict rate limits (e.g., Claude API)
   */
  conservative: {
    maxRetries: 3,
    baseDelayMs: 2000,
    maxDelayMs: 60000,
    backoffMultiplier: 3,
    jitterFactor: 0.4,
  } as RetryConfig,

  /**
   * Quick retry for fast-failing operations: 2 retries, 100ms base delay
   * Use for operations that should fail quickly if not working
   */
  quick: {
    maxRetries: 2,
    baseDelayMs: 100,
    maxDelayMs: 1000,
    backoffMultiplier: 2,
    jitterFactor: 0.2,
  } as RetryConfig,
} as const;
