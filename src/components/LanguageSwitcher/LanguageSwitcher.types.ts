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
