# REQ-253: Write Unit Tests for Translation Service - Implementation Overview

**Generated:** 2026-01-18 00:30 UTC
**Last Modified:** 2026-01-18 00:30 UTC
**Request Reference:** docs/gen_requests.md - Request #253
**Implementation Plan Reference:** docs/prd/Plan-110-L10N-Epic1-Foundation.md (Phase 6, Task 6.1)
**Status:** Overview Document

---

## Executive Summary

This document provides the implementation breakdown for Task 6.1 (Unit Tests for Translation Service) from the L10N Epic 1 Foundation implementation plan. The task establishes comprehensive unit test coverage for the translation service's core functionality including the `translateText` function, retry logic with exponential backoff, and rate limiter utility.

**Note:** This testing task depends on Phase 3 (Translation Service) being completed. The tests should be implemented alongside or immediately after the translation service modules are created.

---

## Technical Context

### Current Test Infrastructure

| Technology | Details |
|------------|---------|
| **Test Framework** | Vitest (primary), Jest API compatibility |
| **DOM Environment** | jsdom (`@vitest-environment jsdom`) |
| **Hook/Utility Testing** | @testing-library/react, renderHook |
| **Mocking** | vi.mock(), vi.fn(), vi.mocked() |
| **Timer Control** | vi.useFakeTimers(), vi.advanceTimersByTime() |
| **Coverage** | v8 provider via @vitest/coverage-v8 |

### Existing Test Patterns (Reference)

| Pattern | Example Location | Description |
|---------|------------------|-------------|
| **Pure Function Tests** | `src/lib/__tests__/room-utils.test.ts` | Direct testing of utility functions |
| **Hook Tests** | `src/components/ItemCreationWorkflow/hooks/__tests__/*.test.ts` | Using `renderHook` |
| **Mock Factory** | `src/components/ItemCapture/utils/__tests__/validation.test.ts` | `createMockX()` helpers |
| **Timer Mocking** | `src/components/ItemCreationWorkflow/hooks/__tests__/useSessionPersistence.test.ts` | Debounce/timeout testing |
| **Module Mocking** | `src/components/ItemCreationWorkflow/hooks/__tests__/useUrlPreview.test.ts` | API/fetch mocking |

### Target Files to Test

| File Path | Purpose |
|-----------|---------|
| `/src/lib/translation-service/translation-service.ts` | Main translation wrapper with `translateText()` |
| `/src/lib/translation-service/utils/retry.ts` | Exponential backoff retry logic |
| `/src/lib/translation-service/utils/rate-limiter.ts` | API rate limiting utility |
| `/src/lib/translation-service/providers/claude-provider.ts` | Claude API implementation |
| `/src/lib/translation-service/providers/openai-provider.ts` | OpenAI API fallback |

---

## Authorized Files and Functions for Modification

### Test Files (CREATE/WRITE)

| File Path | Purpose |
|-----------|---------|
| `src/lib/translation-service/__tests__/translation-service.test.ts` | Tests for main translation service wrapper |
| `src/lib/translation-service/utils/__tests__/retry.test.ts` | Tests for retry logic with exponential backoff |
| `src/lib/translation-service/utils/__tests__/rate-limiter.test.ts` | Tests for rate limiting utility |
| `src/lib/translation-service/providers/__tests__/claude-provider.test.ts` | Tests for Claude translation provider |
| `src/lib/translation-service/providers/__tests__/openai-provider.test.ts` | Tests for OpenAI translation provider |

### Source Files (READ ONLY - for reference during test writing)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/translation-service/translation-service.ts` | Main service implementation |
| `/src/lib/translation-service/translation-service.types.ts` | Type definitions |
| `/src/lib/translation-service/index.ts` | Module exports |
| `/src/lib/translation-service/utils/retry.ts` | Retry utility implementation |
| `/src/lib/translation-service/utils/rate-limiter.ts` | Rate limiter implementation |
| `/src/lib/translation-service/providers/claude-provider.ts` | Claude provider implementation |
| `/src/lib/translation-service/providers/openai-provider.ts` | OpenAI provider implementation |

### Configuration Files (READ ONLY)

| File Path | Purpose |
|-----------|---------|
| `/vitest.config.ts` | Test configuration - may need coverage path updates |

---

## Implementation Tasks

### Task 1: Create Test Directory Structure

**Action:** Create `__tests__` directories for translation service modules

```
/src/lib/translation-service/
├── __tests__/
│   └── translation-service.test.ts
├── utils/
│   └── __tests__/
│       ├── retry.test.ts
│       └── rate-limiter.test.ts
└── providers/
    └── __tests__/
        ├── claude-provider.test.ts
        └── openai-provider.test.ts
```

---

### Task 2: Test `translateText` Function

**File:** `src/lib/translation-service/__tests__/translation-service.test.ts`

**Test Categories:**

```typescript
describe('translateText')
  describe('successful translations')
    - translates text from English to French
    - translates text from English to Spanish
    - translates text to all supported languages
    - includes context in translation requests
    - respects maxLength constraints
  describe('provider selection')
    - uses Claude provider by default
    - falls back to OpenAI when Claude fails
    - respects TRANSLATION_PROVIDER env configuration
  describe('error handling')
    - throws error for empty text input
    - throws error for unsupported source language
    - throws error for unsupported target language
    - throws error when same source and target language
    - propagates provider errors with context
  describe('batch translations')
    - translateToAllLanguages processes all target languages
    - aggregates results correctly
    - handles partial failures gracefully
```

**Key Test Patterns:**

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { translateText, translateToAllLanguages } from '../translation-service';
import * as claudeProvider from '../providers/claude-provider';
import * as openaiProvider from '../providers/openai-provider';

vi.mock('../providers/claude-provider');
vi.mock('../providers/openai-provider');

describe('translateText', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('translates text successfully using Claude provider', async () => {
    vi.mocked(claudeProvider.translate).mockResolvedValueOnce({
      translatedText: 'Bonjour le monde',
      provider: 'claude',
      confidence: 0.95,
    });

    const result = await translateText({
      text: 'Hello world',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
    });

    expect(result.translatedText).toBe('Bonjour le monde');
    expect(result.provider).toBe('claude');
    expect(claudeProvider.translate).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'Hello world',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      })
    );
  });

  it('falls back to OpenAI when Claude fails', async () => {
    vi.mocked(claudeProvider.translate).mockRejectedValueOnce(
      new Error('Claude API error')
    );
    vi.mocked(openaiProvider.translate).mockResolvedValueOnce({
      translatedText: 'Bonjour le monde',
      provider: 'openai',
    });

    const result = await translateText({
      text: 'Hello world',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
    });

    expect(result.provider).toBe('openai');
  });

  it('throws error for empty text', async () => {
    await expect(translateText({
      text: '',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
    })).rejects.toThrow('Text is required');
  });
});
```

---

### Task 3: Test Retry Logic

**File:** `src/lib/translation-service/utils/__tests__/retry.test.ts`

**Test Categories:**

```typescript
describe('retry utility')
  describe('successful operations')
    - returns result on first attempt success
    - returns result after retries succeed
    - preserves return value type
  describe('retry behavior')
    - retries up to maxRetries times (default 3)
    - uses exponential backoff between retries
    - adds jitter to prevent thundering herd
    - respects custom maxRetries setting
  describe('failure handling')
    - throws after exhausting all retries
    - includes attempt count in error
    - preserves original error message
  describe('timing')
    - waits correct duration between retries
    - first retry delay is baseDelay
    - second retry delay is baseDelay * 2
    - third retry delay is baseDelay * 4
  describe('abort handling')
    - stops retrying when signal is aborted
    - cleans up pending timers on abort
```

**Key Test Patterns:**

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withRetry, calculateBackoffDelay } from '../retry';

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns result on first attempt success', async () => {
    const operation = vi.fn().mockResolvedValue('success');

    const result = await withRetry(operation);

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and succeeds eventually', async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValueOnce('success');

    const resultPromise = withRetry(operation, { maxRetries: 3 });

    // Advance through retry delays
    await vi.advanceTimersByTimeAsync(1000); // first retry
    await vi.advanceTimersByTimeAsync(2000); // second retry

    const result = await resultPromise;
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('throws after exhausting all retries', async () => {
    const operation = vi.fn().mockRejectedValue(new Error('persistent failure'));

    const resultPromise = withRetry(operation, { maxRetries: 3 });

    // Advance through all retries
    await vi.advanceTimersByTimeAsync(1000);
    await vi.advanceTimersByTimeAsync(2000);
    await vi.advanceTimersByTimeAsync(4000);

    await expect(resultPromise).rejects.toThrow('persistent failure');
    expect(operation).toHaveBeenCalledTimes(4); // initial + 3 retries
  });

  it('uses exponential backoff with jitter', async () => {
    const delays: number[] = [];
    const originalSetTimeout = globalThis.setTimeout;

    vi.spyOn(globalThis, 'setTimeout').mockImplementation((fn, delay) => {
      delays.push(delay as number);
      return originalSetTimeout(fn, 0);
    });

    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('success');

    await withRetry(operation, {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000
    });

    // Verify delays are exponential (with some jitter tolerance)
    expect(delays[0]).toBeGreaterThanOrEqual(800); // ~1000ms with jitter
    expect(delays[0]).toBeLessThanOrEqual(1200);
    expect(delays[1]).toBeGreaterThanOrEqual(1600); // ~2000ms with jitter
    expect(delays[1]).toBeLessThanOrEqual(2400);
  });
});

describe('calculateBackoffDelay', () => {
  it('calculates correct exponential delay', () => {
    expect(calculateBackoffDelay(0, 1000)).toBe(1000); // 1000 * 2^0
    expect(calculateBackoffDelay(1, 1000)).toBe(2000); // 1000 * 2^1
    expect(calculateBackoffDelay(2, 1000)).toBe(4000); // 1000 * 2^2
    expect(calculateBackoffDelay(3, 1000)).toBe(8000); // 1000 * 2^3
  });

  it('respects maxDelay cap', () => {
    const result = calculateBackoffDelay(10, 1000, 5000);
    expect(result).toBeLessThanOrEqual(5000);
  });
});
```

---

### Task 4: Test Rate Limiter

**File:** `src/lib/translation-service/utils/__tests__/rate-limiter.test.ts`

**Test Categories:**

```typescript
describe('RateLimiter')
  describe('initialization')
    - creates limiter with specified requests per minute
    - defaults to 60 requests per minute
    - accepts custom window size
  describe('token bucket behavior')
    - allows requests within limit
    - blocks requests exceeding limit
    - refills tokens over time
    - tracks remaining tokens accurately
  describe('acquire method')
    - returns immediately when tokens available
    - waits when no tokens available
    - respects order of waiting requests
  describe('tryAcquire method')
    - returns true when tokens available
    - returns false when no tokens (non-blocking)
  describe('getRemainingTokens')
    - returns correct count of available tokens
    - updates after acquire
    - updates after refill
  describe('concurrent access')
    - handles multiple simultaneous acquires
    - maintains correct token count under load
  describe('timing')
    - refills at correct rate
    - clears waiters after timeout
```

**Key Test Patterns:**

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RateLimiter, createRateLimiter } from '../rate-limiter';

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows requests within rate limit', async () => {
    const limiter = createRateLimiter({ requestsPerMinute: 60 });

    // Should allow 60 requests
    for (let i = 0; i < 60; i++) {
      const acquired = await limiter.tryAcquire();
      expect(acquired).toBe(true);
    }
  });

  it('blocks requests exceeding limit', async () => {
    const limiter = createRateLimiter({ requestsPerMinute: 5 });

    // Exhaust tokens
    for (let i = 0; i < 5; i++) {
      await limiter.tryAcquire();
    }

    // Next request should be blocked
    const acquired = await limiter.tryAcquire();
    expect(acquired).toBe(false);
  });

  it('refills tokens over time', async () => {
    const limiter = createRateLimiter({ requestsPerMinute: 60 });

    // Exhaust all tokens
    for (let i = 0; i < 60; i++) {
      await limiter.tryAcquire();
    }

    expect(limiter.getRemainingTokens()).toBe(0);

    // Advance time by 1 second (should refill 1 token at 60/min)
    await vi.advanceTimersByTimeAsync(1000);

    expect(limiter.getRemainingTokens()).toBe(1);
  });

  it('acquire waits when no tokens available', async () => {
    const limiter = createRateLimiter({ requestsPerMinute: 1 });

    // Take the only token
    await limiter.acquire();

    // Start another acquire (should wait)
    let acquired = false;
    const acquirePromise = limiter.acquire().then(() => {
      acquired = true;
    });

    // Should not be acquired yet
    expect(acquired).toBe(false);

    // Advance time to refill
    await vi.advanceTimersByTimeAsync(60000);
    await acquirePromise;

    expect(acquired).toBe(true);
  });

  it('tracks remaining tokens accurately', async () => {
    const limiter = createRateLimiter({ requestsPerMinute: 10 });

    expect(limiter.getRemainingTokens()).toBe(10);

    await limiter.acquire();
    expect(limiter.getRemainingTokens()).toBe(9);

    await limiter.acquire();
    expect(limiter.getRemainingTokens()).toBe(8);

    // Advance 6 seconds (should add 1 token at 10/min)
    await vi.advanceTimersByTimeAsync(6000);
    expect(limiter.getRemainingTokens()).toBe(9);
  });

  it('handles concurrent acquires correctly', async () => {
    const limiter = createRateLimiter({ requestsPerMinute: 2 });

    // Start 3 concurrent acquires
    const results: number[] = [];
    const p1 = limiter.acquire().then(() => results.push(1));
    const p2 = limiter.acquire().then(() => results.push(2));
    const p3 = limiter.acquire().then(() => results.push(3));

    // First two should resolve immediately
    await vi.advanceTimersByTimeAsync(0);
    expect(results).toEqual([1, 2]);

    // Third should wait for refill
    await vi.advanceTimersByTimeAsync(30000); // Wait for token refill
    await p3;
    expect(results).toEqual([1, 2, 3]);
  });
});
```

---

### Task 5: Test Translation Providers

**Files:**
- `src/lib/translation-service/providers/__tests__/claude-provider.test.ts`
- `src/lib/translation-service/providers/__tests__/openai-provider.test.ts`

**Test Categories (same for both providers):**

```typescript
describe('Claude/OpenAI Provider')
  describe('translate function')
    - sends correct API request format
    - returns translated text from API response
    - includes domain context in prompt
    - handles API errors gracefully
    - reports token usage when available
  describe('API configuration')
    - uses correct API endpoint
    - includes authentication headers
    - respects timeout settings
  describe('prompt construction')
    - builds appropriate system prompt
    - includes content type context
    - handles special characters in text
```

**Key Test Patterns:**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { translate } from '../claude-provider';

// Mock fetch globally
global.fetch = vi.fn();

describe('Claude Provider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('ANTHROPIC_API_KEY', 'test-api-key');
  });

  it('sends correct API request format', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        content: [{ text: 'Bonjour' }],
        usage: { input_tokens: 10, output_tokens: 5 },
      }),
    } as Response);

    await translate({
      text: 'Hello',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.anthropic.com/v1/messages',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'x-api-key': 'test-api-key',
          'anthropic-version': expect.any(String),
        }),
        body: expect.stringContaining('Hello'),
      })
    );
  });

  it('returns translated text from API response', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        content: [{ text: 'Bonjour le monde' }],
      }),
    } as Response);

    const result = await translate({
      text: 'Hello world',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
    });

    expect(result.translatedText).toBe('Bonjour le monde');
    expect(result.provider).toBe('claude');
  });

  it('handles API errors gracefully', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
    } as Response);

    await expect(translate({
      text: 'Hello',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
    })).rejects.toThrow('Too Many Requests');
  });

  it('includes context in prompt when provided', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        content: [{ text: 'Cuisiniere' }],
      }),
    } as Response);

    await translate({
      text: 'Stove',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
      context: {
        contentType: 'item_name',
        domainContext: 'kitchen appliance in rental property',
      },
    });

    const callBody = JSON.parse(
      vi.mocked(global.fetch).mock.calls[0][1]?.body as string
    );
    expect(callBody.messages[0].content).toContain('kitchen appliance');
  });
});
```

---

## Acceptance Criteria Verification

| Criterion | Test File | Coverage |
|-----------|-----------|----------|
| Text translation produces correct results for valid inputs | translation-service.test.ts | Multiple language pair tests |
| Translation requests that fail transiently are automatically retried | retry.test.ts | Retry behavior tests |
| Retry uses exponential backoff | retry.test.ts | Timing and delay tests |
| Translation requests exceeding rate limits are queued | rate-limiter.test.ts | Token bucket tests |
| Invalid inputs are rejected with appropriate error messages | translation-service.test.ts | Error handling tests |
| All test cases pass consistently | All test files | vi.useFakeTimers() for determinism |
| Tests complete execution in under 30 seconds | All test files | Use fake timers, no real delays |
| Test coverage exceeds 80% | All source files | Comprehensive test categories |

---

## Test Execution

### Running Tests

```bash
# Run all translation service tests
npm test -- src/lib/translation-service

# Run specific test files
npm test -- src/lib/translation-service/__tests__/translation-service.test.ts
npm test -- src/lib/translation-service/utils/__tests__/retry.test.ts
npm test -- src/lib/translation-service/utils/__tests__/rate-limiter.test.ts

# Run with coverage
npm test -- --coverage src/lib/translation-service

# Run in watch mode during development
npm test -- --watch src/lib/translation-service
```

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| vitest | Test framework (already installed) |
| @testing-library/react | Hook testing if needed (already installed) |
| vi.mock / vi.fn | Mocking utilities (built into vitest) |
| vi.useFakeTimers | Timer control for async tests (built into vitest) |

---

## Implementation Order

1. **Task 1:** Create test directory structure
2. **Task 4:** Test Rate Limiter - Pure utility, no dependencies
3. **Task 3:** Test Retry Logic - Pure utility, no dependencies
4. **Task 5:** Test Providers - Depends on understanding API contracts
5. **Task 2:** Test translateText - Integration of all components

**Rationale:** Start with leaf dependencies (rate limiter, retry) that have no external dependencies, then work up to the main service that integrates them.

---

## Vitest Configuration Update

The vitest.config.ts may need to be updated to include translation service in coverage:

```typescript
// vitest.config.ts - suggested coverage update
coverage: {
  include: [
    'src/components/ItemCreationWorkflow/**/*.ts',
    'src/components/ItemCreationWorkflow/**/*.tsx',
    'src/lib/translation-service/**/*.ts',  // Add this line
  ],
}
```

---

## Notes

- All tests should use `vi.useFakeTimers()` to ensure deterministic behavior
- Mock external API calls to avoid network dependencies
- Follow existing test patterns from `validation.test.ts` and `sessionStorage.test.ts`
- Each test file should be self-contained with clear describe blocks
- Use factory functions (e.g., `createMockRequest()`) for test data

---

## References

- [Implementation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md) - Phase 6, Task 6.1
- [Request #253](/docs/gen_requests.md#req-253) - Unit Tests for Translation Service
- [Translation Service Types](/src/lib/translation-service/translation-service.types.ts) - Type definitions
- [Existing Test Examples](/src/components/ItemCapture/utils/__tests__/validation.test.ts) - Test patterns
- [Vitest Documentation](https://vitest.dev/) - Test framework reference

---

*Document generated on 2026-01-18 for REQ-253: Write Unit Tests for Translation Service*
