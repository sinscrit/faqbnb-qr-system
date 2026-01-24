/**
 * @fileoverview Guest Language Detection Utility for Epic 4 - Guest Experience
 *
 * This module provides language detection and preference management for unauthenticated
 * users (guests) viewing shared items. It implements a priority-based detection system
 * that respects user preferences while gracefully falling back to sensible defaults.
 *
 * @description
 * Guest language detection flow:
 * 1. Guests access items via QR codes or direct links
 * 2. System detects preferred language from URL param, cookie, or browser settings
 * 3. Translated content is served when available
 * 4. Preference is persisted in cookie for future visits
 *
 * **Important Distinction:**
 * - Authenticated users use `/src/lib/i18n/language-detection.ts` and `FAQBNB_LANG` cookie
 * - Guests use this module and `FAQBNB_GUEST_LANG` cookie to avoid conflicts
 *
 * This separation ensures that when a guest later authenticates, their guest cookie
 * does not interfere with their account preference.
 *
 * @module lib/i18n/guest-language
 * @since Epic 4 - Guest Experience
 * @see /src/lib/i18n/language-detection.ts - For authenticated user language detection
 * @see /src/types/l10n.ts - SupportedLanguage type definition
 *
 * @example
 * ```typescript
 * // Server-side (middleware/server components)
 * import { detectGuestLanguage, setGuestLanguageCookie } from '@/lib/i18n';
 *
 * const language = detectGuestLanguage(request);
 * setGuestLanguageCookie(language, response);
 *
 * // Client-side (React components/hooks)
 * import { detectGuestLanguageClient } from '@/lib/i18n';
 *
 * const language = detectGuestLanguageClient();
 * ```
 *
 * **Edge Cases:**
 * - Malformed Accept-Language headers fail gracefully to default 'en'
 * - Blocked cookies result in default 'en' with no preference persistence
 * - Unsupported languages (zh, ja, ar, etc.) return null from mapToSupportedLanguage
 *
 * Last Modified: 2026-01-23 17:25
 */

import type { SupportedLanguage } from '@/types/l10n';
import { SUPPORTED_LANGUAGES } from '@/types/l10n';
import { NextRequest, NextResponse } from 'next/server';

// =============================================================================
// Section 1: Cookie Constants
// =============================================================================

/**
 * Cookie name for guest language preferences.
 *
 * This is intentionally different from `FAQBNB_LANG` (used for authenticated users)
 * to prevent conflicts when guests later authenticate. The separate cookie ensures
 * that guest preferences do not overwrite account preferences.
 *
 * @constant
 * @since Epic 4 - Guest Experience
 * @see FAQBNB_LANG - Cookie for authenticated users in /src/lib/i18n/config.ts
 */
export const GUEST_LANG_COOKIE_NAME = 'FAQBNB_GUEST_LANG';

/**
 * Maximum age for the guest language cookie in seconds.
 *
 * Set to 1 year (365 days) for long-term preference persistence.
 * Guests who return after extended periods will still see their preferred language.
 *
 * @constant
 * @default 31536000 (365 * 24 * 60 * 60)
 * @since Epic 4 - Guest Experience
 */
export const GUEST_LANG_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

/**
 * Cookie path for guest language preferences.
 *
 * Set to '/' to make the cookie available across the entire site.
 * This ensures language preference is maintained regardless of which
 * page the user navigates to.
 *
 * @constant
 * @since Epic 4 - Guest Experience (REQ-E04-015)
 */
export const GUEST_LANG_COOKIE_PATH = '/';

/**
 * SameSite attribute for guest language cookie.
 *
 * Set to 'Lax' which:
 * - Allows cookies on top-level navigation (shareable links work)
 * - Allows GET requests from same site
 * - Blocks cross-site POST requests (CSRF protection)
 *
 * This is the ideal setting for language preference cookies that
 * need to work with shareable links.
 *
 * @constant
 * @since Epic 4 - Guest Experience (REQ-E04-015)
 */
export const GUEST_LANG_COOKIE_SAMESITE: 'Lax' | 'Strict' | 'None' = 'Lax';

// =============================================================================
// Section 2: Accept-Language Header Parsing
// =============================================================================

/**
 * Internal interface for parsing Accept-Language header entries.
 * @internal
 */
interface LanguageQuality {
  /** The locale/language code (e.g., 'en', 'fr') */
  locale: string;
  /** Quality value from 0 to 1 (default 1.0) */
  quality: number;
}

/**
 * Parses the RFC 7231 Accept-Language header format to extract language preferences.
 *
 * @description
 * The Accept-Language header contains comma-separated language tags with optional
 * quality values (q=0.0 to q=1.0). This function extracts the primary language
 * codes (ignoring regional variants) and sorts them by preference.
 *
 * RFC 7231 format: `<language-tag>;q=<quality>, ...`
 * Example: `fr-FR, fr;q=0.9, en;q=0.8, *;q=0.1`
 *
 * @param header - The Accept-Language header value, or null if not present
 * @returns Array of language codes sorted by quality (highest first), with duplicates removed
 *
 * @example
 * parseAcceptLanguage('fr-FR, fr;q=0.9, en;q=0.8')
 * // Returns: ['fr', 'en']
 *
 * @example
 * parseAcceptLanguage('en-US,en;q=0.9,es;q=0.8')
 * // Returns: ['en', 'es']
 *
 * @example
 * parseAcceptLanguage(null)
 * // Returns: []
 *
 * @example
 * parseAcceptLanguage('')
 * // Returns: []
 *
 * @since Epic 4 - Guest Experience
 */
export function parseAcceptLanguage(header: string | null): string[] {
  if (!header || header.trim() === '') {
    return [];
  }

  const languages: LanguageQuality[] = header
    .split(',')
    .map((lang) => {
      const trimmed = lang.trim();
      const [code, qValue] = trimmed.split(';q=');

      // Extract primary language tag (e.g., 'fr' from 'fr-FR', 'en' from 'en-US')
      const primaryCode = code.split('-')[0].toLowerCase();

      // Parse quality value, default to 1.0 if not specified
      const quality = qValue ? parseFloat(qValue) : 1.0;

      return {
        locale: primaryCode,
        quality: isNaN(quality) ? 0 : quality,
      };
    })
    // Filter out invalid entries: empty locale, wildcard '*', or quality <= 0
    .filter((lang) => lang.locale && lang.locale !== '*' && lang.quality > 0);

  // Sort by quality descending (highest preference first)
  languages.sort((a, b) => b.quality - a.quality);

  // Return unique locales in preference order (remove duplicates)
  const seen = new Set<string>();
  return languages
    .map((l) => l.locale)
    .filter((locale) => {
      if (seen.has(locale)) return false;
      seen.add(locale);
      return true;
    });
}

// =============================================================================
// Section 3: Language Code Mapping
// =============================================================================

/** Set of supported language codes for O(1) lookup */
const supportedLanguageCodes = new Set<string>(
  SUPPORTED_LANGUAGES.map((lang) => lang.code)
);

/**
 * Type guard to validate if a string is a supported language code.
 *
 * @description
 * This function validates cookie values and URL parameters against the
 * application's supported languages. It performs a case-sensitive check
 * against the exact language codes: 'en', 'fr', 'es', 'de', 'nl', 'it'.
 *
 * Note: For more flexible matching that handles regional variants (e.g., 'en-US')
 * and case variations, use `mapToSupportedLanguage()` instead.
 *
 * @param value - The string to validate
 * @returns True if the value is a valid SupportedLanguage, false otherwise
 *
 * @example
 * isSupportedLanguage('en')  // true
 * isSupportedLanguage('fr')  // true
 * isSupportedLanguage('EN')  // false (case-sensitive)
 * isSupportedLanguage('zh')  // false (not supported)
 * isSupportedLanguage('')    // false (empty string)
 *
 * @since Epic 4 - Guest Experience (REQ-E04-015)
 */
export function isSupportedLanguage(value: string): value is SupportedLanguage {
  return supportedLanguageCodes.has(value);
}

/**
 * Maps browser-specific language codes to the application's supported base languages.
 *
 * @description
 * This function acts as a type guard, validating that a language code is one of
 * our supported languages. It handles:
 * - Direct matches (e.g., 'en', 'fr', 'es', 'de', 'nl', 'it')
 * - Regional variants (e.g., 'en-US' → 'en', 'fr-CA' → 'fr')
 * - Case variations (e.g., 'EN-us' → 'en')
 * - Underscore separators (e.g., 'en_US' → 'en')
 *
 * @param code - The language code to map (from browser, URL param, etc.)
 * @returns The mapped SupportedLanguage if valid, or null if unsupported
 *
 * @example
 * // Direct matches
 * mapToSupportedLanguage('en')   // Returns: 'en'
 * mapToSupportedLanguage('fr')   // Returns: 'fr'
 *
 * @example
 * // Regional variants
 * mapToSupportedLanguage('en-US')  // Returns: 'en'
 * mapToSupportedLanguage('fr-CA')  // Returns: 'fr'
 * mapToSupportedLanguage('de-DE')  // Returns: 'de'
 *
 * @example
 * // Case-insensitivity
 * mapToSupportedLanguage('EN-us')  // Returns: 'en'
 * mapToSupportedLanguage('FR')     // Returns: 'fr'
 *
 * @example
 * // Unsupported languages
 * mapToSupportedLanguage('zh-CN')  // Returns: null
 * mapToSupportedLanguage('ja')     // Returns: null
 * mapToSupportedLanguage('ar')     // Returns: null
 *
 * @since Epic 4 - Guest Experience
 */
export function mapToSupportedLanguage(code: string): SupportedLanguage | null {
  if (!code) return null;

  // Normalize: lowercase and trim whitespace
  const normalized = code.toLowerCase().trim();

  // Check for direct match first
  if (supportedLanguageCodes.has(normalized)) {
    return normalized as SupportedLanguage;
  }

  // Handle regional variants: split by '-' or '_', take the first part
  const baseLanguage = normalized.split(/[-_]/)[0];

  // Validate the base language is supported
  if (supportedLanguageCodes.has(baseLanguage)) {
    return baseLanguage as SupportedLanguage;
  }

  // Unsupported language
  return null;
}

// =============================================================================
// Section 4: Cookie Utility Functions
// =============================================================================

/**
 * Reads the guest language preference from cookie.
 *
 * @description
 * Works in both server and client contexts:
 * - **Server context**: Pass `NextRequest` to read from request cookies
 * - **Client context**: Omit `request` to read from `document.cookie`
 *
 * The cookie value is validated against supported languages to prevent
 * invalid values from being returned.
 *
 * @param request - Optional NextRequest for server-side reading. Omit for client-side.
 * @returns The validated SupportedLanguage from cookie, or null if not set/invalid
 *
 * @example
 * // Server context (middleware, server components)
 * const lang = getGuestLanguageCookie(request);
 *
 * @example
 * // Client context (React components)
 * const lang = getGuestLanguageCookie();
 *
 * @since Epic 4 - Guest Experience
 */
export function getGuestLanguageCookie(
  request?: NextRequest
): SupportedLanguage | null {
  let cookieValue: string | undefined;

  if (request) {
    // Server context: read from NextRequest cookies
    cookieValue = request.cookies.get(GUEST_LANG_COOKIE_NAME)?.value;
  } else if (typeof window !== 'undefined') {
    // Client context: parse document.cookie
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === GUEST_LANG_COOKIE_NAME) {
        cookieValue = decodeURIComponent(value);
        break;
      }
    }
  }

  // Validate the cookie value is a supported language
  if (cookieValue) {
    return mapToSupportedLanguage(cookieValue);
  }

  return null;
}

/**
 * Sets the guest language preference cookie.
 *
 * @description
 * Works in both server and client contexts:
 * - **Server context**: Pass `NextResponse` to set cookie on response
 * - **Client context**: Omit `response` to set via `document.cookie`
 *
 * Cookie configuration:
 * - `Path=/` - Available site-wide
 * - `Max-Age=1 year` - Long-term persistence
 * - `SameSite=Lax` - CSRF protection while allowing normal navigation
 * - `Secure` - HTTPS only in production
 * - `httpOnly=false` - **Intentional** to allow client-side language switcher access
 *
 * @param language - The SupportedLanguage to persist
 * @param response - Optional NextResponse for server-side setting. Omit for client-side.
 *
 * @example
 * // Server context (middleware)
 * const response = NextResponse.next();
 * setGuestLanguageCookie('fr', response);
 *
 * @example
 * // Client context (language switcher component)
 * setGuestLanguageCookie('es');
 *
 * @since Epic 4 - Guest Experience
 */
export function setGuestLanguageCookie(
  language: SupportedLanguage,
  response?: NextResponse
): void {
  if (response) {
    // Server context: set via NextResponse cookies
    response.cookies.set({
      name: GUEST_LANG_COOKIE_NAME,
      value: language,
      maxAge: GUEST_LANG_COOKIE_MAX_AGE,
      path: '/',
      httpOnly: false, // Allow client-side access for language switcher
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  } else if (typeof window !== 'undefined') {
    // Client context: set via document.cookie
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${GUEST_LANG_COOKIE_NAME}=${language}; Path=/; Max-Age=${GUEST_LANG_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
  }
}

/**
 * Removes the guest language preference cookie.
 *
 * @description
 * Works in both server and client contexts:
 * - **Server context**: Pass `NextResponse` to delete cookie from response
 * - **Client context**: Omit `response` to clear via `document.cookie`
 *
 * Useful when resetting to default behavior or when user explicitly clears preferences.
 *
 * @param response - Optional NextResponse for server-side clearing. Omit for client-side.
 *
 * @example
 * // Server context
 * clearGuestLanguageCookie(response);
 *
 * @example
 * // Client context
 * clearGuestLanguageCookie();
 *
 * @since Epic 4 - Guest Experience
 */
export function clearGuestLanguageCookie(response?: NextResponse): void {
  if (response) {
    // Server context: delete via NextResponse cookies
    response.cookies.delete(GUEST_LANG_COOKIE_NAME);
  } else if (typeof window !== 'undefined') {
    // Client context: expire cookie immediately
    document.cookie = `${GUEST_LANG_COOKIE_NAME}=; Path=/; Max-Age=0`;
  }
}

// =============================================================================
// Section 5: Server-Side Language Detection
// =============================================================================

/**
 * Detects the guest's preferred language from a server-side request.
 *
 * @description
 * Implements a priority cascade for language detection:
 *
 * **Priority 1: URL Parameter** (highest)
 * Check for `?lang=xx` in URL or explicitly passed `urlParam`
 *
 * **Priority 2: Cookie**
 * Check for persisted preference in `FAQBNB_GUEST_LANG` cookie
 *
 * **Priority 3: Accept-Language Header**
 * Parse browser's Accept-Language header for first supported match
 *
 * **Priority 4: Default** (lowest)
 * Fall back to 'en' (English) as the default language
 *
 * All detection steps are logged with `[i18n]` prefix for debugging.
 *
 * @param request - The incoming Next.js request object
 * @param urlParam - Optional explicit URL parameter value (overrides URL search params)
 * @returns The detected SupportedLanguage - always returns a valid language, never null
 *
 * @example
 * // Basic usage in middleware
 * export function middleware(request: NextRequest) {
 *   const language = detectGuestLanguage(request);
 *   // language is guaranteed to be a valid SupportedLanguage
 * }
 *
 * @example
 * // With explicit URL parameter override
 * const language = detectGuestLanguage(request, 'fr');
 * // Will return 'fr' if valid, otherwise continue cascade
 *
 * @example
 * // URL parameter from query string
 * // URL: /item/abc?lang=es
 * const language = detectGuestLanguage(request);
 * // Returns 'es'
 *
 * @since Epic 4 - Guest Experience
 * @see detectGuestLanguageClient - For client-side detection
 */
export function detectGuestLanguage(
  request: NextRequest,
  urlParam?: string
): SupportedLanguage {
  // Priority 1: Check explicit URL parameter first
  if (urlParam) {
    const mappedParam = mapToSupportedLanguage(urlParam);
    if (mappedParam) {
      console.log('[i18n] Language detected from URL parameter:', mappedParam);
      return mappedParam;
    }
  }

  // Check URL search params if no explicit urlParam
  const searchParamLang = request.nextUrl.searchParams.get('lang');
  if (searchParamLang) {
    const mappedSearchParam = mapToSupportedLanguage(searchParamLang);
    if (mappedSearchParam) {
      console.log('[i18n] Language detected from URL parameter:', mappedSearchParam);
      return mappedSearchParam;
    }
  }

  // Priority 2: Check cookie for persisted preference
  const cookieLang = getGuestLanguageCookie(request);
  if (cookieLang) {
    console.log('[i18n] Language detected from guest cookie:', cookieLang);
    return cookieLang;
  }

  // Priority 3: Parse Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  const headerLocales = parseAcceptLanguage(acceptLanguage);

  for (const locale of headerLocales) {
    const mappedLocale = mapToSupportedLanguage(locale);
    if (mappedLocale) {
      console.log('[i18n] Language detected from Accept-Language header:', mappedLocale);
      return mappedLocale;
    }
  }

  // Priority 4: Default fallback
  console.log('[i18n] Using default language for guest:', 'en');
  return 'en';
}

// =============================================================================
// Section 6: Client-Side Language Detection
// =============================================================================

/**
 * Detects the guest's preferred language from a client-side (browser) context.
 *
 * @description
 * Implements a priority cascade adapted for browser environment:
 *
 * **Priority 1: URL Parameter**
 * Check for `?lang=xx` in current URL or explicit `urlParam`
 *
 * **Priority 2: Cookie**
 * Check for persisted preference in `FAQBNB_GUEST_LANG` cookie
 *
 * **Priority 3: Browser Language**
 * Check `navigator.language` and `navigator.languages` for supported match
 *
 * **Priority 4: Default**
 * Fall back to 'en' (English)
 *
 * **SSR Safety:**
 * This function is safe to call during SSR. If `window` is undefined,
 * it returns the default 'en'. For SSR contexts, use `detectGuestLanguage()`
 * with the server request instead.
 *
 * @param urlParam - Optional explicit URL parameter value
 * @returns The detected SupportedLanguage - always returns a valid language, never null
 *
 * @example
 * // In a React hook
 * const [language, setLanguage] = useState(() => detectGuestLanguageClient());
 *
 * @example
 * // With URL parameter override
 * const language = detectGuestLanguageClient('fr');
 *
 * @example
 * // In useEffect for client-side detection
 * useEffect(() => {
 *   const detected = detectGuestLanguageClient();
 *   setLanguage(detected);
 * }, []);
 *
 * @since Epic 4 - Guest Experience
 * @see detectGuestLanguage - For server-side detection
 */
export function detectGuestLanguageClient(urlParam?: string): SupportedLanguage {
  // SSR safety: return default if window is not available
  if (typeof window === 'undefined') {
    return 'en';
  }

  // Priority 1: Check explicit URL parameter first
  if (urlParam) {
    const mappedParam = mapToSupportedLanguage(urlParam);
    if (mappedParam) {
      return mappedParam;
    }
  }

  // Check URL search params from current location
  const searchParams = new URLSearchParams(window.location.search);
  const searchParamLang = searchParams.get('lang');
  if (searchParamLang) {
    const mappedSearchParam = mapToSupportedLanguage(searchParamLang);
    if (mappedSearchParam) {
      return mappedSearchParam;
    }
  }

  // Priority 2: Check cookie for persisted preference
  const cookieLang = getGuestLanguageCookie();
  if (cookieLang) {
    return cookieLang;
  }

  // Priority 3: Check browser language preferences
  // First try navigator.language (primary preference)
  if (navigator.language) {
    const mappedNavLang = mapToSupportedLanguage(navigator.language);
    if (mappedNavLang) {
      return mappedNavLang;
    }
  }

  // Then try navigator.languages array (fallback)
  if (navigator.languages && navigator.languages.length > 0) {
    for (const lang of navigator.languages) {
      const mappedLang = mapToSupportedLanguage(lang);
      if (mappedLang) {
        return mappedLang;
      }
    }
  }

  // Priority 4: Default fallback
  return 'en';
}
