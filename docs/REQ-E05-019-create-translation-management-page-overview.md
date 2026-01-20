# REQ-E05-019: Create Translation Management Page - Implementation Overview

**Document Created:** 2026-01-20 09:15 UTC
**Last Modified:** 2026-01-20 09:15 UTC
**Request Reference:** Epic 5 - Owner Translation Management, Phase 4 Task 4.3
**Implementation Plan Reference:** Plan-111-L10N-Epic5-Owner-Translation-Management.md

---

## Summary

Create a dedicated Translation Management page at `/src/app/dashboard2/translations/page.tsx` that provides property owners with a centralized interface to view, manage, and take action on translations across all their content (items, articles, links). The page features a full-width table with translation status indicators for all six supported languages, comprehensive filtering capabilities, and bulk selection support for efficient multilingual content management.

---

## Current State Analysis

### What Exists

1. **Dashboard2 Layout Pattern** (`/src/app/dashboard2/layout.tsx`)
   - Established navigation structure with 4 tabs (Dashboard, Items, Guides, Properties)
   - Uses `PropertyProvider` and `AuthProvider` contexts
   - Consistent header, navigation, and content area styling
   - Navigation items configured via `navigationItems` array

2. **Items Page Pattern** (`/src/app/dashboard2/items/page.tsx`)
   - Client component pattern with `'use client'` directive
   - Uses `useAuth`, `useAccountContext`, `usePropertyContext` hooks
   - State management: `items`, `loading`, `error` with useState
   - Integrates `ItemManager` component for table/grid display
   - Data fetching with `useCallback` + `useEffect` pattern

3. **ItemManager Component** (`/src/components/ItemManager/ItemManager.tsx`)
   - Comprehensive orchestrating component for data tables
   - Supports grid/list view modes, search, filtering, sorting
   - Bulk selection with `BulkActionsBar` component
   - Custom hooks: `useItemManagerState`, `useItemSearch`, `useColumnVisibility`
   - Dialogs: `ConfirmDeleteDialog`, `BulkTagDialog`, `BulkMoveDialog`

4. **Translation Service Types** (`/src/lib/translation-service/translation-service.types.ts`)
   - `SupportedLanguage` type: `'en' | 'fr' | 'es' | 'de' | 'nl' | 'it'`
   - `TranslationStatus` type: `'pending' | 'processing' | 'completed' | 'failed' | 'manual'`
   - `TranslatableEntityType`: `'article' | 'item' | 'link' | 'tag'`
   - `SUPPORTED_LANGUAGES` constant with metadata (name, nativeName, flag, rtl)
   - Database record types: `ArticleTranslationRecord`, `ItemTranslationRecord`, `LinkTranslationRecord`

5. **Job Queue Types** (`/src/lib/job-queue/translation-jobs.types.ts`)
   - `EntityType`: `'article' | 'item' | 'link' | 'tag'`
   - `JobStatus`: `'queued' | 'processing' | 'completed' | 'failed'`
   - `TranslationJob` interface with lock support

### What Doesn't Exist

1. `/src/app/dashboard2/translations/page.tsx` - The translation management page
2. TranslationManagement components directory - No existing components
3. Translation status API endpoint - `/api/translations/status`
4. useTranslationStatus hook - For fetching translation status data
5. Navigation item for "Translations" in dashboard layout

---

## Dependencies

### Required from Epic 1 (Foundation)
- Translation tables in database: `article_translations`, `item_translations`, `link_translations`
- Translation service types and constants
- `SupportedLanguage` and `TranslationStatus` types

### Required from Epic 3 (Dynamic Content Translation)
- Translation status tracking in database
- Translation job queue system

### Required from Epic 5 (Earlier Tasks)
- **REQ-E05-001**: Translation Status API Endpoint (GET `/api/translations/status`)
- **REQ-E05-006**: TranslationManagement.types.ts (shared type definitions)
- **REQ-E05-007**: TranslationPreviewPanel component (for row click action)
- **REQ-E05-011**: useTranslationStatus hook (for data fetching)
- **REQ-E05-014**: TranslationStatusColumn component (for table column)
- **REQ-E05-015**: TranslationStatusFilter component (for filtering)
- **REQ-E05-018**: BulkTranslationBar component (for bulk actions)
- **REQ-E05-019**: LanguageSelectorDialog component (for targeted bulk operations)

---

## Proposed Implementation

### 1. File Structure

```
/src/app/dashboard2/translations/
└── page.tsx                              # Translation Management page

/src/components/TranslationManagement/    # (created in earlier tasks)
├── index.ts
├── TranslationManagement.types.ts
├── TranslationPreviewPanel/
├── TranslationStatusColumn/
├── TranslationStatusFilter/
└── BulkTranslationBar/
```

### 2. Page Component Structure

```typescript
// /src/app/dashboard2/translations/page.tsx
'use client';

export default function TranslationsPage() {
  // Contexts
  const { user } = useAuth();
  const { currentAccount } = useAccountContext();
  const { selectedPropertyId } = usePropertyContext();

  // State
  const [entities, setEntities] = useState<TranslationEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewEntity, setPreviewEntity] = useState<TranslationEntity | null>(null);

  // Filters
  const [filters, setFilters] = useState<TranslationFilterState>({
    entityType: 'all',
    status: 'all',
    language: null,
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Data fetching
  const fetchTranslationData = useCallback(async () => { ... }, []);

  // Handlers
  const handleSelectionChange = useCallback((id: string, selected: boolean) => { ... }, []);
  const handleSelectAll = useCallback(() => { ... }, []);
  const handleClearSelection = useCallback(() => { ... }, []);
  const handleRowClick = useCallback((entity: TranslationEntity) => { ... }, []);
  const handleFilterChange = useCallback((newFilters: TranslationFilterState) => { ... }, []);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Translation Management</h1>
        <p className="text-gray-600 mt-1">Manage translations across all your content</p>
      </div>

      {/* Filter Bar */}
      <TranslationFilterBar
        filters={filters}
        onFiltersChange={handleFilterChange}
        resultCount={entities.length}
      />

      {/* Translation Table */}
      <TranslationTable
        entities={entities}
        loading={loading}
        selectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
        onRowClick={handleRowClick}
        onSelectAll={handleSelectAll}
      />

      {/* Bulk Actions Bar */}
      <BulkTranslationBar
        selectedCount={selectedIds.size}
        selectedIds={Array.from(selectedIds)}
        entityType="mixed"
        onComplete={handleBulkComplete}
        onExitSelection={handleClearSelection}
      />

      {/* Translation Preview Panel */}
      <TranslationPreviewPanel
        entityType={previewEntity?.entityType}
        entityId={previewEntity?.entityId}
        isOpen={!!previewEntity}
        onClose={() => setPreviewEntity(null)}
      />
    </div>
  );
}
```

### 3. Table Structure

The table displays the following columns:

| Column | Description | Width |
|--------|-------------|-------|
| Checkbox | Row selection | 40px |
| Name | Entity name/title with link | flex-grow |
| Type | Entity type icon + label | 100px |
| EN | English translation status | 60px |
| ES | Spanish translation status | 60px |
| FR | French translation status | 60px |
| DE | German translation status | 60px |
| IT | Italian translation status | 60px |
| NL | Dutch translation status | 60px |
| Actions | View/Edit/Re-translate | 120px |

### 4. Filter Bar Options

```typescript
interface TranslationFilterState {
  entityType: 'all' | 'item' | 'article' | 'link';
  status: 'all' | 'fully_translated' | 'partially_translated' | 'pending' | 'failed' | 'manual';
  language: SupportedLanguage | null; // Filter by missing specific language
}
```

### 5. Data Type

```typescript
interface TranslationEntity {
  id: string;                               // Composite key: `${entityType}:${entityId}`
  entityType: 'item' | 'article' | 'link';
  entityId: string;
  name: string;                             // Display name
  sourceLanguage: SupportedLanguage;
  createdAt: string;
  translations: {
    [K in SupportedLanguage]?: {
      status: TranslationStatus;
      isStale?: boolean;
      translatedAt?: string;
      reviewedBy?: string;
    };
  };
}
```

### 6. API Integration

The page fetches data from the Translation Status API:

```typescript
// GET /api/translations/status?propertyId={propertyId}&entityType={type}&status={status}

interface TranslationStatusResponse {
  summary: {
    total: number;
    complete: number;
    partial: number;
    pending: number;
    failed: number;
  };
  items: TranslationEntity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}
```

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/dashboard2/translations/page.tsx` | Main Translation Management page component |

### Files to Modify

| File Path | Changes Required |
|-----------|------------------|
| `/src/app/dashboard2/layout.tsx` | Add "Translations" navigation item to `navigationItems` array |

### Components to Import (Created in Earlier Tasks)

| Component | Source | Usage |
|-----------|--------|-------|
| `TranslationPreviewPanel` | `/src/components/TranslationManagement/TranslationPreviewPanel/` | Slide-in panel for detailed view |
| `TranslationStatusColumn` | `/src/components/TranslationManagement/TranslationStatusColumn/` | Language status indicators in table |
| `TranslationStatusFilter` | `/src/components/TranslationManagement/TranslationStatusFilter/` | Filter dropdown in toolbar |
| `BulkTranslationBar` | `/src/components/TranslationManagement/BulkTranslationBar/` | Bulk action bar when items selected |
| `LanguageSelectorDialog` | `/src/components/TranslationManagement/BulkTranslationBar/` | Language selection for bulk ops |

### Hooks to Use

| Hook | Source | Usage |
|------|--------|-------|
| `useAuth` | `/src/contexts/AuthContext` | Authentication context |
| `useAccountContext` | `/src/contexts/AuthContext` | Account context for API headers |
| `usePropertyContext` | `/src/hooks/usePropertyContext` | Property filter context |
| `useTranslationStatus` | `/src/hooks/useTranslationStatus` | Fetch translation status data |
| `useTranslationRealtime` | `/src/hooks/useTranslationRealtime` | Realtime updates subscription |

### Types to Import

| Type | Source |
|------|--------|
| `SupportedLanguage` | `/src/lib/translation-service/translation-service.types.ts` |
| `TranslationStatus` | `/src/lib/translation-service/translation-service.types.ts` |
| `SUPPORTED_LANGUAGES` | `/src/lib/translation-service/translation-service.types.ts` |
| `TranslatableEntityType` | `/src/lib/translation-service/translation-service.types.ts` |

---

## Implementation Tasks

### Task 1: Create Page File Structure
- Create `/src/app/dashboard2/translations/page.tsx`
- Add `'use client'` directive
- Set up basic component structure with contexts

### Task 2: Implement Filter Bar
- Create filter bar with three dropdowns:
  - Content Type: All, Items, Articles, Links
  - Translation Status: All, Fully Translated, Partially, Pending, Failed, Manual
  - Language: Filter by missing specific language
- Wire up filter state and onChange handlers

### Task 3: Implement Translation Table
- Create table structure with columns as specified
- Add sortable column headers (Name, Type, Created)
- Integrate `TranslationStatusColumn` for each language column
- Add checkbox column for bulk selection
- Implement select all/none functionality

### Task 4: Implement Row Actions
- Click on entity name → Navigate to entity edit page
- Click on language status → Open `TranslationPreviewPanel`
- Action column buttons: View Details, Re-translate

### Task 5: Implement Bulk Selection
- Selection state management with `Set<string>`
- Select All checkbox in header (selects visible/filtered items)
- Individual row checkboxes
- Selection count display

### Task 6: Integrate BulkTranslationBar
- Show bar when `selectedIds.size > 0`
- Connect Re-translate All and Re-translate Specific Language actions
- Handle "Skip Manual Edits" option
- Show progress during bulk operations

### Task 7: Integrate TranslationPreviewPanel
- Show panel on language status click
- Pass entity reference (entityType, entityId)
- Handle panel close

### Task 8: Implement Data Fetching
- Use `useTranslationStatus` hook for initial data
- Use `useTranslationRealtime` hook for live updates
- Implement pagination or infinite scroll
- Handle loading and error states

### Task 9: Add Navigation Item
- Update `/src/app/dashboard2/layout.tsx`
- Add "Translations" to `navigationItems` array
- Use `Globe` icon from lucide-react
- Route: `/dashboard2/translations`

### Task 10: Implement Empty States
- No content created yet
- No matching results for current filters
- Clear calls-to-action

---

## UI Specifications

### Page Layout
- Full-width table (no sidebar)
- Maximum content width follows dashboard pattern (`max-w-7xl`)
- Responsive design with horizontal scroll on mobile

### Table Styling
- Table headers: `text-sm font-medium text-gray-500`
- Table rows: `hover:bg-gray-50` with click handler
- Selected rows: `bg-blue-50`
- Alternating row colors: optional

### Status Indicators (per PRD)
| Status | Color | Tailwind Class |
|--------|-------|----------------|
| Completed | Green | `text-green-500` (#22C55E) |
| Manual | Purple | `text-violet-500` (#8B5CF6) |
| Pending | Orange | `text-amber-500` (#F59E0B) |
| Failed | Red | `text-red-500` (#EF4444) |
| Not Started | Gray | `text-gray-300` (#D1D5DB) |

### Filter Bar Placement
- Above table, inline with page header or below
- Dropdown styling consistent with ItemManager FilterPanel

### Bulk Actions Bar
- Fixed position at bottom of viewport
- Slide-up animation (300ms)
- Same styling as ItemManager BulkActionsBar

---

## Acceptance Criteria

Based on REQ-E05-020 from gen_requests_epic5.md:

- [ ] Page route created at `/src/app/dashboard2/translations/page.tsx`
- [ ] Page layout uses full-width content area without sidebars
- [ ] Table displays all content entities accessible to current property owner
- [ ] Table includes column for entity name displaying title or identifier
- [ ] Table includes column for entity type showing "Item", "Article", or "Link" with icon
- [ ] Table includes six individual columns for language status (EN, ES, FR, DE, IT, NL)
- [ ] Each language column displays status indicator using standard color scheme
- [ ] Table includes Actions column with quick access controls
- [ ] Filter bar renders above table with three filter controls
- [ ] Content type filter dropdown offers options: All Types, Items, Articles, Links
- [ ] Language filter dropdown offers options to show content missing specific language
- [ ] Status filter dropdown offers options: All, Fully Translated, Partially, Pending, Failed, Manual
- [ ] Each table row includes checkbox for bulk selection
- [ ] Checkbox in table header selects/deselects all visible rows
- [ ] Selected row count displays when items are selected
- [ ] BulkTranslationBar component appears when items are selected
- [ ] Table supports pagination or infinite scroll for large catalogs
- [ ] Table displays loading skeleton during initial data fetch
- [ ] Table displays empty state when no content matches filters
- [ ] Empty state includes call-to-action to create content or adjust filters
- [ ] Table is sortable by clicking column headers
- [ ] Clicking entity name navigates to entity detail/edit page
- [ ] Clicking language status cell opens TranslationPreviewPanel
- [ ] Page integrates with translation status API endpoint
- [ ] Page implements efficient data fetching strategy
- [ ] Page updates in real-time when translation jobs complete
- [ ] Table is responsive and adapts layout for tablet viewports
- [ ] Page header includes title "Translation Management"
- [ ] Filter selections persist in URL query parameters for shareable views
- [ ] Page is fully keyboard accessible with proper focus management
- [ ] Page includes appropriate ARIA labels and semantic HTML
- [ ] Page performance remains acceptable with large datasets (<3s for 500+ items)

---

## Testing Considerations

### Unit Tests
- Filter state management
- Selection state management
- Data transformation functions

### Integration Tests
- API data fetching
- Filter + API query parameter mapping
- Bulk action API calls

### E2E Tests
- Page navigation from dashboard
- Filter application and results
- Bulk selection workflow
- Preview panel open/close

### Accessibility Tests
- Keyboard navigation through table
- Screen reader announcements for selection changes
- Focus management on modal/panel open/close

---

## Performance Considerations

1. **Efficient Data Fetching**
   - Implement pagination (page + limit)
   - Only fetch visible rows
   - Use bulk status endpoint instead of per-entity calls

2. **Realtime Updates**
   - Debounce rapid successive updates (100ms)
   - Only subscribe to relevant entity changes
   - Cleanup subscriptions on unmount

3. **Selection State**
   - Use `Set<string>` for O(1) selection lookup
   - Memoize selected items array

4. **Table Rendering**
   - Consider virtualization for 500+ rows
   - Memoize row components

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation Status API not ready | Medium | High | Stub API with mock data during development |
| Component dependencies not complete | Medium | High | Create inline implementations as fallback |
| Large dataset performance | Low | Medium | Implement pagination, virtualization if needed |
| Realtime subscription reliability | Low | Low | Fallback to polling, manual refresh button |

---

## References

- **Request:** `/docs/gen_requests_epic5.md` (REQ-E05-020)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Pattern Reference:** `/src/app/dashboard2/items/page.tsx`
- **Component Reference:** `/src/components/ItemManager/ItemManager.tsx`
- **Type Reference:** `/src/lib/translation-service/translation-service.types.ts`
