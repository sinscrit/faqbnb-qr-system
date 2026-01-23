/**
 * @fileoverview Guest-facing Localization Types for Epic 4 - Guest Experience
 *
 * This module provides TypeScript types for guest-facing localized content.
 * It establishes the type system for displaying translated items, articles,
 * links, and tags to guests based on their language preferences.
 *
 * @description
 * These types support the localization flow where:
 * 1. Guests access items via QR codes or direct links
 * 2. The system detects their preferred language
 * 3. Translated content is served when available
 * 4. Original content is displayed as fallback
 *
 * @relationship
 * - Builds on Epic 1's `SupportedLanguage` type from LocaleContext (admin UI)
 * - Aligns with Epic 3's translation database tables (item_translations, etc.)
 * - Used by Epic 4's guest-facing API endpoints and components
 *
 * @since Epic 4 - Guest Experience
 * @see /src/contexts/LocaleContext.tsx - Source of SupportedLanguage type
 * @see docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md - Implementation plan
 *
 * @example
 * ```typescript
 * import {
 *   SupportedLanguage,
 *   SUPPORTED_LANGUAGES,
 *   TranslatedItem,
 *   GuestContentResponse
 * } from '@/types';
 *
 * // Use language info for UI
 * const lang = SUPPORTED_LANGUAGES.find(l => l.code === 'fr');
 * console.log(lang?.nativeName); // "Français"
 *
 * // Type-safe translated content
 * const item: TranslatedItem = {
 *   id: '123',
 *   publicId: 'abc',
 *   name: 'Cafetière',
 *   description: 'Machine à café automatique',
 *   displayLanguage: 'fr',
 *   sourceLanguage: 'en',
 *   isTranslated: true,
 *   translationStatus: 'completed',
 *   originalName: 'Coffee Maker',
 *   originalDescription: 'Automatic coffee machine'
 * };
 * ```
 *
 * Last Modified: 2026-01-23 10:15
 */

import type { SupportedLanguage as LocaleContextSupportedLanguage } from '@/contexts/LocaleContext';

// =============================================================================
// Section 1: Core Type Definitions
// =============================================================================

/**
 * Supported language codes for the application.
 *
 * Re-exported from LocaleContext to ensure type compatibility between
 * admin UI (Epic 1/2, which uses next-intl) and guest-facing features
 * (Epic 4, which uses these l10n types).
 *
 * @since Epic 4 - Guest Experience
 * @see /src/contexts/LocaleContext.tsx - Original definition
 */
export type SupportedLanguage = LocaleContextSupportedLanguage;

/**
 * Metadata for a supported language including display names and flag.
 *
 * @description
 * Provides all necessary information for displaying language options
 * in language switchers and language selection UI components.
 *
 * @since Epic 4 - Guest Experience
 */
export interface LanguageInfo {
  /** ISO 639-1 language code */
  code: SupportedLanguage;
  /** Language name in English (e.g., "French") */
  name: string;
  /** Language name in the native language (e.g., "Français") */
  nativeName: string;
  /** Optional flag emoji for visual representation */
  flag?: string;
}

/**
 * Complete metadata for all supported languages.
 *
 * Contains all 6 supported languages with their English names,
 * native names, and flag emojis for use in language switchers
 * and language selection components.
 *
 * @since Epic 4 - Guest Experience
 */
export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
];

// =============================================================================
// Section 2: Translation Metadata Interfaces
// =============================================================================

/**
 * Base interface for all translated content.
 *
 * @description
 * Provides common fields that all translatable content types share,
 * including the display and source languages, translation status,
 * and a flag indicating whether the content is showing a translation.
 *
 * @since Epic 4 - Guest Experience
 * @see TranslatedItem - Item-specific extension
 * @see TranslatedArticle - Article-specific extension
 * @see TranslatedLink - Link-specific extension
 */
export interface TranslatedContent {
  /** The language the content is currently displayed in */
  displayLanguage: SupportedLanguage;
  /** The original language the content was authored in */
  sourceLanguage: SupportedLanguage;
  /** Whether the displayed content is a translation (true) or original (false) */
  isTranslated: boolean;
  /**
   * Current status of the translation for this content.
   * - 'completed': Translation is available and being displayed
   * - 'pending': Translation is queued but not yet processed
   * - 'failed': Translation attempt failed, showing original content
   */
  translationStatus?: 'completed' | 'pending' | 'failed';
}

/**
 * Translated item content with translation metadata.
 *
 * @description
 * Represents an item with its translated name and description,
 * plus the original values for reference or fallback display.
 * Corresponds to the `item_translations` database table from Epic 3.
 *
 * @since Epic 4 - Guest Experience
 * @see item_translations table in Epic 3 database schema
 */
export interface TranslatedItem extends TranslatedContent {
  /** Unique database identifier */
  id: string;
  /** Public-facing identifier used in URLs */
  publicId: string;
  /** Translated or original item name */
  name: string;
  /** Translated or original item description */
  description: string | null;
  /**
   * Original item name in source language.
   * Populated when displaying translated content for reference.
   */
  originalName?: string;
  /**
   * Original item description in source language.
   * Populated when displaying translated content for reference.
   */
  originalDescription?: string | null;
}

/**
 * Translated article content with translation metadata.
 *
 * @description
 * Represents an article (grouped content by purpose) with its translated
 * title and description, plus associated translated links.
 * Corresponds to the `article_translations` database table from Epic 3.
 *
 * @since Epic 4 - Guest Experience
 * @see article_translations table in Epic 3 database schema
 */
export interface TranslatedArticle extends TranslatedContent {
  /** Unique database identifier */
  id: string;
  /** Translated or original article title */
  title: string;
  /** Translated or original article description */
  description: string | null;
  /**
   * Original article title in source language.
   * Populated when displaying translated content for reference.
   */
  originalTitle?: string;
  /**
   * Original article description in source language.
   * Populated when displaying translated content for reference.
   */
  originalDescription?: string | null;
  /** Associated links, also translated */
  links: TranslatedLink[];
}

/**
 * Translated link content with translation metadata.
 *
 * @description
 * Represents a link with its translated title. Note that URLs are never
 * translated as they are language-agnostic resources.
 * Corresponds to the `link_translations` database table from Epic 3.
 *
 * @since Epic 4 - Guest Experience
 * @see link_translations table in Epic 3 database schema
 */
export interface TranslatedLink extends TranslatedContent {
  /** Unique database identifier */
  id: string;
  /** Translated or original link title */
  title: string;
  /** Link URL - URLs are never translated (language-agnostic resources) */
  url: string;
  /** Optional thumbnail URL for link preview */
  thumbnailUrl: string | null;
  /**
   * Original link title in source language.
   * Populated when displaying translated content for reference.
   */
  originalTitle?: string;
}

/**
 * Translated tag for categorization.
 *
 * @description
 * Represents a tag with its translated display value. Tags use a
 * key-based system where the key remains constant and only the
 * display value changes per language.
 * Corresponds to the `tag_translations` database table from Epic 3.
 *
 * @since Epic 4 - Guest Experience
 * @see tag_translations table in Epic 3 database schema
 */
export interface TranslatedTag {
  /** Tag key (constant across languages, e.g., "room.kitchen") */
  key: string;
  /** Translated display value shown to users */
  displayValue: string;
  /** Whether this display value is a translation or the original */
  isTranslated: boolean;
}

// =============================================================================
// Section 3: Guest API Response Types
// =============================================================================

/**
 * Complete response for guest-facing content API.
 *
 * @description
 * This interface defines the structure returned by guest-facing API endpoints
 * when retrieving item content. It includes the main content (item, articles,
 * tags) along with translation metadata that informs the client about the
 * language being displayed and what alternatives are available.
 *
 * @since Epic 4 - Guest Experience
 * @see REQ-E04-005 - Guest content API endpoint
 * @see REQ-E04-006 - Language availability endpoint
 */
export interface GuestContentResponse {
  /** The translated item with metadata */
  item: TranslatedItem;
  /** Array of translated articles with their links */
  articles: TranslatedArticle[];
  /** Array of translated tags for categorization */
  tags: TranslatedTag[];
  /**
   * Metadata about the translation context.
   * Helps clients understand the translation state and available options.
   */
  translationMeta: {
    /** The language originally requested by the guest */
    requestedLanguage: SupportedLanguage;
    /** The language actually being displayed (may differ if requested not available) */
    displayLanguage: SupportedLanguage;
    /** The original language the content was authored in */
    sourceLanguage: SupportedLanguage;
    /**
     * Languages that have completed translations available.
     * Only includes fully completed translations, not pending or failed ones.
     */
    availableTranslations: SupportedLanguage[];
    /** Whether the displayed content is a translation (true) or original (false) */
    isShowingTranslation: boolean;
  };
}

/**
 * Response for language availability queries.
 *
 * @description
 * Returned when clients query which translations are available for a specific
 * item. This enables smart language switching UI that can show available,
 * pending, and unavailable translations.
 *
 * @since Epic 4 - Guest Experience
 * @see REQ-E04-006 - Language availability endpoint
 */
export interface LanguageAvailabilityResponse {
  /** The original language the content was authored in */
  sourceLanguage: SupportedLanguage;
  /**
   * Languages with completed translations ready for display.
   * Only includes completed translations, not pending or failed ones.
   */
  availableTranslations: SupportedLanguage[];
  /** Languages currently being processed for translation */
  pendingTranslations: SupportedLanguage[];
  /** Languages not yet queued for translation */
  unavailableTranslations: SupportedLanguage[];
}

// =============================================================================
// Section 4: Utility Function Signatures (JSDoc Documentation)
// =============================================================================

/**
 * Merges original content with translation data, preserving untranslated fields.
 *
 * @description
 * When a translation is partial (not all fields translated), this function
 * combines the translated fields with the original content, ensuring no
 * data is lost.
 *
 * @template T - The content type (TranslatedItem, TranslatedArticle, or TranslatedLink)
 * @param original - The original content object
 * @param translation - Partial translation data to merge
 * @returns The merged content with translation applied where available
 *
 * @example
 * ```typescript
 * const original: TranslatedItem = {
 *   id: '123',
 *   publicId: 'abc',
 *   name: 'Coffee Maker',
 *   description: 'Makes coffee',
 *   displayLanguage: 'en',
 *   sourceLanguage: 'en',
 *   isTranslated: false
 * };
 *
 * const translation = { name: 'Cafetière', displayLanguage: 'fr' };
 * const merged = mergeTranslation(original, translation);
 * // merged.name === 'Cafetière'
 * // merged.description === 'Makes coffee' (preserved from original)
 * ```
 *
 * @since Epic 4 - Guest Experience
 * @see REQ-E04-007 - Translation utility functions implementation
 *
 * @note Implementation of this utility will occur in
 * `/src/lib/translations/translation-utils.ts` (REQ-E04-007)
 */
// Function signature: <T extends TranslatedContent>(original: T, translation: Partial<T>) => T

/**
 * Determines the best language to display based on user request and availability.
 *
 * @description
 * Implements the language selection algorithm:
 * 1. If requested language is available, return it
 * 2. If not, check if source language is acceptable
 * 3. Fall back to source language if requested isn't available
 *
 * @param requested - The language the user requested
 * @param available - Array of languages with completed translations
 * @param source - The original language of the content
 * @returns The best language to display
 *
 * @example
 * ```typescript
 * // User requests French, it's available
 * getDisplayLanguage('fr', ['en', 'fr', 'es'], 'en'); // Returns 'fr'
 *
 * // User requests German, not available, fall back to source
 * getDisplayLanguage('de', ['en', 'fr', 'es'], 'en'); // Returns 'en'
 *
 * // User requests source language
 * getDisplayLanguage('en', ['en', 'fr'], 'en'); // Returns 'en'
 * ```
 *
 * @since Epic 4 - Guest Experience
 * @see REQ-E04-007 - Translation utility functions implementation
 *
 * @note Implementation of this utility will occur in
 * `/src/lib/translations/translation-utils.ts` (REQ-E04-007)
 */
// Function signature: (requested: SupportedLanguage, available: SupportedLanguage[], source: SupportedLanguage) => SupportedLanguage

/**
 * Formats a language code into a human-readable name.
 *
 * @description
 * Converts ISO language codes to displayable names, with support for
 * both English names and native language names.
 *
 * @param code - The language code to format
 * @param native - If true, return the native name (e.g., "Français"); if false, English name (e.g., "French")
 * @returns The formatted language name
 *
 * @example
 * ```typescript
 * formatLanguageName('fr', false); // Returns "French"
 * formatLanguageName('fr', true);  // Returns "Français"
 * formatLanguageName('de', true);  // Returns "Deutsch"
 * formatLanguageName('en', true);  // Returns "English"
 * ```
 *
 * @since Epic 4 - Guest Experience
 * @see REQ-E04-007 - Translation utility functions implementation
 *
 * @note Implementation of this utility will occur in
 * `/src/lib/translations/translation-utils.ts` (REQ-E04-007)
 */
// Function signature: (code: SupportedLanguage, native?: boolean) => string
