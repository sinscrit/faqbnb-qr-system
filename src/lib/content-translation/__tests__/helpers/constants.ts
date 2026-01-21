/**
 * Test Constants for Content Translation Module Tests (REQ-E03-030)
 *
 * Shared constants, fixtures, and test data used across all content
 * translation test files for consistency and maintainability.
 *
 * @created 2026-01-21
 */

import type { SupportedLanguage } from '../../../translation-service/translation-service.types';

/** All supported languages for testing */
export const ALL_LANGUAGES: readonly SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;

/** Languages excluding English (common target set) */
export const TARGET_LANGUAGES_FROM_EN: readonly SupportedLanguage[] = ['fr', 'es', 'de', 'nl', 'it'] as const;

/** Test entity IDs */
export const TEST_IDS = {
  ITEM: 'test-item-uuid-00000000-0000-0000-0000-000000000001',
  ARTICLE: 'test-article-uuid-00000000-0000-0000-0000-000000000002',
  LINK: 'test-link-uuid-00000000-0000-0000-0000-000000000003',
  TAG: 'test-tag-key',
  USER: 'test-user-uuid-00000000-0000-0000-0000-000000000010',
  ACCOUNT: 'test-account-uuid-00000000-0000-0000-0000-000000000020',
} as const;

/** Invalid language codes for negative testing */
export const INVALID_LANGUAGES = [
  'invalid',
  'EN',       // uppercase (should be lowercase)
  'eng',      // three-letter ISO code
  '123',      // numeric
  '',         // empty string
  '  ',       // whitespace only
  'xx',       // non-existent language
  null,       // null value
  undefined,  // undefined value
] as const;

/** Default priority values matching implementation */
export const PRIORITIES = {
  CREATE: 100,   // New content - highest priority
  UPDATE: 50,    // Updated content
  BATCH: 25,     // Bulk imports
  RETRY: 10,     // Failed job retries - lowest priority
} as const;

/** Entity types for parameterized testing */
export const ENTITY_TYPES = ['item', 'article', 'link', 'tag'] as const;

/** Sample translatable content for testing */
export const SAMPLE_CONTENT = {
  ITEM_NAME: 'Coffee Machine',
  ITEM_DESCRIPTION: 'A high-quality espresso maker with automatic milk frother.',
  ARTICLE_TITLE: 'How to Use the Coffee Machine',
  ARTICLE_DESCRIPTION: 'Step-by-step instructions for making espresso.',
  LINK_TITLE: 'Coffee Machine Manual PDF',
  TAG_VALUE: 'kitchen-appliance',
} as const;

/** Expected job count when translating from English to all targets */
export const EXPECTED_TARGET_COUNT_FROM_EN = 5;

/** Maximum test execution time (ms) per test file */
export const TEST_TIMEOUT_MS = 5000;
