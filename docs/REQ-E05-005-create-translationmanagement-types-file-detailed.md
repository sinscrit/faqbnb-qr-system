# REQ-E05-005: Create TranslationManagement Types File - Detailed Task Breakdown

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19 16:30 UTC
**Request ID:** REQ-E05-005
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 2 - Core UI Components
**Task ID:** 2.1
**Status:** Ready for Implementation

---

## 1. Document References

| Reference | Location |
|-----------|----------|
| Overview Document | `/docs/REQ-E05-005-create-translationmanagement-types-file-overview.md` |
| Requirements Document | `/docs/gen_requests_epic5.md` (REQ-E05-006) |
| Implementation Plan | `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` |
| Pattern Reference | `/src/components/ItemManager/ItemManager.types.ts` |
| Base Types Reference | `/src/lib/translation-service/translation-service.types.ts` |

---

## 2. Implementation Summary

Create a centralized TypeScript types file at `/src/components/TranslationManagement/TranslationManagement.types.ts` containing all shared interfaces, types, and enums for the Translation Management UI components. This types file serves as the single source of truth for data structures across the owner-facing translation management interface.

---

## 3. Acceptance Criteria Checklist

From REQ-E05-006 in gen_requests_epic5.md:

- [ ] File created at `/src/components/TranslationManagement/TranslationManagement.types.ts`
- [ ] Types define translation status display data structures (status, counts, percentages)
- [ ] Types define translation editor component props and state interfaces
- [ ] Types define translation job metadata structures (job ID, entity reference, language, priority)
- [ ] Types define language selector component props and option types
- [ ] Types define translation preview component props and content structure
- [ ] Enum types define translation status values matching database schema
- [ ] Enum types define entity types matching database schema
- [ ] Types include JSDoc comments explaining purpose and usage of complex structures
- [ ] All types export properly for use across translation management components
- [ ] Types integrate seamlessly with existing database types from generated definitions
- [ ] No circular dependencies exist between type definition files

---

## 4. Detailed Tasks

### Task 4.1: Create Directory Structure

**Objective:** Create the TranslationManagement component directory if it doesn't exist.

**File Operations:**
| Operation | Path |
|-----------|------|
| CREATE | `/src/components/TranslationManagement/` (directory) |

**Implementation Steps:**
1. Check if directory `/src/components/TranslationManagement/` exists
2. If not exists, create the directory

**Verification:**
- [ ] Directory `/src/components/TranslationManagement/` exists

**Estimated Effort:** 1 story point

---

### Task 4.2: Create Types File Header and Core Imports

**Objective:** Create the types file with the file header, module documentation, and necessary imports.

**File Operations:**
| Operation | Path |
|-----------|------|
| CREATE | `/src/components/TranslationManagement/TranslationManagement.types.ts` |

**Implementation Steps:**

1. Create file with comprehensive JSDoc module header following ItemManager.types.ts pattern
2. Add imports from `@/lib/translation-service/translation-service.types`
3. Add re-exports for convenience

**Code to Implement:**

```typescript
/**
 * TranslationManagement Component Type Definitions
 *
 * This file contains all TypeScript interfaces and types for the Translation
 * Management UI components. These types define component props, state interfaces,
 * API contracts, and hook return types for owner-facing translation management.
 *
 * @module TranslationManagement/types
 * @see docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
 * @lastModified 2026-01-19 (REQ-E05-005)
 */

import type {
  SupportedLanguage,
  TranslationStatus,
  TranslatableEntityType,
} from '@/lib/translation-service/translation-service.types';

// =============================================================================
// Re-exports for Convenience
// =============================================================================

/**
 * Re-export SupportedLanguage from translation-service for convenience.
 * Available values: 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it'
 */
export type { SupportedLanguage };

/**
 * Re-export TranslationStatus from translation-service for convenience.
 * Available values: 'pending' | 'processing' | 'completed' | 'failed' | 'manual'
 */
export type { TranslationStatus };

/**
 * Entity types manageable through the Translation Management UI.
 * Note: 'tag' is excluded as tag translations are system-level, not owner-managed.
 */
export type ManageableEntityType = 'article' | 'item' | 'link';
```

**Verification:**
- [ ] File created at correct path
- [ ] Imports resolve without errors
- [ ] Re-exports work correctly

**Estimated Effort:** 1 story point

---

### Task 4.3: Define Translation Content Types

**Objective:** Define types for translation content structures used throughout the UI.

**Implementation Steps:**

1. Add section header comment
2. Define `TranslationContent` interface for generic content structure
3. Define `SourceContent` interface extending with language information

**Code to Implement:**

```typescript
// =============================================================================
// Translation Content Types
// =============================================================================

/**
 * Generic structure for translatable content.
 * Used for both source and translated content across all entity types.
 *
 * @example
 * ```typescript
 * const articleContent: TranslationContent = {
 *   title: 'How to Use the Dishwasher',
 *   description: 'Load dishes on the lower and upper racks...'
 * };
 *
 * const itemContent: TranslationContent = {
 *   name: 'Kitchen Dishwasher',
 *   description: 'Bosch Series 500 dishwasher'
 * };
 * ```
 */
export interface TranslationContent {
  /** Title (for articles/links) */
  title?: string;
  /** Name field (for items) */
  name?: string;
  /** Description/body text (for all entity types) */
  description?: string;
}

/**
 * Source content with language information.
 * Used when displaying original content alongside translations.
 */
export interface SourceContent extends TranslationContent {
  /** Source language of the content */
  language: SupportedLanguage;
}
```

**Verification:**
- [ ] Types compile without errors
- [ ] JSDoc comments present on all interfaces and properties

**Estimated Effort:** 1 story point

---

### Task 4.4: Define Translation Status Display Types

**Objective:** Define types for displaying translation status information in the UI.

**Implementation Steps:**

1. Add section header comment
2. Define `TranslationStatusSummary` for aggregate counts
3. Define `TranslationLanguageStatus` for single language status
4. Define `TranslationStatusMap` type alias
5. Define `EntityTranslationStatus` for complete entity status

**Code to Implement:**

```typescript
// =============================================================================
// Translation Status Types
// =============================================================================

/**
 * Aggregate translation status counts for a property or entity set.
 * Used by TranslationStatusWidget and status summary displays.
 *
 * @example
 * ```typescript
 * const summary: TranslationStatusSummary = {
 *   total: 25,
 *   complete: 15,
 *   partial: 5,
 *   pending: 3,
 *   failed: 2
 * };
 * ```
 */
export interface TranslationStatusSummary {
  /** Total number of translatable items */
  total: number;
  /** Items fully translated to all languages */
  complete: number;
  /** Items partially translated (some languages done) */
  partial: number;
  /** Items with pending translations */
  pending: number;
  /** Items with failed translations */
  failed: number;
}

/**
 * Translation status for a single language of an entity.
 * Represents one row in the translation preview panel.
 */
export interface TranslationLanguageStatus {
  /** Translation status */
  status: TranslationStatus;
  /** Translated content (if available) */
  content?: TranslationContent;
  /** When translation was completed (ISO 8601) */
  translatedAt?: string;
  /**
   * Whether translation is stale (source updated since translation).
   * Requires source_version_at column from REQ-E05-003 migration.
   */
  isStale?: boolean;
  /** User ID who manually reviewed/edited (for manual status) */
  reviewedBy?: string;
}

/**
 * Map of language codes to their translation status.
 * Partial because not all languages may have translations.
 */
export type TranslationStatusMap = Partial<Record<SupportedLanguage, TranslationLanguageStatus>>;

/**
 * Complete translation status for a single entity.
 * Used in lists, detail views, and API responses.
 *
 * @example
 * ```typescript
 * const status: EntityTranslationStatus = {
 *   entityType: 'article',
 *   entityId: 'article-123',
 *   name: 'How to Use the Dishwasher',
 *   sourceLanguage: 'en',
 *   translations: {
 *     fr: { status: 'completed', content: { title: 'Comment utiliser...' } },
 *     es: { status: 'pending' },
 *     de: { status: 'failed' }
 *   }
 * };
 * ```
 */
export interface EntityTranslationStatus {
  /** Type of entity */
  entityType: ManageableEntityType;
  /** Entity unique identifier */
  entityId: string;
  /** Entity display name (for UI) */
  name: string;
  /** Source language of the content */
  sourceLanguage: SupportedLanguage;
  /** Translation status for each target language */
  translations: TranslationStatusMap;
}
```

**Verification:**
- [ ] All types compile without errors
- [ ] JSDoc comments present with examples
- [ ] `TranslationStatusMap` correctly uses `Partial<Record<>>`

**Estimated Effort:** 1 story point

---

### Task 4.5: Define Translation Preview Panel Types

**Objective:** Define props and state types for the TranslationPreviewPanel component family.

**Implementation Steps:**

1. Add section header comment
2. Define `TranslationPreviewPanelProps`
3. Define `TranslationStatusItemProps`
4. Define `TranslationProgressBarProps`

**Code to Implement:**

```typescript
// =============================================================================
// Translation Preview Panel Types
// =============================================================================

/**
 * Props for TranslationPreviewPanel component.
 * Slide-in panel (400px wide) showing translation status after content save.
 *
 * @see TranslationPreviewPanel.tsx
 */
export interface TranslationPreviewPanelProps {
  /** Entity type being previewed */
  entityType: ManageableEntityType;
  /** Entity unique identifier */
  entityId: string;
  /** Source language of the content */
  sourceLanguage: SupportedLanguage;
  /** Source content for comparison in editor */
  sourceContent: TranslationContent;
  /** Whether panel is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Callback when a translation is manually edited */
  onTranslationEdited?: (language: SupportedLanguage) => void;
  /** Optional CSS class */
  className?: string;
}

/**
 * Props for TranslationStatusItem component.
 * Single row showing one language's translation status with action buttons.
 *
 * Status colors (Tailwind classes):
 * - Completed: text-green-500 (#22C55E)
 * - Manual: text-violet-500 (#8B5CF6)
 * - Pending: text-amber-500 (#F59E0B)
 * - Failed: text-red-500 (#EF4444)
 * - Source: text-blue-500
 *
 * @see TranslationStatusItem.tsx
 */
export interface TranslationStatusItemProps {
  /** Language code */
  language: SupportedLanguage;
  /** Current translation status */
  status: TranslationLanguageStatus;
  /** Whether this is the source language (not translatable) */
  isSourceLanguage?: boolean;
  /** Edit button click handler */
  onEdit?: () => void;
  /** Re-translate button click handler */
  onRetranslate?: () => void;
  /** Retry failed translation handler */
  onRetry?: () => void;
  /** Optional CSS class */
  className?: string;
}

/**
 * Props for TranslationProgressBar component.
 * Visual progress indicator for translation completion.
 *
 * @example
 * ```tsx
 * <TranslationProgressBar completed={3} total={5} />
 * // Renders: "3/5 translations complete" with progress bar
 * ```
 */
export interface TranslationProgressBarProps {
  /** Number of completed translations */
  completed: number;
  /** Total number of target languages */
  total: number;
  /** Whether any translations are currently processing */
  isProcessing?: boolean;
  /** Optional CSS class */
  className?: string;
}
```

**Verification:**
- [ ] All props interfaces defined
- [ ] JSDoc comments include visual specifications where relevant
- [ ] Callback types use proper function signatures

**Estimated Effort:** 1 story point

---

### Task 4.6: Define Translation Editor Types

**Objective:** Define types for the TranslationEditor modal and related components.

**Implementation Steps:**

1. Add section header comment
2. Define `TranslationEditorProps`
3. Define `TranslationEditorState`

**Code to Implement:**

```typescript
// =============================================================================
// Translation Editor Types
// =============================================================================

/**
 * Props for TranslationEditor component.
 * Modal dialog (Radix Dialog) for editing a single translation with side-by-side comparison.
 *
 * @see TranslationEditor.tsx
 */
export interface TranslationEditorProps {
  /** Translation being edited */
  translation: {
    language: SupportedLanguage;
    content: TranslationContent;
    status: TranslationStatus;
  };
  /** Source content for side-by-side comparison */
  sourceContent: TranslationContent;
  /** Source language */
  sourceLanguage: SupportedLanguage;
  /** Whether editor is open */
  isOpen: boolean;
  /** Save handler - receives updated content */
  onSave: (updated: TranslationContent) => Promise<void>;
  /** Cancel/close handler */
  onCancel: () => void;
  /** Whether save is in progress */
  isSaving?: boolean;
}

/**
 * Internal state for TranslationEditor component.
 * Manages working copy, dirty tracking, and validation.
 */
export interface TranslationEditorState {
  /** Edited content (working copy) */
  editedContent: TranslationContent;
  /** Whether content has been modified from original */
  isDirty: boolean;
  /** Character count for each field */
  charCounts: Record<string, number>;
  /** Field-level validation errors */
  errors: Record<string, string>;
}
```

**Verification:**
- [ ] `onSave` returns Promise for async handling
- [ ] State interface includes all necessary tracking fields

**Estimated Effort:** 1 story point

---

### Task 4.7: Define Dashboard Integration Types

**Objective:** Define types for dashboard widgets, table columns, and filters.

**Implementation Steps:**

1. Add section header comment
2. Define `TranslationStatusWidgetProps`
3. Define `TranslationStatusColumnProps`
4. Define `TranslationStatusFilterProps`
5. Define `TranslationFilterValue` type

**Code to Implement:**

```typescript
// =============================================================================
// Dashboard Integration Types
// =============================================================================

/**
 * Props for TranslationStatusWidget component.
 * Summary card for dashboard showing overall translation status.
 *
 * @see TranslationStatusWidget.tsx
 */
export interface TranslationStatusWidgetProps {
  /** Property ID to show status for (null for all properties) */
  propertyId?: string | null;
  /** Click handler for "View Details" action */
  onViewDetails?: () => void;
  /** Optional CSS class */
  className?: string;
}

/**
 * Props for TranslationStatusColumn component.
 * Compact status indicator for table columns showing 6 dots/icons for each language.
 *
 * @see TranslationStatusColumn.tsx
 */
export interface TranslationStatusColumnProps {
  /** Translation status for the entity */
  translations: TranslationStatusMap;
  /** Source language (shown differently) */
  sourceLanguage: SupportedLanguage;
  /** Click handler to open preview panel */
  onClick?: () => void;
  /** Optional CSS class */
  className?: string;
}

/**
 * Props for TranslationStatusFilter component.
 * Dropdown filter for filtering items by translation status.
 *
 * @see TranslationStatusFilter.tsx
 */
export interface TranslationStatusFilterProps {
  /** Currently selected filter value */
  value: TranslationFilterValue;
  /** Change handler */
  onChange: (value: TranslationFilterValue) => void;
  /** Optional CSS class */
  className?: string;
}

/**
 * Filter values for translation status filtering.
 * Used in both FilterPanel and API query params.
 */
export type TranslationFilterValue =
  | 'all'
  | 'fully_translated'
  | 'partially_translated'
  | 'pending'
  | 'failed'
  | 'manually_edited';
```

**Verification:**
- [ ] Filter value type covers all required filter options
- [ ] Widget props support optional property filtering

**Estimated Effort:** 1 story point

---

### Task 4.8: Define Bulk Operations Types

**Objective:** Define types for bulk translation actions and language selection.

**Implementation Steps:**

1. Add section header comment
2. Define `BulkTranslationBarProps`
3. Define `LanguageSelectorDialogProps`
4. Define `EntityReference` for bulk operations

**Code to Implement:**

```typescript
// =============================================================================
// Bulk Operations Types
// =============================================================================

/**
 * Props for BulkTranslationBar component.
 * Action bar for bulk translation operations on selected items.
 *
 * @see BulkTranslationBar.tsx
 */
export interface BulkTranslationBarProps {
  /** Number of selected items */
  selectedCount: number;
  /** Re-translate all languages handler */
  onRetranslateAll: () => void;
  /** Re-translate specific languages handler (opens LanguageSelectorDialog) */
  onRetranslateSelected: () => void;
  /** Exit selection mode handler */
  onCancel: () => void;
  /** Whether operation is in progress */
  isLoading?: boolean;
  /** Optional CSS class */
  className?: string;
}

/**
 * Props for LanguageSelectorDialog component.
 * Modal for selecting languages for bulk re-translation.
 *
 * @see LanguageSelectorDialog.tsx
 */
export interface LanguageSelectorDialogProps {
  /** Whether dialog is open */
  isOpen: boolean;
  /** Currently selected languages */
  selectedLanguages: SupportedLanguage[];
  /** Selection change handler */
  onSelectionChange: (languages: SupportedLanguage[]) => void;
  /** Confirm handler */
  onConfirm: () => void;
  /** Cancel handler */
  onCancel: () => void;
  /** Languages to exclude from selection (e.g., source language) */
  excludeLanguages?: SupportedLanguage[];
}

/**
 * Entity reference for bulk operations.
 * Identifies a single entity for batch translation requests.
 */
export interface EntityReference {
  /** Entity type */
  type: ManageableEntityType;
  /** Entity unique identifier */
  id: string;
}
```

**Verification:**
- [ ] LanguageSelectorDialog supports excluding source language
- [ ] EntityReference uses ManageableEntityType (excludes 'tag')

**Estimated Effort:** 1 story point

---

### Task 4.9: Define Manual Edit Warning Types

**Objective:** Define types for manual edit preservation warning dialog.

**Implementation Steps:**

1. Add section header comment
2. Define `ManualEditWarningDialogProps`
3. Define `ManualEditInfo`

**Code to Implement:**

```typescript
// =============================================================================
// Manual Edit Warning Types
// =============================================================================

/**
 * Props for ManualEditWarningDialog component.
 * Shown when source content is updated and manual translations exist.
 *
 * @see ManualEditWarningDialog.tsx
 */
export interface ManualEditWarningDialogProps {
  /** Whether dialog is open */
  isOpen: boolean;
  /** Languages with manual edits that would be affected */
  affectedLanguages: SupportedLanguage[];
  /** Keep manual edits handler (mark as stale but preserve) */
  onKeepManual: () => void;
  /** Re-translate all (overwrite manual) handler */
  onRetranslateAll: () => void;
  /** Cancel handler (abort source update) */
  onCancel: () => void;
}

/**
 * Information about a manual translation that may be affected.
 * Used in warning dialogs and stale indicators.
 */
export interface ManualEditInfo {
  /** Language code */
  language: SupportedLanguage;
  /** User ID who manually reviewed/edited */
  reviewedBy?: string;
  /** When the manual edit was made (ISO 8601) */
  translatedAt?: string;
}
```

**Verification:**
- [ ] Three clear action handlers defined
- [ ] ManualEditInfo captures audit information

**Estimated Effort:** 1 story point

---

### Task 4.10: Define API Contract Types

**Objective:** Define types matching the API request/response contracts from the implementation plan.

**Implementation Steps:**

1. Add section header comment
2. Define `TranslationStatusResponse`
3. Define `UpdateTranslationRequest` and `UpdateTranslationResponse`
4. Define `RetranslateRequest` and `RetranslateResponse`

**Code to Implement:**

```typescript
// =============================================================================
// API Contract Types
// =============================================================================

/**
 * Response from GET /api/translations/status endpoint.
 * Returns both summary statistics and individual entity statuses.
 *
 * Query params: entityType?, entityId?, status?, propertyId?
 */
export interface TranslationStatusResponse {
  /** Aggregate summary counts */
  summary: TranslationStatusSummary;
  /** Individual entity statuses */
  items: EntityTranslationStatus[];
}

/**
 * Request body for PUT /api/translations/{entityType}/{entityId}/{language}.
 * Updates translation content and automatically sets status to 'manual'.
 */
export interface UpdateTranslationRequest {
  /** Updated title (for articles/links) */
  title?: string;
  /** Updated name (for items) */
  name?: string;
  /** Updated description */
  description?: string;
}

/**
 * Response from PUT update translation endpoint.
 * Confirms the update and returns the new status.
 */
export interface UpdateTranslationResponse {
  /** Whether update succeeded */
  success: boolean;
  /** Updated translation metadata */
  translation: {
    language: SupportedLanguage;
    status: 'manual';
    reviewedBy: string;
    updatedAt: string;
  };
}

/**
 * Request body for POST /api/translations/retranslate endpoint.
 * Queues re-translation jobs for specified entities.
 */
export interface RetranslateRequest {
  /** Entities to re-translate */
  entities: EntityReference[];
  /** Specific languages to target (all non-source if omitted) */
  languages?: SupportedLanguage[];
  /** Whether to overwrite manual edits (default: false) */
  overwriteManual?: boolean;
}

/**
 * Response from POST re-translate endpoint.
 * Returns job counts for tracking.
 */
export interface RetranslateResponse {
  /** Whether request succeeded */
  success: boolean;
  /** Number of translation jobs queued */
  jobsQueued: number;
  /** Number of translations skipped (manual edits preserved) */
  skipped: number;
  /** Reason for skipped items (e.g., "Manual translations preserved") */
  skippedReason?: string;
}
```

**Verification:**
- [ ] Request types match API route parameter names
- [ ] Response types include success boolean
- [ ] UpdateTranslationResponse.translation.status is literal 'manual'

**Estimated Effort:** 1 story point

---

### Task 4.11: Define Hook Types

**Objective:** Define types for custom hook interfaces and return values.

**Implementation Steps:**

1. Add section header comment
2. Define `UseTranslationStatusOptions` and `UseTranslationStatusReturn`
3. Define `UseTranslationPreviewReturn` and `TranslationPreviewState`
4. Define `UseTranslationRealtimeOptions`

**Code to Implement:**

```typescript
// =============================================================================
// Hook Types
// =============================================================================

/**
 * Options for useTranslationStatus hook.
 * Configures what translation status data to fetch.
 */
export interface UseTranslationStatusOptions {
  /** Entity type to fetch status for */
  entityType?: ManageableEntityType;
  /** Specific entity ID (for single entity mode) */
  entityId?: string;
  /** Property ID filter (for property-wide mode) */
  propertyId?: string;
  /** Status filter */
  status?: TranslationFilterValue;
  /** Enable auto-refresh */
  autoRefresh?: boolean;
  /** Refresh interval in milliseconds (default: 30000) */
  refreshInterval?: number;
}

/**
 * Return type for useTranslationStatus hook.
 * Provides translation status data and loading states.
 */
export interface UseTranslationStatusReturn {
  /** Summary statistics */
  summary: TranslationStatusSummary | null;
  /** Entity-level statuses */
  items: EntityTranslationStatus[];
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Manual refresh function */
  refresh: () => Promise<void>;
}

/**
 * Internal state for translation preview panel.
 * Managed by useTranslationPreview hook.
 */
export interface TranslationPreviewState {
  /** Whether panel is open */
  isOpen: boolean;
  /** Entity type being previewed */
  entityType: ManageableEntityType | null;
  /** Entity ID being previewed */
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
 * Return type for useTranslationPreview hook.
 * Provides panel state and action functions.
 */
export interface UseTranslationPreviewReturn {
  /** Preview panel state */
  state: TranslationPreviewState;
  /** Open preview for an entity */
  openPreview: (
    entityType: ManageableEntityType,
    entityId: string,
    sourceContent: TranslationContent,
    sourceLanguage: SupportedLanguage
  ) => void;
  /** Close preview panel */
  closePreview: () => void;
  /** Trigger re-translation for a language */
  retranslate: (language: SupportedLanguage) => Promise<void>;
  /** Retry failed translation */
  retryFailed: (language: SupportedLanguage) => Promise<void>;
}

/**
 * Options for useTranslationRealtime hook.
 * Configures Supabase realtime subscription for translation updates.
 */
export interface UseTranslationRealtimeOptions {
  /** Entity type to subscribe to */
  entityType: ManageableEntityType;
  /** Entity ID to subscribe to */
  entityId: string;
  /** Callback when translation status changes */
  onStatusChange: (language: SupportedLanguage, status: TranslationLanguageStatus) => void;
  /** Whether subscription is enabled (default: true) */
  enabled?: boolean;
}
```

**Verification:**
- [ ] Options interfaces have sensible defaults documented
- [ ] Return types include all necessary state and functions
- [ ] Async functions return Promise<void>

**Estimated Effort:** 1 story point

---

### Task 4.12: Create Barrel Export File

**Objective:** Create or update the index.ts barrel export file for the TranslationManagement component.

**File Operations:**
| Operation | Path |
|-----------|------|
| CREATE | `/src/components/TranslationManagement/index.ts` |

**Implementation Steps:**

1. Create index.ts file
2. Re-export all types from TranslationManagement.types.ts

**Code to Implement:**

```typescript
/**
 * TranslationManagement Component Barrel Export
 *
 * @module TranslationManagement
 * @lastModified 2026-01-19 (REQ-E05-005)
 */

// Type exports
export * from './TranslationManagement.types';

// Component exports will be added as components are created:
// export { TranslationPreviewPanel } from './TranslationPreviewPanel';
// export { TranslationEditor } from './TranslationEditor';
// export { TranslationStatusWidget } from './TranslationStatusWidget';
// etc.
```

**Verification:**
- [ ] All types can be imported via `@/components/TranslationManagement`
- [ ] No circular dependency warnings

**Estimated Effort:** 1 story point

---

### Task 4.13: Update Main Types Index

**Objective:** Add re-export to the main types index file for convenient access.

**File Operations:**
| Operation | Path |
|-----------|------|
| MODIFY | `/src/types/index.ts` |

**Implementation Steps:**

1. Read current `/src/types/index.ts` content
2. Add export for TranslationManagement types

**Code to Add:**

```typescript
// Translation Management types (REQ-E05-005)
export * from '@/components/TranslationManagement/TranslationManagement.types';
```

**Verification:**
- [ ] Types can be imported from `@/types`
- [ ] No duplicate export errors
- [ ] Build succeeds

**Estimated Effort:** 1 story point

---

### Task 4.14: Verify No Circular Dependencies

**Objective:** Verify that no circular dependencies exist between type definition files.

**Implementation Steps:**

1. Run TypeScript compiler to check for circular dependency warnings
2. Verify imports in both directions work:
   - Import from `@/lib/translation-service/translation-service.types` in TranslationManagement.types.ts
   - Import from `@/components/TranslationManagement` in other files
3. Test that translation-service types don't import from TranslationManagement

**Verification Commands:**
```bash
# Run TypeScript compiler to check for errors
npx tsc --noEmit

# Run build to verify everything works
npm run build
```

**Verification:**
- [ ] No circular dependency warnings in TypeScript compilation
- [ ] Build succeeds without errors

**Estimated Effort:** 1 story point

---

## 5. Files Summary

### Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | **PRIMARY TARGET** - All shared types for Translation Management UI |
| `/src/components/TranslationManagement/index.ts` | Barrel export file |

### Files to MODIFY

| File Path | Modification |
|-----------|--------------|
| `/src/types/index.ts` | Add re-export of TranslationManagement types |

### Files to READ (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/src/components/ItemManager/ItemManager.types.ts` | Pattern reference for type organization |
| `/src/lib/translation-service/translation-service.types.ts` | Import base types |

---

## 6. Verification Checklist

Before marking this task complete, verify all acceptance criteria:

- [ ] File created at `/src/components/TranslationManagement/TranslationManagement.types.ts`
- [ ] Types define translation status display data structures (TranslationStatusSummary, TranslationLanguageStatus, etc.)
- [ ] Types define translation editor component props (TranslationEditorProps, TranslationEditorState)
- [ ] Types define translation job metadata structures (EntityReference, RetranslateRequest)
- [ ] Types define language selector component props (LanguageSelectorDialogProps)
- [ ] Types define translation preview component props (TranslationPreviewPanelProps, TranslationStatusItemProps)
- [ ] Re-export of TranslationStatus from translation-service
- [ ] ManageableEntityType defined (excludes 'tag')
- [ ] Types include JSDoc comments on all interfaces and complex properties
- [ ] All types export properly via barrel file
- [ ] Types integrate with translation-service types
- [ ] No circular dependencies exist
- [ ] TypeScript compilation succeeds
- [ ] Build succeeds

---

## 7. Implementation Notes

### Pattern Conformance

This implementation follows the established patterns from `ItemManager.types.ts`:

1. **File Header**: Comprehensive JSDoc module header with references
2. **Section Headers**: `// ===...===` separators for organization
3. **JSDoc Comments**: Every interface and property documented
4. **Examples**: Code examples in JSDoc where helpful
5. **Type Safety**: Using literal types where appropriate (e.g., `status: 'manual'`)

### Type Design Decisions

1. **Re-export vs Duplicate**: Types like `SupportedLanguage` and `TranslationStatus` are re-exported from translation-service, not duplicated, to maintain single source of truth.

2. **ManageableEntityType**: Excludes 'tag' since tag translations are system-level and not managed through the owner UI.

3. **Partial Records**: `TranslationStatusMap` uses `Partial<Record<>>` because not all languages may have translations.

4. **ISO 8601 Timestamps**: All timestamp fields use string type with ISO 8601 format documented.

5. **Future Compatibility**: `isStale` field included in preparation for REQ-E05-003 migration.

---

## 8. Related Documents

- [REQ-E05-005-create-translationmanagement-types-file-overview.md](./REQ-E05-005-create-translationmanagement-types-file-overview.md)
- [Plan-111-L10N-Epic5-Owner-Translation-Management.md](./prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md)
- [gen_requests_epic5.md](./gen_requests_epic5.md) - REQ-E05-006
- [ItemManager.types.ts](../src/components/ItemManager/ItemManager.types.ts) - Pattern reference
- [translation-service.types.ts](../src/lib/translation-service/translation-service.types.ts) - Base types

---

*Document generated for FAQBNB L10N Epic 5 - Owner Translation Management*
*Task: Create TranslationManagement Types File*
