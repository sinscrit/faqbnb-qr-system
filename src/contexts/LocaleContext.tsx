'use client';

/**
 * LocaleContext - Application-Specific Locale Context Wrapper
 *
 * This context wraps the next-intl internationalization framework with additional
 * business logic for locale management including:
 * - Language preference persistence (database for authenticated users, localStorage for guests)
 * - Authentication integration
 * - Clean API for components
 *
 * REQ-250: Create LocaleContext (optional enhancement)
 * Last Modified: 2026-01-18
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// =============================================================================
// Task 1: Type Definitions
// =============================================================================

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

// =============================================================================
// Task 2: Constants and Configuration
// =============================================================================

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

// =============================================================================
// Task 3: Context Creation
// =============================================================================

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

  // =============================================================================
  // Task 4: Helper Methods
  // =============================================================================

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

  // =============================================================================
  // Task 5: setLocale Function with Persistence
  // =============================================================================

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

  // =============================================================================
  // Task 6: Initialization Effect
  // =============================================================================

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
        // Note: user.preferred_language should be available on the user object
        const userPreferredLanguage = (user as { preferred_language?: string } | null)?.preferred_language;
        if (isAuthenticated && userPreferredLanguage) {
          if (isLocaleSupported(userPreferredLanguage)) {
            initialLocale = userPreferredLanguage as SupportedLanguage;
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
  }, [defaultLocale, isAuthenticated, user, isLocaleSupported, getPersistedLocale, persistToLocalStorage, setLocaleCookie]);

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

// =============================================================================
// Task 7: Hooks
// =============================================================================

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
