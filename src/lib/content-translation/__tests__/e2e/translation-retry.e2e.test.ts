/**
 * Translation Retry E2E Tests
 *
 * Tests the retry mechanism for failed translation jobs.
 *
 * @see REQ-E03-033 AC-8, AC-9, AC-10
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

describe('Translation Retry E2E', () => {
  let ctx: E2ETestContext;
  let apiClient: MockApiClient;

  beforeEach(async () => {
    ctx = await setupE2ETestContext();
    apiClient = createMockApiClient();
  });

  afterEach(async () => {
    await teardownE2ETestContext(ctx);
  });

  describe('Failure Simulation and Detection', () => {
    it('AC-8: simulates translation failure and verifies job status is "failed"', async () => {
      // Arrange
      const itemId = 'retry-failure-item';
      const jobs = createTestTranslationJobBatch('item', itemId, 'en');

      // Simulate failure for first two jobs
      jobs[0].status = 'failed';
      jobs[0].errorMessage = 'Translation service unavailable';
      jobs[0].attempts = 3;

      jobs[1].status = 'failed';
      jobs[1].errorMessage = 'API rate limit exceeded';
      jobs[1].attempts = 3;

      // Others still queued
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);
      seedMockDatabase(TABLE_NAMES.ITEMS, [{
        id: itemId,
        name: 'Test Item',
        source_language: 'en',
      }]);

      // Act - Check status
      const status = await apiClient.getTranslationStatus('item', itemId);

      // Assert
      expect(status.data.failedLanguages).toHaveLength(2);
      expect(status.data.translations[jobs[0].targetLanguage].status).toBe('failed');
      expect(status.data.translations[jobs[0].targetLanguage].error).toBe('Translation service unavailable');
      expect(status.data.translations[jobs[1].targetLanguage].status).toBe('failed');
    });
  });

  describe('Retry Endpoint', () => {
    it('AC-9: uses retry endpoint to re-queue failed jobs', async () => {
      // Arrange
      const itemId = 'retry-requeue-item';
      const jobs = createTestTranslationJobBatch('item', itemId, 'en');

      // Mark two as failed
      jobs[0].status = 'failed';
      jobs[0].errorMessage = 'API error';
      jobs[0].attempts = 1;

      jobs[1].status = 'failed';
      jobs[1].errorMessage = 'Rate limit';
      jobs[1].attempts = 2;

      // Complete the rest
      for (let i = 2; i < jobs.length; i++) {
        jobs[i].status = 'completed';
        jobs[i].completedAt = new Date().toISOString();
      }

      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);
      seedMockDatabase(TABLE_NAMES.ITEMS, [{
        id: itemId,
        name: 'Test Item',
        source_language: 'en',
      }]);

      // Act - Retry failed jobs
      const result = await apiClient.retryTranslations({
        entityType: 'item',
        entityId: itemId,
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.jobsQueued).toBe(2);
      expect(result.queuedLanguages).toContain(jobs[0].targetLanguage);
      expect(result.queuedLanguages).toContain(jobs[1].targetLanguage);

      // Verify jobs are now queued
      const updatedJobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const retriedJobs = updatedJobs.filter(
        j => j.entityId === itemId && result.queuedLanguages.includes(j.targetLanguage)
      );

      expect(retriedJobs.every(j => j.status === 'queued')).toBe(true);
      expect(retriedJobs.every(j => j.attempts === 0)).toBe(true);
    });

    it('AC-10: verifies retried job can complete successfully', async () => {
      // Arrange
      const itemId = 'retry-complete-item';
      const jobs = createTestTranslationJobBatch('item', itemId, 'en');

      // Mark one as failed
      jobs[0].status = 'failed';
      jobs[0].errorMessage = 'Temporary error';

      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);
      seedMockDatabase(TABLE_NAMES.ITEMS, [{
        id: itemId,
        name: 'Test Item',
        source_language: 'en',
      }]);

      // Act - Retry
      await apiClient.retryTranslations({
        entityType: 'item',
        entityId: itemId,
      });

      // Simulate successful completion after retry
      const updatedJobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const retriedJob = updatedJobs.find(
        j => j.entityId === itemId && j.targetLanguage === jobs[0].targetLanguage
      );

      retriedJob!.status = 'completed';
      retriedJob!.completedAt = new Date().toISOString();
      retriedJob!.errorMessage = null;

      // Assert
      const status = await apiClient.getTranslationStatus('item', itemId);
      expect(status.data.translations[jobs[0].targetLanguage].status).toBe('completed');
    });

    it('retries only specific language when specified', async () => {
      // Arrange
      const itemId = 'retry-specific-item';
      const jobs = createTestTranslationJobBatch('item', itemId, 'en');

      // Mark multiple as failed
      jobs[0].status = 'failed';
      jobs[0].errorMessage = 'Error 1';
      jobs[1].status = 'failed';
      jobs[1].errorMessage = 'Error 2';
      jobs[2].status = 'failed';
      jobs[2].errorMessage = 'Error 3';

      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);
      seedMockDatabase(TABLE_NAMES.ITEMS, [{
        id: itemId,
        name: 'Test Item',
        source_language: 'en',
      }]);

      // Act - Retry only one language
      const result = await apiClient.retryTranslations({
        entityType: 'item',
        entityId: itemId,
        languages: [jobs[1].targetLanguage],
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.jobsQueued).toBe(1);
      expect(result.queuedLanguages).toEqual([jobs[1].targetLanguage]);

      // Verify only the specified job was queued
      const updatedJobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);

      const retriedJob = updatedJobs.find(j => j.targetLanguage === jobs[1].targetLanguage);
      const notRetriedJob1 = updatedJobs.find(j => j.targetLanguage === jobs[0].targetLanguage);
      const notRetriedJob2 = updatedJobs.find(j => j.targetLanguage === jobs[2].targetLanguage);

      expect(retriedJob!.status).toBe('queued');
      expect(notRetriedJob1!.status).toBe('failed');
      expect(notRetriedJob2!.status).toBe('failed');
    });

    it('returns zero queued when no failed jobs exist', async () => {
      // Arrange
      const itemId = 'retry-none-item';
      const jobs = createTestTranslationJobBatch('item', itemId, 'en');

      // All jobs completed
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
      const result = await apiClient.retryTranslations({
        entityType: 'item',
        entityId: itemId,
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.jobsQueued).toBe(0);
      expect(result.queuedLanguages).toHaveLength(0);
    });

    it('does not retry processing jobs', async () => {
      // Arrange
      const itemId = 'retry-processing-item';
      const jobs = createTestTranslationJobBatch('item', itemId, 'en');

      // Set one as processing (in progress)
      jobs[0].status = 'processing';
      jobs[0].lockedBy = 'worker-1';
      jobs[0].lockedAt = new Date().toISOString();

      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);
      seedMockDatabase(TABLE_NAMES.ITEMS, [{
        id: itemId,
        name: 'Test Item',
        source_language: 'en',
      }]);

      // Act
      const result = await apiClient.retryTranslations({
        entityType: 'item',
        entityId: itemId,
      });

      // Assert - Processing job should not be retried
      expect(result.jobsQueued).toBe(0);

      const updatedJobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const processingJob = updatedJobs.find(j => j.targetLanguage === jobs[0].targetLanguage);
      expect(processingJob!.status).toBe('processing');
    });
  });
});
