# REQ-341: Create TranslationManagement Types File - Detailed Task Breakdown

**Date Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request Reference:** REQ-341 (Epic 5 - Owner Translation Management)
**Overview Document:** REQ-341-create-translationmanagement-types-file-overview.md
**Implementation Plan:** Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Phase:** 2 - Core UI Components
**Task ID:** 2.1
**Size:** S (Small)
**Estimated Effort:** ~90 minutes

---

## Table of Contents

1. [Summary](#1-summary)
2. [Prerequisites](#2-prerequisites)
3. [Implementation Tasks](#3-implementation-tasks)
4. [Verification Checklist](#4-verification-checklist)
5. [Acceptance Criteria Mapping](#5-acceptance-criteria-mapping)
6. [File Reference](#6-file-reference)

---

## 1. Summary

Create a centralized TypeScript type definitions file at `/src/components/TranslationManagement/TranslationManagement.types.ts` that exports all shared interfaces and types used across translation management UI components. This file establishes the type foundation for Epic 5's translation management features.

---

## 2. Prerequisites

### 2.1 Required Dependencies (Already Exist)

| File | Purpose | Status |
|------|---------|--------|
| `/src/lib/translation-service/translation-service.types.ts` | Core types: `SupportedLanguage`, `TranslationStatus`, `TranslatableEntityType` | EXISTS |
| `/src/lib/i18n/config.ts` | Locale configuration | EXISTS |
| `/src/components/ItemManager/ItemManager.types.ts` | Pattern reference for TypeScript conventions | EXISTS |

### 2.2 Pre-Implementation Verification

Before starting, verify these types are available for import:

```bash
# Verify translation-service types exist
cat /src/lib/translation-service/translation-service.types.ts | head -50
```

Expected exports from `translation-service.types.ts`:
- `SupportedLanguage` = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it'
- `TranslationStatus` = 'pending' | 'processing' | 'completed' | 'failed' | 'manual'
- `TranslatableEntityType` = 'article' | 'item' | 'link' | 'tag'

---

## 3. Implementation Tasks

### Task 1: Create Directory Structure

**Objective:** Create the TranslationManagement component directory.

**Steps:**

1.1. Create the directory:
```bash
mkdir -p /src/components/TranslationManagement
```

1.2. Verify directory creation:
```bash
ls -la /src/components/TranslationManagement
```

**Deliverable:** Empty `/src/components/TranslationManagement/` directory

**Estimated Time:** 2 minutes

---

### Task 2: Create Types File with Module Header

**Objective:** Create the types file with proper documentation header following project conventions.

**File:** `/src/components/TranslationManagement/TranslationManagement.types.ts`

**Steps:**

2.1. Create the file with module-level documentation:

```typescript
/**
 * TranslationManagement Component Type Definitions
 *
 * This file contains all TypeScript interfaces and types for the TranslationManagement
 * component system. These types define data structures for translation records,
 * status tracking, filtering/sorting, and component props.
 *
 * @module TranslationManagement/types
 * @see docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
 * @lastModified 2026-01-19 (REQ-341)
 */

// Re-export core types from translation-service for convenience
export type {
  SupportedLanguage,
  TranslationStatus,
  TranslatableEntityType,
} from '@/lib/translation-service/translation-service.types';

// Import types needed for internal use
import type {
  SupportedLanguage,
  TranslationStatus,
  TranslatableEntityType,
} from '@/lib/translation-service/translation-service.types';
```

**Pattern Reference:** Follow header style from `/src/components/ItemManager/ItemManager.types.ts`

**Estimated Time:** 5 minutes

---

### Task 3: Add Core Translation Content Types

**Objective:** Define interfaces for translation content data structures.

**Add to file:**

```typescript
// =============================================================================
// Core Content Types
// =============================================================================

/**
 * Content structure for translated text fields.
 * Used across different entity types (articles, items, links).
 *
 * @description Different entity types use different subsets of these fields:
 * - Articles: title, description
 * - Items: name, description
 * - Links: title
 * - Tags: name only
 */
export interface TranslationContent {
  /** Translated title (for articles, links) */
  title?: string;

  /** Translated description (for articles, items) */
  description?: string;

  /** Translated name (for items, tags) */
  name?: string;
}

/**
 * Complete translation record as consumed by UI components.
 * Represents a single translation for a specific entity and language.
 */
export interface TranslationRecord {
  /** Type of entity this translation belongs to */
  entityType: TranslatableEntityType;

  /** UUID of the source entity */
  entityId: string;

  /** Target language code for this translation */
  language: SupportedLanguage;

  /** Translated content fields */
  content: TranslationContent;

  /** Current status of the translation */
  status: TranslationStatus;

  /** ISO 8601 timestamp when translation was completed */
  translatedAt?: string;

  /** User ID who last reviewed/edited this translation */
  reviewedBy?: string;

  /** Whether the source content has changed since translation */
  isStale?: boolean;

  /** ISO 8601 timestamp of source content version used for translation */
  sourceVersionAt?: string;
}
```

**Estimated Time:** 10 minutes

---

### Task 4: Add Filter and Sort Parameter Types

**Objective:** Define interfaces for filtering and sorting translations.

**Add to file:**

```typescript
// =============================================================================
// Filter & Sort Types
// =============================================================================

/**
 * Parameters for filtering translation lists.
 * All fields are optional - omitted fields are not applied as filters.
 */
export interface TranslationFilterParams {
  /** Filter by entity type(s) */
  entityType?: TranslatableEntityType | TranslatableEntityType[];

  /** Filter by language(s) */
  language?: SupportedLanguage | SupportedLanguage[];

  /** Filter by translation status(es) */
  status?: TranslationStatus | TranslationStatus[];

  /** Filter by property ID (for property-scoped views) */
  propertyId?: string;

  /** Filter to only stale translations */
  isStale?: boolean;
}

/**
 * Available fields for sorting translation lists.
 */
export type TranslationSortField =
  | 'entityName'
  | 'language'
  | 'status'
  | 'translatedAt'
  | 'updatedAt';

/**
 * Sort direction for list ordering.
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Parameters for sorting translation lists.
 */
export interface TranslationSortParams {
  /** Field to sort by */
  field: TranslationSortField;

  /** Sort direction */
  direction: SortDirection;
}
```

**Estimated Time:** 8 minutes

---

### Task 5: Add API Response Types

**Objective:** Define types matching the API contracts from Plan-111.

**Add to file:**

```typescript
// =============================================================================
// API Response Types
// =============================================================================

/**
 * Summary counts for translation status overview.
 * Used by dashboard widgets and status displays.
 */
export interface TranslationSummary {
  /** Total number of translatable entities */
  total: number;

  /** Entities with all translations complete */
  complete: number;

  /** Entities with some translations complete */
  partial: number;

  /** Entities with pending translations */
  pending: number;

  /** Entities with failed translations */
  failed: number;
}

/**
 * Translation status entry for a single language.
 * Used within TranslationStatusMap.
 */
export interface TranslationStatusEntry {
  /** Current status of this translation */
  status: TranslationStatus;

  /** Whether the translation is stale (source changed) */
  isStale?: boolean;

  /** ISO 8601 timestamp when translation was completed */
  translatedAt?: string;

  /** User ID who reviewed/edited this translation */
  reviewedBy?: string;
}

/**
 * Map of language codes to their translation status.
 * Partial because not all languages may have translations.
 */
export type TranslationStatusMap = Partial<Record<SupportedLanguage, TranslationStatusEntry>>;

/**
 * Single item in a translation status list.
 * Represents one translatable entity with all its translation statuses.
 */
export interface TranslationStatusItem {
  /** Type of entity */
  entityType: TranslatableEntityType;

  /** Entity UUID */
  entityId: string;

  /** Display name of the entity (title/name) */
  name: string;

  /** Source language of the original content */
  sourceLanguage: SupportedLanguage;

  /** Status of translations for each target language */
  translations: TranslationStatusMap;
}

/**
 * Response from GET /api/translations/status endpoint.
 * Contains summary counts and per-entity translation statuses.
 */
export interface TranslationStatusResponse {
  /** Aggregate counts by status */
  summary: TranslationSummary;

  /** List of entities with their translation statuses */
  items: TranslationStatusItem[];
}

/**
 * Request body for PUT /api/translations/{entityType}/{entityId}/{language}.
 */
export interface UpdateTranslationRequest {
  /** Updated title (for articles, links) */
  title?: string;

  /** Updated description (for articles, items) */
  description?: string;

  /** Updated name (for items, tags) */
  name?: string;
}

/**
 * Response from PUT /api/translations/{entityType}/{entityId}/{language}.
 */
export interface UpdateTranslationResponse {
  /** Whether the update succeeded */
  success: boolean;

  /** Updated translation details */
  translation?: {
    language: SupportedLanguage;
    status: 'manual';
    reviewedBy: string;
    updatedAt: string;
  };

  /** Error message if update failed */
  error?: string;
}

/**
 * Request body for POST /api/translations/retranslate endpoint.
 */
export interface RetranslateRequest {
  /** Entities to re-translate */
  entities: { type: TranslatableEntityType; id: string }[];

  /** Target languages (all non-source languages if omitted) */
  languages?: SupportedLanguage[];

  /** Whether to overwrite manual translations */
  overwriteManual?: boolean;
}

/**
 * Response from POST /api/translations/retranslate endpoint.
 */
export interface RetranslateResponse {
  /** Whether the operation succeeded */
  success: boolean;

  /** Number of translation jobs queued */
  jobsQueued: number;

  /** Number of translations skipped */
  skipped: number;

  /** Reason for skipped translations (e.g., "manual edits preserved") */
  skippedReason?: string;
}
```

**Estimated Time:** 15 minutes

---

### Task 6: Add Component Props Types

**Objective:** Define prop interfaces for all translation management UI components.

**Add to file:**

```typescript
// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Props for TranslationStatusIndicator component.
 * Compact status display with icon and optional label.
 *
 * @see TranslationStatusItem.tsx
 */
export interface TranslationStatusIndicatorProps {
  /** Translation status to display */
  status: TranslationStatus;

  /** Whether the translation is stale */
  isStale?: boolean;

  /** Whether to show the status label text */
  showLabel?: boolean;

  /** Size variant for the indicator */
  size?: 'sm' | 'md' | 'lg';

  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for TranslationPreviewPanel component.
 * Slide-in panel showing all translations for an entity.
 *
 * @see TranslationPreviewPanel.tsx
 */
export interface TranslationPreviewPanelProps {
  /** Type of entity being previewed */
  entityType: TranslatableEntityType;

  /** Entity UUID */
  entityId: string;

  /** Source language of the original content */
  sourceLanguage: SupportedLanguage;

  /** Source content for comparison display */
  sourceContent: TranslationContent;

  /** Whether the panel is open */
  isOpen: boolean;

  /** Callback to close the panel */
  onClose: () => void;

  /** Callback when a translation is manually edited */
  onTranslationEdited?: (language: SupportedLanguage) => void;
}

/**
 * Props for TranslationEditor component.
 * Modal dialog for editing a single translation with side-by-side comparison.
 *
 * @see TranslationEditor.tsx
 */
export interface TranslationEditorProps {
  /** Translation to edit */
  translation: {
    /** Target language */
    language: SupportedLanguage;
    /** Current translated content */
    content: TranslationContent;
    /** Current status */
    status: TranslationStatus;
  };

  /** Original source content for comparison */
  sourceContent: TranslationContent;

  /** Source language for display */
  sourceLanguage: SupportedLanguage;

  /** Whether the editor modal is open */
  isOpen: boolean;

  /** Callback to save the edited translation */
  onSave: (updated: TranslationContent) => Promise<void>;

  /** Callback to cancel editing */
  onCancel: () => void;
}

/**
 * Props for TranslationStatusWidget component.
 * Dashboard summary widget showing translation status overview.
 *
 * @see TranslationStatusWidget.tsx
 */
export interface TranslationStatusWidgetProps {
  /** Property ID to scope the status summary */
  propertyId?: string;

  /** Callback when "View Details" is clicked */
  onViewDetails?: () => void;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for TranslationStatusColumn component.
 * Compact column showing translation status for all languages.
 *
 * @see TranslationStatusColumn.tsx
 */
export interface TranslationStatusColumnProps {
  /** Translation status for each language */
  translations: TranslationStatusMap;

  /** Source language (shown differently) */
  sourceLanguage: SupportedLanguage;

  /** Callback when the column is clicked */
  onClick?: () => void;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for TranslationStatusFilter component.
 * Dropdown filter for translation status in list views.
 *
 * @see TranslationStatusFilter.tsx
 */
export interface TranslationStatusFilterProps {
  /** Currently selected status filter(s) */
  value: TranslationStatus | TranslationStatus[] | null;

  /** Callback when filter selection changes */
  onChange: (status: TranslationStatus | TranslationStatus[] | null) => void;

  /** Whether to allow multiple status selection */
  multiple?: boolean;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for BulkTranslationBar component.
 * Action bar for bulk translation operations on selected items.
 *
 * @see BulkTranslationBar.tsx
 */
export interface BulkTranslationBarProps {
  /** Number of selected items */
  selectedCount: number;

  /** Selected entity IDs with their types */
  selectedEntities: { type: TranslatableEntityType; id: string }[];

  /** Callback to re-translate selected items */
  onRetranslate: OnRetranslateCallback;

  /** Callback to clear selection */
  onClearSelection: () => void;

  /** Whether a bulk operation is in progress */
  isLoading?: boolean;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for LanguageSelectorDialog component.
 * Modal for selecting languages for bulk operations.
 *
 * @see LanguageSelectorDialog.tsx
 */
export interface LanguageSelectorDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;

  /** Dialog title */
  title: string;

  /** Currently selected languages */
  selectedLanguages: SupportedLanguage[];

  /** Callback when selection changes */
  onSelectionChange: (languages: SupportedLanguage[]) => void;

  /** Callback when confirmed */
  onConfirm: () => void;

  /** Callback when cancelled */
  onCancel: () => void;

  /** Source language to exclude from selection */
  excludeLanguage?: SupportedLanguage;
}

/**
 * Props for TranslationProgressBar component.
 * Visual progress indicator for translation completion.
 *
 * @see TranslationProgressBar.tsx
 */
export interface TranslationProgressBarProps {
  /** Number of completed translations */
  completed: number;

  /** Total number of translations expected */
  total: number;

  /** Whether to show the count label (e.g., "3/5") */
  showLabel?: boolean;

  /** Whether to animate during processing */
  isAnimating?: boolean;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for ManualEditWarningDialog component.
 * Warning dialog shown when source content changes affect manual translations.
 *
 * @see ManualEditWarningDialog.tsx
 */
export interface ManualEditWarningDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;

  /** Languages with manual translations that would be affected */
  affectedLanguages: SupportedLanguage[];

  /** Callback to keep manual edits and mark as stale */
  onKeepManual: () => void;

  /** Callback to re-translate (overwrites manual edits) */
  onRetranslate: () => void;

  /** Callback to cancel the source update */
  onCancel: () => void;
}
```

**Estimated Time:** 20 minutes

---

### Task 7: Add Callback Function Types

**Objective:** Define callback type signatures for translation operations.

**Add to file:**

```typescript
// =============================================================================
// Callback Function Types
// =============================================================================

/**
 * Result type for re-translation operations.
 */
export interface RetranslateResult {
  /** Whether the operation succeeded */
  success: boolean;

  /** Number of translation jobs queued */
  jobsQueued: number;

  /** Number of translations skipped */
  skipped: number;

  /** Reason for skipped translations */
  skippedReason?: string;
}

/**
 * Result type for save translation operations.
 */
export interface SaveTranslationResult {
  /** Whether the save succeeded */
  success: boolean;

  /** Updated translation details */
  translation?: {
    language: SupportedLanguage;
    status: 'manual';
    reviewedBy: string;
    updatedAt: string;
  };

  /** Error message if save failed */
  error?: string;
}

/**
 * Callback for triggering re-translation of content.
 *
 * @param entities - Entities to re-translate
 * @param languages - Target languages (optional, defaults to all non-source)
 * @param overwriteManual - Whether to overwrite manual translations
 * @returns Promise resolving to operation result
 */
export type OnRetranslateCallback = (
  entities: { type: TranslatableEntityType; id: string }[],
  languages?: SupportedLanguage[],
  overwriteManual?: boolean
) => Promise<RetranslateResult>;

/**
 * Callback for saving manual translation edits.
 *
 * @param entityType - Type of entity being translated
 * @param entityId - UUID of the entity
 * @param language - Target language
 * @param content - Updated translation content
 * @returns Promise resolving to save result
 */
export type OnSaveTranslationCallback = (
  entityType: TranslatableEntityType,
  entityId: string,
  language: SupportedLanguage,
  content: TranslationContent
) => Promise<SaveTranslationResult>;

/**
 * Callback for handling translation status change events.
 * Used for real-time updates via Supabase subscriptions.
 *
 * @param entityType - Type of entity
 * @param entityId - UUID of the entity
 * @param language - Language that changed
 * @param newStatus - New translation status
 */
export type OnStatusChangeCallback = (
  entityType: TranslatableEntityType,
  entityId: string,
  language: SupportedLanguage,
  newStatus: TranslationStatus
) => void;

/**
 * Callback for handling translation preview requests.
 *
 * @param entityType - Type of entity to preview
 * @param entityId - UUID of the entity
 */
export type OnPreviewTranslationsCallback = (
  entityType: TranslatableEntityType,
  entityId: string
) => void;
```

**Estimated Time:** 10 minutes

---

### Task 8: Add Utility Types and Constants

**Objective:** Add utility types and constants for translation UI.

**Add to file:**

```typescript
// =============================================================================
// Utility Types & Constants
// =============================================================================

/**
 * Status icon configuration for UI display.
 * Maps translation status to icon and color.
 */
export interface StatusIconConfig {
  /** Unicode icon character */
  icon: string;

  /** Tailwind color class */
  colorClass: string;

  /** Human-readable label */
  label: string;
}

/**
 * Status icon configuration map.
 * Use this for consistent status display across components.
 */
export const TRANSLATION_STATUS_CONFIG: Record<TranslationStatus | 'stale', StatusIconConfig> = {
  pending: {
    icon: '⏳',
    colorClass: 'text-amber-500',
    label: 'Pending',
  },
  processing: {
    icon: '⟳',
    colorClass: 'text-blue-500',
    label: 'Processing',
  },
  completed: {
    icon: '✓',
    colorClass: 'text-green-500',
    label: 'Completed',
  },
  failed: {
    icon: '❌',
    colorClass: 'text-red-500',
    label: 'Failed',
  },
  manual: {
    icon: '✎',
    colorClass: 'text-violet-500',
    label: 'Manual',
  },
  stale: {
    icon: '⚠️',
    colorClass: 'text-yellow-500',
    label: 'Stale',
  },
};

/**
 * Translation preview panel state for hook management.
 */
export interface TranslationPreviewState {
  /** Whether the panel is open */
  isOpen: boolean;

  /** Entity type being previewed */
  entityType: TranslatableEntityType | null;

  /** Entity ID being previewed */
  entityId: string | null;

  /** Source content for comparison */
  sourceContent: TranslationContent | null;

  /** Source language */
  sourceLanguage: SupportedLanguage;

  /** Current translations by language */
  translations: TranslationStatusMap;

  /** Whether data is loading */
  isLoading: boolean;

  /** Error message if load failed */
  error: string | null;
}

/**
 * Initial state for translation preview.
 */
export const INITIAL_PREVIEW_STATE: TranslationPreviewState = {
  isOpen: false,
  entityType: null,
  entityId: null,
  sourceContent: null,
  sourceLanguage: 'en',
  translations: {},
  isLoading: false,
  error: null,
};
```

**Estimated Time:** 10 minutes

---

### Task 9: Create Index Export File

**Objective:** Create barrel export file for public API.

**File:** `/src/components/TranslationManagement/index.ts`

**Content:**

```typescript
/**
 * TranslationManagement Component Public API
 *
 * This barrel file exports all public types and (future) components
 * for the translation management system.
 *
 * @module TranslationManagement
 * @lastModified 2026-01-19 (REQ-341)
 */

// =============================================================================
// Type Exports
// =============================================================================

// Re-exported core types (from translation-service)
export type {
  SupportedLanguage,
  TranslationStatus,
  TranslatableEntityType,
} from './TranslationManagement.types';

// Core content types
export type {
  TranslationContent,
  TranslationRecord,
} from './TranslationManagement.types';

// Filter & sort types
export type {
  TranslationFilterParams,
  TranslationSortField,
  SortDirection,
  TranslationSortParams,
} from './TranslationManagement.types';

// API response types
export type {
  TranslationSummary,
  TranslationStatusEntry,
  TranslationStatusMap,
  TranslationStatusItem,
  TranslationStatusResponse,
  UpdateTranslationRequest,
  UpdateTranslationResponse,
  RetranslateRequest,
  RetranslateResponse,
} from './TranslationManagement.types';

// Component props types
export type {
  TranslationStatusIndicatorProps,
  TranslationPreviewPanelProps,
  TranslationEditorProps,
  TranslationStatusWidgetProps,
  TranslationStatusColumnProps,
  TranslationStatusFilterProps,
  BulkTranslationBarProps,
  LanguageSelectorDialogProps,
  TranslationProgressBarProps,
  ManualEditWarningDialogProps,
} from './TranslationManagement.types';

// Callback types
export type {
  RetranslateResult,
  SaveTranslationResult,
  OnRetranslateCallback,
  OnSaveTranslationCallback,
  OnStatusChangeCallback,
  OnPreviewTranslationsCallback,
} from './TranslationManagement.types';

// Utility types
export type {
  StatusIconConfig,
  TranslationPreviewState,
} from './TranslationManagement.types';

// Constants
export {
  TRANSLATION_STATUS_CONFIG,
  INITIAL_PREVIEW_STATE,
} from './TranslationManagement.types';
```

**Estimated Time:** 5 minutes

---

### Task 10: Verification and Testing

**Objective:** Verify types compile correctly and can be imported.

**Steps:**

10.1. Run TypeScript compilation check:
```bash
npx tsc --noEmit
```

10.2. Verify no errors in the new files.

10.3. Create a test import verification (can be deleted after verification):

```typescript
// Temporary verification file: /src/components/TranslationManagement/__test-import.ts
import type {
  TranslationRecord,
  TranslationStatus,
  TranslationFilterParams,
  TranslationPreviewPanelProps,
  OnRetranslateCallback,
  TranslationSummary,
} from './index';

// Type assertions to verify types are correctly defined
const testStatus: TranslationStatus = 'completed';
const testFilter: TranslationFilterParams = { status: 'pending' };
const testSummary: TranslationSummary = {
  total: 10,
  complete: 5,
  partial: 3,
  pending: 1,
  failed: 1,
};

export { testStatus, testFilter, testSummary };
```

10.4. Delete the test file after verification.

10.5. Run build to ensure no compilation errors:
```bash
npm run build
```

**Estimated Time:** 10 minutes

---

## 4. Verification Checklist

### 4.1 File Creation Checklist

- [ ] `/src/components/TranslationManagement/` directory exists
- [ ] `/src/components/TranslationManagement/TranslationManagement.types.ts` created
- [ ] `/src/components/TranslationManagement/index.ts` created

### 4.2 Type Definition Checklist

- [ ] `TranslationContent` interface exported
- [ ] `TranslationRecord` interface exported
- [ ] `TranslationFilterParams` interface exported
- [ ] `TranslationSortParams` interface exported
- [ ] `TranslationStatusResponse` interface exported
- [ ] `TranslationSummary` interface exported
- [ ] `TranslationStatusIndicatorProps` interface exported
- [ ] `TranslationPreviewPanelProps` interface exported
- [ ] `TranslationEditorProps` interface exported
- [ ] `OnRetranslateCallback` type exported
- [ ] `OnSaveTranslationCallback` type exported
- [ ] `OnStatusChangeCallback` type exported
- [ ] `TRANSLATION_STATUS_CONFIG` constant exported

### 4.3 Documentation Checklist

- [ ] Module-level JSDoc comment with @module, @see, @lastModified
- [ ] All interfaces have descriptive JSDoc comments
- [ ] All interface properties have inline documentation
- [ ] Section separators using `// =============================================================================`

### 4.4 Compilation Checklist

- [ ] `npx tsc --noEmit` passes with no errors
- [ ] `npm run build` succeeds
- [ ] Types can be imported from `@/components/TranslationManagement`

---

## 5. Acceptance Criteria Mapping

| Acceptance Criteria | Implementation Task |
|---------------------|---------------------|
| Types file created at specified path | Task 1, 2 |
| Translation record interface with entity ID, type, language, content, status, timestamps | Task 3 |
| Status enum/union type for pending, completed, failed, manual | Re-exported in Task 2 |
| Filter parameters interface | Task 4 |
| Sort parameters interface | Task 4 |
| Translation status indicator props | Task 6 |
| Translation preview panel props | Task 6 |
| Translation editor props | Task 6 |
| Re-translation callback signatures | Task 7 |
| Save operation callback signatures | Task 7 |
| Status change handler signatures | Task 7 |
| JSDoc comments on all exports | Tasks 2-8 |
| TypeScript compiler validates without errors | Task 10 |
| Types can be imported successfully | Task 9, 10 |
| Types align with database definitions | Task 3, 5 |
| Follows project conventions | All tasks |

---

## 6. File Reference

### 6.1 New Files Created

| File Path | Purpose | Lines (est.) |
|-----------|---------|--------------|
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | All type definitions | ~450 |
| `/src/components/TranslationManagement/index.ts` | Public exports | ~80 |

### 6.2 Files Referenced (Read Only)

| File Path | Reference Purpose |
|-----------|-------------------|
| `/src/lib/translation-service/translation-service.types.ts` | Core types to re-export |
| `/src/components/ItemManager/ItemManager.types.ts` | TypeScript conventions and patterns |
| `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` | API contracts and component specs |

### 6.3 Scope Boundaries

- **DO NOT** modify any existing files
- **DO NOT** create component implementations (types only)
- **DO NOT** add npm packages or dependencies
- **DO NOT** create database migrations

---

## Post-Implementation Notes

After completing this task:

1. **Next Task:** Task 2.2 - Create TranslationPreviewPanel component (uses `TranslationPreviewPanelProps`)
2. **Dependent Tasks:** All Phase 2-7 components depend on types from this file
3. **Update:** Mark REQ-341 as complete in the pipeline state

---

*Document generated for FAQBNB Localization Epic 5 - Task 2.1*
