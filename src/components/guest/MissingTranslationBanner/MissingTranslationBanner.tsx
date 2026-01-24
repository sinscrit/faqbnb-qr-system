'use client';

import type { JSX } from 'react';

/**
 * @fileoverview MissingTranslationBanner Component
 *
 * A stateless, presentational banner component that indicates content is being displayed
 * in a fallback language because the requested translation is not available.
 *
 * @description
 * Banner displaying when requested translation is not available and content is shown
 * in a fallback language. This component follows a controlled component pattern where
 * the parent manages visibility based on translation availability metadata.
 *
 * @design-decision Muted Gray Styling
 * The banner uses muted gray colors (bg-gray-50, text-gray-600, icon gray-500) to
 * inform users without alarming them. This contrasts with TranslationBanner's blue
 * styling which conveys successful/active translation. Gray conveys neutral information.
 *
 * @design-decision No Interactive Elements
 * Unlike TranslationBanner which has a "View original" button, this banner is purely
 * informational. There's no action the user can take - they're already viewing the
 * fallback language content because the requested translation doesn't exist.
 *
 * @accessibility
 * - Uses role="status" to identify as a status message region
 * - Uses aria-live="polite" for non-intrusive screen reader announcements
 * - Info icon is decorative (aria-hidden) since text conveys the meaning
 * - No interactive elements - purely informational display
 *
 * @since Epic 4 - Guest Experience
 *
 * @see src/components/guest/TranslationBanner/TranslationBanner.tsx
 *      Related component for successful translation scenarios
 * @see src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx
 *      Pattern reference for ARIA status announcements
 *
 * @example
 * // Show when requested translation is unavailable
 * function ItemPage({ item, requestedLanguage }) {
 *   const hasTranslation = item.translations[requestedLanguage];
 *   const displayLanguage = hasTranslation ? requestedLanguage : item.sourceLanguage;
 *
 *   return (
 *     <div>
 *       {!hasTranslation && requestedLanguage !== item.sourceLanguage && (
 *         <MissingTranslationBanner
 *           requestedLanguage={requestedLanguage}
 *           fallbackLanguage={item.sourceLanguage}
 *           className="mb-6"
 *         />
 *       )}
 *       <ItemContent language={displayLanguage} />
 *     </div>
 *   );
 * }
 *
 * @example
 * // Mutual exclusivity with TranslationBanner
 * // Only ONE banner should display at a time:
 * // - MissingTranslationBanner: requested translation not available, showing fallback
 * // - TranslationBanner: showing translated content (can view original)
 * // - No banner: viewing content in its source language
 *
 * Last Modified: 2026-01-23 15:45
 */

import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SupportedLanguage } from '@/types/l10n';

/**
 * Props for the MissingTranslationBanner component.
 *
 * @interface MissingTranslationBannerProps
 * @property {SupportedLanguage} requestedLanguage - The language the user requested but is unavailable
 * @property {SupportedLanguage} fallbackLanguage - The language being displayed instead
 * @property {string} [className] - Optional additional CSS classes for custom styling
 */
export interface MissingTranslationBannerProps {
  /**
   * The language the user requested but is not available.
   * This is the language they wanted to view content in.
   * @example 'fr' // User wanted French but it's not available
   */
  requestedLanguage: SupportedLanguage;

  /**
   * The language being displayed instead of the requested language.
   * Typically the item's source language or English as default.
   * @example 'en' // Showing content in English as fallback
   */
  fallbackLanguage: SupportedLanguage;

  /**
   * Optional CSS classes for external styling.
   * @example className="mb-6" // Add bottom margin for spacing
   */
  className?: string;
}

/**
 * Maps language codes to English names for display.
 *
 * Uses English names for all users as this is meta-information about content,
 * not content itself. This avoids circular translation dependency issues
 * and matches the TranslationBanner approach.
 *
 * @param lang - The language code to format
 * @returns The English name of the language
 */
function formatLanguageName(lang: SupportedLanguage): string {
  const languageNames: Record<SupportedLanguage, string> = {
    en: 'English',
    fr: 'French',
    es: 'Spanish',
    de: 'German',
    nl: 'Dutch',
    it: 'Italian',
  };
  return languageNames[lang];
}

/**
 * MissingTranslationBanner - Indicates requested translation is unavailable.
 *
 * A stateless, presentational component that displays a muted gray banner
 * informing the user that their requested translation is not available and
 * content is being shown in a fallback language.
 *
 * @component
 * @param {MissingTranslationBannerProps} props - Component props
 * @param {SupportedLanguage} props.requestedLanguage - Language user wanted (unavailable)
 * @param {SupportedLanguage} props.fallbackLanguage - Language being displayed instead
 * @param {string} [props.className] - Optional additional CSS classes
 * @returns {JSX.Element} The rendered missing translation banner
 *
 * @accessibility
 * - role="status" identifies this as a status message region
 * - aria-live="polite" ensures screen readers announce without interrupting
 * - Info icon has aria-hidden="true" as decorative element
 */
export function MissingTranslationBanner({
  requestedLanguage,
  fallbackLanguage,
  className,
}: MissingTranslationBannerProps): JSX.Element {
  const requestedLangName = formatLanguageName(requestedLanguage);
  const fallbackLangName = formatLanguageName(fallbackLanguage);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        // Layout: horizontal flex with centered items
        'flex items-center gap-3',
        // Padding
        'p-4',
        // Muted gray background - inform without alarming
        'bg-gray-50',
        // Subtle gray border
        'border border-gray-200',
        // Rounded corners
        'rounded-lg',
        // Shadow
        'shadow-sm',
        className
      )}
    >
      {/* Icon container with circular gray background */}
      <div className="flex-shrink-0 p-2 bg-gray-100 rounded-full">
        <Info
          className="w-5 h-5 text-gray-500"
          aria-hidden="true"
        />
      </div>
      {/* Banner text with emphasized language names */}
      <p className="text-sm text-gray-600">
        <strong>{requestedLangName}</strong> translation not available.{' '}
        Showing content in <strong>{fallbackLangName}</strong>.
      </p>
    </div>
  );
}

// Support both named and default imports
export default MissingTranslationBanner;
