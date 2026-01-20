# Implementation Overview: REQ-E05-020 - Create Translation Management Page

**Document Created:** 2026-01-20 18:30 UTC
**Last Modified:** 2026-01-20 18:30 UTC
**Request ID:** REQ-E05-020
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 4 - Bulk Operations & Management Page
**Task ID:** 4.3
**Size:** L (Large)

---

## Summary

Create a dedicated Translation Management page at `/dashboard2/translations/` that provides property owners with a centralized interface to view, filter, and manage translations across all their content (items, articles, links). The page features a full-width table displaying all content entities with translation status indicators for each supported language, comprehensive filtering capabilities, bulk selection support, and integration with the bulk translation action bar.

---

## Request Details

### Source Request (REQ-E05-020)

From `docs/gen_requests_epic5.md`:

**Type:** NEW FEATURE
**Size:** L

Property owners need a dedicated translation management page that displays all their content items in a comprehensive table view with translation status indicators, filtering capabilities, and bulk selection support for efficient multilingual content management.

### Acceptance Criteria

- [ ] Page route created at `/src/app/dashboard2/translations/page.tsx`
- [ ] Page layout uses full-width content area without sidebars (max-width: 100% of available space)
- [ ] Table displays all content entities accessible to the current property owner
- [ ] Table includes column for entity name displaying the item/article/link title or identifier
- [ ] Table includes column for entity type showing "Item", "Article", or "Link" with appropriate icon
- [ ] Table includes six individual columns for language status (EN, ES, FR, DE, IT, PT)
- [ ] Each language column displays status indicator using standard color scheme (green complete, orange pending, red failed, purple manual, gray not started)
- [ ] Table includes Actions column with quick access to view details, edit, or re-translate controls
- [ ] Filter bar renders above table with three filter controls in horizontal layout
- [ ] Content type filter dropdown offers options: "All Types", "Items", "Articles", "Links"
- [ ] Language filter dropdown offers options to show only content missing specific language translations
- [ ] Status filter dropdown offers options: "All", "Fully Translated", "Partially Translated", "Pending", "Failed", "Manually Edited"
- [ ] Each table row includes a checkbox for bulk selection
- [ ] Checkbox in table header selects/deselects all currently visible rows
- [ ] Selected row count displays when one or more items are selected
- [ ] BulkTranslationBar component appears when items are selected
- [ ] Table supports pagination or infinite scroll for large content catalogs (100+ items)
- [ ] Table displays loading skeleton during initial data fetch
- [ ] Table displays empty state when no content matches current filters
- [ ] Empty state includes call-to-action to create content or adjust filters
- [ ] Table is sortable by clicking column headers (name, type, translation completion)
- [ ] Clicking entity name navigates to that entity's detail/edit page
- [ ] Clicking language status cell opens TranslationPreviewPanel for that entity and language
- [ ] Page integrates with translation status API endpoint to fetch comprehensive status data
- [ ] Page implements efficient data fetching strategy to avoid loading all entities simultaneously
- [ ] Page updates in real-time when translation jobs complete through realtime subscriptions
- [ ] Table is responsive and adapts layout for tablet viewports (may stack columns or use horizontal scroll)
- [ ] Page header includes title "Translation Management" and breadcrumb navigation
- [ ] Page includes help text or tooltip explaining filtering and bulk operation capabilities
- [ ] Filter selections persist in URL query parameters for shareable filtered views
- [ ] Page is fully keyboard accessible with proper focus management and tab order
- [ ] Page includes appropriate ARIA labels and semantic HTML structure
- [ ] Table maintains scroll position when returning from entity detail pages
- [ ] Page performance remains acceptable with large datasets (response time under 3 seconds for 500+ items)
- [ ] Component handles missing or invalid property context gracefully
- [ ] Page displays correctly in both light and dark theme contexts if themes are supported

---

## Dependencies

### Epic 1 (Foundation) Dependencies - Required

| Component | Location | Status |
|-----------|----------|--------|
| Translation tables | `item_translations`, `article_translations`, `link_translations`, `tag_translations` | ✅ Available |
| Translation jobs table | `translation_jobs` | ✅ Available |
| Translation service types | `/src/lib/translation-service/translation-service.types.ts` | ✅ Available |
| Job queue types | `/src/lib/job-queue/translation-jobs.types.ts` | ✅ Available |
| Supported languages constant | `SUPPORTED_LANGUAGES` in translation-service.types.ts | ✅ Available |

### Epic 5 Dependencies - Same Epic (Completed or In-Progress)

| Component | Task | Status |
|-----------|------|--------|
| Translation Status API | REQ-E05-001 (Task 1.1) | Required |
| Re-translate API | REQ-E05-003 (Task 1.3) | Required |
| TranslationManagement types | REQ-E05-006 (Task 2.1) | Required |
| TranslationStatusColumn | REQ-E05-014 (Task 3.2) | Required |
| TranslationStatusFilter | REQ-E05-015 (Task 3.3) | Required |
| TranslationPreviewPanel | REQ-E05-007 (Task 2.2) | Required |
| BulkTranslationBar | REQ-E05-018 (Task 4.1) | Required |
| useTranslationStatus hook | REQ-E05-011 (Task 2.6) | Required |
| useTranslationRealtime hook | REQ-E05-012 (Task 2.7) | Required |

### External Dependencies

| Dependency | Source | Usage |
|------------|--------|-------|
| PropertyContext | `/src/contexts/PropertyContext.tsx` | Get selectedPropertyId for filtering |
| AuthContext | `/src/contexts/AuthContext.tsx` | Get user and account for API calls |
| adminApi | `/src/lib/api.ts` | Fetch items, articles, links |
| Supabase Realtime | Existing in stack | Real-time translation status updates |

---

## Technical Approach

### Architecture Overview

The Translation Management page follows the established dashboard page pattern (`/src/app/dashboard2/items/page.tsx`) with enhanced table functionality for translation status display.

```
/src/app/dashboard2/translations/
└── page.tsx                              # Main Translation Management page

Dependencies from TranslationManagement components:
├── TranslationStatusColumn               # Six-dot status indicator for table
├── TranslationStatusFilter               # Status filter dropdown
├── TranslationPreviewPanel               # Slide-out preview panel
├── BulkTranslationBar                    # Bulk action bar at bottom
└── hooks/
    ├── useTranslationStatus              # Fetch translation status data
    └── useTranslationRealtime            # Real-time status updates
```

### Component Architecture

```tsx
// Page structure
TranslationsPage
├── PageHeader (Title, breadcrumb, help tooltip)
├── FilterBar
│   ├── ContentTypeFilter (Items/Articles/Links)
│   ├── LanguageFilter (Missing specific language)
│   └── TranslationStatusFilter (Fully translated, Partial, etc.)
├── TranslationsTable
│   ├── TableHeader (Checkbox, Name, Type, EN, ES, FR, DE, IT, PT, Actions)
│   │   └── SelectAllCheckbox
│   ├── TableBody
│   │   └── TranslationRow[] (mapped from filtered data)
│   │       ├── SelectionCheckbox
│   │       ├── EntityName (clickable → navigate to edit)
│   │       ├── EntityTypeIcon
│   │       ├── LanguageStatusColumns (6x TranslationStatusColumn)
│   │       └── ActionsDropdown
│   ├── LoadingState (skeleton rows)
│   └── EmptyState (when no content matches filters)
├── Pagination (or InfiniteScroll)
├── TranslationPreviewPanel (conditionally rendered)
└── BulkTranslationBar (conditionally rendered when items selected)
```

### Data Flow

```
1. Page Mount
   ├── Fetch property context (selectedPropertyId)
   ├── Fetch all content entities (items, articles, links) via adminApi
   ├── Fetch translation status via GET /api/translations/status?propertyId=xxx
   └── Subscribe to Supabase Realtime for translation updates

2. Filter Change
   ├── Update local filter state
   ├── Apply filters to content list (client-side)
   ├── Update URL query parameters
   └── Re-render table with filtered data

3. Row Selection
   ├── Toggle item in selectedIds Set
   ├── Update selection count display
   └── Show/hide BulkTranslationBar

4. Status Column Click
   ├── Set preview target (entityType, entityId)
   └── Open TranslationPreviewPanel

5. Bulk Action Trigger
   ├── Gather selected entity references
   ├── POST /api/translations/retranslate
   ├── Show progress in BulkTranslationBar
   └── Clear selection on completion

6. Real-time Update Received
   ├── Update translation status in local state
   └── Re-render affected rows
```

### State Management

```typescript
// Local page state
interface TranslationsPageState {
  // Content data
  items: ItemRecord[];
  articles: ArticleRecord[];
  links: LinkRecord[];

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
  } | null;

  // Sorting
  sortBy: 'name' | 'type' | 'completion';
  sortOrder: 'asc' | 'desc';

  // Pagination
  page: number;
  pageSize: number;
  totalCount: number;
}
```

### API Integration

```typescript
// Fetch all content for the property
const fetchContent = async () => {
  const [itemsRes, articlesRes, linksRes] = await Promise.all([
    adminApi.listItems(undefined, selectedPropertyId, 1, 500, headers),
    // articles endpoint
    // links endpoint
  ]);

  // Combine into unified content list
  return combineContent(itemsRes.data, articlesRes.data, linksRes.data);
};

// Fetch translation status for all content
// GET /api/translations/status?propertyId=xxx
const fetchTranslationStatus = async () => {
  const response = await fetch(`/api/translations/status?propertyId=${selectedPropertyId}`);
  return response.json();
};
```

---

## Implementation Details

### File Structure

```
/src/app/dashboard2/translations/
└── page.tsx                              # Main page component

Supporting components (from TranslationManagement module):
/src/components/TranslationManagement/
├── TranslationStatusColumn/
│   └── TranslationStatusColumn.tsx       # Six-dot table column indicator
├── TranslationStatusFilter/
│   └── TranslationStatusFilter.tsx       # Status filter dropdown
├── TranslationPreviewPanel/
│   └── TranslationPreviewPanel.tsx       # Slide-out preview
├── BulkTranslationBar/
│   └── BulkTranslationBar.tsx            # Bulk action bar
└── TranslationManagement.types.ts        # Shared types
```

### Page Component Structure

```tsx
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
import { useAuth, useAccountContext } from '@/contexts/AuthContext';
import { usePropertyContext } from '@/hooks/usePropertyContext';
import { useTranslationStatus } from '@/hooks/useTranslationStatus';
import { useTranslationRealtime } from '@/hooks/useTranslationRealtime';
import { adminApi } from '@/lib/api';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/lib/translation-service/translation-service.types';
import { TranslationStatusColumn } from '@/components/TranslationManagement/TranslationStatusColumn';
import { TranslationStatusFilter } from '@/components/TranslationManagement/TranslationStatusFilter';
import { TranslationPreviewPanel } from '@/components/TranslationManagement/TranslationPreviewPanel';
import { BulkTranslationBar } from '@/components/TranslationManagement/BulkTranslationBar';
import {
  Languages,
  Package,
  FileText,
  Link2,
  Loader2,
  ChevronDown,
  HelpCircle,
  ArrowUpDown
} from 'lucide-react';

// ... implementation
```

### Table Structure

```tsx
// Table header with all columns
<table className="min-w-full divide-y divide-gray-200">
  <thead className="bg-gray-50">
    <tr>
      {/* Selection checkbox */}
      <th scope="col" className="relative px-4 py-3 w-12">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={handleSelectAll}
          className="h-4 w-4 rounded border-gray-300 text-[#FF385C] focus:ring-[#FF385C]"
          aria-label="Select all"
        />
      </th>

      {/* Name column - sortable */}
      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        <button onClick={() => handleSort('name')} className="flex items-center gap-1">
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
    {/* Rows mapped from filtered content */}
  </tbody>
</table>
```

### Filter Bar Implementation

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

  {/* Translation Status Filter */}
  <TranslationStatusFilter
    value={filters.status}
    onChange={(status) => handleFilterChange('status', status)}
  />

  {/* Filter summary */}
  {hasActiveFilters && (
    <div className="flex items-center gap-2 ml-auto">
      <span className="text-sm text-gray-500">
        Showing {filteredContent.length} of {totalContent.length}
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

### Translation Status Indicator per Language

```tsx
// Individual language status cell
interface LanguageStatusCellProps {
  entityType: 'item' | 'article' | 'link';
  entityId: string;
  language: SupportedLanguage;
  status: TranslationStatus | undefined;
  onClick: () => void;
}

function LanguageStatusCell({ entityType, entityId, language, status, onClick }: LanguageStatusCellProps) {
  const statusConfig = {
    completed: { color: 'bg-green-500', icon: '✓', label: 'Completed' },
    pending: { color: 'bg-orange-500', icon: '⏳', label: 'Pending' },
    processing: { color: 'bg-orange-500 animate-pulse', icon: '⏳', label: 'Processing' },
    failed: { color: 'bg-red-500', icon: '✕', label: 'Failed' },
    manual: { color: 'bg-purple-500', icon: '✎', label: 'Manual' },
    none: { color: 'bg-gray-300', icon: '○', label: 'Not started' },
  };

  const config = status ? statusConfig[status] : statusConfig.none;

  return (
    <td className="px-2 py-4 text-center">
      <button
        onClick={onClick}
        className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${config.color} text-white text-xs transition-transform hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:ring-[#FF385C]`}
        title={`${language.toUpperCase()}: ${config.label}`}
        aria-label={`${language.toUpperCase()} translation status: ${config.label}. Click to view details.`}
      >
        {config.icon}
      </button>
    </td>
  );
}
```

### Responsive Design Considerations

```tsx
// For mobile/tablet: horizontal scroll container
<div className="overflow-x-auto -mx-4 sm:mx-0">
  <div className="inline-block min-w-full align-middle">
    <table className="min-w-full">
      {/* Table content */}
    </table>
  </div>
</div>

// Sticky first column on mobile for name visibility
// (optional enhancement)
```

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/dashboard2/translations/page.tsx` | Main Translation Management page component |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/app/dashboard2/layout.tsx` | Add "Translations" navigation item (if not done in REQ-E05-016) |

### Dependencies to Import (No Modifications)

| File Path | Usage |
|-----------|-------|
| `/src/hooks/useTranslationStatus.ts` | Fetch translation status data |
| `/src/hooks/useTranslationRealtime.ts` | Subscribe to real-time updates |
| `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx` | Status indicators |
| `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx` | Filter dropdown |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Detail panel |
| `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx` | Bulk actions |
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Type definitions |
| `/src/lib/translation-service/translation-service.types.ts` | Language types |
| `/src/contexts/AuthContext.tsx` | Auth and account context |
| `/src/contexts/PropertyContext.tsx` | Property selection |
| `/src/lib/api.ts` | API client |

---

## Existing Patterns to Follow

### Dashboard Page Pattern

Reference: `/src/app/dashboard2/items/page.tsx`

```tsx
// Pattern elements to replicate:
// 1. 'use client' directive
// 2. JSDoc header with @route and @created
// 3. useAuth, useAccountContext, usePropertyContext hooks
// 4. Loading and error state handling
// 5. Conditional rendering based on user/loading state
// 6. Page header with title and action button
// 7. Error display with dismiss option
```

### Dialog/Panel Pattern

Reference: `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx`

```tsx
// Pattern elements for TranslationPreviewPanel integration:
// 1. Fixed positioning with z-50
// 2. Overlay backdrop for panels
// 3. role="dialog" and aria-modal="true"
// 4. Focus trap using useFocusTrap hook
// 5. Close on Escape key
// 6. Click outside to close
```

### Filter Panel Pattern

Reference: `/src/components/ItemManager/components/dialogs/FilterPanel.tsx`

```tsx
// Filter elements to incorporate:
// 1. Horizontal filter layout
// 2. Active filter count badge
// 3. Clear all filters button
// 4. Filter persistence in URL params
```

### Selection Pattern

Reference: `/src/components/ItemManager/ItemManager.tsx`

```tsx
// Selection state management:
// selectedIds: Set<string>
// selectItem, deselectItem, selectAll, clearSelection functions
// BulkActionsBar appears when selectedCount > 0
```

---

## UI Visual Specification

### Color Palette (from PRD)

| Status | Color | Tailwind Class | Hex |
|--------|-------|----------------|-----|
| Completed | Green | `text-green-500`, `bg-green-500` | #22C55E |
| Manual | Purple | `text-purple-500`, `bg-purple-500` | #8B5CF6 |
| Pending/Processing | Orange | `text-amber-500`, `bg-amber-500` | #F59E0B |
| Failed | Red | `text-red-500`, `bg-red-500` | #EF4444 |
| Not Started | Gray | `text-gray-300`, `bg-gray-300` | #D1D5DB |
| Stale | Yellow | `text-yellow-500` | #EAB308 |

### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Translation Management                                         [? Help]    │
│ Manage translations across all your content                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Content: [All Types ▼]  Missing: [Any Language ▼]  Status: [All ▼]     │ │
│ │                                           Showing 45 of 120 | Clear ↺  │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ ☑ │ Name ▲▼              │ Type │ 🇬🇧 │ 🇪🇸 │ 🇫🇷 │ 🇩🇪 │ 🇮🇹 │ 🇳🇱 │ ⋮  │ │
│ ├───┼──────────────────────┼──────┼────┼────┼────┼────┼────┼────┼────┤ │
│ │ ☐ │ Coffee Machine       │ 📦   │ ✓  │ ✓  │ ⏳ │ ○  │ ○  │ ○  │ ⋮  │ │
│ │ ☐ │ How to Use - Coffee  │ 📄   │ ✓  │ ✓  │ ✓  │ ✓  │ ✓  │ ✓  │ ⋮  │ │
│ │ ☑ │ Dishwasher           │ 📦   │ ✓  │ ✕  │ ○  │ ○  │ ○  │ ○  │ ⋮  │ │
│ │ ☑ │ Cleaning Guide       │ 📄   │ ✓  │ ⏳ │ ⏳ │ ⏳ │ ⏳ │ ⏳ │ ⋮  │ │
│ │ ☐ │ YouTube Tutorial     │ 🔗   │ ✓  │ ✎  │ ✓  │ ✓  │ ✓  │ ✓  │ ⋮  │ │
│ │ ... more rows ...                                                        │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│                           ◀ 1 2 3 ... 12 ▶                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    2 items selected                                         │
│     [Re-translate All]  [Re-translate Specific Language ▼]  [Clear ✕]      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Testing Considerations

### Unit Tests

- Filter state management (apply, clear, combine filters)
- Selection state management (select, deselect, selectAll)
- Content combination from multiple sources (items + articles + links)
- Translation status aggregation per entity

### Integration Tests

- API data fetching with property context
- Real-time subscription connection and updates
- Bulk action API calls with progress tracking
- Filter persistence in URL parameters

### E2E Tests

- Full page flow: load → filter → select → bulk action → verify
- Navigation to entity edit pages
- TranslationPreviewPanel open/close
- Pagination/infinite scroll behavior

### Accessibility Tests

- Keyboard navigation through table
- Screen reader announcements for status changes
- Focus management when panel opens/closes
- ARIA labels on all interactive elements

---

## Performance Considerations

1. **Efficient Data Fetching**
   - Fetch items, articles, links in parallel with `Promise.all`
   - Use pagination to limit initial load (50 items per page default)
   - Cache translation status keyed by entity reference

2. **Optimized Rendering**
   - Use `useMemo` for filtered content list
   - Virtualize table rows for 500+ items (optional enhancement)
   - Debounce filter changes (300ms)

3. **Real-time Updates**
   - Subscribe only to property-scoped translation changes
   - Batch UI updates for rapid successive events (100ms debounce)
   - Cleanup subscriptions on unmount

4. **URL State**
   - Persist filters in URL for shareable views
   - Restore filters on page load from URL params
   - Use shallow routing to avoid full page reload

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Large content catalogs slow performance | Medium | High | Pagination, lazy loading, virtualization |
| Real-time updates not working | Low | Medium | Fallback to manual refresh button |
| Translation status fetch fails | Medium | Medium | Graceful error state, retry option |
| Mobile table usability | Medium | Medium | Horizontal scroll, sticky name column |
| Missing dependent components | Low | High | Verify all Epic 5 dependencies complete |

---

## References

- **Request Source:** `/docs/gen_requests_epic5.md` - REQ-E05-020
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Pattern Reference (Items Page):** `/src/app/dashboard2/items/page.tsx`
- **Pattern Reference (FilterPanel):** `/src/components/ItemManager/components/dialogs/FilterPanel.tsx`
- **Pattern Reference (BulkActions):** `/src/components/ItemManager/components/BulkActions/`
- **Translation Types:** `/src/lib/translation-service/translation-service.types.ts`
- **Dashboard Layout:** `/src/app/dashboard2/layout.tsx`

---

## Implementation Checklist

- [ ] Create page file at `/src/app/dashboard2/translations/page.tsx`
- [ ] Implement page header with title and help tooltip
- [ ] Implement filter bar with three filter dropdowns
- [ ] Implement full-width table with all columns
- [ ] Implement row selection with checkboxes
- [ ] Integrate TranslationStatusColumn for each language
- [ ] Integrate TranslationPreviewPanel on status cell click
- [ ] Integrate BulkTranslationBar for bulk operations
- [ ] Implement pagination component
- [ ] Implement loading skeleton state
- [ ] Implement empty state with CTA
- [ ] Implement sorting by column headers
- [ ] Add real-time subscription for status updates
- [ ] Persist filter state in URL parameters
- [ ] Add ARIA labels and keyboard navigation
- [ ] Test responsive layout on mobile/tablet
- [ ] Verify performance with large datasets
