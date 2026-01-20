# REQ-E04-001: Create Localization Types File - Implementation Overview

**Created:** 2026-01-19 20:30 UTC
**Last Modified:** 2026-01-19 20:30 UTC
**Request Reference:** REQ-E04-001 (docs/gen_requests_epic4.md)
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md
**Phase:** 1 - Types and Utilities
**Task ID:** 1.1

---

## Task Summary

Create a centralized localization types file that provides TypeScript type definitions, constants, and utility functions for the guest-facing translation experience. This file will serve as the foundation for all guest language selection, translated content display, and translation status tracking features in Epic 4.

### Scope

- [ ] Create `/src/types/l10n.ts` file with all required type definitions
- [ ] Define `SupportedLanguage` type alias for language codes
- [ ] Define `LanguageInfo` interface for language metadata
- [ ] Define `TranslatedContent` base interface and entity-specific variants
- [ ] Define guest content response types for API contracts
- [ ] Export `SUPPORTED_LANGUAGES` constant array with metadata
- [ ] Create language utility functions (validation, lookup, formatting)
- [ ] Update `/src/types/index.ts` to export l10n types

---

## Existing Patterns to Follow

### i18n Configuration Pattern (from Epic 1)

The codebase already has localization infrastructure from Epic 1:

**File: `src/lib/i18n/config.ts`**
```typescript
export const locales = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
export type SupportedLocale = (typeof locales)[number];
export const defaultLocale: SupportedLocale = 'en';

export interface LocaleMetadata {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  flag?: string;
}

export const localeMetadata: Record<SupportedLocale, LocaleMetadata> = {
  en: { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  // ...
};
```

**File: `src/contexts/LocaleContext.tsx`**
```typescript
export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

export interface LocaleOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag?: string;
}

export const SUPPORTED_LOCALES: LocaleOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  // ...
];
```

### Type Definition Pattern (from src/types/index.ts)

Types are organized with clear sections and JSDoc documentation:

```typescript
// Database types
export interface Item {
  id: string;
  // ...
}

// API Response types
export interface ItemResponse {
  success: boolean;
  data?: {...};
  error?: string;
}
```

### Type Re-export Pattern (from src/types/index.ts)

The codebase re-exports types from contexts for centralized access:

```typescript
// Locale/i18n types (REQ-250)
export type {
  SupportedLanguage,
  LocaleOption,
  LocaleChangeResult,
  LocaleContextValue,
} from '@/contexts/LocaleContext';

export { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/contexts/LocaleContext';
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/types/l10n.ts` | Centralized localization type definitions for guest experience |

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `src/types/index.ts` | Add exports for all types from `l10n.ts` |

### Directories - No Changes Required

The `src/types/` directory already exists.

### Files NOT to Modify

- `src/lib/i18n/config.ts` - Existing Epic 1 infrastructure, do not duplicate
- `src/contexts/LocaleContext.tsx` - Owner-facing locale context, separate concern
- `src/lib/i18n/language-detection.ts` - Server-side detection utilities
- Database schema files
- API route files

---

## Implementation Tasks

### Task 1.1.1: Create Base Type Definitions

**Effort:** 15 minutes

Create `src/types/l10n.ts` with foundational types:

```typescript
/**
 * Localization Type Definitions for Guest Experience
 *
 * Provides TypeScript types for translated content display,
 * language selection, and translation status tracking.
 *
 * @module types/l10n
 * @see docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md
 * @lastModified 2026-01-19 (REQ-E04-001)
 */

// =============================================================================
// Language Types
// =============================================================================

/**
 * Supported language codes for the application.
 * Uses ISO 639-1 two-letter codes.
 */
export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

/**
 * Language metadata including display names and optional flag.
 */
export interface LanguageInfo {
  /** ISO 639-1 language code */
  code: SupportedLanguage;
  /** English name of the language */
  name: string;
  /** Native name of the language (e.g., "Deutsch" for German) */
  nativeName: string;
  /** Optional flag emoji for visual display */
  flag?: string;
}

/**
 * Text direction for a language.
 * All currently supported languages are LTR.
 */
export type TextDirection = 'ltr' | 'rtl';
```

**Acceptance Criteria:**
- File header with module documentation
- `SupportedLanguage` type matches Epic 1 config
- `LanguageInfo` interface includes all required metadata
- JSDoc comments on all exported types

---

### Task 1.1.2: Create Language Constants

**Effort:** 10 minutes

Add the `SUPPORTED_LANGUAGES` constant array:

```typescript
// =============================================================================
// Language Constants
// =============================================================================

/**
 * Array of all supported languages with complete metadata.
 * Order determines display order in UI components.
 */
export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
] as const;

/**
 * Map of language code to language info for O(1) lookup.
 */
export const LANGUAGE_MAP: Record<SupportedLanguage, LanguageInfo> = {
  en: { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  nl: { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  it: { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
};

/**
 * Default language for the application.
 */
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

/**
 * Cookie name for storing guest language preference.
 */
export const GUEST_LANGUAGE_COOKIE = 'FAQBNB_GUEST_LANG';

/**
 * Cookie max age in seconds (1 year).
 */
export const GUEST_LANGUAGE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;
```

**Acceptance Criteria:**
- Languages match Epic 1 config exactly
- Both array and map exports available
- Constants for cookie name and max age

---

### Task 1.1.3: Create Translated Content Types

**Effort:** 20 minutes

Add types for translated content structures:

```typescript
// =============================================================================
// Translation Status Types
// =============================================================================

/**
 * Status of a translation record.
 */
export type TranslationStatus = 'pending' | 'completed' | 'failed';

// =============================================================================
// Translated Content Types
// =============================================================================

/**
 * Base interface for translated content metadata.
 * Extended by entity-specific translated types.
 */
export interface TranslatedContent {
  /** Language the content is being displayed in */
  displayLanguage: SupportedLanguage;
  /** Original language of the content */
  sourceLanguage: SupportedLanguage;
  /** Whether this content is a translation (vs original) */
  isTranslated: boolean;
  /** Current status of the translation */
  translationStatus?: TranslationStatus;
}

/**
 * Translated item (e.g., appliance, room item).
 */
export interface TranslatedItem extends TranslatedContent {
  id: string;
  publicId: string;
  name: string;
  description: string | null;
  /** Original name if showing translation */
  originalName?: string;
  /** Original description if showing translation */
  originalDescription?: string;
}

/**
 * Translated article (grouped content by purpose).
 */
export interface TranslatedArticle extends TranslatedContent {
  id: string;
  title: string;
  description: string | null;
  /** Original title if showing translation */
  originalTitle?: string;
  /** Original description if showing translation */
  originalDescription?: string;
  /** Links within this article */
  links: TranslatedLink[];
}

/**
 * Translated link within an article.
 */
export interface TranslatedLink extends TranslatedContent {
  id: string;
  title: string;
  /** URL is never translated */
  url: string;
  thumbnailUrl: string | null;
  /** Original title if showing translation */
  originalTitle?: string;
}

/**
 * Translated tag for categorization.
 */
export interface TranslatedTag {
  /** Tag key identifier */
  key: string;
  /** Translated or original display value */
  displayValue: string;
  /** Whether this tag value is translated */
  isTranslated: boolean;
}
```

**Acceptance Criteria:**
- Base `TranslatedContent` interface with common fields
- Entity-specific interfaces extending base
- Original value fields for toggle functionality
- All types match Implementation Plan specification

---

### Task 1.1.4: Create API Response Types

**Effort:** 15 minutes

Add types for API response contracts:

```typescript
// =============================================================================
// API Response Types
// =============================================================================

/**
 * Translation metadata included in guest content responses.
 */
export interface TranslationMeta {
  /** Language that was requested */
  requestedLanguage: SupportedLanguage;
  /** Language being displayed (may differ if translation unavailable) */
  displayLanguage: SupportedLanguage;
  /** Original language of the source content */
  sourceLanguage: SupportedLanguage;
  /** List of languages with completed translations */
  availableTranslations: SupportedLanguage[];
  /** Whether the displayed content is a translation */
  isShowingTranslation: boolean;
}

/**
 * Complete response for guest item page.
 * Includes item, articles, tags, and translation metadata.
 */
export interface GuestContentResponse {
  item: TranslatedItem;
  articles: TranslatedArticle[];
  tags: TranslatedTag[];
  translationMeta: TranslationMeta;
}

/**
 * Response for language availability query.
 * Used by language switcher to show available translations.
 */
export interface LanguageAvailabilityResponse {
  /** Original language of the content */
  sourceLanguage: SupportedLanguage;
  /** Languages with completed translations */
  availableTranslations: SupportedLanguage[];
  /** Languages with translations in progress */
  pendingTranslations: SupportedLanguage[];
  /** Languages without translations */
  unavailableTranslations: SupportedLanguage[];
}
```

**Acceptance Criteria:**
- `GuestContentResponse` matches Implementation Plan specification
- `LanguageAvailabilityResponse` supports language switcher needs
- `TranslationMeta` provides all info needed for UI components

---

### Task 1.1.5: Create Utility Functions

**Effort:** 15 minutes

Add language utility functions:

```typescript
// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Type guard to check if a string is a valid supported language code.
 *
 * @param code - The string to check
 * @returns True if code is a valid SupportedLanguage
 *
 * @example
 * if (isSupportedLanguage(userInput)) {
 *   // TypeScript knows userInput is SupportedLanguage
 *   setLanguage(userInput);
 * }
 */
export function isSupportedLanguage(code: string): code is SupportedLanguage {
  return SUPPORTED_LANGUAGES.some((lang) => lang.code === code);
}

/**
 * Get language info for a given language code.
 *
 * @param code - The language code to look up
 * @returns LanguageInfo if found, undefined otherwise
 *
 * @example
 * const info = getLanguageInfo('fr');
 * console.log(info?.nativeName); // "Français"
 */
export function getLanguageInfo(code: SupportedLanguage): LanguageInfo;
export function getLanguageInfo(code: string): LanguageInfo | undefined;
export function getLanguageInfo(code: string): LanguageInfo | undefined {
  return LANGUAGE_MAP[code as SupportedLanguage];
}

/**
 * Get the native name for a language code.
 *
 * @param code - The language code
 * @returns Native language name or the code if not found
 *
 * @example
 * getLanguageNativeName('de'); // "Deutsch"
 */
export function getLanguageNativeName(code: string): string {
  return getLanguageInfo(code)?.nativeName ?? code;
}

/**
 * Get the English name for a language code.
 *
 * @param code - The language code
 * @returns English language name or the code if not found
 *
 * @example
 * getLanguageName('de'); // "German"
 */
export function getLanguageName(code: string): string {
  return getLanguageInfo(code)?.name ?? code;
}

/**
 * Get the flag emoji for a language code.
 *
 * @param code - The language code
 * @returns Flag emoji or empty string if not found
 *
 * @example
 * getLanguageFlag('fr'); // "🇫🇷"
 */
export function getLanguageFlag(code: string): string {
  return getLanguageInfo(code)?.flag ?? '';
}

/**
 * Normalize a locale code to a supported language.
 * Handles variations like 'en-US' -> 'en', 'fr-CA' -> 'fr'.
 *
 * @param locale - The locale string to normalize
 * @returns The normalized supported language or default if not found
 *
 * @example
 * normalizeToSupportedLanguage('en-US'); // 'en'
 * normalizeToSupportedLanguage('zh'); // 'en' (default, not supported)
 */
export function normalizeToSupportedLanguage(locale: string | null | undefined): SupportedLanguage {
  if (!locale) {
    return DEFAULT_LANGUAGE;
  }

  // Direct match
  if (isSupportedLanguage(locale)) {
    return locale;
  }

  // Try extracting the language code (e.g., 'en-US' -> 'en')
  const languageCode = locale.split('-')[0]?.toLowerCase();
  if (languageCode && isSupportedLanguage(languageCode)) {
    return languageCode;
  }

  return DEFAULT_LANGUAGE;
}

/**
 * Format a language for display with optional flag.
 *
 * @param code - The language code
 * @param options - Formatting options
 * @returns Formatted string for display
 *
 * @example
 * formatLanguageDisplay('fr'); // "🇫🇷 Français"
 * formatLanguageDisplay('fr', { useEnglishName: true }); // "🇫🇷 French"
 * formatLanguageDisplay('fr', { includeFlag: false }); // "Français"
 */
export function formatLanguageDisplay(
  code: string,
  options: {
    useEnglishName?: boolean;
    includeFlag?: boolean;
  } = {}
): string {
  const { useEnglishName = false, includeFlag = true } = options;
  const info = getLanguageInfo(code);

  if (!info) {
    return code;
  }

  const name = useEnglishName ? info.name : info.nativeName;
  return includeFlag && info.flag ? `${info.flag} ${name}` : name;
}
```

**Acceptance Criteria:**
- Type guard function for runtime validation
- Lookup functions for language metadata
- Normalization function for browser locale codes
- Display formatting function with options
- JSDoc examples on all functions

---

### Task 1.1.6: Update types/index.ts

**Effort:** 5 minutes

Add l10n exports to `src/types/index.ts`:

```typescript
// Localization types for guest experience (REQ-E04-001)
export type {
  SupportedLanguage,
  LanguageInfo,
  TextDirection,
  TranslationStatus,
  TranslatedContent,
  TranslatedItem,
  TranslatedArticle,
  TranslatedLink,
  TranslatedTag,
  TranslationMeta,
  GuestContentResponse,
  LanguageAvailabilityResponse,
} from './l10n';

export {
  SUPPORTED_LANGUAGES,
  LANGUAGE_MAP,
  DEFAULT_LANGUAGE,
  GUEST_LANGUAGE_COOKIE,
  GUEST_LANGUAGE_COOKIE_MAX_AGE,
  isSupportedLanguage,
  getLanguageInfo,
  getLanguageNativeName,
  getLanguageName,
  getLanguageFlag,
  normalizeToSupportedLanguage,
  formatLanguageDisplay,
} from './l10n';
```

**Acceptance Criteria:**
- All types exported
- All constants exported
- All utility functions exported
- Comment with REQ reference

---

## Dependencies

### Internal Dependencies

| Dependency | Purpose | Status |
|------------|---------|--------|
| Epic 1 i18n config | Language codes and metadata | Complete (src/lib/i18n/config.ts) |
| Translation tables | Database schema for translations | Expected from Epic 1 |

### External Dependencies

| Dependency | Already Installed | Purpose |
|------------|------------------|---------|
| TypeScript | Yes | Type definitions |

---

## Relationship to Existing Infrastructure

This file is **complementary** to, not replacing, the existing i18n infrastructure:

| File | Purpose | Relationship |
|------|---------|--------------|
| `src/lib/i18n/config.ts` | Server-side locale config | Shares language codes |
| `src/contexts/LocaleContext.tsx` | Owner UI locale context | Similar types, different scope |
| `src/types/l10n.ts` (NEW) | Guest translation types | Adds translation-specific types |

**Key Distinction:** The new `l10n.ts` file focuses on **translated content** for guests, while existing files handle **UI locale** for owners. The language codes are intentionally identical across both.

---

## Testing Approach

### Type Checking

After completion, verify:
```bash
npx tsc --noEmit
```

### Import Verification

Create a temporary test to verify imports work:
```typescript
import {
  SupportedLanguage,
  LanguageInfo,
  TranslatedItem,
  GuestContentResponse,
  SUPPORTED_LANGUAGES,
  isSupportedLanguage,
  getLanguageInfo,
  formatLanguageDisplay,
} from '@/types';

// Type check passes if these compile
const lang: SupportedLanguage = 'fr';
const isValid = isSupportedLanguage('de');
const info = getLanguageInfo('es');
const display = formatLanguageDisplay('it');
```

### Unit Test Cases

```typescript
// isSupportedLanguage
expect(isSupportedLanguage('en')).toBe(true);
expect(isSupportedLanguage('zh')).toBe(false);

// normalizeToSupportedLanguage
expect(normalizeToSupportedLanguage('en-US')).toBe('en');
expect(normalizeToSupportedLanguage('fr-CA')).toBe('fr');
expect(normalizeToSupportedLanguage('zh')).toBe('en'); // default fallback

// formatLanguageDisplay
expect(formatLanguageDisplay('fr')).toBe('🇫🇷 Français');
expect(formatLanguageDisplay('de', { useEnglishName: true })).toBe('🇩🇪 German');
```

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Type duplication with Epic 1 | Medium | Low | Intentional separation of concerns; l10n.ts for translation-specific types |
| Language code mismatch | Low | High | Copy exact codes from config.ts; add test to verify alignment |
| Missing utility function | Low | Medium | Reference all usage in Implementation Plan tasks |

---

## Definition of Done

- [ ] `src/types/l10n.ts` file created with all type definitions
- [ ] `SupportedLanguage` type defined matching Epic 1 codes
- [ ] `LanguageInfo` interface defined with all metadata fields
- [ ] `TranslatedContent` and entity variants defined
- [ ] `SUPPORTED_LANGUAGES` constant exported
- [ ] `LANGUAGE_MAP` constant exported for O(1) lookup
- [ ] Utility functions implemented (type guard, lookup, normalize, format)
- [ ] `src/types/index.ts` updated with all l10n exports
- [ ] TypeScript compiles without errors
- [ ] Imports work from `@/types`

---

## Related Documents

- [Implementation Plan: L10N Epic 4 - Guest Experience](docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md)
- [Request: REQ-E04-001](docs/gen_requests_epic4.md)
- [Existing i18n Config](src/lib/i18n/config.ts)
- [LocaleContext Reference](src/contexts/LocaleContext.tsx)
- [Types Index Reference](src/types/index.ts)

---

*Document generated: 2026-01-19 20:30 UTC*
*Task 1.1 of Phase 1 - Types and Utilities*
