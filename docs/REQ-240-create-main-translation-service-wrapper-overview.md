# REQ-240: Create Main Translation Service Wrapper - Implementation Overview

**Document Created:** 2026-01-18 12:00 UTC
**Last Modified:** 2026-01-18 12:00 UTC
**Request Reference:** REQ-240 (Unified Translation Service Interface)
**Implementation Plan Reference:** Plan-110-L10N-Epic1-Foundation.md
**Phase:** 3 - Translation Service
**Task ID:** 3.6

---

## Summary

Create the main translation service wrapper that provides a unified interface for text translations across the FAQBNB application. This service abstracts the underlying translation providers (Claude and OpenAI), handles provider selection based on environment configuration, implements automatic fallback when the primary provider fails, and supports both single-language and batch multi-language translation operations. The wrapper integrates the rate limiter and retry utilities to ensure reliable translation delivery.

---

## Technical Context

### Existing Patterns in Codebase

| Pattern | Location | Relevance |
|---------|----------|-----------|
| Service Provider Pattern | `/src/lib/email-service.ts:23-244` | Interface + Implementation + Factory pattern with mock/production variants |
| Error Handling | `/src/lib/error-utils.ts:13-129` | User-friendly error translation and classification |
| Configuration Pattern | `/src/lib/config.ts` | Environment variable handling with fallbacks |
| API Pattern | `/src/lib/api.ts:119-168` | Error handling and status code mapping |
| Utility Module Pattern | `/src/lib/utils.ts` | Pure utility functions with clear documentation |
| Database Types | `/src/lib/supabase.ts` | TypeScript type definitions for database entities |

### Dependencies

#### Prerequisites (Must Exist First)

| Task | File | Purpose |
|------|------|---------|
| REQ-235 (Task 3.1) | `/src/lib/translation-service/translation-service.types.ts` | Type definitions for `ITranslationProvider`, `TranslationRequest`, `TranslationResponse`, etc. |
| REQ-236 (Task 3.2) | `/src/lib/translation-service/providers/claude-provider.ts` | Claude (Anthropic) translation provider |
| REQ-237 (Task 3.3) | `/src/lib/translation-service/providers/openai-provider.ts` | OpenAI translation provider (fallback) |
| REQ-238 (Task 3.4) | `/src/lib/translation-service/utils/rate-limiter.ts` | Rate limiting utility |
| REQ-239 (Task 3.5) | `/src/lib/translation-service/utils/retry.ts` | Retry logic with exponential backoff |

#### No New External Dependencies Required

The translation service wrapper uses existing internal dependencies only.

### Target File Location

**File:** `/src/lib/translation-service/translation-service.ts`

This file will be the main entry point for all translation operations in the application.

---

## Implementation Tasks

### Task 3.6.1: Define Service Configuration Types

Add configuration types specific to the translation service wrapper.

**File:** `/src/lib/translation-service/translation-service.ts`

**Type Definitions:**

```typescript
/**
 * Main Translation Service Wrapper
 * REQ-240: Unified Translation Service Interface
 *
 * Provides a unified interface for text translations with automatic
 * provider selection, fallback handling, and integrated rate limiting.
 *
 * @module translation-service
 */

import type {
  ITranslationProvider,
  TranslationProvider,
  TranslationRequest,
  TranslationResponse,
  BatchTranslationRequest,
  BatchTranslationResponse,
  TranslationContext,
  SupportedLanguage,
  RateLimitStatus,
} from './translation-service.types';
import { ClaudeTranslationProvider, createClaudeProvider } from './providers/claude-provider';
import { OpenAITranslationProvider, createOpenAIProvider } from './providers/openai-provider';
import { getGlobalRateLimitManager } from './utils/rate-limiter';
import { withRetry, RetryPresets } from './utils/retry';

/**
 * Configuration for the translation service
 */
export interface TranslationServiceConfig {
  /** Primary translation provider (default: from env or 'claude') */
  primaryProvider: TranslationProvider;
  /** Enable automatic fallback to secondary provider on failure */
  enableFallback: boolean;
  /** Enable retry logic for transient failures */
  enableRetry: boolean;
  /** Maximum retry attempts (default: 3) */
  maxRetries: number;
  /** Enable rate limiting (default: true) */
  enableRateLimiting: boolean;
  /** Log translation operations for debugging */
  enableLogging: boolean;
}

/**
 * Options for individual translation operations
 */
export interface TranslateOptions {
  /** Override primary provider for this request */
  provider?: TranslationProvider;
  /** Skip fallback even if enabled globally */
  skipFallback?: boolean;
  /** Skip retry even if enabled globally */
  skipRetry?: boolean;
  /** Additional context for translation */
  context?: TranslationContext;
}

/**
 * Result of a translation operation with metadata
 */
export interface TranslationResult extends TranslationResponse {
  /** Whether fallback provider was used */
  usedFallback: boolean;
  /** Number of retry attempts made */
  retryAttempts: number;
  /** Rate limit status after request */
  rateLimitStatus?: RateLimitStatus;
}

/**
 * Result of a batch translation operation
 */
export interface BatchTranslationResult extends BatchTranslationResponse {
  /** Whether fallback provider was used */
  usedFallback: boolean;
  /** Number of retry attempts made */
  retryAttempts: number;
  /** Languages that failed to translate */
  failedLanguages?: SupportedLanguage[];
}
```

### Task 3.6.2: Implement Translation Service Class

Implement the main `TranslationService` class that orchestrates providers, rate limiting, and retry logic.

**File:** `/src/lib/translation-service/translation-service.ts`

**Implementation Requirements:**

1. **Provider Management**
   - Initialize primary and fallback providers
   - Support runtime provider switching
   - Track provider availability

2. **Provider Selection**
   - Read `TRANSLATION_PROVIDER` from environment
   - Fall back to 'claude' if not configured
   - Validate provider availability before use

3. **Automatic Fallback**
   - Detect primary provider failures
   - Automatically attempt fallback provider
   - Track which provider succeeded

4. **Integrated Rate Limiting**
   - Check rate limit before each request
   - Queue requests when approaching limits
   - Provide rate limit status in responses

5. **Retry Integration**
   - Wrap translation calls with retry logic
   - Use exponential backoff with jitter
   - Distinguish retryable vs permanent failures

**Class Structure:**

```typescript
/**
 * Default configuration values
 */
const DEFAULT_CONFIG: TranslationServiceConfig = {
  primaryProvider: (process.env.TRANSLATION_PROVIDER as TranslationProvider) || 'claude',
  enableFallback: true,
  enableRetry: true,
  maxRetries: parseInt(process.env.TRANSLATION_MAX_RETRIES || '3', 10),
  enableRateLimiting: true,
  enableLogging: process.env.NODE_ENV !== 'production',
};

/**
 * All supported target languages
 */
export const ALL_SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];

/**
 * Main Translation Service
 *
 * Provides a unified interface for translating text across the FAQBNB application.
 * Handles provider selection, fallback, rate limiting, and retry logic transparently.
 *
 * @example
 * ```typescript
 * const service = createTranslationService();
 *
 * // Single translation
 * const result = await service.translateText('Hello', 'en', 'fr');
 * console.log(result.translatedText); // "Bonjour"
 *
 * // Batch translation to all languages
 * const batch = await service.translateToAllLanguages('Hello', 'en');
 * console.log(batch.translations.fr); // "Bonjour"
 * console.log(batch.translations.de); // "Hallo"
 * ```
 */
export class TranslationService {
  private config: TranslationServiceConfig;
  private providers: Map<TranslationProvider, ITranslationProvider> = new Map();
  private rateLimitManager = getGlobalRateLimitManager();

  constructor(config: Partial<TranslationServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeProviders();
  }

  // ===========================================================================
  // Public API
  // ===========================================================================

  /**
   * Translate text from one language to another
   *
   * @param text - Text to translate
   * @param sourceLanguage - Source language code
   * @param targetLanguage - Target language code
   * @param options - Optional translation options
   * @returns Translation result with metadata
   *
   * @example
   * ```typescript
   * const result = await service.translateText(
   *   'Welcome to our property',
   *   'en',
   *   'fr',
   *   { context: { contentType: 'item_description', domainContext: 'vacation rental' } }
   * );
   * ```
   */
  async translateText(
    text: string,
    sourceLanguage: SupportedLanguage,
    targetLanguage: SupportedLanguage,
    options: TranslateOptions = {}
  ): Promise<TranslationResult> {
    // Skip translation if source and target are the same
    if (sourceLanguage === targetLanguage) {
      return {
        translatedText: text,
        provider: this.config.primaryProvider,
        usedFallback: false,
        retryAttempts: 0,
      };
    }

    const request: TranslationRequest = {
      text,
      sourceLanguage,
      targetLanguage,
      context: options.context,
    };

    return this.executeTranslation(request, options);
  }

  /**
   * Translate text to all supported languages
   *
   * @param text - Text to translate
   * @param sourceLanguage - Source language code
   * @param options - Optional translation options
   * @returns Batch translation result with all language translations
   *
   * @example
   * ```typescript
   * const result = await service.translateToAllLanguages(
   *   'Coffee Machine',
   *   'en',
   *   { context: { contentType: 'item_name' } }
   * );
   *
   * // Access individual translations
   * console.log(result.translations.fr); // "Machine à café"
   * console.log(result.translations.de); // "Kaffeemaschine"
   * ```
   */
  async translateToAllLanguages(
    text: string,
    sourceLanguage: SupportedLanguage,
    options: TranslateOptions = {}
  ): Promise<BatchTranslationResult> {
    // Target all languages except source
    const targetLanguages = ALL_SUPPORTED_LANGUAGES.filter(lang => lang !== sourceLanguage);

    const request: BatchTranslationRequest = {
      text,
      sourceLanguage,
      targetLanguages,
      context: options.context,
    };

    return this.executeBatchTranslation(request, options);
  }

  /**
   * Translate text to specific target languages
   *
   * @param text - Text to translate
   * @param sourceLanguage - Source language code
   * @param targetLanguages - Array of target language codes
   * @param options - Optional translation options
   * @returns Batch translation result
   */
  async translateToLanguages(
    text: string,
    sourceLanguage: SupportedLanguage,
    targetLanguages: SupportedLanguage[],
    options: TranslateOptions = {}
  ): Promise<BatchTranslationResult> {
    // Filter out source language and duplicates
    const uniqueTargets = [...new Set(targetLanguages.filter(lang => lang !== sourceLanguage))];

    const request: BatchTranslationRequest = {
      text,
      sourceLanguage,
      targetLanguages: uniqueTargets,
      context: options.context,
    };

    return this.executeBatchTranslation(request, options);
  }

  /**
   * Check if translation service is available
   */
  isAvailable(): boolean {
    const primaryProvider = this.providers.get(this.config.primaryProvider);
    const fallbackProvider = this.getFallbackProvider();

    return (primaryProvider?.isAvailable() ?? false) ||
           (this.config.enableFallback && (fallbackProvider?.isAvailable() ?? false));
  }

  /**
   * Get current rate limit status for all providers
   */
  getRateLimitStatus(): Record<TranslationProvider, RateLimitStatus> {
    return this.rateLimitManager.getAllProviderStatus();
  }

  /**
   * Get rate limit status for a specific provider
   */
  getProviderRateLimitStatus(provider: TranslationProvider): RateLimitStatus {
    return this.rateLimitManager.getProviderLimiter(provider).getStatus();
  }

  /**
   * Update service configuration at runtime
   */
  updateConfig(config: Partial<TranslationServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current service configuration
   */
  getConfig(): TranslationServiceConfig {
    return { ...this.config };
  }

  // ===========================================================================
  // Private Methods
  // ===========================================================================

  /**
   * Initialize translation providers
   */
  private initializeProviders(): void {
    // Initialize Claude provider
    try {
      this.providers.set('claude', createClaudeProvider());
    } catch (error) {
      this.log('warn', 'Failed to initialize Claude provider:', error);
    }

    // Initialize OpenAI provider
    try {
      this.providers.set('openai', createOpenAIProvider());
    } catch (error) {
      this.log('warn', 'Failed to initialize OpenAI provider:', error);
    }

    // Log provider availability
    this.log('info', 'Translation providers initialized:', {
      claude: this.providers.get('claude')?.isAvailable() ?? false,
      openai: this.providers.get('openai')?.isAvailable() ?? false,
      primary: this.config.primaryProvider,
    });
  }

  /**
   * Execute a single translation with retry and fallback
   */
  private async executeTranslation(
    request: TranslationRequest,
    options: TranslateOptions
  ): Promise<TranslationResult> {
    const providerName = options.provider || this.config.primaryProvider;
    const provider = this.providers.get(providerName);

    if (!provider?.isAvailable()) {
      // Primary not available - try fallback immediately
      if (this.config.enableFallback && !options.skipFallback) {
        const fallbackResult = await this.tryFallbackTranslation(request, providerName);
        if (fallbackResult) {
          return fallbackResult;
        }
      }
      throw new Error(`Translation provider '${providerName}' is not available`);
    }

    // Acquire rate limit
    if (this.config.enableRateLimiting) {
      const limiter = this.rateLimitManager.getProviderLimiter(providerName);
      await limiter.acquire();
    }

    // Execute with retry if enabled
    let retryAttempts = 0;
    let result: TranslationResponse | undefined;
    let lastError: Error | undefined;

    const operation = async () => {
      retryAttempts++;
      return provider.translate(request);
    };

    if (this.config.enableRetry && !options.skipRetry) {
      const retryResult = await withRetry(operation, {
        ...RetryPresets.standard,
        maxRetries: this.config.maxRetries,
        onRetry: (attempt, error) => {
          this.log('warn', `Translation retry attempt ${attempt}:`, error);
        },
      });

      if (retryResult.success) {
        result = retryResult.data;
        retryAttempts = retryResult.attempts;
      } else {
        lastError = retryResult.error;
        retryAttempts = retryResult.attempts;
      }
    } else {
      try {
        result = await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
      }
    }

    // Primary succeeded
    if (result) {
      this.log('debug', 'Translation successful:', {
        provider: providerName,
        source: request.sourceLanguage,
        target: request.targetLanguage,
        retryAttempts,
      });

      return {
        ...result,
        usedFallback: false,
        retryAttempts,
        rateLimitStatus: this.config.enableRateLimiting
          ? this.rateLimitManager.getProviderLimiter(providerName).getStatus()
          : undefined,
      };
    }

    // Primary failed - try fallback
    if (this.config.enableFallback && !options.skipFallback) {
      this.log('info', `Primary provider failed, attempting fallback. Error: ${lastError?.message}`);

      const fallbackResult = await this.tryFallbackTranslation(request, providerName);
      if (fallbackResult) {
        return {
          ...fallbackResult,
          retryAttempts: fallbackResult.retryAttempts + retryAttempts,
        };
      }
    }

    // Both providers failed
    throw lastError || new Error('Translation failed');
  }

  /**
   * Execute a batch translation with retry and fallback
   */
  private async executeBatchTranslation(
    request: BatchTranslationRequest,
    options: TranslateOptions
  ): Promise<BatchTranslationResult> {
    const providerName = options.provider || this.config.primaryProvider;
    const provider = this.providers.get(providerName);

    if (!provider?.isAvailable()) {
      // Primary not available - try fallback immediately
      if (this.config.enableFallback && !options.skipFallback) {
        const fallbackResult = await this.tryFallbackBatchTranslation(request, providerName);
        if (fallbackResult) {
          return fallbackResult;
        }
      }
      throw new Error(`Translation provider '${providerName}' is not available`);
    }

    // Execute batch translation
    let retryAttempts = 0;
    let result: BatchTranslationResponse | undefined;
    let lastError: Error | undefined;

    const operation = async () => {
      // Acquire rate limit for batch (one acquire per expected call)
      if (this.config.enableRateLimiting) {
        const limiter = this.rateLimitManager.getProviderLimiter(providerName);
        // Note: translateBatch internally calls translate multiple times,
        // but provider handles its own rate limiting per call
        await limiter.acquire();
      }

      retryAttempts++;
      return provider.translateBatch(request);
    };

    if (this.config.enableRetry && !options.skipRetry) {
      const retryResult = await withRetry(operation, {
        ...RetryPresets.conservative, // Use conservative for batch operations
        maxRetries: this.config.maxRetries,
        onRetry: (attempt, error) => {
          this.log('warn', `Batch translation retry attempt ${attempt}:`, error);
        },
      });

      if (retryResult.success) {
        result = retryResult.data;
        retryAttempts = retryResult.attempts;
      } else {
        lastError = retryResult.error;
        retryAttempts = retryResult.attempts;
      }
    } else {
      try {
        result = await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
      }
    }

    // Primary succeeded
    if (result) {
      const failedLanguages = result.errors
        ? (Object.keys(result.errors) as SupportedLanguage[])
        : undefined;

      this.log('debug', 'Batch translation successful:', {
        provider: providerName,
        source: request.sourceLanguage,
        targets: request.targetLanguages,
        retryAttempts,
        failedLanguages,
      });

      return {
        ...result,
        usedFallback: false,
        retryAttempts,
        failedLanguages,
      };
    }

    // Primary failed - try fallback
    if (this.config.enableFallback && !options.skipFallback) {
      this.log('info', `Primary batch translation failed, attempting fallback. Error: ${lastError?.message}`);

      const fallbackResult = await this.tryFallbackBatchTranslation(request, providerName);
      if (fallbackResult) {
        return {
          ...fallbackResult,
          retryAttempts: fallbackResult.retryAttempts + retryAttempts,
        };
      }
    }

    // Both providers failed
    throw lastError || new Error('Batch translation failed');
  }

  /**
   * Attempt translation with fallback provider
   */
  private async tryFallbackTranslation(
    request: TranslationRequest,
    failedProvider: TranslationProvider
  ): Promise<TranslationResult | null> {
    const fallbackProvider = this.getFallbackProvider(failedProvider);
    if (!fallbackProvider?.isAvailable()) {
      return null;
    }

    const fallbackName = fallbackProvider.name;

    // Acquire rate limit for fallback
    if (this.config.enableRateLimiting) {
      const limiter = this.rateLimitManager.getProviderLimiter(fallbackName);
      await limiter.acquire();
    }

    let retryAttempts = 0;

    try {
      const operation = async () => {
        retryAttempts++;
        return fallbackProvider.translate(request);
      };

      let result: TranslationResponse;

      if (this.config.enableRetry) {
        const retryResult = await withRetry(operation, {
          ...RetryPresets.standard,
          maxRetries: this.config.maxRetries,
        });

        if (!retryResult.success) {
          throw retryResult.error;
        }

        result = retryResult.data!;
        retryAttempts = retryResult.attempts;
      } else {
        result = await operation();
      }

      this.log('info', 'Fallback translation successful:', {
        fallbackProvider: fallbackName,
        originalProvider: failedProvider,
      });

      return {
        ...result,
        usedFallback: true,
        retryAttempts,
        rateLimitStatus: this.config.enableRateLimiting
          ? this.rateLimitManager.getProviderLimiter(fallbackName).getStatus()
          : undefined,
      };
    } catch (error) {
      this.log('error', 'Fallback translation failed:', error);
      return null;
    }
  }

  /**
   * Attempt batch translation with fallback provider
   */
  private async tryFallbackBatchTranslation(
    request: BatchTranslationRequest,
    failedProvider: TranslationProvider
  ): Promise<BatchTranslationResult | null> {
    const fallbackProvider = this.getFallbackProvider(failedProvider);
    if (!fallbackProvider?.isAvailable()) {
      return null;
    }

    const fallbackName = fallbackProvider.name;

    // Acquire rate limit for fallback
    if (this.config.enableRateLimiting) {
      const limiter = this.rateLimitManager.getProviderLimiter(fallbackName);
      await limiter.acquire();
    }

    let retryAttempts = 0;

    try {
      const operation = async () => {
        retryAttempts++;
        return fallbackProvider.translateBatch(request);
      };

      let result: BatchTranslationResponse;

      if (this.config.enableRetry) {
        const retryResult = await withRetry(operation, {
          ...RetryPresets.conservative,
          maxRetries: this.config.maxRetries,
        });

        if (!retryResult.success) {
          throw retryResult.error;
        }

        result = retryResult.data!;
        retryAttempts = retryResult.attempts;
      } else {
        result = await operation();
      }

      const failedLanguages = result.errors
        ? (Object.keys(result.errors) as SupportedLanguage[])
        : undefined;

      this.log('info', 'Fallback batch translation successful:', {
        fallbackProvider: fallbackName,
        originalProvider: failedProvider,
      });

      return {
        ...result,
        usedFallback: true,
        retryAttempts,
        failedLanguages,
      };
    } catch (error) {
      this.log('error', 'Fallback batch translation failed:', error);
      return null;
    }
  }

  /**
   * Get the fallback provider (opposite of primary)
   */
  private getFallbackProvider(excludeProvider?: TranslationProvider): ITranslationProvider | undefined {
    const fallbackName: TranslationProvider =
      (excludeProvider || this.config.primaryProvider) === 'claude' ? 'openai' : 'claude';

    return this.providers.get(fallbackName);
  }

  /**
   * Log messages based on configuration
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: unknown): void {
    if (!this.config.enableLogging && level === 'debug') {
      return;
    }

    const prefix = '[TranslationService]';
    const logData = data ? ` ${JSON.stringify(data)}` : '';

    switch (level) {
      case 'debug':
        console.debug(`${prefix} ${message}${logData}`);
        break;
      case 'info':
        console.info(`${prefix} ${message}${logData}`);
        break;
      case 'warn':
        console.warn(`${prefix} ${message}${logData}`);
        break;
      case 'error':
        console.error(`${prefix} ${message}${logData}`);
        break;
    }
  }
}
```

### Task 3.6.3: Implement Factory Functions and Singleton

Create factory functions and a singleton instance for convenient usage.

**File:** `/src/lib/translation-service/translation-service.ts`

**Factory Functions:**

```typescript
// ===========================================================================
// Factory Functions
// ===========================================================================

/**
 * Create a new translation service instance
 *
 * @param config - Optional configuration overrides
 * @returns New TranslationService instance
 */
export function createTranslationService(
  config?: Partial<TranslationServiceConfig>
): TranslationService {
  return new TranslationService(config);
}

// ===========================================================================
// Singleton Instance
// ===========================================================================

let globalService: TranslationService | null = null;

/**
 * Get the global translation service instance
 *
 * Creates a singleton instance on first call. Use this for application-wide
 * translation operations.
 *
 * @returns Global TranslationService instance
 */
export function getTranslationService(): TranslationService {
  if (!globalService) {
    globalService = createTranslationService();
  }
  return globalService;
}

/**
 * Reset the global translation service (useful for testing)
 */
export function resetTranslationService(): void {
  globalService = null;
}

// ===========================================================================
// Convenience Functions
// ===========================================================================

/**
 * Translate text from one language to another using the global service
 *
 * @param text - Text to translate
 * @param sourceLanguage - Source language code
 * @param targetLanguage - Target language code
 * @param options - Optional translation options
 * @returns Translation result
 *
 * @example
 * ```typescript
 * import { translateText } from '@/lib/translation-service';
 *
 * const result = await translateText('Hello', 'en', 'fr');
 * console.log(result.translatedText); // "Bonjour"
 * ```
 */
export async function translateText(
  text: string,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage,
  options?: TranslateOptions
): Promise<TranslationResult> {
  return getTranslationService().translateText(text, sourceLanguage, targetLanguage, options);
}

/**
 * Translate text to all supported languages using the global service
 *
 * @param text - Text to translate
 * @param sourceLanguage - Source language code
 * @param options - Optional translation options
 * @returns Batch translation result with all languages
 *
 * @example
 * ```typescript
 * import { translateToAllLanguages } from '@/lib/translation-service';
 *
 * const result = await translateToAllLanguages('Coffee Machine', 'en', {
 *   context: { contentType: 'item_name' }
 * });
 *
 * // Access translations
 * console.log(result.translations.fr); // "Machine à café"
 * console.log(result.translations.de); // "Kaffeemaschine"
 * ```
 */
export async function translateToAllLanguages(
  text: string,
  sourceLanguage: SupportedLanguage,
  options?: TranslateOptions
): Promise<BatchTranslationResult> {
  return getTranslationService().translateToAllLanguages(text, sourceLanguage, options);
}

/**
 * Translate text to specific languages using the global service
 *
 * @param text - Text to translate
 * @param sourceLanguage - Source language code
 * @param targetLanguages - Array of target language codes
 * @param options - Optional translation options
 * @returns Batch translation result
 */
export async function translateToLanguages(
  text: string,
  sourceLanguage: SupportedLanguage,
  targetLanguages: SupportedLanguage[],
  options?: TranslateOptions
): Promise<BatchTranslationResult> {
  return getTranslationService().translateToLanguages(text, sourceLanguage, targetLanguages, options);
}

/**
 * Check if translation service is available
 */
export function isTranslationServiceAvailable(): boolean {
  return getTranslationService().isAvailable();
}

/**
 * Get current rate limit status for all providers
 */
export function getTranslationRateLimitStatus(): Record<TranslationProvider, RateLimitStatus> {
  return getTranslationService().getRateLimitStatus();
}
```

### Task 3.6.4: Update Module Exports

Update the translation service barrel file to export the main service and convenience functions.

**File:** `/src/lib/translation-service/index.ts` (modify)

**Add exports:**

```typescript
// Main translation service
export {
  TranslationService,
  createTranslationService,
  getTranslationService,
  resetTranslationService,
  // Convenience functions
  translateText,
  translateToAllLanguages,
  translateToLanguages,
  isTranslationServiceAvailable,
  getTranslationRateLimitStatus,
  // Constants
  ALL_SUPPORTED_LANGUAGES,
} from './translation-service';

// Types
export type {
  TranslationServiceConfig,
  TranslateOptions,
  TranslationResult,
  BatchTranslationResult,
} from './translation-service';
```

### Task 3.6.5: Add Environment Variables Documentation

Update the environment example file with translation service configuration.

**File:** `/.env.example` (modify)

**Add/update variables:**

```bash
# =============================================================================
# Translation Service Configuration
# =============================================================================

# Primary translation provider: 'claude' or 'openai' (default: claude)
TRANSLATION_PROVIDER=claude

# Anthropic API key (required if using Claude)
ANTHROPIC_API_KEY=sk-ant-xxx

# OpenAI API key (required if using OpenAI or as fallback)
OPENAI_API_KEY=sk-xxx

# Maximum retry attempts for failed translations (default: 3)
TRANSLATION_MAX_RETRIES=3

# Rate limiting (requests per minute, default: 60)
TRANSLATION_RATE_LIMIT_PER_MINUTE=60
```

### Task 3.6.6: Create Unit Tests

Create comprehensive unit tests for the translation service.

**File:** `/src/lib/translation-service/__tests__/translation-service.test.ts`

**Test Cases:**

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  TranslationService,
  createTranslationService,
  getTranslationService,
  resetTranslationService,
  translateText,
  translateToAllLanguages,
  ALL_SUPPORTED_LANGUAGES,
} from '../translation-service';

// Mock the providers
vi.mock('../providers/claude-provider', () => ({
  createClaudeProvider: vi.fn(() => ({
    name: 'claude',
    isAvailable: vi.fn(() => true),
    translate: vi.fn(),
    translateBatch: vi.fn(),
  })),
}));

vi.mock('../providers/openai-provider', () => ({
  createOpenAIProvider: vi.fn(() => ({
    name: 'openai',
    isAvailable: vi.fn(() => true),
    translate: vi.fn(),
    translateBatch: vi.fn(),
  })),
}));

// Mock rate limiter
vi.mock('../utils/rate-limiter', () => ({
  getGlobalRateLimitManager: vi.fn(() => ({
    getProviderLimiter: vi.fn(() => ({
      acquire: vi.fn().mockResolvedValue(undefined),
      getStatus: vi.fn(() => ({ remaining: 60, limit: 60, resetInSeconds: 0, isLimited: false })),
    })),
    getAllProviderStatus: vi.fn(() => ({
      claude: { remaining: 60, limit: 60, resetInSeconds: 0, isLimited: false },
      openai: { remaining: 60, limit: 60, resetInSeconds: 0, isLimited: false },
    })),
  })),
}));

// Mock retry
vi.mock('../utils/retry', () => ({
  withRetry: vi.fn(async (operation) => {
    try {
      const data = await operation();
      return { success: true, data, attempts: 1 };
    } catch (error) {
      return { success: false, error, attempts: 1 };
    }
  }),
  RetryPresets: {
    standard: { maxRetries: 3 },
    conservative: { maxRetries: 3 },
  },
}));

describe('TranslationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetTranslationService();
  });

  afterEach(() => {
    resetTranslationService();
  });

  describe('initialization', () => {
    it('should create with default configuration', () => {
      const service = createTranslationService();
      const config = service.getConfig();

      expect(config.primaryProvider).toBe('claude');
      expect(config.enableFallback).toBe(true);
      expect(config.enableRetry).toBe(true);
    });

    it('should create with custom configuration', () => {
      const service = createTranslationService({
        primaryProvider: 'openai',
        enableFallback: false,
      });
      const config = service.getConfig();

      expect(config.primaryProvider).toBe('openai');
      expect(config.enableFallback).toBe(false);
    });
  });

  describe('translateText', () => {
    it('should return same text when source and target are identical', async () => {
      const service = createTranslationService();

      const result = await service.translateText('Hello', 'en', 'en');

      expect(result.translatedText).toBe('Hello');
      expect(result.usedFallback).toBe(false);
    });

    it('should translate text using primary provider', async () => {
      const { createClaudeProvider } = await import('../providers/claude-provider');
      const mockProvider = createClaudeProvider();
      (mockProvider.translate as any).mockResolvedValue({
        translatedText: 'Bonjour',
        provider: 'claude',
      });

      const service = createTranslationService();
      const result = await service.translateText('Hello', 'en', 'fr');

      expect(result.translatedText).toBe('Bonjour');
      expect(result.provider).toBe('claude');
      expect(result.usedFallback).toBe(false);
    });
  });

  describe('translateToAllLanguages', () => {
    it('should translate to all languages except source', async () => {
      const { createClaudeProvider } = await import('../providers/claude-provider');
      const mockProvider = createClaudeProvider();
      (mockProvider.translateBatch as any).mockResolvedValue({
        translations: {
          fr: 'Bonjour',
          es: 'Hola',
          de: 'Hallo',
          nl: 'Hallo',
          it: 'Ciao',
        },
        provider: 'claude',
        totalTokensUsed: 100,
      });

      const service = createTranslationService();
      const result = await service.translateToAllLanguages('Hello', 'en');

      expect(result.translations).toHaveProperty('fr');
      expect(result.translations).toHaveProperty('es');
      expect(result.translations).toHaveProperty('de');
      expect(result.translations).not.toHaveProperty('en'); // Source excluded
      expect(result.usedFallback).toBe(false);
    });
  });

  describe('fallback behavior', () => {
    it('should use fallback when primary provider fails', async () => {
      const { createClaudeProvider } = await import('../providers/claude-provider');
      const { createOpenAIProvider } = await import('../providers/openai-provider');

      const claudeProvider = createClaudeProvider();
      const openaiProvider = createOpenAIProvider();

      // Claude fails
      (claudeProvider.translate as any).mockRejectedValue(new Error('Claude API error'));

      // OpenAI succeeds
      (openaiProvider.translate as any).mockResolvedValue({
        translatedText: 'Bonjour',
        provider: 'openai',
      });

      // Mock withRetry to pass through the error
      const { withRetry } = await import('../utils/retry');
      (withRetry as any).mockImplementation(async (operation: any) => {
        try {
          const data = await operation();
          return { success: true, data, attempts: 1 };
        } catch (error) {
          return { success: false, error, attempts: 1 };
        }
      });

      const service = createTranslationService({ enableRetry: false });
      const result = await service.translateText('Hello', 'en', 'fr');

      expect(result.translatedText).toBe('Bonjour');
      expect(result.usedFallback).toBe(true);
    });

    it('should not use fallback when disabled', async () => {
      const { createClaudeProvider } = await import('../providers/claude-provider');
      const claudeProvider = createClaudeProvider();
      (claudeProvider.translate as any).mockRejectedValue(new Error('Claude API error'));

      const service = createTranslationService({
        enableFallback: false,
        enableRetry: false,
      });

      await expect(service.translateText('Hello', 'en', 'fr')).rejects.toThrow();
    });
  });

  describe('isAvailable', () => {
    it('should return true when primary provider is available', () => {
      const service = createTranslationService();
      expect(service.isAvailable()).toBe(true);
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return rate limit status for all providers', () => {
      const service = createTranslationService();
      const status = service.getRateLimitStatus();

      expect(status).toHaveProperty('claude');
      expect(status).toHaveProperty('openai');
      expect(status.claude.remaining).toBe(60);
    });
  });

  describe('singleton', () => {
    it('should return same instance on multiple calls', () => {
      const service1 = getTranslationService();
      const service2 = getTranslationService();

      expect(service1).toBe(service2);
    });

    it('should create new instance after reset', () => {
      const service1 = getTranslationService();
      resetTranslationService();
      const service2 = getTranslationService();

      expect(service1).not.toBe(service2);
    });
  });
});

describe('convenience functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetTranslationService();
  });

  it('translateText should use global service', async () => {
    const { createClaudeProvider } = await import('../providers/claude-provider');
    const mockProvider = createClaudeProvider();
    (mockProvider.translate as any).mockResolvedValue({
      translatedText: 'Bonjour',
      provider: 'claude',
    });

    const result = await translateText('Hello', 'en', 'fr');

    expect(result.translatedText).toBe('Bonjour');
  });

  it('translateToAllLanguages should use global service', async () => {
    const { createClaudeProvider } = await import('../providers/claude-provider');
    const mockProvider = createClaudeProvider();
    (mockProvider.translateBatch as any).mockResolvedValue({
      translations: { fr: 'Bonjour' },
      provider: 'claude',
    });

    const result = await translateToAllLanguages('Hello', 'en');

    expect(result.translations).toHaveProperty('fr');
  });
});

describe('ALL_SUPPORTED_LANGUAGES', () => {
  it('should contain all 6 supported languages', () => {
    expect(ALL_SUPPORTED_LANGUAGES).toHaveLength(6);
    expect(ALL_SUPPORTED_LANGUAGES).toContain('en');
    expect(ALL_SUPPORTED_LANGUAGES).toContain('fr');
    expect(ALL_SUPPORTED_LANGUAGES).toContain('es');
    expect(ALL_SUPPORTED_LANGUAGES).toContain('de');
    expect(ALL_SUPPORTED_LANGUAGES).toContain('nl');
    expect(ALL_SUPPORTED_LANGUAGES).toContain('it');
  });
});
```

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/translation-service/translation-service.ts` | Main translation service wrapper |
| `/src/lib/translation-service/__tests__/translation-service.test.ts` | Unit tests for translation service |

### Existing Files to Modify

| File Path | Function/Section | Modification |
|-----------|------------------|--------------|
| `/src/lib/translation-service/index.ts` | Exports | Add translation service exports |
| `/.env.example` | Environment variables | Document translation service config vars |

### Files NOT to Modify

- `/src/lib/translation-service/translation-service.types.ts` - Types already defined (REQ-235)
- `/src/lib/translation-service/providers/claude-provider.ts` - Provider implemented (REQ-236)
- `/src/lib/translation-service/providers/openai-provider.ts` - Provider implemented (REQ-237)
- `/src/lib/translation-service/utils/rate-limiter.ts` - Rate limiter implemented (REQ-238)
- `/src/lib/translation-service/utils/retry.ts` - Retry logic implemented (REQ-239)

---

## Implementation Order

1. **Define types** (Task 3.6.1) - Add service configuration and result types
2. **Implement TranslationService class** (Task 3.6.2) - Core service with provider orchestration
3. **Implement factory functions** (Task 3.6.3) - Singleton and convenience functions
4. **Update exports** (Task 3.6.4) - Add to barrel file
5. **Document env vars** (Task 3.6.5) - Update `.env.example`
6. **Write tests** (Task 3.6.6) - Create unit test file

---

## Acceptance Criteria Verification

| Criteria (from REQ-240) | Implementation Verification |
|-------------------------|----------------------------|
| A single function translates text from one language to another language | `translateText()` function with `(text, sourceLanguage, targetLanguage, options)` signature |
| A batch function translates text to all supported application languages in one operation | `translateToAllLanguages()` function using `ALL_SUPPORTED_LANGUAGES` constant |
| The service selects the translation provider based on environment configuration settings | `TRANSLATION_PROVIDER` env var read in `DEFAULT_CONFIG`, used to select primary provider |
| When the primary provider fails, the service automatically attempts translation using the fallback provider | `executeTranslation()` calls `tryFallbackTranslation()` on primary failure when `enableFallback: true` |
| Translation requests include appropriate rate limiting and retry logic from underlying utilities | `rateLimitManager.getProviderLimiter().acquire()` and `withRetry()` integration |
| The service maintains consistent error handling and logging across all translation operations | `log()` method with levels; consistent error throwing; `TranslationResult` includes metadata |
| Batch translations return results in a structured format mapping each target language to its translated text | `BatchTranslationResult.translations: Record<SupportedLanguage, string>` structure |

---

## Dependencies

### Depends On (Must Be Completed First)

- **REQ-235** (Task 3.1): Translation service module structure
  - `/src/lib/translation-service/translation-service.types.ts` with interfaces
  - `/src/lib/translation-service/index.ts` barrel file
- **REQ-236** (Task 3.2): Claude translation provider
  - `/src/lib/translation-service/providers/claude-provider.ts`
- **REQ-237** (Task 3.3): OpenAI translation provider
  - `/src/lib/translation-service/providers/openai-provider.ts`
- **REQ-238** (Task 3.4): Rate limiter utility
  - `/src/lib/translation-service/utils/rate-limiter.ts`
- **REQ-239** (Task 3.5): Retry logic utility
  - `/src/lib/translation-service/utils/retry.ts`

### Blocks (Require This First)

- **Task 3.7**: Add environment variables (documents service configuration)
- **Task 3.8**: API endpoint for manual translation testing (uses this service)
- **Phase 4**: Background job processing (uses this service for translations)

---

## Testing Strategy

### Unit Tests

Cover the following scenarios:

1. **Initialization**: Default and custom configuration
2. **translateText**: Basic translation, same-language passthrough
3. **translateToAllLanguages**: Batch translation excluding source language
4. **translateToLanguages**: Custom target language selection
5. **Fallback behavior**: Primary fails, fallback succeeds
6. **Fallback disabled**: Primary fails, throws error
7. **Rate limiting integration**: Acquire called before requests
8. **Retry integration**: withRetry wraps operations
9. **Singleton pattern**: Same instance returned, reset works
10. **Convenience functions**: Use global service correctly

### Integration Testing

Integration tests should be performed manually or in staging:

1. End-to-end translation with real Claude API
2. Fallback triggered by simulated Claude failure
3. Rate limiting behavior under load
4. Batch translation to all 5 target languages
5. Context-specific translations (item names, descriptions)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Provider initialization fails silently | Low | Medium | Log warnings; `isAvailable()` check before use |
| Fallback still fails | Medium | Medium | Error surfaced to caller; logged for debugging |
| Rate limiter blocks too aggressively | Low | Low | Configurable limits; queue strategy by default |
| Retry causes duplicate translations | Very Low | Low | Translation is idempotent (same input = same output) |
| Memory leak from singleton | Very Low | Low | Simple object reference; `resetTranslationService()` for tests |
| Environment variables missing | Medium | Medium | Graceful degradation; log warnings; service unavailable |

---

## Estimated Effort

**Complexity:** Medium-High
**Estimated Time:** 3-4 hours

| Sub-task | Time |
|----------|------|
| Define types | 20 min |
| Implement TranslationService class | 1.5 hours |
| Implement factory and convenience functions | 30 min |
| Update exports | 10 min |
| Document env vars | 10 min |
| Write unit tests | 1 hour |

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Primary provider default | Claude | Better context understanding for domain-specific content |
| Fallback enabled by default | Yes | Improves reliability without explicit opt-in |
| Singleton pattern | Optional via `getTranslationService()` | Convenient for app-wide use; explicit create for isolation |
| Convenience functions | Standalone exports | Simplifies common use cases; reduces boilerplate |
| Batch strategy | Sequential with provider's batch method | Provider handles internal batching; cleaner interface |
| Logging | Configurable, debug disabled in production | Balance observability with performance |

---

## Usage Examples

### Basic Single Translation

```typescript
import { translateText } from '@/lib/translation-service';

// Simple translation
const result = await translateText('Welcome to our property', 'en', 'fr');
console.log(result.translatedText); // "Bienvenue dans notre propriété"
console.log(result.provider);        // "claude"
console.log(result.usedFallback);    // false
```

### Translation with Context

```typescript
import { translateText } from '@/lib/translation-service';

// Translation with domain context
const result = await translateText(
  'Coffee Machine',
  'en',
  'de',
  {
    context: {
      contentType: 'item_name',
      domainContext: 'kitchen appliance in vacation rental property',
    },
  }
);
console.log(result.translatedText); // "Kaffeemaschine"
```

### Batch Translation to All Languages

```typescript
import { translateToAllLanguages } from '@/lib/translation-service';

// Translate to all supported languages
const result = await translateToAllLanguages(
  'Check-in is at 3:00 PM',
  'en',
  {
    context: {
      contentType: 'article_description',
      domainContext: 'guest arrival instructions',
    },
  }
);

// Access individual translations
console.log(result.translations.fr); // "L'enregistrement est à 15h00"
console.log(result.translations.de); // "Check-in ist um 15:00 Uhr"
console.log(result.translations.es); // "El check-in es a las 15:00"

// Check for any failed translations
if (result.failedLanguages?.length) {
  console.warn('Failed languages:', result.failedLanguages);
}
```

### Using Service Instance Directly

```typescript
import { createTranslationService } from '@/lib/translation-service';

// Create custom service instance
const service = createTranslationService({
  primaryProvider: 'openai',
  enableFallback: true,
  maxRetries: 5,
});

// Check availability
if (!service.isAvailable()) {
  throw new Error('Translation service not available');
}

// Check rate limit before batch operation
const rateLimitStatus = service.getProviderRateLimitStatus('openai');
if (rateLimitStatus.remaining < 10) {
  console.warn('Low rate limit remaining:', rateLimitStatus.remaining);
}

// Perform translation
const result = await service.translateText('Hello', 'en', 'fr');
```

### Handling Errors

```typescript
import { translateText } from '@/lib/translation-service';

try {
  const result = await translateText('Hello', 'en', 'fr');
  console.log('Translation:', result.translatedText);

  if (result.usedFallback) {
    console.info('Used fallback provider:', result.provider);
  }
} catch (error) {
  // Both providers failed
  console.error('Translation failed:', error.message);
  // Use original text as fallback
}
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TRANSLATION_PROVIDER` | No | `claude` | Primary translation provider: 'claude' or 'openai' |
| `ANTHROPIC_API_KEY` | If using Claude | - | Anthropic API key for Claude translations |
| `OPENAI_API_KEY` | If using OpenAI | - | OpenAI API key for GPT translations |
| `TRANSLATION_MAX_RETRIES` | No | `3` | Maximum retry attempts for failed translations |
| `TRANSLATION_RATE_LIMIT_PER_MINUTE` | No | `60` | Rate limit for translation requests |

---

## API Reference

### TranslationService Class

| Method | Signature | Description |
|--------|-----------|-------------|
| `translateText` | `(text, sourceLanguage, targetLanguage, options?) => Promise<TranslationResult>` | Translate single text |
| `translateToAllLanguages` | `(text, sourceLanguage, options?) => Promise<BatchTranslationResult>` | Translate to all languages |
| `translateToLanguages` | `(text, sourceLanguage, targetLanguages, options?) => Promise<BatchTranslationResult>` | Translate to specific languages |
| `isAvailable` | `() => boolean` | Check if service is available |
| `getRateLimitStatus` | `() => Record<TranslationProvider, RateLimitStatus>` | Get rate limit status for all providers |
| `getProviderRateLimitStatus` | `(provider) => RateLimitStatus` | Get rate limit for specific provider |
| `updateConfig` | `(config) => void` | Update service configuration |
| `getConfig` | `() => TranslationServiceConfig` | Get current configuration |

### Convenience Functions

| Function | Description |
|----------|-------------|
| `translateText(text, source, target, options?)` | Translate using global service |
| `translateToAllLanguages(text, source, options?)` | Batch translate using global service |
| `translateToLanguages(text, source, targets, options?)` | Translate to specific languages |
| `getTranslationService()` | Get global service instance |
| `resetTranslationService()` | Reset global instance (testing) |
| `isTranslationServiceAvailable()` | Check global service availability |
| `getTranslationRateLimitStatus()` | Get rate limit status |

---

## Notes

- The service follows a facade pattern, hiding complexity of provider management, fallback, rate limiting, and retry logic
- Both `translateText()` and `translateToAllLanguages()` are available as standalone exports for convenience
- The singleton pattern allows efficient resource sharing across the application
- Fallback behavior is transparent - callers receive translations regardless of which provider succeeded
- Rate limiting is applied per-provider, preventing one provider's limit from affecting the other
- The service can be extended to support additional providers by adding to the `providers` Map

---

*Document generated for FAQBNB L10N Epic 1 - Foundation, Phase 3, Task 3.6*
