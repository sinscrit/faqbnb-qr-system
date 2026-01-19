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
// Provider exports
// ============================================================================

// Task 3.2: Claude translation provider (REQ-236)
export { ClaudeTranslationProvider, createClaudeProvider } from './providers/claude-provider';
export type { ClaudeProviderConfig } from './providers/claude-provider';

// Task 3.3: OpenAI translation provider (REQ-237)
export { OpenAITranslationProvider, createOpenAIProvider } from './providers/openai-provider';
export type { OpenAIProviderConfig } from './providers/openai-provider';

// ============================================================================
// Utility exports
// ============================================================================

// Task 3.4: Rate limiter utility (REQ-238)
export {
  RateLimiter,
  RateLimitError,
  ProviderRateLimitManager,
  createRateLimiter,
  createProviderRateLimitManager,
  getGlobalRateLimitManager,
  resetGlobalRateLimitManager,
} from './utils/rate-limiter';
export type { RateLimiterConfig } from './utils/rate-limiter';

// Task 3.5: Retry utility (REQ-239)
export {
  withRetry,
  retryOperation,
  withRetryWrapper,
  calculateExponentialDelay,
  applyJitter,
  calculateRetryDelay,
  isRetryableError,
  sleep,
  RetryPresets,
} from './utils/retry';
export type {
  RetryConfig,
  RetryResult,
  AttemptDetail,
  HttpError,
} from './utils/retry';

// ============================================================================
// Main Translation Service (REQ-240)
// ============================================================================

// Main translation service wrapper
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
  SingleTranslationResult,
  BatchTranslationResult,
} from './translation-service';
