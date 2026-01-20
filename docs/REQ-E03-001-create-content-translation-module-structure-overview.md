# REQ-E03-001: Create Content Translation Module Structure - Implementation Overview
*Generated: 2026-01-19 14:30:00 UTC*

## Reference
- **Request**: REQ-E03-001 (Create Content Translation Module Structure)
- **Source**: docs/gen_requests_epic3.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md
- **Type**: New Feature (Foundation Setup)
- **Epic**: 3 - Dynamic Content Translation
- **Phase**: 1 - Content Translation Infrastructure
- **Task ID**: 1.1
- **Size**: S

## Goals
1. Create `/src/lib/content-translation/` directory structure
2. Set up barrel exports in `index.ts` following existing patterns
3. Create `content-translation.types.ts` with all TypeScript interfaces for content translation operations
4. Define type-safe interfaces for translatable content entities (items, articles, links, tags)
5. Ensure compatibility with existing translation-service and job-queue modules from Epic 1
6. Zero compilation errors with TypeScript strict mode

## Context from Implementation Plan

### Module Hierarchy (Target Structure)
Per the implementation plan (Plan-111), Task 1.1 establishes the foundation for this hierarchy:

```
/src/lib/content-translation/
├── index.ts                        # Public exports (THIS TASK)
├── content-translation.ts          # Main orchestrator (Task 1.2)
├── content-translation.types.ts    # All TypeScript interfaces (THIS TASK)
├── source-language.ts              # Language detection (Task 2.1)
├── triggers/
│   ├── item-trigger.ts             # Item save trigger (Task 1.3)
│   ├── article-trigger.ts          # Article save trigger (Task 1.3)
│   ├── link-trigger.ts             # Link save trigger (Task 1.3)
│   └── tag-trigger.ts              # Tag translation trigger (Task 1.4)
└── storage/
    ├── translation-storage.ts      # Store/retrieve translations (Task 1.5)
    └── translation-status.ts       # Status tracking utilities (Task 1.6)
```

### Dependencies from Epic 1
This module imports types from existing Epic 1 infrastructure:
- `SupportedLanguage` from `/src/lib/translation-service/translation-service.types.ts`
- `TranslationContext` from `/src/lib/translation-service/translation-service.types.ts`
- `EntityType`, `JobStatus` from `/src/lib/job-queue/translation-jobs.types.ts`

### Task Dependencies
- **This Task (1.1)**: No dependencies - can start immediately
- **Task 1.2** (Content Translation Orchestrator): Depends on this task
- **Task 1.3** (Entity-specific Translation Triggers): Depends on Task 1.2
- **Tasks 1.4-1.6**: Depend on Tasks 1.1-1.3

### Existing Patterns to Follow

| Pattern | Example File | Application to This Task |
|---------|--------------|-------------------------|
| Module structure | `/src/lib/translation-service/` | Same directory/file organization |
| Types file | `translation-service.types.ts` | JSDoc comments, interface organization |
| Barrel exports | `translation-service/index.ts` | Export all types + placeholder for functions |
| Type re-exports | `/src/types/index.ts` | Central type aggregation pattern |
| Result pattern | `TranslationResult<T>` | Consistent error handling types |

## Implementation Order

### Step 1: Create Directory Structure
Create the base directory and subdirectories for the content-translation module.

**Directories to create:**
- `/src/lib/content-translation/`
- `/src/lib/content-translation/triggers/`
- `/src/lib/content-translation/storage/`

### Step 2: Create TypeScript Types File
Create `content-translation.types.ts` with all interfaces defined in the implementation plan.

**Interfaces to implement:**
1. `EntityType` - Re-export/alias for translatable entity types
2. `TranslationTrigger` - Trigger type for create vs update operations
3. `ContentToTranslate` - Input structure for translation orchestrator
4. `TranslatableField` - Individual field with translation context
5. `QueueTranslationOptions` - Options for queueContentTranslations function
6. `QueueTranslationResult` - Result of queuing translation jobs
7. `TranslationStatusResult` - Entity translation status summary
8. `LanguageTranslationStatus` - Per-language translation status
9. `EntityTranslationStatus` - Comprehensive entity status (for UI display)

### Step 3: Create Barrel Export File
Create `index.ts` with exports for public consumption.

**Initial Exports:**
- All public types from `content-translation.types.ts`
- Placeholder comments for future function exports

### Step 4: Verification
- Run TypeScript compilation to verify no errors
- Verify imports work correctly from barrel export
- Confirm compatibility with existing translation-service types

## Authorized Files and Functions for Modification

### New Files to Create

#### `/src/lib/content-translation/index.ts`
- **Purpose**: Barrel export file for clean imports
- **Exports**:
  - All public types from `content-translation.types.ts`
  - Future: `queueContentTranslations`, trigger functions, storage utilities
- **Pattern Reference**: `/src/lib/translation-service/index.ts`

#### `/src/lib/content-translation/content-translation.types.ts`
- **Purpose**: Central TypeScript type definitions for content translation
- **Types to Define**:
  - `EntityType` - `'item' | 'article' | 'link' | 'tag'`
  - `TranslationTrigger` - `'create' | 'update'`
- **Interfaces to Define**:
  - `ContentToTranslate` - Entity with fields to translate
  - `TranslatableField` - Individual translatable field
  - `QueueTranslationOptions` - Input for queueing translations
  - `QueueTranslationResult` - Result of queue operation
  - `TranslationStatusResult` - Entity status summary
  - `LanguageTranslationStatus` - Per-language status
  - `EntityTranslationStatus` - Full status for UI (from implementation plan)
- **Constants to Export**:
  - `TRANSLATION_CONTEXTS` - Context templates for optimal translation quality

### Directories to Create
- `/src/lib/content-translation/` - Root directory
- `/src/lib/content-translation/triggers/` - Entity-specific trigger files
- `/src/lib/content-translation/storage/` - Translation storage and status utilities

### Existing Files (No Modification Required for This Task)
- `/src/lib/translation-service/translation-service.types.ts` - Import types only
- `/src/lib/job-queue/translation-jobs.types.ts` - Import types only
- `/src/types/index.ts` - May be updated in Task 2.6 to export translation types

## Technical Specifications

### TypeScript Interfaces (From Implementation Plan)

```typescript
// Re-export from translation-service for consistency
import type { SupportedLanguage, TranslationContext } from '@/lib/translation-service';

/**
 * Entity types that support content translation.
 * Maps to the *_translations database tables.
 */
export type EntityType = 'item' | 'article' | 'link' | 'tag';

/**
 * What triggered the translation (affects priority).
 */
export type TranslationTrigger = 'create' | 'update';

/**
 * Content to be translated, with all necessary fields and context.
 */
export interface ContentToTranslate {
  /** Type of entity being translated */
  entityType: EntityType;
  /** ID of the entity to translate */
  entityId: string;
  /** Source language of the content */
  sourceLanguage: SupportedLanguage;
  /** Fields to translate with their context */
  fields: TranslatableField[];
}

/**
 * Individual field that needs translation.
 */
export interface TranslatableField {
  /** Name of the field (e.g., 'name', 'description', 'title') */
  fieldName: string;
  /** Current value to translate */
  value: string;
  /** Context for better translation quality */
  context: TranslationContext;
  /** Maximum length for translated text */
  maxLength?: number;
}

/**
 * Options for queuing content translations.
 */
export interface QueueTranslationOptions {
  /** Content to translate */
  content: ContentToTranslate;
  /** Trigger type affects priority */
  trigger: TranslationTrigger;
  /** Skip specific languages */
  excludeLanguages?: SupportedLanguage[];
  /** Custom priority override (higher = more urgent) */
  priority?: number;
}

/**
 * Result of queuing translation jobs.
 */
export interface QueueTranslationResult {
  /** Whether queuing succeeded */
  success: boolean;
  /** IDs of created translation jobs */
  jobIds: string[];
  /** Languages that were queued for translation */
  queuedLanguages: SupportedLanguage[];
  /** Error message if failed */
  error?: string;
}

/**
 * Translation status for a specific language.
 */
export interface LanguageTranslationStatus {
  /** Current status of the translation */
  status: 'pending' | 'completed' | 'failed' | 'manual';
  /** When translation was completed */
  translatedAt?: string;
  /** User who reviewed/edited (for manual status) */
  reviewedBy?: string;
  /** Error message if failed */
  error?: string;
}

/**
 * Complete translation status for an entity.
 */
export interface TranslationStatusResult {
  /** Entity ID */
  entityId: string;
  /** Type of entity */
  entityType: EntityType;
  /** Source language of original content */
  sourceLanguage: SupportedLanguage;
  /** Overall status across all languages */
  overallStatus: 'complete' | 'partial' | 'pending' | 'failed';
  /** Per-language translation status */
  translations: Record<SupportedLanguage, LanguageTranslationStatus>;
}

/**
 * Extended status for UI display (from implementation plan).
 * Includes convenience arrays for filtering.
 */
export interface EntityTranslationStatus {
  entityId: string;
  entityType: EntityType;
  sourceLanguage: SupportedLanguage;
  overallStatus: 'complete' | 'partial' | 'pending' | 'failed';
  translations: {
    [language: string]: {
      status: 'pending' | 'completed' | 'failed' | 'manual';
      translatedAt?: string;
      reviewedBy?: string;
    }
  };
  /** Languages still pending translation */
  pendingLanguages: string[];
  /** Languages with completed translations */
  completedLanguages: string[];
  /** Languages with failed translations */
  failedLanguages: string[];
}
```

### Translation Context Templates (From Implementation Plan Appendix A)

```typescript
/**
 * Pre-defined translation contexts for optimal translation quality.
 * Use these when triggering translations for specific content types.
 */
export const TRANSLATION_CONTEXTS = {
  item_name: {
    contentType: 'item_name' as const,
    domainContext: 'property_rental_appliances',
    tone: 'concise' as const,
  },
  item_description: {
    contentType: 'item_description' as const,
    domainContext: 'property_rental_appliances',
    tone: 'friendly' as const,
  },
  article_title: {
    contentType: 'article_title' as const,
    domainContext: 'property_rental_instructions',
    tone: 'concise' as const,
  },
  article_description: {
    contentType: 'article_description' as const,
    domainContext: 'property_rental_instructions',
    tone: 'friendly' as const,
  },
  link_title: {
    contentType: 'link_title' as const,
    domainContext: 'property_rental_media',
    tone: 'concise' as const,
  },
  tag: {
    contentType: 'tag' as const,
    domainContext: 'property_rental_categorization',
    tone: 'concise' as const,
  },
} as const;

/** Type for translation context keys */
export type TranslationContextKey = keyof typeof TRANSLATION_CONTEXTS;
```

## Success Validation Checklist

### Directory Structure
- [ ] `/src/lib/content-translation/` directory exists
- [ ] `/src/lib/content-translation/triggers/` directory exists
- [ ] `/src/lib/content-translation/storage/` directory exists

### Type Definitions
- [ ] `content-translation.types.ts` contains all required interfaces
- [ ] `EntityType` type is defined
- [ ] `TranslationTrigger` type is defined
- [ ] `ContentToTranslate` interface is complete
- [ ] `TranslatableField` interface is complete
- [ ] `QueueTranslationOptions` interface is complete
- [ ] `QueueTranslationResult` interface is complete
- [ ] `LanguageTranslationStatus` interface is complete
- [ ] `TranslationStatusResult` interface is complete
- [ ] `EntityTranslationStatus` interface is complete
- [ ] `TRANSLATION_CONTEXTS` constant is defined
- [ ] Imports from `@/lib/translation-service` work correctly

### Barrel Export
- [ ] `index.ts` exports all public types
- [ ] Import `@/lib/content-translation` resolves correctly
- [ ] Named imports work: `import { ContentToTranslate, QueueTranslationResult } from '@/lib/content-translation'`

### Compilation
- [ ] `npm run build` completes without TypeScript errors
- [ ] No unused export warnings
- [ ] No type conflicts with existing translation-service or job-queue modules
- [ ] Types are compatible with Epic 1 infrastructure

## Notes

### Pattern Alignment
- Follow existing conventions from `/src/lib/translation-service/translation-service.types.ts`
- Use JSDoc comments for all interfaces and properties
- Export types using ES module syntax with `export type` where appropriate
- Group related types with section dividers and comments

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

### Future Tasks Using These Types
- **Task 1.2**: `queueContentTranslations(options: QueueTranslationOptions): Promise<QueueTranslationResult>`
- **Task 1.3**: Trigger functions return `Promise<QueueTranslationResult>`
- **Task 1.6**: Status functions return `Promise<TranslationStatusResult>`
- **Task 4.1**: Status API returns `TranslationStatusResult` in JSON response

## Dependencies
- TypeScript 5.x (existing in project)
- `@/lib/translation-service` module (Epic 1 - must be complete)
- `@/lib/job-queue` module (Epic 1 - must be complete)
- No new npm packages required

## Risk Assessment
- **Risk Level**: Very Low
- **Rationale**:
  - Purely additive changes (no modifications to existing code)
  - Type-only files have no runtime impact
  - Standard directory creation operations
  - Relies on stable Epic 1 infrastructure
  - Follows established patterns from translation-service module

## References
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- Translation Service Types: `/src/lib/translation-service/translation-service.types.ts`
- Job Queue Types: `/src/lib/job-queue/translation-jobs.types.ts`
- Module Pattern Example: `/src/lib/translation-service/index.ts`
