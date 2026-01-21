/**
 * Manual Override E2E Tests
 *
 * Tests the manual translation override functionality.
 *
 * @see REQ-E03-033 AC-11
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

describe('Manual Override E2E', () => {
  let ctx: E2ETestContext;
  let apiClient: MockApiClient;

  beforeEach(async () => {
    ctx = await setupE2ETestContext();
    apiClient = createMockApiClient();
  });

  afterEach(async () => {
    await teardownE2ETestContext(ctx);
  });

  describe('Manual Translation Override', () => {
    it('AC-11: manual override saves with "manual" status', async () => {
      // Arrange
      const itemId = 'manual-status-item';
      const jobs = createTestTranslationJobBatch('item', itemId, 'en');

      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);
      seedMockDatabase(TABLE_NAMES.ITEMS, [{
        id: itemId,
        name: 'Test Item',
        description: 'Test description',
        source_language: 'en',
      }]);

      // Act
      const result = await apiClient.setManualTranslation('item', itemId, 'fr', {
        name: 'Nom manuel',
        description: 'Description manuelle',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.translationStatus).toBe('manual');
      expect(result.data.language).toBe('fr');

      // Verify in database
      const translations = getTableRecords<Record<string, unknown>>(TABLE_NAMES.ITEM_TRANSLATIONS);
      const manualTranslation = translations.find(
        t => t.item_id === itemId && t.language === 'fr'
      );

      expect(manualTranslation).toBeDefined();
      expect(manualTranslation!.translation_status).toBe('manual');
      expect(manualTranslation!.name).toBe('Nom manuel');
      expect(manualTranslation!.description).toBe('Description manuelle');
    });

    it('manual override tracks reviewer ID', async () => {
      // Arrange
      const itemId = 'manual-reviewer-item';
      const jobs = createTestTranslationJobBatch('item', itemId, 'en');

      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);
      seedMockDatabase(TABLE_NAMES.ITEMS, [{
        id: itemId,
        name: 'Test Item',
        source_language: 'en',
      }]);

      // Act
      const result = await apiClient.setManualTranslation('item', itemId, 'de', {
        name: 'Manueller Name',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.reviewedBy).toBeDefined();
      expect(result.data.reviewedBy).toBe('test-user-001'); // Default test user

      // Verify in database
      const translations = getTableRecords<Record<string, unknown>>(TABLE_NAMES.ITEM_TRANSLATIONS);
      const manualTranslation = translations.find(
        t => t.item_id === itemId && t.language === 'de'
      );

      expect(manualTranslation!.reviewed_by).toBe('test-user-001');
    });

    it('manual override updates job status to completed', async () => {
      // Arrange
      const itemId = 'manual-job-item';
      const jobs = createTestTranslationJobBatch('item', itemId, 'en');

      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);
      seedMockDatabase(TABLE_NAMES.ITEMS, [{
        id: itemId,
        name: 'Test Item',
        source_language: 'en',
      }]);

      const frenchJob = jobs.find(j => j.targetLanguage === 'fr');
      expect(frenchJob!.status).toBe('queued');

      // Act
      await apiClient.setManualTranslation('item', itemId, 'fr', {
        name: 'Nom traduit',
      });

      // Assert - Job should now be completed
      const updatedJobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const updatedFrenchJob = updatedJobs.find(
        j => j.entityId === itemId && j.targetLanguage === 'fr'
      );

      expect(updatedFrenchJob!.status).toBe('completed');
      expect(updatedFrenchJob!.completedAt).toBeDefined();
    });

    it('manual override includes timestamp', async () => {
      // Arrange
      const itemId = 'manual-timestamp-item';
      const jobs = createTestTranslationJobBatch('item', itemId, 'en');
      const beforeOverride = new Date().toISOString();

      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);
      seedMockDatabase(TABLE_NAMES.ITEMS, [{
        id: itemId,
        name: 'Test Item',
        source_language: 'en',
      }]);

      // Act
      const result = await apiClient.setManualTranslation('item', itemId, 'es', {
        name: 'Nombre manual',
      });

      // Assert
      expect(result.data.updatedAt).toBeDefined();
      expect(new Date(result.data.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(beforeOverride).getTime()
      );
    });
  });

  describe('Manual Override with Different Entity Types', () => {
    it('manual override works for articles', async () => {
      // Arrange
      const articleId = 'manual-article';
      const jobs = createTestTranslationJobBatch('article', articleId, 'en');

      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);
      seedMockDatabase(TABLE_NAMES.ITEM_ARTICLES, [{
        id: articleId,
        title: 'Test Article',
        description: 'Test description',
        source_language: 'en',
      }]);

      // Act
      const result = await apiClient.setManualTranslation('article', articleId, 'fr', {
        title: 'Titre manuel',
        description: 'Description manuelle',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.translationStatus).toBe('manual');

      const translations = getTableRecords<Record<string, unknown>>(TABLE_NAMES.ARTICLE_TRANSLATIONS);
      const manualTranslation = translations.find(
        t => t.article_id === articleId && t.language === 'fr'
      );

      expect(manualTranslation).toBeDefined();
      expect(manualTranslation!.title).toBe('Titre manuel');
    });

    it('manual override works for links (title only)', async () => {
      // Arrange
      const linkId = 'manual-link';
      const jobs = createTestTranslationJobBatch('link', linkId, 'en');

      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);
      seedMockDatabase(TABLE_NAMES.ITEM_LINKS, [{
        id: linkId,
        title: 'Test Link',
        url: 'https://example.com',
        source_language: 'en',
      }]);

      // Act
      const result = await apiClient.setManualTranslation('link', linkId, 'de', {
        title: 'Manueller Linktitel',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.translationStatus).toBe('manual');

      const translations = getTableRecords<Record<string, unknown>>(TABLE_NAMES.LINK_TRANSLATIONS);
      const manualTranslation = translations.find(
        t => t.link_id === linkId && t.language === 'de'
      );

      expect(manualTranslation).toBeDefined();
      expect(manualTranslation!.title).toBe('Manueller Linktitel');
    });
  });

  describe('Manual Override Preservation', () => {
    it('manual translations are not affected by retry', async () => {
      // Arrange
      const itemId = 'manual-preserve-item';
      const jobs = createTestTranslationJobBatch('item', itemId, 'en');

      // Set one as manual
      jobs[0].status = 'completed';
      jobs[0].completedAt = new Date().toISOString();

      // Set one as failed
      jobs[1].status = 'failed';
      jobs[1].errorMessage = 'Error';

      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);
      seedMockDatabase(TABLE_NAMES.ITEMS, [{
        id: itemId,
        name: 'Test Item',
        source_language: 'en',
      }]);

      // Create manual translation for first language
      await apiClient.setManualTranslation('item', itemId, jobs[0].targetLanguage, {
        name: 'Manual translation',
      });

      // Act - Retry failed translations
      const retryResult = await apiClient.retryTranslations({
        entityType: 'item',
        entityId: itemId,
      });

      // Assert - Manual translation should be preserved
      expect(retryResult.jobsQueued).toBe(1);
      expect(retryResult.queuedLanguages).not.toContain(jobs[0].targetLanguage);

      const translations = getTableRecords<Record<string, unknown>>(TABLE_NAMES.ITEM_TRANSLATIONS);
      const manualTranslation = translations.find(
        t => t.item_id === itemId && t.language === jobs[0].targetLanguage
      );

      expect(manualTranslation).toBeDefined();
      expect(manualTranslation!.translation_status).toBe('manual');
      expect(manualTranslation!.name).toBe('Manual translation');
    });

    it('manual override for multiple languages in sequence', async () => {
      // Arrange
      const itemId = 'manual-multi-item';
      const jobs = createTestTranslationJobBatch('item', itemId, 'en');

      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);
      seedMockDatabase(TABLE_NAMES.ITEMS, [{
        id: itemId,
        name: 'Test Item',
        source_language: 'en',
      }]);

      // Act - Override multiple languages
      await apiClient.setManualTranslation('item', itemId, 'fr', { name: 'Français' });
      await apiClient.setManualTranslation('item', itemId, 'de', { name: 'Deutsch' });
      await apiClient.setManualTranslation('item', itemId, 'es', { name: 'Español' });

      // Assert
      const translations = getTableRecords<Record<string, unknown>>(TABLE_NAMES.ITEM_TRANSLATIONS);
      const itemTranslations = translations.filter(t => t.item_id === itemId);

      expect(itemTranslations).toHaveLength(3);
      expect(itemTranslations.every(t => t.translation_status === 'manual')).toBe(true);

      const frTranslation = itemTranslations.find(t => t.language === 'fr');
      const deTranslation = itemTranslations.find(t => t.language === 'de');
      const esTranslation = itemTranslations.find(t => t.language === 'es');

      expect(frTranslation!.name).toBe('Français');
      expect(deTranslation!.name).toBe('Deutsch');
      expect(esTranslation!.name).toBe('Español');
    });
  });
});
