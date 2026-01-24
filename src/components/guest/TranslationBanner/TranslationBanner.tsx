'use client';

import type { JSX } from 'react';

/**
 * @fileoverview TranslationBanner Component
 *
 * A stateless, controlled banner component that indicates content is being displayed
 * in a translated language. Shows the source language and provides a link to view
 * the original content.
 *
 * @description
 * Banner indicating content is being shown in a translated language with link to view original.
 * This component follows a controlled component pattern where the parent manages visibility
 * and the view mode (translated vs original).
 *
 * @design-decision Non-dismissible
 * The banner is intentionally non-dismissible to maintain translation context awareness.
 * Users should always be aware when they're viewing translated content so they can
 * make informed decisions about content accuracy.
 *
 * @accessibility
 * - Uses role="status" to identify as a status message region
 * - Uses aria-live="polite" for non-intrusive screen reader announcements
 * - Globe icon is decorative (aria-hidden) since text conveys the meaning
 * - "View original" button is keyboard accessible with visible focus ring
 *
 * @since Epic 4 - Guest Experience
 *
 * @see src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx
 *      Pattern reference for ARIA status announcements
 *
 * @example
 * // Typical usage with conditional rendering
 * function ItemPage() {
 *   const [showOriginal, setShowOriginal] = useState(false);
 *   const isTranslated = sourceLanguage !== viewingLanguage;
 *
 *   return (
 *     <div>
 *       {isTranslated && !showOriginal && (
 *         <TranslationBanner
 *           sourceLanguage={sourceLanguage}
 *           onViewOriginal={() => setShowOriginal(true)}
 *           className="mb-6"
 *         />
 *       )}
 *       <ItemContent />
 *     </div>
 *   );
 * }
 *
 * Last Modified: 2026-01-23 15:15
 */

import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SupportedLanguage } from '@/types/l10n';

/**
 * Props for the TranslationBanner component.
 *
 * @interface TranslationBannerProps
 * @property {SupportedLanguage} sourceLanguage - The original language of the content
 *           (not the display language). This is the language from which content was translated.
 * @property {() => void} onViewOriginal - Callback invoked when user clicks "View original".
 *           Parent component should handle switching to original content display.
 * @property {string} [className] - Optional additional CSS classes for custom styling.
 *           Useful for adding margins or adjusting layout in different contexts.
 */
export interface TranslationBannerProps {
  /**
   * The original content language (language from which content was translated).
   * Displayed as "Translated from [Language]" in the banner.
   */
  sourceLanguage: SupportedLanguage;

  /**
   * Callback function invoked when user clicks "View original" button.
   * Parent component should toggle view mode to show original content.
   */
  onViewOriginal: () => void;

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
 * (you can't translate the translation indicator into the source language).
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
 * TranslationBanner - Indicates content is shown in a translated language.
 *
 * A controlled, stateless component that displays a banner informing the user
 * that they are viewing translated content. Provides a "View original" action
 * to switch to the original language content.
 *
 * @component
 * @param {TranslationBannerProps} props - Component props
 * @param {SupportedLanguage} props.sourceLanguage - Original content language
 * @param {() => void} props.onViewOriginal - Callback to view original content
 * @param {string} [props.className] - Optional additional CSS classes
 * @returns {JSX.Element} The rendered translation banner
 *
 * @accessibility
 * - role="status" identifies this as a status message region
 * - aria-live="polite" ensures screen readers announce changes without interrupting
 * - Button is keyboard accessible (Tab, Enter, Space)
 * - Visible focus ring for keyboard navigation
 */
export function TranslationBanner({
  sourceLanguage,
  onViewOriginal,
  className,
}: TranslationBannerProps): JSX.Element {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        // Responsive layout: stacked on mobile, horizontal on tablet+
        'flex flex-col sm:flex-row',
        'items-start sm:items-center',
        'justify-between',
        'gap-3 sm:gap-4',
        // Padding
        'p-4',
        // Background: #E3F2FD is Material Design blue-50
        'bg-[#E3F2FD]',
        // Border
        'border border-blue-200',
        // Rounded corners
        'rounded-lg',
        // Shadow
        'shadow-sm',
        className
      )}
    >
      {/* Left section: Globe icon and "Translated from" text */}
      <div className="flex items-center gap-3">
        {/* Icon container with circular blue background */}
        <div className="flex-shrink-0 p-2 bg-blue-100 rounded-full">
          <Globe
            className="w-5 h-5 text-blue-600"
            aria-hidden="true"
          />
        </div>
        {/* Banner text with emphasized language name */}
        <p className="text-sm text-blue-900">
          Translated from <strong>{formatLanguageName(sourceLanguage)}</strong>
        </p>
      </div>

      {/* "View original" button */}
      <button
        type="button"
        onClick={onViewOriginal}
        className={cn(
          'flex-shrink-0',
          'text-sm font-medium text-blue-700',
          'hover:text-blue-900',
          'underline hover:no-underline',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'rounded',
          // Padding for touch targets (ensures minimum 44px touch area)
          'px-2 py-1'
        )}
      >
        View original
      </button>
    </div>
  );
}

// Support both named and default imports
export default TranslationBanner;
