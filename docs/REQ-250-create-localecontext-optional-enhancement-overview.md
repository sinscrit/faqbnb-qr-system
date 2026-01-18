# Implementation Breakdown: REQ-250 - Create LocaleContext (Optional Enhancement)

**Generated:** 2026-01-18 19:00:00 UTC
**Last Modified:** 2026-01-18 19:00:00 UTC
**Request Reference:** REQ-250 - Application-Specific Locale Context Wrapper
**Implementation Plan Reference:** Plan-110-L10N-Epic1-Foundation.md (Phase 5, Task 5.5)
**Epic:** L10N Epic 1 - Foundation
**Size:** M (Medium)

---

## Overview

This document provides a detailed implementation breakdown for creating the LocaleContext, an application-specific React context that wraps the next-intl internationalization framework with additional business logic. The LocaleContext provides a centralized abstraction layer for all locale-related operations including language preference persistence (database for authenticated users, localStorage for guests), authentication integration, and a clean API for components to interact with locale functionality without direct dependency on the underlying i18n framework.

---

## Technical Context

### Existing Patterns to Follow

| Pattern | Location | Relevance |
|---------|----------|-----------|
| Context Provider Pattern | `/src/contexts/AuthContext.tsx` | Reference for comprehensive context provider with state management, persistence, and error handling |
| Context Provider Pattern | `/src/contexts/PropertyContext.tsx` | Reference for simpler context pattern with localStorage persistence and initialization logic |
| Context Usage with Auth | `/src/contexts/PropertyContext.tsx:16` | Shows how to consume AuthContext within another context provider |
| State Machine Pattern | `/src/contexts/AuthContext.tsx:46-53` | Reference for enum-based state management (AuthState) |
| localStorage Persistence | `/src/contexts/PropertyContext.tsx:54-74` | Reference for persisting/restoring state from localStorage |
| Hook Export Pattern | `/src/contexts/PropertyContext.tsx:192-198` | Reference for useContext hook with error handling |

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| `next-intl` | NPM Package | Must be installed (Phase 2 task) |
| `AuthContext` | Context | Exists - provides user authentication state |
| `useLanguagePreference` hook | Custom Hook | Task 5.4 - provides persistence logic |
| Language preference API endpoint | API Route | Task 5.6 - `/api/user/language` for DB persistence |
| i18n configuration | Config | Should exist from Phase 2 (`/src/lib/i18n/config.ts`) |
| `preferred_language` DB column | Database | Must exist (Phase 1 task) |

### Integration Points

| Component | Integration Type | Notes |
|-----------|------------------|-------|
| `LanguageSwitcher` (Task 5.3) | Consumer | Consumes context for locale state and switching |
| `middleware.ts` | Initialization | Sets initial locale before context hydration |
| `layout.tsx` | Provider Wrapper | Context provider should wrap application |
| API routes | Server-side | May need to access locale from cookies/headers |

---

## Requirements

### Functional Requirements

From REQ-250:
1. Context exposes the current active locale
2. Context exposes the list of available locales for the application
3. Context provides a function to switch between available locales
4. For authenticated users, locale changes are persisted to the user profile in the database
5. For anonymous users, locale changes are persisted to browser local storage
6. Context integrates with the existing authentication system to determine user status
7. Context provides helper methods for common locale operations
8. Context prevents direct component dependency on the underlying internationalization framework
9. Locale switching triggers appropriate re-renders throughout the component tree
10. Context handles loading and error states for persistence operations

### Acceptance Criteria

- [ ] Context exposes the current active locale
- [ ] Context exposes the list of available locales for the application
- [ ] Context provides a function to switch between available locales
- [ ] For authenticated users, locale changes are persisted to the user profile in the database
- [ ] For anonymous users, locale changes are persisted to browser local storage
- [ ] Context integrates with the existing authentication system to determine user status
- [ ] Context provides helper methods for common locale operations
- [ ] Context prevents direct component dependency on the underlying internationalization framework
- [ ] Locale switching triggers appropriate re-renders throughout the component tree
- [ ] Context handles loading and error states for persistence operations

### Supported Languages

| Code | English Name | Native Name |
|------|--------------|-------------|
| `en` | English | English |
| `fr` | French | Français |
| `es` | Spanish | Español |
| `de` | German | Deutsch |
| `nl` | Dutch | Nederlands |
| `it` | Italian | Italiano |

---

## Architecture

### Component Structure

```
/src/contexts/
├── AuthContext.tsx               # Existing - provides user state
├── PropertyContext.tsx           # Existing - reference pattern
└── LocaleContext.tsx             # NEW - locale management context

/src/lib/i18n/
├── config.ts                     # Should exist - locale configuration
├── request.ts                    # Should exist - server-side locale
└── index.ts                      # Should exist - exports barrel
```

### Context Value Interface

```typescript
interface LocaleContextValue {
  // State
  locale: SupportedLanguage;              // Current active locale
  supportedLocales: LocaleOption[];       // All available locales with metadata
  isLoading: boolean;                     // Loading state during locale operations
  error: string | null;                   // Error state for failed operations
  isInitialized: boolean;                 // Whether context has completed initialization

  // Actions
  setLocale: (locale: SupportedLanguage) => Promise<LocaleChangeResult>;

  // Helper Methods
  getLocaleOption: (code: SupportedLanguage) => LocaleOption | undefined;
  getLocaleName: (code: SupportedLanguage, useNative?: boolean) => string;
  isLocaleSupported: (code: string) => boolean;

  // Persistence Info
  persistenceMethod: 'database' | 'localStorage' | 'none';
}
```

### Data Flow

```
Application Load
       │
       ▼
LocaleProvider mounts
       │
       ├── Check AuthContext for user state
       │
       ├── If authenticated → Load preferred_language from user profile
       │                      (or fall back to localStorage/cookie)
       │
       └── If anonymous → Load from localStorage
                          (or fall back to cookie/browser default)
       │
       ▼
Set initial locale state
       │
       ▼
Consumer components render with t() function
       │
       ▼
User changes locale via setLocale()
       │
       ├── Update context state (triggers re-render)
       │
       ├── If authenticated → Save to database via API
       │                      └── /api/user/language (PUT)
       │
       ├── Save to localStorage (always)
       │
       └── Set cookie for server-side access
       │
       ▼
Components re-render with new translations
```

### State Management

The LocaleContext manages the following state:

```typescript
// Core locale state
const [locale, setLocaleState] = useState<SupportedLanguage>('en');
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [isInitialized, setIsInitialized] = useState(false);

// Derived from AuthContext
const { user } = useAuth();
const isAuthenticated = !!user;
```

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/contexts/LocaleContext.tsx` | Main context provider and hook implementation |

### Existing Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/app/layout.tsx` | Wrap application with LocaleProvider (after IntlProvider) |
| `/src/types/index.ts` | Export LocaleContext types for external use |

### Files for Reference Only (Do Not Modify)

| File Path | Purpose |
|-----------|---------|
| `/src/contexts/AuthContext.tsx` | Reference for context provider pattern, state machine, persistence |
| `/src/contexts/PropertyContext.tsx` | Reference for simpler context pattern with localStorage |
| `/src/hooks/useActiveProperty.ts` | Reference for hook patterns |

---

## Implementation Tasks

### Task 1: Create Type Definitions

**Location:** Top section of `/src/contexts/LocaleContext.tsx`

**Implementation:**
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
- [ ] SupportedLanguage type includes all 6 language codes
- [ ] LocaleOption interface includes code, name, nativeName, and optional flag
- [ ] LocaleChangeResult provides feedback on persistence operations
- [ ] LocaleContextValue interface includes all state, actions, and helpers
- [ ] Types are exported for use in other modules

---

### Task 2: Create Constants and Configuration

**Location:** `/src/contexts/LocaleContext.tsx` (after type definitions)

**Implementation:**
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
- [ ] All 6 languages defined with correct native names
- [ ] Storage key follows project naming convention (faqbnb_ prefix)
- [ ] Cookie configuration matches existing patterns
- [ ] Constants are exported for reuse by LanguageSwitcher component

---

### Task 3: Create LocaleContext and Provider

**Location:** `/src/contexts/LocaleContext.tsx`

**Implementation:**
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

  // ... (helper functions and effects defined in subsequent tasks)

  // Context value (memoized to prevent unnecessary re-renders)
  const contextValue: LocaleContextValue = useMemo(() => ({
    locale,
    supportedLocales: SUPPORTED_LOCALES,
    isLoading,
    error,
    isInitialized,
    setLocale,
    getLocaleOption,
    getLocaleName,
    isLocaleSupported,
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
- [ ] Context created with undefined default
- [ ] Provider component accepts children and optional defaultLocale
- [ ] State includes locale, isLoading, error, and isInitialized
- [ ] Context value is memoized to prevent unnecessary re-renders
- [ ] Provider integrates with AuthContext for user state

---

### Task 4: Implement Helper Methods

**Location:** `/src/contexts/LocaleContext.tsx` (inside LocaleProvider)

**Implementation:**
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
- [ ] getLocaleOption returns correct LocaleOption for valid codes
- [ ] getLocaleName returns native or English name based on flag
- [ ] isLocaleSupported validates codes against SUPPORTED_LOCALES
- [ ] setLocaleCookie correctly sets browser cookie with proper attributes
- [ ] getPersistedLocale retrieves and validates localStorage value
- [ ] persistToLocalStorage handles errors gracefully

---

### Task 5: Implement setLocale Function with Persistence

**Location:** `/src/contexts/LocaleContext.tsx` (inside LocaleProvider)

**Implementation:**
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
- [ ] Validates locale before attempting change
- [ ] Returns early if locale is unchanged (optimization)
- [ ] Updates local state immediately for responsive UI
- [ ] Always persists to localStorage and cookie
- [ ] For authenticated users, persists to database via API
- [ ] Database failure doesn't block the overall operation
- [ ] Reverts to previous locale on error
- [ ] Returns detailed result with persistence information

---

### Task 6: Implement Initialization Effect

**Location:** `/src/contexts/LocaleContext.tsx` (inside LocaleProvider)

**Implementation:**
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
- [ ] Checks user database preference first (if authenticated)
- [ ] Falls back to localStorage if no user preference
- [ ] Falls back to cookie if no localStorage value
- [ ] Uses default locale as final fallback
- [ ] Syncs localStorage and cookie with chosen locale
- [ ] Sets isInitialized to true after completion
- [ ] Handles errors gracefully with fallback to default

---

### Task 7: Create useLocale Hook

**Location:** `/src/contexts/LocaleContext.tsx` (after LocaleProvider)

**Implementation:**
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
- [ ] useLocale throws error if used outside provider
- [ ] useCurrentLocale provides lightweight access to just the locale
- [ ] useSetLocale provides access to the setter function
- [ ] All hooks are exported for use by components

---

### Task 8: Integrate LocaleProvider into App Layout

**File:** `/src/app/layout.tsx`

**Modification:**
```typescript
// Add import at top of file
import { LocaleProvider } from '@/contexts/LocaleContext';

// In the layout component, wrap children with LocaleProvider
// The LocaleProvider should be nested INSIDE AuthProvider since it depends on auth state
// and INSIDE NextIntlClientProvider to access i18n functionality

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {/* NextIntlClientProvider should wrap LocaleProvider */}
          <NextIntlClientProvider messages={messages} locale={locale}>
            <LocaleProvider>
              {children}
            </LocaleProvider>
          </NextIntlClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

**Acceptance Criteria:**
- [ ] LocaleProvider is imported in layout.tsx
- [ ] LocaleProvider wraps the application content
- [ ] LocaleProvider is nested inside AuthProvider (accesses user state)
- [ ] LocaleProvider is nested inside NextIntlClientProvider (if present)

---

### Task 9: Export Types from Index

**File:** `/src/types/index.ts`

**Modification:**
```typescript
// Add exports for LocaleContext types
export type {
  SupportedLanguage,
  LocaleOption,
  LocaleChangeResult,
  LocaleContextValue,
} from '@/contexts/LocaleContext';

export { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/contexts/LocaleContext';
```

**Acceptance Criteria:**
- [ ] SupportedLanguage type is exported
- [ ] LocaleOption type is exported
- [ ] LocaleChangeResult type is exported
- [ ] SUPPORTED_LOCALES constant is exported

---

## Error Handling

| Scenario | Handling |
|----------|----------|
| Invalid locale code | Log warning, ignore change, return error result |
| localStorage unavailable | Log error, continue without local persistence |
| Database API failure | Log warning, fall back to localStorage-only persistence |
| Initialization failure | Log error, fall back to default locale |
| Context used outside provider | Throw descriptive error |

---

## Testing Considerations

### Unit Tests
- Provider renders children correctly
- useLocale throws error outside provider
- getLocaleOption returns correct data
- isLocaleSupported validates correctly
- setLocale updates state and persists

### Integration Tests
- Authenticated user: preference loaded from database
- Anonymous user: preference loaded from localStorage
- Locale change persists to correct storage based on auth state
- Context re-renders consumers when locale changes

### Manual Testing
- Change locale while logged in, verify database persistence
- Change locale while logged out, verify localStorage persistence
- Log out and log in, verify locale preference is maintained
- Clear localStorage, verify graceful fallback to default

---

## Dependencies on Other Tasks

| Task | Dependency Type | Notes |
|------|-----------------|-------|
| Task 1.3 (preferred_language column) | Required | Database column must exist for authenticated persistence |
| Task 2.1 (next-intl setup) | Required | IntlProvider must be configured |
| Task 5.4 (useLanguagePreference hook) | Optional | Context could incorporate or replace this hook |
| Task 5.6 (Language preference API) | Required | `/api/user/language` endpoint must exist |

---

## Relationship to LanguageSwitcher (Task 5.3)

The LocaleContext provides the state and actions that LanguageSwitcher consumes:

```typescript
// In LanguageSwitcher component
const { locale, setLocale, supportedLocales, isLoading } = useLocale();

// Render dropdown using supportedLocales
// Call setLocale on selection
// Show loading state during persistence
```

This separation of concerns means:
- **LocaleContext** handles state management and persistence logic
- **LanguageSwitcher** handles UI presentation and user interaction

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Type definitions | 0.5 hours |
| Constants and configuration | 0.25 hours |
| Context and provider skeleton | 0.5 hours |
| Helper methods | 1 hour |
| setLocale with persistence | 1.5 hours |
| Initialization effect | 1 hour |
| useLocale hooks | 0.5 hours |
| Layout integration | 0.5 hours |
| Type exports | 0.25 hours |
| Testing & fixes | 1-2 hours |
| **Total** | **7-9 hours** |

---

## Notes

1. **Optional Enhancement:** This task is marked as optional in the implementation plan. The LanguageSwitcher component can work without LocaleContext by managing its own state. However, LocaleContext provides better separation of concerns and enables other components to access locale state.

2. **Circular Dependency:** Be careful to avoid circular imports between LocaleContext and i18n configuration. The context should import locale constants, not the other way around.

3. **Server Components:** LocaleContext is a client-side context ('use client'). Server components should use the i18n request module for locale detection.

4. **Hydration:** The initialization effect runs after hydration. Ensure the initial locale state matches server-rendered content to avoid hydration mismatches.

5. **Integration with next-intl:** This context wraps next-intl functionality. For the actual translation rendering, components should still use `useTranslations` from next-intl. The LocaleContext handles persistence and state management.

---

## References

- [React Context Documentation](https://react.dev/learn/passing-data-deeply-with-context)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- `/src/contexts/AuthContext.tsx` - Primary reference for context patterns
- `/src/contexts/PropertyContext.tsx` - Reference for localStorage persistence
- Plan-110-L10N-Epic1-Foundation.md - Parent implementation plan
- PRD_L10N_Epic1_Foundation.md - Product requirements

---

*Document generated for FAQBNB Localization Epic 1 - Foundation, Task 5.5*
