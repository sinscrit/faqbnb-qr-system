'use client';

/**
 * ItemManager Component
 *
 * Main orchestrating component for browsing, organizing, searching,
 * filtering, and managing instructional content items.
 *
 * @module ItemManager/ItemManager
 * @see docs/prd/item-capture-manager-implementation-plan.md
 * @see docs/REQ-057-build-basic-itemmanager-shell-overview.md
 * @lastModified 2026-01-03 (REQ-090 Task 2 - Added accessibility features)
 */

import { useCallback, useMemo, useEffect, useState, useRef } from 'react';
import { Tag, Minus, FolderInput, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useItemManagerState } from './hooks/useItemManagerState';
import { useAnnounce } from './utils/a11yUtils';
import { ItemGrid } from './components/ItemGrid';
import { ItemList } from './components/ItemList';
import { ItemToolbar } from './components/ItemToolbar';
import { ViewModeToggle } from './components/shared/ViewModeToggle';
import { BulkTagDialog, BulkMoveDialog } from './components/BulkActions';
import type {
  ItemManagerProps,
  ItemManagerConfig,
  ItemActions,
  ToolbarRenderProps,
} from './ItemManager.types';
import type { ItemRecord } from '@/components/ItemCapture';
import { SUGGESTED_TAGS } from '@/components/ItemCapture/utils/constants';

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_CONFIG: Required<ItemManagerConfig> = {
  defaultView: 'grid',
  allowViewToggle: true,
  enableBulkActions: true,
  enableInlineEdit: true,
  enableAssetManagement: true,
  enableDuplicate: false,
  enableSearch: true,
  enableFilters: true,
  enableSort: true,
  multiPropertyMode: false,
  maxBulkSelection: 100,
  labels: {
    searchPlaceholder: 'Search items...',
    emptyStateTitle: 'No items yet',
    emptyStateDescription: 'Create your first item to get started',
    deleteConfirmTitle: 'Delete Item',
    deleteConfirmMessage: 'Are you sure you want to delete this item? This action cannot be undone.',
  },
};

// =============================================================================
// Helper Functions
// =============================================================================

const mergeConfig = (config?: ItemManagerConfig): Required<ItemManagerConfig> => ({
  ...DEFAULT_CONFIG,
  ...config,
  labels: {
    ...DEFAULT_CONFIG.labels,
    ...config?.labels,
  },
});

// =============================================================================
// Main Component
// =============================================================================

export function ItemManager({
  items,
  properties,
  loading = false,
  error = null,
  onEditItem,
  onDeleteItems,
  onUpdateItem,
  onAddAssets,
  onRemoveAssets,
  onReorderAssets,
  onDuplicateItem,
  onSelectionChange,
  config: userConfig,
  renderItem,
  renderEmptyState,
  renderLoadingState,
  renderErrorState,
  renderToolbar,
  renderItemPreview,
  renderConfirmDialog,
  classNames,
}: ItemManagerProps) {
  // -------------------------------------------------------------------------
  // Config Merging
  // -------------------------------------------------------------------------

  const config = useMemo(() => mergeConfig(userConfig), [userConfig]);

  const effectiveConfig = useMemo(() => ({
    ...config,
    multiPropertyMode: config.multiPropertyMode || (properties && properties.length > 0),
  }), [config, properties]);

  // -------------------------------------------------------------------------
  // State Management
  // -------------------------------------------------------------------------

  const {
    state,
    setViewMode,
    setSearchQuery,
    setFilters,
    clearFilters,
    setSort,
    selectItem,
    deselectItem,
    toggleItemSelection,
    selectAll,
    clearSelection,
    toggleSelectionMode,
    openPreview,
    closePreview,
    openAssetPanel,
    closeAssetPanel,
    toggleFilterPanel,
    startInlineEdit,
    endInlineEdit,
    selectedCount,
    hasSelection,
    hasFilters,
    isItemSelected,
  } = useItemManagerState(effectiveConfig);

  // -------------------------------------------------------------------------
  // Accessibility Announcements (REQ-090)
  // -------------------------------------------------------------------------

  const { announce, AnnouncerRegion } = useAnnounce();
  const prevSelectedCountRef = useRef<number>(0);

  // -------------------------------------------------------------------------
  // Bulk Tag Dialog State
  // -------------------------------------------------------------------------

  const [tagDialogMode, setTagDialogMode] = useState<'add' | 'remove' | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  // -------------------------------------------------------------------------
  // Bulk Move Dialog State
  // -------------------------------------------------------------------------

  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [bulkMoveLoading, setBulkMoveLoading] = useState(false);

  // -------------------------------------------------------------------------
  // Computed Values for Bulk Actions
  // -------------------------------------------------------------------------

  /**
   * Determine if multi-property mode is active.
   */
  const isMultiPropertyMode = useMemo(() => {
    return effectiveConfig.multiPropertyMode || (properties && properties.length > 1);
  }, [effectiveConfig.multiPropertyMode, properties]);

  /**
   * Collect all unique tags from all items plus suggested tags for autocomplete suggestions.
   * Used for both bulk tag operations and inline tag editing.
   *
   * @lastModified 2026-01-03 (REQ-088 Task 8 - Added SUGGESTED_TAGS baseline)
   */
  const allExistingTags = useMemo(() => {
    const tagSet = new Set<string>();

    // Add suggested tags as baseline
    SUGGESTED_TAGS.forEach((tag) => tagSet.add(tag));

    // Add tags from all items
    items.forEach((item) => {
      (item.tags || []).forEach((tag) => tagSet.add(tag));
    });

    // Sort alphabetically (case-insensitive)
    return Array.from(tagSet).sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );
  }, [items]);

  /**
   * Get the selected items based on selectedIds.
   */
  const getSelectedItems = useCallback(
    () => items.filter((item) => state.selectedIds.has(item.id)),
    [items, state.selectedIds]
  );

  // -------------------------------------------------------------------------
  // Inline Edit Handler (REQ-087)
  // -------------------------------------------------------------------------

  /**
   * Wrapper for onUpdateItem that returns a Promise.
   * The InlineEdit component expects an async callback.
   */
  const handleInlineUpdate = useCallback(
    async (item: ItemRecord): Promise<void> => {
      onUpdateItem(item);
    },
    [onUpdateItem]
  );

  // -------------------------------------------------------------------------
  // Debug Helper
  // -------------------------------------------------------------------------

  const debugLog = useCallback(
    (...args: unknown[]) => {
      if (process.env.NODE_ENV === 'development') {
        // Uncomment for debug: console.log('[ItemManager]', ...args);
      }
    },
    []
  );

  // -------------------------------------------------------------------------
  // Item Actions Factory
  // -------------------------------------------------------------------------

  const createItemActions = useCallback(
    (item: ItemRecord): ItemActions => ({
      edit: () => {
        debugLog('Edit item:', item.id);
        onEditItem(item);
      },
      delete: () => {
        debugLog('Delete item:', item.id);
        onDeleteItems([item.id]);
      },
      duplicate: () => {
        debugLog('Duplicate item:', item.id);
        onDuplicateItem?.(item);
      },
      manageAssets: () => {
        debugLog('Manage assets for:', item.id);
        if (effectiveConfig.enableAssetManagement) {
          openAssetPanel(item);
        }
      },
      select: () => {
        debugLog('Select item:', item.id);
        selectItem(item.id);
      },
      deselect: () => {
        debugLog('Deselect item:', item.id);
        deselectItem(item.id);
      },
      isSelected: isItemSelected(item.id),
    }),
    [
      debugLog,
      onEditItem,
      onDeleteItems,
      onDuplicateItem,
      effectiveConfig.enableAssetManagement,
      openAssetPanel,
      selectItem,
      deselectItem,
      isItemSelected,
    ]
  );

  // -------------------------------------------------------------------------
  // Effects
  // -------------------------------------------------------------------------

  // Notify parent of selection changes
  useEffect(() => {
    if (onSelectionChange) {
      const selectedArray = Array.from(state.selectedIds);
      debugLog('Selection changed:', selectedArray);
      onSelectionChange(selectedArray);
    }
  }, [state.selectedIds, onSelectionChange, debugLog]);

  // Announce selection changes for screen readers (REQ-090)
  useEffect(() => {
    const currentCount = selectedCount;
    const prevCount = prevSelectedCountRef.current;

    if (currentCount !== prevCount && currentCount > 0) {
      announce(`${currentCount} item${currentCount !== 1 ? 's' : ''} selected`);
    } else if (currentCount === 0 && prevCount > 0) {
      announce('Selection cleared');
    }

    prevSelectedCountRef.current = currentCount;
  }, [selectedCount, announce]);

  // -------------------------------------------------------------------------
  // Bulk Tag Handlers
  // -------------------------------------------------------------------------

  /**
   * Open dialog to add tags to selected items.
   */
  const handleBulkAddTag = useCallback(() => {
    setTagDialogMode('add');
  }, []);

  /**
   * Open dialog to remove tags from selected items.
   */
  const handleBulkRemoveTag = useCallback(() => {
    setTagDialogMode('remove');
  }, []);

  /**
   * Handle tag confirmation from dialog.
   * Applies tag additions or removals to all selected items.
   */
  const handleTagConfirm = useCallback(
    async (tags: string[]) => {
      if (tags.length === 0) return;

      const selectedItemsList = getSelectedItems();
      setBulkLoading(true);

      try {
        for (const item of selectedItemsList) {
          let updatedTags: string[];

          if (tagDialogMode === 'add') {
            // Add new tags (avoiding duplicates)
            const currentTags = item.tags || [];
            const newTags = tags.filter(
              (t) => !currentTags.some((ct) => ct.toLowerCase() === t.toLowerCase())
            );
            updatedTags = [...currentTags, ...newTags];
          } else {
            // Remove specified tags
            updatedTags = (item.tags || []).filter(
              (t) => !tags.some((rt) => rt.toLowerCase() === t.toLowerCase())
            );
          }

          await onUpdateItem({ ...item, tags: updatedTags });
        }

        // Close dialog and clear selection after successful operation
        setTagDialogMode(null);
        clearSelection();
      } finally {
        setBulkLoading(false);
      }
    },
    [tagDialogMode, getSelectedItems, onUpdateItem, clearSelection]
  );

  /**
   * Close tag dialog without applying changes.
   */
  const handleTagCancel = useCallback(() => {
    setTagDialogMode(null);
  }, []);

  // -------------------------------------------------------------------------
  // Bulk Move Handlers
  // -------------------------------------------------------------------------

  /**
   * Open dialog to move selected items to a different property.
   */
  const handleBulkMove = useCallback(() => {
    setShowMoveDialog(true);
  }, []);

  /**
   * Handle move confirmation from dialog.
   * Updates propertyId for all selected items.
   */
  const handleMoveConfirm = useCallback(
    async (destinationPropertyId: string) => {
      const selectedItemsList = getSelectedItems();
      if (selectedItemsList.length === 0 || !destinationPropertyId) return;

      setBulkMoveLoading(true);

      try {
        for (const item of selectedItemsList) {
          // Update item with new propertyId
          await onUpdateItem({
            ...item,
            propertyId: destinationPropertyId,
          } as ItemRecord & { propertyId: string });
        }

        // Close dialog and clear selection after successful operation
        setShowMoveDialog(false);
        clearSelection();
      } finally {
        setBulkMoveLoading(false);
      }
    },
    [getSelectedItems, onUpdateItem, clearSelection]
  );

  /**
   * Close move dialog without applying changes.
   */
  const handleMoveCancel = useCallback(() => {
    setShowMoveDialog(false);
  }, []);

  // -------------------------------------------------------------------------
  // Render Functions
  // -------------------------------------------------------------------------

  const renderContent = useMemo(() => {
    // Loading state
    if (loading) {
      if (renderLoadingState) {
        return renderLoadingState();
      }
      return (
        <div className={cn('flex items-center justify-center py-12', classNames?.loadingState)}>
          <div className="text-gray-500">Loading items...</div>
        </div>
      );
    }

    // Error state
    if (error) {
      if (renderErrorState) {
        return renderErrorState(error);
      }
      return (
        <div className={cn('flex items-center justify-center py-12', classNames?.emptyState)}>
          <div className="text-red-500">Error: {error.message}</div>
        </div>
      );
    }

    // Empty state
    if (items.length === 0) {
      if (renderEmptyState) {
        return renderEmptyState();
      }
      return (
        <div className={cn('flex flex-col items-center justify-center py-12', classNames?.emptyState)}>
          <div className="text-lg font-medium text-gray-900">
            {effectiveConfig.labels.emptyStateTitle}
          </div>
          <div className="mt-1 text-sm text-gray-500">
            {effectiveConfig.labels.emptyStateDescription}
          </div>
        </div>
      );
    }

    // Render items based on view mode
    if (state.viewMode === 'grid') {
      return (
        <div className={cn('flex-1 p-4', classNames?.itemGrid)}>
          <ItemGrid
            items={items}
            onItemPreview={openPreview}
            onSelectionChange={(id, selected) => {
              if (selected) {
                selectItem(id);
              } else {
                deselectItem(id);
              }
            }}
            selectedIds={state.selectedIds}
            isSelectionMode={state.isSelectionMode}
            enableInlineEdit={effectiveConfig.enableInlineEdit}
            onUpdateItem={handleInlineUpdate}
            existingTags={allExistingTags}
          />
        </div>
      );
    }

    // List view
    return (
      <div className={cn('flex-1 p-4', classNames?.itemList)}>
        <ItemList
          items={items}
          onItemPreview={openPreview}
          onSelectionChange={(id, selected) => {
            if (selected) {
              selectItem(id);
            } else {
              deselectItem(id);
            }
          }}
          selectedIds={state.selectedIds}
          isSelectionMode={state.isSelectionMode}
          onEdit={onEditItem}
          onDelete={(item) => onDeleteItems([item.id])}
          onManageAssets={effectiveConfig.enableAssetManagement ? openAssetPanel : undefined}
          onDuplicate={effectiveConfig.enableDuplicate ? onDuplicateItem : undefined}
          enableInlineEdit={effectiveConfig.enableInlineEdit}
          onUpdateItem={handleInlineUpdate}
          existingTags={allExistingTags}
        />
      </div>
    );
  }, [
    loading,
    error,
    items,
    state.viewMode,
    state.selectedIds,
    state.isSelectionMode,
    effectiveConfig.labels,
    effectiveConfig.enableAssetManagement,
    effectiveConfig.enableDuplicate,
    effectiveConfig.enableInlineEdit,
    renderLoadingState,
    renderErrorState,
    renderEmptyState,
    classNames,
    openPreview,
    selectItem,
    deselectItem,
    onEditItem,
    onDeleteItems,
    openAssetPanel,
    onDuplicateItem,
    handleInlineUpdate,
    allExistingTags,
  ]);

  // -------------------------------------------------------------------------
  // Toolbar Render Props
  // -------------------------------------------------------------------------

  const toolbarProps: ToolbarRenderProps = useMemo(() => ({
    viewMode: state.viewMode,
    onViewModeChange: setViewMode,
    searchQuery: state.searchQuery,
    onSearchChange: setSearchQuery,
    filters: state.filters,
    onFiltersChange: setFilters,
    onClearFilters: clearFilters,
    sortBy: state.sortBy,
    onSortChange: setSort,
    selectedCount,
    hasFilters,
    isFilterPanelOpen: state.isFilterPanelOpen,
    onToggleFilterPanel: toggleFilterPanel,
    config: effectiveConfig,
    totalCount: items.length,
    filteredCount: items.length, // TODO: Update when filtering is implemented
  }), [
    state.viewMode,
    state.searchQuery,
    state.filters,
    state.sortBy,
    state.isFilterPanelOpen,
    setViewMode,
    setSearchQuery,
    setFilters,
    clearFilters,
    setSort,
    selectedCount,
    hasFilters,
    toggleFilterPanel,
    effectiveConfig,
    items.length,
  ]);

  // -------------------------------------------------------------------------
  // Main Render
  // -------------------------------------------------------------------------

  return (
    <div
      role="region"
      aria-label="Item manager"
      className={cn('flex flex-col h-full bg-white', classNames?.container)}
    >
      {/* Screen reader announcements (REQ-090) */}
      <AnnouncerRegion />

      {/* Toolbar Area */}
      <div className={classNames?.toolbar}>
        {renderToolbar ? (
          renderToolbar(toolbarProps)
        ) : (
          <ItemToolbar
            viewMode={state.viewMode}
            onViewModeChange={setViewMode}
            allowViewToggle={effectiveConfig.allowViewToggle}
            searchQuery={state.searchQuery}
            onSearchChange={setSearchQuery}
            enableSearch={effectiveConfig.enableSearch}
            filters={state.filters}
            onFiltersChange={setFilters}
            onClearFilters={clearFilters}
            enableFilters={effectiveConfig.enableFilters}
            sortBy={state.sortBy}
            onSortChange={setSort}
            enableSort={effectiveConfig.enableSort}
            resultCount={items.length}
            totalCount={items.length}
            isFiltered={hasFilters || state.searchQuery.length > 0}
            labels={effectiveConfig.labels}
          />
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {renderContent}
      </div>

      {/* Bulk Actions Bar (REQ-090 - Added accessibility) */}
      {effectiveConfig.enableBulkActions && hasSelection && (
        <div
          role="toolbar"
          aria-label={`Bulk actions for ${selectedCount} selected items`}
          className={cn(
            'fixed bottom-4 left-1/2 -translate-x-1/2',
            'bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg',
            'flex items-center gap-4'
          )}
        >
          {/* Screen reader announcement */}
          <span className="sr-only" aria-live="polite">
            {selectedCount} items selected. Bulk actions available.
          </span>

          <span className="font-medium" aria-hidden="true">{selectedCount} selected</span>
          <div className="h-4 w-px bg-gray-600" aria-hidden="true" />
          <button
            onClick={handleBulkAddTag}
            disabled={bulkLoading || bulkMoveLoading}
            aria-label="Add tag to selected items"
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm',
              'bg-blue-600 hover:bg-blue-700 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900',
              (bulkLoading || bulkMoveLoading) && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Tag className="h-4 w-4" aria-hidden="true" />
            Add Tag
          </button>
          <button
            onClick={handleBulkRemoveTag}
            disabled={bulkLoading || bulkMoveLoading}
            aria-label="Remove tag from selected items"
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm',
              'bg-orange-600 hover:bg-orange-700 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-gray-900',
              (bulkLoading || bulkMoveLoading) && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
            Remove Tag
          </button>
          {/* Move to... button - only in multi-property mode */}
          {isMultiPropertyMode && properties && properties.length > 0 && (
            <button
              onClick={handleBulkMove}
              disabled={bulkLoading || bulkMoveLoading}
              aria-label="Move selected items to another property"
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm',
                'bg-purple-600 hover:bg-purple-700 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900',
                (bulkLoading || bulkMoveLoading) && 'opacity-50 cursor-not-allowed'
              )}
            >
              <FolderInput className="h-4 w-4" aria-hidden="true" />
              Move to...
            </button>
          )}
          <div className="h-4 w-px bg-gray-600" aria-hidden="true" />
          <button
            onClick={clearSelection}
            aria-label="Clear selection"
            className={cn(
              'flex items-center justify-center min-h-[44px] min-w-[44px] px-2',
              'text-gray-300 hover:text-white hover:bg-white/10 rounded-md',
              'focus:outline-none focus:ring-2 focus:ring-white/50',
              'transition-colors'
            )}
          >
            <X className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Clear selection</span>
          </button>
        </div>
      )}

      {/* Preview Modal placeholder (Phase 4) */}
      {state.previewItem && (
        <div className={cn('fixed inset-0 z-50', classNames?.previewModal)}>
          {renderItemPreview ? (
            renderItemPreview(state.previewItem)
          ) : (
            <div
              className="absolute inset-0 bg-black/50"
              onClick={closePreview}
            >
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 max-w-2xl w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-semibold">{state.previewItem.title}</h2>
                  <button onClick={closePreview} className="text-gray-400 hover:text-gray-600">
                    ✕
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  Preview content will be implemented in Phase 4
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Asset Panel placeholder (Phase 5) */}
      {state.assetPanelItem && (
        <div className={cn('fixed inset-y-0 right-0 w-80 bg-white shadow-xl z-40', classNames?.assetPanel)}>
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Manage Assets</h3>
            <button onClick={closeAssetPanel} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
          <div className="p-4 text-sm text-gray-500">
            Asset panel will be implemented in Phase 5
          </div>
        </div>
      )}

      {/* Bulk Tag Dialog */}
      {tagDialogMode && (
        <BulkTagDialog
          mode={tagDialogMode}
          selectedItems={getSelectedItems()}
          existingTags={allExistingTags}
          onConfirm={handleTagConfirm}
          onCancel={handleTagCancel}
          loading={bulkLoading}
        />
      )}

      {/* Bulk Move Dialog */}
      {showMoveDialog && isMultiPropertyMode && properties && (
        <BulkMoveDialog
          selectedItems={getSelectedItems()}
          properties={properties}
          onConfirm={handleMoveConfirm}
          onCancel={handleMoveCancel}
          loading={bulkMoveLoading}
        />
      )}
    </div>
  );
}

export default ItemManager;
