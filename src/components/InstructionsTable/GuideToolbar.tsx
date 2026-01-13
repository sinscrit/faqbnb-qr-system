'use client';

/**
 * GuideToolbar Component
 *
 * Provides toolbar controls for the Guides list page including view toggle,
 * search input, purpose filter, and clear filters button.
 *
 * @module InstructionsTable/GuideToolbar
 * @see docs/req-220-toolbar-infrastructure-guides-list-overview.md
 * @lastModified 2026-01-13 (REQ-220)
 */

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { LayoutGrid, List, X, ChevronDown, Check } from 'lucide-react';
import { SearchInput } from '@/components/ItemManager/components/SearchInput';
import type { GuideFilterState } from './hooks/useGuideSearch';

// =============================================================================
// Types
// =============================================================================

export interface GuideToolbarProps {
  /** Current view mode ('grid' or 'list') */
  viewMode: 'grid' | 'list';
  /** Callback when view mode changes */
  onViewModeChange: (mode: 'grid' | 'list') => void;

  /** Current search query string */
  searchQuery: string;
  /** Callback when search query changes */
  onSearchChange: (query: string) => void;

  /** Current filter state */
  filters: GuideFilterState;
  /** Callback when filters change */
  onFiltersChange: (filters: Partial<GuideFilterState>) => void;
  /** Callback to clear all filters and search */
  onClearFilters: () => void;

  /** Available filter options */
  filterOptions: {
    purposes: string[];
  };

  /** Number of guides after filtering */
  resultCount: number;
  /** Total number of guides */
  totalCount: number;
  /** Whether any filters are active */
  isFiltered: boolean;
}

// =============================================================================
// ViewToggle Sub-component
// =============================================================================

interface ViewToggleProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  className?: string;
}

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
// PurposeFilterDropdown Sub-component
// =============================================================================

interface PurposeFilterDropdownProps {
  purposes: string[];
  selectedPurposes: string[];
  onPurposesChange: (purposes: string[]) => void;
  className?: string;
}

/**
 * Format purpose label for display
 */
function formatPurposeLabel(purpose: string): string {
  return purpose
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function PurposeFilterDropdown({
  purposes,
  selectedPurposes,
  onPurposesChange,
  className,
}: PurposeFilterDropdownProps) {
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

  const handlePurposeToggle = (purpose: string) => {
    if (selectedPurposes.includes(purpose)) {
      onPurposesChange(selectedPurposes.filter((p) => p !== purpose));
    } else {
      onPurposesChange([...selectedPurposes, purpose]);
    }
  };

  if (purposes.length === 0) return null;

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
          selectedPurposes.length > 0
            ? 'bg-[#FFF0F3] border-[#FF385C] text-[#E31C5F]'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>
          {selectedPurposes.length > 0
            ? `Purpose (${selectedPurposes.length})`
            : 'Purpose'}
        </span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Select purpose types"
          className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 max-h-60 overflow-y-auto"
        >
          {purposes.map((purpose) => {
            const isSelected = selectedPurposes.includes(purpose);
            return (
              <button
                key={purpose}
                role="option"
                aria-selected={isSelected}
                onClick={() => handlePurposeToggle(purpose)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-sm text-left',
                  'hover:bg-gray-50 transition-colors min-h-[48px]',
                  isSelected && 'bg-[#FFF0F3]'
                )}
              >
                {/* Checkbox Indicator */}
                <div
                  className={cn(
                    'w-5 h-5 flex items-center justify-center flex-shrink-0',
                    'rounded border',
                    isSelected
                      ? 'bg-[#FF385C] border-[#FF385C]'
                      : 'border-gray-300 bg-white'
                  )}
                >
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                  )}
                </div>
                <span>{formatPurposeLabel(purpose)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// ClearFiltersButton Sub-component
// =============================================================================

interface ClearFiltersButtonProps {
  onClick: () => void;
  className?: string;
}

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
// Main GuideToolbar Component
// =============================================================================

export function GuideToolbar({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  onClearFilters,
  filterOptions,
  resultCount,
  totalCount,
  isFiltered,
}: GuideToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Guide management controls"
      className="flex flex-col gap-4 p-4 bg-white border border-gray-200 rounded-lg mb-4"
    >
      {/* Row 1: View Toggle + Search + Purpose Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* View Toggle */}
        <div className="flex-shrink-0">
          <ViewToggle
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
          />
        </div>

        {/* Search Input */}
        <div className="flex-1">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search guides..."
            className="w-full"
          />
        </div>

        {/* Purpose Filter */}
        {filterOptions.purposes.length > 0 && (
          <div className="flex-shrink-0">
            <PurposeFilterDropdown
              purposes={filterOptions.purposes}
              selectedPurposes={filters.purposes || []}
              onPurposesChange={(purposes) => onFiltersChange({ purposes })}
            />
          </div>
        )}
      </div>

      {/* Row 2: Result Count + Clear Filters (only when filtered) */}
      {isFiltered && (
        <div className="flex items-center justify-between gap-4">
          {/* Result Count */}
          <div className="text-sm text-gray-500">
            Showing {resultCount} of {totalCount} guides
          </div>

          {/* Clear Filters Button */}
          <ClearFiltersButton onClick={onClearFilters} />
        </div>
      )}
    </div>
  );
}

export default GuideToolbar;
