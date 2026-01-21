/**
 * Mock API Client for E2E Tests
 *
 * Provides mock implementations of all translation-related API endpoints.
 *
 * @module content-translation/__tests__/e2e/helpers/mock-api-client
 * @lastModified 2026-01-21
 */

import {
  getTableRecords,
  addMockRecord,
  updateMockRecord,
  findMockRecord,
  seedMockDatabase,
} from '@/lib/job-queue/__tests__/helpers/mockSupabase';
import { TABLE_NAMES } from '@/lib/job-queue/__tests__/helpers/constants';
import type { EntityType, SupportedLanguage, TranslationJob } from '@/lib/job-queue/translation-jobs.types';

// ============================================================================
// Type Definitions
// ============================================================================

export interface CreateItemRequest {
  publicId: string;
  name: string;
  description?: string;
  propertyId: string;
  sourceLanguage?: string;
  tags?: string[];
}

export interface CreateItemResponse {
  success: boolean;
  data: {
    id: string;
    publicId: string;
    name: string;
    description: string | null;
    propertyId: string;
    sourceLanguage: string;
    createdAt: string;
  };
  translationJobIds?: string[];
  error?: string;
}

export interface CreateArticleRequest {
  itemId: string;
  title: string;
  description?: string;
  sourceLanguage?: string;
}

export interface CreateArticleResponse {
  success: boolean;
  data: {
    id: string;
    itemId: string;
    title: string;
    description: string | null;
    sourceLanguage: string;
    createdAt: string;
  };
  translationJobIds?: string[];
  error?: string;
}

export interface CreateLinkRequest {
  title: string;
  url: string;
  sourceLanguage?: string;
}

export interface CreateLinkResponse {
  success: boolean;
  data: {
    id: string;
    itemId: string;
    title: string;
    url: string;
    sourceLanguage: string;
    createdAt: string;
  };
  translationJobIds?: string[];
  error?: string;
}

export interface UpdateItemRequest {
  name?: string;
  description?: string;
  tags?: string[];
}

export interface TranslationStatusResponse {
  success: boolean;
  data: {
    entityId: string;
    entityType: EntityType;
    sourceLanguage: string;
    translations: Record<string, {
      status: 'pending' | 'completed' | 'failed' | 'manual';
      translatedAt?: string;
      error?: string;
    }>;
    overallStatus: 'complete' | 'partial' | 'pending' | 'failed';
    completedLanguages: string[];
    pendingLanguages: string[];
    failedLanguages: string[];
    totalJobs?: number;
  };
  error?: string;
}

export interface RetryTranslationRequest {
  entityType: EntityType;
  entityId: string;
  languages?: string[];
}

export interface RetryTranslationResponse {
  success: boolean;
  jobsQueued: number;
  queuedLanguages: string[];
  error?: string;
}

export interface ManualTranslationRequest {
  name?: string;
  title?: string;
  description?: string;
}

export interface ManualTranslationResponse {
  success: boolean;
  data: {
    entityId: string;
    language: string;
    translationStatus: 'manual';
    reviewedBy: string;
    updatedAt: string;
  };
  error?: string;
}

export interface BatchStatusRequest {
  entities: Array<{ type: EntityType; id: string }>;
}

export interface BatchStatusResponse {
  success: boolean;
  data: Array<{
    entityType: EntityType;
    entityId: string;
    overallStatus: 'complete' | 'partial' | 'pending' | 'failed';
  }>;
  error?: string;
}

// ============================================================================
// Mock API Client Interface
// ============================================================================

export interface MockApiClient {
  // Items API
  createItem(data: CreateItemRequest): Promise<CreateItemResponse>;
  updateItem(id: string, data: UpdateItemRequest): Promise<CreateItemResponse>;

  // Articles API
  createArticle(data: CreateArticleRequest): Promise<CreateArticleResponse>;
  updateArticle(id: string, data: CreateArticleRequest): Promise<CreateArticleResponse>;

  // Links API
  createLink(itemId: string, data: CreateLinkRequest): Promise<CreateLinkResponse>;

  // Translations API
  getTranslationStatus(entityType: EntityType, entityId: string): Promise<TranslationStatusResponse>;
  retryTranslation(request: RetryTranslationRequest & { targetLanguage?: string }): Promise<RetryTranslationResponse>;
  retryTranslations(request: RetryTranslationRequest): Promise<RetryTranslationResponse>;
  setManualTranslation(
    entityType: EntityType,
    entityId: string,
    language: string,
    data: ManualTranslationRequest
  ): Promise<ManualTranslationResponse>;
  getBatchStatus(request: BatchStatusRequest): Promise<BatchStatusResponse>;
  getBatchTranslationStatus(request: { entityType: EntityType; entityIds: string[] }): Promise<{
    success: boolean;
    data: { statuses: Array<{ entityId: string; overallStatus: string; totalJobs: number }> };
  }>;
}

// ============================================================================
// Mock API Client Implementation
// ============================================================================

const TARGET_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];

/**
 * Creates a mock API client for E2E tests.
 */
export function createMockApiClient(): MockApiClient {
  return {
    async createItem(data: CreateItemRequest): Promise<CreateItemResponse> {
      const id = `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const sourceLanguage = data.sourceLanguage || 'en';
      const createdAt = new Date().toISOString();

      // Create item record
      const item = {
        id,
        public_id: data.publicId,
        name: data.name,
        description: data.description || null,
        property_id: data.propertyId,
        source_language: sourceLanguage,
        created_at: createdAt,
        tags: data.tags || [],
      };
      addMockRecord(TABLE_NAMES.ITEMS, item);

      // Queue translation jobs
      const jobIds = queueTranslationJobs('item', id, sourceLanguage);

      return {
        success: true,
        data: {
          id,
          publicId: data.publicId,
          name: data.name,
          description: data.description || null,
          propertyId: data.propertyId,
          sourceLanguage,
          createdAt,
        },
        translationJobIds: jobIds,
      };
    },

    async updateItem(id: string, data: UpdateItemRequest): Promise<CreateItemResponse> {
      const existing = findMockRecord<Record<string, unknown>>(TABLE_NAMES.ITEMS, 'id', id);
      if (!existing) {
        return { success: false, data: null as unknown as CreateItemResponse['data'], error: 'Item not found' };
      }

      // Delete existing translations and jobs
      deleteExistingTranslationsAndJobs('item', id);

      // Update item
      const updated = updateMockRecord(TABLE_NAMES.ITEMS, 'id', id, {
        name: data.name ?? existing.name,
        description: data.description ?? existing.description,
        tags: data.tags ?? existing.tags,
      });

      // Queue new translation jobs
      const jobIds = queueTranslationJobs('item', id, existing.source_language as string);

      return {
        success: true,
        data: {
          id,
          publicId: updated?.public_id as string,
          name: updated?.name as string,
          description: updated?.description as string | null,
          propertyId: updated?.property_id as string,
          sourceLanguage: updated?.source_language as string,
          createdAt: updated?.created_at as string,
        },
        translationJobIds: jobIds,
      };
    },

    async createArticle(data: CreateArticleRequest): Promise<CreateArticleResponse> {
      const id = `article-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const sourceLanguage = data.sourceLanguage || 'en';
      const createdAt = new Date().toISOString();

      const article = {
        id,
        item_id: data.itemId,
        title: data.title,
        description: data.description || null,
        source_language: sourceLanguage,
        created_at: createdAt,
      };
      addMockRecord(TABLE_NAMES.ITEM_ARTICLES, article);

      const jobIds = queueTranslationJobs('article', id, sourceLanguage);

      return {
        success: true,
        data: {
          id,
          itemId: data.itemId,
          title: data.title,
          description: data.description || null,
          sourceLanguage,
          createdAt,
        },
        translationJobIds: jobIds,
      };
    },

    async updateArticle(id: string, data: CreateArticleRequest): Promise<CreateArticleResponse> {
      const existing = findMockRecord<Record<string, unknown>>(TABLE_NAMES.ITEM_ARTICLES, 'id', id);
      if (!existing) {
        return { success: false, data: null as unknown as CreateArticleResponse['data'], error: 'Article not found' };
      }

      deleteExistingTranslationsAndJobs('article', id);

      const updated = updateMockRecord(TABLE_NAMES.ITEM_ARTICLES, 'id', id, {
        title: data.title ?? existing.title,
        description: data.description ?? existing.description,
      });

      const jobIds = queueTranslationJobs('article', id, existing.source_language as string);

      return {
        success: true,
        data: {
          id,
          itemId: updated?.item_id as string,
          title: updated?.title as string,
          description: updated?.description as string | null,
          sourceLanguage: updated?.source_language as string,
          createdAt: updated?.created_at as string,
        },
        translationJobIds: jobIds,
      };
    },

    async createLink(itemId: string, data: CreateLinkRequest): Promise<CreateLinkResponse> {
      const id = `link-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const sourceLanguage = data.sourceLanguage || 'en';
      const createdAt = new Date().toISOString();

      const link = {
        id,
        item_id: itemId,
        title: data.title,
        url: data.url,
        source_language: sourceLanguage,
        created_at: createdAt,
      };
      addMockRecord(TABLE_NAMES.ITEM_LINKS, link);

      const jobIds = queueTranslationJobs('link', id, sourceLanguage);

      return {
        success: true,
        data: {
          id,
          itemId,
          title: data.title,
          url: data.url,
          sourceLanguage,
          createdAt,
        },
        translationJobIds: jobIds,
      };
    },

    async getTranslationStatus(entityType: EntityType, entityId: string): Promise<TranslationStatusResponse> {
      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const entityJobs = jobs.filter(j => j.entityId === entityId && j.entityType === entityType);

      const translations: TranslationStatusResponse['data']['translations'] = {};
      const completedLanguages: string[] = [];
      const pendingLanguages: string[] = [];
      const failedLanguages: string[] = [];

      for (const job of entityJobs) {
        translations[job.targetLanguage] = {
          status: job.status === 'completed' ? 'completed' :
                  job.status === 'failed' ? 'failed' : 'pending',
          translatedAt: job.completedAt || undefined,
          error: job.errorMessage || undefined,
        };

        if (job.status === 'completed') {
          completedLanguages.push(job.targetLanguage);
        } else if (job.status === 'failed') {
          failedLanguages.push(job.targetLanguage);
        } else {
          pendingLanguages.push(job.targetLanguage);
        }
      }

      let overallStatus: 'complete' | 'partial' | 'pending' | 'failed';
      if (entityJobs.length === 0) {
        overallStatus = 'pending';
      } else if (failedLanguages.length > 0 && pendingLanguages.length === 0 && completedLanguages.length === 0) {
        overallStatus = 'failed';
      } else if (failedLanguages.length > 0 && completedLanguages.length > 0 && pendingLanguages.length === 0) {
        overallStatus = 'partial';
      } else if (pendingLanguages.length > 0) {
        overallStatus = completedLanguages.length > 0 ? 'partial' : 'pending';
      } else if (completedLanguages.length > 0 && pendingLanguages.length === 0 && failedLanguages.length === 0) {
        overallStatus = 'complete';
      } else {
        overallStatus = 'pending';
      }

      // Find source language from entity
      let sourceLanguage = 'en';
      if (entityType === 'item') {
        const item = findMockRecord<Record<string, unknown>>(TABLE_NAMES.ITEMS, 'id', entityId);
        sourceLanguage = (item?.source_language as string) || 'en';
      } else if (entityType === 'article') {
        const article = findMockRecord<Record<string, unknown>>(TABLE_NAMES.ITEM_ARTICLES, 'id', entityId);
        sourceLanguage = (article?.source_language as string) || 'en';
      } else if (entityType === 'link') {
        const link = findMockRecord<Record<string, unknown>>(TABLE_NAMES.ITEM_LINKS, 'id', entityId);
        sourceLanguage = (link?.source_language as string) || 'en';
      }

      return {
        success: true,
        data: {
          entityId,
          entityType,
          sourceLanguage,
          translations,
          overallStatus,
          completedLanguages,
          pendingLanguages,
          failedLanguages,
          totalJobs: entityJobs.length,
        },
      };
    },

    async retryTranslation(request: RetryTranslationRequest & { targetLanguage?: string }): Promise<RetryTranslationResponse> {
      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);

      // First check if any jobs exist for this entity
      const entityJobs = jobs.filter(
        j => j.entityId === request.entityId && j.entityType === request.entityType
      );

      if (entityJobs.length === 0) {
        return {
          success: false,
          jobsQueued: 0,
          queuedLanguages: [],
          error: 'No jobs found for this entity',
        };
      }

      // If specific target language requested
      if (request.targetLanguage) {
        const targetJob = entityJobs.find(j => j.targetLanguage === request.targetLanguage);

        if (!targetJob) {
          return {
            success: false,
            jobsQueued: 0,
            queuedLanguages: [],
            error: `Job for language ${request.targetLanguage} not found`,
          };
        }

        if (targetJob.status !== 'failed') {
          return {
            success: false,
            jobsQueued: 0,
            queuedLanguages: [],
            error: `Job is not in failed state (current: ${targetJob.status})`,
          };
        }

        targetJob.status = 'queued';
        targetJob.errorMessage = null;
        targetJob.attempts = 0;
        (targetJob as TranslationJob & { attemptCount?: number }).attemptCount = 0;

        return {
          success: true,
          jobsQueued: 1,
          queuedLanguages: [request.targetLanguage],
        };
      }

      // Retry all failed jobs
      const failedJobs = entityJobs.filter(j => j.status === 'failed');

      if (failedJobs.length === 0) {
        return {
          success: false,
          jobsQueued: 0,
          queuedLanguages: [],
          error: 'No failed jobs to retry',
        };
      }

      const queuedLanguages: string[] = [];
      for (const job of failedJobs) {
        job.status = 'queued';
        job.errorMessage = null;
        job.attempts = 0;
        (job as TranslationJob & { attemptCount?: number }).attemptCount = 0;
        queuedLanguages.push(job.targetLanguage);
      }

      return {
        success: true,
        jobsQueued: queuedLanguages.length,
        queuedLanguages,
      };
    },

    async retryTranslations(request: RetryTranslationRequest): Promise<RetryTranslationResponse> {
      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const failedJobs = jobs.filter(
        j => j.entityId === request.entityId &&
             j.entityType === request.entityType &&
             j.status === 'failed' &&
             (!request.languages || request.languages.includes(j.targetLanguage))
      );

      const queuedLanguages: string[] = [];
      for (const job of failedJobs) {
        job.status = 'queued';
        job.errorMessage = null;
        job.attempts = 0;
        queuedLanguages.push(job.targetLanguage);
      }

      return {
        success: true,
        jobsQueued: queuedLanguages.length,
        queuedLanguages,
      };
    },

    async setManualTranslation(
      entityType: EntityType,
      entityId: string,
      language: string,
      data: ManualTranslationRequest
    ): Promise<ManualTranslationResponse> {
      const tableName = getTranslationTableName(entityType);
      const idField = getEntityIdField(entityType);
      const updatedAt = new Date().toISOString();

      // Create or update translation record
      const translationRecord = {
        [idField]: entityId,
        language,
        translation_status: 'manual',
        reviewed_by: 'test-user-001',
        translated_at: updatedAt,
        ...data,
      };

      addMockRecord(tableName, translationRecord);

      // Update job status if exists
      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const job = jobs.find(
        j => j.entityId === entityId && j.entityType === entityType && j.targetLanguage === language
      );
      if (job) {
        job.status = 'completed';
        job.completedAt = updatedAt;
      }

      return {
        success: true,
        data: {
          entityId,
          language,
          translationStatus: 'manual',
          reviewedBy: 'test-user-001',
          updatedAt,
        },
      };
    },

    async getBatchStatus(request: BatchStatusRequest): Promise<BatchStatusResponse> {
      const results = request.entities.map(entity => {
        const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
        const entityJobs = jobs.filter(j => j.entityId === entity.id && j.entityType === entity.type);

        const hasCompleted = entityJobs.some(j => j.status === 'completed');
        const hasPending = entityJobs.some(j => j.status === 'queued' || j.status === 'processing');
        const hasFailed = entityJobs.some(j => j.status === 'failed');

        let overallStatus: 'complete' | 'partial' | 'pending' | 'failed';
        if (entityJobs.length === 0) {
          overallStatus = 'pending';
        } else if (hasFailed && !hasCompleted && !hasPending) {
          overallStatus = 'failed';
        } else if ((hasFailed || hasPending) && hasCompleted) {
          // Has completed + either failed or pending = partial
          overallStatus = 'partial';
        } else if (hasPending && !hasCompleted) {
          overallStatus = 'pending';
        } else if (hasCompleted && !hasFailed && !hasPending) {
          overallStatus = 'complete';
        } else {
          overallStatus = 'pending';
        }

        return {
          entityType: entity.type,
          entityId: entity.id,
          overallStatus,
        };
      });

      return {
        success: true,
        data: results,
      };
    },

    async getBatchTranslationStatus(request: { entityType: EntityType; entityIds: string[] }) {
      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);

      const statuses = request.entityIds.map(entityId => {
        const entityJobs = jobs.filter(
          j => j.entityId === entityId && j.entityType === request.entityType
        );

        const completedCount = entityJobs.filter(j => j.status === 'completed').length;
        const pendingCount = entityJobs.filter(j => j.status === 'queued' || j.status === 'processing').length;
        const failedCount = entityJobs.filter(j => j.status === 'failed').length;

        let overallStatus: string;
        if (entityJobs.length === 0) {
          overallStatus = 'pending';
        } else if (failedCount > 0 && completedCount === 0 && pendingCount === 0) {
          overallStatus = 'failed';
        } else if (failedCount > 0 && completedCount > 0 && pendingCount === 0) {
          overallStatus = 'partial';
        } else if (pendingCount > 0) {
          overallStatus = completedCount > 0 ? 'partial' : 'pending';
        } else if (completedCount > 0 && pendingCount === 0 && failedCount === 0) {
          overallStatus = 'complete';
        } else {
          overallStatus = 'pending';
        }

        return {
          entityId,
          overallStatus,
          totalJobs: entityJobs.length,
        };
      });

      return {
        success: true,
        data: { statuses },
      };
    },
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function queueTranslationJobs(
  entityType: EntityType,
  entityId: string,
  sourceLanguage: string
): string[] {
  const jobIds: string[] = [];
  const targetLanguages = TARGET_LANGUAGES.filter(lang => lang !== sourceLanguage);

  for (const targetLanguage of targetLanguages) {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const job: TranslationJob = {
      id: jobId,
      entityType,
      entityId,
      sourceLanguage: sourceLanguage as SupportedLanguage,
      targetLanguage,
      status: 'queued',
      priority: 50,
      attempts: 0,
      errorMessage: null,
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      lockedBy: null,
      lockedAt: null,
    };
    addMockRecord(TABLE_NAMES.TRANSLATION_JOBS, job);
    jobIds.push(jobId);
  }

  return jobIds;
}

function deleteExistingTranslationsAndJobs(entityType: EntityType, entityId: string): void {
  // Delete translations
  const tableName = getTranslationTableName(entityType);
  const idField = getEntityIdField(entityType);
  const translations = getTableRecords<Record<string, unknown>>(tableName);
  const remaining = translations.filter(t => t[idField] !== entityId);
  seedMockDatabase(tableName, remaining);

  // Delete existing jobs
  const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
  const remainingJobs = jobs.filter(j => !(j.entityId === entityId && j.entityType === entityType));
  seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, remainingJobs);
}

function getTranslationTableName(entityType: EntityType): string {
  switch (entityType) {
    case 'item': return TABLE_NAMES.ITEM_TRANSLATIONS;
    case 'article': return TABLE_NAMES.ARTICLE_TRANSLATIONS;
    case 'link': return TABLE_NAMES.LINK_TRANSLATIONS;
    case 'tag': return TABLE_NAMES.TAG_TRANSLATIONS;
    default: throw new Error(`Unknown entity type: ${entityType}`);
  }
}

function getEntityIdField(entityType: EntityType): string {
  switch (entityType) {
    case 'item': return 'item_id';
    case 'article': return 'article_id';
    case 'link': return 'link_id';
    case 'tag': return 'tag_key';
    default: throw new Error(`Unknown entity type: ${entityType}`);
  }
}
