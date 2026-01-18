'use client';

/**
 * FilterPanel Component
 *
 * Main orchestrator filter panel that composes all filter sub-components.
 * Supports both desktop inline panel and mobile slide-up drawer modes.
 *
 * @module ItemManager/components/dialogs/FilterPanel
 * @see docs/REQ-065-implement-filterpanel-detailed.md
 * @lastModified 2026-01-04 (REQ-065 Task 2.4.5)
 */

import { useMemo, useEffect, useCallback } from 'react';
import { X, Filter, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FilterState, Property } from '../../ItemManager.types';
import { ContentTypeFilter } from './ContentTypeFilter';
import { TagFilter } from './TagFilter';
import { LocationFilter } from './LocationFilter';
import { PropertyFilter } from './PropertyFilter';

// =============================================================================
// Types
// =============================================================================

/**
 * Custom class names for FilterPanel sub-elements.
 */
export interface FilterPanelClassNames {
  container?: string;
  overlay?: string;
  panel?: string;
  section?: string;
}

/**
 * Custom labels for FilterPanel UI text.
 */
export interface FilterPanelLabels {
  title?: string;
  clearAll?: string;
  contentType?: string;
  tags?: string;
  location?: string;
  property?: string;
  applyFilters?: string;
  close?: string;
}

/**
 * Props for the FilterPanel component.
 */
export interface FilterPanelProps {
  /** Optional ID for the panel element */
  id?: string;
  /** Current filter state */
  filters: FilterState;
  /** Callback when filters change */
  onFiltersChange: (filters: FilterState) => void;
  /** Callback to clear all filters */
  onClearFilters: () => void;
  /** Whether the panel is open (for controlled visibility) */
  isOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (isOpen: boolean) => void;
  /** Available tags for the tag filter */
  availableTags: string[];
  /** Available locations for the location filter */
  availableLocations: string[];
  /** Available properties for property filter (multi-property mode) */
  properties?: Property[];
  /** Enable multi-property filtering mode */
  multiPropertyMode?: boolean;
  /** Custom class names for sub-elements */
  classNames?: FilterPanelClassNames;
  /** Custom labels for UI text */
  labels?: FilterPanelLabels;
  /** Enable mobile drawer layout */
  isMobile?: boolean;
  /** Disable all interactions */
  disabled?: boolean;
}

// =============================================================================
// Default Labels
// =============================================================================

const DEFAULT_LABELS: Required<FilterPanelLabels> = {
  title: 'Filters',
  clearAll: 'Clear All',
  contentType: 'Content Type',
  tags: 'Tags',
  location: 'Location',
  property: 'Property',
  applyFilters: 'Apply Filters',
  close: 'Close',
};

// =============================================================================
// Component
// =============================================================================

/**
 * FilterPanel Component
 *
 * Renders a comprehensive filter panel with:
 * - Content type filter chips
 * - Tag multi-select dropdown
 * - Location single-select dropdown
 * - Property multi-select (when multiPropertyMode enabled)
 *
 * Supports desktop inline mode and mobile slide-up drawer mode.
 */
export function FilterPanel({
  id,
  filters,
  onFiltersChange,
  onClearFilters,
  isOpen = true,
  onOpenChange,
  availableTags,
  availableLocations,
  properties = [],
  multiPropertyMode = false,
  classNames = {},
  labels: customLabels = {},
  isMobile = false,
  disabled = false,
}: FilterPanelProps) {
  // ---------------------------------------------------------------------------
  // Merged Labels
  // ---------------------------------------------------------------------------

  const labels: Required<FilterPanelLabels> = {
    ...DEFAULT_LABELS,
    ...customLabels,
  };

  // ---------------------------------------------------------------------------
  // Computed Values
  // ---------------------------------------------------------------------------

  /**
   * Count of active filters for the badge.
   */
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.contentTypes?.length) count += filters.contentTypes.length;
    if (filters.tags?.length) count += filters.tags.length;
    if (filters.locations?.length) count += 1;
    if (filters.propertyIds?.length) count += filters.propertyIds.length;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  /**
   * Handle content type filter changes.
   */
  const handleContentTypesChange = useCallback(
    (types: string[]) => {
      onFiltersChange({
        ...filters,
        contentTypes:
          types.length > 0
            ? (types as FilterState['contentTypes'])
            : undefined,
      });
    },
    [filters, onFiltersChange]
  );

  /**
   * Handle tag filter changes.
   */
  const handleTagsChange = useCallback(
    (tags: string[]) => {
      onFiltersChange({
        ...filters,
        tags: tags.length > 0 ? tags : undefined,
      });
    },
    [filters, onFiltersChange]
  );

  /**
   * Handle location filter changes.
   */
  const handleLocationChange = useCallback(
    (location: string | undefined) => {
      onFiltersChange({
        ...filters,
        locations: location ? [location] : undefined,
      });
    },
    [filters, onFiltersChange]
  );

  /**
   * Handle property filter changes.
   */
  const handlePropertyIdsChange = useCallback(
    (propertyIds: string[]) => {
      onFiltersChange({
        ...filters,
        propertyIds: propertyIds.length > 0 ? propertyIds : undefined,
      });
    },
    [filters, onFiltersChange]
  );

  /**
   * Close the panel (for mobile drawer).
   */
  const handleClose = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  /**
   * Prevent body scroll when mobile drawer is open.
   */
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isMobile, isOpen]);

  /**
   * Handle escape key to close mobile drawer.
   */
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, isOpen, handleClose]);

  // ---------------------------------------------------------------------------
  // Render Helpers
  // ---------------------------------------------------------------------------

  /**
   * Render the panel header with title and action buttons.
   */
  const renderHeader = () => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Filter className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">{labels.title}</h3>
        {activeFilterCount > 0 && (
          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            {activeFilterCount}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Clear All Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            disabled={disabled}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm',
              'text-gray-600 hover:bg-gray-100 transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <RotateCcw className="h-4 w-4" />
            {labels.clearAll}
          </button>
        )}

        {/* Close Button (Mobile Only) */}
        {isMobile && (
          <button
            type="button"
            onClick={handleClose}
            className={cn(
              'flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors',
              'min-h-[44px] min-w-[44px]',
              'touch-manipulation [-webkit-tap-highlight-color:transparent]',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
            )}
            aria-label={labels.close}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        )}
      </div>
    </div>
  );

  /**
   * Render the filter sections.
   */
  const renderFilters = () => (
    <div className={cn('space-y-6', classNames.section)}>
      {/* Content Type Filter */}
      <ContentTypeFilter
        selectedTypes={filters.contentTypes || []}
        onSelectionChange={handleContentTypesChange}
        disabled={disabled}
        label={labels.contentType}
      />

      {/* Tag Filter */}
      <TagFilter
        selectedTags={filters.tags || []}
        availableTags={availableTags}
        onSelectionChange={handleTagsChange}
        disabled={disabled}
        label={labels.tags}
      />

      {/* Location Filter */}
      <LocationFilter
        selectedLocation={filters.locations?.[0]}
        availableLocations={availableLocations}
        onSelectionChange={handleLocationChange}
        disabled={disabled}
        label={labels.location}
      />

      {/* Property Filter (Multi-Property Mode Only) */}
      {multiPropertyMode && properties.length > 0 && (
        <PropertyFilter
          selectedPropertyIds={filters.propertyIds || []}
          properties={properties}
          onSelectionChange={handlePropertyIdsChange}
          disabled={disabled}
          label={labels.property}
        />
      )}
    </div>
  );

  // ---------------------------------------------------------------------------
  // Mobile Drawer Render
  // ---------------------------------------------------------------------------

  if (isMobile) {
    if (!isOpen) return null;

    return (
      <>
        {/* Overlay */}
        <div
          className={cn(
            'fixed inset-0 bg-black/50 z-40',
            classNames.overlay
          )}
          onClick={handleClose}
          aria-hidden="true"
        />

        {/* Drawer */}
        <div
          id={id}
          role="dialog"
          aria-modal="true"
          aria-label={labels.title}
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50',
            'bg-white rounded-t-2xl shadow-xl',
            'max-h-[85vh] overflow-y-auto',
            'p-4 pb-8',
            'animate-slide-up',
            classNames.panel
          )}
        >
          {/* Drag Handle */}
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

          {/* Header */}
          {renderHeader()}

          {/* Filter Sections */}
          {renderFilters()}

          {/* Mobile Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className={cn(
                'w-full py-3 px-4 rounded-lg',
                'bg-blue-600 text-white font-medium',
                'hover:bg-blue-700 active:bg-blue-800 transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                'min-h-[48px]',
                'touch-manipulation [-webkit-tap-highlight-color:transparent]'
              )}
            >
              {labels.applyFilters}
            </button>
          </div>
        </div>
      </>
    );
  }

  // ---------------------------------------------------------------------------
  // Desktop Inline Render
  // ---------------------------------------------------------------------------

  if (!isOpen) return null;

  return (
    <div
      id={id}
      className={cn(
        'bg-white border border-gray-200 rounded-lg shadow-sm p-4',
        classNames.container,
        classNames.panel
      )}
    >
      {/* Header */}
      {renderHeader()}

      {/* Filter Sections */}
      {renderFilters()}
    </div>
  );
}

export default FilterPanel;
