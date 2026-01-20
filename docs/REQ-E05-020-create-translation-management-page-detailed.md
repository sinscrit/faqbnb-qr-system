# Detailed Task Breakdown: REQ-E05-020 - Create Translation Management Page

**Document Created:** 2026-01-20 19:15 UTC
**Last Modified:** 2026-01-20 19:15 UTC
**Request ID:** REQ-E05-020
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 4 - Bulk Operations & Management Page
**Task ID:** 4.3
**Size:** L (Large)
**Estimated Story Points:** 8-13

---

## Summary

Create a dedicated Translation Management page at `/dashboard2/translations/` that provides property owners with a centralized interface to view, filter, and manage translations across all their content (items, articles, links). The page features a full-width table displaying all content entities with translation status indicators for each supported language, comprehensive filtering capabilities, bulk selection support, and integration with the bulk translation action bar.

---

## Prerequisites

### Required Dependencies (Must Be Complete)

| Dependency | Task ID | File/Component | Status Check |
|------------|---------|----------------|--------------|
| Translation Status API | REQ-E05-001 | `/src/app/api/translations/status/route.ts` | Verify endpoint returns status data |
| Re-translate API | REQ-E05-003 | `/src/app/api/translations/retranslate/route.ts` | Verify endpoint accepts bulk requests |
| TranslationManagement Types | REQ-E05-006 | `/src/components/TranslationManagement/TranslationManagement.types.ts` | Import types |
| TranslationStatusColumn | REQ-E05-014 | `/src/components/TranslationManagement/TranslationStatusColumn/` | Import component |
| TranslationStatusFilter | REQ-E05-015 | `/src/components/TranslationManagement/TranslationStatusFilter/` | Import component |
| TranslationPreviewPanel | REQ-E05-007 | `/src/components/TranslationManagement/TranslationPreviewPanel/` | Import component |
| BulkTranslationBar | REQ-E05-018 | `/src/components/TranslationManagement/BulkTranslationBar/` | Import component |
| useTranslationStatus Hook | REQ-E05-011 | `/src/hooks/useTranslationStatus.ts` | Import hook |
| useTranslationRealtime Hook | REQ-E05-012 | `/src/hooks/useTranslationRealtime.ts` | Import hook |

### Foundation Dependencies (Epic 1)

| Component | Location | Usage |
|-----------|----------|-------|
| Translation tables | Database | `item_translations`, `article_translations`, `link_translations` |
| Translation service types | `/src/lib/translation-service/translation-service.types.ts` | `SUPPORTED_LANGUAGES`, `SupportedLanguage`, `TranslationStatus` |
| PropertyContext | `/src/contexts/PropertyContext.tsx` | Get `selectedPropertyId` |
| AuthContext | `/src/contexts/AuthContext.tsx` | Get `user`, `currentAccount` |
| adminApi | `/src/lib/api.ts` | Fetch items, articles, links |

---

## Task Breakdown

### Task 1: Create Page File Structure and Basic Layout (2 SP)

**File:** `/src/app/dashboard2/translations/page.tsx`

**Objective:** Create the main page file with proper Next.js App Router structure, client directive, and base layout.

**Subtasks:**

#### 1.1 Create Page File with Boilerplate
```typescript
'use client';

/**
 * Translation Management Page
 *
 * Centralized page for property owners to view and manage translations
 * across all content types (items, articles, links).
 *
 * Features:
 * - Full-width table with translation status for all 6 languages
 * - Filtering by content type, language, and status
 * - Bulk selection and translation operations
 * - Real-time status updates via Supabase
 *
 * @route /dashboard2/translations
 * @created 2026-01-20
 * @module REQ-E05-020
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// ... additional imports
```

#### 1.2 Define Page State Interface
```typescript
interface TranslationsPageState {
  // Content data
  items: ItemRecord[];
  articles: ArticleRecord[];
  links: LinkRecord[];

  // Combined content list
  contentList: ContentEntity[];

  // Translation status (keyed by entityType:entityId)
  translationStatus: Map<string, TranslationStatusMap>;

  // UI State
  loading: boolean;
  error: Error | null;

  // Filters
  filters: {
    contentType: 'all' | 'item' | 'article' | 'link';
    missingLanguage: SupportedLanguage | null;
    status: TranslationFilterStatus;
  };

  // Selection
  selectedIds: Set<string>; // Format: "entityType:entityId"

  // Preview panel
  previewTarget: {
    entityType: 'item' | 'article' | 'link';
    entityId: string;
    language?: SupportedLanguage;
  } | null;

  // Sorting
  sortBy: 'name' | 'type' | 'completion';
  sortOrder: 'asc' | 'desc';

  // Pagination
  page: number;
  pageSize: number;
}
```

#### 1.3 Implement Basic Page Structure
- Page header with title "Translation Management"
- Breadcrumb navigation (Dashboard > Translations)
- Help tooltip explaining page functionality
- Full-width container without sidebars

**Acceptance Criteria:**
- [ ] Page file created at correct route
- [ ] JSDoc header with route, created date, and module reference
- [ ] 'use client' directive present
- [ ] State interface defined
- [ ] Basic layout renders without errors

---

### Task 2: Implement Content Data Fetching (2 SP)

**Objective:** Fetch all content entities (items, articles, links) for the current property and combine into a unified list.

**Subtasks:**

#### 2.1 Create Content Entity Type
```typescript
interface ContentEntity {
  id: string;
  entityType: 'item' | 'article' | 'link';
  name: string;
  description?: string;
  propertyId: string;
  createdAt: Date;
  updatedAt?: Date;
  // Reference to original record
  publicId?: string; // For items
  articleId?: string; // For articles
}
```

#### 2.2 Implement Content Fetch Function
```typescript
const fetchAllContent = useCallback(async () => {
  if (!user || !selectedPropertyId) return;

  setLoading(true);
  setError(null);

  const headers: Record<string, string> = {};
  if (currentAccount) {
    headers['x-current-account'] = currentAccount.id;
  }

  try {
    // Fetch all content types in parallel
    const [itemsRes, articlesRes, linksRes] = await Promise.all([
      adminApi.listItems(undefined, selectedPropertyId, 1, 500, headers),
      fetchArticles(selectedPropertyId, headers),
      fetchLinks(selectedPropertyId, headers),
    ]);

    // Combine into unified content list
    const combined = combineContent(
      itemsRes.data || [],
      articlesRes.data || [],
      linksRes.data || []
    );

    setContentList(combined);
  } catch (err) {
    setError(err instanceof Error ? err : new Error('Failed to fetch content'));
  } finally {
    setLoading(false);
  }
}, [user, selectedPropertyId, currentAccount]);
```

#### 2.3 Create Content Combination Utility
```typescript
function combineContent(
  items: ItemRecord[],
  articles: ArticleRecord[],
  links: LinkRecord[]
): ContentEntity[] {
  const combined: ContentEntity[] = [];

  // Map items
  items.forEach(item => {
    combined.push({
      id: item.id,
      entityType: 'item',
      name: item.name || item.title,
      description: item.description,
      propertyId: item.propertyId,
      createdAt: new Date(item.createdAt),
      updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
      publicId: item.publicId,
    });
  });

  // Map articles
  articles.forEach(article => {
    combined.push({
      id: article.id,
      entityType: 'article',
      name: article.title,
      description: article.description,
      propertyId: article.propertyId,
      createdAt: new Date(article.createdAt),
      updatedAt: article.updatedAt ? new Date(article.updatedAt) : undefined,
      articleId: article.id,
    });
  });

  // Map links
  links.forEach(link => {
    combined.push({
      id: link.id,
      entityType: 'link',
      name: link.title,
      propertyId: link.propertyId,
      createdAt: new Date(link.createdAt),
      updatedAt: link.updatedAt ? new Date(link.updatedAt) : undefined,
    });
  });

  return combined;
}
```

**Acceptance Criteria:**
- [ ] All three content types fetched in parallel
- [ ] Combined into unified list with consistent structure
- [ ] Loading state shown during fetch
- [ ] Error state handled gracefully
- [ ] Empty state when no content exists

---

### Task 3: Integrate Translation Status Fetching (1 SP)

**Objective:** Fetch translation status for all content entities using the `useTranslationStatus` hook.

**Subtasks:**

#### 3.1 Use Translation Status Hook
```typescript
const {
  data: translationStatusData,
  loading: statusLoading,
  error: statusError,
  refresh: refreshStatus,
} = useTranslationStatus({
  propertyId: selectedPropertyId,
  // No specific entity - fetch all
});
```

#### 3.2 Map Status Data to Content
```typescript
const statusMap = useMemo(() => {
  const map = new Map<string, TranslationStatusMap>();

  if (translationStatusData?.items) {
    translationStatusData.items.forEach(item => {
      const key = `${item.entityType}:${item.entityId}`;
      map.set(key, item.translations);
    });
  }

  return map;
}, [translationStatusData]);
```

#### 3.3 Subscribe to Real-time Updates
```typescript
useTranslationRealtime({
  propertyId: selectedPropertyId,
  onUpdate: (update) => {
    // Update local status map when translation completes
    refreshStatus();
  },
});
```

**Acceptance Criteria:**
- [ ] Translation status loaded for all content
- [ ] Status mapped to content entities by key
- [ ] Real-time subscription active
- [ ] UI updates when translations complete

---

### Task 4: Implement Filter Bar Component (2 SP)

**Objective:** Create a horizontal filter bar with three filter controls: content type, missing language, and translation status.

**Subtasks:**

#### 4.1 Create Filter Bar JSX Structure
```tsx
<div className="flex flex-wrap gap-4 p-4 bg-white border border-gray-200 rounded-lg mb-4">
  {/* Content Type Filter */}
  <div className="flex items-center gap-2">
    <label htmlFor="content-type-filter" className="text-sm font-medium text-gray-700">
      Content:
    </label>
    <select
      id="content-type-filter"
      value={filters.contentType}
      onChange={(e) => handleFilterChange('contentType', e.target.value)}
      className="rounded-md border-gray-300 shadow-sm focus:border-[#FF385C] focus:ring-[#FF385C] text-sm"
    >
      <option value="all">All Types</option>
      <option value="item">Items</option>
      <option value="article">Articles</option>
      <option value="link">Links</option>
    </select>
  </div>

  {/* Language Filter (missing translations) */}
  <div className="flex items-center gap-2">
    <label htmlFor="language-filter" className="text-sm font-medium text-gray-700">
      Missing:
    </label>
    <select
      id="language-filter"
      value={filters.missingLanguage || ''}
      onChange={(e) => handleFilterChange('missingLanguage', e.target.value || null)}
      className="rounded-md border-gray-300 shadow-sm focus:border-[#FF385C] focus:ring-[#FF385C] text-sm"
    >
      <option value="">Any Language</option>
      {SUPPORTED_LANGUAGES.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.name}
        </option>
      ))}
    </select>
  </div>

  {/* Translation Status Filter - Use existing component */}
  <TranslationStatusFilter
    value={filters.status}
    onChange={(status) => handleFilterChange('status', status)}
  />

  {/* Filter Summary & Clear */}
  {hasActiveFilters && (
    <div className="flex items-center gap-2 ml-auto">
      <span className="text-sm text-gray-500">
        Showing {filteredContent.length} of {contentList.length}
      </span>
      <button
        onClick={clearFilters}
        className="text-sm text-[#FF385C] hover:underline"
      >
        Clear filters
      </button>
    </div>
  )}
</div>
```

#### 4.2 Implement Filter Change Handlers
```typescript
const handleFilterChange = useCallback((
  filterKey: keyof typeof filters,
  value: unknown
) => {
  setFilters(prev => ({
    ...prev,
    [filterKey]: value,
  }));

  // Update URL params for shareable views
  const params = new URLSearchParams(searchParams.toString());
  if (value) {
    params.set(filterKey, String(value));
  } else {
    params.delete(filterKey);
  }
  router.replace(`?${params.toString()}`, { scroll: false });
}, [searchParams, router]);

const clearFilters = useCallback(() => {
  setFilters({
    contentType: 'all',
    missingLanguage: null,
    status: 'all',
  });
  router.replace('/dashboard2/translations', { scroll: false });
}, [router]);
```

#### 4.3 Implement Filter Application Logic
```typescript
const filteredContent = useMemo(() => {
  let result = [...contentList];

  // Filter by content type
  if (filters.contentType !== 'all') {
    result = result.filter(item => item.entityType === filters.contentType);
  }

  // Filter by missing language
  if (filters.missingLanguage) {
    result = result.filter(item => {
      const key = `${item.entityType}:${item.id}`;
      const status = statusMap.get(key);
      const langStatus = status?.[filters.missingLanguage!];
      return !langStatus || langStatus.status !== 'completed';
    });
  }

  // Filter by translation status
  if (filters.status !== 'all') {
    result = result.filter(item => {
      const key = `${item.entityType}:${item.id}`;
      const status = statusMap.get(key);
      return matchesStatusFilter(status, filters.status);
    });
  }

  return result;
}, [contentList, filters, statusMap]);
```

#### 4.4 Restore Filters from URL on Mount
```typescript
useEffect(() => {
  const contentType = searchParams.get('contentType') || 'all';
  const missingLanguage = searchParams.get('missingLanguage');
  const status = searchParams.get('status') || 'all';

  setFilters({
    contentType: contentType as typeof filters.contentType,
    missingLanguage: missingLanguage as SupportedLanguage | null,
    status: status as TranslationFilterStatus,
  });
}, []);
```

**Acceptance Criteria:**
- [ ] Three filter dropdowns render correctly
- [ ] Content type filter works (All/Items/Articles/Links)
- [ ] Language filter shows content missing specific translations
- [ ] Status filter integrates with TranslationStatusFilter component
- [ ] Filter count and clear button display when filters active
- [ ] Filters persist in URL query parameters

---

### Task 5: Implement Full-Width Table Structure (2 SP)

**Objective:** Create the main data table with all required columns: checkbox, name, type, 6 language columns, and actions.

**Subtasks:**

#### 5.1 Create Table Header Structure
```tsx
<div className="overflow-x-auto">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        {/* Selection checkbox */}
        <th scope="col" className="relative px-4 py-3 w-12">
          <input
            type="checkbox"
            checked={allVisibleSelected}
            onChange={handleSelectAll}
            className="h-4 w-4 rounded border-gray-300 text-[#FF385C] focus:ring-[#FF385C]"
            aria-label="Select all visible rows"
          />
        </th>

        {/* Name column - sortable */}
        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          <button
            onClick={() => handleSort('name')}
            className="flex items-center gap-1 hover:text-gray-700"
          >
            Name
            <ArrowUpDown className="h-3 w-3" />
          </button>
        </th>

        {/* Type column */}
        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
          Type
        </th>

        {/* Language status columns (6) */}
        {SUPPORTED_LANGUAGES.map(lang => (
          <th
            key={lang.code}
            scope="col"
            className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16"
            title={lang.name}
          >
            {lang.flag} {lang.code.toUpperCase()}
          </th>
        ))}

        {/* Actions column */}
        <th scope="col" className="relative px-4 py-3 w-20">
          <span className="sr-only">Actions</span>
        </th>
      </tr>
    </thead>

    <tbody className="bg-white divide-y divide-gray-200">
      {/* Rows rendered here */}
    </tbody>
  </table>
</div>
```

#### 5.2 Create Table Row Component
```tsx
interface ContentRowProps {
  entity: ContentEntity;
  status: TranslationStatusMap | undefined;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onStatusClick: (entityType: string, entityId: string, language?: SupportedLanguage) => void;
  onEditClick: (entity: ContentEntity) => void;
}

function ContentRow({
  entity,
  status,
  isSelected,
  onSelect,
  onStatusClick,
  onEditClick,
}: ContentRowProps) {
  const rowKey = `${entity.entityType}:${entity.id}`;

  const typeIcon = {
    item: <Package className="h-4 w-4 text-blue-500" />,
    article: <FileText className="h-4 w-4 text-green-500" />,
    link: <Link2 className="h-4 w-4 text-purple-500" />,
  };

  const typeLabel = {
    item: 'Item',
    article: 'Article',
    link: 'Link',
  };

  return (
    <tr className={cn(
      'hover:bg-gray-50 transition-colors',
      isSelected && 'bg-blue-50'
    )}>
      {/* Selection checkbox */}
      <td className="px-4 py-4 w-12">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(rowKey)}
          className="h-4 w-4 rounded border-gray-300 text-[#FF385C] focus:ring-[#FF385C]"
          aria-label={`Select ${entity.name}`}
        />
      </td>

      {/* Name - clickable to navigate */}
      <td className="px-4 py-4">
        <button
          onClick={() => onEditClick(entity)}
          className="text-sm font-medium text-gray-900 hover:text-[#FF385C] hover:underline text-left"
        >
          {entity.name}
        </button>
      </td>

      {/* Type with icon */}
      <td className="px-4 py-4 w-24">
        <div className="flex items-center gap-1.5">
          {typeIcon[entity.entityType]}
          <span className="text-sm text-gray-600">{typeLabel[entity.entityType]}</span>
        </div>
      </td>

      {/* Language status columns */}
      {SUPPORTED_LANGUAGES.map(lang => (
        <LanguageStatusCell
          key={lang.code}
          entityType={entity.entityType}
          entityId={entity.id}
          language={lang.code}
          status={status?.[lang.code]?.status}
          onClick={() => onStatusClick(entity.entityType, entity.id, lang.code)}
        />
      ))}

      {/* Actions dropdown */}
      <td className="px-4 py-4 w-20 text-right">
        <ActionsDropdown entity={entity} />
      </td>
    </tr>
  );
}
```

#### 5.3 Implement Language Status Cell Component
```tsx
interface LanguageStatusCellProps {
  entityType: 'item' | 'article' | 'link';
  entityId: string;
  language: SupportedLanguage;
  status: TranslationStatus | undefined;
  onClick: () => void;
}

function LanguageStatusCell({
  entityType,
  entityId,
  language,
  status,
  onClick,
}: LanguageStatusCellProps) {
  const statusConfig = {
    completed: { color: 'bg-green-500', icon: '✓', label: 'Completed' },
    pending: { color: 'bg-amber-500', icon: '⏳', label: 'Pending' },
    processing: { color: 'bg-amber-500 animate-pulse', icon: '⏳', label: 'Processing' },
    failed: { color: 'bg-red-500', icon: '✕', label: 'Failed' },
    manual: { color: 'bg-purple-500', icon: '✎', label: 'Manual' },
  };

  const config = status ? statusConfig[status] : { color: 'bg-gray-300', icon: '○', label: 'Not started' };

  return (
    <td className="px-2 py-4 text-center">
      <button
        onClick={onClick}
        className={cn(
          'inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-xs',
          'transition-transform hover:scale-110',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF385C]',
          config.color
        )}
        title={`${language.toUpperCase()}: ${config.label}`}
        aria-label={`${language.toUpperCase()} translation status: ${config.label}. Click to view details.`}
      >
        {config.icon}
      </button>
    </td>
  );
}
```

#### 5.4 Implement Actions Dropdown
```tsx
function ActionsDropdown({ entity }: { entity: ContentEntity }) {
  const router = useRouter();

  const handleView = () => {
    // Navigate to entity detail page
    if (entity.entityType === 'item') {
      router.push(`/items/${entity.publicId}`);
    } else if (entity.entityType === 'article') {
      router.push(`/dashboard2/instructions/${entity.id}`);
    }
  };

  const handleEdit = () => {
    if (entity.entityType === 'item') {
      router.push(`/dashboard2/items/${entity.publicId}/edit`);
    } else if (entity.entityType === 'article') {
      router.push(`/dashboard2/instructions/${entity.id}/edit`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1 rounded hover:bg-gray-100">
          <MoreHorizontal className="h-4 w-4 text-gray-500" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleView}>
          <Eye className="h-4 w-4 mr-2" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**Acceptance Criteria:**
- [ ] Table renders with all 10 columns
- [ ] Checkbox column with select all functionality
- [ ] Name column clickable to navigate to edit page
- [ ] Type column shows icon and label
- [ ] 6 language columns with status indicators
- [ ] Actions dropdown with View/Edit options
- [ ] Responsive horizontal scroll on narrow viewports

---

### Task 6: Implement Selection and Bulk Actions (2 SP)

**Objective:** Enable row selection with checkboxes and integrate the BulkTranslationBar component for bulk operations.

**Subtasks:**

#### 6.1 Implement Selection State Management
```typescript
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

const handleSelectRow = useCallback((id: string) => {
  setSelectedIds(prev => {
    const next = new Set(prev);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    return next;
  });
}, []);

const handleSelectAll = useCallback(() => {
  if (allVisibleSelected) {
    // Deselect all visible
    const visibleKeys = new Set(filteredContent.map(e => `${e.entityType}:${e.id}`));
    setSelectedIds(prev => {
      const next = new Set(prev);
      visibleKeys.forEach(key => next.delete(key));
      return next;
    });
  } else {
    // Select all visible
    const visibleKeys = filteredContent.map(e => `${e.entityType}:${e.id}`);
    setSelectedIds(prev => new Set([...prev, ...visibleKeys]));
  }
}, [filteredContent, allVisibleSelected]);

const allVisibleSelected = useMemo(() => {
  if (filteredContent.length === 0) return false;
  return filteredContent.every(e => selectedIds.has(`${e.entityType}:${e.id}`));
}, [filteredContent, selectedIds]);

const clearSelection = useCallback(() => {
  setSelectedIds(new Set());
}, []);
```

#### 6.2 Integrate BulkTranslationBar Component
```tsx
{/* Render at bottom of page when items selected */}
{selectedIds.size > 0 && (
  <BulkTranslationBar
    selectedItems={Array.from(selectedIds).map(key => {
      const [entityType, entityId] = key.split(':');
      return { type: entityType as 'item' | 'article' | 'link', id: entityId };
    })}
    onComplete={() => {
      clearSelection();
      refreshStatus();
    }}
    onCancel={clearSelection}
  />
)}
```

#### 6.3 Add Selection Count Display
```tsx
{selectedIds.size > 0 && (
  <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm shadow-lg z-40">
    {selectedIds.size} {selectedIds.size === 1 ? 'item' : 'items'} selected
  </div>
)}
```

**Acceptance Criteria:**
- [ ] Individual row selection works
- [ ] Select all checkbox selects/deselects visible rows
- [ ] Selection count displays when items selected
- [ ] BulkTranslationBar appears when items selected
- [ ] Clear selection on bulk action complete
- [ ] Selection persists through filter changes

---

### Task 7: Implement Sorting Functionality (1 SP)

**Objective:** Enable table sorting by name, type, and translation completion percentage.

**Subtasks:**

#### 7.1 Implement Sort State
```typescript
const [sortBy, setSortBy] = useState<'name' | 'type' | 'completion'>('name');
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

const handleSort = useCallback((column: 'name' | 'type' | 'completion') => {
  if (sortBy === column) {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  } else {
    setSortBy(column);
    setSortOrder('asc');
  }
}, [sortBy]);
```

#### 7.2 Implement Sort Logic
```typescript
const sortedContent = useMemo(() => {
  const sorted = [...filteredContent];

  sorted.sort((a, b) => {
    let comparison = 0;

    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'type') {
      comparison = a.entityType.localeCompare(b.entityType);
    } else if (sortBy === 'completion') {
      const aCompletion = getCompletionPercentage(statusMap.get(`${a.entityType}:${a.id}`));
      const bCompletion = getCompletionPercentage(statusMap.get(`${b.entityType}:${b.id}`));
      comparison = aCompletion - bCompletion;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return sorted;
}, [filteredContent, sortBy, sortOrder, statusMap]);

function getCompletionPercentage(status: TranslationStatusMap | undefined): number {
  if (!status) return 0;
  const total = SUPPORTED_LANGUAGES.length;
  const completed = SUPPORTED_LANGUAGES.filter(
    lang => status[lang.code]?.status === 'completed' || status[lang.code]?.status === 'manual'
  ).length;
  return (completed / total) * 100;
}
```

#### 7.3 Add Sort Indicators to Column Headers
```tsx
<button
  onClick={() => handleSort('name')}
  className="flex items-center gap-1 hover:text-gray-700"
>
  Name
  {sortBy === 'name' ? (
    sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
  ) : (
    <ArrowUpDown className="h-3 w-3 text-gray-400" />
  )}
</button>
```

**Acceptance Criteria:**
- [ ] Click column header to sort
- [ ] Click again to reverse sort order
- [ ] Sort indicator shows current sort state
- [ ] Sorting by name (alphabetical)
- [ ] Sorting by type (item/article/link)
- [ ] Sorting by completion percentage

---

### Task 8: Implement Translation Preview Panel Integration (1 SP)

**Objective:** Open the TranslationPreviewPanel when clicking on a language status cell.

**Subtasks:**

#### 8.1 Implement Preview State
```typescript
const [previewTarget, setPreviewTarget] = useState<{
  entityType: 'item' | 'article' | 'link';
  entityId: string;
  language?: SupportedLanguage;
} | null>(null);

const handleStatusClick = useCallback((
  entityType: 'item' | 'article' | 'link',
  entityId: string,
  language?: SupportedLanguage
) => {
  setPreviewTarget({ entityType, entityId, language });
}, []);

const closePreview = useCallback(() => {
  setPreviewTarget(null);
}, []);
```

#### 8.2 Render TranslationPreviewPanel
```tsx
{previewTarget && (
  <TranslationPreviewPanel
    entityType={previewTarget.entityType}
    entityId={previewTarget.entityId}
    sourceLanguage="en" // Default source language
    sourceContent={getSourceContent(previewTarget)}
    isOpen={true}
    onClose={closePreview}
    onTranslationEdited={() => refreshStatus()}
    initialLanguage={previewTarget.language}
  />
)}
```

#### 8.3 Helper to Get Source Content
```typescript
function getSourceContent(target: typeof previewTarget): { title?: string; description?: string; name?: string } {
  if (!target) return {};

  const entity = contentList.find(
    e => e.entityType === target.entityType && e.id === target.entityId
  );

  if (!entity) return {};

  return {
    name: entity.name,
    description: entity.description,
  };
}
```

**Acceptance Criteria:**
- [ ] Clicking status cell opens preview panel
- [ ] Panel shows correct entity data
- [ ] Panel opens to specific language if provided
- [ ] Closing panel clears preview state
- [ ] Status refreshes when translation edited

---

### Task 9: Implement Pagination (1 SP)

**Objective:** Add pagination controls to handle large content catalogs (100+ items).

**Subtasks:**

#### 9.1 Implement Pagination State
```typescript
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(50);

const totalPages = Math.ceil(sortedContent.length / pageSize);

const paginatedContent = useMemo(() => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return sortedContent.slice(start, end);
}, [sortedContent, page, pageSize]);

// Reset to page 1 when filters change
useEffect(() => {
  setPage(1);
}, [filters]);
```

#### 9.2 Create Pagination Controls Component
```tsx
<div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white">
  <div className="flex items-center gap-2">
    <span className="text-sm text-gray-600">
      Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, sortedContent.length)} of {sortedContent.length}
    </span>
  </div>

  <div className="flex items-center gap-2">
    <button
      onClick={() => setPage(p => Math.max(1, p - 1))}
      disabled={page === 1}
      className={cn(
        'px-3 py-1.5 rounded-md text-sm font-medium',
        page === 1
          ? 'text-gray-400 cursor-not-allowed'
          : 'text-gray-700 hover:bg-gray-100'
      )}
    >
      Previous
    </button>

    {/* Page numbers */}
    <div className="flex items-center gap-1">
      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        let pageNum: number;
        if (totalPages <= 5) {
          pageNum = i + 1;
        } else if (page <= 3) {
          pageNum = i + 1;
        } else if (page >= totalPages - 2) {
          pageNum = totalPages - 4 + i;
        } else {
          pageNum = page - 2 + i;
        }

        return (
          <button
            key={pageNum}
            onClick={() => setPage(pageNum)}
            className={cn(
              'w-8 h-8 rounded-md text-sm font-medium',
              page === pageNum
                ? 'bg-[#FF385C] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            {pageNum}
          </button>
        );
      })}
    </div>

    <button
      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
      disabled={page === totalPages}
      className={cn(
        'px-3 py-1.5 rounded-md text-sm font-medium',
        page === totalPages
          ? 'text-gray-400 cursor-not-allowed'
          : 'text-gray-700 hover:bg-gray-100'
      )}
    >
      Next
    </button>
  </div>
</div>
```

**Acceptance Criteria:**
- [ ] Default page size of 50 items
- [ ] Pagination controls display when content > page size
- [ ] Previous/Next buttons work correctly
- [ ] Page numbers display and are clickable
- [ ] Showing X to Y of Z text accurate
- [ ] Reset to page 1 when filters change

---

### Task 10: Implement Loading and Empty States (1 SP)

**Objective:** Add loading skeleton during initial load and empty state when no content matches filters.

**Subtasks:**

#### 10.1 Create Loading Skeleton
```tsx
function TableSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-200 rounded mb-4" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-4 border-b border-gray-100">
          <div className="w-4 h-4 bg-gray-200 rounded" />
          <div className="flex-1 h-4 bg-gray-200 rounded" />
          <div className="w-16 h-4 bg-gray-200 rounded" />
          {Array.from({ length: 6 }).map((_, j) => (
            <div key={j} className="w-8 h-8 bg-gray-200 rounded-full" />
          ))}
          <div className="w-8 h-4 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}
```

#### 10.2 Create Empty State Component
```tsx
function EmptyState({ hasFilters, onClearFilters }: { hasFilters: boolean; onClearFilters: () => void }) {
  const router = useRouter();

  return (
    <div className="text-center py-12">
      <Languages className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">
        {hasFilters ? 'No content matches your filters' : 'No content to translate'}
      </h3>
      <p className="mt-2 text-sm text-gray-500">
        {hasFilters
          ? 'Try adjusting your filter criteria to see more results.'
          : 'Create items, articles, or links to start managing translations.'}
      </p>
      <div className="mt-6">
        {hasFilters ? (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear filters
          </button>
        ) : (
          <button
            onClick={() => router.push('/dashboard2/create')}
            className="inline-flex items-center px-4 py-2 bg-[#FF385C] text-white rounded-md text-sm font-medium hover:bg-[#E31C5F]"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Create content
          </button>
        )}
      </div>
    </div>
  );
}
```

#### 10.3 Conditional Rendering
```tsx
{loading ? (
  <TableSkeleton />
) : paginatedContent.length === 0 ? (
  <EmptyState hasFilters={hasActiveFilters} onClearFilters={clearFilters} />
) : (
  <table>
    {/* Table content */}
  </table>
)}
```

**Acceptance Criteria:**
- [ ] Loading skeleton shows during initial fetch
- [ ] Empty state shows when no content exists
- [ ] Empty state shows when filters return no results
- [ ] Clear filters button in filtered empty state
- [ ] Create content CTA in no-content empty state

---

### Task 11: Implement Accessibility Features (1 SP)

**Objective:** Ensure the page is fully keyboard accessible with proper ARIA labels and focus management.

**Subtasks:**

#### 11.1 Add ARIA Labels to Interactive Elements
```tsx
// Table
<table role="grid" aria-label="Translation management table">

// Checkboxes
<input
  type="checkbox"
  aria-label={`Select ${entity.name}`}
  aria-checked={isSelected}
/>

// Status cells
<button
  role="gridcell"
  aria-label={`${lang.name} translation status: ${statusLabel}. Press Enter to view details.`}
/>

// Sort buttons
<button
  aria-sort={sortBy === 'name' ? sortOrder === 'asc' ? 'ascending' : 'descending' : 'none'}
>
```

#### 11.2 Implement Keyboard Navigation
```tsx
// Handle arrow key navigation in table
const handleTableKeyDown = (e: React.KeyboardEvent, rowIndex: number, colIndex: number) => {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      focusCell(rowIndex + 1, colIndex);
      break;
    case 'ArrowUp':
      e.preventDefault();
      focusCell(rowIndex - 1, colIndex);
      break;
    case 'ArrowRight':
      e.preventDefault();
      focusCell(rowIndex, colIndex + 1);
      break;
    case 'ArrowLeft':
      e.preventDefault();
      focusCell(rowIndex, colIndex - 1);
      break;
  }
};
```

#### 11.3 Add Focus Indicator Styles
```css
/* In Tailwind classes */
focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF385C] focus-visible:ring-offset-2
```

**Acceptance Criteria:**
- [ ] All interactive elements have ARIA labels
- [ ] Table has proper role and aria-label
- [ ] Checkboxes announce state to screen readers
- [ ] Status cells announce status and instructions
- [ ] Sort columns announce current sort state
- [ ] Keyboard navigation works through table
- [ ] Focus indicators visible on all focusable elements

---

### Task 12: Add Page Header and Help Tooltip (0.5 SP)

**Objective:** Create the page header with title, breadcrumb, and help tooltip explaining functionality.

**Subtasks:**

#### 12.1 Create Page Header
```tsx
<div className="mb-6">
  {/* Breadcrumb */}
  <nav className="text-sm text-gray-500 mb-2" aria-label="Breadcrumb">
    <ol className="flex items-center gap-2">
      <li>
        <Link href="/dashboard2" className="hover:text-gray-700">
          Dashboard
        </Link>
      </li>
      <li className="flex items-center gap-2">
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900">Translations</span>
      </li>
    </ol>
  </nav>

  {/* Title with help */}
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Translation Management</h1>
      <p className="text-gray-600 mt-1">
        Manage translations across all your content
      </p>
    </div>

    {/* Help tooltip */}
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="p-2 rounded-full hover:bg-gray-100">
            <HelpCircle className="h-5 w-5 text-gray-400" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs">
          <p className="text-sm">
            Use filters to find content by type, missing languages, or status.
            Select multiple items to perform bulk translation operations.
            Click any language status to view or edit translations.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
</div>
```

**Acceptance Criteria:**
- [ ] Breadcrumb navigation shows Dashboard > Translations
- [ ] Page title "Translation Management" displays
- [ ] Subtitle describes page purpose
- [ ] Help icon with tooltip provides usage guidance

---

### Task 13: Performance Optimization (0.5 SP)

**Objective:** Ensure page performance remains acceptable with large datasets (500+ items).

**Subtasks:**

#### 13.1 Memoize Expensive Computations
```typescript
const filteredContent = useMemo(() => {
  // Filter logic
}, [contentList, filters, statusMap]);

const sortedContent = useMemo(() => {
  // Sort logic
}, [filteredContent, sortBy, sortOrder, statusMap]);

const paginatedContent = useMemo(() => {
  // Pagination logic
}, [sortedContent, page, pageSize]);
```

#### 13.2 Debounce Filter Changes
```typescript
const debouncedFilterChange = useDebouncedCallback(
  (filterKey: string, value: unknown) => {
    handleFilterChange(filterKey, value);
  },
  300
);
```

#### 13.3 Implement Row Virtualization (Optional for 500+ items)
```tsx
// Consider using react-window or @tanstack/virtual for very large lists
// This can be added as a follow-up optimization
```

**Acceptance Criteria:**
- [ ] Page loads under 3 seconds with 500+ items
- [ ] Filter changes feel responsive
- [ ] Sorting doesn't cause UI lag
- [ ] No unnecessary re-renders

---

### Task 14: Error Handling and Edge Cases (0.5 SP)

**Objective:** Handle errors gracefully and manage edge cases.

**Subtasks:**

#### 14.1 Handle API Errors
```tsx
{error && (
  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
    <div className="flex items-center gap-2">
      <AlertCircle className="h-5 w-5 text-red-500" />
      <p className="text-red-700">{error.message}</p>
    </div>
    <button
      onClick={() => {
        setError(null);
        fetchAllContent();
      }}
      className="mt-2 text-sm text-red-600 hover:underline"
    >
      Try again
    </button>
  </div>
)}
```

#### 14.2 Handle Missing Property Context
```tsx
if (!selectedPropertyId) {
  return (
    <div className="text-center py-12">
      <Building2 className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">
        No property selected
      </h3>
      <p className="mt-2 text-sm text-gray-500">
        Please select a property to manage translations.
      </p>
    </div>
  );
}
```

#### 14.3 Handle Unauthenticated State
```tsx
if (!user) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-600">Please log in to manage translations.</p>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] API errors display with retry option
- [ ] Missing property shows appropriate message
- [ ] Unauthenticated state handled
- [ ] Loading state prevents interaction during fetch

---

## Final Integration Checklist

- [ ] Page accessible at `/dashboard2/translations`
- [ ] Navigation link added (verified in REQ-E05-016)
- [ ] All Epic 5 components imported and working
- [ ] Real-time updates functional
- [ ] Bulk operations working end-to-end
- [ ] Filters persist in URL
- [ ] Performance acceptable with large datasets
- [ ] Full accessibility compliance
- [ ] Responsive design on tablet/mobile

---

## Testing Checklist

### Unit Tests
- [ ] Filter state management
- [ ] Selection state management
- [ ] Content combination utility
- [ ] Sort comparators
- [ ] Completion percentage calculation

### Integration Tests
- [ ] API data fetching with property context
- [ ] Real-time subscription updates
- [ ] Bulk action API calls
- [ ] URL parameter persistence

### E2E Tests
- [ ] Full flow: load → filter → select → bulk action → verify
- [ ] Navigation to entity edit pages
- [ ] Preview panel open/close
- [ ] Pagination behavior

### Accessibility Tests
- [ ] Screen reader announces table structure
- [ ] Keyboard navigation through all interactive elements
- [ ] Focus management when panel opens/closes
- [ ] Color contrast meets WCAG 2.1 AA

---

## File Changes Summary

### New Files
| File | Purpose |
|------|---------|
| `/src/app/dashboard2/translations/page.tsx` | Main Translation Management page |

### Dependencies (Import Only)
| File | Usage |
|------|-------|
| `/src/components/TranslationManagement/TranslationStatusColumn/` | Status indicators |
| `/src/components/TranslationManagement/TranslationStatusFilter/` | Filter dropdown |
| `/src/components/TranslationManagement/TranslationPreviewPanel/` | Preview panel |
| `/src/components/TranslationManagement/BulkTranslationBar/` | Bulk actions |
| `/src/hooks/useTranslationStatus.ts` | Status data hook |
| `/src/hooks/useTranslationRealtime.ts` | Real-time updates |

---

## References

- **Request Source:** `/docs/gen_requests_epic5.md` - REQ-E05-020
- **Overview Document:** `/docs/REQ-E05-020-create-translation-management-page-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Pattern Reference (Items Page):** `/src/app/dashboard2/items/page.tsx`
- **Pattern Reference (FilterPanel):** `/src/components/ItemManager/components/dialogs/FilterPanel.tsx`
- **Translation Types:** `/src/lib/translation-service/translation-service.types.ts`

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Large content catalogs slow performance | Pagination with 50 items default, memoization |
| Real-time updates not working | Fallback to manual refresh button |
| Translation status fetch fails | Error state with retry, graceful degradation |
| Mobile table usability | Horizontal scroll container, sticky first column (optional) |
| Missing dependent components | Verify all Epic 5 dependencies before starting |

---

*Document generated for REQ-E05-020 - Translation Management Page implementation*
