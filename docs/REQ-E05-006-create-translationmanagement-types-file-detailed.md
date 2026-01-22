# Create TranslationManagement Types File - Detailed Implementation Tasks

**Generated:** 2026-01-22 22:38
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

- [ ] **1.1** Create the TranslationManagement directory: `mkdir -p src/components/TranslationManagement`
- [ ] **1.2** Create the types file: `touch src/components/TranslationManagement/TranslationManagement.types.ts`
- [ ] **1.3** Create the index export file: `touch src/components/TranslationManagement/index.ts`
- [ ] **1.4** Verify files were created successfully: `ls -la src/components/TranslationManagement/`
- [ ] **1.5** Verify the directory structure matches the plan: should contain TranslationManagement.types.ts and index.ts

---

## 2. Write Module Header and Documentation

**Context:** Following the established pattern from src/components/ItemManager/ItemManager.types.ts (lines 1-11), add a comprehensive JSDoc module header that includes module description, metadata tags, and references to related documentation. This provides context for future developers and establishes documentation standards.

**Files to modify:**
- `src/components/TranslationManagement/TranslationManagement.types.ts`

**Estimated effort:** 1 story point

- [ ] **2.1** Open TranslationManagement.types.ts in your editor
- [ ] **2.2** Add the JSDoc module header comment block at the top of the file
- [ ] **2.3** Include `@module TranslationManagement/types` tag
- [ ] **2.4** Include `@see docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` reference
- [ ] **2.5** Include `@created 2026-01-22` tag
- [ ] **2.6** Include `@requestReference REQ-E05-006` tag
- [ ] **2.7** Add a multi-paragraph description explaining this file contains all TypeScript interfaces and types for the TranslationManagement component family, defining component props, state management, API responses, and data models for translation management features

---

## 3. Define Core Type Re-exports Section

**Context:** Following the pattern from ItemManager.types.ts which imports and re-exports types from related modules (line 13), create a re-export section that brings in commonly used types from existing translation service modules. Reference src/lib/translation-service/translation-service.types.ts (lines 22, 34, 51) for available types to re-export.

**Files to modify:**
- `src/components/TranslationManagement/TranslationManagement.types.ts`

**Estimated effort:** 1 story point

- [ ] **3.1** Add a section separator comment: `// =============================================================================` followed by `// Core Type Re-exports` followed by `// =============================================================================`
- [ ] **3.2** Add JSDoc comment explaining these are re-exported types from translation-service module for convenience
- [ ] **3.3** Add `export type { SupportedLanguage, TranslationStatus, TranslatableEntityType, TranslationContext } from '@/lib/translation-service/translation-service.types';`
- [ ] **3.4** Verify the import path `@/lib/translation-service/translation-service.types` is correct by checking the file exists
- [ ] **3.5** Run `npx tsc --noEmit` to verify the re-exports have no type errors

---

## 4. Define Display and Data Types

**Context:** Create the core data structures that will be passed between components for displaying translation data. These types define how translation information is structured for lists, tables, widgets, and detail views. Based on the Implementation Plan section "State Management" (lines 193-216), these types need to support per-language status, stale detection, and aggregate summaries.

**Files to modify:**
- `src/components/TranslationManagement/TranslationManagement.types.ts`

**Estimated effort:** 1 story point

- [ ] **4.1** Add section separator comment: `// =============================================================================` followed by `// Display Types` followed by `// =============================================================================`
- [ ] **4.2** Define `TranslationItemDisplay` interface with fields: entityId (string), entityType (TranslatableEntityType), entityName (string), sourceLanguage (SupportedLanguage), propertyId (optional string), propertyName (optional string), translations (LanguageTranslationSummary[]), overallStatus (union: 'complete' | 'partial' | 'pending' | 'failed' | 'stale'), sourceUpdatedAt (optional string), isStale (optional boolean)
- [ ] **4.3** Add JSDoc for TranslationItemDisplay: "Translation item data for display in lists and tables. Combines entity metadata with translation status across all languages."
- [ ] **4.4** Define `LanguageTranslationSummary` interface with fields: language (SupportedLanguage), status (TranslationStatus), translatedAt (optional string), isStale (optional boolean), canEdit (boolean), canRetranslate (boolean)
- [ ] **4.5** Add JSDoc for LanguageTranslationSummary: "Per-language translation status summary with action capabilities."
- [ ] **4.6** Define `TranslationSummary` interface with fields: total (number), complete (number), partial (number), pending (number), failed (number), stale (optional number)
- [ ] **4.7** Add JSDoc for TranslationSummary: "Aggregate translation statistics for dashboard widgets and summaries."
- [ ] **4.8** Define `TranslationFieldContent` interface with fields: title (optional string), description (optional string), name (optional string)
- [ ] **4.9** Add JSDoc for TranslationFieldContent: "Individual translatable field content. Fields vary by entity type (articles have title/description, items have name/description, links have title)."

---

## 5. Define Component Props Interfaces

**Context:** Define TypeScript interfaces for props of all TranslationManagement UI components. These establish the type contracts for component communication. Reference the Implementation Plan "Integration Contract" section (lines 323-415) for component prop specifications.

**Files to modify:**
- `src/components/TranslationManagement/TranslationManagement.types.ts`

**Estimated effort:** 1 story point

- [ ] **5.1** Add section separator: `// =============================================================================` followed by `// Component Props Interfaces` followed by `// =============================================================================`
- [ ] **5.2** Define `TranslationPreviewPanelProps` interface with fields: entityType ('article' | 'item' | 'link'), entityId (string), sourceLanguage (SupportedLanguage), sourceContent (TranslationFieldContent), isOpen (boolean), onClose (() => void), onTranslationEdited (optional function with language parameter)
- [ ] **5.3** Add comprehensive JSDoc for TranslationPreviewPanelProps describing it as "Props for TranslationPreviewPanel component. Slide-out panel showing translation status after content save."
- [ ] **5.4** Define `TranslationEditorProps` interface with fields: translation (object with language, content, status), sourceContent (TranslationFieldContent), sourceLanguage (SupportedLanguage), isOpen (boolean), onSave (async function returning Promise<void>), onCancel (() => void)
- [ ] **5.5** Add JSDoc for TranslationEditorProps: "Props for TranslationEditor component. Modal dialog for editing translations with side-by-side comparison."
- [ ] **5.6** Define `TranslationStatusWidgetProps` interface with fields: propertyId (optional string), compact (optional boolean), onViewAll (optional function), className (optional string)
- [ ] **5.7** Add JSDoc for TranslationStatusWidgetProps: "Props for TranslationStatusWidget component. Dashboard widget showing translation progress summary."
- [ ] **5.8** Define `TranslationStatusColumnProps` interface with fields: item (TranslationItemDisplay), onClick (optional function), compact (optional boolean)
- [ ] **5.9** Add JSDoc for TranslationStatusColumnProps: "Props for TranslationStatusColumn component. Compact status indicator for table columns showing language status dots."

---

## 6. Define Filter, Sort, and State Types

**Context:** Create types for filtering, sorting, and component state management to enable type-safe state handling in components and hooks. These types support the filter panel, sorting dropdown, and internal component state as described in the Implementation Plan "State Management" section (lines 193-216).

**Files to modify:**
- `src/components/TranslationManagement/TranslationManagement.types.ts`

**Estimated effort:** 1 story point

- [ ] **6.1** Add section separator: `// =============================================================================` followed by `// Filter, Sort, and State Types` followed by `// =============================================================================`
- [ ] **6.2** Define `TranslationFilterState` interface with optional fields: entityTypes (TranslatableEntityType[]), propertyIds (string[]), languages (SupportedLanguage[]), statuses (array of 'complete' | 'partial' | 'pending' | 'failed' | 'stale'), searchQuery (string), showStaleOnly (boolean)
- [ ] **6.3** Add JSDoc for TranslationFilterState: "Filter state for translation list views. All fields are optional for flexible filtering."
- [ ] **6.4** Define `TranslationSortOption` as union type: 'name-asc' | 'name-desc' | 'updated-desc' | 'updated-asc' | 'status-asc' | 'status-desc'
- [ ] **6.5** Add JSDoc for TranslationSortOption: "Sort options for translation lists."
- [ ] **6.6** Define `TranslationPreviewState` interface with fields: isOpen (boolean), entityType (TranslatableEntityType or null), entityId (string or null), sourceContent (TranslationFieldContent or null), sourceLanguage (SupportedLanguage), translations (Record<SupportedLanguage, object with status, content, translatedAt, isStale>), isLoading (boolean), error (string or null)
- [ ] **6.7** Add JSDoc for TranslationPreviewState: "State for TranslationPreviewPanel component. Manages panel visibility and translation data."
- [ ] **6.8** Define `TranslationEditorState` interface with fields: isOpen (boolean), isDirty (boolean), isSaving (boolean), error (string or null), editedContent (TranslationFieldContent)
- [ ] **6.9** Add JSDoc for TranslationEditorState: "State for TranslationEditor component. Tracks editing progress and validation."

---

## 7. Define API Request/Response Types

**Context:** Define TypeScript types that match the Epic 5 API endpoint contracts to ensure type safety when calling translation management APIs. Reference Implementation Plan "Integration Contract" sections (lines 250-320) for the exact API structures.

**Files to modify:**
- `src/components/TranslationManagement/TranslationManagement.types.ts`

**Estimated effort:** 1 story point

- [ ] **7.1** Add section separator: `// =============================================================================` followed by `// API Types` followed by `// =============================================================================`
- [ ] **7.2** Define `TranslationStatusApiResponse` interface with fields: items (TranslationItemDisplay[]), summary (TranslationSummary), pagination (optional object with page, pageSize, totalItems, totalPages)
- [ ] **7.3** Add JSDoc for TranslationStatusApiResponse: "Response from GET /api/translations/status endpoint."
- [ ] **7.4** Define `UpdateTranslationRequest` interface with optional fields: title (string), description (string), name (string)
- [ ] **7.5** Add JSDoc for UpdateTranslationRequest: "Request body for PUT /api/translations/[entityType]/[entityId]/[language] endpoint."
- [ ] **7.6** Define `UpdateTranslationResponse` interface with fields: success (boolean), translation (object with language, status, reviewedBy, updatedAt)
- [ ] **7.7** Add JSDoc for UpdateTranslationResponse: "Response from PUT /api/translations/[entityType]/[entityId]/[language] endpoint."
- [ ] **7.8** Define `RetranslateRequest` interface with fields: entities (array of objects with type and id), languages (optional SupportedLanguage[]), overwriteManual (optional boolean)
- [ ] **7.9** Add JSDoc for RetranslateRequest: "Request body for POST /api/translations/retranslate endpoint. Languages defaults to all if omitted."
- [ ] **7.10** Define `RetranslateResponse` interface with fields: success (boolean), jobsQueued (number), skipped (number), skippedReason (optional string)
- [ ] **7.11** Add JSDoc for RetranslateResponse: "Response from POST /api/translations/retranslate endpoint."

---

## 8. Define Hook Return Types

**Context:** Define return types for custom hooks in the TranslationManagement module to enable type-safe hook consumption in components. These hooks will be created in later tasks but need their types defined now for consistency.

**Files to modify:**
- `src/components/TranslationManagement/TranslationManagement.types.ts`

**Estimated effort:** 1 story point

- [ ] **8.1** Add section separator: `// =============================================================================` followed by `// Hook Return Types` followed by `// =============================================================================`
- [ ] **8.2** Define `UseTranslationStatusReturn` interface with fields: items (TranslationItemDisplay[]), summary (TranslationSummary), isLoading (boolean), error (Error or null), refetch (() => void), filters (TranslationFilterState), setFilters (function accepting Partial<TranslationFilterState>), sortBy (TranslationSortOption), setSortBy (function accepting TranslationSortOption)
- [ ] **8.3** Add JSDoc for UseTranslationStatusReturn: "Return type for useTranslationStatus hook. Provides translation data, loading state, and filter/sort controls."
- [ ] **8.4** Define `UseTranslationPreviewReturn` interface with fields: state (TranslationPreviewState), open (function with entityType, entityId, sourceLanguage, sourceContent parameters), close (() => void), editTranslation (function with language parameter), retranslate (function with language parameter), retranslateAll (() => Promise<void>)
- [ ] **8.5** Add JSDoc for UseTranslationPreviewReturn: "Return type for useTranslationPreview hook. Manages preview panel state and actions."
- [ ] **8.6** Define `UseTranslationRealtimeReturn` interface with fields: isConnected (boolean), lastUpdate (Date or null), subscribe (function with entityId, entityType parameters), unsubscribe (() => void)
- [ ] **8.7** Add JSDoc for UseTranslationRealtimeReturn: "Return type for useTranslationRealtime hook. Manages Supabase realtime subscriptions for translation updates."

---

## 9. Create Index Export File

**Context:** Create the module index file that exports all types, enabling clean imports like `import { TypeName } from '@/components/TranslationManagement'`. Follow the pattern from other component modules that use barrel exports.

**Files to modify:**
- `src/components/TranslationManagement/index.ts`

**Estimated effort:** 1 story point

- [ ] **9.1** Open src/components/TranslationManagement/index.ts in your editor
- [ ] **9.2** Add JSDoc comment: "TranslationManagement Module Exports"
- [ ] **9.3** Add a blank line after the comment
- [ ] **9.4** Add section comment: "// Export all types"
- [ ] **9.5** Add export statement: `export * from './TranslationManagement.types';`
- [ ] **9.6** Add blank line and comment block for future component exports with examples (commented out): `// Future: Export components` followed by example export lines for TranslationStatusWidget, TranslationPreviewPanel, etc. (all commented)
- [ ] **9.7** Save the file

---

## 10. Validate Types with TypeScript Compiler

**Context:** Run the TypeScript compiler in type-check mode to verify all types are valid, have no syntax errors, and the re-exports work correctly. This catches type errors before they affect downstream tasks.

**Files to modify:** None (validation step)

**Estimated effort:** 1 story point

- [ ] **10.1** Run `npx tsc --noEmit` from the project root directory
- [ ] **10.2** Review the output and search for any errors mentioning "TranslationManagement"
- [ ] **10.3** If errors exist related to re-exported types, verify the import paths in step 3 are correct
- [ ] **10.4** If errors exist in type definitions, check for typos, missing commas, incorrect property types, or syntax errors
- [ ] **10.5** Fix any identified errors by correcting the type definitions in TranslationManagement.types.ts
- [ ] **10.6** Re-run `npx tsc --noEmit` after each fix until no TranslationManagement-related errors remain
- [ ] **10.7** Document any pre-existing TypeScript errors unrelated to TranslationManagement (these are acceptable per project CLAUDE.md)

---

## 11. Verify IDE Type Support and Autocomplete

**Context:** Verify that IDE autocomplete and IntelliSense correctly recognize the newly defined types and re-exports. This ensures developers will have proper IDE support when using these types in future Epic 5 tasks.

**Files to modify:** None (verification step)

**Estimated effort:** 1 story point

- [ ] **11.1** Open src/components/TranslationManagement/TranslationManagement.types.ts in your IDE
- [ ] **11.2** Hover over the `TranslationItemDisplay` interface name - verify tooltip shows the JSDoc comment and interface definition
- [ ] **11.3** Hover over re-exported types like `SupportedLanguage` - verify tooltip shows type definition from the source module
- [ ] **11.4** Create a test import in a temporary file: `import { TranslationItemDisplay, SupportedLanguage } from '@/components/TranslationManagement';`
- [ ] **11.5** Type `const test: TranslationItemDisplay = {` and verify autocomplete shows all required fields (entityId, entityType, entityName, etc.)
- [ ] **11.6** Type `const lang: SupportedLanguage = ` and verify autocomplete shows the language options ('en', 'fr', 'es', 'de', 'nl', 'it')
- [ ] **11.7** Verify that JSDoc comments appear in tooltips when hovering over interface names and properties
- [ ] **11.8** Delete the test import (it was only for verification)

---

## 12. Document Type Structure in Comments

**Context:** Add inline documentation within the types file explaining the organization strategy and relationships between type groups. This helps future developers understand the structure and find types quickly.

**Files to modify:**
- `src/components/TranslationManagement/TranslationManagement.types.ts`

**Estimated effort:** 1 story point

- [ ] **12.1** At the end of the Core Type Re-exports section, add a comment explaining these are convenience imports from upstream modules
- [ ] **12.2** At the top of the Display Types section, add a comment explaining these types define data structures for UI rendering
- [ ] **12.3** At the top of the Component Props section, add a comment explaining these define interface contracts for React components
- [ ] **12.4** At the top of the Filter, Sort, and State section, add a comment explaining these support UI interactions and component state
- [ ] **12.5** At the top of the API Types section, add a comment explaining these match API endpoint request/response structures
- [ ] **12.6** At the top of the Hook Return Types section, add a comment explaining these define custom hook interfaces for consumers
- [ ] **12.7** Review all section comments for clarity and consistency

---

## 13. Verify Type Exports are Accessible

**Context:** Create a simple test to verify that all exported types can be imported correctly by downstream consumers. This ensures the barrel export pattern in index.ts works properly.

**Files to modify:** None (verification step using temporary test)

**Estimated effort:** 1 story point

- [ ] **13.1** Create a temporary test file: `touch /tmp/translation-types-test.ts`
- [ ] **13.2** In the test file, add imports for several key types: `import { TranslationItemDisplay, TranslationStatusWidgetProps, UseTranslationStatusReturn, SupportedLanguage, TranslationStatus } from '@/components/TranslationManagement';`
- [ ] **13.3** Add a test variable: `const testItem: TranslationItemDisplay = {} as TranslationItemDisplay;`
- [ ] **13.4** Run `npx tsc --noEmit /tmp/translation-types-test.ts` to verify imports work
- [ ] **13.5** If errors occur, check that index.ts properly exports from TranslationManagement.types.ts
- [ ] **13.6** Verify autocomplete works when typing the import statement (if testing in IDE)
- [ ] **13.7** Delete the test file: `rm /tmp/translation-types-test.ts`

---

## 14. Final Review and Documentation Check

**Context:** Perform a final review of the types file to ensure all types have proper JSDoc documentation, follow consistent naming conventions, and match the specifications from the overview document and implementation plan.

**Files to modify:** None (review step)

**Estimated effort:** 1 story point

- [ ] **14.1** Open TranslationManagement.types.ts and review the module header - verify it includes all required tags (@module, @see, @created, @requestReference)
- [ ] **14.2** Review each interface and type definition - verify every export has a JSDoc comment
- [ ] **14.3** Check that complex types include usage examples in JSDoc where helpful
- [ ] **14.4** Verify naming conventions are consistent (PascalCase for interfaces and types, camelCase for properties)
- [ ] **14.5** Verify all section separators use the same format (triple equals lines with centered section names)
- [ ] **14.6** Check that optional fields use the `?` syntax consistently
- [ ] **14.7** Verify that union types use consistent formatting (single quotes for string literals, proper spacing)
- [ ] **14.8** Count the total number of exported types - should be approximately 15-20 types based on the overview document

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
