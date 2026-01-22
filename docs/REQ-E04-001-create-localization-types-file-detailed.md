# Create Localization Types File - Detailed Implementation Tasks

**Generated:** 2026-01-22 22:23
**Reference Documents:**
- Requirements: docs/gen_requests_epic4.md (Request #1)
- Overview: docs/REQ-E04-001-create-localization-types-file-overview.md
- Implementation Plan: docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

## Build & Test Commands

| Action | Command |
|--------|---------|
| Type Check | `npx tsc --noEmit` |
| Unit Tests | `npm test` |
| Build | `npm run build` |
| Lint | `npm run lint` |

---

## 1. Create Core Type Definitions File

**Context:** This task establishes the foundational type system for guest-facing localization. The types must be compatible with the existing `SupportedLanguage` type from `LocaleContext` (already implemented in Epic 1) to ensure consistency between admin UI (which uses next-intl) and guest-facing content (which uses these l10n types).

**Files to modify:**
- `/src/types/l10n.ts` (create new file)

**Estimated effort:** 1 story point

- [ ] **1.1** Create the file `/src/types/l10n.ts` with proper TypeScript module structure
- [ ] **1.2** Import the `SupportedLanguage` type from `@/contexts/LocaleContext` to ensure type compatibility
- [ ] **1.3** Re-export `SupportedLanguage` from this module with a TSDoc comment explaining it's the same as the LocaleContext type
- [ ] **1.4** Define the `LanguageInfo` interface with the following fields: `code: SupportedLanguage`, `name: string` (English name), `nativeName: string` (native language name), `flag?: string` (optional flag emoji)
- [ ] **1.5** Export a constant `SUPPORTED_LANGUAGES: LanguageInfo[]` containing metadata for all 6 languages (en, fr, es, de, nl, it) with their English names, native names, and flag emojis
- [ ] **1.6** Add a module-level TSDoc comment explaining this file provides types for guest-facing localization in Epic 4
- [ ] **1.7** Add `@since Epic 4 - Guest Experience` tag to the module documentation
- [ ] **1.8** Run `npx tsc --noEmit` to verify the file compiles without errors

---

## 2. Define Translation Metadata Interfaces

**Context:** These interfaces establish the structure for how translated content is represented throughout the application. The base `TranslatedContent` interface provides common fields that all content types share (display language, source language, translation status), while specific interfaces extend it for each entity type (items, articles, links, tags). These types must align with the Epic 3 database schema (item_translations, article_translations, link_translations, tag_translations tables).

**Files to modify:**
- `/src/types/l10n.ts` (continue in same file)

**Estimated effort:** 1 story point

- [ ] **2.1** Define the `TranslatedContent` base interface with fields: `displayLanguage: SupportedLanguage`, `sourceLanguage: SupportedLanguage`, `isTranslated: boolean`, `translationStatus?: 'completed' | 'pending' | 'failed'`
- [ ] **2.2** Create `TranslatedItem` interface extending `TranslatedContent` with item-specific fields: `id: string`, `publicId: string`, `name: string`, `description: string | null`, `originalName?: string`, `originalDescription?: string | null`
- [ ] **2.3** Create `TranslatedArticle` interface extending `TranslatedContent` with article fields: `id: string`, `title: string`, `description: string | null`, `originalTitle?: string`, `originalDescription?: string | null`, `links: TranslatedLink[]`
- [ ] **2.4** Create `TranslatedLink` interface extending `TranslatedContent` with link fields: `id: string`, `title: string`, `url: string`, `thumbnailUrl: string | null`, `originalTitle?: string` (note: URLs are never translated)
- [ ] **2.5** Create `TranslatedTag` interface with fields: `key: string`, `displayValue: string`, `isTranslated: boolean`
- [ ] **2.6** Add TSDoc comments to each interface explaining their purpose and which Epic 3 database tables they correspond to
- [ ] **2.7** Add inline comment to `TranslatedLink.url` field: "URLs are never translated"
- [ ] **2.8** Run `npx tsc --noEmit` to verify all interfaces compile correctly

---

## 3. Define Guest API Response Types

**Context:** These types define the structure of responses from guest-facing API endpoints. The `GuestContentResponse` includes the main content (item, articles, tags) plus translation metadata that tells the client which language is being displayed, which translations are available, and whether the user is viewing translated content. The `LanguageAvailabilityResponse` allows clients to query which translations exist for a specific item, enabling smart language switching UI.

**Files to modify:**
- `/src/types/l10n.ts` (continue in same file)

**Estimated effort:** 1 story point

- [ ] **3.1** Define `GuestContentResponse` interface with fields: `item: TranslatedItem`, `articles: TranslatedArticle[]`, `tags: TranslatedTag[]`, `translationMeta: { ... }`
- [ ] **3.2** Define the `translationMeta` nested interface with fields: `requestedLanguage: SupportedLanguage`, `displayLanguage: SupportedLanguage`, `sourceLanguage: SupportedLanguage`, `availableTranslations: SupportedLanguage[]`, `isShowingTranslation: boolean`
- [ ] **3.3** Define `LanguageAvailabilityResponse` interface with fields: `sourceLanguage: SupportedLanguage`, `availableTranslations: SupportedLanguage[]`, `pendingTranslations: SupportedLanguage[]`, `unavailableTranslations: SupportedLanguage[]`
- [ ] **3.4** Add TSDoc comments explaining which API endpoints return these types (reference REQ-E04-005 and REQ-E04-006)
- [ ] **3.5** Add inline comment explaining that `availableTranslations` only includes completed translations, not pending or failed ones
- [ ] **3.6** Run `npx tsc --noEmit` to verify the new interfaces compile without errors

---

## 4. Add Language Utility Function Signatures

**Context:** These JSDoc comments document the expected API for language utility functions that will be implemented in REQ-E04-007. By defining the function signatures now, we establish the contract that other components can depend on, even though the actual implementation will come later. This allows parallel development and ensures consistency across the codebase.

**Files to modify:**
- `/src/types/l10n.ts` (continue in same file)

**Estimated effort:** 1 story point

- [ ] **4.1** Add a JSDoc comment block documenting the `mergeTranslation()` function signature with description: "Merges original content with translation data, preserving untranslated fields", parameters: `(original: T, translation: Partial<T>) => T`, and usage example
- [ ] **4.2** Add a JSDoc comment block documenting the `getDisplayLanguage()` function signature with description: "Determines the best language to display based on user request and availability", parameters: `(requested: SupportedLanguage, available: SupportedLanguage[], source: SupportedLanguage) => SupportedLanguage`, and return value explanation
- [ ] **4.3** Add a JSDoc comment block documenting the `formatLanguageName()` function signature with description: "Formats a language code into a human-readable name", parameters: `(code: SupportedLanguage, native?: boolean) => string`, and examples for both English and native formatting
- [ ] **4.4** Add a note in JSDoc stating: "Implementation of these utilities will occur in `/src/lib/translations/translation-utils.ts` (REQ-E04-007)"
- [ ] **4.5** Add `@see` JSDoc tags referencing REQ-E04-007 for the actual implementation

---

## 5. Integrate with Existing Type System

**Context:** The project follows a convention of centrally exporting all types through `/src/types/index.ts` using barrel exports. This allows developers to import types via `@/types` rather than specific file paths, improving consistency and maintainability. We need to add the new l10n types to this barrel export file while ensuring no circular dependencies are introduced.

**Files to modify:**
- `/src/types/index.ts` (add export statement)

**Estimated effort:** 1 story point

- [ ] **5.1** Open `/src/types/index.ts` and add the line `export * from './l10n';` at an appropriate location (suggest adding near other localization exports around line 860)
- [ ] **5.2** Add a comment above the export: `// Guest-facing localization types (Epic 4 - Guest Experience)`
- [ ] **5.3** Run `npx tsc --noEmit` to verify no circular dependency errors are introduced
- [ ] **5.4** Create a test import in a temporary file to verify types can be imported via `@/types`: `import { SupportedLanguage, SUPPORTED_LANGUAGES, TranslatedContent } from '@/types';`
- [ ] **5.5** Verify the test import compiles successfully with `npx tsc --noEmit`
- [ ] **5.6** Remove the temporary test file after verification

---

## 6. Documentation and Validation

**Context:** Comprehensive documentation ensures developers understand how to use these types correctly. TSDoc comments provide IntelliSense hints in IDEs, making the development experience smoother. We also need to verify that the new types are compatible with the existing `SupportedLanguage` type from LocaleContext to prevent runtime type conflicts.

**Files to modify:**
- `/src/types/l10n.ts` (add comprehensive TSDoc)

**Estimated effort:** 1 story point

- [ ] **6.1** Add module-level JSDoc documentation block at the top of `/src/types/l10n.ts` explaining: purpose (guest-facing localization types), usage context (Epic 4 - Guest Experience), and relationship to Epic 1 foundation
- [ ] **6.2** Add usage example in module-level JSDoc showing how to import and use the main types (SupportedLanguage, TranslatedItem, GuestContentResponse)
- [ ] **6.3** Review each exported interface and ensure it has a TSDoc comment with `@description`, `@since Epic 4 - Guest Experience`, and `@see` tags referencing related types or APIs
- [ ] **6.4** Add field-level JSDoc comments to key fields that may need clarification (e.g., explain when `originalName` is populated vs null)
- [ ] **6.5** Run `npm run typecheck` (which executes `npx tsc --noEmit`) to verify no TypeScript errors exist
- [ ] **6.6** Create a simple test to verify type compatibility: import both `SupportedLanguage` from `@/types` and from `@/contexts/LocaleContext`, assign them to each other, and verify no type errors occur
- [ ] **6.7** Run the full build process with `npm run build` to ensure the types don't break the production build

---

## Verification Checklist

After completing all tasks, verify the following acceptance criteria:

- [ ] File `/src/types/l10n.ts` exists and exports all required types
- [ ] `SupportedLanguage` type is re-exported and compatible with `LocaleContext.SupportedLanguage`
- [ ] All 6 supported languages (en, fr, es, de, nl, it) are defined in `SUPPORTED_LANGUAGES` with correct ISO codes, English names, and native names
- [ ] `TranslatedContent` base interface and all extending interfaces (`TranslatedItem`, `TranslatedArticle`, `TranslatedLink`, `TranslatedTag`) are properly defined
- [ ] `GuestContentResponse` and `LanguageAvailabilityResponse` API types are complete
- [ ] Utility function signatures are documented with JSDoc comments and reference REQ-E04-007 for implementation
- [ ] All types are exported through `/src/types/index.ts` barrel file
- [ ] All exports have comprehensive TSDoc documentation with `@since Epic 4 - Guest Experience` tags
- [ ] `npx tsc --noEmit` runs without errors
- [ ] `npm run build` completes successfully
- [ ] No circular dependency issues introduced
- [ ] Types can be imported via `@/types` path (barrel export works)

---

## Notes for Implementation Agent

**Type Compatibility:**
The `SupportedLanguage` type MUST be imported from `@/contexts/LocaleContext` and re-exported, not redefined. This ensures type compatibility between admin UI (Epic 1/2) and guest-facing features (Epic 4).

**Database Alignment:**
The translation interfaces (`TranslatedItem`, `TranslatedArticle`, `TranslatedLink`) must match the structure of Epic 3 translation tables. Refer to the database schema in Epic 3 documentation if any fields are unclear.

**Future Implementation:**
The utility function signatures documented in Task 4 are placeholders. The actual implementation will occur in REQ-E04-007. Do not implement the functions in this task.

**Testing Strategy:**
Since these are pure TypeScript types with no runtime behavior, testing focuses on:
1. Type compilation (TypeScript compiler)
2. Import resolution (barrel exports)
3. Type compatibility (no conflicts with existing types)

---

*Document generated: 2026-01-22 22:23*
*Epic: 4 - Guest Experience*
*Task: Phase 1, Task 1.1 - Create localization types file*
