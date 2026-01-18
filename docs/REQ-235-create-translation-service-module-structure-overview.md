# REQ-235: Create Translation Service Module Structure - Implementation Overview

**Document Created:** 2026-01-18 20:30 UTC
**Last Modified:** 2026-01-18 20:30 UTC
**Request Reference:** REQ-235 (Translation Service Module Infrastructure)
**Implementation Plan Reference:** Plan-110-L10N-Epic1-Foundation.md
**Phase:** 3 - Translation Service
**Task ID:** 3.1

---

## Summary

Create the translation service module directory structure and all type definition files that will support dynamic content translation across the FAQBNB application. This task establishes the foundational infrastructure for AI-powered translation services (Claude/OpenAI) that will translate user-generated content such as property descriptions, item names, and guide instructions.

---

## Technical Context

### Existing Patterns in Codebase

| Pattern | Location | Relevance |
|---------|----------|-----------|
| Service Module Pattern | `/src/lib/email-service.ts` | Interface + Implementation + Factory pattern |
| Type Definitions | `/src/types/index.ts` | Centralized type exports with barrel file |
| Database Types | `/src/lib/supabase.ts` | Database table type definitions |
| Utility Module Pattern | `/src/lib/analytics.ts` | Types + Implementation in same file |

### Target Architecture

Based on the implementation plan, the translation service module follows this structure:

```
/src/lib/translation-service/
├── index.ts                         # Translation service exports (barrel file)
├── translation-service.ts           # Main AI translation wrapper (Task 3.6)
├── translation-service.types.ts     # TypeScript interfaces (THIS TASK)
├── providers/
│   ├── claude-provider.ts           # Anthropic Claude implementation (Task 3.2)
│   └── openai-provider.ts           # OpenAI implementation/fallback (Task 3.3)
└── utils/
    ├── rate-limiter.ts              # API rate limiting (Task 3.4)
    └── retry.ts                     # Exponential backoff retry logic (Task 3.5)
```

---

## Implementation Tasks

### Task 3.1.1: Create Directory Structure

Create the translation service module directory and subdirectories.

**Actions:**
1. Create `/src/lib/translation-service/` directory
2. Create `/src/lib/translation-service/providers/` subdirectory
3. Create `/src/lib/translation-service/utils/` subdirectory

### Task 3.1.2: Create Type Definition File

Create comprehensive TypeScript interfaces for the translation service.

**File:** `/src/lib/translation-service/translation-service.types.ts`

**Type Definitions to Include:**

```typescript
/**
 * Translation Service Type Definitions
 * Part of REQ-235: Translation Service Module Infrastructure
 *
 * @module translation-service/types
 */

// ============================================================================
// Core Language Types
// ============================================================================

/**
 * Supported language codes following ISO 639-1 standard
 */
export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

/**
 * Translation status tracking for database records
 */
export type TranslationStatus =
  | 'pending'     // Awaiting translation
  | 'processing'  // Currently being translated
  | 'completed'   // Successfully translated
  | 'failed'      // Translation failed
  | 'manual';     // Manually provided translation

/**
 * Available AI translation providers
 */
export type TranslationProvider = 'claude' | 'openai';

/**
 * Entity types that can be translated
 */
export type TranslatableEntityType = 'article' | 'item' | 'link' | 'tag';

// ============================================================================
// Translation Request/Response Types
// ============================================================================

/**
 * Context information to improve translation quality
 */
export interface TranslationContext {
  /** Type of content being translated */
  contentType:
    | 'item_name'
    | 'item_description'
    | 'article_title'
    | 'article_description'
    | 'link_title'
    | 'tag';
  /** Domain context for better translations (e.g., "property rental, appliance instructions") */
  domainContext?: string;
  /** Maximum character length for the translated text */
  maxLength?: number;
  /** Tone/style guidance (e.g., "friendly", "professional", "concise") */
  tone?: 'friendly' | 'professional' | 'concise' | 'detailed';
}

/**
 * Single text translation request
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
 * Single text translation response
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
 * Batch translation request for multiple target languages
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
 * Batch translation response with all language translations
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

// ============================================================================
// Translation Job Types (Background Processing)
// ============================================================================

/**
 * Translation job status
 */
export type TranslationJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

/**
 * Translation job record for async processing
 */
export interface TranslationJob {
  /** Unique job identifier */
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
  /** Job creation timestamp */
  createdAt: string;
  /** Processing start timestamp */
  startedAt?: string;
  /** Completion timestamp */
  completedAt?: string;
}

/**
 * Request to create a new translation job
 */
export interface CreateTranslationJobRequest {
  entityType: TranslatableEntityType;
  entityId: string;
  sourceLanguage?: SupportedLanguage;
  targetLanguages: SupportedLanguage[];
  priority?: 'low' | 'normal' | 'high';
}

/**
 * Job processing result
 */
export interface TranslationJobResult {
  jobId: string;
  success: boolean;
  translatedText?: string;
  error?: string;
  processingTimeMs?: number;
}

// ============================================================================
// Provider Interface
// ============================================================================

/**
 * Translation provider interface - all providers must implement this
 */
export interface ITranslationProvider {
  /** Provider identifier */
  readonly name: TranslationProvider;

  /** Translate a single text */
  translate(request: TranslationRequest): Promise<TranslationResponse>;

  /** Translate text to multiple languages */
  translateBatch(request: BatchTranslationRequest): Promise<BatchTranslationResponse>;

  /** Check if provider is available/configured */
  isAvailable(): boolean;

  /** Get current rate limit status */
  getRateLimitStatus(): RateLimitStatus;
}

/**
 * Rate limit status information
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

// ============================================================================
// Service Configuration
// ============================================================================

/**
 * Translation service configuration
 */
export interface TranslationServiceConfig {
  /** Primary provider to use */
  primaryProvider: TranslationProvider;
  /** Fallback provider if primary fails */
  fallbackProvider?: TranslationProvider;
  /** Maximum retry attempts */
  maxRetries: number;
  /** Request timeout in milliseconds */
  timeoutMs: number;
  /** Rate limit per minute */
  rateLimitPerMinute: number;
  /** Whether to enable caching */
  enableCache: boolean;
  /** Cache TTL in seconds */
  cacheTtlSeconds?: number;
}

/**
 * Provider-specific configuration
 */
export interface ProviderConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  baseUrl?: string;
}

// ============================================================================
// Database Record Types (for ORM/query operations)
// ============================================================================

/**
 * Article translation database record
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
 * Item translation database record
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
 * Link translation database record
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
 * Tag translation database record
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
 * Translation job database record
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

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Result type for operations that can fail
 */
export type TranslationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

/**
 * Supported languages metadata
 */
export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag?: string;
  rtl: boolean;
}

/**
 * All supported languages with metadata
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
 * Default supported language
 */
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

/**
 * Helper to check if a string is a supported language
 */
export function isSupportedLanguage(code: string): code is SupportedLanguage {
  return ['en', 'fr', 'es', 'de', 'nl', 'it'].includes(code);
}
```

### Task 3.1.3: Create Barrel Export File

Create the index.ts file for clean module exports.

**File:** `/src/lib/translation-service/index.ts`

**Content:**

```typescript
/**
 * Translation Service Module
 * Part of REQ-235: Translation Service Module Infrastructure
 *
 * @module translation-service
 */

// Export all types
export * from './translation-service.types';

// Future exports (to be implemented in subsequent tasks):
// export { translateText, translateToAllLanguages } from './translation-service';
// export { ClaudeTranslationProvider } from './providers/claude-provider';
// export { OpenAITranslationProvider } from './providers/openai-provider';
// export { createRateLimiter } from './utils/rate-limiter';
// export { withRetry } from './utils/retry';
```

### Task 3.1.4: Create Provider Type Stubs

Create placeholder files for future provider implementations.

**File:** `/src/lib/translation-service/providers/claude-provider.ts`

```typescript
/**
 * Claude Translation Provider
 * Part of REQ-235: Translation Service Module Infrastructure
 * Implementation: Task 3.2
 *
 * @module translation-service/providers/claude
 */

// TODO: Implement in Task 3.2
// This file will contain the Anthropic Claude translation provider implementation
```

**File:** `/src/lib/translation-service/providers/openai-provider.ts`

```typescript
/**
 * OpenAI Translation Provider
 * Part of REQ-235: Translation Service Module Infrastructure
 * Implementation: Task 3.3
 *
 * @module translation-service/providers/openai
 */

// TODO: Implement in Task 3.3
// This file will contain the OpenAI translation provider implementation
```

### Task 3.1.5: Create Utility Type Stubs

Create placeholder files for utility implementations.

**File:** `/src/lib/translation-service/utils/rate-limiter.ts`

```typescript
/**
 * Translation API Rate Limiter
 * Part of REQ-235: Translation Service Module Infrastructure
 * Implementation: Task 3.4
 *
 * @module translation-service/utils/rate-limiter
 */

// TODO: Implement in Task 3.4
// This file will contain rate limiting logic for translation API calls
```

**File:** `/src/lib/translation-service/utils/retry.ts`

```typescript
/**
 * Retry Logic with Exponential Backoff
 * Part of REQ-235: Translation Service Module Infrastructure
 * Implementation: Task 3.5
 *
 * @module translation-service/utils/retry
 */

// TODO: Implement in Task 3.5
// This file will contain retry logic with exponential backoff for API calls
```

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/translation-service/index.ts` | Module barrel exports |
| `/src/lib/translation-service/translation-service.types.ts` | TypeScript type definitions |
| `/src/lib/translation-service/providers/claude-provider.ts` | Claude provider stub |
| `/src/lib/translation-service/providers/openai-provider.ts` | OpenAI provider stub |
| `/src/lib/translation-service/utils/rate-limiter.ts` | Rate limiter stub |
| `/src/lib/translation-service/utils/retry.ts` | Retry logic stub |

### Directories to Create

| Directory Path | Purpose |
|----------------|---------|
| `/src/lib/translation-service/` | Translation service module root |
| `/src/lib/translation-service/providers/` | AI provider implementations |
| `/src/lib/translation-service/utils/` | Utility functions |

### No Existing Files Modified

This task creates new infrastructure without modifying existing files.

---

## Implementation Order

1. **Create directories** (Task 3.1.1)
2. **Create type definitions** (Task 3.1.2) - Main deliverable
3. **Create barrel export** (Task 3.1.3)
4. **Create provider stubs** (Task 3.1.4) - Placeholder for Tasks 3.2, 3.3
5. **Create utility stubs** (Task 3.1.5) - Placeholder for Tasks 3.4, 3.5

---

## Acceptance Criteria Verification

| Criteria | How Verified |
|----------|--------------|
| Translation service directory exists with clear structure | Directory `/src/lib/translation-service/` exists with subdirectories |
| Type definition files describe all translation data structures | `translation-service.types.ts` contains all interfaces |
| TypeScript interfaces define contracts for service operations | `ITranslationProvider`, `TranslationRequest`, `TranslationResponse` defined |
| Module structure supports future expansion | Barrel exports, stub files for providers/utils |
| Type definitions align with database schema | Database record types match planned migration schema |

---

## Dependencies

### Depends On (Completed First)
- None (this is foundational infrastructure)

### Blocks (Requires This First)
- Task 3.2: Implement Claude translation provider
- Task 3.3: Implement OpenAI translation provider
- Task 3.4: Create rate limiter utility
- Task 3.5: Create retry logic
- Task 3.6: Create main translation service wrapper

---

## Testing Strategy

1. **TypeScript Compilation**: Verify all types compile without errors
2. **Import Verification**: Verify exports work from barrel file
3. **Type Usage**: Create a simple test that imports and uses the types

```typescript
// Test file: /src/lib/translation-service/__tests__/types.test.ts
import {
  SupportedLanguage,
  TranslationRequest,
  TranslationResponse,
  isSupportedLanguage,
  SUPPORTED_LANGUAGES,
} from '../index';

describe('Translation Service Types', () => {
  it('should export language types', () => {
    const lang: SupportedLanguage = 'en';
    expect(isSupportedLanguage(lang)).toBe(true);
    expect(isSupportedLanguage('invalid')).toBe(false);
  });

  it('should have all supported languages defined', () => {
    expect(SUPPORTED_LANGUAGES.length).toBe(6);
    expect(SUPPORTED_LANGUAGES.map(l => l.code)).toEqual(['en', 'fr', 'es', 'de', 'nl', 'it']);
  });
});
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Type definitions may need revision after provider implementation | Medium | Low | Design interfaces based on both provider APIs; iterate as needed |
| Missing edge case types | Low | Low | Add types incrementally as discovered during subsequent tasks |

---

## Estimated Effort

**Complexity:** Low
**Estimated Time:** 1-2 hours

---

## Notes

- Type definitions are based on the integration contract specified in Plan-110-L10N-Epic1-Foundation.md
- Database record types align with the planned migration schema in Phase 1
- The `ITranslationProvider` interface establishes a contract for both Claude and OpenAI implementations
- `SUPPORTED_LANGUAGES` constant provides runtime language metadata for UI components

---

*Document generated for FAQBNB L10N Epic 1 - Foundation, Phase 3, Task 3.1*
