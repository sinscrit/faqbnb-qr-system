# REQ-235: Create Translation Service Module Structure - Detailed Task Breakdown

**Document Created:** 2026-01-18 21:45 UTC
**Last Modified:** 2026-01-18 21:28 UTC
**Request Reference:** REQ-235 (Translation Service Module Infrastructure)
**Overview Document:** REQ-235-create-translation-service-module-structure-overview.md
**Implementation Plan Reference:** Plan-110-L10N-Epic1-Foundation.md
**Phase:** 3 - Translation Service
**Task ID:** 3.1

---

## Summary

This document provides a granular, step-by-step task breakdown for creating the translation service module directory structure and comprehensive TypeScript type definitions. Each task is designed to be approximately 1 story point (completable in a single focused session) and includes explicit verification steps.

---

## Prerequisites

- [ ] Phase 1 (Database Foundation) tasks completed or in parallel
- [ ] Phase 2 (i18n Framework Integration) tasks completed or in parallel
- [ ] Development environment running with TypeScript compilation
- [ ] Understanding of the existing `/src/lib/` module patterns (see `email-service.ts` for reference)

---

## Task Breakdown

### Task 3.1.1: Create Translation Service Directory Structure

**Description:** Create the base directory structure for the translation service module following the established `/src/lib/` pattern.

**Story Points:** 0.5

**Actions:**

1. Create the main translation service directory:
   ```bash
   mkdir -p /src/lib/translation-service
   ```

2. Create the providers subdirectory for AI provider implementations:
   ```bash
   mkdir -p /src/lib/translation-service/providers
   ```

3. Create the utils subdirectory for rate limiting and retry logic:
   ```bash
   mkdir -p /src/lib/translation-service/utils
   ```

**Files to Create:**
| Path | Purpose |
|------|---------|
| `/src/lib/translation-service/` | Module root directory |
| `/src/lib/translation-service/providers/` | AI provider implementations (Claude, OpenAI) |
| `/src/lib/translation-service/utils/` | Utility functions (rate limiter, retry) |

**Verification:**
- [x] Directory `/src/lib/translation-service/` exists
- [x] Directory `/src/lib/translation-service/providers/` exists
- [x] Directory `/src/lib/translation-service/utils/` exists
- [x] Run `ls -la /src/lib/translation-service/` shows both subdirectories

**Dependencies:** None

**Blocks:** Tasks 3.1.2, 3.1.3, 3.1.4, 3.1.5

---

### Task 3.1.2: Create Core Language Type Definitions

**Description:** Create the type definition file with core language types, status enums, and provider types.

**Story Points:** 1

**File:** `/src/lib/translation-service/translation-service.types.ts`

**Actions:**

1. Create the file with module documentation header
2. Define `SupportedLanguage` type union for ISO 639-1 codes
3. Define `TranslationStatus` type for tracking translation state
4. Define `TranslationProvider` type for provider selection
5. Define `TranslatableEntityType` for entity categorization

**Code to Implement:**

```typescript
/**
 * Translation Service Type Definitions
 * Part of REQ-235: Translation Service Module Infrastructure
 *
 * This module defines TypeScript interfaces and types for the translation
 * service that powers dynamic content translation across FAQBNB.
 *
 * @module translation-service/types
 * @created 2026-01-18
 */

// ============================================================================
// Core Language Types
// ============================================================================

/**
 * Supported language codes following ISO 639-1 standard.
 * These are the languages supported by the FAQBNB localization system.
 *
 * @see Plan-110-L10N-Epic1-Foundation.md for language selection rationale
 */
export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

/**
 * Translation status tracking for database records.
 * Used to track the lifecycle of translation records.
 *
 * - pending: Translation queued but not yet started
 * - processing: Translation currently in progress
 * - completed: Translation finished successfully
 * - failed: Translation failed after all retry attempts
 * - manual: Translation provided manually by user (not auto-generated)
 */
export type TranslationStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'manual';

/**
 * Available AI translation providers.
 * Claude is primary, OpenAI is fallback.
 */
export type TranslationProvider = 'claude' | 'openai';

/**
 * Entity types that can be translated.
 * Maps to translation tables in the database.
 */
export type TranslatableEntityType = 'article' | 'item' | 'link' | 'tag';
```

**Verification:**
- [x] File exists at `/src/lib/translation-service/translation-service.types.ts`
- [x] TypeScript compiles without errors: `npx tsc --noEmit`
- [x] All 4 type definitions are exported
- [x] Documentation comments are present for each type

**Dependencies:** Task 3.1.1

**Blocks:** Task 3.1.2.1 (next sub-task)

---

### Task 3.1.2.1: Add Translation Context Type Definitions

**Description:** Add type definitions for translation context that improves AI translation quality.

**Story Points:** 0.5

**File:** `/src/lib/translation-service/translation-service.types.ts` (append)

**Actions:**

1. Add `TranslationContext` interface for domain-specific context
2. Define content type literals for accurate context passing
3. Add tone/style guidance type

**Code to Append:**

```typescript
// ============================================================================
// Translation Context Types
// ============================================================================

/**
 * Context information to improve translation quality.
 * Passed to AI providers for domain-aware translations.
 */
export interface TranslationContext {
  /**
   * Type of content being translated.
   * Helps AI understand appropriate terminology and style.
   */
  contentType:
    | 'item_name'
    | 'item_description'
    | 'article_title'
    | 'article_description'
    | 'link_title'
    | 'tag';

  /**
   * Domain context for better translations.
   * Example: "property rental, appliance instructions"
   */
  domainContext?: string;

  /**
   * Maximum character length for the translated text.
   * AI will attempt to keep translations within this limit.
   */
  maxLength?: number;

  /**
   * Tone/style guidance for translation.
   * - friendly: Casual, approachable language
   * - professional: Formal, business-appropriate
   * - concise: Brief, to-the-point
   * - detailed: Comprehensive, explanatory
   */
  tone?: 'friendly' | 'professional' | 'concise' | 'detailed';
}
```

**Verification:**
- [x] `TranslationContext` interface added to file
- [x] TypeScript compiles without errors
- [x] All properties have JSDoc comments

**Dependencies:** Task 3.1.2

**Blocks:** Task 3.1.2.2

---

### Task 3.1.2.2: Add Translation Request/Response Type Definitions

**Description:** Add type definitions for single and batch translation requests and responses.

**Story Points:** 1

**File:** `/src/lib/translation-service/translation-service.types.ts` (append)

**Actions:**

1. Add `TranslationRequest` interface for single translations
2. Add `TranslationResponse` interface with metrics
3. Add `BatchTranslationRequest` for multi-language requests
4. Add `BatchTranslationResponse` with error handling

**Code to Append:**

```typescript
// ============================================================================
// Translation Request/Response Types
// ============================================================================

/**
 * Single text translation request.
 * Used for translating one piece of content to one target language.
 */
export interface TranslationRequest {
  /** Text to translate */
  text: string;

  /** Source language of the text */
  sourceLanguage: SupportedLanguage;

  /** Target language for translation */
  targetLanguage: SupportedLanguage;

  /** Optional context for better translation quality */
  context?: TranslationContext;
}

/**
 * Single text translation response.
 * Returned after successful translation.
 */
export interface TranslationResponse {
  /** Translated text */
  translatedText: string;

  /** Confidence score (0-1) if available from provider */
  confidence?: number;

  /** Provider used for this translation */
  provider: TranslationProvider;

  /** Token count used (for cost tracking) */
  tokensUsed?: number;

  /** Time taken in milliseconds */
  durationMs?: number;
}

/**
 * Batch translation request for multiple target languages.
 * Translates one piece of text to all specified languages.
 */
export interface BatchTranslationRequest {
  /** Text to translate */
  text: string;

  /** Source language of the text */
  sourceLanguage: SupportedLanguage;

  /** Array of target languages */
  targetLanguages: SupportedLanguage[];

  /** Optional context for better translation quality */
  context?: TranslationContext;
}

/**
 * Batch translation response with all language translations.
 * Contains successful translations and any errors.
 */
export interface BatchTranslationResponse {
  /** Map of language code to translated text */
  translations: Partial<Record<SupportedLanguage, string>>;

  /** Provider used for translations */
  provider: TranslationProvider;

  /** Total tokens used across all translations */
  totalTokensUsed?: number;

  /** Total time taken in milliseconds */
  totalDurationMs?: number;

  /** Any errors per language */
  errors?: Partial<Record<SupportedLanguage, string>>;
}
```

**Verification:**
- [x] All 4 interfaces added to file
- [x] TypeScript compiles without errors
- [x] `BatchTranslationResponse` uses `Partial<Record>` for optional language mapping
- [x] All properties have JSDoc comments

**Dependencies:** Task 3.1.2.1

**Blocks:** Task 3.1.2.3

---

### Task 3.1.2.3: Add Translation Job Type Definitions

**Description:** Add type definitions for background translation job processing.

**Story Points:** 1

**File:** `/src/lib/translation-service/translation-service.types.ts` (append)

**Actions:**

1. Add `TranslationJobStatus` type for job lifecycle
2. Add `TranslationJob` interface for job records
3. Add `CreateTranslationJobRequest` for job creation
4. Add `TranslationJobResult` for processing results

**Code to Append:**

```typescript
// ============================================================================
// Translation Job Types (Background Processing)
// ============================================================================

/**
 * Translation job status.
 * Tracks the lifecycle of background translation jobs.
 */
export type TranslationJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

/**
 * Translation job record for async processing.
 * Represents a job in the translation_jobs database table.
 */
export interface TranslationJob {
  /** Unique job identifier (UUID) */
  id: string;

  /** Type of entity being translated */
  entityType: TranslatableEntityType;

  /** ID of the entity to translate */
  entityId: string;

  /** Source language */
  sourceLanguage: SupportedLanguage;

  /** Target language */
  targetLanguage: SupportedLanguage;

  /** Current job status */
  status: TranslationJobStatus;

  /** Number of processing attempts */
  attempts: number;

  /** Error message if failed */
  errorMessage?: string;

  /** Job creation timestamp (ISO 8601) */
  createdAt: string;

  /** Processing start timestamp (ISO 8601) */
  startedAt?: string;

  /** Completion timestamp (ISO 8601) */
  completedAt?: string;
}

/**
 * Request to create a new translation job.
 * Used when queueing content for background translation.
 */
export interface CreateTranslationJobRequest {
  /** Type of entity to translate */
  entityType: TranslatableEntityType;

  /** ID of the entity to translate */
  entityId: string;

  /** Source language (defaults to 'en' if not specified) */
  sourceLanguage?: SupportedLanguage;

  /** Target languages to translate to */
  targetLanguages: SupportedLanguage[];

  /** Job priority level */
  priority?: 'low' | 'normal' | 'high';
}

/**
 * Job processing result.
 * Returned after a translation job completes processing.
 */
export interface TranslationJobResult {
  /** Job ID that was processed */
  jobId: string;

  /** Whether the job succeeded */
  success: boolean;

  /** Translated text (if successful) */
  translatedText?: string;

  /** Error message (if failed) */
  error?: string;

  /** Processing time in milliseconds */
  processingTimeMs?: number;
}
```

**Verification:**
- [x] All 4 types/interfaces added to file
- [x] TypeScript compiles without errors
- [x] `TranslationJob` fields match `translation_jobs` table schema from Plan-110
- [x] All timestamp fields documented as ISO 8601 format

**Dependencies:** Task 3.1.2.2

**Blocks:** Task 3.1.2.4

---

### Task 3.1.2.4: Add Provider Interface and Rate Limit Types

**Description:** Add the provider interface contract and rate limiting types.

**Story Points:** 1

**File:** `/src/lib/translation-service/translation-service.types.ts` (append)

**Actions:**

1. Add `ITranslationProvider` interface as provider contract
2. Add `RateLimitStatus` interface for rate limit tracking
3. Add `TranslationServiceConfig` for service configuration
4. Add `ProviderConfig` for provider-specific settings

**Code to Append:**

```typescript
// ============================================================================
// Provider Interface
// ============================================================================

/**
 * Rate limit status information.
 * Tracks API rate limiting state for a provider.
 */
export interface RateLimitStatus {
  /** Requests remaining in current window */
  remaining: number;

  /** Total requests allowed per window */
  limit: number;

  /** Seconds until rate limit resets */
  resetInSeconds: number;

  /** Whether currently rate limited */
  isLimited: boolean;
}

/**
 * Translation provider interface.
 * All translation providers (Claude, OpenAI) must implement this contract.
 *
 * @example
 * ```typescript
 * class ClaudeProvider implements ITranslationProvider {
 *   readonly name = 'claude';
 *   // ... implementation
 * }
 * ```
 */
export interface ITranslationProvider {
  /** Provider identifier */
  readonly name: TranslationProvider;

  /**
   * Translate a single text.
   * @param request - Translation request with text and languages
   * @returns Promise resolving to translation response
   */
  translate(request: TranslationRequest): Promise<TranslationResponse>;

  /**
   * Translate text to multiple languages.
   * @param request - Batch request with text and target languages
   * @returns Promise resolving to batch response
   */
  translateBatch(request: BatchTranslationRequest): Promise<BatchTranslationResponse>;

  /**
   * Check if provider is available/configured.
   * @returns true if API key is set and provider is ready
   */
  isAvailable(): boolean;

  /**
   * Get current rate limit status.
   * @returns Current rate limit state
   */
  getRateLimitStatus(): RateLimitStatus;
}

// ============================================================================
// Service Configuration
// ============================================================================

/**
 * Translation service configuration.
 * Used to configure the translation service wrapper.
 */
export interface TranslationServiceConfig {
  /** Primary provider to use */
  primaryProvider: TranslationProvider;

  /** Fallback provider if primary fails */
  fallbackProvider?: TranslationProvider;

  /** Maximum retry attempts per request */
  maxRetries: number;

  /** Request timeout in milliseconds */
  timeoutMs: number;

  /** Rate limit per minute */
  rateLimitPerMinute: number;

  /** Whether to enable response caching */
  enableCache: boolean;

  /** Cache TTL in seconds (if caching enabled) */
  cacheTtlSeconds?: number;
}

/**
 * Provider-specific configuration.
 * Used when initializing individual providers.
 */
export interface ProviderConfig {
  /** API key for the provider */
  apiKey: string;

  /** Model to use (e.g., 'claude-3-haiku', 'gpt-4o-mini') */
  model?: string;

  /** Maximum tokens for response */
  maxTokens?: number;

  /** Temperature for generation (0-1) */
  temperature?: number;

  /** Custom base URL (for proxies or self-hosted) */
  baseUrl?: string;
}
```

**Verification:**
- [x] `ITranslationProvider` interface includes all 4 methods
- [x] `RateLimitStatus` has all rate limit tracking fields
- [x] TypeScript compiles without errors
- [x] JSDoc examples included for `ITranslationProvider`

**Dependencies:** Task 3.1.2.3

**Blocks:** Task 3.1.2.5

---

### Task 3.1.2.5: Add Database Record Types

**Description:** Add TypeScript interfaces for database translation records that mirror the schema.

**Story Points:** 1

**File:** `/src/lib/translation-service/translation-service.types.ts` (append)

**Actions:**

1. Add `ArticleTranslationRecord` for article_translations table
2. Add `ItemTranslationRecord` for item_translations table
3. Add `LinkTranslationRecord` for link_translations table
4. Add `TagTranslationRecord` for tag_translations table
5. Add `TranslationJobRecord` for translation_jobs table

**Code to Append:**

```typescript
// ============================================================================
// Database Record Types (for ORM/query operations)
// ============================================================================

/**
 * Article translation database record.
 * Maps to article_translations table.
 */
export interface ArticleTranslationRecord {
  id: string;
  article_id: string;
  language: SupportedLanguage;
  title: string;
  description: string | null;
  translation_status: TranslationStatus;
  translated_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Item translation database record.
 * Maps to item_translations table.
 */
export interface ItemTranslationRecord {
  id: string;
  item_id: string;
  language: SupportedLanguage;
  name: string;
  description: string | null;
  translation_status: TranslationStatus;
  translated_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Link translation database record.
 * Maps to link_translations table.
 */
export interface LinkTranslationRecord {
  id: string;
  link_id: string;
  language: SupportedLanguage;
  title: string;
  translation_status: TranslationStatus;
  translated_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Tag translation database record.
 * Maps to tag_translations table.
 */
export interface TagTranslationRecord {
  id: string;
  tag_key: string;
  language: SupportedLanguage;
  translated_value: string;
  is_system_tag: boolean;
  created_at: string;
}

/**
 * Translation job database record.
 * Maps to translation_jobs table.
 */
export interface TranslationJobRecord {
  id: string;
  entity_type: TranslatableEntityType;
  entity_id: string;
  source_language: SupportedLanguage;
  target_language: SupportedLanguage;
  status: TranslationJobStatus;
  attempts: number;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}
```

**Verification:**
- [x] All 5 record interfaces added
- [x] TypeScript compiles without errors
- [x] Record types match database schema from Plan-110-L10N-Epic1-Foundation.md
- [x] Nullable fields use `| null` type

**Dependencies:** Task 3.1.2.4

**Blocks:** Task 3.1.2.6

---

### Task 3.1.2.6: Add Utility Types and Constants

**Description:** Add utility types, helper functions, and language constants.

**Story Points:** 1

**File:** `/src/lib/translation-service/translation-service.types.ts` (append)

**Actions:**

1. Add `TranslationResult<T>` discriminated union for Result pattern
2. Add `LanguageInfo` interface for language metadata
3. Add `SUPPORTED_LANGUAGES` constant array with metadata
4. Add `DEFAULT_LANGUAGE` constant
5. Add `isSupportedLanguage()` type guard function

**Code to Append:**

```typescript
// ============================================================================
// Utility Types
// ============================================================================

/**
 * Result type for operations that can fail.
 * Implements the Result pattern for explicit error handling.
 *
 * @example
 * ```typescript
 * const result: TranslationResult<string> = await translateText(request);
 * if (result.success) {
 *   console.log(result.data); // string
 * } else {
 *   console.error(result.error); // string
 * }
 * ```
 */
export type TranslationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

/**
 * Supported languages metadata.
 * Used for UI display and language selection.
 */
export interface LanguageInfo {
  /** ISO 639-1 language code */
  code: SupportedLanguage;

  /** English name of the language */
  name: string;

  /** Native name of the language */
  nativeName: string;

  /** Flag emoji (optional) */
  flag?: string;

  /** Whether language is right-to-left */
  rtl: boolean;
}

/**
 * All supported languages with metadata.
 * Use this for populating language selectors and displays.
 */
export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', rtl: false },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', rtl: false },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', rtl: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', rtl: false },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', rtl: false },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', rtl: false },
];

/**
 * Default supported language.
 * Used as fallback when no language preference is set.
 */
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

/**
 * Type guard to check if a string is a supported language code.
 *
 * @param code - String to check
 * @returns true if code is a valid SupportedLanguage
 *
 * @example
 * ```typescript
 * const lang = getUserLanguage(); // string
 * if (isSupportedLanguage(lang)) {
 *   // lang is now typed as SupportedLanguage
 *   setUserLanguage(lang);
 * }
 * ```
 */
export function isSupportedLanguage(code: string): code is SupportedLanguage {
  return ['en', 'fr', 'es', 'de', 'nl', 'it'].includes(code);
}

/**
 * Get language info by code.
 *
 * @param code - Language code to look up
 * @returns LanguageInfo if found, undefined otherwise
 */
export function getLanguageInfo(code: string): LanguageInfo | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
}

/**
 * Get all language codes except the specified one.
 * Useful for batch translation to all other languages.
 *
 * @param excludeCode - Language code to exclude
 * @returns Array of language codes
 */
export function getOtherLanguages(excludeCode: SupportedLanguage): SupportedLanguage[] {
  return SUPPORTED_LANGUAGES
    .map(lang => lang.code)
    .filter(code => code !== excludeCode);
}
```

**Verification:**
- [x] All utility types and functions added
- [x] TypeScript compiles without errors
- [x] `isSupportedLanguage` is a proper type guard
- [x] `SUPPORTED_LANGUAGES` has exactly 6 entries
- [x] Helper functions `getLanguageInfo` and `getOtherLanguages` work correctly

**Dependencies:** Task 3.1.2.5

**Blocks:** Task 3.1.3

---

### Task 3.1.3: Create Barrel Export File

**Description:** Create the index.ts barrel file for clean module exports.

**Story Points:** 0.5

**File:** `/src/lib/translation-service/index.ts`

**Actions:**

1. Create the index.ts file with module documentation
2. Export all types from the types file
3. Add commented placeholders for future exports

**Code to Implement:**

```typescript
/**
 * Translation Service Module
 * Part of REQ-235: Translation Service Module Infrastructure
 *
 * This module provides translation capabilities for dynamic content
 * across the FAQBNB application, including AI-powered translations
 * via Claude and OpenAI providers.
 *
 * @module translation-service
 * @created 2026-01-18
 *
 * @example
 * ```typescript
 * import {
 *   SupportedLanguage,
 *   TranslationRequest,
 *   SUPPORTED_LANGUAGES,
 *   isSupportedLanguage,
 * } from '@/lib/translation-service';
 * ```
 */

// Export all types
export * from './translation-service.types';

// ============================================================================
// Future exports (to be implemented in subsequent tasks)
// ============================================================================

// Task 3.6: Main translation service wrapper
// export { translateText, translateToAllLanguages } from './translation-service';

// Task 3.2: Claude translation provider
// export { ClaudeTranslationProvider } from './providers/claude-provider';

// Task 3.3: OpenAI translation provider
// export { OpenAITranslationProvider } from './providers/openai-provider';

// Task 3.4: Rate limiter utility
// export { createRateLimiter, RateLimiter } from './utils/rate-limiter';

// Task 3.5: Retry utility
// export { withRetry, RetryOptions } from './utils/retry';
```

**Verification:**
- [x] File exists at `/src/lib/translation-service/index.ts`
- [x] Can import types: `import { SupportedLanguage } from '@/lib/translation-service'`
- [x] TypeScript compiles without errors
- [x] Future exports are commented with task references

**Dependencies:** Task 3.1.2.6

**Blocks:** Tasks 3.1.4, 3.1.5

---

### Task 3.1.4: Create Provider Stub Files

**Description:** Create placeholder files for Claude and OpenAI provider implementations.

**Story Points:** 0.5

**Files:**
- `/src/lib/translation-service/providers/claude-provider.ts`
- `/src/lib/translation-service/providers/openai-provider.ts`

**Actions:**

1. Create Claude provider stub with documentation and TODO
2. Create OpenAI provider stub with documentation and TODO

**Code for `/src/lib/translation-service/providers/claude-provider.ts`:**

```typescript
/**
 * Claude Translation Provider
 * Part of REQ-235: Translation Service Module Infrastructure
 *
 * This module will implement the Anthropic Claude API for AI-powered
 * text translation with domain-specific context support.
 *
 * @module translation-service/providers/claude
 * @created 2026-01-18
 * @implementation Task 3.2 - Implement Claude translation provider
 */

import type {
  ITranslationProvider,
  TranslationRequest,
  TranslationResponse,
  BatchTranslationRequest,
  BatchTranslationResponse,
  RateLimitStatus,
  ProviderConfig,
} from '../translation-service.types';

// TODO: Implement in Task 3.2
//
// This file will contain the Anthropic Claude translation provider implementation:
//
// 1. ClaudeTranslationProvider class implementing ITranslationProvider
// 2. API authentication handling
// 3. Rate limiting integration
// 4. Domain context prompt construction
// 5. Error handling and retries
//
// Reference: https://docs.anthropic.com/claude/reference/messages_post

/**
 * Claude provider configuration type.
 * Extends ProviderConfig with Claude-specific options.
 */
export interface ClaudeProviderConfig extends ProviderConfig {
  /** Claude model to use (default: 'claude-3-haiku-20240307') */
  model?: string;
}

// Placeholder export to prevent TypeScript errors
export const CLAUDE_PROVIDER_PLACEHOLDER = 'Implementation pending Task 3.2';
```

**Code for `/src/lib/translation-service/providers/openai-provider.ts`:**

```typescript
/**
 * OpenAI Translation Provider
 * Part of REQ-235: Translation Service Module Infrastructure
 *
 * This module will implement the OpenAI API as a fallback translation
 * provider when Claude is unavailable or rate limited.
 *
 * @module translation-service/providers/openai
 * @created 2026-01-18
 * @implementation Task 3.3 - Implement OpenAI translation provider (fallback)
 */

import type {
  ITranslationProvider,
  TranslationRequest,
  TranslationResponse,
  BatchTranslationRequest,
  BatchTranslationResponse,
  RateLimitStatus,
  ProviderConfig,
} from '../translation-service.types';

// TODO: Implement in Task 3.3
//
// This file will contain the OpenAI translation provider implementation:
//
// 1. OpenAITranslationProvider class implementing ITranslationProvider
// 2. Mirror Claude provider interface for seamless fallback
// 3. API authentication handling
// 4. Rate limiting integration
// 5. Domain context prompt construction
//
// Reference: https://platform.openai.com/docs/api-reference

/**
 * OpenAI provider configuration type.
 * Extends ProviderConfig with OpenAI-specific options.
 */
export interface OpenAIProviderConfig extends ProviderConfig {
  /** OpenAI model to use (default: 'gpt-4o-mini') */
  model?: string;
}

// Placeholder export to prevent TypeScript errors
export const OPENAI_PROVIDER_PLACEHOLDER = 'Implementation pending Task 3.3';
```

**Verification:**
- [x] Both provider stub files exist
- [x] TypeScript compiles without errors
- [x] Type imports work correctly from parent module
- [x] TODO comments reference the correct task numbers

**Dependencies:** Task 3.1.3

**Blocks:** Tasks 3.2, 3.3

---

### Task 3.1.5: Create Utility Stub Files

**Description:** Create placeholder files for rate limiter and retry utilities.

**Story Points:** 0.5

**Files:**
- `/src/lib/translation-service/utils/rate-limiter.ts`
- `/src/lib/translation-service/utils/retry.ts`

**Actions:**

1. Create rate limiter stub with documentation and TODO
2. Create retry logic stub with documentation and TODO

**Code for `/src/lib/translation-service/utils/rate-limiter.ts`:**

```typescript
/**
 * Translation API Rate Limiter
 * Part of REQ-235: Translation Service Module Infrastructure
 *
 * This module will implement rate limiting for translation API calls
 * to prevent hitting provider limits and manage costs.
 *
 * @module translation-service/utils/rate-limiter
 * @created 2026-01-18
 * @implementation Task 3.4 - Create rate limiter utility
 */

import type { RateLimitStatus } from '../translation-service.types';

// TODO: Implement in Task 3.4
//
// This file will contain rate limiting logic:
//
// 1. Token bucket or sliding window algorithm
// 2. Per-provider rate limit configuration
// 3. getRateLimitStatus() for current state
// 4. waitForCapacity() for blocking until available
// 5. Integration with provider implementations
//
// Configurable via TRANSLATION_RATE_LIMIT_PER_MINUTE env var

/**
 * Rate limiter configuration options.
 */
export interface RateLimiterConfig {
  /** Maximum requests per time window */
  maxRequests: number;

  /** Time window in milliseconds */
  windowMs: number;

  /** Optional identifier for this limiter */
  name?: string;
}

/**
 * Rate limiter interface.
 */
export interface IRateLimiter {
  /** Check if a request can proceed */
  canProceed(): boolean;

  /** Record a request */
  recordRequest(): void;

  /** Get current status */
  getStatus(): RateLimitStatus;

  /** Wait until capacity is available */
  waitForCapacity(): Promise<void>;
}

// Placeholder export to prevent TypeScript errors
export const RATE_LIMITER_PLACEHOLDER = 'Implementation pending Task 3.4';
```

**Code for `/src/lib/translation-service/utils/retry.ts`:**

```typescript
/**
 * Retry Logic with Exponential Backoff
 * Part of REQ-235: Translation Service Module Infrastructure
 *
 * This module will implement retry logic with exponential backoff
 * and jitter for resilient API calls.
 *
 * @module translation-service/utils/retry
 * @created 2026-01-18
 * @implementation Task 3.5 - Create retry logic with exponential backoff
 */

// TODO: Implement in Task 3.5
//
// This file will contain retry logic:
//
// 1. withRetry<T>() wrapper function
// 2. Exponential backoff calculation
// 3. Jitter to prevent thundering herd
// 4. Configurable max retries (default: 3)
// 5. Configurable base delay (default: 1000ms)
// 6. Error classification (retryable vs non-retryable)
//
// Configurable via TRANSLATION_MAX_RETRIES env var

/**
 * Retry configuration options.
 */
export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxRetries: number;

  /** Base delay in milliseconds */
  baseDelayMs: number;

  /** Maximum delay in milliseconds */
  maxDelayMs: number;

  /** Multiplier for exponential backoff */
  backoffMultiplier: number;

  /** Whether to add jitter to delays */
  useJitter: boolean;

  /** Function to determine if error is retryable */
  isRetryable?: (error: Error) => boolean;

  /** Callback on each retry attempt */
  onRetry?: (attempt: number, error: Error, delay: number) => void;
}

/**
 * Default retry options.
 */
export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  useJitter: true,
};

// Placeholder export to prevent TypeScript errors
export const RETRY_PLACEHOLDER = 'Implementation pending Task 3.5';
```

**Verification:**
- [x] Both utility stub files exist
- [x] TypeScript compiles without errors
- [x] Type imports work correctly from parent module
- [x] TODO comments reference the correct task numbers
- [x] Default options defined for easy implementation

**Dependencies:** Task 3.1.3

**Blocks:** Tasks 3.4, 3.5

---

### Task 3.1.6: Create Unit Test File for Types

**Description:** Create a basic test file to verify type exports work correctly.

**Story Points:** 0.5

**File:** `/src/lib/translation-service/__tests__/types.test.ts`

**Actions:**

1. Create the __tests__ directory
2. Create test file with type verification tests
3. Test helper functions work correctly

**Code to Implement:**

```typescript
/**
 * Translation Service Types Tests
 * Part of REQ-235: Translation Service Module Infrastructure
 *
 * @created 2026-01-18
 */

import {
  SupportedLanguage,
  TranslationStatus,
  TranslationProvider,
  TranslatableEntityType,
  TranslationRequest,
  TranslationResponse,
  BatchTranslationRequest,
  BatchTranslationResponse,
  TranslationJob,
  ITranslationProvider,
  TranslationServiceConfig,
  TranslationResult,
  LanguageInfo,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  isSupportedLanguage,
  getLanguageInfo,
  getOtherLanguages,
} from '../index';

describe('Translation Service Types', () => {
  describe('SupportedLanguage', () => {
    it('should accept valid language codes', () => {
      const languages: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];
      expect(languages.length).toBe(6);
    });
  });

  describe('isSupportedLanguage', () => {
    it('should return true for valid language codes', () => {
      expect(isSupportedLanguage('en')).toBe(true);
      expect(isSupportedLanguage('fr')).toBe(true);
      expect(isSupportedLanguage('es')).toBe(true);
      expect(isSupportedLanguage('de')).toBe(true);
      expect(isSupportedLanguage('nl')).toBe(true);
      expect(isSupportedLanguage('it')).toBe(true);
    });

    it('should return false for invalid language codes', () => {
      expect(isSupportedLanguage('invalid')).toBe(false);
      expect(isSupportedLanguage('EN')).toBe(false); // Case sensitive
      expect(isSupportedLanguage('')).toBe(false);
      expect(isSupportedLanguage('english')).toBe(false);
    });

    it('should narrow type correctly', () => {
      const code = 'en' as string;
      if (isSupportedLanguage(code)) {
        // TypeScript should accept this
        const lang: SupportedLanguage = code;
        expect(lang).toBe('en');
      }
    });
  });

  describe('SUPPORTED_LANGUAGES', () => {
    it('should have all 6 supported languages', () => {
      expect(SUPPORTED_LANGUAGES.length).toBe(6);
    });

    it('should have correct language codes', () => {
      const codes = SUPPORTED_LANGUAGES.map(l => l.code);
      expect(codes).toEqual(['en', 'fr', 'es', 'de', 'nl', 'it']);
    });

    it('should have native names for each language', () => {
      const nativeNames = SUPPORTED_LANGUAGES.map(l => l.nativeName);
      expect(nativeNames).toContain('English');
      expect(nativeNames).toContain('Français');
      expect(nativeNames).toContain('Español');
      expect(nativeNames).toContain('Deutsch');
      expect(nativeNames).toContain('Nederlands');
      expect(nativeNames).toContain('Italiano');
    });

    it('should have no RTL languages', () => {
      const hasRtl = SUPPORTED_LANGUAGES.some(l => l.rtl);
      expect(hasRtl).toBe(false);
    });
  });

  describe('DEFAULT_LANGUAGE', () => {
    it('should be English', () => {
      expect(DEFAULT_LANGUAGE).toBe('en');
    });
  });

  describe('getLanguageInfo', () => {
    it('should return language info for valid codes', () => {
      const info = getLanguageInfo('fr');
      expect(info).toBeDefined();
      expect(info?.name).toBe('French');
      expect(info?.nativeName).toBe('Français');
    });

    it('should return undefined for invalid codes', () => {
      const info = getLanguageInfo('invalid');
      expect(info).toBeUndefined();
    });
  });

  describe('getOtherLanguages', () => {
    it('should return all languages except the specified one', () => {
      const others = getOtherLanguages('en');
      expect(others.length).toBe(5);
      expect(others).not.toContain('en');
      expect(others).toContain('fr');
      expect(others).toContain('es');
    });
  });

  describe('TranslationRequest', () => {
    it('should accept valid request structure', () => {
      const request: TranslationRequest = {
        text: 'Hello world',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
        context: {
          contentType: 'item_name',
          domainContext: 'vacation rental property',
        },
      };
      expect(request.text).toBe('Hello world');
    });
  });

  describe('TranslationResponse', () => {
    it('should accept valid response structure', () => {
      const response: TranslationResponse = {
        translatedText: 'Bonjour le monde',
        provider: 'claude',
        tokensUsed: 50,
        durationMs: 234,
      };
      expect(response.translatedText).toBe('Bonjour le monde');
    });
  });

  describe('TranslationResult', () => {
    it('should handle success case', () => {
      const result: TranslationResult<string> = {
        success: true,
        data: 'translated text',
      };
      if (result.success) {
        expect(result.data).toBe('translated text');
      }
    });

    it('should handle failure case', () => {
      const result: TranslationResult<string> = {
        success: false,
        error: 'Translation failed',
        code: 'RATE_LIMIT',
      };
      if (!result.success) {
        expect(result.error).toBe('Translation failed');
        expect(result.code).toBe('RATE_LIMIT');
      }
    });
  });
});
```

**Verification:**
- [x] Test file created at `/src/lib/translation-service/__tests__/types.test.ts`
- [x] Tests pass: `npm test -- translation-service`
- [x] All type imports work correctly
- [x] Type guard tests verify narrowing

**Dependencies:** Task 3.1.3

**Blocks:** None (final task)

---

## Implementation Checklist

| Task | Description | Story Points | Status |
|------|-------------|--------------|--------|
| 3.1.1 | Create directory structure | 0.5 | ✅ Complete |
| 3.1.2 | Create core language type definitions | 1 | ✅ Complete |
| 3.1.2.1 | Add translation context types | 0.5 | ✅ Complete |
| 3.1.2.2 | Add request/response types | 1 | ✅ Complete |
| 3.1.2.3 | Add translation job types | 1 | ✅ Complete |
| 3.1.2.4 | Add provider interface and config types | 1 | ✅ Complete |
| 3.1.2.5 | Add database record types | 1 | ✅ Complete |
| 3.1.2.6 | Add utility types and constants | 1 | ✅ Complete |
| 3.1.3 | Create barrel export file | 0.5 | ✅ Complete |
| 3.1.4 | Create provider stub files | 0.5 | ✅ Complete |
| 3.1.5 | Create utility stub files | 0.5 | ✅ Complete |
| 3.1.6 | Create unit test file | 0.5 | ✅ Complete |

**Total Story Points:** 9

---

## Acceptance Criteria Verification

| Criteria from REQ-235 | Task(s) | Verification Method |
|-----------------------|---------|---------------------|
| Translation service directory exists with clear structure | 3.1.1 | `ls -la /src/lib/translation-service/` shows expected structure |
| Type definition files describe all translation data structures | 3.1.2-3.1.2.6 | TypeScript compiles, all interfaces present |
| TypeScript interfaces define contracts for service operations | 3.1.2.4 | `ITranslationProvider` interface defined with all methods |
| Module structure supports future expansion | 3.1.3-3.1.5 | Barrel exports, stub files with clear extension points |
| Type definitions align with database schema | 3.1.2.5 | Record types match Plan-110 schema |

---

## Dependencies and Blocking Relationships

```
Task 3.1.1 (directories)
    │
    └── Task 3.1.2 (core types) ──► Task 3.1.2.1 (context) ──► Task 3.1.2.2 (req/res)
                                                                      │
                                                                      ▼
                                                              Task 3.1.2.3 (jobs)
                                                                      │
                                                                      ▼
                                                              Task 3.1.2.4 (provider)
                                                                      │
                                                                      ▼
                                                              Task 3.1.2.5 (records)
                                                                      │
                                                                      ▼
                                                              Task 3.1.2.6 (utils)
                                                                      │
                                                                      ▼
                                                              Task 3.1.3 (barrel)
                                                                      │
                                              ┌───────────────────────┼───────────────────────┐
                                              ▼                       ▼                       ▼
                                      Task 3.1.4              Task 3.1.5              Task 3.1.6
                                   (provider stubs)        (utility stubs)            (tests)
```

---

## Files Created by This Task

| File Path | Size Est. | Purpose |
|-----------|-----------|---------|
| `/src/lib/translation-service/index.ts` | ~1 KB | Module barrel exports |
| `/src/lib/translation-service/translation-service.types.ts` | ~12 KB | All type definitions |
| `/src/lib/translation-service/providers/claude-provider.ts` | ~1 KB | Claude provider stub |
| `/src/lib/translation-service/providers/openai-provider.ts` | ~1 KB | OpenAI provider stub |
| `/src/lib/translation-service/utils/rate-limiter.ts` | ~1 KB | Rate limiter stub |
| `/src/lib/translation-service/utils/retry.ts` | ~1 KB | Retry logic stub |
| `/src/lib/translation-service/__tests__/types.test.ts` | ~3 KB | Type verification tests |

**Total New Files:** 7
**Estimated Total Size:** ~20 KB

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Type definitions need revision after provider implementation | Medium | Low | Design based on both provider APIs; iterate as needed |
| Missing edge case types | Low | Low | Add types incrementally during implementation |
| Breaking changes to types | Low | Medium | Use explicit version comments; update all consumers together |

---

## Notes

- Type definitions are based on the integration contract in Plan-110-L10N-Epic1-Foundation.md
- Database record types must match the migration schema from Phase 1
- The `ITranslationProvider` interface establishes a contract for both Claude and OpenAI
- `SUPPORTED_LANGUAGES` constant is used by UI components in Phase 5
- All stub files include clear TODO comments referencing their implementation tasks

---

*Document generated for FAQBNB L10N Epic 1 - Foundation, Phase 3, Task 3.1*
*Detailed breakdown follows senior developer task specification pattern*
