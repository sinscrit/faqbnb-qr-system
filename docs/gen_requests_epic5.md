# Generated Requests - Epic 5 (Owner Translation Management)

This file contains auto-generated feature requests for L10N Epic 5.
Request IDs use format: REQ-E05-XXX

Last Reset: 2026-01-22

---

## REQ-E05-001: Create Translation Status API Endpoint

**Date**: 2026-01-22 15:55
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners need a read-only API endpoint that returns the translation status of their content items, including completion counts and individual item statuses.

### Current Behavior
No API endpoint exists to query translation status for items and articles. Owners cannot programmatically check which translations exist, are complete, or need attention.

### Expected Behavior
A GET endpoint accepts filter parameters and returns translation status information:
- Summary counts showing how many translations are complete, pending, or missing for each language
- Item-level detail showing which specific items have which translation statuses
- Results filtered by property ownership so users only see their own content
- Support for filtering by entity type, specific entity, translation status, and property

### User Impact
Property owners who manage multiple items across multiple languages gain visibility into their translation coverage without manually checking each item. This enables them to identify gaps and prioritize translation work.

### Business Value
Provides the data foundation needed for translation management features. Without this endpoint, owners cannot efficiently manage translations at scale.

### Acceptance Criteria
- [ ] GET request to the endpoint returns HTTP 200 with valid authentication
- [ ] Unauthenticated requests return HTTP 401
- [ ] Results are filtered to only include entities owned by the authenticated user's properties
- [ ] Query parameters for entityType, entityId, status, and propertyId are correctly applied
- [ ] Response includes summary counts per language showing complete, pending, and missing translations
- [ ] Response includes item-level status showing which translations exist for each entity
- [ ] Requesting translation status for entities not owned by the user returns empty results or HTTP 403
- [ ] Invalid filter values return HTTP 400 with clear error messages

---

## REQ-E05-002: Create Update Translation API Endpoint

**Date**: 2026-01-22 15:57
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners need a write endpoint to update existing translation content, allowing them to manually edit or review machine-generated translations.

### Current Behavior
No API endpoint exists to update translation content after it has been created. Owners cannot manually edit, correct, or review translations once they are generated.

### Expected Behavior
A PUT endpoint accepts translation content updates and metadata:
- Accepts updated translation content for title, description, and any translatable fields
- Updates the translation status to 'manual' when content is edited by the owner
- Records the user who reviewed or edited the translation in a reviewedBy field
- Validates that the authenticated user has ownership access to the entity being translated
- Returns the updated translation record with new timestamps and status
- Preserves the original language and entity associations

### User Impact
Property owners who need to refine machine translations or provide corrections gain the ability to manually edit translation content. This ensures translation quality matches their standards and allows them to fix errors in automated translations.

### Business Value
Enables human oversight and quality control for translations. Owners can ensure their content accurately represents their property and instructions, improving guest trust and reducing support issues from poor translations.

### Acceptance Criteria
- [ ] PUT request to the endpoint with valid authentication and translation content returns HTTP 200
- [ ] Unauthenticated requests return HTTP 401
- [ ] Translation status is automatically set to 'manual' when content is updated via this endpoint
- [ ] The reviewedBy field records the authenticated user's ID
- [ ] Users can only update translations for entities they own (validated via property ownership)
- [ ] Attempting to update translations for entities not owned by the user returns HTTP 403
- [ ] Missing required fields in the request body return HTTP 400 with clear error messages
- [ ] The updated translation record includes new updatedAt timestamp reflecting the change
- [ ] Original entityType, entityId, and language values cannot be changed via this endpoint
- [ ] Response includes the complete updated translation object with all fields

---

## REQ-E05-003: Create Re-Translate API Endpoint

**Date**: 2026-01-22 16:30
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners need an API endpoint to queue re-translation jobs for their content, enabling them to refresh machine translations when source content changes or translation quality needs improvement.

### Current Behavior
No API endpoint exists to trigger re-translation of existing content. Once translations are generated, owners cannot request new translations without manually deleting existing translations and triggering a fresh translation workflow.

### Expected Behavior
A POST endpoint queues re-translation jobs for specified entities:
- Accepts a list of entity identifiers (items, articles) for bulk re-translation
- Supports an option to skip entities with manual edits, preserving human-reviewed translations
- Supports an option to overwrite manual edits when the owner explicitly requests full re-translation
- Validates ownership of all specified entities before queuing jobs
- Returns a summary indicating how many jobs were queued and how many were skipped
- Queued jobs are processed asynchronously through the existing translation pipeline

### Technical Details
- **File**: `/src/app/api/translations/retranslate/route.ts`
- **Method**: POST
- **Request Body**:
  - `entities`: Array of objects with `entityType` ('item' | 'article') and `entityId` (string)
  - `languages`: Optional array of target language codes (defaults to all configured languages)
  - `skipManualEdits`: Boolean flag to preserve translations with 'manual' status (default: true)
  - `overwriteManual`: Boolean flag to force overwrite of manual translations (default: false)
- **Response**: Object containing `jobCount` (number of queued jobs) and `skippedCount` (number of skipped entities)

### User Impact
Property owners who update their source content or want improved translations can easily trigger re-translation without losing their manual edits. The bulk support allows efficient re-translation of multiple items at once, and the skip/overwrite options give owners control over whether their manual work is preserved.

### Business Value
Improves translation freshness and quality by allowing easy refresh of machine translations. Protects owner investment in manual translation review by defaulting to skip edited content. Reduces support burden by giving owners self-service control over their translations.

### Acceptance Criteria
- [ ] POST request to `/api/translations/retranslate` with valid authentication and entities returns HTTP 200
- [ ] Unauthenticated requests return HTTP 401
- [ ] Request body must include at least one entity in the `entities` array
- [ ] Each entity must have valid `entityType` ('item' or 'article') and `entityId`
- [ ] Users can only queue re-translation for entities they own (validated via property ownership)
- [ ] Attempting to re-translate entities not owned by the user returns HTTP 403 or skips those entities
- [ ] When `skipManualEdits` is true (default), entities with 'manual' translation status are not queued
- [ ] When `overwriteManual` is true, entities with 'manual' status are included in the queue
- [ ] Response includes accurate `jobCount` reflecting the number of translation jobs queued
- [ ] Response includes accurate `skippedCount` reflecting entities skipped due to manual edits or invalid ownership
- [ ] Empty `entities` array returns HTTP 400 with clear error message
- [ ] Invalid `entityType` values return HTTP 400 with clear error message
- [ ] Optional `languages` parameter filters which target languages are re-translated
- [ ] Queued jobs are processed asynchronously (endpoint returns immediately after queuing)

---

## REQ-E05-004: Add source_version_at Columns via Migration

**Date**: 2026-01-22 17:45
**Type**: NEW FEATURE
**Size**: S

### Summary
The translation system needs database columns to track when source content was last modified, enabling detection of stale translations that need re-translation after source content changes.

### Current Behavior
The translation tables (`item_translations`, `article_translations`) store translated content but have no mechanism to track the version of the source content they were translated from. When source content is updated, there is no way to identify which translations are outdated and need refresh.

### Expected Behavior
A database migration adds `source_version_at` columns to translation tables:
- Stores the timestamp of the source content at the time of translation
- Enables comparison between source content `updated_at` and translation `source_version_at`
- When source `updated_at` > translation `source_version_at`, the translation is stale
- Indexes support efficient queries for stale translation detection

### Technical Details
- **File**: Apply via Supabase MCP (`mcp__supabase__apply_migration`)
- **Migration Name**: `add_source_version_at_columns`
- **Tables Affected**:
  - `item_translations`: Add `source_version_at` column (TIMESTAMPTZ, nullable)
  - `article_translations`: Add `source_version_at` column (TIMESTAMPTZ, nullable)
- **Indexes**:
  - Create index on `item_translations(source_version_at)` for status queries
  - Create index on `article_translations(source_version_at)` for status queries
  - Consider composite index on `(entity_id, source_version_at)` for efficient lookups
- **Default Value**: NULL for existing records (will be populated when translations are created/updated going forward)
- **Constraints**: No NOT NULL constraint initially to avoid breaking existing data

### User Impact
Property owners will be able to identify which translations are potentially outdated when they update their source content. This enables informed decisions about which translations need refresh.

### Business Value
Provides the data foundation for stale translation detection and notification features. Without tracking source content versions, the system cannot alert owners to translations that may no longer accurately reflect their content.

### Acceptance Criteria
- [ ] Migration successfully adds `source_version_at` column to `item_translations` table
- [ ] Migration successfully adds `source_version_at` column to `article_translations` table
- [ ] Column type is TIMESTAMPTZ to handle timezone-aware timestamps
- [ ] Column allows NULL values for backward compatibility with existing records
- [ ] Index is created on `item_translations(source_version_at)`
- [ ] Index is created on `article_translations(source_version_at)`
- [ ] Existing translation records are not affected (NULL value for new column)
- [ ] Migration can be run idempotently without errors
- [ ] TypeScript database types are regenerated after migration to include new columns
- [ ] Rollback migration is defined to remove columns and indexes if needed

---

## REQ-E05-005: Update TypeScript Database Types

**Date**: 2026-01-22 18:30
**Type**: NEW FEATURE
**Size**: S

### Summary
The TypeScript database types in `/src/lib/supabase.ts` need to be updated to include the new `source_version_at` columns added by REQ-E05-004, and to ensure consistency across all translation table types including `reviewed_by` fields.

### Current Behavior
The `Database` type in `/src/lib/supabase.ts` defines TypeScript interfaces for all database tables, including translation tables (`item_translations`, `article_translations`, `link_translations`, `tag_translations`, `translation_jobs`). However:
- The `source_version_at` column added by REQ-E05-004 migration is not reflected in the TypeScript types
- The `item_translations` table type is missing the `reviewed_by` field that exists in `article_translations`
- Type inconsistencies between translation tables prevent unified translation management code

### Expected Behavior
The TypeScript database types are updated to reflect the current database schema:
- `item_translations` and `article_translations` types include `source_version_at: string | null` field
- `item_translations` type includes `reviewed_by: string | null` field for consistency with `article_translations`
- All Row, Insert, and Update type variants are updated for each affected table
- Types enable type-safe queries for stale translation detection and review tracking

### Technical Details
- **File**: `/src/lib/supabase.ts`
- **Tables to Update**:
  - `item_translations`:
    - Add `source_version_at: string | null` to Row type
    - Add `source_version_at?: string | null` to Insert type
    - Add `source_version_at?: string | null` to Update type
    - Add `reviewed_by: string | null` to Row type
    - Add `reviewed_by?: string | null` to Insert type
    - Add `reviewed_by?: string | null` to Update type
  - `article_translations`:
    - Add `source_version_at: string | null` to Row type
    - Add `source_version_at?: string | null` to Insert type
    - Add `source_version_at?: string | null` to Update type
- **Alternative Approach**: Regenerate types using Supabase CLI:
  ```bash
  npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.generated.ts
  ```
  Then update `/src/lib/supabase.ts` to import from the generated file or manually sync the types.

### User Impact
No direct user impact. This is a developer-facing change that enables type-safe development of translation management features. Without correct types, developers may encounter runtime errors or miss required fields when working with translation data.

### Business Value
Maintains type safety across the codebase and prevents runtime errors in translation management features. Ensures developers can confidently use IDE autocomplete and catch type mismatches at compile time rather than in production.

### Acceptance Criteria
- [ ] `item_translations` Row type includes `source_version_at: string | null`
- [ ] `item_translations` Insert type includes `source_version_at?: string | null`
- [ ] `item_translations` Update type includes `source_version_at?: string | null`
- [ ] `item_translations` Row type includes `reviewed_by: string | null`
- [ ] `item_translations` Insert type includes `reviewed_by?: string | null`
- [ ] `item_translations` Update type includes `reviewed_by?: string | null`
- [ ] `article_translations` Row type includes `source_version_at: string | null`
- [ ] `article_translations` Insert type includes `source_version_at?: string | null`
- [ ] `article_translations` Update type includes `source_version_at?: string | null`
- [ ] TypeScript compilation passes without errors related to translation types
- [ ] Existing code using translation tables continues to work without modification
- [ ] IDE autocomplete shows new fields when working with translation table types

---

## REQ-E05-006: Create TranslationManagement Types File

**Date**: 2026-01-22 19:30
**Type**: NEW FEATURE
**Size**: M

### Summary
The TranslationManagement component family requires a dedicated types file defining all shared interfaces and types used across the translation management UI components, hooks, and utilities.

### Current Behavior
No dedicated types file exists for the TranslationManagement component family. Types for translation management UI are either inline within components, imported from scattered locations, or not yet defined. This leads to inconsistent typing, duplication, and makes it difficult to share types across the component family.

### Expected Behavior
A centralized types file provides all interfaces and types needed by the TranslationManagement component family:
- Component prop interfaces for all TranslationManagement UI components
- State and action types for component state management
- API response types for translation management endpoints
- Configuration and options types for customization
- Re-exports common types from existing translation modules for convenience

### Technical Details
- **File**: `/src/components/TranslationManagement/TranslationManagement.types.ts`
- **Module Header**: Include JSDoc module documentation with `@module`, `@created`, and reference to this request
- **Organization**: Group types into logical sections with clear separators (similar to existing `*.types.ts` files in the codebase)

#### Core Types to Define

**Entity and Status Types:**
```typescript
// Re-export or alias core types from existing modules
export type { SupportedLanguage, TranslationStatus, TranslatableEntityType } from '@/lib/translation-service';
export type { EntityType, EntityTranslationStatus, LanguageTranslationStatus } from '@/lib/content-translation';
```

**Translation Item Display Types:**
```typescript
// For displaying translation items in lists/tables
interface TranslationItemDisplay {
  entityId: string;
  entityType: 'item' | 'article' | 'link' | 'tag';
  entityName: string;           // Display name of the source entity
  sourceLanguage: SupportedLanguage;
  propertyId?: string;          // For filtering by property
  propertyName?: string;        // For display
  translations: LanguageTranslationSummary[];
  overallStatus: 'complete' | 'partial' | 'pending' | 'failed' | 'stale';
  sourceUpdatedAt?: string;     // When source content was last modified
  isStale?: boolean;            // True if source was updated after translation
}

interface LanguageTranslationSummary {
  language: SupportedLanguage;
  status: TranslationStatus;
  translatedAt?: string;
  isStale?: boolean;
  canEdit: boolean;
  canRetranslate: boolean;
}
```

**Translation Preview Types:**
```typescript
// For side-by-side translation preview
interface TranslationPreviewData {
  entityId: string;
  entityType: TranslatableEntityType;
  sourceLanguage: SupportedLanguage;
  sourceContent: TranslationFieldContent[];
  targetLanguage: SupportedLanguage;
  targetContent: TranslationFieldContent[];
  status: TranslationStatus;
  translatedAt?: string;
  reviewedBy?: string;
  isStale?: boolean;
}

interface TranslationFieldContent {
  fieldName: string;
  fieldLabel: string;          // Human-readable label for UI
  value: string;
  maxLength?: number;
}
```

**Filter and Sort Types:**
```typescript
// Translation list filtering
interface TranslationFilterState {
  entityTypes?: TranslatableEntityType[];
  propertyIds?: string[];
  languages?: SupportedLanguage[];
  statuses?: ('complete' | 'partial' | 'pending' | 'failed' | 'stale')[];
  searchQuery?: string;
  showStaleOnly?: boolean;
}

type TranslationSortOption =
  | 'name-asc'
  | 'name-desc'
  | 'updated-desc'
  | 'updated-asc'
  | 'status-asc'
  | 'status-desc';
```

**Bulk Operation Types:**
```typescript
// For bulk translation operations
interface BulkTranslationRequest {
  entityIds: string[];
  entityType: TranslatableEntityType;
  targetLanguages: SupportedLanguage[];
  overwriteManual?: boolean;
}

interface BulkTranslationResult {
  totalRequested: number;
  queued: number;
  skipped: number;
  skippedReasons?: Record<string, string>;  // entityId -> reason
}
```

**Component Props Interfaces:**
```typescript
// TranslationStatusWidget props (dashboard widget)
interface TranslationStatusWidgetProps {
  propertyId?: string;           // Filter to specific property
  compact?: boolean;             // Compact mode for sidebar
  onViewAll?: () => void;        // Navigate to full management page
  className?: string;
}

// TranslationPreviewPanel props
interface TranslationPreviewPanelProps {
  entityId: string;
  entityType: TranslatableEntityType;
  targetLanguage: SupportedLanguage;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (data: TranslationPreviewData) => void;
  onRetranslate?: (entityId: string, language: SupportedLanguage) => void;
  className?: string;
}

// TranslationEditor props (inline editing)
interface TranslationEditorProps {
  entityId: string;
  entityType: TranslatableEntityType;
  language: SupportedLanguage;
  initialContent: TranslationFieldContent[];
  onSave: (content: TranslationFieldContent[]) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

// TranslationStatusItem props (row in list)
interface TranslationStatusItemProps {
  item: TranslationItemDisplay;
  onPreview: (item: TranslationItemDisplay, language: SupportedLanguage) => void;
  onEdit: (item: TranslationItemDisplay, language: SupportedLanguage) => void;
  onRetranslate: (item: TranslationItemDisplay, languages: SupportedLanguage[]) => void;
  isSelected?: boolean;
  onSelectionChange?: (selected: boolean) => void;
  className?: string;
}

// TranslationProgressBar props
interface TranslationProgressBarProps {
  completed: number;
  pending: number;
  failed: number;
  stale?: number;
  total: number;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

**Hook Return Types:**
```typescript
// useTranslationStatus hook return
interface UseTranslationStatusReturn {
  items: TranslationItemDisplay[];
  summary: TranslationSummary;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  filters: TranslationFilterState;
  setFilters: (filters: Partial<TranslationFilterState>) => void;
  sortBy: TranslationSortOption;
  setSortBy: (sort: TranslationSortOption) => void;
}

interface TranslationSummary {
  totalEntities: number;
  completeCount: number;
  partialCount: number;
  pendingCount: number;
  failedCount: number;
  staleCount: number;
  byLanguage: Record<SupportedLanguage, LanguageStatusCount>;
}

interface LanguageStatusCount {
  complete: number;
  pending: number;
  failed: number;
  stale: number;
}
```

**API Response Types:**
```typescript
// GET /api/translations/status response
interface TranslationStatusApiResponse {
  items: TranslationItemDisplay[];
  summary: TranslationSummary;
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

// PUT /api/translations/update request body
interface UpdateTranslationRequest {
  entityId: string;
  entityType: TranslatableEntityType;
  language: SupportedLanguage;
  content: TranslationFieldContent[];
}

// POST /api/translations/retranslate response
interface RetranslateApiResponse {
  jobCount: number;
  skippedCount: number;
  skippedEntities?: Array<{
    entityId: string;
    reason: string;
  }>;
}
```

### Dependencies
- **REQ-E05-001**: Translation Status API endpoint (provides data for types)
- **REQ-E05-002**: Update Translation API endpoint
- **REQ-E05-003**: Re-Translate API endpoint
- **REQ-E05-004**: source_version_at columns (for stale detection types)
- **REQ-E05-005**: TypeScript database types update
- **Existing**: `@/lib/translation-service/translation-service.types.ts`
- **Existing**: `@/lib/content-translation/content-translation.types.ts`

### User Impact
No direct user impact. This is a developer-facing infrastructure change that enables type-safe development of translation management UI components. Developers will have better IDE support, autocomplete, and compile-time type checking when building translation management features.

### Business Value
Establishes a strong typing foundation for the entire TranslationManagement component family. This reduces bugs, improves code maintainability, speeds up development, and ensures consistency across all translation management UI components. Following the established patterns in the codebase (like `ItemManager.types.ts`) ensures the code remains familiar and maintainable.

### Acceptance Criteria
- [ ] File created at `/src/components/TranslationManagement/TranslationManagement.types.ts`
- [ ] Module JSDoc header includes `@module TranslationManagement/types`, `@created` date, and reference to REQ-E05-006
- [ ] Types are organized into logical sections with clear comment separators
- [ ] Core types are re-exported from `@/lib/translation-service` and `@/lib/content-translation` for convenience
- [ ] `TranslationItemDisplay` interface defined with all fields for list/table display
- [ ] `LanguageTranslationSummary` interface defined for per-language status display
- [ ] `TranslationPreviewData` and `TranslationFieldContent` interfaces defined for preview panel
- [ ] `TranslationFilterState` interface defined with all filter options
- [ ] `TranslationSortOption` type defined with all sort options
- [ ] `BulkTranslationRequest` and `BulkTranslationResult` interfaces defined for bulk operations
- [ ] Props interfaces defined for: `TranslationStatusWidgetProps`, `TranslationPreviewPanelProps`, `TranslationEditorProps`, `TranslationStatusItemProps`, `TranslationProgressBarProps`
- [ ] Hook return type `UseTranslationStatusReturn` defined with state, actions, and computed values
- [ ] `TranslationSummary` and `LanguageStatusCount` interfaces defined for aggregate status
- [ ] API response types defined: `TranslationStatusApiResponse`, `UpdateTranslationRequest`, `RetranslateApiResponse`
- [ ] All interfaces include JSDoc comments explaining their purpose
- [ ] TypeScript compilation passes without errors
- [ ] Types follow naming conventions established in `ItemManager.types.ts` and `content-translation.types.ts`
- [ ] File exports all public types for use by other modules

---

## REQ-E05-007: Create TranslationPreviewPanel Component

**Date**: 2026-01-22 21:30
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners need a slide-in panel component that displays translation preview and management actions, allowing them to view source content alongside translations and take actions like editing, re-translating, or retrying failed translations.

### Current Behavior
No UI component exists for previewing translations in context. Owners cannot view source content side-by-side with translations, nor can they easily access translation management actions from a centralized interface.

### Expected Behavior
A slide-in panel component provides comprehensive translation preview and management:
- Panel slides in from the right side of the screen with 400px width
- Displays source content at the top of the panel for reference
- Lists all 6 supported languages with their current translation status
- Each language row shows status indicator (complete, pending, failed, stale)
- Action buttons available for each language: Edit, Re-translate, Retry (for failed)
- Panel can be opened for any translatable entity (item, article, link, tag)
- Smooth animation for open/close transitions
- Click outside or close button dismisses the panel
- Responsive behavior for mobile devices

### Technical Details
- **File**: `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`
- **Component Type**: Client component ('use client')
- **Styling**: Tailwind CSS with shadcn/ui components
- **Animation**: CSS transitions or Framer Motion for slide-in effect

#### Component Structure
```typescript
interface TranslationPreviewPanelProps {
  entityId: string;
  entityType: 'item' | 'article' | 'link' | 'tag';
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (language: SupportedLanguage) => void;
  onRetranslate?: (language: SupportedLanguage) => void;
  onRetry?: (language: SupportedLanguage) => void;
  className?: string;
}
```

#### Panel Layout
```
┌────────────────────────────────────────┐
│ [X Close]           Entity Name        │
├────────────────────────────────────────┤
│ SOURCE CONTENT                         │
│ ┌────────────────────────────────────┐ │
│ │ Title: [Original title text]       │ │
│ │ Description: [Original desc...]    │ │
│ │ Instructions: [Original instr...]  │ │
│ └────────────────────────────────────┘ │
├────────────────────────────────────────┤
│ TRANSLATIONS (6 languages)             │
│ ┌────────────────────────────────────┐ │
│ │ 🇪🇸 Spanish        ✓ Complete      │ │
│ │                   [Edit] [Re-trans]│ │
│ ├────────────────────────────────────┤ │
│ │ 🇫🇷 French         ⏳ Pending       │ │
│ │                   [—] [—]          │ │
│ ├────────────────────────────────────┤ │
│ │ 🇩🇪 German         ✗ Failed        │ │
│ │                   [Edit] [Retry]   │ │
│ ├────────────────────────────────────┤ │
│ │ 🇮🇹 Italian        ⚠ Stale         │ │
│ │                   [Edit] [Re-trans]│ │
│ ├────────────────────────────────────┤ │
│ │ 🇳🇱 Dutch          ○ Missing       │ │
│ │                   [—] [Translate]  │ │
│ ├────────────────────────────────────┤ │
│ │ 🇵🇹 Portuguese     ✓ Complete      │ │
│ │                   [Edit] [Re-trans]│ │
│ └────────────────────────────────────┘ │
├────────────────────────────────────────┤
│ [Re-translate All] [Close]             │
└────────────────────────────────────────┘
```

#### Subcomponents
- **TranslationPreviewPanel.tsx**: Main panel container with slide-in animation
- **SourceContentSection.tsx**: Displays original source content fields
- **LanguageStatusRow.tsx**: Individual language status with actions
- **index.ts**: Barrel export file

#### Key Implementation Details
1. **Data Fetching**: Use `useTranslationStatus` hook or direct API call to fetch translation status for the entity
2. **Status Display**: Color-coded status indicators matching the design system
3. **Action Handling**: Callback props for parent component to handle edit/re-translate/retry actions
4. **Loading State**: Skeleton loading while fetching translation data
5. **Error State**: Error message with retry option if data fetch fails
6. **Accessibility**: Focus trap when open, ESC key to close, ARIA labels for screen readers
7. **Overlay**: Semi-transparent backdrop when panel is open (optional, configurable)

#### Supported Languages (6 total)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Dutch (nl)
- Portuguese (pt)

#### Status Types and Actions
| Status | Icon | Available Actions |
|--------|------|-------------------|
| Complete | ✓ (green) | Edit, Re-translate |
| Pending | ⏳ (yellow) | None (in progress) |
| Failed | ✗ (red) | Edit, Retry |
| Stale | ⚠ (orange) | Edit, Re-translate |
| Missing | ○ (gray) | Translate |

### Dependencies
- **REQ-E05-001**: Translation Status API endpoint (data source)
- **REQ-E05-002**: Update Translation API endpoint (for Edit action)
- **REQ-E05-003**: Re-Translate API endpoint (for Re-translate/Retry actions)
- **REQ-E05-006**: TranslationManagement types file (TypeScript interfaces)
- **Existing**: `@/lib/translation-service` for language utilities
- **Existing**: shadcn/ui components (Button, Sheet/Drawer, Skeleton)

### User Impact
Property owners gain a centralized, intuitive interface for viewing and managing translations for any content item. The slide-in panel provides quick access without navigating away from the current view, enabling efficient translation management workflow.

### Business Value
Improves owner productivity in managing translations by providing a focused, action-oriented interface. Reduces the number of clicks needed to review and manage translations, and provides clear visibility into translation status across all languages. This is a core UI component for the Translation Management feature set.

### Acceptance Criteria
- [ ] Component file created at `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`
- [ ] Panel slides in from the right side of the screen when `isOpen` is true
- [ ] Panel width is 400px on desktop screens
- [ ] Panel is responsive and full-width on mobile screens (<640px)
- [ ] Source content section displays at the top showing original entity content
- [ ] All 6 supported languages are listed with their current translation status
- [ ] Status indicators are color-coded: green (complete), yellow (pending), red (failed), orange (stale), gray (missing)
- [ ] Edit button is available for complete, failed, and stale translations
- [ ] Re-translate button is available for complete and stale translations
- [ ] Retry button is available for failed translations
- [ ] Translate button is available for missing translations
- [ ] Pending translations show disabled/unavailable actions
- [ ] Close button (X) in the header dismisses the panel
- [ ] Clicking outside the panel dismisses it (if overlay is enabled)
- [ ] ESC key dismisses the panel
- [ ] `onClose` callback is called when panel is dismissed by any method
- [ ] `onEdit` callback is called with language code when Edit button is clicked
- [ ] `onRetranslate` callback is called with language code when Re-translate button is clicked
- [ ] `onRetry` callback is called with language code when Retry button is clicked
- [ ] Loading skeleton is displayed while fetching translation data
- [ ] Error state is displayed with retry option if data fetch fails
- [ ] Panel has smooth open/close animation (150-300ms duration)
- [ ] Component uses i18n for all UI text via next-intl
- [ ] ARIA attributes are applied for accessibility (role, aria-label, aria-hidden)
- [ ] Focus is trapped within the panel when open
- [ ] TypeScript types from REQ-E05-006 are used for props and data
- [ ] Component is exported from barrel file `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts`
- [ ] Component follows existing code patterns in `/src/components/TranslationManagement/`

---

## REQ-E05-008: Create TranslationStatusItem Component

**Date**: 2026-01-22 22:15
**Type**: NEW FEATURE
**Size**: S

### Summary
Property owners need a reusable row component that displays the translation status for a single language, including the country flag, language name, status indicator, preview text, and action buttons. This component is used within the TranslationPreviewPanel to show each language's translation status.

### Current Behavior
No dedicated component exists for displaying individual language translation status rows. The TranslationPreviewPanel (REQ-E05-007) requires a subcomponent to render each of the 6 supported language rows with consistent styling and behavior.

### Expected Behavior
A reusable row component displays translation status for a single language:
- Shows country flag emoji or icon on the left
- Displays language name (e.g., "Spanish", "French", "German")
- Shows status icon with appropriate color coding per specification
- Displays truncated preview text of the translated content (when available)
- Provides action buttons appropriate to the current status
- Supports selection state for bulk operations
- Handles click interactions for preview and edit actions

### Technical Details
- **File**: `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`
- **Component Type**: Client component ('use client')
- **Styling**: Tailwind CSS with shadcn/ui components

#### Component Props Interface
```typescript
interface TranslationStatusItemProps {
  language: SupportedLanguage;
  languageName: string;
  status: 'complete' | 'pending' | 'failed' | 'stale' | 'missing' | 'manual';
  previewText?: string;
  translatedAt?: string;
  isStale?: boolean;
  onPreview?: () => void;
  onEdit?: () => void;
  onRetranslate?: () => void;
  onRetry?: () => void;
  isSelected?: boolean;
  onSelectionChange?: (selected: boolean) => void;
  disabled?: boolean;
  className?: string;
}
```

#### Row Layout
```
┌─────────────────────────────────────────────────────────────┐
│ [🔲] 🇪🇸 Spanish    ✓ Complete    "Bienvenido a..."  [Edit][↻]│
└─────────────────────────────────────────────────────────────┘
│  │   │  │           │  │          │                  │    │
│  │   │  │           │  │          │                  │    └─ Re-translate button
│  │   │  │           │  │          │                  └────── Edit button
│  │   │  │           │  │          └───────────────────────── Preview text (truncated)
│  │   │  │           │  └──────────────────────────────────── Status text
│  │   │  │           └─────────────────────────────────────── Status icon (colored)
│  │   │  └─────────────────────────────────────────────────── Language name
│  │   └────────────────────────────────────────────────────── Flag emoji
│  └────────────────────────────────────────────────────────── Checkbox (for bulk select)
└───────────────────────────────────────────────────────────── Row container
```

#### Status Colors per Specification
| Status | Color | Icon | Description |
|--------|-------|------|-------------|
| Complete | Green (#22c55e / green-500) | ✓ Check | Translation exists and is up-to-date |
| Pending | Orange (#f97316 / orange-500) | ⏳ Clock/Spinner | Translation is being processed |
| Failed | Red (#ef4444 / red-500) | ✗ X | Translation attempt failed |
| Manual | Purple (#a855f7 / purple-500) | ✎ Pencil | Translation was manually edited |
| Stale | Orange (#f97316 / orange-500) | ⚠ Warning | Source content changed after translation |
| Missing | Gray (#9ca3af / gray-400) | ○ Circle | No translation exists |

#### Action Button Availability by Status
| Status | Edit | Re-translate | Retry | Translate |
|--------|------|--------------|-------|-----------|
| Complete | ✓ | ✓ | - | - |
| Pending | - | - | - | - |
| Failed | ✓ | - | ✓ | - |
| Manual | ✓ | ✓ | - | - |
| Stale | ✓ | ✓ | - | - |
| Missing | - | - | - | ✓ |

#### Flag Emoji Mapping
```typescript
const languageFlags: Record<SupportedLanguage, string> = {
  en: '🇬🇧',  // English (source, may not be shown)
  es: '🇪🇸',  // Spanish
  fr: '🇫🇷',  // French
  de: '🇩🇪',  // German
  it: '🇮🇹',  // Italian
  nl: '🇳🇱',  // Dutch
  pt: '🇵🇹',  // Portuguese
};
```

#### Key Implementation Details
1. **Hover State**: Row highlights on hover to indicate interactivity
2. **Click Behavior**: Clicking the row (outside buttons) triggers `onPreview` if provided
3. **Preview Text**: Truncated to ~30 characters with ellipsis, shows tooltip on hover with full text
4. **Timestamp**: Shows relative time (e.g., "2 hours ago") for `translatedAt` on hover
5. **Selection**: Optional checkbox for bulk selection operations
6. **Disabled State**: Grays out the row and disables all interactions when `disabled` is true
7. **Accessibility**: Proper ARIA labels, keyboard navigation support, focus states
8. **i18n**: All UI text uses next-intl translations

### Dependencies
- **REQ-E05-006**: TranslationManagement types file (for `SupportedLanguage` and status types)
- **REQ-E05-007**: TranslationPreviewPanel (parent component that uses this)
- **Existing**: shadcn/ui components (Button, Checkbox, Tooltip)
- **Existing**: next-intl for translations
- **Existing**: `@/lib/translation-service` for language utilities

### User Impact
Property owners see a clear, consistent display of each language's translation status. The visual indicators make it immediately apparent which translations are complete, pending, failed, or need attention. Action buttons provide quick access to common tasks without extra clicks.

### Business Value
This component is a core building block for the Translation Management UI. Consistent, well-designed status rows improve user comprehension and reduce confusion. The component is reusable across multiple contexts (preview panel, translation list, dashboard widgets), maximizing development efficiency.

### Acceptance Criteria
- [ ] Component file created at `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`
- [ ] Component accepts all props defined in `TranslationStatusItemProps` interface
- [ ] Flag emoji is displayed for each supported language
- [ ] Language name is displayed next to the flag
- [ ] Status icon is displayed with correct color per specification:
  - [ ] Green (#22c55e) for 'complete' status with check icon
  - [ ] Orange (#f97316) for 'pending' status with clock/spinner icon
  - [ ] Red (#ef4444) for 'failed' status with X icon
  - [ ] Purple (#a855f7) for 'manual' status with pencil icon
  - [ ] Orange (#f97316) for 'stale' status with warning icon
  - [ ] Gray (#9ca3af) for 'missing' status with circle icon
- [ ] Preview text is displayed when provided, truncated to ~30 characters
- [ ] Tooltip shows full preview text on hover when text is truncated
- [ ] Edit button is shown and enabled for 'complete', 'failed', 'manual', and 'stale' statuses
- [ ] Re-translate button is shown and enabled for 'complete', 'manual', and 'stale' statuses
- [ ] Retry button is shown and enabled for 'failed' status
- [ ] Translate button is shown and enabled for 'missing' status
- [ ] No action buttons are enabled for 'pending' status
- [ ] Clicking Edit button calls `onEdit` callback
- [ ] Clicking Re-translate button calls `onRetranslate` callback
- [ ] Clicking Retry button calls `onRetry` callback
- [ ] Clicking the row (outside buttons) calls `onPreview` callback if provided
- [ ] Checkbox is displayed when `onSelectionChange` prop is provided
- [ ] Checkbox state reflects `isSelected` prop
- [ ] Checking/unchecking calls `onSelectionChange` with new selection state
- [ ] Row shows hover highlight effect
- [ ] Row is grayed out and interactions disabled when `disabled` prop is true
- [ ] Component uses i18n for all UI text via next-intl (status labels, button labels, tooltips)
- [ ] ARIA attributes are applied for accessibility (aria-label, role)
- [ ] Component supports keyboard navigation (Tab to buttons, Enter/Space to activate)
- [ ] `className` prop is applied to root element for custom styling
- [ ] TypeScript types are properly imported from TranslationManagement.types.ts
- [ ] Component is exported from barrel file `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts`
- [ ] Component follows existing code patterns in `/src/components/TranslationManagement/`

---

## REQ-E05-009: Create TranslationProgressBar Component

**Date**: 2026-01-22 23:45
**Type**: NEW FEATURE
**Size**: S

### Summary
Property owners need a visual progress indicator component that displays translation completion status in a clear, at-a-glance format (e.g., "3/5 translations complete"). The component should support animated states during translation processing operations.

### Current Behavior
No visual progress indicator component exists for translation completion status. Owners cannot quickly assess how many translations are complete, pending, or failed for a given entity or across their content. The TranslationPreviewPanel (REQ-E05-007) and other translation management components need a reusable progress visualization.

### Expected Behavior
A progress bar component visually communicates translation completion status:
- Shows segmented progress bar with colored sections for complete/pending/failed/stale translations
- Displays numeric summary (e.g., "3/5 complete" or "3 of 5 translations")
- Supports animated/pulsing state during active translation processing
- Configurable size variants (small, medium, large) for different contexts
- Optional label display for detailed breakdown
- Accessible with proper ARIA attributes for screen readers

### Technical Details
- **File**: `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`
- **Component Type**: Client component ('use client')
- **Styling**: Tailwind CSS with CSS transitions/animations

#### Component Props Interface
```typescript
interface TranslationProgressBarProps {
  completed: number;           // Count of complete translations
  pending: number;             // Count of pending/in-progress translations
  failed: number;              // Count of failed translations
  stale?: number;              // Count of stale translations (optional)
  total: number;               // Total number of possible translations
  showLabels?: boolean;        // Show text labels with counts (default: false)
  showPercentage?: boolean;    // Show completion percentage (default: false)
  size?: 'sm' | 'md' | 'lg';   // Size variant (default: 'md')
  animated?: boolean;          // Enable pulse animation for pending (default: true when pending > 0)
  labelFormat?: 'compact' | 'detailed';  // "3/5" vs "3 of 5 translations" (default: 'compact')
  className?: string;          // Additional CSS classes
}
```

#### Visual Layout
```
Size: sm (h-1.5)
┌────────────────────────────────────────────────────────────┐
│██████████████████████████░░░░░░░░░░████████░░░░░░░░░░░░░░░░│
│       Complete (green)    Pending(orange)  Failed(red) Stale│
└────────────────────────────────────────────────────────────┘

Size: md (h-2) with labels
┌────────────────────────────────────────────────────────────┐
│                        3/6 complete                         │
│██████████████████████████░░░░░░░░░░████████▒▒▒▒▒▒▒▒░░░░░░░│
│       Complete (green)    Pending  Failed  Stale   Missing │
└────────────────────────────────────────────────────────────┘

Size: lg (h-3) with detailed labels
┌────────────────────────────────────────────────────────────┐
│              3 of 6 translations complete                   │
│██████████████████████████░░░░░░░░░░████████▒▒▒▒▒▒▒▒░░░░░░░│
│ ● 3 Complete  ● 1 Pending  ● 1 Failed  ● 1 Stale           │
└────────────────────────────────────────────────────────────┘
```

#### Color Scheme (matching TranslationStatusItem spec)
| Segment | Color | Tailwind Class | Description |
|---------|-------|----------------|-------------|
| Complete | Green | bg-green-500 | Successfully translated content |
| Pending | Orange | bg-orange-500 | Translation in progress (animated pulse) |
| Failed | Red | bg-red-500 | Translation attempt failed |
| Stale | Amber | bg-amber-500 | Source updated after translation |
| Missing | Gray | bg-gray-200 | No translation exists (background) |

#### Animation Specification
- **Pending Animation**: When `pending > 0` and `animated` is true, the pending segment pulses with opacity animation
- **Animation CSS**: `animate-pulse` Tailwind class or custom keyframes for subtle pulse effect
- **Transition**: Smooth width transitions when values change (duration: 300ms, ease: ease-in-out)
- **Reduced Motion**: Respect `prefers-reduced-motion` media query to disable animations

#### Size Variants
| Size | Bar Height | Font Size | Use Case |
|------|-----------|-----------|----------|
| sm | 6px (h-1.5) | text-xs | Inline status, table cells |
| md | 8px (h-2) | text-sm | Cards, list items (default) |
| lg | 12px (h-3) | text-base | Dashboard widgets, headers |

#### Key Implementation Details
1. **Segment Calculation**: Each segment width is proportional to its count relative to total
2. **Zero Handling**: When a count is 0, that segment is not rendered (no empty colored sections)
3. **Overflow Prevention**: Ensure segments never exceed 100% width combined
4. **Missing Calculation**: `missing = total - (completed + pending + failed + (stale || 0))`
5. **Background**: Gray background shows missing/incomplete portion
6. **Border Radius**: Rounded ends on the overall bar and appropriate rounding on segments
7. **Accessibility**: ARIA progressbar role with aria-valuenow, aria-valuemin, aria-valuemax
8. **Screen Reader Text**: Hidden text describes full status for screen readers

#### Example Usage
```tsx
// Simple usage in a list item
<TranslationProgressBar
  completed={3}
  pending={1}
  failed={1}
  total={6}
  size="sm"
/>

// Dashboard widget with labels
<TranslationProgressBar
  completed={45}
  pending={5}
  failed={2}
  stale={3}
  total={60}
  showLabels={true}
  labelFormat="detailed"
  size="lg"
/>

// Processing state with animation
<TranslationProgressBar
  completed={2}
  pending={4}
  failed={0}
  total={6}
  animated={true}
  showPercentage={true}
/>
```

### Dependencies
- **REQ-E05-006**: TranslationManagement types file (for `TranslationProgressBarProps` interface)
- **REQ-E05-007**: TranslationPreviewPanel (parent component that uses this)
- **Existing**: Tailwind CSS for styling
- **Existing**: next-intl for i18n text labels

### User Impact
Property owners get immediate visual feedback on translation progress. The animated state during processing provides reassurance that translations are being generated. The color-coded segments make it easy to identify issues (failed/stale) at a glance without reading detailed text.

### Business Value
This component provides clear visual communication of translation status across the Translation Management UI. It reduces cognitive load for owners by presenting complex status information in an intuitive format. The reusable nature means consistent progress visualization across dashboard widgets, list views, and preview panels.

### Acceptance Criteria
- [ ] Component file created at `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`
- [ ] Component accepts all props defined in `TranslationProgressBarProps` interface
- [ ] Progress bar renders with correct segment widths proportional to counts
- [ ] Complete segment is green (bg-green-500 / #22c55e)
- [ ] Pending segment is orange (bg-orange-500 / #f97316)
- [ ] Failed segment is red (bg-red-500 / #ef4444)
- [ ] Stale segment is amber (bg-amber-500 / #f59e0b) when stale count is provided
- [ ] Missing/incomplete portion shows gray background (bg-gray-200)
- [ ] Size 'sm' renders bar at 6px height with text-xs labels
- [ ] Size 'md' renders bar at 8px height with text-sm labels (default)
- [ ] Size 'lg' renders bar at 12px height with text-base labels
- [ ] `showLabels={true}` displays numeric summary above or below the bar
- [ ] `labelFormat='compact'` shows format like "3/5"
- [ ] `labelFormat='detailed'` shows format like "3 of 5 translations complete"
- [ ] `showPercentage={true}` shows completion percentage (e.g., "50%")
- [ ] Pending segment pulses/animates when `animated` is true and pending > 0
- [ ] Animation respects `prefers-reduced-motion` media query
- [ ] Segment widths transition smoothly when values change (300ms ease-in-out)
- [ ] Zero-count segments are not rendered (no empty colored sections)
- [ ] Total width of all segments never exceeds 100%
- [ ] Bar has rounded corners (rounded-full or similar)
- [ ] ARIA attributes applied: role="progressbar", aria-valuenow, aria-valuemin="0", aria-valuemax
- [ ] Screen reader text describes full status (e.g., "3 complete, 1 pending, 1 failed of 5 translations")
- [ ] `className` prop is applied to root element for custom styling
- [ ] Component uses i18n for all UI text via next-intl
- [ ] TypeScript types are properly imported/defined
- [ ] Component is exported from barrel file `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts`
- [ ] Component follows existing code patterns in `/src/components/TranslationManagement/`

---

## REQ-E05-010: Create TranslationEditor Component

**Date**: 2026-01-22 10:30
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners need a modal dialog component for editing translation content with a side-by-side view showing original source content alongside the editable translation. This enables owners to review, correct, and improve machine-generated translations while referencing the original text.

### Current Behavior
No UI component exists for editing translation content inline. Owners cannot manually edit, correct, or refine translations through the application interface. The TranslationPreviewPanel (REQ-E05-007) requires an editor component to handle the "Edit" action when owners want to modify translation content.

### Expected Behavior
A modal dialog component provides comprehensive translation editing capabilities:
- Modal dialog using Radix Dialog component for consistent UI behavior
- Side-by-side layout: Original source content on the left, editable translation on the right
- Textarea input for editing translation content (title, description, instructions)
- Character count display with warning indicator when approaching or exceeding limits
- Save and Cancel buttons with appropriate enabled/disabled states
- Dirty state tracking to warn users about unsaved changes
- Loading state during save operations
- Error handling with clear feedback messages

### Technical Details
- **File**: `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`
- **Component Type**: Client component ('use client')
- **Styling**: Tailwind CSS with shadcn/ui Dialog component
- **State Management**: React useState/useReducer for form state and dirty tracking

#### Component Props Interface
```typescript
interface TranslationEditorProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  entityType: 'item' | 'article' | 'link' | 'tag';
  language: SupportedLanguage;
  sourceContent: TranslationFieldContent[];
  initialTranslation: TranslationFieldContent[];
  onSave: (content: TranslationFieldContent[]) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

interface TranslationFieldContent {
  fieldName: string;        // e.g., 'title', 'description', 'instructions'
  fieldLabel: string;       // Human-readable label, e.g., 'Title', 'Description'
  value: string;            // The content value
  maxLength?: number;       // Optional character limit for the field
}
```

#### Modal Layout
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Edit Translation - Spanish                                    [X Close]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐      │
│  │     ORIGINAL (English)      │  │    TRANSLATION (Spanish)    │      │
│  ├─────────────────────────────┤  ├─────────────────────────────┤      │
│  │ Title                       │  │ Title                       │      │
│  │ ┌─────────────────────────┐ │  │ ┌─────────────────────────┐ │      │
│  │ │ Welcome to the House    │ │  │ │ Bienvenido a la Casa    │ │      │
│  │ └─────────────────────────┘ │  │ └─────────────────────────┘ │      │
│  │                             │  │                    45/100 ✓ │      │
│  ├─────────────────────────────┤  ├─────────────────────────────┤      │
│  │ Description                 │  │ Description                 │      │
│  │ ┌─────────────────────────┐ │  │ ┌─────────────────────────┐ │      │
│  │ │ This cozy apartment is  │ │  │ │ Este acogedor apartamen │ │      │
│  │ │ located in the heart of │ │  │ │ to está ubicado en el   │ │      │
│  │ │ downtown...             │ │  │ │ corazón del centro...   │ │      │
│  │ └─────────────────────────┘ │  │ └─────────────────────────┘ │      │
│  │                             │  │                   180/500 ✓ │      │
│  ├─────────────────────────────┤  ├─────────────────────────────┤      │
│  │ Instructions                │  │ Instructions                │      │
│  │ ┌─────────────────────────┐ │  │ ┌─────────────────────────┐ │      │
│  │ │ Please remove shoes at  │ │  │ │ Por favor, quítese los  │ │      │
│  │ │ the entrance...         │ │  │ │ zapatos en la entrada...│ │      │
│  │ └─────────────────────────┘ │  │ └─────────────────────────┘ │      │
│  │                             │  │                   520/500 ⚠ │      │
│  └─────────────────────────────┘  └─────────────────────────────┘      │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  ⚠ You have unsaved changes                    [Cancel]  [Save Changes] │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Subcomponents
- **TranslationEditor.tsx**: Main modal container with Dialog wrapper
- **TranslationFieldPair.tsx**: Side-by-side original/translation field pair
- **CharacterCounter.tsx**: Character count display with warning states
- **index.ts**: Barrel export file

#### Character Count Behavior
| Count vs Limit | Color | Icon | Description |
|----------------|-------|------|-------------|
| < 80% of limit | Gray | None | Normal state |
| 80-99% of limit | Yellow/Amber | ⚠ | Approaching limit warning |
| = limit | Green | ✓ | At exact limit |
| > limit | Red | ⚠ | Over limit warning |

#### Dirty State Tracking
- Track changes to each field by comparing current value to initial value
- `isDirty` is true when any field differs from its initial value
- Show unsaved changes warning when `isDirty` is true
- Prompt user to confirm if closing with unsaved changes
- Save button is disabled when `isDirty` is false (no changes to save)
- Save button shows loading spinner during save operation

#### Key Implementation Details
1. **Dialog Component**: Use Radix Dialog via shadcn/ui for modal behavior
2. **Responsive Layout**: Side-by-side on desktop (lg+), stacked on mobile
3. **Field Synchronization**: Scroll position sync between original and translation panels (optional enhancement)
4. **Auto-resize Textareas**: Textareas grow/shrink based on content length
5. **Keyboard Support**: Tab between fields, Escape to close (with unsaved changes check)
6. **Focus Management**: Focus first translation field when modal opens
7. **Loading State**: Disable all inputs and show spinner on Save button during save
8. **Error Handling**: Display error message if save fails, keep modal open for retry
9. **Success Handling**: Close modal automatically on successful save
10. **i18n**: All UI labels use next-intl translations

#### State Structure
```typescript
interface EditorState {
  fields: TranslationFieldContent[];
  isDirty: boolean;
  isSubmitting: boolean;
  error: string | null;
  showUnsavedWarning: boolean;
}
```

### Dependencies
- **REQ-E05-002**: Update Translation API endpoint (for save operation)
- **REQ-E05-006**: TranslationManagement types file (TypeScript interfaces)
- **REQ-E05-007**: TranslationPreviewPanel (parent component that opens this editor)
- **REQ-E05-008**: TranslationStatusItem (provides Edit action that opens this editor)
- **Existing**: shadcn/ui Dialog component
- **Existing**: next-intl for translations
- **Existing**: `@/lib/translation-service` for language utilities

### User Impact
Property owners gain the ability to manually edit and refine translations directly in the application. The side-by-side view makes it easy to reference the original content while editing, ensuring accurate translations. Character count warnings help owners stay within field limits. Dirty state tracking prevents accidental loss of edits.

### Business Value
Enables human oversight and quality control of translations, which is critical for property owners who want to ensure their content accurately represents their property and brand. This feature completes the translation editing workflow started in REQ-E05-007 and REQ-E05-008, allowing owners to take action on translations that need attention.

### Acceptance Criteria
- [ ] Component file created at `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`
- [ ] Modal uses Radix Dialog via shadcn/ui for consistent behavior
- [ ] Modal displays title indicating the target language being edited (e.g., "Edit Translation - Spanish")
- [ ] Close button (X) in header closes the modal
- [ ] Side-by-side layout displays original content on the left and translation on the right
- [ ] Layout is responsive: side-by-side on desktop (lg+), stacked on mobile
- [ ] Each translatable field (title, description, instructions) is displayed as a pair
- [ ] Original field content is displayed as read-only text
- [ ] Translation field content is displayed in an editable textarea
- [ ] Textareas auto-resize based on content length (minimum 3 rows)
- [ ] Character count is displayed below each translation textarea
- [ ] Character count shows gray text when under 80% of limit
- [ ] Character count shows yellow/amber warning when at 80-99% of limit
- [ ] Character count shows green check when at exact limit
- [ ] Character count shows red warning when over limit
- [ ] `isDirty` state is true when any field differs from initial value
- [ ] Unsaved changes warning message is displayed when `isDirty` is true
- [ ] Attempting to close with unsaved changes shows confirmation prompt
- [ ] Cancel button closes the modal (with unsaved changes check if dirty)
- [ ] Save button is disabled when `isDirty` is false
- [ ] Save button is disabled and shows loading spinner when `isLoading` is true
- [ ] Clicking Save calls `onSave` with updated `TranslationFieldContent[]`
- [ ] Modal closes automatically on successful save
- [ ] Error message is displayed if save fails
- [ ] Modal stays open on save failure to allow retry
- [ ] First translation textarea receives focus when modal opens
- [ ] Tab key navigates between translation textareas
- [ ] Escape key attempts to close modal (with unsaved changes check)
- [ ] All inputs are disabled during save operation
- [ ] Component uses i18n for all UI text via next-intl
- [ ] ARIA attributes applied for accessibility (aria-label, role="dialog", aria-modal)
- [ ] `className` prop is applied to Dialog content for custom styling
- [ ] TypeScript types are properly imported from TranslationManagement.types.ts
- [ ] Component is exported from barrel file `/src/components/TranslationManagement/TranslationEditor/index.ts`
- [ ] Component follows existing code patterns in `/src/components/TranslationManagement/`

---

## REQ-E05-011: Create useTranslationStatus Hook

**Date**: 2026-01-22 11:45
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners need a React hook that fetches and manages translation status data from the API, supporting both single entity queries and property-wide translation status aggregation. The hook provides loading, error, and data states for use in translation management UI components.

### Current Behavior
No React hook exists for fetching translation status from the API. Components that need translation status data would have to implement their own data fetching logic, leading to code duplication and inconsistent error handling across the Translation Management component family.

### Expected Behavior
A custom React hook provides centralized translation status data fetching:
- Fetches translation status from the Translation Status API endpoint (REQ-E05-001)
- Supports querying status for a single entity (item, article, link, tag) by ID
- Supports querying aggregated status across all entities for a property
- Returns standard data fetching states: loading, error, data
- Provides refetch function for manual data refresh
- Supports automatic polling/refetch for real-time status updates (optional)
- Integrates with React Query or SWR for caching and deduplication (if available in codebase)
- Memoizes results to prevent unnecessary re-renders

### Technical Details
- **File**: `/src/hooks/useTranslationStatus.ts`
- **Dependencies**: React, fetch API or axios, optionally React Query/SWR if available
- **Exports**: `useTranslationStatus` hook function and related types

#### Hook Signature
```typescript
interface UseTranslationStatusOptions {
  entityId?: string;                    // Query single entity by ID
  entityType?: 'item' | 'article' | 'link' | 'tag';  // Entity type for single entity query
  propertyId?: string;                  // Query all entities for a property
  languages?: SupportedLanguage[];      // Filter by specific languages
  statuses?: TranslationStatus[];       // Filter by specific statuses
  enabled?: boolean;                    // Enable/disable the query (default: true)
  refetchInterval?: number;             // Auto-refetch interval in ms (optional)
  onError?: (error: Error) => void;     // Error callback
}

interface UseTranslationStatusReturn {
  // Data
  data: TranslationStatusData | null;
  items: TranslationItemDisplay[];      // Convenience accessor for items array
  summary: TranslationSummary | null;   // Convenience accessor for summary

  // States
  isLoading: boolean;
  isRefetching: boolean;
  isError: boolean;
  error: Error | null;

  // Actions
  refetch: () => Promise<void>;

  // Metadata
  lastUpdated: Date | null;
  isFetched: boolean;
}

interface TranslationStatusData {
  items: TranslationItemDisplay[];
  summary: TranslationSummary;
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

function useTranslationStatus(options: UseTranslationStatusOptions): UseTranslationStatusReturn;
```

#### API Integration
The hook calls the Translation Status API endpoint (REQ-E05-001):
```typescript
// Single entity query
GET /api/translations/status?entityId={id}&entityType={type}

// Property-wide query
GET /api/translations/status?propertyId={id}

// With filters
GET /api/translations/status?propertyId={id}&languages=es,fr&statuses=pending,failed
```

#### Response Transformation
The hook transforms the API response into the `TranslationStatusData` format:
- Maps API response items to `TranslationItemDisplay` objects
- Calculates `TranslationSummary` from response data if not provided by API
- Handles pagination metadata if returned by API

#### Error Handling
- Network errors set `isError: true` and populate `error` with Error object
- HTTP error responses (4xx, 5xx) are converted to Error objects with status code
- `onError` callback is invoked when errors occur
- Retry logic for transient failures (optional, configurable)

#### Caching Strategy
If React Query or SWR is available in the codebase:
- Use query key based on options: `['translationStatus', entityId, entityType, propertyId, languages, statuses]`
- Cache time: 5 minutes (configurable)
- Stale time: 1 minute (configurable)
- Deduplicate concurrent requests with same parameters

If not using a caching library:
- Implement simple in-memory cache with timestamp
- Prevent duplicate requests while one is in flight
- Clear cache on refetch

#### Example Usage
```typescript
// Query single entity
const { data, isLoading, error } = useTranslationStatus({
  entityId: 'item-123',
  entityType: 'item',
});

// Query all items for a property
const { items, summary, refetch } = useTranslationStatus({
  propertyId: 'property-456',
});

// Query with filters and auto-refresh
const { data, isRefetching } = useTranslationStatus({
  propertyId: 'property-456',
  statuses: ['pending', 'failed'],
  refetchInterval: 10000, // Refresh every 10 seconds
});

// Disabled until needed
const { data } = useTranslationStatus({
  entityId: selectedItemId,
  entityType: 'item',
  enabled: !!selectedItemId, // Only fetch when item is selected
});
```

#### Implementation Notes
1. **Validation**: Validate that either `entityId + entityType` OR `propertyId` is provided, not both
2. **URL Construction**: Build query string from non-undefined options
3. **Abort Controller**: Cancel in-flight requests when options change or component unmounts
4. **SSR Safety**: Handle server-side rendering where fetch may not be available
5. **Type Safety**: Full TypeScript types for options, return value, and API response

### Dependencies
- **REQ-E05-001**: Translation Status API endpoint (data source)
- **REQ-E05-006**: TranslationManagement types file (`TranslationItemDisplay`, `TranslationSummary`, etc.)
- **Existing**: React hooks (useState, useEffect, useCallback, useMemo)
- **Existing**: Fetch API or axios for HTTP requests
- **Optional**: React Query or SWR if available in the codebase

### User Impact
No direct user impact. This is a developer-facing infrastructure component that enables efficient and consistent data fetching for translation management UI components. End users benefit indirectly through more responsive UI with proper loading states and error handling.

### Business Value
Centralizes translation status data fetching logic, eliminating code duplication across components. Provides consistent loading and error states that improve user experience. The hook pattern makes it easy to add translation status to any component in the Translation Management family, accelerating development of future features.

### Acceptance Criteria
- [ ] Hook file created at `/src/hooks/useTranslationStatus.ts`
- [ ] Hook accepts `UseTranslationStatusOptions` parameter with all documented options
- [ ] Hook returns `UseTranslationStatusReturn` object with all documented properties
- [ ] When `entityId` and `entityType` are provided, fetches status for single entity
- [ ] When `propertyId` is provided, fetches aggregated status for all property entities
- [ ] Validation error is thrown if neither `entityId/entityType` nor `propertyId` is provided
- [ ] Validation error is thrown if both `entityId` and `propertyId` are provided
- [ ] `isLoading` is `true` during initial data fetch
- [ ] `isRefetching` is `true` during subsequent refetches (when data already exists)
- [ ] `isError` is `true` and `error` is populated when API request fails
- [ ] `data` contains `TranslationStatusData` when fetch succeeds
- [ ] `items` convenience accessor returns `data.items` or empty array
- [ ] `summary` convenience accessor returns `data.summary` or null
- [ ] `refetch()` function triggers a new API request
- [ ] `lastUpdated` contains timestamp of last successful fetch
- [ ] `isFetched` is `true` after first successful fetch
- [ ] `enabled: false` prevents automatic fetching
- [ ] `refetchInterval` triggers automatic refetch at specified interval
- [ ] `onError` callback is invoked when errors occur
- [ ] `languages` filter is passed to API as query parameter
- [ ] `statuses` filter is passed to API as query parameter
- [ ] In-flight requests are cancelled when options change
- [ ] In-flight requests are cancelled when component unmounts
- [ ] Duplicate concurrent requests with same parameters are deduplicated
- [ ] Hook handles server-side rendering without errors
- [ ] TypeScript types are properly defined and exported
- [ ] Hook is exported from `/src/hooks/index.ts` barrel file (if exists)
- [ ] Unit tests verify all hook behaviors (if test framework is set up)
- [ ] Hook follows existing patterns in `/src/hooks/` directory

---

## REQ-E05-012: Create useTranslationRealtime Hook

**Date**: 2026-01-22 14:30
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners need a React hook that establishes a Supabase realtime subscription for translation updates, enabling the UI to automatically refresh when translations complete, fail, or are updated. This provides a seamless experience where owners see translation status changes in real-time without manual page refresh.

### Current Behavior
No React hook exists for subscribing to realtime translation updates. When translations are processed asynchronously (via background jobs), the UI does not reflect status changes until the user manually refreshes the page or triggers a refetch. This creates a disjointed experience where owners cannot see when their translations complete.

### Expected Behavior
A custom React hook provides Supabase realtime subscription for translation tables:
- Subscribes to INSERT, UPDATE, and DELETE events on translation tables
- Filters subscriptions to only relevant entities (owned by the authenticated user)
- Provides callback mechanism for notifying parent components of changes
- Automatically cleans up subscription on component unmount
- Supports subscribing to multiple entity types (items, articles, links, tags)
- Handles reconnection gracefully when connection is lost
- Integrates with useTranslationStatus hook for automatic data refresh

### Technical Details
- **File**: `/src/hooks/useTranslationRealtime.ts`
- **Dependencies**: Supabase client, React hooks
- **Exports**: `useTranslationRealtime` hook function and related types

#### Hook Signature
```typescript
interface UseTranslationRealtimeOptions {
  entityId?: string;                    // Subscribe to updates for specific entity
  entityType?: 'item' | 'article' | 'link' | 'tag';  // Entity type filter
  propertyId?: string;                  // Subscribe to all entities for a property
  enabled?: boolean;                    // Enable/disable subscription (default: true)
  onInsert?: (payload: TranslationRealtimePayload) => void;   // Callback for new translations
  onUpdate?: (payload: TranslationRealtimePayload) => void;   // Callback for updated translations
  onDelete?: (payload: TranslationRealtimePayload) => void;   // Callback for deleted translations
  onChange?: (payload: TranslationRealtimePayload) => void;   // Callback for any change
  onError?: (error: Error) => void;     // Error callback
  onConnectionChange?: (status: 'connected' | 'disconnected' | 'connecting') => void;
}

interface UseTranslationRealtimeReturn {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';

  // Actions
  subscribe: () => void;      // Manually start subscription
  unsubscribe: () => void;    // Manually stop subscription

  // Metadata
  lastEvent: TranslationRealtimePayload | null;
  lastEventAt: Date | null;
  error: Error | null;
}

interface TranslationRealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  table: 'item_translations' | 'article_translations' | 'link_translations' | 'tag_translations';
  entityId: string;
  entityType: 'item' | 'article' | 'link' | 'tag';
  language: SupportedLanguage;
  status?: TranslationStatus;
  old?: Record<string, unknown>;      // Previous record (for UPDATE/DELETE)
  new?: Record<string, unknown>;      // New record (for INSERT/UPDATE)
  timestamp: Date;
}

function useTranslationRealtime(options: UseTranslationRealtimeOptions): UseTranslationRealtimeReturn;
```

#### Supabase Realtime Channel Setup
```typescript
// Subscribe to item_translations table
const channel = supabase
  .channel('translation-updates')
  .on(
    'postgres_changes',
    {
      event: '*',  // INSERT, UPDATE, DELETE
      schema: 'public',
      table: 'item_translations',
      filter: entityId ? `item_id=eq.${entityId}` : undefined,
    },
    (payload) => handleTranslationChange(payload)
  )
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'article_translations',
      filter: entityId ? `article_id=eq.${entityId}` : undefined,
    },
    (payload) => handleTranslationChange(payload)
  )
  .subscribe((status) => handleConnectionStatus(status));
```

#### Translation Tables to Monitor
| Table | Entity Type | ID Column | Description |
|-------|-------------|-----------|-------------|
| `item_translations` | item | `item_id` | Item content translations |
| `article_translations` | article | `article_id` | Article content translations |
| `link_translations` | link | `link_id` | Link content translations |
| `tag_translations` | tag | `tag_id` | Tag content translations |

#### Connection State Management
- **connected**: Active subscription receiving events
- **connecting**: Establishing connection to Supabase realtime
- **disconnected**: No active connection (either disabled or after unsubscribe)
- **error**: Connection failed, will attempt reconnect

#### Cleanup and Lifecycle
1. **Mount**: If `enabled` is true, establish subscription automatically
2. **Options Change**: Unsubscribe from old channel, subscribe to new channel with updated filters
3. **Unmount**: Unsubscribe and clean up channel to prevent memory leaks
4. **Reconnection**: Supabase client handles automatic reconnection; hook tracks connection status

#### Integration with useTranslationStatus
```typescript
// Example: Auto-refresh translation status when realtime updates occur
function TranslationStatusWidget({ entityId }: { entityId: string }) {
  const { data, refetch } = useTranslationStatus({ entityId, entityType: 'item' });

  useTranslationRealtime({
    entityId,
    entityType: 'item',
    onChange: () => {
      // Refetch translation status when any change occurs
      refetch();
    },
  });

  return <TranslationProgressBar {...data.summary} />;
}
```

#### Error Handling
- Connection errors set `connectionStatus: 'error'` and populate `error`
- `onError` callback is invoked when connection errors occur
- Supabase client handles retry logic; hook surfaces connection state
- Graceful degradation: UI continues to work without realtime, just requires manual refresh

#### Example Usage
```typescript
// Basic usage - subscribe to single entity
const { isConnected, lastEvent } = useTranslationRealtime({
  entityId: 'item-123',
  entityType: 'item',
  onChange: (payload) => {
    console.log('Translation changed:', payload);
    refetchStatus();
  },
});

// Subscribe to all translations for a property
const { connectionStatus } = useTranslationRealtime({
  propertyId: 'property-456',
  onInsert: (payload) => toast.success(`New ${payload.language} translation created`),
  onUpdate: (payload) => {
    if (payload.status === 'complete') {
      toast.success(`${payload.language} translation completed`);
    }
  },
});

// Conditional subscription
const { isConnected } = useTranslationRealtime({
  entityId: selectedItemId,
  entityType: 'item',
  enabled: isPreviewPanelOpen,  // Only subscribe when panel is open
});

// Manual control
const { subscribe, unsubscribe, isConnected } = useTranslationRealtime({
  propertyId: 'property-456',
  enabled: false,  // Don't auto-subscribe
});

// Later...
subscribe();  // Manually start
unsubscribe();  // Manually stop
```

### Dependencies
- **REQ-E05-001**: Translation Status API endpoint (for data refresh after realtime events)
- **REQ-E05-006**: TranslationManagement types file (TypeScript interfaces)
- **REQ-E05-011**: useTranslationStatus hook (for integration/auto-refresh pattern)
- **Existing**: Supabase client (`@/lib/supabase`)
- **Existing**: React hooks (useState, useEffect, useCallback, useRef)
- **Existing**: Supabase Realtime must be enabled on the project

### User Impact
Property owners see translation status updates in real-time without needing to refresh the page. When a background translation job completes, the UI automatically updates to show the new status. This creates a more responsive, modern experience that keeps owners informed of progress without manual intervention.

### Business Value
Real-time updates significantly improve the perceived responsiveness of the translation system. Owners can start translation jobs and immediately see progress without polling or refreshing. This reduces support questions about "stuck" translations and builds confidence in the system's reliability. The hook also reduces server load compared to frequent polling approaches.

### Acceptance Criteria
- [ ] Hook file created at `/src/hooks/useTranslationRealtime.ts`
- [ ] Hook accepts `UseTranslationRealtimeOptions` parameter with all documented options
- [ ] Hook returns `UseTranslationRealtimeReturn` object with all documented properties
- [ ] When `entityId` and `entityType` are provided, subscribes to updates for that specific entity
- [ ] When `propertyId` is provided, subscribes to updates for all entities in that property
- [ ] Subscription listens to `item_translations` table for item entity type
- [ ] Subscription listens to `article_translations` table for article entity type
- [ ] Subscription listens to `link_translations` table for link entity type
- [ ] Subscription listens to `tag_translations` table for tag entity type
- [ ] `isConnected` is `true` when subscription is active and receiving events
- [ ] `isConnecting` is `true` while establishing connection
- [ ] `connectionStatus` reflects current state: 'connected', 'disconnected', 'connecting', or 'error'
- [ ] `onInsert` callback is invoked when new translation record is inserted
- [ ] `onUpdate` callback is invoked when translation record is updated
- [ ] `onDelete` callback is invoked when translation record is deleted
- [ ] `onChange` callback is invoked for any change (INSERT, UPDATE, or DELETE)
- [ ] `onError` callback is invoked when connection errors occur
- [ ] `onConnectionChange` callback is invoked when connection status changes
- [ ] `lastEvent` contains the most recent realtime payload
- [ ] `lastEventAt` contains timestamp of most recent event
- [ ] `subscribe()` function manually starts the subscription
- [ ] `unsubscribe()` function manually stops the subscription
- [ ] `enabled: false` prevents automatic subscription on mount
- [ ] Subscription is automatically established when `enabled` changes to `true`
- [ ] Subscription is automatically cleaned up when component unmounts
- [ ] Subscription is re-established with new filters when options change
- [ ] Connection errors are captured in `error` state
- [ ] Hook handles Supabase client not being available (SSR safety)
- [ ] Payload is transformed to `TranslationRealtimePayload` format with consistent structure
- [ ] TypeScript types are properly defined and exported
- [ ] Hook is exported from `/src/hooks/index.ts` barrel file (if exists)
- [ ] Unit tests verify subscription setup and cleanup (if test framework is set up)
- [ ] Hook follows existing patterns in `/src/hooks/` directory

---

## REQ-E05-013: Create TranslationStatusWidget Component

**Date**: 2026-01-22 16:30
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners need a dashboard widget component that displays a summary of their translation status, showing overall completion progress, counts by status category, and providing quick access to the full translation management interface. This widget serves as the primary entry point for translation status visibility on the owner dashboard.

### Current Behavior
No dashboard widget exists for displaying translation status at a glance. Owners have no visibility into their translation coverage from the main dashboard without navigating to a dedicated translation management page. The Translation Management component family requires a summary widget for dashboard integration.

### Expected Behavior
A summary card component provides translation status overview for the dashboard:
- Displays a progress bar showing overall translation completion percentage
- Shows counts broken down by status: complete, partial, pending, and failed
- Includes a "View Details" link that navigates to the full translation management page
- Supports filtering by property when displayed in a property-specific context
- Adapts to compact mode for sidebar placement
- Shows loading skeleton while data is being fetched
- Handles error states gracefully with retry option

### Technical Details
- **File**: `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`
- **Component Type**: Client component ('use client')
- **Styling**: Tailwind CSS with shadcn/ui Card component
- **Data Fetching**: Uses `useTranslationStatus` hook (REQ-E05-011)

#### Component Props Interface
```typescript
interface TranslationStatusWidgetProps {
  propertyId?: string;           // Filter to specific property (optional)
  compact?: boolean;             // Compact mode for sidebar placement (default: false)
  onViewAll?: () => void;        // Callback when "View Details" is clicked
  showViewAllLink?: boolean;     // Show/hide the View Details link (default: true)
  className?: string;            // Additional CSS classes
}
```

#### Widget Layout - Standard Mode
```
┌──────────────────────────────────────────────────────────────┐
│  Translation Status                           [View Details →]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░  67%      │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────┐ │
│  │ ✓ Complete │  │ ◐ Partial  │  │ ⏳ Pending │  │ ✗ Failed│ │
│  │     24     │  │     8      │  │     4      │  │    2    │ │
│  └────────────┘  └────────────┘  └────────────┘  └────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### Widget Layout - Compact Mode
```
┌────────────────────────────────┐
│  Translations         67%     │
│  ████████████████░░░░░░░░░░░░ │
│  ✓ 24  ◐ 8  ⏳ 4  ✗ 2        │
│                [View Details] │
└────────────────────────────────┘
```

#### Status Categories and Colors
| Status | Icon | Color | Description |
|--------|------|-------|-------------|
| Complete | ✓ Check | Green (#22c55e / green-500) | All 6 languages translated for entity |
| Partial | ◐ Half-circle | Blue (#3b82f6 / blue-500) | Some languages translated (1-5 of 6) |
| Pending | ⏳ Clock | Orange (#f97316 / orange-500) | Translation in progress |
| Failed | ✗ X | Red (#ef4444 / red-500) | Translation attempt failed |

#### Progress Calculation
```typescript
// Overall completion percentage
const completionPercentage = Math.round(
  ((completeCount + (partialCount * partialWeight)) / totalEntities) * 100
);

// Where partialWeight accounts for partially translated entities
// e.g., if an entity has 3/6 languages, it contributes 0.5 to the count
```

#### Subcomponents
- **TranslationStatusWidget.tsx**: Main widget container with Card wrapper
- **StatusCountCard.tsx**: Individual status count display card
- **index.ts**: Barrel export file

#### Key Implementation Details
1. **Data Fetching**: Use `useTranslationStatus` hook with `propertyId` filter when provided
2. **Loading State**: Show skeleton loading for progress bar and status counts
3. **Error State**: Display error message with "Retry" button
4. **Empty State**: Show appropriate message when no translatable content exists
5. **Responsive**: Progress bar width adapts to container, compact mode for narrow spaces
6. **Navigation**: "View Details" link uses Next.js `Link` or calls `onViewAll` callback
7. **Refresh**: Include subtle refresh button to manually refetch data
8. **i18n**: All UI text uses next-intl translations
9. **Accessibility**: Proper ARIA labels for progress bar and interactive elements

#### Data Structure from useTranslationStatus
```typescript
interface TranslationSummary {
  totalEntities: number;
  completeCount: number;     // Entities with all 6 languages complete
  partialCount: number;      // Entities with some languages complete
  pendingCount: number;      // Entities with pending translations
  failedCount: number;       // Entities with failed translations
  byLanguage: Record<SupportedLanguage, LanguageStatusCount>;
}
```

#### Example Usage
```tsx
// Dashboard integration
<TranslationStatusWidget
  onViewAll={() => router.push('/dashboard/translations')}
/>

// Property-specific widget
<TranslationStatusWidget
  propertyId={property.id}
  onViewAll={() => router.push(`/properties/${property.id}/translations`)}
/>

// Sidebar compact mode
<TranslationStatusWidget
  propertyId={property.id}
  compact={true}
  showViewAllLink={false}
/>
```

### Dependencies
- **REQ-E05-001**: Translation Status API endpoint (data source)
- **REQ-E05-006**: TranslationManagement types file (TypeScript interfaces)
- **REQ-E05-009**: TranslationProgressBar component (for progress visualization)
- **REQ-E05-011**: useTranslationStatus hook (for data fetching)
- **Existing**: shadcn/ui Card component
- **Existing**: next-intl for translations
- **Existing**: Next.js Link for navigation

### User Impact
Property owners see their translation status at a glance directly on their dashboard. The progress bar provides immediate visual feedback on overall completion, while the status counts highlight areas needing attention (pending, failed). The "View Details" link provides easy access to take action on translations that need work.

### Business Value
The dashboard widget is a key visibility component that keeps translation status top-of-mind for property owners. By surfacing translation coverage on the dashboard, owners are more likely to complete their translations, improving the experience for international guests. The widget serves as the primary call-to-action for the Translation Management feature set.

### Acceptance Criteria
- [ ] Component file created at `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`
- [ ] Component uses shadcn/ui Card for consistent styling with other dashboard widgets
- [ ] Widget displays "Translation Status" title in the header
- [ ] Progress bar shows overall completion percentage (0-100%)
- [ ] Progress bar uses TranslationProgressBar component (REQ-E05-009) or equivalent styling
- [ ] Completion percentage is displayed as text next to or below the progress bar
- [ ] Status count cards display for: Complete, Partial, Pending, Failed
- [ ] Complete count card shows green color (#22c55e) with check icon
- [ ] Partial count card shows blue color (#3b82f6) with half-circle icon
- [ ] Pending count card shows orange color (#f97316) with clock icon
- [ ] Failed count card shows red color (#ef4444) with X icon
- [ ] "View Details" link is displayed when `showViewAllLink` is true (default)
- [ ] Clicking "View Details" calls `onViewAll` callback if provided
- [ ] "View Details" link navigates to translation management page if no callback provided
- [ ] `propertyId` prop filters data to specific property when provided
- [ ] `compact` mode renders condensed layout suitable for sidebar
- [ ] Loading skeleton is displayed while data is being fetched (via useTranslationStatus)
- [ ] Error state displays error message with "Retry" button
- [ ] Empty state displays appropriate message when no translatable content exists
- [ ] Refresh button allows manual data refetch
- [ ] Widget is responsive and adapts to container width
- [ ] Component uses i18n for all UI text via next-intl
- [ ] ARIA attributes applied for accessibility (aria-label on progress bar, buttons)
- [ ] `className` prop is applied to root Card element for custom styling
- [ ] TypeScript types are properly imported from TranslationManagement.types.ts
- [ ] Component is exported from barrel file `/src/components/TranslationManagement/TranslationStatusWidget/index.ts`
- [ ] Component follows existing code patterns in `/src/components/TranslationManagement/`

---

## REQ-E05-014: Create TranslationStatusColumn Component

**Date**: 2026-01-22 18:45
**Type**: NEW FEATURE
**Size**: S

### Summary
Property owners need a compact table column component that displays translation status for an entity using 6 small dots or icons representing each supported language. The component provides at-a-glance visibility into translation coverage directly within data tables and is clickable to open the TranslationPreviewPanel for detailed view and actions.

### Current Behavior
No compact status indicator component exists for displaying translation status within table columns. When viewing lists of items, articles, or other translatable entities in table format, owners have no visibility into translation coverage without navigating to each entity individually. The Translation Management component family requires a space-efficient column component for table integration.

### Expected Behavior
A compact column component displays translation status using visual indicators:
- Shows 6 small dots or icons in a row, one for each supported language
- Each dot is color-coded based on the translation status for that language
- Hovering over the component shows a tooltip with language names and statuses
- Clicking the component triggers `onClick` callback to open the TranslationPreviewPanel
- Supports size variants for different table densities
- Accessible with proper ARIA attributes for screen readers
- Handles missing translation data gracefully

### Technical Details
- **File**: `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`
- **Component Type**: Client component ('use client')
- **Styling**: Tailwind CSS with optional shadcn/ui Tooltip component

#### Component Props Interface
```typescript
interface TranslationStatusColumnProps {
  entityId: string;
  entityType: 'item' | 'article' | 'link' | 'tag';
  translations: LanguageTranslationSummary[];  // Status for each language
  size?: 'sm' | 'md' | 'lg';                   // Dot size variant (default: 'md')
  onClick?: () => void;                         // Callback when clicked (opens preview panel)
  showTooltip?: boolean;                        // Show tooltip on hover (default: true)
  disabled?: boolean;                           // Disable click interaction
  className?: string;                           // Additional CSS classes
}

interface LanguageTranslationSummary {
  language: SupportedLanguage;
  status: 'complete' | 'pending' | 'failed' | 'stale' | 'missing' | 'manual';
  translatedAt?: string;
}
```

#### Visual Layout
```
Standard (6 dots in a row):
┌─────────────────────┐
│ ● ● ● ○ ● ○         │
│ es fr de it nl pt   │  ← (shown in tooltip only)
└─────────────────────┘

With flag variation (optional):
┌─────────────────────────────┐
│ 🇪🇸● 🇫🇷● 🇩🇪● 🇮🇹○ 🇳🇱● 🇵🇹○ │
└─────────────────────────────┘
```

#### Supported Languages (6 total, in display order)
| Order | Language | Code | Flag |
|-------|----------|------|------|
| 1 | Spanish | es | 🇪🇸 |
| 2 | French | fr | 🇫🇷 |
| 3 | German | de | 🇩🇪 |
| 4 | Italian | it | 🇮🇹 |
| 5 | Dutch | nl | 🇳🇱 |
| 6 | Portuguese | pt | 🇵🇹 |

#### Status Colors (matching existing spec from REQ-E05-008)
| Status | Color | Tailwind Class | Dot Appearance |
|--------|-------|----------------|----------------|
| Complete | Green | bg-green-500 | Solid filled dot |
| Pending | Orange | bg-orange-500 | Pulsing/animated dot |
| Failed | Red | bg-red-500 | Solid filled dot |
| Manual | Purple | bg-purple-500 | Solid filled dot |
| Stale | Amber | bg-amber-500 | Solid filled dot |
| Missing | Gray | bg-gray-300 | Hollow/outline dot |

#### Size Variants
| Size | Dot Diameter | Gap | Total Width | Use Case |
|------|-------------|-----|-------------|----------|
| sm | 6px (w-1.5 h-1.5) | 2px (gap-0.5) | ~44px | Compact tables |
| md | 8px (w-2 h-2) | 4px (gap-1) | ~64px | Standard tables (default) |
| lg | 10px (w-2.5 h-2.5) | 6px (gap-1.5) | ~84px | Spacious layouts |

#### Tooltip Content
When `showTooltip` is true (default), hovering displays a tooltip with detailed status:
```
┌─────────────────────────┐
│ Translation Status      │
│ ─────────────────────── │
│ 🇪🇸 Spanish: Complete    │
│ 🇫🇷 French: Complete     │
│ 🇩🇪 German: Pending      │
│ 🇮🇹 Italian: Missing     │
│ 🇳🇱 Dutch: Complete      │
│ 🇵🇹 Portuguese: Missing  │
│ ─────────────────────── │
│ 3/6 translations        │
└─────────────────────────┘
```

#### Key Implementation Details
1. **Language Order**: Always display dots in consistent order (es, fr, de, it, nl, pt)
2. **Click Handler**: Entire component is clickable; cursor changes to pointer when `onClick` is provided
3. **Hover State**: Subtle scale or brightness increase on hover to indicate interactivity
4. **Pending Animation**: Dots for 'pending' status pulse/animate to indicate processing
5. **Missing Data**: If translations array is empty or missing languages, show gray/missing dots
6. **Focus State**: Keyboard focusable with visible focus ring when `onClick` is provided
7. **Accessibility**: ARIA label describes overall status (e.g., "3 of 6 translations complete, click to view details")
8. **i18n**: Tooltip text uses next-intl translations

#### Subcomponents
- **TranslationStatusColumn.tsx**: Main component with dot rendering and tooltip
- **StatusDot.tsx**: Individual status dot with color and animation (optional extraction)
- **index.ts**: Barrel export file

#### Example Usage
```tsx
// In a table cell
<TranslationStatusColumn
  entityId={item.id}
  entityType="item"
  translations={item.translationStatuses}
  onClick={() => openPreviewPanel(item.id, 'item')}
/>

// Compact size for dense tables
<TranslationStatusColumn
  entityId={article.id}
  entityType="article"
  translations={article.translationStatuses}
  size="sm"
  onClick={() => openPreviewPanel(article.id, 'article')}
/>

// Read-only display (no click action)
<TranslationStatusColumn
  entityId={link.id}
  entityType="link"
  translations={link.translationStatuses}
  onClick={undefined}
  showTooltip={true}
/>

// Integration with ItemManager table
<DataTable
  columns={[
    { header: 'Name', accessor: 'name' },
    { header: 'Type', accessor: 'type' },
    {
      header: 'Translations',
      cell: (row) => (
        <TranslationStatusColumn
          entityId={row.id}
          entityType="item"
          translations={row.translationStatuses}
          onClick={() => setPreviewEntity(row)}
        />
      ),
    },
  ]}
/>
```

### Dependencies
- **REQ-E05-006**: TranslationManagement types file (`LanguageTranslationSummary`, `SupportedLanguage`)
- **REQ-E05-007**: TranslationPreviewPanel (opened when component is clicked)
- **REQ-E05-008**: TranslationStatusItem (shares color/status specifications)
- **Existing**: shadcn/ui Tooltip component (optional)
- **Existing**: next-intl for translations
- **Existing**: `@/lib/translation-service` for language utilities

### User Impact
Property owners see translation coverage at a glance when viewing lists of items, articles, or other content. The compact 6-dot indicator instantly communicates which languages are translated without taking up significant table space. Clicking the indicator opens the preview panel for quick access to translation management actions.

### Business Value
This component bridges the gap between summary dashboards and detailed translation management. By embedding translation status directly in existing content tables, owners are more likely to notice and address translation gaps. The clickable nature provides a natural workflow from discovery (seeing incomplete translations) to action (opening the preview panel to fix them).

### Acceptance Criteria
- [ ] Component file created at `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`
- [ ] Component renders 6 dots in a horizontal row, one for each supported language
- [ ] Dots are displayed in consistent order: es, fr, de, it, nl, pt
- [ ] Each dot is color-coded based on translation status:
  - [ ] Green (bg-green-500) for 'complete' status
  - [ ] Orange (bg-orange-500) for 'pending' status with pulse animation
  - [ ] Red (bg-red-500) for 'failed' status
  - [ ] Purple (bg-purple-500) for 'manual' status
  - [ ] Amber (bg-amber-500) for 'stale' status
  - [ ] Gray (bg-gray-300) hollow/outline for 'missing' status
- [ ] Size 'sm' renders dots at 6px diameter with 2px gap
- [ ] Size 'md' renders dots at 8px diameter with 4px gap (default)
- [ ] Size 'lg' renders dots at 10px diameter with 6px gap
- [ ] Hovering shows tooltip with language names and statuses when `showTooltip` is true
- [ ] Tooltip includes summary count (e.g., "3/6 translations")
- [ ] Clicking the component calls `onClick` callback when provided
- [ ] Cursor shows pointer when `onClick` is provided and `disabled` is false
- [ ] Hover state shows subtle visual feedback (scale or brightness)
- [ ] Component is keyboard focusable when `onClick` is provided
- [ ] Focus state shows visible focus ring
- [ ] Component handles empty or partial `translations` array gracefully
- [ ] Missing languages in the array are displayed as gray/missing dots
- [ ] Pending status dots have pulse/animation effect
- [ ] Animation respects `prefers-reduced-motion` media query
- [ ] `disabled` prop prevents click interaction and shows disabled cursor
- [ ] ARIA label describes overall status for screen readers
- [ ] Component uses i18n for all tooltip text via next-intl
- [ ] `className` prop is applied to root element for custom styling
- [ ] TypeScript types are properly imported from TranslationManagement.types.ts
- [ ] Component is exported from barrel file `/src/components/TranslationManagement/TranslationStatusColumn/index.ts`
- [ ] Component follows existing code patterns in `/src/components/TranslationManagement/`

---

## REQ-E05-015: Create TranslationStatusFilter Component

**Date**: 2026-01-22 21:30
**Type**: NEW FEATURE
**Size**: S

### Summary
Property owners need a dropdown filter component to filter item lists by translation status. This enables owners to quickly identify items that need attention based on their translation state, such as finding all items with failed translations or those that need manual review.

### Current Behavior
No filter component exists for filtering content lists by translation status. When viewing lists of items, articles, or other translatable entities, owners have no way to filter by translation coverage or status. They must manually scan through all items to identify those needing translation work.

### Expected Behavior
A dropdown filter component allows filtering by translation status:
- Dropdown select component using shadcn/ui Select component
- Filter options: All, Fully Translated, Partially Translated, Pending, Failed, Manually Edited
- Integrates with existing item list filtering mechanisms
- Selection triggers callback with selected filter value
- Shows current selection clearly in the dropdown button
- Accessible with keyboard navigation and screen reader support

### Technical Details
- **File**: `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`
- **Component Type**: Client component ('use client')
- **Styling**: Tailwind CSS with shadcn/ui Select component

#### Component Props Interface
```typescript
interface TranslationStatusFilterProps {
  value: TranslationFilterStatus;
  onChange: (value: TranslationFilterStatus) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
}

type TranslationFilterStatus =
  | 'all'
  | 'fully_translated'
  | 'partially_translated'
  | 'pending'
  | 'failed'
  | 'manually_edited';
```

#### Filter Options
| Value | Label | Description |
|-------|-------|-------------|
| `all` | All | Show all items regardless of translation status |
| `fully_translated` | Fully Translated | Items with complete translations for all 6 languages |
| `partially_translated` | Partially Translated | Items with some but not all languages translated |
| `pending` | Pending | Items with translations currently being processed |
| `failed` | Failed | Items with one or more failed translation attempts |
| `manually_edited` | Manually Edited | Items with manually edited/reviewed translations |

#### Visual Layout
```
Closed state:
┌─────────────────────────┐
│ All                   ▼ │
└─────────────────────────┘

Open state:
┌─────────────────────────┐
│ All                   ▲ │
├─────────────────────────┤
│ ✓ All                   │
│   Fully Translated      │
│   Partially Translated  │
│   Pending               │
│   Failed                │
│   Manually Edited       │
└─────────────────────────┘
```

#### Size Variants
| Size | Height | Font Size | Use Case |
|------|--------|-----------|----------|
| sm | h-8 | text-sm | Compact filter bars |
| md | h-9 | text-sm | Standard filter bars (default) |
| lg | h-10 | text-base | Spacious layouts |

#### Key Implementation Details
1. **Controlled Component**: Value is controlled via `value` and `onChange` props
2. **Default Value**: 'all' should be the default when no value is provided
3. **Styling**: Matches existing filter dropdowns in the application
4. **Icons**: Consider adding status icons next to each option for visual clarity
5. **Label**: Include an accessible label for screen readers
6. **Focus Management**: Proper focus handling for keyboard navigation
7. **i18n**: All labels use next-intl translations

#### Subcomponents
- **TranslationStatusFilter.tsx**: Main dropdown component
- **index.ts**: Barrel export file

#### Example Usage
```tsx
// Basic usage
const [statusFilter, setStatusFilter] = useState<TranslationFilterStatus>('all');

<TranslationStatusFilter
  value={statusFilter}
  onChange={setStatusFilter}
/>

// With custom styling
<TranslationStatusFilter
  value={statusFilter}
  onChange={setStatusFilter}
  size="sm"
  className="w-48"
/>

// In a filter bar with other filters
<div className="flex gap-2">
  <PropertyFilter value={property} onChange={setProperty} />
  <TranslationStatusFilter value={statusFilter} onChange={setStatusFilter} />
  <SearchInput value={search} onChange={setSearch} />
</div>

// Integration with item list filtering
function ItemList() {
  const [statusFilter, setStatusFilter] = useState<TranslationFilterStatus>('all');
  const filteredItems = useFilteredItems({ translationStatus: statusFilter });

  return (
    <div>
      <TranslationStatusFilter
        value={statusFilter}
        onChange={setStatusFilter}
      />
      <ItemTable items={filteredItems} />
    </div>
  );
}
```

### Dependencies
- **REQ-E05-006**: TranslationManagement types file (`TranslationFilterStatus` type definition)
- **REQ-E05-014**: TranslationStatusColumn (uses same status definitions)
- **Existing**: shadcn/ui Select component
- **Existing**: next-intl for translations
- **Existing**: Lucide React icons (optional, for status icons)

### User Impact
Property owners can quickly filter content lists to find items that need translation attention. Instead of manually scanning through all items, they can immediately see:
- Which items have failed translations that need retry
- Which items are only partially translated
- Which items they have manually reviewed
- Which items are still pending translation

This dramatically improves the efficiency of translation management workflows.

### Business Value
This component enables targeted translation management by helping owners identify and prioritize translation work. Owners can focus on fixing failed translations, completing partial translations, or reviewing pending translations without wading through fully translated content. This reduces time spent on translation management and ensures translation gaps are addressed promptly.

### Acceptance Criteria
- [ ] Component file created at `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`
- [ ] Component renders as a dropdown select using shadcn/ui Select component
- [ ] Dropdown includes all 6 filter options: All, Fully Translated, Partially Translated, Pending, Failed, Manually Edited
- [ ] `value` prop controls the currently selected option
- [ ] `onChange` callback is called with the new value when selection changes
- [ ] Size 'sm' renders at h-8 height
- [ ] Size 'md' renders at h-9 height (default)
- [ ] Size 'lg' renders at h-10 height
- [ ] `disabled` prop disables the dropdown interaction
- [ ] `placeholder` prop customizes the placeholder text when no value is selected
- [ ] Dropdown button shows currently selected option label
- [ ] Dropdown opens on click and closes when option is selected or clicked outside
- [ ] Keyboard navigation works: Enter/Space opens, Arrow keys navigate, Enter selects
- [ ] Focused option is visually highlighted
- [ ] Selected option shows checkmark or other visual indicator
- [ ] Component handles 'all' as default/initial value appropriately
- [ ] ARIA attributes are properly applied for accessibility
- [ ] Screen reader announces selected value and available options
- [ ] Component uses i18n for all option labels via next-intl
- [ ] `className` prop is applied to root element for custom styling
- [ ] TypeScript types are properly defined and exported
- [ ] Component is exported from barrel file `/src/components/TranslationManagement/TranslationStatusFilter/index.ts`
- [ ] Component follows existing code patterns in `/src/components/TranslationManagement/`
- [ ] Component follows existing filter component patterns in the application

---

## REQ-E05-016: Integrate TranslationStatusWidget into Dashboard

**Date**: 2026-01-22 22:15
**Type**: NEW FEATURE
**Size**: S

### Summary
The dashboard needs to display a TranslationStatusWidget that shows property owners an overview of their translation status at a glance. This widget should be integrated into the dashboard layout and fetch the status summary on load.

### Current Behavior
The dashboard at `/src/app/dashboard2/page.tsx` does not include any translation status information. Property owners must navigate to dedicated translation management views to check their translation coverage status. There is no at-a-glance visibility of translation health on the main dashboard.

### Expected Behavior
The dashboard page integrates the TranslationStatusWidget component:
- Widget is added to the dashboard layout in an appropriate location (e.g., sidebar, top metrics row, or dedicated section)
- Status summary data is fetched when the dashboard loads
- Widget displays aggregate translation statistics (complete, pending, failed, missing counts)
- Widget provides quick navigation to detailed translation management views
- Loading state is shown while data is being fetched
- Error state is handled gracefully if the API call fails

### Technical Details
- **File**: `/src/app/dashboard2/page.tsx` (modify)
- **Component to Add**: TranslationStatusWidget (from `@/components/TranslationManagement/TranslationStatusWidget`)
- **Data Fetching**: Fetch from `/api/translations/status` endpoint on component mount
- **Integration Points**:
  - Import TranslationStatusWidget component
  - Add widget to dashboard grid/layout
  - Implement data fetching using existing patterns (React Query, SWR, or fetch)
  - Handle loading and error states appropriately

#### Component Integration
```tsx
// Import the widget
import { TranslationStatusWidget } from '@/components/TranslationManagement/TranslationStatusWidget';

// In the dashboard layout, add the widget
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {/* Existing dashboard widgets */}
  <Card>...</Card>
  <Card>...</Card>

  {/* Add Translation Status Widget */}
  <TranslationStatusWidget
    propertyId={selectedPropertyId}
    onViewDetails={() => router.push('/dashboard2/translations')}
  />
</div>
```

#### Data Fetching Pattern
```tsx
// Using existing data fetching patterns
const { data: translationStatus, isLoading, error } = useQuery({
  queryKey: ['translationStatus', selectedPropertyId],
  queryFn: () => fetchTranslationStatus(selectedPropertyId),
});

// Pass to widget
<TranslationStatusWidget
  status={translationStatus}
  isLoading={isLoading}
  error={error}
  onRetry={() => refetch()}
/>
```

#### Widget Placement Options
1. **Metrics Row**: Add as a card in the top metrics/KPI row alongside other summary stats
2. **Sidebar**: Place in a sidebar section for quick reference
3. **Dedicated Section**: Create a "Translation Health" section in the dashboard grid
4. **Collapsible Panel**: Add as an expandable panel that can be minimized

#### Key Implementation Details
1. **Property Context**: Widget should respect the currently selected property (if applicable)
2. **Refresh**: Consider adding auto-refresh or manual refresh capability
3. **Caching**: Use appropriate caching strategy to avoid excessive API calls
4. **Responsive**: Widget should adapt to different screen sizes within the dashboard grid
5. **Loading Skeleton**: Show skeleton/placeholder while data loads
6. **Error Recovery**: Provide retry button if data fetch fails
7. **i18n**: All text should use next-intl translations

### Dependencies
- **REQ-E05-001**: Translation Status API Endpoint (`/api/translations/status`)
- **REQ-E05-010**: TranslationStatusWidget component (must be created first)
- **REQ-E05-006**: TranslationManagement types file (for status types)
- **Existing**: Dashboard page structure at `/src/app/dashboard2/page.tsx`
- **Existing**: Data fetching utilities (React Query, SWR, or fetch helpers)
- **Existing**: next-intl for translations

### User Impact
Property owners see their translation status immediately upon viewing their dashboard. They no longer need to navigate to a separate translation management page to understand their translation coverage. This visibility encourages proactive translation management and helps owners identify issues quickly.

### Business Value
Integrating translation status into the main dashboard increases awareness of translation coverage and encourages owners to maintain complete translations. Higher translation coverage leads to better guest experiences for international travelers, potentially increasing bookings and positive reviews. The widget serves as a constant reminder and easy entry point to translation management.

### Acceptance Criteria
- [ ] `/src/app/dashboard2/page.tsx` is modified to include TranslationStatusWidget
- [ ] TranslationStatusWidget component is imported from `@/components/TranslationManagement/TranslationStatusWidget`
- [ ] Widget is positioned appropriately within the dashboard layout (metrics row, sidebar, or dedicated section)
- [ ] Translation status data is fetched from `/api/translations/status` endpoint when dashboard loads
- [ ] Widget displays summary counts: total items, complete translations, pending, failed, missing
- [ ] Loading state shows skeleton or spinner while data is being fetched
- [ ] Error state is handled with appropriate error message and retry option
- [ ] Widget respects the currently selected property context (if property selector exists)
- [ ] Clicking the widget or a "View Details" action navigates to detailed translation management view
- [ ] Widget is responsive and adapts to the dashboard grid layout
- [ ] All text in the widget uses i18n translations via next-intl
- [ ] Data fetching follows existing patterns in the dashboard (React Query, SWR, or similar)
- [ ] Widget refreshes data appropriately (on mount, and optionally on interval or manual trigger)
- [ ] TypeScript types are properly used for status data
- [ ] No console errors or warnings related to the widget integration
- [ ] Widget does not break existing dashboard functionality or layout
- [ ] Widget handles the case where no translation data exists (new users, empty state)

---

## REQ-E05-017: Add Translation Status Column to Items List

**Date**: 2026-01-22
**Type**: NEW FEATURE
**Size**: S
**Phase**: Phase 3 (Dashboard Integration), Task 3.5

### Summary
Property owners need an optional translation status column in the ItemGrid component that displays the translation coverage status for each item. This column should be toggleable via column visibility settings and clicking it should open the TranslationPreviewPanel for detailed view and management actions.

### Current Behavior
The ItemGrid component at `/src/components/ItemManager/components/ItemGrid.tsx` displays items in a responsive multi-column grid layout using ItemCard components. Currently, there is no visibility into translation status within the grid view. Property owners cannot see which items have complete, partial, or missing translations without navigating to a separate translation management interface.

### Expected Behavior
The ItemGrid component is enhanced to optionally display translation status:
- New optional prop `showTranslationStatus` enables the translation status display
- When enabled, each ItemCard shows a compact TranslationStatusColumn indicator
- Translation status column displays 6 dots representing each supported language (es, fr, de, it, nl, pt)
- Each dot is color-coded based on translation status (complete, pending, failed, stale, missing)
- Clicking the translation status indicator triggers `onTranslationStatusClick` callback
- The callback opens the TranslationPreviewPanel for the clicked item
- Column visibility can be controlled via existing column visibility settings infrastructure
- The feature integrates with the existing ColumnVisibilityState type system

### Technical Details
- **File**: `/src/components/ItemManager/components/ItemGrid.tsx` (modify)
- **Types File**: `/src/components/ItemManager/ItemManager.types.ts` (modify)
- **Hook File**: `/src/components/ItemManager/hooks/useColumnVisibility.ts` (modify)
- **Component to Use**: TranslationStatusColumn (from `@/components/TranslationManagement/TranslationStatusColumn`)

#### Props Interface Updates

**ItemGridProps (in ItemManager.types.ts)**:
```typescript
export interface ItemGridProps {
  // ... existing props ...

  /** Whether to show translation status indicator on each item card */
  showTranslationStatus?: boolean;
  /** Callback when translation status is clicked (opens preview panel) */
  onTranslationStatusClick?: (item: ItemRecord) => void;
  /** Translation status data for items, keyed by item ID */
  translationStatuses?: Record<string, LanguageTranslationSummary[]>;
}
```

**ColumnVisibilityState (in ItemManager.types.ts and useColumnVisibility.ts)**:
```typescript
export interface ColumnVisibilityState {
  /** Whether the Property column is visible */
  property: boolean;
  /** Whether the Translation Status column is visible */
  translationStatus: boolean;  // NEW
}
```

#### ItemGrid Component Updates
```tsx
export function ItemGrid({
  items,
  onItemPreview,
  onSelectionChange,
  selectedIds,
  isSelectionMode,
  onLongPressSelect,
  className,
  enableInlineEdit,
  onUpdateItem,
  existingTags,
  loading,
  // New props
  showTranslationStatus,
  onTranslationStatusClick,
  translationStatuses,
}: ItemGridProps & { loading?: boolean }) {
  // ...existing implementation...

  return (
    <div
      className={cn(
        "grid gap-4 sm:gap-5 lg:gap-6",
        "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
        className
      )}
      role="grid"
      aria-label={t('ariaLabel', { count: items.length })}
      aria-busy={loading}
      aria-describedby={items.length === 0 ? 'empty-message-grid' : undefined}
    >
      {items.map((item) => (
        <div key={item.id} role="gridcell">
          <ItemCard
            item={item}
            onPreviewClick={onItemPreview}
            onSelectionChange={onSelectionChange}
            isSelected={selectedIds.has(item.id)}
            isSelectionMode={isSelectionMode}
            onLongPressSelect={onLongPressSelect}
            enableInlineEdit={enableInlineEdit}
            onUpdateItem={onUpdateItem}
            existingTags={existingTags}
          />
          {/* Translation Status Indicator */}
          {showTranslationStatus && translationStatuses?.[item.id] && (
            <TranslationStatusColumn
              entityId={item.id}
              entityType="item"
              translations={translationStatuses[item.id]}
              size="sm"
              onClick={() => onTranslationStatusClick?.(item)}
              className="mt-2"
            />
          )}
        </div>
      ))}
    </div>
  );
}
```

#### Integration with ItemCard (Alternative Approach)
If the translation status should appear within the ItemCard itself rather than below it, the ItemCard component would need to be modified to accept and display the translation status indicator. This would require:
1. Adding props to ItemCard for translation status
2. Rendering TranslationStatusColumn inside the card layout
3. Handling click events to prevent propagation conflicts

#### useColumnVisibility Hook Updates
```typescript
// Add to default visibility state
const DEFAULT_VISIBILITY: ColumnVisibilityState = {
  property: false,
  translationStatus: false,  // Hidden by default, opt-in feature
};
```

#### ColumnSettingsPopup Updates
Add translation status to the COLUMN_OPTIONS array:
```typescript
const COLUMN_OPTIONS: ColumnOption[] = [
  { key: 'property', labelKey: 'property' },
  { key: 'translationStatus', labelKey: 'translationStatus' },  // NEW
];
```

#### i18n Keys Required
Add to messages files under `items.columns` namespace:
```json
{
  "items": {
    "columns": {
      "translationStatus": "Translation Status",
      "translationStatusDescription": "Show translation coverage for each item"
    }
  }
}
```

### Dependencies
- **REQ-E05-014**: TranslationStatusColumn component (must be created first)
- **REQ-E05-007**: TranslationPreviewPanel component (opened when status is clicked)
- **REQ-E05-006**: TranslationManagement types file (LanguageTranslationSummary type)
- **REQ-E05-011**: useTranslationStatus hook (for fetching translation status data)
- **Existing**: ItemGrid component at `/src/components/ItemManager/components/ItemGrid.tsx`
- **Existing**: ItemManager.types.ts for type definitions
- **Existing**: useColumnVisibility hook for column visibility management
- **Existing**: next-intl for i18n translations

### User Impact
Property owners see translation coverage status directly in their items grid view. The compact 6-dot indicator provides at-a-glance visibility into which languages are translated for each item. Clicking the indicator opens the TranslationPreviewPanel, enabling quick access to translation management without leaving the items view. This improves workflow efficiency by reducing navigation steps to manage translations.

### Business Value
Integrating translation status into the items grid view surfaces translation gaps in the context where owners manage their content. This increases awareness and encourages completion of translations, leading to better international guest experiences. The optional nature (column visibility toggle) ensures users who don't need this feature aren't affected by additional UI complexity.

### Acceptance Criteria
- [ ] `ItemGridProps` interface updated to include `showTranslationStatus`, `onTranslationStatusClick`, and `translationStatuses` props
- [ ] `ColumnVisibilityState` interface updated to include `translationStatus: boolean`
- [ ] `useColumnVisibility` hook updated with `translationStatus` in default state (default: false)
- [ ] `ColumnSettingsPopup` updated with translation status column option
- [ ] ItemGrid component conditionally renders TranslationStatusColumn when `showTranslationStatus` is true
- [ ] TranslationStatusColumn is imported from `@/components/TranslationManagement/TranslationStatusColumn`
- [ ] Each ItemCard has a translation status indicator when enabled and translation data exists
- [ ] Translation status indicator shows 6 dots for each supported language (es, fr, de, it, nl, pt)
- [ ] Dots are color-coded based on status: green (complete), orange (pending), red (failed), amber (stale), gray (missing)
- [ ] Clicking the translation status indicator calls `onTranslationStatusClick` with the item
- [ ] Translation status is positioned appropriately relative to the ItemCard (below or within)
- [ ] Missing translation data for an item is handled gracefully (show all gray dots or hide indicator)
- [ ] Translation status indicator uses 'sm' size variant for compact display in grid
- [ ] i18n keys added for column label and description
- [ ] Column visibility toggle works correctly for translation status column
- [ ] Component uses i18n for any visible text via next-intl
- [ ] TypeScript types are properly defined and exported
- [ ] No TypeScript compilation errors related to the new props and types
- [ ] No console errors or warnings when translation status is displayed
- [ ] Feature does not break existing ItemGrid functionality when disabled
- [ ] Responsive layout maintained with translation status indicator enabled

---

## REQ-E05-018: Create BulkTranslationBar Component

**Date**: 2026-01-22
**Type**: NEW FEATURE
**Size**: M
**Phase**: Phase 4 (Bulk Operations & Management Page), Task 4.1

### Summary
Property owners need a contextual action bar component that appears when items are selected in the Translation Management interface. This bar provides bulk operations including "Re-translate All" and "Re-translate Specific Language" with a progress indicator during bulk operations. The component enables efficient management of translations at scale.

### Current Behavior
No bulk action bar exists for translation operations. When property owners select multiple items in the Translation Management interface, they have no way to perform bulk translation operations. Each item must be managed individually, which is time-consuming for owners with many items across multiple properties.

### Expected Behavior
A floating action bar appears when one or more items are selected in the Translation Management interface:
- Bar slides in from the bottom of the screen when items are selected
- Displays count of selected items (e.g., "3 items selected")
- Provides "Re-translate All" button to queue re-translation for all selected items in all languages
- Provides "Re-translate Specific Language" dropdown to queue re-translation for selected items in a specific language
- Shows progress indicator during bulk operations with real-time status updates
- Provides cancel operation button during active bulk operations
- Bar slides out when selection is cleared or operation completes
- Supports keyboard accessibility and screen reader announcements

### Technical Details
- **File**: `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`
- **Component Type**: Client component ('use client')
- **Styling**: Tailwind CSS with shadcn/ui components (Button, DropdownMenu, Progress)
- **Animation**: Framer Motion or Tailwind CSS transitions for slide-in/out animation
- **State Management**: React useState for local state, props for selection state

#### Component Props Interface
```typescript
interface BulkTranslationBarProps {
  /** Array of selected item IDs */
  selectedIds: string[];
  /** Callback to clear selection */
  onClearSelection: () => void;
  /** Callback when re-translate all is triggered */
  onRetranslateAll: (entityIds: string[]) => Promise<BulkOperationResult>;
  /** Callback when re-translate specific language is triggered */
  onRetranslateLanguage: (entityIds: string[], language: SupportedLanguage) => Promise<BulkOperationResult>;
  /** Whether a bulk operation is currently in progress */
  isProcessing?: boolean;
  /** Progress of current operation (0-100) */
  progress?: number;
  /** Status message to display during processing */
  statusMessage?: string;
  /** Callback to cancel ongoing operation */
  onCancelOperation?: () => void;
  /** Whether the bar should be visible (controls animation) */
  isVisible?: boolean;
  /** Additional CSS classes */
  className?: string;
}

interface BulkOperationResult {
  success: boolean;
  jobCount: number;
  skippedCount: number;
  errors?: string[];
}

type SupportedLanguage = 'es' | 'fr' | 'de' | 'it' | 'nl' | 'pt';
```

#### Visual Layout
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Default State (items selected, no operation in progress)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ✓ 3 items selected         [Re-translate All]  [Re-translate ▼]  [✕ Clear] │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ Language Dropdown Expanded                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ✓ 3 items selected         [Re-translate All]  [Re-translate ▼]  [✕ Clear] │
│                                                ┌──────────────┐              │
│                                                │ 🇪🇸 Spanish   │              │
│                                                │ 🇫🇷 French    │              │
│                                                │ 🇩🇪 German    │              │
│                                                │ 🇮🇹 Italian   │              │
│                                                │ 🇳🇱 Dutch     │              │
│                                                │ 🇵🇹 Portuguese│              │
│                                                └──────────────┘              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ Processing State (bulk operation in progress)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ⟳ Translating 3 items...   [████████████░░░░░░░░░] 60%           [Cancel]  │
│    Processing: Item 2 of 3 - Spanish                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ Completed State (operation finished)                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ✓ Completed: 18 translations queued, 2 skipped                    [Dismiss]│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Subcomponents
- **BulkTranslationBar.tsx**: Main container with animation and state management
- **SelectionCount.tsx**: Displays count of selected items with checkmark icon
- **LanguageDropdown.tsx**: Dropdown menu for selecting specific language
- **OperationProgress.tsx**: Progress bar with status message during operations
- **index.ts**: Barrel export file

#### Animation Specification
- **Entry Animation**: Slide up from bottom with fade-in (transform: translateY(100%) -> translateY(0), opacity: 0 -> 1)
- **Exit Animation**: Slide down with fade-out (reverse of entry)
- **Duration**: 200-300ms ease-out for entry, 150-200ms ease-in for exit
- **Progress Bar Animation**: Smooth width transition (duration: 100ms)
- **Reduced Motion**: Respect `prefers-reduced-motion` - use opacity only transitions

#### Positioning
- **Position**: Fixed at bottom of viewport or relative to parent container
- **Z-index**: Above content but below modals (z-40 or similar)
- **Width**: Full width with max-width constraint and horizontal padding
- **Mobile**: Stack buttons vertically, reduce padding
- **Desktop**: Horizontal layout with flexbox

#### Button States
| Button | Default | Hover | Processing | Disabled |
|--------|---------|-------|------------|----------|
| Re-translate All | Primary blue | Darker blue | Hidden | Gray |
| Language Dropdown | Secondary/outline | Light fill | Hidden | Gray |
| Clear Selection | Ghost/text | Underline | Hidden | Gray |
| Cancel | Destructive/red | Darker red | Active | Hidden |
| Dismiss | Ghost/text | Underline | Active | Hidden |

#### Key Implementation Details
1. **Visibility Control**: Component renders but is off-screen when `selectedIds.length === 0` or `isVisible === false`
2. **Selection Count**: Display pluralized text ("1 item selected" vs "3 items selected")
3. **Language Options**: Use `SUPPORTED_LANGUAGES` constant from `@/lib/translation-service`
4. **Flag Icons**: Optional flag emoji or icons for language options (🇪🇸 🇫🇷 🇩🇪 🇮🇹 🇳🇱 🇵🇹)
5. **Progress Calculation**: Accept progress prop from parent, or calculate from jobCount/totalJobs
6. **Status Messages**: Display current item being processed during operations
7. **Error Handling**: Show error toast/message if operation fails, keep bar visible
8. **Success Handling**: Show success message briefly, then clear selection and hide bar
9. **Cancel Confirmation**: Optional confirmation dialog before canceling active operation
10. **Keyboard Support**: Focus trap when visible, Escape to clear selection
11. **Screen Reader**: Live region for progress updates, announce selection changes
12. **i18n**: All text uses next-intl translations

#### State Management
```typescript
interface BulkBarState {
  operationStatus: 'idle' | 'processing' | 'completed' | 'error';
  progress: number;
  currentItem?: string;
  result?: BulkOperationResult;
  error?: string;
}
```

#### Example Usage
```tsx
// In TranslationManagementPage or parent component
const [selectedIds, setSelectedIds] = useState<string[]>([]);
const [isProcessing, setIsProcessing] = useState(false);
const [progress, setProgress] = useState(0);

const handleRetranslateAll = async (ids: string[]) => {
  setIsProcessing(true);
  try {
    const result = await retranslateItems(ids);
    return result;
  } finally {
    setIsProcessing(false);
  }
};

return (
  <>
    {/* Item list with selection */}
    <ItemList
      items={items}
      selectedIds={selectedIds}
      onSelectionChange={setSelectedIds}
    />

    {/* Bulk translation bar */}
    <BulkTranslationBar
      selectedIds={selectedIds}
      onClearSelection={() => setSelectedIds([])}
      onRetranslateAll={handleRetranslateAll}
      onRetranslateLanguage={handleRetranslateLanguage}
      isProcessing={isProcessing}
      progress={progress}
      statusMessage={statusMessage}
      onCancelOperation={handleCancel}
    />
  </>
);
```

### Dependencies
- **REQ-E05-003**: Re-Translate API Endpoint (`/api/translations/retranslate`)
- **REQ-E05-006**: TranslationManagement types file (for `SupportedLanguage` and related types)
- **Existing**: shadcn/ui components (Button, DropdownMenu, Progress)
- **Existing**: Framer Motion or Tailwind CSS for animations
- **Existing**: next-intl for translations
- **Existing**: `@/lib/translation-service` for `SUPPORTED_LANGUAGES` constant

### User Impact
Property owners can efficiently manage translations for multiple items at once. Instead of clicking through each item individually, they select multiple items and trigger bulk re-translation with a single action. The progress indicator provides transparency during the operation, and the ability to re-translate specific languages gives fine-grained control. This significantly reduces the time required to manage translations at scale.

### Business Value
Bulk operations are essential for owners with many properties or items. Without bulk actions, translation management becomes a tedious manual process that owners may neglect. The BulkTranslationBar enables efficient workflow, encouraging owners to keep translations current and complete. This leads to better international guest experiences and potentially higher booking rates from non-English speakers.

### Acceptance Criteria
- [ ] Component file created at `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`
- [ ] Component accepts all props defined in `BulkTranslationBarProps` interface
- [ ] Bar appears (slides in) when `selectedIds` array has one or more items
- [ ] Bar disappears (slides out) when `selectedIds` array is empty
- [ ] Slide animation duration is 200-300ms with appropriate easing
- [ ] Animation respects `prefers-reduced-motion` media query
- [ ] Selection count displays correctly ("1 item selected" for single, "N items selected" for multiple)
- [ ] "Re-translate All" button is visible and clickable when not processing
- [ ] Clicking "Re-translate All" calls `onRetranslateAll` with selected IDs
- [ ] Language dropdown button is visible and clickable when not processing
- [ ] Language dropdown displays all 6 supported languages (es, fr, de, it, nl, pt)
- [ ] Language options show language name (e.g., "Spanish", "French")
- [ ] Optional flag icons/emoji displayed with language names
- [ ] Selecting a language calls `onRetranslateLanguage` with selected IDs and language code
- [ ] Clear selection button (✕) is visible and clickable
- [ ] Clicking clear selection calls `onClearSelection`
- [ ] When `isProcessing` is true, action buttons are hidden and progress bar is shown
- [ ] Progress bar displays current progress percentage (0-100)
- [ ] Progress bar animates smoothly as progress updates
- [ ] Status message displays during processing (e.g., "Processing: Item 2 of 3 - Spanish")
- [ ] Cancel button is visible during processing
- [ ] Clicking Cancel calls `onCancelOperation`
- [ ] After operation completes, result summary is displayed (jobs queued, skipped count)
- [ ] Dismiss button appears after operation completion
- [ ] Clicking Dismiss clears selection and hides bar
- [ ] Error state is handled with appropriate error message display
- [ ] Bar is positioned fixed at bottom of viewport
- [ ] Bar has appropriate z-index (above content, below modals)
- [ ] Bar is responsive: horizontal layout on desktop, stacked on mobile
- [ ] All buttons have appropriate hover and focus states
- [ ] Keyboard navigation works correctly (Tab, Enter, Escape)
- [ ] Screen reader announcements for selection changes and progress updates
- [ ] ARIA live region for progress updates
- [ ] All text uses i18n translations via next-intl
- [ ] TypeScript types are properly defined and exported
- [ ] Component is exported from barrel file `/src/components/TranslationManagement/BulkTranslationBar/index.ts`
- [ ] Component follows existing code patterns in `/src/components/TranslationManagement/`
- [ ] No TypeScript compilation errors
- [ ] No console errors or warnings when bar is displayed or used

---

## REQ-E05-019: Create LanguageSelectorDialog Component

**Date**: 2026-01-22
**Type**: NEW FEATURE
**Size**: S
**Phase**: Phase 4 (Bulk Operations & Management Page), Task 4.2

### Summary
Property owners need a modal dialog for selecting target languages when performing bulk re-translation operations. This component provides a checkbox list of all supported languages with Select All and Deselect All functionality, enabling efficient multi-language selection for bulk translation workflows.

### Current Behavior
No language selection dialog exists for bulk translation operations. When owners want to re-translate content to specific languages (rather than all languages), they have no UI mechanism to select multiple target languages at once. The BulkTranslationBar's language dropdown only allows single language selection.

### Expected Behavior
A modal dialog appears when triggered from the BulkTranslationBar or other translation management contexts:
- Dialog displays a list of all supported languages with checkboxes
- Each language option shows the language name and optional flag icon/emoji
- "Select All" button checks all language checkboxes
- "Deselect All" button unchecks all language checkboxes
- "Confirm" button returns the selected languages and closes the dialog
- "Cancel" button closes the dialog without changes
- Dialog supports keyboard navigation and accessibility requirements
- Pre-selected languages can be passed as initial state

### Technical Details
- **File**: `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`
- **Component Type**: Client component ('use client')
- **Styling**: Tailwind CSS with shadcn/ui components (Dialog, Checkbox, Button)
- **State Management**: React useState for checkbox states

#### Component Props Interface
```typescript
interface LanguageSelectorDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when dialog is closed (cancel or outside click) */
  onClose: () => void;
  /** Callback when languages are confirmed */
  onConfirm: (selectedLanguages: SupportedLanguage[]) => void;
  /** Initially selected languages */
  initialSelection?: SupportedLanguage[];
  /** Dialog title (optional, defaults to i18n key) */
  title?: string;
  /** Dialog description (optional, defaults to i18n key) */
  description?: string;
  /** Confirm button text (optional, defaults to i18n key) */
  confirmText?: string;
  /** Cancel button text (optional, defaults to i18n key) */
  cancelText?: string;
  /** Additional CSS classes for the dialog */
  className?: string;
}

type SupportedLanguage = 'es' | 'fr' | 'de' | 'it' | 'nl' | 'pt';

interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  flag?: string; // Optional emoji flag
}
```

#### Visual Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Select Languages for Re-translation                        [✕] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Select the target languages for bulk re-translation.           │
│                                                                 │
│  [Select All]  [Deselect All]                                   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ☑ 🇪🇸 Spanish                                            │   │
│  │ ☑ 🇫🇷 French                                             │   │
│  │ ☐ 🇩🇪 German                                             │   │
│  │ ☑ 🇮🇹 Italian                                            │   │
│  │ ☐ 🇳🇱 Dutch                                              │   │
│  │ ☐ 🇵🇹 Portuguese                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                              [Cancel]    [Confirm (3 selected)] │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Language Options Configuration
```typescript
const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
];
```

#### Key Implementation Details
1. **Dialog Base**: Use shadcn/ui Dialog component for modal behavior
2. **Checkbox State**: Maintain internal state of selected languages as `Set<SupportedLanguage>`
3. **Initial Selection**: Accept `initialSelection` prop to pre-check languages
4. **Select All**: Set state to include all 6 supported languages
5. **Deselect All**: Set state to empty set
6. **Confirm Button**: Include count of selected languages in button text (e.g., "Confirm (3 selected)")
7. **Confirm Disabled**: Disable confirm button when no languages are selected
8. **Close Behavior**: Call `onClose` when Escape is pressed, backdrop is clicked, or Cancel is clicked
9. **Confirm Behavior**: Call `onConfirm` with array of selected language codes
10. **i18n**: All text (title, description, language names, buttons) uses next-intl translations
11. **Accessibility**: Proper ARIA labels, focus management, keyboard navigation
12. **Language Names**: Display localized language names based on current locale

#### State Management
```typescript
const [selectedLanguages, setSelectedLanguages] = useState<Set<SupportedLanguage>>(
  new Set(initialSelection ?? [])
);

const handleSelectAll = () => {
  setSelectedLanguages(new Set(LANGUAGE_OPTIONS.map(l => l.code)));
};

const handleDeselectAll = () => {
  setSelectedLanguages(new Set());
};

const handleToggleLanguage = (code: SupportedLanguage) => {
  setSelectedLanguages(prev => {
    const next = new Set(prev);
    if (next.has(code)) {
      next.delete(code);
    } else {
      next.add(code);
    }
    return next;
  });
};

const handleConfirm = () => {
  onConfirm(Array.from(selectedLanguages));
};
```

#### Example Usage
```tsx
// In BulkTranslationBar or parent component
const [isLanguageDialogOpen, setIsLanguageDialogOpen] = useState(false);

const handleRetranslateLanguages = async (languages: SupportedLanguage[]) => {
  setIsLanguageDialogOpen(false);
  await retranslateItems(selectedIds, languages);
};

return (
  <>
    <Button onClick={() => setIsLanguageDialogOpen(true)}>
      Re-translate Selected Languages...
    </Button>

    <LanguageSelectorDialog
      isOpen={isLanguageDialogOpen}
      onClose={() => setIsLanguageDialogOpen(false)}
      onConfirm={handleRetranslateLanguages}
      initialSelection={['es', 'fr']}
    />
  </>
);
```

### Dependencies
- **REQ-E05-018**: BulkTranslationBar component (parent component that uses this dialog)
- **REQ-E05-006**: TranslationManagement types file (for `SupportedLanguage` type)
- **Existing**: shadcn/ui Dialog component (`@/components/ui/dialog`)
- **Existing**: shadcn/ui Checkbox component (`@/components/ui/checkbox`)
- **Existing**: shadcn/ui Button component (`@/components/ui/button`)
- **Existing**: next-intl for translations
- **Existing**: `@/lib/translation-service` for `SUPPORTED_LANGUAGES` constant

### User Impact
Property owners gain fine-grained control over bulk re-translation operations. Instead of being limited to "all languages" or "single language" options, they can select any combination of target languages. This is particularly valuable when owners know certain translations are outdated or when they want to prioritize specific markets. The Select All/Deselect All buttons make it quick to choose common patterns (all languages, or starting fresh with specific selections).

### Business Value
Multi-language selection reduces unnecessary translation costs and processing time. Owners can target only the languages that need updates rather than re-translating everything. This efficiency encourages more frequent translation maintenance, leading to fresher content for international guests. The intuitive UI reduces friction in the translation management workflow.

### Acceptance Criteria
- [ ] Component file created at `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`
- [ ] Component accepts all props defined in `LanguageSelectorDialogProps` interface
- [ ] Dialog opens when `isOpen` prop is true
- [ ] Dialog closes when `isOpen` prop becomes false
- [ ] Dialog displays title and description text
- [ ] All 6 supported languages are displayed as checkbox options (es, fr, de, it, nl, pt)
- [ ] Each language option shows language name (e.g., "Spanish", "French")
- [ ] Optional flag emoji is displayed next to language name
- [ ] Checkboxes reflect current selection state correctly
- [ ] Clicking a checkbox toggles that language's selection state
- [ ] "Select All" button checks all language checkboxes
- [ ] "Deselect All" button unchecks all language checkboxes
- [ ] `initialSelection` prop correctly pre-selects specified languages
- [ ] Confirm button displays count of selected languages (e.g., "Confirm (3 selected)")
- [ ] Confirm button is disabled when no languages are selected
- [ ] Clicking Confirm calls `onConfirm` with array of selected language codes
- [ ] Clicking Cancel calls `onClose` without triggering `onConfirm`
- [ ] Clicking dialog backdrop (outside) calls `onClose`
- [ ] Pressing Escape key calls `onClose`
- [ ] Dialog close button (✕) calls `onClose`
- [ ] Focus is trapped within dialog when open
- [ ] Focus moves to first focusable element when dialog opens
- [ ] Focus returns to trigger element when dialog closes
- [ ] Tab key navigates through checkboxes and buttons
- [ ] Space/Enter keys toggle checkbox selection
- [ ] ARIA attributes properly set for dialog role and labels
- [ ] Language names are translatable via i18n (show localized names based on current locale)
- [ ] All button text uses i18n translations via next-intl
- [ ] TypeScript types are properly defined and exported
- [ ] Component follows existing code patterns in `/src/components/TranslationManagement/`
- [ ] Component integrates with BulkTranslationBar as documented
- [ ] No TypeScript compilation errors
- [ ] No console errors or warnings when dialog is opened or used

---

## REQ-E05-020: Create Translation Management Page

**Date**: 2026-01-22
**Type**: NEW FEATURE
**Size**: L
**Phase**: Phase 4 (Bulk Operations & Management Page), Task 4.3

### Summary
Property owners need a dedicated Translation Management page to view, filter, and manage translations for all their content (items and articles) across multiple languages. This page provides a centralized location for translation oversight with a full-width table, filtering capabilities, and bulk selection support.

### Current Behavior
No dedicated page exists for managing translations at scale. Property owners must navigate to individual item or article pages to view translation status and make changes. There is no overview of translation coverage across all content, making it difficult to identify gaps or prioritize translation work.

### Expected Behavior
A Translation Management page displays all translatable content with translation status indicators:
- Full-width table showing all items and articles with translation information
- Columns display: Item/Article name, status indicators for each language, and action buttons
- Filter bar allows filtering by content type (items/articles), language, and translation status
- Bulk selection enables selecting multiple rows for batch operations
- Integrates with BulkTranslationBar (REQ-E05-018) for bulk translation actions
- Responsive design for various screen sizes
- Loading states during data fetch
- Empty states when no content matches filters

### Technical Details
- **File**: `/src/app/dashboard2/translations/page.tsx`
- **Layout File**: `/src/app/dashboard2/translations/layout.tsx` (optional, for consistent dashboard layout)
- **Component Type**: Client component ('use client') with data fetching
- **Styling**: Tailwind CSS with shadcn/ui components (Table, Checkbox, Button, Select, Badge)
- **State Management**: React useState/useReducer for selections and filters
- **Data Fetching**: Uses translation status API endpoint (REQ-E05-001)

#### Page Structure
```typescript
interface TranslationPageFilters {
  /** Filter by content type */
  contentType: 'all' | 'item' | 'article';
  /** Filter by specific language */
  language: SupportedLanguage | 'all';
  /** Filter by translation status */
  status: 'all' | 'complete' | 'pending' | 'missing' | 'stale';
  /** Search by name/title */
  search: string;
}

interface TranslationRow {
  /** Unique identifier */
  id: string;
  /** Type of content */
  entityType: 'item' | 'article';
  /** Entity ID */
  entityId: string;
  /** Display name */
  name: string;
  /** Parent item name (for articles) */
  parentName?: string;
  /** Property ID */
  propertyId: string;
  /** Translation status per language */
  translations: {
    [key in SupportedLanguage]?: {
      status: 'complete' | 'pending' | 'stale' | 'manual';
      updatedAt?: Date;
    };
  };
  /** Source content last updated */
  sourceUpdatedAt: Date;
}

type SupportedLanguage = 'es' | 'fr' | 'de' | 'it' | 'nl' | 'pt';
```

#### Visual Layout
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Translation Management                                                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Filter Bar                                                              │   │
│  │ ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────────────────┐  │   │
│  │ │ Type ▾   │  │ Language │  │ Status ▾ │  │ 🔍 Search content...    │  │   │
│  │ └──────────┘  └──────────┘  └──────────┘  └─────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ [BulkTranslationBar - appears when items selected]                      │   │
│  │ 3 items selected  [Re-translate All] [Re-translate...] [Clear Selection]│   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Table                                                                   │   │
│  │ ┌───┬────────────────────┬────┬────┬────┬────┬────┬────┬─────────────┐ │   │
│  │ │ ☑ │ Name               │ ES │ FR │ DE │ IT │ NL │ PT │ Actions     │ │   │
│  │ ├───┼────────────────────┼────┼────┼────┼────┼────┼────┼─────────────┤ │   │
│  │ │ ☑ │ 🏠 WiFi Router     │ ✓  │ ✓  │ ⚠  │ ✓  │ -  │ -  │ [Edit] [▾] │ │   │
│  │ │ ☐ │   └─ Setup Guide   │ ✓  │ ✓  │ -  │ ✓  │ -  │ -  │ [Edit] [▾] │ │   │
│  │ │ ☐ │   └─ Troubleshoot  │ ✓  │ -  │ -  │ -  │ -  │ -  │ [Edit] [▾] │ │   │
│  │ │ ☑ │ 🏠 Coffee Machine  │ ✓  │ ✓  │ ✓  │ ✓  │ ✓  │ ✓  │ [Edit] [▾] │ │   │
│  │ │ ☐ │ 🏠 Smart TV        │ ⏳ │ ⏳ │ -  │ -  │ -  │ -  │ [Edit] [▾] │ │   │
│  │ └───┴────────────────────┴────┴────┴────┴────┴────┴────┴─────────────┘ │   │
│  │                                                                         │   │
│  │ Legend: ✓ Complete  ⏳ Pending  ⚠ Stale  ✎ Manual  - Missing            │   │
│  │                                                                         │   │
│  │ Showing 5 of 42 items                          [← 1 2 3 4 5 →]         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### Filter Bar Component
```typescript
interface FilterBarProps {
  filters: TranslationPageFilters;
  onFiltersChange: (filters: TranslationPageFilters) => void;
  /** Total count of items matching filters */
  resultCount: number;
}
```

Filter options:
- **Type**: All, Items Only, Articles Only
- **Language**: All, Spanish, French, German, Italian, Dutch, Portuguese
- **Status**: All, Complete, Pending, Missing, Stale
- **Search**: Text input for filtering by name

#### Table Component Features
1. **Checkbox Column**: Select individual rows or use header checkbox for select all
2. **Name Column**: Display content name with icon indicating type (item/article), indent articles under parent items
3. **Language Status Columns**: One column per supported language showing status badge
4. **Actions Column**: Edit button, dropdown menu with additional actions (View, Re-translate, Delete Translation)
5. **Sortable Columns**: Name, language status columns sortable
6. **Pagination**: Page size selector (10, 25, 50, 100), page navigation

#### Status Badges
```typescript
const STATUS_BADGES = {
  complete: { icon: '✓', color: 'green', label: 'Complete' },
  pending: { icon: '⏳', color: 'yellow', label: 'Pending' },
  stale: { icon: '⚠', color: 'orange', label: 'Stale' },
  manual: { icon: '✎', color: 'blue', label: 'Manually Edited' },
  missing: { icon: '-', color: 'gray', label: 'Missing' },
};
```

#### Data Fetching
```typescript
// Fetch translation status for all content
const fetchTranslationData = async (filters: TranslationPageFilters) => {
  const response = await fetch('/api/translations/status', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) throw new Error('Failed to fetch translation status');

  const data = await response.json();
  return transformToTranslationRows(data, filters);
};
```

#### Bulk Selection State
```typescript
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

const handleSelectAll = (checked: boolean) => {
  if (checked) {
    setSelectedIds(new Set(displayedRows.map(row => row.id)));
  } else {
    setSelectedIds(new Set());
  }
};

const handleSelectRow = (id: string, checked: boolean) => {
  setSelectedIds(prev => {
    const next = new Set(prev);
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    return next;
  });
};
```

#### Integration with BulkTranslationBar
When items are selected, the BulkTranslationBar (REQ-E05-018) appears above the table:
```tsx
{selectedIds.size > 0 && (
  <BulkTranslationBar
    selectedCount={selectedIds.size}
    onRetranslateAll={() => handleBulkRetranslate('all')}
    onRetranslateSelected={() => setShowLanguageDialog(true)}
    onClearSelection={() => setSelectedIds(new Set())}
  />
)}
```

#### Empty States
- **No content**: "No items or articles found. Create your first item to get started."
- **No matches**: "No content matches your filters. Try adjusting your filter criteria."
- **Loading**: Skeleton rows with shimmer animation

### Dependencies
- **REQ-E05-001**: Translation Status API Endpoint (data source)
- **REQ-E05-018**: BulkTranslationBar Component (bulk actions UI)
- **REQ-E05-019**: LanguageSelectorDialog Component (language selection for bulk re-translate)
- **REQ-E05-003**: Re-Translate API Endpoint (bulk re-translation action)
- **Existing**: shadcn/ui Table, Checkbox, Button, Select, Badge components
- **Existing**: next-intl for translations
- **Existing**: Dashboard2 layout components

### User Impact
Property owners gain a centralized view of all their translation status across items and articles. The filtering capabilities allow them to quickly identify content that needs attention (missing translations, stale translations, pending translations). Bulk selection enables efficient batch operations, reducing the time needed to manage translations at scale. The visual status indicators provide at-a-glance understanding of translation coverage.

### Business Value
Improves translation management efficiency for property owners with multiple items and languages. Reduces the friction of maintaining up-to-date translations by making gaps visible and actionable. Encourages higher translation coverage rates, which improves the guest experience for international visitors. The bulk operations support reduces the operational overhead of translation maintenance.

### Acceptance Criteria
- [ ] Page file created at `/src/app/dashboard2/translations/page.tsx`
- [ ] Page is accessible via `/dashboard2/translations` route
- [ ] Page renders within the Dashboard2 layout (sidebar, header)
- [ ] Page title "Translation Management" is displayed
- [ ] Filter bar is displayed at the top of the page
- [ ] Type filter dropdown includes options: All, Items, Articles
- [ ] Language filter dropdown includes options: All, Spanish, French, German, Italian, Dutch, Portuguese
- [ ] Status filter dropdown includes options: All, Complete, Pending, Missing, Stale
- [ ] Search input filters content by name
- [ ] Filters apply immediately when changed (debounced for search input)
- [ ] URL query parameters reflect current filter state for shareable links
- [ ] Table displays all items and articles with translation status
- [ ] Table columns: Checkbox, Name, ES, FR, DE, IT, NL, PT, Actions
- [ ] Language columns display appropriate status badge (complete, pending, stale, manual, missing)
- [ ] Articles are visually indented under their parent items
- [ ] Header checkbox selects/deselects all visible rows
- [ ] Individual row checkboxes toggle selection state
- [ ] Selection state persists when filters change (only for visible items)
- [ ] BulkTranslationBar appears when at least one item is selected
- [ ] BulkTranslationBar displays count of selected items
- [ ] "Re-translate All Languages" button triggers bulk re-translation for all languages
- [ ] "Re-translate Selected Languages..." button opens LanguageSelectorDialog
- [ ] "Clear Selection" button deselects all items
- [ ] Actions column Edit button navigates to edit page for item/article
- [ ] Actions column dropdown includes: View, Re-translate, Delete Translation options
- [ ] Pagination controls display at bottom of table
- [ ] Page size selector allows 10, 25, 50, 100 items per page
- [ ] Page navigation shows current page and total pages
- [ ] Loading state displays skeleton rows during data fetch
- [ ] Empty state displays appropriate message when no content exists
- [ ] Empty state displays appropriate message when filters return no results
- [ ] Status legend is displayed below the table
- [ ] All text is translatable via next-intl
- [ ] Page is responsive and usable on tablet and mobile screens
- [ ] No TypeScript compilation errors
- [ ] No console errors or warnings during normal operation
- [ ] Integration with REQ-E05-001 API returns correct data
- [ ] Integration with REQ-E05-003 API performs bulk re-translation correctly
- [ ] Property filter from dashboard context is applied (users only see their own content)

---

## REQ-E05-021: Add Translations Link to Dashboard Navigation

**Date**: 2026-01-22
**Type**: MODIFICATION
**Size**: S
**Phase**: Phase 4 (Bulk Operations & Management Page), Task 4.4

### Summary
Property owners need a navigation link to the Translation Management page within the dashboard navigation menu. This enables easy access to the translation management features from anywhere in the dashboard.

### Current Behavior
The dashboard navigation in `/src/app/dashboard2/Dashboard2LayoutClient.tsx` includes four navigation items:
- Dashboard (`/dashboard2`)
- Items (`/dashboard2/items`)
- Guides (`/dashboard2/instructions`)
- Properties (`/dashboard2/properties`)

There is no navigation link to the Translation Management page (`/dashboard2/translations`), making it difficult for property owners to discover and access translation management features.

### Expected Behavior
A "Translations" navigation item is added to the dashboard navigation:
- Appears in the main navigation menu (after Properties or as a logical position in the nav)
- Uses a Languages or Globe icon from Lucide React
- Links to `/dashboard2/translations`
- Follows the same styling and behavior as existing navigation items
- Includes proper i18n translations for the label
- Active state highlighting matches existing navigation items

### Technical Details
- **File**: `/src/app/dashboard2/Dashboard2LayoutClient.tsx` (modify)
- **Component Type**: Client component ('use client')
- **Icon Options**: `Languages` or `Globe` from `lucide-react`

#### Current Navigation Structure (lines 51-78)
```typescript
const navigationItems: NavItem[] = [
  {
    name: t('nav.dashboard'),
    mobileLabel: t('nav.mobile.dashboard'),
    href: '/dashboard2',
    icon: LayoutDashboard,
  },
  {
    name: t('nav.items'),
    mobileLabel: t('nav.mobile.items'),
    href: '/dashboard2/items',
    icon: Package,
  },
  {
    name: t('nav.guides'),
    mobileLabel: t('nav.mobile.guides'),
    href: '/dashboard2/instructions',
    icon: FileText,
  },
  {
    name: t('nav.properties'),
    mobileLabel: t('nav.mobile.properties'),
    href: '/dashboard2/properties',
    icon: Building2,
  },
];
```

#### Proposed Addition
```typescript
{
  name: t('nav.translations'),
  mobileLabel: t('nav.mobile.translations'),
  href: '/dashboard2/translations',
  icon: Languages, // or Globe
},
```

#### Required Import Addition
```typescript
import { Building2, FileText, Globe, Languages, LayoutDashboard, Loader2, LogOut, Package } from 'lucide-react';
```

#### Translation Keys to Add
The following translation keys must be added to all locale files (`/messages/*.json`):

```json
{
  "dashboard": {
    "nav": {
      "translations": "Translations",
      "mobile": {
        "translations": "Trans."
      }
    }
  }
}
```

| Locale | nav.translations | nav.mobile.translations |
|--------|------------------|-------------------------|
| en | Translations | Trans. |
| es | Traducciones | Trad. |
| fr | Traductions | Trad. |
| de | Übersetzungen | Übers. |
| it | Traduzioni | Trad. |
| nl | Vertalingen | Vert. |

#### Navigation Position Options
**Option A: After Properties (end of list)**
- Dashboard → Items → Guides → Properties → **Translations**
- Pros: Least disruptive to existing user habits
- Cons: May be less discoverable

**Option B: After Guides (before Properties)**
- Dashboard → Items → Guides → **Translations** → Properties
- Pros: Groups content management items together
- Cons: Shifts Properties position

**Recommended: Option A** - Add Translations at the end of the navigation list to minimize disruption to existing user workflows.

#### Icon Selection
| Icon | Visual | Use Case |
|------|--------|----------|
| `Languages` | Multiple text lines | Better represents translation/language functionality |
| `Globe` | Earth/world icon | Represents international/global reach |

**Recommended: `Languages`** - More directly represents translation functionality.

### Dependencies
- **REQ-E05-020**: Translation Management Page (the destination page for this nav link)
- **Existing**: Navigation structure in `/src/app/dashboard2/Dashboard2LayoutClient.tsx`
- **Existing**: next-intl translations in `/messages/*.json`
- **Existing**: Lucide React icons package

### User Impact
Property owners can easily navigate to the Translation Management page from anywhere in the dashboard. The consistent navigation placement and styling ensures users can quickly learn the new feature location. The icon provides visual recognition for translation-related functionality.

### Business Value
Makes the Translation Management feature discoverable and accessible. Without a navigation link, users might not know the feature exists or would have difficulty finding it. Easy access encourages more frequent use of translation management, leading to better translation coverage and improved international guest experiences.

### Acceptance Criteria
- [ ] `Languages` icon (or `Globe`) is imported from `lucide-react` in Dashboard2LayoutClient.tsx
- [ ] New navigation item is added to the `navigationItems` array
- [ ] Navigation item `name` uses translation key `t('nav.translations')`
- [ ] Navigation item `mobileLabel` uses translation key `t('nav.mobile.translations')`
- [ ] Navigation item `href` is set to `/dashboard2/translations`
- [ ] Navigation item `icon` is set to `Languages` (or `Globe`)
- [ ] Translation key `dashboard.nav.translations` is added to `/messages/en.json`
- [ ] Translation key `dashboard.nav.mobile.translations` is added to `/messages/en.json`
- [ ] Translation keys are added to all other locale files (es, fr, de, it, nl)
- [ ] Navigation item displays correctly on desktop viewports (full label)
- [ ] Navigation item displays correctly on mobile viewports (abbreviated label)
- [ ] Navigation item has correct active state styling when on `/dashboard2/translations`
- [ ] Navigation item has correct hover state styling
- [ ] Navigation item is keyboard accessible (Tab navigation, Enter to activate)
- [ ] Navigation item has correct focus-visible ring styling
- [ ] Clicking the navigation item navigates to `/dashboard2/translations`
- [ ] No TypeScript compilation errors after changes
- [ ] No console errors or warnings related to the navigation
- [ ] Icon visually aligns with other navigation icons
- [ ] Navigation order is maintained as: Dashboard, Items, Guides, Properties, Translations

---

## REQ-E05-022: Create ManualEditWarningDialog Component

**Date**: 2026-01-22
**Type**: NEW FEATURE
**Size**: M
**Phase**: Phase 5 (Manual Edit Preservation), Task 5.1

### Summary
Property owners need a warning dialog that appears when they update source content and manual translations exist. The dialog provides options to either keep manual edits or re-translate all affected languages, ensuring owners don't accidentally lose their carefully edited translations.

### Current Behavior
When an owner updates source content (item title, description, or article content), there is no warning or handling for existing manual translations. If re-translation is triggered, manual edits could be silently overwritten without the owner's explicit consent.

### Expected Behavior
When source content is updated and manual translations exist for any language:
- A warning dialog appears before the update is finalized
- The dialog clearly lists which languages have manual edits that could be affected
- Two clear options are presented:
  1. **Keep manual edits**: Update only the source content, preserve all manual translations (they will be marked as stale)
  2. **Re-translate all**: Generate new machine translations for all languages, overwriting manual edits
- A cancel option allows the user to abort the update entirely
- The dialog emphasizes that re-translating will permanently lose manual edits

### Technical Details
- **File**: `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx`
- **Index File**: `/src/components/TranslationManagement/ManualEditWarning/index.ts`
- **Component Type**: Client component ('use client')
- **Pattern**: Modal dialog similar to `ConfirmDeleteDialog`

#### Props Interface
```typescript
export interface ManualEditWarningDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  
  /** Array of language codes that have manual edits (e.g., ['fr', 'de', 'es']) */
  manuallyEditedLanguages: string[];
  
  /** Callback when user chooses to keep manual edits (update source only) */
  onKeepManual: () => void;
  
  /** Callback when user chooses to overwrite manual edits (re-translate all) */
  onOverwrite: () => void;
  
  /** Callback when user cancels the operation */
  onCancel: () => void;
  
  /** Loading state during operation */
  loading?: boolean;
  
  /** Entity type being updated (for context in dialog message) */
  entityType?: 'item' | 'article';
  
  /** Optional additional CSS classes */
  className?: string;
}
```

#### Component Structure
```tsx
'use client';

import { AlertTriangle, Loader2, Languages, Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

// Language display name mapping
const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  nl: 'Dutch',
  pt: 'Portuguese',
};

export function ManualEditWarningDialog({
  isOpen,
  manuallyEditedLanguages,
  onKeepManual,
  onOverwrite,
  onCancel,
  loading = false,
  entityType = 'item',
  className,
}: ManualEditWarningDialogProps) {
  const t = useTranslations('translations.manualEditWarning');
  
  // Don't render if not open or no manual edits
  if (!isOpen || manuallyEditedLanguages.length === 0) {
    return null;
  }
  
  // ... dialog implementation
}
```

#### Dialog Content Structure
1. **Header**: Warning icon (AlertTriangle) with amber/yellow background
2. **Title**: "Manual Translations Will Be Affected" (translatable)
3. **Description**: Explains that source content changes affect translations
4. **Language List**: Shows affected languages with flag icons or language names
5. **Options Section**:
   - Keep Manual Edits button (primary/safe action)
   - Re-translate All button (destructive action with warning)
6. **Cancel Button**: Allow aborting the entire operation

#### Visual Design
- Warning icon in amber/yellow circle (not red, as this is a warning not error)
- Language list in a scrollable box (max 6 visible before scroll)
- "Keep manual edits" button should be primary/highlighted (recommended action)
- "Re-translate all" button should use destructive styling (red)
- Clear visual hierarchy emphasizing the safe option

#### Translation Keys Required
Add to `/messages/*.json` under `translations.manualEditWarning` namespace:
```json
{
  "translations": {
    "manualEditWarning": {
      "title": "Manual Translations Affected",
      "description": "You have manually edited translations in the following languages. Updating the source content will affect these translations.",
      "affectedLanguages": "Affected languages:",
      "keepManualOption": "Keep manual edits",
      "keepManualDescription": "Update source content only. Manual translations will be marked as potentially stale.",
      "retranslateOption": "Re-translate all",
      "retranslateWarning": "This will overwrite your manual edits permanently.",
      "cancel": "Cancel",
      "processing": "Processing..."
    }
  }
}
```

| Locale | title | keepManualOption | retranslateOption |
|--------|-------|------------------|-------------------|
| en | Manual Translations Affected | Keep manual edits | Re-translate all |
| es | Traducciones manuales afectadas | Mantener ediciones manuales | Retraducir todo |
| fr | Traductions manuelles affectées | Conserver les modifications manuelles | Tout retraduire |
| de | Manuelle Übersetzungen betroffen | Manuelle Bearbeitungen behalten | Alles neu übersetzen |
| it | Traduzioni manuali interessate | Mantieni modifiche manuali | Ritraduci tutto |
| nl | Handmatige vertalingen beïnvloed | Handmatige bewerkingen behouden | Alles opnieuw vertalen |

#### Accessibility Requirements
- Use `role="alertdialog"` for the modal
- Include `aria-modal="true"`
- Proper `aria-labelledby` and `aria-describedby` attributes
- Keyboard navigation: Escape to cancel, Tab through options
- Focus trap within dialog when open
- Return focus to trigger element on close

#### Integration Points
This dialog is triggered when:
1. User saves changes to an item (ItemEditor) and manual translations exist
2. User saves changes to an article (ArticleEditor) and manual translations exist
3. User uses bulk "Re-translate" action on items with manual edits

The dialog should be integrated with:
- Item editing workflow (check for manual translations before save)
- Article editing workflow
- Re-Translate API endpoint (REQ-E05-003)
- Translation Status API (REQ-E05-001) to check for manual translations

### Dependencies
- **REQ-E05-001**: Translation Status API Endpoint (to check which translations are manual)
- **REQ-E05-002**: Update Translation API Endpoint (for the update operation)
- **REQ-E05-003**: Re-Translate API Endpoint (for the re-translate action)
- **REQ-E05-004**: source_version_at columns (for stale detection)
- **Existing**: next-intl for translations
- **Existing**: Lucide React icons
- **Existing**: cn utility for class merging
- **Existing**: Tailwind CSS for styling

### User Impact
Property owners who have invested time in manually reviewing and editing translations gain protection against accidental loss. The clear options allow owners to make informed decisions about whether their manual edits should be preserved or if fresh machine translations are preferred. This reduces frustration from unexpected data loss and builds trust in the translation system.

### Business Value
Protects user investment in translation quality review. Manual edits represent significant owner effort, and losing them accidentally would damage user trust and increase support burden. The dialog ensures intentional decision-making around translation management, improving overall user satisfaction with the translation features.

### Acceptance Criteria
- [ ] Component file created at `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx`
- [ ] Index file created at `/src/components/TranslationManagement/ManualEditWarning/index.ts` with exports
- [ ] Component accepts `isOpen`, `manuallyEditedLanguages`, `onKeepManual`, `onOverwrite`, `onCancel` props
- [ ] Component accepts optional `loading`, `entityType`, and `className` props
- [ ] Dialog only renders when `isOpen` is true AND `manuallyEditedLanguages` has at least one item
- [ ] Warning icon displays in amber/yellow circle (not red)
- [ ] Dialog title is "Manual Translations Affected" (or locale equivalent)
- [ ] Dialog description explains the impact of source content changes
- [ ] Affected languages are listed with display names (e.g., "French", "German")
- [ ] Language list supports scrolling if more than 6 languages are affected
- [ ] "Keep manual edits" button is styled as primary/recommended action
- [ ] "Keep manual edits" button calls `onKeepManual` when clicked
- [ ] "Re-translate all" button is styled as destructive action (red)
- [ ] "Re-translate all" button includes warning text about permanent loss
- [ ] "Re-translate all" button calls `onOverwrite` when clicked
- [ ] "Cancel" button calls `onCancel` when clicked
- [ ] All buttons are disabled when `loading` is true
- [ ] Loading state shows spinner on the active button
- [ ] Dialog has `role="alertdialog"` for accessibility
- [ ] Dialog has `aria-modal="true"` attribute
- [ ] Dialog includes proper `aria-labelledby` pointing to title
- [ ] Dialog includes proper `aria-describedby` pointing to description
- [ ] Pressing Escape key calls `onCancel` (when not loading)
- [ ] Clicking backdrop calls `onCancel` (when not loading)
- [ ] Tab key navigates through dialog buttons
- [ ] Translation keys are added to `/messages/en.json`
- [ ] Translation keys are added to all locale files (es, fr, de, it, nl)
- [ ] No TypeScript compilation errors
- [ ] No console errors or warnings during normal operation
- [ ] Component follows existing dialog patterns (similar to ConfirmDeleteDialog)

---

## REQ-E05-023: Implement Stale Translation Indicator in TranslationStatusItem

**Date**: 2026-01-22
**Type**: NEW FEATURE
**Size**: M
**Phase**: Phase 5 (Manual Edit Preservation), Task 5.2

### Summary
Property owners need a visual indicator when manual translations become stale after source content changes. The TranslationStatusItem component should display a warning icon with yellow border styling for stale manual edits, along with an "Update Translation" action button to prompt owners to refresh or review the translation.

### Current Behavior
The TranslationStatusItem component displays translation status for individual languages but does not differentiate between current and stale translations. When source content is updated, manually edited translations that were based on older source content appear the same as current translations, leaving owners unaware that their translations may no longer accurately reflect the source.

### Expected Behavior
TranslationStatusItem should detect and display stale translation status:
- Compare `source_version_at` timestamp with source entity's `updated_at` timestamp
- When source `updated_at` > translation `source_version_at`, the translation is stale
- Stale manual translations display:
  1. Yellow/amber warning icon (AlertTriangle or similar)
  2. Yellow/amber border or background highlight
  3. "Stale" or "Outdated" status label
  4. "Update Translation" action button
- The warning is most prominent for manual translations (status='manual') as these represent owner investment
- Machine translations (status='auto') may show a less prominent indicator or simply trigger automatic re-translation

### Technical Details
- **File**: `/src/components/TranslationManagement/TranslationStatusItem.tsx` (update existing)
- **Related Files**: 
  - `/src/types/translations.ts` (may need stale status type)
  - `/src/lib/translation-utils.ts` (utility for stale detection)

#### Props Updates
```typescript
export interface TranslationStatusItemProps {
  // Existing props...
  language: string;
  status: TranslationStatus; // 'complete' | 'pending' | 'missing' | 'manual' | 'auto'
  lastUpdated?: Date;
  onEdit?: () => void;
  
  // New props for stale detection
  /** Timestamp when translation was created/updated based on source content */
  sourceVersionAt?: Date | string | null;
  
  /** Timestamp of current source content (item/article updated_at) */
  sourceUpdatedAt?: Date | string | null;
  
  /** Callback when "Update Translation" button is clicked */
  onUpdateTranslation?: () => void;
  
  /** Whether the translation is currently being updated */
  isUpdating?: boolean;
}
```

#### Stale Detection Logic
```typescript
// Utility function in /src/lib/translation-utils.ts
export function isTranslationStale(
  sourceVersionAt: Date | string | null | undefined,
  sourceUpdatedAt: Date | string | null | undefined
): boolean {
  if (!sourceVersionAt || !sourceUpdatedAt) {
    return false; // Cannot determine staleness without both timestamps
  }
  
  const versionTime = new Date(sourceVersionAt).getTime();
  const sourceTime = new Date(sourceUpdatedAt).getTime();
  
  return sourceTime > versionTime;
}

// Check if stale with grace period (optional, to avoid flickering on rapid edits)
export function isTranslationStaleWithGrace(
  sourceVersionAt: Date | string | null | undefined,
  sourceUpdatedAt: Date | string | null | undefined,
  graceMinutes: number = 5
): boolean {
  if (!sourceVersionAt || !sourceUpdatedAt) {
    return false;
  }
  
  const versionTime = new Date(sourceVersionAt).getTime();
  const sourceTime = new Date(sourceUpdatedAt).getTime();
  const graceMs = graceMinutes * 60 * 1000;
  
  return sourceTime > (versionTime + graceMs);
}
```

#### Component Structure Updates
```tsx
'use client';

import { AlertTriangle, Check, Clock, Edit, Languages, Loader2, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { isTranslationStale } from '@/lib/translation-utils';

export function TranslationStatusItem({
  language,
  status,
  lastUpdated,
  onEdit,
  sourceVersionAt,
  sourceUpdatedAt,
  onUpdateTranslation,
  isUpdating = false,
  className,
}: TranslationStatusItemProps) {
  const t = useTranslations('translations.statusItem');
  
  // Determine if translation is stale
  const isStale = status === 'manual' && isTranslationStale(sourceVersionAt, sourceUpdatedAt);
  
  // Determine visual styling based on status and staleness
  const statusStyles = getStatusStyles(status, isStale);
  
  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 rounded-lg border',
        isStale && 'border-amber-400 bg-amber-50 dark:bg-amber-950/20',
        !isStale && 'border-gray-200 dark:border-gray-700',
        className
      )}
    >
      {/* Language and status display */}
      <div className="flex items-center gap-3">
        <LanguageIcon language={language} />
        <div>
          <p className="font-medium">{getLanguageDisplayName(language)}</p>
          <StatusBadge status={status} isStale={isStale} />
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2">
        {isStale && (
          <StaleWarningIcon />
        )}
        
        {isStale && onUpdateTranslation && (
          <button
            onClick={onUpdateTranslation}
            disabled={isUpdating}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md',
              'bg-amber-100 text-amber-700 hover:bg-amber-200',
              'dark:bg-amber-900 dark:text-amber-100 dark:hover:bg-amber-800',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors duration-200'
            )}
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin inline" />
                {t('updating')}
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-1.5 inline" />
                {t('updateTranslation')}
              </>
            )}
          </button>
        )}
        
        {onEdit && (
          <button onClick={onEdit} className="...">
            <Edit className="w-4 h-4" />
            {t('edit')}
          </button>
        )}
      </div>
    </div>
  );
}

// Status badge component
function StatusBadge({ status, isStale }: { status: TranslationStatus; isStale: boolean }) {
  const t = useTranslations('translations.statusItem');
  
  if (isStale) {
    return (
      <span className="inline-flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400">
        <AlertTriangle className="w-3.5 h-3.5" />
        {t('stale')}
      </span>
    );
  }
  
  // ... existing status badge logic
}

// Stale warning icon with tooltip
function StaleWarningIcon() {
  const t = useTranslations('translations.statusItem');
  
  return (
    <div 
      className="p-1.5 rounded-full bg-amber-100 dark:bg-amber-900"
      title={t('staleTooltip')}
    >
      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
    </div>
  );
}
```

#### Visual Design Specifications
| Element | Normal State | Stale State |
|---------|--------------|-------------|
| Border | gray-200 (1px) | amber-400 (2px) |
| Background | white/transparent | amber-50 / amber-950/20 (dark) |
| Status Badge | Green checkmark (complete) / Blue clock (pending) | Amber warning icon + "Stale" text |
| Warning Icon | Not shown | Amber AlertTriangle in circular background |
| Action Button | "Edit" only | "Update Translation" (amber) + "Edit" |

#### Translation Keys Required
Add to `/messages/*.json` under `translations.statusItem` namespace:
```json
{
  "translations": {
    "statusItem": {
      "stale": "Outdated",
      "staleTooltip": "Source content has changed since this translation was last updated",
      "updateTranslation": "Update Translation",
      "updating": "Updating...",
      "edit": "Edit",
      "complete": "Complete",
      "pending": "Pending",
      "missing": "Missing",
      "manual": "Manual",
      "auto": "Auto"
    }
  }
}
```

| Locale | stale | updateTranslation | staleTooltip |
|--------|-------|-------------------|--------------|
| en | Outdated | Update Translation | Source content has changed since this translation was last updated |
| es | Desactualizada | Actualizar traducción | El contenido de origen ha cambiado desde la última actualización de esta traducción |
| fr | Obsolète | Mettre à jour la traduction | Le contenu source a changé depuis la dernière mise à jour de cette traduction |
| de | Veraltet | Übersetzung aktualisieren | Der Quellinhalt hat sich seit der letzten Aktualisierung dieser Übersetzung geändert |
| it | Obsoleta | Aggiorna traduzione | Il contenuto di origine è cambiato dall'ultimo aggiornamento di questa traduzione |
| nl | Verouderd | Vertaling bijwerken | De broninhoud is gewijzigd sinds deze vertaling voor het laatst is bijgewerkt |

#### Accessibility Requirements
- Warning icon includes descriptive `title` attribute or `aria-label`
- Stale state is announced to screen readers (not just color-based)
- "Update Translation" button has clear accessible name
- Color contrast meets WCAG AA standards for amber text
- Focus states are visible on all interactive elements

### Dependencies
- **REQ-E05-004**: source_version_at columns (database columns for stale detection)
- **REQ-E05-001**: Translation Status API (provides sourceVersionAt data)
- **REQ-E05-003**: Re-Translate API Endpoint (called by Update Translation action)
- **REQ-E05-022**: ManualEditWarningDialog (may be triggered from Update action)
- **Existing**: TranslationStatusItem component structure
- **Existing**: next-intl for translations
- **Existing**: Lucide React icons (AlertTriangle, RefreshCw, Loader2)
- **Existing**: cn utility and Tailwind CSS

### User Impact
Property owners gain immediate visual awareness of which translations are out of date. The yellow warning styling draws attention without being alarming, and the "Update Translation" action button provides a clear path to resolve the stale state. This helps owners maintain accurate, up-to-date translations across all languages.

### Business Value
Improves translation quality by proactively alerting owners to stale translations. Reduces support issues caused by outdated translations that no longer match source content. Encourages owners to maintain their translation coverage, improving international guest experiences. The clear visual indicator and action button reduce the cognitive load of translation management.

### Acceptance Criteria
- [ ] TranslationStatusItem component accepts `sourceVersionAt` prop (Date, string, or null)
- [ ] TranslationStatusItem component accepts `sourceUpdatedAt` prop (Date, string, or null)
- [ ] TranslationStatusItem component accepts `onUpdateTranslation` callback prop
- [ ] TranslationStatusItem component accepts `isUpdating` boolean prop
- [ ] `isTranslationStale()` utility function is created in `/src/lib/translation-utils.ts`
- [ ] Stale detection correctly compares sourceVersionAt with sourceUpdatedAt timestamps
- [ ] Manual translations show stale indicator when source content is newer
- [ ] Stale translations display yellow/amber border (border-amber-400)
- [ ] Stale translations display yellow/amber background tint (bg-amber-50)
- [ ] Stale translations show AlertTriangle warning icon in amber color
- [ ] Stale status badge displays "Outdated" text with warning icon
- [ ] Warning icon includes tooltip explaining why translation is stale
- [ ] "Update Translation" button is displayed for stale translations
- [ ] "Update Translation" button is styled with amber/yellow colors
- [ ] "Update Translation" button calls `onUpdateTranslation` when clicked
- [ ] "Update Translation" button shows loading spinner when `isUpdating` is true
- [ ] "Update Translation" button is disabled when `isUpdating` is true
- [ ] Non-stale translations display normally without warning styling
- [ ] Missing `sourceVersionAt` or `sourceUpdatedAt` does not cause stale indicator (graceful fallback)
- [ ] Translation keys are added to `/messages/en.json`
- [ ] Translation keys are added to all locale files (es, fr, de, it, nl)
- [ ] Dark mode styling is correct (amber-950/20 background, amber-400 text)
- [ ] Stale warning is accessible via screen readers (not just visual)
- [ ] Color contrast meets WCAG AA standards
- [ ] No TypeScript compilation errors
- [ ] No console errors or warnings during normal operation
- [ ] Component follows existing TranslationStatusItem patterns and styling

---

## REQ-E05-024: Integrate Manual Edit Warning into Content Save Flow

**Date**: 2026-01-22
**Type**: NEW FEATURE
**Size**: M
**Phase**: Phase 5 (Manual Edit Preservation), Task 5.3

### Summary
Property owners need automatic detection and warning when saving content changes that would affect manual translations. The ManualEditWarningDialog (REQ-E05-022) should be integrated into article and item save handlers to prevent accidental overwriting of manually edited translations.

### Current Behavior
When an owner saves changes to an article or item (title, description, content pieces, etc.), the save operation proceeds directly without checking for existing manual translations. If subsequent re-translation is triggered, manual edits may be overwritten silently without the owner's awareness or consent.

### Expected Behavior
Before saving content changes, the system should:
1. Check if the entity (item or article) has any manual translations (status='manual')
2. If manual translations exist, display the ManualEditWarningDialog before proceeding
3. The dialog presents three options:
   - **Keep manual edits**: Save source content changes, mark manual translations as stale (sourceVersionAt not updated)
   - **Re-translate all**: Save source content and queue re-translation, overwriting manual edits
   - **Cancel**: Abort the save operation entirely
4. Proceed with the appropriate action based on user selection
5. If no manual translations exist, save proceeds normally without interruption

### Technical Details

#### Files to Modify
- `/src/components/InstructionEditor/InstructionEditor.tsx` (article editing)
- `/src/components/ItemForm.tsx` (item editing)
- `/src/components/ItemEditForm/ItemEditForm.tsx` (if exists, item inline editing)
- `/src/components/ItemManager/components/shared/InlineEdit.tsx` (inline field editing)

#### New Utility/Hook
Create `/src/hooks/useManualEditCheck.ts`:
```typescript
'use client';

import { useState, useCallback } from 'react';

export interface ManualEditCheckOptions {
  /** Entity type being edited */
  entityType: 'item' | 'article';
  /** Entity ID (item_id or article_id) */
  entityId: string;
}

export interface ManualEditCheckResult {
  /** Whether manual translations exist */
  hasManualEdits: boolean;
  /** List of language codes with manual edits */
  manuallyEditedLanguages: string[];
  /** Whether the check is loading */
  isChecking: boolean;
  /** Any error from the check */
  error: Error | null;
}

export interface UseManualEditCheckReturn {
  /** Check for manual translations before save */
  checkForManualEdits: (options: ManualEditCheckOptions) => Promise<ManualEditCheckResult>;
  /** Whether a check is in progress */
  isChecking: boolean;
  /** Reset state */
  reset: () => void;
}

export function useManualEditCheck(): UseManualEditCheckReturn {
  const [isChecking, setIsChecking] = useState(false);

  const checkForManualEdits = useCallback(
    async ({ entityType, entityId }: ManualEditCheckOptions): Promise<ManualEditCheckResult> => {
      setIsChecking(true);
      try {
        const response = await fetch(
          `/api/translations/status?entityType=${entityType}&entityId=${entityId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch translation status');
        }

        const data = await response.json();

        // Extract languages with manual status
        const manuallyEditedLanguages = data.items
          ?.filter((item: { status: string }) => item.status === 'manual')
          .map((item: { language: string }) => item.language) ?? [];

        return {
          hasManualEdits: manuallyEditedLanguages.length > 0,
          manuallyEditedLanguages,
          isChecking: false,
          error: null,
        };
      } catch (error) {
        return {
          hasManualEdits: false,
          manuallyEditedLanguages: [],
          isChecking: false,
          error: error instanceof Error ? error : new Error('Unknown error'),
        };
      } finally {
        setIsChecking(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setIsChecking(false);
  }, []);

  return {
    checkForManualEdits,
    isChecking,
    reset,
  };
}
```

#### Integration Pattern for Save Handlers

```typescript
// Example integration in InstructionEditor.tsx

import { useState } from 'react';
import { ManualEditWarningDialog } from '@/components/TranslationManagement/ManualEditWarning';
import { useManualEditCheck } from '@/hooks/useManualEditCheck';

export function InstructionEditor({ articleData, onSave, onCancel, isSaving }: InstructionEditorProps) {
  // Existing state...

  // Manual edit warning state
  const [showManualEditWarning, setShowManualEditWarning] = useState(false);
  const [manuallyEditedLanguages, setManuallyEditedLanguages] = useState<string[]>([]);
  const [pendingPayload, setPendingPayload] = useState<UpdateArticlePayload | null>(null);

  const { checkForManualEdits, isChecking } = useManualEditCheck();

  // Updated save handler with manual edit check
  const handleSave = useCallback(async () => {
    const payload: UpdateArticlePayload = {
      title: articleTitle,
      links: content.map(c => ({
        id: c.isNew ? undefined : c.id,
        title: c.title,
        linkType: mapContentTypeToLinkType(c.type),
        url: c.url,
        thumbnailUrl: c.thumbnailUrl || undefined,
        displayOrder: c.displayOrder,
        file: c.file,
      })),
      itemTags: tagsChanged ? tags : undefined,
    };

    // Check for manual translations before saving
    const result = await checkForManualEdits({
      entityType: 'article',
      entityId: articleData.id,
    });

    if (result.hasManualEdits) {
      // Show warning dialog and store pending payload
      setManuallyEditedLanguages(result.manuallyEditedLanguages);
      setPendingPayload(payload);
      setShowManualEditWarning(true);
      return;
    }

    // No manual edits, proceed with save
    await onSave(payload);
  }, [articleTitle, content, tags, tagsChanged, onSave, checkForManualEdits, articleData.id]);

  // Handle keeping manual edits (save without re-translation)
  const handleKeepManualEdits = useCallback(async () => {
    if (pendingPayload) {
      await onSave({ ...pendingPayload, skipRetranslation: true });
    }
    setShowManualEditWarning(false);
    setPendingPayload(null);
  }, [pendingPayload, onSave]);

  // Handle overwriting manual edits (save with re-translation)
  const handleOverwriteManualEdits = useCallback(async () => {
    if (pendingPayload) {
      await onSave({ ...pendingPayload, forceRetranslation: true });
    }
    setShowManualEditWarning(false);
    setPendingPayload(null);
  }, [pendingPayload, onSave]);

  // Handle cancel from dialog
  const handleCancelWarning = useCallback(() => {
    setShowManualEditWarning(false);
    setPendingPayload(null);
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto p-6">
      {/* Existing content... */}

      {/* Manual Edit Warning Dialog */}
      <ManualEditWarningDialog
        isOpen={showManualEditWarning}
        manuallyEditedLanguages={manuallyEditedLanguages}
        onKeepManual={handleKeepManualEdits}
        onOverwrite={handleOverwriteManualEdits}
        onCancel={handleCancelWarning}
        loading={isSaving}
        entityType="article"
      />
    </div>
  );
}
```

#### API Changes Required

The save API endpoints need to accept optional flags:
- `skipRetranslation: boolean` - Save content without triggering re-translation
- `forceRetranslation: boolean` - Save content and queue re-translation for all languages

Update endpoint handlers:
- `PUT /api/items/[id]` - Accept skipRetranslation/forceRetranslation flags
- `PUT /api/articles/[id]` - Accept skipRetranslation/forceRetranslation flags

When `skipRetranslation` is true:
- Update source content normally
- Do NOT update `source_version_at` on existing translations (they become stale)
- Do NOT queue re-translation jobs

When `forceRetranslation` is true:
- Update source content
- Queue re-translation for all configured languages
- Existing manual translations will be overwritten

When neither flag is specified (default):
- Current behavior: update content and trigger translation if configured

#### Component Update Summary

| Component | Change Required |
|-----------|-----------------|
| InstructionEditor | Add useManualEditCheck hook, ManualEditWarningDialog, and save flow intercept |
| ItemForm | Add useManualEditCheck hook, ManualEditWarningDialog, and save flow intercept |
| ItemEditForm | Add useManualEditCheck hook, ManualEditWarningDialog if save updates translatable fields |
| InlineEdit | Consider showing warning for inline edits of translatable fields (title, description) |

#### Save Flow Decision Tree
```
User clicks "Save"
    |
    v
Check for manual translations
    |
    +-- No manual translations --> Proceed with normal save
    |
    +-- Has manual translations --> Show ManualEditWarningDialog
            |
            +-- User clicks "Keep manual edits"
            |       --> Save with skipRetranslation=true
            |       --> Manual translations become stale
            |
            +-- User clicks "Re-translate all"
            |       --> Save with forceRetranslation=true
            |       --> Queue re-translation, overwrite manual edits
            |
            +-- User clicks "Cancel"
                    --> Abort save, return to editing
```

### Dependencies
- **REQ-E05-001**: Translation Status API (for checking manual translation status)
- **REQ-E05-003**: Re-Translate API Endpoint (for queuing re-translation when overwriting)
- **REQ-E05-004**: source_version_at columns (for stale detection after skipping re-translation)
- **REQ-E05-022**: ManualEditWarningDialog Component (the warning dialog UI)
- **Existing**: InstructionEditor component (article editing)
- **Existing**: ItemForm component (item editing)

### User Impact
Property owners are protected from accidentally losing their carefully edited manual translations. When they update source content, they are presented with a clear choice about how to handle existing translations. This prevents frustration from lost work and gives owners confidence that their manual edits are valued and protected.

### Business Value
Reduces support tickets from owners who accidentally overwrote their translations. Builds trust in the translation management system by demonstrating respect for owner's manual work. Enables owners to confidently update their content without fear of losing translation investments. The explicit choice between keeping and overwriting ensures owners make informed decisions.

### Acceptance Criteria
- [ ] `useManualEditCheck` hook is created in `/src/hooks/useManualEditCheck.ts`
- [ ] Hook correctly fetches translation status from `/api/translations/status`
- [ ] Hook returns `hasManualEdits` boolean and `manuallyEditedLanguages` array
- [ ] Hook handles loading and error states gracefully
- [ ] InstructionEditor integrates `useManualEditCheck` hook
- [ ] InstructionEditor shows ManualEditWarningDialog when manual translations exist
- [ ] InstructionEditor save handler checks for manual edits before proceeding
- [ ] "Keep manual edits" option saves with `skipRetranslation: true` flag
- [ ] "Re-translate all" option saves with `forceRetranslation: true` flag
- [ ] "Cancel" option aborts the save and closes the dialog
- [ ] ItemForm integrates `useManualEditCheck` hook (if editing existing items with translations)
- [ ] API endpoints accept `skipRetranslation` and `forceRetranslation` flags
- [ ] When `skipRetranslation` is true, existing translations are not updated (become stale)
- [ ] When `forceRetranslation` is true, re-translation is queued for all languages
- [ ] Dialog displays correct list of affected languages
- [ ] Dialog shows appropriate loading state during save operation
- [ ] If no manual translations exist, save proceeds without showing dialog
- [ ] Error handling displays user-friendly message if translation check fails
- [ ] Save operation completes successfully with either option
- [ ] No TypeScript compilation errors
- [ ] No console errors or warnings during save flow
- [ ] Integration follows existing patterns in InstructionEditor and ItemForm

---

## REQ-E05-025: Create LanguagePreferenceSection Component

**Date**: 2026-01-22
**Type**: NEW FEATURE
**Size**: M
**Phase**: Phase 6 (Language Preference Setting), Task 6.1

### Summary
Property owners need a UI component to select and save their preferred language for content display and translation management. The LanguagePreferenceSection provides a dropdown selector for available languages, a save button with loading state, and contextual help text explaining the setting's purpose.

### Current Behavior
No dedicated UI exists for owners to set their language preference for translation management. Owners cannot specify which language they prefer as their primary content language, making it difficult to prioritize translations and manage content in multilingual environments.

### Expected Behavior
A self-contained section component that enables language preference configuration:
1. Displays a dropdown selector populated with all supported languages
2. Shows the currently selected/saved language preference
3. Provides a save button that triggers an API call to persist the preference
4. Displays loading state while save operation is in progress
5. Shows success/error feedback after save attempt
6. Includes help text explaining what the language preference affects

### Technical Details

#### File Location
`/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx`

#### Directory Structure
```
/src/components/TranslationManagement/
  LanguagePreference/
    LanguagePreferenceSection.tsx
    LanguagePreferenceSection.types.ts
    index.ts
```

#### Component Interface
```typescript
// LanguagePreferenceSection.types.ts
export interface LanguageOption {
  /** ISO language code (e.g., 'en', 'fr', 'de') */
  code: string;
  /** Display name (e.g., 'English', 'French', 'German') */
  name: string;
  /** Native name (e.g., 'English', 'Francais', 'Deutsch') */
  nativeName?: string;
}

export interface LanguagePreferenceSectionProps {
  /** Currently saved language preference code */
  currentLanguage: string | null;
  /** List of available languages to choose from */
  availableLanguages: LanguageOption[];
  /** Callback when preference is saved successfully */
  onSave: (languageCode: string) => Promise<void>;
  /** Optional: Disable interaction (e.g., during page load) */
  disabled?: boolean;
  /** Optional: Additional CSS classes */
  className?: string;
}

export interface LanguagePreferenceSectionState {
  /** Currently selected language in dropdown (may differ from saved) */
  selectedLanguage: string;
  /** Whether a save operation is in progress */
  isSaving: boolean;
  /** Error message if save failed */
  error: string | null;
  /** Success message after save */
  successMessage: string | null;
}
```

#### Component Implementation Pattern
```typescript
// LanguagePreferenceSection.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Globe, Check, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LanguagePreferenceSectionProps } from './LanguagePreferenceSection.types';

export function LanguagePreferenceSection({
  currentLanguage,
  availableLanguages,
  onSave,
  disabled = false,
  className,
}: LanguagePreferenceSectionProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    currentLanguage || availableLanguages[0]?.code || ''
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync selected language when currentLanguage prop changes
  useEffect(() => {
    if (currentLanguage) {
      setSelectedLanguage(currentLanguage);
    }
  }, [currentLanguage]);

  // Clear messages after timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleSave = useCallback(async () => {
    if (!selectedLanguage || isSaving || disabled) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await onSave(selectedLanguage);
      setSuccessMessage('Language preference saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preference');
    } finally {
      setIsSaving(false);
    }
  }, [selectedLanguage, isSaving, disabled, onSave]);

  const hasChanges = selectedLanguage !== currentLanguage;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <Globe className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-medium text-gray-900">Language Preference</h3>
      </div>

      {/* Help Text */}
      <p className="text-sm text-gray-600">
        Select your preferred language for viewing and managing content.
        This setting determines the default language displayed when viewing
        translations and which language is prioritized in translation workflows.
      </p>

      {/* Language Selector */}
      <div className="flex items-center gap-3">
        <select
          value={selectedLanguage}
          onChange={(e) => {
            setSelectedLanguage(e.target.value);
            setError(null);
            setSuccessMessage(null);
          }}
          disabled={disabled || isSaving}
          className={cn(
            'flex-1 max-w-xs px-3 py-2 border rounded-md',
            'text-gray-900 bg-white',
            'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent',
            'disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed'
          )}
          aria-label="Select language preference"
        >
          {availableLanguages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name} {lang.nativeName && lang.nativeName !== lang.name && `(${lang.nativeName})`}
            </option>
          ))}
        </select>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={disabled || isSaving || !hasChanges}
          className={cn(
            'px-4 py-2 rounded-md font-medium text-sm',
            'transition-colors duration-200',
            hasChanges && !disabled && !isSaving
              ? 'bg-[#FF385C] text-white hover:bg-[#E31C5F]'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          )}
          aria-label={isSaving ? 'Saving preference' : 'Save language preference'}
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </span>
          ) : (
            'Save'
          )}
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600" role="alert">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 text-sm text-green-600" role="status">
          <Check className="w-4 h-4" />
          {successMessage}
        </div>
      )}
    </div>
  );
}

export default LanguagePreferenceSection;
```

#### Index Export
```typescript
// index.ts
export { LanguagePreferenceSection } from './LanguagePreferenceSection';
export type {
  LanguagePreferenceSectionProps,
  LanguageOption,
  LanguagePreferenceSectionState,
} from './LanguagePreferenceSection.types';
```

#### Supported Languages Configuration
The available languages should be sourced from a central configuration or constant. Consider creating or using existing:
```typescript
// /src/constants/languages.ts or /src/lib/i18n/languages.ts
export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'French', nativeName: 'Francais' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'es', name: 'Spanish', nativeName: 'Espanol' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  // Add other supported languages
];
```

#### Usage Example
```typescript
// In a settings page or translation management page
import { LanguagePreferenceSection } from '@/components/TranslationManagement/LanguagePreference';
import { SUPPORTED_LANGUAGES } from '@/constants/languages';

function TranslationSettingsPage() {
  const { userPreference, updatePreference } = useUserPreferences();

  const handleSaveLanguage = async (languageCode: string) => {
    await fetch('/api/user/preferences', {
      method: 'PATCH',
      body: JSON.stringify({ languagePreference: languageCode }),
    });
    // Refresh preference state
    updatePreference('language', languageCode);
  };

  return (
    <div className="p-6">
      <LanguagePreferenceSection
        currentLanguage={userPreference.language}
        availableLanguages={SUPPORTED_LANGUAGES}
        onSave={handleSaveLanguage}
      />
    </div>
  );
}
```

### Dependencies
- **UI Library**: Uses existing Tailwind CSS utility classes via `cn()` from `@/lib/utils`
- **Icons**: Lucide React icons (Globe, Check, AlertCircle, Loader2)
- **API Endpoint**: Requires an endpoint to persist user language preference (e.g., `PATCH /api/user/preferences`)
- **Languages Config**: Requires a list of supported languages (existing or new)

### User Impact
Property owners can explicitly set their preferred language for the translation management interface. This improves the user experience by:
- Displaying content in their preferred language by default
- Prioritizing translations in their language in translation status views
- Ensuring consistent language experience across the translation management features

### Business Value
Enables personalization of the translation management experience, improving owner satisfaction and engagement. Owners who can work in their preferred language are more likely to effectively manage translations, resulting in better multilingual content quality and improved guest experiences.

### Acceptance Criteria
- [ ] Component file created at `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx`
- [ ] Types file created at `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.types.ts`
- [ ] Index file exports component and types
- [ ] Dropdown displays all available languages from `availableLanguages` prop
- [ ] Currently saved language is pre-selected in dropdown
- [ ] Changing dropdown selection does NOT auto-save (requires clicking Save)
- [ ] Save button is disabled when no changes have been made
- [ ] Save button is disabled during save operation
- [ ] Loading spinner appears in Save button during save operation
- [ ] Success message displays for 3 seconds after successful save
- [ ] Error message displays when save fails
- [ ] Help text explains the purpose of the language preference setting
- [ ] Component respects `disabled` prop (all interactions disabled)
- [ ] Component uses consistent styling with other sections (Tailwind, brand colors)
- [ ] Component is accessible (proper aria labels, keyboard navigation)
- [ ] No TypeScript compilation errors
- [ ] No ESLint warnings
- [ ] Component handles edge case of empty `availableLanguages` array gracefully
- [ ] Component handles null `currentLanguage` prop (new users without preference)

---

## REQ-E05-026: Create Account Preference API Endpoint

**Date**: 2026-01-22
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners need an API endpoint to update their account preferences, specifically the preferred language setting for translation management. This endpoint enables programmatic updating of account-level preferences with proper access validation.

### Current Behavior
No dedicated API endpoint exists to update account preferences such as `preferredLanguage`. The accounts table has a `settings` JSONB column that can store preferences, but there is no endpoint to safely update these settings with proper authentication and authorization checks.

### Expected Behavior
A PUT endpoint at `/api/accounts/[accountId]/preferences` that:
- Accepts preference updates including `preferredLanguage` in the request body
- Validates that the authenticated user has access to the specified account
- Updates the account's `settings` JSONB column with the new preferences
- Merges new preferences with existing settings (preserves unspecified settings)
- Returns the updated account preferences on success
- Returns appropriate error responses for authentication, authorization, and validation failures

### Technical Details

#### File Location
`/src/app/api/accounts/[accountId]/preferences/route.ts`

#### API Specification
- **Method**: PUT
- **Path**: `/api/accounts/[accountId]/preferences`
- **Authentication**: Required (Supabase Auth)
- **Authorization**: User must be a member of the account (via `account_users` table)

#### Request Body Schema
```typescript
interface AccountPreferencesRequest {
  /** ISO 639-1 language code (e.g., 'en', 'fr', 'de') */
  preferredLanguage?: string;
  // Future preferences can be added here
}
```

#### Response Schema
```typescript
// Success (HTTP 200)
interface AccountPreferencesResponse {
  success: true;
  data: {
    accountId: string;
    preferences: {
      preferredLanguage: string | null;
      // Other preferences
    };
    updatedAt: string;
  };
}

// Error responses
interface ErrorResponse {
  success: false;
  error: string;
}
```

#### Implementation Pattern
```typescript
// /src/app/api/accounts/[accountId]/preferences/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/supabase';

// Supported language codes (must match database check constraint)
const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'];

// Helper function to validate user has access to account
async function validateAccountAccess(
  supabase: ReturnType<typeof createRouteHandlerClient>,
  userId: string,
  accountId: string
): Promise<boolean> {
  const { data: membership, error } = await supabase
    .from('account_users')
    .select('role')
    .eq('account_id', accountId)
    .eq('user_id', userId)
    .single();

  return !error && !!membership;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { accountId } = await params;

    // Validate authentication
    const { data: authResult, error: authError } = await supabase.auth.getUser();
    if (authError || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authResult.user.id;

    // Validate account access
    const hasAccess = await validateAccountAccess(supabase, userId, accountId);
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Access denied to this account' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { preferredLanguage } = body;

    // Validate preferredLanguage if provided
    if (preferredLanguage !== undefined) {
      if (typeof preferredLanguage !== 'string') {
        return NextResponse.json(
          { success: false, error: 'preferredLanguage must be a string' },
          { status: 400 }
        );
      }
      if (!SUPPORTED_LANGUAGES.includes(preferredLanguage)) {
        return NextResponse.json(
          { success: false, error: `preferredLanguage must be one of: ${SUPPORTED_LANGUAGES.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Get current account settings
    const { data: currentAccount, error: fetchError } = await supabase
      .from('accounts')
      .select('settings')
      .eq('id', accountId)
      .single();

    if (fetchError || !currentAccount) {
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      );
    }

    // Merge new preferences with existing settings
    const currentSettings = (currentAccount.settings as Record<string, unknown>) || {};
    const updatedSettings = {
      ...currentSettings,
      ...(preferredLanguage !== undefined && { preferredLanguage }),
    };

    // Update account settings
    const { data: updatedAccount, error: updateError } = await supabase
      .from('accounts')
      .update({
        settings: updatedSettings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', accountId)
      .select('id, settings, updated_at')
      .single();

    if (updateError || !updatedAccount) {
      console.error('Error updating account preferences:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        accountId: updatedAccount.id,
        preferences: {
          preferredLanguage: (updatedAccount.settings as Record<string, unknown>)?.preferredLanguage || null,
        },
        updatedAt: updatedAccount.updated_at,
      },
    });

  } catch (error) {
    console.error('Error in PUT /api/accounts/[accountId]/preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to retrieve current preferences
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { accountId } = await params;

    // Validate authentication
    const { data: authResult, error: authError } = await supabase.auth.getUser();
    if (authError || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authResult.user.id;

    // Validate account access
    const hasAccess = await validateAccountAccess(supabase, userId, accountId);
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Access denied to this account' },
        { status: 403 }
      );
    }

    // Fetch account preferences
    const { data: account, error: fetchError } = await supabase
      .from('accounts')
      .select('id, settings, updated_at')
      .eq('id', accountId)
      .single();

    if (fetchError || !account) {
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        accountId: account.id,
        preferences: {
          preferredLanguage: (account.settings as Record<string, unknown>)?.preferredLanguage || null,
        },
        updatedAt: account.updated_at,
      },
    });

  } catch (error) {
    console.error('Error in GET /api/accounts/[accountId]/preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### Directory Structure
```
/src/app/api/accounts/
  [accountId]/
    preferences/
      route.ts    <- New file
```

#### Database Considerations
- Uses existing `accounts.settings` JSONB column to store preferences
- No database migration required
- Preferences are stored as: `{ "preferredLanguage": "fr", ... }`
- Merges with existing settings to preserve other preferences

### Dependencies
- **Authentication**: Supabase Auth via `createRouteHandlerClient`
- **Database**: Access to `accounts` and `account_users` tables
- **Types**: May need to extend `Account` type to include typed `settings.preferredLanguage`

### User Impact
Property owners can programmatically set their language preference for translation management through a secure API. This preference is used by the LanguagePreferenceSection component (REQ-E05-025) and other translation management features to display and prioritize content in the owner's preferred language.

### Business Value
Enables personalization of the translation management experience at the account level. Owners working in different languages can configure their preferences once, improving workflow efficiency and user satisfaction. This endpoint is essential for the LanguagePreferenceSection component to function properly.

### Acceptance Criteria
- [ ] PUT endpoint created at `/api/accounts/[accountId]/preferences/route.ts`
- [ ] Unauthenticated requests return HTTP 401
- [ ] Requests for accounts the user doesn't belong to return HTTP 403
- [ ] Invalid `preferredLanguage` values (not in supported languages) return HTTP 400
- [ ] Non-existent account IDs return HTTP 404
- [ ] Valid PUT request updates `settings.preferredLanguage` in the accounts table
- [ ] Existing settings fields are preserved when updating preferences (merge, not replace)
- [ ] Response includes accountId, preferences object, and updatedAt timestamp
- [ ] GET endpoint returns current preferences for the account
- [ ] Language validation uses the same supported languages list as database constraints
- [ ] No TypeScript compilation errors
- [ ] No ESLint warnings
- [ ] API follows existing route patterns in the codebase (consistent error handling, response format)

---

## REQ-E05-027: Integrate Language Preference into Account Settings

**Date**: 2026-01-22
**Type**: NEW FEATURE
**Size**: M
**Phase**: Phase 6 (Language Preference Setting), Task 6.3

### Summary
Property owners need the LanguagePreferenceSection component integrated into their account settings interface, allowing them to view and update their language preference directly from a centralized settings location. The setting should be pre-populated with the user's current preference and persist changes through the Account Preference API.

### Current Behavior
The LanguagePreferenceSection component (REQ-E05-025) exists as a standalone component, and the Account Preference API endpoint (REQ-E05-026) provides backend support, but there is no dedicated account settings page where users can access and modify their language preference. Users have no centralized location to manage their account-level settings including language preferences.

### Expected Behavior
A new Account Settings page or section is created that:
1. Determines the optimal location for account settings (dedicated settings page vs. dashboard profile section)
2. Integrates the LanguagePreferenceSection component
3. Pre-populates the language selector with the user's current saved preference fetched from the API
4. Saves preference changes via the Account Preference API (PUT /api/accounts/[accountId]/preferences)
5. Provides navigation access from the dashboard header or navigation menu
6. Supports future extension with additional account settings sections

### Technical Details

#### Location Decision
Based on analysis of the current dashboard structure (`/dashboard2`), the recommended approach is:
- **Option A (Recommended)**: Create new Account Settings page at `/dashboard2/settings`
- **Option B**: Add settings to an existing profile dropdown menu in the header

Given that the current header only has logout functionality and no profile/settings dropdown exists, Option A is recommended for better organization and future extensibility.

#### File Locations
```
/src/app/dashboard2/settings/
  page.tsx                    <- Main settings page
  layout.tsx                  <- Optional settings layout
  
/src/components/AccountSettings/
  AccountSettingsPage.tsx     <- Main settings page component
  AccountSettingsPage.types.ts
  index.ts
```

#### Component Interface
```typescript
// AccountSettingsPage.types.ts
import type { LanguageOption } from '@/components/TranslationManagement/LanguagePreference';

export interface AccountSettingsPageProps {
  /** Account ID for the current user */
  accountId: string;
  /** Initial language preference loaded from API */
  initialLanguagePreference: string | null;
  /** Available languages for selection */
  availableLanguages: LanguageOption[];
}

export interface AccountPreferences {
  preferredLanguage: string | null;
}
```

#### Page Implementation Pattern
```typescript
// /src/app/dashboard2/settings/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { Loader2, Settings } from 'lucide-react';
import { LanguagePreferenceSection } from '@/components/TranslationManagement/LanguagePreference';

// Supported languages - should be imported from a shared config
const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
];

export default function AccountSettingsPage() {
  const { user, accountId } = useAuth();
  const t = useTranslations('settings');
  const [currentLanguage, setCurrentLanguage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current preferences on mount
  useEffect(() => {
    async function fetchPreferences() {
      if (!accountId) return;
      
      try {
        const response = await fetch(`/api/accounts/${accountId}/preferences`);
        if (!response.ok) {
          throw new Error('Failed to fetch preferences');
        }
        const data = await response.json();
        if (data.success) {
          setCurrentLanguage(data.data.preferences.preferredLanguage);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load preferences');
      } finally {
        setLoading(false);
      }
    }

    fetchPreferences();
  }, [accountId]);

  // Handle save preference
  const handleSaveLanguagePreference = async (languageCode: string) => {
    if (!accountId) {
      throw new Error('No account ID available');
    }

    const response = await fetch(`/api/accounts/${accountId}/preferences`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferredLanguage: languageCode }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to save preference');
    }

    const data = await response.json();
    if (data.success) {
      setCurrentLanguage(data.data.preferences.preferredLanguage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF385C]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-6 h-6 text-gray-700" />
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        </div>
        <p className="text-gray-600">{t('description')}</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-8">
        {/* Language Preference Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <LanguagePreferenceSection
            currentLanguage={currentLanguage}
            availableLanguages={AVAILABLE_LANGUAGES}
            onSave={handleSaveLanguagePreference}
          />
        </div>

        {/* Future settings sections can be added here */}
        {/* Example: Notification Settings, Display Settings, etc. */}
      </div>
    </div>
  );
}
```

#### Navigation Integration
Add a Settings link to the dashboard navigation or header:

```typescript
// In Dashboard2LayoutClient.tsx - add to header or navigation
// Option 1: Add Settings icon button next to Logout in header
<Link
  href="/dashboard2/settings"
  className="text-gray-600 hover:text-gray-800 p-1.5 rounded-md hover:bg-gray-50"
  aria-label={t('header.settingsAriaLabel')}
>
  <Settings className="w-4 h-4" />
</Link>

// Option 2: Add to navigation items array
{
  name: t('nav.settings'),
  mobileLabel: t('nav.mobile.settings'),
  href: '/dashboard2/settings',
  icon: Settings,
}
```

#### Translation Keys
Add to `/messages/{locale}.json`:
```json
{
  "settings": {
    "title": "Account Settings",
    "description": "Manage your account preferences and settings.",
    "sections": {
      "language": {
        "title": "Language Preference",
        "description": "Select your preferred language for content display."
      }
    }
  },
  "dashboard": {
    "nav": {
      "settings": "Settings",
      "mobile": {
        "settings": "Settings"
      }
    },
    "header": {
      "settingsAriaLabel": "Account settings"
    }
  }
}
```

#### AuthContext Extension
The AuthContext may need to expose `accountId` for the settings page:
```typescript
// In AuthContext - ensure accountId is available
interface AuthContextValue {
  user: User | null;
  accountId: string | null;  // Add if not present
  // ... other fields
}
```

### Dependencies
- **REQ-E05-025**: LanguagePreferenceSection component must be implemented
- **REQ-E05-026**: Account Preference API endpoint must be implemented
- **AuthContext**: Must provide accountId for API calls
- **next-intl**: For translation support

### User Impact
Property owners gain a centralized location to manage their account settings, starting with language preference. The pre-populated preference ensures users see their current setting immediately, and the save functionality persists their choice. This improves user experience by providing clear access to personalization options.

### Business Value
Establishes a settings infrastructure that can grow with the product. Starting with language preference creates a foundation for future settings additions (notification preferences, display options, etc.). Improves user satisfaction by respecting their language preferences throughout the translation management experience.

### Acceptance Criteria
- [ ] Account Settings page created at `/dashboard2/settings`
- [ ] Page includes LanguagePreferenceSection component
- [ ] Current language preference is fetched from API on page load
- [ ] Language selector pre-populated with user's current preference
- [ ] Saving a new preference calls PUT /api/accounts/[accountId]/preferences
- [ ] Success/error feedback displays correctly after save attempt
- [ ] Loading state displays while fetching initial preferences
- [ ] Navigation link to Settings page added to dashboard (header or nav menu)
- [ ] Translation keys added for settings page text in all supported locales (en, fr, es, de, nl, it)
- [ ] Page is protected by authentication (redirects to login if not authenticated)
- [ ] AuthContext provides accountId needed for API calls
- [ ] No TypeScript compilation errors
- [ ] No ESLint warnings
- [ ] Page follows existing dashboard styling patterns
- [ ] Mobile-responsive layout maintained

---

## REQ-E05-028: Integrate Preview Panel into Article Editor

**Date**: 2026-01-22 23:45
**Type**: ENHANCEMENT
**Size**: M
**Phase**: Phase 7 (Integration & Polish), Task 7.1

### Summary
Property owners need the TranslationPreviewPanel component integrated into the article editor page, allowing them to view and manage translations for their article content directly from the editing interface. The panel should automatically show after saving changes and auto-open when there are pending translations that need attention.

### Current Behavior
The article editor page (`/dashboard2/instructions/[articleId]/edit`) provides editing functionality for articles but has no integration with the Translation Management system. After saving an article, owners must navigate to a separate Translation Management page to view or manage translations. There is no indication of pending translations or translation status within the editor context.

### Expected Behavior
The article editor page integrates the TranslationPreviewPanel component to provide a seamless translation management experience:
1. A "Translations" button is visible in the editor interface (in the header or action bar)
2. Clicking the button opens the TranslationPreviewPanel for the current article
3. After successful save, the panel automatically opens if the article has translations
4. If translations are in "pending" status, the panel auto-opens to show progress
5. If translations are "stale" (source content changed), the panel auto-opens with a visual indicator
6. The panel displays translation status for all 6 supported languages
7. Edit, re-translate, and retry actions are available from within the panel
8. The panel closes when the user clicks outside, presses ESC, or clicks the close button
9. Translation status refreshes automatically while the panel is open

### Technical Details

#### File to Modify
- `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`

#### New Dependencies to Import
```typescript
import { TranslationPreviewPanel } from '@/components/TranslationManagement/TranslationPreviewPanel';
import { useTranslationStatus } from '@/hooks/useTranslationStatus';
import type { EntityStatusSummary } from '@/app/api/translations/status/batch/types';
```

#### State Additions
```typescript
// Translation panel state
const [isPanelOpen, setIsPanelOpen] = useState(false);
const [translationStatus, setTranslationStatus] = useState<EntityStatusSummary | null>(null);
const [shouldAutoOpenPanel, setShouldAutoOpenPanel] = useState(false);

// Use the translation status hook for the current article
const { status, isLoading: statusLoading, refetch: refetchStatus } = useTranslationStatus({
  entityType: 'article',
  entityId: articleId,
  enabled: !!articleId && !loading,
});
```

#### Auto-Open Logic
The panel should auto-open in these scenarios:

```typescript
// After successful save, check if panel should auto-open
useEffect(() => {
  if (shouldAutoOpenPanel && status) {
    // Auto-open if:
    // 1. There are pending translations
    // 2. There are stale translations
    // 3. There are failed translations
    const shouldOpen =
      status.pendingCount && status.pendingCount > 0 ||
      status.status === 'pending' ||
      status.status === 'has_failures' ||
      status.failedCount && status.failedCount > 0;

    if (shouldOpen) {
      setIsPanelOpen(true);
    }
    setShouldAutoOpenPanel(false);
  }
}, [shouldAutoOpenPanel, status]);

// In handleSave, after successful save:
// Set flag to check for auto-open after status refreshes
refetchStatus();
setShouldAutoOpenPanel(true);
```

#### UI Integration Points

1. **Header Button**: Add a "Translations" button to the InstructionEditor header area
```typescript
// In the editor header/toolbar area
<Button
  variant="outline"
  size="sm"
  onClick={() => setIsPanelOpen(true)}
  className="flex items-center gap-2"
>
  <Globe className="w-4 h-4" />
  <span>{t('editor.translations')}</span>
  {status?.pendingCount && status.pendingCount > 0 && (
    <Badge variant="secondary" className="ml-1">
      {status.pendingCount}
    </Badge>
  )}
</Button>
```

2. **Status Indicator**: Show translation status badge in the header
```typescript
// Visual indicator of translation status
{status && (
  <TranslationStatusBadge
    status={status.status}
    completionPercentage={status.completionPercentage}
  />
)}
```

3. **Panel Integration**: Add the panel component at the page level
```typescript
// At the end of the return statement, before closing fragment
<TranslationPreviewPanel
  entityId={articleId}
  entityType="article"
  isOpen={isPanelOpen}
  onClose={() => setIsPanelOpen(false)}
  onEdit={(language) => {
    // Navigate to translation edit for this language
    router.push(`/dashboard2/translations/article/${articleId}/${language}/edit`);
  }}
  onRetranslate={async (language) => {
    // Trigger re-translation via API
    await fetch('/api/translations/retry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityType: 'article',
        entityId: articleId,
        languages: [language],
      }),
    });
    refetchStatus();
  }}
  onRetry={async (language) => {
    // Retry failed translation
    await fetch('/api/translations/retry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityType: 'article',
        entityId: articleId,
        languages: [language],
      }),
    });
    refetchStatus();
  }}
/>
```

#### Modified handleSave Function
```typescript
const handleSave = useCallback(async (payload: UpdateArticlePayload) => {
  // ... existing save logic ...

  try {
    // ... existing API call ...

    if (!response.success) {
      throw new Error(response.error || 'Failed to update article');
    }

    console.log('Article updated successfully:', response.data);

    // NEW: Trigger translation status refresh and auto-open check
    refetchStatus();
    setShouldAutoOpenPanel(true);

    // Set success flag for list page
    sessionStorage.setItem('editSuccess', 'true');

    // Option A: Stay on page and show panel (recommended for translation workflow)
    // setIsPanelOpen(true);

    // Option B: Redirect to list page (current behavior)
    // Only redirect if panel is not auto-opening
    // router.push('/dashboard2/instructions');

  } catch (error) {
    // ... existing error handling ...
  }
}, [articleId, articleData, currentAccount, router, refetchStatus]);
```

#### InstructionEditor Component Modifications
The InstructionEditor component may need props to accept the translation button and panel:

```typescript
// Option 1: Pass as children/render props
interface InstructionEditorProps {
  // ... existing props ...
  headerActions?: React.ReactNode;
}

// Option 2: Pass specific translation props
interface InstructionEditorProps {
  // ... existing props ...
  translationStatus?: EntityStatusSummary;
  onOpenTranslations?: () => void;
}
```

Alternatively, the translation button and panel can be rendered at the page level, wrapping or adjacent to the InstructionEditor.

#### Translation Keys
Add to `/messages/{locale}.json`:
```json
{
  "editor": {
    "translations": "Translations",
    "translationsTooltip": "View and manage translations for this article",
    "pendingTranslations": "{count, plural, one {# translation pending} other {# translations pending}}",
    "staleTranslations": "Some translations may be outdated",
    "translationPanel": {
      "title": "Article Translations",
      "autoOpenMessage": "Translations are being processed"
    }
  }
}
```

### Dependencies
- **REQ-E05-007**: TranslationPreviewPanel component must be implemented
- **REQ-E05-011**: useTranslationStatus hook must be implemented
- **REQ-E05-001**: Translation Status API endpoint must be functional
- **REQ-E05-003**: Re-Translate API endpoint must be functional
- **REQ-E05-006**: TranslationManagement types file must exist
- **Existing**: Article edit page at `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`
- **Existing**: InstructionEditor component

### User Impact
Property owners can now manage translations directly from the article editing experience without navigating to a separate page. The auto-open feature ensures owners are immediately aware of pending translations after saving, improving the translation workflow efficiency. This integration provides a more cohesive and streamlined content management experience.

### Business Value
Integrating translation management into the editor reduces context switching and cognitive load for property owners. The auto-open feature increases visibility into translation status, ensuring owners are aware of translation progress and can take action on failures promptly. This improves content quality and reduces the time-to-publish for multilingual content.

### Acceptance Criteria
- [ ] "Translations" button is visible in the article editor interface
- [ ] Clicking "Translations" button opens the TranslationPreviewPanel
- [ ] Panel displays article ID and type correctly as "article"
- [ ] Panel shows translation status for all 6 supported languages (es, fr, de, it, nl, pt)
- [ ] After successful save, translation status is refetched
- [ ] Panel auto-opens after save if article has pending translations (pendingCount > 0)
- [ ] Panel auto-opens after save if article has failed translations (failedCount > 0)
- [ ] Panel auto-opens after save if status is 'pending' or 'has_failures'
- [ ] Auto-open only triggers once per save operation (not on every status refresh)
- [ ] Translation status badge shows pending count next to the Translations button
- [ ] Clicking Edit action in panel navigates to translation edit page for the specific language
- [ ] Clicking Re-translate action triggers re-translation API and refreshes status
- [ ] Clicking Retry action for failed translations triggers retry API and refreshes status
- [ ] Panel closes when clicking the close button
- [ ] Panel closes when pressing ESC key
- [ ] Panel closes when clicking outside (if overlay mode is enabled)
- [ ] `onClose` callback properly updates state to close panel
- [ ] Translation status refreshes periodically while panel is open (if implemented in hook)
- [ ] Loading state is handled gracefully while fetching translation status
- [ ] Error state is handled if translation status fetch fails
- [ ] Page continues to function normally if translation status API is unavailable
- [ ] Translation keys added for all new UI text in all supported locales (en, fr, es, de, nl, it)
- [ ] Page layout remains responsive with the panel integration
- [ ] No TypeScript compilation errors
- [ ] No ESLint warnings
- [ ] Existing edit functionality is preserved and unaffected
- [ ] Existing tests continue to pass

---

## REQ-E05-029: Integrate Preview Panel into Item Editor

**Date**: 2026-01-22 23:50
**Type**: ENHANCEMENT
**Size**: M
**Phase**: Phase 7 (Integration & Polish), Task 7.2

### Summary
Property owners need the TranslationPreviewPanel component integrated into the item editor page, allowing them to view and manage translations for their item content directly from the editing interface. The panel should automatically show after saving changes and auto-open when there are pending translations that need attention, following the same pattern as the article editor (REQ-E05-028).

### Current Behavior
The item editor page (`/dashboard2/items/[publicId]/edit`) provides editing functionality for items (name, description, room, type, tags) but has no integration with the Translation Management system. After saving an item, owners must navigate to a separate Translation Management page to view or manage translations. There is no indication of pending translations or translation status within the editor context.

### Expected Behavior
The item editor page integrates the TranslationPreviewPanel component to provide a seamless translation management experience:
1. A "Translations" button is visible in the editor interface (in the header or action bar)
2. Clicking the button opens the TranslationPreviewPanel for the current item
3. After successful save, the panel automatically opens if the item has translations
4. If translations are in "pending" status, the panel auto-opens to show progress
5. If translations are "stale" (source content changed), the panel auto-opens with a visual indicator
6. The panel displays translation status for all 6 supported languages
7. Edit, re-translate, and retry actions are available from within the panel
8. The panel closes when the user clicks outside, presses ESC, or clicks the close button
9. Translation status refreshes automatically while the panel is open

### Technical Details

#### File to Modify
- `/src/app/dashboard2/items/[publicId]/edit/page.tsx`

#### New Dependencies to Import
```typescript
import { TranslationPreviewPanel } from '@/components/TranslationManagement/TranslationPreviewPanel';
import { useTranslationStatus } from '@/hooks/useTranslationStatus';
import type { EntityStatusSummary } from '@/app/api/translations/status/batch/types';
import { Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
```

#### State Additions
```typescript
// Translation panel state
const [isPanelOpen, setIsPanelOpen] = useState(false);
const [translationStatus, setTranslationStatus] = useState<EntityStatusSummary | null>(null);
const [shouldAutoOpenPanel, setShouldAutoOpenPanel] = useState(false);

// Use the translation status hook for the current item
const { status, isLoading: statusLoading, refetch: refetchStatus } = useTranslationStatus({
  entityType: 'item',
  entityId: publicId,
  enabled: !!publicId && !loading,
});
```

#### Auto-Open Logic
The panel should auto-open in these scenarios:

```typescript
// After successful save, check if panel should auto-open
useEffect(() => {
  if (shouldAutoOpenPanel && status) {
    // Auto-open if:
    // 1. There are pending translations
    // 2. There are stale translations
    // 3. There are failed translations
    const shouldOpen =
      status.pendingCount && status.pendingCount > 0 ||
      status.status === 'pending' ||
      status.status === 'has_failures' ||
      status.failedCount && status.failedCount > 0;

    if (shouldOpen) {
      setIsPanelOpen(true);
    }
    setShouldAutoOpenPanel(false);
  }
}, [shouldAutoOpenPanel, status]);

// In handleSave, after successful save:
// Set flag to check for auto-open after status refreshes
refetchStatus();
setShouldAutoOpenPanel(true);
```

#### UI Integration Points

1. **Header Section**: Add a "Translations" button to the page header area (next to the Save button)
```typescript
// In the header section with the Save button
<div className="flex items-center gap-2">
  <Button
    variant="outline"
    size="sm"
    onClick={() => setIsPanelOpen(true)}
    className="flex items-center gap-2"
    disabled={!publicId}
  >
    <Globe className="w-4 h-4" />
    <span>{t('translations')}</span>
    {status?.pendingCount && status.pendingCount > 0 && (
      <Badge variant="secondary" className="ml-1">
        {status.pendingCount}
      </Badge>
    )}
  </Button>

  <Button
    onClick={handleSave}
    disabled={saving}
    className="flex items-center gap-2"
  >
    {saving ? (
      <>
        <Loader2 className="w-4 h-4 animate-spin" />
        {t('saving')}
      </>
    ) : (
      <>
        <Save className="w-4 h-4" />
        {t('save')}
      </>
    )}
  </Button>
</div>
```

2. **Status Indicator** (Optional): Show translation status badge in the header
```typescript
// Visual indicator of translation status (optional enhancement)
{status && status.status !== 'none' && (
  <div className="text-sm text-muted-foreground">
    {t('translationStatus', {
      completed: status.completedCount,
      total: status.totalLanguages
    })}
  </div>
)}
```

3. **Panel Integration**: Add the panel component at the page level
```typescript
// At the end of the return statement, before closing fragment
<TranslationPreviewPanel
  entityId={publicId}
  entityType="item"
  isOpen={isPanelOpen}
  onClose={() => setIsPanelOpen(false)}
  onEdit={(language) => {
    // Navigate to translation edit for this language
    router.push(`/dashboard2/translations/item/${publicId}/${language}/edit`);
  }}
  onRetranslate={async (language) => {
    // Trigger re-translation via API
    await fetch('/api/translations/retry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityType: 'item',
        entityId: publicId,
        languages: [language],
      }),
    });
    refetchStatus();
  }}
  onRetry={async (language) => {
    // Retry failed translation
    await fetch('/api/translations/retry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityType: 'item',
        entityId: publicId,
        languages: [language],
      }),
    });
    refetchStatus();
  }}
/>
```

#### Modified handleSave Function
```typescript
const handleSave = async () => {
  if (!user || !publicId || !item) return;

  setSaving(true);
  setError(null);

  try {
    // ... existing validation and save logic ...

    const response = await adminApi.updateItem(publicId, payload, headers);

    if (response.success) {
      console.log('Item updated successfully:', response.data);

      // NEW: Trigger translation status refresh and auto-open check
      refetchStatus();
      setShouldAutoOpenPanel(true);

      // Set success flag for navigation
      sessionStorage.setItem('editSuccess', 'true');

      // Option A: Stay on page and show panel (recommended for translation workflow)
      // The auto-open logic will handle opening the panel if needed

      // Option B: Redirect to list page after short delay (current behavior)
      // Only redirect if panel is not auto-opening - check status first
      setTimeout(() => {
        if (!isPanelOpen) {
          router.push('/dashboard2/items');
        }
      }, 1000);

    } else {
      throw new Error(response.error || 'Failed to update item');
    }
  } catch (err) {
    // ... existing error handling ...
  } finally {
    setSaving(false);
  }
};
```

#### Layout Considerations
Since the item edit page has a simpler layout than the article editor (no InstructionEditor component), the Translations button should be added directly to the page header area, positioned near the Save button. The layout should accommodate both buttons without crowding:

```typescript
// Suggested header layout structure
<div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-4">
    <Link href="/dashboard2/items">
      <Button variant="ghost" size="sm">
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t('backToList')}
      </Button>
    </Link>
    <h1 className="text-2xl font-bold">{t('title')}</h1>
  </div>

  <div className="flex items-center gap-2">
    {/* Translation button */}
    <Button variant="outline" size="sm" onClick={() => setIsPanelOpen(true)}>
      <Globe className="w-4 h-4 mr-2" />
      {t('translations')}
      {status?.pendingCount && status.pendingCount > 0 && (
        <Badge variant="secondary" className="ml-1">
          {status.pendingCount}
        </Badge>
      )}
    </Button>

    {/* Save button */}
    <Button onClick={handleSave} disabled={saving}>
      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
      {saving ? t('saving') : t('save')}
    </Button>
  </div>
</div>
```

#### Translation Keys
Add to `/messages/{locale}.json` under the `items.edit` namespace:
```json
{
  "items": {
    "edit": {
      "translations": "Translations",
      "translationsTooltip": "View and manage translations for this item",
      "pendingTranslations": "{count, plural, one {# translation pending} other {# translations pending}}",
      "staleTranslations": "Some translations may be outdated",
      "translationStatus": "{completed} of {total} languages translated",
      "translationPanel": {
        "title": "Item Translations",
        "autoOpenMessage": "Translations are being processed"
      }
    }
  }
}
```

### Dependencies
- **REQ-E05-007**: TranslationPreviewPanel component must be implemented
- **REQ-E05-011**: useTranslationStatus hook must be implemented
- **REQ-E05-001**: Translation Status API endpoint must be functional
- **REQ-E05-003**: Re-Translate API endpoint must be functional
- **REQ-E05-006**: TranslationManagement types file must exist
- **REQ-E05-028**: Article editor integration (reference pattern to follow)
- **Existing**: Item edit page at `/src/app/dashboard2/items/[publicId]/edit/page.tsx`

### User Impact
Property owners can now manage translations directly from the item editing experience without navigating to a separate page. The auto-open feature ensures owners are immediately aware of pending translations after saving, improving the translation workflow efficiency. This integration provides a more cohesive and streamlined content management experience across both items and articles.

### Business Value
Integrating translation management into the item editor reduces context switching and cognitive load for property owners. The auto-open feature increases visibility into translation status, ensuring owners are aware of translation progress and can take action on failures promptly. This improves content quality and reduces the time-to-publish for multilingual content. By providing consistent translation management UX across both items and articles, the system offers a unified and professional content management experience.

### Acceptance Criteria
- [ ] "Translations" button is visible in the item editor interface header
- [ ] Translations button is positioned near the Save button for easy access
- [ ] Clicking "Translations" button opens the TranslationPreviewPanel
- [ ] Panel displays item publicId and type correctly as "item"
- [ ] Panel shows translation status for all 6 supported languages (es, fr, de, it, nl, pt)
- [ ] After successful save, translation status is refetched
- [ ] Panel auto-opens after save if item has pending translations (pendingCount > 0)
- [ ] Panel auto-opens after save if item has failed translations (failedCount > 0)
- [ ] Panel auto-opens after save if status is 'pending' or 'has_failures'
- [ ] Auto-open only triggers once per save operation (not on every status refresh)
- [ ] Translation status badge shows pending count next to the Translations button
- [ ] Clicking Edit action in panel navigates to translation edit page for the specific language
- [ ] Clicking Re-translate action triggers re-translation API and refreshes status
- [ ] Clicking Retry action for failed translations triggers retry API and refreshes status
- [ ] Panel closes when clicking the close button
- [ ] Panel closes when pressing ESC key
- [ ] Panel closes when clicking outside (if overlay mode is enabled)
- [ ] `onClose` callback properly updates state to close panel
- [ ] Translation status refreshes periodically while panel is open (if implemented in hook)
- [ ] Loading state is handled gracefully while fetching translation status
- [ ] Error state is handled if translation status fetch fails
- [ ] Page continues to function normally if translation status API is unavailable
- [ ] Translation keys added for all new UI text in all supported locales (en, fr, es, de, nl, it)
- [ ] Page layout remains responsive with the panel integration
- [ ] Header layout accommodates both Translations and Save buttons without crowding
- [ ] Button spacing and alignment is consistent with existing UI patterns
- [ ] No TypeScript compilation errors
- [ ] No ESLint warnings
- [ ] Existing edit functionality is preserved and unaffected (room selector, type selector, tags edit)
- [ ] Existing tests continue to pass
- [ ] Save operation completes successfully before auto-opening panel
- [ ] If save fails, panel does not auto-open
- [ ] Navigation behavior works correctly with panel integration (back button, redirect after save)

---

---

## REQ-E05-030: Add Loading States and Error Handling

**Date**: 2026-01-22
**Type**: ENHANCEMENT
**Size**: L
**Phase**: Phase 7 (Integration & Polish), Task 7.3

### Summary
Property owners need consistent and informative feedback when interacting with translation management features, including proper loading indicators during asynchronous operations and clear error messages when operations fail. All components should provide retry mechanisms for failed operations to ensure a resilient user experience.

### Current Behavior
Translation management components may lack consistent loading states, making it unclear when operations are in progress. Error handling may be inconsistent or missing across different components, leaving users uncertain about the status of their operations. Failed operations may not provide clear feedback or recovery options, forcing users to refresh the page or restart their workflow.

### Expected Behavior
All translation management components provide:
1. **Loading States**: Proper loading spinners or skeleton states during asynchronous operations (data fetching, saves, updates)
2. **Error Feedback**: Clear, user-friendly error messages displayed via toasts or inline messages when operations fail
3. **Retry Actions**: Explicit retry buttons or actions for failed operations, allowing users to recover without manual page refresh
4. **Graceful Degradation**: Components continue to function or provide meaningful fallback UI when APIs are unavailable
5. **Loading UX Patterns**: Consistent loading indicators across all components (spinners for buttons, skeleton loaders for content, loading states for panels)
6. **Error Recovery**: Automatic retry logic for transient failures (with backoff), manual retry for persistent failures

### Technical Details

#### Components Requiring Updates

1. **TranslationPreviewPanel** (`/src/components/TranslationManagement/TranslationPreviewPanel.tsx`)
   - Loading state while fetching translation status
   - Error state if status fetch fails
   - Retry button to refetch status after failure
   - Loading indicators for re-translate and retry actions
   - Error toast notifications for failed actions

2. **TranslationEditForm** (`/src/components/TranslationManagement/TranslationEditForm.tsx`)
   - Loading spinner on Save button during save operation
   - Disabled state for form fields during save
   - Error toast on save failure with retry option
   - Loading state while fetching translation data
   - Skeleton loader for form fields during initial load

3. **TranslationStatusTable** (`/src/components/TranslationManagement/TranslationStatusTable.tsx`)
   - Loading skeleton rows while data is fetching
   - Error state with retry button if data fetch fails
   - Loading indicators on action buttons (re-translate, retry, edit)
   - Toast notifications for bulk action failures

4. **TranslationLanguageSelector** (`/src/components/TranslationManagement/TranslationLanguageSelector.tsx`)
   - Loading state while checking translation status
   - Error boundary for failed status checks
   - Disabled state for unavailable languages during operations

5. **useTranslationStatus Hook** (`/src/hooks/useTranslationStatus.ts`)
   - Proper error state exposure to consumers
   - Retry function exposed in hook return
   - Loading state tracking for all async operations
   - Error message formatting and standardization

6. **useTranslationMutations Hook** (`/src/hooks/useTranslationMutations.ts`)
   - Loading state for each mutation type (save, re-translate, retry)
   - Error state with formatted error messages
   - Success/error toast notifications
   - Retry logic with exponential backoff for transient failures

#### Loading State Patterns

```typescript
// Button loading state (for actions)
<Button onClick={handleSave} disabled={saving}>
  {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
  {saving ? t('saving') : t('save')}
</Button>

// Skeleton loader (for content)
{isLoading ? (
  <div className="space-y-2">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
) : (
  <div>{content}</div>
)}

// Full panel loading state
{isLoading && (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    <span className="ml-2 text-muted-foreground">{t('loading')}</span>
  </div>
)}

// Table loading skeleton
{isLoading && (
  <Table>
    <TableBody>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-6 w-24" /></TableCell>
          <TableCell><Skeleton className="h-8 w-16" /></TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
)}
```

#### Error Handling Patterns

```typescript
// Error toast notification (using sonner or existing toast library)
import { toast } from 'sonner';

const handleSaveError = (error: Error) => {
  toast.error(t('errors.saveFailed'), {
    description: error.message,
    action: {
      label: t('retry'),
      onClick: () => handleSave(),
    },
  });
};

// Inline error message
{error && (
  <div className="rounded-md bg-destructive/10 p-4 border border-destructive/20">
    <div className="flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-sm font-medium text-destructive">
          {t('errors.title')}
        </h4>
        <p className="text-sm text-destructive/80 mt-1">
          {error.message || t('errors.generic')}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRetry}
          className="mt-2"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('retry')}
        </Button>
      </div>
    </div>
  </div>
)}

// Error state for full component
{error && !isLoading && (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <AlertCircle className="w-12 h-12 text-destructive mb-4" />
    <h3 className="text-lg font-semibold mb-2">{t('errors.loadFailed')}</h3>
    <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
    <Button onClick={handleRetry} variant="outline">
      <RefreshCw className="w-4 h-4 mr-2" />
      {t('retry')}
    </Button>
  </div>
)}
```

#### Hook Updates

**useTranslationStatus Hook**
```typescript
export function useTranslationStatus({ entityType, entityId, enabled = true }) {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<EntityStatusSummary | null>(null);

  const fetchStatus = async () => {
    if (!enabled || !entityId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/translations/status?entityType=${entityType}&entityId=${entityId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch translation status: ${response.statusText}`);
      }
      
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      toast.error(t('errors.statusFetchFailed'), {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const retry = () => {
    fetchStatus();
  };

  useEffect(() => {
    fetchStatus();
  }, [entityType, entityId, enabled]);

  return {
    status,
    isLoading,
    error,
    refetch: fetchStatus,
    retry,
  };
}
```

**useTranslationMutations Hook**
```typescript
export function useTranslationMutations() {
  const [isSaving, setIsSaving] = useState(false);
  const [isRetranslating, setIsRetranslating] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const saveTranslation = async (data: TranslationUpdateData) => {
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/translations/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save translation');
      }
      
      const result = await response.json();
      toast.success(t('success.saved'));
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      toast.error(t('errors.saveFailed'), {
        description: error.message,
        action: {
          label: t('retry'),
          onClick: () => saveTranslation(data),
        },
      });
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const retranslate = async (entityType: string, entityId: string, targetLanguages: string[]) => {
    setIsRetranslating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/translations/retranslate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType, entityId, targetLanguages }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to re-translate');
      }
      
      const result = await response.json();
      toast.success(t('success.retranslateStarted'));
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      toast.error(t('errors.retranslateFailed'), {
        description: error.message,
        action: {
          label: t('retry'),
          onClick: () => retranslate(entityType, entityId, targetLanguages),
        },
      });
      throw error;
    } finally {
      setIsRetranslating(false);
    }
  };

  const retryFailed = async (entityType: string, entityId: string, language: string) => {
    setIsRetrying(true);
    setError(null);
    
    try {
      const response = await fetch('/api/translations/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType, entityId, language }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to retry translation');
      }
      
      const result = await response.json();
      toast.success(t('success.retryStarted'));
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      toast.error(t('errors.retryFailed'), {
        description: error.message,
        action: {
          label: t('retry'),
          onClick: () => retryFailed(entityType, entityId, language),
        },
      });
      throw error;
    } finally {
      setIsRetrying(false);
    }
  };

  return {
    saveTranslation,
    retranslate,
    retryFailed,
    isSaving,
    isRetranslating,
    isRetrying,
    error,
  };
}
```

#### Translation Keys

Add to `/messages/{locale}.json`:

```json
{
  "translationManagement": {
    "loading": "Loading translations...",
    "loadingStatus": "Loading translation status...",
    "saving": "Saving...",
    "retranslating": "Re-translating...",
    "retrying": "Retrying...",
    "retry": "Retry",
    "errors": {
      "title": "Error",
      "generic": "An unexpected error occurred. Please try again.",
      "loadFailed": "Failed to load translations",
      "statusFetchFailed": "Failed to fetch translation status",
      "saveFailed": "Failed to save translation",
      "retranslateFailed": "Failed to start re-translation",
      "retryFailed": "Failed to retry translation",
      "networkError": "Network error. Please check your connection.",
      "unauthorized": "You are not authorized to perform this action.",
      "notFound": "The requested translation was not found.",
      "validationError": "Please check your input and try again."
    },
    "success": {
      "saved": "Translation saved successfully",
      "retranslateStarted": "Re-translation started",
      "retryStarted": "Retry initiated"
    }
  }
}
```

#### Dependencies
- **REQ-E05-007**: TranslationPreviewPanel component
- **REQ-E05-008**: TranslationEditForm component
- **REQ-E05-009**: TranslationStatusTable component
- **REQ-E05-010**: TranslationLanguageSelector component
- **REQ-E05-011**: useTranslationStatus hook
- **REQ-E05-012**: useTranslationMutations hook
- **Existing**: Toast library (sonner or shadcn/ui toast)
- **Existing**: shadcn/ui components (Button, Skeleton, Alert)
- **Existing**: lucide-react icons (Loader2, AlertCircle, RefreshCw)

### User Impact
Property owners gain confidence when using translation management features through clear feedback on operation progress and outcomes. Loading states prevent confusion about whether actions are processing, while error messages provide actionable information when something goes wrong. Retry buttons allow owners to recover from failures without losing their work or context, significantly improving the user experience during network issues or API failures.

### Business Value
Proper loading states and error handling are essential for production-ready features. They reduce support burden by providing users with clear information about what's happening and how to recover from errors. This builds trust in the platform and reduces frustration, leading to higher user satisfaction and adoption of translation features. The retry mechanisms ensure that transient failures don't result in lost work, improving the overall reliability perception of the platform.

### Acceptance Criteria

#### General Requirements
- [ ] All translation management components show loading states during asynchronous operations
- [ ] All API errors result in user-friendly error messages (not raw error dumps)
- [ ] Error messages are displayed via toast notifications for actions
- [ ] Error messages are displayed inline for component-level failures
- [ ] All failed operations provide a retry mechanism
- [ ] Loading indicators are consistent across all components (using shadcn/ui Loader2 icon)
- [ ] Skeleton loaders are used for content loading (not full-page spinners)
- [ ] Translation keys exist for all loading, error, and success messages in all supported locales

#### TranslationPreviewPanel
- [ ] Shows loading state while fetching initial translation status
- [ ] Shows loading state while refreshing status after actions
- [ ] Displays error message with retry button if status fetch fails
- [ ] Re-translate button shows loading spinner during operation
- [ ] Retry button shows loading spinner during operation
- [ ] Toast notification appears on successful re-translate
- [ ] Toast notification appears on failed re-translate with retry option
- [ ] Panel remains functional if status API is temporarily unavailable
- [ ] Error state doesn't block access to other panel features

#### TranslationEditForm
- [ ] Shows skeleton loader for form fields during initial data fetch
- [ ] Save button shows loading spinner during save operation
- [ ] Save button is disabled during save operation
- [ ] Form fields are disabled during save operation
- [ ] Error toast appears on save failure with clear error message
- [ ] Error toast includes retry action button
- [ ] Success toast appears on successful save
- [ ] Form data is preserved if save fails (no data loss)
- [ ] Network errors are distinguished from validation errors in messaging

#### TranslationStatusTable
- [ ] Shows skeleton rows (5-10 rows) during initial data fetch
- [ ] Shows loading state when refetching data
- [ ] Displays error state with retry button if data fetch fails
- [ ] Re-translate action buttons show loading spinner during operation
- [ ] Retry action buttons show loading spinner during operation
- [ ] Edit action buttons show loading spinner during navigation
- [ ] Toast notification on successful bulk actions
- [ ] Toast notification on failed bulk actions with retry option
- [ ] Table remains accessible if some rows fail to load (partial failure handling)

#### TranslationLanguageSelector
- [ ] Shows loading state while checking translation status for languages
- [ ] Disabled languages show appropriate visual state (grayed out, cursor not-allowed)
- [ ] Error checking language status doesn't crash the component
- [ ] Fallback state if language status is unavailable
- [ ] Loading indicators don't block language selection interaction

#### useTranslationStatus Hook
- [ ] Exposes `isLoading` state to consumers
- [ ] Exposes `error` state with formatted error messages to consumers
- [ ] Exposes `retry` function to consumers
- [ ] Automatically refetches on retry
- [ ] Clears error state on successful retry
- [ ] Doesn't crash on network failures
- [ ] Handles 401/403 errors with appropriate messaging
- [ ] Handles 404 errors with appropriate messaging
- [ ] Handles 500 errors with generic error message

#### useTranslationMutations Hook
- [ ] Exposes `isSaving` state for save operations
- [ ] Exposes `isRetranslating` state for re-translate operations
- [ ] Exposes `isRetrying` state for retry operations
- [ ] Exposes `error` state with formatted error messages
- [ ] Each mutation function handles errors gracefully
- [ ] Toast notifications triggered on success
- [ ] Toast notifications triggered on failure with retry action
- [ ] Retry action in toast re-invokes the failed operation
- [ ] Loading states reset after operation completes (success or failure)
- [ ] Error state is cleared on subsequent successful operation

#### Error Recovery
- [ ] Retry buttons re-invoke the exact same operation that failed
- [ ] Retry operations preserve user input/context
- [ ] Multiple retry attempts are supported (no single-retry limitation)
- [ ] Transient network errors are handled with automatic retry (if implemented)
- [ ] Persistent errors show clear messaging to contact support or try later
- [ ] Unauthorized errors redirect to login or show clear auth error
- [ ] Not found errors provide helpful context about what wasn't found

#### UX Polish
- [ ] Loading spinners are consistently sized (w-4 h-4 for buttons, w-8 h-8 for panels)
- [ ] Loading spinners use `animate-spin` class
- [ ] Skeleton loaders match the approximate layout of loaded content
- [ ] Error messages use destructive color scheme (red/destructive variant)
- [ ] Success messages use success color scheme (green/success variant)
- [ ] Toast notifications auto-dismiss after 5-7 seconds (except error toasts with actions)
- [ ] Error toasts with retry actions remain visible until user action or explicit dismiss
- [ ] Loading states don't cause layout shift (buttons maintain size, content areas maintain height)

#### Accessibility
- [ ] Loading states are announced to screen readers (aria-live regions)
- [ ] Error messages are announced to screen readers
- [ ] Retry buttons have clear, descriptive labels
- [ ] Loading spinners have appropriate aria-label attributes
- [ ] Disabled states during loading are properly conveyed to assistive technologies

#### Testing
- [ ] No TypeScript compilation errors
- [ ] No ESLint warnings
- [ ] Unit tests cover error scenarios for all hooks
- [ ] Unit tests cover loading states for all hooks
- [ ] Integration tests verify toast notifications appear on errors
- [ ] Integration tests verify retry functionality works as expected
- [ ] Manual testing confirms error messages are user-friendly (not technical jargon)
- [ ] Manual testing confirms loading states appear for operations longer than 200ms
- [ ] Network throttling test confirms components handle slow networks gracefully
- [ ] Offline test confirms components show appropriate error when API is unreachable

---

## REQ-E05-031: Add Accessibility Features to Translation Management

**Date**: 2026-01-22
**Type**: ENHANCEMENT
**Size**: L
**Phase**: Phase 7 (Integration & Polish), Task 7.4

### Summary
Translation management components must be fully accessible to users relying on assistive technologies, including proper ARIA labels for status icons, keyboard navigation support in preview panels, screen reader announcements for status changes, and appropriate focus management in modals. This ensures compliance with WCAG 2.1 AA standards and provides an inclusive experience for all property owners.

### Current Behavior
Translation management components may lack proper accessibility features:
- Status icons (success, warning, error, in-progress) may not have ARIA labels, leaving screen reader users unaware of translation status
- Preview panels may not support keyboard navigation, forcing keyboard-only users to rely on mouse interaction
- Status changes (translation completed, error occurred) may not be announced to screen readers, leaving users uncertain about operation outcomes
- Modals may not properly manage focus, causing keyboard focus to escape or become trapped inappropriately

### Expected Behavior
All translation management components provide comprehensive accessibility features:

1. **ARIA Labels for Status Icons**
   - All status badges and icons include descriptive `aria-label` attributes
   - Icon-only buttons include proper labels (e.g., "Retry translation for French", not just "Retry")
   - Visual status indicators are supplemented with accessible text alternatives

2. **Keyboard Navigation in Preview Panel**
   - All interactive elements (buttons, tabs, links) are keyboard accessible
   - Tab order follows logical reading order
   - Focus indicators are clearly visible
   - Keyboard shortcuts are available for common actions (optional but recommended)

3. **Screen Reader Announcements for Status Changes**
   - ARIA live regions announce when translations complete
   - ARIA live regions announce when errors occur
   - Announcements are polite (don't interrupt) for non-critical updates
   - Announcements are assertive for critical errors

4. **Focus Management in Modals**
   - Focus moves to modal when opened
   - Focus is trapped within modal while open
   - Focus returns to trigger element when modal closes
   - ESC key closes modal and returns focus appropriately
   - First focusable element receives focus on modal open

### Technical Details

#### Components Requiring Accessibility Enhancements

1. **TranslationPreviewPanel** (`/src/components/TranslationManagement/TranslationPreviewPanel.tsx`)
2. **TranslationEditForm** (`/src/components/TranslationManagement/TranslationEditForm.tsx`)
3. **TranslationStatusTable** (`/src/components/TranslationManagement/TranslationStatusTable.tsx`)
4. **TranslationStatusBadge** (`/src/components/TranslationManagement/TranslationStatusBadge.tsx`)
5. **TranslationLanguageSelector** (`/src/components/TranslationManagement/TranslationLanguageSelector.tsx`)
6. **Any modals/dialogs** used in translation management workflows

#### ARIA Labels for Status Icons

**TranslationStatusBadge Component Updates**

```typescript
// /src/components/TranslationManagement/TranslationStatusBadge.tsx
import type { TranslationFn } from '@/types';
import { useTranslations } from 'next-intl';

interface TranslationStatusBadgeProps {
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  language?: string;
}

export function TranslationStatusBadge({ status, language }: TranslationStatusBadgeProps) {
  const t = useTranslations('translationManagement.status');
  
  // Get appropriate icon and color based on status
  const config = {
    pending: {
      icon: Clock,
      variant: 'secondary',
      ariaLabel: t('ariaLabels.pending', { language }),
    },
    in_progress: {
      icon: Loader2,
      variant: 'default',
      ariaLabel: t('ariaLabels.inProgress', { language }),
    },
    completed: {
      icon: CheckCircle2,
      variant: 'success',
      ariaLabel: t('ariaLabels.completed', { language }),
    },
    failed: {
      icon: XCircle,
      variant: 'destructive',
      ariaLabel: t('ariaLabels.failed', { language }),
    },
  }[status];

  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1.5">
      <Icon 
        className="w-3 h-3" 
        aria-label={config.ariaLabel}
        aria-hidden={false}
      />
      <span>{t(status)}</span>
    </Badge>
  );
}
```

**Action Button ARIA Labels**

```typescript
// Retry button with contextual ARIA label
<Button
  variant="outline"
  size="sm"
  onClick={() => handleRetry(language)}
  disabled={isRetrying}
  aria-label={t('actions.ariaLabels.retry', { language })}
>
  {isRetrying ? (
    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
  ) : (
    <RefreshCw className="w-4 h-4" aria-hidden="true" />
  )}
  <span>{t('actions.retry')}</span>
</Button>

// Re-translate button with contextual ARIA label
<Button
  variant="default"
  size="sm"
  onClick={() => handleRetranslate(language)}
  disabled={isRetranslating}
  aria-label={t('actions.ariaLabels.retranslate', { language })}
>
  <Languages className="w-4 h-4 mr-2" aria-hidden="true" />
  {t('actions.retranslate')}
</Button>

// Edit translation button
<Button
  variant="ghost"
  size="sm"
  onClick={() => handleEdit(language)}
  aria-label={t('actions.ariaLabels.edit', { language, entity: entityName })}
>
  <Edit className="w-4 h-4 mr-2" aria-hidden="true" />
  {t('actions.edit')}
</Button>
```

#### Keyboard Navigation in Preview Panel

**TranslationPreviewPanel Component Updates**

```typescript
// /src/components/TranslationManagement/TranslationPreviewPanel.tsx
import { useRef, useEffect } from 'react';

export function TranslationPreviewPanel({ entityId, entityType }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('translationManagement.preview');

  // Keyboard shortcut: 'r' to refresh status
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if focus is within panel
      if (!panelRef.current?.contains(document.activeElement)) return;
      
      if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleRefresh();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
      ref={panelRef}
      className="translation-preview-panel"
      role="region"
      aria-label={t('ariaLabels.panel')}
      tabIndex={-1}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 id="preview-panel-title" className="text-lg font-semibold">
          {t('title')}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          aria-label={t('actions.ariaLabels.refresh')}
          title={t('actions.keyboardHint.refresh')} // "Press 'r' to refresh"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
        </Button>
      </div>

      {/* Status list with proper keyboard navigation */}
      <div 
        role="list"
        aria-labelledby="preview-panel-title"
        className="space-y-2"
      >
        {languages.map((lang) => (
          <div
            key={lang}
            role="listitem"
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              <span className="font-medium">{getLanguageName(lang)}</span>
              <TranslationStatusBadge status={statuses[lang]} language={lang} />
            </div>
            
            <div className="flex gap-2">
              {/* Action buttons with proper tab order */}
              {statuses[lang] === 'failed' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRetry(lang)}
                  aria-label={t('actions.ariaLabels.retry', { language: getLanguageName(lang) })}
                >
                  <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                  {t('actions.retry')}
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(lang)}
                aria-label={t('actions.ariaLabels.edit', { language: getLanguageName(lang) })}
              >
                <Edit className="w-4 h-4 mr-2" aria-hidden="true" />
                {t('actions.edit')}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Keyboard shortcuts help (optional) */}
      <div className="sr-only" role="note">
        {t('keyboardShortcuts.description')}
      </div>
    </div>
  );
}
```

**Focus Indicators**

Ensure all interactive elements have visible focus indicators:

```css
/* /src/styles/accessibility.css or in Tailwind config */

/* Custom focus styles for translation management components */
.translation-preview-panel button:focus-visible,
.translation-edit-form input:focus-visible,
.translation-edit-form textarea:focus-visible,
.translation-status-table button:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

/* High contrast focus for status badges */
.translation-status-badge:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
  box-shadow: 0 0 0 4px hsl(var(--background));
}
```

#### Screen Reader Announcements for Status Changes

**ARIA Live Regions**

```typescript
// /src/components/TranslationManagement/TranslationStatusAnnouncer.tsx
'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface TranslationStatusAnnouncerProps {
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';
  language?: string;
  message?: string;
}

/**
 * Invisible component that announces status changes to screen readers
 * via ARIA live regions
 */
export function TranslationStatusAnnouncer({ 
  status, 
  language, 
  message 
}: TranslationStatusAnnouncerProps) {
  const t = useTranslations('translationManagement.announcements');
  const [announcement, setAnnouncement] = useState<string>('');

  useEffect(() => {
    if (!status) return;

    let newAnnouncement = '';
    
    if (message) {
      newAnnouncement = message;
    } else {
      // Generate announcement from status and language
      newAnnouncement = t(status, { language });
    }

    // Small delay to ensure screen reader picks up the change
    const timeout = setTimeout(() => {
      setAnnouncement(newAnnouncement);
    }, 100);

    return () => clearTimeout(timeout);
  }, [status, language, message, t]);

  // Determine politeness level based on status
  const politeness = status === 'failed' ? 'assertive' : 'polite';

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}
```

**Integration with Components**

```typescript
// TranslationPreviewPanel with status announcements
export function TranslationPreviewPanel({ entityId, entityType }: Props) {
  const [lastStatusChange, setLastStatusChange] = useState<{
    language: string;
    status: TranslationStatus;
  } | null>(null);

  // Watch for status changes and trigger announcements
  useEffect(() => {
    if (!statuses || !prevStatuses) return;

    Object.entries(statuses).forEach(([lang, status]) => {
      if (prevStatuses[lang] !== status) {
        setLastStatusChange({ language: lang, status });
      }
    });
  }, [statuses, prevStatuses]);

  return (
    <div>
      {/* Existing panel content */}
      {/* ... */}

      {/* Status announcer */}
      {lastStatusChange && (
        <TranslationStatusAnnouncer
          status={lastStatusChange.status}
          language={lastStatusChange.language}
        />
      )}
    </div>
  );
}
```

**Toast Notifications with Screen Reader Support**

Ensure toast library (sonner or shadcn/ui toast) announces messages:

```typescript
// Toast wrapper with proper ARIA announcements
import { toast as sonnerToast } from 'sonner';

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    sonnerToast.success(message, {
      ...options,
      // Ensure aria-live region announces success
      role: 'status',
      ariaLive: 'polite',
    });
  },
  
  error: (message: string, options?: ToastOptions) => {
    sonnerToast.error(message, {
      ...options,
      // Use assertive for errors
      role: 'alert',
      ariaLive: 'assertive',
    });
  },
  
  // ... other toast methods
};
```

#### Focus Management in Modals

**Translation Edit Modal with Focus Trap**

```typescript
// /src/components/TranslationManagement/TranslationEditModal.tsx
'use client';

import { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TranslationEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
  entityType: 'item' | 'article';
  entityId: string;
}

export function TranslationEditModal({
  isOpen,
  onClose,
  language,
  entityType,
  entityId,
}: TranslationEditModalProps) {
  const t = useTranslations('translationManagement.editModal');
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const firstFocusableRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Store trigger element when modal opens
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Focus management: move focus to first field when modal opens
  useEffect(() => {
    if (isOpen && firstFocusableRef.current) {
      // Small delay to ensure modal is fully rendered
      const timeout = setTimeout(() => {
        firstFocusableRef.current?.focus();
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Return focus to trigger when modal closes
  const handleClose = () => {
    onClose();
    
    // Return focus to element that opened the modal
    if (triggerRef.current) {
      triggerRef.current.focus();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        aria-labelledby="edit-modal-title"
        aria-describedby="edit-modal-description"
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle id="edit-modal-title">
            {t('title', { language, entityType })}
          </DialogTitle>
          <DialogDescription id="edit-modal-description">
            {t('description', { language })}
          </DialogDescription>
        </DialogHeader>

        {/* Edit form with ref to first input */}
        <TranslationEditForm
          language={language}
          entityType={entityType}
          entityId={entityId}
          firstInputRef={firstFocusableRef}
          onSave={handleClose}
          onCancel={handleClose}
        />

        {/* Close button is already part of shadcn/ui Dialog */}
      </DialogContent>
    </Dialog>
  );
}
```

**TranslationEditForm with Focus Management**

```typescript
// /src/components/TranslationManagement/TranslationEditForm.tsx
interface TranslationEditFormProps {
  // ... existing props
  firstInputRef?: React.RefObject<HTMLInputElement>;
}

export function TranslationEditForm({ 
  firstInputRef,
  // ... other props
}: TranslationEditFormProps) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* First focusable element */}
      <div>
        <Label htmlFor="translation-title">
          {t('fields.title')}
        </Label>
        <Input
          id="translation-title"
          ref={firstInputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          aria-required="true"
          aria-invalid={errors.title ? 'true' : 'false'}
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
        {errors.title && (
          <p id="title-error" className="text-sm text-destructive mt-1" role="alert">
            {errors.title}
          </p>
        )}
      </div>

      {/* Other form fields */}
      {/* ... */}

      {/* Action buttons with proper keyboard navigation */}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          {t('actions.cancel')}
        </Button>
        <Button
          type="submit"
          disabled={isSaving}
          aria-label={isSaving ? t('actions.ariaLabels.saving') : t('actions.ariaLabels.save')}
        >
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />}
          {isSaving ? t('actions.saving') : t('actions.save')}
        </Button>
      </div>
    </form>
  );
}
```

**Focus Trap Hook (if not using shadcn/ui Dialog)**

If using custom modals without shadcn/ui Dialog's built-in focus trap:

```typescript
// /src/hooks/useFocusTrap.ts
import { useEffect, useRef } from 'react';

export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab: moving backwards
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab: moving forwards
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Close modal and return focus (handled by modal component)
      }
    };

    container.addEventListener('keydown', handleTabKey);
    container.addEventListener('keydown', handleEscapeKey);

    // Focus first element
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
      container.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isActive]);

  return containerRef;
}
```

#### Translation Keys

Add to `/messages/{locale}.json`:

```json
{
  "translationManagement": {
    "status": {
      "ariaLabels": {
        "pending": "Translation pending for {language}",
        "inProgress": "Translation in progress for {language}",
        "completed": "Translation completed for {language}",
        "failed": "Translation failed for {language}"
      }
    },
    "actions": {
      "ariaLabels": {
        "retry": "Retry translation for {language}",
        "retranslate": "Re-translate {language}",
        "edit": "Edit {language} translation for {entity}",
        "refresh": "Refresh translation status",
        "save": "Save translation",
        "saving": "Saving translation, please wait"
      },
      "keyboardHint": {
        "refresh": "Press 'r' to refresh"
      }
    },
    "preview": {
      "ariaLabels": {
        "panel": "Translation preview panel"
      }
    },
    "announcements": {
      "pending": "{language} translation is pending",
      "in_progress": "{language} translation is in progress",
      "completed": "{language} translation has completed successfully",
      "failed": "{language} translation has failed"
    },
    "editModal": {
      "title": "Edit {language} translation for {entityType}",
      "description": "Update the {language} translation below"
    },
    "keyboardShortcuts": {
      "description": "Keyboard shortcuts: Press 'r' to refresh status"
    }
  }
}
```

#### Accessibility Testing Checklist

Create accessibility testing checklist:

```markdown
# Translation Management Accessibility Testing

## Screen Reader Testing
- [ ] NVDA (Windows) - Test all components with NVDA
- [ ] JAWS (Windows) - Test all components with JAWS
- [ ] VoiceOver (macOS) - Test all components with VoiceOver
- [ ] TalkBack (Android) - Test mobile web views
- [ ] Status badges are announced with full context
- [ ] Status changes trigger announcements
- [ ] Action button labels are descriptive
- [ ] Error messages are announced
- [ ] Success messages are announced
- [ ] Loading states are announced

## Keyboard Navigation Testing
- [ ] Tab key navigates through all interactive elements
- [ ] Shift+Tab navigates backwards correctly
- [ ] Focus order is logical (left-to-right, top-to-bottom)
- [ ] All buttons are keyboard accessible
- [ ] All links are keyboard accessible
- [ ] All form fields are keyboard accessible
- [ ] No keyboard traps (except intentional modal traps)
- [ ] Focus indicators are clearly visible
- [ ] Enter/Space activates buttons and links
- [ ] Escape closes modals and returns focus

## Modal Focus Management Testing
- [ ] Focus moves to modal when opened
- [ ] Focus trapped within modal while open
- [ ] Tab wraps from last to first element
- [ ] Shift+Tab wraps from first to last element
- [ ] Escape key closes modal
- [ ] Focus returns to trigger element on close
- [ ] Focus returns to trigger on cancel
- [ ] First input field receives focus on modal open

## ARIA Labels Testing
- [ ] All status icons have aria-label
- [ ] All icon-only buttons have aria-label
- [ ] All buttons have descriptive labels (not just "Retry")
- [ ] All regions have aria-label or aria-labelledby
- [ ] Form errors have aria-describedby
- [ ] Required fields have aria-required
- [ ] Invalid fields have aria-invalid
- [ ] Live regions use appropriate politeness (polite/assertive)

## Color Contrast Testing
- [ ] Status badges meet WCAG AA contrast (4.5:1 for text)
- [ ] Focus indicators meet WCAG AA contrast (3:1 for UI components)
- [ ] Error messages meet WCAG AA contrast
- [ ] Disabled states meet WCAG AA contrast
- [ ] Test with high contrast mode (Windows High Contrast)

## Visual Focus Testing
- [ ] Focus indicators visible on all interactive elements
- [ ] Focus indicators not obscured by other elements
- [ ] Focus indicators clearly distinguish focused element
- [ ] Focus indicators work in light and dark themes
- [ ] Custom focus styles applied where needed

## Tools
- [ ] axe DevTools - Run automated scan, fix all issues
- [ ] Lighthouse Accessibility audit - Score 100
- [ ] WAVE browser extension - Fix all errors/alerts
- [ ] Color Contrast Analyzer - Verify all contrast ratios
- [ ] Browser zoom - Test at 200%, 400% zoom levels
```

#### Dependencies
- **REQ-E05-007**: TranslationPreviewPanel component
- **REQ-E05-008**: TranslationEditForm component
- **REQ-E05-009**: TranslationStatusTable component
- **REQ-E05-010**: TranslationLanguageSelector component
- **REQ-E05-030**: Loading states and error handling (for aria-live announcements)
- **Existing**: shadcn/ui Dialog component (includes focus trap)
- **Existing**: next-intl for i18n
- **Optional**: @radix-ui/react-focus-scope (if custom focus trap needed)

### User Impact
Property owners who rely on assistive technologies (screen readers, keyboard navigation, voice control) gain full access to translation management features without barriers. Users with visual impairments can understand translation status through screen reader announcements. Users with motor disabilities can navigate and operate all features using keyboard only. This creates an inclusive platform that serves all users regardless of their abilities or assistive technology preferences.

### Business Value
Accessibility is both a legal requirement (ADA, Section 508, WCAG 2.1 AA compliance) and a business opportunity. Making the platform accessible expands the potential user base to include millions of users with disabilities. It demonstrates social responsibility and reduces legal risk. Accessible design often benefits all users through clearer interfaces, better keyboard navigation, and more predictable interactions. Meeting WCAG 2.1 AA standards positions the platform favorably for enterprise and government customers who require accessibility compliance.

### Acceptance Criteria

#### ARIA Labels for Status Icons

- [ ] All TranslationStatusBadge components include descriptive `aria-label` attributes
- [ ] Status icon ARIA labels include language context (e.g., "Translation completed for French")
- [ ] Icon-only buttons have descriptive `aria-label` (e.g., "Retry translation for Spanish")
- [ ] Decorative icons use `aria-hidden="true"` to hide from screen readers
- [ ] Action buttons combine icon with visible text label whenever possible
- [ ] Icon ARIA labels are translatable via i18n system
- [ ] Status indicators announce both status and language to screen readers

#### Keyboard Navigation in Preview Panel

- [ ] All interactive elements (buttons, links, tabs) are keyboard accessible via Tab key
- [ ] Tab order follows logical reading order (left-to-right, top-to-bottom)
- [ ] Shift+Tab navigates backwards through interactive elements
- [ ] Enter key activates buttons and links
- [ ] Space key activates buttons
- [ ] Focus indicators are clearly visible on all interactive elements (2px outline with offset)
- [ ] Focus indicators meet WCAG 2.1 AA contrast requirements (3:1 against background)
- [ ] No keyboard traps in preview panel (can always tab out)
- [ ] Preview panel has `role="region"` and descriptive `aria-label`
- [ ] Status list uses semantic list markup (`role="list"`, `role="listitem"`)
- [ ] Keyboard shortcuts (if implemented) are documented and don't conflict with browser/AT shortcuts
- [ ] Keyboard shortcuts can be disabled or customized if they interfere with AT

#### Screen Reader Announcements for Status Changes

- [ ] TranslationStatusAnnouncer component created for managing announcements
- [ ] ARIA live region announces translation completion (polite)
- [ ] ARIA live region announces translation errors (assertive)
- [ ] ARIA live region announces translation start (polite)
- [ ] Status change announcements include language context
- [ ] Announcements use `aria-atomic="true"` to read entire message
- [ ] Polite announcements used for non-critical updates (don't interrupt user)
- [ ] Assertive announcements used for critical errors (interrupt user)
- [ ] Toast notifications include proper `role` attributes (`role="status"` or `role="alert"`)
- [ ] Toast notifications use appropriate `aria-live` values
- [ ] Success toasts use `aria-live="polite"` and `role="status"`
- [ ] Error toasts use `aria-live="assertive"` and `role="alert"`
- [ ] Loading state changes are announced ("Saving translation", "Translation saved")

#### Focus Management in Modals

- [ ] Focus moves to modal when opened (first focusable element or modal container)
- [ ] Focus is trapped within modal while open (Tab wraps to first element, Shift+Tab wraps to last)
- [ ] Tab key cycles forward through modal interactive elements
- [ ] Shift+Tab key cycles backward through modal interactive elements
- [ ] Escape key closes modal and returns focus to trigger element
- [ ] Close button (X) closes modal and returns focus to trigger element
- [ ] Cancel button closes modal and returns focus to trigger element
- [ ] Save action (success) closes modal and returns focus to trigger element
- [ ] Modal close returns focus to exact element that triggered modal
- [ ] Modal has descriptive `aria-labelledby` pointing to title
- [ ] Modal has `aria-describedby` pointing to description (if present)
- [ ] Modal uses shadcn/ui Dialog component with built-in focus trap
- [ ] First form input receives focus when modal opens
- [ ] Focus visible indicator works within modal
- [ ] No focus escapes modal container during interaction

#### Form Accessibility

- [ ] All form fields have associated `<label>` elements with `htmlFor`
- [ ] Required fields have `aria-required="true"`
- [ ] Invalid fields have `aria-invalid="true"`
- [ ] Error messages have unique `id` and are referenced by `aria-describedby`
- [ ] Error messages use `role="alert"` for immediate announcement
- [ ] Field hints use `aria-describedby` to associate with input
- [ ] Fieldsets use `<legend>` for group labels (if grouping exists)
- [ ] Submit button disabled state is announced to screen readers
- [ ] Loading state during save is announced via `aria-label` change

#### Table Accessibility

- [ ] TranslationStatusTable uses semantic `<table>` markup
- [ ] Table has descriptive caption or `aria-label`
- [ ] Table headers use `<th>` with proper `scope` attributes
- [ ] Data cells use `<td>` elements
- [ ] Row headers identified with `scope="row"` where applicable
- [ ] Action buttons in table rows have contextual `aria-label` (include row context)
- [ ] Empty table state has descriptive message
- [ ] Loading skeleton maintains table structure (assistive tech knows it's a table)

#### Color Contrast

- [ ] All text meets WCAG 2.1 AA contrast ratio (4.5:1 for normal text, 3:1 for large text)
- [ ] Status badges meet WCAG 2.1 AA contrast for text
- [ ] Focus indicators meet WCAG 2.1 AA contrast for UI components (3:1)
- [ ] Error messages meet WCAG 2.1 AA contrast
- [ ] Disabled states meet WCAG 2.1 AA contrast (or use other indicators)
- [ ] Light theme meets contrast requirements
- [ ] Dark theme meets contrast requirements
- [ ] High contrast mode (Windows) works correctly

#### Testing Requirements

- [ ] Automated testing: axe DevTools scan passes with 0 errors
- [ ] Automated testing: Lighthouse Accessibility audit scores 100
- [ ] Automated testing: WAVE browser extension reports 0 errors
- [ ] Manual testing: NVDA screen reader (Windows) successfully navigates all components
- [ ] Manual testing: JAWS screen reader (Windows) successfully navigates all components
- [ ] Manual testing: VoiceOver screen reader (macOS) successfully navigates all components
- [ ] Manual testing: All features accessible via keyboard only (no mouse)
- [ ] Manual testing: Tab order is logical throughout all components
- [ ] Manual testing: Focus indicators visible on all interactive elements
- [ ] Manual testing: Status changes announced by screen readers
- [ ] Manual testing: Modals trap focus correctly
- [ ] Manual testing: Modals return focus on close
- [ ] Manual testing: Forms can be filled and submitted via keyboard
- [ ] Manual testing: Zoom to 200% maintains layout and functionality
- [ ] Manual testing: Zoom to 400% maintains readability (WCAG 2.1 AA requirement)
- [ ] Manual testing: Windows High Contrast mode works correctly
- [ ] Documentation: Accessibility testing checklist completed and documented
- [ ] No TypeScript compilation errors
- [ ] No ESLint warnings (including accessibility linting rules if configured)

#### Screen Reader Test Scenarios

Test each scenario with NVDA, JAWS, and VoiceOver:

1. **Navigate translation preview panel**
   - [ ] Panel region is announced
   - [ ] Language names are announced
   - [ ] Status badges are announced with full context
   - [ ] Action buttons are announced with descriptive labels

2. **Trigger status change**
   - [ ] Status change is announced (e.g., "French translation has completed successfully")
   - [ ] Announcement doesn't interrupt current reading (polite for success)
   - [ ] Error announcement interrupts current reading (assertive for errors)

3. **Open translation edit modal**
   - [ ] Focus moves to modal
   - [ ] Modal title is announced
   - [ ] Modal description is announced (if present)
   - [ ] Focus lands on first input field
   - [ ] Tab cycles through modal elements only

4. **Fill and submit form**
   - [ ] Field labels are announced
   - [ ] Required status is announced
   - [ ] Field hints are announced
   - [ ] Error messages are announced immediately when validation fails
   - [ ] Success message announced when form saves

5. **Close modal**
   - [ ] Focus returns to trigger button
   - [ ] Trigger button regains focus announcement

---


---

## REQ-E05-032: Add Accessibility Features to Owner Management Interface

**Date**: 2026-01-22 17:08
**Type**: ENHANCEMENT
**Size**: M

### Summary
The owner management interface should provide comprehensive accessibility support including proper labeling, keyboard navigation, screen reader announcements, and focus management to ensure all users can effectively manage properties and content.

### Current Behavior
The owner management interface lacks structured accessibility features, making it difficult or impossible for users relying on assistive technologies to navigate and interact with status indicators, preview panels, and modal dialogs. Keyboard users cannot efficiently navigate between preview sections, and screen reader users receive no feedback when status changes occur.

### Expected Behavior
The interface should provide full accessibility support where:
- All status icons and visual indicators have descriptive ARIA labels that convey their meaning
- Users can navigate through the preview panel using only keyboard controls
- Screen readers announce status changes immediately when they occur
- Modal dialogs properly manage focus when opened and closed, trapping focus within the dialog and returning it to the triggering element upon dismissal
- All interactive elements are reachable and operable via keyboard alone

### User Impact
Property owners and content managers who use assistive technologies or prefer keyboard navigation will be able to fully access and manage their properties and content without barriers. This affects users with visual impairments, motor disabilities, or those who simply prefer keyboard-based workflows.

### Business Value
Ensuring accessibility compliance expands the user base to include users with disabilities, meets legal requirements in many jurisdictions, and demonstrates commitment to inclusive design practices.

### Acceptance Criteria
- [ ] All status icons display appropriate ARIA labels that describe the current state (e.g., "Published", "Draft", "Archived")
- [ ] Preview panel sections can be navigated using Tab, Shift+Tab, and arrow keys where appropriate
- [ ] When content status changes, screen readers announce the new status immediately
- [ ] When a modal opens, focus moves to the first interactive element within the modal
- [ ] When a modal is open, Tab key navigation is confined to elements within the modal
- [ ] When a modal closes, focus returns to the element that triggered the modal
- [ ] All interactive elements have visible focus indicators
- [ ] Color is not the only means of conveying status or information


---

## REQ-E05-033: Write Unit Tests for Translation Hooks

**Date**: 2026-01-22
**Type**: ENHANCEMENT
**Size**: M

### Summary
The translation status hooks (useTranslationStatus and useTranslationRealtime) need comprehensive unit test coverage to ensure reliable behavior, proper error handling, and correct integration with Supabase. These tests should validate hook lifecycle management, state updates, realtime subscriptions, and edge cases using properly mocked Supabase responses.

### Current Behavior
The useTranslationStatus and useTranslationRealtime hooks exist and provide translation status querying and realtime update functionality, but lack unit test coverage. Without tests, there is no automated verification that these hooks correctly handle success cases, error conditions, loading states, subscription cleanup, or changes to input parameters.

### Expected Behavior
Comprehensive unit tests validate all hook behaviors:
- useTranslationStatus correctly fetches and caches translation status data
- useTranslationStatus properly handles loading, success, and error states
- useTranslationStatus responds appropriately to parameter changes (refetching when needed)
- useTranslationRealtime establishes and cleans up Supabase subscriptions correctly
- useTranslationRealtime invokes callback functions when realtime events occur
- useTranslationRealtime handles connection state changes (connecting, connected, disconnected)
- Both hooks gracefully handle authentication failures
- Both hooks correctly filter results based on user ownership
- Mock Supabase client provides predictable responses without actual database calls

### User Impact
Property owners benefit indirectly through improved code reliability. Well-tested hooks reduce the risk of bugs in translation status display and realtime updates, ensuring owners see accurate and timely translation information.

### Business Value
Unit tests increase code quality, reduce regression risk during refactoring, and speed up development by catching bugs early. Tests serve as living documentation of expected hook behavior and make onboarding new developers easier.

### Acceptance Criteria

#### Test File Structure

- [ ] Test file created at `/src/hooks/__tests__/useTranslationStatus.test.tsx`
- [ ] Test file created at `/src/hooks/__tests__/useTranslationRealtime.test.tsx`
- [ ] Both test files use Vitest (or Jest) as the testing framework
- [ ] Both test files use React Testing Library for rendering hooks
- [ ] Test files follow existing testing patterns in the codebase
- [ ] Each test file includes clear describe blocks grouping related test cases
- [ ] Each test case has a descriptive name explaining what behavior is verified

#### useTranslationStatus Hook Tests

**Initial Load and Success States**

- [ ] Test: Hook returns loading state on initial mount
- [ ] Test: Hook fetches translation status when entityId is provided
- [ ] Test: Hook returns success state with data after successful fetch
- [ ] Test: Hook includes summary counts in returned data
- [ ] Test: Hook includes item-level status in returned data
- [ ] Test: Hook returns empty/null data when entityId is not provided and enabled is false

**Error Handling**

- [ ] Test: Hook returns error state when Supabase query fails
- [ ] Test: Hook handles authentication errors (401) appropriately
- [ ] Test: Hook handles permission errors (403) appropriately
- [ ] Test: Hook handles network errors gracefully
- [ ] Test: Hook retries failed requests when retry function is called
- [ ] Test: Error messages are captured and exposed to consuming component

**Parameter Changes and Refetching**

- [ ] Test: Hook refetches data when entityId changes
- [ ] Test: Hook refetches data when propertyId changes
- [ ] Test: Hook does not refetch when unrelated props change
- [ ] Test: Hook cancels in-flight requests when entityId changes
- [ ] Test: Hook respects enabled flag (does not fetch when enabled is false)
- [ ] Test: Hook fetches when enabled changes from false to true

**Caching and Performance**

- [ ] Test: Hook caches results and does not refetch on remount with same parameters
- [ ] Test: Hook cache is properly keyed by entityId and propertyId
- [ ] Test: Hook staleTime configuration prevents unnecessary refetches
- [ ] Test: Hook respects manual refetch/invalidation calls

**Cleanup**

- [ ] Test: Hook cancels pending requests on unmount
- [ ] Test: Hook does not update state after unmount (no memory leaks)

#### useTranslationRealtime Hook Tests

**Subscription Setup**

- [ ] Test: Hook establishes Supabase channel subscription on mount
- [ ] Test: Hook subscribes to correct table based on entityType parameter
- [ ] Test: Hook applies entityId filter to subscription when provided
- [ ] Test: Hook applies propertyId filter to subscription when provided
- [ ] Test: Hook does not subscribe when enabled is false
- [ ] Test: Hook establishes subscription when enabled changes from false to true
- [ ] Test: Hook updates subscription when entityId changes
- [ ] Test: Hook updates subscription when entityType changes

**Realtime Event Callbacks**

- [ ] Test: onInsert callback is invoked when INSERT event occurs
- [ ] Test: onUpdate callback is invoked when UPDATE event occurs
- [ ] Test: onDelete callback is invoked when DELETE event occurs
- [ ] Test: onChange callback is invoked for any event type (INSERT, UPDATE, DELETE)
- [ ] Test: Callback receives correct payload data matching Supabase event structure
- [ ] Test: Multiple callbacks can be registered and all are invoked
- [ ] Test: Callbacks are not invoked for events that do not match filter criteria

**Connection State Management**

- [ ] Test: Hook returns isConnecting state during subscription setup
- [ ] Test: Hook returns isConnected state after successful subscription
- [ ] Test: Hook returns disconnected state when subscription fails
- [ ] Test: onConnectionChange callback is invoked when connection state changes
- [ ] Test: Hook handles reconnection after temporary disconnection
- [ ] Test: Hook exposes connection error information when subscription fails

**Subscription Cleanup**

- [ ] Test: Hook unsubscribes from channel on unmount
- [ ] Test: Hook unsubscribes before resubscribing when parameters change
- [ ] Test: Hook unsubscribes when enabled changes to false
- [ ] Test: Hook does not invoke callbacks after unmount
- [ ] Test: Cleanup function is called exactly once per subscription

**Error Handling**

- [ ] Test: Hook invokes onError callback when subscription error occurs
- [ ] Test: Hook handles invalid entityType gracefully
- [ ] Test: Hook handles authentication errors during subscription setup
- [ ] Test: Hook exposes error state to consuming component

**Integration with useTranslationStatus**

- [ ] Test: onChange callback can trigger refetch in useTranslationStatus
- [ ] Test: Combined hook usage updates data when realtime event occurs
- [ ] Test: Realtime updates do not cause infinite refetch loops

#### Supabase Mocking

**Mock Setup**

- [ ] Mock Supabase client is created using Vitest mocking utilities
- [ ] Mock client provides `.from()` method returning chainable query builder
- [ ] Mock query builder supports `.select()`, `.eq()`, `.in()`, `.order()` methods
- [ ] Mock query builder returns controlled data responses
- [ ] Mock query builder can simulate error responses
- [ ] Mock channel subscription is properly implemented with `.on()` and `.subscribe()` methods
- [ ] Mock channel can trigger simulated realtime events
- [ ] Mock unsubscribe function tracks cleanup calls

**Mock Behaviors**

- [ ] Mock returns success response with translation status data structure
- [ ] Mock returns error response for simulated failures
- [ ] Mock tracks number of query invocations for assertion
- [ ] Mock resets between test cases to ensure isolation
- [ ] Mock channel triggers INSERT events with realistic payload
- [ ] Mock channel triggers UPDATE events with realistic payload
- [ ] Mock channel triggers DELETE events with realistic payload
- [ ] Mock allows testing subscription filter parameters

#### Test Quality and Maintenance

- [ ] All tests pass consistently with no flakiness
- [ ] Test coverage for hooks reaches at least 90% (lines, branches, functions)
- [ ] Tests run in under 2 seconds total for both hook test files
- [ ] Tests are isolated (each test can run independently)
- [ ] Tests use realistic data that matches actual Supabase response shapes
- [ ] Tests include TypeScript types for mock data (no `any` types)
- [ ] Test assertions are specific and meaningful (not just truthy checks)
- [ ] Tests clean up properly (no console warnings about memory leaks)
- [ ] No TypeScript compilation errors in test files
- [ ] No ESLint warnings in test files

#### Documentation

- [ ] Test files include introductory comments explaining what is being tested
- [ ] Complex test cases include inline comments explaining setup or assertions
- [ ] README or test documentation explains how to run hook tests
- [ ] README explains how to update mocks when Supabase schema changes

---


## REQ-E05-034: Write Component Tests for Translation UI

**Date**: 2026-01-22
**Type**: ENHANCEMENT
**Size**: M

### Summary
The translation management UI components (TranslationPreviewPanel, TranslationEditor, TranslationStatusWidget) need comprehensive component test coverage to ensure reliable rendering, user interactions, and state management. These tests should validate component behavior, accessibility, error handling, and integration with translation hooks using properly mocked dependencies.

### Current Behavior
The TranslationPreviewPanel, TranslationEditor, and TranslationStatusWidget components exist and provide translation management functionality, but lack component test coverage. Without tests, there is no automated verification that these components render correctly, handle user interactions properly, display appropriate loading and error states, or integrate correctly with translation hooks and APIs.

### Expected Behavior
Comprehensive component tests validate all UI behaviors:
- TranslationPreviewPanel renders translation data correctly in both read-only and editing modes
- TranslationPreviewPanel displays loading states, empty states, and error messages appropriately
- TranslationEditor allows users to modify translation content and save changes
- TranslationEditor validates user input and shows validation errors
- TranslationEditor handles save success and failure scenarios
- TranslationStatusWidget displays accurate translation status counts (total, completed, pending)
- TranslationStatusWidget updates counts when translation data changes
- All components are accessible (keyboard navigation, screen reader support, ARIA attributes)
- All components handle edge cases gracefully (missing data, network errors, authentication failures)

### User Impact
Property owners benefit from reliable translation management interfaces. Well-tested components reduce the risk of UI bugs, ensure consistent behavior across browsers, and provide confidence that translation workflows (viewing, editing, saving) function correctly. Owners experience fewer frustrations with broken UI interactions or incorrect status displays.

### Business Value
Component tests increase UI reliability, reduce regression risk during refactoring, and speed up development by catching visual and interaction bugs early. Tests serve as living documentation of expected component behavior and make it safer to evolve the UI without breaking existing functionality. Accessibility tests ensure the platform remains usable for all property owners.

### Acceptance Criteria

#### Test File Structure

- [ ] Test file created at `/src/components/TranslationPreviewPanel/__tests__/TranslationPreviewPanel.test.tsx`
- [ ] Test file created at `/src/components/TranslationEditor/__tests__/TranslationEditor.test.tsx`
- [ ] Test file created at `/src/components/TranslationStatusWidget/__tests__/TranslationStatusWidget.test.tsx`
- [ ] All test files use Vitest (or Jest) as the testing framework
- [ ] All test files use React Testing Library for rendering and interaction testing
- [ ] Test files follow existing testing patterns in the codebase
- [ ] Each test file includes clear describe blocks grouping related test cases
- [ ] Each test case has a descriptive name explaining what behavior is verified

#### TranslationPreviewPanel Component Tests

**Rendering and Display**

- [ ] Test: Component renders without crashing when provided valid translation data
- [ ] Test: Component displays translation key (locale) prominently
- [ ] Test: Component displays translated content text correctly
- [ ] Test: Component displays original (source) content for reference
- [ ] Test: Component shows translation metadata (last updated, author) when available
- [ ] Test: Component renders multiple translation entries when given array of translations
- [ ] Test: Component applies correct styling/visual indicators for completed vs pending translations
- [ ] Test: Component displays character count or word count for translations

**Loading and Empty States**

- [ ] Test: Component displays loading spinner when isLoading prop is true
- [ ] Test: Component displays "No translations available" message when data array is empty
- [ ] Test: Component displays placeholder content when translation data is null/undefined
- [ ] Test: Loading state does not show translation content until data is loaded

**Error Handling**

- [ ] Test: Component displays error message when error prop is provided
- [ ] Test: Component shows retry button when error occurs and onRetry callback is provided
- [ ] Test: Clicking retry button invokes onRetry callback
- [ ] Test: Component handles malformed translation data gracefully (missing required fields)

**Read-Only vs Edit Modes**

- [ ] Test: Component displays in read-only mode by default (no edit controls visible)
- [ ] Test: Component shows edit button when editable prop is true and user has permissions
- [ ] Test: Clicking edit button toggles to edit mode
- [ ] Test: Edit mode displays editable text area or input fields
- [ ] Test: Edit mode shows save and cancel buttons
- [ ] Test: Component does not show edit controls when user lacks edit permissions

**User Interactions**

- [ ] Test: Clicking on translation entry expands/collapses details
- [ ] Test: Hovering over translation shows tooltip with additional context (if applicable)
- [ ] Test: Clicking copy button copies translation text to clipboard
- [ ] Test: Component supports keyboard navigation (Tab, Enter, Escape)

**Accessibility**

- [ ] Test: Component has appropriate ARIA labels for screen readers
- [ ] Test: Loading state announces to screen readers via aria-live region
- [ ] Test: Error messages are announced to screen readers
- [ ] Test: Interactive elements (buttons, links) have accessible names
- [ ] Test: Component maintains focus management when toggling between modes

**Integration with Hooks**

- [ ] Test: Component correctly uses useTranslationStatus hook to fetch data
- [ ] Test: Component passes correct entityId and propertyId to hook
- [ ] Test: Component responds to realtime updates when using useTranslationRealtime
- [ ] Test: Component refetches data when refresh action is triggered

#### TranslationEditor Component Tests

**Rendering and Initial State**

- [ ] Test: Component renders without crashing when provided translation item
- [ ] Test: Component displays original content as read-only reference
- [ ] Test: Component displays editable textarea for translation content
- [ ] Test: Textarea is pre-filled with existing translation if available
- [ ] Test: Textarea is empty when creating new translation
- [ ] Test: Component shows target locale indicator (e.g., "Translating to French")
- [ ] Test: Component displays character count or validation feedback

**Form Validation**

- [ ] Test: Save button is disabled when translation content is empty
- [ ] Test: Save button is disabled when content exceeds maximum length
- [ ] Test: Component shows validation error when content is too short
- [ ] Test: Component shows validation error when content contains prohibited characters/patterns
- [ ] Test: Validation messages disappear when user corrects invalid input
- [ ] Test: Component prevents submission of invalid data

**Save Flow - Success**

- [ ] Test: Clicking save button triggers onSave callback with translation data
- [ ] Test: Component shows saving state (disabled inputs, loading spinner) during save
- [ ] Test: Component shows success message after successful save
- [ ] Test: Success message auto-dismisses after timeout
- [ ] Test: Component clears form or exits edit mode after successful save
- [ ] Test: Component updates local state to reflect saved translation

**Save Flow - Failure**

- [ ] Test: Component displays error message when save fails
- [ ] Test: Error message includes server-provided error details when available
- [ ] Test: Form remains editable after save failure (user can retry)
- [ ] Test: Save button re-enables after failed save attempt
- [ ] Test: Component handles network timeout errors gracefully
- [ ] Test: Component handles authentication errors (401) by showing appropriate message

**User Interactions**

- [ ] Test: Typing in textarea updates local state
- [ ] Test: Clicking cancel button discards unsaved changes
- [ ] Test: Clicking cancel button closes editor or returns to read-only mode
- [ ] Test: Component warns user about unsaved changes when attempting to close
- [ ] Test: Pressing Cmd+S (or Ctrl+S) triggers save action
- [ ] Test: Pressing Escape key cancels editing

**Accessibility**

- [ ] Test: Textarea has appropriate label and aria-describedby for validation messages
- [ ] Test: Save and cancel buttons have accessible names
- [ ] Test: Validation errors are announced to screen readers
- [ ] Test: Saving state is announced to screen readers via aria-live
- [ ] Test: Success and error messages are announced to screen readers
- [ ] Test: Focus is managed correctly (returns to trigger element after cancel)

**Edge Cases**

- [ ] Test: Component handles rapid save button clicks (debouncing or disabling)
- [ ] Test: Component handles simultaneous edits (optimistic updates vs server state)
- [ ] Test: Component recovers gracefully from unexpected API responses
- [ ] Test: Component handles missing or incomplete translation item data

#### TranslationStatusWidget Component Tests

**Rendering and Display**

- [ ] Test: Component renders without crashing when provided status summary
- [ ] Test: Component displays total translation count
- [ ] Test: Component displays completed translation count
- [ ] Test: Component displays pending/incomplete translation count
- [ ] Test: Component displays counts as numbers (not raw API data)
- [ ] Test: Component shows visual progress indicator (e.g., progress bar or percentage)
- [ ] Test: Component uses color coding or icons to indicate status (green for complete, yellow for pending)

**Data Updates**

- [ ] Test: Component updates counts when status summary prop changes
- [ ] Test: Component recalculates percentage when counts change
- [ ] Test: Component animates count changes (if animation is implemented)
- [ ] Test: Component updates in realtime when integrated with useTranslationRealtime hook

**Loading and Empty States**

- [ ] Test: Component displays loading skeleton when isLoading prop is true
- [ ] Test: Component displays "No data" or zero counts when status is empty/null
- [ ] Test: Component handles undefined or missing status properties gracefully

**Error Handling**

- [ ] Test: Component displays error icon or message when error prop is provided
- [ ] Test: Component shows tooltip explaining error on hover
- [ ] Test: Component provides retry action when error occurs

**User Interactions**

- [ ] Test: Clicking widget navigates to detailed translation view (if clickable)
- [ ] Test: Hovering over widget shows tooltip with breakdown details
- [ ] Test: Widget supports keyboard interaction (focus, Enter to activate)

**Accessibility**

- [ ] Test: Component has appropriate ARIA role (e.g., status or region)
- [ ] Test: Counts have accessible labels (e.g., "5 of 10 translations complete")
- [ ] Test: Visual-only indicators (colors, icons) have text alternatives
- [ ] Test: Status changes are announced to screen readers via aria-live

**Edge Cases**

- [ ] Test: Component handles zero total count (division by zero in percentage)
- [ ] Test: Component handles negative counts gracefully (should not occur but defensive)
- [ ] Test: Component handles very large numbers (formatting with abbreviations like "1.2k")
- [ ] Test: Component handles incomplete status data (missing pending or completed fields)

#### Mock Setup and Test Utilities

**Translation Hook Mocks**

- [ ] Mock useTranslationStatus hook returns controlled data for testing
- [ ] Mock useTranslationRealtime hook simulates realtime events
- [ ] Mocks can be configured per-test to return success, loading, or error states
- [ ] Mocks track function calls (onSave, onRetry, etc.) for assertions

**API Mocks**

- [ ] Mock fetch or Supabase client for API calls in TranslationEditor save flow
- [ ] Mocks can simulate successful save responses
- [ ] Mocks can simulate error responses (400, 401, 500)
- [ ] Mocks can simulate network timeout or connection errors

**Next-Intl Mocks**

- [ ] Mock useTranslations hook returns test translation function
- [ ] Translation function returns keys as-is or uses test translation strings
- [ ] Mock supports namespaced translation keys used in components

**Router Mocks**

- [ ] Mock Next.js router for navigation tests (if components use router)
- [ ] Mock router tracks navigation calls for assertion

#### Test Quality and Maintenance

- [ ] All tests pass consistently with no flakiness
- [ ] Test coverage for components reaches at least 85% (lines, branches, functions)
- [ ] Tests run in under 5 seconds total for all three component test files
- [ ] Tests are isolated (each test can run independently)
- [ ] Tests use realistic data that matches actual component prop types
- [ ] Tests include TypeScript types for mock data (no `any` types)
- [ ] Test assertions are specific and meaningful (not just truthy checks)
- [ ] Tests clean up properly (no console warnings about memory leaks or act warnings)
- [ ] No TypeScript compilation errors in test files
- [ ] No ESLint warnings in test files

#### Visual Regression Testing (Optional)

- [ ] Component snapshots are created for key rendering states (optional)
- [ ] Snapshots are reviewed for unintended visual changes
- [ ] Snapshot tests complement behavior tests (do not replace them)

#### Documentation

- [ ] Test files include introductory comments explaining component under test
- [ ] Complex test cases include inline comments explaining setup or assertions
- [ ] README or test documentation explains how to run component tests
- [ ] README explains how to update mocks when component APIs change

---

