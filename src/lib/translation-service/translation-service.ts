/**
 * Main Translation Service Wrapper
 * REQ-240: Unified Translation Service Interface
 *
 * Provides a unified interface for text translations with automatic
 * provider selection, fallback handling, and integrated rate limiting.
 *
 * @module translation-service
 * @created 2026-01-18
 * @lastModified 2026-01-18
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
import { createClaudeProvider } from './providers/claude-provider';
import { createOpenAIProvider } from './providers/openai-provider';
import { getGlobalRateLimitManager } from './utils/rate-limiter';
import { withRetry, RetryPresets } from './utils/retry';

// ============================================================================
// Type Definitions
// ============================================================================

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
export interface SingleTranslationResult extends TranslationResponse {
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

// ============================================================================
// Default Configuration and Constants
// ============================================================================

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
 * All supported target languages for FAQBNB
 */
export const ALL_SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];

// ============================================================================
// TranslationService Class
// ============================================================================

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
  ): Promise<SingleTranslationResult> {
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
   * console.log(result.translations.fr); // "Machine a cafe"
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
  // Private Methods - Translation Execution
  // ===========================================================================

  /**
   * Execute a single translation with retry and fallback
   */
  private async executeTranslation(
    request: TranslationRequest,
    options: TranslateOptions
  ): Promise<SingleTranslationResult> {
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
      // Acquire rate limit for batch (one acquire per batch call)
      if (this.config.enableRateLimiting) {
        const limiter = this.rateLimitManager.getProviderLimiter(providerName);
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
  ): Promise<SingleTranslationResult | null> {
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
}

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
): Promise<SingleTranslationResult> {
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
 * console.log(result.translations.fr); // "Machine a cafe"
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
