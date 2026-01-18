# REQ-304: Create Localization Types File - Implementation Breakdown

**Last Modified:** 2026-01-18
**Request Reference:** REQ-304 from `docs/gen_requests_epic4.md`
**Implementation Plan Reference:** `docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
**Phase:** 1 - Types and Utilities
**Task ID:** 1.1
**Size:** S (Small)

---

## Summary

Create a centralized TypeScript type definition file (`/src/types/l10n.ts`) that establishes the type contracts for all localization and internationalization features. This file will define supported language types, language metadata interfaces, translated content structures, and utility constants that form the foundation for the entire L10N Epic 4 Guest Experience implementation.

---

## Current State Analysis

### Existing Patterns in Codebase

The project follows established patterns for type definitions as observed in:

| Pattern | Example File | Pattern Description |
|---------|--------------|---------------------|
| Enum for fixed sets | `/src/types/permissions.ts` | `enum UserRole { USER = 'user', ADMIN = 'admin' }` |
| Type union from const | `/src/types/permissions.ts` | `type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS]` |
| Interface definitions | `/src/types/index.ts` | Standard interface definitions with JSDoc comments |
| Constants with `as const` | `/src/types/permissions.ts` | `export const PERMISSIONS = { ... } as const` |
| Record mappings | `/src/types/index.ts` | `Record<number, Omit<UserFriendlyError, 'code'>>` |
| Re-exports from index | `/src/types/index.ts` | `export * from './permissions'` |

### Current L10N Infrastructure

- **No existing l10n.ts file** - This will be a new file
- **No existing i18n directory** in `/src/lib/`
- **No language-related types** defined in the codebase
- The `PURPOSE_LABELS` constant in `/src/lib/titleGenerator.ts` provides a simple label mapping pattern

---

## Implementation Approach

### Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Type style | `type` union for language codes | More readable than enum, consistent with `LinkType`, `PurposeType` patterns |
| Constant style | `as const` assertion | Provides type narrowing and immutability |
| Documentation | JSDoc comments | Follows existing pattern in permissions.ts |
| Export strategy | Named exports + barrel re-export | Consistent with existing type organization |

### Type Definitions to Implement

Based on the Implementation Plan (Task 1.1) and Integration Contract specification:

1. **`SupportedLanguage`** - Type union of supported language codes
2. **`LanguageInfo`** - Interface for language metadata (code, name, nativeName, flag)
3. **`SUPPORTED_LANGUAGES`** - Constant array of LanguageInfo objects
4. **`TranslatedContent`** - Base interface for translated content metadata
5. **`TranslatedItem`** - Extended interface for translated item data
6. **`TranslatedArticle`** - Extended interface for translated article data
7. **`TranslatedLink`** - Extended interface for translated link data
8. **`TranslatedTag`** - Interface for translated tag data
9. **`GuestContentResponse`** - API response interface for guest content
10. **`LanguageAvailabilityResponse`** - API response for available translations
11. **`GuestLanguageState`** - State management interface for guest language

### Utility Functions to Implement

- `isSupportedLanguage(code: string): code is SupportedLanguage` - Type guard
- `getLanguageInfo(code: SupportedLanguage): LanguageInfo` - Lookup helper
- `getLanguageDisplayName(code: SupportedLanguage, native?: boolean): string` - Display name helper

---

## Ordered Implementation Tasks

### Task 1: Create the l10n.ts file with core types
**File:** `/src/types/l10n.ts`

1. Add file header with JSDoc documentation
2. Define `SupportedLanguage` type union: `'en' | 'fr' | 'es' | 'de' | 'nl' | 'it'`
3. Define `LanguageInfo` interface with required fields
4. Define `SUPPORTED_LANGUAGES` constant array with all 6 languages

### Task 2: Add translated content interfaces
**File:** `/src/types/l10n.ts`

1. Define `TranslatedContent` base interface
2. Define `TranslatedItem` interface extending base
3. Define `TranslatedArticle` interface extending base
4. Define `TranslatedLink` interface extending base
5. Define `TranslatedTag` interface

### Task 3: Add API response interfaces
**File:** `/src/types/l10n.ts`

1. Define `GuestContentResponse` interface with item, articles, tags, and translationMeta
2. Define `LanguageAvailabilityResponse` interface
3. Define `GuestLanguageState` interface for state management

### Task 4: Add utility type functions
**File:** `/src/types/l10n.ts`

1. Implement `isSupportedLanguage()` type guard
2. Implement `getLanguageInfo()` lookup helper
3. Implement `getLanguageDisplayName()` display helper

### Task 5: Update types/index.ts with L10N exports
**File:** `/src/types/index.ts`

1. Add `export * from './l10n'` statement

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/types/l10n.ts` | Localization TypeScript types, interfaces, and utility functions |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/types/index.ts` | Add barrel export: `export * from './l10n'` |

### Functions/Exports to Add

**In `/src/types/l10n.ts`:**

| Export Name | Type | Description |
|-------------|------|-------------|
| `SupportedLanguage` | Type | Union type of supported language codes |
| `LanguageInfo` | Interface | Language metadata structure |
| `SUPPORTED_LANGUAGES` | Constant | Array of all supported languages with metadata |
| `TranslatedContent` | Interface | Base translated content metadata |
| `TranslatedItem` | Interface | Translated item with original content |
| `TranslatedArticle` | Interface | Translated article with links |
| `TranslatedLink` | Interface | Translated link data |
| `TranslatedTag` | Interface | Translated tag data |
| `GuestContentResponse` | Interface | Full guest content API response |
| `LanguageAvailabilityResponse` | Interface | Available translations API response |
| `GuestLanguageState` | Interface | Guest language state management |
| `isSupportedLanguage()` | Function | Type guard for language validation |
| `getLanguageInfo()` | Function | Get language metadata by code |
| `getLanguageDisplayName()` | Function | Get display name for language |

---

## Technical Specifications

### SupportedLanguage Type

```typescript
export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';
```

### SUPPORTED_LANGUAGES Constant

```typescript
export const SUPPORTED_LANGUAGES: readonly LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
] as const;
```

### Translation Status Type

```typescript
export type TranslationStatus = 'completed' | 'pending' | 'failed';
```

---

## Acceptance Criteria Verification

| Criteria | Implementation |
|----------|----------------|
| Type definitions include supported language codes with proper TypeScript constraints | `SupportedLanguage` type union with 6 language codes |
| Language metadata interface includes display names, text direction, and locale formatting | `LanguageInfo` interface with code, name, nativeName, flag |
| Translated content types support both simple string translations and rich content structures | `TranslatedItem`, `TranslatedArticle`, `TranslatedLink`, `TranslatedTag` interfaces |
| A constant exports the complete list of supported languages with their metadata | `SUPPORTED_LANGUAGES` constant array |
| Utility type definitions exist for translation keys, language detection, and preference storage | `GuestLanguageState`, utility functions |
| All types are properly exported and can be imported by other modules | Barrel export in `index.ts` |
| Documentation comments explain the purpose of each major type and interface | JSDoc comments on all exports |

---

## Dependencies

### Prerequisites
- None - This is a foundational task with no dependencies

### Downstream Dependencies
This file will be used by:
- Task 1.2: Guest language utility module (`/src/lib/i18n/guest-language.ts`)
- Task 1.3: Types index export update
- All Phase 2-6 tasks in Epic 4

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Type conflicts with future Epic 1 types | Low | Medium | Use consistent naming conventions; types can be extended |
| Missing language support | Low | Low | `SUPPORTED_LANGUAGES` can be extended; type union can grow |
| Breaking changes to interfaces | Low | High | Mark experimental interfaces with JSDoc; use optional fields |

---

## Testing Considerations

1. **Type compilation** - Ensure all types compile without errors
2. **Type guard validation** - Test `isSupportedLanguage()` with valid and invalid inputs
3. **Export availability** - Verify all types are importable from `@/types`
4. **IDE support** - Verify IntelliSense works correctly with type definitions

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` (Lines 216-298)
- Request: `/docs/gen_requests_epic4.md` (REQ-304)
- Pattern Reference: `/src/types/permissions.ts`
- Pattern Reference: `/src/types/index.ts`
