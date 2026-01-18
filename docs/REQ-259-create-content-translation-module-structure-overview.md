# REQ-259: Create Content Translation Module Structure and Type Definitions - Implementation Overview

**Generated:** 2026-01-18 00:00:00 UTC
**Last Modified:** 2026-01-18 00:00:00 UTC
**Request Reference:** REQ-259 - Create Content Translation Module Structure and Type Definitions
**Plan Reference:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md (Phase 1, Task 1.1)
**Status:** Ready for Implementation

---

## 1. Request Summary

Create the foundational module structure and comprehensive TypeScript type definitions for the content translation system that will handle dynamic user-generated content translation across all supported languages (en, fr, es, de, nl, it).

**Scope:**
- Create `/src/lib/content-translation/` directory structure
- Create `/src/lib/content-translation/index.ts` - module exports
- Create `/src/lib/content-translation/content-translation.types.ts` - comprehensive type definitions
- Define all TypeScript interfaces for translatable content entities (items, articles, links, tags)
- Define translation metadata types (source language, target languages, translation status, timestamps)
- Define batch translation operation types
- Define error handling structures for failed/partial translations

**Out of Scope:**
- Content translation orchestrator implementation (Task 1.2)
- Entity-specific translation triggers (Tasks 1.3, 1.4)
- Translation storage utilities (Task 1.5)
- Translation status utilities (Task 1.6)
- API endpoint implementations (Phase 4)

---

## 2. Current State Analysis

### Existing Technology Stack

| Technology | Version | Location |
|------------|---------|----------|
| Next.js | 15.5.9 | `package.json` |
| React | 19.1.0 | `package.json` |
| TypeScript | ^5 | `package.json` |
| Supabase | Latest | `@supabase/supabase-js`, `@supabase/ssr` |
| Tailwind CSS | ^4 | `package.json` |

### Relevant Existing Patterns

| Pattern | Location | Usage for REQ-259 |
|---------|----------|-------------------|
| Type definitions | `/src/types/index.ts` | Pattern for organizing TypeScript interfaces |
| Module exports | `/src/lib/supabase.ts` | Pattern for exporting from module index |
| Database types | `/src/lib/supabase.ts` | Database type structure pattern |
| Entity types | `/src/types/index.ts` | Item, ItemArticle, ItemLink type patterns |
| API response types | `/src/types/index.ts` | Response wrapper patterns |

### Existing Content Entities

From `/src/types/index.ts`:

| Entity | Key Fields | Translation Targets |
|--------|------------|---------------------|
| `Item` | id, name, description, publicId | name, description |
| `ItemArticle` | id, itemId, title, description, purpose | title, description |
| `ItemLink` | id, title, url, link_type | title only (URL not translated) |
| (Tags) | Not yet typed | tag value |

### Dependencies from Epic 1 (Plan-110)

This task requires the following Epic 1 components (if not available, define types that align with expected structures):

| Component | Expected Location | Status |
|-----------|-------------------|--------|
| Translation service types | `/src/lib/translation-service/` | **Required** - `SupportedLanguage`, `TranslationContext` |
| Translation tables | Database | **Required** - translation_jobs schema reference |
| Source language columns | Database | **Required** - items.source_language concept |

**Note:** If Epic 1 translation-service types don't exist yet, this task should define compatible placeholder types that will be aligned later.

---

## 3. Technical Approach

### Module Architecture

```
/src/lib/content-translation/
├── index.ts                         # Module exports (barrel file)
├── content-translation.types.ts     # All TypeScript interfaces
├── content-translation.ts           # (Task 1.2 - not this task)
├── triggers/                        # (Tasks 1.3, 1.4 - not this task)
│   ├── item-trigger.ts
│   ├── article-trigger.ts
│   ├── link-trigger.ts
│   └── tag-trigger.ts
└── storage/                         # (Tasks 1.5, 1.6 - not this task)
    ├── translation-storage.ts
    └── translation-status.ts
```

### Type Design Principles

1. **Entity-Agnostic Core Types:** Generic interfaces that work for any translatable entity
2. **Entity-Specific Extensions:** Specialized types for items, articles, links, tags
3. **Alignment with Database Schema:** Types mirror expected database table structures
4. **Translation Service Integration:** Types compatible with Epic 1 translation service
5. **Batch Operation Support:** Types for efficient multi-language translation queuing
6. **Error Handling:** Comprehensive error types for partial/failed translations

### Supported Languages (from PRD)

| Code | Language | Native Name |
|------|----------|-------------|
| `en` | English | English |
| `fr` | French | Français |
| `es` | Spanish | Español |
| `de` | German | Deutsch |
| `nl` | Dutch | Nederlands |
| `it` | Italian | Italiano |

---

## 4. Implementation Tasks

### Task 1.1.1: Create content-translation directory

**Action:** Create directory structure
**Path:** `/src/lib/content-translation/`

**Verification:**
- Directory exists at `/src/lib/content-translation/`
- Directory is ready for additional files

### Task 1.1.2: Create content-translation.types.ts

**Action:** Create new file with comprehensive type definitions
**File:** `/src/lib/content-translation/content-translation.types.ts`

**Content:**
```typescript
/**
 * Content Translation Type Definitions
 *
 * Defines all TypeScript interfaces for the content translation system
 * that handles dynamic user-generated content translation across
 * all supported languages.
 *
 * @module content-translation/types
 * @see Plan-111-L10N-Epic3-Dynamic-Content-Translation.md
 */

// =============================================================================
// LANGUAGE TYPES
// =============================================================================

/**
 * Supported language codes for translation
 * Aligned with Epic 1 foundation and PRD requirements
 */
export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

/**
 * Array of all supported languages for iteration
 */
export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = [
  'en', 'fr', 'es', 'de', 'nl', 'it'
] as const;

/**
 * Default source language when none specified
 */
export const DEFAULT_SOURCE_LANGUAGE: SupportedLanguage = 'en';

/**
 * Language display names for UI
 */
export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
  nl: 'Nederlands',
  it: 'Italiano'
};

// =============================================================================
// ENTITY TYPES
// =============================================================================

/**
 * Types of entities that can be translated
 */
export type EntityType = 'item' | 'article' | 'link' | 'tag';

/**
 * Trigger types for translation queue prioritization
 */
export type TranslationTrigger = 'create' | 'update' | 'retry' | 'manual' | 'batch_import';

/**
 * Status of an individual translation
 */
export type TranslationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'manual';

/**
 * Overall translation status for an entity across all languages
 */
export type OverallTranslationStatus = 'complete' | 'partial' | 'pending' | 'failed';

// =============================================================================
// TRANSLATION CONTEXT TYPES
// =============================================================================

/**
 * Context provided to translation service for better translation quality
 * Aligned with Epic 1 translation service interface
 */
export interface TranslationContext {
  /** Type of content being translated */
  contentType: ContentType;
  /** Domain/industry context */
  domain: TranslationDomain;
  /** Optional system prompt override */
  systemPrompt?: string;
  /** Maximum length constraint for translation */
  maxLength?: number;
}

/**
 * Content types for contextual translation
 */
export type ContentType =
  | 'item_name'
  | 'item_description'
  | 'article_title'
  | 'article_description'
  | 'link_title'
  | 'tag';

/**
 * Domain contexts for translation quality
 */
export type TranslationDomain =
  | 'property_rental'
  | 'property_rental_appliances'
  | 'property_rental_instructions'
  | 'property_rental_media'
  | 'property_rental_categorization';

/**
 * Pre-defined translation context templates
 */
export const TRANSLATION_CONTEXTS: Record<ContentType, TranslationContext> = {
  item_name: {
    contentType: 'item_name',
    domain: 'property_rental_appliances',
    systemPrompt: 'Translate the name of a household item or appliance in a vacation rental context. Keep it concise and natural.',
    maxLength: 255
  },
  item_description: {
    contentType: 'item_description',
    domain: 'property_rental_appliances',
    systemPrompt: 'Translate a description of a household item for vacation rental guests. Maintain helpful, friendly tone.'
  },
  article_title: {
    contentType: 'article_title',
    domain: 'property_rental_instructions',
    systemPrompt: 'Translate the title of an instruction article for vacation rental guests. Format: "[How to/Safety/etc] - [Item Name]"',
    maxLength: 255
  },
  article_description: {
    contentType: 'article_description',
    domain: 'property_rental_instructions',
    systemPrompt: 'Translate instruction content for vacation rental guests. Keep instructions clear and actionable.'
  },
  link_title: {
    contentType: 'link_title',
    domain: 'property_rental_media',
    systemPrompt: 'Translate a media link title (video, PDF, etc.) for vacation rental guests. Keep it descriptive but concise.',
    maxLength: 255
  },
  tag: {
    contentType: 'tag',
    domain: 'property_rental_categorization',
    systemPrompt: 'Translate a category tag for household items. Single word or short phrase, suitable for filtering/searching.',
    maxLength: 100
  }
};

// =============================================================================
// TRANSLATABLE CONTENT TYPES
// =============================================================================

/**
 * Individual field that needs translation
 */
export interface TranslatableField {
  /** Database field name */
  fieldName: string;
  /** Original text value to translate */
  value: string;
  /** Context for translation quality */
  context: TranslationContext;
  /** Maximum allowed length for translation */
  maxLength?: number;
}

/**
 * Content entity ready for translation
 */
export interface ContentToTranslate {
  /** Type of entity */
  entityType: EntityType;
  /** UUID of the entity */
  entityId: string;
  /** Source language of the content */
  sourceLanguage: SupportedLanguage;
  /** Fields that need translation */
  fields: TranslatableField[];
}

/**
 * Entity-specific content extraction interfaces
 */
export interface ItemContentToTranslate extends ContentToTranslate {
  entityType: 'item';
  fields: [
    TranslatableField & { fieldName: 'name' },
    TranslatableField & { fieldName: 'description' }
  ];
}

export interface ArticleContentToTranslate extends ContentToTranslate {
  entityType: 'article';
  fields: [
    TranslatableField & { fieldName: 'title' },
    TranslatableField & { fieldName: 'description' }
  ];
}

export interface LinkContentToTranslate extends ContentToTranslate {
  entityType: 'link';
  fields: [
    TranslatableField & { fieldName: 'title' }
  ];
}

export interface TagContentToTranslate extends ContentToTranslate {
  entityType: 'tag';
  fields: [
    TranslatableField & { fieldName: 'value' }
  ];
}

// =============================================================================
// TRANSLATION QUEUE TYPES
// =============================================================================

/**
 * Options for queuing translation jobs
 */
export interface QueueTranslationOptions {
  /** Content to translate */
  content: ContentToTranslate;
  /** What triggered this translation (affects priority) */
  trigger: TranslationTrigger;
  /** Languages to skip (e.g., source language) */
  excludeLanguages?: SupportedLanguage[];
  /** Custom priority override (higher = more urgent, default based on trigger) */
  priority?: number;
  /** Account ID for multi-tenant context */
  accountId?: string;
}

/**
 * Result of queuing translation jobs
 */
export interface QueueTranslationResult {
  /** Whether queuing was successful */
  success: boolean;
  /** IDs of created translation jobs */
  jobIds: string[];
  /** Languages that were queued for translation */
  queuedLanguages: SupportedLanguage[];
  /** Languages that were skipped */
  skippedLanguages: SupportedLanguage[];
  /** Error message if failed */
  error?: string;
  /** Detailed errors per language if partial failure */
  languageErrors?: Record<SupportedLanguage, string>;
}

/**
 * Priority levels for translation jobs
 */
export const TRANSLATION_PRIORITIES: Record<TranslationTrigger, number> = {
  create: 100,      // Highest priority - new content
  update: 75,       // High priority - updated content
  manual: 60,       // Medium-high priority - user-initiated
  retry: 25,        // Lower priority - automatic retry
  batch_import: 10  // Lowest priority - bulk operations
};

// =============================================================================
// TRANSLATION JOB TYPES
// =============================================================================

/**
 * Translation job record (matches database schema)
 */
export interface TranslationJob {
  /** Job UUID */
  id: string;
  /** Type of entity being translated */
  entity_type: EntityType;
  /** Entity UUID */
  entity_id: string;
  /** Source language code */
  source_language: SupportedLanguage;
  /** Target language code */
  target_language: SupportedLanguage;
  /** Current job status */
  status: TranslationStatus;
  /** Priority (higher = more urgent) */
  priority: number;
  /** Number of processing attempts */
  attempts: number;
  /** Last error message if failed */
  error_message?: string | null;
  /** When job was created */
  created_at: string;
  /** When processing started */
  started_at?: string | null;
  /** When processing completed */
  completed_at?: string | null;
  /** Account ID for multi-tenant context */
  account_id?: string | null;
}

/**
 * Job creation input (without auto-generated fields)
 */
export interface CreateTranslationJobInput {
  entity_type: EntityType;
  entity_id: string;
  source_language: SupportedLanguage;
  target_language: SupportedLanguage;
  priority: number;
  account_id?: string;
}

/**
 * Job update input
 */
export interface UpdateTranslationJobInput {
  status?: TranslationStatus;
  attempts?: number;
  error_message?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
}

// =============================================================================
// TRANSLATION STATUS TYPES
// =============================================================================

/**
 * Status of translation for a single language
 */
export interface LanguageTranslationStatus {
  /** Current status */
  status: TranslationStatus;
  /** When translation was completed */
  translatedAt?: string;
  /** User who manually edited (if manual) */
  reviewedBy?: string;
  /** Error message if failed */
  error?: string;
  /** Number of retry attempts */
  attempts?: number;
}

/**
 * Complete translation status for an entity
 */
export interface EntityTranslationStatus {
  /** Entity UUID */
  entityId: string;
  /** Entity type */
  entityType: EntityType;
  /** Original content language */
  sourceLanguage: SupportedLanguage;
  /** Overall status across all languages */
  overallStatus: OverallTranslationStatus;
  /** Status per target language */
  translations: Record<SupportedLanguage, LanguageTranslationStatus>;
  /** Languages still pending */
  pendingLanguages: SupportedLanguage[];
  /** Languages successfully completed */
  completedLanguages: SupportedLanguage[];
  /** Languages that failed */
  failedLanguages: SupportedLanguage[];
}

/**
 * Batch status request for multiple entities
 */
export interface BatchStatusRequest {
  entities: Array<{
    entityType: EntityType;
    entityId: string;
  }>;
}

/**
 * Batch status response
 */
export interface BatchStatusResult {
  success: boolean;
  results: EntityTranslationStatus[];
  errors?: Array<{
    entityType: EntityType;
    entityId: string;
    error: string;
  }>;
}

// =============================================================================
// TRANSLATION RESULT TYPES
// =============================================================================

/**
 * Result of translating a single field
 */
export interface FieldTranslationResult {
  /** Field that was translated */
  fieldName: string;
  /** Original text */
  originalValue: string;
  /** Translated text */
  translatedValue: string;
  /** Target language */
  language: SupportedLanguage;
}

/**
 * Result of processing a translation job
 */
export interface TranslationJobResult {
  /** Job ID */
  jobId: string;
  /** Whether translation succeeded */
  success: boolean;
  /** Translated fields */
  translations?: FieldTranslationResult[];
  /** Error if failed */
  error?: string;
  /** Processing time in milliseconds */
  processingTimeMs?: number;
}

// =============================================================================
// STORED TRANSLATION TYPES
// =============================================================================

/**
 * Base interface for stored translations
 */
export interface StoredTranslationBase {
  /** Language code */
  language: SupportedLanguage;
  /** Translation status */
  translation_status: TranslationStatus;
  /** When translated */
  translated_at?: string | null;
  /** User who reviewed (if manual) */
  reviewed_by?: string | null;
  /** When record was created */
  created_at: string;
  /** When record was last updated */
  updated_at: string;
}

/**
 * Stored item translation (matches item_translations table)
 */
export interface StoredItemTranslation extends StoredTranslationBase {
  id: string;
  item_id: string;
  name: string;
  description?: string | null;
}

/**
 * Stored article translation (matches article_translations table)
 */
export interface StoredArticleTranslation extends StoredTranslationBase {
  id: string;
  article_id: string;
  title: string;
  description?: string | null;
}

/**
 * Stored link translation (matches link_translations table)
 */
export interface StoredLinkTranslation extends StoredTranslationBase {
  id: string;
  link_id: string;
  title: string;
}

/**
 * Stored tag translation (matches tag_translations table)
 */
export interface StoredTagTranslation extends StoredTranslationBase {
  id: string;
  tag_key: string;
  value: string;
  is_system_tag: boolean;
}

// =============================================================================
// TRANSLATION STORAGE INPUT TYPES
// =============================================================================

/**
 * Input for storing item translation
 */
export interface StoreItemTranslationInput {
  item_id: string;
  language: SupportedLanguage;
  name: string;
  description?: string | null;
  translation_status: TranslationStatus;
  reviewed_by?: string;
}

/**
 * Input for storing article translation
 */
export interface StoreArticleTranslationInput {
  article_id: string;
  language: SupportedLanguage;
  title: string;
  description?: string | null;
  translation_status: TranslationStatus;
  reviewed_by?: string;
}

/**
 * Input for storing link translation
 */
export interface StoreLinkTranslationInput {
  link_id: string;
  language: SupportedLanguage;
  title: string;
  translation_status: TranslationStatus;
  reviewed_by?: string;
}

/**
 * Input for storing tag translation
 */
export interface StoreTagTranslationInput {
  tag_key: string;
  language: SupportedLanguage;
  value: string;
  is_system_tag: boolean;
  translation_status: TranslationStatus;
  reviewed_by?: string;
}

// =============================================================================
// ERROR TYPES
// =============================================================================

/**
 * Error codes for content translation operations
 */
export enum ContentTranslationErrorCode {
  /** Entity not found in database */
  ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',
  /** Invalid entity type provided */
  INVALID_ENTITY_TYPE = 'INVALID_ENTITY_TYPE',
  /** Invalid language code */
  INVALID_LANGUAGE = 'INVALID_LANGUAGE',
  /** Translation service unavailable */
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  /** Rate limit exceeded */
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  /** Translation API error */
  TRANSLATION_API_ERROR = 'TRANSLATION_API_ERROR',
  /** Database error during storage */
  STORAGE_ERROR = 'STORAGE_ERROR',
  /** Job not found */
  JOB_NOT_FOUND = 'JOB_NOT_FOUND',
  /** Maximum retry attempts exceeded */
  MAX_RETRIES_EXCEEDED = 'MAX_RETRIES_EXCEEDED',
  /** Validation error */
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  /** Authorization error */
  UNAUTHORIZED = 'UNAUTHORIZED'
}

/**
 * Content translation error
 */
export interface ContentTranslationError {
  /** Error code for programmatic handling */
  code: ContentTranslationErrorCode;
  /** Human-readable error message */
  message: string;
  /** Entity type if applicable */
  entityType?: EntityType;
  /** Entity ID if applicable */
  entityId?: string;
  /** Language if applicable */
  language?: SupportedLanguage;
  /** Original error details */
  details?: unknown;
}

/**
 * Helper to create typed content translation errors
 */
export function createContentTranslationError(
  code: ContentTranslationErrorCode,
  message: string,
  options?: Partial<Omit<ContentTranslationError, 'code' | 'message'>>
): ContentTranslationError {
  return {
    code,
    message,
    ...options
  };
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

/**
 * API response for translation status endpoint
 */
export interface TranslationStatusResponse {
  success: boolean;
  data?: EntityTranslationStatus;
  error?: string;
  errorCode?: ContentTranslationErrorCode;
}

/**
 * API response for retry translation endpoint
 */
export interface RetryTranslationResponse {
  success: boolean;
  jobsQueued: number;
  queuedLanguages: SupportedLanguage[];
  error?: string;
  errorCode?: ContentTranslationErrorCode;
}

/**
 * API request for manual translation override
 */
export interface ManualTranslationRequest {
  /** For items */
  name?: string;
  /** For items/articles */
  description?: string;
  /** For articles/links */
  title?: string;
  /** For tags */
  value?: string;
}

/**
 * API response for manual translation override
 */
export interface ManualTranslationResponse {
  success: boolean;
  data?: {
    entityId: string;
    entityType: EntityType;
    language: SupportedLanguage;
    translationStatus: 'manual';
    reviewedBy: string;
    updatedAt: string;
  };
  error?: string;
  errorCode?: ContentTranslationErrorCode;
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard for SupportedLanguage
 */
export function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  return typeof value === 'string' && SUPPORTED_LANGUAGES.includes(value as SupportedLanguage);
}

/**
 * Type guard for EntityType
 */
export function isEntityType(value: unknown): value is EntityType {
  return typeof value === 'string' && ['item', 'article', 'link', 'tag'].includes(value);
}

/**
 * Type guard for TranslationStatus
 */
export function isTranslationStatus(value: unknown): value is TranslationStatus {
  return typeof value === 'string' &&
    ['pending', 'processing', 'completed', 'failed', 'manual'].includes(value);
}

/**
 * Type guard for TranslationTrigger
 */
export function isTranslationTrigger(value: unknown): value is TranslationTrigger {
  return typeof value === 'string' &&
    ['create', 'update', 'retry', 'manual', 'batch_import'].includes(value);
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Get target languages (all languages except source)
 */
export function getTargetLanguages(sourceLanguage: SupportedLanguage): SupportedLanguage[] {
  return SUPPORTED_LANGUAGES.filter(lang => lang !== sourceLanguage) as SupportedLanguage[];
}

/**
 * Calculate overall status from individual language statuses
 */
export function calculateOverallStatus(
  statuses: Record<SupportedLanguage, LanguageTranslationStatus>,
  sourceLanguage: SupportedLanguage
): OverallTranslationStatus {
  const targetLanguages = getTargetLanguages(sourceLanguage);

  const statusValues = targetLanguages.map(lang => statuses[lang]?.status);

  const allCompleted = statusValues.every(s => s === 'completed' || s === 'manual');
  const anyFailed = statusValues.some(s => s === 'failed');
  const anyPending = statusValues.some(s => s === 'pending' || s === 'processing');

  if (allCompleted) return 'complete';
  if (anyFailed && !anyPending) return 'failed';
  if (anyPending) return 'pending';
  return 'partial';
}
```

### Task 1.1.3: Create index.ts (module exports)

**Action:** Create barrel export file
**File:** `/src/lib/content-translation/index.ts`

**Content:**
```typescript
/**
 * Content Translation Module
 *
 * Provides infrastructure for translating dynamic user-generated content
 * (items, articles, links, tags) across all supported languages.
 *
 * @module content-translation
 * @see Plan-111-L10N-Epic3-Dynamic-Content-Translation.md
 */

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type {
  // Language types
  SupportedLanguage,

  // Entity types
  EntityType,
  TranslationTrigger,
  TranslationStatus,
  OverallTranslationStatus,

  // Context types
  TranslationContext,
  ContentType,
  TranslationDomain,

  // Content types
  TranslatableField,
  ContentToTranslate,
  ItemContentToTranslate,
  ArticleContentToTranslate,
  LinkContentToTranslate,
  TagContentToTranslate,

  // Queue types
  QueueTranslationOptions,
  QueueTranslationResult,

  // Job types
  TranslationJob,
  CreateTranslationJobInput,
  UpdateTranslationJobInput,

  // Status types
  LanguageTranslationStatus,
  EntityTranslationStatus,
  BatchStatusRequest,
  BatchStatusResult,

  // Result types
  FieldTranslationResult,
  TranslationJobResult,

  // Storage types
  StoredTranslationBase,
  StoredItemTranslation,
  StoredArticleTranslation,
  StoredLinkTranslation,
  StoredTagTranslation,
  StoreItemTranslationInput,
  StoreArticleTranslationInput,
  StoreLinkTranslationInput,
  StoreTagTranslationInput,

  // Error types
  ContentTranslationError,

  // API types
  TranslationStatusResponse,
  RetryTranslationResponse,
  ManualTranslationRequest,
  ManualTranslationResponse,
} from './content-translation.types';

// =============================================================================
// CONSTANT EXPORTS
// =============================================================================

export {
  SUPPORTED_LANGUAGES,
  DEFAULT_SOURCE_LANGUAGE,
  LANGUAGE_NAMES,
  TRANSLATION_CONTEXTS,
  TRANSLATION_PRIORITIES,
  ContentTranslationErrorCode,
} from './content-translation.types';

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

export {
  isSupportedLanguage,
  isEntityType,
  isTranslationStatus,
  isTranslationTrigger,
  getTargetLanguages,
  calculateOverallStatus,
  createContentTranslationError,
} from './content-translation.types';

// =============================================================================
// FUTURE EXPORTS (to be added in subsequent tasks)
// =============================================================================

// Task 1.2: Content translation orchestrator
// export { queueContentTranslations } from './content-translation';

// Task 1.3-1.4: Translation triggers
// export { triggerItemTranslation } from './triggers/item-trigger';
// export { triggerArticleTranslation } from './triggers/article-trigger';
// export { triggerLinkTranslation } from './triggers/link-trigger';
// export { triggerTagTranslation } from './triggers/tag-trigger';

// Task 1.5: Translation storage
// export {
//   storeItemTranslation,
//   storeArticleTranslation,
//   storeLinkTranslation,
//   storeTagTranslation,
// } from './storage/translation-storage';

// Task 1.6: Translation status
// export {
//   getEntityTranslationStatus,
//   getBatchTranslationStatus,
// } from './storage/translation-status';
```

---

## 5. Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Description |
|-----------|-------------|
| `/src/lib/content-translation/` | New content-translation module directory |
| `/src/lib/content-translation/index.ts` | Module exports (barrel file) |
| `/src/lib/content-translation/content-translation.types.ts` | All TypeScript type definitions |

### Files to MODIFY

None - this task creates new files only.

### Files to READ (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/src/types/index.ts` | Reference existing type patterns |
| `/src/lib/supabase.ts` | Reference Database type structure |
| `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` | Implementation plan reference |
| `/docs/gen_requests_epic3.md` | Request reference |

### No Modifications Required

The following files should NOT be modified for this task:
- `/src/types/index.ts` (future task may add type re-exports)
- `/src/lib/supabase.ts` (database types added via migrations)
- Any API route files (Phase 2-4 tasks)
- Any component files

---

## 6. Dependencies

### NPM Package Dependencies

None required - uses only TypeScript built-in types.

### Internal Dependencies

This task has no dependencies on other L10N Epic 3 tasks (it is the first task).

**Note:** Types are designed to be compatible with Epic 1 translation service. If Epic 1 is not complete, types defined here will serve as the contract that Epic 1 should implement.

### Downstream Dependencies (Tasks blocked by this)

| Task | Dependency |
|------|------------|
| Task 1.2: Implement content translation orchestrator | Requires types from this task |
| Task 1.3: Implement item-trigger.ts | Requires types from this task |
| Task 1.4: Implement tag-trigger.ts | Requires types from this task |
| Task 1.5: Implement translation-storage.ts | Requires types from this task |
| Task 1.6: Implement translation-status.ts | Requires types from this task |
| All Phase 2-7 tasks | Transitively depend on these types |

---

## 7. Acceptance Criteria

From REQ-259:

- [ ] A module index file exports all public-facing translation types and interfaces
- [ ] Type definitions include interfaces for translatable content entities (properties, amenities, rules, FAQs) - mapped to items, articles, links, tags
- [ ] Type definitions specify translation metadata (source language, target languages, translation status, timestamps)
- [ ] Type definitions support batch translation operations for efficiency
- [ ] Type definitions include error handling structures for failed or partial translations
- [ ] All types are properly exported and importable by other application modules
- [ ] Type definitions align with the database schema established in Epic 3 foundation tasks

Additional verification:
- [ ] `/src/lib/content-translation/` directory exists
- [ ] `/src/lib/content-translation/index.ts` exports all types
- [ ] `/src/lib/content-translation/content-translation.types.ts` contains all type definitions
- [ ] TypeScript compilation passes without errors
- [ ] Types can be imported in other modules: `import { EntityType } from '@/lib/content-translation'`

---

## 8. Testing Strategy

### Pre-Implementation Verification

1. **Verify Directory Doesn't Exist:**
   ```bash
   ls -la src/lib/content-translation/
   # Expected: No such file or directory
   ```

### Post-Implementation Verification

2. **Directory Structure Check:**
   ```bash
   ls -la src/lib/content-translation/
   # Expected: index.ts, content-translation.types.ts
   ```

3. **TypeScript Compilation Check:**
   ```bash
   npx tsc --noEmit
   # Expected: No errors
   ```

4. **Import Test (manual verification):**
   Create a temporary test file to verify imports work:
   ```typescript
   // src/lib/content-translation/__tests__/import-test.ts
   import {
     SupportedLanguage,
     EntityType,
     TranslationStatus,
     ContentToTranslate,
     QueueTranslationOptions,
     QueueTranslationResult,
     EntityTranslationStatus,
     SUPPORTED_LANGUAGES,
     TRANSLATION_CONTEXTS,
     isSupportedLanguage,
     getTargetLanguages,
   } from '../index';

   // Type assertions
   const lang: SupportedLanguage = 'en';
   const entity: EntityType = 'item';
   const status: TranslationStatus = 'pending';

   console.log('All imports successful');
   console.log('Supported languages:', SUPPORTED_LANGUAGES);
   console.log('Target languages for en:', getTargetLanguages('en'));
   ```

5. **Build Verification:**
   ```bash
   npm run build
   # Expected: Build completes successfully
   ```

### Manual Verification Checklist

- [ ] `/src/lib/content-translation/` directory exists
- [ ] `index.ts` file exists and exports types
- [ ] `content-translation.types.ts` contains all type definitions
- [ ] `SupportedLanguage` type includes all 6 languages
- [ ] `EntityType` includes 'item', 'article', 'link', 'tag'
- [ ] `TranslationStatus` includes all status values
- [ ] Type guards (`isSupportedLanguage`, etc.) are exported
- [ ] Constants (`SUPPORTED_LANGUAGES`, etc.) are exported
- [ ] No TypeScript errors in the project

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Type incompatibility with Epic 1 | Medium | Medium | Design types to be flexible; review Epic 1 contracts |
| Missing type definitions | Low | Medium | Comprehensive review of Plan-111 requirements |
| TypeScript compilation errors | Low | Low | Run tsc frequently during development |
| Circular import issues | Low | Low | Use barrel exports pattern; careful module organization |
| Type naming conflicts | Low | Low | Use specific naming; prefix with Content/Translation |

---

## 10. Estimated Effort

| Task | Estimate |
|------|----------|
| Create content-translation directory | 1 min |
| Create content-translation.types.ts | 30 min |
| Create index.ts | 10 min |
| Verification and testing | 10 min |
| **Total** | **~50 min** |

---

## 11. Implementation Commands Summary

```bash
# Step 1: Create directory
mkdir -p src/lib/content-translation

# Step 2: Create type definitions file
# (Use content from Task 1.1.2 section)

# Step 3: Create index.ts
# (Use content from Task 1.1.3 section)

# Step 4: Verify TypeScript compilation
npx tsc --noEmit

# Step 5: Verify build
npm run build

# Step 6: Verify directory structure
ls -la src/lib/content-translation/
```

---

## 12. Next Steps After Implementation

After completing Task 1.1 (this task):

1. **Task 1.2:** Implement content translation orchestrator (`/src/lib/content-translation/content-translation.ts`)
2. **Task 1.3:** Implement item/article/link translation triggers
3. **Task 1.4:** Implement tag translation trigger
4. **Task 1.5:** Implement translation storage utilities
5. **Task 1.6:** Implement translation status utilities

---

## References

- [PRD: L10N Epic 3 - Dynamic Content Translation](/docs/prd/PRD_L10N_Epic3_Dynamic_Content_Translation.md)
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md)
- [Request Reference](/docs/gen_requests_epic3.md) - REQ-259
- [Existing Types](/src/types/index.ts)
- [Database Types](/src/lib/supabase.ts)

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation, Phase 1, Task 1.1*
