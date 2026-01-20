# REQ-E03-019: Implement Concurrency Control - Implementation Overview

**Generated:** 2026-01-20 15:23:00 UTC
**Last Modified:** 2026-01-20 15:23:00 UTC
**Request ID:** REQ-E03-019
**Epic:** 3 - Dynamic Content Translation
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.7
**Size:** M (Medium)
**Implementation Plan Reference:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md

---

## Summary

Implement a semaphore-based concurrency control mechanism that limits the number of concurrent translation API calls to a maximum of 10, prevents overwhelming the translation service provider, and respects rate limits with exponential backoff for 429 responses.

---

## Current State Analysis

### Existing Concurrency Infrastructure

The codebase already has significant concurrency-related infrastructure in place:

1. **Database Lock-Based Concurrency** (`/src/lib/job-queue/concurrency-control.ts`)
   - Stale lock cleanup and recovery
   - Lock heartbeat for long-running jobs
   - Duplicate job prevention
   - Lock statistics monitoring
   - `ConcurrencyControlManager` singleton

2. **Rate Limiting** (`/src/lib/translation-service/utils/rate-limiter.ts`)
   - Sliding window rate limiter (60 requests/minute default)
   - Request queuing strategy with timeout
   - Provider-specific rate limiters (Claude, OpenAI)
   - `ProviderRateLimitManager` singleton

3. **Retry Logic** (`/src/lib/translation-service/utils/retry.ts`)
   - Exponential backoff with jitter
   - HTTP 429 detection and retry
   - Retryable error classification
   - Preset configurations (standard, conservative)

4. **Job Processor** (`/src/lib/job-queue/job-processor.ts`)
   - Sequential processing (one job per cycle)
   - Polling-based architecture (30s default)
   - Lock heartbeat integration
   - Error pause/resume logic

### Gap Analysis

**What's Missing:**
- An **application-level semaphore** that limits the total number of in-flight translation API calls across all processors/workers
- **Coordinated concurrency control** that ensures exactly 10 (configurable) translation requests are active at any time
- **Integration of semaphore with content-specific processors** (items, articles, links, tags)
- **Rate limit backoff coordination** that delays requeue when 429s are received

The existing rate limiter handles requests per provider per minute but doesn't limit concurrent in-flight requests globally. The job processor processes one job at a time per instance, but multiple instances could run concurrently.

---

## Technical Approach

### Architecture Design

The solution introduces a **TranslationSemaphore** class that acts as a global concurrency gate:

```
                    ┌─────────────────────────────────────────┐
                    │          TranslationSemaphore           │
                    │                                         │
                    │  ┌─────────────────────────────────┐   │
                    │  │   Available Slots: 10 (config)   │   │
                    │  └─────────────────────────────────┘   │
                    │                                         │
                    │  ┌─────────────────────────────────┐   │
                    │  │   Waiting Queue (FIFO)           │   │
                    │  │   [processor1, processor2, ...]  │   │
                    │  └─────────────────────────────────┘   │
                    │                                         │
                    │  ┌─────────────────────────────────┐   │
                    │  │   Metrics                        │   │
                    │  │   - activeCount                  │   │
                    │  │   - queueDepth                   │   │
                    │  │   - totalProcessed               │   │
                    │  └─────────────────────────────────┘   │
                    └─────────────────────────────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
         ▼                            ▼                            ▼
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│  Item Processor │        │Article Processor│        │ Link Processor  │
│                 │        │                 │        │                 │
│ await acquire() │        │ await acquire() │        │ await acquire() │
│ try {           │        │ try {           │        │ try {           │
│   translate()   │        │   translate()   │        │   translate()   │
│ } finally {     │        │ } finally {     │        │ } finally {     │
│   release()     │        │   release()     │        │   release()     │
│ }               │        │ }               │        │ }               │
└─────────────────┘        └─────────────────┘        └─────────────────┘
```

### Key Components

1. **TranslationSemaphore Class**
   - Configurable `maxConcurrent` (default: 10)
   - `acquire()` method returns Promise that resolves when slot available
   - `release()` method frees slot and processes waiting queue
   - FIFO queue for fairness
   - Optional timeout on acquire()
   - Metrics exposure for monitoring

2. **Rate Limit Backoff Integration**
   - Detect HTTP 429 responses from translation service
   - Track backoff state globally
   - Delay semaphore slot release during backoff periods
   - Progressive backoff (exponential) on multiple 429s

3. **Processor Integration**
   - All content processors wrap translation calls with acquire/release
   - Use try/finally to guarantee slot release
   - Handle acquire timeout gracefully

---

## Implementation Tasks

### Task 1: Create TranslationSemaphore Class (Priority: High)

**File:** `/src/lib/job-queue/concurrency.ts` (NEW)

Create the core semaphore implementation with:

```typescript
// Types
interface SemaphoreConfig {
  maxConcurrent: number;        // Default: 10
  acquireTimeoutMs: number;     // Default: 60000 (1 minute)
  enableMetrics: boolean;       // Default: true
}

interface SemaphoreMetrics {
  activeCount: number;
  queueDepth: number;
  totalAcquired: number;
  totalReleased: number;
  totalTimeouts: number;
  avgWaitTimeMs: number;
}

// Class
class TranslationSemaphore {
  acquire(timeoutMs?: number): Promise<void>
  release(): void
  tryAcquire(): boolean
  getMetrics(): SemaphoreMetrics
  isAvailable(): boolean
  updateConfig(config: Partial<SemaphoreConfig>): void
}

// Singleton
function getTranslationSemaphore(): TranslationSemaphore
function resetTranslationSemaphore(): void
```

**Acceptance Criteria:**
- [ ] Semaphore limits concurrent acquisitions to `maxConcurrent`
- [ ] Waiting requests are served in FIFO order
- [ ] `acquire()` times out after configurable duration
- [ ] `release()` in `finally` block pattern works correctly
- [ ] Metrics accurately reflect semaphore state

### Task 2: Add Rate Limit Backoff State (Priority: High)

**File:** `/src/lib/job-queue/concurrency.ts` (EXTEND)

Add rate limit detection and backoff coordination:

```typescript
interface BackoffState {
  isInBackoff: boolean;
  backoffUntil: Date | null;
  consecutiveRateLimits: number;
  lastRateLimitAt: Date | null;
}

class TranslationSemaphore {
  // ... existing methods

  notifyRateLimit(): void        // Called when 429 received
  getBackoffState(): BackoffState
  isBackoffActive(): boolean
}
```

**Logic:**
- On 429: Set backoff period using exponential formula
- During backoff: `acquire()` waits for backoff to expire before granting slot
- After successful request: Reset consecutive count
- Backoff formula: `baseDelay * (2 ^ consecutiveCount)`, capped at 60 seconds

### Task 3: Integrate with Content Processors (Priority: High)

**Files to Modify:**
- `/src/lib/content-translation/processors/item-processor.ts` (when created per REQ-E03-014)
- `/src/lib/content-translation/processors/article-processor.ts` (when created per REQ-E03-015)
- `/src/lib/content-translation/processors/link-processor.ts` (when created per REQ-E03-016)
- `/src/lib/content-translation/processors/tag-processor.ts` (when created per REQ-E03-017)

**Pattern:**
```typescript
import { getTranslationSemaphore } from '@/lib/job-queue/concurrency';

async function processItemTranslation(job: TranslationJob): Promise<void> {
  const semaphore = getTranslationSemaphore();

  try {
    // Wait for slot (respects concurrency limit and rate limit backoff)
    await semaphore.acquire();

    // Perform translation
    const result = await translateText(...);

    // Store result
    await saveTranslation(...);

  } catch (error) {
    // Check for rate limit
    if (isRateLimitError(error)) {
      semaphore.notifyRateLimit();
    }
    throw error;
  } finally {
    // ALWAYS release slot
    semaphore.release();
  }
}
```

### Task 4: Add Environment Configuration (Priority: Medium)

**File:** Environment variables and configuration

```bash
# Maximum concurrent translation API calls
TRANSLATION_MAX_CONCURRENT=10

# Acquire timeout in milliseconds
TRANSLATION_ACQUIRE_TIMEOUT_MS=60000

# Base backoff delay for rate limits in milliseconds
TRANSLATION_RATE_LIMIT_BASE_DELAY_MS=5000

# Maximum backoff delay in milliseconds
TRANSLATION_RATE_LIMIT_MAX_DELAY_MS=60000
```

### Task 5: Export from Module Index (Priority: Medium)

**File:** `/src/lib/job-queue/index.ts` (MODIFY)

Add exports:
```typescript
// Concurrency control exports (REQ-E03-019)
export {
  TranslationSemaphore,
  getTranslationSemaphore,
  resetTranslationSemaphore,
  createTranslationSemaphore,
  DEFAULT_SEMAPHORE_CONFIG,
} from './concurrency';

export type {
  SemaphoreConfig,
  SemaphoreMetrics,
  BackoffState,
} from './concurrency';
```

### Task 6: Write Unit Tests (Priority: Medium)

**File:** `/src/lib/job-queue/__tests__/concurrency.test.ts` (NEW)

Test cases:
- [ ] Semaphore limits concurrent acquisitions to max
- [ ] Queue processes in FIFO order
- [ ] Acquire timeout works correctly
- [ ] Release in finally pattern works
- [ ] Rate limit backoff delays acquisitions
- [ ] Backoff resets after successful request
- [ ] Metrics are accurate
- [ ] Configuration updates take effect

### Task 7: Write Integration Tests (Priority: Medium)

**File:** `/src/lib/job-queue/__tests__/concurrency.integration.test.ts` (NEW)

Test cases:
- [ ] Multiple processors share semaphore correctly
- [ ] Rate limit handling across processors
- [ ] Timeout handling doesn't deadlock
- [ ] Graceful shutdown releases waiting

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/job-queue/concurrency.ts` | TranslationSemaphore class and helpers |
| `/src/lib/job-queue/__tests__/concurrency.test.ts` | Unit tests |
| `/src/lib/job-queue/__tests__/concurrency.integration.test.ts` | Integration tests |

### Files to Modify

| File Path | Functions/Sections to Modify | Description |
|-----------|------------------------------|-------------|
| `/src/lib/job-queue/index.ts` | Module exports | Add new concurrency exports |
| `/src/lib/content-translation/processors/item-processor.ts` | `processItemTranslation()` | Add semaphore acquire/release |
| `/src/lib/content-translation/processors/article-processor.ts` | `processArticleTranslation()` | Add semaphore acquire/release |
| `/src/lib/content-translation/processors/link-processor.ts` | `processLinkTranslation()` | Add semaphore acquire/release |
| `/src/lib/content-translation/processors/tag-processor.ts` | `processTagTranslation()` | Add semaphore acquire/release |

### Existing Patterns to Follow

| Pattern | Location | Usage |
|---------|----------|-------|
| Singleton with factory | `/src/lib/job-queue/concurrency-control.ts:689-715` | `getConcurrencyManager()` pattern |
| Configuration from env | `/src/lib/job-queue/job-processor.ts:551-558` | `DEFAULT_CONFIG` with `process.env` |
| Rate limiter acquire | `/src/lib/translation-service/utils/rate-limiter.ts:87-131` | `acquire()` with queuing |
| Backoff calculation | `/src/lib/translation-service/utils/retry.ts:105-111` | `calculateExponentialDelay()` |
| Finally cleanup pattern | `/src/lib/job-queue/job-processor.ts:453-541` | Heartbeat with `try/finally` |

---

## Dependencies

### Required Before This Task

- **REQ-E03-013:** Enhance Job Processor for Content-Specific Handling (provides processor routing)
- **REQ-E03-014:** Implement Item Translation Processor (processor to integrate with)
- **REQ-E03-015:** Implement Article Translation Processor (processor to integrate with)
- **REQ-E03-016:** Implement Link Translation Processor (processor to integrate with)
- **REQ-E03-017:** Implement Tag Translation Processor (processor to integrate with)

### Epic 1 Dependencies (Must Be Complete)

- Translation service at `/src/lib/translation-service/` (provides `translateText()`)
- Rate limiter at `/src/lib/translation-service/utils/rate-limiter.ts` (provides rate limit status)
- Retry utilities at `/src/lib/translation-service/utils/retry.ts` (provides backoff calculations)

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation Task |
|--------------------|---------------------|
| Concurrency controller module exists with configurable max (default 10) | Task 1 |
| Controller provides `acquire()` method returning promise | Task 1 |
| Controller provides `release()` method | Task 1 |
| Controller tracks active count | Task 1 |
| Controller queues waiting requests in FIFO order | Task 1 |
| Acquire accepts optional timeout parameter | Task 1 |
| All four processors call `acquire()` before translation | Task 3 |
| All four processors call `release()` in finally blocks | Task 3 |
| Processors handle slot acquisition timeout | Task 3 |
| Rate limit detection for HTTP 429 | Task 2 |
| Rate-limited jobs marked with exponential backoff | Task 2 |
| Controller respects rate limit backoff periods | Task 2 |
| Controller exposes metrics | Task 1 |
| Configuration via environment variable | Task 4 |
| TypeScript types properly defined | Tasks 1, 2 |
| Unit tests verify behavior | Task 6 |
| Integration tests verify rate limit handling | Task 7 |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Deadlock if release not called | Low | High | Enforce try/finally pattern; timeout on acquire |
| Memory leak from queue buildup | Low | Medium | Limit queue size; reject when full |
| Race condition in acquire/release | Medium | Medium | Use atomic operations; comprehensive tests |
| Backoff too aggressive | Medium | Low | Make configurable; reasonable defaults |
| Integration breaks existing flow | Low | High | Thorough integration testing; feature flag |

---

## Notes

1. **Relationship to Existing Rate Limiter:** The semaphore is complementary to the existing rate limiter. The rate limiter controls requests per minute per provider, while the semaphore controls concurrent in-flight requests. Both are needed for proper resource management.

2. **Single-Instance vs Multi-Instance:** The current implementation assumes a single Node.js process. For multi-instance deployments (multiple Railway containers), consider a distributed semaphore using Redis in a future enhancement.

3. **Timeout Default:** The 60-second acquire timeout is chosen to be longer than typical translation requests (5-30 seconds) but short enough to fail fast during issues.

4. **Backoff Formula:** Uses the same exponential backoff pattern as existing retry logic for consistency. Base delay of 5 seconds, doubling up to 60 seconds maximum.

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- Request: `/docs/gen_requests_epic3.md` (REQ-E03-019)
- Existing Concurrency Control: `/src/lib/job-queue/concurrency-control.ts`
- Existing Rate Limiter: `/src/lib/translation-service/utils/rate-limiter.ts`
- Existing Retry Logic: `/src/lib/translation-service/utils/retry.ts`
- Job Processor: `/src/lib/job-queue/job-processor.ts`
