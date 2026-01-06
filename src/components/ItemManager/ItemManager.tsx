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
 * @lastModified 2026-01-04 (REQ-070 - Replaced inline bulk actions with BulkActionsBar component)
 */

import { useCallback, useMemo, useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useItemManagerState } from './hooks/useItemManagerState';
import { useItemSearch } from './hooks/useItemSearch';
import { useAnnounce } from './utils/a11yUtils';
import { ItemGrid } from './components/ItemGrid';
import { ItemList } from './components/ItemList';
import { ItemToolbar } from './components/ItemToolbar';
import { ViewModeToggle } from './components/shared/ViewModeToggle';
import { EmptyState } from './components/shared/EmptyState';
import { LoadingState } from './components/shared/LoadingState';
import { BulkActionsBar, BulkTagDialog, BulkMoveDialog } from './components/BulkActions';
import { ConfirmDeleteDialog } from './components/dialogs';
import { ItemPreviewModal } from './components/ItemPreview/ItemPreviewModal';
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
  // Search, Filter, Sort (REQ-062/REQ-063)
  // -------------------------------------------------------------------------

  const {
    filteredItems,
    resultCount,
    totalCount,
    isFiltered,
    filterOptions,
  } = useItemSearch({
    items,
    searchQuery: state.searchQuery,
    filters: state.filters,
    sortBy: state.sortBy,
  });

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
  // Bulk Delete State (REQ-070, REQ-071)
  // -------------------------------------------------------------------------

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  /**
   * Memoized array of selected items for ConfirmDeleteDialog.
   * @see REQ-071
   */
  const selectedItemsForDelete = useMemo(
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
  // Bulk Delete Handlers (REQ-070, REQ-071)
  // -------------------------------------------------------------------------

  /**
   * Opens the delete confirmation dialog.
   * Triggered by BulkActionsBar delete button.
   * @see REQ-071 - ConfirmDeleteDialog implementation
   */
  const handleBulkDelete = useCallback(() => {
    if (state.selectedIds.size > 0) {
      setShowDeleteConfirm(true);
    }
  }, [state.selectedIds]);

  /**
   * Handles confirmed delete action.
   * Calls onDeleteItems callback and manages loading state.
   */
  const handleConfirmDelete = useCallback(async () => {
    if (state.selectedIds.size === 0) return;

    const idsToDelete = Array.from(state.selectedIds);

    setIsDeleting(true);
    try {
      await onDeleteItems(idsToDelete);
      // Clear selection after successful delete
      clearSelection();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Delete operation failed:', error);
      // Dialog stays open on error so user can retry or cancel
    } finally {
      setIsDeleting(false);
    }
  }, [state.selectedIds, onDeleteItems, clearSelection]);

  /**
   * Handles cancel/dismiss of delete dialog.
   */
  const handleCancelDelete = useCallback(() => {
    if (!isDeleting) {
      setShowDeleteConfirm(false);
    }
  }, [isDeleting]);

  // -------------------------------------------------------------------------
  // Long-Press Selection Handler (REQ-069)
  // -------------------------------------------------------------------------

  /**
   * Handler for long-press selection.
   * Enters selection mode and selects the pressed item.
   */
  const handleLongPressSelect = useCallback(
    (id: string) => {
      if (!state.isSelectionMode) {
        toggleSelectionMode();
      }
      selectItem(id);
    },
    [state.isSelectionMode, toggleSelectionMode, selectItem]
  );

  /**
   * Handler for selecting all visible/filtered items.
   * Used by the toolbar's SelectionIndicator.
   */
  const handleSelectAllFiltered = useCallback(() => {
    const ids = filteredItems.map((item) => item.id);
    selectAll(ids);
  }, [filteredItems, selectAll]);

  // -------------------------------------------------------------------------
  // Render Functions
  // -------------------------------------------------------------------------

  const renderContent = useMemo(() => {
    // Loading state - render first (takes priority)
    if (loading) {
      if (renderLoadingState) {
        return renderLoadingState();
      }
      return (
        <LoadingState
          viewMode={state.viewMode}
          className={classNames?.loadingState}
        />
      );
    }

    // Error state - render if error exists
    if (error) {
      if (renderErrorState) {
        return renderErrorState(error);
      }
      return (
        <div className={cn('text-center py-12', classNames?.emptyState)}>
          <p className="text-red-600">An error occurred: {error.message}</p>
        </div>
      );
    }

    // Empty state - render if no items at all
    if (items.length === 0) {
      if (renderEmptyState) {
        return renderEmptyState();
      }
      return (
        <EmptyState
          title={effectiveConfig.labels.emptyStateTitle}
          description={effectiveConfig.labels.emptyStateDescription}
          className={classNames?.emptyState}
        />
      );
    }

    // No results state - render if filtering yields no results
    if (filteredItems.length === 0 && isFiltered) {
      return (
        <EmptyState
          title={effectiveConfig.labels.noResultsTitle || 'No matching items'}
          description={effectiveConfig.labels.noResultsDescription || 'Try adjusting your search or filters'}
          className={classNames?.emptyState}
        />
      );
    }

    // Render items based on view mode
    if (state.viewMode === 'grid') {
      return (
        <div className={cn('flex-1 p-4', classNames?.itemGrid)}>
          <ItemGrid
            items={filteredItems}
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
            onLongPressSelect={handleLongPressSelect}
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
          items={filteredItems}
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
          onLongPressSelect={handleLongPressSelect}
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
    filteredItems,
    isFiltered,
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
    handleLongPressSelect,
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
    totalCount,
    filteredCount: resultCount,
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
    totalCount,
    resultCount,
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
            filterOptions={filterOptions}
            sortBy={state.sortBy}
            onSortChange={setSort}
            enableSort={effectiveConfig.enableSort}
            resultCount={resultCount}
            totalCount={totalCount}
            isFiltered={isFiltered}
            labels={effectiveConfig.labels}
            // Selection props (REQ-069)
            selectedCount={selectedCount}
            onClearSelection={clearSelection}
            onSelectAll={handleSelectAllFiltered}
          />
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {renderContent}
      </div>

      {/* Bulk Actions Bar (REQ-070) */}
      {effectiveConfig.enableBulkActions && (
        <BulkActionsBar
          selectedCount={selectedCount}
          onDelete={handleBulkDelete}
          onAddTag={handleBulkAddTag}
          onRemoveTag={handleBulkRemoveTag}
          onMoveToProperty={isMultiPropertyMode && properties && properties.length > 0 ? handleBulkMove : undefined}
          onExitSelection={clearSelection}
          multiPropertyMode={isMultiPropertyMode && properties && properties.length > 0}
          loading={bulkLoading || bulkMoveLoading}
        />
      )}

      {/* Preview Modal */}
      {renderItemPreview ? (
        state.previewItem && (
          <div className={cn('fixed inset-0 z-50', classNames?.previewModal)}>
            {renderItemPreview(state.previewItem)}
          </div>
        )
      ) : (
        <ItemPreviewModal
          isOpen={!!state.previewItem}
          onClose={closePreview}
          item={state.previewItem}
          onEditItem={onEditItem}
          onDeleteItems={handleBulkDelete}
          onManageAssets={openAssetPanel}
          config={{ enableAssetManagement: effectiveConfig.enableAssetManagement }}
          className={classNames?.previewModal}
        >
          {/* Item preview content */}
          {state.previewItem && (
            <div className="space-y-4">
              {/* Description */}
              {state.previewItem.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                  <p className="text-gray-600">{state.previewItem.description}</p>
                </div>
              )}

              {/* QR Code Preview */}
              {state.previewItem.qrCodeUrl && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">QR Code</h4>
                  <div className="flex justify-center">
                    <img
                      src={state.previewItem.qrCodeUrl}
                      alt={`QR code for ${state.previewItem.name}`}
                      className="w-32 h-32 border border-gray-200 rounded"
                    />
                  </div>
                </div>
              )}

              {/* Created/Updated dates */}
              <div className="text-xs text-gray-500 pt-2 border-t">
                <p>Created: {new Date(state.previewItem.createdAt).toLocaleDateString()}</p>
                {state.previewItem.updatedAt && (
                  <p>Updated: {new Date(state.previewItem.updatedAt).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          )}
        </ItemPreviewModal>
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

      {/* Confirm Delete Dialog (REQ-071) */}
      <ConfirmDeleteDialog
        isOpen={showDeleteConfirm}
        items={selectedItemsForDelete}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        loading={isDeleting}
      />
    </div>
  );
}

export default ItemManager;
