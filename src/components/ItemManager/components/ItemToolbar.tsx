'use client';

/**
 * ItemToolbar Component
 *
 * Provides toolbar controls for the ItemManager including view toggle,
 * search, filters, sort, result count display, and selection indicator.
 *
 * @module ItemManager/components/ItemToolbar
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 2, Task 2.2)
 * @lastModified 2026-01-04 (REQ-069 Task 3.2.4 - Added SelectionIndicator component)
 */

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { LayoutGrid, List, X, CheckSquare, ChevronDown } from 'lucide-react';
import type {
  ItemToolbarProps,
  FilterState,
  SortOption,
} from '../ItemManager.types';
import { SearchInput } from './SearchInput';
import { SortMenu } from './dialogs/SortMenu';

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
          'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-1',
          'touch-manipulation [-webkit-tap-highlight-color:transparent]',
          viewMode === 'grid'
            ? 'bg-[#FF385C] text-white shadow-sm'
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
          'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-1',
          'touch-manipulation [-webkit-tap-highlight-color:transparent]',
          viewMode === 'list'
            ? 'bg-[#FF385C] text-white shadow-sm'
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
// REMOVED: REQ-218 Task 1 - Removed to reduce toolbar clutter
// =============================================================================

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
        'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-1',
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
// SelectionIndicator Sub-component (REQ-069 Task 3.2.4)
// =============================================================================

interface SelectionIndicatorProps {
  /** Number of currently selected items */
  selectedCount: number;
  /** Callback to clear all selections */
  onClearSelection: () => void;
  /** Optional callback to select all items */
  onSelectAll?: () => void;
  /** Total number of items (for select all comparison) */
  totalCount?: number;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Selection count badge with clear and select all buttons.
 * Displays the number of selected items and provides quick actions.
 */
function SelectionIndicator({
  selectedCount,
  onClearSelection,
  onSelectAll,
  totalCount = 0,
  className,
}: SelectionIndicatorProps) {
  // Don't render if no items selected
  if (selectedCount === 0) return null;

  // Check if all items are selected
  const allSelected = totalCount > 0 && selectedCount >= totalCount;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 bg-[#FFF0F3] text-[#E31C5F] rounded-full',
        className
      )}
    >
      <CheckSquare className="h-4 w-4" aria-hidden="true" />
      <span className="text-sm font-medium">
        {selectedCount} selected
      </span>

      {/* Clear selection button */}
      <button
        type="button"
        onClick={onClearSelection}
        className={cn(
          'ml-1 hover:bg-[#FFE4E9] rounded-full p-0.5 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-1'
        )}
        aria-label="Clear selection"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      {/* Select all link (if not all selected) */}
      {onSelectAll && !allSelected && totalCount > 0 && (
        <>
          <span className="text-[#FF385C]/50 mx-1" aria-hidden="true">|</span>
          <button
            type="button"
            onClick={onSelectAll}
            className={cn(
              'text-sm font-medium text-[#FF385C] hover:text-[#E31C5F]',
              'focus:outline-none focus:underline'
            )}
          >
            Select all ({totalCount})
          </button>
        </>
      )}
    </div>
  );
}

// =============================================================================
// SearchPlaceholder Sub-component (Task 2.2.6) - DEPRECATED
// =============================================================================

/**
 * @deprecated Use SearchInput from './SearchInput' instead.
 * Kept for reference until fully removed.
 */
// function SearchPlaceholder has been replaced by SearchInput component

// =============================================================================
// SortPlaceholder Sub-component (Task 2.2.7)
// DEPRECATED: Replaced by SortMenu component in REQ-066 Task 2.5
// =============================================================================

// The SortPlaceholder has been replaced by the SortMenu component.
// See: src/components/ItemManager/components/dialogs/SortMenu.tsx

// =============================================================================
// RoomFilterDropdown Sub-component (REQ-216)
// =============================================================================

interface RoomFilterDropdownProps {
  rooms: string[];
  selectedRooms: string[];
  onRoomsChange: (rooms: string[]) => void;
  className?: string;
}

function RoomFilterDropdown({
  rooms,
  selectedRooms,
  onRoomsChange,
  className,
}: RoomFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleRoomToggle = (room: string) => {
    if (selectedRooms.includes(room)) {
      onRoomsChange(selectedRooms.filter(r => r !== room));
    } else {
      onRoomsChange([...selectedRooms, room]);
    }
  };

  if (rooms.length === 0) return null;

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-2 rounded-lg border',
          'text-sm font-medium transition-colors',
          'min-h-[48px]',
          'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-1',
          selectedRooms.length > 0
            ? 'bg-[#FFF0F3] border-[#FF385C] text-[#E31C5F]'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>
          {selectedRooms.length > 0
            ? `Room (${selectedRooms.length})`
            : 'Room'}
        </span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Select rooms"
          className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 max-h-60 overflow-y-auto"
        >
          {rooms.map((room) => (
            <button
              key={room}
              role="option"
              aria-selected={selectedRooms.includes(room)}
              onClick={() => handleRoomToggle(room)}
              className={cn(
                'w-full flex items-center gap-2 px-4 py-2 text-sm text-left',
                'hover:bg-gray-50 transition-colors',
                selectedRooms.includes(room) && 'bg-[#FFF0F3]'
              )}
            >
              <input
                type="checkbox"
                checked={selectedRooms.includes(room)}
                onChange={() => {}}
                className="w-4 h-4 rounded border-gray-300 text-[#FF385C] focus:ring-[#FF385C]"
              />
              <span>{room}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// FiltersPlaceholder Sub-component (Task 2.2.8)
// REMOVED: REQ-218 Task 1 - Removed to reduce toolbar clutter
// =============================================================================

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
  // Selection props (REQ-069)
  selectedCount,
  onClearSelection,
  onSelectAll,
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
              <SearchInput
                value={searchQuery}
                onChange={onSearchChange}
                placeholder={searchPlaceholder}
                className="w-full"
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
              <SortMenu
                currentSort={sortBy}
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
              options: filterOptions || { contentTypes: [], tags: [], locations: [], rooms: [] },
            })
          ) : (
            <>
              {/* Room Filter Dropdown */}
              {filterOptions?.rooms && filterOptions.rooms.length > 0 && (
                <RoomFilterDropdown
                  rooms={filterOptions.rooms}
                  selectedRooms={filters.rooms || []}
                  onRoomsChange={(rooms) => onFiltersChange({ rooms })}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Row 3: Selection Indicator + Clear Filters (REQ-218) */}
      <div className="flex items-center justify-between gap-4">
        {/* Selection Indicator (REQ-069) */}
        {selectedCount !== undefined && selectedCount > 0 && onClearSelection && (
          <SelectionIndicator
            selectedCount={selectedCount}
            onClearSelection={onClearSelection}
            onSelectAll={onSelectAll}
            totalCount={resultCount}
          />
        )}

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
