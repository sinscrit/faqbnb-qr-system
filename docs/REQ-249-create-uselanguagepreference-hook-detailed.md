# REQ-249: Create useLanguagePreference Hook - Detailed Task Breakdown

**Generated:** 2026-01-18 19:30:00 UTC
**Last Modified:** 2026-01-18 21:45:00 UTC
**Overview Document:** REQ-249-create-uselanguagepreference-hook-overview.md
**Implementation Plan:** Plan-110-L10N-Epic1-Foundation.md
**Phase:** 5 - Language Switching Infrastructure
**Task ID:** 5.4
**Status:** Implementation Complete

---

## Executive Summary

This document provides a granular, step-by-step breakdown of implementing the `useLanguagePreference` hook for Request #249. The hook provides a unified interface for React components to read and update language preferences with authentication-aware persistence strategies.

**Total Tasks:** 12 tasks
**Estimated Effort:** ~1.5 hours
**Complexity:** Medium

---

## Prerequisites

Before starting implementation, verify:

- [x] AuthContext is available and working (`src/contexts/AuthContext.tsx`)
- [x] Existing hook patterns are understood (`useDashboardPreferences.ts`, `useActiveProperty.ts`)
- [x] API endpoint for language preferences (`/api/user/language`) will be created in REQ-251 (may not exist yet)
- [x] Supported languages are confirmed: `en`, `fr`, `es`, `de`, `nl`, `it`

---

## Task Breakdown

### Task 5.4.1: Create Hook File with 'use client' Directive and Imports

**Description:** Create the new hook file with proper client directive and React imports

**File:** `/src/hooks/useLanguagePreference.ts`

**Actions:**
1. Create new file `/src/hooks/useLanguagePreference.ts`
2. Add `'use client';` directive as first line
3. Add React imports: `useState`, `useEffect`, `useCallback`
4. Add AuthContext import: `useAuth` from `@/contexts/AuthContext`

**Code to Write:**
```typescript
// src/hooks/useLanguagePreference.ts
// REQ-249: Language Preference Management Hook
// Created: 2026-01-18
// Last Modified: 2026-01-18

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
```

**Verification:**
- [x] File exists at `/src/hooks/useLanguagePreference.ts`
- [x] File starts with `'use client';` directive
- [x] All imports are valid (no TypeScript errors)

**Story Points:** 1

---

### Task 5.4.2: Define Type Constants and Supported Languages

**Description:** Add type definitions for supported languages and related constants

**File:** `/src/hooks/useLanguagePreference.ts` (append)

**Actions:**
1. Define `SUPPORTED_LANGUAGES` constant array with all 6 languages
2. Export `SupportedLanguage` type derived from the array
3. Define `DEFAULT_LANGUAGE` constant as `'en'`
4. Define storage key constants for localStorage and cookie

**Code to Write:**
```typescript
// ============ Constants ============

export const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
export const LANGUAGE_STORAGE_KEY = 'faqbnb_language_preference';
export const LANGUAGE_COOKIE_NAME = 'FAQBNB_LANG';
export const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds
```

**Verification:**
- [x] `SupportedLanguage` type is correctly derived from array
- [x] All 6 languages are included: en, fr, es, de, nl, it
- [x] Constants follow existing naming patterns (prefixed with `faqbnb_` or `FAQBNB_`)

**Story Points:** 1

---

### Task 5.4.3: Define Language Metadata Interface and Options

**Description:** Add language option interface with display names and optional flags

**File:** `/src/hooks/useLanguagePreference.ts` (append)

**Actions:**
1. Define `LanguageOption` interface with code, name, nativeName, flag
2. Create `LANGUAGE_OPTIONS` array with metadata for all 6 languages
3. Export both the interface and the array

**Code to Write:**
```typescript
// ============ Language Metadata ============

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;        // English name
  nativeName: string;  // Native name
  flag?: string;       // Optional emoji flag
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
];
```

**Verification:**
- [x] Each language has correct native name with proper accents
- [x] Flag emojis display correctly
- [x] Interface exports properly

**Story Points:** 1

---

### Task 5.4.4: Implement Validation Utility Function

**Description:** Create type guard function to validate language codes

**File:** `/src/hooks/useLanguagePreference.ts` (append)

**Actions:**
1. Create `isSupportedLanguage` type guard function
2. Function should return `true` only for valid language codes
3. Function should work as TypeScript type narrowing guard

**Code to Write:**
```typescript
// ============ Validation Utilities ============

/**
 * Type guard to check if a value is a valid supported language
 */
export function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  return typeof value === 'string' &&
         SUPPORTED_LANGUAGES.includes(value as SupportedLanguage);
}
```

**Verification:**
- [x] `isSupportedLanguage('en')` returns `true`
- [x] `isSupportedLanguage('invalid')` returns `false`
- [x] `isSupportedLanguage(123)` returns `false`
- [x] TypeScript narrows type after check

**Story Points:** 1

---

### Task 5.4.5: Implement Cookie Utility Functions

**Description:** Create functions to get and set the language cookie for middleware integration

**File:** `/src/hooks/useLanguagePreference.ts` (append)

**Actions:**
1. Create `setLanguageCookie` function with SSR guard
2. Create `getLanguageFromCookie` function with SSR guard
3. Use proper cookie format with path, expires, SameSite attributes

**Code to Write:**
```typescript
// ============ Cookie Utilities ============

/**
 * Set the language preference cookie
 * Used by middleware to detect language preference on subsequent requests
 */
function setLanguageCookie(language: SupportedLanguage): void {
  if (typeof document === 'undefined') return;

  const expires = new Date();
  expires.setTime(expires.getTime() + COOKIE_MAX_AGE * 1000);
  document.cookie = `${LANGUAGE_COOKIE_NAME}=${language};path=/;expires=${expires.toUTCString()};SameSite=Lax`;
}

/**
 * Get language preference from cookie
 */
function getLanguageFromCookie(): SupportedLanguage | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === LANGUAGE_COOKIE_NAME && isSupportedLanguage(value)) {
      return value;
    }
  }
  return null;
}
```

**Verification:**
- [x] Cookie is set with correct name `FAQBNB_LANG`
- [x] Cookie has 1-year expiration
- [x] Cookie is readable after being set
- [x] SSR guard prevents errors during server-side rendering

**Story Points:** 1

---

### Task 5.4.6: Implement LocalStorage Utility Functions

**Description:** Create functions to persist language preference in localStorage for guest users

**File:** `/src/hooks/useLanguagePreference.ts` (append)

**Actions:**
1. Create `getStoredLanguage` function with SSR guard and error handling
2. Create `setStoredLanguage` function with SSR guard and error handling
3. Follow patterns from `useDashboardPreferences.ts`

**Code to Write:**
```typescript
// ============ LocalStorage Utilities ============

/**
 * Get language preference from localStorage (for guests)
 * Returns null if not found or invalid
 */
function getStoredLanguage(): SupportedLanguage | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && isSupportedLanguage(stored)) {
      return stored;
    }
  } catch (error) {
    console.warn('[useLanguagePreference] Failed to read from localStorage:', error);
  }
  return null;
}

/**
 * Save language preference to localStorage (for guests)
 */
function setStoredLanguage(language: SupportedLanguage): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.warn('[useLanguagePreference] Failed to write to localStorage:', error);
  }
}
```

**Verification:**
- [x] Language is stored with correct key `faqbnb_language_preference`
- [x] Invalid stored values return `null`
- [x] Errors are caught and logged (private browsing mode handling)
- [x] SSR guard prevents errors during server-side rendering

**Story Points:** 1

---

### Task 5.4.7: Implement Browser Language Detection

**Description:** Create function to detect user's preferred language from browser settings

**File:** `/src/hooks/useLanguagePreference.ts` (append)

**Actions:**
1. Create `detectBrowserLanguage` function
2. Read from `navigator.language` or `navigator.userLanguage`
3. Extract primary language code (e.g., `en-US` -> `en`)
4. Return default if not supported

**Code to Write:**
```typescript
// ============ Browser Detection ============

/**
 * Detect browser's preferred language from navigator
 * Returns the first supported language or default
 */
function detectBrowserLanguage(): SupportedLanguage {
  if (typeof navigator === 'undefined') return DEFAULT_LANGUAGE;

  // Try navigator.language first, then userLanguage (for older IE)
  const browserLang = navigator.language || (navigator as { userLanguage?: string }).userLanguage;
  if (!browserLang) return DEFAULT_LANGUAGE;

  // Extract the primary language code (e.g., 'en-US' -> 'en')
  const primaryLang = browserLang.split('-')[0].toLowerCase();

  if (isSupportedLanguage(primaryLang)) {
    return primaryLang;
  }

  return DEFAULT_LANGUAGE;
}
```

**Verification:**
- [x] Returns correct language for `navigator.language = 'fr-FR'`
- [x] Returns default for unsupported languages like `'zh-CN'`
- [x] Handles undefined navigator (SSR)

**Story Points:** 1

---

### Task 5.4.8: Define Hook Return Interface

**Description:** Create the TypeScript interface for the hook's return value

**File:** `/src/hooks/useLanguagePreference.ts` (append)

**Actions:**
1. Define `UseLanguagePreferenceReturn` interface
2. Include all required properties per acceptance criteria
3. Document each property with JSDoc comments

**Code to Write:**
```typescript
// ============ Hook Interface ============

export interface UseLanguagePreferenceReturn {
  /** Current active language preference */
  language: SupportedLanguage;

  /** Update the language preference (async for API calls) */
  setLanguage: (language: SupportedLanguage) => Promise<void>;

  /** Loading state during initial preference retrieval */
  isLoading: boolean;

  /** Saving state during preference update */
  isSaving: boolean;

  /** Error message if preference operation fails, null otherwise */
  error: string | null;

  /** Clear any error state */
  clearError: () => void;

  /** List of supported languages with metadata */
  supportedLanguages: readonly LanguageOption[];

  /** Whether user is authenticated (determines persistence strategy) */
  isAuthenticated: boolean;
}
```

**Verification:**
- [x] Interface matches acceptance criteria from REQ-249
- [x] All properties have JSDoc documentation
- [x] Types are correctly defined

**Story Points:** 1

---

### Task 5.4.9: Implement Hook State and Initialization Logic

**Description:** Implement the main hook function with state initialization

**File:** `/src/hooks/useLanguagePreference.ts` (append)

**Actions:**
1. Create the `useLanguagePreference` function
2. Get auth context with `useAuth`
3. Initialize state variables: `language`, `isLoading`, `isSaving`, `error`
4. Implement initialization useEffect to load preference from appropriate source

**Code to Write:**
```typescript
/**
 * Hook for managing language preference with automatic persistence.
 *
 * For authenticated users: preference is saved to the database via API
 * For guests: preference is saved to localStorage
 *
 * The hook also updates the FAQBNB_LANG cookie for middleware to use.
 *
 * @example
 * ```tsx
 * const { language, setLanguage, isLoading } = useLanguagePreference();
 *
 * if (isLoading) return <Spinner />;
 *
 * return (
 *   <select value={language} onChange={(e) => setLanguage(e.target.value)}>
 *     ...
 *   </select>
 * );
 * ```
 */
export function useLanguagePreference(): UseLanguagePreferenceReturn {
  const { user, authState } = useAuth();
  const isAuthenticated = !!user && authState === 'AUTHENTICATED';

  // State
  const [language, setLanguageState] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============ Initialize Language on Mount ============

  useEffect(() => {
    const initializeLanguage = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let detectedLanguage: SupportedLanguage = DEFAULT_LANGUAGE;

        // Priority 1: Cookie (set by middleware or previous session)
        const cookieLanguage = getLanguageFromCookie();
        if (cookieLanguage) {
          detectedLanguage = cookieLanguage;
        }
        // Priority 2: localStorage (for guests)
        else {
          const storedLanguage = getStoredLanguage();
          if (storedLanguage) {
            detectedLanguage = storedLanguage;
          }
          // Priority 3: Browser preference
          else {
            detectedLanguage = detectBrowserLanguage();
          }
        }

        // For authenticated users, try to fetch from API (authoritative source)
        if (isAuthenticated && user?.id) {
          try {
            const response = await fetch('/api/user/language');
            if (response.ok) {
              const data = await response.json();
              if (data.language && isSupportedLanguage(data.language)) {
                detectedLanguage = data.language;
              }
            }
          } catch (apiError) {
            // Non-fatal: API may not be ready (REQ-251), use detected language
            console.log('[useLanguagePreference] API fetch failed, using detected language');
          }
        }

        setLanguageState(detectedLanguage);

        // Ensure cookie and localStorage are in sync
        setLanguageCookie(detectedLanguage);
        if (!isAuthenticated) {
          setStoredLanguage(detectedLanguage);
        }

      } catch (initError) {
        console.error('[useLanguagePreference] Initialization error:', initError);
        setLanguageState(DEFAULT_LANGUAGE);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, [isAuthenticated, user?.id]);
```

**Verification:**
- [x] Hook reads from AuthContext successfully
- [x] Initial loading state is `true`
- [x] Priority order: cookie -> localStorage -> browser -> default
- [x] API call is attempted only for authenticated users
- [x] API errors don't break initialization

**Story Points:** 2

---

### Task 5.4.10: Implement setLanguage Function

**Description:** Implement the language update function with optimistic updates and rollback

**File:** `/src/hooks/useLanguagePreference.ts` (continue inside hook)

**Actions:**
1. Create `setLanguage` callback function with `useCallback`
2. Validate input is a supported language
3. Implement optimistic UI update
4. Save to API (authenticated) or localStorage (guest)
5. Update cookie for middleware
6. Implement rollback on error
7. Dispatch custom event for UI synchronization

**Code to Write:**
```typescript
  // ============ Set Language Function ============

  const setLanguage = useCallback(async (newLanguage: SupportedLanguage): Promise<void> => {
    if (!isSupportedLanguage(newLanguage)) {
      setError(`Invalid language: ${newLanguage}`);
      return;
    }

    // Optimistically update UI
    const previousLanguage = language;
    setLanguageState(newLanguage);
    setError(null);
    setIsSaving(true);

    try {
      // Always update cookie for middleware
      setLanguageCookie(newLanguage);

      if (isAuthenticated) {
        // Save to database via API for authenticated users
        const response = await fetch('/api/user/language', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ language: newLanguage }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to save language preference');
        }

        console.log('[useLanguagePreference] Language saved to database:', newLanguage);
      } else {
        // Save to localStorage for guests
        setStoredLanguage(newLanguage);
        console.log('[useLanguagePreference] Language saved to localStorage:', newLanguage);
      }

      // Dispatch custom event for other components to react
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('languageChange', {
          detail: { language: newLanguage }
        }));
      }

    } catch (saveError) {
      console.error('[useLanguagePreference] Save error:', saveError);

      // Rollback optimistic update on error
      setLanguageState(previousLanguage);
      setLanguageCookie(previousLanguage);

      setError(saveError instanceof Error ? saveError.message : 'Failed to save language preference');
    } finally {
      setIsSaving(false);
    }
  }, [language, isAuthenticated]);
```

**Verification:**
- [x] Invalid languages are rejected with error
- [x] Optimistic update occurs immediately
- [x] Authenticated users save to API
- [x] Guest users save to localStorage
- [x] Cookie is always updated
- [x] Rollback works on API error
- [x] Custom event is dispatched

**Story Points:** 2

---

### Task 5.4.11: Implement clearError and Return Object

**Description:** Add the clearError function and construct the return object

**File:** `/src/hooks/useLanguagePreference.ts` (continue inside hook)

**Actions:**
1. Create `clearError` callback function
2. Construct and return the hook value object
3. Close the hook function

**Code to Write:**
```typescript
  // ============ Clear Error Function ============

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============ Return Hook Value ============

  return {
    language,
    setLanguage,
    isLoading,
    isSaving,
    error,
    clearError,
    supportedLanguages: LANGUAGE_OPTIONS,
    isAuthenticated,
  };
}

export default useLanguagePreference;
```

**Verification:**
- [x] `clearError` sets error to null
- [x] Return object matches `UseLanguagePreferenceReturn` interface
- [x] `supportedLanguages` references `LANGUAGE_OPTIONS` constant
- [x] Default export is provided

**Story Points:** 1

---

### Task 5.4.12: Manual Testing and Verification

**Description:** Verify the hook works correctly in all scenarios

**File:** N/A (testing)

**Actions:**
1. Test guest user initial load (no cookie, no localStorage)
2. Test guest user language change persistence
3. Test authenticated user initial load
4. Test authenticated user language change (API call)
5. Test error recovery (API failure)
6. Test browser language detection fallback
7. Test SSR compatibility (no hydration errors)

**Test Scenarios:**

**Scenario 1: Guest User - First Visit**
```
1. Clear all cookies and localStorage
2. Open app in browser with locale set to 'de-DE'
3. Import and use hook in a test component
4. Verify: language = 'de' (detected from browser)
5. Verify: localStorage has 'faqbnb_language_preference' = 'de'
6. Verify: Cookie FAQBNB_LANG = 'de'
```

**Scenario 2: Guest User - Language Change**
```
1. Continue from Scenario 1
2. Call setLanguage('fr')
3. Verify: language = 'fr'
4. Verify: isSaving = true briefly, then false
5. Verify: localStorage updated to 'fr'
6. Verify: Cookie updated to 'fr'
7. Verify: 'languageChange' event dispatched
```

**Scenario 3: Authenticated User - API Save**
```
1. Log in as authenticated user
2. Call setLanguage('es')
3. Verify: API call to PUT /api/user/language
4. Verify: Cookie updated to 'es'
5. Verify: localStorage NOT updated (DB is authoritative)
```

**Scenario 4: Error Recovery**
```
1. Simulate API failure (network offline or 500 error)
2. Call setLanguage('it')
3. Verify: Optimistic update to 'it'
4. Verify: After error, rollback to previous language
5. Verify: error state has message
6. Call clearError()
7. Verify: error = null
```

**Scenario 5: SSR Compatibility**
```
1. Build app with next build
2. Start with next start
3. Navigate to page using hook
4. Verify: No hydration mismatch warnings
5. Verify: No "window is not defined" errors
```

**Verification Checklist:**
- [x] Guest user: browser detection works
- [x] Guest user: localStorage persistence works
- [x] Authenticated user: API call made on change
- [x] Cookie updated in all cases
- [x] Error rollback works correctly
- [x] clearError function works
- [x] No SSR/hydration issues
- [x] TypeScript compilation successful
- [x] No console errors

**Story Points:** 2

---

## Complete File Structure

After implementation, the file should have this structure:

```
/src/hooks/useLanguagePreference.ts
├── 'use client' directive
├── Imports (React, AuthContext)
├── Constants
│   ├── SUPPORTED_LANGUAGES
│   ├── DEFAULT_LANGUAGE
│   ├── LANGUAGE_STORAGE_KEY
│   ├── LANGUAGE_COOKIE_NAME
│   └── COOKIE_MAX_AGE
├── Language Metadata
│   ├── LanguageOption interface
│   └── LANGUAGE_OPTIONS array
├── Validation Utilities
│   └── isSupportedLanguage()
├── Cookie Utilities
│   ├── setLanguageCookie()
│   └── getLanguageFromCookie()
├── LocalStorage Utilities
│   ├── getStoredLanguage()
│   └── setStoredLanguage()
├── Browser Detection
│   └── detectBrowserLanguage()
├── Hook Interface
│   └── UseLanguagePreferenceReturn
├── Main Hook
│   ├── useLanguagePreference()
│   ├── State initialization
│   ├── useEffect (initialization)
│   ├── setLanguage callback
│   └── clearError callback
└── Default export
```

---

## Dependencies and Integration Points

### Required Dependencies (already in project)
- React (useState, useEffect, useCallback)
- AuthContext (`@/contexts/AuthContext`)

### API Integration (REQ-251)
- `GET /api/user/language` - Fetch user's language preference
- `PUT /api/user/language` - Update user's language preference

**Note:** If REQ-251 is not yet implemented, the hook will gracefully fall back to cookie/localStorage detection. API errors are non-fatal.

### Consumers of This Hook
- `LanguageSwitcher` component (REQ-248)
- Any component needing language-aware behavior

---

## Acceptance Criteria Mapping

| Criteria from REQ-249 | Task |
|-----------------------|------|
| Hook exposes current language preference value | Task 5.4.9, 5.4.11 |
| Hook exposes function to update preference | Task 5.4.10 |
| Authenticated users: saved to database | Task 5.4.10 |
| Guest users: saved to localStorage | Task 5.4.10 |
| Hook provides loading state | Task 5.4.9, 5.4.11 |
| Hook provides error state | Task 5.4.8, 5.4.10, 5.4.11 |
| Preference updates trigger re-renders | Task 5.4.10 (setState calls) |
| Initializes from appropriate source | Task 5.4.9 |
| Falls back to browser locale | Task 5.4.7, 5.4.9 |

---

## Rollback Plan

If issues arise after deployment:

1. **Immediate:** Comment out API calls in `setLanguage` function, fall back to localStorage-only
2. **Short-term:** Revert the entire file and remove imports in consuming components
3. **Data:** Cookie and localStorage data is non-critical, can be cleared without impact

**No database changes are made by this hook** - database changes are handled by the API endpoint (REQ-251).

---

## Summary

| Task | Description | Story Points |
|------|-------------|--------------|
| 5.4.1 | Create file with imports | 1 |
| 5.4.2 | Define constants and types | 1 |
| 5.4.3 | Define language metadata | 1 |
| 5.4.4 | Implement validation | 1 |
| 5.4.5 | Implement cookie utilities | 1 |
| 5.4.6 | Implement localStorage utilities | 1 |
| 5.4.7 | Implement browser detection | 1 |
| 5.4.8 | Define hook return interface | 1 |
| 5.4.9 | Implement hook state and init | 2 |
| 5.4.10 | Implement setLanguage | 2 |
| 5.4.11 | Implement clearError and return | 1 |
| 5.4.12 | Manual testing | 2 |
| **Total** | | **15 SP** |

---

## References

- [Overview Document](/docs/REQ-249-create-uselanguagepreference-hook-overview.md)
- [Implementation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
- [Pattern Reference: useDashboardPreferences](/src/hooks/useDashboardPreferences.ts)
- [Pattern Reference: useActiveProperty](/src/hooks/useActiveProperty.ts)
- [AuthContext](/src/contexts/AuthContext.tsx)

---

*Detailed task breakdown generated for FAQBNB Localization Epic 1 - Foundation (Phase 5, Task 5.4)*
