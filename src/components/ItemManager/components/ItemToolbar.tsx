'use client';

/**
 * ItemToolbar Component
 *
 * Provides toolbar controls for the ItemManager including view toggle,
 * search, filters, sort, and result count display.
 *
 * @module ItemManager/components/ItemToolbar
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 2, Task 2.2)
 * @lastModified 2026-01-03 (REQ-090 - Added accessibility features)
 */

import { cn } from '@/lib/utils';
import { LayoutGrid, List, X } from 'lucide-react';
import type {
  ItemToolbarProps,
  FilterState,
  SortOption,
} from '../ItemManager.types';

// =============================================================================
// ViewToggle Sub-component (Task 2.2.3)
// =============================================================================

interface ViewToggleProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  className?: string;
}

/**
 * Toggle control for switching between grid and list views.
 * Uses radiogroup semantics for proper accessibility.
 */
function ViewToggle({ viewMode, onViewModeChange, className }: ViewToggleProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, currentMode: 'grid' | 'list') => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const newMode = currentMode === 'grid' ? 'list' : 'grid';
      onViewModeChange(newMode);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="View mode"
      className={cn('inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5', className)}
    >
      <button
        type="button"
        role="radio"
        aria-checked={viewMode === 'grid'}
        tabIndex={viewMode === 'grid' ? 0 : -1}
        onClick={() => onViewModeChange('grid')}
        onKeyDown={(e) => handleKeyDown(e, 'grid')}
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-all',
          'min-h-[48px] min-w-[48px] md:min-h-0 md:min-w-0 md:px-3 md:py-1.5',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
          'touch-manipulation [-webkit-tap-highlight-color:transparent]',
          viewMode === 'grid'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100'
        )}
        aria-label="Grid view"
      >
        <LayoutGrid className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={viewMode === 'list'}
        tabIndex={viewMode === 'list' ? 0 : -1}
        onClick={() => onViewModeChange('list')}
        onKeyDown={(e) => handleKeyDown(e, 'list')}
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-all',
          'min-h-[48px] min-w-[48px] md:min-h-0 md:min-w-0 md:px-3 md:py-1.5',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
          'touch-manipulation [-webkit-tap-highlight-color:transparent]',
          viewMode === 'list'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100'
        )}
        aria-label="List view"
      >
        <List className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

// =============================================================================
// ResultCount Sub-component (Task 2.2.4)
// =============================================================================

interface ResultCountProps {
  count: number;
  total: number;
  isFiltered: boolean;
  className?: string;
}

/**
 * Displays the current item count with different formats based on filter state.
 */
function ResultCount({ count, total, isFiltered, className }: ResultCountProps) {
  const itemWord = total === 1 ? 'item' : 'items';

  let displayText: string;
  if (!isFiltered) {
    displayText = `${total} ${itemWord}`;
  } else if (count === 0) {
    displayText = `0 of ${total} ${itemWord} (no matches)`;
  } else {
    displayText = `${count} of ${total} ${itemWord}`;
  }

  return (
    <span
      aria-live="polite"
      className={cn('text-sm text-gray-600', className)}
    >
      {displayText}
    </span>
  );
}

// =============================================================================
// ClearFiltersButton Sub-component (Task 2.2.5)
// =============================================================================

interface ClearFiltersButtonProps {
  onClick: () => void;
  className?: string;
}

/**
 * Button to clear all active filters and search.
 * 48px minimum touch target on mobile.
 */
function ClearFiltersButton({ onClick, className }: ClearFiltersButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Clear all filters"
      className={cn(
        'inline-flex items-center gap-1.5 px-3 rounded-md',
        'min-h-[48px]',
        'text-sm font-medium text-gray-600',
        'hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
        'transition-colors',
        'touch-manipulation [-webkit-tap-highlight-color:transparent]',
        className
      )}
    >
      <X className="h-4 w-4" aria-hidden="true" />
      <span>Clear filters</span>
    </button>
  );
}

// =============================================================================
// SearchPlaceholder Sub-component (Task 2.2.6)
// =============================================================================

interface SearchPlaceholderProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

/**
 * Temporary search input placeholder.
 * Will be replaced by full SearchInput component in Task 2.3.
 * 48px minimum height on mobile for touch accessibility.
 */
function SearchPlaceholder({ value, onChange, placeholder }: SearchPlaceholderProps) {
  return (
    <div className="relative">
      <input
        type="search"
        role="searchbox"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search items"
        aria-describedby="search-hint"
        className={cn(
          'w-full px-4 text-sm',
          'min-h-[48px] md:min-h-0 md:py-2',
          'border border-gray-300 rounded-lg bg-white',
          'placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        )}
      />
      <span id="search-hint" className="sr-only">
        Search by title, location, or tags
      </span>
    </div>
  );
}

// =============================================================================
// SortPlaceholder Sub-component (Task 2.2.7)
// =============================================================================

interface SortPlaceholderProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'created-desc', label: 'Newest First' },
  { value: 'created-asc', label: 'Oldest First' },
  { value: 'title-asc', label: 'Title (A-Z)' },
  { value: 'title-desc', label: 'Title (Z-A)' },
  { value: 'updated-desc', label: 'Recently Modified' },
  { value: 'location-asc', label: 'Location (A-Z)' },
];

/**
 * Temporary sort select placeholder.
 * Will be replaced by full SortMenu component in Task 2.5.
 * 48px minimum height on mobile for touch accessibility.
 */
function SortPlaceholder({ sortBy, onSortChange }: SortPlaceholderProps) {
  return (
    <select
      value={sortBy}
      onChange={(e) => onSortChange(e.target.value as SortOption)}
      aria-label="Sort items"
      className={cn(
        'px-3 text-sm',
        'min-h-[48px] md:min-h-0 md:py-2',
        'border border-gray-300 rounded-lg bg-white',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
      )}
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

// =============================================================================
// FiltersPlaceholder Sub-component (Task 2.2.8)
// =============================================================================

interface FiltersPlaceholderProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  filterOptions?: { contentTypes: string[]; tags: string[]; locations: string[] };
}

/**
 * Temporary filter status placeholder.
 * Will be replaced by full FilterPanel component in Task 2.4.
 */
function FiltersPlaceholder({ filters }: FiltersPlaceholderProps) {
  // Check if any filters are active
  const hasFilters =
    (filters.contentTypes && filters.contentTypes.length > 0) ||
    (filters.tags && filters.tags.length > 0) ||
    (filters.locations && filters.locations.length > 0);

  return (
    <div className="text-sm text-gray-500">
      {hasFilters ? 'Filters active (full UI in Task 2.4)' : 'No filters applied'}
    </div>
  );
}

// =============================================================================
// Main ItemToolbar Component
// =============================================================================

/**
 * Main toolbar component for ItemManager.
 * Provides view toggle, search, filters, sort, and result count.
 */
export function ItemToolbar({
  // View mode props
  viewMode,
  onViewModeChange,
  allowViewToggle = true,
  // Search props
  searchQuery,
  onSearchChange,
  enableSearch = true,
  // Filter props
  filters,
  onFiltersChange,
  onClearFilters,
  enableFilters = true,
  filterOptions,
  // Sort props
  sortBy,
  onSortChange,
  enableSort = true,
  // Result props
  resultCount,
  totalCount,
  isFiltered,
  // Customization props
  labels = {},
  classNames = {},
  // Render overrides
  renderSearch,
  renderFilters,
  renderSort,
}: ItemToolbarProps) {
  const searchPlaceholder = labels.searchPlaceholder || 'Search items...';

  return (
    <div
      role="toolbar"
      aria-label="Item management controls"
      className={cn(
        'flex flex-col gap-4 p-4 bg-white border-b border-gray-200',
        classNames.container
      )}
    >
      {/* Row 1: View Toggle + Search + Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* View Toggle */}
        {allowViewToggle && (
          <div className={cn('flex-shrink-0', classNames.viewToggle)}>
            <ViewToggle
              viewMode={viewMode}
              onViewModeChange={onViewModeChange}
            />
          </div>
        )}

        {/* Search */}
        {enableSearch && (
          <div className={cn('flex-1', classNames.searchContainer)}>
            {renderSearch ? (
              renderSearch({
                value: searchQuery,
                onChange: onSearchChange,
                placeholder: searchPlaceholder,
              })
            ) : (
              <SearchPlaceholder
                value={searchQuery}
                onChange={onSearchChange}
                placeholder={searchPlaceholder}
              />
            )}
          </div>
        )}

        {/* Sort */}
        {enableSort && (
          <div className={cn('flex-shrink-0', classNames.sortContainer)}>
            {renderSort ? (
              renderSort({
                sortBy,
                onChange: onSortChange,
              })
            ) : (
              <SortPlaceholder
                sortBy={sortBy}
                onSortChange={onSortChange}
              />
            )}
          </div>
        )}
      </div>

      {/* Row 2: Filters */}
      {enableFilters && (
        <div className={classNames.filtersContainer}>
          {renderFilters ? (
            renderFilters({
              filters,
              onChange: onFiltersChange,
              options: filterOptions || { contentTypes: [], tags: [], locations: [] },
            })
          ) : (
            <FiltersPlaceholder
              filters={filters}
              onFiltersChange={onFiltersChange}
              filterOptions={filterOptions}
            />
          )}
        </div>
      )}

      {/* Row 3: Result Count + Clear Filters */}
      <div className="flex items-center justify-between">
        <ResultCount
          count={resultCount}
          total={totalCount}
          isFiltered={isFiltered}
          className={classNames.resultCount}
        />

        {isFiltered && (
          <ClearFiltersButton
            onClick={onClearFilters}
            className={classNames.clearButton}
          />
        )}
      </div>
    </div>
  );
}

// Export types for barrel export
export type { ItemToolbarProps } from '../ItemManager.types';
