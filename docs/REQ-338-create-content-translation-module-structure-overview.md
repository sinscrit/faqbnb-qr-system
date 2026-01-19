# REQ-338: Create Content Translation Module Structure and Type Definitions - Implementation Overview
*Generated: 2026-01-19 13:45:00 UTC*
*Last Modified: 2026-01-19 13:45:00 UTC*

## Reference
- **Request**: REQ-338 (Create Content Translation Module Structure and Type Definitions)
- **Source**: docs/gen_requests_epic3.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md
- **Type**: New Feature (Foundation Setup)
- **Phase**: 1 - Content Translation Infrastructure
- **Task ID**: 1.1
- **Size**: S

## Goals
1. Create `/src/lib/content-translation/` directory structure
2. Create `content-translation.types.ts` with all TypeScript interfaces for content translation
3. Set up barrel exports in `index.ts` for clean imports
4. Import and re-use types from existing translation-service and job-queue modules
5. Ensure zero compilation errors or TypeScript warnings
6. Follow existing project module organization patterns (mirror translation-service structure)

## Context from Implementation Plan

### Module Structure (Target)
Per the implementation plan Task 1.1, this establishes the foundation for Epic 3:

```
/src/lib/content-translation/
├── index.ts                           # Module exports (THIS TASK)
├── content-translation.types.ts       # TypeScript interfaces (THIS TASK)
├── content-translation.ts             # Main orchestrator (Task 1.2)
├── source-language.ts                 # Language detection (Task 2.1)
├── triggers/
│   ├── item-trigger.ts                # Item translation trigger (Task 1.3)
│   ├── article-trigger.ts             # Article translation trigger (Task 1.3)
│   ├── link-trigger.ts                # Link translation trigger (Task 1.3)
│   └── tag-trigger.ts                 # Tag translation trigger (Task 1.4)
├── processors/
│   ├── item-processor.ts              # Item translation processor (Task 3.2)
│   ├── article-processor.ts           # Article translation processor (Task 3.3)
│   ├── link-processor.ts              # Link translation processor (Task 3.4)
│   └── tag-processor.ts               # Tag translation processor (Task 3.5)
└── storage/
    ├── translation-storage.ts         # Store/retrieve translations (Task 1.5)
    └── translation-status.ts          # Status tracking utilities (Task 1.6)
```

### Task Dependencies
- **This Task (1.1)**: No dependencies - can start immediately
- **Task 1.2** (Content Translation Orchestrator): Depends on this task completing
- **Task 1.3** (Entity-Specific Triggers): Depends on this task completing
- **Tasks 1.4-1.6**: All depend on the type definitions from this task

### Existing Patterns to Follow
Per implementation plan analysis of existing codebase:

| Pattern | Example File | Application to This Task |
|---------|--------------|-------------------------|
| Type definitions | `src/lib/translation-service/translation-service.types.ts` | Comprehensive type file with sections |
| Module exports | `src/lib/translation-service/index.ts` | Central exports with documentation |
| Job types | `src/lib/job-queue/translation-jobs.types.ts` | EntityType, JobStatus patterns |
| Result pattern | `TranslationResult<T>` in translation-service | Use for operation results |

### Types to Import from Existing Modules
The following types must be imported from existing modules (not duplicated):

```typescript
// From src/lib/translation-service
import type {
  SupportedLanguage,
  TranslationStatus,
  TranslatableEntityType,
  TranslationContext,
  TranslationJobStatus,
} from '@/lib/translation-service';

// From src/lib/job-queue
import type {
  EntityType,
  JobStatus,
  TranslationJob,
} from '@/lib/job-queue';
```

## Implementation Order

### Step 1: Create Directory Structure
Create the base directory and subdirectories for the content-translation module.

**Directories to create:**
- `/src/lib/content-translation/`
- `/src/lib/content-translation/triggers/`
- `/src/lib/content-translation/processors/`
- `/src/lib/content-translation/storage/`

### Step 2: Create TypeScript Types File
Create `content-translation.types.ts` with all interfaces defined in the implementation plan.

**Interfaces to implement:**

#### Core Content Types
1. `EntityType` - Re-export from job-queue (already defined as 'item' | 'article' | 'link' | 'tag')
2. `TranslationTrigger` - Trigger type ('create' | 'update')
3. `ContentToTranslate` - Structure for content requiring translation
4. `TranslatableField` - Individual field that can be translated

#### Queue Operation Types
5. `QueueTranslationOptions` - Options for queueing translations
6. `QueueTranslationResult` - Result of queue operation

#### Status Tracking Types
7. `TranslationStatusResult` - Full status for an entity
8. `LanguageTranslationStatus` - Status for a single language translation
9. `BatchTranslationStatusResult` - For batch status queries

#### Entity-Specific Field Types
10. `ItemTranslatableFields` - Fields for item translation (name, description)
11. `ArticleTranslatableFields` - Fields for article translation (title, description)
12. `LinkTranslatableFields` - Fields for link translation (title only)
13. `TagTranslatableFields` - Fields for tag translation (value)

#### Storage Types
14. `StoreTranslationData` - Data structure for storing translations
15. `StoreItemTranslationData` - Item-specific storage data
16. `StoreArticleTranslationData` - Article-specific storage data
17. `StoreLinkTranslationData` - Link-specific storage data
18. `StoreTagTranslationData` - Tag-specific storage data

### Step 3: Create Barrel Export File
Create `index.ts` with exports for public consumption.

**Exports:**
- All public types from `content-translation.types.ts`
- Re-export relevant types from translation-service and job-queue
- Placeholder comments for future function exports

### Step 4: Verification
- Run TypeScript compilation to verify no errors
- Verify imports work correctly from barrel export
- Confirm translation-service types are correctly re-exported

## Authorized Files and Functions for Modification

### New Files to Create

#### `/src/lib/content-translation/index.ts`
- **Purpose**: Barrel export file for clean imports
- **Exports**:
  - All public types from `content-translation.types.ts`
  - Re-exported types from translation-service: `SupportedLanguage`, `TranslationContext`, `TranslationStatus`
  - Re-exported types from job-queue: `EntityType`, `JobStatus`
  - Future: orchestrator functions, trigger functions, storage utilities

#### `/src/lib/content-translation/content-translation.types.ts`
- **Purpose**: Central TypeScript type definitions for content translation
- **Types to define**:
  - `TranslationTrigger` - 'create' | 'update' literal union
  - `OverallTranslationStatus` - 'complete' | 'partial' | 'pending' | 'failed' literal union
- **Interfaces to define**:
  - `ContentToTranslate` - Entity type, ID, source language, fields
  - `TranslatableField` - Field name, value, context, maxLength
  - `QueueTranslationOptions` - Content, trigger, exclude languages, priority
  - `QueueTranslationResult` - Success flag, job IDs, queued languages, error
  - `TranslationStatusResult` - Entity ID, type, source language, overall status, translations by language
  - `LanguageTranslationStatus` - Status, translatedAt, reviewedBy, error
  - `BatchTranslationStatusResult` - Array of status results
  - `ItemTranslatableFields` - name, description
  - `ArticleTranslatableFields` - title, description
  - `LinkTranslatableFields` - title
  - `TagTranslatableFields` - value
  - `StoreItemTranslationData` - itemId, language, name, description
  - `StoreArticleTranslationData` - articleId, language, title, description
  - `StoreLinkTranslationData` - linkId, language, title
  - `StoreTagTranslationData` - tagKey, language, value, isSystemTag

### Directories to Create
- `/src/lib/content-translation/` - Root module directory
- `/src/lib/content-translation/triggers/` - Entity-specific translation triggers
- `/src/lib/content-translation/processors/` - Entity-specific job processors
- `/src/lib/content-translation/storage/` - Translation storage and status utilities

### Existing Files (No Modification Required)
This task does not require modification of any existing files. All changes are additive.

The existing modules will be imported from, but not modified:
- `/src/lib/translation-service/translation-service.types.ts` - Types to import
- `/src/lib/translation-service/index.ts` - Barrel exports to import from
- `/src/lib/job-queue/translation-jobs.types.ts` - Types to import
- `/src/lib/job-queue/index.ts` - Barrel exports to import from

## Technical Specifications

### Content Translation Types (From Implementation Plan)

```typescript
/**
 * Trigger type for translation operations.
 * Affects priority: 'create' gets higher priority than 'update'.
 */
export type TranslationTrigger = 'create' | 'update';

/**
 * Overall status for entity translation coverage.
 */
export type OverallTranslationStatus = 'complete' | 'partial' | 'pending' | 'failed';

/**
 * Content structure for initiating translations.
 * Used by the queueContentTranslations function.
 */
export interface ContentToTranslate {
  /** Type of entity being translated */
  entityType: EntityType;
  /** Unique identifier for the entity */
  entityId: string;
  /** Source language of the content */
  sourceLanguage: SupportedLanguage;
  /** Fields to translate with their values and context */
  fields: TranslatableField[];
}

/**
 * Individual field that requires translation.
 * Provides context for AI translation quality.
 */
export interface TranslatableField {
  /** Field name matching the translation table column */
  fieldName: string;
  /** Current value to translate */
  value: string;
  /** Context for AI provider to improve translation quality */
  context: TranslationContext;
  /** Optional maximum character length for the translation */
  maxLength?: number;
}

/**
 * Options for queueing content translations.
 * Passed to queueContentTranslations function.
 */
export interface QueueTranslationOptions {
  /** Content to translate with all field data */
  content: ContentToTranslate;
  /** Trigger type affects job priority */
  trigger: TranslationTrigger;
  /** Languages to skip (e.g., if already translated) */
  excludeLanguages?: SupportedLanguage[];
  /** Custom priority override (higher = more urgent) */
  priority?: number;
}

/**
 * Result of a queue operation.
 * Returned by queueContentTranslations function.
 */
export interface QueueTranslationResult {
  /** Whether the queue operation succeeded */
  success: boolean;
  /** IDs of created translation jobs */
  jobIds: string[];
  /** Languages that were queued for translation */
  queuedLanguages: SupportedLanguage[];
  /** Error message if operation failed */
  error?: string;
}

/**
 * Translation status for a single language.
 * Part of TranslationStatusResult.
 */
export interface LanguageTranslationStatus {
  /** Current status of this language translation */
  status: 'pending' | 'completed' | 'failed' | 'manual';
  /** When the translation was completed (ISO 8601) */
  translatedAt?: string;
  /** User ID who reviewed/provided manual translation */
  reviewedBy?: string;
  /** Error message if translation failed */
  error?: string;
}

/**
 * Complete translation status for an entity.
 * Returned by getEntityTranslationStatus function.
 */
export interface TranslationStatusResult {
  /** Entity identifier */
  entityId: string;
  /** Entity type */
  entityType: EntityType;
  /** Source language of original content */
  sourceLanguage: SupportedLanguage;
  /** Overall status summary */
  overallStatus: OverallTranslationStatus;
  /** Translation status for each language */
  translations: Record<SupportedLanguage, LanguageTranslationStatus>;
  /** Languages with completed translations */
  completedLanguages: SupportedLanguage[];
  /** Languages with pending jobs */
  pendingLanguages: SupportedLanguage[];
  /** Languages with failed translations */
  failedLanguages: SupportedLanguage[];
  /** Languages with no translation activity */
  missingLanguages: SupportedLanguage[];
}
```

### Entity-Specific Field Interfaces

```typescript
/**
 * Translatable fields for items.
 * Maps to item_translations table columns.
 */
export interface ItemTranslatableFields {
  /** Item display name */
  name: string;
  /** Item description (optional, can be empty string) */
  description: string;
}

/**
 * Translatable fields for articles.
 * Maps to article_translations table columns.
 */
export interface ArticleTranslatableFields {
  /** Article title */
  title: string;
  /** Article description/content (optional) */
  description: string;
}

/**
 * Translatable fields for links.
 * Maps to link_translations table columns.
 * Note: URL is NOT translated, only the title.
 */
export interface LinkTranslatableFields {
  /** Link display title */
  title: string;
}

/**
 * Translatable fields for tags.
 * Maps to tag_translations table columns.
 */
export interface TagTranslatableFields {
  /** Tag display value */
  value: string;
}
```

### Storage Data Interfaces

```typescript
/**
 * Data for storing an item translation.
 * Used by storeItemTranslation function.
 */
export interface StoreItemTranslationData {
  /** Item identifier */
  itemId: string;
  /** Target language code */
  language: SupportedLanguage;
  /** Translated name */
  name: string;
  /** Translated description */
  description: string | null;
}

/**
 * Data for storing an article translation.
 * Used by storeArticleTranslation function.
 */
export interface StoreArticleTranslationData {
  /** Article identifier */
  articleId: string;
  /** Target language code */
  language: SupportedLanguage;
  /** Translated title */
  title: string;
  /** Translated description */
  description: string | null;
}

/**
 * Data for storing a link translation.
 * Used by storeLinkTranslation function.
 */
export interface StoreLinkTranslationData {
  /** Link identifier */
  linkId: string;
  /** Target language code */
  language: SupportedLanguage;
  /** Translated title */
  title: string;
}

/**
 * Data for storing a tag translation.
 * Used by storeTagTranslation function.
 */
export interface StoreTagTranslationData {
  /** Tag key */
  tagKey: string;
  /** Target language code */
  language: SupportedLanguage;
  /** Translated value */
  value: string;
  /** Whether this is a system tag (false for user-created) */
  isSystemTag: boolean;
}
```

## Success Validation Checklist

### Directory Structure
- [ ] `/src/lib/content-translation/` directory exists
- [ ] `/src/lib/content-translation/triggers/` directory exists
- [ ] `/src/lib/content-translation/processors/` directory exists
- [ ] `/src/lib/content-translation/storage/` directory exists

### Type Definitions
- [ ] `content-translation.types.ts` contains all required interfaces
- [ ] `TranslationTrigger` type is defined ('create' | 'update')
- [ ] `OverallTranslationStatus` type is defined
- [ ] `ContentToTranslate` interface is complete
- [ ] `TranslatableField` interface is complete
- [ ] `QueueTranslationOptions` interface is complete
- [ ] `QueueTranslationResult` interface is complete
- [ ] `TranslationStatusResult` interface is complete
- [ ] `LanguageTranslationStatus` interface is complete
- [ ] Entity-specific field interfaces are defined (Item, Article, Link, Tag)
- [ ] Storage data interfaces are defined for all entity types

### Barrel Export
- [ ] `index.ts` exports all public types
- [ ] `index.ts` re-exports relevant translation-service types
- [ ] `index.ts` re-exports relevant job-queue types
- [ ] Import `@/lib/content-translation` resolves correctly
- [ ] Named imports work: `import { QueueTranslationOptions, ContentToTranslate } from '@/lib/content-translation'`

### Compilation
- [ ] `npm run build` completes without TypeScript errors
- [ ] No unused export warnings
- [ ] No type conflicts with existing codebase or translation-service types

## Notes

### Pattern Alignment
- Follow existing project conventions observed in `src/lib/translation-service/`
- Mirror the translation-service types file structure and documentation style
- Use JSDoc comments for interface properties (matches implementation plan documentation style)
- Export types using ES module syntax
- Use descriptive section comments (e.g., `// ============================================================================`)

### Future Integration Points
- Types will be consumed by content translation orchestrator (Task 1.2)
- `QueueTranslationOptions` will be used by API route handlers when items/articles are created/updated
- `TranslationStatusResult` will be used by status API endpoints
- Entity-specific field interfaces ensure type safety in trigger functions
- Storage data interfaces ensure type safety in UPSERT operations

### Type Reuse Strategy
Per the implementation plan:
- **Import from translation-service**: `SupportedLanguage`, `TranslationContext`, `TranslationStatus`
- **Import from job-queue**: `EntityType`, `JobStatus`
- **New for content-translation**: All content-specific orchestration types

This ensures:
1. Type consistency across the translation infrastructure
2. No type duplication or drift between modules
3. Clear separation of concerns (service types vs. content orchestration types)

## Dependencies
- TypeScript 5.x (existing in project)
- Translation-service module types (existing in project)
- Job-queue module types (existing in project)
- No new npm packages required
- No runtime dependencies (types-only initial file)

## Risk Assessment
- **Risk Level**: Very Low
- **Rationale**:
  - Purely additive changes (no modifications to existing code)
  - Type-only files have no runtime impact initially
  - Standard directory creation operations
  - No external dependencies
  - Mirror of proven translation-service pattern
  - All types derived from the reviewed implementation plan
