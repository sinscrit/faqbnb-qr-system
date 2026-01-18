# REQ-258: Create Localization Types File - Implementation Overview
*Generated: 2026-01-18 08:45:00*
*Last Modified: 2026-01-18 08:45:00*

## Reference
- **Request**: REQ-258 (Create Localization Types and Language Utilities)
- **Source**: docs/gen_requests_epic4.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md
- **Type**: New Feature (Foundation Setup)
- **Epic**: L10N Epic 4 - Guest Experience
- **Phase**: Phase 1 (Types and Utilities)
- **Task ID**: 1.1
- **Size**: S
- **Priority**: HIGH

## Goals
1. Create `/src/types/l10n.ts` with all localization-related TypeScript type definitions
2. Define `SupportedLanguage` type for type-safe language code handling
3. Define `LanguageInfo` interface with language metadata (name, native name, direction, flag)
4. Define `TranslatedContent` base interface and extended types for translated entities
5. Export `SUPPORTED_LANGUAGES` constant array with metadata for all 6 supported languages
6. Export utility functions for common language operations (validation, lookup, defaults)
7. Update `/src/types/index.ts` to re-export L10N types for centralized access
8. Ensure zero compilation errors and TypeScript warnings

## Context from Implementation Plan

### Epic Dependencies
Per the implementation plan:
- **Depends On**: Epic 1 (Foundation), Epic 3 (Dynamic Content Translation)
- **Epic 1 Provides**: i18n configuration, language detection utility, cookie constants
- **Epic 3 Provides**: Translation tables populated with content

**Note**: This task establishes the foundational types that will be used across Epic 4. The types defined here must align with the database schema from Epic 1 and support the guest experience features throughout Epic 4.

### Supported Languages
The system supports 6 languages:
| Code | Name | Native Name | Flag |
|------|------|-------------|------|
| `en` | English | English | 🇬🇧 |
| `fr` | French | Français | 🇫🇷 |
| `es` | Spanish | Español | 🇪🇸 |
| `de` | German | Deutsch | 🇩🇪 |
| `nl` | Dutch | Nederlands | 🇳🇱 |
| `it` | Italian | Italiano | 🇮🇹 |

### Types Architecture
The types in this file will be consumed by:
1. **Guest Language Utility** (Task 1.2) - Language detection and cookie handling
2. **Translation Fetch Utilities** (Phase 2) - Database queries for translated content
3. **Guest UI Components** (Phase 3) - Language switcher, translation banners
4. **useGuestLanguage Hook** (Phase 4) - Client-side language state management
5. **API Endpoints** (Phase 2) - Public item API with translation support

### State Management Integration
```typescript
// Guest language state flows through:
// 1. URL parameter ?lang=fr (highest priority for sharing)
// 2. Cookie FAQBNB_GUEST_LANG (persistence)
// 3. Browser Accept-Language header (auto-detection)
// 4. Default: Original content language (fallback)

interface GuestLanguageState {
  displayLanguage: SupportedLanguage;      // Currently showing
  sourceLanguage: SupportedLanguage;       // Original content language
  isTranslated: boolean;                   // Is content translated?
  showOriginal: boolean;                   // User toggled to original?
  availableTranslations: SupportedLanguage[];  // Which translations exist
}
```

## Implementation Order

### Step 1: Create Localization Types File
Create `/src/types/l10n.ts` with all type definitions.

**Sections to implement:**
1. Core type: `SupportedLanguage`
2. Language metadata: `LanguageInfo` interface
3. Language constants: `SUPPORTED_LANGUAGES` array
4. Translation content interfaces: `TranslatedContent`, `TranslatedItem`, `TranslatedArticle`, `TranslatedLink`, `TranslatedTag`
5. API response types: `GuestContentResponse`, `LanguageAvailabilityResponse`
6. Utility functions: `isValidLanguage()`, `getLanguageInfo()`, `getDefaultLanguage()`

### Step 2: Update Types Index File
Modify `/src/types/index.ts` to export all L10N types.

### Step 3: Verification
- Run TypeScript compilation to verify no errors
- Verify imports work correctly from centralized types export
- Confirm type alignment with implementation plan specifications

## Authorized Files and Functions for Modification

### New Files to Create

#### `/src/types/l10n.ts`
- **Purpose**: Central TypeScript type definitions for all localization functionality
- **Types to Define**:

##### Core Language Type
```typescript
/**
 * Supported language codes in the application.
 * Based on ISO 639-1 language codes.
 */
export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';
```

##### Language Metadata Interface
```typescript
/**
 * Language metadata including display information.
 */
export interface LanguageInfo {
  /** ISO 639-1 language code */
  code: SupportedLanguage;
  /** English name of the language */
  name: string;
  /** Native name of the language (e.g., "Deutsch" for German) */
  nativeName: string;
  /** Text direction (ltr for all supported languages) */
  direction: 'ltr' | 'rtl';
  /** Optional flag emoji for visual display */
  flag?: string;
}
```

##### Language Constants
```typescript
/**
 * Array of all supported languages with their metadata.
 * Used for language selection UI and validation.
 */
export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', direction: 'ltr', flag: '🇩🇪' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', direction: 'ltr', flag: '🇳🇱' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', direction: 'ltr', flag: '🇮🇹' },
];

/**
 * Default language when no preference is detected.
 */
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

/**
 * Cookie name for storing guest language preference.
 */
export const GUEST_LANGUAGE_COOKIE = 'FAQBNB_GUEST_LANG';
```

##### Base Translation Interface
```typescript
/**
 * Base interface for translated content metadata.
 * Extended by specific content type interfaces.
 */
export interface TranslatedContent {
  /** Language being displayed to the user */
  displayLanguage: SupportedLanguage;
  /** Original language the content was created in */
  sourceLanguage: SupportedLanguage;
  /** Whether the content is translated (vs showing original) */
  isTranslated: boolean;
  /** Translation status from the database */
  translationStatus?: 'completed' | 'pending' | 'failed';
}
```

##### Translated Entity Interfaces
```typescript
/**
 * Translated item content.
 */
export interface TranslatedItem extends TranslatedContent {
  id: string;
  publicId: string;
  name: string;
  description: string | null;
  /** Original name when showing translation */
  originalName?: string;
  /** Original description when showing translation */
  originalDescription?: string;
}

/**
 * Translated article content.
 */
export interface TranslatedArticle extends TranslatedContent {
  id: string;
  title: string;
  description: string | null;
  /** Original title when showing translation */
  originalTitle?: string;
  /** Original description when showing translation */
  originalDescription?: string;
  /** Links within this article */
  links: TranslatedLink[];
}

/**
 * Translated link content.
 */
export interface TranslatedLink extends TranslatedContent {
  id: string;
  title: string;
  /** URL is never translated */
  url: string;
  thumbnailUrl: string | null;
  /** Original title when showing translation */
  originalTitle?: string;
}

/**
 * Translated tag content.
 */
export interface TranslatedTag {
  /** Tag key/identifier */
  key: string;
  /** Display value in current language */
  displayValue: string;
  /** Whether the tag is translated */
  isTranslated: boolean;
}
```

##### API Response Interfaces
```typescript
/**
 * Complete response for guest content API.
 * Includes all content and translation metadata.
 */
export interface GuestContentResponse {
  item: TranslatedItem;
  articles: TranslatedArticle[];
  tags: TranslatedTag[];
  translationMeta: {
    /** Language requested by the user */
    requestedLanguage: SupportedLanguage;
    /** Language actually being displayed */
    displayLanguage: SupportedLanguage;
    /** Original content language */
    sourceLanguage: SupportedLanguage;
    /** Languages with completed translations */
    availableTranslations: SupportedLanguage[];
    /** Whether displaying translation or original */
    isShowingTranslation: boolean;
  };
}

/**
 * Response for language availability endpoint.
 */
export interface LanguageAvailabilityResponse {
  /** Original content language */
  sourceLanguage: SupportedLanguage;
  /** Languages with completed translations */
  availableTranslations: SupportedLanguage[];
  /** Languages with translations in progress */
  pendingTranslations: SupportedLanguage[];
  /** Languages with no translation */
  unavailableTranslations: SupportedLanguage[];
}
```

##### Utility Functions
```typescript
/**
 * Check if a string is a valid supported language code.
 * @param code - Language code to validate
 * @returns True if the code is a supported language
 */
export function isValidLanguage(code: string): code is SupportedLanguage {
  return SUPPORTED_LANGUAGES.some((lang) => lang.code === code);
}

/**
 * Get language info for a given language code.
 * @param code - Language code to look up
 * @returns Language info or undefined if not found
 */
export function getLanguageInfo(code: SupportedLanguage): LanguageInfo | undefined {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
}

/**
 * Get the default language for the application.
 * @returns The default language code
 */
export function getDefaultLanguage(): SupportedLanguage {
  return DEFAULT_LANGUAGE;
}

/**
 * Get all supported language codes as an array.
 * @returns Array of supported language codes
 */
export function getSupportedLanguageCodes(): SupportedLanguage[] {
  return SUPPORTED_LANGUAGES.map((lang) => lang.code);
}

/**
 * Map a potentially unsupported language code to the nearest supported language.
 * Falls back to default language if no match found.
 * @param code - Browser language code (e.g., 'en-US', 'fr-CA')
 * @returns Matching supported language or default
 */
export function mapToSupportedLanguage(code: string): SupportedLanguage {
  // Exact match
  if (isValidLanguage(code)) {
    return code;
  }

  // Try base language (e.g., 'en-US' -> 'en')
  const baseCode = code.split('-')[0].toLowerCase();
  if (isValidLanguage(baseCode)) {
    return baseCode;
  }

  // Default fallback
  return DEFAULT_LANGUAGE;
}
```

### Files to Modify

#### `/src/types/index.ts`
- **Purpose**: Add L10N type exports for centralized access
- **Changes**:
  - Add import for l10n types
  - Add re-export statement for all L10N types and functions
- **Lines to add at end of file**:
```typescript
// Localization types
export * from './l10n';
```

### Existing Files (Read-Only Reference)
These files provide patterns to follow but should NOT be modified:
- `/src/types/reactions.ts` - Example of type-only module structure
- `/src/types/analytics.ts` - Example of response type definitions
- `/src/types/index.ts` - Current barrel export pattern

## Technical Specifications

### Type Safety Requirements
1. `SupportedLanguage` must be a string literal union (not `string`)
2. All language-related functions must accept and return typed parameters
3. `SUPPORTED_LANGUAGES` array must be `as const` or typed as `LanguageInfo[]`
4. Utility functions must use TypeScript type guards where appropriate

### Naming Conventions
- Types: PascalCase (e.g., `SupportedLanguage`, `LanguageInfo`)
- Constants: SCREAMING_SNAKE_CASE (e.g., `SUPPORTED_LANGUAGES`, `DEFAULT_LANGUAGE`)
- Functions: camelCase (e.g., `isValidLanguage`, `getLanguageInfo`)

### Documentation Requirements
- All exported types must have JSDoc comments
- Function parameters and return values must be documented
- Include `@example` for utility functions where helpful

## Success Validation Checklist

### Type Definitions
- [ ] `SupportedLanguage` type defined as string literal union of 6 language codes
- [ ] `LanguageInfo` interface defined with all required properties
- [ ] `TranslatedContent` base interface defined
- [ ] `TranslatedItem` interface extends `TranslatedContent` correctly
- [ ] `TranslatedArticle` interface extends `TranslatedContent` correctly
- [ ] `TranslatedLink` interface extends `TranslatedContent` correctly
- [ ] `TranslatedTag` interface defined
- [ ] `GuestContentResponse` interface defined with all properties
- [ ] `LanguageAvailabilityResponse` interface defined

### Constants
- [ ] `SUPPORTED_LANGUAGES` array contains all 6 languages with correct metadata
- [ ] `DEFAULT_LANGUAGE` constant set to `'en'`
- [ ] `GUEST_LANGUAGE_COOKIE` constant set to `'FAQBNB_GUEST_LANG'`

### Utility Functions
- [ ] `isValidLanguage()` function implemented with type guard
- [ ] `getLanguageInfo()` function implemented
- [ ] `getDefaultLanguage()` function implemented
- [ ] `getSupportedLanguageCodes()` function implemented
- [ ] `mapToSupportedLanguage()` function implemented with fallback logic

### Barrel Export
- [ ] `/src/types/index.ts` exports all L10N types
- [ ] Import `import { SupportedLanguage } from '@/types'` resolves correctly
- [ ] Import `import { SUPPORTED_LANGUAGES } from '@/types'` resolves correctly

### Compilation
- [ ] `npm run build` completes without TypeScript errors
- [ ] No unused export warnings
- [ ] No type conflicts with existing codebase

## Dependencies
- TypeScript 5.x (existing in project)
- No new npm packages required
- No runtime dependencies (types + constants file)

## Risk Assessment
- **Risk Level**: Very Low
- **Rationale**:
  - Purely additive changes (single new file + one line export)
  - Type-only definitions have minimal runtime impact
  - Constants are simple static data
  - Utility functions are pure with no side effects
  - Standard patterns matching existing types files
  - All types defined in the reviewed implementation plan

## Notes

### Pattern Alignment
- Follow existing project conventions from `src/types/reactions.ts` and `src/types/analytics.ts`
- Use JSDoc comments for all public interfaces and functions
- Export types using ES module syntax
- Include descriptive section comments for organization

### Future Integration Points
- Types will be consumed by guest language utility module (Task 1.2)
- `SUPPORTED_LANGUAGES` will be used by GuestLanguageSwitcher component (Phase 3)
- `TranslatedContent` types will be used by translation fetch utilities (Phase 2)
- `GuestContentResponse` will be the return type for public item API (Phase 2)
- `mapToSupportedLanguage` will be used for Accept-Language header parsing (Phase 6)

### Alignment with Epic 1
This task creates types that align with Epic 1's database schema:
- `SupportedLanguage` maps to the `language` column in translation tables
- `TranslatedContent.translationStatus` maps to `translation_status` enum
- Cookie constant matches Epic 1's defined cookie name
