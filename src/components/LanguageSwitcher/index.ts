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
