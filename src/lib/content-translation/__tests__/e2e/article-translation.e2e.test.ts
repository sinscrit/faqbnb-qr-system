/**
 * Article Translation E2E Tests
 *
 * Tests the complete workflow for article creation and translation.
 *
 * @see REQ-E03-033 AC-2
 * @lastModified 2026-01-21
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  setupE2ETestContext,
  teardownE2ETestContext,
  type E2ETestContext,
} from './helpers/e2e-test-utils';
import { createMockApiClient, type MockApiClient } from './helpers/mock-api-client';
import { MULTILINGUAL_TEST_DATA } from './helpers/test-data-factory';
import {
  getTableRecords,
  addMockRecord,
} from '@/lib/job-queue/__tests__/helpers/mockSupabase';
import { TABLE_NAMES } from '@/lib/job-queue/__tests__/helpers/constants';
import type { TranslationJob } from '@/lib/job-queue/translation-jobs.types';

describe('Article Translation E2E', () => {
  let ctx: E2ETestContext;
  let apiClient: MockApiClient;

  beforeEach(async () => {
    ctx = await setupE2ETestContext();
    apiClient = createMockApiClient();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(async () => {
    vi.useRealTimers();
    await teardownE2ETestContext(ctx);
  });

  describe('Article Creation Triggers Translations', () => {
    it('creates article via API and verifies translation jobs queued for all target languages', async () => {
      // Arrange - Create parent item first
      const itemResult = await apiClient.createItem({
        publicId: 'parent-item-001',
        name: 'Coffee Machine',
        propertyId: 'property-123',
        sourceLanguage: 'en',
      });

      // Act
      const result = await apiClient.createArticle({
        itemId: itemResult.data.id,
        title: MULTILINGUAL_TEST_DATA.en.articleTitle,
        description: MULTILINGUAL_TEST_DATA.en.articleDescription,
        sourceLanguage: 'en',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.translationJobIds).toBeDefined();
      expect(result.translationJobIds).toHaveLength(5); // 5 target languages

      // Verify jobs in database
      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const articleJobs = jobs.filter(j => j.entityId === result.data.id && j.entityType === 'article');

      expect(articleJobs).toHaveLength(5);
      expect(articleJobs.every(j => j.status === 'queued')).toBe(true);
      expect(articleJobs.every(j => j.sourceLanguage === 'en')).toBe(true);

      const targetLanguages = articleJobs.map(j => j.targetLanguage).sort();
      expect(targetLanguages).toEqual(['de', 'es', 'fr', 'it', 'nl']);
    });

    it('creates German article and queues translations to other 5 languages', async () => {
      // Arrange
      const itemResult = await apiClient.createItem({
        publicId: 'de-parent-item',
        name: 'Kaffeemaschine',
        propertyId: 'property-de',
        sourceLanguage: 'de',
      });

      // Act
      const result = await apiClient.createArticle({
        itemId: itemResult.data.id,
        title: MULTILINGUAL_TEST_DATA.de.articleTitle,
        description: MULTILINGUAL_TEST_DATA.de.articleDescription,
        sourceLanguage: 'de',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.sourceLanguage).toBe('de');

      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const articleJobs = jobs.filter(j => j.entityId === result.data.id && j.entityType === 'article');

      expect(articleJobs).toHaveLength(5);

      // Should NOT include German (source language)
      const targetLanguages = articleJobs.map(j => j.targetLanguage).sort();
      expect(targetLanguages).toEqual(['en', 'es', 'fr', 'it', 'nl']);
      expect(targetLanguages).not.toContain('de');
    });
  });

  describe('Article Title and Description Translation', () => {
    it('verifies both title and description fields are available for translation', async () => {
      // Arrange
      const itemResult = await apiClient.createItem({
        publicId: 'fields-test-item',
        name: 'Toaster',
        propertyId: 'property-fields',
        sourceLanguage: 'en',
      });

      // Act
      const result = await apiClient.createArticle({
        itemId: itemResult.data.id,
        title: 'How to Use the Toaster',
        description: 'Step-by-step instructions for perfect toast',
        sourceLanguage: 'en',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.title).toBe('How to Use the Toaster');
      expect(result.data.description).toBe('Step-by-step instructions for perfect toast');

      // Simulate translation storage
      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const articleJobs = jobs.filter(j => j.entityId === result.data.id);

      for (const job of articleJobs) {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();

        addMockRecord(TABLE_NAMES.ARTICLE_TRANSLATIONS, {
          article_id: result.data.id,
          language: job.targetLanguage,
          title: `Translated Title (${job.targetLanguage})`,
          description: `Translated Description (${job.targetLanguage})`,
          translation_status: 'completed',
          translated_at: job.completedAt,
        });
      }

      const translations = getTableRecords<Record<string, unknown>>(TABLE_NAMES.ARTICLE_TRANSLATIONS);
      const articleTranslations = translations.filter(t => t.article_id === result.data.id);

      expect(articleTranslations).toHaveLength(5);
      for (const translation of articleTranslations) {
        expect(translation.title).toBeDefined();
        expect(translation.description).toBeDefined();
      }
    });

    it('handles articles without description (title only)', async () => {
      // Arrange
      const itemResult = await apiClient.createItem({
        publicId: 'no-desc-item',
        name: 'Simple Item',
        propertyId: 'property-simple',
        sourceLanguage: 'en',
      });

      // Act
      const result = await apiClient.createArticle({
        itemId: itemResult.data.id,
        title: 'Quick Start Guide',
        // No description provided
        sourceLanguage: 'en',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.title).toBe('Quick Start Guide');
      expect(result.data.description).toBeNull();

      // Translation jobs should still be queued
      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const articleJobs = jobs.filter(j => j.entityId === result.data.id);

      expect(articleJobs).toHaveLength(5);
    });

    it('handles articles with long description text', async () => {
      // Arrange
      const itemResult = await apiClient.createItem({
        publicId: 'long-desc-item',
        name: 'Complex Equipment',
        propertyId: 'property-long',
        sourceLanguage: 'en',
      });

      const longDescription = 'This is a very detailed description. '.repeat(100);

      // Act
      const result = await apiClient.createArticle({
        itemId: itemResult.data.id,
        title: 'Comprehensive User Manual',
        description: longDescription,
        sourceLanguage: 'en',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.description).toBe(longDescription);
      expect(result.data.description!.length).toBeGreaterThan(3000);

      // Translation jobs should still be queued
      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const articleJobs = jobs.filter(j => j.entityId === result.data.id);

      expect(articleJobs).toHaveLength(5);
    });
  });

  describe('Article Update Triggers Re-translation', () => {
    it('updating article title queues new translation jobs', async () => {
      // Arrange
      const itemResult = await apiClient.createItem({
        publicId: 'update-article-item',
        name: 'Updatable Item',
        propertyId: 'property-update',
        sourceLanguage: 'en',
      });

      const createResult = await apiClient.createArticle({
        itemId: itemResult.data.id,
        title: 'Original Title',
        description: 'Original description',
        sourceLanguage: 'en',
      });

      // Complete initial jobs
      const initialJobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      for (const job of initialJobs.filter(j => j.entityId === createResult.data.id)) {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
      }

      // Act
      const updateResult = await apiClient.updateArticle(createResult.data.id, {
        itemId: itemResult.data.id,
        title: 'Updated Title',
        description: 'Updated description',
        sourceLanguage: 'en',
      });

      // Assert
      expect(updateResult.success).toBe(true);
      expect(updateResult.translationJobIds).toHaveLength(5);

      const allJobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const newJobs = allJobs.filter(
        j => j.entityId === createResult.data.id && j.status === 'queued'
      );

      expect(newJobs).toHaveLength(5);
    });
  });
});
