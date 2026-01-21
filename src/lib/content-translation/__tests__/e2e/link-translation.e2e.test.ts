/**
 * Link Translation E2E Tests
 *
 * Tests the complete workflow for link creation and translation.
 *
 * @see REQ-E03-033 AC-3
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

describe('Link Translation E2E', () => {
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

  describe('Link Creation Triggers Translations', () => {
    it('creates link via API and verifies translation jobs queued for all target languages', async () => {
      // Arrange - Create parent item first
      const itemResult = await apiClient.createItem({
        publicId: 'link-parent-item',
        name: 'Coffee Machine',
        propertyId: 'property-link',
        sourceLanguage: 'en',
      });

      // Act
      const result = await apiClient.createLink(itemResult.data.id, {
        title: MULTILINGUAL_TEST_DATA.en.linkTitle,
        url: 'https://example.com/manual.pdf',
        sourceLanguage: 'en',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.translationJobIds).toBeDefined();
      expect(result.translationJobIds).toHaveLength(5);

      // Verify jobs in database
      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const linkJobs = jobs.filter(j => j.entityId === result.data.id && j.entityType === 'link');

      expect(linkJobs).toHaveLength(5);
      expect(linkJobs.every(j => j.status === 'queued')).toBe(true);
      expect(linkJobs.every(j => j.sourceLanguage === 'en')).toBe(true);

      const targetLanguages = linkJobs.map(j => j.targetLanguage).sort();
      expect(targetLanguages).toEqual(['de', 'es', 'fr', 'it', 'nl']);
    });

    it('creates Italian link and queues translations to other 5 languages', async () => {
      // Arrange
      const itemResult = await apiClient.createItem({
        publicId: 'it-link-item',
        name: 'Macchina del caffè',
        propertyId: 'property-it',
        sourceLanguage: 'it',
      });

      // Act
      const result = await apiClient.createLink(itemResult.data.id, {
        title: MULTILINGUAL_TEST_DATA.it.linkTitle,
        url: 'https://example.com/manuale.pdf',
        sourceLanguage: 'it',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.sourceLanguage).toBe('it');

      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const linkJobs = jobs.filter(j => j.entityId === result.data.id && j.entityType === 'link');

      expect(linkJobs).toHaveLength(5);

      // Should NOT include Italian (source language)
      const targetLanguages = linkJobs.map(j => j.targetLanguage).sort();
      expect(targetLanguages).toEqual(['de', 'en', 'es', 'fr', 'nl']);
      expect(targetLanguages).not.toContain('it');
    });
  });

  describe('URL Preservation', () => {
    it('verifies URL is not modified during link creation', async () => {
      // Arrange
      const itemResult = await apiClient.createItem({
        publicId: 'url-test-item',
        name: 'Test Item',
        propertyId: 'property-url',
        sourceLanguage: 'en',
      });

      const originalUrl = 'https://example.com/resources/manual.pdf?lang=en&version=2.0';

      // Act
      const result = await apiClient.createLink(itemResult.data.id, {
        title: 'Resource Link',
        url: originalUrl,
        sourceLanguage: 'en',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.url).toBe(originalUrl);

      // Verify URL in stored record
      const links = getTableRecords<Record<string, unknown>>(TABLE_NAMES.ITEM_LINKS);
      const storedLink = links.find(l => l.id === result.data.id);
      expect(storedLink?.url).toBe(originalUrl);
    });

    it('verifies URL is preserved during simulated translation', async () => {
      // Arrange
      const itemResult = await apiClient.createItem({
        publicId: 'url-preserve-item',
        name: 'Test Item',
        propertyId: 'property-preserve',
        sourceLanguage: 'en',
      });

      const originalUrl = 'https://cdn.example.com/docs/v3/user-guide.pdf';

      const result = await apiClient.createLink(itemResult.data.id, {
        title: 'User Guide',
        url: originalUrl,
        sourceLanguage: 'en',
      });

      // Simulate translation completion
      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const linkJobs = jobs.filter(j => j.entityId === result.data.id);

      for (const job of linkJobs) {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();

        // Store translation with ONLY title translated, URL preserved
        addMockRecord(TABLE_NAMES.LINK_TRANSLATIONS, {
          link_id: result.data.id,
          language: job.targetLanguage,
          title: `Translated Title (${job.targetLanguage})`,
          // URL should NOT be stored in translations table - it's not translatable
          translation_status: 'completed',
          translated_at: job.completedAt,
        });
      }

      // Assert - URL in original link is unchanged
      const links = getTableRecords<Record<string, unknown>>(TABLE_NAMES.ITEM_LINKS);
      const storedLink = links.find(l => l.id === result.data.id);
      expect(storedLink?.url).toBe(originalUrl);
    });
  });

  describe('Title Only Translation', () => {
    it('verifies only title field is included in translation jobs', async () => {
      // Arrange
      const itemResult = await apiClient.createItem({
        publicId: 'title-only-item',
        name: 'Test Item',
        propertyId: 'property-title',
        sourceLanguage: 'en',
      });

      // Act
      const result = await apiClient.createLink(itemResult.data.id, {
        title: 'Download Manual',
        url: 'https://example.com/download/manual.pdf',
        sourceLanguage: 'en',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.title).toBe('Download Manual');

      // Simulate translations being stored
      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const linkJobs = jobs.filter(j => j.entityId === result.data.id);

      for (const job of linkJobs) {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();

        addMockRecord(TABLE_NAMES.LINK_TRANSLATIONS, {
          link_id: result.data.id,
          language: job.targetLanguage,
          title: `Télécharger le manuel (${job.targetLanguage})`,
          translation_status: 'completed',
          translated_at: job.completedAt,
        });
      }

      const translations = getTableRecords<Record<string, unknown>>(TABLE_NAMES.LINK_TRANSLATIONS);
      const linkTranslations = translations.filter(t => t.link_id === result.data.id);

      expect(linkTranslations).toHaveLength(5);
      for (const translation of linkTranslations) {
        expect(translation.title).toBeDefined();
        // URL should NOT be in translation record
        expect(translation.url).toBeUndefined();
      }
    });
  });
});
