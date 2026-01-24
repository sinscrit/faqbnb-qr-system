/**
 * @fileoverview Guest Language State Management Hook for Epic 4 - Guest Experience
 *
 * This hook manages guest user language state on the client side, handling
 * language preference persistence via cookies, URL parameter synchronization
 * for shareable links, and toggling between translated and original content.
 *
 * @description
 * Key features:
 * - Manages `currentLanguage` and `showOriginal` state
 * - Persists guest language preference to cookie (FAQBNB_GUEST_LANG)
 * - Handles language changes with cookie and URL updates
 * - Toggle between translation and original content (client-side)
 * - Syncs with URL parameter `?lang=` for shareable links
 * - Initializes from: URL param > Cookie > Browser language > default
 *
 * This hook is separate from `useLanguagePreference` which handles
 * authenticated user language management with database persistence.
 *
 * @module hooks/useGuestLanguage
 * @since Epic 4 - Guest Experience
 * @see /src/hooks/useLanguagePreference.ts - For authenticated users
 * @see /src/lib/i18n/guest-language.ts - Guest language utilities
 *
 * @example
 * ```tsx
 * 'use client';
 * import { useGuestLanguage } from '@/hooks';
 *
 * function GuestItemPage() {
 *   const {
 *     currentLanguage,
 *     showOriginal,
 *     setLanguage,
 *     toggleOriginal,
 *     isLoading,
 *     availableLanguages,
 *     setAvailableLanguages
 *   } = useGuestLanguage();
 *
 *   // Fetch content when language changes
 *   useEffect(() => {
 *     fetchItemContent(itemId, currentLanguage);
 *   }, [currentLanguage]);
 *
 *   // Set available languages after fetching content metadata
 *   useEffect(() => {
 *     setAvailableLanguages(['en', 'fr', 'es']);
 *   }, [contentMeta]);
 *
 *   return (
 *     <div>
 *       <GuestLanguageSwitcher
 *         currentLanguage={currentLanguage}
 *         onLanguageChange={setLanguage}
 *         availableLanguages={availableLanguages}
 *       />
 *       {showOriginal ? <OriginalContent /> : <TranslatedContent />}
 *       <ViewOriginalToggle
 *         showingOriginal={showOriginal}
 *         onToggle={toggleOriginal}
 *       />
 *     </div>
 *   );
 * }
 * ```
 *
 * Last Modified: 2026-01-23 17:00
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { SupportedLanguage } from '@/types';
import {
  detectGuestLanguageClient,
  setGuestLanguageCookie,
} from '@/lib/i18n/guest-language';

// =============================================================================
// Constants
// =============================================================================

/** Default language when no preference is detected */
const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

/** URL parameter name for language selection */
const LANG_URL_PARAM = 'lang';

// =============================================================================
// Hook Return Interface
// =============================================================================

/**
 * Return type for the useGuestLanguage hook.
 *
 * Provides state values and functions for managing guest language preferences
 * and content display mode (translated vs original).
 *
 * @since Epic 4 - Guest Experience
 */
export interface UseGuestLanguageReturn {
  /** Current selected language for display */
  currentLanguage: SupportedLanguage;

  /** Whether currently viewing original content (not translation) */
  showOriginal: boolean;

  /** Update the language preference (updates cookie and URL) */
  setLanguage: (language: SupportedLanguage) => void;

  /** Toggle between viewing translation and original content */
  toggleOriginal: () => void;

  /** Loading state during initial language detection */
  isLoading: boolean;

  /** Available languages for this content (set by parent component after data fetch) */
  availableLanguages?: SupportedLanguage[];

  /** Set available languages for the current content */
  setAvailableLanguages: (languages: SupportedLanguage[]) => void;
}

// =============================================================================
// Main Hook
// =============================================================================

/**
 * Hook for managing guest user language state with URL and cookie synchronization.
 *
 * @description
 * This hook provides a complete solution for guest language management:
 *
 * **Priority Cascade (highest to lowest):**
 * 1. URL parameter (`?lang=fr`) - For shareable links
 * 2. Cookie (FAQBNB_GUEST_LANG) - Persistent preference
 * 3. Browser language (navigator.language) - Automatic detection
 * 4. Default ('en') - Fallback
 *
 * **Two-State System:**
 * - `currentLanguage`: The language to fetch/display content in
 * - `showOriginal`: Client-side toggle to view original content without refetching
 *
 * **Shareability:**
 * When language is changed via `setLanguage`, both the cookie and URL are updated.
 * This ensures that copied URLs will show the same language to recipients.
 *
 * @returns {UseGuestLanguageReturn} State values and functions for language management
 *
 * @example
 * ```tsx
 * const { currentLanguage, setLanguage } = useGuestLanguage();
 *
 * // Change language (updates URL and cookie)
 * setLanguage('fr');
 *
 * // Toggle to view original content
 * toggleOriginal();
 * ```
 */
export function useGuestLanguage(): UseGuestLanguageReturn {
  // Extract Next.js navigation hooks
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // =============================================================================
  // State
  // =============================================================================

  const [currentLanguage, setCurrentLanguage] =
    useState<SupportedLanguage>(DEFAULT_LANGUAGE);
  const [showOriginal, setShowOriginal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [availableLanguages, setAvailableLanguages] = useState<
    SupportedLanguage[] | undefined
  >(undefined);

  // =============================================================================
  // Initialize Language on Mount
  // =============================================================================

  useEffect(() => {
    const initializeLanguage = () => {
      setIsLoading(true);

      try {
        // Get URL parameter value (if present)
        const urlLang = searchParams?.get(LANG_URL_PARAM);

        // Use detectGuestLanguageClient which handles the full priority cascade:
        // URL param > Cookie > Browser language > default
        const detectedLang = detectGuestLanguageClient(urlLang ?? undefined);

        setCurrentLanguage(detectedLang);

        // Ensure cookie matches detected language (syncs URL param to cookie)
        setGuestLanguageCookie(detectedLang);

        console.log('[useGuestLanguage] Initialized with language:', detectedLang);
      } catch (error) {
        console.error('[useGuestLanguage] Initialization error:', error);
        setCurrentLanguage(DEFAULT_LANGUAGE);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, [searchParams]);

  // =============================================================================
  // Set Language Function
  // =============================================================================

  /**
   * Updates the language preference, persisting to cookie and URL.
   *
   * When called, this function:
   * 1. Updates the currentLanguage state
   * 2. Resets showOriginal to false (user wants translated content in new language)
   * 3. Updates the cookie for persistence
   * 4. Updates the URL parameter for shareability
   */
  const setLanguage = useCallback(
    (newLanguage: SupportedLanguage) => {
      // Update state
      setCurrentLanguage(newLanguage);

      // Reset showOriginal when changing languages (user wants to see translation)
      setShowOriginal(false);

      // Update cookie for persistence
      setGuestLanguageCookie(newLanguage);

      // Update URL parameter for shareability
      if (pathname) {
        const params = new URLSearchParams(searchParams?.toString() || '');
        params.set(LANG_URL_PARAM, newLanguage);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }

      console.log('[useGuestLanguage] Language changed to:', newLanguage);
    },
    [pathname, searchParams, router]
  );

  // =============================================================================
  // Toggle Original Function
  // =============================================================================

  /**
   * Toggles between viewing translated content and original content.
   *
   * This is a client-side toggle that doesn't refetch data - the parent
   * component should use this state to conditionally render translated
   * vs original content that was already fetched.
   */
  const toggleOriginal = useCallback(() => {
    setShowOriginal((prev) => {
      const newValue = !prev;
      console.log('[useGuestLanguage] Toggle original:', newValue);
      return newValue;
    });
  }, []);

  // =============================================================================
  // Return Hook Value
  // =============================================================================

  return {
    currentLanguage,
    showOriginal,
    setLanguage,
    toggleOriginal,
    isLoading,
    availableLanguages,
    setAvailableLanguages,
  };
}

export default useGuestLanguage;
