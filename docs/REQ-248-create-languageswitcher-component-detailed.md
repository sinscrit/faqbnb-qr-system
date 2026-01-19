# Detailed Task Breakdown: REQ-248 - Create LanguageSwitcher Component

**Generated:** 2026-01-18 19:00:00 UTC
**Last Modified:** 2026-01-18 22:30:00 UTC
**Overview Reference:** REQ-248-create-languageswitcher-component-overview.md
**Implementation Plan Reference:** Plan-110-L10N-Epic1-Foundation.md (Phase 5, Task 5.3)
**Epic:** L10N Epic 1 - Foundation
**Phase:** 5 - Language Switching Infrastructure
**Task ID:** 5.3
**Size:** M (Medium)
**Priority:** P1 - High (blocks language switching feature)

---

## Summary

This document provides granular, implementation-ready tasks for creating the LanguageSwitcher component. The component enables users to select their preferred display language from a dropdown menu supporting 6 languages (English, French, Spanish, German, Dutch, Italian). It follows existing patterns from PropertySelector.tsx and AccountSelector.tsx.

---

## Prerequisites

Before starting implementation, verify these dependencies are in place:

| Dependency | Status Check | Blocker? |
|------------|--------------|----------|
| `next-intl` package | Run `npm list next-intl` | Yes |
| `preferred_language` column in users table | Check via Supabase MCP | Yes |
| i18n configuration (`/src/lib/i18n/config.ts`) | File exists | Partial |
| Language preference API (`/api/user/language`) | File exists | No (can be stubbed) |

**Note:** If `next-intl` is not installed, coordinate with Task 2.1 from Phase 2. The component can be built with a fallback strategy using cookies and page reload.

---

## Task Breakdown

### Task 1: Create TypeScript Type Definitions

**File:** `/src/components/LanguageSwitcher/LanguageSwitcher.types.ts`
**Story Points:** 0.5
**Dependencies:** None

#### Implementation Steps

1. **Create the directory structure:**
   ```bash
   mkdir -p src/components/LanguageSwitcher
   ```

2. **Create the types file with the following content:**

```typescript
// /src/components/LanguageSwitcher/LanguageSwitcher.types.ts
// REQ-248: LanguageSwitcher component types
// Last Modified: 2026-01-18

/**
 * Supported language codes matching i18n configuration
 * ISO 639-1 language codes
 */
export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

/**
 * Individual language option displayed in the dropdown
 */
export interface LocaleOption {
  /** ISO 639-1 language code */
  code: SupportedLanguage;
  /** English name (for accessibility/aria-label) */
  name: string;
  /** Native name (displayed in dropdown) */
  nativeName: string;
  /** Optional flag emoji for visual identification */
  flag?: string;
}

/**
 * Component props for LanguageSwitcher
 */
export interface LanguageSwitcherProps {
  /** Current locale code (optional - defaults to detected locale) */
  currentLocale?: SupportedLanguage;
  /** Callback when locale changes */
  onLocaleChange?: (locale: SupportedLanguage) => void;
  /** Display variant: 'dropdown' for full display, 'compact' for header/nav */
  variant?: 'dropdown' | 'compact';
  /** Size variant matching Airbnb DLS */
  size?: 'sm' | 'md' | 'lg';
  /** Show native language names (default: true) */
  showNativeNames?: boolean;
  /** Show flag emoji (default: true) */
  showFlags?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state during language switch */
  loading?: boolean;
}

/**
 * Result of persisting locale preference
 */
export interface LocalePersistenceResult {
  success: boolean;
  error?: string;
  persistedTo: 'database' | 'cookie' | 'both';
}

/**
 * Keyboard navigation state
 */
export interface KeyboardNavigationState {
  focusedIndex: number;
  isOpen: boolean;
}
```

#### Acceptance Criteria

- [x] File created at `/src/components/LanguageSwitcher/LanguageSwitcher.types.ts`
- [x] `SupportedLanguage` type includes all 6 language codes: en, fr, es, de, nl, it
- [x] `LocaleOption` interface includes code, name, nativeName, and optional flag
- [x] `LanguageSwitcherProps` includes all configuration options matching overview doc
- [x] `LocalePersistenceResult` interface defined for persistence feedback
- [x] All types are exported and can be imported by other modules
- [x] TypeScript compiles without errors

#### Verification Command

```bash
npx tsc --noEmit src/components/LanguageSwitcher/LanguageSwitcher.types.ts
```

---

### Task 2: Create Locale Constants

**File:** `/src/components/LanguageSwitcher/constants.ts`
**Story Points:** 0.5
**Dependencies:** Task 1

#### Implementation Steps

1. **Create the constants file:**

```typescript
// /src/components/LanguageSwitcher/constants.ts
// REQ-248: Locale configuration constants
// Last Modified: 2026-01-18

import type { LocaleOption, SupportedLanguage } from './LanguageSwitcher.types';

/**
 * All supported locales with native names and flags
 * Order: English first (default), then alphabetically by English name
 */
export const SUPPORTED_LOCALES: LocaleOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'fr', name: 'French', nativeName: 'Francais', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'es', name: 'Spanish', nativeName: 'Espanol', flag: '🇪🇸' },
];

/**
 * Default locale when no preference is set
 */
export const DEFAULT_LOCALE: SupportedLanguage = 'en';

/**
 * Cookie name for storing language preference
 * Used for both guests and authenticated users (immediate persistence)
 */
export const LOCALE_COOKIE_NAME = 'FAQBNB_LANG';

/**
 * Cookie max age in seconds (1 year)
 */
export const LOCALE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

/**
 * API endpoint for persisting language preference to database
 */
export const LANGUAGE_PREFERENCE_API = '/api/user/language';

/**
 * Get locale option by code
 */
export function getLocaleByCode(code: SupportedLanguage): LocaleOption | undefined {
  return SUPPORTED_LOCALES.find(locale => locale.code === code);
}

/**
 * Check if a string is a valid supported language code
 */
export function isSupportedLanguage(code: string): code is SupportedLanguage {
  return ['en', 'fr', 'es', 'de', 'nl', 'it'].includes(code);
}
```

#### Acceptance Criteria

- [x] File created at `/src/components/LanguageSwitcher/constants.ts`
- [x] All 6 languages defined with correct native names (Francais, Deutsch, Espanol, etc.)
- [x] All 6 languages have flag emojis assigned
- [x] `DEFAULT_LOCALE` is 'en'
- [x] `LOCALE_COOKIE_NAME` is 'FAQBNB_LANG'
- [x] `LOCALE_COOKIE_MAX_AGE` is set to 1 year in seconds
- [x] Helper functions `getLocaleByCode` and `isSupportedLanguage` are exported
- [x] TypeScript compiles without errors

---

### Task 3: Implement LanguageSwitcher Component

**File:** `/src/components/LanguageSwitcher/LanguageSwitcher.tsx`
**Story Points:** 3
**Dependencies:** Task 1, Task 2

#### Implementation Steps

1. **Create the main component file with the following structure:**

```typescript
// /src/components/LanguageSwitcher/LanguageSwitcher.tsx
// REQ-248: Language Switcher Component
// Last Modified: 2026-01-18

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { LanguageSwitcherProps, SupportedLanguage, LocalePersistenceResult } from './LanguageSwitcher.types';
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_MAX_AGE,
  LANGUAGE_PREFERENCE_API,
  getLocaleByCode,
  isSupportedLanguage
} from './constants';

/**
 * LanguageSwitcher - Dropdown component for selecting display language
 *
 * Features:
 * - Displays all 6 supported languages with native names
 * - Persists preference to database for authenticated users
 * - Persists preference to cookie for all users (immediate effect)
 * - Full keyboard navigation support
 * - Accessible with proper ARIA attributes
 * - Follows Airbnb DLS styling patterns
 */
export function LanguageSwitcher({
  currentLocale: propLocale,
  onLocaleChange,
  variant = 'dropdown',
  size = 'md',
  showNativeNames = true,
  showFlags = true,
  className = '',
  disabled = false,
  loading: externalLoading = false
}: LanguageSwitcherProps) {
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [internalLoading, setInternalLoading] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<SupportedLanguage>(
    propLocale || getLocaleFromCookie() || DEFAULT_LOCALE
  );

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Context
  const { user } = useAuth();

  // Combined loading state
  const isLoading = externalLoading || internalLoading;

  // Sync with prop changes
  useEffect(() => {
    if (propLocale && propLocale !== currentLocale) {
      setCurrentLocale(propLocale);
    }
  }, [propLocale]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll focused option into view
  useEffect(() => {
    if (focusedIndex >= 0 && optionsRef.current[focusedIndex]) {
      optionsRef.current[focusedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [focusedIndex]);

  /**
   * Get locale from browser cookie
   */
  function getLocaleFromCookie(): SupportedLanguage | null {
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === LOCALE_COOKIE_NAME && isSupportedLanguage(value)) {
        return value;
      }
    }
    return null;
  }

  /**
   * Set locale cookie
   */
  const setLocaleCookie = useCallback((locale: SupportedLanguage) => {
    document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
  }, []);

  /**
   * Persist locale preference to database for authenticated users
   */
  const persistToDatabase = useCallback(async (locale: SupportedLanguage): Promise<boolean> => {
    try {
      const response = await fetch(LANGUAGE_PREFERENCE_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: locale }),
        credentials: 'include'
      });

      if (!response.ok) {
        console.warn('Failed to persist language to database:', response.status);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error persisting language preference:', error);
      return false;
    }
  }, []);

  /**
   * Handle locale change
   */
  const handleLocaleChange = useCallback(async (locale: SupportedLanguage) => {
    if (locale === currentLocale || isLoading) return;

    setInternalLoading(true);
    setIsOpen(false);
    setFocusedIndex(-1);

    try {
      // Always set cookie for immediate persistence
      setLocaleCookie(locale);

      // If user is authenticated, also save to database
      let persistenceResult: LocalePersistenceResult = {
        success: true,
        persistedTo: 'cookie'
      };

      if (user) {
        const dbSuccess = await persistToDatabase(locale);
        persistenceResult.persistedTo = dbSuccess ? 'both' : 'cookie';
      }

      // Update local state
      setCurrentLocale(locale);

      // Notify parent component
      if (onLocaleChange) {
        onLocaleChange(locale);
      }

      // Reload the page to apply new locale
      // Note: Once next-intl is fully configured, this can be replaced with router navigation
      window.location.reload();

    } catch (error) {
      console.error('Error changing locale:', error);
    } finally {
      setInternalLoading(false);
    }
  }, [currentLocale, isLoading, user, setLocaleCookie, persistToDatabase, onLocaleChange]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const totalOptions = SUPPORTED_LOCALES.length;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex((prev) => (prev + 1) % totalOptions);
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(totalOptions - 1);
        } else {
          setFocusedIndex((prev) => (prev - 1 + totalOptions) % totalOptions);
        }
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else if (focusedIndex >= 0) {
          const selectedLocale = SUPPORTED_LOCALES[focusedIndex];
          if (selectedLocale) {
            handleLocaleChange(selectedLocale.code);
          }
        }
        break;

      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        buttonRef.current?.focus();
        break;

      case 'Tab':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;

      case 'Home':
        event.preventDefault();
        if (isOpen) {
          setFocusedIndex(0);
        }
        break;

      case 'End':
        event.preventDefault();
        if (isOpen) {
          setFocusedIndex(totalOptions - 1);
        }
        break;
    }
  }, [isOpen, focusedIndex, handleLocaleChange]);

  /**
   * Get size-specific CSS classes (matching PropertySelector pattern)
   */
  const getSizeClasses = () => {
    const sizeMap = {
      sm: {
        button: 'px-3 py-1.5 text-xs',
        dropdown: 'py-1',
        option: 'px-3 py-1.5 text-xs',
        icon: 'w-3 h-3',
        flag: 'text-sm'
      },
      md: {
        button: 'px-4 py-2 text-sm',
        dropdown: 'py-2',
        option: 'px-4 py-2 text-sm',
        icon: 'w-4 h-4',
        flag: 'text-base'
      },
      lg: {
        button: 'px-6 py-3 text-base',
        dropdown: 'py-3',
        option: 'px-6 py-3 text-base',
        icon: 'w-5 h-5',
        flag: 'text-lg'
      }
    };
    return sizeMap[size];
  };

  const sizeClasses = getSizeClasses();
  const currentLocaleData = getLocaleByCode(currentLocale);

  /**
   * Get display text for current locale
   */
  const getDisplayText = () => {
    if (!currentLocaleData) return 'Select Language';

    if (variant === 'compact') {
      return showFlags && currentLocaleData.flag
        ? `${currentLocaleData.flag} ${currentLocaleData.code.toUpperCase()}`
        : currentLocaleData.code.toUpperCase();
    }

    return showNativeNames
      ? currentLocaleData.nativeName
      : currentLocaleData.name;
  };

  return (
    <div
      className={`language-switcher relative ${className}`}
      ref={dropdownRef}
    >
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        className={`
          ${sizeClasses.button}
          w-full bg-white border border-gray-300 rounded-lg
          flex items-center justify-between
          hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
          ${isOpen ? 'ring-2 ring-[#FF385C] border-transparent' : ''}
        `}
        onClick={() => {
          if (!disabled && !isLoading) {
            setIsOpen(!isOpen);
            if (!isOpen) {
              // Set initial focus to current locale
              const currentIndex = SUPPORTED_LOCALES.findIndex(l => l.code === currentLocale);
              setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
            }
          }
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled || isLoading}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Select language. Current language: ${currentLocaleData?.name || 'English'}`}
        aria-controls="language-listbox"
      >
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <Globe className={`${sizeClasses.icon} text-gray-400 flex-shrink-0`} />
          {isLoading ? (
            <span className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FF385C]"></div>
              <span>Switching...</span>
            </span>
          ) : (
            <span className="truncate text-left flex items-center space-x-2">
              {showFlags && currentLocaleData?.flag && variant !== 'compact' && (
                <span className={sizeClasses.flag}>{currentLocaleData.flag}</span>
              )}
              <span>{getDisplayText()}</span>
            </span>
          )}
        </div>
        <ChevronDown
          className={`${sizeClasses.icon} text-gray-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && !isLoading && (
        <div
          id="language-listbox"
          className={`
            absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg
            max-h-60 overflow-y-auto
            ${sizeClasses.dropdown}
          `}
          role="listbox"
          aria-label="Language options"
          aria-activedescendant={focusedIndex >= 0 ? `language-option-${SUPPORTED_LOCALES[focusedIndex]?.code}` : undefined}
        >
          {SUPPORTED_LOCALES.map((locale, index) => {
            const isSelected = currentLocale === locale.code;
            const isFocused = focusedIndex === index;

            return (
              <div
                key={locale.code}
                id={`language-option-${locale.code}`}
                ref={el => { optionsRef.current[index] = el; }}
                className={`
                  ${sizeClasses.option}
                  cursor-pointer transition-colors duration-150
                  ${isFocused ? 'bg-[#FFEEEF] text-[#222222]' : ''}
                  ${isSelected && !isFocused ? 'bg-gray-50' : ''}
                  ${!isFocused && !isSelected ? 'hover:bg-gray-50' : ''}
                  flex items-center justify-between
                `}
                onClick={() => handleLocaleChange(locale.code)}
                onMouseEnter={() => setFocusedIndex(index)}
                role="option"
                aria-selected={isSelected}
                aria-label={`${locale.name}, ${locale.nativeName}`}
              >
                <div className="flex items-center space-x-3">
                  {showFlags && locale.flag && (
                    <span className={`${sizeClasses.flag} flex-shrink-0`}>{locale.flag}</span>
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {showNativeNames ? locale.nativeName : locale.name}
                    </span>
                    {showNativeNames && variant !== 'compact' && (
                      <span className="text-xs text-gray-500">{locale.name}</span>
                    )}
                  </div>
                </div>
                {isSelected && (
                  <Check className={`${sizeClasses.icon} text-[#FF385C] flex-shrink-0`} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;
```

#### Acceptance Criteria

- [x] File created at `/src/components/LanguageSwitcher/LanguageSwitcher.tsx`
- [x] Component renders a dropdown button with current language
- [x] Dropdown shows all 6 languages with native names and flags
- [x] Click on option changes language and closes dropdown
- [x] Current language is highlighted with checkmark
- [x] Click outside closes dropdown
- [x] Keyboard navigation works (ArrowUp, ArrowDown, Enter, Escape, Home, End)
- [x] Loading state shows spinner during language switch
- [x] Accessible with proper ARIA attributes (aria-expanded, aria-haspopup, role="listbox")
- [x] Follows Airbnb DLS colors: `#FF385C` for accent, `#222222` for text
- [x] Component uses `'use client'` directive
- [x] TypeScript compiles without errors

#### Verification

```bash
# Build check
npm run build

# Type check
npx tsc --noEmit
```

---

### Task 4: Implement Cookie and Database Persistence

**File:** `/src/components/LanguageSwitcher/LanguageSwitcher.tsx` (already included in Task 3)
**Story Points:** 1
**Dependencies:** Task 3

This task is embedded within Task 3. The verification ensures persistence logic works correctly.

#### Acceptance Criteria

- [x] Cookie is set with name `FAQBNB_LANG` on language change
- [x] Cookie has path `/`, max-age of 1 year, SameSite=Lax
- [x] For authenticated users, PUT request sent to `/api/user/language`
- [x] Database save failure does not block UI update (graceful degradation)
- [x] Cookie is read on component mount to restore preference
- [x] Page reloads after language change (temporary until next-intl router is configured)

#### Verification

```bash
# Manual testing in browser:
# 1. Open DevTools > Application > Cookies
# 2. Change language in switcher
# 3. Verify FAQBNB_LANG cookie is set
# 4. Verify page reloads
# 5. Verify cookie persists after reload
```

---

### Task 5: Create Barrel Export

**File:** `/src/components/LanguageSwitcher/index.ts`
**Story Points:** 0.25
**Dependencies:** Task 1, Task 2, Task 3

#### Implementation Steps

1. **Create the barrel export file:**

```typescript
// /src/components/LanguageSwitcher/index.ts
// REQ-248: LanguageSwitcher barrel exports
// Last Modified: 2026-01-18

// Main component
export { LanguageSwitcher, default } from './LanguageSwitcher';

// Constants
export {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_MAX_AGE,
  LANGUAGE_PREFERENCE_API,
  getLocaleByCode,
  isSupportedLanguage
} from './constants';

// Types
export type {
  LanguageSwitcherProps,
  LocaleOption,
  SupportedLanguage,
  LocalePersistenceResult,
  KeyboardNavigationState
} from './LanguageSwitcher.types';
```

#### Acceptance Criteria

- [x] File created at `/src/components/LanguageSwitcher/index.ts`
- [x] Component can be imported as `import { LanguageSwitcher } from '@/components/LanguageSwitcher'`
- [x] Types can be imported: `import type { SupportedLanguage } from '@/components/LanguageSwitcher'`
- [x] Constants exported: `import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/components/LanguageSwitcher'`
- [x] Default export works: `import LanguageSwitcher from '@/components/LanguageSwitcher'`

#### Verification

```bash
# Create a test import file to verify exports work
echo "import { LanguageSwitcher, SUPPORTED_LOCALES, DEFAULT_LOCALE } from './src/components/LanguageSwitcher';
import type { SupportedLanguage, LocaleOption } from './src/components/LanguageSwitcher';
console.log(SUPPORTED_LOCALES, DEFAULT_LOCALE);" > /tmp/test-import.ts

npx tsc --noEmit /tmp/test-import.ts
```

---

### Task 6: Integrate into DashboardLayout

**File:** `/src/components/DashboardLayout.tsx` (modify)
**Story Points:** 0.5
**Dependencies:** Task 5

#### Implementation Steps

1. **Add import at top of file (around line 8):**

```typescript
import { LanguageSwitcher } from './LanguageSwitcher';
```

2. **Add LanguageSwitcher to header right side (around line 275, before Account Selector):**

Find this section:
```typescript
{/* Right side - Account selector and logout */}
<div className="flex items-center space-x-3">
  {/* Account Selector */}
  {showAccountSelector && (
```

Modify to:
```typescript
{/* Right side - Language switcher, Account selector and logout */}
<div className="flex items-center space-x-3">
  {/* Language Switcher */}
  <LanguageSwitcher
    variant="compact"
    size="sm"
    className="w-32"
  />

  {/* Account Selector */}
  {showAccountSelector && (
```

#### Acceptance Criteria

- [x] Import added for LanguageSwitcher component
- [x] LanguageSwitcher added to header between title area and Account Selector
- [x] Component uses `variant="compact"` and `size="sm"`
- [x] Width is constrained with `className="w-32"`
- [x] Does not break existing header layout
- [x] Visible on all dashboard pages
- [x] TypeScript compiles without errors
- [x] Build succeeds

#### Verification

```bash
# Build check
npm run build

# Start dev server and visually verify
npm run dev
# Navigate to /dashboard and verify language switcher is visible in header
```

---

### Task 7: Create Language Preference API Endpoint (Stub)

**File:** `/src/app/api/user/language/route.ts`
**Story Points:** 1
**Dependencies:** None (can be done in parallel with Tasks 1-5)

**Note:** This task creates a stub endpoint. Full implementation is covered in Task 5.6 of the implementation plan.

#### Implementation Steps

1. **Create directory and file:**

```typescript
// /src/app/api/user/language/route.ts
// REQ-248: Language preference API endpoint (stub)
// Full implementation in Task 5.6
// Last Modified: 2026-01-18

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function PUT(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { language } = body;

    // Validate language code
    const validLanguages = ['en', 'fr', 'es', 'de', 'nl', 'it'];
    if (!language || !validLanguages.includes(language)) {
      return NextResponse.json(
        { error: 'Invalid language code', validLanguages },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Update user's preferred_language in database
    const { error: updateError } = await supabase
      .from('users')
      .update({ preferred_language: language })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to update language preference:', updateError);
      return NextResponse.json(
        { error: 'Failed to update language preference' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      language,
      message: 'Language preference updated successfully'
    });

  } catch (error) {
    console.error('Language preference API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's preferred_language from database
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('preferred_language')
      .eq('id', user.id)
      .single();

    if (fetchError) {
      console.error('Failed to fetch language preference:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch language preference' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      language: userData?.preferred_language || 'en'
    });

  } catch (error) {
    console.error('Language preference API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### Acceptance Criteria

- [x] File created at `/src/app/api/user/language/route.ts`
- [x] PUT endpoint accepts `{ language: string }` body
- [x] PUT endpoint validates language is one of: en, fr, es, de, nl, it
- [x] PUT endpoint requires authentication (returns 401 if not authenticated)
- [x] PUT endpoint updates `preferred_language` column in users table
- [x] GET endpoint returns current user's language preference
- [x] Both endpoints return JSON responses with appropriate status codes
- [x] TypeScript compiles without errors

#### Verification

```bash
# Type check
npx tsc --noEmit

# Manual API testing with curl (requires valid auth cookie):
# PUT test
curl -X PUT http://localhost:3000/api/user/language \
  -H "Content-Type: application/json" \
  -d '{"language": "fr"}' \
  --cookie "your-auth-cookie"

# GET test
curl http://localhost:3000/api/user/language \
  --cookie "your-auth-cookie"
```

---

## Summary

| Task | File | Story Points | Dependencies |
|------|------|--------------|--------------|
| Task 1: Type Definitions | `LanguageSwitcher.types.ts` | 0.5 | None |
| Task 2: Constants | `constants.ts` | 0.5 | Task 1 |
| Task 3: Main Component | `LanguageSwitcher.tsx` | 3 | Tasks 1, 2 |
| Task 4: Persistence Logic | (in Task 3) | 1 | Task 3 |
| Task 5: Barrel Export | `index.ts` | 0.25 | Tasks 1, 2, 3 |
| Task 6: Dashboard Integration | `DashboardLayout.tsx` | 0.5 | Task 5 |
| Task 7: API Endpoint | `api/user/language/route.ts` | 1 | None |
| **Total** | | **6.75** | |

---

## File Changes Summary

### New Files

| File Path | Purpose |
|-----------|---------|
| `/src/components/LanguageSwitcher/index.ts` | Barrel export |
| `/src/components/LanguageSwitcher/LanguageSwitcher.tsx` | Main component |
| `/src/components/LanguageSwitcher/LanguageSwitcher.types.ts` | TypeScript interfaces |
| `/src/components/LanguageSwitcher/constants.ts` | Locale configuration |
| `/src/app/api/user/language/route.ts` | Language preference API |

### Modified Files

| File Path | Changes |
|-----------|---------|
| `/src/components/DashboardLayout.tsx` | Add import and render LanguageSwitcher in header |

---

## Testing Checklist

### Unit Tests (Future Task 6.3)

- [ ] Component renders with default props
- [ ] Component renders with all prop combinations
- [ ] Dropdown opens on click
- [ ] Dropdown closes on click outside
- [ ] Dropdown closes on Escape key
- [ ] Arrow keys navigate options
- [ ] Enter key selects option
- [ ] Selected language shows checkmark
- [ ] Loading state displays spinner
- [ ] Disabled state prevents interaction

### Integration Tests

- [ ] Language change sets cookie
- [ ] Authenticated user: preference saved to database
- [ ] Guest user: preference saved to cookie only
- [ ] Page reload preserves language preference
- [ ] API endpoint validates language codes
- [ ] API endpoint requires authentication

### Manual Testing Checklist

- [ ] Open dashboard in browser
- [ ] Verify LanguageSwitcher visible in header
- [ ] Click dropdown - all 6 languages visible
- [ ] Each language shows native name and flag
- [ ] Select different language
- [ ] Verify page reloads
- [ ] Verify cookie set in DevTools
- [ ] Verify language persists on refresh
- [ ] Test keyboard navigation
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Test in different viewport sizes

---

## Rollback Plan

If issues are discovered after deployment:

1. **Quick Fix:** Revert DashboardLayout.tsx change to remove LanguageSwitcher from header
2. **Full Rollback:** Delete `/src/components/LanguageSwitcher/` directory
3. **API Rollback:** Delete `/src/app/api/user/language/` directory

---

## References

- [Overview Document](/docs/REQ-248-create-languageswitcher-component-overview.md)
- [Implementation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
- [PropertySelector Component](/src/components/PropertySelector.tsx) - Reference pattern
- [AccountSelector Component](/src/components/AccountSelector.tsx) - Reference pattern
- [WAI-ARIA Listbox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/)

---

*Document generated for FAQBNB Localization Epic 1 - Foundation, Task 5.3*
*Detailed tasks designed for 1 story point maximum granularity*
