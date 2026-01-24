'use client';

import type { JSX } from 'react';

/**
 * @fileoverview ViewOriginalToggle Component
 *
 * A controlled toggle button component for switching between translated content
 * and original content in the guest-facing item display.
 *
 * @description
 * Toggle button for switching between translated content and original content.
 * This component follows a controlled component pattern where the parent manages
 * the toggle state (isViewingOriginal). The button text changes based on the
 * current view state to describe the action that will occur on click.
 *
 * @design-decision Secondary Button Styling
 * Uses the exact same styling as ActionButtons secondary variant (white background,
 * dark border, dark text) for visual consistency with the dashboard UI. This
 * ensures the toggle button fits naturally alongside other action buttons.
 *
 * @design-decision Controlled Component Pattern
 * The parent component manages the isViewingOriginal state rather than this
 * component managing internal state. This allows the parent to coordinate view
 * state with other components (banners, content display) and provides a single
 * source of truth for the current view mode.
 *
 * @design-decision Dynamic Button Text
 * Button text describes the ACTION that will happen on click, not the current state:
 * - When viewing translated: "View in original (English)" - clicking shows original
 * - When viewing original: "View translation" - clicking shows translated version
 *
 * @accessibility
 * - Uses aria-pressed to communicate toggle state to screen readers
 * - Uses aria-label to provide context about the action
 * - Languages icon is decorative (aria-hidden) since text conveys the meaning
 * - Minimum 48px touch target meets WCAG 2.5.5 requirements
 * - Focus-visible ring for keyboard navigation
 *
 * @since Epic 4 - Guest Experience
 *
 * @see src/components/SimpleDashboard/ActionButtons.tsx
 *      Pattern reference for secondary button styling
 * @see src/components/guest/TranslationBanner/TranslationBanner.tsx
 *      Related component that uses this toggle button
 *
 * @example
 * // Basic usage with state management
 * function ItemPage({ item }) {
 *   const [isViewingOriginal, setIsViewingOriginal] = useState(false);
 *
 *   return (
 *     <div>
 *       <ViewOriginalToggle
 *         isViewingOriginal={isViewingOriginal}
 *         originalLanguage={item.sourceLanguage}
 *         onToggle={() => setIsViewingOriginal(!isViewingOriginal)}
 *       />
 *       <ItemContent showOriginal={isViewingOriginal} />
 *     </div>
 *   );
 * }
 *
 * @example
 * // Integration with TranslationBanner
 * // The banner's onViewOriginal callback can trigger the same state change
 * function ItemDisplay({ item, requestedLanguage }) {
 *   const [isViewingOriginal, setIsViewingOriginal] = useState(false);
 *   const isTranslated = item.translations[requestedLanguage] !== undefined;
 *
 *   return (
 *     <div>
 *       {isTranslated && !isViewingOriginal && (
 *         <TranslationBanner
 *           sourceLanguage={item.sourceLanguage}
 *           onViewOriginal={() => setIsViewingOriginal(true)}
 *         />
 *       )}
 *       <ViewOriginalToggle
 *         isViewingOriginal={isViewingOriginal}
 *         originalLanguage={item.sourceLanguage}
 *         onToggle={() => setIsViewingOriginal(!isViewingOriginal)}
 *       />
 *     </div>
 *   );
 * }
 *
 * Last Modified: 2026-01-23 16:00
 */

import { Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SupportedLanguage } from '@/types/l10n';

/**
 * Props for the ViewOriginalToggle component.
 *
 * @interface ViewOriginalToggleProps
 * @property {boolean} isViewingOriginal - Current view state (true = viewing original, false = viewing translated)
 * @property {SupportedLanguage} originalLanguage - The original/source language of the content
 * @property {() => void} onToggle - Callback function called when button is clicked to toggle view
 * @property {string} [className] - Optional additional CSS classes for custom styling
 * @property {boolean} [disabled] - Whether the button is disabled (default: false)
 */
export interface ViewOriginalToggleProps {
  /**
   * Current view state indicating whether user is viewing original content.
   * - true: Currently viewing original (untranslated) content
   * - false: Currently viewing translated content
   * @example isViewingOriginal={false} // User is viewing translated version
   */
  isViewingOriginal: boolean;

  /**
   * The original/source language of the content.
   * Displayed in button text when viewing translated: "View in original (English)"
   * @example originalLanguage="en" // Content was originally written in English
   */
  originalLanguage: SupportedLanguage;

  /**
   * Callback function invoked when the button is clicked.
   * Parent component should toggle the isViewingOriginal state in this callback.
   * @example onToggle={() => setIsViewingOriginal(!isViewingOriginal)}
   */
  onToggle: () => void;

  /**
   * Optional CSS classes for external styling.
   * @example className="w-full mt-4" // Full width with top margin
   */
  className?: string;

  /**
   * Whether the button is disabled.
   * When disabled, button shows reduced opacity and cannot be clicked.
   * @default false
   */
  disabled?: boolean;
}

/**
 * Maps language codes to English names for display.
 *
 * Uses English names for all users as this is meta-information about content,
 * not content itself. This matches the approach used in TranslationBanner
 * and MissingTranslationBanner for consistency.
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
 * ViewOriginalToggle - Toggle between translated and original content.
 *
 * A controlled button component that allows users to switch between viewing
 * translated content and the original content. Follows ActionButtons secondary
 * button styling pattern for visual consistency.
 *
 * @component
 * @param {ViewOriginalToggleProps} props - Component props
 * @param {boolean} props.isViewingOriginal - Current view state
 * @param {SupportedLanguage} props.originalLanguage - Original language of content
 * @param {() => void} props.onToggle - Toggle callback function
 * @param {string} [props.className] - Optional additional CSS classes
 * @param {boolean} [props.disabled] - Whether button is disabled
 * @returns {JSX.Element} The rendered toggle button
 *
 * @accessibility
 * - type="button" explicitly sets button type
 * - aria-pressed communicates toggle state to screen readers
 * - aria-label provides context about the action that will occur
 * - Minimum 48px height meets WCAG 2.5.5 touch target requirements
 * - Focus-visible ring for keyboard navigation
 */
export function ViewOriginalToggle({
  isViewingOriginal,
  originalLanguage,
  onToggle,
  className,
  disabled = false,
}: ViewOriginalToggleProps): JSX.Element {
  // Button text describes the ACTION that will happen on click
  // When viewing translated → action is to view original
  // When viewing original → action is to view translation
  const buttonText = isViewingOriginal
    ? 'View translation'
    : `View in original (${formatLanguageName(originalLanguage)})`;

  // Aria-label provides more context for screen readers
  const ariaLabel = isViewingOriginal
    ? 'Switch to translated version'
    : `Switch to original ${formatLanguageName(originalLanguage)} version`;

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-label={ariaLabel}
      // aria-pressed indicates current toggle state (true/false)
      aria-pressed={isViewingOriginal}
      className={cn(
        // Base layout classes - following ActionButtons pattern
        'flex items-center justify-center gap-2',
        // Touch-friendly sizing - 48px minimum height for WCAG 2.5.5
        'min-h-[48px] px-6 py-3.5',
        // Border radius and typography
        'rounded-lg font-medium text-base',
        // Smooth transitions for hover/active states
        'transition-all duration-200 ease-out',
        // Focus ring for keyboard users
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-[#222222] focus-visible:ring-offset-2',
        // Secondary variant styling - white background with dark border
        'bg-white border border-[#222222] text-[#222222]',
        // Hover effect - scale up and light gray background
        'hover:scale-[1.02] hover:bg-[#F7F7F7]',
        // Active effect - scale down
        'active:scale-[0.98]',
        // Disabled state styling
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {/* Languages icon represents translation toggle - decorative */}
      <Languages className="w-5 h-5" aria-hidden="true" />
      <span>{buttonText}</span>
    </button>
  );
}

// Support both named and default imports
export default ViewOriginalToggle;
