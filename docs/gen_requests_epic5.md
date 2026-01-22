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

