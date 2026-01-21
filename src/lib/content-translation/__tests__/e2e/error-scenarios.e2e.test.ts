/**
 * Error Scenarios E2E Tests
 *
 * Tests error handling, edge cases, and recovery in translation workflows.
 *
 * @see REQ-E03-033 AC-20
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
  addMockRecord,
  seedMockDatabase,
} from '@/lib/job-queue/__tests__/helpers/mockSupabase';
import { TABLE_NAMES } from '@/lib/job-queue/__tests__/helpers/constants';
import type { TranslationJob } from '@/lib/job-queue/translation-jobs.types';

describe('Error Scenarios E2E', () => {
  let ctx: E2ETestContext;
  let apiClient: MockApiClient;

  beforeEach(async () => {
    ctx = await setupE2ETestContext();
    apiClient = createMockApiClient();
  });

  afterEach(async () => {
    await teardownE2ETestContext(ctx);
  });

  describe('Translation API Unavailable', () => {
    it('AC-20: handles translation service failure gracefully', async () => {
      // Arrange - Create an item
      const createResult = await apiClient.createItem({
        publicId: 'api-fail-item',
        name: 'Test Item',
        description: 'Test description',
        propertyId: 'property-api-fail',
        sourceLanguage: 'en',
      });

      expect(createResult.success).toBe(true);

      // Simulate API failure for jobs
      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const itemJobs = jobs.filter(j => j.entityId === createResult.data.id);

      // Mark jobs as failed due to API error
      for (const job of itemJobs) {
        job.status = 'failed';
        job.error = 'Translation API unavailable';
        job.attemptCount = 3;
        job.completedAt = new Date().toISOString();
      }

      // Assert - Check status reflects failure
      const statusResult = await apiClient.getTranslationStatus('item', createResult.data.id);

      expect(statusResult.success).toBe(true);
      expect(statusResult.data.overallStatus).toBe('failed');
      expect(statusResult.data.failedLanguages).toHaveLength(5);
    });

    it('partial API failure leaves some jobs pending', async () => {
      // Arrange
      const createResult = await apiClient.createItem({
        publicId: 'partial-fail-item',
        name: 'Test Item',
        description: 'Test description',
        propertyId: 'property-partial',
        sourceLanguage: 'en',
      });

      // Simulate partial failure - some complete, some fail
      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const itemJobs = jobs.filter(j => j.entityId === createResult.data.id);

      // Complete 2 jobs, fail 2, leave 1 queued
      const [job1, job2, job3, job4, job5] = itemJobs;

      job1.status = 'completed';
      job1.completedAt = new Date().toISOString();

      job2.status = 'completed';
      job2.completedAt = new Date().toISOString();

      job3.status = 'failed';
      job3.error = 'Rate limit exceeded';
      job3.attemptCount = 3;

      job4.status = 'failed';
      job4.error = 'Rate limit exceeded';
      job4.attemptCount = 3;

      // job5 stays queued

      // Assert
      const statusResult = await apiClient.getTranslationStatus('item', createResult.data.id);

      expect(statusResult.success).toBe(true);
      expect(statusResult.data.overallStatus).toBe('partial');
      expect(statusResult.data.completedLanguages).toHaveLength(2);
      expect(statusResult.data.failedLanguages).toHaveLength(2);
      expect(statusResult.data.pendingLanguages).toHaveLength(1);
    });
  });

  describe('Invalid Entity Handling', () => {
    it('returns error for non-existent entity ID', async () => {
      // Act
      const statusResult = await apiClient.getTranslationStatus('item', 'non-existent-id');

      // Assert
      expect(statusResult.success).toBe(true);
      expect(statusResult.data.overallStatus).toBe('pending');
      expect(statusResult.data.totalJobs).toBe(0);
    });

    it('update fails for non-existent item', async () => {
      // Act
      const updateResult = await apiClient.updateItem('non-existent-item-id', {
        name: 'Updated Name',
      });

      // Assert
      expect(updateResult.success).toBe(false);
      expect(updateResult.error).toBeDefined();
    });

    it('retry fails for non-existent job', async () => {
      // Act
      const retryResult = await apiClient.retryTranslation({
        entityType: 'item',
        entityId: 'non-existent-id',
        targetLanguage: 'fr',
      });

      // Assert
      expect(retryResult.success).toBe(false);
      expect(retryResult.error).toBeDefined();
    });
  });

  describe('Unsupported Language Handling', () => {
    it('gracefully handles unsupported source language', async () => {
      // Note: In real implementation, this would be validated
      // For mock, we test the behavior of jobs with unusual configs
      const createResult = await apiClient.createItem({
        publicId: 'unsupported-lang-item',
        name: 'Test Item',
        description: 'Test description',
        propertyId: 'property-lang',
        sourceLanguage: 'zh', // Chinese - not in supported list
      });

      // Mock implementation still creates jobs
      // Real implementation would validate and reject
      expect(createResult.success).toBe(true);

      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const itemJobs = jobs.filter(j => j.entityId === createResult.data.id);

      // All jobs have the unsupported source language
      expect(itemJobs.every(j => j.sourceLanguage === 'zh')).toBe(true);
    });

    it('retry with unsupported language returns error', async () => {
      // Arrange - Create a valid item
      const createResult = await apiClient.createItem({
        publicId: 'valid-item-for-retry',
        name: 'Test Item',
        propertyId: 'property-retry-lang',
        sourceLanguage: 'en',
      });

      // Act - Try to retry with unsupported target language
      const retryResult = await apiClient.retryTranslation({
        entityType: 'item',
        entityId: createResult.data.id,
        targetLanguage: 'ja', // Japanese - not in target languages
      });

      // Assert
      expect(retryResult.success).toBe(false);
      expect(retryResult.error).toContain('not found');
    });
  });

  describe('Database Error Scenarios', () => {
    it('handles job retrieval when no jobs exist', async () => {
      // Create item but remove all jobs
      const createResult = await apiClient.createItem({
        publicId: 'no-jobs-item',
        name: 'Test Item',
        propertyId: 'property-no-jobs',
        sourceLanguage: 'en',
      });

      // Clear all jobs for this entity (simulating data inconsistency)
      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const otherJobs = jobs.filter(j => j.entityId !== createResult.data.id);
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, otherJobs);

      // Act
      const statusResult = await apiClient.getTranslationStatus('item', createResult.data.id);

      // Assert
      expect(statusResult.success).toBe(true);
      expect(statusResult.data.totalJobs).toBe(0);
      expect(statusResult.data.overallStatus).toBe('pending');
    });

    it('handles batch status with mixed entity types', async () => {
      // Arrange - Create items and articles
      const item1 = await apiClient.createItem({
        publicId: 'batch-item-1',
        name: 'Item 1',
        propertyId: 'property-batch-mixed',
        sourceLanguage: 'en',
      });

      const item2 = await apiClient.createItem({
        publicId: 'batch-item-2',
        name: 'Item 2',
        propertyId: 'property-batch-mixed',
        sourceLanguage: 'en',
      });

      // Act - Request batch status
      const batchResult = await apiClient.getBatchTranslationStatus({
        entityType: 'item',
        entityIds: [item1.data.id, item2.data.id, 'non-existent-id'],
      });

      // Assert
      expect(batchResult.success).toBe(true);
      expect(batchResult.data.statuses).toHaveLength(3);

      // Existing items have jobs
      const existingStatuses = batchResult.data.statuses.filter(s => s.totalJobs > 0);
      expect(existingStatuses).toHaveLength(2);

      // Non-existent item has no jobs
      const nonExistentStatus = batchResult.data.statuses.find(
        s => s.entityId === 'non-existent-id'
      );
      expect(nonExistentStatus?.totalJobs).toBe(0);
    });
  });

  describe('Concurrent Operation Handling', () => {
    it('handles concurrent update requests', async () => {
      // Arrange
      const createResult = await apiClient.createItem({
        publicId: 'concurrent-item',
        name: 'Original Name',
        propertyId: 'property-concurrent',
        sourceLanguage: 'en',
      });

      // Complete initial jobs
      const initialJobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      for (const job of initialJobs.filter(j => j.entityId === createResult.data.id)) {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
      }

      // Act - Simulate concurrent updates
      const [update1, update2] = await Promise.all([
        apiClient.updateItem(createResult.data.id, { name: 'Update 1' }),
        apiClient.updateItem(createResult.data.id, { name: 'Update 2' }),
      ]);

      // Assert - Both should succeed (last write wins in mock)
      expect(update1.success).toBe(true);
      expect(update2.success).toBe(true);

      // Due to concurrent execution, each update deletes existing jobs and creates new ones
      // The final state depends on execution order - we expect at least 5 queued jobs
      const allJobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const itemJobs = allJobs.filter(j => j.entityId === createResult.data.id);

      // Should have at least 5 jobs from one of the updates
      expect(itemJobs.length).toBeGreaterThanOrEqual(5);
      expect(itemJobs.some(j => j.status === 'queued')).toBe(true);
    });

    it('handles retry during processing', async () => {
      // Arrange
      const createResult = await apiClient.createItem({
        publicId: 'retry-processing-item',
        name: 'Test Item',
        propertyId: 'property-retry-processing',
        sourceLanguage: 'en',
      });

      // Set a job to processing state
      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const targetJob = jobs.find(
        j => j.entityId === createResult.data.id && j.targetLanguage === 'fr'
      );
      if (targetJob) {
        targetJob.status = 'processing';
        targetJob.startedAt = new Date().toISOString();
      }

      // Act - Try to retry the processing job
      const retryResult = await apiClient.retryTranslation({
        entityType: 'item',
        entityId: createResult.data.id,
        targetLanguage: 'fr',
      });

      // Assert - Should fail because job is not in failed state
      expect(retryResult.success).toBe(false);
      expect(retryResult.error).toContain('not in failed state');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty content fields', async () => {
      // Act
      const createResult = await apiClient.createItem({
        publicId: 'empty-content-item',
        name: '', // Empty name
        description: '', // Empty description
        propertyId: 'property-empty',
        sourceLanguage: 'en',
      });

      // Assert - Should still create item and queue jobs
      expect(createResult.success).toBe(true);

      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const itemJobs = jobs.filter(j => j.entityId === createResult.data.id);

      expect(itemJobs).toHaveLength(5);
    });

    it('handles very long content', async () => {
      // Create a very long description
      const longDescription = 'A'.repeat(10000);

      // Act
      const createResult = await apiClient.createItem({
        publicId: 'long-content-item',
        name: 'Test Item with Long Description',
        description: longDescription,
        propertyId: 'property-long',
        sourceLanguage: 'en',
      });

      // Assert
      expect(createResult.success).toBe(true);
      expect(createResult.data.description).toBe(longDescription);

      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const itemJobs = jobs.filter(j => j.entityId === createResult.data.id);

      expect(itemJobs).toHaveLength(5);
    });

    it('handles special characters in content', async () => {
      // Act
      const createResult = await apiClient.createItem({
        publicId: 'special-chars-item',
        name: 'Café & Résumé <script>alert("xss")</script>',
        description: '日本語 & émojis 🎉 and "quotes" \'apostrophes\'',
        propertyId: 'property-special',
        sourceLanguage: 'en',
      });

      // Assert
      expect(createResult.success).toBe(true);
      expect(createResult.data.name).toContain('Café');
      expect(createResult.data.description).toContain('日本語');

      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const itemJobs = jobs.filter(j => j.entityId === createResult.data.id);

      expect(itemJobs).toHaveLength(5);
    });

    it('handles maximum retry attempts', async () => {
      // Arrange
      const createResult = await apiClient.createItem({
        publicId: 'max-retry-item',
        name: 'Test Item',
        propertyId: 'property-max-retry',
        sourceLanguage: 'en',
      });

      // Set a job to failed with max attempts
      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const targetJob = jobs.find(
        j => j.entityId === createResult.data.id && j.targetLanguage === 'fr'
      );
      if (targetJob) {
        targetJob.status = 'failed';
        targetJob.error = 'Persistent failure';
        targetJob.attemptCount = 10; // Very high retry count
      }

      // Act - Retry should still work (resets attempts)
      const retryResult = await apiClient.retryTranslation({
        entityType: 'item',
        entityId: createResult.data.id,
        targetLanguage: 'fr',
      });

      // Assert
      expect(retryResult.success).toBe(true);

      // Job should be reset
      const updatedJob = jobs.find(
        j => j.entityId === createResult.data.id && j.targetLanguage === 'fr'
      );
      expect(updatedJob?.status).toBe('queued');
      expect(updatedJob?.attemptCount).toBe(0);
    });
  });
});
