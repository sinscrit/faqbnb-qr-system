/**
 * Source Language Detection Utility
 * Part of REQ-E03-007: Add Source Language Detection Utility
 *
 * Determines the source language for content translation by evaluating
 * multiple language sources in a defined priority order.
 *
 * @module content-translation/source-language
 * @created 2026-01-21
 */

import {
  SupportedLanguage,
  isSupportedLanguage,
  DEFAULT_LANGUAGE
} from '@/lib/translation-service/translation-service.types';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Minimal User interface for source language detection.
 * Accepts the full User type or any object with preferred_language.
 * Intentionally minimal to avoid tight coupling with database types.
 */
export interface UserForLanguageDetection {
  preferred_language?: string | null;
}

/**
 * Minimal Account interface for source language detection.
 * Accepts the full Account type or any object with preferred_language.
 * Intentionally minimal to avoid tight coupling with database types.
 */
export interface AccountForLanguageDetection {
  preferred_language?: string | null;
}

/**
 * Options for source language detection.
 * All parameters are optional - function handles missing values gracefully.
 */
export interface DetectSourceLanguageOptions {
  /** User context with language preference */
  user?: UserForLanguageDetection | null;
  /** Account context with language preference */
  account?: AccountForLanguageDetection | null;
  /** Explicit language override (highest priority) */
  override?: string | null;
}

// ============================================================================
// Main Detection Function
// ============================================================================

/**
 * Determines the source language for content translation by evaluating
 * multiple language sources in priority order.
 *
 * Priority Order:
 * 1. override parameter (if valid supported language)
 * 2. user.preferred_language (if valid supported language)
 * 3. account.preferred_language (if valid supported language)
 * 4. DEFAULT_LANGUAGE ('en') as ultimate fallback
 *
 * Invalid or unsupported language values are silently ignored and
 * evaluation continues to the next priority level.
 *
 * @param options - Object containing user, account, and optional override
 * @returns A validated SupportedLanguage code (guaranteed to be valid)
 *
 * @example
 * // With explicit override
 * detectSourceLanguage({ override: 'fr' }); // Returns 'fr'
 *
 * @example
 * // With user preference
 * detectSourceLanguage({ user: { preferred_language: 'es' } }); // Returns 'es'
 *
 * @example
 * // With account fallback
 * detectSourceLanguage({
 *   user: { preferred_language: null },
 *   account: { preferred_language: 'de' }
 * }); // Returns 'de'
 *
 * @example
 * // Default fallback
 * detectSourceLanguage({}); // Returns 'en'
 *
 * @example
 * // Invalid override falls through to next priority
 * detectSourceLanguage({
 *   override: 'invalid',
 *   user: { preferred_language: 'fr' }
 * }); // Returns 'fr'
 */
export function detectSourceLanguage(
  options: DetectSourceLanguageOptions = {}
): SupportedLanguage {
  const { user, account, override } = options;

  // Priority 1: Explicit override (highest priority)
  // Only use if provided and is a valid supported language
  if (override && isSupportedLanguage(override)) {
    return override;
  }

  // Priority 2: User preferred language
  // Use optional chaining to handle null/undefined user objects
  const userLang = user?.preferred_language;
  if (userLang && isSupportedLanguage(userLang)) {
    return userLang;
  }

  // Priority 3: Account preferred language
  // Use optional chaining to handle null/undefined account objects
  const accountLang = account?.preferred_language;
  if (accountLang && isSupportedLanguage(accountLang)) {
    return accountLang;
  }

  // Priority 4: Default fallback (English)
  // This ensures we always return a valid SupportedLanguage
  return DEFAULT_LANGUAGE;
}

// ============================================================================
// Alternative Signature (Plan-111 Compatibility)
// ============================================================================

/**
 * Alternative signature matching the Plan-111 specification.
 * Wraps the options-based function for API consistency with positional parameters.
 *
 * This function provides the signature:
 * `detectSourceLanguage(user: User, account: Account, override?: string)`
 * as specified in the implementation plan.
 *
 * @param user - User object with preferred_language (or null/undefined)
 * @param account - Account object with preferred_language (or null/undefined)
 * @param override - Explicit language override (optional)
 * @returns A validated SupportedLanguage code
 *
 * @example
 * // From API route with full context
 * const sourceLanguage = detectSourceLanguageFromContext(
 *   currentUser,
 *   currentAccount,
 *   body.sourceLanguage
 * );
 *
 * @example
 * // With only user context
 * const sourceLanguage = detectSourceLanguageFromContext(user, null);
 *
 * @example
 * // With override only
 * const sourceLanguage = detectSourceLanguageFromContext(null, null, 'fr');
 */
export function detectSourceLanguageFromContext(
  user: UserForLanguageDetection | null | undefined,
  account: AccountForLanguageDetection | null | undefined,
  override?: string
): SupportedLanguage {
  return detectSourceLanguage({ user, account, override });
}
