# Implementation Overview: Create Translation Management Page

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E05-020 |
| Source File | docs/gen_requests_epic5.md |
| Original Request Date | 2026-01-22 |
| Breakdown Created | 2026-01-22 19:58 |
| T-shirt Size | L (Large) |
| Estimated Effort | 18-22 hours |
| Phase | Phase 4 - Bulk Operations & Management Page |
| Task ID | 4.3 |
| Status | PENDING |

---

## Goals

Create a dedicated Translation Management page at `/dashboard2/translations` that provides property owners with a centralized view of all their translatable content (items and articles) with translation status indicators across all supported languages. The page enables efficient translation management through filtering, sorting, bulk selection, and integration with bulk translation operations.

### Technical Goals

1. **Comprehensive Overview**: Display all items and articles in a filterable table with per-language translation status
2. **Efficient Filtering**: Filter by content type (items/articles), language completeness, translation status, and text search
3. **Bulk Operations**: Support multi-select with integration to BulkTranslationBar for batch re-translation
4. **Visual Status Indicators**: Clear, at-a-glance status badges for each language column
5. **Responsive Data Fetching**: Use batch translation status API to avoid N+1 queries
6. **URL State Management**: Shareable URLs with filter state in query parameters
7. **Dashboard Integration**: Seamless integration with existing dashboard2 layout and navigation

---

## Assumptions & Clarifications

### Assumptions

1. **API Availability**: The batch translation status API endpoint (`/api/translations/status/batch`) from REQ-E05-001 is implemented and returns data in the expected format
2. **Language Set**: Using the canonical set from `translation-service.types.ts`: `['es', 'fr', 'de', 'nl', 'it']` (5 target languages, excluding 'en' source)
3. **Property Context**: Users only see content from their selected property via `PropertyContext`
4. **Pagination**: Server-side pagination not required initially (client-side pagination with reasonable limits is acceptable)
5. **Hierarchical Display**: Articles are displayed as child rows indented under their parent items
6. **Desktop-First**: Initial focus on desktop/tablet experience, with basic mobile responsiveness

### Clarifications Needed

- **Item**: Should the language list match the spec's mention of "PT" (Portuguese) or use the codebase's "IT" (Italian)? **Resolution**: Use `translation-service.types.ts` as source of truth (Italian, not Portuguese)
- **Item**: What is the preferred empty state when a property has no items? Show "Create your first item" CTA or just informational text?
- **Item**: Should the page support deep linking to specific filters (e.g., `/dashboard2/translations?status=stale&language=es`)?

---

## Implementation Plan

### Step 1: Create Page File and Route Structure
**Description**: Set up the Next.js App Router page file at `/src/app/dashboard2/translations/page.tsx` as a client component with basic structure
**Rationale**: Establishes the route and page foundation before adding complex features
**Estimated Effort**: S (1 hour)

**Details:**
- Create file: `/src/app/dashboard2/translations/page.tsx`
- Add `'use client'` directive (required for state management and data fetching)
- Set up basic page structure with proper metadata
- Import necessary dependencies (React, next-intl, lucide-react icons)
- Add JSDoc header with creation date, REQ reference, and description

**Success Criteria:**
- Page is accessible at `/dashboard2/translations`
- Page renders within Dashboard2Layout (sidebar, header, property dropdown visible)
- No console errors or TypeScript errors

---

### Step 2: Define TypeScript Types and Interfaces
**Description**: Define all TypeScript interfaces for filters, table rows, status types, and component props
**Rationale**: Type safety foundation prevents runtime errors and enables IDE autocomplete
**Estimated Effort**: S (1 hour)

**Types to Define:**

```typescript
// Filter state
interface TranslationPageFilters {
  contentType: 'all' | 'item' | 'article';
  language: SupportedLanguage | 'all';
  status: 'all' | 'complete' | 'pending' | 'missing' | 'stale';
  search: string;
}

// Table row data
interface TranslationRow {
  id: string; // Format: "{entityType}:{entityId}"
  entityType: 'item' | 'article';
  entityId: string;
  name: string;
  parentName?: string; // For articles: parent item name
  propertyId: string;
  translations: {
    [K in SupportedLanguage]?: {
      status: 'complete' | 'pending' | 'stale' | 'manual' | 'missing';
      updatedAt?: Date;
    };
  };
  sourceUpdatedAt: Date;
}

// Status badge configuration
interface StatusBadge {
  icon: string;
  color: string;
  label: string;
  bgColor: string;
  textColor: string;
}

// Sort options
type TranslationSortOption =
  | 'name-asc'
  | 'name-desc'
  | 'updated-asc'
  | 'updated-desc'
  | 'type-asc'
  | 'type-desc';
```

**Source Reference:**
- Lines 3066-3103 from gen_requests_epic5.md
- `SupportedLanguage` type from `/src/lib/translation-service/translation-service.types.ts`

---

### Step 3: Implement Data Fetching Hook (useTranslationData)
**Description**: Create a custom hook to fetch translation status data from the batch API endpoint
**Rationale**: Separates data fetching logic from UI, enables loading states, error handling, and re-fetching
**Estimated Effort**: M (2-3 hours)

**Hook Signature:**
```typescript
function useTranslationData(propertyId: string | null) {
  const [data, setData] = useState<TranslationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    // Fetch logic
  }, [propertyId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
```

**Implementation Details:**
1. Use `usePropertyContext()` to get `selectedPropertyId`
2. Fetch items and articles for the property via existing API endpoints:
   - Items: `/api/admin/items?propertyId={propertyId}`
   - Articles: `/api/admin/articles?propertyId={propertyId}`
3. Build entity specifications array from items + articles
4. Call batch translation status API: `POST /api/translations/status/batch`
5. Transform response to `TranslationRow[]` format with parent name lookups
6. Handle loading states and errors with proper TypeScript types

**API Reference:**
- Pattern from `/src/app/dashboard2/items/page.tsx` (lines 35-90)
- Batch API from `/src/app/api/translations/status/batch/route.ts`

---

### Step 4: Implement Filter State Management
**Description**: Set up React state for filters with URL query parameter synchronization
**Rationale**: Enables shareable links and maintains filter state across navigation
**Estimated Effort**: M (2 hours)

**State Management:**
```typescript
const [filters, setFilters] = useState<TranslationPageFilters>({
  contentType: 'all',
  language: 'all',
  status: 'all',
  search: '',
});

// Sync with URL query params
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  setFilters({
    contentType: (params.get('type') as TranslationPageFilters['contentType']) || 'all',
    language: (params.get('lang') as SupportedLanguage | 'all') || 'all',
    status: (params.get('status') as TranslationPageFilters['status']) || 'all',
    search: params.get('search') || '',
  });
}, []);

// Update URL when filters change
useEffect(() => {
  const params = new URLSearchParams();
  if (filters.contentType !== 'all') params.set('type', filters.contentType);
  if (filters.language !== 'all') params.set('lang', filters.language);
  if (filters.status !== 'all') params.set('status', filters.status);
  if (filters.search) params.set('search', filters.search);

  const query = params.toString();
  const newUrl = query ? `?${query}` : window.location.pathname;
  window.history.replaceState({}, '', newUrl);
}, [filters]);
```

**Features:**
- Debounce search input (500ms) to avoid excessive filtering
- Deep linking support for sharing filtered views
- Preserve filter state on page reload

---

### Step 5: Implement Filter Bar Component
**Description**: Create the filter bar UI with dropdowns for type, language, status, and search input
**Rationale**: Primary user interface for narrowing down the content list
**Estimated Effort**: M (2-3 hours)

**Component Structure:**
```tsx
<div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
  <div className="flex flex-col sm:flex-row gap-4">
    {/* Type Filter */}
    <select
      value={filters.contentType}
      onChange={(e) => handleFilterChange('contentType', e.target.value)}
      className="..."
    >
      <option value="all">{t('filters.type.all')}</option>
      <option value="item">{t('filters.type.items')}</option>
      <option value="article">{t('filters.type.articles')}</option>
    </select>

    {/* Language Filter */}
    <select
      value={filters.language}
      onChange={(e) => handleFilterChange('language', e.target.value)}
      className="..."
    >
      <option value="all">{t('filters.language.all')}</option>
      {TARGET_LANGUAGES.map(lang => (
        <option key={lang} value={lang}>
          {t(`languages.${lang}`)}
        </option>
      ))}
    </select>

    {/* Status Filter */}
    <select
      value={filters.status}
      onChange={(e) => handleFilterChange('status', e.target.value)}
      className="..."
    >
      <option value="all">{t('filters.status.all')}</option>
      <option value="complete">{t('filters.status.complete')}</option>
      <option value="pending">{t('filters.status.pending')}</option>
      <option value="missing">{t('filters.status.missing')}</option>
      <option value="stale">{t('filters.status.stale')}</option>
    </select>

    {/* Search Input */}
    <input
      type="search"
      placeholder={t('filters.searchPlaceholder')}
      value={filters.search}
      onChange={(e) => handleSearchChange(e.target.value)}
      className="..."
    />

    {/* Results Count */}
    <div className="text-sm text-gray-600 self-center">
      {t('filters.resultCount', { count: filteredRows.length })}
    </div>
  </div>
</div>
```

**Pattern Reference:**
- Native `<select>` elements (pattern from RoomSelector.tsx)
- Tailwind CSS form styling
- next-intl for all labels

---

### Step 6: Implement Client-Side Filtering Logic
**Description**: Filter the fetched data based on current filter state
**Rationale**: Fast, responsive filtering without additional API calls
**Estimated Effort**: M (2 hours)

**Filter Logic:**
```typescript
const filteredRows = useMemo(() => {
  return data.filter(row => {
    // Content type filter
    if (filters.contentType !== 'all' && row.entityType !== filters.contentType) {
      return false;
    }

    // Language filter (any language must match status)
    if (filters.language !== 'all') {
      const langStatus = row.translations[filters.language];
      if (!langStatus || langStatus.status === 'missing') {
        return false;
      }
    }

    // Status filter (at least one language has this status)
    if (filters.status !== 'all') {
      const hasStatus = TARGET_LANGUAGES.some(lang => {
        const translation = row.translations[lang];
        if (filters.status === 'missing') {
          return !translation || translation.status === 'missing';
        }
        return translation?.status === filters.status;
      });
      if (!hasStatus) {
        return false;
      }
    }

    // Search filter (case-insensitive name match)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!row.name.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    return true;
  });
}, [data, filters]);
```

**Performance:**
- Use `useMemo` to prevent re-filtering on every render
- Dependencies: `[data, filters]`

---

### Step 7: Implement Bulk Selection State
**Description**: Set up selection state management for checkboxes and Select All functionality
**Rationale**: Enables bulk operations on multiple items
**Estimated Effort**: S (1 hour)

**State Management:**
```typescript
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

const handleSelectAll = useCallback((checked: boolean) => {
  if (checked) {
    setSelectedIds(new Set(filteredRows.map(row => row.id)));
  } else {
    setSelectedIds(new Set());
  }
}, [filteredRows]);

const handleSelectRow = useCallback((id: string, checked: boolean) => {
  setSelectedIds(prev => {
    const next = new Set(prev);
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    return next;
  });
}, []);

const isAllSelected = filteredRows.length > 0 &&
  filteredRows.every(row => selectedIds.has(row.id));

const isSomeSelected = filteredRows.some(row => selectedIds.has(row.id)) &&
  !isAllSelected;
```

**Pattern Reference:**
- Selection state from ItemManager (REQ-068)
- Use `Set<string>` for O(1) lookup performance

---

### Step 8: Create Translation Status Badge Component
**Description**: Reusable component for displaying status indicators in language columns
**Rationale**: Consistent visual representation of translation states
**Estimated Effort**: S (1 hour)

**Component:**
```tsx
interface StatusBadgeProps {
  status: 'complete' | 'pending' | 'stale' | 'manual' | 'missing';
  compact?: boolean;
}

const STATUS_CONFIG: Record<StatusBadgeProps['status'], StatusBadge> = {
  complete: {
    icon: '✓',
    color: 'green',
    label: 'Complete',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  pending: {
    icon: '⏳',
    color: 'yellow',
    label: 'Pending',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
  },
  stale: {
    icon: '⚠',
    color: 'orange',
    label: 'Stale',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
  },
  manual: {
    icon: '✎',
    color: 'blue',
    label: 'Manual',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
  missing: {
    icon: '-',
    color: 'gray',
    label: 'Missing',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-500',
  },
};

function StatusBadge({ status, compact = false }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  if (compact) {
    return (
      <span
        className={cn('text-lg', config.textColor)}
        title={config.label}
        aria-label={config.label}
      >
        {config.icon}
      </span>
    );
  }

  return (
    <span className={cn('px-2 py-1 rounded text-xs font-medium', config.bgColor, config.textColor)}>
      {config.icon} {config.label}
    </span>
  );
}
```

**Spec Reference:**
- Lines 3167-3176 from gen_requests_epic5.md

---

### Step 9: Create Translation Table Component
**Description**: Build the main table component with sortable headers, language columns, and action buttons
**Rationale**: Core UI element displaying translation status
**Estimated Effort**: L (4-5 hours)

**Table Structure:**
```tsx
<div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="w-12">
            <input
              type="checkbox"
              checked={isAllSelected}
              indeterminate={isSomeSelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
          </th>
          <th>
            <SortableHeader label="Name" sortKey="name" />
          </th>
          {TARGET_LANGUAGES.map(lang => (
            <th key={lang} className="text-center w-20">
              {t(`languages.short.${lang}`)}
            </th>
          ))}
          <th className="w-32">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {filteredRows.map(row => (
          <TranslationTableRow
            key={row.id}
            row={row}
            isSelected={selectedIds.has(row.id)}
            onSelectionChange={handleSelectRow}
            onEdit={handleEdit}
          />
        ))}
      </tbody>
    </table>
  </div>
</div>
```

**Features:**
- Sticky header on scroll (optional enhancement)
- Horizontal scroll for mobile devices
- Indentation for articles under parent items (via left padding)
- Icon indicators for item vs article (🏠 for item, 📄 for article)

**Pattern Reference:**
- InstructionsTable component (lines 1-150+)
- SortableColumnHeader pattern (lines 24-76)

---

### Step 10: Create Translation Table Row Component
**Description**: Individual row component handling checkbox, name display, status columns, and actions
**Rationale**: Encapsulates row-level logic and improves readability
**Estimated Effort**: M (2-3 hours)

**Component:**
```tsx
interface TranslationTableRowProps {
  row: TranslationRow;
  isSelected: boolean;
  onSelectionChange: (id: string, checked: boolean) => void;
  onEdit: (row: TranslationRow) => void;
}

function TranslationTableRow({ row, isSelected, onSelectionChange, onEdit }: TranslationTableRowProps) {
  const t = useTranslations('translation.table');
  const isArticle = row.entityType === 'article';

  return (
    <tr className={cn('hover:bg-gray-50', isSelected && 'bg-blue-50')}>
      {/* Checkbox */}
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelectionChange(row.id, e.target.checked)}
          aria-label={t('selectRow', { name: row.name })}
        />
      </td>

      {/* Name Column */}
      <td className="px-4 py-3">
        <div className={cn('flex items-center gap-2', isArticle && 'pl-8')}>
          <span className="text-lg" aria-hidden="true">
            {isArticle ? '📄' : '🏠'}
          </span>
          <div>
            <div className="font-medium text-gray-900">{row.name}</div>
            {isArticle && row.parentName && (
              <div className="text-xs text-gray-500">
                {t('parentItem', { name: row.parentName })}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Language Status Columns */}
      {TARGET_LANGUAGES.map(lang => (
        <td key={lang} className="px-2 py-3 text-center">
          <StatusBadge
            status={row.translations[lang]?.status || 'missing'}
            compact
          />
        </td>
      ))}

      {/* Actions Column */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(row)}
            className="text-sm text-blue-600 hover:underline"
          >
            {t('actions.edit')}
          </button>
          <RowActionsMenu row={row} />
        </div>
      </td>
    </tr>
  );
}
```

**Features:**
- Visual indentation for articles
- Parent item name display for articles
- Icon differentiation (item vs article)
- Status badge per language
- Edit button + actions dropdown

---

### Step 11: Implement Row Actions Dropdown Menu
**Description**: Dropdown menu for additional actions (View, Re-translate, Delete Translation)
**Rationale**: Provides access to per-row operations without cluttering the UI
**Estimated Effort**: M (2 hours)

**Component:**
```tsx
import { MoreVertical } from 'lucide-react';

function RowActionsMenu({ row }: { row: TranslationRow }) {
  const t = useTranslations('translation.table.actions');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-gray-100 rounded"
        aria-label={t('menuAriaLabel')}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <button
            onClick={() => handleViewItem(row)}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
          >
            {t('view')}
          </button>
          <button
            onClick={() => handleRetranslate(row)}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
          >
            {t('retranslate')}
          </button>
          <button
            onClick={() => handleDeleteTranslations(row)}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
          >
            {t('deleteTranslations')}
          </button>
        </div>
      )}
    </div>
  );
}
```

**Accessibility:**
- Keyboard navigation (Tab, Enter, Escape)
- Close on outside click
- ARIA labels for screen readers

---

### Step 12: Integrate BulkTranslationBar Component
**Description**: Display BulkTranslationBar when items are selected, pass selection data
**Rationale**: Enables bulk re-translation operations
**Estimated Effort**: M (2 hours)

**Integration:**
```tsx
{selectedIds.size > 0 && (
  <BulkTranslationBar
    selectedCount={selectedIds.size}
    onRetranslateAll={handleBulkRetranslateAll}
    onRetranslateSelected={handleBulkRetranslateSelected}
    onClearSelection={() => setSelectedIds(new Set())}
  />
)}
```

**Handler Functions:**
```typescript
const handleBulkRetranslateAll = async () => {
  const entitySpecs = Array.from(selectedIds).map(id => {
    const [entityType, entityId] = id.split(':');
    return { entityType, entityId };
  });

  await fetch('/api/translations/retry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      entities: entitySpecs,
      languages: TARGET_LANGUAGES, // All languages
    }),
  });

  // Refetch data to show updated status
  refetch();
};

const handleBulkRetranslateSelected = () => {
  setShowLanguageDialog(true);
};
```

**Dependencies:**
- REQ-E05-018: BulkTranslationBar component
- REQ-E05-019: LanguageSelectorDialog component
- REQ-E05-003: Re-translate API endpoint

---

### Step 13: Implement Pagination Controls
**Description**: Add pagination UI (page size selector, page navigation)
**Rationale**: Handle large datasets efficiently
**Estimated Effort**: M (2 hours)

**State Management:**
```typescript
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(25);

const totalPages = Math.ceil(filteredRows.length / pageSize);
const paginatedRows = filteredRows.slice(
  (currentPage - 1) * pageSize,
  currentPage * pageSize
);

// Reset to page 1 when filters change
useEffect(() => {
  setCurrentPage(1);
}, [filters]);
```

**UI Component:**
```tsx
<div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
  {/* Page Size Selector */}
  <div className="flex items-center gap-2">
    <label>{t('pagination.pageSize')}</label>
    <select
      value={pageSize}
      onChange={(e) => setPageSize(Number(e.target.value))}
    >
      <option value="10">10</option>
      <option value="25">25</option>
      <option value="50">50</option>
      <option value="100">100</option>
    </select>
  </div>

  {/* Page Info */}
  <div className="text-sm text-gray-600">
    {t('pagination.pageInfo', { current: currentPage, total: totalPages })}
  </div>

  {/* Page Navigation */}
  <div className="flex gap-2">
    <button
      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
      disabled={currentPage === 1}
    >
      ← {t('pagination.previous')}
    </button>
    <button
      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
      disabled={currentPage === totalPages}
    >
      {t('pagination.next')} →
    </button>
  </div>
</div>
```

---

### Step 14: Implement Loading and Empty States
**Description**: Add skeleton loading UI and empty state messaging
**Rationale**: Better user experience during data fetches and when no data exists
**Estimated Effort**: M (2 hours)

**Loading State:**
```tsx
{loading && (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="h-12 bg-gray-200 rounded" />
      </div>
    ))}
  </div>
)}
```

**Empty State (No Content):**
```tsx
{!loading && data.length === 0 && (
  <div className="text-center py-12">
    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      {t('emptyState.noContent.title')}
    </h3>
    <p className="text-gray-600 mb-6">
      {t('emptyState.noContent.description')}
    </p>
    <button
      onClick={() => router.push('/dashboard2/items')}
      className="btn-primary"
    >
      {t('emptyState.noContent.cta')}
    </button>
  </div>
)}
```

**Empty State (No Matches):**
```tsx
{!loading && data.length > 0 && filteredRows.length === 0 && (
  <div className="text-center py-12">
    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      {t('emptyState.noMatches.title')}
    </h3>
    <p className="text-gray-600">
      {t('emptyState.noMatches.description')}
    </p>
  </div>
)}
```

**Pattern Reference:**
- Items page loading state (lines 80-88 from items/page.tsx)

---

### Step 15: Add Status Legend and Help Text
**Description**: Display legend explaining status badge meanings at bottom of table
**Rationale**: Helps users understand the visual indicators
**Estimated Effort**: S (30 minutes)

**Component:**
```tsx
<div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
  <div className="flex items-center gap-6">
    <span className="font-medium">{t('legend.title')}</span>
    <div className="flex flex-wrap gap-4">
      <div className="flex items-center gap-1">
        <StatusBadge status="complete" compact />
        <span>{t('legend.complete')}</span>
      </div>
      <div className="flex items-center gap-1">
        <StatusBadge status="pending" compact />
        <span>{t('legend.pending')}</span>
      </div>
      <div className="flex items-center gap-1">
        <StatusBadge status="stale" compact />
        <span>{t('legend.stale')}</span>
      </div>
      <div className="flex items-center gap-1">
        <StatusBadge status="manual" compact />
        <span>{t('legend.manual')}</span>
      </div>
      <div className="flex items-center gap-1">
        <StatusBadge status="missing" compact />
        <span>{t('legend.missing')}</span>
      </div>
    </div>
  </div>
</div>
```

**Spec Reference:**
- Lines 3135 from gen_requests_epic5.md

---

### Step 16: Add Internationalization (i18n) Keys
**Description**: Add all translation keys to `/messages/en.json` for next-intl
**Rationale**: All user-facing text must be translatable
**Estimated Effort**: S (1 hour)

**Translation Keys:**
```json
{
  "translation": {
    "page": {
      "title": "Translation Management",
      "description": "Manage translations for all your content across multiple languages"
    },
    "filters": {
      "type": {
        "all": "All Types",
        "items": "Items Only",
        "articles": "Articles Only"
      },
      "language": {
        "all": "All Languages"
      },
      "status": {
        "all": "All Statuses",
        "complete": "Complete",
        "pending": "Pending",
        "missing": "Missing",
        "stale": "Stale"
      },
      "searchPlaceholder": "Search by name...",
      "resultCount": "{count} items"
    },
    "table": {
      "columns": {
        "name": "Name",
        "actions": "Actions"
      },
      "selectRow": "Select {name}",
      "selectAll": "Select all",
      "parentItem": "Parent: {name}",
      "actions": {
        "edit": "Edit",
        "view": "View",
        "retranslate": "Re-translate",
        "deleteTranslations": "Delete Translations",
        "menuAriaLabel": "Row actions"
      }
    },
    "pagination": {
      "pageSize": "Items per page:",
      "pageInfo": "Page {current} of {total}",
      "previous": "Previous",
      "next": "Next"
    },
    "legend": {
      "title": "Legend:",
      "complete": "Complete",
      "pending": "Pending",
      "stale": "Stale",
      "manual": "Manually Edited",
      "missing": "Missing"
    },
    "emptyState": {
      "noContent": {
        "title": "No items or articles found",
        "description": "Create your first item to get started with translations.",
        "cta": "Create Item"
      },
      "noMatches": {
        "title": "No content matches your filters",
        "description": "Try adjusting your filter criteria."
      }
    }
  },
  "languages": {
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "nl": "Dutch",
    "it": "Italian",
    "short": {
      "es": "ES",
      "fr": "FR",
      "de": "DE",
      "nl": "NL",
      "it": "IT"
    }
  }
}
```

---

### Step 17: Add Responsive Design and Mobile Optimization
**Description**: Ensure table is usable on tablet and mobile devices
**Rationale**: Users may access translation management from various devices
**Estimated Effort**: M (2 hours)

**Responsive Strategies:**
1. **Horizontal scroll on mobile**: Table container with `overflow-x-auto`
2. **Sticky first column**: Name column remains visible during horizontal scroll
3. **Compact status indicators**: Use icon-only badges on small screens
4. **Filter bar stacking**: Vertical layout on mobile, horizontal on desktop
5. **Pagination controls simplification**: Smaller buttons, reduced spacing on mobile

**Breakpoint Strategy:**
- Mobile: < 640px (sm)
- Tablet: 640px - 1024px (sm-lg)
- Desktop: > 1024px (lg+)

**Example:**
```tsx
<div className="overflow-x-auto">
  <table className="min-w-full">
    <thead>
      <tr>
        <th className="sticky left-0 bg-gray-50 z-10">Name</th>
        {/* Language columns scroll horizontally */}
      </tr>
    </thead>
  </table>
</div>
```

---

### Step 18: Add Error Handling and User Feedback
**Description**: Display error messages and success toasts for operations
**Rationale**: Users need feedback when operations succeed or fail
**Estimated Effort**: M (1-2 hours)

**Error Display:**
```tsx
{error && (
  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
    <div className="flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      <div>
        <h3 className="text-sm font-medium text-red-800">
          {t('error.title')}
        </h3>
        <p className="text-sm text-red-700 mt-1">
          {error.message}
        </p>
      </div>
    </div>
  </div>
)}
```

**Success Toast:**
```tsx
// Use existing toast system or implement simple notification
const showSuccess = (message: string) => {
  // Implementation depends on project's toast library
};
```

---

### Step 19: Implement Sorting Functionality
**Description**: Add sorting by name, type, and last updated date
**Rationale**: Users want to order content by different criteria
**Estimated Effort**: M (2 hours)

**Sort State:**
```typescript
const [sortOption, setSortOption] = useState<TranslationSortOption>('name-asc');

const sortedRows = useMemo(() => {
  const sorted = [...filteredRows];

  switch (sortOption) {
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'updated-asc':
      return sorted.sort((a, b) =>
        a.sourceUpdatedAt.getTime() - b.sourceUpdatedAt.getTime()
      );
    case 'updated-desc':
      return sorted.sort((a, b) =>
        b.sourceUpdatedAt.getTime() - a.sourceUpdatedAt.getTime()
      );
    case 'type-asc':
      return sorted.sort((a, b) => a.entityType.localeCompare(b.entityType));
    case 'type-desc':
      return sorted.sort((a, b) => b.entityType.localeCompare(a.entityType));
    default:
      return sorted;
  }
}, [filteredRows, sortOption]);
```

**Pattern Reference:**
- SortableColumnHeader from InstructionsTable (lines 24-76)

---

### Step 20: Testing and Quality Assurance
**Description**: Manual testing and bug fixes
**Rationale**: Ensure all features work correctly before release
**Estimated Effort**: M (2-3 hours)

**Test Checklist:**
- [ ] Page loads without errors at `/dashboard2/translations`
- [ ] Data fetches correctly from batch API
- [ ] Filters work correctly (type, language, status, search)
- [ ] URL query parameters sync with filter state
- [ ] Bulk selection works (individual + select all)
- [ ] BulkTranslationBar appears when items selected
- [ ] Bulk re-translate operations trigger API calls
- [ ] Pagination controls work correctly
- [ ] Sorting works for all columns
- [ ] Status badges display correctly
- [ ] Loading state displays during data fetch
- [ ] Empty states display appropriately
- [ ] Error handling works for API failures
- [ ] Mobile/tablet responsive layout works
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Screen reader accessibility (ARIA labels)
- [ ] All text is translated via next-intl
- [ ] No TypeScript compilation errors
- [ ] No console errors or warnings

---

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### New Files to Create

| File | Purpose | Size Est. |
|------|---------|-----------|
| `/src/app/dashboard2/translations/page.tsx` | Main page component | ~600-800 lines |

### Files to Modify

| File | Target | Type | Lines | Justification |
|------|--------|------|-------|---------------|
| `/messages/en.json` | `translation.*` namespace | Add | ~80 lines | i18n strings for page |

### Components/Modules to Reference (READ ONLY)

| File | Purpose |
|------|---------|
| `/src/components/ItemManager/components/ItemGrid.tsx` | Grid layout pattern reference |
| `/src/components/InstructionsTable/InstructionsTable.tsx` | Table component pattern, sortable headers |
| `/src/app/dashboard2/items/page.tsx` | Data fetching pattern, loading states |
| `/src/app/dashboard2/Dashboard2LayoutClient.tsx` | Dashboard layout integration |
| `/src/app/api/translations/status/batch/route.ts` | API endpoint structure and response format |
| `/src/lib/translation-service/translation-service.types.ts` | `SupportedLanguage` type definition |

### External Dependencies to Import

```typescript
// React
import { useState, useEffect, useCallback, useMemo } from 'react';

// Next.js
import { useRouter } from 'next/navigation';

// Icons
import { Package, FileText, AlertCircle, MoreVertical, Loader2 } from 'lucide-react';

// i18n
import { useTranslations } from 'next-intl';

// Context
import { usePropertyContext } from '@/hooks/usePropertyContext';
import { useAuth, useAccountContext } from '@/contexts/AuthContext';

// Utils
import { cn } from '@/lib/utils';

// Types
import type { SupportedLanguage } from '@/lib/translation-service';

// Components (Epic 5 dependencies)
import { BulkTranslationBar } from '@/components/TranslationManagement/BulkTranslationBar';
import { LanguageSelectorDialog } from '@/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog';
```

---

## Dependencies

### Depends On (Completed First)

- **REQ-E05-001** (API: Translation Status Endpoints): Provides batch translation status data via `/api/translations/status/batch`
- **REQ-E05-003** (API: Re-translate Endpoint): Enables bulk re-translation operations via `/api/translations/retry`
- **REQ-E05-018** (Component: BulkTranslationBar): Provides bulk action UI when items are selected
- **REQ-E05-019** (Component: LanguageSelectorDialog): Enables language selection for targeted re-translation
- **Epic 1** (Foundation): Translation tables, job queue, and translation service
- **Epic 3** (Dynamic Content Translation): Translation trigger system and status tracking

### Blocks (Requires This First)

- **REQ-E05-021** (Navigation Link): Cannot add navigation link until page exists
- **REQ-E05-007** (Manual Translation Editor): May integrate with this page for editing workflows

### Parallel Safety

**Files touched by this task:**
- `/src/app/dashboard2/translations/page.tsx` (new file)
- `/messages/en.json` (additive changes to `translation.*` namespace)

**Conflicts with:** None (new page, isolated namespace)

**Safe to parallelize with:**
- REQ-E05-021 (Navigation Link) - modifies different file
- Other Epic 5 tasks not touching this page

### External Dependencies

- **Supabase**: Database queries for items and articles
- **Translation Status API**: Batch endpoint from REQ-E05-001
- **Re-translate API**: Retry endpoint from REQ-E05-003
- **PropertyContext**: For property filtering
- **AuthContext**: For authentication and account context
- **next-intl**: For internationalization

---

## Risks and Considerations

### Potential Side Effects

1. **Performance with Large Datasets**: Fetching all items and articles for a property may be slow if the property has 100+ items. Client-side filtering will also struggle with large datasets.
   - **Mitigation**: Consider adding pagination to the batch API or implementing virtual scrolling for large lists in future iterations.

2. **N+1 Query Problem**: If batch API is not optimized, fetching translation status for many entities could cause performance issues.
   - **Mitigation**: Ensure batch API uses efficient SQL joins (already implemented in REQ-E05-001).

3. **State Management Complexity**: Managing filters, sorting, selection, and pagination state simultaneously can introduce bugs.
   - **Mitigation**: Use `useReducer` instead of multiple `useState` calls if complexity grows.

4. **Mobile Table Usability**: Wide tables with many columns can be difficult to use on mobile devices.
   - **Mitigation**: Implement horizontal scroll with sticky first column, consider alternate mobile view in future iteration.

### Testing Requirements

1. **Data Fetching Edge Cases:**
   - Empty property (no items or articles)
   - Property with only items (no articles)
   - Property with only articles (no items)
   - API timeout or failure
   - Large datasets (50+ items)

2. **Filter Combinations:**
   - All filters applied simultaneously
   - Filters that result in zero matches
   - Search with special characters

3. **Selection State:**
   - Select all with filters applied
   - Change filters while items are selected
   - Pagination with selected items

4. **Accessibility:**
   - Keyboard navigation through table
   - Screen reader announcements for status changes
   - Focus management for dropdowns and dialogs

5. **Responsive Design:**
   - Table layout on mobile (< 640px)
   - Filter bar stacking on tablet
   - Touch target sizes for mobile

### Open Questions

- [ ] Should the page support real-time updates via Supabase Realtime subscriptions when translation jobs complete?
- [ ] Should we cache fetched translation data in sessionStorage to avoid re-fetching on page navigation?
- [ ] What is the expected behavior when a user selects items, changes filters, and some selected items disappear from view?
- [ ] Should the page include a "Refresh" button or auto-refresh on an interval?
- [ ] How should we handle very long item/article names (truncation vs wrapping)?

---

## Out of Scope

The following items are explicitly **NOT** included in this implementation:

1. **Server-Side Pagination**: Initial implementation uses client-side pagination with all data fetched at once
2. **Advanced Search**: No fuzzy search, regex, or multi-field search (just simple name matching)
3. **Export Functionality**: No CSV/Excel export of translation status data
4. **Inline Translation Editing**: Editing translations happens on separate pages, not inline in this table
5. **Real-Time Status Updates**: No Supabase Realtime subscriptions (manual refresh required)
6. **Bulk Delete**: No bulk delete functionality (only re-translation operations)
7. **Column Reordering**: Language columns are in fixed order
8. **Column Visibility Toggle**: All columns are always visible (no hide/show feature)
9. **Advanced Filtering**: No date range filters, no compound filters (AND/OR logic)
10. **Data Visualization**: No charts or graphs showing translation coverage
11. **Translation History**: No view of past translation versions or changes
12. **Notification System**: No push notifications or email alerts for translation status changes
13. **Keyboard Shortcuts**: No custom keyboard shortcuts (only standard browser navigation)
14. **Dark Mode**: No dark mode theme support
15. **Print Styles**: No optimized print stylesheet

---

## Notes for Implementation Agent

### Critical Implementation Details

1. **Language Source of Truth**: Always use `translation-service.types.ts` for the `SupportedLanguage` type. The canonical list is `['es', 'fr', 'de', 'nl', 'it']` (5 languages). Do NOT use 'pt' (Portuguese) despite some specs mentioning it.

2. **Entity ID Format**: Row IDs should be formatted as `"{entityType}:{entityId}"` for uniqueness (e.g., `"item:abc123"`, `"article:def456"`).

3. **API Integration**: The batch translation status API expects this request format:
   ```typescript
   POST /api/translations/status/batch
   {
     "entities": [
       { "entityType": "item", "entityId": "abc123" },
       { "entityType": "article", "entityId": "def456" }
     ]
   }
   ```

4. **Parent Name Lookup**: For articles, populate `parentName` by looking up the parent item's name from the items list.

5. **Status Priority**: When filtering by status "complete", check if ALL target languages are complete. For "pending", "missing", or "stale", check if ANY language has that status.

6. **Selection Persistence**: When filters change, clear selections or only keep selections that remain visible (document chosen approach).

### Code Quality Standards

- **TypeScript**: Strict mode, no `any` types, all props interfaces defined
- **Accessibility**: Proper ARIA labels, keyboard navigation, focus management
- **Performance**: Use `useMemo` and `useCallback` to prevent unnecessary re-renders
- **Error Handling**: Try-catch blocks for all API calls, user-friendly error messages
- **i18n**: All user-facing text via `useTranslations()`, no hardcoded strings
- **Responsive**: Mobile-first approach, test on multiple screen sizes

### Testing Priorities

1. **API Integration**: Verify batch API request/response handling
2. **Filter Logic**: Test all filter combinations work correctly
3. **Selection State**: Ensure selection state is consistent across operations
4. **Bulk Operations**: Verify bulk re-translate triggers correct API calls
5. **Empty States**: Test both "no content" and "no matches" scenarios

---

**Document generated:** 2026-01-22 19:58

---

**END OF DOCUMENT**
