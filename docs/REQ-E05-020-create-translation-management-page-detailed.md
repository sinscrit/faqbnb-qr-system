# REQ-E05-020: Create Translation Management Page - Detailed Task Breakdown

**Created**: 2026-01-22 23:37
**Status**: PENDING
**Epic**: Epic 5 - Owner Translation Management
**Phase**: Phase 4 - Bulk Operations & Management Page
**Task**: 4.3 - Create Translation Management page
**Size**: L (18-22 hours)

---

## Reference Documents

- **Overview**: `/docs/REQ-E05-020-create-translation-management-page-overview.md`
- **Requirements**: `/docs/gen_requests_epic5.md` (lines 3036-3230)
- **Implementation Plan**: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`

---

## Build & Test Commands

```bash
# Type check (MUST pass before commit)
npm run typecheck

# Run development server
npm run dev

# Build for production (MUST succeed)
npm run build

# Run tests (if applicable)
npm test

# Lint
npm run lint
```

---

## Overview

Create a dedicated Translation Management page at `/dashboard2/translations` that displays all translatable content (items and articles) in a full-width table with per-language translation status indicators. The page provides filtering, search, bulk selection, pagination, and integrates with BulkTranslationBar for bulk operations.

**Key Requirements:**
- Full-width table showing all items and articles with translation status
- Filter bar for content type, language, status, and search
- Bulk selection with BulkTranslationBar integration
- URL state management for shareable filter links
- Client-side filtering using useMemo for performance
- Batch translation API: POST /api/translations/status/batch
- Pagination controls (10/25/50/100 per page)
- Responsive design with horizontal scroll for mobile
- Empty states for no content and no filter matches

---

## Task Breakdown

### Task 1: Create page file and route structure
**Estimated effort**: 0.5 hours

- [ ] **1.1** Create directory `/src/app/dashboard2/translations/` if it doesn't exist
- [ ] **1.2** Create file `/src/app/dashboard2/translations/page.tsx`
- [ ] **1.3** Add 'use client' directive at the top of the file
- [ ] **1.4** Add basic Next.js page metadata export (if needed for SEO)
- [ ] **1.5** Import React hooks: `useState`, `useEffect`, `useCallback`, `useMemo`
- [ ] **1.6** Import Next.js router: `useRouter` from 'next/navigation'
- [ ] **1.7** Import Lucide icons: `Package`, `FileText`, `AlertCircle`, `MoreVertical`, `Loader2`, `Languages`, `Globe`, `Search`, `Filter`, `ChevronDown`, `CheckSquare`, `Square`
- [ ] **1.8** Import i18n: `useTranslations` from 'next-intl'
- [ ] **1.9** Import contexts: `usePropertyContext`, `useAuth`, `useAccountContext`
- [ ] **1.10** Import utils: `cn` from '@/lib/utils'
- [ ] **1.11** Import types: `SupportedLanguage` from '@/lib/translation-service'
- [ ] **1.12** Create basic page component skeleton with export default
- [ ] **1.13** Verify route is accessible at `http://localhost:3000/dashboard2/translations`

---

### Task 2: Define TypeScript types and interfaces
**Estimated effort**: 1 hour

- [ ] **2.1** Define `TranslationPageFilters` interface with `contentType`, `language`, `status`, `search` properties
- [ ] **2.2** Define `TranslationRow` interface with `id`, `entityType`, `entityId`, `name`, `parentName?`, `propertyId`, `translations`, `sourceUpdatedAt`
- [ ] **2.3** Define `TranslationStatusData` nested interface for `translations` property with `status`, `updatedAt?`
- [ ] **2.4** Define `TranslationSortOption` type: `'name-asc' | 'name-desc' | 'type-asc' | 'type-desc' | 'updated-asc' | 'updated-desc'`
- [ ] **2.5** Define `PaginationState` interface with `currentPage`, `itemsPerPage` properties
- [ ] **2.6** Define `BatchTranslationStatusRequest` interface matching API format: `{ entities: Array<{ entityType, entityId }> }`
- [ ] **2.7** Define `BatchTranslationStatusResponse` interface matching API response format
- [ ] **2.8** Add JSDoc comments to all interfaces explaining their purpose
- [ ] **2.9** Export types if they will be reused in other components
- [ ] **2.10** Verify all types compile without errors with `npm run typecheck`

---

### Task 3: Implement data fetching hook (useTranslationData)
**Estimated effort**: 2 hours

- [ ] **3.1** Create custom hook `useTranslationData` that accepts `propertyId` parameter
- [ ] **3.2** Add state for `rows: TranslationRow[]`
- [ ] **3.3** Add state for `isLoading: boolean`
- [ ] **3.4** Add state for `error: Error | null`
- [ ] **3.5** Implement `fetchItems` function to query Supabase `items` table filtered by `propertyId`
- [ ] **3.6** Implement `fetchArticles` function to query Supabase `item_articles` table with JOIN to items for property filtering
- [ ] **3.7** Implement `fetchTranslationStatus` function that calls POST `/api/translations/status/batch` with entities array
- [ ] **3.8** Combine items and articles into entities array format: `[{ entityType: 'item', entityId }, { entityType: 'article', entityId }]`
- [ ] **3.9** Transform API response to `TranslationRow[]` format with proper ID format: `"{entityType}:{entityId}"`
- [ ] **3.10** For articles, populate `parentName` by looking up parent item name from items list
- [ ] **3.11** Handle error cases with try-catch and set error state
- [ ] **3.12** Set loading state to true before fetch, false after completion
- [ ] **3.13** Use `useEffect` to trigger fetch when `propertyId` changes
- [ ] **3.14** Return object: `{ rows, isLoading, error, refetch }`
- [ ] **3.15** Add abort controller to cancel in-flight requests on unmount
- [ ] **3.16** Test hook with empty property (no items/articles)
- [ ] **3.17** Test hook with property containing only items
- [ ] **3.18** Test hook with property containing only articles
- [ ] **3.19** Test hook with API timeout/failure

---

### Task 4: Implement filter state management with URL sync
**Estimated effort**: 1.5 hours

- [ ] **4.1** Initialize `useRouter` hook from Next.js
- [ ] **4.2** Create `filters` state using `useState<TranslationPageFilters>` with default values: `{ contentType: 'all', language: 'all', status: 'all', search: '' }`
- [ ] **4.3** Implement `useEffect` to read URL query parameters on mount and set initial filter state
- [ ] **4.4** Parse `contentType` query param and validate against allowed values
- [ ] **4.5** Parse `language` query param and validate against `SupportedLanguage` union
- [ ] **4.6** Parse `status` query param and validate against allowed status values
- [ ] **4.7** Parse `search` query param as string
- [ ] **4.8** Implement `updateFilters` function that updates both state and URL query params
- [ ] **4.9** Use `router.push()` with query string to sync filters to URL
- [ ] **4.10** Preserve existing query params when updating filters
- [ ] **4.11** Debounce search filter updates to avoid excessive URL changes (300ms delay)
- [ ] **4.12** Clear search filter if empty string
- [ ] **4.13** Reset pagination to page 1 when any filter changes
- [ ] **4.14** Test URL sync by manually entering query params in browser
- [ ] **4.15** Test filter persistence by refreshing page with query params
- [ ] **4.16** Test shareable links by copying URL and opening in new tab

---

### Task 5: Implement filter bar component
**Estimated effort**: 2 hours

- [ ] **5.1** Create inline `FilterBar` component within page.tsx
- [ ] **5.2** Add container div with flex layout and gap for filter controls
- [ ] **5.3** Create "Content Type" dropdown using native `<select>` element
- [ ] **5.4** Add options: "All", "Items", "Articles" with i18n keys
- [ ] **5.5** Bind `contentType` filter value to select element
- [ ] **5.6** Handle onChange event to update `contentType` filter
- [ ] **5.7** Create "Language" dropdown using native `<select>` element
- [ ] **5.8** Add options: "All Languages", then 5 target languages (es, fr, de, nl, it) with flag emojis
- [ ] **5.9** Use translation keys for language names: `t('languages.spanish')`, etc.
- [ ] **5.10** Bind `language` filter value to select element
- [ ] **5.11** Handle onChange event to update `language` filter
- [ ] **5.12** Create "Status" dropdown using native `<select>` element
- [ ] **5.13** Add options: "All Statuses", "Complete", "Pending", "Missing", "Stale" with i18n keys
- [ ] **5.14** Bind `status` filter value to select element
- [ ] **5.15** Handle onChange event to update `status` filter
- [ ] **5.16** Create search input field with Search icon from Lucide
- [ ] **5.17** Add placeholder text with i18n key: `t('translation.filters.searchPlaceholder')`
- [ ] **5.18** Bind `search` filter value to input element
- [ ] **5.19** Handle onChange event to update `search` filter (with debounce)
- [ ] **5.20** Add "Clear Filters" button that resets all filters to defaults
- [ ] **5.21** Show active filter count badge when filters are applied
- [ ] **5.22** Apply Tailwind styling for consistent appearance with dashboard
- [ ] **5.23** Add responsive layout that stacks vertically on mobile (< 768px)
- [ ] **5.24** Test all filter controls update state correctly
- [ ] **5.25** Test filter combinations work as expected

---

### Task 6: Implement client-side filtering logic
**Estimated effort**: 1.5 hours

- [ ] **6.1** Create `filteredRows` using `useMemo` that depends on `[rows, filters]`
- [ ] **6.2** Start with all rows: `let filtered = [...rows]`
- [ ] **6.3** Apply `contentType` filter: if not 'all', filter by `row.entityType`
- [ ] **6.4** Apply `search` filter: case-insensitive match on `row.name` and `row.parentName`
- [ ] **6.5** Apply `language` filter: if not 'all', check if specific language has any status
- [ ] **6.6** Apply `status` filter logic for "complete": check if ALL target languages are complete
- [ ] **6.7** Apply `status` filter logic for "pending": check if ANY language has pending status
- [ ] **6.8** Apply `status` filter logic for "missing": check if ANY language has missing status
- [ ] **6.9** Apply `status` filter logic for "stale": check if ANY language has stale status
- [ ] **6.10** Return filtered array from useMemo
- [ ] **6.11** Display filtered count in UI: `{filteredRows.length} of {rows.length} items`
- [ ] **6.12** Test filtering with all combinations of filters
- [ ] **6.13** Test filtering with special characters in search
- [ ] **6.14** Test filtering that results in zero matches
- [ ] **6.15** Verify useMemo prevents unnecessary recalculations

---

### Task 7: Implement sorting functionality
**Estimated effort**: 1.5 hours

- [ ] **7.1** Create `sortOption` state using `useState<TranslationSortOption>('name-asc')`
- [ ] **7.2** Create `sortedRows` using `useMemo` that depends on `[filteredRows, sortOption]`
- [ ] **7.3** Implement sort logic for 'name-asc': sort alphabetically by `row.name`
- [ ] **7.4** Implement sort logic for 'name-desc': reverse alphabetical by `row.name`
- [ ] **7.5** Implement sort logic for 'type-asc': sort by `row.entityType` (article before item)
- [ ] **7.6** Implement sort logic for 'type-desc': reverse sort by `row.entityType`
- [ ] **7.7** Implement sort logic for 'updated-asc': sort by `row.sourceUpdatedAt` oldest first
- [ ] **7.8** Implement sort logic for 'updated-desc': sort by `row.sourceUpdatedAt` newest first
- [ ] **7.9** Use `localeCompare()` for string comparisons to handle international characters
- [ ] **7.10** Create `SortableColumnHeader` component following InstructionsTable pattern (lines 24-76)
- [ ] **7.11** Add chevron icons to indicate current sort direction
- [ ] **7.12** Make "Name", "Type", and "Last Updated" columns sortable
- [ ] **7.13** Handle click on column header to toggle sort direction
- [ ] **7.14** Apply active styling to currently sorted column
- [ ] **7.15** Test sorting works for all sort options
- [ ] **7.16** Test sorting with empty dataset
- [ ] **7.17** Verify sorting performance with large datasets (50+ rows)

---

### Task 8: Implement bulk selection state
**Estimated effort**: 1 hour

- [ ] **8.1** Create `selectedIds` state using `useState<Set<string>>(new Set())`
- [ ] **8.2** Implement `toggleSelection` function that adds/removes ID from set
- [ ] **8.3** Implement `toggleSelectAll` function that selects/deselects all visible rows
- [ ] **8.4** Determine "select all" checkbox state: checked if all visible rows selected, indeterminate if some selected
- [ ] **8.5** Create helper function `isSelected(id)` that checks if ID is in selection set
- [ ] **8.6** Clear selections when filters change (useEffect with filters dependency)
- [ ] **8.7** Add checkbox column as first column in table header
- [ ] **8.8** Add "Select All" checkbox in header row that calls `toggleSelectAll`
- [ ] **8.9** Add individual checkboxes in each table row that call `toggleSelection`
- [ ] **8.10** Apply visual styling to selected rows (background color)
- [ ] **8.11** Show selection count above table: `{selectedIds.size} items selected`
- [ ] **8.12** Test selection state updates correctly
- [ ] **8.13** Test "select all" works with filtered results
- [ ] **8.14** Test selections clear when filters change
- [ ] **8.15** Test selection state persists during pagination

---

### Task 9: Create translation status badge component
**Estimated effort**: 1 hour

- [ ] **9.1** Create inline `TranslationStatusBadge` component accepting `status` and `updatedAt` props
- [ ] **9.2** Define status color mapping: complete=green, pending=blue, stale=orange, manual=purple, missing=gray
- [ ] **9.3** Render badge with status text using i18n key: `t('translation.status.{status}')`
- [ ] **9.4** Apply Tailwind classes based on status for background and text color
- [ ] **9.5** Add small circular indicator dot before status text
- [ ] **9.6** Add tooltip showing `updatedAt` date if available (use Radix Tooltip)
- [ ] **9.7** Format date using `toLocaleDateString()` for tooltip
- [ ] **9.8** Handle missing status gracefully with gray "Missing" badge
- [ ] **9.9** Add hover state for better interactivity
- [ ] **9.10** Make badge compact for table cell display (small padding, small font)
- [ ] **9.11** Test all 5 status types render correctly
- [ ] **9.12** Test tooltip appears on hover with correct date
- [ ] **9.13** Verify badge styling matches design system

---

### Task 10: Create translation table component structure
**Estimated effort**: 2 hours

- [ ] **10.1** Create table element with full-width container div
- [ ] **10.2** Add horizontal scroll wrapper for mobile: `overflow-x-auto`
- [ ] **10.3** Create table with `<table>` element and Tailwind table classes
- [ ] **10.4** Create table header `<thead>` with sticky positioning
- [ ] **10.5** Add header row with columns: Checkbox, Type Icon, Name, Parent (for articles), 5 Language columns (es, fr, de, nl, it), Actions
- [ ] **10.6** Use flag emojis in language column headers: 🇪🇸, 🇫🇷, 🇩🇪, 🇳🇱, 🇮🇹
- [ ] **10.7** Add i18n tooltips to language column headers with full language names
- [ ] **10.8** Make Name, Type, and Last Updated columns sortable with `SortableColumnHeader`
- [ ] **10.9** Create table body `<tbody>` to render rows
- [ ] **10.10** Apply zebra striping: alternating row background colors
- [ ] **10.11** Add hover state to table rows
- [ ] **10.12** Make first column (Name) sticky on horizontal scroll for mobile
- [ ] **10.13** Set minimum column widths to prevent squishing
- [ ] **10.14** Add bottom border to header row for visual separation
- [ ] **10.15** Test table layout on desktop (> 1024px)
- [ ] **10.16** Test table horizontal scroll on tablet (768px - 1024px)
- [ ] **10.17** Test table horizontal scroll on mobile (< 768px)
- [ ] **10.18** Verify sticky header works during vertical scroll

---

### Task 11: Create translation table row component
**Estimated effort**: 2 hours

- [ ] **11.1** Create inline `TranslationTableRow` component accepting `row` and `isSelected` props
- [ ] **11.2** Render checkbox cell with `isSelected` state
- [ ] **11.3** Render type icon cell: Package for items, FileText for articles
- [ ] **11.4** Render name cell with row.name, make it clickable to view/edit entity
- [ ] **11.5** Add link to item edit page: `/dashboard2/items/[publicId]/edit` for items
- [ ] **11.6** Add link to article edit page: `/dashboard2/instructions/[articleId]/edit` for articles
- [ ] **11.7** Render parent name cell (only for articles) with gray text
- [ ] **11.8** Iterate over 5 languages (es, fr, de, nl, it) in order
- [ ] **11.9** For each language, render `TranslationStatusBadge` with status from `row.translations[lang]`
- [ ] **11.10** Handle missing language data gracefully (show "Missing" badge)
- [ ] **11.11** Render actions cell with dropdown menu (MoreVertical icon)
- [ ] **11.12** Add row click handler to toggle selection (except when clicking links or actions)
- [ ] **11.13** Apply selected row styling: light blue background when isSelected=true
- [ ] **11.14** Add keyboard navigation: Enter or Space to toggle selection
- [ ] **11.15** Add ARIA attributes: role="row", aria-selected={isSelected}
- [ ] **11.16** Test row renders correctly for items
- [ ] **11.17** Test row renders correctly for articles (with parent name)
- [ ] **11.18** Test all 5 language badges display properly
- [ ] **11.19** Test row selection via checkbox click
- [ ] **11.20** Test row selection via row click (not on links)

---

### Task 12: Implement row actions dropdown menu
**Estimated effort**: 1 hour

- [ ] **12.1** Create `RowActionsMenu` component using native dropdown pattern (similar to BulkTranslationBar)
- [ ] **12.2** Add state for `isOpen` to control dropdown visibility
- [ ] **12.3** Add button with MoreVertical icon to trigger dropdown
- [ ] **12.4** Create dropdown menu with absolute positioning
- [ ] **12.5** Add menu item: "View/Edit" that navigates to entity edit page
- [ ] **12.6** Add menu item: "Re-translate All" that triggers re-translation for all languages
- [ ] **12.7** Add menu item: "Select Languages" that opens LanguageSelectorDialog
- [ ] **12.8** Add click-outside handler to close dropdown when clicking elsewhere
- [ ] **12.9** Add Escape key handler to close dropdown
- [ ] **12.10** Prevent row selection when clicking actions menu
- [ ] **12.11** Add loading state for actions that trigger API calls
- [ ] **12.12** Show success/error feedback after action completion
- [ ] **12.13** Test dropdown opens on button click
- [ ] **12.14** Test dropdown closes on outside click
- [ ] **12.15** Test dropdown closes on Escape key
- [ ] **12.16** Test "Re-translate All" triggers API call

---

### Task 13: Integrate BulkTranslationBar component
**Estimated effort**: 1.5 hours

- [ ] **13.1** Import `BulkTranslationBar` from '@/components/TranslationManagement/BulkTranslationBar'
- [ ] **13.2** Import `LanguageSelectorDialog` from '@/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog'
- [ ] **13.3** Create state for `isLanguageSelectorOpen` to control dialog visibility
- [ ] **13.4** Create state for `bulkOperationInProgress` to track bulk operation status
- [ ] **13.5** Convert `selectedIds` Set to array of entity objects: `{ entityType, entityId }`
- [ ] **13.6** Render `BulkTranslationBar` conditionally when `selectedIds.size > 0`
- [ ] **13.7** Pass `selectedCount` prop to BulkTranslationBar
- [ ] **13.8** Pass `onReTranslateAll` handler that calls re-translate API for all selected items
- [ ] **13.9** Pass `onSelectLanguages` handler that opens LanguageSelectorDialog
- [ ] **13.10** Pass `onCancel` handler that clears all selections
- [ ] **13.11** Render `LanguageSelectorDialog` conditionally when `isLanguageSelectorOpen=true`
- [ ] **13.12** Pass `onConfirm` handler to LanguageSelectorDialog that triggers re-translation for selected languages
- [ ] **13.13** Pass `onClose` handler to LanguageSelectorDialog that closes the dialog
- [ ] **13.14** Implement API call to `/api/translations/retry` with selected entities and languages
- [ ] **13.15** Show loading state in BulkTranslationBar during API call
- [ ] **13.16** Show success message when bulk operation completes
- [ ] **13.17** Clear selections after successful bulk operation
- [ ] **13.18** Refetch translation data after bulk operation to update status
- [ ] **13.19** Test BulkTranslationBar appears when items selected
- [ ] **13.20** Test "Re-translate All" triggers API for all languages
- [ ] **13.21** Test "Select Languages" opens LanguageSelectorDialog
- [ ] **13.22** Test bulk operation shows progress and completion feedback

---

### Task 14: Implement pagination controls
**Estimated effort**: 1 hour

- [ ] **14.1** Create `pagination` state with `useState<PaginationState>({ currentPage: 1, itemsPerPage: 25 })`
- [ ] **14.2** Calculate total pages: `Math.ceil(sortedRows.length / itemsPerPage)`
- [ ] **14.3** Create `paginatedRows` using `useMemo` that slices `sortedRows` based on current page
- [ ] **14.4** Calculate start index: `(currentPage - 1) * itemsPerPage`
- [ ] **14.5** Calculate end index: `startIndex + itemsPerPage`
- [ ] **14.6** Slice sortedRows: `sortedRows.slice(startIndex, endIndex)`
- [ ] **14.7** Create `PaginationControls` component with Previous/Next buttons
- [ ] **14.8** Add page number display: "Page X of Y"
- [ ] **14.9** Add items per page selector: dropdown with options 10, 25, 50, 100
- [ ] **14.10** Disable Previous button on first page
- [ ] **14.11** Disable Next button on last page
- [ ] **14.12** Reset to page 1 when filters change (useEffect)
- [ ] **14.13** Reset to page 1 when itemsPerPage changes
- [ ] **14.14** Add keyboard navigation: arrow keys for previous/next page
- [ ] **14.15** Display result range: "Showing X-Y of Z items"
- [ ] **14.16** Position pagination controls at bottom of table
- [ ] **14.17** Test pagination with different items per page values
- [ ] **14.18** Test pagination resets when filters change
- [ ] **14.19** Test pagination with single page of results
- [ ] **14.20** Test pagination with many pages (50+ rows)

---

### Task 15: Implement loading and empty states
**Estimated effort**: 1 hour

- [ ] **15.1** Create loading state UI with centered spinner (Loader2 icon)
- [ ] **15.2** Show loading message with i18n key: `t('translation.loading')`
- [ ] **15.3** Display loading state when `isLoading=true` from useTranslationData hook
- [ ] **15.4** Create empty state for no content: show when `rows.length === 0` and not loading
- [ ] **15.5** Add illustration or icon for empty state (Languages or Package icon)
- [ ] **15.6** Add heading for empty state: `t('translation.emptyState.title')`
- [ ] **15.7** Add description for empty state: `t('translation.emptyState.description')`
- [ ] **15.8** Add call-to-action button to create first item
- [ ] **15.9** Create empty state for no matches: show when `filteredRows.length === 0` but `rows.length > 0`
- [ ] **15.10** Add heading for no matches: `t('translation.noMatches.title')`
- [ ] **15.11** Add description for no matches: `t('translation.noMatches.description')`
- [ ] **15.12** Add "Clear Filters" button in no matches state
- [ ] **15.13** Test loading state displays during data fetch
- [ ] **15.14** Test empty state displays for new property with no content
- [ ] **15.15** Test no matches state displays when filters produce zero results
- [ ] **15.16** Verify loading spinner is centered and accessible

---

### Task 16: Implement error handling and user feedback
**Estimated effort**: 1 hour

- [ ] **16.1** Create error state UI with error message display
- [ ] **16.2** Show error when `error !== null` from useTranslationData hook
- [ ] **16.3** Display error icon (AlertCircle from Lucide)
- [ ] **16.4** Display error title with i18n key: `t('translation.error.title')`
- [ ] **16.5** Display error message from `error.message`
- [ ] **16.6** Add "Retry" button to trigger `refetch()` function
- [ ] **16.7** Apply error styling: red border, red background, red text
- [ ] **16.8** Create success toast notification system (or use existing project toast)
- [ ] **16.9** Show success toast after bulk re-translation completes
- [ ] **16.10** Show success toast message: `t('translation.success.bulkRetranslate')`
- [ ] **16.11** Auto-dismiss success toast after 3 seconds
- [ ] **16.12** Create error toast notification for API failures
- [ ] **16.13** Show error toast when batch translation status API fails
- [ ] **16.14** Show error toast when re-translate API fails
- [ ] **16.15** Test error state displays when API returns error
- [ ] **16.16** Test retry button refetches data successfully
- [ ] **16.17** Test success toast appears after successful operation
- [ ] **16.18** Test error toast appears when operation fails

---

### Task 17: Add status legend and help text
**Estimated effort**: 0.5 hours

- [ ] **17.1** Create `StatusLegend` component at bottom of page
- [ ] **17.2** Display all 5 status types with their badges: complete, pending, stale, manual, missing
- [ ] **17.3** Add description for each status type using i18n keys
- [ ] **17.4** Complete: `t('translation.legend.complete')` - "All translations are up to date"
- [ ] **17.5** Pending: `t('translation.legend.pending')` - "Translation is in progress"
- [ ] **17.6** Stale: `t('translation.legend.stale')` - "Source content changed since translation"
- [ ] **17.7** Manual: `t('translation.legend.manual')` - "Manually edited by owner"
- [ ] **17.8** Missing: `t('translation.legend.missing')` - "No translation exists"
- [ ] **17.9** Add collapsible section for legend (expand/collapse button)
- [ ] **17.10** Save legend expanded state to localStorage
- [ ] **17.11** Add help text explaining how to use the page
- [ ] **17.12** Test legend displays all 5 status types correctly
- [ ] **17.13** Test legend collapse/expand functionality

---

### Task 18: Add internationalization keys for all languages
**Estimated effort**: 1.5 hours

- [ ] **18.1** Open `/messages/en.json` and add `translation` namespace
- [ ] **18.2** Add key `translation.title` = "Translation Management"
- [ ] **18.3** Add key `translation.subtitle` = "Manage translations for all your items and guides"
- [ ] **18.4** Add key `translation.loading` = "Loading translations..."
- [ ] **18.5** Add key `translation.filters.contentType` = "Content Type"
- [ ] **18.6** Add key `translation.filters.language` = "Language"
- [ ] **18.7** Add key `translation.filters.status` = "Status"
- [ ] **18.8** Add key `translation.filters.search` = "Search"
- [ ] **18.9** Add key `translation.filters.searchPlaceholder` = "Search by name..."
- [ ] **18.10** Add key `translation.filters.clearFilters` = "Clear Filters"
- [ ] **18.11** Add key `translation.filters.allTypes` = "All Types"
- [ ] **18.12** Add key `translation.filters.items` = "Items Only"
- [ ] **18.13** Add key `translation.filters.articles` = "Guides Only"
- [ ] **18.14** Add key `translation.filters.allLanguages` = "All Languages"
- [ ] **18.15** Add key `translation.filters.allStatuses` = "All Statuses"
- [ ] **18.16** Add keys for status values: `complete`, `pending`, `missing`, `stale`, `manual`
- [ ] **18.17** Add key `translation.table.selectAll` = "Select All"
- [ ] **18.18** Add key `translation.table.type` = "Type"
- [ ] **18.19** Add key `translation.table.name` = "Name"
- [ ] **18.20** Add key `translation.table.parent` = "Parent Item"
- [ ] **18.21** Add key `translation.table.actions` = "Actions"
- [ ] **18.22** Add key `translation.table.selected` = "{count} items selected"
- [ ] **18.23** Add key `translation.table.showing` = "Showing {start}-{end} of {total}"
- [ ] **18.24** Add key `translation.pagination.previous` = "Previous"
- [ ] **18.25** Add key `translation.pagination.next` = "Next"
- [ ] **18.26** Add key `translation.pagination.page` = "Page {current} of {total}"
- [ ] **18.27** Add key `translation.pagination.itemsPerPage` = "Items per page"
- [ ] **18.28** Add key `translation.emptyState.title` = "No Content Yet"
- [ ] **18.29** Add key `translation.emptyState.description` = "Create your first item or guide to start managing translations"
- [ ] **18.30** Add key `translation.noMatches.title` = "No Results Found"
- [ ] **18.31** Add key `translation.noMatches.description` = "Try adjusting your filters or search term"
- [ ] **18.32** Add key `translation.error.title` = "Error Loading Translations"
- [ ] **18.33** Add key `translation.error.retry` = "Retry"
- [ ] **18.34** Add key `translation.success.bulkRetranslate` = "Translations queued successfully"
- [ ] **18.35** Add key `translation.legend.title` = "Status Legend"
- [ ] **18.36** Add key `translation.legend.complete` = "All translations are up to date"
- [ ] **18.37** Add key `translation.legend.pending` = "Translation is in progress"
- [ ] **18.38** Add key `translation.legend.stale` = "Source content changed since translation"
- [ ] **18.39** Add key `translation.legend.manual` = "Manually edited by owner"
- [ ] **18.40** Add key `translation.legend.missing` = "No translation exists"
- [ ] **18.41** Add key `translation.actions.view` = "View/Edit"
- [ ] **18.42** Add key `translation.actions.retranslateAll` = "Re-translate All"
- [ ] **18.43** Add key `translation.actions.selectLanguages` = "Select Languages"
- [ ] **18.44** Add language name keys: `languages.spanish`, `french`, `german`, `italian`, `dutch`
- [ ] **18.45** Copy all keys from `en.json` to `es.json` with Spanish translations
- [ ] **18.46** Copy all keys from `en.json` to `fr.json` with French translations
- [ ] **18.47** Copy all keys from `en.json` to `de.json` with German translations
- [ ] **18.48** Copy all keys from `en.json` to `it.json` with Italian translations
- [ ] **18.49** Copy all keys from `en.json` to `nl.json` with Dutch translations
- [ ] **18.50** Verify all translation keys are used in components (no unused keys)
- [ ] **18.51** Run typecheck to ensure no missing translation key errors

---

### Task 19: Add responsive design and mobile optimization
**Estimated effort**: 2 hours

- [ ] **19.1** Add mobile breakpoint checks using Tailwind responsive classes
- [ ] **19.2** Stack filter bar vertically on mobile (< 768px): `flex-col md:flex-row`
- [ ] **19.3** Make filter controls full width on mobile
- [ ] **19.4** Add horizontal scroll to table on mobile with sticky first column
- [ ] **19.5** Reduce padding in table cells on mobile for more space
- [ ] **19.6** Show abbreviated column headers on mobile (use icons instead of text)
- [ ] **19.7** Make BulkTranslationBar full width on mobile
- [ ] **19.8** Adjust BulkTranslationBar button sizes for touch targets (min 44px)
- [ ] **19.9** Stack pagination controls vertically on mobile
- [ ] **19.10** Make "items per page" selector full width on mobile
- [ ] **19.11** Test touch interactions on mobile devices (tap to select row)
- [ ] **19.12** Ensure dropdown menus are positioned correctly on mobile (not cut off)
- [ ] **19.13** Add safe area padding for iOS devices (notch/home indicator)
- [ ] **19.14** Test horizontal scroll works smoothly on mobile
- [ ] **19.15** Test sticky first column remains visible during horizontal scroll
- [ ] **19.16** Test layout on iPhone SE (375px width)
- [ ] **19.17** Test layout on iPhone 12/13/14 (390px width)
- [ ] **19.18** Test layout on iPad (768px width)
- [ ] **19.19** Test layout on iPad Pro (1024px width)
- [ ] **19.20** Test layout on desktop (1440px width)
- [ ] **19.21** Verify no horizontal overflow on any screen size

---

### Task 20: Implement accessibility features
**Estimated effort**: 1.5 hours

- [ ] **20.1** Add page heading with `<h1>` using `t('translation.title')`
- [ ] **20.2** Add ARIA label to table: `aria-label="Translation management table"`
- [ ] **20.3** Add ARIA labels to filter controls with descriptive text
- [ ] **20.4** Add ARIA labels to sort buttons: "Sort by name ascending"
- [ ] **20.5** Add ARIA live region for selection count updates: `aria-live="polite"`
- [ ] **20.6** Add ARIA live region for filter results count
- [ ] **20.7** Add proper table structure with `<thead>`, `<tbody>`, `<th>`, `<td>`
- [ ] **20.8** Add scope attribute to table headers: `scope="col"`
- [ ] **20.9** Add row headers with scope="row" for first cell in each row
- [ ] **20.10** Add ARIA selected state to table rows: `aria-selected={isSelected}`
- [ ] **20.11** Add keyboard navigation: Tab through interactive elements
- [ ] **20.12** Add keyboard shortcut: Space to toggle row selection
- [ ] **20.13** Add keyboard shortcut: Enter to open row actions menu
- [ ] **20.14** Add focus visible ring to all focusable elements
- [ ] **20.15** Add skip link to jump to main content
- [ ] **20.16** Ensure all interactive elements have visible focus indicator
- [ ] **20.17** Test with screen reader (VoiceOver on macOS or NVDA on Windows)
- [ ] **20.18** Test keyboard-only navigation (no mouse)
- [ ] **20.19** Verify color contrast meets WCAG AA standards (4.5:1 for text)
- [ ] **20.20** Test with browser zoom at 200%

---

### Task 21: Add page header and layout structure
**Estimated effort**: 0.5 hours

- [ ] **21.1** Create page container div with max-width and padding
- [ ] **21.2** Add page header section with title and subtitle
- [ ] **21.3** Display page title using `<h1>` with `t('translation.title')`
- [ ] **21.4** Display subtitle using `<p>` with `t('translation.subtitle')`
- [ ] **21.5** Add Languages icon next to page title
- [ ] **21.6** Add breadcrumb navigation: Dashboard > Translations
- [ ] **21.7** Add spacing between header and content (margin-bottom)
- [ ] **21.8** Ensure header is responsive on mobile
- [ ] **21.9** Test header layout on different screen sizes

---

### Task 22: Implement URL state persistence and shareable links
**Estimated effort**: 1 hour

- [ ] **22.1** Verify URL updates when filters change (from Task 4)
- [ ] **22.2** Test URL parameters are read on page load (from Task 4)
- [ ] **22.3** Create helper function `buildShareableUrl` that constructs full URL with filters
- [ ] **22.4** Add "Share Filters" button that copies URL to clipboard
- [ ] **22.5** Show toast notification when URL copied to clipboard
- [ ] **22.6** Encode special characters in URL parameters (use `encodeURIComponent`)
- [ ] **22.7** Decode URL parameters on page load (use `decodeURIComponent`)
- [ ] **22.8** Test shareable link with all filters applied
- [ ] **22.9** Test shareable link with special characters in search term
- [ ] **22.10** Test shareable link opens in new tab with same filter state
- [ ] **22.11** Test shareable link with invalid filter values (graceful fallback)

---

### Task 23: Add real-time updates consideration (future enhancement)
**Estimated effort**: 0.5 hours

- [ ] **23.1** Add TODO comment for real-time updates via Supabase Realtime
- [ ] **23.2** Document where to add subscription: useEffect hook after initial data fetch
- [ ] **23.3** Document which table to subscribe to: `item_translations`, `article_translations`
- [ ] **23.4** Document event to listen for: `UPDATE` events on translation status changes
- [ ] **23.5** Add placeholder function `subscribeToTranslationUpdates` (commented out)
- [ ] **23.6** Note: Real-time updates are out of scope for this task (REQ-E05-020)

---

### Task 24: Test page functionality end-to-end
**Estimated effort**: 2 hours

- [ ] **24.1** Test page loads without errors at `/dashboard2/translations`
- [ ] **24.2** Test data fetches correctly from batch translation status API
- [ ] **24.3** Test filter by content type: "Items Only" shows only items
- [ ] **24.4** Test filter by content type: "Articles Only" shows only articles
- [ ] **24.5** Test filter by language: selecting Spanish shows only rows with Spanish translations
- [ ] **24.6** Test filter by status: "Complete" shows only fully translated rows
- [ ] **24.7** Test filter by status: "Pending" shows rows with any pending translations
- [ ] **24.8** Test filter by status: "Missing" shows rows with missing translations
- [ ] **24.9** Test search filter: typing name filters rows correctly
- [ ] **24.10** Test search filter: case-insensitive matching works
- [ ] **24.11** Test search filter: special characters handled correctly
- [ ] **24.12** Test all filters combined: multiple filters work together
- [ ] **24.13** Test "Clear Filters" button resets all filters to default
- [ ] **24.14** Test URL query parameters sync with filter state
- [ ] **24.15** Test URL parameters persist after page refresh
- [ ] **24.16** Test shareable link opens in new tab with same filters
- [ ] **24.17** Test individual row selection via checkbox
- [ ] **24.18** Test individual row selection via row click
- [ ] **24.19** Test "Select All" checkbox selects all visible rows
- [ ] **24.20** Test "Select All" with filters only selects filtered rows
- [ ] **24.21** Test selections clear when filters change
- [ ] **24.22** Test BulkTranslationBar appears when items selected
- [ ] **24.23** Test BulkTranslationBar shows correct selected count
- [ ] **24.24** Test "Re-translate All" triggers API call for all languages
- [ ] **24.25** Test "Select Languages" opens LanguageSelectorDialog
- [ ] **24.26** Test LanguageSelectorDialog confirms and triggers re-translation
- [ ] **24.27** Test bulk operation shows loading state
- [ ] **24.28** Test bulk operation shows success message on completion
- [ ] **24.29** Test bulk operation clears selections after completion
- [ ] **24.30** Test data refetches after bulk operation
- [ ] **24.31** Test sorting by name ascending
- [ ] **24.32** Test sorting by name descending
- [ ] **24.33** Test sorting by type
- [ ] **24.34** Test sorting by last updated date
- [ ] **24.35** Test pagination: navigate to next page
- [ ] **24.36** Test pagination: navigate to previous page
- [ ] **24.37** Test pagination: change items per page (10, 25, 50, 100)
- [ ] **24.38** Test pagination resets to page 1 when filters change
- [ ] **24.39** Test pagination with single page of results
- [ ] **24.40** Test pagination with many pages (50+ items)
- [ ] **24.41** Test loading state displays during initial data fetch
- [ ] **24.42** Test empty state displays for property with no content
- [ ] **24.43** Test no matches state displays when filters produce zero results
- [ ] **24.44** Test error state displays when API returns error
- [ ] **24.45** Test retry button refetches data after error
- [ ] **24.46** Test success toast appears after successful bulk operation
- [ ] **24.47** Test error toast appears when bulk operation fails
- [ ] **24.48** Test row actions dropdown opens on button click
- [ ] **24.49** Test row actions dropdown closes on outside click
- [ ] **24.50** Test "View/Edit" action navigates to correct page
- [ ] **24.51** Test "Re-translate All" from row actions
- [ ] **24.52** Test status badges display correctly for all 5 status types
- [ ] **24.53** Test status badge tooltips show correct date on hover
- [ ] **24.54** Test status legend displays all status types with descriptions
- [ ] **24.55** Test status legend collapse/expand functionality

---

### Task 25: Test responsive design on multiple devices
**Estimated effort**: 1 hour

- [ ] **25.1** Test layout on iPhone SE (375px width) in portrait
- [ ] **25.2** Test layout on iPhone SE (667px width) in landscape
- [ ] **25.3** Test layout on iPhone 12/13/14 (390px width) in portrait
- [ ] **25.4** Test layout on iPhone 12/13/14 (844px width) in landscape
- [ ] **25.5** Test layout on iPad (768px width) in portrait
- [ ] **25.6** Test layout on iPad (1024px width) in landscape
- [ ] **25.7** Test layout on iPad Pro (1024px width) in portrait
- [ ] **25.8** Test layout on iPad Pro (1366px width) in landscape
- [ ] **25.9** Test layout on desktop (1440px width)
- [ ] **25.10** Test layout on large desktop (1920px width)
- [ ] **25.11** Test horizontal scroll on mobile devices
- [ ] **25.12** Test sticky first column during horizontal scroll
- [ ] **25.13** Test filter bar stacks vertically on mobile
- [ ] **25.14** Test BulkTranslationBar full width on mobile
- [ ] **25.15** Test pagination controls stack on mobile
- [ ] **25.16** Test touch targets are at least 44px on mobile
- [ ] **25.17** Test no horizontal overflow on any screen size
- [ ] **25.18** Test text remains readable at all screen sizes

---

### Task 26: Test accessibility with assistive technologies
**Estimated effort**: 1 hour

- [ ] **26.1** Test with VoiceOver on macOS: page title announced
- [ ] **26.2** Test with VoiceOver: table structure announced (rows and columns)
- [ ] **26.3** Test with VoiceOver: filter controls are labeled correctly
- [ ] **26.4** Test with VoiceOver: selection count updates are announced
- [ ] **26.5** Test with VoiceOver: filter results count is announced
- [ ] **26.6** Test with VoiceOver: status badges are announced with status text
- [ ] **26.7** Test with VoiceOver: row selection state is announced
- [ ] **26.8** Test with VoiceOver: sort button state is announced
- [ ] **26.9** Test with NVDA on Windows (if available): same tests as VoiceOver
- [ ] **26.10** Test keyboard-only navigation: Tab through all interactive elements
- [ ] **26.11** Test keyboard-only navigation: Space to toggle row selection
- [ ] **26.12** Test keyboard-only navigation: Enter to activate buttons
- [ ] **26.13** Test keyboard-only navigation: Escape to close dialogs and dropdowns
- [ ] **26.14** Test keyboard-only navigation: Arrow keys for pagination
- [ ] **26.15** Test focus visible ring appears on all focused elements
- [ ] **26.16** Test focus order is logical (top to bottom, left to right)
- [ ] **26.17** Test skip link works to jump to main content
- [ ] **26.18** Test color contrast with WebAIM Contrast Checker (4.5:1 minimum)
- [ ] **26.19** Test page at 200% browser zoom (no content cut off)

---

### Task 27: Test internationalization with all languages
**Estimated effort**: 0.5 hours

- [ ] **27.1** Switch locale to Spanish (es) and verify all text translates
- [ ] **27.2** Switch locale to French (fr) and verify all text translates
- [ ] **27.3** Switch locale to German (de) and verify all text translates
- [ ] **27.4** Switch locale to Italian (it) and verify all text translates
- [ ] **27.5** Switch locale to Dutch (nl) and verify all text translates
- [ ] **27.6** Verify language names display correctly in all locales
- [ ] **27.7** Verify status badge text translates correctly
- [ ] **27.8** Verify filter labels translate correctly
- [ ] **27.9** Verify empty state messages translate correctly
- [ ] **27.10** Verify no missing translation keys in console

---

### Task 28: Perform TypeScript compilation check
**Estimated effort**: 0.5 hours

- [ ] **28.1** Run `npm run typecheck` and verify zero errors
- [ ] **28.2** Fix any type errors related to `TranslationRow` interface
- [ ] **28.3** Fix any type errors related to `TranslationPageFilters` interface
- [ ] **28.4** Fix any type errors related to Supabase query responses
- [ ] **28.5** Fix any type errors related to API request/response types
- [ ] **28.6** Ensure all props interfaces are properly typed
- [ ] **28.7** Ensure no `any` types are used (strict mode)
- [ ] **28.8** Verify all imported types are correctly referenced
- [ ] **28.9** Run `npm run typecheck` again and confirm zero errors

---

### Task 29: Perform production build test
**Estimated effort**: 0.5 hours

- [ ] **29.1** Run `npm run build` and verify build succeeds
- [ ] **29.2** Check for any build warnings related to this page
- [ ] **29.3** Fix any build warnings (unused variables, missing keys, etc.)
- [ ] **29.4** Verify bundle size is reasonable (check Next.js build output)
- [ ] **29.5** Test production build locally with `npm start`
- [ ] **29.6** Verify page loads correctly in production mode
- [ ] **29.7** Verify no console errors in production build
- [ ] **29.8** Verify data fetching works in production build

---

### Task 30: Perform final manual testing and bug fixes
**Estimated effort**: 2 hours

- [ ] **30.1** Perform complete user flow: load page → apply filters → select items → bulk re-translate
- [ ] **30.2** Test with empty property (no items or articles)
- [ ] **30.3** Test with property containing only items (no articles)
- [ ] **30.4** Test with property containing only articles (no items)
- [ ] **30.5** Test with large dataset (50+ items and articles)
- [ ] **30.6** Test with slow network (throttle to 3G in DevTools)
- [ ] **30.7** Test with API timeout simulation
- [ ] **30.8** Test with API error simulation (500 status code)
- [ ] **30.9** Test with invalid property ID
- [ ] **30.10** Test rapid filter changes (stress test state management)
- [ ] **30.11** Test multiple browser tabs with same page open
- [ ] **30.12** Test browser back/forward buttons maintain state
- [ ] **30.13** Test page refresh maintains filter state via URL
- [ ] **30.14** Check for any console errors or warnings
- [ ] **30.15** Check for any React warnings (key props, etc.)
- [ ] **30.16** Verify no memory leaks (check DevTools memory profiler)
- [ ] **30.17** Fix any bugs discovered during testing
- [ ] **30.18** Re-test after bug fixes
- [ ] **30.19** Document any known issues or limitations
- [ ] **30.20** Mark task as complete when all tests pass

---

## Completion Checklist

- [ ] All 30 tasks completed and tested
- [ ] TypeScript compilation passes with zero errors (`npm run typecheck`)
- [ ] Production build succeeds (`npm run build`)
- [ ] All translation keys added for 6 languages (en, es, fr, de, it, nl)
- [ ] Page accessible at `/dashboard2/translations`
- [ ] Data fetches correctly from batch translation status API
- [ ] All filters work correctly (type, language, status, search)
- [ ] URL state management works (shareable links)
- [ ] Bulk selection and operations work correctly
- [ ] BulkTranslationBar integrates properly
- [ ] LanguageSelectorDialog integrates properly
- [ ] Pagination works correctly
- [ ] Sorting works for all columns
- [ ] Loading, empty, and error states display correctly
- [ ] Responsive design works on mobile, tablet, and desktop
- [ ] Accessibility features implemented (ARIA, keyboard navigation)
- [ ] All text internationalized (no hardcoded strings)
- [ ] No console errors or warnings
- [ ] Code reviewed and approved
- [ ] Documentation updated (if applicable)

---

**Document Last Modified**: 2026-01-22 23:37

---

**END OF DOCUMENT**
