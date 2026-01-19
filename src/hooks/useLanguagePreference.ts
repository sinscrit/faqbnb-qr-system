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
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
];

// ============ Validation Utilities ============

/**
 * Type guard to check if a value is a valid supported language
 */
export function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  return typeof value === 'string' &&
         SUPPORTED_LANGUAGES.includes(value as SupportedLanguage);
}

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
