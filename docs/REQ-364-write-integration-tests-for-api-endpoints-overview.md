# REQ-364: Integration Tests for API Endpoints - Implementation Overview

**Generated:** 2026-01-19 15:00:00 UTC
**Last Modified:** 2026-01-19 15:00:00 UTC
**Request Reference:** REQ-364 in `/docs/gen_requests_epic3.md`
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
**Phase:** 7 - Testing & Validation
**Task ID:** 7.3

---

## 1. Executive Summary

This document provides a comprehensive technical breakdown for implementing integration tests for the translation API endpoints. The tests will verify that item creation triggers translations, article creation triggers translations, translation status endpoint returns accurate data, retry endpoint re-queues failed translations, and manual override endpoint allows administrator corrections. These tests ensure the complete translation workflow operates correctly from content creation through status tracking and error recovery.

---

## 2. Request Reference

### From `docs/gen_requests_epic3.md` - REQ-364

**Summary**: The translation system must have comprehensive integration tests that verify API endpoints correctly trigger translation workflows, report translation status accurately, handle retry operations appropriately, and allow manual translation overrides when needed.

### Key Test Areas (from Implementation Plan Task 7.3)

1. **Test item creation triggers translations**
2. **Test article creation triggers translations**
3. **Test translation status endpoint**
4. **Test retry endpoint**
5. **Test manual override endpoint**

### Acceptance Criteria (from Request)

**Item Creation Endpoint Tests:**
- [ ] Tests verify that creating an item through POST endpoint returns success status
- [ ] Tests verify that creating an item automatically creates translation jobs in database
- [ ] Tests verify translation jobs are created for all supported target languages
- [ ] Tests verify translation jobs include correct entity_id referencing the created item
- [ ] Tests verify translation jobs include correct entity_type value of items
- [ ] Tests verify translation jobs include source_language matching user preference or system default
- [ ] Tests verify translation jobs include correct priority level for item entity type
- [ ] Tests verify translation jobs include translatable fields such as title and description

**Article Creation Endpoint Tests:**
- [ ] Tests verify that creating an article through POST endpoint returns success status
- [ ] Tests verify that creating an article automatically creates translation jobs in database
- [ ] Tests verify translation jobs are created for all supported target languages
- [ ] Tests verify translation jobs include correct entity_type value of articles
- [ ] Tests verify translation jobs include translatable fields such as title and content

**Translation Status Endpoint Tests:**
- [ ] Tests verify status endpoint returns correct structure with translation job information
- [ ] Tests verify status endpoint shows pending, in-progress, completed, and failed states
- [ ] Tests verify status endpoint includes timestamps for created_at and updated_at fields
- [ ] Tests verify status endpoint includes retry count for jobs that have been retried
- [ ] Tests verify status endpoint filters by entity_id, entity_type, and target_language
- [ ] Tests verify status endpoint returns empty array when no matching jobs exist

**Retry Endpoint Tests:**
- [ ] Tests verify retry endpoint accepts POST request with job_id parameter
- [ ] Tests verify retry endpoint re-queues failed translation job with pending status
- [ ] Tests verify retry endpoint resets retry count to zero for re-queued job
- [ ] Tests verify retry endpoint clears previous error message from failed job
- [ ] Tests verify retry endpoint returns error when attempting to retry non-failed job
- [ ] Tests verify retry endpoint allows bulk retry operation for multiple failed jobs

**Manual Override Endpoint Tests:**
- [ ] Tests verify manual override endpoint accepts POST request with entity_id, target_language, and translation content
- [ ] Tests verify manual override endpoint stores provided translation in correct database table
- [ ] Tests verify manual override endpoint marks translation with manual flag to prevent overwriting
- [ ] Tests verify manual override endpoint validates target_language is supported
- [ ] Tests verify manual override endpoint prevents automated translation jobs from overwriting manual translations

---

## 3. Implementation Plan Reference

**Source**: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`

### Relevant Sections

- **Phase 7: Testing & Validation** - Task 7.3: Write integration tests for API endpoints

### API Endpoints Under Test (from Plan)

```
/src/app/api/
├── admin/
│   ├── items/route.ts                 # POST: Create item (triggers translations)
│   ├── items/[id]/route.ts            # PUT: Update item (triggers translations)
│   ├── articles/route.ts              # POST: Create article (triggers translations)
│   └── articles/[id]/route.ts         # PUT: Update article (triggers translations)
└── translations/                       # Translation management APIs
    ├── status/
    │   └── [entityType]/
    │       └── [entityId]/route.ts    # GET: Translation status
    ├── retry/route.ts                 # POST: Retry failed translations
    └── [entityType]/
        └── [entityId]/
            └── [language]/route.ts    # PUT: Manual override
```

### Integration Contract (from Plan)

**Modified: Create/Update Item**
```typescript
// POST /api/admin/items
// Response (extended)
interface CreateItemResponse {
  success: boolean;
  data: Item;
  translationJobIds?: string[]; // IDs of queued translation jobs
  accountContext?: {...};
}
```

**Translation Status Endpoint**
```typescript
// GET /api/translations/status/{entityType}/{entityId}
interface TranslationStatusResponse {
  success: boolean;
  data: {
    entityId: string;
    entityType: EntityType;
    sourceLanguage: string;
    translations: {
      [language: string]: {
        status: 'pending' | 'completed' | 'failed' | 'manual';
        translatedAt?: string;
        reviewedBy?: string;
        error?: string;
      }
    };
    overallStatus: 'complete' | 'partial' | 'pending' | 'failed';
  };
  error?: string;
}
```

**Retry Failed Translations**
```typescript
// POST /api/translations/retry
interface RetryTranslationRequest {
  entityType: EntityType;
  entityId: string;
  languages?: string[]; // Optional, retry all failed if omitted
}

interface RetryTranslationResponse {
  success: boolean;
  jobsQueued: number;
  queuedLanguages: string[];
  error?: string;
}
```

**Manual Translation Override**
```typescript
// PUT /api/translations/{entityType}/{entityId}/{language}
interface ManualTranslationRequest {
  name?: string;        // For items
  title?: string;       // For articles/links
  description?: string; // For items/articles
}

interface ManualTranslationResponse {
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
```

---

## 4. Existing Patterns Analysis

### 4.1 Integration Test Patterns in Codebase

**Reference Files**:
- `src/lib/job-queue/__tests__/job-processing.integration.test.ts` - Job processing integration tests
- `src/lib/job-queue/__tests__/concurrent-processing.integration.test.ts` - Concurrent processing tests
- `src/__tests__/beta-access-requests.test.ts` - API integration testing with mocked fetch
- `src/lib/translation-service/__tests__/translation-service.test.ts` - Service unit tests

**Key Patterns Identified**:

1. **Mock Setup Pattern**: Use `vi.mock()` for external dependencies
2. **Chainable Supabase Mock**: Create mock objects that support method chaining
3. **Snake_case/camelCase Conversion**: Handle database row format differences
4. **Factory Functions**: Create mock data with consistent shapes using overrides
5. **beforeEach/afterEach**: Reset database and mocks for test isolation

### 4.2 Testing Framework Configuration

**From `vitest.config.ts`**:
```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    testTimeout: 10000,
  },
});
```

### 4.3 Existing Mock Helpers

**From `src/lib/job-queue/__tests__/helpers/`**:
- `mockFactories.ts` - Factory functions for test data
- `mockSupabase.ts` - In-memory mock database
- `testUtils.ts` - Common test utilities
- `constants.ts` - Test constants (languages, statuses, etc.)

### 4.4 API Route Testing Approach

**Pattern from existing tests**:
```typescript
// Mock NextRequest
const mockRequest = {
  url: 'http://localhost:3000/api/admin/items',
  method: 'POST',
  headers: new Headers({ 'content-type': 'application/json' }),
  json: () => Promise.resolve(requestBody),
};

// Import and call route handler directly
const { POST } = await import('../route');
const response = await POST(mockRequest as NextRequest);
const data = await response.json();
```

---

## 5. Authorized Files and Functions for Modification

### 5.1 New Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/app/api/__tests__/translations-api.integration.test.ts` | Main integration test file for translation API endpoints |
| `src/app/api/__tests__/content-creation-translations.integration.test.ts` | Tests for item/article creation triggering translations |
| `src/app/api/__tests__/helpers/apiTestHelpers.ts` | Shared API test helper functions |
| `src/app/api/__tests__/helpers/mockNextRequest.ts` | NextRequest mock factory |

### 5.2 Existing Files to Reference (Read-Only)

| File Path | Reference Purpose |
|-----------|------------------|
| `src/app/api/admin/items/route.ts` | Items API route under test |
| `src/app/api/admin/articles/route.ts` | Articles API route under test |
| `src/app/api/translations/status/[entityType]/[entityId]/route.ts` | Status API under test |
| `src/app/api/translations/retry/route.ts` | Retry API under test |
| `src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` | Manual override API under test |
| `src/lib/content-translation/` | Content translation module to be mocked |
| `src/lib/job-queue/__tests__/helpers/` | Existing test helper patterns |

### 5.3 Functions to Mock

| Function | Module | Mock Purpose |
|----------|--------|--------------|
| `validateAdminAuth` | `@/lib/auth-server` | Bypass authentication for tests |
| `queueContentTranslations` | `@/lib/content-translation` | Verify translation triggering |
| `getEntityTranslationStatus` | `@/lib/content-translation/storage/translation-status` | Control status responses |
| `supabaseAdmin.from()` | `@/lib/supabase` | Mock database operations |

---

## 6. Task Breakdown

### Task 7.3.1: Create API Test Infrastructure [0.5 story points]

**Create test helper files**:
- `apiTestHelpers.ts`: Common API testing utilities
- `mockNextRequest.ts`: NextRequest mock factory

**API Test Helpers Required**:
```typescript
// apiTestHelpers.ts
import { vi } from 'vitest';
import type { NextRequest } from 'next/server';

export function createMockNextRequest(options: {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  searchParams?: Record<string, string>;
}): NextRequest {
  const url = new URL(options.url);
  if (options.searchParams) {
    Object.entries(options.searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return {
    url: url.toString(),
    method: options.method,
    headers: new Headers({
      'content-type': 'application/json',
      ...options.headers,
    }),
    json: () => Promise.resolve(options.body || {}),
    nextUrl: url,
  } as unknown as NextRequest;
}

export function createMockAuthResult(options?: {
  userId?: string;
  isAdmin?: boolean;
  accountId?: string;
}) {
  return {
    error: null,
    user: {
      id: options?.userId || 'test-user-123',
      email: 'test@example.com',
      preferred_language: 'en',
    },
    isAdmin: options?.isAdmin ?? true,
    supabase: createMockSupabaseClient(),
  };
}

export function createMockSupabaseClient() {
  const mockChain = createChainableMock();
  return {
    from: vi.fn(() => mockChain),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  };
}

function createChainableMock() {
  const mock: Record<string, ReturnType<typeof vi.fn>> = {};

  ['select', 'insert', 'update', 'upsert', 'delete', 'eq', 'in', 'is', 'not', 'order', 'limit'].forEach(method => {
    mock[method] = vi.fn().mockReturnValue(mock);
  });

  mock.single = vi.fn().mockResolvedValue({ data: null, error: null });
  mock.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });

  return mock;
}
```

### Task 7.3.2: Item Creation Translation Trigger Tests [1 story point]

**File**: `content-creation-translations.integration.test.ts`

**Test Suites**:

1. **Item Creation Triggers Translations**
   - Test POST /api/admin/items returns success with translationJobIds
   - Test translation jobs are created for all 5 target languages
   - Test translation jobs have correct entity_id and entity_type
   - Test translation jobs have correct source_language
   - Test translation jobs have correct priority for items
   - Test item with minimal fields triggers translations
   - Test item with all fields triggers translations

2. **Item Update Triggers Translations**
   - Test PUT /api/admin/items/[id] triggers translation re-queue
   - Test existing translations are deleted before re-queue
   - Test update response includes new translationJobIds

**Sample Test Structure**:
```typescript
// content-creation-translations.integration.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMockNextRequest, createMockAuthResult } from './helpers/apiTestHelpers';
import {
  resetMockDatabase,
  seedMockDatabase,
  getTableRecords,
} from '../../lib/job-queue/__tests__/helpers/mockSupabase';
import {
  TEST_LANGUAGES,
  TABLE_NAMES,
} from '../../lib/job-queue/__tests__/helpers/constants';

// Mock auth
vi.mock('@/lib/auth-server', () => ({
  validateAdminAuth: vi.fn(() => Promise.resolve(createMockAuthResult())),
}));

// Mock content translation module
const mockQueueContentTranslations = vi.fn();
vi.mock('@/lib/content-translation', () => ({
  queueContentTranslations: mockQueueContentTranslations,
}));

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: createMockSupabaseClient(),
  supabaseAdmin: createMockSupabaseClient(),
}));

describe('Item Creation Translation Triggers', () => {
  beforeEach(() => {
    resetMockDatabase();
    vi.clearAllMocks();

    // Default mock return for queueContentTranslations
    mockQueueContentTranslations.mockResolvedValue({
      success: true,
      jobIds: ['job-1', 'job-2', 'job-3', 'job-4', 'job-5'],
      queuedLanguages: ['fr', 'es', 'de', 'nl', 'it'],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/admin/items', () => {
    it('creates item and triggers translations for all target languages', async () => {
      const requestBody = {
        publicId: 'test-item-001',
        name: 'Test Coffee Maker',
        description: 'A high-quality coffee maker for your morning brew',
        propertyId: 'property-123',
      };

      const request = createMockNextRequest({
        url: 'http://localhost:3000/api/admin/items',
        method: 'POST',
        body: requestBody,
      });

      const { POST } = await import('@/app/api/admin/items/route');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.translationJobIds).toBeDefined();
      expect(data.translationJobIds).toHaveLength(5);

      // Verify queueContentTranslations was called correctly
      expect(mockQueueContentTranslations).toHaveBeenCalledTimes(1);
      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            entityType: 'item',
            sourceLanguage: expect.any(String),
            fields: expect.arrayContaining([
              expect.objectContaining({ fieldName: 'name' }),
              expect.objectContaining({ fieldName: 'description' }),
            ]),
          }),
          trigger: 'create',
        })
      );
    });

    it('includes correct priority level for item entity type', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/api/admin/items',
        method: 'POST',
        body: {
          publicId: 'priority-test-item',
          name: 'Priority Test',
          propertyId: 'property-123',
        },
      });

      const { POST } = await import('@/app/api/admin/items/route');
      await POST(request);

      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          trigger: 'create',
          // Priority 100 for newly created content
        })
      );
    });

    it('respects sourceLanguage override when provided', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/api/admin/items',
        method: 'POST',
        body: {
          publicId: 'french-item',
          name: 'Cafetière',
          description: 'Une cafetière de haute qualité',
          propertyId: 'property-123',
          sourceLanguage: 'fr',
        },
      });

      const { POST } = await import('@/app/api/admin/items/route');
      await POST(request);

      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            sourceLanguage: 'fr',
          }),
        })
      );
    });

    it('handles item with minimal required fields', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/api/admin/items',
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
        url: 'http://localhost:3000/api/admin/items',
        method: 'POST',
        body: {
          publicId: 'full-item',
          name: 'Full Featured Item',
          description: 'Complete description with all details',
          propertyId: 'property-123',
          tags: ['appliance', 'kitchen'],
          sourceLanguage: 'en',
        },
      });

      const { POST } = await import('@/app/api/admin/items/route');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.translationJobIds).toBeDefined();
    });
  });
});
```

### Task 7.3.3: Article Creation Translation Trigger Tests [1 story point]

**File**: `content-creation-translations.integration.test.ts` (add to existing)

**Test Suites**:

1. **Article Creation Triggers Translations**
   - Test POST /api/admin/articles returns success with translationJobIds
   - Test translation jobs are created for all 5 target languages
   - Test translation jobs have correct entity_type 'article'
   - Test translation jobs include title and description fields
   - Test article with minimal fields triggers translations

**Sample Test Structure**:
```typescript
describe('Article Creation Translation Triggers', () => {
  beforeEach(() => {
    resetMockDatabase();
    vi.clearAllMocks();

    mockQueueContentTranslations.mockResolvedValue({
      success: true,
      jobIds: ['article-job-1', 'article-job-2', 'article-job-3', 'article-job-4', 'article-job-5'],
      queuedLanguages: ['fr', 'es', 'de', 'nl', 'it'],
    });

    // Seed required item for article
    seedMockDatabase('items', [{
      id: 'item-for-article',
      public_id: 'test-item',
      name: 'Test Item',
    }]);
  });

  describe('POST /api/admin/articles', () => {
    it('creates article and triggers translations for all target languages', async () => {
      const requestBody = {
        itemId: 'item-for-article',
        title: 'How to use the coffee maker',
        description: 'Step by step instructions for making coffee',
        purposeType: 'how-to',
      };

      const request = createMockNextRequest({
        url: 'http://localhost:3000/api/admin/articles',
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

      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            entityType: 'article',
            fields: expect.arrayContaining([
              expect.objectContaining({ fieldName: 'title' }),
              expect.objectContaining({ fieldName: 'description' }),
            ]),
          }),
          trigger: 'create',
        })
      );
    });

    it('includes correct entity_type value of articles', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/api/admin/articles',
        method: 'POST',
        body: {
          itemId: 'item-for-article',
          title: 'Test Article',
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
  });
});
```

### Task 7.3.4: Translation Status Endpoint Tests [1 story point]

**File**: `translations-api.integration.test.ts`

**Test Suites**:

1. **Status Endpoint Response Structure**
   - Test returns correct JSON structure
   - Test includes all required fields
   - Test includes timestamps

2. **Status Filtering**
   - Test filters by entity_id
   - Test filters by entity_type
   - Test filters by target_language
   - Test handles invalid parameters

3. **Status Values**
   - Test shows pending jobs
   - Test shows in-progress jobs
   - Test shows completed jobs
   - Test shows failed jobs with error details

**Sample Test Structure**:
```typescript
// translations-api.integration.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMockNextRequest, createMockAuthResult } from './helpers/apiTestHelpers';
import {
  resetMockDatabase,
  seedMockDatabase,
} from '../../lib/job-queue/__tests__/helpers/mockSupabase';

// Mock getEntityTranslationStatus
const mockGetEntityTranslationStatus = vi.fn();
vi.mock('@/lib/content-translation/storage/translation-status', () => ({
  getEntityTranslationStatus: mockGetEntityTranslationStatus,
}));

describe('Translation Status API', () => {
  beforeEach(() => {
    resetMockDatabase();
    vi.clearAllMocks();
  });

  describe('GET /api/translations/status/[entityType]/[entityId]', () => {
    it('returns correct structure with translation job information', async () => {
      mockGetEntityTranslationStatus.mockResolvedValue({
        entityId: 'item-123',
        entityType: 'item',
        sourceLanguage: 'en',
        overallStatus: 'partial',
        translations: {
          fr: { status: 'completed', translatedAt: '2026-01-19T12:00:00Z' },
          es: { status: 'completed', translatedAt: '2026-01-19T12:01:00Z' },
          de: { status: 'pending' },
          nl: { status: 'pending' },
          it: { status: 'failed', error: 'Rate limit exceeded' },
        },
      });

      const request = createMockNextRequest({
        url: 'http://localhost:3000/api/translations/status/item/item-123',
        method: 'GET',
      });

      const { GET } = await import('@/app/api/translations/status/[entityType]/[entityId]/route');
      const response = await GET(request, { params: { entityType: 'item', entityId: 'item-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toMatchObject({
        entityId: 'item-123',
        entityType: 'item',
        sourceLanguage: 'en',
        overallStatus: 'partial',
      });
      expect(data.data.translations).toBeDefined();
      expect(data.data.translations.fr.status).toBe('completed');
      expect(data.data.translations.fr.translatedAt).toBeDefined();
    });

    it('shows pending jobs that have not been processed yet', async () => {
      mockGetEntityTranslationStatus.mockResolvedValue({
        entityId: 'item-456',
        entityType: 'item',
        sourceLanguage: 'en',
        overallStatus: 'pending',
        translations: {
          fr: { status: 'pending' },
          es: { status: 'pending' },
          de: { status: 'pending' },
          nl: { status: 'pending' },
          it: { status: 'pending' },
        },
      });

      const request = createMockNextRequest({
        url: 'http://localhost:3000/api/translations/status/item/item-456',
        method: 'GET',
      });

      const { GET } = await import('@/app/api/translations/status/[entityType]/[entityId]/route');
      const response = await GET(request, { params: { entityType: 'item', entityId: 'item-456' } });
      const data = await response.json();

      expect(data.data.overallStatus).toBe('pending');
      Object.values(data.data.translations).forEach((t: any) => {
        expect(t.status).toBe('pending');
      });
    });

    it('shows failed jobs with error message details', async () => {
      mockGetEntityTranslationStatus.mockResolvedValue({
        entityId: 'item-789',
        entityType: 'item',
        sourceLanguage: 'en',
        overallStatus: 'failed',
        translations: {
          fr: { status: 'failed', error: 'API rate limit exceeded' },
          es: { status: 'failed', error: 'Translation service unavailable' },
          de: { status: 'failed', error: 'Timeout' },
          nl: { status: 'failed', error: 'Invalid response' },
          it: { status: 'failed', error: 'Network error' },
        },
      });

      const request = createMockNextRequest({
        url: 'http://localhost:3000/api/translations/status/item/item-789',
        method: 'GET',
      });

      const { GET } = await import('@/app/api/translations/status/[entityType]/[entityId]/route');
      const response = await GET(request, { params: { entityType: 'item', entityId: 'item-789' } });
      const data = await response.json();

      expect(data.data.overallStatus).toBe('failed');
      expect(data.data.translations.fr.error).toBe('API rate limit exceeded');
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
        url: 'http://localhost:3000/api/translations/status/item/nonexistent',
        method: 'GET',
      });

      const { GET } = await import('@/app/api/translations/status/[entityType]/[entityId]/route');
      const response = await GET(request, { params: { entityType: 'item', entityId: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.translations).toEqual({});
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
        url: 'http://localhost:3000/api/translations/status/item/item-timestamps',
        method: 'GET',
      });

      const { GET } = await import('@/app/api/translations/status/[entityType]/[entityId]/route');
      const response = await GET(request, { params: { entityType: 'item', entityId: 'item-timestamps' } });
      const data = await response.json();

      expect(data.data.translations.fr.translatedAt).toBeDefined();
    });
  });
});
```

### Task 7.3.5: Retry Endpoint Tests [1 story point]

**File**: `translations-api.integration.test.ts` (add to existing)

**Test Suites**:

1. **Retry Single Job**
   - Test accepts job_id parameter
   - Test re-queues failed job
   - Test resets retry count
   - Test clears error message
   - Test returns updated status

2. **Retry Validation**
   - Test rejects retry of non-failed job
   - Test rejects retry of non-existent job
   - Test respects max retry limit

3. **Bulk Retry**
   - Test accepts multiple job_ids
   - Test re-queues all failed jobs

**Sample Test Structure**:
```typescript
describe('Translation Retry API', () => {
  describe('POST /api/translations/retry', () => {
    it('re-queues failed translation job with pending status', async () => {
      // Seed a failed job
      seedMockDatabase('translation_jobs', [{
        id: 'failed-job-1',
        entity_type: 'item',
        entity_id: 'item-123',
        target_language: 'fr',
        status: 'failed',
        attempts: 2,
        error_message: 'API error',
      }]);

      const request = createMockNextRequest({
        url: 'http://localhost:3000/api/translations/retry',
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
      seedMockDatabase('translation_jobs', [{
        id: 'retry-count-job',
        entity_type: 'item',
        entity_id: 'item-456',
        target_language: 'es',
        status: 'failed',
        attempts: 3,
        error_message: 'Max retries exceeded',
      }]);

      const request = createMockNextRequest({
        url: 'http://localhost:3000/api/translations/retry',
        method: 'POST',
        body: {
          entityType: 'item',
          entityId: 'item-456',
        },
      });

      const { POST } = await import('@/app/api/translations/retry/route');
      await POST(request);

      // Verify job was reset
      const jobs = getTableRecords('translation_jobs');
      const resetJob = jobs.find(j => j.id === 'retry-count-job');
      expect(resetJob?.attempts).toBe(0);
      expect(resetJob?.status).toBe('queued');
      expect(resetJob?.error_message).toBeNull();
    });

    it('returns error when attempting to retry non-failed job', async () => {
      seedMockDatabase('translation_jobs', [{
        id: 'completed-job',
        entity_type: 'item',
        entity_id: 'item-789',
        target_language: 'de',
        status: 'completed',
        attempts: 1,
      }]);

      const request = createMockNextRequest({
        url: 'http://localhost:3000/api/translations/retry',
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

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('not in failed state');
    });

    it('allows bulk retry operation for multiple failed jobs', async () => {
      seedMockDatabase('translation_jobs', [
        { id: 'bulk-job-1', entity_type: 'item', entity_id: 'item-bulk', target_language: 'fr', status: 'failed', attempts: 1 },
        { id: 'bulk-job-2', entity_type: 'item', entity_id: 'item-bulk', target_language: 'es', status: 'failed', attempts: 1 },
        { id: 'bulk-job-3', entity_type: 'item', entity_id: 'item-bulk', target_language: 'de', status: 'failed', attempts: 1 },
      ]);

      const request = createMockNextRequest({
        url: 'http://localhost:3000/api/translations/retry',
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
  });
});
```

### Task 7.3.6: Manual Override Endpoint Tests [1 story point]

**File**: `translations-api.integration.test.ts` (add to existing)

**Test Suites**:

1. **Manual Override Storage**
   - Test accepts entity_id, target_language, and translation content
   - Test stores translation in correct table
   - Test marks with manual flag
   - Test returns success response

2. **Override Validation**
   - Test validates target_language is supported
   - Test validates entity_id exists
   - Test validates translation content is not empty

3. **Override Persistence**
   - Test prevents automated jobs from overwriting manual translations
   - Test allows subsequent manual overrides

**Sample Test Structure**:
```typescript
describe('Manual Translation Override API', () => {
  describe('PUT /api/translations/[entityType]/[entityId]/[language]', () => {
    it('stores provided translation in correct database table', async () => {
      // Seed the item
      seedMockDatabase('items', [{
        id: 'item-override',
        public_id: 'override-item',
        name: 'Override Test Item',
      }]);

      const request = createMockNextRequest({
        url: 'http://localhost:3000/api/translations/item/item-override/fr',
        method: 'PUT',
        body: {
          name: 'Article de test pour remplacement manuel',
          description: 'Description manuelle en français',
        },
      });

      const { PUT } = await import('@/app/api/translations/[entityType]/[entityId]/[language]/route');
      const response = await PUT(request, {
        params: { entityType: 'item', entityId: 'item-override', language: 'fr' }
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.language).toBe('fr');
      expect(data.data.translationStatus).toBe('manual');
    });

    it('marks translation with manual flag to prevent overwriting', async () => {
      seedMockDatabase('items', [{ id: 'manual-flag-item', name: 'Manual Flag Test' }]);

      const request = createMockNextRequest({
        url: 'http://localhost:3000/api/translations/item/manual-flag-item/es',
        method: 'PUT',
        body: { name: 'Nombre manual' },
      });

      const { PUT } = await import('@/app/api/translations/[entityType]/[entityId]/[language]/route');
      const response = await PUT(request, {
        params: { entityType: 'item', entityId: 'manual-flag-item', language: 'es' }
      });
      const data = await response.json();

      expect(data.data.translationStatus).toBe('manual');
      expect(data.data.reviewedBy).toBeDefined();
    });

    it('validates target_language is supported before accepting override', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/api/translations/item/item-123/xx',
        method: 'PUT',
        body: { name: 'Invalid language test' },
      });

      const { PUT } = await import('@/app/api/translations/[entityType]/[entityId]/[language]/route');
      const response = await PUT(request, {
        params: { entityType: 'item', entityId: 'item-123', language: 'xx' }
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Unsupported language');
    });

    it('validates entity_id exists before accepting override', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/api/translations/item/nonexistent-item/fr',
        method: 'PUT',
        body: { name: 'Nom pour article inexistant' },
      });

      const { PUT } = await import('@/app/api/translations/[entityType]/[entityId]/[language]/route');
      const response = await PUT(request, {
        params: { entityType: 'item', entityId: 'nonexistent-item', language: 'fr' }
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toContain('not found');
    });

    it('validates translation content is not empty before accepting override', async () => {
      seedMockDatabase('items', [{ id: 'empty-content-item', name: 'Empty Content Test' }]);

      const request = createMockNextRequest({
        url: 'http://localhost:3000/api/translations/item/empty-content-item/de',
        method: 'PUT',
        body: {},
      });

      const { PUT } = await import('@/app/api/translations/[entityType]/[entityId]/[language]/route');
      const response = await PUT(request, {
        params: { entityType: 'item', entityId: 'empty-content-item', language: 'de' }
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('required');
    });

    it('allows subsequent manual overrides to update previously manual translations', async () => {
      seedMockDatabase('items', [{ id: 'subsequent-item', name: 'Subsequent Override Test' }]);
      seedMockDatabase('item_translations', [{
        item_id: 'subsequent-item',
        language: 'nl',
        translated_name: 'Eerste handmatige naam',
        translation_status: 'manual',
      }]);

      const request = createMockNextRequest({
        url: 'http://localhost:3000/api/translations/item/subsequent-item/nl',
        method: 'PUT',
        body: { name: 'Bijgewerkte handmatige naam' },
      });

      const { PUT } = await import('@/app/api/translations/[entityType]/[entityId]/[language]/route');
      const response = await PUT(request, {
        params: { entityType: 'item', entityId: 'subsequent-item', language: 'nl' }
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.translationStatus).toBe('manual');
    });
  });
});
```

---

## 7. Technical Implementation Details

### 7.1 Testing Framework Configuration

**vitest.config.ts additions**:
```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    testTimeout: 10000, // Integration tests may need longer timeout
    coverage: {
      include: [
        'src/app/api/translations/**/*.ts',
        'src/app/api/admin/items/**/*.ts',
        'src/app/api/admin/articles/**/*.ts',
      ],
    },
  },
});
```

### 7.2 Required Mocks

**Auth Mock**:
```typescript
vi.mock('@/lib/auth-server', () => ({
  validateAdminAuth: vi.fn(() => Promise.resolve({
    error: null,
    user: { id: 'test-user', email: 'test@example.com', preferred_language: 'en' },
    isAdmin: true,
    supabase: mockSupabaseClient,
  })),
}));
```

**Content Translation Mock**:
```typescript
vi.mock('@/lib/content-translation', () => ({
  queueContentTranslations: vi.fn().mockResolvedValue({
    success: true,
    jobIds: ['job-1', 'job-2', 'job-3', 'job-4', 'job-5'],
    queuedLanguages: ['fr', 'es', 'de', 'nl', 'it'],
  }),
}));
```

### 7.3 Test Data Constants

```typescript
// constants.ts additions
export const API_TEST_CONSTANTS = {
  SUPPORTED_LANGUAGES: ['en', 'fr', 'es', 'de', 'nl', 'it'] as const,
  ENTITY_TYPES: ['item', 'article', 'link', 'tag'] as const,
  TRANSLATION_STATUSES: ['pending', 'completed', 'failed', 'manual'] as const,
  OVERALL_STATUSES: ['complete', 'partial', 'pending', 'failed'] as const,
};

export const MOCK_TRANSLATION_RESPONSE = {
  success: true,
  jobIds: ['job-fr', 'job-es', 'job-de', 'job-nl', 'job-it'],
  queuedLanguages: ['fr', 'es', 'de', 'nl', 'it'],
};
```

---

## 8. Dependencies

### 8.1 Internal Dependencies

| Component | Import Path | Usage |
|-----------|-------------|-------|
| Items API Route | `@/app/api/admin/items/route` | POST/PUT handlers under test |
| Articles API Route | `@/app/api/admin/articles/route` | POST/PUT handlers under test |
| Translation Status API | `@/app/api/translations/status/[entityType]/[entityId]/route` | GET handler under test |
| Retry API | `@/app/api/translations/retry/route` | POST handler under test |
| Manual Override API | `@/app/api/translations/[entityType]/[entityId]/[language]/route` | PUT handler under test |
| Content Translation | `@/lib/content-translation` | Mocked for verification |
| Auth Server | `@/lib/auth-server` | Mocked for authentication bypass |

### 8.2 Testing Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| vitest | ^2.0.0 | Test runner |
| @testing-library/react | ^14.0.0 | React testing utilities |
| jsdom | ^22.0.0 | DOM environment |

### 8.3 Prerequisites (Must Be Completed First)

| Task | Reference | Dependency |
|------|-----------|------------|
| Task 2.2 | Modify Items API | Items API translation triggers must exist |
| Task 2.3 | Modify Articles API | Articles API translation triggers must exist |
| Task 4.1 | Translation Status API | Status endpoint must exist |
| Task 4.2 | Retry Endpoint | Retry endpoint must exist |
| Task 4.3 | Manual Override Endpoint | Override endpoint must exist |

---

## 9. Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| API routes not implemented yet | Medium | High | Tests can serve as TDD specs; mock route implementations initially |
| Complex NextRequest mocking | Medium | Medium | Create reusable mock factory; reference existing patterns |
| Test isolation issues | Medium | Medium | Reset all mocks and database state in beforeEach |
| Async timing issues | Medium | Medium | Use proper async/await patterns; avoid arbitrary delays |
| Database mock divergence | Medium | Medium | Keep mock behavior aligned with actual Supabase patterns |
| Auth bypass complexity | Low | Low | Use simple mock that returns consistent auth result |

---

## 10. Estimated Effort

| Task | Story Points | Estimated Hours |
|------|--------------|-----------------|
| API Test Infrastructure Setup | 0.5 | 2 |
| Item Creation Translation Tests | 1.0 | 4 |
| Article Creation Translation Tests | 1.0 | 4 |
| Translation Status Endpoint Tests | 1.0 | 4 |
| Retry Endpoint Tests | 1.0 | 4 |
| Manual Override Endpoint Tests | 1.0 | 4 |
| **Total** | **5.5** | **22 hours** |

---

## 11. Success Criteria

1. All integration tests pass in local and CI environments
2. Tests verify item creation triggers translation jobs for all 5 target languages
3. Tests verify article creation triggers translation jobs correctly
4. Tests verify translation status endpoint returns accurate job information
5. Tests verify retry endpoint re-queues failed jobs correctly
6. Tests verify manual override endpoint stores translations with manual flag
7. No flaky tests after 10 consecutive runs
8. Test execution completes in under 60 seconds
9. Test coverage for translation API endpoints exceeds 80%

---

## 12. Acceptance Criteria Verification

| Acceptance Criteria | Test Coverage |
|---------------------|---------------|
| Item creation triggers translations for all target languages | Task 7.3.2: Item Creation Translation Tests |
| Article creation triggers translations for all target languages | Task 7.3.3: Article Creation Translation Tests |
| Status endpoint returns correct job information | Task 7.3.4: Translation Status Endpoint Tests |
| Status endpoint shows all status values (pending, completed, failed, manual) | Task 7.3.4: Status Values tests |
| Retry endpoint re-queues failed jobs | Task 7.3.5: Retry Single Job tests |
| Retry endpoint resets retry count | Task 7.3.5: Retry count reset test |
| Manual override endpoint stores translations | Task 7.3.6: Manual Override Storage tests |
| Manual override prevents automated overwriting | Task 7.3.6: Override Persistence tests |
| Tests run against isolated test database | All tests use mocked Supabase |
| Tests include setup/teardown hooks | All test files use beforeEach/afterEach |
| All tests pass consistently | CI verification via vitest |

---

## 13. References

- **Implementation Plan**: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- **Request Definition**: `/docs/gen_requests_epic3.md` - REQ-364
- **Existing Integration Test Patterns**:
  - `src/lib/job-queue/__tests__/job-processing.integration.test.ts`
  - `src/lib/job-queue/__tests__/concurrent-processing.integration.test.ts`
  - `src/__tests__/beta-access-requests.test.ts`
- **Test Helpers Reference**:
  - `src/lib/job-queue/__tests__/helpers/mockFactories.ts`
  - `src/lib/job-queue/__tests__/helpers/mockSupabase.ts`
  - `src/lib/job-queue/__tests__/helpers/testUtils.ts`
- **Vitest Configuration**: `vitest.config.ts`
- **API Route Patterns**:
  - `src/app/api/admin/items/route.ts`
  - `src/app/api/admin/articles/route.ts`

---

*Implementation overview generated for FAQBNB Localization Epic 3 - Dynamic Content Translation, Phase 7, Task 7.3*
