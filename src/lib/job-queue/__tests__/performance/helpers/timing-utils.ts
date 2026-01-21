/**
 * Timing Utilities for Performance Tests
 *
 * High-resolution measurements and controlled concurrent processing.
 *
 * @module job-queue/__tests__/performance/helpers/timing-utils
 * @lastModified 2026-01-21
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface ProcessorStats {
  totalProcessed: number;
  currentlyActive: number;
  peakActive: number;
  avgProcessingTimeMs: number;
  errors: number;
}

export interface Timer {
  start(): void;
  lap(label: string): number;
  stop(): number;
  getElapsedMs(): number;
  getLaps(): Record<string, number>;
  reset(): void;
}

export interface ThrottledProcessorOptions {
  maxConcurrent: number;
  delayBetweenMs?: number;
}

// ============================================================================
// Timer Implementation
// ============================================================================

export function createTimer(): Timer {
  let startTime: number | null = null;
  let endTime: number | null = null;
  const laps: Record<string, number> = {};

  return {
    start(): void {
      startTime = performance.now();
      endTime = null;
    },

    lap(label: string): number {
      if (startTime === null) {
        throw new Error('Timer not started');
      }
      const elapsed = performance.now() - startTime;
      laps[label] = elapsed;
      return elapsed;
    },

    stop(): number {
      if (startTime === null) {
        throw new Error('Timer not started');
      }
      endTime = performance.now();
      return endTime - startTime;
    },

    getElapsedMs(): number {
      if (startTime === null) {
        return 0;
      }
      const end = endTime ?? performance.now();
      return end - startTime;
    },

    getLaps(): Record<string, number> {
      return { ...laps };
    },

    reset(): void {
      startTime = null;
      endTime = null;
      Object.keys(laps).forEach(key => delete laps[key]);
    },
  };
}

// ============================================================================
// Async Measurement
// ============================================================================

export async function measureAsync<T>(
  fn: () => Promise<T>,
  label: string
): Promise<{ result: T; durationMs: number; label: string }> {
  const start = performance.now();
  const result = await fn();
  const durationMs = performance.now() - start;
  return { result, durationMs, label };
}

// ============================================================================
// Throttled Processor
// ============================================================================

export function createThrottledProcessor(
  processFn: () => Promise<void>,
  options: ThrottledProcessorOptions
): {
  process: () => Promise<void>;
  processMany: (count: number) => Promise<void>;
  getStats: () => ProcessorStats;
  reset: () => void;
} {
  let activeCount = 0;
  let peakActive = 0;
  let totalProcessed = 0;
  let totalProcessingTime = 0;
  let errors = 0;
  const queue: Array<() => void> = [];

  const tryProcess = async (): Promise<void> => {
    if (activeCount >= options.maxConcurrent) {
      // Queue the request
      return new Promise<void>(resolve => {
        queue.push(resolve);
      }).then(() => tryProcess());
    }

    activeCount++;
    if (activeCount > peakActive) {
      peakActive = activeCount;
    }

    const start = performance.now();
    try {
      await processFn();
      totalProcessed++;
      totalProcessingTime += performance.now() - start;
    } catch (error) {
      errors++;
      throw error;
    } finally {
      activeCount--;

      // Apply delay if configured
      if (options.delayBetweenMs && options.delayBetweenMs > 0) {
        await new Promise(resolve => setTimeout(resolve, options.delayBetweenMs));
      }

      // Wake up next queued processor
      const next = queue.shift();
      if (next) {
        next();
      }
    }
  };

  return {
    process: tryProcess,

    async processMany(count: number): Promise<void> {
      const promises = Array.from({ length: count }, () => tryProcess());
      await Promise.all(promises);
    },

    getStats(): ProcessorStats {
      return {
        totalProcessed,
        currentlyActive: activeCount,
        peakActive,
        avgProcessingTimeMs: totalProcessed > 0 ? totalProcessingTime / totalProcessed : 0,
        errors,
      };
    },

    reset(): void {
      activeCount = 0;
      peakActive = 0;
      totalProcessed = 0;
      totalProcessingTime = 0;
      errors = 0;
      queue.length = 0;
    },
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
