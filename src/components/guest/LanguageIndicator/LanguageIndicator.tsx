'use client';

import type { JSX } from 'react';

/**
 * @fileoverview LanguageIndicator Component
 *
 * A small, inline badge component that displays the current content language.
 * This component is purely presentational and read-only - it shows information
 * but doesn't allow interaction.
 *
 * @description
 * A compact visual indicator showing the current language of displayed content.
 * Used to inform guests what language they're viewing content in without taking
 * up significant space. This is a stateless, presentational component.
 *
 * @design-decision Compact Badge Styling
 * Uses a small, pill-shaped badge with muted gray colors (bg-gray-100, text-gray-600)
 * to blend with content while still being visible. The compact size allows it to be
 * placed inline with other elements without disrupting layout.
 *
 * @design-decision No Interactive Elements
 * This component is purely informational. For language switching, users should use
 * the GuestLanguageSwitcher component. This follows the single-responsibility principle
 * and keeps the indicator lightweight.
 *
 * @design-decision English Language Names
 * Language names are displayed in English for all users (e.g., "English", "French")
 * for consistency with other Epic 4 components. This avoids circular translation
 * dependencies and ensures consistent display.
 *
 * @accessibility
 * - Uses role="status" to identify as a status indicator
 * - Uses aria-label to provide context about what the badge represents
 * - Muted colors still meet WCAG AA contrast requirements
 * - No interactive elements - purely informational
 *
 * @since Epic 4 - Guest Experience
 *
 * @see src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx
 *      For interactive language selection
 * @see src/components/guest/TranslationBanner/TranslationBanner.tsx
 *      For translation status messaging
 *
 * @example
 * // Basic usage - show current content language
 * <LanguageIndicator language="fr" />
 *
 * @example
 * // With custom styling
 * <LanguageIndicator language="de" className="ml-2" />
 *
 * @example
 * // In a content header
 * function ItemHeader({ item, displayLanguage }) {
 *   return (
 *     <div className="flex items-center gap-2">
 *       <h1>{item.title}</h1>
 *       <LanguageIndicator language={displayLanguage} />
 *     </div>
 *   );
 * }
 *
 * Last Modified: 2026-01-23 16:15
 */

import { cn } from '@/lib/utils';
import type { SupportedLanguage } from '@/types/l10n';

/**
 * Props for the LanguageIndicator component.
 *
 * @interface LanguageIndicatorProps
 * @property {SupportedLanguage} language - The language code to display
 * @property {string} [className] - Optional additional CSS classes for custom styling
 */
export interface LanguageIndicatorProps {
  /**
   * The language code currently being displayed.
   * Will be formatted to full English name (e.g., 'fr' → 'French').
   * @example language="en" // Displays "English"
   */
  language: SupportedLanguage;

  /**
   * Optional CSS classes for external styling.
   * Useful for adding margins or adjusting positioning.
   * @example className="ml-2" // Add left margin
   */
  className?: string;
}

/**
 * Maps language codes to English names for display.
 *
 * Uses English names for all users for consistency with other Epic 4 components.
 * This avoids circular translation dependencies and ensures consistent display.
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
 * LanguageIndicator - Displays current content language as a compact badge.
 *
 * A stateless, presentational component that shows the current language of
 * displayed content as a small, pill-shaped badge. This is a read-only
 * indicator - for language switching, use GuestLanguageSwitcher.
 *
 * @component
 * @param {LanguageIndicatorProps} props - Component props
 * @param {SupportedLanguage} props.language - Language code to display
 * @param {string} [props.className] - Optional additional CSS classes
 * @returns {JSX.Element} The rendered language indicator badge
 *
 * @accessibility
 * - role="status" identifies this as a status indicator
 * - aria-label provides context about what the badge represents
 * - Text color meets WCAG AA contrast requirements on gray-100 background
 */
export function LanguageIndicator({
  language,
  className,
}: LanguageIndicatorProps): JSX.Element {
  const languageName = formatLanguageName(language);

  return (
    <span
      role="status"
      aria-label={`Content language: ${languageName}`}
      className={cn(
        // Inline display for flow with other elements
        'inline-flex items-center',
        // Compact padding for pill shape
        'px-2.5 py-0.5',
        // Pill/badge shape
        'rounded-full',
        // Muted background color - subtle but visible
        'bg-gray-100',
        // Text styling - small, readable, muted
        'text-xs font-medium text-gray-600',
        // Allow external styling
        className
      )}
    >
      {languageName}
    </span>
  );
}

// Support both named and default imports
export default LanguageIndicator;
