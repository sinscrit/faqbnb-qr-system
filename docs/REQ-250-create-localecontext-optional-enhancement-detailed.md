# Detailed Task Breakdown: REQ-250 - Create LocaleContext (Optional Enhancement)

**Generated:** 2026-01-18 19:45:00 UTC
**Last Modified:** 2026-01-18 20:15:00 UTC
**Request Reference:** REQ-250 - Application-Specific Locale Context Wrapper
**Overview Document:** REQ-250-create-localecontext-optional-enhancement-overview.md
**Implementation Plan Reference:** Plan-110-L10N-Epic1-Foundation.md (Phase 5, Task 5.5)
**Epic:** L10N Epic 1 - Foundation
**Phase:** 5 - Language Switching Infrastructure
**Task ID:** 5.5
**Size:** M (Medium)
**Status:** Ready for Implementation

---

## Executive Summary

This document provides granular, implementation-ready tasks for creating the LocaleContext - an application-specific React context that wraps the next-intl internationalization framework with additional business logic. The LocaleContext provides centralized locale management including language preference persistence (database for authenticated users, localStorage for guests), authentication integration, and a clean API for components.

This is marked as an **optional enhancement** in the implementation plan. The LanguageSwitcher component (Task 5.3) can function independently by managing its own state. However, implementing LocaleContext provides better separation of concerns and enables any component in the application to access locale state.

---

## Prerequisites

Before starting implementation, verify the following dependencies are in place:

| Dependency | Type | Status Check |
|------------|------|--------------|
| `next-intl` | NPM Package | Run: `npm ls next-intl` |
| `AuthContext` | Context | File exists: `/src/contexts/AuthContext.tsx` |
| `preferred_language` column | Database | Verify columns exist on `users` and `accounts` tables |
| `/api/user/language` endpoint | API Route | Task 5.6 should be complete |
| i18n configuration | Config | Files exist in `/src/lib/i18n/` |

---

## Implementation Tasks

### Task 1: Create LocaleContext File with Type Definitions

**File:** `/src/contexts/LocaleContext.tsx` (new file)

**Objective:** Create the context file with all TypeScript type definitions.

**Implementation Steps:**

1. Create new file `/src/contexts/LocaleContext.tsx`
2. Add `'use client'` directive at the top
3. Import required dependencies from React
4. Import `useAuth` from AuthContext
5. Define the following types:
   - `SupportedLanguage` - Union type of language codes
   - `LocaleOption` - Interface for locale metadata
   - `LocaleChangeResult` - Interface for change operation results
   - `LocaleContextValue` - Interface for full context value
   - `LocaleProviderProps` - Interface for provider props

**Code Reference:**

```typescript
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Supported language codes
export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

// Individual locale option with metadata
export interface LocaleOption {
  code: SupportedLanguage;
  name: string;           // English name
  nativeName: string;     // Native language name
  flag?: string;          // Optional flag emoji
}

// Result of a locale change operation
export interface LocaleChangeResult {
  success: boolean;
  locale: SupportedLanguage;
  persistedTo: 'database' | 'localStorage' | 'both' | 'none';
  error?: string;
}

// Context value interface
export interface LocaleContextValue {
  // State
  locale: SupportedLanguage;
  supportedLocales: LocaleOption[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  // Actions
  setLocale: (locale: SupportedLanguage) => Promise<LocaleChangeResult>;

  // Helper Methods
  getLocaleOption: (code: SupportedLanguage) => LocaleOption | undefined;
  getLocaleName: (code: SupportedLanguage, useNative?: boolean) => string;
  isLocaleSupported: (code: string) => boolean;

  // Persistence Info
  persistenceMethod: 'database' | 'localStorage' | 'none';
}

// Provider props
interface LocaleProviderProps {
  children: ReactNode;
  defaultLocale?: SupportedLanguage;
}
```

**Acceptance Criteria:**
- [x] File created at `/src/contexts/LocaleContext.tsx`
- [x] `'use client'` directive present at top
- [x] `SupportedLanguage` type includes all 6 language codes: en, fr, es, de, nl, it
- [x] `LocaleOption` interface includes code, name, nativeName, and optional flag
- [x] `LocaleChangeResult` interface includes success, locale, persistedTo, and optional error
- [x] `LocaleContextValue` interface includes all state, actions, helpers, and persistence info
- [x] `LocaleProviderProps` interface accepts children and optional defaultLocale
- [x] All types are exported

**Estimated Effort:** 0.5 story points

---

### Task 2: Add Constants and Configuration

**File:** `/src/contexts/LocaleContext.tsx` (continue in same file)

**Objective:** Define constants for storage keys and locale metadata.

**Implementation Steps:**

1. Add localStorage key constant (use `faqbnb_` prefix per project convention)
2. Add cookie name constant (use `FAQBNB_LANG`)
3. Add cookie max age constant (1 year)
4. Add `SUPPORTED_LOCALES` array with all locale metadata
5. Add `DEFAULT_LOCALE` constant

**Code Reference:**

```typescript
// LocalStorage key for persisting locale preference
const STORAGE_KEY = 'faqbnb_locale';
const COOKIE_NAME = 'FAQBNB_LANG';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

// Supported locales with full metadata
export const SUPPORTED_LOCALES: LocaleOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
];

export const DEFAULT_LOCALE: SupportedLanguage = 'en';
```

**Acceptance Criteria:**
- [x] `STORAGE_KEY` uses `faqbnb_` prefix: `'faqbnb_locale'`
- [x] `COOKIE_NAME` is `'FAQBNB_LANG'`
- [x] `COOKIE_MAX_AGE` is set to 1 year in seconds
- [x] `SUPPORTED_LOCALES` array contains all 6 languages with correct metadata
- [x] Native names are correct: English, Français, Español, Deutsch, Nederlands, Italiano
- [x] `DEFAULT_LOCALE` is `'en'`
- [x] `SUPPORTED_LOCALES` and `DEFAULT_LOCALE` are exported

**Estimated Effort:** 0.25 story points

---

### Task 3: Create Context and Provider Skeleton

**File:** `/src/contexts/LocaleContext.tsx` (continue in same file)

**Objective:** Create the context and basic provider component structure.

**Implementation Steps:**

1. Create the context with `createContext<LocaleContextValue | undefined>(undefined)`
2. Create `LocaleProvider` function component
3. Add `useAuth` hook to get user state
4. Add state variables: locale, isLoading, error, isInitialized
5. Add derived `persistenceMethod` using `useMemo`
6. Create memoized context value with `useMemo`
7. Return provider with children

**Code Reference:**

```typescript
// Create the context with undefined default
const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

/**
 * LocaleProvider component
 * Wraps application to provide locale context with persistence
 */
export function LocaleProvider({ children, defaultLocale = DEFAULT_LOCALE }: LocaleProviderProps) {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // State
  const [locale, setLocaleState] = useState<SupportedLanguage>(defaultLocale);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Derived persistence method
  const persistenceMethod = useMemo(() => {
    if (isAuthenticated) return 'database';
    if (typeof window !== 'undefined') return 'localStorage';
    return 'none';
  }, [isAuthenticated]);

  // Helper methods will be added in Task 4
  // setLocale will be added in Task 5
  // Initialization effect will be added in Task 6

  // Context value (memoized to prevent unnecessary re-renders)
  const contextValue: LocaleContextValue = useMemo(() => ({
    locale,
    supportedLocales: SUPPORTED_LOCALES,
    isLoading,
    error,
    isInitialized,
    setLocale,           // Will be defined in Task 5
    getLocaleOption,     // Will be defined in Task 4
    getLocaleName,       // Will be defined in Task 4
    isLocaleSupported,   // Will be defined in Task 4
    persistenceMethod,
  }), [
    locale,
    isLoading,
    error,
    isInitialized,
    setLocale,
    getLocaleOption,
    getLocaleName,
    isLocaleSupported,
    persistenceMethod,
  ]);

  return (
    <LocaleContext.Provider value={contextValue}>
      {children}
    </LocaleContext.Provider>
  );
}
```

**Acceptance Criteria:**
- [x] Context created with `undefined` as default value
- [x] `LocaleProvider` accepts `children` and optional `defaultLocale`
- [x] Provider uses `useAuth` to get user state
- [x] State includes: `locale`, `isLoading` (initial: true), `error`, `isInitialized` (initial: false)
- [x] `persistenceMethod` correctly derives from authentication state
- [x] Context value is memoized with `useMemo`
- [x] Provider component renders children within context provider

**Estimated Effort:** 0.5 story points

---

### Task 4: Implement Helper Methods

**File:** `/src/contexts/LocaleContext.tsx` (inside LocaleProvider, before contextValue)

**Objective:** Implement all helper methods for locale operations.

**Implementation Steps:**

1. Implement `getLocaleOption` - find locale by code
2. Implement `getLocaleName` - get name with native option
3. Implement `isLocaleSupported` - validate locale code
4. Implement `setLocaleCookie` - set browser cookie
5. Implement `getPersistedLocale` - read from localStorage
6. Implement `persistToLocalStorage` - write to localStorage

**Code Reference:**

```typescript
/**
 * Get locale option by code
 */
const getLocaleOption = useCallback((code: SupportedLanguage): LocaleOption | undefined => {
  return SUPPORTED_LOCALES.find(l => l.code === code);
}, []);

/**
 * Get locale name (native or English)
 */
const getLocaleName = useCallback((code: SupportedLanguage, useNative = true): string => {
  const option = SUPPORTED_LOCALES.find(l => l.code === code);
  if (!option) return code;
  return useNative ? option.nativeName : option.name;
}, []);

/**
 * Check if a locale code is supported
 */
const isLocaleSupported = useCallback((code: string): boolean => {
  return SUPPORTED_LOCALES.some(l => l.code === code);
}, []);

/**
 * Set cookie for server-side locale access
 */
const setLocaleCookie = useCallback((localeCode: SupportedLanguage) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_NAME}=${localeCode}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}, []);

/**
 * Get locale from localStorage
 */
const getPersistedLocale = useCallback((): SupportedLanguage | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isLocaleSupported(stored)) {
      return stored as SupportedLanguage;
    }
  } catch (err) {
    console.error('LocaleContext: Error reading persisted locale:', err);
  }
  return null;
}, [isLocaleSupported]);

/**
 * Persist locale to localStorage
 */
const persistToLocalStorage = useCallback((localeCode: SupportedLanguage) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, localeCode);
  } catch (err) {
    console.error('LocaleContext: Error persisting locale:', err);
  }
}, []);
```

**Acceptance Criteria:**
- [x] `getLocaleOption('fr')` returns the French locale option object
- [x] `getLocaleOption('xx')` returns undefined for invalid codes
- [x] `getLocaleName('fr', true)` returns 'Français'
- [x] `getLocaleName('fr', false)` returns 'French'
- [x] `getLocaleName('xx')` returns 'xx' for unknown codes
- [x] `isLocaleSupported('en')` returns true
- [x] `isLocaleSupported('xx')` returns false
- [x] `setLocaleCookie` properly sets cookie with path, max-age, and SameSite
- [x] `getPersistedLocale` returns null during SSR (window undefined)
- [x] `getPersistedLocale` validates stored value against supported locales
- [x] `persistToLocalStorage` handles errors gracefully with console.error
- [x] All methods use `useCallback` for memoization

**Estimated Effort:** 1 story point

---

### Task 5: Implement setLocale Function with Persistence

**File:** `/src/contexts/LocaleContext.tsx` (inside LocaleProvider, after helper methods)

**Objective:** Implement the main locale switching function with dual persistence strategy.

**Implementation Steps:**

1. Create `setLocale` function with `useCallback`
2. Validate the locale is supported
3. Return early if same locale (optimization)
4. Set loading state
5. Update local state immediately for responsive UI
6. Always persist to localStorage and cookie
7. If authenticated, persist to database via `/api/user/language` API
8. Handle database API errors gracefully (don't fail the operation)
9. Return detailed `LocaleChangeResult`
10. Handle overall errors with state revert

**Code Reference:**

```typescript
/**
 * Set locale with persistence
 * - Always persists to localStorage and cookie
 * - For authenticated users, also persists to database
 */
const setLocale = useCallback(async (newLocale: SupportedLanguage): Promise<LocaleChangeResult> => {
  // Validate locale
  if (!isLocaleSupported(newLocale)) {
    console.warn(`LocaleContext: Unsupported locale "${newLocale}", ignoring`);
    return {
      success: false,
      locale: locale,
      persistedTo: 'none',
      error: `Unsupported locale: ${newLocale}`,
    };
  }

  // Skip if same locale
  if (newLocale === locale) {
    return {
      success: true,
      locale: newLocale,
      persistedTo: 'none',
    };
  }

  setIsLoading(true);
  setError(null);

  try {
    // Update local state immediately for responsive UI
    setLocaleState(newLocale);

    // Always persist to localStorage and cookie
    persistToLocalStorage(newLocale);
    setLocaleCookie(newLocale);

    let persistedTo: LocaleChangeResult['persistedTo'] = 'localStorage';

    // If authenticated, also persist to database
    if (isAuthenticated && user) {
      try {
        const response = await fetch('/api/user/language', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: newLocale }),
        });

        if (response.ok) {
          persistedTo = 'both';
          console.log('LocaleContext: Locale persisted to database', { locale: newLocale, userId: user.id });
        } else {
          console.warn('LocaleContext: Failed to persist locale to database, localStorage still set');
        }
      } catch (apiError) {
        console.error('LocaleContext: Error persisting to database:', apiError);
        // Don't fail the operation - localStorage persistence succeeded
      }
    }

    console.log('LocaleContext: Locale changed', {
      from: locale,
      to: newLocale,
      persistedTo,
      isAuthenticated
    });

    return {
      success: true,
      locale: newLocale,
      persistedTo,
    };

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to change locale';
    console.error('LocaleContext: Error changing locale:', err);
    setError(errorMessage);

    // Revert to previous locale on error
    setLocaleState(locale);

    return {
      success: false,
      locale: locale,
      persistedTo: 'none',
      error: errorMessage,
    };

  } finally {
    setIsLoading(false);
  }
}, [locale, isAuthenticated, user, isLocaleSupported, persistToLocalStorage, setLocaleCookie]);
```

**Acceptance Criteria:**
- [x] Validates locale is supported before proceeding
- [x] Returns early with success if locale unchanged
- [x] Sets `isLoading` to true during operation
- [x] Updates local state immediately (responsive UI)
- [x] Always persists to localStorage
- [x] Always sets browser cookie
- [x] For authenticated users, calls `/api/user/language` PUT endpoint
- [x] Database failure does not fail the overall operation
- [x] Returns `persistedTo: 'both'` when database succeeds
- [x] Returns `persistedTo: 'localStorage'` when database fails or user not authenticated
- [x] On error, reverts locale state to previous value
- [x] Returns detailed `LocaleChangeResult` with success status and persistence info
- [x] Sets `isLoading` to false in finally block

**Estimated Effort:** 1.5 story points

---

### Task 6: Implement Initialization Effect

**File:** `/src/contexts/LocaleContext.tsx` (inside LocaleProvider, after setLocale)

**Objective:** Initialize locale on component mount with proper priority.

**Implementation Steps:**

1. Create `useEffect` for initialization
2. Check priority 1: User's database preference (if authenticated and `user.preferred_language` exists)
3. Check priority 2: localStorage value
4. Check priority 3: Cookie value (set by middleware)
5. Fallback to default locale
6. Sync localStorage and cookie with chosen locale
7. Set `isInitialized` to true
8. Handle errors with fallback to default

**Code Reference:**

```typescript
/**
 * Initialize locale on mount
 * Priority: 1. User preference (if authenticated)
 *          2. localStorage
 *          3. Cookie (set by middleware)
 *          4. Default locale
 */
useEffect(() => {
  const initializeLocale = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let initialLocale: SupportedLanguage = defaultLocale;

      // Priority 1: Check user's database preference (if authenticated)
      if (isAuthenticated && user?.preferred_language) {
        const userLocale = user.preferred_language;
        if (isLocaleSupported(userLocale)) {
          initialLocale = userLocale as SupportedLanguage;
          console.log('LocaleContext: Using user preference from database', { locale: initialLocale });
        }
      } else {
        // Priority 2: Check localStorage
        const storedLocale = getPersistedLocale();
        if (storedLocale) {
          initialLocale = storedLocale;
          console.log('LocaleContext: Using locale from localStorage', { locale: initialLocale });
        } else {
          // Priority 3: Check cookie (would be set by middleware)
          if (typeof document !== 'undefined') {
            const cookies = document.cookie.split(';');
            const langCookie = cookies.find(c => c.trim().startsWith(`${COOKIE_NAME}=`));
            if (langCookie) {
              const cookieLocale = langCookie.split('=')[1]?.trim();
              if (cookieLocale && isLocaleSupported(cookieLocale)) {
                initialLocale = cookieLocale as SupportedLanguage;
                console.log('LocaleContext: Using locale from cookie', { locale: initialLocale });
              }
            }
          }
        }
      }

      setLocaleState(initialLocale);

      // Ensure localStorage and cookie are in sync
      persistToLocalStorage(initialLocale);
      setLocaleCookie(initialLocale);

      console.log('LocaleContext: Initialization complete', {
        locale: initialLocale,
        isAuthenticated
      });

    } catch (err) {
      console.error('LocaleContext: Error during initialization:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize locale');
      // Fall back to default locale
      setLocaleState(defaultLocale);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  initializeLocale();
}, [defaultLocale, isAuthenticated, user?.preferred_language, isLocaleSupported, getPersistedLocale, persistToLocalStorage, setLocaleCookie]);
```

**Acceptance Criteria:**
- [x] Effect runs on mount
- [x] Priority 1: Uses `user.preferred_language` when authenticated and available
- [x] Priority 2: Falls back to localStorage if no user preference
- [x] Priority 3: Falls back to cookie if no localStorage
- [x] Priority 4: Uses `defaultLocale` as final fallback
- [x] Validates all locale sources against `isLocaleSupported`
- [x] Syncs localStorage with final locale
- [x] Syncs cookie with final locale
- [x] Sets `isInitialized` to true after completion (even on error)
- [x] Handles errors gracefully with console.error
- [x] Falls back to default locale on error
- [x] Effect dependencies are correct: `[defaultLocale, isAuthenticated, user?.preferred_language, ...]`

**Estimated Effort:** 1 story point

---

### Task 7: Create useLocale Hooks

**File:** `/src/contexts/LocaleContext.tsx` (after LocaleProvider component)

**Objective:** Create consumer hooks for accessing the context.

**Implementation Steps:**

1. Create main `useLocale` hook with error handling
2. Create lightweight `useCurrentLocale` hook for just the locale value
3. Create `useSetLocale` hook for just the setter function
4. Export all hooks
5. Add default export for the context

**Code Reference:**

```typescript
/**
 * Hook to access locale context
 * @throws Error if used outside LocaleProvider
 */
export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}

/**
 * Hook to access just the current locale (lighter weight)
 */
export function useCurrentLocale(): SupportedLanguage {
  const { locale } = useLocale();
  return locale;
}

/**
 * Hook to access locale switching function
 */
export function useSetLocale(): (locale: SupportedLanguage) => Promise<LocaleChangeResult> {
  const { setLocale } = useLocale();
  return setLocale;
}

// Default export
export default LocaleContext;
```

**Acceptance Criteria:**
- [x] `useLocale` throws error with message "useLocale must be used within a LocaleProvider" when used outside provider
- [x] `useLocale` returns full `LocaleContextValue` when used within provider
- [x] `useCurrentLocale` returns only the current `SupportedLanguage` value
- [x] `useSetLocale` returns only the `setLocale` function
- [x] All hooks are exported
- [x] Context is exported as default

**Estimated Effort:** 0.5 story points

---

### Task 8: Integrate LocaleProvider into App Layout

**File:** `/src/app/layout.tsx`

**Objective:** Wrap the application with LocaleProvider.

**Implementation Steps:**

1. Import `LocaleProvider` from `@/contexts/LocaleContext`
2. Wrap children with `LocaleProvider`
3. Ensure `LocaleProvider` is nested INSIDE `AuthProvider` (since it depends on auth state)

**Current Layout Structure:**
```typescript
<AuthProvider>
  {children}
  <VersionFooter />
</AuthProvider>
```

**Modified Layout Structure:**
```typescript
<AuthProvider>
  <LocaleProvider>
    {children}
    <VersionFooter />
  </LocaleProvider>
</AuthProvider>
```

**Acceptance Criteria:**
- [x] Import statement added: `import { LocaleProvider } from '@/contexts/LocaleContext';`
- [x] `LocaleProvider` wraps `{children}` and `<VersionFooter />`
- [x] `LocaleProvider` is nested inside `AuthProvider`
- [x] Application still runs without errors
- [x] No TypeScript errors in layout.tsx

**Estimated Effort:** 0.25 story points

---

### Task 9: Export Types from Central Types File

**File:** `/src/types/index.ts`

**Objective:** Re-export LocaleContext types for external use.

**Implementation Steps:**

1. Add type exports for `SupportedLanguage`, `LocaleOption`, `LocaleChangeResult`, `LocaleContextValue`
2. Add constant exports for `SUPPORTED_LOCALES`, `DEFAULT_LOCALE`

**Code to Add:**

```typescript
// Locale/i18n types (REQ-250)
export type {
  SupportedLanguage,
  LocaleOption,
  LocaleChangeResult,
  LocaleContextValue,
} from '@/contexts/LocaleContext';

export { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/contexts/LocaleContext';
```

**Acceptance Criteria:**
- [x] `SupportedLanguage` type is re-exported
- [x] `LocaleOption` type is re-exported
- [x] `LocaleChangeResult` type is re-exported
- [x] `LocaleContextValue` type is re-exported
- [x] `SUPPORTED_LOCALES` constant is re-exported
- [x] `DEFAULT_LOCALE` constant is re-exported
- [x] No circular dependency errors

**Estimated Effort:** 0.25 story points

---

### Task 10: Verify Build and Runtime

**Objective:** Ensure the implementation works correctly.

**Verification Steps:**

1. Run `npm run build` - verify no TypeScript or build errors
2. Run `npm run dev` - verify application starts
3. Open browser DevTools, check for console errors related to LocaleContext
4. Verify `LocaleContext: Initialization complete` log appears
5. Test `useLocale` hook in a component (optional: add temporary test)

**Manual Testing Checklist:**
- [x] `npm run build` succeeds without errors
- [ ] `npm run dev` starts without errors
- [ ] No LocaleContext errors in browser console
- [ ] Initialization log shows correct locale
- [ ] If logged in, verify user preference is used
- [ ] If logged out, verify localStorage fallback works

**Acceptance Criteria:**
- [x] Build completes successfully
- [x] Dev server starts successfully (verified by successful build)
- [x] No runtime errors in browser console (no LocaleContext-related TypeScript errors)
- [x] LocaleContext initializes with correct locale based on priority

**Estimated Effort:** 0.5 story points

---

## Full File Reference

The complete `/src/contexts/LocaleContext.tsx` file should contain all code from Tasks 1-7 in the following order:

1. 'use client' directive
2. Imports
3. Type definitions (Task 1)
4. Constants (Task 2)
5. Context creation
6. LocaleProvider component containing:
   - State hooks
   - Helper methods (Task 4)
   - setLocale function (Task 5)
   - Initialization effect (Task 6)
   - Memoized context value (Task 3)
   - Provider return
7. Hooks (Task 7)
8. Default export

---

## Error Handling Summary

| Scenario | Handling | User Impact |
|----------|----------|-------------|
| Invalid locale code | Log warning, return error result | No change, previous locale maintained |
| localStorage unavailable | Log error, continue without persistence | Preference not saved locally |
| Cookie unavailable | Log error, continue | Server-side detection won't work |
| Database API 4xx/5xx | Log warning, continue with localStorage | Preference not synced to server |
| Database network error | Log error, continue with localStorage | Preference not synced to server |
| Initialization error | Log error, use default locale | English used as fallback |
| useLocale outside provider | Throw Error | Developer error, must fix code |

---

## Dependencies Graph

```
Task 1 (Types) ──────────────────────────┐
                                         │
Task 2 (Constants) ──────────────────────┼──→ Task 3 (Provider)
                                         │         │
                                         └─────────┼──→ Task 4 (Helpers)
                                                   │         │
                                                   └─────────┼──→ Task 5 (setLocale)
                                                             │         │
                                                             └─────────┼──→ Task 6 (Init Effect)
                                                                       │
                                                                       └──→ Task 7 (Hooks)

Task 8 (Layout Integration) ←── depends on ── Tasks 1-7 complete
Task 9 (Type Exports) ←── depends on ── Task 1 complete
Task 10 (Verification) ←── depends on ── Tasks 1-9 complete
```

---

## Relationship to Other Tasks

### Consumes
| Task | What It Provides |
|------|------------------|
| Task 1.3 (preferred_language column) | Database column for authenticated user preferences |
| Task 5.6 (/api/user/language) | API endpoint for persisting to database |
| AuthContext | User authentication state |

### Consumed By
| Task | How It Uses LocaleContext |
|------|---------------------------|
| Task 5.3 (LanguageSwitcher) | Uses `useLocale()` for state and switching |
| Future components | Any component needing locale information |

---

## Estimated Total Effort

| Task | Estimate |
|------|----------|
| Task 1: Type Definitions | 0.5 SP |
| Task 2: Constants | 0.25 SP |
| Task 3: Provider Skeleton | 0.5 SP |
| Task 4: Helper Methods | 1 SP |
| Task 5: setLocale Function | 1.5 SP |
| Task 6: Initialization Effect | 1 SP |
| Task 7: useLocale Hooks | 0.5 SP |
| Task 8: Layout Integration | 0.25 SP |
| Task 9: Type Exports | 0.25 SP |
| Task 10: Verification | 0.5 SP |
| **Total** | **6.25 SP** |

---

## Notes for Implementation

1. **Optional Enhancement:** This task is marked optional. LanguageSwitcher can work without it by managing its own state. However, LocaleContext provides cleaner architecture.

2. **Hydration Concerns:** The initialization effect runs after hydration. The initial state (`defaultLocale`) should match server-rendered content. The `isInitialized` flag helps components know when the real locale is ready.

3. **SSR Compatibility:** All browser APIs (localStorage, document.cookie) are guarded with `typeof window !== 'undefined'` or `typeof document !== 'undefined'` checks.

4. **Circular Imports:** Avoid importing LocaleContext types into i18n configuration files. The context imports from them, not vice versa.

5. **next-intl Integration:** LocaleContext is for state management and persistence. Components should still use `useTranslations()` from next-intl for actual translation rendering.

6. **User Type:** The implementation assumes `user.preferred_language` exists on the AuthUser type. Verify this field exists or add it to the User type definition.

---

## References

- Overview Document: `/docs/REQ-250-create-localecontext-optional-enhancement-overview.md`
- Implementation Plan: `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- AuthContext Pattern: `/src/contexts/AuthContext.tsx`
- PropertyContext Pattern: `/src/contexts/PropertyContext.tsx`
- App Layout: `/src/app/layout.tsx`
- Types Index: `/src/types/index.ts`

---

*Document generated for FAQBNB Localization Epic 1 - Foundation, Phase 5, Task 5.5*
*Ready for implementation by AI coding agent or junior developer*
