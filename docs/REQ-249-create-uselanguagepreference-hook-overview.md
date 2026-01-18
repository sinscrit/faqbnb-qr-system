# REQ-249: Create useLanguagePreference Hook - Implementation Overview

**Generated:** 2026-01-18 18:45:00 UTC
**Last Modified:** 2026-01-18 18:45:00 UTC
**Request Reference:** Task 5.4 from Plan-110-L10N-Epic1-Foundation.md (Phase 5: Language Switching Infrastructure)
**Plan Reference:** Plan-110-L10N-Epic1-Foundation.md
**Status:** Ready for Implementation

---

## 1. Request Summary

Create a custom React hook (`useLanguagePreference`) that provides a unified interface for components to read and update the user's language preference. The hook will:

1. Return the current active language preference
2. Provide a function to update the language preference
3. Handle different persistence strategies based on authentication status:
   - **Authenticated users:** Save preference to the database via API endpoint (Task 5.6)
   - **Guest users:** Save preference to browser localStorage
4. Provide loading and error states for async operations
5. Synchronize with the application's internationalization system (next-intl)
6. Fall back to browser locale detection when no stored preference exists

This hook is a key component of the Language Switching Infrastructure (Phase 5) and will be consumed by the `LanguageSwitcher` component (Task 5.3) and potentially other UI components that need language-aware functionality.

---

## 2. Current State Analysis

### Existing Hook Patterns in Codebase

The codebase has several hooks that demonstrate established patterns for state management with persistence:

#### `useDashboardPreferences.ts` Pattern
- Uses localStorage for persistence
- Provides loading state management
- Uses `useCallback` for memoized setters
- Handles SSR with `typeof window` checks
- Validates stored data before returning

```typescript
// Pattern from useDashboardPreferences.ts
export function useDashboardPreferences(): UseDashboardPreferencesReturn {
  const [preferences, setPreferencesState] = useState<DashboardPreferences>(() =>
    getStoredPreferences()
  );

  useEffect(() => {
    const stored = getStoredPreferences();
    setPreferencesState(stored);
  }, []);

  const setPreference = useCallback(/* ... */);
}
```

#### `useActiveProperty.ts` Pattern
- Combines localStorage with validation
- Provides `isLoading` state
- Handles SSR scenarios
- Uses `useCallback` for persistence operations

```typescript
// Pattern from useActiveProperty.ts
const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  if (typeof window === 'undefined') {
    setIsLoading(false);
    return;
  }
  // Load from storage...
}, []);
```

### Authentication Context

The `AuthContext` provides:
- `user` - Current authenticated user (or null for guests)
- `authState` - State machine for auth status (LOADING, AUTHENTICATED, UNAUTHORIZED, ERROR)
- User ID for API calls when authenticated

### Related L10N Infrastructure (from Plan-110)

| Task | Component | Status | Relationship |
|------|-----------|--------|--------------|
| 5.1 | `detectUserLanguage()` utility | REQ-246 | Provides locale detection logic |
| 5.2 | Middleware language handling | REQ-247 | Sets cookie and x-locale header |
| 5.3 | `LanguageSwitcher` component | REQ-248 | Consumes this hook |
| 5.6 | `/api/user/language` endpoint | REQ-252 | API for persisting authenticated user preference |

---

## 3. Technical Design

### Hook Interface

```typescript
// /src/hooks/useLanguagePreference.ts

export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

export interface UseLanguagePreferenceReturn {
  /** Current active language preference */
  language: SupportedLanguage;

  /** Update the language preference */
  setLanguage: (language: SupportedLanguage) => Promise<void>;

  /** Loading state during initial load or preference update */
  isLoading: boolean;

  /** Error message if preference operation fails */
  error: string | null;

  /** Clear any error state */
  clearError: () => void;

  /** List of supported languages */
  supportedLanguages: SupportedLanguage[];
}

export function useLanguagePreference(): UseLanguagePreferenceReturn;
```

### State Flow Diagram

```
                                +-----------------+
                                |  Component Uses |
                                |     Hook        |
                                +--------+--------+
                                         |
                                         v
                        +----------------+-----------------+
                        |   useLanguagePreference Hook    |
                        +----------------+-----------------+
                                         |
              +------------+-------------+-------------+
              |            |             |             |
              v            v             v             v
        +---------+  +---------+  +-----------+  +----------+
        |  State  |  |  Auth   |  |  Storage  |  |   API    |
        |  Mgmt   |  | Context |  |  (local)  |  | (server) |
        +---------+  +---------+  +-----------+  +----------+
                          |
                          v
              +-----------+------------+
              |    Is Authenticated?   |
              +------------------------+
                    |           |
                    Yes         No
                    |           |
                    v           v
            +------------+ +------------+
            | API Call   | | LocalStorage|
            | to persist | | to persist |
            +------------+ +------------+
```

### Persistence Strategy

| User Type | Read Source | Write Target | Sync Mechanism |
|-----------|-------------|--------------|----------------|
| Authenticated | Database (via API) | Database (via API) + Cookie | API response sets cookie |
| Guest | Cookie/localStorage | localStorage + Cookie | Direct storage write |

### Cookie Integration

The hook will update the `FAQBNB_LANG` cookie when language changes to ensure:
1. Middleware picks up the preference on subsequent requests
2. Server components can read the preference
3. Persistence across browser sessions

---

## 4. Implementation Tasks

### Task 5.4.1: Create Hook File with Type Definitions

**Action:** Create the hook file with type definitions and constants
**File:** `/src/hooks/useLanguagePreference.ts`

```typescript
// src/hooks/useLanguagePreference.ts
// REQ-249: Language Preference Management Hook
// Created: 2026-01-18
// Last Modified: 2026-01-18

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// ============ Constants ============

export const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
export const LANGUAGE_STORAGE_KEY = 'faqbnb_language_preference';
export const LANGUAGE_COOKIE_NAME = 'FAQBNB_LANG';
export const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

// ============ Language Metadata ============

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;        // English name
  nativeName: string;  // Native name
  flag?: string;       // Optional emoji flag
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Francais', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Espanol', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
];
```

### Task 5.4.2: Implement Validation and Storage Utilities

**Action:** Add utility functions for validation, cookie handling, and localStorage
**File:** `/src/hooks/useLanguagePreference.ts` (continuing)

```typescript
// ============ Validation Utilities ============

/**
 * Check if a string is a valid supported language
 */
export function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  return typeof value === 'string' && SUPPORTED_LANGUAGES.includes(value as SupportedLanguage);
}

// ============ Cookie Utilities ============

/**
 * Set the language cookie
 */
function setLanguageCookie(language: SupportedLanguage): void {
  if (typeof document === 'undefined') return;

  const expires = new Date();
  expires.setTime(expires.getTime() + COOKIE_MAX_AGE * 1000);
  document.cookie = `${LANGUAGE_COOKIE_NAME}=${language};path=/;expires=${expires.toUTCString()};SameSite=Lax`;
}

/**
 * Get the language from cookie
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

// ============ LocalStorage Utilities ============

/**
 * Get language preference from localStorage (for guests)
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

// ============ Browser Detection ============

/**
 * Detect browser's preferred language from navigator
 */
function detectBrowserLanguage(): SupportedLanguage {
  if (typeof navigator === 'undefined') return DEFAULT_LANGUAGE;

  const browserLang = navigator.language || (navigator as any).userLanguage;
  if (!browserLang) return DEFAULT_LANGUAGE;

  // Extract the primary language code (e.g., 'en-US' -> 'en')
  const primaryLang = browserLang.split('-')[0].toLowerCase();

  if (isSupportedLanguage(primaryLang)) {
    return primaryLang;
  }

  return DEFAULT_LANGUAGE;
}
```

### Task 5.4.3: Implement the Hook Interface

**Action:** Create the main hook function with state management
**File:** `/src/hooks/useLanguagePreference.ts` (continuing)

```typescript
// ============ Hook Interface ============

export interface UseLanguagePreferenceReturn {
  /** Current active language preference */
  language: SupportedLanguage;

  /** Update the language preference */
  setLanguage: (language: SupportedLanguage) => Promise<void>;

  /** Loading state during initial load or preference update */
  isLoading: boolean;

  /** Whether currently saving a preference change */
  isSaving: boolean;

  /** Error message if preference operation fails */
  error: string | null;

  /** Clear any error state */
  clearError: () => void;

  /** List of supported languages with metadata */
  supportedLanguages: readonly LanguageOption[];

  /** Check if user is authenticated (preference saved to DB vs localStorage) */
  isAuthenticated: boolean;
}
```

### Task 5.4.4: Implement the Main Hook Logic

**Action:** Implement the hook with authentication-aware persistence
**File:** `/src/hooks/useLanguagePreference.ts` (continuing)

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
 * const { language, setLanguage, isLoading, supportedLanguages } = useLanguagePreference();
 *
 * return (
 *   <select
 *     value={language}
 *     onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
 *     disabled={isLoading}
 *   >
 *     {supportedLanguages.map(lang => (
 *       <option key={lang.code} value={lang.code}>
 *         {lang.nativeName}
 *       </option>
 *     ))}
 *   </select>
 * );
 * ```
 */
export function useLanguagePreference(): UseLanguagePreferenceReturn {
  const { user, authState } = useAuth();
  const isAuthenticated = !!user && authState === 'AUTHENTICATED';

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

        // Priority 1: Try to get from cookie (set by middleware)
        const cookieLanguage = getLanguageFromCookie();
        if (cookieLanguage) {
          detectedLanguage = cookieLanguage;
        }
        // Priority 2: Try localStorage (for guests)
        else {
          const storedLanguage = getStoredLanguage();
          if (storedLanguage) {
            detectedLanguage = storedLanguage;
          }
          // Priority 3: Browser detection
          else {
            detectedLanguage = detectBrowserLanguage();
          }
        }

        // For authenticated users, try to fetch from API
        // (middleware should have already set it, but this ensures freshness)
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
            console.log('[useLanguagePreference] API fetch failed, using detected language');
            // Non-fatal - continue with detected language
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

      // Trigger page refresh to apply translations (next-intl requirement)
      // This can be removed if using a more sophisticated i18n state management
      if (typeof window !== 'undefined') {
        // Option A: Soft refresh using router (preferred)
        // window.location.reload();

        // Option B: Dispatch custom event for LanguageSwitcher/IntlProvider to handle
        window.dispatchEvent(new CustomEvent('languageChange', { detail: { language: newLanguage } }));
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

### Task 5.4.5: Export from Hooks Index (if exists)

**Action:** Add export to hooks index file if one exists, or ensure direct import works
**File:** `/src/hooks/index.ts` (create or modify)

```typescript
// Add to existing exports
export { useLanguagePreference, type UseLanguagePreferenceReturn } from './useLanguagePreference';
export type { SupportedLanguage, LanguageOption } from './useLanguagePreference';
export { SUPPORTED_LANGUAGES, LANGUAGE_OPTIONS, DEFAULT_LANGUAGE } from './useLanguagePreference';
```

---

## 5. Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `/src/hooks/useLanguagePreference.ts` | Main hook implementation |

### Functions to CREATE

| Function | Location | Purpose |
|----------|----------|---------|
| `useLanguagePreference` | `/src/hooks/useLanguagePreference.ts` | Main hook function |
| `isSupportedLanguage` | `/src/hooks/useLanguagePreference.ts` | Validation utility |
| `setLanguageCookie` | `/src/hooks/useLanguagePreference.ts` | Cookie setter |
| `getLanguageFromCookie` | `/src/hooks/useLanguagePreference.ts` | Cookie getter |
| `getStoredLanguage` | `/src/hooks/useLanguagePreference.ts` | localStorage getter |
| `setStoredLanguage` | `/src/hooks/useLanguagePreference.ts` | localStorage setter |
| `detectBrowserLanguage` | `/src/hooks/useLanguagePreference.ts` | Browser language detection |

### Files to OPTIONALLY MODIFY

| File Path | Changes |
|-----------|---------|
| `/src/hooks/index.ts` | Add export for new hook (if index exists) |

### Files to READ (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/src/hooks/useDashboardPreferences.ts` | Pattern reference for localStorage persistence |
| `/src/hooks/useActiveProperty.ts` | Pattern reference for loading state management |
| `/src/contexts/AuthContext.tsx` | Understanding auth state and user context |

### Files NOT to Modify

- `/src/contexts/AuthContext.tsx` - Auth context unchanged
- `/src/middleware.ts` - Handled by REQ-247
- `/src/lib/i18n/*` - Handled by REQ-246
- `/src/app/api/user/language/route.ts` - Created in REQ-252 (Task 5.6)

---

## 6. Dependencies

### Internal Dependencies

| Import | Source | Usage |
|--------|--------|-------|
| `useAuth` | `@/contexts/AuthContext` | Get user and auth state |

### API Endpoint Dependency (Task 5.6)

The hook calls these API endpoints:
- `GET /api/user/language` - Fetch authenticated user's language preference
- `PUT /api/user/language` - Update authenticated user's language preference

**Note:** If the API endpoint is not yet implemented (REQ-252), the hook will gracefully fall back to cookie/localStorage-based detection.

### External Dependencies

None - uses only built-in React hooks and browser APIs.

---

## 7. Acceptance Criteria

From Plan-110 Task 5.4 and REQ-249:

- [ ] Hook exposes the current language preference value (`language`)
- [ ] Hook exposes a function to update the language preference (`setLanguage`)
- [ ] For authenticated users, preference changes are saved to the user profile database
- [ ] For guest users, preference changes are saved to browser localStorage
- [ ] Hook provides a loading state indicator during async operations (`isLoading`)
- [ ] Hook provides saving state indicator during preference updates (`isSaving`)
- [ ] Hook provides error state and error message information (`error`)
- [ ] Hook provides function to clear errors (`clearError`)
- [ ] Preference updates trigger re-renders in consuming components
- [ ] Hook initializes preference from the appropriate source based on authentication status
- [ ] Hook falls back to browser locale detection when no stored preference exists
- [ ] Cookie is updated on every preference change for middleware synchronization
- [ ] Hook exports supported languages list with metadata

### Additional Verification

- [ ] SSR compatibility (handles `typeof window === 'undefined'`)
- [ ] Type safety with exported types
- [ ] Memoized callbacks to prevent unnecessary re-renders
- [ ] Optimistic UI update with rollback on error
- [ ] Console logging for debugging

---

## 8. Testing Strategy

### Manual Testing Scenarios

1. **Guest User - Initial Load:**
   ```
   1. Clear all cookies and localStorage
   2. Open the application
   3. Call useLanguagePreference in a component
   4. Verify language defaults to browser locale or 'en'
   5. Verify localStorage is populated with the language
   ```

2. **Guest User - Language Change:**
   ```
   1. As a guest user, call setLanguage('fr')
   2. Verify language state updates to 'fr'
   3. Verify localStorage is updated
   4. Verify FAQBNB_LANG cookie is set
   5. Refresh page and verify language persists
   ```

3. **Authenticated User - Initial Load:**
   ```
   1. Log in with a user that has preferred_language='de' in database
   2. Verify hook loads language as 'de'
   3. Verify cookie is synchronized
   ```

4. **Authenticated User - Language Change:**
   ```
   1. As authenticated user, call setLanguage('es')
   2. Verify loading state during API call
   3. Verify API is called with PUT /api/user/language
   4. Verify language state updates on success
   5. Verify error state on API failure
   ```

5. **Error Recovery:**
   ```
   1. Simulate API failure (network offline)
   2. Attempt to change language
   3. Verify error message is set
   4. Verify optimistic update is rolled back
   5. Call clearError() and verify error is cleared
   ```

6. **SSR Compatibility:**
   ```
   1. Build application with SSR
   2. Verify no hydration mismatches
   3. Verify no 'window is not defined' errors
   ```

### Unit Test Cases (for future implementation)

```typescript
describe('useLanguagePreference', () => {
  it('should return default language when no preference exists');
  it('should detect browser language as fallback');
  it('should read language from cookie');
  it('should read language from localStorage for guests');
  it('should save to localStorage for guest users');
  it('should save to API for authenticated users');
  it('should update cookie on language change');
  it('should handle API errors gracefully');
  it('should rollback on save failure');
  it('should clear error state');
});
```

---

## 9. Usage Examples

### Basic Usage in LanguageSwitcher

```tsx
// src/components/LanguageSwitcher/LanguageSwitcher.tsx
import { useLanguagePreference } from '@/hooks/useLanguagePreference';

export function LanguageSwitcher() {
  const {
    language,
    setLanguage,
    isLoading,
    supportedLanguages
  } = useLanguagePreference();

  if (isLoading) {
    return <div className="animate-pulse">...</div>;
  }

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
      className="form-select"
    >
      {supportedLanguages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.nativeName}
        </option>
      ))}
    </select>
  );
}
```

### With Error Handling

```tsx
import { useLanguagePreference } from '@/hooks/useLanguagePreference';

export function LanguageSettings() {
  const {
    language,
    setLanguage,
    error,
    clearError,
    isSaving
  } = useLanguagePreference();

  const handleChange = async (newLang: SupportedLanguage) => {
    await setLanguage(newLang);
  };

  return (
    <div>
      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}

      <select
        value={language}
        onChange={(e) => handleChange(e.target.value as SupportedLanguage)}
        disabled={isSaving}
      >
        {/* options */}
      </select>

      {isSaving && <span>Saving...</span>}
    </div>
  );
}
```

### Conditional UI Based on Language

```tsx
import { useLanguagePreference } from '@/hooks/useLanguagePreference';

export function WelcomeMessage() {
  const { language } = useLanguagePreference();

  // Component can use language for conditional rendering
  // (Note: For actual translations, use next-intl's useTranslations)
  return (
    <div>
      Current language: {language}
    </div>
  );
}
```

---

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| API endpoint not ready (REQ-252) | Medium | Low | Hook falls back to cookie/localStorage |
| Cookie/localStorage conflicts | Low | Medium | Using unique, prefixed names |
| Hydration mismatch with SSR | Medium | Medium | Careful SSR checks, useEffect for client-side |
| Auth context not ready | Low | Low | Check authState before API calls |
| Race condition on rapid changes | Low | Medium | debounce or disable during save |

---

## 11. Estimated Effort

| Task | Estimate |
|------|----------|
| Create file with types and constants | 10 min |
| Implement validation and storage utilities | 15 min |
| Implement main hook logic | 30 min |
| Add exports and documentation | 10 min |
| Manual testing | 20 min |
| **Total** | **~85 min (~1.5 hours)** |

---

## 12. Next Steps After Implementation

After completing Task 5.4 (this task):

1. **Task 5.5:** Create LocaleContext (optional enhancement) - May wrap next-intl with app-specific logic
2. **Task 5.6:** Add language preference API endpoint (`/api/user/language`)
3. **Task 5.7:** Integrate LanguageSwitcher into navigation (uses this hook)

### Integration with LanguageSwitcher (Task 5.3)

The LanguageSwitcher component (REQ-248) will be the primary consumer of this hook:

```tsx
// LanguageSwitcher will use useLanguagePreference internally
<LanguageSwitcher variant="dropdown" showNativeNames={true} />
```

---

## 13. Rollback Plan

If issues arise after deployment:

1. Remove the `useLanguagePreference.ts` file
2. Update any components that import the hook to use a static language
3. The FAQBNB_LANG cookie and localStorage values will remain but be unused

No database changes required for this hook implementation.

---

## References

- [Plan-110-L10N-Epic1-Foundation.md](/docs/prd/Plan-110-L10N-Epic1-Foundation.md) - Full implementation plan
- [REQ-246-create-language-detection-utility-overview.md](/docs/REQ-246-create-language-detection-utility-overview.md) - Language detection utility
- [REQ-247-update-middleware-for-language-handling-overview.md](/docs/REQ-247-update-middleware-for-language-handling-overview.md) - Middleware integration
- [REQ-248-create-languageswitcher-component-overview.md](/docs/REQ-248-create-languageswitcher-component-overview.md) - LanguageSwitcher component (consumer)
- [useDashboardPreferences.ts](/src/hooks/useDashboardPreferences.ts) - Pattern reference
- [useActiveProperty.ts](/src/hooks/useActiveProperty.ts) - Pattern reference
- [next-intl Documentation](https://next-intl-docs.vercel.app/) - i18n framework reference

---

*Implementation overview generated for FAQBNB Localization Epic 1 - Foundation (Phase 5, Task 5.4)*
