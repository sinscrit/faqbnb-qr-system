/**
 * Mock Factory Functions for Job Queue Tests
 *
 * Provides factory functions for creating test data with consistent shapes.
 * Follow existing patterns from ItemCreationWorkflow tests.
 *
 * @module job-queue/__tests__/helpers/mockFactories
 * @lastModified 2026-01-18
 */

import type { TranslationJob, JobStatus, EntityType, SupportedLanguage } from '../../translation-jobs.types';

/**
 * Creates a mock translation job with default values.
 * Allows partial overrides for flexible test scenarios.
 */
export function createMockTranslationJob(
  overrides?: Partial<TranslationJob>
): TranslationJob {
  const baseId = `job-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  return {
    id: baseId,
    entityType: 'article',
    entityId: `entity-${Date.now()}`,
    sourceLanguage: 'en',
    targetLanguage: 'fr',
    status: 'queued',
    priority: 50,  // REQ-E03-018: Default to HIGH priority
    attempts: 0,
    errorMessage: null,
    createdAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
    lockedBy: null,
    lockedAt: null,
    ...overrides,
  };
}

/**
 * Creates a mock job processing result.
 */
export function createMockJobProcessingResult(
  overrides?: Partial<{
    jobId: string;
    success: boolean;
    entityType: EntityType;
    entityId: string;
    targetLanguage: SupportedLanguage;
    translatedFields: Record<string, string>;
    errorMessage: string;
    processingTimeMs: number;
  }>
) {
  return {
    jobId: `job-${Date.now()}`,
    success: true,
    entityType: 'article' as EntityType,
    entityId: `entity-${Date.now()}`,
    targetLanguage: 'fr' as SupportedLanguage,
    translatedFields: {
      title: 'Titre traduit',
      description: 'Description traduite',
    },
    processingTimeMs: 150,
    ...overrides,
  };
}

/**
 * Creates a mock processing run result for batch operations.
 */
export function createMockProcessingRunResult(
  overrides?: Partial<{
    startedAt: string;
    completedAt: string;
    jobsProcessed: number;
    jobsSucceeded: number;
    jobsFailed: number;
    results: ReturnType<typeof createMockJobProcessingResult>[];
  }>
) {
  return {
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    jobsProcessed: 1,
    jobsSucceeded: 1,
    jobsFailed: 0,
    results: [createMockJobProcessingResult()],
    ...overrides,
  };
}

/**
 * Creates a mock article content record for testing article translations.
 */
export function createMockArticleContent(
  overrides?: Partial<{
    id: string;
    title: string;
    description: string;
    source_language: string;
    created_at: string;
    item_id: string;
  }>
) {
  return {
    id: `article-${Date.now()}`,
    title: 'Test Article Title',
    description: 'Test article description for translation.',
    source_language: 'en',
    created_at: new Date().toISOString(),
    item_id: `item-${Date.now()}`,
    ...overrides,
  };
}

/**
 * Creates a mock item content record for testing item translations.
 */
export function createMockItemContent(
  overrides?: Partial<{
    id: string;
    name: string;
    description: string;
    source_language: string;
    created_at: string;
    property_id: string;
  }>
) {
  return {
    id: `item-${Date.now()}`,
    name: 'Test Item Name',
    description: 'Test item description for translation.',
    source_language: 'en',
    created_at: new Date().toISOString(),
    property_id: `property-${Date.now()}`,
    ...overrides,
  };
}

/**
 * Creates a batch of mock translation jobs for concurrent testing.
 */
export function createMockJobBatch(
  count: number,
  overrides?: Partial<TranslationJob>
): TranslationJob[] {
  return Array.from({ length: count }, (_, index) =>
    createMockTranslationJob({
      id: `batch-job-${index}-${Date.now()}`,
      entityId: `batch-entity-${index}`,
      ...overrides,
    })
  );
}

/**
 * Creates a mock lock statistics result.
 */
export function createMockLockStatistics(
  overrides?: Partial<{
    activeLocksCount: number;
    staleLocksCount: number;
    locksByWorker: Record<string, number>;
    avgLockDurationMs: number;
  }>
) {
  return {
    activeLocksCount: 0,
    staleLocksCount: 0,
    locksByWorker: {},
    avgLockDurationMs: 0,
    ...overrides,
  };
}

/**
 * Creates a mock cleanup result for stale lock tests.
 */
export function createMockCleanupResult(
  overrides?: Partial<{
    staleJobsFound: number;
    jobsReset: number;
    jobsMarkedFailed: number;
    affectedJobIds: string[];
    cleanedAt: string;
  }>
) {
  return {
    staleJobsFound: 0,
    jobsReset: 0,
    jobsMarkedFailed: 0,
    affectedJobIds: [],
    cleanedAt: new Date().toISOString(),
    ...overrides,
  };
}
