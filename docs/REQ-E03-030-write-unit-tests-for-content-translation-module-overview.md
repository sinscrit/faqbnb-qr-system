# REQ-E03-030: Write Unit Tests for Content Translation Module - Implementation Overview
*Generated: 2026-01-20 19:30:00 UTC*

## Reference
- **Request**: REQ-E03-030 (Write Unit Tests for Content Translation Module)
- **Source**: docs/gen_requests_epic3.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md
- **Type**: Enhancement (Testing)
- **Epic**: 3 - Dynamic Content Translation
- **Phase**: 7 - Testing & Validation
- **Task ID**: 7.1
- **Size**: M (Medium)

## Goals
1. Create comprehensive unit tests for the `queueContentTranslations()` orchestrator function
2. Create unit tests for entity-specific translation triggers (item, article, link, tag)
3. Create unit tests for the source language detection utility
4. Verify translation jobs are queued correctly for each entity type
5. Test priority assignment based on content type and update context
6. Test graceful error handling for database and external dependency failures
7. Achieve minimum 90% line coverage and 85% branch coverage for tested modules
8. Ensure all tests execute in under 5 seconds total

## Context from Implementation Plan

### Module Under Test
Per the implementation plan (Plan-111), this is Task 7.1 covering three main test areas:

```
/src/lib/content-translation/
├── content-translation.ts           # Test queueContentTranslations function
├── source-language.ts               # Test detectSourceLanguage function
└── triggers/
    ├── item-trigger.ts              # Test triggerItemTranslation
    ├── article-trigger.ts           # Test triggerArticleTranslation
    ├── link-trigger.ts              # Test triggerLinkTranslation
    └── tag-trigger.ts               # Test triggerTagTranslation
```

### Test Infrastructure
The project uses Vitest for testing with the following configuration:
- **Config File**: `/vitest.config.ts`
- **Setup File**: `/vitest.setup.ts`
- **Test Pattern**: `src/**/*.test.ts`
- **Environment**: jsdom
- **Coverage Provider**: v8

### Dependencies from Previous Tasks
- **Task 1.1**: Content Translation Types (`content-translation.types.ts`)
- **Task 1.2**: Content Translation Orchestrator (`content-translation.ts`)
- **Task 1.3**: Entity-Specific Triggers (`triggers/*.ts`)
- **Task 1.4**: Tag Translation Trigger (`triggers/tag-trigger.ts`)
- **Task 2.1**: Source Language Detection (`source-language.ts`)

## Implementation Order

### Step 1: Create Test Directory Structure
Create the `__tests__` directory within the content-translation module.

**Directory to create**: `/src/lib/content-translation/__tests__/`

**Files to create**:
- `/src/lib/content-translation/__tests__/content-translation.test.ts`
- `/src/lib/content-translation/__tests__/source-language.test.ts`
- `/src/lib/content-translation/__tests__/item-trigger.test.ts`
- `/src/lib/content-translation/__tests__/article-trigger.test.ts`
- `/src/lib/content-translation/__tests__/link-trigger.test.ts`
- `/src/lib/content-translation/__tests__/tag-trigger.test.ts`
- `/src/lib/content-translation/__tests__/helpers/` (test utilities)

### Step 2: Create Test Helpers
Create shared mock factories and utilities for consistent testing.

**File**: `/src/lib/content-translation/__tests__/helpers/mockFactories.ts`

**Purpose**:
- Mock `QueueTranslationOptions` factory
- Mock `ContentToTranslate` factory
- Mock User and Account objects with language preferences
- Mock job queue responses

### Step 3: Implement queueContentTranslations Tests
Comprehensive tests for the main orchestrator function.

**File**: `/src/lib/content-translation/__tests__/content-translation.test.ts`

**Test suites to implement**:
1. Job Queuing Behavior
2. Priority Calculation
3. Target Language Determination
4. Error Handling
5. Integration with Job Queue

### Step 4: Implement Source Language Detection Tests
Tests for the `detectSourceLanguage` utility.

**File**: `/src/lib/content-translation/__tests__/source-language.test.ts`

**Test suites to implement**:
1. Override Priority
2. User Preference Priority
3. Account Preference Priority
4. Default Fallback
5. Invalid Input Handling
6. Edge Cases

### Step 5: Implement Entity Trigger Tests
Tests for each entity-specific trigger function.

**Files**:
- `/src/lib/content-translation/__tests__/item-trigger.test.ts`
- `/src/lib/content-translation/__tests__/article-trigger.test.ts`
- `/src/lib/content-translation/__tests__/link-trigger.test.ts`
- `/src/lib/content-translation/__tests__/tag-trigger.test.ts`

**Test suites per trigger**:
1. Successful Translation Queueing
2. Entity Not Found Handling
3. Empty/Null Field Handling
4. Database Error Handling
5. Field Extraction Verification

### Step 6: Verification and Coverage
- Run test suite to verify all tests pass
- Check coverage meets minimum requirements
- Verify test execution time is under 5 seconds

## Authorized Files and Functions for Modification

### New Files to Create

#### `/src/lib/content-translation/__tests__/helpers/mockFactories.ts`
- **Purpose**: Shared mock factories and test data generators
- **Functions to implement**:
  - `createMockQueueTranslationOptions()` - Creates mock queue options
  - `createMockContentToTranslate()` - Creates mock content objects
  - `createMockUser()` - Creates mock user with language preference
  - `createMockAccount()` - Creates mock account with language preference
  - `createMockJobQueueResult()` - Creates mock job queue responses

#### `/src/lib/content-translation/__tests__/helpers/mockSupabase.ts`
- **Purpose**: Supabase client mocking utilities
- **Functions to implement**:
  - Mock supabaseAdmin client
  - `setupMockDatabase()` - Configure mock database responses
  - `resetMockDatabase()` - Reset mock state between tests

#### `/src/lib/content-translation/__tests__/helpers/constants.ts`
- **Purpose**: Test constants and fixtures
- **Exports**:
  - Test entity IDs
  - Test language codes
  - Expected translations
  - Mock job IDs

#### `/src/lib/content-translation/__tests__/content-translation.test.ts`
- **Purpose**: Unit tests for `queueContentTranslations()` function
- **Test coverage**:
  - All code paths in `queueContentTranslations()`
  - Helper functions `calculatePriority()` and `getTargetLanguages()`
  - Error handling paths
- **Pattern Reference**: Follows test pattern from `/src/lib/translation-service/__tests__/translation-service.test.ts`

#### `/src/lib/content-translation/__tests__/source-language.test.ts`
- **Purpose**: Unit tests for `detectSourceLanguage()` function
- **Test coverage**:
  - All supported languages
  - Priority order verification
  - Invalid input handling
  - Edge cases (empty strings, whitespace, null values)
- **Pattern Reference**: Follows test pattern from `/src/lib/translation-service/__tests__/types.test.ts`

#### `/src/lib/content-translation/__tests__/item-trigger.test.ts`
- **Purpose**: Unit tests for `triggerItemTranslation()` function
- **Test coverage**:
  - Successful item translation queueing
  - Item not found scenarios
  - Empty name/description handling
  - Database error handling
  - Field extraction verification (name, description)

#### `/src/lib/content-translation/__tests__/article-trigger.test.ts`
- **Purpose**: Unit tests for `triggerArticleTranslation()` function
- **Test coverage**:
  - Successful article translation queueing
  - Article not found scenarios
  - Title-only translation (description optional)
  - Database error handling
  - Field extraction verification (title, description)

#### `/src/lib/content-translation/__tests__/link-trigger.test.ts`
- **Purpose**: Unit tests for `triggerLinkTranslation()` function
- **Test coverage**:
  - Successful link translation queueing
  - Link not found scenarios
  - Title-only field extraction (URLs never translated)
  - Database error handling

#### `/src/lib/content-translation/__tests__/tag-trigger.test.ts`
- **Purpose**: Unit tests for `triggerTagTranslation()` function
- **Test coverage**:
  - New tag translation queueing
  - Existing tag scenarios
  - System tag skipping
  - User tag handling
  - Database error handling

### Files to Modify

#### `/vitest.config.ts`
- **Changes**: Add content-translation module to coverage includes
- **New Include**:
  ```typescript
  'src/lib/content-translation/**/*.ts',
  ```

### Existing Files (Import Only - No Modification)

| File | Import |
|------|--------|
| `/src/lib/content-translation/content-translation.ts` | Function under test |
| `/src/lib/content-translation/source-language.ts` | Function under test |
| `/src/lib/content-translation/triggers/item-trigger.ts` | Function under test |
| `/src/lib/content-translation/triggers/article-trigger.ts` | Function under test |
| `/src/lib/content-translation/triggers/link-trigger.ts` | Function under test |
| `/src/lib/content-translation/triggers/tag-trigger.ts` | Function under test |
| `/src/lib/content-translation/content-translation.types.ts` | Type imports |
| `/src/lib/translation-service/translation-service.types.ts` | `SupportedLanguage` type |
| `/src/lib/job-queue/translation-jobs.ts` | Mock target |

## Technical Specifications

### Test Structure Pattern
Follow the established Vitest testing pattern from the project:

```typescript
/**
 * Unit Tests for [Function Name] (REQ-E03-030)
 *
 * Tests [description of what is being tested]
 *
 * @created 2026-01-20
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Create mock dependencies
const mockDependency = {
  method: vi.fn(),
};

// Mock modules before imports
vi.mock('@/lib/some-module', () => ({
  someFunction: vi.fn(),
}));

// Import module under test
import { functionUnderTest } from '../module-under-test';

describe('FunctionName (REQ-E03-030)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('scenario group', () => {
    it('should [expected behavior]', async () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### queueContentTranslations Test Specification

```typescript
// /src/lib/content-translation/__tests__/content-translation.test.ts

describe('queueContentTranslations (REQ-E03-030)', () => {
  describe('Job Queuing Behavior', () => {
    it('should queue translation jobs for all target languages', async () => {});
    it('should not queue job for source language', async () => {});
    it('should queue jobs for all 5 target languages when source is English', async () => {});
    it('should include all required metadata in job records', async () => {});
    it('should return job IDs for all queued translations', async () => {});
    it('should return queued languages list', async () => {});
  });

  describe('Priority Calculation', () => {
    it('should assign priority 100 for create trigger', async () => {});
    it('should assign priority 50 for update trigger', async () => {});
    it('should use custom priority when provided', async () => {});
    it('should override default priority with custom priority', async () => {});
  });

  describe('Target Language Determination', () => {
    it('should exclude source language from targets', async () => {});
    it('should exclude languages in excludeLanguages array', async () => {});
    it('should return empty result when all languages excluded', async () => {});
    it('should handle multiple exclusions correctly', async () => {});
  });

  describe('Entity Type Handling', () => {
    it('should handle item entity type correctly', async () => {});
    it('should handle article entity type correctly', async () => {});
    it('should handle link entity type correctly', async () => {});
    it('should handle tag entity type correctly', async () => {});
  });

  describe('Error Handling', () => {
    it('should return error result when job queue fails', async () => {});
    it('should catch and wrap exceptions', async () => {});
    it('should never throw exceptions', async () => {});
    it('should include error message in result', async () => {});
  });

  describe('Edge Cases', () => {
    it('should handle empty fields array', async () => {});
    it('should handle content with no translatable text', async () => {});
    it('should succeed when no target languages remain after filtering', async () => {});
  });
});
```

### Source Language Detection Test Specification

```typescript
// /src/lib/content-translation/__tests__/source-language.test.ts

describe('detectSourceLanguage (REQ-E03-030)', () => {
  describe('Priority 1: Override', () => {
    it('should return override when valid supported language', () => {});
    it('should return override over user preference', () => {});
    it('should return override over account preference', () => {});
    it('should work for all six supported languages as override', () => {});
  });

  describe('Priority 2: User Preference', () => {
    it('should return user preferred_language when no override', () => {});
    it('should return user preference over account preference', () => {});
    it('should handle null user gracefully', () => {});
    it('should handle undefined preferred_language', () => {});
  });

  describe('Priority 3: Account Preference', () => {
    it('should return account preferred_language when no user preference', () => {});
    it('should handle null account gracefully', () => {});
    it('should use account when user preference is null', () => {});
  });

  describe('Priority 4: Default Fallback', () => {
    it('should return "en" when no preferences set', () => {});
    it('should return "en" for empty options object', () => {});
    it('should return "en" when all values are null', () => {});
    it('should return "en" when all values are undefined', () => {});
  });

  describe('Invalid Input Handling', () => {
    it('should fall through invalid override to user preference', () => {});
    it('should fall through invalid user preference to account', () => {});
    it('should fall through invalid account preference to default', () => {});
    it('should reject unsupported language codes', () => {});
  });

  describe('Edge Cases', () => {
    it('should handle empty string override', () => {});
    it('should handle whitespace override', () => {});
    it('should handle mixed case language codes (invalid)', () => {});
    it('should handle numeric strings (invalid)', () => {});
  });
});
```

### Entity Trigger Test Specification

```typescript
// /src/lib/content-translation/__tests__/item-trigger.test.ts

describe('triggerItemTranslation (REQ-E03-030)', () => {
  describe('Successful Translation Queueing', () => {
    it('should fetch item by ID from database', async () => {});
    it('should extract name field for translation', async () => {});
    it('should extract description field for translation', async () => {});
    it('should call queueContentTranslations with correct entity type', async () => {});
    it('should pass source language to orchestrator', async () => {});
    it('should return job IDs on success', async () => {});
  });

  describe('Entity Not Found', () => {
    it('should return error when item not found', async () => {});
    it('should return error with descriptive message', async () => {});
    it('should not call queueContentTranslations when item missing', async () => {});
  });

  describe('Field Handling', () => {
    it('should handle null description gracefully', async () => {});
    it('should handle empty name string', async () => {});
    it('should use correct translation context for name field', async () => {});
    it('should use correct translation context for description field', async () => {});
    it('should return empty result when no translatable content', async () => {});
  });

  describe('Database Error Handling', () => {
    it('should return error when database query fails', async () => {});
    it('should catch and wrap database exceptions', async () => {});
    it('should include database error message in result', async () => {});
  });
});
```

Similar patterns apply for `article-trigger.test.ts`, `link-trigger.test.ts`, and `tag-trigger.test.ts`.

### Mock Factory Implementation

```typescript
// /src/lib/content-translation/__tests__/helpers/mockFactories.ts

import type {
  QueueTranslationOptions,
  ContentToTranslate,
  QueueTranslationResult,
  TranslatableField,
} from '../../content-translation.types';
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';

/**
 * Creates a mock QueueTranslationOptions object
 */
export function createMockQueueTranslationOptions(
  overrides?: Partial<QueueTranslationOptions>
): QueueTranslationOptions {
  return {
    content: createMockContentToTranslate(),
    trigger: 'create',
    ...overrides,
  };
}

/**
 * Creates a mock ContentToTranslate object
 */
export function createMockContentToTranslate(
  overrides?: Partial<ContentToTranslate>
): ContentToTranslate {
  return {
    entityType: 'item',
    entityId: `test-item-${Date.now()}`,
    sourceLanguage: 'en',
    fields: [
      {
        fieldName: 'name',
        value: 'Test Item Name',
        context: { contentType: 'item_name' },
      },
    ],
    ...overrides,
  };
}

/**
 * Creates a mock user with language preference
 */
export function createMockUser(preferredLanguage?: SupportedLanguage | null) {
  return {
    id: `user-${Date.now()}`,
    preferred_language: preferredLanguage ?? null,
  };
}

/**
 * Creates a mock account with language preference
 */
export function createMockAccount(preferredLanguage?: SupportedLanguage | null) {
  return {
    id: `account-${Date.now()}`,
    preferred_language: preferredLanguage ?? null,
  };
}

/**
 * Creates a mock successful queue result
 */
export function createMockQueueResult(
  languages: SupportedLanguage[] = ['fr', 'es', 'de', 'nl', 'it']
): QueueTranslationResult {
  return {
    success: true,
    jobIds: languages.map((lang, i) => `job-${lang}-${i}`),
    queuedLanguages: languages,
  };
}

/**
 * Creates a mock item record from database
 */
export function createMockItem(overrides?: {
  id?: string;
  name?: string;
  description?: string | null;
}) {
  return {
    id: overrides?.id ?? `item-${Date.now()}`,
    name: overrides?.name ?? 'Test Item',
    description: overrides?.description ?? 'Test description',
  };
}

/**
 * Creates a mock article record from database
 */
export function createMockArticle(overrides?: {
  id?: string;
  title?: string;
  description?: string | null;
}) {
  return {
    id: overrides?.id ?? `article-${Date.now()}`,
    title: overrides?.title ?? 'Test Article Title',
    description: overrides?.description ?? 'Test article description',
  };
}

/**
 * Creates a mock link record from database
 */
export function createMockLink(overrides?: {
  id?: string;
  title?: string;
}) {
  return {
    id: overrides?.id ?? `link-${Date.now()}`,
    title: overrides?.title ?? 'Test Link Title',
  };
}
```

### Supabase Mock Setup

```typescript
// /src/lib/content-translation/__tests__/helpers/mockSupabase.ts

import { vi } from 'vitest';

/**
 * Creates a chainable Supabase query mock
 */
export function createSupabaseChainMock() {
  const mock: Record<string, ReturnType<typeof vi.fn>> = {};

  ['select', 'eq', 'single', 'insert', 'update', 'upsert', 'delete'].forEach(method => {
    mock[method] = vi.fn().mockReturnValue(mock);
  });

  mock.single = vi.fn().mockResolvedValue({ data: null, error: null });

  return mock;
}

/**
 * Creates the mock supabaseAdmin client
 */
export function createMockSupabaseAdmin() {
  return {
    from: vi.fn(() => createSupabaseChainMock()),
  };
}

/**
 * Reset mock state between tests
 */
export function resetMockSupabase(mockSupabase: ReturnType<typeof createMockSupabaseAdmin>) {
  vi.clearAllMocks();
  mockSupabase.from.mockClear();
}
```

### Test Constants

```typescript
// /src/lib/content-translation/__tests__/helpers/constants.ts

import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';

/** All supported languages for testing */
export const ALL_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];

/** Languages excluding English (common target set) */
export const TARGET_LANGUAGES_FROM_EN: SupportedLanguage[] = ['fr', 'es', 'de', 'nl', 'it'];

/** Test entity IDs */
export const TEST_IDS = {
  ITEM: 'test-item-uuid-123',
  ARTICLE: 'test-article-uuid-456',
  LINK: 'test-link-uuid-789',
  TAG: 'test-tag-key',
  USER: 'test-user-uuid-001',
  ACCOUNT: 'test-account-uuid-002',
};

/** Invalid language codes for negative testing */
export const INVALID_LANGUAGES = [
  'invalid',
  'EN',  // uppercase
  'eng', // three-letter
  '123', // numeric
  '',    // empty
  '  ',  // whitespace
];

/** Default priority values */
export const PRIORITIES = {
  CREATE: 100,
  UPDATE: 50,
  BATCH: 25,
  RETRY: 10,
};
```

## Success Validation Checklist

### Test File Structure
- [ ] `/src/lib/content-translation/__tests__/` directory exists
- [ ] `/src/lib/content-translation/__tests__/helpers/` directory exists
- [ ] `content-translation.test.ts` exists with all test cases
- [ ] `source-language.test.ts` exists with all test cases
- [ ] `item-trigger.test.ts` exists with all test cases
- [ ] `article-trigger.test.ts` exists with all test cases
- [ ] `link-trigger.test.ts` exists with all test cases
- [ ] `tag-trigger.test.ts` exists with all test cases
- [ ] All test files contain proper module documentation headers

### Test Implementation
- [ ] queueContentTranslations tests cover all code paths
- [ ] Entity-specific trigger tests verify correct field extraction
- [ ] Source language detection tests verify priority order
- [ ] All tests use proper mocking for external dependencies
- [ ] Tests include both positive and negative cases
- [ ] Error handling paths are tested

### Coverage Requirements
- [ ] Minimum 90% line coverage for content-translation.ts
- [ ] Minimum 90% line coverage for source-language.ts
- [ ] Minimum 90% line coverage for trigger files
- [ ] Minimum 85% branch coverage for tested modules

### Performance Requirements
- [ ] All tests execute in under 5 seconds total
- [ ] No flaky tests in CI environment
- [ ] Tests run successfully on development environment

### Integration
- [ ] vitest.config.ts updated with coverage includes
- [ ] `npm run test` executes all new tests
- [ ] `npm run test:coverage` shows correct coverage metrics
- [ ] TypeScript compilation passes with no errors

## Notes

### Pattern Alignment
- Follow test file naming convention: `[module-name].test.ts`
- Follow test structure from `/src/lib/translation-service/__tests__/translation-service.test.ts`
- Use `vi.mock()` for module mocking before imports
- Use `vi.fn()` for creating mock functions
- Use `beforeEach`/`afterEach` for mock cleanup
- Include REQ reference in test file header comments

### Mock Strategy
- Mock `supabaseAdmin` at module level using `vi.mock('@/lib/supabase')`
- Mock `createBatchTranslationJobs` for orchestrator tests
- Mock `queueContentTranslations` for trigger tests
- Use mock factories for consistent test data
- Reset mocks between tests to avoid cross-contamination

### Test Organization
- Group tests by behavior/scenario using `describe` blocks
- Use descriptive test names that explain expected behavior
- Follow Arrange-Act-Assert pattern within tests
- Keep each test focused on a single assertion when possible
- Use parameterized tests (via loops) for testing multiple languages

### Coverage Considerations
- Focus on testing public function behavior, not implementation details
- Test error paths explicitly (database failures, invalid inputs)
- Test edge cases (empty arrays, null values, boundary conditions)
- Avoid testing private helper functions directly - test through public API

## Dependencies
- Vitest (existing in project)
- @vitejs/plugin-react (existing)
- No new npm packages required

## Risk Assessment
- **Risk Level**: Low
- **Rationale**:
  - Well-established testing patterns exist in the project
  - Module under test has clear contracts and types
  - Mocking strategy is straightforward
  - No external service dependencies during tests
  - Fast test execution expected

## References
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Phase 7, Task 7.1)
- Request Document: `/docs/gen_requests_epic3.md` (REQ-E03-030)
- Test Pattern Reference: `/src/lib/translation-service/__tests__/translation-service.test.ts`
- Test Pattern Reference: `/src/lib/job-queue/__tests__/job-processing.integration.test.ts`
- Vitest Configuration: `/vitest.config.ts`
- Content Translation Module: `/src/lib/content-translation/`
