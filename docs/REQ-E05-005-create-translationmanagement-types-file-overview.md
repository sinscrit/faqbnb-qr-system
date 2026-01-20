# REQ-E05-005: Create TranslationManagement Types File - Implementation Overview

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request ID:** REQ-E05-005
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 2 - Core UI Components
**Task ID:** 2.1
**Status:** Ready for Implementation

---

## 1. Summary

Create a centralized TypeScript types file (`/src/components/TranslationManagement/TranslationManagement.types.ts`) containing all shared interfaces, types, and enums for the Translation Management UI components. This types file will serve as the single source of truth for data structures across the entire owner-facing translation management interface, ensuring type consistency, IDE autocomplete support, and compile-time validation.

---

## 2. Request Reference

**From:** docs/gen_requests_epic5.md - REQ-E05-006 (Translation Management Shared Type Definitions)

### Acceptance Criteria:
- [x] File created at `/src/components/TranslationManagement/TranslationManagement.types.ts`
- [x] Types define translation status display data structures (status, counts, percentages)
- [x] Types define translation editor component props and state interfaces
- [x] Types define translation job metadata structures (job ID, entity reference, language, priority)
- [x] Types define language selector component props and option types
- [x] Types define translation preview component props and content structure
- [x] Enum types define translation status values matching database schema
- [x] Enum types define entity types matching database schema
- [x] Types include JSDoc comments explaining purpose and usage of complex structures
- [x] All types export properly for use across translation management components
- [x] Types integrate seamlessly with existing database types from generated definitions
- [x] No circular dependencies exist between type definition files

---

## 3. Implementation Plan Reference

**From:** docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md

Relevant sections:
- Architecture > Component Structure
- State Management interfaces
- Integration Contract (API interfaces)
- UI Visual Specifications

---

## 4. Technical Analysis

### 4.1 Existing Patterns to Follow

The codebase follows consistent patterns for type definition files:

1. **ItemManager Pattern** (`src/components/ItemManager/ItemManager.types.ts`):
   - Comprehensive JSDoc comments on all interfaces and properties
   - Organized sections with clear comment headers (=== separators)
   - Props interfaces for each component
   - State interfaces for hooks
   - Action union types for reducers
   - Re-exports of related types

2. **Translation Service Types** (`src/lib/translation-service/translation-service.types.ts`):
   - `SupportedLanguage` type: `'en' | 'fr' | 'es' | 'de' | 'nl' | 'it'`
   - `TranslationStatus` type: `'pending' | 'processing' | 'completed' | 'failed' | 'manual'`
   - `TranslatableEntityType` type: `'article' | 'item' | 'link' | 'tag'`
   - Database record types for each translation table
   - `SUPPORTED_LANGUAGES` constant with metadata

3. **LocaleContext Types** (`src/contexts/LocaleContext.tsx`):
   - `SupportedLanguage` type (same as translation service)
   - `LocaleOption` interface with metadata
   - Context value interfaces

### 4.2 Database Schema Reference

From the database inspection, translation tables have:

| Table | Key Columns |
|-------|-------------|
| `item_translations` | id, item_id, language, name, description, translation_status, translated_at, created_at, updated_at |
| `article_translations` | id, article_id, language, title, description, translation_status, translated_at, reviewed_by, created_at, updated_at |
| `link_translations` | id, link_id, language, title, translation_status, translated_at, created_at, updated_at |
| `tag_translations` | id, tag_key, language, translated_value, is_system_tag, created_at |
| `translation_jobs` | id, entity_type, entity_id, source_language, target_language, status, attempts, error_message, created_at, started_at, completed_at, locked_by, locked_at |

**Note:** The `source_version_at` column mentioned in Epic 5 Task 1.4 will be added via migration (not yet present).

### 4.3 Dependencies

**Internal Dependencies (to import from):**
- `SupportedLanguage` from `@/lib/translation-service/translation-service.types`
- `TranslationStatus` from `@/lib/translation-service/translation-service.types`
- `TranslatableEntityType` from `@/lib/translation-service/translation-service.types`

**Components that will consume these types:**
- `TranslationPreviewPanel` and subcomponents
- `TranslationEditor` and subcomponents
- `TranslationStatusWidget`
- `TranslationStatusColumn`
- `TranslationStatusFilter`
- `BulkTranslationBar` and `LanguageSelectorDialog`
- `ManualEditWarningDialog`
- `LanguagePreferenceSection`
- Translation management page
- Custom hooks (`useTranslationStatus`, `useTranslationPreview`, `useTranslationRealtime`)

---

## 5. Types to Define

### 5.1 Core Enums/Types (Re-exports for convenience)

```typescript
// Re-export from translation-service for convenience
export type { SupportedLanguage, TranslationStatus } from '@/lib/translation-service/translation-service.types';
export type EntityType = 'article' | 'item' | 'link';
```

### 5.2 Translation Status Display Types

Types for displaying translation status information:

- `TranslationStatusSummary` - Aggregate counts (total, complete, partial, pending, failed)
- `TranslationStatusItem` - Single entity status with all language statuses
- `TranslationLanguageStatus` - Status for a single language of an entity
- `TranslationStatusMap` - Map of language codes to their status

### 5.3 Translation Preview Panel Types

Props and state for the preview panel:

- `TranslationPreviewPanelProps` - Main panel component props
- `TranslationPreviewState` - Internal state management
- `TranslationStatusItemProps` - Individual language row props
- `TranslationProgressBarProps` - Progress indicator props

### 5.4 Translation Editor Types

Types for the inline editor modal:

- `TranslationEditorProps` - Editor modal props
- `TranslationEditorState` - Editor internal state
- `TranslationDiffViewProps` - Side-by-side comparison props
- `TranslationContent` - Generic content structure (title/name, description)

### 5.5 Dashboard Widget Types

Types for dashboard integration:

- `TranslationStatusWidgetProps` - Dashboard widget props
- `TranslationStatusColumnProps` - Table column component props
- `TranslationStatusFilterProps` - Filter dropdown props
- `TranslationFilterOptions` - Available filter options

### 5.6 Bulk Operations Types

Types for bulk translation actions:

- `BulkTranslationBarProps` - Bulk action bar props
- `LanguageSelectorDialogProps` - Language picker modal props
- `BulkTranslationRequest` - Bulk operation request structure
- `BulkTranslationResult` - Bulk operation result structure

### 5.7 Manual Edit Warning Types

Types for manual edit preservation:

- `ManualEditWarningDialogProps` - Warning dialog props
- `ManualEditInfo` - Information about affected manual edits

### 5.8 API Response Types

Types matching the API contracts from the implementation plan:

- `TranslationStatusResponse` - GET /api/translations/status response
- `UpdateTranslationRequest` - PUT request body
- `UpdateTranslationResponse` - PUT response body
- `RetranslateRequest` - POST /api/translations/retranslate body
- `RetranslateResponse` - POST response body

### 5.9 Hook Return Types

Types for custom hooks:

- `UseTranslationStatusOptions` - Hook configuration
- `UseTranslationStatusReturn` - Hook return value
- `UseTranslationPreviewReturn` - Preview panel hook return
- `UseTranslationRealtimeOptions` - Realtime subscription options

---

## 6. Authorized Files and Functions for Modification

### 6.1 Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | **PRIMARY TARGET** - All shared types for Translation Management UI |
| `/src/components/TranslationManagement/index.ts` | Barrel export file (if not exists) |

### 6.2 Files to MODIFY (for integration)

| File Path | Modification |
|-----------|--------------|
| `/src/types/index.ts` | Add re-export of TranslationManagement types |

### 6.3 Files to READ (for reference only)

| File Path | Purpose |
|-----------|---------|
| `/src/components/ItemManager/ItemManager.types.ts` | Pattern reference for type organization |
| `/src/lib/translation-service/translation-service.types.ts` | Import base types |
| `/src/contexts/LocaleContext.tsx` | Reference for locale types |

---

## 7. Implementation Tasks

### Task 1: Create Directory Structure
Create the TranslationManagement component directory if it doesn't exist.

**File:** `/src/components/TranslationManagement/`

### Task 2: Create Types File with Core Imports
Create the types file with necessary imports and re-exports.

**File:** `/src/components/TranslationManagement/TranslationManagement.types.ts`

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

// Re-export for convenience
export type { SupportedLanguage, TranslationStatus };
```

### Task 3: Define Translation Status Types
Add types for translation status display.

### Task 4: Define Translation Preview Panel Types
Add types for the preview panel component family.

### Task 5: Define Translation Editor Types
Add types for the editor modal and related components.

### Task 6: Define Dashboard Integration Types
Add types for widgets, columns, and filters.

### Task 7: Define Bulk Operations Types
Add types for bulk translation actions.

### Task 8: Define API Contract Types
Add types matching the API request/response contracts.

### Task 9: Define Hook Return Types
Add types for custom hook interfaces.

### Task 10: Create Barrel Export
Create or update the index.ts barrel export file.

**File:** `/src/components/TranslationManagement/index.ts`

### Task 11: Update Main Types Index
Add export to the main types index file.

**File:** `/src/types/index.ts`

---

## 8. Type Definitions Detail

### 8.1 Status Display Types

```typescript
// =============================================================================
// Translation Status Types
// =============================================================================

/**
 * Aggregate translation status counts for a property or entity set.
 * Used by TranslationStatusWidget and status summary displays.
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
  /** When translation was completed */
  translatedAt?: string;
  /** Whether translation is stale (source updated since translation) */
  isStale?: boolean;
  /** User ID who manually reviewed/edited (for manual status) */
  reviewedBy?: string;
}

/**
 * Map of language codes to their translation status.
 */
export type TranslationStatusMap = Partial<Record<SupportedLanguage, TranslationLanguageStatus>>;

/**
 * Complete translation status for a single entity.
 * Used in lists and detail views.
 */
export interface EntityTranslationStatus {
  /** Type of entity */
  entityType: 'article' | 'item' | 'link';
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

### 8.2 Content Structure Types

```typescript
// =============================================================================
// Translation Content Types
// =============================================================================

/**
 * Generic structure for translatable content.
 * Used for both source and translated content.
 */
export interface TranslationContent {
  /** Title (for articles/links) or name (for items) */
  title?: string;
  /** Name field (for items) */
  name?: string;
  /** Description/body text */
  description?: string;
}

/**
 * Source content with language information.
 */
export interface SourceContent extends TranslationContent {
  /** Source language of the content */
  language: SupportedLanguage;
}
```

### 8.3 Component Props Types

```typescript
// =============================================================================
// Translation Preview Panel Types
// =============================================================================

/**
 * Props for TranslationPreviewPanel component.
 * Slide-in panel showing translation status after content save.
 */
export interface TranslationPreviewPanelProps {
  /** Entity type being previewed */
  entityType: 'article' | 'item' | 'link';
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
 * Single row showing one language's translation status.
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

### 8.4 Editor Types

```typescript
// =============================================================================
// Translation Editor Types
// =============================================================================

/**
 * Props for TranslationEditor component.
 * Modal for editing a single translation with side-by-side comparison.
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
 */
export interface TranslationEditorState {
  /** Edited content (working copy) */
  editedContent: TranslationContent;
  /** Whether content has been modified */
  isDirty: boolean;
  /** Character count for each field */
  charCounts: Record<string, number>;
  /** Field-level validation errors */
  errors: Record<string, string>;
}
```

### 8.5 Dashboard Integration Types

```typescript
// =============================================================================
// Dashboard Integration Types
// =============================================================================

/**
 * Props for TranslationStatusWidget component.
 * Summary card for dashboard showing overall translation status.
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
 * Compact status indicator for table columns.
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
 */
export type TranslationFilterValue =
  | 'all'
  | 'fully_translated'
  | 'partially_translated'
  | 'pending'
  | 'failed'
  | 'manually_edited';
```

### 8.6 Bulk Operations Types

```typescript
// =============================================================================
// Bulk Operations Types
// =============================================================================

/**
 * Props for BulkTranslationBar component.
 * Action bar for bulk translation operations on selected items.
 */
export interface BulkTranslationBarProps {
  /** Number of selected items */
  selectedCount: number;
  /** Re-translate all languages handler */
  onRetranslateAll: () => void;
  /** Re-translate specific languages handler */
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
 */
export interface LanguageSelectorDialogProps {
  /** Whether dialog is open */
  isOpen: boolean;
  /** Currently selected languages */
  selectedLanguages: SupportedLanguage[];
  /** Change handler */
  onSelectionChange: (languages: SupportedLanguage[]) => void;
  /** Confirm handler */
  onConfirm: () => void;
  /** Cancel handler */
  onCancel: () => void;
  /** Languages to exclude (e.g., source language) */
  excludeLanguages?: SupportedLanguage[];
}

/**
 * Entity reference for bulk operations.
 */
export interface EntityReference {
  type: 'article' | 'item' | 'link';
  id: string;
}
```

### 8.7 Manual Edit Warning Types

```typescript
// =============================================================================
// Manual Edit Warning Types
// =============================================================================

/**
 * Props for ManualEditWarningDialog component.
 * Shown when source content is updated and manual translations exist.
 */
export interface ManualEditWarningDialogProps {
  /** Whether dialog is open */
  isOpen: boolean;
  /** Languages with manual edits that would be affected */
  affectedLanguages: SupportedLanguage[];
  /** Keep manual edits handler */
  onKeepManual: () => void;
  /** Re-translate all (overwrite manual) handler */
  onRetranslateAll: () => void;
  /** Cancel handler (abort source update) */
  onCancel: () => void;
}

/**
 * Information about a manual translation that may be affected.
 */
export interface ManualEditInfo {
  language: SupportedLanguage;
  reviewedBy?: string;
  translatedAt?: string;
}
```

### 8.8 API Contract Types

```typescript
// =============================================================================
// API Contract Types
// =============================================================================

/**
 * Response from GET /api/translations/status endpoint.
 */
export interface TranslationStatusResponse {
  /** Aggregate summary counts */
  summary: TranslationStatusSummary;
  /** Individual entity statuses */
  items: EntityTranslationStatus[];
}

/**
 * Request body for PUT /api/translations/{entityType}/{entityId}/{language}.
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
 */
export interface UpdateTranslationResponse {
  success: boolean;
  translation: {
    language: SupportedLanguage;
    status: 'manual';
    reviewedBy: string;
    updatedAt: string;
  };
}

/**
 * Request body for POST /api/translations/retranslate endpoint.
 */
export interface RetranslateRequest {
  /** Entities to re-translate */
  entities: EntityReference[];
  /** Specific languages to target (all if omitted) */
  languages?: SupportedLanguage[];
  /** Whether to overwrite manual edits (default: false) */
  overwriteManual?: boolean;
}

/**
 * Response from POST re-translate endpoint.
 */
export interface RetranslateResponse {
  success: boolean;
  /** Number of translation jobs queued */
  jobsQueued: number;
  /** Number of translations skipped (manual edits preserved) */
  skipped: number;
  /** Reason for skipped items */
  skippedReason?: string;
}
```

### 8.9 Hook Types

```typescript
// =============================================================================
// Hook Types
// =============================================================================

/**
 * Options for useTranslationStatus hook.
 */
export interface UseTranslationStatusOptions {
  /** Entity type to fetch status for */
  entityType?: 'article' | 'item' | 'link';
  /** Specific entity ID (for single entity mode) */
  entityId?: string;
  /** Property ID filter (for property-wide mode) */
  propertyId?: string;
  /** Status filter */
  status?: TranslationFilterValue;
  /** Enable auto-refresh */
  autoRefresh?: boolean;
  /** Refresh interval in milliseconds */
  refreshInterval?: number;
}

/**
 * Return type for useTranslationStatus hook.
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
 * Return type for useTranslationPreview hook.
 */
export interface UseTranslationPreviewReturn {
  /** Preview panel state */
  state: TranslationPreviewState;
  /** Open preview for an entity */
  openPreview: (entityType: 'article' | 'item' | 'link', entityId: string, sourceContent: TranslationContent, sourceLanguage: SupportedLanguage) => void;
  /** Close preview panel */
  closePreview: () => void;
  /** Trigger re-translation for a language */
  retranslate: (language: SupportedLanguage) => Promise<void>;
  /** Retry failed translation */
  retryFailed: (language: SupportedLanguage) => Promise<void>;
}

/**
 * Internal state for translation preview panel.
 */
export interface TranslationPreviewState {
  isOpen: boolean;
  entityType: 'article' | 'item' | 'link' | null;
  entityId: string | null;
  sourceContent: TranslationContent | null;
  sourceLanguage: SupportedLanguage;
  translations: TranslationStatusMap;
  isLoading: boolean;
  error: string | null;
}

/**
 * Options for useTranslationRealtime hook.
 */
export interface UseTranslationRealtimeOptions {
  /** Entity type to subscribe to */
  entityType: 'article' | 'item' | 'link';
  /** Entity ID to subscribe to */
  entityId: string;
  /** Callback when translation status changes */
  onStatusChange: (language: SupportedLanguage, status: TranslationLanguageStatus) => void;
  /** Whether subscription is enabled */
  enabled?: boolean;
}
```

---

## 9. Validation Checklist

Before marking complete, verify:

- [ ] File created at correct path
- [ ] All type definitions include JSDoc comments
- [ ] Types imported correctly from translation-service
- [ ] No circular dependencies introduced
- [ ] Barrel export includes all public types
- [ ] Types compile without errors
- [ ] Main types index updated with re-export

---

## 10. Related Documents

- [Plan-111-L10N-Epic5-Owner-Translation-Management.md](../prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md)
- [ItemManager.types.ts](../../src/components/ItemManager/ItemManager.types.ts) - Pattern reference
- [translation-service.types.ts](../../src/lib/translation-service/translation-service.types.ts) - Base types
- [REQ-E05-001 through REQ-E05-004](./gen_requests_epic5.md) - Related API endpoints

---

## 11. Notes

1. **Re-use vs. Duplicate:** The decision was made to re-export `SupportedLanguage` and `TranslationStatus` from the translation-service module rather than duplicate them, ensuring single source of truth.

2. **Entity Type Difference:** The `EntityType` in this module excludes 'tag' since tag translations are not managed through the owner UI (they are system-level). The translation-service uses `TranslatableEntityType` which includes 'tag'.

3. **Future Compatibility:** Types include optional `source_version_at` considerations via the `isStale` field, which will be populated once the database migration (REQ-E05-003) is complete.

4. **Component-Specific Types:** Each component subdirectory (e.g., `TranslationPreviewPanel/`) may have its own `.types.ts` file for internal types not shared across components. The main `TranslationManagement.types.ts` file contains only shared types.
