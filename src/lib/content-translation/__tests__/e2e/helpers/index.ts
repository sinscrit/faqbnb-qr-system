/**
 * E2E Test Helper Barrel Exports
 *
 * Provides unified access to all E2E testing utilities for content translation.
 *
 * @module content-translation/__tests__/e2e/helpers
 * @lastModified 2026-01-21
 */

// Test setup and teardown utilities
export {
  setupE2ETestContext,
  teardownE2ETestContext,
  advanceTime,
  generateTestId,
  type E2ETestContext,
  type TestItem,
  type TestArticle,
  type TestLink,
  type TestProperty,
} from './e2e-test-utils';

// Polling and wait utilities
export {
  waitForJobsToComplete,
  waitForTranslationStatus,
  waitForCondition,
  type PollingOptions,
  type TranslationStatusSummary,
} from './polling-utils';

// Mock API client for simulating API calls
export {
  createMockApiClient,
  type MockApiClient,
  type CreateItemRequest,
  type CreateItemResponse,
  type CreateArticleRequest,
  type CreateArticleResponse,
  type CreateLinkRequest,
  type CreateLinkResponse,
  type UpdateItemRequest,
  type TranslationStatusResponse,
  type RetryTranslationRequest,
  type RetryTranslationResponse,
  type ManualTranslationRequest,
  type ManualTranslationResponse,
  type BatchStatusRequest,
  type BatchStatusResponse,
} from './mock-api-client';

// Test data factory functions
export {
  createTestItem,
  createTestArticle,
  createTestLink,
  createTestTag,
  createTestProperty,
  createTestTranslationJob,
  createTestTranslationJobBatch,
  MULTILINGUAL_TEST_DATA,
} from './test-data-factory';

// Re-export job-queue helpers for convenience
export {
  resetMockDatabase,
  seedMockDatabase,
  getTableRecords,
  addMockRecord,
  updateMockRecord,
  findMockRecord,
  createMockSupabaseServer,
} from '@/lib/job-queue/__tests__/helpers/mockSupabase';

export {
  createMockTranslationJob as createMockTranslationJobFromFactory,
  createMockArticleContent,
  createMockItemContent,
} from '@/lib/job-queue/__tests__/helpers/mockFactories';

export {
  TABLE_NAMES,
  TEST_DEFAULTS,
  MOCK_TRANSLATIONS,
} from '@/lib/job-queue/__tests__/helpers/constants';
