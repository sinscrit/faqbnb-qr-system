# REQ-365: Write End-to-End Tests for Translation Workflows - Detailed Task Breakdown

**Generated:** 2026-01-19 16:45:00 UTC
**Last Modified:** 2026-01-19 16:45:00 UTC
**Request Reference:** REQ-365 in `/docs/gen_requests_epic3.md`
**Overview Document:** `/docs/REQ-365-write-e2e-tests-overview.md`
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
**Phase:** 7 - Testing & Validation
**Task ID:** 7.4
**Size:** L (Large)
**Type:** ENHANCEMENT

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Prerequisites Checklist](#prerequisites-checklist)
3. [Task Breakdown](#task-breakdown)
4. [Implementation Details](#implementation-details)
5. [Acceptance Criteria Mapping](#acceptance-criteria-mapping)
6. [Testing Verification](#testing-verification)
7. [Rollback Plan](#rollback-plan)

---

## Executive Summary

This document provides granular, actionable tasks for implementing comprehensive end-to-end tests that validate the complete translation workflow from content creation through background job processing to final translation storage and status verification. The E2E tests ensure that all translation system components work correctly as an integrated system.

**Total Estimated Effort:** 8.75 story points (approximately 2-3 days)
**Risk Level:** Medium (timing-sensitive tests require careful wait strategies)

---

## Prerequisites Checklist

Before starting implementation, verify all prerequisites are met:

| Prerequisite | Verification Command/Location | Expected Result |
|--------------|------------------------------|-----------------|
| Content translation module exists | `ls src/lib/content-translation/` | Directory exists with orchestrator, types, triggers, storage |
| Items API has translation triggers | `grep -n "queueContentTranslations" src/app/api/admin/items/route.ts` | Translation trigger calls found |
| Articles API has translation triggers | `grep -n "queueContentTranslations" src/app/api/admin/articles/route.ts` | Translation trigger calls found |
| Translation status endpoint exists | `ls src/app/api/translations/status/` | Route directory exists |
| Retry endpoint exists | `ls src/app/api/translations/retry/route.ts` | File exists |
| Job processor exists | `ls src/lib/job-queue/job-processor.ts` | File exists |
| Integration tests completed | `ls src/lib/job-queue/__tests__/` | Test files exist |
| Vitest configured | `cat vitest.config.ts` | Vitest config present |

---

## Task Breakdown

### Phase 1: Test Infrastructure Setup

#### Task 7.4.1: Create E2E Test Directory Structure
**Story Points:** 0.25
**Dependencies:** None
**Priority:** P0 (Blocking)

**Description:**
Create the directory structure for E2E translation tests following the project's established patterns.

**File Operations:**

1. **Create directory:** `src/__tests__/e2e/translations/`
2. **Create directory:** `src/__tests__/e2e/translations/helpers/`

**Verification:**
```bash
ls -la src/__tests__/e2e/translations/
ls -la src/__tests__/e2e/translations/helpers/
```

---

#### Task 7.4.2: Implement Test Environment Setup/Teardown
**Story Points:** 0.5
**Dependencies:** 7.4.1
**Priority:** P0 (Blocking)

**Description:**
Create test environment utilities for setup and teardown that ensure isolated test execution.

**File to Create:** `src/__tests__/e2e/translations/helpers/testEnvironment.ts`

**Implementation Requirements:**

```typescript
/**
 * E2E Test Environment Setup and Teardown
 *
 * Provides isolated test environment for translation E2E tests.
 * Handles database setup, cleanup, and test data seeding.
 *
 * @module __tests__/e2e/translations/helpers/testEnvironment
 * @lastModified 2026-01-19 (REQ-365)
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

// Test environment configuration
export interface TestEnvironmentConfig {
  /** Unique identifier for this test run */
  testRunId: string;
  /** Test account ID to use */
  testAccountId: string;
  /** Test property ID to use */
  testPropertyId: string;
  /** Supabase client for direct DB access */
  supabase: ReturnType<typeof createClient<Database>>;
}

/**
 * Sets up isolated test environment.
 * Seeds necessary test data (supported languages, test account, test property).
 * Returns configuration object for use in tests.
 */
export async function setupTestEnvironment(): Promise<TestEnvironmentConfig>;

/**
 * Tears down test environment.
 * Cleans up all test data created during test run.
 * Uses testRunId to identify data to delete.
 */
export async function teardownTestEnvironment(config: TestEnvironmentConfig): Promise<void>;

/**
 * Creates a test account for E2E testing.
 * Account name includes testRunId for easy cleanup.
 */
export async function createTestAccount(config: TestEnvironmentConfig): Promise<string>;

/**
 * Creates a test property for E2E testing.
 * Property name includes testRunId for easy cleanup.
 */
export async function createTestProperty(
  config: TestEnvironmentConfig,
  accountId: string
): Promise<string>;

/**
 * Resets database state between tests.
 * Cleans up items, articles, links, translation jobs, and translations.
 * Preserves seed data and test account/property.
 */
export async function resetTestState(config: TestEnvironmentConfig): Promise<void>;
```

**Key Implementation Details:**
- Use `SUPABASE_SERVICE_ROLE_KEY` for bypassing RLS in tests
- Generate unique `testRunId` using format: `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
- Prefix all test data names with `[E2E-TEST]` for easy identification
- Cleanup should use DELETE with WHERE clauses matching testRunId pattern
- Handle cleanup failures gracefully (log but don't fail tests)

**Verification:**
- Unit test that setup creates expected records
- Unit test that teardown removes all test data
- Verify no leftover test data after test run

---

#### Task 7.4.3: Create Mock Translation Service for E2E
**Story Points:** 0.5
**Dependencies:** 7.4.1
**Priority:** P0 (Blocking)

**Description:**
Create a configurable mock translation service that provides deterministic, predictable translations for E2E tests.

**File to Create:** `src/__tests__/e2e/translations/helpers/mockTranslationService.ts`

**Implementation Requirements:**

```typescript
/**
 * Mock Translation Service for E2E Tests
 *
 * Provides deterministic mock translations for E2E testing.
 * Can be configured to simulate success, failure, or specific behaviors.
 *
 * @module __tests__/e2e/translations/helpers/mockTranslationService
 * @lastModified 2026-01-19 (REQ-365)
 */

import type { SupportedLanguage } from '@/lib/i18n/config';

// Configuration interface
export interface MockTranslationServiceConfig {
  /** Default behavior for all translations */
  defaultBehavior: 'success' | 'failure';
  /** Entity-specific overrides (entityId -> behavior) */
  entityOverrides?: Map<string, 'success' | 'failure'>;
  /** Simulated processing delay in milliseconds */
  processingDelayMs?: number;
  /** Error message when failing */
  errorMessage?: string;
  /** Custom translation function (for specific test scenarios) */
  customTranslator?: (text: string, targetLanguage: SupportedLanguage) => string;
}

// Mock state management
let mockConfig: MockTranslationServiceConfig = {
  defaultBehavior: 'success',
  processingDelayMs: 100,
};

/**
 * Configures the mock translation service.
 */
export function configureMockTranslationService(config: Partial<MockTranslationServiceConfig>): void;

/**
 * Configures mock for successful translations.
 * Translations return deterministic text: `[TRANSLATED-{lang}] {original}`
 */
export function configureMockForSuccess(): void;

/**
 * Configures mock for failed translations.
 * All translation attempts will fail with the specified error message.
 */
export function configureMockForFailure(errorMessage?: string): void;

/**
 * Sets entity-specific behavior override.
 * Useful for testing partial failures.
 */
export function setEntityBehavior(entityId: string, behavior: 'success' | 'failure'): void;

/**
 * Resets mock translation service to default state.
 * Call this in beforeEach() to ensure clean state.
 */
export function resetMockTranslationService(): void;

/**
 * Gets the current mock configuration.
 * Useful for debugging test setup.
 */
export function getMockConfig(): Readonly<MockTranslationServiceConfig>;

/**
 * Default translation function that creates deterministic output.
 * Format: [TRANSLATED-{lang}] {original text}
 */
export function defaultMockTranslator(text: string, targetLanguage: SupportedLanguage): string;
```

**Key Implementation Details:**
- Mock should be injectable via Jest/Vitest mocking
- Default successful translation format: `[TRANSLATED-{lang}] {originalText}`
- Failure mode should throw specific error types matching real service
- Processing delay should be configurable but default to 100ms
- Support partial failures (some languages succeed, some fail)
- Track call count for verification in tests

**Verification:**
- Test that configureMockForSuccess returns expected translations
- Test that configureMockForFailure throws expected errors
- Test that entityOverrides work correctly
- Test that reset clears all configuration

---

#### Task 7.4.4: Implement API Client Utilities
**Story Points:** 0.5
**Dependencies:** 7.4.1
**Priority:** P0 (Blocking)

**Description:**
Create HTTP client utilities for making API calls during E2E tests.

**File to Create:** `src/__tests__/e2e/translations/helpers/apiClient.ts`

**Implementation Requirements:**

```typescript
/**
 * API Client Utilities for E2E Tests
 *
 * Provides typed HTTP client for interacting with API endpoints during E2E tests.
 *
 * @module __tests__/e2e/translations/helpers/apiClient
 * @lastModified 2026-01-19 (REQ-365)
 */

import type { EntityType } from '@/lib/content-translation/content-translation.types';
import type { SupportedLanguage } from '@/lib/i18n/config';

// Request/Response types
export interface CreateItemRequest {
  publicId: string;
  name: string;
  description?: string;
  propertyId: string;
  tags?: string[];
  sourceLanguage?: SupportedLanguage;
}

export interface CreateItemResponse {
  success: boolean;
  data: {
    id: string;
    publicId: string;
    name: string;
    description?: string;
    createdAt: string;
  };
  translationJobIds?: string[];
  error?: string;
}

export interface CreateArticleRequest {
  itemId: string;
  title: string;
  description?: string;
  sourceLanguage?: SupportedLanguage;
}

export interface CreateArticleResponse {
  success: boolean;
  data: {
    id: string;
    title: string;
    description?: string;
    createdAt: string;
  };
  translationJobIds?: string[];
  error?: string;
}

export interface CreateLinkRequest {
  url: string;
  title: string;
  linkType: string;
  sourceLanguage?: SupportedLanguage;
}

export interface CreateLinkResponse {
  success: boolean;
  data: {
    id: string;
    url: string;
    title: string;
    createdAt: string;
  };
  translationJobIds?: string[];
  error?: string;
}

export interface TranslationStatusResponse {
  success: boolean;
  data: {
    entityId: string;
    entityType: EntityType;
    sourceLanguage: SupportedLanguage;
    overallStatus: 'complete' | 'partial' | 'pending' | 'failed';
    translations: Record<SupportedLanguage, {
      status: 'pending' | 'completed' | 'failed' | 'manual';
      translatedAt?: string;
      error?: string;
    }>;
  };
  error?: string;
}

export interface BatchStatusRequest {
  entities: Array<{ type: EntityType; id: string }>;
}

export interface BatchStatusResponse {
  success: boolean;
  data: Array<TranslationStatusResponse['data']>;
  error?: string;
}

export interface RetryTranslationRequest {
  entityType: EntityType;
  entityId: string;
  languages?: SupportedLanguage[];
}

export interface RetryTranslationResponse {
  success: boolean;
  jobsQueued: number;
  queuedLanguages: SupportedLanguage[];
  error?: string;
}

// API Client interface
export interface ApiClient {
  /** Create an item via POST /api/admin/items */
  createItem(data: CreateItemRequest): Promise<CreateItemResponse>;

  /** Create an article via POST /api/admin/articles */
  createArticle(data: CreateArticleRequest): Promise<CreateArticleResponse>;

  /** Create a link via POST /api/admin/items/[id]/links */
  createLink(itemId: string, data: CreateLinkRequest): Promise<CreateLinkResponse>;

  /** Get translation status via GET /api/translations/status/[entityType]/[entityId] */
  getTranslationStatus(entityType: EntityType, entityId: string): Promise<TranslationStatusResponse>;

  /** Get batch translation status via POST /api/translations/status/batch */
  getBatchStatus(request: BatchStatusRequest): Promise<BatchStatusResponse>;

  /** Retry failed translations via POST /api/translations/retry */
  retryFailedTranslations(request: RetryTranslationRequest): Promise<RetryTranslationResponse>;
}

/**
 * Creates an API client instance.
 * @param baseUrl - Base URL for API calls (default: process.env.TEST_API_URL || 'http://localhost:3000')
 * @param authToken - Auth token for authenticated requests
 */
export function createApiClient(baseUrl?: string, authToken?: string): ApiClient;
```

**Key Implementation Details:**
- Use native `fetch` for HTTP calls
- Include proper error handling with typed error responses
- Set appropriate headers (Content-Type, Authorization)
- Handle non-2xx responses gracefully
- Support configurable base URL for different test environments
- Include request/response logging for debugging (conditional on env var)

**Verification:**
- Test that createItem returns expected response structure
- Test that error responses are properly typed
- Test that auth token is correctly included

---

#### Task 7.4.5: Implement Database Verification Helpers
**Story Points:** 0.5
**Dependencies:** 7.4.1
**Priority:** P0 (Blocking)

**Description:**
Create database helper utilities for directly verifying database state in E2E tests.

**File to Create:** `src/__tests__/e2e/translations/helpers/databaseHelpers.ts`

**Implementation Requirements:**

```typescript
/**
 * Database Verification Helpers for E2E Tests
 *
 * Provides direct database access for verifying state in E2E tests.
 * Uses service role to bypass RLS.
 *
 * @module __tests__/e2e/translations/helpers/databaseHelpers
 * @lastModified 2026-01-19 (REQ-365)
 */

import type { Database } from '@/lib/supabase';
import type { EntityType } from '@/lib/content-translation/content-translation.types';
import type { SupportedLanguage } from '@/lib/i18n/config';

// Type definitions
export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface TranslationJob {
  id: string;
  entityType: EntityType;
  entityId: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  status: JobStatus;
  priority: number;
  attempts: number;
  errorMessage?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface StoredTranslation {
  id: string;
  entityId: string;
  language: SupportedLanguage;
  translatedFields: Record<string, string>;
  translationStatus: 'pending' | 'completed' | 'failed' | 'manual';
  translatedAt?: string;
  reviewedBy?: string;
}

/**
 * Gets translation jobs for an entity directly from database.
 */
export async function getTranslationJobs(
  entityType: EntityType,
  entityId: string
): Promise<TranslationJob[]>;

/**
 * Gets translation jobs by status.
 */
export async function getTranslationJobsByStatus(
  status: JobStatus,
  limit?: number
): Promise<TranslationJob[]>;

/**
 * Gets a specific translation job by ID.
 */
export async function getTranslationJobById(jobId: string): Promise<TranslationJob | null>;

/**
 * Gets stored translations for an entity from the appropriate translations table.
 * Returns a map of language -> translation record.
 */
export async function getStoredTranslations(
  entityType: EntityType,
  entityId: string
): Promise<Map<SupportedLanguage, StoredTranslation>>;

/**
 * Checks if translations exist for all specified languages.
 */
export async function hasTranslationsForLanguages(
  entityType: EntityType,
  entityId: string,
  languages: SupportedLanguage[]
): Promise<boolean>;

/**
 * Gets item by ID for verification.
 */
export async function getItemById(itemId: string): Promise<{
  id: string;
  name: string;
  description?: string;
  sourceLanguage: SupportedLanguage;
} | null>;

/**
 * Gets article by ID for verification.
 */
export async function getArticleById(articleId: string): Promise<{
  id: string;
  title: string;
  description?: string;
  sourceLanguage: SupportedLanguage;
} | null>;

/**
 * Gets link by ID for verification.
 */
export async function getLinkById(linkId: string): Promise<{
  id: string;
  title: string;
  url: string;
  sourceLanguage: SupportedLanguage;
} | null>;

/**
 * Cleans up test data created during E2E tests.
 * Uses testRunId pattern to identify test data.
 */
export async function cleanupTestData(testRunId: string): Promise<void>;

/**
 * Seeds necessary test data (supported languages table, etc).
 */
export async function seedTestData(): Promise<void>;
```

**Key Implementation Details:**
- Use Supabase service role client for bypassing RLS
- Query the correct table based on entityType (item_translations, article_translations, etc.)
- Return properly typed data matching the interface
- Handle missing records gracefully (return null/empty)
- Include proper error logging for debugging

**Verification:**
- Test that getTranslationJobs returns correct structure
- Test that getStoredTranslations maps to correct table
- Test that cleanup removes all test data

---

### Phase 2: Wait Strategy Utilities

#### Task 7.4.6: Implement Polling-Based Wait Strategies
**Story Points:** 0.5
**Dependencies:** 7.4.2, 7.4.5
**Priority:** P0 (Blocking)

**Description:**
Create robust polling-based wait utilities to handle asynchronous operations in E2E tests.

**File to Create:** `src/__tests__/e2e/translations/helpers/waitStrategies.ts`

**Implementation Requirements:**

```typescript
/**
 * Wait Strategy Utilities for E2E Tests
 *
 * Provides polling-based wait utilities for handling async operations.
 * Avoids flaky tests by using proper polling instead of fixed delays.
 *
 * @module __tests__/e2e/translations/helpers/waitStrategies
 * @lastModified 2026-01-19 (REQ-365)
 */

import type { EntityType } from '@/lib/content-translation/content-translation.types';
import type { SupportedLanguage } from '@/lib/i18n/config';
import type { JobStatus, TranslationJob, StoredTranslation } from './databaseHelpers';
import type { TranslationStatusResponse } from './apiClient';

// Configuration interface
export interface WaitOptions {
  /** Maximum time to wait in milliseconds (default: 30000) */
  timeoutMs?: number;
  /** Interval between polling attempts in milliseconds (default: 500) */
  pollIntervalMs?: number;
  /** Custom error message on timeout */
  timeoutMessage?: string;
}

// Default options
const DEFAULT_WAIT_OPTIONS: Required<WaitOptions> = {
  timeoutMs: 30000,
  pollIntervalMs: 500,
  timeoutMessage: 'Wait condition not met within timeout',
};

/**
 * Generic wait function that polls until condition is true.
 * @throws Error if timeout is reached before condition is met
 */
export async function waitFor(
  condition: () => Promise<boolean>,
  options?: WaitOptions
): Promise<void>;

/**
 * Waits for all translation jobs for an entity to reach expected status.
 * @returns The translation jobs when all have reached the expected status
 */
export async function waitForJobStatus(
  entityType: EntityType,
  entityId: string,
  expectedStatus: JobStatus,
  options?: WaitOptions
): Promise<TranslationJob[]>;

/**
 * Waits for at least one job to reach the expected status.
 * Useful for partial completion checks.
 */
export async function waitForAnyJobStatus(
  entityType: EntityType,
  entityId: string,
  expectedStatus: JobStatus,
  options?: WaitOptions
): Promise<TranslationJob>;

/**
 * Waits for translations to appear in storage tables for all specified languages.
 * @returns Map of language -> stored translation
 */
export async function waitForTranslationsStored(
  entityType: EntityType,
  entityId: string,
  expectedLanguages: SupportedLanguage[],
  options?: WaitOptions
): Promise<Map<SupportedLanguage, StoredTranslation>>;

/**
 * Waits for status endpoint to return expected overall status.
 * @returns The status response when expected status is reached
 */
export async function waitForStatusEndpoint(
  entityType: EntityType,
  entityId: string,
  expectedOverallStatus: 'complete' | 'partial' | 'pending' | 'failed',
  options?: WaitOptions
): Promise<TranslationStatusResponse['data']>;

/**
 * Waits for job processing to complete (no more queued or processing jobs).
 */
export async function waitForProcessingComplete(
  entityType: EntityType,
  entityId: string,
  options?: WaitOptions
): Promise<void>;

/**
 * Triggers job processing by calling the job processor endpoint.
 * Returns when processing cycle is complete.
 */
export async function triggerJobProcessing(
  batchSize?: number
): Promise<{ processed: number; failed: number }>;

/**
 * Combines trigger and wait - triggers processing and waits for jobs to complete.
 */
export async function processAndWaitForCompletion(
  entityType: EntityType,
  entityId: string,
  options?: WaitOptions
): Promise<void>;
```

**Key Implementation Details:**
- Use async/await with while loop for polling
- Track elapsed time to enforce timeout
- Provide clear, descriptive error messages on timeout
- Include current state in timeout error for debugging
- Use exponential backoff option for long-running operations
- Log each poll attempt when debug logging is enabled

**Verification:**
- Test that waitFor times out correctly
- Test that waitForJobStatus returns when all jobs reach status
- Test that timeout error includes helpful debugging info

---

### Phase 3: Core Workflow Tests

#### Task 7.4.7: Write Item Creation → Translation E2E Test
**Story Points:** 1.0
**Dependencies:** 7.4.2-7.4.6
**Priority:** P0 (Blocking)

**Description:**
Create comprehensive E2E test for the complete item creation and translation workflow.

**File to Create:** `src/__tests__/e2e/translations/item-translation.e2e.test.ts`

**Implementation Requirements:**

```typescript
/**
 * Item Translation E2E Tests
 *
 * End-to-end tests for item creation → translation workflow.
 * Tests the complete flow from API call to stored translations.
 *
 * @module __tests__/e2e/translations/item-translation.e2e.test
 * @lastModified 2026-01-19 (REQ-365)
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  setupTestEnvironment,
  teardownTestEnvironment,
  resetTestState,
  type TestEnvironmentConfig,
} from './helpers/testEnvironment';
import {
  configureMockForSuccess,
  configureMockForFailure,
  resetMockTranslationService,
} from './helpers/mockTranslationService';
import { createApiClient, type ApiClient } from './helpers/apiClient';
import {
  getTranslationJobs,
  getStoredTranslations,
} from './helpers/databaseHelpers';
import {
  waitForJobStatus,
  waitForTranslationsStored,
  waitForStatusEndpoint,
  triggerJobProcessing,
} from './helpers/waitStrategies';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n/config';

describe('Item Translation E2E', () => {
  let testEnv: TestEnvironmentConfig;
  let apiClient: ApiClient;

  beforeAll(async () => {
    testEnv = await setupTestEnvironment();
    apiClient = createApiClient();
  });

  afterAll(async () => {
    await teardownTestEnvironment(testEnv);
  });

  beforeEach(async () => {
    resetMockTranslationService();
    configureMockForSuccess();
    await resetTestState(testEnv);
  });

  describe('Complete Translation Workflow', () => {
    it('creates item and completes translation workflow for all languages', async () => {
      // Test implementation per acceptance criteria
    });

    it('verifies translation jobs have correct metadata', async () => {
      // Verify entityType, entityId, sourceLanguage, targetLanguage
    });

    it('verifies translated content is stored in item_translations table', async () => {
      // Verify database records
    });

    it('verifies status endpoint returns complete status after processing', async () => {
      // Verify API response matches database state
    });
  });

  describe('Job State Transitions', () => {
    it('verifies jobs transition from queued to processing to completed', async () => {
      // Test state machine transitions
    });

    it('verifies jobs have pending status immediately after creation', async () => {
      // Check status before processing
    });
  });

  describe('Source Language Handling', () => {
    it('uses specified sourceLanguage when provided', async () => {
      // Test explicit source language
    });

    it('defaults to user preferred language when sourceLanguage not provided', async () => {
      // Test default behavior
    });
  });
});
```

**Test Scenarios to Implement:**

1. **Complete Workflow Test:**
   - Create item via API
   - Verify API response indicates success
   - Verify translation jobs created for all 5 target languages
   - Verify jobs have correct entity metadata
   - Trigger job processing
   - Wait for jobs to complete
   - Verify translations stored in item_translations
   - Verify status endpoint returns 'complete'

2. **Job Metadata Verification:**
   - Verify entityType = 'item'
   - Verify entityId matches created item
   - Verify sourceLanguage is correct
   - Verify targetLanguage covers all non-source languages
   - Verify priority is set appropriately

3. **Translation Storage Verification:**
   - Verify all 5 language translations exist
   - Verify translated name field is present
   - Verify translated description field is present
   - Verify translation_status = 'completed'
   - Verify translated_at timestamp is set

**Verification:**
- All tests pass in isolation
- Tests complete within 60 seconds each
- No flaky failures due to timing

---

#### Task 7.4.8: Write Article Creation → Translation E2E Test
**Story Points:** 0.5
**Dependencies:** 7.4.7
**Priority:** P1 (High)

**Description:**
Create E2E test for article translation workflow, following the pattern established in Task 7.4.7.

**File to Create:** `src/__tests__/e2e/translations/article-translation.e2e.test.ts`

**Test Scenarios:**
1. Create article via API and verify translation jobs queued
2. Wait for processing and verify translations stored in article_translations
3. Verify title and description fields are translated
4. Verify status endpoint returns correct article translation status

---

#### Task 7.4.9: Write Link Creation → Translation E2E Test
**Story Points:** 0.5
**Dependencies:** 7.4.7
**Priority:** P1 (High)

**Description:**
Create E2E test for link translation workflow.

**File to Create:** `src/__tests__/e2e/translations/link-translation.e2e.test.ts`

**Test Scenarios:**
1. Create link via API and verify translation jobs queued
2. Verify only title field is queued for translation (not URL)
3. Wait for processing and verify translations stored in link_translations
4. Verify status endpoint returns correct link translation status

---

#### Task 7.4.10: Write Tag Translation Reuse E2E Test
**Story Points:** 0.5
**Dependencies:** 7.4.7
**Priority:** P1 (High)

**Description:**
Create E2E test for tag translation caching and reuse behavior.

**File to Create:** `src/__tests__/e2e/translations/tag-translation.e2e.test.ts`

**Test Scenarios:**
1. Create first item with tag "coffee-maker"
2. Verify tag translation jobs created
3. Wait for tag translations to complete
4. Create second item with same tag "coffee-maker"
5. Verify NO new tag translation jobs created (reuse existing)
6. Verify both items reference same tag translations

---

#### Task 7.4.11: Write Translation Job State Transition Tests
**Story Points:** 0.5
**Dependencies:** 7.4.7
**Priority:** P1 (High)

**Description:**
Create tests specifically for validating job state machine transitions.

**File to Create:** `src/__tests__/e2e/translations/job-transitions.e2e.test.ts`

**Test Scenarios:**
1. Verify newly created jobs have 'queued' status
2. Verify jobs transition to 'processing' when picked up
3. Verify successful jobs transition to 'completed'
4. Verify started_at timestamp set when processing begins
5. Verify completed_at timestamp set when processing ends
6. Verify attempts count is tracked correctly

---

### Phase 4: Failure and Recovery Tests

#### Task 7.4.12: Write Translation Failure Detection Test
**Story Points:** 0.5
**Dependencies:** 7.4.7
**Priority:** P1 (High)

**Description:**
Create E2E test for detecting and handling translation failures.

**File to Create:** `src/__tests__/e2e/translations/failure-detection.e2e.test.ts`

**Test Scenarios:**
1. Configure mock translation service to fail
2. Create item via API
3. Trigger job processing
4. Wait for jobs to fail
5. Verify jobs have 'failed' status
6. Verify error_message is populated
7. Verify attempts count is incremented
8. Verify status endpoint returns 'failed' with error details

---

#### Task 7.4.13: Write Retry Endpoint E2E Test
**Story Points:** 0.5
**Dependencies:** 7.4.12
**Priority:** P1 (High)

**Description:**
Create E2E test for the retry endpoint functionality.

**File to Create:** `src/__tests__/e2e/translations/retry-endpoint.e2e.test.ts`

**Test Scenarios:**
1. Create item and let translations fail
2. Verify failed status
3. Call retry endpoint
4. Verify endpoint returns success with jobsQueued count
5. Verify failed jobs reset to 'queued' status
6. Verify attempts maintained appropriately

---

#### Task 7.4.14: Write Retry → Successful Completion E2E Test
**Story Points:** 0.5
**Dependencies:** 7.4.13
**Priority:** P1 (High)

**Description:**
Create E2E test for complete retry → success workflow.

**File to Create:** `src/__tests__/e2e/translations/retry-workflow.e2e.test.ts`

**Test Scenarios:**
1. Configure mock to fail initially
2. Create item and let translations fail
3. Configure mock for success
4. Call retry endpoint
5. Trigger job processing
6. Wait for successful completion
7. Verify translations now stored correctly
8. Verify status endpoint returns 'complete'

---

### Phase 5: Status Tracking Tests

#### Task 7.4.15: Write Status Endpoint Accuracy Tests
**Story Points:** 0.5
**Dependencies:** 7.4.7
**Priority:** P1 (High)

**Description:**
Create E2E tests verifying status endpoint accurately reflects database state.

**File to Create:** `src/__tests__/e2e/translations/status-accuracy.e2e.test.ts`

**Test Scenarios:**
1. Verify status = 'pending' immediately after job creation
2. Verify status = 'partial' during processing
3. Verify status = 'complete' after all jobs complete
4. Verify status = 'failed' when jobs fail
5. Verify individual language statuses are accurate
6. Verify timestamps match database records

---

#### Task 7.4.16: Write Batch Status Endpoint E2E Tests
**Story Points:** 0.5
**Dependencies:** 7.4.15
**Priority:** P1 (High)

**Description:**
Create E2E tests for the batch status endpoint.

**File to Create:** `src/__tests__/e2e/translations/batch-status.e2e.test.ts`

**Test Scenarios:**
1. Create multiple items in quick succession
2. Query batch status with all entity IDs
3. Verify batch endpoint returns status for all requested entities
4. Verify batch endpoint is performant (no N+1 queries)
5. Verify partial batch queries work (subset of entities)
6. Verify non-existent entity IDs handled gracefully

---

#### Task 7.4.17: Write Real-Time Status Progression Test
**Story Points:** 0.5
**Dependencies:** 7.4.15
**Priority:** P2 (Medium)

**Description:**
Create E2E test verifying status progresses correctly through workflow stages.

**File to Create:** `src/__tests__/e2e/translations/status-progression.e2e.test.ts`

**Test Scenarios:**
1. Create item and immediately check status (pending)
2. Start processing (don't wait for completion)
3. Poll for partial/in-progress status
4. Wait for completion
5. Verify final complete status
6. Document observed state transitions

---

### Phase 6: Test Suite Finalization

#### Task 7.4.18: Update Vitest Config for E2E Tests
**Story Points:** 0.25
**Dependencies:** 7.4.7
**Priority:** P1 (High)

**Description:**
Update vitest configuration to properly handle E2E tests with appropriate timeouts.

**File to Modify:** `vitest.config.ts`

**Changes Required:**

```typescript
// Add to test.include array:
'src/__tests__/e2e/**/*.e2e.test.ts'

// Consider creating vitest.e2e.config.ts for separate E2E config:
export default defineConfig({
  // ... base config ...
  test: {
    // ... existing config ...
    include: ['src/__tests__/e2e/**/*.e2e.test.ts'],
    testTimeout: 60000, // 60 seconds for E2E tests
    hookTimeout: 30000, // 30 seconds for setup/teardown
  },
});
```

**File to Modify:** `package.json`

**Add Scripts:**
```json
{
  "scripts": {
    "test:e2e": "vitest run --config vitest.e2e.config.ts",
    "test:e2e:watch": "vitest --config vitest.e2e.config.ts",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

---

#### Task 7.4.19: Run Full E2E Suite and Verify Runtime
**Story Points:** 0.25
**Dependencies:** All above
**Priority:** P1 (High)

**Description:**
Run complete E2E test suite and verify it completes within 5 minutes.

**Verification Steps:**
1. Run `npm run test:e2e` and capture output
2. Verify all tests pass
3. Verify total runtime < 5 minutes
4. Identify any slow tests and optimize if needed
5. Run suite 3 times to verify no flaky tests
6. Document any test isolation issues

**Acceptance Criteria:**
- All E2E tests pass
- Total suite runtime < 5 minutes
- No flaky tests (3 consecutive runs pass)
- Clear test output with descriptive names

---

#### Task 7.4.20: Create Barrel Export for E2E Helpers
**Story Points:** 0.25
**Dependencies:** 7.4.2-7.4.6
**Priority:** P2 (Medium)

**Description:**
Create index file to re-export all E2E helper modules for clean imports.

**File to Create:** `src/__tests__/e2e/translations/helpers/index.ts`

**Content:**
```typescript
/**
 * E2E Test Helpers Index
 *
 * Re-exports all E2E helper modules for convenient importing.
 *
 * @module __tests__/e2e/translations/helpers
 * @lastModified 2026-01-19 (REQ-365)
 */

export * from './testEnvironment';
export * from './mockTranslationService';
export * from './apiClient';
export * from './databaseHelpers';
export * from './waitStrategies';
```

---

## Implementation Details

### Mock Service Integration Pattern

The mock translation service must integrate with the actual translation service during test execution. Use one of these approaches:

**Option A: Environment-based Mock (Recommended)**
```typescript
// In translation-service.ts
const translationProvider = process.env.NODE_ENV === 'test'
  ? getMockTranslationProvider()
  : getRealTranslationProvider();
```

**Option B: Dependency Injection**
```typescript
// Pass translator as parameter in tests
const jobProcessor = new JobProcessor({
  translator: mockTranslator
});
```

### Test Database Strategy

E2E tests should use a dedicated test database or isolated schema:

```bash
# Environment variables for test database
TEST_SUPABASE_URL=https://xxx.supabase.co
TEST_SUPABASE_SERVICE_ROLE_KEY=xxx
TEST_DATABASE_SCHEMA=e2e_tests
```

### Parallel Test Execution

Tests within a file can run in parallel if they:
1. Use unique testRunIds
2. Don't share mutable state
3. Clean up their own data

Configure in vitest:
```typescript
test: {
  pool: 'threads',
  poolOptions: {
    threads: {
      singleThread: false // Enable parallel
    }
  }
}
```

---

## Acceptance Criteria Mapping

| Acceptance Criteria from REQ-365 | Task | Verification |
|----------------------------------|------|--------------|
| E2E test creates item through API endpoint | 7.4.7 | Test file exists and runs |
| Test verifies API response indicates successful item creation | 7.4.7 | Assertion in test |
| Test verifies translation jobs created immediately | 7.4.7 | DB verification |
| Test verifies jobs exist for all supported target languages | 7.4.7 | Count assertion (5 languages) |
| Test verifies jobs include correct entity_id, entity_type, fields | 7.4.7 | Metadata assertions |
| Test verifies jobs have pending status immediately | 7.4.7, 7.4.11 | Status check before processing |
| Test waits for background job processor | 7.4.6, 7.4.7 | waitForJobStatus utility |
| Test verifies jobs transition from pending to in-progress | 7.4.11 | State transition test |
| Test verifies jobs transition to completed after processing | 7.4.11 | State transition test |
| Test verifies translated content stored in item_translations | 7.4.7 | DB verification |
| Test verifies stored translations include correct associations | 7.4.7 | FK verification |
| Test queries status endpoint after completion | 7.4.15 | API call assertion |
| Test verifies status endpoint returns completed status | 7.4.15 | Response assertion |
| Test verifies status includes timestamps | 7.4.15 | Timestamp assertion |
| E2E test simulates translation failure | 7.4.12 | Mock config + test |
| Test verifies failed jobs have error message | 7.4.12 | Error message assertion |
| Test calls retry endpoint | 7.4.13 | API call test |
| Test verifies retry endpoint returns success | 7.4.13 | Response assertion |
| Test verifies failed job status changes to pending | 7.4.13 | Status change verification |
| Test verifies retried job processes successfully | 7.4.14 | Complete workflow test |
| E2E test creates article through API | 7.4.8 | Separate test file |
| Test verifies article translations in article_translations | 7.4.8 | DB verification |
| E2E test creates link through API | 7.4.9 | Separate test file |
| Test verifies link translations in link_translations | 7.4.9 | DB verification |
| E2E test creates item with tags | 7.4.10 | Tag test file |
| Test verifies tag translations reused | 7.4.10 | No duplicate jobs |
| E2E test verifies batch status endpoint | 7.4.16 | Batch test file |
| Tests use mock translation service | 7.4.3 | Mock implementation |
| Tests use isolated test environment | 7.4.2 | Test isolation |
| Tests handle timing with polling | 7.4.6 | Wait utilities |
| All E2E tests pass | 7.4.19 | CI verification |
| Test suite < 5 minutes | 7.4.19 | Runtime measurement |

---

## Testing Verification

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- item-translation.e2e.test.ts

# Run with verbose output
npm run test:e2e -- --reporter=verbose

# Run with coverage
npm run test:e2e -- --coverage
```

### Expected Test Output

```
 ✓ src/__tests__/e2e/translations/item-translation.e2e.test.ts (12 tests) 45s
 ✓ src/__tests__/e2e/translations/article-translation.e2e.test.ts (5 tests) 20s
 ✓ src/__tests__/e2e/translations/link-translation.e2e.test.ts (4 tests) 18s
 ✓ src/__tests__/e2e/translations/tag-translation.e2e.test.ts (3 tests) 25s
 ✓ src/__tests__/e2e/translations/retry-workflow.e2e.test.ts (6 tests) 35s
 ✓ src/__tests__/e2e/translations/status-tracking.e2e.test.ts (8 tests) 30s
 ✓ src/__tests__/e2e/translations/batch-status.e2e.test.ts (5 tests) 22s

 Test Files  7 passed (7)
      Tests  43 passed (43)
   Start at  14:30:00
   Duration  3m 15s
```

### Debugging Failed Tests

1. Enable verbose logging:
   ```bash
   DEBUG=e2e:* npm run test:e2e
   ```

2. Check test database state:
   ```bash
   psql $TEST_DATABASE_URL -c "SELECT * FROM translation_jobs WHERE entity_id LIKE 'e2e-%'"
   ```

3. Run single test in isolation:
   ```bash
   npm run test:e2e -- --test-name-pattern="creates item and completes"
   ```

---

## Rollback Plan

If E2E tests introduce issues:

1. **Revert vitest.config.ts changes:**
   ```bash
   git checkout HEAD~1 -- vitest.config.ts
   ```

2. **Revert package.json scripts:**
   ```bash
   git checkout HEAD~1 -- package.json
   ```

3. **Remove E2E test directory:**
   ```bash
   rm -rf src/__tests__/e2e/translations/
   ```

4. **E2E tests are additive - no production code changes required for rollback**

---

## References

- **Overview Document:** `/docs/REQ-365-write-e2e-tests-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- **Request Definition:** `/docs/gen_requests_epic3.md` (REQ-365)
- **Existing E2E Patterns:** `/src/components/ItemCreationWorkflow/__tests__/e2e/`
- **Vitest Documentation:** https://vitest.dev/guide/
- **Testing Library:** https://testing-library.com/

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation*
*Phase 7, Task 7.4: Write E2E tests for translation workflows*
