'use client';

/**
 * @fileoverview GuestLanguageSwitcher Component (Epic 4 - Guest Experience)
 *
 * Language selector dropdown for guest users viewing shared items. Allows guests
 * to switch between available translations without authentication. Language
 * preference is persisted via cookie for returning guests.
 *
 * @description
 * This component provides:
 * - Accessible dropdown menu using Radix UI DropdownMenu primitives
 * - Visual indicators for available/unavailable translations
 * - Keyboard navigation support (Arrow keys, Enter, Space, Escape)
 * - Cookie persistence for returning guest language preference
 * - Touch-friendly sizing (min 48px height for mobile)
 *
 * All 6 languages are always displayed (en, fr, es, de, nl, it), with visual
 * distinction between available translations (checkmark) and unavailable ones
 * (grayed out, italic). Guests can select any language - unavailable ones will
 * show content in the source language with a translation banner.
 *
 * @module components/guest/GuestLanguageSwitcher
 * @since Epic 4 - Guest Experience
 *
 * @see {@link @/components/ItemManager/components/dialogs/SortMenu} - Radix UI pattern reference
 * @see {@link @/contexts/LocaleContext} - SUPPORTED_LOCALES constant
 * @see {@link @/lib/i18n/guest-language} - Cookie persistence utility
 *
 * @example
 * ```tsx
 * // Basic usage in a parent component
 * import { GuestLanguageSwitcher } from '@/components/guest/GuestLanguageSwitcher';
 *
 * function ItemPage({ item }) {
 *   const [language, setLanguage] = useState<SupportedLanguage>('en');
 *   const availableLanguages = ['en', 'fr', 'es']; // from API
 *
 *   return (
 *     <header className="flex justify-between items-center">
 *       <h1>{item.name}</h1>
 *       <GuestLanguageSwitcher
 *         currentLanguage={language}
 *         availableLanguages={availableLanguages}
 *         onLanguageChange={setLanguage}
 *       />
 *     </header>
 *   );
 * }
 * ```
 *
 * Last Modified: 2026-01-23 14:30
 */

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SupportedLanguage } from '@/types/l10n';
import { SUPPORTED_LANGUAGES } from '@/types/l10n';
import { setGuestLanguageCookie } from '@/lib/i18n/guest-language';

// =============================================================================
// Section 1: Type Definitions
// =============================================================================

/**
 * Props for the GuestLanguageSwitcher component
 *
 * @interface GuestLanguageSwitcherProps
 * @since Epic 4 - Guest Experience
 *
 * @example
 * ```tsx
 * const props: GuestLanguageSwitcherProps = {
 *   currentLanguage: 'fr',
 *   availableLanguages: ['en', 'fr', 'es'],
 *   onLanguageChange: (lang) => console.log('Selected:', lang),
 *   className: 'ml-auto',
 * };
 * ```
 */
export interface GuestLanguageSwitcherProps {
  /**
   * Currently selected language code. Controls which language is highlighted
   * in the dropdown and displayed in the trigger button.
   */
  currentLanguage: SupportedLanguage;

  /**
   * Array of language codes that have translations available. Languages in this
   * array show a checkmark icon. Languages not in this array are grayed out
   * and italic, but still selectable (for fallback viewing).
   */
  availableLanguages: SupportedLanguage[];

  /**
   * Callback function invoked when user selects a language. Called before
   * cookie persistence, so parent can update state immediately. Receives
   * the selected language code.
   */
  onLanguageChange: (language: SupportedLanguage) => void;

  /**
   * Optional additional CSS classes to apply to the trigger button.
   * Useful for positioning (e.g., 'ml-auto') or size adjustments.
   */
  className?: string;
}

// =============================================================================
// Section 2: Component Implementation
// =============================================================================

/**
 * Language selector dropdown for guest users viewing shared items.
 *
 * Displays all 6 supported languages with visual indicators for availability.
 * Selected language is highlighted, available languages show checkmarks,
 * and unavailable languages are grayed out but still selectable.
 *
 * @component
 * @since Epic 4 - Guest Experience
 *
 * @param props - Component props
 * @param props.currentLanguage - Currently selected language code
 * @param props.availableLanguages - Array of languages with translations available
 * @param props.onLanguageChange - Callback when user selects a language
 * @param props.className - Optional additional CSS classes for trigger button
 *
 * @returns JSX.Element - Radix UI DropdownMenu with language options
 *
 * @example
 * ```tsx
 * <GuestLanguageSwitcher
 *   currentLanguage="en"
 *   availableLanguages={['en', 'fr', 'es']}
 *   onLanguageChange={(lang) => setLanguage(lang)}
 *   className="ml-auto"
 * />
 * ```
 *
 * @accessibility
 * - Keyboard navigation: Arrow keys navigate, Enter/Space select, Escape closes
 * - Screen readers: Trigger announces as button with "Select language" label
 * - Touch targets: Minimum 48px height for mobile accessibility
 * - Focus indicators: Visible focus ring on trigger and menu items
 */
export function GuestLanguageSwitcher({
  currentLanguage,
  availableLanguages,
  onLanguageChange,
  className,
}: GuestLanguageSwitcherProps) {
  // Find metadata for current language (flag, native name, etc.)
  // Note: currentLocale should always exist for valid SupportedLanguage values
  const currentLocale = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage);

  /**
   * Handle language selection with cookie persistence.
   *
   * Calls parent callback first for immediate state update, then persists
   * selection via cookie. Cookie failure is non-critical and logged as warning.
   *
   * @param language - Selected language code
   */
  const handleLanguageChange = (language: SupportedLanguage) => {
    // Call parent callback first for immediate UI update
    onLanguageChange(language);

    // Persist selection via cookie for returning guests
    // Cookie failure is non-critical - log warning and continue
    try {
      setGuestLanguageCookie(language);
    } catch (error) {
      console.warn('[GuestLanguageSwitcher] Failed to set cookie:', error);
    }
  };

  return (
    // Radix UI manages open/close state internally - no useState needed
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Select language"
          className={cn(
            // Base layout
            'inline-flex items-center justify-between gap-3',
            // Sizing
            'px-3 py-2 min-w-[160px]',
            // Border and background
            'border border-gray-300 bg-white rounded-lg',
            // Text styling
            'text-sm font-medium text-gray-700',
            // Hover states
            'hover:bg-gray-50 hover:border-gray-400',
            // Focus ring
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
            // Transition
            'transition-colors duration-150',
            // Disabled state
            'disabled:opacity-50 disabled:cursor-not-allowed',
            // Custom className
            className
          )}
        >
          {/* Current language display: flag + native name */}
          <span className="flex items-center gap-2">
            <span className="text-lg">{currentLocale?.flag}</span>
            <span>{currentLocale?.nativeName}</span>
          </span>
          {/* Dropdown indicator */}
          <ChevronDown className="w-4 h-4" />
        </button>
      </DropdownMenu.Trigger>

      {/* Portal renders dropdown at document root to avoid overflow issues */}
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className={cn(
            // Width and padding
            'w-64 p-1',
            // Background and border
            'bg-white border border-gray-200 rounded-lg',
            // Shadow for depth
            'shadow-lg',
            // Z-index to appear above other content
            'z-50',
            // Entry animations
            'animate-in fade-in-0 zoom-in-95',
            // Directional slide animations based on position
            'data-[side=bottom]:slide-in-from-top-2',
            'data-[side=top]:slide-in-from-bottom-2'
          )}
        >
          {/* Render all 6 supported languages */}
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isAvailable = availableLanguages.includes(lang.code);
            const isSelected = lang.code === currentLanguage;

            return (
              <DropdownMenu.Item
                key={lang.code}
                onSelect={() => handleLanguageChange(lang.code)}
                className={cn(
                  // Base layout
                  'flex items-center justify-between gap-3',
                  // Touch-friendly sizing (min 48px height)
                  'px-3 py-2.5 min-h-[48px]',
                  // Base text and interaction
                  'text-sm rounded-md outline-none cursor-pointer',
                  // Transition
                  'transition-colors duration-150',
                  // Conditional styling based on state
                  isSelected && 'bg-blue-50 text-blue-900 font-semibold',
                  !isSelected && isAvailable && 'text-gray-900 hover:bg-blue-50',
                  !isAvailable && 'text-gray-400 italic hover:bg-gray-50',
                  // Focus state for keyboard navigation
                  'focus:bg-blue-50'
                )}
              >
                {/* Left section: flag and native name */}
                <span className="flex items-center gap-3">
                  <span
                    className={cn('text-xl', !isAvailable && 'opacity-50')}
                  >
                    {lang.flag}
                  </span>
                  <span>{lang.nativeName}</span>
                </span>

                {/* Right section: checkmark for available languages */}
                {isAvailable && (
                  <Check className="w-4 h-4 text-green-600" />
                )}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
