/**
 * Translation Status E2E Tests
 *
 * Tests the translation status endpoint functionality.
 *
 * @see REQ-E03-033 AC-6
 * @lastModified 2026-01-21
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  setupE2ETestContext,
  teardownE2ETestContext,
  type E2ETestContext,
} from './helpers/e2e-test-utils';
import { createMockApiClient, type MockApiClient } from './helpers/mock-api-client';
import {
  getTableRecords,
  seedMockDatabase,
} from '@/lib/job-queue/__tests__/helpers/mockSupabase';
import { TABLE_NAMES } from '@/lib/job-queue/__tests__/helpers/constants';
import { createTestTranslationJobBatch } from './helpers/test-data-factory';
import type { TranslationJob } from '@/lib/job-queue/translation-jobs.types';

describe('Translation Status E2E', () => {
  let ctx: E2ETestContext;
  let apiClient: MockApiClient;

  beforeEach(async () => {
    ctx = await setupE2ETestContext();
    apiClient = createMockApiClient();
  });

  afterEach(async () => {
    await teardownE2ETestContext(ctx);
  });

  describe('Status Reporting', () => {
    it('returns "pending" status when jobs are queued', async () => {
      // Arrange
      const itemId = 'status-pending-item';
      const jobs = createTestTranslationJobBatch('item', itemId, 'en');
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);

      // Add item record
      seedMockDatabase(TABLE_NAMES.ITEMS, [{
        id: itemId,
        name: 'Test Item',
        source_language: 'en',
      }]);

      // Act
      const status = await apiClient.getTranslationStatus('item', itemId);

      // Assert
      expect(status.success).toBe(true);
      expect(status.data.overallStatus).toBe('pending');
      expect(status.data.pendingLanguages).toHaveLength(5);
      expect(status.data.completedLanguages).toHaveLength(0);
    });

    it('returns "complete" when all jobs finished successfully', async () => {
      // Arrange
      const itemId = 'status-complete-item';
      const jobs = createTestTranslationJobBatch('item', itemId, 'en');

      // Mark all as completed
      for (const job of jobs) {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
      }

      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);
      seedMockDatabase(TABLE_NAMES.ITEMS, [{
        id: itemId,
        name: 'Test Item',
        source_language: 'en',
      }]);

      // Act
      const status = await apiClient.getTranslationStatus('item', itemId);

      // Assert
      expect(status.success).toBe(true);
      expect(status.data.overallStatus).toBe('complete');
      expect(status.data.completedLanguages).toHaveLength(5);
      expect(status.data.pendingLanguages).toHaveLength(0);
    });

    it('returns "partial" when some jobs completed and some failed', async () => {
      // Arrange
      const itemId = 'status-partial-item';
      const jobs = createTestTranslationJobBatch('item', itemId, 'en');

      // Complete some, fail others
      jobs[0].status = 'completed';
      jobs[0].completedAt = new Date().toISOString();
      jobs[1].status = 'completed';
      jobs[1].completedAt = new Date().toISOString();
      jobs[2].status = 'failed';
      jobs[2].errorMessage = 'API error';
      jobs[3].status = 'completed';
      jobs[3].completedAt = new Date().toISOString();
      jobs[4].status = 'failed';
      jobs[4].errorMessage = 'Rate limit';

      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);
      seedMockDatabase(TABLE_NAMES.ITEMS, [{
        id: itemId,
        name: 'Test Item',
        source_language: 'en',
      }]);

      // Act
      const status = await apiClient.getTranslationStatus('item', itemId);

      // Assert
      expect(status.success).toBe(true);
      expect(status.data.overallStatus).toBe('partial');
      expect(status.data.completedLanguages).toHaveLength(3);
      expect(status.data.failedLanguages).toHaveLength(2);
    });

    it('returns "failed" when all jobs failed', async () => {
      // Arrange
      const itemId = 'status-failed-item';
      const jobs = createTestTranslationJobBatch('item', itemId, 'en');

      // Fail all jobs
      for (const job of jobs) {
        job.status = 'failed';
        job.errorMessage = 'Translation API unavailable';
      }

      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);
      seedMockDatabase(TABLE_NAMES.ITEMS, [{
        id: itemId,
        name: 'Test Item',
        source_language: 'en',
      }]);

      // Act
      const status = await apiClient.getTranslationStatus('item', itemId);

      // Assert
      expect(status.success).toBe(true);
      expect(status.data.overallStatus).toBe('failed');
      expect(status.data.failedLanguages).toHaveLength(5);
      expect(status.data.completedLanguages).toHaveLength(0);
    });
  });

  describe('Status Details', () => {
    it('includes per-language status with timestamps', async () => {
      // Arrange
      const itemId = 'status-details-item';
      const jobs = createTestTranslationJobBatch('item', itemId, 'en');

      const completedAt = new Date().toISOString();
      jobs[0].status = 'completed';
      jobs[0].completedAt = completedAt;

      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);
      seedMockDatabase(TABLE_NAMES.ITEMS, [{
        id: itemId,
        name: 'Test Item',
        source_language: 'en',
      }]);

      // Act
      const status = await apiClient.getTranslationStatus('item', itemId);

      // Assert
      expect(status.data.translations).toBeDefined();
      expect(Object.keys(status.data.translations)).toHaveLength(5);

      // Check completed language has timestamp
      const completedLang = status.data.translations[jobs[0].targetLanguage];
      expect(completedLang.status).toBe('completed');
      expect(completedLang.translatedAt).toBeDefined();
    });

    it('includes error message for failed translations', async () => {
      // Arrange
      const itemId = 'status-error-item';
      const jobs = createTestTranslationJobBatch('item', itemId, 'en');

      const errorMessage = 'API rate limit exceeded';
      jobs[0].status = 'failed';
      jobs[0].errorMessage = errorMessage;

      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);
      seedMockDatabase(TABLE_NAMES.ITEMS, [{
        id: itemId,
        name: 'Test Item',
        source_language: 'en',
      }]);

      // Act
      const status = await apiClient.getTranslationStatus('item', itemId);

      // Assert
      const failedLang = status.data.translations[jobs[0].targetLanguage];
      expect(failedLang.status).toBe('failed');
      expect(failedLang.error).toBe(errorMessage);
    });

    it('includes source language in status response', async () => {
      // Arrange
      const itemId = 'status-source-lang-item';
      const jobs = createTestTranslationJobBatch('item', itemId, 'fr');

      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);
      seedMockDatabase(TABLE_NAMES.ITEMS, [{
        id: itemId,
        name: 'Test Item',
        source_language: 'fr',
      }]);

      // Act
      const status = await apiClient.getTranslationStatus('item', itemId);

      // Assert
      expect(status.data.sourceLanguage).toBe('fr');
    });
  });

  describe('Entity Type Handling', () => {
    it('returns status for article entities', async () => {
      // Arrange
      const articleId = 'status-article-001';
      const jobs = createTestTranslationJobBatch('article', articleId, 'en');

      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);
      seedMockDatabase(TABLE_NAMES.ITEM_ARTICLES, [{
        id: articleId,
        title: 'Test Article',
        source_language: 'en',
      }]);

      // Act
      const status = await apiClient.getTranslationStatus('article', articleId);

      // Assert
      expect(status.success).toBe(true);
      expect(status.data.entityType).toBe('article');
      expect(status.data.pendingLanguages).toHaveLength(5);
    });

    it('returns status for link entities', async () => {
      // Arrange
      const linkId = 'status-link-001';
      const jobs = createTestTranslationJobBatch('link', linkId, 'en');

      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);
      seedMockDatabase(TABLE_NAMES.ITEM_LINKS, [{
        id: linkId,
        title: 'Test Link',
        url: 'https://example.com',
        source_language: 'en',
      }]);

      // Act
      const status = await apiClient.getTranslationStatus('link', linkId);

      // Assert
      expect(status.success).toBe(true);
      expect(status.data.entityType).toBe('link');
      expect(status.data.pendingLanguages).toHaveLength(5);
    });
  });
});
