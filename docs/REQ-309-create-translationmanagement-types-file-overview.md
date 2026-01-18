# REQ-309: TranslationManagement Component Type Definitions - Implementation Overview
*Generated: 2026-01-18 15:30:00*
*Last Modified: 2026-01-18 15:30:00*

## Reference
- **Request**: REQ-309 (Create TranslationManagement Component Type Definitions)
- **Source**: docs/gen_requests_epic5.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
- **Type**: New Feature (Foundation Setup)
- **Phase**: 2 - Core UI Components
- **Task ID**: 2.1
- **Size**: S

## Goals
1. Create `/src/components/TranslationManagement/` directory structure
2. Create `TranslationManagement.types.ts` with all shared TypeScript interfaces and types
3. Define translation record data structures with proper status tracking
4. Define component prop types for all translation management widgets
5. Define callback function types for translation operations
6. Define filter and query parameter interfaces
7. Ensure all exported types include JSDoc comments explaining their purpose
8. Ensure zero compilation errors or TypeScript warnings

## Context from Implementation Plan

### Component Hierarchy (Target Structure)
Per the implementation plan, Task 2.1 establishes the type foundation for this hierarchy:

```
/src/components/TranslationManagement/
├── index.ts                              # Public exports
├── TranslationManagement.types.ts        # Shared types (THIS TASK)
│
├── TranslationPreviewPanel/
│   ├── index.ts                          # Panel exports
│   ├── TranslationPreviewPanel.tsx       # Main slide-out panel
│   ├── TranslationPreviewPanel.types.ts  # Panel-specific types
│   ├── TranslationStatusItem.tsx         # Single language status row
│   └── TranslationProgressBar.tsx        # Overall progress indicator
│
├── TranslationEditor/
│   ├── index.ts                          # Editor exports
│   ├── TranslationEditor.tsx             # Side-by-side edit modal
│   ├── TranslationEditor.types.ts        # Editor-specific types
│   └── TranslationDiffView.tsx           # Original vs translated comparison
│
├── TranslationStatusWidget/
│   ├── index.ts                          # Widget exports
│   ├── TranslationStatusWidget.tsx       # Dashboard summary widget
│   └── TranslationStatusWidget.types.ts  # Widget-specific types
│
├── TranslationStatusColumn/
│   ├── index.ts                          # Column exports
│   └── TranslationStatusColumn.tsx       # Table column component
│
├── TranslationStatusFilter/
│   ├── index.ts                          # Filter exports
│   └── TranslationStatusFilter.tsx       # Status filter dropdown
│
├── BulkTranslationBar/
│   ├── index.ts                          # Bar exports
│   ├── BulkTranslationBar.tsx            # Bulk action bar
│   └── LanguageSelectorDialog.tsx        # Language picker for bulk ops
│
├── ManualEditWarning/
│   ├── index.ts                          # Warning exports
│   └── ManualEditWarningDialog.tsx       # Source update warning dialog
│
└── LanguagePreference/
    ├── index.ts                          # Preference exports
    └── LanguagePreferenceSection.tsx     # Account settings section
```

### Task Dependencies
- **This Task (2.1)**: No dependencies on other Phase 2 tasks - can start immediately
- **Task 2.2** (TranslationPreviewPanel): Depends on this task completing
- **Task 2.3** (TranslationStatusItem): Depends on Tasks 2.1, 2.2
- **Task 2.4** (TranslationProgressBar): Depends on this task
- **Task 2.5** (TranslationEditor): Depends on this task
- **Tasks 2.6, 2.7** (Hooks): Depend on this task

### Dependencies from Epic 1 (Foundation)
| Dependency | Purpose |
|------------|---------|
| Translation tables | article_translations, item_translations, link_translations, tag_translations |
| Translation jobs table | translation_jobs |
| Translation service | /src/lib/translation-service/ |
| Language preference columns | accounts.preferred_language, users.preferred_language |
| Source language columns | items.source_language, item_articles.source_language, item_links.source_language |
| i18n framework | next-intl (for UI strings) |

### Dependencies from Epic 3 (Dynamic Content Translation)
| Dependency | Purpose |
|------------|---------|
| Translation trigger system | Re-translation jobs queued here |
| Translation status tracking | FR-6 status API |
| Manual translation override API | PUT /api/translations/{entityType}/{entityId}/{language} |

### Existing Patterns to Follow
Per the implementation plan analysis of existing codebase:

| Pattern | Example File | Application to This Task |
|---------|--------------|-------------------------|
| Component types | `/src/components/ItemManager/ItemManager.types.ts` | Central type definitions with section organization |
| Media types | `/src/components/MediaManagement/MediaManagement.types.ts` | Interface structure for media-related operations |
| Section comments | ItemManager.types.ts | Use `// =============================================================================` |
| JSDoc comments | ItemManager.types.ts | All interfaces/properties documented with JSDoc |
| Type unions | ItemManager.types.ts SortOption | Union types for status enumerations |

## Implementation Order

### Step 1: Create Directory Structure
Create the base directory and subdirectories for the TranslationManagement component.

**Directories to create:**
- `/src/components/TranslationManagement/`
- `/src/components/TranslationManagement/TranslationPreviewPanel/`
- `/src/components/TranslationManagement/TranslationEditor/`
- `/src/components/TranslationManagement/TranslationStatusWidget/`
- `/src/components/TranslationManagement/TranslationStatusColumn/`
- `/src/components/TranslationManagement/TranslationStatusFilter/`
- `/src/components/TranslationManagement/BulkTranslationBar/`
- `/src/components/TranslationManagement/ManualEditWarning/`
- `/src/components/TranslationManagement/LanguagePreference/`

### Step 2: Create TypeScript Types File
Create `TranslationManagement.types.ts` with all shared interfaces and types.

**Type categories to implement:**

#### Core Enumerations and Literals
1. `SupportedLanguage` - Union type for supported language codes
2. `TranslationStatusValue` - Union type for translation status values
3. `EntityType` - Union type for translatable entity types

#### Translation Data Structures
4. `TranslationContent` - Content structure for translations
5. `TranslationRecord` - Complete translation record with metadata
6. `TranslationStatusInfo` - Status information for a single translation
7. `TranslationStatusMap` - Map of language codes to status info
8. `TranslationStatusItem` - Item with entity info and translation status

#### API Request/Response Types
9. `TranslationStatusResponse` - Response from status API
10. `UpdateTranslationRequest` - Request to update translation
11. `UpdateTranslationResponse` - Response from update API
12. `RetranslateRequest` - Request to re-translate content
13. `RetranslateResponse` - Response from re-translate API

#### Filter and Query Types
14. `TranslationFilterCriteria` - Filter criteria for queries
15. `TranslationSortOption` - Sort options for translation lists
16. `TranslationQueryParams` - Complete query parameters

#### Component Props Types
17. `TranslationPreviewPanelProps` - Props for preview panel
18. `TranslationEditorProps` - Props for editor modal
19. `TranslationStatusWidgetProps` - Props for dashboard widget
20. `TranslationStatusColumnProps` - Props for table column
21. `TranslationStatusFilterProps` - Props for status filter
22. `BulkTranslationBarProps` - Props for bulk actions bar
23. `LanguageSelectorDialogProps` - Props for language selector
24. `ManualEditWarningDialogProps` - Props for warning dialog
25. `LanguagePreferenceSectionProps` - Props for preference section

#### Callback Function Types
26. `OnTranslationEdited` - Callback when translation is manually edited
27. `OnRetranslate` - Callback to trigger re-translation
28. `OnBulkAction` - Callback for bulk operations
29. `OnLanguageChange` - Callback when language preference changes

#### State Management Types
30. `TranslationPreviewState` - State for preview panel hook
31. `TranslationStatusSummary` - Summary counts by status

### Step 3: Create Barrel Export File
Create `index.ts` with exports for public consumption.

**Exports:**
- All public types from `TranslationManagement.types.ts`
- Placeholder export comment for future components

### Step 4: Verification
- Run TypeScript compilation to verify no errors
- Verify imports work correctly from barrel export
- Confirm types align with Implementation Plan contracts

## Authorized Files and Functions for Modification

### New Files to Create

#### `/src/components/TranslationManagement/index.ts`
- **Purpose**: Barrel export file for clean imports
- **Exports**:
  - All public types from `TranslationManagement.types.ts`
  - Future: Component exports (Tasks 2.2+)

#### `/src/components/TranslationManagement/TranslationManagement.types.ts`
- **Purpose**: Central TypeScript type definitions for TranslationManagement
- **Types to define**:

##### Language and Status Literals (Per Implementation Plan & PRD)
```typescript
/**
 * Supported language codes for translation.
 * Matches the 6 languages defined in Epic 1 Foundation PRD.
 */
export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

/**
 * Translation status values.
 * Matches the translation_status enum from Epic 1 database schema.
 */
export type TranslationStatusValue = 'pending' | 'processing' | 'completed' | 'failed' | 'manual';

/**
 * Entity types that support translation.
 * Maps to the translation tables: article_translations, item_translations, link_translations.
 */
export type EntityType = 'article' | 'item' | 'link';
```

##### Translation Content and Records (Per Implementation Plan State Management)
```typescript
/**
 * Translated content structure.
 * Fields are optional as not all entity types have all fields.
 */
export interface TranslationContent {
  /** Translated title (for articles, links) */
  title?: string;
  /** Translated description (for articles, items) */
  description?: string;
  /** Translated name (for items) */
  name?: string;
}

/**
 * Complete translation record with metadata.
 */
export interface TranslationRecord {
  /** Unique identifier for the translation record */
  id: string;
  /** Language code for this translation */
  language: SupportedLanguage;
  /** Translation status */
  status: TranslationStatusValue;
  /** Translated content */
  content: TranslationContent;
  /** When translation was completed */
  translatedAt?: string;
  /** User ID who manually reviewed (if manual status) */
  reviewedBy?: string;
  /** Whether the translation is stale (source updated after translation) */
  isStale?: boolean;
  /** Source content version timestamp for stale detection */
  sourceVersionAt?: string;
  /** Record creation timestamp */
  createdAt: string;
  /** Record update timestamp */
  updatedAt: string;
}
```

##### API Response Types (Per Implementation Plan Integration Contract)
```typescript
/**
 * Response from GET /api/translations/status endpoint.
 */
export interface TranslationStatusResponse {
  /** Summary counts by status */
  summary: TranslationStatusSummary;
  /** Detailed item-level status information */
  items: TranslationStatusItem[];
}

/**
 * Summary counts grouped by translation status.
 */
export interface TranslationStatusSummary {
  /** Total number of translation records */
  total: number;
  /** Number of completed translations */
  complete: number;
  /** Number of partially translated entities */
  partial: number;
  /** Number of pending translations */
  pending: number;
  /** Number of failed translations */
  failed: number;
}
```

##### Component Props (Per Implementation Plan)
```typescript
/**
 * Props for the TranslationPreviewPanel component.
 * Slide-in panel showing translation status after content save.
 */
export interface TranslationPreviewPanelProps {
  /** Entity type being previewed */
  entityType: EntityType;
  /** Entity ID */
  entityId: string;
  /** Source language of the content */
  sourceLanguage: SupportedLanguage;
  /** Source content for comparison */
  sourceContent: TranslationContent;
  /** Whether panel is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Optional: Callback when translation is manually edited */
  onTranslationEdited?: (language: SupportedLanguage) => void;
}

/**
 * Props for the TranslationEditor component.
 * Modal dialog for editing a single translation.
 */
export interface TranslationEditorProps {
  /** Translation to edit */
  translation: {
    language: SupportedLanguage;
    content: TranslationContent;
    status: TranslationStatusValue;
  };
  /** Source content for side-by-side comparison */
  sourceContent: TranslationContent;
  /** Source language */
  sourceLanguage: SupportedLanguage;
  /** Whether editor is open */
  isOpen: boolean;
  /** Save handler */
  onSave: (updated: TranslationContent) => Promise<void>;
  /** Cancel handler */
  onCancel: () => void;
}
```

### Directories to Create
- `/src/components/TranslationManagement/` - Root directory
- `/src/components/TranslationManagement/TranslationPreviewPanel/` - Preview panel components
- `/src/components/TranslationManagement/TranslationEditor/` - Editor modal components
- `/src/components/TranslationManagement/TranslationStatusWidget/` - Dashboard widget components
- `/src/components/TranslationManagement/TranslationStatusColumn/` - Table column components
- `/src/components/TranslationManagement/TranslationStatusFilter/` - Filter dropdown components
- `/src/components/TranslationManagement/BulkTranslationBar/` - Bulk action components
- `/src/components/TranslationManagement/ManualEditWarning/` - Warning dialog components
- `/src/components/TranslationManagement/LanguagePreference/` - Language preference components

### Existing Files (No Modification Required)
This task does not require modification of any existing files. All changes are additive.

The following files may be imported from but NOT modified:
- `/src/types/index.ts` - May re-export new translation types (separate task if needed)

## Technical Specifications

### Supported Languages Constant
Per the PRD Epic 1 Foundation:

```typescript
/**
 * Array of all supported language codes.
 * Useful for iteration and validation.
 */
export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = [
  'en', 'fr', 'es', 'de', 'nl', 'it'
] as const;

/**
 * Default language for the application.
 */
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

/**
 * Language display names for UI.
 */
export const LANGUAGE_DISPLAY_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
  nl: 'Nederlands',
  it: 'Italiano',
};
```

### Status Icons Reference (From PRD)
For component implementation reference:

| Status | Icon | Color | Tailwind Class |
|--------|------|-------|----------------|
| Original | `●` | Blue | `text-blue-500` |
| Completed | `✓` | Green | `text-green-500` (#22C55E) |
| Manual | `✎` | Purple | `text-violet-500` (#8B5CF6) |
| Pending | `⏳` | Orange | `text-amber-500` (#F59E0B) |
| Failed | `❌` | Red | `text-red-500` (#EF4444) |
| Stale | `⚠️` | Yellow | `text-yellow-500` (#EAB308) |

### State Management Types (Per Implementation Plan)

```typescript
/**
 * State for the translation preview panel.
 * Managed by useTranslationPreview hook.
 */
export interface TranslationPreviewState {
  /** Whether the panel is open */
  isOpen: boolean;
  /** Entity type being previewed */
  entityType: EntityType | null;
  /** Entity ID */
  entityId: string | null;
  /** Source content for comparison */
  sourceContent: TranslationContent | null;
  /** Source language */
  sourceLanguage: SupportedLanguage;
  /** Translation status for all languages */
  translations: TranslationStatusMap;
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
}

/**
 * Map of language codes to translation status information.
 */
export type TranslationStatusMap = Partial<Record<SupportedLanguage, TranslationStatusInfo>>;

/**
 * Status information for a single language translation.
 */
export interface TranslationStatusInfo {
  /** Current translation status */
  status: TranslationStatusValue;
  /** Translated content (if completed) */
  content?: TranslationContent;
  /** When translation was completed */
  translatedAt?: string;
  /** Whether source content has changed since translation */
  isStale?: boolean;
  /** User ID who reviewed (for manual status) */
  reviewedBy?: string;
}
```

### Filter and Query Types

```typescript
/**
 * Filter criteria for querying translation status.
 */
export interface TranslationFilterCriteria {
  /** Filter by entity type */
  entityType?: EntityType;
  /** Filter by specific entity ID */
  entityId?: string;
  /** Filter by translation status */
  status?: TranslationStatusValue | TranslationStatusValue[];
  /** Filter by property ID (for property-scoped queries) */
  propertyId?: string;
  /** Filter by language */
  language?: SupportedLanguage;
}

/**
 * Sort options for translation lists.
 */
export type TranslationSortOption =
  | 'entity-asc'
  | 'entity-desc'
  | 'status-asc'
  | 'status-desc'
  | 'updated-desc'
  | 'updated-asc';

/**
 * Complete query parameters for translation API.
 */
export interface TranslationQueryParams extends TranslationFilterCriteria {
  /** Sort option */
  sortBy?: TranslationSortOption;
  /** Pagination offset */
  offset?: number;
  /** Pagination limit */
  limit?: number;
}
```

### API Request/Response Types (Per Integration Contract)

```typescript
/**
 * Status item in the translation status response.
 */
export interface TranslationStatusItem {
  /** Entity type */
  entityType: EntityType;
  /** Entity ID */
  entityId: string;
  /** Display name for the entity */
  name: string;
  /** Source language of the content */
  sourceLanguage: SupportedLanguage;
  /** Translation status for each language */
  translations: TranslationStatusMap;
}

/**
 * Request payload for updating a translation.
 * PUT /api/translations/{entityType}/{entityId}/{language}
 */
export interface UpdateTranslationRequest {
  /** Updated title */
  title?: string;
  /** Updated description */
  description?: string;
  /** Updated name */
  name?: string;
}

/**
 * Response from updating a translation.
 */
export interface UpdateTranslationResponse {
  /** Whether the update succeeded */
  success: boolean;
  /** Updated translation record */
  translation: {
    language: SupportedLanguage;
    status: 'manual';
    reviewedBy: string;
    updatedAt: string;
  };
}

/**
 * Request payload for re-translation.
 * POST /api/translations/retranslate
 */
export interface RetranslateRequest {
  /** Entities to re-translate */
  entities: { type: EntityType; id: string }[];
  /** Specific languages to re-translate (all if omitted) */
  languages?: SupportedLanguage[];
  /** Whether to overwrite manually edited translations */
  overwriteManual?: boolean;
}

/**
 * Response from re-translation request.
 */
export interface RetranslateResponse {
  /** Whether the request succeeded */
  success: boolean;
  /** Number of translation jobs queued */
  jobsQueued: number;
  /** Number of translations skipped (due to manual edit protection) */
  skipped: number;
  /** Reason for skipped translations */
  skippedReason?: string;
}
```

### Callback Function Types

```typescript
/**
 * Callback when a translation is manually edited.
 */
export type OnTranslationEdited = (language: SupportedLanguage) => void;

/**
 * Callback to trigger re-translation.
 */
export type OnRetranslate = (
  entityType: EntityType,
  entityId: string,
  languages?: SupportedLanguage[],
  overwriteManual?: boolean
) => Promise<void>;

/**
 * Callback for bulk translation operations.
 */
export type OnBulkTranslationAction = (
  action: 'retranslate' | 'retry-failed',
  entityIds: string[],
  options?: { languages?: SupportedLanguage[]; overwriteManual?: boolean }
) => Promise<void>;

/**
 * Callback when language preference changes.
 */
export type OnLanguagePreferenceChange = (language: SupportedLanguage) => Promise<void>;
```

### Additional Component Props

```typescript
/**
 * Props for TranslationStatusWidget dashboard component.
 */
export interface TranslationStatusWidgetProps {
  /** Property ID to scope status (null for all properties) */
  propertyId?: string | null;
  /** Callback when "View Details" is clicked */
  onViewDetails?: () => void;
  /** Optional CSS class */
  className?: string;
}

/**
 * Props for TranslationStatusColumn table component.
 */
export interface TranslationStatusColumnProps {
  /** Translation status map for the entity */
  translations: TranslationStatusMap;
  /** Source language of the entity */
  sourceLanguage: SupportedLanguage;
  /** Callback when clicked */
  onClick?: () => void;
  /** Optional CSS class */
  className?: string;
}

/**
 * Props for TranslationStatusFilter dropdown component.
 */
export interface TranslationStatusFilterProps {
  /** Currently selected status filter */
  value: TranslationStatusValue | 'all' | 'fully-translated' | 'partially-translated';
  /** Callback when filter changes */
  onChange: (value: TranslationStatusValue | 'all' | 'fully-translated' | 'partially-translated') => void;
  /** Optional CSS class */
  className?: string;
}

/**
 * Props for BulkTranslationBar component.
 */
export interface BulkTranslationBarProps {
  /** Number of selected items */
  selectedCount: number;
  /** Callback for re-translate all action */
  onRetranslateAll: () => void;
  /** Callback for re-translate specific languages */
  onRetranslateLanguages: () => void;
  /** Callback for retry failed translations */
  onRetryFailed: () => void;
  /** Callback to exit selection mode */
  onExitSelection: () => void;
  /** Loading state during bulk operation */
  loading?: boolean;
  /** Optional CSS class */
  className?: string;
}

/**
 * Props for LanguageSelectorDialog component.
 */
export interface LanguageSelectorDialogProps {
  /** Whether dialog is open */
  isOpen: boolean;
  /** Pre-selected languages */
  selectedLanguages?: SupportedLanguage[];
  /** Callback when selection is confirmed */
  onConfirm: (languages: SupportedLanguage[]) => void;
  /** Callback when dialog is cancelled */
  onCancel: () => void;
  /** Dialog title */
  title?: string;
}

/**
 * Props for ManualEditWarningDialog component.
 */
export interface ManualEditWarningDialogProps {
  /** Whether dialog is open */
  isOpen: boolean;
  /** Languages that have manual edits */
  affectedLanguages: SupportedLanguage[];
  /** Callback when user chooses to keep manual edits */
  onKeepManualEdits: () => void;
  /** Callback when user chooses to overwrite manual edits */
  onOverwriteManualEdits: () => void;
  /** Callback when dialog is cancelled */
  onCancel: () => void;
}

/**
 * Props for LanguagePreferenceSection component.
 */
export interface LanguagePreferenceSectionProps {
  /** Current language preference */
  currentLanguage: SupportedLanguage;
  /** Callback when preference changes */
  onLanguageChange: OnLanguagePreferenceChange;
  /** Loading state during save */
  loading?: boolean;
  /** Optional CSS class */
  className?: string;
}
```

## Success Validation Checklist

### Directory Structure
- [ ] `/src/components/TranslationManagement/` directory exists
- [ ] `/src/components/TranslationManagement/TranslationPreviewPanel/` directory exists
- [ ] `/src/components/TranslationManagement/TranslationEditor/` directory exists
- [ ] `/src/components/TranslationManagement/TranslationStatusWidget/` directory exists
- [ ] `/src/components/TranslationManagement/TranslationStatusColumn/` directory exists
- [ ] `/src/components/TranslationManagement/TranslationStatusFilter/` directory exists
- [ ] `/src/components/TranslationManagement/BulkTranslationBar/` directory exists
- [ ] `/src/components/TranslationManagement/ManualEditWarning/` directory exists
- [ ] `/src/components/TranslationManagement/LanguagePreference/` directory exists

### Type Definitions
- [ ] `TranslationManagement.types.ts` contains all required types
- [ ] `SupportedLanguage` type is defined with all 6 languages
- [ ] `TranslationStatusValue` type is defined with all status values
- [ ] `EntityType` type is defined
- [ ] `TranslationContent` interface is defined
- [ ] `TranslationRecord` interface is defined
- [ ] `TranslationStatusResponse` interface is defined
- [ ] `TranslationStatusSummary` interface is defined
- [ ] `TranslationStatusMap` type is defined
- [ ] `TranslationStatusItem` interface is defined
- [ ] `UpdateTranslationRequest` interface is defined
- [ ] `UpdateTranslationResponse` interface is defined
- [ ] `RetranslateRequest` interface is defined
- [ ] `RetranslateResponse` interface is defined
- [ ] `TranslationFilterCriteria` interface is defined
- [ ] `TranslationSortOption` type is defined
- [ ] `TranslationQueryParams` interface is defined
- [ ] `TranslationPreviewPanelProps` interface is defined
- [ ] `TranslationEditorProps` interface is defined
- [ ] `TranslationStatusWidgetProps` interface is defined
- [ ] `TranslationStatusColumnProps` interface is defined
- [ ] `TranslationStatusFilterProps` interface is defined
- [ ] `BulkTranslationBarProps` interface is defined
- [ ] `LanguageSelectorDialogProps` interface is defined
- [ ] `ManualEditWarningDialogProps` interface is defined
- [ ] `LanguagePreferenceSectionProps` interface is defined
- [ ] All callback types are defined
- [ ] All types have JSDoc comments
- [ ] `SUPPORTED_LANGUAGES` constant is defined
- [ ] `DEFAULT_LANGUAGE` constant is defined
- [ ] `LANGUAGE_DISPLAY_NAMES` constant is defined

### Barrel Export
- [ ] `index.ts` exports all public types
- [ ] Import `@/components/TranslationManagement` resolves correctly
- [ ] Named imports work for all types

### Compilation
- [ ] `npm run build` completes without TypeScript errors
- [ ] No unused export warnings
- [ ] No type conflicts with existing codebase

## Notes

### Pattern Alignment
- Follow existing project conventions observed in `src/components/ItemManager/ItemManager.types.ts`
- Mirror the ItemManager types file structure and documentation style
- Use JSDoc comments for interface properties
- Export types using ES module syntax
- Use descriptive section comments

### Future Integration Points
- Types will be consumed by hooks (Tasks 2.6, 2.7)
- Component props will be used by all TranslationManagement components
- API types align with the Integration Contract in the Implementation Plan
- Filter types will be used by the TranslationStatusFilter component
- State types will be used by useTranslationPreview and useTranslationStatus hooks

### Relationship to Epic 1 Database Schema
The types in this file must align with the database schema from Epic 1:
- `SupportedLanguage` → `language` VARCHAR(5) column in translation tables
- `TranslationStatusValue` → `translation_status` VARCHAR(20) column
- `TranslationContent` fields map to translated columns in each table
- `TranslationRecord` maps to rows in translation tables

### Relationship to API Contracts
The API types directly implement the Integration Contract from the Implementation Plan:
- `TranslationStatusResponse` → GET /api/translations/status response
- `UpdateTranslationRequest/Response` → PUT /api/translations/{entityType}/{entityId}/{language}
- `RetranslateRequest/Response` → POST /api/translations/retranslate

## Dependencies
- TypeScript 5.x (existing in project)
- React 19.x types (existing in project)
- No new npm packages required
- No runtime dependencies (types-only file)

## Risk Assessment
- **Risk Level**: Low
- **Rationale**:
  - Purely additive changes (no modifications to existing code)
  - Type-only files have no runtime impact
  - Standard directory creation operations
  - No external dependencies
  - Mirror of proven ItemManager pattern
  - All types derived from reviewed Implementation Plan and PRD
  - Dependent on Epic 1/Epic 3 completing (documented prerequisite)
