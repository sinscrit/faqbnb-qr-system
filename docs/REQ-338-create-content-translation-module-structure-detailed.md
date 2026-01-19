# REQ-338: Create Content Translation Module Structure - Detailed Task Breakdown

**Generated:** 2026-01-19 14:30:00 UTC
**Last Modified:** 2026-01-19 14:30:00 UTC

## Document References
- **Overview Document:** docs/REQ-338-create-content-translation-module-structure-overview.md
- **Requirements Source:** docs/gen_requests_epic3.md (Request #338)
- **Implementation Plan:** docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md

## Request Context
- **Request ID:** REQ-338
- **Phase:** 1 - Content Translation Infrastructure
- **Task ID:** 1.1
- **Title:** Create Content Translation Module Structure and Type Definitions
- **Type:** New Feature (Foundation Setup)
- **Size:** S (Small)
- **Dependencies:** None - can start immediately
- **Blocks:** Tasks 1.2, 1.3, 1.4, 1.5, 1.6 (all subsequent Epic 3 Phase 1 tasks)

---

## Summary

Create the foundational module structure and comprehensive TypeScript type definitions for the content translation system. This task establishes the `/src/lib/content-translation/` directory structure, creates all TypeScript interfaces for content translation operations, and sets up barrel exports for clean module imports. This is the foundation upon which all Epic 3 content translation features are built.

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Epic 1 translation-service module exists at `/src/lib/translation-service/`
- [ ] Epic 1 job-queue module exists at `/src/lib/job-queue/`
- [ ] TypeScript compilation passes: `npm run build`
- [ ] Translation-service types are accessible: `SupportedLanguage`, `TranslationContext`, `TranslationStatus`
- [ ] Job-queue types are accessible: `EntityType`, `JobStatus`, `TranslationJob`

---

## Detailed Tasks

### Task 1: Create Directory Structure
**Estimated Effort:** 5 minutes
**Priority:** Required

Create the content-translation module directory hierarchy.

#### Actions:
1. Create main module directory: `/src/lib/content-translation/`
2. Create triggers subdirectory: `/src/lib/content-translation/triggers/`
3. Create processors subdirectory: `/src/lib/content-translation/processors/`
4. Create storage subdirectory: `/src/lib/content-translation/storage/`

#### Verification:
```bash
# Verify directories exist
ls -la src/lib/content-translation/
ls -la src/lib/content-translation/triggers/
ls -la src/lib/content-translation/processors/
ls -la src/lib/content-translation/storage/
```

#### Success Criteria:
- [ ] `/src/lib/content-translation/` directory exists
- [ ] `/src/lib/content-translation/triggers/` directory exists
- [ ] `/src/lib/content-translation/processors/` directory exists
- [ ] `/src/lib/content-translation/storage/` directory exists

---

### Task 2: Create Type Definitions File
**Estimated Effort:** 30 minutes
**Priority:** Required

Create comprehensive TypeScript type definitions for content translation operations.

#### File: `/src/lib/content-translation/content-translation.types.ts`

#### Required Imports:
```typescript
import type { SupportedLanguage, TranslationContext, TranslationStatus } from '@/lib/translation-service';
import type { EntityType, JobStatus } from '@/lib/job-queue';
```

#### Type Definitions to Implement:

##### Section 1: Core Content Types
1. **`TranslationTrigger`** - Literal union type
   - Values: `'create' | 'update'`
   - Purpose: Determines priority - 'create' gets higher priority than 'update'

2. **`OverallTranslationStatus`** - Literal union type
   - Values: `'complete' | 'partial' | 'pending' | 'failed'`
   - Purpose: Summary status for entity translation coverage

3. **`ContentToTranslate`** - Interface
   - Properties:
     - `entityType: EntityType` - Type of entity being translated
     - `entityId: string` - Unique identifier for the entity
     - `sourceLanguage: SupportedLanguage` - Source language of the content
     - `fields: TranslatableField[]` - Fields to translate with their values and context
   - Purpose: Structure for content requiring translation

4. **`TranslatableField`** - Interface
   - Properties:
     - `fieldName: string` - Field name matching the translation table column
     - `value: string` - Current value to translate
     - `context: TranslationContext` - Context for AI provider to improve translation quality
     - `maxLength?: number` - Optional maximum character length for the translation
   - Purpose: Individual field that can be translated

##### Section 2: Queue Operation Types
5. **`QueueTranslationOptions`** - Interface
   - Properties:
     - `content: ContentToTranslate` - Content to translate with all field data
     - `trigger: TranslationTrigger` - Trigger type affects job priority
     - `excludeLanguages?: SupportedLanguage[]` - Languages to skip (e.g., if already translated)
     - `priority?: number` - Custom priority override (higher = more urgent)
   - Purpose: Options for queueing content translations

6. **`QueueTranslationResult`** - Interface
   - Properties:
     - `success: boolean` - Whether the queue operation succeeded
     - `jobIds: string[]` - IDs of created translation jobs
     - `queuedLanguages: SupportedLanguage[]` - Languages that were queued for translation
     - `error?: string` - Error message if operation failed
   - Purpose: Result of a queue operation

##### Section 3: Status Tracking Types
7. **`LanguageTranslationStatus`** - Interface
   - Properties:
     - `status: 'pending' | 'completed' | 'failed' | 'manual'` - Current status of this language translation
     - `translatedAt?: string` - When the translation was completed (ISO 8601)
     - `reviewedBy?: string` - User ID who reviewed/provided manual translation
     - `error?: string` - Error message if translation failed
   - Purpose: Status for a single language translation

8. **`TranslationStatusResult`** - Interface
   - Properties:
     - `entityId: string` - Entity identifier
     - `entityType: EntityType` - Entity type
     - `sourceLanguage: SupportedLanguage` - Source language of original content
     - `overallStatus: OverallTranslationStatus` - Overall status summary
     - `translations: Record<SupportedLanguage, LanguageTranslationStatus>` - Translation status for each language
     - `completedLanguages: SupportedLanguage[]` - Languages with completed translations
     - `pendingLanguages: SupportedLanguage[]` - Languages with pending jobs
     - `failedLanguages: SupportedLanguage[]` - Languages with failed translations
     - `missingLanguages: SupportedLanguage[]` - Languages with no translation activity
   - Purpose: Complete translation status for an entity

9. **`BatchTranslationStatusResult`** - Interface
   - Properties:
     - `results: TranslationStatusResult[]` - Array of status results
   - Purpose: For batch status queries

##### Section 4: Entity-Specific Field Types
10. **`ItemTranslatableFields`** - Interface
    - Properties:
      - `name: string` - Item display name
      - `description: string` - Item description (can be empty string)
    - Purpose: Translatable fields for items, maps to item_translations table columns

11. **`ArticleTranslatableFields`** - Interface
    - Properties:
      - `title: string` - Article title
      - `description: string` - Article description/content (optional)
    - Purpose: Translatable fields for articles, maps to article_translations table columns

12. **`LinkTranslatableFields`** - Interface
    - Properties:
      - `title: string` - Link display title
    - Purpose: Translatable fields for links, maps to link_translations table columns. Note: URL is NOT translated.

13. **`TagTranslatableFields`** - Interface
    - Properties:
      - `value: string` - Tag display value
    - Purpose: Translatable fields for tags, maps to tag_translations table columns

##### Section 5: Storage Data Types
14. **`StoreItemTranslationData`** - Interface
    - Properties:
      - `itemId: string` - Item identifier
      - `language: SupportedLanguage` - Target language code
      - `name: string` - Translated name
      - `description: string | null` - Translated description
    - Purpose: Data for storing an item translation

15. **`StoreArticleTranslationData`** - Interface
    - Properties:
      - `articleId: string` - Article identifier
      - `language: SupportedLanguage` - Target language code
      - `title: string` - Translated title
      - `description: string | null` - Translated description
    - Purpose: Data for storing an article translation

16. **`StoreLinkTranslationData`** - Interface
    - Properties:
      - `linkId: string` - Link identifier
      - `language: SupportedLanguage` - Target language code
      - `title: string` - Translated title
    - Purpose: Data for storing a link translation

17. **`StoreTagTranslationData`** - Interface
    - Properties:
      - `tagKey: string` - Tag key
      - `language: SupportedLanguage` - Target language code
      - `value: string` - Translated value
      - `isSystemTag: boolean` - Whether this is a system tag (false for user-created)
    - Purpose: Data for storing a tag translation

#### Documentation Requirements:
- Use JSDoc comments for all interfaces and properties
- Include purpose/usage examples where helpful
- Use section dividers matching translation-service.types.ts pattern (`// ============================================================================`)

#### Verification:
```bash
# TypeScript compilation check
npx tsc --noEmit
```

#### Success Criteria:
- [ ] File created at `/src/lib/content-translation/content-translation.types.ts`
- [ ] All 17 type definitions implemented with correct properties
- [ ] JSDoc comments present for all interfaces
- [ ] Import statements correctly reference translation-service and job-queue types
- [ ] No TypeScript compilation errors

---

### Task 3: Create Barrel Export File
**Estimated Effort:** 15 minutes
**Priority:** Required

Create the module index file with clean exports and re-exports from dependent modules.

#### File: `/src/lib/content-translation/index.ts`

#### Structure:
```typescript
/**
 * Content Translation Module
 * Part of REQ-338: Content Translation Module Structure
 *
 * This module provides content translation capabilities for dynamic
 * user-generated content (items, articles, links, tags) in FAQBNB.
 *
 * @module content-translation
 * @created 2026-01-19
 *
 * @example
 * ```typescript
 * import {
 *   ContentToTranslate,
 *   QueueTranslationOptions,
 *   TranslationStatusResult,
 * } from '@/lib/content-translation';
 * ```
 */

// ============================================================================
// Type Exports (Content Translation Types)
// ============================================================================

export type {
  // Core content types
  TranslationTrigger,
  OverallTranslationStatus,
  ContentToTranslate,
  TranslatableField,

  // Queue operation types
  QueueTranslationOptions,
  QueueTranslationResult,

  // Status tracking types
  LanguageTranslationStatus,
  TranslationStatusResult,
  BatchTranslationStatusResult,

  // Entity-specific field types
  ItemTranslatableFields,
  ArticleTranslatableFields,
  LinkTranslatableFields,
  TagTranslatableFields,

  // Storage data types
  StoreItemTranslationData,
  StoreArticleTranslationData,
  StoreLinkTranslationData,
  StoreTagTranslationData,
} from './content-translation.types';

// ============================================================================
// Re-exported Types from Translation Service
// ============================================================================

export type {
  SupportedLanguage,
  TranslationContext,
  TranslationStatus,
} from '@/lib/translation-service';

// ============================================================================
// Re-exported Types from Job Queue
// ============================================================================

export type {
  EntityType,
  JobStatus,
} from '@/lib/job-queue';

// ============================================================================
// Function Exports (Future - Tasks 1.2-1.6)
// ============================================================================

// Task 1.2: Content translation orchestrator
// export { queueContentTranslations } from './content-translation';

// Task 1.3: Entity-specific translation triggers
// export { triggerItemTranslation } from './triggers/item-trigger';
// export { triggerArticleTranslation } from './triggers/article-trigger';
// export { triggerLinkTranslation } from './triggers/link-trigger';

// Task 1.4: Tag translation trigger
// export { triggerTagTranslation } from './triggers/tag-trigger';

// Task 1.5: Translation storage utilities
// export {
//   storeItemTranslation,
//   storeArticleTranslation,
//   storeLinkTranslation,
//   storeTagTranslation,
// } from './storage/translation-storage';

// Task 1.6: Translation status utilities
// export {
//   getEntityTranslationStatus,
//   getBatchTranslationStatus,
// } from './storage/translation-status';
```

#### Verification:
```bash
# TypeScript compilation check
npx tsc --noEmit

# Test import resolution (create temp file and check)
echo "import { ContentToTranslate, SupportedLanguage } from '@/lib/content-translation';" > /tmp/test-import.ts
```

#### Success Criteria:
- [ ] File created at `/src/lib/content-translation/index.ts`
- [ ] All public types exported from content-translation.types.ts
- [ ] SupportedLanguage, TranslationContext, TranslationStatus re-exported from translation-service
- [ ] EntityType, JobStatus re-exported from job-queue
- [ ] Placeholder comments for future function exports
- [ ] Module-level JSDoc documentation present
- [ ] No TypeScript compilation errors

---

### Task 4: Verification and Compilation Check
**Estimated Effort:** 10 minutes
**Priority:** Required

Verify the module compiles correctly and integrates with existing codebase.

#### Actions:

1. **Run TypeScript compilation:**
   ```bash
   npm run build
   ```

2. **Check for unused exports (optional):**
   ```bash
   npx tsc --noEmit --noUnusedLocals
   ```

3. **Verify import resolution works:**
   Create a test file to verify imports work correctly:
   ```typescript
   // Test file: src/lib/content-translation/__tests__/types.test.ts
   import {
     ContentToTranslate,
     QueueTranslationOptions,
     TranslationStatusResult,
     SupportedLanguage,
     EntityType,
   } from '../index';

   describe('Content Translation Types', () => {
     it('should compile without errors', () => {
       // Type-only test - if this file compiles, types are correct
       const content: ContentToTranslate = {
         entityType: 'item',
         entityId: 'test-id',
         sourceLanguage: 'en',
         fields: [],
       };
       expect(content).toBeDefined();
     });
   });
   ```

4. **Run type tests:**
   ```bash
   npm run test -- --testPathPattern="content-translation.*types"
   ```

#### Success Criteria:
- [ ] `npm run build` completes without TypeScript errors
- [ ] No unused export warnings
- [ ] No type conflicts with existing codebase
- [ ] Import `@/lib/content-translation` resolves correctly
- [ ] Named imports work: `import { QueueTranslationOptions } from '@/lib/content-translation'`

---

## Complete Success Validation Checklist

### Directory Structure
- [ ] `/src/lib/content-translation/` directory exists
- [ ] `/src/lib/content-translation/triggers/` directory exists
- [ ] `/src/lib/content-translation/processors/` directory exists
- [ ] `/src/lib/content-translation/storage/` directory exists

### Type Definitions File (`content-translation.types.ts`)
- [ ] File exists at correct location
- [ ] `TranslationTrigger` type is defined ('create' | 'update')
- [ ] `OverallTranslationStatus` type is defined ('complete' | 'partial' | 'pending' | 'failed')
- [ ] `ContentToTranslate` interface is complete with all properties
- [ ] `TranslatableField` interface is complete with all properties
- [ ] `QueueTranslationOptions` interface is complete with all properties
- [ ] `QueueTranslationResult` interface is complete with all properties
- [ ] `LanguageTranslationStatus` interface is complete with all properties
- [ ] `TranslationStatusResult` interface is complete with all properties
- [ ] `BatchTranslationStatusResult` interface is defined
- [ ] `ItemTranslatableFields` interface is defined
- [ ] `ArticleTranslatableFields` interface is defined
- [ ] `LinkTranslatableFields` interface is defined
- [ ] `TagTranslatableFields` interface is defined
- [ ] `StoreItemTranslationData` interface is defined
- [ ] `StoreArticleTranslationData` interface is defined
- [ ] `StoreLinkTranslationData` interface is defined
- [ ] `StoreTagTranslationData` interface is defined
- [ ] Imports from translation-service work correctly
- [ ] Imports from job-queue work correctly
- [ ] JSDoc comments present for all interfaces

### Barrel Export File (`index.ts`)
- [ ] File exists at correct location
- [ ] All content-translation types exported
- [ ] SupportedLanguage re-exported from translation-service
- [ ] TranslationContext re-exported from translation-service
- [ ] TranslationStatus re-exported from translation-service
- [ ] EntityType re-exported from job-queue
- [ ] JobStatus re-exported from job-queue
- [ ] Module-level JSDoc documentation present

### Compilation
- [ ] `npm run build` completes without errors
- [ ] No TypeScript warnings related to this module
- [ ] Import path `@/lib/content-translation` resolves correctly

---

## Implementation Notes

### Pattern Alignment
Follow these established patterns from existing modules:

1. **File Organization:** Mirror `/src/lib/translation-service/` structure
2. **Type Documentation:** Use JSDoc comments like in `translation-service.types.ts`
3. **Section Dividers:** Use `// ============================================================================` pattern
4. **Export Style:** Use `export type { ... } from './file'` for type-only exports
5. **Re-exports:** Group re-exports from dependent modules in clearly labeled sections

### Type Reuse Strategy
- **DO Import:** `SupportedLanguage`, `TranslationContext`, `TranslationStatus` from translation-service
- **DO Import:** `EntityType`, `JobStatus` from job-queue
- **DO NOT Duplicate:** Any types that exist in dependent modules
- **DO Create New:** All content-specific orchestration types unique to Epic 3

### Future Integration Points
- Types will be consumed by content translation orchestrator (Task 1.2)
- `QueueTranslationOptions` will be used by API route handlers
- `TranslationStatusResult` will be used by status API endpoints
- Entity-specific field interfaces ensure type safety in trigger functions
- Storage data interfaces ensure type safety in UPSERT operations

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Type conflicts with existing modules | Low | Medium | Import and re-export rather than duplicate |
| Missing required type properties | Low | High | Follow implementation plan specifications exactly |
| Import path issues | Low | Low | Use standard @/lib alias pattern |

**Overall Risk Level:** Very Low

**Rationale:**
- Purely additive changes (no modifications to existing code)
- Type-only files have no runtime impact
- Standard directory creation operations
- Mirror of proven translation-service pattern
- All types derived from the reviewed implementation plan

---

## Dependencies

### External Dependencies
- TypeScript 5.x (existing in project)
- No new npm packages required

### Internal Dependencies
- `/src/lib/translation-service/` - Types to import
- `/src/lib/job-queue/` - Types to import

### Downstream Dependents
- Task 1.2: Content Translation Orchestrator - requires all types
- Task 1.3: Entity-Specific Triggers - requires entity field types
- Task 1.4: Tag Translation Trigger - requires tag types
- Task 1.5: Translation Storage Utilities - requires storage data types
- Task 1.6: Translation Status Utilities - requires status result types

---

## Acceptance Criteria Mapping

| PRD/Implementation Plan Criteria | Task |
|----------------------------------|------|
| Module index file exports all public-facing translation types | Task 3 |
| Type definitions include interfaces for translatable content entities | Task 2 (ItemTranslatableFields, etc.) |
| Type definitions specify translation metadata | Task 2 (TranslationStatusResult) |
| Type definitions support batch translation operations | Task 2 (BatchTranslationStatusResult) |
| Type definitions include error handling structures | Task 2 (QueueTranslationResult.error) |
| All types properly exported and importable | Task 3, Task 4 |
| Type definitions align with database schema | Task 2 (Storage types match table columns) |

---

*Document generated for FAQBNB Localization Epic 3 - Phase 1, Task 1.1*
*Last Modified: 2026-01-19 14:30:00 UTC*
