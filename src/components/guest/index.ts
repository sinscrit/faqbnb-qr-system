/**
 * Guest Components Barrel Export
 *
 * Epic 4: L10N Guest Experience Components
 * Provides translation UI, language controls, and indicators for unauthenticated users.
 *
 * @module components/guest
 * @lastModified 2026-01-23
 */

// =============================================================================
// Language Controls (REQ-E04-008)
// =============================================================================

/**
 * GuestLanguageSwitcher - Dropdown for selecting display language
 * Features: All 6 languages, flag emojis, checkmarks for available translations
 */
export { GuestLanguageSwitcher } from './GuestLanguageSwitcher';
export type { GuestLanguageSwitcherProps } from './GuestLanguageSwitcher';

// =============================================================================
// Translation Banners (REQ-E04-009, REQ-E04-010)
// =============================================================================

/**
 * TranslationBanner - Shows when viewing translated content
 * Features: Blue banner, "Translated from X", "View original" link
 */
export { TranslationBanner } from './TranslationBanner';
export type { TranslationBannerProps } from './TranslationBanner';

/**
 * MissingTranslationBanner - Shows when translation unavailable (fallback content)
 * Features: Gray muted banner, "X translation not available. Showing content in Y."
 */
export { MissingTranslationBanner } from './MissingTranslationBanner';
export type { MissingTranslationBannerProps } from './MissingTranslationBanner';

// =============================================================================
// Toggle Controls (REQ-E04-011)
// =============================================================================

/**
 * ViewOriginalToggle - Button to switch between translated and original content
 * Features: Secondary button style, "View in original (X)" / "View translation"
 */
export { ViewOriginalToggle } from './ViewOriginalToggle';
export type { ViewOriginalToggleProps } from './ViewOriginalToggle';

// =============================================================================
// Indicators (REQ-E04-012)
// =============================================================================

/**
 * LanguageIndicator - Compact display of current language with flag
 * Features: Flag emoji + native name, optional "Translated from X" subtitle
 * Use case: Headers, status bars
 */
export { LanguageIndicator } from './LanguageIndicator';
export type { LanguageIndicatorProps } from './LanguageIndicator';
