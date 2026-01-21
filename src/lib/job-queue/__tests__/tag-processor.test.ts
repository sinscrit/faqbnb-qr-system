/**
 * Unit tests for processTagTranslationJob
 * REQ-E03-017: Implement Tag Translation Processor
 *
 * Tests the dedicated tag translation processor that handles:
 * - Tag content fetching from tag_translations table
 * - Translation via translation service
 * - Storage with is_system_tag = false
 * - Job status management (complete/fail)
 * - Heartbeat for lock refresh
 *
 * @module job-queue/__tests__/tag-processor
 * @created 2026-01-21
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMockTranslationJob } from './helpers/mockFactories';
import type { TranslationJob } from '../translation-jobs.types';

// =============================================================================
// Mock Configuration (must be at top level for vi.mock hoisting)
// =============================================================================

// Track mock function calls for assertions
const mockTracker = {
  markJobCompleted: [] as string[],
  markJobFailed: [] as { jobId: string; message: string }[],
  saveTranslationData: [] as unknown[],
  heartbeatStarted: false,
  heartbeatStopped: false,
};

// Configurable mock responses - must be object so reference is stable
const mockResponses = {
  fetchEntityContent: null as {
    entityType: string;
    entityId: string;
    sourceLanguage: string;
    fields: Record<string, string | null>;
  } | null,
  translateText: {
    translatedText: 'Cafetière',
    sourceLanguage: 'en',
    targetLanguage: 'fr',
  },
  translateTextError: null as Error | null,
  saveTranslationSuccess: true,
};

// Mock the concurrency control module
vi.mock('../concurrency-control', () => ({
  createLockHeartbeat: () => {
    mockTracker.heartbeatStarted = true;
    return () => {
      mockTracker.heartbeatStopped = true;
    };
  },
  DEFAULT_HEARTBEAT_INTERVAL_MS: 60000,
}));

// Mock translation jobs module
vi.mock('../translation-jobs', () => ({
  markJobCompleted: (jobId: string) => {
    mockTracker.markJobCompleted.push(jobId);
    return Promise.resolve();
  },
  markJobFailed: (jobId: string, message: string) => {
    mockTracker.markJobFailed.push({ jobId, message });
    return Promise.resolve();
  },
  fetchAndLockNextJob: () => Promise.resolve({ data: null, error: null }),
}));

// Mock translation service
vi.mock('@/lib/translation-service', () => ({
  translateText: async () => {
    if (mockResponses.translateTextError) {
      throw mockResponses.translateTextError;
    }
    return mockResponses.translateText;
  },
}));

// Mock Supabase
vi.mock('@/lib/supabase', () => {
  // Create chainable mock for Supabase
  function createChainMock() {
    const mock: Record<string, (...args: unknown[]) => unknown> = {};

    ['select', 'insert', 'update', 'delete', 'eq', 'in', 'is', 'not', 'lt', 'order', 'limit'].forEach(
      (name) => {
        mock[name] = () => mock;
      }
    );

    mock.upsert = async (data: unknown) => {
      mockTracker.saveTranslationData.push(data);
      if (!mockResponses.saveTranslationSuccess) {
        return { error: { message: 'Database error' } };
      }
      return { error: null };
    };

    mock.single = async () => {
      if (mockResponses.fetchEntityContent) {
        return {
          data: {
            tag_key: mockResponses.fetchEntityContent.entityId,
            translated_value: mockResponses.fetchEntityContent.fields.translated_value,
          },
          error: null,
        };
      }
      return { data: null, error: { message: 'Not found' } };
    };

    return mock;
  }

  return {
    supabaseAdmin: {
      from: () => createChainMock(),
    },
  };
});

// =============================================================================
// Test Suite
// =============================================================================

// Import after mocks are set up
import { processTagTranslationJob } from '../job-processor';
import type { JobProcessorConfig } from '../job-processor';

describe('processTagTranslationJob (REQ-E03-017)', () => {
  const mockConfig: JobProcessorConfig = {
    pollingIntervalMs: 30000,
    maxConsecutiveErrors: 5,
    errorPauseDurationMs: 300000,
    workerId: 'test-worker-123',
    lockTimeoutMinutes: 5,
    enableLogging: false,
  };

  const createTagJob = (overrides?: Partial<TranslationJob>): TranslationJob =>
    createMockTranslationJob({
      entityType: 'tag',
      entityId: 'coffee-maker',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
      status: 'processing',
      ...overrides,
    });

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset tracker state
    mockTracker.markJobCompleted = [];
    mockTracker.markJobFailed = [];
    mockTracker.saveTranslationData = [];
    mockTracker.heartbeatStarted = false;
    mockTracker.heartbeatStopped = false;

    // Default: successful flow
    mockResponses.fetchEntityContent = {
      entityType: 'tag',
      entityId: 'coffee-maker',
      sourceLanguage: 'en',
      fields: {
        translated_value: 'Coffee Maker',
      },
    };
    mockResponses.translateText = {
      translatedText: 'Cafetière',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
    };
    mockResponses.translateTextError = null;
    mockResponses.saveTranslationSuccess = true;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Validation Tests
  // ---------------------------------------------------------------------------

  describe('validation', () => {
    it('should reject non-tag entity types', async () => {
      const invalidJob = createMockTranslationJob({
        entityType: 'item',
        entityId: 'test-item',
      });

      const result = await processTagTranslationJob(invalidJob, mockConfig);

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('Invalid entity type');
      expect(result.errorMessage).toContain("expected 'tag'");
      expect(result.errorMessage).toContain("got 'item'");
    });

    it('should return early without starting heartbeat for invalid entity type', async () => {
      const invalidJob = createMockTranslationJob({
        entityType: 'article',
      });

      await processTagTranslationJob(invalidJob, mockConfig);

      // Heartbeat should not be started for validation failures
      expect(mockTracker.heartbeatStarted).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Successful Translation Tests
  // ---------------------------------------------------------------------------

  describe('successful translation', () => {
    it('should translate tag and return success result', async () => {
      const job = createTagJob();

      const result = await processTagTranslationJob(job, mockConfig);

      expect(result.success).toBe(true);
      expect(result.jobId).toBe(job.id);
      expect(result.entityType).toBe('tag');
      expect(result.entityId).toBe('coffee-maker');
      expect(result.targetLanguage).toBe('fr');
      expect(result.translatedFields).toEqual({
        translated_value: 'Cafetière',
      });
      expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('should call markJobCompleted on success', async () => {
      const job = createTagJob();

      await processTagTranslationJob(job, mockConfig);

      expect(mockTracker.markJobCompleted).toContain(job.id);
    });

    it('should start and stop heartbeat during processing', async () => {
      const job = createTagJob();

      await processTagTranslationJob(job, mockConfig);

      expect(mockTracker.heartbeatStarted).toBe(true);
      expect(mockTracker.heartbeatStopped).toBe(true);
    });

    it('should save translation with is_system_tag = false', async () => {
      const job = createTagJob();

      await processTagTranslationJob(job, mockConfig);

      // Check that saveTranslation was called with correct structure
      expect(mockTracker.saveTranslationData.length).toBeGreaterThan(0);
      const savedData = mockTracker.saveTranslationData[0] as Record<string, unknown>;
      expect(savedData.is_system_tag).toBe(false);
      expect(savedData.tag_key).toBe('coffee-maker');
      expect(savedData.language).toBe('fr');
      expect(savedData.translated_value).toBe('Cafetière');
    });
  });

  // ---------------------------------------------------------------------------
  // Error Handling Tests
  // ---------------------------------------------------------------------------

  describe('error handling', () => {
    it('should handle missing tag gracefully', async () => {
      mockResponses.fetchEntityContent = null;
      const job = createTagJob();

      const result = await processTagTranslationJob(job, mockConfig);

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('Tag not found');
      expect(mockTracker.markJobFailed.length).toBe(1);
      expect(mockTracker.markJobFailed[0].message).toContain('Tag not found');
    });

    it('should handle missing source translation', async () => {
      mockResponses.fetchEntityContent = {
        entityType: 'tag',
        entityId: 'coffee-maker',
        sourceLanguage: 'en',
        fields: {
          translated_value: null,
        },
      };
      const job = createTagJob();

      const result = await processTagTranslationJob(job, mockConfig);

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('no source translation');
      expect(mockTracker.markJobFailed.length).toBe(1);
    });

    it('should handle translation service errors', async () => {
      mockResponses.translateTextError = new Error('rate limit exceeded');
      const job = createTagJob();

      const result = await processTagTranslationJob(job, mockConfig);

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('Translation service error');
      expect(result.errorMessage).toContain('rate limit exceeded');
      expect(mockTracker.markJobFailed.length).toBe(1);
    });

    it('should handle database save errors', async () => {
      mockResponses.saveTranslationSuccess = false;
      const job = createTagJob();

      const result = await processTagTranslationJob(job, mockConfig);

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('Failed to save');
      expect(mockTracker.markJobFailed.length).toBe(1);
    });

    it('should always stop heartbeat even on errors', async () => {
      mockResponses.translateTextError = new Error('network error');
      const job = createTagJob();

      await processTagTranslationJob(job, mockConfig);

      expect(mockTracker.heartbeatStopped).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Logging Tests
  // ---------------------------------------------------------------------------

  describe('logging', () => {
    it('should log when enableLogging is true', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const job = createTagJob();
      const loggingConfig = { ...mockConfig, enableLogging: true };

      await processTagTranslationJob(job, loggingConfig);

      expect(consoleSpy).toHaveBeenCalled();
      const logCalls = consoleSpy.mock.calls.flat().join(' ');
      expect(logCalls).toContain('TagProcessor');

      consoleSpy.mockRestore();
    });

    it('should not log when enableLogging is false', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const job = createTagJob();

      await processTagTranslationJob(job, mockConfig);

      // With enableLogging=false, no [TagProcessor] logs should appear
      const tagProcessorLogs = consoleSpy.mock.calls.filter((call) =>
        call.some((arg) => typeof arg === 'string' && arg.includes('[TagProcessor]'))
      );
      expect(tagProcessorLogs.length).toBe(0);

      consoleSpy.mockRestore();
    });
  });

  // ---------------------------------------------------------------------------
  // Processing Time Tests
  // ---------------------------------------------------------------------------

  describe('processing time', () => {
    it('should include accurate processing time in result', async () => {
      const job = createTagJob();

      const result = await processTagTranslationJob(job, mockConfig);

      expect(typeof result.processingTimeMs).toBe('number');
      expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
      // Should be reasonable (less than 5 seconds for unit test)
      expect(result.processingTimeMs).toBeLessThan(5000);
    });
  });
});
