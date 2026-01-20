# REQ-E03-001: Create Content Translation Module Structure - Detailed Task Breakdown
*Generated: 2026-01-19 15:30:00 UTC*
*Last Modified: 2026-01-20 14:05:00 UTC*

## Reference
- **Request**: REQ-E03-001 (Create Content Translation Module Structure)
- **Overview Document**: docs/REQ-E03-001-create-content-translation-module-structure-overview.md
- **Source**: docs/gen_requests_epic3.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md
- **Type**: New Feature (Foundation Setup)
- **Epic**: 3 - Dynamic Content Translation
- **Phase**: 1 - Content Translation Infrastructure
- **Task ID**: 1.1
- **Size**: S

---

## Task Breakdown

### Task 1.1.1: Create Directory Structure
**Story Points**: 0.5
**Dependencies**: None

Create the base directory structure for the content-translation module following the established pattern from `/src/lib/translation-service/`.

**Actions**:
1. Create directory `/src/lib/content-translation/`
2. Create subdirectory `/src/lib/content-translation/triggers/`
3. Create subdirectory `/src/lib/content-translation/storage/`

**Commands**:
```bash
mkdir -p src/lib/content-translation/triggers
mkdir -p src/lib/content-translation/storage
```

**Verification**:
- [x] Directory `/src/lib/content-translation/` exists
- [x] Directory `/src/lib/content-translation/triggers/` exists
- [x] Directory `/src/lib/content-translation/storage/` exists

---

### Task 1.1.2: Create TypeScript Types File - Core Types
**Story Points**: 1
**Dependencies**: Task 1.1.1

Create the types file with core type definitions and entity types. Follow the pattern established in `/src/lib/translation-service/translation-service.types.ts`.

**File**: `/src/lib/content-translation/content-translation.types.ts`

**Actions**:
1. Create file with module header and JSDoc documentation
2. Add import statement for types from translation-service
3. Define `EntityType` type alias (note: this is a local alias for content-translation specific usage)
4. Define `TranslationTrigger` type

**Code to implement**:
```typescript
/**
 * Content Translation Module Type Definitions
 * Part of REQ-E03-001: Create Content Translation Module Structure
 *
 * This module defines TypeScript interfaces and types for content translation
 * operations, including translation triggers, queuing, and status tracking.
 *
 * @module content-translation/types
 * @created 2026-01-19
 */

// ============================================================================
// Imports from Epic 1 Infrastructure
// ============================================================================

import type { SupportedLanguage, TranslationContext } from '@/lib/translation-service';

// ============================================================================
// Core Entity Types
// ============================================================================

/**
 * Entity types that support content translation.
 * Maps to the *_translations database tables.
 *
 * - item: Items with name and description fields
 * - article: Articles with title and description fields
 * - link: Links with title field only (URLs are not translated)
 * - tag: Tags with a single translatable value
 */
export type EntityType = 'item' | 'article' | 'link' | 'tag';

/**
 * What triggered the translation request.
 * Affects job priority in the queue.
 *
 * - create: Content was newly created (higher priority)
 * - update: Existing content was modified (standard priority)
 */
export type TranslationTrigger = 'create' | 'update';
```

**Verification**:
- [x] File created at correct location
- [x] Import statement compiles without error
- [x] `EntityType` type is exported
- [x] `TranslationTrigger` type is exported
- [x] JSDoc comments match existing codebase style

---

### Task 1.1.3: Create TypeScript Types File - Content Interfaces
**Story Points**: 1
**Dependencies**: Task 1.1.2

Add the `ContentToTranslate` and `TranslatableField` interfaces for defining translatable content.

**File**: `/src/lib/content-translation/content-translation.types.ts` (append)

**Code to append**:
```typescript
// ============================================================================
// Content Definition Interfaces
// ============================================================================

/**
 * Individual field that needs translation.
 * Represents a single translatable text field with its context.
 */
export interface TranslatableField {
  /**
   * Name of the field in the database.
   * Examples: 'name', 'description', 'title'
   */
  fieldName: string;

  /**
   * Current value to translate.
   * Must be non-empty string for translation to proceed.
   */
  value: string;

  /**
   * Context information for better translation quality.
   * Uses TranslationContext from Epic 1 translation-service.
   */
  context: TranslationContext;

  /**
   * Maximum character length for translated text.
   * AI will attempt to keep translations within this limit.
   * Optional - omit if no length restriction.
   */
  maxLength?: number;
}

/**
 * Content to be translated, with all necessary fields and context.
 * This is the primary input structure for the translation orchestrator.
 */
export interface ContentToTranslate {
  /**
   * Type of entity being translated.
   * Determines which database table stores the translation.
   */
  entityType: EntityType;

  /**
   * UUID of the entity to translate.
   * Used to link translations back to the source entity.
   */
  entityId: string;

  /**
   * Source language of the original content.
   * Translation will be performed FROM this language TO target languages.
   */
  sourceLanguage: SupportedLanguage;

  /**
   * Array of fields to translate.
   * Each field includes its value and translation context.
   */
  fields: TranslatableField[];
}
```

**Verification**:
- [x] `TranslatableField` interface compiles correctly
- [x] `ContentToTranslate` interface compiles correctly
- [x] Types reference `SupportedLanguage` from translation-service
- [x] Types reference `TranslationContext` from translation-service
- [x] All properties have JSDoc comments

---

### Task 1.1.4: Create TypeScript Types File - Queue Interfaces
**Story Points**: 1
**Dependencies**: Task 1.1.3

Add the `QueueTranslationOptions` and `QueueTranslationResult` interfaces for the queuing system.

**File**: `/src/lib/content-translation/content-translation.types.ts` (append)

**Code to append**:
```typescript
// ============================================================================
// Queue Operation Interfaces
// ============================================================================

/**
 * Options for queuing content translations.
 * Input for the queueContentTranslations function (Task 1.2).
 */
export interface QueueTranslationOptions {
  /**
   * Content to translate with all fields and context.
   */
  content: ContentToTranslate;

  /**
   * What triggered this translation request.
   * Affects job priority: 'create' = higher priority.
   */
  trigger: TranslationTrigger;

  /**
   * Languages to skip when queuing translations.
   * Useful if certain languages already have translations.
   * Optional - defaults to translating to all other supported languages.
   */
  excludeLanguages?: SupportedLanguage[];

  /**
   * Custom priority override for the translation jobs.
   * Higher numbers = more urgent processing.
   * Optional - defaults to priority based on trigger type.
   * Default priorities: create = 100, update = 50
   */
  priority?: number;
}

/**
 * Result of queuing translation jobs.
 * Returned by queueContentTranslations function.
 */
export interface QueueTranslationResult {
  /**
   * Whether the queuing operation succeeded.
   * true if at least one job was queued successfully.
   */
  success: boolean;

  /**
   * UUIDs of created translation jobs.
   * Can be used to track job progress.
   */
  jobIds: string[];

  /**
   * Languages that were successfully queued for translation.
   * Excludes source language and any excluded languages.
   */
  queuedLanguages: SupportedLanguage[];

  /**
   * Error message if the operation failed.
   * Present when success is false.
   */
  error?: string;
}
```

**Verification**:
- [x] `QueueTranslationOptions` interface compiles correctly
- [x] `QueueTranslationResult` interface compiles correctly
- [x] `excludeLanguages` property uses `SupportedLanguage[]` type
- [x] `queuedLanguages` property uses `SupportedLanguage[]` type
- [x] All properties have JSDoc comments

---

### Task 1.1.5: Create TypeScript Types File - Status Interfaces
**Story Points**: 1
**Dependencies**: Task 1.1.4

Add the status tracking interfaces: `LanguageTranslationStatus`, `TranslationStatusResult`, and `EntityTranslationStatus`.

**File**: `/src/lib/content-translation/content-translation.types.ts` (append)

**Code to append**:
```typescript
// ============================================================================
// Translation Status Interfaces
// ============================================================================

/**
 * Translation status for a specific language.
 * Tracks the state of a single language translation for an entity.
 */
export interface LanguageTranslationStatus {
  /**
   * Current status of the translation.
   * - pending: Translation queued but not yet processed
   * - completed: Translation finished successfully (auto-generated)
   * - failed: Translation failed after all retry attempts
   * - manual: Translation was manually edited by a user
   */
  status: 'pending' | 'completed' | 'failed' | 'manual';

  /**
   * ISO 8601 timestamp when translation was completed.
   * Present for 'completed' and 'manual' statuses.
   */
  translatedAt?: string;

  /**
   * UUID of user who reviewed/edited the translation.
   * Present only for 'manual' status.
   */
  reviewedBy?: string;

  /**
   * Error message if translation failed.
   * Present only for 'failed' status.
   */
  error?: string;
}

/**
 * Complete translation status for an entity.
 * Used by status API endpoints (Task 4.1).
 */
export interface TranslationStatusResult {
  /**
   * UUID of the entity.
   */
  entityId: string;

  /**
   * Type of entity (item, article, link, tag).
   */
  entityType: EntityType;

  /**
   * Source language of the original content.
   */
  sourceLanguage: SupportedLanguage;

  /**
   * Overall status across all target languages.
   * - complete: All translations are completed or manual
   * - partial: Some translations completed, some pending or failed
   * - pending: All translations are pending
   * - failed: All translations have failed
   */
  overallStatus: 'complete' | 'partial' | 'pending' | 'failed';

  /**
   * Per-language translation status.
   * Keys are language codes, values are status details.
   */
  translations: Record<SupportedLanguage, LanguageTranslationStatus>;
}

/**
 * Extended status for UI display.
 * Includes convenience arrays for filtering and display.
 * Used by frontend components in Epic 5.
 */
export interface EntityTranslationStatus {
  /**
   * UUID of the entity.
   */
  entityId: string;

  /**
   * Type of entity.
   */
  entityType: EntityType;

  /**
   * Source language of original content.
   */
  sourceLanguage: SupportedLanguage;

  /**
   * Overall status summary.
   */
  overallStatus: 'complete' | 'partial' | 'pending' | 'failed';

  /**
   * Per-language translation status.
   * Uses string keys for JSON serialization compatibility.
   */
  translations: {
    [language: string]: {
      status: 'pending' | 'completed' | 'failed' | 'manual';
      translatedAt?: string;
      reviewedBy?: string;
    }
  };

  /**
   * Language codes that are still pending translation.
   * Convenience array for UI filtering.
   */
  pendingLanguages: string[];

  /**
   * Language codes with completed translations.
   * Convenience array for UI display.
   */
  completedLanguages: string[];

  /**
   * Language codes with failed translations.
   * Convenience array for retry functionality.
   */
  failedLanguages: string[];
}
```

**Verification**:
- [x] `LanguageTranslationStatus` interface compiles correctly
- [x] `TranslationStatusResult` interface compiles correctly
- [x] `EntityTranslationStatus` interface compiles correctly
- [x] `translations` property uses `Record<SupportedLanguage, ...>` type
- [x] All convenience arrays use `string[]` type for JSON compatibility
- [x] All properties have JSDoc comments

---

### Task 1.1.6: Create TypeScript Types File - Translation Context Constants
**Story Points**: 0.5
**Dependencies**: Task 1.1.5

Add the `TRANSLATION_CONTEXTS` constant with pre-defined context templates for optimal translation quality.

**File**: `/src/lib/content-translation/content-translation.types.ts` (append)

**Code to append**:
```typescript
// ============================================================================
// Translation Context Templates
// ============================================================================

/**
 * Pre-defined translation contexts for optimal translation quality.
 * Use these when triggering translations for specific content types.
 *
 * These contexts provide domain-specific guidance to the AI translation
 * provider, resulting in more accurate and natural translations.
 *
 * @see Plan-111-L10N-Epic3-Dynamic-Content-Translation.md Appendix A
 */
export const TRANSLATION_CONTEXTS = {
  /**
   * Context for item name translations.
   * Items are household appliances/objects in vacation rentals.
   */
  item_name: {
    contentType: 'item_name' as const,
    domainContext: 'property_rental_appliances',
    tone: 'concise' as const,
  },

  /**
   * Context for item description translations.
   * Descriptions explain how to use/find items.
   */
  item_description: {
    contentType: 'item_description' as const,
    domainContext: 'property_rental_appliances',
    tone: 'friendly' as const,
  },

  /**
   * Context for article title translations.
   * Article titles are instruction headers.
   */
  article_title: {
    contentType: 'article_title' as const,
    domainContext: 'property_rental_instructions',
    tone: 'concise' as const,
  },

  /**
   * Context for article description translations.
   * Article descriptions contain instruction content.
   */
  article_description: {
    contentType: 'article_description' as const,
    domainContext: 'property_rental_instructions',
    tone: 'friendly' as const,
  },

  /**
   * Context for link title translations.
   * Link titles describe embedded media (videos, PDFs).
   */
  link_title: {
    contentType: 'link_title' as const,
    domainContext: 'property_rental_media',
    tone: 'concise' as const,
  },

  /**
   * Context for tag translations.
   * Tags are category labels for filtering items.
   */
  tag: {
    contentType: 'tag' as const,
    domainContext: 'property_rental_categorization',
    tone: 'concise' as const,
  },
} as const;

/**
 * Type for translation context template keys.
 * Use this for type-safe access to TRANSLATION_CONTEXTS.
 */
export type TranslationContextKey = keyof typeof TRANSLATION_CONTEXTS;
```

**Verification**:
- [x] `TRANSLATION_CONTEXTS` constant compiles without error
- [x] All `contentType` values match `TranslationContext['contentType']` from translation-service
- [x] All `tone` values match `TranslationContext['tone']` from translation-service
- [x] `TranslationContextKey` type is exported
- [x] `as const` assertion is properly applied
- [x] All context entries have JSDoc comments

---

### Task 1.1.7: Create Barrel Export File
**Story Points**: 0.5
**Dependencies**: Tasks 1.1.2-1.1.6

Create the `index.ts` barrel export file following the pattern from `/src/lib/translation-service/index.ts`.

**File**: `/src/lib/content-translation/index.ts`

**Code to implement**:
```typescript
/**
 * Content Translation Module
 * Part of REQ-E03-001: Create Content Translation Module Structure
 *
 * This module provides content-specific translation functionality for
 * FAQBNB, building on the translation-service infrastructure from Epic 1.
 * It handles queueing translations when content is created or updated.
 *
 * @module content-translation
 * @created 2026-01-19
 *
 * @example
 * ```typescript
 * import {
 *   EntityType,
 *   ContentToTranslate,
 *   QueueTranslationOptions,
 *   TRANSLATION_CONTEXTS,
 * } from '@/lib/content-translation';
 * ```
 */

// ============================================================================
// Type Exports
// ============================================================================

export type {
  // Core types
  EntityType,
  TranslationTrigger,
  // Content interfaces
  TranslatableField,
  ContentToTranslate,
  // Queue interfaces
  QueueTranslationOptions,
  QueueTranslationResult,
  // Status interfaces
  LanguageTranslationStatus,
  TranslationStatusResult,
  EntityTranslationStatus,
  // Utility types
  TranslationContextKey,
} from './content-translation.types';

// ============================================================================
// Constant Exports
// ============================================================================

export { TRANSLATION_CONTEXTS } from './content-translation.types';

// ============================================================================
// Future Function Exports (Tasks 1.2-1.6)
// ============================================================================

// Task 1.2: Main orchestrator
// export { queueContentTranslations } from './content-translation';

// Task 1.3: Entity triggers
// export { triggerItemTranslation } from './triggers/item-trigger';
// export { triggerArticleTranslation } from './triggers/article-trigger';
// export { triggerLinkTranslation } from './triggers/link-trigger';

// Task 1.4: Tag translation
// export { triggerTagTranslation } from './triggers/tag-trigger';

// Task 1.5: Storage utilities
// export {
//   storeItemTranslation,
//   storeArticleTranslation,
//   storeLinkTranslation,
//   storeTagTranslation,
// } from './storage/translation-storage';

// Task 1.6: Status utilities
// export {
//   getEntityTranslationStatus,
//   getBatchTranslationStatus,
// } from './storage/translation-status';
```

**Verification**:
- [x] File created at correct location
- [x] All types from `content-translation.types.ts` are exported
- [x] `TRANSLATION_CONTEXTS` constant is exported
- [x] Import path `@/lib/content-translation` resolves correctly
- [x] Named imports work: `import { ContentToTranslate } from '@/lib/content-translation'`
- [x] Module header and JSDoc match codebase conventions

---

### Task 1.1.8: Verify TypeScript Compilation
**Story Points**: 0.5
**Dependencies**: Tasks 1.1.1-1.1.7

Run TypeScript compilation to verify all types are valid and there are no errors.

**Actions**:
1. Run `npm run build` or `npx tsc --noEmit`
2. Verify no TypeScript errors in new files
3. Verify imports from `@/lib/translation-service` resolve correctly
4. Test import from barrel export

**Verification Commands**:
```bash
# Type check only (faster)
npx tsc --noEmit

# Or full build
npm run build
```

**Test Import Script** (create temporarily to verify):
```typescript
// test-import.ts (temporary)
import {
  EntityType,
  TranslationTrigger,
  ContentToTranslate,
  TranslatableField,
  QueueTranslationOptions,
  QueueTranslationResult,
  LanguageTranslationStatus,
  TranslationStatusResult,
  EntityTranslationStatus,
  TranslationContextKey,
  TRANSLATION_CONTEXTS,
} from '@/lib/content-translation';

// Verify types work correctly
const entityType: EntityType = 'item';
const trigger: TranslationTrigger = 'create';
const contextKey: TranslationContextKey = 'item_name';
const context = TRANSLATION_CONTEXTS[contextKey];

console.log('Types imported successfully:', {
  entityType,
  trigger,
  contextKey,
  context,
});
```

**Verification Checklist**:
- [x] `npm run build` completes without TypeScript errors
- [x] No "Cannot find module '@/lib/translation-service'" errors
- [x] No "Cannot find module '@/lib/content-translation'" errors
- [x] No unused export warnings
- [x] Import test script compiles (if created)

---

## Complete File Listing

### New Files Created

| File Path | Purpose | Task |
|-----------|---------|------|
| `/src/lib/content-translation/` | Root directory | 1.1.1 |
| `/src/lib/content-translation/triggers/` | Trigger subdirectory | 1.1.1 |
| `/src/lib/content-translation/storage/` | Storage subdirectory | 1.1.1 |
| `/src/lib/content-translation/content-translation.types.ts` | Type definitions | 1.1.2-1.1.6 |
| `/src/lib/content-translation/index.ts` | Barrel exports | 1.1.7 |

### Existing Files Referenced (No Modification)

| File Path | Usage |
|-----------|-------|
| `/src/lib/translation-service/translation-service.types.ts` | Import `SupportedLanguage`, `TranslationContext` |
| `/src/lib/translation-service/index.ts` | Pattern reference for barrel exports |
| `/src/lib/job-queue/translation-jobs.types.ts` | Compatible `EntityType` definition |

---

## Type Compatibility Matrix

| Type | From Module | Compatible With |
|------|-------------|-----------------|
| `SupportedLanguage` | translation-service | Re-used (imported) |
| `TranslationContext` | translation-service | Re-used (imported) |
| `EntityType` | content-translation | Matches job-queue `EntityType` |
| `TranslationTrigger` | content-translation | New type |
| `ContentToTranslate` | content-translation | New interface |
| `TranslatableField` | content-translation | New interface |
| `QueueTranslationOptions` | content-translation | New interface |
| `QueueTranslationResult` | content-translation | New interface |
| `LanguageTranslationStatus` | content-translation | New interface |
| `TranslationStatusResult` | content-translation | New interface |
| `EntityTranslationStatus` | content-translation | New interface |

---

## Acceptance Criteria Verification

| Acceptance Criteria | Task(s) | Verification |
|---------------------|---------|--------------|
| Module structure exists at expected location | 1.1.1 | Directory structure created |
| Type definitions file contains interfaces for all content entities | 1.1.3 | `ContentToTranslate`, `TranslatableField` defined |
| Type definitions include translation job states | 1.1.5 | `LanguageTranslationStatus.status` includes all states |
| Type definitions include language code enumerations | 1.1.2 | Uses `SupportedLanguage` from translation-service |
| Type definitions include translation metadata | 1.1.5 | `translatedAt`, `reviewedBy`, timestamps included |
| All types are properly exported and importable | 1.1.7 | Barrel export with all types |
| TypeScript compilation succeeds with no errors | 1.1.8 | `npm run build` passes |

---

## Implementation Notes

### Pattern Conformance
- Follow existing conventions from `/src/lib/translation-service/translation-service.types.ts`
- Use JSDoc comments for all interfaces and properties
- Group related types with section dividers (`// ========`)
- Export types using `export type` for interfaces and type aliases

### Integration Points
- Types will be consumed by content translation orchestrator (Task 1.2)
- `QueueTranslationResult` will be returned by modified API routes (Tasks 2.2-2.4)
- `TranslationStatusResult` will be used by status API endpoints (Tasks 4.1, 4.4)
- `EntityTranslationStatus` will be used by frontend components in Epic 5

### Compatibility with Epic 1
This module extends (but does not duplicate) types from Epic 1:
- Uses `SupportedLanguage` from translation-service (do NOT redefine)
- Uses `TranslationContext` from translation-service (do NOT redefine)
- Compatible with `TranslationJob` from job-queue (same entity types)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Type conflicts with translation-service | Low | Medium | Import types, don't redefine |
| Missing type exports | Low | Low | Comprehensive checklist in Task 1.1.7 |
| Path alias issues | Low | Medium | Test `@/lib/content-translation` import |

---

## Downstream Dependencies

The following future tasks depend on this module:

| Task | Dependency | Types Required |
|------|------------|----------------|
| Task 1.2 | content-translation.ts | `QueueTranslationOptions`, `QueueTranslationResult`, `ContentToTranslate` |
| Task 1.3 | Entity triggers | `EntityType`, `TranslatableField`, `QueueTranslationResult` |
| Task 1.5 | Storage utilities | All status interfaces |
| Task 1.6 | Status utilities | `TranslationStatusResult`, `EntityTranslationStatus` |
| Task 2.2-2.4 | API modifications | `QueueTranslationResult` |
| Task 4.1 | Status API | `TranslationStatusResult` |
| Epic 5 | Frontend | `EntityTranslationStatus` |

---

## Estimated Total Effort

| Task | Story Points |
|------|--------------|
| 1.1.1 Directory Structure | 0.5 |
| 1.1.2 Core Types | 1 |
| 1.1.3 Content Interfaces | 1 |
| 1.1.4 Queue Interfaces | 1 |
| 1.1.5 Status Interfaces | 1 |
| 1.1.6 Context Constants | 0.5 |
| 1.1.7 Barrel Export | 0.5 |
| 1.1.8 Verification | 0.5 |
| **Total** | **6 story points** |

---

*Detailed breakdown generated for REQ-E03-001*
*Conforms to: Plan-111-L10N-Epic3-Dynamic-Content-Translation.md*
