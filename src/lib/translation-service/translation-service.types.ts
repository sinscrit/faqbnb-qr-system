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
