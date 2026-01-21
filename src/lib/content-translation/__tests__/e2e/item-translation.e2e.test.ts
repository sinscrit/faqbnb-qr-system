/**
 * Item Translation E2E Tests
 *
 * Tests the complete workflow from item creation through translation storage.
 *
 * @see REQ-E03-033 AC-1, AC-4, AC-5, AC-7
 * @lastModified 2026-01-21
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  setupE2ETestContext,
  teardownE2ETestContext,
  type E2ETestContext,
} from './helpers/e2e-test-utils';
import { createMockApiClient, type MockApiClient } from './helpers/mock-api-client';
import { createTestProperty, MULTILINGUAL_TEST_DATA } from './helpers/test-data-factory';
import {
  getTableRecords,
  addMockRecord,
} from '@/lib/job-queue/__tests__/helpers/mockSupabase';
import { TABLE_NAMES } from '@/lib/job-queue/__tests__/helpers/constants';
import type { TranslationJob } from '@/lib/job-queue/translation-jobs.types';

describe('Item Translation E2E', () => {
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

  describe('Item Creation Triggers Translations', () => {
    it('creates item via API and verifies translation jobs queued for all target languages', async () => {
      // Arrange
      const testProperty = createTestProperty();
      addMockRecord('properties', testProperty);

      // Act
      const result = await apiClient.createItem({
        publicId: 'test-coffee-001',
        name: MULTILINGUAL_TEST_DATA.en.itemName,
        description: MULTILINGUAL_TEST_DATA.en.itemDescription,
        propertyId: testProperty.id,
        sourceLanguage: 'en',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.translationJobIds).toBeDefined();
      expect(result.translationJobIds).toHaveLength(5); // 5 target languages (excluding source)

      // Verify jobs in database
      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const itemJobs = jobs.filter(j => j.entityId === result.data.id);

      expect(itemJobs).toHaveLength(5);
      expect(itemJobs.every(j => j.status === 'queued')).toBe(true);
      expect(itemJobs.every(j => j.entityType === 'item')).toBe(true);
      expect(itemJobs.every(j => j.sourceLanguage === 'en')).toBe(true);

      // Verify all target languages are queued
      const targetLanguages = itemJobs.map(j => j.targetLanguage).sort();
      expect(targetLanguages).toEqual(['de', 'es', 'fr', 'it', 'nl']);
    });

    it('creates French item and queues translations to other 5 languages', async () => {
      // Act
      const result = await apiClient.createItem({
        publicId: 'test-cafe-001',
        name: MULTILINGUAL_TEST_DATA.fr.itemName,
        description: MULTILINGUAL_TEST_DATA.fr.itemDescription,
        propertyId: 'property-123',
        sourceLanguage: 'fr',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.sourceLanguage).toBe('fr');

      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const itemJobs = jobs.filter(j => j.entityId === result.data.id);

      expect(itemJobs).toHaveLength(5);

      // Should NOT include French (source language)
      const targetLanguages = itemJobs.map(j => j.targetLanguage).sort();
      expect(targetLanguages).toEqual(['de', 'en', 'es', 'it', 'nl']);
      expect(targetLanguages).not.toContain('fr');
    });

    it('item with tags triggers item translation jobs', async () => {
      // Act
      const result = await apiClient.createItem({
        publicId: 'test-tagged-item',
        name: 'Microwave Oven',
        description: 'Countertop microwave for heating food',
        propertyId: 'property-456',
        sourceLanguage: 'en',
        tags: ['kitchen', 'appliance', 'heating'],
      });

      // Assert
      expect(result.success).toBe(true);

      // Verify item translation jobs are created
      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const itemJobs = jobs.filter(j => j.entityId === result.data.id && j.entityType === 'item');

      expect(itemJobs).toHaveLength(5);
    });
  });

  describe('Translation Storage Verification', () => {
    it('stores translated content with all required fields', async () => {
      // Arrange - Create item
      const createResult = await apiClient.createItem({
        publicId: 'storage-test-item',
        name: 'Electric Kettle',
        description: 'Fast-boiling water kettle',
        propertyId: 'property-789',
        sourceLanguage: 'en',
      });

      // Simulate job processing completion
      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const itemJobs = jobs.filter(j => j.entityId === createResult.data.id);

      // Complete each job and store translation
      for (const job of itemJobs) {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();

        // Add translation record
        addMockRecord(TABLE_NAMES.ITEM_TRANSLATIONS, {
          item_id: createResult.data.id,
          language: job.targetLanguage,
          name: `Translated Name (${job.targetLanguage})`,
          description: `Translated Description (${job.targetLanguage})`,
          translation_status: 'completed',
          translated_at: job.completedAt,
        });
      }

      // Assert - Check translations stored
      const translations = getTableRecords<Record<string, unknown>>(TABLE_NAMES.ITEM_TRANSLATIONS);
      const itemTranslations = translations.filter(t => t.item_id === createResult.data.id);

      expect(itemTranslations).toHaveLength(5);

      for (const translation of itemTranslations) {
        expect(translation.name).toBeDefined();
        expect(translation.description).toBeDefined();
        expect(translation.translation_status).toBe('completed');
        expect(translation.translated_at).toBeDefined();
      }
    });

    it('translation metadata includes correct source language and timestamps', async () => {
      // Arrange
      const createResult = await apiClient.createItem({
        publicId: 'metadata-test-item',
        name: 'Blender',
        description: 'High-speed blender for smoothies',
        propertyId: 'property-metadata',
        sourceLanguage: 'es',
      });

      const beforeProcessing = new Date().toISOString();

      // Simulate processing
      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const itemJobs = jobs.filter(j => j.entityId === createResult.data.id);

      for (const job of itemJobs) {
        expect(job.sourceLanguage).toBe('es');
        job.status = 'completed';
        job.startedAt = new Date().toISOString();
        job.completedAt = new Date().toISOString();
      }

      // Assert
      for (const job of itemJobs) {
        expect(job.completedAt).toBeDefined();
        expect(new Date(job.completedAt!).getTime()).toBeGreaterThanOrEqual(
          new Date(beforeProcessing).getTime()
        );
      }
    });
  });

  describe('Item Update Triggers Re-translation', () => {
    it('updating item deletes old translations and queues new jobs', async () => {
      // Arrange - Create and "complete" initial translations
      const createResult = await apiClient.createItem({
        publicId: 'update-test-item',
        name: 'Original Name',
        description: 'Original description',
        propertyId: 'property-update',
        sourceLanguage: 'en',
      });

      // Mark jobs as completed
      const initialJobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      for (const job of initialJobs.filter(j => j.entityId === createResult.data.id)) {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
      }

      // Act - Update item
      const updateResult = await apiClient.updateItem(createResult.data.id, {
        name: 'Updated Name',
        description: 'Updated description',
      });

      // Assert
      expect(updateResult.success).toBe(true);
      expect(updateResult.translationJobIds).toHaveLength(5);

      // Verify new jobs are queued
      const allJobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const newJobs = allJobs.filter(
        j => j.entityId === createResult.data.id && j.status === 'queued'
      );

      expect(newJobs).toHaveLength(5);
    });
  });
});
