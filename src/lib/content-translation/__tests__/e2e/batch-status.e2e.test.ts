/**
 * Batch Status E2E Tests
 *
 * Tests the batch status endpoint for multiple entities.
 *
 * @see REQ-E03-033 AC-13
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
  addMockRecord,
} from '@/lib/job-queue/__tests__/helpers/mockSupabase';
import { TABLE_NAMES } from '@/lib/job-queue/__tests__/helpers/constants';
import { createTestTranslationJobBatch } from './helpers/test-data-factory';
import type { TranslationJob } from '@/lib/job-queue/translation-jobs.types';

describe('Batch Status E2E', () => {
  let ctx: E2ETestContext;
  let apiClient: MockApiClient;

  beforeEach(async () => {
    ctx = await setupE2ETestContext();
    apiClient = createMockApiClient();
  });

  afterEach(async () => {
    await teardownE2ETestContext(ctx);
  });

  describe('Batch Status Endpoint', () => {
    it('AC-13: returns correct aggregated status for multiple items', async () => {
      // Arrange - Create multiple items with different statuses
      const item1Id = 'batch-item-1';
      const item2Id = 'batch-item-2';
      const item3Id = 'batch-item-3';

      // Item 1: All completed
      const jobs1 = createTestTranslationJobBatch('item', item1Id, 'en');
      for (const job of jobs1) {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
      }

      // Item 2: All pending
      const jobs2 = createTestTranslationJobBatch('item', item2Id, 'en');
      // Default status is 'queued'

      // Item 3: Mixed (partial)
      const jobs3 = createTestTranslationJobBatch('item', item3Id, 'en');
      jobs3[0].status = 'completed';
      jobs3[0].completedAt = new Date().toISOString();
      jobs3[1].status = 'failed';
      jobs3[1].errorMessage = 'Error';

      const allJobs = [...jobs1, ...jobs2, ...jobs3];
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, allJobs);

      seedMockDatabase(TABLE_NAMES.ITEMS, [
        { id: item1Id, name: 'Item 1', source_language: 'en' },
        { id: item2Id, name: 'Item 2', source_language: 'en' },
        { id: item3Id, name: 'Item 3', source_language: 'en' },
      ]);

      // Act
      const result = await apiClient.getBatchStatus({
        entities: [
          { type: 'item', id: item1Id },
          { type: 'item', id: item2Id },
          { type: 'item', id: item3Id },
        ],
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);

      const status1 = result.data.find(s => s.entityId === item1Id);
      const status2 = result.data.find(s => s.entityId === item2Id);
      const status3 = result.data.find(s => s.entityId === item3Id);

      expect(status1!.overallStatus).toBe('complete');
      expect(status2!.overallStatus).toBe('pending');
      expect(status3!.overallStatus).toBe('partial');
    });

    it('handles multiple entity types in single request', async () => {
      // Arrange
      const itemId = 'batch-mixed-item';
      const articleId = 'batch-mixed-article';
      const linkId = 'batch-mixed-link';

      const itemJobs = createTestTranslationJobBatch('item', itemId, 'en');
      const articleJobs = createTestTranslationJobBatch('article', articleId, 'en');
      const linkJobs = createTestTranslationJobBatch('link', linkId, 'en');

      // Set different statuses
      for (const job of itemJobs) {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
      }

      for (const job of articleJobs) {
        job.status = 'failed';
        job.errorMessage = 'Error';
      }

      const allJobs = [...itemJobs, ...articleJobs, ...linkJobs];
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, allJobs);

      seedMockDatabase(TABLE_NAMES.ITEMS, [{ id: itemId, name: 'Item', source_language: 'en' }]);
      seedMockDatabase(TABLE_NAMES.ITEM_ARTICLES, [{ id: articleId, title: 'Article', source_language: 'en' }]);
      seedMockDatabase(TABLE_NAMES.ITEM_LINKS, [{ id: linkId, title: 'Link', url: 'https://example.com', source_language: 'en' }]);

      // Act
      const result = await apiClient.getBatchStatus({
        entities: [
          { type: 'item', id: itemId },
          { type: 'article', id: articleId },
          { type: 'link', id: linkId },
        ],
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);

      const itemStatus = result.data.find(s => s.entityType === 'item');
      const articleStatus = result.data.find(s => s.entityType === 'article');
      const linkStatus = result.data.find(s => s.entityType === 'link');

      expect(itemStatus!.overallStatus).toBe('complete');
      expect(articleStatus!.overallStatus).toBe('failed');
      expect(linkStatus!.overallStatus).toBe('pending');
    });

    it('handles empty entity list gracefully', async () => {
      // Act
      const result = await apiClient.getBatchStatus({
        entities: [],
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });

    it('returns pending for entities with no jobs', async () => {
      // Arrange - Entity exists but has no translation jobs
      const itemId = 'batch-no-jobs-item';

      seedMockDatabase(TABLE_NAMES.ITEMS, [
        { id: itemId, name: 'Item Without Jobs', source_language: 'en' },
      ]);

      // Act
      const result = await apiClient.getBatchStatus({
        entities: [{ type: 'item', id: itemId }],
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].overallStatus).toBe('pending');
    });

    it('handles large batch of entities', async () => {
      // Arrange - Create 50 items
      const items: Array<{ id: string; name: string; source_language: string }> = [];
      const allJobs: TranslationJob[] = [];

      for (let i = 0; i < 50; i++) {
        const itemId = `batch-large-item-${i}`;
        items.push({ id: itemId, name: `Item ${i}`, source_language: 'en' });

        const jobs = createTestTranslationJobBatch('item', itemId, 'en');

        // Set status patterns:
        // i % 4 === 0: All completed
        // i % 4 === 1: Some completed + some pending = partial
        // i % 4 === 2: Some completed + some failed = partial
        // i % 4 === 3: All pending
        if (i % 4 === 0) {
          for (const job of jobs) {
            job.status = 'completed';
            job.completedAt = new Date().toISOString();
          }
        } else if (i % 4 === 1) {
          // Some completed, some pending = partial
          jobs[0].status = 'completed';
          jobs[0].completedAt = new Date().toISOString();
          jobs[1].status = 'completed';
          jobs[1].completedAt = new Date().toISOString();
          // rest stay pending (queued)
        } else if (i % 4 === 2) {
          // Some completed, some failed = partial
          jobs[0].status = 'completed';
          jobs[0].completedAt = new Date().toISOString();
          jobs[1].status = 'failed';
          jobs[1].errorMessage = 'Error';
          jobs[2].status = 'completed';
          jobs[2].completedAt = new Date().toISOString();
          jobs[3].status = 'failed';
          jobs[3].errorMessage = 'Error';
          jobs[4].status = 'failed';
          jobs[4].errorMessage = 'Error';
        }
        // i % 4 === 3: All pending (default queued status)

        allJobs.push(...jobs);
      }

      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, allJobs);
      seedMockDatabase(TABLE_NAMES.ITEMS, items);

      // Act
      const result = await apiClient.getBatchStatus({
        entities: items.map(item => ({ type: 'item' as const, id: item.id })),
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(50);

      // Verify status distribution
      const completeCount = result.data.filter(s => s.overallStatus === 'complete').length;
      const partialCount = result.data.filter(s => s.overallStatus === 'partial').length;
      const pendingCount = result.data.filter(s => s.overallStatus === 'pending').length;

      expect(completeCount).toBeGreaterThan(0);
      expect(partialCount).toBeGreaterThan(0);
      expect(pendingCount).toBeGreaterThan(0);
    });
  });
});
