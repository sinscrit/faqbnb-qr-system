# REQ-362: Write Unit Tests for Content Translation Module - Implementation Overview

**Generated:** 2026-01-19 21:30 UTC
**Last Modified:** 2026-01-19 21:30 UTC
**Request Reference:** docs/gen_requests_epic3.md - Request #362
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md (Phase 7, Task 7.1)
**Status:** Overview Document

---

## Executive Summary

This document provides the implementation breakdown for Task 7.1 (Unit Tests for Content Translation Module) from the L10N Epic 3 implementation plan. The task establishes comprehensive unit test coverage for the content translation orchestration module, including the `queueContentTranslations` function, entity-specific translation triggers, and source language detection utilities.

The content translation module orchestrates the translation of user-generated content (items, articles, links, tags) to all supported languages when content is created or updated. These tests ensure that translation jobs are correctly queued, entity-specific triggers extract translatable fields properly, and source language detection operates accurately.

---

## Technical Context

### Current Test Infrastructure

| Technology | Details |
|------------|---------|
| **Test Framework** | Vitest (configured in `vitest.config.ts`) |
| **DOM Environment** | jsdom |
| **Test Utilities** | @testing-library/react (where applicable) |
| **Mocking** | vi.mock(), vi.fn(), vi.mocked() |
| **Coverage** | v8 provider with text, json, html reporters |

### Related Existing Test Patterns

| Module | Test Location | Pattern Reference |
|--------|--------------|-------------------|
| Translation Service | `/src/lib/translation-service/__tests__/` | Mock providers, vi.mock() patterns |
| Job Queue | `/src/lib/job-queue/__tests__/` | Mock factories, Supabase mocking |
| Job Processing | `/src/lib/job-queue/__tests__/helpers/` | Helper modules, test utilities |

### Dependencies from Epic 1 & Epic 3

| Dependency | Location | Purpose |
|------------|----------|---------|
| Translation Service Types | `/src/lib/translation-service/translation-service.types.ts` | SupportedLanguage, EntityType definitions |
| Translation Service | `/src/lib/translation-service/` | translateText, translateToAllLanguages |
| Job Queue Types | `/src/lib/job-queue/translation-jobs.types.ts` | TranslationJob, JobStatus |
| Content Translation Module | `/src/lib/content-translation/` | Target module to test (to be created) |

### Module Architecture to Test

```
/src/lib/content-translation/
├── index.ts                           # Module exports
├── content-translation.ts             # Main orchestrator (queueContentTranslations)
├── content-translation.types.ts       # TypeScript types
├── source-language.ts                 # Source language detection
├── triggers/
│   ├── item-trigger.ts                # triggerItemTranslation
│   ├── article-trigger.ts             # triggerArticleTranslation
│   ├── link-trigger.ts                # triggerLinkTranslation
│   └── tag-trigger.ts                 # triggerTagTranslation
└── storage/
    ├── translation-storage.ts         # Store/retrieve translations
    └── translation-status.ts          # Status tracking utilities
```

---

## Authorized Files and Functions for Modification

### Test Files (CREATE/WRITE)

| File Path | Purpose |
|-----------|---------|
| `src/lib/content-translation/__tests__/content-translation.test.ts` | Main orchestrator tests |
| `src/lib/content-translation/__tests__/source-language.test.ts` | Source language detection tests |
| `src/lib/content-translation/__tests__/test-helpers.ts` | Shared mock factories |
| `src/lib/content-translation/triggers/__tests__/item-trigger.test.ts` | Item trigger tests |
| `src/lib/content-translation/triggers/__tests__/article-trigger.test.ts` | Article trigger tests |
| `src/lib/content-translation/triggers/__tests__/link-trigger.test.ts` | Link trigger tests |
| `src/lib/content-translation/triggers/__tests__/tag-trigger.test.ts` | Tag trigger tests |

### Source Files (READ ONLY - for reference)

| File Path | Purpose |
|-----------|---------|
| `src/lib/content-translation/content-translation.ts` | Main orchestrator implementation |
| `src/lib/content-translation/content-translation.types.ts` | Type definitions |
| `src/lib/content-translation/source-language.ts` | Language detection logic |
| `src/lib/content-translation/triggers/*.ts` | Entity-specific triggers |
| `src/lib/translation-service/translation-service.types.ts` | Shared type definitions |
| `src/lib/job-queue/translation-jobs.types.ts` | Job type definitions |

### Configuration Files (MODIFY)

| File Path | Purpose |
|-----------|---------|
| `vitest.config.ts` | Add content-translation to coverage includes |

---

## Implementation Tasks

### Task 1: Create Test Directory Structure and Helpers

**Files to Create:**
- `/src/lib/content-translation/__tests__/`
- `/src/lib/content-translation/__tests__/test-helpers.ts`
- `/src/lib/content-translation/triggers/__tests__/`

**Description:** Set up the test directory structure and create shared mock factories for consistent test data.

**Mock Factory Functions to Implement:**

```typescript
// test-helpers.ts
export function createMockContentToTranslate(overrides?: Partial<ContentToTranslate>): ContentToTranslate;
export function createMockTranslatableField(overrides?: Partial<TranslatableField>): TranslatableField;
export function createMockQueueTranslationOptions(overrides?: Partial<QueueTranslationOptions>): QueueTranslationOptions;
export function createMockQueueTranslationResult(overrides?: Partial<QueueTranslationResult>): QueueTranslationResult;
export function createMockItemContent(overrides?: Partial<{...}>): MockItemContent;
export function createMockArticleContent(overrides?: Partial<{...}>): MockArticleContent;
export function createMockLinkContent(overrides?: Partial<{...}>): MockLinkContent;
export function createMockUser(overrides?: Partial<{...}>): MockUser;
export function createMockAccount(overrides?: Partial<{...}>): MockAccount;
```

**Verification:**
- All directories exist
- test-helpers.ts exports all factory functions
- Factory functions return correctly typed objects

---

### Task 2: Test `queueContentTranslations` Function - Items

**File:** `/src/lib/content-translation/__tests__/content-translation.test.ts`

**Test Coverage:**
- Queue translation jobs for item entity type
- Verify correct number of jobs created (5 target languages)
- Verify job fields: entity_id, entity_type, source_language, target_language
- Verify priority levels based on trigger type (create vs update)
- Handle excludeLanguages option
- Handle priority override option

**Test Categories:**
```typescript
describe('queueContentTranslations', () => {
  describe('item entity type', () => {
    it('should queue translation jobs for all target languages', async () => { ... });
    it('should include correct entity_id and entity_type in jobs', async () => { ... });
    it('should include correct source_language from content', async () => { ... });
    it('should include correct target_language for each non-source language', async () => { ... });
    it('should set higher priority for create trigger', async () => { ... });
    it('should set lower priority for update trigger', async () => { ... });
    it('should respect excludeLanguages option', async () => { ... });
    it('should respect custom priority override', async () => { ... });
    it('should return job IDs for all queued jobs', async () => { ... });
    it('should return queued languages in result', async () => { ... });
  });
});
```

---

### Task 3: Test `queueContentTranslations` Function - Articles, Links, Tags

**File:** `/src/lib/content-translation/__tests__/content-translation.test.ts`

**Test Coverage:**
- Article entity type translation queuing
- Link entity type translation queuing
- Tag entity type translation queuing
- Each entity type generates correct number of jobs
- Each entity type has correct metadata

**Test Categories:**
```typescript
describe('queueContentTranslations', () => {
  describe('article entity type', () => {
    it('should queue translation jobs for all target languages', async () => { ... });
    it('should include correct entity_id and entity_type in jobs', async () => { ... });
    // ... similar tests as items
  });

  describe('link entity type', () => {
    it('should queue translation jobs for all target languages', async () => { ... });
    it('should include correct entity_id and entity_type in jobs', async () => { ... });
    // ... similar tests
  });

  describe('tag entity type', () => {
    it('should queue translation jobs for all target languages', async () => { ... });
    it('should include correct entity_id (tag_key) and entity_type in jobs', async () => { ... });
    // ... similar tests
  });
});
```

---

### Task 4: Test Entity-Specific Triggers - Item Trigger

**File:** `/src/lib/content-translation/triggers/__tests__/item-trigger.test.ts`

**Test Coverage:**
- Extract name and description fields from item entity
- Handle items with null/undefined description
- Handle items with minimal required fields only
- Build correct TranslatableField objects with context
- Return QueueTranslationResult with job IDs

**Test Categories:**
```typescript
describe('triggerItemTranslation', () => {
  describe('field extraction', () => {
    it('should extract name field with item_name content type', async () => { ... });
    it('should extract description field with item_description content type', async () => { ... });
    it('should handle null description gracefully', async () => { ... });
    it('should handle undefined description gracefully', async () => { ... });
    it('should include maxLength constraint for name field', async () => { ... });
  });

  describe('TranslatableField construction', () => {
    it('should set correct context for name field', async () => { ... });
    it('should set correct context for description field', async () => { ... });
    it('should include domain context for property rental', async () => { ... });
  });

  describe('edge cases', () => {
    it('should handle empty string name', async () => { ... });
    it('should handle special characters in name', async () => { ... });
    it('should handle maximum field length content', async () => { ... });
  });
});
```

---

### Task 5: Test Entity-Specific Triggers - Article Trigger

**File:** `/src/lib/content-translation/triggers/__tests__/article-trigger.test.ts`

**Test Coverage:**
- Extract title and description fields from article entity
- Handle articles with null/undefined description
- Build correct TranslatableField objects with article-specific context
- Return QueueTranslationResult with job IDs

**Test Categories:**
```typescript
describe('triggerArticleTranslation', () => {
  describe('field extraction', () => {
    it('should extract title field with article_title content type', async () => { ... });
    it('should extract description field with article_description content type', async () => { ... });
    it('should handle null description gracefully', async () => { ... });
  });

  describe('TranslatableField construction', () => {
    it('should set correct context for title field', async () => { ... });
    it('should set correct context for description field', async () => { ... });
    it('should include instruction domain context', async () => { ... });
  });

  describe('edge cases', () => {
    it('should handle empty string title', async () => { ... });
    it('should handle articles with minimal fields', async () => { ... });
  });
});
```

---

### Task 6: Test Entity-Specific Triggers - Link and Tag Triggers

**File:** `/src/lib/content-translation/triggers/__tests__/link-trigger.test.ts`
**File:** `/src/lib/content-translation/triggers/__tests__/tag-trigger.test.ts`

**Link Trigger Test Coverage:**
- Extract title field only (URLs not translated)
- Handle links with various title formats
- Build correct TranslatableField with link_title context

**Tag Trigger Test Coverage:**
- Extract tag value for translation
- Check if translation already exists before queuing (skip duplicates)
- Handle user tags (not system tags)
- Handle tag key normalization

**Test Categories:**
```typescript
// link-trigger.test.ts
describe('triggerLinkTranslation', () => {
  describe('field extraction', () => {
    it('should extract title field only', async () => { ... });
    it('should NOT extract or translate URL field', async () => { ... });
  });

  describe('context', () => {
    it('should set link_title content type', async () => { ... });
    it('should include media domain context', async () => { ... });
  });
});

// tag-trigger.test.ts
describe('triggerTagTranslation', () => {
  describe('translation check', () => {
    it('should check if translation already exists', async () => { ... });
    it('should skip queuing if translation exists', async () => { ... });
    it('should queue if no translation exists', async () => { ... });
  });

  describe('system tags', () => {
    it('should skip system tags (starting with #)', async () => { ... });
    it('should process user tags', async () => { ... });
  });

  describe('field construction', () => {
    it('should set tag content type', async () => { ... });
    it('should include categorization domain context', async () => { ... });
  });
});
```

---

### Task 7: Test Source Language Detection

**File:** `/src/lib/content-translation/__tests__/source-language.test.ts`

**Test Coverage:**
- User preference takes precedence when available
- Account preference fallback when user preference unavailable
- System default 'en' fallback when both unavailable
- Override parameter takes highest precedence
- Handle invalid/unsupported language codes gracefully
- Consistent results for same input conditions

**Test Categories:**
```typescript
describe('detectSourceLanguage', () => {
  describe('priority order', () => {
    it('should use override when provided', () => { ... });
    it('should use user preferred_language when no override', () => { ... });
    it('should use account preferred_language when user has none', () => { ... });
    it('should default to "en" when no preferences exist', () => { ... });
  });

  describe('override handling', () => {
    it('should prefer override over user preference', () => { ... });
    it('should prefer override over account preference', () => { ... });
    it('should validate override is supported language', () => { ... });
  });

  describe('invalid language handling', () => {
    it('should return default for invalid user language code', () => { ... });
    it('should return default for unsupported language code', () => { ... });
    it('should handle null language preferences', () => { ... });
    it('should handle undefined language preferences', () => { ... });
  });

  describe('consistency', () => {
    it('should return same result for identical inputs', () => { ... });
    it('should be deterministic across multiple calls', () => { ... });
  });
});
```

---

### Task 8: Test Error Handling and Edge Cases

**File:** `/src/lib/content-translation/__tests__/content-translation.test.ts`

**Test Coverage:**
- Database error handling during job creation
- Empty content fields handling
- All target languages excluded scenario
- Source language equals target language filtering
- Maximum batch size handling

**Test Categories:**
```typescript
describe('queueContentTranslations', () => {
  describe('error handling', () => {
    it('should handle database error during job insertion', async () => { ... });
    it('should return error in result when queuing fails', async () => { ... });
    it('should not partially queue jobs on failure', async () => { ... });
  });

  describe('edge cases', () => {
    it('should handle empty string in fields', async () => { ... });
    it('should handle content with special characters', async () => { ... });
    it('should handle very long content strings', async () => { ... });
    it('should return empty jobIds when all languages excluded', async () => { ... });
    it('should filter out source language from targets', async () => { ... });
  });
});
```

---

### Task 9: Update Vitest Configuration and Run Tests

**File:** `vitest.config.ts`

**Changes:**
- Add `/src/lib/content-translation/**/*.ts` to coverage includes
- Exclude test files and __tests__ directories from coverage

**Verification Steps:**
```bash
# Run all content translation tests
npm test -- src/lib/content-translation

# Run with coverage
npm test -- --coverage src/lib/content-translation

# Verify coverage exceeds 80% for critical functions
```

---

## Test Data and Mocking Strategy

### Supabase Mocking Pattern

Follow the pattern established in `/src/lib/job-queue/__tests__/helpers/mockSupabase.ts`:

```typescript
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          data: mockJobData,
          error: null,
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: mockTranslationData,
          error: null,
        })),
      })),
    })),
  },
}));
```

### Translation Service Mocking

```typescript
vi.mock('@/lib/translation-service', () => ({
  translateText: vi.fn().mockResolvedValue({
    translatedText: 'Translated text',
    provider: 'claude',
  }),
  translateToAllLanguages: vi.fn().mockResolvedValue({
    translations: {
      fr: 'French',
      es: 'Spanish',
      de: 'German',
      nl: 'Dutch',
      it: 'Italian',
    },
  }),
}));
```

---

## Acceptance Criteria Verification

| Criterion | Test File | Status |
|-----------|-----------|--------|
| Tests exist for queueContentTranslations - items | content-translation.test.ts | Pending |
| Tests exist for queueContentTranslations - articles | content-translation.test.ts | Pending |
| Tests exist for queueContentTranslations - links | content-translation.test.ts | Pending |
| Tests exist for queueContentTranslations - tags | content-translation.test.ts | Pending |
| Verify correct translation job count | content-translation.test.ts | Pending |
| Verify jobs include correct entity_id/entity_type | content-translation.test.ts | Pending |
| Verify jobs include correct source_language | content-translation.test.ts | Pending |
| Verify jobs include correct target_language | content-translation.test.ts | Pending |
| Verify jobs include correct priority levels | content-translation.test.ts | Pending |
| Item trigger extracts fields correctly | item-trigger.test.ts | Pending |
| Article trigger extracts fields correctly | article-trigger.test.ts | Pending |
| Link trigger extracts fields correctly | link-trigger.test.ts | Pending |
| Tag trigger extracts fields correctly | tag-trigger.test.ts | Pending |
| Triggers handle null/undefined values | */triggers/__tests__/*.test.ts | Pending |
| Triggers handle minimal required fields | */triggers/__tests__/*.test.ts | Pending |
| Source language uses user preference | source-language.test.ts | Pending |
| Source language falls back to default | source-language.test.ts | Pending |
| Source language handles invalid codes | source-language.test.ts | Pending |
| Source language returns consistent results | source-language.test.ts | Pending |
| Tests use mocking for database calls | All test files | Pending |
| Tests use descriptive names | All test files | Pending |
| All tests pass locally | npm test | Pending |
| Test coverage exceeds 80% | npm test --coverage | Pending |
| Tests include edge cases | All test files | Pending |

---

## Test Execution Commands

```bash
# Run all content translation module tests
npm test -- src/lib/content-translation

# Run specific test file
npm test -- src/lib/content-translation/__tests__/content-translation.test.ts
npm test -- src/lib/content-translation/__tests__/source-language.test.ts
npm test -- src/lib/content-translation/triggers/__tests__/item-trigger.test.ts

# Run with coverage report
npm test -- --coverage src/lib/content-translation

# Run in watch mode during development
npm test -- --watch src/lib/content-translation

# Run with verbose output
npm test -- --verbose src/lib/content-translation
```

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| vitest | Test framework |
| @testing-library/react | Hook testing utilities |
| vi.mock() | Module mocking |
| vi.fn() | Function mocking |
| vi.useFakeTimers() | Timer mocking for async tests |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Content translation module not yet implemented | Medium | High | Create tests first (TDD approach) or wait for implementation |
| Supabase mocking complexity | Medium | Medium | Follow established patterns from job-queue tests |
| Async timing issues in tests | Low | Medium | Use proper async/await patterns and vi.waitFor() |
| Test flakiness due to timers | Low | Low | Use vi.useFakeTimers() consistently |

---

## References

- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md) - Phase 7, Task 7.1
- [Request #362](/docs/gen_requests_epic3.md#req-362) - Unit Tests for Content Translation Module
- [Translation Service Tests](/src/lib/translation-service/__tests__/) - Reference test patterns
- [Job Queue Test Helpers](/src/lib/job-queue/__tests__/helpers/) - Mock factory patterns
- [Epic 1 Foundation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md) - Prerequisite infrastructure

---

*Document generated on 2026-01-19 for REQ-362: Write Unit Tests for Content Translation Module*
