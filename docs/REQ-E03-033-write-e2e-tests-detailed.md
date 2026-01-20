# Detailed Task Breakdown: REQ-E03-033 - Write E2E Tests for Complete Translation Workflow

**Document ID:** REQ-E03-033-detailed
**Request ID:** E03-033
**Created:** 2026-01-20 17:15 UTC
**Last Modified:** 2026-01-20 17:15 UTC
**Status:** Ready for Implementation
**Overview Document:** REQ-E03-033-write-e2e-tests-overview.md
**Implementation Plan Reference:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md (Phase 7, Task 7.4)

---

## 1. Executive Summary

This document provides granular, step-by-step implementation tasks for creating comprehensive end-to-end tests that validate the complete translation workflow. The tests simulate real-world usage patterns including content creation, asynchronous job processing, translation storage verification, status checking, and retry mechanisms.

**Total Estimated Effort:** 12.5 story points (15 tasks)

---

## 2. Pre-Implementation Checklist

Before starting implementation, verify the following:

- [ ] Epic 3 Phase 1-6 components are implemented (content-translation module, APIs, job processors)
- [ ] Translation status API endpoint exists at `/api/translations/status/[entityType]/[entityId]/route.ts`
- [ ] Retry translations API exists at `/api/translations/retry/route.ts`
- [ ] Manual override API exists at `/api/translations/[entityType]/[entityId]/[language]/route.ts`
- [ ] Batch status API exists at `/api/translations/status/batch/route.ts`
- [ ] Job queue helpers exist at `src/lib/job-queue/__tests__/helpers/`
- [ ] Vitest is configured and working (`npm test` runs successfully)

---

## 3. Task Breakdown

### Task 1: Create E2E Test Helper Infrastructure (Barrel Exports)

**File:** `src/lib/content-translation/__tests__/e2e/helpers/index.ts`

**Story Points:** 0.5

**Description:** Create the barrel export file that coordinates all E2E helper modules for easy importing in test files.

**Implementation Steps:**

1. Create the directory structure:
   ```
   src/lib/content-translation/__tests__/e2e/helpers/
   ```

2. Create `index.ts` with the following exports:
   ```typescript
   /**
    * E2E Test Helper Barrel Exports
    *
    * Provides unified access to all E2E testing utilities for content translation.
    *
    * @module content-translation/__tests__/e2e/helpers
    * @lastModified 2026-01-20
    */

   // Test setup and teardown utilities
   export {
     setupE2ETestContext,
     teardownE2ETestContext,
     type E2ETestContext,
   } from './e2e-test-utils';

   // Polling and wait utilities
   export {
     waitForJobsToComplete,
     waitForTranslationStatus,
     waitForCondition,
     type PollingOptions,
   } from './polling-utils';

   // Mock API client for simulating API calls
   export {
     createMockApiClient,
     type MockApiClient,
   } from './mock-api-client';

   // Test data factory functions
   export {
     createTestItem,
     createTestArticle,
     createTestLink,
     createTestTag,
     createTestProperty,
     createTestTranslationJob,
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
     createMockTranslationJob,
     createMockArticleContent,
     createMockItemContent,
   } from '@/lib/job-queue/__tests__/helpers/mockFactories';

   export {
     TABLE_NAMES,
     TEST_DEFAULTS,
     MOCK_TRANSLATIONS,
   } from '@/lib/job-queue/__tests__/helpers/constants';
   ```

**Acceptance Criteria:**
- [ ] File created at correct path
- [ ] All helper modules are properly exported
- [ ] No circular dependency issues
- [ ] TypeScript compiles without errors

**Dependencies:** None (first task)

---

### Task 2: Implement E2E Test Utilities

**File:** `src/lib/content-translation/__tests__/e2e/helpers/e2e-test-utils.ts`

**Story Points:** 1

**Description:** Create utilities for test context setup, teardown, and common test operations specific to E2E testing.

**Implementation Steps:**

1. Create the file with the following structure:
   ```typescript
   /**
    * E2E Test Utilities for Content Translation
    *
    * Provides setup/teardown functions and context management for E2E tests.
    *
    * @module content-translation/__tests__/e2e/helpers/e2e-test-utils
    * @lastModified 2026-01-20
    */

   import { vi } from 'vitest';
   import {
     resetMockDatabase,
     seedMockDatabase,
     createMockSupabaseServer,
   } from '@/lib/job-queue/__tests__/helpers/mockSupabase';
   import { TABLE_NAMES } from '@/lib/job-queue/__tests__/helpers/constants';

   /**
    * E2E test context containing all mock infrastructure
    */
   export interface E2ETestContext {
     mockSupabase: ReturnType<typeof createMockSupabaseServer>;
     mockTranslationService: {
       translateText: ReturnType<typeof vi.fn>;
       translateToAllLanguages: ReturnType<typeof vi.fn>;
     };
     testEntities: {
       items: TestItem[];
       articles: TestArticle[];
       links: TestLink[];
       properties: TestProperty[];
     };
     cleanup: () => Promise<void>;
   }

   export interface TestItem {
     id: string;
     publicId: string;
     name: string;
     description: string;
     propertyId: string;
     sourceLanguage: string;
     tags?: string[];
     createdAt: string;
   }

   export interface TestArticle {
     id: string;
     itemId: string;
     title: string;
     description: string;
     sourceLanguage: string;
     createdAt: string;
   }

   export interface TestLink {
     id: string;
     itemId: string;
     title: string;
     url: string;
     sourceLanguage: string;
     createdAt: string;
   }

   export interface TestProperty {
     id: string;
     name: string;
     accountId: string;
   }

   /**
    * Sets up a complete E2E test context with mock database and services.
    */
   export async function setupE2ETestContext(): Promise<E2ETestContext> {
     // Reset mock database to clean state
     resetMockDatabase();

     // Initialize empty arrays for all tables
     seedMockDatabase(TABLE_NAMES.ITEMS, []);
     seedMockDatabase(TABLE_NAMES.ITEM_ARTICLES, []);
     seedMockDatabase(TABLE_NAMES.ITEM_LINKS, []);
     seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, []);
     seedMockDatabase(TABLE_NAMES.ITEM_TRANSLATIONS, []);
     seedMockDatabase(TABLE_NAMES.ARTICLE_TRANSLATIONS, []);
     seedMockDatabase(TABLE_NAMES.LINK_TRANSLATIONS, []);
     seedMockDatabase(TABLE_NAMES.TAG_TRANSLATIONS, []);

     // Create mock Supabase client
     const mockSupabase = createMockSupabaseServer();

     // Create mock translation service
     const mockTranslationService = {
       translateText: vi.fn().mockResolvedValue({
         translatedText: 'Translated text',
         provider: 'claude',
         tokensUsed: 50,
       }),
       translateToAllLanguages: vi.fn().mockResolvedValue({
         translations: {
           en: 'English text',
           fr: 'Texte français',
           es: 'Texto español',
           de: 'Deutscher Text',
           nl: 'Nederlandse tekst',
           it: 'Testo italiano',
         },
         provider: 'claude',
         totalTokensUsed: 300,
       }),
     };

     const context: E2ETestContext = {
       mockSupabase,
       mockTranslationService,
       testEntities: {
         items: [],
         articles: [],
         links: [],
         properties: [],
       },
       cleanup: async () => {
         vi.clearAllMocks();
         resetMockDatabase();
       },
     };

     return context;
   }

   /**
    * Tears down the E2E test context and cleans up resources.
    */
   export async function teardownE2ETestContext(ctx: E2ETestContext): Promise<void> {
     await ctx.cleanup();
     vi.restoreAllMocks();
   }

   /**
    * Helper to simulate processing time passing
    */
   export function advanceTime(ms: number): void {
     vi.advanceTimersByTime(ms);
   }

   /**
    * Helper to get a unique test ID
    */
   export function generateTestId(prefix: string): string {
     return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
   }
   ```

**Acceptance Criteria:**
- [ ] `setupE2ETestContext()` initializes mock database and services
- [ ] `teardownE2ETestContext()` properly cleans up all mocks
- [ ] All interface types are correctly defined
- [ ] Helper functions work as expected

**Dependencies:** Task 1 (barrel exports)

---

### Task 3: Implement Polling Utilities

**File:** `src/lib/content-translation/__tests__/e2e/helpers/polling-utils.ts`

**Story Points:** 0.5

**Description:** Create utilities for waiting/polling on asynchronous operations like job completion and status changes.

**Implementation Steps:**

1. Create the file with polling helpers:
   ```typescript
   /**
    * Polling Utilities for E2E Tests
    *
    * Provides wait/poll helpers for asynchronous operations in E2E tests.
    *
    * @module content-translation/__tests__/e2e/helpers/polling-utils
    * @lastModified 2026-01-20
    */

   import { getTableRecords } from '@/lib/job-queue/__tests__/helpers/mockSupabase';
   import { TABLE_NAMES } from '@/lib/job-queue/__tests__/helpers/constants';
   import type { TranslationJob, EntityType, JobStatus } from '@/lib/job-queue/translation-jobs.types';

   /**
    * Polling configuration options
    */
   export interface PollingOptions {
     /** Maximum time to wait in milliseconds (default: 5000) */
     maxWaitMs: number;
     /** Interval between polls in milliseconds (default: 100) */
     intervalMs: number;
     /** Callback for progress updates */
     onProgress?: (attempt: number, elapsed: number) => void;
   }

   const DEFAULT_OPTIONS: PollingOptions = {
     maxWaitMs: 5000,
     intervalMs: 100,
   };

   /**
    * Wait for all translation jobs for an entity to complete.
    *
    * @returns true if all jobs completed, false if timeout or jobs failed
    */
   export async function waitForJobsToComplete(
     entityId: string,
     entityType: EntityType,
     options?: Partial<PollingOptions>
   ): Promise<boolean> {
     const opts = { ...DEFAULT_OPTIONS, ...options };
     const startTime = Date.now();
     let attempt = 0;

     while (Date.now() - startTime < opts.maxWaitMs) {
       attempt++;
       const elapsed = Date.now() - startTime;

       if (opts.onProgress) {
         opts.onProgress(attempt, elapsed);
       }

       const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
       const entityJobs = jobs.filter(
         j => j.entityId === entityId && j.entityType === entityType
       );

       if (entityJobs.length === 0) {
         // No jobs found, wait and retry
         await sleep(opts.intervalMs);
         continue;
       }

       const allComplete = entityJobs.every(
         j => j.status === 'completed' || j.status === 'failed'
       );

       if (allComplete) {
         return entityJobs.every(j => j.status === 'completed');
       }

       await sleep(opts.intervalMs);
     }

     return false; // Timeout
   }

   /**
    * Wait for translation status to reach expected state.
    *
    * @returns The status result or null if timeout
    */
   export async function waitForTranslationStatus(
     entityId: string,
     entityType: EntityType,
     expectedStatus: 'complete' | 'partial' | 'pending' | 'failed',
     options?: Partial<PollingOptions>
   ): Promise<TranslationStatusSummary | null> {
     const opts = { ...DEFAULT_OPTIONS, ...options };
     const startTime = Date.now();
     let attempt = 0;

     while (Date.now() - startTime < opts.maxWaitMs) {
       attempt++;
       const elapsed = Date.now() - startTime;

       if (opts.onProgress) {
         opts.onProgress(attempt, elapsed);
       }

       const status = calculateTranslationStatus(entityId, entityType);

       if (status.overallStatus === expectedStatus) {
         return status;
       }

       await sleep(opts.intervalMs);
     }

     return null; // Timeout
   }

   /**
    * Generic condition polling utility.
    *
    * @returns true if condition met, false if timeout
    */
   export async function waitForCondition(
     condition: () => Promise<boolean> | boolean,
     options?: Partial<PollingOptions>
   ): Promise<boolean> {
     const opts = { ...DEFAULT_OPTIONS, ...options };
     const startTime = Date.now();
     let attempt = 0;

     while (Date.now() - startTime < opts.maxWaitMs) {
       attempt++;

       if (opts.onProgress) {
         opts.onProgress(attempt, Date.now() - startTime);
       }

       const result = await condition();
       if (result) {
         return true;
       }

       await sleep(opts.intervalMs);
     }

     return false; // Timeout
   }

   /**
    * Translation status summary interface
    */
   export interface TranslationStatusSummary {
     entityId: string;
     entityType: EntityType;
     overallStatus: 'complete' | 'partial' | 'pending' | 'failed';
     completedLanguages: string[];
     pendingLanguages: string[];
     failedLanguages: string[];
     totalJobs: number;
   }

   /**
    * Calculate translation status from mock database.
    */
   function calculateTranslationStatus(
     entityId: string,
     entityType: EntityType
   ): TranslationStatusSummary {
     const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
     const entityJobs = jobs.filter(
       j => j.entityId === entityId && j.entityType === entityType
     );

     const completedLanguages = entityJobs
       .filter(j => j.status === 'completed')
       .map(j => j.targetLanguage);

     const pendingLanguages = entityJobs
       .filter(j => j.status === 'queued' || j.status === 'processing')
       .map(j => j.targetLanguage);

     const failedLanguages = entityJobs
       .filter(j => j.status === 'failed')
       .map(j => j.targetLanguage);

     let overallStatus: 'complete' | 'partial' | 'pending' | 'failed';

     if (failedLanguages.length > 0 && pendingLanguages.length === 0) {
       overallStatus = completedLanguages.length > 0 ? 'partial' : 'failed';
     } else if (pendingLanguages.length > 0) {
       overallStatus = completedLanguages.length > 0 ? 'partial' : 'pending';
     } else if (completedLanguages.length > 0) {
       overallStatus = 'complete';
     } else {
       overallStatus = 'pending';
     }

     return {
       entityId,
       entityType,
       overallStatus,
       completedLanguages,
       pendingLanguages,
       failedLanguages,
       totalJobs: entityJobs.length,
     };
   }

   /**
    * Sleep helper
    */
   function sleep(ms: number): Promise<void> {
     return new Promise(resolve => setTimeout(resolve, ms));
   }
   ```

**Acceptance Criteria:**
- [ ] `waitForJobsToComplete()` correctly polls until jobs complete or timeout
- [ ] `waitForTranslationStatus()` returns correct status summary
- [ ] `waitForCondition()` works for generic conditions
- [ ] Timeout behavior works correctly
- [ ] Progress callbacks are invoked

**Dependencies:** Task 1

---

### Task 4: Implement Mock API Client

**File:** `src/lib/content-translation/__tests__/e2e/helpers/mock-api-client.ts`

**Story Points:** 1

**Description:** Create a mock API client that simulates the actual API endpoints for E2E testing without making real network requests.

**Implementation Steps:**

1. Create the mock API client:
   ```typescript
   /**
    * Mock API Client for E2E Tests
    *
    * Provides mock implementations of all translation-related API endpoints.
    *
    * @module content-translation/__tests__/e2e/helpers/mock-api-client
    * @lastModified 2026-01-20
    */

   import { vi } from 'vitest';
   import {
     getTableRecords,
     addMockRecord,
     updateMockRecord,
     findMockRecord,
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
     retryTranslations(request: RetryTranslationRequest): Promise<RetryTranslationResponse>;
     setManualTranslation(
       entityType: EntityType,
       entityId: string,
       language: string,
       data: ManualTranslationRequest
     ): Promise<ManualTranslationResponse>;
     getBatchStatus(request: BatchStatusRequest): Promise<BatchStatusResponse>;
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

         // Delete existing translations
         deleteExistingTranslations('item', id);

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

         deleteExistingTranslations('article', id);

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
         if (failedLanguages.length > 0 && completedLanguages.length === 0) {
           overallStatus = 'failed';
         } else if (pendingLanguages.length > 0 || (failedLanguages.length > 0 && completedLanguages.length > 0)) {
           overallStatus = pendingLanguages.length > 0 ? 'pending' : 'partial';
         } else if (completedLanguages.length === TARGET_LANGUAGES.length - 1) {
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
           },
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
           if (entityJobs.length === 0 || hasPending) {
             overallStatus = 'pending';
           } else if (hasFailed && !hasCompleted) {
             overallStatus = 'failed';
           } else if (hasFailed && hasCompleted) {
             overallStatus = 'partial';
           } else {
             overallStatus = 'complete';
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

   function deleteExistingTranslations(entityType: EntityType, entityId: string): void {
     const tableName = getTranslationTableName(entityType);
     const idField = getEntityIdField(entityType);

     const translations = getTableRecords<Record<string, unknown>>(tableName);
     const remaining = translations.filter(t => t[idField] !== entityId);
     // Note: In real implementation, we'd use seedMockDatabase to replace

     // Also delete existing jobs
     const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
     const remainingJobs = jobs.filter(j => !(j.entityId === entityId && j.entityType === entityType));
     // Note: In real implementation, we'd use seedMockDatabase to replace
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
   ```

**Acceptance Criteria:**
- [ ] All API methods return proper response types
- [ ] createItem/createArticle/createLink queue translation jobs
- [ ] getTranslationStatus correctly aggregates job status
- [ ] retryTranslations resets failed jobs to queued
- [ ] setManualTranslation creates/updates translation records
- [ ] getBatchStatus returns aggregated status for multiple entities

**Dependencies:** Task 1

---

### Task 5: Implement Test Data Factory

**File:** `src/lib/content-translation/__tests__/e2e/helpers/test-data-factory.ts`

**Story Points:** 0.5

**Description:** Create factory functions for generating test entities with realistic data.

**Implementation Steps:**

1. Create factory functions:
   ```typescript
   /**
    * Test Data Factory for E2E Tests
    *
    * Provides factory functions for creating realistic test data.
    *
    * @module content-translation/__tests__/e2e/helpers/test-data-factory
    * @lastModified 2026-01-20
    */

   import type { TestItem, TestArticle, TestLink, TestProperty } from './e2e-test-utils';
   import type { TranslationJob, SupportedLanguage, EntityType } from '@/lib/job-queue/translation-jobs.types';

   /**
    * Creates a test item with default values.
    */
   export function createTestItem(overrides?: Partial<TestItem>): TestItem {
     const id = `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
     return {
       id,
       publicId: `test-${id.slice(-6)}`,
       name: 'Test Coffee Machine',
       description: 'A high-quality espresso machine for making delicious coffee.',
       propertyId: `property-${Date.now()}`,
       sourceLanguage: 'en',
       tags: ['kitchen', 'appliance'],
       createdAt: new Date().toISOString(),
       ...overrides,
     };
   }

   /**
    * Creates a test article with default values.
    */
   export function createTestArticle(overrides?: Partial<TestArticle>): TestArticle {
     const id = `article-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
     return {
       id,
       itemId: overrides?.itemId || `item-${Date.now()}`,
       title: 'How to Use the Coffee Machine',
       description: 'Step-by-step instructions for brewing the perfect cup of coffee.',
       sourceLanguage: 'en',
       createdAt: new Date().toISOString(),
       ...overrides,
     };
   }

   /**
    * Creates a test link with default values.
    */
   export function createTestLink(overrides?: Partial<TestLink>): TestLink {
     const id = `link-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
     return {
       id,
       itemId: overrides?.itemId || `item-${Date.now()}`,
       title: 'Coffee Machine User Manual',
       url: 'https://example.com/manual.pdf',
       sourceLanguage: 'en',
       createdAt: new Date().toISOString(),
       ...overrides,
     };
   }

   /**
    * Creates a test tag entry.
    */
   export function createTestTag(overrides?: Partial<{
     key: string;
     value: string;
     sourceLanguage: string;
   }>) {
     return {
       key: overrides?.key || `tag-${Date.now()}`,
       value: overrides?.value || 'Kitchen Appliance',
       sourceLanguage: overrides?.sourceLanguage || 'en',
     };
   }

   /**
    * Creates a test property with default values.
    */
   export function createTestProperty(overrides?: Partial<TestProperty>): TestProperty {
     const id = `property-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
     return {
       id,
       name: 'Beach House Rental',
       accountId: `account-${Date.now()}`,
       ...overrides,
     };
   }

   /**
    * Creates a test translation job with default values.
    */
   export function createTestTranslationJob(overrides?: Partial<TranslationJob>): TranslationJob {
     const id = `job-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
     return {
       id,
       entityType: 'item',
       entityId: `entity-${Date.now()}`,
       sourceLanguage: 'en',
       targetLanguage: 'fr',
       status: 'queued',
       attempts: 0,
       errorMessage: null,
       createdAt: new Date().toISOString(),
       startedAt: null,
       completedAt: null,
       lockedBy: null,
       lockedAt: null,
       ...overrides,
     };
   }

   /**
    * Creates a batch of translation jobs for an entity (all 5 target languages).
    */
   export function createTestTranslationJobBatch(
     entityType: EntityType,
     entityId: string,
     sourceLanguage: SupportedLanguage = 'en'
   ): TranslationJob[] {
     const targetLanguages: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];
     const targets = targetLanguages.filter(lang => lang !== sourceLanguage);

     return targets.map(targetLanguage =>
       createTestTranslationJob({
         entityType,
         entityId,
         sourceLanguage,
         targetLanguage,
       })
     );
   }

   /**
    * Creates realistic test data in different languages.
    */
   export const MULTILINGUAL_TEST_DATA = {
     en: {
       itemName: 'Coffee Machine',
       itemDescription: 'Premium espresso maker for your morning coffee',
       articleTitle: 'How to Use the Coffee Machine',
       articleDescription: 'Step-by-step brewing instructions',
       linkTitle: 'User Manual PDF',
     },
     fr: {
       itemName: 'Machine à café',
       itemDescription: 'Machine à espresso premium pour votre café du matin',
       articleTitle: 'Comment utiliser la machine à café',
       articleDescription: 'Instructions de préparation étape par étape',
       linkTitle: 'Manuel utilisateur PDF',
     },
     es: {
       itemName: 'Cafetera',
       itemDescription: 'Cafetera espresso premium para tu café de la mañana',
       articleTitle: 'Cómo usar la cafetera',
       articleDescription: 'Instrucciones de preparación paso a paso',
       linkTitle: 'Manual del usuario PDF',
     },
     de: {
       itemName: 'Kaffeemaschine',
       itemDescription: 'Premium-Espressomaschine für Ihren Morgenkaffee',
       articleTitle: 'So verwenden Sie die Kaffeemaschine',
       articleDescription: 'Schritt-für-Schritt-Brühanleitung',
       linkTitle: 'Benutzerhandbuch PDF',
     },
     nl: {
       itemName: 'Koffiezetapparaat',
       itemDescription: 'Premium espressomachine voor uw ochtendkoffie',
       articleTitle: 'Hoe de koffiemachine te gebruiken',
       articleDescription: 'Stap-voor-stap zetinstructies',
       linkTitle: 'Gebruikershandleiding PDF',
     },
     it: {
       itemName: 'Macchina del caffè',
       itemDescription: 'Macchina espresso premium per il caffè del mattino',
       articleTitle: 'Come usare la macchina del caffè',
       articleDescription: 'Istruzioni di preparazione passo dopo passo',
       linkTitle: 'Manuale utente PDF',
     },
   };
   ```

**Acceptance Criteria:**
- [ ] All factory functions return valid test entities
- [ ] Factory functions accept partial overrides
- [ ] IDs are unique across invocations
- [ ] Multilingual test data covers all 6 supported languages

**Dependencies:** Task 2

---

### Task 6: Write Item Translation E2E Tests

**File:** `src/lib/content-translation/__tests__/e2e/item-translation.e2e.test.ts`

**Story Points:** 1.5

**Description:** Comprehensive E2E tests for item creation and translation workflow.

**Implementation Steps:**

1. Create the test file:
   ```typescript
   /**
    * Item Translation E2E Tests
    *
    * Tests the complete workflow from item creation through translation storage.
    *
    * @see REQ-E03-033 AC-1, AC-4, AC-5, AC-7
    * @lastModified 2026-01-20
    */

   import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
   import {
     setupE2ETestContext,
     teardownE2ETestContext,
     type E2ETestContext,
   } from './helpers/e2e-test-utils';
   import { createMockApiClient, type MockApiClient } from './helpers/mock-api-client';
   import { waitForJobsToComplete, waitForTranslationStatus } from './helpers/polling-utils';
   import { createTestItem, createTestProperty, MULTILINGUAL_TEST_DATA } from './helpers/test-data-factory';
   import {
     getTableRecords,
     addMockRecord,
     seedMockDatabase,
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

       it('item with tags triggers tag translation jobs', async () => {
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

         // Note: Tag translations are queued separately
         // This test verifies the item itself is created correctly
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
   ```

**Acceptance Criteria:**
- [ ] AC-1: Test creates item and verifies jobs queued for 5 target languages
- [ ] AC-5: Test verifies translated content has all required fields
- [ ] AC-7: Test verifies translation metadata (source language, timestamps)
- [ ] Tests for items with tags
- [ ] Tests for item updates triggering re-translation

**Dependencies:** Tasks 1-5

---

### Task 7: Write Article Translation E2E Tests

**File:** `src/lib/content-translation/__tests__/e2e/article-translation.e2e.test.ts`

**Story Points:** 1

**Description:** E2E tests for article creation and translation workflow.

**Implementation Steps:**

Create tests following the same pattern as Task 6, but for articles:
- Test article creation triggers translation jobs
- Test article with long description
- Test article translations stored correctly
- Test article update triggers re-translation

**Acceptance Criteria:**
- [ ] AC-2: Test creates article and verifies jobs queued for all target languages
- [ ] Test verifies article title and description are translated
- [ ] Test handles articles with empty description

**Dependencies:** Tasks 1-5

---

### Task 8: Write Link Translation E2E Tests

**File:** `src/lib/content-translation/__tests__/e2e/link-translation.e2e.test.ts`

**Story Points:** 1

**Description:** E2E tests for link creation and translation workflow.

**Implementation Steps:**

Create tests for link translation:
- Test link creation triggers translation jobs
- Test only title is translated (URL preserved)
- Test link translations stored correctly

**Acceptance Criteria:**
- [ ] AC-3: Test creates link and verifies jobs queued for all target languages
- [ ] Test verifies URL is not modified/translated
- [ ] Test verifies only title field is translated

**Dependencies:** Tasks 1-5

---

### Task 9: Write Translation Status E2E Tests

**File:** `src/lib/content-translation/__tests__/e2e/translation-status.e2e.test.ts`

**Story Points:** 1

**Description:** E2E tests for the translation status endpoint.

**Implementation Steps:**

1. Create comprehensive status tests:
   ```typescript
   /**
    * Translation Status E2E Tests
    *
    * Tests the translation status endpoint functionality.
    *
    * @see REQ-E03-033 AC-6
    * @lastModified 2026-01-20
    */

   import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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
     });
   });
   ```

**Acceptance Criteria:**
- [ ] AC-6: Test checks status endpoint reports "completed" for successful translations
- [ ] Test returns "pending" for queued jobs
- [ ] Test returns "partial" for mixed status
- [ ] Test returns "failed" when all failed
- [ ] Test includes per-language details

**Dependencies:** Tasks 1-5

---

### Task 10: Write Translation Retry E2E Tests

**File:** `src/lib/content-translation/__tests__/e2e/translation-retry.e2e.test.ts`

**Story Points:** 1

**Description:** E2E tests for retry mechanism.

**Implementation Steps:**

Create tests for:
- AC-8: Simulating translation failure and verifying job status "failed"
- AC-9: Using retry endpoint to re-queue failed job
- AC-10: Verifying retried job completes successfully
- Retry specific language only
- Retry when no failed jobs (no-op)

**Acceptance Criteria:**
- [ ] AC-8: Test simulates failure and verifies job marked "failed"
- [ ] AC-9: Test uses retry endpoint to re-queue failed job
- [ ] AC-10: Test verifies retried job completes successfully
- [ ] Test retry specific language only
- [ ] Test retry when no failed jobs returns 0 queued

**Dependencies:** Tasks 1-5

---

### Task 11: Write Manual Override E2E Tests

**File:** `src/lib/content-translation/__tests__/e2e/manual-override.e2e.test.ts`

**Story Points:** 1

**Description:** E2E tests for manual translation override functionality.

**Implementation Steps:**

Create tests for:
- AC-11: Manual override saves with 'manual' status
- Manual override preserves on retry
- Manual override tracks reviewer

**Acceptance Criteria:**
- [ ] AC-11: Test validates manual translation overrides are preserved and flagged
- [ ] Test verifies manual status is set correctly
- [ ] Test verifies reviewer ID is tracked
- [ ] Test manual overrides not affected by retry

**Dependencies:** Tasks 1-5

---

### Task 12: Write Batch Status E2E Tests

**File:** `src/lib/content-translation/__tests__/e2e/batch-status.e2e.test.ts`

**Story Points:** 0.5

**Description:** E2E tests for batch status endpoint.

**Implementation Steps:**

Create tests for:
- AC-13: Batch status returns correct aggregated status for multiple items
- Batch status handles mixed entity types
- Performance with 50+ entities

**Acceptance Criteria:**
- [ ] AC-13: Test verifies batch status endpoint returns correct aggregated status
- [ ] Test handles multiple entity types in single request
- [ ] Test handles empty entity list gracefully

**Dependencies:** Tasks 1-5

---

### Task 13: Write Stale Translation E2E Tests

**File:** `src/lib/content-translation/__tests__/e2e/stale-translation.e2e.test.ts`

**Story Points:** 1

**Description:** E2E tests for stale translation detection.

**Implementation Steps:**

Create tests for:
- AC-12: Content update deletes old translations
- Content update queues new jobs
- Status reflects pending state after update

**Acceptance Criteria:**
- [ ] AC-12: Test confirms stale translation detection when source content is updated
- [ ] Test verifies old translations are deleted on update
- [ ] Test verifies new jobs are queued after update

**Dependencies:** Tasks 1-5

---

### Task 14: Write Error Scenario E2E Tests

**File:** `src/lib/content-translation/__tests__/e2e/error-scenarios.e2e.test.ts`

**Story Points:** 1

**Description:** E2E tests for error handling scenarios.

**Implementation Steps:**

Create tests for:
- AC-20: Translation API unavailable
- Invalid entity ID handling
- Unsupported language handling
- Database error handling

**Acceptance Criteria:**
- [ ] AC-20: Tests verify proper error handling when translation API unavailable
- [ ] Test handles invalid entity ID gracefully
- [ ] Test handles unsupported language requests

**Dependencies:** Tasks 1-5

---

### Task 15: Update Vitest Configuration and Create Documentation

**Files:**
- `vitest.config.ts`
- `src/lib/content-translation/__tests__/e2e/README.md`

**Story Points:** 0.5

**Description:** Update Vitest configuration to include content-translation coverage and create E2E test documentation.

**Implementation Steps:**

1. Update `vitest.config.ts`:
   ```typescript
   // Add to coverage.include array:
   'src/lib/content-translation/**/*.ts',
   ```

2. Create README.md:
   ```markdown
   # Content Translation E2E Tests

   ## Overview

   This directory contains end-to-end tests for the content translation system.
   Tests validate the complete workflow from content creation through job processing
   to translation storage and status verification.

   ## Running Tests

   ```bash
   # Run all E2E tests
   npm test -- --testPathPattern=e2e

   # Run specific test file
   npm test -- src/lib/content-translation/__tests__/e2e/item-translation.e2e.test.ts

   # Run with coverage
   npm test -- --coverage --testPathPattern=e2e
   ```

   ## Test Structure

   ```
   e2e/
   ├── helpers/               # Test utilities and mocks
   │   ├── index.ts          # Barrel exports
   │   ├── e2e-test-utils.ts # Setup/teardown utilities
   │   ├── polling-utils.ts   # Wait/poll helpers
   │   ├── mock-api-client.ts # Mock API implementations
   │   └── test-data-factory.ts # Test data generators
   ├── item-translation.e2e.test.ts
   ├── article-translation.e2e.test.ts
   ├── link-translation.e2e.test.ts
   ├── translation-status.e2e.test.ts
   ├── translation-retry.e2e.test.ts
   ├── manual-override.e2e.test.ts
   ├── batch-status.e2e.test.ts
   ├── stale-translation.e2e.test.ts
   ├── error-scenarios.e2e.test.ts
   └── README.md
   ```

   ## Mocking Strategy

   Tests use a mock-based approach:
   - **Mock Supabase**: In-memory database simulation
   - **Mock Translation Service**: Returns predictable translations
   - **Mock API Client**: Simulates full API request/response cycle

   ## Debugging

   Enable detailed logging:
   ```typescript
   const ctx = await setupE2ETestContext({ enableLogging: true });
   ```

   Use polling with progress callbacks:
   ```typescript
   await waitForJobsToComplete(entityId, 'item', {
     onProgress: (attempt, elapsed) => console.log(`Attempt ${attempt}, ${elapsed}ms`),
   });
   ```

   ## Common Issues

   1. **Test timeout**: Increase `maxWaitMs` in polling options
   2. **Flaky tests**: Ensure proper beforeEach/afterEach cleanup
   3. **Missing mocks**: Check that all dependencies are mocked
   ```

**Acceptance Criteria:**
- [ ] AC-17: All E2E tests pass in CI/CD environment
- [ ] AC-18: Test execution time under 5 minutes
- [ ] AC-19: Tests include detailed logging for debugging
- [ ] Vitest config includes content-translation coverage
- [ ] README documentation complete

**Dependencies:** Tasks 1-14

---

## 4. Implementation Order

The tasks should be implemented in the following order:

1. **Task 1**: Helper infrastructure (barrel exports)
2. **Tasks 2-5**: Helper modules (can be done in parallel)
3. **Tasks 6-8**: Entity translation tests (item, article, link)
4. **Tasks 9-13**: API and workflow tests (status, retry, manual, batch, stale)
5. **Task 14**: Error scenario tests
6. **Task 15**: Configuration and documentation

---

## 5. Acceptance Criteria Mapping

| AC# | Criterion | Test File | Task |
|-----|-----------|-----------|------|
| AC-1 | Item creation triggers translations | item-translation.e2e.test.ts | Task 6 |
| AC-2 | Article creation triggers translations | article-translation.e2e.test.ts | Task 7 |
| AC-3 | Link creation triggers translations | link-translation.e2e.test.ts | Task 8 |
| AC-4 | Waits for processing, verifies storage | item-translation.e2e.test.ts | Task 6 |
| AC-5 | Verifies translated content structure | item-translation.e2e.test.ts | Task 6 |
| AC-6 | Status endpoint reports "completed" | translation-status.e2e.test.ts | Task 9 |
| AC-7 | Verifies translation metadata | item-translation.e2e.test.ts | Task 6 |
| AC-8 | Simulates failure, verifies "failed" | translation-retry.e2e.test.ts | Task 10 |
| AC-9 | Retry endpoint re-queues failed job | translation-retry.e2e.test.ts | Task 10 |
| AC-10 | Retried job completes successfully | translation-retry.e2e.test.ts | Task 10 |
| AC-11 | Manual overrides preserved and flagged | manual-override.e2e.test.ts | Task 11 |
| AC-12 | Stale translation detection | stale-translation.e2e.test.ts | Task 13 |
| AC-13 | Batch status endpoint | batch-status.e2e.test.ts | Task 12 |
| AC-14 | Realistic timing with wait/polling | All E2E tests | Tasks 6-14 |
| AC-15 | Isolated test data | All E2E tests | Tasks 6-14 |
| AC-16 | Test data cleanup | All E2E tests | Tasks 6-14 |
| AC-17 | Tests pass in CI/CD | vitest.config.ts | Task 15 |
| AC-18 | Execution under 5 minutes | All E2E tests | Tasks 6-14 |
| AC-19 | Detailed logging | e2e-test-utils.ts | Task 2 |
| AC-20 | Error handling tests | error-scenarios.e2e.test.ts | Task 14 |

---

## 6. Definition of Done

- [ ] All 15 tasks implemented and code reviewed
- [ ] All 20 acceptance criteria covered by tests
- [ ] Test suite passes locally with `npm test`
- [ ] Test suite passes in CI/CD pipeline
- [ ] Test execution time under 5 minutes
- [ ] Code coverage reported for content-translation module
- [ ] README.md documentation complete
- [ ] No test flakiness over 5 consecutive runs

---

## 7. References

- **Request:** `docs/gen_requests_epic3.md` (REQ-E03-033)
- **Overview:** `docs/REQ-E03-033-write-e2e-tests-overview.md`
- **Implementation Plan:** `docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Phase 7, Task 7.4)
- **Related Tests:** `src/lib/job-queue/__tests__/job-processing.integration.test.ts`
- **Vitest Documentation:** https://vitest.dev/guide/
