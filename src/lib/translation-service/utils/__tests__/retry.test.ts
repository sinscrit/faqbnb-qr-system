/**
 * Unit Tests for Retry Logic with Exponential Backoff
 * Part of REQ-239: Translation Service Retry Logic
 *
 * @created 2026-01-18
 * @lastModified 2026-01-18
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  withRetry,
  retryOperation,
  withRetryWrapper,
  calculateExponentialDelay,
  applyJitter,
  calculateRetryDelay,
  isRetryableError,
  sleep,
  RetryPresets,
} from '../retry';

describe('retry utility (REQ-239)', () => {
  describe('calculateExponentialDelay', () => {
    const config = { baseDelayMs: 1000, backoffMultiplier: 2, maxDelayMs: 30000 };

    it('should calculate correct delay for each attempt', () => {
      expect(calculateExponentialDelay(0, config)).toBe(1000);  // 1000 * 2^0
      expect(calculateExponentialDelay(1, config)).toBe(2000);  // 1000 * 2^1
      expect(calculateExponentialDelay(2, config)).toBe(4000);  // 1000 * 2^2
      expect(calculateExponentialDelay(3, config)).toBe(8000);  // 1000 * 2^3
    });

    it('should cap delay at maxDelayMs', () => {
      const cappedConfig = { baseDelayMs: 1000, backoffMultiplier: 2, maxDelayMs: 5000 };
      expect(calculateExponentialDelay(0, cappedConfig)).toBe(1000);
      expect(calculateExponentialDelay(10, cappedConfig)).toBe(5000); // Capped
    });

    it('should handle multiplier of 1 (linear)', () => {
      const linearConfig = { baseDelayMs: 1000, backoffMultiplier: 1, maxDelayMs: 30000 };
      expect(calculateExponentialDelay(0, linearConfig)).toBe(1000);
      expect(calculateExponentialDelay(5, linearConfig)).toBe(1000);
    });
  });

  describe('applyJitter', () => {
    it('should return value within jitter range', () => {
      const baseDelay = 1000;
      const jitterFactor = 0.25;

      // Run multiple times to verify randomness stays in range
      for (let i = 0; i < 100; i++) {
        const result = applyJitter(baseDelay, jitterFactor);
        expect(result).toBeGreaterThanOrEqual(750);  // 1000 - 25%
        expect(result).toBeLessThanOrEqual(1250);    // 1000 + 25%
      }
    });

    it('should never return negative delay', () => {
      for (let i = 0; i < 100; i++) {
        const result = applyJitter(100, 0.99);
        expect(result).toBeGreaterThanOrEqual(0);
      }
    });

    it('should return 0 for 0 delay', () => {
      expect(applyJitter(0, 0.25)).toBe(0);
    });

    it('should return exact delay when jitterFactor is 0', () => {
      expect(applyJitter(1000, 0)).toBe(1000);
    });
  });

  describe('calculateRetryDelay', () => {
    it('should combine exponential delay with jitter', () => {
      const config = {
        baseDelayMs: 1000,
        backoffMultiplier: 2,
        maxDelayMs: 30000,
        jitterFactor: 0.25,
      };

      // Run multiple times to verify it produces reasonable values
      for (let i = 0; i < 100; i++) {
        const delay = calculateRetryDelay(0, config);
        // Base delay is 1000, jitter range is ±25%
        expect(delay).toBeGreaterThanOrEqual(750);
        expect(delay).toBeLessThanOrEqual(1250);
      }
    });
  });

  describe('isRetryableError', () => {
    describe('HTTP status codes', () => {
      it('should return true for rate limit errors (429)', () => {
        expect(isRetryableError({ status: 429, message: 'Rate limited' })).toBe(true);
      });

      it('should return true for server errors (5xx)', () => {
        expect(isRetryableError({ status: 500, message: 'Internal server error' })).toBe(true);
        expect(isRetryableError({ status: 502, message: 'Bad gateway' })).toBe(true);
        expect(isRetryableError({ status: 503, message: 'Service unavailable' })).toBe(true);
        expect(isRetryableError({ status: 504, message: 'Gateway timeout' })).toBe(true);
      });

      it('should return false for client errors (4xx except 429)', () => {
        expect(isRetryableError({ status: 400, message: 'Bad request' })).toBe(false);
        expect(isRetryableError({ status: 401, message: 'Unauthorized' })).toBe(false);
        expect(isRetryableError({ status: 403, message: 'Forbidden' })).toBe(false);
        expect(isRetryableError({ status: 404, message: 'Not found' })).toBe(false);
        expect(isRetryableError({ status: 422, message: 'Unprocessable entity' })).toBe(false);
      });
    });

    describe('error codes', () => {
      it('should return true for retryable error codes', () => {
        expect(isRetryableError({ code: 'RATE_LIMITED' })).toBe(true);
        expect(isRetryableError({ code: 'SERVICE_UNAVAILABLE' })).toBe(true);
        expect(isRetryableError({ code: 'ECONNRESET' })).toBe(true);
        expect(isRetryableError({ code: 'ETIMEDOUT' })).toBe(true);
        expect(isRetryableError({ code: 'ECONNREFUSED' })).toBe(true);
      });

      it('should return false for non-retryable error codes', () => {
        expect(isRetryableError({ code: 'BAD_REQUEST' })).toBe(false);
        expect(isRetryableError({ code: 'UNAUTHORIZED' })).toBe(false);
        expect(isRetryableError({ code: 'VALIDATION_FAILED' })).toBe(false);
      });

      it('should handle case-insensitive codes', () => {
        expect(isRetryableError({ code: 'econnreset' })).toBe(true);
        expect(isRetryableError({ code: 'bad_request' })).toBe(false);
      });
    });

    describe('error messages', () => {
      it('should return true for network error messages', () => {
        expect(isRetryableError(new Error('network error'))).toBe(true);
        expect(isRetryableError(new Error('Request timeout'))).toBe(true);
        expect(isRetryableError(new Error('ECONNRESET'))).toBe(true);
        expect(isRetryableError(new Error('fetch failed'))).toBe(true);
        expect(isRetryableError(new Error('socket hang up'))).toBe(true);
      });
    });

    describe('edge cases', () => {
      it('should return false for null/undefined', () => {
        expect(isRetryableError(null)).toBe(false);
        expect(isRetryableError(undefined)).toBe(false);
      });

      it('should default to true for unknown errors', () => {
        expect(isRetryableError(new Error('Unknown error'))).toBe(true);
        expect(isRetryableError('string error')).toBe(true);
      });
    });
  });

  describe('withRetry', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should succeed on first attempt without retry', async () => {
      const operation = vi.fn().mockResolvedValue('success');

      const resultPromise = withRetry(operation);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(1);
      expect(result.attemptDetails[0].delayMs).toBe(0);
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable error and succeed', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce({ status: 500, message: 'Server error' })
        .mockResolvedValue('success');

      const resultPromise = withRetry(operation, { maxRetries: 3, baseDelayMs: 100 });
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(2);
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should not retry on non-retryable error', async () => {
      const operation = vi.fn()
        .mockRejectedValue({ status: 400, message: 'Bad request' });

      const resultPromise = withRetry(operation, { maxRetries: 3 });
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(1);
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should exhaust all retries and fail', async () => {
      const operation = vi.fn()
        .mockRejectedValue({ status: 500, message: 'Server error' });

      const resultPromise = withRetry(operation, { maxRetries: 3, baseDelayMs: 100 });
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(4); // 1 initial + 3 retries
      expect(operation).toHaveBeenCalledTimes(4);
    });

    it('should call onRetry callback', async () => {
      const onRetry = vi.fn();
      const operation = vi.fn()
        .mockRejectedValueOnce({ status: 500, message: 'Error' })
        .mockResolvedValue('success');

      const resultPromise = withRetry(operation, {
        maxRetries: 3,
        baseDelayMs: 100,
        onRetry,
      });
      await vi.runAllTimersAsync();
      await resultPromise;

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Object), expect.any(Number));
    });

    it('should track attempt details', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce({ status: 500, message: 'Error 1' })
        .mockRejectedValueOnce({ status: 500, message: 'Error 2' })
        .mockResolvedValue('success');

      const resultPromise = withRetry(operation, { maxRetries: 3, baseDelayMs: 100 });
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.attemptDetails).toHaveLength(3);
      expect(result.attemptDetails[0].success).toBe(false);
      expect(result.attemptDetails[0].delayMs).toBe(0); // No delay on first attempt
      expect(result.attemptDetails[1].success).toBe(false);
      expect(result.attemptDetails[1].delayMs).toBeGreaterThan(0);
      expect(result.attemptDetails[2].success).toBe(true);
    });

    it('should use custom isRetryable function', async () => {
      const customIsRetryable = vi.fn().mockReturnValue(false);
      const operation = vi.fn().mockRejectedValue(new Error('Custom error'));

      const resultPromise = withRetry(operation, {
        maxRetries: 3,
        isRetryable: customIsRetryable,
      });
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.attempts).toBe(1);
      expect(customIsRetryable).toHaveBeenCalled();
    });

    it('should preserve error in result', async () => {
      const testError = new Error('Test failure');
      const operation = vi.fn().mockRejectedValue(testError);

      const resultPromise = withRetry(operation, { maxRetries: 0 });
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.error?.message).toBe('Test failure');
    });
  });

  describe('retryOperation', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return data on success', async () => {
      const operation = vi.fn().mockResolvedValue('success');

      const resultPromise = retryOperation(operation);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result).toBe('success');
    });

    it('should throw on failure after retries', async () => {
      const serverError = new Error('Server error');
      (serverError as any).status = 500;
      const operation = vi.fn().mockRejectedValue(serverError);

      const resultPromise = retryOperation(operation, { maxRetries: 2, baseDelayMs: 100 });

      // Handle the rejection explicitly to avoid unhandled rejection warnings
      resultPromise.catch(() => {});

      await vi.runAllTimersAsync();

      await expect(resultPromise).rejects.toMatchObject({
        message: 'Server error',
        retryAttempts: 3,
      });
    });
  });

  describe('withRetryWrapper', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should create a wrapped function with retry', async () => {
      const originalFn = vi.fn()
        .mockRejectedValueOnce({ status: 500, message: 'Error' })
        .mockResolvedValue('wrapped result');

      const wrappedFn = withRetryWrapper(originalFn, { maxRetries: 3, baseDelayMs: 100 });

      const resultPromise = wrappedFn('arg1', 'arg2');
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result).toBe('wrapped result');
      expect(originalFn).toHaveBeenCalledTimes(2);
      expect(originalFn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should preserve function arguments', async () => {
      const originalFn = vi.fn().mockResolvedValue('result');
      const wrappedFn = withRetryWrapper(originalFn, {});

      const resultPromise = wrappedFn('a', 1, { key: 'value' });
      await vi.runAllTimersAsync();
      await resultPromise;

      expect(originalFn).toHaveBeenCalledWith('a', 1, { key: 'value' });
    });
  });

  describe('RetryPresets', () => {
    it('should have standard preset with expected values', () => {
      expect(RetryPresets.standard.maxRetries).toBe(3);
      expect(RetryPresets.standard.baseDelayMs).toBe(1000);
      expect(RetryPresets.standard.maxDelayMs).toBe(30000);
      expect(RetryPresets.standard.backoffMultiplier).toBe(2);
      expect(RetryPresets.standard.jitterFactor).toBe(0.25);
    });

    it('should have aggressive preset for critical operations', () => {
      expect(RetryPresets.aggressive.maxRetries).toBe(5);
      expect(RetryPresets.aggressive.baseDelayMs).toBe(500);
    });

    it('should have conservative preset for rate-limited APIs', () => {
      expect(RetryPresets.conservative.maxRetries).toBe(3);
      expect(RetryPresets.conservative.baseDelayMs).toBe(2000);
      expect(RetryPresets.conservative.backoffMultiplier).toBe(3);
    });

    it('should have quick preset for fast-failing operations', () => {
      expect(RetryPresets.quick.maxRetries).toBe(2);
      expect(RetryPresets.quick.baseDelayMs).toBe(100);
      expect(RetryPresets.quick.maxDelayMs).toBe(1000);
    });
  });

  describe('sleep', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should resolve after specified delay', async () => {
      const callback = vi.fn();
      const promise = sleep(1000).then(callback);

      expect(callback).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(999);
      expect(callback).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1);
      await promise;
      expect(callback).toHaveBeenCalled();
    });

    it('should handle 0ms delay', async () => {
      const callback = vi.fn();
      const promise = sleep(0).then(callback);
      await vi.advanceTimersByTimeAsync(0);
      await promise;
      expect(callback).toHaveBeenCalled();
    });
  });
});
