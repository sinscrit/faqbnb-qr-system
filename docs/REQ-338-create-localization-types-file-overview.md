# REQ-338: Create Localization Types File - Implementation Overview

**Document Created:** 2026-01-19 13:30:00 UTC
**Last Modified:** 2026-01-19 13:30:00 UTC
**Request Reference:** docs/gen_requests_epic4.md - REQ-338
**Implementation Plan:** docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md
**Phase:** 1 - Types and Utilities
**Task ID:** 1.1
**Size:** S (Small)
**Priority:** P1 - High (Foundation for Epic 4)

---

## Summary

Create a centralized TypeScript types file at `/src/types/l10n.ts` that defines all localization-related types, interfaces, and constants for guest-facing internationalization features. This file provides type contracts for:

- Supported language codes
- Language metadata with display names
- Translated content structures
- Guest content response formats
- Language availability information

This is the foundational task for Epic 4 (Guest Experience) and must be completed before other Epic 4 tasks can proceed.

---

## Current State Analysis

### Existing Locale Infrastructure (Epic 1)

The codebase already has locale-related types and configuration from Epic 1:

| File | Contents | Status |
|------|----------|--------|
| `/src/lib/i18n/config.ts` | `SupportedLocale`, `LocaleMetadata`, `locales`, `localeMetadata` | Exists |
| `/src/contexts/LocaleContext.tsx` | `SupportedLanguage`, `LocaleOption`, `LocaleChangeResult` | Exists |
| `/src/types/index.ts` | Re-exports from `LocaleContext` | Exists |

**Key Observation:** The existing `SupportedLanguage` type in `LocaleContext.tsx` (`'en' | 'fr' | 'es' | 'de' | 'nl' | 'it'`) is identical to what Epic 4 requires. The new `l10n.ts` file should leverage or re-export these types to avoid duplication.

### Gap Analysis

The following types are **missing** and need to be created for Epic 4:

| Type/Interface | Purpose | Exists? |
|----------------|---------|---------|
| `TranslatedContent` | Base interface for translated content metadata | No |
| `TranslatedItem` | Item data with translation fields | No |
| `TranslatedArticle` | Article data with translation fields | No |
| `TranslatedLink` | Link data with translation fields | No |
| `TranslatedTag` | Tag data with translation fields | No |
| `GuestContentResponse` | API response format with translation metadata | No |
| `LanguageAvailabilityResponse` | Response for language availability endpoint | No |
| `TranslationMeta` | Metadata about translation status and languages | No |
| `SUPPORTED_LANGUAGES` array | Array of `LanguageInfo` objects | Partial (exists as `SUPPORTED_LOCALES` in config.ts) |

---

## Technical Approach

### Strategy: Extend Existing Types

Rather than duplicating the `SupportedLanguage` type, the new `/src/types/l10n.ts` file will:

1. **Re-export** `SupportedLanguage` from the existing `LocaleContext`
2. **Define new types** specific to guest content translation
3. **Create a `SUPPORTED_LANGUAGES` constant** that matches the interface specified in Plan-111
4. **Export utility types** for translation operations

### Type Hierarchy

```
l10n.ts
├── Re-exports from LocaleContext
│   └── SupportedLanguage (type alias)
│
├── New Types for Epic 4
│   ├── LanguageInfo (interface)
│   ├── SUPPORTED_LANGUAGES (constant)
│   ├── TranslatedContent (interface)
│   ├── TranslatedItem (extends TranslatedContent)
│   ├── TranslatedArticle (extends TranslatedContent)
│   ├── TranslatedLink (extends TranslatedContent)
│   ├── TranslatedTag (interface)
│   ├── TranslationMeta (interface)
│   ├── GuestContentResponse (interface)
│   └── LanguageAvailabilityResponse (interface)
│
└── Utility Types
    ├── TranslationStatus (type)
    ├── TranslationKey (type)
    └── LanguageDetectionResult (interface)
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose | Estimated Lines |
|-----------|---------|-----------------|
| `/src/types/l10n.ts` | Localization types and constants | ~150-180 |

### Files to Modify

| File Path | Change Description | Lines Affected |
|-----------|-------------------|----------------|
| `/src/types/index.ts` | Add export for `l10n.ts` types | ~5 |

### Files for Reference Only (Do Not Modify)

| File Path | Reference Purpose |
|-----------|-------------------|
| `/src/lib/i18n/config.ts` | Existing locale configuration patterns |
| `/src/contexts/LocaleContext.tsx` | Existing `SupportedLanguage` type source |
| `/src/types/reactions.ts` | Type file structure pattern |

---

## Implementation Tasks

### Task 1: Create Base Types in l10n.ts

**File:** `/src/types/l10n.ts`

```typescript
// Types to define:

// 1. Re-export SupportedLanguage from LocaleContext
export type { SupportedLanguage } from '@/contexts/LocaleContext';

// 2. LanguageInfo interface (matches Plan-111 spec)
export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;           // English name
  nativeName: string;     // Native name (e.g., "Deutsch")
  flag?: string;          // Flag emoji (optional)
}

// 3. SUPPORTED_LANGUAGES constant
export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
];
```

### Task 2: Define TranslatedContent Base Interface

```typescript
// Translation status enum-like type
export type TranslationStatus = 'completed' | 'pending' | 'failed' | 'outdated';

// Base interface for all translated content
export interface TranslatedContent {
  /** Language currently being displayed */
  displayLanguage: SupportedLanguage;
  /** Original language of the content */
  sourceLanguage: SupportedLanguage;
  /** Whether content is showing a translation */
  isTranslated: boolean;
  /** Status of the translation if available */
  translationStatus?: TranslationStatus;
}
```

### Task 3: Define Content-Specific Translation Interfaces

```typescript
// Translated item content
export interface TranslatedItem extends TranslatedContent {
  id: string;
  publicId: string;
  name: string;
  description: string | null;
  originalName?: string;           // Original if showing translation
  originalDescription?: string;    // Original if showing translation
}

// Translated article content
export interface TranslatedArticle extends TranslatedContent {
  id: string;
  title: string;
  description: string | null;
  originalTitle?: string;
  originalDescription?: string;
  links: TranslatedLink[];
}

// Translated link content
export interface TranslatedLink extends TranslatedContent {
  id: string;
  title: string;
  url: string;                     // URLs are never translated
  thumbnailUrl: string | null;
  originalTitle?: string;
}

// Translated tag content
export interface TranslatedTag {
  key: string;
  displayValue: string;
  isTranslated: boolean;
}
```

### Task 4: Define API Response Types

```typescript
// Translation metadata for API responses
export interface TranslationMeta {
  /** Language that was requested */
  requestedLanguage: SupportedLanguage;
  /** Language actually being displayed */
  displayLanguage: SupportedLanguage;
  /** Original source language of content */
  sourceLanguage: SupportedLanguage;
  /** Languages with available translations */
  availableTranslations: SupportedLanguage[];
  /** Whether currently showing a translation */
  isShowingTranslation: boolean;
}

// Full guest content response
export interface GuestContentResponse {
  item: TranslatedItem;
  articles: TranslatedArticle[];
  tags: TranslatedTag[];
  translationMeta: TranslationMeta;
}

// Language availability response
export interface LanguageAvailabilityResponse {
  /** Source/original language of the item */
  sourceLanguage: SupportedLanguage;
  /** Languages with completed translations */
  availableTranslations: SupportedLanguage[];
  /** Languages with pending translations */
  pendingTranslations: SupportedLanguage[];
  /** Languages without any translation */
  unavailableTranslations: SupportedLanguage[];
}
```

### Task 5: Define Utility Types and Helpers

```typescript
// Translation key for type-safe translation lookups
export type TranslationKey = string;

// Language detection result
export interface LanguageDetectionResult {
  /** Detected or selected language */
  language: SupportedLanguage;
  /** Source of the detection */
  source: 'url' | 'cookie' | 'header' | 'default';
  /** Confidence level of detection */
  confidence: 'explicit' | 'inferred' | 'fallback';
}

// Language preference storage
export interface LanguagePreference {
  /** Preferred language code */
  language: SupportedLanguage;
  /** When preference was set */
  setAt: string;
  /** Where preference is stored */
  storage: 'cookie' | 'database' | 'session';
}
```

### Task 6: Add Utility Functions

```typescript
/**
 * Check if a language code is supported
 * @param code - Language code to check
 * @returns True if the code is a supported language
 */
export function isSupportedLanguage(code: string): code is SupportedLanguage {
  return SUPPORTED_LANGUAGES.some(lang => lang.code === code);
}

/**
 * Get language info by code
 * @param code - Language code to look up
 * @returns LanguageInfo object or undefined if not found
 */
export function getLanguageInfo(code: SupportedLanguage): LanguageInfo | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
}

/**
 * Get language name for display
 * @param code - Language code
 * @param native - Return native name if true, English name if false
 * @returns Display name string
 */
export function getLanguageName(code: SupportedLanguage, native = true): string {
  const info = getLanguageInfo(code);
  return native ? (info?.nativeName ?? code) : (info?.name ?? code);
}

/**
 * Default language when no preference is detected
 */
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
```

### Task 7: Update types/index.ts

**File:** `/src/types/index.ts`

Add export for l10n types at the end of the file:

```typescript
// L10N types (Epic 4 - Guest Experience)
export * from './l10n';
```

---

## Acceptance Criteria Verification

| Criterion | Implementation |
|-----------|----------------|
| Type definitions include supported language codes | `SupportedLanguage` re-exported from LocaleContext |
| Language metadata interface includes display names | `LanguageInfo` interface with name, nativeName, flag |
| Translated content types support string translations | `TranslatedItem`, `TranslatedArticle`, `TranslatedLink` |
| Constant exports supported languages with metadata | `SUPPORTED_LANGUAGES` array |
| Utility type definitions exist | `TranslationStatus`, `TranslationKey`, `LanguageDetectionResult` |
| All types properly exported | Re-exported from `/src/types/index.ts` |
| Documentation comments explain purpose | JSDoc comments on all interfaces and functions |

---

## Dependencies

### Upstream Dependencies (Required Before This Task)

| Dependency | Status | Notes |
|------------|--------|-------|
| Epic 1 Foundation | Complete | Provides `SupportedLanguage` type in LocaleContext |
| `/src/contexts/LocaleContext.tsx` | Exists | Source of `SupportedLanguage` type |

### Downstream Dependencies (Blocked By This Task)

| Task | File | Dependency |
|------|------|------------|
| Task 1.2 | `/src/lib/i18n/guest-language.ts` | Uses `SupportedLanguage`, `LanguageInfo` |
| Task 1.3 | `/src/types/index.ts` | Re-exports l10n types |
| Task 2.1 | `/src/lib/translations/fetch-translations.ts` | Uses `TranslatedItem`, etc. |
| Task 3.1 | `GuestLanguageSwitcher` | Uses `SupportedLanguage`, `LanguageInfo` |
| Task 5.2 | `ItemDisplay` | Uses `TranslationMeta`, `TranslatedContent` |

---

## Testing Strategy

### Type Compilation Testing

1. Run `npx tsc --noEmit` to verify TypeScript compilation
2. Verify no circular dependency issues with LocaleContext import
3. Test import from `/src/types/index.ts` works correctly

### Integration Testing

1. Create a test file that imports all exported types
2. Verify type inference works correctly with sample data
3. Test utility functions with valid and invalid inputs

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Circular import with LocaleContext | Low | Medium | Import only the type, not runtime values |
| Duplicate type definitions | Medium | Low | Re-export from single source (LocaleContext) |
| Breaking existing imports | Low | Medium | Add exports, don't modify existing ones |

---

## File Structure After Implementation

```
/src/types/
├── index.ts          # Main exports (modified - add l10n export)
├── l10n.ts           # NEW: Localization types
├── reactions.ts      # Existing
├── analytics.ts      # Existing
├── qrcode.ts         # Existing
├── pdf.ts            # Existing
├── admin.ts          # Existing
├── dashboard.ts      # Existing
└── permissions.ts    # Existing
```

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` (Phase 1, Task 1.1)
- **Request Document:** `/docs/gen_requests_epic4.md` (REQ-338)
- **Existing Locale Config:** `/src/lib/i18n/config.ts`
- **Existing LocaleContext:** `/src/contexts/LocaleContext.tsx`
- **Type Export Pattern:** `/src/types/index.ts`

---

*Implementation overview generated for FAQBNB Localization Epic 4 - Task 1.1*
