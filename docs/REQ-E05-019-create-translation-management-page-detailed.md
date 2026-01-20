# REQ-E05-019: Create Translation Management Page - Detailed Task Breakdown

**Document Created:** 2026-01-20 10:30 UTC
**Last Modified:** 2026-01-20 10:30 UTC
**Request Reference:** Epic 5 - Owner Translation Management, Phase 4 Task 4.3
**Overview Document:** REQ-E05-019-create-translation-management-page-overview.md
**Implementation Plan Reference:** Plan-111-L10N-Epic5-Owner-Translation-Management.md

---

## Executive Summary

This document provides a granular, actionable task breakdown for implementing the Translation Management page at `/src/app/dashboard2/translations/page.tsx`. The page provides property owners with a centralized interface to view, manage, and take action on translations across all their content (items, articles, links). Implementation follows established dashboard patterns from the Items page.

**Total Estimated Tasks:** 15 tasks
**Estimated Story Points:** 13 SP (assuming 1 SP = ~2-4 hours of focused work)

---

## Prerequisites Checklist

Before starting implementation, verify these dependencies are complete:

- [ ] **REQ-E05-001**: Translation Status API Endpoint (GET `/api/translations/status`) - REQUIRED
- [ ] **REQ-E05-006**: TranslationManagement.types.ts exists at `/src/components/TranslationManagement/`
- [ ] **REQ-E05-007**: TranslationPreviewPanel component available
- [ ] **REQ-E05-011**: useTranslationStatus hook at `/src/hooks/useTranslationStatus.ts`
- [ ] **REQ-E05-012**: useTranslationRealtime hook at `/src/hooks/useTranslationRealtime.ts`
- [ ] **REQ-E05-014**: TranslationStatusColumn component available
- [ ] **REQ-E05-015**: TranslationStatusFilter component available
- [ ] **REQ-E05-018**: BulkTranslationBar component available
- [ ] **REQ-E05-019 (different)**: LanguageSelectorDialog component available

---

## Task Breakdown

### Task 1: Create Page Directory and Base File Structure

**Story Points:** 1 SP
**Priority:** P0 - Blocker for all other tasks

#### Description
Create the translation management page file with basic scaffolding following the established dashboard2 page pattern.

#### File Operations

**Create:** `/src/app/dashboard2/translations/page.tsx`

#### Implementation Steps

1. Create the directory: `/src/app/dashboard2/translations/`
2. Create `page.tsx` with the following structure:

```typescript
'use client';

/**
 * Translation Management Page
 *
 * Centralized interface for property owners to view, manage, and take action
 * on translations across all their content (items, articles, links).
 *
 * @route /dashboard2/translations
 * @created 2026-01-20
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useAccountContext } from '@/contexts/AuthContext';
import { usePropertyContext } from '@/hooks/usePropertyContext';
import { Loader2 } from 'lucide-react';

export default function TranslationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { currentAccount } = useAccountContext();
  const { selectedPropertyId } = usePropertyContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // TODO: Implement in subsequent tasks

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to view translations.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF385C] mx-auto mb-4" />
          <p className="text-gray-600">Loading translations...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Translation Management</h1>
      <p className="text-gray-600 mt-1">Manage translations across all your content</p>
    </div>
  );
}
```

#### Acceptance Criteria
- [ ] File created at `/src/app/dashboard2/translations/page.tsx`
- [ ] `'use client'` directive present at top of file
- [ ] File compiles without TypeScript errors
- [ ] Basic loading and auth states render correctly
- [ ] Route accessible at `/dashboard2/translations`

#### Testing
```bash
# Verify file exists and compiles
npm run build

# Verify route is accessible
# Navigate to http://localhost:3000/dashboard2/translations
```

---

### Task 2: Define Local Types and Interfaces

**Story Points:** 1 SP
**Priority:** P0 - Required for type safety

#### Description
Add the local type definitions needed for the page state management, importing shared types from the TranslationManagement types file.

#### Implementation Steps

Add the following types to the page file (after imports):

```typescript
import type { SupportedLanguage, TranslationStatus } from '@/lib/translation-service/translation-service.types';
import type { SUPPORTED_LANGUAGES } from '@/lib/translation-service/translation-service.types';

// Local page types
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

interface TranslationFilterState {
  entityType: 'all' | 'item' | 'article' | 'link';
  status: 'all' | 'fully_translated' | 'partially_translated' | 'pending' | 'failed' | 'manual';
  language: SupportedLanguage | null;
}

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

#### Acceptance Criteria
- [ ] All types defined and exported if needed
- [ ] Types align with API response structure from REQ-E05-001
- [ ] No TypeScript errors
- [ ] Types properly imported from translation-service

---

### Task 3: Implement State Management

**Story Points:** 1 SP
**Priority:** P0 - Core functionality

#### Description
Set up all useState hooks for managing page state including entities, filters, selection, and preview panel.

#### Implementation Steps

Add state declarations inside the component:

```typescript
export default function TranslationsPage() {
  // ... existing router/context setup

  // Entity data state
  const [entities, setEntities] = useState<TranslationEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Preview panel state
  const [previewEntity, setPreviewEntity] = useState<TranslationEntity | null>(null);

  // Filter state
  const [filters, setFilters] = useState<TranslationFilterState>({
    entityType: 'all',
    status: 'all',
    language: null,
  });

  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Summary statistics
  const [summary, setSummary] = useState({
    total: 0,
    complete: 0,
    partial: 0,
    pending: 0,
    failed: 0,
  });

  // ... rest of component
}
```

#### Acceptance Criteria
- [ ] All state hooks properly typed
- [ ] Initial values match expected defaults
- [ ] `Set<string>` used for O(1) selection lookup
- [ ] No TypeScript errors

---

### Task 4: Implement Data Fetching Logic

**Story Points:** 2 SP
**Priority:** P0 - Core functionality

#### Description
Implement the data fetching function using the Translation Status API endpoint, including support for filters and pagination.

#### Implementation Steps

Add the fetch function:

```typescript
// Data fetching function
const fetchTranslationData = useCallback(async () => {
  if (!user || !selectedPropertyId) {
    setLoading(false);
    return;
  }

  setLoading(true);
  setError(null);

  // Build query parameters
  const params = new URLSearchParams();
  params.set('propertyId', selectedPropertyId);
  params.set('page', page.toString());
  params.set('limit', '50');

  if (filters.entityType !== 'all') {
    params.set('entityType', filters.entityType);
  }
  if (filters.status !== 'all') {
    params.set('status', filters.status);
  }
  if (filters.language) {
    params.set('missingLanguage', filters.language);
  }

  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (currentAccount) {
    headers['x-current-account'] = currentAccount.id;
  }

  try {
    const response = await fetch(`/api/translations/status?${params.toString()}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch translation status: ${response.status}`);
    }

    const data: TranslationStatusResponse = await response.json();

    setEntities(data.items);
    setSummary(data.summary);
    setTotalCount(data.pagination.total);
    setHasMore(data.pagination.hasMore);
  } catch (err) {
    console.error('Error fetching translation data:', err);
    setError(err instanceof Error ? err : new Error('Failed to fetch translation data'));
  } finally {
    setLoading(false);
  }
}, [user, currentAccount, selectedPropertyId, page, filters]);

// Fetch on mount and when dependencies change
useEffect(() => {
  fetchTranslationData();
}, [fetchTranslationData]);
```

#### Acceptance Criteria
- [ ] Function fetches from `/api/translations/status`
- [ ] Query parameters built correctly from filters
- [ ] Account header included for access validation
- [ ] Loading states properly managed
- [ ] Error handling with descriptive messages
- [ ] useEffect triggers refetch on dependency changes

---

### Task 5: Implement Selection Handlers

**Story Points:** 1 SP
**Priority:** P1 - Required for bulk operations

#### Description
Implement handler functions for row selection, select all, and clear selection.

#### Implementation Steps

Add handler functions:

```typescript
// Selection handlers
const handleSelectionChange = useCallback((id: string, selected: boolean) => {
  setSelectedIds((prev) => {
    const next = new Set(prev);
    if (selected) {
      next.add(id);
    } else {
      next.delete(id);
    }
    return next;
  });
}, []);

const handleSelectAll = useCallback(() => {
  if (selectedIds.size === entities.length) {
    // Deselect all if all are selected
    setSelectedIds(new Set());
  } else {
    // Select all visible entities
    setSelectedIds(new Set(entities.map((e) => e.id)));
  }
}, [entities, selectedIds.size]);

const handleClearSelection = useCallback(() => {
  setSelectedIds(new Set());
}, []);

// Computed selection state
const isAllSelected = entities.length > 0 && selectedIds.size === entities.length;
const isSomeSelected = selectedIds.size > 0 && selectedIds.size < entities.length;
```

#### Acceptance Criteria
- [ ] Individual row selection toggles correctly
- [ ] Select all selects all visible entities
- [ ] Select all toggles to deselect when all selected
- [ ] Clear selection empties the set
- [ ] Computed `isAllSelected` and `isSomeSelected` work correctly

---

### Task 6: Implement Filter Change Handler

**Story Points:** 1 SP
**Priority:** P1 - Required for filtering

#### Description
Implement the filter change handler that updates filter state and resets pagination.

#### Implementation Steps

Add filter handler:

```typescript
// Filter handler
const handleFilterChange = useCallback((newFilters: Partial<TranslationFilterState>) => {
  setFilters((prev) => ({
    ...prev,
    ...newFilters,
  }));
  // Reset pagination when filters change
  setPage(1);
  // Clear selection when filters change
  setSelectedIds(new Set());
}, []);
```

#### Acceptance Criteria
- [ ] Filter updates merge with existing state
- [ ] Page resets to 1 when filters change
- [ ] Selection clears when filters change
- [ ] Triggers data refetch via useEffect

---

### Task 7: Implement Row Click and Action Handlers

**Story Points:** 1 SP
**Priority:** P1 - Required for navigation and preview

#### Description
Implement handlers for clicking entity names (navigation) and language status cells (preview panel).

#### Implementation Steps

Add action handlers:

```typescript
// Navigation handlers
const handleEntityClick = useCallback((entity: TranslationEntity) => {
  // Navigate to entity edit page based on type
  const routes: Record<string, string> = {
    item: `/dashboard2/items/${entity.entityId}/edit`,
    article: `/dashboard2/instructions/${entity.entityId}/edit`,
    link: `/dashboard2/items`, // Links don't have dedicated edit pages
  };
  router.push(routes[entity.entityType] || '/dashboard2');
}, [router]);

const handleLanguageStatusClick = useCallback((entity: TranslationEntity) => {
  setPreviewEntity(entity);
}, []);

const handleClosePreview = useCallback(() => {
  setPreviewEntity(null);
}, []);

// Bulk action complete handler
const handleBulkComplete = useCallback(() => {
  // Refresh data after bulk operation
  fetchTranslationData();
  // Clear selection
  setSelectedIds(new Set());
}, [fetchTranslationData]);
```

#### Acceptance Criteria
- [ ] Entity click navigates to correct edit page
- [ ] Language status click opens preview panel
- [ ] Preview panel closes correctly
- [ ] Bulk complete refreshes data and clears selection

---

### Task 8: Implement Page Header Section

**Story Points:** 0.5 SP
**Priority:** P1 - UI component

#### Description
Implement the page header with title, description, and summary statistics.

#### Implementation Steps

Add to the return JSX:

```typescript
return (
  <div className="space-y-6">
    {/* Page Header */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Translation Management</h1>
        <p className="text-gray-600 mt-1">
          Manage translations across all your content
        </p>
      </div>

      {/* Summary Stats */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="text-gray-600">{summary.complete} complete</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span className="text-gray-600">{summary.partial} partial</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
          <span className="text-gray-600">{summary.pending} pending</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <span className="text-gray-600">{summary.failed} failed</span>
        </div>
      </div>
    </div>

    {/* ... rest of content */}
  </div>
);
```

#### Acceptance Criteria
- [ ] Header displays title "Translation Management"
- [ ] Subtitle explains purpose
- [ ] Summary statistics display with correct colors
- [ ] Responsive layout for mobile/desktop

---

### Task 9: Implement Filter Bar Component

**Story Points:** 1 SP
**Priority:** P1 - Required for filtering

#### Description
Implement the filter bar with three dropdown controls for content type, status, and language filtering.

#### Implementation Steps

Add filter bar JSX (import TranslationStatusFilter if available, or implement inline):

```typescript
import { Globe, Package, FileText, Link2 } from 'lucide-react';

// In the return JSX, after header:

{/* Filter Bar */}
<div className="bg-white rounded-lg border border-gray-200 p-4">
  <div className="flex flex-col sm:flex-row gap-4">
    {/* Content Type Filter */}
    <div className="flex-1 sm:max-w-[200px]">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Content Type
      </label>
      <select
        value={filters.entityType}
        onChange={(e) => handleFilterChange({ entityType: e.target.value as TranslationFilterState['entityType'] })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
      >
        <option value="all">All Types</option>
        <option value="item">Items</option>
        <option value="article">Articles</option>
        <option value="link">Links</option>
      </select>
    </div>

    {/* Status Filter */}
    <div className="flex-1 sm:max-w-[200px]">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Translation Status
      </label>
      <select
        value={filters.status}
        onChange={(e) => handleFilterChange({ status: e.target.value as TranslationFilterState['status'] })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
      >
        <option value="all">All Status</option>
        <option value="fully_translated">Fully Translated</option>
        <option value="partially_translated">Partially Translated</option>
        <option value="pending">Pending</option>
        <option value="failed">Failed</option>
        <option value="manual">Manually Edited</option>
      </select>
    </div>

    {/* Language Filter */}
    <div className="flex-1 sm:max-w-[200px]">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Missing Language
      </label>
      <select
        value={filters.language || ''}
        onChange={(e) => handleFilterChange({ language: (e.target.value || null) as SupportedLanguage | null })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
      >
        <option value="">Any Language</option>
        <option value="en">English (EN)</option>
        <option value="es">Spanish (ES)</option>
        <option value="fr">French (FR)</option>
        <option value="de">German (DE)</option>
        <option value="it">Italian (IT)</option>
        <option value="nl">Dutch (NL)</option>
      </select>
    </div>

    {/* Result Count */}
    <div className="flex items-end">
      <p className="text-sm text-gray-500 pb-2">
        Showing {entities.length} of {totalCount} items
      </p>
    </div>
  </div>
</div>
```

#### Acceptance Criteria
- [ ] Three filter dropdowns render correctly
- [ ] Content type filter has: All, Items, Articles, Links
- [ ] Status filter has: All, Fully Translated, Partially, Pending, Failed, Manual
- [ ] Language filter has: Any, plus all 6 supported languages
- [ ] Result count displays correctly
- [ ] Filters are responsive on mobile

---

### Task 10: Implement Translation Table Component

**Story Points:** 2 SP
**Priority:** P0 - Core UI component

#### Description
Implement the main translation table with columns for selection, name, type, language statuses, and actions.

#### Implementation Steps

Add table JSX (use TranslationStatusColumn if available):

```typescript
import { Check, ExternalLink, RotateCw } from 'lucide-react';

// Type icons mapping
const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  item: Package,
  article: FileText,
  link: Link2,
};

// Status color mapping
const statusColors: Record<TranslationStatus, string> = {
  pending: 'bg-amber-500',
  processing: 'bg-amber-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
  manual: 'bg-violet-500',
};

const languages: SupportedLanguage[] = ['en', 'es', 'fr', 'de', 'it', 'nl'];

// In return JSX, after filter bar:

{/* Translation Table */}
<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {/* Checkbox Column */}
          <th scope="col" className="w-10 px-4 py-3">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={(el) => {
                if (el) el.indeterminate = isSomeSelected;
              }}
              onChange={handleSelectAll}
              className="h-4 w-4 text-[#FF385C] focus:ring-[#FF385C] border-gray-300 rounded"
              aria-label="Select all"
            />
          </th>
          {/* Name Column */}
          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Name
          </th>
          {/* Type Column */}
          <th scope="col" className="w-24 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Type
          </th>
          {/* Language Status Columns */}
          {languages.map((lang) => (
            <th
              key={lang}
              scope="col"
              className="w-16 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {lang.toUpperCase()}
            </th>
          ))}
          {/* Actions Column */}
          <th scope="col" className="w-24 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {entities.map((entity) => {
          const isSelected = selectedIds.has(entity.id);
          const TypeIcon = typeIcons[entity.entityType] || Package;

          return (
            <tr
              key={entity.id}
              className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
            >
              {/* Checkbox */}
              <td className="px-4 py-4">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => handleSelectionChange(entity.id, e.target.checked)}
                  className="h-4 w-4 text-[#FF385C] focus:ring-[#FF385C] border-gray-300 rounded"
                  aria-label={`Select ${entity.name}`}
                />
              </td>
              {/* Name */}
              <td className="px-4 py-4">
                <button
                  onClick={() => handleEntityClick(entity)}
                  className="text-sm font-medium text-gray-900 hover:text-[#FF385C] text-left"
                >
                  {entity.name}
                </button>
              </td>
              {/* Type */}
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <TypeIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500 capitalize">{entity.entityType}</span>
                </div>
              </td>
              {/* Language Status Cells */}
              {languages.map((lang) => {
                const translation = entity.translations[lang];
                const status = translation?.status || 'pending';
                const isSource = entity.sourceLanguage === lang;

                return (
                  <td key={lang} className="px-2 py-4 text-center">
                    <button
                      onClick={() => handleLanguageStatusClick(entity)}
                      className="inline-flex items-center justify-center"
                      title={`${lang.toUpperCase()}: ${isSource ? 'Source' : status}`}
                      aria-label={`${lang.toUpperCase()} translation: ${isSource ? 'Source language' : status}`}
                    >
                      {isSource ? (
                        <span className="w-3 h-3 rounded-full bg-blue-500" title="Source language" />
                      ) : (
                        <span className={`w-3 h-3 rounded-full ${statusColors[status] || 'bg-gray-300'}`} />
                      )}
                    </button>
                  </td>
                );
              })}
              {/* Actions */}
              <td className="px-4 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleLanguageStatusClick(entity)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="View details"
                    aria-label="View translation details"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
</div>
```

#### Acceptance Criteria
- [ ] Table renders with all specified columns
- [ ] Checkbox column supports select all with indeterminate state
- [ ] Name column clickable, navigates to edit page
- [ ] Type column shows icon and label
- [ ] Language columns show colored status dots
- [ ] Source language indicated with blue dot
- [ ] Actions column has view details button
- [ ] Selected rows have blue background
- [ ] Hover state on rows
- [ ] Table is horizontally scrollable on mobile

---

### Task 11: Implement Empty and Loading States

**Story Points:** 0.5 SP
**Priority:** P1 - UX polish

#### Description
Implement empty state when no content matches filters and loading skeleton for initial data fetch.

#### Implementation Steps

Add conditional rendering in the table section:

```typescript
{/* Loading State */}
{loading && (
  <div className="bg-white rounded-lg border border-gray-200 p-8">
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </div>
  </div>
)}

{/* Empty State */}
{!loading && entities.length === 0 && (
  <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
    <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">No translations found</h3>
    <p className="text-gray-500 mb-4">
      {filters.entityType !== 'all' || filters.status !== 'all' || filters.language
        ? 'No content matches your current filters. Try adjusting your filters.'
        : 'Create some content to start managing translations.'}
    </p>
    {(filters.entityType !== 'all' || filters.status !== 'all' || filters.language) && (
      <button
        onClick={() => setFilters({ entityType: 'all', status: 'all', language: null })}
        className="text-[#FF385C] hover:text-[#E31C5F] font-medium"
      >
        Clear all filters
      </button>
    )}
  </div>
)}

{/* Error State */}
{error && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
    <p className="text-red-700">{error.message}</p>
    <button
      onClick={() => {
        setError(null);
        fetchTranslationData();
      }}
      className="mt-2 text-sm text-red-600 underline"
    >
      Try again
    </button>
  </div>
)}
```

#### Acceptance Criteria
- [ ] Loading skeleton displays during fetch
- [ ] Empty state shows when no results
- [ ] Empty state message differs based on filter state
- [ ] Clear filters button appears when filters active
- [ ] Error state shows error message with retry button

---

### Task 12: Integrate BulkTranslationBar Component

**Story Points:** 1 SP
**Priority:** P1 - Bulk operations

#### Description
Integrate the BulkTranslationBar component that appears when items are selected.

#### Implementation Steps

Add BulkTranslationBar (assuming it exists from REQ-E05-018):

```typescript
import { BulkTranslationBar } from '@/components/TranslationManagement/BulkTranslationBar';

// At the end of the return JSX, inside the main div:

{/* Bulk Actions Bar */}
{selectedIds.size > 0 && (
  <BulkTranslationBar
    selectedCount={selectedIds.size}
    selectedIds={Array.from(selectedIds)}
    entityType="mixed"
    onComplete={handleBulkComplete}
    onExitSelection={handleClearSelection}
  />
)}
```

If BulkTranslationBar is not yet available, create a placeholder:

```typescript
{/* Bulk Actions Bar (Placeholder) */}
{selectedIds.size > 0 && (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 transform transition-transform duration-300 ease-in-out z-50">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">
        {selectedIds.size} item{selectedIds.size > 1 ? 's' : ''} selected
      </span>
      <div className="flex items-center gap-4">
        <button
          onClick={() => {/* TODO: Implement bulk re-translate */}}
          className="px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] text-sm font-medium"
        >
          Re-translate All
        </button>
        <button
          onClick={handleClearSelection}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
```

#### Acceptance Criteria
- [ ] Bar appears when items selected
- [ ] Bar shows selection count
- [ ] Re-translate All button present
- [ ] Cancel/clear selection button works
- [ ] Bar fixed at bottom with slide-up animation
- [ ] Bar disappears when selection cleared

---

### Task 13: Integrate TranslationPreviewPanel Component

**Story Points:** 1 SP
**Priority:** P1 - Preview functionality

#### Description
Integrate the TranslationPreviewPanel component that shows when clicking on language status.

#### Implementation Steps

Add TranslationPreviewPanel (assuming it exists from REQ-E05-007):

```typescript
import { TranslationPreviewPanel } from '@/components/TranslationManagement/TranslationPreviewPanel';

// At the end of the return JSX:

{/* Translation Preview Panel */}
{previewEntity && (
  <TranslationPreviewPanel
    entityType={previewEntity.entityType}
    entityId={previewEntity.entityId}
    isOpen={!!previewEntity}
    onClose={handleClosePreview}
  />
)}
```

If TranslationPreviewPanel is not yet available, create a placeholder:

```typescript
{/* Preview Panel (Placeholder) */}
{previewEntity && (
  <div className="fixed inset-y-0 right-0 w-[400px] bg-white shadow-xl border-l border-gray-200 z-50 transform transition-transform duration-300 ease-in-out">
    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
      <h2 className="text-lg font-semibold">Translation Details</h2>
      <button
        onClick={handleClosePreview}
        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        aria-label="Close preview"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
    <div className="p-4">
      <p className="text-sm text-gray-600">
        {previewEntity.entityType}: {previewEntity.name}
      </p>
      {/* TODO: Implement full preview panel */}
    </div>
  </div>
)}
```

#### Acceptance Criteria
- [ ] Panel opens when language status clicked
- [ ] Panel shows entity details
- [ ] Close button works
- [ ] Panel slides in from right
- [ ] Overlay or click-outside closes panel

---

### Task 14: Add Navigation Item to Dashboard Layout

**Story Points:** 0.5 SP
**Priority:** P1 - Discoverability

#### Description
Add the "Translations" navigation item to the dashboard2 layout.

#### File Operations

**Modify:** `/src/app/dashboard2/layout.tsx`

#### Implementation Steps

1. Import the Globe icon:
```typescript
import { Building2, FileText, Globe, LayoutDashboard, Loader2, LogOut, Package } from 'lucide-react';
```

2. Add to the navigationItems array:
```typescript
const navigationItems: NavItem[] = [
  {
    name: 'Dashboard',
    mobileLabel: 'D/B',
    href: '/dashboard2',
    icon: LayoutDashboard,
  },
  {
    name: 'Items',
    mobileLabel: 'Items',
    href: '/dashboard2/items',
    icon: Package,
  },
  {
    name: 'Guides',
    mobileLabel: 'Guide',
    href: '/dashboard2/instructions',
    icon: FileText,
  },
  // Add Translations nav item
  {
    name: 'Translations',
    mobileLabel: 'Trans.',
    href: '/dashboard2/translations',
    icon: Globe,
  },
  {
    name: 'Properties',
    mobileLabel: 'Prop.',
    href: '/dashboard2/properties',
    icon: Building2,
  },
];
```

#### Acceptance Criteria
- [ ] "Translations" appears in navigation
- [ ] Globe icon displays correctly
- [ ] Mobile label shows "Trans."
- [ ] Active state works on Translations page
- [ ] Navigation functional, links to /dashboard2/translations

---

### Task 15: Implement URL Query Parameter Persistence

**Story Points:** 1 SP
**Priority:** P2 - Nice to have

#### Description
Persist filter selections in URL query parameters for shareable filtered views.

#### Implementation Steps

Add URL sync logic:

```typescript
import { useSearchParams } from 'next/navigation';

// Inside component
const searchParams = useSearchParams();

// Initialize filters from URL on mount
useEffect(() => {
  const entityType = searchParams.get('type') as TranslationFilterState['entityType'] || 'all';
  const status = searchParams.get('status') as TranslationFilterState['status'] || 'all';
  const language = searchParams.get('lang') as SupportedLanguage | null;

  setFilters({
    entityType,
    status,
    language,
  });
}, [searchParams]);

// Update URL when filters change
useEffect(() => {
  const params = new URLSearchParams();

  if (filters.entityType !== 'all') {
    params.set('type', filters.entityType);
  }
  if (filters.status !== 'all') {
    params.set('status', filters.status);
  }
  if (filters.language) {
    params.set('lang', filters.language);
  }

  const queryString = params.toString();
  const newUrl = queryString
    ? `/dashboard2/translations?${queryString}`
    : '/dashboard2/translations';

  // Update URL without navigation
  window.history.replaceState(null, '', newUrl);
}, [filters]);
```

#### Acceptance Criteria
- [ ] Filter state reflected in URL query params
- [ ] URL can be shared and filters restore on load
- [ ] Changing filters updates URL
- [ ] No page reload when URL updates

---

## Complete Imports List

For the final implementation, ensure these imports are present:

```typescript
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useAccountContext } from '@/contexts/AuthContext';
import { usePropertyContext } from '@/hooks/usePropertyContext';
import {
  ExternalLink,
  FileText,
  Globe,
  Link2,
  Loader2,
  Package,
  X,
} from 'lucide-react';
import type { SupportedLanguage, TranslationStatus } from '@/lib/translation-service/translation-service.types';

// Component imports (when available)
// import { TranslationPreviewPanel } from '@/components/TranslationManagement/TranslationPreviewPanel';
// import { BulkTranslationBar } from '@/components/TranslationManagement/BulkTranslationBar';
// import { TranslationStatusColumn } from '@/components/TranslationManagement/TranslationStatusColumn';
```

---

## Post-Implementation Verification

### Build Verification
```bash
npm run build
# Should complete without errors
```

### Manual Testing Checklist
- [ ] Navigate to `/dashboard2/translations` from dashboard
- [ ] Verify page loads with translation data
- [ ] Test filter dropdowns (all three)
- [ ] Select individual rows
- [ ] Select all rows with header checkbox
- [ ] Click entity name - navigates to edit page
- [ ] Click language status dot - opens preview panel
- [ ] Verify bulk action bar appears on selection
- [ ] Clear selection and verify bar disappears
- [ ] Test empty state with restrictive filters
- [ ] Test loading state (throttle network in DevTools)
- [ ] Test error state (disable network in DevTools)
- [ ] Verify responsive layout on mobile viewport
- [ ] Test keyboard navigation through table

### Accessibility Testing
- [ ] Tab through all interactive elements
- [ ] Verify screen reader announces table structure
- [ ] Verify ARIA labels on buttons and checkboxes
- [ ] Test with keyboard only (no mouse)

---

## Notes for Implementer

1. **Fallback Components**: Tasks 12 and 13 include placeholder implementations in case the dependent components (BulkTranslationBar, TranslationPreviewPanel) are not yet available. Replace with actual component imports when ready.

2. **API Dependency**: Task 4 requires the Translation Status API (REQ-E05-001) to be implemented. If not available, use mock data during development.

3. **Realtime Updates**: Optional enhancement - integrate `useTranslationRealtime` hook (REQ-E05-012) to show live updates when translation jobs complete.

4. **Performance**: For large datasets (500+ items), consider implementing virtualization using a library like `react-window` or `react-virtual`.

5. **Testing**: Unit tests for state management and handlers should be added in a follow-up task.

---

## References

- Overview Document: `/docs/REQ-E05-019-create-translation-management-page-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Request Definition: `/docs/gen_requests_epic5.md` (REQ-E05-020)
- Pattern Reference: `/src/app/dashboard2/items/page.tsx`
- Layout Reference: `/src/app/dashboard2/layout.tsx`
