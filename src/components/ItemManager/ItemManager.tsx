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
 * @lastModified 2026-01-03 (REQ-060 Task 5 - Integrated Grid/List views)
 */

import { useCallback, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useItemManagerState } from './hooks/useItemManagerState';
import { ItemGrid } from './components/ItemGrid';
import { ItemList } from './components/ItemList';
import { ViewModeToggle } from './components/shared/ViewModeToggle';
import type {
  ItemManagerProps,
  ItemManagerConfig,
  ItemActions,
  ToolbarRenderProps,
} from './ItemManager.types';
import type { ItemRecord } from '@/components/ItemCapture';

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
    <div className={cn('flex flex-col h-full bg-white', classNames?.container)}>
      {/* Toolbar Area */}
      <div className={cn('border-b border-gray-200', classNames?.toolbar)}>
        {renderToolbar ? (
          renderToolbar(toolbarProps)
        ) : (
          // Default toolbar with ViewModeToggle
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {items.length} item{items.length !== 1 ? 's' : ''}
              {hasFilters && ' (filtered)'}
            </div>
            {effectiveConfig.allowViewToggle && (
              <ViewModeToggle
                viewMode={state.viewMode}
                onViewModeChange={setViewMode}
                disabled={items.length === 0}
              />
            )}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {renderContent}
      </div>

      {/* Bulk Actions Bar (Phase 3) */}
      {effectiveConfig.enableBulkActions && hasSelection && (
        <div className={cn(
          'fixed bottom-4 left-1/2 -translate-x-1/2',
          'bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg',
          'flex items-center gap-4'
        )}>
          <span>{selectedCount} selected</span>
          <button
            onClick={clearSelection}
            className="text-sm underline hover:no-underline"
          >
            Clear
          </button>
          {/* More bulk actions added in Phase 3 */}
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
    </div>
  );
}

export default ItemManager;
