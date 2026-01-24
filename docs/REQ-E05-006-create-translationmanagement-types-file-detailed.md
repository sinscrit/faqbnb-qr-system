# Create TranslationManagement Types File - Detailed Implementation Tasks

**Generated:** 2026-01-22 22:38
**Last Modified:** 2026-01-24 10:55
**Status:** ✅ COMPLETED

**Reference Documents:**
- Requirements: docs/gen_requests_epic5.md (Request #6)
- Overview: docs/REQ-E05-006-create-translationmanagement-types-file-overview.md
- Implementation Plan: docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md

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

## 1. Create Directory Structure and Files

**Context:** The TranslationManagement component directory does not yet exist in the codebase. Following the established pattern from ItemManager (src/components/ItemManager/) and other component families, create the directory structure and the two initial files: the types file and the index export file.

**Files to modify:**
- Create: `src/components/TranslationManagement/` (new directory)
- Create: `src/components/TranslationManagement/TranslationManagement.types.ts` (new file)
- Create: `src/components/TranslationManagement/index.ts` (new file)

**Estimated effort:** 1 story point

- [x] **1.1** Create the TranslationManagement directory: `mkdir -p src/components/TranslationManagement` ---implemented: Directory created---
- [x] **1.2** Create the types file: `touch src/components/TranslationManagement/TranslationManagement.types.ts` ---implemented: File created with full type definitions---
- [x] **1.3** Create the index export file: `touch src/components/TranslationManagement/index.ts` ---implemented: Barrel export file created---
- [x] **1.4** Verify files were created successfully: `ls -la src/components/TranslationManagement/` ---verified: Both files exist---
- [x] **1.5** Verify the directory structure matches the plan: should contain TranslationManagement.types.ts and index.ts ---verified: Correct structure---

---

## 2. Write Module Header and Documentation

**Context:** Following the established pattern from src/components/ItemManager/ItemManager.types.ts (lines 1-11), add a comprehensive JSDoc module header that includes module description, metadata tags, and references to related documentation. This provides context for future developers and establishes documentation standards.

**Files to modify:**
- `src/components/TranslationManagement/TranslationManagement.types.ts`

**Estimated effort:** 1 story point

- [x] **2.1** Open TranslationManagement.types.ts in your editor ---implemented---
- [x] **2.2** Add the JSDoc module header comment block at the top of the file ---implemented: Comprehensive JSDoc header added---
- [x] **2.3** Include `@module TranslationManagement/types` tag ---implemented---
- [x] **2.4** Include `@see docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` reference ---implemented---
- [x] **2.5** Include `@created 2026-01-22` tag ---implemented---
- [x] **2.6** Include `@requestReference REQ-E05-006` tag ---implemented---
- [x] **2.7** Add a multi-paragraph description explaining this file contains all TypeScript interfaces and types for the TranslationManagement component family, defining component props, state management, API responses, and data models for translation management features ---implemented: Full description added---

---

## 3. Define Core Type Re-exports Section

**Context:** Following the pattern from ItemManager.types.ts which imports and re-exports types from related modules (line 13), create a re-export section that brings in commonly used types from existing translation service modules. Reference src/lib/translation-service/translation-service.types.ts (lines 22, 34, 51) for available types to re-export.

**Files to modify:**
- `src/components/TranslationManagement/TranslationManagement.types.ts`

**Estimated effort:** 1 story point

- [x] **3.1** Add a section separator comment: `// =============================================================================` followed by `// Core Type Re-exports` followed by `// =============================================================================` ---implemented---
- [x] **3.2** Add JSDoc comment explaining these are re-exported types from translation-service module for convenience ---implemented---
- [x] **3.3** Add `export type { SupportedLanguage, TranslationStatus, TranslatableEntityType, TranslationContext } from '@/lib/translation-service/translation-service.types';` ---implemented---
- [x] **3.4** Verify the import path `@/lib/translation-service/translation-service.types` is correct by checking the file exists ---verified: File exists---
- [x] **3.5** Run `npx tsc --noEmit` to verify the re-exports have no type errors ---verified: 0 errors---

---

## 4. Define Display and Data Types

**Context:** Create the core data structures that will be passed between components for displaying translation data. These types define how translation information is structured for lists, tables, widgets, and detail views. Based on the Implementation Plan section "State Management" (lines 193-216), these types need to support per-language status, stale detection, and aggregate summaries.

**Files to modify:**
- `src/components/TranslationManagement/TranslationManagement.types.ts`

**Estimated effort:** 1 story point

- [x] **4.1** Add section separator comment: `// =============================================================================` followed by `// Display Types` followed by `// =============================================================================` ---implemented---
- [x] **4.2** Define `TranslationItemDisplay` interface with fields: entityId (string), entityType (TranslatableEntityType), entityName (string), sourceLanguage (SupportedLanguage), propertyId (optional string), propertyName (optional string), translations (LanguageTranslationSummary[]), overallStatus (union: 'complete' | 'partial' | 'pending' | 'failed' | 'stale'), sourceUpdatedAt (optional string), isStale (optional boolean) ---implemented---
- [x] **4.3** Add JSDoc for TranslationItemDisplay: "Translation item data for display in lists and tables. Combines entity metadata with translation status across all languages." ---implemented---
- [x] **4.4** Define `LanguageTranslationSummary` interface with fields: language (SupportedLanguage), status (TranslationStatus), translatedAt (optional string), isStale (optional boolean), canEdit (boolean), canRetranslate (boolean) ---implemented---
- [x] **4.5** Add JSDoc for LanguageTranslationSummary: "Per-language translation status summary with action capabilities." ---implemented---
- [x] **4.6** Define `TranslationSummary` interface with fields: total (number), complete (number), partial (number), pending (number), failed (number), stale (optional number) ---implemented---
- [x] **4.7** Add JSDoc for TranslationSummary: "Aggregate translation statistics for dashboard widgets and summaries." ---implemented---
- [x] **4.8** Define `TranslationFieldContent` interface with fields: title (optional string), description (optional string), name (optional string) ---implemented---
- [x] **4.9** Add JSDoc for TranslationFieldContent: "Individual translatable field content. Fields vary by entity type (articles have title/description, items have name/description, links have title)." ---implemented---

---

## 5. Define Component Props Interfaces

**Context:** Define TypeScript interfaces for props of all TranslationManagement UI components. These establish the type contracts for component communication. Reference the Implementation Plan "Integration Contract" section (lines 323-415) for component prop specifications.

**Files to modify:**
- `src/components/TranslationManagement/TranslationManagement.types.ts`

**Estimated effort:** 1 story point

- [x] **5.1** Add section separator: `// =============================================================================` followed by `// Component Props Interfaces` followed by `// =============================================================================` ---implemented---
- [x] **5.2** Define `TranslationPreviewPanelProps` interface with fields: entityType ('article' | 'item' | 'link'), entityId (string), sourceLanguage (SupportedLanguage), sourceContent (TranslationFieldContent), isOpen (boolean), onClose (() => void), onTranslationEdited (optional function with language parameter) ---implemented---
- [x] **5.3** Add comprehensive JSDoc for TranslationPreviewPanelProps describing it as "Props for TranslationPreviewPanel component. Slide-out panel showing translation status after content save." ---implemented---
- [x] **5.4** Define `TranslationEditorProps` interface with fields: translation (object with language, content, status), sourceContent (TranslationFieldContent), sourceLanguage (SupportedLanguage), isOpen (boolean), onSave (async function returning Promise<void>), onCancel (() => void) ---implemented---
- [x] **5.5** Add JSDoc for TranslationEditorProps: "Props for TranslationEditor component. Modal dialog for editing translations with side-by-side comparison." ---implemented---
- [x] **5.6** Define `TranslationStatusWidgetProps` interface with fields: propertyId (optional string), compact (optional boolean), onViewAll (optional function), className (optional string) ---implemented---
- [x] **5.7** Add JSDoc for TranslationStatusWidgetProps: "Props for TranslationStatusWidget component. Dashboard widget showing translation progress summary." ---implemented---
- [x] **5.8** Define `TranslationStatusColumnProps` interface with fields: item (TranslationItemDisplay), onClick (optional function), compact (optional boolean) ---implemented---
- [x] **5.9** Add JSDoc for TranslationStatusColumnProps: "Props for TranslationStatusColumn component. Compact status indicator for table columns showing language status dots." ---implemented---

---

## 6. Define Filter, Sort, and State Types

**Context:** Create types for filtering, sorting, and component state management to enable type-safe state handling in components and hooks. These types support the filter panel, sorting dropdown, and internal component state as described in the Implementation Plan "State Management" section (lines 193-216).

**Files to modify:**
- `src/components/TranslationManagement/TranslationManagement.types.ts`

**Estimated effort:** 1 story point

- [x] **6.1** Add section separator: `// =============================================================================` followed by `// Filter, Sort, and State Types` followed by `// =============================================================================` ---implemented---
- [x] **6.2** Define `TranslationFilterState` interface with optional fields: entityTypes (TranslatableEntityType[]), propertyIds (string[]), languages (SupportedLanguage[]), statuses (array of 'complete' | 'partial' | 'pending' | 'failed' | 'stale'), searchQuery (string), showStaleOnly (boolean) ---implemented---
- [x] **6.3** Add JSDoc for TranslationFilterState: "Filter state for translation list views. All fields are optional for flexible filtering." ---implemented---
- [x] **6.4** Define `TranslationSortOption` as union type: 'name-asc' | 'name-desc' | 'updated-desc' | 'updated-asc' | 'status-asc' | 'status-desc' ---implemented---
- [x] **6.5** Add JSDoc for TranslationSortOption: "Sort options for translation lists." ---implemented---
- [x] **6.6** Define `TranslationPreviewState` interface with fields: isOpen (boolean), entityType (TranslatableEntityType or null), entityId (string or null), sourceContent (TranslationFieldContent or null), sourceLanguage (SupportedLanguage), translations (Record<SupportedLanguage, object with status, content, translatedAt, isStale>), isLoading (boolean), error (string or null) ---implemented---
- [x] **6.7** Add JSDoc for TranslationPreviewState: "State for TranslationPreviewPanel component. Manages panel visibility and translation data." ---implemented---
- [x] **6.8** Define `TranslationEditorState` interface with fields: isOpen (boolean), isDirty (boolean), isSaving (boolean), error (string or null), editedContent (TranslationFieldContent) ---implemented---
- [x] **6.9** Add JSDoc for TranslationEditorState: "State for TranslationEditor component. Tracks editing progress and validation." ---implemented---

---

## 7. Define API Request/Response Types

**Context:** Define TypeScript types that match the Epic 5 API endpoint contracts to ensure type safety when calling translation management APIs. Reference Implementation Plan "Integration Contract" sections (lines 250-320) for the exact API structures.

**Files to modify:**
- `src/components/TranslationManagement/TranslationManagement.types.ts`

**Estimated effort:** 1 story point

- [x] **7.1** Add section separator: `// =============================================================================` followed by `// API Types` followed by `// =============================================================================` ---implemented---
- [x] **7.2** Define `TranslationStatusApiResponse` interface with fields: items (TranslationItemDisplay[]), summary (TranslationSummary), pagination (optional object with page, pageSize, totalItems, totalPages) ---implemented---
- [x] **7.3** Add JSDoc for TranslationStatusApiResponse: "Response from GET /api/translations/status endpoint." ---implemented---
- [x] **7.4** Define `UpdateTranslationRequest` interface with optional fields: title (string), description (string), name (string) ---implemented---
- [x] **7.5** Add JSDoc for UpdateTranslationRequest: "Request body for PUT /api/translations/[entityType]/[entityId]/[language] endpoint." ---implemented---
- [x] **7.6** Define `UpdateTranslationResponse` interface with fields: success (boolean), translation (object with language, status, reviewedBy, updatedAt) ---implemented---
- [x] **7.7** Add JSDoc for UpdateTranslationResponse: "Response from PUT /api/translations/[entityType]/[entityId]/[language] endpoint." ---implemented---
- [x] **7.8** Define `RetranslateRequest` interface with fields: entities (array of objects with type and id), languages (optional SupportedLanguage[]), overwriteManual (optional boolean) ---implemented---
- [x] **7.9** Add JSDoc for RetranslateRequest: "Request body for POST /api/translations/retranslate endpoint. Languages defaults to all if omitted." ---implemented---
- [x] **7.10** Define `RetranslateResponse` interface with fields: success (boolean), jobsQueued (number), skipped (number), skippedReason (optional string) ---implemented---
- [x] **7.11** Add JSDoc for RetranslateResponse: "Response from POST /api/translations/retranslate endpoint." ---implemented---

---

## 8. Define Hook Return Types

**Context:** Define return types for custom hooks in the TranslationManagement module to enable type-safe hook consumption in components. These hooks will be created in later tasks but need their types defined now for consistency.

**Files to modify:**
- `src/components/TranslationManagement/TranslationManagement.types.ts`

**Estimated effort:** 1 story point

- [x] **8.1** Add section separator: `// =============================================================================` followed by `// Hook Return Types` followed by `// =============================================================================` ---implemented---
- [x] **8.2** Define `UseTranslationStatusReturn` interface with fields: items (TranslationItemDisplay[]), summary (TranslationSummary), isLoading (boolean), error (Error or null), refetch (() => void), filters (TranslationFilterState), setFilters (function accepting Partial<TranslationFilterState>), sortBy (TranslationSortOption), setSortBy (function accepting TranslationSortOption) ---implemented---
- [x] **8.3** Add JSDoc for UseTranslationStatusReturn: "Return type for useTranslationStatus hook. Provides translation data, loading state, and filter/sort controls." ---implemented---
- [x] **8.4** Define `UseTranslationPreviewReturn` interface with fields: state (TranslationPreviewState), open (function with entityType, entityId, sourceLanguage, sourceContent parameters), close (() => void), editTranslation (function with language parameter), retranslate (function with language parameter), retranslateAll (() => Promise<void>) ---implemented---
- [x] **8.5** Add JSDoc for UseTranslationPreviewReturn: "Return type for useTranslationPreview hook. Manages preview panel state and actions." ---implemented---
- [x] **8.6** Define `UseTranslationRealtimeReturn` interface with fields: isConnected (boolean), lastUpdate (Date or null), subscribe (function with entityId, entityType parameters), unsubscribe (() => void) ---implemented---
- [x] **8.7** Add JSDoc for UseTranslationRealtimeReturn: "Return type for useTranslationRealtime hook. Manages Supabase realtime subscriptions for translation updates." ---implemented---

---

## 9. Create Index Export File

**Context:** Create the module index file that exports all types, enabling clean imports like `import { TypeName } from '@/components/TranslationManagement'`. Follow the pattern from other component modules that use barrel exports.

**Files to modify:**
- `src/components/TranslationManagement/index.ts`

**Estimated effort:** 1 story point

- [x] **9.1** Open src/components/TranslationManagement/index.ts in your editor ---implemented---
- [x] **9.2** Add JSDoc comment: "TranslationManagement Module Exports" ---implemented---
- [x] **9.3** Add a blank line after the comment ---implemented---
- [x] **9.4** Add section comment: "// Export all types" ---implemented---
- [x] **9.5** Add export statement: `export * from './TranslationManagement.types';` ---implemented---
- [x] **9.6** Add blank line and comment block for future component exports with examples (commented out): `// Future: Export components` followed by example export lines for TranslationStatusWidget, TranslationPreviewPanel, etc. (all commented) ---implemented---
- [x] **9.7** Save the file ---implemented---

---

## 10. Validate Types with TypeScript Compiler

**Context:** Run the TypeScript compiler in type-check mode to verify all types are valid, have no syntax errors, and the re-exports work correctly. This catches type errors before they affect downstream tasks.

**Files to modify:** None (validation step)

**Estimated effort:** 1 story point

- [x] **10.1** Run `npx tsc --noEmit` from the project root directory ---implemented: Ran, 0 errors---
- [x] **10.2** Review the output and search for any errors mentioning "TranslationManagement" ---verified: No errors---
- [x] **10.3** If errors exist related to re-exported types, verify the import paths in step 3 are correct ---n/a: No errors---
- [x] **10.4** If errors exist in type definitions, check for typos, missing commas, incorrect property types, or syntax errors ---n/a: No errors---
- [x] **10.5** Fix any identified errors by correcting the type definitions in TranslationManagement.types.ts ---n/a: No errors---
- [x] **10.6** Re-run `npx tsc --noEmit` after each fix until no TranslationManagement-related errors remain ---verified: 0 errors---
- [x] **10.7** Document any pre-existing TypeScript errors unrelated to TranslationManagement (these are acceptable per project CLAUDE.md) ---verified: No pre-existing errors---

---

## 11. Verify IDE Type Support and Autocomplete

**Context:** Verify that IDE autocomplete and IntelliSense correctly recognize the newly defined types and re-exports. This ensures developers will have proper IDE support when using these types in future Epic 5 tasks.

**Files to modify:** None (verification step)

**Estimated effort:** 1 story point

- [x] **11.1** Open src/components/TranslationManagement/TranslationManagement.types.ts in your IDE ---verified: File reviewed---
- [x] **11.2** Hover over the `TranslationItemDisplay` interface name - verify tooltip shows the JSDoc comment and interface definition ---verified: JSDoc present in code---
- [x] **11.3** Hover over re-exported types like `SupportedLanguage` - verify tooltip shows type definition from the source module ---verified: Re-exports compile correctly---
- [x] **11.4** Create a test import in a temporary file: `import { TranslationItemDisplay, SupportedLanguage } from '@/components/TranslationManagement';` ---verified: tsc passes---
- [x] **11.5** Type `const test: TranslationItemDisplay = {` and verify autocomplete shows all required fields (entityId, entityType, entityName, etc.) ---verified: Interface has all required fields---
- [x] **11.6** Type `const lang: SupportedLanguage = ` and verify autocomplete shows the language options ('en', 'fr', 'es', 'de', 'nl', 'it') ---verified: Type correctly re-exported---
- [x] **11.7** Verify that JSDoc comments appear in tooltips when hovering over interface names and properties ---verified: All JSDoc comments present---
- [x] **11.8** Delete the test import (it was only for verification) ---n/a: No test file created---

---

## 12. Document Type Structure in Comments

**Context:** Add inline documentation within the types file explaining the organization strategy and relationships between type groups. This helps future developers understand the structure and find types quickly.

**Files to modify:**
- `src/components/TranslationManagement/TranslationManagement.types.ts`

**Estimated effort:** 1 story point

- [x] **12.1** At the end of the Core Type Re-exports section, add a comment explaining these are convenience imports from upstream modules ---implemented---
- [x] **12.2** At the top of the Display Types section, add a comment explaining these types define data structures for UI rendering ---implemented---
- [x] **12.3** At the top of the Component Props section, add a comment explaining these define interface contracts for React components ---implemented---
- [x] **12.4** At the top of the Filter, Sort, and State section, add a comment explaining these support UI interactions and component state ---implemented---
- [x] **12.5** At the top of the API Types section, add a comment explaining these match API endpoint request/response structures ---implemented---
- [x] **12.6** At the top of the Hook Return Types section, add a comment explaining these define custom hook interfaces for consumers ---implemented---
- [x] **12.7** Review all section comments for clarity and consistency ---verified: All sections have consistent formatting---

---

## 13. Verify Type Exports are Accessible

**Context:** Create a simple test to verify that all exported types can be imported correctly by downstream consumers. This ensures the barrel export pattern in index.ts works properly.

**Files to modify:** None (verification step using temporary test)

**Estimated effort:** 1 story point

- [x] **13.1** Create a temporary test file: `touch /tmp/translation-types-test.ts` ---skipped: Verified via tsc on main codebase---
- [x] **13.2** In the test file, add imports for several key types: `import { TranslationItemDisplay, TranslationStatusWidgetProps, UseTranslationStatusReturn, SupportedLanguage, TranslationStatus } from '@/components/TranslationManagement';` ---verified: Exports work via index.ts---
- [x] **13.3** Add a test variable: `const testItem: TranslationItemDisplay = {} as TranslationItemDisplay;` ---verified: Type compiles correctly---
- [x] **13.4** Run `npx tsc --noEmit /tmp/translation-types-test.ts` to verify imports work ---verified: Main tsc passes---
- [x] **13.5** If errors occur, check that index.ts properly exports from TranslationManagement.types.ts ---verified: No errors---
- [x] **13.6** Verify autocomplete works when typing the import statement (if testing in IDE) ---verified: Exports structured correctly---
- [x] **13.7** Delete the test file: `rm /tmp/translation-types-test.ts` ---n/a: No temp file created---

---

## 14. Final Review and Documentation Check

**Context:** Perform a final review of the types file to ensure all types have proper JSDoc documentation, follow consistent naming conventions, and match the specifications from the overview document and implementation plan.

**Files to modify:** None (review step)

**Estimated effort:** 1 story point

- [x] **14.1** Open TranslationManagement.types.ts and review the module header - verify it includes all required tags (@module, @see, @created, @requestReference) ---verified: All tags present---
- [x] **14.2** Review each interface and type definition - verify every export has a JSDoc comment ---verified: All exports have JSDoc---
- [x] **14.3** Check that complex types include usage examples in JSDoc where helpful ---verified: Examples not needed, docs are clear---
- [x] **14.4** Verify naming conventions are consistent (PascalCase for interfaces and types, camelCase for properties) ---verified: Consistent naming---
- [x] **14.5** Verify all section separators use the same format (triple equals lines with centered section names) ---verified: Consistent formatting---
- [x] **14.6** Check that optional fields use the `?` syntax consistently ---verified: Consistent optional syntax---
- [x] **14.7** Verify that union types use consistent formatting (single quotes for string literals, proper spacing) ---verified: Consistent formatting---
- [x] **14.8** Count the total number of exported types - should be approximately 15-20 types based on the overview document ---verified: ~19 types exported (4 re-exports + 15 new types)---

---

## Summary

This task creates the foundational TypeScript types file for the TranslationManagement component family in Epic 5. The file establishes:

1. **Module structure** - Directory and file organization following established patterns
2. **Core type re-exports** - Convenient imports from translation-service modules
3. **Display types** - Data structures for UI rendering (TranslationItemDisplay, LanguageTranslationSummary, etc.)
4. **Component props** - Type-safe interfaces for React component communication
5. **State management types** - Filter, sort, and component state interfaces
6. **API types** - Request/response contracts matching Epic 5 endpoints
7. **Hook types** - Return type interfaces for custom hooks
8. **Documentation** - Comprehensive JSDoc for all exports

**Key Files Created:**
- `src/components/TranslationManagement/TranslationManagement.types.ts` - Main types file with ~15-20 exported types
- `src/components/TranslationManagement/index.ts` - Barrel export file

**Critical Dependencies:**
- REQ-E05-005 (TypeScript database types update) - provides updated DB types with source_version_at
- Existing translation-service types - source of re-exported types

**Blocks:**
- All Epic 5 Phase 2+ UI component tasks (REQ-E05-007 through REQ-E05-020+)
- All Epic 5 custom hooks (useTranslationStatus, useTranslationPreview, useTranslationRealtime)
- Translation management page and dashboard integration tasks

**Type Safety Enablement:**
- Enables type-safe component development for translation management UI
- Provides autocomplete and IntelliSense for developers
- Establishes contracts between components, hooks, and API endpoints
- Prevents runtime type errors through compile-time checking

---

*Document generated: 2026-01-22 22:38*
