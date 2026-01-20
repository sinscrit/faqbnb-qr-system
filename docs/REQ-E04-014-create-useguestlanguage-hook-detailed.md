# REQ-E04-014: Create useGuestLanguage Hook - Detailed Task Breakdown

**Request ID:** REQ-E04-014
**Title:** Create Guest Language State Management Hook
**Type:** NEW FEATURE
**Size:** M (Medium)
**Phase:** Epic 4 - Guest Experience, Phase 4 - Guest Language Hook
**Task ID:** 4.1

**Created:** 2026-01-20
**Last Modified:** 2026-01-20

---

## Document Purpose

This document provides a granular, step-by-step implementation guide for creating the `useGuestLanguage` React hook. Each task is designed to be a single, atomic unit of work (approximately 1 story point) that can be completed independently and verified.

---

## Prerequisites Checklist

Before starting implementation, verify:

- [ ] Epic 1 Foundation is complete (i18n infrastructure exists)
- [ ] `/src/lib/i18n/config.ts` exists with `SupportedLocale`, `isSupportedLocale()`, `normalizeLocale()`
- [ ] Cookie constants are available: `LOCALE_COOKIE_NAME`, `LOCALE_COOKIE_MAX_AGE`
- [ ] Reference hook exists: `/src/hooks/useLanguagePreference.ts`

---

## Implementation Tasks

### Task 1: Create Hook File with Boilerplate

**File:** `/src/hooks/useGuestLanguage.ts`

**Objective:** Create the hook file with proper structure, header comments, and basic imports.

**Steps:**

1. Create new file at `/src/hooks/useGuestLanguage.ts`
2. Add `'use client'` directive at the top (required for React hooks in Next.js App Router)
3. Add header comment block with:
   - REQ number: REQ-E04-014
   - Description: Guest Language State Management Hook
   - Created date: 2026-01-20
   - Last Modified date: 2026-01-20
4. Add import statements for React hooks: `useState`, `useEffect`, `useCallback`, `useMemo`
5. Add imports from i18n config: `SupportedLocale`, `DEFAULT_LOCALE`, `isSupportedLocale`, `normalizeLocale`, `localeMetadata`, `getAllLocales`, `LOCALE_COOKIE_NAME`, `LOCALE_COOKIE_MAX_AGE`

**Code Template:**

```typescript
// /src/hooks/useGuestLanguage.ts
// REQ-E04-014: Guest Language State Management Hook
// Created: 2026-01-20
// Last Modified: 2026-01-20

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SupportedLocale,
  DEFAULT_LOCALE,
  isSupportedLocale,
  normalizeLocale,
  localeMetadata,
  getAllLocales,
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_MAX_AGE,
  LocaleMetadata,
} from '@/lib/i18n/config';

// Implementation follows...
```

**Verification:**
- [ ] File exists at correct path
- [ ] `'use client'` directive is first line (no blank lines before)
- [ ] All imports resolve without TypeScript errors
- [ ] Header comments include REQ number and dates

---

### Task 2: Define Type Aliases and Constants

**File:** `/src/hooks/useGuestLanguage.ts`

**Objective:** Add type aliases and constants section to maintain consistency with i18n config.

**Steps:**

1. Add section comment: `// ============ Constants ============`
2. Export type alias: `SupportedLanguage` as alias for `SupportedLocale`
3. Export cookie name constant (use `LOCALE_COOKIE_NAME` from config)
4. Export cookie max age constant (use `LOCALE_COOKIE_MAX_AGE` from config)
5. Add section comment: `// ============ Types ============`

**Code:**

```typescript
// ============ Constants ============

/**
 * Cookie name for guest language preference
 * Re-exports from i18n config for convenience
 */
export const GUEST_LANGUAGE_COOKIE_NAME = LOCALE_COOKIE_NAME;

/**
 * Cookie max age in seconds (1 year)
 * Re-exports from i18n config for convenience
 */
export const GUEST_LANGUAGE_COOKIE_MAX_AGE = LOCALE_COOKIE_MAX_AGE;

// ============ Types ============

/**
 * Type alias for supported language codes
 * Provides semantic naming for guest-facing components
 */
export type SupportedLanguage = SupportedLocale;

/**
 * Language option with display metadata
 * Re-exports LocaleMetadata interface as LanguageOption for convenience
 */
export type LanguageOption = LocaleMetadata;
```

**Verification:**
- [ ] `SupportedLanguage` type correctly aliases `SupportedLocale`
- [ ] `LanguageOption` type correctly aliases `LocaleMetadata`
- [ ] Constants match values from `/src/lib/i18n/config.ts`
- [ ] TypeScript compilation succeeds

---

### Task 3: Define Hook Interface Types

**File:** `/src/hooks/useGuestLanguage.ts`

**Objective:** Define the `UseGuestLanguageOptions` and `UseGuestLanguageReturn` interfaces that specify the hook's contract.

**Steps:**

1. Define `UseGuestLanguageOptions` interface with:
   - `initialLanguage?: SupportedLanguage` - Server-detected language
   - `sourceLanguage: SupportedLanguage` - Original content language
   - `availableTranslations: SupportedLanguage[]` - Available translations for content
   - `cookieName?: string` - Optional custom cookie name
   - `cookieMaxAge?: number` - Optional custom cookie expiration

2. Define `UseGuestLanguageReturn` interface with:
   - `currentLanguage: SupportedLanguage` - Selected language
   - `showOriginal: boolean` - Toggle state
   - `displayLanguage: SupportedLanguage` - Effective display language
   - `setLanguage: (language: SupportedLanguage) => void` - Language setter
   - `toggleOriginal: () => void` - Toggle function
   - `hasTranslation: (language: SupportedLanguage) => boolean` - Helper
   - `isLoading: boolean` - Initialization state
   - `supportedLanguages: readonly LanguageOption[]` - All languages

**Code:**

```typescript
/**
 * Options for configuring the useGuestLanguage hook
 */
export interface UseGuestLanguageOptions {
  /** Initial language from server-side detection */
  initialLanguage?: SupportedLanguage;
  /** Source language of the original content */
  sourceLanguage: SupportedLanguage;
  /** Languages that have translations available for this content */
  availableTranslations: SupportedLanguage[];
  /** Cookie name for persistence (optional, defaults to GUEST_LANGUAGE_COOKIE_NAME) */
  cookieName?: string;
  /** Cookie expiration in seconds (optional, defaults to 1 year) */
  cookieMaxAge?: number;
}

/**
 * Return type for the useGuestLanguage hook
 */
export interface UseGuestLanguageReturn {
  /** Currently selected language code */
  currentLanguage: SupportedLanguage;
  /** Whether currently showing original content instead of translation */
  showOriginal: boolean;
  /** Effective display language (considering showOriginal toggle) */
  displayLanguage: SupportedLanguage;
  /** Change the selected language (persists to cookie) */
  setLanguage: (language: SupportedLanguage) => void;
  /** Toggle between translation and original content view */
  toggleOriginal: () => void;
  /** Check if a specific language has a translation available */
  hasTranslation: (language: SupportedLanguage) => boolean;
  /** Whether the hook is still initializing */
  isLoading: boolean;
  /** List of all supported languages with metadata */
  supportedLanguages: readonly LanguageOption[];
}
```

**Verification:**
- [ ] Both interfaces compile without errors
- [ ] JSDoc comments explain each property
- [ ] Optional properties marked with `?`
- [ ] Return type is comprehensive for all component use cases

---

### Task 4: Implement Cookie Utility Functions

**File:** `/src/hooks/useGuestLanguage.ts`

**Objective:** Create private utility functions for reading and writing the guest language cookie.

**Steps:**

1. Add section comment: `// ============ Cookie Utilities ============`
2. Implement `getGuestLanguageFromCookie(): SupportedLanguage | null`
   - Check for SSR safety: `typeof document === 'undefined'`
   - Parse `document.cookie` string
   - Find cookie by name
   - Validate with `isSupportedLocale()`
   - Return validated language or `null`

3. Implement `setGuestLanguageCookie(language: SupportedLanguage, maxAge?: number): void`
   - Check for SSR safety
   - Calculate expiration date
   - Set cookie with path, expiration, and SameSite attributes

**Code:**

```typescript
// ============ Cookie Utilities ============

/**
 * Read guest language preference from cookie
 * @returns Validated language code or null if not found/invalid
 */
function getGuestLanguageFromCookie(cookieName: string = GUEST_LANGUAGE_COOKIE_NAME): SupportedLanguage | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === cookieName) {
      const trimmedValue = value?.trim();
      if (trimmedValue && isSupportedLocale(trimmedValue)) {
        return trimmedValue;
      }
    }
  }
  return null;
}

/**
 * Save guest language preference to cookie
 * @param language - The language code to save
 * @param cookieName - Cookie name (defaults to GUEST_LANGUAGE_COOKIE_NAME)
 * @param maxAge - Cookie max age in seconds (defaults to 1 year)
 */
function setGuestLanguageCookie(
  language: SupportedLanguage,
  cookieName: string = GUEST_LANGUAGE_COOKIE_NAME,
  maxAge: number = GUEST_LANGUAGE_COOKIE_MAX_AGE
): void {
  if (typeof document === 'undefined') return;

  const expires = new Date();
  expires.setTime(expires.getTime() + maxAge * 1000);
  document.cookie = `${cookieName}=${language};path=/;expires=${expires.toUTCString()};SameSite=Lax`;
}
```

**Verification:**
- [ ] SSR safety checks prevent errors during server rendering
- [ ] `getGuestLanguageFromCookie` returns `null` for missing/invalid cookies
- [ ] `setGuestLanguageCookie` sets all required cookie attributes
- [ ] Cookie parsing handles edge cases (whitespace, malformed values)

---

### Task 5: Implement URL Parameter Detection

**File:** `/src/hooks/useGuestLanguage.ts`

**Objective:** Create utility function to read language from URL query parameter.

**Steps:**

1. Add section comment: `// ============ URL Parameter Utility ============`
2. Implement `getLanguageFromURL(): SupportedLanguage | null`
   - Check for SSR safety: `typeof window === 'undefined'`
   - Use `URLSearchParams` to parse `window.location.search`
   - Look for `lang` parameter
   - Validate with `isSupportedLocale()`
   - Return validated language or `null`

**Code:**

```typescript
// ============ URL Parameter Utility ============

/**
 * Read language preference from URL query parameter
 * Supports shareable links like /item/abc123?lang=fr
 * @returns Validated language code or null if not found/invalid
 */
function getLanguageFromURL(): SupportedLanguage | null {
  if (typeof window === 'undefined') return null;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');

    if (langParam && isSupportedLocale(langParam)) {
      return langParam;
    }
  } catch (error) {
    // Silently fail if URL parsing fails
    console.warn('[useGuestLanguage] Failed to parse URL parameters:', error);
  }

  return null;
}
```

**Verification:**
- [ ] SSR safety check prevents errors during server rendering
- [ ] Correctly parses `?lang=fr` query parameter
- [ ] Returns `null` for missing or invalid language codes
- [ ] Handles URL parsing errors gracefully

---

### Task 6: Implement Browser Language Detection

**File:** `/src/hooks/useGuestLanguage.ts`

**Objective:** Create utility function to detect browser's preferred language.

**Steps:**

1. Add section comment: `// ============ Browser Detection ============`
2. Implement `detectBrowserLanguage(): SupportedLanguage`
   - Check for SSR safety: `typeof navigator === 'undefined'`
   - Read `navigator.language` or `navigator.userLanguage`
   - Extract primary language code (e.g., `'en-US'` -> `'en'`)
   - Use `normalizeLocale()` for mapping
   - Return supported language or `DEFAULT_LOCALE`

**Code:**

```typescript
// ============ Browser Detection ============

/**
 * Detect browser's preferred language from navigator
 * @returns The first supported language or default locale
 */
function detectBrowserLanguage(): SupportedLanguage {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE;

  // Try navigator.language first, then userLanguage (for older IE)
  const browserLang = navigator.language || (navigator as { userLanguage?: string }).userLanguage;
  if (!browserLang) return DEFAULT_LOCALE;

  // Use normalizeLocale which handles 'en-US' -> 'en' mapping
  return normalizeLocale(browserLang);
}
```

**Verification:**
- [ ] SSR safety check prevents errors during server rendering
- [ ] Correctly handles regional variants (e.g., `en-US`, `pt-BR`)
- [ ] Falls back to `DEFAULT_LOCALE` when browser language is unsupported
- [ ] Works with `navigator.language` and legacy `navigator.userLanguage`

---

### Task 7: Implement Main Hook Function Shell

**File:** `/src/hooks/useGuestLanguage.ts`

**Objective:** Create the main hook function with state declarations and initial structure.

**Steps:**

1. Add section comment: `// ============ Main Hook ============`
2. Create `useGuestLanguage(options: UseGuestLanguageOptions): UseGuestLanguageReturn`
3. Destructure options: `initialLanguage`, `sourceLanguage`, `availableTranslations`, `cookieName`, `cookieMaxAge`
4. Add state declarations:
   - `currentLanguage` - initialized from `initialLanguage` or `DEFAULT_LOCALE`
   - `showOriginal` - initialized to `false`
   - `isLoading` - initialized to `true`
5. Add placeholder return statement with all interface properties

**Code:**

```typescript
// ============ Main Hook ============

/**
 * Guest language state management hook
 *
 * Provides centralized management of guest language preferences with:
 * - URL parameter detection for shareable links
 * - Cookie persistence across sessions
 * - Browser language detection as fallback
 * - View original toggle for comparing translations
 *
 * @param options - Configuration options
 * @returns Guest language state and control functions
 *
 * @example
 * ```tsx
 * const { currentLanguage, setLanguage, toggleOriginal } = useGuestLanguage({
 *   sourceLanguage: 'en',
 *   availableTranslations: ['fr', 'es', 'de'],
 * });
 * ```
 */
export function useGuestLanguage(options: UseGuestLanguageOptions): UseGuestLanguageReturn {
  const {
    initialLanguage,
    sourceLanguage,
    availableTranslations,
    cookieName = GUEST_LANGUAGE_COOKIE_NAME,
    cookieMaxAge = GUEST_LANGUAGE_COOKIE_MAX_AGE,
  } = options;

  // ============ State ============
  const [currentLanguage, setCurrentLanguageState] = useState<SupportedLanguage>(
    initialLanguage || DEFAULT_LOCALE
  );
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Computed values, effects, and actions will be added in subsequent tasks...

  // Placeholder return (will be completed in later tasks)
  return {
    currentLanguage,
    showOriginal,
    displayLanguage: currentLanguage,
    setLanguage: () => {},
    toggleOriginal: () => {},
    hasTranslation: () => false,
    isLoading,
    supportedLanguages: [],
  };
}

export default useGuestLanguage;
```

**Verification:**
- [ ] Hook function compiles without errors
- [ ] State initialized with correct default values
- [ ] Options destructured with default values for optional props
- [ ] Return type matches `UseGuestLanguageReturn` interface

---

### Task 8: Implement Initialization Effect

**File:** `/src/hooks/useGuestLanguage.ts`

**Objective:** Add useEffect to initialize language preference on mount following detection priority.

**Detection Priority:**
1. URL parameter `?lang=xx` (highest - enables shareable links)
2. Cookie `FAQBNB_LANG` (persisted preference)
3. Browser `Accept-Language` header (auto-detection)
4. Default to `'en'` (fallback)

**Steps:**

1. Add `useEffect` hook after state declarations
2. Implement initialization logic following priority order
3. Update state with detected language
4. Persist detected language to cookie (sync cookie with state)
5. Set `isLoading` to `false` when complete
6. Add dependency array: `[initialLanguage, cookieName, cookieMaxAge]`

**Code:**

```typescript
  // ============ Initialization Effect ============

  useEffect(() => {
    // Skip if running on server
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    let detectedLanguage: SupportedLanguage = initialLanguage || DEFAULT_LOCALE;

    // Priority 1: URL parameter (highest - shareable links)
    const urlLanguage = getLanguageFromURL();
    if (urlLanguage) {
      detectedLanguage = urlLanguage;
    }
    // Priority 2: Cookie (persisted preference)
    else {
      const cookieLanguage = getGuestLanguageFromCookie(cookieName);
      if (cookieLanguage) {
        detectedLanguage = cookieLanguage;
      }
      // Priority 3: Browser language (auto-detection)
      else if (!initialLanguage) {
        detectedLanguage = detectBrowserLanguage();
      }
    }

    // Update state with detected language
    setCurrentLanguageState(detectedLanguage);

    // Sync cookie with detected language (ensures cookie is set for future visits)
    setGuestLanguageCookie(detectedLanguage, cookieName, cookieMaxAge);

    // Mark initialization complete
    setIsLoading(false);
  }, [initialLanguage, cookieName, cookieMaxAge]);
```

**Verification:**
- [ ] URL parameter takes highest priority
- [ ] Cookie is checked when no URL parameter
- [ ] Browser detection used as fallback
- [ ] Cookie is synced after detection
- [ ] `isLoading` becomes `false` after initialization
- [ ] Effect runs only once on mount (or when deps change)

---

### Task 9: Implement setLanguage Function

**File:** `/src/hooks/useGuestLanguage.ts`

**Objective:** Implement the `setLanguage` callback that updates state and persists to cookie.

**Steps:**

1. Create `setLanguage` using `useCallback`
2. Validate language with `isSupportedLocale()`
3. Update state optimistically
4. Persist to cookie
5. Optionally dispatch `languageChange` custom event
6. Add dependencies: `[cookieName, cookieMaxAge]`

**Code:**

```typescript
  // ============ Actions ============

  /**
   * Update the selected language
   * Persists choice to cookie for future visits
   */
  const setLanguage = useCallback((language: SupportedLanguage): void => {
    // Validate input
    if (!isSupportedLocale(language)) {
      console.warn(`[useGuestLanguage] Invalid language: ${language}`);
      return;
    }

    // Update state
    setCurrentLanguageState(language);

    // Persist to cookie
    setGuestLanguageCookie(language, cookieName, cookieMaxAge);

    // Dispatch custom event for other components to react
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('guestLanguageChange', {
        detail: { language }
      }));
    }
  }, [cookieName, cookieMaxAge]);
```

**Verification:**
- [ ] Validates input before updating
- [ ] State updates immediately (optimistic)
- [ ] Cookie is persisted with new language
- [ ] Custom event dispatched for cross-component communication
- [ ] Function is stable (memoized with useCallback)

---

### Task 10: Implement toggleOriginal Function

**File:** `/src/hooks/useGuestLanguage.ts`

**Objective:** Implement the `toggleOriginal` callback that switches between translation and original view.

**Steps:**

1. Create `toggleOriginal` using `useCallback`
2. Toggle `showOriginal` state boolean
3. No persistence required (session-only toggle)
4. Empty dependency array (no external dependencies)

**Code:**

```typescript
  /**
   * Toggle between showing translation and original content
   * This is a session-only toggle - not persisted to cookie
   */
  const toggleOriginal = useCallback((): void => {
    setShowOriginal(prev => !prev);
  }, []);
```

**Verification:**
- [ ] Toggles `showOriginal` state correctly
- [ ] Does NOT persist to cookie (intentional)
- [ ] Function is stable (memoized with useCallback)
- [ ] No side effects beyond state update

---

### Task 11: Implement displayLanguage Computed Value

**File:** `/src/hooks/useGuestLanguage.ts`

**Objective:** Calculate the effective display language based on `showOriginal` toggle state.

**Steps:**

1. Create `displayLanguage` using `useMemo`
2. Return `sourceLanguage` if `showOriginal` is true
3. Return `currentLanguage` otherwise
4. Dependencies: `[showOriginal, sourceLanguage, currentLanguage]`

**Code:**

```typescript
  // ============ Computed Values ============

  /**
   * Effective language being displayed
   * Returns sourceLanguage when viewing original, otherwise currentLanguage
   */
  const displayLanguage = useMemo((): SupportedLanguage => {
    return showOriginal ? sourceLanguage : currentLanguage;
  }, [showOriginal, sourceLanguage, currentLanguage]);
```

**Verification:**
- [ ] Returns `sourceLanguage` when `showOriginal` is true
- [ ] Returns `currentLanguage` when `showOriginal` is false
- [ ] Memoized to prevent unnecessary recalculations
- [ ] Dependencies are complete

---

### Task 12: Implement hasTranslation Helper

**File:** `/src/hooks/useGuestLanguage.ts`

**Objective:** Create helper function to check if a specific language has a translation available.

**Steps:**

1. Create `hasTranslation` using `useCallback`
2. Check if language exists in `availableTranslations` array
3. Dependencies: `[availableTranslations]`

**Code:**

```typescript
  /**
   * Check if a translation exists for a specific language
   * @param language - Language code to check
   * @returns True if translation is available
   */
  const hasTranslation = useCallback((language: SupportedLanguage): boolean => {
    return availableTranslations.includes(language);
  }, [availableTranslations]);
```

**Verification:**
- [ ] Returns `true` for languages in `availableTranslations`
- [ ] Returns `false` for languages not in `availableTranslations`
- [ ] Function is stable (memoized with useCallback)
- [ ] Dependencies include `availableTranslations`

---

### Task 13: Implement supportedLanguages List

**File:** `/src/hooks/useGuestLanguage.ts`

**Objective:** Provide list of all supported languages with metadata.

**Steps:**

1. Create `supportedLanguages` using `useMemo`
2. Call `getAllLocales()` from i18n config
3. Cast to `readonly LanguageOption[]` for type safety
4. Empty dependency array (static data)

**Code:**

```typescript
  /**
   * All supported languages with metadata
   * Used for rendering language selector options
   */
  const supportedLanguages = useMemo((): readonly LanguageOption[] => {
    return getAllLocales();
  }, []);
```

**Verification:**
- [ ] Returns all 6 supported languages
- [ ] Each language has `code`, `name`, `nativeName`, `flag` properties
- [ ] Memoized to prevent unnecessary recalculations
- [ ] Data matches `/src/lib/i18n/config.ts` localeMetadata

---

### Task 14: Assemble Complete Return Object

**File:** `/src/hooks/useGuestLanguage.ts`

**Objective:** Update the return statement with all implemented values and functions.

**Steps:**

1. Update return object with all properties
2. Ensure order matches interface definition
3. Remove placeholder implementations

**Code:**

```typescript
  // ============ Return ============

  return {
    currentLanguage,
    showOriginal,
    displayLanguage,
    setLanguage,
    toggleOriginal,
    hasTranslation,
    isLoading,
    supportedLanguages,
  };
```

**Verification:**
- [ ] All `UseGuestLanguageReturn` properties included
- [ ] No placeholder implementations remain
- [ ] TypeScript compiles without errors
- [ ] Return type matches interface exactly

---

### Task 15: Add Named and Default Exports

**File:** `/src/hooks/useGuestLanguage.ts`

**Objective:** Ensure proper exports for consuming components.

**Steps:**

1. Verify named export exists: `export function useGuestLanguage(...)`
2. Verify default export exists: `export default useGuestLanguage`
3. Verify type exports exist for interfaces

**Code:**

```typescript
// Already in place from Task 7:
export function useGuestLanguage(options: UseGuestLanguageOptions): UseGuestLanguageReturn {
  // ... implementation
}

export default useGuestLanguage;

// Type exports (add at top of file if not already exported):
export type { UseGuestLanguageOptions, UseGuestLanguageReturn };
```

**Verification:**
- [ ] Named import works: `import { useGuestLanguage } from '@/hooks/useGuestLanguage'`
- [ ] Default import works: `import useGuestLanguage from '@/hooks/useGuestLanguage'`
- [ ] Type imports work: `import type { UseGuestLanguageOptions } from '@/hooks/useGuestLanguage'`
- [ ] Constants are exported: `GUEST_LANGUAGE_COOKIE_NAME`, `GUEST_LANGUAGE_COOKIE_MAX_AGE`

---

### Task 16: TypeScript Validation and Build Check

**File:** `/src/hooks/useGuestLanguage.ts`

**Objective:** Verify the implementation compiles without errors.

**Steps:**

1. Run TypeScript compiler: `npx tsc --noEmit`
2. Fix any type errors
3. Run Next.js build: `npm run build`
4. Verify no build errors related to the hook

**Commands:**

```bash
# Check TypeScript compilation
npx tsc --noEmit

# Run Next.js build
npm run build
```

**Verification:**
- [ ] No TypeScript errors
- [ ] No build errors
- [ ] All imports resolve correctly
- [ ] Hook file is properly included in build

---

## Complete Implementation Reference

The final file should have this structure:

```typescript
// /src/hooks/useGuestLanguage.ts
// REQ-E04-014: Guest Language State Management Hook
// Created: 2026-01-20
// Last Modified: 2026-01-20

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SupportedLocale,
  DEFAULT_LOCALE,
  isSupportedLocale,
  normalizeLocale,
  localeMetadata,
  getAllLocales,
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_MAX_AGE,
  LocaleMetadata,
} from '@/lib/i18n/config';

// ============ Constants ============
export const GUEST_LANGUAGE_COOKIE_NAME = LOCALE_COOKIE_NAME;
export const GUEST_LANGUAGE_COOKIE_MAX_AGE = LOCALE_COOKIE_MAX_AGE;

// ============ Types ============
export type SupportedLanguage = SupportedLocale;
export type LanguageOption = LocaleMetadata;

export interface UseGuestLanguageOptions { /* ... Task 3 */ }
export interface UseGuestLanguageReturn { /* ... Task 3 */ }

// ============ Cookie Utilities ============
function getGuestLanguageFromCookie(cookieName?: string): SupportedLanguage | null { /* ... Task 4 */ }
function setGuestLanguageCookie(language: SupportedLanguage, cookieName?: string, maxAge?: number): void { /* ... Task 4 */ }

// ============ URL Parameter Utility ============
function getLanguageFromURL(): SupportedLanguage | null { /* ... Task 5 */ }

// ============ Browser Detection ============
function detectBrowserLanguage(): SupportedLanguage { /* ... Task 6 */ }

// ============ Main Hook ============
export function useGuestLanguage(options: UseGuestLanguageOptions): UseGuestLanguageReturn {
  // State (Task 7)
  // Initialization Effect (Task 8)
  // Computed Values (Task 11, 13)
  // Actions (Task 9, 10, 12)
  // Return (Task 14)
}

export default useGuestLanguage;
```

---

## Testing Checklist

### Unit Tests to Create

| Test Case | Expected Result |
|-----------|-----------------|
| Init with URL param `?lang=fr` | `currentLanguage` is `'fr'` |
| Init with cookie, no URL param | `currentLanguage` from cookie |
| Init with browser language, no cookie/URL | `currentLanguage` from browser |
| Init fallback to default | `currentLanguage` is `'en'` |
| `setLanguage('es')` | State updates, cookie set to `'es'` |
| `toggleOriginal()` when `false` | `showOriginal` becomes `true` |
| `toggleOriginal()` when `true` | `showOriginal` becomes `false` |
| `displayLanguage` with `showOriginal=true` | Returns `sourceLanguage` |
| `displayLanguage` with `showOriginal=false` | Returns `currentLanguage` |
| `hasTranslation('fr')` with `['fr', 'es']` | Returns `true` |
| `hasTranslation('de')` with `['fr', 'es']` | Returns `false` |
| Invalid language to `setLanguage` | State unchanged, warning logged |
| SSR safety | No errors during server rendering |

---

## Acceptance Criteria Verification

| Criteria | Task | Implementation |
|----------|------|----------------|
| Hook exports state for current display language | Tasks 7, 14 | `currentLanguage` in return object |
| Hook exports showOriginal flag | Tasks 7, 14 | `showOriginal` in return object |
| Initial load checks URL parameter | Tasks 5, 8 | `getLanguageFromURL()` in init effect |
| Fallback to cookie when no URL param | Tasks 4, 8 | `getGuestLanguageFromCookie()` in init effect |
| Fallback to browser language | Tasks 6, 8 | `detectBrowserLanguage()` in init effect |
| Default to English | Task 8 | `DEFAULT_LOCALE = 'en'` constant |
| Language change persists to cookie | Tasks 4, 9 | `setGuestLanguageCookie()` in `setLanguage` |
| Toggle affects only showOriginal state | Task 10 | `toggleOriginal` only updates local state |
| SSR compatibility | Tasks 4-6 | `typeof window/document === 'undefined'` checks |
| No unnecessary re-renders | Tasks 9-13 | `useMemo` and `useCallback` optimization |
| Optional configuration params | Tasks 3, 7 | `cookieName`, `cookieMaxAge` in options |
| Export from hooks module | Tasks 14, 15 | Named and default exports |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Hydration mismatch | Use `isLoading` state; defer URL/cookie reads to effect |
| Cookie blocked by browser | Language selector always available; re-detect each visit |
| URL param tampering | Validate with `isSupportedLocale()` |
| Race conditions | State updates are synchronous |
| Missing i18n config | Prerequisites checklist; clear error messages |

---

## References

- **Request:** `/docs/gen_requests_epic4.md` - REQ-E04-014
- **Overview:** `/docs/REQ-E04-014-create-useguestlanguage-hook-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Existing Pattern:** `/src/hooks/useLanguagePreference.ts`
- **i18n Configuration:** `/src/lib/i18n/config.ts`

---

*Document generated: 2026-01-20*
