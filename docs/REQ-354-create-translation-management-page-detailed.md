# REQ-354: Create Translation Management Page - Detailed Task Breakdown

**Document Type:** Detailed Implementation Specification
**Created:** 2026-01-19 23:50:00 UTC
**Last Modified:** 2026-01-19 23:50:00 UTC
**Request Type:** NEW FEATURE
**Size:** L (Large)
**Phase:** 4 - Bulk Operations & Management Page
**Task ID:** 4.3
**Epic:** L10N Epic 5 - Owner Translation Management
**Dependencies:**
- REQ-336 (Translation Status API)
- REQ-351 (TranslationStatusColumn component)
- REQ-353 (TranslationStatusFilter component)
- REQ-4.1 (BulkTranslationBar component)
- REQ-4.2 (LanguageSelectorDialog component)
- REQ-2.2 (TranslationPreviewPanel component)
- Epic 1 (Foundation), Epic 3 (Dynamic Content Translation)

**Overview Document:** `docs/REQ-354-create-translation-management-page-overview.md`
**Requirements Source:** `docs/gen_requests_epic5.md` (Request #354)
**Implementation Plan:** `docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`

---

## Executive Summary

This document provides granular, actionable tasks for creating a centralized Translation Management page at `/dashboard2/translations`. Property owners will view, filter, and manage translations for all their content (items, articles, links) across all six supported languages (en, fr, es, de, nl, it) in a unified interface with table display, multi-criteria filtering, bulk selection, and real-time status updates.

**Total Estimated Effort:** 12.5 story points

---

## Pre-Implementation Checklist

Before starting implementation, verify the following dependencies are complete:

- [ ] **Translation Status API:** `GET /api/translations/status` endpoint exists and returns `TranslationStatusResponse`
- [ ] **Re-translate API:** `POST /api/translations/retranslate` endpoint exists for bulk operations
- [ ] **TranslationStatusColumn:** Component exists at `/src/components/TranslationManagement/TranslationStatusColumn/`
- [ ] **TranslationStatusFilter:** Component exists at `/src/components/TranslationManagement/TranslationStatusFilter/`
- [ ] **BulkTranslationBar:** Component exists at `/src/components/TranslationManagement/BulkTranslationBar/`
- [ ] **LanguageSelectorDialog:** Component exists at `/src/components/TranslationManagement/BulkTranslationBar/`
- [ ] **TranslationPreviewPanel:** Component exists at `/src/components/TranslationManagement/TranslationPreviewPanel/`
- [ ] **TranslationManagement.types.ts:** Shared types file exists with `TranslationStatusItem`, `TranslationStatusMap`
- [ ] **i18n Config:** `SupportedLocale` type available from `/src/lib/i18n/config.ts`
- [ ] **useTranslationStatus hook:** Hook exists at `/src/hooks/useTranslationStatus.ts`
- [ ] **useTranslationRealtime hook:** Hook exists at `/src/hooks/useTranslationRealtime.ts`

---

## Task 1: Create Page File Structure and Basic Layout

**File:** `/src/app/dashboard2/translations/page.tsx`
**Estimated Effort:** 1 story point
**Status:** [ ] Not Started

### 1.1 Create Page Directory and File

Create the new file at `/src/app/dashboard2/translations/page.tsx`:

```typescript
'use client';

/**
 * Translation Management Page
 *
 * Centralized interface for property owners to view, filter, and manage
 * translations for all their content (items, articles, links) across
 * all supported languages.
 *
 * @route /dashboard2/translations
 * @module Dashboard/Translations
 * @created 2026-01-19
 * @lastModified 2026-01-19 (REQ-354)
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Languages, RefreshCw, Search, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePropertyContext } from '@/hooks/usePropertyContext';
import type { SupportedLocale } from '@/lib/i18n/config';

// Types for the page state (to be defined in later tasks)
interface TranslationManagementPageProps {}

export default function TranslationManagementPage({}: TranslationManagementPageProps) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 rounded-lg">
            <Languages className="h-6 w-6 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Translation Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage translations for all your content across supported languages
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar Placeholder */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-gray-500 text-sm">Filter bar will be implemented in Task 7</p>
      </div>

      {/* Table Placeholder */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <p className="text-gray-500 text-sm p-8 text-center">
          Translation table will be implemented in Tasks 3-5
        </p>
      </div>
    </div>
  );
}
```

### 1.2 Verify Page Route

Navigate to `/dashboard2/translations` and verify the page renders with:
- Page header with Languages icon
- Title "Translation Management"
- Subtitle description
- Placeholder filter bar
- Placeholder table area

### Verification Criteria for Task 1

- [ ] File exists at `/src/app/dashboard2/translations/page.tsx`
- [ ] Page is accessible at `/dashboard2/translations`
- [ ] Page renders header with icon and title
- [ ] 'use client' directive is present
- [ ] No TypeScript compilation errors

---

## Task 2: Implement Data Fetching Hook and State Management

**File:** `/src/app/dashboard2/translations/page.tsx`
**Estimated Effort:** 1.5 story points
**Status:** [ ] Not Started

### 2.1 Define Page State Interface

Add state interface and type definitions after the imports:

```typescript
import type { TranslationStatusItem, TranslationStatusMap } from '@/components/TranslationManagement';

/**
 * Filter options for translation management.
 */
type TranslationTypeFilter = 'all' | 'item' | 'article' | 'link';
type TranslationStatusFilter = 'all' | 'complete' | 'partial' | 'pending' | 'failed' | 'manual';

interface TranslationManagementFilters {
  type: TranslationTypeFilter;
  languages: SupportedLocale[];
  status: TranslationStatusFilter;
  search: string;
}

interface TranslationManagementState {
  // Data
  items: TranslationStatusItem[];
  isLoading: boolean;
  error: string | null;

  // Filters
  filters: TranslationManagementFilters;

  // Selection
  selectedIds: Set<string>;

  // Preview panel
  previewEntityType: 'article' | 'item' | 'link' | null;
  previewEntityId: string | null;
  isPreviewOpen: boolean;
}

const INITIAL_FILTERS: TranslationManagementFilters = {
  type: 'all',
  languages: [],
  status: 'all',
  search: '',
};
```

### 2.2 Implement Data Fetching

Add the data fetching logic within the component:

```typescript
export default function TranslationManagementPage({}: TranslationManagementPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedPropertyId } = usePropertyContext();

  // State
  const [items, setItems] = useState<TranslationStatusItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TranslationManagementFilters>(INITIAL_FILTERS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewState, setPreviewState] = useState<{
    entityType: 'article' | 'item' | 'link' | null;
    entityId: string | null;
    isOpen: boolean;
  }>({ entityType: null, entityId: null, isOpen: false });

  /**
   * Fetch translation status data from API.
   */
  const fetchTranslationStatus = useCallback(async () => {
    if (!selectedPropertyId) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('propertyId', selectedPropertyId);

      const response = await fetch(`/api/translations/status?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch translation status: ${response.statusText}`);
      }

      const data = await response.json();
      setItems(data.items || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch translation data';
      setError(message);
      console.error('Translation fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPropertyId]);

  // Fetch data on mount and when property changes
  useEffect(() => {
    fetchTranslationStatus();
  }, [fetchTranslationStatus]);

  // Log fetched data for verification
  useEffect(() => {
    if (items.length > 0) {
      console.log('[TranslationManagementPage] Fetched items:', items);
    }
  }, [items]);

  // ... rest of component
}
```

### 2.3 Add Error and Loading Display

Update the return statement to show loading and error states:

```typescript
  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header (same as before) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* ... header content ... */}
        </div>

        {/* Loading skeleton */}
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
            <span className="ml-3 text-gray-500">Loading translations...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        {/* Header (same as before) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* ... header content ... */}
        </div>

        {/* Error display */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={fetchTranslationStatus}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
```

### Verification Criteria for Task 2

- [ ] State interfaces are properly typed
- [ ] `fetchTranslationStatus` function fetches from `/api/translations/status`
- [ ] useEffect triggers fetch on mount and property change
- [ ] Loading state displays spinner and message
- [ ] Error state displays error message with retry button
- [ ] Console log shows fetched data for debugging
- [ ] No TypeScript errors

---

## Task 3: Build Table Structure with Static Columns

**File:** `/src/app/dashboard2/translations/page.tsx`
**Estimated Effort:** 1 story point
**Status:** [ ] Not Started

### 3.1 Define Supported Languages Constant

Add at the top of the file after imports:

```typescript
/**
 * Supported languages for translation display.
 * Order matches the table columns.
 */
const SUPPORTED_LANGUAGES: SupportedLocale[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];

/**
 * Language display names for column headers.
 */
const LANGUAGE_LABELS: Record<SupportedLocale, string> = {
  en: 'EN',
  fr: 'FR',
  es: 'ES',
  de: 'DE',
  nl: 'NL',
  it: 'IT',
};
```

### 3.2 Create Table Header Component

Add helper function for table header:

```typescript
/**
 * Renders the table header row.
 */
function TableHeader({
  isSelectAll,
  onSelectAll,
  hasItems,
}: {
  isSelectAll: boolean;
  onSelectAll: (checked: boolean) => void;
  hasItems: boolean;
}) {
  return (
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        {/* Checkbox column */}
        <th scope="col" className="w-10 px-4 py-3">
          <input
            type="checkbox"
            checked={isSelectAll}
            onChange={(e) => onSelectAll(e.target.checked)}
            disabled={!hasItems}
            className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500 disabled:opacity-50"
            aria-label="Select all rows"
          />
        </th>

        {/* Name column */}
        <th
          scope="col"
          className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
        >
          Name
        </th>

        {/* Type column */}
        <th
          scope="col"
          className="w-20 px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
        >
          Type
        </th>

        {/* Language columns */}
        {SUPPORTED_LANGUAGES.map((lang) => (
          <th
            key={lang}
            scope="col"
            className="w-10 px-2 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
          >
            {LANGUAGE_LABELS[lang]}
          </th>
        ))}

        {/* Actions column */}
        <th
          scope="col"
          className="w-16 px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider"
        >
          <span className="sr-only">Actions</span>
        </th>
      </tr>
    </thead>
  );
}
```

### 3.3 Update Main Return with Table Structure

Replace the table placeholder with actual structure:

```typescript
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 rounded-lg">
            <Languages className="h-6 w-6 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Translation Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage translations for all your content across supported languages
            </p>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchTranslationStatus}
          disabled={isLoading}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300',
            'bg-white text-gray-700 hover:bg-gray-50 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2',
            isLoading && 'opacity-50 cursor-not-allowed'
          )}
        >
          <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Filter Bar Placeholder */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-gray-500 text-sm">Filter bar will be implemented in Task 7</p>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {items.length} items
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <TableHeader
              isSelectAll={false}
              onSelectAll={() => {}}
              hasItems={items.length > 0}
            />
            <tbody className="bg-white divide-y divide-gray-200">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={3 + SUPPORTED_LANGUAGES.length + 1} className="px-4 py-12 text-center">
                    <p className="text-gray-500">No translatable content found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Create items, articles, or links to see them here
                    </p>
                  </td>
                </tr>
              ) : (
                /* Rows will be added in Task 4 */
                <tr>
                  <td colSpan={3 + SUPPORTED_LANGUAGES.length + 1} className="px-4 py-8 text-center text-gray-500">
                    Table rows will be implemented in Task 4
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
```

### Verification Criteria for Task 3

- [ ] Table renders with proper semantic HTML (`<table>`, `<thead>`, `<tbody>`)
- [ ] Header row includes: Checkbox, Name, Type, 6 language columns, Actions
- [ ] Language columns are compact (40px width)
- [ ] Checkbox has proper aria-label
- [ ] Empty state message displays when no items
- [ ] Table has horizontal scroll on mobile (`overflow-x-auto`)
- [ ] Refresh button in header works

---

## Task 4: Implement Table Row Rendering

**File:** `/src/app/dashboard2/translations/page.tsx`
**Estimated Effort:** 1 story point
**Status:** [ ] Not Started

### 4.1 Create Type Badge Component

Add helper component for content type badges:

```typescript
/**
 * Badge component for content type display.
 */
function TypeBadge({ type }: { type: 'article' | 'item' | 'link' }) {
  const styles = {
    item: 'bg-blue-100 text-blue-800',
    article: 'bg-green-100 text-green-800',
    link: 'bg-purple-100 text-purple-800',
  };

  const labels = {
    item: 'Item',
    article: 'Article',
    link: 'Link',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
        styles[type]
      )}
    >
      {labels[type]}
    </span>
  );
}
```

### 4.2 Create Table Row Component

Add the table row component:

```typescript
/**
 * Single row in the translation management table.
 */
function TranslationTableRow({
  item,
  isSelected,
  onSelect,
  onPreviewClick,
  onActionsClick,
}: {
  item: TranslationStatusItem;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onPreviewClick: (item: TranslationStatusItem) => void;
  onActionsClick: (item: TranslationStatusItem, action: string) => void;
}) {
  // Generate unique row ID
  const rowId = `${item.entityType}-${item.entityId}`;

  return (
    <tr
      className={cn(
        'hover:bg-gray-50 transition-colors',
        isSelected && 'bg-violet-50'
      )}
    >
      {/* Checkbox */}
      <td className="w-10 px-4 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(rowId, e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
          aria-label={`Select ${item.name}`}
        />
      </td>

      {/* Name */}
      <td className="px-4 py-4">
        <button
          onClick={() => onPreviewClick(item)}
          className="text-left group"
        >
          <span className="text-sm font-medium text-gray-900 group-hover:text-violet-600 transition-colors line-clamp-1">
            {item.name}
          </span>
        </button>
      </td>

      {/* Type Badge */}
      <td className="w-20 px-4 py-4">
        <TypeBadge type={item.entityType} />
      </td>

      {/* Language Status Columns - Placeholder */}
      {SUPPORTED_LANGUAGES.map((lang) => (
        <td key={lang} className="w-10 px-2 py-4 text-center">
          <span className="text-gray-400">-</span>
        </td>
      ))}

      {/* Actions */}
      <td className="w-16 px-4 py-4 text-right">
        <button
          onClick={() => onActionsClick(item, 'menu')}
          className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
          aria-label={`Actions for ${item.name}`}
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}
```

### 4.3 Wire Up Row Rendering in Main Component

Update the tbody to render actual rows:

```typescript
<tbody className="bg-white divide-y divide-gray-200">
  {items.length === 0 ? (
    <tr>
      <td colSpan={3 + SUPPORTED_LANGUAGES.length + 1} className="px-4 py-12 text-center">
        <p className="text-gray-500">No translatable content found</p>
        <p className="text-sm text-gray-400 mt-1">
          Create items, articles, or links to see them here
        </p>
      </td>
    </tr>
  ) : (
    items.map((item) => {
      const rowId = `${item.entityType}-${item.entityId}`;
      return (
        <TranslationTableRow
          key={rowId}
          item={item}
          isSelected={selectedIds.has(rowId)}
          onSelect={handleRowSelect}
          onPreviewClick={handlePreviewClick}
          onActionsClick={handleActionsClick}
        />
      );
    })
  )}
</tbody>
```

### 4.4 Add Placeholder Handlers

Add placeholder handlers (to be fully implemented in later tasks):

```typescript
  /**
   * Handle individual row selection.
   */
  const handleRowSelect = useCallback((id: string, selected: boolean) => {
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

  /**
   * Handle preview click.
   */
  const handlePreviewClick = useCallback((item: TranslationStatusItem) => {
    console.log('[Preview]', item);
    setPreviewState({
      entityType: item.entityType,
      entityId: item.entityId,
      isOpen: true,
    });
  }, []);

  /**
   * Handle actions menu click.
   */
  const handleActionsClick = useCallback((item: TranslationStatusItem, action: string) => {
    console.log('[Action]', action, item);
  }, []);
```

### Verification Criteria for Task 4

- [ ] Rows render for each item in the data
- [ ] Name column shows content name with truncation (`line-clamp-1`)
- [ ] Type badge shows with correct colors (Item=blue, Article=green, Link=purple)
- [ ] Checkbox renders on each row
- [ ] Clicking name triggers preview click handler
- [ ] Actions button renders in last column
- [ ] Selected rows have highlighted background (`bg-violet-50`)
- [ ] No TypeScript errors

---

## Task 5: Integrate TranslationStatusColumn for Language Indicators

**File:** `/src/app/dashboard2/translations/page.tsx`
**Estimated Effort:** 1 story point
**Status:** [ ] Not Started

### 5.1 Import TranslationStatusColumn

Add import at the top of the file:

```typescript
import { TranslationStatusColumn } from '@/components/TranslationManagement';
```

### 5.2 Update Language Status Cells in TableRow

Replace the placeholder language cells with TranslationStatusColumn:

```typescript
{/* Language Status Columns */}
{SUPPORTED_LANGUAGES.map((lang) => {
  const translationStatus = item.translations[lang];
  const isSource = lang === item.sourceLanguage;

  return (
    <td key={lang} className="w-10 px-2 py-4 text-center">
      {isSource ? (
        // Source language indicator
        <span
          className="inline-flex items-center justify-center w-5 h-5 text-blue-500"
          title={`Source language (${lang.toUpperCase()})`}
        >
          <span className="text-sm">●</span>
        </span>
      ) : translationStatus ? (
        // Translation status indicator
        <StatusIndicator status={translationStatus.status} language={lang} />
      ) : (
        // No translation
        <span
          className="inline-flex items-center justify-center w-5 h-5 text-gray-300"
          title={`No ${lang.toUpperCase()} translation`}
        >
          <span className="text-sm">○</span>
        </span>
      )}
    </td>
  );
})}
```

### 5.3 Create StatusIndicator Helper Component

Add the status indicator component:

```typescript
/**
 * Status indicator for a single language translation.
 */
function StatusIndicator({
  status,
  language,
}: {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'manual';
  language: SupportedLocale;
}) {
  const config = {
    completed: {
      icon: '✓',
      color: 'text-green-500',
      title: 'Completed',
    },
    manual: {
      icon: '✎',
      color: 'text-violet-500',
      title: 'Manually edited',
    },
    pending: {
      icon: '⏳',
      color: 'text-amber-500',
      title: 'Pending',
    },
    processing: {
      icon: '⏳',
      color: 'text-amber-500 animate-pulse',
      title: 'Processing',
    },
    failed: {
      icon: '❌',
      color: 'text-red-500',
      title: 'Failed',
    },
  };

  const { icon, color, title } = config[status] || config.pending;

  return (
    <span
      className={cn('inline-flex items-center justify-center w-5 h-5', color)}
      title={`${language.toUpperCase()}: ${title}`}
      role="img"
      aria-label={`${language.toUpperCase()} translation ${title.toLowerCase()}`}
    >
      <span className="text-sm">{icon}</span>
    </span>
  );
}
```

### Verification Criteria for Task 5

- [ ] TranslationStatusColumn imported and renders
- [ ] Source language shows blue dot (●)
- [ ] Completed translations show green checkmark (✓)
- [ ] Manual edits show purple pencil (✎)
- [ ] Pending/Processing shows amber hourglass (⏳)
- [ ] Failed shows red X (❌)
- [ ] Missing translations show gray hollow circle (○)
- [ ] Each indicator has proper title/tooltip
- [ ] ARIA labels are present for accessibility

---

## Task 6: Implement Row Selection Logic

**File:** `/src/app/dashboard2/translations/page.tsx`
**Estimated Effort:** 0.75 story points
**Status:** [ ] Not Started

### 6.1 Implement Select All Logic

Update the handlers and add select all functionality:

```typescript
  /**
   * Handle select all checkbox.
   */
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const allIds = new Set(
        filteredItems.map((item) => `${item.entityType}-${item.entityId}`)
      );
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  }, [filteredItems]);

  /**
   * Check if all visible items are selected.
   */
  const isAllSelected = useMemo(() => {
    if (filteredItems.length === 0) return false;
    return filteredItems.every((item) =>
      selectedIds.has(`${item.entityType}-${item.entityId}`)
    );
  }, [filteredItems, selectedIds]);

  /**
   * Check if some (but not all) items are selected.
   */
  const isSomeSelected = useMemo(() => {
    return selectedIds.size > 0 && !isAllSelected;
  }, [selectedIds.size, isAllSelected]);
```

### 6.2 Add filteredItems Memoization

Add the filtered items computation (filter logic to be completed in Task 8):

```typescript
  /**
   * Apply filters to items (placeholder - full implementation in Task 8).
   */
  const filteredItems = useMemo(() => {
    // For now, return all items
    return items;
  }, [items]);
```

### 6.3 Update TableHeader Props

Update the TableHeader to use actual selection state:

```typescript
<TableHeader
  isSelectAll={isAllSelected}
  isSomeSelected={isSomeSelected}
  onSelectAll={handleSelectAll}
  hasItems={filteredItems.length > 0}
/>
```

### 6.4 Update TableHeader Component

Modify TableHeader to handle indeterminate state:

```typescript
function TableHeader({
  isSelectAll,
  isSomeSelected,
  onSelectAll,
  hasItems,
}: {
  isSelectAll: boolean;
  isSomeSelected?: boolean;
  onSelectAll: (checked: boolean) => void;
  hasItems: boolean;
}) {
  // Handle indeterminate state
  const checkboxRef = useCallback((el: HTMLInputElement | null) => {
    if (el) {
      el.indeterminate = isSomeSelected || false;
    }
  }, [isSomeSelected]);

  return (
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        {/* Checkbox column */}
        <th scope="col" className="w-10 px-4 py-3">
          <input
            ref={checkboxRef}
            type="checkbox"
            checked={isSelectAll}
            onChange={(e) => onSelectAll(e.target.checked)}
            disabled={!hasItems}
            className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500 disabled:opacity-50"
            aria-label={isSelectAll ? 'Deselect all rows' : 'Select all rows'}
          />
        </th>
        {/* ... rest of header columns ... */}
      </tr>
    </thead>
  );
}
```

### 6.5 Update Results Count to Show Selection

Update the results count display:

```typescript
{/* Results Count */}
<div className="flex items-center justify-between text-sm text-gray-600">
  <span>Showing {filteredItems.length} of {items.length} items</span>
  {selectedIds.size > 0 && (
    <span className="text-violet-600 font-medium">
      {selectedIds.size} selected
    </span>
  )}
</div>
```

### Verification Criteria for Task 6

- [ ] Individual row selection works (click checkbox toggles selection)
- [ ] Select All selects all visible rows
- [ ] Deselect All clears all selections
- [ ] Indeterminate state shows when some (but not all) selected
- [ ] Selection count displays when items selected
- [ ] Selected rows visually highlighted
- [ ] Selection state persists during scrolling

---

## Task 7: Build Filter Bar Component

**File:** `/src/app/dashboard2/translations/page.tsx`
**Estimated Effort:** 1.5 story points
**Status:** [ ] Not Started

### 7.1 Create Filter Bar Component

Add the filter bar component:

```typescript
/**
 * Filter bar for translation management.
 */
function FilterBar({
  filters,
  onFiltersChange,
  onClear,
  totalCount,
}: {
  filters: TranslationManagementFilters;
  onFiltersChange: (filters: TranslationManagementFilters) => void;
  onClear: () => void;
  totalCount: number;
}) {
  const hasActiveFilters =
    filters.type !== 'all' ||
    filters.languages.length > 0 ||
    filters.status !== 'all' ||
    filters.search.trim() !== '';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name..."
            value={filters.search}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            className={cn(
              'w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg',
              'text-sm placeholder:text-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
            )}
          />
          {filters.search && (
            <button
              onClick={() => onFiltersChange({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="type-filter" className="text-sm text-gray-600 whitespace-nowrap">
            Type:
          </label>
          <select
            id="type-filter"
            value={filters.type}
            onChange={(e) =>
              onFiltersChange({ ...filters, type: e.target.value as TranslationTypeFilter })
            }
            className={cn(
              'px-3 py-2 border border-gray-300 rounded-lg text-sm',
              'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
            )}
          >
            <option value="all">All Types</option>
            <option value="item">Items</option>
            <option value="article">Articles</option>
            <option value="link">Links</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="text-sm text-gray-600 whitespace-nowrap">
            Status:
          </label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(e) =>
              onFiltersChange({ ...filters, status: e.target.value as TranslationStatusFilter })
            }
            className={cn(
              'px-3 py-2 border border-gray-300 rounded-lg text-sm',
              'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
            )}
          >
            <option value="all">All Statuses</option>
            <option value="complete">Fully Translated</option>
            <option value="partial">Partially Translated</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="manual">Manually Edited</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className={cn(
              'flex items-center gap-1 px-3 py-2 rounded-lg text-sm',
              'text-gray-600 hover:bg-gray-100 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-violet-500'
            )}
          >
            <X className="h-4 w-4" />
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}
```

### 7.2 Replace Filter Bar Placeholder

Replace the placeholder with the actual FilterBar:

```typescript
{/* Filter Bar */}
<FilterBar
  filters={filters}
  onFiltersChange={setFilters}
  onClear={() => setFilters(INITIAL_FILTERS)}
  totalCount={items.length}
/>
```

### Verification Criteria for Task 7

- [ ] Search input filters by name
- [ ] Clear button appears in search when text entered
- [ ] Type dropdown filters by Item/Article/Link
- [ ] Status dropdown filters by translation status
- [ ] Clear All button appears when any filter is active
- [ ] Clear All resets all filters to initial state
- [ ] Filters are responsive (stack on mobile)
- [ ] All inputs have proper labels for accessibility

---

## Task 8: Connect Filters to Data

**File:** `/src/app/dashboard2/translations/page.tsx`
**Estimated Effort:** 1 story point
**Status:** [ ] Not Started

### 8.1 Implement Full Filter Logic

Update the `filteredItems` memoization with complete filter logic:

```typescript
  /**
   * Compute the overall status of an item based on its translations.
   */
  const getOverallStatus = useCallback((item: TranslationStatusItem): TranslationStatusFilter => {
    const targetLanguages = SUPPORTED_LANGUAGES.filter((lang) => lang !== item.sourceLanguage);

    if (targetLanguages.length === 0) return 'complete';

    const translations = targetLanguages.map((lang) => item.translations[lang]);

    const hasManual = translations.some((t) => t?.status === 'manual');
    const hasFailed = translations.some((t) => t?.status === 'failed');
    const hasPending = translations.some((t) => t?.status === 'pending' || t?.status === 'processing');
    const allComplete = translations.every((t) => t?.status === 'completed' || t?.status === 'manual');
    const hasAnyComplete = translations.some((t) => t?.status === 'completed' || t?.status === 'manual');

    if (hasManual && allComplete) return 'manual';
    if (hasFailed) return 'failed';
    if (hasPending) return 'pending';
    if (allComplete) return 'complete';
    if (hasAnyComplete) return 'partial';
    return 'pending';
  }, []);

  /**
   * Apply all filters to items.
   */
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Type filter
      if (filters.type !== 'all' && item.entityType !== filters.type) {
        return false;
      }

      // Search filter
      if (filters.search.trim()) {
        const searchLower = filters.search.toLowerCase().trim();
        if (!item.name.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Status filter
      if (filters.status !== 'all') {
        const overallStatus = getOverallStatus(item);
        if (overallStatus !== filters.status) {
          return false;
        }
      }

      // Language filter (if languages selected, item must have translations for those)
      if (filters.languages.length > 0) {
        const hasMatchingLanguage = filters.languages.some((lang) => {
          if (lang === item.sourceLanguage) return true;
          const translation = item.translations[lang];
          return translation && ['completed', 'manual'].includes(translation.status);
        });
        if (!hasMatchingLanguage) {
          return false;
        }
      }

      return true;
    });
  }, [items, filters, getOverallStatus]);
```

### 8.2 Clear Selection When Filters Change

Add effect to clear selection when filters change:

```typescript
  // Clear selection when filters change (items may no longer be visible)
  useEffect(() => {
    const visibleIds = new Set(
      filteredItems.map((item) => `${item.entityType}-${item.entityId}`)
    );
    setSelectedIds((prev) => {
      const next = new Set<string>();
      prev.forEach((id) => {
        if (visibleIds.has(id)) {
          next.add(id);
        }
      });
      return next;
    });
  }, [filteredItems]);
```

### 8.3 Update Results Count

The results count already shows filtered vs total, but ensure it updates correctly:

```typescript
{/* Results Count */}
<div className="flex items-center justify-between text-sm text-gray-600">
  <span>
    {filteredItems.length === items.length
      ? `Showing ${items.length} items`
      : `Showing ${filteredItems.length} of ${items.length} items`}
  </span>
  {selectedIds.size > 0 && (
    <span className="text-violet-600 font-medium">
      {selectedIds.size} selected
    </span>
  )}
</div>
```

### Verification Criteria for Task 8

- [ ] Type filter correctly filters by Item/Article/Link
- [ ] Search filter matches partial name (case-insensitive)
- [ ] Status filter correctly categorizes:
  - Complete: all target languages translated
  - Partial: some but not all translated
  - Pending: any pending/processing translations
  - Failed: any failed translations
  - Manual: any manually edited translations
- [ ] Multiple filters work together (AND logic)
- [ ] Selection clears for items that become hidden
- [ ] Results count updates accurately

---

## Task 9: Integrate BulkTranslationBar

**File:** `/src/app/dashboard2/translations/page.tsx`
**Estimated Effort:** 1 story point
**Status:** [ ] Not Started

### 9.1 Import BulkTranslationBar

Add import:

```typescript
import { BulkTranslationBar, LanguageSelectorDialog } from '@/components/TranslationManagement';
```

### 9.2 Add Bulk Operation State

Add state for bulk operations:

```typescript
  // Bulk operation state
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'all' | 'failed' | 'selected'>('all');
```

### 9.3 Implement Bulk Action Handlers

Add handlers for bulk operations:

```typescript
  /**
   * Get selected items from IDs.
   */
  const selectedItems = useMemo(() => {
    return filteredItems.filter((item) =>
      selectedIds.has(`${item.entityType}-${item.entityId}`)
    );
  }, [filteredItems, selectedIds]);

  /**
   * Handle bulk re-translate action.
   */
  const handleBulkRetranslate = useCallback(async (
    languages?: SupportedLocale[],
    retranslateType: 'all' | 'failed' = 'all'
  ) => {
    if (selectedItems.length === 0) return;

    setIsBulkLoading(true);
    try {
      const entities = selectedItems.map((item) => ({
        type: item.entityType,
        id: item.entityId,
      }));

      const response = await fetch('/api/translations/retranslate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entities,
          languages,
          failedOnly: retranslateType === 'failed',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to queue re-translation jobs');
      }

      const result = await response.json();
      console.log('[BulkRetranslate] Queued jobs:', result);

      // Clear selection and refresh data
      setSelectedIds(new Set());
      await fetchTranslationStatus();
    } catch (err) {
      console.error('Bulk retranslate error:', err);
      // Show toast error (if toast system exists)
    } finally {
      setIsBulkLoading(false);
      setShowLanguageDialog(false);
    }
  }, [selectedItems, fetchTranslationStatus]);

  /**
   * Handle opening language selector for bulk operations.
   */
  const handleOpenLanguageSelector = useCallback((actionType: 'all' | 'selected') => {
    setBulkActionType(actionType);
    setShowLanguageDialog(true);
  }, []);

  /**
   * Handle clear selection.
   */
  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);
```

### 9.4 Add BulkTranslationBar to Layout

Add the BulkTranslationBar at the bottom of the page:

```typescript
  return (
    <div className="space-y-6 pb-20"> {/* Add padding for bulk bar */}
      {/* ... existing content ... */}

      {/* Bulk Translation Bar */}
      {selectedIds.size > 0 && (
        <BulkTranslationBar
          selectedCount={selectedIds.size}
          onRetranslateAll={() => handleBulkRetranslate(undefined, 'all')}
          onRetranslateFailed={() => handleBulkRetranslate(undefined, 'failed')}
          onSelectLanguages={() => handleOpenLanguageSelector('selected')}
          onClearSelection={handleClearSelection}
          isLoading={isBulkLoading}
        />
      )}

      {/* Language Selector Dialog */}
      <LanguageSelectorDialog
        isOpen={showLanguageDialog}
        onClose={() => setShowLanguageDialog(false)}
        onConfirm={(languages) => handleBulkRetranslate(languages, bulkActionType === 'failed' ? 'failed' : 'all')}
        selectedCount={selectedIds.size}
      />
    </div>
  );
```

### Verification Criteria for Task 9

- [ ] BulkTranslationBar appears when items selected
- [ ] Shows correct selection count
- [ ] "Re-translate All" triggers API call for all languages
- [ ] "Re-translate Failed" triggers API call for failed only
- [ ] Loading state shows during bulk operation
- [ ] Selection clears after successful operation
- [ ] Data refreshes after bulk operation
- [ ] Clear selection (X) button works
- [ ] LanguageSelectorDialog opens when needed

---

## Task 10: Add Row Actions Menu

**File:** `/src/app/dashboard2/translations/page.tsx`
**Estimated Effort:** 0.75 story points
**Status:** [ ] Not Started

### 10.1 Create Actions Menu Component

Add a dropdown menu component for row actions:

```typescript
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MoreVertical, Eye, RefreshCw, Edit2 } from 'lucide-react';

/**
 * Actions dropdown menu for a table row.
 */
function RowActionsMenu({
  item,
  onPreview,
  onRetranslateAll,
  onRetranslateFailed,
  onEdit,
}: {
  item: TranslationStatusItem;
  onPreview: () => void;
  onRetranslateAll: () => void;
  onRetranslateFailed: () => void;
  onEdit: () => void;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'p-1.5 rounded hover:bg-gray-100 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2'
          )}
          aria-label={`Actions for ${item.name}`}
        >
          <MoreVertical className="h-4 w-4 text-gray-500" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            'min-w-[180px] bg-white rounded-lg shadow-lg border border-gray-200',
            'py-1 z-50'
          )}
          sideOffset={5}
          align="end"
        >
          <DropdownMenu.Item
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm text-gray-700',
              'cursor-pointer hover:bg-gray-100 outline-none'
            )}
            onSelect={onPreview}
          >
            <Eye className="h-4 w-4" />
            View Translations
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm text-gray-700',
              'cursor-pointer hover:bg-gray-100 outline-none'
            )}
            onSelect={onRetranslateAll}
          >
            <RefreshCw className="h-4 w-4" />
            Re-translate All
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm text-gray-700',
              'cursor-pointer hover:bg-gray-100 outline-none'
            )}
            onSelect={onRetranslateFailed}
          >
            <RefreshCw className="h-4 w-4" />
            Re-translate Failed
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />

          <DropdownMenu.Item
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm text-gray-700',
              'cursor-pointer hover:bg-gray-100 outline-none'
            )}
            onSelect={onEdit}
          >
            <Edit2 className="h-4 w-4" />
            Edit Content
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
```

### 10.2 Update TranslationTableRow Actions Column

Replace the actions button with the menu:

```typescript
{/* Actions */}
<td className="w-16 px-4 py-4 text-right">
  <RowActionsMenu
    item={item}
    onPreview={() => onPreviewClick(item)}
    onRetranslateAll={() => onActionsClick(item, 'retranslate-all')}
    onRetranslateFailed={() => onActionsClick(item, 'retranslate-failed')}
    onEdit={() => onActionsClick(item, 'edit')}
  />
</td>
```

### 10.3 Implement Single Item Actions

Update the handleActionsClick to handle specific actions:

```typescript
  /**
   * Handle single row actions.
   */
  const handleActionsClick = useCallback(async (item: TranslationStatusItem, action: string) => {
    console.log('[Action]', action, item);

    switch (action) {
      case 'retranslate-all':
        try {
          await fetch('/api/translations/retranslate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              entities: [{ type: item.entityType, id: item.entityId }],
            }),
          });
          await fetchTranslationStatus();
        } catch (err) {
          console.error('Retranslate error:', err);
        }
        break;

      case 'retranslate-failed':
        try {
          await fetch('/api/translations/retranslate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              entities: [{ type: item.entityType, id: item.entityId }],
              failedOnly: true,
            }),
          });
          await fetchTranslationStatus();
        } catch (err) {
          console.error('Retranslate failed error:', err);
        }
        break;

      case 'edit':
        // Navigate to edit page based on entity type
        const editPaths = {
          item: `/dashboard2/items/${item.entityId}/edit`,
          article: `/dashboard2/instructions/${item.entityId}/edit`,
          link: `/dashboard2/items/${item.entityId}/edit`, // Links edited within items
        };
        router.push(editPaths[item.entityType]);
        break;

      default:
        break;
    }
  }, [fetchTranslationStatus, router]);
```

### Verification Criteria for Task 10

- [ ] Actions menu opens on button click
- [ ] Menu includes: View Translations, Re-translate All, Re-translate Failed, Edit Content
- [ ] "View Translations" opens preview panel
- [ ] "Re-translate All" triggers API call and refreshes
- [ ] "Re-translate Failed" triggers API call for failed only
- [ ] "Edit Content" navigates to correct edit page
- [ ] Menu closes after action selection
- [ ] Menu has proper keyboard navigation

---

## Task 11: Integrate TranslationPreviewPanel

**File:** `/src/app/dashboard2/translations/page.tsx`
**Estimated Effort:** 0.75 story points
**Status:** [ ] Not Started

### 11.1 Import TranslationPreviewPanel

Add import:

```typescript
import { TranslationPreviewPanel } from '@/components/TranslationManagement';
```

### 11.2 Add Preview Panel to Layout

Add the preview panel component at the end of the return:

```typescript
  return (
    <div className="space-y-6 pb-20">
      {/* ... existing content ... */}

      {/* Translation Preview Panel */}
      {previewState.isOpen && previewState.entityType && previewState.entityId && (
        <TranslationPreviewPanel
          entityType={previewState.entityType}
          entityId={previewState.entityId}
          sourceLanguage={
            items.find(
              (i) =>
                i.entityType === previewState.entityType &&
                i.entityId === previewState.entityId
            )?.sourceLanguage || 'en'
          }
          sourceContent={
            items.find(
              (i) =>
                i.entityType === previewState.entityType &&
                i.entityId === previewState.entityId
            )
              ? { name: items.find(
                  (i) =>
                    i.entityType === previewState.entityType &&
                    i.entityId === previewState.entityId
                )!.name }
              : { name: '' }
          }
          isOpen={previewState.isOpen}
          onClose={() =>
            setPreviewState({ entityType: null, entityId: null, isOpen: false })
          }
          onTranslationEdited={() => fetchTranslationStatus()}
        />
      )}

      {/* ... bulk bar and dialogs ... */}
    </div>
  );
```

### 11.3 Update Preview Click Handler

Ensure preview click handler is complete:

```typescript
  /**
   * Handle preview click - open translation preview panel.
   */
  const handlePreviewClick = useCallback((item: TranslationStatusItem) => {
    setPreviewState({
      entityType: item.entityType,
      entityId: item.entityId,
      isOpen: true,
    });
  }, []);
```

### Verification Criteria for Task 11

- [ ] Preview panel opens when "View Translations" clicked
- [ ] Panel shows correct entity type and ID
- [ ] Panel receives source language from item data
- [ ] Panel receives source content (name)
- [ ] Panel closes when close button clicked
- [ ] Data refreshes when translation is edited in panel

---

## Task 12: Add Supabase Realtime Subscription

**File:** `/src/app/dashboard2/translations/page.tsx`
**Estimated Effort:** 1 story point
**Status:** [ ] Not Started

### 12.1 Import useTranslationRealtime Hook

Add import:

```typescript
import { useTranslationRealtime } from '@/hooks/useTranslationRealtime';
```

### 12.2 Implement Realtime Subscription

Add realtime subscription logic:

```typescript
  /**
   * Handle realtime translation updates.
   */
  const handleRealtimeUpdate = useCallback((payload: {
    entityType: 'article' | 'item' | 'link';
    entityId: string;
    language: SupportedLocale;
    status: string;
  }) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.entityType === payload.entityType && item.entityId === payload.entityId) {
          return {
            ...item,
            translations: {
              ...item.translations,
              [payload.language]: {
                ...item.translations[payload.language],
                status: payload.status as any,
              },
            },
          };
        }
        return item;
      })
    );
  }, []);

  // Subscribe to realtime updates
  const { isConnected: isRealtimeConnected } = useTranslationRealtime({
    propertyId: selectedPropertyId || undefined,
    onUpdate: handleRealtimeUpdate,
    enabled: !!selectedPropertyId && items.length > 0,
  });
```

### 12.3 Add Realtime Status Indicator (Optional)

Add a visual indicator for realtime connection status:

```typescript
{/* Refresh Button with Realtime Status */}
<div className="flex items-center gap-2">
  {isRealtimeConnected && (
    <span className="flex items-center gap-1 text-xs text-green-600">
      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      Live
    </span>
  )}
  <button
    onClick={fetchTranslationStatus}
    disabled={isLoading}
    className={cn(
      'flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300',
      'bg-white text-gray-700 hover:bg-gray-50 transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2',
      isLoading && 'opacity-50 cursor-not-allowed'
    )}
  >
    <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
    <span className="hidden sm:inline">Refresh</span>
  </button>
</div>
```

### Verification Criteria for Task 12

- [ ] Realtime subscription connects when page loads
- [ ] Status updates appear without page refresh
- [ ] Visual indicator shows realtime connection status
- [ ] Subscription cleans up on unmount
- [ ] Fallback to manual refresh if realtime unavailable

---

## Task 13: Add Empty State Handling

**File:** `/src/app/dashboard2/translations/page.tsx`
**Estimated Effort:** 0.5 story points
**Status:** [ ] Not Started

### 13.1 Create Empty State Components

Add empty state components:

```typescript
import { FileText, Plus } from 'lucide-react';

/**
 * Empty state when no content exists.
 */
function EmptyStateNoContent() {
  const router = useRouter();

  return (
    <div className="text-center py-12">
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <FileText className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No content to translate</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
        Create items, articles, or links to see them here. Translations will be generated automatically.
      </p>
      <button
        onClick={() => router.push('/dashboard2/items')}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-lg',
          'bg-violet-600 text-white hover:bg-violet-700 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2'
        )}
      >
        <Plus className="h-4 w-4" />
        Create Content
      </button>
    </div>
  );
}

/**
 * Empty state when filters return no results.
 */
function EmptyStateNoResults({
  onClearFilters,
}: {
  onClearFilters: () => void;
}) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Search className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No matching content</h3>
      <p className="text-sm text-gray-500 mb-6">
        Try adjusting your filters or search terms.
      </p>
      <button
        onClick={onClearFilters}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-lg',
          'border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2'
        )}
      >
        Clear Filters
      </button>
    </div>
  );
}
```

### 13.2 Update Table Body Empty State

Update the tbody to use appropriate empty states:

```typescript
<tbody className="bg-white divide-y divide-gray-200">
  {items.length === 0 ? (
    <tr>
      <td colSpan={3 + SUPPORTED_LANGUAGES.length + 1}>
        <EmptyStateNoContent />
      </td>
    </tr>
  ) : filteredItems.length === 0 ? (
    <tr>
      <td colSpan={3 + SUPPORTED_LANGUAGES.length + 1}>
        <EmptyStateNoResults onClearFilters={() => setFilters(INITIAL_FILTERS)} />
      </td>
    </tr>
  ) : (
    filteredItems.map((item) => {
      // ... row rendering
    })
  )}
</tbody>
```

### Verification Criteria for Task 13

- [ ] "No content" empty state shows when items array is empty
- [ ] Empty state includes "Create Content" button
- [ ] "No matching content" shows when filters return no results
- [ ] "Clear Filters" button resets filters
- [ ] Empty states have appropriate icons and messaging

---

## Task 14: Add URL Query Parameter Sync

**File:** `/src/app/dashboard2/translations/page.tsx`
**Estimated Effort:** 0.5 story points
**Status:** [ ] Not Started

### 14.1 Parse URL Params on Load

Add effect to parse URL params:

```typescript
  // Parse URL params on mount
  useEffect(() => {
    const type = searchParams.get('type') as TranslationTypeFilter | null;
    const status = searchParams.get('status') as TranslationStatusFilter | null;
    const search = searchParams.get('search');

    if (type || status || search) {
      setFilters({
        type: type || 'all',
        languages: [],
        status: status || 'all',
        search: search || '',
      });
    }
  }, []); // Only on mount
```

### 14.2 Sync Filters to URL

Add effect to update URL when filters change:

```typescript
  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.type !== 'all') {
      params.set('type', filters.type);
    }
    if (filters.status !== 'all') {
      params.set('status', filters.status);
    }
    if (filters.search.trim()) {
      params.set('search', filters.search.trim());
    }

    const queryString = params.toString();
    const newUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    // Use replaceState to avoid adding to history on every keystroke
    window.history.replaceState(null, '', newUrl);
  }, [filters]);
```

### Verification Criteria for Task 14

- [ ] Filters persist in URL (e.g., `?type=item&status=failed`)
- [ ] Page loads with filters from URL params
- [ ] URL updates as filters change (without page reload)
- [ ] Shareable URLs work (copy, paste in new tab)
- [ ] Empty filters don't add unnecessary params

---

## Task 15: Add Accessibility Features

**File:** `/src/app/dashboard2/translations/page.tsx`
**Estimated Effort:** 0.5 story points
**Status:** [ ] Not Started

### 15.1 Add ARIA Labels and Roles

Update table with proper ARIA attributes:

```typescript
{/* Table Container */}
<div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
  <div className="overflow-x-auto">
    <table
      className="min-w-full divide-y divide-gray-200"
      role="grid"
      aria-label="Translation status table"
    >
      {/* ... */}
    </table>
  </div>
</div>
```

### 15.2 Add Live Region for Status Updates

Add a live region for announcing changes:

```typescript
{/* Screen Reader Announcements */}
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {isLoading && 'Loading translation data...'}
  {!isLoading && `Showing ${filteredItems.length} items. ${selectedIds.size} selected.`}
</div>
```

### 15.3 Ensure Keyboard Navigation

Verify all interactive elements are keyboard accessible:

- [ ] Tab navigates through all interactive elements
- [ ] Enter/Space activates buttons and checkboxes
- [ ] Arrow keys work in dropdown menus
- [ ] Escape closes modals and menus
- [ ] Focus is visible on all focusable elements

### Verification Criteria for Task 15

- [ ] Table has `role="grid"` and `aria-label`
- [ ] Screen reader announces loading states
- [ ] Screen reader announces selection changes
- [ ] All buttons have `aria-label` or visible text
- [ ] Status indicators have `aria-label` describing status
- [ ] Keyboard navigation works throughout page
- [ ] Focus indicators visible (violet ring)

---

## Task 16: Add Loading and Error States Polish

**File:** `/src/app/dashboard2/translations/page.tsx`
**Estimated Effort:** 0.5 story points
**Status:** [ ] Not Started

### 16.1 Create Loading Skeleton

Add a skeleton component for initial load:

```typescript
/**
 * Loading skeleton for table rows.
 */
function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="w-10 px-4 py-4">
            <div className="h-4 w-4 bg-gray-200 rounded" />
          </td>
          <td className="px-4 py-4">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </td>
          <td className="w-20 px-4 py-4">
            <div className="h-5 bg-gray-200 rounded w-12" />
          </td>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <td key={lang} className="w-10 px-2 py-4 text-center">
              <div className="h-4 w-4 bg-gray-200 rounded-full mx-auto" />
            </td>
          ))}
          <td className="w-16 px-4 py-4">
            <div className="h-4 w-4 bg-gray-200 rounded ml-auto" />
          </td>
        </tr>
      ))}
    </>
  );
}
```

### 16.2 Update Loading State Display

Use skeleton in the table body:

```typescript
{isLoading ? (
  <TableSkeleton />
) : items.length === 0 ? (
  // ... empty states
) : (
  // ... data rows
)}
```

### 16.3 Add Inline Loading for Filter Changes

Add subtle loading indicator when filtering:

```typescript
{/* Results Count with Loading */}
<div className="flex items-center justify-between text-sm text-gray-600">
  <span className="flex items-center gap-2">
    {isFiltering && (
      <RefreshCw className="h-3 w-3 animate-spin text-gray-400" />
    )}
    {filteredItems.length === items.length
      ? `Showing ${items.length} items`
      : `Showing ${filteredItems.length} of ${items.length} items`}
  </span>
  {selectedIds.size > 0 && (
    <span className="text-violet-600 font-medium">
      {selectedIds.size} selected
    </span>
  )}
</div>
```

### Verification Criteria for Task 16

- [ ] Skeleton loader shows during initial page load
- [ ] Skeleton matches actual table structure
- [ ] Error state shows clear message with retry button
- [ ] Retry button triggers data refresh
- [ ] Loading indicator shows during filter operations
- [ ] All loading states are visually consistent

---

## Integration Testing Checklist

After all tasks are complete, perform the following integration tests:

### Functional Tests

- [ ] Page loads and fetches data from API
- [ ] All filters work correctly (type, status, search)
- [ ] Multiple filters work together
- [ ] Row selection and Select All work
- [ ] Bulk actions trigger API calls
- [ ] Individual row actions work
- [ ] Preview panel opens and closes
- [ ] Data refreshes after actions

### Visual Tests

- [ ] Table layout is correct on desktop (1024px+)
- [ ] Table scrolls horizontally on mobile
- [ ] Status indicators have correct colors
- [ ] Type badges have correct colors
- [ ] Selected rows are highlighted
- [ ] Bulk bar appears at bottom when items selected

### Accessibility Tests

- [ ] Keyboard-only navigation works
- [ ] Screen reader announces changes
- [ ] Focus indicators are visible
- [ ] ARIA labels are descriptive
- [ ] Color contrast meets WCAG 2.1 AA

### Edge Cases

- [ ] Page handles empty data gracefully
- [ ] Page handles API errors
- [ ] URL params work correctly
- [ ] Realtime updates appear correctly
- [ ] Performance acceptable with 100+ items

---

## Files Modified Summary

| File | Changes | Status |
|------|---------|--------|
| `/src/app/dashboard2/translations/page.tsx` | Create new Translation Management page | [ ] |

---

## Files Referenced (Read-Only)

| File | Information Used |
|------|------------------|
| `/src/components/TranslationManagement/TranslationStatusColumn/` | Status indicator component |
| `/src/components/TranslationManagement/TranslationStatusFilter/` | Filter dropdown component |
| `/src/components/TranslationManagement/BulkTranslationBar/` | Bulk action bar |
| `/src/components/TranslationManagement/TranslationPreviewPanel/` | Preview panel |
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Shared types |
| `/src/app/dashboard2/layout.tsx` | Dashboard layout pattern |
| `/src/components/ItemManager/components/dialogs/FilterPanel.tsx` | Filter UI pattern |
| `/src/lib/i18n/config.ts` | `SupportedLocale` type |
| `/src/hooks/useTranslationStatus.ts` | Status fetching hook |
| `/src/hooks/useTranslationRealtime.ts` | Realtime subscription hook |
| `/src/contexts/PropertyContext.tsx` | Property context |

---

## Definition of Done

- [ ] Page accessible at `/dashboard2/translations` route
- [ ] Table displays all content items, articles, and links owned by authenticated user
- [ ] Each row shows content name, type badge, and 6 language status indicators
- [ ] Filter bar includes Type, Status, and Search filtering
- [ ] Filters update table content dynamically without page reload
- [ ] Table rows support individual checkbox selection
- [ ] Select All checkbox in header selects/deselects all visible rows
- [ ] Bulk action bar appears when items selected with Re-translate actions
- [ ] Each row has actions menu with View, Re-translate, Edit options
- [ ] Translation preview panel opens when "View Translations" clicked
- [ ] Realtime updates appear without page refresh
- [ ] Empty states display appropriately
- [ ] URL query parameters sync with filter state
- [ ] All accessibility requirements met (ARIA, keyboard nav)
- [ ] Loading and error states display appropriately
- [ ] TypeScript compilation passes with no errors
- [ ] Build completes successfully (`npm run build`)

---

## Effort Summary

| Task | Description | Estimate |
|------|-------------|----------|
| Task 1 | Create page file structure and basic layout | 1.0 SP |
| Task 2 | Implement data fetching hook and state management | 1.5 SP |
| Task 3 | Build table structure with static columns | 1.0 SP |
| Task 4 | Implement table row rendering | 1.0 SP |
| Task 5 | Integrate TranslationStatusColumn for language indicators | 1.0 SP |
| Task 6 | Implement row selection logic | 0.75 SP |
| Task 7 | Build filter bar component | 1.5 SP |
| Task 8 | Connect filters to data | 1.0 SP |
| Task 9 | Integrate BulkTranslationBar | 1.0 SP |
| Task 10 | Add row actions menu | 0.75 SP |
| Task 11 | Integrate TranslationPreviewPanel | 0.75 SP |
| Task 12 | Add Supabase Realtime subscription | 1.0 SP |
| Task 13 | Add empty state handling | 0.5 SP |
| Task 14 | Add URL query parameter sync | 0.5 SP |
| Task 15 | Add accessibility features | 0.5 SP |
| Task 16 | Add loading and error states polish | 0.5 SP |
| **Total** | | **12.5 SP** |

---

## References

- **Overview Document:** `/docs/REQ-354-create-translation-management-page-overview.md`
- **Requirements:** `/docs/gen_requests_epic5.md` (Request #354)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Dashboard Layout:** `/src/app/dashboard2/layout.tsx`
- **FilterPanel Pattern:** `/src/components/ItemManager/components/dialogs/FilterPanel.tsx`
- **ItemGrid Pattern:** `/src/components/ItemManager/components/ItemGrid.tsx`
- **Translation Types:** `/src/components/TranslationManagement/TranslationManagement.types.ts`
- **i18n Config:** `/src/lib/i18n/config.ts`

---

*Document generated as part of FAQBNB L10N Epic 5 implementation pipeline*
