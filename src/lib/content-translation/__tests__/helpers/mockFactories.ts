/**
 * Mock Factories for Content Translation Tests (REQ-E03-030)
 *
 * Factory functions for creating test data objects with sensible defaults.
 * All factories support partial overrides for flexible test scenarios.
 *
 * @created 2026-01-21
 */

import type {
  QueueTranslationOptions,
  ContentToTranslate,
  QueueTranslationResult,
  TranslatableField,
  EntityType,
  TranslationTrigger,
} from '../../content-translation.types';
import type { SupportedLanguage } from '../../../translation-service/translation-service.types';
import { TEST_IDS, SAMPLE_CONTENT, TARGET_LANGUAGES_FROM_EN } from './constants';

/**
 * Creates a mock TranslatableField object
 */
export function createMockTranslatableField(
  overrides?: Partial<TranslatableField>
): TranslatableField {
  return {
    fieldName: 'name',
    value: SAMPLE_CONTENT.ITEM_NAME,
    context: { contentType: 'item_name', domainContext: 'property_rental' },
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
    entityId: TEST_IDS.ITEM,
    sourceLanguage: 'en',
    fields: [
      createMockTranslatableField({ fieldName: 'name', value: SAMPLE_CONTENT.ITEM_NAME }),
      createMockTranslatableField({ fieldName: 'description', value: SAMPLE_CONTENT.ITEM_DESCRIPTION }),
    ],
    ...overrides,
  };
}

/**
 * Creates a mock QueueTranslationOptions object
 */
export function createMockQueueTranslationOptions(
  overrides?: Partial<QueueTranslationOptions>
): QueueTranslationOptions {
  return {
    content: createMockContentToTranslate(),
    trigger: 'create' as TranslationTrigger,
    ...overrides,
  };
}

/**
 * Creates a mock successful QueueTranslationResult
 */
export function createMockQueueResult(
  languages: SupportedLanguage[] = [...TARGET_LANGUAGES_FROM_EN]
): QueueTranslationResult {
  return {
    success: true,
    jobIds: languages.map((lang, i) => `job-${lang}-${Date.now()}-${i}`),
    queuedLanguages: languages,
  };
}

/**
 * Creates a mock failed QueueTranslationResult
 */
export function createMockQueueErrorResult(
  errorMessage: string = 'Database error'
): QueueTranslationResult {
  return {
    success: false,
    jobIds: [],
    queuedLanguages: [],
    error: errorMessage,
  };
}

/**
 * Creates a mock user object with language preference
 */
export function createMockUser(
  preferredLanguage?: SupportedLanguage | null,
  overrides?: { id?: string }
) {
  return {
    id: overrides?.id ?? TEST_IDS.USER,
    preferred_language: preferredLanguage ?? null,
    email: 'test@example.com',
    created_at: new Date().toISOString(),
  };
}

/**
 * Creates a mock account object with language preference
 */
export function createMockAccount(
  preferredLanguage?: SupportedLanguage | null,
  overrides?: { id?: string }
) {
  return {
    id: overrides?.id ?? TEST_IDS.ACCOUNT,
    preferred_language: preferredLanguage ?? null,
    name: 'Test Account',
    created_at: new Date().toISOString(),
  };
}

/**
 * Creates a mock item record from database
 */
export function createMockItem(overrides?: {
  id?: string;
  name?: string;
  description?: string | null;
  source_language?: SupportedLanguage;
}) {
  return {
    id: overrides?.id ?? TEST_IDS.ITEM,
    name: overrides?.name ?? SAMPLE_CONTENT.ITEM_NAME,
    description: overrides && 'description' in overrides ? overrides.description : SAMPLE_CONTENT.ITEM_DESCRIPTION,
    source_language: overrides?.source_language ?? 'en',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Creates a mock article record from database
 */
export function createMockArticle(overrides?: {
  id?: string;
  title?: string;
  description?: string | null;
  source_language?: SupportedLanguage;
}) {
  return {
    id: overrides?.id ?? TEST_IDS.ARTICLE,
    title: overrides?.title ?? SAMPLE_CONTENT.ARTICLE_TITLE,
    description: overrides && 'description' in overrides ? overrides.description : SAMPLE_CONTENT.ARTICLE_DESCRIPTION,
    source_language: overrides?.source_language ?? 'en',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Creates a mock link record from database
 */
export function createMockLink(overrides?: {
  id?: string;
  title?: string;
  url?: string;
  source_language?: SupportedLanguage;
}) {
  return {
    id: overrides?.id ?? TEST_IDS.LINK,
    title: overrides?.title ?? SAMPLE_CONTENT.LINK_TITLE,
    url: overrides?.url ?? 'https://example.com/manual.pdf',
    source_language: overrides?.source_language ?? 'en',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Creates a mock tag record
 */
export function createMockTag(overrides?: {
  key?: string;
  value?: string;
  is_system_tag?: boolean;
}) {
  return {
    key: overrides?.key ?? TEST_IDS.TAG,
    value: overrides?.value ?? SAMPLE_CONTENT.TAG_VALUE,
    is_system_tag: overrides?.is_system_tag ?? false,
  };
}

/**
 * Creates a mock translation job record
 */
export function createMockTranslationJob(overrides?: {
  id?: string;
  entity_type?: EntityType;
  entity_id?: string;
  source_language?: SupportedLanguage;
  target_language?: SupportedLanguage;
  status?: 'queued' | 'processing' | 'completed' | 'failed';
  priority?: number;
  attempts?: number;
}) {
  return {
    id: overrides?.id ?? `job-${Date.now()}`,
    entity_type: overrides?.entity_type ?? 'item',
    entity_id: overrides?.entity_id ?? TEST_IDS.ITEM,
    source_language: overrides?.source_language ?? 'en',
    target_language: overrides?.target_language ?? 'fr',
    status: overrides?.status ?? 'queued',
    priority: overrides?.priority ?? 100,
    attempts: overrides?.attempts ?? 0,
    created_at: new Date().toISOString(),
    started_at: null,
    completed_at: null,
    error_message: null,
  };
}

/**
 * Creates mock job IDs for batch operations
 */
export function createMockJobIds(count: number = 5): string[] {
  return Array.from({ length: count }, (_, i) => `job-${Date.now()}-${i}`);
}

/**
 * Creates detection options for source language detection tests
 */
export function createMockDetectionOptions(overrides?: {
  override?: SupportedLanguage;
  user?: ReturnType<typeof createMockUser> | null;
  account?: ReturnType<typeof createMockAccount> | null;
}) {
  return {
    override: overrides?.override,
    user: overrides?.user ?? createMockUser(),
    account: overrides?.account ?? createMockAccount(),
  };
}
