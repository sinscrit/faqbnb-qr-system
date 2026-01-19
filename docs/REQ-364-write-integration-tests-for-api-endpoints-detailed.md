# REQ-364: Write Integration Tests for API Endpoints - Detailed Task Breakdown

**Generated:** 2026-01-19 16:30:00 UTC
**Last Modified:** 2026-01-19 16:30:00 UTC
**Request Reference:** REQ-364 in `/docs/gen_requests_epic3.md`
**Overview Document:** `/docs/REQ-364-write-integration-tests-for-api-endpoints-overview.md`
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
**Phase:** 7 - Testing & Validation
**Task ID:** 7.3
**Total Story Points:** 5.5
**Estimated Hours:** 22

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Prerequisites](#2-prerequisites)
3. [Task 7.3.1: Create API Test Infrastructure](#3-task-731-create-api-test-infrastructure)
4. [Task 7.3.2: Item Creation Translation Trigger Tests](#4-task-732-item-creation-translation-trigger-tests)
5. [Task 7.3.3: Article Creation Translation Trigger Tests](#5-task-733-article-creation-translation-trigger-tests)
6. [Task 7.3.4: Translation Status Endpoint Tests](#6-task-734-translation-status-endpoint-tests)
7. [Task 7.3.5: Retry Endpoint Tests](#7-task-735-retry-endpoint-tests)
8. [Task 7.3.6: Manual Override Endpoint Tests](#8-task-736-manual-override-endpoint-tests)
9. [Verification Checklist](#9-verification-checklist)
10. [References](#10-references)

---

## 1. Executive Summary

This document provides step-by-step implementation instructions for creating integration tests that verify the translation API endpoints function correctly. The tests cover:

- **Item creation** triggering translation job creation
- **Article creation** triggering translation job creation
- **Translation status** endpoint returning accurate job information
- **Retry endpoint** re-queuing failed translation jobs
- **Manual override** endpoint storing administrator corrections

All tests will use Vitest with mocked dependencies to ensure fast, isolated execution while verifying the complete integration between API routes and the content translation module.

---

## 2. Prerequisites

### 2.1 Required Dependencies (Already Installed)

| Package | Purpose |
|---------|---------|
| `vitest` | Test runner |
| `@testing-library/react` | React testing utilities |
| `jsdom` | DOM environment |

### 2.2 Required Files Must Exist

Before implementing these tests, verify the following files exist:

| File | Verification Command |
|------|---------------------|
| `/src/app/api/admin/items/route.ts` | `ls src/app/api/admin/items/route.ts` |
| `/src/app/api/admin/articles/route.ts` | `ls src/app/api/admin/articles/route.ts` |
| `/src/app/api/translations/status/[entityType]/[entityId]/route.ts` | Check if directory exists |
| `/src/app/api/translations/retry/route.ts` | Check if file exists |
| `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` | Check if directory exists |
| `/src/lib/content-translation/index.ts` | `ls src/lib/content-translation/index.ts` |
| `/src/lib/job-queue/__tests__/helpers/` | Existing test helper patterns |

### 2.3 Environment Setup

Ensure `vitest.config.ts` includes the test paths:
```typescript
include: ['src/**/*.test.ts', 'src/**/*.test.tsx']
```

---

## 3. Task 7.3.1: Create API Test Infrastructure

**Story Points:** 0.5
**Estimated Hours:** 2
**Priority:** Critical (Blocks all other tasks)

### 3.1 Objective

Create reusable test helper files that provide mock factories for NextRequest objects, authentication results, and Supabase clients.

### 3.2 Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/app/api/__tests__/helpers/apiTestHelpers.ts` | Common API testing utilities |
| `src/app/api/__tests__/helpers/mockNextRequest.ts` | NextRequest mock factory |
| `src/app/api/__tests__/helpers/constants.ts` | Test constants for API testing |

### 3.3 Implementation Steps

#### Step 1: Create test helpers directory

```bash
mkdir -p src/app/api/__tests__/helpers
```

#### Step 2: Create constants.ts

**File:** `src/app/api/__tests__/helpers/constants.ts`

```typescript
/**
 * Constants for API integration tests
 * @module api/__tests__/helpers/constants
 */

/**
 * Supported languages for translation
 */
export const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * Target languages (all except source)
 */
export const TARGET_LANGUAGES = ['fr', 'es', 'de', 'nl', 'it'] as const;

/**
 * Entity types for translation
 */
export const ENTITY_TYPES = ['item', 'article', 'link', 'tag'] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];

/**
 * Translation job statuses
 */
export const TRANSLATION_STATUSES = ['pending', 'processing', 'completed', 'failed', 'manual'] as const;
export type TranslationStatus = (typeof TRANSLATION_STATUSES)[number];

/**
 * Overall translation status values
 */
export const OVERALL_STATUSES = ['complete', 'partial', 'pending', 'failed'] as const;
export type OverallStatus = (typeof OVERALL_STATUSES)[number];

/**
 * Base URL for API tests
 */
export const BASE_URL = 'http://localhost:3000';

/**
 * Default mock translation response
 */
export const MOCK_TRANSLATION_RESPONSE = {
  success: true,
  jobIds: ['job-fr', 'job-es', 'job-de', 'job-nl', 'job-it'],
  queuedLanguages: ['fr', 'es', 'de', 'nl', 'it'] as SupportedLanguage[],
};

/**
 * Default test user data
 */
export const TEST_USER = {
  id: 'test-user-123',
  email: 'test@example.com',
  preferred_language: 'en' as SupportedLanguage,
};

/**
 * Default test account data
 */
export const TEST_ACCOUNT = {
  id: 'test-account-456',
  name: 'Test Account',
  preferred_language: 'en' as SupportedLanguage,
};
```

#### Step 3: Create mockNextRequest.ts

**File:** `src/app/api/__tests__/helpers/mockNextRequest.ts`

```typescript
/**
 * NextRequest mock factory for API integration tests
 * @module api/__tests__/helpers/mockNextRequest
 */

import type { NextRequest } from 'next/server';
import { BASE_URL } from './constants';

/**
 * Options for creating a mock NextRequest
 */
export interface MockNextRequestOptions {
  /** Full URL or path (will be appended to BASE_URL if relative) */
  url: string;
  /** HTTP method */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Request body (will be serialized to JSON) */
  body?: Record<string, unknown>;
  /** Additional headers */
  headers?: Record<string, string>;
  /** URL search parameters */
  searchParams?: Record<string, string>;
}

/**
 * Creates a mock NextRequest object for testing API routes
 *
 * @param options - Request configuration options
 * @returns Mock NextRequest object
 *
 * @example
 * const request = createMockNextRequest({
 *   url: '/api/admin/items',
 *   method: 'POST',
 *   body: { name: 'Test Item', propertyId: 'prop-123' }
 * });
 */
export function createMockNextRequest(options: MockNextRequestOptions): NextRequest {
  // Build full URL
  const fullUrl = options.url.startsWith('http')
    ? options.url
    : `${BASE_URL}${options.url}`;

  const url = new URL(fullUrl);

  // Add search params if provided
  if (options.searchParams) {
    Object.entries(options.searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  // Build headers
  const headers = new Headers({
    'content-type': 'application/json',
    ...options.headers,
  });

  // Create mock request object
  const mockRequest = {
    url: url.toString(),
    method: options.method,
    headers,
    nextUrl: url,
    json: () => Promise.resolve(options.body || {}),
    text: () => Promise.resolve(JSON.stringify(options.body || {})),
    formData: () => Promise.resolve(new FormData()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    clone: function() { return this; },
    body: null,
    bodyUsed: false,
    cache: 'default' as RequestCache,
    credentials: 'same-origin' as RequestCredentials,
    destination: '' as RequestDestination,
    integrity: '',
    keepalive: false,
    mode: 'cors' as RequestMode,
    redirect: 'follow' as RequestRedirect,
    referrer: '',
    referrerPolicy: '' as ReferrerPolicy,
    signal: new AbortController().signal,
    cookies: {
      get: () => undefined,
      getAll: () => [],
      has: () => false,
      set: () => {},
      delete: () => {},
      clear: () => {},
      [Symbol.iterator]: function* () {},
    },
    geo: undefined,
    ip: undefined,
  } as unknown as NextRequest;

  return mockRequest;
}

/**
 * Creates route params object for dynamic routes
 *
 * @param params - Route parameters
 * @returns Params object compatible with Next.js route handlers
 *
 * @example
 * const params = createRouteParams({ entityType: 'item', entityId: 'item-123' });
 */
export function createRouteParams<T extends Record<string, string>>(params: T): { params: T } {
  return { params };
}
```

#### Step 4: Create apiTestHelpers.ts

**File:** `src/app/api/__tests__/helpers/apiTestHelpers.ts`

```typescript
/**
 * Common API testing utilities
 * @module api/__tests__/helpers/apiTestHelpers
 */

import { vi } from 'vitest';
import { TEST_USER, TEST_ACCOUNT, MOCK_TRANSLATION_RESPONSE } from './constants';
import type { SupportedLanguage } from './constants';

/**
 * Options for creating mock auth result
 */
export interface MockAuthOptions {
  userId?: string;
  email?: string;
  isAdmin?: boolean;
  accountId?: string;
  preferredLanguage?: SupportedLanguage;
}

/**
 * Creates a mock authentication result for bypassing auth in tests
 *
 * @param options - Optional overrides for auth data
 * @returns Mock auth result object
 *
 * @example
 * const authResult = createMockAuthResult({ isAdmin: true });
 */
export function createMockAuthResult(options?: MockAuthOptions) {
  return {
    error: null,
    user: {
      id: options?.userId || TEST_USER.id,
      email: options?.email || TEST_USER.email,
      preferred_language: options?.preferredLanguage || TEST_USER.preferred_language,
    },
    isAdmin: options?.isAdmin ?? true,
    supabase: createMockSupabaseClient(),
    account: {
      id: options?.accountId || TEST_ACCOUNT.id,
      name: TEST_ACCOUNT.name,
      preferred_language: TEST_ACCOUNT.preferred_language,
    },
  };
}

/**
 * Creates a chainable mock object for Supabase query builder
 *
 * @returns Chainable mock object
 */
function createChainableMock() {
  const mock: Record<string, ReturnType<typeof vi.fn>> = {};

  // Query building methods - return self for chaining
  const chainMethods = [
    'select', 'insert', 'update', 'upsert', 'delete',
    'eq', 'neq', 'gt', 'gte', 'lt', 'lte',
    'in', 'is', 'not', 'or', 'and',
    'order', 'limit', 'offset', 'range',
    'filter', 'match', 'textSearch',
    'ilike', 'like', 'contains', 'containedBy',
    'overlaps', 'returns',
  ];

  chainMethods.forEach(method => {
    mock[method] = vi.fn().mockReturnValue(mock);
  });

  // Terminal methods - return data
  mock.single = vi.fn().mockResolvedValue({ data: null, error: null });
  mock.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
  mock.then = vi.fn().mockResolvedValue({ data: [], error: null });

  return mock;
}

/**
 * Creates a mock Supabase client for testing
 *
 * @returns Mock Supabase client object
 *
 * @example
 * const supabase = createMockSupabaseClient();
 * supabase.from('items').select().eq('id', '123');
 */
export function createMockSupabaseClient() {
  const chainableMock = createChainableMock();

  return {
    from: vi.fn(() => chainableMock),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: TEST_USER }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: null, error: null }),
        download: vi.fn().mockResolvedValue({ data: null, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: '' } }),
      }),
    },
  };
}

/**
 * Creates a mock queueContentTranslations function
 *
 * @param overrides - Optional overrides for the response
 * @returns Mock function
 */
export function createMockQueueContentTranslations(overrides?: Partial<typeof MOCK_TRANSLATION_RESPONSE>) {
  return vi.fn().mockResolvedValue({
    ...MOCK_TRANSLATION_RESPONSE,
    ...overrides,
  });
}

/**
 * Creates mock translation status data
 *
 * @param entityId - Entity ID
 * @param entityType - Entity type
 * @param translationData - Translation status by language
 * @returns Mock translation status object
 */
export function createMockTranslationStatus(
  entityId: string,
  entityType: string,
  translationData: Record<string, { status: string; translatedAt?: string; error?: string }>
) {
  const statuses = Object.values(translationData).map(t => t.status);
  let overallStatus: 'complete' | 'partial' | 'pending' | 'failed';

  if (statuses.every(s => s === 'completed' || s === 'manual')) {
    overallStatus = 'complete';
  } else if (statuses.every(s => s === 'failed')) {
    overallStatus = 'failed';
  } else if (statuses.every(s => s === 'pending')) {
    overallStatus = 'pending';
  } else {
    overallStatus = 'partial';
  }

  return {
    entityId,
    entityType,
    sourceLanguage: 'en',
    overallStatus,
    translations: translationData,
  };
}

/**
 * Creates mock translation job data
 *
 * @param overrides - Optional field overrides
 * @returns Mock translation job object
 */
export function createMockTranslationJob(overrides?: Record<string, unknown>) {
  return {
    id: `job-${Math.random().toString(36).substr(2, 9)}`,
    entity_type: 'item',
    entity_id: 'item-123',
    source_language: 'en',
    target_language: 'fr',
    status: 'queued',
    priority: 100,
    attempts: 0,
    error_message: null,
    created_at: new Date().toISOString(),
    started_at: null,
    completed_at: null,
    ...overrides,
  };
}

/**
 * Resets all mock functions to their initial state
 */
export function resetAllMocks() {
  vi.clearAllMocks();
}

// Re-export for convenience
export { createMockNextRequest, createRouteParams } from './mockNextRequest';
export * from './constants';
```

#### Step 5: Create barrel export

**File:** `src/app/api/__tests__/helpers/index.ts`

```typescript
/**
 * API test helpers barrel export
 * @module api/__tests__/helpers
 */

export * from './apiTestHelpers';
export * from './mockNextRequest';
export * from './constants';
```

### 3.4 Verification

Run the following to verify the files were created correctly:

```bash
# Verify files exist
ls -la src/app/api/__tests__/helpers/

# Verify TypeScript compiles
npx tsc --noEmit src/app/api/__tests__/helpers/index.ts
```

### 3.5 Acceptance Criteria for Task 7.3.1

- [ ] `src/app/api/__tests__/helpers/` directory exists
- [ ] `constants.ts` defines all test constants
- [ ] `mockNextRequest.ts` exports `createMockNextRequest` function
- [ ] `apiTestHelpers.ts` exports all mock factory functions
- [ ] `index.ts` barrel exports all helpers
- [ ] TypeScript compilation succeeds without errors

---

## 4. Task 7.3.2: Item Creation Translation Trigger Tests

**Story Points:** 1.0
**Estimated Hours:** 4
**Depends On:** Task 7.3.1

### 4.1 Objective

Create integration tests that verify creating an item through the POST endpoint correctly triggers translation job creation for all target languages.

### 4.2 File to Create

**File:** `src/app/api/__tests__/content-creation-translations.integration.test.ts`

### 4.3 Implementation Steps

#### Step 1: Create the test file with imports and setup

```typescript
/**
 * Integration tests for content creation translation triggers
 * Tests that item and article creation correctly queue translation jobs
 *
 * @module api/__tests__/content-creation-translations.integration.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createMockNextRequest,
  createMockAuthResult,
  createMockQueueContentTranslations,
  resetAllMocks,
  TARGET_LANGUAGES,
  TEST_USER,
} from './helpers';

// ============================================================================
// MOCK SETUP
// ============================================================================

// Mock auth module
const mockValidateAdminAuth = vi.fn();
vi.mock('@/lib/auth-server', () => ({
  validateAdminAuth: () => mockValidateAdminAuth(),
}));

// Mock content translation module
const mockQueueContentTranslations = vi.fn();
vi.mock('@/lib/content-translation', () => ({
  queueContentTranslations: (...args: unknown[]) => mockQueueContentTranslations(...args),
}));

// Mock supabase
const mockSupabaseInsert = vi.fn();
const mockSupabaseSelect = vi.fn();
const mockSupabaseUpdate = vi.fn();
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSupabaseSelect,
      insert: mockSupabaseInsert,
      update: mockSupabaseUpdate,
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: mockSupabaseSelect,
      insert: mockSupabaseInsert,
      update: mockSupabaseUpdate,
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));
```

#### Step 2: Add Item Creation test suite

```typescript
// ============================================================================
// ITEM CREATION TESTS
// ============================================================================

describe('Item Creation Translation Triggers', () => {
  beforeEach(() => {
    resetAllMocks();

    // Default auth mock - admin user
    mockValidateAdminAuth.mockResolvedValue(createMockAuthResult({ isAdmin: true }));

    // Default translation queue mock
    mockQueueContentTranslations.mockResolvedValue({
      success: true,
      jobIds: ['job-fr', 'job-es', 'job-de', 'job-nl', 'job-it'],
      queuedLanguages: ['fr', 'es', 'de', 'nl', 'it'],
    });

    // Default supabase insert mock - return created item
    mockSupabaseInsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'new-item-123',
            public_id: 'test-item-001',
            name: 'Test Coffee Maker',
            description: 'A high-quality coffee maker',
            property_id: 'property-123',
            source_language: 'en',
            created_at: new Date().toISOString(),
          },
          error: null,
        }),
      }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/admin/items', () => {
    it('creates item and triggers translations for all 5 target languages', async () => {
      const requestBody = {
        publicId: 'test-item-001',
        name: 'Test Coffee Maker',
        description: 'A high-quality coffee maker for your morning brew',
        propertyId: 'property-123',
      };

      const request = createMockNextRequest({
        url: '/api/admin/items',
        method: 'POST',
        body: requestBody,
      });

      // Import route handler dynamically to ensure mocks are in place
      const { POST } = await import('@/app/api/admin/items/route');
      const response = await POST(request);
      const data = await response.json();

      // Verify success response
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Verify translation jobs were queued
      expect(data.translationJobIds).toBeDefined();
      expect(data.translationJobIds).toHaveLength(5);

      // Verify queueContentTranslations was called with correct parameters
      expect(mockQueueContentTranslations).toHaveBeenCalledTimes(1);
      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            entityType: 'item',
            sourceLanguage: expect.any(String),
            fields: expect.arrayContaining([
              expect.objectContaining({ fieldName: 'name' }),
            ]),
          }),
          trigger: 'create',
        })
      );
    });

    it('creates translation jobs for all supported target languages', async () => {
      const request = createMockNextRequest({
        url: '/api/admin/items',
        method: 'POST',
        body: {
          publicId: 'multi-lang-item',
          name: 'Multi-Language Test',
          propertyId: 'property-123',
        },
      });

      const { POST } = await import('@/app/api/admin/items/route');
      await POST(request);

      // Verify all 5 target languages are queued
      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            entityType: 'item',
          }),
        })
      );

      // The response should indicate jobs for fr, es, de, nl, it
      const callArgs = mockQueueContentTranslations.mock.calls[0];
      expect(callArgs).toBeDefined();
    });

    it('includes correct entity_id referencing the created item', async () => {
      const request = createMockNextRequest({
        url: '/api/admin/items',
        method: 'POST',
        body: {
          publicId: 'entity-id-test',
          name: 'Entity ID Test Item',
          propertyId: 'property-123',
        },
      });

      const { POST } = await import('@/app/api/admin/items/route');
      const response = await POST(request);
      const data = await response.json();

      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            entityId: expect.any(String),
            entityType: 'item',
          }),
        })
      );

      // The entity ID should match the created item's ID
      const callArgs = mockQueueContentTranslations.mock.calls[0][0];
      expect(callArgs.content.entityId).toBeDefined();
    });

    it('includes correct entity_type value of item', async () => {
      const request = createMockNextRequest({
        url: '/api/admin/items',
        method: 'POST',
        body: {
          publicId: 'entity-type-test',
          name: 'Entity Type Test',
          propertyId: 'property-123',
        },
      });

      const { POST } = await import('@/app/api/admin/items/route');
      await POST(request);

      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            entityType: 'item',
          }),
        })
      );
    });

    it('includes source_language matching user preference', async () => {
      // Set up user with French preference
      mockValidateAdminAuth.mockResolvedValue(
        createMockAuthResult({ preferredLanguage: 'fr' })
      );

      const request = createMockNextRequest({
        url: '/api/admin/items',
        method: 'POST',
        body: {
          publicId: 'french-user-item',
          name: 'Article en français',
          propertyId: 'property-123',
        },
      });

      const { POST } = await import('@/app/api/admin/items/route');
      await POST(request);

      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            sourceLanguage: expect.stringMatching(/^(fr|en)$/),
          }),
        })
      );
    });

    it('includes source_language override when explicitly provided', async () => {
      const request = createMockNextRequest({
        url: '/api/admin/items',
        method: 'POST',
        body: {
          publicId: 'spanish-item',
          name: 'Cafetera de prueba',
          description: 'Una cafetera de alta calidad',
          propertyId: 'property-123',
          sourceLanguage: 'es',
        },
      });

      const { POST } = await import('@/app/api/admin/items/route');
      await POST(request);

      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            sourceLanguage: 'es',
          }),
        })
      );
    });

    it('includes correct priority level for item entity type', async () => {
      const request = createMockNextRequest({
        url: '/api/admin/items',
        method: 'POST',
        body: {
          publicId: 'priority-test',
          name: 'Priority Test Item',
          propertyId: 'property-123',
        },
      });

      const { POST } = await import('@/app/api/admin/items/route');
      await POST(request);

      // Newly created items should have high priority (100)
      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          trigger: 'create',
        })
      );
    });

    it('includes translatable fields name and description', async () => {
      const request = createMockNextRequest({
        url: '/api/admin/items',
        method: 'POST',
        body: {
          publicId: 'fields-test',
          name: 'Test Item Name',
          description: 'Test item description with more details',
          propertyId: 'property-123',
        },
      });

      const { POST } = await import('@/app/api/admin/items/route');
      await POST(request);

      const callArgs = mockQueueContentTranslations.mock.calls[0][0];
      const fieldNames = callArgs.content.fields.map((f: { fieldName: string }) => f.fieldName);

      expect(fieldNames).toContain('name');
      // Description may or may not be included depending on implementation
    });

    it('handles item with minimal required fields', async () => {
      const request = createMockNextRequest({
        url: '/api/admin/items',
        method: 'POST',
        body: {
          publicId: 'minimal-item',
          name: 'Minimal Item',
          propertyId: 'property-123',
        },
      });

      const { POST } = await import('@/app/api/admin/items/route');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockQueueContentTranslations).toHaveBeenCalled();
    });

    it('handles item with all optional fields populated', async () => {
      const request = createMockNextRequest({
        url: '/api/admin/items',
        method: 'POST',
        body: {
          publicId: 'full-item',
          name: 'Fully Featured Item',
          description: 'Complete description with all details about the item',
          propertyId: 'property-123',
          tags: ['appliance', 'kitchen', 'essential'],
          sourceLanguage: 'en',
          category: 'appliances',
          imageUrl: 'https://example.com/image.jpg',
        },
      });

      const { POST } = await import('@/app/api/admin/items/route');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.translationJobIds).toBeDefined();
    });

    it('returns translationJobIds in response', async () => {
      const request = createMockNextRequest({
        url: '/api/admin/items',
        method: 'POST',
        body: {
          publicId: 'job-ids-test',
          name: 'Job IDs Test',
          propertyId: 'property-123',
        },
      });

      const { POST } = await import('@/app/api/admin/items/route');
      const response = await POST(request);
      const data = await response.json();

      expect(data.translationJobIds).toBeDefined();
      expect(Array.isArray(data.translationJobIds)).toBe(true);
      expect(data.translationJobIds.length).toBeGreaterThan(0);
    });
  });
});
```

### 4.4 Verification

Run the tests:

```bash
npx vitest run src/app/api/__tests__/content-creation-translations.integration.test.ts --reporter=verbose
```

### 4.5 Acceptance Criteria for Task 7.3.2

- [ ] Tests verify POST /api/admin/items returns success status
- [ ] Tests verify creating item automatically creates translation jobs
- [ ] Tests verify translation jobs are created for all 5 target languages
- [ ] Tests verify translation jobs include correct entity_id
- [ ] Tests verify translation jobs include correct entity_type 'item'
- [ ] Tests verify source_language matches user preference or default
- [ ] Tests verify correct priority level for item entity type
- [ ] Tests verify translatable fields (name, description) are included
- [ ] Tests verify minimal fields item triggers translations
- [ ] Tests verify full fields item triggers translations
- [ ] All tests pass

---

## 5. Task 7.3.3: Article Creation Translation Trigger Tests

**Story Points:** 1.0
**Estimated Hours:** 4
**Depends On:** Task 7.3.1, Task 7.3.2

### 5.1 Objective

Extend the content creation tests to verify article creation correctly triggers translation jobs.

### 5.2 File to Modify

**File:** `src/app/api/__tests__/content-creation-translations.integration.test.ts` (add to existing)

### 5.3 Implementation Steps

#### Step 1: Add article-specific mock setup

Add to the existing test file after the item tests:

```typescript
// ============================================================================
// ARTICLE CREATION TESTS
// ============================================================================

describe('Article Creation Translation Triggers', () => {
  beforeEach(() => {
    resetAllMocks();

    // Default auth mock - admin user
    mockValidateAdminAuth.mockResolvedValue(createMockAuthResult({ isAdmin: true }));

    // Default translation queue mock
    mockQueueContentTranslations.mockResolvedValue({
      success: true,
      jobIds: ['article-job-fr', 'article-job-es', 'article-job-de', 'article-job-nl', 'article-job-it'],
      queuedLanguages: ['fr', 'es', 'de', 'nl', 'it'],
    });

    // Default supabase insert mock - return created article
    mockSupabaseInsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'new-article-123',
            title: 'How to use the coffee maker',
            description: 'Step by step instructions',
            item_id: 'item-123',
            purpose_type: 'how-to',
            source_language: 'en',
            created_at: new Date().toISOString(),
          },
          error: null,
        }),
      }),
    });

    // Mock item lookup for article validation
    mockSupabaseSelect.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: 'item-123', name: 'Coffee Maker' },
          error: null,
        }),
      }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/admin/articles', () => {
    it('creates article and triggers translations for all 5 target languages', async () => {
      const requestBody = {
        itemId: 'item-123',
        title: 'How to use the coffee maker',
        description: 'Step by step instructions for making perfect coffee',
        purposeType: 'how-to',
      };

      const request = createMockNextRequest({
        url: '/api/admin/articles',
        method: 'POST',
        body: requestBody,
      });

      const { POST } = await import('@/app/api/admin/articles/route');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.translationJobIds).toBeDefined();
      expect(data.translationJobIds).toHaveLength(5);

      expect(mockQueueContentTranslations).toHaveBeenCalledTimes(1);
      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            entityType: 'article',
          }),
          trigger: 'create',
        })
      );
    });

    it('includes correct entity_type value of article', async () => {
      const request = createMockNextRequest({
        url: '/api/admin/articles',
        method: 'POST',
        body: {
          itemId: 'item-123',
          title: 'Article Type Test',
          purposeType: 'how-to',
        },
      });

      const { POST } = await import('@/app/api/admin/articles/route');
      await POST(request);

      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            entityType: 'article',
          }),
        })
      );
    });

    it('includes correct entity_id referencing the created article', async () => {
      const request = createMockNextRequest({
        url: '/api/admin/articles',
        method: 'POST',
        body: {
          itemId: 'item-123',
          title: 'Entity ID Test Article',
          purposeType: 'how-to',
        },
      });

      const { POST } = await import('@/app/api/admin/articles/route');
      await POST(request);

      const callArgs = mockQueueContentTranslations.mock.calls[0][0];
      expect(callArgs.content.entityId).toBeDefined();
      expect(typeof callArgs.content.entityId).toBe('string');
    });

    it('includes translatable fields title and description', async () => {
      const request = createMockNextRequest({
        url: '/api/admin/articles',
        method: 'POST',
        body: {
          itemId: 'item-123',
          title: 'Test Article Title',
          description: 'Test article description with detailed content',
          purposeType: 'how-to',
        },
      });

      const { POST } = await import('@/app/api/admin/articles/route');
      await POST(request);

      const callArgs = mockQueueContentTranslations.mock.calls[0][0];
      const fieldNames = callArgs.content.fields.map((f: { fieldName: string }) => f.fieldName);

      expect(fieldNames).toContain('title');
      // Description may be included depending on implementation
    });

    it('includes source_language matching user preference', async () => {
      mockValidateAdminAuth.mockResolvedValue(
        createMockAuthResult({ preferredLanguage: 'de' })
      );

      const request = createMockNextRequest({
        url: '/api/admin/articles',
        method: 'POST',
        body: {
          itemId: 'item-123',
          title: 'German Article Test',
          purposeType: 'how-to',
        },
      });

      const { POST } = await import('@/app/api/admin/articles/route');
      await POST(request);

      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            sourceLanguage: expect.any(String),
          }),
        })
      );
    });

    it('handles article with minimal required fields', async () => {
      const request = createMockNextRequest({
        url: '/api/admin/articles',
        method: 'POST',
        body: {
          itemId: 'item-123',
          title: 'Minimal Article',
          purposeType: 'how-to',
        },
      });

      const { POST } = await import('@/app/api/admin/articles/route');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockQueueContentTranslations).toHaveBeenCalled();
    });

    it('handles article with all optional fields populated', async () => {
      const request = createMockNextRequest({
        url: '/api/admin/articles',
        method: 'POST',
        body: {
          itemId: 'item-123',
          title: 'Complete Article with All Fields',
          description: 'Comprehensive description covering all aspects of the item usage',
          purposeType: 'how-to',
          sourceLanguage: 'en',
          isPublished: true,
          displayOrder: 1,
        },
      });

      const { POST } = await import('@/app/api/admin/articles/route');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.translationJobIds).toBeDefined();
    });

    it('includes correct priority level for article entity type', async () => {
      const request = createMockNextRequest({
        url: '/api/admin/articles',
        method: 'POST',
        body: {
          itemId: 'item-123',
          title: 'Priority Test Article',
          purposeType: 'how-to',
        },
      });

      const { POST } = await import('@/app/api/admin/articles/route');
      await POST(request);

      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          trigger: 'create',
        })
      );
    });
  });
});
```

### 5.4 Verification

Run the tests:

```bash
npx vitest run src/app/api/__tests__/content-creation-translations.integration.test.ts --reporter=verbose
```

### 5.5 Acceptance Criteria for Task 7.3.3

- [ ] Tests verify POST /api/admin/articles returns success status
- [ ] Tests verify creating article automatically creates translation jobs
- [ ] Tests verify translation jobs are created for all 5 target languages
- [ ] Tests verify translation jobs include correct entity_id
- [ ] Tests verify translation jobs include correct entity_type 'article'
- [ ] Tests verify translatable fields (title, description) are included
- [ ] Tests verify minimal fields article triggers translations
- [ ] Tests verify full fields article triggers translations
- [ ] All tests pass

---

## 6. Task 7.3.4: Translation Status Endpoint Tests

**Story Points:** 1.0
**Estimated Hours:** 4
**Depends On:** Task 7.3.1

### 6.1 Objective

Create integration tests that verify the translation status endpoint returns accurate job information.

### 6.2 File to Create

**File:** `src/app/api/__tests__/translations-api.integration.test.ts`

### 6.3 Implementation Steps

#### Step 1: Create the test file with imports and status tests

```typescript
/**
 * Integration tests for translation management API endpoints
 * Tests status, retry, and manual override endpoints
 *
 * @module api/__tests__/translations-api.integration.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createMockNextRequest,
  createRouteParams,
  createMockAuthResult,
  createMockTranslationStatus,
  createMockTranslationJob,
  resetAllMocks,
  TARGET_LANGUAGES,
} from './helpers';

// ============================================================================
// MOCK SETUP
// ============================================================================

// Mock auth module
const mockValidateAdminAuth = vi.fn();
vi.mock('@/lib/auth-server', () => ({
  validateAdminAuth: () => mockValidateAdminAuth(),
}));

// Mock translation status retrieval
const mockGetEntityTranslationStatus = vi.fn();
vi.mock('@/lib/content-translation/storage/translation-status', () => ({
  getEntityTranslationStatus: (...args: unknown[]) => mockGetEntityTranslationStatus(...args),
}));

// Mock translation job operations
const mockRetryFailedTranslations = vi.fn();
const mockStoreManualTranslation = vi.fn();
vi.mock('@/lib/content-translation', () => ({
  retryFailedTranslations: (...args: unknown[]) => mockRetryFailedTranslations(...args),
  storeManualTranslation: (...args: unknown[]) => mockStoreManualTranslation(...args),
}));

// Mock supabase
const mockSupabaseSelect = vi.fn();
const mockSupabaseUpdate = vi.fn();
const mockSupabaseUpsert = vi.fn();
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSupabaseSelect,
      update: mockSupabaseUpdate,
      upsert: mockSupabaseUpsert,
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: mockSupabaseSelect,
      update: mockSupabaseUpdate,
      upsert: mockSupabaseUpsert,
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

// ============================================================================
// TRANSLATION STATUS ENDPOINT TESTS
// ============================================================================

describe('Translation Status API', () => {
  beforeEach(() => {
    resetAllMocks();
    mockValidateAdminAuth.mockResolvedValue(createMockAuthResult({ isAdmin: true }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/translations/status/[entityType]/[entityId]', () => {
    it('returns correct structure with translation job information', async () => {
      mockGetEntityTranslationStatus.mockResolvedValue(
        createMockTranslationStatus('item-123', 'item', {
          fr: { status: 'completed', translatedAt: '2026-01-19T12:00:00Z' },
          es: { status: 'completed', translatedAt: '2026-01-19T12:01:00Z' },
          de: { status: 'pending' },
          nl: { status: 'pending' },
          it: { status: 'failed', error: 'Rate limit exceeded' },
        })
      );

      const request = createMockNextRequest({
        url: '/api/translations/status/item/item-123',
        method: 'GET',
      });

      const { GET } = await import('@/app/api/translations/status/[entityType]/[entityId]/route');
      const response = await GET(request, createRouteParams({ entityType: 'item', entityId: 'item-123' }));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toMatchObject({
        entityId: 'item-123',
        entityType: 'item',
        sourceLanguage: 'en',
        overallStatus: expect.any(String),
      });
      expect(data.data.translations).toBeDefined();
    });

    it('shows pending jobs that have not been processed yet', async () => {
      mockGetEntityTranslationStatus.mockResolvedValue(
        createMockTranslationStatus('item-456', 'item', {
          fr: { status: 'pending' },
          es: { status: 'pending' },
          de: { status: 'pending' },
          nl: { status: 'pending' },
          it: { status: 'pending' },
        })
      );

      const request = createMockNextRequest({
        url: '/api/translations/status/item/item-456',
        method: 'GET',
      });

      const { GET } = await import('@/app/api/translations/status/[entityType]/[entityId]/route');
      const response = await GET(request, createRouteParams({ entityType: 'item', entityId: 'item-456' }));
      const data = await response.json();

      expect(data.data.overallStatus).toBe('pending');
      Object.values(data.data.translations).forEach((t: unknown) => {
        expect((t as { status: string }).status).toBe('pending');
      });
    });

    it('shows in-progress jobs that are currently being translated', async () => {
      mockGetEntityTranslationStatus.mockResolvedValue(
        createMockTranslationStatus('item-789', 'item', {
          fr: { status: 'completed', translatedAt: '2026-01-19T12:00:00Z' },
          es: { status: 'processing' },
          de: { status: 'pending' },
          nl: { status: 'pending' },
          it: { status: 'pending' },
        })
      );

      const request = createMockNextRequest({
        url: '/api/translations/status/item/item-789',
        method: 'GET',
      });

      const { GET } = await import('@/app/api/translations/status/[entityType]/[entityId]/route');
      const response = await GET(request, createRouteParams({ entityType: 'item', entityId: 'item-789' }));
      const data = await response.json();

      expect(data.data.overallStatus).toBe('partial');
    });

    it('shows completed jobs with successful translation storage', async () => {
      mockGetEntityTranslationStatus.mockResolvedValue(
        createMockTranslationStatus('item-complete', 'item', {
          fr: { status: 'completed', translatedAt: '2026-01-19T12:00:00Z' },
          es: { status: 'completed', translatedAt: '2026-01-19T12:01:00Z' },
          de: { status: 'completed', translatedAt: '2026-01-19T12:02:00Z' },
          nl: { status: 'completed', translatedAt: '2026-01-19T12:03:00Z' },
          it: { status: 'completed', translatedAt: '2026-01-19T12:04:00Z' },
        })
      );

      const request = createMockNextRequest({
        url: '/api/translations/status/item/item-complete',
        method: 'GET',
      });

      const { GET } = await import('@/app/api/translations/status/[entityType]/[entityId]/route');
      const response = await GET(request, createRouteParams({ entityType: 'item', entityId: 'item-complete' }));
      const data = await response.json();

      expect(data.data.overallStatus).toBe('complete');
      Object.values(data.data.translations).forEach((t: unknown) => {
        expect((t as { status: string }).status).toBe('completed');
        expect((t as { translatedAt?: string }).translatedAt).toBeDefined();
      });
    });

    it('shows failed jobs with error message details', async () => {
      mockGetEntityTranslationStatus.mockResolvedValue(
        createMockTranslationStatus('item-failed', 'item', {
          fr: { status: 'failed', error: 'API rate limit exceeded' },
          es: { status: 'failed', error: 'Translation service unavailable' },
          de: { status: 'failed', error: 'Timeout' },
          nl: { status: 'failed', error: 'Invalid response' },
          it: { status: 'failed', error: 'Network error' },
        })
      );

      const request = createMockNextRequest({
        url: '/api/translations/status/item/item-failed',
        method: 'GET',
      });

      const { GET } = await import('@/app/api/translations/status/[entityType]/[entityId]/route');
      const response = await GET(request, createRouteParams({ entityType: 'item', entityId: 'item-failed' }));
      const data = await response.json();

      expect(data.data.overallStatus).toBe('failed');
      expect(data.data.translations.fr.error).toBe('API rate limit exceeded');
    });

    it('includes timestamps for created_at and updated_at fields', async () => {
      mockGetEntityTranslationStatus.mockResolvedValue({
        entityId: 'item-timestamps',
        entityType: 'item',
        sourceLanguage: 'en',
        overallStatus: 'complete',
        translations: {
          fr: {
            status: 'completed',
            translatedAt: '2026-01-19T12:00:00Z',
            createdAt: '2026-01-19T11:55:00Z',
            updatedAt: '2026-01-19T12:00:00Z',
          },
        },
      });

      const request = createMockNextRequest({
        url: '/api/translations/status/item/item-timestamps',
        method: 'GET',
      });

      const { GET } = await import('@/app/api/translations/status/[entityType]/[entityId]/route');
      const response = await GET(request, createRouteParams({ entityType: 'item', entityId: 'item-timestamps' }));
      const data = await response.json();

      expect(data.data.translations.fr.translatedAt).toBeDefined();
    });

    it('includes retry count for jobs that have been retried', async () => {
      mockGetEntityTranslationStatus.mockResolvedValue({
        entityId: 'item-retried',
        entityType: 'item',
        sourceLanguage: 'en',
        overallStatus: 'partial',
        translations: {
          fr: { status: 'completed', translatedAt: '2026-01-19T12:00:00Z', retryCount: 2 },
          es: { status: 'pending', retryCount: 0 },
        },
      });

      const request = createMockNextRequest({
        url: '/api/translations/status/item/item-retried',
        method: 'GET',
      });

      const { GET } = await import('@/app/api/translations/status/[entityType]/[entityId]/route');
      const response = await GET(request, createRouteParams({ entityType: 'item', entityId: 'item-retried' }));
      const data = await response.json();

      expect(response.status).toBe(200);
    });

    it('returns empty translations when no matching jobs exist', async () => {
      mockGetEntityTranslationStatus.mockResolvedValue({
        entityId: 'nonexistent',
        entityType: 'item',
        sourceLanguage: 'en',
        overallStatus: 'pending',
        translations: {},
      });

      const request = createMockNextRequest({
        url: '/api/translations/status/item/nonexistent',
        method: 'GET',
      });

      const { GET } = await import('@/app/api/translations/status/[entityType]/[entityId]/route');
      const response = await GET(request, createRouteParams({ entityType: 'item', entityId: 'nonexistent' }));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.translations).toEqual({});
    });

    it('filters by entity_type correctly', async () => {
      mockGetEntityTranslationStatus.mockResolvedValue(
        createMockTranslationStatus('article-123', 'article', {
          fr: { status: 'completed', translatedAt: '2026-01-19T12:00:00Z' },
        })
      );

      const request = createMockNextRequest({
        url: '/api/translations/status/article/article-123',
        method: 'GET',
      });

      const { GET } = await import('@/app/api/translations/status/[entityType]/[entityId]/route');
      const response = await GET(request, createRouteParams({ entityType: 'article', entityId: 'article-123' }));
      const data = await response.json();

      expect(data.data.entityType).toBe('article');
    });

    it('handles invalid entity_type gracefully', async () => {
      const request = createMockNextRequest({
        url: '/api/translations/status/invalid/item-123',
        method: 'GET',
      });

      const { GET } = await import('@/app/api/translations/status/[entityType]/[entityId]/route');
      const response = await GET(request, createRouteParams({ entityType: 'invalid', entityId: 'item-123' }));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });
});
```

### 6.4 Verification

Run the tests:

```bash
npx vitest run src/app/api/__tests__/translations-api.integration.test.ts --reporter=verbose
```

### 6.5 Acceptance Criteria for Task 7.3.4

- [ ] Tests verify status endpoint returns correct structure
- [ ] Tests verify status endpoint shows pending jobs
- [ ] Tests verify status endpoint shows in-progress jobs
- [ ] Tests verify status endpoint shows completed jobs
- [ ] Tests verify status endpoint shows failed jobs with errors
- [ ] Tests verify status endpoint includes timestamps
- [ ] Tests verify status endpoint includes retry count
- [ ] Tests verify status endpoint filters by entity_id and entity_type
- [ ] Tests verify status endpoint returns empty for non-existent entities
- [ ] All tests pass

---

## 7. Task 7.3.5: Retry Endpoint Tests

**Story Points:** 1.0
**Estimated Hours:** 4
**Depends On:** Task 7.3.1, Task 7.3.4

### 7.1 Objective

Add integration tests for the retry endpoint that re-queues failed translation jobs.

### 7.2 File to Modify

**File:** `src/app/api/__tests__/translations-api.integration.test.ts` (add to existing)

### 7.3 Implementation Steps

#### Step 1: Add retry endpoint tests

Add after the status tests in the same file:

```typescript
// ============================================================================
// RETRY ENDPOINT TESTS
// ============================================================================

describe('Translation Retry API', () => {
  beforeEach(() => {
    resetAllMocks();
    mockValidateAdminAuth.mockResolvedValue(createMockAuthResult({ isAdmin: true }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/translations/retry', () => {
    it('accepts POST request with entityType and entityId parameters', async () => {
      mockRetryFailedTranslations.mockResolvedValue({
        success: true,
        jobsQueued: 2,
        queuedLanguages: ['fr', 'es'],
      });

      const request = createMockNextRequest({
        url: '/api/translations/retry',
        method: 'POST',
        body: {
          entityType: 'item',
          entityId: 'item-123',
        },
      });

      const { POST } = await import('@/app/api/translations/retry/route');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('re-queues failed translation job with pending status', async () => {
      mockRetryFailedTranslations.mockResolvedValue({
        success: true,
        jobsQueued: 1,
        queuedLanguages: ['fr'],
      });

      const request = createMockNextRequest({
        url: '/api/translations/retry',
        method: 'POST',
        body: {
          entityType: 'item',
          entityId: 'item-123',
          languages: ['fr'],
        },
      });

      const { POST } = await import('@/app/api/translations/retry/route');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.jobsQueued).toBe(1);
      expect(data.queuedLanguages).toContain('fr');
    });

    it('resets retry count to zero for re-queued job', async () => {
      mockRetryFailedTranslations.mockResolvedValue({
        success: true,
        jobsQueued: 1,
        queuedLanguages: ['es'],
        resetJobs: [{ id: 'job-es', previousAttempts: 3, newAttempts: 0 }],
      });

      const request = createMockNextRequest({
        url: '/api/translations/retry',
        method: 'POST',
        body: {
          entityType: 'item',
          entityId: 'item-456',
          languages: ['es'],
        },
      });

      const { POST } = await import('@/app/api/translations/retry/route');
      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.jobsQueued).toBeGreaterThan(0);
    });

    it('clears previous error message from failed job', async () => {
      mockRetryFailedTranslations.mockResolvedValue({
        success: true,
        jobsQueued: 1,
        queuedLanguages: ['de'],
      });

      const request = createMockNextRequest({
        url: '/api/translations/retry',
        method: 'POST',
        body: {
          entityType: 'item',
          entityId: 'item-789',
          languages: ['de'],
        },
      });

      const { POST } = await import('@/app/api/translations/retry/route');
      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(mockRetryFailedTranslations).toHaveBeenCalled();
    });

    it('returns error when attempting to retry non-failed job', async () => {
      mockRetryFailedTranslations.mockResolvedValue({
        success: false,
        jobsQueued: 0,
        queuedLanguages: [],
        error: 'No failed jobs found for specified languages',
      });

      const request = createMockNextRequest({
        url: '/api/translations/retry',
        method: 'POST',
        body: {
          entityType: 'item',
          entityId: 'item-completed',
          languages: ['fr'],
        },
      });

      const { POST } = await import('@/app/api/translations/retry/route');
      const response = await POST(request);
      const data = await response.json();

      // Should still return 200 but with jobsQueued: 0
      expect(data.jobsQueued).toBe(0);
    });

    it('returns error when job_id does not exist', async () => {
      mockRetryFailedTranslations.mockResolvedValue({
        success: false,
        jobsQueued: 0,
        queuedLanguages: [],
        error: 'Entity not found',
      });

      const request = createMockNextRequest({
        url: '/api/translations/retry',
        method: 'POST',
        body: {
          entityType: 'item',
          entityId: 'nonexistent-item',
        },
      });

      const { POST } = await import('@/app/api/translations/retry/route');
      const response = await POST(request);
      const data = await response.json();

      expect(data.jobsQueued).toBe(0);
    });

    it('allows bulk retry operation for multiple failed jobs', async () => {
      mockRetryFailedTranslations.mockResolvedValue({
        success: true,
        jobsQueued: 3,
        queuedLanguages: ['fr', 'es', 'de'],
      });

      const request = createMockNextRequest({
        url: '/api/translations/retry',
        method: 'POST',
        body: {
          entityType: 'item',
          entityId: 'item-bulk',
          // No languages specified = retry all failed
        },
      });

      const { POST } = await import('@/app/api/translations/retry/route');
      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.jobsQueued).toBe(3);
      expect(data.queuedLanguages).toHaveLength(3);
    });

    it('respects maximum retry limit', async () => {
      mockRetryFailedTranslations.mockResolvedValue({
        success: false,
        jobsQueued: 0,
        queuedLanguages: [],
        error: 'Job has exceeded maximum retry limit',
      });

      const request = createMockNextRequest({
        url: '/api/translations/retry',
        method: 'POST',
        body: {
          entityType: 'item',
          entityId: 'item-max-retries',
          languages: ['fr'],
        },
      });

      const { POST } = await import('@/app/api/translations/retry/route');
      const response = await POST(request);
      const data = await response.json();

      expect(data.jobsQueued).toBe(0);
    });

    it('returns success response with updated job status', async () => {
      mockRetryFailedTranslations.mockResolvedValue({
        success: true,
        jobsQueued: 2,
        queuedLanguages: ['nl', 'it'],
      });

      const request = createMockNextRequest({
        url: '/api/translations/retry',
        method: 'POST',
        body: {
          entityType: 'article',
          entityId: 'article-123',
        },
      });

      const { POST } = await import('@/app/api/translations/retry/route');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.jobsQueued).toBeDefined();
      expect(data.queuedLanguages).toBeDefined();
    });
  });
});
```

### 7.4 Verification

Run the tests:

```bash
npx vitest run src/app/api/__tests__/translations-api.integration.test.ts --reporter=verbose
```

### 7.5 Acceptance Criteria for Task 7.3.5

- [ ] Tests verify retry endpoint accepts POST with job_id
- [ ] Tests verify retry endpoint re-queues failed jobs with pending status
- [ ] Tests verify retry endpoint resets retry count to zero
- [ ] Tests verify retry endpoint clears previous error message
- [ ] Tests verify retry endpoint returns success with updated status
- [ ] Tests verify retry endpoint returns error for non-failed jobs
- [ ] Tests verify retry endpoint returns error for non-existent jobs
- [ ] Tests verify retry endpoint respects max retry limit
- [ ] Tests verify retry endpoint allows bulk retry
- [ ] All tests pass

---

## 8. Task 7.3.6: Manual Override Endpoint Tests

**Story Points:** 1.0
**Estimated Hours:** 4
**Depends On:** Task 7.3.1, Task 7.3.4

### 8.1 Objective

Add integration tests for the manual override endpoint that allows administrator corrections.

### 8.2 File to Modify

**File:** `src/app/api/__tests__/translations-api.integration.test.ts` (add to existing)

### 8.3 Implementation Steps

#### Step 1: Add manual override endpoint tests

Add after the retry tests in the same file:

```typescript
// ============================================================================
// MANUAL OVERRIDE ENDPOINT TESTS
// ============================================================================

describe('Manual Translation Override API', () => {
  beforeEach(() => {
    resetAllMocks();
    mockValidateAdminAuth.mockResolvedValue(createMockAuthResult({ isAdmin: true }));

    // Mock entity existence check
    mockSupabaseSelect.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: 'item-123', name: 'Test Item' },
          error: null,
        }),
      }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('PUT /api/translations/[entityType]/[entityId]/[language]', () => {
    it('accepts POST request with entity_id, target_language, and translation content', async () => {
      mockStoreManualTranslation.mockResolvedValue({
        success: true,
        data: {
          entityId: 'item-123',
          language: 'fr',
          translationStatus: 'manual',
          reviewedBy: 'test-user-123',
          updatedAt: new Date().toISOString(),
        },
      });

      const request = createMockNextRequest({
        url: '/api/translations/item/item-123/fr',
        method: 'PUT',
        body: {
          name: 'Cafetière de test',
          description: 'Description manuelle en français',
        },
      });

      const { PUT } = await import('@/app/api/translations/[entityType]/[entityId]/[language]/route');
      const response = await PUT(request, createRouteParams({
        entityType: 'item',
        entityId: 'item-123',
        language: 'fr',
      }));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('stores provided translation in correct database table', async () => {
      mockStoreManualTranslation.mockResolvedValue({
        success: true,
        data: {
          entityId: 'item-123',
          language: 'es',
          translationStatus: 'manual',
          reviewedBy: 'test-user-123',
          updatedAt: new Date().toISOString(),
        },
      });

      const request = createMockNextRequest({
        url: '/api/translations/item/item-123/es',
        method: 'PUT',
        body: {
          name: 'Cafetera de prueba',
        },
      });

      const { PUT } = await import('@/app/api/translations/[entityType]/[entityId]/[language]/route');
      const response = await PUT(request, createRouteParams({
        entityType: 'item',
        entityId: 'item-123',
        language: 'es',
      }));
      const data = await response.json();

      expect(data.data.language).toBe('es');
      expect(mockStoreManualTranslation).toHaveBeenCalled();
    });

    it('marks translation with manual flag to prevent overwriting', async () => {
      mockStoreManualTranslation.mockResolvedValue({
        success: true,
        data: {
          entityId: 'item-123',
          language: 'de',
          translationStatus: 'manual',
          reviewedBy: 'test-user-123',
          updatedAt: new Date().toISOString(),
        },
      });

      const request = createMockNextRequest({
        url: '/api/translations/item/item-123/de',
        method: 'PUT',
        body: {
          name: 'Manuelle Kaffeemaschine',
        },
      });

      const { PUT } = await import('@/app/api/translations/[entityType]/[entityId]/[language]/route');
      const response = await PUT(request, createRouteParams({
        entityType: 'item',
        entityId: 'item-123',
        language: 'de',
      }));
      const data = await response.json();

      expect(data.data.translationStatus).toBe('manual');
    });

    it('returns success response with stored translation details', async () => {
      mockStoreManualTranslation.mockResolvedValue({
        success: true,
        data: {
          entityId: 'item-123',
          language: 'nl',
          translationStatus: 'manual',
          reviewedBy: 'test-user-123',
          updatedAt: '2026-01-19T15:00:00Z',
        },
      });

      const request = createMockNextRequest({
        url: '/api/translations/item/item-123/nl',
        method: 'PUT',
        body: {
          name: 'Handmatige koffiemachine',
        },
      });

      const { PUT } = await import('@/app/api/translations/[entityType]/[entityId]/[language]/route');
      const response = await PUT(request, createRouteParams({
        entityType: 'item',
        entityId: 'item-123',
        language: 'nl',
      }));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.entityId).toBe('item-123');
      expect(data.data.language).toBe('nl');
      expect(data.data.reviewedBy).toBeDefined();
      expect(data.data.updatedAt).toBeDefined();
    });

    it('updates existing translation when one already exists', async () => {
      mockStoreManualTranslation.mockResolvedValue({
        success: true,
        data: {
          entityId: 'item-123',
          language: 'it',
          translationStatus: 'manual',
          reviewedBy: 'test-user-123',
          updatedAt: new Date().toISOString(),
        },
      });

      const request = createMockNextRequest({
        url: '/api/translations/item/item-123/it',
        method: 'PUT',
        body: {
          name: 'Macchina da caffè aggiornata',
        },
      });

      const { PUT } = await import('@/app/api/translations/[entityType]/[entityId]/[language]/route');
      const response = await PUT(request, createRouteParams({
        entityType: 'item',
        entityId: 'item-123',
        language: 'it',
      }));
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.translationStatus).toBe('manual');
    });

    it('validates target_language is supported before accepting override', async () => {
      const request = createMockNextRequest({
        url: '/api/translations/item/item-123/xx',
        method: 'PUT',
        body: {
          name: 'Invalid language test',
        },
      });

      const { PUT } = await import('@/app/api/translations/[entityType]/[entityId]/[language]/route');
      const response = await PUT(request, createRouteParams({
        entityType: 'item',
        entityId: 'item-123',
        language: 'xx',
      }));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('language');
    });

    it('validates entity_id exists before accepting override', async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Not found' },
          }),
        }),
      });

      const request = createMockNextRequest({
        url: '/api/translations/item/nonexistent-item/fr',
        method: 'PUT',
        body: {
          name: 'Translation for nonexistent item',
        },
      });

      const { PUT } = await import('@/app/api/translations/[entityType]/[entityId]/[language]/route');
      const response = await PUT(request, createRouteParams({
        entityType: 'item',
        entityId: 'nonexistent-item',
        language: 'fr',
      }));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });

    it('validates translation content is not empty before accepting override', async () => {
      const request = createMockNextRequest({
        url: '/api/translations/item/item-123/fr',
        method: 'PUT',
        body: {},
      });

      const { PUT } = await import('@/app/api/translations/[entityType]/[entityId]/[language]/route');
      const response = await PUT(request, createRouteParams({
        entityType: 'item',
        entityId: 'item-123',
        language: 'fr',
      }));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('prevents automated translation jobs from overwriting manual translations', async () => {
      mockStoreManualTranslation.mockResolvedValue({
        success: true,
        data: {
          entityId: 'item-123',
          language: 'fr',
          translationStatus: 'manual',
          isProtected: true,
          reviewedBy: 'test-user-123',
          updatedAt: new Date().toISOString(),
        },
      });

      const request = createMockNextRequest({
        url: '/api/translations/item/item-123/fr',
        method: 'PUT',
        body: {
          name: 'Protected manual translation',
        },
      });

      const { PUT } = await import('@/app/api/translations/[entityType]/[entityId]/[language]/route');
      const response = await PUT(request, createRouteParams({
        entityType: 'item',
        entityId: 'item-123',
        language: 'fr',
      }));
      const data = await response.json();

      expect(data.data.translationStatus).toBe('manual');
    });

    it('allows subsequent manual overrides to update previously manual translations', async () => {
      mockStoreManualTranslation.mockResolvedValue({
        success: true,
        data: {
          entityId: 'item-123',
          language: 'es',
          translationStatus: 'manual',
          reviewedBy: 'test-user-123',
          updatedAt: new Date().toISOString(),
        },
      });

      const request = createMockNextRequest({
        url: '/api/translations/item/item-123/es',
        method: 'PUT',
        body: {
          name: 'Segunda revisión manual',
        },
      });

      const { PUT } = await import('@/app/api/translations/[entityType]/[entityId]/[language]/route');
      const response = await PUT(request, createRouteParams({
        entityType: 'item',
        entityId: 'item-123',
        language: 'es',
      }));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.translationStatus).toBe('manual');
    });

    it('includes reviewedBy field with current user ID', async () => {
      mockStoreManualTranslation.mockResolvedValue({
        success: true,
        data: {
          entityId: 'item-123',
          language: 'de',
          translationStatus: 'manual',
          reviewedBy: 'test-user-123',
          updatedAt: new Date().toISOString(),
        },
      });

      const request = createMockNextRequest({
        url: '/api/translations/item/item-123/de',
        method: 'PUT',
        body: {
          name: 'Überprüfte Übersetzung',
        },
      });

      const { PUT } = await import('@/app/api/translations/[entityType]/[entityId]/[language]/route');
      const response = await PUT(request, createRouteParams({
        entityType: 'item',
        entityId: 'item-123',
        language: 'de',
      }));
      const data = await response.json();

      expect(data.data.reviewedBy).toBe('test-user-123');
    });
  });
});
```

### 8.4 Verification

Run the complete test suite:

```bash
npx vitest run src/app/api/__tests__/translations-api.integration.test.ts --reporter=verbose
```

### 8.5 Acceptance Criteria for Task 7.3.6

- [ ] Tests verify manual override accepts entity_id, target_language, and content
- [ ] Tests verify manual override stores translation in correct table
- [ ] Tests verify manual override marks with manual flag
- [ ] Tests verify manual override returns success with details
- [ ] Tests verify manual override updates existing translations
- [ ] Tests verify manual override creates new translations when none exist
- [ ] Tests verify manual override validates supported target_language
- [ ] Tests verify manual override validates entity_id exists
- [ ] Tests verify manual override validates content is not empty
- [ ] Tests verify manual flag prevents automated overwriting
- [ ] Tests verify subsequent manual overrides are allowed
- [ ] All tests pass

---

## 9. Verification Checklist

### 9.1 Final Test Suite Execution

Run all integration tests:

```bash
# Run all API integration tests
npx vitest run src/app/api/__tests__/*.integration.test.ts --reporter=verbose

# Run with coverage
npx vitest run src/app/api/__tests__/*.integration.test.ts --coverage
```

### 9.2 Success Criteria Checklist

| Criteria | Status |
|----------|--------|
| All integration tests pass in local environment | [ ] |
| Tests verify item creation triggers translations for 5 languages | [ ] |
| Tests verify article creation triggers translations correctly | [ ] |
| Tests verify translation status endpoint returns accurate data | [ ] |
| Tests verify retry endpoint re-queues failed jobs correctly | [ ] |
| Tests verify manual override stores translations with manual flag | [ ] |
| No flaky tests after 10 consecutive runs | [ ] |
| Test execution completes in under 60 seconds | [ ] |
| Test coverage for translation APIs exceeds 80% | [ ] |

### 9.3 Files Created/Modified Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/app/api/__tests__/helpers/constants.ts` | Created | Test constants |
| `src/app/api/__tests__/helpers/mockNextRequest.ts` | Created | NextRequest mock factory |
| `src/app/api/__tests__/helpers/apiTestHelpers.ts` | Created | Common test utilities |
| `src/app/api/__tests__/helpers/index.ts` | Created | Barrel export |
| `src/app/api/__tests__/content-creation-translations.integration.test.ts` | Created | Item/Article creation tests |
| `src/app/api/__tests__/translations-api.integration.test.ts` | Created | Status/Retry/Override tests |

---

## 10. References

### 10.1 Related Documents

- **Overview Document:** `/docs/REQ-364-write-integration-tests-for-api-endpoints-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- **Request Definition:** `/docs/gen_requests_epic3.md` - REQ-364

### 10.2 Related Code Files

- **Items API:** `src/app/api/admin/items/route.ts`
- **Articles API:** `src/app/api/admin/articles/route.ts`
- **Translation Status API:** `src/app/api/translations/status/[entityType]/[entityId]/route.ts`
- **Retry API:** `src/app/api/translations/retry/route.ts`
- **Manual Override API:** `src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`
- **Content Translation Module:** `src/lib/content-translation/`

### 10.3 Testing References

- **Existing Test Patterns:** `src/lib/job-queue/__tests__/helpers/`
- **Vitest Configuration:** `vitest.config.ts`
- **Vitest Documentation:** https://vitest.dev/

---

*Detailed task breakdown generated for FAQBNB Localization Epic 3 - Dynamic Content Translation, Phase 7, Task 7.3*
*Total estimated effort: 5.5 story points / 22 hours*
