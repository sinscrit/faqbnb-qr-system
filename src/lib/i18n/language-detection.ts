/**
 * Language Detection Utility
 * Determines user's preferred locale using a prioritized cascade of sources.
 *
 * Priority Order:
 * 1. User database preference (authenticated users)
 * 2. Cookie (FAQBNB_LANG)
 * 3. Accept-Language HTTP header
 * 4. Default locale ('en')
 *
 * REQ-246: Create Language Detection Utility
 * Plan-110: L10N Epic 1 - Foundation, Phase 5, Task 5.1
 *
 * @module lib/i18n/language-detection
 * @created 2026-01-18
 * @lastModified 2026-01-18
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_MAX_AGE,
  DEFAULT_LOCALE,
  isSupportedLocale,
  type SupportedLocale,
} from './config';

// =============================================================================
// Types (Task 5.1.3)
// =============================================================================

/**
 * Minimal user object interface for language detection.
 * Only requires the fields needed for locale detection.
 */
export interface UserLocalePreference {
  /** User's unique identifier */
  id: string;
  /** User's preferred language code, if set */
  preferred_language?: string | null;
}

/**
 * Options for customizing language detection behavior.
 */
export interface DetectLanguageOptions {
  /** Skip database lookup even if user is provided */
  skipDbLookup?: boolean;
  /** Custom cookie name override (defaults to FAQBNB_LANG) */
  cookieName?: string;
}

/**
 * Represents a parsed language preference with quality value.
 * Used internally for Accept-Language header parsing.
 */
interface LanguageQuality {
  /** Language code (e.g., 'en', 'fr') */
  locale: string;
  /** Quality value from 0.0 to 1.0 (default 1.0) */
  quality: number;
}

// =============================================================================
// Helper Functions (Tasks 5.1.4 & 5.1.5)
// =============================================================================

/**
 * Parses the Accept-Language header and returns language codes sorted by preference.
 *
 * The Accept-Language header follows RFC 7231 format:
 * Accept-Language: fr-FR, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5
 *
 * @param acceptLanguage - The Accept-Language header value (may be null)
 * @returns Array of language codes sorted by quality value (highest first)
 *
 * @example
 * parseAcceptLanguageHeader('fr-FR, fr;q=0.9, en;q=0.8')
 * // Returns: ['fr', 'en']
 *
 * @example
 * parseAcceptLanguageHeader(null)
 * // Returns: []
 */
function parseAcceptLanguageHeader(acceptLanguage: string | null): string[] {
  if (!acceptLanguage) {
    return [];
  }

  const languages: LanguageQuality[] = acceptLanguage
    .split(',')
    .map((lang) => {
      const trimmed = lang.trim();
      const [code, qValue] = trimmed.split(';q=');

      // Extract primary language tag (e.g., 'fr' from 'fr-FR')
      const primaryCode = code.split('-')[0].toLowerCase();

      // Parse quality value, default to 1.0 if not specified
      const quality = qValue ? parseFloat(qValue) : 1.0;

      return {
        locale: primaryCode,
        quality: isNaN(quality) ? 0 : quality,
      };
    })
    // Filter out invalid entries (empty locale or wildcard)
    .filter((lang) => lang.locale && lang.locale !== '*' && lang.quality > 0);

  // Sort by quality descending
  languages.sort((a, b) => b.quality - a.quality);

  // Return unique locales in preference order
  const seen = new Set<string>();
  return languages
    .map((l) => l.locale)
    .filter((locale) => {
      if (seen.has(locale)) return false;
      seen.add(locale);
      return true;
    });
}

/**
 * Reads the locale preference from a cookie.
 *
 * @param request - The incoming Next.js request object
 * @param cookieName - Cookie name to read (defaults to FAQBNB_LANG)
 * @returns The locale from cookie if valid and supported, or null
 *
 * @example
 * const locale = getLocaleFromCookie(request);
 * if (locale) {
 *   console.log('User prefers:', locale);
 * }
 */
function getLocaleFromCookie(
  request: NextRequest,
  cookieName: string = LOCALE_COOKIE_NAME
): SupportedLocale | null {
  const cookieValue = request.cookies.get(cookieName)?.value;

  if (cookieValue && isSupportedLocale(cookieValue)) {
    return cookieValue;
  }

  return null;
}

// =============================================================================
// Main Detection Function (Task 5.1.6)
// =============================================================================

/**
 * Detects the user's preferred language using a prioritized cascade.
 *
 * Priority Order:
 * 1. User database preference (if user provided and has preference)
 * 2. Cookie value (FAQBNB_LANG)
 * 3. Accept-Language header (first supported match)
 * 4. Default locale ('en')
 *
 * @param request - The incoming Next.js request object
 * @param user - Optional user object with potential language preference
 * @param options - Detection options for customization
 * @returns The detected locale code (always a supported locale)
 *
 * @example
 * // In middleware
 * const locale = detectUserLanguage(request, authenticatedUser);
 *
 * @example
 * // For unauthenticated request
 * const locale = detectUserLanguage(request);
 */
export function detectUserLanguage(
  request: NextRequest,
  user?: UserLocalePreference | null,
  options?: DetectLanguageOptions
): SupportedLocale {
  const cookieName = options?.cookieName ?? LOCALE_COOKIE_NAME;

  // Priority 1: User database preference
  if (!options?.skipDbLookup && user?.preferred_language) {
    if (isSupportedLocale(user.preferred_language)) {
      console.log('[i18n] Language detected from user preference:', user.preferred_language);
      return user.preferred_language;
    }
    // User has preference but it's not a supported locale - log and continue
    console.log('[i18n] User preference not supported, falling through:', user.preferred_language);
  }

  // Priority 2: Cookie value
  const cookieLocale = getLocaleFromCookie(request, cookieName);
  if (cookieLocale) {
    console.log('[i18n] Language detected from cookie:', cookieLocale);
    return cookieLocale;
  }

  // Priority 3: Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  const headerLocales = parseAcceptLanguageHeader(acceptLanguage);

  for (const locale of headerLocales) {
    if (isSupportedLocale(locale)) {
      console.log('[i18n] Language detected from Accept-Language header:', locale);
      return locale;
    }
  }

  // Priority 4: Default locale
  console.log('[i18n] Using default locale:', DEFAULT_LOCALE);
  return DEFAULT_LOCALE;
}

// =============================================================================
// Cookie Setting Utility (Task 5.1.7)
// =============================================================================

/**
 * Sets the locale cookie on a Next.js response.
 * Use this to persist the user's language preference across requests.
 *
 * @param response - The Next.js response to modify
 * @param locale - The locale to set (must be a supported locale)
 * @param cookieName - Cookie name to use (defaults to FAQBNB_LANG)
 *
 * @example
 * // In middleware
 * const res = NextResponse.next();
 * const locale = detectUserLanguage(req, user);
 * setLocaleCookie(res, locale);
 * return res;
 */
export function setLocaleCookie(
  response: NextResponse,
  locale: SupportedLocale,
  cookieName: string = LOCALE_COOKIE_NAME
): void {
  response.cookies.set({
    name: cookieName,
    value: locale,
    maxAge: LOCALE_COOKIE_MAX_AGE,
    path: '/',
    httpOnly: false, // Allow client-side access for language switcher
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}
