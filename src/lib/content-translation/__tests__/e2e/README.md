# Content Translation E2E Tests

Last Modified: 2026-01-21

## Overview

This directory contains end-to-end (E2E) tests for the content translation workflow. These tests verify the complete translation pipeline from content creation through job processing and status reporting.

## Test Structure

```
e2e/
├── helpers/
│   ├── index.ts              # Barrel exports
│   ├── e2e-test-utils.ts     # Setup/teardown utilities
│   ├── polling-utils.ts      # Async wait/poll helpers
│   ├── mock-api-client.ts    # Simulated API client
│   └── test-data-factory.ts  # Test data generators
├── item-translation.e2e.test.ts     # Item translation tests
├── article-translation.e2e.test.ts  # Article translation tests
├── link-translation.e2e.test.ts     # Link translation tests
├── translation-status.e2e.test.ts   # Status endpoint tests
├── translation-retry.e2e.test.ts    # Retry mechanism tests
├── manual-override.e2e.test.ts      # Manual translation override tests
├── batch-status.e2e.test.ts         # Batch status query tests
├── stale-translation.e2e.test.ts    # Stale translation detection tests
└── error-scenarios.e2e.test.ts      # Error handling tests
```

## Running Tests

```bash
# Run all E2E tests
npm run test -- src/lib/content-translation/__tests__/e2e/

# Run specific test file
npm run test -- src/lib/content-translation/__tests__/e2e/item-translation.e2e.test.ts

# Run with coverage
npm run test:coverage -- src/lib/content-translation/__tests__/e2e/

# Run in watch mode
npm run test:watch -- src/lib/content-translation/__tests__/e2e/
```

## Test Helpers

### E2E Test Context

```typescript
import {
  setupE2ETestContext,
  teardownE2ETestContext,
  type E2ETestContext,
} from './helpers';

describe('My E2E Test', () => {
  let ctx: E2ETestContext;

  beforeEach(async () => {
    ctx = await setupE2ETestContext();
  });

  afterEach(async () => {
    await teardownE2ETestContext(ctx);
  });
});
```

### Mock API Client

```typescript
import { createMockApiClient, type MockApiClient } from './helpers';

const apiClient = createMockApiClient();

// Create entities
const item = await apiClient.createItem({ ... });
const article = await apiClient.createArticle({ ... });
const link = await apiClient.createLink({ ... });

// Check status
const status = await apiClient.getTranslationStatus('item', item.data.id);

// Retry failed jobs
const result = await apiClient.retryTranslation({
  entityType: 'item',
  entityId: item.data.id,
  targetLanguage: 'fr',
});
```

### Polling Utilities

```typescript
import { waitForJobsToComplete, waitForCondition } from './helpers';

// Wait for all translation jobs to complete
const success = await waitForJobsToComplete(entityId, 'item', {
  maxWaitMs: 10000,
  intervalMs: 100,
});

// Wait for custom condition
const met = await waitForCondition(async () => {
  const status = await getStatus();
  return status === 'complete';
});
```

### Test Data Factory

```typescript
import {
  createTestItem,
  createTestTranslationJobBatch,
  MULTILINGUAL_TEST_DATA,
} from './helpers';

// Create test entities
const item = createTestItem({ name: 'Test Item' });

// Create batch of jobs for all languages
const jobs = createTestTranslationJobBatch(item.id, 'item', 'en');

// Access multilingual test data
const frenchName = MULTILINGUAL_TEST_DATA.fr.itemName;
```

## Supported Languages

The translation system supports 6 languages:
- `en` - English
- `fr` - French
- `es` - Spanish
- `de` - German
- `nl` - Dutch
- `it` - Italian

## Entity Types

- `item` - Main item entities (e.g., appliances, amenities)
- `article` - FAQ articles associated with items
- `link` - Useful links associated with items
- `tag` - Tags for categorization

## Job Statuses

- `queued` - Job waiting to be processed
- `processing` - Job currently being translated
- `completed` - Translation successful
- `failed` - Translation failed after retries

## Acceptance Criteria Coverage

| AC | Description | Test File |
|----|-------------|-----------|
| AC-1 | Item creation triggers translations | item-translation.e2e.test.ts |
| AC-2 | Article creation triggers translations | article-translation.e2e.test.ts |
| AC-3 | Link creation triggers translations | link-translation.e2e.test.ts |
| AC-4 | Non-source languages queued | item-translation.e2e.test.ts |
| AC-5 | Correct metadata stored | item-translation.e2e.test.ts |
| AC-7 | Translations stored with required fields | item-translation.e2e.test.ts |
| AC-9 | Translation status per language | translation-status.e2e.test.ts |
| AC-10 | Failed job retry mechanism | translation-retry.e2e.test.ts |
| AC-11 | Manual translation override | manual-override.e2e.test.ts |
| AC-12 | Stale translation detection | stale-translation.e2e.test.ts |
| AC-13 | Batch status queries | batch-status.e2e.test.ts |
| AC-20 | API unavailable handling | error-scenarios.e2e.test.ts |

## Related Documentation

- [REQ-E03-033 Detailed Spec](../../../../../docs/REQ-E03-033-write-e2e-tests-detailed.md)
- [Job Queue Tests](../../../../job-queue/__tests__/)
- [Content Translation Module](../../)
